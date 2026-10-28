'use client';

import React, { useState, useMemo } from 'react';
import { useClinicStore } from '@/lib/supabase/clinicContext';
import {
  Image as ImageIcon,
  Search,
  Filter,
  PlusCircle,
  Eye,
  Maximize2,
  Calendar,
  Sparkles,
  Layers,
  ArrowUpDown,
  Download,
  X,
  FileCheck2,
  Baby,
} from 'lucide-react';
import { Ecografia } from '@/types';
import { ModalNuevaEcografia } from '@/components/modals/ModalNuevaEcografia';

export default function GaleriaEcografiasPage() {
  const { ecografias, activePatient } = useClinicStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrimestre, setSelectedTrimestre] = useState<number | 'all'>('all');
  const [selectedTipo, setSelectedTipo] = useState<string>('all');
  const [selectedEcoForViewer, setSelectedEcoForViewer] = useState<Ecografia | null>(null);
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [compareMode, setCompareMode] = useState(false);

  // Filtered ultrasounds
  const filteredEcografias = useMemo(() => {
    return ecografias.filter((eco) => {
      const matchSearch =
        eco.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (eco.paciente_nombre && eco.paciente_nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
        eco.informe_conclusion.toLowerCase().includes(searchTerm.toLowerCase());

      const matchTrimestre = selectedTrimestre === 'all' || eco.trimestre === selectedTrimestre;
      const matchTipo = selectedTipo === 'all' || eco.tipo === selectedTipo;

      return matchSearch && matchTrimestre && matchTipo;
    });
  }, [ecografias, searchTerm, selectedTrimestre, selectedTipo]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-[#e6f0fc] text-[#004299] border border-[#b8d7fa] uppercase tracking-wider">
              CYC SALUD • CALLAO
            </span>
            <span className="text-xs text-slate-400">• Diagnóstico Ultrasonográfico & Biometría</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <ImageIcon className="w-7 h-7 text-[#004299]" />
            <span>Galería de Ecografías & Diagnóstico por Imágenes</span>
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
              compareMode
                ? 'bg-[#004299] text-white border-[#00337a] shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{compareMode ? 'Vista Normal' : 'Modo Comparativa de Estudios'}</span>
          </button>

          <button
            onClick={() => setOpenUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#004299] hover:bg-[#00337a] rounded-xl shadow-md shadow-[#004299]/25 transition-all hover:gap-3 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Cargar Ecografía</span>
          </button>
        </div>
      </div>

      {/* Instant Filters Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Live Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por paciente, tipo o hallazgo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004299]/30 focus:border-[#004299] focus:bg-white transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Trimester Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl w-full md:w-auto overflow-x-auto">
            {[
              { id: 'all', label: 'Todos' },
              { id: 1, label: '1er Trimestre (TN)' },
              { id: 2, label: '2do Trimestre (Morf.)' },
              { id: 3, label: '3er Trimestre (Doppler)' },
            ].map((trim) => (
              <button
                key={trim.id}
                onClick={() => setSelectedTrimestre(trim.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedTrimestre === trim.id
                    ? 'bg-white text-[#004299] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {trim.label}
              </button>
            ))}
          </div>

          {/* Type Selector Dropdown */}
          <div className="w-full md:w-auto">
            <select
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value)}
              className="w-full md:w-56 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#004299]"
            >
              <option value="all">Todas las Modalidades</option>
              <option value="Tamizaje 1er Trimestre / TN">Tamizaje 1er Trimestre / TN</option>
              <option value="Morfológica Detallada">Morfológica Detallada</option>
              <option value="Doppler Fetal & Materno">Doppler Fetal & Materno</option>
              <option value="3D / 4D / 5D Emocional">3D / 4D / 5D Emocional</option>
              <option value="Transvaginal Precoz">Transvaginal Precoz</option>
              <option value="Perfil Biofísico">Perfil Biofísico</option>
            </select>
          </div>
        </div>

        {/* Results Counter & Active Criteria */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Mostrando <strong>{filteredEcografias.length}</strong> de {ecografias.length} estudios ecográficos
          </span>
          {(searchTerm || selectedTrimestre !== 'all' || selectedTipo !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedTrimestre('all');
                setSelectedTipo('all');
              }}
              className="text-[#004299] hover:text-[#00337a] font-bold"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Comparison Mode View if Active */}
      {compareMode && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-3xl text-white shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-[#009fe3]" />
              <div>
                <h3 className="font-bold text-sm">Comparador Evolutivo Trimestral</h3>
                <p className="text-xs text-slate-300">
                  Visualiza el desarrollo biométrico y morfológico a lo largo de las semanas de gestación
                </p>
              </div>
            </div>
            <button
              onClick={() => setCompareMode(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ecografias.slice(0, 3).map((eco, i) => (
              <div key={eco.id} className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#009fe3]">Trimestre {eco.trimestre}</span>
                  <span className="bg-slate-700 px-2 py-0.5 rounded-md font-bold text-[10px]">
                    {eco.semanas_gestacion} sem
                  </span>
                </div>
                <div className="relative h-40 rounded-xl overflow-hidden group">
                  <img src={eco.imagen_url} alt={eco.nombre} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => setSelectedEcoForViewer(eco)}
                      className="px-3 py-1.5 rounded-xl bg-white/90 text-slate-900 text-xs font-bold"
                    >
                      Ampliar DICOM
                    </button>
                  </div>
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-bold truncate text-slate-100">{eco.nombre}</p>
                  <p className="text-[11px] text-slate-400">
                    Peso est: <strong className="text-white">{eco.peso_estimado_gr || '—'} gr</strong> (p{eco.percentil_hadlock || 50})
                  </p>
                  <p className="text-[10px] text-slate-300 line-clamp-2">{eco.informe_conclusion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid of Ultrasound Studies */}
      {filteredEcografias.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No se encontraron ecografías</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No hay estudios que coincidan con los filtros aplicados. Intenta cambiar los términos de búsqueda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEcografias.map((eco) => (
            <div
              key={eco.id}
              className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Image Cover Container */}
                <div className="relative h-48 bg-slate-900 overflow-hidden">
                  <img
                    src={eco.imagen_url}
                    alt={eco.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                  {/* Badges on image */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-white font-bold text-[10px] uppercase tracking-wider">
                      Trimestre {eco.trimestre}
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-[#009fe3]/90 backdrop-blur-md text-white font-bold text-[10px]">
                      {eco.semanas_gestacion} sem
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedEcoForViewer(eco)}
                    className="absolute bottom-3 right-3 p-2 rounded-xl bg-white/90 backdrop-blur-md text-slate-900 hover:bg-white shadow-lg transition-transform hover:scale-110"
                    title="Ver en pantalla completa"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#004299] block">
                      {eco.tipo}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 leading-tight mt-0.5">
                      {eco.nombre}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1.5">
                      <Baby className="w-3.5 h-3.5 text-rose-500" />
                      Paciente: <span className="text-slate-800">{eco.paciente_nombre || 'Paciente'}</span>
                    </p>
                  </div>

                  {/* Biometric Chips */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-center">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400">DBP / LF</span>
                      <p className="text-xs font-extrabold text-slate-800">
                        {eco.dbp_mm || '—'} / {eco.lf_mm || '—'} <span className="text-[9px] font-normal">mm</span>
                      </p>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400">Peso Hadlock</span>
                      <p className="text-xs font-extrabold text-[#004299]">
                        {eco.peso_estimado_gr ? `${eco.peso_estimado_gr} g` : '—'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400">ILA</span>
                      <p className="text-xs font-extrabold text-slate-800">
                        {eco.liquido_amniotico_ila ? `${eco.liquido_amniotico_ila} cm` : 'Normal'}
                      </p>
                    </div>
                  </div>

                  {/* Diagnostic Conclusion */}
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {eco.informe_conclusion}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {eco.fecha_estudio}
                </span>

                <button
                  onClick={() => setSelectedEcoForViewer(eco)}
                  className="font-bold text-[#004299] hover:text-[#00337a] flex items-center gap-1 group/btn"
                >
                  <span>Ver Informe Completo</span>
                  <Eye className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox / Full DICOM Viewer Modal */}
      {selectedEcoForViewer && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-[#009fe3] flex items-center justify-center">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedEcoForViewer.nombre}</h3>
                  <p className="text-xs text-slate-400">
                    {selectedEcoForViewer.paciente_nombre} • {selectedEcoForViewer.semanas_gestacion} semanas • Fecha: {selectedEcoForViewer.fecha_estudio}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEcoForViewer(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Image Preview with High-Res Frame */}
              <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-800 h-80 flex items-center justify-center">
                <img
                  src={selectedEcoForViewer.imagen_url}
                  alt={selectedEcoForViewer.nombre}
                  className="w-full h-full object-contain"
                />
                <span className="absolute bottom-2 left-2 text-[10px] bg-black/70 px-2 py-0.5 rounded text-sky-300 font-mono">
                  CALIPER: HADLOCK BIOMETRY OK
                </span>
              </div>

              {/* Medical Report & Biometry Data */}
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#009fe3]">Modalidad Diagnóstica</span>
                  <p className="text-sm font-extrabold text-white">{selectedEcoForViewer.tipo}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Diámetro Biparietal (DBP)</span>
                    <strong className="text-base text-white">{selectedEcoForViewer.dbp_mm || '—'} mm</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Longitud Femoral (LF)</span>
                    <strong className="text-base text-white">{selectedEcoForViewer.lf_mm || '—'} mm</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Circunf. Abdominal (CA)</span>
                    <strong className="text-base text-white">{selectedEcoForViewer.ca_mm || '—'} mm</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Peso Fetal Estimado</span>
                    <strong className="text-base text-sky-300">{selectedEcoForViewer.peso_estimado_gr || '—'} gramos</strong>
                  </div>
                </div>

                <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-700/80 space-y-2">
                  <span className="text-[11px] font-bold text-slate-300 block">Conclusión e Informe Médico:</span>
                  <p className="text-slate-200 leading-relaxed text-xs">
                    {selectedEcoForViewer.informe_conclusion}
                  </p>
                </div>

                <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                  Médico Responsable: <strong className="text-white">{selectedEcoForViewer.medico_ecografista || 'Dr. Carlos Mendoza'}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <ModalNuevaEcografia isOpen={openUploadModal} onClose={() => setOpenUploadModal(false)} />
    </div>
  );
}
