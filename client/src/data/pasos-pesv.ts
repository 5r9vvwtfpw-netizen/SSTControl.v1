/**
 * Pasos PESV - Plan Estratégico de Seguridad Vial
 * Resolución 40595 de 2022 - Ministerio de Transporte
 * 
 * 24 pasos organizados en ciclo PHVA:
 * - Planear: 8 pasos
 * - Hacer: 11 pasos
 * - Verificar: 3 pasos
 * - Actuar: 2 pasos
 */

// ADD-ONLY: Interfaz para URLs de módulos SST relacionados
export interface ModuloSstUrl {
  nombre: string;
  url: string;
  icono?: string; // Nombre del icono de Lucide
}

export interface PasoPesvData {
  codigo: string;
  numero: number;
  nombre: string;
  descripcion: string;
  fase: 'planear' | 'hacer' | 'verificar' | 'actuar';
  aplicaBasico: boolean;
  aplicaEstandar: boolean;
  aplicaAvanzado: boolean;
  puntajeMaximo: number;
  criteriosVerificacion: string[];
  evidenciasRequeridas: string[];
  modulosSstRelacionados: string[];
  // ADD-ONLY: Navegación a módulos PESV desde la evaluación
  moduloPesvUrl?: string;
  moduloPesvNombre?: string;
  // ADD-ONLY: Navegación bidireccional a módulos SST
  modulosSstUrls?: ModuloSstUrl[];
  // ADD-ONLY: Smart Form Auto-Fill Data (Resolución 40595/2022)
  modoVerificacionSugerido?: string[];
  hallazgoSugeridoNoCumple?: string;
  observacionesCumple?: string;
  observacionesNoCumple?: string;
  justificacionNaSugerida?: string;
  fundamentoNormativo?: string;
}

export const PASOS_PESV: PasoPesvData[] = [
  // ==================== PLANEAR (8 pasos) ====================
  {
    codigo: 'P01',
    numero: 1,
    nombre: 'Conformación del equipo de trabajo',
    descripcion: 'Designar un equipo de trabajo para diseñar, implementar y realizar seguimiento al PESV.',
    fase: 'planear',
    aplicaBasico: true,
    aplicaEstandar: true,
    aplicaAvanzado: true,
    puntajeMaximo: 4,
    criteriosVerificacion: [
      'Acto administrativo de conformación del equipo',
      'Funciones y responsabilidades definidas',
      'Cronograma de reuniones'
    ],
    evidenciasRequeridas: [
      'Acta de conformación del equipo PESV',
      'Documento con funciones y responsabilidades',
      'Actas de reuniones'
    ],
    modulosSstRelacionados: ['copasst', 'politicas'],
    moduloPesvUrl: '/pesv/comite',
    moduloPesvNombre: 'Comité PESV',
    modoVerificacionSugerido: ['Revisión documental del acto administrativo', 'Verificación de actas de reunión del equipo PESV', 'Entrevista con miembros del equipo'],
    hallazgoSugeridoNoCumple: 'No se evidencia la conformación formal del equipo de trabajo PESV mediante acto administrativo. No se definen funciones y responsabilidades de los integrantes del equipo según Art. 5 de la Resolución 40595/2022.',
    observacionesCumple: 'Se verifica acto administrativo de conformación del equipo de trabajo PESV con funciones y responsabilidades definidas. Se evidencian actas de reuniones periódicas conforme a la Resolución 40595/2022.',
    observacionesNoCumple: 'Se requiere la conformación formal del equipo de trabajo PESV con designación mediante acto administrativo, definición de funciones y cronograma de reuniones.',
    justificacionNaSugerida: 'No aplica en caso de empresa unipersonal donde el representante legal asume todas las funciones del PESV.',
    fundamentoNormativo: 'Resolución 40595/2022, Art. 5 - Conformación del equipo de trabajo del PESV'
  },
  {
    codigo: 'P02',
    numero: 2,
    nombre: 'Política de seguridad vial',
    descripcion: 'Definir la política de seguridad vial de la organización, alineada con la política de SST.',
    fase: 'planear',
    aplicaBasico: true,
    aplicaEstandar: true,
    aplicaAvanzado: true,
    puntajeMaximo: 4,
    criteriosVerificacion: [
      'Política documentada y firmada por la alta dirección',
      'Divulgación a todos los trabajadores',
      'Articulación con política SST'
    ],
    evidenciasRequeridas: [
      'Documento de política de seguridad vial',
      'Registros de divulgación',
      'Firma de la alta dirección'
    ],
    modulosSstRelacionados: ['politicas'],
    moduloPesvUrl: '/pesv/liderazgo',
    moduloPesvNombre: 'Liderazgo y Compromiso',
    modoVerificacionSugerido: ['Revisión del documento de política de seguridad vial', 'Verificación de firma de la alta dirección', 'Revisión de registros de divulgación'],
    hallazgoSugeridoNoCumple: 'No se evidencia política de seguridad vial documentada, firmada por la alta dirección y divulgada a todos los trabajadores. No cumple con Art. 6 de la Resolución 40595/2022.',
    observacionesCumple: 'Se verifica política de seguridad vial documentada, firmada por la alta dirección, articulada con la política SST y divulgada a todos los trabajadores conforme a la Resolución 40595/2022.',
    observacionesNoCumple: 'Se requiere documentar, aprobar por alta dirección y divulgar la política de seguridad vial articulada con la política SST.',
    justificacionNaSugerida: 'No aplica para organizaciones sin actividad de desplazamiento vial.',
    fundamentoNormativo: 'Resolución 40595/2022, Art. 6 - Política de seguridad vial'
  },
  {
    codigo: 'P03',
    numero: 3,
    nombre: 'Diagnóstico de la organización',
    descripcion: 'Realizar diagnóstico inicial que incluya caracterización de la empresa, flota vehicular y conductores.',
    fase: 'planear',
    aplicaBasico: true,
    aplicaEstandar: true,
    aplicaAvanzado: true,
    puntajeMaximo: 4,
    criteriosVerificacion: [
      'Caracterización de la empresa (misión, actividad económica)',
      'Inventario de vehículos actualizado',
      'Base de datos de conductores'
    ],
    evidenciasRequeridas: [
      'Documento de caracterización',
      'Matriz de vehículos',
      'Base de datos de conductores'
    ],
    modulosSstRelacionados: ['trabajadores', 'perfiles-cargo'],
    moduloPesvUrl: '/pesv/contexto-organizacional',
    moduloPesvNombre: 'Contexto Organizacional',
    modoVerificacionSugerido: ['Revisión del documento de caracterización', 'Verificación de inventario de vehículos', 'Revisión de base de datos de conductores'],
    hallazgoSugeridoNoCumple: 'No se evidencia diagnóstico inicial que incluya la caracterización de la empresa, flota vehicular y base de datos de conductores según Art. 7 de la Resolución 40595/2022.',
    observacionesCumple: 'Se verifica diagnóstico organizacional completo con caracterización de la empresa, inventario de vehículos actualizado y base de datos de conductores conforme a la Resolución 40595/2022.',
    observacionesNoCumple: 'Se requiere elaborar el diagnóstico organizacional incluyendo caracterización, inventario vehicular y base de datos de conductores.',
    justificacionNaSugerida: 'No aplica para organizaciones que no operan vehículos propios ni contratados.',
    fundamentoNormativo: 'Resolución 40595/2022, Art. 7 - Diagnóstico'
  },
  {
    codigo: 'P04',
    numero: 4,
    nombre: 'Caracterización y evaluación del riesgo vial',
    descripcion: 'Identificar y evaluar los riesgos viales de la organización en las cinco líneas de acción.',
    fase: 'planear',
    aplicaBasico: true,
    aplicaEstandar: true,
    aplicaAvanzado: true,
    puntajeMaximo: 5,
    criteriosVerificacion: [
      'Matriz de identificación de peligros viales',
      'Evaluación de riesgos por línea de acción',
      'Priorización de riesgos'
    ],
    evidenciasRequeridas: [
      'Matriz IPERC vial',
      'Documento de evaluación de riesgos',
      'Plan de intervención priorizado'
    ],
    modulosSstRelacionados: ['iperc', 'matriz-peligros'],
    moduloPesvUrl: '/pesv/matriz-riesgos',
    moduloPesvNombre: 'Matriz de Riesgos Viales',
    modoVerificacionSugerido: ['Revisión de la matriz de riesgos viales', 'Verificación de evaluación por línea de acción', 'Inspección de controles implementados'],
    hallazgoSugeridoNoCumple: 'No se evidencia identificación y evaluación de riesgos viales en las cinco líneas de acción (factor humano, vehículos, infraestructura, factores organizacionales, atención a víctimas) según Art. 8 de la Resolución 40595/2022.',
    observacionesCumple: 'Se verifica matriz de identificación de peligros y evaluación de riesgos viales en las cinco líneas de acción con priorización y plan de intervención conforme a la Resolución 40595/2022.',
    observacionesNoCumple: 'Se requiere identificar y evaluar riesgos viales en las cinco líneas de acción con priorización e intervención.',
    justificacionNaSugerida: 'No aplica para organizaciones sin exposición a riesgo vial.',
    fundamentoNormativo: 'Resolución 40595/2022, Art. 8 - Caracterización, evaluación y control del riesgo'
  },
  {
    codigo: 'P05',
    numero: 5,
    nombre: 'Objetivos y metas del PESV',
    descripcion: 'Definir objetivos medibles y metas de seguridad vial para el período de vigencia del plan.',
    fase: 'planear',
    aplicaBasico: true,
    aplicaEstandar: true,
    aplicaAvanzado: true,
    puntajeMaximo: 4,
    criteriosVerificacion: [
      'Objetivos SMART definidos',
      'Metas cuantificables',
      'Indicadores de seguimiento'
    ],
    evidenciasRequeridas: [
      'Documento de objetivos y metas',
      'Tablero de indicadores',
      'Línea base establecida'
    ],
    modulosSstRelacionados: ['indicadores', 'objetivos-sst'],
    moduloPesvUrl: '/pesv/indicadores',
    moduloPesvNombre: 'Indicadores PESV',
    modoVerificacionSugerido: ['Revisión de documento de objetivos y metas', 'Verificación de indicadores definidos', 'Revisión de línea base'],
    hallazgoSugeridoNoCumple: 'No se evidencian objetivos medibles tipo SMART ni metas cuantificables de seguridad vial con indicadores de seguimiento según Art. 9 de la Resolución 40595/2022.',
    observacionesCumple: 'Se verifican objetivos SMART definidos con metas cuantificables, indicadores de seguimiento y línea base establecida conforme a la Resolución 40595/2022.',
    observacionesNoCumple: 'Se requiere definir objetivos SMART con metas cuantificables e indicadores de seguimiento.',
    justificacionNaSugerida: 'No aplica para organizaciones sin plan estratégico de seguridad vial vigente.',
    fundamentoNormativo: 'Resolución 40595/2022, Art. 9 - Objetivos y metas del PESV'
  },
  {
    codigo: 'P06',
    numero: 6,
    nombre: 'Programas y planes de acción',
    descripcion: 'Diseñar programas y planes de acción para cada línea de acción del PESV.',
    fase: 'planear',
    aplicaBasico: true,
    aplicaEstandar: true,
    aplicaAvanzado: true,
    puntajeMaximo: 5,
    criteriosVerificacion: [
      'Programa para cada línea de acción',
      'Cronograma de actividades',
      'Presupuesto asignado'
    ],
    evidenciasRequeridas: [
      'Programas documentados (5 líneas de acción)',
      'Cronograma anual PESV',
      'Presupuesto PESV'
    ],
    modulosSstRelacionados: ['programas-sst', 'cronogramas'],
    moduloPesvUrl: '/pesv/factores-desempeno',
    moduloPesvNombre: 'Factores de Desempeño',
    modoVerificacionSugerido: ['Revisión de programas por línea de acción', 'Verificación de cronograma anual', 'Revisión de asignación presupuestal'],
    hallazgoSugeridoNoCumple: 'No se evidencian programas y planes de acción para las cinco líneas de acción del PESV con cronograma y presupuesto según Art. 10 de la Resolución 40595/2022.',
    observacionesCumple: 'Se verifican programas documentados para cada línea de acción con cronograma anual y presupuesto asignado conforme a la Resolución 40595/2022.',
    observacionesNoCumple: 'Se requiere diseñar programas y planes de acción para cada línea de acción con cronograma y presupuesto.',
    justificacionNaSugerida: 'No aplica para organizaciones en fase inicial de implementación del PESV.',
    fundamentoNormativo: 'Resolución 40595/2022, Art. 10 - Planes de acción de seguridad vial'
  },
  {
    codigo: 'P07',
    numero: 7,
    nombre: 'Roles y responsabilidades',
    descripcion: 'Definir roles y responsabilidades de todos los actores involucrados en la seguridad vial.',
    fase: 'planear',
    aplicaBasico: true,
    aplicaEstandar: true,
    aplicaAvanzado: true,
    puntajeMaximo: 4,
    criteriosVerificacion: [
      'Documento de roles y responsabilidades',
      'Inclusión en perfiles de cargo',
      'Comunicación a involucrados'
    ],
    evidenciasRequeridas: [
      'Matriz de responsabilidades PESV',
      'Perfiles de cargo actualizados',
      'Actas de divulgación'
    ],
    modulosSstRelacionados: ['perfiles-cargo', 'responsabilidades-sst'],
    moduloPesvUrl: '/pesv/liderazgo',
    moduloPesvNombre: 'Liderazgo y Compromiso',
    modoVerificacionSugerido: ['Revisión de documento de roles y responsabilidades', 'Verificación de inclusión en perfiles de cargo', 'Entrevista a personal con responsabilidades asignadas'],
    hallazgoSugeridoNoCumple: 'No se evidencia documento de roles y responsabilidades de los actores del PESV ni inclusión en perfiles de cargo según Art. 11 de la Resolución 40595/2022.',
    observacionesCumple: 'Se verifican roles y responsabilidades documentados, incluidos en perfiles de cargo y comunicados a los involucrados conforme a la Resolución 40595/2022.',
    observacionesNoCumple: 'Se requiere documentar roles y responsabilidades e incluirlos en los perfiles de cargo.',
    justificacionNaSugerida: 'No aplica para empresas unipersonales donde una sola persona asume todas las funciones.',
    fundamentoNormativo: 'Resolución 40595/2022, Art. 11 - Funciones y responsabilidades'
  },
  {
    codigo: 'P08',
    numero: 8,
    nombre: 'Recursos para el PESV',
    descripcion: 'Asignar recursos humanos, técnicos, físicos y financieros para la implementación del PESV.',
    fase: 'planear',
    aplicaBasico: true,
    aplicaEstandar: true,
    aplicaAvanzado: true,
    puntajeMaximo: 4,
    criteriosVerificacion: [
      'Presupuesto anual aprobado',
      'Recursos humanos asignados',
      'Recursos técnicos disponibles'
    ],
    evidenciasRequeridas: [
      'Documento de asignación presupuestal',
      'Acta de aprobación de recursos',
      'Inventario de recursos disponibles'
    ],
    modulosSstRelacionados: ['presupuesto-sst'],
    moduloPesvUrl: '/pesv/liderazgo',
    moduloPesvNombre: 'Liderazgo y Compromiso',
    modoVerificacionSugerido: ['Revisión de presupuesto aprobado', 'Verificación de recursos humanos asignados', 'Revisión de recursos técnicos disponibles'],
    hallazgoSugeridoNoCumple: 'No se evidencia asignación de recursos humanos, técnicos, físicos y financieros para la implementación del PESV según Art. 12 de la Resolución 40595/2022.',
    observacionesCumple: 'Se verifica presupuesto anual aprobado, recursos humanos, técnicos y físicos asignados para la implementación del PESV conforme a la Resolución 40595/2022.',
    observacionesNoCumple: 'Se requiere asignar y documentar recursos (humanos, técnicos, físicos y financieros) para el PESV.',
    justificacionNaSugerida: 'No aplica para organizaciones sin PESV vigente.',
    fundamentoNormativo: 'Resolución 40595/2022, Art. 12 - Recursos'
  },

  // ==================== HACER (11 pasos) ====================
  {
    codigo: 'H01',
    numero: 9,
    nombre: 'Fortalecimiento institucional - Factor Humano',
    descripcion: 'Implementar acciones para fortalecer el comportamiento seguro de conductores y demás actores viales.',
    fase: 'hacer',
    aplicaBasico: true,
    aplicaEstandar: true,
    aplicaAvanzado: true,
    puntajeMaximo: 5,
    criteriosVerificacion: [
      'Proceso de selección de conductores',
      'Evaluación de aptitud psicofísica',
      'Control de documentación de conductores'
    ],
    evidenciasRequeridas: [
      'Procedimiento de selección de conductores',
      'Certificados de aptitud',
      'Matriz de documentos de conductores'
    ],
    modulosSstRelacionados: ['trabajadores', 'examenes-medicos'],
    modulosSstUrls: [
      { nombre: 'Gestión de Trabajadores', url: '/trabajadores', icono: 'Users' },
      { nombre: 'Exámenes Médicos', url: '/examenes-medicos', icono: 'Stethoscope' }
    ],
    modoVerificacionSugerido: ['Revisión de procedimiento de selección de conductores', 'Verificación de certificados de aptitud psicofísica', 'Revisión de matriz de documentos'],
    hallazgoSugeridoNoCumple: 'No se evidencian acciones de fortalecimiento del comportamiento seguro de conductores y actores viales según Art. 13 de la Resolución 40595/2022.',
    observacionesCumple: 'Se verifican acciones implementadas para el fortalecimiento del factor humano incluyendo selección de conductores, evaluación psicofísica y control documental conforme a la Resolución 40595/2022.',
    observacionesNoCumple: 'Se requiere implementar proceso de selección de conductores, evaluación de aptitud y control de documentación.',
    justificacionNaSugerida: 'No aplica para organizaciones sin conductores en su nómina.',
    fundamentoNormativo: 'Resolución 40595/2022, Art. 13 - Comportamiento humano'
  },
  {
    codigo: 'H02',
    numero: 10,
    nombre: 'Capacitación en seguridad vial',
    descripcion: 'Desarrollar programa de capacitación continua en seguridad vial para todos los actores.',
    fase: 'hacer',
    aplicaBasico: true,
    aplicaEstandar: true,
    aplicaAvanzado: true,
    puntajeMaximo: 5,
    criteriosVerificacion: [
      'Plan de capacitación anual en seguridad vial',
      'Registros de asistencia',
      'Evaluaciones de conocimiento'
    ],
    evidenciasRequeridas: [
      'Cronograma de capacitaciones',
      'Listas de asistencia',
      'Evaluaciones aplicadas',
      'Material didáctico'
    ],
    modulosSstRelacionados: ['capacitaciones', 'induccion'],
    moduloPesvUrl: '/pesv/capacitaciones',
    moduloPesvNombre: 'Capacitaciones PESV',
    modoVerificacionSugerido: ['Revisión de plan de capacitación anual', 'Verificación de registros de asistencia', 'Revisión de evaluaciones de conocimiento'],
    hallazgoSugeridoNoCumple: 'No se evidencia programa de capacitación continua en seguridad vial con plan anual, registros de asistencia y evaluaciones según Art. 14 de la Resolución 40595/2022.',
    observacionesCumple: 'Se verifica programa de capacitación continua en seguridad vial con plan anual, registros de asistencia, evaluaciones de conocimiento y material didáctico conforme a la Resolución 40595/2022.',
    observacionesNoCumple: 'Se requiere desarrollar programa de capacitación en seguridad vial con plan anual y evaluaciones.',
    justificacionNaSugerida: 'No aplica para organizaciones sin personal expuesto a riesgo vial.',
    fundamentoNormativo: 'Resolución 40595/2022, Art. 14 - Capacitación en seguridad vial'
  },
  {
    codigo: 'H03',
    numero: 11,
    nombre: 'Control de documentación de conductores',
    descripcion: 'Verificar y mantener actualizada la documentación de conductores (licencias, comparendos, etc.).',
    fase: 'hacer',
    aplicaBasico: true,
    aplicaEstandar: true,
    aplicaAvanzado: true,
    puntajeMaximo: 4,
    criteriosVerificacion: [
      'Base de datos de documentos de conductores',
      'Alertas de vencimiento',
      'Verificación de comparendos'
    ],
    evidenciasRequeridas: [
      'Matriz de control de documentos',
      'Reportes de consulta SIMIT',
      'Certificados de antecedentes'
    ],
    modulosSstRelacionados: ['trabajadores'],
    modulosSstUrls: [
      { nombre: 'Gestión de Trabajadores', url: '/trabajadores', icono: 'Users' }
    ],
    modoVerificacionSugerido: ['Revisión de base de datos de documentos', 'Verificación de alertas de vencimiento', 'Consulta SIMIT de comparendos'],
    hallazgoSugeridoNoCumple: 'No se evidencia control actualizado de documentación de conductores (licencias, comparendos, antecedentes) según Art. 15 de la Resolución 40595/2022.',
    observacionesCumple: 'Se verifica base de datos actualizada con control de documentos de conductores, alertas de vencimiento y consulta periódica SIMIT conforme a la Resolución 40595/2022.',
    observacionesNoCumple: 'Se requiere implementar control de documentación de conductores con alertas de vencimiento y consulta SIMIT.',
    justificacionNaSugerida: 'No aplica para organizaciones sin conductores.',
    fundamentoNormativo: 'Resolución 40595/2022, Art. 15 - Documentación de conductores'
  },
  {
    codigo: 'H04',
    numero: 12,
    nombre: 'Gestión de vehículos seguros',
    descripcion: 'Asegurar que los vehículos cumplan con condiciones técnicas y de seguridad.',
    fase: 'hacer',
    aplicaBasico: true,
    aplicaEstandar: true,
    aplicaAvanzado: true,
    puntajeMaximo: 5,
    criteriosVerificacion: [
      'Inventario de vehículos actualizado',
      'Revisión técnico-mecánica vigente',
      'SOAT vigente'
    ],
    evidenciasRequeridas: [
      'Matriz de vehículos',
      'Certificados RTM',
      'Pólizas SOAT',
      'Tarjetas de propiedad'
    ],
    modulosSstRelacionados: ['equipos', 'inspecciones'],
    modulosSstUrls: [
      { nombre: 'Equipos y Herramientas', url: '/equipos', icono: 'Wrench' },
      { nombre: 'Inspecciones SST', url: '/inspecciones', icono: 'ClipboardCheck' }
    ],
    modoVerificacionSugerido: ['Revisión de inventario de vehículos', 'Verificación de RTM y SOAT vigentes', 'Inspección de condiciones de seguridad'],
    hallazgoSugeridoNoCumple: 'No se evidencia que los vehículos cuenten con condiciones técnicas y de seguridad adecuadas (RTM, SOAT vigentes) según Art. 16 de la Resolución 40595/2022.',
    observacionesCumple: 'Se verifica inventario de vehículos actualizado con RTM y SOAT vigentes, tarjetas de propiedad y condiciones técnicas adecuadas conforme a la Resolución 40595/2022.',
    observacionesNoCumple: 'Se requiere asegurar que todos los vehículos cumplan con RTM, SOAT y condiciones técnicas de seguridad.',
    justificacionNaSugerida: 'No aplica para organizaciones sin vehículos propios ni contratados.',
    fundamentoNormativo: 'Resolución 40595/2022, Art. 16 - Vehículos seguros'
  },
  {
    codigo: 'H05',
    numero: 13,
    nombre: 'Plan de mantenimiento de vehículos',
    descripcion: 'Implementar plan de mantenimiento preventivo y correctivo para la flota vehicular.',
    fase: 'hacer',
    aplicaBasico: true,
    aplicaEstandar: true,
    aplicaAvanzado: true,
    puntajeMaximo: 4,
    criteriosVerificacion: [
      'Plan de mantenimiento documentado',
      'Registros de mantenimiento',
      'Cronograma de intervenciones'
    ],
    evidenciasRequeridas: [
      'Plan de mantenimiento vehicular',
      'Hojas de vida de vehículos',
      'Órdenes de trabajo'
    ],
    modulosSstRelacionados: ['mantenimiento', 'equipos'],
    modulosSstUrls: [
      { nombre: 'Mantenimiento Preventivo', url: '/mantenimiento', icono: 'Settings' },
      { nombre: 'Equipos y Herramientas', url: '/equipos', icono: 'Wrench' }
    ],
    moduloPesvUrl: '/pesv/mantenimiento',
    moduloPesvNombre: 'Mantenimiento Vehicular',
    modoVerificacionSugerido: ['Revisión de plan de mantenimiento documentado', 'Verificación de hojas de vida vehiculares', 'Revisión de órdenes de trabajo'],
    hallazgoSugeridoNoCumple: 'No se evidencia plan de mantenimiento preventivo y correctivo para la flota vehicular según Art. 17 de la Resolución 40595/2022.',
    observacionesCumple: 'Se verifica plan de mantenimiento vehicular documentado con hojas de vida actualizadas y registros de intervenciones conforme a la Resolución 40595/2022.',
    observacionesNoCumple: 'Se requiere implementar plan de mantenimiento preventivo y correctivo con hojas de vida vehiculares.',
    justificacionNaSugerida: 'No aplica para organizaciones sin flota vehicular propia.',
    fundamentoNormativo: 'Resolución 40595/2022, Art. 17 - Mantenimiento y control de vehículos'
  },
  {
    codigo: 'H06',
    numero: 14,
    nombre: 'Inspecciones preoperacionales',
    descripcion: 'Realizar inspecciones diarias antes de operar los vehículos.',
    fase: 'hacer',
    aplicaBasico: true,
    aplicaEstandar: true,
    aplicaAvanzado: true,
    puntajeMaximo: 4,
    criteriosVerificacion: [
      'Formato de inspección preoperacional',
      'Registros diarios',
      'Seguimiento a hallazgos'
    ],
    evidenciasRequeridas: [
      'Formato de inspección',
      'Registros de inspección',
      'Acciones correctivas'
    ],
    modulosSstRelacionados: ['inspecciones'],
    moduloPesvUrl: '/pesv/inspecciones',
    moduloPesvNombre: 'Inspecciones Preoperacionales',
    modoVerificacionSugerido: ['Revisión de formato de inspección', 'Verificación de registros diarios', 'Revisión de seguimiento a hallazgos'],
    hallazgoSugeridoNoCumple: 'No se evidencian inspecciones preoperacionales diarias de vehículos con formato estandarizado y seguimiento a hallazgos según Art. 18 de la Resolución 40595/2022.',
    observacionesCumple: 'Se verifican inspecciones preoperacionales con formato estandarizado, registros diarios y seguimiento a hallazgos conforme a la Resolución 40595/2022.',
    observacionesNoCumple: 'Se requiere implementar inspecciones preoperacionales diarias con formato y seguimiento a hallazgos.',
    justificacionNaSugerida: 'No aplica para organizaciones sin operación vehicular.',
    fundamentoNormativo: 'Resolución 40595/2022, Art. 18 - Inspección de vehículos'
  },
  {
    codigo: 'H07',
    numero: 15,
    nombre: 'Gestión de la velocidad',
    descripcion: 'Implementar controles para la gestión de la velocidad en la operación.',
    fase: 'hacer',
    aplicaBasico: false,
    aplicaEstandar: true,
    aplicaAvanzado: true,
    puntajeMaximo: 4,
    criteriosVerificacion: [
      'Política de velocidad',
      'Mecanismos de control (GPS, limitadores)',
      'Seguimiento a infracciones'
    ],
    evidenciasRequeridas: [
      'Documento de política de velocidad',
      'Reportes de monitoreo',
      'Estadísticas de excesos'
    ],
    modulosSstRelacionados: ['indicadores'],
    modulosSstUrls: [
      { nombre: 'Indicadores SST', url: '/indicadores', icono: 'BarChart3' }
    ],
    moduloPesvUrl: '/pesv/monitoreo-gps',
    moduloPesvNombre: 'Monitoreo GPS/Velocidad',
    modoVerificacionSugerido: ['Revisión de política de velocidad', 'Verificación de reportes de monitoreo GPS', 'Revisión de estadísticas de excesos'],
    hallazgoSugeridoNoCumple: 'No se evidencian controles para la gestión de velocidad (política, GPS, seguimiento a infracciones) según Art. 19 de la Resolución 40595/2022.',
    observacionesCumple: 'Se verifican controles de velocidad implementados con política documentada, monitoreo GPS y seguimiento a infracciones conforme a la Resolución 40595/2022.',
    observacionesNoCumple: 'Se requiere implementar controles de velocidad con política, mecanismos de monitoreo y seguimiento.',
    justificacionNaSugerida: 'No aplica para nivel básico según Resolución 40595/2022.',
    fundamentoNormativo: 'Resolución 40595/2022, Art. 19 - Gestión de la velocidad'
  },
  {
    codigo: 'H08',
    numero: 16,
    nombre: 'Gestión de rutas seguras',
    descripcion: 'Analizar y seleccionar rutas seguras para la operación.',
    fase: 'hacer',
    aplicaBasico: false,
    aplicaEstandar: true,
    aplicaAvanzado: true,
    puntajeMaximo: 4,
    criteriosVerificacion: [
      'Análisis de rutas',
      'Identificación de puntos críticos',
      'Alternativas de ruta'
    ],
    evidenciasRequeridas: [
      'Documento de análisis de rutas',
      'Mapa de puntos críticos',
      'Plan de rutas alternas'
    ],
    modulosSstRelacionados: ['iperc'],
    modulosSstUrls: [
      { nombre: 'Matriz IPERC', url: '/iperc', icono: 'AlertTriangle' }
    ],
    moduloPesvUrl: '/pesv/rutas-seguras',
    moduloPesvNombre: 'Rutas Seguras',
    modoVerificacionSugerido: ['Revisión de análisis de rutas', 'Verificación de mapa de puntos críticos', 'Revisión de plan de rutas alternas'],
    hallazgoSugeridoNoCumple: 'No se evidencia análisis de rutas con identificación de puntos críticos y alternativas según Art. 20 de la Resolución 40595/2022.',
    observacionesCumple: 'Se verifica análisis de rutas con identificación de puntos críticos, señalización y rutas alternas conforme a la Resolución 40595/2022.',
    observacionesNoCumple: 'Se requiere realizar análisis de rutas con identificación de puntos críticos y alternativas.',
    justificacionNaSugerida: 'No aplica para nivel básico según Resolución 40595/2022.',
    fundamentoNormativo: 'Resolución 40595/2022, Art. 20 - Infraestructura segura'
  },
  {
    codigo: 'H09',
    numero: 17,
    nombre: 'Gestión de fatiga y somnolencia',
    descripcion: 'Implementar controles para prevenir la fatiga y somnolencia en conductores.',
    fase: 'hacer',
    aplicaBasico: false,
    aplicaEstandar: true,
    aplicaAvanzado: true,
    puntajeMaximo: 4,
    criteriosVerificacion: [
      'Política de jornadas y descansos',
      'Control de horas de conducción',
      'Programa de prevención de fatiga'
    ],
    evidenciasRequeridas: [
      'Documento de política de jornadas',
      'Registros de horas de conducción',
      'Capacitaciones sobre fatiga'
    ],
    modulosSstRelacionados: ['sve', 'examenes-medicos'],
    modulosSstUrls: [
      { nombre: 'Sistema de Vigilancia Epidemiológica', url: '/sve', icono: 'Activity' },
      { nombre: 'Exámenes Médicos', url: '/examenes-medicos', icono: 'Stethoscope' }
    ],
    modoVerificacionSugerido: ['Revisión de política de jornadas y descansos', 'Verificación de registros de horas de conducción', 'Revisión de capacitaciones sobre fatiga'],
    hallazgoSugeridoNoCumple: 'No se evidencian controles para prevenir la fatiga y somnolencia en conductores (jornadas, descansos, horas de conducción) según Art. 21 de la Resolución 40595/2022.',
    observacionesCumple: 'Se verifican controles de fatiga y somnolencia con política de jornadas, registro de horas de conducción y programa de prevención conforme a la Resolución 40595/2022.',
    observacionesNoCumple: 'Se requiere implementar controles de fatiga con política de jornadas y programa de prevención.',
    justificacionNaSugerida: 'No aplica para nivel básico según Resolución 40595/2022.',
    moduloPesvUrl: '/pesv/fatiga-somnolencia',
    moduloPesvNombre: 'Registros de Fatiga y Somnolencia',
    fundamentoNormativo: 'Resolución 40595/2022, Art. 21 - Prevención de la fatiga'
  },
  {
    codigo: 'H10',
    numero: 18,
    nombre: 'Gestión de alcohol y sustancias psicoactivas',
    descripcion: 'Implementar programa de prevención y control de consumo de alcohol y drogas.',
    fase: 'hacer',
    aplicaBasico: true,
    aplicaEstandar: true,
    aplicaAvanzado: true,
    puntajeMaximo: 4,
    criteriosVerificacion: [
      'Política de cero tolerancia',
      'Programa de pruebas aleatorias',
      'Programa de prevención'
    ],
    evidenciasRequeridas: [
      'Política documentada',
      'Registros de pruebas',
      'Capacitaciones de prevención'
    ],
    modulosSstRelacionados: ['sve', 'examenes-medicos'],
    modulosSstUrls: [
      { nombre: 'Sistema de Vigilancia Epidemiológica', url: '/sve', icono: 'Activity' },
      { nombre: 'Exámenes Médicos', url: '/examenes-medicos', icono: 'Stethoscope' }
    ],
    modoVerificacionSugerido: ['Revisión de política de cero tolerancia', 'Verificación de registros de pruebas', 'Revisión de capacitaciones de prevención'],
    hallazgoSugeridoNoCumple: 'No se evidencia programa de prevención y control de consumo de alcohol y sustancias psicoactivas con política de cero tolerancia según Art. 22 de la Resolución 40595/2022.',
    observacionesCumple: 'Se verifica programa de prevención con política de cero tolerancia, pruebas aleatorias y capacitaciones de prevención conforme a la Resolución 40595/2022.',
    observacionesNoCumple: 'Se requiere implementar programa de prevención de alcohol y sustancias con política de cero tolerancia.',
    justificacionNaSugerida: 'No aplica para organizaciones sin conductores ni personal expuesto a riesgo vial.',
    moduloPesvUrl: '/pesv/alcohol-sustancias',
    moduloPesvNombre: 'Registros de Alcohol y SAP',
    fundamentoNormativo: 'Resolución 40595/2022, Art. 22 - Sustancias psicoactivas'
  },
  {
    codigo: 'H11',
    numero: 19,
    nombre: 'Atención a víctimas de siniestros viales',
    descripcion: 'Establecer protocolo de atención a víctimas de siniestros viales.',
    fase: 'hacer',
    aplicaBasico: true,
    aplicaEstandar: true,
    aplicaAvanzado: true,
    puntajeMaximo: 4,
    criteriosVerificacion: [
      'Protocolo de atención documentado',
      'Líneas de emergencia establecidas',
      'Programa de acompañamiento'
    ],
    evidenciasRequeridas: [
      'Protocolo de atención a víctimas',
      'Directorio de emergencias',
      'Convenios con IPS'
    ],
    modulosSstRelacionados: ['emergencias', 'accidentes'],
    modulosSstUrls: [
      { nombre: 'Plan de Emergencias', url: '/emergencias', icono: 'Siren' },
      { nombre: 'Accidentes de Trabajo', url: '/accidentes', icono: 'AlertOctagon' }
    ],
    modoVerificacionSugerido: ['Revisión de protocolo de atención', 'Verificación de directorio de emergencias', 'Revisión de convenios con IPS'],
    hallazgoSugeridoNoCumple: 'No se evidencia protocolo de atención a víctimas de siniestros viales con líneas de emergencia y programa de acompañamiento según Art. 23 de la Resolución 40595/2022.',
    observacionesCumple: 'Se verifica protocolo de atención a víctimas con directorio de emergencias, convenios con IPS y programa de acompañamiento conforme a la Resolución 40595/2022.',
    observacionesNoCumple: 'Se requiere establecer protocolo de atención a víctimas con directorio de emergencias y convenios.',
    justificacionNaSugerida: 'No aplica para organizaciones sin historial de siniestros viales y bajo riesgo vial.',
    fundamentoNormativo: 'Resolución 40595/2022, Art. 23 - Atención a víctimas'
  },

  // ==================== VERIFICAR (3 pasos) ====================
  {
    codigo: 'V01',
    numero: 20,
    nombre: 'Indicadores de gestión del PESV',
    descripcion: 'Definir y monitorear indicadores de desempeño del PESV.',
    fase: 'verificar',
    aplicaBasico: true,
    aplicaEstandar: true,
    aplicaAvanzado: true,
    puntajeMaximo: 5,
    criteriosVerificacion: [
      'Tablero de indicadores definido',
      'Medición periódica',
      'Análisis de tendencias'
    ],
    evidenciasRequeridas: [
      'Tablero de indicadores PESV',
      'Reportes de seguimiento',
      'Gráficos de tendencias'
    ],
    modulosSstRelacionados: ['indicadores'],
    moduloPesvUrl: '/pesv/indicadores',
    moduloPesvNombre: 'Indicadores PESV',
    modoVerificacionSugerido: ['Revisión de tablero de indicadores', 'Verificación de mediciones periódicas', 'Revisión de análisis de tendencias'],
    hallazgoSugeridoNoCumple: 'No se evidencian indicadores de desempeño del PESV definidos con medición periódica y análisis de tendencias según Art. 24 de la Resolución 40595/2022.',
    observacionesCumple: 'Se verifican indicadores de desempeño definidos con medición periódica, análisis de tendencias y reportes de seguimiento conforme a la Resolución 40595/2022.',
    observacionesNoCumple: 'Se requiere definir y monitorear indicadores de desempeño del PESV con análisis de tendencias.',
    justificacionNaSugerida: 'No aplica para evaluaciones en primer año de implementación sin línea base.',
    fundamentoNormativo: 'Resolución 40595/2022, Art. 24 - Seguimiento, medición, análisis y evaluación del desempeño'
  },
  {
    codigo: 'V02',
    numero: 21,
    nombre: 'Registro y análisis de siniestros viales',
    descripcion: 'Registrar, investigar y analizar todos los siniestros viales de la organización.',
    fase: 'verificar',
    aplicaBasico: true,
    aplicaEstandar: true,
    aplicaAvanzado: true,
    puntajeMaximo: 5,
    criteriosVerificacion: [
      'Registro de siniestros viales',
      'Investigación de causas',
      'Lecciones aprendidas'
    ],
    evidenciasRequeridas: [
      'Base de datos de siniestros',
      'Informes de investigación',
      'Análisis de causalidad'
    ],
    modulosSstRelacionados: ['accidentes', 'investigaciones'],
    moduloPesvUrl: '/pesv/siniestros',
    moduloPesvNombre: 'Siniestros Viales',
    modoVerificacionSugerido: ['Revisión de base de datos de siniestros', 'Verificación de informes de investigación', 'Revisión de análisis de causalidad'],
    hallazgoSugeridoNoCumple: 'No se evidencia registro, investigación y análisis de siniestros viales con lecciones aprendidas según Art. 25 de la Resolución 40595/2022.',
    observacionesCumple: 'Se verifica registro completo de siniestros viales con investigación de causas, análisis de causalidad y lecciones aprendidas conforme a la Resolución 40595/2022.',
    observacionesNoCumple: 'Se requiere implementar registro sistemático de siniestros con investigación y análisis de causas.',
    justificacionNaSugerida: 'No aplica para organizaciones sin historial de siniestros viales en el período evaluado.',
    fundamentoNormativo: 'Resolución 40595/2022, Art. 25 - Investigación de siniestros viales'
  },
  {
    codigo: 'V03',
    numero: 22,
    nombre: 'Auditoría del PESV',
    descripcion: 'Realizar auditorías periódicas al PESV para verificar su cumplimiento y eficacia.',
    fase: 'verificar',
    aplicaBasico: false,
    aplicaEstandar: true,
    aplicaAvanzado: true,
    puntajeMaximo: 4,
    criteriosVerificacion: [
      'Programa de auditoría',
      'Informes de auditoría',
      'Plan de acciones correctivas'
    ],
    evidenciasRequeridas: [
      'Programa anual de auditorías',
      'Listas de verificación',
      'Informes de hallazgos'
    ],
    moduloPesvUrl: '/pesv/evaluacion/:evaluacionId/auditorias',
    moduloPesvNombre: 'Auditorías PESV',
    modulosSstRelacionados: ['auditorias'],
    modoVerificacionSugerido: ['Revisión de programa anual de auditorías', 'Verificación de informes de auditoría', 'Revisión de plan de acciones correctivas'],
    hallazgoSugeridoNoCumple: 'No se evidencian auditorías periódicas al PESV con programa, informes y plan de acciones correctivas según Art. 26 de la Resolución 40595/2022.',
    observacionesCumple: 'Se verifican auditorías periódicas al PESV con programa anual, informes de hallazgos y plan de acciones correctivas conforme a la Resolución 40595/2022.',
    observacionesNoCumple: 'Se requiere implementar programa de auditorías con informes y plan de acciones correctivas.',
    justificacionNaSugerida: 'No aplica para nivel básico según Resolución 40595/2022.',
    fundamentoNormativo: 'Resolución 40595/2022, Art. 26 - Auditoría'
  },

  // ==================== ACTUAR (2 pasos) ====================
  {
    codigo: 'A01',
    numero: 23,
    nombre: 'Acciones de mejora continua',
    descripcion: 'Implementar acciones correctivas, preventivas y de mejora derivadas del PESV.',
    fase: 'actuar',
    aplicaBasico: true,
    aplicaEstandar: true,
    aplicaAvanzado: true,
    puntajeMaximo: 4,
    criteriosVerificacion: [
      'Plan de mejora documentado',
      'Seguimiento a acciones',
      'Verificación de eficacia'
    ],
    evidenciasRequeridas: [
      'Plan de mejora PESV',
      'Registros de seguimiento',
      'Informes de eficacia'
    ],
    modulosSstRelacionados: ['acciones-mejora'],
    moduloPesvUrl: '/pesv/evaluacion/:evaluacionId/mejora-continua',
    moduloPesvNombre: 'Mejora Continua PESV',
    modulosSstUrls: [
      { nombre: 'Plan de Mejoramiento SST', url: '/plan-mejoramiento', icono: 'ClipboardCheck' }
    ],
    modoVerificacionSugerido: ['Revisión de plan de mejora documentado', 'Verificación de seguimiento a acciones', 'Revisión de informes de eficacia'],
    hallazgoSugeridoNoCumple: 'No se evidencian acciones correctivas, preventivas y de mejora derivadas del PESV con seguimiento y verificación de eficacia según Art. 27 de la Resolución 40595/2022.',
    observacionesCumple: 'Se verifican acciones correctivas, preventivas y de mejora documentadas con seguimiento y verificación de eficacia conforme a la Resolución 40595/2022 y Decreto 1072/2015 Art. 2.2.4.6.33.',
    observacionesNoCumple: 'Se requiere implementar plan de mejora con acciones correctivas, preventivas y de mejora con seguimiento.',
    justificacionNaSugerida: 'No aplica para evaluaciones sin hallazgos previos que requieran acciones de mejora.',
    fundamentoNormativo: 'Resolución 40595/2022, Art. 27 - Mejora continua; Decreto 1072/2015, Art. 2.2.4.6.33'
  },
  {
    codigo: 'A02',
    numero: 24,
    nombre: 'Revisión por la alta dirección',
    descripcion: 'Realizar revisión periódica del PESV por parte de la alta dirección.',
    fase: 'actuar',
    aplicaBasico: true,
    aplicaEstandar: true,
    aplicaAvanzado: true,
    puntajeMaximo: 4,
    criteriosVerificacion: [
      'Acta de revisión por la dirección',
      'Análisis de resultados',
      'Decisiones y compromisos'
    ],
    evidenciasRequeridas: [
      'Acta de revisión PESV',
      'Informe ejecutivo de resultados',
      'Plan de acción de la dirección'
    ],
    modulosSstRelacionados: ['revision-direccion'],
    moduloPesvUrl: '/pesv/evaluacion/:evaluacionId/revision-direccion',
    moduloPesvNombre: 'Revisión por la Dirección PESV',
    modulosSstUrls: [
      { nombre: 'Revisiones por la Dirección SST', url: '/revisiones-direccion', icono: 'ClipboardCheck' }
    ],
    modoVerificacionSugerido: ['Revisión de acta de revisión por la dirección', 'Verificación de análisis de resultados', 'Revisión de decisiones y compromisos'],
    hallazgoSugeridoNoCumple: 'No se evidencia revisión periódica del PESV por parte de la alta dirección con análisis de resultados, decisiones y compromisos según Art. 28 de la Resolución 40595/2022.',
    observacionesCumple: 'Se verifica revisión periódica del PESV por la alta dirección con acta de revisión, análisis de resultados y compromisos conforme a la Resolución 40595/2022 y Decreto 1072/2015 Art. 2.2.4.6.31.',
    observacionesNoCumple: 'Se requiere realizar revisión por la alta dirección con análisis de resultados y definición de compromisos.',
    justificacionNaSugerida: 'No aplica para evaluaciones iniciales sin período de implementación previo.',
    fundamentoNormativo: 'Resolución 40595/2022, Art. 28 - Revisión por la dirección; Decreto 1072/2015, Art. 2.2.4.6.31; ISO 39001:2012 Cláusula 9.3'
  }
];

// Filtrar pasos por nivel PESV
export function getPasosPorNivel(nivel: 'basico' | 'estandar' | 'avanzado'): PasoPesvData[] {
  return PASOS_PESV.filter(paso => {
    if (nivel === 'basico') return paso.aplicaBasico;
    if (nivel === 'estandar') return paso.aplicaEstandar;
    return paso.aplicaAvanzado;
  });
}

// Obtener pasos por fase
export function getPasosPorFase(fase: 'planear' | 'hacer' | 'verificar' | 'actuar'): PasoPesvData[] {
  return PASOS_PESV.filter(paso => paso.fase === fase);
}

// Calcular puntaje máximo por nivel
export function getPuntajeMaximoPorNivel(nivel: 'basico' | 'estandar' | 'avanzado'): number {
  const pasos = getPasosPorNivel(nivel);
  return pasos.reduce((total, paso) => total + paso.puntajeMaximo, 0);
}

// Obtener resumen por fase
export function getResumenPorFase(nivel: 'basico' | 'estandar' | 'avanzado') {
  const pasos = getPasosPorNivel(nivel);
  
  return {
    planear: {
      cantidad: pasos.filter(p => p.fase === 'planear').length,
      puntajeMaximo: pasos.filter(p => p.fase === 'planear').reduce((t, p) => t + p.puntajeMaximo, 0)
    },
    hacer: {
      cantidad: pasos.filter(p => p.fase === 'hacer').length,
      puntajeMaximo: pasos.filter(p => p.fase === 'hacer').reduce((t, p) => t + p.puntajeMaximo, 0)
    },
    verificar: {
      cantidad: pasos.filter(p => p.fase === 'verificar').length,
      puntajeMaximo: pasos.filter(p => p.fase === 'verificar').reduce((t, p) => t + p.puntajeMaximo, 0)
    },
    actuar: {
      cantidad: pasos.filter(p => p.fase === 'actuar').length,
      puntajeMaximo: pasos.filter(p => p.fase === 'actuar').reduce((t, p) => t + p.puntajeMaximo, 0)
    }
  };
}

// Labels para niveles PESV
export const NIVELES_PESV_LABELS: Record<string, string> = {
  basico: 'Básico (≤10 vehículos o conductores)',
  estandar: 'Estándar (11-50 vehículos o conductores)',
  avanzado: 'Avanzado (>50 vehículos o conductores)'
};

// Labels para fases PHVA
export const FASES_PESV_LABELS: Record<string, string> = {
  planear: 'Planear',
  hacer: 'Hacer',
  verificar: 'Verificar',
  actuar: 'Actuar'
};

// Colores para fases PHVA
export const FASES_PESV_COLORS: Record<string, string> = {
  planear: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  hacer: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  verificar: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  actuar: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
};
