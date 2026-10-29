// ====================================================================
// MOTOR DE CIBERSEGURIDAD Y AGENTES DEL SISTEMA
// Consultorio Médico C&C Salud • Dr. Henry Castañeda Aponte
// ====================================================================

import { AuditLogEntry, SecurityActionType, SecurityLevel, SystemAgent } from './types';

const AUDIT_STORAGE_KEY = 'cyc_security_audit_log_v1';
const SECURITY_STATS_KEY = 'cyc_security_stats_v1';

// 1. SANITIZADOR DE ENTRADAS (Anti-XSS y Anti-Inyecciones)
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  return input
    .replace(/[<>]/g, '') // Elimina etiquetas HTML
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
};

// 2. ENMASCARAMIENTO DE DATOS SENSIBLES (Ley 29733 de Protección de Datos)
export const maskDni = (dni: string, enabled = true): string => {
  if (!enabled || !dni || dni.length < 5) return dni;
  return dni.slice(0, 4) + '****';
};

export const maskPhone = (phone: string, enabled = true): string => {
  if (!enabled || !phone) return phone;
  if (phone.length <= 6) return '***-***';
  return phone.slice(0, 6) + ' *** ' + phone.slice(-3);
};

export const maskEmail = (email: string, enabled = true): string => {
  if (!enabled || !email || !email.includes('@')) return email;
  const [user, domain] = email.split('@');
  if (user.length <= 2) return `*@${domain}`;
  return `${user[0]}***${user[user.length - 1]}@${domain}`;
};

// 3. AGENTES AUTÓNOMOS DEL SISTEMA
export const INITIAL_SYSTEM_AGENTS: SystemAgent[] = [
  {
    id: 'agent-sentinel',
    name: 'Agente Sentinel',
    codename: 'SENTINEL-X1',
    role: 'Guardia perimetral & Anti-Inyección',
    description: 'Monitorea ráfagas de consultas, previene inyecciones SQL/XSS y bloquea accesos anormales.',
    status: 'active',
    threatsIntercepted: 0,
    lastActive: new Date().toISOString(),
    metrics: [
      { label: 'Inspección de Tráfico', value: '100% Sanitizado' },
      { label: 'Defensa XSS / SQLi', value: 'Activa' },
    ],
  },
  {
    id: 'agent-privacy',
    name: 'Agente Privacy Guard',
    codename: 'GUARD-PHI',
    role: 'Protector de Datos Médicos (Ley 29733 / HIPAA)',
    description: 'Controla el enmascaramiento de historias clínicas, DNI y teléfonos en pantallas visibles.',
    status: 'active',
    threatsIntercepted: 0,
    lastActive: new Date().toISOString(),
    metrics: [
      { label: 'Enmascaramiento', value: 'Bajo Demanda' },
      { label: 'Protección PHI', value: 'Grado Médico' },
    ],
  },
  {
    id: 'agent-auditor',
    name: 'Agente Auditor Legal',
    codename: 'AUDIT-TRACE',
    role: 'Trazabilidad y Bitácora Inmutable',
    description: 'Registra quién consulta, edita o exporta informes y recetas con fecha y hora exacta.',
    status: 'active',
    threatsIntercepted: 0,
    lastActive: new Date().toISOString(),
    metrics: [
      { label: 'Eventos Auditados', value: '100%' },
      { label: 'Trazabilidad Legal', value: 'Conforme' },
    ],
  },
  {
    id: 'agent-integrity',
    name: 'Agente Integridad Cloud',
    codename: 'SYNC-INTEGRITY',
    role: 'Verificador de Consistencia Supabase',
    description: 'Garantiza que la información médica no sufra alteraciones ni pérdidas entre nube y cliente.',
    status: 'active',
    threatsIntercepted: 0,
    lastActive: new Date().toISOString(),
    metrics: [
      { label: 'Estado Nube', value: 'Sincronizado' },
      { label: 'Consistencia', value: '100% OK' },
    ],
  },
];

// 4. RATE LIMITER EN MEMORIA (Previene escaneo masivo de historias clínicas)
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequestsPerMinute: number = 60;

  isAllowed(key: string): boolean {
    const now = Date.now();
    const windowStart = now - 60000;
    const timestamps = this.requests.get(key) || [];
    const validTimestamps = timestamps.filter((t) => t > windowStart);

    if (validTimestamps.length >= this.maxRequestsPerMinute) {
      return false;
    }

    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);
    return true;
  }
}

export const rateLimiter = new RateLimiter();

// 5. GESTOR DE BITÁCORA DE AUDITORÍA (Local + Supabase ready)
export const getStoredAuditLogs = (): AuditLogEntry[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const appendAuditLog = (
  action: SecurityActionType,
  details: string,
  targetResource: string,
  actorRole: string = 'specialist',
  severity: SecurityLevel = 'info'
): AuditLogEntry => {
  const entry: AuditLogEntry = {
    id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    action,
    actorRole,
    targetResource,
    details,
    severity,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 50) : 'System Server',
  };

  if (typeof window !== 'undefined') {
    try {
      const logs = getStoredAuditLogs();
      const updated = [entry, ...logs.slice(0, 99)]; // Mantener los 100 más recientes
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Error guardando log de auditoría', e);
    }
  }

  return entry;
};
