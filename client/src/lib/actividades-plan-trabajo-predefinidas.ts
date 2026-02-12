type Mes = "enero" | "febrero" | "marzo" | "abril" | "mayo" | "junio" | "julio" | "agosto" | "septiembre" | "octubre" | "noviembre" | "diciembre";
type CicloPHVA = "planear" | "hacer" | "verificar" | "actuar";
type ProgramaSST = "identificacion-peligros" | "medicina-preventiva" | "higiene-seguridad" | "riesgo-psicosocial" | "seguridad-vial" | "emergencias" | "vigilancia-epidemiologica" | "capacitacion" | "inspeccion" | "epp" | "otro";

export interface ActividadPredefinida {
  ciclo: CicloPHVA;
  programa: ProgramaSST;
  actividad: string;
  objetivo: string;
  meta: string;
  indicador: string;
  mesesSugeridos: Mes[];
  cargo: string;
  baseNormativa?: string;
}

export const ACTIVIDADES_PLAN_TRABAJO_SST: ActividadPredefinida[] = [
  // ==================== I. PLANEAR (25 actividades) ====================
  {
    ciclo: "planear",
    programa: "otro",
    actividad: "Aplicación de Estándares Mínimos de SG-SST (Resolución 0312/2019)",
    objetivo: "Verificar el cumplimiento de los estándares mínimos del SG-SST",
    meta: "100% de estándares evaluados",
    indicador: "(Estándares cumplidos / Total estándares) × 100",
    mesesSugeridos: ["enero"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Resolución 0312/2019, Art. 3"
  },
  {
    ciclo: "planear",
    programa: "otro",
    actividad: "Publicación y Socialización de la Política de SST",
    objetivo: "Divulgar la política de SST a todos los trabajadores",
    meta: "100% de trabajadores informados",
    indicador: "(Trabajadores socializados / Total trabajadores) × 100",
    mesesSugeridos: ["enero"],
    cargo: "COPASST",
    baseNormativa: "Decreto 1072/2015, Art. 2.2.4.6.5"
  },
  {
    ciclo: "planear",
    programa: "identificacion-peligros",
    actividad: "Actualización de la Matriz de Identificación de Peligros, Evaluación y Valoración de Riesgos (IPERC)",
    objetivo: "Identificar y valorar los peligros y riesgos presentes en las actividades laborales según metodología actualizada",
    meta: "100% de áreas de trabajo evaluadas",
    indicador: "(Áreas evaluadas / Total áreas) × 100",
    mesesSugeridos: ["agosto"],
    cargo: "COPASST",
    baseNormativa: "Decreto 1072/2015, Art. 2.2.4.6.15; GTC-45; Resolución 2607/2024"
  },
  {
    ciclo: "planear",
    programa: "otro",
    actividad: "Definición de Indicadores de Gestión SST",
    objetivo: "Establecer indicadores de estructura, proceso y resultado",
    meta: "3 tipos de indicadores definidos",
    indicador: "Indicadores definidos / 3 × 100",
    mesesSugeridos: ["enero", "agosto"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Decreto 1072/2015, Art. 2.2.4.6.19-22"
  },
  {
    ciclo: "planear",
    programa: "otro",
    actividad: "Documentación de la Designación del Responsable del SG-SST",
    objetivo: "Formalizar el nombramiento del responsable del sistema",
    meta: "Acta de designación firmada",
    indicador: "Documento firmado (Sí/No)",
    mesesSugeridos: ["enero"],
    cargo: "Gerencia General",
    baseNormativa: "Decreto 1072/2015, Art. 2.2.4.6.8"
  },
  {
    ciclo: "planear",
    programa: "otro",
    actividad: "Documentación de Responsabilidades Específicas en SST",
    objetivo: "Definir responsabilidades de SST para cada nivel de la organización",
    meta: "Manual de responsabilidades actualizado",
    indicador: "Documento actualizado (Sí/No)",
    mesesSugeridos: ["enero"],
    cargo: "Gerencia General",
    baseNormativa: "Decreto 1072/2015, Art. 2.2.4.6.8"
  },
  {
    ciclo: "planear",
    programa: "capacitacion",
    actividad: "Verificar Certificación del Curso Virtual de 50 Horas en SST",
    objetivo: "Asegurar que el responsable del SG-SST cuente con la certificación requerida",
    meta: "Certificado vigente verificado",
    indicador: "Certificado válido (Sí/No)",
    mesesSugeridos: ["enero"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Resolución 4927/2016"
  },
  {
    ciclo: "planear",
    programa: "otro",
    actividad: "Actualización de la Matriz de Requisitos Legales",
    objetivo: "Mantener actualizada la normatividad aplicable en SST",
    meta: "Matriz actualizada con normatividad vigente",
    indicador: "Normas actualizadas / Total normas aplicables × 100",
    mesesSugeridos: ["septiembre"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Decreto 1072/2015, Art. 2.2.4.6.8"
  },
  {
    ciclo: "planear",
    programa: "otro",
    actividad: "Conformación del Comité Paritario de Seguridad y Salud en el Trabajo (COPASST)",
    objetivo: "Conformar o actualizar el COPASST según normatividad",
    meta: "COPASST legalmente constituido",
    indicador: "Acta de conformación (Sí/No)",
    mesesSugeridos: ["enero", "julio"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Decreto 1072/2015, Art. 2.2.4.1.4"
  },
  {
    ciclo: "planear",
    programa: "otro",
    actividad: "Actas de Reuniones Mensuales del COPASST",
    objetivo: "Documentar las reuniones mensuales del comité",
    meta: "12 actas anuales",
    indicador: "(Reuniones realizadas / 12) × 100",
    mesesSugeridos: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
    cargo: "COPASST",
    baseNormativa: "Resolución 2013/1986"
  },
  {
    ciclo: "planear",
    programa: "capacitacion",
    actividad: "Capacitación al Comité COPASST",
    objetivo: "Formar a los miembros del COPASST en sus funciones",
    meta: "100% de miembros capacitados",
    indicador: "(Miembros capacitados / Total miembros) × 100",
    mesesSugeridos: ["enero", "julio"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Resolución 2013/1986, Art. 11"
  },
  {
    ciclo: "planear",
    programa: "riesgo-psicosocial",
    actividad: "Conformación del Comité de Convivencia Laboral",
    objetivo: "Conformar el comité según normatividad vigente",
    meta: "CCL legalmente constituido",
    indicador: "Acta de conformación (Sí/No)",
    mesesSugeridos: ["enero", "julio"],
    cargo: "Gerencia - COPASST",
    baseNormativa: "Resolución 652/2012"
  },
  {
    ciclo: "planear",
    programa: "riesgo-psicosocial",
    actividad: "Actas de Reuniones del Comité de Convivencia Laboral",
    objetivo: "Documentar las reuniones trimestrales del comité",
    meta: "4 actas trimestrales",
    indicador: "(Reuniones realizadas / 4) × 100",
    mesesSugeridos: ["marzo", "junio", "septiembre", "diciembre"],
    cargo: "CCL",
    baseNormativa: "Resolución 652/2012"
  },
  {
    ciclo: "planear",
    programa: "capacitacion",
    actividad: "Capacitación al Comité de Convivencia Laboral",
    objetivo: "Formar a los miembros del CCL en sus funciones",
    meta: "100% de miembros capacitados",
    indicador: "(Miembros capacitados / Total miembros) × 100",
    mesesSugeridos: ["enero", "julio"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Resolución 652/2012"
  },
  {
    ciclo: "planear",
    programa: "higiene-seguridad",
    actividad: "Diseño y Publicación del Reglamento de Higiene y Seguridad Industrial",
    objetivo: "Establecer normas internas de higiene y seguridad",
    meta: "Reglamento publicado y socializado",
    indicador: "Reglamento vigente (Sí/No)",
    mesesSugeridos: ["enero", "septiembre"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Ley 9/1979; Decreto 1072/2015"
  },
  {
    ciclo: "planear",
    programa: "capacitacion",
    actividad: "Diseño del Programa de Capacitación y Entrenamiento SST",
    objetivo: "Planificar las capacitaciones anuales en SST",
    meta: "Programa aprobado con cronograma",
    indicador: "Programa documentado (Sí/No)",
    mesesSugeridos: ["enero"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Decreto 1072/2015, Art. 2.2.4.6.11"
  },
  {
    ciclo: "planear",
    programa: "capacitacion",
    actividad: "Verificar Certificación de Capacitación de Miembros COPASST y CCL",
    objetivo: "Asegurar formación certificada del personal de comités",
    meta: "100% certificados verificados",
    indicador: "(Certificados válidos / Total requeridos) × 100",
    mesesSugeridos: ["enero", "agosto"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Resolución 4927/2016"
  },
  {
    ciclo: "planear",
    programa: "otro",
    actividad: "Diseño e Implementación del Plan de Comunicaciones SST",
    objetivo: "Establecer mecanismos de comunicación en SST",
    meta: "Plan de comunicaciones implementado",
    indicador: "Comunicaciones realizadas / Comunicaciones programadas × 100",
    mesesSugeridos: ["enero", "febrero"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Decreto 1072/2015, Art. 2.2.4.6.14"
  },
  {
    ciclo: "planear",
    programa: "otro",
    actividad: "Procedimiento de Compras con Criterios SST",
    objetivo: "Incluir criterios de SST en el proceso de compras",
    meta: "Procedimiento documentado e implementado",
    indicador: "Procedimiento implementado (Sí/No)",
    mesesSugeridos: ["febrero"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Decreto 1072/2015, Art. 2.2.4.6.27"
  },
  {
    ciclo: "planear",
    programa: "otro",
    actividad: "Procedimiento de Evaluación y Selección de Proveedores/Contratistas",
    objetivo: "Evaluar proveedores con criterios de SST",
    meta: "100% proveedores críticos evaluados",
    indicador: "(Proveedores evaluados / Total proveedores críticos) × 100",
    mesesSugeridos: ["febrero"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Decreto 1072/2015, Art. 2.2.4.6.28"
  },
  {
    ciclo: "planear",
    programa: "otro",
    actividad: "Procedimiento de Gestión del Cambio",
    objetivo: "Evaluar impacto de cambios en SST",
    meta: "Procedimiento documentado e implementado",
    indicador: "Cambios evaluados / Total cambios × 100",
    mesesSugeridos: ["marzo"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Decreto 1072/2015, Art. 2.2.4.6.26"
  },
  {
    ciclo: "planear",
    programa: "otro",
    actividad: "Inclusión del SG-SST en la Tabla de Retención Documental",
    objetivo: "Organizar la documentación del SG-SST",
    meta: "TRD actualizada con documentos SST",
    indicador: "TRD actualizada (Sí/No)",
    mesesSugeridos: ["marzo"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Decreto 1072/2015, Art. 2.2.4.6.12"
  },
  {
    ciclo: "planear",
    programa: "inspeccion",
    actividad: "Diseño del Programa de Inspecciones de Seguridad",
    objetivo: "Planificar inspecciones periódicas de seguridad",
    meta: "Programa de inspecciones documentado",
    indicador: "Programa aprobado (Sí/No)",
    mesesSugeridos: ["febrero"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Decreto 1072/2015, Art. 2.2.4.6.24"
  },
  {
    ciclo: "planear",
    programa: "otro",
    actividad: "Diseño del Procedimiento del SG-SST",
    objetivo: "Documentar el procedimiento general del sistema",
    meta: "Procedimiento documentado y aprobado",
    indicador: "Procedimiento implementado (Sí/No)",
    mesesSugeridos: ["enero"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Decreto 1072/2015, Art. 2.2.4.6.12"
  },

  // ==================== II. HACER (26 actividades) ====================
  {
    ciclo: "hacer",
    programa: "medicina-preventiva",
    actividad: "Exámenes Médicos Ocupacionales Periódicos",
    objetivo: "Realizar exámenes periódicos a todos los trabajadores (mínimo cada 3 años; mayor frecuencia para riesgos altos)",
    meta: "100% de trabajadores con examen periódico vigente",
    indicador: "(Trabajadores examinados / Total trabajadores) × 100",
    mesesSugeridos: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Resolución 2346/2007; Resolución 1843/2025"
  },
  {
    ciclo: "hacer",
    programa: "medicina-preventiva",
    actividad: "Elaboración del Profesiograma",
    objetivo: "Definir requisitos de salud por cargo",
    meta: "Profesiograma para todos los cargos",
    indicador: "(Cargos con profesiograma / Total cargos) × 100",
    mesesSugeridos: ["febrero"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Resolución 2346/2007"
  },
  {
    ciclo: "hacer",
    programa: "medicina-preventiva",
    actividad: "Caracterización de Condiciones de Salud de los Trabajadores",
    objetivo: "Analizar el estado de salud de la población trabajadora",
    meta: "Informe de condiciones de salud elaborado",
    indicador: "Informe actualizado (Sí/No)",
    mesesSugeridos: ["marzo"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Decreto 1072/2015, Art. 2.2.4.6.12"
  },
  {
    ciclo: "hacer",
    programa: "medicina-preventiva",
    actividad: "Descripción Sociodemográfica de los Trabajadores",
    objetivo: "Caracterizar la población trabajadora",
    meta: "Perfil sociodemográfico actualizado",
    indicador: "Perfil actualizado (Sí/No)",
    mesesSugeridos: ["marzo"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Decreto 1072/2015, Art. 2.2.4.6.12"
  },
  {
    ciclo: "hacer",
    programa: "vigilancia-epidemiologica",
    actividad: "Implementación del Sistema de Vigilancia Epidemiológica (SVE)",
    objetivo: "Implementar SVE según riesgos prioritarios",
    meta: "SVE documentado e implementado",
    indicador: "Cobertura del SVE / Riesgos priorizados × 100",
    mesesSugeridos: ["abril", "octubre"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Decreto 1072/2015, Art. 2.2.4.6.12"
  },
  {
    ciclo: "hacer",
    programa: "medicina-preventiva",
    actividad: "Seguimiento de Exámenes Médicos (Ingreso, Periódicos, Retiro, Post-incapacidad, Reincorporación)",
    objetivo: "Controlar la realización de exámenes ocupacionales incluyendo post-incapacidad (>30 días) y reincorporación (>90 días ausencia no médica)",
    meta: "100% de exámenes registrados y al día",
    indicador: "(Exámenes realizados / Exámenes requeridos) × 100",
    mesesSugeridos: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Resolución 2346/2007; Resolución 1843/2025"
  },
  {
    ciclo: "hacer",
    programa: "vigilancia-epidemiologica",
    actividad: "Evaluación y Análisis de Estadísticas de Salud",
    objetivo: "Analizar indicadores de morbilidad y accidentalidad",
    meta: "Informe estadístico trimestral",
    indicador: "(Informes elaborados / 4) × 100",
    mesesSugeridos: ["marzo", "junio", "septiembre", "diciembre"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Decreto 1072/2015"
  },
  {
    ciclo: "hacer",
    programa: "medicina-preventiva",
    actividad: "Programa de Estilos de Vida Saludable",
    objetivo: "Promover hábitos saludables en los trabajadores",
    meta: "4 actividades de bienestar al año",
    indicador: "(Actividades realizadas / 4) × 100",
    mesesSugeridos: ["marzo", "junio", "septiembre", "diciembre"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Resolución 1016/1989"
  },
  {
    ciclo: "hacer",
    programa: "medicina-preventiva",
    actividad: "Registro y Seguimiento de Ausentismo Laboral",
    objetivo: "Controlar el ausentismo por causas de salud",
    meta: "Registro mensual de ausentismo",
    indicador: "Tasa de ausentismo mensual",
    mesesSugeridos: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Decreto 1072/2015"
  },
  {
    ciclo: "hacer",
    programa: "inspeccion",
    actividad: "Inspecciones de Seguridad: Extintores y Redes Contra Incendio",
    objetivo: "Verificar condiciones de equipos contra incendio",
    meta: "Inspecciones mensuales realizadas",
    indicador: "(Inspecciones realizadas / 12) × 100",
    mesesSugeridos: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
    cargo: "Responsable SG-SST",
    baseNormativa: "NFPA 10; Decreto 1072/2015"
  },
  {
    ciclo: "hacer",
    programa: "inspeccion",
    actividad: "Inspecciones de Seguridad: Botiquines y Elementos de Primeros Auxilios",
    objetivo: "Verificar dotación y vigencia de botiquines",
    meta: "Inspecciones trimestrales realizadas",
    indicador: "(Inspecciones realizadas / 4) × 100",
    mesesSugeridos: ["marzo", "junio", "septiembre", "diciembre"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Resolución 705/2007"
  },
  {
    ciclo: "hacer",
    programa: "inspeccion",
    actividad: "Inspecciones de Seguridad: Señalización y Demarcación",
    objetivo: "Verificar condiciones de señalización de seguridad",
    meta: "Inspecciones semestrales realizadas",
    indicador: "(Inspecciones realizadas / 2) × 100",
    mesesSugeridos: ["junio", "diciembre"],
    cargo: "Responsable SG-SST",
    baseNormativa: "NTC 1461; NTC 1931"
  },
  {
    ciclo: "hacer",
    programa: "epp",
    actividad: "Elaboración de la Matriz de Elementos de Protección Personal",
    objetivo: "Definir EPP requeridos por cargo y riesgo",
    meta: "Matriz de EPP documentada",
    indicador: "Matriz actualizada (Sí/No)",
    mesesSugeridos: ["febrero"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Decreto 1072/2015, Art. 2.2.4.6.24"
  },
  {
    ciclo: "hacer",
    programa: "epp",
    actividad: "Entrega y Registro de Elementos de Protección Personal",
    objetivo: "Suministrar EPP a todos los trabajadores",
    meta: "100% de trabajadores con EPP entregados",
    indicador: "(Trabajadores con EPP / Total trabajadores) × 100",
    mesesSugeridos: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Resolución 2400/1979"
  },
  {
    ciclo: "hacer",
    programa: "epp",
    actividad: "Inspecciones de Elementos de Protección Personal",
    objetivo: "Verificar uso y estado de EPP",
    meta: "Inspecciones mensuales realizadas",
    indicador: "(Inspecciones realizadas / 12) × 100",
    mesesSugeridos: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Decreto 1072/2015"
  },
  {
    ciclo: "hacer",
    programa: "higiene-seguridad",
    actividad: "Control de Plagas: Registro de Fumigación",
    objetivo: "Mantener control sanitario de instalaciones",
    meta: "Fumigaciones programadas realizadas",
    indicador: "(Fumigaciones realizadas / Programadas) × 100",
    mesesSugeridos: ["marzo", "junio", "septiembre", "diciembre"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Ley 9/1979"
  },
  {
    ciclo: "hacer",
    programa: "emergencias",
    actividad: "Actualización del Análisis de Vulnerabilidad",
    objetivo: "Identificar amenazas y vulnerabilidades",
    meta: "Análisis de vulnerabilidad actualizado",
    indicador: "Análisis actualizado (Sí/No)",
    mesesSugeridos: ["marzo"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Decreto 1072/2015, Art. 2.2.4.6.25"
  },
  {
    ciclo: "hacer",
    programa: "emergencias",
    actividad: "Elaboración del Mapa de Riesgo de las Instalaciones",
    objetivo: "Identificar gráficamente los riesgos por área",
    meta: "Mapa de riesgo actualizado",
    indicador: "Mapa actualizado (Sí/No)",
    mesesSugeridos: ["abril"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Decreto 1072/2015"
  },
  {
    ciclo: "hacer",
    programa: "emergencias",
    actividad: "Actualización del Plan de Emergencias",
    objetivo: "Mantener actualizado el plan de preparación y respuesta",
    meta: "Plan de emergencias vigente",
    indicador: "Plan actualizado (Sí/No)",
    mesesSugeridos: ["febrero"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Decreto 1072/2015, Art. 2.2.4.6.25"
  },
  {
    ciclo: "hacer",
    programa: "emergencias",
    actividad: "Conformación de Brigadas de Emergencias",
    objetivo: "Organizar equipos de respuesta ante emergencias",
    meta: "Brigada conformada y documentada",
    indicador: "Brigada conformada (Sí/No)",
    mesesSugeridos: ["febrero"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Decreto 1072/2015, Art. 2.2.4.6.25"
  },
  {
    ciclo: "hacer",
    programa: "capacitacion",
    actividad: "Capacitación a Brigadas de Emergencias",
    objetivo: "Entrenar a los brigadistas en respuesta a emergencias",
    meta: "100% de brigadistas capacitados",
    indicador: "(Brigadistas capacitados / Total brigadistas) × 100",
    mesesSugeridos: ["marzo", "septiembre"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Decreto 1072/2015"
  },
  {
    ciclo: "hacer",
    programa: "emergencias",
    actividad: "Dotación de Brigadas de Emergencias",
    objetivo: "Suministrar equipos a los brigadistas",
    meta: "100% de brigadistas dotados",
    indicador: "(Brigadistas dotados / Total brigadistas) × 100",
    mesesSugeridos: ["marzo"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Decreto 1072/2015"
  },
  {
    ciclo: "hacer",
    programa: "emergencias",
    actividad: "Realización de Simulacros de Emergencia",
    objetivo: "Evaluar la respuesta ante situaciones de emergencia",
    meta: "2 simulacros anuales",
    indicador: "(Simulacros realizados / 2) × 100",
    mesesSugeridos: ["mayo", "noviembre"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Decreto 1072/2015, Art. 2.2.4.6.25"
  },
  {
    ciclo: "hacer",
    programa: "otro",
    actividad: "Instructivo para Reporte de Enfermedad Laboral",
    objetivo: "Establecer procedimiento de reporte de enfermedad laboral",
    meta: "Instructivo documentado y socializado",
    indicador: "Instructivo implementado (Sí/No)",
    mesesSugeridos: ["febrero"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Decreto 1072/2015, Art. 2.2.4.6.12"
  },
  {
    ciclo: "hacer",
    programa: "otro",
    actividad: "Instructivo para Notificación e Investigación de Accidentes",
    objetivo: "Establecer procedimiento de investigación de incidentes",
    meta: "Instructivo documentado y socializado",
    indicador: "Instructivo implementado (Sí/No)",
    mesesSugeridos: ["febrero"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Resolución 1401/2007"
  },
  {
    ciclo: "hacer",
    programa: "inspeccion",
    actividad: "Matriz de Seguimiento de Reporte de Actos y Condiciones Inseguras",
    objetivo: "Controlar el reporte y cierre de condiciones inseguras",
    meta: "100% de reportes con seguimiento",
    indicador: "(Reportes cerrados / Total reportes) × 100",
    mesesSugeridos: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Decreto 1072/2015"
  },

  // ==================== III. VERIFICAR (2 actividades) ====================
  {
    ciclo: "verificar",
    programa: "otro",
    actividad: "Definición y Seguimiento de Indicadores de Estructura, Proceso y Resultado",
    objetivo: "Monitorear el desempeño del SG-SST mediante indicadores",
    meta: "Indicadores medidos mensualmente",
    indicador: "(Indicadores medidos / Total indicadores) × 100",
    mesesSugeridos: ["enero", "marzo", "junio", "septiembre", "diciembre"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Decreto 1072/2015, Art. 2.2.4.6.19-22"
  },
  {
    ciclo: "verificar",
    programa: "otro",
    actividad: "Revisión por la Alta Dirección",
    objetivo: "Evaluar el desempeño del SG-SST por la gerencia",
    meta: "1 revisión anual documentada",
    indicador: "Revisión realizada (Sí/No)",
    mesesSugeridos: ["diciembre"],
    cargo: "Gerencia General",
    baseNormativa: "Decreto 1072/2015, Art. 2.2.4.6.31"
  },

  // ==================== IV. ACTUAR (3 actividades) ====================
  {
    ciclo: "actuar",
    programa: "otro",
    actividad: "Seguimiento a Programas del SG-SST",
    objetivo: "Verificar avance y cumplimiento de programas",
    meta: "Seguimiento mensual documentado",
    indicador: "(Seguimientos realizados / 12) × 100",
    mesesSugeridos: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Decreto 1072/2015, Art. 2.2.4.6.33"
  },
  {
    ciclo: "actuar",
    programa: "medicina-preventiva",
    actividad: "Seguimiento y Análisis del Ausentismo Laboral",
    objetivo: "Analizar tendencias de ausentismo y definir acciones",
    meta: "Informe mensual de ausentismo",
    indicador: "(Informes elaborados / 12) × 100",
    mesesSugeridos: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Decreto 1072/2015"
  },
  {
    ciclo: "actuar",
    programa: "otro",
    actividad: "Acciones Correctivas, Preventivas y de Mejora",
    objetivo: "Implementar mejoras basadas en hallazgos del SG-SST",
    meta: "100% de acciones cerradas en plazo",
    indicador: "(Acciones cerradas / Total acciones) × 100",
    mesesSugeridos: ["marzo", "junio", "septiembre", "diciembre"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Decreto 1072/2015, Art. 2.2.4.6.33-34"
  },

  // ==================== V. ACTIVIDADES COMPLEMENTARIAS NORMATIVAS (14 actividades) ====================
  // Agregadas para cumplimiento integral de Decreto 1072/2015, Resolución 0312/2019,
  // Resolución 2646/2008, Resolución 2764/2022, Resolución 2346/2007, Resolución 1401/2007, Ley 9/1979

  // --- PLANEAR ---
  {
    ciclo: "planear",
    programa: "otro",
    actividad: "Rendición de Cuentas del SG-SST",
    objetivo: "Informar a todos los niveles de la organización sobre el desempeño del SG-SST",
    meta: "1 rendición de cuentas anual documentada",
    indicador: "Rendición de cuentas realizada (Sí/No)",
    mesesSugeridos: ["diciembre"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Decreto 1072/2015, Art. 2.2.4.6.8; Resolución 0312/2019, Estándar 1.2.1"
  },

  // --- HACER ---
  {
    ciclo: "hacer",
    programa: "capacitacion",
    actividad: "Programa de Inducción y Reinducción en SST",
    objetivo: "Capacitar a trabajadores nuevos y actualizar conocimientos de los existentes en SST",
    meta: "100% de trabajadores con inducción/reinducción",
    indicador: "(Trabajadores inducidos / Total trabajadores nuevos) × 100",
    mesesSugeridos: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Decreto 1072/2015, Art. 2.2.4.6.11; Resolución 0312/2019, Estándar 1.1.6"
  },
  {
    ciclo: "hacer",
    programa: "higiene-seguridad",
    actividad: "Mediciones Ambientales e Higiénicas (Ruido, Iluminación, Temperatura, Químicos)",
    objetivo: "Realizar mediciones de agentes físicos, químicos y biológicos en el ambiente laboral",
    meta: "100% de áreas críticas con mediciones realizadas",
    indicador: "(Mediciones realizadas / Mediciones programadas) × 100",
    mesesSugeridos: ["abril", "octubre"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Resolución 0312/2019, Estándar 2.7.1; Decreto 1072/2015, Art. 2.2.4.6.24"
  },
  {
    ciclo: "hacer",
    programa: "medicina-preventiva",
    actividad: "Custodia y Archivo de Historias Clínicas Ocupacionales",
    objetivo: "Garantizar la custodia, confidencialidad y disponibilidad de las historias clínicas ocupacionales",
    meta: "100% de historias clínicas bajo custodia segura",
    indicador: "(HC custodiadas / Total HC) × 100",
    mesesSugeridos: ["enero", "julio"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Resolución 2346/2007, Art. 17; Resolución 0312/2019, Estándar 3.1.2"
  },
  {
    ciclo: "hacer",
    programa: "medicina-preventiva",
    actividad: "Seguimiento a Restricciones y Recomendaciones Médicas Laborales",
    objetivo: "Dar cumplimiento a las restricciones y recomendaciones emitidas por el médico ocupacional (implementar en máximo 20 días)",
    meta: "100% de restricciones implementadas dentro de 20 días",
    indicador: "(Restricciones cumplidas / Total restricciones) × 100",
    mesesSugeridos: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Resolución 0312/2019, Estándar 3.1.7; Decreto 1072/2015; Resolución 1843/2025"
  },
  {
    ciclo: "hacer",
    programa: "higiene-seguridad",
    actividad: "Verificación de Agua Potable, Servicios Sanitarios y Disposición de Basuras",
    objetivo: "Garantizar condiciones higiénicas básicas en los lugares de trabajo",
    meta: "Verificación semestral documentada",
    indicador: "(Verificaciones realizadas / 2) × 100",
    mesesSugeridos: ["marzo", "septiembre"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Ley 9/1979; Resolución 0312/2019, Estándar 3.2.2"
  },
  {
    ciclo: "hacer",
    programa: "higiene-seguridad",
    actividad: "Manejo y Eliminación de Residuos Sólidos, Líquidos y Gaseosos",
    objetivo: "Implementar procedimientos de manejo seguro de residuos generados en el trabajo",
    meta: "Plan de manejo de residuos implementado",
    indicador: "Plan implementado (Sí/No)",
    mesesSugeridos: ["febrero", "agosto"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Ley 9/1979; Resolución 0312/2019, Estándar 3.2.3"
  },
  {
    ciclo: "hacer",
    programa: "higiene-seguridad",
    actividad: "Elaboración de Procedimientos de Trabajo Seguro (Alturas, Espacios Confinados, Eléctricos, Caliente)",
    objetivo: "Documentar e implementar procedimientos para tareas de alto riesgo",
    meta: "100% de tareas críticas con procedimiento documentado",
    indicador: "(Procedimientos documentados / Tareas críticas identificadas) × 100",
    mesesSugeridos: ["febrero", "marzo"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Decreto 1072/2015, Art. 2.2.4.6.24; Resolución 4272/2021; Resolución 1409/2012; Resolución 0312/2019, Estándar 4.1.2"
  },
  {
    ciclo: "hacer",
    programa: "inspeccion",
    actividad: "Programa de Mantenimiento Preventivo de Instalaciones, Equipos y Herramientas",
    objetivo: "Garantizar el buen estado y funcionamiento de instalaciones y equipos",
    meta: "100% de mantenimientos programados ejecutados",
    indicador: "(Mantenimientos ejecutados / Mantenimientos programados) × 100",
    mesesSugeridos: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Resolución 0312/2019, Estándar 4.2.1; Decreto 1072/2015"
  },
  {
    ciclo: "hacer",
    programa: "higiene-seguridad",
    actividad: "Programa de Orden y Aseo (5S)",
    objetivo: "Mantener los lugares de trabajo organizados, limpios y seguros",
    meta: "Inspecciones mensuales de orden y aseo realizadas",
    indicador: "(Inspecciones realizadas / 12) × 100",
    mesesSugeridos: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Decreto 1072/2015; Resolución 2400/1979"
  },
  {
    ciclo: "hacer",
    programa: "riesgo-psicosocial",
    actividad: "Aplicación de la Batería de Riesgo Psicosocial y Programa de Intervención",
    objetivo: "Evaluar factores de riesgo psicosocial e implementar acciones de intervención",
    meta: "100% de trabajadores evaluados; programa de intervención implementado",
    indicador: "(Trabajadores evaluados / Total trabajadores) × 100",
    mesesSugeridos: ["abril", "mayo"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Resolución 2646/2008; Resolución 2764/2022; Decreto 1072/2015"
  },

  // --- VERIFICAR ---
  {
    ciclo: "verificar",
    programa: "otro",
    actividad: "Auditoría Interna Anual del SG-SST",
    objetivo: "Verificar el cumplimiento y eficacia del SG-SST mediante auditoría planificada",
    meta: "1 auditoría anual completa documentada",
    indicador: "Auditoría realizada (Sí/No); hallazgos documentados",
    mesesSugeridos: ["octubre", "noviembre"],
    cargo: "Auditor interno / Responsable SG-SST",
    baseNormativa: "Decreto 1072/2015, Art. 2.2.4.6.29-30; Resolución 0312/2019, Estándar 6.1.1"
  },
  {
    ciclo: "verificar",
    programa: "otro",
    actividad: "Investigación de Incidentes, Accidentes de Trabajo y Enfermedades Laborales",
    objetivo: "Investigar causas de los eventos de salud laboral y definir acciones correctivas",
    meta: "100% de eventos investigados dentro de los 15 días hábiles",
    indicador: "(Eventos investigados / Total eventos reportados) × 100",
    mesesSugeridos: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Resolución 1401/2007; Decreto 1072/2015, Art. 2.2.4.6.32"
  },
  {
    ciclo: "verificar",
    programa: "otro",
    actividad: "Evaluación de Cumplimiento de Requisitos Legales en SST",
    objetivo: "Verificar periódicamente el cumplimiento de la normatividad vigente aplicable",
    meta: "Evaluación semestral de cumplimiento legal documentada",
    indicador: "(Requisitos cumplidos / Total requisitos aplicables) × 100",
    mesesSugeridos: ["junio", "diciembre"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Decreto 1072/2015, Art. 2.2.4.6.8; Resolución 0312/2019"
  },

  // ==================== VI. ACTIVIDADES NORMATIVA 2024-2025 (5 actividades) ====================
  // Resolución 2607/2024, Resolución 1843/2025, Resolución 908/2025, Resolución 4272/2021

  {
    ciclo: "hacer",
    programa: "medicina-preventiva",
    actividad: "Exámenes Médicos Post-Incapacidad y de Reincorporación",
    objetivo: "Realizar examen médico ocupacional tras incapacidad >30 días o ausencia no médica >90 días antes de reincorporar al trabajador",
    meta: "100% de trabajadores reincorporados con examen médico",
    indicador: "(Exámenes post-incapacidad realizados / Reincorporaciones requeridas) × 100",
    mesesSugeridos: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Resolución 1843/2025, Art. 8-9"
  },
  {
    ciclo: "hacer",
    programa: "medicina-preventiva",
    actividad: "Informe Anual de Diagnóstico de Condiciones de Salud por IPS",
    objetivo: "Gestionar la entrega del informe anual de diagnóstico de condiciones de salud elaborado por la IPS prestadora",
    meta: "Informe recibido en diciembre de cada año",
    indicador: "Informe entregado por IPS (Sí/No)",
    mesesSugeridos: ["noviembre", "diciembre"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Resolución 1843/2025, Art. 12"
  },
  {
    ciclo: "hacer",
    programa: "medicina-preventiva",
    actividad: "Prohibición de Pruebas Discriminatorias y Control de Pruebas Restringidas",
    objetivo: "Asegurar que no se realicen pruebas de embarazo, VIH ni serología como condición laboral, y que pruebas de alcohol/sustancias solo se apliquen a cargos con riesgo para terceros",
    meta: "Política documentada y socializada",
    indicador: "Política implementada (Sí/No); 0 pruebas prohibidas realizadas",
    mesesSugeridos: ["enero"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Resolución 1843/2025, Art. 15-16"
  },
  {
    ciclo: "planear",
    programa: "identificacion-peligros",
    actividad: "Actualización de Política SST y Objetivos según Resolución 2607/2024",
    objetivo: "Revisar y actualizar la política y objetivos del SG-SST conforme a la nueva resolución de identificación de peligros",
    meta: "Política y objetivos actualizados y divulgados",
    indicador: "Política actualizada (Sí/No)",
    mesesSugeridos: ["enero", "febrero"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Resolución 2607/2024; Decreto 1072/2015, Art. 2.2.4.6.5-6"
  },
  {
    ciclo: "hacer",
    programa: "otro",
    actividad: "Gestión del Cambio en SST (Evaluación de Impacto de Cambios Internos y Externos)",
    objetivo: "Evaluar el impacto sobre SST de cambios en procesos, instalaciones, maquinaria, métodos de trabajo o normatividad",
    meta: "100% de cambios significativos con evaluación de impacto SST",
    indicador: "(Cambios evaluados / Total cambios significativos) × 100",
    mesesSugeridos: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
    cargo: "Responsable SG-SST",
    baseNormativa: "Decreto 1072/2015, Art. 2.2.4.6.26; Resolución 2607/2024"
  }
];

export const OBJETIVO_GENERAL_PLAN_TRABAJO = "Planificar, implementar, verificar y mejorar las actividades del Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST) para garantizar ambientes de trabajo seguros y saludables, cumpliendo con la normatividad colombiana vigente (Decreto 1072/2015, Resolución 0312/2019, Resolución 2607/2024 y Resolución 1843/2025).";

export const ALCANCE_PLAN_TRABAJO = "Este plan de trabajo aplica a todos los trabajadores directos, contratistas, subcontratistas, proveedores y visitantes que desarrollen actividades en las instalaciones de la empresa o en representación de la misma.";

export const META_CUMPLIMIENTO = 90;

export function getActividadesByPrograma(programa: ProgramaSST): ActividadPredefinida[] {
  return ACTIVIDADES_PLAN_TRABAJO_SST.filter(a => a.programa === programa);
}

export function getActividadesByCiclo(ciclo: CicloPHVA): ActividadPredefinida[] {
  return ACTIVIDADES_PLAN_TRABAJO_SST.filter(a => a.ciclo === ciclo);
}

export function getActividadesByMes(mes: Mes): ActividadPredefinida[] {
  return ACTIVIDADES_PLAN_TRABAJO_SST.filter(a => a.mesesSugeridos.includes(mes));
}

export const PROGRAMAS_SST_LABELS: Record<ProgramaSST, string> = {
  "identificacion-peligros": "Identificación de Peligros y Riesgos",
  "medicina-preventiva": "Medicina Preventiva y del Trabajo",
  "higiene-seguridad": "Higiene y Seguridad Industrial",
  "riesgo-psicosocial": "Prevención del Riesgo Psicosocial",
  "seguridad-vial": "Plan Estratégico de Seguridad Vial",
  "emergencias": "Preparación y Respuesta ante Emergencias",
  "vigilancia-epidemiologica": "Vigilancia Epidemiológica",
  "capacitacion": "Capacitación y Entrenamiento",
  "inspeccion": "Inspecciones de Seguridad",
  "epp": "Elementos de Protección Personal",
  "otro": "Gestión General SST"
};

export const CICLOS_PHVA_LABELS: Record<CicloPHVA, { nombre: string; descripcion: string; color: string }> = {
  "planear": { nombre: "PLANEAR", descripcion: "Establecer objetivos, procesos y recursos", color: "blue" },
  "hacer": { nombre: "HACER", descripcion: "Implementar los procesos según lo planificado", color: "green" },
  "verificar": { nombre: "VERIFICAR", descripcion: "Seguimiento y medición del desempeño", color: "yellow" },
  "actuar": { nombre: "ACTUAR", descripcion: "Tomar acciones de mejora continua", color: "red" }
};

export const MESES_LABELS: Record<Mes, string> = {
  "enero": "Ene", "febrero": "Feb", "marzo": "Mar", "abril": "Abr",
  "mayo": "May", "junio": "Jun", "julio": "Jul", "agosto": "Ago",
  "septiembre": "Sep", "octubre": "Oct", "noviembre": "Nov", "diciembre": "Dic"
};

export const TRIMESTRES = [
  { numero: 1, meses: ["enero", "febrero", "marzo"] as Mes[] },
  { numero: 2, meses: ["abril", "mayo", "junio"] as Mes[] },
  { numero: 3, meses: ["julio", "agosto", "septiembre"] as Mes[] },
  { numero: 4, meses: ["octubre", "noviembre", "diciembre"] as Mes[] }
];

export function getMesTrimestre(mes: Mes): number {
  const trimestre = TRIMESTRES.find(t => t.meses.includes(mes));
  return trimestre?.numero || 1;
}
