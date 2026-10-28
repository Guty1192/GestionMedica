'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useClinicStore } from '@/lib/supabase/clinicContext';
import {
  Search,
  User,
  Phone,
  Mail,
  Calendar,
  X,
  Stethoscope,
  HeartPulse,
  ImageIcon,
  Sparkles,
  ArrowRight,
  FileText,
  CheckCircle2,
  ExternalLink,
  PlusCircle,
  Command,
} from 'lucide-react';
import { EspecialidadMedica, Paciente } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectAndRegister?: (paciente: Paciente) => void;
  onViewTreatments?: (paciente: Paciente) => void;
}

export const ModalBuscadorPacientes: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelectAndRegister,
  onViewTreatments,
}) => {
  const router = useRouter();
  const { pacientes, historial, setActivePatientId, activePatientId } = useClinicStore();

  const [query, setQuery] = useState('');
  const [filterEspecialidad, setFilterEspecialidad] = useState<string>('todas');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Filtered patients
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pacientes.filter((p) => {
      const matchText =
        !q ||
        p.nombre.toLowerCase().includes(q) ||
        p.documento.includes(q) ||
        p.telefono.includes(q) ||
        p.email.toLowerCase().includes(q) ||
        (p.alergias && p.alergias.toLowerCase().includes(q)) ||
        (p.antecedentes_medicos && p.antecedentes_medicos.toLowerCase().includes(q));

      const matchEsp =
        filterEspecialidad === 'todas' || p.especialidad_principal === filterEspecialidad;

      return matchText && matchEsp;
    });
  }, [pacientes, query, filterEspecialidad]);

  // Keyboard navigation (ArrowDown, ArrowUp, Enter, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        handleSelectPatient(results[selectedIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  if (!isOpen) return null;

  const handleSelectPatient = (paciente: Paciente) => {
    setActivePatientId(paciente.id);
    onClose();
    router.push(`/historial-clinico?dni=${encodeURIComponent(paciente.documento)}`);
  };

  const handleGoToHistorial = (paciente: Paciente) => {
    setActivePatientId(paciente.id);
    onClose();
    router.push(`/historial-clinico?dni=${encodeURIComponent(paciente.documento)}`);
  };

  const getEspecialidadBadge = (esp?: EspecialidadMedica) => {
    switch (esp) {
      case 'Consulta General':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800">
            <Stethoscope className="w-3 h-3 text-blue-600" />
            Consulta General
          </span>
        );
      case 'Ginecología':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-pink-100 text-[#e6007e]">
            <HeartPulse className="w-3 h-3 text-[#e6007e]" />
            Ginecología
          </span>
        );
      case 'Ecografía':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#e0f2fe] text-[#009fe3]">
            <ImageIcon className="w-3 h-3 text-[#009fe3]" />
            Ecografía (PDF)
          </span>
        );
      case 'Ozonoterapia':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-[#7c3aed]">
            <Sparkles className="w-3 h-3 text-[#7c3aed]" />
            Ozonoterapia (Fotos)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#ebf4fd] text-[#004299]">
            General
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-start justify-center p-4 pt-16 sm:pt-20 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/70">
          <div className="w-10 h-10 rounded-2xl bg-[#004299] text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-[#004299]/25">
            <Search className="w-5 h-5" />
          </div>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Buscar por DNI, Nombres, Celular, Correo..."
              className="w-full bg-transparent text-base font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-medium focus:outline-none pr-8"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 transition-all flex items-center gap-1 cursor-pointer"
          >
            <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-500">ESC</span>
            <span>Cerrar</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0 mr-1">
            Filtrar:
          </span>
          {[
            { id: 'todas', label: 'Todos' },
            { id: 'Consulta General', label: 'Consulta General' },
            { id: 'Ginecología', label: 'Ginecología' },
            { id: 'Ecografía', label: 'Ecografía' },
            { id: 'Ozonoterapia', label: 'Ozonoterapia' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => {
                setFilterEspecialidad(pill.id);
                setSelectedIndex(0);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filterEspecialidad === pill.id
                  ? 'bg-[#004299] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {pill.label}
            </button>
          ))}
          <span className="ml-auto text-[11px] text-slate-400 font-semibold whitespace-nowrap">
            {results.length} {results.length === 1 ? 'paciente' : 'pacientes'}
          </span>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[55vh]">
          {results.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <User className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No se encontraron pacientes</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No hay coincidencias para &ldquo;{query}&rdquo;. Verifique el número de DNI o nombres completos.
              </p>
            </div>
          ) : (
            results.map((paciente, idx) => {
              const isSelected = idx === selectedIndex;
              const isActiveInApp = paciente.id === activePatientId;
              const recordsCount = historial.filter((h) => h.dni === paciente.documento).length;

              return (
                <div
                  key={paciente.id}
                  onClick={() => setSelectedIndex(idx)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#edf5fd] border-[#004299]/50 ring-2 ring-[#004299]/20 shadow-xs'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  {/* Left: Avatar & Info */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#004299] to-[#009fe3] text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0 mt-0.5">
                      {paciente.nombre
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {paciente.nombre}
                        </h4>
                        {isActiveInApp && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#e6f0fc] text-[#004299] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-[#004299]" />
                            Activa
                          </span>
                        )}
                        {getEspecialidadBadge(paciente.especialidad_principal)}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                        <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                          DNI: {paciente.documento}
                        </span>
                        <span>•</span>
                        <span>{paciente.edad} años</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {paciente.telefono}
                        </span>
                        {paciente.email && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 truncate max-w-[160px]">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {paciente.email}
                            </span>
                          </>
                        )}
                      </div>

                      {recordsCount > 0 && (
                        <p className="text-[11px] text-[#004299] font-semibold pt-0.5 flex items-center gap-1">
                          <FileText className="w-3 h-3 text-[#004299]" />
                          <span>{recordsCount} {recordsCount === 1 ? 'atención registrada en historial' : 'atenciones registradas en historial'}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Quick Action Buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 justify-end">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectPatient(paciente);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        isActiveInApp
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-[#004299] hover:bg-[#00337a] text-white shadow-xs'
                      }`}
                    >
                      <span>{isActiveInApp ? 'Seleccionada' : 'Seleccionar'}</span>
                    </button>

                    {onViewTreatments ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onClose();
                          onViewTreatments(paciente);
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#e0f2fe] hover:bg-[#bae6fd] text-[#009fe3] border border-[#bae6fd] transition-all flex items-center gap-1 cursor-pointer"
                        title="Ver todos los tratamientos del paciente"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#009fe3]" />
                        <span>Ver Tratamientos ({recordsCount})</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGoToHistorial(paciente);
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-all flex items-center gap-1"
                        title="Ver atenciones en Historial Clínico"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Ver Ficha</span>
                      </button>
                    )}

                    {onSelectAndRegister && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onClose();
                          onSelectAndRegister(paciente);
                        }}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-[#edf5fd] hover:bg-[#004299] text-[#004299] hover:text-white border border-[#bcdbfc] transition-all flex items-center gap-1"
                        title="Añadir nuevo tratamiento a este paciente"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>+ Tratamiento</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-600 shadow-2xs">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-600 shadow-2xs">↓</kbd>
              <span>Navegar</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-600 shadow-2xs">Enter</kbd>
              <span>Seleccionar</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-600 shadow-2xs">Esc</kbd>
              <span>Cerrar</span>
            </span>
          </div>

          <span className="text-slate-500 font-semibold">
            Buscador Médico Instantáneo
          </span>
        </div>
      </div>
    </div>
  );
};
