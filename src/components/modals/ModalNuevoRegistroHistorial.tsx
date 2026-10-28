'use client';

import React, { useState } from 'react';
import { useClinicStore } from '@/lib/supabase/clinicContext';
import { EspecialidadMedica, RegistroHistorial, InformeEcografico } from '@/types';
import {
  X,
  FilePlus2,
  Stethoscope,
  HeartPulse,
  ImageIcon,
  Sparkles,
  Upload,
  Check,
  FileText,
  AlertCircle,
  Camera,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newRecord: RegistroHistorial) => void;
  initialPatient?: {
    dni: string;
    nombres_completos: string;
    celular?: string;
    correo?: string;
    edad?: number;
  } | null;
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

export const ModalNuevoRegistroHistorial: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  initialPatient,
}) => {
  const { addRegistroHistorial, historial, pacientes } = useClinicStore();

  // Basic Patient Data
  const [dni, setDni] = useState('');
  const [nombresCompletos, setNombresCompletos] = useState('');
  const [celular, setCelular] = useState('+51 ');
  const [correo, setCorreo] = useState('');
  const [edad, setEdad] = useState<number>(30);
  const [especialidad, setEspecialidad] = useState<EspecialidadMedica>('Ozonoterapia');
  const [tratamiento, setTratamiento] = useState(
    'Protocolo de Ozonoterapia médica: Autohemoterapia Mayor (AHTM) 150ml con O3 a 30 µg/ml + Infiltración local.'
  );

  // Sync initial patient when opened
  React.useEffect(() => {
    if (isOpen) {
      if (initialPatient) {
        setDni(initialPatient.dni);
        setNombresCompletos(initialPatient.nombres_completos);
        setCelular(initialPatient.celular || '+51 ');
        setCorreo(initialPatient.correo || '');
        setEdad(initialPatient.edad || 30);
      } else {
        setDni('');
        setNombresCompletos('');
        setCelular('+51 ');
        setCorreo('');
        setEdad(30);
      }
    }
  }, [isOpen, initialPatient]);

  // Smart patient auto-detection by DNI
  const matchingPatient = React.useMemo(() => {
    const cleanDni = dni.trim();
    if (cleanDni.length >= 6) {
      const fromHist = historial.find((h) => h.dni === cleanDni);
      if (fromHist) {
        return {
          nombre: fromHist.nombres_completos,
          celular: fromHist.celular,
          correo: fromHist.correo,
          edad: fromHist.edad,
        };
      }
      const fromPac = pacientes.find((p) => p.documento === cleanDni);
      if (fromPac) {
        return {
          nombre: fromPac.nombre,
          celular: fromPac.telefono,
          correo: fromPac.email,
          edad: fromPac.edad,
        };
      }
    }
    return null;
  }, [dni, historial, pacientes]);

  // Before & After Photos
  const [fotoAntes, setFotoAntes] = useState('');
  const [fotoDespues, setFotoDespues] = useState('');

  // Conditional Ultrasound Report Fields
  const [tipoEcografia, setTipoEcografia] = useState('Ecografía Ginecológica Pélvica / Transvaginal');
  const [motivoIndicacion, setMotivoIndicacion] = useState('Dolor pélvico recurrente y sangrado intermenstrual.');
  const [hallazgosDetallados, setHallazgosDetallados] = useState(
    'Útero en anteversoflexión de dimensiones normales. Miometrio homogéneo. Endometrio de 7.8 mm secretor. Ovarios de características ecográficas fisiológicas. No se visualiza líquido libre en fondo de saco de Douglas.'
  );
  const [medidasBiometria, setMedidasBiometria] = useState('Útero: 72x40x36 mm | Endometrio: 7.8 mm | Ovario Der: 30x19 mm');
  const [conclusionDiagnostica, setConclusionDiagnostica] = useState(
    '1. Examen ecográfico ginecológico sin lesiones orgánicas patológicas evidentes.\n2. Adecuada correlación con fase folicular tardía.'
  );
  const [recomendaciones, setRecomendaciones] = useState('Control anual ginecológico y ecográfico preventivo.');
  const [medicoEcografista, setMedicoEcografista] = useState('Dr. Henry Castañeda Aponte');
  const [colegiaturaCmp, setColegiaturaCmp] = useState('CMP: 48921 • Especialista en Ultrasonografía');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle specialty change and suggest default treatment template
  const handleEspecialidadChange = (esp: EspecialidadMedica) => {
    setEspecialidad(esp);
    if (esp === 'Ozonoterapia') {
      setTratamiento('Protocolo de Ozonoterapia médica: Autohemoterapia Mayor (AHTM) 150ml con O3 a 30 µg/ml (sesión 1/6). Infiltración periarticular de ozono y aceite ozonizado.');
      setFotoAntes(PRESET_BEFORE_AFTER[0].antes);
      setFotoDespues(PRESET_BEFORE_AFTER[0].despues);
    } else if (esp === 'Ecografía') {
      setTratamiento('Ecografía diagnóstica de alta resolución. Emisión de informe oficial descriptivo y biométrico.');
      setFotoAntes(PRESET_BEFORE_AFTER[2].antes);
      setFotoDespues(PRESET_BEFORE_AFTER[2].despues);
    } else if (esp === 'Ginecología') {
      setTratamiento('Consulta ginecológica integral, examen pélvico especular, toma de citología cervical y plan terapéutico.');
      setFotoAntes(PRESET_BEFORE_AFTER[1].antes);
      setFotoDespues(PRESET_BEFORE_AFTER[1].despues);
    } else if (esp === 'Consulta General') {
      setTratamiento('Evaluación clínica general, signos vitales, anamnesis por aparatos y sistemas. Prescripción médica y solicitud de exámenes de laboratorio.');
      setFotoAntes('');
      setFotoDespues('');
    }
  };

  // Convert uploaded image to Base64 data URL
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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dni.trim() || !nombresCompletos.trim()) return;

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
              fecha_informe: new Date().toISOString().split('T')[0],
            }
          : undefined;

      const newRecord = await addRegistroHistorial({
        dni,
        nombres_completos: nombresCompletos,
        celular,
        correo: correo || `${dni.trim()}@paciente.med`,
        edad: Number(edad),
        especialidad,
        tratamiento,
        foto_antes: fotoAntes || undefined,
        foto_despues: fotoDespues || undefined,
        informe_ecografico: informeEco,
        fecha_registro: new Date().toISOString().split('T')[0],
      });

      if (onSuccess) onSuccess(newRecord);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#00275c] via-[#004299] to-[#009fe3] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <FilePlus2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">Registrar Consulta en Historial Clínico</h3>
              <p className="text-xs text-blue-100">
                CONSULTORIO MÉDICO CYC SALUD • 4 Especialidades Médicas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs">
          {/* Especialidad Selector Buttons */}
          <div>
            <label className="block font-black text-slate-800 uppercase tracking-wider text-[11px] mb-2">
              1. Seleccionar Especialidad de Atención
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'Consulta General', icon: Stethoscope, desc: 'Medicina clínica', activeBg: 'bg-[#ebf4fd] border-[#004299] ring-[#004299]/20 text-[#004299]' },
                { id: 'Ginecología', icon: HeartPulse, desc: 'Salud femenina', activeBg: 'bg-pink-50 border-[#e6007e] ring-pink-200 text-[#e6007e]' },
                { id: 'Ecografía', icon: ImageIcon, desc: 'Con Informe PDF', activeBg: 'bg-sky-50 border-[#009fe3] ring-sky-200 text-[#009fe3]' },
                { id: 'Ozonoterapia', icon: Sparkles, desc: 'Antes y Después', activeBg: 'bg-purple-50 border-[#7c3aed] ring-purple-200 text-[#7c3aed]' },
              ].map((esp) => {
                const Icon = esp.icon;
                const isSelected = especialidad === esp.id;
                return (
                  <button
                    key={esp.id}
                    type="button"
                    onClick={() => handleEspecialidadChange(esp.id as EspecialidadMedica)}
                    className={`p-3 rounded-2xl border-2 text-left transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? `${esp.activeBg} shadow-md ring-2`
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                          isSelected ? 'bg-[#004299] text-white' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-[#004299] animate-ping"></span>
                      )}
                    </div>
                    <div>
                      <p className={`font-black text-xs ${isSelected ? 'text-[#004299]' : 'text-slate-800'}`}>
                        {esp.id}
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium">{esp.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Patient Demographic Details */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-black text-slate-800 uppercase text-[11px] block">
                2. Datos del Paciente
              </span>
              {initialPatient && (
                <span className="text-[10px] font-bold text-[#004299] bg-[#e6f0fc] px-2 py-0.5 rounded-full border border-[#bcdbfc]">
                  Paciente Registrado
                </span>
              )}
            </div>

            {initialPatient && (
              <div className="p-3 bg-[#edf5fd] border border-[#bcdbfc] rounded-xl flex items-center justify-between text-xs">
                <span className="font-bold text-[#004299] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#004299] flex-shrink-0" />
                  <span>Añadiendo nuevo tratamiento para: <strong>{initialPatient.nombres_completos}</strong></span>
                </span>
                <span className="font-mono font-bold bg-white px-2 py-0.5 rounded text-[#004299] border border-[#bcdbfc] text-[11px]">
                  DNI: {initialPatient.dni}
                </span>
              </div>
            )}

            {!initialPatient && matchingPatient && nombresCompletos !== matchingPatient.nombre && (
              <button
                type="button"
                onClick={() => {
                  setNombresCompletos(matchingPatient.nombre);
                  if (matchingPatient.celular) setCelular(matchingPatient.celular);
                  if (matchingPatient.correo) setCorreo(matchingPatient.correo);
                  if (matchingPatient.edad) setEdad(matchingPatient.edad);
                }}
                className="w-full text-left p-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-xs font-semibold text-indigo-900 transition-colors flex items-center justify-between animate-in fade-in"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Paciente detectado en historial: <strong>{matchingPatient.nombre}</strong></span>
                </span>
                <span className="text-[10px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-lg border border-indigo-200 shadow-2xs">
                  Autocompletar datos
                </span>
              </button>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">DNI / Documento</label>
                <input
                  type="text"
                  placeholder="ej: 70891234"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004299]"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Nombres y Apellidos Completos</label>
                <input
                  type="text"
                  placeholder="ej: Carmen Rosa Quispe Valdivia"
                  value={nombresCompletos}
                  onChange={(e) => setNombresCompletos(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004299]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Edad</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={edad}
                  onChange={(e) => setEdad(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004299]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Celular / Teléfono</label>
                <input
                  type="text"
                  placeholder="+51 984..."
                  value={celular}
                  onChange={(e) => setCelular(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004299]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="paciente@gmail.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004299]"
                />
              </div>
            </div>
          </div>

          {/* Treatment Field */}
          <div>
            <label className="block font-black text-slate-800 uppercase text-[11px] mb-1">
              3. Tratamiento, Dosis & Plan Terapéutico
            </label>
            <textarea
              rows={3}
              value={tratamiento}
              onChange={(e) => setTratamiento(e.target.value)}
              placeholder="Describir las indicaciones médicas, medicamentos prescritos, protocolo de ozonoterapia (concentración y vía) o plan..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004299] resize-none text-xs leading-relaxed"
              required
            />
          </div>

          {/* Before & After / Ultrasound Photos Section */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-black text-slate-800 uppercase text-[11px] flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#004299]" />
                {especialidad === 'Ecografía'
                  ? '4. Capturas & Fotos del Ecógrafo (Se imprimirán en el PDF)'
                  : '4. Fotos de Evolución Clínica: Antes y Después'}
              </span>
              <span className="text-[10px] text-[#004299] font-bold">
                {especialidad === 'Ecografía'
                  ? 'Suba los cortes ecográficos para el informe oficial descargable'
                  : 'Ideal para Ozonoterapia, dermatología y ginecología'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Foto Antes / Corte 1 */}
              <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`font-bold text-xs ${especialidad === 'Ecografía' ? 'text-[#004299] font-extrabold' : 'text-rose-600'}`}>
                    {especialidad === 'Ecografía' ? 'Corte 1 (Scan 1)' : 'Foto ANTES'}
                  </span>
                  <label className="cursor-pointer text-[10px] font-bold text-[#004299] hover:text-[#00337a] flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>Subir archivo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'antes')}
                      className="hidden"
                    />
                  </label>
                </div>

                {fotoAntes ? (
                  <div className="relative h-32 rounded-xl overflow-hidden bg-slate-900 border">
                    <img src={fotoAntes} alt="Corte 1 o Antes" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFotoAntes('')}
                      className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full hover:bg-black"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <input
                    type="url"
                    placeholder={especialidad === 'Ecografía' ? 'URL o suba archivo de Corte 1...' : 'URL de foto antes (https://...)'}
                    value={fotoAntes}
                    onChange={(e) => setFotoAntes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-700"
                  />
                )}
              </div>

              {/* Foto Después / Corte 2 */}
              <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`font-bold text-xs ${especialidad === 'Ecografía' ? 'text-[#004299] font-extrabold' : 'text-emerald-600'}`}>
                    {especialidad === 'Ecografía' ? 'Corte 2 (Scan 2)' : 'Foto DESPUÉS'}
                  </span>
                  <label className="cursor-pointer text-[10px] font-bold text-[#004299] hover:text-[#00337a] flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>Subir archivo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'despues')}
                      className="hidden"
                    />
                  </label>
                </div>

                {fotoDespues ? (
                  <div className="relative h-32 rounded-xl overflow-hidden bg-slate-900 border">
                    <img src={fotoDespues} alt="Corte 2 o Después" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFotoDespues('')}
                      className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full hover:bg-black"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <input
                    type="url"
                    placeholder={especialidad === 'Ecografía' ? 'URL o suba archivo de Corte 2...' : 'URL de foto después (https://...)'}
                    value={fotoDespues}
                    onChange={(e) => setFotoDespues(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-700"
                  />
                )}
              </div>
            </div>
          </div>

          {/* CONDITIONAL SECTION: IF SPECIALTY === 'Ecografía' */}
          {especialidad === 'Ecografía' && (
            <div className="bg-gradient-to-r from-[#edf5fd] via-white to-[#f0f9ff] p-5 rounded-3xl border-2 border-[#009fe3] shadow-md space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between border-b border-sky-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#004299] text-white flex items-center justify-center font-bold">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-black text-[#004299] text-sm">
                      Apartado de Informe Ecográfico Oficial (Genera PDF)
                    </h4>
                    <p className="text-[11px] text-sky-700">
                      Rellene los hallazgos y el sistema creará el informe listo para descargar en PDF.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-black bg-[#e6f0fc] text-[#004299] border border-[#bcdbfc] px-2.5 py-1 rounded-full uppercase">
                  PDF Habilitado
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tipo de Ecografía
                  </label>
                  <input
                    type="text"
                    value={tipoEcografia}
                    onChange={(e) => setTipoEcografia(e.target.value)}
                    placeholder="ej: Ecografía Pélvica Transvaginal / Obstétrica / Abdominal"
                    className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004299]"
                    required={especialidad === 'Ecografía'}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Motivo / Indicación Clínica
                  </label>
                  <input
                    type="text"
                    value={motivoIndicacion}
                    onChange={(e) => setMotivoIndicacion(e.target.value)}
                    placeholder="ej: Descarte de litiasis, dolor pélvico, quiste ovárico, control articular"
                    className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004299]"
                    required={especialidad === 'Ecografía'}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Hallazgos Ecográficos Detallados
                </label>
                <textarea
                  rows={3}
                  value={hallazgosDetallados}
                  onChange={(e) => setHallazgosDetallados(e.target.value)}
                  placeholder="Descripción anatómica del útero, miometrio, endometrio, anexos o feto..."
                  className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004299] resize-none text-xs leading-relaxed"
                  required={especialidad === 'Ecografía'}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Biometría & Mediciones (Opcional)
                </label>
                <input
                  type="text"
                  value={medidasBiometria}
                  onChange={(e) => setMedidasBiometria(e.target.value)}
                  placeholder="ej: DBP: 58mm, LF: 43mm, Endometrio: 8mm..."
                  className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl font-mono text-xs text-slate-800"
                />
              </div>

              <div className="bg-sky-50/80 p-3.5 rounded-2xl border border-sky-200">
                <label className="block font-black text-[#004299] mb-1">
                  Conclusión Diagnóstica (Aparecerá destacada en el PDF)
                </label>
                <textarea
                  rows={2}
                  value={conclusionDiagnostica}
                  onChange={(e) => setConclusionDiagnostica(e.target.value)}
                  placeholder="Conclusiones diagnósticas finales numeradas..."
                  className="w-full px-3 py-2 bg-white border border-sky-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004299] resize-none text-xs"
                  required={especialidad === 'Ecografía'}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Recomendaciones & Conducta
                  </label>
                  <input
                    type="text"
                    value={recomendaciones}
                    onChange={(e) => setRecomendaciones(e.target.value)}
                    placeholder="ej: Control anual, correlación con laboratorio"
                    className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Médico Ecografista & Colegiatura (CMP/RNE)
                  </label>
                  <input
                    type="text"
                    value={`${medicoEcografista} - ${colegiaturaCmp}`}
                    onChange={(e) => {
                      const parts = e.target.value.split(' - ');
                      setMedicoEcografista(parts[0] || medicoEcografista);
                      if (parts[1]) setColegiaturaCmp(parts[1]);
                    }}
                    className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl font-semibold text-slate-800 text-[11px]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#004299] hover:bg-[#00337a] text-white font-black rounded-xl shadow-md shadow-blue-200 transition-all hover:scale-105 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Guardando...'
                  : especialidad === 'Ecografía'
                  ? 'Guardar Consulta & Habilitar PDF'
                  : 'Guardar en Historial Clínico'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
