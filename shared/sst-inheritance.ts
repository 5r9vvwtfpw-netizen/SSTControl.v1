/**
 * Clasificación de Estándares SST para Herencia Anual
 * 
 * Define qué estándares tienen datos persistentes (se heredan año a año)
 * vs estándares que requieren nueva evidencia cada año.
 * 
 * Resolución 0312 de 2019 - Estándares Mínimos del SG-SST
 */

export type InheritanceType = 'persistent' | 'annual' | 'mixed';

export interface StandardInheritanceConfig {
  codigo: string;
  nombre: string;
  inheritanceType: InheritanceType;
  reason: string;
  copyFields?: string[];
}

/**
 * Estándares PERSISTENTES: Se heredan automáticamente porque representan
 * decisiones o configuraciones que típicamente no cambian año a año.
 */
export const PERSISTENT_STANDARDS: StandardInheritanceConfig[] = [
  {
    codigo: '1.1.1',
    nombre: 'Responsable del SG-SST',
    inheritanceType: 'persistent',
    reason: 'El responsable designado generalmente continúa en el cargo',
    copyFields: ['cumple', 'evidencias', 'observaciones']
  },
  {
    codigo: '1.1.2',
    nombre: 'Responsabilidades SST',
    inheritanceType: 'persistent',
    reason: 'El documento de responsabilidades es permanente',
    copyFields: ['cumple', 'evidencias', 'observaciones']
  },
  {
    codigo: '1.1.3',
    nombre: 'Asignación de recursos SST',
    inheritanceType: 'persistent',
    reason: 'La política de asignación de recursos continúa vigente',
    copyFields: ['cumple', 'evidencias', 'observaciones']
  },
  {
    codigo: '1.1.4',
    nombre: 'Afiliaciones al SGSSS',
    inheritanceType: 'persistent',
    reason: 'Las entidades de afiliación (EPS, ARL, AFP, CCF) se mantienen',
    copyFields: ['cumple', 'evidencias', 'observaciones']
  },
  {
    codigo: '1.1.6',
    nombre: 'Conformación COPASST/Vigía',
    inheritanceType: 'persistent',
    reason: 'El COPASST tiene período de 2 años',
    copyFields: ['cumple', 'evidencias', 'observaciones']
  },
  {
    codigo: '1.1.7',
    nombre: 'Capacitación COPASST/Vigía',
    inheritanceType: 'persistent',
    reason: 'La capacitación inicial ya fue realizada',
    copyFields: ['cumple', 'evidencias', 'observaciones']
  },
  {
    codigo: '1.1.8',
    nombre: 'Comité de Convivencia',
    inheritanceType: 'persistent',
    reason: 'El comité tiene período de 2 años',
    copyFields: ['cumple', 'evidencias', 'observaciones']
  },
  {
    codigo: '2.1.1',
    nombre: 'Política del SG-SST',
    inheritanceType: 'persistent',
    reason: 'La política SST es un documento permanente (se revisa pero no cambia cada año)',
    copyFields: ['cumple', 'evidencias', 'observaciones']
  },
  {
    codigo: '2.2.1',
    nombre: 'Objetivos del SG-SST',
    inheritanceType: 'persistent',
    reason: 'Los objetivos se mantienen con revisión periódica',
    copyFields: ['cumple', 'evidencias', 'observaciones']
  },
  {
    codigo: '2.3.1',
    nombre: 'Evaluación inicial del SG-SST',
    inheritanceType: 'persistent',
    reason: 'La evaluación inicial es un único documento base',
    copyFields: ['cumple', 'evidencias', 'observaciones']
  },
  {
    codigo: '2.5.1',
    nombre: 'Archivo y conservación documentos',
    inheritanceType: 'persistent',
    reason: 'El sistema de archivo es permanente',
    copyFields: ['cumple', 'evidencias', 'observaciones']
  },
  {
    codigo: '2.6.1',
    nombre: 'Rendición de cuentas',
    inheritanceType: 'persistent',
    reason: 'El procedimiento de rendición está establecido',
    copyFields: ['cumple', 'evidencias', 'observaciones']
  },
  {
    codigo: '2.7.1',
    nombre: 'Matriz legal',
    inheritanceType: 'persistent',
    reason: 'La matriz legal se actualiza pero el documento base persiste',
    copyFields: ['cumple', 'evidencias', 'observaciones']
  },
  {
    codigo: '2.8.1',
    nombre: 'Mecanismos de comunicación',
    inheritanceType: 'persistent',
    reason: 'Los canales de comunicación están establecidos',
    copyFields: ['cumple', 'evidencias', 'observaciones']
  },
  {
    codigo: '2.10.1',
    nombre: 'Procedimientos y formatos',
    inheritanceType: 'persistent',
    reason: 'El sistema documental es permanente',
    copyFields: ['cumple', 'evidencias', 'observaciones']
  },
  {
    codigo: '3.1.1',
    nombre: 'Descripción sociodemográfica',
    inheritanceType: 'persistent',
    reason: 'El perfil sociodemográfico se actualiza pero el sistema persiste',
    copyFields: ['cumple', 'evidencias', 'observaciones']
  },
  {
    codigo: '3.1.4',
    nombre: 'Evaluaciones médicas',
    inheritanceType: 'persistent',
    reason: 'El programa de evaluaciones médicas está establecido',
    copyFields: ['cumple', 'evidencias', 'observaciones']
  },
  {
    codigo: '3.1.5',
    nombre: 'Custodia historias clínicas',
    inheritanceType: 'persistent',
    reason: 'El sistema de custodia es permanente',
    copyFields: ['cumple', 'evidencias', 'observaciones']
  },
  {
    codigo: '3.1.6',
    nombre: 'Restricciones laborales',
    inheritanceType: 'persistent',
    reason: 'El procedimiento de restricciones está establecido',
    copyFields: ['cumple', 'evidencias', 'observaciones']
  },
  {
    codigo: '3.1.7',
    nombre: 'Estilos de vida saludables',
    inheritanceType: 'persistent',
    reason: 'El programa de bienestar es continuo',
    copyFields: ['cumple', 'evidencias', 'observaciones']
  },
  {
    codigo: '3.1.8',
    nombre: 'Agua potable',
    inheritanceType: 'persistent',
    reason: 'La infraestructura de servicios es permanente',
    copyFields: ['cumple', 'evidencias', 'observaciones']
  },
  {
    codigo: '3.1.9',
    nombre: 'Residuos y desechos',
    inheritanceType: 'persistent',
    reason: 'El plan de gestión de residuos es continuo',
    copyFields: ['cumple', 'evidencias', 'observaciones']
  },
  {
    codigo: '3.2.1',
    nombre: 'Investigación de incidentes/AT',
    inheritanceType: 'persistent',
    reason: 'El procedimiento de investigación está establecido',
    copyFields: ['cumple', 'evidencias', 'observaciones']
  },
  {
    codigo: '3.3.1',
    nombre: 'Medición SVE epidemiológico',
    inheritanceType: 'persistent',
    reason: 'El sistema de vigilancia epidemiológica es continuo',
    copyFields: ['cumple', 'evidencias', 'observaciones']
  },
  {
    codigo: '3.3.2',
    nombre: 'Medición SVE químico',
    inheritanceType: 'persistent',
    reason: 'El programa de vigilancia química es continuo',
    copyFields: ['cumple', 'evidencias', 'observaciones']
  },
  {
    codigo: '3.3.3',
    nombre: 'Medición SVE físico',
    inheritanceType: 'persistent',
    reason: 'El programa de vigilancia física es continuo',
    copyFields: ['cumple', 'evidencias', 'observaciones']
  },
  {
    codigo: '3.3.4',
    nombre: 'Medición SVE biomecánico',
    inheritanceType: 'persistent',
    reason: 'El programa de vigilancia biomecánica es continuo',
    copyFields: ['cumple', 'evidencias', 'observaciones']
  },
  {
    codigo: '3.3.5',
    nombre: 'Medición SVE psicosocial',
    inheritanceType: 'persistent',
    reason: 'El programa de vigilancia psicosocial es continuo',
    copyFields: ['cumple', 'evidencias', 'observaciones']
  },
  {
    codigo: '3.3.6',
    nombre: 'Medición de mortalidad EL',
    inheritanceType: 'persistent',
    reason: 'El registro de mortalidad es acumulativo',
    copyFields: ['cumple', 'evidencias', 'observaciones']
  },
  {
    codigo: '4.1.1',
    nombre: 'Metodología identificación peligros',
    inheritanceType: 'persistent',
    reason: 'La metodología IPEVR está establecida',
    copyFields: ['cumple', 'evidencias', 'observaciones']
  },
  {
    codigo: '4.1.2',
    nombre: 'Identificación peligros y evaluación',
    inheritanceType: 'persistent',
    reason: 'La matriz IPEVR se actualiza pero el sistema persiste',
    copyFields: ['cumple', 'evidencias', 'observaciones']
  },
  {
    codigo: '4.1.3',
    nombre: 'Medidas de prevención y control',
    inheritanceType: 'persistent',
    reason: 'Los controles implementados continúan vigentes',
    copyFields: ['cumple', 'evidencias', 'observaciones']
  },
  {
    codigo: '4.2.1',
    nombre: 'Plan de emergencias',
    inheritanceType: 'persistent',
    reason: 'El plan de emergencias es un documento vivo que se actualiza',
    copyFields: ['cumple', 'evidencias', 'observaciones']
  },
  {
    codigo: '4.2.2',
    nombre: 'Brigada de prevención',
    inheritanceType: 'persistent',
    reason: 'La brigada está conformada y capacitada',
    copyFields: ['cumple', 'evidencias', 'observaciones']
  },
  {
    codigo: '6.1.1',
    nombre: 'Metodología mejora continua',
    inheritanceType: 'persistent',
    reason: 'La metodología de mejora es permanente',
    copyFields: ['cumple', 'evidencias', 'observaciones']
  },
];

/**
 * Estándares ANUALES: Requieren nueva evidencia cada año.
 * No se heredan automáticamente.
 */
export const ANNUAL_STANDARDS: StandardInheritanceConfig[] = [
  {
    codigo: '1.2.1',
    nombre: 'Programa de capacitación anual',
    inheritanceType: 'annual',
    reason: 'Requiere nuevo programa cada año'
  },
  {
    codigo: '1.2.2',
    nombre: 'Inducción y reinducción SST',
    inheritanceType: 'annual',
    reason: 'Los registros son del año en curso'
  },
  {
    codigo: '2.4.1',
    nombre: 'Plan de trabajo anual SST',
    inheritanceType: 'annual',
    reason: 'Requiere nuevo plan cada año'
  },
  {
    codigo: '2.9.1',
    nombre: 'Adquisiciones SST',
    inheritanceType: 'annual',
    reason: 'Registros del año en curso'
  },
  {
    codigo: '2.11.1',
    nombre: 'Gestión del cambio',
    inheritanceType: 'annual',
    reason: 'Evaluaciones del año en curso'
  },
  {
    codigo: '3.2.2',
    nombre: 'Estadísticas AT/EL',
    inheritanceType: 'annual',
    reason: 'Estadísticas del año en curso'
  },
  {
    codigo: '3.2.3',
    nombre: 'Medición ausentismo',
    inheritanceType: 'annual',
    reason: 'Datos del año en curso'
  },
  {
    codigo: '4.1.4',
    nombre: 'Mediciones ambientales',
    inheritanceType: 'annual',
    reason: 'Mediciones del año en curso'
  },
  {
    codigo: '4.2.3',
    nombre: 'Simulacros',
    inheritanceType: 'annual',
    reason: 'Registros del año en curso'
  },
  {
    codigo: '4.2.4',
    nombre: 'Inspecciones sistemáticas',
    inheritanceType: 'annual',
    reason: 'Inspecciones del año en curso'
  },
  {
    codigo: '4.2.5',
    nombre: 'Mantenimiento instalaciones',
    inheritanceType: 'annual',
    reason: 'Registros del año en curso'
  },
  {
    codigo: '4.2.6',
    nombre: 'Entrega de EPP',
    inheritanceType: 'annual',
    reason: 'Registros del año en curso'
  },
  {
    codigo: '5.1.1',
    nombre: 'Indicadores SG-SST',
    inheritanceType: 'annual',
    reason: 'Indicadores del año en curso'
  },
  {
    codigo: '5.1.2',
    nombre: 'Auditoría anual',
    inheritanceType: 'annual',
    reason: 'Requiere nueva auditoría cada año'
  },
  {
    codigo: '6.1.2',
    nombre: 'Acciones correctivas/preventivas',
    inheritanceType: 'annual',
    reason: 'Acciones del período en curso'
  },
  {
    codigo: '6.1.3',
    nombre: 'Mejora continua',
    inheritanceType: 'annual',
    reason: 'Evidencias del año en curso'
  },
  {
    codigo: '6.1.4',
    nombre: 'Revisión por la alta dirección',
    inheritanceType: 'annual',
    reason: 'Requiere nueva revisión cada año'
  },
  {
    codigo: '7.1.1',
    nombre: 'Acciones resultados MinTrabajo',
    inheritanceType: 'annual',
    reason: 'Acciones del período en curso'
  },
  {
    codigo: '7.1.2',
    nombre: 'Acciones resultados ARL',
    inheritanceType: 'annual',
    reason: 'Acciones del período en curso'
  },
  {
    codigo: '7.1.3',
    nombre: 'Acciones ministerio/ARL',
    inheritanceType: 'annual',
    reason: 'Acciones del período en curso'
  },
  {
    codigo: '7.1.4',
    nombre: 'Acciones ARL',
    inheritanceType: 'annual',
    reason: 'Acciones del período en curso'
  },
];

/**
 * Obtiene la configuración de herencia para un estándar específico
 */
export function getStandardInheritanceConfig(codigo: string): StandardInheritanceConfig | undefined {
  return PERSISTENT_STANDARDS.find(s => s.codigo === codigo) 
    || ANNUAL_STANDARDS.find(s => s.codigo === codigo);
}

/**
 * Verifica si un estándar es heredable (persistente)
 */
export function isStandardPersistent(codigo: string): boolean {
  return PERSISTENT_STANDARDS.some(s => s.codigo === codigo);
}

/**
 * Obtiene todos los códigos de estándares persistentes
 */
export function getPersistentStandardCodes(): string[] {
  return PERSISTENT_STANDARDS.map(s => s.codigo);
}

/**
 * Obtiene todos los códigos de estándares anuales
 */
export function getAnnualStandardCodes(): string[] {
  return ANNUAL_STANDARDS.map(s => s.codigo);
}

/**
 * Cuenta cuántos estándares son heredables
 */
export function countPersistentStandards(): number {
  return PERSISTENT_STANDARDS.length;
}

/**
 * Cuenta cuántos estándares requieren nueva evidencia
 */
export function countAnnualStandards(): number {
  return ANNUAL_STANDARDS.length;
}
