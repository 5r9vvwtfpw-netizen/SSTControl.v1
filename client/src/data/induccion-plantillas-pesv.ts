/**
 * Plantillas de inducción virtual PESV
 * Contenidos y preguntas predefinidas para el Plan Estratégico de Seguridad Vial
 * Resolución 40595/2022 - Ministerio de Transporte
 */

type PlantillaContenido = {
  titulo: string;
  descripcion: string;
  tipoContenido: "video" | "documento" | "presentacion" | "texto";
  urlVideo: string;
  urlDocumento: string;
  contenidoTexto: string;
  duracionMinutos: number;
  estado: "borrador" | "publicado" | "archivado";
  obligatorio: number;
  tipoInduccion: "pesv";
};

type PlantillaPregunta = {
  pregunta: string;
  opciones: string[];
  respuestaCorrecta: number;
  explicacion: string;
  activa: number;
  tipoInduccion: "pesv";
};

type PlantillaPesv = {
  contenidos: PlantillaContenido[];
  preguntas: PlantillaPregunta[];
};

const PLANTILLA_PESV: PlantillaPesv = {
  contenidos: [
    {
      titulo: "¿Qué es el PESV? — Resolución 40595/2022",
      descripcion:
        "Introducción al Plan Estratégico de Seguridad Vial: obligatoriedad, objetivos y pilares según la Resolución 40595 de 2022 del Ministerio de Transporte.",
      tipoContenido: "texto",
      urlVideo: "",
      urlDocumento: "",
      contenidoTexto: `PLAN ESTRATÉGICO DE SEGURIDAD VIAL (PESV)

El PESV es la herramienta de gestión mediante la cual la organización identifica, controla y reduce los riesgos asociados a sus desplazamientos laborales. Su metodología está definida por la Resolución 40595 de 2022 del Ministerio de Transporte.

Sus objetivos principales son:
• Prevenir muertes y lesiones graves en siniestros viales.
• Promover comportamientos seguros de conductores, pasajeros, peatones y demás actores viales.
• Mantener vehículos y equipos en condiciones seguras.
• Planificar desplazamientos y rutas teniendo en cuenta sus riesgos.
• Investigar incidentes y aplicar acciones de mejora.

Todo trabajador debe cumplir la política de seguridad vial, participar en las actividades del PESV, reportar peligros e incidentes y abstenerse de conducir cuando exista una condición que comprometa la seguridad.`,
      duracionMinutos: 10,
      estado: "borrador",
      obligatorio: 1,
      tipoInduccion: "pesv",
    },
    {
      titulo: "Factores de riesgo vial en el trabajo",
      descripcion:
        "Identificación de los principales factores de riesgo vial: velocidad, fatiga, distracción, alcohol/drogas, condiciones del vehículo y del entorno vial.",
      tipoContenido: "texto",
      urlVideo: "",
      urlDocumento: "",
      contenidoTexto: `FACTORES DE RIESGO VIAL EN EL TRABAJO

Los siniestros viales pueden originarse por la interacción entre la persona, el vehículo y el entorno.

Factores humanos:
• Exceso de velocidad.
• Fatiga, somnolencia o jornadas prolongadas.
• Distracción por celular, alimentos u otros elementos.
• Consumo de alcohol, medicamentos o sustancias psicoactivas.
• Maniobras inseguras y desconocimiento de la ruta.

Factores del vehículo:
• Fallas en frenos, dirección, llantas, luces o cinturones.
• Mantenimiento vencido o inspección preoperacional incompleta.
• Carga mal distribuida o sin asegurar.

Factores del entorno:
• Lluvia, baja visibilidad, vías en mal estado y tráfico.
• Señalización deficiente, obras o presencia de peatones.

Antes de cada desplazamiento se debe evaluar la condición del conductor, inspeccionar el vehículo y revisar ruta, clima y tiempo disponible.`,
      duracionMinutos: 12,
      estado: "borrador",
      obligatorio: 1,
      tipoInduccion: "pesv",
    },
    {
      titulo: "Política de seguridad vial de la empresa",
      descripcion:
        "Política corporativa de seguridad vial: compromisos, responsabilidades de trabajadores y empleador en la gestión del riesgo vial.",
      tipoContenido: "texto",
      urlVideo: "",
      urlDocumento: "",
      contenidoTexto: `POLÍTICA DE SEGURIDAD VIAL

La organización se compromete a proteger la vida y la integridad de todas las personas durante los desplazamientos relacionados con el trabajo.

Responsabilidades del trabajador:
• Cumplir las normas de tránsito y los límites de velocidad.
• Usar siempre el cinturón de seguridad y exigirlo a los pasajeros.
• No conducir bajo efectos de alcohol, sustancias psicoactivas o medicamentos que alteren la capacidad.
• No manipular el celular mientras conduce.
• Realizar la inspección preoperacional y reportar fallas.
• Respetar los tiempos de descanso y detenerse ante señales de fatiga.
• Informar incidentes, comparendos y condiciones inseguras.

Responsabilidades de la empresa:
• Proporcionar vehículos seguros y mantenimiento oportuno.
• Capacitar y verificar la competencia de quienes conducen.
• Planificar rutas, jornadas y controles de riesgo.
• Investigar eventos viales y ejecutar acciones correctivas.`,
      duracionMinutos: 8,
      estado: "borrador",
      obligatorio: 1,
      tipoInduccion: "pesv",
    },
    {
      titulo: "Normas de tránsito aplicables al trabajo",
      descripcion:
        "Velocidades máximas, señales de tránsito, uso del cinturón, prohibición del celular al conducir y otras normas del Código Nacional de Tránsito relevantes para el trabajo.",
      tipoContenido: "texto",
      urlVideo: "",
      urlDocumento: "",
      contenidoTexto: `NORMAS DE TRÁNSITO CLAVE PARA EL TRABAJO

1. VELOCIDADES MÁXIMAS (Código Nacional de Tránsito - Ley 769/2002)
   • Zona residencial / escolar: 30 km/h
   • Zona urbana: 50 km/h
   • Carretera primaria: 80 km/h
   • Autopistas: 120 km/h

2. USO OBLIGATORIO DEL CINTURÓN
   El cinturón debe usarse en todo momento mientras el vehículo está en movimiento, en TODOS los asientos (Art. 82 Ley 769/2002).

3. PROHIBICIONES AL CONDUCIR
   • Usar el celular sin manos libres.
   • Conducir bajo efectos de alcohol o sustancias psicoactivas.
   • Consumir alimentos o bebidas.

4. ACCIDENTE EN MISIÓN
   Si ocurre un accidente durante el trabajo:
   a) Garantice la seguridad de los involucrados.
   b) Llame a emergencias (123) y a la empresa de inmediato.
   c) No mueva los vehículos hasta que llegue la autoridad (salvo riesgo inminente).
   d) Reporte a la ARL dentro de las 24 horas.

5. DESCANSO Y FATIGA
   • No conduzca si siente sueño o cansancio extremo.
   • En trayectos largos, detenga el vehículo cada 2 horas y descanse.`,
      duracionMinutos: 10,
      estado: "borrador",
      obligatorio: 1,
      tipoInduccion: "pesv",
    },
    {
      titulo: "Protocolo de reporte de accidentes de tránsito",
      descripcion:
        "Pasos a seguir ante un accidente de tránsito en misión o in itinere: reporte a la empresa, ARL, autoridades y manejo de la documentación.",
      tipoContenido: "texto",
      urlVideo: "",
      urlDocumento: "",
      contenidoTexto: `PROTOCOLO DE REPORTE DE ACCIDENTES DE TRÁNSITO

Ante un siniestro vial relacionado con el trabajo:

1. Deténgase en un lugar seguro, encienda las luces de emergencia y señalice la zona.
2. Verifique el estado de las personas. Solicite ayuda al 123 cuando sea necesario y no mueva a una persona lesionada salvo peligro inminente.
3. Informe de inmediato al responsable definido por la empresa.
4. No abandone el lugar ni acepte acuerdos informales que impidan documentar el evento.
5. Registre fotografías, ubicación, hora, placas, datos de involucrados, testigos y autoridades que atienden.
6. Siga las instrucciones de la autoridad de tránsito, aseguradora y ARL.
7. Entregue la documentación solicitada y participe en la investigación interna.

El reporte oportuno permite activar la atención, conservar evidencia y prevenir nuevos eventos. La prioridad siempre es proteger la vida.`,
      duracionMinutos: 7,
      estado: "borrador",
      obligatorio: 1,
      tipoInduccion: "pesv",
    },
  ],
  preguntas: [
    {
      pregunta: "¿Qué norma colombiana regula el Plan Estratégico de Seguridad Vial (PESV)?",
      opciones: [
        "Resolución 40595 de 2022",
        "Decreto 1072 de 2015",
        "Ley 769 de 2002",
        "Resolución 0312 de 2019",
      ],
      respuestaCorrecta: 0,
      explicacion:
        "La Resolución 40595 de 2022 del Ministerio de Transporte establece los lineamientos del PESV en Colombia.",
      activa: 1,
      tipoInduccion: "pesv",
    },
    {
      pregunta: "¿Cuál es la velocidad máxima permitida en zona residencial según el Código Nacional de Tránsito?",
      opciones: ["60 km/h", "50 km/h", "30 km/h", "80 km/h"],
      respuestaCorrecta: 2,
      explicacion:
        "En zonas residenciales y escolares la velocidad máxima es 30 km/h según el Código Nacional de Tránsito (Ley 769/2002).",
      activa: 1,
      tipoInduccion: "pesv",
    },
    {
      pregunta: "¿Qué debe hacer un trabajador si ocurre un accidente de tránsito en misión?",
      opciones: [
        "Notificar a la empresa y a las autoridades inmediatamente",
        "Continuar el viaje y reportar al llegar",
        "Solo notificar a la ARL",
        "Esperar a que llegue la policía sin hacer nada",
      ],
      respuestaCorrecta: 0,
      explicacion:
        "En caso de accidente en misión se debe notificar a la empresa, a las autoridades y a la ARL de inmediato.",
      activa: 1,
      tipoInduccion: "pesv",
    },
    {
      pregunta: "¿Cuál es el uso correcto del cinturón de seguridad?",
      opciones: [
        "Solo en carretera, no en ciudad",
        "Siempre que el vehículo esté en movimiento",
        "Solo en el asiento delantero",
        "No es obligatorio si la velocidad es baja",
      ],
      respuestaCorrecta: 1,
      explicacion:
        "El cinturón debe usarse siempre que el vehículo esté en movimiento, en todos los asientos (Art. 82 Ley 769/2002).",
      activa: 1,
      tipoInduccion: "pesv",
    },
    {
      pregunta: "¿Qué factor aumenta principalmente el riesgo de accidente de tránsito en el trabajo?",
      opciones: [
        "Fatiga y somnolencia al conducir",
        "Conocer bien la ruta habitual",
        "Viajar en horas del día con buena visibilidad",
        "Usar GPS o aplicaciones de navegación",
      ],
      respuestaCorrecta: 0,
      explicacion:
        "La fatiga y somnolencia son factores críticos de riesgo vial en el contexto laboral, afectando tiempo de reacción y concentración.",
      activa: 1,
      tipoInduccion: "pesv",
    },
    {
      pregunta: "¿Con qué frecuencia se recomienda descansar en trayectos largos para prevenir la fatiga?",
      opciones: [
        "Cada 5 horas de conducción continua",
        "Cada 2 horas de conducción continua",
        "Solo cuando se sienta sueño",
        "Al inicio y al final del viaje",
      ],
      respuestaCorrecta: 1,
      explicacion:
        "Se recomienda hacer una pausa de al menos 15 minutos cada 2 horas de conducción continua para prevenir la fatiga.",
      activa: 1,
      tipoInduccion: "pesv",
    },
    {
      pregunta: "¿Cuál de las siguientes conductas está PROHIBIDA mientras se conduce?",
      opciones: [
        "Usar el aire acondicionado",
        "Llevar el radio encendido",
        "Usar el celular sin manos libres",
        "Llevar documentos en el tablero",
      ],
      respuestaCorrecta: 2,
      explicacion:
        "Usar el celular sin sistema de manos libres mientras se conduce está prohibido y es una de las principales causas de accidentes.",
      activa: 1,
      tipoInduccion: "pesv",
    },
    {
      pregunta: "¿Qué es un accidente de tránsito 'in itinere'?",
      opciones: [
        "El que ocurre durante la jornada laboral en misión",
        "El que ocurre en el parqueadero de la empresa",
        "El que ocurre en el trayecto de casa al trabajo o viceversa",
        "El que ocurre dentro de las instalaciones de la empresa",
      ],
      respuestaCorrecta: 2,
      explicacion:
        "El accidente in itinere es el que ocurre en el trayecto habitual entre el lugar de residencia y el trabajo, y está cubierto por la ARL.",
      activa: 1,
      tipoInduccion: "pesv",
    },
  ],
};

export function getPlantillaPesv(): PlantillaPesv {
  return PLANTILLA_PESV;
}
