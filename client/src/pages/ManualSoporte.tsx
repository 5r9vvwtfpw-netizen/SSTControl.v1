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
    modulo: "Evaluación de Estándares SST (Archivo Maestro)",
    ruta: "Verificar > Evaluaciones SST > [Abrir Evaluación]",
    descripcion: "Este es el ARCHIVO MAESTRO del SG-SST. Todos los estándares de la Resolución 0312/2019 se gestionan desde aquí. Al hacer clic en un estándar se abre un diálogo donde se califica Cumple/No Cumple/No Aplica. El sistema sugiere enlaces a los módulos relacionados como evidencia.",
    preguntasFrecuentes: [
      { pregunta: "Cómo calificar un estándar", respuesta: "Hola [Nombre]. Vaya a Verificar > Evaluaciones SST y abra su evaluación activa. Verá los estándares agrupados por componente. Haga clic en el estándar que desea calificar y se abrirá un diálogo con las opciones: 'Cumple' (otorga puntaje), 'No Cumple' (0 puntos) o 'No Aplica' (mantiene puntaje si se justifica). El sistema calcula automáticamente el porcentaje total." },
      { pregunta: "Cuántos estándares me aplican", respuesta: "Hola [Nombre]. Depende del tamaño y riesgo de su empresa: Microempresa (hasta 10 trabajadores, Riesgo I-III) = 7 estándares. Pequeña empresa (11-50, Riesgo I-III) = 21 estándares. Mediana/Grande (más de 50 o Riesgo IV-V) = 61 estándares. El sistema lo calcula automáticamente al crear la evaluación." },
      { pregunta: "No encuentro un estándar específico", respuesta: "Hola [Nombre]. Dentro de su evaluación SST, los estándares están agrupados por 7 componentes (Recursos, Gestión Integral, Gestión de Salud, etc.). Desplácese por la lista o use el componente correspondiente para encontrar el estándar. El número del estándar (ej: 1.1.1) le ayuda a ubicarlo rápidamente." },
      { pregunta: "Cómo generar el PDF del Ministerio", respuesta: "Hola [Nombre]. Abra su evaluación SST en Verificar > Evaluaciones SST y busque el botón 'PDF Ministerio del Trabajo'. Se generará un informe completo con secciones A-I incluyendo el Hilo Dorado de trazabilidad que conecta estándares, acciones de mejora y actividades del plan de trabajo." },
      { pregunta: "Cómo crear una acción de mejora desde un estándar", respuesta: "Hola [Nombre]. Dentro de la evaluación SST, al calificar un estándar como 'No Cumple', el sistema le permite crear directamente una acción de mejora vinculada. Así queda la trazabilidad completa entre el estándar incumplido y la acción correctiva." },
    ],
  },
  {
    modulo: "Trabajadores",
    ruta: "Evidencia para estándares 1.1.4, 3.1.1",
    descripcion: "Registro de empleados. Los datos aquí sirven como evidencia de soporte cuando califique estándares en la Evaluación SST.",
    preguntasFrecuentes: [
      { pregunta: "No puede registrar un trabajador", respuesta: "Hola [Nombre]. Abra su Evaluación SST (Verificar > Evaluaciones SST). Busque el estándar que necesita (ej: 1.1.4 Afiliaciones). Al hacer clic verá el modo de verificación que le indica qué evidencia necesita. El sistema le sugiere el módulo de Trabajadores donde puede registrar la información. Si aparece un error de límite de trabajadores, verifique su plan en Configuración > Mi Suscripción." },
      { pregunta: "Quiere importar trabajadores masivamente", respuesta: "Hola [Nombre]. Primero revise qué estándares necesitan datos de trabajadores abriendo su Evaluación SST. Para importar masivamente, desde la lista de trabajadores use el botón 'Importar Excel'. Descargue la plantilla, llénela y súbala. El sistema acepta variaciones en los nombres de campos." },
      { pregunta: "No encuentra un trabajador registrado", respuesta: "Hola [Nombre]. Desde la lista de trabajadores, use la barra de búsqueda por nombre o documento. Verifique que no haya filtros activos." },
    ],
  },
  {
    modulo: "Capacitaciones",
    ruta: "Evidencia para estándares 1.2.1, 1.2.2, 1.2.3",
    descripcion: "Registro de capacitaciones. Genera evidencia de soporte para estándares de capacitación que se califican en la Evaluación SST.",
    preguntasFrecuentes: [
      { pregunta: "Cómo registrar una capacitación", respuesta: "Hola [Nombre]. Abra su Evaluación SST (Verificar > Evaluaciones SST) y busque los estándares 1.2.1, 1.2.2 o 1.2.3. Haga clic en el estándar para ver el modo de verificación: le indica qué evidencia necesita. El sistema le sugiere el módulo de Capacitaciones donde puede crear registros (Tema, Fecha, Duración, Instructor, Asistentes). Después regrese a la Evaluación para calificar el estándar como Cumple." },
      { pregunta: "Cómo registrar asistencia", respuesta: "Hola [Nombre]. Abra la capacitación registrada y en la sección de Asistentes, marque cada trabajador que asistió. Esta evidencia respalda los estándares 1.2.1-1.2.3 que califica desde su Evaluación SST." },
      { pregunta: "Qué capacitaciones son obligatorias", respuesta: "Hola [Nombre]. Abra su Evaluación SST y revise los estándares 1.2.1 (programa anual), 1.2.2 (inducción/reinducción) y 1.2.3 (curso 50 horas). Al hacer clic en cada uno verá el modo de verificación que describe exactamente qué se necesita. Registre las capacitaciones como evidencia y luego califique cada estándar." },
    ],
  },
  {
    modulo: "Inspecciones de Seguridad",
    ruta: "Evidencia para estándar 4.2.5",
    descripcion: "Registro de inspecciones. Genera evidencia de soporte para estándares de control de riesgos en la Evaluación SST.",
    preguntasFrecuentes: [
      { pregunta: "Cómo crear una inspección", respuesta: "Hola [Nombre]. Abra su Evaluación SST (Verificar > Evaluaciones SST) y busque el estándar 4.2.5 (inspecciones sistemáticas). Haga clic para ver el modo de verificación: le indica qué evidencia necesita. El sistema le sugiere el módulo de Inspecciones donde puede crear registros (tipo, fecha, área, hallazgos). Después regrese a la Evaluación para calificar." },
      { pregunta: "Qué tipos de inspección hay", respuesta: "Hola [Nombre]. El sistema soporta: inspección general, de EPP, orden y aseo, extintores y botiquines. Cada tipo genera evidencia que respalda estándares específicos en su Evaluación SST." },
    ],
  },
  {
    modulo: "Accidentes e Incidentes",
    ruta: "Evidencia para estándares 3.2.1, 3.2.2, 3.2.3",
    descripcion: "Registro de accidentes, incidentes y enfermedades laborales. Genera evidencia de soporte para estándares de reporte e investigación en la Evaluación SST.",
    preguntasFrecuentes: [
      { pregunta: "Cómo registrar un accidente", respuesta: "Hola [Nombre]. Abra su Evaluación SST (Verificar > Evaluaciones SST) y busque los estándares 3.2.1 (reporte), 3.2.2 (investigación) o 3.2.3 (registro estadístico). Haga clic en el estándar para ver el modo de verificación: le indica exactamente qué evidencia necesita. El sistema le sugiere el módulo de Accidentes donde puede registrar el tipo, fecha, trabajador afectado y medidas tomadas. Después regrese a la Evaluación para calificar." },
      { pregunta: "Cómo hacer la investigación del accidente", respuesta: "Hola [Nombre]. El estándar 3.2.2 de su Evaluación SST requiere investigación de accidentes. Abra el accidente registrado, busque la sección de Investigación y complete: participantes, hallazgos, causas raíz y acciones correctivas. Luego califique el estándar 3.2.2 en la Evaluación." },
    ],
  },
  {
    modulo: "Exámenes Médicos",
    ruta: "Evidencia para estándares 3.1.1, 3.1.2, 3.1.3",
    descripcion: "Control de exámenes médicos ocupacionales. Genera evidencia de soporte para estándares de salud en la Evaluación SST.",
    preguntasFrecuentes: [
      { pregunta: "Cómo registrar un examen médico", respuesta: "Hola [Nombre]. Abra su Evaluación SST (Verificar > Evaluaciones SST) y busque los estándares 3.1.1 a 3.1.3. Haga clic en el estándar para ver el modo de verificación: le describe qué evidencia necesita (exámenes de ingreso, periódicos, etc.). El sistema le sugiere el módulo de Exámenes Médicos donde puede registrar trabajador, tipo, fecha y concepto. Después regrese a la Evaluación para calificar." },
      { pregunta: "Cómo ver exámenes próximos a vencer", respuesta: "Hola [Nombre]. El sistema envía alertas automáticas cuando los exámenes están próximos a vencer. Puede ver el listado desde el módulo de Exámenes Médicos ordenando por fecha de vencimiento. Mantenga los exámenes al día para cumplir los estándares 3.1.1-3.1.3 en su Evaluación SST." },
    ],
  },
  {
    modulo: "Entrega de EPP",
    ruta: "Evidencia para estándar 4.2.4",
    descripcion: "Registro de entrega de EPP. Genera evidencia de soporte para el estándar de protección personal en la Evaluación SST.",
    preguntasFrecuentes: [
      { pregunta: "Cómo registrar entrega de EPP", respuesta: "Hola [Nombre]. Abra su Evaluación SST (Verificar > Evaluaciones SST) y busque el estándar 4.2.4. Haga clic para ver el modo de verificación: le indica qué evidencia de entrega de EPP necesita. El sistema le sugiere el módulo de Entrega EPP donde puede registrar trabajador, elementos del catálogo, cantidad y fechas. Después regrese a la Evaluación para calificar." },
    ],
  },
  {
    modulo: "Plan de Trabajo Anual",
    ruta: "Evidencia para estándar 2.4.1",
    descripcion: "Cronograma anual de actividades SST. Genera evidencia de soporte y permite vincular actividades con acciones de mejora.",
    preguntasFrecuentes: [
      { pregunta: "Cómo crear el plan anual", respuesta: "Hola [Nombre]. Abra su Evaluación SST (Verificar > Evaluaciones SST) y busque el estándar 2.4.1. El modo de verificación le indica qué debe contener el plan de trabajo. El sistema le sugiere el módulo de Plan de Trabajo donde puede crear el plan con actividades, responsables, cronograma y recursos. Las actividades se pueden vincular a acciones del Plan de Mejora." },
      { pregunta: "Cómo marcar una actividad como completada", respuesta: "Hola [Nombre]. En el detalle del plan, cada actividad tiene un toggle para completarla. Si está vinculada a una acción de mejora, el avance se recalcula automáticamente. Este progreso respalda el estándar 2.4.1 en su Evaluación SST." },
    ],
  },
  {
    modulo: "Matriz IPERC",
    ruta: "Evidencia para estándares 4.1.1 a 4.1.4",
    descripcion: "Identificación de Peligros y Control de Riesgos (GTC 45). Genera evidencia de soporte para estándares de gestión de riesgos en la Evaluación SST.",
    preguntasFrecuentes: [
      { pregunta: "Cómo crear la matriz de riesgos", respuesta: "Hola [Nombre]. Abra su Evaluación SST (Verificar > Evaluaciones SST) y busque los estándares 4.1.1 a 4.1.4. El modo de verificación le indica qué evidencia de identificación de peligros necesita. El sistema le sugiere el módulo Matriz IPERC donde puede agregar procesos, peligros, niveles de riesgo y controles. Después regrese a la Evaluación para calificar." },
    ],
  },
  {
    modulo: "Indicadores de Accidentalidad",
    ruta: "Evidencia para estándares 3.3.1 a 3.3.6",
    descripcion: "Indicadores obligatorios (Frecuencia, Severidad, Mortalidad, etc.). Se calculan automáticamente y generan evidencia para la Evaluación SST.",
    preguntasFrecuentes: [
      { pregunta: "Cómo se calculan los indicadores", respuesta: "Hola [Nombre]. Abra su Evaluación SST (Verificar > Evaluaciones SST) y busque los estándares 3.3.1 a 3.3.6. El modo de verificación le indica qué indicadores se requieren. El sistema los calcula automáticamente a partir de los accidentes registrados. Verifique los valores y luego califique cada estándar en la Evaluación." },
    ],
  },
  {
    modulo: "Objetivos SST",
    ruta: "Evidencia para estándar 2.2.1",
    descripcion: "Definición y seguimiento de objetivos del SG-SST. Se pueden vincular con estándares de la Resolución 0312.",
    preguntasFrecuentes: [
      { pregunta: "Cómo vincular objetivos con estándares", respuesta: "Hola [Nombre]. Abra su Evaluación SST y busque el estándar 2.2.1 (objetivos). El modo de verificación le indica qué debe contener. Al crear objetivos, puede vincularlos con estándares específicos para trazabilidad formal. Después califique el estándar en la Evaluación." },
    ],
  },
  {
    modulo: "Matriz Legal",
    ruta: "Evidencia para estándar 2.7.1",
    descripcion: "Gestión de requisitos legales aplicables. Genera evidencia de soporte para la Evaluación SST.",
    preguntasFrecuentes: [
      { pregunta: "Cómo agregar un requisito legal", respuesta: "Hola [Nombre]. Abra su Evaluación SST (Verificar > Evaluaciones SST) y busque el estándar 2.7.1. El modo de verificación le indica qué debe contener la matriz legal. El sistema le sugiere el módulo donde puede registrar normas, artículos, obligaciones y responsables. Después regrese a la Evaluación para calificar." },
    ],
  },
  {
    modulo: "Plan de Emergencias",
    ruta: "Evidencia para estándares 5.1.1 a 5.1.3",
    descripcion: "Plan de prevención y respuesta ante emergencias. Genera evidencia de soporte para la Evaluación SST.",
    preguntasFrecuentes: [
      { pregunta: "Qué incluye el plan de emergencias", respuesta: "Hola [Nombre]. Abra su Evaluación SST (Verificar > Evaluaciones SST) y busque los estándares 5.1.1 a 5.1.3. El modo de verificación le indica qué evidencia necesita (amenazas, brigadas, simulacros). El sistema le sugiere el módulo de Plan de Emergencias donde puede registrar todo. Después regrese a la Evaluación para calificar." },
    ],
  },
  {
    modulo: "Auditorías Internas",
    ruta: "Evidencia para estándares 6.1.2, 6.1.4",
    descripcion: "Auditorías internas del SG-SST. Genera evidencia de soporte para la Evaluación SST.",
    preguntasFrecuentes: [
      { pregunta: "Cómo crear una auditoría", respuesta: "Hola [Nombre]. Abra su Evaluación SST (Verificar > Evaluaciones SST) y busque los estándares 6.1.2 y 6.1.4. El modo de verificación le indica qué debe cubrir la auditoría. El sistema le sugiere el módulo de Auditorías donde puede crear registros con criterios pre-cargados. Después regrese a la Evaluación para calificar." },
    ],
  },
  {
    modulo: "Revisión por la Dirección",
    ruta: "Evidencia para estándar 6.1.3",
    descripcion: "Revisión anual del SG-SST por la alta dirección. Genera evidencia de soporte para la Evaluación SST.",
    preguntasFrecuentes: [
      { pregunta: "Qué debe incluir la revisión", respuesta: "Hola [Nombre]. Abra su Evaluación SST (Verificar > Evaluaciones SST) y busque el estándar 6.1.3. El modo de verificación le indica qué debe incluir la revisión (auditorías, indicadores, acciones correctivas, conclusiones). El sistema le sugiere el módulo de Revisión por la Dirección donde puede generar el formato. Después regrese a la Evaluación para calificar." },
    ],
  },
  {
    modulo: "Plan de Mejoramiento",
    ruta: "Evidencia para estándares 7.1.1 a 7.1.4",
    descripcion: "Acciones preventivas, correctivas y de mejora. Se pueden vincular a actividades del Plan de Trabajo.",
    preguntasFrecuentes: [
      { pregunta: "Cómo crear una acción de mejora", respuesta: "Hola [Nombre]. Abra su Evaluación SST (Verificar > Evaluaciones SST). Al calificar un estándar como 'No Cumple', el sistema le permite crear directamente una acción de mejora vinculada al estándar. También puede buscar los estándares 7.1.1-7.1.4 para ver el modo de verificación del plan de mejoramiento completo. Las acciones se vinculan automáticamente al Plan de Trabajo para seguimiento del avance." },
    ],
  },
  {
    modulo: "COPASST / Vigía",
    ruta: "Evidencia para estándares 1.1.6, 1.1.7",
    descripcion: "Comité Paritario o Vigía de SST. Genera evidencia de soporte para la Evaluación SST.",
    preguntasFrecuentes: [
      { pregunta: "Diferencia entre COPASST y Vigía", respuesta: "Hola [Nombre]. Abra su Evaluación SST y busque los estándares 1.1.6 y 1.1.7. El modo de verificación le indica qué evidencia necesita según el tamaño de su empresa: menos de 10 trabajadores = Vigía, 10 o más = COPASST. El sistema se adapta automáticamente. Registre la evidencia en el módulo sugerido y luego califique los estándares." },
    ],
  },
  {
    modulo: "Gestión del Cambio",
    ruta: "Evidencia para estándar 2.11.1",
    descripcion: "Registro de cambios que afectan la SST. Genera evidencia de soporte para la Evaluación SST.",
    preguntasFrecuentes: [
      { pregunta: "Cuándo registrar un cambio", respuesta: "Hola [Nombre]. Abra su Evaluación SST y busque el estándar 2.11.1. El modo de verificación le indica qué cambios debe documentar (procesos, equipos, instalaciones, personal, sustancias, normas). Registre los cambios en el módulo sugerido y luego califique el estándar en la Evaluación." },
    ],
  },
  {
    modulo: "Comunicación SST",
    ruta: "Evidencia para estándar 2.8.1",
    descripcion: "Gestión de comunicaciones internas y externas sobre SST. Genera evidencia de soporte para la Evaluación SST.",
    preguntasFrecuentes: [
      { pregunta: "Qué comunicaciones debo registrar", respuesta: "Hola [Nombre]. Abra su Evaluación SST y busque el estándar 2.8.1. El modo de verificación le indica qué comunicaciones debe documentar (políticas, cambios, alertas, convocatorias). Registre las comunicaciones en el módulo sugerido y luego califique el estándar en la Evaluación." },
    ],
  },
  {
    modulo: "Mi Cuenta / Suscripción",
    ruta: "Configuración > Mi Suscripción",
    descripcion: "Gestión de plan, facturación y configuración de la empresa.",
    preguntasFrecuentes: [
      { pregunta: "Cómo cambiar de plan", respuesta: "Hola [Nombre]. Vaya a Configuración > Mi Suscripción. Allí verá su plan actual y las opciones disponibles. Al cambiar datos como número de trabajadores o vehículos, el precio se recalcula automáticamente." },
      { pregunta: "Cómo ver facturas", respuesta: "Hola [Nombre]. En Configuración > Mi Suscripción encontrará el historial de facturas, próxima fecha de cobro y método de pago." },
      { pregunta: "Cómo agregar usuarios", respuesta: "Hola [Nombre]. Vaya a Configuración > Usuarios > 'Nuevo Usuario'. Cada rol administrativo incluye un usuario sin costo adicional." },
    ],
  },
];

const PASOS_PESV = [
  { codigo: "P01", nombre: "Equipo de Trabajo", descripcion: "Se gestiona desde la Evaluación PESV (archivo maestro). Haga clic en el paso P01 dentro de su evaluación activa.", respuesta: "Hola [Nombre]. Para gestionar el paso P01 (Equipo de Trabajo), vaya a PESV > Evaluaciones PESV y abra su evaluación activa. Busque la pestaña 'Planear' y haga clic en el paso P01. Se abrirá un diálogo donde puede calificar el cumplimiento. El sistema le mostrará los módulos relacionados (como Comité PESV) donde puede registrar la evidencia de soporte." },
  { codigo: "P02", nombre: "Liderazgo y Compromiso", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso P02 dentro de la pestaña Planear.", respuesta: "Hola [Nombre]. Para gestionar el paso P02 (Liderazgo y Compromiso), abra su Evaluación PESV activa en PESV > Evaluaciones PESV, pestaña 'Planear', y haga clic en P02. Allí califica el cumplimiento. La evidencia de soporte (política de seguridad vial, compromisos de la dirección) se puede documentar en los módulos que el sistema sugiere dentro del mismo diálogo." },
  { codigo: "P03", nombre: "Diagnóstico / Contexto", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso P03 dentro de la pestaña Planear.", respuesta: "Hola [Nombre]. Para el paso P03 (Diagnóstico/Contexto), abra su Evaluación PESV activa, pestaña 'Planear', y haga clic en P03. Complete la información sobre el contexto organizacional en seguridad vial. El sistema pre-llena datos sugeridos según el nivel de complejidad de su empresa." },
  { codigo: "P04", nombre: "Evaluación de Riesgos Viales", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso P04 dentro de la pestaña Planear.", respuesta: "Hola [Nombre]. Para el paso P04 (Evaluación de Riesgos Viales), abra su Evaluación PESV activa, pestaña 'Planear', y haga clic en P04. El diálogo le permite calificar el cumplimiento y le sugiere los módulos donde registrar la evidencia (identificación de peligros viales por factor humano, vehículo, infraestructura y condiciones ambientales)." },
  { codigo: "P05", nombre: "Objetivos e Indicadores", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso P05 dentro de la pestaña Planear.", respuesta: "Hola [Nombre]. Para el paso P05 (Objetivos e Indicadores), abra su Evaluación PESV activa, pestaña 'Planear', y haga clic en P05. El sistema le mostrará los módulos relacionados donde puede definir metas medibles de reducción de siniestralidad y cumplimiento de inspecciones." },
  { codigo: "P06", nombre: "Programas y Planes", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso P06 dentro de la pestaña Planear.", respuesta: "Hola [Nombre]. Para el paso P06 (Programas y Planes), abra su Evaluación PESV activa, pestaña 'Planear', y haga clic en P06. Allí califica el cumplimiento y el sistema sugiere los módulos de factores de desempeño donde registrar la evidencia." },
  { codigo: "P07", nombre: "Roles y Responsabilidades", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso P07 dentro de la pestaña Planear.", respuesta: "Hola [Nombre]. Para el paso P07 (Roles y Responsabilidades), abra su Evaluación PESV activa, pestaña 'Planear', y haga clic en P07. Defina quién es responsable de cada aspecto del plan de seguridad vial desde el diálogo de calificación." },
  { codigo: "P08", nombre: "Recursos", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso P08 dentro de la pestaña Planear.", respuesta: "Hola [Nombre]. Para el paso P08 (Recursos), abra su Evaluación PESV activa, pestaña 'Planear', y haga clic en P08. Documente la asignación de presupuesto, equipos y personal para la implementación del PESV." },
  { codigo: "H01", nombre: "Factor Humano - Conductores", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso H01 dentro de la pestaña Hacer.", respuesta: "Hola [Nombre]. Para el paso H01 (Factor Humano - Conductores), abra su Evaluación PESV activa, pestaña 'Hacer', y haga clic en H01. El sistema le sugiere el módulo de Conductores donde puede registrar la evidencia (datos del conductor, categoría de licencia, exámenes médicos)." },
  { codigo: "H02", nombre: "Capacitación Vial", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso H02 dentro de la pestaña Hacer.", respuesta: "Hola [Nombre]. Para el paso H02 (Capacitación Vial), abra su Evaluación PESV activa, pestaña 'Hacer', y haga clic en H02. El sistema sugiere el módulo de Capacitaciones PESV donde puede registrar eventos de formación (manejo defensivo, normativa de tránsito, primeros auxilios viales) y asistencia." },
  { codigo: "H03", nombre: "Documentación de Conductores", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso H03 dentro de la pestaña Hacer.", respuesta: "Hola [Nombre]. Para el paso H03 (Documentación de Conductores), abra su Evaluación PESV activa, pestaña 'Hacer', y haga clic en H03. El sistema sugiere el módulo de Conductores donde puede hacer seguimiento de licencias, certificaciones, exámenes y sanciones." },
  { codigo: "H04", nombre: "Vehículos Seguros", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso H04 dentro de la pestaña Hacer.", respuesta: "Hola [Nombre]. Para el paso H04 (Vehículos Seguros), abra su Evaluación PESV activa, pestaña 'Hacer', y haga clic en H04. El sistema sugiere el módulo de Vehículos donde puede registrar la flota (placa, marca, modelo, SOAT, revisión tecnomecánica)." },
  { codigo: "H05", nombre: "Mantenimiento Preventivo", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso H05 dentro de la pestaña Hacer.", respuesta: "Hola [Nombre]. Para el paso H05 (Mantenimiento Preventivo), abra su Evaluación PESV activa, pestaña 'Hacer', y haga clic en H05. El sistema sugiere el módulo de Vehículos > Mantenimiento donde registrar mantenimientos preventivos y correctivos." },
  { codigo: "H06", nombre: "Inspecciones Preoperacionales", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso H06 dentro de la pestaña Hacer.", respuesta: "Hola [Nombre]. Para el paso H06 (Inspecciones Preoperacionales), abra su Evaluación PESV activa, pestaña 'Hacer', y haga clic en H06. El sistema sugiere el módulo de Inspecciones PESV donde completar la lista de verificación diaria (frenos, luces, llantas, documentos)." },
  { codigo: "H07", nombre: "Gestión de Velocidad", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso H07 dentro de la pestaña Hacer.", respuesta: "Hola [Nombre]. Para el paso H07 (Gestión de Velocidad), abra su Evaluación PESV activa, pestaña 'Hacer', y haga clic en H07. Si su empresa tiene GPS, el sistema sugiere el módulo de Monitoreo GPS para seguimiento de velocidad y alertas." },
  { codigo: "H08", nombre: "Rutas Seguras", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso H08 dentro de la pestaña Hacer.", respuesta: "Hola [Nombre]. Para el paso H08 (Rutas Seguras), abra su Evaluación PESV activa, pestaña 'Hacer', y haga clic en H08. El sistema sugiere el módulo de Rutas Seguras donde registrar rutas con origen, destino, distancia, puntos críticos y medidas de control." },
  { codigo: "H09", nombre: "Fatiga y Somnolencia", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso H09 dentro de la pestaña Hacer.", respuesta: "Hola [Nombre]. Para el paso H09 (Fatiga y Somnolencia), abra su Evaluación PESV activa, pestaña 'Hacer', y haga clic en H09. Documente las medidas implementadas: control de jornadas, pausas activas, programas de descanso y monitoreo de signos de fatiga directamente en el diálogo de calificación." },
  { codigo: "H10", nombre: "Sustancias Psicoactivas", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso H10 dentro de la pestaña Hacer.", respuesta: "Hola [Nombre]. Para el paso H10 (Sustancias Psicoactivas), abra su Evaluación PESV activa, pestaña 'Hacer', y haga clic en H10. Documente la política de alcohol y drogas, pruebas realizadas, programas de prevención y procedimientos ante casos positivos en el diálogo de calificación." },
  { codigo: "H11", nombre: "Atención a Víctimas", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso H11 dentro de la pestaña Hacer.", respuesta: "Hola [Nombre]. Para el paso H11 (Atención a Víctimas), abra su Evaluación PESV activa, pestaña 'Hacer', y haga clic en H11. Documente el protocolo de primeros auxilios, directorio de emergencias viales, procedimiento de reporte y acompañamiento a víctimas en el diálogo de calificación." },
  { codigo: "V01", nombre: "Indicadores de Gestión", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso V01 dentro de la pestaña Verificar.", respuesta: "Hola [Nombre]. Para el paso V01 (Indicadores de Gestión), abra su Evaluación PESV activa, pestaña 'Verificar', y haga clic en V01. El sistema le sugiere el módulo de Indicadores PESV donde se calculan automáticamente indicadores como tasa de siniestralidad y cobertura de capacitaciones." },
  { codigo: "V02", nombre: "Registro y Análisis de Siniestros", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso V02 dentro de la pestaña Verificar.", respuesta: "Hola [Nombre]. Para el paso V02 (Registro y Análisis de Siniestros), abra su Evaluación PESV activa, pestaña 'Verificar', y haga clic en V02. El sistema sugiere el módulo de Siniestros donde registrar fecha, ubicación, vehículo involucrado, conductor, daños y causa probable." },
  { codigo: "V03", nombre: "Auditorías PESV", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso V03 dentro de la pestaña Verificar.", respuesta: "Hola [Nombre]. Para el paso V03 (Auditorías PESV), abra su Evaluación PESV activa, pestaña 'Verificar', y haga clic en V03. El sistema sugiere el módulo de Auditorías PESV donde evaluar cada paso y registrar hallazgos y no conformidades." },
  { codigo: "A01", nombre: "Mejora Continua PESV", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso A01 dentro de la pestaña Actuar.", respuesta: "Hola [Nombre]. Para el paso A01 (Mejora Continua PESV), abra su Evaluación PESV activa, pestaña 'Actuar', y haga clic en A01. El sistema sugiere el módulo de Mejora Continua PESV donde registrar acciones preventivas, correctivas y de mejora con responsable y fecha límite." },
  { codigo: "A02", nombre: "Revisión por la Dirección PESV", descripcion: "Se gestiona desde la Evaluación PESV. Haga clic en el paso A02 dentro de la pestaña Actuar.", respuesta: "Hola [Nombre]. Para el paso A02 (Revisión por la Dirección PESV), abra su Evaluación PESV activa, pestaña 'Actuar', y haga clic en A02. El sistema sugiere el módulo de Revisión por la Dirección PESV donde completar el análisis de resultados, conclusiones y compromisos de la alta dirección." },
];

const ESTANDARES_RESUMEN = [
  { rango: "1.1.1 - 1.1.8", componente: "Recursos", descripcion: "Responsable SST, recursos, afiliaciones, alto riesgo, COPASST/Vigía, Comité Convivencia.", modulo: "Evaluación SST > Componente Recursos. Evidencia de soporte en: Trabajadores, COPASST" },
  { rango: "1.2.1 - 1.2.3", componente: "Recursos (Capacitación)", descripcion: "Programa de capacitación anual, inducción/reinducción, Curso 50 horas.", modulo: "Evaluación SST > Componente Recursos. Evidencia de soporte en: Capacitaciones" },
  { rango: "2.1.1 - 2.11.1", componente: "Gestión Integral", descripcion: "Política SST, objetivos, evaluación inicial, plan de trabajo, archivo documental, rendición de cuentas, matriz legal, comunicación, adquisiciones, proveedores, gestión del cambio.", modulo: "Evaluación SST > Componente Gestión Integral. Evidencia de soporte en: Objetivos, Matriz Legal, Plan de Trabajo, Comunicación, Gestión del Cambio" },
  { rango: "3.1.1 - 3.1.9", componente: "Gestión de la Salud", descripcion: "Exámenes médicos, perfil sociodemográfico, estilos de vida, manejo químico, agua potable, residuos.", modulo: "Evaluación SST > Componente Gestión de la Salud. Evidencia de soporte en: Exámenes Médicos" },
  { rango: "3.2.1 - 3.2.3", componente: "Gestión de la Salud (Reporte)", descripcion: "Reporte de accidentes, investigación de incidentes, registro estadístico.", modulo: "Evaluación SST > Componente Gestión de la Salud. Evidencia de soporte en: Accidentes" },
  { rango: "3.3.1 - 3.3.6", componente: "Gestión de la Salud (Indicadores)", descripcion: "Frecuencia, severidad, mortalidad, prevalencia, incidencia, ausentismo.", modulo: "Evaluación SST > Componente Gestión de la Salud. Evidencia de soporte en: Indicadores" },
  { rango: "4.1.1 - 4.1.4", componente: "Peligros y Riesgos (Identificación)", descripcion: "Metodología IPERC, participación trabajadores, sustancias químicas, mediciones ambientales.", modulo: "Evaluación SST > Componente Peligros y Riesgos. Evidencia de soporte en: Matriz IPERC" },
  { rango: "4.2.1 - 4.2.6", componente: "Peligros y Riesgos (Control)", descripcion: "Jerarquía de controles, procedimientos, inspecciones, mantenimiento, EPP, vigilancia.", modulo: "Evaluación SST > Componente Peligros y Riesgos. Evidencia de soporte en: Inspecciones, Entrega EPP" },
  { rango: "5.1.1 - 5.1.3", componente: "Gestión de Amenazas", descripcion: "Plan de emergencias, brigada, simulacros.", modulo: "Evaluación SST > Componente Gestión de Amenazas. Evidencia de soporte en: Plan de Emergencias" },
  { rango: "6.1.1 - 6.1.4", componente: "Verificación", descripcion: "Indicadores de gestión, auditoría anual, revisión por dirección, auditoría con COPASST.", modulo: "Evaluación SST > Componente Verificación. Evidencia de soporte en: Auditorías, Revisión por la Dirección" },
  { rango: "7.1.1 - 7.1.4", componente: "Mejoramiento", descripcion: "Acciones preventivas/correctivas, plan de mejoramiento, acciones ARL/autoridades.", modulo: "Evaluación SST > Componente Mejoramiento. Evidencia de soporte en: Mejora Continua" },
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

      {(!searchTerm || filterBySearch("estándar estandar resolución 0312 componente")) && (
        <CollapsibleSection
          title="Estándares Resolución 0312/2019 (Referencia Rápida)"
          icon={<FileText className="h-5 w-5 text-green-500" />}
          defaultOpen={!!searchTerm}
        >
          <p className="text-sm text-muted-foreground mb-4">
            Los 61 estándares agrupados por componente. TODOS se califican desde la Evaluación SST (archivo maestro en Verificar {'>'} Evaluaciones SST). Los módulos mencionados como "Evidencia de soporte" son donde el cliente registra la información que respalda cada estándar.
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
            <CopyableResponse text="Hola [Nombre]. El estándar [NÚMERO] corresponde al componente [COMPONENTE] de la Resolución 0312/2019. Para calificarlo, vaya a Verificar > Evaluaciones SST, abra su evaluación activa, busque el estándar [NÚMERO] dentro del componente [COMPONENTE] y haga clic sobre él. Se abrirá un diálogo donde puede marcar Cumple, No Cumple o No Aplica. Si necesita registrar evidencia de soporte, el mismo diálogo le sugiere los módulos relacionados donde puede documentarla." />
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
            SADGI S.A.S. — NIT 902.036.337-4 — Manual de Soporte v2.0 — Actualizado {new Date().toLocaleDateString('es-CO')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
