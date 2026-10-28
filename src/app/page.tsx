'use client';

import React from 'react';
import Link from 'next/link';
import { useClinicStore } from '@/lib/supabase/clinicContext';
import {
  Image as ImageIcon,
  CalendarDays,
  ArrowRight,
  HeartPulse,
  Sparkles,
  Stethoscope,
  ClipboardList,
  Users,
} from 'lucide-react';

export default function DashboardPage() {
  const {
    pacientes,
    historial,
    ecografias,
    citas,
    cierreDiario,
  } = useClinicStore();

  const countConsultaGeneral = historial.filter((h) => h.especialidad === 'Consulta General').length;
  const countGinecologia = historial.filter((h) => h.especialidad === 'Ginecología').length;
  const countEcografia = historial.filter((h) => h.especialidad === 'Ecografía').length;
  const countOzonoterapia = historial.filter((h) => h.especialidad === 'Ozonoterapia').length;

  const citasHoy = citas.filter((c) => c.fecha === '2026-10-27');
  const enEsperaCount = citasHoy.filter((c) => c.estado === 'en_espera').length;
  const enConsultaCount = citasHoy.filter((c) => c.estado === 'en_consulta').length;

  return (
    <div className="max-w-7xl mx-auto space-y-3 sm:space-y-3.5">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#00275c] via-[#004299] to-[#009fe3] dark:from-[#001736] dark:via-[#002a63] dark:to-[#0284c7] p-5 sm:p-6 text-white shadow-md">
        {/* Background photo overlay */}
        <div className="absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none">
          <img
            src="/brand/consulta_1.jpg"
            alt="C&C Salud Clínica"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold mb-2 border border-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#009fe3] animate-ping"></span>
            <span>CONSULTORIO MÉDICO CYC SALUD • ¡Tu Salud es Nuestra Prioridad!</span>
          </div>

          <h1 className="text-2xl font-black tracking-tight sm:text-3xl text-white">
            Sistema Clínico Multiespecialidad
          </h1>

          <p className="mt-1 text-blue-50 text-xs sm:text-sm leading-relaxed">
            Gestión médica integral dirigida por el <strong>Dr. Henry Castañeda Aponte</strong>.
            Atención en 4 especialidades: Consulta General, Ginecología, Ecografía y Ozonoterapia.
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-blue-100">
            <span>📍 Av. Túpac Amaru Mz. &quot;V&quot; Lt. 22, Urb. Santa Cruz - Callao</span>
            <span>•</span>
            <span>📱 +51 965 732 965</span>
          </div>

          <div className="mt-3.5 flex flex-wrap gap-2.5">
            <Link
              href="/historial-clinico"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-[#004299] font-extrabold text-xs shadow-md hover:bg-blue-50 transition-all hover:gap-2.5 cursor-pointer"
            >
              <ClipboardList className="w-3.5 h-3.5 text-[#004299]" />
              <span>Abrir Historial Clínico</span>
              <ArrowRight className="w-3 h-3" />
            </Link>

            <Link
              href="/controles/agenda"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Agenda de Citas ({citasHoy.length})</span>
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none transform translate-x-20 -translate-y-20"></div>
      </div>

      {/* 4 Specialties Counter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Specialty 1: Consulta General */}
        <Link
          href="/historial-clinico"
          className="bg-[#0a1628] p-3.5 sm:p-4 rounded-2xl border border-[#1e2f4d] shadow-md hover:border-sky-400/60 hover:shadow-sky-950/40 hover:-translate-y-0.5 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider group-hover:text-white transition-colors">
              Consulta General
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-400/35 text-sky-300 flex items-center justify-center font-bold group-hover:scale-110 group-hover:bg-blue-500/25 transition-all shadow-inner">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white mt-1.5">
            {countConsultaGeneral} <span className="text-xs font-medium text-slate-300">pacientes</span>
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-sky-300 font-medium">
            <span>Medicina clínica y recetas</span>
          </div>
        </Link>

        {/* Specialty 2: Ginecología */}
        <Link
          href="/historial-clinico"
          className="bg-[#0a1628] p-3.5 sm:p-4 rounded-2xl border border-[#1e2f4d] shadow-md hover:border-pink-400/60 hover:shadow-pink-950/40 hover:-translate-y-0.5 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider group-hover:text-white transition-colors">
              Ginecología
            </span>
            <div className="w-8 h-8 rounded-xl bg-pink-500/15 border border-pink-400/35 text-pink-300 flex items-center justify-center font-bold group-hover:scale-110 group-hover:bg-pink-500/25 transition-all shadow-inner">
              <HeartPulse className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white mt-1.5">
            {countGinecologia} <span className="text-xs font-medium text-slate-300">pacientes</span>
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-pink-300 font-medium">
            <span>Salud femenina y Papanicolau</span>
          </div>
        </Link>

        {/* Specialty 3: Ecografía */}
        <Link
          href="/historial-clinico"
          className="bg-[#0a1628] p-3.5 sm:p-4 rounded-2xl border border-[#1e2f4d] shadow-md hover:border-cyan-400/60 hover:shadow-cyan-950/40 hover:-translate-y-0.5 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider group-hover:text-white transition-colors">
              Ecografía (con PDF)
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-400/35 text-cyan-300 flex items-center justify-center font-bold group-hover:scale-110 group-hover:bg-cyan-500/25 transition-all shadow-inner">
              <ImageIcon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white mt-1.5">
            {countEcografia} <span className="text-xs font-medium text-slate-300">informes</span>
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-cyan-300 font-medium">
            <span>Descarga de PDF e imágenes</span>
          </div>
        </Link>

        {/* Specialty 4: Ozonoterapia */}
        <Link
          href="/historial-clinico"
          className="bg-[#0a1628] p-3.5 sm:p-4 rounded-2xl border border-[#1e2f4d] shadow-md hover:border-purple-400/60 hover:shadow-purple-950/40 hover:-translate-y-0.5 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider group-hover:text-white transition-colors">
              Ozonoterapia
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-400/35 text-purple-300 flex items-center justify-center font-bold group-hover:scale-110 group-hover:bg-purple-500/25 transition-all shadow-inner">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white mt-1.5">
            {countOzonoterapia} <span className="text-xs font-medium text-slate-300">sesiones</span>
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-purple-300 font-medium">
            <span>Con fotos Antes y Después</span>
          </div>
        </Link>
      </div>

      {/* Resumen Compacto: Total de Pacientes (Padrón Único) */}
      <div className="flex items-center">
        <div className="inline-flex items-center gap-3 bg-[#0a1628] px-4 py-2 rounded-2xl border border-[#1e2f4d] shadow-md hover:border-sky-400/50 transition-all">
          <div className="w-7 h-7 rounded-xl bg-blue-500/15 border border-blue-400/30 text-sky-300 flex items-center justify-center flex-shrink-0">
            <Users className="w-4 h-4" />
          </div>

          <span className="text-xs font-semibold text-slate-300">
            Total de Pacientes:
          </span>

          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-white tracking-tight">
              {pacientes.length}
            </span>
            <span className="text-xs font-medium text-slate-400">
              {pacientes.length === 1 ? 'paciente' : 'pacientes'}
            </span>
          </div>

          <div className="h-4 w-px bg-slate-700/80 mx-1"></div>

          <Link
            href="/historial-clinico"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/15 hover:bg-[#004299] text-sky-300 hover:text-white font-semibold text-xs transition-all border border-blue-400/25 hover:border-blue-400/50 cursor-pointer"
            title="Ver lista de pacientes en Historial Clínico"
          >
            <span>Ver historial</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
