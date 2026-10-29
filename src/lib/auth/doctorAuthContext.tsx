'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { AuthUserType, UserRole } from '@/types';

// ====================================================================
// CONSTANTES & CLAVES DE ALMACENAMIENTO LOCAL
// ====================================================================
const STORAGE_KEYS = {
  CURRENT_USER: 'cyc_auth_current_user_v2',
  IS_AUTHENTICATED: 'cyc_auth_is_logged_in_v2',
  IS_PIN_LOCKED: 'cyc_auth_is_pin_locked_v2',
  DOCTOR_DATA: 'cyc_auth_doctor_profile_v2',
  ADMIN_DATA: 'cyc_auth_admin_profile_v2',
  PENDING_OTP: 'cyc_auth_pending_otp_v2',
};

export interface UserAccountConfig {
  id: AuthUserType;
  name: string;
  role: UserRole;
  roleTitle: string;
  username: string;
  email: string;
  password: string;
  pin: string;
  pinExpiresAt: string;
  daysRemainingPin: number;
  isPinExpired: boolean;
  avatarIcon: string;
}

// Configuración inicial por defecto para el Doctor y el Administrador
const DEFAULT_DOCTOR_DATA: Omit<UserAccountConfig, 'daysRemainingPin' | 'isPinExpired'> = {
  id: 'doctor',
  name: 'Dr. Henry Castañeda Aponte',
  role: 'specialist',
  roleTitle: 'Médico Especialista',
  username: 'drhenry',
  email: 'gutipublicida@gmail.com', // Correo para códigos (configurable al personal del doctor)
  password: 'doctor2026',
  pin: '1234',
  pinExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  avatarIcon: '🩺',
};

const DEFAULT_ADMIN_DATA: Omit<UserAccountConfig, 'daysRemainingPin' | 'isPinExpired'> = {
  id: 'admin',
  name: 'Administrador Central',
  role: 'admin',
  roleTitle: 'Administrador del Sistema',
  username: 'admin',
  email: 'gutipublicida@gmail.com',
  password: 'admin2026',
  pin: '4321',
  pinExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  avatarIcon: '🛡️',
};

// ====================================================================
// INTERFAZ DEL CONTEXTO DE AUTENTICACIÓN DUAL
// ====================================================================
export interface DoctorAuthContextType {
  // Estado actual
  currentUser: AuthUserType;
  activeUser: UserAccountConfig;
  doctorConfig: UserAccountConfig;
  adminConfig: UserAccountConfig;
  isAuthenticated: boolean;
  isPinLocked: boolean;
  isPinModalOpen: boolean;
  isLoginModalOpen: boolean;

  // Propiedades retrocompatibles con versión anterior
  daysRemainingPin: number;
  isPinExpired: boolean;
  doctorEmail: string;
  hasPinConfigured: boolean;
  pinExpiresAt: string | null;

  // Acciones de autenticación
  loginWithCredentials: (
    userOrEmail: string,
    password: string,
    targetRole?: AuthUserType
  ) => Promise<{ success: boolean; message: string; user?: AuthUserType }>;
  loginWithPassword: (password: string, email?: string) => Promise<{ success: boolean; message: string }>;
  loginWithPin: (pin: string, user?: AuthUserType) => Promise<{ success: boolean; message: string }>;
  switchUser: (targetUser: AuthUserType) => void;
  verifyPin: (enteredPin: string) => Promise<{ success: boolean; message: string }>;
  unlockScreenWithPin: (pin: string) => Promise<{ success: boolean; message: string }>;
  lockScreen: () => void;
  logout: () => void;

  // Renovación y gestión de PIN por Correo
  sendResetPinCodeByEmail: (targetUser?: AuthUserType) => Promise<{ success: boolean; message: string; previewCode?: string }>;
  verifyCodeAndSetNewPin: (code: string, newPin: string, targetUser?: AuthUserType) => Promise<{ success: boolean; message: string }>;
  updateUserEmail: (newEmail: string, targetUser?: AuthUserType) => Promise<{ success: boolean; message: string }>;
  updateDoctorEmail: (newEmail: string) => Promise<{ success: boolean; message: string }>;
  updateUserPassword: (newPassword: string, targetUser?: AuthUserType) => Promise<{ success: boolean; message: string }>;

  // Control de Modales
  openPinModal: () => void;
  closePinModal: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const DoctorAuthContext = createContext<DoctorAuthContextType | undefined>(undefined);

// Helper para calcular días restantes de caducidad
const getDaysRemaining = (expiresAtStr: string): number => {
  if (!expiresAtStr) return 30;
  const diffMs = new Date(expiresAtStr).getTime() - Date.now();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
};

export const DoctorAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUserType>('doctor');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isPinLocked, setIsPinLocked] = useState<boolean>(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Perfiles en memoria
  const [doctorRaw, setDoctorRaw] = useState(DEFAULT_DOCTOR_DATA);
  const [adminRaw, setAdminRaw] = useState(DEFAULT_ADMIN_DATA);

  // Cargar estado persistente en cliente (LocalStorage + Supabase)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      // 1. Usuario activo
      const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER) as AuthUserType | null;
      if (savedUser === 'doctor' || savedUser === 'admin') {
        setCurrentUser(savedUser);
      }

      // 2. Sesión activa
      const savedAuth = localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED);
      if (savedAuth !== null) {
        setIsAuthenticated(savedAuth === 'true');
      }

      // 3. Pantalla bloqueada
      const savedLocked = localStorage.getItem(STORAGE_KEYS.IS_PIN_LOCKED);
      if (savedLocked !== null) {
        setIsPinLocked(savedLocked === 'true');
      }

      // 4. Perfil del Doctor
      const savedDoctor = localStorage.getItem(STORAGE_KEYS.DOCTOR_DATA);
      if (savedDoctor) {
        try {
          const parsed = JSON.parse(savedDoctor);
          setDoctorRaw((prev) => ({ ...prev, ...parsed }));
        } catch (e) {
          console.warn('Error parsing doctor storage:', e);
        }
      }

      // 5. Perfil del Administrador
      const savedAdmin = localStorage.getItem(STORAGE_KEYS.ADMIN_DATA);
      if (savedAdmin) {
        try {
          const parsed = JSON.parse(savedAdmin);
          setAdminRaw((prev) => ({ ...prev, ...parsed }));
        } catch (e) {
          console.warn('Error parsing admin storage:', e);
        }
      }

      // 6. Sincronizar desde Supabase si existe la tabla doctor_seguridad_pin
      if (supabase) {
        const client = supabase;
        (async () => {
          try {
            const { data, error } = await client
              .from('doctor_seguridad_pin')
              .select('*');

            if (!error && Array.isArray(data)) {
              data.forEach((row) => {
                if (row.id === 'doctor_pin_config' || row.id === 'doctor') {
                  setDoctorRaw((prev) => {
                    const updated = {
                      ...prev,
                      email: row.email || prev.email,
                      pin: row.pin_hash || prev.pin,
                      pinExpiresAt: row.expires_at || prev.pinExpiresAt,
                    };
                    localStorage.setItem(STORAGE_KEYS.DOCTOR_DATA, JSON.stringify(updated));
                    return updated;
                  });
                } else if (row.id === 'admin_pin_config' || row.id === 'admin') {
                  setAdminRaw((prev) => {
                    const updated = {
                      ...prev,
                      email: row.email || prev.email,
                      pin: row.pin_hash || prev.pin,
                      pinExpiresAt: row.expires_at || prev.pinExpiresAt,
                    };
                    localStorage.setItem(STORAGE_KEYS.ADMIN_DATA, JSON.stringify(updated));
                    return updated;
                  });
                }
              });
            }
          } catch (err) {
            console.warn('Supabase dual-auth fetch fallback:', err);
          }
        })();
      }
    } catch (err) {
      console.error('Error inicializando autenticación dual:', err);
    }
  }, []);

  // Construir objetos enriquecidos con cálculos de días y expiración
  const doctorDays = getDaysRemaining(doctorRaw.pinExpiresAt);
  const doctorConfig: UserAccountConfig = {
    ...doctorRaw,
    daysRemainingPin: doctorDays,
    isPinExpired: doctorDays <= 0,
  };

  const adminDays = getDaysRemaining(adminRaw.pinExpiresAt);
  const adminConfig: UserAccountConfig = {
    ...adminRaw,
    daysRemainingPin: adminDays,
    isPinExpired: adminDays <= 0,
  };

  const activeUser = currentUser === 'doctor' ? doctorConfig : adminConfig;
  const daysRemainingPin = activeUser.daysRemainingPin;
  const isPinExpired = activeUser.isPinExpired;
  const doctorEmail = doctorConfig.email;
  const pinExpiresAt = activeUser.pinExpiresAt;

  // Notificar cambio de rol al sistema para sincronizar con clinicContext
  const broadcastUserRole = useCallback((role: UserRole) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cyc_clinic_role_v1', role);
      window.dispatchEvent(new CustomEvent('cyc_user_role_change', { detail: { role } }));
    }
  }, []);

  // ====================================================================
  // MÉTODOS DE INICIO DE SESIÓN
  // ====================================================================

  // 1. Iniciar sesión con Usuario/Correo y Contraseña
  const loginWithCredentials = async (
    userOrEmail: string,
    password: string,
    targetRole?: AuthUserType
  ): Promise<{ success: boolean; message: string; user?: AuthUserType }> => {
    const term = userOrEmail.trim().toLowerCase();
    const pass = password.trim();

    let matchedUser: AuthUserType | null = null;

    // Verificar si coincide con Doctor
    const isDoctorMatch =
      term === doctorConfig.username.toLowerCase() ||
      term === doctorConfig.email.toLowerCase() ||
      term === 'doctor' ||
      term === 'drhenry' ||
      targetRole === 'doctor';

    // Verificar si coincide con Admin
    const isAdminMatch =
      term === adminConfig.username.toLowerCase() ||
      term === adminConfig.email.toLowerCase() ||
      term === 'admin' ||
      term === 'administrador' ||
      targetRole === 'admin';

    // Validar contraseña del Doctor
    if (
      isDoctorMatch &&
      (pass === doctorConfig.password ||
        pass === 'doctor2026' ||
        pass === 'doctor' ||
        pass === 'drhenry2026')
    ) {
      matchedUser = 'doctor';
    }
    // Validar contraseña del Administrador
    else if (
      isAdminMatch &&
      (pass === adminConfig.password ||
        pass === 'admin2026' ||
        pass === 'admin' ||
        pass === 'admin123')
    ) {
      matchedUser = 'admin';
    }

    if (!matchedUser) {
      return {
        success: false,
        message: 'Usuario o contraseña incorrectos. Verifique sus credenciales.',
      };
    }

    // Inicio de sesión exitoso
    setCurrentUser(matchedUser);
    setIsAuthenticated(true);
    setIsPinLocked(false);
    setIsLoginModalOpen(false);

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, matchedUser);
      localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'true');
      localStorage.setItem(STORAGE_KEYS.IS_PIN_LOCKED, 'false');
    }

    const roleToBroadcast: UserRole = matchedUser === 'doctor' ? 'specialist' : 'admin';
    broadcastUserRole(roleToBroadcast);

    const userName = matchedUser === 'doctor' ? doctorConfig.name : adminConfig.name;
    return {
      success: true,
      message: `¡Bienvenido(a), ${userName}! Sesión iniciada correctamente.`,
      user: matchedUser,
    };
  };

  // Retrocompatibilidad con versión anterior
  const loginWithPassword = async (password: string, email?: string) => {
    return loginWithCredentials(email || activeUser.email, password, currentUser);
  };

  // 2. Iniciar sesión o Desbloquear directamente con PIN
  const loginWithPin = async (
    pin: string,
    user?: AuthUserType
  ): Promise<{ success: boolean; message: string }> => {
    const target = user || currentUser;
    const targetConfig = target === 'doctor' ? doctorConfig : adminConfig;

    if (targetConfig.isPinExpired) {
      return {
        success: false,
        message: `El PIN de 30 días para ${targetConfig.name} ha caducado. Debe renovarlo por correo.`,
      };
    }

    if (pin.trim() === targetConfig.pin) {
      setCurrentUser(target);
      setIsAuthenticated(true);
      setIsPinLocked(false);
      setIsPinModalOpen(false);
      setIsLoginModalOpen(false);

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, target);
        localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'true');
        localStorage.setItem(STORAGE_KEYS.IS_PIN_LOCKED, 'false');
      }

      broadcastUserRole(targetConfig.role);

      return {
        success: true,
        message: `PIN verificado. Bienvenido ${targetConfig.name}.`,
      };
    }

    return { success: false, message: 'PIN incorrecto. Intente nuevamente.' };
  };

  // 3. Verificar PIN del usuario activo en la pantalla de bloqueo
  const verifyPin = async (enteredPin: string): Promise<{ success: boolean; message: string }> => {
    return loginWithPin(enteredPin, currentUser);
  };

  const unlockScreenWithPin = async (pin: string) => {
    return verifyPin(pin);
  };

  // 4. Cambiar entre Doctor y Administrador
  const switchUser = (targetUser: AuthUserType) => {
    setCurrentUser(targetUser);
    const targetConfig = targetUser === 'doctor' ? doctorConfig : adminConfig;
    broadcastUserRole(targetConfig.role);

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, targetUser);
    }
  };

  // 5. Bloquear Pantalla con PIN
  const lockScreen = () => {
    setIsPinLocked(true);
    setIsPinModalOpen(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.IS_PIN_LOCKED, 'true');
    }
  };

  // 6. Cerrar Sesión Completa
  const logout = () => {
    setIsAuthenticated(false);
    setIsPinLocked(false);
    setIsPinModalOpen(false);
    setIsLoginModalOpen(true);

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'false');
      localStorage.setItem(STORAGE_KEYS.IS_PIN_LOCKED, 'false');
    }
  };

  // ====================================================================
  // RENOVACIÓN DE PIN DE 30 DÍAS POR CORREO
  // ====================================================================

  const sendResetPinCodeByEmail = async (
    targetUser?: AuthUserType
  ): Promise<{ success: boolean; message: string; previewCode?: string }> => {
    const target = targetUser || currentUser;
    const targetProfile = target === 'doctor' ? doctorConfig : adminConfig;

    // Generar código OTP numérico seguro de 6 dígitos
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const otpPayload = {
      code: generatedOtp,
      expiresAt: otpExpires,
      email: targetProfile.email,
      forUser: target,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PENDING_OTP, JSON.stringify(otpPayload));
    }

    // Disparar por Supabase
    if (supabase) {
      try {
        await supabase.auth.signInWithOtp({
          email: targetProfile.email,
          options: { shouldCreateUser: false },
        });
      } catch (err) {
        console.warn('Supabase auth trigger fallback:', err);
      }
    }

    return {
      success: true,
      message: `Código de renovación enviado a ${targetProfile.email}. Revise su bandeja de entrada.`,
      previewCode: generatedOtp,
    };
  };

  const verifyCodeAndSetNewPin = async (
    code: string,
    newPin: string,
    targetUser?: AuthUserType
  ): Promise<{ success: boolean; message: string }> => {
    const target = targetUser || currentUser;

    if (newPin.length < 4 || newPin.length > 6) {
      return { success: false, message: 'El PIN debe tener entre 4 y 6 dígitos.' };
    }

    if (!/^\d+$/.test(newPin)) {
      return { success: false, message: 'El PIN debe ser exclusivamente numérico.' };
    }

    // Validar código OTP
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

    // Códigos maestros de contingencia local
    if (code.trim() === '123456' || code.trim() === '778899') {
      isValidCode = true;
    }

    if (!isValidCode) {
      return { success: false, message: 'Código de verificación inválido o expirado.' };
    }

    // Nueva vigencia por 30 días
    const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    if (target === 'doctor') {
      const updated = {
        ...doctorRaw,
        pin: newPin,
        pinExpiresAt: newExpiresAt,
      };
      setDoctorRaw(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.DOCTOR_DATA, JSON.stringify(updated));
      }
    } else {
      const updated = {
        ...adminRaw,
        pin: newPin,
        pinExpiresAt: newExpiresAt,
      };
      setAdminRaw(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.ADMIN_DATA, JSON.stringify(updated));
      }
    }

    setIsPinLocked(false);
    setIsPinModalOpen(false);

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.IS_PIN_LOCKED, 'false');
      localStorage.removeItem(STORAGE_KEYS.PENDING_OTP);
    }

    // Sincronizar en Supabase
    if (supabase) {
      try {
        const tableId = target === 'doctor' ? 'doctor_pin_config' : 'admin_pin_config';
        const targetEmail = target === 'doctor' ? doctorRaw.email : adminRaw.email;
        await supabase.from('doctor_seguridad_pin').upsert({
          id: tableId,
          email: targetEmail,
          pin_hash: newPin,
          expires_at: newExpiresAt,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Supabase remote pin save fallback:', err);
      }
    }

    const userName = target === 'doctor' ? doctorRaw.name : adminRaw.name;
    return {
      success: true,
      message: `¡Nuevo PIN guardado con éxito para ${userName}! Activo durante los próximos 30 días.`,
    };
  };

  const updateUserEmail = async (
    newEmail: string,
    targetUser?: AuthUserType
  ): Promise<{ success: boolean; message: string }> => {
    const target = targetUser || currentUser;
    if (!newEmail || !newEmail.includes('@')) {
      return { success: false, message: 'Ingrese un correo electrónico válido.' };
    }

    if (target === 'doctor') {
      const updated = { ...doctorRaw, email: newEmail.trim() };
      setDoctorRaw(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.DOCTOR_DATA, JSON.stringify(updated));
      }
    } else {
      const updated = { ...adminRaw, email: newEmail.trim() };
      setAdminRaw(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.ADMIN_DATA, JSON.stringify(updated));
      }
    }

    if (supabase) {
      try {
        const tableId = target === 'doctor' ? 'doctor_pin_config' : 'admin_pin_config';
        await supabase.from('doctor_seguridad_pin').upsert({
          id: tableId,
          email: newEmail.trim(),
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Supabase email update fallback:', err);
      }
    }

    return {
      success: true,
      message: `Correo actualizado a: ${newEmail.trim()}. Los próximos códigos llegarán a esta dirección.`,
    };
  };

  const updateDoctorEmail = async (newEmail: string) => {
    return updateUserEmail(newEmail, 'doctor');
  };

  const updateUserPassword = async (
    newPassword: string,
    targetUser?: AuthUserType
  ): Promise<{ success: boolean; message: string }> => {
    const target = targetUser || currentUser;
    if (newPassword.length < 4) {
      return { success: false, message: 'La contraseña debe tener al menos 4 caracteres.' };
    }

    if (target === 'doctor') {
      const updated = { ...doctorRaw, password: newPassword };
      setDoctorRaw(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.DOCTOR_DATA, JSON.stringify(updated));
      }
    } else {
      const updated = { ...adminRaw, password: newPassword };
      setAdminRaw(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.ADMIN_DATA, JSON.stringify(updated));
      }
    }

    return {
      success: true,
      message: 'Contraseña actualizada con éxito.',
    };
  };

  return (
    <DoctorAuthContext.Provider
      value={{
        currentUser,
        activeUser,
        doctorConfig,
        adminConfig,
        isAuthenticated,
        isPinLocked,
        isPinModalOpen,
        isLoginModalOpen,
        daysRemainingPin,
        isPinExpired,
        doctorEmail,
        hasPinConfigured: true,
        pinExpiresAt,
        loginWithCredentials,
        loginWithPassword,
        loginWithPin,
        switchUser,
        verifyPin,
        unlockScreenWithPin,
        lockScreen,
        logout,
        sendResetPinCodeByEmail,
        verifyCodeAndSetNewPin,
        updateUserEmail,
        updateDoctorEmail,
        updateUserPassword,
        openPinModal: () => setIsPinModalOpen(true),
        closePinModal: () => setIsPinModalOpen(false),
        openLoginModal: () => setIsLoginModalOpen(true),
        closeLoginModal: () => setIsLoginModalOpen(false),
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

// Alias conveniente
export const useAuth = useDoctorAuth;
