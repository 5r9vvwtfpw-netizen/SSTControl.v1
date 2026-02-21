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
    contenidoTexto: `La Política de Seguridad y Salud en el Trabajo (SST) es el compromiso formal de la alta dirección de la empresa con la protección de la vida, la integridad física y mental de todos los trabajadores, conforme al Decreto 1072 de 2015, Libro 2, Parte 2, Título 4, Capítulo 6.

Esta política debe:
- Establecer el compromiso de la empresa con la implementación del Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST).
- Ser específica y apropiada para la naturaleza de los peligros y el tamaño de la organización.
- Ser concisa, estar fechada y firmada por el representante legal de la empresa.
- Incluir el compromiso con la identificación de peligros, evaluación y valoración de riesgos, y establecer los controles necesarios.
- Comprometerse con la protección de la seguridad y salud de todos los trabajadores, incluyendo contratistas y subcontratistas.
- Cumplir con la normatividad nacional vigente aplicable en materia de riesgos laborales.
- Ser comunicada a todos los niveles de la organización y estar accesible a todas las partes interesadas.
- Ser revisada como mínimo una vez al año y actualizada si es necesario.

Derechos del trabajador en SST:
- Conocer los riesgos a los que está expuesto en su puesto de trabajo.
- Recibir capacitación y entrenamiento en SST.
- Participar en las actividades de prevención y promoción.
- Reportar condiciones y actos inseguros sin temor a represalias.
- Negarse a realizar tareas que pongan en riesgo su vida o salud cuando no se cuente con las medidas de protección adecuadas.

Deberes del trabajador en SST:
- Cumplir las normas y procedimientos de seguridad establecidos.
- Usar adecuadamente los Elementos de Protección Personal (EPP).
- Reportar de manera inmediata cualquier condición o acto inseguro.
- Participar activamente en las capacitaciones y actividades del SG-SST.
- Informar al empleador sobre cualquier cambio en su estado de salud relacionado con el trabajo.`,
    duracionMinutos: 15,
    estado: "borrador",
    obligatorio: 1,
  },
  {
    titulo: "Identificación de Peligros y Evaluación de Riesgos",
    descripcion: "Metodología para identificar peligros y evaluar riesgos en el lugar de trabajo según la GTC 45 y el Decreto 1072/2015.",
    tipoContenido: "texto",
    urlVideo: "",
    urlDocumento: "",
    contenidoTexto: `La identificación de peligros y la evaluación de riesgos es un proceso fundamental del SG-SST establecido en el Decreto 1072 de 2015, Artículo 2.2.4.6.15, y desarrollado mediante la Guía Técnica Colombiana GTC 45.

¿Qué es un peligro?
Es una fuente, situación o acto con potencial de causar daño en la salud de los trabajadores, en los equipos o en las instalaciones. Los peligros se clasifican en:
- Biológicos: virus, bacterias, hongos, parásitos.
- Físicos: ruido, iluminación, temperaturas extremas, vibraciones, radiaciones.
- Químicos: gases, vapores, polvos, líquidos, humos.
- Psicosociales: estrés, carga mental, acoso laboral, jornadas extensas.
- Biomecánicos: posturas prolongadas, movimientos repetitivos, manipulación de cargas.
- Condiciones de seguridad: trabajo en alturas, espacios confinados, máquinas y herramientas, eléctrico.
- Fenómenos naturales: sismos, inundaciones, tormentas eléctricas.

¿Qué es un riesgo?
Es la combinación de la probabilidad de que ocurra un evento peligroso y la severidad de las lesiones o daños que pueda causar.

¿Cómo identificar peligros en su puesto de trabajo?
1. Observe su entorno laboral e identifique fuentes de peligro.
2. Revise los procedimientos y tareas que realiza diariamente.
3. Consulte la matriz de identificación de peligros y evaluación de riesgos (IPER) de su área.
4. Reporte cualquier peligro no identificado al responsable de SST o al COPASST/Vigía.
5. Participe en las inspecciones de seguridad programadas.

Jerarquía de controles (de mayor a menor efectividad):
1. Eliminación del peligro.
2. Sustitución por materiales o procesos menos peligrosos.
3. Controles de ingeniería (guardas, ventilación, aislamiento).
4. Controles administrativos (señalización, procedimientos, capacitación).
5. Elementos de Protección Personal (EPP).`,
    duracionMinutos: 15,
    estado: "borrador",
    obligatorio: 1,
  },
  {
    titulo: "Procedimientos de Emergencia y Evacuación",
    descripcion: "Plan de emergencias de la empresa, rutas de evacuación, puntos de encuentro y funciones de las brigadas de emergencia.",
    tipoContenido: "texto",
    urlVideo: "",
    urlDocumento: "",
    contenidoTexto: `El Plan de Emergencias y Contingencias es un requisito del Decreto 1072 de 2015, Artículo 2.2.4.6.25, y debe incluir la identificación de amenazas, análisis de vulnerabilidad, procedimientos operativos normalizados y programas de capacitación.

Tipos de emergencias más comunes:
- Incendios y explosiones.
- Sismos y terremotos.
- Inundaciones.
- Derrames de sustancias químicas.
- Emergencias médicas (accidentes de trabajo, enfermedades súbitas).
- Amenazas de bomba o actos terroristas.

¿Qué hacer en caso de emergencia?
1. Mantenga la calma y no corra.
2. Active la alarma de emergencia si es el primero en detectar la situación.
3. Siga las instrucciones del coordinador de evacuación o brigadista.
4. Diríjase por la ruta de evacuación señalizada hacia el punto de encuentro asignado.
5. No use ascensores durante la evacuación.
6. Ayude a las personas con discapacidad o movilidad reducida si puede hacerlo de forma segura.
7. Una vez en el punto de encuentro, repórtese con el coordinador de evacuación.
8. No regrese al edificio hasta que se dé la orden de retorno por el comité de emergencias.

Brigadas de emergencia:
- Brigada de prevención y control de incendios.
- Brigada de primeros auxilios.
- Brigada de evacuación y rescate.
- Brigada de comunicaciones.

Es obligación de todos los trabajadores:
- Conocer las rutas de evacuación y puntos de encuentro.
- Participar en los simulacros de evacuación (mínimo uno al año según Resolución 0312/2019).
- Conocer la ubicación de extintores, botiquines y camillas.
- Reportar cualquier obstrucción en las rutas de evacuación.`,
    duracionMinutos: 12,
    estado: "borrador",
    obligatorio: 1,
  },
  {
    titulo: "Uso y Cuidado de Elementos de Protección Personal (EPP)",
    descripcion: "Tipos de EPP, selección adecuada, uso correcto, mantenimiento y reposición según la normativa colombiana.",
    tipoContenido: "texto",
    urlVideo: "",
    urlDocumento: "",
    contenidoTexto: `Los Elementos de Protección Personal (EPP) son dispositivos, accesorios y vestimentas que porta el trabajador para protegerlo de los riesgos que puedan amenazar su seguridad y salud en el trabajo, conforme al Decreto 1072 de 2015, Artículo 2.2.4.6.24.

Los EPP son el último recurso en la jerarquía de controles y deben usarse cuando los riesgos no pueden eliminarse o controlarse por otros medios.

Tipos de EPP según la parte del cuerpo que protegen:
- Protección de la cabeza: cascos de seguridad, gorras con protección.
- Protección auditiva: tapones, orejeras.
- Protección visual y facial: gafas de seguridad, caretas, protectores faciales.
- Protección respiratoria: mascarillas, respiradores, equipos de aire autónomo.
- Protección de manos: guantes de diferentes materiales según el riesgo.
- Protección de pies: botas de seguridad con puntera de acero, botas dieléctricas, botas antideslizantes.
- Protección corporal: overoles, delantales, chalecos reflectivos.
- Protección contra caídas: arnés de cuerpo completo, líneas de vida, conectores.

Responsabilidades del trabajador con los EPP:
- Usar los EPP proporcionados de manera correcta durante toda la jornada laboral cuando sea requerido.
- Mantener los EPP en buen estado, limpios y almacenados adecuadamente.
- Inspeccionar los EPP antes de cada uso y reportar cualquier daño o deterioro.
- No modificar ni alterar los EPP.
- Solicitar el reemplazo cuando presenten desgaste o daño.
- Participar en las capacitaciones sobre uso correcto de EPP.

Responsabilidades del empleador:
- Suministrar los EPP adecuados según los riesgos identificados, sin costo para el trabajador.
- Garantizar que los EPP cumplan con las normas técnicas colombianas (NTC) aplicables.
- Capacitar al trabajador en el uso correcto de los EPP.
- Reponer los EPP cuando sea necesario.
- Llevar registro de entrega de EPP firmado por el trabajador.`,
    duracionMinutos: 12,
    estado: "borrador",
    obligatorio: 1,
  },
  {
    titulo: "Reporte de Incidentes y Accidentes de Trabajo",
    descripcion: "Procedimiento para el reporte oportuno de incidentes y accidentes de trabajo según el Decreto 1072/2015.",
    tipoContenido: "texto",
    urlVideo: "",
    urlDocumento: "",
    contenidoTexto: `El reporte oportuno de incidentes y accidentes de trabajo es una obligación legal tanto del empleador como del trabajador, establecida en el Decreto 1072 de 2015 y la Resolución 0312 de 2019.

Definiciones clave:
- Incidente de trabajo: Suceso acaecido en el curso del trabajo o en relación con este, que tuvo el potencial de ser un accidente, en el que hubo personas involucradas sin que sufrieran lesiones o se presentaran daños a la propiedad y/o pérdida en los procesos (Resolución 1401 de 2007).
- Accidente de trabajo: Todo suceso repentino que sobrevenga por causa o con ocasión del trabajo, y que produzca en el trabajador una lesión orgánica, una perturbación funcional o psiquiátrica, una invalidez o la muerte (Ley 1562 de 2012, Artículo 3).
- Enfermedad laboral: La contraída como resultado de la exposición a factores de riesgo inherentes a la actividad laboral o del medio en el que el trabajador se ha visto obligado a trabajar (Ley 1562 de 2012, Artículo 4).

¿Cuándo reportar?
- Los incidentes deben reportarse de manera INMEDIATA al jefe directo y al responsable de SST.
- Los accidentes de trabajo deben reportarse al empleador de forma INMEDIATA y este debe notificar a la ARL y a la EPS dentro de los dos (2) días hábiles siguientes.
- Los accidentes graves y mortales deben reportarse además a la Dirección Territorial del Ministerio del Trabajo dentro de los dos (2) días hábiles siguientes.

Procedimiento de reporte:
1. Brinde o busque primeros auxilios si hay lesionados.
2. Informe inmediatamente a su jefe directo o supervisor.
3. Notifique al responsable de SST o al COPASST/Vigía.
4. Preserve la escena del accidente sin alterar evidencias.
5. Colabore con la investigación del accidente o incidente.
6. Proporcione información veraz y completa sobre lo ocurrido.

La investigación de accidentes es obligatoria según la Resolución 1401 de 2007 y debe realizarse dentro de los 15 días calendario siguientes al evento.`,
    duracionMinutos: 12,
    estado: "borrador",
    obligatorio: 1,
  },
  {
    titulo: "Derechos y Deberes del Trabajador en SST",
    descripcion: "Marco legal de los derechos y deberes del trabajador en seguridad y salud en el trabajo según la legislación colombiana.",
    tipoContenido: "texto",
    urlVideo: "",
    urlDocumento: "",
    contenidoTexto: `La legislación colombiana establece un marco de derechos y deberes tanto para empleadores como para trabajadores en materia de Seguridad y Salud en el Trabajo, fundamentado en el Decreto 1072 de 2015, la Ley 1562 de 2012 y la Resolución 0312 de 2019.

Derechos del trabajador:
- Derecho a trabajar en un ambiente seguro y saludable (Constitución Política, Art. 25).
- Derecho a conocer los riesgos a los que está expuesto en su puesto de trabajo.
- Derecho a recibir inducción y capacitación continua en SST.
- Derecho a participar en las actividades del COPASST o Vigía de SST.
- Derecho a recibir los Elementos de Protección Personal (EPP) sin costo alguno.
- Derecho a negarse a realizar tareas que pongan en peligro su vida o su salud cuando no existan medidas de protección adecuadas (Decreto 1072/2015, Art. 2.2.4.6.10).
- Derecho a ser informado sobre los resultados de los exámenes médicos ocupacionales.
- Derecho a reportar condiciones inseguras sin temor a represalias.
- Derecho a la prestación de primeros auxilios en caso de accidente de trabajo.
- Derecho a la cobertura del Sistema General de Riesgos Laborales (SGRL).

Deberes del trabajador (Decreto 1072/2015, Art. 2.2.4.6.10):
- Procurar el cuidado integral de su salud.
- Suministrar información clara, veraz y completa sobre su estado de salud.
- Cumplir las normas, reglamentos e instrucciones del SG-SST.
- Informar oportunamente al empleador sobre peligros y riesgos latentes en su puesto de trabajo.
- Participar en las actividades de capacitación en SST definidas en el plan de capacitación.
- Participar y contribuir al cumplimiento de los objetivos del SG-SST.
- Usar adecuadamente los EPP suministrados por el empleador.
- Reportar inmediatamente todo accidente e incidente de trabajo.

Deberes del empleador:
- Definir, firmar y divulgar la política de SST.
- Asignar y comunicar responsabilidades en SST a todos los niveles de la organización.
- Rendir cuentas al interior de la empresa sobre el desarrollo del SG-SST.
- Garantizar la capacitación de los trabajadores en SST.
- Implementar y mantener el SG-SST conforme a la normativa vigente.
- Garantizar la disponibilidad de recursos financieros, técnicos y humanos para el SG-SST.`,
    duracionMinutos: 15,
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
  "I": [...contenidosBase],
  "II": [...contenidosBase],
  "III": [...contenidosBase, ...contenidosNivelIII],
  "IV": [...contenidosBase, ...contenidosNivelIII, ...contenidosNivelIV],
  "V": [...contenidosBase, ...contenidosNivelIII, ...contenidosNivelIV],
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
