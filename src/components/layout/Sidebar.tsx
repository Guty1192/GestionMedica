'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import NextLink from 'next/link';
import { useClinicStore } from '@/lib/supabase/clinicContext';
import {
  Image as ImageIcon,
  CalendarDays,
  UserCheck,
  Shield,
  Stethoscope,
  ClipboardList,
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
    userRole,
    setUserRole,
    isLiveSupabase,
  } = useClinicStore();

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

      {/* Bottom Controls & System Status */}
      <div className="p-4 border-t-2 border-slate-100 bg-slate-50/60 space-y-3">
        {/* Role Toggle */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
            <span className="flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-slate-400" />
              Rol de Usuario
            </span>
            <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider">
              {userRole === 'admin' ? 'Administrador' : 'Médico Especialista'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setUserRole('specialist')}
              className={`flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                userRole === 'specialist'
                  ? 'bg-[#004299] text-white shadow-xs font-bold border border-[#004299]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-3 h-3" />
              Médico
            </button>
            <button
              onClick={() => setUserRole('admin')}
              className={`flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                userRole === 'admin'
                  ? 'bg-[#004299] text-white shadow-xs font-bold border border-[#004299]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3 h-3" />
              Admin
            </button>
          </div>
        </div>

        {/* Sync Status Badge */}
        <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-2.5 text-[11px] text-slate-700">
          <span
            className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
              isLiveSupabase ? 'bg-sky-500 animate-ping' : 'bg-emerald-500'
            }`}
          ></span>
          <div>
            <p className="font-bold text-slate-900 leading-tight">
              {isLiveSupabase ? 'Supabase Conectado' : 'Sincronización Local'}
            </p>
            <p className="text-[10px] text-slate-500">
              {isLiveSupabase ? 'PostgreSQL en vivo' : 'Persistencia tiempo real'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
