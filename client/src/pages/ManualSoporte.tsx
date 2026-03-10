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
  UserCheck,
  PenTool,
  Building2,
  KeyRound,
  FileSignature,
  ShieldAlert,
  FolderOpen,
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
    respuesta: "Hola. Agradecemos su confianza. Nuestro servicio de soporte opera exclusivamente por este canal de tickets para garantizar trazabilidad, calidad y cumplimiento normativo. Por favor descríbanos detalladamente su consulta aquí y le responderemos en el menor tiempo posible con instrucciones paso a paso.",
  },
  {
    situacion: "Cliente pide reunión virtual (Zoom, Meet, Teams)",
    respuesta: "Hola. Entendemos que algunas situaciones pueden parecer complejas. Sin embargo, nuestro modelo de soporte está diseñado para que usted reciba instrucciones escritas claras y paso a paso, que puede seguir a su ritmo y consultar en cualquier momento. Esto también nos permite mantener un registro completo de cada solución. Por favor cuéntenos su duda y la resolveremos por este medio.",
  },
  {
    situacion: "Cliente pide acceso remoto a su computador",
    respuesta: "Hola. Por seguridad de sus datos y cumplimiento de la Ley 1581/2012 de Protección de Datos, no realizamos acceso remoto a equipos de nuestros clientes. Le proporcionaremos instrucciones detalladas para que usted mismo resuelva la situación. Si el problema es técnico del sistema, nuestro equipo interno lo investigará directamente en la plataforma.",
  },
  {
    situacion: "Cliente insiste en hablar con alguien",
    respuesta: "Hola. Comprendemos su urgencia. Le aseguramos que este canal de tickets es la vía más rápida y efectiva para resolver su caso, ya que nos permite asignar al especialista adecuado y hacer seguimiento. Si su caso requiere atención prioritaria, podemos escalarlo a prioridad Alta para una respuesta más rápida. ¿Desea que lo hagamos?",
  },
  {
    situacion: "Cliente quiere que le hagan el trabajo en el sistema",
    respuesta: "Hola. Nuestro sistema es una plataforma automatizada en la nube donde cada empresa gestiona su propia información. Por el modelo de servicio y cumplimiento normativo colombiano, no ingresamos datos en nombre de los clientes. Le enviaremos instrucciones detalladas paso a paso para que pueda realizarlo fácilmente. ¿En qué módulo específico necesita ayuda?",
  },
];

const MODULOS_SST = [
  {
    modulo: "Evaluación Inicial (Archivo Maestro del SG-SST)",
    ruta: "Evaluación Inicial",
    descripcion: "Este es el centro de gestión de todo el SG-SST. Desde la Evaluación Inicial se accede a todos los estándares de la Resolución 0312/2019. Al hacer clic en cualquier estándar se abre el modo de verificación, donde encontrará los módulos correspondientes para gestionar la evidencia. Todo el sistema se opera desde aquí.",
    preguntasFrecuentes: [
      { pregunta: "Cómo crear una Evaluación Inicial", respuesta: "Hola. Para crear su Evaluación Inicial, abra el módulo de Evaluación Inicial y haga clic en 'Nueva Evaluación'. El sistema detecta automáticamente el tamaño y nivel de riesgo de su empresa y le asigna los estándares que le aplican según la Resolución 0312/2019. Una vez creada, desde ahí podrá gestionar todo su SG-SST." },
      { pregunta: "Cuántos estándares me aplican", respuesta: "Hola. Depende del tamaño y riesgo de su empresa: Microempresa (hasta 10 trabajadores, Riesgo I-III) = 7 estándares. Pequeña empresa (11-50, Riesgo I-III) = 21 estándares. Mediana/Grande (más de 50 o Riesgo IV-V) = 61 estándares. El sistema lo calcula automáticamente al crear la Evaluación Inicial." },
      { pregunta: "No encuentro un estándar específico", respuesta: "Hola. Dentro de su Evaluación Inicial, los estándares están agrupados por componentes (Recursos, Gestión Integral, Gestión de Salud, etc.). Desplácese por la lista para encontrar el estándar. El número del estándar (ej: 1.1.1) le ayuda a ubicarlo rápidamente." },
      { pregunta: "Cómo generar el PDF del Ministerio", respuesta: "Hola. Abra su Evaluación Inicial y busque el botón 'PDF Ministerio del Trabajo'. Se generará un informe completo con secciones A-I incluyendo el Hilo Dorado de trazabilidad que conecta estándares, acciones de mejora y actividades del plan de trabajo." },
      { pregunta: "Cómo funciona el modo de verificación", respuesta: "Hola. Dentro de su Evaluación Inicial, haga clic en cualquier estándar. Se abrirá el modo de verificación que le muestra exactamente qué evidencia necesita y los módulos correspondientes donde puede gestionarla. Así funciona todo el sistema: Evaluación Inicial > estándar > clic > modo de verificación > módulo correspondiente." },
    ],
  },
  {
    modulo: "Trabajadores",
    ruta: "Planear > Trabajadores",
    descripcion: "Registro de empleados. Los trabajadores se registran desde el menú Planear > Trabajadores. Este es el ÚNICO módulo que se gestiona directamente desde el menú principal, ya que los trabajadores deben existir antes de poder gestionar los estándares en la Evaluación Inicial.",
    preguntasFrecuentes: [
      { pregunta: "Cómo registrar un trabajador", respuesta: "Hola. Para registrar trabajadores vaya al menú Planear > Trabajadores y haga clic en 'Nuevo Trabajador'. Complete los datos personales, cargo, tipo de contrato y afiliaciones. Este es el primer paso antes de trabajar con la Evaluación Inicial. Si aparece un error de límite, verifique su plan en Configuración > Mi Suscripción." },
      { pregunta: "Cómo importar trabajadores masivamente", respuesta: "Hola. Vaya al menú Planear > Trabajadores y use el botón 'Importar Excel'. Descargue la plantilla oficial, llénela con los datos de sus trabajadores y súbala al sistema. El sistema acepta variaciones en los nombres de campos (con o sin tildes)." },
      { pregunta: "No encuentra un trabajador registrado", respuesta: "Hola. Vaya a Planear > Trabajadores y use la barra de búsqueda por nombre o documento. Verifique que no haya filtros activos." },
    ],
  },
  {
    modulo: "Capacitaciones",
    ruta: "Estándares 1.2.1, 1.2.2, 1.2.3",
    descripcion: "Se gestiona desde la Evaluación Inicial. Abra el estándar correspondiente, haga clic, y en el modo de verificación encontrará el módulo de Capacitaciones.",
    preguntasFrecuentes: [
      { pregunta: "Cómo registrar una capacitación", respuesta: "Hola. Abra su Evaluación Inicial y busque el estándar 1.2.1. Haga clic en él y se abrirá el modo de verificación. Ahí encontrará el módulo de Capacitaciones donde puede crear registros con tema, fecha, duración, instructor y asistentes." },
      { pregunta: "Cómo registrar asistencia", respuesta: "Hola. Abra su Evaluación Inicial, busque el estándar 1.2.1, haga clic para abrir el modo de verificación y entre al módulo de Capacitaciones. Abra la capacitación y en la sección de Asistentes marque cada trabajador que asistió." },
      { pregunta: "Qué capacitaciones son obligatorias", respuesta: "Hola. Abra su Evaluación Inicial y revise los estándares 1.2.1 (programa anual), 1.2.2 (inducción/reinducción) y 1.2.3 (curso 50 horas). Haga clic en cada uno para ver en el modo de verificación exactamente qué se necesita." },
    ],
  },
  {
    modulo: "Inspecciones de Seguridad",
    ruta: "Estándar 4.2.5",
    descripcion: "Se gestiona desde la Evaluación Inicial. Abra el estándar 4.2.5, haga clic, y en el modo de verificación encontrará el módulo de Inspecciones.",
    preguntasFrecuentes: [
      { pregunta: "Cómo crear una inspección", respuesta: "Hola. Abra su Evaluación Inicial y busque el estándar 4.2.5 (Inspecciones). Haga clic en él y se abrirá el modo de verificación. Ahí encontrará el módulo de Inspecciones donde puede crear registros con tipo, fecha, área y hallazgos." },
      { pregunta: "Qué tipos de inspección hay", respuesta: "Hola. El sistema soporta: inspección general, de EPP, orden y aseo, extintores y botiquines. Acceda al módulo desde su Evaluación Inicial, estándar 4.2.5, haciendo clic para abrir el modo de verificación." },
    ],
  },
  {
    modulo: "Accidentes e Incidentes",
    ruta: "Estándares 3.2.1, 3.2.2, 3.2.3",
    descripcion: "Se gestiona desde la Evaluación Inicial. Abra el estándar correspondiente, haga clic, y en el modo de verificación encontrará el módulo de Accidentes.",
    preguntasFrecuentes: [
      { pregunta: "Cómo registrar un accidente", respuesta: "Hola. Abra su Evaluación Inicial y busque el estándar 3.2.1 (Reporte de accidentes). Haga clic en él y se abrirá el modo de verificación. Ahí encontrará el módulo de Accidentes donde puede registrar el tipo, fecha, trabajador afectado y medidas tomadas." },
      { pregunta: "Cómo hacer la investigación del accidente", respuesta: "Hola. Abra su Evaluación Inicial y busque el estándar 3.2.2 (Investigación de accidentes). Haga clic para abrir el modo de verificación y entre al módulo de Accidentes. Abra el accidente registrado y complete la sección de Investigación: participantes, hallazgos, causas raíz y acciones correctivas." },
    ],
  },
  {
    modulo: "Exámenes Médicos",
    ruta: "Estándares 3.1.1, 3.1.2, 3.1.3",
    descripcion: "Se gestiona desde la Evaluación Inicial. Abra el estándar correspondiente, haga clic, y en el modo de verificación encontrará el módulo de Exámenes Médicos.",
    preguntasFrecuentes: [
      { pregunta: "Cómo registrar un examen médico", respuesta: "Hola. Abra su Evaluación Inicial y busque el estándar 3.1.4 (Evaluaciones médicas ocupacionales). Haga clic en él y se abrirá el modo de verificación. Ahí encontrará el módulo de Exámenes Médicos donde puede registrar trabajador, tipo de examen, fecha y concepto." },
      { pregunta: "Cómo ver exámenes próximos a vencer", respuesta: "Hola. Abra su Evaluación Inicial, busque el estándar 3.1.4 y haga clic para abrir el modo de verificación. Entre al módulo de Exámenes Médicos y ordene por fecha de vencimiento. El sistema envía alertas automáticas cuando los exámenes están próximos a vencer." },
    ],
  },
  {
    modulo: "Entrega de EPP",
    ruta: "Estándar 4.2.6",
    descripcion: "Se gestiona desde la Evaluación Inicial. Abra el estándar 4.2.6, haga clic, y en el modo de verificación encontrará el módulo de Entrega de EPP.",
    preguntasFrecuentes: [
      { pregunta: "Cómo registrar entrega de EPP", respuesta: "Hola. Abra su Evaluación Inicial y busque el estándar 4.2.6 (Entrega de EPP). Haga clic en él y se abrirá el modo de verificación. Ahí encontrará el módulo de Entrega de EPP donde puede registrar trabajador, elementos del catálogo, cantidad y fechas." },
    ],
  },
  {
    modulo: "Plan de Trabajo Anual",
    ruta: "Estándar 2.4.1",
    descripcion: "Se gestiona desde la Evaluación Inicial. Abra el estándar 2.4.1, haga clic, y en el modo de verificación encontrará el módulo de Plan de Trabajo.",
    preguntasFrecuentes: [
      { pregunta: "Cómo crear el plan anual", respuesta: "Hola. Abra su Evaluación Inicial y busque el estándar 2.4.1 (Plan Anual de Trabajo). Haga clic en él y se abrirá el modo de verificación. Ahí encontrará el módulo de Plan de Trabajo donde puede crear el plan con actividades, responsables, cronograma y recursos." },
      { pregunta: "Cómo marcar una actividad como completada", respuesta: "Hola. Abra su Evaluación Inicial, busque el estándar 2.4.1, haga clic para abrir el modo de verificación y entre al módulo de Plan de Trabajo. En el detalle del plan, cada actividad tiene un toggle para completarla. Si está vinculada a una acción de mejora, el avance se recalcula automáticamente." },
    ],
  },
  {
    modulo: "Matriz IPERC",
    ruta: "Estándares 4.1.1 a 4.1.4",
    descripcion: "Se gestiona desde la Evaluación Inicial. Abra el estándar 4.1.1, haga clic, y en el modo de verificación encontrará el módulo de Matriz IPERC.",
    preguntasFrecuentes: [
      { pregunta: "Cómo crear la matriz de riesgos", respuesta: "Hola. Abra su Evaluación Inicial y busque el estándar 4.1.1 (Metodología IPERC). Haga clic en él y se abrirá el modo de verificación. Ahí encontrará el módulo Matriz IPERC donde puede agregar procesos, peligros, niveles de riesgo y controles según la GTC 45." },
    ],
  },
  {
    modulo: "Indicadores de Accidentalidad",
    ruta: "Estándares 3.3.1 a 3.3.6",
    descripcion: "Se gestiona desde la Evaluación Inicial. Abra cualquier estándar de indicadores (3.3.1 a 3.3.6), haga clic, y en el modo de verificación encontrará el módulo de Indicadores.",
    preguntasFrecuentes: [
      { pregunta: "Cómo se calculan los indicadores", respuesta: "Hola. Abra su Evaluación Inicial y busque los estándares 3.3.1 a 3.3.6. Haga clic en cualquiera de ellos para abrir el modo de verificación. El sistema calcula los indicadores automáticamente a partir de los accidentes registrados (frecuencia, severidad, mortalidad, prevalencia, incidencia, ausentismo)." },
    ],
  },
  {
    modulo: "Objetivos SST",
    ruta: "Estándar 2.2.1",
    descripcion: "Se gestiona desde la Evaluación Inicial. Abra el estándar 2.2.1, haga clic, y en el modo de verificación encontrará el módulo de Objetivos SST.",
    preguntasFrecuentes: [
      { pregunta: "Cómo crear y vincular objetivos", respuesta: "Hola. Abra su Evaluación Inicial y busque el estándar 2.2.1 (Objetivos de SST). Haga clic en él y se abrirá el modo de verificación. Ahí encontrará el módulo de Objetivos SST donde puede crear objetivos claros y medibles, y vincularlos con estándares específicos para trazabilidad formal." },
    ],
  },
  {
    modulo: "Matriz Legal",
    ruta: "Estándar 2.7.1",
    descripcion: "Se gestiona desde la Evaluación Inicial. Abra el estándar 2.7.1, haga clic, y en el modo de verificación encontrará el módulo de Matriz Legal.",
    preguntasFrecuentes: [
      { pregunta: "Cómo agregar un requisito legal", respuesta: "Hola. Abra su Evaluación Inicial y busque el estándar 2.7.1 (Matriz Legal). Haga clic en él y se abrirá el modo de verificación. Ahí encontrará el módulo donde puede registrar normas, artículos, obligaciones y responsables." },
    ],
  },
  {
    modulo: "Plan de Emergencias",
    ruta: "Estándares 5.1.1 a 5.1.3",
    descripcion: "Se gestiona desde la Evaluación Inicial. Abra el estándar 5.1.1, haga clic, y en el modo de verificación encontrará el módulo de Plan de Emergencias.",
    preguntasFrecuentes: [
      { pregunta: "Qué incluye el plan de emergencias", respuesta: "Hola. Abra su Evaluación Inicial y busque el estándar 5.1.1 (Plan de Emergencias). Haga clic en él y se abrirá el modo de verificación. Ahí encontrará el módulo de Plan de Emergencias donde puede registrar amenazas, conformar brigadas y programar simulacros." },
    ],
  },
  {
    modulo: "Auditorías Internas",
    ruta: "Estándares 6.1.2, 6.1.4",
    descripcion: "Se gestiona desde la Evaluación Inicial. Abra el estándar 6.1.2, haga clic, y en el modo de verificación encontrará el módulo de Auditorías.",
    preguntasFrecuentes: [
      { pregunta: "Cómo crear una auditoría", respuesta: "Hola. Abra su Evaluación Inicial y busque el estándar 6.1.2 (Auditoría anual). Haga clic en él y se abrirá el modo de verificación. Ahí encontrará el módulo de Auditorías donde puede crear registros con criterios pre-cargados." },
    ],
  },
  {
    modulo: "Revisión por la Dirección",
    ruta: "Estándar 6.1.3",
    descripcion: "Se gestiona desde la Evaluación Inicial. Abra el estándar 6.1.3, haga clic, y en el modo de verificación encontrará el módulo de Revisión por la Dirección.",
    preguntasFrecuentes: [
      { pregunta: "Qué debe incluir la revisión", respuesta: "Hola. Abra su Evaluación Inicial y busque el estándar 6.1.3 (Revisión por la Dirección). Haga clic en él y se abrirá el modo de verificación. Ahí encontrará el módulo donde puede generar el formato con auditorías, indicadores, acciones correctivas y conclusiones." },
    ],
  },
  {
    modulo: "Plan de Mejoramiento",
    ruta: "Estándares 7.1.1 a 7.1.4",
    descripcion: "Se gestiona desde la Evaluación Inicial. Abra el estándar 7.1.1, haga clic, y en el modo de verificación encontrará el módulo de Plan de Mejoramiento.",
    preguntasFrecuentes: [
      { pregunta: "Cómo crear una acción de mejora", respuesta: "Hola. Abra su Evaluación Inicial y busque el estándar 7.1.1 (Acciones preventivas y correctivas). Haga clic en él y se abrirá el modo de verificación. Ahí encontrará el módulo de Plan de Mejoramiento donde puede crear acciones de mejora vinculadas a estándares y al Plan de Trabajo para seguimiento del avance." },
    ],
  },
  {
    modulo: "COPASST / Vigía",
    ruta: "Estándares 1.1.6, 1.1.7",
    descripcion: "Se gestiona desde la Evaluación Inicial. Abra el estándar 1.1.6, haga clic, y en el modo de verificación encontrará el módulo de COPASST/Vigía.",
    preguntasFrecuentes: [
      { pregunta: "Diferencia entre COPASST y Vigía", respuesta: "Hola. Abra su Evaluación Inicial y busque el estándar 1.1.6 (Conformación COPASST/Vigía). Haga clic en él y se abrirá el modo de verificación. El sistema se adapta automáticamente según el tamaño de su empresa: menos de 10 trabajadores = Vigía, 10 o más = COPASST." },
    ],
  },
  {
    modulo: "Gestión del Cambio",
    ruta: "Estándar 2.11.1",
    descripcion: "Se gestiona desde la Evaluación Inicial. Abra el estándar 2.11.1, haga clic, y en el modo de verificación encontrará el módulo de Gestión del Cambio.",
    preguntasFrecuentes: [
      { pregunta: "Cuándo registrar un cambio", respuesta: "Hola. Abra su Evaluación Inicial y busque el estándar 2.11.1 (Gestión del Cambio). Haga clic en él y se abrirá el modo de verificación. Ahí encontrará el módulo donde puede documentar cambios en procesos, equipos, instalaciones, personal, sustancias o normas." },
    ],
  },
  {
    modulo: "Comunicación SST",
    ruta: "Estándar 2.8.1",
    descripcion: "Se gestiona desde la Evaluación Inicial. Abra el estándar 2.8.1, haga clic, y en el modo de verificación encontrará el módulo de Comunicación SST.",
    preguntasFrecuentes: [
      { pregunta: "Qué comunicaciones debo registrar", respuesta: "Hola. Abra su Evaluación Inicial y busque el estándar 2.8.1 (Mecanismos de comunicación). Haga clic en él y se abrirá el modo de verificación. Ahí encontrará el módulo donde puede registrar comunicaciones sobre políticas, cambios, alertas y convocatorias de SST." },
    ],
  },
  {
    modulo: "Mi Cuenta / Suscripción",
    ruta: "Configuración > Mi Suscripción",
    descripcion: "Gestión de plan, facturación y configuración de la empresa.",
    preguntasFrecuentes: [
      { pregunta: "Cómo cambiar de plan", respuesta: "Hola. Vaya a Configuración > Mi Suscripción. Allí verá su plan actual y las opciones disponibles. Al cambiar datos como número de trabajadores o vehículos, el precio se recalcula automáticamente." },
      { pregunta: "Cómo ver facturas", respuesta: "Hola. En Configuración > Mi Suscripción encontrará el historial de facturas, próxima fecha de cobro y método de pago." },
      { pregunta: "Cómo agregar usuarios", respuesta: "Hola. Vaya a Configuración > Usuarios > 'Nuevo Usuario'. Cada rol administrativo incluye un usuario sin costo adicional." },
    ],
  },
];

const PASOS_PESV = [
  { codigo: "P01", nombre: "Equipo de Trabajo", descripcion: "Se gestiona desde la Evaluación PESV (archivo maestro). Haga clic en el paso P01 dentro de su evaluación activa.", respuesta: "Hola. Para gestionar el paso P01 (Equipo de Trabajo), vaya a PESV > Evaluaciones PESV y abra su evaluación activa. Busque la pestaña 'Planear' y haga clic en el paso P01. Se abrirá un diálogo donde puede calificar el cumplimiento. El sistema le mostrará los módulos relacionados (como Comité PESV) donde puede registrar la evidencia de soporte." },
  { codigo: "P02", nombre: "Liderazgo y Compromiso", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso P02 dentro de la pestaña Planear.", respuesta: "Hola. Para gestionar el paso P02 (Liderazgo y Compromiso), abra su Evaluación PESV activa en PESV > Evaluaciones PESV, pestaña 'Planear', y haga clic en P02. Allí califica el cumplimiento. La evidencia de soporte (política de seguridad vial, compromisos de la dirección) se puede documentar en los módulos que el sistema sugiere dentro del mismo diálogo." },
  { codigo: "P03", nombre: "Diagnóstico / Contexto", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso P03 dentro de la pestaña Planear.", respuesta: "Hola. Para el paso P03 (Diagnóstico/Contexto), abra su Evaluación PESV activa, pestaña 'Planear', y haga clic en P03. Complete la información sobre el contexto organizacional en seguridad vial. El sistema pre-llena datos sugeridos según el nivel de complejidad de su empresa." },
  { codigo: "P04", nombre: "Evaluación de Riesgos Viales", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso P04 dentro de la pestaña Planear.", respuesta: "Hola. Para el paso P04 (Evaluación de Riesgos Viales), abra su Evaluación PESV activa, pestaña 'Planear', y haga clic en P04. El diálogo le permite calificar el cumplimiento y le sugiere los módulos donde registrar la evidencia (identificación de peligros viales por factor humano, vehículo, infraestructura y condiciones ambientales)." },
  { codigo: "P05", nombre: "Objetivos e Indicadores", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso P05 dentro de la pestaña Planear.", respuesta: "Hola. Para el paso P05 (Objetivos e Indicadores), abra su Evaluación PESV activa, pestaña 'Planear', y haga clic en P05. El sistema le mostrará los módulos relacionados donde puede definir metas medibles de reducción de siniestralidad y cumplimiento de inspecciones." },
  { codigo: "P06", nombre: "Programas y Planes", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso P06 dentro de la pestaña Planear.", respuesta: "Hola. Para el paso P06 (Programas y Planes), abra su Evaluación PESV activa, pestaña 'Planear', y haga clic en P06. Allí califica el cumplimiento y el sistema sugiere los módulos de factores de desempeño donde registrar la evidencia." },
  { codigo: "P07", nombre: "Roles y Responsabilidades", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso P07 dentro de la pestaña Planear.", respuesta: "Hola. Para el paso P07 (Roles y Responsabilidades), abra su Evaluación PESV activa, pestaña 'Planear', y haga clic en P07. Defina quién es responsable de cada aspecto del plan de seguridad vial desde el diálogo de calificación." },
  { codigo: "P08", nombre: "Recursos", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso P08 dentro de la pestaña Planear.", respuesta: "Hola. Para el paso P08 (Recursos), abra su Evaluación PESV activa, pestaña 'Planear', y haga clic en P08. Documente la asignación de presupuesto, equipos y personal para la implementación del PESV." },
  { codigo: "H01", nombre: "Factor Humano - Conductores", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso H01 dentro de la pestaña Hacer.", respuesta: "Hola. Para el paso H01 (Factor Humano - Conductores), abra su Evaluación PESV activa, pestaña 'Hacer', y haga clic en H01. El sistema le sugiere el módulo de Conductores donde puede registrar la evidencia (datos del conductor, categoría de licencia, exámenes médicos)." },
  { codigo: "H02", nombre: "Capacitación Vial", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso H02 dentro de la pestaña Hacer.", respuesta: "Hola. Para el paso H02 (Capacitación Vial), abra su Evaluación PESV activa, pestaña 'Hacer', y haga clic en H02. El sistema sugiere el módulo de Capacitaciones PESV donde puede registrar eventos de formación (manejo defensivo, normativa de tránsito, primeros auxilios viales) y asistencia." },
  { codigo: "H03", nombre: "Documentación de Conductores", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso H03 dentro de la pestaña Hacer.", respuesta: "Hola. Para el paso H03 (Documentación de Conductores), abra su Evaluación PESV activa, pestaña 'Hacer', y haga clic en H03. El sistema sugiere el módulo de Conductores donde puede hacer seguimiento de licencias, certificaciones, exámenes y sanciones." },
  { codigo: "H04", nombre: "Vehículos Seguros", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso H04 dentro de la pestaña Hacer.", respuesta: "Hola. Para el paso H04 (Vehículos Seguros), abra su Evaluación PESV activa, pestaña 'Hacer', y haga clic en H04. El sistema sugiere el módulo de Vehículos donde puede registrar la flota (placa, marca, modelo, SOAT, revisión tecnomecánica)." },
  { codigo: "H05", nombre: "Mantenimiento Preventivo", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso H05 dentro de la pestaña Hacer.", respuesta: "Hola. Para el paso H05 (Mantenimiento Preventivo), abra su Evaluación PESV activa, pestaña 'Hacer', y haga clic en H05. El sistema sugiere el módulo de Vehículos > Mantenimiento donde registrar mantenimientos preventivos y correctivos." },
  { codigo: "H06", nombre: "Inspecciones Preoperacionales", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso H06 dentro de la pestaña Hacer.", respuesta: "Hola. Para el paso H06 (Inspecciones Preoperacionales), abra su Evaluación PESV activa, pestaña 'Hacer', y haga clic en H06. El sistema sugiere el módulo de Inspecciones PESV donde completar la lista de verificación diaria (frenos, luces, llantas, documentos)." },
  { codigo: "H07", nombre: "Gestión de Velocidad", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso H07 dentro de la pestaña Hacer.", respuesta: "Hola. Para el paso H07 (Gestión de Velocidad), abra su Evaluación PESV activa, pestaña 'Hacer', y haga clic en H07. Si su empresa tiene GPS, el sistema sugiere el módulo de Monitoreo GPS para seguimiento de velocidad y alertas." },
  { codigo: "H08", nombre: "Rutas Seguras", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso H08 dentro de la pestaña Hacer.", respuesta: "Hola. Para el paso H08 (Rutas Seguras), abra su Evaluación PESV activa, pestaña 'Hacer', y haga clic en H08. El sistema sugiere el módulo de Rutas Seguras donde registrar rutas con origen, destino, distancia, puntos críticos y medidas de control." },
  { codigo: "H09", nombre: "Fatiga y Somnolencia", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso H09 dentro de la pestaña Hacer.", respuesta: "Hola. Para el paso H09 (Fatiga y Somnolencia), abra su Evaluación PESV activa, pestaña 'Hacer', y haga clic en H09. Documente las medidas implementadas: control de jornadas, pausas activas, programas de descanso y monitoreo de signos de fatiga directamente en el diálogo de calificación." },
  { codigo: "H10", nombre: "Sustancias Psicoactivas", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso H10 dentro de la pestaña Hacer.", respuesta: "Hola. Para el paso H10 (Sustancias Psicoactivas), abra su Evaluación PESV activa, pestaña 'Hacer', y haga clic en H10. Documente la política de alcohol y drogas, pruebas realizadas, programas de prevención y procedimientos ante casos positivos en el diálogo de calificación." },
  { codigo: "H11", nombre: "Atención a Víctimas", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso H11 dentro de la pestaña Hacer.", respuesta: "Hola. Para el paso H11 (Atención a Víctimas), abra su Evaluación PESV activa, pestaña 'Hacer', y haga clic en H11. Documente el protocolo de primeros auxilios, directorio de emergencias viales, procedimiento de reporte y acompañamiento a víctimas en el diálogo de calificación." },
  { codigo: "V01", nombre: "Indicadores de Gestión", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso V01 dentro de la pestaña Verificar.", respuesta: "Hola. Para el paso V01 (Indicadores de Gestión), abra su Evaluación PESV activa, pestaña 'Verificar', y haga clic en V01. El sistema le sugiere el módulo de Indicadores PESV donde se calculan automáticamente indicadores como tasa de siniestralidad y cobertura de capacitaciones." },
  { codigo: "V02", nombre: "Registro y Análisis de Siniestros", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso V02 dentro de la pestaña Verificar.", respuesta: "Hola. Para el paso V02 (Registro y Análisis de Siniestros), abra su Evaluación PESV activa, pestaña 'Verificar', y haga clic en V02. El sistema sugiere el módulo de Siniestros donde registrar fecha, ubicación, vehículo involucrado, conductor, daños y causa probable." },
  { codigo: "V03", nombre: "Auditorías PESV", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso V03 dentro de la pestaña Verificar.", respuesta: "Hola. Para el paso V03 (Auditorías PESV), abra su Evaluación PESV activa, pestaña 'Verificar', y haga clic en V03. El sistema sugiere el módulo de Auditorías PESV donde evaluar cada paso y registrar hallazgos y no conformidades." },
  { codigo: "A01", nombre: "Mejora Continua PESV", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso A01 dentro de la pestaña Actuar.", respuesta: "Hola. Para el paso A01 (Mejora Continua PESV), abra su Evaluación PESV activa, pestaña 'Actuar', y haga clic en A01. El sistema sugiere el módulo de Mejora Continua PESV donde registrar acciones preventivas, correctivas y de mejora con responsable y fecha límite." },
  { codigo: "A02", nombre: "Revisión por la Dirección PESV", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso A02 dentro de la pestaña Actuar.", respuesta: "Hola. Para el paso A02 (Revisión por la Dirección PESV), abra su Evaluación PESV activa, pestaña 'Actuar', y haga clic en A02. El sistema sugiere el módulo de Revisión por la Dirección PESV donde completar el análisis de resultados, conclusiones y compromisos de la alta dirección." },
];

const ESTANDARES_RESUMEN = [
  { codigo: "1.1.1", componente: "Recursos", nombre: "Asignación del responsable del SG-SST", respuesta: "Hola. Para completar el estándar 1.1.1, primero debe tener asignado un Profesional LSO (Licenciado en Seguridad y Salud en el Trabajo) a su empresa. Luego, el sistema se encarga de llenar todo automáticamente. Siga estos pasos:\n\nPaso previo — Asignar un LSO a su empresa:\n• Vaya a Administración Global > Profesionales Licenciados (Directorio LSO).\n• Busque al profesional LSO que será su responsable del SG-SST y asígnelo a su empresa.\n• Al asignarlo, el sistema registra automáticamente todos sus datos: nombre, cédula, número de licencia SST, vigencia, nivel de formación (Profesional, Especialista, etc.), curso de 50 horas y ciudad.\n\nCrear la Designación desde el estándar:\n1. Vaya a Verificar > Evaluaciones SST y abra su evaluación activa.\n2. Busque el estándar 1.1.1 'Asignación del responsable del SG-SST' y haga clic.\n3. En el diálogo de verificación, haga clic en el botón 'Ir a Designación de Responsables'.\n4. En la página de Designación, haga clic en '+ Nueva Designación'.\n5. El sistema detectará que ya tiene un LSO asignado y mostrará sus datos automáticamente (nombre, cédula, licencia, vigencia, formación, curso 50h y ciudad). No necesita escribir nada manualmente.\n6. Seleccione el Cargo Específico 'Responsable del SG-SST'. Las responsabilidades normativas se cargarán automáticamente (puede desmarcar las que no apliquen).\n7. Confirme la fecha de designación y guarde.\n8. Use el botón 'Volver a la evaluación inicial' para regresar al estándar 1.1.1.\n9. Califique el estándar como 'Cumple'. La evidencia queda vinculada automáticamente.\n\nDesde la designación creada, puede generar el Acta PDF oficial con el botón 'Acta PDF' en la columna de acciones." },
  { codigo: "1.1.2", componente: "Recursos", nombre: "Asignación de responsabilidades en SST", respuesta: "Hola. Abra su Evaluación SST, busque el estándar 1.1.2. El modo de verificación pide: documento que asigne responsabilidades SST a todos los niveles de la organización. Registre la evidencia en el módulo de Trabajadores (asignación de roles) y luego califique el estándar." },
  { codigo: "1.1.3", componente: "Recursos", nombre: "Asignación de recursos para SG-SST", respuesta: "Hola. En su Evaluación SST, estándar 1.1.3. El modo de verificación pide: documento con asignación y disponibilidad de recursos financieros, técnicos, humanos y de otra índole para el SG-SST. Califique en la evaluación." },
  { codigo: "1.1.4", componente: "Recursos", nombre: "Afiliación al Sistema de Seguridad Social Integral", respuesta: "Hola. En su Evaluación SST, estándar 1.1.4. El modo de verificación pide: soportes de afiliación a EPS, AFP y ARL de todos los trabajadores. La evidencia se registra en el módulo de Trabajadores donde puede verificar las afiliaciones de cada empleado." },
  { codigo: "1.1.5", componente: "Recursos", nombre: "Identificación de trabajadores de alto riesgo", respuesta: "Hola. En su Evaluación SST, estándar 1.1.5. El modo de verificación pide: identificación de trabajadores en actividades de alto riesgo (clase IV y V) y soporte de cotización especial de pensiones. Revise la clasificación de riesgo de sus trabajadores." },
  { codigo: "1.1.6", componente: "Recursos", nombre: "Conformación COPASST / Vigía", respuesta: "Hola. En su Evaluación SST, estándar 1.1.6. El modo de verificación pide: acta de conformación del COPASST (10+ trabajadores) o designación del Vigía SST (menos de 10). La evidencia se registra en el módulo COPASST. Luego califique el estándar." },
  { codigo: "1.1.7", componente: "Recursos", nombre: "Capacitación COPASST / Vigía", respuesta: "Hola. En su Evaluación SST, estándar 1.1.7. El modo de verificación pide: soportes de capacitación de los miembros del COPASST o Vigía en SST. La evidencia se registra en Capacitaciones vinculadas al COPASST." },
  { codigo: "1.1.8", componente: "Recursos", nombre: "Conformación Comité de Convivencia Laboral", respuesta: "Hola. En su Evaluación SST, estándar 1.1.8. El modo de verificación pide: acta de conformación del Comité de Convivencia Laboral con representantes del empleador y trabajadores. Califique directamente en la evaluación." },
  { codigo: "1.2.1", componente: "Recursos (Capacitación)", nombre: "Programa de capacitación anual", respuesta: "Hola. En su Evaluación SST, estándar 1.2.1. El modo de verificación pide: programa anual de capacitación en SST documentado. La evidencia se registra en el módulo de Capacitaciones donde puede crear el programa con temas, fechas y responsables." },
  { codigo: "1.2.2", componente: "Recursos (Capacitación)", nombre: "Inducción y reinducción en SST", respuesta: "Hola. En su Evaluación SST, estándar 1.2.2. El modo de verificación pide: registros de inducción y reinducción en SST para todos los trabajadores. Registre cada inducción en el módulo de Capacitaciones con asistentes y luego califique." },
  { codigo: "1.2.3", componente: "Recursos (Capacitación)", nombre: "Curso Virtual de 50 horas en SST", respuesta: "Hola. En su Evaluación SST, estándar 1.2.3. El modo de verificación pide: certificado del curso virtual de 50 horas del responsable del SG-SST. Registre el certificado en Capacitaciones y califique el estándar." },
  { codigo: "2.1.1", componente: "Gestión Integral", nombre: "Política de Seguridad y Salud en el Trabajo", respuesta: "Hola. En su Evaluación SST, estándar 2.1.1. El modo de verificación pide: política SST firmada, fechada, comunicada y accesible a todos los trabajadores. Debe incluir alcance, compromisos y marco normativo." },
  { codigo: "2.2.1", componente: "Gestión Integral", nombre: "Objetivos de SST", respuesta: "Hola. En su Evaluación SST, estándar 2.2.1. El modo de verificación pide: objetivos SST claros, medibles, cuantificables y con metas definidas. La evidencia se registra en el módulo de Objetivos SST donde puede vincularlos con estándares específicos." },
  { codigo: "2.3.1", componente: "Gestión Integral", nombre: "Evaluación Inicial del SG-SST", respuesta: "Hola. En su Evaluación SST, estándar 2.3.1. El modo de verificación pide: evaluación inicial del SG-SST que identifica prioridades en SST. Esta es la propia evaluación que está realizando: al completar todos los estándares, genera el diagnóstico inicial." },
  { codigo: "2.4.1", componente: "Gestión Integral", nombre: "Plan Anual de Trabajo", respuesta: "Hola. En su Evaluación SST, estándar 2.4.1. El modo de verificación pide: plan de trabajo anual con objetivos, metas, responsables, recursos y cronograma. La evidencia se registra en el módulo Plan de Trabajo Anual." },
  { codigo: "2.5.1", componente: "Gestión Integral", nombre: "Archivo y retención documental", respuesta: "Hola. En su Evaluación SST, estándar 2.5.1. El modo de verificación pide: sistema de archivo y retención documental del SG-SST. El propio sistema digital cumple esta función al almacenar todos los documentos de forma organizada." },
  { codigo: "2.6.1", componente: "Gestión Integral", nombre: "Rendición de cuentas", respuesta: "Hola. En su Evaluación SST, estándar 2.6.1. El modo de verificación pide: informe de rendición de cuentas anual sobre el desempeño del SG-SST. El PDF del Ministerio que genera el sistema incluye esta información." },
  { codigo: "2.7.1", componente: "Gestión Integral", nombre: "Matriz legal", respuesta: "Hola. En su Evaluación SST, estándar 2.7.1. El modo de verificación pide: matriz de requisitos legales en SST actualizada y con seguimiento. La evidencia se registra en el módulo Matriz Legal donde puede agregar normas, artículos y responsables." },
  { codigo: "2.8.1", componente: "Gestión Integral", nombre: "Mecanismos de comunicación", respuesta: "Hola. En su Evaluación SST, estándar 2.8.1. El modo de verificación pide: mecanismos de comunicación interna y externa sobre SST. La evidencia se registra en el módulo de Comunicación SST." },
  { codigo: "2.9.1", componente: "Gestión Integral", nombre: "Adquisición de bienes y servicios", respuesta: "Hola. En su Evaluación SST, estándar 2.9.1. El modo de verificación pide: procedimiento para identificar y evaluar especificaciones SST en la adquisición de bienes y servicios. Califique directamente en la evaluación." },
  { codigo: "2.10.1", componente: "Gestión Integral", nombre: "Evaluación de proveedores y contratistas", respuesta: "Hola. En su Evaluación SST, estándar 2.10.1. El modo de verificación pide: procedimiento de evaluación y selección de proveedores que incluya criterios SST. Califique directamente en la evaluación." },
  { codigo: "2.11.1", componente: "Gestión Integral", nombre: "Gestión del cambio", respuesta: "Hola. En su Evaluación SST, estándar 2.11.1. El modo de verificación pide: procedimiento de gestión del cambio para evaluar impacto SST de cambios en procesos, equipos, instalaciones o personal. La evidencia se registra en el módulo Gestión del Cambio." },
  { codigo: "3.1.1", componente: "Gestión de la Salud", nombre: "Descripción sociodemográfica y diagnóstico de salud", respuesta: "Hola. En su Evaluación SST, estándar 3.1.1. El modo de verificación pide: perfil sociodemográfico y diagnóstico de condiciones de salud de los trabajadores. La evidencia se registra en el módulo de Trabajadores (datos demográficos) y Exámenes Médicos." },
  { codigo: "3.1.2", componente: "Gestión de la Salud", nombre: "Actividades de medicina del trabajo", respuesta: "Hola. En su Evaluación SST, estándar 3.1.2. El modo de verificación pide: programa de actividades de medicina preventiva y del trabajo. Registre las actividades en Capacitaciones y Exámenes Médicos, luego califique." },
  { codigo: "3.1.3", componente: "Gestión de la Salud", nombre: "Perfiles de cargos", respuesta: "Hola. En su Evaluación SST, estándar 3.1.3. El modo de verificación pide: perfiles de cargo con requisitos de aptitud física y mental. Verifique que los cargos en el módulo de Trabajadores incluyan esta información." },
  { codigo: "3.1.4", componente: "Gestión de la Salud", nombre: "Evaluaciones médicas ocupacionales", respuesta: "Hola. En su Evaluación SST, estándar 3.1.4. El modo de verificación pide: evaluaciones médicas de ingreso, periódicas y de egreso. La evidencia se registra en el módulo de Exámenes Médicos con tipo, fecha y concepto." },
  { codigo: "3.1.5", componente: "Gestión de la Salud", nombre: "Custodia de Historias Clínicas", respuesta: "Hola. En su Evaluación SST, estándar 3.1.5. El modo de verificación pide: custodia adecuada de historias clínicas ocupacionales con confidencialidad. Califique directamente en la evaluación." },
  { codigo: "3.1.6", componente: "Gestión de la Salud", nombre: "Restricciones y recomendaciones médico laborales", respuesta: "Hola. En su Evaluación SST, estándar 3.1.6. El modo de verificación pide: seguimiento a restricciones y recomendaciones médicas de los trabajadores. Registre el seguimiento en Exámenes Médicos." },
  { codigo: "3.1.7", componente: "Gestión de la Salud", nombre: "Estilos de vida y entornos saludables", respuesta: "Hola. En su Evaluación SST, estándar 3.1.7. El modo de verificación pide: programas de prevención de tabaquismo, alcoholismo y farmacodependencia. Registre las actividades preventivas y califique." },
  { codigo: "3.1.8", componente: "Gestión de la Salud", nombre: "Servicios de higiene y agua potable", respuesta: "Hola. En su Evaluación SST, estándar 3.1.8. El modo de verificación pide: suministro de agua potable, servicios sanitarios y disposición de basuras. Califique directamente en la evaluación." },
  { codigo: "3.1.9", componente: "Gestión de la Salud", nombre: "Manejo de residuos", respuesta: "Hola. En su Evaluación SST, estándar 3.1.9. El modo de verificación pide: procedimiento de eliminación adecuada de residuos sólidos, líquidos o gaseosos. Califique directamente en la evaluación." },
  { codigo: "3.2.1", componente: "Gestión de la Salud (Reporte)", nombre: "Reporte de accidentes y enfermedad laboral", respuesta: "Hola. En su Evaluación SST, estándar 3.2.1. El modo de verificación pide: reporte de accidentes de trabajo y enfermedad laboral a ARL, EPS y Ministerio. La evidencia se registra en el módulo de Accidentes e Incidentes." },
  { codigo: "3.2.2", componente: "Gestión de la Salud (Reporte)", nombre: "Investigación de accidentes e incidentes", respuesta: "Hola. En su Evaluación SST, estándar 3.2.2. El modo de verificación pide: investigación de accidentes e incidentes con causas raíz y acciones correctivas. La evidencia se registra en Accidentes > sección de Investigación." },
  { codigo: "3.2.3", componente: "Gestión de la Salud (Reporte)", nombre: "Registro y análisis estadístico", respuesta: "Hola. En su Evaluación SST, estándar 3.2.3. El modo de verificación pide: registro estadístico de accidentes, incidentes y enfermedades laborales. El sistema lo genera automáticamente a partir de los registros en el módulo de Accidentes." },
  { codigo: "3.3.1", componente: "Indicadores", nombre: "Frecuencia de accidentalidad", respuesta: "Hola. En su Evaluación SST, estándar 3.3.1. El modo de verificación pide: medición del indicador de frecuencia de accidentalidad. El sistema lo calcula automáticamente en el módulo de Indicadores a partir de los accidentes registrados." },
  { codigo: "3.3.2", componente: "Indicadores", nombre: "Severidad de accidentalidad", respuesta: "Hola. En su Evaluación SST, estándar 3.3.2. El modo de verificación pide: medición del indicador de severidad. Se calcula automáticamente en Indicadores. Califique el estándar una vez tenga datos." },
  { codigo: "3.3.3", componente: "Indicadores", nombre: "Mortalidad por accidentes", respuesta: "Hola. En su Evaluación SST, estándar 3.3.3. El modo de verificación pide: medición del indicador de mortalidad. Se calcula automáticamente en Indicadores." },
  { codigo: "3.3.4", componente: "Indicadores", nombre: "Prevalencia de enfermedad laboral", respuesta: "Hola. En su Evaluación SST, estándar 3.3.4. El modo de verificación pide: medición del indicador de prevalencia. Se calcula automáticamente en Indicadores." },
  { codigo: "3.3.5", componente: "Indicadores", nombre: "Incidencia de enfermedad laboral", respuesta: "Hola. En su Evaluación SST, estándar 3.3.5. El modo de verificación pide: medición del indicador de incidencia. Se calcula automáticamente en Indicadores." },
  { codigo: "3.3.6", componente: "Indicadores", nombre: "Ausentismo laboral", respuesta: "Hola. En su Evaluación SST, estándar 3.3.6. El modo de verificación pide: medición del indicador de ausentismo. Se calcula automáticamente en Indicadores a partir de los días perdidos registrados." },
  { codigo: "4.1.1", componente: "Peligros y Riesgos", nombre: "Metodología IPERC", respuesta: "Hola. En su Evaluación SST, estándar 4.1.1. El modo de verificación pide: metodología para identificación de peligros, evaluación y valoración de riesgos (GTC 45). La evidencia se registra en el módulo Matriz IPERC." },
  { codigo: "4.1.2", componente: "Peligros y Riesgos", nombre: "Identificación de peligros con participación", respuesta: "Hola. En su Evaluación SST, estándar 4.1.2. El modo de verificación pide: evidencia de participación de todos los niveles de la empresa en la identificación de peligros. Se documenta en la Matriz IPERC." },
  { codigo: "4.1.3", componente: "Peligros y Riesgos", nombre: "Sustancias carcinógenas o con toxicidad aguda", respuesta: "Hola. En su Evaluación SST, estándar 4.1.3. El modo de verificación pide: identificación de sustancias catalogadas como carcinógenas o con toxicidad aguda. Se registra en la Matriz IPERC como peligro químico." },
  { codigo: "4.1.4", componente: "Peligros y Riesgos", nombre: "Mediciones ambientales", respuesta: "Hola. En su Evaluación SST, estándar 4.1.4. El modo de verificación pide: mediciones ambientales de agentes químicos, físicos y biológicos, socializadas con el COPASST. Califique con la evidencia de los informes técnicos." },
  { codigo: "4.2.1", componente: "Control de Riesgos", nombre: "Medidas de prevención y control", respuesta: "Hola. En su Evaluación SST, estándar 4.2.1. El modo de verificación pide: implementación de medidas de prevención y control según jerarquía (eliminación, sustitución, ingeniería, administrativos, EPP). Se documenta en la Matriz IPERC como controles." },
  { codigo: "4.2.2", componente: "Control de Riesgos", nombre: "Aplicación de medidas por trabajadores", respuesta: "Hola. En su Evaluación SST, estándar 4.2.2. El modo de verificación pide: verificación de que los trabajadores aplican las medidas de prevención y control. Se evidencia con inspecciones y capacitaciones." },
  { codigo: "4.2.3", componente: "Control de Riesgos", nombre: "Procedimientos e instructivos de SST", respuesta: "Hola. En su Evaluación SST, estándar 4.2.3. El modo de verificación pide: procedimientos, instructivos, fichas técnicas y protocolos de SST. Califique directamente en la evaluación." },
  { codigo: "4.2.4", componente: "Control de Riesgos", nombre: "Inspecciones a instalaciones y equipos", respuesta: "Hola. En su Evaluación SST, estándar 4.2.4. El modo de verificación pide: inspecciones periódicas a instalaciones, maquinaria o equipos. La evidencia se registra en el módulo de Inspecciones de Seguridad." },
  { codigo: "4.2.5", componente: "Control de Riesgos", nombre: "Mantenimiento de instalaciones y equipos", respuesta: "Hola. En su Evaluación SST, estándar 4.2.5. El modo de verificación pide: programa de mantenimiento preventivo y correctivo de instalaciones, equipos y herramientas. Califique con la evidencia de mantenimientos realizados." },
  { codigo: "4.2.6", componente: "Control de Riesgos", nombre: "Entrega de EPP", respuesta: "Hola. En su Evaluación SST, estándar 4.2.6. El modo de verificación pide: registros de entrega de EPP con capacitación en uso adecuado, incluyendo contratistas. La evidencia se registra en el módulo Entrega de EPP." },
  { codigo: "5.1.1", componente: "Gestión de Amenazas", nombre: "Plan de emergencias", respuesta: "Hola. En su Evaluación SST, estándar 5.1.1. El modo de verificación pide: plan de prevención, preparación y respuesta ante emergencias. La evidencia se registra en el módulo Plan de Emergencias." },
  { codigo: "5.1.2", componente: "Gestión de Amenazas", nombre: "Brigada de emergencias", respuesta: "Hola. En su Evaluación SST, estándar 5.1.2. El modo de verificación pide: conformación, capacitación y dotación de la brigada de emergencias. Registre la evidencia en Plan de Emergencias." },
  { codigo: "5.1.3", componente: "Gestión de Amenazas", nombre: "Simulacros de emergencias", respuesta: "Hola. En su Evaluación SST, estándar 5.1.3. El modo de verificación pide: realización de simulacros al menos una vez al año. Registre los simulacros con fecha, participantes y evaluación en Plan de Emergencias." },
  { codigo: "6.1.1", componente: "Verificación", nombre: "Indicadores de gestión del SG-SST", respuesta: "Hola. En su Evaluación SST, estándar 6.1.1. El modo de verificación pide: definición de indicadores de estructura, proceso y resultado del SG-SST. El módulo de Indicadores los calcula automáticamente." },
  { codigo: "6.1.2", componente: "Verificación", nombre: "Auditoría anual", respuesta: "Hola. En su Evaluación SST, estándar 6.1.2. El modo de verificación pide: auditoría anual del SG-SST con alcance, periodicidad y resultados. La evidencia se registra en el módulo Auditorías Internas." },
  { codigo: "6.1.3", componente: "Verificación", nombre: "Revisión por la alta dirección", respuesta: "Hola. En su Evaluación SST, estándar 6.1.3. El modo de verificación pide: revisión anual por la alta dirección con resultados, conclusiones y compromisos. La evidencia se registra en Revisión por la Dirección." },
  { codigo: "6.1.4", componente: "Verificación", nombre: "Auditoría con COPASST", respuesta: "Hola. En su Evaluación SST, estándar 6.1.4. El modo de verificación pide: planificación de auditoría con participación del COPASST o Vigía. Registre en Auditorías Internas incluyendo al COPASST." },
  { codigo: "7.1.1", componente: "Mejoramiento", nombre: "Acciones preventivas y correctivas", respuesta: "Hola. En su Evaluación SST, estándar 7.1.1. El modo de verificación pide: acciones preventivas y correctivas definidas con base en resultados del SG-SST. La evidencia se registra en el módulo Plan de Mejoramiento. Al calificar cualquier estándar como 'No Cumple', puede crear una acción vinculada directamente." },
  { codigo: "7.1.2", componente: "Mejoramiento", nombre: "Acciones de mejora por revisión de la Dirección", respuesta: "Hola. En su Evaluación SST, estándar 7.1.2. El modo de verificación pide: acciones de mejora resultantes de la revisión por la alta dirección. Se vinculan automáticamente desde Revisión por la Dirección al Plan de Mejoramiento." },
  { codigo: "7.1.3", componente: "Mejoramiento", nombre: "Acciones de mejora por investigación de accidentes", respuesta: "Hola. En su Evaluación SST, estándar 7.1.3. El modo de verificación pide: acciones de mejora derivadas de investigaciones de accidentes y enfermedades laborales. Se registran en el Plan de Mejoramiento vinculadas a los accidentes investigados." },
  { codigo: "7.1.4", componente: "Mejoramiento", nombre: "Plan de mejoramiento", respuesta: "Hola. En su Evaluación SST, estándar 7.1.4. El modo de verificación pide: plan de mejoramiento documentado con acciones, responsables, fechas y seguimiento. La evidencia completa está en el módulo Plan de Mejoramiento con las actividades del Plan de Trabajo vinculadas." },
];

const DIAGNOSTICO_RAPIDO = [
  { sintoma: "Pantalla en blanco o no carga", diagnostico: "Problema de conexión o caché del navegador.", respuesta: "Hola. Por favor intente estos pasos: 1) Presione Ctrl+Shift+R (o Cmd+Shift+R en Mac) para recargar sin caché. 2) Limpie el caché del navegador. 3) Intente con otro navegador (Chrome es el recomendado). 4) Verifique su conexión a internet. Si el problema persiste, envíenos un screenshot de la pantalla y el navegador que usa." },
  { sintoma: "Error rojo al guardar un formulario", diagnostico: "Campo obligatorio vacío o formato incorrecto.", respuesta: "Hola. El mensaje rojo indica un campo con error. Revise: 1) Todos los campos con asterisco (*) deben estar completos. 2) Los campos de fecha deben tener formato válido. 3) Los campos numéricos no deben tener letras. Desplácese por todo el formulario para encontrar el campo marcado en rojo. Si no encuentra el error, envíenos un screenshot del formulario completo." },
  { sintoma: "No aparece un módulo en el menú", diagnostico: "Puede ser restricción de plan o de rol.", respuesta: "Hola. Si un módulo no aparece puede ser porque: 1) Su plan actual no incluye ese módulo (consulte Configuración > Mi Suscripción). 2) Su rol de usuario no tiene permiso para acceder (consulte con el administrador de su empresa). 3) Para empresas con ≤10 trabajadores, aplican 7 estándares y algunos módulos avanzados no están disponibles. ¿Cuál módulo busca?" },
  { sintoma: "PDF se descarga vacío o incompleto", diagnostico: "Falta información en la evaluación.", respuesta: "Hola. Los PDFs se generan con la información registrada en el sistema. Si aparece vacío: 1) Verifique que la evaluación tenga estándares calificados. 2) Para el PDF del Ministerio, necesita al menos una evaluación con respuestas. 3) Intente actualizar la página y descargar de nuevo. Si persiste, indíquenos qué PDF intenta generar y de qué sección." },
  { sintoma: "No puede crear más trabajadores", diagnostico: "Límite de plan alcanzado.", respuesta: "Hola. Su plan actual tiene un límite de trabajadores. Puede verificar cuántos tiene registrados y cuál es su límite en Configuración > Mi Suscripción. Si necesita más, puede actualizar su plan desde la misma sección. El precio se ajustará automáticamente según el nuevo número de trabajadores." },
  { sintoma: "La empresa no ve el módulo PESV", diagnostico: "No tiene vehículos registrados.", respuesta: "Hola. El módulo PESV se activa automáticamente cuando la empresa registra al menos un vehículo. Vaya a Configuración > Datos de la Empresa y actualice el campo 'Número de Vehículos'. Una vez tenga vehículos registrados, el tab PESV aparecerá en la navegación." },
  { sintoma: "Error al importar Excel de trabajadores", diagnostico: "Formato del archivo no compatible.", respuesta: "Hola. Para importar correctamente: 1) Use la plantilla Excel que se descarga desde el botón 'Descargar Plantilla'. 2) No modifique los encabezados de las columnas. 3) Los campos de tipo de contrato, género y estado civil aceptan variaciones (con/sin tildes, mayúsculas). 4) Guarde como .xlsx (no .xls ni .csv). Intente con la plantilla oficial y si persiste, envíenos su archivo para revisarlo." },
  { sintoma: "Suscripción bloqueada o expirada", diagnostico: "La suscripción venció o el pago falló.", respuesta: "Hola. Si su suscripción está bloqueada, puede deberse a: 1) Período de prueba vencido — active su suscripción en Configuración > Mi Suscripción. 2) Pago rechazado — verifique su método de pago y reintente. 3) Si cree que es un error, proporciónenos el nombre de su empresa y revisaremos internamente." },
];

const PORTAL_LSO_PROBLEMAS = [
  {
    categoria: "Acceso y Credenciales",
    icono: "KeyRound",
    problemas: [
      {
        problema: "El LSO no puede iniciar sesión en el portal",
        diagnostico: "Credenciales incorrectas o cuenta no creada automáticamente.",
        respuesta: "Hola. Verifique lo siguiente: 1) Las credenciales del Portal LSO se envían por correo electrónico cuando la empresa le asigna como responsable SST. Revise su bandeja de entrada y spam. 2) El acceso al portal es en la misma URL del sistema, con su usuario y contraseña asignados. 3) Si no recibió las credenciales, solicite al administrador de la empresa que lo reasigne desde Configuración > Responsable SST. El sistema generará nuevas credenciales automáticamente. Si el problema persiste, proporciónenos su correo electrónico y el nombre de la empresa para verificar internamente.",
      },
      {
        problema: "El LSO olvidó su contraseña",
        diagnostico: "No hay opción de recuperación automática desde el portal.",
        respuesta: "Hola. Actualmente el restablecimiento de contraseña del Portal LSO se gestiona por soporte. Necesitamos: 1) Su nombre completo. 2) Su correo electrónico registrado. 3) Número de licencia SST. Una vez verificada su identidad, le enviaremos una nueva contraseña temporal a su correo. Le recomendamos cambiarla después de ingresar.",
      },
      {
        problema: "El LSO tiene cuenta pero le aparece acceso restringido",
        diagnostico: "El rol del usuario no tiene permisos de portal LSO.",
        respuesta: "Hola. El acceso al Portal LSO requiere que su usuario tenga el rol 'lso' en el sistema. Esto se configura automáticamente cuando una empresa lo asigna como profesional SST externo. Si antes tenía acceso y ya no lo tiene, es posible que todas las empresas lo hayan desasignado. Contacte a la empresa que desea asignarle para que lo haga desde Configuración > Responsable SST.",
      },
    ],
  },
  {
    categoria: "Firma Digital",
    icono: "PenTool",
    problemas: [
      {
        problema: "El LSO no puede subir su firma digital",
        diagnostico: "Formato de imagen no compatible o tamaño excedido.",
        respuesta: "Hola. Para subir su firma digital correctamente: 1) Vaya a la pestaña 'Mi Licencia' en su portal. 2) La imagen debe ser PNG o JPG. 3) El tamaño máximo es 2 MB. 4) Se recomienda una imagen con fondo blanco y firma en tinta negra o azul oscuro. 5) Puede dibujar su firma en papel blanco, tomarle foto con buena iluminación y recortarla. Si el sistema muestra error al subir, intente con una imagen más pequeña o en otro formato.",
      },
      {
        problema: "La firma aparece como 'no configurada' aunque ya la subió",
        diagnostico: "Error de almacenamiento o imagen no accesible.",
        respuesta: "Hola. Esto puede ocurrir si hubo un problema al guardar la imagen. Por favor intente: 1) Vaya a Mi Licencia > sección Firma Digital. 2) Suba nuevamente la imagen de su firma. 3) Espere a que el sistema confirme 'Firma guardada exitosamente'. 4) Recargue la página (Ctrl+Shift+R) y verifique que aparezca la vista previa. Si sigue sin funcionar, envíenos un screenshot del error que aparece.",
      },
      {
        problema: "Al firmar un documento dice 'Debe configurar su firma primero'",
        diagnostico: "La firma no está registrada o no es accesible.",
        respuesta: "Hola. Antes de firmar cualquier documento, debe configurar su firma digital: 1) Vaya a la pestaña 'Mi Licencia'. 2) En la sección 'Firma Digital', suba su imagen de firma (PNG o JPG, máximo 2 MB). 3) Verifique que aparezca la vista previa de la firma. 4) Una vez configurada, podrá firmar documentos desde la pestaña 'Documentos'. Si ya tiene firma configurada y sigue viendo este error, intente subirla nuevamente.",
      },
      {
        problema: "La firma se ve cortada o borrosa en el PDF",
        diagnostico: "Imagen de baja resolución o proporciones incorrectas.",
        respuesta: "Hola. Para que su firma se vea correctamente en los PDFs: 1) Use una imagen con resolución mínima de 300x150 píxeles. 2) El formato ideal es horizontal (más ancho que alto). 3) Procure que la firma ocupe la mayor parte de la imagen, con poco margen blanco alrededor. 4) Use fondo blanco limpio sin sombras. 5) Suba la nueva imagen desde Mi Licencia > Firma Digital. La firma se actualizará automáticamente en los próximos documentos que firme.",
      },
    ],
  },
  {
    categoria: "Empresas Asignadas",
    icono: "Building2",
    problemas: [
      {
        problema: "El LSO no ve ninguna empresa asignada",
        diagnostico: "No tiene asignaciones activas o fue desasignado.",
        respuesta: "Hola. Si no ve empresas en su portal: 1) Verifique en la pestaña 'Empresas' que no tenga filtros activos. 2) Revise la sección 'Historial de Empresas' al final de la página: si aparecen empresas con estado 'Desasignado', significa que la empresa lo retiró como responsable. 3) Si cree que debería tener empresas asignadas, contacte directamente al administrador de la empresa para que lo reasigne desde Configuración > Responsable SST. El sistema notificará automáticamente cuando sea asignado.",
      },
      {
        problema: "Aparece una empresa que ya no debería ver",
        diagnostico: "Caché del navegador mostrando datos antiguos.",
        respuesta: "Hola. Si ve una empresa que ya no le corresponde: 1) Presione Ctrl+Shift+R para recargar sin caché. 2) Cierre sesión y vuelva a ingresar. 3) Si sigue apareciendo después de estos pasos, repórtelo como nota interna para que el equipo técnico lo revise. Normalmente cuando una empresa desasigna a un LSO, este deja de ver la empresa inmediatamente.",
      },
      {
        problema: "El LSO quiere ver datos de una empresa pero le aparece vacío",
        diagnostico: "La empresa no ha registrado información en el sistema aún.",
        respuesta: "Hola. Si puede ver la empresa pero los datos aparecen vacíos, significa que la empresa aún no ha registrado información en ese módulo. Como profesional LSO, usted puede ver la información que la empresa ha cargado, pero no puede ingresar datos directamente. Contacte al administrador de la empresa para indicarle qué información necesita que registre en el sistema.",
      },
    ],
  },
  {
    categoria: "Firma de Documentos",
    icono: "FileSignature",
    problemas: [
      {
        problema: "El LSO no encuentra documentos pendientes para firmar",
        diagnostico: "No hay documentos generados por las empresas asignadas, o ya fueron firmados.",
        respuesta: "Hola. Los documentos para firmar aparecen cuando las empresas los generan: 1) Vaya a la pestaña 'Documentos'. 2) Seleccione la empresa para ver su 'Bóveda de Documentos'. 3) Los documentos pendientes aparecen con un indicador visual. 4) Los tipos de documentos que puede firmar son: Evaluaciones SST, Planes de Trabajo Anual, Matrices IPERC, Investigaciones de Accidentes y Actas de Designación. Si no ve documentos, es porque la empresa no ha generado ninguno aún. Contacte al administrador de la empresa para coordinar.",
      },
      {
        problema: "Error al intentar firmar un documento",
        diagnostico: "Problema de conectividad o firma no accesible.",
        respuesta: "Hola. Si recibe error al firmar: 1) Verifique que su firma digital esté configurada (Mi Licencia > Firma Digital). 2) Intente recargar la página (Ctrl+Shift+R). 3) Verifique su conexión a internet. 4) Si el error persiste, intente desde otro navegador (Chrome es el recomendado). 5) Si ninguna opción funciona, envíenos un screenshot del error exacto y el nombre del documento que intenta firmar.",
      },
      {
        problema: "El LSO firmó un documento pero no aparece la firma en el PDF",
        diagnostico: "El PDF se generó antes de la firma o hay un problema de renderizado.",
        respuesta: "Hola. La firma aparece en el PDF al momento de descargarlo. Si descargó el PDF antes de firmar, descárguelo nuevamente: 1) Vaya al documento en la Bóveda de la empresa. 2) Verifique que diga 'Firmado' con la fecha. 3) Descargue el PDF nuevamente. El nuevo PDF incluirá su firma digital, nombre, número de licencia SST y la fecha de firma.",
      },
      {
        problema: "El LSO quiere modificar o retirar su firma de un documento",
        diagnostico: "Las firmas son inmutables por diseño de cumplimiento normativo.",
        respuesta: "Hola. Por cumplimiento normativo colombiano, una vez firmado un documento, la firma no puede ser retirada ni modificada. Esto garantiza la trazabilidad y validez legal del documento. Si considera que firmó un documento por error, documente la situación y contacte al administrador de la empresa para que genere un nuevo documento con las correcciones necesarias. El nuevo documento requerirá una nueva firma.",
      },
    ],
  },
  {
    categoria: "Licencia SST",
    icono: "ShieldAlert",
    problemas: [
      {
        problema: "La licencia aparece como 'vencida' pero el LSO dice que la renovó",
        diagnostico: "Los datos de la licencia no han sido actualizados en el sistema.",
        respuesta: "Hola. El estado de la licencia se calcula automáticamente según la fecha de vencimiento registrada. Para actualizar su licencia: 1) Vaya a la pestaña 'Mi Licencia'. 2) Actualice la fecha de vencimiento con la nueva vigencia de su resolución. 3) El sistema recalculará automáticamente el estado. Si no tiene acceso para editar los datos, proporciónenos: número de licencia, entidad emisora, fecha de expedición y nueva fecha de vencimiento, y lo actualizaremos internamente.",
      },
      {
        problema: "La licencia aparece como 'por vencer'",
        diagnostico: "La fecha de vencimiento está próxima (menos de 90 días).",
        respuesta: "Hola. El sistema genera alertas automáticas cuando la licencia SST está a menos de 90 días de vencer. Esto es informativo para que gestione la renovación a tiempo. Una vez renovada, actualice la nueva fecha de vencimiento en Mi Licencia y el estado cambiará a 'Vigente' automáticamente.",
      },
      {
        problema: "El LSO quiere actualizar su tipo de profesión o datos de licencia",
        diagnostico: "Los campos de licencia son editables desde el portal.",
        respuesta: "Hola. Puede actualizar sus datos profesionales desde la pestaña 'Mi Licencia': 1) Número de licencia SST. 2) Entidad emisora (Secretaría de Salud). 3) Fecha de expedición y vencimiento. 4) Tipo de profesión (Tecnólogo, Profesional, Especialista). 5) Curso de 50 horas. Si algún campo no le permite editar, indíquenos qué dato necesita cambiar y lo actualizaremos.",
      },
    ],
  },
  {
    categoria: "Panel PHVA y Bóveda",
    icono: "FolderOpen",
    problemas: [
      {
        problema: "El panel PHVA muestra datos en cero para una empresa",
        diagnostico: "La empresa no ha registrado actividades en esos módulos.",
        respuesta: "Hola. El panel PHVA muestra un resumen del avance de la empresa en el ciclo Planear-Hacer-Verificar-Actuar. Si todo aparece en cero: 1) La empresa aún no ha registrado actividades en esos módulos. 2) Como LSO, puede contactar al administrador de la empresa (botón 'Mensaje' en la pestaña Empresas) para orientarlo sobre qué información debe cargar. 3) A medida que la empresa registre datos (trabajadores, capacitaciones, inspecciones, evaluaciones), el panel se actualizará automáticamente.",
      },
      {
        problema: "No puede acceder a la bóveda de documentos de una empresa",
        diagnostico: "Problema de carga o la empresa no tiene documentos.",
        respuesta: "Hola. Para acceder a la bóveda de documentos: 1) Vaya a la pestaña 'Documentos'. 2) Haga clic en la tarjeta de la empresa que desea consultar. 3) Se abrirá la vista detallada con el panel PHVA y los documentos organizados por tipo. Si la tarjeta de la empresa no aparece, verifique que sigue asignado a esa empresa en la pestaña 'Empresas'. Si aparece la tarjeta pero está vacía, la empresa no ha generado documentos firmables aún.",
      },
    ],
  },
  {
    categoria: "Soporte desde el Portal LSO",
    icono: "MessageCircle",
    problemas: [
      {
        problema: "El LSO quiere crear un ticket de soporte",
        diagnostico: "El portal tiene una pestaña de soporte integrada.",
        respuesta: "Hola. Puede crear tickets de soporte directamente desde su portal: 1) Vaya a la pestaña 'Soporte'. 2) Haga clic en 'Nuevo Ticket'. 3) Complete el asunto, seleccione la prioridad y describa su consulta. 4) El ticket será atendido por nuestro equipo de soporte. Puede hacer seguimiento del estado y responder desde el mismo portal.",
      },
      {
        problema: "El LSO quiere comunicarse con el administrador de una empresa",
        diagnostico: "Existe un sistema de mensajería interna en la pestaña Empresas.",
        respuesta: "Hola. Para comunicarse con una empresa asignada: 1) Vaya a la pestaña 'Empresas'. 2) Busque la empresa en la lista. 3) Haga clic en el botón 'Mensaje'. 4) Complete el asunto, seleccione la prioridad y escriba el contenido. 5) El mensaje llegará al administrador de la empresa como notificación interna del sistema. Esta es la vía recomendada para coordinar actividades de SST con sus empresas asignadas.",
      },
    ],
  },
];

const PORTAL_EMPLEADOS_PROBLEMAS = [
  {
    problema: "El trabajador no puede acceder al portal de empleados",
    diagnostico: "Credenciales no generadas o portal no activado por la empresa.",
    respuesta: "Hola. El acceso al Portal de Empleados debe ser activado por el administrador de su empresa. Comuníquese con el responsable de SST de su empresa para que le genere las credenciales de acceso desde el sistema. Si ya tiene credenciales y no puede ingresar, verifique que esté usando el usuario y contraseña correctos. Si olvidó su contraseña, solicite al administrador que la restablezca.",
  },
  {
    problema: "El trabajador no ve sus exámenes médicos en el portal",
    diagnostico: "La empresa no ha registrado los exámenes o no los ha notificado.",
    respuesta: "Hola. Los exámenes médicos aparecen en su portal cuando el administrador de la empresa los registra y le envía la notificación. Si no ve sus exámenes: 1) Es posible que la empresa aún no los haya registrado en el sistema. 2) Contacte al responsable de SST de su empresa para verificar. Los exámenes que aparezcan requerirán su confirmación de lectura.",
  },
  {
    problema: "El trabajador quiere reportar una condición insegura o sugerencia",
    diagnostico: "Existe un buzón de sugerencias en el portal.",
    respuesta: "Hola. Puede reportar condiciones inseguras o hacer sugerencias desde su portal de empleado: 1) Busque la sección 'Buzón de Sugerencias' o 'Reportar Condición'. 2) Complete el formulario describiendo la situación. 3) El reporte llegará al responsable de SST de su empresa para su gestión. Su identidad se mantiene confidencial según la política de la empresa.",
  },
  {
    problema: "El trabajador no puede ver documentos o capacitaciones",
    diagnostico: "La empresa debe compartir los documentos a través del portal.",
    respuesta: "Hola. Los documentos y capacitaciones aparecen en su portal cuando la empresa los comparte con usted. Si no ve información: 1) La empresa puede no haber activado la opción de compartir esos documentos. 2) Contacte al responsable de SST para que verifique qué información está disponible en el portal. El portal muestra únicamente la información que la empresa decide compartir con sus trabajadores.",
  },
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

  const filteredLSOProblemas = PORTAL_LSO_PROBLEMAS.filter(cat =>
    cat.problemas.some(p => filterBySearch(`${cat.categoria} ${p.problema} ${p.diagnostico} ${p.respuesta}`))
  );

  const filteredEmpleadosProblemas = PORTAL_EMPLEADOS_PROBLEMAS.filter(p =>
    filterBySearch(`portal empleados trabajador ${p.problema} ${p.diagnostico} ${p.respuesta}`)
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
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md p-4">
              <p className="font-semibold text-red-800 dark:text-red-200">
                NUNCA acceder a los datos del cliente. Solo instrucciones escritas en el ticket. No llamadas, no acceso remoto.
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

      {(!searchTerm || filteredLSOProblemas.length > 0) && (
        <CollapsibleSection
          title={`Portal LSO - Guía de Soporte (${filteredLSOProblemas.reduce((acc, cat) => acc + cat.problemas.length, 0)} soluciones en ${filteredLSOProblemas.length} categorías)`}
          icon={<UserCheck className="h-5 w-5 text-teal-600" />}
          defaultOpen={!!searchTerm}
        >
          <p className="text-sm text-muted-foreground mb-4">
            El Portal LSO es la herramienta de los profesionales en SST (Licenciados en Salud Ocupacional) para gestionar las empresas que tienen asignadas, firmar documentos digitalmente, y hacer seguimiento al cumplimiento normativo. Los problemas más comunes son de acceso, firma digital y visualización de empresas.
          </p>
          <div className="space-y-6">
            {filteredLSOProblemas.map((cat, catIdx) => (
              <div key={catIdx} className="space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b">
                  {cat.icono === "KeyRound" && <KeyRound className="h-4 w-4 text-teal-600" />}
                  {cat.icono === "PenTool" && <PenTool className="h-4 w-4 text-teal-600" />}
                  {cat.icono === "Building2" && <Building2 className="h-4 w-4 text-teal-600" />}
                  {cat.icono === "FileSignature" && <FileSignature className="h-4 w-4 text-teal-600" />}
                  {cat.icono === "ShieldAlert" && <ShieldAlert className="h-4 w-4 text-teal-600" />}
                  {cat.icono === "FolderOpen" && <FolderOpen className="h-4 w-4 text-teal-600" />}
                  {cat.icono === "MessageCircle" && <MessageCircle className="h-4 w-4 text-teal-600" />}
                  <p className="font-medium text-sm">{cat.categoria}</p>
                  <Badge variant="outline">{cat.problemas.length}</Badge>
                </div>
                {cat.problemas
                  .filter(p => filterBySearch(`${cat.categoria} ${p.problema} ${p.diagnostico} ${p.respuesta}`))
                  .map((p, pIdx) => (
                  <div key={pIdx} className="border rounded-md p-4 space-y-2 ml-2">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <p className="font-medium text-sm">{p.problema}</p>
                      <Badge variant="secondary">{p.diagnostico}</Badge>
                    </div>
                    <Separator />
                    <CopyableResponse text={p.respuesta} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {(!searchTerm || filteredEmpleadosProblemas.length > 0) && (
        <CollapsibleSection
          title={`Portal Empleados - Guía de Soporte (${filteredEmpleadosProblemas.length} soluciones)`}
          icon={<HardHat className="h-5 w-5 text-indigo-600" />}
          defaultOpen={!!searchTerm}
        >
          <p className="text-sm text-muted-foreground mb-4">
            El Portal de Empleados permite a los trabajadores consultar su información de SST, confirmar lectura de exámenes médicos, reportar condiciones inseguras y acceder a documentos compartidos por la empresa.
          </p>
          <div className="space-y-4">
            {filteredEmpleadosProblemas.map((p, idx) => (
              <div key={idx} className="border rounded-md p-4 space-y-2">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <p className="font-medium text-sm">{p.problema}</p>
                  <Badge variant="secondary">{p.diagnostico}</Badge>
                </div>
                <Separator />
                <CopyableResponse text={p.respuesta} />
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {(!searchTerm || filteredModulos.length > 0) && (
        <CollapsibleSection
          title={`Módulos de Evidencia SST (${filteredModulos.length} módulos para 61 estándares)`}
          icon={<ClipboardList className="h-5 w-5 text-blue-500" />}
          defaultOpen={!!searchTerm}
        >
          <p className="text-sm text-muted-foreground mb-4">
            El primer módulo es la Evaluación SST (archivo maestro) donde se califican TODOS los estándares. Los demás módulos son herramientas donde el cliente registra la evidencia de soporte. El flujo es: registrar datos en el módulo correspondiente y luego calificar el estándar en la Evaluación SST.
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

      {(!searchTerm || ESTANDARES_RESUMEN.filter(e => filterBySearch(`${e.codigo} ${e.nombre} ${e.componente}`)).length > 0) && (
        <CollapsibleSection
          title={`Los 61 Estándares - Resolución 0312/2019 (${searchTerm ? ESTANDARES_RESUMEN.filter(e => filterBySearch(`${e.codigo} ${e.nombre} ${e.componente}`)).length : 61} estándares)`}
          icon={<FileText className="h-5 w-5 text-green-500" />}
          defaultOpen={!!searchTerm}
        >
          <p className="text-sm text-muted-foreground mb-4">
            TODOS se califican desde la Evaluación SST (archivo maestro). El agente debe guiar al cliente: Verificar {'>'} Evaluaciones SST {'>'} abrir evaluación {'>'} buscar el estándar {'>'} clic para ver modo de verificación {'>'} calificar. Cada respuesta incluye qué evidencia pide el modo de verificación y dónde registrarla.
          </p>
          <div className="space-y-2">
            {(searchTerm ? ESTANDARES_RESUMEN.filter(e => filterBySearch(`${e.codigo} ${e.nombre} ${e.componente}`)) : ESTANDARES_RESUMEN).map((e, idx) => (
              <div key={idx} className="border rounded-md p-3 space-y-2">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" data-testid={`badge-estandar-${e.codigo}`}>{e.codigo}</Badge>
                    <span className="text-sm font-medium">{e.nombre}</span>
                  </div>
                  <Badge variant="outline">{e.componente}</Badge>
                </div>
                <CopyableResponse text={e.respuesta} />
              </div>
            ))}
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
            Los 24 pasos del PESV se gestionan TODOS desde la Evaluación PESV (archivo maestro en PESV {'>'} Evaluaciones PESV). Al abrir la evaluación, el cliente navega por pestañas (Planear, Hacer, Verificar, Actuar) y hace clic en cada paso para calificarlo. El diálogo sugiere módulos relacionados para registrar evidencia.
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
            SADGI S.A.S. — NIT 902.036.337-4 — Manual de Soporte v3.0 — Actualizado {new Date().toLocaleDateString('es-CO')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
