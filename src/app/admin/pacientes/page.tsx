'use client';

import React, { useState } from 'react';
import { useClinicStore } from '@/lib/supabase/clinicContext';
import {
  Users2,
  DollarSign,
  TrendingUp,
  FileCheck2,
  AlertTriangle,
  Search,
  PlusCircle,
  Filter,
  CheckCircle2,
  Calendar,
  Lock,
  Download,
  CreditCard,
  Banknote,
  Send,
  HeartPulse,
  Sparkles,
  ChevronRight,
  Stethoscope,
  ExternalLink,
  ShieldAlert,
  X,
  Pencil,
} from 'lucide-react';
import Link from 'next/link';
import { ModalNuevaPaciente } from '@/components/modals/ModalNuevaPaciente';
import { ModalBuscadorPacientes } from '@/components/modals/ModalBuscadorPacientes';
import { ModalEditarPaciente, PatientEditableData } from '@/components/modals/ModalEditarPaciente';
import { Paciente, EspecialidadMedica } from '@/types';

export default function AdminPacientesPage() {
  const {
    pacientes,
    ecografias,
    citas,
    papanicolauList,
    cierreDiario,
    cerrarCajaDelDia,
    setActivePatientId,
    activePatientId,
    addPapanicolau,
  } = useClinicStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterEspecialidad, setFilterEspecialidad] = useState<string>('todas');
  const [openModalPaciente, setOpenModalPaciente] = useState(false);
  const [openSearchModal, setOpenSearchModal] = useState(false);
  const [openCierreModal, setOpenCierreModal] = useState(false);
  const [cierreObservaciones, setCierreObservaciones] = useState('');
  const [openPapModal, setOpenPapModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<PatientEditableData | null>(null);

  // New Pap form state
  const [papPacienteId, setPapPacienteId] = useState(pacientes[0]?.id || '');
  const [papClasificacion, setPapClasificacion] = useState('Negativo para lesión intraepitelial o malignidad (NILM)');
  const [papConducta, setPapConducta] = useState('Control anual de rutina');
  const [papAlertaBiopsia, setPapAlertaBiopsia] = useState(false);

  // Filtered patients
  const filteredPacientes = pacientes.filter((p) => {
    const matchSearch =
      p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.documento.includes(searchQuery) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchEsp =
      filterEspecialidad === 'todas' || p.especialidad_principal === filterEspecialidad;

    return matchSearch && matchEsp;
  });

  const citasHoyCompletadas = citas.filter((c) => c.estado === 'completado').length;
  const papsConAlerta = papanicolauList.filter((p) => p.alerta_biopsia).length;

  const handleCerrarCaja = async (e: React.FormEvent) => {
    e.preventDefault();
    await cerrarCajaDelDia(cierreObservaciones);
    setOpenCierreModal(false);
  };

  const handleRegistrarPap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!papPacienteId) return;

    await addPapanicolau({
      paciente_id: papPacienteId,
      nombre: 'Citología Cervicovaginal / Papanicolau',
      fecha_toma: new Date().toISOString().split('T')[0],
      fecha_resultado: new Date().toISOString().split('T')[0],
      clasificacion_bethesda: papClasificacion,
      hallazgos_microbiologicos: 'Flora bacilar habitual preservada',
      calidad_muestra: 'Satisfactoria para evaluación citomorfológica',
      conducta_sugerida: papConducta,
      alerta_biopsia: papAlertaBiopsia,
      laboratorio: 'Laboratorio de Patología San Lucas',
      estado: 'revisado',
    });

    setOpenPapModal(false);
  };

  const getEspecialidadBadge = (esp?: EspecialidadMedica) => {
    switch (esp) {
      case 'Consulta General':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800">
            Consulta General
          </span>
        );
      case 'Ginecología':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-pink-100 text-[#e6007e]">
            Ginecología
          </span>
        );
      case 'Ecografía':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#e0f2fe] text-[#009fe3]">
            Ecografía
          </span>
        );
      case 'Ozonoterapia':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-[#7c3aed]">
            Ozonoterapia
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#ebf4fd] text-[#004299]">
            General
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-[#e6f0fc] text-[#004299] border border-[#b8d7fa] uppercase tracking-wider">
              CYC SALUD • CALLAO
            </span>
            <span className="text-xs text-slate-400">• Cierre diario contable y padrón</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <Users2 className="w-7 h-7 text-[#004299]" />
            <span>Administración Central & Gestión de Pacientes</span>
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setOpenCierreModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Arqueo / Cierre de Caja</span>
          </button>

          <button
            onClick={() => setOpenPapModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-[#004299] bg-[#edf5fd] hover:bg-[#e2effb] border border-[#bcdbfc] rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <FileCheck2 className="w-4 h-4 text-[#004299]" />
            <span>+ Registrar Pap</span>
          </button>

          <button
            onClick={() => setOpenModalPaciente(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#004299] hover:bg-[#00337a] rounded-xl shadow-md shadow-[#004299]/25 transition-all hover:gap-3 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Alta de Paciente</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Total Padrón</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Users2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-800 mt-2">
            {pacientes.length} <span className="text-xs font-semibold text-slate-500">registradas</span>
          </p>
          <p className="text-[11px] text-indigo-600 font-semibold mt-1">
            {pacientes.filter((p) => p.estado === 'activo').length} pacientes con ficha activa
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Consultas Atendidas</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#004299] flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-800 mt-2">
            {citasHoyCompletadas} <span className="text-xs font-semibold text-slate-500">hoy</span>
          </p>
          <p className="text-[11px] text-[#004299] font-semibold mt-1">
            {citas.length} citas programadas en total
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Recaudación del Día</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 mt-2">
            ${cierreDiario.total_ingresos.toFixed(2)}
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Efectivo: ${cierreDiario.efectivo.toFixed(0)} • Tarjeta: ${cierreDiario.tarjeta.toFixed(0)}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Citologías con Alerta</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-rose-700 mt-2">
            {papsConAlerta} <span className="text-xs font-semibold text-slate-500">casos</span>
          </p>
          <p className="text-[11px] text-rose-600 font-semibold mt-1">
            Requieren colposcopia o biopsia
          </p>
        </div>
      </div>

      {/* Cierre Diario Quick Overview Card */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Módulo de Cierre Contable Diario
            </span>
            {cierreDiario.cerrado ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                CAJA CERRADA
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 animate-pulse">
                TURNO EN CURSO
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold">
            Cierre Operativo del {cierreDiario.fecha}
          </h3>
          <p className="text-xs text-slate-300 max-w-xl">
            {cierreDiario.observaciones || 'Cuadre y conciliación de métodos de pago en tiempo real.'}
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-300 block">Total Recaudado</span>
            <span className="text-2xl font-black text-emerald-300">${cierreDiario.total_ingresos.toFixed(2)}</span>
          </div>

          <button
            onClick={() => setOpenCierreModal(true)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all"
          >
            {cierreDiario.cerrado ? 'Ver Arqueo' : 'Efectuar Cierre'}
          </button>
        </div>
      </div>

      {/* Patient Directory Section */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Users2 className="w-5 h-5 text-indigo-600" />
              Directorio General de Pacientes • 4 Especialidades
            </h3>
            <p className="text-xs text-slate-500">
              Padrón médico para Consulta General, Ginecología, Ecografía y Ozonoterapia
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por DNI, nombre, correo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-48 sm:w-64"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  title="Limpiar búsqueda"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={filterEspecialidad}
              onChange={(e) => setFilterEspecialidad(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5"
            >
              <option value="todas">Todas las Especialidades</option>
              <option value="Consulta General">Consulta General</option>
              <option value="Ginecología">Ginecología</option>
              <option value="Ecografía">Ecografía</option>
              <option value="Ozonoterapia">Ozonoterapia</option>
            </select>

            <button
              onClick={() => setOpenSearchModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#004299] bg-[#edf5fd] hover:bg-[#e2effb] border border-[#bcdbfc] transition-colors shadow-2xs"
            >
              <Search className="w-3.5 h-3.5 text-[#004299]" />
              <span>Buscador Rápido</span>
            </button>
          </div>
        </div>

        {/* Patients Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-600 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Paciente & DNI</th>
                <th className="py-3 px-4">Edad / Contacto</th>
                <th className="py-3 px-4">Grupo Rh</th>
                <th className="py-3 px-4">Especialidad de Atención</th>
                <th className="py-3 px-4">Alergias / Antecedentes</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredPacientes.map((p) => {
                const isSelected = p.id === activePatientId;
                return (
                  <tr
                    key={p.id}
                    className={`transition-colors ${
                      isSelected ? 'bg-indigo-50/60 font-semibold' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{p.nombre}</p>
                      <span className="text-[10px] text-slate-400 font-mono">DNI: {p.documento}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <p>{p.edad} años</p>
                      <span className="text-[10px] text-slate-400 block">{p.telefono}</span>
                      <span className="text-[10px] text-slate-400">{p.email}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                        {p.grupo_rh}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {getEspecialidadBadge(p.especialidad_principal)}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-slate-800 truncate font-medium">{p.alergias || 'Ninguna'}</p>
                      <span className="text-[10px] text-slate-400 truncate block">
                        {p.antecedentes_medicos || 'Sin antecedentes'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {p.estado}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() =>
                            setEditingPatient({
                              dni: p.documento,
                              nombres_completos: p.nombre,
                              celular: p.telefono,
                              correo: p.email,
                              edad: p.edad,
                              grupo_rh: p.grupo_rh,
                              alergias: p.alergias,
                              antecedentes_medicos: p.antecedentes_medicos,
                            })
                          }
                          className="p-1.5 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                          title="Editar datos del paciente"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setActivePatientId(p.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {isSelected ? 'Activa' : 'Seleccionar'}
                        </button>
                        <Link
                          href={`/historial-clinico?dni=${encodeURIComponent(p.documento)}`}
                          onClick={() => setActivePatientId(p.id)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                          title="Ver en Historial Clínico"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Papanicolau & Cytology Results Panel */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-[#e6007e]" />
              Papanicolau & Reportes de Citología Cervical ({papanicolauList.length})
            </h3>
            <p className="text-xs text-slate-500">
              Clasificación Bethesda, conductas sugeridas y alertas de biopsia
            </p>
          </div>

          <button
            onClick={() => setOpenPapModal(true)}
            className="px-3 py-1.5 bg-pink-50 hover:bg-pink-100 text-[#e6007e] font-bold text-xs rounded-xl border border-pink-200 transition-all"
          >
            + Registrar Resultado
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {papanicolauList.map((pap) => (
            <div
              key={pap.id}
              className={`p-4 rounded-2xl border transition-all ${
                pap.alerta_biopsia
                  ? 'bg-rose-50/50 border-rose-200'
                  : 'bg-slate-50/60 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-slate-900">{pap.paciente_nombre}</span>
                {pap.alerta_biopsia ? (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                    Alerta Biopsia
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Citología Normal
                  </span>
                )}
              </div>

              <div className="space-y-1.5 text-xs">
                <p className="font-extrabold text-slate-800">
                  {pap.clasificacion_bethesda}
                </p>
                <p className="text-[11px] text-slate-600">
                  <strong>Conducta:</strong> {pap.conducta_sugerida}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-200/60">
                  <span>Toma: {pap.fecha_toma}</span>
                  <span>{pap.laboratorio}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Cierre Diario */}
      {openCierreModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-gradient-to-r from-[#00275c] via-[#004299] to-[#009fe3] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-200" />
                <h3 className="font-bold text-base">Arqueo y Cierre Diario de Caja</h3>
              </div>
              <button
                onClick={() => setOpenCierreModal(false)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCerrarCaja} className="p-6 space-y-4 text-xs">
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-center">
                <span className="text-[11px] uppercase font-bold text-emerald-800 block">
                  Total Ingresos Registrados Hoy
                </span>
                <span className="text-3xl font-black text-emerald-900 mt-1 block">
                  ${cierreDiario.total_ingresos.toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <Banknote className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-500 font-bold block">Efectivo</span>
                  <span className="text-sm font-extrabold text-slate-800">${cierreDiario.efectivo.toFixed(2)}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <CreditCard className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-500 font-bold block">Tarjeta</span>
                  <span className="text-sm font-extrabold text-slate-800">${cierreDiario.tarjeta.toFixed(2)}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <Send className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-500 font-bold block">Transferencia</span>
                  <span className="text-sm font-extrabold text-slate-800">${cierreDiario.transferencia.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Observaciones de Cierre / Arqueo
                </label>
                <textarea
                  rows={2}
                  value={cierreObservaciones}
                  onChange={(e) => setCierreObservaciones(e.target.value)}
                  placeholder="Detalles del balance, recibos manuales, fondos de caja chica..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOpenCierreModal(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-200"
                >
                  Confirmar y Cerrar Caja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registrar Pap */}
      {openPapModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-gradient-to-r from-[#00275c] via-[#004299] to-[#009fe3] text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Registrar Resultado de Papanicolau</h3>
              <button
                onClick={() => setOpenPapModal(false)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegistrarPap} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Paciente</label>
                <select
                  value={papPacienteId}
                  onChange={(e) => setPapPacienteId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                  required
                >
                  {pacientes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} (DNI: {p.documento})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Clasificación Bethesda
                </label>
                <select
                  value={papClasificacion}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPapClasificacion(val);
                    if (val.includes('ASC-US') || val.includes('LIE')) {
                      setPapAlertaBiopsia(true);
                      setPapConducta('Colposcopia y biopsia dirigida');
                    } else {
                      setPapAlertaBiopsia(false);
                      setPapConducta('Control anual de rutina');
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                >
                  <option value="Negativo para lesión intraepitelial o malignidad (NILM)">
                    Negativo para lesión intraepitelial o malignidad (NILM)
                  </option>
                  <option value="Células escamosas atípicas de significado indeterminado (ASC-US)">
                    Células escamosas atípicas de significado indeterminado (ASC-US)
                  </option>
                  <option value="Lesión intraepitelial escamosa de bajo grado (LIEBG / HPV)">
                    Lesión intraepitelial escamosa de bajo grado (LIEBG / HPV)
                  </option>
                  <option value="Lesión intraepitelial escamosa de alto grado (LIEAG)">
                    Lesión intraepitelial escamosa de alto grado (LIEAG)
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Conducta Sugerida
                </label>
                <input
                  type="text"
                  value={papConducta}
                  onChange={(e) => setPapConducta(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                  required
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  id="alertaBiopsiaCheck"
                  checked={papAlertaBiopsia}
                  onChange={(e) => setPapAlertaBiopsia(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded"
                />
                <label htmlFor="alertaBiopsiaCheck" className="font-bold text-slate-700 cursor-pointer">
                  Marcar Alerta de Biopsia / Colposcopia Prioritaria
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOpenPapModal(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-[#004299] hover:bg-[#00337a] rounded-xl shadow-xs"
                >
                  Guardar Resultado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nueva Paciente */}
      <ModalNuevaPaciente isOpen={openModalPaciente} onClose={() => setOpenModalPaciente(false)} />

      {/* Modal Editar Paciente */}
      <ModalEditarPaciente
        isOpen={Boolean(editingPatient)}
        onClose={() => setEditingPatient(null)}
        patientData={editingPatient}
      />

      {/* Modal Buscador de Pacientes */}
      <ModalBuscadorPacientes
        isOpen={openSearchModal}
        onClose={() => setOpenSearchModal(false)}
      />
    </div>
  );
}
