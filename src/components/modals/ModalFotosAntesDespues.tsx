'use client';

import React from 'react';
import { RegistroHistorial } from '@/types';
import { X, Camera, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  registro: RegistroHistorial | null;
}

export const ModalFotosAntesDespues: React.FC<Props> = ({ isOpen, onClose, registro }) => {
  if (!isOpen || !registro) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Evolución Clínica: Fotos Antes vs Después
              </h3>
              <p className="text-xs text-slate-400">
                {registro.nombres_completos} • DNI: {registro.dni} • Especialidad: {registro.especialidad}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Side by Side */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Antes */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-between">
              <div className="p-3 bg-rose-950/40 border-b border-rose-900/40 flex items-center justify-between">
                <span className="text-xs font-black text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Foto ANTES del Tratamiento
                </span>
                <span className="text-[10px] text-slate-400">Evaluación inicial</span>
              </div>
              <div className="h-64 sm:h-72 p-2 flex items-center justify-center bg-black">
                {registro.foto_antes ? (
                  <img
                    src={registro.foto_antes}
                    alt="Antes"
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : (
                  <div className="text-center text-slate-500 text-xs">
                    <Camera className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    Sin fotografía de registro inicial
                  </div>
                )}
              </div>
            </div>

            {/* Después */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-between">
              <div className="p-3 bg-emerald-950/40 border-b border-emerald-900/40 flex items-center justify-between">
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Foto DESPUÉS del Tratamiento
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold">Respuesta terapéutica</span>
              </div>
              <div className="h-64 sm:h-72 p-2 flex items-center justify-center bg-black">
                {registro.foto_despues ? (
                  <img
                    src={registro.foto_despues}
                    alt="Después"
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : (
                  <div className="text-center text-slate-500 text-xs">
                    <Camera className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    Sin fotografía post-tratamiento
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Treatment Summary Bar */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs space-y-1.5">
            <span className="font-bold text-amber-300 block text-[11px] uppercase tracking-wider">
              Tratamiento Aplicado en {registro.especialidad}:
            </span>
            <p className="text-slate-200 leading-relaxed font-medium">{registro.tratamiento}</p>
            {registro.notas_adicionales && (
              <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-700">
                <strong>Notas clínicas:</strong> {registro.notas_adicionales}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
          >
            Cerrar Visualizador
          </button>
        </div>
      </div>
    </div>
  );
};
