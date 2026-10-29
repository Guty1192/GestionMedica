'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import NextLink from 'next/link';
import { useClinicStore } from '@/lib/supabase/clinicContext';
import { useDoctorAuth } from '@/lib/auth/doctorAuthContext';
import {
  Image as ImageIcon,
  CalendarDays,
  UserCheck,
  Shield,
  Stethoscope,
  ClipboardList,
  Lock,
  KeyRound,
  LogOut,
  Calendar,
  ChevronUp,
  X,
} from 'lucide-react';

const navItems = [
  {
    href: '/historial-clinico',
    label: 'Historial Clínico',
    badge: '4 Especialidades',
    description: 'DNI • Fotos • PDF',
    icon: ClipboardList,
  },
  {
    href: '/ecografias/galeria',
    label: 'Galería Ecografías',
    badge: 'Informes',
    description: 'Visor & Descarga PDF',
    icon: ImageIcon,
  },
  {
    href: '/controles/agenda',
    label: 'Agenda de Citas',
    badge: 'Flujo',
    description: 'Seguimiento de Sala',
    icon: CalendarDays,
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const {
    setUserRole,
    isLiveSupabase,
  } = useClinicStore();

  const {
    currentUser,
    activeUser,
    requestSwitchUser,
    lockScreen,
    logout,
    openPinModal,
    daysRemainingPin,
  } = useDoctorAuth();

  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState<boolean>(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Cerrar el popup al hacer clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setIsProfilePopupOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <aside className="w-72 bg-white border-r-2 border-slate-200 flex flex-col justify-between h-screen sticky top-0 z-30 select-none shadow-xs text-slate-700 transition-colors duration-200">
      {/* Top Branding */}
      <div>
        <div className="p-4 border-b-2 border-slate-100 bg-slate-50/60">
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <NextLink
                href="/"
                className="bg-white px-3 py-1.5 rounded-2xl shadow-xs border border-slate-200 flex items-center justify-center hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
                title="Ir al inicio"
              >
                <img
                  src="/brand/logo.png"
                  alt="C&C SALUD PERÚ"
                  className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/brand/logo.png';
                  }}
                />
              </NextLink>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-blue-50 text-[#004299] border border-blue-200 shadow-xs uppercase tracking-wider">
                CALLAO
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 px-0.5">
              <p className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#009fe3] animate-pulse"></span>
                4 Especialidades Médicas
              </p>
              <span className="text-[10px] text-slate-500 font-semibold">
                Dr. Henry Castañeda
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5">
          <p className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
            Módulos del Sistema
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <NextLink
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all group ${
                  isActive
                    ? 'bg-[#004299] text-white shadow-md shadow-[#004299]/20 font-bold border border-[#004299]'
                    : 'text-slate-700 hover:text-[#004299] hover:bg-slate-50 font-semibold border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#004299]'
                    }`}
                  />
                  <div className="truncate text-left">
                    <p className="truncate leading-tight">{item.label}</p>
                    <p
                      className={`text-[10px] font-normal truncate ${
                        isActive ? 'text-blue-100' : 'text-slate-400 group-hover:text-slate-500'
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    isActive
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'bg-slate-100 text-slate-600 border border-slate-200 group-hover:bg-blue-50 group-hover:text-[#004299] group-hover:border-blue-200'
                  }`}
                >
                  {item.badge}
                </span>
              </NextLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Controls: Cuenta Activa, Seguridad & Sincronización */}
      <div ref={popupRef} className="p-3 border-t-2 border-slate-100 bg-slate-50/70 relative">
        {/* POPUP FLOTANTE DE INFORMACIÓN Y OPCIONES DE CUENTA */}
        {isProfilePopupOpen && (
          <div
            className={`absolute bottom-full left-3 right-3 mb-2 rounded-3xl border-2 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 text-slate-800 ${
              currentUser === 'doctor'
                ? 'bg-white border-sky-300 shadow-sky-950/20'
                : 'bg-white border-purple-300 shadow-purple-950/20'
            }`}
          >
            {/* Cabecera del Popup con botón cerrar */}
            <div className="flex items-start justify-between pb-2.5 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 shadow-xs border ${
                    currentUser === 'doctor'
                      ? 'bg-sky-50 border-sky-200'
                      : 'bg-purple-50 border-purple-200'
                  }`}
                >
                  {activeUser.avatarIcon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-slate-900 truncate">
                    {activeUser.name}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium truncate">
                    {activeUser.email}
                  </p>
                  <span
                    className={`inline-block mt-0.5 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      currentUser === 'doctor'
                        ? 'bg-sky-100 text-sky-800 border border-sky-200'
                        : 'bg-purple-100 text-purple-800 border border-purple-200'
                    }`}
                  >
                    {currentUser === 'doctor' ? 'MÉDICO ESPECIALISTA' : 'ADMINISTRADOR'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsProfilePopupOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="Cerrar ventana"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Contador de caducidad del PIN de 30 días */}
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px] text-slate-700 mb-3">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                PIN rotativo (30 días):
              </span>
              <strong className="text-emerald-700 font-bold">{daysRemainingPin}d restantes</strong>
            </div>

            {/* Acciones de Seguridad */}
            <div className="space-y-1.5 text-xs font-bold">
              <button
                onClick={() => {
                  setIsProfilePopupOpen(false);
                  lockScreen();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer text-left"
              >
                <Lock className="w-3.5 h-3.5 text-slate-600" />
                <span>Bloquear Pantalla con PIN</span>
              </button>

              <button
                onClick={() => {
                  setIsProfilePopupOpen(false);
                  openPinModal();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#004299] border border-blue-200 transition-colors cursor-pointer text-left"
              >
                <KeyRound className="w-3.5 h-3.5 text-[#004299]" />
                <span>Renovar PIN / Gestionar Claves</span>
              </button>

              <button
                onClick={() => {
                  setIsProfilePopupOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100/80 text-red-600 border border-red-200 transition-colors cursor-pointer text-left"
              >
                <LogOut className="w-3.5 h-3.5 text-red-500" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        )}

        {/* Barra Compacta: Cuenta del Sistema */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 px-0.5">
            <span className="flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-slate-400" />
              Cuenta del Sistema
            </span>
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">
              {currentUser === 'doctor' ? 'MÉDICO' : 'ADMIN'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 bg-slate-200/70 p-1 rounded-2xl border border-slate-200">
            {/* Botón Médico */}
            <button
              onClick={() => {
                if (currentUser === 'doctor') {
                  setIsProfilePopupOpen(!isProfilePopupOpen);
                } else {
                  requestSwitchUser('doctor');
                  setUserRole('specialist');
                  setIsProfilePopupOpen(true);
                }
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
                currentUser === 'doctor'
                  ? 'bg-[#004299] text-white shadow-md shadow-[#004299]/25 border border-[#004299]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
              title="Cuenta de Médico (Dr. Henry) - Clic para ver opciones"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Médico</span>
              {currentUser === 'doctor' && (
                <ChevronUp
                  className={`w-3 h-3 text-blue-200 transition-transform ${
                    isProfilePopupOpen ? 'rotate-180' : ''
                  }`}
                />
              )}
            </button>

            {/* Botón Administrador */}
            <button
              onClick={() => {
                if (currentUser === 'admin') {
                  setIsProfilePopupOpen(!isProfilePopupOpen);
                } else {
                  setIsProfilePopupOpen(false);
                  requestSwitchUser('admin');
                }
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
                currentUser === 'admin'
                  ? 'bg-[#004299] text-white shadow-md shadow-[#004299]/25 border border-[#004299]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
              title="Cuenta de Administrador - Clic para acceder con PIN"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Administrador</span>
              {currentUser === 'admin' && (
                <ChevronUp
                  className={`w-3 h-3 text-blue-200 transition-transform ${
                    isProfilePopupOpen ? 'rotate-180' : ''
                  }`}
                />
              )}
            </button>
          </div>

          {/* Sync Status Badge */}
          <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-2 text-[10px] text-slate-600">
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                isLiveSupabase ? 'bg-sky-500 animate-ping' : 'bg-emerald-500'
              }`}
            ></span>
            <div className="min-w-0 flex-1 flex items-center justify-between">
              <span className="font-bold text-slate-800 truncate">
                {isLiveSupabase ? 'Supabase Conectado' : 'Sincronizado'}
              </span>
              <span className="text-[9px] text-slate-400 font-mono">24/7</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
