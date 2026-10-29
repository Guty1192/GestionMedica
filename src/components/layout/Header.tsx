'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useClinicStore } from '@/lib/supabase/clinicContext';
import { useSecurity } from '@/lib/security/securityContext';
import { useDoctorAuth } from '@/lib/auth/doctorAuthContext';
import {
  Search,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  User,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Lock,
  ArrowLeftRight,
  LogOut,
  KeyRound,
  Calendar,
} from 'lucide-react';
import { ModalNuevoRegistroHistorial } from '../modals/ModalNuevoRegistroHistorial';
import { ModalBuscadorPacientes } from '../modals/ModalBuscadorPacientes';

export const Header: React.FC = () => {
  const router = useRouter();
  const {
    pacientes,
    setActivePatientId,
    activePatientId,
    notification,
    dismissNotification,
    setUserRole,
  } = useClinicStore();

  const { openSecurityModal, privacyMode } = useSecurity();
  const {
    currentUser,
    activeUser,
    switchUser,
    lockScreen,
    logout,
    openPinModal,
    daysRemainingPin,
    isPinExpired,
  } = useDoctorAuth();

  const [openHistorialModal, setOpenHistorialModal] = useState(false);
  const [openSearchModal, setOpenSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global Ctrl + K shortcut to open search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpenSearchModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered patients for instant dropdown
  const filteredPacientes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return pacientes.slice(0, 4);
    return pacientes
      .filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          p.documento.includes(q) ||
          p.telefono.includes(q) ||
          p.especialidad_principal?.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [pacientes, searchQuery]);

  const handleSelectPatient = (pacienteId: string) => {
    setActivePatientId(pacienteId);
    const p = pacientes.find((pat) => pat.id === pacienteId);
    setIsDropdownOpen(false);
    setSearchQuery('');
    if (p) {
      router.push(`/historial-clinico?dni=${encodeURIComponent(p.documento)}`);
    } else {
      router.push('/historial-clinico');
    }
  };

  const getSpecialtyColor = (esp?: string) => {
    switch (esp) {
      case 'Ozonoterapia':
        return 'bg-purple-50 text-[#7c3aed] border-purple-200';
      case 'Ecografía':
        return 'bg-sky-50 text-[#009fe3] border-sky-200';
      case 'Ginecología':
        return 'bg-pink-50 text-[#e6007e] border-pink-200';
      default:
        return 'bg-blue-50 text-[#004299] border-blue-200';
    }
  };

  return (
    <>
      <header className="h-16 bg-white border-b-2 border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 gap-4 shadow-xs transition-colors duration-200">
        {/* High-Contrast Search Bar in Header - Proposal Style */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-xl">
          <div className="relative flex items-center w-full bg-[#1d6fc2] hover:bg-[#1862ac] focus-within:bg-[#1862ac] border border-[#1862ac] focus-within:ring-4 focus-within:ring-[#1d6fc2]/25 rounded-2xl shadow-xs transition-all duration-150">
            {/* Search Icon Badge with white icon */}
            <button
              type="button"
              onClick={() => {
                const q = searchQuery.trim();
                if (q) {
                  setIsDropdownOpen(false);
                  router.push(`/historial-clinico?q=${encodeURIComponent(q)}`);
                }
              }}
              className="flex items-center justify-center w-8 h-8 ml-2 rounded-xl text-white flex-shrink-0 transition-all cursor-pointer"
              title="Buscar paciente en Historial Clínico"
            >
              <Search className="w-4 h-4 text-white" />
            </button>

            {/* Direct Input Field */}
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const q = searchQuery.trim();
                  if (q) {
                    setIsDropdownOpen(false);
                    router.push(`/historial-clinico?q=${encodeURIComponent(q)}`);
                  } else {
                    setOpenSearchModal(true);
                    setIsDropdownOpen(false);
                  }
                }
              }}
              placeholder="Buscar paciente por DNI, nombres o especialidad..."
              className="w-full bg-transparent py-2.5 px-2 text-xs font-semibold text-white placeholder:text-white/80 placeholder:font-normal focus:outline-none"
            />

            {/* Clear Button */}
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  inputRef.current?.focus();
                }}
                className="p-1 text-white/80 hover:text-white transition-colors mr-2 cursor-pointer"
                title="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Real-time High-Contrast Autocomplete Dropdown */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border-2 border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#004299]" />
                  {searchQuery
                    ? `Coincidencias (${filteredPacientes.length})`
                    : 'Pacientes Registrados'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setOpenSearchModal(true);
                    setIsDropdownOpen(false);
                  }}
                  className="text-[11px] font-bold text-[#004299] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Buscador avanzado
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {filteredPacientes.length > 0 ? (
                  filteredPacientes.map((p) => {
                    const isSelected = p.id === activePatientId;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPatient(p.id)}
                        className={`w-full p-3 flex items-center justify-between text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#ebf4fd] hover:bg-[#dbebfb]'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#004299] to-[#009fe3] text-white font-extrabold text-xs flex items-center justify-center flex-shrink-0 shadow-xs">
                            {p.nombre
                              .split(' ')
                              .slice(0, 2)
                              .map((n) => n[0])
                              .join('')}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {p.nombre}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                              <span>
                                DNI:{' '}
                                <strong className="text-slate-800">
                                  {p.documento}
                                </strong>
                              </span>
                              <span>•</span>
                              <span>{p.edad} años</span>
                              {p.telefono && (
                                <>
                                  <span>•</span>
                                  <span>{p.telefono}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${getSpecialtyColor(
                              p.especialidad_principal
                            )}`}
                          >
                            {p.especialidad_principal || 'Consulta'}
                          </span>
                          <span className="text-[11px] font-bold text-[#004299] hidden sm:inline-flex items-center gap-0.5">
                            Seleccionar
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-xs font-bold text-slate-800">
                      No se encontraron pacientes para &quot;{searchQuery}&quot;
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Verifica el número de DNI o escribe parte de los apellidos.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setOpenHistorialModal(true);
                      }}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#004299] text-white text-xs font-bold hover:bg-[#00337a] transition-all cursor-pointer shadow-xs"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      Registrar nuevo paciente
                    </button>
                  </div>
                )}
              </div>

              <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setOpenSearchModal(true);
                    setIsDropdownOpen(false);
                  }}
                  className="text-xs font-bold text-[#004299] hover:text-[#00337a] cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  Abrir buscador completo con filtros por especialidad y tratamientos
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Action Bar: Perfil de Usuario, Bloqueo PIN, Ciberseguridad & Registrar */}
        <div className="flex items-center gap-2">
          {/* User Account Capsule & Dropdown Menu */}
          <div ref={userMenuRef} className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border transition-all cursor-pointer shadow-xs ${
                currentUser === 'doctor'
                  ? 'bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-950'
                  : 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-950'
              }`}
              title="Cuenta activa - Clic para ver opciones de usuario"
            >
              <span className="text-base select-none">{activeUser.avatarIcon}</span>
              <div className="text-left hidden md:block">
                <p className="text-[11px] font-extrabold leading-tight text-slate-900 truncate max-w-[130px]">
                  {currentUser === 'doctor' ? 'Dr. Henry Castañeda' : 'Administrador'}
                </p>
                <p className="text-[9px] font-semibold text-slate-500 leading-tight">
                  {currentUser === 'doctor' ? 'Especialista' : 'Admin'}
                </p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Menu Dropdown de Usuario */}
            {isUserMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border-2 border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                {/* Header del Perfil Activo */}
                <div
                  className={`p-4 border-b border-slate-100 ${
                    currentUser === 'doctor'
                      ? 'bg-gradient-to-br from-sky-50 to-blue-50/50'
                      : 'bg-gradient-to-br from-purple-50 to-indigo-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-xl flex-shrink-0">
                      {activeUser.avatarIcon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-slate-900 truncate">
                        {activeUser.name}
                      </p>
                      <p className="text-[10px] font-semibold text-slate-500 truncate">
                        {activeUser.email}
                      </p>
                      <span
                        className={`inline-block mt-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          currentUser === 'doctor'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {activeUser.roleTitle}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      PIN rotativo (30 días):
                    </span>
                    <strong className="text-emerald-700 font-bold">{daysRemainingPin}d restantes</strong>
                  </div>
                </div>

                {/* Acciones de Cuenta */}
                <div className="p-2 space-y-1">
                  {/* Alternar Cuenta */}
                  <button
                    onClick={() => {
                      const target = currentUser === 'doctor' ? 'admin' : 'doctor';
                      switchUser(target);
                      setUserRole(target === 'doctor' ? 'specialist' : 'admin');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-between transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <ArrowLeftRight className="w-4 h-4 text-sky-600 group-hover:scale-110 transition-transform" />
                      <span>
                        Cambiar a <strong>{currentUser === 'doctor' ? 'Administrador' : 'Dr. Henry Castañeda'}</strong>
                      </span>
                    </div>
                    <span className="text-xs">
                      {currentUser === 'doctor' ? '🛡️' : '🩺'}
                    </span>
                  </button>

                  {/* Bloquear Pantalla con PIN */}
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      lockScreen();
                    }}
                    className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Lock className="w-4 h-4 text-slate-600" />
                    <span>Bloquear Pantalla con PIN</span>
                  </button>

                  {/* Renovar PIN por Correo */}
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      openPinModal();
                    }}
                    className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4 text-[#004299]" />
                    <span>Renovar PIN / Gestionar Claves</span>
                  </button>

                  {/* Cerrar Sesión */}
                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full px-3 py-2 text-left rounded-xl hover:bg-red-50 text-xs font-bold text-red-600 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botón Bloquear Pantalla con PIN */}
          <button
            onClick={lockScreen}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all border border-slate-200 cursor-pointer shadow-2xs group"
            title={`Bloquear pantalla con PIN (${daysRemainingPin} días restantes de vigencia)`}
          >
            <Lock className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-900 transition-transform group-hover:scale-110" />
            <span className="hidden lg:inline font-bold">Bloquear</span>
            <span className="text-[10px] text-slate-500 hidden xl:inline font-mono">({daysRemainingPin}d)</span>
          </button>

          {/* Botón Centro de Ciberseguridad */}
          <button
            onClick={openSecurityModal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-sky-950 bg-sky-50 hover:bg-sky-100/90 rounded-xl transition-all border border-sky-200 cursor-pointer shadow-2xs group"
            title="Abrir Centro de Ciberseguridad & Agentes del Sistema"
          >
            <ShieldCheck className="w-4 h-4 text-[#004299] group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline font-bold text-slate-800">Seguridad</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Protección activa 24/7"></span>
          </button>

          {/* Quick Action Button: Registrar paciente */}
          <button
            onClick={() => setOpenHistorialModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#004299] hover:bg-[#00337a] rounded-xl transition-all shadow-md shadow-[#004299]/25 hover:scale-105 whitespace-nowrap cursor-pointer border border-[#004299]"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Registrar paciente</span>
            <span className="sm:hidden">Registrar</span>
          </button>
        </div>
      </header>

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 animate-bounce-short">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold max-w-md ${
              notification.type === 'success'
                ? 'bg-emerald-950 text-emerald-100 border-emerald-800'
                : notification.type === 'warning'
                ? 'bg-amber-950 text-amber-100 border-amber-800'
                : 'bg-slate-900 text-slate-100 border-slate-800'
            }`}
          >
            {notification.type === 'success' && (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            )}
            {notification.type === 'warning' && (
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            )}
            {notification.type === 'info' && (
              <Info className="w-4 h-4 text-[#009fe3] flex-shrink-0" />
            )}
            <span className="flex-1">{notification.message}</span>
            <button
              onClick={dismissNotification}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ModalNuevoRegistroHistorial
        isOpen={openHistorialModal}
        onClose={() => setOpenHistorialModal(false)}
      />
      <ModalBuscadorPacientes
        isOpen={openSearchModal}
        onClose={() => setOpenSearchModal(false)}
      />
    </>
  );
};
