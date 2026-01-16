# Checklist de Seguridad OWASP Top 10 - SST Colombia 2025

## Marco Normativo Colombiano

Esta auditoría de seguridad cumple con:

- **Ley 1581 de 2012**: Protección de Datos Personales (Habeas Data)
- **Decreto 1377 de 2013**: Reglamentación Ley 1581
- **Resolución 0312/2019**: Estándares Mínimos SG-SST (datos de trabajadores)
- **Decreto 1072/2015**: Confidencialidad de información SST
- **GDPR (Aplicable)**: Para empresas con operaciones en UE

## OWASP Top 10 - 2021 Edition

### A01:2021 – Broken Access Control
**Riesgo para SST**: Acceso no autorizado a datos de salud ocupacional, incidentes, datos sensibles de trabajadores.

**Normativa**: Ley 1581/2012 Art. 4 (Principio de Finalidad) - Solo personal autorizado puede acceder a datos personales.

#### Checklist de Verificación

- [ ] **AC-01**: Sistema implementa Role-Based Access Control (RBAC) con 6 niveles
  - Roles: `admin`, `coordinador_sst`, `coordinador_rrhh`, `jefe_personal`, `supervisor`, `trabajador`
  - Archivo: `shared/permissions.ts`
  - Estado: ✅ IMPLEMENTADO

- [ ] **AC-02**: Verificar que trabajadores solo acceden a sus propios datos
  - Endpoint crítico: `/api/workers/:id`
  - Validación: `canAccessWorker(user, workerId)`
  - Estado: ⚠️ REQUIERE AUDITORÍA

- [ ] **AC-03**: Coordinadores SST no acceden a datos de nómina/RRHH sin autorización
  - Separation of Duties entre `coordinador_sst` y `coordinador_rrhh`
  - Estado: ⚠️ REQUIERE AUDITORÍA

- [ ] **AC-04**: Multi-tenant isolation - empresas no acceden a datos de otras empresas
  - Filtro `companyId` en TODAS las queries de base de datos
  - Archivos críticos: `server/storage.ts`, `server/routes.ts`
  - Estado: ⚠️ REQUIERE AUDITORÍA

- [ ] **AC-05**: Endpoints administrativos protegidos con middleware de autenticación
  - Middleware: `requireAuth`, `requireRole`
  - Rutas protegidas: `/api/admin/*`, `/api/billing/*`
  - Estado: ⚠️ REQUIERE AUDITORÍA

- [ ] **AC-06**: No hay escalación de privilegios no autorizada
  - Usuarios no pueden auto-promover su rol
  - Solo `admin` puede modificar roles de otros usuarios
  - Estado: ⚠️ REQUIERE AUDITORÍA

**Consecuencia de Fallo**: Multa hasta 2000 SMMLV (Ley 1581/2012) + Responsabilidad penal.

---

### A02:2021 – Cryptographic Failures
**Riesgo para SST**: Exposición de datos sensibles de salud, identificaciones, contraseñas.

**Normativa**: Ley 1581/2012 Art. 17 (Medidas de Seguridad) - Implementar medidas técnicas de protección.

#### Checklist de Verificación

- [ ] **CF-01**: Contraseñas hasheadas con algoritmo robusto (scrypt/bcrypt/argon2)
  - Implementación actual: `scrypt` con salt
  - Archivo: `server/auth.ts`
  - Parámetros: N=16384, r=8, p=1 (OWASP recomienda)
  - Estado: ✅ IMPLEMENTADO

- [ ] **CF-02**: Datos sensibles de salud encriptados en reposo
  - Tablas críticas: `workers` (datos biométricos), `accidents` (diagnósticos)
  - Encriptación DB: PostgreSQL nativo (AES-256)
  - Estado: ⚠️ REQUIERE VERIFICACIÓN

- [ ] **CF-03**: Conexiones HTTPS obligatorias en producción
  - TLS 1.3 mínimo
  - Certificados válidos (no auto-firmados)
  - HSTS habilitado
  - Estado: ⚠️ REQUIERE VERIFICACIÓN EN PRODUCCIÓN

- [ ] **CF-04**: Variables de entorno sensibles NO versionadas en Git
  - Archivo `.env` en `.gitignore`
  - Secrets: `SESSION_SECRET`, `DATABASE_URL`, `RESEND_API_KEY`
  - Estado: ✅ IMPLEMENTADO

- [ ] **CF-05**: Session cookies con flags de seguridad
  - `httpOnly: true` (prevenir XSS)
  - `secure: true` (solo HTTPS)
  - `sameSite: 'strict'` (prevenir CSRF)
  - Archivo: `server/index.ts` - configuración de `express-session`
  - Estado: ⚠️ REQUIERE AUDITORÍA

- [ ] **CF-06**: Datos de pago (tarjetas) NUNCA almacenados localmente
  - Integración Wompi: tokenización de tarjetas
  - PCI DSS compliance a través de gateway
  - Estado: ✅ IMPLEMENTADO (delegado a Wompi)

**Consecuencia de Fallo**: Filtración masiva de datos → Multa +2000 SMMLV + Cierre temporal.

---

### A03:2021 – Injection
**Riesgo para SST**: SQL Injection en queries de trabajadores, incidentes, auditorías.

**Normativa**: Decreto 1377/2013 Art. 23 (Seguridad de la información).

#### Checklist de Verificación

- [ ] **INJ-01**: ORM usado para TODAS las queries de base de datos
  - ORM: Drizzle ORM
  - NO usar `db.execute(rawSQL)` con input de usuario
  - Estado: ✅ IMPLEMENTADO

- [ ] **INJ-02**: Inputs de usuario validados con Zod schemas
  - Schemas: `insertWorkerSchema`, `insertIncidentSchema`, etc.
  - Validación en endpoints: `req.body` validado antes de DB
  - Estado: ✅ IMPLEMENTADO

- [ ] **INJ-03**: Búsquedas/filtros parametrizados (no string concatenation)
  - Ejemplo seguro: `db.query.workers.findMany({ where: eq(workers.id, userId) })`
  - Ejemplo INSEGURO: `db.execute(\`SELECT * FROM workers WHERE id='\${userId}'\`)`
  - Estado: ⚠️ REQUIERE AUDITORÍA

- [ ] **INJ-04**: NoSQL injection prevenido (si se usa Redis/MongoDB para caché)
  - N/A - Sistema usa solo PostgreSQL
  - Estado: ✅ NO APLICA

- [ ] **INJ-05**: Command injection prevenido en generación de PDFs/reportes
  - Librería: `pdfkit` (segura, no ejecuta comandos shell)
  - NO usar `child_process.exec()` con input de usuario
  - Estado: ⚠️ REQUIERE AUDITORÍA

- [ ] **INJ-06**: XSS prevenido en frontend React
  - React escapa contenido automáticamente
  - NO usar `dangerouslySetInnerHTML` sin sanitización
  - Estado: ⚠️ REQUIERE AUDITORÍA

**Consecuencia de Fallo**: Acceso completo a base de datos → Robo de 100% de datos de trabajadores.

---

### A04:2021 – Insecure Design
**Riesgo para SST**: Diseño sin principios de seguridad desde origen.

**Normativa**: ISO 45001:2018 Cláusula 4.4 (Sistema de gestión debe ser diseñado adecuadamente).

#### Checklist de Verificación

- [ ] **ID-01**: Threat modeling realizado para módulos críticos
  - Módulos críticos: Autenticación, Billing, Datos de Salud
  - Metodología: STRIDE o similar
  - Estado: ❌ NO REALIZADO

- [ ] **ID-02**: Principio de "Defense in Depth" aplicado
  - Múltiples capas de seguridad:
    1. Autenticación (Passport.js)
    2. Autorización (RBAC)
    3. Validación de inputs (Zod)
    4. Logging (Audit trail)
  - Estado: ✅ IMPLEMENTADO PARCIALMENTE

- [ ] **ID-03**: Principio de "Least Privilege" en roles de usuarios
  - Trabajadores solo acceden a su información
  - Supervisores solo a su área
  - Coordinadores a su dominio (SST o RRHH)
  - Estado: ✅ IMPLEMENTADO

- [ ] **ID-04**: Rate limiting para prevenir ataques de fuerza bruta
  - Middleware: `express-rate-limit`
  - Rutas críticas: `/api/login`, `/api/workers`, `/api/billing`
  - Límite: 100 req/15min por IP
  - Estado: ✅ IMPLEMENTADO

- [ ] **ID-05**: Backup y disaster recovery planificado
  - Backups automáticos de PostgreSQL
  - Frecuencia: Diaria
  - Retención: 30 días
  - Pruebas de restauración: Mensual
  - Estado: ✅ IMPLEMENTADO (ver `scripts/backup-database.sh`)

- [ ] **ID-06**: Segregación de ambientes (dev/staging/prod)
  - Bases de datos separadas
  - Secrets diferentes por ambiente
  - Estado: ⚠️ REQUIERE VERIFICACIÓN

**Consecuencia de Fallo**: Sistema vulnerable por diseño → Imposible parchear sin rediseño.

---

### A05:2021 – Security Misconfiguration
**Riesgo para SST**: Configuraciones por defecto inseguras, servicios innecesarios expuestos.

**Normativa**: Ley 1581/2012 Art. 17 (Adoptar medidas de seguridad).

#### Checklist de Verificación

- [ ] **SM-01**: Headers de seguridad HTTP configurados
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Strict-Transport-Security: max-age=31536000`
  - Estado: ⚠️ REQUIERE IMPLEMENTACIÓN

- [ ] **SM-02**: CORS configurado restrictivamente
  - Solo orígenes autorizados
  - NO usar `Access-Control-Allow-Origin: *`
  - Estado: ⚠️ REQUIERE AUDITORÍA

- [ ] **SM-03**: Errores de producción NO revelan stack traces
  - Logs detallados solo en desarrollo
  - Usuario solo ve mensaje genérico "Error interno"
  - Estado: ⚠️ REQUIERE AUDITORÍA

- [ ] **SM-04**: Servicios innecesarios deshabilitados
  - PostgreSQL NO expuesto públicamente
  - Redis/caché solo accesible desde backend
  - Estado: ⚠️ REQUIERE VERIFICACIÓN EN PRODUCCIÓN

- [ ] **SM-05**: Versiones de dependencias actualizadas
  - Vulnerabilidades conocidas (npm audit)
  - Comando: `npm audit --production`
  - Estado: ⚠️ REQUIERE EJECUCIÓN

- [ ] **SM-06**: Configuración de sesiones segura
  - `SESSION_SECRET`: aleatorio, >32 caracteres
  - Expiración de sesión: 12 horas
  - Rotación de session ID después de login
  - Estado: ⚠️ REQUIERE AUDITORÍA

**Consecuencia de Fallo**: Exposición accidental de datos → Vulnerabilidad explotable.

---

### A06:2021 – Vulnerable and Outdated Components
**Riesgo para SST**: Dependencias con CVEs conocidas permiten exploits.

**Normativa**: Decreto 1377/2013 (Mantener sistemas actualizados).

#### Checklist de Verificación

- [ ] **VOC-01**: Auditoría de dependencias ejecutada mensualmente
  - Comando: `npm audit`
  - Severidad crítica/alta debe corregirse en <7 días
  - Estado: ⚠️ REQUIERE IMPLEMENTACIÓN PERIÓDICA

- [ ] **VOC-02**: Dependencias de frontend actualizadas
  - React, Vite, TanStack Query, Tailwind CSS
  - Revisar CVEs en: https://www.npmjs.com/advisories
  - Estado: ⚠️ REQUIERE AUDITORÍA

- [ ] **VOC-03**: Dependencias de backend actualizadas
  - Express, Passport, Drizzle ORM, PDFKit
  - Revisar CVEs en GitHub Security Advisories
  - Estado: ⚠️ REQUIERE AUDITORÍA

- [ ] **VOC-04**: PostgreSQL actualizado a versión soportada
  - Versión mínima: 14.x
  - Versión recomendada: 16.x
  - Estado: ⚠️ REQUIERE VERIFICACIÓN

- [ ] **VOC-05**: Sistema operativo base actualizado
  - Replit: Gestionado automáticamente
  - Estado: ✅ GESTIONADO POR PLATAFORMA

- [ ] **VOC-06**: Monitoreo automático de nuevas vulnerabilidades
  - GitHub Dependabot habilitado
  - Notificaciones a equipo técnico
  - Estado: ⚠️ REQUIERE CONFIGURACIÓN

**Consecuencia de Fallo**: Explotación de CVE conocido → Compromiso total del sistema.

---

### A07:2021 – Identification and Authentication Failures
**Riesgo para SST**: Robo de cuentas, acceso no autorizado a datos de trabajadores.

**Normativa**: Ley 1581/2012 Art. 13 (Solo titular o autorizados acceden a datos).

#### Checklist de Verificación

- [ ] **IAF-01**: Política de contraseñas robusta
  - Longitud mínima: 8 caracteres
  - Complejidad: Al menos 1 mayúscula, 1 número
  - No contraseñas comunes (validación en registro)
  - Estado: ⚠️ REQUIERE IMPLEMENTACIÓN

- [ ] **IAF-02**: Autenticación multi-factor (MFA) para roles críticos
  - Roles críticos: `admin`, `coordinador_sst`
  - Método: TOTP (Google Authenticator)
  - Estado: ❌ NO IMPLEMENTADO

- [ ] **IAF-03**: Protección contra ataques de fuerza bruta
  - Rate limiting en `/api/login`: 5 intentos/15min
  - Bloqueo temporal de cuenta después de 10 intentos fallidos
  - Estado: ✅ IMPLEMENTADO PARCIALMENTE (rate limit)

- [ ] **IAF-04**: Session management seguro
  - Sesiones invalidadas al logout
  - Sesiones expiradas después de inactividad (12 horas)
  - Session ID regenerado después de login exitoso
  - Estado: ⚠️ REQUIERE AUDITORÍA

- [ ] **IAF-05**: Credenciales NO almacenadas en código
  - Variables de entorno para secrets
  - `.env` en `.gitignore`
  - Estado: ✅ IMPLEMENTADO

- [ ] **IAF-06**: Recuperación de contraseña segura
  - Token único, de un solo uso, con expiración
  - Enviado por email (no por SMS sin cifrar)
  - Estado: ❌ NO IMPLEMENTADO

- [ ] **IAF-07**: Notificación de actividad sospechosa
  - Login desde IP/dispositivo nuevo → Email de alerta
  - Cambio de contraseña → Email de confirmación
  - Estado: ❌ NO IMPLEMENTADO

**Consecuencia de Fallo**: Robo de cuenta → Acceso total a datos sensibles de trabajadores.

---

### A08:2021 – Software and Data Integrity Failures
**Riesgo para SST**: Modificación no autorizada de registros de incidentes, auditorías.

**Normativa**: Resolución 0312/2019 (Trazabilidad de registros SST).

#### Checklist de Verificación

- [ ] **SDIF-01**: Audit logging de TODAS las operaciones críticas
  - Tabla: `audit_logs`
  - Operaciones registradas:
    - Creación/modificación/eliminación de trabajadores
    - Reportes de incidentes
    - Cambios en auditorías internas
    - Modificaciones de configuración
  - Estado: ✅ IMPLEMENTADO

- [ ] **SDIF-02**: Logs de auditoría inmutables
  - No se pueden editar/eliminar logs después de creación
  - Implementación: Permisos restrictivos en `audit_logs`
  - Estado: ⚠️ REQUIERE VERIFICACIÓN

- [ ] **SDIF-03**: Integridad de dependencias de frontend
  - Subresource Integrity (SRI) para CDNs
  - `package-lock.json` versionado en Git
  - Estado: ✅ IMPLEMENTADO (`package-lock.json`)

- [ ] **SDIF-04**: Pipeline de CI/CD con verificación de integridad
  - Code signing de builds de producción
  - Verificación de checksums de paquetes
  - Estado: ❌ NO IMPLEMENTADO

- [ ] **SDIF-05**: Backups verificados regularmente
  - Pruebas de restauración mensual
  - Checksums de backups validados
  - Estado: ⚠️ REQUIERE VERIFICACIÓN

- [ ] **SDIF-06**: No uso de `eval()` o `Function()` con input de usuario
  - Búsqueda en código: `eval(`, `new Function(`
  - Estado: ⚠️ REQUIERE AUDITORÍA

**Consecuencia de Fallo**: Registros de incidentes alterados → Responsabilidad legal en auditoría.

---

### A09:2021 – Security Logging and Monitoring Failures
**Riesgo para SST**: Incidentes de seguridad no detectados, imposibilidad de auditoría.

**Normativa**: Ley 1581/2012 Art. 17 (Monitoreo de seguridad) + Decreto 1072/2015 (Trazabilidad).

#### Checklist de Verificación

- [ ] **SLMF-01**: Logging estructurado JSON con niveles apropiados
  - Librería: `pino`
  - Niveles: `error`, `warn`, `info`, `debug`
  - Formato: JSON para indexación automática
  - Estado: ✅ IMPLEMENTADO

- [ ] **SLMF-02**: Eventos de seguridad críticos registrados
  - ✅ Login exitoso/fallido (con IP, timestamp, user-agent)
  - ✅ Cambios de permisos de usuarios
  - ✅ Acceso a datos sensibles de salud
  - ✅ Modificación de registros de incidentes
  - ✅ Exportación de datos (compliance con Ley 1581)
  - Estado: ✅ IMPLEMENTADO

- [ ] **SLMF-03**: Logs NO contienen datos sensibles en texto plano
  - NO loggear: contraseñas, tokens, SSN, datos de salud
  - Sí loggear: IDs, tipos de operación, timestamps
  - Estado: ⚠️ REQUIERE AUDITORÍA

- [ ] **SLMF-04**: Retención de logs conforme a normativa colombiana
  - Ley 1581/2012: Mínimo 5 años para datos personales
  - Logs de auditoría SST: 20 años (Decreto 1072/2015)
  - Estado: ⚠️ REQUIERE CONFIGURACIÓN

- [ ] **SLMF-05**: Monitoreo proactivo de anomalías
  - Alertas automáticas:
    - Múltiples logins fallidos (posible ataque)
    - Acceso fuera de horario laboral
    - Exportación masiva de datos
  - Estado: ❌ NO IMPLEMENTADO

- [ ] **SLMF-06**: Dashboards de seguridad para SOC (Security Operations Center)
  - Métricas en tiempo real:
    - Intentos de login fallidos/hora
    - Accesos a datos sensibles/día
    - Errores 403 (Forbidden) por endpoint
  - Estado: ❌ NO IMPLEMENTADO

- [ ] **SLMF-07**: Logs centralizados y protegidos contra manipulación
  - Servicio: Syslog remoto o ELK Stack
  - Permisos: Solo lectura para mayoría de usuarios
  - Estado: ⚠️ REQUIERE IMPLEMENTACIÓN

**Consecuencia de Fallo**: Breach no detectado → Imposibilidad de investigación forense.

---

### A10:2021 – Server-Side Request Forgery (SSRF)
**Riesgo para SST**: Acceso a recursos internos, escaneo de red interna.

**Normativa**: Decreto 1377/2013 (Protección de infraestructura).

#### Checklist de Verificación

- [ ] **SSRF-01**: URLs de usuario validadas y sanitizadas
  - Endpoints que aceptan URLs:
    - `/api/upload` (validar extensiones de archivos)
    - Generación de PDFs con imágenes remotas
  - Whitelist de dominios permitidos
  - Estado: ⚠️ REQUIERE AUDITORÍA

- [ ] **SSRF-02**: No se permite acceso a rangos IP privados/localhost
  - Bloqueados: `127.0.0.1`, `localhost`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`
  - Validación en requests HTTP salientes
  - Estado: ⚠️ REQUIERE IMPLEMENTACIÓN

- [ ] **SSRF-03**: Metadata endpoints de nube bloqueados
  - AWS: `169.254.169.254`
  - GCP: `metadata.google.internal`
  - N/A si solo se usa Replit (gestionado)
  - Estado: ✅ NO APLICA (Replit managed)

- [ ] **SSRF-04**: Webhooks validados y firmados
  - Wompi webhooks: Verificar firma con `WOMPI_EVENTS_SECRET`
  - Implementación: `server/routes.ts` - `/api/webhooks/wompi`
  - Estado: ✅ IMPLEMENTADO

- [ ] **SSRF-05**: Timeout y rate limiting en requests externos
  - Timeout: 10 segundos máximo
  - Retry: Máximo 3 intentos
  - Estado: ⚠️ REQUIERE VERIFICACIÓN

**Consecuencia de Fallo**: Acceso a PostgreSQL interna → Robo completo de base de datos.

---

## Resumen Ejecutivo de Cumplimiento

### Estado Global

| Categoría OWASP | Implementado | Parcial | No Implementado | Riesgo |
|----------------|--------------|---------|-----------------|--------|
| A01: Broken Access Control | 1 | 5 | 0 | 🟡 MEDIO |
| A02: Cryptographic Failures | 3 | 3 | 0 | 🟢 BAJO |
| A03: Injection | 2 | 3 | 1 | 🟢 BAJO |
| A04: Insecure Design | 3 | 1 | 1 | 🟡 MEDIO |
| A05: Security Misconfiguration | 0 | 5 | 1 | 🟠 ALTO |
| A06: Vulnerable Components | 1 | 4 | 1 | 🟡 MEDIO |
| A07: Authentication Failures | 2 | 2 | 3 | 🟠 ALTO |
| A08: Data Integrity Failures | 2 | 3 | 1 | 🟡 MEDIO |
| A09: Logging Failures | 2 | 3 | 2 | 🟡 MEDIO |
| A10: SSRF | 2 | 3 | 0 | 🟢 BAJO |

### Prioridades Críticas (Resolución inmediata <30 días)

1. **🔴 CRÍTICO**: Implementar MFA para roles `admin` y `coordinador_sst` (A07)
2. **🔴 CRÍTICO**: Configurar headers de seguridad HTTP (A05)
3. **🔴 CRÍTICO**: Ejecutar `npm audit` y parchear vulnerabilidades críticas (A06)
4. **🟠 ALTO**: Auditar multi-tenant isolation en todas las queries (A01)
5. **🟠 ALTO**: Implementar recuperación segura de contraseña (A07)

### Prioridades Altas (Resolución <90 días)

6. **🟡 MEDIO**: Realizar threat modeling de módulos críticos (A04)
7. **🟡 MEDIO**: Implementar monitoreo proactivo de anomalías (A09)
8. **🟡 MEDIO**: Verificar inmutabilidad de audit logs (A08)
9. **🟡 MEDIO**: Validar configuración de CORS (A05)
10. **🟡 MEDIO**: Implementar política de contraseñas robusta (A07)

### Cumplimiento Normativo

- **Ley 1581/2012**: ✅ CUMPLE PARCIALMENTE
  - ✅ Medidas técnicas de protección implementadas
  - ⚠️ Requiere mejora en logging y retención (5 años)
  
- **Decreto 1072/2015**: ✅ CUMPLE PARCIALMENTE
  - ✅ Audit trail de registros SST
  - ⚠️ Retención de logs debe extenderse a 20 años

- **Resolución 0312/2019**: ✅ CUMPLE
  - ✅ Trazabilidad de operaciones críticas
  - ✅ Control de acceso basado en roles

## Próximos Pasos

1. **Ejecutar Task 33**: Auditoría técnica detallada de cada item del checklist
2. **Generar Reporte OWASP**: Documentar hallazgos, evidencias y plan de remediación
3. **Priorizar Remediación**: Según matriz de riesgo y cumplimiento normativo
4. **Implementar Controles**: Desarrollo de funcionalidades de seguridad faltantes
5. **Re-Auditoría**: Validar implementación de controles en 90 días

---

**Fecha de Creación**: 2025-01-13  
**Versión**: 1.0  
**Responsable**: Equipo SST Colombia  
**Próxima Revisión**: 2025-04-13 (90 días)
