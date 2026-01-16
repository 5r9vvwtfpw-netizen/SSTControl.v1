# PROGRAMA DE CAPACITACIÓN Y PREVENCIÓN
## Documentación Técnica del Sistema

---

## ÍNDICE

1. [Visión General](#visión-general)
2. [Marco Normativo](#marco-normativo)
3. [Marco Legal Vigente (2025)](#marco-legal-vigente-2025)
4. [Estructura del Programa de Capacitación](#estructura-del-programa-de-capacitación)
5. [Cronograma Anual](#cronograma-anual)
6. [Metodología](#metodología)
7. [Recursos](#recursos)
8. [Indicadores de Gestión](#indicadores-de-gestión)
9. [Documentación Obligatoria](#documentación-obligatoria)
10. [Capacitaciones Específicas según Resolución 0312/2019](#capacitaciones-específicas-según-resolución-03122019)
11. [Requisitos Legales Clave](#requisitos-legales-clave)
12. [Recomendaciones de Implementación](#recomendaciones-de-implementación)
13. [Arquitectura Técnica](#arquitectura-técnica)
14. [Funcionalidades](#funcionalidades)
15. [Esquema de Base de Datos](#esquema-de-base-de-datos)
16. [API Endpoints](#api-endpoints)
17. [Frontend - Componente](#frontend---componente)
18. [Flujos de Usuario](#flujos-de-usuario)
19. [Validaciones y Seguridad](#validaciones-y-seguridad)
20. [Diferencias con Programa de Capacitación Anual](#diferencias-con-programa-de-capacitación-anual)
21. [Métricas y Estadísticas](#métricas-y-estadísticas)
22. [Mejoras Futuras Sugeridas](#mejoras-futuras-sugeridas)
23. [Referencias](#referencias)
24. [Notas de Implementación](#notas-de-implementación)

---

## VISIÓN GENERAL

El módulo **Programa de Capacitación y Prevención** es un sistema simplificado para gestionar programas de capacitación en SST según la Resolución 0312/2019. Este módulo permite a las empresas registrar y mantener un historial de sus programas de capacitación con documentación adjunta.

### Características Principales

- Registro simple de programas de capacitación por fecha y título
- Gestión de documentos adjuntos (upload y descarga)
- Historial completo de programas registrados
- Operaciones CRUD completas (Crear, Leer, Actualizar, Eliminar)
- Multi-tenant con aislamiento por companyId
- Vista tabular de todos los programas

---

## MARCO NORMATIVO

### Resolución 0312/2019

Este módulo soporta el cumplimiento del **Estándar Mínimo 4** de la Resolución 0312/2019:

- **Capacitación en SST**: Las empresas deben establecer y documentar un programa de capacitación anual
- **Registro documental**: Mantener evidencia de los programas realizados
- **Retención**: Los documentos deben conservarse por 20 años

### Alcance Normativo

- Programa anual de capacitación
- Capacitaciones específicas según riesgos identificados
- Inducción y reinducción en SST
- Capacitación a COPASST y brigada de emergencias

---

## MARCO LEGAL VIGENTE (2025)

### Normativa Principal

1. **Decreto 1072 de 2015** - Decreto Único Reglamentario del Sector Trabajo (Arts. 2.2.4.6.11 y 2.2.4.6.8)
2. **Resolución 0312 de 2019** - Estándares Mínimos del SG-SST
3. **Ley 1562 de 2012** - Sistema de Gestión de SST
4. **Resolución 1890 de 2025** - Lineamientos generales SG-SST (NUEVA)
5. **Resolución 0728 de 2025** - Salud mental laboral (NUEVA)

---

## ESTRUCTURA DEL PROGRAMA DE CAPACITACIÓN

### 1. IDENTIFICACIÓN DE LA EMPRESA

- Razón social, NIT
- Actividad económica
- Nivel de riesgo (I-V)
- Número de trabajadores

### 2. OBJETIVOS

**General**: Prevenir accidentes y enfermedades laborales mediante formación continua

**Específicos**:
- Capacitar en identificación de peligros
- Promover cultura de autocuidado
- Cumplir normatividad vigente
- Reducir índices de accidentalidad

### 3. ALCANCE

- Todos los trabajadores (directos, contratistas, temporales)
- COPASST y Comité de Convivencia
- Brigadas de emergencia
- Personal administrativo y operativo

### 4. RESPONSABLES

- **Alta dirección**: Asignación de recursos
- **Responsable SG-SST**: Diseño y coordinación
- **ARL**: Asesoría técnica y capacitaciones gratuitas
- **Jefes de área**: Seguimiento y liberación de personal

### 5. TEMAS OBLIGATORIOS

Mínimo 4 capacitaciones anuales según normativa vigente.

#### A. Inducción y Reinducción en SST
- Política y objetivos de SST
- Peligros y riesgos del cargo específico
- Derechos y deberes en SST
- Procedimientos de reporte de incidentes
- Uso correcto de EPP

#### B. Identificación y Control de Riesgos
- Matriz de identificación de peligros
- Evaluación y valoración de riesgos
- Medidas de control (jerarquía de controles)
- Reconocimiento de peligros en el puesto de trabajo

#### C. Prevención de Accidentes y Enfermedades
- Reporte de condiciones peligrosas
- Investigación de incidentes
- Primeros auxilios
- Autocuidado y promoción de salud

#### D. Plan de Emergencias
- Respuesta ante emergencias
- Evacuación y punto de encuentro
- Brigada de emergencias
- Simulacros periódicos

#### E. Uso y Mantenimiento de EPP
- Selección adecuada según riesgo
- Uso correcto y ajuste
- Mantenimiento y almacenamiento
- Inspección previa y reemplazo

#### F. COPASST y Comité de Convivencia
- Conformación y funciones (Resolución 2013/1986 para COPASST)
- Derechos y obligaciones
- Prevención de acoso laboral (Resolución 3461/2025)
- Resolución de conflictos

#### G. Riesgos Específicos (según matriz de riesgos)
- **Riesgo locativo**: Orden, aseo, señalización
- **Riesgo mecánico**: Trabajo seguro con máquinas
- **Riesgo eléctrico**: Trabajo en alturas
- **Riesgo químico**: SGA (Sistema Globalmente Armonizado)
- **Riesgo biológico**: Bioseguridad
- **Riesgo ergonómico**: Pausas activas, higiene postural
- **Riesgo psicosocial**: Manejo del estrés, salud mental (NUEVO 2025)
- **Riesgo vial**: PESV (Resolución 40595/2022)

#### H. Vigilancia Epidemiológica
- Programas SVE específicos
- Mediciones ambientales
- Exámenes médicos ocupacionales

---

## CRONOGRAMA ANUAL

| Mes | Tema | Responsable | Duración | Población | Modalidad |
|-----|------|-------------|----------|-----------|-----------|
| Enero | Inducción nuevos trabajadores | Coord. SST | 2 horas | Nuevos | Presencial |
| Febrero | Plan de emergencias | Brigada | 3 horas | Todos | Mixta |
| Marzo | Riesgo psicosocial | Psicólogo | 2 horas | Todos | Virtual |
| Abril | Uso de EPP | ARL | 1 hora | Operativos | Presencial |
| ... | ... | ... | ... | ... | ... |

**Nota**: El cronograma debe adaptarse a las necesidades específicas de cada empresa

---

## METODOLOGÍA

- Talleres prácticos
- Charlas educativas
- Simulacros
- E-learning (plataformas virtuales)
- Evaluaciones de comprensión (pre/post test)

---

## RECURSOS

### Humanos
- Profesional SST con licencia
- Instructores certificados

### Técnicos
- Salones
- Equipos audiovisuales
- Plataforma LMS

### Financieros
- Presupuesto anual asignado

---

## INDICADORES DE GESTIÓN

| Indicador | Fórmula | Meta |
|-----------|---------|------|
| **Cobertura** | (Trabajadores capacitados / Total trabajadores) × 100 | Mayor o igual a 90% |
| **Cumplimiento** | (Capacitaciones realizadas / Programadas) × 100 | 100% |
| **Efectividad** | (Evaluaciones aprobadas / Total evaluaciones) × 100 | Mayor o igual a 85% |
| **Reducción accidentes** | [(Accidentes año anterior - Actual) / Anterior] × 100 | Variable |

---

## DOCUMENTACIÓN OBLIGATORIA

- Programa anual de capacitación aprobado
- Listas de asistencia (nombre, cédula, firma, cargo)
- Contenidos y material didáctico entregado
- Evaluaciones de comprensión aplicadas
- Certificados de capacitación emitidos
- Registro fotográfico
- Informes trimestrales de cumplimiento
- Acta de revisión con COPASST

**Conservación**: Mínimo 20 años desde el cese de actividades del trabajador

---

## CAPACITACIONES ESPECÍFICAS SEGÚN RESOLUCIÓN 0312/2019

| Capacitación | Frecuencia | Dirigido a | Horas |
|--------------|------------|------------|-------|
| Inducción SST | Al ingreso | Nuevos trabajadores | 2-4 |
| Reinducción SST | Anual | Todos | 2 |
| COPASST | Inicial + anual | Miembros comité | 50 inicial |
| Brigada emergencias | Semestral | Brigadistas | 8-16 |
| Primeros auxilios | Anual | Brigada y clave | 16 |
| Curso 50 horas SG-SST | Inicial | Responsable SST | 50 |
| Riesgos específicos | Según matriz | Por área/cargo | 1-4 |

---

## REQUISITOS LEGALES CLAVE

- **Frecuencia mínima**: 4 capacitaciones anuales (trimestral)
- **Horario**: Dentro de la jornada laboral
- **Instructores**: Personal idóneo y certificado
- **Evaluación**: Obligatoria con registro
- **Revisión COPASST**: Anual del programa
- **Actualización**: Según cambios normativos

---

## RECOMENDACIONES DE IMPLEMENTACIÓN

1. Planificar en diciembre el programa del año siguiente
2. Aprovechar recursos ARL (capacitaciones gratuitas)
3. Priorizar según matriz de riesgos de la empresa
4. Digitalizar todos los registros para auditorías
5. Evaluar efectividad mediante indicadores
6. Integrar al Plan de Trabajo Anual del SG-SST
7. Incluir nuevas resoluciones 2025 (salud mental, evaluaciones médicas)

---

## ARQUITECTURA TÉCNICA

### Stack Tecnológico

#### Backend
- **Framework**: Express.js + TypeScript
- **ORM**: Drizzle ORM
- **Base de datos**: PostgreSQL (Neon)
- **Upload**: Multer para gestión de archivos
- **Validación**: Zod schemas

#### Frontend
- **Framework**: React 18 + TypeScript
- **UI**: Shadcn UI + Tailwind CSS
- **State**: TanStack Query v5 para cache y mutaciones
- **Forms**: React Hook Form + Zod Resolver
- **Routing**: Wouter

### Estructura de Archivos

```
Programa de Capacitación y Prevención
├── shared/
│   └── schema.ts                           # Tabla programasCapacitacion + schemas Zod
├── server/
│   ├── storage.ts                          # IStorage interface + DB methods
│   └── routes.ts                           # API endpoints + Multer config
└── client/src/
    ├── pages/
    │   └── ProgramaCapacitacion.tsx        # Componente principal
    └── App.tsx                             # Ruta: /programa-capacitacion
```

---

## FUNCIONALIDADES

### 1. Gestión de Programas

#### Crear Programa
- **Campos requeridos**: Fecha, Título
- **Campo opcional**: Documento adjunto
- **Formato de fecha**: `YYYY-MM-DD`
- **Tipos de archivo permitidos**:
  - PDF (`.pdf`)
  - Word (`.doc`, `.docx`)
  - Excel (`.xls`, `.xlsx`)
  - Imágenes (`.jpg`, `.jpeg`, `.png`)
- **Tamaño máximo**: 10 MB

#### Editar Programa
- Modificar fecha y/o título
- Reemplazar documento adjunto (opcional)
- Conserva el documento anterior si no se sube uno nuevo

#### Eliminar Programa
- Confirmación obligatoria mediante `window.confirm()`
- Eliminación física del registro en BD
- **Nota**: El archivo físico no se elimina del servidor

#### Visualizar Documento
- Descarga/visualización directa del archivo adjunto
- Link directo desde la tabla de programas

### 2. Interfaz de Usuario

#### Tabla de Programas

| Columna | Descripción |
|---------|-------------|
| **Fecha** | Fecha del programa en formato DD/MM/YYYY (locale es-CO) |
| **Título** | Nombre descriptivo del programa |
| **Documento** | Link de descarga del archivo adjunto o "Sin documento" |
| **Acciones** | Botones de Editar y Eliminar |

#### Estado de Carga
- **Loading**: Muestra "Cargando..." mientras obtiene datos
- **Empty**: Muestra "No hay programas de capacitación registrados"
- **Error**: Toast destructivo con mensaje de error

#### Dialogs
- **Crear/Editar**: Modal con formulario
- **Título dinámico**: "Nuevo Programa" vs "Editar Programa"
- **Botones**: Cancelar / Guardar (o Actualizar)

---

## ESQUEMA DE BASE DE DATOS

### Tabla: `programas_capacitacion`

```typescript
export const programasCapacitacion = pgTable("programas_capacitacion", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  fecha: date("fecha").notNull(),
  titulo: text("titulo").notNull(),
  archivoUrl: text("archivo_url"),
  archivoNombre: text("archivo_nombre"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});
```

### Campos

| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| `id` | `varchar` | PK, UUID | Identificador único generado automáticamente |
| `companyId` | `varchar` | FK, NOT NULL | Referencia a la empresa (multi-tenant) |
| `fecha` | `date` | NOT NULL | Fecha del programa de capacitación |
| `titulo` | `text` | NOT NULL | Título descriptivo del programa |
| `archivoUrl` | `text` | NULLABLE | Ruta del archivo en servidor (`/uploads/programas-capacitacion/filename`) |
| `archivoNombre` | `text` | NULLABLE | Nombre original del archivo subido |
| `createdAt` | `timestamp` | NOT NULL, DEFAULT now() | Fecha de creación del registro |

### Zod Schemas

```typescript
export const insertProgramaCapacitacionSchema = createInsertSchema(programasCapacitacion)
  .omit({ id: true, createdAt: true, companyId: true })
  .extend({
    fecha: z.coerce.date(),
  });

export type InsertProgramaCapacitacion = z.infer<typeof insertProgramaCapacitacionSchema>;
export type ProgramaCapacitacion = typeof programasCapacitacion.$inferSelect;
```

---

## API ENDPOINTS

### Base URL: `/api/programas-capacitacion`

#### 1. GET `/api/programas-capacitacion`

Obtiene todos los programas de la empresa del usuario autenticado.

**Headers**:
```
Cookie: connect.sid=<session_cookie>
```

**Permisos**: `companies:view`

**Response 200**:
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "companyId": "company-123",
    "fecha": "2025-01-15",
    "titulo": "Programa Anual de Capacitación SST 2025",
    "archivoUrl": "/uploads/programas-capacitacion/abc123.pdf",
    "archivoNombre": "programa-sst-2025.pdf",
    "createdAt": "2025-10-22T10:30:00.000Z"
  }
]
```

---

#### 2. GET `/api/programas-capacitacion/:id`

Obtiene un programa específico por ID.

**Permisos**: `companies:view`

**Response 200**: Objeto ProgramaCapacitacion

**Response 404**: `"Programa de Capacitación no encontrado"`

---

#### 3. POST `/api/programas-capacitacion`

Crea un nuevo programa con archivo opcional.

**Headers**:
```
Content-Type: multipart/form-data
```

**Permisos**: `companies:edit`

**Body (FormData)**:
```
fecha: "2025-01-15"
titulo: "Programa de Capacitación SST 2025"
archivo: <File> (opcional)
```

**Multer Configuration**:
- **Campo**: `archivo` (single file)
- **Destino**: `uploads/programas-capacitacion/`
- **Filename**: `{timestamp}-{originalname}`
- **Límites**: 10 MB

**Response 200**:
```json
{
  "id": "...",
  "companyId": "...",
  "fecha": "2025-01-15",
  "titulo": "Programa de Capacitación SST 2025",
  "archivoUrl": "/uploads/programas-capacitacion/1729599000-programa.pdf",
  "archivoNombre": "programa.pdf",
  "createdAt": "2025-10-22T10:30:00.000Z"
}
```

**Response 400**: Errores de validación Zod

---

#### 4. PATCH `/api/programas-capacitacion/:id`

Actualiza un programa existente.

**Headers**:
```
Content-Type: multipart/form-data
```

**Permisos**: `companies:edit`

**Body (FormData)**:
```
fecha: "2025-02-20" (opcional)
titulo: "Programa Modificado" (opcional)
archivo: <File> (opcional)
```

**Response 200**: Objeto ProgramaCapacitacion actualizado

**Response 404**: `"Programa de Capacitación no encontrado"`

---

#### 5. DELETE `/api/programas-capacitacion/:id`

Elimina un programa.

**Permisos**: `companies:edit`

**Response 204**: Sin contenido (éxito)

**Response 400**: Error en eliminación

---

## FRONTEND - COMPONENTE

### Ubicación
`client/src/pages/ProgramaCapacitacion.tsx`

### Ruta
`/programa-capacitacion`

### Estado del Componente

```typescript
const [editingId, setEditingId] = useState<string | null>(null);
const [isDialogOpen, setIsDialogOpen] = useState(false);
const [selectedFile, setSelectedFile] = useState<File | null>(null);
const fileInputRef = useRef<HTMLInputElement>(null);
```

### React Query

#### Query
```typescript
const { data: programas = [], isLoading } = useQuery<ProgramaCapacitacion[]>({
  queryKey: ["/api/programas-capacitacion"],
});
```

#### Mutaciones

**Create**:
```typescript
const createMutation = useMutation({
  mutationFn: async (values: FormValues) => {
    const formData = new FormData();
    formData.append('fecha', values.fecha);
    formData.append('titulo', values.titulo);
    if (selectedFile) {
      formData.append('archivo', selectedFile);
    }
    // ... fetch POST
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/programas-capacitacion"] });
    toast({ ... });
    handleCancel();
  },
});
```

**Update**:
```typescript
const updateMutation = useMutation({
  mutationFn: async ({ id, values }) => {
    // Similar a create, pero PATCH
  },
});
```

**Delete**:
```typescript
const deleteMutation = useMutation({
  mutationFn: async (id: string) => {
    return await apiRequest("DELETE", `/api/programas-capacitacion/${id}`);
  },
});
```

### Form Schema

```typescript
const formSchema = insertProgramaCapacitacionSchema.extend({
  fecha: z.string().min(1, "Fecha es requerida"),
  titulo: z.string().min(1, "Título es requerido"),
});
```

### Validación de Archivos

```typescript
handleFileChange(e) {
  // 1. Validar tamaño máximo: 10 MB
  if (file.size > maxSize) { /* error */ }
  
  // 2. Validar tipo de archivo
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/jpg',
    'image/png',
  ];
  
  if (!allowedTypes.includes(file.type)) { /* error */ }
  
  // 3. Guardar archivo en estado
  setSelectedFile(file);
}
```

### Test IDs Implementados

| Elemento | Test ID |
|----------|---------|
| Botón crear | `button-crear-programa` |
| Input fecha | `input-fecha` |
| Input título | `input-titulo` |
| Input archivo | `input-archivo` |
| Botón cancelar | `button-cancelar` |
| Botón guardar | `button-guardar` |
| Fila programa | `row-programa-{id}` |
| Texto fecha | `text-fecha-{id}` |
| Texto título | `text-titulo-{id}` |
| Link archivo | `link-archivo-{id}` |
| Botón editar | `button-editar-{id}` |
| Botón eliminar | `button-eliminar-{id}` |

---

## FLUJOS DE USUARIO

### Flujo 1: Crear Nuevo Programa

```
1. Usuario hace click en "Nuevo Programa"
   ↓
2. Se abre Dialog con formulario vacío
   ↓
3. Usuario completa:
   - Fecha (date picker)
   - Título (text input)
   - Archivo (file input, opcional)
   ↓
4. Usuario valida archivo:
   - Tipo permitido
   - Tamaño menor a 10 MB
   ↓
5. Usuario hace click en "Guardar"
   ↓
6. Frontend envía FormData a POST /api/programas-capacitacion
   ↓
7. Backend valida con Zod schema
   ↓
8. Multer guarda archivo en /uploads/programas-capacitacion/
   ↓
9. Drizzle inserta registro en BD
   ↓
10. Response 200 con programa creado
    ↓
11. Frontend invalida cache y muestra toast de éxito
    ↓
12. Dialog se cierra, tabla se actualiza con nuevo registro
```

### Flujo 2: Editar Programa Existente

```
1. Usuario hace click en botón Editar (icono lápiz)
   ↓
2. Se abre Dialog con datos pre-cargados
   ↓
3. Usuario modifica campos deseados
   ↓
4. (Opcional) Usuario selecciona nuevo archivo
   ↓
5. Usuario hace click en "Actualizar"
   ↓
6. Frontend envía FormData a PATCH /api/programas-capacitacion/:id
   ↓
7. Backend actualiza solo los campos modificados
   ↓
8. Si hay nuevo archivo, Multer lo guarda y actualiza archivoUrl
   ↓
9. Response 200 con programa actualizado
   ↓
10. Frontend invalida cache y muestra toast
    ↓
11. Dialog se cierra, tabla refleja cambios
```

### Flujo 3: Eliminar Programa

```
1. Usuario hace click en botón Eliminar (icono basurero)
   ↓
2. window.confirm() muestra diálogo de confirmación nativo
   ↓
3. Si usuario confirma:
   ↓
4. Frontend envía DELETE /api/programas-capacitacion/:id
   ↓
5. Backend elimina registro de BD
   ↓
6. Response 204 (sin contenido)
   ↓
7. Frontend invalida cache y muestra toast
   ↓
8. Tabla se actualiza, registro desaparece
```

**Limitación actual**: El archivo físico no se elimina del servidor.

---

## VALIDACIONES Y SEGURIDAD

### Validaciones Frontend

#### Formulario
- **Fecha**: Requerida, formato `YYYY-MM-DD`
- **Título**: Requerido, mínimo 1 carácter
- **Archivo**: Opcional

#### Archivo
- **Tamaño máximo**: 10 MB
- **Tipos permitidos**:
  - PDF
  - Word (DOC, DOCX)
  - Excel (XLS, XLSX)
  - Imágenes (JPG, JPEG, PNG)

### Validaciones Backend

#### Zod Schema
```typescript
{
  fecha: z.coerce.date(),     // Conversión automática a Date
  titulo: z.string(),          // String no vacío
  archivoUrl: z.string().nullable(),
  archivoNombre: z.string().nullable(),
}
```

#### Multer Limits
```typescript
const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});
```

### Seguridad

#### Multi-Tenant
- Todos los queries incluyen `WHERE company_id = ?`
- `companyId` se obtiene de `req.user.companyId` (sesión)
- No es posible acceder a programas de otras empresas

#### Permisos RBAC
- **GET**: Requiere `companies:view`
- **POST/PATCH/DELETE**: Requiere `companies:edit`

#### Upload Seguro
- Archivos guardados fuera de `public/` con nombre único
- Path relativo almacenado en BD: `/uploads/programas-capacitacion/{filename}`
- Servido por Express static middleware

---

## DIFERENCIAS CON PROGRAMA DE CAPACITACIÓN ANUAL

Existen **DOS módulos** relacionados con capacitación en el sistema:

### 1. Programa de Capacitación y Prevención

**Ruta**: `/programa-capacitacion`

**Enfoque**: Registro simple de programas con documentos

| Característica | Implementación |
|----------------|----------------|
| **Campos principales** | Fecha, Título, Archivo |
| **Estructura** | Tabla simple con upload de documentos |
| **Uso** | Mantener historial de programas realizados |
| **Gestión de capacitaciones** | No gestiona capacitaciones individuales |
| **Normativa** | Resolución 0312/2019 (Estándar 4) |

### 2. Programa de Capacitación Anual

**Ruta**: `/programa-capacitacion-anual`

**Enfoque**: Gestión completa del programa anual con capacitaciones detalladas

| Característica | Implementación |
|----------------|----------------|
| **Campos principales** | Año, Título, Objetivos, Alcance, Población, Responsables, Recursos, etc. |
| **Estructura** | 3 tablas (programas, capacitaciones, asistencias) |
| **Uso** | Planificación y seguimiento completo del programa anual |
| **Gestión de capacitaciones** | Gestiona capacitaciones individuales con asistencia |
| **Normativa** | Decreto 1072/2015 (Art. 2.2.4.6.8 y 2.2.4.6.11) + Resolución 0312/2019 |
| **PDF** | Generación de reporte completo del programa |
| **Estados** | Borrador, Aprobado, Ejecutado, Cerrado |
| **COPASST** | Aprobación de COPASST requerida |

### Comparación Rápida

| Aspecto | Capacitación y Prevención | Capacitación Anual |
|---------|---------------------------|-------------------|
| **Complejidad** | Simple | Compleja |
| **Tablas DB** | 1 | 3 |
| **Upload archivos** | Sí | No |
| **Capacitaciones individuales** | No | Sí |
| **Asistencia** | No | Sí |
| **PDF** | No | Sí |
| **Objetivos** | No | Sí |
| **Recursos** | No | Sí (humanos, técnicos, financieros) |
| **Estado/Workflow** | No | Sí (4 estados) |

### Cuándo usar cada uno

**Usa Capacitación y Prevención si**:
- Solo necesitas mantener un historial de programas
- Tienes documentos PDF/Word ya elaborados
- No requieres gestión detallada de capacitaciones individuales
- Cumplimiento básico de Resolución 0312/2019

**Usa Capacitación Anual si**:
- Necesitas planificar el programa anual completo
- Requieres gestionar capacitaciones individuales
- Necesitas registro de asistencia
- Requieres PDF profesional auto-generado
- Cumplimiento completo de Decreto 1072/2015

---

## MÉTRICAS Y ESTADÍSTICAS

### Base de Datos
- **Tabla**: `programas_capacitacion`
- **Índices**: PK en `id`, FK en `companyId`
- **Tamaño promedio por registro**: ~500 bytes (sin archivo)
- **Archivos**: Almacenados en filesystem, no en BD

### Performance
- **Query GET all**: O(n) donde n = programas de la empresa
- **Query GET by ID**: O(1) con índice PK
- **Upload**: Depende del tamaño del archivo (max 10MB)

### Storage
- **Ubicación archivos**: `/uploads/programas-capacitacion/`
- **Formato nombre**: `{timestamp}-{originalname}`
- **Retención**: Archivos NO se eliminan automáticamente

---

## MEJORAS FUTURAS SUGERIDAS

### Funcionalidad
1. Eliminación física de archivos al borrar programa
2. Reemplazo de archivos al editar (eliminar archivo antiguo)
3. Validación de extensión en backend (actualmente solo en frontend)
4. Compresión de archivos grandes antes de almacenar
5. Vista previa de documentos PDF en modal

### UI/UX
1. Confirmación elegante con AlertDialog en vez de `window.confirm()`
2. Búsqueda y filtros por fecha, título
3. Paginación para listas largas
4. Drag & drop para upload de archivos
5. Progress bar durante upload

### Seguridad
1. Escaneo antivirus de archivos subidos
2. Cuota de storage por empresa
3. Rate limiting en endpoints de upload
4. Validación MIME type en backend

### Integración
1. Vínculo con módulo de Capacitación Anual
2. Notificaciones al crear/modificar programas
3. Export a Excel de tabla de programas
4. Audit log de cambios en programas

---

## REFERENCIAS

### Normativa Colombiana
- [Resolución 0312 de 2019](https://www.mintrabajo.gov.co/documents/20147/59995826/Resolucion+0312+de+2019.pdf) - Estándares Mínimos SST
- [Decreto 1072 de 2015](https://www.mintrabajo.gov.co/documents/20147/50711/DUR+Sector+Trabajo.pdf) - Decreto Único Reglamentario del Sector Trabajo

### Documentación Técnica
- [Drizzle ORM](https://orm.drizzle.team/)
- [TanStack Query v5](https://tanstack.com/query/latest)
- [Multer](https://github.com/expressjs/multer)
- [Shadcn UI](https://ui.shadcn.com/)

---

## NOTAS DE IMPLEMENTACIÓN

### Archivo Original
`client/src/pages/ProgramaCapacitacion.tsx` (442 líneas)

### Última Actualización
Octubre 2025 - Documentación creada y actualizada con Marco Legal Vigente 2025

### Autor del Módulo
Sistema SST Colombia - Desarrollo interno

### Estado
**Producción** - Módulo completamente funcional

---

**Fin del documento**
