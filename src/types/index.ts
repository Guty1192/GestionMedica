export type UserRole = 'admin' | 'specialist';
export type AuthUserType = 'doctor' | 'admin';

export type EstadoGeneral = 'activo' | 'inactivo' | 'en_espera' | 'en_consulta' | 'finalizado';
export type EstadoCita = 'programado' | 'en_espera' | 'en_consulta' | 'completado' | 'cancelado' | 'no_asistio';
export type MetodoPago = 'Pendiente' | 'Efectivo' | 'Tarjeta' | 'Transferencia';

// ====================================================================
// LAS 4 ESPECIALIDADES DEL DOCTOR
// ====================================================================
export type EspecialidadMedica = 'Consulta General' | 'Ginecología' | 'Ecografía' | 'Ozonoterapia';

export interface Paciente {
  id: string;
  nombre: string;
  documento: string;
  edad: number;
  telefono: string;
  email: string;
  grupo_rh: string;
  alergias?: string;
  antecedentes_medicos?: string;
  especialidad_principal: EspecialidadMedica;
  estado: EstadoGeneral;
  created_at: string;
  updated_at?: string;
}

export interface Ecografia {
  id: string;
  paciente_id: string;
  paciente_nombre?: string;
  nombre: string;
  tipo: string;
  fecha_estudio: string;
  trimestre?: number;
  semanas_gestacion?: number;
  dbp_mm?: number;
  lf_mm?: number;
  ca_mm?: number;
  peso_estimado_gr?: number;
  percentil_hadlock?: number;
  liquido_amniotico_ila?: number;
  placenta_posicion?: string;
  imagen_url: string;
  informe_conclusion: string;
  medico_ecografista?: string;
  estado: string;
  created_at: string;
}

export interface PapanicolauResultado {
  id: string;
  paciente_id: string;
  paciente_nombre?: string;
  nombre: string;
  fecha_toma: string;
  fecha_resultado?: string;
  clasificacion_bethesda: string;
  hallazgos_microbiologicos: string;
  calidad_muestra: string;
  conducta_sugerida: string;
  alerta_biopsia: boolean;
  laboratorio: string;
  estado: 'activo' | 'revisado' | 'pendiente' | 'archivado';
  created_at: string;
}

export interface CitaAgenda {
  id: string;
  paciente_id: string;
  paciente?: Paciente;
  fecha: string;
  hora_inicio: string;
  motivo: string;
  tipo: EspecialidadMedica;
  profesional: string;
  consultorio: string;
  notas?: string;
  alerta_automatica?: string;
  monto: number;
  metodo_pago: MetodoPago;
  estado: EstadoCita;
  created_at: string;
}

export interface CierreDiario {
  id: string;
  fecha: string;
  total_consultas: number;
  total_ingresos: number;
  efectivo: number;
  tarjeta: number;
  transferencia: number;
  observaciones?: string;
  responsable: string;
  cerrado: boolean;
  created_at: string;
}

export interface InformeEcografico {
  tipo_ecografia: string;
  motivo_indicacion: string;
  hallazgos_detallados: string;
  medidas_biometria?: string;
  conclusion_diagnostica: string;
  recomendaciones?: string;
  medico_ecografista: string;
  colegiatura_cmp?: string;
  fecha_informe: string;
}

export interface RegistroHistorial {
  id: string;
  fecha_registro: string;
  dni: string;
  nombres_completos: string;
  celular: string;
  correo: string;
  edad: number;
  especialidad: EspecialidadMedica;
  tratamiento: string;
  foto_antes?: string;
  foto_despues?: string;
  informe_ecografico?: InformeEcografico;
  notas_adicionales?: string;
  created_at: string;
}
