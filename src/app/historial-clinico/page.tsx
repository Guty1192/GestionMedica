'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useClinicStore } from '@/lib/supabase/clinicContext';
import { EspecialidadMedica, RegistroHistorial } from '@/types';
import { generateUltrasoundPdf } from '@/lib/pdf/generateUltrasoundPdf';
import {
  Users,
  Search,
  Filter,
  PlusCircle,
  FileCheck2,
  Download,
  Camera,
  Stethoscope,
  HeartPulse,
  ImageIcon,
  Sparkles,
  Phone,
  Mail,
  Eye,
  Calendar,
  Trash2,
  ExternalLink,
  ChevronRight,
  FileText,
  X,
  UserCheck,
  Pencil,
} from 'lucide-react';
import { ModalNuevoRegistroHistorial } from '@/components/modals/ModalNuevoRegistroHistorial';
import { ModalInformeEcografico } from '@/components/modals/ModalInformeEcografico';
import { ModalFotosAntesDespues } from '@/components/modals/ModalFotosAntesDespues';
import { ModalBuscadorPacientes } from '@/components/modals/ModalBuscadorPacientes';
import { ModalTratamientosPaciente } from '@/components/modals/ModalTratamientosPaciente';
import { ModalEditarPaciente, PatientEditableData } from '@/components/modals/ModalEditarPaciente';
import { ModalEditarTratamiento } from '@/components/modals/ModalEditarTratamiento';

function HistorialClinicoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { historial, pacientes, deleteRegistroHistorial, setActivePatientId } = useClinicStore();

  const urlDni = searchParams.get('dni') || '';
  const urlQ = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(urlDni || urlQ || '');
  const [searchField, setSearchField] = useState<'todo' | 'dni' | 'nombre' | 'tratamiento'>(
    urlDni ? 'dni' : 'todo'
  );
  const [selectedEspecialidad, setSelectedEspecialidad] = useState<string>('todas');
  const [openModalRegistro, setOpenModalRegistro] = useState(false);
  const [openSearchModal, setOpenSearchModal] = useState(false);

  // Sync state if URL search params change (e.g. from Header search bar or dropdown)
  useEffect(() => {
    if (urlDni) {
      setSearchQuery(urlDni);
      setSearchField('dni');
    } else if (urlQ) {
      setSearchQuery(urlQ);
    }
  }, [urlDni, urlQ]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchField('todo');
    router.replace('/historial-clinico');
  };

  // Active Modals
  const [selectedEcoRecord, setSelectedEcoRecord] = useState<RegistroHistorial | null>(null);
  const [selectedPhotosRecord, setSelectedPhotosRecord] = useState<RegistroHistorial | null>(null);
  const [selectedPatientDniForTreatments, setSelectedPatientDniForTreatments] = useState<string | null>(null);
  const [patientForNewTreatment, setPatientForNewTreatment] = useState<{
    dni: string;
    nombres_completos: string;
    celular?: string;
    correo?: string;
    edad?: number;
  } | null>(null);
  const [editingPatient, setEditingPatient] = useState<PatientEditableData | null>(null);
  const [editingTreatment, setEditingTreatment] = useState<RegistroHistorial | null>(null);
  const [downloadingPdfId, setDownloadingPdfId] = useState<string | null>(null);

  const handleOpenPatientTreatments = (dni: string) => {
    setSelectedPatientDniForTreatments(dni);
  };

  const handleOpenEditPatient = (patient: PatientEditableData) => {
    setEditingPatient(patient);
  };

  const handleAddNewTreatmentForPatient = (patientData: {
    dni: string;
    nombres_completos: string;
    celular?: string;
    correo?: string;
    edad?: number;
  }) => {
    setPatientForNewTreatment(patientData);
    setOpenModalRegistro(true);
  };

  const handleDownloadPdf = async (reg: RegistroHistorial) => {
    setDownloadingPdfId(reg.id);
    try {
      await generateUltrasoundPdf(reg);
    } catch (err) {
      console.error('Error generating ultrasound PDF:', err);
    } finally {
      setDownloadingPdfId(null);
    }
  };

  // Grouped Patients with Treatments: when doctor searches by DNI or Name, ONLY that patient appears, and multiple treatments belong to the same patient table entry!
  const { groupedPatients, matchedPatient, isPatientSearch, totalTratamientosCount } = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    // 1. Identify matching DNIs if searching
    const targetDnis: Set<string> | null = q ? new Set<string>() : null;

    if (targetDnis) {
      historial.forEach((item) => {
        const matchDni = item.dni.toLowerCase().includes(q);
        const matchName = item.nombres_completos.toLowerCase().includes(q);
        const matchTreat =
          searchField === 'tratamiento' || searchField === 'todo'
            ? item.tratamiento.toLowerCase().includes(q)
            : false;

        if (searchField === 'dni') {
          if (matchDni) targetDnis.add(item.dni);
        } else if (searchField === 'nombre') {
          if (matchName) targetDnis.add(item.dni);
        } else if (searchField === 'tratamiento') {
          if (matchTreat) targetDnis.add(item.dni);
        } else {
          if (matchDni || matchName || matchTreat) {
            targetDnis.add(item.dni);
          }
        }
      });

      pacientes.forEach((p) => {
        const matchDni = p.documento.toLowerCase().includes(q);
        const matchName = p.nombre.toLowerCase().includes(q);
        if (searchField === 'dni' && matchDni) targetDnis.add(p.documento);
        else if (searchField === 'nombre' && matchName) targetDnis.add(p.documento);
        else if (searchField === 'todo' && (matchDni || matchName)) targetDnis.add(p.documento);
      });
    }

    // 2. Collect unique patient DNIs in order
    const dniList: string[] = [];
    const seenDni = new Set<string>();

    historial.forEach((item) => {
      if (!seenDni.has(item.dni)) {
        if (!targetDnis || targetDnis.has(item.dni)) {
          seenDni.add(item.dni);
          dniList.push(item.dni);
        }
      }
    });

    if (targetDnis) {
      targetDnis.forEach((dni) => {
        if (!seenDni.has(dni)) {
          seenDni.add(dni);
          dniList.push(dni);
        }
      });
    }

    // 3. For each unique patient DNI, build group with ALL their treatments
    let totalCount = 0;
    const groups: {
      dni: string;
      nombres_completos: string;
      celular: string;
      correo: string;
      edad: number;
      tratamientos: RegistroHistorial[];
      totalHistorico: number;
    }[] = [];

    dniList.forEach((dni) => {
      const allPatientTreatments = historial.filter((h) => h.dni === dni);
      const patFromStore = pacientes.find((p) => p.documento === dni);
      const latestRec = allPatientTreatments[0];

      // Filter treatments by selected specialty tab
      const visibleTreatments = allPatientTreatments.filter(
        (t) => selectedEspecialidad === 'todas' || t.especialidad === selectedEspecialidad
      );

      // If specialty filter is active and patient has 0 in that specialty, skip unless specifically searched
      if (selectedEspecialidad !== 'todas' && visibleTreatments.length === 0 && !targetDnis) {
        return;
      }

      totalCount += visibleTreatments.length;

      groups.push({
        dni,
        nombres_completos: latestRec?.nombres_completos || patFromStore?.nombre || 'Paciente',
        celular: latestRec?.celular || patFromStore?.telefono || '',
        correo: latestRec?.correo || patFromStore?.email || '',
        edad: latestRec?.edad || patFromStore?.edad || 0,
        tratamientos: visibleTreatments,
        totalHistorico: allPatientTreatments.length,
      });
    });

    // 4. Extract single matched patient details for top banner
    let patientDetails: {
      nombre: string;
      dni: string;
      edad: number;
      celular: string;
      correo: string;
      totalRecords: number;
    } | null = null;

    if (targetDnis && targetDnis.size === 1) {
      const targetDni = Array.from(targetDnis)[0];
      const foundGrp = groups.find((g) => g.dni === targetDni);
      const fromHist = historial.find((h) => h.dni === targetDni);
      const fromPac = pacientes.find((p) => p.documento === targetDni);

      const allCount = historial.filter((h) => h.dni === targetDni).length;

      patientDetails = {
        nombre: foundGrp?.nombres_completos || fromHist?.nombres_completos || fromPac?.nombre || 'Paciente',
        dni: targetDni,
        edad: foundGrp?.edad || fromHist?.edad || fromPac?.edad || 0,
        celular: foundGrp?.celular || fromHist?.celular || fromPac?.telefono || '',
        correo: foundGrp?.correo || fromHist?.correo || fromPac?.email || '',
        totalRecords: allCount,
      };
    }

    return {
      groupedPatients: groups,
      matchedPatient: patientDetails,
      isPatientSearch: !!q,
      totalTratamientosCount: totalCount,
    };
  }, [historial, pacientes, searchQuery, searchField, selectedEspecialidad]);

  // Counts by specialty (scoped to matched patient if one is searched)
  const countConsultaGeneral = useMemo(() => {
    const base = matchedPatient ? historial.filter((h) => h.dni === matchedPatient.dni) : historial;
    return base.filter((h) => h.especialidad === 'Consulta General').length;
  }, [historial, matchedPatient]);

  const countGinecologia = useMemo(() => {
    const base = matchedPatient ? historial.filter((h) => h.dni === matchedPatient.dni) : historial;
    return base.filter((h) => h.especialidad === 'Ginecología').length;
  }, [historial, matchedPatient]);

  const countEcografia = useMemo(() => {
    const base = matchedPatient ? historial.filter((h) => h.dni === matchedPatient.dni) : historial;
    return base.filter((h) => h.especialidad === 'Ecografía').length;
  }, [historial, matchedPatient]);

  const countOzonoterapia = useMemo(() => {
    const base = matchedPatient ? historial.filter((h) => h.dni === matchedPatient.dni) : historial;
    return base.filter((h) => h.especialidad === 'Ozonoterapia').length;
  }, [historial, matchedPatient]);

  const getEspecialidadBadge = (esp: EspecialidadMedica) => {
    switch (esp) {
      case 'Consulta General':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-extrabold bg-[#ebf4fd] text-[#004299] ring-1 ring-[#cde2fb] shadow-2xs">
            <Stethoscope className="w-3.5 h-3.5 text-[#004299]" />
            Consulta General
          </span>
        );
      case 'Ginecología':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-extrabold bg-pink-100 text-[#e6007e] ring-1 ring-pink-200 shadow-2xs">
            <HeartPulse className="w-3.5 h-3.5 text-[#e6007e]" />
            Ginecología
          </span>
        );
      case 'Ecografía':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-extrabold bg-[#e0f2fe] text-[#009fe3] ring-1 ring-[#bae6fd] shadow-2xs">
            <ImageIcon className="w-3.5 h-3.5 text-[#009fe3]" />
            Ecografía (PDF)
          </span>
        );
      case 'Ozonoterapia':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-extrabold bg-purple-100 text-[#7c3aed] ring-1 ring-purple-200 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#7c3aed]" />
            Ozonoterapia
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Page Header */}
      {/* Top Page Header - Proposal Style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-blue-100 text-[#004299] border border-blue-200 uppercase tracking-wider shadow-xs">
              CYC SALUD • CALLAO
            </span>
            <span className="text-xs text-slate-500">• Historial Clínico Multiespecialidad: Dr. Henry Castañeda</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5 flex items-center gap-2.5">
            <Users className="w-7 h-7 text-[#004299]" />
            <span>Padrón de Pacientes & Historial de Tratamientos</span>
          </h1>
        </div>
      </div>

      {/* 4 Specialties Quick Summary Cards - Proposal Style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Consulta General - Proposal Blue */}
        <button
          onClick={() => setSelectedEspecialidad(selectedEspecialidad === 'Consulta General' ? 'todas' : 'Consulta General')}
          className={`p-4 sm:p-5 rounded-3xl text-left transition-all duration-200 cursor-pointer relative overflow-hidden group shadow-md ${
            selectedEspecialidad === 'Consulta General'
              ? 'bg-[#1e70ba] ring-4 ring-blue-300 scale-[1.02] shadow-xl'
              : 'bg-[#1e70ba] hover:brightness-105 hover:-translate-y-0.5'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 text-white flex items-center justify-center shadow-inner">
              <Stethoscope className="w-5 h-5" />
            </div>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-white/25 text-white border border-white/30 shadow-xs">
              {countConsultaGeneral}
            </span>
          </div>
          <p className="font-extrabold text-sm sm:text-base text-white tracking-tight leading-tight">
            Consulta General
          </p>
          <p className="text-[11px] sm:text-xs mt-1 font-medium text-white/85 leading-snug">
            Evaluación y recetas
          </p>
        </button>

        {/* Card 2: Ginecología - Proposal Rose/Mauve */}
        <button
          onClick={() => setSelectedEspecialidad(selectedEspecialidad === 'Ginecología' ? 'todas' : 'Ginecología')}
          className={`p-4 sm:p-5 rounded-3xl text-left transition-all duration-200 cursor-pointer relative overflow-hidden group shadow-md ${
            selectedEspecialidad === 'Ginecología'
              ? 'bg-[#b85b88] ring-4 ring-pink-300 scale-[1.02] shadow-xl'
              : 'bg-[#b85b88] hover:brightness-105 hover:-translate-y-0.5'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 text-white flex items-center justify-center shadow-inner">
              <HeartPulse className="w-5 h-5" />
            </div>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-white/25 text-white border border-white/30 shadow-xs">
              {countGinecologia}
            </span>
          </div>
          <p className="font-extrabold text-sm sm:text-base text-white tracking-tight leading-tight">
            Ginecología
          </p>
          <p className="text-[11px] sm:text-xs mt-1 font-medium text-white/85 leading-snug">
            Salud de la mujer & PAP
          </p>
        </button>

        {/* Card 3: Ecografía - Proposal Teal/Emerald */}
        <button
          onClick={() => setSelectedEspecialidad(selectedEspecialidad === 'Ecografía' ? 'todas' : 'Ecografía')}
          className={`p-4 sm:p-5 rounded-3xl text-left transition-all duration-200 cursor-pointer relative overflow-hidden group shadow-md ${
            selectedEspecialidad === 'Ecografía'
              ? 'bg-[#318683] ring-4 ring-teal-300 scale-[1.02] shadow-xl'
              : 'bg-[#318683] hover:brightness-105 hover:-translate-y-0.5'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 text-white flex items-center justify-center shadow-inner">
              <ImageIcon className="w-5 h-5" />
            </div>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-white/25 text-white border border-white/30 shadow-xs">
              {countEcografia}
            </span>
          </div>
          <p className="font-extrabold text-sm sm:text-base text-white tracking-tight leading-tight">
            Ecografía
          </p>
          <p className="text-[11px] sm:text-xs mt-1 font-medium text-white/85 leading-snug">
            Con informe & PDF oficial
          </p>
        </button>

        {/* Card 4: Ozonoterapia - Proposal Violet/Purple */}
        <button
          onClick={() => setSelectedEspecialidad(selectedEspecialidad === 'Ozonoterapia' ? 'todas' : 'Ozonoterapia')}
          className={`p-4 sm:p-5 rounded-3xl text-left transition-all duration-200 cursor-pointer relative overflow-hidden group shadow-md ${
            selectedEspecialidad === 'Ozonoterapia'
              ? 'bg-[#5b4e94] ring-4 ring-purple-300 scale-[1.02] shadow-xl'
              : 'bg-[#5b4e94] hover:brightness-105 hover:-translate-y-0.5'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 text-white flex items-center justify-center shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-white/25 text-white border border-white/30 shadow-xs">
              {countOzonoterapia}
            </span>
          </div>
          <p className="font-extrabold text-sm sm:text-base text-white tracking-tight leading-tight">
            Ozonoterapia
          </p>
          <p className="text-[11px] sm:text-xs mt-1 font-medium text-white/85 leading-snug">
            Con fotos Antes y Después
          </p>
        </button>
      </div>

      {/* Exclusive Patient Card when Doctor Searches a Specific Patient */}
      {matchedPatient && (
        <div className="bg-white p-5 rounded-3xl border-2 border-[#004299] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00275c] via-[#004299] to-[#009fe3] text-white font-black text-sm flex items-center justify-center shadow-md flex-shrink-0">
              {matchedPatient.nombre
                .split(' ')
                .slice(0, 2)
                .map((n) => n[0])
                .join('')}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#004299] bg-[#e6f0fc] px-2.5 py-0.5 rounded-full border border-[#bcdbfc] shadow-2xs">
                  Paciente Seleccionado
                </span>
                <h2 className="text-base font-black text-slate-900">{matchedPatient.nombre}</h2>
                <span className="font-mono text-xs font-black bg-white text-[#004299] border-2 border-[#004299] px-2.5 py-0.5 rounded-lg shadow-2xs">
                  DNI: {matchedPatient.dni}
                </span>
                {matchedPatient.edad > 0 && (
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                    {matchedPatient.edad} años
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5 flex-wrap">
                {matchedPatient.celular && (
                  <span className="flex items-center gap-1 font-medium text-slate-800">
                    <Phone className="w-3.5 h-3.5 text-[#004299]" />
                    {matchedPatient.celular}
                  </span>
                )}
                {matchedPatient.correo && (
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <Mail className="w-3.5 h-3.5 text-[#004299]" />
                    {matchedPatient.correo}
                  </span>
                )}
                <span className="font-bold text-[#004299]">
                  • Mostrando únicamente los {matchedPatient.totalRecords}{' '}
                  {matchedPatient.totalRecords === 1 ? 'tratamiento registrado' : 'tratamientos registrados'} de este paciente
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() =>
                handleAddNewTreatmentForPatient({
                  dni: matchedPatient.dni,
                  nombres_completos: matchedPatient.nombre,
                  celular: matchedPatient.celular,
                  correo: matchedPatient.correo,
                  edad: matchedPatient.edad,
                })
              }
              className="flex items-center gap-1.5 px-4 py-2 bg-[#004299] hover:bg-[#00337a] text-white text-xs font-black rounded-xl shadow-md shadow-blue-200 transition-all hover:scale-105 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Agregar Tratamiento a este Paciente</span>
            </button>

            <button
              onClick={() =>
                handleOpenEditPatient({
                  dni: matchedPatient.dni,
                  nombres_completos: matchedPatient.nombre,
                  celular: matchedPatient.celular,
                  correo: matchedPatient.correo,
                  edad: matchedPatient.edad,
                })
              }
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl border border-amber-200 transition-colors cursor-pointer"
              title="Editar datos personales, DNI, teléfono y correo del paciente"
            >
              <Pencil className="w-3.5 h-3.5 text-amber-600" />
              <span>Editar Datos</span>
            </button>

            <button
              onClick={handleClearSearch}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors cursor-pointer"
              title="Quitar filtro y ver todos los pacientes"
            >
              ✕ Ver Todos los Pacientes
            </button>
          </div>
        </div>
      )}

      {/* Multiple Patients Filter Notification */}
      {!matchedPatient && isPatientSearch && searchQuery && groupedPatients.length > 0 && (
        <div className="p-3.5 bg-blue-50/90 rounded-2xl border border-blue-200 flex items-center justify-between text-xs animate-in fade-in">
          <span className="font-bold text-[#004299] flex items-center gap-2">
            <Search className="w-4 h-4" />
            <span>
              Filtrando únicamente pacientes que coinciden con &quot;<strong>{searchQuery}</strong>&quot; ({groupedPatients.length} pacientes • {totalTratamientosCount} tratamientos)
            </span>
          </span>
          <button
            onClick={handleClearSearch}
            className="px-3 py-1 bg-white hover:bg-slate-100 text-[#004299] text-xs font-bold rounded-xl border border-blue-200 transition-colors cursor-pointer"
          >
            ✕ Quitar Filtro (Ver Todos)
          </button>
        </div>
      )}

      {/* Primary Table: Patient Medical History with treatments directly in the same patient table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/80 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
              {matchedPatient
                ? `Tabla de ${matchedPatient.nombre} (${matchedPatient.totalRecords} tratamientos en su historial)`
                : `Tabla de Pacientes y Tratamientos (${groupedPatients.length} pacientes • ${totalTratamientosCount} tratamientos)`}
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {matchedPatient
                ? '• Filtrado exclusivo por DNI ' + matchedPatient.dni
                : '• Todos los tratamientos se integran en la misma tabla del paciente'}
            </span>
          </div>

          <span className="text-[11px] text-slate-500 font-medium">
            {matchedPatient
              ? `Historial clínico completo de ${matchedPatient.nombre}`
              : 'Mostrando DNI, Nombres, Celular, Correo, Edad y todos los tratamientos en la misma fila del paciente'}
          </span>
        </div>

        {groupedPatients.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto border border-slate-200">
              <Search className="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                {searchQuery
                  ? `No se encontraron tratamientos para "${searchQuery}"`
                  : 'No hay pacientes en el historial con la especialidad seleccionada.'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? `El paciente con el DNI o nombre ingresado aún no tiene tratamientos registrados en la tabla.`
                  : 'Seleccione otra especialidad o agregue una nueva consulta.'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-300"
                >
                  ✕ Ver Todos los Pacientes
                </button>
              )}
              <button
                onClick={() => {
                  const isDni = /^\d+$/.test(searchQuery.trim());
                  handleAddNewTreatmentForPatient({
                    dni: isDni ? searchQuery.trim() : '',
                    nombres_completos: !isDni ? searchQuery.trim() : '',
                  });
                }}
                className="px-4 py-2 rounded-xl text-xs font-black bg-[#004299] hover:bg-[#00337a] text-white shadow-md shadow-blue-200 transition-all hover:scale-105 cursor-pointer flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Registrar Primer Tratamiento para {searchQuery || 'Nuevo Paciente'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-black tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 w-[240px]">DNI / Paciente</th>
                  <th className="py-3.5 px-4 w-[180px]">Contacto & Edad</th>
                  <th className="py-3.5 px-4 min-w-[380px]">Tratamientos Realizados (Misma Tabla del Paciente)</th>
                  <th className="py-3.5 px-4 text-right w-[150px]">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 bg-white">
                {groupedPatients.map((pacienteGroup) => {
                  const tratamientosCount = pacienteGroup.tratamientos.length;

                  return (
                    <tr
                      key={pacienteGroup.dni}
                      className="hover:bg-slate-50/70 transition-colors align-top"
                    >
                      {/* Column 1: DNI & Paciente */}
                      <td className="py-4 px-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00275c] to-[#004299] text-white font-black text-xs flex items-center justify-center shadow-xs flex-shrink-0">
                            {pacienteGroup.nombres_completos
                              .split(' ')
                              .slice(0, 2)
                              .map((n) => n[0])
                              .join('')}
                          </div>
                          <div>
                            <span className="font-mono text-[11px] font-black text-[#004299] bg-[#e6f0fc] px-2 py-0.5 rounded-md border border-[#cde2fb]">
                              DNI: {pacienteGroup.dni}
                            </span>
                          </div>
                        </div>

                        <div>
                          <p className="font-black text-slate-900 text-xs leading-tight tracking-tight">
                            {pacienteGroup.nombres_completos}
                          </p>
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#004299] bg-[#ebf4fd] px-2 py-0.5 rounded-full border border-[#bcdbfc]">
                              <FileText className="w-2.5 h-2.5 text-[#004299]" />
                              <span>{tratamientosCount} {tratamientosCount === 1 ? 'tratamiento' : 'tratamientos'}</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                          <button
                            onClick={() => handleOpenEditPatient(pacienteGroup)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[10px] rounded-lg border border-amber-300 transition-all cursor-pointer shadow-2xs"
                            title="Editar datos del paciente (DNI, nombres, celular, correo, edad)"
                          >
                            <Pencil className="w-3 h-3 text-amber-600" />
                            <span>Editar</span>
                          </button>
                        </div>
                      </td>

                      {/* Column 2: Contacto & Edad */}
                      <td className="py-4 px-4 space-y-1.5 text-slate-600">
                        {pacienteGroup.edad > 0 && (
                          <div className="font-bold text-slate-900 text-xs">
                            {pacienteGroup.edad} años
                          </div>
                        )}

                        {pacienteGroup.celular ? (
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-800">
                            <Phone className="w-3.5 h-3.5 text-[#004299] flex-shrink-0" />
                            <span>{pacienteGroup.celular}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Sin celular</span>
                        )}

                        {pacienteGroup.correo ? (
                          <div
                            className="flex items-center gap-1 text-[11px] text-slate-600 truncate max-w-[170px]"
                            title={pacienteGroup.correo}
                          >
                            <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{pacienteGroup.correo}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Sin correo</span>
                        )}
                      </td>

                      {/* Column 3: ALL TREATMENTS IN THE SAME PATIENT TABLE ROW */}
                      <td className="py-4 px-4">
                        {tratamientosCount === 0 ? (
                          <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
                            <p className="text-xs text-slate-500 font-medium">
                              Aún no hay tratamientos registrados para esta especialidad.
                            </p>
                            <button
                              onClick={() =>
                                handleAddNewTreatmentForPatient({
                                  dni: pacienteGroup.dni,
                                  nombres_completos: pacienteGroup.nombres_completos,
                                  celular: pacienteGroup.celular,
                                  correo: pacienteGroup.correo,
                                  edad: pacienteGroup.edad,
                                })
                              }
                              className="px-3 py-1.5 bg-[#004299] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#00337a] transition-all cursor-pointer inline-flex items-center gap-1"
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>+ Agregar Primer Tratamiento</span>
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {pacienteGroup.tratamientos.map((t, tIndex) => (
                              <div
                                key={t.id}
                                className="p-3.5 bg-slate-50/90 hover:bg-blue-50/40 rounded-2xl border border-slate-200/90 transition-all space-y-2 group shadow-2xs"
                              >
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-[#004299] bg-[#e6f0fc] px-2 py-0.5 rounded-md border border-[#cde2fb]">
                                      Tratamiento #{tIndex + 1}
                                    </span>
                                    <span className="text-[10px] text-slate-600 font-bold flex items-center gap-1">
                                      <Calendar className="w-3 h-3 text-slate-400" />
                                      {t.fecha_registro}
                                    </span>
                                    {getEspecialidadBadge(t.especialidad)}
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => setEditingTreatment(t)}
                                      className="p-1 text-slate-400 hover:text-[#004299] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                      title="Editar este tratamiento o consulta"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => deleteRegistroHistorial(t.id)}
                                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                                      title="Eliminar este tratamiento"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>

                                {/* Treatment medical indications */}
                                <p className="text-slate-900 text-xs leading-relaxed font-semibold">
                                  {t.tratamiento}
                                </p>

                                {/* Media & Document Buttons for this treatment */}
                                <div className="flex items-center gap-2 pt-1 flex-wrap">
                                  {/* Photos Antes & Despues */}
                                  {(t.foto_antes || t.foto_despues) && (
                                    <button
                                      onClick={() => setSelectedPhotosRecord(t)}
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white hover:bg-purple-50 text-[#7c3aed] border border-purple-200 transition-all font-bold text-[11px] shadow-2xs cursor-pointer"
                                      title="Ver fotos de Antes vs Después"
                                    >
                                      <Camera className="w-3.5 h-3.5 text-[#7c3aed]" />
                                      <span>Fotos Antes/Después</span>
                                    </button>
                                  )}

                                  {/* Clinical Report and PDF for all specialties */}
                                  <button
                                    onClick={() => setSelectedEcoRecord(t)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#edf5fd] hover:bg-[#e2effb] text-[#004299] font-bold text-[11px] border border-[#bcdbfc] transition-colors shadow-2xs cursor-pointer"
                                    title="Ver Informe Médico Detallado"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-[#004299]" />
                                    <span>Informe</span>
                                  </button>

                                  <button
                                    onClick={() => handleDownloadPdf(t)}
                                    disabled={downloadingPdfId === t.id}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#004299] hover:bg-[#00337a] text-white font-extrabold text-[11px] shadow-xs transition-all hover:scale-105 disabled:opacity-60 cursor-pointer"
                                    title="Descargar informe oficial en PDF"
                                  >
                                    {downloadingPdfId === t.id ? (
                                      <>
                                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                                        <span>PDF...</span>
                                      </>
                                    ) : (
                                      <>
                                        <Download className="w-3.5 h-3.5" />
                                        <span>PDF</span>
                                      </>
                                    )}
                                  </button>

                                  {/* Direct button to edit treatment */}
                                  <button
                                    onClick={() => setEditingTreatment(t)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white hover:bg-blue-50 text-[#004299] border border-slate-200 transition-all font-bold text-[11px] shadow-2xs cursor-pointer ml-auto"
                                    title="Modificar el tratamiento médico, receta o informe"
                                  >
                                    <Pencil className="w-3.5 h-3.5 text-[#004299]" />
                                    <span>Editar Tratamiento</span>
                                  </button>
                                </div>
                              </div>
                            ))}

                            {/* Direct Inline Button: Add another treatment to this exact patient in this table! */}
                            <button
                              onClick={() =>
                                handleAddNewTreatmentForPatient({
                                  dni: pacienteGroup.dni,
                                  nombres_completos: pacienteGroup.nombres_completos,
                                  celular: pacienteGroup.celular,
                                  correo: pacienteGroup.correo,
                                  edad: pacienteGroup.edad,
                                })
                              }
                              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 border-2 border-dashed border-[#bcdbfc] hover:border-[#004299] bg-[#f8fbff] hover:bg-[#edf5fd] text-[#004299] font-bold text-xs rounded-xl transition-all cursor-pointer group"
                            >
                              <PlusCircle className="w-3.5 h-3.5 text-[#004299] group-hover:scale-110 transition-transform" />
                              <span>
                                + Agregar Nuevo Tratamiento a {pacienteGroup.nombres_completos.split(' ')[0]} (en esta misma tabla)
                              </span>
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Column 4: Acciones */}
                      <td className="py-4 px-4 text-right space-y-1.5 whitespace-nowrap">
                        <button
                          onClick={() =>
                            handleAddNewTreatmentForPatient({
                              dni: pacienteGroup.dni,
                              nombres_completos: pacienteGroup.nombres_completos,
                              celular: pacienteGroup.celular,
                              correo: pacienteGroup.correo,
                              edad: pacienteGroup.edad,
                            })
                          }
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#004299] hover:bg-[#00337a] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all hover:scale-105 cursor-pointer"
                          title="Agregar tratamiento en esta misma tabla"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>+ Tratamiento</span>
                        </button>

                        <button
                          onClick={() => handleOpenPatientTreatments(pacienteGroup.dni)}
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-xl transition-colors cursor-pointer border border-slate-200"
                          title="Ver resumen y cronología completa"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Resumen ({pacienteGroup.totalHistorico})</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <ModalNuevoRegistroHistorial
        isOpen={openModalRegistro}
        onClose={() => {
          setOpenModalRegistro(false);
          setPatientForNewTreatment(null);
        }}
        initialPatient={patientForNewTreatment}
        onSuccess={(newRec) => {
          if (newRec.especialidad === 'Ecografía') {
            setSelectedEcoRecord(newRec);
          }
        }}
      />

      <ModalTratamientosPaciente
        isOpen={Boolean(selectedPatientDniForTreatments)}
        onClose={() => setSelectedPatientDniForTreatments(null)}
        dni={selectedPatientDniForTreatments}
        onAddNewTreatment={(pat) => handleAddNewTreatmentForPatient(pat)}
        onOpenEcoReport={(rec) => setSelectedEcoRecord(rec)}
        onOpenPhotos={(rec) => setSelectedPhotosRecord(rec)}
      />

      <ModalEditarPaciente
        isOpen={Boolean(editingPatient)}
        onClose={() => setEditingPatient(null)}
        patientData={editingPatient}
      />

      <ModalEditarTratamiento
        isOpen={Boolean(editingTreatment)}
        onClose={() => setEditingTreatment(null)}
        registro={editingTreatment}
      />

      <ModalInformeEcografico
        isOpen={Boolean(selectedEcoRecord)}
        onClose={() => setSelectedEcoRecord(null)}
        registro={selectedEcoRecord}
      />

      <ModalFotosAntesDespues
        isOpen={Boolean(selectedPhotosRecord)}
        onClose={() => setSelectedPhotosRecord(null)}
        registro={selectedPhotosRecord}
      />

      <ModalBuscadorPacientes
        isOpen={openSearchModal}
        onClose={() => setOpenSearchModal(false)}
        onSelectAndRegister={(paciente) => {
          setOpenSearchModal(false);
          handleAddNewTreatmentForPatient({
            dni: paciente.documento,
            nombres_completos: paciente.nombre,
            celular: paciente.telefono,
            correo: paciente.email,
            edad: paciente.edad,
          });
        }}
        onViewTreatments={(paciente) => {
          setOpenSearchModal(false);
          handleOpenPatientTreatments(paciente.documento);
        }}
      />
    </div>
  );
}

export default function HistorialClinicoPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto p-12 text-center text-slate-500">
          <div className="w-8 h-8 border-4 border-[#004299] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-bold">Cargando Historial Clínico de Pacientes...</p>
        </div>
      }
    >
      <HistorialClinicoContent />
    </Suspense>
  );
}
