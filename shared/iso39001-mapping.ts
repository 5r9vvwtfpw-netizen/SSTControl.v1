/**
 * Mapeo PESV (Resolución 40595/2022) ↔ ISO 39001:2012
 * Road Traffic Safety (RTS) Management Systems
 * 
 * La Resolución 40595/2022 de Colombia fue diseñada estructuralmente
 * alineada con ISO 39001:2012. Este archivo provee el mapeo bidireccional
 * entre los 24 pasos PESV y las cláusulas de la norma internacional.
 */

export interface Iso39001Clause {
  clause: string;
  titleEs: string;
  titleEn: string;
  phva: 'planear' | 'hacer' | 'verificar' | 'actuar';
}

export const ISO39001_CLAUSES: Record<string, Iso39001Clause> = {
  '4.1': { clause: '4.1', titleEs: 'Comprensión del contexto de la organización', titleEn: 'Understanding the organization and its context', phva: 'planear' },
  '4.2': { clause: '4.2', titleEs: 'Partes interesadas', titleEn: 'Understanding needs of interested parties', phva: 'planear' },
  '4.3': { clause: '4.3', titleEs: 'Alcance del sistema de gestión de SV', titleEn: 'Scope of the RTS management system', phva: 'planear' },
  '4.4': { clause: '4.4', titleEs: 'Sistema de gestión de seguridad vial', titleEn: 'RTS management system', phva: 'planear' },
  '5.1': { clause: '5.1', titleEs: 'Liderazgo y compromiso de la dirección', titleEn: 'Leadership and commitment', phva: 'planear' },
  '5.2': { clause: '5.2', titleEs: 'Política de seguridad vial', titleEn: 'Road traffic safety policy', phva: 'planear' },
  '5.3': { clause: '5.3', titleEs: 'Roles, responsabilidades y autoridades', titleEn: 'Organizational roles, responsibilities and authorities', phva: 'planear' },
  '6.1': { clause: '6.1', titleEs: 'Acciones para tratar riesgos y oportunidades', titleEn: 'Actions to address risks and opportunities', phva: 'planear' },
  '6.2': { clause: '6.2', titleEs: 'Objetivos de seguridad vial y planificación', titleEn: 'RTS objectives and planning', phva: 'planear' },
  '6.3': { clause: '6.3', titleEs: 'Factores de desempeño de seguridad vial (SPF)', titleEn: 'Safety performance factors', phva: 'planear' },
  '7.1': { clause: '7.1', titleEs: 'Recursos para el sistema de gestión', titleEn: 'Resources', phva: 'hacer' },
  '7.2': { clause: '7.2', titleEs: 'Competencia del personal vial', titleEn: 'Competence', phva: 'hacer' },
  '7.3': { clause: '7.3', titleEs: 'Toma de conciencia en seguridad vial', titleEn: 'Awareness', phva: 'hacer' },
  '7.4': { clause: '7.4', titleEs: 'Comunicación interna y externa', titleEn: 'Communication', phva: 'hacer' },
  '7.5': { clause: '7.5', titleEs: 'Información documentada (conductores y vehículos)', titleEn: 'Documented information', phva: 'hacer' },
  '8.1': { clause: '8.1', titleEs: 'Planificación y control operacional', titleEn: 'Operational planning and control', phva: 'hacer' },
  '8.2': { clause: '8.2', titleEs: 'Objetivos de desempeño y atención a víctimas', titleEn: 'RTS performance objectives', phva: 'hacer' },
  '8.3': { clause: '8.3', titleEs: 'Controles operacionales de seguridad vial', titleEn: 'Hierarchy of controls', phva: 'hacer' },
  '9.1': { clause: '9.1', titleEs: 'Seguimiento, medición y análisis', titleEn: 'Monitoring, measurement, analysis and evaluation', phva: 'verificar' },
  '9.2': { clause: '9.2', titleEs: 'Auditoría interna del PESV', titleEn: 'Internal audit', phva: 'verificar' },
  '9.3': { clause: '9.3', titleEs: 'Revisión por la alta dirección', titleEn: 'Management review', phva: 'verificar' },
  '10.1': { clause: '10.1', titleEs: 'No conformidad y acción correctiva', titleEn: 'Nonconformity and corrective action', phva: 'actuar' },
  '10.2': { clause: '10.2', titleEs: 'Mejora continua del PESV', titleEn: 'Continual improvement', phva: 'actuar' },
};

/**
 * Mapeo de paso PESV → cláusulas ISO 39001:2012
 * Cada paso PESV puede mapear a una o más cláusulas
 */
export const PASO_TO_ISO39001: Record<string, string[]> = {
  'P01': ['5.1', '5.3'],      // Equipo de trabajo → Liderazgo + Roles
  'P02': ['5.2'],             // Política de SV → Política
  'P03': ['4.1', '4.2', '4.3', '4.4'], // Diagnóstico → Contexto completo
  'P04': ['6.1', '6.3'],     // Evaluación del riesgo vial → Riesgos + SPF
  'P05': ['6.2'],             // Objetivos y metas → Objetivos
  'P06': ['8.1'],             // Programas y planes → Control operacional
  'P07': ['5.3'],             // Roles y responsabilidades → Roles
  'P08': ['7.1'],             // Recursos → Recursos
  'H01': ['7.3', '8.3'],     // Fortalecimiento factor humano → Conciencia + Controles
  'H02': ['7.2', '7.3'],     // Capacitación → Competencia + Conciencia
  'H03': ['7.5', '8.3'],     // Documentación conductores → Info documentada + Controles
  'H04': ['8.3'],             // Vehículos seguros → Controles operacionales
  'H05': ['8.3'],             // Mantenimiento vehículos → Controles operacionales
  'H06': ['8.3', '9.1'],     // Inspecciones preoperacionales → Controles + Medición
  'H07': ['8.3'],             // Gestión velocidad → Controles operacionales
  'H08': ['8.1', '8.3'],     // Rutas seguras → Planificación + Controles
  'H09': ['8.3'],             // Fatiga y somnolencia → Controles operacionales
  'H10': ['8.3'],             // Alcohol y sustancias → Controles operacionales
  'H11': ['8.2', '10.1'],    // Atención víctimas → Objetivos + Acción correctiva
  'V01': ['9.1'],             // Indicadores → Seguimiento y medición
  'V02': ['9.1', '10.1'],    // Siniestros → Análisis + Acción correctiva
  'V03': ['9.2'],             // Auditoría → Auditoría interna
  'A01': ['10.2'],            // Mejora continua → Mejora continua
  'A02': ['9.3'],             // Revisión dirección → Revisión por la dirección
};

/**
 * Mapeo inverso: cláusula ISO 39001 → pasos PESV
 */
export const ISO39001_TO_PASOS: Record<string, string[]> = Object.entries(PASO_TO_ISO39001).reduce(
  (acc, [paso, clauses]) => {
    clauses.forEach(clause => {
      if (!acc[clause]) acc[clause] = [];
      if (!acc[clause].includes(paso)) acc[clause].push(paso);
    });
    return acc;
  },
  {} as Record<string, string[]>
);

/**
 * Estructura del reporte ISO 39001 agrupada por capítulos
 * Cada capítulo agrupa sus cláusulas con los pasos PESV correspondientes
 */
export const ISO39001_REPORT_STRUCTURE = [
  {
    chapter: '4',
    title: 'Contexto de la Organización',
    titleEn: 'Context of the Organization',
    clauses: ['4.1', '4.2', '4.3', '4.4'],
    phvaColor: '#1e40af',
    phvaLabel: 'PLANEAR',
  },
  {
    chapter: '5',
    title: 'Liderazgo',
    titleEn: 'Leadership',
    clauses: ['5.1', '5.2', '5.3'],
    phvaColor: '#1e40af',
    phvaLabel: 'PLANEAR',
  },
  {
    chapter: '6',
    title: 'Planificación',
    titleEn: 'Planning',
    clauses: ['6.1', '6.2', '6.3'],
    phvaColor: '#1e40af',
    phvaLabel: 'PLANEAR',
  },
  {
    chapter: '7',
    title: 'Soporte',
    titleEn: 'Support',
    clauses: ['7.1', '7.2', '7.3', '7.4', '7.5'],
    phvaColor: '#b45309',
    phvaLabel: 'HACER',
  },
  {
    chapter: '8',
    title: 'Operación',
    titleEn: 'Operation',
    clauses: ['8.1', '8.2', '8.3'],
    phvaColor: '#b45309',
    phvaLabel: 'HACER',
  },
  {
    chapter: '9',
    title: 'Evaluación del Desempeño',
    titleEn: 'Performance Evaluation',
    clauses: ['9.1', '9.2', '9.3'],
    phvaColor: '#15803d',
    phvaLabel: 'VERIFICAR',
  },
  {
    chapter: '10',
    title: 'Mejora',
    titleEn: 'Improvement',
    clauses: ['10.1', '10.2'],
    phvaColor: '#7c3aed',
    phvaLabel: 'ACTUAR',
  },
];

/**
 * Obtiene la cláusula ISO 39001 primaria de un paso PESV
 */
export function getPrimaryIso39001Clause(codigoPaso: string): string | null {
  const clauses = PASO_TO_ISO39001[codigoPaso];
  return clauses && clauses.length > 0 ? clauses[0] : null;
}
