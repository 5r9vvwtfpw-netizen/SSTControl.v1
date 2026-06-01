/**
 * CATÁLOGOS DE DATOS SST COLOMBIA
 * Datos predefinidos para formularios inteligentes
 */

// =====================================================
// CATÁLOGO DE CAPACITACIONES OBLIGATORIAS
// =====================================================

export interface CapacitacionPredefinida {
  codigo: string;
  nombre: string;
  duracionHoras: number;
  frecuencia: 'unica' | 'anual' | 'semestral' | 'trimestral' | 'mensual';
  dirigidoA: string[];
  contenidoMinimo: string[];
  normativaBase: string;
  obligatoria: boolean;
  modalidad: ('presencial' | 'virtual' | 'mixta')[];
}

export const CAPACITACIONES_OBLIGATORIAS: CapacitacionPredefinida[] = [
  {
    codigo: 'CAP-IND-01',
    nombre: 'Inducción en Seguridad y Salud en el Trabajo',
    duracionHoras: 4,
    frecuencia: 'unica',
    dirigidoA: ['Personal nuevo', 'Trabajadores en misión', 'Contratistas'],
    contenidoMinimo: [
      'Generalidades de la empresa',
      'Política de SST',
      'Objetivos del SG-SST',
      'Derechos y deberes en SST',
      'Peligros y riesgos del cargo',
      'Medidas de prevención y control',
      'Uso de elementos de protección personal',
      'Reporte de condiciones y actos inseguros',
      'Plan de emergencias y procedimiento de evacuación',
      'COPASST y Comité de Convivencia'
    ],
    normativaBase: 'Decreto 1072/2015, Art. 2.2.4.6.11',
    obligatoria: true,
    modalidad: ['presencial', 'virtual', 'mixta']
  },
  {
    codigo: 'CAP-REIND-01',
    nombre: 'Reinducción en Seguridad y Salud en el Trabajo',
    duracionHoras: 2,
    frecuencia: 'anual',
    dirigidoA: ['Todos los trabajadores'],
    contenidoMinimo: [
      'Actualización de la Política de SST',
      'Cambios en los peligros y riesgos',
      'Nuevas medidas de control',
      'Resultados de indicadores SST',
      'Lecciones aprendidas de accidentes e incidentes',
      'Refuerzo en procedimientos críticos',
      'Actualización del plan de emergencias'
    ],
    normativaBase: 'Decreto 1072/2015, Art. 2.2.4.6.11',
    obligatoria: true,
    modalidad: ['presencial', 'virtual', 'mixta']
  },
  {
    codigo: 'CAP-50H-01',
    nombre: 'Curso de Capacitación Virtual de 50 Horas en SST',
    duracionHoras: 50,
    frecuencia: 'unica',
    dirigidoA: ['Responsable del SG-SST', 'Alta dirección'],
    contenidoMinimo: [
      'Módulo 1: Normatividad del SG-SST (10 horas)',
      'Módulo 2: Marco conceptual del SG-SST (8 horas)',
      'Módulo 3: Planificación del SG-SST (10 horas)',
      'Módulo 4: Aplicación del SG-SST (10 horas)',
      'Módulo 5: Verificación del SG-SST (6 horas)',
      'Módulo 6: Mejora del SG-SST (6 horas)'
    ],
    normativaBase: 'Resolución 4927/2016',
    obligatoria: true,
    modalidad: ['virtual']
  },
  {
    codigo: 'CAP-COPASST-01',
    nombre: 'Capacitación de Integrantes del COPASST',
    duracionHoras: 20,
    frecuencia: 'unica',
    dirigidoA: ['Miembros del COPASST', 'Vigía SST'],
    contenidoMinimo: [
      'Normatividad del COPASST (Res. 2013/1986)',
      'Funciones y responsabilidades del comité',
      'Identificación de peligros y valoración de riesgos',
      'Investigación de accidentes e incidentes',
      'Inspecciones de seguridad',
      'Indicadores de gestión SST',
      'Elaboración de actas y seguimiento'
    ],
    normativaBase: 'Resolución 0312/2019, Estándar 1.1.7',
    obligatoria: true,
    modalidad: ['presencial', 'virtual', 'mixta']
  },
  {
    codigo: 'CAP-BRIG-01',
    nombre: 'Capacitación de Brigadas de Emergencia',
    duracionHoras: 16,
    frecuencia: 'anual',
    dirigidoA: ['Brigadistas'],
    contenidoMinimo: [
      'Plan de emergencias y contingencias',
      'Primeros auxilios básicos',
      'Control y extinción de incendios',
      'Evacuación y rescate',
      'Materiales peligrosos (HAZMAT)',
      'Simulacros y prácticas',
      'Comunicación en emergencias'
    ],
    normativaBase: 'Decreto 1072/2015, Art. 2.2.4.6.25',
    obligatoria: true,
    modalidad: ['presencial', 'mixta']
  },
  {
    codigo: 'CAP-ALT-01',
    nombre: 'Trabajo Seguro en Alturas - Nivel Básico',
    duracionHoras: 8,
    frecuencia: 'unica',
    dirigidoA: ['Trabajadores que realizan labores en alturas (jefe de área, capataz)'],
    contenidoMinimo: [
      'Normatividad vigente (Res. 4272/2021)',
      'Identificación de peligros en trabajo en alturas',
      'Sistemas de acceso',
      'Medidas de prevención y protección',
      'Procedimientos de emergencia y rescate'
    ],
    normativaBase: 'Resolución 4272/2021',
    obligatoria: false,
    modalidad: ['presencial', 'mixta']
  },
  {
    codigo: 'CAP-ALT-02',
    nombre: 'Trabajo Seguro en Alturas - Nivel Avanzado',
    duracionHoras: 40,
    frecuencia: 'unica',
    dirigidoA: ['Trabajadores que realizan labores en alturas'],
    contenidoMinimo: [
      'Normatividad vigente (Res. 4272/2021)',
      'Análisis de riesgos en trabajo en alturas',
      'Sistemas de acceso: escaleras, andamios, plataformas',
      'Equipos de protección contra caídas',
      'Técnicas de trabajo seguro',
      'Planes de rescate',
      'Prácticas supervisadas'
    ],
    normativaBase: 'Resolución 4272/2021',
    obligatoria: false,
    modalidad: ['presencial']
  },
  {
    codigo: 'CAP-PAUX-01',
    nombre: 'Primeros Auxilios Básicos',
    duracionHoras: 8,
    frecuencia: 'anual',
    dirigidoA: ['Brigadistas', 'Personal voluntario'],
    contenidoMinimo: [
      'Evaluación inicial del paciente',
      'Signos vitales',
      'Heridas y hemorragias',
      'Quemaduras',
      'Fracturas e inmovilización',
      'RCP básico',
      'Atragantamiento',
      'Uso del botiquín'
    ],
    normativaBase: 'Decreto 1072/2015, Art. 2.2.4.6.25',
    obligatoria: false,
    modalidad: ['presencial']
  },
  {
    codigo: 'CAP-ERG-01',
    nombre: 'Ergonomía y Prevención de Desórdenes Musculoesqueléticos',
    duracionHoras: 4,
    frecuencia: 'anual',
    dirigidoA: ['Personal administrativo', 'Personal operativo'],
    contenidoMinimo: [
      'Conceptos básicos de ergonomía',
      'Factores de riesgo ergonómico',
      'Desórdenes musculoesqueléticos (DME)',
      'Higiene postural',
      'Pausas activas',
      'Técnicas de levantamiento de cargas',
      'Organización del puesto de trabajo'
    ],
    normativaBase: 'Resolución 2400/1979, Capítulo V',
    obligatoria: false,
    modalidad: ['presencial', 'virtual']
  },
  {
    codigo: 'CAP-PSI-01',
    nombre: 'Prevención del Riesgo Psicosocial',
    duracionHoras: 4,
    frecuencia: 'anual',
    dirigidoA: ['Todos los trabajadores'],
    contenidoMinimo: [
      'Factores de riesgo psicosocial',
      'Estrés laboral y sus consecuencias',
      'Síndrome de burnout',
      'Acoso laboral (Ley 1010/2006)',
      'Estrategias de afrontamiento',
      'Balance vida-trabajo',
      'Canales de atención y apoyo'
    ],
    normativaBase: 'Resolución 2646/2008',
    obligatoria: false,
    modalidad: ['presencial', 'virtual']
  },
  {
    codigo: 'CAP-QUI-01',
    nombre: 'Manejo Seguro de Sustancias Químicas',
    duracionHoras: 4,
    frecuencia: 'anual',
    dirigidoA: ['Personal que manipula sustancias químicas'],
    contenidoMinimo: [
      'Sistema Globalmente Armonizado (SGA)',
      'Hojas de seguridad (SDS)',
      'Etiquetado de productos químicos',
      'Almacenamiento seguro',
      'Elementos de protección personal',
      'Procedimientos de emergencia por derrames',
      'Primeros auxilios por exposición'
    ],
    normativaBase: 'Decreto 1496/2018',
    obligatoria: false,
    modalidad: ['presencial', 'mixta']
  },
  {
    codigo: 'CAP-ELE-01',
    nombre: 'Riesgo Eléctrico',
    duracionHoras: 8,
    frecuencia: 'anual',
    dirigidoA: ['Personal expuesto a riesgo eléctrico', 'Electricistas'],
    contenidoMinimo: [
      'Conceptos básicos de electricidad',
      'Efectos de la corriente eléctrica en el cuerpo',
      'Tipos de contactos eléctricos',
      'Medidas de prevención',
      'Elementos de protección personal',
      'Procedimientos de trabajo seguro (RETIE)',
      'Primeros auxilios por electrocución'
    ],
    normativaBase: 'RETIE - Resolución 90708/2013',
    obligatoria: false,
    modalidad: ['presencial']
  },
  {
    codigo: 'CAP-COND-01',
    nombre: 'Conducción Defensiva y Seguridad Vial',
    duracionHoras: 8,
    frecuencia: 'anual',
    dirigidoA: ['Conductores'],
    contenidoMinimo: [
      'Normatividad de tránsito vigente',
      'Técnicas de conducción defensiva',
      'Factores de riesgo vial',
      'Alcohol y drogas al volante',
      'Distracciones (celular)',
      'Fatiga y somnolencia',
      'Inspección preoperacional del vehículo',
      'Procedimientos de emergencia vial'
    ],
    normativaBase: 'Ley 1503/2011 - Resolución 1565/2014',
    obligatoria: false,
    modalidad: ['presencial', 'virtual']
  },
  {
    codigo: 'CAP-CCL-01',
    nombre: 'Capacitación Comité de Convivencia Laboral',
    duracionHoras: 4,
    frecuencia: 'unica',
    dirigidoA: ['Miembros del Comité de Convivencia Laboral'],
    contenidoMinimo: [
      'Ley 1010/2006 - Acoso Laboral',
      'Resolución 652/2012 y 1356/2012',
      'Funciones del Comité de Convivencia',
      'Procedimiento de quejas',
      'Técnicas de mediación y conciliación',
      'Elaboración de actas e informes',
      'Confidencialidad y ética'
    ],
    normativaBase: 'Resolución 652/2012',
    obligatoria: true,
    modalidad: ['presencial', 'virtual']
  }
];

// =====================================================
// CATÁLOGO DE CATEGORÍAS DE DOCUMENTOS
// =====================================================

export interface CategoriaDocumento {
  codigo: string;
  nombre: string;
  descripcion: string;
  tiempoRetencion: number;
  tiposDocumentos: string[];
  cicloPHVA: 'planear' | 'hacer' | 'verificar' | 'actuar';
  normativaBase: string;
}

export const CATEGORIAS_DOCUMENTOS: CategoriaDocumento[] = [
  {
    codigo: 'POL',
    nombre: 'Políticas',
    descripcion: 'Políticas del Sistema de Gestión de SST',
    tiempoRetencion: 20,
    tiposDocumentos: [
      'Política de SST',
      'Política de prevención de alcohol y drogas',
      'Política de seguridad vial',
      'Política de acoso laboral',
      'Política de emergencias',
      'Política de trabajo en alturas',
      'Política de gestión ambiental'
    ],
    cicloPHVA: 'planear',
    normativaBase: 'Decreto 1072/2015, Art. 2.2.4.6.5'
  },
  {
    codigo: 'PRO',
    nombre: 'Procedimientos',
    descripcion: 'Procedimientos operativos del SG-SST',
    tiempoRetencion: 20,
    tiposDocumentos: [
      'Procedimiento de identificación de peligros',
      'Procedimiento de investigación de accidentes',
      'Procedimiento de auditorías internas',
      'Procedimiento de gestión del cambio',
      'Procedimiento de comunicaciones',
      'Procedimiento de adquisiciones',
      'Procedimiento de contratación'
    ],
    cicloPHVA: 'planear',
    normativaBase: 'Decreto 1072/2015, Art. 2.2.4.6.12'
  },
  {
    codigo: 'FOR',
    nombre: 'Formatos y Registros',
    descripcion: 'Formatos para registro de actividades SST',
    tiempoRetencion: 20,
    tiposDocumentos: [
      'Formato de inspección',
      'Formato de capacitación',
      'Formato de entrega de EPP',
      'Formato de reporte de incidentes',
      'Formato de permiso de trabajo',
      'Lista de asistencia',
      'Acta de reunión'
    ],
    cicloPHVA: 'hacer',
    normativaBase: 'Decreto 1072/2015, Art. 2.2.4.6.12'
  },
  {
    codigo: 'MAT',
    nombre: 'Matrices',
    descripcion: 'Matrices de gestión SST',
    tiempoRetencion: 20,
    tiposDocumentos: [
      'Matriz de peligros y valoración de riesgos (IPERC)',
      'Matriz legal',
      'Matriz de EPP',
      'Matriz de capacitación',
      'Matriz de responsabilidades',
      'Matriz de comunicaciones',
      'Matriz de indicadores'
    ],
    cicloPHVA: 'planear',
    normativaBase: 'Decreto 1072/2015, Art. 2.2.4.6.15'
  },
  {
    codigo: 'PLA',
    nombre: 'Planes y Programas',
    descripcion: 'Planes y programas del SG-SST',
    tiempoRetencion: 20,
    tiposDocumentos: [
      'Plan de trabajo anual',
      'Plan de emergencias',
      'Plan de capacitación',
      'Programa de vigilancia epidemiológica',
      'Programa de inspecciones',
      'Programa de mantenimiento preventivo',
      'Plan estratégico de seguridad vial (PESV)'
    ],
    cicloPHVA: 'planear',
    normativaBase: 'Decreto 1072/2015, Art. 2.2.4.6.17'
  },
  {
    codigo: 'ACT',
    nombre: 'Actas',
    descripcion: 'Actas de reuniones y comités',
    tiempoRetencion: 20,
    tiposDocumentos: [
      'Actas COPASST',
      'Actas Comité de Convivencia',
      'Actas de reunión gerencial',
      'Actas de revisión por la dirección',
      'Actas de constitución de comités',
      'Actas de capacitación'
    ],
    cicloPHVA: 'verificar',
    normativaBase: 'Resolución 2013/1986'
  },
  {
    codigo: 'INF',
    nombre: 'Informes',
    descripcion: 'Informes de gestión SST',
    tiempoRetencion: 20,
    tiposDocumentos: [
      'Informe de gestión SST',
      'Informe de auditoría',
      'Informe de investigación de accidentes',
      'Informe de inspecciones',
      'Informe de indicadores',
      'Informe de revisión por la dirección',
      'Informe epidemiológico'
    ],
    cicloPHVA: 'verificar',
    normativaBase: 'Decreto 1072/2015, Art. 2.2.4.6.30'
  },
  {
    codigo: 'MED',
    nombre: 'Documentos Médicos',
    descripcion: 'Historiales y certificados médicos ocupacionales',
    tiempoRetencion: 30,
    tiposDocumentos: [
      'Certificados de aptitud médica',
      'Profesiogramas',
      'Historias clínicas ocupacionales',
      'Resultados de paraclínicos',
      'Restricciones y recomendaciones médicas',
      'Certificados de incapacidad',
      'Diagnósticos de enfermedad laboral'
    ],
    cicloPHVA: 'hacer',
    normativaBase: 'Resolución 2346/2007'
  },
  {
    codigo: 'CAP',
    nombre: 'Capacitación',
    descripcion: 'Registros de capacitación y entrenamiento',
    tiempoRetencion: 20,
    tiposDocumentos: [
      'Cronograma de capacitación',
      'Material de capacitación',
      'Listas de asistencia',
      'Evaluaciones de conocimiento',
      'Certificados de capacitación',
      'Registros de inducción',
      'Registros de reinducción'
    ],
    cicloPHVA: 'hacer',
    normativaBase: 'Decreto 1072/2015, Art. 2.2.4.6.11'
  },
  {
    codigo: 'INV',
    nombre: 'Investigaciones',
    descripcion: 'Investigaciones de accidentes e incidentes',
    tiempoRetencion: 20,
    tiposDocumentos: [
      'Informe de investigación de accidentes',
      'Informe de investigación de incidentes',
      'FURAT (Formato Único de Reporte de Accidentes)',
      'Análisis de causalidad',
      'Planes de acción correctiva',
      'Seguimiento a acciones'
    ],
    cicloPHVA: 'verificar',
    normativaBase: 'Resolución 1401/2007'
  },
  {
    codigo: 'EPP',
    nombre: 'Elementos de Protección Personal',
    descripcion: 'Registros de EPP',
    tiempoRetencion: 20,
    tiposDocumentos: [
      'Matriz de EPP por cargo',
      'Fichas técnicas de EPP',
      'Registros de entrega de EPP',
      'Inspección de EPP',
      'Certificados de calidad EPP'
    ],
    cicloPHVA: 'hacer',
    normativaBase: 'Decreto 1072/2015, Art. 2.2.4.6.24'
  },
  {
    codigo: 'EME',
    nombre: 'Emergencias',
    descripcion: 'Documentos de gestión de emergencias',
    tiempoRetencion: 20,
    tiposDocumentos: [
      'Plan de emergencias y contingencias',
      'Análisis de amenazas y vulnerabilidad',
      'Planos de evacuación',
      'Procedimientos operativos normalizados (PON)',
      'Registros de simulacros',
      'Inventario de equipos de emergencia',
      'Registros de inspección de extintores'
    ],
    cicloPHVA: 'hacer',
    normativaBase: 'Decreto 1072/2015, Art. 2.2.4.6.25'
  },
  {
    codigo: 'AUD',
    nombre: 'Auditorías',
    descripcion: 'Documentos de auditoría del SG-SST',
    tiempoRetencion: 20,
    tiposDocumentos: [
      'Programa de auditorías',
      'Plan de auditoría',
      'Listas de verificación',
      'Informes de auditoría',
      'No conformidades',
      'Acciones correctivas y preventivas',
      'Seguimiento a hallazgos'
    ],
    cicloPHVA: 'verificar',
    normativaBase: 'Decreto 1072/2015, Art. 2.2.4.6.29'
  },
  {
    codigo: 'MEJ',
    nombre: 'Mejora Continua',
    descripcion: 'Documentos de acciones de mejora',
    tiempoRetencion: 20,
    tiposDocumentos: [
      'Plan de mejoramiento',
      'Acciones correctivas',
      'Acciones preventivas',
      'Acciones de mejora',
      'Seguimiento y cierre de acciones',
      'Análisis de tendencias',
      'Lecciones aprendidas'
    ],
    cicloPHVA: 'actuar',
    normativaBase: 'Decreto 1072/2015, Art. 2.2.4.6.34'
  }
];

// =====================================================
// CATÁLOGO DE TIPOS DE CAMBIO (GESTIÓN DEL CAMBIO)
// =====================================================

export interface TipoCambio {
  codigo: string;
  nombre: string;
  descripcion: string;
  ejemplos: string[];
  aspectosEvaluar: string[];
  controlesRecomendados: string[];
}

export const TIPOS_CAMBIO: TipoCambio[] = [
  {
    codigo: 'CAM-PRO',
    nombre: 'Cambio en Procesos',
    descripcion: 'Modificaciones en procesos productivos o administrativos',
    ejemplos: [
      'Nuevo método de producción',
      'Cambio en secuencia de operaciones',
      'Automatización de procesos',
      'Cambio en turnos de trabajo'
    ],
    aspectosEvaluar: [
      'Nuevos peligros introducidos',
      'Cambios en exposición a riesgos existentes',
      'Necesidad de nuevas competencias',
      'Impacto en procedimientos de emergencia'
    ],
    controlesRecomendados: [
      'Actualizar matriz de peligros',
      'Capacitar al personal afectado',
      'Revisar procedimientos de trabajo',
      'Verificar EPP requeridos'
    ]
  },
  {
    codigo: 'CAM-EQU',
    nombre: 'Cambio en Equipos o Maquinaria',
    descripcion: 'Adquisición, modificación o reemplazo de equipos',
    ejemplos: [
      'Compra de nueva maquinaria',
      'Modificación de equipos existentes',
      'Cambio de herramientas',
      'Actualización tecnológica'
    ],
    aspectosEvaluar: [
      'Nuevos riesgos mecánicos',
      'Requisitos de mantenimiento',
      'Necesidad de protecciones',
      'Ruido, vibraciones, emisiones'
    ],
    controlesRecomendados: [
      'Solicitar fichas técnicas',
      'Verificar guardas y protecciones',
      'Capacitar en operación segura',
      'Establecer programa de mantenimiento'
    ]
  },
  {
    codigo: 'CAM-INS',
    nombre: 'Cambio en Instalaciones',
    descripcion: 'Modificaciones en infraestructura física',
    ejemplos: [
      'Remodelación de áreas',
      'Construcción de nuevas instalaciones',
      'Cambio de ubicación de procesos',
      'Modificación de rutas de evacuación'
    ],
    aspectosEvaluar: [
      'Rutas de evacuación',
      'Ubicación de equipos de emergencia',
      'Señalización',
      'Condiciones de ventilación e iluminación'
    ],
    controlesRecomendados: [
      'Actualizar planos de evacuación',
      'Verificar señalización',
      'Revisar ubicación de extintores',
      'Socializar cambios con trabajadores'
    ]
  },
  {
    codigo: 'CAM-MAT',
    nombre: 'Cambio en Materias Primas o Insumos',
    descripcion: 'Introducción de nuevos materiales o sustancias',
    ejemplos: [
      'Nuevo producto químico',
      'Cambio de proveedor de materiales',
      'Sustitución de sustancias',
      'Nuevos materiales de empaque'
    ],
    aspectosEvaluar: [
      'Toxicidad y peligrosidad',
      'Compatibilidad con otros productos',
      'Requisitos de almacenamiento',
      'EPP necesarios'
    ],
    controlesRecomendados: [
      'Obtener hojas de seguridad (SDS)',
      'Capacitar en manejo seguro',
      'Verificar almacenamiento',
      'Actualizar matriz de compatibilidad química'
    ]
  },
  {
    codigo: 'CAM-ORG',
    nombre: 'Cambio Organizacional',
    descripcion: 'Modificaciones en estructura organizacional',
    ejemplos: [
      'Reestructuración de áreas',
      'Cambio de funciones',
      'Fusión o adquisición',
      'Cambio de liderazgo SST'
    ],
    aspectosEvaluar: [
      'Roles y responsabilidades SST',
      'Canales de comunicación',
      'Supervisión de actividades',
      'Impacto en carga de trabajo'
    ],
    controlesRecomendados: [
      'Actualizar matriz de responsabilidades',
      'Comunicar cambios a todo el personal',
      'Verificar continuidad del SG-SST',
      'Evaluar riesgo psicosocial'
    ]
  },
  {
    codigo: 'CAM-MET',
    nombre: 'Cambio en Métodos de Trabajo',
    descripcion: 'Modificaciones en procedimientos o instrucciones',
    ejemplos: [
      'Nuevo procedimiento operativo',
      'Cambio en instructivo de trabajo',
      'Modificación de permisos de trabajo',
      'Nuevo protocolo de seguridad'
    ],
    aspectosEvaluar: [
      'Adecuación del nuevo método',
      'Comprensión por trabajadores',
      'Tiempo de adaptación',
      'Impacto en productividad segura'
    ],
    controlesRecomendados: [
      'Capacitar en nuevos procedimientos',
      'Realizar prueba piloto',
      'Verificar cumplimiento',
      'Documentar y difundir cambios'
    ]
  },
  {
    codigo: 'CAM-NOR',
    nombre: 'Cambio Normativo',
    descripcion: 'Nuevas leyes, decretos o resoluciones aplicables',
    ejemplos: [
      'Nueva resolución de MinTrabajo',
      'Actualización de norma técnica',
      'Cambio en requisitos legales',
      'Nueva guía técnica'
    ],
    aspectosEvaluar: [
      'Aplicabilidad a la empresa',
      'Plazo de implementación',
      'Recursos necesarios',
      'Brechas de cumplimiento'
    ],
    controlesRecomendados: [
      'Actualizar matriz legal',
      'Identificar brechas',
      'Elaborar plan de cumplimiento',
      'Capacitar según sea necesario'
    ]
  }
];

// =====================================================
// CATÁLOGO DE CRITERIOS EVALUACIÓN PROVEEDORES
// =====================================================

export interface CriterioEvaluacion {
  codigo: string;
  criterio: string;
  descripcion: string;
  peso: number;
  indicadores: string[];
  calificacionMinima: number;
}

export const CRITERIOS_EVALUACION_PROVEEDORES: CriterioEvaluacion[] = [
  {
    codigo: 'CRIT-AFS',
    criterio: 'Afiliación a Seguridad Social',
    descripcion: 'Verificación de afiliación de trabajadores a EPS, ARL y AFP',
    peso: 25,
    indicadores: [
      '100% trabajadores afiliados a EPS',
      '100% trabajadores afiliados a ARL',
      '100% trabajadores afiliados a AFP',
      'Paz y salvo de aportes parafiscales'
    ],
    calificacionMinima: 100
  },
  {
    codigo: 'CRIT-DOC',
    criterio: 'Documentación SST',
    descripcion: 'Existencia de documentos básicos del SG-SST',
    peso: 20,
    indicadores: [
      'Política de SST vigente',
      'Matriz de peligros y riesgos',
      'Plan de trabajo anual',
      'Procedimientos de trabajo seguro'
    ],
    calificacionMinima: 80
  },
  {
    codigo: 'CRIT-CAP',
    criterio: 'Capacitación y Competencias',
    descripcion: 'Formación del personal en SST',
    peso: 20,
    indicadores: [
      'Inducción en SST realizada',
      'Capacitaciones específicas del cargo',
      'Certificaciones requeridas (alturas, etc.)',
      'Evaluaciones de conocimiento'
    ],
    calificacionMinima: 80
  },
  {
    codigo: 'CRIT-EPP',
    criterio: 'Elementos de Protección Personal',
    descripcion: 'Dotación y uso de EPP',
    peso: 15,
    indicadores: [
      'Dotación completa según riesgos',
      'EPP en buen estado',
      'Uso correcto de EPP',
      'Registros de entrega'
    ],
    calificacionMinima: 100
  },
  {
    codigo: 'CRIT-ACC',
    criterio: 'Historial de Accidentalidad',
    descripcion: 'Indicadores de accidentalidad del proveedor',
    peso: 10,
    indicadores: [
      'Índice de frecuencia de AT',
      'Índice de severidad de AT',
      'Investigación de accidentes',
      'Planes de acción implementados'
    ],
    calificacionMinima: 70
  },
  {
    codigo: 'CRIT-CUM',
    criterio: 'Cumplimiento de Requisitos',
    descripcion: 'Cumplimiento de requisitos contractuales SST',
    peso: 10,
    indicadores: [
      'Cumplimiento de procedimientos',
      'Reportes oportunos',
      'Asistencia a reuniones SST',
      'Respuesta a hallazgos de inspecciones'
    ],
    calificacionMinima: 80
  }
];

// =====================================================
// CATÁLOGO DE TIPOS DE COMUNICACIÓN SST
// =====================================================

export interface TipoComunicacion {
  codigo: string;
  tipo: 'interna' | 'externa';
  nombre: string;
  descripcion: string;
  canalesSugeridos: string[];
  destinatarios: string[];
  frecuenciaSugerida: string;
}

export const TIPOS_COMUNICACION_SST: TipoComunicacion[] = [
  {
    codigo: 'COM-POL',
    tipo: 'interna',
    nombre: 'Divulgación de Política SST',
    descripcion: 'Comunicación de la política de SST a todos los niveles',
    canalesSugeridos: ['Carteleras', 'Correo electrónico', 'Inducción', 'Intranet'],
    destinatarios: ['Todos los trabajadores', 'Contratistas', 'Visitantes'],
    frecuenciaSugerida: 'Al ingreso y anualmente'
  },
  {
    codigo: 'COM-PEL',
    tipo: 'interna',
    nombre: 'Comunicación de Peligros y Riesgos',
    descripcion: 'Información sobre peligros identificados y medidas de control',
    canalesSugeridos: ['Señalización', 'Capacitaciones', 'Fichas de seguridad', 'Charlas de 5 minutos'],
    destinatarios: ['Trabajadores expuestos', 'Supervisores'],
    frecuenciaSugerida: 'Continua / Cuando se identifiquen nuevos peligros'
  },
  {
    codigo: 'COM-ACC',
    tipo: 'interna',
    nombre: 'Reporte de Accidentes e Incidentes',
    descripcion: 'Canal para reportar eventos de SST',
    canalesSugeridos: ['Formato de reporte', 'Línea telefónica', 'Correo electrónico', 'App móvil'],
    destinatarios: ['Responsable SST', 'Jefe inmediato', 'COPASST'],
    frecuenciaSugerida: 'Inmediata'
  },
  {
    codigo: 'COM-EME',
    tipo: 'interna',
    nombre: 'Comunicación de Emergencias',
    descripcion: 'Activación y coordinación en emergencias',
    canalesSugeridos: ['Alarma', 'Altavoces', 'Radio', 'Cadena telefónica'],
    destinatarios: ['Todos los trabajadores', 'Brigadistas', 'Coordinador de emergencias'],
    frecuenciaSugerida: 'Cuando ocurra emergencia'
  },
  {
    codigo: 'COM-CAP',
    tipo: 'interna',
    nombre: 'Convocatoria a Capacitaciones',
    descripcion: 'Invitación a actividades de formación en SST',
    canalesSugeridos: ['Correo electrónico', 'Carteleras', 'Comunicado interno'],
    destinatarios: ['Personal convocado', 'Jefes de área'],
    frecuenciaSugerida: 'Según cronograma de capacitación'
  },
  {
    codigo: 'COM-IND',
    tipo: 'interna',
    nombre: 'Comunicación de Indicadores SST',
    descripcion: 'Difusión de resultados de gestión SST',
    canalesSugeridos: ['Carteleras', 'Reuniones', 'Boletines', 'Intranet'],
    destinatarios: ['Alta dirección', 'COPASST', 'Todos los trabajadores'],
    frecuenciaSugerida: 'Mensual / Trimestral'
  },
  {
    codigo: 'COM-ARL',
    tipo: 'externa',
    nombre: 'Comunicación con ARL',
    descripcion: 'Reportes y solicitudes a la Administradora de Riesgos Laborales',
    canalesSugeridos: ['FURAT', 'Correo electrónico', 'Plataforma ARL', 'Línea de atención'],
    destinatarios: ['ARL'],
    frecuenciaSugerida: 'Según evento o necesidad'
  },
  {
    codigo: 'COM-ENT',
    tipo: 'externa',
    nombre: 'Comunicación con Entes de Control',
    descripcion: 'Reportes a Ministerio de Trabajo, Secretaría de Salud, etc.',
    canalesSugeridos: ['Oficios', 'Plataformas oficiales', 'Correo certificado'],
    destinatarios: ['MinTrabajo', 'Secretaría de Salud', 'ARL'],
    frecuenciaSugerida: 'Según requerimiento legal'
  },
  {
    codigo: 'COM-PRO',
    tipo: 'externa',
    nombre: 'Comunicación con Proveedores y Contratistas',
    descripcion: 'Requisitos SST para terceros',
    canalesSugeridos: ['Contrato', 'Reuniones de coordinación', 'Correo electrónico'],
    destinatarios: ['Proveedores', 'Contratistas'],
    frecuenciaSugerida: 'Al inicio del contrato y periódicamente'
  }
];

// =====================================================
// CATÁLOGO DE ARL EN COLOMBIA
// =====================================================

export const ARL_COLOMBIA = [
  { codigo: 'SURA', nombre: 'ARL SURA - Seguros de Riesgos Laborales', nit: '800088702-2' },
  { codigo: 'POSITIVA', nombre: 'Positiva Compañía de Seguros S.A.', nit: '900422614-0' },
  { codigo: 'COLMENA', nombre: 'Colmena Seguros S.A. (Berkley International)', nit: '860058565-5' },
  { codigo: 'AXA', nombre: 'AXA Colpatria S.A.', nit: '860034594-7' },
  { codigo: 'BOLIVAR', nombre: 'Seguros Bolívar S.A.', nit: '860040087-4' },
  { codigo: 'LIBERTY', nombre: 'Liberty Seguros S.A.', nit: '860076794-5' },
  { codigo: 'EQUIDAD', nombre: 'La Equidad Seguros O.C.', nit: '860007738-6' },
  { codigo: 'MAPFRE', nombre: 'Mapfre Seguros Generales de Colombia S.A.', nit: '900157914-2' },
];

// =====================================================
// CATÁLOGO DE EPS EN COLOMBIA
// =====================================================

export const EPS_COLOMBIA = [
  { codigo: 'SURA', nombre: 'EPS Sura', nit: '800088702-2' },
  { codigo: 'SANITAS', nombre: 'EPS Sanitas', nit: '800251440-6' },
  { codigo: 'NUEVAEPS', nombre: 'Nueva EPS', nit: '900156264-2' },
  { codigo: 'COMPENSAR', nombre: 'Compensar EPS', nit: '860066942-7' },
  { codigo: 'FAMISANAR', nombre: 'Famisanar EPS', nit: '830003564-7' },
  { codigo: 'COOMEVA', nombre: 'Coomeva EPS', nit: '805000427-1' },
  { codigo: 'SALUDTOTAL', nombre: 'Salud Total EPS', nit: '800130907-4' },
  { codigo: 'MEDIMAS', nombre: 'Medimás EPS', nit: '901097473-5' },
  { codigo: 'ALIANSALUD', nombre: 'Aliansalud EPS', nit: '830113831-0' },
  { codigo: 'COOSALUD', nombre: 'Coosalud EPS', nit: '900226715-5' },
  { codigo: 'SAVIA', nombre: 'Savia Salud EPS', nit: '900604350-0' },
  { codigo: 'MUTUAL', nombre: 'Mutual Ser EPS', nit: '806008394-6' }
];

// =====================================================
// CATÁLOGO DE AFP EN COLOMBIA
// =====================================================

export const AFP_COLOMBIA = [
  { codigo: 'PORVENIR', nombre: 'Porvenir S.A.', nit: '800144331-3' },
  { codigo: 'PROTECCION', nombre: 'Protección S.A.', nit: '800138188-0' },
  { codigo: 'COLFONDOS', nombre: 'Colfondos S.A.', nit: '800198644-7' },
  { codigo: 'OLDMUTUAL', nombre: 'Old Mutual AFP', nit: '860531315-3' },
  { codigo: 'COLPENSIONES', nombre: 'Colpensiones', nit: '900336004-7' }
];

// =====================================================
// CATÁLOGO DE CAJAS DE COMPENSACIÓN
// =====================================================

export const CCF_COLOMBIA = [
  { codigo: 'COMPENSAR', nombre: 'Compensar', nit: '860066942-7' },
  { codigo: 'CAFAM', nombre: 'Caja de Compensación Familiar CAFAM', nit: '860013570-3' },
  { codigo: 'COLSUBSIDIO', nombre: 'Colsubsidio', nit: '860007336-1' },
  { codigo: 'COMFAMA', nombre: 'Comfama', nit: '890900842-6' },
  { codigo: 'COMFANDI', nombre: 'Comfandi', nit: '890303093-8' },
  { codigo: 'COMFENALCO', nombre: 'Comfenalco', nit: '890900343-5' },
  { codigo: 'COMFAMILIAR', nombre: 'Comfamiliar', nit: '891800213-1' }
];

// =====================================================
// CATÁLOGO DE AGREMIACIONES AUTORIZADAS POR MINSALUD
// Para trabajadores independientes - Verificación Estándar 1.1.4
// =====================================================

export interface AgremiacionAutorizada {
  codigo: string;
  nombre: string;
  nit: string;
  tipoActividad: string;
  estado: 'activa' | 'inactiva';
}

export const AGREMIACIONES_AUTORIZADAS_MINSALUD: AgremiacionAutorizada[] = [
  { codigo: 'ACOPI', nombre: 'Asociación Colombiana de la Micro, Pequeña y Mediana Empresa - ACOPI', nit: '860025639-5', tipoActividad: 'Empresarial', estado: 'activa' },
  { codigo: 'ASOHOFRUCOL', nombre: 'Asociación Hortifrutícola de Colombia', nit: '800187648-2', tipoActividad: 'Agrícola', estado: 'activa' },
  { codigo: 'FEDEGAN', nombre: 'Federación Colombiana de Ganaderos', nit: '860034313-4', tipoActividad: 'Pecuario', estado: 'activa' },
  { codigo: 'FENALCO', nombre: 'Federación Nacional de Comerciantes', nit: '860001022-9', tipoActividad: 'Comercio', estado: 'activa' },
  { codigo: 'ANDI', nombre: 'Asociación Nacional de Empresarios de Colombia', nit: '860002464-3', tipoActividad: 'Industrial', estado: 'activa' },
  { codigo: 'CAMACOL', nombre: 'Cámara Colombiana de la Construcción', nit: '860007659-8', tipoActividad: 'Construcción', estado: 'activa' },
  { codigo: 'SAC', nombre: 'Sociedad de Agricultores de Colombia', nit: '860005224-4', tipoActividad: 'Agrícola', estado: 'activa' },
  { codigo: 'FECODE', nombre: 'Federación Colombiana de Trabajadores de la Educación', nit: '860011802-3', tipoActividad: 'Educación', estado: 'activa' },
  { codigo: 'ACIEM', nombre: 'Asociación Colombiana de Ingenieros', nit: '860005289-1', tipoActividad: 'Ingeniería', estado: 'activa' },
  { codigo: 'ACODIN', nombre: 'Asociación Colombiana de Diseñadores', nit: '800146538-7', tipoActividad: 'Diseño', estado: 'activa' },
  { codigo: 'ACOLFA', nombre: 'Asociación Colombiana de Facultades de Administración', nit: '860041029-0', tipoActividad: 'Académico', estado: 'activa' },
  { codigo: 'COTELCO', nombre: 'Asociación Hotelera y Turística de Colombia', nit: '860002538-4', tipoActividad: 'Turismo', estado: 'activa' },
  { codigo: 'ASOBANCARIA', nombre: 'Asociación Bancaria y de Entidades Financieras de Colombia', nit: '860007590-3', tipoActividad: 'Financiero', estado: 'activa' },
  { codigo: 'ACOSET', nombre: 'Asociación Colombiana de Empresas de Servicios Temporales', nit: '830011336-5', tipoActividad: 'Servicios Temporales', estado: 'activa' },
  { codigo: 'ANALDEX', nombre: 'Asociación Nacional de Comercio Exterior', nit: '860043188-3', tipoActividad: 'Comercio Exterior', estado: 'activa' },
  { codigo: 'ACODRES', nombre: 'Asociación Colombiana de la Industria Gastronómica', nit: '860051196-3', tipoActividad: 'Gastronomía', estado: 'activa' },
  { codigo: 'OTROS', nombre: 'Otra agremiación autorizada', nit: '', tipoActividad: 'Varios', estado: 'activa' },
];

export function getAgremiacionByCodigo(codigo: string): AgremiacionAutorizada | undefined {
  return AGREMIACIONES_AUTORIZADAS_MINSALUD.find(a => a.codigo === codigo);
}

export function getAgremiacionesActivas(): AgremiacionAutorizada[] {
  return AGREMIACIONES_AUTORIZADAS_MINSALUD.filter(a => a.estado === 'activa');
}

// =====================================================
// HELPERS
// =====================================================

export function getCapacitacionByCodigo(codigo: string): CapacitacionPredefinida | undefined {
  return CAPACITACIONES_OBLIGATORIAS.find(c => c.codigo === codigo);
}

export function getCapacitacionesObligatorias(): CapacitacionPredefinida[] {
  return CAPACITACIONES_OBLIGATORIAS.filter(c => c.obligatoria);
}

export function getCategoriasDocumentosByCiclo(ciclo: 'planear' | 'hacer' | 'verificar' | 'actuar'): CategoriaDocumento[] {
  return CATEGORIAS_DOCUMENTOS.filter(c => c.cicloPHVA === ciclo);
}

export function getTipoCambioByCodigo(codigo: string): TipoCambio | undefined {
  return TIPOS_CAMBIO.find(t => t.codigo === codigo);
}

export function getCriteriosEvaluacionProveedores(): CriterioEvaluacion[] {
  return CRITERIOS_EVALUACION_PROVEEDORES;
}

export function getTiposComunicacionByTipo(tipo: 'interna' | 'externa'): TipoComunicacion[] {
  return TIPOS_COMUNICACION_SST.filter(t => t.tipo === tipo);
}

// =====================================================
// CATÁLOGO DE ACTIVIDADES DE ALTO RIESGO - DECRETO 2090/2003
// Estándar 1.1.5 - Identificación de Trabajadores de Alto Riesgo
// y Cotización de Pensión Especial
// =====================================================

export interface ActividadAltoRiesgo {
  value: string;
  label: string;
}

export const ACTIVIDADES_ALTO_RIESGO_DEC_2090: ActividadAltoRiesgo[] = [
  { value: 'mineria_subterranea', label: 'Trabajos en minería que impliquen prestar servicio en socavones o subterráneos' },
  { value: 'altas_temperaturas', label: 'Trabajos que impliquen exposición a altas temperaturas por encima de los valores límites permisibles' },
  { value: 'radiaciones_ionizantes', label: 'Trabajos con exposición a radiaciones ionizantes' },
  { value: 'sustancias_cancerigenas', label: 'Trabajos con exposición a sustancias comprobadamente cancerígenas' },
  { value: 'bomberos', label: 'Actividades de la Unidad Administrativa Especial del Cuerpo Oficial de Bomberos' },
  { value: 'vigilancia_seguridad', label: 'Actividades de vigilancia y seguridad privada que impliquen uso de armas' }
];

export function getActividadAltoRiesgoByValue(value: string): ActividadAltoRiesgo | undefined {
  return ACTIVIDADES_ALTO_RIESGO_DEC_2090.find(a => a.value === value);
}
