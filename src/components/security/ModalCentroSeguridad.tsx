'use client';

import React, { useState } from 'react';
import { useSecurity } from '@/lib/security/securityContext';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Eye,
  EyeOff,
  Activity,
  Terminal,
  Lock,
  FileCheck2,
  Cpu,
  X,
  RefreshCw,
  AlertTriangle,
  Info,
} from 'lucide-react';

export const ModalCentroSeguridad: React.FC = () => {
  const {
    isModalOpen,
    closeSecurityModal,
    agents,
    auditLogs,
    privacyMode,
    togglePrivacyMode,
    complianceScore,
    threatsBlocked,
    runIntegrityAudit,
  } = useSecurity();

  const [activeTab, setActiveTab] = useState<'agents' | 'audit' | 'compliance'>('agents');
  const [isRunningAudit, setIsRunningAudit] = useState(false);

  if (!isModalOpen) return null;

  const handleRunAudit = async () => {
    setIsRunningAudit(true);
    await runIntegrityAudit();
    setTimeout(() => {
      setIsRunningAudit(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#0a1628] rounded-3xl border border-[#1e2f4d] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-[#1e2f4d] bg-gradient-to-r from-[#001736] via-[#00275c] to-[#0a1628] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-400/30 text-sky-400 flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white tracking-tight">
                  Centro de Ciberseguridad & Agentes del Sistema
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Activo 24/7
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Monitoreo perimetral, trazabilidad de historias clínicas y cumplimiento Ley N° 29733 (Perú)
              </p>
            </div>
          </div>

          <button
            onClick={closeSecurityModal}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#08101e] border-b border-[#1e2f4d]">
          <div className="bg-[#0e1d33] p-3 rounded-2xl border border-[#1e2f4d]/80">
            <p className="text-[10px] uppercase font-bold text-slate-400">Cumplimiento Médico</p>
            <p className="text-xl font-black text-emerald-400 mt-0.5">{complianceScore}%</p>
            <p className="text-[10px] text-slate-400">Auditoría estándar PHI</p>
          </div>
          <div className="bg-[#0e1d33] p-3 rounded-2xl border border-[#1e2f4d]/80">
            <p className="text-[10px] uppercase font-bold text-slate-400">Agentes Activos</p>
            <p className="text-xl font-black text-sky-400 mt-0.5">{agents.length} Agentes</p>
            <p className="text-[10px] text-slate-400">Protección simultánea</p>
          </div>
          <div className="bg-[#0e1d33] p-3 rounded-2xl border border-[#1e2f4d]/80">
            <p className="text-[10px] uppercase font-bold text-slate-400">Amenazas Bloqueadas</p>
            <p className="text-xl font-black text-amber-400 mt-0.5">{threatsBlocked}</p>
            <p className="text-[10px] text-slate-400">XSS / Ráfagas detenidas</p>
          </div>
          <div className="bg-[#0e1d33] p-3 rounded-2xl border border-[#1e2f4d]/80 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase font-bold text-slate-400">Modo Privacidad Sala</p>
              {privacyMode ? <EyeOff className="w-3.5 h-3.5 text-sky-400" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
            </div>
            <button
              onClick={togglePrivacyMode}
              className={`mt-1 text-xs font-bold px-2 py-1 rounded-lg transition-all ${
                privacyMode
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {privacyMode ? 'Enmascarado ON' : 'Activar Enmascarado'}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-[#1e2f4d] bg-[#0a1628]">
          <button
            onClick={() => setActiveTab('agents')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'agents'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              Agentes Autónomos ({agents.length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'audit'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              Bitácora de Trazabilidad ({auditLogs.length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'compliance'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5" />
              Estándares de Seguridad
            </span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: AGENTES DEL SISTEMA */}
          {activeTab === 'agents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Agentes de software que resguardan la aplicación contra intrusiones, fugas y pérdidas de datos.
                </p>
                <button
                  onClick={handleRunAudit}
                  disabled={isRunningAudit}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-white text-xs font-bold transition-all border border-sky-400/30 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRunningAudit ? 'animate-spin' : ''}`} />
                  <span>Auditar Agentes</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    className="p-4 rounded-2xl bg-[#0e1d33] border border-[#1e2f4d] hover:border-sky-400/40 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-400/20 text-sky-400 flex items-center justify-center font-black text-xs">
                          {agent.name[0]}
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-white leading-tight">{agent.name}</p>
                          <p className="text-[10px] text-sky-400 font-mono">{agent.codename}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        {agent.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{agent.description}</p>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1e2f4d]/80 text-[11px]">
                      {agent.metrics.map((m, idx) => (
                        <div key={idx} className="bg-[#08101e] px-2.5 py-1 rounded-lg border border-[#1e2f4d]/50">
                          <p className="text-[9px] text-slate-400 uppercase font-bold">{m.label}</p>
                          <p className="text-xs font-bold text-slate-200 mt-0.5">{m.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: AUDITORÍA Y TRAZABILIDAD */}
          {activeTab === 'audit' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Registro cronológico inmutable de accesos y modificaciones en historias clínicas.
              </p>

              <div className="divide-y divide-[#1e2f4d] border border-[#1e2f4d] rounded-2xl bg-[#08101e] overflow-hidden">
                {auditLogs.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No hay eventos de seguridad registrados todavía.
                  </div>
                ) : (
                  auditLogs.map((log) => (
                    <div key={log.id} className="p-3.5 hover:bg-[#0e1d33] transition-colors flex items-start justify-between gap-3 text-xs">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                              log.severity === 'critical'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : log.severity === 'warning'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            }`}
                          >
                            {log.action}
                          </span>
                          <span className="text-slate-400 font-mono text-[10px]">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                          <span className="text-[10px] text-slate-500">• {log.targetResource}</span>
                        </div>
                        <p className="text-slate-200 font-medium leading-snug">{log.details}</p>
                      </div>

                      <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 rounded bg-slate-800 flex-shrink-0">
                        {log.actorRole}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ESTÁNDARES Y CUMPLIMIENTO */}
          {activeTab === 'compliance' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#0e1d33] border border-[#1e2f4d] space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Conformidad con Ley N° 29733 (Protección de Datos Personales en Salud - Perú)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  El sistema aplica el principio de confidencialidad médica obligatoria, asegurando que los diagnósticos, ecografías y fotos antes/después no queden expuestos a terceros.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#08101e] border border-[#1e2f4d] space-y-1.5">
                  <p className="font-bold text-sky-400">1. Protección de Base de Datos</p>
                  <p className="text-slate-400">Row Level Security (RLS) activo en PostgreSQL de Supabase. Aislamiento por usuario y rol.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#08101e] border border-[#1e2f4d] space-y-1.5">
                  <p className="font-bold text-sky-400">2. Sanitización Perimetral</p>
                  <p className="text-slate-400">Filtrado contra XSS, inyecciones SQL y scripts no autorizados en todos los formularios clínicos.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#08101e] border border-[#1e2f4d] space-y-1.5">
                  <p className="font-bold text-sky-400">3. Enmascaramiento Dinámico</p>
                  <p className="text-slate-400">Ocultamiento de 4 dígitos de DNI y teléfonos en modo sala para evitar miradas indiscretas en recepción.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#08101e] border border-[#1e2f4d] space-y-1.5">
                  <p className="font-bold text-sky-400">4. Trazabilidad Inmutable</p>
                  <p className="text-slate-400">Cada modificación de recetas, prescripciones o imágenes queda registrada con hora exacta.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1e2f4d] bg-[#08101e] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>C&C Salud • Sistema Clínico Criptoseguro</span>
          </div>
          <button
            onClick={closeSecurityModal}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all cursor-pointer"
          >
            Cerrar Centro de Seguridad
          </button>
        </div>
      </div>
    </div>
  );
};
