'use client';

import React, { useState, useEffect } from 'react';
import { RegistroHistorial } from '@/types';
import { generateUltrasoundPdf } from '@/lib/pdf/generateUltrasoundPdf';
import { useClinicStore } from '@/lib/supabase/clinicContext';
import {
  X,
  Download,
  Printer,
  FileCheck2,
  Calendar,
  User,
  Activity,
  Sparkles,
  Phone,
  Mail,
  ShieldCheck,
  Upload,
  Camera,
  CheckCircle2,
  Stethoscope,
  HeartPulse,
  ImageIcon,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  registro: RegistroHistorial | null;
}

export const ModalInformeEcografico: React.FC<Props> = ({ isOpen, onClose, registro }) => {
  const { updateRegistroHistorial, historial } = useClinicStore();

  const [currentRecord, setCurrentRecord] = useState<RegistroHistorial | null>(registro);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (registro) {
      // Find latest version from store in case photos/data were updated
      const found = historial.find((h) => h.id === registro.id) || registro;
      setCurrentRecord(found);
    }
  }, [registro, historial]);

  if (!isOpen || !currentRecord) return null;

  const info = currentRecord.informe_ecografico;
  const fecha = info?.fecha_informe || currentRecord.fecha_registro;
  const medico = info?.medico_ecografista || 'Dr. Henry Castañeda Aponte';

  const isEco = currentRecord.especialidad === 'Ecografía';
  const isOzo = currentRecord.especialidad === 'Ozonoterapia';
  const isGineco = currentRecord.especialidad === 'Ginecología';

  let folioPrefix = 'MED';
  let modalTitle = 'Informe Clínico & Receta Médica Oficial';
  let unitTitle = 'Atención Médica Integral & Medicina General';
  let docCargo = 'Médico Cirujano • C&C Salud Callao';
  let headerGradient = 'from-[#00275c] via-[#004299] to-[#009fe3]';
  let specialtyBadgeBg = 'bg-[#e6f0fc] text-[#004299] border-[#bcdbfc]';
  let photoLabel = 'Registro Fotográfico / Evidencia Clínica';

  let sec1Title = 'Motivo de Consulta & Evaluación Clínica';
  let sec1Value = info?.motivo_indicacion || 'Consulta y evaluación médica general.';

  let sec2Title = 'Tratamiento Médico & Prescripción Farmacológica';
  let sec2Value = currentRecord.tratamiento;

  let sec3Title = 'Conclusión Diagnóstica & Evolución';
  let sec3Value =
    info?.conclusion_diagnostica ||
    'Atención médica completada con indicaciones y esquema terapéutico entregado.';

  let sec4Title = 'Recomendaciones Generales & Próximo Control';
  let sec4Value =
    currentRecord.notas_adicionales ||
    info?.recomendaciones ||
    'Cumplir con el horario de medicación y acudir a reevaluación si los síntomas persisten.';

  if (isEco) {
    folioPrefix = 'ECO';
    modalTitle = 'Informe Ecográfico Oficial';
    unitTitle = 'Unidad de Diagnóstico por Imágenes & Ultrasonido';
    docCargo = 'Médico Especialista en Ecografía & Ultrasonografía';
    headerGradient = 'from-[#00275c] via-[#004299] to-[#009fe3]';
    specialtyBadgeBg = 'bg-sky-100 text-[#009fe3] border-sky-300';
    photoLabel = 'Capturas Ecográficas / Scans';
    sec1Title = 'Modalidad / Tipo de Ecografía';
    sec1Value = info?.tipo_ecografia || 'Ecografía Diagnóstica Especializada';
    sec2Title = 'Hallazgos Ecográficos Detallados';
    sec2Value = info?.hallazgos_detallados || currentRecord.tratamiento;
    sec3Title = 'Conclusión Diagnóstica';
    sec3Value =
      info?.conclusion_diagnostica ||
      'Estudio ecográfico completado acorde a protocolo médico.';
    sec4Title = 'Recomendaciones & Plan de Manejo';
    sec4Value = info?.recomendaciones || currentRecord.notas_adicionales || '';
  } else if (isOzo) {
    folioPrefix = 'OZO';
    modalTitle = 'Informe Clínico de Ozonoterapia & Terapia Biológica';
    unitTitle = 'Unidad de Ozonoterapia Médica & Medicina Regenerativa';
    docCargo = 'Especialista en Ozonoterapia & Medicina Regenerativa';
    headerGradient = 'from-[#3b0764] via-[#7c3aed] to-[#009fe3]';
    specialtyBadgeBg = 'bg-purple-100 text-[#7c3aed] border-purple-300';
    photoLabel = 'Fotos de Evolución (Antes y Después)';
    sec1Title = 'Protocolo / Procedimiento de Ozonoterapia';
    sec1Value = info?.tipo_ecografia || 'Protocolo de Ozonoterapia Médica Especializada';
    sec2Title = 'Tratamiento Aplicado, Dosis & Plan Terapéutico';
    sec2Value = currentRecord.tratamiento;
    sec3Title = 'Conclusión Clínica & Respuesta Terapéutica';
    sec3Value =
      info?.conclusion_diagnostica ||
      'Sesión de ozonoterapia completada con éxito. Paciente tolera adecuadamente el procedimiento sin reacciones adversas.';
    sec4Title = 'Indicaciones Médicas & Cuidados Post-Procedimiento';
    sec4Value =
      currentRecord.notas_adicionales ||
      info?.recomendaciones ||
      'Abundante hidratación oral (2 litros de agua/día), reposo relativo las primeras 12 horas y continuar con el esquema prescrito.';
  } else if (isGineco) {
    folioPrefix = 'GIN';
    modalTitle = 'Informe Clínico de Ginecología & Salud Femenina';
    unitTitle = 'Unidad de Ginecología, Obstetricia & Salud de la Mujer';
    docCargo = 'Médico Especialista en Ginecología & Salud de la Mujer';
    headerGradient = 'from-[#700c3b] via-[#e6007e] to-[#004299]';
    specialtyBadgeBg = 'bg-pink-100 text-[#e6007e] border-pink-300';
    photoLabel = 'Fotos Clínicas / Exámenes de Evolución';
    sec1Title = 'Evaluación Ginecológica / Motivo de Consulta';
    sec1Value =
      info?.motivo_indicacion ||
      info?.tipo_ecografia ||
      'Evaluación ginecológica integral y control clínico preventivo.';
    sec2Title = 'Tratamiento Prescrito & Plan Terapéutico';
    sec2Value = currentRecord.tratamiento;
    sec3Title = 'Diagnóstico Clínico & Conclusión';
    sec3Value =
      info?.conclusion_diagnostica ||
      'Atención ginecológica completada con indicaciones y receta prescrita.';
    sec4Title = 'Recomendaciones & Próximo Control';
    sec4Value =
      currentRecord.notas_adicionales ||
      info?.recomendaciones ||
      'Cumplir estrictamente el tratamiento indicado y acudir a control médico preventivo.';
  }

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await generateUltrasoundPdf(currentRecord);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Upload or replace photos directly from the viewer
  const handleUploadPhoto = (e: React.ChangeEvent<HTMLInputElement>, slot: 'antes' | 'despues') => {
    const file = e.target.files?.[0];
    if (file && currentRecord) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        const updates =
          slot === 'antes' ? { foto_antes: dataUrl } : { foto_despues: dataUrl };

        await updateRegistroHistorial(currentRecord.id, updates);
        setCurrentRecord((prev) => (prev ? { ...prev, ...updates } : null));
      };
      reader.readAsDataURL(file);
    }
  };

  const photosCount = (currentRecord.foto_antes ? 1 : 0) + (currentRecord.foto_despues ? 1 : 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 my-8 print:shadow-none print:border-none print:m-0 print:max-w-none print:w-full">
        {/* Top Action Bar (Hidden on print) */}
        <div
          className={`px-6 py-4 bg-gradient-to-r ${headerGradient} text-white flex items-center justify-between print:hidden`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              {isEco ? (
                <ImageIcon className="w-5 h-5 text-white" />
              ) : isOzo ? (
                <Sparkles className="w-5 h-5 text-white" />
              ) : isGineco ? (
                <HeartPulse className="w-5 h-5 text-white" />
              ) : (
                <FileCheck2 className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold">{modalTitle}</h3>
              <p className="text-xs text-blue-100">
                {currentRecord.especialidad} • Paciente: {currentRecord.nombres_completos} (DNI:{' '}
                {currentRecord.dni})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir A4</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-white text-[#004299] hover:bg-blue-50 text-xs font-black shadow-md transition-all hover:scale-105 disabled:opacity-75 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Generando PDF...' : 'Descargar PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 ml-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Official Printable Sheet Container */}
        <div id="printable-ecografia-report" className="p-8 space-y-6 text-slate-800 text-xs">
          {/* Clinic Brand Header */}
          <div className="border-b-2 border-[#004299] pb-4 flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-1 bg-white border border-slate-200 rounded-xl shadow-2xs">
                <img
                  src="/brand/logo.png"
                  alt="C&C SALUD"
                  className="h-11 w-auto object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/brand/logo.png';
                  }}
                />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#004299]">
                  CONSULTORIO MÉDICO CYC SALUD • CALLAO
                </span>
                <h1 className="text-xl font-extrabold text-slate-900 mt-0.5">{unitTitle}</h1>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Especialidades: Consulta General • Ginecología • Ecografía • Ozonoterapia
                </p>
                <p className="text-[10px] text-slate-400">
                  Av. Túpac Amaru Mz. "V" Lt. 22, Urb. Santa Cruz - Callao • Tel/WhatsApp: +51 965
                  732 965 • ¡Tu Salud es Nuestra Prioridad!
                </p>
              </div>
            </div>

            <div className="text-right p-3 bg-slate-50 rounded-2xl border border-slate-200 flex-shrink-0">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">
                Informe N° {folioPrefix}-{currentRecord.dni}
              </span>
              <span className="text-xs font-extrabold text-slate-800 block mt-0.5">
                Fecha: {fecha}
              </span>
              <span className="text-[10px] text-[#004299] font-bold bg-[#e6f0fc] px-2 py-0.5 rounded-md inline-block mt-1">
                VALIDADO DIGITALMENTE
              </span>
            </div>
          </div>

          {/* Patient Demographic Card */}
          <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/90 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Paciente</span>
              <p className="font-extrabold text-slate-900 text-sm">
                {currentRecord.nombres_completos}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                DNI / Cédula
              </span>
              <p className="font-extrabold text-slate-800 text-sm">{currentRecord.dni}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Edad</span>
              <p className="font-extrabold text-slate-800 text-sm">{currentRecord.edad} años</p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Teléfono / Celular
              </span>
              <p className="font-semibold text-slate-700">
                {currentRecord.celular || 'No registrado'}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Correo Electrónico
              </span>
              <p className="font-semibold text-slate-700 truncate">
                {currentRecord.correo || 'No registrado'}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Especialidad
              </span>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${specialtyBadgeBg}`}
              >
                {currentRecord.especialidad}
              </span>
            </div>
          </div>

          {/* Exam & Treatment Details */}
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#004299] block">
                {sec1Title}
              </span>
              <p className="text-sm font-extrabold text-slate-900 mt-0.5">{sec1Value}</p>
            </div>

            {/* Treatment / Findings Box */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                {sec2Title}
              </span>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                {sec2Value}
              </p>
            </div>

            {/* Biometry Measurements if present */}
            {info?.medidas_biometria && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Mediciones & Biometría
                </span>
                <p className="font-mono text-slate-800 font-semibold">{info.medidas_biometria}</p>
              </div>
            )}

            {/* Diagnostic Conclusion */}
            <div className="p-4 rounded-2xl bg-sky-50/70 border-2 border-sky-300 space-y-1.5">
              <span className="text-[11px] font-black uppercase text-[#004299] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#004299]" />
                <span>{sec3Title}</span>
              </span>
              <p className="text-xs font-bold text-slate-900 leading-relaxed whitespace-pre-line">
                {sec3Value}
              </p>
            </div>

            {/* Recommendations / Notes */}
            {sec4Value && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
                  {sec4Title}
                </span>
                <p className="text-xs text-slate-700">{sec4Value}</p>
              </div>
            )}

            {/* Images Section (Ultrasound Scans or Before/After Photos) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#004299] flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-[#004299]" />
                  <span>
                    {photoLabel} ({photosCount})
                  </span>
                </span>

                <div className="flex items-center gap-2 print:hidden">
                  <label className="cursor-pointer text-[10px] font-bold text-[#004299] bg-[#edf5fd] hover:bg-[#e2effb] px-3 py-1 rounded-xl border border-[#bcdbfc] transition-colors inline-flex items-center gap-1">
                    <Upload className="w-3 h-3 text-[#004299]" />
                    <span>{isEco ? 'Subir Corte 1' : 'Subir Foto Antes'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUploadPhoto(e, 'antes')}
                      className="hidden"
                    />
                  </label>

                  <label className="cursor-pointer text-[10px] font-bold text-[#004299] bg-[#edf5fd] hover:bg-[#e2effb] px-3 py-1 rounded-xl border border-[#bcdbfc] transition-colors inline-flex items-center gap-1">
                    <Upload className="w-3 h-3 text-[#004299]" />
                    <span>{isEco ? 'Subir Corte 2' : 'Subir Foto Después'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUploadPhoto(e, 'despues')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {photosCount === 0 ? (
                <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center space-y-2 print:hidden">
                  <Camera className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">
                    No hay imágenes adjuntas a este registro
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Use los botones superiores para adjuntar fotos de evolución o capturas.
                    Aparecerán de forma automática en este informe y dentro del PDF descargable.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentRecord.foto_antes && (
                    <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 h-52 relative group shadow-xs">
                      <img
                        src={currentRecord.foto_antes}
                        alt="Foto 1"
                        className="w-full h-full object-contain"
                      />
                      <span className="absolute bottom-2 left-2 text-[9px] bg-black/80 text-sky-300 font-mono px-2 py-0.5 rounded">
                        {isEco ? 'SCAN 1: CORTE ECOGRÁFICO' : 'FOTO ANTES / INICIAL'}
                      </span>
                    </div>
                  )}

                  {currentRecord.foto_despues && (
                    <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 h-52 relative group shadow-xs">
                      <img
                        src={currentRecord.foto_despues}
                        alt="Foto 2"
                        className="w-full h-full object-contain"
                      />
                      <span className="absolute bottom-2 left-2 text-[9px] bg-black/80 text-sky-300 font-mono px-2 py-0.5 rounded">
                        {isEco ? 'SCAN 2: CORTE ECOGRÁFICO' : 'FOTO DESPUÉS / CONTROL'}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Signature & Stamp Footer */}
          <div className="pt-6 flex items-end justify-between border-t border-slate-200">
            <div className="text-[10px] text-slate-400 space-y-0.5">
              <p>ID Registro: {currentRecord.id}</p>
              <p>Informe generado con certificación médica y firma electrónica autorizada.</p>
            </div>

            <div className="text-center w-64 border-t-2 border-slate-400 pt-2">
              <p className="font-extrabold text-xs text-slate-900">{medico}</p>
              <p className="text-[11px] text-slate-600 font-semibold">
                {info?.colegiatura_cmp || 'CMP: 48921 • Especialista en Medicina & Cirugía'}
              </p>
              <p className="text-[10px] text-[#004299] font-bold uppercase tracking-wider">
                {docCargo}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer (Hidden on print) */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between print:hidden">
          <span className="text-xs text-slate-500">
            El informe médico incluye todos los datos clínicos del tratamiento y fotografías listo para descarga en PDF.
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer"
            >
              Cerrar
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-2 px-5 py-2 font-black text-white bg-[#004299] hover:bg-[#00337a] rounded-xl shadow-md shadow-[#004299]/25 transition-all hover:scale-105 disabled:opacity-75 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Generando PDF...' : 'Descargar PDF Oficial'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
