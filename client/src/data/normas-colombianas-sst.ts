// Catálogo de Normas Legales Colombianas de SST - Actualizado 2025
// Este catálogo incluye las principales normas de seguridad y salud en el trabajo en Colombia

export interface NormaPredefinida {
  codigo: string; // Código de la norma (ej: "Resolución 0312 de 2019")
  titulo: string;
  categoria: string;
  obligaciones: string;
  periodicidad: string;
  entidadEmisora: string;
  fechaEmision: string;
  descripcion?: string;
}

export const normasColombianasSST: NormaPredefinida[] = [
  // SISTEMA DE GESTIÓN
  {
    codigo: "Decreto 1072 de 2015",
    titulo: "Decreto Único Reglamentario del Sector Trabajo",
    categoria: "sistema-gestion",
    obligaciones: "Implementar y mantener el Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST)",
    periodicidad: "Permanente",
    entidadEmisora: "Ministerio del Trabajo",
    fechaEmision: "2015-05-26",
    descripcion: "Compila toda la normatividad del sector trabajo, incluyendo el SG-SST"
  },
  {
    codigo: "Resolución 0312 de 2019",
    titulo: "Estándares Mínimos del SG-SST",
    categoria: "sistema-gestion",
    obligaciones: "Cumplir con los estándares mínimos del SG-SST según clasificación de empresa (I, II o III)",
    periodicidad: "Anual",
    entidadEmisora: "Ministerio del Trabajo",
    fechaEmision: "2019-02-13",
    descripcion: "Define los estándares mínimos que debe cumplir toda empresa con SG-SST"
  },
  {
    codigo: "Circular 009 de 2025",
    titulo: "Reporte Autoevaluación Estándares Mínimos SG-SST 2025",
    categoria: "sistema-gestion",
    obligaciones: "Reportar la autoevaluación de estándares mínimos del SG-SST (año 2024) y plan de mejoramiento en la plataforma SGRL del Ministerio de Trabajo. Plazo: 3 de febrero al 28 de marzo de 2025.",
    periodicidad: "Anual (febrero-marzo)",
    entidadEmisora: "Ministerio del Trabajo",
    fechaEmision: "2025-01-15",
    descripcion: "Establece fechas y procedimiento para el reporte anual obligatorio de autoevaluación del SG-SST en plataforma https://sgrl.mintrabajo.gov.co"
  },
  {
    codigo: "Decreto 1295 de 1994",
    titulo: "Sistema General de Riesgos Laborales",
    categoria: "sistema-gestion",
    obligaciones: "Afiliar a todos los trabajadores al Sistema General de Riesgos Laborales (ARL)",
    periodicidad: "Al ingreso de cada trabajador",
    entidadEmisora: "Ministerio de Gobierno",
    fechaEmision: "1994-06-22",
    descripcion: "Organiza el Sistema General de Riesgos Laborales"
  },
  
  // COMITÉS Y COPASST
  {
    codigo: "Resolución 2013 de 1986",
    titulo: "Creación y funcionamiento de Comités de Medicina, Higiene y Seguridad Industrial",
    categoria: "comites-sst",
    obligaciones: "Conformar y dar funcionamiento al Comité Paritario de Seguridad y Salud en el Trabajo (COPASST)",
    periodicidad: "Reuniones mensuales mínimo",
    entidadEmisora: "Ministerio del Trabajo",
    fechaEmision: "1986-06-06",
    descripcion: "Reglamenta la organización y funcionamiento del COPASST"
  },
  {
    codigo: "Resolución 1401 de 2007",
    titulo: "Investigación de Incidentes y Accidentes de Trabajo",
    categoria: "investigacion-incidentes",
    obligaciones: "Investigar todos los accidentes e incidentes de trabajo con participación del COPASST",
    periodicidad: "Inmediato al evento",
    entidadEmisora: "Ministerio de la Protección Social",
    fechaEmision: "2007-05-14",
    descripcion: "Reglamenta la investigación de incidentes y accidentes de trabajo"
  },
  
  // EXÁMENES MÉDICOS OCUPACIONALES
  {
    codigo: "Resolución 1843 de 2025",
    titulo: "Evaluaciones Médicas Ocupacionales y Perfiles de Cargo",
    categoria: "medicina-trabajo",
    obligaciones: "Realizar evaluaciones médicas ocupacionales (ingreso, periódicas, retiro, retorno laboral, post-incapacidad, seguimiento). Elaborar perfiles de cargo detallados. Implementar sistemas de vigilancia epidemiológica ocupacional. Asumir costos de evaluaciones, paraclínicos y transporte.",
    periodicidad: "Máximo cada 3 años según justificación técnica basada en riesgo, edad y estado de salud",
    entidadEmisora: "Ministerio del Trabajo",
    fechaEmision: "2025-04-29",
    descripcion: "Moderniza las evaluaciones médicas ocupacionales, introduce perfiles de cargo (elimina profesiograma), regula pruebas de embarazo y sustancias psicoactivas. Deroga Resolución 2346 de 2007. Vigencia: 29 de octubre de 2025. Sanciones hasta 2.455 UVT."
  },
  {
    codigo: "Resolución 2346 de 2007",
    titulo: "Práctica de evaluaciones médicas ocupacionales (DEROGADA)",
    categoria: "medicina-trabajo",
    obligaciones: "DEROGADA por Resolución 1843 de 2025. Anteriormente regulaba exámenes médicos de ingreso, periódicos, retiro y post-incapacidad.",
    periodicidad: "N/A - Norma derogada",
    entidadEmisora: "Ministerio de la Protección Social",
    fechaEmision: "2007-07-11",
    descripcion: "DEROGADA. Regulaba la práctica de evaluaciones médicas ocupacionales. Reemplazada por Resolución 1843 de 2025 desde octubre 2025."
  },
  
  // CAPACITACIÓN
  {
    codigo: "Resolución 4927 de 2016",
    titulo: "Prevención y Promoción de Riesgos Laborales",
    categoria: "capacitacion",
    obligaciones: "Capacitar a trabajadores en prevención de riesgos y promoción de la salud",
    periodicidad: "Anual mínimo, según programa de capacitación",
    entidadEmisora: "Ministerio del Trabajo",
    fechaEmision: "2016-11-23",
    descripcion: "Reglamenta las actividades de prevención y promoción en SST"
  },
  
  // SEGURIDAD VIAL (PESV)
  {
    codigo: "Resolución 1565 de 2014",
    titulo: "Plan Estratégico de Seguridad Vial (PESV)",
    categoria: "seguridad-vial",
    obligaciones: "Diseñar e implementar el Plan Estratégico de Seguridad Vial para empresas con vehículos",
    periodicidad: "Permanente, reportes anuales",
    entidadEmisora: "Ministerio de Transporte",
    fechaEmision: "2014-06-06",
    descripcion: "Obliga a empresas con flota vehicular a implementar PESV"
  },
  {
    codigo: "Resolución 20223040040595 de 2022",
    titulo: "Actualización PESV 2022",
    categoria: "seguridad-vial",
    obligaciones: "Actualizar el PESV con los nuevos criterios y metodología establecidos",
    periodicidad: "Permanente, autoevaluación anual",
    entidadEmisora: "Ministerio de Transporte",
    fechaEmision: "2022-11-04",
    descripcion: "Actualiza los requisitos del PESV para empresas"
  },
  
  // TRABAJO EN ALTURAS
  {
    codigo: "Resolución 4272 de 2021",
    titulo: "Trabajo Seguro en Alturas",
    categoria: "trabajo-alturas",
    obligaciones: "Implementar el Programa de Prevención y Protección contra Caídas para trabajo en alturas",
    periodicidad: "Permanente, certificación cada 2 años",
    entidadEmisora: "Ministerio del Trabajo",
    fechaEmision: "2021-12-01",
    descripcion: "Reglamenta el trabajo en alturas y reemplaza la Resolución 1409 de 2012"
  },
  
  // RIESGO PSICOSOCIAL
  {
    codigo: "Resolución 2404 de 2019",
    titulo: "Batería de Instrumentos para Evaluación de Factores de Riesgo Psicosocial",
    categoria: "riesgo-psicosocial",
    obligaciones: "Evaluar factores de riesgo psicosocial y diseñar programas de intervención",
    periodicidad: "Cada 2 años o cuando cambien condiciones",
    entidadEmisora: "Ministerio del Trabajo",
    fechaEmision: "2019-07-22",
    descripcion: "Adopta la batería de instrumentos para evaluar riesgo psicosocial"
  },
  {
    codigo: "Resolución 2646 de 2008",
    titulo: "Factores de Riesgo Psicosocial en el Trabajo",
    categoria: "riesgo-psicosocial",
    obligaciones: "Identificar, evaluar, prevenir, intervenir y monitorear la exposición a factores de riesgo psicosocial",
    periodicidad: "Evaluación cada 2 años mínimo",
    entidadEmisora: "Ministerio de la Protección Social",
    fechaEmision: "2008-07-17",
    descripcion: "Establece disposiciones sobre factores de riesgo psicosocial"
  },
  {
    codigo: "Ley 1010 de 2006",
    titulo: "Acoso Laboral",
    categoria: "riesgo-psicosocial",
    obligaciones: "Prevenir, corregir y sancionar el acoso laboral en las relaciones de trabajo",
    periodicidad: "Permanente",
    entidadEmisora: "Congreso de Colombia",
    fechaEmision: "2006-01-23",
    descripcion: "Medidas para prevenir, corregir y sancionar el acoso laboral"
  },
  
  // PLAN DE EMERGENCIAS
  {
    codigo: "Resolución 1016 de 1989",
    titulo: "Programa de Salud Ocupacional",
    categoria: "emergencias",
    obligaciones: "Organizar y desarrollar un Plan de Emergencias",
    periodicidad: "Actualización anual, simulacros periódicos",
    entidadEmisora: "Ministerio del Trabajo",
    fechaEmision: "1989-03-31",
    descripcion: "Reglamenta la organización, funcionamiento y forma de los Programas de Salud Ocupacional"
  },
  
  // SUSTANCIAS QUÍMICAS
  {
    codigo: "Decreto 1496 de 2018",
    titulo: "Sistema Globalmente Armonizado (SGA)",
    categoria: "sustancias-quimicas",
    obligaciones: "Implementar el SGA para clasificación y etiquetado de productos químicos",
    periodicidad: "Permanente",
    entidadEmisora: "Ministerio del Trabajo",
    fechaEmision: "2018-08-06",
    descripcion: "Adopta el Sistema Globalmente Armonizado de Clasificación y Etiquetado de Productos Químicos"
  },
  
  // HIGIENE INDUSTRIAL
  {
    codigo: "Resolución 2400 de 1979",
    titulo: "Estatuto de Seguridad Industrial",
    categoria: "higiene-industrial",
    obligaciones: "Cumplir disposiciones sobre vivienda, higiene y seguridad en establecimientos de trabajo",
    periodicidad: "Permanente",
    entidadEmisora: "Ministerio del Trabajo",
    fechaEmision: "1979-05-22",
    descripcion: "Establece disposiciones sobre vivienda, higiene y seguridad en los lugares de trabajo"
  },
  
  // ESPACIOS CONFINADOS
  {
    codigo: "Resolución 0491 de 2020",
    titulo: "Trabajo Seguro en Espacios Confinados",
    categoria: "espacios-confinados",
    obligaciones: "Implementar procedimientos de trabajo seguro en espacios confinados",
    periodicidad: "Permanente, permisos por ingreso",
    entidadEmisora: "Ministerio del Trabajo",
    fechaEmision: "2020-03-24",
    descripcion: "Reglamenta los criterios para el trabajo en espacios confinados"
  },
  
  // SEGURIDAD ELÉCTRICA
  {
    codigo: "Resolución 5018 de 2019",
    titulo: "Reglamento de Seguridad en Instalaciones Eléctricas - RETIE",
    categoria: "seguridad-electrica",
    obligaciones: "Cumplir con el Reglamento Técnico de Instalaciones Eléctricas en todas las actividades",
    periodicidad: "Permanente, inspecciones periódicas",
    entidadEmisora: "Ministerio de Minas y Energía",
    fechaEmision: "2019-12-30",
    descripcion: "Actualiza el RETIE para instalaciones eléctricas"
  },
  
  // PREVENCIÓN DE INCENDIOS
  {
    codigo: "Resolución 0256 de 2014",
    titulo: "Reglamento de Seguridad Contra Incendios",
    categoria: "prevencion-incendios",
    obligaciones: "Implementar medidas de prevención, control y mitigación de incendios",
    periodicidad: "Permanente, inspecciones anuales",
    entidadEmisora: "Ministerio del Interior",
    fechaEmision: "2014-02-14",
    descripcion: "Reglamenta las medidas de seguridad contra incendios en edificaciones"
  },
  
  // REPORTE DE ACCIDENTES
  {
    codigo: "Decreto 1530 de 1996",
    titulo: "Reglamentación Accidente de Trabajo y Enfermedad Profesional",
    categoria: "investigacion-incidentes",
    obligaciones: "Reportar accidentes de trabajo graves y mortales a la ARL y Ministerio del Trabajo",
    periodicidad: "Inmediato (48 horas)",
    entidadEmisora: "Ministerio del Trabajo",
    fechaEmision: "1996-08-26",
    descripcion: "Reglamenta la afiliación, cotización y reporte de accidentes"
  },
  
  // NUEVAS NORMAS 2024-2025
  {
    codigo: "Decreto 676 de 2020",
    titulo: "Trabajo en Casa y Teletrabajo",
    categoria: "sistema-gestion",
    obligaciones: "Establecer protocolos de SST para trabajadores en casa y teletrabajo",
    periodicidad: "Permanente",
    entidadEmisora: "Ministerio del Trabajo",
    fechaEmision: "2020-05-19",
    descripcion: "Reglamenta el trabajo en casa durante emergencia sanitaria y su implementación"
  },
  {
    codigo: "Resolución 666 de 2020",
    titulo: "Protocolo de Bioseguridad COVID-19",
    categoria: "sistema-gestion",
    obligaciones: "Implementar protocolo general de bioseguridad para mitigación del COVID-19",
    periodicidad: "Permanente mientras esté vigente",
    entidadEmisora: "Ministerio de Salud",
    fechaEmision: "2020-04-24",
    descripcion: "Medidas de bioseguridad para sectores productivos"
  },
  {
    codigo: "Ley 1562 de 2012",
    titulo: "Modificación del Sistema de Riesgos Laborales",
    categoria: "sistema-gestion",
    obligaciones: "Cumplir disposiciones sobre SG-SST y afiliación al Sistema de Riesgos Laborales",
    periodicidad: "Permanente",
    entidadEmisora: "Congreso de Colombia",
    fechaEmision: "2012-07-11",
    descripcion: "Modifica el Sistema de Riesgos Laborales y dicta otras disposiciones en materia de SST"
  },
  {
    codigo: "Decreto 723 de 2013",
    titulo: "Afiliación al Sistema de Riesgos Laborales",
    categoria: "sistema-gestion",
    obligaciones: "Afiliar a trabajadores independientes de alto riesgo al Sistema de Riesgos Laborales",
    periodicidad: "Al inicio de cada contrato",
    entidadEmisora: "Ministerio del Trabajo",
    fechaEmision: "2013-04-15",
    descripcion: "Reglamenta la afiliación de trabajadores independientes"
  },
  
  // COMITÉ DE CONVIVENCIA LABORAL
  {
    codigo: "Resolución 3461 de 2025",
    titulo: "Comité de Convivencia Laboral - Nueva Normativa",
    categoria: "comites-sst",
    obligaciones: "Conformar Comité de Convivencia Laboral (CCL) por centro de trabajo. Composición según tamaño: <5 trabajadores (1+1 sin suplentes), 5-20 (1+1 con suplentes), >20 (2+2 con suplentes). Garantizar paridad de género. Integrar al SG-SST. Plazo máximo 65 días para resolver quejas. Reportes semestrales (entidades públicas) y anuales (todos). Usar plataformas electrónicas para gestión de quejas. Excluir casos de acoso sexual y violencia de género (vía diferente).",
    periodicidad: "Reuniones mínimo cada 3 meses o cuando se requiera por quejas",
    entidadEmisora: "Ministerio del Trabajo",
    fechaEmision: "2025-09-01",
    descripcion: "Nueva normativa para Comités de Convivencia Laboral. Deroga Resoluciones 652 y 1356 de 2012. Vigencia inmediata. Exige un CCL por centro de trabajo, integración con SG-SST, paridad de género y plataformas electrónicas. Publicada en Diario Oficial 53.240 del 11 de septiembre de 2025."
  },
  {
    codigo: "Resolución 652 de 2012",
    titulo: "Comité de Convivencia Laboral (DEROGADA)",
    categoria: "comites-sst",
    obligaciones: "DEROGADA por Resolución 3461 de 2025. Anteriormente regulaba conformación y funcionamiento del Comité de Convivencia Laboral.",
    periodicidad: "N/A - Norma derogada",
    entidadEmisora: "Ministerio del Trabajo",
    fechaEmision: "2012-04-30",
    descripcion: "DEROGADA. Definía conformación y funcionamiento de Comités de Convivencia Laboral. Reemplazada por Resolución 3461 de 2025 desde septiembre 2025."
  },
  {
    codigo: "Resolución 1356 de 2012",
    titulo: "Modificación Comité de Convivencia (DEROGADA)",
    categoria: "comites-sst",
    obligaciones: "DEROGADA por Resolución 3461 de 2025. Anteriormente modificaba artículos de la Resolución 652 de 2012.",
    periodicidad: "N/A - Norma derogada",
    entidadEmisora: "Ministerio del Trabajo",
    fechaEmision: "2012-07-18",
    descripcion: "DEROGADA. Modificaba artículos de la Resolución 652 de 2012. Reemplazada por Resolución 3461 de 2025 desde septiembre 2025."
  },
  
  // SEGURIDAD VIAL - PESV ACTUALIZADO
  {
    codigo: "Ley 1503 de 2011",
    titulo: "Responsabilidad Social Empresarial en Seguridad Vial",
    categoria: "seguridad-vial",
    obligaciones: "Promover la formación en seguridad vial a empleados y contratistas que conducen",
    periodicidad: "Anual",
    entidadEmisora: "Congreso de Colombia",
    fechaEmision: "2011-12-29",
    descripcion: "Promueve la formación de hábitos, comportamientos y conductas seguros en la vía"
  },
  {
    codigo: "Resolución 1231 de 2016",
    titulo: "Actualización PESV",
    categoria: "seguridad-vial",
    obligaciones: "Ajustar el PESV según criterios actualizados de gestión de riesgo vial",
    periodicidad: "Permanente, autoevaluación anual",
    entidadEmisora: "Ministerio de Transporte",
    fechaEmision: "2016-07-27",
    descripcion: "Actualiza la Resolución 1565 de 2014 sobre PESV"
  },
  
  // ELEMENTOS DE PROTECCIÓN PERSONAL
  {
    codigo: "Resolución 2400 de 1979 - Art. 176-201",
    titulo: "Elementos de Protección Personal",
    categoria: "seguridad-industrial",
    obligaciones: "Suministrar EPP adecuados según riesgos identificados y capacitar en su uso",
    periodicidad: "Según desgaste y necesidad",
    entidadEmisora: "Ministerio del Trabajo",
    fechaEmision: "1979-05-22",
    descripcion: "Establece obligaciones sobre suministro y uso de EPP"
  },
  
  // CAPACITACIÓN EN SST
  {
    codigo: "Decreto 1443 de 2014",
    titulo: "SG-SST Decreto original (Derogado por 1072/2015)",
    categoria: "capacitacion",
    obligaciones: "Capacitación inicial y continua del COPASST, brigada y trabajadores",
    periodicidad: "Anual mínimo",
    entidadEmisora: "Ministerio del Trabajo",
    fechaEmision: "2014-07-31",
    descripcion: "Primer decreto del SG-SST, ahora incorporado en Decreto 1072/2015"
  },
  {
    codigo: "Resolución 4502 de 2012",
    titulo: "Prevención de Riesgos por Estrés Térmico",
    categoria: "higiene-industrial",
    obligaciones: "Prevenir y controlar exposición a estrés térmico en ambientes laborales",
    periodicidad: "Mediciones periódicas según exposición",
    entidadEmisora: "Ministerio del Trabajo",
    fechaEmision: "2012-12-28",
    descripcion: "Reglamenta procedimientos de prevención de riesgos por estrés térmico"
  },
  
  // CONSTRUCCIÓN
  {
    codigo: "Resolución 1409 de 2012 (Derogada)",
    titulo: "Trabajo en Alturas - Versión Anterior",
    categoria: "trabajo-alturas",
    obligaciones: "NORMA DEROGADA - Ver Resolución 4272 de 2021",
    periodicidad: "N/A - Derogada",
    entidadEmisora: "Ministerio del Trabajo",
    fechaEmision: "2012-07-23",
    descripcion: "Derogada por Resolución 4272 de 2021"
  },
  {
    codigo: "Resolución 1178 de 2017",
    titulo: "Licencias en Seguridad y Salud en el Trabajo",
    categoria: "sistema-gestion",
    obligaciones: "Obtener licencia SST si se prestan servicios como consultor o asesor en SST",
    periodicidad: "Renovación cada 4 años",
    entidadEmisora: "Ministerio del Trabajo",
    fechaEmision: "2017-04-28",
    descripcion: "Requisitos para obtener licencia para prestadores de servicios SST"
  },
  
  // SUSTANCIAS PELIGROSAS
  {
    codigo: "Ley 55 de 1993",
    titulo: "Convenio 170 OIT - Seguridad en Uso de Productos Químicos",
    categoria: "sustancias-quimicas",
    obligaciones: "Implementar medidas de seguridad en producción, manejo y uso de sustancias químicas",
    periodicidad: "Permanente",
    entidadEmisora: "Congreso de Colombia",
    fechaEmision: "1993-07-02",
    descripcion: "Aprueba el Convenio 170 de la OIT sobre productos químicos"
  },
  {
    codigo: "Decreto 1609 de 2002",
    titulo: "Transporte de Mercancías Peligrosas",
    categoria: "sustancias-quimicas",
    obligaciones: "Cumplir requisitos para transporte terrestre automotor de mercancías peligrosas",
    periodicidad: "Cada transporte",
    entidadEmisora: "Ministerio de Transporte",
    fechaEmision: "2002-07-31",
    descripcion: "Reglamenta el manejo y transporte terrestre de mercancías peligrosas"
  },
  
  // RADIACIONES
  {
    codigo: "Resolución 2400 de 1979 - Título III Cap. II",
    titulo: "Radiaciones Ionizantes y No Ionizantes",
    categoria: "higiene-industrial",
    obligaciones: "Proteger trabajadores expuestos a radiaciones ionizantes y no ionizantes",
    periodicidad: "Mediciones periódicas según exposición",
    entidadEmisora: "Ministerio del Trabajo",
    fechaEmision: "1979-05-22",
    descripcion: "Normas sobre protección contra radiaciones"
  },
  
  // RUIDO Y VIBRACIONES
  {
    codigo: "Resolución 8321 de 1983",
    titulo: "Protección y Conservación de la Audición",
    categoria: "higiene-industrial",
    obligaciones: "Implementar programa de conservación auditiva en ambientes con ruido",
    periodicidad: "Audiometrías anuales a expuestos",
    entidadEmisora: "Ministerio de Salud",
    fechaEmision: "1983-08-04",
    descripcion: "Normas sobre protección y conservación de la audición por ruido ocupacional"
  },
  
  // ERGONOMÍA
  {
    codigo: "Resolución 2844 de 2007",
    titulo: "Guías de Atención Integral Basadas en Evidencia",
    categoria: "medicina-trabajo",
    obligaciones: "Aplicar las GATISO para prevención de desórdenes músculo-esqueléticos",
    periodicidad: "Permanente",
    entidadEmisora: "Ministerio de la Protección Social",
    fechaEmision: "2007-08-16",
    descripcion: "Adopta las Guías de Atención Integral en Salud Ocupacional"
  },
  
  // SANCIONES Y MULTAS
  {
    codigo: "Ley 1610 de 2013",
    titulo: "Sanciones Seguridad y Salud en el Trabajo",
    categoria: "sistema-gestion",
    obligaciones: "Cumplir normativa SST para evitar multas hasta 1000 SMLMV",
    periodicidad: "Permanente",
    entidadEmisora: "Congreso de Colombia",
    fechaEmision: "2013-01-02",
    descripcion: "Reglamenta aspectos de inspección, vigilancia y control del trabajo"
  },
  
  // CONTRATISTAS
  {
    codigo: "Decreto 1072 de 2015 - Art. 2.2.4.6.2",
    titulo: "Obligaciones del Contratante en SST",
    categoria: "sistema-gestion",
    obligaciones: "Verificar afiliación y cumplimiento SST de contratistas y subcontratistas",
    periodicidad: "Antes de cada contrato",
    entidadEmisora: "Ministerio del Trabajo",
    fechaEmision: "2015-05-26",
    descripcion: "Obligaciones en SST para contratación de personal"
  },
  
  // TELETRABAJO
  {
    codigo: "Ley 1221 de 2008",
    titulo: "Teletrabajo",
    categoria: "sistema-gestion",
    obligaciones: "Garantizar condiciones de SST para trabajadores en modalidad de teletrabajo",
    periodicidad: "Permanente",
    entidadEmisora: "Congreso de Colombia",
    fechaEmision: "2008-07-16",
    descripcion: "Normas para promover y regular el teletrabajo"
  },
  {
    codigo: "Decreto 884 de 2012",
    titulo: "Reglamentación Teletrabajo",
    categoria: "sistema-gestion",
    obligaciones: "Cumplir obligaciones de SST en teletrabajo según reglamentación",
    periodicidad: "Permanente",
    entidadEmisora: "Ministerio del Trabajo",
    fechaEmision: "2012-04-30",
    descripcion: "Reglamenta la Ley 1221 de 2008 sobre teletrabajo"
  },
  
  // SECTOR SALUD
  {
    codigo: "Resolución 1441 de 2013",
    titulo: "Gestión de Residuos Peligrosos en Sector Salud",
    categoria: "sustancias-quimicas",
    obligaciones: "Gestión integral de residuos generados en atención en salud",
    periodicidad: "Permanente",
    entidadEmisora: "Ministerio de Salud",
    fechaEmision: "2013-05-06",
    descripcion: "Establece procedimientos de gestión de residuos hospitalarios"
  },
  
  // AGRICULTURA
  {
    codigo: "Decreto 1843 de 1991",
    titulo: "Uso y Manejo de Plaguicidas",
    categoria: "sustancias-quimicas",
    obligaciones: "Cumplir normas de seguridad en uso, transporte y almacenamiento de plaguicidas",
    periodicidad: "Permanente",
    entidadEmisora: "Ministerio de Salud",
    fechaEmision: "1991-07-22",
    descripcion: "Reglamenta parcialmente los títulos III, V, VI, VII y XI de la Ley 09 de 1979"
  }
];

// Función para buscar una norma por código
export function getNormaByCodigo(codigo: string): NormaPredefinida | undefined {
  return normasColombianasSST.find(norma => norma.codigo === codigo);
}

// Función para obtener todas las normas de una categoría
export function getNormasByCategoria(categoria: string): NormaPredefinida[] {
  return normasColombianasSST.filter(norma => norma.categoria === categoria);
}

// Función para obtener la lista de códigos de normas
export function getCodigosNormas(): string[] {
  return normasColombianasSST.map(norma => norma.codigo);
}
