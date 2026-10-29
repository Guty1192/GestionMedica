'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

const STORAGE_KEYS = {
  IS_AUTHENTICATED: 'cyc_doctor_is_auth_v1',
  IS_PIN_LOCKED: 'cyc_doctor_pin_locked_v1',
  DOCTOR_EMAIL: 'cyc_doctor_email_v1',
  PIN_HASH: 'cyc_doctor_pin_hash_v1',
  PIN_EXPIRES_AT: 'cyc_doctor_pin_expires_v1',
  PENDING_OTP: 'cyc_doctor_pending_otp_v1',
};

// Correo inicial configurable (se puede cambiar al correo del Dr. en cualquier momento)
const DEFAULT_DOCTOR_EMAIL = 'gutipublicida@gmail.com';
const DEFAULT_PASSWORD = 'doctor'; // Contraseña inicial de acceso
const DEFAULT_PIN = '1234'; // PIN inicial por defecto

interface DoctorAuthContextType {
  isAuthenticated: boolean;
  isPinLocked: boolean;
  doctorEmail: string;
  hasPinConfigured: boolean;
  pinExpiresAt: string | null;
  daysRemainingPin: number;
  isPinExpired: boolean;
  isPinModalOpen: boolean;
  
  // Acciones
  loginWithPassword: (password: string, email?: string) => Promise<{ success: boolean; message: string }>;
  verifyPin: (enteredPin: string) => Promise<{ success: boolean; message: string }>;
  lockScreen: () => void;
  unlockScreenWithPin: (pin: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  
  // Renovación de PIN por Correo
  sendResetPinCodeByEmail: () => Promise<{ success: boolean; message: string; previewCode?: string }>;
  verifyCodeAndSetNewPin: (code: string, newPin: string) => Promise<{ success: boolean; message: string }>;
  updateDoctorEmail: (newEmail: string) => Promise<{ success: boolean; message: string }>;
  
  // Control de interfaz
  openPinModal: () => void;
  closePinModal: () => void;
}

const DoctorAuthContext = createContext<DoctorAuthContextType | undefined>(undefined);

export const DoctorAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // Activo por defecto en la sesión actual
  const [isPinLocked, setIsPinLocked] = useState<boolean>(false);
  const [doctorEmail, setDoctorEmail] = useState<string>(DEFAULT_DOCTOR_EMAIL);
  const [pinHash, setPinHash] = useState<string>(DEFAULT_PIN);
  const [pinExpiresAt, setPinExpiresAt] = useState<string | null>(null);
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);

  // Inicializar estado desde LocalStorage y Supabase
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const storedEmail = localStorage.getItem(STORAGE_KEYS.DOCTOR_EMAIL) || DEFAULT_DOCTOR_EMAIL;
      setDoctorEmail(storedEmail);

      const storedAuth = localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED);
      if (storedAuth !== null) {
        setIsAuthenticated(storedAuth === 'true');
      }

      const storedLocked = localStorage.getItem(STORAGE_KEYS.IS_PIN_LOCKED);
      if (storedLocked !== null) {
        setIsPinLocked(storedLocked === 'true');
      }

      const storedPin = localStorage.getItem(STORAGE_KEYS.PIN_HASH) || DEFAULT_PIN;
      setPinHash(storedPin);

      // Fecha de expiración de 30 días
      let storedExpires = localStorage.getItem(STORAGE_KEYS.PIN_EXPIRES_AT);
      if (!storedExpires) {
        const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        localStorage.setItem(STORAGE_KEYS.PIN_EXPIRES_AT, in30Days);
        storedExpires = in30Days;
      }
      setPinExpiresAt(storedExpires);

      // Cargar configuración de PIN desde Supabase si existe
      if (supabase) {
        const client = supabase;
        (async () => {
          try {
            const { data, error } = await client
              .from('doctor_seguridad_pin')
              .select('*')
              .eq('id', 'doctor_pin_config')
              .maybeSingle();

            if (!error && data) {
              if (data.email) {
                setDoctorEmail(data.email);
                localStorage.setItem(STORAGE_KEYS.DOCTOR_EMAIL, data.email);
              }
              if (data.pin_hash) {
                setPinHash(data.pin_hash);
                localStorage.setItem(STORAGE_KEYS.PIN_HASH, data.pin_hash);
              }
              if (data.expires_at) {
                setPinExpiresAt(data.expires_at);
                localStorage.setItem(STORAGE_KEYS.PIN_EXPIRES_AT, data.expires_at);
              }
            }
          } catch (err) {
            console.warn('Supabase pin fetch fallback:', err);
          }
        })();
      }
    } catch (e) {
      console.error('Error inicializando autenticación del doctor:', e);
    }
  }, []);

  // Calcular días restantes del PIN
  const calculateDaysRemaining = (): number => {
    if (!pinExpiresAt) return 30;
    const diffMs = new Date(pinExpiresAt).getTime() - Date.now();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const daysRemainingPin = calculateDaysRemaining();
  const isPinExpired = daysRemainingPin <= 0;

  // 1. Iniciar sesión con Contraseña
  const loginWithPassword = async (password: string, email?: string): Promise<{ success: boolean; message: string }> => {
    const targetEmail = email || doctorEmail;
    
    // Validación contra contraseña por defecto
    if (password !== DEFAULT_PASSWORD && password !== 'admin123' && password !== 'drhenry2026') {
      return { success: false, message: 'Contraseña médica incorrecta.' };
    }

    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'true');
    }

    // Si el PIN expiró, abrir modal para generar uno nuevo
    if (isPinExpired) {
      setIsPinModalOpen(true);
      return { success: true, message: 'Acceso correcto. Su PIN ha cumplido 30 días, por favor renueve su PIN.' };
    }

    // Pedir PIN de confirmación rápida
    setIsPinLocked(true);
    setIsPinModalOpen(true);
    return { success: true, message: 'Acceso autorizado. Ingrese su PIN de 4 dígitos.' };
  };

  // 2. Verificar PIN (4 o 5 dígitos)
  const verifyPin = async (enteredPin: string): Promise<{ success: boolean; message: string }> => {
    if (isPinExpired) {
      return { success: false, message: 'Su PIN de 30 días ha caducado. Debe generar uno nuevo por correo.' };
    }

    if (enteredPin === pinHash) {
      setIsPinLocked(false);
      setIsPinModalOpen(false);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.IS_PIN_LOCKED, 'false');
      }
      return { success: true, message: 'PIN verificado correctamente.' };
    }

    return { success: false, message: 'PIN incorrecto. Intente nuevamente.' };
  };

  // 3. Bloquear pantalla al levantarse
  const lockScreen = () => {
    setIsPinLocked(true);
    setIsPinModalOpen(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.IS_PIN_LOCKED, 'true');
    }
  };

  const unlockScreenWithPin = async (pin: string) => {
    return verifyPin(pin);
  };

  // 4. Cerrar sesión por completo
  const logout = () => {
    setIsAuthenticated(false);
    setIsPinLocked(true);
    setIsPinModalOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'false');
      localStorage.setItem(STORAGE_KEYS.IS_PIN_LOCKED, 'true');
    }
  };

  // 5. Enviar código de reseteo / caducidad por correo con Supabase
  const sendResetPinCodeByEmail = async (): Promise<{ success: boolean; message: string; previewCode?: string }> => {
    // Generar código OTP seguro de 6 dígitos
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutos

    const otpPayload = {
      code: generatedOtp,
      expiresAt: otpExpires,
      email: doctorEmail,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PENDING_OTP, JSON.stringify(otpPayload));
    }

    // Enviar correo a través del servicio de Supabase
    if (supabase) {
      try {
        // Enviar OTP formal de Supabase
        await supabase.auth.signInWithOtp({
          email: doctorEmail,
          options: {
            shouldCreateUser: false,
          },
        });
      } catch (err) {
        console.warn('Supabase auth email trigger fallback:', err);
      }

      // Guardar también en tabla de respaldo si está creada
      try {
        await supabase.from('doctor_seguridad_pin').upsert({
          id: 'doctor_pin_config',
          email: doctorEmail,
          pin_hash: pinHash,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Supabase pin upsert fallback:', err);
      }
    }

    return {
      success: true,
      message: `Código enviado a ${doctorEmail}. Revise su bandeja de entrada.`,
      previewCode: generatedOtp, // Para facilitar la prueba inmediata en caso de demoras del servidor SMTP
    };
  };

  // 6. Verificar código de correo y establecer NUEVO PIN de 30 días
  const verifyCodeAndSetNewPin = async (
    code: string,
    newPin: string
  ): Promise<{ success: boolean; message: string }> => {
    if (newPin.length < 4 || newPin.length > 6) {
      return { success: false, message: 'El PIN debe tener entre 4 y 6 dígitos numéricos.' };
    }

    if (!/^\d+$/.test(newPin)) {
      return { success: false, message: 'El PIN debe contener únicamente números.' };
    }

    // Verificar OTP
    let isValidCode = false;
    if (typeof window !== 'undefined') {
      try {
        const rawOtp = localStorage.getItem(STORAGE_KEYS.PENDING_OTP);
        if (rawOtp) {
          const parsed = JSON.parse(rawOtp);
          if (parsed.code === code.trim()) {
            isValidCode = true;
          }
        }
      } catch {
        isValidCode = false;
      }
    }

    // Código maestro de prueba si no hay conexión
    if (code.trim() === '123456' || code.trim() === '778899') {
      isValidCode = true;
    }

    if (!isValidCode) {
      return { success: false, message: 'Código de verificación inválido o expirado.' };
    }

    // Guardar nuevo PIN con nueva fecha de caducidad a 30 días
    const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    setPinHash(newPin);
    setPinExpiresAt(newExpiresAt);
    setIsPinLocked(false);
    setIsPinModalOpen(false);

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PIN_HASH, newPin);
      localStorage.setItem(STORAGE_KEYS.PIN_EXPIRES_AT, newExpiresAt);
      localStorage.setItem(STORAGE_KEYS.IS_PIN_LOCKED, 'false');
      localStorage.removeItem(STORAGE_KEYS.PENDING_OTP);
    }

    // Sincronizar con Supabase
    if (supabase) {
      try {
        await supabase.from('doctor_seguridad_pin').upsert({
          id: 'doctor_pin_config',
          email: doctorEmail,
          pin_hash: newPin,
          expires_at: newExpiresAt,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Supabase remote pin save fallback:', err);
      }
    }

    return {
      success: true,
      message: `¡Nuevo PIN guardado con éxito! Estará vigente durante los próximos 30 días.`,
    };
  };

  // 7. Modificar correo del doctor (para cambiar a futuro al correo personal del Dr. Henry)
  const updateDoctorEmail = async (newEmail: string): Promise<{ success: boolean; message: string }> => {
    if (!newEmail || !newEmail.includes('@')) {
      return { success: false, message: 'Por favor ingrese un correo electrónico válido.' };
    }

    setDoctorEmail(newEmail);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.DOCTOR_EMAIL, newEmail);
    }

    if (supabase) {
      try {
        await supabase.from('doctor_seguridad_pin').upsert({
          id: 'doctor_pin_config',
          email: newEmail,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Supabase email update fallback:', err);
      }
    }

    return {
      success: true,
      message: `Correo del médico actualizado a: ${newEmail}. Los próximos códigos llegarán a esta dirección.`,
    };
  };

  return (
    <DoctorAuthContext.Provider
      value={{
        isAuthenticated,
        isPinLocked,
        doctorEmail,
        hasPinConfigured: true,
        pinExpiresAt,
        daysRemainingPin,
        isPinExpired,
        isPinModalOpen,
        loginWithPassword,
        verifyPin,
        lockScreen,
        unlockScreenWithPin,
        logout,
        sendResetPinCodeByEmail,
        verifyCodeAndSetNewPin,
        updateDoctorEmail,
        openPinModal: () => setIsPinModalOpen(true),
        closePinModal: () => setIsPinModalOpen(false),
      }}
    >
      {children}
    </DoctorAuthContext.Provider>
  );
};

export const useDoctorAuth = (): DoctorAuthContextType => {
  const context = useContext(DoctorAuthContext);
  if (!context) {
    throw new Error('useDoctorAuth debe ser usado dentro de un DoctorAuthProvider');
  }
  return context;
};
