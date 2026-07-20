import type { Express, Request, Response, RequestHandler } from "express";
import OpenAI from "openai";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { chatbotQuestions, companies } from "@shared/schema";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  timeout: 30000,
  maxRetries: 1,
});

const promptCache = new Map<string, { prompt: string; expiresAt: number }>();
const PROMPT_CACHE_TTL = 5 * 60 * 1000;
const companyNameCache = new Map<string, { name: string; expiresAt: number }>();
const COMPANY_CACHE_TTL = 10 * 60 * 1000;

const APP_KNOWLEDGE_BASE = `
=== BASE DE CONOCIMIENTO: PLATAFORMA SST COLOMBIA ===

## NAVEGACIÓN PRINCIPAL
La plataforma usa navegación por pestañas horizontales siguiendo el ciclo PHVA (Planear-Hacer-Verificar-Actuar). En la barra superior hay pestañas: **Administración Global**, Planear, Hacer, Verificar, Actuar, y PESV (si la empresa tiene vehículos). Al hacer clic en cada pestaña se despliega un menú con las opciones disponibles. IMPORTANTE: No existe ninguna pestaña ni menú llamado "Configuración" — siempre di "Administración Global" cuando te refieras a ese menú.

## ROLES DE USUARIO
La plataforma tiene 11 roles con diferentes niveles de acceso:
- **Superadmin**: Acceso total al sistema, gestiona todas las empresas
- **Admin**: Administrador del proveedor SST, gestión de empresas y facturación
- **Soporte**: Equipo de soporte técnico
- **Empresa (empresa_admin)**: Administrador de la empresa cliente
- **Responsable SST (responsable_sst)**: Encargado del sistema SST en la empresa
- **Vigía SST (vigia_sst)**: Vigía de seguridad (empresas pequeñas <10 trabajadores)
- **Trabajador**: Empleado con acceso al portal de empleados
- **Coordinador PESV (coordinador_pesv)**: Coordinador del Plan de Seguridad Vial
- **Conductor**: Conductor de vehículos de la empresa
- **LSO Externo (lso_externo)**: Profesional licenciado en salud ocupacional externo
- **Asistente SST (asistente_sst)**: Asistente del área de SST

## ADMINISTRACIÓN GLOBAL
Acceso desde la pestaña "Administración Global" en la barra de navegación superior (NO se llama "Configuración" — ese nombre no existe en la plataforma).

### Gestión General
- **Empresas** → /empresas: Lista todas las empresas registradas. Desde aquí puedes ver detalles, editar datos, ver trabajadores de cada empresa. El botón "Crear Empresa" inicia un asistente de 2 pasos.
- **Usuarios** → /usuarios: Gestión de todos los usuarios del sistema. Crear, editar, desactivar usuarios. Asignar roles y empresas.
- **Portal de Empleados** → /portal-empleados: Panel administrativo de gestión del portal de trabajadores. Tiene 3 pestañas: (1) **Vista General**: estadísticas de acceso y últimos reportes enviados por empleados; (2) **Gestión de Accesos**: crear o revocar acceso al portal para trabajadores que tengan email registrado (uno por uno o todos en bloque); (3) **Historial de Accesos**: log de cuándo cada trabajador ingresó al portal. El portal del trabajador tiene 6 secciones: Mi Cuenta, Formación, Comunicación, Participación, Salud y PESV. **Sección PESV del Portal** (solo visible para conductores con rol "conductor"): incluye Comité de Seguridad Vial, Capacitaciones PESV, Encuesta Diaria (auto-reporte de aptitud antes de cada jornada según Art. 18 Res. 40595/2022), e Inspección Vehículo (lista de chequeo preoperacional de 16 ítems). Los registros de Encuesta e Inspección que el conductor hace desde su portal quedan automáticamente visibles para el admin en los módulos correspondientes de la Evaluación PESV.

### Administración Proveedor
- **Panel de Facturación** → /dashboard-facturacion: Dashboard con métricas de facturación, ingresos, suscripciones activas.
- **Promociones** → /admin-promociones: Gestión de cupones y promociones para clientes.
- **Mi Cuenta** → /mi-cuenta: Configuración personal del usuario, cambio de contraseña.
- **Tickets de Soporte** → /tickets-soporte: Sistema de tickets para reportar problemas o solicitar ayuda.
- **Gestión de Tickets (Admin)** → /admin-tickets: Panel de administración de tickets de soporte (solo admin/soporte).
- **Usuarios de Soporte** → /admin-usuarios-soporte: Gestión de usuarios del equipo de soporte.
- **Profesionales Licenciados** → /profesionales-licenciados: Registro y gestión de profesionales LSO externos.
- **Videos de Ayuda** → /admin-videos-ayuda: Gestión de videos tutoriales para usuarios.

### Comunicación Interna
- **Mensajes Internos** → /mensajes-internos: Sistema de mensajería interna entre usuarios.
- **Notificaciones** → /configuracion-notificaciones: Configuración de notificaciones por email y en la plataforma.

## PESTAÑA PLANEAR (P)
Corresponde a la fase de Planificación del ciclo PHVA.

### Personal
- **Trabajadores** → /trabajadores: Registro completo de trabajadores. Se pueden agregar individualmente o importar masivamente desde Excel. Cada trabajador tiene: datos personales, tipo de contrato, cargo, área, estado. Desde aquí se gestionan exámenes médicos, EPP, capacitaciones asignadas.
  - Para agregar un trabajador: Clic en "Agregar Trabajador" → llenar formulario → Guardar.
  - Para importar desde Excel: Clic en "Importar Excel" → descargar plantilla → llenar datos → subir archivo.
- **Perfiles de Cargo** → /perfiles-cargo: Definición de cargos con sus riesgos asociados, funciones, requisitos, EPP necesarios.
- **Afiliaciones SSSS** → /afiliaciones-ssss: Gestión de afiliaciones al Sistema de Seguridad Social (EPS, ARL, AFP, Caja de Compensación).

### Gestión Integral
- **Evaluación Inicial** → /evaluaciones-sst: Evaluaciones de cumplimiento según Resolución 0312/2019. Se crea una evaluación por año. La evaluación califica estándares mínimos según el tamaño y riesgo de la empresa (Capítulos I, II o III). Se puede generar PDF del informe.

### Otros módulos de Planear (accesibles desde submenús)
- **Asignación de Recursos** → /asignacion-recursos: Presupuesto y recursos asignados al SG-SST.
- **Designación de Responsable** → /designacion-responsable: Documentar quién es el responsable del SG-SST. Importante: primero debe asignar un LSO en el Directorio de Profesionales Licenciados. Luego, al crear una nueva designación desde el estándar 1.1.1, el sistema llena automáticamente todos los datos del LSO (nombre, cédula, licencia, vigencia, formación, curso 50h, ciudad).
- **Asignar LSO Externo** → /asignar-lso-externo: Asignar un profesional licenciado externo a su empresa. Este es el paso previo obligatorio antes de crear la designación del responsable del SG-SST.
- **Políticas SST** → /politicas-sst: Redactar y gestionar las políticas de SST de la empresa.
- **Partes Interesadas** → /partes-interesadas: Identificación de partes interesadas del SG-SST.
- **Análisis de Contexto** → /analisis-contexto: Análisis del contexto organizacional para SST.
- **Plan de Mejoramiento** → /plan-mejoramiento-contexto: Planes de mejoramiento del contexto.
- **Matriz Legal** → /matriz-legal: Identificación de requisitos legales aplicables (requiere suscripción).
- **Objetivos SST** → /objetivos-sst: Definición de objetivos e indicadores SST (requiere suscripción).
- **Conservación de Documentos** → /conservacion-documentos: Gestión documental del SG-SST.
- **Perfil Sociodemográfico** → /perfil-sociodemografico: Estadísticas sociodemográficas de los trabajadores. Cumple el requisito de la Resolución 2646/2008 Art. 8.
- **Organigrama SST** → /organigrama-sst: Visualización jerárquica de la estructura organizacional del SST. Muestra automáticamente: representante legal (de los datos de la empresa), integrantes del COPASST o Vigía SST (del período vigente), brigadas de emergencia. Soporta impresión del organigrama. Cumple el Decreto 1072/2015 Art. 2.2.4.6.8. NOTA: El organigrama se genera automáticamente con los datos ya registrados en la plataforma — no requiere ingresar información adicional.

## PESTAÑA HACER (H)
Corresponde a la fase de Implementación del ciclo PHVA.

### Panel Ejecutivo
- **Panel HACER - Controles** → /dashboard-hacer: Dashboard con métricas de ejecución: capacitaciones realizadas, inspecciones completadas, EPP entregados, etc.

### Módulos principales de Hacer
- **Capacitaciones** → /capacitaciones: Programar, registrar y hacer seguimiento de capacitaciones SST. Corresponde al **Estándar 1.2.1** (Programa de Capacitación Anual en SST) y **Estándar 1.2.2** (Inducción y Reinducción en SST). Para diligenciar: desde la Evaluación Inicial buscar el estándar 1.2.1 o 1.2.2 → clic en el módulo → clic "Nueva Capacitación" → completar: tema, tipo (inducción / reinducción / capacitación / entrenamiento), fecha, responsable, trabajadores asistentes, duración, evaluación de efectividad → Guardar. Los certificados se generan automáticamente. **Conexión Portal de Empleados**: Los trabajadores ven sus capacitaciones asignadas en Portal → Formación → "Capacitaciones". Ven las capacitaciones pendientes y el historial de las que ya recibieron.
- **Programa de Capacitación Anual** → /programa-capacitacion-anual: Cronograma anual de capacitaciones planificadas. Corresponde al **Estándar 1.2.1** (Programa de Capacitación Anual en SST).
- **Curso 50 Horas** → /curso-50-horas: Registro del curso virtual de 50 horas del SG-SST. Corresponde al **Estándar 1.2.3** (Responsables del SG-SST con curso virtual de 50 horas). Para diligenciar: buscar el estándar 1.2.3 → registrar nombre del responsable, institución que lo impartió, fecha de realización y número de certificado.
- **Registros de Inducción** → /registros-induccion: Control de inducciones y reinducciones de trabajadores. Corresponde al **Estándar 1.2.2** (Inducción y Reinducción en SST). Para diligenciar: clic "Nuevo Registro" → seleccionar trabajador → tipo (inducción / reinducción) → temas cubiertos → fecha → firma del trabajador. **Conexión Portal de Empleados**: Los trabajadores pueden ver el historial completo de sus propias inducciones en Portal → Formación → "Mis Inducciones" (vista de solo lectura). Además, el módulo "Inducciones Virtuales" del portal permite a los trabajadores completar contenido de inducción en línea con cuestionarios y materiales interactivos directamente desde su portal.
- **Configuración de Inducción** → /configuracion-induccion: Personalizar el contenido de la inducción virtual.
- **Inspecciones** → /inspecciones: Registrar inspecciones de seguridad (locativas, equipos, EPP, etc.). Corresponde al **Estándar 4.2.4** (Inspecciones a instalaciones, maquinaria o equipos). Para diligenciar: desde el estándar 4.2.4 → clic en el módulo → clic "Nueva Inspección" → seleccionar tipo (locativa / equipos / EPP / eléctrica / etc.) → área inspeccionada → hallazgos encontrados → clasificación del hallazgo (inmediato / a corto plazo / a largo plazo) → acciones correctivas con responsable y fecha → Guardar.
- **Entrega de EPP** → /entrega-epp: Registro de entrega de Elementos de Protección Personal a trabajadores. Corresponde al **Estándar 4.2.6** (Entrega de Elementos de Protección Personal EPP). Para diligenciar: desde el estándar 4.2.6 → clic en el módulo → clic "Nueva Entrega" → seleccionar trabajador → EPP entregados (tipo, referencia, cantidad) → fecha de entrega → firma de recibido del trabajador → Guardar.
- **Accidentes** → /accidentes: Reporte de accidentes e incidentes laborales. Corresponde a los **Estándares 3.2.1** (Reporte de AT e Incidente de Trabajo) y **3.2.3** (Registro y análisis estadístico de AT). Para diligenciar: desde la Evaluación Inicial buscar el estándar 3.2.1 → clic en el botón del módulo → clic "Nuevo Accidente" → completar: tipo de evento (Accidente de Trabajo / Incidente), trabajador afectado, fecha y hora, lugar, descripción detallada del accidente, parte del cuerpo afectada, tipo de lesión, días de incapacidad, severidad (Solo daños / Con heridos / Mortal) y medidas inmediatas tomadas → Guardar. El sistema actualiza automáticamente el indicador de accidentalidad.
- **Investigación de Accidentes** → /investigacion-accidentes: Investigación detallada de accidentes con árbol de causas. Corresponde al **Estándar 3.2.2** (Investigación de AT e Incidente de Trabajo). Para diligenciar: desde la Evaluación Inicial buscar el estándar 3.2.2 → clic en el módulo → seleccionar el accidente a investigar → completar: descripción del evento, causas inmediatas (actos y condiciones inseguras), causas básicas (factores personales y de trabajo), causa raíz, medidas correctivas y preventivas con responsable y fecha → Guardar. Plazo legal: AT graves o mortales dentro de los 15 días hábiles siguientes.
- **Árbol de Causas** → /arbol-causas: Metodología de análisis causal de accidentes. Vinculado al estándar 3.2.2.
- **Exámenes Médicos** → /examenes-medicos: Gestión de exámenes médicos ocupacionales (ingreso, periódicos, egreso). Requiere suscripción. **Conexión Portal de Empleados**: Los trabajadores pueden ver sus propios exámenes médicos en Portal → Salud → "Mis Exámenes Médicos". Ven los exámenes programados (pendientes de realizar) y el historial de exámenes completados con su concepto de aptitud. El trabajador puede confirmar que leyó el resultado con un clic.
- **Trabajadores Alto Riesgo** → /trabajadores-alto-riesgo: Identificación y seguimiento de trabajadores en actividades de alto riesgo.
- **Mediciones Ambientales** → /mediciones-ambientales: Registro de mediciones de ruido, iluminación, temperatura, etc. Requiere suscripción.
- **Conservación Auditiva** → /conservacion-auditiva: Programa de conservación auditiva. Incluye el registro de audiometrías por trabajador. **Conexión Portal de Empleados**: Los trabajadores pueden ver sus propios resultados de audiometría en Portal → Salud → "Mis Audiometrías". Ven las audiometrías programadas (pendientes) y el historial de las realizadas con su clasificación auditiva.
- **Sustancias Químicas** → /sustancias-quimicas: Inventario y manejo seguro de sustancias químicas. Requiere suscripción.
- **Vigilancia Epidemiológica** → /vigilancia-epidemiologica: Sistemas de vigilancia epidemiológica.
- **Actividades de Promoción y Prevención** → /actividades-promocion-prevencion: Registro de actividades de bienestar y prevención.
- **Estilos de Vida Saludable** → /estilos-vida-saludable: Programa de estilos de vida saludable.
- **IPERC** → /iperc: Identificación de Peligros, Evaluación de Riesgos y Controles.
- **Plan de Emergencias** → /plan-emergencias: Plan de prevención, preparación y respuesta ante emergencias.
- **Medidas Preventivas** → /medidas: Gestión de acciones preventivas y correctivas.
- **Evaluación de Proveedores** → /evaluacion-proveedores: Evaluación de contratistas y proveedores en SST. Requiere suscripción.
- **Gestión de Cambios** → /gestion-cambios: Gestión del cambio organizacional y su impacto en SST. Requiere suscripción.
- **Adquisiciones SST** → /adquisiciones-sst: Procedimiento de adquisiciones con criterios SST. Corresponde al **Estándar 2.9.1**. Requiere suscripción. Este es el PUNTO DE PARTIDA de todo ingreso de compra: primero se registra la adquisición aquí y luego, según qué se compró, el proceso continúa en el estándar correspondiente (EPP → 4.2.6, elementos de emergencia → 5.1.1). Ver detalle completo del flujo en el Estándar 2.9.1 más abajo.
- **Comunicación SST** → /comunicacion-sst: Plan de comunicaciones del SG-SST y canal bidireccional con empleados. Requiere suscripción. Tiene dos flujos: (A) **Admin → Trabajadores**: El admin crea comunicaciones (memorandos, circulares, políticas, alertas de seguridad) con destinatarios y canal (Portal de Empleados, cartelera, reunión, email). Los trabajadores las ven en el Portal → Comunicación → "Comunicaciones SST" y confirman su lectura con un clic. El sistema registra la fecha de lectura de cada trabajador. (B) **Trabajadores → Admin** (canal de retorno): Los trabajadores envían reportes de peligros, sugerencias, quejas o consultas desde el Portal → Comunicación → "Reportar Inquietud, Peligro o Sugerencia". El admin los ve en /portal-empleados → pestaña "Reportes de Empleados" y puede responder y marcar como resuelto.
- **Planes de Trabajo Anual** → /planes-trabajo-anual: Plan de trabajo anual del SG-SST con actividades y cronograma.

### COPASST / Vigía
- **COPASST Gestión** → /copasst o /copasst-gestion: Gestión del Comité Paritario de Seguridad y Salud en el Trabajo. Corresponde al **Estándar 1.1.6**. El módulo tiene 4 pestañas: (1) **Período Vigente**: crear el período de 2 años con "Nuevo Período"; (2) **Proceso Electoral**: proceso de nominación y votación donde los trabajadores participan desde el Portal de Empleados; (3) **Miembros**: integrantes elegidos del COPASST o Vigía; (4) **Actas Mensuales**: registro de reuniones mensuales obligatorias. Genera el Acta de Constitución en PDF.
- **Capacitación COPASST** → /capacitacion-copasst: Registro de capacitaciones a miembros del COPASST.
- **COPASST CMS** → /copasst-cms: Contenido y documentos del COPASST.
- **Evaluaciones COPASST** → /copasst-evaluaciones: Evaluación del funcionamiento del COPASST.
- **Comité de Convivencia** → /comite-convivencia-actas: Gestión del Comité de Convivencia Laboral. Corresponde al **Estándar 1.1.8**. El módulo tiene 4 pestañas: (1) **Período Vigente**: crear el período de 2 años con "Nuevo Período"; (2) **Proceso Electoral**: 5 fases secuenciales — Convocatoria → Inscripción → Votación (los trabajadores votan desde el Portal de Empleados) → Escrutinio → Completada; el empleador designa directamente sus 2 representantes; (3) **Miembros**: los 4 integrantes elegidos (2 del empleador + 2 trabajadores); (4) **Actas**: registro de reuniones bimestrales obligatorias con firma del presidente y secretario. Obligatorio para empresas con 10 o más trabajadores (Res. 652/2012 y 1356/2012).

## PESTAÑA VERIFICAR (V)
Corresponde a la fase de Verificación del ciclo PHVA.

### Panel Ejecutivo
- **Panel VERIFICAR - Indicadores** → /dashboard-verificar: Dashboard con indicadores de desempeño SST.

### Indicadores
- **Indicadores de Accidentalidad** → /indicadores-accidentalidad: Panel consolidado de todos los indicadores.
- **Índice de Severidad (ILI)** → /indicador-ili-incidentes: Índice de Lesiones Incapacitantes.
- **Frecuencia y Severidad** → /indicador-frecuencia-severidad: Índice de Frecuencia e Índice de Severidad de AT.
- **Mortalidad** → /indicador-mortalidad: Tasa de mortalidad por accidentes de trabajo.
- **Prevalencia** → /indicador-prevalencia: Prevalencia de enfermedad laboral.
- **Incidencia** → /indicador-incidencia: Incidencia de accidentes y enfermedad laboral.
- **Ausentismo** → /indicador-ausentismo: Indicadores de ausentismo laboral.

### Evaluaciones y Auditorías
- **Estándares SST** → /estandares-sst: Detalle de cumplimiento por estándar de la Resolución 0312/2019.
- **Evaluaciones SST** → /evaluaciones-sst: Evaluaciones anuales de cumplimiento.
- **Auditorías Internas** → /auditorias-internas: Programa de auditorías internas del SG-SST. Requiere suscripción.
- **Recomendaciones ARL** → /recomendaciones-arl: Seguimiento a recomendaciones de la ARL.

## PESTAÑA ACTUAR (A)
Corresponde a la fase de Mejora del ciclo PHVA.

### Panel Ejecutivo
- **Panel ACTUAR - Eficacia** → /dashboard-actuar: Dashboard de eficacia de acciones y mejora continua.

### Mejora Continua
- **Revisiones por la Dirección** → /revisiones-direccion: Actas de revisión por la alta dirección. Requiere suscripción.
- **Ausentismo Laboral** → /ausentismo-laboral: Análisis y seguimiento de ausentismo.

## MÓDULO PESV (Plan Estratégico de Seguridad Vial)
Solo disponible si la empresa tiene vehículos (numberOfVehicles > 0). Requiere suscripción.
Accesible desde la pestaña **"PESV"** en la barra de navegación superior.

El PESV tiene **24 pasos** organizados en el ciclo PHVA: Planear (P01-P08), Hacer (H01-H11), Verificar (V01-V03), Actuar (A01-A02). Se rige por la **Resolución 40595/2022** del Ministerio de Transporte.

### CÓMO INICIAR EL PESV - Flujo obligatorio

**IMPORTANTE**: Al igual que el SG-SST parte de la Evaluación Inicial, el PESV parte de la **Evaluación PESV**. Todos los 24 pasos se gestionan DENTRO de una evaluación activa. No se navega directamente a los módulos desde el menú lateral.

**Paso 1**: Ir a la pestaña **PESV** en la barra superior → seleccionar **"Evaluaciones PESV"** → abre '/pesv/evaluaciones'
**Paso 2**: Si no hay evaluación, clic **"Nueva Evaluación"** → el sistema crea la evaluación del año en curso y determina el **nivel de complejidad** automáticamente según el número de vehículos/conductores: **Básico** (≤10), **Estándar** (11-50), **Avanzado** (>50). El nivel define cuántos de los 24 pasos aplican: Básico tiene 20 pasos activos (H07, H08, H09 y V03 no aplican a este nivel)
**Paso 3**: Clic en la evaluación → abre el detalle con 4 pestañas: **Planear | Hacer | Verificar | Actuar**
**Paso 4**: Hacer clic en cada paso (P01, H01, V01, etc.) → se abre un panel lateral con: descripción del paso, estado de cumplimiento, preguntas de verificación, y un botón **"Ir al módulo"** que lleva directamente al módulo correspondiente dentro del contexto de la evaluación

### PESV - Módulos por paso (todos accesibles desde dentro de la Evaluación PESV)

**Fase PLANEAR (P01-P08):**
- **P01 - Conformación del equipo de trabajo** (módulo: Comité PESV) → botón "Ir al módulo" abre '/pesv/evaluacion/:id/comite' — Conformación del equipo PESV: integrantes del comité, actas de reunión, funciones y responsabilidades. El módulo tiene dos pestañas: **Integrantes** (miembros del equipo PESV) y **Cronograma** (reuniones planificadas).
  **Cómo agregar integrantes al equipo PESV:** En la pestaña "Integrantes", clic en "Agregar Integrante" → se abre el formulario con los campos: Vinculación con Trabajador (opcional), Nombre Completo, Cargo, Rol en el Equipo, Email, Teléfono, Fecha Ingreso, Funciones y Responsabilidades → completar → clic "Agregar".
  **FUNCIÓN ESPECIAL: Asignar el LSO del SG-SST como Líder PESV (flujo automático):** Si la empresa ya tiene asignado un LSO (externo o interno) como Responsable del SG-SST en el módulo de Designación de Responsables, el sistema lo detecta automáticamente. Al abrir el formulario "Agregar Integrante" y seleccionar el rol **"Líder PESV"** en el desplegable, aparece un banner azul de sugerencia: "LSO asignado al SG-SST detectado" con el nombre, licencia y cargo del LSO. El usuario tiene dos opciones: (1) clic **"Sí, usar LSO asignado"** → el sistema pre-llena automáticamente Nombre Completo y Cargo con los datos del LSO → solo falta confirmar y clic "Agregar"; (2) clic "No, ingresar manualmente" → los campos quedan en blanco para digitarlos manualmente. Esta función SOLO aparece al crear un integrante nuevo (no al editar), SOLO cuando se selecciona el rol "Líder PESV", y SOLO si la empresa ya tiene una designación SST activa con LSO asignado.
  **Conexión Portal de Empleados**: Los trabajadores pueden ver la información del comité y sus actividades en Portal → PESV → "Comité de Seguridad Vial".
- **P02 - Política de Seguridad Vial / Liderazgo** → botón abre '/pesv/evaluacion/:id/liderazgo' — Página informativa de liderazgo (Res. 40595/2022 Art. 5). Esta página es de **solo lectura** — NO tiene formulario para escribir texto. Muestra los 5 requisitos del paso (asignación de recursos, participación de la alta dirección, rendición de cuentas, promoción de cultura vial, revisión periódica), la frecuencia de revisión establecida (semestral según Decreto 1072/2015 Art. 2.2.4.6.31) y la lista de evidencias requeridas para acreditar el cumplimiento. La política de seguridad vial como documento se gestiona desde el módulo **Políticas SST** (/politicas-sst), no desde esta página. Para completar este paso en la evaluación PESV, el usuario debe adjuntar la evidencia documental directamente en el panel del paso P02 dentro de la Evaluación (usar el botón "Adjuntar evidencia") y marcar el estado de cumplimiento.
- **P03 - Diagnóstico / Contexto Organizacional** → botón abre '/pesv/evaluacion/:id/contexto-organizacional' — Diagnóstico de la organización: número de vehículos, rutas, conductores y factores de riesgo iniciales. Incluye el botón "Generar desde datos del sistema" que crea automáticamente hasta 14 factores contextuales con datos reales de la empresa.
  **Requisitos previos para la generación automática de P03:** Para que el botón "Generar desde datos del sistema" funcione con datos reales, la empresa debe tener diligenciados los siguientes módulos de la Evaluación PESV antes de ejecutar P03:
  1. **H04 - Vehículos Seguros** (/pesv/evaluacion/:id/vehiculos): registrar la flota vehicular con estado activo, SOAT y revisión técnico-mecánica.
  2. **H01 - Factor Humano / Conductores** (/pesv/evaluacion/:id/conductores): registrar los conductores activos con licencia, categoría y examen médico de aptitud para conducción.
  3. **H03 - Documentación y Comparendos** (panel de comparendos dentro de H01/Conductores): registrar las infracciones de tránsito del período actual para cada conductor.
  4. **H02 - Capacitación en Seguridad Vial** (/pesv/evaluacion/:id/capacitaciones): registrar las capacitaciones del plan PESV indicando su estado (completada o pendiente).
  5. **V02 - Registro y Análisis de Siniestros** (/pesv/evaluacion/:id/siniestros): registrar los siniestros viales ocurridos en el año en curso.
  6. **Trabajadores** (módulo SST /trabajadores): los trabajadores registrados en el SG-SST se usan para calcular el total de colaboradores de la organización.
  Sin estos datos el sistema genera igualmente 5 factores legales fijos (Resolución 40595/2022, Decreto 1079/2015 y normas ISO 39001). Con datos reales genera hasta 14 factores personalizados con cifras reales (ej: "3 siniestros en 2025", "2 conductores con licencia vencida"). El sistema no duplica factores si ya existen. Orden recomendado antes de P03: H04 → H01 → H03 → H02 → V02 → Trabajadores SST → luego P03.
- **P04 - Matriz de Riesgos Viales** → botón abre '/pesv/evaluacion/:id/matriz-riesgos' — Identificación, valoración y tratamiento de riesgos viales según metodología GTC-45 e ISO 31000. Es el módulo central donde se registran TODOS los riesgos de la empresa (ej: Ruido, colisiones, atropellamientos, fatiga, condiciones de vía). Cada riesgo tiene dos acciones clave: el botón **"Tratamiento"** para registrar el plan de control del riesgo, y el botón **"Sincronizar SST"** para enviar el riesgo a la Matriz IPERC del módulo SST (Planear → Identificación de Peligros).
  **Flujo completo de P04 — paso a paso:**
  PASO 1 — Agregar el riesgo: Evaluación PESV → paso P04 → "Ir al módulo" → botón "Agregar Riesgo". Complete los campos: nombre del riesgo (ej: "Ruido"), descripción/consecuencias (ej: "Hipoacusia, estrés, fatiga auditiva, trastornos del sueño"), categoría del factor (Factor Humano / Vehículo / Infraestructura / Condiciones Ambientales), probabilidad (Muy Baja / Baja / Media / Alta / Muy Alta) e impacto (Insignificante / Menor / Moderado / Mayor / Catastrófico). El sistema calcula automáticamente el Valor de Riesgo (P × I) y el Nivel de Riesgo (Bajo/Medio/Alto/Muy Alto/Crítico). Guarde el riesgo.
  PASO 2 — Generar el tratamiento: En la tarjeta del riesgo recién creado, clic en el botón **"Tratamiento"**. Se abre un panel con los tratamientos existentes y el botón "Agregar Tratamiento". Complete: tipo de tratamiento (Evitar el riesgo / Reducir el riesgo / Compartir/transferir el riesgo / Aceptar el riesgo), descripción de la medida de control, responsable, fecha límite y estado (pendiente/en progreso/completado). Clic "Guardar tratamiento". El estado del riesgo cambiará a "En Tratamiento" automáticamente.
  PASO 3 — Sincronizar al SST: En la misma tarjeta del riesgo, clic en el botón **"Sincronizar SST"**. El sistema crea automáticamente un peligro en la Matriz IPERC del SST con: clasificación "Condiciones de Seguridad", subcategoría "Seguridad Vial - [categoría]", descripción "[PESV] Nombre del riesgo: descripción", probabilidad y severidad convertidas de ISO 31000 (5×5) a GTC-45, observación "Sincronizado desde PESV - Riesgo [código]. Fundamento: Decreto 1072/2015 Art. 2.2.4.6.15". Si la empresa no tiene Matriz IPERC creada, el sistema crea una llamada "Matriz IPERC - Riesgos PESV Sincronizados" automáticamente.
  PASO 4 — Verificar la sincronización: Vaya a **Planear → Identificación de Peligros, Evaluación y Valoración de Riesgos (módulo IPERC)**. Abra la Matriz IPERC de la empresa. Busque el peligro que empieza con "[PESV]" — ahí debe aparecer el riesgo sincronizado. Este peligro contribuye al cumplimiento del **Estándar 4.1.1** de la Resolución 0312/2019 ("Metodología para identificación de peligros, evaluación y valoración de riesgos").
  **Nota importante sobre sincronización:** Si el botón "Sincronizar SST" ya fue usado antes en un riesgo, el sistema lo detecta y avisa "Este riesgo PESV ya está sincronizado en la matriz SST" sin duplicarlo. Cada riesgo solo se puede sincronizar una vez. Para ver el peligro vinculado, vaya directamente al módulo IPERC.
  **Conversión de niveles P04 → IPERC (automática):** Muy Baja/Baja → Baja; Media → Media; Alta → Alta; Muy Alta → Muy Alta. Insignificante/Menor → Ligeramente Dañino; Moderado → Dañino; Mayor/Catastrófico → Extremadamente Dañino.
- **P05 - Objetivos e Indicadores (Indicadores SPI)** → botón abre '/pesv/evaluacion/:id/indicadores' — Definir metas de reducción de siniestralidad y los Indicadores de Desempeño de Seguridad (SPI) según ISO 39001 Cláusula 9.1. Incluye el botón "Auto-calcular" en cada indicador para calcular el valor actual desde datos reales del sistema.
  **Requisitos previos para el auto-cálculo de P05:** El botón "Auto-calcular" disponible en el diálogo de medición de cada indicador consulta los siguientes módulos específicos:
  - Tasa de siniestralidad / mortalidad vial: requiere **V02 - Registro y Análisis de Siniestros** + **H04 - Vehículos Seguros**.
  - Índice de infracciones de tránsito (por 100 conductores): requiere **H03 - Documentación y Comparendos** + **H01 - Factor Humano / Conductores**.
  - % Cumplimiento de inspecciones preoperacionales: requiere **H06 - Inspecciones Preoperacionales** (/pesv/evaluacion/:id/inspecciones-vehiculos) + **H04 - Vehículos Seguros**.
  - % Cobertura de capacitación en seguridad vial: requiere **H02 - Capacitación en Seguridad Vial** + **H01 - Factor Humano / Conductores**.
  - % Cumplimiento del plan de mantenimiento vehicular: requiere **H05 - Mantenimiento Vehicular** (/pesv/evaluacion/:id/mantenimiento).
  - % Conductores con licencia vigente y examen médico: requiere **H01 - Factor Humano / Conductores** con los campos de vencimiento de licencia y examen médico diligenciados.
  Cómo usar: Evaluación PESV → paso P05 → "Ir al módulo" → seleccionar el indicador → clic "Medición" → en el diálogo aparece el botón "Auto-calcular" → el sistema calcula y completa el valor con una nota explicativa. Los indicadores sin datos disponibles muestran un aviso ámbar para ingreso manual.
- **P06 - Programas y Planes / Factores de Desempeño SPF** → botón abre '/pesv/evaluacion/:id/factores-desempeno' — Gestión de los Factores de Desempeño de Seguridad (SPF) según ISO 39001:2012 Cláusula 6.3. Incluye catálogo de 16 factores predefinidos y funcionamiento totalmente automático: al seleccionar un factor del catálogo, el sistema completa TODOS los campos automáticamente (Nombre, Descripción, Categoría, Elemento Relacionado, Unidad de Medida, Meta Anual, Valor Base y Valor Actual) consultando los datos reales del sistema. El **Valor Base** y el **Valor Actual** se calculan en ese momento desde los módulos fuente. Si el módulo no tiene datos registrados aún, ambos valores quedan en 0 con un panel amarillo indicando qué módulo debe completar.
  **Módulos fuente exactos que alimentan P06 (por tipo de factor):**
  - **Factor: Cumplimiento del plan de mantenimiento vehicular** → fuente: **H05 - Mantenimiento Vehicular**. Fórmula: mantenimientos preventivos realizados en el año / total de mantenimientos registrados × 100. Valor Base = ese porcentaje al momento de crear. Requiere: ingresar mantenimientos en PESV → H05, clasificando cada uno como "preventivo" o "correctivo".
  - **Factor: Cumplimiento de inspecciones preoperacionales** → fuente: **H06 - Inspecciones Preoperacionales** + **H04 - Vehículos**. Fórmula: inspecciones realizadas / (flota × días laborales × meses) × 100. Requiere: registrar inspecciones en PESV → H06 y tener vehículos activos en H04.
  - **Factor: Cobertura de capacitación en seguridad vial** → fuente: **H02 - Capacitación en Seguridad Vial** + **H01 - Conductores**. Fórmula: capacitaciones con estado "completada" / total de capacitaciones del año × 100. Requiere: registrar capacitaciones en PESV → H02 con estado "completada".
  - **Factor: Porcentaje de vehículos con documentación vigente** → fuente: **H04 - Vehículos Seguros**. Fórmula: vehículos con SOAT vigente Y revisión técnico-mecánica vigente / total vehículos activos × 100. Requiere: tener los campos "Vencimiento SOAT" y "Vencimiento RTM" diligenciados en cada vehículo activo en H04.
  - **Factor: Cobertura de exámenes médicos ocupacionales para conductores** → fuente: **H01 - Factor Humano / Conductores**. Fórmula: conductores activos con "Fecha vencimiento examen médico" vigente / total conductores activos × 100. Requiere: campo "Fecha vencimiento examen médico de aptitud" completado en cada conductor en H01.
  - **Factor: Porcentaje de conductores con licencia vigente y categoría apropiada** → fuente: **H01 - Factor Humano / Conductores**. Fórmula: conductores activos con "Fecha vencimiento licencia" vigente / total conductores activos × 100. Requiere: campo "Fecha vencimiento licencia de conducción" completado en cada conductor en H01.
  - **Factor: Índice de infracciones de tránsito** → fuente: **H03 - Documentación y Comparendos** + **H01 - Conductores**. Fórmula: número de comparendos registrados en el año / total conductores activos × 100. Requiere: registrar comparendos en el panel de cada conductor dentro de H01 (sección "Comparendos y Multas").
  - **Factor: Tasa de siniestralidad vial / Tasa de mortalidad vial** → fuente: **V02 - Registro y Análisis de Siniestros** + **H04 - Vehículos**. Fórmula tasa siniestros: siniestros del año / total vehículos × 100. Fórmula mortalidad: fallecidos del año / total trabajadores × 100.000. Requiere: registrar siniestros en PESV → V02 y tener flota y trabajadores registrados.
  - **Factor: Índice de severidad** → fuente: **V02 - Siniestros**. Fórmula: total heridos en siniestros del año / total siniestros del año. Requiere: campo "Número de heridos" diligenciado en cada siniestro en V02.
  - **Factores de exposición** (kilómetros recorridos, horas de conducción, número de viajes, número de conductores activos): estos NO tienen cálculo automático porque requieren datos de GPS u odómetro que el sistema no registra. Se ingresan manualmente. Para conductores activos, el sistema puede calcular desde H01.
  Cómo usar P06 completamente automatizado: (1) Evaluación PESV → paso P06 → "Ir al módulo". (2) Clic en "Agregar Factor". (3) Seleccionar un factor del desplegable "Auto-completar desde catálogo ISO 39001" — el sistema INMEDIATAMENTE completa todos los campos incluyendo Valor Base y Valor Actual desde los módulos fuente. (4) Si aparece panel verde: el valor fue calculado con datos reales. (5) Si aparece panel amarillo: el módulo fuente no tiene datos; complete ese módulo y luego use el botón "Auto-calcular" para actualizar. (6) Clic "Guardar". También disponible: botón "Generar X Factores ISO" que crea todos los factores estándar de una vez, calculando los valores automáticamente para cada uno. Orden recomendado antes de P06: **H04** (vehículos con SOAT/RTM) → **H01** (conductores con fechas de licencia y examen) → **H03** (comparendos) → **H02** (capacitaciones con estado "completada") → **H05** (mantenimientos preventivos/correctivos) → **H06** (inspecciones preoperacionales) → **V02** (siniestros con heridos y fallecidos) → luego **P03** → **P05** → **P06**.
- **P07 - Roles y Responsabilidades** → gestionado desde el panel del paso P07 — Documentar quién hace qué dentro del PESV
- **P08 - Recursos** → gestionado desde el panel del paso P08 — Presupuesto, equipos y personal asignado al PESV

**Fase HACER (H01-H11):**
- **H01 - Factor Humano / Conductores** → botón abre '/pesv/evaluacion/:id/conductores' — Registro de conductores: datos personales, categoría de licencia, fecha de vencimiento, exámenes médicos de aptitud para conducción, historial de infracciones
- **H02 - Capacitación en Seguridad Vial** → botón abre '/pesv/evaluacion/:id/capacitaciones' — Registro de capacitaciones de seguridad vial. IMPORTANTE: este módulo es DIFERENTE al módulo SST de Capacitaciones (Estándares 1.2.1/1.2.2); el H02 es exclusivo del PESV y se accede desde la Evaluación PESV, NO desde la Evaluación Inicial. El módulo tiene **plantillas pre-llenadas** para los temas más comunes (manejo defensivo, normativa de tránsito, primeros auxilios viales, seguridad para peatones y ciclistas, etc.) — al seleccionar una plantilla se auto-completan todos los campos. Campos a diligenciar: Título, Descripción, Instructor, Fecha, Hora Inicio, Hora Fin, Ubicación, Temas, Asistentes Esperados (número total de participantes), Estado (programada / en-curso / completada / cancelada). Al guardar queda el registro de la capacitación. **Conexión Portal de Empleados**: Los trabajadores pueden ver las capacitaciones PESV programadas y realizadas en Portal → PESV → "Capacitaciones PESV".
- **H03 - Documentación y Comparendos de Conductores** → ruta: '/pesv/conductores' (o desde evaluación: '/pesv/evaluacion/:id/conductores') — Este módulo tiene tres funciones principales:
  **1. REGISTRAR UN CONDUCTOR**: Clic en "+ Nuevo Conductor" → en el campo "Trabajador" seleccionar el trabajador del listado (el sistema auto-completa nombre y cédula desde el módulo SST de Trabajadores — el trabajador DEBE existir previamente en Planear → Trabajadores antes de poder registrarlo como conductor PESV) → completar datos de licencia (número, categoría A1/A2/B1/B2/B3/C1/C2/C3, fecha de vencimiento) → opcionalmente tipo de sangre, contacto de emergencia, vencimiento del examen médico → Guardar.
  **2. SEGUIMIENTO DE LICENCIAS**: La tabla muestra vencimientos de licencias y exámenes médicos. El sistema genera alertas automáticas cuando están próximos a vencer.
  **3. COMPARENDOS (infracciones de tránsito)**: en la tabla de conductores, cada fila tiene un botón de triángulo naranja (⚠) en la columna Acciones. Al hacer clic se abre el panel de comparendos de ese conductor con todo su historial de infracciones. Pasos exactos para registrar un comparendo: (1) en la fila del conductor, clic en el ícono de triángulo naranja, (2) en el formulario seleccionar el vehículo/placa del desplegable (carga automático de la flota registrada en H04), (3) seleccionar la fecha, tipo de infracción (12 categorías predefinidas: exceso de velocidad, semáforo en rojo, uso de celular, alcohol, licencia vencida, etc.), estado (Pendiente/Pagado/Recurrido/Prescrito), opcionalmente el número de comparendo y valor en COP, (4) clic en "Registrar comparendo". El conductor se vincula automáticamente — no se digita su nombre. REQUISITO: para usar el selector de placa deben existir vehículos registrados en H04 (Vehículos Seguros).
- **H04 - Vehículos Seguros** → botón abre '/pesv/evaluacion/:id/vehiculos' — Inventario de vehículos: placa, marca, modelo, año, tipo, SOAT (vencimiento), revisión tecnomecánica (vencimiento), tarjeta de operación. El sistema alerta vencimientos
- **H05 - Mantenimiento Vehicular** → botón abre '/pesv/evaluacion/:id/mantenimiento' — Planes de mantenimiento preventivo (por kilometraje o tiempo) y registro de mantenimientos correctivos. Registrar: vehículo, tipo, descripción, fecha, kilometraje, taller, costo
- **H06 - Inspecciones Preoperacionales** → botón abre '/pesv/evaluacion/:id/inspecciones' — Lista de chequeo diaria de 16 ítems en 4 grupos: Exterior (llantas ⚠️crítico, luces, espejos, carrocería), Interior (cinturones, pito, parabrisas, instrumentos), Mecánica (frenos ⚠️crítico, dirección, suspensión, fluidos), Equipos de seguridad (extintor ⚠️crítico, botiquín, triángulos, chaleco). El resultado se calcula automáticamente: Apto / Apto con observaciones / No Apto. Dos flujos: (A) Admin crea manualmente desde el módulo, o (B) **Conductor desde Portal de Empleados** → Portal → PESV → "Inspección Vehículo" — selecciona su vehículo de la flota asignada, marca los 16 ítems y envía; el registro aparece instantáneamente en el módulo del admin. El detalle de cada inspección muestra todos los ítems con colores (verde=OK, rojo/ámbar=falla) al hacer clic en el ícono de ojo. **Conexión Portal de Empleados**: conductores usan Portal → PESV → "Inspección Vehículo".
- **H06-ENC - Encuesta Diaria del Conductor** (Art. 18, Res. 40595/2022) → módulo '/pesv/evaluacion/:id/encuesta-conductor' — Declaración diaria de aptitud del conductor antes de cada jornada. Campos: horas de sueño (alerta si <6h), estado físico (Bueno/Regular/Malo), estado emocional (Bueno/Regular/Malo), si toma medicamentos que afectan la conducción (con detalle del medicamento), consumo de alcohol en las últimas 12 horas, si presenta enfermedad o molestia (con detalle). El resultado se determina automáticamente: si hay consumo de alcohol, estado malo, o medicamentos que afectan la conducción → resultado "No Apto". Dos flujos: (A) Admin crea manualmente desde el módulo, o (B) **Conductor desde Portal de Empleados** → Portal → PESV → "Encuesta Diaria" — completa los campos y envía; el registro aparece en el módulo del admin. El detalle de cada encuesta (botón ojo) muestra un panel completo con el banner de resultado, horas de sueño, estados y todas las declaraciones con badges Si/No de colores. NOTA: Este módulo solo está disponible en el portal para usuarios con rol "conductor" en la flota PESV. **Conexión Portal de Empleados**: conductores usan Portal → PESV → "Encuesta Diaria".
- **H07 - Gestión de la velocidad** *(solo aplica a nivel Estándar y Avanzado, no a Básico)* → botón abre '/pesv/evaluacion/:id/monitoreo-gps' — Registro de eventos de velocidad, seguimiento de rutas, alertas de exceso de velocidad, análisis de comportamiento vial por conductor
- **H08 - Gestión de rutas seguras** *(solo aplica a nivel Estándar y Avanzado, no a Básico)* → botón abre '/pesv/evaluacion/:id/rutas-seguras' — Análisis de rutas: origen, destino, distancia, puntos críticos (curvas peligrosas, cruces, zonas escolares), medidas de control por punto crítico, tiempos estimados
- **H09 - Gestión de fatiga y somnolencia** *(solo aplica a nivel Estándar y Avanzado, no a Básico)* → botón abre '/pesv/evaluacion/:id/fatiga-somnolencia' — Registros individuales de control de fatiga y somnolencia realizados a conductores (Art. 21 Res. 40595/2022). El módulo tiene tabla CRUD de registros. Para crear un registro: clic en el botón **"+"** (Nuevo Control) → se abre el formulario con los campos: **Conductor** (nombre del conductor controlado, campo de texto), **Fecha del Control** (fecha en que se realizó), **Tipo de Control** (selección: Sensibilización / Verificación de Jornada / Prueba Física/Ocular / Capacitación), **Resultado** (selección: Sin Novedad / Fatiga Detectada / Somnolencia Detectada), **Horas de Conducción** (número de horas conducidas ese día), **Descanso Cumplido** (Sí / No — si respetó el tiempo de descanso reglamentario), **Responsable del Control** (selector de usuarios del sistema — se pre-llena automáticamente con el usuario logueado; también permite seleccionar otro usuario de la empresa o elegir "Otro" para escribir manualmente), **Medidas Tomadas** (texto libre — acciones aplicadas si se detectó novedad, ej: relevo del conductor, descanso forzado), **Observaciones** (texto libre). Guardar. La tabla muestra todos los controles registrados con el resultado destacado en badge de color (verde: sin novedad, amarillo: fatiga detectada, rojo: somnolencia detectada). NO existen botones llamados "Nueva Entrada", "Agregar Pausa" ni campos de "pausas activas" — esos términos no corresponden a este módulo.
- **H10 - Alcohol y Sustancias Psicoactivas** → botón abre '/pesv/evaluacion/:id/alcohol-sustancias' — Registros individuales de pruebas de control de alcohol y sustancias psicoactivas realizadas a conductores (Art. 22 Res. 40595/2022). Para crear un registro: clic en **"+"** (Nuevo Registro) → campos del formulario: **Conductor** (selector de conductores de la flota registrada en H01), **Fecha** (fecha en que se realizó la prueba), **Tipo de Prueba** (selección: Preventiva / Aleatoria / Post-Accidente / Por Sospecha), **Sustancia Controlada** (selección: Alcohol / Sustancias Psicoactivas / Ambas), **Resultado** (selección: Negativo / Positivo / Rehúsa la Prueba), **Responsable de la Prueba** (selector de usuarios del sistema — se pre-llena con el usuario logueado), **Medidas Tomadas** (acciones tomadas si el resultado fue positivo o hubo negativa), **Observaciones** (texto libre). La tabla muestra cada prueba con el resultado en badge de color (verde: Negativo, rojo: Positivo, naranja: Rehúsa). NO existen campos de "política de cero tolerancia" ni "programas de prevención" como formulario — esos son documentos normativos que se adjuntan como evidencia en el panel del paso H10 dentro de la Evaluación PESV.
- **H11 - Atención a Víctimas** → botón abre '/pesv/evaluacion/:id/atencion-victimas' — Registro de casos de atención a víctimas de siniestros viales (Art. 23 Res. 40595/2022). Para crear un caso: clic en **"+"** (Nuevo Caso) → campos del formulario: **Fecha del Siniestro** (requerido), **Tipo de Víctima** (selección: Conductor / Peatón / Ciclista / Pasajero / Otro), **Nombre de la Víctima** (texto libre, opcional), **Descripción del Siniestro** (requerido — circunstancias del evento vial), **Atención Inmediata Prestada** (primeros auxilios suministrados, llamadas de emergencia realizadas), **Remisión a IPS** (Sí/No — si se remitió a institución de salud; si es Sí, aparece campo para el nombre de la IPS), **Programa de Acompañamiento** (descripción del seguimiento psicosocial o médico posterior), **Estado de Seguimiento** (selección: Activo / En Proceso / Cerrado), **Responsable** (texto libre). La tabla muestra todos los casos con el estado destacado en badge. IMPORTANTE: este módulo NO incluye un directorio de emergencias ni procedimientos de primeros auxilios como formulario — esos documentos se adjuntan como evidencia en el panel del paso H11 dentro de la Evaluación PESV.

**Fase VERIFICAR (V01-V03):**
- **V01 - Indicadores de Gestión** → botón abre '/pesv/evaluacion/:id/indicadores' — Indicadores de desempeño vial: tasa de siniestralidad, frecuencia de accidentes, cobertura de capacitaciones, cumplimiento de mantenimiento. Se calculan automáticamente con los datos registrados
- **V02 - Registro y Análisis de Siniestros** → botón abre '/pesv/evaluacion/:id/siniestros' — Registro individual de cada siniestro vial ocurrido (Art. 17 Res. 40595/2022). Para crear un registro: clic en **"+ Nuevo Siniestro"** → campos del formulario: **Vehículo** * (selector de la flota H04), **Conductor** * (selector de la flota H01), **Fecha del Siniestro** *, **Hora del Siniestro** *, **Ubicación** * (dirección o lugar), **Tipo de Siniestro** * (selección: Colisión / Volcamiento / Atropello / Otro — si es "Otro" aparece campo para especificar el tipo), **Severidad** * (selección: Solo Daños / Con Heridos / Mortal), **Descripción del Siniestro** * (narrativa detallada), **Condiciones Climáticas** (lluvia, neblina, despejado, etc.), **Condiciones de la Vía** (pavimentada, húmeda, con huecos, etc.), **Testigos** (nombres y datos de contacto), **Autoridades Notificadas** (casilla Sí/No), **Número de Reporte Policial** (si aplica), **Número de Lesionados** * (campo numérico obligatorio), **Número de Fallecidos** * (campo numérico obligatorio), **Costo Estimado** (en pesos), **Causa Raíz** (análisis de causas del siniestro), **Acciones Correctivas** (medidas inmediatas adoptadas), **Acciones Preventivas** (medidas para evitar recurrencia). La tabla muestra todos los siniestros con el tipo y severidad en badges; la vista detalle (botón ojo) despliega todos los campos. Los campos Lesionados y Fallecidos son obligatorios aunque sean cero, porque alimentan los cálculos automáticos de P05 y P06.
- **V03 - Auditoría del PESV** *(solo aplica a nivel Estándar y Avanzado, no a Básico)* → botón abre '/pesv/evaluacion/:id/auditorias' — Auditoría interna del PESV (Art. 19 Res. 40595/2022). Para crear una auditoría: clic en **"+ Nueva Auditoría"** → campos del formulario: **Fecha de Auditoría** *, **Auditor** * (nombre del auditor), **Entidad Auditora** (nombre de la empresa o persona), **Estado** (selección: Programada / En Curso / Completada), **Alcance** * (descripción del alcance — por defecto sugiere "Auditoría anual del PESV según Res. 40595/2022. Evaluación integral de los 24 pasos del ciclo PHVA"). Una vez creada, al abrir la auditoría aparece el panel de evaluación de los **24 pasos del ciclo PHVA** (P01 a A02), donde cada paso recibe un puntaje de 0/25/50/75/100 según su nivel de cumplimiento. Al completar la evaluación de los 24 pasos, se habilitan los campos finales: **Resultado** (selección: Cumple / Cumple Parcialmente / No Cumple), **Hallazgos** (no conformidades y observaciones encontradas), **Recomendaciones** (medidas sugeridas para mejora), **Plan de Acción** (acciones para abordar los hallazgos). La tabla muestra todas las auditorías con el estado y resultado en badges. El resultado de la auditoría retroalimenta automáticamente el módulo A01 (Mejora Continua) para generar acciones correctivas.

**Fase ACTUAR (A01-A02):**
- **A01 - Mejora Continua** → gestionado directamente desde la página del paso A01 dentro de la evaluación PESV (pestaña "Actuar") — Registro de acciones de mejora derivadas de siniestros, auditorías, indicadores e inspecciones (Art. 20 Res. 40595/2022). Para crear una acción: clic en **"+ Nueva Acción"** → campos del formulario: **Descripción** * (qué se va a hacer), **Tipo de Acción** (selección: Correctiva / Preventiva / Mejora), **Prioridad** (selección: Baja / Media / Alta / Crítica), **Fuente del Hallazgo** (selección: Auditoría / Indicador / Siniestro / Inspección / Revisión por la Dirección — indica de dónde surge la acción), **Estado** (selección: Pendiente / En Proceso / Completada / Verificada), **Responsable** (nombre del responsable), **Fecha Límite** (fecha para completar la acción). El sistema también permite auto-llenado desde las fuentes de trazabilidad disponibles. La tabla muestra todas las acciones con tipo (badge color: rojo=correctiva, azul=preventiva, verde=mejora), prioridad y estado. Para actualizar el estado de una acción ya creada: clic en la fila → panel de detalle → campo "Actualizar Estado" → guardar.
  **CÓMO VER EL PLAN DE MEJORAMIENTO PESV GENERADO AUTOMÁTICAMENTE**: En la página A01 aparece una tarjeta "Trazabilidad SST" con el texto "Decreto 1072/2015 Art. 2.2.4.6.33 - Acciones preventivas y correctivas del SG-SST". En la esquina derecha de esa tarjeta hay un botón **"Ver Plan de Mejoramiento SST"** — al hacer clic en ese botón se abre el módulo del Plan de Mejoramiento SST con todas las acciones consolidadas automáticamente. No es necesario navegar por el menú lateral; el botón está visible directamente en la página A01.
- **A02 - Revisión por la Alta Dirección** → botón abre '/pesv/evaluacion/:id/revision-direccion' — Registro formal de la reunión de revisión por la dirección (ISO 39001:2012 Cláusula 9.3). Para crear una revisión: clic en **"+ Nueva Revisión"** → campos del formulario: **Código** (ej: REV-PESV-2026-001 — código de identificación del documento), **Fecha de Revisión** *, **Presidida por** * (nombre del directivo que preside la reunión), **Participantes** (lista de asistentes), **Temas Revisados** (8 casillas de verificación: Indicadores de desempeño / Resultados de auditorías / Investigación de siniestros / Acciones de mejora / Cumplimiento legal / Recursos asignados / Capacitaciones realizadas / Inspecciones de seguridad vial), **Análisis General** (resumen del análisis de la reunión), **Decisiones** (decisiones tomadas), **Compromisos** (compromisos de la alta dirección), **Estado** (selección: Borrador / Aprobada / Cerrada), **Fecha Próxima Revisión** (cuándo será la siguiente reunión). También tiene un campo para seleccionar el **Destinatario del reporte** (ANSV / ARL / Supertransporte / Mintransporte / Interno / Personalizado). La tabla muestra todas las revisiones con la fecha, quién presidió, cuántos temas se revisaron y el estado. La vista de detalle muestra todos los campos y permite cambiar el estado directamente.

### Cómo funciona el panel de verificación de cada paso
Al hacer clic en cualquier paso (P01, H04, V02, etc.) dentro de la evaluación:
1. Se abre un panel lateral con el **nombre y descripción del paso**
2. Muestra el **estado actual**: No iniciado / En progreso / Cumple / No Cumple / No Aplica
3. Contiene **preguntas de verificación** específicas (evidencias que debe tener)
4. Tiene un botón **"Ir al módulo"** → navega al módulo correspondiente donde se registran los datos
5. Permite **adjuntar evidencias** en PDF o imagen directamente al paso
6. Al guardar evidencias y marcar el estado, el porcentaje de cumplimiento PESV se actualiza automáticamente

### Porcentaje de cumplimiento PESV
El sistema calcula automáticamente el cumplimiento general del PESV basado en cuántos de los 24 pasos están en estado "Cumple". Se puede ver en el encabezado de la evaluación. También se puede generar el **PDF ISO 39001:2012** (botón naranja en la evaluación) que muestra el alineamiento de los 24 pasos con las cláusulas ISO 39001.

## FLUJO PRINCIPAL DEL SISTEMA - TODO PARTE DE LA EVALUACIÓN INICIAL

IMPORTANTE: En SST Colombia, el punto de partida para llegar al 100% de cumplimiento es la **Evaluación Inicial** (Resolución 0312/2019). NO se navega directamente a los módulos desde el menú para gestionar el cumplimiento. El flujo correcto es:

### Paso 1: Agregar Trabajadores (primer paso dentro del sistema)
1. Ir a Planear → Personal → Trabajadores
2. Opción A: Clic "Agregar Trabajador" → llenar formulario → Guardar
3. Opción B: Clic "Importar Excel" → descargar plantilla → llenar datos → subir archivo

### Paso 2: Crear la Evaluación Inicial (CENTRO DEL SISTEMA)
1. Ir a Planear → Gestión Integral → Evaluación Inicial
2. Clic "Nueva Evaluación" → seleccionar año
3. La evaluación muestra TODOS los estándares aplicables según el capítulo de la empresa
4. Cada estándar tiene un estado (Cumple, No Cumple, No Aplica, Justifica No Cumplimiento)
5. **Desde cada estándar** hay botones y enlaces que llevan directamente al módulo correspondiente para completar la evidencia

### Paso 3: Completar Estándares DESDE la Evaluación
El flujo correcto para cumplir cada estándar es (asume que el usuario ya tiene la Evaluación Inicial abierta):
1. Buscar el estándar que se quiere cumplir (ej: "Estándar 1.2.1 - Programa de Capacitación Anual en SST")
2. Hacer clic en el enlace o botón que aparece en ese estándar → el sistema lleva al módulo correspondiente (ej: Capacitaciones)
3. Completar la actividad en el módulo (registrar la capacitación, subir evidencia, etc.)
4. Al guardar, el estándar se actualiza automáticamente mostrando el cumplimiento

### Ejemplos del flujo correcto con estándares específicos:
- **Para registrar un accidente de trabajo o incidente**: En la Evaluación Inicial, buscar el **Estándar 3.2.1** "Reporte de AT e Incidente de Trabajo" → clic en el botón del módulo → en /accidentes clic "Nuevo Accidente" → completar tipo de evento, trabajador, fecha, descripción, parte del cuerpo, tipo de lesión, días de incapacidad, severidad y medidas tomadas → Guardar. Para la investigación: buscar **Estándar 3.2.2** → módulo de Investigación de Accidentes → completar causas inmediatas, básicas y medidas correctivas.
- **Para programar o registrar capacitaciones**: En la Evaluación Inicial, buscar el **Estándar 1.2.1** (programa de capacitación anual) o **Estándar 1.2.2** (inducción/reinducción) → clic en el módulo → en /capacitaciones clic "Nueva Capacitación" → completar tema, tipo, fecha, asistentes, duración y evaluación de efectividad → Guardar.
- **Para entregar EPP**: En la Evaluación Inicial, buscar el **Estándar 4.2.6** "Entrega de Elementos de Protección Personal EPP" → clic en el módulo → en /entrega-epp clic "Nueva Entrega" → seleccionar trabajador, EPP entregados, fecha y firma de recibido → Guardar.
- **Para registrar inspecciones**: En la Evaluación Inicial, buscar el **Estándar 4.2.4** "Inspecciones a instalaciones, maquinaria o equipos" → clic en el módulo → en /inspecciones clic "Nueva Inspección" → seleccionar tipo, área, hallazgos, clasificación y acciones correctivas → Guardar.
- **Para conformar el COPASST o Vigía SST**: En la Evaluación Inicial, buscar el **Estándar 1.1.6** → clic en el módulo → en /copasst: (1) pestaña "Período Vigente" → clic "Nuevo Período" → tipo COPASST (≥10 trabajadores) o Vigía (menos de 10) → fechas de inicio y fin (período de 2 años) → Guardar; (2) pestaña "Proceso Electoral" → iniciar el proceso de nominación y votación; los trabajadores se postulan y votan desde su Portal de Empleados; el empleador designa directamente sus representantes; (3) pestaña "Miembros" → quedan registrados los integrantes elegidos; (4) pestaña "Actas Mensuales" → registrar cada reunión mensual. El módulo genera el Acta de Constitución en PDF.
- **Para el IPERC (matriz de riesgos)**: En la Evaluación Inicial, buscar el **Estándar 4.1.1** "Metodología para identificación de peligros, evaluación y valoración de riesgos" → clic en el módulo → en /iperc crear matriz con peligro, riesgo, controles existentes, evaluación (probabilidad × consecuencia) y medidas de intervención → Guardar.
- **Para el plan de emergencias**: En la Evaluación Inicial, buscar el **Estándar 5.1.1** "Plan de prevención, preparación y respuesta ante emergencias" → clic en el módulo → en /plan-emergencias documentar brigadas conformadas, simulacros realizados y plan de respuesta → Guardar.
- **Para exámenes médicos**: En la Evaluación Inicial, buscar el **Estándar 3.1.4** "Evaluaciones médicas ocupacionales, pre ingreso, periódicos" → clic en el módulo → en /examenes-medicos registrar tipo de examen (ingreso / periódico / egreso), trabajador, fecha, IPS que lo realizó y concepto médico → Guardar.
- **Para políticas SST**: En la Evaluación Inicial, buscar el **Estándar 2.1.1** "Política de Seguridad y Salud en el Trabajo" → clic en el módulo → en /politicas-sst redactar la política, fecha de aprobación y firma del representante legal → Guardar.

### Paso 4: Plan Anual de Trabajo
1. Desde la Evaluación Inicial se puede generar un Plan Anual de Trabajo
2. El plan organiza todas las actividades necesarias en un cronograma mensual
3. Las actividades del plan están vinculadas a los estándares de la evaluación
4. Se puede hacer seguimiento del avance mes a mes desde el cronograma

### Paso 5: Verificar el Cumplimiento
1. La Evaluación Inicial calcula automáticamente el porcentaje de cumplimiento
2. Los indicadores (ILI, Frecuencia, Severidad, Mortalidad, etc.) se calculan automáticamente basado en los datos registrados
3. Se pueden ver desde Verificar → Indicadores de Accidentalidad

### Paso 6: Actuar (Mejora Continua)
1. Las no conformidades detectadas generan acciones correctivas
2. Se pueden crear planes de mejoramiento desde la Evaluación
3. Las revisiones por la dirección evalúan el desempeño general del SG-SST

### Meta: 100% Cumplimiento
El porcentaje de cumplimiento se calcula automáticamente en la Evaluación Inicial. Para llegar al 100%, hay que completar TODOS los estándares aplicables al capítulo de la empresa. El sistema muestra claramente qué estándares faltan y desde cada uno se puede ir directamente al módulo correspondiente.

## OTRAS FUNCIONALIDADES

### Suscripciones y Pagos
- **Ver planes** → /planes-suscripcion: Comparar planes disponibles
- **Checkout** → /checkout: Proceso de pago con Stripe
- **Mi Suscripción** → /mi-suscripcion: Ver estado actual, renovar, cambiar plan
- Algunos módulos requieren suscripción activa (marcados con "Requiere suscripción")

### Portal de Empleados
Los trabajadores acceden al portal con sus credenciales desde /portal-empleados. El portal tiene 6 secciones: Mi Cuenta (contrato, perfil, foto de carnet, cambio de contraseña), Formación (capacitaciones SST, mis inducciones, inducciones virtuales), Comunicación (comunicados SST, reportar peligros/sugerencias, mis reportes), Participación (elecciones COPASST, elecciones Comité de Convivencia), Salud (mis exámenes médicos, mis audiometrías), PESV (comité de seguridad vial, capacitaciones PESV, encuesta diaria y inspección vehículo — estas últimas solo para conductores). Ver detalles completos en la sección del rol "Trabajador" de la base de conocimiento.

### Soporte
- **Tickets de Soporte** → /tickets-soporte: Crear tickets para reportar problemas
- **Chatbot**: Este asistente virtual para resolver dudas rápidas
- **Videos de Ayuda**: Tutoriales disponibles dentro de la plataforma

## VISIBILIDAD POR ROL (Qué ve cada usuario)

### Superadmin / Admin / Superusuario / Responsable SST
Acceso completo: Ven TODAS las pestañas PHVA (Administración Global, Planear, Hacer, Verificar, Actuar) y PESV. Pueden crear, editar y eliminar en todos los módulos. El Superadmin puede además ver todas las empresas y el panel de facturación global. El Superusuario puede gestionar la suscripción de su empresa.

### Coordinador SST
Ve: Dashboard, Planear (trabajadores, evaluaciones, planes, COPASST, políticas, IPERC, plan emergencias), Hacer (capacitaciones, inspecciones, EPP, accidentes, medidas), Verificar (indicadores, estándares, informes), Actuar (mejora continua). Puede crear y editar en la mayoría de módulos. También tiene acceso a PESV si la empresa tiene vehículos.

### Coordinador de Salud Ocupacional
Ve: Dashboard, trabajadores (solo ver), accidentes (ver y crear), exámenes médicos, historias clínicas, incapacidades, reportes de seguridad social, vigilancia epidemiológica. Es el único rol (además de admin) que puede acceder a datos médicos sensibles.

### Coordinador RRHH
Ve: Dashboard, trabajadores (crear y editar), perfiles de cargo, contratos, capacitaciones (crear y editar), exámenes médicos, informes de personal. NO ve inspecciones ni medidas preventivas en detalle.

### LSO (Licenciado en Salud Ocupacional)
Tiene su propio portal especial → /portal-licenciado. NO ve el menú PHVA normal. Su portal muestra las empresas asignadas con acceso de solo lectura a evaluaciones, estándares, accidentes, capacitaciones, inspecciones. Puede firmar y aprobar documentos SST.

### Supervisor
Ve: Dashboard, trabajadores (solo ver), accidentes (ver y crear), inspecciones (crear y editar), medidas preventivas (crear y editar). Enfocado en operaciones de su área.

### Vigía SST
Similar al supervisor pero para empresas pequeñas (<10 trabajadores). Ve: trabajadores, accidentes, capacitaciones, inspecciones, medidas, evaluaciones SST. Puede crear y editar en accidentes, capacitaciones e inspecciones.

### Jefe de Personal
Acceso de solo consulta: Ve trabajadores, accidentes, capacitaciones, inspecciones, medidas, evaluaciones, vehículos, conductores, perfiles de cargo, contratos, exámenes médicos. NO puede crear ni editar.

### Auditor Interno
Ve: Todo en modo consulta (similar a jefe_personal), más la capacidad de crear y editar evaluaciones SST y auditorías PESV. Enfocado en verificación de cumplimiento.

### Trabajador
Solo ve el **Portal de Empleados** → /portal-empleados. El portal tiene 6 secciones con los siguientes módulos:

**Mi Cuenta:**
- **Mi Contrato**: Ver su contrato laboral activo vigente
- **Mi Perfil**: Ver y actualizar su información personal
- **Mi Foto de Carnet**: Subir o actualizar su foto de carnet
- **Cambiar Contraseña**: Cambiar la contraseña de acceso al portal

**Formación:**
- **Capacitaciones**: Ver capacitaciones SST asignadas (pendientes e historial)
- **Mis Inducciones**: Ver el historial de inducciones y reinducciones recibidas
- **Inducciones Virtuales**: Completar módulos de inducción virtual con cuestionarios y materiales en línea

**Comunicación:**
- **Comunicaciones SST**: Ver comunicados, circulares y alertas emitidas por el área SST. Confirmar lectura con un clic (el sistema registra fecha de confirmación)
- **Reportar Inquietud, Peligro o Sugerencia**: Enviar reportes al área SST con categoría (peligro / sugerencia / queja / consulta), prioridad, asunto, descripción y ubicación. Puede marcar el reporte como anónimo
- **Mis Reportes**: Ver el historial de todos los reportes enviados y las respuestas del equipo SST

**Participación:**
- **Elecciones COPASST**: Durante el proceso electoral activo (fases: convocatoria → inscripción → votación → escrutinio), el trabajador puede postularse como candidato e inscribirse, y posteriormente votar por sus candidatos preferidos para elegir los representantes de los trabajadores al COPASST
- **Elecciones Convivencia**: Igual que COPASST pero para el Comité de Convivencia Laboral. Postularse en fase de inscripción y votar en fase de votación

**Salud:**
- **Mis Exámenes Médicos**: Ver exámenes médicos programados (pendientes de realizar) e historial de realizados con su concepto de aptitud. Puede confirmar lectura del resultado
- **Mis Audiometrías**: Ver audiometrías programadas e historial de realizadas con clasificación auditiva

**PESV** (solo visible para usuarios con rol "conductor"):
- **Comité de Seguridad Vial**: Ver información sobre el Comité de Seguridad Vial de la empresa y sus actividades
- **Capacitaciones PESV**: Ver capacitaciones de seguridad vial pendientes e historial
- **Encuesta Diaria**: Completar el auto-reporte de aptitud antes de cada jornada (Art. 18, Res. 40595/2022). Campos: horas de sueño, estado físico, estado emocional, medicamentos que afectan conducción, consumo de alcohol, enfermedades o molestias. El resultado (Apto / No Apto) se calcula automáticamente y queda visible en el módulo H06-ENC del admin.
- **Inspección Vehículo**: Completar la lista de chequeo preoperacional de 16 ítems (Exterior, Interior, Mecánica, Equipos de seguridad). El resultado (Apto / Apto con observaciones / No Apto) queda visible en el módulo H06 del admin instantáneamente.

NO ve las pestañas PHVA ni ningún módulo de gestión administrativo.

### Soporte
Acceso limitado: Solo Dashboard básico para resolver incidencias de usuarios.

## MÓDULOS POR TAMAÑO DE EMPRESA (Capítulos Resolución 0312/2019)
Los módulos visibles también dependen del plan de suscripción/tamaño de la empresa:

### Capítulo I - Microempresa (1-10 trabajadores, Riesgo I/II/III) - 7 estándares
Módulos disponibles: Dashboard, Trabajadores, Afiliaciones, Designación Responsable, Asignación Recursos, Capacitaciones, Inducción, COPASST/Vigía, Comité de Convivencia, Evaluaciones SST, Accidentes, Investigación, Árbol de Causas, Ausentismo, EPP, Perfil Sociodemográfico, Perfiles de Cargo, Estándares SST, Políticas SST, Programa Capacitación Anual, Curso 50 Horas, Planes de Trabajo, Exámenes Médicos, IPERC, Medidas Preventivas, Recomendaciones ARL.

### Capítulo II - Pequeña Empresa (11-50 trabajadores, Riesgo I/II/III) - 21 estándares
Todo lo de Capítulo I MÁS: Trabajadores Alto Riesgo, Objetivos SST, Matriz Legal, Conservación de Documentos, Comunicación SST, Indicadores (Frecuencia, Severidad, ILI, Mortalidad, Ausentismo, Prevalencia, Incidencia), Inspecciones, Mediciones Ambientales, Conservación Auditiva, Plan de Emergencias, Actividades de Promoción, Estilos de Vida Saludable, Informes, Salud Ocupacional.

### Capítulo III - Mediana/Gran Empresa (>50 trabajadores o Riesgo IV/V) - 61 estándares
Todo lo de Capítulo II MÁS: Evaluación de Proveedores, Gestión de Cambios, Adquisiciones SST, Sustancias Químicas, Vigilancia Epidemiológica, PESV completo (Vehículos, Conductores, Inspecciones, Siniestros, Capacitaciones, Auditorías), Auditorías Internas, Revisiones por la Dirección.

## NORMATIVA REFERENCIAL
- **Resolución 0312 de 2019**: Estándares Mínimos del SG-SST (Capítulos I, II, III según tamaño y riesgo)
- **Decreto 1072 de 2015**: Decreto Único Reglamentario del Sector Trabajo (Libro 2, Parte 2, Título 4, Capítulo 6)
- **ISO 45001:2018**: Sistema de Gestión de la Seguridad y Salud en el Trabajo
- **Resolución 40595 de 2022**: Plan Estratégico de Seguridad Vial (PESV)
- **Ley 1562 de 2012**: Sistema General de Riesgos Laborales
- **Resolución 1401 de 2007**: Investigación de Accidentes de Trabajo
- **Ley 1581 de 2012**: Protección de Datos Personales
- **Ley 1010 de 2006**: Acoso Laboral (Comité de Convivencia obligatorio)

## CÓMO FUNCIONA EL SISTEMA (FLUJO PRINCIPAL)
El sistema se opera desde la Evaluación Inicial. El flujo es:
1. Primero registre sus trabajadores desde el menú Planear > Trabajadores (es lo ÚNICO que se hace fuera de la Evaluación Inicial).
2. Cree su Evaluación Inicial. Desde ahí se gestiona TODO el SG-SST.
3. Dentro de la Evaluación Inicial, haga clic en cualquier estándar. Se abre el modo de verificación donde encontrará los módulos correspondientes para gestionar la evidencia.
El flujo siempre es: Evaluación Inicial > estándar > clic > modo de verificación > módulo correspondiente.

## PREGUNTAS FRECUENTES POR MÓDULO

### Evaluación Inicial (Archivo Maestro del SG-SST)
La Evaluación Inicial es el centro de gestión de todo el SG-SST. Desde aquí se accede a todos los estándares y sus módulos correspondientes.
- **Cómo crear una Evaluación Inicial**: Abra el módulo de Evaluación Inicial y haga clic en 'Nueva Evaluación'. El sistema detecta automáticamente el tamaño y nivel de riesgo de su empresa y le asigna los estándares que le aplican según la Resolución 0312/2019. Una vez creada, desde ahí podrá gestionar todo su SG-SST.
- **Cuántos estándares me aplican**: Depende del tamaño y riesgo de su empresa: Microempresa (hasta 10 trabajadores, Riesgo I-III) = 7 estándares. Pequeña empresa (11-50, Riesgo I-III) = 21 estándares. Mediana/Grande (más de 50 o Riesgo IV-V) = 61 estándares. El sistema lo calcula automáticamente al crear la Evaluación Inicial.
- **Cómo funciona el modo de verificación**: Dentro de su Evaluación Inicial, haga clic en cualquier estándar. Se abrirá el modo de verificación que le muestra exactamente qué evidencia necesita y los módulos correspondientes donde puede gestionarla.
- **Cómo generar el PDF del Ministerio**: Abra su Evaluación Inicial y busque el botón 'PDF Ministerio del Trabajo'. Se generará un informe completo con el Hilo Dorado de trazabilidad.

### Trabajadores (ÚNICO módulo fuera de la Evaluación Inicial)
Los trabajadores se registran desde el menú Planear > Trabajadores. Es el primer paso antes de trabajar con la Evaluación Inicial.
- **Cómo registrar un trabajador**: Vaya al menú Planear > Trabajadores y haga clic en 'Nuevo Trabajador'. Complete datos personales, cargo, tipo de contrato y afiliaciones. Este es el primer paso antes de trabajar con la Evaluación Inicial. Si aparece un error de límite, verifique su plan en Administración Global > Mi Cuenta.
- **Importar trabajadores masivamente**: Vaya a Planear > Trabajadores y use el botón 'Importar Excel'. Descargue la plantilla oficial, llénela y súbala. El sistema acepta variaciones en los nombres de campos.
- **No encuentra un trabajador**: Vaya a Planear > Trabajadores y use la barra de búsqueda por nombre o documento.

### Capacitaciones (Estándares 1.2.1, 1.2.2, 1.2.3)
- **Cómo registrar una capacitación**: Abra su Evaluación Inicial y busque el estándar 1.2.1. Haga clic en él y se abrirá el modo de verificación. Ahí encontrará el módulo de Capacitaciones donde puede crear registros con tema, fecha, duración, instructor y asistentes.
- **Cómo registrar asistencia**: Abra su Evaluación Inicial, busque el estándar 1.2.1, haga clic para abrir el modo de verificación y entre al módulo de Capacitaciones. Abra la capacitación y en la sección de Asistentes marque cada trabajador que asistió.
- **Qué capacitaciones son obligatorias**: Abra su Evaluación Inicial y revise los estándares 1.2.1 (programa anual), 1.2.2 (inducción/reinducción) y 1.2.3 (curso 50 horas). Haga clic en cada uno para ver en el modo de verificación exactamente qué se necesita.

### Inspecciones de Seguridad (Estándar 4.2.4)
- **Cómo crear una inspección**: Abra su Evaluación Inicial y busque el estándar 4.2.4. Haga clic en él y se abrirá el modo de verificación. Ahí encontrará el módulo de Inspecciones donde puede crear registros con tipo, fecha, área y hallazgos.
- **Qué tipos de inspección hay**: El sistema soporta: inspección general, de EPP, orden y aseo, extintores y botiquines. Acceda al módulo desde su Evaluación Inicial, estándar 4.2.4.

### Accidentes e Incidentes (Estándares 3.2.1, 3.2.2, 3.2.3)
- **Cómo registrar un accidente**: Abra su Evaluación Inicial y busque el estándar 3.2.1. Haga clic en él y se abrirá el modo de verificación. Ahí encontrará el módulo de Accidentes donde puede registrar tipo, fecha, trabajador afectado y medidas tomadas.
- **Cómo hacer la investigación**: Abra su Evaluación Inicial y busque el estándar 3.2.2. Haga clic para abrir el modo de verificación y entre al módulo de Accidentes. Abra el accidente y complete la Investigación: participantes, hallazgos, causas raíz y acciones correctivas.

### Exámenes Médicos (Estándares 3.1.1 a 3.1.4)
- **Cómo registrar un examen médico**: Abra su Evaluación Inicial y busque el estándar 3.1.4. Haga clic en él y se abrirá el modo de verificación. Ahí encontrará el módulo de Exámenes Médicos donde puede registrar trabajador, tipo, fecha y concepto.
- **Exámenes próximos a vencer**: Abra su Evaluación Inicial, estándar 3.1.4, haga clic y entre al módulo de Exámenes Médicos. Ordene por fecha de vencimiento. El sistema envía alertas automáticas.

### Entrega de EPP (Estándar 4.2.6)
- **Cómo registrar entrega de EPP**: Abra su Evaluación Inicial y busque el estándar 4.2.6. Haga clic en él y se abrirá el modo de verificación. Ahí encontrará el módulo de Entrega de EPP donde puede registrar trabajador, elementos, cantidad y fechas.

### Plan de Trabajo Anual (Estándar 2.4.1)
- **Cómo crear el plan anual**: Abra su Evaluación Inicial y busque el estándar 2.4.1. Haga clic en él y se abrirá el modo de verificación. Ahí encontrará el módulo de Plan de Trabajo donde puede crear el plan con actividades, responsables, cronograma y recursos.
- **Cómo marcar una actividad como completada**: Abra su Evaluación Inicial, estándar 2.4.1, haga clic y entre al módulo de Plan de Trabajo. Cada actividad tiene un toggle para completarla.

### Matriz IPERC (Estándares 4.1.1 a 4.1.4)
- **Cómo crear la matriz de riesgos**: Abra su Evaluación Inicial y busque el estándar 4.1.1. Haga clic en él y se abrirá el modo de verificación. Ahí encontrará el módulo Matriz IPERC donde puede agregar procesos, peligros, niveles de riesgo y controles según la GTC 45.

### Indicadores de Accidentalidad (Estándares 3.3.1 a 3.3.6)
- **Cómo se calculan los indicadores**: Abra su Evaluación Inicial y busque los estándares 3.3.1 a 3.3.6. Haga clic en cualquiera para abrir el modo de verificación. El sistema calcula los indicadores automáticamente a partir de los accidentes registrados.

### Objetivos SST (Estándar 2.2.1)
- **Cómo crear y vincular objetivos**: Abra su Evaluación Inicial y busque el estándar 2.2.1. Haga clic en él y se abrirá el modo de verificación. Ahí encontrará el módulo de Objetivos SST donde puede crear objetivos medibles y vincularlos con estándares.

### Matriz Legal (Estándar 2.7.1)
- **Cómo agregar un requisito legal**: Abra su Evaluación Inicial y busque el estándar 2.7.1. Haga clic en él y se abrirá el modo de verificación. Ahí encontrará el módulo donde puede registrar normas, artículos, obligaciones y responsables.

### Plan de Emergencias (Estándares 5.1.1 a 5.1.3)
- **Qué incluye el plan de emergencias**: Abra su Evaluación Inicial y busque el estándar 5.1.1. Haga clic en él y se abrirá el modo de verificación. Ahí encontrará el módulo de Plan de Emergencias donde puede registrar amenazas, conformar brigadas y programar simulacros.

### Auditorías Internas (Estándares 6.1.2, 6.1.4)
- **Cómo crear una auditoría**: Abra su Evaluación Inicial y busque el estándar 6.1.2. Haga clic en él y se abrirá el modo de verificación. Ahí encontrará el módulo de Auditorías donde puede crear registros con criterios pre-cargados.

### Revisión por la Dirección (Estándar 6.1.3)
- **Qué debe incluir la revisión**: Abra su Evaluación Inicial y busque el estándar 6.1.3. Haga clic en él y se abrirá el modo de verificación. Ahí encontrará el módulo donde puede generar el formato con auditorías, indicadores, acciones correctivas y conclusiones.

### Plan de Mejoramiento (Estándares 7.1.1 a 7.1.4)
- **Cómo crear una acción de mejora**: Abra su Evaluación Inicial y busque el estándar 7.1.1. Haga clic en él y se abrirá el modo de verificación. Ahí encontrará el módulo de Plan de Mejoramiento donde puede crear acciones vinculadas a estándares y al Plan de Trabajo.

### PESV - Plan de Mejoramiento / Mejora Continua (A01)
- **Dónde se refleja el plan de mejora del PESV / cómo ver el plan de mejora generado automáticamente**: Si ya estás en la página **A01 - Mejora Continua** de la Evaluación PESV, la respuesta es simple: **haz clic en el botón "Ver Plan de Mejoramiento SST"**. Ese botón aparece en la tarjeta "Trazabilidad SST" en la parte superior de la página (la que dice "Decreto 1072/2015 Art. 2.2.4.6.33 - Acciones preventivas y correctivas del SG-SST"). Al hacer clic, se abre directamente el módulo del Plan de Mejoramiento SST con todas las acciones consolidadas. **NO** es necesario navegar por ningún menú lateral ni buscar en otro lugar.
- **Cómo llegar al paso A01 desde cero**: PESV (barra superior) → Evaluaciones PESV → abrir la evaluación activa → pestaña **Actuar** → paso **A01 - Mejora Continua**.

### COPASST / Vigía (Estándares 1.1.6, 1.1.7)
- **Diferencia entre COPASST y Vigía**: Abra su Evaluación Inicial y busque el estándar 1.1.6. Haga clic en él y se abrirá el modo de verificación. El sistema se adapta automáticamente: menos de 10 trabajadores = Vigía, 10 o más = COPASST.

### Gestión del Cambio (Estándar 2.11.1)
- **Cuándo registrar un cambio**: Abra su Evaluación Inicial y busque el estándar 2.11.1. Haga clic en él y se abrirá el modo de verificación. Ahí encontrará el módulo donde puede documentar cambios en procesos, equipos, instalaciones, personal, sustancias o normas.

### Comunicación SST (Estándar 2.8.1)
- **Qué comunicaciones registrar**: Abra su Evaluación Inicial y busque el estándar 2.8.1. Haga clic en él y se abrirá el modo de verificación. Ahí encontrará el módulo donde puede registrar comunicaciones sobre políticas, cambios, alertas y convocatorias de SST.

### Mi Cuenta / Suscripción
- **Cómo cambiar de plan**: Vaya a Administración Global > Mi Cuenta. Al cambiar datos como número de trabajadores o vehículos, el precio se recalcula automáticamente.
- **Cómo ver facturas**: En Administración Global > Mi Cuenta encontrará el historial de facturas y método de pago.
- **Cómo agregar usuarios**: Vaya a Administración Global > Usuarios > 'Nuevo Usuario'. Cada rol administrativo incluye un usuario sin costo adicional.

## RESPUESTAS POR ESTÁNDAR (Resolución 0312/2019)
Cuando un usuario pregunte por un estándar específico, usa esta referencia. NUNCA expliques cómo llegar a la Evaluación Inicial; asume que el usuario ya está ahí. Ve directo al estándar y cómo diligenciarlo.

### Componente: Recursos

- **1.1.1** Asignación del responsable del SG-SST (4 puntos): Antes de diligenciar este estándar, el profesional SST debe estar vinculado a la empresa. Pasos:
  **Paso 1 — Vincular el profesional SST a la empresa:** Ir al menú principal → clic en **Administración Global** → clic en **Empresas** → buscar su empresa en la lista → clic en el **ícono lápiz** (columna Acciones) → en el modal "Editar Empresa" clic en el botón **"Encontrar Profesionales Certificados"** → seleccionar el profesional del directorio. Recuerde: el profesional debe tener mínimo 5 años de carrera profesional certificada en SST y licencia vigente.
  **Paso 2 — Registrar la designación:** Una vez asignado el profesional, buscar el **Estándar 1.1.1** en la Evaluación Inicial → clic en el estándar → pulse "Ir a Designación de Responsables" → clic "+ Nueva Designación" → el sistema detecta el profesional asignado y llena automáticamente su nombre, cédula, licencia, vigencia, formación y curso 50h → seleccionar cargo "Responsable del SG-SST" → confirmar fecha → Guardar. Para generar el Acta PDF use la columna de acciones.

- **1.1.2** Asignación de responsabilidades en SST (4 puntos): Para diligenciar, buscar el **Estándar 1.1.2** en la Evaluación Inicial → en el modo de verificación, subir el documento que asigne responsabilidades SST a todos los niveles (gerencia, mandos medios, trabajadores) con: nombre del cargo, responsable y actividades SST asignadas → marcar como Cumple → Guardar. Exige el Decreto 1072/2015, Art. 2.2.4.6.8.

- **1.1.3** Asignación de recursos para SG-SST (4 puntos): Para diligenciar, buscar el **Estándar 1.1.3** en la Evaluación Inicial → en el modo de verificación, adjuntar el acto administrativo o comunicado que asigne: recursos financieros (presupuesto SST del año), técnicos (equipos, herramientas) y humanos (tiempo del responsable SST) → marcar como Cumple → Guardar.

- **1.1.4** Afiliación al Sistema de Seguridad Social Integral (4 puntos): Para diligenciar, buscar el **Estándar 1.1.4** en la Evaluación Inicial → en el modo de verificación, adjuntar los comprobantes vigentes de afiliación a EPS, AFP y ARL de todos los trabajadores → marcar como Cumple → Guardar. El módulo de Trabajadores registra la ARL de cada trabajador como respaldo adicional.

- **1.1.5** Identificación de trabajadores de alto riesgo (1 punto): Para diligenciar, buscar el **Estándar 1.1.5** en la Evaluación Inicial → clic en el botón del módulo → en /trabajadores-alto-riesgo registrar los trabajadores que realizan actividades clase IV o V (minería, trabajo en alturas extremas, explosivos, etc.) con cotización especial a pensiones → Guardar. Si no hay trabajadores de alto riesgo, marcar como No Aplica en la evaluación.

- **1.1.6** Conformación COPASST / Vigía SST (2 puntos): Para diligenciar, buscar el **Estándar 1.1.6** en la Evaluación Inicial → clic en el botón del módulo → va a /copasst. El módulo tiene 4 pestañas y el proceso es el siguiente:
  **Paso 1 — Período Vigente**: Clic en "Nuevo Período" → seleccionar tipo (COPASST para empresas con 10 o más trabajadores / Vigía SST para menos de 10) → definir fecha de inicio y fecha de fin (el período es de 2 años) → Guardar. El período queda activo.
  **Paso 2 — Proceso Electoral**: En la pestaña "Proceso Electoral", iniciar el proceso de nominación y votación. Los trabajadores participan desde el **Portal de Empleados** (portal.sst-colombia.com): pueden postularse como candidatos y votar por sus representantes. El empleador designa directamente a sus representantes sin votación.
  **Paso 3 — Miembros**: Una vez completado el proceso electoral, en la pestaña "Miembros" quedan registrados los integrantes elegidos (2 representantes del empleador + 2 representantes de los trabajadores en el COPASST; 1 Vigía en empresas pequeñas) con nombre, cargo y rol.
  **Paso 4 — Actas Mensuales**: En la pestaña "Actas Mensuales", registrar las actas de cada reunión mensual del COPASST (mínimo una reunión por mes). Completar: fecha, asistentes, temas tratados, compromisos y firma. El sistema lleva el historial de actas. Desde el módulo se puede generar el **Acta de Constitución** en PDF.

- **1.1.7** Capacitación COPASST / Vigía (2 puntos): Para diligenciar, buscar el **Estándar 1.1.7** en la Evaluación Inicial → clic en el botón del módulo → en /capacitaciones registrar capacitaciones impartidas a los miembros del COPASST o Vigía (funciones, legislación SST, investigación de accidentes, inspecciones) → seleccionar como asistentes a los miembros del COPASST → Guardar. Al menos una capacitación por período vigente.

- **1.1.8** Conformación Comité de Convivencia Laboral (2 puntos): Para diligenciar, buscar el **Estándar 1.1.8** en la Evaluación Inicial → clic en el botón del módulo → va a /comite-convivencia-actas. El módulo tiene 4 pestañas y el proceso es el siguiente:
  **Paso 1 — Período Vigente**: Clic en "Nuevo Período" → definir fecha de inicio y fecha de fin (el período es de 2 años) → Guardar. El período queda activo.
  **Paso 2 — Proceso Electoral**: En la pestaña "Proceso Electoral", el proceso avanza por 5 fases secuenciales: (1) **Convocatoria**: se anuncia el proceso electoral; (2) **Inscripción**: los trabajadores interesados se postulan como candidatos, pueden hacerlo desde el **Portal de Empleados**; (3) **Votación**: los trabajadores eligen a sus representantes votando desde el Portal de Empleados; (4) **Escrutinio**: se cuentan los votos y se determinan los ganadores; (5) **Completada**: el proceso electoral termina. El empleador designa directamente sus 2 representantes sin proceso electoral.
  **Paso 3 — Miembros**: Una vez completado el proceso electoral, en la pestaña "Miembros" quedan registrados los 4 integrantes: 2 representantes del empleador + 2 representantes de los trabajadores elegidos. Obligatorio para empresas con 10 o más trabajadores (Resolución 652/2012 y 1356/2012).
  **Paso 4 — Actas**: En la pestaña "Actas", registrar las actas de cada reunión bimestral del Comité (mínimo una reunión cada dos meses). Completar: fecha, asistentes, temas tratados (casos de acoso laboral, compromisos, seguimiento) y firma del presidente y secretario del comité. El sistema lleva el historial de actas y permite adjuntar el documento firmado en PDF.

- **1.2.1** Programa de capacitación anual (2 puntos): Para diligenciar, buscar el **Estándar 1.2.1** en la Evaluación Inicial → clic en el botón del módulo → en /programa-capacitacion-anual crear el cronograma con: tema, mes programado, responsable, duración estimada y población objetivo → Guardar. El programa debe cubrir los peligros de la Matriz IPERC. Se actualiza automáticamente conforme se ejecutan las capacitaciones.

- **1.2.2** Inducción y reinducción en SST (2 puntos): Para diligenciar, buscar el **Estándar 1.2.2** en la Evaluación Inicial → clic en el módulo → en /registros-induccion clic "Nuevo Registro" → seleccionar trabajador → tipo (inducción para nuevos / reinducción para cambio de cargo o regreso de incapacidad) → temas cubiertos: riesgos del cargo, EPP, emergencias, política SST → fecha → firma del trabajador → Guardar. Se genera soporte automáticamente.

- **1.2.3** Curso Virtual de 50 horas en SST (2 puntos): Para diligenciar, buscar el **Estándar 1.2.3** en la Evaluación Inicial → clic en el módulo → en /curso-50-horas registrar: nombre completo del responsable SST, institución que impartió el curso, fecha de realización, número de certificado → adjuntar copia del certificado → Guardar.

### Componente: Gestión Integral

- **2.1.1** Política de Seguridad y Salud en el Trabajo (2 puntos): Para diligenciar, buscar el **Estándar 2.1.1** en la Evaluación Inicial → clic en el módulo → en /politicas-sst clic "Nueva Política" → redactar la política con: compromiso con la seguridad y salud, mejora continua, cumplimiento legal, participación de trabajadores → registrar fecha de aprobación y nombre del firmante (representante legal) → Guardar. La política debe estar firmada, fechada y comunicada a todos los trabajadores.

- **2.2.1** Objetivos de SST (1 punto): Para diligenciar, buscar el **Estándar 2.2.1** en la Evaluación Inicial → clic en el módulo → en /objetivos-sst clic "Nuevo Objetivo" → completar: descripción del objetivo, indicador de medición, meta cuantitativa, responsable, plazo y recursos asignados → Guardar. El sistema hace seguimiento automático del avance. Los objetivos deben ser medibles y alineados con la política SST.

- **2.3.1** Evaluación Inicial del SG-SST (1 punto): Este estándar corresponde a la propia Evaluación Inicial que está diligenciando. Al completar todos los estándares, este se cumple automáticamente. Buscar el **Estándar 2.3.1** en la Evaluación Inicial → marcar como Cumple → Guardar. El sistema genera el informe de la evaluación inicial automáticamente.

- **2.4.1** Plan Anual de Trabajo (2 puntos): Para diligenciar, buscar el **Estándar 2.4.1** en la Evaluación Inicial → clic en el módulo → en /plan-trabajo-anual el sistema genera el plan basado en los estándares "No Cumple" de la evaluación → para cada actividad completar: responsable, recursos, cronograma mensual y meta → Guardar. El plan se actualiza conforme se completan las actividades.

- **2.5.1** Archivo y retención documental (2 puntos): Para diligenciar, buscar el **Estándar 2.5.1** en la Evaluación Inicial → la plataforma SST Colombia cumple esta función automáticamente conservando todos los documentos y registros → en el modo de verificación, adjuntar la tabla de retención documental o el procedimiento de archivo → marcar como Cumple → Guardar. El Decreto 1072/2015 exige conservar documentos del SG-SST por mínimo 20 años.

- **2.6.1** Rendición de cuentas (1 punto): Para diligenciar, buscar el **Estándar 2.6.1** en la Evaluación Inicial → en el modo de verificación, adjuntar el informe anual de rendición de cuentas del SG-SST presentado a la alta dirección (puede exportarse desde el PDF del Ministerio del Trabajo que genera el sistema) → marcar como Cumple → Guardar. La rendición debe presentarse mínimo una vez al año.

- **2.7.1** Matriz legal (1 punto): Para diligenciar, buscar el **Estándar 2.7.1** en la Evaluación Inicial → clic en el módulo → en /matriz-legal el sistema incluye la legislación SST aplicable (Decreto 1072/2015, Resolución 0312/2019, etc.) → revisar qué normas aplican según la actividad de la empresa → registrar el estado de cumplimiento de cada norma → Guardar. Actualizar cuando se expidan nuevas normas.

- **2.8.1** Mecanismos de comunicación (1 punto): Para diligenciar, buscar el **Estándar 2.8.1** en la Evaluación Inicial → en el modo de verificación, adjuntar el procedimiento de comunicación SST que defina: canales internos (carteleras, correos, reuniones), mecanismos para que trabajadores reporten condiciones peligrosas, y comunicación externa con ARL, EPS y autoridades → marcar como Cumple → Guardar.

- **2.9.1** Adquisición de bienes y servicios (1 punto): Para diligenciar, buscar el **Estándar 2.9.1** en la Evaluación Inicial → clic en el módulo → en /adquisiciones-sst clic en el botón para registrar una nueva adquisición y diligenciar exactamente estos campos del formulario:
  - **Tipo de Adquisición** (obligatorio): lista desplegable con opciones EPP, Maquinaria, Herramientas, Sustancias Químicas, Servicios, Equipos de Emergencia, Mobiliario, Software, Otros.
  - **Nivel de Riesgo**: desplegable Bajo, Medio, Alto, Crítico.
  - **Descripción** (obligatorio): campo de texto libre describiendo qué se adquiere.
  - **Área Destino**: campo de texto con el área de la empresa que recibirá lo adquirido.
  - **Solicitante**: desplegable para elegir el trabajador que solicita la adquisición.
  - **Justificación**: campo de texto explicando por qué se requiere.
  - **Presupuesto Estimado**: campo numérico de valor en pesos.
  - **Proveedor** (opcional): nombre del proveedor.
  - **Recurso Financiero**: desplegable para asociar la compra a un recurso/presupuesto ya definido.
  El sistema incluye un **Asistente Inteligente** que puede autocompletar varios de estos campos según catálogos predefinidos de EPP y equipos. Después de diligenciar, clic en Guardar.
  **FLUJO COMPLETO DE TRAZABILIDAD (compra → asignación)**: registrar la compra en 2.9.1 es solo el primer paso; según el **Tipo de Adquisición** elegido, el proceso se completa en un segundo estándar:
  - Si el Tipo de Adquisición fue **EPP** (cascos, guantes, gafas, botas, arnés, tapa-oídos, etc.) → el siguiente paso es registrar la ENTREGA a cada trabajador en el **Estándar 4.2.6** (módulo /entrega-epp).
  - Si el Tipo de Adquisición fue **Equipos de Emergencia** (botiquines, extintores, camillas, señalización de emergencia) → el siguiente paso es actualizar el inventario de recursos disponibles en el **Estándar 5.1.1** (módulo /plan-emergencias, pestaña de Recursos).
  - Si la compra no corresponde a ninguno de estos dos casos (ej. maquinaria, insumos generales), con el registro en 2.9.1 el ciclo queda completo.
  SIEMPRE que un usuario pregunte por el ingreso de una compra (EPP, botiquín, extintor, etc.), responde explicando este flujo completo de dos pasos, indicando ambos estándares por nombre y número, y menciona los campos exactos del formulario correspondiente (no des explicaciones genéricas).

- **2.10.1** Evaluación de proveedores y contratistas (1 punto): Para diligenciar, buscar el **Estándar 2.10.1** en la Evaluación Inicial → clic en el módulo → en /evaluacion-proveedores clic "Nuevo Proveedor/Contratista" → registrar: razón social, actividad que realiza, riesgos que genera, verificación de afiliación a seguridad social, capacitaciones SST exigidas, EPP requeridos y concepto de aptitud médica de sus trabajadores → Guardar. El empleador es solidariamente responsable. Requiere suscripción activa.

- **2.11.1** Gestión del cambio (1 punto): Para diligenciar, buscar el **Estándar 2.11.1** en la Evaluación Inicial → clic en el módulo → en /gestion-cambio clic "Nuevo Cambio" → registrar: descripción del cambio (proceso, equipo, estructura, personal), evaluación del impacto en SST, peligros nuevos que genera, medidas de control adoptadas, responsable y fecha de implementación → Guardar. Aplica para cambios en instalaciones, maquinaria, procesos o personal.

### Componente: Gestión de la Salud

- **3.1.1** Descripción sociodemográfica (1 punto): Para diligenciar, buscar el **Estándar 3.1.1** en la Evaluación Inicial → este estándar se alimenta automáticamente del módulo de Trabajadores donde se registran edad, género, escolaridad, estado civil, cargo y antigüedad → el sistema genera el perfil sociodemográfico automáticamente → marcar como Cumple → Guardar. Asegúrese de tener todos los trabajadores registrados con datos completos en Planear > Trabajadores.

- **3.1.2** Actividades de medicina del trabajo (1 punto): Para diligenciar, buscar el **Estándar 3.1.2** en la Evaluación Inicial → en el modo de verificación, adjuntar el programa de medicina preventiva y del trabajo que incluya: exámenes médicos periódicos, vacunación, actividades de promoción y prevención → se sustenta también con registros del módulo de Exámenes Médicos y Capacitaciones → marcar como Cumple → Guardar.

- **3.1.3** Perfiles de cargo (1 punto): Para diligenciar, buscar el **Estándar 3.1.3** en la Evaluación Inicial → asegúrese de que cada cargo tenga documentados los requisitos de aptitud física, mental y los riesgos del puesto en el módulo de Trabajadores → en el modo de verificación adjuntar los perfiles de cargo elaborados (con responsabilidades, requisitos físicos, peligros y controles) → marcar como Cumple → Guardar. Los perfiles son la base para los exámenes de ingreso.

- **3.1.4** Evaluaciones médicas ocupacionales (5 puntos): Para diligenciar, buscar el **Estándar 3.1.4** en la Evaluación Inicial → clic en el botón del módulo → en /examenes-medicos clic "Nuevo Examen" → completar: trabajador, tipo (ingreso / periódico / egreso / post-incapacidad), fecha, IPS o médico que lo realizó, concepto de aptitud (apto / apto con restricciones / no apto), restricciones si aplica → Guardar. El sistema lleva el control de vencimiento y genera alertas para exámenes próximos a vencer.

- **3.1.5** Custodia de historias clínicas (1 punto): Para diligenciar, buscar el **Estándar 3.1.5** en la Evaluación Inicial → en el modo de verificación, adjuntar: (1) contrato o acuerdo de custodia con la IPS o médico ocupacional responsable, (2) procedimiento interno de confidencialidad → marcar como Cumple → Guardar. Importante: el empleador NO puede ver el contenido clínico, solo el concepto de aptitud. Las historias deben custodiarse mínimo 20 años (Resolución 1995/1999).

- **3.1.6** Restricciones y recomendaciones médicas (1 punto): Para diligenciar, buscar el **Estándar 3.1.6** en la Evaluación Inicial → en /examenes-medicos, al registrar un examen con concepto "apto con restricciones", completar el campo de restricciones y recomendaciones → el sistema lleva seguimiento por trabajador → en el modo de verificación adjuntar el procedimiento de seguimiento a trabajadores con restricciones → Guardar.

- **3.1.7** Estilos de vida saludables (1 punto): Para diligenciar, buscar el **Estándar 3.1.7** en la Evaluación Inicial → en el modo de verificación, adjuntar evidencias de programas de promoción: charlas sobre prevención de tabaquismo, alcoholismo, alimentación saludable, actividad física → se sustenta con registros de capacitaciones sobre estos temas en el módulo de Capacitaciones → marcar como Cumple → Guardar.

- **3.1.8** Servicios de higiene y agua potable (1 punto): Para diligenciar, buscar el **Estándar 3.1.8** en la Evaluación Inicial → en el modo de verificación, adjuntar: (1) registro de inspección de instalaciones sanitarias, (2) certificado de potabilidad del agua si aplica, (3) cronograma de limpieza y desinfección → marcar como Cumple → Guardar. Para empresas con más de 50 trabajadores se requieren casilleros, duchas y zonas de descanso (Decreto 1072/2015, Art. 2.2.4.6.15).

- **3.1.9** Manejo de residuos (1 punto): Para diligenciar, buscar el **Estándar 3.1.9** en la Evaluación Inicial → en el modo de verificación, adjuntar: (1) programa de gestión de residuos (ordinarios, reciclables y peligrosos RESPEL), (2) contratos con gestores autorizados por la ANLA, (3) registros de manifiestos de transporte → marcar como Cumple → Guardar. El incumplimiento puede generar sanciones de la ANLA (Decreto 1076/2015, Resolución 1362/2007).

- **3.2.1** Reporte de accidentes e incidentes de trabajo (2 puntos): Para diligenciar, buscar el **Estándar 3.2.1** en la Evaluación Inicial → clic en el botón del módulo → en /accidentes clic "Nuevo Accidente" → completar: tipo de evento (Accidente de Trabajo / Incidente de Trabajo / Enfermedad Laboral), trabajador afectado, fecha y hora, lugar del evento, descripción detallada, parte del cuerpo afectada, tipo de lesión, días de incapacidad si aplica, severidad (Solo daños / Con heridos / Mortal) y medidas inmediatas tomadas → Guardar. El sistema actualiza automáticamente los indicadores de accidentalidad y el reporte debe enviarse a la ARL dentro de los 2 días hábiles siguientes.

- **3.2.2** Investigación de accidentes e incidentes (2 puntos): Para diligenciar, buscar el **Estándar 3.2.2** en la Evaluación Inicial → clic en el módulo → en /investigacion-accidentes seleccionar el accidente a investigar → completar: descripción del evento, causas inmediatas (actos y condiciones inseguras), causas básicas (factores personales y de trabajo), causa raíz, medidas correctivas y preventivas con responsable y fecha → Guardar. Plazo legal: AT graves o mortales dentro de los 15 días hábiles siguientes. Las medidas correctivas se vinculan automáticamente al Plan de Mejoramiento.

- **3.2.3** Registro y análisis estadístico de AT (1 punto): Para diligenciar, buscar el **Estándar 3.2.3** en la Evaluación Inicial → este estándar se cumple automáticamente cuando hay accidentes registrados en /accidentes. El sistema calcula los indicadores estadísticos → generar el informe desde Verificar > Indicadores de Accidentalidad → adjuntarlo en el modo de verificación y marcar como Cumple → Guardar. Si no hay AT en el año, adjuntar el reporte con cero accidentes.

- **3.3.1** Frecuencia de accidentalidad (1 punto): Para diligenciar, buscar el **Estándar 3.3.1** en la Evaluación Inicial → el sistema calcula automáticamente el Índice de Frecuencia con la fórmula: (N° AT × 240.000) / Horas-Hombre Trabajadas → ver en Verificar > Indicadores de Accidentalidad → adjuntar el informe y marcar como Cumple → Guardar. Requiere accidentes registrados en el módulo de Accidentes.

- **3.3.2** Severidad de accidentalidad (1 punto): Para diligenciar, buscar el **Estándar 3.3.2** en la Evaluación Inicial → el sistema calcula automáticamente: (Días perdidos × 240.000) / HHT → ver en Verificar > Indicadores de Accidentalidad → adjuntar el informe y marcar como Cumple → Guardar.

- **3.3.3** Mortalidad por accidentes (1 punto): Para diligenciar, buscar el **Estándar 3.3.3** en la Evaluación Inicial → el sistema calcula automáticamente: (N° muertes × 100.000) / N° trabajadores → ver en Verificar > Indicadores de Accidentalidad → adjuntar el informe y marcar como Cumple → Guardar.

- **3.3.4** Prevalencia de enfermedad laboral (1 punto): Para diligenciar, buscar el **Estándar 3.3.4** en la Evaluación Inicial → el sistema calcula automáticamente la prevalencia de enfermedades laborales diagnosticadas en el período → ver en Verificar > Indicadores de Accidentalidad → adjuntar el informe de enfermedades laborales reportadas a la ARL y marcar como Cumple → Guardar.

- **3.3.5** Incidencia de enfermedad laboral (1 punto): Para diligenciar, buscar el **Estándar 3.3.5** en la Evaluación Inicial → el sistema calcula automáticamente la incidencia de nuevos casos de enfermedad laboral en el período → ver en Verificar > Indicadores de Accidentalidad → adjuntar el informe y marcar como Cumple → Guardar.

- **3.3.6** Ausentismo laboral (1 punto): Para diligenciar, buscar el **Estándar 3.3.6** en la Evaluación Inicial → el sistema calcula automáticamente el índice de ausentismo (por AT, enfermedad general y laboral) → ver en Verificar > Indicadores de Accidentalidad → adjuntar el informe y marcar como Cumple → Guardar. Para un cálculo preciso, registrar todos los accidentes con sus días de incapacidad en el módulo de Accidentes.

### Componente: Peligros y Riesgos

- **4.1.1** Metodología para identificación de peligros - Matriz IPERC (15 puntos — el más importante): Para diligenciar, buscar el **Estándar 4.1.1** en la Evaluación Inicial → clic en el módulo → en /iperc clic "Nueva Entrada" → completar: proceso/área, peligro identificado (físico, químico, biológico, ergonómico, psicosocial, mecánico, eléctrico, locativo), riesgo asociado, controles existentes (fuente / medio / individuo), evaluación del riesgo (probabilidad × consecuencia según metodología GTC 45), nivel de riesgo (I, II, III, IV) y medidas de control adicionales → Guardar. La matriz debe cubrir todos los procesos, cargos y actividades de la empresa. Es el estándar con mayor peso en la evaluación.

- **4.1.2** Identificación de peligros con participación de todos los niveles (6 puntos): Para diligenciar, buscar el **Estándar 4.1.2** en la Evaluación Inicial → la identificación de peligros se registra en el módulo de Matriz IPERC (/iperc) → en el modo de verificación, adjuntar evidencia de que la identificación se hizo con participación de todos los niveles: actas de reuniones con trabajadores, COPASST, mandos medios y gerencia → marcar como Cumple → Guardar.

- **4.1.3** Sustancias carcinógenas o con toxicidad aguda (3 puntos): Para diligenciar, buscar el **Estándar 4.1.3** en la Evaluación Inicial → en el módulo de Matriz IPERC, incluir los peligros de tipo "químico" identificando sustancias carcinógenas o con toxicidad aguda (según clasificación GHS/SGA) → en el modo de verificación, adjuntar las Fichas de Datos de Seguridad (FDS) de dichas sustancias y el inventario de químicos → marcar como Cumple → Guardar. Si no maneja este tipo de sustancias, marcar como No Aplica.

- **4.1.4** Mediciones ambientales - higiene industrial (6 puntos): Para diligenciar, buscar el **Estándar 4.1.4** en la Evaluación Inicial → clic en el módulo → en /mediciones-ambientales clic "Nueva Medición" → registrar: agente medido (ruido, iluminación, temperatura, vibración, material particulado, gases), área o cargo evaluado, valor medido, valor límite permisible (TLV según ACGIH), resultado (cumple/no cumple) y recomendaciones → adjuntar el informe del higienista certificado → Guardar. Requiere suscripción activa.

### Componente: Control de Riesgos

- **4.2.1** Medidas de prevención y control para intervenir los peligros (2.5 puntos): Para diligenciar, buscar el **Estándar 4.2.1** en la Evaluación Inicial → las medidas de control se registran en la Matriz IPERC (/iperc) siguiendo la jerarquía de controles: 1. Eliminación del peligro, 2. Sustitución, 3. Controles de ingeniería, 4. Controles administrativos (señalización, procedimientos), 5. EPP → en el modo de verificación adjuntar evidencias de implementación (fotos, certificados, registros) → marcar como Cumple → Guardar.

- **4.2.2** Aplicación de medidas de prevención por los trabajadores (2.5 puntos): Para diligenciar, buscar el **Estándar 4.2.2** en la Evaluación Inicial → la evidencia se construye con: (1) registros de capacitación en los peligros del puesto (módulo Capacitaciones), (2) inspecciones donde se verifique uso correcto de EPP y controles (módulo Inspecciones), (3) actas de divulgación de procedimientos seguros → adjuntar estas evidencias cruzadas en el modo de verificación → marcar como Cumple → Guardar.

- **4.2.3** Procedimientos e instructivos de SST (2.5 puntos): Para diligenciar, buscar el **Estándar 4.2.3** en la Evaluación Inicial → en el modo de verificación, adjuntar los procedimientos escritos de trabajo seguro para actividades críticas identificadas en la Matriz IPERC: trabajo en alturas (Resolución 4272/2021), espacios confinados, manejo de químicos, bloqueo/etiquetado LOTO → cada procedimiento debe incluir: objetivo, riesgos, controles, EPP y pasos seguros → marcar como Cumple → Guardar. Al menos un procedimiento por cada peligro crítico.

- **4.2.4** Inspecciones sistemáticas a instalaciones, maquinaria y equipos (2.5 puntos): Para diligenciar, buscar el **Estándar 4.2.4** en la Evaluación Inicial → clic en el módulo → en /inspecciones clic "Nueva Inspección" → seleccionar tipo (locativa / maquinaria / equipos / EPP / eléctrica) → área o equipo inspeccionado → hallazgos (condición insegura, daño, deterioro) → clasificación (inmediato / corto plazo / largo plazo) → acción correctiva con responsable y fecha → Guardar. El sistema lleva seguimiento del cierre de hallazgos. Debe participar el COPASST.

- **4.2.5** Mantenimiento de instalaciones, equipos y herramientas (2.5 puntos): Para diligenciar, buscar el **Estándar 4.2.5** en la Evaluación Inicial → en el modo de verificación, adjuntar: (1) programa de mantenimiento preventivo con cronograma mensual, (2) registros de mantenimientos realizados (hojas de vida de equipos, certificados de calibración) → marcar como Cumple → Guardar. El mantenimiento preventivo reduce el riesgo de accidentes por fallas mecánicas.

- **4.2.6** Entrega de EPP con capacitación (2.5 puntos): Para diligenciar, buscar el **Estándar 4.2.6** en la Evaluación Inicial → clic en el módulo → en /entrega-epp clic "Nueva Entrega" y diligenciar exactamente estos campos del formulario:
  - **Trabajador** (obligatorio): desplegable de búsqueda para seleccionar al trabajador que recibe el EPP.
  - **EPP / Catálogo** (obligatorio): desplegable de búsqueda tomado del catálogo de EPP, o ingreso manual del nombre.
  - **Categoría** (obligatorio): desplegable Cabeza, Visual, Facial, Auditiva, Respiratoria, Manos, Pies, Corporal, Caídas, Otro.
  - **Fecha de Entrega** (obligatorio): selector de fecha, por defecto la fecha de hoy.
  - **Cantidad** (obligatorio): campo numérico, mínimo 1.
  - **Talla**: desplegable (si el catálogo la tiene) o ingreso manual.
  - **Motivo de Entrega** (obligatorio): desplegable Dotación Inicial, Dotación Periódica, Reposición por Desgaste, Reposición por Daño, Vencimiento, Pérdida, Cambio de Talla, Cambio de Puesto, Actualización Normativa.
  - **Capacitación de uso proporcionada**: casilla de verificación que indica si se dio capacitación sobre el uso correcto.
  - **Observaciones**: campo de texto libre.
  Después de diligenciar, clic en Guardar. El sistema genera el soporte firmado y lleva el historial por trabajador.

### Componente: Gestión de Amenazas

- **5.1.1** Plan de emergencias y contingencias (5 puntos): Para diligenciar, buscar el **Estándar 5.1.1** en la Evaluación Inicial → clic en el módulo → en /plan-emergencias?tab=recursos (pestaña **Recursos**) clic en el botón para agregar un nuevo recurso y diligenciar exactamente estos campos del formulario:
  - **Tipo de Recurso** (obligatorio): desplegable Extintor, Botiquín, Camilla, Linterna, Radio, Kit de Derrames, Hacha, Megáfono, Hidrante, Gabinete, Alarma, Otros.
  - **Código** (obligatorio): texto, se autogenera pero se puede editar.
  - **Nombre** (obligatorio): texto, ej. "Extintor PQS 10 lbs" o "Botiquín tipo A".
  - **Ubicación** (obligatorio): desplegable con ubicaciones sugeridas (Piso 1, Recepción, etc.) o ingreso manual.
  - **Estado**: desplegable Operativo, Requiere Mantenimiento, Vencido, Fuera de Servicio.
  Al seleccionar el Tipo de Recurso, el sistema muestra información técnica específica, certificaciones normativas aplicables y frecuencia de inspección sugerida. Después de diligenciar, clic en Guardar.
  Además del inventario de recursos, el estándar completo también requiere (en otras pestañas del mismo módulo /plan-emergencias): análisis de amenazas y vulnerabilidades (inundación, sismo, incendio, explosión, derrame), procedimientos de respuesta ante cada amenaza, rutas de evacuación, punto de encuentro y organigrama de emergencias. El plan debe estar actualizado, publicado y comunicado a todos los trabajadores.

- **5.1.2** Brigada de emergencias y simulacros (5 puntos): Para diligenciar, buscar el **Estándar 5.1.2** en la Evaluación Inicial → en el módulo de Plan de Emergencias (/plan-emergencias), registrar la brigada: nombre de los brigadistas, rol asignado (primeros auxilios / evacuación / contraincendios / búsqueda y rescate), capacitaciones recibidas y vigencia → adjuntar soportes de capacitación de la brigada → también registrar los simulacros realizados: fecha, tipo de emergencia, participantes, tiempo de evacuación y acciones de mejora → Guardar. Se exige mínimo un simulacro al año.

- **5.1.3** Simulacros de emergencias (incluido en 5.1.2 en algunas versiones): Para diligenciar, buscar el **Estándar 5.1.3** en la Evaluación Inicial → en /plan-emergencias, en la sección de simulacros registrar: fecha de realización, tipo de emergencia simulada (evacuación / incendio / sismo), número de participantes, tiempo de evacuación registrado, observaciones y acciones de mejora → adjuntar el acta o informe del simulacro → Guardar. La ARL puede apoyar en la realización del simulacro.

### Componente: Verificación

- **6.1.1** Indicadores de gestión del SG-SST (1.25 puntos): Para diligenciar, buscar el **Estándar 6.1.1** en la Evaluación Inicial → los indicadores se generan automáticamente en Verificar > Indicadores de Accidentalidad: indicadores de estructura (recursos asignados), proceso (actividades ejecutadas vs. planificadas) y resultado (accidentalidad, ausentismo, enfermedades) → adjuntar el informe de indicadores en el modo de verificación → marcar como Cumple → Guardar.

- **6.1.2** Auditoría anual del SG-SST (1.25 puntos): Para diligenciar, buscar el **Estándar 6.1.2** en la Evaluación Inicial → clic en el módulo → en /auditorias-internas clic "Nueva Auditoría" → completar: fecha, auditor (interno o externo), alcance, hallazgos (conformidades y no conformidades), plan de acción para cerrar no conformidades → Guardar. La auditoría debe realizarse mínimo una vez al año y el auditor no puede auditar su propio trabajo.

- **6.1.3** Revisión por la alta dirección (1.25 puntos): Para diligenciar, buscar el **Estándar 6.1.3** en la Evaluación Inicial → clic en el módulo → en /revision-direccion clic "Nueva Revisión" → registrar: fecha, participantes (gerente, responsable SST, COPASST), temas revisados (resultados de indicadores, auditorías, accidentes, recursos SST), conclusiones y compromisos de la gerencia → adjuntar el acta firmada → Guardar. Se realiza mínimo una vez al año.

- **6.1.4** Auditoría con participación del COPASST (1.25 puntos): Para diligenciar, buscar el **Estándar 6.1.4** en la Evaluación Inicial → en el módulo de Auditorías Internas (/auditorias-internas), al crear la auditoría anual incluir a los miembros del COPASST o Vigía SST como parte del equipo auditor → adjuntar el acta con firma de los representantes del COPASST → marcar como Cumple → Guardar.

### Componente: Mejoramiento

- **7.1.1** Acciones preventivas y correctivas con base en resultados del SG-SST (2.5 puntos): Para diligenciar, buscar el **Estándar 7.1.1** en la Evaluación Inicial → clic en el módulo → en /plan-mejoramiento clic "Nueva Acción" → completar: tipo (preventiva / correctiva / de mejora), descripción del hallazgo o no conformidad, causa raíz (metodología 5 ¿Por qué? o Ishikawa), acción propuesta, responsable, fecha de cumplimiento y estado → Guardar. El sistema hace seguimiento del cierre de cada acción.

- **7.1.2** Acciones de mejora conforme a revisión de la alta dirección (2.5 puntos): Para diligenciar, buscar el **Estándar 7.1.2** en la Evaluación Inicial → las acciones de mejora de la Revisión por la Dirección se vinculan automáticamente al módulo de Plan de Mejoramiento (/plan-mejoramiento) → en el acta de revisión de dirección, registrar los compromisos específicos con responsable y fecha → el sistema genera las acciones de mejora correspondientes → Guardar.

- **7.1.3** Acciones de mejora con base en investigación de accidentes e incidentes (2.5 puntos): Para diligenciar, buscar el **Estándar 7.1.3** en la Evaluación Inicial → las medidas correctivas registradas en el módulo de Investigación de Accidentes (/investigacion-accidentes) se vinculan automáticamente al Plan de Mejoramiento → asegúrese de completar el campo "medidas correctivas" en cada investigación → el sistema las registra como acciones y hace seguimiento → Guardar.

- **7.1.4** Plan de mejoramiento (2.5 puntos): Para diligenciar, buscar el **Estándar 7.1.4** en la Evaluación Inicial → en /plan-mejoramiento se consolidan todas las acciones correctivas, preventivas y de mejora del SG-SST (provenientes de auditorías, investigación de accidentes, revisión por la dirección e inspecciones) → completar el estado de avance y fecha de cierre de cada acción → Guardar. La plataforma genera automáticamente el informe del plan de mejoramiento.

### PESV - Preguntas frecuentes del módulo P01 Comité

- **¿Cómo asignar el LSO como Líder PESV?** La plataforma lo hace automáticamente. Pasos exactos: (1) Ir a la pestaña PESV → Evaluaciones PESV → abrir la evaluación activa → clic en el paso **P01** → clic "Ir al módulo". (2) En la pestaña "Integrantes", clic en **"Agregar Integrante"**. (3) En el campo **"Rol en el Equipo"**, seleccionar **"Líder PESV"**. (4) Al seleccionar ese rol, el sistema detecta automáticamente el LSO asignado en el SG-SST y muestra un **banner azul** con su nombre, licencia y cargo. (5) Clic en **"Sí, usar LSO asignado"** → los campos Nombre y Cargo se pre-llenan solos. (6) Completar Email si se desea y clic **"Agregar"**. REQUISITO PREVIO: que la empresa ya tenga un LSO designado como Responsable del SG-SST en Planear → Designación de Responsables. Si no hay LSO asignado previamente, el banner no aparece y los campos deben llenarse manualmente.

- **¿Qué roles existen en el equipo PESV (Comité)?** Los roles disponibles al agregar integrantes son: Líder PESV, Representante de los trabajadores, Presidente, Secretario, Jefe de flota, Inspector de vehículos, Coordinador de capacitación, Coordinador de salud, Asesor externo, y Otro.

- **¿Qué funciones se llenan automáticamente al seleccionar el rol?** Al seleccionar cualquier rol en el formulario de integrante PESV, el campo "Funciones y Responsabilidades" se pre-llena automáticamente con las funciones típicas de ese rol (según la Resolución 40595/2022). El usuario puede editarlas si lo necesita.

### PESV - Preguntas frecuentes sobre P03, P05 y P06 (auto-generación y auto-cálculo)

- **¿Cómo diligenciar el paso P03 - Diagnóstico / Contexto Organizacional?** El paso P03 tiene un botón de generación automática llamado **"Generar desde datos del sistema"** que crea hasta 14 factores contextuales con datos reales de la empresa. Para que funcione correctamente, es obligatorio tener diligenciados primero estos módulos en el siguiente orden: (1) **H04 - Vehículos Seguros** — registrar la flota vehicular con SOAT y revisión técnico-mecánica; (2) **H01 - Factor Humano / Conductores** — registrar conductores con licencia y examen médico de aptitud; (3) **H03 - Documentación y Comparendos** — registrar infracciones de tránsito en el panel de comparendos de cada conductor; (4) **H02 - Capacitación en Seguridad Vial** — registrar capacitaciones del plan PESV; (5) **V02 - Registro y Análisis de Siniestros** — registrar siniestros viales del año; (6) **Trabajadores** en el módulo SST — para calcular el total de colaboradores. Si estos módulos no tienen datos, el sistema genera igual 5 factores legales fijos (Resolución 40595/2022, Decreto 1079/2015). Con datos reales genera hasta 14 factores personalizados con cifras concretas (ej: "3 siniestros en 2025", "2 conductores con licencia vencida"). El sistema nunca duplica factores existentes. Orden recomendado: H04 → H01 → H03 → H02 → V02 → Trabajadores SST → luego P03.

- **¿Cómo diligenciar el paso P04 - Matriz de Riesgos Viales?** P04 es el módulo donde se registran todos los riesgos viales de la empresa y se les asigna un plan de tratamiento. El flujo completo tiene 4 pasos: **PASO 1 — Agregar el riesgo:** Evaluación PESV → paso P04 → "Ir al módulo" → botón "Agregar Riesgo". Diligencie: nombre (ej: "Ruido"), descripción/consecuencias (ej: "Hipoacusia, estrés, fatiga auditiva, trastornos del sueño"), categoría del factor de riesgo (Factor Humano / Vehículo / Infraestructura / Condiciones Ambientales), probabilidad (Muy Baja / Baja / Media / Alta / Muy Alta) e impacto (Insignificante / Menor / Moderado / Mayor / Catastrófico). El sistema calcula automáticamente el valor de riesgo (P × I) y el nivel (Bajo/Medio/Alto/Muy Alto/Crítico). Guarde. **PASO 2 — Generar el tratamiento:** En la tarjeta del riesgo, clic en el botón **"Tratamiento"**. Se abre un panel con los tratamientos existentes. Clic "Agregar Tratamiento". Complete: tipo (Evitar / Reducir / Compartir-transferir / Aceptar el riesgo), descripción de la medida de control, responsable, fecha límite y estado (pendiente / en progreso / completado). Clic "Guardar tratamiento". El estado del riesgo cambia a "En Tratamiento" automáticamente en la tarjeta. **PASO 3 — Sincronizar al SST:** En la misma tarjeta del riesgo, clic en **"Sincronizar SST"**. El sistema crea un peligro en la Matriz IPERC del SST con clasificación "Condiciones de Seguridad", subcategoría "Seguridad Vial - [categoría]", descripción "[PESV] Nombre: descripción", y convierte automáticamente los niveles de ISO 31000 a GTC-45. Si la empresa no tiene Matriz IPERC creada, el sistema la crea automáticamente llamada "Matriz IPERC - Riesgos PESV Sincronizados". Si el riesgo ya fue sincronizado antes, el sistema avisa que ya existe sin duplicarlo. **PASO 4 — Verificar la sincronización:** Vaya a **Planear → Identificación de Peligros, Evaluación y Valoración de Riesgos (módulo IPERC)**. Abra la Matriz IPERC. Busque el peligro que comienza con "[PESV]" — ese es el riesgo sincronizado desde PESV. Ese peligro contribuye al cumplimiento del **Estándar 4.1.1** de la Resolución 0312/2019. Resumen del flujo: P04 → Agregar riesgo → Tratamiento → Sincronizar SST → verificar en IPERC (Planear) → estándar 4.1.1 queda respaldado.

- **¿Qué módulos debo tener llenos antes de usar P03?** Antes de ejecutar la generación automática de P03, debe tener registrada información en: **H04 - Vehículos Seguros**, **H01 - Factor Humano / Conductores**, **H03 - Comparendos** (panel dentro de H01), **H02 - Capacitación en Seguridad Vial**, **V02 - Siniestros**, y el módulo **Trabajadores** del SG-SST. Sin estos datos previos, el sistema solo puede generar factores legales genéricos, no los factores personalizados con cifras reales de la empresa.

- **¿Cómo diligenciar el paso P05 - Objetivos e Indicadores?** El paso P05 gestiona los Indicadores de Desempeño de Seguridad (SPI) según ISO 39001 Cláusula 9.1. P05 tiene DOS botones de automatización: (A) **"Auto-completar valores"** en el formulario principal (al crear o editar un indicador) — completa automáticamente los cuatro campos: Valor Meta, Valor Mínimo, Valor Máximo y Valor Actual con datos reales del sistema y benchmarks de referencia ISO 39001; (B) **"Auto-calcular"** en el diálogo de Medición — actualiza únicamente el valor de la medición actual del indicador ya creado. Para que ambos botones funcionen correctamente es obligatorio diligenciar primero los siguientes módulos, según el indicador que desee calcular: (1) **Tasa de siniestros viales** y **Tasa de mortalidad vial** → requieren **H04 - Vehículos Seguros** (registrar la flota) + **V02 - Registro y Análisis de Siniestros** (registrar siniestros del año en curso); (2) **Índice de infracciones de tránsito** → requiere **H01 - Factor Humano / Conductores** (registrar conductores activos) + **H03 - Documentación y Comparendos** (registrar comparendos en el panel de cada conductor); (3) **Cumplimiento de inspecciones preoperacionales** → requiere **H06 - Inspecciones Preoperacionales** (registrar inspecciones realizadas) + **H04 - Vehículos Seguros** (tener la flota registrada); (4) **Cobertura de capacitación en seguridad vial** → requiere **H02 - Capacitación en Seguridad Vial** (registrar capacitaciones con estado "completada") + **H01 - Conductores** (para contar el total de personal capacitado); (5) **Cumplimiento del plan de mantenimiento** → requiere **H05 - Mantenimiento Vehicular** (registrar mantenimientos preventivos y correctivos del año); (6) **Conductores con licencia vigente** y **Conductores con examen médico vigente** → requieren **H01 - Factor Humano / Conductores** con los campos "Fecha vencimiento licencia" y "Fecha vencimiento examen médico" completamente diligenciados para cada conductor activo; (7) **Documentos vehiculares vigentes** (SOAT + RTM) → requiere **H04 - Vehículos Seguros** con los campos "Vencimiento SOAT" y "Vencimiento revisión técnico-mecánica" completamente diligenciados para cada vehículo activo. Orden recomendado para diligenciar antes de P05: **H04** (vehículos) → **H01** (conductores) → **H03** (comparendos) → **H02** (capacitaciones) → **H05** (mantenimiento) → **H06** (inspecciones preoperacionales) → **V02** (siniestros viales) → luego abrir **P05** y usar "Auto-completar valores". Pasos para usar el botón "Auto-completar valores": Evaluación PESV → paso P05 → "Ir al módulo" → clic en "+ Nuevo Indicador" o editar uno existente → seleccionar la plantilla del catálogo → clic en **"Auto-completar valores"** → el sistema consulta todos los módulos anteriores y completa los cuatro campos de valor con datos reales y benchmarks de referencia. Un panel verde confirma que se completó con datos reales; un panel amarillo indica que los benchmarks de referencia se aplicaron pero el valor actual requiere ingreso manual.

- **¿Qué módulos debo diligenciar antes de P05?** Antes de usar el auto-cálculo o el botón "Auto-completar valores" de P05, debe tener datos en los siguientes módulos: **H04 - Vehículos Seguros** (flota con SOAT y revisión técnico-mecánica), **H01 - Factor Humano / Conductores** (conductores activos con fechas de licencia y examen médico), **H03 - Comparendos** (infracciones de tránsito registradas en cada conductor), **H02 - Capacitación en Seguridad Vial** (capacitaciones del año con estado "completada"), **H05 - Mantenimiento Vehicular** (mantenimientos preventivos y correctivos del año), **H06 - Inspecciones Preoperacionales** (inspecciones realizadas a los vehículos), **V02 - Registro y Análisis de Siniestros** (siniestros viales registrados del año). Sin estos datos, el sistema aplica únicamente los benchmarks de referencia (meta, mínimo, máximo) pero no puede calcular el valor actual automáticamente. El orden ideal es: H04 → H01 → H03 → H02 → H05 → H06 → V02 → luego P05.

- **¿Cómo funciona el auto-cálculo del paso P05 - Objetivos e Indicadores?** P05 tiene dos botones: (1) **"Auto-completar valores"** en el formulario principal — completa los cuatro campos (Meta, Mínimo, Máximo, Actual) al crear o editar un indicador; (2) **"Auto-calcular"** en el diálogo de Medición — actualiza el valor de la medición actual de un indicador ya existente. Ambos consultan los mismos módulos según el tipo de indicador: tasa de siniestralidad/mortalidad → **V02** + **H04**; infracciones → **H03** + **H01**; inspecciones preoperacionales → **H06** + **H04**; cobertura de capacitación → **H02** + **H01**; mantenimiento → **H05**; vigencia de licencias y exámenes → **H01** (con fechas diligenciadas); documentos vehiculares → **H04** (con SOAT y RTM diligenciados). Cuando el cálculo es exitoso aparece un panel verde con la explicación del cálculo (ej: "5 inspecciones realizadas / 220 programadas × 100"). Cuando no hay datos suficientes aparece un panel amarillo indicando que el valor actual debe ingresarse manualmente, pero los benchmarks de referencia (Meta, Mínimo, Máximo) sí se aplican automáticamente.

- **¿Cómo diligenciar el paso P06 - Factores de Desempeño SPF?** El paso P06 gestiona los Factores de Desempeño de Seguridad (SPF) según ISO 39001:2012 Cláusula 6.3. P06 es totalmente automático: al seleccionar cualquier factor del catálogo, el sistema completa TODOS los campos incluyendo Valor Base, Valor Actual y Meta Anual desde los datos reales del sistema. Aquí están los módulos exactos que debe tener diligenciados para que cada factor se calcule automáticamente: (1) **"Cumplimiento del plan de mantenimiento vehicular"** → requiere **H05 - Mantenimiento Vehicular**: registre los mantenimientos realizados a la flota en PESV → H05, clasificando cada uno como "preventivo" o "correctivo". El sistema calcula: mantenimientos preventivos / total mantenimientos × 100. (2) **"Cumplimiento de inspecciones preoperacionales"** → requiere **H06 - Inspecciones Preoperacionales** + **H04 - Vehículos Seguros**: registre inspecciones diarias en H06 y tenga la flota activa en H04. El sistema calcula: inspecciones realizadas / inspecciones programadas (flota × días laborales × meses) × 100. (3) **"Cobertura de capacitación en seguridad vial"** → requiere **H02 - Capacitación en Seguridad Vial**: registre capacitaciones del año con estado "completada". El sistema calcula: capacitaciones completadas / total capacitaciones del año × 100. (4) **"Porcentaje de vehículos con documentación vigente"** → requiere **H04 - Vehículos Seguros**: en cada vehículo activo diligencie los campos "Fecha vencimiento SOAT" y "Fecha vencimiento revisión técnico-mecánica (RTM)". El sistema calcula: vehículos con SOAT Y RTM vigentes / total vehículos activos × 100. (5) **"Cobertura de exámenes médicos ocupacionales para conductores"** → requiere **H01 - Factor Humano / Conductores**: en cada conductor activo diligencie el campo "Fecha vencimiento examen médico de aptitud para conducir". El sistema calcula: conductores con examen vigente / total conductores activos × 100. (6) **"Porcentaje de conductores con licencia vigente y categoría apropiada"** → requiere **H01 - Factor Humano / Conductores**: en cada conductor activo diligencie el campo "Fecha vencimiento licencia de conducción". El sistema calcula: conductores con licencia vigente / total conductores activos × 100. (7) **"Índice de infracciones de tránsito"** → requiere **H03 - Documentación y Comparendos** + **H01 - Conductores**: en el módulo H01, dentro de cada conductor, registre los comparendos en el panel "Comparendos y Multas". El sistema calcula: comparendos del año / total conductores activos × 100. (8) **"Tasa de siniestralidad vial"** y **"Tasa de mortalidad vial"** → requieren **V02 - Registro y Análisis de Siniestros** + **H04 - Vehículos**: registre cada siniestro vial en PESV → V02 con fecha, tipo, heridos y fallecidos. El sistema calcula tasa de siniestros: siniestros del año / flota × 100; mortalidad: fallecidos / trabajadores × 100.000. (9) **"Índice de severidad de siniestros"** → requiere **V02 - Siniestros** con el campo "Número de heridos" diligenciado en cada siniestro. El sistema calcula: total heridos en siniestros del año / total siniestros × 1. (10) Factores de exposición (**kilómetros recorridos, horas de conducción, número de viajes**) → NO tienen cálculo automático porque requieren datos de GPS u odómetro. Se ingresan manualmente. Pasos para usar P06: Evaluación PESV → paso P06 → "Ir al módulo" → "Agregar Factor" → seleccionar del catálogo → todos los campos se completan solos → revisar valores → "Guardar". Si un factor muestra 0 con panel amarillo, significa que el módulo fuente no tiene datos aún; complete ese módulo y use el botón "Auto-calcular" para actualizar el factor. También puede usar "Generar X Factores ISO" para crear todos los factores estándar de una vez. Orden ideal antes de P06: **H04** → **H01** → **H03** → **H02** → **H05** → **H06** → **V02** → luego P06.

- **¿Qué módulos debo diligenciar antes de P06?** Para que el auto-cálculo de P06 funcione completamente, necesita datos en estos módulos: **H04 - Vehículos Seguros** (flota activa con "Vencimiento SOAT" y "Vencimiento RTM" diligenciados en cada vehículo), **H01 - Factor Humano / Conductores** (conductores activos con "Fecha vencimiento licencia" y "Fecha vencimiento examen médico" diligenciados en cada conductor), **H03 - Comparendos** (comparendos registrados en el panel de cada conductor dentro de H01), **H02 - Capacitación en Seguridad Vial** (capacitaciones del año con estado "completada"), **H05 - Mantenimiento Vehicular** (mantenimientos preventivos y correctivos del año registrados), **H06 - Inspecciones Preoperacionales** (inspecciones vehiculares realizadas registradas), **V02 - Registro y Análisis de Siniestros** (siniestros viales del año con campos de heridos y fallecidos diligenciados). El **Valor Base** de cada factor es el valor calculado en el momento de crearlo — es la línea de partida. El **Valor Actual** se actualiza con el botón "Auto-calcular" cada vez que hace una nueva medición. La **Meta Anual** se completa con el benchmark de referencia ISO 39001 (ej: 95% para mantenimiento, 100% para documentación y licencias, 0 para siniestros y mortalidad).

- **¿Puedo usar P03, P05 o P06 sin haber llenado los módulos H01, H04, V02, etc.?** Sí, se puede acceder a los pasos en cualquier orden, pero la generación y el cálculo automático producirán resultados limitados o vacíos. El sistema siempre avisa qué datos faltan. Se recomienda gestionar primero los módulos base (H04 Vehículos → H01 Conductores → H03 Comparendos → H02 Capacitaciones → H05 Mantenimiento → H06 Inspecciones → V02 Siniestros) antes de ejecutar la generación automática de P03, el auto-cálculo de P05 y el auto-cálculo de P06.

## CONSEJOS GENERALES DE USO DE LA PLATAFORMA
- **No aparece un módulo en el menú**: Puede ser restricción de su plan de suscripción o de su rol. Si es por plan, vaya a Administración Global > Mi Cuenta para verificar. Si es por rol, consulte con el administrador de su empresa.
- **La empresa no ve el módulo PESV**: El módulo PESV se activa cuando la empresa registra al menos un vehículo. Vaya a Administración Global > Empresas, edite su empresa y actualice el campo 'Número de Vehículos'.
- **Error al importar Excel de trabajadores**: Use la plantilla oficial (botón 'Descargar Plantilla'). No modifique los encabezados. Guarde como .xlsx.
`;

const ROLE_LABELS: Record<string, string> = {
  superadmin: "Super Administrador",
  admin: "Gerente General",
  soporte: "Soporte Técnico",
  superusuario: "Super Usuario",
  responsable_sst: "Responsable SST",
  coordinador_salud: "Coordinador de Salud Ocupacional",
  lso: "Licenciado en Salud Ocupacional",
  coordinador_sst: "Coordinador SST",
  coordinador_rrhh: "Coordinador RRHH",
  jefe_personal: "Jefe de Personal",
  supervisor: "Supervisor",
  vigia_sst: "Vigía SST",
  auditor_interno: "Auditor Interno SG-SST",
  trabajador: "Trabajador",
  coordinador_pesv: "Coordinador PESV",
  conductor: "Conductor",
  asistente_sst: "Asistente SST",
};

function buildSystemPrompt(userRole: string, companyName?: string): string {
  const roleLabel = ROLE_LABELS[userRole] || userRole;
  const userContext = companyName
    ? `\n\nCONTEXTO DEL USUARIO ACTUAL:\n- Rol: ${roleLabel}\n- Empresa: ${companyName}\nCuando guíes al usuario, ten en cuenta su rol. Solo menciona módulos y acciones que su rol puede ver y realizar según la sección "VISIBILIDAD POR ROL". Si pregunta por algo que su rol no puede hacer, explícale amablemente quién en su empresa puede hacerlo (ej: "Esa función está disponible para el Responsable SST o el Coordinador SST de tu empresa").`
    : `\n\nCONTEXTO DEL USUARIO ACTUAL:\n- Rol: ${roleLabel}\nCuando guíes al usuario, ten en cuenta su rol. Solo menciona módulos y acciones que su rol puede ver y realizar según la sección "VISIBILIDAD POR ROL".`;

  return `Eres el asistente virtual de SST Colombia, un sistema de gestión de Seguridad y Salud en el Trabajo.

Tu rol es ayudar a usuarios del sistema con:
- Navegación y uso de la plataforma SST Colombia (conoces cada módulo, ruta y funcionalidad)
- Preguntas sobre normativa colombiana de SST (Resolución 0312/2019, Decreto 1072/2015, ISO 45001:2018)
- Guía sobre el ciclo PHVA (Planear, Hacer, Verificar, Actuar)
- Preguntas sobre el Plan Estratégico de Seguridad Vial (PESV) según Resolución 40595/2022
- Instrucciones paso a paso sobre cómo usar cada módulo de la plataforma

Reglas importantes:
1. Responde SIEMPRE en español colombiano, de manera profesional y clara.
2. FORMATO DE RESPUESTA OBLIGATORIO: Responde SIEMPRE en DOS partes separadas por una línea que diga exactamente "Leer más...":
   - PRIMERA PARTE (antes de "Leer más..."): Una respuesta corta y directa de 1-2 oraciones que conteste la pregunta de forma resumida.
   - SEGUNDA PARTE (después de "Leer más..."): La explicación completa con pasos detallados, listas numeradas, y toda la información relevante.
   Ejemplo de formato:
   "Los accidentes se registran desde el Estándar 3.2.1 en la Evaluación Inicial.

   Leer más...

   ### Pasos detallados:
   1. En la Evaluación Inicial, buscar el **Estándar 3.2.1** "Reporte de AT e Incidente de Trabajo"...
   2. Clic en el botón del módulo → en /accidentes clic "Nuevo Accidente"...
   3. ..."
3. REGLA FUNDAMENTAL: Cuando el usuario pregunte cómo hacer algo relacionado con cumplimiento SST (registrar accidentes, capacitaciones, inspecciones, EPP, COPASST, etc.), el punto de partida SIEMPRE es la **Evaluación Inicial**. ASUME que el usuario ya sabe cómo llegar a ella — NUNCA expliques cómo abrir la Evaluación Inicial ni cómo navegar hasta ella. Ve directo al grano: indica qué estándar buscar y cómo usar el módulo. El flujo que debes describir es: buscar el **Estándar X.X.X** en la Evaluación Inicial → clic en el botón del módulo → completar los campos → Guardar. NUNCA digas "Ir a Hacer → Accidentes" o "Ir a Planear → Capacitaciones" directamente. NUNCA digas "Ir a la pestaña PLANEAR, seleccionar Gestión Integral, luego Evaluación Inicial". Todo se gestiona DESDE la Evaluación Inicial que el usuario ya tiene. LA ÚNICA EXCEPCIÓN es el módulo de **Trabajadores**: los trabajadores se registran SIEMPRE desde el menú Planear > Trabajadores, NUNCA desde la Evaluación Inicial. Es el primer paso antes de crear la Evaluación Inicial.
4. REGLA DE ESTÁNDARES Y DILIGENCIAMIENTO (OBLIGATORIA): Cuando respondas sobre cómo hacer cualquier actividad SST, SIEMPRE debes:
   a) Mencionar el número exacto del estándar de la Resolución 0312/2019 que corresponde (ejemplo: "Estándar 3.2.1", "Estándar 2.6.1"). Búscalo en la sección "ESTÁNDARES DE LA RESOLUCIÓN 0312/2019" de tu base de conocimiento.
   b) Explicar paso a paso cómo diligenciar el módulo: qué campos llenar, qué botones usar, qué información se requiere.
   c) Indicar qué pasa automáticamente en el sistema después de guardar (ej: "el estándar se actualiza automáticamente", "los indicadores se calculan solos").
   NUNCA respondas solo con instrucciones genéricas sin mencionar el número del estándar específico.
5. Cuando cites normativa, menciona el artículo o resolución específica.
6. No inventes funcionalidades que no existen en el sistema. Solo menciona lo que está en la base de conocimiento.
7. Mantén un tono amigable y profesional.
8. Si no sabes algo específico, indica que el usuario puede crear un ticket de soporte desde el ícono de engranaje → Tickets de Soporte.
9. Si la pregunta no está relacionada con SST o la plataforma, redirige amablemente al tema.
10. Cuando menciones módulos que requieren suscripción, indícalo al usuario.
11. Adapta tu respuesta al rol del usuario: si es trabajador guíalo al Portal de Empleados, si es LSO al Portal del Licenciado, si es admin/responsable dale instrucciones completas.
12. IMPORTANTE: Si el módulo que el usuario necesita usar NO está disponible para su rol, NUNCA cortes la respuesta solo con "contacte a la persona encargada". SIEMPRE explica primero el proceso completo (estándar(es) involucrados, flujo paso a paso, qué se diligencia) igual que si pudiera hacerlo él mismo, y AL FINAL agrega una nota indicando qué rol (Responsable SST / Coordinador SST / Admin) es quien debe ejecutar la acción en el sistema. Es decir: primero enseña el "qué" y el "cómo" del proceso, y solo al final aclara el "quién" lo ejecuta si su rol no tiene el permiso. Nunca respondas SOLO con una redirección sin explicar el proceso.
13. Recuerda: La Evaluación Inicial es el CENTRO del sistema. Todo fluye desde allí. El Plan Anual de Trabajo se genera desde la evaluación y organiza las actividades en cronograma mensual.
14. IMPORTANTE: La empresa del usuario YA ESTÁ CONFIGURADA. La configuración de empresa (NIT, CIIU, razón social) se realizó durante el proceso de suscripción/registro. NUNCA digas al usuario que debe "Crear Empresa" ni "Configurar la Empresa" — eso ya está hecho. Cuando pregunten cómo empezar, el primer paso real es agregar trabajadores desde Planear → Trabajadores.
15. REGLA DE UBICACIÓN PRECISA (OBLIGATORIA): Cuando respondas preguntas sobre dónde está algo en la plataforma, SIEMPRE debes indicar la ubicación exacta usando este formato:
    - Para módulos del SG-SST: indica la pestaña del ciclo PHVA y el submenú exacto. Ejemplo: "Se encuentra en la pestaña **HACER** del ciclo PHVA, en el submenú **Capacitaciones**."
    - Para módulos del PESV: indica el código de paso EXACTO y la fase del ciclo. Ejemplo: "Se encuentra en el módulo PESV, **paso H07 - Gestión de la Velocidad** (ciclo **HACER**)." o "El Monitoreo GPS está en PESV → pestaña HACER → **paso H07** (Gestión de la Velocidad)."
    - NUNCA respondas solo con "en la sección de X" sin indicar el ciclo PHVA y el código del paso (para PESV) o la pestaña exacta (para SG-SST).
    - Para PESV los 24 pasos son: P01-P08 (PLANEAR), H01-H11 (HACER), V01-V03 (VERIFICAR), A01-A02 (ACTUAR). Cada módulo del menú PESV tiene un código de paso asignado según la base de conocimiento.
16. REGLA CRÍTICA DE DISTINCIÓN PESV vs SG-SST: El sistema tiene DOS módulos de capacitaciones COMPLETAMENTE SEPARADOS:
    - **Capacitaciones SG-SST** (Estándares 1.2.1 — Programa de Capacitación Anual, 1.2.2 — Inducción/Reinducción en SST, 1.2.3 — Curso 50 horas): para temas generales de seguridad y salud en el trabajo (EPP, emergencias, política SST, riesgos del cargo). Se gestiona desde la Evaluación Inicial → módulo /capacitaciones o /registros-induccion.
    - **Capacitaciones PESV** (Paso H02): para temas de seguridad VIAL (manejo defensivo, normativa de tránsito, primeros auxilios viales). Se gestiona SOLO desde la Evaluación PESV → paso H02. NUNCA desde la Evaluación Inicial.
    Cuando el usuario pregunta sobre capacitaciones de "seguridad vial", "conductores", "manejo defensivo", "tránsito" o cualquier tema PESV, SIEMPRE responde con el flujo PESV (Evaluación PESV → H02), NO con la Evaluación Inicial ni los Estándares 1.2.1/1.2.2.
    Lo mismo aplica para todos los módulos PESV: los Conductores (H01/H03) NO son los mismos que los Trabajadores; los Vehículos (H04) son exclusivos del PESV; los Siniestros (V02) son diferentes a los Accidentes del SG-SST.
17. REGLA DEL PORTAL DE EMPLEADOS: Cuando respondas sobre cualquier módulo que tenga conexión con el Portal de Empleados (Capacitaciones, Inducciones, Exámenes Médicos, Audiometrías, Comunicaciones SST, Elecciones COPASST/Convivencia, Comité PESV, Capacitaciones PESV), menciona siempre esta conexión al final de la respuesta. El trabajador puede ver esa información en su portal sin necesidad de que el admin se lo muestre directamente.
18. REGLA DE FLUJO COMPRA → ASIGNACIÓN (OBLIGATORIA): Cuando el usuario pregunte por el ingreso de una compra, adquisición o factura relacionada con SST (por ejemplo botiquines, extintores, EPP, camillas), SIEMPRE explica el flujo completo de DOS pasos: (1) registrar la compra en el **Estándar 2.9.1** (módulo /adquisiciones-sst), y (2) según qué se compró, completar el segundo paso: si es EPP → **Estándar 4.2.6** (módulo /entrega-epp, registrar la entrega firmada a cada trabajador); si es un elemento de emergencias (botiquín, extintor, camilla, señalización) → **Estándar 5.1.1** (módulo /plan-emergencias, actualizar el inventario de recursos). Nunca respondas solo con el primer paso ni omitas mencionar los números de los estándares.
19. REGLA DE PASOS PESV — CONSULTA OBLIGATORIA DE BASE DE CONOCIMIENTO (CRÍTICA): Cuando el usuario pregunte sobre cualquier paso PESV por su código (P01, P02, P03, P04, P05, P06, P07, P08, H01, H02, H03, H04, H05, H06, H07, H08, H09, H10, H11, V01, V02, V03, A01, A02) o por su nombre equivalente, DEBES:
   a) Localizar la entrada EXACTA de ese paso en tu base de conocimiento (sección "MÓDULO PESV").
   b) Basar tu respuesta EXCLUSIVAMENTE en lo que dice esa entrada. NUNCA generes pasos genéricos de navegación que no estén en la base de conocimiento.
   c) Si el paso tiene funciones automáticas (botones de auto-generación, auto-cálculo, catálogos pre-llenados), SIEMPRE mencionarlas de forma destacada — son la funcionalidad principal que el usuario necesita conocer.
   d) Si el paso tiene "Requisitos previos" o módulos necesarios listados en la base de conocimiento, SIEMPRE incluirlos en la respuesta con los nombres exactos de los módulos (H01, H04, V02, etc.) tal como están escritos.
   e) NUNCA respondas a una pregunta sobre un paso PESV con instrucciones genéricas como "ve a la pestaña PESV, navega a Evaluaciones, selecciona tu evaluación, busca el paso..." — eso ya lo sabe el usuario. Ve directo al contenido específico del paso: qué hace, qué botones tiene, qué datos requiere y en qué módulos previos se apoya.
   EJEMPLO CORRECTO para P03: mencionar el botón "Generar desde datos del sistema", los 6 módulos prerequisito (H04, H01, H03, H02, V02, Trabajadores SST), la diferencia entre 5 factores legales vs 14 factores con datos reales.
   EJEMPLO INCORRECTO para P03: decir "ve a la pestaña PESV → Evaluaciones → clic en P03 → completa el diagnóstico → guarda". Eso es genérico e inútil.
${userContext}

${APP_KNOWLEDGE_BASE}`;
}

const MAX_HISTORY_MESSAGES = 6;
const MAX_CONTENT_LENGTH = 2000;

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60 * 60 * 1000;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

function sanitizeHistory(history: any[]): { role: "user" | "assistant"; content: string }[] {
  if (!Array.isArray(history)) return [];
  return history
    .slice(-MAX_HISTORY_MESSAGES)
    .filter(
      (msg) =>
        msg &&
        typeof msg === "object" &&
        (msg.role === "user" || msg.role === "assistant") &&
        typeof msg.content === "string" &&
        msg.content.length <= MAX_CONTENT_LENGTH
    )
    .map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content.trim(),
    }));
}

export function registerChatbotRoutes(app: Express, requireAuth?: RequestHandler): void {
  const middlewares: RequestHandler[] = [];
  if (requireAuth) {
    middlewares.push(requireAuth);
  }

  app.post("/api/chatbot/ask", ...middlewares, async (req: Request, res: Response) => {
    let aborted = false;
    req.on("close", () => { aborted = true; });

    try {
      const { question, conversationHistory } = req.body;
      if (!question || typeof question !== "string" || question.trim().length === 0) {
        return res.status(400).json({ error: "La pregunta es requerida" });
      }
      if (question.length > MAX_CONTENT_LENGTH) {
        return res.status(400).json({ error: "La pregunta es demasiado larga (máximo 2000 caracteres)" });
      }

      const user = (req as any).user;
      if (!user?.id) {
        return res.status(401).json({ error: "Debes iniciar sesión para usar el asistente" });
      }

      const userId = user.id;
      const companyId = user.companyId || null;
      const userRole = user.role || "trabajador";

      if (!checkRateLimit(userId)) {
        return res.status(429).json({ error: "Has alcanzado el límite de preguntas por hora. Intenta más tarde." });
      }

      let companyName: string | undefined;
      if (companyId) {
        const now = Date.now();
        const cached = companyNameCache.get(companyId);
        if (cached && now < cached.expiresAt) {
          companyName = cached.name;
        } else {
          try {
            const [company] = await db.select({ name: companies.name }).from(companies).where(eq(companies.id, companyId)).limit(1);
            companyName = company?.name;
            if (companyName) {
              companyNameCache.set(companyId, { name: companyName, expiresAt: now + COMPANY_CACHE_TTL });
            }
          } catch {}
        }
      }

      const startTime = Date.now();

      const cacheKey = `${userRole}:${companyName || ""}`;
      const now = Date.now();
      let systemPrompt: string;
      const cachedPrompt = promptCache.get(cacheKey);
      if (cachedPrompt && now < cachedPrompt.expiresAt) {
        systemPrompt = cachedPrompt.prompt;
      } else {
        systemPrompt = buildSystemPrompt(userRole, companyName);
        promptCache.set(cacheKey, { prompt: systemPrompt, expiresAt: now + PROMPT_CACHE_TTL });
      }

      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: "system", content: systemPrompt },
      ];

      const sanitized = sanitizeHistory(conversationHistory);
      for (const msg of sanitized) {
        messages.push(msg);
      }

      messages.push({ role: "user", content: question.trim() });

      if (aborted) return;

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");

      const stream = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        stream: true,
        max_completion_tokens: 1000,
        temperature: 0.3,
      });

      let fullResponse = "";
      let tokensUsed = 0;

      for await (const chunk of stream) {
        if (aborted) break;
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullResponse += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
        if (chunk.usage) {
          tokensUsed = chunk.usage.total_tokens;
        }
      }

      const responseTimeMs = Date.now() - startTime;

      db.insert(chatbotQuestions).values({
        companyId,
        userId,
        question: question.trim(),
        answer: fullResponse,
        tokensUsed: tokensUsed || null,
        responseTimeMs,
      }).catch(() => {});

      if (!aborted) {
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
      }
    } catch (error: any) {
      if (aborted) return;
      console.error("Chatbot error:", error?.message || error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Error al procesar tu pregunta. Intenta de nuevo." })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Error al procesar tu pregunta. Intenta de nuevo." });
      }
    }
  });
}
