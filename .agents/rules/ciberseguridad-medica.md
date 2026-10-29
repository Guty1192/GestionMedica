# 🛡️ REGLAS DE CIBERSEGURIDAD Y PROTECCIÓN DE DATOS MÉDICOS
## Consultorio Médico C&C Salud — Callao, Perú
### Dr. Henry Castañeda Aponte

---

## 1. Cumplimiento Normativo (Ley N° 29733 & HIPAA)
- **Datos Sensibles de Salud (PHI):** Los DNI, diagnósticos, recetas, imágenes ecográficas y fotos de antes/después constituyen datos sensibles de salud protegidos por la Ley N° 29733 de Protección de Datos Personales del Perú.
- **Principio de Finalidad y Confidencialidad:** La información del paciente solo puede ser consultada y tratada para el acto médico correspondiente.
- **Enmascaramiento en Pantallas:** La interfaz implementa un botón de "Modo Privacidad en Sala" que enmascara automáticamente los DNI (`4321****`), teléfonos y correos electrónicos.

---

## 2. Agentes Autónomos del Sistema
1. **SENTINEL-X1 (Agente Perimetral):**
   - Sanitización contra XSS (`<script>`, eventos `on*`, `javascript:`).
   - Rate limiting de consultas por minuto.
2. **GUARD-PHI (Agente de Privacidad):**
   - Enmascaramiento dinámico de datos de contacto y documentos de identidad.
3. **AUDIT-TRACE (Agente Auditor Legal):**
   - Bitácora inmutable con registro cronológico de consultas, exportaciones de PDF e intervenciones en historias clínicas.
4. **SYNC-INTEGRITY (Agente de Consistencia Cloud):**
   - Verificación de consistencia entre Supabase y caché local.

---

## 3. Políticas de Red y Servidor
- **Cabeceras HTTP Forzadas:**
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `X-Frame-Options: DENY` (Anti-Clickjacking)
  - `X-Content-Type-Options: nosniff` (Anti-MIME Sniffing)
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(self), microphone=(), geolocation=()`
- **Row Level Security (RLS):** Activo en todas las tablas de PostgreSQL en Supabase.
