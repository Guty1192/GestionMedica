'use client';

import React, { useState } from 'react';
import { useClinicStore } from '@/lib/supabase/clinicContext';
import {
  CalendarDays,
  Clock,
  UserCheck,
  AlertTriangle,
  PlusCircle,
  CheckCircle2,
  Stethoscope,
  DollarSign,
  ChevronRight,
  Sparkles,
  Search,
  Filter,
  CreditCard,
  Banknote,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { EstadoCita, MetodoPago } from '@/types';

export default function AgendaControlesPage() {
  const {
    citas,
    pacientes,
    updateCitaEstado,
    addCita,
    setActivePatientId,
  } = useClinicStore();

  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [openNewCitaModal, setOpenNewCitaModal] = useState(false);

  // New Cita Form State
  const [newPacienteId, setNewPacienteId] = useState(pacientes[0]?.id || '');
  const [newHora, setNewHora] = useState('17:00');
  const [newMotivo, setNewMotivo] = useState('Consulta Médica de Control');
  const [newTipo, setNewTipo] = useState<any>('Consulta General');
  const [newProfesional, setNewProfesional] = useState('Dr. Henry Castañeda Aponte');
  const [newMonto, setNewMonto] = useState<number>(70);

  // Filtered appointments
  const filteredCitas = citas.filter((c) => {
    if (filterEstado === 'todos') return true;
    return c.estado === filterEstado;
  });

  const handleCreateCita = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPacienteId) return;

    const consultorioNombre =
      newTipo === 'Ecografía'
        ? 'Sala de Ecografía & Ultrasonido'
        : newTipo === 'Ozonoterapia'
        ? 'Gabinete de Ozonoterapia'
        : newTipo === 'Ginecología'
        ? 'Consultorio 2 - Ginecología'
        : 'Consultorio 1 - Consulta General';

    await addCita({
      paciente_id: newPacienteId,
      fecha: '2026-10-27',
      hora_inicio: newHora,
      motivo: newMotivo,
      tipo: newTipo,
      profesional: newProfesional,
      consultorio: consultorioNombre,
      notas: 'Cita programada desde módulo de agenda',
      monto: Number(newMonto),
      metodo_pago: 'Pendiente',
      estado: 'programado',
    });

    setOpenNewCitaModal(false);
  };

  const getStatusBadge = (estado: EstadoCita) => {
    switch (estado) {
      case 'en_espera':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 ring-1 ring-amber-300 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            En Sala de Espera
          </span>
        );
      case 'en_consulta':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-teal-100 text-teal-800 ring-1 ring-teal-300">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
            En Atención con Especialista
          </span>
        );
      case 'completado':
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Atención Finalizada
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Programada
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase tracking-wider">
              Seguimiento Operativo & Sala de Espera
            </span>
            <span className="text-xs text-slate-400">• Actualización en 1 clic</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <CalendarDays className="w-7 h-7 text-amber-600" />
            <span>Agenda de Controles & Flujo de Pacientes</span>
          </h1>
        </div>

        <button
          onClick={() => setOpenNewCitaModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md shadow-amber-200 transition-all hover:gap-3"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Agendar Nueva Cita</span>
        </button>
      </div>

      {/* Multi-Specialty Clinical Protocols Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-teal-500/10 to-indigo-500/15 p-5 rounded-3xl border border-amber-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-extrabold text-amber-950 uppercase tracking-wider">
              Protocolos Clínicos & Flujos Operativos por Especialidad
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            4 Especialidades Médicas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-white/90 backdrop-blur-sm rounded-2xl border border-blue-200 shadow-2xs">
            <span className="text-[10px] font-black uppercase text-blue-700 block mb-0.5">
              Consulta General
            </span>
            <p className="font-bold text-slate-800">Evaluación y Diagnóstico</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Anamnesis clínica, control de signos vitales e indicación terapéutica inicial.
            </p>
          </div>

          <div className="p-3 bg-white/90 backdrop-blur-sm rounded-2xl border border-rose-200 shadow-2xs">
            <span className="text-[10px] font-black uppercase text-rose-700 block mb-0.5">
              Ginecología
            </span>
            <p className="font-bold text-slate-800">Salud Femenina & Citología</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Control ginecológico preventivo, toma de Papanicolau y evaluación colposcópica.
            </p>
          </div>

          <div className="p-3 bg-white/90 backdrop-blur-sm rounded-2xl border border-sky-200 shadow-2xs">
            <span className="text-[10px] font-black uppercase text-[#009fe3] block mb-0.5">
              Ecografía
            </span>
            <p className="font-bold text-slate-800">Informe Digital & PDF</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Estudios diagnósticos por ultrasonido con emisión inmediata de reporte PDF.
            </p>
          </div>

          <div className="p-3 bg-white/90 backdrop-blur-sm rounded-2xl border border-amber-200 shadow-2xs">
            <span className="text-[10px] font-black uppercase text-amber-700 block mb-0.5">
              Ozonoterapia
            </span>
            <p className="font-bold text-slate-800">Seguimiento Fotográfico</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Evolución clínica con fotos Antes/Después y control de sesiones aplicadas.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs for Appointments Status */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto">
        {[
          { id: 'todos', label: 'Todas las Citas', count: citas.length },
          { id: 'en_espera', label: 'En Sala de Espera', count: citas.filter((c) => c.estado === 'en_espera').length },
          { id: 'en_consulta', label: 'En Atención', count: citas.filter((c) => c.estado === 'en_consulta').length },
          { id: 'programado', label: 'Programadas', count: citas.filter((c) => c.estado === 'programado').length },
          { id: 'completado', label: 'Atendidas', count: citas.filter((c) => c.estado === 'completado').length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterEstado(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterEstado === tab.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full ${
                filterEstado === tab.id
                  ? 'bg-amber-100 text-amber-800 font-extrabold'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Appointment Cards Timeline */}
      <div className="space-y-3">
        {filteredCitas.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No hay citas en este estado para la jornada de hoy.</p>
          </div>
        ) : (
          filteredCitas.map((cita) => {
            const pat = pacientes.find((p) => p.id === cita.paciente_id) || cita.paciente;
            return (
              <div
                key={cita.id}
                className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Time & Patient Details */}
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-slate-100 text-center min-w-[70px]">
                    <Clock className="w-4 h-4 text-slate-500 mx-auto mb-1" />
                    <span className="text-sm font-black text-slate-800">{cita.hora_inicio}</span>
                    <span className="text-[10px] font-bold text-slate-400 block">HOY</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3
                        onClick={() => {
                          if (pat) setActivePatientId(pat.id);
                        }}
                        className="text-base font-bold text-slate-900 cursor-pointer hover:text-rose-600 transition-colors"
                      >
                        {pat?.nombre || 'Paciente'}
                      </h3>
                      {getStatusBadge(cita.estado)}
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                        {cita.tipo}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-semibold flex items-center gap-2">
                      <span className="text-slate-800">{cita.motivo}</span>
                      <span>•</span>
                      <span className="text-teal-700 font-bold">{cita.profesional}</span>
                      <span>•</span>
                      <span className="text-slate-400">{cita.consultorio}</span>
                    </p>

                    {/* Automatic alert message if present */}
                    {cita.alerta_automatica && (
                      <p className="text-xs font-semibold text-amber-800 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200/80 inline-flex items-center gap-1.5 mt-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        <span>{cita.alerta_automatica}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Status Transitions & Payment Info */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  {/* Payment chip */}
                  <div className="text-right sm:pr-4 sm:border-r border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Monto / Pago
                    </span>
                    <p className="text-xs font-extrabold text-slate-800">
                      ${cita.monto.toFixed(2)}{' '}
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          cita.metodo_pago === 'Pendiente'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {cita.metodo_pago}
                      </span>
                    </p>
                  </div>

                  {/* 1-Click Operational Status Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {cita.estado === 'programado' && (
                      <button
                        onClick={() => updateCitaEstado(cita.id, 'en_espera')}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all flex items-center gap-1.5"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                        <span>Recepción: Llegó Paciente</span>
                      </button>
                    )}

                    {cita.estado === 'en_espera' && (
                      <button
                        onClick={() => updateCitaEstado(cita.id, 'en_consulta')}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#004299] bg-[#edf5fd] hover:bg-[#e2effb] border border-[#bcdbfc] transition-all flex items-center gap-1.5 shadow-xs"
                      >
                        <Stethoscope className="w-3.5 h-3.5 text-[#004299]" />
                        <span>Llamar a Consultorio</span>
                      </button>
                    )}

                    {cita.estado === 'en_consulta' && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateCitaEstado(cita.id, 'completado', 'Tarjeta')}
                          className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all flex items-center gap-1 shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Finalizar & Cobrar</span>
                        </button>
                      </div>
                    )}

                    {cita.estado === 'completado' && (
                      <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Registrado en Caja</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Nueva Cita */}
      {openNewCitaModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Agendar Cita en Consultorio</h3>
              <button
                onClick={() => setOpenNewCitaModal(false)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCita} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Paciente</label>
                <select
                  value={newPacienteId}
                  onChange={(e) => setNewPacienteId(e.target.value)}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hora de Cita</label>
                  <input
                    type="time"
                    value={newHora}
                    onChange={(e) => setNewHora(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Arancel / Monto ($)</label>
                  <input
                    type="number"
                    value={newMonto}
                    onChange={(e) => setNewMonto(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Especialidad / Tipo de Consulta</label>
                <select
                  value={newTipo}
                  onChange={(e) => setNewTipo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                >
                  <option value="Consulta General">Consulta General</option>
                  <option value="Ginecología">Ginecología</option>
                  <option value="Ecografía">Ecografía</option>
                  <option value="Ozonoterapia">Ozonoterapia</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Motivo / Detalle</label>
                <input
                  type="text"
                  value={newMotivo}
                  onChange={(e) => setNewMotivo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOpenNewCitaModal(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
                >
                  Confirmar Cita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
