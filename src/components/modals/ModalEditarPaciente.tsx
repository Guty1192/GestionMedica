'use client';

import React, { useState, useEffect } from 'react';
import { useClinicStore } from '@/lib/supabase/clinicContext';
import {
  X,
  UserCheck,
  Save,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  FileText,
  HeartPulse,
  Droplet,
  ShieldCheck,
} from 'lucide-react';

export interface PatientEditableData {
  dni: string;
  nombres_completos: string;
  celular?: string;
  correo?: string;
  edad?: number;
  grupo_rh?: string;
  alergias?: string;
  antecedentes_medicos?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  patientData: PatientEditableData | null;
  onSuccess?: () => void;
}

export const ModalEditarPaciente: React.FC<Props> = ({
  isOpen,
  onClose,
  patientData,
  onSuccess,
}) => {
  const { updateDatosPaciente, pacientes } = useClinicStore();

  const [originalDni, setOriginalDni] = useState('');
  const [nombre, setNombre] = useState('');
  const [documento, setDocumento] = useState('');
  const [edad, setEdad] = useState<number>(30);
  const [celular, setCelular] = useState('+51 ');
  const [correo, setCorreo] = useState('');
  const [grupoRh, setGrupoRh] = useState('O+');
  const [alergias, setAlergias] = useState('Ninguna conocida');
  const [antecedentes, setAntecedentes] = useState('Sin antecedentes de importancia');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && patientData) {
      setOriginalDni(patientData.dni);
      setNombre(patientData.nombres_completos || '');
      setDocumento(patientData.dni || '');
      setEdad(patientData.edad || 30);
      setCelular(patientData.celular || '+51 ');
      setCorreo(patientData.correo || '');

      // Check if extended fields exist in pacientes store
      const fromStore = pacientes.find((p) => p.documento === patientData.dni);
      setGrupoRh(patientData.grupo_rh || fromStore?.grupo_rh || 'O+');
      setAlergias(patientData.alergias || fromStore?.alergias || 'Ninguna conocida');
      setAntecedentes(
        patientData.antecedentes_medicos || fromStore?.antecedentes_medicos || 'Sin antecedentes de importancia'
      );
    }
  }, [isOpen, patientData, pacientes]);

  if (!isOpen || !patientData) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !documento.trim()) return;

    setIsSubmitting(true);
    try {
      await updateDatosPaciente(originalDni, {
        nombre: nombre.trim(),
        documento: documento.trim(),
        edad: Number(edad),
        telefono: celular.trim(),
        email: correo.trim() || `${documento.trim()}@paciente.med`,
        grupo_rh: grupoRh,
        alergias: alergias.trim(),
        antecedentes_medicos: antecedentes.trim(),
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Error al actualizar datos del paciente:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8 text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#00275c] via-[#004299] to-[#009fe3] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shadow-xs">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/20 uppercase tracking-wider">
                  Expediente Médico
                </span>
                <span className="text-xs text-sky-100">• C&C Salud</span>
              </div>
              <h3 className="text-base font-bold">Editar Datos del Paciente</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto text-xs">
          {/* Info Notice */}
          <div className="p-3 bg-blue-50/80 dark:bg-blue-950/50 rounded-2xl border border-blue-200 dark:border-blue-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200">
            <ShieldCheck className="w-4 h-4 text-[#004299] dark:text-sky-400 flex-shrink-0" />
            <p className="text-[11px] leading-tight">
              Los cambios que realice se sincronizarán automáticamente en su <strong>historial clínico</strong>,
              en todos sus <strong>tratamientos registrados</strong> y en el <strong>padrón de pacientes</strong>.
            </p>
          </div>

          {/* Section 1: Nombres y DNI */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Nombres y Apellidos Completos <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="ej: Carmen Rosa Quispe Valdivia"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004299]/30 focus:border-[#004299] focus:bg-white transition-all text-xs"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Documento / DNI <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                placeholder="70891234"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004299]/30 focus:border-[#004299] focus:bg-white transition-all text-xs"
                required
              />
            </div>
          </div>

          {/* Section 2: Contacto & Edad */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Edad (años) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="125"
                value={edad}
                onChange={(e) => setEdad(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004299]/30 focus:border-[#004299] focus:bg-white transition-all text-xs"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3 text-[#004299]" />
                <span>Celular / WhatsApp</span>
              </label>
              <input
                type="text"
                value={celular}
                onChange={(e) => setCelular(e.target.value)}
                placeholder="+51 984 551 234"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004299]/30 focus:border-[#004299] focus:bg-white transition-all text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Mail className="w-3 h-3 text-[#004299]" />
                <span>Correo Electrónico</span>
              </label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="paciente@gmail.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004299]/30 focus:border-[#004299] focus:bg-white transition-all text-xs"
              />
            </div>
          </div>

          {/* Section 3: Grupo Sanguíneo & Alergias */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Droplet className="w-3 h-3 text-rose-500" />
                <span>Grupo Sanguíneo / Rh</span>
              </label>
              <select
                value={grupoRh}
                onChange={(e) => setGrupoRh(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004299]/30 focus:border-[#004299] transition-all text-xs cursor-pointer"
              >
                <option value="O+">O Positivo (O+)</option>
                <option value="O-">O Negativo (O-)</option>
                <option value="A+">A Positivo (A+)</option>
                <option value="A-">A Negativo (A-)</option>
                <option value="B+">B Positivo (B+)</option>
                <option value="B-">B Negativo (B-)</option>
                <option value="AB+">AB Positivo (AB+)</option>
                <option value="AB-">AB Negativo (AB-)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-500" />
                <span>Alergias Medicamentosas / Sustancias</span>
              </label>
              <input
                type="text"
                value={alergias}
                onChange={(e) => setAlergias(e.target.value)}
                placeholder="ej: Penicilina, AINEs, Látex o Ninguna conocida"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004299]/30 focus:border-[#004299] focus:bg-white transition-all text-xs"
              />
            </div>
          </div>

          {/* Section 4: Antecedentes Médicos */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <HeartPulse className="w-3 h-3 text-[#e6007e]" />
              <span>Antecedentes Médicos / Patológicos Relevantes</span>
            </label>
            <textarea
              rows={2}
              value={antecedentes}
              onChange={(e) => setAntecedentes(e.target.value)}
              placeholder="ej: Hipertensión controlada, cesárea previa, hipotiroidismo, sin antecedentes patológicos..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004299]/30 focus:border-[#004299] focus:bg-white transition-all text-xs"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#004299] hover:bg-[#00337a] text-white font-black text-xs shadow-md shadow-blue-200 transition-all hover:scale-105 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                  <span>Guardando Cambios...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Cambios del Paciente</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
