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
    moduloPesvNombre: 'Comité PESV'
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
    moduloPesvNombre: 'Liderazgo y Compromiso'
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
    moduloPesvNombre: 'Contexto Organizacional'
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
    moduloPesvNombre: 'Matriz de Riesgos Viales'
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
    moduloPesvNombre: 'Indicadores PESV'
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
    moduloPesvNombre: 'Factores de Desempeño'
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
    moduloPesvNombre: 'Liderazgo y Compromiso'
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
    moduloPesvNombre: 'Liderazgo y Compromiso'
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
    ]
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
    moduloPesvNombre: 'Capacitaciones PESV'
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
    ]
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
    ]
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
    moduloPesvNombre: 'Mantenimiento Vehicular'
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
    moduloPesvNombre: 'Inspecciones Preoperacionales'
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
    moduloPesvNombre: 'Monitoreo GPS/Velocidad'
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
    moduloPesvNombre: 'Rutas Seguras'
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
    ]
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
    ]
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
    ]
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
    modulosSstRelacionados: ['indicadores']
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
    moduloPesvNombre: 'Siniestros Viales'
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
    modulosSstRelacionados: ['auditorias']
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
    ]
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
    ]
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
