'use client';

import React, { useState } from 'react';
import { useClinicStore } from '@/lib/supabase/clinicContext';
import { X, UserPlus2, Check, Stethoscope } from 'lucide-react';
import { EspecialidadMedica } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalNuevaPaciente: React.FC<Props> = ({ isOpen, onClose }) => {
  const { addPaciente } = useClinicStore();

  const [nombre, setNombre] = useState('');
  const [documento, setDocumento] = useState('');
  const [edad, setEdad] = useState<number>(30);
  const [telefono, setTelefono] = useState('+51 ');
  const [email, setEmail] = useState('');
  const [grupoRh, setGrupoRh] = useState('O+');
  const [alergias, setAlergias] = useState('Ninguna conocida');
  const [antecedentes, setAntecedentes] = useState('Sin antecedentes de importancia');
  const [especialidadPrincipal, setEspecialidadPrincipal] = useState<EspecialidadMedica>('Consulta General');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !documento.trim()) return;

    setIsSubmitting(true);
    try {
      await addPaciente({
        nombre,
        documento,
        edad: Number(edad),
        telefono,
        email: email || `${nombre.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
        grupo_rh: grupoRh,
        alergias,
        antecedentes_medicos: antecedentes,
        especialidad_principal: especialidadPrincipal,
        estado: 'activo',
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#00275c] via-[#004299] to-[#009fe3] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <UserPlus2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">Alta de Nueva Paciente</h3>
              <p className="text-xs text-sky-100">Padrón de Pacientes • Consulta General, Ginecología, Ecografía y Ozonoterapia</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {/* Datos Personales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Nombres y Apellidos Completos</label>
              <input
                type="text"
                placeholder="ej: Mariana Solís Carrión"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Documento / DNI</label>
              <input
                type="text"
                placeholder="71234567"
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Edad</label>
              <input
                type="number"
                min="1"
                max="120"
                value={edad}
                onChange={(e) => setEdad(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Grupo & Factor Rh</label>
              <select
                value={grupoRh}
                onChange={(e) => setGrupoRh(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
              >
                <option value="O+">O Positivo (O+)</option>
                <option value="A+">A Positivo (A+)</option>
                <option value="B+">B Positivo (B+)</option>
                <option value="AB+">AB Positivo (AB+)</option>
                <option value="O-">O Negativo (O-)</option>
                <option value="A-">A Negativo (A-)</option>
                <option value="B-">B Negativo (B-)</option>
                <option value="AB-">AB Negativo (AB-)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Teléfono Celular</label>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Correo Electrónico</label>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
            />
          </div>

          {/* Especialidad Médica de Interés */}
          <div className="p-4 bg-[#edf5fd] rounded-2xl border border-[#bcdbfc]">
            <label className="block font-bold text-[#004299] mb-1 flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-[#004299]" />
              <span>Especialidad Médica de Atención</span>
            </label>
            <select
              value={especialidadPrincipal}
              onChange={(e) => setEspecialidadPrincipal(e.target.value as EspecialidadMedica)}
              className="w-full px-3 py-2.5 bg-white border border-[#bcdbfc] rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004299]"
            >
              <option value="Consulta General">Consulta General</option>
              <option value="Ginecología">Ginecología</option>
              <option value="Ecografía">Ecografía</option>
              <option value="Ozonoterapia">Ozonoterapia</option>
            </select>
            <p className="text-[11px] text-[#004299] mt-1">
              Seleccione la especialidad por la cual la paciente acude al centro médico.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Alergias Conocidas</label>
              <input
                type="text"
                placeholder="ej: Penicilina, AINEs, ninguna..."
                value={alergias}
                onChange={(e) => setAlergias(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Antecedentes Médicos Relevantes</label>
              <input
                type="text"
                placeholder="ej: Hipertensión, Diabetes, cirugías previas..."
                value={antecedentes}
                onChange={(e) => setAntecedentes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#004299] hover:bg-[#00337a] text-white font-bold shadow-md shadow-blue-200 transition-all hover:scale-105 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Registrando...' : 'Registrar Paciente'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
