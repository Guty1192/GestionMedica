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
  ('pac-1793236077657', 'Anthony Gutierrez', '72431309', 34, '+51934567073', 'gutipublicidad@gmail.com', 'O+', 'Ninguna conocida', 'Evaluación clínica y chequeo general', 'Consulta General', 'activo'),
  ('pac-1', 'María Fernanda Castillo Morales', '43219876', 42, '+51 984 551 234', 'mfernanda.castillo@gmail.com', 'A+', 'Ninguna conocida', 'Artrosis de rodilla derecha y úlcera maleolar en recuperación.', 'Ozonoterapia', 'activo'),
  ('pac-2', 'Carmen Rosa Quispe Valdivia', '70891234', 31, '+51 951 882 109', 'carmen.quispe@outlook.com', 'O-', 'Penicilina', 'Dismenorrea y seguimiento ecográfico transvaginal.', 'Ecografía', 'activo'),
  ('pac-3', 'Gabriela Lucía Mendoza Rivas', '46781209', 28, '+51 972 334 112', 'gabriela.mendoza@gmail.com', 'B+', 'Ninguna', 'Control ginecológico periódico y colposcopia anual.', 'Ginecología', 'activo'),
  ('pac-4', 'Carlos Alberto Torres Vega', '10928374', 54, '+51 993 410 998', 'carlos.torresv@hotmail.com', 'O+', 'Sulfas', 'Hipertensión arterial estadio 1 y dislipidemia mixta.', 'Consulta General', 'activo'),
  ('pac-5', 'Rosa Elena Benítez Paredes', '09812345', 38, '+51 964 120 443', 'rosa.benitez@gmail.com', 'A-', 'Aspirina', 'Cervicitis crónica tratada, control de Papanicolaou anual.', 'Ginecología', 'activo')
on conflict (documento) do nothing;

insert into historial_clinico_registros (id, dni, nombres_completos, celular, correo, edad, especialidad, tratamiento, foto_antes, foto_despues, fecha_registro, notas_adicionales)
values
  ('hist-1793236077656', '72431309', 'Anthony Gutierrez', '+51934567073', 'gutipublicidad@gmail.com', 34, 'Consulta General', 'Evaluación clínica general, signos vitales, anamnesis por aparatos y sistemas. Prescripción médica y solicitud de exámenes de laboratorio.', null, null, '2026-10-29', 'Paciente en buen estado general. Próximo control preventivo en 6 meses.'),
  ('hist-001', '43219876', 'María Fernanda Castillo Morales', '+51 984 551 234', 'mfernanda.castillo@gmail.com', 42, 'Ozonoterapia', 'Protocolo de Autohemoterapia Mayor (AHTM) 150ml con ozono a 30 µg/ml + Infiltración periarticular en rodilla derecha con O3 a 15 µg/ml (sesión 4/6). Aplicación tópica de aceite ozonizado al 10% en úlcera maleolar.', '/brand/consulta_1.jpg', '/brand/dr_henry.jpg', '2026-10-27', 'Paciente reporta disminución del dolor de EVA 8/10 a 2/10. Granulación tisular activa al 90%.'),
  ('hist-002', '70891234', 'Carmen Rosa Quispe Valdivia', '+51 951 882 109', 'carmen.quispe@outlook.com', 31, 'Ecografía', 'Ecografía Ginecológica Transvaginal de Alta Resolución con Doppler Color. Plan: Manejo médico para dismenorrea primaria y control ecográfico en 6 meses.', '/brand/ecografia_1.jpg', '/brand/consulta_2.jpg', '2026-10-27', 'Informe listo para impresión y descarga en PDF oficial.'),
  ('hist-003', '46781209', 'Gabriela Lucía Mendoza Rivas', '+51 972 334 112', 'gabriela.mendoza@gmail.com', 28, 'Ginecología', 'Chequeo ginecológico integral + Colposcopia diagnóstica. Tratamiento de cervicitis mixta con óvulos vaginales de Metronidazol 500mg + Nistatina 100,000 UI por 10 días continuos. Consejería en método anticonceptivo de larga duración.', '/brand/ginecologia_2.jpg', '/brand/ginecologia_3.jpg', '2026-10-26', 'Toma de Papanicolau realizada y enviada a patología. Cita de revisión en 2 semanas.'),
  ('hist-004', '10928374', 'Carlos Alberto Torres Vega', '+51 993 410 998', 'carlos.torresv@hotmail.com', 54, 'Consulta General', 'Manejo ambulatorio de Hipertensión Arterial Primaria Estadio 1 + Dislipidemia mixta. Prescripción médica: Losartán Potásico 50mg (1 tableta VO cada 12 horas) + Atorvastatina 20mg (1 tableta VO nocturna). Dieta hiposódica y actividad aeróbica regular.', null, null, '2026-10-25', 'Control de perfil lipídico, glucosa en ayunas y creatinina sérica en 4 semanas.'),
  ('hist-005', '09812345', 'Rosa Elena Benítez Paredes', '+51 964 120 443', 'rosa.benitez@gmail.com', 38, 'Ginecología', 'Control ginecológico y evaluación citológica anual. Colposcopia con visualización de zona de transformación tipo 1 normal. Recomendación de estilos de vida saludables y control en 1 año.', null, null, '2026-10-28', 'Resultado de Papanicolaou previo negativo (NILM).')
on conflict (id) do nothing;

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

