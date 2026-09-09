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
      contenidoTexto: `El PESV ayuda a prevenir accidentes y lesiones durante los desplazamientos relacionados con el trabajo.
Cumpla las normas de tránsito, cuide a todos los actores viales y mantenga una conducta segura.
Reporte peligros, fallas del vehículo e incidentes antes de continuar el recorrido.`,
      duracionMinutos: 2,
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
      contenidoTexto: `La velocidad, la fatiga, el celular, el alcohol y las maniobras inseguras aumentan el riesgo vial.
Antes de salir, revise su estado físico, el vehículo, la carga, la ruta y el clima.
No inicie o detenga el recorrido si alguna condición puede poner en riesgo la vida.`,
      duracionMinutos: 2,
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
      contenidoTexto: `La empresa y los trabajadores comparten el compromiso de proteger la vida en cada desplazamiento.
Use el cinturón, respete la velocidad, evite el celular y nunca conduzca bajo efectos de alcohol o sustancias.
Realice la inspección preoperacional y reporte fallas, fatiga o condiciones inseguras.`,
      duracionMinutos: 2,
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
      contenidoTexto: `Respete siempre las señales y los límites de velocidad; en zonas residenciales y escolares el máximo es 30 km/h.
Use el cinturón en todos los asientos y no manipule el celular mientras conduce.
Si siente sueño o fatiga, deténgase en un lugar seguro y descanse antes de continuar.`,
      duracionMinutos: 2,
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
      contenidoTexto: `Ante un accidente, deténgase con seguridad, señalice la zona y solicite ayuda al 123 si es necesario.
Informe de inmediato a la empresa y siga las instrucciones de las autoridades, la aseguradora y la ARL.
Tome evidencias sin poner en riesgo su vida y no abandone el lugar ni altere la información.`,
      duracionMinutos: 2,
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
