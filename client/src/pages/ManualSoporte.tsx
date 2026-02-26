import { useState, type ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  Eye,
  EyeOff,
  RotateCcw,
  Printer,
  Search,
  Shield,
  PhoneOff,
  FileText,
  Users,
  ClipboardList,
  HardHat,
  Car,
  ChevronDown,
  ChevronRight,
  Copy,
} from "lucide-react";

const ESTADOS = [
  { value: "abierto", label: "Abierto", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", descripcion: "El cliente acaba de crear el ticket. Nadie lo ha revisado." },
  { value: "en_revision", label: "En Revisión", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", descripcion: "Un agente está analizando el problema." },
  { value: "en_progreso", label: "En Progreso", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200", descripcion: "Se está trabajando activamente en la solución." },
  { value: "pendiente_cliente", label: "Pendiente Cliente", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200", descripcion: "Se envió respuesta al cliente. Esperando su confirmación." },
  { value: "resuelto", label: "Resuelto", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", descripcion: "El problema fue solucionado." },
  { value: "cerrado", label: "Cerrado", color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200", descripcion: "Caso finalizado. No requiere más acción." },
];

const PRIORIDADES = [
  { value: "baja", label: "Baja", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300", tiempo: "72 horas", descripcion: "Consultas generales, dudas de uso." },
  { value: "media", label: "Media", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-300", tiempo: "48 horas", descripcion: "Problemas que no bloquean el trabajo." },
  { value: "alta", label: "Alta", color: "bg-orange-100 text-orange-700 dark:bg-orange-800 dark:text-orange-300", tiempo: "24 horas", descripcion: "Funcionalidades importantes no disponibles." },
  { value: "critica", label: "Crítica", color: "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300", tiempo: "4 horas", descripcion: "Sistema caído o pérdida de datos. Atención inmediata." },
];

const PROTOCOLO_NO_CONTACTO = [
  {
    situacion: "Cliente pide una llamada telefónica",
    respuesta: "Hola [Nombre]. Agradecemos su confianza. Nuestro servicio de soporte opera exclusivamente por este canal de tickets para garantizar trazabilidad, calidad y cumplimiento normativo. Por favor descríbanos detalladamente su consulta aquí y le responderemos en el menor tiempo posible con instrucciones paso a paso.",
  },
  {
    situacion: "Cliente pide reunión virtual (Zoom, Meet, Teams)",
    respuesta: "Hola [Nombre]. Entendemos que algunas situaciones pueden parecer complejas. Sin embargo, nuestro modelo de soporte está diseñado para que usted reciba instrucciones escritas claras y paso a paso, que puede seguir a su ritmo y consultar en cualquier momento. Esto también nos permite mantener un registro completo de cada solución. Por favor cuéntenos su duda y la resolveremos por este medio.",
  },
  {
    situacion: "Cliente pide acceso remoto a su computador",
    respuesta: "Hola [Nombre]. Por seguridad de sus datos y cumplimiento de la Ley 1581/2012 de Protección de Datos, no realizamos acceso remoto a equipos de nuestros clientes. Le proporcionaremos instrucciones detalladas para que usted mismo resuelva la situación. Si el problema es técnico del sistema, nuestro equipo interno lo investigará directamente en la plataforma.",
  },
  {
    situacion: "Cliente insiste en hablar con alguien",
    respuesta: "Hola [Nombre]. Comprendemos su urgencia. Le aseguramos que este canal de tickets es la vía más rápida y efectiva para resolver su caso, ya que nos permite asignar al especialista adecuado y hacer seguimiento. Si su caso requiere atención prioritaria, podemos escalarlo a prioridad Alta para una respuesta más rápida. ¿Desea que lo hagamos?",
  },
  {
    situacion: "Cliente quiere que le hagan el trabajo en el sistema",
    respuesta: "Hola [Nombre]. Nuestro sistema es una plataforma automatizada en la nube donde cada empresa gestiona su propia información. Por el modelo de servicio y cumplimiento normativo colombiano, no ingresamos datos en nombre de los clientes. Le enviaremos instrucciones detalladas paso a paso para que pueda realizarlo fácilmente. ¿En qué módulo específico necesita ayuda?",
  },
];

const MODULOS_SST = [
  {
    modulo: "Trabajadores",
    ruta: "Hacer > Trabajadores",
    descripcion: "Registro y gestión de empleados, datos personales, cargo, área, tipo de contrato.",
    preguntasFrecuentes: [
      { pregunta: "No puede registrar un trabajador", respuesta: "Vaya a Hacer > Trabajadores > botón 'Nuevo Trabajador'. Complete todos los campos obligatorios (marcados con *): Nombre completo, Tipo y Número de documento, Cargo y Área. Si aparece un error de límite, verifique su plan en Configuración > Mi Suscripción." },
      { pregunta: "Quiere importar trabajadores masivamente", respuesta: "En Hacer > Trabajadores, busque el botón 'Importar Excel'. Descargue primero la plantilla Excel de ejemplo, llénela con los datos de sus trabajadores y súbala. El sistema acepta variaciones en los nombres de campos (con/sin tildes, mayúsculas/minúsculas)." },
      { pregunta: "No encuentra un trabajador registrado", respuesta: "En Hacer > Trabajadores, use la barra de búsqueda para buscar por nombre o número de documento. Verifique que no haya filtros activos que oculten registros." },
    ],
  },
  {
    modulo: "Capacitaciones",
    ruta: "Hacer > Capacitaciones",
    descripcion: "Programación y registro de capacitaciones SST, control de asistencia.",
    preguntasFrecuentes: [
      { pregunta: "Cómo registrar una capacitación", respuesta: "Vaya a Hacer > Capacitaciones > 'Nueva Capacitación'. Complete: Tema, Fecha, Duración, Instructor y seleccione los asistentes de la lista de trabajadores. Puede adjuntar evidencia fotográfica." },
      { pregunta: "Cómo registrar asistencia", respuesta: "Abra la capacitación y en la sección de Asistentes, marque la casilla de cada trabajador que asistió. Puede agregar más asistentes con el botón 'Agregar Asistente'." },
      { pregunta: "Qué capacitaciones son obligatorias", respuesta: "Según la Resolución 0312/2019, son obligatorias: Inducción y reinducción en SST (std-1.2.2), Programa de capacitación anual (std-1.2.1), y el Curso virtual de 50 horas (std-1.2.3). El sistema las muestra en la evaluación de estándares." },
    ],
  },
  {
    modulo: "Evaluación de Estándares SST",
    ruta: "Verificar > Evaluaciones SST",
    descripcion: "Evaluación de cumplimiento según Resolución 0312/2019. Califica los estándares aplicables según el tamaño de la empresa.",
    preguntasFrecuentes: [
      { pregunta: "Cuántos estándares me aplican", respuesta: "Depende del tamaño de su empresa: Microempresa (≤10 trabajadores, Riesgo I-III) = 7 estándares. Pequeña empresa (11-50, Riesgo I-III) = 21 estándares. Mediana/Grande (>50 o Riesgo IV-V) = 61 estándares. El sistema lo calcula automáticamente según sus datos." },
      { pregunta: "Cómo calificar un estándar", respuesta: "En la evaluación, cada estándar tiene opciones: 'Cumple', 'No Cumple' o 'No Aplica'. Marque la opción correspondiente. El sistema calcula automáticamente el puntaje por componente y el total." },
      { pregunta: "Cómo generar el PDF del Ministerio", respuesta: "Abra la evaluación SST y busque el botón 'PDF Ministerio del Trabajo'. Se generará un informe completo con secciones A-I incluyendo el Hilo Dorado de trazabilidad." },
    ],
  },
  {
    modulo: "Inspecciones de Seguridad",
    ruta: "Hacer > Inspecciones",
    descripcion: "Registro de inspecciones de seguridad en el lugar de trabajo.",
    preguntasFrecuentes: [
      { pregunta: "Cómo crear una inspección", respuesta: "Vaya a Hacer > Inspecciones > 'Nueva Inspección'. Seleccione el tipo de inspección, la fecha, el área inspeccionada y el inspector. Complete los hallazgos encontrados con su nivel de riesgo." },
      { pregunta: "Qué tipos de inspección hay", respuesta: "El sistema soporta: Inspección general de seguridad, Inspección de EPP, Inspección de orden y aseo, Inspección de extintores, e Inspección de botiquines. Cada una tiene su formato específico." },
    ],
  },
  {
    modulo: "Accidentes e Incidentes",
    ruta: "Hacer > Accidentes",
    descripcion: "Registro y gestión de accidentes de trabajo, incidentes y enfermedades laborales.",
    preguntasFrecuentes: [
      { pregunta: "Cómo registrar un accidente", respuesta: "Vaya a Hacer > Accidentes > 'Nuevo Registro'. Seleccione el tipo (Accidente de Trabajo, Incidente, Enfermedad Laboral), la fecha, el trabajador afectado, la descripción detallada y las medidas tomadas." },
      { pregunta: "Cómo hacer la investigación del accidente", respuesta: "Abra el accidente registrado y busque la sección de Investigación. Agregue participantes de la investigación, registre los hallazgos, las causas raíz y las acciones correctivas." },
    ],
  },
  {
    modulo: "Exámenes Médicos",
    ruta: "Hacer > Exámenes Médicos",
    descripcion: "Control de exámenes médicos ocupacionales (ingreso, periódicos, egreso).",
    preguntasFrecuentes: [
      { pregunta: "Cómo registrar un examen médico", respuesta: "Vaya a Hacer > Exámenes Médicos > 'Nuevo Examen'. Seleccione el trabajador, el tipo de examen (Ingreso, Periódico, Egreso, Post-incapacidad), la fecha, el concepto médico y puede adjuntar el certificado." },
      { pregunta: "Cómo ver exámenes próximos a vencer", respuesta: "El sistema envía alertas automáticas cuando los exámenes periódicos están próximos a vencer. También puede ver el listado completo en Hacer > Exámenes Médicos y ordenar por fecha de vencimiento." },
    ],
  },
  {
    modulo: "Entrega de EPP",
    ruta: "Hacer > Entrega EPP",
    descripcion: "Registro de entrega de Elementos de Protección Personal.",
    preguntasFrecuentes: [
      { pregunta: "Cómo registrar entrega de EPP", respuesta: "Vaya a Hacer > Entrega EPP > 'Nueva Entrega'. Seleccione el trabajador, los elementos entregados del catálogo (77 elementos disponibles), cantidad, fecha de entrega y fecha de reposición estimada." },
    ],
  },
  {
    modulo: "Plan de Trabajo Anual",
    ruta: "Planear > Plan de Trabajo Anual",
    descripcion: "Cronograma anual de actividades SST con seguimiento mensual.",
    preguntasFrecuentes: [
      { pregunta: "Cómo crear el plan anual", respuesta: "Vaya a Planear > Plan de Trabajo Anual > 'Nuevo Plan'. Defina el año, y agregue actividades con su programa, responsable, mes programado y recursos necesarios. Las actividades se pueden vincular a acciones del Plan de Mejora." },
      { pregunta: "Cómo marcar una actividad como completada", respuesta: "En el detalle del plan, cada actividad tiene un toggle para marcarla como completada. Al completarla, si está vinculada a una acción de mejora, el porcentaje de avance se recalcula automáticamente." },
    ],
  },
  {
    modulo: "Matriz IPERC",
    ruta: "Planear > Matriz IPERC",
    descripcion: "Identificación de Peligros, Evaluación y Control de Riesgos (GTC 45).",
    preguntasFrecuentes: [
      { pregunta: "Cómo crear la matriz de riesgos", respuesta: "Vaya a Planear > Matriz IPERC. Agregue los procesos/actividades de su empresa, identifique los peligros asociados, evalúe el nivel de riesgo y defina los controles (eliminación, sustitución, ingeniería, administrativos, EPP)." },
    ],
  },
  {
    modulo: "Indicadores de Accidentalidad",
    ruta: "Verificar > Indicadores",
    descripcion: "Indicadores obligatorios: Frecuencia, Severidad, Mortalidad, Prevalencia, Incidencia, Ausentismo.",
    preguntasFrecuentes: [
      { pregunta: "Cómo se calculan los indicadores", respuesta: "Los indicadores se calculan automáticamente basados en los accidentes y enfermedades registrados. El sistema usa las fórmulas establecidas por la normativa colombiana. Vaya a Verificar > Indicadores para ver los valores actualizados." },
    ],
  },
  {
    modulo: "Objetivos SST",
    ruta: "Planear > Objetivos SST",
    descripcion: "Definición y seguimiento de objetivos del SG-SST con vinculación a estándares.",
    preguntasFrecuentes: [
      { pregunta: "Cómo vincular objetivos con estándares", respuesta: "Al crear o editar un objetivo SST, encontrará una sección para vincular con estándares de la Resolución 0312. Esto permite trazar el cumplimiento de cada objetivo con los requisitos normativos." },
    ],
  },
  {
    modulo: "Matriz Legal",
    ruta: "Planear > Matriz Legal",
    descripcion: "Gestión de requisitos legales aplicables y su cumplimiento.",
    preguntasFrecuentes: [
      { pregunta: "Cómo agregar un requisito legal", respuesta: "Vaya a Planear > Matriz Legal > 'Nuevo Requisito'. Complete la norma, artículo, tema, obligación, responsable de cumplimiento y estado de cumplimiento. El sistema permite hacer seguimiento periódico." },
    ],
  },
  {
    modulo: "Plan de Emergencias",
    ruta: "Hacer > Plan de Emergencias",
    descripcion: "Plan de prevención, preparación y respuesta ante emergencias.",
    preguntasFrecuentes: [
      { pregunta: "Qué incluye el plan de emergencias", respuesta: "El módulo permite registrar: análisis de amenazas y vulnerabilidad, conformación de brigadas, procedimientos de evacuación, directorio de emergencias y registro de simulacros." },
    ],
  },
  {
    modulo: "Auditorías Internas",
    ruta: "Verificar > Auditorías Internas",
    descripcion: "Auditorías internas del SG-SST con formularios inteligentes.",
    preguntasFrecuentes: [
      { pregunta: "Cómo crear una auditoría", respuesta: "Vaya a Verificar > Auditorías Internas > 'Nueva Auditoría'. El sistema tiene formularios inteligentes que pre-cargan criterios basados en los estándares aplicables a su empresa." },
    ],
  },
  {
    modulo: "Revisión por la Dirección",
    ruta: "Actuar > Revisión por la Dirección",
    descripcion: "Revisión anual del SG-SST por la alta dirección.",
    preguntasFrecuentes: [
      { pregunta: "Qué debe incluir la revisión", respuesta: "La revisión por la dirección debe incluir: resultados de auditorías, indicadores, estado de acciones correctivas, cambios relevantes, y conclusiones con compromisos. El sistema genera el formato automáticamente." },
    ],
  },
  {
    modulo: "Plan de Mejoramiento",
    ruta: "Actuar > Mejora Continua",
    descripcion: "Acciones preventivas, correctivas y de mejora del SG-SST.",
    preguntasFrecuentes: [
      { pregunta: "Cómo crear una acción de mejora", respuesta: "Vaya a Actuar > Mejora Continua > 'Nueva Acción'. Defina el tipo (Preventiva, Correctiva, Mejora), la descripción, el responsable, la fecha límite y el componente SST relacionado. Las actividades del Plan de Trabajo pueden vincularse para seguimiento automático del avance." },
    ],
  },
  {
    modulo: "COPASST / Vigía",
    ruta: "Hacer > COPASST",
    descripcion: "Comité Paritario o Vigía de Seguridad y Salud en el Trabajo.",
    preguntasFrecuentes: [
      { pregunta: "Diferencia entre COPASST y Vigía", respuesta: "Empresas con menos de 10 trabajadores designan un Vigía de SST. Empresas con 10 o más trabajadores deben conformar el COPASST con representantes del empleador y los trabajadores. El sistema se adapta según el número de trabajadores registrados." },
    ],
  },
  {
    modulo: "Gestión del Cambio",
    ruta: "Planear > Gestión del Cambio",
    descripcion: "Registro y evaluación de cambios que puedan afectar la SST.",
    preguntasFrecuentes: [
      { pregunta: "Cuándo registrar un cambio", respuesta: "Registre cambios cuando haya: nuevos procesos, nuevos equipos, cambios en instalaciones, cambios en personal clave, cambios en materiales/sustancias, o cambios normativos que afecten la SST de la empresa." },
    ],
  },
  {
    modulo: "Comunicación SST",
    ruta: "Planear > Comunicación SST",
    descripcion: "Gestión de comunicaciones internas y externas sobre SST.",
    preguntasFrecuentes: [
      { pregunta: "Qué comunicaciones debo registrar", respuesta: "Registre todas las comunicaciones relevantes de SST: políticas, cambios normativos, alertas de seguridad, resultados de investigaciones, convocatorias a capacitaciones. Esto cumple con el estándar 2.8.1 de la Resolución 0312." },
    ],
  },
  {
    modulo: "Mi Cuenta / Suscripción",
    ruta: "Configuración > Mi Suscripción",
    descripcion: "Gestión de plan, facturación y configuración de la empresa.",
    preguntasFrecuentes: [
      { pregunta: "Cómo cambiar de plan", respuesta: "Vaya a Configuración > Mi Suscripción. Allí verá su plan actual y las opciones disponibles. Al cambiar datos como número de trabajadores o vehículos, el precio se recalcula automáticamente." },
      { pregunta: "Cómo ver facturas", respuesta: "En Configuración > Mi Suscripción > Dashboard de Facturación encontrará el historial completo de facturas, próxima fecha de cobro y método de pago." },
      { pregunta: "Cómo agregar usuarios", respuesta: "Vaya a Configuración > Usuarios > 'Nuevo Usuario'. Cada rol administrativo incluye un usuario sin costo adicional. Los roles disponibles son: Admin, Coordinador SST, Supervisor, y otros según su plan." },
    ],
  },
];

const PASOS_PESV = [
  { codigo: "P01", nombre: "Equipo de Trabajo", descripcion: "Conformación del comité de seguridad vial. En el sistema: PESV > Comité.", respuesta: "Para conformar el comité PESV, vaya a PESV > Comité > 'Nuevo Integrante'. Agregue los miembros del comité de seguridad vial con su rol, cargo y datos de contacto." },
  { codigo: "P02", nombre: "Liderazgo y Compromiso", descripcion: "Política de seguridad vial y compromiso de la dirección. En el sistema: PESV > Liderazgo.", respuesta: "Para registrar la política de seguridad vial, vaya a PESV > Liderazgo. Allí puede documentar la política, los compromisos de la dirección y la asignación de recursos para el PESV." },
  { codigo: "P03", nombre: "Diagnóstico / Contexto", descripcion: "Análisis del contexto organizacional en seguridad vial. En el sistema: PESV > Contexto Organizacional.", respuesta: "Para realizar el diagnóstico PESV, vaya a PESV > Contexto Organizacional. Complete la información sobre la empresa, sus operaciones vehiculares, rutas principales y exposición al riesgo vial." },
  { codigo: "P04", nombre: "Evaluación de Riesgos Viales", descripcion: "Identificación y evaluación de riesgos viales. En el sistema: PESV > Matriz de Riesgos.", respuesta: "Para la matriz de riesgos viales, vaya a PESV > Matriz de Riesgos. Identifique los peligros viales (factor humano, vehículo, infraestructura, condiciones ambientales) y evalúe el nivel de riesgo." },
  { codigo: "P05", nombre: "Objetivos e Indicadores", descripcion: "Definición de metas medibles en seguridad vial. En el sistema: PESV > Indicadores.", respuesta: "Para definir objetivos e indicadores PESV, vaya a PESV > Indicadores. Establezca metas medibles de reducción de siniestralidad, frecuencia de inspecciones y cumplimiento de capacitaciones viales." },
  { codigo: "P06", nombre: "Programas y Planes", descripcion: "Factores de desempeño del PESV. En el sistema: PESV > Factores de Desempeño.", respuesta: "Para los programas y factores de desempeño, vaya a PESV > Factores de Desempeño. Configure los programas de gestión de velocidad, uso de elementos de seguridad, mantenimiento preventivo y otros." },
  { codigo: "P07", nombre: "Roles y Responsabilidades", descripcion: "Asignación de funciones en seguridad vial. En el sistema: PESV > Liderazgo.", respuesta: "Los roles y responsabilidades se gestionan en PESV > Liderazgo, junto con el compromiso directivo. Defina quién es responsable de cada aspecto del plan de seguridad vial." },
  { codigo: "P08", nombre: "Recursos", descripcion: "Asignación de presupuesto y recursos. En el sistema: PESV > Liderazgo.", respuesta: "La asignación de recursos se documenta en PESV > Liderazgo. Registre el presupuesto, equipos y personal asignado para la implementación del PESV." },
  { codigo: "H01", nombre: "Factor Humano - Conductores", descripcion: "Gestión de conductores y requisitos. En el sistema: PESV > Conductores.", respuesta: "Para gestionar conductores, vaya a PESV > Conductores. Registre los datos del conductor, categoría de licencia, fecha de vencimiento, exámenes médicos y evaluaciones de conducción." },
  { codigo: "H02", nombre: "Capacitación Vial", descripcion: "Plan de formación en seguridad vial. En el sistema: PESV > Capacitaciones.", respuesta: "Para registrar capacitaciones viales, vaya a PESV > Capacitaciones. Cree eventos de capacitación específicos de seguridad vial (manejo defensivo, normativa de tránsito, primeros auxilios viales) y registre asistencia." },
  { codigo: "H03", nombre: "Documentación de Conductores", descripcion: "Control documental de licencias y certificaciones. En el sistema: PESV > Conductores.", respuesta: "La documentación de conductores se gestiona en PESV > Conductores. Para cada conductor puede registrar y hacer seguimiento de licencia, certificaciones, exámenes y sanciones." },
  { codigo: "H04", nombre: "Vehículos Seguros", descripcion: "Gestión de la flota vehicular. En el sistema: PESV > Vehículos.", respuesta: "Para gestionar la flota, vaya a PESV > Vehículos. Registre cada vehículo con: placa, marca, modelo, año, tipo, SOAT, revisión tecnomecánica y estado general." },
  { codigo: "H05", nombre: "Mantenimiento Preventivo", descripcion: "Plan de mantenimiento de vehículos. En el sistema: PESV > Vehículos > Mantenimiento.", respuesta: "Para registrar mantenimientos, vaya a PESV > Vehículos, seleccione un vehículo y registre los mantenimientos preventivos y correctivos realizados con fecha, tipo, repuestos y observaciones." },
  { codigo: "H06", nombre: "Inspecciones Preoperacionales", descripcion: "Chequeos diarios antes de operar vehículos. En el sistema: PESV > Inspecciones.", respuesta: "Para las inspecciones preoperacionales, vaya a PESV > Inspecciones > 'Nueva Inspección'. Seleccione el vehículo, el conductor, y complete la lista de verificación (frenos, luces, llantas, documentos, etc.)." },
  { codigo: "H07", nombre: "Gestión de Velocidad", descripcion: "Monitoreo y control de velocidad. En el sistema: PESV > Monitoreo GPS.", respuesta: "El monitoreo de velocidad se encuentra en PESV > Monitoreo GPS. Si su empresa cuenta con dispositivos GPS, puede integrar los datos para seguimiento de velocidad y alertas." },
  { codigo: "H08", nombre: "Rutas Seguras", descripcion: "Análisis de rutas y planificación de recorridos. En el sistema: PESV > Rutas Seguras.", respuesta: "Para gestionar rutas, vaya a PESV > Rutas Seguras. Registre las rutas principales de la empresa con: origen, destino, distancia, tiempo estimado, puntos críticos y medidas de control." },
  { codigo: "H09", nombre: "Fatiga y Somnolencia", descripcion: "Control de fatiga en conductores. En el sistema: evaluación del paso en PESV.", respuesta: "El control de fatiga se documenta en la evaluación PESV paso H09. Registre las medidas implementadas: control de jornadas, pausas activas, programas de descanso y monitoreo de signos de fatiga." },
  { codigo: "H10", nombre: "Sustancias Psicoactivas", descripcion: "Política de alcohol y drogas. En el sistema: evaluación del paso en PESV.", respuesta: "La política de alcohol y drogas se documenta en la evaluación PESV paso H10. Registre: política escrita, pruebas realizadas, programas de prevención y procedimientos ante casos positivos." },
  { codigo: "H11", nombre: "Atención a Víctimas", descripcion: "Protocolo de atención a víctimas de siniestros. En el sistema: evaluación del paso en PESV.", respuesta: "El protocolo de atención se documenta en la evaluación PESV paso H11. Incluya: protocolo de primeros auxilios, directorio de emergencias viales, procedimiento de reporte y acompañamiento a víctimas." },
  { codigo: "V01", nombre: "Indicadores de Gestión", descripcion: "Medición del desempeño del PESV. En el sistema: PESV > Indicadores.", respuesta: "Los indicadores de gestión PESV se consultan en PESV > Indicadores. El sistema calcula automáticamente indicadores como: tasa de siniestralidad, cumplimiento de inspecciones, cobertura de capacitaciones viales." },
  { codigo: "V02", nombre: "Registro y Análisis de Siniestros", descripcion: "Reporte de accidentes viales. En el sistema: PESV > Siniestros.", respuesta: "Para registrar un siniestro vial, vaya a PESV > Siniestros > 'Nuevo Siniestro'. Complete: fecha, ubicación, tipo de siniestro, vehículo involucrado, conductor, daños, lesiones y causa probable." },
  { codigo: "V03", nombre: "Auditorías PESV", descripcion: "Auditoría interna del PESV. En el sistema: PESV > Auditorías.", respuesta: "Para crear una auditoría PESV, vaya a PESV > Auditorías > 'Nueva Auditoría'. El sistema permite evaluar cada paso del PESV y registrar hallazgos, no conformidades y oportunidades de mejora." },
  { codigo: "A01", nombre: "Mejora Continua PESV", descripcion: "Acciones de mejora del PESV. En el sistema: PESV > Mejora Continua.", respuesta: "Para registrar acciones de mejora PESV, vaya a PESV > Mejora Continua > 'Nueva Acción'. Defina el tipo (Preventiva, Correctiva, Mejora), la descripción, el responsable y la fecha límite." },
  { codigo: "A02", nombre: "Revisión por la Dirección PESV", descripcion: "Revisión gerencial del PESV. En el sistema: PESV > Revisión por la Dirección.", respuesta: "Para la revisión por la dirección del PESV, vaya a PESV > Revisión por la Dirección > 'Nueva Revisión'. Complete el análisis de resultados, conclusiones y compromisos de la alta dirección." },
];

const ESTANDARES_RESUMEN = [
  { rango: "1.1.1 - 1.1.8", componente: "Recursos", descripcion: "Responsable SST, recursos, afiliaciones, alto riesgo, COPASST/Vigía, Comité Convivencia.", modulo: "Planear > Recursos / Hacer > COPASST" },
  { rango: "1.2.1 - 1.2.3", componente: "Recursos (Capacitación)", descripcion: "Programa de capacitación anual, inducción/reinducción, Curso 50 horas.", modulo: "Hacer > Capacitaciones" },
  { rango: "2.1.1 - 2.11.1", componente: "Gestión Integral", descripcion: "Política SST, objetivos, evaluación inicial, plan de trabajo, archivo documental, rendición de cuentas, matriz legal, comunicación, adquisiciones, proveedores, gestión del cambio.", modulo: "Planear (varios sub-módulos)" },
  { rango: "3.1.1 - 3.1.9", componente: "Gestión de la Salud", descripcion: "Exámenes médicos, perfil sociodemográfico, estilos de vida, manejo químico, agua potable, residuos.", modulo: "Hacer > Exámenes Médicos / Vigilancia Epidemiológica" },
  { rango: "3.2.1 - 3.2.3", componente: "Gestión de la Salud (Reporte)", descripcion: "Reporte de accidentes, investigación de incidentes, registro estadístico.", modulo: "Hacer > Accidentes" },
  { rango: "3.3.1 - 3.3.6", componente: "Gestión de la Salud (Indicadores)", descripcion: "Frecuencia, severidad, mortalidad, prevalencia, incidencia, ausentismo.", modulo: "Verificar > Indicadores" },
  { rango: "4.1.1 - 4.1.4", componente: "Peligros y Riesgos (Identificación)", descripcion: "Metodología IPERC, participación trabajadores, sustancias químicas, mediciones ambientales.", modulo: "Planear > Matriz IPERC / Sustancias Químicas" },
  { rango: "4.2.1 - 4.2.6", componente: "Peligros y Riesgos (Control)", descripcion: "Jerarquía de controles, procedimientos, inspecciones, mantenimiento, EPP, vigilancia.", modulo: "Hacer > Inspecciones / Entrega EPP" },
  { rango: "5.1.1 - 5.1.3", componente: "Gestión de Amenazas", descripcion: "Plan de emergencias, brigada, simulacros.", modulo: "Hacer > Plan de Emergencias" },
  { rango: "6.1.1 - 6.1.4", componente: "Verificación", descripcion: "Indicadores de gestión, auditoría anual, revisión por dirección, auditoría con COPASST.", modulo: "Verificar > Auditorías / Actuar > Revisión" },
  { rango: "7.1.1 - 7.1.4", componente: "Mejoramiento", descripcion: "Acciones preventivas/correctivas, plan de mejoramiento, acciones ARL/autoridades.", modulo: "Actuar > Mejora Continua" },
];

const DIAGNOSTICO_RAPIDO = [
  { sintoma: "Pantalla en blanco o no carga", diagnostico: "Problema de conexión o caché del navegador.", respuesta: "Hola [Nombre]. Por favor intente estos pasos: 1) Presione Ctrl+Shift+R (o Cmd+Shift+R en Mac) para recargar sin caché. 2) Limpie el caché del navegador. 3) Intente con otro navegador (Chrome es el recomendado). 4) Verifique su conexión a internet. Si el problema persiste, envíenos un screenshot de la pantalla y el navegador que usa." },
  { sintoma: "Error rojo al guardar un formulario", diagnostico: "Campo obligatorio vacío o formato incorrecto.", respuesta: "Hola [Nombre]. El mensaje rojo indica un campo con error. Revise: 1) Todos los campos con asterisco (*) deben estar completos. 2) Los campos de fecha deben tener formato válido. 3) Los campos numéricos no deben tener letras. Desplácese por todo el formulario para encontrar el campo marcado en rojo. Si no encuentra el error, envíenos un screenshot del formulario completo." },
  { sintoma: "No aparece un módulo en el menú", diagnostico: "Puede ser restricción de plan o de rol.", respuesta: "Hola [Nombre]. Si un módulo no aparece puede ser porque: 1) Su plan actual no incluye ese módulo (consulte Configuración > Mi Suscripción). 2) Su rol de usuario no tiene permiso para acceder (consulte con el administrador de su empresa). 3) Para empresas con ≤10 trabajadores, aplican 7 estándares y algunos módulos avanzados no están disponibles. ¿Cuál módulo busca?" },
  { sintoma: "PDF se descarga vacío o incompleto", diagnostico: "Falta información en la evaluación.", respuesta: "Hola [Nombre]. Los PDFs se generan con la información registrada en el sistema. Si aparece vacío: 1) Verifique que la evaluación tenga estándares calificados. 2) Para el PDF del Ministerio, necesita al menos una evaluación con respuestas. 3) Intente actualizar la página y descargar de nuevo. Si persiste, indíquenos qué PDF intenta generar y de qué sección." },
  { sintoma: "No puede crear más trabajadores", diagnostico: "Límite de plan alcanzado.", respuesta: "Hola [Nombre]. Su plan actual tiene un límite de trabajadores. Puede verificar cuántos tiene registrados y cuál es su límite en Configuración > Mi Suscripción. Si necesita más, puede actualizar su plan desde la misma sección. El precio se ajustará automáticamente según el nuevo número de trabajadores." },
  { sintoma: "La empresa no ve el módulo PESV", diagnostico: "No tiene vehículos registrados.", respuesta: "Hola [Nombre]. El módulo PESV se activa automáticamente cuando la empresa registra al menos un vehículo. Vaya a Configuración > Datos de la Empresa y actualice el campo 'Número de Vehículos'. Una vez tenga vehículos registrados, el tab PESV aparecerá en la navegación." },
  { sintoma: "Error al importar Excel de trabajadores", diagnostico: "Formato del archivo no compatible.", respuesta: "Hola [Nombre]. Para importar correctamente: 1) Use la plantilla Excel que se descarga desde el botón 'Descargar Plantilla'. 2) No modifique los encabezados de las columnas. 3) Los campos de tipo de contrato, género y estado civil aceptan variaciones (con/sin tildes, mayúsculas). 4) Guarde como .xlsx (no .xls ni .csv). Intente con la plantilla oficial y si persiste, envíenos su archivo para revisarlo." },
  { sintoma: "Suscripción bloqueada o expirada", diagnostico: "La suscripción venció o el pago falló.", respuesta: "Hola [Nombre]. Si su suscripción está bloqueada, puede deberse a: 1) Período de prueba vencido — active su suscripción en Configuración > Mi Suscripción. 2) Pago rechazado — verifique su método de pago y reintente. 3) Si cree que es un error, proporciónenos el nombre de su empresa y revisaremos internamente." },
];

function CollapsibleSection({ title, icon, children, defaultOpen = false }: { title: string; icon: ReactNode; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card>
      <CardHeader
        className="cursor-pointer"
        onClick={() => setOpen(!open)}
        data-testid={`section-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <CardTitle className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {icon}
            {title}
          </div>
          {open ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
        </CardTitle>
      </CardHeader>
      {open && <CardContent>{children}</CardContent>}
    </Card>
  );
}

function CopyableResponse({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group">
      <p className="text-sm text-muted-foreground whitespace-pre-line pr-8">{text}</p>
      <button
        onClick={handleCopy}
        className="absolute top-0 right-0 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        title="Copiar respuesta"
        data-testid="button-copy-response"
      >
        {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
      </button>
    </div>
  );
}

export default function ManualSoporte() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  if (!user || (user.role !== "soporte" && user.role !== "superadmin")) {
    return <Redirect to="/" />;
  }

  const handlePrint = () => {
    window.print();
  };

  const filterBySearch = (text: string) => {
    if (!searchTerm.trim()) return true;
    return text.toLowerCase().includes(searchTerm.toLowerCase());
  };

  const filteredModulos = MODULOS_SST.filter(m =>
    filterBySearch(`${m.modulo} ${m.descripcion} ${m.preguntasFrecuentes.map(p => `${p.pregunta} ${p.respuesta}`).join(' ')}`)
  );

  const filteredPESV = PASOS_PESV.filter(p =>
    filterBySearch(`${p.codigo} ${p.nombre} ${p.descripcion} ${p.respuesta}`)
  );

  const filteredDiagnostico = DIAGNOSTICO_RAPIDO.filter(d =>
    filterBySearch(`${d.sintoma} ${d.diagnostico} ${d.respuesta}`)
  );

  const filteredNoContacto = PROTOCOLO_NO_CONTACTO.filter(p =>
    filterBySearch(`${p.situacion} ${p.respuesta}`)
  );

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-4xl" data-testid="page-manual-soporte">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-manual-title">Manual del Agente de Soporte</h1>
            <p className="text-muted-foreground">Guía completa para atender tickets — SST Colombia & PESV</p>
          </div>
        </div>
        <Button onClick={handlePrint} variant="outline" data-testid="button-print-manual">
          <Printer className="h-4 w-4 mr-2" />
          Imprimir
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar en el manual... (ej: trabajadores, PESV, capacitación, estándar 1.1.1)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          data-testid="input-search-manual"
        />
      </div>

      {(!searchTerm || filterBySearch("regla fundamental nunca acceder datos")) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Regla Fundamental
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md p-4 space-y-2">
              <p className="font-semibold text-red-800 dark:text-red-200">
                NUNCA acceder a los datos de la empresa del cliente. NUNCA comunicarse directamente con el cliente fuera del sistema de tickets.
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">
                El soporte se da exclusivamente mediante instrucciones escritas en el ticket. El agente guía al cliente paso a paso
                para que él mismo resuelva el problema. No se permiten llamadas, videollamadas, ni acceso remoto.
                Esto es obligatorio por el modelo de servicio automatizado en la nube (cumplimiento normativo colombiano — no genera IVA por intervención humana).
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {(!searchTerm || filteredNoContacto.length > 0) && (
        <CollapsibleSection
          title="Protocolo de No Contacto Directo"
          icon={<PhoneOff className="h-5 w-5 text-red-500" />}
          defaultOpen={!!searchTerm}
        >
          <p className="text-sm text-muted-foreground mb-4">
            Cuando el cliente solicite contacto directo (llamada, videollamada, WhatsApp, acceso remoto), use estas respuestas.
            Todas las respuestas redirigen al cliente de vuelta al sistema de tickets de forma amable pero firme.
          </p>
          <div className="space-y-4">
            {filteredNoContacto.map((p, idx) => (
              <div key={idx} className="border rounded-md p-4 space-y-2">
                <p className="font-medium text-sm flex items-center gap-2">
                  <PhoneOff className="h-4 w-4 text-red-400" />
                  {p.situacion}
                </p>
                <Separator />
                <CopyableResponse text={p.respuesta} />
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {(!searchTerm || filterBySearch("flujo atención paso")) && (
        <CollapsibleSection
          title="Flujo de Atención (7 Pasos)"
          icon={<RotateCcw className="h-5 w-5 text-blue-500" />}
          defaultOpen={!searchTerm}
        >
          <div className="space-y-3">
            {[
              { paso: 1, titulo: "Revisar tickets pendientes", desc: "Al iniciar turno, abra el Panel de Tickets. Revise primero los tickets con prioridad Crítica (banner rojo) y Alta." },
              { paso: 2, titulo: "Abrir el ticket", desc: "Haga clic en el ticket para ver el detalle. Lea la descripción completa." },
              { paso: 3, titulo: "Cambiar estado a 'En Revisión'", desc: "Indica al equipo que usted está atendiendo este ticket." },
              { paso: 4, titulo: "Buscar en este manual", desc: "Use el buscador de arriba para encontrar la respuesta por módulo, estándar o síntoma. Copie la plantilla de respuesta." },
              { paso: 5, titulo: "Responder al cliente", desc: "Pegue la plantilla adaptada SIN marcar 'Nota interna'. Personalice con el nombre del cliente y datos específicos." },
              { paso: 6, titulo: "Esperar confirmación", desc: "El ticket cambia a 'Pendiente Cliente'. Cuando responda, vuelve a 'En Progreso'." },
              { paso: 7, titulo: "Resolver o escalar", desc: "Si confirma solución → 'Resuelto'. Si es bug → nota interna + escalar a desarrollo." },
            ].map((item) => (
              <div key={item.paso} className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-sm">
                  {item.paso}
                </div>
                <div>
                  <p className="font-medium">{item.titulo}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {(!searchTerm || filteredDiagnostico.length > 0) && (
        <CollapsibleSection
          title="Diagnóstico Rápido por Síntomas"
          icon={<AlertTriangle className="h-5 w-5 text-yellow-500" />}
          defaultOpen={!!searchTerm}
        >
          <p className="text-sm text-muted-foreground mb-4">
            Cuando el cliente describe un problema, busque el síntoma aquí para identificar la causa y la respuesta adecuada.
          </p>
          <div className="space-y-4">
            {filteredDiagnostico.map((d, idx) => (
              <div key={idx} className="border rounded-md p-4 space-y-2">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <p className="font-medium text-sm">{d.sintoma}</p>
                  <Badge variant="secondary">{d.diagnostico}</Badge>
                </div>
                <Separator />
                <CopyableResponse text={d.respuesta} />
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {(!searchTerm || filteredModulos.length > 0) && (
        <CollapsibleSection
          title={`Módulos del Sistema SST (${filteredModulos.length})`}
          icon={<ClipboardList className="h-5 w-5 text-blue-500" />}
          defaultOpen={!!searchTerm}
        >
          <p className="text-sm text-muted-foreground mb-4">
            Cada módulo incluye su ruta en el sistema y respuestas predefinidas para las preguntas más comunes. Copie y personalice antes de enviar.
          </p>
          <div className="space-y-6">
            {filteredModulos.map((m, idx) => (
              <div key={idx} className="border rounded-md p-4 space-y-3">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <p className="font-bold">{m.modulo}</p>
                  <Badge variant="outline">{m.ruta}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{m.descripcion}</p>
                <Separator />
                <div className="space-y-3">
                  {m.preguntasFrecuentes
                    .filter(p => filterBySearch(`${m.modulo} ${p.pregunta} ${p.respuesta}`))
                    .map((p, pidx) => (
                    <div key={pidx} className="pl-3 border-l-2 border-blue-200 dark:border-blue-800 space-y-1">
                      <p className="text-sm font-medium">{p.pregunta}</p>
                      <CopyableResponse text={p.respuesta} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {(!searchTerm || filterBySearch("estándar estandar resolución 0312 componente")) && (
        <CollapsibleSection
          title="Estándares Resolución 0312/2019 (Referencia Rápida)"
          icon={<FileText className="h-5 w-5 text-green-500" />}
          defaultOpen={!!searchTerm}
        >
          <p className="text-sm text-muted-foreground mb-4">
            Los 61 estándares agrupados por componente. Use esta tabla para orientar al cliente sobre dónde gestionar cada estándar en el sistema.
          </p>
          <div className="space-y-3">
            {ESTANDARES_RESUMEN.map((e, idx) => (
              <div key={idx} className="border rounded-md p-3 space-y-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <Badge variant="secondary">{e.rango}</Badge>
                  <Badge variant="outline">{e.componente}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{e.descripcion}</p>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Módulo: {e.modulo}</p>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md p-3">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Plantilla genérica para consultas sobre estándares:</p>
            <CopyableResponse text="Hola [Nombre]. El estándar [NÚMERO] corresponde al componente [COMPONENTE] de la Resolución 0312/2019. Para gestionarlo en el sistema, vaya a [MÓDULO]. Allí encontrará las opciones para registrar la evidencia de cumplimiento. Si necesita más detalle sobre los criterios de verificación, puede consultarlos directamente en la evaluación SST (Verificar > Evaluaciones SST) donde cada estándar muestra su descripción completa y las opciones de calificación." />
          </div>
        </CollapsibleSection>
      )}

      {(!searchTerm || filteredPESV.length > 0) && (
        <CollapsibleSection
          title={`Pasos PESV - Resolución 40595/2022 (${filteredPESV.length}/24)`}
          icon={<Car className="h-5 w-5 text-purple-500" />}
          defaultOpen={!!searchTerm}
        >
          <p className="text-sm text-muted-foreground mb-4">
            Los 24 pasos del Plan Estratégico de Seguridad Vial. Cada paso incluye su ubicación en el sistema y una respuesta predefinida para copiar.
          </p>
          <div className="space-y-3">
            {filteredPESV.map((p, idx) => (
              <div key={idx} className="border rounded-md p-3 space-y-2">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Badge className={
                      p.codigo.startsWith("P") ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
                      p.codigo.startsWith("H") ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                      p.codigo.startsWith("V") ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" :
                      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                    }>{p.codigo}</Badge>
                    <p className="font-medium text-sm">{p.nombre}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{p.descripcion}</p>
                <Separator />
                <CopyableResponse text={p.respuesta} />
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {(!searchTerm || filterBySearch("estado ticket prioridad")) && (
        <CollapsibleSection
          title="Estados y Prioridades de Tickets"
          icon={<Clock className="h-5 w-5 text-orange-500" />}
        >
          <div className="space-y-6">
            <div>
              <p className="font-medium mb-3">Estados del Ticket</p>
              <div className="space-y-2">
                {ESTADOS.map((estado) => (
                  <div key={estado.value} className="flex items-start gap-3">
                    <Badge className={`${estado.color} min-w-[140px] justify-center`}>{estado.label}</Badge>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">{estado.descripcion}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Separator />
            <div>
              <p className="font-medium mb-3">Prioridades y Tiempos de Respuesta</p>
              <div className="space-y-2">
                {PRIORIDADES.map((p) => (
                  <div key={p.value} className="flex items-start gap-3 flex-wrap">
                    <Badge className={`${p.color} min-w-[80px] justify-center`}>{p.label}</Badge>
                    <div className="flex-1 min-w-[200px]">
                      <span className="text-sm">{p.descripcion}</span>
                    </div>
                    <Badge variant="outline" className="min-w-[100px] justify-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {p.tiempo}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CollapsibleSection>
      )}

      {(!searchTerm || filterBySearch("respuesta nota interna")) && (
        <CollapsibleSection
          title="Respuestas vs. Notas Internas"
          icon={<><Eye className="h-5 w-5 text-blue-500" /><EyeOff className="h-5 w-5 text-gray-500" /></>}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-md p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Respuesta Normal</span>
              </div>
              <p className="text-sm text-muted-foreground">
                El cliente VE este mensaje. Use para dar instrucciones, pedir información, o comunicar soluciones.
              </p>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Casilla "Nota interna" = DESMARCADA</p>
            </div>
            <div className="border rounded-md p-4 space-y-2 bg-amber-50 dark:bg-amber-950">
              <div className="flex items-center gap-2">
                <EyeOff className="h-4 w-4 text-amber-600" />
                <span className="font-medium">Nota Interna</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Solo visible para agentes de soporte. Use para coordinar con su equipo, documentar hallazgos, o reportar bugs.
              </p>
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Casilla "Nota interna" = MARCADA</p>
            </div>
          </div>
        </CollapsibleSection>
      )}

      {(!searchTerm || filterBySearch("escalar desarrollo bug error")) && (
        <CollapsibleSection
          title="Cuándo Escalar al Equipo de Desarrollo"
          icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
        >
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-3">
              Escale al equipo de desarrollo SOLO cuando el problema NO se puede resolver con instrucciones al cliente:
            </p>
            {[
              "Screenshot con error rojo del sistema (error 500, 'relation does not exist', etc.)",
              "Funcionalidad que antes funcionaba dejó de funcionar para todos los usuarios",
              "Datos incorrectos (cálculos errados, fechas equivocadas, porcentajes mal)",
              "PDF se genera incompleto o con información incorrecta",
              "El problema se reproduce siguiendo exactamente los pasos del cliente",
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-red-500 font-bold flex-shrink-0">!</span>
                <span className="text-sm">{item}</span>
              </div>
            ))}
            <Separator className="my-4" />
            <p className="text-sm font-medium">Al escalar, documente en una NOTA INTERNA:</p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
              <li>Empresa afectada y usuario que reporta</li>
              <li>Pasos exactos para reproducir el error</li>
              <li>Screenshot del error (si el cliente lo envió)</li>
              <li>Módulo y página donde ocurre</li>
              <li>Desde cuándo ocurre (si el cliente lo sabe)</li>
            </ul>
          </div>
        </CollapsibleSection>
      )}

      <Card>
        <CardContent className="py-4">
          <p className="text-center text-sm text-muted-foreground">
            SADGI S.A.S. — NIT 902.036.337-4 — Manual de Soporte v2.0 — Actualizado {new Date().toLocaleDateString('es-CO')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
