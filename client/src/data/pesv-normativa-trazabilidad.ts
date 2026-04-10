/**
 * BASE DE CONOCIMIENTO NORMATIVO PESV COLOMBIA
 * Resolución 40595/2022 - Plan Estratégico de Seguridad Vial
 * Decreto 1072/2015 - Decreto Único Reglamentario del Sector Trabajo
 * ISO 39001:2012 - Sistema de Gestión de la Seguridad Vial
 * ISO 31000:2018 - Gestión del Riesgo
 * 
 * PRINCIPIO: Solo agregar código nuevo, no modificar existente
 */

// =====================================================
// INTERFACES PARA TRAZABILIDAD PESV
// =====================================================

export interface NormativaPesv {
  codigo: string;
  norma: string;
  articulo?: string;
  clausula?: string;
  descripcion: string;
  requisitos: string[];
  obligatorio: boolean;
}

export interface TrazabilidadPasoPesv {
  paso: number;
  codigo: string;
  nombre: string;
  ciclo: 'planear' | 'hacer' | 'verificar' | 'actuar';
  descripcion: string;
  normativaAplicable: {
    resolucion40595?: string;
    decreto1072?: string;
    iso39001?: string;
    iso31000?: string;
    otraNormativa?: string[];
  };
  requisitosEspecificos: string[];
  evidenciasRequeridas: string[];
  frecuenciaRevision?: string;
}

// =====================================================
// NORMATIVAS PRINCIPALES PESV
// =====================================================

export const NORMATIVAS_PESV: NormativaPesv[] = [
  {
    codigo: 'RES-40595-2022',
    norma: 'Resolución 40595 de 2022',
    descripcion: 'Plan Estratégico de Seguridad Vial - Requisitos para organizaciones',
    requisitos: [
      'Aplicable a organizaciones públicas y privadas',
      'Estructura PHVA de 24 pasos',
      'Clasificación por niveles: Básico, Estándar, Avanzado',
      'Auditoría anual obligatoria',
      'Registro ante SUPERTRANSPORTE'
    ],
    obligatorio: true
  },
  {
    codigo: 'DEC-1072-2015',
    norma: 'Decreto 1072 de 2015',
    articulo: 'Libro 2, Parte 2, Título 4, Capítulo 6',
    descripcion: 'Decreto Único Reglamentario del Sector Trabajo - Sistema de Gestión de SST',
    requisitos: [
      'Artículo 2.2.4.6.8 - Obligaciones de los empleadores',
      'Integración con SG-SST',
      'Asignación de responsabilidades',
      'Capacitación obligatoria'
    ],
    obligatorio: true
  },
  {
    codigo: 'ISO-39001-2012',
    norma: 'ISO 39001:2012',
    descripcion: 'Sistema de Gestión de la Seguridad Vial - Requisitos con orientación para su uso',
    requisitos: [
      'Contexto de la organización (Cláusula 4)',
      'Liderazgo (Cláusula 5)',
      'Planificación (Cláusula 6)',
      'Apoyo (Cláusula 7)',
      'Operación (Cláusula 8)',
      'Evaluación del desempeño (Cláusula 9)',
      'Mejora (Cláusula 10)'
    ],
    obligatorio: false
  },
  {
    codigo: 'ISO-31000-2018',
    norma: 'ISO 31000:2018',
    descripcion: 'Gestión del Riesgo - Directrices',
    requisitos: [
      'Marco de referencia para gestión del riesgo',
      'Proceso de gestión del riesgo',
      'Identificación, análisis y evaluación de riesgos',
      'Tratamiento del riesgo'
    ],
    obligatorio: false
  },
  {
    codigo: 'DEC-1252-2021',
    norma: 'Decreto 1252 de 2021',
    descripcion: 'Modifica estructura del Plan Estratégico de Seguridad Vial',
    requisitos: [
      'Actualización de plazos PESV',
      'Nuevos requisitos de implementación',
      'Integración con política nacional de seguridad vial'
    ],
    obligatorio: true
  }
];

// =====================================================
// TRAZABILIDAD DE LOS 24 PASOS PESV
// =====================================================

export const TRAZABILIDAD_PASOS_PESV: TrazabilidadPasoPesv[] = [
  // =====================================================
  // CICLO PLANEAR (8 PASOS)
  // =====================================================
  {
    paso: 1,
    codigo: 'P01',
    nombre: 'Líder del diseño e implementación del PESV',
    ciclo: 'planear',
    descripcion: 'Designación del líder responsable del diseño, implementación y seguimiento del Plan Estratégico de Seguridad Vial',
    normativaAplicable: {
      resolucion40595: 'Artículo 5 - Paso 1',
      decreto1072: 'Artículo 2.2.4.6.8 - Obligaciones de los empleadores',
      iso39001: 'Cláusula 5.3 - Roles, responsabilidades y autoridades organizacionales'
    },
    requisitosEspecificos: [
      'Designación formal por escrito',
      'Definición clara de funciones y responsabilidades',
      'Asignación de tiempo y recursos',
      'Competencias técnicas en seguridad vial',
      'Comunicación a toda la organización'
    ],
    evidenciasRequeridas: [
      'Acta de designación del líder PESV',
      'Perfil de competencias del cargo',
      'Comunicación formal de la designación',
      'Cronograma de dedicación',
      'Presupuesto asignado'
    ],
    frecuenciaRevision: 'Anual'
  },
  {
    paso: 2,
    codigo: 'P02',
    nombre: 'Comité de Seguridad Vial',
    ciclo: 'planear',
    descripcion: 'Conformación del comité responsable de liderar y apoyar la implementación del PESV',
    normativaAplicable: {
      resolucion40595: 'Artículo 5 - Paso 2',
      decreto1072: 'Artículo 2.2.4.6.8 - Obligaciones de los empleadores',
      iso39001: 'Cláusula 5.3 - Roles organizacionales'
    },
    requisitosEspecificos: [
      'Conformación multidisciplinaria',
      'Representación de la alta dirección',
      'Participación de trabajadores',
      'Funciones definidas',
      'Reuniones periódicas documentadas'
    ],
    evidenciasRequeridas: [
      'Acta de conformación del comité',
      'Reglamento interno del comité',
      'Actas de reuniones',
      'Lista de integrantes con roles'
    ],
    frecuenciaRevision: 'Mensual'
  },
  {
    paso: 3,
    codigo: 'P03',
    nombre: 'Política de Seguridad Vial',
    ciclo: 'planear',
    descripcion: 'Definición y divulgación de la política organizacional de seguridad vial',
    normativaAplicable: {
      resolucion40595: 'Artículo 5 - Paso 3',
      decreto1072: 'Artículo 2.2.4.6.5 - Política de SST',
      iso39001: 'Cláusula 5.2 - Política de seguridad vial'
    },
    requisitosEspecificos: [
      'Compromiso de la alta dirección',
      'Objetivos medibles de seguridad vial',
      'Alcance claramente definido',
      'Comunicación a partes interesadas',
      'Revisión periódica'
    ],
    evidenciasRequeridas: [
      'Documento de política firmado',
      'Registro de divulgación',
      'Publicación visible en instalaciones'
    ],
    frecuenciaRevision: 'Anual'
  },
  {
    paso: 4,
    codigo: 'P04',
    nombre: 'Liderazgo y compromiso de la alta dirección',
    ciclo: 'planear',
    descripcion: 'Demostración del compromiso de la alta dirección con la seguridad vial',
    normativaAplicable: {
      resolucion40595: 'Artículo 5 - Paso 4',
      decreto1072: 'Artículo 2.2.4.6.5 - Obligaciones de los empleadores, Artículo 2.2.4.6.31 - Revisión por la alta dirección',
      iso39001: 'Cláusula 5.1 - Liderazgo y compromiso'
    },
    requisitosEspecificos: [
      'Asignación de recursos',
      'Participación activa en el PESV',
      'Rendición de cuentas',
      'Promoción de cultura de seguridad vial'
    ],
    evidenciasRequeridas: [
      'Actas de participación de la dirección',
      'Presupuesto aprobado para PESV',
      'Comunicaciones de la dirección'
    ],
    frecuenciaRevision: 'Semestral'
  },
  {
    paso: 5,
    codigo: 'P05',
    nombre: 'Objetivos y metas del PESV',
    ciclo: 'planear',
    descripcion: 'Definición de objetivos medibles y metas de seguridad vial para el período de vigencia del plan.',
    normativaAplicable: {
      resolucion40595: 'Artículo 5 - Paso 5 - Objetivos y metas',
      decreto1072: 'Artículo 2.2.4.6.16 - Objetivos del SG-SST',
      iso39001: 'Cláusula 6.2 - Objetivos de seguridad vial y planificación',
      iso31000: 'Cláusula 6.5 - Tratamiento del riesgo'
    },
    requisitosEspecificos: [
      'Objetivos de seguridad vial definidos y medibles',
      'Metas cuantificables con indicadores',
      'Responsables asignados para cada objetivo',
      'Cronograma de seguimiento',
      'Alineación con la política de seguridad vial'
    ],
    evidenciasRequeridas: [
      'Documento de objetivos y metas del PESV',
      'Tablero de indicadores vinculados',
      'Actas de revisión de cumplimiento',
      'Reportes de avance periódicos'
    ],
    frecuenciaRevision: 'Trimestral'
  },
  {
    paso: 6,
    codigo: 'P06',
    nombre: 'Caracterización, evaluación y control de riesgos',
    ciclo: 'planear',
    descripcion: 'Identificación, evaluación y priorización de los riesgos viales de la organización',
    normativaAplicable: {
      resolucion40595: 'Artículo 5 - Paso 6',
      decreto1072: 'Artículo 2.2.4.6.15 - Identificación de peligros y valoración de riesgos',
      iso39001: 'Cláusula 6.1 - Acciones para abordar riesgos y oportunidades',
      iso31000: 'Cláusula 5.4.2 - Análisis del riesgo'
    },
    requisitosEspecificos: [
      'Metodología de evaluación de riesgos',
      'Matriz de riesgos viales',
      'Priorización de riesgos',
      'Medidas de control definidas'
    ],
    evidenciasRequeridas: [
      'Matriz de riesgos viales',
      'Plan de tratamiento de riesgos',
      'Indicadores de seguimiento'
    ],
    frecuenciaRevision: 'Semestral'
  },
  {
    paso: 7,
    codigo: 'P07',
    nombre: 'Objetivos y metas del PESV',
    ciclo: 'planear',
    descripcion: 'Definición de objetivos medibles y metas de seguridad vial',
    normativaAplicable: {
      resolucion40595: 'Artículo 5 - Paso 7',
      decreto1072: 'Artículo 2.2.4.6.17 - Objetivos del SG-SST',
      iso39001: 'Cláusula 6.2 - Objetivos de seguridad vial y planificación'
    },
    requisitosEspecificos: [
      'Objetivos SMART',
      'Alineación con política de seguridad vial',
      'Indicadores de cumplimiento',
      'Responsables asignados',
      'Plazos definidos'
    ],
    evidenciasRequeridas: [
      'Documento de objetivos y metas',
      'Indicadores de seguimiento',
      'Plan de acción'
    ],
    frecuenciaRevision: 'Trimestral'
  },
  {
    paso: 8,
    codigo: 'P08',
    nombre: 'Programas de gestión de riesgos viales',
    ciclo: 'planear',
    descripcion: 'Diseño de programas para gestionar los riesgos viales identificados',
    normativaAplicable: {
      resolucion40595: 'Artículo 5 - Paso 8',
      decreto1072: 'Artículo 2.2.4.6.20 - Indicadores del SG-SST',
      iso39001: 'Cláusula 8.1 - Planificación y control operacional'
    },
    requisitosEspecificos: [
      'Programa por cada factor de riesgo crítico',
      'Cronograma de actividades',
      'Recursos asignados',
      'Indicadores de gestión'
    ],
    evidenciasRequeridas: [
      'Documento de programas',
      'Cronograma de implementación',
      'Presupuesto asignado'
    ],
    frecuenciaRevision: 'Trimestral'
  },

  // =====================================================
  // CICLO HACER (12 PASOS)
  // =====================================================
  {
    paso: 9,
    codigo: 'H01',
    nombre: 'Competencia',
    ciclo: 'hacer',
    descripcion: 'Asegurar la competencia de las personas que realizan actividades de conducción',
    normativaAplicable: {
      resolucion40595: 'Artículo 5 - Paso 9',
      decreto1072: 'Artículo 2.2.4.6.11 - Capacitación en SST',
      iso39001: 'Cláusula 7.2 - Competencia'
    },
    requisitosEspecificos: [
      'Perfiles de competencia definidos',
      'Evaluación de competencias',
      'Plan de formación',
      'Certificaciones vigentes'
    ],
    evidenciasRequeridas: [
      'Matriz de competencias',
      'Registros de formación',
      'Licencias de conducción vigentes'
    ],
    frecuenciaRevision: 'Semestral'
  },
  {
    paso: 10,
    codigo: 'H02',
    nombre: 'Plan de capacitación y formación',
    ciclo: 'hacer',
    descripcion: 'Implementación del plan de capacitación en seguridad vial',
    normativaAplicable: {
      resolucion40595: 'Artículo 5 - Paso 10',
      decreto1072: 'Artículo 2.2.4.6.11 - Capacitación en SST',
      iso39001: 'Cláusula 7.2 - Competencia'
    },
    requisitosEspecificos: [
      'Programa de formación estructurado',
      'Contenidos específicos por rol',
      'Evaluación de efectividad',
      'Registros de asistencia'
    ],
    evidenciasRequeridas: [
      'Plan de capacitación aprobado',
      'Registros de capacitación',
      'Evaluaciones de conocimiento'
    ],
    frecuenciaRevision: 'Anual'
  },
  {
    paso: 11,
    codigo: 'H03',
    nombre: 'Control de fatiga y somnolencia',
    ciclo: 'hacer',
    descripcion: 'Gestión del riesgo de fatiga y somnolencia en conductores',
    normativaAplicable: {
      resolucion40595: 'Artículo 5 - Paso 11',
      decreto1072: 'Artículo 2.2.4.6.24 - Medidas de prevención y control',
      iso39001: 'Cláusula 8.1 - Planificación y control operacional'
    },
    requisitosEspecificos: [
      'Política de gestión de fatiga',
      'Control de jornadas de conducción',
      'Pausas activas programadas',
      'Monitoreo de condiciones de salud'
    ],
    evidenciasRequeridas: [
      'Procedimiento de control de fatiga',
      'Registros de jornadas',
      'Informes de seguimiento'
    ],
    frecuenciaRevision: 'Mensual'
  },
  {
    paso: 12,
    codigo: 'H04',
    nombre: 'Preparación y respuesta ante emergencias viales',
    ciclo: 'hacer',
    descripcion: 'Plan de emergencias específico para siniestros viales',
    normativaAplicable: {
      resolucion40595: 'Artículo 5 - Paso 12',
      decreto1072: 'Artículo 2.2.4.6.25 - Prevención, preparación y respuesta ante emergencias',
      iso39001: 'Cláusula 8.2 - Preparación y respuesta ante emergencias'
    },
    requisitosEspecificos: [
      'Plan de emergencias viales',
      'Equipos de emergencia en vehículos',
      'Capacitación en primeros auxilios',
      'Protocolo de comunicación de emergencias'
    ],
    evidenciasRequeridas: [
      'Plan de emergencias documentado',
      'Registros de simulacros',
      'Inventario de equipos de emergencia'
    ],
    frecuenciaRevision: 'Semestral'
  },
  {
    paso: 13,
    codigo: 'H05',
    nombre: 'Investigación de siniestros viales',
    ciclo: 'hacer',
    descripcion: 'Procedimiento para investigación de siniestros viales',
    normativaAplicable: {
      resolucion40595: 'Artículo 5 - Paso 13',
      decreto1072: 'Artículo 2.2.4.6.32 - Investigación de incidentes y accidentes',
      iso39001: 'Cláusula 10.2 - Investigación de accidentes de tráfico'
    },
    requisitosEspecificos: [
      'Procedimiento de investigación',
      'Formato de reporte estandarizado',
      'Análisis de causas raíz',
      'Planes de acción correctiva'
    ],
    evidenciasRequeridas: [
      'Procedimiento de investigación',
      'Informes de investigación',
      'Planes de acción correctiva'
    ],
    frecuenciaRevision: 'Por evento'
  },
  {
    paso: 14,
    codigo: 'H06',
    nombre: 'Infraestructura segura (rutas y vías)',
    ciclo: 'hacer',
    descripcion: 'Gestión de la seguridad en rutas y vías utilizadas',
    normativaAplicable: {
      resolucion40595: 'Artículo 5 - Paso 14',
      iso39001: 'Cláusula 8.1 - Planificación y control operacional'
    },
    requisitosEspecificos: [
      'Análisis de rutas',
      'Identificación de puntos críticos',
      'Señalización adecuada',
      'Mantenimiento de vías internas'
    ],
    evidenciasRequeridas: [
      'Mapa de rutas',
      'Informes de inspección de vías',
      'Plan de mantenimiento vial'
    ],
    frecuenciaRevision: 'Semestral'
  },
  {
    paso: 15,
    codigo: 'H07',
    nombre: 'Selección y evaluación de conductores',
    ciclo: 'hacer',
    descripcion: 'Proceso de selección y evaluación periódica de conductores',
    normativaAplicable: {
      resolucion40595: 'Artículo 5 - Paso 15',
      decreto1072: 'Artículo 2.2.4.6.13 - Conservación de documentos',
      iso39001: 'Cláusula 7.2 - Competencia'
    },
    requisitosEspecificos: [
      'Criterios de selección definidos',
      'Evaluación psicosensométrica',
      'Verificación de antecedentes',
      'Evaluación práctica de conducción'
    ],
    evidenciasRequeridas: [
      'Procedimiento de selección',
      'Exámenes médicos ocupacionales',
      'Evaluaciones de conducción'
    ],
    frecuenciaRevision: 'Anual'
  },
  {
    paso: 16,
    codigo: 'H08',
    nombre: 'Inspección de vehículos',
    ciclo: 'hacer',
    descripcion: 'Programa de inspección preoperacional y periódica de vehículos',
    normativaAplicable: {
      resolucion40595: 'Artículo 5 - Paso 16',
      decreto1072: 'Artículo 2.2.4.6.24 - Medidas de prevención y control',
      iso39001: 'Cláusula 8.1 - Planificación y control operacional'
    },
    requisitosEspecificos: [
      'Lista de chequeo preoperacional',
      'Inspecciones periódicas programadas',
      'Registro de novedades',
      'Seguimiento a correctivos'
    ],
    evidenciasRequeridas: [
      'Formatos de inspección',
      'Registros de inspección',
      'Informes de seguimiento'
    ],
    frecuenciaRevision: 'Diaria/Mensual'
  },
  {
    paso: 17,
    codigo: 'H09',
    nombre: 'Mantenimiento preventivo y correctivo',
    ciclo: 'hacer',
    descripcion: 'Plan de mantenimiento de la flota vehicular',
    normativaAplicable: {
      resolucion40595: 'Artículo 5 - Paso 17',
      decreto1072: 'Artículo 2.2.4.6.24 - Medidas de prevención y control',
      iso39001: 'Cláusula 8.1 - Planificación y control operacional'
    },
    requisitosEspecificos: [
      'Plan de mantenimiento preventivo',
      'Procedimiento de mantenimiento correctivo',
      'Registro de mantenimientos',
      'Control de proveedores de mantenimiento'
    ],
    evidenciasRequeridas: [
      'Plan de mantenimiento',
      'Hojas de vida de vehículos',
      'Órdenes de trabajo'
    ],
    frecuenciaRevision: 'Mensual'
  },
  {
    paso: 18,
    codigo: 'H10',
    nombre: 'Gestión del cambio',
    ciclo: 'hacer',
    descripcion: 'Procedimiento para gestionar cambios que afecten la seguridad vial',
    normativaAplicable: {
      resolucion40595: 'Artículo 5 - Paso 18',
      decreto1072: 'Artículo 2.2.4.6.26 - Gestión del cambio',
      iso39001: 'Cláusula 8.1 - Planificación y control operacional'
    },
    requisitosEspecificos: [
      'Procedimiento de gestión del cambio',
      'Evaluación de impacto en seguridad vial',
      'Comunicación de cambios',
      'Actualización de documentación'
    ],
    evidenciasRequeridas: [
      'Procedimiento documentado',
      'Registros de cambios evaluados',
      'Actas de comunicación'
    ],
    frecuenciaRevision: 'Por evento'
  },
  {
    paso: 19,
    codigo: 'H11',
    nombre: 'Gestión de contratistas y proveedores',
    ciclo: 'hacer',
    descripcion: 'Control de seguridad vial en contratistas y proveedores',
    normativaAplicable: {
      resolucion40595: 'Artículo 5 - Paso 19',
      decreto1072: 'Artículo 2.2.4.6.28 - Contratación',
      iso39001: 'Cláusula 8.1 - Planificación y control operacional'
    },
    requisitosEspecificos: [
      'Criterios de selección de contratistas',
      'Requisitos de seguridad vial para proveedores',
      'Evaluación periódica',
      'Cláusulas contractuales de seguridad vial'
    ],
    evidenciasRequeridas: [
      'Procedimiento de evaluación',
      'Registros de evaluación',
      'Contratos con cláusulas PESV'
    ],
    frecuenciaRevision: 'Anual'
  },
  {
    paso: 20,
    codigo: 'H12',
    nombre: 'Supervisión y monitoreo en vía',
    ciclo: 'hacer',
    descripcion: 'Sistema de supervisión y monitoreo de operaciones en vía',
    normativaAplicable: {
      resolucion40595: 'Artículo 5 - Paso 20',
      iso39001: 'Cláusula 9.1 - Seguimiento, medición, análisis y evaluación'
    },
    requisitosEspecificos: [
      'Sistema de monitoreo (GPS, telemetría)',
      'Supervisión de comportamientos',
      'Alertas de conducción riesgosa',
      'Reportes de desempeño'
    ],
    evidenciasRequeridas: [
      'Registros de monitoreo',
      'Informes de comportamiento',
      'Acciones correctivas'
    ],
    frecuenciaRevision: 'Semanal'
  },

  // =====================================================
  // CICLO VERIFICAR (2 PASOS)
  // =====================================================
  {
    paso: 21,
    codigo: 'V01',
    nombre: 'Auditoría del PESV',
    ciclo: 'verificar',
    descripcion: 'Auditoría interna y externa del Plan Estratégico de Seguridad Vial',
    normativaAplicable: {
      resolucion40595: 'Artículo 5 - Paso 21',
      decreto1072: 'Artículo 2.2.4.6.29 - Auditoría de cumplimiento del SG-SST',
      iso39001: 'Cláusula 9.2 - Auditoría interna'
    },
    requisitosEspecificos: [
      'Programa de auditorías',
      'Auditores competentes',
      'Criterios de auditoría definidos',
      'Informe de hallazgos'
    ],
    evidenciasRequeridas: [
      'Programa de auditorías',
      'Informes de auditoría',
      'Planes de acción correctiva'
    ],
    frecuenciaRevision: 'Anual'
  },
  {
    paso: 21,
    codigo: 'V02',
    nombre: 'Registro y análisis de siniestros viales',
    ciclo: 'verificar',
    descripcion: 'Registrar, investigar y analizar todos los siniestros viales de la organización.',
    normativaAplicable: {
      resolucion40595: 'Artículo 5 - Paso 21 / Art. 25 - Investigación de siniestros viales',
      decreto1072: 'Artículo 2.2.4.6.32 - Investigación de incidentes y accidentes',
      iso39001: 'Cláusula 10.2 - Investigación de accidentes de tráfico'
    },
    requisitosEspecificos: [
      'Procedimiento de investigación de siniestros',
      'Formato de reporte estandarizado',
      'Análisis de causas raíz',
      'Planes de acción correctiva',
      'Registro histórico de siniestros'
    ],
    evidenciasRequeridas: [
      'Base de datos de siniestros viales',
      'Informes de investigación',
      'Análisis de causalidad',
      'Lecciones aprendidas'
    ],
    frecuenciaRevision: 'Inmediata al ocurrir el siniestro'
  },

  // =====================================================
  // CICLO ACTUAR (2 PASOS)
  // =====================================================
  {
    paso: 23,
    codigo: 'A01',
    nombre: 'Mejora continua',
    ciclo: 'actuar',
    descripcion: 'Implementación de acciones de mejora continua del PESV',
    normativaAplicable: {
      resolucion40595: 'Artículo 5 - Paso 23',
      decreto1072: 'Artículo 2.2.4.6.34 - Mejora continua',
      iso39001: 'Cláusula 10.1 - No conformidad y acción correctiva'
    },
    requisitosEspecificos: [
      'Metodología de mejora continua',
      'Análisis de tendencias',
      'Implementación de mejoras',
      'Seguimiento a efectividad'
    ],
    evidenciasRequeridas: [
      'Plan de mejora continua',
      'Registros de acciones correctivas',
      'Indicadores de mejora'
    ],
    frecuenciaRevision: 'Trimestral'
  },
  {
    paso: 24,
    codigo: 'A02',
    nombre: 'Acciones correctivas y preventivas',
    ciclo: 'actuar',
    descripcion: 'Gestión de acciones correctivas y preventivas derivadas del PESV',
    normativaAplicable: {
      resolucion40595: 'Artículo 5 - Paso 24',
      decreto1072: 'Artículo 2.2.4.6.33 - Acciones preventivas y correctivas',
      iso39001: 'Cláusula 10.1 - No conformidad y acción correctiva'
    },
    requisitosEspecificos: [
      'Procedimiento de acciones correctivas',
      'Análisis de causas raíz',
      'Plan de acción con responsables',
      'Verificación de cierre efectivo'
    ],
    evidenciasRequeridas: [
      'Procedimiento documentado',
      'Registro de acciones',
      'Evidencias de cierre'
    ],
    frecuenciaRevision: 'Por evento'
  }
];

// =====================================================
// FUNCIONES AUXILIARES
// =====================================================

/**
 * Obtiene la trazabilidad de un paso específico del PESV
 */
export function getTrazabilidadPaso(codigoPaso: string): TrazabilidadPasoPesv | undefined {
  return TRAZABILIDAD_PASOS_PESV.find(paso => paso.codigo === codigoPaso);
}

/**
 * Obtiene todos los pasos de un ciclo específico
 */
export function getPasosPorCiclo(ciclo: 'planear' | 'hacer' | 'verificar' | 'actuar'): TrazabilidadPasoPesv[] {
  return TRAZABILIDAD_PASOS_PESV.filter(paso => paso.ciclo === ciclo);
}

/**
 * Obtiene la normativa aplicable formateada para mostrar en UI
 */
export function formatNormativaAplicable(paso: TrazabilidadPasoPesv): string[] {
  const normativas: string[] = [];
  
  if (paso.normativaAplicable.resolucion40595) {
    normativas.push(`Resolución 40595/2022 - ${paso.normativaAplicable.resolucion40595}`);
  }
  if (paso.normativaAplicable.decreto1072) {
    normativas.push(`Decreto 1072/2015 - ${paso.normativaAplicable.decreto1072}`);
  }
  if (paso.normativaAplicable.iso39001) {
    normativas.push(`ISO 39001:2012 - ${paso.normativaAplicable.iso39001}`);
  }
  if (paso.normativaAplicable.iso31000) {
    normativas.push(`ISO 31000:2018 - ${paso.normativaAplicable.iso31000}`);
  }
  if (paso.normativaAplicable.otraNormativa) {
    normativas.push(...paso.normativaAplicable.otraNormativa);
  }
  
  return normativas;
}
