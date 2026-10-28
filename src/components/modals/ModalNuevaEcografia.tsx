'use client';

import React, { useState, useEffect } from 'react';
import { useClinicStore } from '@/lib/supabase/clinicContext';
import { X, Image as ImageIcon, Calculator, Sparkles, Check } from 'lucide-react';
import { Ecografia } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_ULTRASOUND_IMAGES = [
  'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=800&q=80',
];

export const ModalNuevaEcografia: React.FC<Props> = ({ isOpen, onClose }) => {
  const { activePatient, pacientes, addEcografia } = useClinicStore();

  const [pacienteId, setPacienteId] = useState('');
  const [nombre, setNombre] = useState('Ecografía Morfológica de Alta Resolución');
  const [tipo, setTipo] = useState<Ecografia['tipo']>('Morfológica Detallada');
  const [trimestre, setTrimestre] = useState<1 | 2 | 3>(2);
  const [semanasGestacion, setSemanasGestacion] = useState<number>(22);
  const [fechaEstudio, setFechaEstudio] = useState(new Date().toISOString().split('T')[0]);

  // Biometría
  const [dbpMm, setDbpMm] = useState<number>(53.0);
  const [lfMm, setLfMm] = useState<number>(37.5);
  const [caMm, setCaMm] = useState<number>(172.0);
  const [pesoEstimadoGr, setPesoEstimadoGr] = useState<number>(470);
  const [liquidoAmnioticoIla, setLiquidoAmnioticoIla] = useState<number>(13.5);
  const [placentaPosicion, setPlacentaPosicion] = useState('Fúndica Posterior Grado I');
  const [imagenUrl, setImagenUrl] = useState(SAMPLE_ULTRASOUND_IMAGES[1]);
  const [informeConclusion, setInformeConclusion] = useState(
    'Feto único vivo en situación longitudinal, cefálico. Anatomía intracraneal, cuatro cavidades cardíacas y extremidades sin hallazgos patológicos.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activePatient) {
      setPacienteId(activePatient.id);
      setSemanasGestacion(20);
    }
  }, [activePatient, isOpen]);

  // Dynamic Hadlock weight estimation approximation
  useEffect(() => {
    if (caMm > 0 && lfMm > 0) {
      // Simplified Hadlock 2-variable approximation
      const estimated = Math.round(
        Math.pow(10, 1.304 + 0.05282 * (caMm / 10) + 0.18 * (lfMm / 10) - 0.003984 * (caMm / 10) * (lfMm / 10))
      );
      if (estimated > 20 && estimated < 5500) {
        setPesoEstimadoGr(estimated);
      }
    }
  }, [caMm, lfMm]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pacienteId) return;

    setIsSubmitting(true);
    try {
      await addEcografia({
        paciente_id: pacienteId,
        nombre,
        tipo,
        trimestre,
        semanas_gestacion: Number(semanasGestacion),
        fecha_estudio: fechaEstudio,
        dbp_mm: Number(dbpMm),
        lf_mm: Number(lfMm),
        ca_mm: Number(caMm),
        peso_estimado_gr: Number(pesoEstimadoGr),
        percentil_hadlock: 50,
        liquido_amniotico_ila: Number(liquidoAmnioticoIla),
        placenta_posicion: placentaPosicion,
        imagen_url: imagenUrl,
        informe_conclusion: informeConclusion,
        medico_ecografista: 'Dr. Carlos Mendoza (Especialista en Ecografía & Ultrasonografía)',
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
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">Subir Estudio Ecográfico</h3>
              <p className="text-xs text-sky-100">Carga de imágenes ultrasonográficas y reporte diagnóstico</p>
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
          {/* Paciente y Estudio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Paciente</label>
              <select
                value={pacienteId}
                onChange={(e) => setPacienteId(e.target.value)}
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
              <label className="block font-bold text-slate-700 mb-1">Nombre del Estudio</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                required
              />
            </div>
          </div>

          {/* Tipo de Ecografía, Trimestre y Semanas */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Modalidad</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
              >
                <option value="Tamizaje 1er Trimestre / TN">Tamizaje 1er Trimestre / TN</option>
                <option value="Morfológica Detallada">Morfológica Detallada</option>
                <option value="Doppler Fetal & Materno">Doppler Fetal & Materno</option>
                <option value="3D / 4D / 5D Emocional">3D / 4D / 5D Emocional</option>
                <option value="Transvaginal Precoz">Transvaginal Precoz</option>
                <option value="Perfil Biofísico">Perfil Biofísico</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Trimestre</label>
              <select
                value={trimestre}
                onChange={(e) => setTrimestre(parseInt(e.target.value) as 1 | 2 | 3)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
              >
                <option value={1}>1er Trimestre</option>
                <option value={2}>2do Trimestre</option>
                <option value={3}>3er Trimestre</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Semanas Eco</label>
              <input
                type="number"
                step="0.1"
                value={semanasGestacion}
                onChange={(e) => setSemanasGestacion(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-[#004299]"
                required
              />
            </div>
          </div>

          {/* Biometría Fetal Card */}
          <div className="bg-[#edf5fd] p-4 rounded-2xl border border-[#bcdbfc] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#004299] flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-[#004299]" />
                Biometría Fetal Ultrasonográfica
              </span>
              <span className="text-[10px] bg-[#e6f0fc] text-[#004299] border border-[#bcdbfc] font-bold px-2 py-0.5 rounded-full">
                Fórmula Hadlock Auto
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">DBP (mm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={dbpMm}
                  onChange={(e) => setDbpMm(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">LF (mm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={lfMm}
                  onChange={(e) => setLfMm(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">CA (mm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={caMm}
                  onChange={(e) => setCaMm(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Peso Est. (gr)</label>
                <input
                  type="number"
                  value={pesoEstimadoGr}
                  onChange={(e) => setPesoEstimadoGr(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-[#bcdbfc] rounded-xl font-bold text-[#004299]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Índice Líquido Amniótico (ILA cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={liquidoAmnioticoIla}
                  onChange={(e) => setLiquidoAmnioticoIla(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800"
                />
                <span className="text-[10px] text-slate-400">Normal: 8 a 18 cm</span>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Placenta & Grado</label>
                <input
                  type="text"
                  value={placentaPosicion}
                  onChange={(e) => setPlacentaPosicion(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Imagen selector */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Imagen Ecográfica (Seleccionar muestra o URL)
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {SAMPLE_ULTRASOUND_IMAGES.map((img, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setImagenUrl(img)}
                  className={`relative rounded-xl overflow-hidden h-16 border-2 transition-all ${
                    imagenUrl === img ? 'border-[#004299] ring-2 ring-blue-200' : 'border-slate-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Eco sample" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <input
              type="url"
              value={imagenUrl}
              onChange={(e) => setImagenUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-mono text-[11px]"
            />
          </div>

          {/* Informe de Conclusión */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Informe Diagnóstico y Conclusión
            </label>
            <textarea
              rows={2}
              value={informeConclusion}
              onChange={(e) => setInformeConclusion(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 resize-none"
              required
            />
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
              <span>{isSubmitting ? 'Guardando...' : 'Guardar en Galería'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
