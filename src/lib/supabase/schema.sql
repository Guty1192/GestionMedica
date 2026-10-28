-- ====================================================================
-- ESQUEMA COMPLETO: SISTEMA MÉDICO MULTI-ESPECIALIDAD (4 ESPECIALIDADES)
-- Especialidades: Consulta General, Ginecología, Ecografía, Ozonoterapia
-- ====================================================================

-- 1. EXTENSIÓN PARA UUIDs
create extension if not exists "uuid-ossp";

-- 2. TABLA: PACIENTES DEL CENTRO MÉDICO
create table if not exists pacientes_ginecologia (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  documento text unique, -- DNI
  edad integer,
  telefono text,
  email text,
  grupo_rh text default 'O+',
  alergias text default 'Ninguna conocida',
  antecedentes_medicos text default 'Sin antecedentes relevantes',
  especialidad_principal text default 'Consulta General' check (especialidad_principal in ('Consulta General', 'Ginecología', 'Ecografía', 'Ozonoterapia')),
  estado text default 'activo' check (estado in ('activo', 'inactivo', 'en_espera', 'en_consulta', 'finalizado')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. TABLA: HISTORIAL CLÍNICO MULTI-ESPECIALIDAD
create table if not exists historial_clinico_registros (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid references pacientes_ginecologia(id) on delete cascade,
  dni text not null,
  nombres text not null,
  celular text,
  correo text,
  edad integer,
  especialidad text not null check (especialidad in ('Consulta General', 'Ginecología', 'Ecografía', 'Ozonoterapia')),
  tratamiento text not null,
  foto_antes text,
  foto_despues text,
  fecha text not null,
  diagnostico text,
  medico_atencion text default 'Dr. Carlos Mendoza',
  
  -- Campos específicos para Ecografía (Informe Descargable PDF)
  tipo_ecografia text,
  motivo_indicacion text,
  hallazgos_ecograficos text,
  conclusion_diagnostica text,
  biometria_dbp numeric(5,1),
  biometria_lf numeric(5,1),
  biometria_ca numeric(5,1),
  biometria_peso_estimado numeric(6,1),
  informe_pdf_url text,
  
  -- Campos específicos para Ozonoterapia
  via_aplicacion text,
  concentracion_ozono text,
  numero_sesion integer,
  
  estado text default 'activo' check (estado in ('activo', 'completado', 'cancelado')),
  created_at timestamptz default now()
);

-- 4. TABLA: ECOGRAFÍAS Y ARCHIVOS DIAGNÓSTICOS
create table if not exists ecografias_archivos (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid references pacientes_ginecologia(id) on delete cascade,
  nombre text not null,
  tipo text not null,
  fecha_estudio date default current_date,
  dbp_mm numeric(5,1),
  lf_mm numeric(5,1),
  ca_mm numeric(5,1),
  peso_estimado_gr integer,
  imagen_url text,
  informe_conclusion text,
  medico_ecografista text default 'Dr. Carlos Mendoza (Especialista en Ecografía & Ultrasonografía)',
  estado text default 'activo',
  created_at timestamptz default now()
);

-- 5. TABLA: PAPANICOLAU & RESULTADOS DE CITOLOGÍA GINECOLÓGICA
create table if not exists papanicolau_resultados (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid references pacientes_ginecologia(id) on delete cascade,
  nombre text not null,
  fecha_toma date default current_date,
  fecha_resultado date,
  clasificacion_bethesda text default 'Negativo para lesión intraepitelial o malignidad (NILM)',
  hallazgos_microbiologicos text default 'Flora bacilar habitual (Lactobacillus)',
  calidad_muestra text default 'Satisfactoria para evaluación',
  conducta_sugerida text default 'Control anual de rutina',
  alerta_biopsia boolean default false,
  laboratorio text default 'Laboratorio de Patología y Citología Especializada',
  estado text default 'activo' check (estado in ('activo', 'revisado', 'pendiente', 'archivado')),
  created_at timestamptz default now()
);

-- 6. TABLA: AGENDA DE CITAS Y FLUJO DE SALA
create table if not exists agenda_citas (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid references pacientes_ginecologia(id) on delete cascade,
  fecha date default current_date,
  hora_inicio time not null,
  motivo text not null,
  tipo text check (tipo in ('Consulta General', 'Ginecología', 'Ecografía', 'Ozonoterapia')),
  profesional text default 'Dr. Carlos Mendoza',
  consultorio text default 'Consultorio 1 - Especialidades',
  notas text,
  alerta_automatica text,
  monto numeric(10,2) default 70.00,
  metodo_pago text default 'Pendiente' check (metodo_pago in ('Pendiente', 'Efectivo', 'Tarjeta', 'Transferencia')),
  estado text default 'programado' check (estado in ('programado', 'en_espera', 'en_consulta', 'completado', 'cancelado', 'no_asistio')),
  created_at timestamptz default now()
);

-- 7. TABLA: CIERRES DIARIOS DE CAJA
create table if not exists cierres_diarios (
  id uuid primary key default gen_random_uuid(),
  fecha date default current_date unique,
  total_consultas integer default 0,
  total_ingresos numeric(10,2) default 0.00,
  efectivo numeric(10,2) default 0.00,
  tarjeta numeric(10,2) default 0.00,
  transferencia numeric(10,2) default 0.00,
  observaciones text,
  responsable text default 'Administración Central',
  cerrado boolean default false,
  created_at timestamptz default now()
);

-- ====================================================================
-- SEGURIDAD: ROW LEVEL SECURITY (RLS)
-- ====================================================================

alter table pacientes_ginecologia enable row level security;
alter table historial_clinico_registros enable row level security;
alter table ecografias_archivos enable row level security;
alter table papanicolau_resultados enable row level security;
alter table agenda_citas enable row level security;
alter table cierres_diarios enable row level security;

-- Políticas permisivas para desarrollo
drop policy if exists "Permitir lectura publica pacientes" on pacientes_ginecologia;
create policy "Permitir lectura publica pacientes" on pacientes_ginecologia for all using (true) with check (true);

drop policy if exists "Permitir gestion de historial" on historial_clinico_registros;
create policy "Permitir gestion de historial" on historial_clinico_registros for all using (true) with check (true);

drop policy if exists "Permitir gestion ecografias" on ecografias_archivos;
create policy "Permitir gestion ecografias" on ecografias_archivos for all using (true) with check (true);

drop policy if exists "Permitir gestion paps" on papanicolau_resultados;
create policy "Permitir gestion paps" on papanicolau_resultados for all using (true) with check (true);

drop policy if exists "Permitir gestion agenda" on agenda_citas;
create policy "Permitir gestion agenda" on agenda_citas for all using (true) with check (true);

drop policy if exists "Permitir gestion cierres" on cierres_diarios;
create policy "Permitir gestion cierres" on cierres_diarios for all using (true) with check (true);
