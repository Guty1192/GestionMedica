'use client';

import React, { useState, useEffect } from 'react';
import { useClinicStore } from '@/lib/supabase/clinicContext';
import { EspecialidadMedica, RegistroHistorial, InformeEcografico } from '@/types';
import {
  X,
  Pencil,
  Save,
  Stethoscope,
  HeartPulse,
  ImageIcon,
  Sparkles,
  Camera,
  Calendar,
  FileText,
  Upload,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  registro: RegistroHistorial | null;
  onSuccess?: (updated: RegistroHistorial) => void;
}

const PRESET_BEFORE_AFTER = [
  {
    label: 'Ecografía: Escaneo Longitudinal & Doppler (C&C Salud)',
    antes: '/brand/ecografia_1.jpg',
    despues: '/brand/consulta_2.jpg',
  },
  {
    label: 'Ginecología: Examen Clínico Especializado (C&C Salud)',
    antes: '/brand/ginecologia_2.jpg',
    despues: '/brand/ginecologia_3.jpg',
  },
  {
    label: 'Ozonoterapia & Regeneración: Dr. Henry Castañeda',
    antes: '/brand/consulta_1.jpg',
    despues: '/brand/dr_henry.jpg',
  },
];

export const ModalEditarTratamiento: React.FC<Props> = ({
  isOpen,
  onClose,
  registro,
  onSuccess,
}) => {
  const { updateRegistroHistorial } = useClinicStore();

  const [fechaRegistro, setFechaRegistro] = useState('');
  const [especialidad, setEspecialidad] = useState<EspecialidadMedica>('Consulta General');
  const [tratamiento, setTratamiento] = useState('');
  const [notasAdicionales, setNotasAdicionales] = useState('');

  // Before & After Photos
  const [fotoAntes, setFotoAntes] = useState('');
  const [fotoDespues, setFotoDespues] = useState('');

  // Ultrasound Fields (if Ecografía)
  const [tipoEcografia, setTipoEcografia] = useState('Ecografía Ginecológica Pélvica / Transvaginal');
  const [motivoIndicacion, setMotivoIndicacion] = useState('');
  const [hallazgosDetallados, setHallazgosDetallados] = useState('');
  const [medidasBiometria, setMedidasBiometria] = useState('');
  const [conclusionDiagnostica, setConclusionDiagnostica] = useState('');
  const [recomendaciones, setRecomendaciones] = useState('');
  const [medicoEcografista, setMedicoEcografista] = useState('Dr. Henry Castañeda Aponte');
  const [colegiaturaCmp, setColegiaturaCmp] = useState('CMP: 48921 • Especialista en Ultrasonografía');

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && registro) {
      setFechaRegistro(registro.fecha_registro || new Date().toISOString().split('T')[0]);
      setEspecialidad(registro.especialidad);
      setTratamiento(registro.tratamiento || '');
      setNotasAdicionales(registro.notas_adicionales || '');
      setFotoAntes(registro.foto_antes || '');
      setFotoDespues(registro.foto_despues || '');

      if (registro.informe_ecografico) {
        setTipoEcografia(registro.informe_ecografico.tipo_ecografia || 'Ecografía Ginecológica Pélvica / Transvaginal');
        setMotivoIndicacion(registro.informe_ecografico.motivo_indicacion || '');
        setHallazgosDetallados(registro.informe_ecografico.hallazgos_detallados || '');
        setMedidasBiometria(registro.informe_ecografico.medidas_biometria || '');
        setConclusionDiagnostica(registro.informe_ecografico.conclusion_diagnostica || '');
        setRecomendaciones(registro.informe_ecografico.recomendaciones || '');
        setMedicoEcografista(registro.informe_ecografico.medico_ecografista || 'Dr. Henry Castañeda Aponte');
        setColegiaturaCmp(registro.informe_ecografico.colegiatura_cmp || 'CMP: 48921 • Especialista en Ultrasonografía');
      }
    }
  }, [isOpen, registro]);

  if (!isOpen || !registro) return null;

  // Convert uploaded image to Base64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'antes' | 'despues') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (target === 'antes') setFotoAntes(reader.result as string);
        else setFotoDespues(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tratamiento.trim()) return;

    setIsSubmitting(true);
    try {
      const informeEco: InformeEcografico | undefined =
        especialidad === 'Ecografía'
          ? {
              tipo_ecografia: tipoEcografia,
              motivo_indicacion: motivoIndicacion,
              hallazgos_detallados: hallazgosDetallados,
              medidas_biometria: medidasBiometria,
              conclusion_diagnostica: conclusionDiagnostica,
              recomendaciones,
              medico_ecografista: medicoEcografista,
              colegiatura_cmp: colegiaturaCmp,
              fecha_informe: fechaRegistro || new Date().toISOString().split('T')[0],
            }
          : undefined;

      const updates: Partial<RegistroHistorial> = {
        fecha_registro: fechaRegistro,
        especialidad,
        tratamiento: tratamiento.trim(),
        foto_antes: fotoAntes || undefined,
        foto_despues: fotoDespues || undefined,
        informe_ecografico: informeEco,
        notas_adicionales: notasAdicionales.trim() || undefined,
      };

      await updateRegistroHistorial(registro.id, updates);

      if (onSuccess) {
        onSuccess({ ...registro, ...updates });
      }
      onClose();
    } catch (err) {
      console.error('Error al editar tratamiento:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8 text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#00275c] via-[#004299] to-[#009fe3] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shadow-xs">
              <Pencil className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/20 uppercase tracking-wider">
                  Modificar Consulta
                </span>
                <span className="text-xs text-sky-100">• C&C Salud</span>
              </div>
              <h3 className="text-base font-bold">
                Editar Tratamiento de {registro.nombres_completos}
              </h3>
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
          {/* Patient Quick Info Tag */}
          <div className="p-3 bg-blue-50/70 dark:bg-blue-950/50 rounded-2xl border border-blue-200/80 dark:border-blue-800 flex items-center justify-between flex-wrap gap-2 text-slate-700 dark:text-slate-200">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#004299] dark:text-sky-400">{registro.nombres_completos}</span>
              <span className="font-mono text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-blue-100 dark:border-slate-700">
                DNI: {registro.dni}
              </span>
              {registro.edad > 0 && <span className="text-slate-500 dark:text-slate-400 font-medium">{registro.edad} años</span>}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">ID: {registro.id}</span>
          </div>

          {/* Row 1: Especialidad Selector & Fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-black text-slate-800 uppercase tracking-wider text-[11px] mb-1.5">
                Especialidad Médica
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { id: 'Consulta General', icon: Stethoscope, activeBg: 'bg-[#ebf4fd] border-[#004299] text-[#004299]' },
                  { id: 'Ginecología', icon: HeartPulse, activeBg: 'bg-pink-50 border-[#e6007e] text-[#e6007e]' },
                  { id: 'Ecografía', icon: ImageIcon, activeBg: 'bg-sky-50 border-[#009fe3] text-[#009fe3]' },
                  { id: 'Ozonoterapia', icon: Sparkles, activeBg: 'bg-purple-50 border-[#7c3aed] text-[#7c3aed]' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = especialidad === item.id;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setEspecialidad(item.id as EspecialidadMedica)}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                        isSelected
                          ? `${item.activeBg} ring-2 ring-blue-300 font-black shadow-xs`
                          : 'bg-slate-50/80 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span className="text-[10px] leading-tight">{item.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block font-black text-slate-800 uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#004299]" />
                <span>Fecha de Atención</span>
              </label>
              <input
                type="date"
                value={fechaRegistro}
                onChange={(e) => setFechaRegistro(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004299]/30 focus:border-[#004299] focus:bg-white transition-all text-xs"
                required
              />
            </div>
          </div>

          {/* Row 2: Tratamiento & Prescripción */}
          <div>
            <label className="block font-black text-slate-800 uppercase tracking-wider text-[11px] mb-1 flex items-center justify-between">
              <span>Tratamiento Médico / Indicaciones / Receta</span>
              <span className="text-[10px] text-slate-400 font-normal">Obligatorio</span>
            </label>
            <textarea
              rows={4}
              value={tratamiento}
              onChange={(e) => setTratamiento(e.target.value)}
              placeholder="Describa el protocolo aplicado, medicamentos prescritos, dosis, vía de administración, duración y observaciones clínicas..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004299]/30 focus:border-[#004299] focus:bg-white transition-all text-xs"
              required
            />
          </div>

          {/* Section 3: Fotos Antes y Después */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-black text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#7c3aed]" />
                <span>Registro Fotográfico: Fotos de Antes y Después</span>
              </label>
              {(fotoAntes || fotoDespues) && (
                <button
                  type="button"
                  onClick={() => {
                    setFotoAntes('');
                    setFotoDespues('');
                  }}
                  className="text-[10px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Quitar Fotos</span>
                </button>
              )}
            </div>

            {/* Presets selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
              <span className="text-slate-400 text-[10px] flex-shrink-0">Fotos C&C:</span>
              {PRESET_BEFORE_AFTER.map((p, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => {
                    setFotoAntes(p.antes);
                    setFotoDespues(p.despues);
                  }}
                  className="px-2 py-1 bg-white hover:bg-purple-50 text-purple-700 font-bold rounded-lg border border-purple-200 transition-colors whitespace-nowrap text-[10px]"
                >
                  {p.label.split(':')[0]}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Foto Antes */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-600 uppercase">1. Foto de Antes</span>
                {fotoAntes ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 h-28 bg-black/5">
                    <img src={fotoAntes} alt="Antes" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFotoAntes('')}
                      className="absolute top-1.5 right-1.5 bg-black/60 text-white p-1 rounded-md hover:bg-black"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-300 hover:border-[#004299] rounded-xl h-28 flex flex-col items-center justify-center cursor-pointer text-slate-400 hover:text-[#004299] transition-all bg-white">
                    <Upload className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-bold">Subir Foto Antes</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'antes')}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Foto Después */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-600 uppercase">2. Foto de Después</span>
                {fotoDespues ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 h-28 bg-black/5">
                    <img src={fotoDespues} alt="Después" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFotoDespues('')}
                      className="absolute top-1.5 right-1.5 bg-black/60 text-white p-1 rounded-md hover:bg-black"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-300 hover:border-[#004299] rounded-xl h-28 flex flex-col items-center justify-center cursor-pointer text-slate-400 hover:text-[#004299] transition-all bg-white">
                    <Upload className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-bold">Subir Foto Después</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'despues')}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Conditional Ultrasound Report Fields */}
          {especialidad === 'Ecografía' && (
            <div className="p-4 bg-sky-50/70 rounded-2xl border border-sky-200 space-y-3">
              <label className="font-black text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#009fe3]" />
                <span>Datos del Informe Ecográfico Oficial (para emisión de PDF)</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo de Ecografía</label>
                  <input
                    type="text"
                    value={tipoEcografia}
                    onChange={(e) => setTipoEcografia(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl font-bold text-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Motivo / Indicación</label>
                  <input
                    type="text"
                    value={motivoIndicacion}
                    onChange={(e) => setMotivoIndicacion(e.target.value)}
                    placeholder="ej: Metrorragia intermenstrual persistente..."
                    className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl font-medium text-slate-800 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hallazgos Detallados</label>
                <textarea
                  rows={3}
                  value={hallazgosDetallados}
                  onChange={(e) => setHallazgosDetallados(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl font-medium text-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Conclusión Diagnóstica</label>
                <textarea
                  rows={2}
                  value={conclusionDiagnostica}
                  onChange={(e) => setConclusionDiagnostica(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl font-bold text-slate-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Recomendaciones</label>
                  <input
                    type="text"
                    value={recomendaciones}
                    onChange={(e) => setRecomendaciones(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl font-medium text-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Médico Ecografista</label>
                  <input
                    type="text"
                    value={medicoEcografista}
                    onChange={(e) => setMedicoEcografista(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl font-bold text-slate-800 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Notas adicionales */}
          <div>
            <label className="block font-black text-slate-700 uppercase tracking-wider text-[11px] mb-1">
              Notas Adicionales / Observaciones Privadas
            </label>
            <textarea
              rows={2}
              value={notasAdicionales}
              onChange={(e) => setNotasAdicionales(e.target.value)}
              placeholder="Notas de seguimiento interno para próximas citas..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004299]/30 focus:border-[#004299] focus:bg-white transition-all text-xs"
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
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Cambios del Tratamiento</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
