-- ====================================================================
-- ESQUEMA OFICIAL SUPABASE: SISTEMA MÉDICO C&C SALUD
-- Especialidades: Consulta General, Ginecología, Ecografía, Ozonoterapia
-- ====================================================================

-- 1. EXTENSIÓN PARA UUIDs (Opcional)
create extension if not exists "uuid-ossp";

-- 2. TABLA: PACIENTES DEL CENTRO MÉDICO
create table if not exists pacientes_ginecologia (
  id text primary key,
  nombre text not null,
  documento text unique, -- DNI
  edad integer,
  telefono text,
  email text,
  grupo_rh text default 'O+',
  alergias text default 'Ninguna conocida',
  antecedentes_medicos text default 'Sin antecedentes relevantes',
  especialidad_principal text default 'Consulta General',
  estado text default 'activo',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. TABLA: HISTORIAL CLÍNICO Y TRATAMIENTOS
create table if not exists historial_clinico_registros (
  id text primary key,
  dni text not null,
  nombres_completos text not null,
  celular text,
  correo text,
  edad integer,
  especialidad text not null,
  tratamiento text not null,
  foto_antes text,
  foto_despues text,
  fecha_registro text,
  notas_adicionales text,
  informe_ecografico jsonb,
  created_at timestamptz default now()
);

-- 4. TABLA: ECOGRAFÍAS Y ARCHIVOS DIAGNÓSTICOS
create table if not exists ecografias_archivos (
  id text primary key,
  paciente_id text,
  paciente_nombre text,
  nombre text not null,
  tipo text not null,
  fecha_estudio text default current_date::text,
  imagen_url text,
  informe_conclusion text,
  medico_ecografista text default 'Dr. Henry Castañeda Aponte',
  estado text default 'activo',
  created_at timestamptz default now()
);

-- 5. TABLA: CITAS Y AGENDA DE SALA
create table if not exists agenda_citas (
  id text primary key,
  paciente_id text,
  fecha text default current_date::text,
  hora_inicio text not null,
  motivo text not null,
  tipo text default 'Consulta General',
  profesional text default 'Dr. Henry Castañeda Aponte',
  consultorio text default 'Consultorio Principal',
  notas text,
  monto numeric(10,2) default 60.00,
  metodo_pago text default 'Pendiente',
  estado text default 'programado',
  created_at timestamptz default now()
);

-- ====================================================================
-- SEGURIDAD: ROW LEVEL SECURITY (RLS) & POLÍTICAS PÚBLICAS
-- ====================================================================

alter table pacientes_ginecologia enable row level security;
alter table historial_clinico_registros enable row level security;
alter table ecografias_archivos enable row level security;
alter table agenda_citas enable row level security;

-- Políticas permisivas para desarrollo con Anon Key
drop policy if exists "Permitir todo pacientes" on pacientes_ginecologia;
create policy "Permitir todo pacientes" on pacientes_ginecologia for all using (true) with check (true);

drop policy if exists "Permitir todo historial" on historial_clinico_registros;
create policy "Permitir todo historial" on historial_clinico_registros for all using (true) with check (true);

drop policy if exists "Permitir todo ecografias" on ecografias_archivos;
create policy "Permitir todo ecografias" on ecografias_archivos for all using (true) with check (true);

drop policy if exists "Permitir todo agenda" on agenda_citas;
create policy "Permitir todo agenda" on agenda_citas for all using (true) with check (true);

-- ====================================================================
-- DATOS INICIALES DEL CONSULTORIO (Dr. Henry Castañeda Aponte)
-- ====================================================================

insert into pacientes_ginecologia (id, nombre, documento, edad, telefono, email, grupo_rh, alergias, antecedentes_medicos, especialidad_principal, estado)
values
  ('pac-1', 'María Fernanda Castillo Morales', '43219876', 42, '+51 984 551 234', 'mfernanda.castillo@gmail.com', 'A+', 'Ninguna conocida', 'Artrosis de rodilla derecha y úlcera maleolar en recuperación.', 'Ozonoterapia', 'activo'),
  ('pac-2', 'Carmen Rosa Quispe Valdivia', '70891234', 31, '+51 951 882 109', 'carmen.quispe@outlook.com', 'O-', 'Penicilina', 'Dismenorrea y seguimiento ecográfico transvaginal.', 'Ecografía', 'activo'),
  ('pac-3', 'Gabriela Lucía Mendoza Rivas', '46781209', 28, '+51 972 334 112', 'gabriela.mendoza@gmail.com', 'B+', 'Ninguna', 'Control ginecológico periódico y colposcopia anual.', 'Ginecología', 'activo'),
  ('pac-4', 'Carlos Alberto Torres Vega', '10928374', 54, '+51 993 410 998', 'carlos.torresv@hotmail.com', 'O+', 'Sulfas', 'Hipertensión arterial estadio 1 y dislipidemia mixta.', 'Consulta General', 'activo'),
  ('pac-5', 'Rosa Elena Benítez Paredes', '09812345', 38, '+51 964 120 443', 'rosa.benitez@gmail.com', 'A-', 'Aspirina', 'Cervicitis crónica tratada, control de Papanicolaou anual.', 'Ginecología', 'activo')
on conflict (documento) do nothing;

-- ====================================================================
-- 6. TABLA: SEGURIDAD DEL DOCTOR - PIN ROTATIVO DE 30 DÍAS
-- ====================================================================

create table if not exists doctor_seguridad_pin (
  id text primary key default 'doctor_pin_config',
  email text not null,
  pin_hash text not null default '1234',
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '30 days'),
  updated_at timestamptz default now()
);

alter table doctor_seguridad_pin enable row level security;
drop policy if exists "Permitir todo doctor pin" on doctor_seguridad_pin;
create policy "Permitir todo doctor pin" on doctor_seguridad_pin for all using (true) with check (true);

insert into doctor_seguridad_pin (id, email, pin_hash, expires_at)
values
  ('doctor_pin_config', 'gutipublicida@gmail.com', '1234', now() + interval '30 days'),
  ('admin_pin_config', 'gutipublicida@gmail.com', '4321', now() + interval '30 days')
on conflict (id) do nothing;

