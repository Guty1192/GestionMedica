'use client';

import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '@/lib/auth/doctorAuthContext';
import {
  Lock,
  Unlock,
  ShieldCheck,
  Mail,
  KeyRound,
  Delete,
  X,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Pencil,
  ArrowRight,
  RefreshCw,
  UserCheck,
  ArrowLeftRight,
  LogOut,
  Key,
} from 'lucide-react';

export const ModalDoctorPin: React.FC = () => {
  const {
    isPinModalOpen,
    closePinModal,
    isPinLocked,
    currentUser,
    activeUser,
    doctorConfig,
    adminConfig,
    verifyPin,
    loginWithCredentials,
    switchUser,
    daysRemainingPin,
    isPinExpired,
    sendResetPinCodeByEmail,
    verifyCodeAndSetNewPin,
    updateUserEmail,
    logout,
  } = useDoctorAuth();

  const [pinInput, setPinInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isShake, setIsShake] = useState<boolean>(false);

  // Modo: 'keypad' | 'reset' | 'change_email' | 'password_unlock'
  const [viewMode, setViewMode] = useState<'keypad' | 'reset' | 'change_email' | 'password_unlock'>('keypad');

  // Estados para contraseña de respaldo
  const [passwordInput, setPasswordInput] = useState<string>('');

  // Estados para renovación por correo
  const [emailCodeInput, setEmailCodeInput] = useState<string>('');
  const [newPinInput, setNewPinInput] = useState<string>('');
  const [confirmNewPinInput, setConfirmNewPinInput] = useState<string>('');
  const [isSendingCode, setIsSendingCode] = useState<boolean>(false);
  const [codeSent, setCodeSent] = useState<boolean>(false);
  const [previewOtp, setPreviewOtp] = useState<string | null>(null);

  // Estados para cambio de correo
  const [newEmailInput, setNewEmailInput] = useState<string>(activeUser.email);

  // Actualizar email cuando cambie el usuario activo
  useEffect(() => {
    setNewEmailInput(activeUser.email);
    setPinInput('');
    setErrorMessage('');
    setSuccessMessage('');
  }, [currentUser, activeUser.email]);

  // Si el PIN expiró por superar los 30 días, abrir en modo reset
  useEffect(() => {
    if (isPinExpired) {
      setViewMode('reset');
      setErrorMessage(`El PIN de 30 días para ${activeUser.name} ha caducado. Por favor genere uno nuevo.`);
    }
  }, [isPinExpired, activeUser.name]);

  // Soporte de teclado físico (números del 0 al 9, backspace, enter)
  useEffect(() => {
    if (!isPinModalOpen || viewMode !== 'keypad') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleDigitClick(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleDeleteDigit();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmitPin();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPinModalOpen, viewMode, pinInput]);

  if (!isPinModalOpen) return null;

  const handleDigitClick = (digit: string) => {
    setErrorMessage('');
    if (pinInput.length < 5) {
      const next = pinInput + digit;
      setPinInput(next);
      if (next.length === 4) {
        verifyPinAuto(next);
      }
    }
  };

  const handleDeleteDigit = () => {
    setErrorMessage('');
    setPinInput((prev) => prev.slice(0, -1));
  };

  const handleClearPin = () => {
    setErrorMessage('');
    setPinInput('');
  };

  const verifyPinAuto = async (pin: string) => {
    const res = await verifyPin(pin);
    if (!res.success) {
      if (pin.length === 4) {
        // Permitir que escriba 5to dígito si su PIN configurado es de 5
        return;
      }
      triggerError(res.message);
    } else {
      setPinInput('');
      setErrorMessage('');
    }
  };

  const handleSubmitPin = async () => {
    if (pinInput.length < 4) {
      triggerError('Ingrese al menos 4 dígitos de PIN.');
      return;
    }
    const res = await verifyPin(pinInput);
    if (!res.success) {
      triggerError(res.message);
    } else {
      setPinInput('');
    }
  };

  const triggerError = (msg: string) => {
    setErrorMessage(msg);
    setIsShake(true);
    setTimeout(() => setIsShake(false), 500);
    setPinInput('');
  };

  // Alternar rápidamente al otro usuario (Doctor <-> Admin)
  const handleToggleUser = () => {
    const target = currentUser === 'doctor' ? 'admin' : 'doctor';
    switchUser(target);
    setPinInput('');
    setErrorMessage('');
    setViewMode('keypad');
  };

  // Desbloqueo alternativo con contraseña maestra
  const handleUnlockWithPassword = async () => {
    setErrorMessage('');
    if (!passwordInput.trim()) {
      setErrorMessage('Por favor ingrese su contraseña.');
      return;
    }
    const res = await loginWithCredentials(activeUser.username, passwordInput, currentUser);
    if (res.success) {
      closePinModal();
      setPasswordInput('');
    } else {
      setErrorMessage(res.message);
      setIsShake(true);
      setTimeout(() => setIsShake(false), 500);
    }
  };

  // Enviar código de reseteo a Supabase / Correo
  const handleSendEmailCode = async () => {
    setIsSendingCode(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await sendResetPinCodeByEmail(currentUser);
      if (res.success) {
        setCodeSent(true);
        setSuccessMessage(res.message);
        if (res.previewCode) {
          setPreviewOtp(res.previewCode);
        }
      } else {
        setErrorMessage(res.message);
      }
    } catch {
      setErrorMessage('Error al enviar código de verificación por correo.');
    } finally {
      setIsSendingCode(false);
    }
  };

  // Confirmar código del correo y guardar nuevo PIN de 30 días
  const handleSaveNewPin = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!emailCodeInput.trim()) {
      setErrorMessage('Por favor ingrese el código de 6 dígitos que llegó a su correo.');
      return;
    }

    if (newPinInput !== confirmNewPinInput) {
      setErrorMessage('Los dos PINs ingresados no coinciden.');
      return;
    }

    const res = await verifyCodeAndSetNewPin(emailCodeInput, newPinInput, currentUser);
    if (res.success) {
      setSuccessMessage(res.message);
      setTimeout(() => {
        setViewMode('keypad');
        setPinInput('');
        setEmailCodeInput('');
        setNewPinInput('');
        setConfirmNewPinInput('');
        setSuccessMessage('');
      }, 1500);
    } else {
      setErrorMessage(res.message);
    }
  };

  // Guardar nuevo correo para este usuario
  const handleSaveNewEmail = async () => {
    if (!newEmailInput || !newEmailInput.includes('@')) {
      setErrorMessage('Ingrese un correo electrónico válido.');
      return;
    }
    const res = await updateUserEmail(newEmailInput.trim(), currentUser);
    if (res.success) {
      setSuccessMessage(res.message);
      setTimeout(() => {
        setViewMode('reset');
        setSuccessMessage('');
      }, 1200);
    } else {
      setErrorMessage(res.message);
    }
  };

  const isDoctor = currentUser === 'doctor';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div
        className={`relative w-full max-w-md bg-[#0a1628] rounded-3xl border border-[#1e2f4d] shadow-2xl overflow-hidden flex flex-col text-slate-100 ${
          isShake ? 'animate-shake' : ''
        }`}
      >
        {/* Header con Branding & Selector de Cuenta */}
        <div
          className={`p-5 border-b border-[#1e2f4d] text-center relative ${
            isDoctor
              ? 'bg-gradient-to-r from-[#001736] via-[#002f6c] to-[#0a1628]'
              : 'bg-gradient-to-r from-[#170e2b] via-[#24174d] to-[#0a1628]'
          }`}
        >
          {!isPinLocked && (
            <button
              onClick={closePinModal}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              title="Cerrar modal"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Badge Icon */}
          <div
            className={`w-14 h-14 rounded-2xl border flex items-center justify-center mx-auto mb-2.5 shadow-inner text-2xl ${
              isDoctor
                ? 'bg-sky-500/15 border-sky-400/30 text-sky-400'
                : 'bg-purple-500/15 border-purple-400/30 text-purple-400'
            }`}
          >
            {activeUser.avatarIcon}
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-white mb-1 uppercase tracking-wider">
            <Lock className="w-3 h-3 text-sky-400" />
            <span>Sesión Bloqueada con PIN</span>
          </div>

          <h2 className="text-base font-black text-white tracking-tight">
            {activeUser.name}
          </h2>
          <p className="text-xs text-sky-300 font-medium">
            {activeUser.roleTitle}
          </p>

          {/* Botón flotante para alternar entre Doctor y Administrador */}
          <button
            type="button"
            onClick={handleToggleUser}
            className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-[11px] font-bold text-slate-300 hover:text-white transition-all cursor-pointer shadow-xs"
            title={`Cambiar a ${isDoctor ? 'Administrador' : 'Dr. Henry Castañeda'}`}
          >
            <ArrowLeftRight className="w-3 h-3 text-sky-400" />
            <span>
              Cambiar a cuenta de <strong>{isDoctor ? 'Administrador' : 'Dr. Henry'}</strong>
            </span>
          </button>
        </div>

        {/* CONTENIDO SEGÚN MODO */}
        <div className="p-6 space-y-4">
          {/* MODO 1: TECLADO RÁPIDO DIARIO CON PIN */}
          {viewMode === 'keypad' && (
            <div className="space-y-5">
              <div className="text-center">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Ingrese el PIN de {activeUser.name.split(' ')[0]}
                </p>
                <div className="mt-1.5 flex items-center justify-center gap-1.5 text-[11px] text-emerald-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    PIN de 30 días: le restan <strong>{daysRemainingPin} días</strong>
                  </span>
                </div>
              </div>

              {/* Puntos de visualización del PIN */}
              <div className="flex items-center justify-center gap-3 py-1.5">
                {[0, 1, 2, 3, 4].map((idx) => {
                  const isFilled = pinInput.length > idx;
                  return (
                    <div
                      key={idx}
                      className={`w-4 h-4 rounded-full border-2 transition-all ${
                        isFilled
                          ? isDoctor
                            ? 'bg-sky-400 border-sky-400 scale-110 shadow-md shadow-sky-500/40'
                            : 'bg-purple-400 border-purple-400 scale-110 shadow-md shadow-purple-500/40'
                          : 'border-slate-600 bg-slate-900/50'
                      }`}
                    />
                  );
                })}
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs font-medium text-center animate-fade-in">
                  {errorMessage}
                </div>
              )}

              {/* Teclado Numérico Táctil */}
              <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleDigitClick(digit)}
                    className="h-12 rounded-2xl bg-[#0e1d33] hover:bg-[#182c4d] active:scale-95 text-white font-extrabold text-lg border border-[#1e2f4d] shadow-sm transition-all flex items-center justify-center cursor-pointer select-none"
                  >
                    {digit}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={handleClearPin}
                  className="h-12 rounded-2xl bg-slate-900/60 hover:bg-slate-800 active:scale-95 text-slate-400 hover:text-slate-200 font-bold text-xs border border-slate-800 transition-all flex items-center justify-center cursor-pointer select-none"
                  title="Limpiar"
                >
                  Limpiar
                </button>

                <button
                  type="button"
                  onClick={() => handleDigitClick('0')}
                  className="h-12 rounded-2xl bg-[#0e1d33] hover:bg-[#182c4d] active:scale-95 text-white font-extrabold text-lg border border-[#1e2f4d] shadow-sm transition-all flex items-center justify-center cursor-pointer select-none"
                >
                  0
                </button>

                <button
                  type="button"
                  onClick={handleDeleteDigit}
                  className="h-12 rounded-2xl bg-slate-900/60 hover:bg-slate-800 active:scale-95 text-slate-400 hover:text-slate-200 font-bold text-xs border border-slate-800 transition-all flex items-center justify-center cursor-pointer select-none"
                  title="Borrar último"
                >
                  <Delete className="w-5 h-5" />
                </button>
              </div>

              {/* Opciones de recuperación */}
              <div className="pt-2 text-center space-y-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setViewMode('reset')}
                  className="text-xs text-sky-400 hover:text-sky-300 font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>¿Olvidó su PIN o desea renovarlo por correo?</span>
                </button>

                <div>
                  <button
                    type="button"
                    onClick={() => setViewMode('password_unlock')}
                    className="text-[11px] text-slate-400 hover:text-slate-200 font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
                  >
                    <Key className="w-3 h-3 text-slate-400" />
                    <span>Desbloquear con contraseña de usuario</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODO 2: DESBLOQUEO CON CONTRASEÑA */}
          {viewMode === 'password_unlock' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-sm font-black text-white">Desbloqueo con Contraseña</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Ingrese la contraseña de <strong>{activeUser.name}</strong> para acceder.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300">Contraseña:</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUnlockWithPassword()}
                  placeholder="Ingrese contraseña..."
                  className="w-full mt-1 px-3 py-2.5 rounded-xl bg-[#0e1d33] border border-[#1e2f4d] text-white text-sm focus:outline-none focus:border-sky-400"
                  autoFocus
                />
              </div>

              {errorMessage && (
                <div className="p-2 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs text-center">
                  {errorMessage}
                </div>
              )}

              <button
                type="button"
                onClick={handleUnlockWithPassword}
                className="w-full py-2.5 rounded-xl bg-[#004299] hover:bg-[#00337a] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                <span>Desbloquear Pantalla</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('keypad')}
                className="w-full py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                Volver al teclado PIN
              </button>
            </div>
          )}

          {/* MODO 3: RENOVACIÓN DE PIN DE 30 DÍAS POR CORREO */}
          {viewMode === 'reset' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-sm font-black text-white">
                  Renovación de PIN para {activeUser.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enviaremos un código de seguridad de 6 dígitos a su correo oficial.
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#0e1d33] border border-[#1e2f4d] text-xs font-mono text-sky-300">
                  <Mail className="w-3.5 h-3.5 text-sky-400" />
                  <span>{activeUser.email}</span>
                  <button
                    onClick={() => setViewMode('change_email')}
                    title="Cambiar correo de destino"
                    className="ml-1 text-slate-400 hover:text-white"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {!codeSent ? (
                <div className="space-y-3">
                  <button
                    onClick={handleSendEmailCode}
                    disabled={isSendingCode}
                    className="w-full py-2.5 rounded-xl bg-[#004299] hover:bg-[#00337a] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSendingCode ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                    <span>Enviar código de 6 dígitos al correo</span>
                  </button>

                  <button
                    onClick={() => setViewMode('keypad')}
                    className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Volver al teclado de PIN
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {previewOtp && (
                    <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-800 text-blue-200 text-xs">
                      <p className="font-bold">Código de verificación para {activeUser.name}:</p>
                      <p className="font-mono text-lg font-black tracking-widest text-sky-300 mt-0.5">{previewOtp}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Enviado a {activeUser.email}.</p>
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] font-bold text-slate-300">Código de 6 dígitos del correo:</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={emailCodeInput}
                      onChange={(e) => setEmailCodeInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ej: 123456"
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-[#0e1d33] border border-[#1e2f4d] text-white text-center font-mono text-lg tracking-widest focus:outline-none focus:border-sky-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-300">Nuevo PIN (4-5 dígitos):</label>
                      <input
                        type="password"
                        maxLength={5}
                        value={newPinInput}
                        onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••"
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-[#0e1d33] border border-[#1e2f4d] text-white text-center font-mono text-lg tracking-widest focus:outline-none focus:border-sky-400"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-300">Confirmar PIN:</label>
                      <input
                        type="password"
                        maxLength={5}
                        value={confirmNewPinInput}
                        onChange={(e) => setConfirmNewPinInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••"
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-[#0e1d33] border border-[#1e2f4d] text-white text-center font-mono text-lg tracking-widest focus:outline-none focus:border-sky-400"
                      />
                    </div>
                  </div>

                  {errorMessage && (
                    <p className="text-xs text-red-400 text-center font-medium">{errorMessage}</p>
                  )}
                  {successMessage && (
                    <p className="text-xs text-emerald-400 text-center font-medium">{successMessage}</p>
                  )}

                  <button
                    onClick={handleSaveNewPin}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Guardar y Activar PIN por 30 Días</span>
                  </button>

                  <button
                    onClick={() => setViewMode('keypad')}
                    className="w-full py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          )}

          {/* MODO 4: ACTUALIZAR CORREO */}
          {viewMode === 'change_email' && (
            <div className="space-y-3">
              <div className="text-center">
                <h3 className="text-sm font-black text-white">Actualizar Correo de {activeUser.name}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Actual: <strong>{activeUser.email}</strong>
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300">Nueva dirección de correo:</label>
                <input
                  type="email"
                  value={newEmailInput}
                  onChange={(e) => setNewEmailInput(e.target.value)}
                  placeholder="ejemplo@cycsalud.com"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-[#0e1d33] border border-[#1e2f4d] text-white text-sm focus:outline-none focus:border-sky-400"
                />
              </div>

              {errorMessage && <p className="text-xs text-red-400 text-center">{errorMessage}</p>}
              {successMessage && <p className="text-xs text-emerald-400 text-center">{successMessage}</p>}

              <button
                onClick={handleSaveNewEmail}
                className="w-full py-2.5 rounded-xl bg-[#004299] hover:bg-[#00337a] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Guardar Nuevo Correo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setViewMode('reset')}
                className="w-full py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                Volver
              </button>
            </div>
          )}
        </div>

        {/* Footer con opción de cerrar sesión */}
        <div className="p-3 bg-[#08101e] border-t border-[#1e2f4d] flex items-center justify-between text-[11px] text-slate-400 px-5">
          <span>Caducidad rotativa cada 30 días</span>
          <button
            onClick={logout}
            className="text-red-400 hover:text-red-300 font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
            title="Cerrar sesión e ir a la pantalla principal de login"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
};
