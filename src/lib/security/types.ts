// ====================================================================
// TIPOS DEL SISTEMA DE CIBERSEGURIDAD Y AGENTES
// Cumplimiento: Ley N° 29733 (Perú) y Estándares de Datos Médicos (PHI)
// ====================================================================

export type SecurityLevel = 'info' | 'warning' | 'critical' | 'alert';

export type SecurityActionType =
  | 'AUTH_LOGIN'
  | 'AUTH_LOGOUT'
  | 'ROLE_SWITCH'
  | 'PATIENT_VIEW'
  | 'PATIENT_CREATE'
  | 'PATIENT_UPDATE'
  | 'PATIENT_DELETE'
  | 'HISTORY_RECORD_ADD'
  | 'HISTORY_RECORD_EDIT'
  | 'HISTORY_RECORD_DELETE'
  | 'ULTRASOUND_PDF_EXPORT'
  | 'SENSITIVE_SEARCH'
  | 'RATE_LIMIT_TRIGGERED'
  | 'THREAT_BLOCKED'
  | 'DATA_INTEGRITY_CHECK';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: SecurityActionType;
  actorRole: string;
  targetResource: string;
  details: string;
  severity: SecurityLevel;
  clientIp?: string;
  userAgent?: string;
}

export type AgentStatus = 'active' | 'standby' | 'alert' | 'learning';

export interface SystemAgent {
  id: string;
  name: string;
  codename: string;
  role: string;
  description: string;
  status: AgentStatus;
  threatsIntercepted: number;
  lastActive: string;
  metrics: {
    label: string;
    value: string | number;
  }[];
}

export interface SecurityStatus {
  isShieldActive: boolean;
  privacyMode: boolean; // Enmascara DNI y datos de contacto en pantallas públicas
  threatsBlockedCount: number;
  complianceScore: number; // Porcentaje 0-100%
  lastAuditTimestamp: string;
  activeAgents: SystemAgent[];
}
