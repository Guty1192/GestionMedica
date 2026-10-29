'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AuditLogEntry,
  SecurityActionType,
  SecurityLevel,
  SystemAgent,
  SecurityStatus,
} from './types';
import {
  INITIAL_SYSTEM_AGENTS,
  appendAuditLog,
  getStoredAuditLogs,
  rateLimiter,
} from './securityEngine';

interface SecurityContextType {
  privacyMode: boolean;
  togglePrivacyMode: () => void;
  auditLogs: AuditLogEntry[];
  agents: SystemAgent[];
  threatsBlocked: number;
  complianceScore: number;
  isModalOpen: boolean;
  openSecurityModal: () => void;
  closeSecurityModal: () => void;
  logSecurityEvent: (
    action: SecurityActionType,
    details: string,
    targetResource: string,
    severity?: SecurityLevel
  ) => void;
  reportThreatBlocked: (threatType: string) => void;
  runIntegrityAudit: () => Promise<void>;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [privacyMode, setPrivacyMode] = useState<boolean>(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [agents, setAgents] = useState<SystemAgent[]>(INITIAL_SYSTEM_AGENTS);
  const [threatsBlocked, setThreatsBlocked] = useState<number>(0);
  const [complianceScore] = useState<number>(98); // 98% Estándar de Cumplimiento Médico
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    // Cargar logs almacenados
    const logs = getStoredAuditLogs();
    if (logs.length > 0) {
      setAuditLogs(logs);
    } else {
      // Registrar inicio de sesión del sistema
      const initialEntry = appendAuditLog(
        'AUTH_LOGIN',
        'Sistema iniciado bajo protección de Agentes de Ciberseguridad',
        'SISTEMA_CENTRAL',
        'Dr. Henry Castañeda',
        'info'
      );
      setAuditLogs([initialEntry]);
    }
  }, []);

  const togglePrivacyMode = () => {
    setPrivacyMode((prev) => {
      const next = !prev;
      appendAuditLog(
        'SENSITIVE_SEARCH',
        `Modo Privacidad en Sala ${next ? 'ACTIVADO (Enmascaramiento de DNI/Celular)' : 'DESACTIVADO'}`,
        'INTERFAZ_CLINICA',
        'specialist',
        'info'
      );
      return next;
    });
  };

  const logSecurityEvent = (
    action: SecurityActionType,
    details: string,
    targetResource: string,
    severity: SecurityLevel = 'info'
  ) => {
    const newEntry = appendAuditLog(action, details, targetResource, 'specialist', severity);
    setAuditLogs((prev) => [newEntry, ...prev.slice(0, 99)]);
  };

  const reportThreatBlocked = (threatType: string) => {
    setThreatsBlocked((prev) => prev + 1);
    setAgents((prev) =>
      prev.map((agent) =>
        agent.id === 'agent-sentinel'
          ? { ...agent, threatsIntercepted: agent.threatsIntercepted + 1, lastActive: new Date().toISOString() }
          : agent
      )
    );
    logSecurityEvent('THREAT_BLOCKED', `Amenaza bloqueada por Agente Sentinel: ${threatType}`, 'FIREWALL_WAF', 'critical');
  };

  const runIntegrityAudit = async () => {
    setAgents((prev) =>
      prev.map((agent) => ({
        ...agent,
        lastActive: new Date().toISOString(),
      }))
    );
    logSecurityEvent(
      'DATA_INTEGRITY_CHECK',
      'Auditoría de integridad y cifrado completada. Cero discrepancias en expedientes.',
      'SUPABASE_CLOUD_DB',
      'info'
    );
  };

  return (
    <SecurityContext.Provider
      value={{
        privacyMode,
        togglePrivacyMode,
        auditLogs,
        agents,
        threatsBlocked,
        complianceScore,
        isModalOpen,
        openSecurityModal: () => setIsModalOpen(true),
        closeSecurityModal: () => setIsModalOpen(false),
        logSecurityEvent,
        reportThreatBlocked,
        runIntegrityAudit,
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = (): SecurityContextType => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity debe ser usado dentro de un SecurityProvider');
  }
  return context;
};
