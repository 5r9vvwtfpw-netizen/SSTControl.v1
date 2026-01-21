// ChatbotAsistente.tsx - Comprehensive Knowledge Base for SST Colombia Chatbot
// Complete coverage of all modules, step-by-step guides, troubleshooting, and best practices

// Imágenes del tutorial - placeholders (las imágenes originales fueron eliminadas)
const imgRegistro = "";
const imgCorreoVerificado = "";
const imgConfigurarEmpresa = "";
const imgPanelControl = "";
const imgMenuConfiguracion = "";
const imgMenuConfigEmpresas = "";
const imgGestionEmpresas = "";
const imgMenuPlanearContratos = "";
const imgMenuEvaluacionInicial = "";
const imgEvaluacionInicialVacia = "";
const imgNuevaEvaluacion = "";
const imgEvaluacionEstandares = "";
const imgAfiliacionesSSSS = "";
const imgNuevaAfiliacion = "";
const imgMensajesInternos = "";

export interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
  suggestions?: string[];
  images?: string[];
}

export interface KnowledgeItem {
  keywords: string[];
  question: string;
  answer: string;
  category: string;
  followUp?: string[];
  images?: string[];
}

export const knowledgeBase: KnowledgeItem[] = [
  // ============================================================================
  // SECCIÓN 0: TUTORIAL VISUAL PASO A PASO
  // ============================================================================
  {
    keywords: ["tutorial", "tutorial visual", "paso a paso", "guia visual", "como empezar", "aprender", "enseñar", "mostrar", "imagenes", "capturas"],
    question: "Tutorial visual: ¿Cómo usar SST Colombia paso a paso?",
    answer: "Te muestro el tutorial visual completo para usar SST Colombia:\n\n**PASO 1: REGISTRO**\nCompleta el formulario de registro con tu nombre, correo electrónico y usuario. Selecciona el plan que se ajuste al tamaño de tu empresa. Recibirás un correo de verificación.",
    category: "tutorial",
    followUp: ["¿Cómo verifico mi correo?", "¿Cómo configuro mi empresa?", "¿Qué es la Evaluación Inicial?"],
    images: [imgRegistro]
  },
  {
    keywords: ["verificar correo", "verificacion", "confirmar cuenta", "activar cuenta", "correo verificado"],
    question: "¿Cómo verifico mi correo?",
    answer: "**PASO 2: VERIFICACIÓN DE CORREO**\n\nDespués de registrarte, revisa tu bandeja de entrada (o carpetas de Spam/Promociones). Haz clic en el enlace de verificación.\n\nUna vez verificado, verás el mensaje de confirmación. Ahora puedes iniciar sesión con tu usuario y contraseña.",
    category: "tutorial",
    followUp: ["¿Cómo configuro mi empresa?", "¿Qué veo en el Panel de Control?"],
    images: [imgCorreoVerificado]
  },
  {
    keywords: ["configurar empresa", "crear empresa", "datos empresa", "nit", "razon social", "numero trabajadores"],
    question: "¿Cómo configuro mi empresa?",
    answer: "**PASO 3: CONFIGURAR TU EMPRESA**\n\nAl iniciar sesión por primera vez, debes configurar los datos de tu empresa:\n\n1. Nombre de la Empresa (razón social)\n2. NIT (Número de Identificación Tributaria)\n3. Número de Trabajadores - esto determina el tipo de empresa según la Resolución 0312/2019\n4. Dirección y datos de contacto\n5. Nivel de Riesgo según la clasificación de tu ARL\n\nEl sistema calculará automáticamente los estándares que debes cumplir según tu tamaño.",
    category: "tutorial",
    followUp: ["¿Qué veo en el Panel de Control?", "¿Qué es la Evaluación Inicial?"],
    images: [imgConfigurarEmpresa]
  },
  {
    keywords: ["panel control", "dashboard", "inicio", "pagina principal", "resumen"],
    question: "¿Qué veo en el Panel de Control?",
    answer: "**PASO 4: PANEL DE CONTROL**\n\nEl Panel de Control es tu página de inicio. Aquí ves un resumen de:\n\n1. Accidentes del Mes\n2. Capacitaciones realizadas\n3. Inspecciones programadas\n4. Porcentaje de Cumplimiento del SG-SST\n\nTambién verás alertas importantes como próximas capacitaciones y accidentes recientes. Si aún no has configurado tu empresa, verás un aviso para hacerlo.",
    category: "tutorial",
    followUp: ["¿Cómo navego en los menús?", "¿Dónde encuentro las Empresas?"],
    images: [imgPanelControl]
  },
  {
    keywords: ["menu configuracion", "configuracion", "opciones", "administracion", "ajustes"],
    question: "¿Cómo navego en los menús?",
    answer: "**PASO 5: MENÚ CONFIGURACIÓN**\n\nEl menú Configuración contiene:\n\n**Panel de Control:**\n- Inicio (dashboard principal)\n- Empresas (gestión de empresas)\n- Usuarios (administrar usuarios)\n- Portal de Empleados\n\n**Administración:**\n- Mi Cuenta\n- Tickets de Soporte\n- Accesos de Soporte\n\n**Comunicación Interna:**\n- Mensajes Internos entre usuarios\n\nHaz clic en cualquier opción para acceder a ese módulo.",
    category: "tutorial",
    followUp: ["¿Dónde encuentro las Empresas?", "¿Dónde están los trabajadores?"],
    images: [imgMenuConfiguracion, imgMenuConfigEmpresas]
  },
  {
    keywords: ["gestion empresas", "lista empresas", "ver empresas", "administrar empresas"],
    question: "¿Dónde encuentro las Empresas?",
    answer: "**PASO 6: GESTIÓN DE EMPRESAS**\n\nEn Configuración → Empresas verás la lista de empresas registradas con:\n\n- Nombre de la empresa\n- NIT\n- Número de Trabajadores\n- Nivel de Riesgo (I a V)\n- Cantidad de Estándares a cumplir\n\nEl sistema clasifica automáticamente tu empresa y determina cuántos estándares de la Resolución 0312/2019 debes cumplir.",
    category: "tutorial",
    followUp: ["¿Dónde están los trabajadores?", "¿Qué es la Evaluación Inicial?"],
    images: [imgGestionEmpresas]
  },
  {
    keywords: ["menu planear", "trabajadores menu", "contratos", "donde trabajadores", "planear"],
    question: "¿Dónde están los trabajadores?",
    answer: "**PASO 7: MENÚ PLANEAR - CONTRATOS**\n\nEn el menú PLANEAR encontrarás la sección de Contratos con:\n\n- **Trabajadores**: Registro de todo el personal\n- **Perfiles de Cargo**: Definición de cargos y responsabilidades\n- **Contratos Laborales**: Gestión de contratos\n- **Afiliaciones SSSS**: Seguridad social (EPS, ARL, AFP, CCF)\n- **Trabajadores Alto Riesgo**: Personal con exposición especial\n\nTambién verás la sección de **Gestión Integral** donde está la Evaluación Inicial.",
    category: "tutorial",
    followUp: ["¿Qué es la Evaluación Inicial?", "¿Cómo registro afiliaciones?"],
    images: [imgMenuPlanearContratos, imgMenuEvaluacionInicial]
  },
  {
    keywords: ["evaluacion inicial", "diagnostico", "estandares minimos", "0312", "empezar sst", "comenzar sst", "primer paso sst"],
    question: "¿Qué es la Evaluación Inicial?",
    answer: "**PASO 8: EVALUACIÓN INICIAL - EL CORAZÓN DEL SG-SST**\n\n¡IMPORTANTE! El Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST) comienza con la Evaluación Inicial. Este es el punto de partida obligatorio según la Resolución 0312/2019.\n\nLa Evaluación Inicial te permite:\n\n1. Medir el cumplimiento actual de cada estándar\n2. Identificar qué te falta para cumplir la normativa\n3. Generar un Plan de Mejora con acciones correctivas\n4. Obtener un porcentaje de cumplimiento oficial\n\nCada estándar que evalúes te da puntos hacia el 100% de cumplimiento.",
    category: "tutorial",
    followUp: ["¿Cómo creo una Evaluación Inicial?", "¿Cómo evalúo cada estándar?"],
    images: [imgEvaluacionInicialVacia]
  },
  {
    keywords: ["crear evaluacion", "nueva evaluacion", "iniciar evaluacion", "formulario evaluacion"],
    question: "¿Cómo creo una Evaluación Inicial?",
    answer: "**PASO 9: CREAR NUEVA EVALUACIÓN**\n\nPara crear tu primera Evaluación Inicial:\n\n1. Haz clic en **Nueva Evaluación**\n2. Selecciona el **Año** y **Mes**\n3. El sistema muestra automáticamente tu empresa y tipo (según trabajadores y riesgo)\n4. Ingresa el **Responsable de la Evaluación** y su cargo\n5. Opcionalmente, selecciona quién Elabora, Autoriza y Aprueba\n6. Haz clic en **Crear Evaluación**\n\nEl sistema determinará automáticamente los estándares que debes cumplir según el tamaño y riesgo de tu empresa.",
    category: "tutorial",
    followUp: ["¿Cómo evalúo cada estándar?", "¿Qué son los 7 componentes?"],
    images: [imgNuevaEvaluacion]
  },
  {
    keywords: ["evaluar estandar", "cumplir estandar", "puntos", "calificar", "componentes", "recursos"],
    question: "¿Cómo evalúo cada estándar?",
    answer: "**PASO 10: EVALUAR CADA ESTÁNDAR**\n\nLa evaluación está organizada en 7 componentes principales:\n\n1. **Recursos** (10%) - Responsable SST, afiliaciones, COPASST\n2. **Gestión Integral** (15%) - Política, objetivos, evaluación inicial\n3. **Gestión de la Salud** (20%) - Exámenes médicos, vigilancia epidemiológica\n4. **Gestión de Peligros** (30%) - IPERC, controles, EPP\n5. **Gestión de Amenazas** (10%) - Plan de emergencias, brigadas\n6. **Verificación** (5%) - Auditorías, revisión por dirección\n7. **Mejoramiento** (10%) - Acciones correctivas, mejora continua\n\nCada estándar tiene un puntaje. Marca si cumples o no cumples, y el sistema calcula tu porcentaje total. Usa el **Plan de Mejora** para las acciones correctivas.",
    category: "tutorial",
    followUp: ["¿Cómo registro afiliaciones?", "¿Cómo uso Mensajes Internos?"],
    images: [imgEvaluacionEstandares]
  },
  {
    keywords: ["afiliaciones", "seguridad social", "eps", "arl", "afp", "ccf", "ssss"],
    question: "¿Cómo registro afiliaciones?",
    answer: "**PASO 11: AFILIACIONES SSSS**\n\nEl módulo de Afiliaciones SSSS te permite gestionar la seguridad social de tus trabajadores:\n\n1. Ve a Planear → Afiliaciones SSSS\n2. Puedes **Configurar Empresa** para definir la ARL y CCF por defecto\n3. Usa **Afiliación Masiva** para afiliar varios trabajadores a la vez\n4. O haz clic en **Nueva Afiliación** para registrar individualmente\n\nSelecciona el trabajador y sus entidades: EPS (salud), ARL (riesgos), AFP (pensión) y CCF (caja de compensación).",
    category: "tutorial",
    followUp: ["¿Cómo uso la afiliación masiva?", "¿Cómo uso Mensajes Internos?"],
    images: [imgAfiliacionesSSSS, imgNuevaAfiliacion]
  },
  {
    keywords: ["mensajes internos", "comunicacion", "tickets", "soporte", "notificaciones"],
    question: "¿Cómo uso Mensajes Internos?",
    answer: "**PASO 12: MENSAJES INTERNOS**\n\nEl sistema de Mensajes Internos permite la comunicación entre usuarios del sistema:\n\n- **Bandeja**: Mensajes recibidos\n- **Enviados**: Mensajes que has enviado\n- **Archivo**: Mensajes archivados\n\nTambién recibirás notificaciones automáticas cuando se resuelvan tus tickets de soporte. Puedes reabrir un ticket si necesitas más ayuda.\n\nUsa el botón **Nuevo Mensaje** para enviar comunicaciones a otros usuarios de tu empresa.",
    category: "tutorial",
    followUp: ["Tutorial visual: ¿Cómo usar SST Colombia paso a paso?", "¿Cómo empiezo a usar el sistema?"],
    images: [imgMensajesInternos]
  },

  // ============================================================================
  // SECCIÓN 1: INICIO Y PRIMEROS PASOS
  // ============================================================================
  {
    keywords: ["empezar", "comenzar", "inicio", "primeros pasos", "nuevo", "como uso", "usar sistema", "tutorial", "guia", "primera vez", "que hago", "donde empiezo"],
    question: "¿Cómo empiezo a usar el sistema?",
    answer: "**Ruta de Implementación Inteligente**\n\n**Paso 1: Administración Global**\nVe a **Administración Global → Empresas** y configura tu empresa con el logo corporativo, firma del gerente y datos de contacto.\n\n**Paso 2: Personal (PLANEAR)**\nDiríjase al menú **PLANEAR → Personal** y define:\n- Perfiles de Cargo\n- Trabajadores\n- Afiliaciones SSSS\n\n**Paso 3: Gestión Integral (PLANEAR)**\nEjecuta la **Evaluación Inicial** para dar inicio oficial a la gestión del SG-SST. Ve a **PLANEAR → Gestión Integral → Evaluación Inicial**.\n\nEl sistema ya conoce tus obligaciones según el tamaño de empresa y nivel de riesgo definidos desde la suscripción. Solo debes seguir los estándares que te corresponden.",
    category: "inicio",
    followUp: ["¿Cómo registro trabajadores?", "¿Qué es la Resolución 0312?", "¿Cómo funciona la clasificación de empresas?"]
  },
  {
    keywords: ["navegacion", "menu", "donde encuentro", "ubicar", "buscar modulo", "phva"],
    question: "¿Cómo navego en el sistema?",
    answer: "El sistema está organizado según el ciclo PHVA.\n\nEn la sección PLANEAR (color Azul) encontrarás: Política SST, IPERC, Matriz Legal, Plan de Trabajo Anual, Objetivos, Perfiles de Cargo y Responsables.\n\nEn la sección HACER (color Verde) encontrarás: Capacitaciones, Inspecciones, Accidentes, Exámenes Médicos, EPP, Emergencias y COPASST.\n\nEn la sección VERIFICAR (color Naranja) encontrarás: Auditorías Internas, Revisión por Dirección y Evaluaciones SST.\n\nEn la sección ACTUAR (color Morado) encontrarás: Acciones Correctivas, Mejora Continua y Gestión de Cambios.\n\nTe recomendamos usar la barra de búsqueda para encontrar cualquier módulo rápidamente.",
    category: "inicio",
    followUp: ["¿Qué es el ciclo PHVA?", "¿Dónde veo el dashboard?", "¿Cómo accedo a reportes?"]
  },
  {
    keywords: ["dashboard", "tablero", "resumen", "indicadores", "metricas", "estadisticas"],
    question: "¿Cómo uso el Dashboard?",
    answer: "El sistema tiene 4 dashboards especializados.\n\nEl Dashboard Principal te muestra una vista general de todos los indicadores, el estado de cumplimiento por estándar, y las alertas y vencimientos próximos.\n\nEl Dashboard HACER te muestra las capacitaciones completadas versus las programadas, las inspecciones realizadas y los accidentes reportados.\n\nEl Dashboard VERIFICAR te muestra los resultados de auditorías, los indicadores de gestión como IF, IS e ILI, y el cumplimiento de objetivos.\n\nEl Dashboard ACTUAR te muestra las acciones correctivas y preventivas, el estado de mejora continua y las tendencias de mejora.\n\nTodos los dashboards se actualizan en tiempo real con tus datos.",
    category: "inicio",
    followUp: ["¿Qué indicadores son obligatorios?", "¿Cómo exporto reportes?", "¿Cómo interpreto las gráficas?"]
  },

  // ============================================================================
  // SECCIÓN 2: GESTIÓN DE TRABAJADORES
  // ============================================================================
  {
    keywords: ["trabajador", "empleado", "registrar trabajador", "agregar trabajador", "personal", "nomina", "colaborador", "crear trabajador"],
    question: "¿Cómo registro trabajadores?",
    answer: "Para registrar trabajadores sigue estos pasos:\n\n1. Ve al módulo Trabajadores en el menú lateral.\n2. Haz clic en Nuevo Trabajador.\n3. Completa los campos obligatorios: documento de identidad (CC, CE, etc.), nombre completo, cargo y área, fecha de ingreso, y correo electrónico para el portal.\n4. Los campos opcionales incluyen EPS, AFP, ARL y tipo de contrato.\n5. Guarda el registro.\n\nTambién puedes importar trabajadores masivamente desde Excel usando el botón Importar. La plantilla incluye todos los campos necesarios.",
    category: "trabajadores",
    followUp: ["¿Cómo importo trabajadores desde Excel?", "¿Cómo asigno exámenes médicos?", "¿Cómo creo acceso al portal?"]
  },
  {
    keywords: ["importar", "excel", "masivo", "carga masiva", "plantilla", "csv"],
    question: "¿Cómo importo trabajadores desde Excel?",
    answer: "Para importar trabajadores masivamente sigue estos pasos:\n\n1. Ve a Trabajadores y haz clic en el botón Importar.\n2. Descarga la plantilla Excel haciendo clic en Descargar plantilla.\n3. Llena la plantilla con los datos de tus trabajadores. Las columnas obligatorias son: documento, nombre, cargo, área y fecha_ingreso. Las columnas opcionales son: email, telefono, eps, afp y arl.\n4. Guarda el archivo y súbelo al sistema.\n5. Revisa la vista previa y confirma la importación.\n\nEl sistema valida duplicados por número de documento. Si un trabajador ya existe, actualizará sus datos automáticamente.",
    category: "trabajadores",
    followUp: ["¿Qué formato debe tener el Excel?", "¿Cómo actualizo datos masivamente?", "¿Cómo elimino trabajadores?"]
  },
  {
    keywords: ["portal empleado", "acceso trabajador", "credenciales", "crear acceso", "usuario trabajador"],
    question: "¿Cómo creo acceso al portal para un trabajador?",
    answer: "Para crear acceso al Portal de Empleados sigue estos pasos:\n\n1. Ve a Trabajadores y selecciona el trabajador.\n2. En la tarjeta del trabajador, haz clic en Crear Acceso Portal.\n3. El trabajador debe tener un correo electrónico registrado.\n4. El sistema genera automáticamente un usuario basado en el documento y una contraseña temporal segura de 16 caracteres.\n5. Las credenciales se envían al correo del trabajador.\n\nDesde el portal, el trabajador puede ver sus datos personales, consultar capacitaciones asignadas, descargar certificados, reportar incidentes y ver el historial de EPP.",
    category: "trabajadores",
    followUp: ["¿Qué puede ver el trabajador en su portal?", "¿Cómo recupero credenciales?", "¿Cómo desactivo un acceso?"]
  },
  {
    keywords: ["perfil cargo", "descriptor", "funciones", "requisitos cargo", "profesiograma"],
    question: "¿Cómo creo perfiles de cargo?",
    answer: "Los perfiles de cargo definen requisitos y responsabilidades SST. Para crearlos sigue estos pasos:\n\n1. Ve a Perfiles de Cargo en la sección PLANEAR.\n2. Haz clic en Nuevo Perfil.\n3. Completa la información: nombre del cargo, área o departamento, nivel de riesgo (I a V), funciones principales, requisitos de formación, EPP requeridos y exámenes médicos necesarios.\n4. Asocia trabajadores al perfil.\n\nLos beneficios de crear perfiles incluyen: definir EPP obligatorios por cargo, establecer exámenes ocupacionales requeridos, identificar riesgos específicos y facilitar la inducción de nuevos trabajadores.",
    category: "trabajadores",
    followUp: ["¿Cómo asocio EPP a un cargo?", "¿Cómo defino exámenes por cargo?", "¿Cómo imprimo el perfil?"]
  },
  {
    keywords: ["contrato", "tipo contrato", "afiliacion", "seguridad social", "eps", "afp", "arl"],
    question: "¿Cómo gestiono contratos y afiliaciones?",
    answer: "El módulo de Contratos te permite gestionar toda la información laboral.\n\nPara registrar contratos puedes incluir: tipo de contrato (Indefinido, Fijo, Obra/Labor o Prestación de servicios), fechas de inicio y fin, y salario y jornada.\n\nPara las afiliaciones a Seguridad Social puedes registrar: EPS (salud), AFP (pensión), ARL (riesgos laborales) y Caja de Compensación.\n\nEl sistema te alerta sobre contratos próximos a vencer, afiliaciones sin registrar y cambios de ARL requeridos.\n\nRecuerda que mantener las afiliaciones actualizadas es obligatorio según el Decreto 1072.",
    category: "trabajadores",
    followUp: ["¿Cómo registro una novedad de contrato?", "¿Cómo exporto afiliaciones?", "¿Qué pasa con trabajadores temporales?"]
  },
  {
    keywords: ["alto riesgo", "riesgo especial", "actividad peligrosa", "trabajador expuesto"],
    question: "¿Cómo identifico trabajadores de alto riesgo?",
    answer: "El módulo Trabajadores de Alto Riesgo identifica personal expuesto a actividades peligrosas.\n\nSegún el Decreto 2090/2003, las actividades de alto riesgo incluyen: trabajo en alturas (1.5 metros o más), espacios confinados, trabajo en caliente, riesgo eléctrico, sustancias químicas peligrosas, radiaciones ionizantes y temperaturas extremas.\n\nEl sistema te permite:\n\n1. Marcar trabajadores por tipo de exposición.\n2. Programar exámenes médicos especializados.\n3. Verificar certificaciones vigentes.\n4. Generar alertas de vencimiento.\n5. Documentar capacitaciones específicas.\n\nRecuerda que estos trabajadores requieren vigilancia epidemiológica especial.",
    category: "trabajadores",
    followUp: ["¿Qué exámenes requieren?", "¿Cómo documento certificaciones?", "¿Qué capacitaciones son obligatorias?"]
  },

  // ============================================================================
  // SECCIÓN 3: CAPACITACIONES
  // ============================================================================
  {
    keywords: ["capacitacion", "entrenamiento", "formacion", "curso", "taller", "charla", "crear capacitacion"],
    question: "¿Cómo gestiono las capacitaciones?",
    answer: "El módulo de Capacitaciones te permite gestionar toda la formación de tu empresa.\n\nPara programar capacitaciones incluye: título y descripción, instructor (interno o externo), fecha, hora y duración, ubicación (presencial o virtual), y trabajadores convocados.\n\nPara registrar asistencia: genera la lista de asistentes, registra firma digital o manual, y aplica evaluación si corresponde.\n\nPara generar evidencias puedes crear: acta de capacitación, listas de asistencia, certificados individuales y registro fotográfico.\n\nLos estados de las capacitaciones son: Programada, En curso y Completada.",
    category: "capacitaciones",
    followUp: ["¿Cuáles son las capacitaciones obligatorias?", "¿Cómo genero certificados?", "¿Cómo uso plantillas predefinidas?"]
  },
  {
    keywords: ["capacitacion obligatoria", "capacitaciones requeridas", "formacion obligatoria", "ley capacitacion"],
    question: "¿Cuáles son las capacitaciones obligatorias?",
    answer: "Según la Resolución 0312/2019 y el Decreto 1072, las capacitaciones obligatorias para todos los trabajadores son: inducción en SST al momento del ingreso, reinducción anual, política SST y reglamento, y funciones del COPASST o Vigía.\n\nSegún el cargo o riesgo, las capacitaciones obligatorias incluyen: trabajo en alturas según Resolución 4272/2021, riesgo eléctrico según RETIE, manejo de sustancias químicas, primeros auxilios para la brigada, uso de extintores para la brigada, y evacuación para la brigada.\n\nLa frecuencia recomendada es: inducción al ingreso, reinducción anual, trabajo en alturas cada 2 años, y capacitaciones específicas por cargo según el riesgo.\n\nEl sistema tiene plantillas predefinidas para todas estas capacitaciones.",
    category: "capacitaciones",
    followUp: ["¿Cómo uso las plantillas predefinidas?", "¿Dónde certifico trabajo en alturas?", "¿Cómo documento inducción?"]
  },
  {
    keywords: ["certificado", "generar certificado", "diploma", "constancia capacitacion"],
    question: "¿Cómo genero certificados de capacitación?",
    answer: "Para generar certificados sigue estos pasos:\n\n1. Ve a la capacitación completada.\n2. Verifica que la asistencia esté registrada.\n3. Haz clic en Generar Certificados.\n4. Selecciona trabajadores (todos o específicos).\n5. El sistema genera PDFs individuales con: nombre del trabajador, documento de identidad, título de la capacitación, fecha y duración, instructor, y número único de certificado.\n\nLas opciones disponibles son: descargar todos en ZIP, enviar por correo electrónico, o guardar en expediente digital.\n\nLos certificados incluyen código QR para verificación.",
    category: "capacitaciones",
    followUp: ["¿Cómo verifico un certificado?", "¿Puedo personalizar el formato?", "¿Cómo envío certificados por correo?"]
  },
  {
    keywords: ["induccion", "reinduccion", "ingreso", "bienvenida", "nuevo trabajador"],
    question: "¿Cómo registro la inducción de nuevos trabajadores?",
    answer: "La inducción es obligatoria según la Resolución 0312. Para registrarla usa el módulo Registros de Inducción siguiendo estos pasos:\n\n1. Selecciona el trabajador (los nuevos aparecen destacados).\n2. Completa los temas de inducción: generalidades de la empresa, política SST, reglamento de higiene y seguridad, identificación de peligros del cargo, procedimientos de emergencia, uso de EPP, y reporte de accidentes e incidentes.\n3. Registra fecha y responsable.\n4. Obtén la firma del trabajador (digital o escaneada).\n5. Genera el acta de inducción.\n\nLa reinducción debe hacerse anualmente o cuando haya cambio de cargo, cambio de proceso, o reintegro por incapacidad mayor a 30 días.",
    category: "capacitaciones",
    followUp: ["¿Qué diferencia hay entre inducción y reinducción?", "¿Cómo documento la reinducción?", "¿Qué pasa si no hago inducción?"]
  },
  {
    keywords: ["programa capacitacion", "plan capacitacion", "cronograma", "anual"],
    question: "¿Cómo creo el Programa de Capacitación Anual?",
    answer: "El Programa de Capacitación Anual es obligatorio. Para crearlo sigue estos pasos:\n\n1. Ve a Programa Capacitación Anual en la sección PLANEAR.\n2. Crea nuevo programa para el año.\n3. Define: objetivo general del programa, público objetivo por capacitación, cronograma mensual, recursos requeridos, e indicadores de cumplimiento.\n4. Agrega capacitaciones al programa: selecciona de plantillas o crea nuevas, asigna mes de ejecución, y define instructor y recursos.\n5. El sistema genera: cronograma visual tipo Gantt, indicador de avance mensual, y alertas de capacitaciones próximas.\n\nLa meta es cumplir mínimo el 80% del programa anual.",
    category: "capacitaciones",
    followUp: ["¿Cómo mido el cumplimiento?", "¿Cómo ajusto el programa?", "¿Qué incluyo en el programa?"]
  },
  {
    keywords: ["50 horas", "curso virtual", "curso sst", "certificacion sst", "responsable sst"],
    question: "¿Qué es el Curso de 50 Horas SST?",
    answer: "El Curso Virtual de 50 Horas es obligatorio según la Resolución 4927/2016 para: responsables del SG-SST en empresas, profesionales que diseñan o administran el sistema, y miembros del COPASST (opcional pero recomendado).\n\nLas características del curso son: modalidad virtual, duración de 50 horas, actualización cada 3 años con 20 horas adicionales, y certificado expedido por entidad autorizada.\n\nEn el sistema puedes:\n\n1. Registrar quién tiene el curso vigente.\n2. Cargar certificados.\n3. Programar alertas de vencimiento.\n4. Verificar cumplimiento del estándar 1.1.3.\n\nLos proveedores autorizados son el SENA, las ARL y universidades autorizadas.",
    category: "capacitaciones",
    followUp: ["¿Dónde tomo el curso?", "¿Cada cuánto debo actualizarme?", "¿Cómo registro el certificado?"]
  },

  // ============================================================================
  // SECCIÓN 4: ACCIDENTES E INCIDENTES
  // ============================================================================
  {
    keywords: ["accidente", "incidente", "at", "reporte accidente", "lesion", "siniestro", "furat"],
    question: "¿Cómo reporto un accidente de trabajo?",
    answer: "Para reportar un accidente de trabajo sigue estos pasos:\n\n1. Ve al módulo Accidentes e Incidentes.\n2. Haz clic en Reportar Nuevo.\n3. Selecciona el tipo: Accidente de trabajo (AT), Incidente (casi accidente), o Enfermedad laboral.\n4. Completa el formulario con: trabajador afectado, fecha, hora y lugar exacto, descripción detallada del evento, tipo de lesión y parte del cuerpo, testigos, y acciones inmediatas tomadas.\n5. El sistema genera el FURAT automáticamente.\n\nEs muy importante reportar a la ARL dentro de 48 horas para accidentes o inmediatamente para casos mortales.",
    category: "accidentes",
    followUp: ["¿Qué es el FURAT?", "¿Cómo investigo un accidente?", "¿Cuál es el plazo para reportar?"]
  },
  {
    keywords: ["furat", "formato unico", "reporte arl", "formulario accidente"],
    question: "¿Qué es el FURAT y cómo lo genero?",
    answer: "El FURAT (Formato Único de Reporte de Accidente de Trabajo) es el formulario oficial exigido por el Decreto 1072 para reportar accidentes de trabajo a la ARL.\n\nEl sistema lo genera automáticamente con: datos del empleador, información del trabajador accidentado, descripción del accidente, tipo de lesión, agente causante, mecanismo del accidente, y días de incapacidad si aplica.\n\nPara generarlo sigue estos pasos:\n\n1. Completa el reporte del accidente.\n2. Haz clic en Generar FURAT.\n3. Descarga el PDF.\n4. Envía a la ARL por su portal o correo.\n\nLos plazos son: 48 horas para accidentes e inmediato para casos mortales.",
    category: "accidentes",
    followUp: ["¿Cómo envío el FURAT a la ARL?", "¿Qué pasa si no reporto a tiempo?", "¿Cómo corrijo un FURAT?"]
  },
  {
    keywords: ["investigar accidente", "investigacion", "causa raiz", "metodologia", "analisis accidente"],
    question: "¿Cómo investigo un accidente de trabajo?",
    answer: "La investigación es obligatoria según la Resolución 1401/2007 y debe completarse en un plazo máximo de 15 días hábiles después del accidente.\n\nLa metodología en el sistema incluye:\n\n1. Recolección de información: declaraciones de testigos, fotografías del lugar, y documentos relacionados.\n\n2. Análisis de causas usando el método de árbol: causas inmediatas (actos y condiciones inseguras), causas básicas (factores personales y del trabajo), y falta de control del sistema.\n\n3. Plan de acción: acciones correctivas, responsables, fechas de implementación, y seguimiento.\n\n4. Documentación: informe de investigación, lecciones aprendidas, y divulgación a trabajadores.\n\nEl sistema genera el informe completo en PDF.",
    category: "accidentes",
    followUp: ["¿Qué metodología uso para investigar?", "¿Quién debe participar en la investigación?", "¿Cómo documento las lecciones aprendidas?"]
  },
  {
    keywords: ["incidente", "casi accidente", "near miss", "reportar incidente", "condicion insegura"],
    question: "¿Cuál es la diferencia entre accidente e incidente?",
    answer: "Según el Decreto 1072/2015, un accidente de trabajo es un suceso repentino que produce lesión, perturbación o muerte, ocurre por causa o con ocasión del trabajo, requiere atención médica, y se reporta a la ARL mediante el FURAT.\n\nUn incidente es un suceso que pudo causar daño pero no lo causó. También se llama casi accidente o near miss, no requiere reporte a la ARL, pero es fundamental para la prevención.\n\nAlgunos ejemplos de incidentes son: un resbalón sin caída, un objeto que cae cerca de alguien, una falla de equipo sin consecuencias, o una exposición breve a una sustancia sin síntomas.\n\nReportar incidentes ayuda a prevenir accidentes futuros. El sistema permite clasificar y analizar tendencias.",
    category: "accidentes",
    followUp: ["¿Cómo analizo tendencias de incidentes?", "¿Por qué es importante reportar incidentes?", "¿Cómo genero estadísticas?"]
  },
  {
    keywords: ["indicador accidentalidad", "tasa accidente", "indice frecuencia", "severidad", "ili"],
    question: "¿Cómo calculo los indicadores de accidentalidad?",
    answer: "El sistema calcula automáticamente los indicadores obligatorios.\n\nEl Índice de Frecuencia (IF) se calcula como: número de accidentes con incapacidad multiplicado por 240,000 y dividido entre las Horas Hombre Trabajadas (HHT). Mide el número de accidentes por cada millón de horas trabajadas.\n\nEl Índice de Severidad (IS) se calcula como: número de días perdidos multiplicado por 240,000 y dividido entre HHT. Mide los días perdidos por cada millón de horas trabajadas.\n\nEl Índice de Lesiones Incapacitantes (ILI) se calcula como: IF multiplicado por IS y dividido entre 1,000. Mide la severidad combinada de la accidentalidad.\n\nLa Tasa de Accidentalidad se calcula como: número de accidentes dividido entre número de trabajadores, multiplicado por 100.\n\nPuedes ver estos indicadores en Dashboard bajo Indicadores, o en Informes bajo Estadísticas de accidentalidad.",
    category: "accidentes",
    followUp: ["¿Cómo interpreto estos indicadores?", "¿Cuál es un valor aceptable?", "¿Cómo exporto las estadísticas?"]
  },

  // ============================================================================
  // SECCIÓN 5: INSPECCIONES
  // ============================================================================
  {
    keywords: ["inspeccion", "inspecciones", "revisar", "verificar", "lista chequeo", "recorrido seguridad"],
    question: "¿Cómo realizo inspecciones de seguridad?",
    answer: "Las inspecciones verifican condiciones de seguridad. Para realizarlas sigue estos pasos:\n\n1. Ve al módulo Inspecciones.\n2. Selecciona Nueva Inspección.\n3. Elige el tipo: Locativas (instalaciones), Equipos de emergencia, EPP, Orden y aseo, Eléctricas, o Máquinas y equipos.\n4. Completa la lista de verificación.\n5. Registra hallazgos con fotos.\n6. Asigna acciones correctivas.\n7. Genera el informe.\n\nEl sistema incluye: plantillas predefinidas por tipo, carga de fotografías, generación automática de acciones, seguimiento de hallazgos, e indicador de cumplimiento.",
    category: "inspecciones",
    followUp: ["¿Con qué frecuencia debo inspeccionar?", "¿Cómo uso las plantillas?", "¿Cómo hago seguimiento a hallazgos?"]
  },
  {
    keywords: ["frecuencia inspeccion", "cada cuanto", "periodicidad", "cronograma inspeccion"],
    question: "¿Con qué frecuencia debo hacer inspecciones?",
    answer: "Las frecuencias recomendadas según el tipo de inspección son las siguientes:\n\nDiarias: pre-operacionales de vehículos y equipos, y orden y aseo general.\n\nSemanales: EPP (uso y estado) y áreas críticas de producción.\n\nMensuales: locativas generales, equipos de emergencia (extintores y camillas), y señalización.\n\nTrimestrales: eléctricas, almacenamiento de sustancias, y maquinaria y equipos.\n\nSemestrales: auditoría de orden y aseo (5S) y revisión integral de instalaciones.\n\nAnuales: inspección estructural y sistemas contra incendio (profesional).\n\nEl sistema permite programar inspecciones recurrentes, enviar recordatorios automáticos y alertar sobre inspecciones vencidas.",
    category: "inspecciones",
    followUp: ["¿Cómo programo inspecciones automáticas?", "¿Quién debe hacer las inspecciones?", "¿Cómo documento los hallazgos?"]
  },
  {
    keywords: ["hallazgo", "no conformidad", "observacion", "accion correctiva inspeccion"],
    question: "¿Cómo gestiono los hallazgos de inspección?",
    answer: "Los hallazgos se clasifican de la siguiente manera: Crítico significa riesgo inminente que requiere acción inmediata, Mayor significa riesgo significativo con acción en 7 días, Menor significa riesgo bajo con acción en 30 días, y Observación significa oportunidad de mejora.\n\nEl flujo de gestión incluye estos pasos:\n\n1. Identificar el hallazgo durante la inspección.\n2. Documentar con descripción y foto.\n3. Asignar responsable y fecha límite.\n4. Ejecutar e implementar la corrección.\n5. Verificar y confirmar cierre efectivo.\n6. Cerrar y documentar evidencia de cierre.\n\nEl sistema permite seguimiento en tiempo real, alertas de vencimiento, escalamiento automático, e indicador de cierre de hallazgos.",
    category: "inspecciones",
    followUp: ["¿Cómo cierro un hallazgo?", "¿Cómo escalo hallazgos críticos?", "¿Cómo genero reportes de hallazgos?"]
  },

  // ============================================================================
  // SECCIÓN 6: IPERC - IDENTIFICACIÓN DE PELIGROS Y EVALUACIÓN DE RIESGOS
  // ============================================================================
  {
    keywords: ["iperc", "peligro", "riesgo", "matriz", "gtc 45", "identificacion peligros", "valoracion", "control"],
    question: "¿Cómo uso el módulo IPERC?",
    answer: "El módulo IPERC implementa la metodología GTC-45. Los pasos para crear la matriz son:\n\n1. Identificar Procesos y Áreas: define las zonas de trabajo y lista actividades rutinarias y no rutinarias.\n\n2. Identificar Peligros: usa el catálogo GTC-45 que tiene 7 categorías, o usa el Asistente Inteligente para obtener sugerencias.\n\n3. Evaluar Riesgos: determina el Nivel de Deficiencia (ND), el Nivel de Exposición (NE), el Nivel de Probabilidad (NP que es ND por NE), el Nivel de Consecuencia (NC), y el Nivel de Riesgo (NR que es NP por NC).\n\n4. Establecer Controles: considera eliminación, sustitución, controles de ingeniería, controles administrativos, y EPP.\n\n5. Documentar y dar seguimiento a todos los riesgos identificados.",
    category: "iperc",
    followUp: ["¿Cómo uso el Asistente Inteligente?", "¿Cómo interpreto el nivel de riesgo?", "¿Cada cuánto actualizo la matriz?"]
  },
  {
    keywords: ["gtc 45", "guia tecnica", "metodologia", "clasificacion peligros"],
    question: "¿Qué es la GTC-45 y cómo la aplico?",
    answer: "La GTC-45 es la Guía Técnica Colombiana para IPERC.\n\nLa clasificación de peligros incluye 7 categorías:\n\n1. Biológico: virus, bacterias, hongos y parásitos.\n2. Físico: ruido, iluminación, vibración y temperaturas.\n3. Químico: gases, vapores, líquidos y sólidos.\n4. Psicosocial: estrés, carga mental y acoso.\n5. Biomecánicos: posturas y movimientos repetitivos.\n6. Condiciones de seguridad: mecánico, eléctrico y locativo.\n7. Fenómenos naturales: sismos, inundaciones y tormentas.\n\nLa valoración del riesgo se interpreta así: Nivel I es no aceptable y requiere intervención urgente, Nivel II es no aceptable y requiere corregir y adoptar controles, Nivel III es aceptable y se debe mejorar si es posible, Nivel IV es aceptable y se deben mantener las medidas.\n\nEl sistema automatiza los cálculos y sugiere controles.",
    category: "iperc",
    followUp: ["¿Cómo identifico peligros por área?", "¿Qué hago con riesgos nivel I?", "¿Cómo priorizo intervenciones?"]
  },
  {
    keywords: ["asistente iperc", "sugerir peligro", "autofill", "ia iperc", "inteligente"],
    question: "¿Cómo uso el Asistente Inteligente de IPERC?",
    answer: "El Asistente Inteligente acelera la identificación de peligros. Funciona de la siguiente manera:\n\n1. Selecciona el área o proceso a evaluar.\n2. Haz clic en Sugerir Peligros.\n3. El asistente analiza: tipo de actividad, sector económico de tu empresa, y peligros típicos registrados.\n4. Muestra lista de peligros sugeridos.\n5. Selecciona los aplicables.\n6. El sistema auto-completa: descripción del peligro, efectos posibles, controles típicos, y valoración inicial.\n\nLos beneficios son: reduce el tiempo de elaboración en un 70%, evita omitir peligros comunes, sugiere controles basados en mejores prácticas, y facilita la actualización periódica.\n\nSiempre puedes editar las sugerencias según tu contexto.",
    category: "iperc",
    followUp: ["¿Puedo agregar mis propios peligros?", "¿Cómo personalizo los controles?", "¿El asistente aprende de mis datos?"]
  },

  // ============================================================================
  // SECCIÓN 7: EXÁMENES MÉDICOS Y SALUD OCUPACIONAL
  // ============================================================================
  {
    keywords: ["examen", "medico", "ocupacional", "ingreso", "periodico", "egreso", "aptitud"],
    question: "¿Cómo gestiono exámenes médicos ocupacionales?",
    answer: "Los exámenes ocupacionales se gestionan de la siguiente manera.\n\nLos tipos obligatorios son:\n\n1. Ingreso o pre-ocupacional: antes de iniciar labores, determina aptitud para el cargo.\n\n2. Periódicos: según perfil de riesgo. Para riesgo I a III cada 2 años, y para riesgo IV a V cada año.\n\n3. Egreso o retiro: al terminar la relación laboral, es obligatorio ofrecerlo.\n\n4. Por cambio de cargo: cuando cambian las condiciones de exposición.\n\nEn el sistema puedes:\n\n1. Programar exámenes por trabajador o cargo.\n2. Registrar la IPS o médico evaluador.\n3. Cargar el concepto de aptitud.\n4. Recibir alertas de vencimiento.\n5. Generar el profesiograma.\n\nLos conceptos posibles son: Apto, Apto con restricciones, No apto temporal, o No apto.",
    category: "salud",
    followUp: ["¿Qué incluye el examen de ingreso?", "¿Qué hago si sale no apto?", "¿Cómo manejo la confidencialidad?"]
  },
  {
    keywords: ["enfermedad laboral", "enfermedad profesional", "diagnostico", "exposicion"],
    question: "¿Cómo registro enfermedades laborales?",
    answer: "El módulo Salud Ocupacional gestiona las enfermedades laborales. Para registrar un caso sigue estos pasos:\n\n1. Ve a Salud Ocupacional.\n2. Selecciona Nueva Enfermedad.\n3. Completa: trabajador afectado, diagnóstico CIE-10, factor de exposición según IPERC, fecha de diagnóstico, EPS o ARL que califica, y estado (en estudio, calificada, o en tratamiento).\n\nEl sistema permite: vincular con peligros identificados en IPERC, hacer seguimiento del tratamiento, programar seguimientos médicos, documentar restricciones laborales, y generar estadísticas de morbilidad.\n\nRecuerda que la información médica es confidencial según la Ley 1581/2012. Solo el personal autorizado puede acceder a esta información.",
    category: "salud",
    followUp: ["¿Quién califica la enfermedad laboral?", "¿Cómo documento restricciones?", "¿Qué es la vigilancia epidemiológica?"]
  },
  {
    keywords: ["vigilancia epidemiologica", "sve", "programa vigilancia", "poblacion expuesta"],
    question: "¿Qué es la vigilancia epidemiológica?",
    answer: "La Vigilancia Epidemiológica monitorea la salud de trabajadores expuestos.\n\nLos programas comunes de SVE son:\n\n1. Osteomuscular: para expuestos a riesgo biomecánico, previene lesiones por movimientos repetitivos.\n\n2. Cardiovascular: control de factores de riesgo, prevención de enfermedades del corazón.\n\n3. Respiratorio: para expuestos a material particulado, previene neumoconiosis.\n\n4. Auditivo: para expuestos a ruido mayor a 80 dB, previene hipoacusia.\n\n5. Visual: para usuarios de pantallas, previene fatiga visual.\n\nEn el sistema puedes: definir poblaciones objetivo, programar exámenes periódicos, registrar casos, generar indicadores de morbilidad, y documentar intervenciones.",
    category: "salud",
    followUp: ["¿Cómo defino poblaciones expuestas?", "¿Qué indicadores debo medir?", "¿Cómo documento intervenciones?"]
  },

  // ============================================================================
  // SECCIÓN 8: PLAN DE EMERGENCIAS
  // ============================================================================
  {
    keywords: ["emergencia", "plan emergencias", "evacuacion", "brigada", "simulacro"],
    question: "¿Cómo gestiono el Plan de Emergencias?",
    answer: "El módulo de Plan de Emergencias incluye cinco componentes principales:\n\n1. Análisis de Vulnerabilidad: identificación de amenazas (naturales, tecnológicas y sociales), evaluación de recursos disponibles, y cálculo del nivel de vulnerabilidad.\n\n2. Brigadas de Emergencia: conformación de brigadas de primeros auxilios, evacuación e incendios, capacitación específica, y dotación y equipos.\n\n3. Recursos de Emergencia: inventario de extintores, botiquines, camillas, y sistemas de alarma.\n\n4. Procedimientos: por tipo de emergencia, cadena de llamadas, puntos de encuentro, y rutas de evacuación.\n\n5. Simulacros: programación anual (mínimo 1), registro de resultados, y planes de mejora.",
    category: "emergencias",
    followUp: ["¿Cómo hago el análisis de vulnerabilidad?", "¿Cuántos brigadistas necesito?", "¿Cómo registro un simulacro?"]
  },
  {
    keywords: ["simulacro", "evacuacion", "ejercicio", "practica emergencia"],
    question: "¿Cómo registro y evalúo un simulacro?",
    answer: "Los simulacros validan la efectividad del plan.\n\nAntes del simulacro debes:\n\n1. Definir el tipo (anunciado o sorpresa).\n2. Establecer el escenario (incendio, sismo, etc.).\n3. Programar fecha y hora.\n4. Notificar a brigadistas.\n5. Preparar materiales de evaluación.\n\nDurante el simulacro debes:\n\n1. Activar la alarma.\n2. Cronometrar tiempos.\n3. Observar comportamientos.\n4. Tomar fotografías o video.\n5. Registrar novedades.\n\nDespués del simulacro debes:\n\n1. Reunir al equipo evaluador.\n2. Analizar tiempos de evacuación.\n3. Identificar fallas y aciertos.\n4. Documentar lecciones aprendidas.\n5. Generar plan de mejora.\n\nEn el sistema registra: tiempo de evacuación real, porcentaje de participación, hallazgos encontrados, acciones de mejora, y evidencias fotográficas.",
    category: "emergencias",
    followUp: ["¿Cuántos simulacros debo hacer al año?", "¿Qué tiempos son aceptables?", "¿Cómo mejoro los resultados?"]
  },
  {
    keywords: ["brigadista", "brigada", "conformar brigada", "cuantos brigadistas"],
    question: "¿Cuántos brigadistas necesito y cómo los capacito?",
    answer: "La brigada de emergencias debe ser proporcional a la empresa.\n\nLa cantidad recomendada es: mínimo el 10% de la población, recomendado entre 15% y 20%, y por turno al menos 1 brigadista por área.\n\nLos tipos de brigada son:\n\n1. Primeros Auxilios: atención inicial de heridos.\n2. Evacuación: guiar y verificar evacuación.\n3. Incendios: control de conatos.\n4. Comunicaciones: coordinación y alertas.\n\nLa capacitación mínima incluye: primeros auxilios con 20 horas, uso de extintores con 8 horas, evacuación con 8 horas, y prácticas trimestrales.\n\nLa dotación incluye: chaleco identificador, casco de brigadista, linterna, pito, y brazalete.\n\nEl sistema permite registrar brigadistas, capacitaciones y dotación.",
    category: "emergencias",
    followUp: ["¿Cómo selecciono brigadistas?", "¿Dónde capacito a la brigada?", "¿Qué equipos necesitan?"]
  },

  // ============================================================================
  // SECCIÓN 9: PESV - PLAN ESTRATÉGICO DE SEGURIDAD VIAL
  // ============================================================================
  {
    keywords: ["pesv", "seguridad vial", "vehiculo", "conductor", "transporte"],
    question: "¿Qué es el módulo PESV y cuándo aplica?",
    answer: "El PESV (Plan Estratégico de Seguridad Vial) es obligatorio según la Ley 1503/2011.\n\nAplica si tu empresa: tiene 10 o más vehículos (propios o contratados), contrata transporte de personal, tiene 10 o más conductores, u opera vehículos como parte de su objeto social.\n\nLos componentes del módulo son:\n\n1. Conductores: registro de licencias, exámenes psicosensométricos, y capacitaciones en seguridad vial.\n\n2. Vehículos: inventario de flota, documentación (SOAT, RTM, seguros), y mantenimiento preventivo.\n\n3. Inspecciones: pre-operacionales diarias e inspecciones periódicas.\n\n4. Siniestros: registro de accidentes viales e investigación y análisis.\n\n5. Auditorías: verificación de cumplimiento.",
    category: "pesv",
    followUp: ["¿Cómo registro vehículos?", "¿Cómo controlo licencias de conducción?", "¿Qué inspecciones debo hacer?"]
  },
  {
    keywords: ["conductor", "licencia conduccion", "psicosensometrico", "driver"],
    question: "¿Cómo gestiono conductores en el PESV?",
    answer: "La gestión de conductores incluye el registro con: datos personales, tipo de licencia (A1, A2, B1, B2, B3, C1, C2, C3), fecha de vencimiento de licencia, categorías autorizadas, y restricciones médicas.\n\nLa documentación requerida es: licencia de conducción vigente, examen psicosensométrico anual, certificado médico de aptitud, y capacitación en seguridad vial.\n\nEl sistema alerta sobre: licencias próximas a vencer, exámenes psicosensométricos vencidos, capacitaciones pendientes, y conductores sin documentación.\n\nLos indicadores disponibles son: porcentaje de conductores con documentación completa, comparendos por conductor, y siniestros por conductor.",
    category: "pesv",
    followUp: ["¿Qué es el examen psicosensométrico?", "¿Cómo registro comparendos?", "¿Qué capacitaciones son obligatorias?"]
  },
  {
    keywords: ["vehiculo", "flota", "soat", "rtm", "tecnicomecanica", "registro vehiculo"],
    question: "¿Cómo registro y controlo vehículos?",
    answer: "El inventario de vehículos incluye datos como: placa, marca, línea y modelo, tipo (automóvil, camioneta, moto, etc.), número de pasajeros, y propiedad (propio, leasing o contratado).\n\nLa documentación obligatoria incluye:\n\n1. SOAT: Seguro obligatorio.\n2. RTM: Revisión técnico-mecánica.\n3. Tarjeta de propiedad.\n4. Póliza todo riesgo (recomendado).\n5. Extracto de propietario.\n\nEl sistema permite: cargar documentos digitalizados, alertas 30 días antes del vencimiento, programar mantenimientos preventivos, registrar inspecciones pre-operacionales, e histórico de siniestros por vehículo.\n\nLos indicadores disponibles son: porcentaje de vehículos con documentación vigente, costo de mantenimiento por vehículo, y siniestros por vehículo.",
    category: "pesv",
    followUp: ["¿Cómo programo mantenimientos?", "¿Cómo hago inspecciones pre-operacionales?", "¿Cómo registro un siniestro vial?"]
  },

  // ============================================================================
  // SECCIÓN 10: AUDITORÍAS INTERNAS
  // ============================================================================
  {
    keywords: ["auditoria", "verificar", "evaluar cumplimiento", "iso 45001", "auditoria interna"],
    question: "¿Cómo realizo auditorías internas?",
    answer: "Las auditorías internas son obligatorias, se requiere mínimo 1 por año.\n\nEl módulo Auditorías Internas incluye:\n\n1. Planificación: define el alcance (procesos o áreas), selecciona criterios (Resolución 0312 o ISO 45001), asigna equipo auditor, y programa fechas.\n\n2. Ejecución: reunión de apertura, recolección de evidencias, entrevistas y observaciones, y registro de hallazgos.\n\n3. Documentación: conformidades, no conformidades (mayores o menores), observaciones, y oportunidades de mejora.\n\n4. Cierre: reunión de cierre, informe de auditoría, y plan de acciones correctivas.\n\nEl sistema genera: lista de verificación por estándar, informe automático en PDF, y seguimiento de hallazgos.",
    category: "auditorias",
    followUp: ["¿Quién puede ser auditor interno?", "¿Cómo genero el informe?", "¿Cuál es la diferencia con ISO 45001?"]
  },
  {
    keywords: ["auditor interno", "competencia auditor", "quien audita", "requisitos auditor"],
    question: "¿Quién puede ser auditor interno de SST?",
    answer: "Los requisitos para auditores internos incluyen formación mínima: curso de 50 horas en SST, formación en auditoría de 8 a 24 horas, y conocimiento de normativa aplicable.\n\nLas competencias requeridas son: conocimiento del SG-SST, habilidades de comunicación, imparcialidad, y capacidad analítica.\n\nSobre la independencia: no puede auditar su propia área, no puede auditar procesos donde participe, y puede ser personal interno o externo.\n\nEl equipo auditor incluye: auditor líder que coordina la auditoría, y auditores de apoyo que ejecutan según asignación.\n\nLas opciones para empresas pequeñas son: contratar auditor externo, acordar auditoría cruzada con otra empresa, o usar asesoría de la ARL.\n\nEl sistema registra las competencias de los auditores.",
    category: "auditorias",
    followUp: ["¿Dónde me capacito como auditor?", "¿Puedo auditar mi propia área?", "¿Cada cuánto debo auditar?"]
  },

  // ============================================================================
  // SECCIÓN 11: REVISIÓN POR LA DIRECCIÓN
  // ============================================================================
  {
    keywords: ["revision direccion", "alta direccion", "gerencia", "liderazgo"],
    question: "¿Qué es la Revisión por la Dirección?",
    answer: "La Revisión por la Dirección evalúa el SG-SST al más alto nivel. Es obligatoria mínimo 1 vez al año según la cláusula 9.3 de ISO 45001.\n\nLos participantes son: alta dirección (Gerente o Representante legal), responsable del SG-SST, y líderes de proceso como invitados.\n\nLas entradas de la revisión incluyen:\n\n1. Resultados de auditorías.\n2. Estadísticas de accidentalidad.\n3. Cumplimiento de objetivos e indicadores.\n4. Estado de acciones correctivas.\n5. Resultados de consulta y participación.\n6. Cambios en el contexto (legal u operacional).\n7. Oportunidades de mejora.\n8. Recursos asignados.\n\nLas salidas de la revisión son:\n\n1. Decisiones sobre mejora continua.\n2. Recursos aprobados.\n3. Cambios en política u objetivos.\n4. Compromisos de la dirección.\n\nEl sistema genera el Acta de Revisión automáticamente.",
    category: "direccion",
    followUp: ["¿Qué información debo preparar?", "¿Cómo documento las decisiones?", "¿Quién firma el acta?"]
  },

  // ============================================================================
  // SECCIÓN 12: NORMATIVA Y CUMPLIMIENTO
  // ============================================================================
  {
    keywords: ["resolucion 0312", "estandares minimos", "normativa", "ley", "decreto 1072"],
    question: "¿Qué es la Resolución 0312 de 2019?",
    answer: "La Resolución 0312 de 2019 define los estándares mínimos del SG-SST.\n\nLa clasificación según tamaño y riesgo es la siguiente: las microempresas de 1 a 10 trabajadores con riesgo I, II o III deben cumplir 7 estándares básicos; las pequeñas empresas de 11 a 50 trabajadores con riesgo I, II o III deben cumplir 21 estándares; las medianas y grandes empresas de 51 o más trabajadores con riesgo I, II o III deben cumplir 60 estándares; y cualquier empresa con riesgo IV o V debe cumplir los 60 estándares completos.\n\nLos 7 estándares mínimos para microempresas son:\n\n1. Asignación de responsable SST.\n2. Afiliación a seguridad social.\n3. Capacitación anual.\n4. Plan de trabajo anual.\n5. Evaluaciones médicas ocupacionales.\n6. Identificación de peligros (IPERC).\n7. Medidas de prevención y control.\n\nEl sistema clasifica tu empresa automáticamente, muestra solo los estándares aplicables, permite hacer la autoevaluación, y genera el plan de mejora.",
    category: "normativa",
    followUp: ["¿Cómo hago la autoevaluación?", "¿Qué pasa si no cumplo?", "¿Cada cuánto debo evaluar?"]
  },
  {
    keywords: ["matriz legal", "requisito legal", "normativo", "decreto", "resolucion", "ley"],
    question: "¿Cómo uso la Matriz Legal?",
    answer: "La Matriz Legal identifica los requisitos normativos aplicables.\n\nLa normativa incluida es: Decreto 1072 de 2015 (Decreto Único Reglamentario), Resolución 0312 de 2019 (Estándares mínimos), Resolución 2400 de 1979 (Higiene y seguridad), Ley 1562 de 2012 (Sistema de Riesgos Laborales), y más de 50 normas adicionales organizadas por tema.\n\nLas funcionalidades disponibles son:\n\n1. Filtrar por tema: trabajo en alturas, riesgo químico, emergencias, y salud ocupacional.\n\n2. Evaluar cumplimiento: marca Cumple, No cumple o Parcial, registra evidencia de cumplimiento, y asigna responsable.\n\n3. Alertas: notifica sobre nuevas normas publicadas y requisitos sin evaluar.\n\n4. Informes: muestra porcentaje de cumplimiento legal y requisitos pendientes.\n\nAgregamos nuevas normas cuando se publican.",
    category: "legal",
    followUp: ["¿Cada cuánto se actualiza?", "¿Puedo agregar normas propias?", "¿Cómo documento el cumplimiento?"]
  },
  {
    keywords: ["iso 45001", "certificacion", "sistema gestion", "ohsas"],
    question: "¿Qué es ISO 45001 y cómo la implemento?",
    answer: "ISO 45001:2018 es la norma internacional para Sistemas de Gestión SST.\n\nLa estructura tiene 10 capítulos:\n\n1. Alcance.\n2. Referencias normativas.\n3. Términos y definiciones.\n4. Contexto de la organización.\n5. Liderazgo y participación.\n6. Planificación (riesgos y oportunidades).\n7. Apoyo (recursos y competencia).\n8. Operación (controles operacionales).\n9. Evaluación del desempeño.\n10. Mejora continua.\n\nLa diferencia con la Resolución 0312 es que ISO 45001 es voluntaria (para certificación), mientras que la Resolución 0312 es obligatoria (mínimo legal). Además, ISO 45001 es más amplia y rigurosa.\n\nEl sistema SST Colombia cubre los requisitos de ISO 45001, permite auditar contra la norma, y facilita el proceso de certificación.\n\nLos beneficios de certificarse son: mejor imagen corporativa, cumplir requisito para grandes licitaciones, y reducción de primas ARL.",
    category: "normativa",
    followUp: ["¿Cuánto cuesta certificarse?", "¿Cuánto tiempo toma?", "¿Qué auditorías externas necesito?"]
  },

  // ============================================================================
  // SECCIÓN 13: DOCUMENTACIÓN Y CONSERVACIÓN
  // ============================================================================
  {
    keywords: ["documento", "conservacion", "archivo", "retencion", "guardar", "almacenar"],
    question: "¿Cómo funciona la conservación de documentos?",
    answer: "El módulo cumple con el Estándar 2.5.1 de la Resolución 0312.\n\nLos tiempos de retención son: documentos SST generales por mínimo 20 años, historias clínicas ocupacionales por 30 años, y matrices IPERC mientras exista el peligro más 20 años adicionales.\n\nLas funcionalidades incluyen:\n\n1. Clasificación por tipo: POL-SST para Políticas, PRO-SST para Procedimientos, FOR-SST para Formatos, y REG-SST para Registros.\n\n2. Control de versiones: histórico de cambios, fecha de última actualización, y responsable de aprobación.\n\n3. Códigos automáticos: el sistema asigna códigos únicos, por ejemplo POL-SST-001 o FOR-SST-015.\n\n4. Trazabilidad: registro de quién accede a documentos para cumplir con la Ley 1581/2012.\n\n5. Alertas: documentos por revisar o actualizar, y vencimientos.",
    category: "documentos",
    followUp: ["¿Cómo subo un documento?", "¿Cómo controlo versiones?", "¿Quién puede acceder?"]
  },
  {
    keywords: ["politica sst", "crear politica", "redactar politica", "firma politica"],
    question: "¿Cómo creo y gestiono la Política SST?",
    answer: "La Política SST es obligatoria según el Estándar 1.1.1.\n\nLos requisitos de la política son:\n\n1. Compromiso de la alta dirección.\n2. Específica para la naturaleza de la empresa.\n3. Objetivos de prevención.\n4. Cumplimiento legal.\n5. Mejora continua.\n6. Firmada por el representante legal.\n7. Divulgada a todos los trabajadores.\n\nEn el sistema sigue estos pasos:\n\n1. Ve a Políticas SST.\n2. Usa la plantilla o redacta tu propia política.\n3. Incluye: compromiso gerencial, alcance, objetivos generales, y fecha de emisión.\n4. Carga la versión firmada en PDF o imagen.\n5. Registra la divulgación.\n\nLa divulgación puede hacerse mediante carteleras, inducción, correo electrónico, o intranet.\n\nEl sistema genera evidencia de divulgación.",
    category: "documentos",
    followUp: ["¿Cada cuánto actualizo la política?", "¿Cómo la divulgo?", "¿Quién debe firmarla?"]
  },

  // ============================================================================
  // SECCIÓN 14: COPASST Y COMITÉS
  // ============================================================================
  {
    keywords: ["copasst", "comite", "vigia", "eleccion", "conformar", "paritario"],
    question: "¿Cómo gestiono el COPASST?",
    answer: "El COPASST (Comité Paritario de Seguridad y Salud) es obligatorio.\n\nDebes tener COPASST si tienes 10 o más trabajadores (es paritario), y Vigía de SST si tienes menos de 10 trabajadores (1 persona).\n\nLa conformación del COPASST según número de trabajadores es: de 10 a 49 trabajadores requiere 1 representante por cada parte, de 50 a 499 trabajadores requiere 2 por cada parte, de 500 a 999 trabajadores requiere 3 por cada parte, y de 1000 o más trabajadores requiere 4 por cada parte.\n\nEn el sistema puedes:\n\n1. Registrar miembros (empleador y trabajadores).\n2. Documentar el proceso de elección.\n3. Programar reuniones mensuales.\n4. Registrar actas de reunión.\n5. Hacer seguimiento a compromisos.\n6. Registrar inspecciones del comité.\n\nEl período es de 2 años con posibilidad de reelección.\n\nLas funciones principales son: inspecciones periódicas, investigación de accidentes, y vigilancia del SG-SST.",
    category: "copasst",
    followUp: ["¿Cómo elijo a los representantes?", "¿Qué incluir en las actas?", "¿Quién preside las reuniones?"]
  },
  {
    keywords: ["acta copasst", "reunion copasst", "minuta", "documentar reunion"],
    question: "¿Cómo documento las reuniones del COPASST?",
    answer: "Las actas del COPASST son evidencia de gestión y deben realizarse con frecuencia mínima mensual.\n\nEl contenido del acta debe incluir:\n\n1. Fecha, hora y lugar.\n2. Asistentes con firma.\n3. Verificación de quórum.\n4. Orden del día.\n5. Desarrollo de temas: revisión de compromisos anteriores, nuevos temas tratados, y decisiones tomadas.\n6. Compromisos adquiridos con responsables y fechas.\n7. Firma de presidente y secretario.\n\nEn el sistema puedes:\n\n1. Crear acta desde plantilla predefinida.\n2. Registrar asistencia.\n3. Documentar compromisos.\n4. Dar seguimiento automático.\n5. Generar PDF del acta.\n6. Archivar con las demás actas históricas.",
    category: "copasst",
    followUp: ["¿Qué pasa si no hay quórum?", "¿Quién debe firmar el acta?", "¿Cómo hago seguimiento a compromisos?"]
  },
  {
    keywords: ["comite convivencia", "acoso laboral", "clima laboral"],
    question: "¿Cómo gestiono el Comité de Convivencia Laboral?",
    answer: "El Comité de Convivencia Laboral es obligatorio según la Ley 1010 de 2006 y la Resolución 652 de 2012.\n\nAplica para empresas con más de 20 trabajadores. Para empresas más pequeñas, las funciones las asume el empleador o un representante.\n\nLas funciones principales son: recibir quejas de acoso laboral, examinar casos de forma confidencial, mediar en conflictos, formular recomendaciones, y hacer seguimiento a compromisos.\n\nEn el sistema puedes:\n\n1. Registrar miembros del comité.\n2. Programar reuniones trimestrales ordinarias.\n3. Documentar casos recibidos de forma confidencial.\n4. Registrar actas de reunión.\n5. Hacer seguimiento a recomendaciones.\n6. Generar informe de gestión anual.\n\nEl período de los miembros es de 2 años.",
    category: "copasst",
    followUp: ["¿Cuántos miembros debe tener?", "¿Cómo manejo un caso de acoso?", "¿Cada cuánto se reúne?"]
  },

  // ============================================================================
  // SECCIÓN 15: GESTIÓN DE CAMBIOS
  // ============================================================================
  {
    keywords: ["cambio", "gestion cambio", "modificacion", "nuevo proceso", "nuevo equipo"],
    question: "¿Cómo gestiono los cambios en SST?",
    answer: "La Gestión de Cambios evalúa impactos en SST antes de implementar modificaciones.\n\nLos tipos de cambios a evaluar incluyen: nuevos procesos o equipos, cambios en instalaciones, nuevos productos químicos, cambios organizacionales, y modificación de procedimientos.\n\nEn el sistema sigue estos pasos:\n\n1. Registra el cambio propuesto.\n2. Identifica peligros nuevos o modificados.\n3. Evalúa el riesgo usando IPERC.\n4. Define controles necesarios.\n5. Planifica capacitación requerida.\n6. Implementa el cambio.\n7. Verifica la efectividad de controles.\n\nLa documentación incluye: descripción del cambio, análisis de riesgos, controles implementados, capacitación realizada, y fecha de implementación.\n\nEl sistema vincula cambios con la matriz IPERC automáticamente.",
    category: "cambios",
    followUp: ["¿Qué cambios debo evaluar?", "¿Cómo documento el análisis?", "¿Cuándo actualizo IPERC?"]
  },

  // ============================================================================
  // SECCIÓN 16: COMUNICACIONES SST
  // ============================================================================
  {
    keywords: ["comunicacion", "divulgacion", "publicar", "informar", "notificar"],
    question: "¿Cómo gestiono las comunicaciones SST?",
    answer: "El módulo de Comunicación SST documenta la divulgación de información.\n\nLos tipos de comunicación incluyen: políticas y procedimientos, resultados de gestión, alertas de seguridad, cambios normativos, y lecciones aprendidas.\n\nLos canales disponibles son: carteleras físicas, correo electrónico, reuniones, intranet, y portal de empleados.\n\nEn el sistema puedes:\n\n1. Crear comunicados con fecha y contenido.\n2. Seleccionar destinatarios por área o cargo.\n3. Definir canal de divulgación.\n4. Registrar evidencia de recepción.\n5. Hacer seguimiento de lectura.\n6. Archivar histórico de comunicaciones.\n\nPara la Política SST específicamente, el sistema genera registro de divulgación con fecha y firma del trabajador.",
    category: "comunicaciones",
    followUp: ["¿Cómo confirmo que leyeron?", "¿Qué comunicaciones son obligatorias?", "¿Cómo envío correos masivos?"]
  },

  // ============================================================================
  // SECCIÓN 17: INDICADORES DE GESTIÓN
  // ============================================================================
  {
    keywords: ["indicador", "kpi", "meta", "medicion", "resultado"],
    question: "¿Cómo configuro indicadores de gestión SST?",
    answer: "Los indicadores miden la efectividad del SG-SST.\n\nLos indicadores obligatorios según la Resolución 0312 son:\n\n1. Indicadores de Estructura: política definida y divulgada, recursos asignados, y responsable designado.\n\n2. Indicadores de Proceso: cumplimiento de capacitaciones, inspecciones realizadas, y cobertura de exámenes médicos.\n\n3. Indicadores de Resultado: índice de frecuencia (IF), índice de severidad (IS), índice de lesiones incapacitantes (ILI), y tasa de accidentalidad.\n\nEn el sistema puedes:\n\n1. Ver indicadores calculados automáticamente.\n2. Definir metas por indicador.\n3. Comparar con períodos anteriores.\n4. Generar gráficas de tendencia.\n5. Exportar para informes.\n\nLos indicadores alimentan la revisión por dirección.",
    category: "indicadores",
    followUp: ["¿Cómo defino metas?", "¿Qué valores son aceptables?", "¿Cómo mejoro mis indicadores?"]
  },

  // ============================================================================
  // SECCIÓN 18: OBJETIVOS SST
  // ============================================================================
  {
    keywords: ["objetivo", "meta sst", "planificar objetivo", "smart"],
    question: "¿Cómo defino objetivos SST?",
    answer: "Los objetivos SST deben ser SMART: Específicos, Medibles, Alcanzables, Relevantes y con Tiempo definido.\n\nEjemplos de objetivos para este año incluyen:\n\n1. Reducir la tasa de accidentalidad en un 20% comparado con el año anterior.\n2. Lograr el 100% de cobertura en exámenes médicos ocupacionales.\n3. Cumplir el 90% del programa de capacitación anual.\n4. Cerrar el 100% de hallazgos críticos en menos de 7 días.\n5. Alcanzar el 85% de cumplimiento en la evaluación de estándares mínimos.\n\nEn el sistema puedes:\n\n1. Crear objetivos con descripción SMART.\n2. Asignar indicadores de medición.\n3. Definir metas cuantitativas.\n4. Establecer plazos.\n5. Designar responsables.\n6. Hacer seguimiento periódico.\n7. Documentar avances.\n\nLos objetivos se revisan en la revisión por dirección.",
    category: "objetivos",
    followUp: ["¿Cuántos objetivos debo tener?", "¿Cómo mido el avance?", "¿Qué pasa si no cumplo?"]
  },

  // ============================================================================
  // SECCIÓN 19: PLAN DE TRABAJO ANUAL
  // ============================================================================
  {
    keywords: ["plan trabajo", "cronograma", "actividades", "programar año"],
    question: "¿Cómo creo el Plan de Trabajo Anual?",
    answer: "El Plan de Trabajo Anual es obligatorio según el Estándar 2.1.1.\n\nEl contenido del plan incluye: actividades a desarrollar, responsables, recursos necesarios, cronograma mensual, y metas e indicadores.\n\nEn el sistema sigue estos pasos:\n\n1. Ve a Plan de Trabajo Anual.\n2. Crea nuevo plan para el año.\n3. Usa la plantilla con actividades predefinidas o personaliza.\n4. Asigna actividades por mes.\n5. Define responsables y recursos.\n6. Establece indicadores de cumplimiento.\n\nEl sistema incluye actividades predefinidas basadas en la Resolución 0312: capacitaciones obligatorias, inspecciones periódicas, simulacros, auditorías, y revisión por dirección.\n\nEl seguimiento muestra el porcentaje de avance mensual con alertas de actividades próximas o vencidas.",
    category: "planificacion",
    followUp: ["¿Qué actividades son obligatorias?", "¿Cómo hago seguimiento?", "¿Puedo modificar el plan?"]
  },

  // ============================================================================
  // SECCIÓN 20: EVALUACIONES SST
  // ============================================================================
  {
    keywords: ["evaluacion", "autoevaluacion", "diagnostico", "nivel cumplimiento"],
    question: "¿Cómo realizo la evaluación de estándares mínimos?",
    answer: "La evaluación según la Resolución 0312 determina tu nivel de cumplimiento.\n\nLa frecuencia recomendada es: inicial al implementar el sistema, y anual para seguimiento.\n\nEn el sistema sigue estos pasos:\n\n1. Ve a Evaluaciones SST.\n2. Selecciona Nueva Evaluación.\n3. El sistema muestra los estándares según tu clasificación.\n4. Evalúa cada ítem: Cumple (100%), Parcialmente (50%), o No cumple (0%).\n5. Adjunta evidencias por estándar.\n6. El sistema calcula el puntaje total.\n\nLa interpretación del resultado es: Crítico (menos del 60%), Moderadamente aceptable (de 60% a 85%), y Aceptable (más del 85%).\n\nEl sistema genera automáticamente el plan de mejora con las prioridades de intervención según los hallazgos.",
    category: "evaluaciones",
    followUp: ["¿Qué puntaje debo lograr?", "¿Cómo genero el plan de mejora?", "¿Dónde reporto los resultados?"]
  },

  // ============================================================================
  // SECCIÓN 22: CUENTA Y CONFIGURACIÓN
  // ============================================================================
  {
    keywords: ["contrasena", "clave", "olvide", "recuperar", "acceso", "login", "cambiar clave"],
    question: "¿Cómo recupero mi contraseña?",
    answer: "Para recuperar tu contraseña sigue estos pasos:\n\n1. Ve a la página de inicio de sesión.\n2. Haz clic en ¿Olvidaste tu contraseña?\n3. Ingresa tu correo electrónico registrado.\n4. Recibirás un enlace para crear nueva contraseña.\n5. El enlace es válido por 24 horas.\n6. Crea tu nueva contraseña con mínimo 8 caracteres.\n\nSi no recibiste el correo: revisa la carpeta de spam o correo no deseado, verifica que el correo sea el correcto, espera unos minutos y vuelve a intentar, o contacta a soporte si persiste el problema.\n\nPara cambiar contraseña si ya estás dentro del sistema:\n\n1. Ve a Mi Cuenta.\n2. Selecciona Cambiar Contraseña.\n3. Ingresa contraseña actual y nueva.\n4. Confirma el cambio.",
    category: "cuenta",
    followUp: ["¿Cómo actualizo mis datos?", "¿Cómo cambio mi correo?", "¿Por qué no puedo iniciar sesión?"]
  },
  {
    keywords: ["rol", "permiso", "usuario", "administrador", "acceso", "crear usuario", "perfil"],
    question: "¿Cómo funcionan los roles de usuario?",
    answer: "SST Colombia tiene 10 roles jerárquicos:\n\n1. Superadmin: tiene acceso global a todas las empresas, es para el proveedor SaaS.\n2. Superusuario: tiene acceso total en su empresa, es para el gerente o dueño.\n3. Admin: tiene acceso administrativo completo, es para el jefe de RRHH.\n4. Responsable SST: gestiona el sistema, es para el profesional SST.\n5. LSO: firma documentos, es para el licenciado en Salud Ocupacional.\n6. Coordinador SST: ejecuta actividades, es para el técnico SST.\n7. Coordinador RRHH: gestiona personal, es para el analista de RRHH.\n8. Coordinador Salud: accede a datos médicos confidenciales, es para el médico ocupacional.\n9. Operativo: hace registro básico, es para supervisores.\n10. Trabajador: accede solo al portal personal, es para empleados.\n\nPermisos especiales: los datos médicos solo los ven Coordinador Salud y superiores, la firma de documentos normativos solo la hace el LSO, y la gestión de usuarios solo la hacen Admin y superiores.\n\nEsto cumple con la Ley 1581/2012 de protección de datos.",
    category: "usuarios",
    followUp: ["¿Cómo creo usuarios?", "¿Cómo cambio un rol?", "¿Quién ve datos médicos?"]
  },
  {
    keywords: ["crear usuario", "nuevo usuario", "agregar usuario", "invitar"],
    question: "¿Cómo creo nuevos usuarios?",
    answer: "Para crear usuarios necesitas tener rol Admin o superior. Sigue estos pasos:\n\n1. Ve a Gestión de Usuarios.\n2. Haz clic en Nuevo Usuario.\n3. Completa los datos: nombre de usuario (único), correo electrónico, nombre completo, rol a asignar, y contraseña temporal.\n4. Guarda el usuario.\n5. El sistema envía credenciales por correo.\n\nLas opciones adicionales son: asociar a un trabajador existente, limitar acceso a ciertas áreas, y activar o desactivar usuario.\n\nLas buenas prácticas incluyen: asignar el rol mínimo necesario, revisar usuarios activos periódicamente, desactivar usuarios que ya no laboran, y cambiar contraseñas comprometidas.\n\nPara usuarios de trabajadores puedes crear acceso al Portal de Empleados desde la tarjeta del trabajador de forma automática.",
    category: "usuarios",
    followUp: ["¿Cómo desactivo un usuario?", "¿Puedo tener usuarios de solo lectura?", "¿Cómo restablezco contraseña de otro usuario?"]
  },

  // ============================================================================
  // SECCIÓN 23: REPORTES E INFORMES
  // ============================================================================
  {
    keywords: ["reporte", "informe", "descargar", "pdf", "excel", "exportar"],
    question: "¿Qué reportes puedo generar?",
    answer: "El módulo Informes ofrece múltiples reportes.\n\nLos reportes de Gestión incluyen: Informe Ejecutivo SST (resumen gerencial), Cumplimiento de estándares mínimos, Indicadores de gestión (IF, IS, ILI), y Cumplimiento del Plan de Trabajo.\n\nLos reportes Operativos incluyen: Lista de trabajadores, Matriz IPERC, Cronograma de capacitaciones, Inventario de inspecciones, y Hallazgos pendientes.\n\nLos reportes Normativos incluyen: Autoevaluación Resolución 0312, Informe de Auditoría, Acta de Revisión por Dirección, y Estadísticas de accidentalidad.\n\nLos formatos disponibles son PDF para impresión y archivo, y Excel para análisis.\n\nPara generar un reporte:\n\n1. Ve a Informes.\n2. Selecciona el tipo de reporte.\n3. Filtra por período o área si aplica.\n4. Haz clic en Generar.\n5. Descarga o envía por correo.",
    category: "reportes",
    followUp: ["¿Cómo personalizo un reporte?", "¿Puedo programar reportes automáticos?", "¿Cómo interpreto los indicadores?"]
  },

  // ============================================================================
  // SECCIÓN 24: SOPORTE Y AYUDA
  // ============================================================================
  {
    keywords: ["soporte", "ayuda", "contacto", "problema", "error", "bug", "falla"],
    question: "¿Cómo contacto a soporte técnico?",
    answer: "Los canales de soporte disponibles son:\n\n1. Este chatbot está disponible 24/7 con respuestas inmediatas, preguntas frecuentes, y guías de uso.\n\n2. Correo electrónico: soporte@sst-colombia.com con respuesta en máximo 24 horas hábiles.\n\n3. Horario de atención humana: de lunes a viernes de 8:00 AM a 6:00 PM, sábados de 8:00 AM a 12:00 PM, y festivos cerrado.\n\nPara reportar un error: describe el problema detalladamente, indica qué acción estabas realizando, incluye capturas de pantalla si es posible, y menciona tu navegador y dispositivo.\n\nAntes de contactar soporte te recomendamos: actualizar tu navegador, limpiar caché y cookies, probar en otro navegador, y revisar tu conexión a internet.",
    category: "soporte",
    followUp: ["¿Tienen tutoriales en video?", "¿Ofrecen capacitación?", "¿Cómo reporto una falla?"]
  },

  // ============================================================================
  // SECCIÓN 25: PHVA Y MEJORA CONTINUA (EXPANDIDA)
  // ============================================================================
  {
    keywords: ["phva", "ciclo", "planear", "hacer", "verificar", "actuar", "mejora continua"],
    question: "¿Qué es el ciclo PHVA?",
    answer: "El ciclo PHVA (Planear-Hacer-Verificar-Actuar) es la base del Sistema de Gestión de Seguridad y Salud en el Trabajo. Es como una rueda que gira constantemente para mejorar.\n\nPLANEAR (menú Azul): Aquí defines qué vas a hacer. Incluye la política SST, identificación de peligros, matriz legal, plan de trabajo anual y asignación de responsables.\n\nHACER (menú Verde): Aquí ejecutas lo planeado. Incluye capacitaciones, inspecciones, control de riesgos, gestión de emergencias y vigilancia de la salud.\n\nVERIFICAR (menú Naranja): Aquí revisas si lo que hiciste funcionó. Incluye auditorías internas, revisión de indicadores e investigación de accidentes.\n\nACTUAR (menú Morado): Aquí mejoras lo que no funcionó bien. Incluye acciones correctivas, preventivas y gestión de cambios.\n\nEl sistema te guía por cada fase con colores y menús organizados para que siempre sepas en qué etapa estás.",
    category: "phva",
    followUp: ["¿Por dónde empiezo?", "¿Qué incluye PLANEAR?", "¿Qué incluye HACER?"]
  },
  {
    keywords: ["planear", "planificar", "azul", "primera fase", "inicio planear"],
    question: "¿Qué incluye la fase PLANEAR?",
    answer: "La fase PLANEAR es el primer paso de tu sistema de gestión. Es donde defines todo lo que vas a hacer durante el año.\n\nLos módulos que encontrarás en PLANEAR son:\n\nPolítica SST: Es el compromiso formal de tu empresa con la seguridad. Debe estar firmada por el gerente y comunicada a todos.\n\nIPERC (Identificación de Peligros): Aquí identificas todos los peligros de tu empresa y evalúas qué tan riesgosos son.\n\nMatriz Legal: Lista de todas las normas que tu empresa debe cumplir según tu actividad económica.\n\nPlan de Trabajo Anual: El cronograma de todas las actividades SST del año con fechas y responsables.\n\nObjetivos e Indicadores: Las metas que quieres lograr, por ejemplo reducir accidentes en un 20%.\n\nPerfiles de Cargo: Requisitos de seguridad para cada puesto de trabajo.\n\nResponsables SST: Quiénes están a cargo del sistema.\n\nTe recomendamos empezar por la Política SST y el IPERC, son la base de todo lo demás.",
    category: "phva",
    followUp: ["¿Cómo creo la política SST?", "¿Cómo uso el módulo IPERC?", "¿Cómo hago el plan de trabajo anual?"]
  },
  {
    keywords: ["hacer", "ejecutar", "verde", "segunda fase", "implementar"],
    question: "¿Qué incluye la fase HACER?",
    answer: "La fase HACER es donde pones en práctica todo lo que planeaste. Es la ejecución del día a día.\n\nLos módulos que encontrarás en HACER son:\n\nCapacitaciones: Programa y registra todas las formaciones de tus trabajadores. Desde la inducción hasta cursos especializados.\n\nInspecciones: Revisa periódicamente las condiciones de seguridad de tu empresa. El sistema tiene plantillas listas para usar.\n\nAccidentes e Incidentes: Reporta y gestiona cualquier evento que ocurra. El sistema genera el FURAT automáticamente.\n\nExámenes Médicos: Controla los exámenes ocupacionales de ingreso, periódicos y de egreso.\n\nElementos de Protección Personal (EPP): Gestiona la entrega y control de cascos, guantes, gafas y demás equipos de protección.\n\nPlan de Emergencias: Documenta cómo actuar ante incendios, sismos u otras emergencias.\n\nCOPASST o Vigía: Gestiona las reuniones y actas del comité paritario.\n\nRecuerda: todo lo que hagas debe quedar documentado en el sistema para tener evidencia.",
    category: "phva",
    followUp: ["¿Cómo gestiono capacitaciones?", "¿Cómo realizo inspecciones?", "¿Cómo reporto un accidente?"]
  },
  {
    keywords: ["verificar", "revisar", "naranja", "tercera fase", "evaluar"],
    question: "¿Qué incluye la fase VERIFICAR?",
    answer: "La fase VERIFICAR es donde revisas si todo lo que hiciste está funcionando bien. Es como hacer un chequeo de salud del sistema.\n\nLos módulos que encontrarás en VERIFICAR son:\n\nAuditorías Internas: Revisiones formales para verificar que cumples con la normativa. Debes hacer mínimo una al año.\n\nRevisión por la Dirección: Reunión anual donde la gerencia revisa los resultados del sistema y toma decisiones.\n\nIndicadores de Gestión: Números que te dicen cómo vas. Por ejemplo, cuántos accidentes hubo, cuántas capacitaciones se hicieron, etc.\n\nEvaluación de Estándares Mínimos: Autoevaluación según la Resolución 0312 para conocer tu nivel de cumplimiento.\n\nDashboards: Tableros visuales que muestran el estado de tu sistema en tiempo real.\n\nEn esta fase es importante ser honesto. Si algo no está funcionando, es mejor saberlo para poder mejorarlo.\n\nEl sistema te muestra gráficas y reportes que facilitan el análisis.",
    category: "phva",
    followUp: ["¿Cómo hago una auditoría interna?", "¿Qué es la Revisión por la Dirección?", "¿Cómo interpreto los indicadores?"]
  },
  {
    keywords: ["actuar", "mejorar", "morado", "cuarta fase", "corregir"],
    question: "¿Qué incluye la fase ACTUAR?",
    answer: "La fase ACTUAR es donde mejoras lo que no funcionó bien y fortaleces lo que sí funciona. Es el motor de la mejora continua.\n\nLos módulos que encontrarás en ACTUAR son:\n\nAcciones Correctivas: Soluciones para problemas que ya ocurrieron. Por ejemplo, si hubo un accidente, qué vas a cambiar para que no vuelva a pasar.\n\nAcciones Preventivas: Medidas para evitar problemas antes de que ocurran. Por ejemplo, si detectas una tendencia negativa en los indicadores.\n\nGestión de Cambios: Control de modificaciones importantes en la empresa como nuevos equipos, procesos o instalaciones.\n\nMejora Continua: Registro de todas las mejoras implementadas en el sistema.\n\nRecuerda que el ciclo PHVA nunca termina. Después de ACTUAR, vuelves a PLANEAR incorporando las lecciones aprendidas.\n\nEl sistema te ayuda a dar seguimiento a todas las acciones hasta que se cierren completamente.",
    category: "phva",
    followUp: ["¿Cuál es la diferencia entre correctiva y preventiva?", "¿Qué es la gestión de cambios?", "¿Cómo documento la mejora continua?"]
  },
  {
    keywords: ["empezar phva", "por donde empiezo", "primer paso", "inicio sistema"],
    question: "¿Por dónde empiezo con el ciclo PHVA?",
    answer: "Te recomendamos seguir este orden para empezar con el pie derecho:\n\nPrimero, en CONFIGURACIÓN:\n1. Verifica que los datos de tu empresa estén completos.\n2. Registra a tus trabajadores (puedes importarlos desde Excel).\n3. Crea los usuarios que necesites para tu equipo.\n\nLuego, en PLANEAR:\n1. Crea tu Política SST y asegúrate de que esté firmada.\n2. Haz la identificación de peligros (IPERC) de todas tus áreas.\n3. Elabora tu Plan de Trabajo Anual con las actividades del año.\n\nDespués, en HACER:\n1. Programa las capacitaciones obligatorias (inducción, reinducción).\n2. Realiza las inspecciones según el cronograma.\n3. Gestiona los exámenes médicos de ingreso.\n\nNo te preocupes si no puedes hacer todo de una vez. El sistema te guía y te recuerda lo que falta. Lo importante es avanzar poco a poco.\n\nUsa el Dashboard para ver tu progreso general.",
    category: "phva",
    followUp: ["¿Cómo registro mi empresa?", "¿Cómo importo trabajadores?", "¿Cómo creo la política SST?"]
  },
  {
    keywords: ["objetivo sst", "meta", "indicador", "medir", "kpi"],
    question: "¿Cómo defino objetivos e indicadores SST?",
    answer: "Los objetivos son las metas que tu empresa quiere lograr en seguridad y salud. Los indicadores son los números que te dicen si las estás logrando.\n\nEjemplos de objetivos comunes:\n- Reducir la tasa de accidentalidad en un 20%\n- Lograr el 100% de cobertura en capacitaciones\n- Cerrar el 90% de hallazgos de inspección a tiempo\n- Cumplir el 100% del programa de exámenes médicos\n\nPara cada objetivo necesitas un indicador. Por ejemplo:\n- Tasa de accidentalidad = Accidentes / Total trabajadores x 100\n- Cobertura de capacitación = Capacitados / Total convocados x 100\n\nEn el sistema puedes:\n1. Crear objetivos con su meta y plazo.\n2. Asociar indicadores que se calculan automáticamente.\n3. Ver el avance en gráficas.\n4. Recibir alertas si vas por debajo de la meta.\n\nRecuerda que los objetivos deben ser realistas y medibles. Es mejor tener pocos objetivos bien medidos que muchos sin seguimiento.",
    category: "phva",
    followUp: ["¿Qué indicadores son obligatorios?", "¿Cómo calculo la tasa de accidentalidad?", "¿Cada cuánto reviso los indicadores?"]
  },
  {
    keywords: ["copasst", "vigia", "comite paritario", "reuniones copasst"],
    question: "¿Cómo gestiono el COPASST o Vigía?",
    answer: "El COPASST (Comité Paritario de Seguridad y Salud en el Trabajo) es obligatorio según el número de trabajadores:\n\n- Menos de 10 trabajadores: Vigía de SST (1 persona)\n- 10 o más trabajadores: COPASST (comité con representantes del empleador y trabajadores)\n\nEl sistema te ayuda a:\n\nConformación: Registrar los miembros, sus períodos (2 años) y capacitaciones.\n\nReuniones: Programar las reuniones mensuales obligatorias. El sistema te recuerda las fechas.\n\nActas: Generar actas de cada reunión con los temas tratados, compromisos y responsables.\n\nSeguimiento: Dar seguimiento a los compromisos adquiridos en cada reunión.\n\nInspecciones: El COPASST debe participar en inspecciones. Puedes vincular las inspecciones al comité.\n\nRecuerda que el COPASST tiene funciones importantes como investigar accidentes, hacer inspecciones y proponer mejoras. No es solo una formalidad.\n\nEl sistema guarda todo el histórico para las auditorías.",
    category: "hacer",
    followUp: ["¿Cada cuánto se reúne el COPASST?", "¿Qué temas debe tratar?", "¿Cómo documento las actas?"]
  },
  {
    keywords: ["epp", "proteccion personal", "dotacion", "casco", "guantes", "entrega epp"],
    question: "¿Cómo gestiono los Elementos de Protección Personal?",
    answer: "Los EPP son los elementos que protegen a tus trabajadores de los peligros. Su gestión correcta es muy importante.\n\nEn el sistema puedes:\n\nDefinir EPP por cargo: Según el IPERC, indica qué EPP necesita cada puesto de trabajo. Por ejemplo, un soldador necesita careta, guantes y delantal.\n\nRegistrar entregas: Documenta cada entrega con fecha, cantidad y firma del trabajador. El sistema genera el acta automáticamente.\n\nControlar inventario: Lleva el control de EPP disponibles y programa las compras.\n\nProgramar reposiciones: Configura la vida útil de cada EPP y el sistema te avisa cuándo debes entregar uno nuevo.\n\nVerificar uso: Durante las inspecciones, registra si los trabajadores están usando correctamente sus EPP.\n\nRecuerda que no basta con entregar los EPP. Debes:\n- Capacitar en su uso correcto\n- Verificar que los usen\n- Reponerlos cuando se dañen\n\nEl sistema te ayuda con alertas de entregas pendientes y reportes de cumplimiento.",
    category: "hacer",
    followUp: ["¿Qué EPP son obligatorios?", "¿Cómo documento la entrega?", "¿Cada cuánto repongo los EPP?"]
  },
  {
    keywords: ["gestion cambios", "cambio proceso", "nuevo equipo", "modificacion"],
    question: "¿Qué es la Gestión de Cambios en SST?",
    answer: "La Gestión de Cambios es el control que debes hacer cuando hay modificaciones importantes en tu empresa que pueden afectar la seguridad.\n\nDebes aplicar gestión de cambios cuando:\n- Compras nuevos equipos o maquinaria\n- Cambias un proceso de trabajo\n- Modificas las instalaciones\n- Introduces nuevas sustancias químicas\n- Cambias proveedores de servicios críticos\n- Hay cambios en la normativa aplicable\n\nEl proceso en el sistema incluye:\n\n1. Identificar el cambio: Describe qué va a cambiar y por qué.\n\n2. Evaluar impacto: Revisa cómo afecta la seguridad. Puede requerir actualizar el IPERC.\n\n3. Planificar controles: Define qué medidas tomarás para que el cambio sea seguro.\n\n4. Implementar: Ejecuta el cambio con los controles definidos.\n\n5. Verificar: Confirma que todo funcionó bien y no hay nuevos riesgos.\n\nEsto evita que los cambios generen accidentes. Muchos accidentes ocurren precisamente después de hacer cambios sin la debida planificación.",
    category: "phva",
    followUp: ["¿Cuándo debo actualizar el IPERC?", "¿Quién aprueba los cambios?", "¿Cómo documento un cambio?"]
  },
  {
    keywords: ["comunicacion", "divulgacion", "informar", "cartelera", "correo"],
    question: "¿Cómo gestiono las comunicaciones SST?",
    answer: "La comunicación es fundamental para que todos en tu empresa conozcan los temas de seguridad.\n\nEl sistema te ayuda a gestionar:\n\nComunicaciones internas:\n- Divulgación de la política SST\n- Publicación de procedimientos nuevos\n- Alertas de seguridad\n- Resultados de auditorías (resumen)\n- Cambios en la normativa\n\nComunicaciones externas:\n- Reportes a la ARL\n- Información para contratistas\n- Respuesta a autoridades\n\nCanales que puedes usar:\n- Correo electrónico (el sistema puede enviar automáticamente)\n- Carteleras virtuales\n- Reuniones y charlas\n- Portal de empleados\n\nPara cada comunicación registra:\n1. El tema comunicado\n2. A quién se dirigió\n3. Fecha de divulgación\n4. Evidencia (acta, correo, foto)\n\nRecuerda que la comunicación debe ser clara y accesible para todos, incluyendo personas con dificultades de lectura.",
    category: "hacer",
    followUp: ["¿Cómo divulgo la política SST?", "¿Qué debo comunicar obligatoriamente?", "¿Cómo uso el portal de empleados?"]
  },
  {
    keywords: ["contratista", "proveedor", "tercero", "outsourcing", "evaluacion proveedor"],
    question: "¿Cómo gestiono contratistas y proveedores en SST?",
    answer: "Cuando contratas servicios externos, también eres responsable de la seguridad de esos trabajadores mientras estén en tu empresa.\n\nEl sistema te ayuda con:\n\nEvaluación inicial:\n- Verificar que el contratista tenga su propio sistema SST\n- Revisar afiliaciones a seguridad social de su personal\n- Verificar certificaciones si aplica (ej: trabajo en alturas)\n\nDurante el trabajo:\n- Incluir al personal contratista en inducciones\n- Aplicar las mismas normas de seguridad que a tu personal\n- Supervisar el cumplimiento de medidas de seguridad\n\nDocumentación requerida:\n- Contrato con cláusulas de SST\n- Certificados de ARL del contratista\n- Lista de trabajadores autorizados\n- Registro de inducciones realizadas\n\nEvaluación de desempeño:\n- Califica periódicamente a tus contratistas\n- Registra incidentes o incumplimientos\n- Toma decisiones basadas en su desempeño SST\n\nRecuerda: si un trabajador de un contratista tiene un accidente en tu empresa, tú también tienes responsabilidades.",
    category: "hacer",
    followUp: ["¿Qué documentos debo pedir?", "¿Cómo hago la inducción?", "¿Qué pasa si hay un accidente?"]
  },
  {
    keywords: ["adquisicion", "compra", "especificacion", "requisito tecnico"],
    question: "¿Cómo incluyo la seguridad en las compras?",
    answer: "Las adquisiciones con criterios de SST garantizan que lo que compras sea seguro para tus trabajadores.\n\nDebes considerar criterios SST al comprar:\n\nEquipos y maquinaria:\n- Certificaciones de seguridad\n- Manuales en español\n- Dispositivos de protección\n- Facilidad de mantenimiento\n\nSustancias químicas:\n- Hojas de datos de seguridad (SDS)\n- Etiquetado según normas SGA\n- Compatibilidad con otras sustancias\n- Condiciones de almacenamiento\n\nElementos de Protección Personal:\n- Certificación de calidad\n- Tallas disponibles\n- Vida útil definida\n\nServicios:\n- Requisitos SST para contratistas\n- Certificaciones requeridas\n\nEn el sistema puedes:\n1. Definir especificaciones SST por tipo de compra\n2. Registrar evaluaciones de productos\n3. Documentar no conformidades con proveedores\n4. Generar reportes de cumplimiento\n\nEsto cumple con el estándar 2.9.1 de la Resolución 0312.",
    category: "hacer",
    followUp: ["¿Qué certificaciones debo pedir?", "¿Cómo evalúo un proveedor?", "¿Dónde registro las especificaciones?"]
  },
  {
    keywords: ["accion correctiva", "accion preventiva", "mejora", "no conformidad", "corregir"],
    question: "¿Cuál es la diferencia entre acciones correctivas y preventivas?",
    answer: "Las acciones de mejora se clasifican de la siguiente manera:\n\nLa acción correctiva elimina la causa de un problema que ya ocurrió. Por ejemplo, después de un accidente se modifica un procedimiento. Su origen puede ser un accidente, auditoría, queja o incumplimiento.\n\nLa acción preventiva elimina la causa potencial de un problema antes de que ocurra. Por ejemplo, reforzar capacitación al detectar tendencia negativa. Su origen puede ser análisis de riesgos, incidentes u observaciones.\n\nLa acción de mejora optimiza algo que ya funciona bien. Por ejemplo, digitalizar un proceso manual. Su origen son oportunidades identificadas o sugerencias.\n\nEn el sistema:\n\n1. Registra la acción con su origen (accidente, auditoría, etc.).\n2. Clasifica el tipo.\n3. Define responsable y fecha.\n4. Documenta la implementación.\n5. Verifica la eficacia.\n6. Cierra con evidencia.\n\nEl seguimiento es automático con alertas de vencimiento.",
    category: "phva",
    followUp: ["¿Cómo verifico la eficacia?", "¿Cuánto tiempo tengo para cerrar?", "¿Cómo documento las evidencias?"]
  },

  // ============================================================================
  // SECCIÓN 26: TIPS Y MEJORES PRÁCTICAS
  // ============================================================================
  {
    keywords: ["tip", "consejo", "recomendacion", "mejor practica", "como mejorar"],
    question: "¿Cuáles son los tips para usar mejor el sistema?",
    answer: "Aquí tienes los tips para aprovechar SST Colombia al máximo.\n\nPara organización: programa tareas recurrentes como inspecciones y capacitaciones, mantén documentos actualizados con control de versiones, y usa las etiquetas y filtros para organizar información.\n\nPara eficiencia: usa las plantillas predefinidas que ahorran hasta un 70% de tiempo, importa trabajadores masivamente desde Excel, y aprovecha el Asistente Inteligente en IPERC.\n\nPara seguimiento: activa notificaciones por correo, revisa el dashboard semanalmente, y cierra hallazgos a tiempo.\n\nPara colaboración: asigna roles apropiados a cada usuario, documenta todo porque lo que no se documenta no existe, y usa las comunicaciones internas.\n\nPara cumplimiento: haz la autoevaluación trimestral, monitorea indicadores mensualmente, y no dejes la auditoría para el último momento.",
    category: "tips",
    followUp: ["¿Cómo configuro alertas?", "¿Cómo uso las plantillas?", "¿Qué revisar semanalmente?"]
  },
  {
    keywords: ["errores comunes", "error frecuente", "evitar", "problema tipico", "falla comun"],
    question: "¿Cuáles son los errores más comunes y cómo evitarlos?",
    answer: "Estos son los errores frecuentes y cómo evitarlos:\n\n1. No documentar: el error es hacer actividades sin registrar. La solución es documentar todo en el sistema.\n\n2. Matriz IPERC desactualizada: el error es no actualizar al introducir cambios. La solución es revisar IPERC al menos anualmente o ante cambios.\n\n3. Capacitaciones sin evidencia: el error es no guardar listas de asistencia. La solución es usar el registro de asistencia del sistema.\n\n4. Inspecciones sin seguimiento: el error es identificar hallazgos y no cerrarlos. La solución es usar las alertas automáticas de vencimiento.\n\n5. Accidentes sin investigar: el error es solo reportar sin analizar causas. La solución es completar siempre la investigación.\n\n6. No involucrar a la dirección: el error es mantener SST aislado de la gerencia. La solución es hacer la revisión por dirección anual obligatoria.\n\n7. Dejar todo para el final: el error es preparar la auditoría en el último mes. La solución es hacer gestión continua durante todo el año.",
    category: "tips",
    followUp: ["¿Cómo preparo una auditoría exitosa?", "¿Qué hago si tengo muchos hallazgos pendientes?", "¿Cómo involucro a la gerencia?"]
  },
  {
    keywords: ["auditoria exitosa", "preparar auditoria", "pasar auditoria", "aprobar"],
    question: "¿Cómo preparo una auditoría exitosa?",
    answer: "Esta es la guía para una auditoría exitosa.\n\n3 meses antes debes: revisar cumplimiento de estándares mínimos, identificar brechas y priorizar cierre, actualizar IPERC y matriz legal, y verificar documentación vigente.\n\n1 mes antes debes: cerrar hallazgos pendientes de auditorías anteriores, verificar capacitaciones del período, actualizar indicadores, y preparar informe de gestión.\n\n1 semana antes debes: revisar que todo esté en el sistema, preparar resumen ejecutivo, identificar fortalezas a destacar, y organizar evidencias por estándar.\n\nDurante la auditoría debes: acompañar al auditor, mostrar el sistema y sus registros, responder con evidencias y no solo palabras, y tomar nota de observaciones.\n\nDespués de la auditoría debes: analizar hallazgos, crear plan de acción inmediato, comunicar resultados a la dirección, e iniciar mejoras rápidamente.",
    category: "tips",
    followUp: ["¿Qué documentos debo tener listos?", "¿Cómo manejo una no conformidad mayor?", "¿Cada cuánto me auditan?"]
  },

  // ============================================================================
  // SECCIÓN 27: FECHAS IMPORTANTES
  // ============================================================================
  {
    keywords: ["fecha", "plazo", "vencimiento", "cuando", "limite", "ministerio"],
    question: "¿Cuáles son las fechas importantes del Ministerio de Trabajo?",
    answer: "Estas son las fechas clave del calendario SST:\n\nEnero 31: reporte de ausentismo laboral del año anterior, y actualización de IPERC anual.\n\nFebrero 15: entrega de Plan de Trabajo Anual, y conformación o renovación del COPASST si aplica.\n\nMarzo 31: autoevaluación de estándares mínimos, y reporte de accidentalidad del año anterior.\n\nJunio 30: primera revisión semestral de indicadores, y simulacro de evacuación recomendado.\n\nJulio 31: informe de gestión SST del primer semestre, y revisión de cumplimiento de objetivos.\n\nAgosto 15: actualización de matriz legal.\n\nNoviembre 30: planificación del año siguiente, presupuesto SST, y programación de auditoría anual.\n\nEl sistema te alerta automáticamente de estas fechas con 30 días de anticipación.",
    category: "normativa",
    followUp: ["¿Qué reportes entrego al Ministerio?", "¿Cómo configuro las alertas?", "¿Qué pasa si no cumplo los plazos?"]
  },

  // ============================================================================
  // SECCIÓN 28: PORTAL DE EMPLEADOS
  // ============================================================================
  {
    keywords: ["portal empleado", "autoservicio", "consultar datos", "mis datos", "trabajador portal"],
    question: "¿Qué puede hacer un trabajador en su portal?",
    answer: "El Portal de Empleados ofrece autoservicio para los trabajadores.\n\nEn información personal pueden: ver datos básicos registrados, consultar cargo y área asignada, y ver afiliaciones a seguridad social.\n\nEn capacitaciones pueden: ver capacitaciones asignadas, consultar historial de capacitaciones tomadas, y descargar certificados.\n\nEn documentos pueden: consultar EPP asignados, ver exámenes médicos programados, y acceder a documentos compartidos.\n\nEn reportes pueden: reportar condiciones inseguras, reportar incidentes, y enviar sugerencias.\n\nEn comunicaciones pueden: ver comunicados de SST, y confirmar lectura de documentos.\n\nPara el acceso: el administrador crea el acceso, las credenciales se envían por correo, se genera una contraseña temporal para el primer ingreso, y el trabajador puede cambiarla después.",
    category: "portal",
    followUp: ["¿Cómo creo acceso a un trabajador?", "¿Puedo restringir lo que ve?", "¿Cómo recupero la contraseña de un trabajador?"]
  },

  // ============================================================================
  // SECCIÓN 29: SUSTANCIAS QUÍMICAS Y MEDICIONES AMBIENTALES
  // ============================================================================
  {
    keywords: ["quimico", "sustancia", "hoja seguridad", "sds", "msds", "peligroso"],
    question: "¿Cómo gestiono sustancias químicas?",
    answer: "El módulo de Sustancias Químicas incluye varias funcionalidades.\n\nEl inventario de sustancias registra: nombre comercial y químico, número CAS, clasificación SGA con pictogramas, cantidad en inventario, ubicación de almacenamiento, y estado físico.\n\nLa documentación incluye: Hoja de Datos de Seguridad (SDS o MSDS), etiquetas SGA, procedimientos de manejo, y fichas de emergencia.\n\nLos controles registran: EPP requeridos, almacenamiento seguro, incompatibilidades, y límites de exposición.\n\nLas alertas notifican sobre: SDS próximas a vencer (se deben revisar cada 5 años), sustancias sin documentación, y capacitación pendiente de personal expuesto.\n\nLa normativa aplicable incluye el Sistema Globalmente Armonizado (SGA) y el Decreto 1496 de 2018.",
    category: "quimicos",
    followUp: ["¿Dónde consigo las hojas de seguridad?", "¿Cómo capacito al personal?", "¿Qué es el SGA?"]
  },
  {
    keywords: ["medicion", "ambiental", "ruido", "iluminacion", "temperatura", "higiene"],
    question: "¿Cómo registro mediciones ambientales?",
    answer: "El módulo de Mediciones Ambientales controla la exposición ocupacional.\n\nLos tipos de mediciones incluyen: ruido (niveles de presión sonora), iluminación (luxes por área), temperatura (estrés térmico), material particulado (concentración en aire), agentes químicos (según sustancias), y vibraciones (mano-brazo y cuerpo entero).\n\nPara cada medición registra:\n\n1. Tipo de agente medido.\n2. Área o puesto de trabajo.\n3. Valor medido y unidades.\n4. Límite permisible según normativa.\n5. Estado (cumple o no cumple).\n6. Equipo de medición usado.\n7. Certificado de calibración.\n\nLa frecuencia de medición es: inicial al identificar exposición, periódicas según nivel de riesgo (típicamente anual), y post-control después de implementar mejoras.\n\nEl sistema alerta cuando los valores superan los límites permisibles.",
    category: "mediciones",
    followUp: ["¿Cada cuánto debo medir?", "¿Quién hace las mediciones?", "¿Qué hago si supera el límite?"]
  },

  // ============================================================================
  // SECCIÓN 30: RECURSOS Y RESPONSABLES
  // ============================================================================
  {
    keywords: ["recurso", "presupuesto", "inversion", "dinero sst", "asignacion recursos"],
    question: "¿Cómo documento la asignación de recursos SST?",
    answer: "El módulo de Asignación de Recursos cumple con el Estándar 1.1.5.\n\nLos tipos de recursos a documentar son:\n\n1. Financieros: presupuesto anual SST, inversiones en equipos, costos de capacitación, y contratación de servicios.\n\n2. Humanos: tiempo dedicado a SST, personal asignado, y horas de capacitación.\n\n3. Técnicos: equipos de medición, sistemas de información, EPP, y equipos de emergencia.\n\n4. Físicos: espacios para capacitación, consultorio médico, y área de brigada.\n\nEn el sistema puedes:\n\n1. Registrar presupuesto aprobado.\n2. Documentar inversiones realizadas.\n3. Comparar presupuestado versus ejecutado.\n4. Generar informe para revisión por dirección.\n\nLa evidencia requerida incluye el acta de asignación de recursos firmada y la ejecución presupuestal.",
    category: "recursos",
    followUp: ["¿Cuánto debo invertir en SST?", "¿Cómo documento el tiempo dedicado?", "¿Qué incluyo en el presupuesto?"]
  },
  {
    keywords: ["responsable sst", "designacion", "quien encargado", "obligaciones empleador"],
    question: "¿Quién debe ser el responsable del SG-SST?",
    answer: "La designación del responsable cumple con el Estándar 1.1.1.\n\nLos requisitos según el tamaño de la empresa son:\n\nPara microempresas con riesgo I, II o III: puede ser el empleador directamente, o un trabajador con capacitación básica y curso virtual de 50 horas.\n\nPara pequeñas empresas: debe ser un tecnólogo en SST, o un profesional con posgrado en SST, o se puede contratar externamente a alguien con licencia en Salud Ocupacional.\n\nPara medianas y grandes empresas o con riesgo IV o V: debe ser un profesional con licencia en Salud Ocupacional, con dedicación según el tamaño de la empresa, y con curso de 50 horas más actualización.\n\nEn el sistema puedes:\n\n1. Registrar al responsable designado.\n2. Documentar formación (curso 50 horas).\n3. Cargar licencia en SO si aplica.\n4. Generar acta de designación.\n\nEl responsable tiene acceso a todos los módulos del sistema con rol Responsable SST o superior.",
    category: "recursos",
    followUp: ["¿Dónde tomo el curso de 50 horas?", "¿Qué es la licencia en SO?", "¿Puedo contratar externamente?"]
  },

  // ============================================================================
  // SECCIÓN 31: GESTIÓN DE USUARIOS DEL SISTEMA
  // ============================================================================
  {
    keywords: ["usuario", "crear usuario", "nuevo usuario", "agregar usuario", "registrar usuario", "cuenta"],
    question: "¿Cómo creo un nuevo usuario?",
    answer: "Para crear un nuevo usuario en el sistema sigue estos pasos:\n\n1. Ve a Configuración y luego a Usuarios.\n2. Haz clic en el botón Nuevo Usuario.\n3. Completa los campos: nombre de usuario (único), contraseña segura, nombre completo, correo electrónico, y departamento o área.\n4. Selecciona el rol apropiado según las funciones del usuario.\n5. Si eres superadmin, puedes asignar la empresa.\n6. Haz clic en Crear.\n\nLos roles disponibles van desde Trabajador (acceso básico) hasta Superusuario (acceso completo a su empresa). Cada rol tiene permisos específicos para ver y gestionar módulos del sistema.",
    category: "usuarios",
    followUp: ["¿Cuáles son los roles disponibles?", "¿Cómo cambio el rol de un usuario?", "¿Cómo desactivo un usuario?"]
  },
  {
    keywords: ["desactivar usuario", "eliminar usuario", "bloquear usuario", "quitar acceso", "suspender usuario", "borrar usuario"],
    question: "¿Cómo desactivo un usuario?",
    answer: "Para desactivar o eliminar un usuario del sistema sigue estos pasos:\n\n1. Ve a Configuración y luego a Usuarios.\n2. Busca el usuario en la lista.\n3. Haz clic en el botón de acciones (tres puntos o ícono de papelera).\n4. Selecciona Eliminar usuario.\n5. Confirma la acción en el diálogo de confirmación.\n\nImportante: Solo los administradores pueden eliminar usuarios. No puedes eliminar tu propia cuenta ni la de un usuario con rol superior al tuyo. Los registros históricos asociados al usuario se conservan para mantener la trazabilidad del sistema.",
    category: "usuarios",
    followUp: ["¿Cómo creo un nuevo usuario?", "¿Puedo recuperar un usuario eliminado?", "¿Cómo cambio permisos de un usuario?"]
  },
  {
    keywords: ["rol", "roles", "permisos", "privilegios", "acceso", "que puede hacer"],
    question: "¿Cuáles son los roles disponibles?",
    answer: "El sistema tiene 11 roles con diferentes niveles de acceso:\n\n**Roles de Administración:**\n- Superusuario: Acceso completo a todos los módulos de su empresa.\n- Admin: Gestión general del sistema y usuarios.\n\n**Roles SST Especializados:**\n- Responsable SST: Gestiona todo el SG-SST.\n- Coordinador de Salud: Datos médicos y vigilancia epidemiológica.\n- LSO: Licenciado en Salud Ocupacional para firmar documentos.\n- Coordinador SST: Gestión operativa de SST.\n\n**Roles de RRHH:**\n- Coordinador RRHH: Gestión de personal y contratos.\n- Jefe de Personal: Supervisión de trabajadores.\n- Supervisor: Supervisión de área específica.\n\n**Rol Básico:**\n- Trabajador: Acceso al portal de empleados únicamente.\n\nCada rol tiene permisos predefinidos que determinan qué módulos puede ver y qué acciones puede realizar.",
    category: "usuarios",
    followUp: ["¿Cómo cambio el rol de un usuario?", "¿Puedo crear roles personalizados?", "¿Qué permisos tiene cada rol?"]
  },
  {
    keywords: ["cambiar rol", "modificar rol", "editar usuario", "actualizar permisos", "asignar rol"],
    question: "¿Cómo cambio el rol de un usuario?",
    answer: "Para cambiar el rol de un usuario sigue estos pasos:\n\n1. Ve a Configuración y luego a Usuarios.\n2. Busca el usuario que deseas modificar.\n3. Haz clic en el botón Editar (ícono de lápiz).\n4. En el formulario, cambia el campo Rol al nuevo rol deseado.\n5. Verifica que el resto de la información sea correcta.\n6. Haz clic en Actualizar.\n\nImportante: No puedes asignar un rol superior al tuyo propio. Por ejemplo, un Admin no puede crear Superusuarios. Los cambios de rol toman efecto inmediatamente y el usuario verá los nuevos menús y permisos en su próxima navegación.",
    category: "usuarios",
    followUp: ["¿Cuáles son los roles disponibles?", "¿Cómo creo un nuevo usuario?", "¿Qué pasa si cambio el rol de alguien?"]
  },
  {
    keywords: ["varias empresas", "multiple empresa", "dos empresas", "cambiar empresa", "asignar empresa", "usuario empresa"],
    question: "¿Puede un usuario estar en varias empresas?",
    answer: "Actualmente, cada usuario está asignado a una sola empresa en el sistema.\n\nCada usuario tiene un campo companyId que lo vincula a una empresa específica. Esto garantiza el aislamiento de datos entre empresas (multi-tenant).\n\nSi necesitas que una persona acceda a varias empresas, las opciones son:\n\n1. Crear cuentas de usuario separadas para cada empresa.\n2. Usar el rol Superadmin (solo para el proveedor del SaaS) que puede ver todas las empresas.\n\nEsta restricción existe por razones de seguridad y cumplimiento con la Ley 1581 de Protección de Datos, ya que cada empresa debe mantener el control de quién accede a su información.",
    category: "usuarios",
    followUp: ["¿Cómo creo un nuevo usuario?", "¿Qué es el rol Superadmin?", "¿Cómo cambio la empresa de un usuario?"]
  },
  {
    keywords: ["contraseña", "password", "olvidar contraseña", "recuperar contraseña", "restablecer contraseña", "cambiar contraseña"],
    question: "¿Cómo restablezco la contraseña de un usuario?",
    answer: "Para restablecer la contraseña de un usuario sigue estos pasos:\n\n1. Ve a Configuración y luego a Usuarios.\n2. Busca el usuario que necesita cambiar su contraseña.\n3. Haz clic en Editar (ícono de lápiz).\n4. En el campo Contraseña, ingresa la nueva contraseña.\n5. Haz clic en Actualizar.\n\nLa nueva contraseña debe tener al menos 6 caracteres. Se recomienda usar una combinación de letras, números y símbolos para mayor seguridad.\n\nImportante: Comunica la nueva contraseña al usuario de forma segura. El usuario podrá cambiarla después desde su perfil.",
    category: "usuarios",
    followUp: ["¿Cómo creo un nuevo usuario?", "¿Cuáles son los requisitos de contraseña?", "¿El usuario puede cambiar su propia contraseña?"]
  },
  {
    keywords: ["recuperar usuario", "restaurar usuario", "usuario eliminado", "deshacer eliminacion", "volver usuario"],
    question: "¿Puedo recuperar un usuario eliminado?",
    answer: "Actualmente, el sistema no permite recuperar usuarios eliminados de forma automática.\n\nCuando eliminas un usuario:\n\n1. El acceso del usuario se revoca inmediatamente.\n2. Los registros históricos asociados al usuario se conservan (capacitaciones, inspecciones, etc.) para mantener la trazabilidad.\n3. La cuenta de usuario se elimina permanentemente.\n\nPara restaurar el acceso de una persona:\n\n1. Crea un nuevo usuario con los mismos datos.\n2. Asigna el rol correspondiente.\n3. Comunica las nuevas credenciales al usuario.\n\nRecomendación: Si solo necesitas suspender temporalmente el acceso, considera cambiar la contraseña del usuario en lugar de eliminarlo, o contacta al administrador para desactivar la cuenta sin eliminarla.",
    category: "usuarios",
    followUp: ["¿Cómo creo un nuevo usuario?", "¿Cómo desactivo un usuario?", "¿Cómo cambio permisos de un usuario?"]
  },
  {
    keywords: ["cambiar permiso", "modificar permiso", "editar permiso", "actualizar permiso", "permisos usuario", "asignar permiso"],
    question: "¿Cómo cambio permisos de un usuario?",
    answer: "Los permisos en el sistema están asociados al rol del usuario. Para cambiar los permisos de un usuario sigue estos pasos:\n\n1. Ve a Configuración y luego a Usuarios.\n2. Busca el usuario que deseas modificar.\n3. Haz clic en el botón Editar (ícono de lápiz).\n4. Cambia el campo Rol al que tenga los permisos que necesitas.\n5. Haz clic en Actualizar.\n\nCada rol tiene permisos predefinidos:\n\n- Trabajador: Solo acceso al portal de empleados.\n- Supervisor: Inspecciones y capacitaciones de su área.\n- Coordinador SST: Gestión operativa de SST.\n- Admin: Gestión completa de usuarios y configuración.\n- Superusuario: Acceso total a todos los módulos de su empresa.\n\nNota: No es posible crear permisos personalizados. Debes seleccionar el rol que mejor se ajuste a las necesidades del usuario.",
    category: "usuarios",
    followUp: ["¿Cuáles son los roles disponibles?", "¿Qué permisos tiene cada rol?", "¿Cómo creo un nuevo usuario?"]
  }
];

export const quickQuestions = [
  { text: "Tutorial visual: ¿Cómo usar SST Colombia paso a paso?", category: "tutorial" },
  { text: "¿Qué es la Evaluación Inicial?", category: "tutorial" },
  { text: "¿Cómo empiezo a usar el sistema?", category: "inicio" },
  { text: "¿Qué es el ciclo PHVA?", category: "phva" },
  { text: "¿Qué incluye la fase PLANEAR?", category: "phva" },
  { text: "¿Qué incluye la fase HACER?", category: "phva" },
  { text: "¿Qué incluye la fase VERIFICAR?", category: "phva" },
  { text: "¿Qué incluye la fase ACTUAR?", category: "phva" },
  { text: "¿Cómo registro trabajadores?", category: "trabajadores" },
  { text: "¿Cómo reporto un accidente?", category: "accidentes" },
  { text: "¿Cómo gestiono capacitaciones?", category: "capacitaciones" },
  { text: "¿Cómo realizo inspecciones?", category: "inspecciones" },
  { text: "¿Qué es la Resolución 0312?", category: "normativa" },
  { text: "¿Cómo uso el módulo IPERC?", category: "iperc" },
  { text: "¿Cómo gestiono el COPASST?", category: "hacer" },
  { text: "¿Cómo gestiono los EPP?", category: "hacer" },
  { text: "¿Cómo creo un nuevo usuario?", category: "usuarios" },
  { text: "¿Cómo desactivo un usuario?", category: "usuarios" },
  { text: "¿Cuáles son los roles disponibles?", category: "usuarios" },
];

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, "")
    .trim();
}

function getStemmedWord(word: string): string {
  const normalizedWord = normalizeText(word);
  const suffixes = ["cion", "iones", "ando", "iendo", "ado", "ido", "ar", "er", "ir", "es", "s"];
  for (const suffix of suffixes) {
    if (normalizedWord.length > suffix.length + 3 && normalizedWord.endsWith(suffix)) {
      return normalizedWord.slice(0, -suffix.length);
    }
  }
  return normalizedWord;
}

function calculateSimilarity(str1: string, str2: string): number {
  const s1 = normalizeText(str1);
  const s2 = normalizeText(str2);
  
  if (s1 === s2) return 1;
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;
  
  const stem1 = getStemmedWord(s1);
  const stem2 = getStemmedWord(s2);
  if (stem1 === stem2) return 0.7;
  if (stem1.includes(stem2) || stem2.includes(stem1)) return 0.6;
  
  if (s1.length >= 3 && s2.length >= 3) {
    const minLen = Math.min(s1.length, s2.length);
    const prefix = Math.min(3, Math.floor(minLen * 0.7));
    if (s1.slice(0, prefix) === s2.slice(0, prefix)) {
      return 0.5;
    }
  }
  
  return 0;
}

export function findBestMatch(query: string): KnowledgeItem | null {
  const normalizedQuery = normalizeText(query);
  const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 2);
  
  if (queryWords.length === 0) return null;
  
  let bestMatch: KnowledgeItem | null = null;
  let bestScore = 0;
  
  for (const item of knowledgeBase) {
    let score = 0;
    
    for (const queryWord of queryWords) {
      for (const keyword of item.keywords) {
        const similarity = calculateSimilarity(queryWord, keyword);
        if (similarity > 0.5) {
          score += similarity;
        }
      }
      
      const questionSimilarity = calculateSimilarity(queryWord, item.question);
      if (questionSimilarity > 0.3) {
        score += questionSimilarity * 0.5;
      }
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }
  
  return bestScore > 0.5 ? bestMatch : null;
}

export function getRelatedQuestions(category: string): string[] {
  return knowledgeBase
    .filter(item => item.category === category)
    .slice(0, 3)
    .map(item => item.question);
}

export function getDefaultResponse(): string {
  return "No encontré una respuesta exacta a tu pregunta. " +
    "¿Sobre cuál tema te gustaría saber más?";
}
