'use client';

import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '@/lib/auth/doctorAuthContext';
import { AuthUserType } from '@/types';
import {
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  Stethoscope,
  Shield,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const ModalLogin: React.FC = () => {
  const {
    isAuthenticated,
    isLoginModalOpen,
    closeLoginModal,
    doctorConfig,
    adminConfig,
    loginWithCredentials,
    loginWithPin,
    currentUser,
  } = useDoctorAuth();

  const [selectedUser, setSelectedUser] = useState<AuthUserType>('doctor');
  const [loginMethod, setLoginMethod] = useState<'password' | 'pin'>('password');
  
  // Inputs
  const [usernameInput, setUsernameInput] = useState<string>('drhenry');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [pinInput, setPinInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isShake, setIsShake] = useState<boolean>(false);

  // Sincronizar campo de usuario cuando se cambia la tarjeta de perfil
  useEffect(() => {
    if (selectedUser === 'doctor') {
      setUsernameInput(doctorConfig.username);
    } else {
      setUsernameInput(adminConfig.username);
    }
    setPasswordInput('');
    setPinInput('');
    setErrorMessage('');
    setSuccessMessage('');
  }, [selectedUser, doctorConfig.username, adminConfig.username]);

  // Si ya está autenticado y el modal de login no se forzó, no mostrar
  if (isAuthenticated && !isLoginModalOpen) {
    return null;
  }

  const triggerError = (msg: string) => {
    setErrorMessage(msg);
    setIsShake(true);
    setTimeout(() => setIsShake(false), 500);
  };

  const handleLoginWithPassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!usernameInput.trim()) {
      triggerError('Por favor ingrese su usuario o correo.');
      return;
    }

    if (!passwordInput.trim()) {
      triggerError('Por favor ingrese su contraseña.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginWithCredentials(usernameInput, passwordInput, selectedUser);
      if (res.success) {
        setSuccessMessage(res.message);
        setTimeout(() => {
          setIsLoading(false);
        }, 600);
      } else {
        setIsLoading(false);
        triggerError(res.message);
      }
    } catch {
      setIsLoading(false);
      triggerError('Error durante el inicio de sesión.');
    }
  };

  const handleLoginWithPin = async (enteredPin: string) => {
    setErrorMessage('');
    setSuccessMessage('');

    if (enteredPin.length < 4) return;

    setIsLoading(true);
    try {
      const res = await loginWithPin(enteredPin, selectedUser);
      if (res.success) {
        setSuccessMessage(res.message);
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      } else {
        setIsLoading(false);
        triggerError(res.message);
        setPinInput('');
      }
    } catch {
      setIsLoading(false);
      triggerError('Error al validar PIN.');
      setPinInput('');
    }
  };

  // Helper para auto-completar credenciales de prueba
  const handleAutofill = (type: AuthUserType) => {
    setSelectedUser(type);
    if (type === 'doctor') {
      setUsernameInput('drhenry');
      setPasswordInput('doctor2026');
      setPinInput('1234');
    } else {
      setUsernameInput('admin');
      setPasswordInput('admin2026');
      setPinInput('4321');
    }
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
      <div
        className={`relative w-full max-w-lg bg-[#0a1628] rounded-3xl border border-[#1e2f4d] shadow-2xl overflow-hidden flex flex-col text-slate-100 ${
          isShake ? 'animate-shake' : ''
        }`}
      >
        {/* Header con Branding C&C Salud */}
        <div className="p-6 border-b border-[#1e2f4d] bg-gradient-to-r from-[#001736] via-[#002f6c] to-[#0a1628] text-center relative">
          <div className="w-14 h-14 rounded-2xl bg-sky-500/20 border border-sky-400/40 text-sky-400 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Lock className="w-7 h-7 text-sky-400" />
          </div>

          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-sky-300">
            SISTEMA MÉDICO • CALLAO, PERÚ
          </span>

          <h1 className="text-xl font-black text-white tracking-tight mt-2">
            Centro Médico C&C Salud
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Portal de Acceso Clínico & Administrativo
          </p>
        </div>

        {/* Selector de Perfil (Doctor vs Admin) */}
        <div className="p-5 space-y-4">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block text-center">
            Seleccione su perfil de acceso
          </label>

          <div className="grid grid-cols-2 gap-3">
            {/* Tarjeta Doctor */}
            <button
              type="button"
              onClick={() => setSelectedUser('doctor')}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                selectedUser === 'doctor'
                  ? 'bg-gradient-to-br from-[#002b5e] to-[#0a1628] border-sky-400 shadow-md shadow-sky-500/20 ring-2 ring-sky-400/40'
                  : 'bg-[#0e1d33] border-[#1e2f4d] hover:border-slate-600 opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xl">🩺</span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  Especialista
                </span>
              </div>
              <p className="text-xs font-black text-white">Dr. Henry Castañeda</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                4 Especialidades Médicas
              </p>
            </button>

            {/* Tarjeta Administrador */}
            <button
              type="button"
              onClick={() => setSelectedUser('admin')}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                selectedUser === 'admin'
                  ? 'bg-gradient-to-br from-[#231245] to-[#0a1628] border-purple-400 shadow-md shadow-purple-500/20 ring-2 ring-purple-400/40'
                  : 'bg-[#0e1d33] border-[#1e2f4d] hover:border-slate-600 opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xl">🛡️</span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  Administrador
                </span>
              </div>
              <p className="text-xs font-black text-white">Administrador Central</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Control Total & Seguridad
              </p>
            </button>
          </div>

          {/* Selector de Método: Contraseña vs PIN */}
          <div className="flex items-center justify-center p-1 rounded-xl bg-[#0e1d33] border border-[#1e2f4d] max-w-xs mx-auto">
            <button
              type="button"
              onClick={() => setLoginMethod('password')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all text-center cursor-pointer ${
                loginMethod === 'password'
                  ? 'bg-[#004299] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Usuario & Clave
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod('pin')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all text-center cursor-pointer ${
                loginMethod === 'pin'
                  ? 'bg-[#004299] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Acceso Rápido PIN
            </button>
          </div>

          {/* FORMULARIO DE ACCESO CON USUARIO Y CONTRASEÑA */}
          {loginMethod === 'password' && (
            <form onSubmit={handleLoginWithPassword} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Usuario o Correo Electrónico:
                </label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder={selectedUser === 'doctor' ? 'drhenry' : 'admin'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1d33] border border-[#1e2f4d] text-white text-xs font-semibold focus:outline-none focus:border-sky-400 transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-300">
                    Contraseña de Acceso:
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[10px] text-sky-400 hover:text-sky-300 inline-flex items-center gap-1 font-semibold"
                  >
                    {showPassword ? (
                      <>
                        <EyeOff className="w-3 h-3" /> Ocultar
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3" /> Mostrar
                      </>
                    )}
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1d33] border border-[#1e2f4d] text-white text-xs font-semibold focus:outline-none focus:border-sky-400 transition-colors"
                />
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs font-medium text-center animate-fade-in">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs font-medium text-center animate-fade-in">
                  {successMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-[#004299] hover:bg-[#00337a] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? 'Verificando credenciales...' : 'Iniciar Sesión'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* FORMULARIO DE ACCESO RÁPIDO CON PIN */}
          {loginMethod === 'pin' && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-xs text-slate-300 font-semibold">
                  Ingrese el PIN de {selectedUser === 'doctor' ? 'Dr. Henry' : 'Administrador'}
                </p>
              </div>

              {/* Puntos de PIN */}
              <div className="flex items-center justify-center gap-3 py-1">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-full border-2 transition-all ${
                      pinInput.length > idx
                        ? 'bg-sky-400 border-sky-400 scale-110 shadow-md shadow-sky-500/40'
                        : 'border-slate-600 bg-slate-900/50'
                    }`}
                  />
                ))}
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs font-medium text-center">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs font-medium text-center">
                  {successMessage}
                </div>
              )}

              {/* Teclado táctil compacto */}
              <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      if (pinInput.length < 5) {
                        const next = pinInput + d;
                        setPinInput(next);
                        if (next.length === 4) handleLoginWithPin(next);
                      }
                    }}
                    className="h-10 rounded-xl bg-[#0e1d33] hover:bg-[#182c4d] text-white font-extrabold text-base border border-[#1e2f4d] flex items-center justify-center cursor-pointer select-none active:scale-95"
                  >
                    {d}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPinInput('')}
                  className="h-10 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-400 text-[10px] font-bold border border-slate-800 flex items-center justify-center cursor-pointer"
                >
                  Limpiar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (pinInput.length < 5) {
                      const next = pinInput + '0';
                      setPinInput(next);
                      if (next.length === 4) handleLoginWithPin(next);
                    }
                  }}
                  className="h-10 rounded-xl bg-[#0e1d33] hover:bg-[#182c4d] text-white font-extrabold text-base border border-[#1e2f4d] flex items-center justify-center cursor-pointer select-none active:scale-95"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => setPinInput((prev) => prev.slice(0, -1))}
                  className="h-10 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-400 text-xs font-bold border border-slate-800 flex items-center justify-center cursor-pointer"
                >
                  Borrar
                </button>
              </div>
            </div>
          )}

          {/* Ayuda de Credenciales Rápidas para comodidad */}
          <div className="p-3 rounded-2xl bg-[#0e1d33]/60 border border-[#1e2f4d] text-[11px] space-y-1.5">
            <p className="font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Accesos predeterminados del sistema:</span>
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1 text-[10px]">
              <button
                type="button"
                onClick={() => handleAutofill('doctor')}
                className="p-1.5 rounded-xl bg-sky-950/40 hover:bg-sky-900/40 border border-sky-800/60 text-left cursor-pointer transition-all"
              >
                <p className="font-bold text-sky-300">🩺 Dr. Henry Castañeda</p>
                <p className="text-slate-400 mt-0.5">Usuario: <strong className="text-white">drhenry</strong></p>
                <p className="text-slate-400">Clave: <strong className="text-white">doctor2026</strong> | PIN: <strong className="text-white">1234</strong></p>
              </button>

              <button
                type="button"
                onClick={() => handleAutofill('admin')}
                className="p-1.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/40 border border-purple-800/60 text-left cursor-pointer transition-all"
              >
                <p className="font-bold text-purple-300">🛡️ Administrador</p>
                <p className="text-slate-400 mt-0.5">Usuario: <strong className="text-white">admin</strong></p>
                <p className="text-slate-400">Clave: <strong className="text-white">admin2026</strong> | PIN: <strong className="text-white">4321</strong></p>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#08101e] border-t border-[#1e2f4d] text-center text-[11px] text-slate-400">
          <span>Sistema Seguro C&C Salud • Callao, Perú</span>
        </div>
      </div>
    </div>
  );
};
