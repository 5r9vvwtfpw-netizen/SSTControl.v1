/**
 * Mapeo completo: Resolución 0312/2019 ↔ ISO 45001:2018
 *
 * ISO 45001:2018 — Sistema de Gestión de Seguridad y Salud en el Trabajo
 * Este mapeo permite a las empresas colombianas demostrar cumplimiento internacional
 * ante socios, clientes y auditores extranjeros.
 */

export interface Iso45001Clause {
  clause: string;
  title: string;
  titleEs: string;
}

export interface StandardIsoMapping {
  standardCode: string;
  clauses: string[];
}

/** Catálogo completo de cláusulas ISO 45001:2018 */
export const ISO45001_CLAUSES: Record<string, Iso45001Clause> = {
  "4.1": { clause: "4.1", title: "Understanding the organization and its context", titleEs: "Comprensión de la organización y su contexto" },
  "4.2": { clause: "4.2", title: "Understanding the needs and expectations of workers and other interested parties", titleEs: "Comprensión de las necesidades y expectativas de las partes interesadas" },
  "4.3": { clause: "4.3", title: "Determining the scope of the OH&S management system", titleEs: "Determinación del alcance del SG-SST" },
  "4.4": { clause: "4.4", title: "OH&S management system", titleEs: "Sistema de gestión de SST" },
  "5.1": { clause: "5.1", title: "Leadership and commitment", titleEs: "Liderazgo y compromiso" },
  "5.2": { clause: "5.2", title: "OH&S policy", titleEs: "Política de SST" },
  "5.3": { clause: "5.3", title: "Organizational roles, responsibilities and authorities", titleEs: "Roles, responsabilidades y autoridades" },
  "5.4": { clause: "5.4", title: "Consultation and participation of workers", titleEs: "Consulta y participación de los trabajadores" },
  "6.1.1": { clause: "6.1.1", title: "General — Actions to address risks and opportunities", titleEs: "General — Acciones para abordar riesgos y oportunidades" },
  "6.1.2": { clause: "6.1.2", title: "Hazard identification and assessment of risks and opportunities", titleEs: "Identificación de peligros y evaluación de riesgos" },
  "6.1.3": { clause: "6.1.3", title: "Determination of legal requirements and other requirements", titleEs: "Determinación de requisitos legales y otros requisitos" },
  "6.1.4": { clause: "6.1.4", title: "Planning action", titleEs: "Planificación de acciones" },
  "6.2": { clause: "6.2", title: "OH&S objectives and planning to achieve them", titleEs: "Objetivos de SST y planificación para lograrlos" },
  "7.1": { clause: "7.1", title: "Resources", titleEs: "Recursos" },
  "7.2": { clause: "7.2", title: "Competence", titleEs: "Competencia" },
  "7.3": { clause: "7.3", title: "Awareness", titleEs: "Toma de conciencia" },
  "7.4": { clause: "7.4", title: "Communication", titleEs: "Comunicación" },
  "7.5": { clause: "7.5", title: "Documented information", titleEs: "Información documentada" },
  "8.1.1": { clause: "8.1.1", title: "Operational planning and control — General", titleEs: "Planificación y control operacional — General" },
  "8.1.2": { clause: "8.1.2", title: "Eliminating hazards and reducing OH&S risks", titleEs: "Eliminación de peligros y reducción de riesgos de SST" },
  "8.1.3": { clause: "8.1.3", title: "Management of change", titleEs: "Gestión del cambio" },
  "8.1.4": { clause: "8.1.4", title: "Procurement", titleEs: "Adquisiciones y contratación" },
  "8.2": { clause: "8.2", title: "Emergency preparedness and response", titleEs: "Preparación y respuesta ante emergencias" },
  "9.1.1": { clause: "9.1.1", title: "Monitoring, measurement, analysis and performance evaluation — General", titleEs: "Seguimiento, medición, análisis y evaluación del desempeño" },
  "9.1.2": { clause: "9.1.2", title: "Evaluation of compliance", titleEs: "Evaluación del cumplimiento" },
  "9.2": { clause: "9.2", title: "Internal audit", titleEs: "Auditoría interna" },
  "9.3": { clause: "9.3", title: "Management review", titleEs: "Revisión por la dirección" },
  "10.2": { clause: "10.2", title: "Incident, nonconformity and corrective action", titleEs: "Incidente, no conformidad y acción correctiva" },
  "10.3": { clause: "10.3", title: "Continual improvement", titleEs: "Mejora continua" },
};

/**
 * Mapeo de cada estándar de la Res. 0312/2019 a sus cláusulas ISO 45001:2018 correspondientes.
 * Un estándar puede mapear a una o más cláusulas ISO.
 */
export const STANDARD_TO_ISO45001: Record<string, string[]> = {
  // COMPONENTE 1 — RECURSOS
  "1.1.1": ["5.1", "7.1"],        // Responsable SG-SST → Liderazgo + Recursos
  "1.1.2": ["5.3"],               // Responsabilidades → Roles y responsabilidades
  "1.1.3": ["7.1"],               // Asignación de recursos → Recursos
  "1.1.4": ["7.1"],               // Afiliación SSI → Recursos
  "1.1.5": ["7.1"],               // Trabajadores alto riesgo → Recursos
  "1.1.6": ["5.4"],               // COPASST/Vigía → Consulta y participación
  "1.1.7": ["5.4"],               // Capacitación COPASST → Consulta y participación
  "1.1.8": ["5.4"],               // Comité Convivencia → Consulta y participación
  "1.2.1": ["7.2", "7.3"],        // Programa capacitación → Competencia + Toma de conciencia
  "1.2.2": ["7.2"],               // Inducción/reinducción → Competencia
  "1.2.3": ["7.2"],               // Curso 50 horas → Competencia

  // COMPONENTE 2 — GESTIÓN INTEGRAL
  "2.1.1": ["5.2"],               // Política SST → Política de SST
  "2.2.1": ["6.2"],               // Objetivos SST → Objetivos
  "2.3.1": ["6.1.1", "4.1"],      // Evaluación inicial → General + Contexto
  "2.4.1": ["6.1.4"],             // Plan Anual de Trabajo → Planificación
  "2.5.1": ["7.5"],               // Archivo documental → Información documentada
  "2.6.1": ["9.3"],               // Rendición de cuentas → Revisión dirección
  "2.7.1": ["6.1.3"],             // Matriz Legal → Requisitos legales
  "2.8.1": ["7.4"],               // Comunicación SST → Comunicación
  "2.9.1": ["8.1.4"],             // Adquisiciones → Adquisiciones
  "2.10.1": ["8.1.4"],            // Proveedores/contratistas → Adquisiciones
  "2.11.1": ["8.1.3"],            // Gestión del cambio → Gestión del cambio

  // COMPONENTE 3 — GESTIÓN DE LA SALUD
  "3.1.1": ["8.1.1"],             // Perfil sociodemográfico → Control operacional
  "3.1.2": ["8.1.1"],             // Medicina del trabajo → Control operacional
  "3.1.3": ["7.2"],               // Perfiles de cargo → Competencia
  "3.1.4": ["8.1.1"],             // Exámenes médicos → Control operacional
  "3.1.5": ["7.5"],               // Historias clínicas → Información documentada
  "3.1.6": ["8.1.1"],             // Restricciones médicas → Control operacional
  "3.1.7": ["8.1.1"],             // Estilos de vida saludable → Control operacional
  "3.1.8": ["8.1.1"],             // Higiene y agua → Control operacional
  "3.1.9": ["8.1.1"],             // Manejo de residuos → Control operacional
  "3.2.1": ["10.2"],              // Reporte accidentes → Incidentes y acciones correctivas
  "3.2.2": ["10.2"],              // Investigación accidentes → Acciones correctivas
  "3.2.3": ["9.1.1"],             // Estadísticas → Seguimiento y medición
  "3.3.1": ["9.1.1"],             // Frecuencia accidentalidad → Seguimiento
  "3.3.2": ["9.1.1"],             // Severidad → Seguimiento
  "3.3.3": ["9.1.1"],             // Mortalidad → Seguimiento
  "3.3.4": ["9.1.1"],             // Prevalencia → Seguimiento
  "3.3.5": ["9.1.1"],             // Incidencia → Seguimiento
  "3.3.6": ["9.1.1"],             // Ausentismo → Seguimiento

  // COMPONENTE 4 — PELIGROS Y RIESGOS
  "4.1.1": ["6.1.2"],             // IPERC metodología → Identificación de peligros
  "4.1.2": ["6.1.2"],             // IPERC con participación → Identificación de peligros
  "4.1.3": ["6.1.2"],             // Sustancias carcinógenas → Identificación de peligros
  "4.1.4": ["6.1.2"],             // Mediciones ambientales → Identificación de peligros
  "4.2.1": ["8.1.2"],             // Medidas prevención → Eliminación de peligros
  "4.2.2": ["8.1.2"],             // Aplicación medidas → Eliminación de peligros
  "4.2.3": ["8.1.2"],             // Procedimientos SST → Eliminación de peligros
  "4.2.4": ["8.1.1"],             // Inspecciones → Control operacional
  "4.2.5": ["8.1.1"],             // Mantenimiento → Control operacional
  "4.2.6": ["8.1.2"],             // Entrega EPP → Eliminación de peligros

  // COMPONENTE 5 — GESTIÓN DE AMENAZAS
  "5.1.1": ["8.2"],               // Plan emergencias → Preparación emergencias
  "5.1.2": ["8.2"],               // Brigada → Preparación emergencias
  "5.1.3": ["8.2"],               // Simulacros → Preparación emergencias

  // COMPONENTE 6 — VERIFICACIÓN
  "6.1.1": ["9.1.1"],             // Indicadores gestión → Seguimiento y medición
  "6.1.2": ["9.2"],               // Auditoría anual → Auditoría interna
  "6.1.3": ["9.3"],               // Revisión alta dirección → Revisión por la dirección
  "6.1.4": ["9.2"],               // Auditoría con COPASST → Auditoría interna

  // COMPONENTE 7 — MEJORAMIENTO
  "7.1.1": ["10.2"],              // Acciones preventivas/correctivas → Acciones correctivas
  "7.1.2": ["10.2", "9.3"],       // Acciones por revisión dirección → Acciones + Revisión
  "7.1.3": ["10.2"],              // Acciones por accidentes → Acciones correctivas
  "7.1.4": ["10.3"],              // Plan de mejoramiento → Mejora continua
};

/** Agrupación de estándares por cláusula ISO 45001 (mapeo inverso) */
export const ISO45001_TO_STANDARDS: Record<string, string[]> = Object.entries(STANDARD_TO_ISO45001).reduce(
  (acc, [standard, clauses]) => {
    clauses.forEach((clause) => {
      if (!acc[clause]) acc[clause] = [];
      acc[clause].push(standard);
    });
    return acc;
  },
  {} as Record<string, string[]>
);

/**
 * Estructura del reporte ISO 45001 organizada por capítulos.
 * Cada capítulo agrupa las cláusulas que le corresponden.
 */
export const ISO45001_REPORT_STRUCTURE = [
  {
    chapter: "4",
    title: "Contexto de la Organización",
    titleEn: "Context of the Organization",
    clauses: ["4.1", "4.2", "4.3", "4.4"],
  },
  {
    chapter: "5",
    title: "Liderazgo y Participación de los Trabajadores",
    titleEn: "Leadership and Worker Participation",
    clauses: ["5.1", "5.2", "5.3", "5.4"],
  },
  {
    chapter: "6",
    title: "Planificación",
    titleEn: "Planning",
    clauses: ["6.1.1", "6.1.2", "6.1.3", "6.1.4", "6.2"],
  },
  {
    chapter: "7",
    title: "Apoyo",
    titleEn: "Support",
    clauses: ["7.1", "7.2", "7.3", "7.4", "7.5"],
  },
  {
    chapter: "8",
    title: "Operación",
    titleEn: "Operation",
    clauses: ["8.1.1", "8.1.2", "8.1.3", "8.1.4", "8.2"],
  },
  {
    chapter: "9",
    title: "Evaluación del Desempeño",
    titleEn: "Performance Evaluation",
    clauses: ["9.1.1", "9.1.2", "9.2", "9.3"],
  },
  {
    chapter: "10",
    title: "Mejora",
    titleEn: "Improvement",
    clauses: ["10.2", "10.3"],
  },
];

/**
 * Retorna la primera cláusula ISO 45001 de un estándar (para mostrar como badge principal).
 */
export function getPrimaryIsoClause(standardCode: string): string | null {
  const clauses = STANDARD_TO_ISO45001[standardCode];
  return clauses && clauses.length > 0 ? clauses[0] : null;
}

/**
 * Retorna todas las cláusulas ISO 45001 de un estándar.
 */
export function getIsoClauses(standardCode: string): Iso45001Clause[] {
  const clauseCodes = STANDARD_TO_ISO45001[standardCode] || [];
  return clauseCodes.map((c) => ISO45001_CLAUSES[c]).filter(Boolean);
}
