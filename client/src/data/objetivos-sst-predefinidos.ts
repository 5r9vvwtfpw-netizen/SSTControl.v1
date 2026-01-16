/**
 * Catálogo de Objetivos SST Predefinidos
 * Basado en Decreto 1072/2015, Resolución 0312/2019 e ISO 45001:2018
 * 
 * Facilita la creación de planes, programas y documentos SST con objetivos
 * alineados a la normativa colombiana
 */

export interface ObjetivoSst {
  id: string;
  categoria: 'general' | 'capacitacion' | 'sve' | 'plan-trabajo' | 'comunicacion' | 
             'recursos' | 'emergencias' | 'pesv' | 'adquisiciones' | 'copasst';
  tipo: 'general' | 'especifico';
  objetivo: string;
  alcance?: string;
  normativa: string;
  indicadores?: string[];
}

export const OBJETIVOS_SST_PREDEFINIDOS: Record<string, ObjetivoSst> = {
  // ===== OBJETIVOS GENERALES DEL SG-SST =====
  'general-01': {
    id: 'general-01',
    categoria: 'general',
    tipo: 'general',
    objetivo: 'Planear, implementar y evaluar las actividades del Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST) para garantizar ambientes de trabajo seguros y saludables, previniendo accidentes laborales y enfermedades profesionales.',
    alcance: 'Aplica a todos los trabajadores, contratistas y visitantes en todas las sedes de la empresa',
    normativa: 'Decreto 1072/2015 - Art. 2.2.4.6.5',
    indicadores: [
      'Índice de frecuencia de accidentalidad',
      'Índice de severidad',
      'Índice de lesiones incapacitantes (ILI)',
      'Porcentaje de cumplimiento del plan de trabajo anual'
    ]
  },
  'general-02': {
    id: 'general-02',
    categoria: 'general',
    tipo: 'general',
    objetivo: 'Identificar los peligros, evaluar y valorar los riesgos, y establecer los respectivos controles para minimizar la probabilidad de ocurrencia de accidentes de trabajo y enfermedades laborales.',
    alcance: 'Todas las actividades, procesos y áreas de trabajo',
    normativa: 'Resolución 0312/2019 - Estándar 1.1.2',
    indicadores: [
      'Número de peligros identificados',
      'Porcentaje de riesgos con controles implementados',
      'Número de controles priorizados vs implementados'
    ]
  },
  'general-03': {
    id: 'general-03',
    categoria: 'general',
    tipo: 'general',
    objetivo: 'Promover una cultura de prevención y autocuidado en todos los niveles de la organización, fomentando la participación activa de los trabajadores en la identificación de peligros y control de riesgos.',
    normativa: 'ISO 45001:2018 - Cláusula 5.4',
    indicadores: [
      'Número de reportes de actos y condiciones inseguras',
      'Porcentaje de participación en COPASST',
      'Número de sugerencias de mejora implementadas'
    ]
  },
  'general-04': {
    id: 'general-04',
    categoria: 'general',
    tipo: 'general',
    objetivo: 'Cumplir con la normatividad nacional vigente en materia de Seguridad y Salud en el Trabajo, estableciendo mecanismos de seguimiento y medición del desempeño del SG-SST.',
    normativa: 'Decreto 1072/2015 - Art. 2.2.4.6.2',
    indicadores: [
      'Porcentaje de cumplimiento normativo',
      'Número de hallazgos de auditorías internas',
      'Porcentaje de no conformidades cerradas a tiempo'
    ]
  },

  // ===== OBJETIVOS DE CAPACITACIÓN =====
  'capacitacion-01': {
    id: 'capacitacion-01',
    categoria: 'capacitacion',
    tipo: 'general',
    objetivo: 'Desarrollar competencias en los trabajadores para la identificación de peligros, evaluación de riesgos y aplicación de medidas de control en sus actividades laborales.',
    normativa: 'Resolución 0312/2019 - Estándar 2.7',
    indicadores: [
      'Porcentaje de trabajadores capacitados vs programados',
      'Promedio de calificación en evaluaciones post-capacitación',
      'Número de horas de capacitación por trabajador/año'
    ]
  },
  'capacitacion-02': {
    id: 'capacitacion-02',
    categoria: 'capacitacion',
    tipo: 'general',
    objetivo: 'Garantizar que el 100% de los trabajadores reciban inducción y reinducción en SST según los requisitos del cargo y los peligros identificados en la matriz IPERC.',
    normativa: 'Resolución 0312/2019 - Estándar 2.5',
    indicadores: [
      'Porcentaje de trabajadores con inducción completa',
      'Porcentaje de cumplimiento del programa de reinducción',
      'Tiempo promedio de inducción vs estándar'
    ]
  },
  'capacitacion-03': {
    id: 'capacitacion-03',
    categoria: 'capacitacion',
    tipo: 'especifico',
    objetivo: 'Capacitar a los trabajadores en el uso correcto de Elementos de Protección Personal (EPP) según los peligros identificados en su puesto de trabajo.',
    normativa: 'Resolución 2400/1979 - Título III',
    indicadores: [
      'Número de trabajadores capacitados en EPP',
      'Porcentaje de uso correcto de EPP en inspecciones',
      'Número de no conformidades por uso inadecuado de EPP'
    ]
  },
  'capacitacion-04': {
    id: 'capacitacion-04',
    categoria: 'capacitacion',
    tipo: 'especifico',
    objetivo: 'Desarrollar habilidades en primeros auxilios, prevención y control de incendios, y evacuación de emergencias en el personal designado como brigadistas.',
    normativa: 'NSR-10 Título J',
    indicadores: [
      'Número de brigadistas capacitados y certificados',
      'Tiempo de respuesta en simulacros',
      'Porcentaje de cobertura de brigadistas por sede'
    ]
  },

  // ===== OBJETIVOS DE VIGILANCIA EPIDEMIOLÓGICA =====
  'sve-01': {
    id: 'sve-01',
    categoria: 'sve',
    tipo: 'general',
    objetivo: 'Implementar programas de vigilancia epidemiológica ocupacional para prevenir, detectar precozmente y controlar las enfermedades laborales relacionadas con los riesgos prioritarios de la empresa.',
    normativa: 'Resolución 2346/2007',
    indicadores: [
      'Número de casos detectados precozmente',
      'Porcentaje de trabajadores incluidos en SVE',
      'Número de medidas preventivas implementadas'
    ]
  },
  'sve-02': {
    id: 'sve-02',
    categoria: 'sve',
    tipo: 'especifico',
    objetivo: 'Prevenir desórdenes músculo-esqueléticos (DME) en trabajadores expuestos a factores de riesgo biomecánico mediante vigilancia epidemiológica, capacitación y pausas activas.',
    normativa: 'Resolución 2844/2007 - GTC-45',
    indicadores: [
      'Prevalencia de DME en población vigilada',
      'Número de pausas activas realizadas/semana',
      'Ausentismo laboral por DME'
    ]
  },
  'sve-03': {
    id: 'sve-03',
    categoria: 'sve',
    tipo: 'especifico',
    objetivo: 'Proteger la salud auditiva de los trabajadores expuestos a ruido ocupacional mediante vigilancia médica, entrega de protección auditiva y controles de ingeniería.',
    normativa: 'Resolución 1792/1990',
    indicadores: [
      'Número de trabajadores con audiometrías en rango normal',
      'Porcentaje de uso de protección auditiva',
      'Nivel de ruido promedio en áreas críticas (dB)'
    ]
  },

  // ===== OBJETIVOS DE PLANES DE TRABAJO =====
  'plan-01': {
    id: 'plan-01',
    categoria: 'plan-trabajo',
    tipo: 'general',
    objetivo: 'Ejecutar el Plan Anual de Trabajo del SG-SST en un 90% o más, asignando los recursos necesarios y garantizando el cumplimiento de las actividades programadas según cronograma.',
    normativa: 'Resolución 0312/2019 - Estándar 1.2.1',
    indicadores: [
      'Porcentaje de ejecución del plan anual',
      'Porcentaje de presupuesto ejecutado',
      'Número de actividades cumplidas vs programadas'
    ]
  },
  'plan-02': {
    id: 'plan-02',
    categoria: 'plan-trabajo',
    tipo: 'especifico',
    objetivo: 'Realizar inspecciones de seguridad mensuales en todas las áreas de trabajo para identificar condiciones inseguras y verificar la implementación de medidas correctivas.',
    normativa: 'Resolución 0312/2019 - Estándar 1.1.4',
    indicadores: [
      'Número de inspecciones realizadas vs programadas',
      'Número de condiciones inseguras identificadas',
      'Porcentaje de acciones correctivas cerradas a tiempo'
    ]
  },

  // ===== OBJETIVOS DE COMUNICACIÓN =====
  'comunicacion-01': {
    id: 'comunicacion-01',
    categoria: 'comunicacion',
    tipo: 'general',
    objetivo: 'Establecer canales efectivos de comunicación bidireccional en SST que permitan la divulgación de información relevante y la participación activa de los trabajadores.',
    normativa: 'Decreto 1072/2015 - Art. 2.2.4.6.14',
    indicadores: [
      'Número de comunicaciones SST emitidas/mes',
      'Porcentaje de trabajadores alcanzados',
      'Número de reportes recibidos de trabajadores'
    ]
  },
  'comunicacion-02': {
    id: 'comunicacion-02',
    categoria: 'comunicacion',
    tipo: 'especifico',
    objetivo: 'Divulgar la Política de SST y los procedimientos operativos seguros a todos los niveles de la organización, garantizando su comprensión y aplicación.',
    normativa: 'Resolución 0312/2019 - Estándar 1.1.1',
    indicadores: [
      'Porcentaje de trabajadores que conocen la política SST',
      'Número de procedimientos divulgados',
      'Nivel de comprensión (evaluaciones)'
    ]
  },

  // ===== OBJETIVOS DE ASIGNACIÓN DE RECURSOS =====
  'recursos-01': {
    id: 'recursos-01',
    categoria: 'recursos',
    tipo: 'general',
    objetivo: 'Asignar recursos humanos, técnicos y financieros suficientes para el diseño, implementación, revisión y mejora continua del Sistema de Gestión de SST.',
    normativa: 'Decreto 1072/2015 - Art. 2.2.4.6.8',
    indicadores: [
      'Presupuesto asignado vs ejecutado',
      'Número de recursos humanos dedicados a SST',
      'Nivel de cumplimiento de adquisiciones programadas'
    ]
  },
  'recursos-02': {
    id: 'recursos-02',
    categoria: 'recursos',
    tipo: 'especifico',
    objetivo: 'Garantizar la disponibilidad y mantenimiento de Elementos de Protección Personal (EPP) para todos los trabajadores expuestos a peligros, según matriz IPERC.',
    normativa: 'Resolución 2400/1979 - Título III',
    indicadores: [
      'Porcentaje de EPP entregados vs requeridos',
      'Número de EPP reemplazados por desgaste',
      'Nivel de satisfacción de trabajadores con EPP'
    ]
  },

  // ===== OBJETIVOS DE EMERGENCIAS =====
  'emergencias-01': {
    id: 'emergencias-01',
    categoria: 'emergencias',
    tipo: 'general',
    objetivo: 'Preparar a la organización para prevenir, responder y recuperarse efectivamente ante situaciones de emergencia, garantizando la protección de las personas y la continuidad del negocio.',
    normativa: 'NSR-10 Título J - Ley 1523/2012',
    indicadores: [
      'Número de simulacros realizados/año',
      'Tiempo de evacuación vs objetivo',
      'Porcentaje de hallazgos de simulacros corregidos'
    ]
  },
  'emergencias-02': {
    id: 'emergencias-02',
    categoria: 'emergencias',
    tipo: 'especifico',
    objetivo: 'Conformar, capacitar y equipar brigadas de emergencia para actuar ante incendios, evacuaciones, primeros auxilios y rescate en todas las sedes.',
    normativa: 'NSR-10 Título J',
    indicadores: [
      'Número de brigadistas activos vs requeridos',
      'Horas de entrenamiento de brigadistas/año',
      'Nivel de equipamiento de brigadas (%)'
    ]
  },

  // ===== OBJETIVOS PESV =====
  'pesv-01': {
    id: 'pesv-01',
    categoria: 'pesv',
    tipo: 'general',
    objetivo: 'Prevenir accidentes de tránsito en las actividades laborales mediante la implementación del Plan Estratégico de Seguridad Vial (PESV) y el control de factores de riesgo vial.',
    normativa: 'Resolución 1565/2014 - Ley 1503/2011',
    indicadores: [
      'Número de accidentes de tránsito laborales/año',
      'Porcentaje de conductores capacitados en seguridad vial',
      'Número de vehículos con mantenimiento al día'
    ]
  },
  'pesv-02': {
    id: 'pesv-02',
    categoria: 'pesv',
    tipo: 'especifico',
    objetivo: 'Garantizar que el 100% de los conductores cuenten con licencia vigente, exámenes médicos al día y capacitación en manejo defensivo.',
    normativa: 'Resolución 1565/2014',
    indicadores: [
      'Porcentaje de conductores con documentación vigente',
      'Número de conductores capacitados en manejo defensivo',
      'Frecuencia de exámenes médicos ocupacionales'
    ]
  },

  // ===== OBJETIVOS DE ADQUISICIONES =====
  'adquisiciones-01': {
    id: 'adquisiciones-01',
    categoria: 'adquisiciones',
    tipo: 'general',
    objetivo: 'Adquirir productos y servicios de SST que cumplan con estándares de calidad, normativa vigente y criterios de sostenibilidad, evaluando proveedores y contratistas.',
    normativa: 'Resolución 0312/2019 - Estándar 1.2.2',
    indicadores: [
      'Porcentaje de proveedores evaluados',
      'Número de adquisiciones con criterios SST',
      'Nivel de cumplimiento de especificaciones técnicas'
    ]
  },

  // ===== OBJETIVOS COPASST =====
  'copasst-01': {
    id: 'copasst-01',
    categoria: 'copasst',
    tipo: 'general',
    objetivo: 'Promover y vigilar el cumplimiento de las normas y reglamentos de Seguridad y Salud en el Trabajo a través del Comité Paritario de Seguridad y Salud en el Trabajo (COPASST).',
    normativa: 'Resolución 2013/1986 - Decreto 1072/2015',
    indicadores: [
      'Número de reuniones COPASST realizadas vs programadas',
      'Número de recomendaciones emitidas vs implementadas',
      'Porcentaje de participación de miembros en reuniones'
    ]
  }
};

// Catálogo organizado por categoría para facilitar búsqueda
export const OBJETIVOS_POR_CATEGORIA = {
  general: Object.values(OBJETIVOS_SST_PREDEFINIDOS).filter(obj => obj.categoria === 'general'),
  capacitacion: Object.values(OBJETIVOS_SST_PREDEFINIDOS).filter(obj => obj.categoria === 'capacitacion'),
  sve: Object.values(OBJETIVOS_SST_PREDEFINIDOS).filter(obj => obj.categoria === 'sve'),
  'plan-trabajo': Object.values(OBJETIVOS_SST_PREDEFINIDOS).filter(obj => obj.categoria === 'plan-trabajo'),
  comunicacion: Object.values(OBJETIVOS_SST_PREDEFINIDOS).filter(obj => obj.categoria === 'comunicacion'),
  recursos: Object.values(OBJETIVOS_SST_PREDEFINIDOS).filter(obj => obj.categoria === 'recursos'),
  emergencias: Object.values(OBJETIVOS_SST_PREDEFINIDOS).filter(obj => obj.categoria === 'emergencias'),
  pesv: Object.values(OBJETIVOS_SST_PREDEFINIDOS).filter(obj => obj.categoria === 'pesv'),
  adquisiciones: Object.values(OBJETIVOS_SST_PREDEFINIDOS).filter(obj => obj.categoria === 'adquisiciones'),
  copasst: Object.values(OBJETIVOS_SST_PREDEFINIDOS).filter(obj => obj.categoria === 'copasst'),
};

// Helper para obtener objetivos sugeridos según contexto
export function getObjetivosSugeridos(categoria?: string): ObjetivoSst[] {
  if (categoria && OBJETIVOS_POR_CATEGORIA[categoria as keyof typeof OBJETIVOS_POR_CATEGORIA]) {
    return OBJETIVOS_POR_CATEGORIA[categoria as keyof typeof OBJETIVOS_POR_CATEGORIA];
  }
  return Object.values(OBJETIVOS_SST_PREDEFINIDOS);
}
