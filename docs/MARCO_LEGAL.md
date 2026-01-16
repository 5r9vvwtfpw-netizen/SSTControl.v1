# Marco Legal y Guía de Cumplimiento
## Sistema SST Colombia

**Versión:** 1.0  
**Fecha:** Noviembre 2025  
**Estado:** Producción Ready

---

## Tabla de Contenidos

1. [Marco Legal Aplicable](#marco-legal-aplicable)
2. [Funcionalidades Implementadas](#funcionalidades-implementadas)
3. [Guía de Cumplimiento Operacional](#guía-de-cumplimiento-operacional)
4. [Procedimientos de ARCO](#procedimientos-de-arco)
5. [Gestión de Consentimientos](#gestión-de-consentimientos)
6. [Auditoría y Trazabilidad](#auditoría-y-trazabilidad)
7. [FAQ Legal](#faq-legal)

---

## Marco Legal Aplicable

### 1. Legislación Colombiana

#### **Ley 1581 de 2012 - Protección de Datos Personales (Habeas Data)**

**Artículos Clave:**
- **Art. 8**: Derechos de los titulares (Acceso, Rectificación, Cancelación, Oposición)
- **Art. 9**: Autorización del titular (consentimiento previo, expreso e informado)
- **Art. 12**: Deberes del responsable del tratamiento
- **Art. 13**: Deberes del encargado del tratamiento

**Decreto 1377 de 2013** - Reglamentación de la Ley 1581
**Decreto 1074 de 2015** - Registro Nacional de Bases de Datos (RNBD)

**Implementación en el Sistema:**
- ✅ Captura de consentimiento expreso en registro de trabajadores
- ✅ Sistema ARCO completo para ejercicio de derechos
- ✅ Políticas de privacidad accesibles y claras
- ✅ Audit trail completo de consentimientos y solicitudes

#### **Ley 1480 de 2011 - Estatuto del Consumidor**

**Artículos Clave:**
- **Art. 5**: Información mínima y responsabilidad
- **Art. 23-28**: Contratos a distancia y comercio electrónico
- **Art. 34**: Reversión del pago

**Implementación en el Sistema:**
- ✅ Términos de Servicio adaptados a legislación colombiana
- ✅ Información clara sobre servicios ofrecidos
- ✅ Cláusulas de responsabilidad y limitaciones

#### **Decreto 1072 de 2015 - Decreto Único Reglamentario del Sector Trabajo**

**Resolución 0312 de 2019** - Estándares Mínimos SG-SST

**Implementación en el Sistema:**
- ✅ Gestión completa de trabajadores con datos personales protegidos
- ✅ Registro de accidentes e incidentes con consentimiento
- ✅ Evaluaciones médicas con protección de datos de salud

### 2. Normativa Internacional

#### **GDPR (Reglamento General de Protección de Datos - UE 2016/679)**

**Artículos Aplicables:**
- **Art. 6**: Base legal para el tratamiento (consentimiento, ejecución de contrato)
- **Art. 13-14**: Información al interesado
- **Art. 15-21**: Derechos del interesado (acceso, rectificación, supresión, portabilidad, limitación)
- **Art. 28**: Acuerdos de procesamiento de datos
- **Art. 30**: Registro de actividades de tratamiento

**Implementación en el Sistema:**
- ✅ Acuerdo de Procesamiento de Datos (DPA) para clientes empresariales
- ✅ Soporte para derechos GDPR (portabilidad, limitación)
- ✅ Consentimiento granular por finalidad
- ✅ Registro de actividades de tratamiento en audit logs

---

## Funcionalidades Implementadas

### 1. Sistema de Consentimientos (Habeas Data)

**Ubicación:** `/trabajadores` (registro y edición)

**Características:**
- ✅ Checkbox obligatorio en registro de trabajadores
- ✅ Texto legal explícito con enlaces a políticas
- ✅ Versión de política capturada (`v1.0`)
- ✅ Timestamp de aceptación (ISO 8601)
- ✅ Usuario que registró el consentimiento (`recordedBy`)
- ✅ Visualización read-only en modo edición
- ✅ Protección multi-tenant estricta

**Base de Datos:**
```sql
Table: consent_records
- id (PK)
- companyId (FK, tenant isolation)
- workerId (FK)
- consentGiven (0/1)
- consentDate (timestamp)
- consentPurpose (text)
- policyVersion (varchar)
- recordedBy (FK to users)
- createdAt / updatedAt
```

**Endpoints API:**
```
GET    /api/consent-records          - Lista de consentimientos
GET    /api/consent-records/:id      - Detalle de consentimiento
GET    /api/consent-records/worker/:workerId - Por trabajador
POST   /api/consent-records          - Crear consentimiento
PATCH  /api/consent-records/:id      - Actualizar
POST   /api/consent-records/:id/revoke - Revocar consentimiento
```

### 2. Sistema ARCO (Derechos del Titular)

**Ubicación:** `/solicitudes-arco`

**Tipos de Solicitud Soportados:**

| Tipo | Descripción | Base Legal |
|------|-------------|------------|
| **Acceso** | Consultar qué datos personales se almacenan | Ley 1581 Art. 8 + GDPR Art. 15 |
| **Rectificación** | Corregir datos inexactos o incompletos | Ley 1581 Art. 8 + GDPR Art. 16 |
| **Cancelación** | Eliminar datos personales | Ley 1581 Art. 8 + GDPR Art. 17 (derecho al olvido) |
| **Oposición** | Objetar el tratamiento de datos | Ley 1581 Art. 8 + GDPR Art. 21 |
| **Portabilidad** | Transferir datos a otro responsable | GDPR Art. 20 |
| **Limitación** | Restringir el uso de datos | GDPR Art. 18 |

**Estados del Ciclo de Vida:**
1. **Pendiente** - Solicitud recibida, no asignada
2. **En Proceso** - Asignada y siendo procesada
3. **Completada** - Solicitud resuelta satisfactoriamente
4. **Rechazada** - Solicitud denegada (con justificación)
5. **Parcialmente Completada** - Cumplida parcialmente

**Base de Datos:**
```sql
Table: arco_requests
- id (PK)
- companyId (FK, tenant isolation)
- requestType (enum: acceso, rectificacion, cancelacion, oposicion, portabilidad, limitacion)
- status (enum)
- requesterName, requesterEmail, requesterPhone, requesterIdentification
- isRepresentative (0/1)
- dataSubjectName, dataSubjectIdentification (si es representante)
- requestDescription (text)
- specificDataRequested (text)
- justification (text)
- assignedTo (FK to users)
- escalatedTo, escalationReason
- responseDescription
- responseDate
- createdAt / updatedAt
```

**Endpoints API:**
```
GET    /api/arco-requests              - Lista de solicitudes
GET    /api/arco-requests/:id          - Detalle
POST   /api/arco-requests              - Crear solicitud
PATCH  /api/arco-requests/:id          - Actualizar
POST   /api/arco-requests/:id/assign   - Asignar a responsable
POST   /api/arco-requests/:id/escalate - Escalar
POST   /api/arco-requests/:id/complete - Completar
```

### 3. Documentos Legales

**Ubicaciones públicas (sin autenticación):**
- `/terminos-servicio` - Términos de Servicio
- `/politica-privacidad` - Política de Privacidad
- `/acuerdo-procesamiento-datos` - Data Processing Agreement (DPA)

**Contenido:**
- ✅ Adaptado a legislación colombiana
- ✅ Compliant con GDPR para clientes internacionales
- ✅ Versión y fecha de última actualización
- ✅ Lenguaje claro y accesible

### 4. Auditoría y Logging

**Sistema de Audit Logs:**
- ✅ Registro de todas las operaciones CRUD sobre trabajadores
- ✅ Captura de usuario, acción, campos modificados
- ✅ Metadata de contexto (IP, User-Agent, Request-ID)
- ✅ Logs estructurados en JSON (Pino)
- ✅ Correlation IDs para trazabilidad

**Compliant con:**
- Ley 1581/2012 (trazabilidad de tratamiento)
- GDPR Art. 30 (registro de actividades)

---

## Guía de Cumplimiento Operacional

### Paso 1: Registro de Nuevos Trabajadores

**Procedimiento:**

1. **Navegue a** `/trabajadores`
2. **Haga clic en** "Nuevo Trabajador"
3. **Complete el formulario** con datos personales
4. **OBLIGATORIO:** Marque el checkbox de consentimiento Habeas Data
   - ⚠️ El sistema NO permitirá guardar sin consentimiento explícito
5. **Guarde el trabajador**
   - El sistema ejecuta una transacción de dos etapas:
     1. Crea el registro del trabajador
     2. Registra el consentimiento en `consent_records`
   - Si falla el registro de consentimiento → Rollback automático del trabajador

**Validación Legal:**
- ✅ Consentimiento previo (antes del tratamiento)
- ✅ Consentimiento expreso (checkbox explícito)
- ✅ Consentimiento informado (texto con enlaces a políticas)
- ✅ Audit trail completo (quién, cuándo, qué versión de política)

### Paso 2: Gestión de Solicitudes ARCO

**Procedimiento de Recepción:**

1. **Recibir solicitud del titular** (email, carta, presencial)
2. **Ingresar a** `/solicitudes-arco`
3. **Crear nueva solicitud:**
   - Tipo de solicitud (Acceso, Rectificación, etc.)
   - Datos del solicitante
   - Descripción detallada de lo solicitado
   - Si actúa como representante → Datos del titular

**Plazos Legales (Ley 1581/2012):**
- ⏰ **10 días hábiles** para atender consultas (tipo: Acceso)
- ⏰ **15 días hábiles** para atender reclamos (Rectificación, Cancelación, Oposición)
- Extensión posible de **8 días hábiles** adicionales (justificado)

**Workflow de Procesamiento:**

```
1. PENDIENTE (solicitud recibida)
   ↓
2. ASIGNACIÓN (asignar a responsable)
   POST /api/arco-requests/:id/assign
   ↓
3. EN_PROCESO (investigación y preparación de respuesta)
   ↓
4. ESCALACIÓN (si requiere decisión superior)
   POST /api/arco-requests/:id/escalate
   ↓
5. COMPLETADA / RECHAZADA / PARCIALMENTE_COMPLETADA
   POST /api/arco-requests/:id/complete
```

**Ejemplo - Solicitud de Acceso:**

```
Solicitante: Juan Pérez (CC 1234567890)
Tipo: Acceso
Descripción: "Solicito conocer qué datos personales almacenan sobre mí"
Datos específicos: "Nombre, cédula, dirección, historial laboral, 
                    evaluaciones médicas, accidentes registrados"

Respuesta (dentro de 10 días hábiles):
1. Generar reporte con datos solicitados
2. Enviar al titular vía email o entrega física
3. Marcar solicitud como COMPLETADA en el sistema
4. Adjuntar descripción de respuesta entregada
```

### Paso 3: Revocación de Consentimientos

**Escenario:** Un trabajador solicita revocar su consentimiento

**Procedimiento:**

1. **Recibir solicitud escrita** del titular
2. **Evaluar implicaciones:**
   - ¿Es posible continuar la relación laboral sin el tratamiento?
   - ¿Existen obligaciones legales que requieren conservar datos?
3. **Si procede la revocación:**
   - Usar endpoint: `POST /api/consent-records/:id/revoke`
   - Sistema marca `consentGiven = 0`
   - Suspender tratamiento de datos no esenciales
4. **Si NO procede:**
   - Informar al titular las razones legales
   - Documentar en una solicitud ARCO tipo "Oposición" → RECHAZADA

**Base Legal:**
- Ley 1581 Art. 15: El titular puede revocar la autorización
- Excepción: Obligaciones legales (Código Sustantivo del Trabajo, seguridad social)

### Paso 4: Respuesta a Autoridades

**Superintendencia de Industria y Comercio (SIC):**

Si la SIC solicita información sobre cumplimiento:

1. **Evidencia de consentimientos:**
   ```sql
   SELECT * FROM consent_records WHERE companyId = :companyId;
   ```
   - Exportar tabla con timestamps, versiones de política, usuarios

2. **Registro de solicitudes ARCO:**
   ```sql
   SELECT * FROM arco_requests WHERE companyId = :companyId;
   ```
   - Demostrar cumplimiento de plazos
   - Evidenciar respuestas entregadas

3. **Políticas de privacidad vigentes:**
   - Proporcionar URLs públicas:
     - `https://[tu-dominio]/politica-privacidad`
     - `https://[tu-dominio]/terminos-servicio`

4. **Audit logs:**
   - Consultar logs de Pino para actividades de tratamiento
   - Demostrar trazabilidad completa

---

## Procedimientos de ARCO

### Acceso (Consulta)

**Objetivo:** Informar al titular qué datos se almacenan

**Procedimiento:**
1. Verificar identidad del solicitante (cédula, email)
2. Generar reporte con:
   - Datos personales almacenados
   - Finalidad del tratamiento
   - Transferencias realizadas (si aplica)
   - Tiempo de conservación
3. Entregar por canal seguro
4. Marcar solicitud como COMPLETADA

**Información a Entregar:**
```
Datos Almacenados:
- Nombre: Juan Pérez
- Cédula: 1234567890
- Email: juan.perez@example.com
- Cargo: Operario
- Exámenes médicos: [Listado con fechas]
- Accidentes reportados: [Listado con fechas]

Finalidad:
- Cumplimiento de obligaciones laborales
- Gestión de salud y seguridad en el trabajo (Decreto 1072/2015)
- Reportes a ARL y Ministerio del Trabajo

Conservación:
- Durante relación laboral + 20 años (Res. 1401/2007 - historias clínicas)
```

### Rectificación (Actualización)

**Objetivo:** Corregir datos inexactos, incompletos o desactualizados

**Procedimiento:**
1. Verificar evidencia del titular (documentos que soporten el cambio)
2. Actualizar campos en el sistema
3. Notificar a terceros si los datos fueron transferidos (ARL, EPS)
4. Confirmar al titular la actualización

**Ejemplo:**
```
Solicitud: "Mi apellido está mal escrito, es 'Gómez' no 'Gomés'"
Evidencia: Copia de cédula
Acción: Actualizar campo apellido en tabla workers
Estado: COMPLETADA
```

### Cancelación (Supresión)

**Objetivo:** Eliminar datos cuando no son necesarios o cuando el titular lo solicita

**Restricciones Legales (NO se puede suprimir si):**
- Obligación legal de conservación (ej: historias clínicas - 20 años)
- Defensa de derechos en procesos judiciales
- Relación contractual vigente

**Procedimiento:**
1. Evaluar si procede la supresión
2. **Si procede:**
   - Anonimizar o eliminar datos
   - Notificar a terceros
   - Confirmar al titular
3. **Si NO procede:**
   - Informar razones legales
   - Estado: RECHAZADA (con justificación)

**Ejemplo - RECHAZADA:**
```
Solicitud: "Eliminar mi historial de exámenes médicos ocupacionales"
Evaluación: Res. 1401/2007 obliga conservar 20 años
Respuesta: "No es posible eliminar debido a obligación legal [...].
            Los datos están protegidos y solo se usan para cumplimiento normativo"
Estado: RECHAZADA
Justificación: "Resolución 1401/2007 - conservación mínima 20 años"
```

### Oposición

**Objetivo:** Objetar el tratamiento de datos para finalidades específicas

**Procedimiento:**
1. Evaluar la finalidad objetada
2. **Si es finalidad opcional** (ej: marketing):
   - Suspender tratamiento para esa finalidad
   - Estado: COMPLETADA
3. **Si es finalidad esencial** (ej: nómina):
   - Explicar imposibilidad
   - Estado: RECHAZADA

### Portabilidad (GDPR)

**Objetivo:** Transferir datos a otro responsable

**Procedimiento:**
1. Generar archivo estructurado (JSON, CSV, XML)
2. Incluir solo datos proporcionados por el titular (no datos derivados)
3. Entregar por canal seguro
4. Estado: COMPLETADA

**Ejemplo:**
```json
{
  "nombre": "Juan Pérez",
  "cedula": "1234567890",
  "email": "juan.perez@example.com",
  "cargo": "Operario",
  "examenes_medicos": [
    {"fecha": "2024-03-15", "tipo": "Ingreso", "resultado": "Apto"}
  ]
}
```

### Limitación (GDPR)

**Objetivo:** Restringir el procesamiento temporalmente

**Procedimiento:**
1. Marcar datos como "limitados" (flag en BD)
2. Solo conservar, no procesar
3. Notificar a terceros
4. Estado: COMPLETADA

---

## Gestión de Consentimientos

### Elementos del Consentimiento Válido

Según **Ley 1581/2012 Art. 9**, el consentimiento debe ser:

1. **Previo:** Antes de iniciar el tratamiento
2. **Expreso:** Manifestación clara y afirmativa
3. **Informado:** El titular conoce finalidad, alcance, derechos

**Implementación en el Sistema:**

```typescript
// Texto del checkbox en registro de trabajadores
"He leído y acepto la Política de Privacidad y autorizo el tratamiento 
de mis datos personales conforme a la Ley 1581 de 2012 para las finalidades 
descritas en la Política de Privacidad (v1.0)"

[✓] Checkbox obligatorio
[ Ver Política de Privacidad ]  [ Ver Términos de Servicio ]
```

**Registro en Base de Datos:**
```typescript
{
  id: "uuid",
  companyId: "b635d9b0-...",
  workerId: "worker-uuid",
  consentGiven: 1,
  consentDate: "2025-11-11T14:30:00Z",
  consentPurpose: "Gestión laboral, salud ocupacional, cumplimiento normativo SST",
  policyVersion: "v1.0",
  recordedBy: "admin-user-id",
  createdAt: "2025-11-11T14:30:00Z"
}
```

### Finalidades del Tratamiento

Declaradas en **Política de Privacidad** (`/politica-privacidad`):

1. **Gestión de Relación Laboral**
   - Administración de nómina
   - Control de asistencia
   - Evaluaciones de desempeño

2. **Salud y Seguridad en el Trabajo**
   - Exámenes médicos ocupacionales
   - Investigación de accidentes
   - Programas de vigilancia epidemiológica

3. **Cumplimiento Normativo**
   - Reportes a Ministerio del Trabajo
   - Afiliaciones a seguridad social
   - Registros ante ARL

4. **Comunicaciones**
   - Notificaciones de capacitaciones
   - Alertas de seguridad
   - Información corporativa

### Casos Especiales: Datos Sensibles

**Datos de Salud (Categoría Especial - GDPR Art. 9):**

Requieren **consentimiento explícito** adicional:
- Resultados de exámenes médicos
- Diagnósticos ocupacionales
- Incapacidades médicas

**Implementación:**
- El consentimiento general cubre gestión SST
- Para investigaciones médicas → Consentimiento específico adicional

---

## Auditoría y Trazabilidad

### Sistema de Audit Logging

**Operaciones Auditadas:**
- ✅ Creación de trabajadores
- ✅ Actualización de datos personales
- ✅ Eliminación de registros
- ✅ Accesos a datos sensibles
- ✅ Exportaciones de datos

**Estructura del Log:**
```json
{
  "timestamp": "2025-11-11T14:30:00Z",
  "level": "INFO",
  "service": "sst-colombia",
  "env": "production",
  "requestId": "uuid",
  "userId": "admin-123",
  "userName": "Admin User",
  "action": "UPDATE",
  "resource": "workers",
  "resourceId": "worker-uuid",
  "changes": {
    "before": {"email": "old@example.com"},
    "after": {"email": "new@example.com"}
  },
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0 ...",
  "companyId": "b635d9b0-..."
}
```

### Consulta de Audit Logs

**Para auditorías internas o SIC:**

```bash
# Logs de modificaciones a un trabajador específico
grep "resourceId\":\"worker-123" /var/log/sst-colombia/audit.log

# Logs de usuario específico
grep "userId\":\"admin-123" /var/log/sst-colombia/audit.log

# Logs de acceso a datos sensibles en rango de fechas
grep "2025-11" /var/log/sst-colombia/audit.log | grep "workers"
```

### Retención de Logs

**Política:**
- **Logs operacionales:** 90 días
- **Audit logs de datos personales:** 5 años (Ley 1581 recomendación)
- **Backup cifrado:** AES-256, almacenamiento fuera de sitio

---

## FAQ Legal

### 1. ¿Qué hago si un trabajador se niega a dar consentimiento?

**Respuesta:**
- Explicar que el tratamiento de datos es **requisito esencial** para la relación laboral
- Sin consentimiento:
  - No se puede procesar nómina
  - No se pueden realizar exámenes médicos ocupacionales
  - No se puede cumplir con Decreto 1072/2015

**Base Legal:**
- Ley 1581 permite tratamiento sin consentimiento cuando existe **obligación legal** (Art. 10)
- Sin embargo, es buena práctica obtener consentimiento explícito

**Recomendación:**
- Educar al trabajador sobre protecciones del sistema
- Mostrar transparencia: acceso a políticas, ejercicio de derechos ARCO

### 2. ¿Cuánto tiempo debo conservar los datos de un ex-trabajador?

**Respuesta:**

| Tipo de Dato | Plazo de Conservación | Base Legal |
|--------------|----------------------|------------|
| Datos laborales generales | 20 años | Código Sustantivo del Trabajo |
| Historias clínicas ocupacionales | 20 años | Resolución 1401/2007 |
| Registros de accidentes | Permanente | Resolución 1401/2007 |
| Datos de nómina | 5 años | Estatuto Tributario |

**Después del plazo:**
- Anonimizar o eliminar datos
- Conservar solo agregados estadísticos

### 3. ¿Puedo transferir datos de trabajadores a la ARL sin consentimiento adicional?

**Respuesta:**
- **SÍ**, es una **obligación legal** (Ley 1562/2012)
- El consentimiento general ya incluye esta finalidad
- **Importante:** Informar en la Política de Privacidad los destinatarios (ARL, EPS, fondos de pensiones)

### 4. ¿Qué hago si la SIC me sanciona por incumplimiento?

**Prevención:**
1. Mantener políticas actualizadas
2. Atender solicitudes ARCO en plazos legales
3. Conservar evidencia de consentimientos
4. Realizar auditorías internas trimestrales

**Si ocurre sanción:**
1. Revisar actuación de la SIC
2. Subsanar de inmediato (si procede)
3. Interponer recursos (reposición, apelación)
4. Consultar abogado especializado en protección de datos

**Sanciones posibles (Ley 1581 Art. 23):**
- Multas hasta **2,000 SMLMV** (~$2,600 millones COP)
- Suspensión de actividades hasta 6 meses

### 5. ¿Cómo demuestro cumplimiento ante una auditoría?

**Checklist de Evidencia:**

✅ **Políticas y documentos:**
- [ ] Política de Privacidad publicada y accesible
- [ ] Términos de Servicio vigentes
- [ ] DPA para clientes empresariales

✅ **Consentimientos:**
- [ ] Tabla `consent_records` con todos los registros
- [ ] Versiones de política identificadas
- [ ] Audit trail de quién registró cada consentimiento

✅ **Solicitudes ARCO:**
- [ ] Tabla `arco_requests` con historial completo
- [ ] Respuestas entregadas dentro de plazos
- [ ] Justificaciones para solicitudes rechazadas

✅ **Seguridad:**
- [ ] Logs de acceso (Pino structured logs)
- [ ] Backups cifrados (AES-256)
- [ ] Política de retención de datos

✅ **Organización interna:**
- [ ] Responsable de protección de datos designado
- [ ] Capacitación a empleados en manejo de datos
- [ ] Procedimientos documentados (este documento)

### 6. ¿Qué hago si hay una brecha de seguridad (data breach)?

**Protocolo de Respuesta:**

**1. Contención (0-24 horas):**
- Identificar alcance de la brecha
- Aislar sistemas comprometidos
- Detener filtración de datos

**2. Evaluación (24-72 horas):**
- ¿Qué datos se vieron afectados?
- ¿Cuántos titulares impactados?
- ¿Hay riesgo para derechos y libertades?

**3. Notificación (72 horas - GDPR):**
- **A la SIC:** Si hay riesgo alto
- **A los titulares:** Si hay riesgo para sus derechos
- **Formato:** Descripción de la brecha, datos afectados, medidas adoptadas

**4. Documentación:**
- Registrar incidente en audit logs
- Informe técnico de causas
- Medidas correctivas implementadas

**Ejemplo de Notificación:**
```
Asunto: Notificación de Incidente de Seguridad

Estimado [Titular],

Le informamos que el [fecha] ocurrió un incidente de seguridad que 
pudo haber afectado sus datos personales almacenados en nuestro sistema SST.

Datos potencialmente afectados: Nombre, cédula, email

Medidas adoptadas:
1. Cambio inmediato de credenciales
2. Auditoría completa de sistemas
3. Reforzamiento de controles de acceso

Sus derechos: Puede ejercer sus derechos ARCO en /solicitudes-arco

Para más información: contacto@empresa.com
```

---

## Resumen Ejecutivo

### Cumplimiento Legal Alcanzado

✅ **Ley 1581/2012 (Habeas Data):**
- Sistema ARCO completo
- Registro de consentimientos
- Políticas de privacidad publicadas
- Audit trail de tratamiento

✅ **GDPR (Reglamento UE 2016/679):**
- Derechos de portabilidad y limitación
- DPA para procesamiento de datos
- Base legal documentada
- Registro de actividades

✅ **Ley 1480/2011 (Estatuto del Consumidor):**
- Términos de Servicio claros
- Información precontractual completa
- Cláusulas de responsabilidad

✅ **Decreto 1072/2015 (SG-SST):**
- Gestión de datos de trabajadores
- Protección de datos de salud
- Cumplimiento normativo SST

### Indicadores de Cumplimiento

| Indicador | Meta | Implementación |
|-----------|------|----------------|
| Consentimientos registrados | 100% de trabajadores | ✅ Obligatorio en registro |
| Plazos ARCO cumplidos | 100% en 10/15 días | ⏳ Monitorear en producción |
| Políticas accesibles | Disponibilidad 99.9% | ✅ Rutas públicas |
| Audit logs completos | Retención 5 años | ✅ Sistema implementado |
| Seguridad de datos | Cifrado + backups | ✅ AES-256 + DR plan |

### Próximos Pasos Recomendados

**Corto Plazo (1-3 meses):**
1. ✅ Capacitación a personal operativo en manejo de solicitudes ARCO
2. ✅ Registro ante RNBD de la SIC (si >100,000 titulares o datos sensibles masivos)
3. ✅ Auditoría interna de cumplimiento

**Mediano Plazo (3-6 meses):**
1. ✅ Implementar alertas automáticas de vencimiento de plazos ARCO
2. ✅ Dashboard ejecutivo de indicadores de cumplimiento legal
3. ✅ Certificación ISO 27001 (opcional, mejora credibilidad)

**Largo Plazo (6-12 meses):**
1. ✅ Revisión anual de políticas de privacidad
2. ✅ Actualización de consentimientos si cambian finalidades
3. ✅ Expansión a cumplimiento de otras normativas (ej: CCPA si opera en California)

---

**Documento preparado por:** Sistema SST Colombia  
**Última actualización:** Noviembre 2025  
**Versión:** 1.0 (Production Ready)

**Disclaimer:** Este documento es una guía de cumplimiento basada en las funcionalidades implementadas en el sistema. No constituye asesoría legal. Para interpretaciones específicas de la ley, consulte un abogado especializado en protección de datos.

---

## Anexos

### Anexo A: Plantillas de Respuesta ARCO

**Plantilla - Solicitud de Acceso COMPLETADA:**
```
Asunto: Respuesta a Solicitud de Acceso - Radicado [ID]

Estimado/a [Nombre],

En atención a su solicitud de acceso radicada el [Fecha], nos permitimos 
informarle los datos personales que almacenamos:

[DATOS ADJUNTOS EN FORMATO SEGURO]

Finalidad del tratamiento: [Descripción]
Tiempo de conservación: [Plazo legal]

Para cualquier actualización o ejercicio de otros derechos, puede ingresar 
a: https://[dominio]/solicitudes-arco

Atentamente,
[Responsable de Protección de Datos]
```

**Plantilla - Solicitud RECHAZADA:**
```
Asunto: Respuesta a Solicitud de [Tipo] - Radicado [ID]

Estimado/a [Nombre],

En atención a su solicitud radicada el [Fecha], lamentamos informar que 
NO es posible proceder con [cancelación/oposición] solicitada por las 
siguientes razones legales:

[Justificación Legal Específica]

Normativa aplicable: [Ley/Resolución]

Sin embargo, sus datos están protegidos bajo nuestra Política de Privacidad 
y solo se utilizan para las finalidades autorizadas.

Usted tiene derecho a presentar queja ante la SIC si considera vulnerados 
sus derechos: www.sic.gov.co

Atentamente,
[Responsable de Protección de Datos]
```

### Anexo B: Formulario Físico de Consentimiento

(Para casos donde no se usa el sistema digital)

```
AUTORIZACIÓN PARA TRATAMIENTO DE DATOS PERSONALES
Ley 1581 de 2012 - Habeas Data

Yo, _________________________________, identificado/a con cédula de 
ciudadanía No. __________________, de manera voluntaria y previamente 
informado/a, AUTORIZO a [NOMBRE EMPRESA] para:

[ ] Recolectar, almacenar, usar, circular y suprimir mis datos personales 
    con las siguientes finalidades:
    
    ✓ Gestión de relación laboral y nómina
    ✓ Salud y seguridad en el trabajo (SST)
    ✓ Cumplimiento de obligaciones legales
    ✓ Comunicaciones corporativas

[ ] Transferir mis datos a: ARL, EPS, Fondos de Pensión, Ministerio del Trabajo

DERECHOS DEL TITULAR:
He sido informado/a que puedo ejercer mis derechos de Acceso, Rectificación, 
Cancelación y Oposición (ARCO) en: https://[dominio]/solicitudes-arco

POLÍTICAS DISPONIBLES EN:
- Política de Privacidad: https://[dominio]/politica-privacidad
- Términos de Servicio: https://[dominio]/terminos-servicio

Firma: ___________________  Fecha: ______________  Ciudad: ______________
```

---

**FIN DEL DOCUMENTO**
