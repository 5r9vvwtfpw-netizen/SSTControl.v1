# 🚧 AUDIT LOGGING - IMPLEMENTACIÓN PENDIENTE

**Estado:** Schema creado, middleware pendiente  
**Prioridad:** Alta (Post-MVP)  
**Tiempo Estimado:** 8-12 horas

---

## ✅ COMPLETADO

### 1. Schema de Audit Logs

**Ubicación:** `shared/schema.ts`

```typescript
export const auditActionEnum = pgEnum("audit_action", [
  "create", "update", "delete", "view", "export", "access_report"
]);

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  
  // WHO
  userId: varchar("user_id").notNull().references(() => users.id),
  userRole: text("user_role").notNull(),
  username: text("username").notNull(),
  
  // WHAT
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  action: auditActionEnum("action").notNull(),
  
  // SUBJECT (Habeas Data)
  dataSubjectId: text("data_subject_id"),
  dataSubjectName: text("data_subject_name"),
  
  // CHANGES
  oldValues: text("old_values"),  // JSON snapshot
  newValues: text("new_values"),  // JSON snapshot
  changedFields: text("changed_fields"),  // Array de campos modificados
  
  // WHEN & WHERE
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  requestId: text("request_id"),
  
  // CONTEXT
  description: text("description"),
  source: text("source").default("api"),
  
  // IMMUTABILITY
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});
```

**Cumplimiento Legal:**
- ✅ Ley 1581/2012 (Habeas Data)
- ✅ Decreto 1074/2015 (Registros SST - 20 años)
- ✅ Resolución 2346/2007 (Historia clínica ocupacional)

---

## ⏳ PENDIENTE DE IMPLEMENTACIÓN

### 2. Audit Logging Middleware

**Objetivo:** Capturar automáticamente todas las operaciones CRUD en entidades reguladas.

**Entidades a Auditar:**
- `workers` (datos personales, médicos)
- `accidents` (reportes ARL)
- `medical_exams` (historia clínica)
- `trainings` (certificaciones)
- `occupational_diseases`
- `iperc_matrices`

**Enfoque Recomendado:**

#### Opción A: Storage Layer Wrappers (Recomendado)
Interceptar en `server/storage.ts`:

```typescript
// server/lib/audit-logger.ts
export async function logAuditEvent(
  companyId: string,
  userId: string,
  entityType: string,
  entityId: string,
  action: AuditAction,
  oldValues?: any,
  newValues?: any,
  requestContext?: { ipAddress: string; userAgent: string; requestId: string }
) {
  const user = await getUser(userId);
  
  // Calcular campos modificados si es update
  const changedFields = action === 'update' 
    ? Object.keys(newValues).filter(k => oldValues[k] !== newValues[k])
    : undefined;
  
  // Determinar data subject (trabajador afectado)
  let dataSubjectId, dataSubjectName;
  if (entityType === 'worker') {
    dataSubjectId = entityId;
    dataSubjectName = newValues?.name || oldValues?.name;
  } else if (newValues?.workerId || oldValues?.workerId) {
    const worker = await getWorker(newValues?.workerId || oldValues?.workerId);
    dataSubjectId = worker.id;
    dataSubjectName = worker.name;
  }
  
  await db.insert(schema.auditLogs).values({
    companyId,
    userId,
    userRole: user.role,
    username: user.username,
    entityType,
    entityId,
    action,
    dataSubjectId,
    dataSubjectName,
    oldValues: oldValues ? JSON.stringify(oldValues) : undefined,
    newValues: newValues ? JSON.stringify(newValues) : undefined,
    changedFields: changedFields ? JSON.stringify(changedFields) : undefined,
    ipAddress: requestContext?.ipAddress,
    userAgent: requestContext?.userAgent,
    requestId: requestContext?.requestId,
    description: `${action} ${entityType} ${entityId}`,
    source: 'api',
  });
}

// Wrapper en storage.ts
async createWorker(data: InsertWorker, userId: string, requestContext?: AuditContext) {
  const worker = await db.insert(schema.workers).values(data).returning();
  
  // Log audit event
  await logAuditEvent(
    data.companyId,
    userId,
    'worker',
    worker.id,
    'create',
    undefined,
    worker,
    requestContext
  );
  
  return worker;
}

async updateWorker(id: string, data: Partial<Worker>, userId: string, requestContext?: AuditContext) {
  // Fetch old values first
  const oldWorker = await this.getWorker(id);
  
  const updatedWorker = await db.update(schema.workers)
    .set(data)
    .where(eq(schema.workers.id, id))
    .returning();
  
  // Log audit event
  await logAuditEvent(
    oldWorker.companyId,
    userId,
    'worker',
    id,
    'update',
    oldWorker,
    updatedWorker,
    requestContext
  );
  
  return updatedWorker;
}
```

#### Opción B: Express Middleware (Alternativa)
Interceptar en `server/routes.ts`:

```typescript
// Middleware que captura request context
app.use((req, res, next) => {
  req.auditContext = {
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    requestId: req.requestId,
  };
  next();
});

// Wrapper en cada ruta
app.post('/api/workers', requireAuth, async (req, res) => {
  const worker = await storage.createWorker(
    req.body, 
    req.user!.id,
    req.auditContext  // Pass context para audit log
  );
  
  res.json(worker);
});
```

---

### 3. Database Schema Push

**Acción Requerida:**
```bash
npm run db:push
```

**Cuando aparezca el prompt:**
```
Is audit_action enum created or renamed from another enum?
❯ + audit_action                                  create enum  ← SELECCIONAR ESTA
  ~ estado_revision_direccion_enum › audit_action rename enum
  ~ rol_participante_revision_enum › audit_action rename enum
  ~ tipo_accion_revision_enum › audit_action      rename enum
```

Presionar **Enter** para seleccionar la primera opción (create enum).

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Setup Básico
- [ ] Crear `server/lib/audit-logger.ts` con función `logAuditEvent()`
- [ ] Hacer push del schema a base de datos (`npm run db:push`)
- [ ] Agregar tipo `AuditContext` a request types

### Fase 2: Storage Wrappers (Workers)
- [ ] Modificar `createWorker()` para log audit event
- [ ] Modificar `updateWorker()` para log audit event
- [ ] Modificar `deleteWorker()` (soft delete) para log audit event
- [ ] Test: Crear/actualizar/eliminar worker y verificar audit log

### Fase 3: Storage Wrappers (Otros)
- [ ] Accidents (create/update/delete)
- [ ] Medical Exams (create/update/delete)
- [ ] Trainings (create/update/delete)
- [ ] Occupational Diseases (create/update/delete)

### Fase 4: View Tracking (Habeas Data)
- [ ] Log `view` events en endpoints GET para workers
- [ ] Log `view` events en endpoints GET para medical exams
- [ ] Log `export` events en generación de PDFs (FURAT, worker docs)

### Fase 5: Testing
- [ ] Unit tests para `logAuditEvent()`
- [ ] Integration tests para CRUD operations
- [ ] Verificar snapshots JSON correctos (oldValues/newValues)
- [ ] Verificar campos modificados (changedFields)

### Fase 6: Queries & Reports
- [ ] Query: Historial de cambios de un trabajador
- [ ] Query: Accesos a datos personales (Habeas Data)
- [ ] Query: Actividad por usuario/rol
- [ ] Endpoint: `/api/audit-logs` (admin only)

---

## 🎯 CRITERIOS DE ACEPTACIÓN

**Audit Logging considerado COMPLETO cuando:**
- [x] Schema creado y documentado
- [ ] Schema pusheado a base de datos
- [ ] Middleware implementado para 5 entidades críticas
- [ ] Tests verifican audit logs en CRUD operations
- [ ] Snapshots JSON completos (oldValues + newValues)
- [ ] Campos modificados calculados correctamente
- [ ] Request context capturado (IP, userAgent, requestId)
- [ ] Data subject identificado (Habeas Data)
- [ ] Queries de consulta funcionan
- [ ] Documentación de uso actualizada

---

## 📊 ESFUERZO ESTIMADO

| Tarea | Horas |
|-------|-------|
| Audit logger utility | 2h |
| Storage wrappers (workers) | 2h |
| Storage wrappers (otros) | 3h |
| View tracking | 1h |
| Testing | 3h |
| Queries & endpoint | 1h |
| **TOTAL** | **12h** |

---

## 🔒 SEGURIDAD

**Consideraciones:**
1. **No PII en logs de aplicación:** Nunca logear audit logs con Pino (contienen datos sensibles)
2. **Acceso restringido:** Solo admins pueden consultar audit logs
3. **Inmutabilidad:** Audit logs NO tienen updatedAt, NO se pueden modificar/eliminar
4. **Retención:** 20 años (cumplimiento legal colombiano)

---

## 📞 NEXT STEPS

1. **Hacer schema push:** `npm run db:push` (30 segundos)
2. **Implementar audit logger utility:** `server/lib/audit-logger.ts` (2 horas)
3. **Wrapper en createWorker/updateWorker:** (2 horas)
4. **Tests básicos:** (2 horas)

**Bloqueador:** Schema push requerido antes de empezar implementación de middleware.

---

**Versión:** 1.0  
**Estado:** Documentación completa, implementación pendiente  
**Owner:** Equipo Backend SST Colombia
