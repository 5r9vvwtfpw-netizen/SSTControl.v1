export interface PlantillaContenido {
  titulo: string;
  descripcion: string;
  tipoContenido: "video" | "documento" | "presentacion" | "texto";
  urlVideo: string;
  urlDocumento: string;
  contenidoTexto: string;
  duracionMinutos: number;
  estado: "borrador";
  obligatorio: number;
}

export interface PlantillaPregunta {
  pregunta: string;
  opciones: string[];
  respuestaCorrecta: number;
  explicacion: string;
  activa: number;
}

const contenidosBase: PlantillaContenido[] = [
  {
    titulo: "Política de Seguridad y Salud en el Trabajo",
    descripcion: "Conocimiento de la política de SST de la empresa, derechos y deberes de los trabajadores en materia de seguridad y salud.",
    tipoContenido: "texto",
    urlVideo: "",
    urlDocumento: "",
    contenidoTexto: `La empresa se compromete a proteger su seguridad y salud durante el trabajo.
Conozca los riesgos de su labor, cumpla las medidas de prevención y use correctamente sus elementos de protección.
Reporte de inmediato cualquier peligro, incidente o condición que pueda afectar su salud o la de sus compañeros.`,
    duracionMinutos: 2,
    estado: "borrador",
    obligatorio: 1,
  },
  {
    titulo: "Identificación de Peligros y Evaluación de Riesgos",
    descripcion: "Metodología para identificar peligros y evaluar riesgos en el lugar de trabajo según la GTC 45 y el Decreto 1072/2015.",
    tipoContenido: "texto",
    urlVideo: "",
    urlDocumento: "",
    contenidoTexto: `Observe su lugar de trabajo e identifique todo lo que pueda causar una lesión o enfermedad.
Antes de iniciar una tarea, aplique los controles indicados y utilice los elementos de protección requeridos.
Si encuentra un peligro nuevo o una condición insegura, suspenda la actividad cuando sea necesario y repórtela.`,
    duracionMinutos: 2,
    estado: "borrador",
    obligatorio: 1,
  },
  {
    titulo: "Procedimientos de Emergencia y Evacuación",
    descripcion: "Plan de emergencias de la empresa, rutas de evacuación, puntos de encuentro y funciones de las brigadas de emergencia.",
    tipoContenido: "texto",
    urlVideo: "",
    urlDocumento: "",
    contenidoTexto: `En una emergencia mantenga la calma, active la alarma y siga las instrucciones del brigadista.
Evacúe por la ruta señalizada hasta el punto de encuentro, sin correr ni devolverse.
Conozca previamente las salidas de emergencia y reporte cualquier ruta bloqueada.`,
    duracionMinutos: 2,
    estado: "borrador",
    obligatorio: 1,
  },
  {
    titulo: "Uso y Cuidado de Elementos de Protección Personal (EPP)",
    descripcion: "Tipos de EPP, selección adecuada, uso correcto, mantenimiento y reposición según la normativa colombiana.",
    tipoContenido: "texto",
    urlVideo: "",
    urlDocumento: "",
    contenidoTexto: `Use siempre los elementos de protección definidos para su tarea.
Revise su estado antes de utilizarlos y no los modifique ni los comparta cuando sean de uso personal.
Reporte daños o desgaste y solicite su reemplazo antes de continuar la labor.`,
    duracionMinutos: 2,
    estado: "borrador",
    obligatorio: 1,
  },
  {
    titulo: "Reporte de Incidentes y Accidentes de Trabajo",
    descripcion: "Procedimiento para el reporte oportuno de incidentes y accidentes de trabajo según el Decreto 1072/2015.",
    tipoContenido: "texto",
    urlVideo: "",
    urlDocumento: "",
    contenidoTexto: `Reporte inmediatamente todo incidente o accidente a su jefe y al responsable de SST.
Si hay una persona lesionada, solicite ayuda y no la mueva salvo que exista un peligro mayor.
No altere el lugar del evento y entregue información clara para facilitar la investigación.`,
    duracionMinutos: 2,
    estado: "borrador",
    obligatorio: 1,
  },
  {
    titulo: "Derechos y Deberes del Trabajador en SST",
    descripcion: "Marco legal de los derechos y deberes del trabajador en seguridad y salud en el trabajo según la legislación colombiana.",
    tipoContenido: "texto",
    urlVideo: "",
    urlDocumento: "",
    contenidoTexto: `Tiene derecho a conocer los riesgos de su trabajo, recibir protección y reportar condiciones inseguras.
Debe cuidar su salud, cumplir las normas de seguridad y usar correctamente los elementos de protección.
Participe en las actividades de prevención e informe de inmediato cualquier incidente, accidente o peligro.`,
    duracionMinutos: 2,
    estado: "borrador",
    obligatorio: 1,
  },
];

const preguntasBase: PlantillaPregunta[] = [
  {
    pregunta: "¿Qué es la Política de Seguridad y Salud en el Trabajo?",
    opciones: [
      "Un documento que establece el compromiso de la alta dirección con la protección de la seguridad y salud de los trabajadores",
      "Un requisito opcional que solo aplica a empresas con más de 50 trabajadores",
      "Un formulario que debe llenar cada trabajador al ingresar a la empresa",
      "Un informe anual que se presenta al Ministerio del Trabajo"
    ],
    respuestaCorrecta: 0,
    explicacion: "La Política de SST es el compromiso formal de la alta dirección con la protección de la vida, integridad física y mental de los trabajadores. Debe ser firmada por el representante legal, comunicada a todos los niveles y revisada anualmente, conforme al Decreto 1072 de 2015, Artículo 2.2.4.6.5.",
    activa: 1,
  },
  {
    pregunta: "¿Cuál es el principal objetivo del Sistema de Gestión de SST (SG-SST)?",
    opciones: [
      "Cumplir con los requisitos del Ministerio del Trabajo exclusivamente",
      "Anticipar, reconocer, evaluar y controlar los riesgos que puedan afectar la seguridad y salud en el trabajo, promoviendo la prevención",
      "Reducir los costos operativos de la empresa",
      "Asegurar que los trabajadores reciban un salario justo"
    ],
    respuestaCorrecta: 1,
    explicacion: "El SG-SST tiene como objetivo principal anticipar, reconocer, evaluar y controlar los riesgos que puedan afectar la seguridad y la salud en el trabajo, mediante un proceso lógico y por etapas basado en la mejora continua (Decreto 1072/2015, Artículo 2.2.4.6.4).",
    activa: 1,
  },
  {
    pregunta: "¿Qué debe hacer un trabajador al identificar una condición insegura en su lugar de trabajo?",
    opciones: [
      "Ignorarla si no le afecta directamente",
      "Esperar a la próxima inspección de seguridad para reportarla",
      "Reportarla de manera inmediata al jefe directo, al responsable de SST o al COPASST/Vigía",
      "Intentar corregirla por su cuenta sin informar a nadie"
    ],
    respuestaCorrecta: 2,
    explicacion: "Todo trabajador tiene el deber de informar oportunamente al empleador sobre peligros y riesgos latentes en su puesto de trabajo, conforme al Decreto 1072 de 2015, Artículo 2.2.4.6.10. El reporte debe ser inmediato para permitir la intervención oportuna.",
    activa: 1,
  },
  {
    pregunta: "¿Qué son los Elementos de Protección Personal (EPP)?",
    opciones: [
      "Herramientas de trabajo proporcionadas por la empresa",
      "Dispositivos, accesorios y vestimentas que porta el trabajador para protegerlo de riesgos laborales",
      "Uniformes de trabajo obligatorios para todos los empleados",
      "Equipos de oficina ergonómicos"
    ],
    respuestaCorrecta: 1,
    explicacion: "Los EPP son dispositivos, accesorios y vestimentas diseñados para proteger al trabajador de los riesgos que puedan amenazar su seguridad y salud. Son el último recurso en la jerarquía de controles y deben ser suministrados por el empleador sin costo para el trabajador (Decreto 1072/2015, Artículo 2.2.4.6.24).",
    activa: 1,
  },
  {
    pregunta: "¿Cuándo se debe reportar un incidente de trabajo?",
    opciones: [
      "Dentro de las 24 horas siguientes",
      "Al finalizar la jornada laboral",
      "De manera inmediata al jefe directo y al responsable de SST",
      "Solo si hubo lesiones físicas"
    ],
    respuestaCorrecta: 2,
    explicacion: "Los incidentes de trabajo deben reportarse de manera inmediata al jefe directo y al responsable de SST, incluso si no hubo lesiones. El reporte oportuno permite identificar condiciones inseguras y prevenir futuros accidentes (Decreto 1072/2015, Resolución 1401 de 2007).",
    activa: 1,
  },
  {
    pregunta: "¿Qué es un accidente de trabajo según la normativa colombiana?",
    opciones: [
      "Cualquier enfermedad que se presente durante la jornada laboral",
      "Todo suceso repentino que sobrevenga por causa o con ocasión del trabajo y que produzca una lesión orgánica, perturbación funcional, invalidez o la muerte",
      "Una situación peligrosa que no causa lesiones",
      "Solo los eventos que ocurren dentro de las instalaciones de la empresa"
    ],
    respuestaCorrecta: 1,
    explicacion: "Según la Ley 1562 de 2012, Artículo 3, un accidente de trabajo es todo suceso repentino que sobrevenga por causa o con ocasión del trabajo, y que produzca en el trabajador una lesión orgánica, una perturbación funcional o psiquiátrica, una invalidez o la muerte. También incluye los que ocurren durante el traslado trabajo-casa cuando el transporte lo suministra el empleador.",
    activa: 1,
  },
  {
    pregunta: "¿Cuál es la primera acción que debe tomar en caso de emergencia?",
    opciones: [
      "Correr hacia la salida más cercana lo más rápido posible",
      "Llamar a la policía inmediatamente",
      "Mantener la calma y seguir las instrucciones del plan de emergencias y los brigadistas",
      "Recoger sus pertenencias personales antes de evacuar"
    ],
    respuestaCorrecta: 2,
    explicacion: "En caso de emergencia, lo primero es mantener la calma y seguir las instrucciones del plan de emergencias, los coordinadores de evacuación y los brigadistas. El Decreto 1072 de 2015, Artículo 2.2.4.6.25, establece que la empresa debe implementar y mantener procedimientos de respuesta ante emergencias.",
    activa: 1,
  },
  {
    pregunta: "¿Quién es responsable de la seguridad y salud en el trabajo?",
    opciones: [
      "Únicamente el responsable de SST de la empresa",
      "Solo el COPASST o Vigía de SST",
      "Exclusivamente la ARL (Administradora de Riesgos Laborales)",
      "Es una responsabilidad compartida entre el empleador, los trabajadores y todos los niveles de la organización"
    ],
    respuestaCorrecta: 3,
    explicacion: "La seguridad y salud en el trabajo es una responsabilidad compartida. El Decreto 1072 de 2015, Artículo 2.2.4.6.8, establece que el empleador debe asignar responsabilidades en SST a todos los niveles de la organización, y el Artículo 2.2.4.6.10 establece los deberes de los trabajadores. Es un esfuerzo conjunto.",
    activa: 1,
  },
];

const contenidosNivelIII: PlantillaContenido[] = [
  {
    titulo: "Trabajo Seguro en Alturas",
    descripcion: "Normativa y procedimientos para trabajo seguro en alturas según la Resolución 4272 de 2021.",
    tipoContenido: "texto",
    urlVideo: "",
    urlDocumento: "",
    contenidoTexto: `El trabajo en alturas es considerado una actividad de alto riesgo en Colombia y está regulado por la Resolución 4272 de 2021 del Ministerio del Trabajo, que establece los requisitos mínimos de seguridad para la prevención y protección contra caídas en trabajo en alturas.

Se considera trabajo en alturas toda actividad que se realice a 2.0 metros o más sobre un nivel inferior, donde exista riesgo de caída.

Requisitos para realizar trabajo en alturas:
- Certificado de aptitud médica vigente que autorice el trabajo en alturas.
- Certificado de capacitación y entrenamiento vigente en trabajo en alturas (nivel avanzado o coordinador según aplique).
- Permiso de trabajo en alturas diligenciado y aprobado antes de iniciar la actividad.
- Análisis de riesgo por actividad (ARA) específico para la tarea.
- Sistemas de protección contra caídas adecuados e inspeccionados.

Sistemas de protección contra caídas:
1. Medidas de prevención: Capacitación, sistemas de ingeniería, medidas colectivas (barandas, redes de seguridad), delimitación del área, señalización.
2. Medidas de protección: Sistemas de detención de caídas (arnés de cuerpo completo + línea de vida + punto de anclaje), sistemas de restricción, sistemas de posicionamiento.

Responsabilidades del trabajador:
- Asistir a las capacitaciones y reentrenamientos programados.
- Inspeccionar los equipos antes de cada uso.
- Utilizar correctamente los sistemas de protección contra caídas.
- No realizar trabajo en alturas si no cuenta con la certificación vigente.
- Reportar cualquier condición insegura o falla en los equipos.
- No trabajar en alturas bajo efectos de alcohol, drogas o medicamentos que alteren la capacidad.

Las personas con restricciones médicas, menores de edad, o quienes no cuenten con la capacitación vigente NO pueden realizar trabajo en alturas.`,
    duracionMinutos: 15,
    estado: "borrador",
    obligatorio: 1,
  },
  {
    titulo: "Manejo Seguro de Sustancias Químicas",
    descripcion: "Procedimientos para la manipulación, almacenamiento y disposición segura de sustancias químicas con el Sistema Globalmente Armonizado (SGA/GHS).",
    tipoContenido: "texto",
    urlVideo: "",
    urlDocumento: "",
    contenidoTexto: `El manejo seguro de sustancias químicas es fundamental para la protección de los trabajadores y el medio ambiente. En Colombia, la implementación del Sistema Globalmente Armonizado de Clasificación y Etiquetado de Productos Químicos (SGA/GHS) es regulada por el Decreto 1496 de 2018.

Sistema Globalmente Armonizado (SGA/GHS):
El SGA establece criterios unificados para la clasificación de sustancias químicas según sus peligros y un sistema estandarizado de comunicación de peligros mediante:
- Pictogramas de peligro (9 pictogramas estandarizados).
- Palabras de advertencia: "Peligro" (mayor gravedad) y "Atención" (menor gravedad).
- Indicaciones de peligro (frases H) y consejos de prudencia (frases P).
- Fichas de Datos de Seguridad (FDS/SDS) con 16 secciones obligatorias.

Fichas de Datos de Seguridad (FDS):
Toda sustancia química debe contar con su FDS disponible y accesible para los trabajadores. Las 16 secciones incluyen:
1. Identificación del producto y del proveedor.
2. Identificación de peligros.
3. Composición/información sobre componentes.
4. Primeros auxilios.
5. Medidas de lucha contra incendios.
6. Medidas en caso de vertido accidental.
7. Manipulación y almacenamiento.
8. Controles de exposición/protección personal.
9-16. Propiedades físicas, estabilidad, toxicología, ecología, eliminación, transporte, reglamentación y otra información.

Precauciones generales:
- Leer la etiqueta y la FDS antes de manipular cualquier sustancia química.
- Usar los EPP indicados en la FDS para cada sustancia.
- No mezclar sustancias químicas sin autorización y conocimiento técnico.
- Almacenar las sustancias según su compatibilidad química (matriz de compatibilidad).
- Mantener los recipientes cerrados y etiquetados en todo momento.
- Conocer la ubicación de duchas de emergencia, lavaojos y kit de derrames.
- En caso de derrame, seguir el procedimiento establecido y usar el kit de contención.`,
    duracionMinutos: 15,
    estado: "borrador",
    obligatorio: 1,
  },
  {
    titulo: "Seguridad en Operación de Maquinaria y Equipos",
    descripcion: "Procedimientos de bloqueo y etiquetado (LOTO), inspección preoperacional y operación segura de maquinaria y equipos.",
    tipoContenido: "texto",
    urlVideo: "",
    urlDocumento: "",
    contenidoTexto: `La operación segura de maquinaria y equipos es esencial para prevenir accidentes de trabajo graves. El Decreto 1072 de 2015 y la Resolución 0312 de 2019 establecen la obligación de implementar programas de mantenimiento preventivo y procedimientos seguros de operación.

Procedimiento de Bloqueo y Etiquetado (LOTO - Lockout/Tagout):
El LOTO es un procedimiento de seguridad que garantiza que las máquinas y equipos estén completamente desenergizados y no puedan activarse accidentalmente durante actividades de mantenimiento, reparación o limpieza.

Pasos del procedimiento LOTO:
1. Preparación: Identifique todas las fuentes de energía del equipo (eléctrica, neumática, hidráulica, mecánica, térmica, química).
2. Notificación: Informe a todos los trabajadores afectados sobre el bloqueo.
3. Apagado: Detenga el equipo siguiendo el procedimiento operativo normal.
4. Aislamiento: Desconecte todas las fuentes de energía del equipo.
5. Bloqueo y etiquetado: Coloque candados y etiquetas personales en cada punto de aislamiento.
6. Verificación de energía almacenada: Libere o bloquee cualquier energía residual.
7. Verificación: Intente encender el equipo para confirmar que está efectivamente desenergizado.
8. Realización del trabajo: Proceda con las tareas de mantenimiento.
9. Retiro del bloqueo: Solo el trabajador que colocó el candado puede retirarlo.

Inspección preoperacional de equipos:
Antes de operar cualquier maquinaria o equipo, el trabajador debe:
- Verificar que las guardas de seguridad estén en su lugar.
- Comprobar el funcionamiento de los dispositivos de parada de emergencia.
- Inspeccionar visualmente el equipo en busca de daños o anomalías.
- Verificar la limpieza y orden del área de trabajo.
- Confirmar que no haya personas en la zona de riesgo.

Reglas generales de seguridad:
- Solo personal autorizado y capacitado puede operar maquinaria.
- Nunca retirar las guardas de seguridad durante la operación.
- No usar ropa suelta, joyas, cabello suelto o accesorios cerca de partes móviles.
- Mantener las manos y el cuerpo alejados de los puntos de pellizco, corte y atrapamiento.
- Reportar cualquier falla o anomalía en el equipo antes de usarlo.`,
    duracionMinutos: 15,
    estado: "borrador",
    obligatorio: 1,
  },
];

const preguntasNivelIII: PlantillaPregunta[] = [
  {
    pregunta: "¿A partir de qué altura se considera trabajo en alturas en Colombia según la Resolución 4272 de 2021?",
    opciones: [
      "1.0 metro sobre el nivel inferior",
      "1.5 metros sobre el nivel inferior",
      "2.0 metros sobre el nivel inferior donde exista riesgo de caída",
      "3.0 metros sobre el nivel inferior"
    ],
    respuestaCorrecta: 2,
    explicacion: "Según la Resolución 4272 de 2021, se considera trabajo en alturas toda actividad que se realice a 2.0 metros o más sobre un nivel inferior, donde exista riesgo de caída. Esta resolución actualizó la anterior Resolución 1409 de 2012.",
    activa: 1,
  },
  {
    pregunta: "¿Qué información contiene la Ficha de Datos de Seguridad (FDS/SDS) de una sustancia química?",
    opciones: [
      "Solo el nombre comercial del producto",
      "Únicamente las instrucciones de uso del fabricante",
      "Información completa sobre peligros, primeros auxilios, manipulación, almacenamiento, controles de exposición y protección personal en 16 secciones estandarizadas",
      "Solo los pictogramas de peligro del producto"
    ],
    respuestaCorrecta: 2,
    explicacion: "La Ficha de Datos de Seguridad (FDS) contiene 16 secciones estandarizadas según el Sistema Globalmente Armonizado (SGA/GHS), implementado en Colombia mediante el Decreto 1496 de 2018. Incluye información sobre identificación, peligros, composición, primeros auxilios, manipulación, almacenamiento, EPP requeridos y más.",
    activa: 1,
  },
  {
    pregunta: "¿Cuál es el propósito del procedimiento de Bloqueo y Etiquetado (LOTO)?",
    opciones: [
      "Etiquetar los productos terminados para su distribución",
      "Garantizar que las máquinas y equipos estén completamente desenergizados y no puedan activarse accidentalmente durante mantenimiento",
      "Bloquear el acceso de personal no autorizado a las instalaciones",
      "Registrar el uso de equipos para control de inventario"
    ],
    respuestaCorrecta: 1,
    explicacion: "El procedimiento LOTO (Lockout/Tagout) garantiza que las máquinas y equipos estén completamente desenergizados y no puedan activarse accidentalmente durante actividades de mantenimiento, reparación o limpieza, protegiendo la vida de los trabajadores que intervienen en el equipo.",
    activa: 1,
  },
  {
    pregunta: "¿Qué requisito es indispensable antes de ingresar a un espacio confinado?",
    opciones: [
      "Solo avisar al jefe inmediato",
      "Contar con permiso de trabajo, monitoreo atmosférico, ventilación adecuada y un vigía de seguridad en la entrada",
      "Usar únicamente casco de seguridad",
      "Tener experiencia previa en trabajos similares"
    ],
    respuestaCorrecta: 1,
    explicacion: "El ingreso a espacios confinados requiere un permiso de trabajo específico, monitoreo continuo de la atmósfera (oxígeno, gases combustibles, gases tóxicos), ventilación adecuada, un vigía de seguridad permanente en la entrada, equipo de rescate disponible y comunicación constante, conforme a las normas de seguridad para trabajos de alto riesgo.",
    activa: 1,
  },
];

const contenidosNivelIV: PlantillaContenido[] = [
  {
    titulo: "Espacios Confinados y Trabajos de Alto Riesgo",
    descripcion: "Procedimientos seguros para ingreso y trabajo en espacios confinados, permisos de trabajo y protocolos de rescate.",
    tipoContenido: "texto",
    urlVideo: "",
    urlDocumento: "",
    contenidoTexto: `Un espacio confinado es un recinto cerrado o parcialmente cerrado que tiene las siguientes características: no está diseñado para ocupación humana continua, tiene medios limitados de entrada y salida, y puede contener una atmósfera peligrosa o condiciones que representan riesgo para la vida o la salud.

Ejemplos de espacios confinados:
- Tanques de almacenamiento, silos, reactores.
- Pozos, fosos, zanjas profundas.
- Tuberías, ductos y alcantarillas.
- Bodegas de buques, vagones cisterna.
- Calderas, hornos, tolvas.

Peligros en espacios confinados:
- Atmósferas deficientes de oxígeno (menos del 19.5%).
- Atmósferas enriquecidas de oxígeno (más del 23.5%).
- Presencia de gases tóxicos (H2S, CO, NH3, etc.).
- Presencia de gases o vapores inflamables.
- Riesgo de engolfamiento por materiales sueltos (granos, arena).
- Riesgo de atrapamiento por la configuración del espacio.
- Riesgos eléctricos, mecánicos o térmicos.

Requisitos para trabajo en espacios confinados:
1. Permiso de trabajo: Debe ser emitido por personal autorizado y competente antes de cada ingreso. Incluye identificación del espacio, peligros, controles, personal involucrado y tiempos.
2. Monitoreo atmosférico: Medición continua de oxígeno, gases combustibles y gases tóxicos con equipo calibrado antes y durante el trabajo.
3. Ventilación: Asegurar ventilación forzada adecuada para mantener la atmósfera segura.
4. Vigía de seguridad: Una persona capacitada debe permanecer en todo momento en la entrada del espacio confinado, manteniendo comunicación constante con el personal en el interior.
5. Plan de rescate: Debe existir un plan de rescate específico con equipo y personal entrenado disponible en el sitio.
6. EPP especializados: Según los peligros identificados (arnés de rescate, respirador autónomo, detector de gases portátil).
7. Comunicación: Sistema de comunicación continua entre el interior y el exterior.

Nunca ingrese a un espacio confinado sin autorización, sin el permiso de trabajo o para rescatar a un compañero sin el equipo adecuado.`,
    duracionMinutos: 15,
    estado: "borrador",
    obligatorio: 1,
  },
  {
    titulo: "Vigilancia Epidemiológica y Programas de Salud",
    descripcion: "Sistemas de Vigilancia Epidemiológica (SVE) y programas de promoción y prevención en salud para trabajadores expuestos a riesgos laborales.",
    tipoContenido: "texto",
    urlVideo: "",
    urlDocumento: "",
    contenidoTexto: `La Vigilancia Epidemiológica en Salud en el Trabajo es un proceso sistemático y continuo de recolección, análisis, interpretación y difusión de datos relacionados con la salud de los trabajadores y sus condiciones de trabajo, establecido en el Decreto 1072 de 2015 y la Resolución 0312 de 2019.

Sistemas de Vigilancia Epidemiológica (SVE) más comunes:
1. SVE Osteomuscular: Para trabajadores expuestos a riesgo biomecánico (posturas prolongadas, movimientos repetitivos, manipulación de cargas).
2. SVE Auditivo (Conservación Auditiva): Para trabajadores expuestos a niveles de ruido iguales o superiores a 80 dB.
3. SVE Visual: Para trabajadores con exposición prolongada a pantallas de visualización de datos o con riesgo de lesión ocular.
4. SVE Psicosocial: Para la prevención de factores de riesgo psicosocial según la Resolución 2764 de 2022 (Batería de riesgo psicosocial).
5. SVE Químico: Para trabajadores expuestos a sustancias químicas peligrosas.
6. SVE Cardiovascular: Para la prevención de enfermedad cardiovascular en trabajadores con factores de riesgo.
7. SVE Respiratorio: Para trabajadores expuestos a material particulado, gases o vapores.

Exámenes médicos ocupacionales (Resolución 2346 de 2007):
- Examen de ingreso: Evaluación médica antes de iniciar labores para determinar aptitud.
- Exámenes periódicos: Evaluaciones programadas según los riesgos a los que está expuesto el trabajador.
- Examen de retiro: Evaluación al finalizar la relación laboral.
- Exámenes por cambio de ocupación: Cuando cambian las condiciones de exposición.
- Exámenes de reingreso: Después de una incapacidad prolongada.

Obligaciones del trabajador en programas de salud:
- Asistir a los exámenes médicos ocupacionales programados.
- Informar sobre cualquier cambio en su estado de salud.
- Seguir las recomendaciones médicas y restricciones laborales.
- Participar en las actividades de promoción y prevención.
- Usar los EPP indicados para proteger su salud.
- Reportar síntomas relacionados con la exposición a riesgos laborales.

La empresa debe mantener confidencialidad sobre la información médica de los trabajadores, conforme a la Ley 1581 de 2012 (Protección de Datos Personales) y la Resolución 2346 de 2007.`,
    duracionMinutos: 15,
    estado: "borrador",
    obligatorio: 1,
  },
];

const preguntasNivelIV: PlantillaPregunta[] = [
  {
    pregunta: "¿Cuáles son los requisitos mínimos para ingresar a un espacio confinado?",
    opciones: [
      "Solo se necesita el permiso verbal del supervisor",
      "Permiso de trabajo escrito, monitoreo atmosférico continuo, ventilación forzada, vigía de seguridad permanente y plan de rescate disponible",
      "Usar casco y botas de seguridad es suficiente",
      "Tener más de 5 años de experiencia en la empresa"
    ],
    respuestaCorrecta: 1,
    explicacion: "El ingreso a espacios confinados requiere un permiso de trabajo escrito, monitoreo atmosférico continuo (oxígeno, gases combustibles y tóxicos), ventilación forzada adecuada, un vigía de seguridad permanente en la entrada y un plan de rescate con equipo y personal entrenado disponible en el sitio.",
    activa: 1,
  },
  {
    pregunta: "¿Cuál es la obligación del trabajador respecto a los programas de vigilancia epidemiológica y exámenes médicos ocupacionales?",
    opciones: [
      "Son voluntarios y el trabajador puede decidir no participar",
      "Solo debe asistir al examen de ingreso, los demás son opcionales",
      "Debe asistir a todos los exámenes médicos ocupacionales programados, informar cambios en su salud y seguir las recomendaciones médicas",
      "Solo aplican para trabajadores con más de un año en la empresa"
    ],
    respuestaCorrecta: 2,
    explicacion: "Según el Decreto 1072 de 2015 y la Resolución 2346 de 2007, el trabajador tiene la obligación de asistir a todos los exámenes médicos ocupacionales (ingreso, periódicos, de retiro), informar sobre cambios en su estado de salud y seguir las recomendaciones y restricciones médicas establecidas por el programa de vigilancia epidemiológica.",
    activa: 1,
  },
];

export const plantillasContenido: Record<string, PlantillaContenido[]> = {
  "I": [contenidosBase[0]],
  "II": [contenidosBase[0]],
  "III": [contenidosBase[0]],
  "IV": [contenidosBase[0]],
  "V": [contenidosBase[0]],
};

export const plantillasPreguntas: Record<string, PlantillaPregunta[]> = {
  "I": [...preguntasBase],
  "II": [...preguntasBase],
  "III": [...preguntasBase, ...preguntasNivelIII],
  "IV": [...preguntasBase, ...preguntasNivelIII, ...preguntasNivelIV],
  "V": [...preguntasBase, ...preguntasNivelIII, ...preguntasNivelIV],
};

export function getPlantillasPorNivel(riskLevel: string): {
  contenidos: PlantillaContenido[];
  preguntas: PlantillaPregunta[];
} {
  const nivel = riskLevel.toUpperCase();
  return {
    contenidos: plantillasContenido[nivel] || plantillasContenido["I"],
    preguntas: plantillasPreguntas[nivel] || plantillasPreguntas["I"],
  };
}
