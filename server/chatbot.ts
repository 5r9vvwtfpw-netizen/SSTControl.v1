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
La plataforma usa navegación por pestañas horizontales siguiendo el ciclo PHVA (Planear-Hacer-Verificar-Actuar). En la barra superior hay pestañas: Configuración (engranaje), Planear, Hacer, Verificar, Actuar, y PESV (si la empresa tiene vehículos). Al hacer clic en cada pestaña se despliega un menú con las opciones disponibles.

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

## PESTAÑA CONFIGURACIÓN (Engranaje)
Acceso desde el ícono de engranaje en la barra superior.

### Gestión General
- **Empresas** → /empresas: Lista todas las empresas registradas. Desde aquí puedes ver detalles, editar datos, ver trabajadores de cada empresa. El botón "Crear Empresa" inicia un asistente de 2 pasos.
- **Usuarios** → /usuarios: Gestión de todos los usuarios del sistema. Crear, editar, desactivar usuarios. Asignar roles y empresas.
- **Portal de Empleados** → /portal-empleados: Vista del portal que ven los trabajadores. Incluye información personal, capacitaciones asignadas, entrega de EPP, documentos.

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
- **Designación de Responsable** → /designacion-responsable: Documentar quién es el responsable del SG-SST.
- **Asignar LSO Externo** → /asignar-lso-externo: Asignar un profesional licenciado externo.
- **Políticas SST** → /politicas-sst: Redactar y gestionar las políticas de SST de la empresa.
- **Partes Interesadas** → /partes-interesadas: Identificación de partes interesadas del SG-SST.
- **Análisis de Contexto** → /analisis-contexto: Análisis del contexto organizacional para SST.
- **Plan de Mejoramiento** → /plan-mejoramiento-contexto: Planes de mejoramiento del contexto.
- **Matriz Legal** → /matriz-legal: Identificación de requisitos legales aplicables (requiere suscripción).
- **Objetivos SST** → /objetivos-sst: Definición de objetivos e indicadores SST (requiere suscripción).
- **Conservación de Documentos** → /conservacion-documentos: Gestión documental del SG-SST.
- **Perfil Sociodemográfico** → /perfil-sociodemografico: Estadísticas sociodemográficas de los trabajadores.

## PESTAÑA HACER (H)
Corresponde a la fase de Implementación del ciclo PHVA.

### Panel Ejecutivo
- **Panel HACER - Controles** → /dashboard-hacer: Dashboard con métricas de ejecución: capacitaciones realizadas, inspecciones completadas, EPP entregados, etc.

### Módulos principales de Hacer
- **Capacitaciones** → /capacitaciones: Programar, registrar y hacer seguimiento de capacitaciones SST. Incluye asistencia, evaluación, certificados.
- **Programa de Capacitación Anual** → /programa-capacitacion-anual: Cronograma anual de capacitaciones planificadas.
- **Curso 50 Horas** → /curso-50-horas: Registro del curso virtual de 50 horas del SG-SST.
- **Registros de Inducción** → /registros-induccion: Control de inducciones y reinducciones de trabajadores.
- **Configuración de Inducción** → /configuracion-induccion: Personalizar el contenido de la inducción virtual.
- **Inspecciones** → /inspecciones: Registrar inspecciones de seguridad (locativas, equipos, EPP, etc.).
- **Entrega de EPP** → /entrega-epp: Registro de entrega de Elementos de Protección Personal a trabajadores.
- **Accidentes** → /accidentes: Reporte de accidentes e incidentes laborales (formato FURAT).
- **Investigación de Accidentes** → /investigacion-accidentes: Investigación detallada de accidentes con árbol de causas.
- **Árbol de Causas** → /arbol-causas: Metodología de análisis causal de accidentes.
- **Exámenes Médicos** → /examenes-medicos: Gestión de exámenes médicos ocupacionales (ingreso, periódicos, egreso). Requiere suscripción.
- **Trabajadores Alto Riesgo** → /trabajadores-alto-riesgo: Identificación y seguimiento de trabajadores en actividades de alto riesgo.
- **Mediciones Ambientales** → /mediciones-ambientales: Registro de mediciones de ruido, iluminación, temperatura, etc. Requiere suscripción.
- **Conservación Auditiva** → /conservacion-auditiva: Programa de conservación auditiva.
- **Sustancias Químicas** → /sustancias-quimicas: Inventario y manejo seguro de sustancias químicas. Requiere suscripción.
- **Vigilancia Epidemiológica** → /vigilancia-epidemiologica: Sistemas de vigilancia epidemiológica.
- **Actividades de Promoción y Prevención** → /actividades-promocion-prevencion: Registro de actividades de bienestar y prevención.
- **Estilos de Vida Saludable** → /estilos-vida-saludable: Programa de estilos de vida saludable.
- **IPERC** → /iperc: Identificación de Peligros, Evaluación de Riesgos y Controles.
- **Plan de Emergencias** → /plan-emergencias: Plan de prevención, preparación y respuesta ante emergencias.
- **Medidas Preventivas** → /medidas: Gestión de acciones preventivas y correctivas.
- **Evaluación de Proveedores** → /evaluacion-proveedores: Evaluación de contratistas y proveedores en SST. Requiere suscripción.
- **Gestión de Cambios** → /gestion-cambios: Gestión del cambio organizacional y su impacto en SST. Requiere suscripción.
- **Adquisiciones SST** → /adquisiciones-sst: Procedimiento de adquisiciones con criterios SST. Requiere suscripción.
- **Comunicación SST** → /comunicacion-sst: Plan de comunicaciones del SG-SST. Requiere suscripción.
- **Planes de Trabajo Anual** → /planes-trabajo-anual: Plan de trabajo anual del SG-SST con actividades y cronograma.

### COPASST / Vigía
- **COPASST Gestión** → /copasst o /copasst-gestion: Gestión del Comité Paritario de Seguridad y Salud en el Trabajo. Actas de reuniones, conformación, funciones.
- **Capacitación COPASST** → /capacitacion-copasst: Registro de capacitaciones a miembros del COPASST.
- **COPASST CMS** → /copasst-cms: Contenido y documentos del COPASST.
- **Evaluaciones COPASST** → /copasst-evaluaciones: Evaluación del funcionamiento del COPASST.
- **Comité de Convivencia** → /comite-convivencia-actas: Actas y gestión del Comité de Convivencia Laboral.

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
Accesible desde la pestaña "PESV" en la barra de navegación.

- **Evaluaciones PESV** → /pesv: Evaluaciones según Resolución 40595/2022 con tres niveles de complejidad (básico, estándar, avanzado).
- **Vehículos** → /pesv/vehiculos: Inventario de vehículos de la empresa.
- **Conductores** → /pesv/conductores: Registro de conductores con licencias y documentación.
- **Siniestros** → /pesv/siniestros: Registro y seguimiento de siniestros viales.
- **Capacitaciones PESV** → /pesv/capacitaciones: Capacitaciones específicas de seguridad vial.
- **Inspecciones PESV** → /pesv/inspecciones: Inspecciones preoperacionales de vehículos.
- **Mantenimiento Vehicular** → /pesv/mantenimiento: Control de mantenimiento preventivo y correctivo.
- **Monitoreo GPS** → /pesv/monitoreo-gps: Seguimiento GPS de vehículos.
- **Rutas Seguras** → /pesv/rutas-seguras: Definición y evaluación de rutas seguras.
- **Matriz de Riesgos Viales** → /pesv/matriz-riesgos: Identificación y evaluación de riesgos viales.
- **Indicadores PESV** → /pesv/indicadores: Indicadores de desempeño en seguridad vial.
- **Comité PESV** → /pesv/comite: Gestión del comité de seguridad vial.
- **Liderazgo** → /pesv/liderazgo: Compromiso de la alta dirección con seguridad vial.
- **Contexto Organizacional** → /pesv/contexto-organizacional: Análisis del contexto organizacional para PESV.
- **Factores de Desempeño** → /pesv/factores-desempeno: Evaluación de factores de desempeño vial.
- **Mejora Continua PESV** → Acciones de mejora del PESV.
- **Revisión por la Dirección PESV** → Revisión gerencial del PESV.
- **Auditorías PESV** → Auditorías del sistema de gestión vial.

## FLUJO PRINCIPAL DEL SISTEMA - TODO PARTE DE LA EVALUACIÓN INICIAL

IMPORTANTE: En SST Colombia, el punto de partida para llegar al 100% de cumplimiento es la **Evaluación Inicial** (Resolución 0312/2019). NO se navega directamente a los módulos desde el menú para gestionar el cumplimiento. El flujo correcto es:

### Paso 1: Configurar la Empresa
1. Ir a Configuración → Empresas → "Crear Empresa"
2. Ingresar código CIIU, NIT, razón social, datos de contacto
3. El sistema clasifica automáticamente el nivel de riesgo ARL y el capítulo aplicable (I, II o III)

### Paso 2: Agregar Trabajadores
1. Ir a Planear → Personal → Trabajadores
2. Opción A: Clic "Agregar Trabajador" → llenar formulario → Guardar
3. Opción B: Clic "Importar Excel" → descargar plantilla → llenar datos → subir archivo

### Paso 3: Crear la Evaluación Inicial (CENTRO DEL SISTEMA)
1. Ir a Planear → Gestión Integral → Evaluación Inicial
2. Clic "Nueva Evaluación" → seleccionar año
3. La evaluación muestra TODOS los estándares aplicables según el capítulo de la empresa
4. Cada estándar tiene un estado (Cumple, No Cumple, No Aplica, Justifica No Cumplimiento)
5. **Desde cada estándar** hay botones y enlaces que llevan directamente al módulo correspondiente para completar la evidencia

### Paso 4: Completar Estándares DESDE la Evaluación
El flujo correcto para cumplir cada estándar es:
1. Abrir la Evaluación Inicial
2. Revisar el estándar que se quiere cumplir (ej: "Capacitación en SST")
3. Hacer clic en el enlace o botón que aparece en ese estándar → el sistema te lleva al módulo correspondiente (ej: Capacitaciones)
4. Completar la actividad en el módulo (registrar la capacitación, subir evidencia, etc.)
5. Volver a la Evaluación → el estándar se actualiza automáticamente mostrando el cumplimiento

### Ejemplos del flujo correcto:
- **Para registrar un accidente**: Abrir Evaluación Inicial → buscar el estándar de "Reporte e Investigación de Accidentes" → desde allí ir al módulo de Accidentes → registrar el accidente → volver a la evaluación
- **Para programar capacitaciones**: Abrir Evaluación Inicial → buscar el estándar de "Capacitación en SST" → desde allí ir al módulo de Capacitaciones → programar la capacitación → volver a la evaluación
- **Para entregar EPP**: Abrir Evaluación Inicial → buscar el estándar de "EPP" → desde allí ir al módulo de Entrega de EPP → registrar la entrega → volver a la evaluación
- **Para registrar inspecciones**: Abrir Evaluación Inicial → buscar el estándar de "Inspecciones" → desde allí ir al módulo de Inspecciones → crear inspección → volver a la evaluación
- **Para gestionar COPASST**: Abrir Evaluación Inicial → buscar el estándar de "COPASST/Vigía" → desde allí ir al módulo de COPASST → registrar actas y conformación → volver a la evaluación

### Paso 5: Plan Anual de Trabajo
1. Desde la Evaluación Inicial se puede generar un Plan Anual de Trabajo
2. El plan organiza todas las actividades necesarias en un cronograma mensual
3. Las actividades del plan están vinculadas a los estándares de la evaluación
4. Se puede hacer seguimiento del avance mes a mes desde el cronograma

### Paso 6: Verificar el Cumplimiento
1. La Evaluación Inicial calcula automáticamente el porcentaje de cumplimiento
2. Los indicadores (ILI, Frecuencia, Severidad, Mortalidad, etc.) se calculan automáticamente basado en los datos registrados
3. Se pueden ver desde Verificar → Indicadores de Accidentalidad

### Paso 7: Actuar (Mejora Continua)
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
Los trabajadores acceden al portal con sus credenciales y pueden:
- Ver su información personal
- Consultar capacitaciones asignadas
- Ver historial de entrega de EPP
- Acceder a la inducción virtual
- Enviar solicitudes ARCO (derechos de datos personales)

### Soporte
- **Tickets de Soporte** → /tickets-soporte: Crear tickets para reportar problemas
- **Chatbot**: Este asistente virtual para resolver dudas rápidas
- **Videos de Ayuda**: Tutoriales disponibles dentro de la plataforma

## VISIBILIDAD POR ROL (Qué ve cada usuario)

### Superadmin / Admin / Superusuario / Responsable SST
Acceso completo: Ven TODAS las pestañas PHVA (Configuración, Planear, Hacer, Verificar, Actuar) y PESV. Pueden crear, editar y eliminar en todos los módulos. El Superadmin puede además ver todas las empresas y el panel de facturación global. El Superusuario puede gestionar la suscripción de su empresa.

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
Solo ve el **Portal de Empleados** → /portal-empleados. Desde allí puede:
- Ver su información personal
- Ver sus capacitaciones asignadas
- Ver historial de entrega de EPP
- Ver su contrato y exámenes médicos propios
- Crear reportes/solicitudes
- Acceder a la inducción virtual
NO ve las pestañas PHVA ni ningún módulo de gestión.

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

## PREGUNTAS FRECUENTES POR MÓDULO (MANUAL DE SOPORTE)

### Evaluación de Estándares SST (Archivo Maestro)
Ruta: Verificar > Evaluaciones SST > [Abrir Evaluación]
Este es el ARCHIVO MAESTRO del SG-SST. Todos los estándares de la Resolución 0312/2019 se gestionan desde aquí. Al hacer clic en un estándar se abre un diálogo donde se califica Cumple/No Cumple/No Aplica. El sistema sugiere enlaces a los módulos relacionados como evidencia.
- **Cómo calificar un estándar**: Vaya a Verificar > Evaluaciones SST y abra su evaluación activa. Verá los estándares agrupados por componente. Haga clic en el estándar que desea calificar y se abrirá un diálogo con las opciones: 'Cumple' (otorga puntaje), 'No Cumple' (0 puntos) o 'No Aplica' (mantiene puntaje si se justifica). El sistema calcula automáticamente el porcentaje total.
- **Cuántos estándares me aplican**: Depende del tamaño y riesgo de su empresa: Microempresa (hasta 10 trabajadores, Riesgo I-III) = 7 estándares. Pequeña empresa (11-50, Riesgo I-III) = 21 estándares. Mediana/Grande (más de 50 o Riesgo IV-V) = 61 estándares. El sistema lo calcula automáticamente al crear la evaluación.
- **No encuentro un estándar específico**: Dentro de su evaluación SST, los estándares están agrupados por 7 componentes (Recursos, Gestión Integral, Gestión de Salud, etc.). Desplácese por la lista o use el componente correspondiente para encontrar el estándar. El número del estándar (ej: 1.1.1) le ayuda a ubicarlo rápidamente.
- **Cómo generar el PDF del Ministerio**: Abra su evaluación SST en Verificar > Evaluaciones SST y busque el botón 'PDF Ministerio del Trabajo'. Se generará un informe completo con secciones A-I incluyendo el Hilo Dorado de trazabilidad que conecta estándares, acciones de mejora y actividades del plan de trabajo.
- **Cómo crear una acción de mejora desde un estándar**: Dentro de la evaluación SST, al calificar un estándar como 'No Cumple', el sistema le permite crear directamente una acción de mejora vinculada. Así queda la trazabilidad completa entre el estándar incumplido y la acción correctiva.

### Trabajadores
Evidencia para estándares 1.1.4, 3.1.1.
- **No puede registrar un trabajador**: Abra su Evaluación SST (Verificar > Evaluaciones SST). Busque el estándar que necesita (ej: 1.1.4 Afiliaciones). Al hacer clic verá el modo de verificación que le indica qué evidencia necesita. El sistema le sugiere el módulo de Trabajadores donde puede registrar la información. Si aparece un error de límite de trabajadores, verifique su plan en Configuración > Mi Suscripción.
- **Quiere importar trabajadores masivamente**: Primero revise qué estándares necesitan datos de trabajadores abriendo su Evaluación SST. Para importar masivamente, desde la lista de trabajadores use el botón 'Importar Excel'. Descargue la plantilla, llénela y súbala. El sistema acepta variaciones en los nombres de campos.
- **No encuentra un trabajador registrado**: Desde la lista de trabajadores, use la barra de búsqueda por nombre o documento. Verifique que no haya filtros activos.

### Capacitaciones
Evidencia para estándares 1.2.1, 1.2.2, 1.2.3.
- **Cómo registrar una capacitación**: Abra su Evaluación SST (Verificar > Evaluaciones SST) y busque los estándares 1.2.1, 1.2.2 o 1.2.3. Haga clic en el estándar para ver el modo de verificación: le indica qué evidencia necesita. El sistema le sugiere el módulo de Capacitaciones donde puede crear registros (Tema, Fecha, Duración, Instructor, Asistentes). Después regrese a la Evaluación para calificar el estándar como Cumple.
- **Cómo registrar asistencia**: Abra la capacitación registrada y en la sección de Asistentes, marque cada trabajador que asistió. Esta evidencia respalda los estándares 1.2.1-1.2.3 que califica desde su Evaluación SST.
- **Qué capacitaciones son obligatorias**: Abra su Evaluación SST y revise los estándares 1.2.1 (programa anual), 1.2.2 (inducción/reinducción) y 1.2.3 (curso 50 horas). Al hacer clic en cada uno verá el modo de verificación que describe exactamente qué se necesita.

### Inspecciones de Seguridad
Evidencia para estándar 4.2.5.
- **Cómo crear una inspección**: Abra su Evaluación SST y busque el estándar 4.2.5 (inspecciones sistemáticas). Haga clic para ver el modo de verificación. El sistema le sugiere el módulo de Inspecciones donde puede crear registros (tipo, fecha, área, hallazgos). Después regrese a la Evaluación para calificar.
- **Qué tipos de inspección hay**: El sistema soporta: inspección general, de EPP, orden y aseo, extintores y botiquines.

### Accidentes e Incidentes
Evidencia para estándares 3.2.1, 3.2.2, 3.2.3.
- **Cómo registrar un accidente**: Abra su Evaluación SST y busque los estándares 3.2.1 (reporte), 3.2.2 (investigación) o 3.2.3 (registro estadístico). El sistema le sugiere el módulo de Accidentes donde puede registrar el tipo, fecha, trabajador afectado y medidas tomadas.
- **Cómo hacer la investigación del accidente**: El estándar 3.2.2 de su Evaluación SST requiere investigación de accidentes. Abra el accidente registrado, busque la sección de Investigación y complete: participantes, hallazgos, causas raíz y acciones correctivas.

### Exámenes Médicos
Evidencia para estándares 3.1.1, 3.1.2, 3.1.3.
- **Cómo registrar un examen médico**: Abra su Evaluación SST y busque los estándares 3.1.1 a 3.1.3. El sistema le sugiere el módulo de Exámenes Médicos donde puede registrar trabajador, tipo, fecha y concepto.
- **Cómo ver exámenes próximos a vencer**: El sistema envía alertas automáticas cuando los exámenes están próximos a vencer. Puede ver el listado desde el módulo de Exámenes Médicos ordenando por fecha de vencimiento.

### Entrega de EPP
Evidencia para estándar 4.2.4.
- **Cómo registrar entrega de EPP**: Abra su Evaluación SST y busque el estándar 4.2.4. El sistema le sugiere el módulo de Entrega EPP donde puede registrar trabajador, elementos del catálogo, cantidad y fechas.

### Plan de Trabajo Anual
Evidencia para estándar 2.4.1.
- **Cómo crear el plan anual**: Abra su Evaluación SST y busque el estándar 2.4.1. El sistema le sugiere el módulo de Plan de Trabajo donde puede crear el plan con actividades, responsables, cronograma y recursos. Las actividades se pueden vincular a acciones del Plan de Mejora.
- **Cómo marcar una actividad como completada**: En el detalle del plan, cada actividad tiene un toggle para completarla. Si está vinculada a una acción de mejora, el avance se recalcula automáticamente.

### Matriz IPERC
Evidencia para estándares 4.1.1 a 4.1.4.
- **Cómo crear la matriz de riesgos**: Abra su Evaluación SST y busque los estándares 4.1.1 a 4.1.4. El sistema le sugiere el módulo Matriz IPERC donde puede agregar procesos, peligros, niveles de riesgo y controles.

### Indicadores de Accidentalidad
Evidencia para estándares 3.3.1 a 3.3.6.
- **Cómo se calculan los indicadores**: El sistema los calcula automáticamente a partir de los accidentes registrados. Verifique los valores y luego califique cada estándar en la Evaluación.

### Objetivos SST
Evidencia para estándar 2.2.1.
- **Cómo vincular objetivos con estándares**: Al crear objetivos, puede vincularlos con estándares específicos para trazabilidad formal.

### Matriz Legal
Evidencia para estándar 2.7.1.
- **Cómo agregar un requisito legal**: El sistema le sugiere el módulo donde puede registrar normas, artículos, obligaciones y responsables.

### Plan de Emergencias
Evidencia para estándares 5.1.1 a 5.1.3.
- **Qué incluye el plan de emergencias**: El modo de verificación le indica qué evidencia necesita (amenazas, brigadas, simulacros). El sistema le sugiere el módulo de Plan de Emergencias.

### Auditorías Internas
Evidencia para estándares 6.1.2, 6.1.4.
- **Cómo crear una auditoría**: El sistema le sugiere el módulo de Auditorías donde puede crear registros con criterios pre-cargados.

### Revisión por la Dirección
Evidencia para estándar 6.1.3.
- **Qué debe incluir la revisión**: El modo de verificación le indica qué debe incluir (auditorías, indicadores, acciones correctivas, conclusiones).

### Plan de Mejoramiento
Evidencia para estándares 7.1.1 a 7.1.4.
- **Cómo crear una acción de mejora**: Al calificar un estándar como 'No Cumple', el sistema le permite crear directamente una acción de mejora vinculada al estándar. Las acciones se vinculan automáticamente al Plan de Trabajo para seguimiento del avance.

### COPASST / Vigía
Evidencia para estándares 1.1.6, 1.1.7.
- **Diferencia entre COPASST y Vigía**: Menos de 10 trabajadores = Vigía, 10 o más = COPASST. El sistema se adapta automáticamente.

### Gestión del Cambio
Evidencia para estándar 2.11.1.
- **Cuándo registrar un cambio**: Cuando hay cambios en procesos, equipos, instalaciones, personal, sustancias o normas.

### Comunicación SST
Evidencia para estándar 2.8.1.
- **Qué comunicaciones debo registrar**: Políticas, cambios, alertas, convocatorias sobre SST.

### Mi Cuenta / Suscripción
- **Cómo cambiar de plan**: Vaya a Configuración > Mi Suscripción. Al cambiar datos como número de trabajadores o vehículos, el precio se recalcula automáticamente.
- **Cómo ver facturas**: En Configuración > Mi Suscripción encontrará el historial de facturas, próxima fecha de cobro y método de pago.
- **Cómo agregar usuarios**: Vaya a Configuración > Usuarios > 'Nuevo Usuario'. Cada rol administrativo incluye un usuario sin costo adicional.

## GUÍA DE PASOS PESV (Plan Estratégico de Seguridad Vial)
Todos los pasos se gestionan desde la Evaluación PESV (archivo maestro). Abra PESV > Evaluaciones PESV y busque su evaluación activa.

### Fase PLANEAR
- **P01 - Equipo de Trabajo**: Pestaña 'Planear', paso P01. El sistema muestra módulos relacionados (Comité PESV) donde registrar evidencia.
- **P02 - Liderazgo y Compromiso**: Pestaña 'Planear', paso P02. Evidencia: política de seguridad vial, compromisos de la dirección.
- **P03 - Diagnóstico / Contexto**: Pestaña 'Planear', paso P03. El sistema pre-llena datos según nivel de complejidad.
- **P04 - Evaluación de Riesgos Viales**: Pestaña 'Planear', paso P04. Identificación de peligros por factor humano, vehículo, infraestructura y condiciones ambientales.
- **P05 - Objetivos e Indicadores**: Pestaña 'Planear', paso P05. Metas medibles de reducción de siniestralidad.
- **P06 - Programas y Planes**: Pestaña 'Planear', paso P06. Módulos de factores de desempeño.
- **P07 - Roles y Responsabilidades**: Pestaña 'Planear', paso P07.
- **P08 - Recursos**: Pestaña 'Planear', paso P08. Presupuesto, equipos y personal.

### Fase HACER
- **H01 - Factor Humano - Conductores**: Pestaña 'Hacer', paso H01. Módulo de Conductores (datos, licencia, exámenes médicos).
- **H02 - Capacitación Vial**: Pestaña 'Hacer', paso H02. Módulo de Capacitaciones PESV (manejo defensivo, normativa, primeros auxilios viales).
- **H03 - Documentación de Conductores**: Pestaña 'Hacer', paso H03. Seguimiento de licencias, certificaciones, exámenes y sanciones.
- **H04 - Vehículos Seguros**: Pestaña 'Hacer', paso H04. Módulo de Vehículos (placa, marca, modelo, SOAT, revisión tecnomecánica).
- **H05 - Mantenimiento Preventivo**: Pestaña 'Hacer', paso H05. Módulo de Mantenimiento (preventivo y correctivo).
- **H06 - Inspecciones Preoperacionales**: Pestaña 'Hacer', paso H06. Lista de verificación diaria (frenos, luces, llantas, documentos).
- **H07 - Gestión de Velocidad**: Pestaña 'Hacer', paso H07. Monitoreo GPS para seguimiento de velocidad y alertas.
- **H08 - Rutas Seguras**: Pestaña 'Hacer', paso H08. Rutas con origen, destino, distancia, puntos críticos y medidas de control.
- **H09 - Fatiga y Somnolencia**: Pestaña 'Hacer', paso H09. Control de jornadas, pausas activas, programas de descanso.
- **H10 - Sustancias Psicoactivas**: Pestaña 'Hacer', paso H10. Política de alcohol y drogas, pruebas, programas de prevención.
- **H11 - Atención a Víctimas**: Pestaña 'Hacer', paso H11. Protocolo de primeros auxilios, directorio de emergencias viales.

### Fase VERIFICAR
- **V01 - Indicadores de Gestión**: Pestaña 'Verificar', paso V01. Módulo de Indicadores PESV (tasa de siniestralidad, cobertura de capacitaciones).
- **V02 - Registro y Análisis de Siniestros**: Pestaña 'Verificar', paso V02. Módulo de Siniestros (fecha, ubicación, vehículo, conductor, daños, causa).
- **V03 - Auditorías PESV**: Pestaña 'Verificar', paso V03. Evaluación de cada paso, hallazgos y no conformidades.

### Fase ACTUAR
- **A01 - Mejora Continua PESV**: Pestaña 'Actuar', paso A01. Acciones preventivas, correctivas y de mejora.
- **A02 - Revisión por la Dirección PESV**: Pestaña 'Actuar', paso A02. Análisis de resultados, conclusiones y compromisos.

## RESPUESTAS POR ESTÁNDAR (Resolución 0312/2019)
Cuando un usuario pregunte por un estándar específico, usa esta referencia:

### Componente: Recursos
- **1.1.1** Asignación del responsable del SG-SST: Documento de asignación con funciones, horas dedicadas y perfil.
- **1.1.2** Asignación de responsabilidades en SST: Documento que asigne responsabilidades SST a todos los niveles.
- **1.1.3** Asignación de recursos para SG-SST: Documento con asignación de recursos financieros, técnicos, humanos.
- **1.1.4** Afiliación al Sistema de Seguridad Social Integral: Soportes de afiliación a EPS, AFP y ARL de todos los trabajadores.
- **1.1.5** Identificación de trabajadores de alto riesgo: Trabajadores clase IV/V con cotización especial de pensiones.
- **1.1.6** Conformación COPASST / Vigía: Acta de conformación del COPASST (10+ trabajadores) o designación del Vigía SST (menos de 10).
- **1.1.7** Capacitación COPASST / Vigía: Soportes de capacitación de los miembros del COPASST o Vigía.
- **1.1.8** Conformación Comité de Convivencia Laboral: Acta con representantes del empleador y trabajadores.
- **1.2.1** Programa de capacitación anual: Programa anual documentado en el módulo de Capacitaciones.
- **1.2.2** Inducción y reinducción en SST: Registros de inducción y reinducción para todos los trabajadores.
- **1.2.3** Curso Virtual de 50 horas en SST: Certificado del responsable del SG-SST.

### Componente: Gestión Integral
- **2.1.1** Política de Seguridad y Salud en el Trabajo: Firmada, fechada, comunicada y accesible.
- **2.2.1** Objetivos de SST: Claros, medibles, cuantificables con metas definidas. Módulo de Objetivos SST.
- **2.3.1** Evaluación Inicial del SG-SST: La propia evaluación que se está realizando.
- **2.4.1** Plan Anual de Trabajo: Con objetivos, metas, responsables, recursos y cronograma. Módulo Plan de Trabajo Anual.
- **2.5.1** Archivo y retención documental: El sistema digital cumple esta función automáticamente.
- **2.6.1** Rendición de cuentas: Informe anual. El PDF del Ministerio incluye esta información.
- **2.7.1** Matriz legal: Actualizada y con seguimiento. Módulo Matriz Legal.
- **2.8.1** Mecanismos de comunicación: Módulo de Comunicación SST.
- **2.9.1** Adquisición de bienes y servicios: Procedimiento con especificaciones SST.
- **2.10.1** Evaluación de proveedores y contratistas: Criterios SST en selección.
- **2.11.1** Gestión del cambio: Evaluar impacto SST de cambios. Módulo Gestión del Cambio.

### Componente: Gestión de la Salud
- **3.1.1** Descripción sociodemográfica: Módulo de Trabajadores y Exámenes Médicos.
- **3.1.2** Actividades de medicina del trabajo: Capacitaciones y Exámenes Médicos.
- **3.1.3** Perfiles de cargos: Requisitos de aptitud física y mental.
- **3.1.4** Evaluaciones médicas ocupacionales: Ingreso, periódicas y egreso. Módulo Exámenes Médicos.
- **3.1.5** Custodia de Historias Clínicas: Confidencialidad.
- **3.1.6** Restricciones y recomendaciones médicas: Seguimiento en Exámenes Médicos.
- **3.1.7** Estilos de vida saludables: Prevención de tabaquismo, alcoholismo, farmacodependencia.
- **3.1.8** Servicios de higiene y agua potable.
- **3.1.9** Manejo de residuos.
- **3.2.1** Reporte de accidentes y enfermedad laboral: A ARL, EPS y Ministerio. Módulo de Accidentes.
- **3.2.2** Investigación de accidentes: Causas raíz y acciones correctivas. Accidentes > Investigación.
- **3.2.3** Registro y análisis estadístico: Generado automáticamente.
- **3.3.1** Frecuencia de accidentalidad: Calculado automáticamente en Indicadores.
- **3.3.2** Severidad de accidentalidad: Calculado automáticamente.
- **3.3.3** Mortalidad por accidentes: Calculado automáticamente.
- **3.3.4** Prevalencia de enfermedad laboral: Calculado automáticamente.
- **3.3.5** Incidencia de enfermedad laboral: Calculado automáticamente.
- **3.3.6** Ausentismo laboral: Calculado automáticamente.

### Componente: Peligros y Riesgos
- **4.1.1** Metodología IPERC: GTC 45. Módulo Matriz IPERC.
- **4.1.2** Identificación de peligros con participación de todos los niveles.
- **4.1.3** Sustancias carcinógenas o con toxicidad aguda: Peligro químico en Matriz IPERC.
- **4.1.4** Mediciones ambientales: Agentes químicos, físicos y biológicos.

### Componente: Control de Riesgos
- **4.2.1** Medidas de prevención y control: Jerarquía (eliminación, sustitución, ingeniería, administrativos, EPP).
- **4.2.2** Aplicación de medidas por trabajadores: Inspecciones y capacitaciones como evidencia.
- **4.2.3** Procedimientos e instructivos de SST.
- **4.2.4** Inspecciones a instalaciones y equipos: Módulo de Inspecciones.
- **4.2.5** Mantenimiento de instalaciones y equipos.
- **4.2.6** Entrega de EPP: Con capacitación en uso. Módulo Entrega de EPP.

### Componente: Gestión de Amenazas
- **5.1.1** Plan de emergencias: Módulo Plan de Emergencias.
- **5.1.2** Brigada de emergencias: Conformación, capacitación y dotación.
- **5.1.3** Simulacros de emergencias: Al menos una vez al año.

### Componente: Verificación
- **6.1.1** Indicadores de gestión del SG-SST: Estructura, proceso y resultado.
- **6.1.2** Auditoría anual: Módulo Auditorías Internas.
- **6.1.3** Revisión por la alta dirección: Módulo Revisión por la Dirección.
- **6.1.4** Auditoría con COPASST: Incluir al COPASST en auditorías.

### Componente: Mejoramiento
- **7.1.1** Acciones preventivas y correctivas: Módulo Plan de Mejoramiento.
- **7.1.2** Acciones de mejora por revisión de la Dirección: Vinculadas automáticamente.
- **7.1.3** Acciones de mejora por investigación de accidentes: Vinculadas a accidentes investigados.
- **7.1.4** Plan de mejoramiento: Documentado con acciones, responsables, fechas y seguimiento.

## CONSEJOS GENERALES DE USO DE LA PLATAFORMA
- **No aparece un módulo en el menú**: Puede ser restricción de su plan de suscripción o de su rol. Si es por plan, vaya a Configuración > Mi Suscripción para verificar. Si es por rol, consulte con el administrador de su empresa.
- **La empresa no ve el módulo PESV**: El módulo PESV se activa cuando la empresa registra al menos un vehículo. Vaya a Configuración > Datos de la Empresa y actualice el campo 'Número de Vehículos'.
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
   "Los accidentes se registran desde la Evaluación Inicial, buscando el estándar de Reporte e Investigación de Accidentes.

   Leer más...

   ### Pasos detallados:
   1. Abrir la Evaluación Inicial...
   2. ..."
3. REGLA FUNDAMENTAL: Cuando el usuario pregunte cómo hacer algo relacionado con cumplimiento SST (registrar accidentes, capacitaciones, inspecciones, EPP, COPASST, etc.), SIEMPRE indica que el punto de partida es la **Evaluación Inicial**. El flujo correcto es: abrir la Evaluación Inicial → buscar el estándar correspondiente → desde allí ir al módulo. NUNCA digas "Ir a Hacer → Accidentes" o "Ir a Hacer → Capacitaciones" directamente. Todo se gestiona DESDE la Evaluación Inicial.
4. Cuando cites normativa, menciona el artículo o resolución específica.
5. No inventes funcionalidades que no existen en el sistema. Solo menciona lo que está en la base de conocimiento.
6. Mantén un tono amigable y profesional.
7. Si no sabes algo específico, indica que el usuario puede crear un ticket de soporte desde el ícono de engranaje → Tickets de Soporte.
8. Si la pregunta no está relacionada con SST o la plataforma, redirige amablemente al tema.
9. Cuando menciones módulos que requieren suscripción, indícalo al usuario.
10. Adapta tu respuesta al rol del usuario: si es trabajador guíalo al Portal de Empleados, si es LSO al Portal del Licenciado, si es admin/responsable dale instrucciones completas.
11. IMPORTANTE: Solo indica al usuario cómo llegar a funciones que SU ROL puede ver. No lo envíes a módulos que no tiene acceso.
12. Recuerda: La Evaluación Inicial es el CENTRO del sistema. Todo fluye desde allí. El Plan Anual de Trabajo se genera desde la evaluación y organiza las actividades en cronograma mensual.
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
        max_tokens: 1000,
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
