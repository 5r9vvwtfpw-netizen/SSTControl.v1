/**
 * Plantillas de Matriz Legal para PESV (Plan Estratégico de Seguridad Vial)
 * Resolución 40595/2022 - Ministerio de Transporte
 * 
 * Este archivo contiene las plantillas y normativa para agregar a la Matriz Legal
 * todos los requisitos del Plan Estratégico de Seguridad Vial según la normativa colombiana.
 * 
 * Estructura: 24 pasos PESV organizados por ciclo PHVA
 * - PLANEAR (P01-P06): Diagnóstico, política, objetivos, planificación
 * - HACER (H01-H12): Implementación, capacitación, controles
 * - VERIFICAR (V01-V03): Auditorías, seguimiento, indicadores
 * - ACTUAR (A01-A03): Mejora continua, acciones correctivas
 * 
 * @author SST Colombia
 * @version 1.0.0
 * @date 2026-02
 */

export interface PlantillaPesvMatrizLegal {
  id: string;
  codigoPaso: string;
  nombre: string;
  descripcion: string;
  cicloPHVA: 'planear' | 'hacer' | 'verificar' | 'actuar';
  campos: {
    categoria: string;
    obligaciones: string;
    normativa: string;
  };
  normativaBase: string;
  articulosDecretoConexo: string[];
  nivelComplejidadAplica: ('basico' | 'estandar' | 'avanzado')[];
}

/**
 * Normativa principal PESV
 */
export const normativaPesvPrincipal = {
  resolucion40595: {
    codigo: "RES-40595-2022",
    nombre: "Resolución 40595 de 2022",
    entidad: "Ministerio de Transporte",
    fecha_expedicion: "21 de diciembre de 2022",
    objeto: "Reglamenta la elaboración del Plan Estratégico de Seguridad Vial",
    deroga: ["Resolución 1565/2014"],
    estructura: "24 pasos organizados en ciclo PHVA",
    niveles_complejidad: ["Básico", "Estándar", "Avanzado"]
  },
  ley1503: {
    codigo: "LEY-1503-2011",
    nombre: "Ley 1503 de 2011",
    entidad: "Congreso de Colombia",
    fecha_expedicion: "29 de diciembre de 2011",
    objeto: "Promueve la formación de hábitos, comportamientos y conductas seguros en la vía"
  },
  ley1696: {
    codigo: "LEY-1696-2013",
    nombre: "Ley 1696 de 2013",
    entidad: "Congreso de Colombia",
    fecha_expedicion: "19 de diciembre de 2013",
    objeto: "Sanciones por conducción bajo influencia del alcohol u otras sustancias"
  },
  iso39001: {
    codigo: "ISO-39001-2012",
    nombre: "ISO 39001:2012",
    entidad: "ISO",
    objeto: "Sistemas de gestión de la seguridad vial - Requisitos y orientación para su uso"
  },
  iso31000: {
    codigo: "ISO-31000-2018",
    nombre: "ISO 31000:2018",
    entidad: "ISO",
    objeto: "Gestión del riesgo - Directrices"
  }
};

/**
 * Plantillas PESV para la Matriz Legal - Ciclo PLANEAR
 */
export const plantillasPesvPlanear: PlantillaPesvMatrizLegal[] = [
  {
    id: "pesv-p01",
    codigoPaso: "P01",
    nombre: "Liderazgo y compromiso de la alta dirección",
    descripcion: "Designación del responsable del PESV y compromiso documentado de la dirección",
    cicloPHVA: "planear",
    campos: {
      categoria: "seguridad-vial",
      obligaciones: `La alta dirección debe demostrar liderazgo y compromiso con el PESV:
- Designar un responsable del PESV con las competencias requeridas
- Asegurar los recursos necesarios (humanos, técnicos, financieros)
- Integrar el PESV al Sistema de Gestión de Seguridad y Salud en el Trabajo
- Comunicar la importancia de la seguridad vial a todos los niveles
- Participar en las revisiones periódicas del PESV`,
      normativa: "Resolución 40595/2022 Paso P01, Decreto 1072/2015 Art. 2.2.4.6.8, ISO 39001:2012 Cláusula 5.1"
    },
    normativaBase: "RES-40595-2022-P01",
    articulosDecretoConexo: ["2.2.4.6.8", "2.2.4.6.10"],
    nivelComplejidadAplica: ["basico", "estandar", "avanzado"]
  },
  {
    id: "pesv-p02",
    codigoPaso: "P02",
    nombre: "Comité de seguridad vial",
    descripcion: "Conformación y funcionamiento del comité de seguridad vial",
    cicloPHVA: "planear",
    campos: {
      categoria: "seguridad-vial",
      obligaciones: `Conformar y mantener activo el Comité de Seguridad Vial:
- Definir integrantes según nivel de complejidad de la organización
- Establecer funciones y responsabilidades de cada miembro
- Programar reuniones periódicas (mínimo trimestral)
- Documentar actas de reuniones con compromisos y seguimiento
- Articular con el COPASST o Vigía de SST`,
      normativa: "Resolución 40595/2022 Paso P02, Decreto 1072/2015 Art. 2.2.4.6.8, ISO 39001:2012 Cláusula 5.3"
    },
    normativaBase: "RES-40595-2022-P02",
    articulosDecretoConexo: ["2.2.4.6.8", "2.2.4.6.12"],
    nivelComplejidadAplica: ["estandar", "avanzado"]
  },
  {
    id: "pesv-p03",
    codigoPaso: "P03",
    nombre: "Política de seguridad vial",
    descripcion: "Definición y divulgación de la política de seguridad vial",
    cicloPHVA: "planear",
    campos: {
      categoria: "seguridad-vial",
      obligaciones: `Establecer una política de seguridad vial que incluya:
- Compromiso con la prevención de accidentes de tránsito
- Cumplimiento de la normatividad vial vigente
- Promoción de comportamientos seguros en la vía
- Mejora continua del desempeño en seguridad vial
- Firma del representante legal y fecha de expedición
- Divulgación a todos los trabajadores, contratistas y partes interesadas`,
      normativa: "Resolución 40595/2022 Paso P03, Decreto 1072/2015 Art. 2.2.4.6.5, ISO 39001:2012 Cláusula 5.2"
    },
    normativaBase: "RES-40595-2022-P03",
    articulosDecretoConexo: ["2.2.4.6.5", "2.2.4.6.6"],
    nivelComplejidadAplica: ["basico", "estandar", "avanzado"]
  },
  {
    id: "pesv-p04",
    codigoPaso: "P04",
    nombre: "Diagnóstico de seguridad vial",
    descripcion: "Caracterización de la organización y diagnóstico de riesgos viales",
    cicloPHVA: "planear",
    campos: {
      categoria: "seguridad-vial",
      obligaciones: `Elaborar un diagnóstico integral que incluya:
- Caracterización de la organización (actividad económica, sedes, rutas)
- Inventario de vehículos propios, en leasing o contratados
- Censo de conductores con verificación de licencias
- Identificación de desplazamientos laborales (in-itinere y en misión)
- Análisis histórico de siniestros viales
- Mapeo de rutas frecuentes y puntos críticos
- Identificación de factores de riesgo vial`,
      normativa: "Resolución 40595/2022 Paso P04, Decreto 1072/2015 Art. 2.2.4.6.15, ISO 39001:2012 Cláusula 4.1"
    },
    normativaBase: "RES-40595-2022-P04",
    articulosDecretoConexo: ["2.2.4.6.15", "2.2.4.6.16"],
    nivelComplejidadAplica: ["basico", "estandar", "avanzado"]
  },
  {
    id: "pesv-p05",
    codigoPaso: "P05",
    nombre: "Evaluación de riesgos viales",
    descripcion: "Valoración de riesgos viales según metodología ISO 31000",
    cicloPHVA: "planear",
    campos: {
      categoria: "seguridad-vial",
      obligaciones: `Evaluar y priorizar los riesgos viales identificados:
- Aplicar metodología de valoración de riesgos (ISO 31000:2018)
- Determinar probabilidad y severidad de cada riesgo
- Clasificar riesgos por nivel (bajo, medio, alto, crítico)
- Priorizar intervenciones según nivel de riesgo
- Documentar matriz de riesgos viales
- Integrar con la matriz de peligros del SG-SST`,
      normativa: "Resolución 40595/2022 Paso P05, Decreto 1072/2015 Art. 2.2.4.6.15, ISO 31000:2018, ISO 39001:2012 Cláusula 6.1"
    },
    normativaBase: "RES-40595-2022-P05",
    articulosDecretoConexo: ["2.2.4.6.15", "2.2.4.6.23"],
    nivelComplejidadAplica: ["estandar", "avanzado"]
  },
  {
    id: "pesv-p06",
    codigoPaso: "P06",
    nombre: "Objetivos y metas del PESV",
    descripcion: "Definición de objetivos medibles de seguridad vial",
    cicloPHVA: "planear",
    campos: {
      categoria: "seguridad-vial",
      obligaciones: `Establecer objetivos y metas SMART para seguridad vial:
- Reducción de accidentalidad vial (meta cuantitativa)
- Cumplimiento de controles operacionales
- Mejora de competencias de conductores
- Mantenimiento preventivo de vehículos
- Definir indicadores de seguimiento para cada objetivo
- Alinear con los objetivos del SG-SST`,
      normativa: "Resolución 40595/2022 Paso P06, Decreto 1072/2015 Art. 2.2.4.6.18, ISO 39001:2012 Cláusula 6.2"
    },
    normativaBase: "RES-40595-2022-P06",
    articulosDecretoConexo: ["2.2.4.6.18", "2.2.4.6.19"],
    nivelComplejidadAplica: ["basico", "estandar", "avanzado"]
  }
];

/**
 * Plantillas PESV para la Matriz Legal - Ciclo HACER
 */
export const plantillasPesvHacer: PlantillaPesvMatrizLegal[] = [
  {
    id: "pesv-h01",
    codigoPaso: "H01",
    nombre: "Plan anual de trabajo del PESV",
    descripcion: "Programación de actividades anuales del PESV",
    cicloPHVA: "hacer",
    campos: {
      categoria: "seguridad-vial",
      obligaciones: `Elaborar el plan anual de trabajo del PESV que incluya:
- Cronograma de actividades con fechas y responsables
- Presupuesto asignado para cada actividad
- Recursos necesarios (humanos, técnicos, financieros)
- Indicadores de cumplimiento por actividad
- Integración con el plan de trabajo anual del SG-SST
- Aprobación por la alta dirección`,
      normativa: "Resolución 40595/2022 Paso H01, Decreto 1072/2015 Art. 2.2.4.6.17, ISO 39001:2012 Cláusula 6.2"
    },
    normativaBase: "RES-40595-2022-H01",
    articulosDecretoConexo: ["2.2.4.6.17", "2.2.4.6.20"],
    nivelComplejidadAplica: ["basico", "estandar", "avanzado"]
  },
  {
    id: "pesv-h02",
    codigoPaso: "H02",
    nombre: "Plan de capacitación en seguridad vial",
    descripcion: "Formación en conducción segura y normas de tránsito",
    cicloPHVA: "hacer",
    campos: {
      categoria: "seguridad-vial",
      obligaciones: `Implementar programa de capacitación en seguridad vial:
- Inducción en seguridad vial para todo el personal
- Formación específica para conductores (manejo defensivo, primeros auxilios)
- Actualización normativa en tránsito y transporte
- Sensibilización sobre factores de riesgo (alcohol, drogas, fatiga, distracción)
- Capacitación en mecánica básica y revisión preoperacional
- Registro de asistencia y evaluación de conocimientos`,
      normativa: "Resolución 40595/2022 Paso H02, Ley 1503/2011 Art. 12, Decreto 1072/2015 Art. 2.2.4.6.11, ISO 39001:2012 Cláusula 7.2"
    },
    normativaBase: "RES-40595-2022-H02",
    articulosDecretoConexo: ["2.2.4.6.11", "2.2.4.6.12"],
    nivelComplejidadAplica: ["basico", "estandar", "avanzado"]
  },
  {
    id: "pesv-h03",
    codigoPaso: "H03",
    nombre: "Políticas de regulación de la organización",
    descripcion: "Normas internas de comportamiento vial",
    cicloPHVA: "hacer",
    campos: {
      categoria: "seguridad-vial",
      obligaciones: `Establecer políticas internas de regulación vial:
- Política de alcohol y drogas (tolerancia cero)
- Política de uso del celular al conducir
- Política de uso del cinturón de seguridad
- Política de velocidad máxima permitida
- Política de fatiga y horas máximas de conducción
- Procedimiento disciplinario por incumplimiento`,
      normativa: "Resolución 40595/2022 Paso H03, Ley 1696/2013, Decreto 1072/2015 Art. 2.2.4.6.24, ISO 39001:2012 Cláusula 8.1"
    },
    normativaBase: "RES-40595-2022-H03",
    articulosDecretoConexo: ["2.2.4.6.24", "2.2.4.6.28"],
    nivelComplejidadAplica: ["basico", "estandar", "avanzado"]
  },
  {
    id: "pesv-h04",
    codigoPaso: "H04",
    nombre: "Gestión de crisis y emergencias viales",
    descripcion: "Plan de atención de emergencias en incidentes viales",
    cicloPHVA: "hacer",
    campos: {
      categoria: "seguridad-vial",
      obligaciones: `Establecer plan de atención de emergencias viales:
- Procedimiento de actuación en caso de accidente de tránsito
- Líneas de emergencia (123, ARL, empresa)
- Kit de emergencia en cada vehículo
- Capacitación en primeros auxilios viales
- Comunicación con familiares y autoridades
- Simulacros de emergencia vial`,
      normativa: "Resolución 40595/2022 Paso H04, Decreto 1072/2015 Art. 2.2.4.6.25, ISO 39001:2012 Cláusula 8.2"
    },
    normativaBase: "RES-40595-2022-H04",
    articulosDecretoConexo: ["2.2.4.6.25", "2.2.4.6.26"],
    nivelComplejidadAplica: ["estandar", "avanzado"]
  },
  {
    id: "pesv-h05",
    codigoPaso: "H05",
    nombre: "Investigación de siniestros viales",
    descripcion: "Procedimiento de investigación de accidentes de tránsito",
    cicloPHVA: "hacer",
    campos: {
      categoria: "seguridad-vial",
      obligaciones: `Implementar procedimiento de investigación de siniestros:
- Reporte inmediato de todo siniestro vial (24 horas)
- Investigación de causas básicas e inmediatas
- Análisis de factores contribuyentes (humano, vehículo, vía, entorno)
- Determinación de acciones correctivas y preventivas
- Seguimiento a la implementación de acciones
- Reporte a la ARL cuando aplique (accidente de trabajo)`,
      normativa: "Resolución 40595/2022 Paso H05, Resolución 1401/2007, Decreto 1072/2015 Art. 2.2.4.6.32, ISO 39001:2012 Cláusula 10.2"
    },
    normativaBase: "RES-40595-2022-H05",
    articulosDecretoConexo: ["2.2.4.6.32", "2.2.4.6.33"],
    nivelComplejidadAplica: ["basico", "estandar", "avanzado"]
  },
  {
    id: "pesv-h06",
    codigoPaso: "H06",
    nombre: "Infraestructura segura",
    descripcion: "Condiciones de seguridad en instalaciones y vías internas",
    cicloPHVA: "hacer",
    campos: {
      categoria: "seguridad-vial",
      obligaciones: `Garantizar condiciones de infraestructura segura:
- Señalización vertical y horizontal en instalaciones
- Demarcación de zonas de parqueo y circulación
- Iluminación adecuada en áreas de tránsito
- Separación de tráfico peatonal y vehicular
- Mantenimiento de vías internas
- Control de velocidad en instalaciones`,
      normativa: "Resolución 40595/2022 Paso H06, Decreto 1072/2015 Art. 2.2.4.6.24, ISO 39001:2012 Cláusula 8.1"
    },
    normativaBase: "RES-40595-2022-H06",
    articulosDecretoConexo: ["2.2.4.6.24"],
    nivelComplejidadAplica: ["estandar", "avanzado"]
  },
  {
    id: "pesv-h07",
    codigoPaso: "H07",
    nombre: "Selección y evaluación de conductores",
    descripcion: "Criterios de selección y evaluación periódica de conductores",
    cicloPHVA: "hacer",
    campos: {
      categoria: "seguridad-vial",
      obligaciones: `Establecer proceso de gestión de conductores:
- Perfil del cargo con requisitos de licencia y experiencia
- Verificación de antecedentes y comparendos
- Exámenes médicos ocupacionales con énfasis visual y auditivo
- Prueba práctica de conducción
- Evaluación periódica de competencias
- Registro actualizado de licencias de conducción`,
      normativa: "Resolución 40595/2022 Paso H07, Decreto 1072/2015 Art. 2.2.4.6.13, ISO 39001:2012 Cláusula 7.2"
    },
    normativaBase: "RES-40595-2022-H07",
    articulosDecretoConexo: ["2.2.4.6.13", "2.2.4.6.24"],
    nivelComplejidadAplica: ["basico", "estandar", "avanzado"]
  },
  {
    id: "pesv-h08",
    codigoPaso: "H08",
    nombre: "Inspección de vehículos",
    descripcion: "Revisión preoperacional y mantenimiento de vehículos",
    cicloPHVA: "hacer",
    campos: {
      categoria: "seguridad-vial",
      obligaciones: `Implementar programa de control de vehículos:
- Inspección preoperacional diaria (check-list)
- Programa de mantenimiento preventivo
- Control de documentación (SOAT, revisión técnico-mecánica)
- Registro de kilometraje y consumo de combustible
- Verificación de elementos de seguridad (extintor, botiquín, triángulos)
- Procedimiento para reporte de fallas mecánicas`,
      normativa: "Resolución 40595/2022 Paso H08, Decreto 1072/2015 Art. 2.2.4.6.24, ISO 39001:2012 Cláusula 8.1"
    },
    normativaBase: "RES-40595-2022-H08",
    articulosDecretoConexo: ["2.2.4.6.24"],
    nivelComplejidadAplica: ["basico", "estandar", "avanzado"]
  },
  {
    id: "pesv-h09",
    codigoPaso: "H09",
    nombre: "Planificación de desplazamientos",
    descripcion: "Gestión de rutas y tiempos de desplazamiento",
    cicloPHVA: "hacer",
    campos: {
      categoria: "seguridad-vial",
      obligaciones: `Planificar y controlar los desplazamientos laborales:
- Identificación de rutas frecuentes y alternativas
- Análisis de puntos críticos en las rutas
- Programación de tiempos de desplazamiento realistas
- Control de jornadas de conducción (máximo 8 horas continuas)
- Pausas activas obligatorias cada 2-3 horas
- Monitoreo de condiciones meteorológicas`,
      normativa: "Resolución 40595/2022 Paso H09, Decreto 1072/2015 Art. 2.2.4.6.24, ISO 39001:2012 Cláusula 8.1"
    },
    normativaBase: "RES-40595-2022-H09",
    articulosDecretoConexo: ["2.2.4.6.24"],
    nivelComplejidadAplica: ["estandar", "avanzado"]
  },
  {
    id: "pesv-h10",
    codigoPaso: "H10",
    nombre: "Contratación de servicios de transporte",
    descripcion: "Requisitos para contratistas de transporte",
    cicloPHVA: "hacer",
    campos: {
      categoria: "seguridad-vial",
      obligaciones: `Establecer requisitos para contratación de transporte:
- Verificación de habilitación del transportador
- Exigencia de PESV al contratista de transporte
- Control de documentación de vehículos y conductores
- Cláusulas contractuales de seguridad vial
- Evaluación periódica del desempeño del contratista
- Suspensión por incumplimientos graves`,
      normativa: "Resolución 40595/2022 Paso H10, Decreto 1072/2015 Art. 2.2.4.6.28, ISO 39001:2012 Cláusula 8.1"
    },
    normativaBase: "RES-40595-2022-H10",
    articulosDecretoConexo: ["2.2.4.6.28"],
    nivelComplejidadAplica: ["avanzado"]
  },
  {
    id: "pesv-h11",
    codigoPaso: "H11",
    nombre: "Gestión de contratistas y terceros",
    descripcion: "Control de seguridad vial en contratistas",
    cicloPHVA: "hacer",
    campos: {
      categoria: "seguridad-vial",
      obligaciones: `Gestionar la seguridad vial de contratistas:
- Comunicación de políticas de seguridad vial
- Verificación de competencias de conductores contratistas
- Inspección de vehículos de contratistas
- Reporte de incidentes viales de contratistas
- Evaluación de desempeño en seguridad vial
- Acciones por incumplimiento`,
      normativa: "Resolución 40595/2022 Paso H11, Decreto 1072/2015 Art. 2.2.4.6.28, ISO 39001:2012 Cláusula 8.1"
    },
    normativaBase: "RES-40595-2022-H11",
    articulosDecretoConexo: ["2.2.4.6.28"],
    nivelComplejidadAplica: ["estandar", "avanzado"]
  },
  {
    id: "pesv-h12",
    codigoPaso: "H12",
    nombre: "Comunicación y participación",
    descripcion: "Estrategias de comunicación en seguridad vial",
    cicloPHVA: "hacer",
    campos: {
      categoria: "seguridad-vial",
      obligaciones: `Implementar estrategia de comunicación en seguridad vial:
- Campañas periódicas de sensibilización
- Difusión de estadísticas de accidentalidad
- Reconocimiento a conductores con buen desempeño
- Canales de reporte de condiciones inseguras
- Participación de trabajadores en decisiones del PESV
- Comunicación de lecciones aprendidas`,
      normativa: "Resolución 40595/2022 Paso H12, Decreto 1072/2015 Art. 2.2.4.6.14, ISO 39001:2012 Cláusula 7.4"
    },
    normativaBase: "RES-40595-2022-H12",
    articulosDecretoConexo: ["2.2.4.6.14"],
    nivelComplejidadAplica: ["basico", "estandar", "avanzado"]
  }
];

/**
 * Plantillas PESV para la Matriz Legal - Ciclo VERIFICAR
 */
export const plantillasPesvVerificar: PlantillaPesvMatrizLegal[] = [
  {
    id: "pesv-v01",
    codigoPaso: "V01",
    nombre: "Auditoría del PESV",
    descripcion: "Auditoría anual del Plan Estratégico de Seguridad Vial",
    cicloPHVA: "verificar",
    campos: {
      categoria: "seguridad-vial",
      obligaciones: `Realizar auditoría anual del PESV:
- Evaluación de los 24 pasos según nivel de complejidad
- Verificación de cumplimiento de requisitos legales
- Análisis de eficacia de controles implementados
- Identificación de oportunidades de mejora
- Informe de auditoría con hallazgos y recomendaciones
- Presentación de resultados al Comité de Seguridad Vial`,
      normativa: "Resolución 40595/2022 Paso V01, Decreto 1072/2015 Art. 2.2.4.6.29, ISO 39001:2012 Cláusula 9.2"
    },
    normativaBase: "RES-40595-2022-V01",
    articulosDecretoConexo: ["2.2.4.6.29", "2.2.4.6.30"],
    nivelComplejidadAplica: ["basico", "estandar", "avanzado"]
  },
  {
    id: "pesv-v02",
    codigoPaso: "V02",
    nombre: "Seguimiento a indicadores",
    descripcion: "Monitoreo de indicadores de desempeño en seguridad vial",
    cicloPHVA: "verificar",
    campos: {
      categoria: "seguridad-vial",
      obligaciones: `Realizar seguimiento a indicadores del PESV:
- Tasa de accidentalidad vial
- Índice de severidad de accidentes
- Cumplimiento del plan de capacitación
- Cumplimiento del mantenimiento preventivo
- Porcentaje de inspecciones preoperacionales realizadas
- Análisis de tendencias y desviaciones`,
      normativa: "Resolución 40595/2022 Paso V02, Decreto 1072/2015 Art. 2.2.4.6.19, ISO 39001:2012 Cláusula 9.1"
    },
    normativaBase: "RES-40595-2022-V02",
    articulosDecretoConexo: ["2.2.4.6.19", "2.2.4.6.21"],
    nivelComplejidadAplica: ["basico", "estandar", "avanzado"]
  },
  {
    id: "pesv-v03",
    codigoPaso: "V03",
    nombre: "Revisión por la alta dirección",
    descripcion: "Revisión periódica del PESV por la dirección",
    cicloPHVA: "verificar",
    campos: {
      categoria: "seguridad-vial",
      obligaciones: `Realizar revisión por la alta dirección del PESV:
- Frecuencia mínima anual (puede ser semestral)
- Análisis de cumplimiento de objetivos y metas
- Evaluación de recursos asignados vs necesarios
- Revisión de resultados de auditorías
- Análisis de accidentalidad y tendencias
- Decisiones sobre cambios estratégicos del PESV`,
      normativa: "Resolución 40595/2022 Paso V03, Decreto 1072/2015 Art. 2.2.4.6.31, ISO 39001:2012 Cláusula 9.3"
    },
    normativaBase: "RES-40595-2022-V03",
    articulosDecretoConexo: ["2.2.4.6.31"],
    nivelComplejidadAplica: ["estandar", "avanzado"]
  }
];

/**
 * Plantillas PESV para la Matriz Legal - Ciclo ACTUAR
 */
export const plantillasPesvActuar: PlantillaPesvMatrizLegal[] = [
  {
    id: "pesv-a01",
    codigoPaso: "A01",
    nombre: "Acciones correctivas y preventivas",
    descripcion: "Gestión de acciones de mejora del PESV",
    cicloPHVA: "actuar",
    campos: {
      categoria: "seguridad-vial",
      obligaciones: `Implementar acciones correctivas y preventivas:
- Análisis de causa raíz de no conformidades
- Definición de acciones correctivas con responsables y plazos
- Implementación de acciones preventivas
- Seguimiento a la eficacia de las acciones
- Cierre de acciones cuando se verifique eficacia
- Documentación en el sistema de gestión`,
      normativa: "Resolución 40595/2022 Paso A01, Decreto 1072/2015 Art. 2.2.4.6.33, ISO 39001:2012 Cláusula 10.1"
    },
    normativaBase: "RES-40595-2022-A01",
    articulosDecretoConexo: ["2.2.4.6.33", "2.2.4.6.34"],
    nivelComplejidadAplica: ["basico", "estandar", "avanzado"]
  },
  {
    id: "pesv-a02",
    codigoPaso: "A02",
    nombre: "Mejora continua",
    descripcion: "Proceso de mejora continua del PESV",
    cicloPHVA: "actuar",
    campos: {
      categoria: "seguridad-vial",
      obligaciones: `Garantizar la mejora continua del PESV:
- Identificación de oportunidades de mejora
- Implementación de buenas prácticas
- Benchmarking con otras organizaciones
- Innovación en controles de seguridad vial
- Actualización del PESV ante cambios normativos
- Documentación de lecciones aprendidas`,
      normativa: "Resolución 40595/2022 Paso A02, Decreto 1072/2015 Art. 2.2.4.6.34, ISO 39001:2012 Cláusula 10.3"
    },
    normativaBase: "RES-40595-2022-A02",
    articulosDecretoConexo: ["2.2.4.6.34"],
    nivelComplejidadAplica: ["estandar", "avanzado"]
  },
  {
    id: "pesv-a03",
    codigoPaso: "A03",
    nombre: "Actualización del PESV",
    descripcion: "Actualización periódica del Plan Estratégico",
    cicloPHVA: "actuar",
    campos: {
      categoria: "seguridad-vial",
      obligaciones: `Mantener actualizado el PESV:
- Revisión anual del documento del PESV
- Actualización ante cambios en la organización
- Incorporación de nuevos requisitos legales
- Ajuste de objetivos y metas según resultados
- Control de versiones del documento
- Comunicación de cambios a partes interesadas`,
      normativa: "Resolución 40595/2022 Paso A03, Decreto 1072/2015 Art. 2.2.4.6.34, ISO 39001:2012 Cláusula 10.3"
    },
    normativaBase: "RES-40595-2022-A03",
    articulosDecretoConexo: ["2.2.4.6.34"],
    nivelComplejidadAplica: ["basico", "estandar", "avanzado"]
  }
];

/**
 * Todas las plantillas PESV consolidadas
 */
export const todasLasPlantillasPesv: PlantillaPesvMatrizLegal[] = [
  ...plantillasPesvPlanear,
  ...plantillasPesvHacer,
  ...plantillasPesvVerificar,
  ...plantillasPesvActuar
];

/**
 * Obtener plantilla por código de paso
 */
export function getPlantillaPesvByCodigo(codigoPaso: string): PlantillaPesvMatrizLegal | undefined {
  return todasLasPlantillasPesv.find(p => p.codigoPaso === codigoPaso);
}

/**
 * Obtener plantillas por ciclo PHVA
 */
export function getPlantillasPesvByCiclo(ciclo: 'planear' | 'hacer' | 'verificar' | 'actuar'): PlantillaPesvMatrizLegal[] {
  return todasLasPlantillasPesv.filter(p => p.cicloPHVA === ciclo);
}

/**
 * Obtener plantillas por nivel de complejidad
 */
export function getPlantillasPesvByNivel(nivel: 'basico' | 'estandar' | 'avanzado'): PlantillaPesvMatrizLegal[] {
  return todasLasPlantillasPesv.filter(p => p.nivelComplejidadAplica.includes(nivel));
}

/**
 * Estadísticas de plantillas PESV
 */
export const estadisticasPlantillasPesv = {
  total: todasLasPlantillasPesv.length,
  porCiclo: {
    planear: plantillasPesvPlanear.length,
    hacer: plantillasPesvHacer.length,
    verificar: plantillasPesvVerificar.length,
    actuar: plantillasPesvActuar.length
  },
  porNivel: {
    basico: getPlantillasPesvByNivel('basico').length,
    estandar: getPlantillasPesvByNivel('estandar').length,
    avanzado: getPlantillasPesvByNivel('avanzado').length
  }
};
