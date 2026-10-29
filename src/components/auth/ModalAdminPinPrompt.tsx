'use client';

import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '@/lib/auth/doctorAuthContext';
import {
  Shield,
  Lock,
  Unlock,
  KeyRound,
  Delete,
  X,
  CheckCircle2,
  AlertCircle,
  Key,
} from 'lucide-react';

export const ModalAdminPinPrompt: React.FC = () => {
  const {
    isAdminPinPromptOpen,
    cancelSwitchToAdmin,
    confirmSwitchToAdminWithPin,
    confirmSwitchToAdminWithPassword,
    adminConfig,
  } = useDoctorAuth();

  const [pinInput, setPinInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isShake, setIsShake] = useState<boolean>(false);
  const [showPasswordMode, setShowPasswordMode] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');

  // Limpiar estado al abrir/cerrar
  useEffect(() => {
    if (isAdminPinPromptOpen) {
      setPinInput('');
      setPasswordInput('');
      setErrorMessage('');
      setSuccessMessage('');
      setShowPasswordMode(false);
    }
  }, [isAdminPinPromptOpen]);

  // Soporte de teclado físico (números del 0 al 9, backspace, enter)
  useEffect(() => {
    if (!isAdminPinPromptOpen || showPasswordMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleDigitClick(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleDeleteDigit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelSwitchToAdmin();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdminPinPromptOpen, showPasswordMode, pinInput]);

  if (!isAdminPinPromptOpen) return null;

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

  const verifyPinAuto = async (enteredPin: string) => {
    const res = await confirmSwitchToAdminWithPin(enteredPin);
    if (res.success) {
      setSuccessMessage(res.message);
      setTimeout(() => {
        setPinInput('');
        setSuccessMessage('');
      }, 400);
    } else {
      if (enteredPin.length === 4) {
        // Podría ser un PIN de 5 dígitos, dar oportunidad
        return;
      }
      triggerError(res.message);
    }
  };

  const triggerError = (msg: string) => {
    setErrorMessage(msg);
    setIsShake(true);
    setTimeout(() => setIsShake(false), 500);
    setPinInput('');
  };

  const handleSubmitPassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    if (!passwordInput.trim()) {
      setErrorMessage('Por favor ingrese la contraseña de Administrador.');
      return;
    }
    const res = await confirmSwitchToAdminWithPassword(passwordInput);
    if (res.success) {
      setSuccessMessage(res.message);
      setTimeout(() => {
        setPasswordInput('');
        setSuccessMessage('');
      }, 400);
    } else {
      triggerError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div
        className={`relative w-full max-w-sm bg-[#0a1628] rounded-3xl border border-purple-500/40 shadow-2xl overflow-hidden flex flex-col text-slate-100 ${
          isShake ? 'animate-shake' : ''
        }`}
      >
        {/* Header con Branding de Administrador */}
        <div className="p-5 border-b border-[#1e2f4d] bg-gradient-to-r from-[#170e2b] via-[#2a175a] to-[#0a1628] text-center relative">
          <button
            onClick={cancelSwitchToAdmin}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
            title="Cancelar y permanecer como Médico"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-13 h-13 rounded-2xl bg-purple-500/20 border border-purple-400/30 text-purple-400 flex items-center justify-center mx-auto mb-2 shadow-inner text-2xl">
            🛡️
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-[10px] font-bold text-purple-300 mb-1 uppercase tracking-wider">
            <Lock className="w-3 h-3 text-purple-400" />
            <span>Autorización Requerida</span>
          </div>

          <h2 className="text-base font-black text-white tracking-tight">
            Acceso de Administrador
          </h2>
          <p className="text-xs text-purple-200/80 mt-0.5">
            Ingrese el PIN de Administrador para cambiar de cuenta
          </p>
        </div>

        {/* Contenido: Teclado numérico o Contraseña */}
        <div className="p-6 space-y-4">
          {!showPasswordMode ? (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-xs text-slate-300 font-semibold">
                  PIN de 4 dígitos de <strong>Administrador</strong>
                </p>
              </div>

              {/* Indicadores visuales de PIN */}
              <div className="flex items-center justify-center gap-3 py-1">
                {[0, 1, 2, 3].map((idx) => {
                  const isFilled = pinInput.length > idx;
                  return (
                    <div
                      key={idx}
                      className={`w-4 h-4 rounded-full border-2 transition-all ${
                        isFilled
                          ? 'bg-purple-400 border-purple-400 scale-110 shadow-md shadow-purple-500/40'
                          : 'border-slate-600 bg-slate-900/50'
                      }`}
                    />
                  );
                })}
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

              {/* Teclado numérico táctil */}
              <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleDigitClick(digit)}
                    className="h-11 rounded-xl bg-[#0e1d33] hover:bg-[#1f173f] active:scale-95 text-white font-extrabold text-base border border-[#1e2f4d] shadow-sm transition-all flex items-center justify-center cursor-pointer select-none"
                  >
                    {digit}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setPinInput('')}
                  className="h-11 rounded-xl bg-slate-900/60 hover:bg-slate-800 active:scale-95 text-slate-400 hover:text-slate-200 font-bold text-[11px] border border-slate-800 transition-all flex items-center justify-center cursor-pointer select-none"
                  title="Limpiar"
                >
                  Limpiar
                </button>

                <button
                  type="button"
                  onClick={() => handleDigitClick('0')}
                  className="h-11 rounded-xl bg-[#0e1d33] hover:bg-[#1f173f] active:scale-95 text-white font-extrabold text-base border border-[#1e2f4d] shadow-sm transition-all flex items-center justify-center cursor-pointer select-none"
                >
                  0
                </button>

                <button
                  type="button"
                  onClick={handleDeleteDigit}
                  className="h-11 rounded-xl bg-slate-900/60 hover:bg-slate-800 active:scale-95 text-slate-400 hover:text-slate-200 font-bold text-xs border border-slate-800 transition-all flex items-center justify-center cursor-pointer select-none"
                  title="Borrar último"
                >
                  <Delete className="w-4 h-4" />
                </button>
              </div>

              {/* Opción alternativa con contraseña */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setShowPasswordMode(true)}
                  className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <Key className="w-3 h-3" />
                  <span>¿Ingresar con contraseña de Administrador?</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitPassword} className="space-y-3.5">
              <div className="text-center">
                <p className="text-xs text-slate-300 font-semibold">
                  Contraseña de la cuenta de <strong>Administrador</strong>
                </p>
              </div>

              <div>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Ingrese contraseña de admin..."
                  className="w-full px-3 py-2 rounded-xl bg-[#0e1d33] border border-[#1e2f4d] text-white text-xs focus:outline-none focus:border-purple-400"
                  autoFocus
                />
              </div>

              {errorMessage && (
                <div className="p-2 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs text-center">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="p-2 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs text-center">
                  {successMessage}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                <span>Autorizar Acceso de Administrador</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPasswordMode(false)}
                className="w-full py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                Volver al teclado de PIN
              </button>
            </form>
          )}

          {/* Botón de Cancelar */}
          <div className="pt-2 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={cancelSwitchToAdmin}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors font-medium cursor-pointer"
            >
              Cancelar y permanecer como <strong>Dr. Henry Castañeda</strong>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
