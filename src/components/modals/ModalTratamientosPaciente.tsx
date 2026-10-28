'use client';

import React, { useState } from 'react';
import { RegistroHistorial, EspecialidadMedica } from '@/types';
import { useClinicStore } from '@/lib/supabase/clinicContext';
import { generateUltrasoundPdf } from '@/lib/pdf/generateUltrasoundPdf';
import {
  X,
  User,
  Phone,
  Mail,
  Calendar,
  PlusCircle,
  FileText,
  Download,
  Camera,
  Trash2,
  Stethoscope,
  HeartPulse,
  ImageIcon,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Clock,
  CheckCircle2,
  FileCheck2,
  Pencil,
} from 'lucide-react';
import { ModalEditarTratamiento } from './ModalEditarTratamiento';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  dni: string | null;
  onAddNewTreatment: (patientData: {
    dni: string;
    nombres_completos: string;
    celular?: string;
    correo?: string;
    edad?: number;
  }) => void;
  onOpenEcoReport: (record: RegistroHistorial) => void;
  onOpenPhotos: (record: RegistroHistorial) => void;
}

export const ModalTratamientosPaciente: React.FC<Props> = ({
  isOpen,
  onClose,
  dni,
  onAddNewTreatment,
  onOpenEcoReport,
  onOpenPhotos,
}) => {
  const { historial, deleteRegistroHistorial } = useClinicStore();
  const [filterSpecialty, setFilterSpecialty] = useState<string>('todas');
  const [downloadingPdfId, setDownloadingPdfId] = useState<string | null>(null);
  const [editingTreatment, setEditingTreatment] = useState<RegistroHistorial | null>(null);

  if (!isOpen || !dni) return null;

  // Find all treatment records for this patient
  const patientRecords = historial.filter((h) => h.dni === dni);

  // If patient has at least one record, extract demo info from the latest one
  const latestRecord = patientRecords[0];
  const patientName = latestRecord?.nombres_completos || 'Paciente';
  const patientAge = latestRecord?.edad || 0;
  const patientPhone = latestRecord?.celular || '';
  const patientEmail = latestRecord?.correo || '';

  // Filter records by selected specialty tab
  const filteredRecords = patientRecords.filter(
    (r) => filterSpecialty === 'todas' || r.especialidad === filterSpecialty
  );

  const handleDownloadPdf = async (reg: RegistroHistorial) => {
    setDownloadingPdfId(reg.id);
    try {
      await generateUltrasoundPdf(reg);
    } catch (err) {
      console.error('Error al generar PDF:', err);
    } finally {
      setDownloadingPdfId(null);
    }
  };

  const getEspecialidadBadge = (esp: EspecialidadMedica) => {
    switch (esp) {
      case 'Consulta General':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black bg-[#ebf4fd] text-[#004299] ring-1 ring-[#cde2fb]">
            <Stethoscope className="w-3.5 h-3.5 text-[#004299]" />
            Consulta General
          </span>
        );
      case 'Ginecología':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black bg-pink-100 text-[#e6007e] ring-1 ring-pink-200">
            <HeartPulse className="w-3.5 h-3.5 text-[#e6007e]" />
            Ginecología
          </span>
        );
      case 'Ecografía':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black bg-[#e0f2fe] text-[#009fe3] ring-1 ring-[#bae6fd]">
            <ImageIcon className="w-3.5 h-3.5 text-[#009fe3]" />
            Ecografía (PDF)
          </span>
        );
      case 'Ozonoterapia':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black bg-purple-100 text-[#7c3aed] ring-1 ring-purple-200">
            <Sparkles className="w-3.5 h-3.5 text-[#7c3aed]" />
            Ozonoterapia
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in zoom-in-95 duration-200 text-slate-900 dark:text-slate-100">
        {/* Top Header Card */}
        <div className="p-6 bg-gradient-to-r from-[#00275c] via-[#004299] to-[#009fe3] text-white relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-10">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-white flex items-center justify-center font-black text-xl shadow-md flex-shrink-0">
                {patientName
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-blue-100">
                    Historial Completo del Paciente
                  </span>
                  <span className="text-[11px] font-mono font-bold bg-black/20 px-2 py-0.5 rounded-md text-blue-200">
                    DNI: {dni}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                  {patientName}
                </h2>

                <div className="flex items-center gap-3 text-xs text-blue-100 mt-1 flex-wrap font-medium">
                  {patientAge > 0 && <span>{patientAge} años</span>}
                  {patientPhone && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-blue-200" />
                        {patientPhone}
                      </span>
                    </>
                  )}
                  {patientEmail && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-blue-200" />
                        {patientEmail}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action: Add Treatment Button */}
            <button
              onClick={() => {
                onClose();
                onAddNewTreatment({
                  dni,
                  nombres_completos: patientName,
                  celular: patientPhone,
                  correo: patientEmail,
                  edad: patientAge,
                });
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-[#004299] hover:bg-blue-50 font-black text-xs shadow-lg shadow-black/10 transition-all hover:scale-105 flex-shrink-0 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-[#004299]" />
              <span>+ Agregar Nuevo Tratamiento</span>
            </button>
          </div>
        </div>

        {/* Filter Specialty Pills */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 overflow-x-auto flex-shrink-0">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex-shrink-0">
              Especialidad:
            </span>
            {[
              { id: 'todas', label: 'Todos los tratamientos' },
              { id: 'Consulta General', label: 'Consulta General' },
              { id: 'Ginecología', label: 'Ginecología' },
              { id: 'Ecografía', label: 'Ecografía (PDF)' },
              { id: 'Ozonoterapia', label: 'Ozonoterapia' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterSpecialty(tab.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  filterSpecialty === tab.id
                    ? 'bg-[#004299] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
            {filteredRecords.length}{' '}
            {filteredRecords.length === 1 ? 'tratamiento registrado' : 'tratamientos registrados'}
          </span>
        </div>

        {/* Treatment History Timeline List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {filteredRecords.length === 0 ? (
            <div className="py-14 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-700">
                  {filterSpecialty === 'todas'
                    ? 'Este paciente aún no tiene tratamientos registrados'
                    : `No hay tratamientos registrados en ${filterSpecialty}`}
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  Haga clic en el botón superior para añadir el primer tratamiento clínico a este paciente.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onAddNewTreatment({
                    dni,
                    nombres_completos: patientName,
                    celular: patientPhone,
                    correo: patientEmail,
                    edad: patientAge,
                  });
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#004299] hover:bg-[#00337a] text-white font-bold text-xs shadow-xs transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Registrar Primer Tratamiento</span>
              </button>
            </div>
          ) : (
            filteredRecords.map((reg, index) => {
              const hasPhotos = Boolean(reg.foto_antes || reg.foto_despues);
              const isEco = reg.especialidad === 'Ecografía';

              return (
                <div
                  key={reg.id}
                  className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-sky-500 p-5 shadow-xs hover:shadow-md transition-all space-y-4 relative group"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1.5 text-xs font-black text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
                        <Calendar className="w-3.5 h-3.5 text-[#004299] dark:text-sky-400" />
                        <span>Fecha: {reg.fecha_registro}</span>
                      </div>

                      {getEspecialidadBadge(reg.especialidad)}

                      <span className="text-[11px] font-mono text-slate-400">
                        Sesión #{filteredRecords.length - index}
                      </span>
                    </div>

                    {/* Action buttons on card */}
                    <div className="flex items-center gap-2">
                      {/* Official Medical Report & PDF for all treatments */}
                      <button
                        onClick={() => onOpenEcoReport(reg)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#004299] font-bold text-xs border border-blue-200 transition-colors shadow-2xs"
                        title="Ver informe médico oficial completo"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#004299]" />
                        <span>Ver Informe</span>
                      </button>

                      <button
                        onClick={() => handleDownloadPdf(reg)}
                        disabled={downloadingPdfId === reg.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#004299] hover:bg-[#00337a] text-white font-bold text-xs shadow-xs transition-all hover:scale-105 disabled:opacity-60"
                        title="Descargar informe médico oficial en PDF con fotos"
                      >
                        {downloadingPdfId === reg.id ? (
                          <>
                            <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                            <span>Generando...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            <span>Descargar PDF</span>
                          </>
                        )}
                      </button>

                      {hasPhotos && (
                        <button
                          onClick={() => onOpenPhotos(reg)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#7c3aed] border border-purple-200 font-bold text-xs transition-colors"
                          title="Ver fotos comparativas de evolución"
                        >
                          <Camera className="w-3.5 h-3.5 text-[#7c3aed]" />
                          <span>Fotos</span>
                        </button>
                      )}

                      <button
                        onClick={() => setEditingTreatment(reg)}
                        className="p-1.5 text-slate-400 hover:text-[#004299] rounded-lg hover:bg-blue-50 transition-colors"
                        title="Editar este tratamiento o consulta"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => deleteRegistroHistorial(reg.id)}
                        className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Eliminar este tratamiento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Treatment Content Details */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 block">
                      Tratamiento, Prescripción & Plan Terapéutico
                    </span>
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50/70 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 whitespace-pre-line">
                      {reg.tratamiento}
                    </p>
                  </div>

                  {/* Ultrasound findings or summary if Ecografía */}
                  {isEco && reg.informe_ecografico && (
                    <div className="p-3 bg-sky-50/70 rounded-xl border border-sky-200/80 text-xs space-y-1">
                      <span className="text-[10px] font-black uppercase text-[#004299] block">
                        Conclusión del Estudio ({reg.informe_ecografico.tipo_ecografia}):
                      </span>
                      <p className="font-semibold text-slate-800">
                        {reg.informe_ecografico.conclusion_diagnostica}
                      </p>
                    </div>
                  )}

                  {/* Photos Preview Thumbnails */}
                  {hasPhotos && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        {isEco ? 'Capturas Ecográficas Adjuntas' : 'Fotos de Evolución (Antes y Después)'}
                      </span>
                      <div className="flex items-center gap-3">
                        {reg.foto_antes && (
                          <div
                            onClick={() => (isEco ? onOpenEcoReport(reg) : onOpenPhotos(reg))}
                            className="relative h-20 w-32 rounded-xl overflow-hidden bg-slate-950 border border-slate-200 cursor-pointer hover:ring-2 hover:ring-[#009fe3] transition-all shadow-2xs group/img"
                          >
                            <img
                              src={reg.foto_antes}
                              alt="Scan 1 o Antes"
                              className="w-full h-full object-cover group-hover/img:scale-105 transition-transform"
                            />
                            <span className="absolute bottom-1 left-1 text-[8px] bg-black/80 text-sky-300 font-mono px-1.5 py-0.5 rounded">
                              {isEco ? 'SCAN 1' : 'ANTES'}
                            </span>
                          </div>
                        )}

                        {reg.foto_despues && (
                          <div
                            onClick={() => (isEco ? onOpenEcoReport(reg) : onOpenPhotos(reg))}
                            className="relative h-20 w-32 rounded-xl overflow-hidden bg-slate-950 border border-slate-200 cursor-pointer hover:ring-2 hover:ring-[#009fe3] transition-all shadow-2xs group/img"
                          >
                            <img
                              src={reg.foto_despues}
                              alt="Scan 2 o Después"
                              className="w-full h-full object-cover group-hover/img:scale-105 transition-transform"
                            />
                            <span className="absolute bottom-1 left-1 text-[8px] bg-black/80 text-sky-300 font-mono px-1.5 py-0.5 rounded">
                              {isEco ? 'SCAN 2' : 'DESPUÉS'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Extra Notes */}
                  {reg.notas_adicionales && (
                    <p className="text-[11px] text-slate-500 italic pt-1">
                      Nota médica: {reg.notas_adicionales}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Historial clínico unificado por DNI ({dni}). Puede añadir nuevas sesiones en cualquier momento.
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cerrar
            </button>
            <button
              onClick={() => {
                onClose();
                onAddNewTreatment({
                  dni,
                  nombres_completos: patientName,
                  celular: patientPhone,
                  correo: patientEmail,
                  edad: patientAge,
                });
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#004299] hover:bg-[#00337a] text-white font-extrabold text-xs shadow-md shadow-blue-200 transition-all hover:scale-105"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Agregar Tratamiento a este Paciente</span>
            </button>
          </div>
        </div>

        <ModalEditarTratamiento
          isOpen={Boolean(editingTreatment)}
          onClose={() => setEditingTreatment(null)}
          registro={editingTreatment}
        />
      </div>
    </div>
  );
};
