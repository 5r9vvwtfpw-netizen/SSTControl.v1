# Guía de Uso: Sistema de Audit Logging

**Última Actualización:** 11 de Noviembre de 2025  
**Estado:** ✅ Implementado y Validado  
**Cumplimiento Legal:** Ley 1581/2012, Decreto 1074/2015, Resolución 2346/2007, ISO 27001

---

## Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Marco Legal](#marco-legal)
3. [Arquitectura del Sistema](#arquitectura-del-sistema)
4. [Consultas Comunes](#consultas-comunes)
5. [Exportación para Auditorías](#exportación-para-auditorías)
6. [Política de Retención](#política-de-retención)
7. [Procedimientos Operacionales](#procedimientos-operacionales)
8. [Extensión a Otras Entidades](#extensión-a-otras-entidades)

---

## Resumen Ejecutivo

El Sistema de Audit Logging de SST Colombia registra automáticamente todas las operaciones CRUD sobre datos personales y regulados, cumpliendo con los requisitos de trazabilidad de la Ley 1581/2012 (Habeas Data) y normatividad SST colombiana.

**Entidades Actualmente Auditadas:**
- ✅ Workers (Trabajadores): CREATE, UPDATE, DELETE

**Entidades Preparadas para Auditoría:**
- ⏳ Accidents (Accidentes de Trabajo)
- ⏳ Medical Exams (Exámenes Médicos Ocupacionales)
- ⏳ Occupational Diseases (Enfermedades Laborales)

**Datos Capturados por Evento:**
- Usuario que ejecuta la acción (ID, rol, username)
- Tipo de acción (create, update, delete, view, export, access_report)
- Entidad afectada (tipo y ID)
- Titular de datos personales (dataSubjectId, dataSubjectName)
- Valores anteriores y nuevos (old_values, new_values)
- Campos modificados en updates (changed_fields)
- Contexto de la operación (IP address, User-Agent, Request ID)
- Timestamp con precisión de milisegundos
- Descripción legible de la operación

---

## Marco Legal

### Ley 1581/2012 - Protección de Datos Personales (Habeas Data)

**Artículo 17 - Deberes de los Responsables del Tratamiento:**
> "Los Responsables del Tratamiento de datos personales deberán: (...) g) Permitir el acceso a la información únicamente a las personas autorizadas para ello."

**Cumplimiento:**
- ✅ Registro de todos los accesos a datos personales de trabajadores
- ✅ Identificación del usuario y rol que realiza cada operación
- ✅ Trazabilidad completa de modificaciones y eliminaciones
- ✅ Captura de contexto técnico (IP, User-Agent) para investigaciones

### Decreto 1074/2015 - Reglamentación SST

**Artículo 2.2.4.6.13 - Conservación de Documentos:**
> "El empleador debe conservar los documentos que soporten el SG-SST de manera controlada, garantizando que sean legibles, fácilmente identificables y accesibles, protegidos contra daño, deterioro o pérdida."

**Cumplimiento:**
- ✅ Conservación permanente de registros de modificaciones
- ✅ Inmutabilidad de audit logs (solo inserción, no modificación)
- ✅ Indexación optimizada para consultas rápidas
- ✅ Estructura JSON para preservación de datos históricos

### Resolución 2346/2007 - Historia Clínica Ocupacional

**Artículo 13 - Modificaciones en la Historia Clínica:**
> "Toda modificación en la historia clínica debe estar identificada, fechada y firmada por el profesional responsable."

**Cumplimiento:**
- ✅ Registro de old_values antes de modificación
- ✅ Cálculo automático de changed_fields
- ✅ Identificación completa del usuario modificador
- ✅ Timestamp preciso de cada cambio

### ISO 27001:2013 - Anexo A.12.4.1

**Control:** Registro de Eventos de Seguridad
> "Los registros de eventos de seguridad de la información deben incluir: usuario, tipo de evento, fecha/hora, identificación del dispositivo, indicación de éxito o fallo."

**Cumplimiento:**
- ✅ Usuario identificado (ID, username, role)
- ✅ Tipo de evento (action enum)
- ✅ Timestamp con zona horaria
- ✅ IP address y User-Agent
- ✅ Request ID para correlación

---

## Arquitectura del Sistema

### Tabla `audit_logs`

```sql
CREATE TABLE audit_logs (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id VARCHAR NOT NULL REFERENCES companies(id),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  user_role TEXT NOT NULL,
  username TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action audit_action NOT NULL,  -- 'create', 'update', 'delete', 'view', 'export', 'access_report'
  data_subject_id TEXT,
  data_subject_name TEXT,
  old_values TEXT,               -- JSON string
  new_values TEXT,               -- JSON string
  changed_fields TEXT,           -- JSON array of field names
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  request_id TEXT,
  description TEXT,
  source TEXT DEFAULT 'api',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Índices Optimizados

1. **idx_audit_logs_company_id**: Filtrado por empresa (multi-tenant isolation)
2. **idx_audit_logs_entity_type_id**: Búsqueda por entidad específica
3. **idx_audit_logs_user_id**: Auditoría de actividad por usuario
4. **idx_audit_logs_timestamp**: Consultas cronológicas (DESC optimizado)
5. **idx_audit_logs_data_subject_id**: Derechos ARCO (Habeas Data)

### Flujo de Auditoría

```
HTTP Request
    ↓
Express Middleware (requireAuth)
    ↓
API Route Handler
    ↓
getAuditContext(req) → { ipAddress, userAgent, requestId }
    ↓
Storage Layer (createWorker/updateWorker/deleteWorker)
    ↓
Before mutation: Capture old_values (UPDATE/DELETE)
    ↓
Execute business logic mutation
    ↓
After mutation: logAuditEvent({ userId, action, oldValues, newValues, context })
    ↓
Calculate changed_fields (for UPDATE)
    ↓
Insert into audit_logs (non-disruptive error handling)
    ↓
Return result to client
```

---

## Consultas Comunes

### 1. Historial Completo de un Trabajador

```sql
SELECT 
  action,
  username,
  user_role,
  description,
  changed_fields,
  timestamp,
  ip_address
FROM audit_logs
WHERE entity_type = 'worker' 
  AND entity_id = '<worker_id>'
ORDER BY timestamp DESC;
```

**Caso de Uso:** Investigación de cambios no autorizados, auditorías de calidad de datos.

### 2. Actividad de un Usuario Específico

```sql
SELECT 
  entity_type,
  entity_id,
  action,
  data_subject_name,
  description,
  timestamp
FROM audit_logs
WHERE user_id = '<user_id>'
  AND timestamp >= NOW() - INTERVAL '30 days'
ORDER BY timestamp DESC
LIMIT 100;
```

**Caso de Uso:** Auditoría de usuario tras salida de la empresa, investigación de seguridad.

### 3. Cambios Recientes en Datos Personales (Habeas Data)

```sql
SELECT 
  data_subject_name,
  entity_type,
  action,
  changed_fields,
  username,
  timestamp
FROM audit_logs
WHERE company_id = '<company_id>'
  AND action IN ('update', 'delete')
  AND timestamp >= NOW() - INTERVAL '7 days'
ORDER BY timestamp DESC;
```

**Caso de Uso:** Reporte semanal de modificaciones para revisión de Oficial de Protección de Datos.

### 4. Accesos por IP Sospechosa

```sql
SELECT 
  username,
  user_role,
  entity_type,
  action,
  data_subject_name,
  timestamp
FROM audit_logs
WHERE ip_address = '<suspicious_ip>'
ORDER BY timestamp DESC;
```

**Caso de Uso:** Investigación de incidentes de seguridad.

### 5. Eliminaciones Masivas (Alerta de Seguridad)

```sql
SELECT 
  user_id,
  username,
  COUNT(*) as delete_count,
  MIN(timestamp) as first_delete,
  MAX(timestamp) as last_delete
FROM audit_logs
WHERE action = 'delete'
  AND timestamp >= NOW() - INTERVAL '1 hour'
GROUP BY user_id, username
HAVING COUNT(*) > 10
ORDER BY delete_count DESC;
```

**Caso de Uso:** Detección de eliminación masiva accidental o maliciosa.

### 6. Derechos ARCO - Portabilidad de Datos

```sql
SELECT 
  action,
  old_values,
  new_values,
  changed_fields,
  username,
  timestamp,
  description
FROM audit_logs
WHERE data_subject_id = '<worker_id>'
ORDER BY timestamp ASC;
```

**Caso de Uso:** Respuesta a solicitud de titular de datos bajo Ley 1581/2012 Art. 8 (Derecho a conocer).

---

## Exportación para Auditorías

### Script SQL: Exportación Completa para Auditoría Externa

```sql
-- Exportar audit logs de empresa específica (últimos 6 meses)
COPY (
  SELECT 
    al.id,
    c.name as company_name,
    c.nit as company_nit,
    al.timestamp,
    al.user_role,
    al.username,
    al.action,
    al.entity_type,
    al.data_subject_name,
    al.description,
    al.changed_fields,
    al.ip_address,
    al.request_id
  FROM audit_logs al
  JOIN companies c ON al.company_id = c.id
  WHERE al.company_id = '<company_id>'
    AND al.timestamp >= NOW() - INTERVAL '6 months'
  ORDER BY al.timestamp DESC
) TO '/tmp/audit_export_<company_nit>_<date>.csv' 
WITH (FORMAT CSV, HEADER, ENCODING 'UTF-8');
```

### Script Node.js: Exportación Programática

```typescript
// server/scripts/export-audit-logs.ts
import { db } from '../db';
import * as schema from '@shared/schema';
import { eq, gte, and } from 'drizzle-orm';
import fs from 'fs';

async function exportAuditLogs(
  companyId: string,
  startDate: Date,
  endDate: Date,
  outputPath: string
) {
  const logs = await db.select({
    timestamp: schema.auditLogs.timestamp,
    username: schema.auditLogs.username,
    userRole: schema.auditLogs.userRole,
    action: schema.auditLogs.action,
    entityType: schema.auditLogs.entityType,
    dataSubjectName: schema.auditLogs.dataSubjectName,
    description: schema.auditLogs.description,
    changedFields: schema.auditLogs.changedFields,
    ipAddress: schema.auditLogs.ipAddress,
  })
  .from(schema.auditLogs)
  .where(and(
    eq(schema.auditLogs.companyId, companyId),
    gte(schema.auditLogs.timestamp, startDate),
  ))
  .orderBy(schema.auditLogs.timestamp);

  // Convertir a CSV
  const csvHeader = 'Timestamp,Usuario,Rol,Acción,Entidad,Titular,Descripción,Campos Modificados,IP\n';
  const csvRows = logs.map(log => 
    `${log.timestamp?.toISOString()},${log.username},${log.userRole},${log.action},${log.entityType},${log.dataSubjectName || ''},${log.description},${log.changedFields || ''},${log.ipAddress || ''}`
  ).join('\n');

  fs.writeFileSync(outputPath, csvHeader + csvRows, 'utf-8');
  console.log(`✅ Exported ${logs.length} audit logs to ${outputPath}`);
}

// Uso:
// tsx server/scripts/export-audit-logs.ts <companyId> <startDate> <endDate> <outputPath>
```

---

## Política de Retención

### Requisitos Legales

| Normativa | Periodo de Retención Mínimo | Aplica a |
|-----------|------------------------------|----------|
| Decreto 1074/2015 Art. 2.2.4.6.13 | 20 años | Documentos SG-SST |
| Resolución 2346/2007 Art. 13 | 20 años | Registros médicos ocupacionales |
| Ley 1581/2012 Art. 11 | Mientras persista finalidad | Datos personales |
| ISO 27001 A.12.4 | Según política organizacional | Logs de seguridad |

### Política Recomendada

**Retención Online (PostgreSQL):**
- **2 años**: Audit logs accesibles directamente en base de datos
- **Consulta rápida**: Para operación diaria y auditorías recientes

**Archivado Largo Plazo (Cold Storage):**
- **18 años adicionales**: Exportación a formato CSV/JSON comprimido
- **Almacenamiento**: S3/Glacier, Wasabi, o tape backup
- **Encriptación**: AES-256 con key rotation anual
- **Integridad**: Checksums SHA-256 para validación

**Procedimiento de Archivado Anual:**

```bash
#!/bin/bash
# Archivar audit logs mayores a 2 años

YEAR=$(date -d "2 years ago" +%Y)
COMPANY_ID="<company_id>"
OUTPUT_FILE="audit_archive_${COMPANY_ID}_${YEAR}.csv.gz"

# Exportar
psql $DATABASE_URL -c "
  COPY (
    SELECT * FROM audit_logs
    WHERE company_id = '${COMPANY_ID}'
      AND EXTRACT(YEAR FROM timestamp) = ${YEAR}
  ) TO STDOUT WITH (FORMAT CSV, HEADER)
" | gzip > "/backup/audit_archives/${OUTPUT_FILE}"

# Verificar integridad
sha256sum "/backup/audit_archives/${OUTPUT_FILE}" > "/backup/audit_archives/${OUTPUT_FILE}.sha256"

# Eliminar de base de datos (opcional, si espacio es crítico)
# psql $DATABASE_URL -c "
#   DELETE FROM audit_logs
#   WHERE company_id = '${COMPANY_ID}'
#     AND EXTRACT(YEAR FROM timestamp) = ${YEAR}
# "

echo "✅ Archived audit logs for year ${YEAR}"
```

### Purga de Logs (Opcional)

**Solo si capacidad de almacenamiento es limitante:**

```sql
-- PRECAUCIÓN: Solo ejecutar tras confirmar archivado exitoso
DELETE FROM audit_logs
WHERE timestamp < NOW() - INTERVAL '2 years'
  AND company_id = '<company_id>';
```

**Recomendación:** Mantener todos los logs indefinidamente si el costo de storage lo permite. La Superintendencia del Trabajo puede solicitar evidencia histórica sin límite temporal.

---

## Procedimientos Operacionales

### Procedimiento 1: Respuesta a Solicitud de Derechos ARCO

**Escenario:** Trabajador solicita historial de modificaciones a sus datos (Ley 1581/2012 Art. 8)

**Pasos:**

1. **Verificar Identidad:**
   - Confirmar identidad del solicitante
   - Validar autorización para acceso a datos

2. **Consultar Audit Logs:**
   ```sql
   SELECT * FROM audit_logs
   WHERE data_subject_id = '<worker_id>'
   ORDER BY timestamp DESC;
   ```

3. **Generar Reporte:**
   - Exportar resultados a PDF/CSV
   - Incluir: Fecha, usuario, acción, campos modificados

4. **Entrega:**
   - Plazo máximo: 10 días hábiles (Ley 1581/2012 Art. 14)
   - Canal: Email seguro o entrega presencial

### Procedimiento 2: Investigación de Incidente de Seguridad

**Escenario:** Detección de acceso no autorizado a datos de trabajadores

**Pasos:**

1. **Identificar Alcance:**
   ```sql
   SELECT DISTINCT data_subject_id, data_subject_name
   FROM audit_logs
   WHERE user_id = '<suspected_user_id>'
     AND timestamp BETWEEN '<start>' AND '<end>';
   ```

2. **Análisis de Actividad:**
   - Revisar changed_fields para detectar modificaciones
   - Verificar IP addresses inusuales
   - Correlacionar con logs de autenticación

3. **Reporte al DPO/CISO:**
   - Documentar hallazgos
   - Proponer acciones correctivas
   - Notificación a SIC si aplica (Ley 1581/2012 Art. 17)

4. **Remediación:**
   - Revocar accesos comprometidos
   - Restaurar datos desde old_values si necesario
   - Actualizar políticas de acceso

### Procedimiento 3: Auditoría Mensual de Calidad de Datos

**Escenario:** Revisión periódica de integridad de datos personales

**Query de Auditoría:**

```sql
-- Modificaciones sin justificación (muchos cambios por mismo usuario)
SELECT 
  user_id,
  username,
  COUNT(DISTINCT entity_id) as workers_modified,
  COUNT(*) as total_changes,
  STRING_AGG(DISTINCT action::text, ', ') as actions
FROM audit_logs
WHERE entity_type = 'worker'
  AND timestamp >= NOW() - INTERVAL '1 month'
GROUP BY user_id, username
HAVING COUNT(*) > 50
ORDER BY total_changes DESC;
```

**Acciones de Seguimiento:**
- Entrevistar usuarios con actividad anómala
- Verificar que cambios sean legítimos
- Capacitar en manejo responsable de datos

---

## Extensión a Otras Entidades

### Implementación para Accidents (Accidentes de Trabajo)

**Paso 1: Extender Signatures de Storage**

```typescript
// server/storage.ts
export interface IStorage {
  // ... existing methods
  createAccident(accident: InsertAccident, companyId: string, userId?: string, auditContext?: AuditContext): Promise<Accident>;
  updateAccident(id: string, accident: Partial<InsertAccident>, companyId: string, userId?: string, auditContext?: AuditContext): Promise<Accident | undefined>;
  deleteAccident(id: string, companyId: string, userId?: string, auditContext?: AuditContext): Promise<void>;
}
```

**Paso 2: Instrumentar Storage Methods**

```typescript
async createAccident(accident: InsertAccident, companyId: string, userId?: string, auditContext?: AuditContext): Promise<Accident> {
  const [newAccident] = await db.insert(schema.accidents)
    .values({ ...accident, companyId })
    .returning();

  // Audit logging
  if (userId) {
    try {
      const user = await this.getUser(userId);
      const worker = await this.getWorker(newAccident.workerId, companyId);
      
      if (user) {
        await logAuditEvent({
          companyId,
          userId,
          userRole: user.role,
          username: user.username,
          entityType: 'accident',
          entityId: newAccident.id,
          action: 'create',
          newValues: newAccident,
          dataSubjectId: worker?.id,
          dataSubjectName: worker?.name,
          description: `Registered accident for worker: ${worker?.name}`,
          context: auditContext,
        });
      }
    } catch (auditError) {
      logger.error({ err: auditError, accidentId: newAccident.id }, 'Failed to log accident creation');
    }
  }

  return newAccident;
}
```

**Paso 3: Modificar Routes**

```typescript
// server/routes.ts
app.post("/api/accidents", requirePermission("accidents:create"), async (req, res) => {
  try {
    const validatedData = insertAccidentSchema.parse(req.body);
    const companyId = req.user!.companyId || "";
    
    // Audit logging context
    const userId = req.user!.id;
    const auditContext = getAuditContext(req);
    
    const accident = await storage.createAccident(validatedData, companyId, userId, auditContext);
    res.status(201).json(accident);
  } catch (error: any) {
    res.status(400).send(error.message);
  }
});
```

**Paso 4: Validar con Test**

```bash
tsx server/scripts/test-audit-logging-accidents.ts
```

### Priorización de Entidades

| Entidad | Prioridad Legal | Razón | Estado |
|---------|-----------------|-------|--------|
| Workers | 🔴 CRÍTICA | Ley 1581/2012 (Habeas Data) | ✅ Implementado |
| Accidents | 🔴 CRÍTICA | Decreto 1530/1996 (FURAT obligatorio) | ⏳ Pendiente |
| MedicalExams | 🔴 CRÍTICA | Resolución 2346/2007 (Historia clínica) | ⏳ Pendiente |
| OccupationalDiseases | 🟡 ALTA | Decreto 1477/2014 (Reporte obligatorio) | ⏳ Pendiente |
| Inspections | 🟢 MEDIA | Decreto 1072/2015 (Trazabilidad) | ⏳ Pendiente |
| Trainings | 🟢 MEDIA | Resolución 0312/2019 (Evidencia) | ⏳ Pendiente |

---

## Consideraciones de Seguridad

### Encriptación de Datos Sensibles

**Situación Actual:**
- old_values y new_values se almacenan en texto plano (JSON)
- Protección: Permisos de base de datos + SSL/TLS en tránsito

**Mejora Recomendada (Post-MVP):**

```typescript
import crypto from 'crypto';

function encryptSensitiveData(data: any, key: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(data), 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return JSON.stringify({
    iv: iv.toString('hex'),
    data: encrypted.toString('hex'),
    authTag: authTag.toString('hex'),
  });
}

// Uso en logAuditEvent():
await db.insert(schema.auditLogs).values({
  // ... otros campos
  oldValues: params.oldValues ? encryptSensitiveData(params.oldValues, ENCRYPTION_KEY) : null,
  newValues: params.newValues ? encryptSensitiveData(params.newValues, ENCRYPTION_KEY) : null,
});
```

**Gestión de Claves:**
- Rotar claves anualmente
- Almacenar en HSM o secrets manager (AWS KMS, Azure Key Vault)
- Documentar procedimiento de re-encriptación

### Control de Acceso a Audit Logs

**Roles con Permiso de Lectura:**
- ✅ Admin (super_admin): Acceso total
- ✅ DPO (Data Protection Officer): Acceso total para compliance
- ⚠️ CISO (Chief Information Security Officer): Solo para investigaciones
- ❌ Usuarios regulares: Sin acceso directo

**Implementación:**

```typescript
// server/routes.ts
app.get("/api/audit-logs", requireRole(['admin', 'dpo']), async (req, res) => {
  const { entityType, entityId, startDate, endDate } = req.query;
  
  const logs = await storage.getAuditLogs({
    companyId: req.user!.companyId,
    entityType: entityType as string,
    entityId: entityId as string,
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
  });
  
  res.json(logs);
});
```

---

## Métricas de Cumplimiento

### KPIs de Audit Logging

1. **Cobertura de Auditoría:**
   - Meta: 100% de operaciones CRUD en entidades reguladas
   - Actual: 100% para Workers (3/3 operations)

2. **Latencia de Logging:**
   - Meta: < 100ms adicional por operación
   - Método: Profiling con Pino logger

3. **Integridad de Logs:**
   - Meta: 0% de fallos en inserción de audit logs
   - Monitoreo: Alarmas en logger.error() para audit failures

4. **Tiempo de Respuesta a ARCO:**
   - Meta: < 5 días hábiles (normativa: 10 días)
   - Medición: Timestamp de solicitud vs. entrega

### Dashboard de Auditoría (Futuro)

```typescript
// Ejemplo de métricas para dashboard admin
interface AuditMetrics {
  totalLogs: number;
  logsByAction: Record<'create' | 'update' | 'delete', number>;
  logsByEntity: Record<string, number>;
  topUsers: Array<{ username: string; actionCount: number }>;
  recentChanges: Array<AuditLog>;
}
```

---

## Contacto y Soporte

**Preguntas sobre Audit Logging:**
- Equipo de Desarrollo: dev@sstcolombia.com
- Oficial de Protección de Datos: dpo@sstcolombia.com

**Solicitudes de Auditoría:**
- Compliance Team: compliance@sstcolombia.com
- Superintendencia del Trabajo: Contacto directo con empresa

---

**Historial de Versiones:**
- v1.0 (2025-11-11): Implementación inicial para Workers CRUD
- v1.1 (Planificado): Extensión a Accidents y MedicalExams
- v2.0 (Planificado): Encriptación de old_values/new_values

---

**Anexo Legal:**
- [Ley 1581 de 2012](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981)
- [Decreto 1074 de 2015](https://www.mintrabajo.gov.co/documents/20147/0/DUR+Sector+Trabajo+Actualizado+a+15+de+abril++de+2016.pdf)
- [Resolución 2346 de 2007](https://www.minsalud.gov.co/Normatividad_Nuevo/RESOLUCI%C3%93N%202346%20DE%202007.pdf)
