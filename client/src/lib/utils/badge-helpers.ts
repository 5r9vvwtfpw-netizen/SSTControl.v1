/**
 * Configuraciones de badges reutilizables para el sistema SST Colombia
 * Centraliza estilos y variantes de badges para mantener consistencia
 */

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export interface BadgeConfig {
  label: string;
  variant: BadgeVariant;
}

/**
 * Configuraciones de estado para suscripciones
 */
export const SUBSCRIPTION_STATUS_CONFIGS: Record<string, BadgeConfig> = {
  active: { label: "Activa", variant: "default" },
  trial: { label: "Prueba", variant: "secondary" },
  past_due: { label: "Vencida", variant: "destructive" },
  suspended: { label: "Suspendida", variant: "destructive" },
  canceled: { label: "Cancelada", variant: "outline" },
};

/**
 * Configuraciones de estado para facturas
 */
export const INVOICE_STATUS_CONFIGS: Record<string, BadgeConfig> = {
  paid: { label: "Pagada", variant: "default" },
  pending: { label: "Pendiente", variant: "secondary" },
  overdue: { label: "Vencida", variant: "destructive" },
  canceled: { label: "Cancelada", variant: "outline" },
  draft: { label: "Borrador", variant: "outline" },
  sent: { label: "Enviada", variant: "secondary" },
};

/**
 * Configuraciones de estado para accidentes/incidentes
 */
export const ACCIDENT_STATUS_CONFIGS: Record<string, BadgeConfig> = {
  reported: { label: "Reportado", variant: "secondary" },
  investigating: { label: "En investigación", variant: "default" },
  closed: { label: "Cerrado", variant: "outline" },
};

/**
 * Configuraciones de severidad
 */
export const SEVERITY_CONFIGS: Record<string, BadgeConfig> = {
  leve: { label: "Leve", variant: "default" },
  moderada: { label: "Moderada", variant: "secondary" },
  grave: { label: "Grave", variant: "destructive" },
  mortal: { label: "Mortal", variant: "destructive" },
};

/**
 * Configuraciones de nivel de riesgo
 */
export const RISK_LEVEL_CONFIGS: Record<string, BadgeConfig> = {
  trivial: { label: "Trivial", variant: "default" },
  tolerable: { label: "Tolerable", variant: "secondary" },
  moderado: { label: "Moderado", variant: "secondary" },
  importante: { label: "Importante", variant: "destructive" },
  intolerable: { label: "Intolerable", variant: "destructive" },
};

/**
 * Configuraciones de estado para objetivos SST
 */
export const OBJETIVO_STATUS_CONFIGS: Record<string, BadgeConfig & { icon?: string }> = {
  activo: { label: "Activo", variant: "default" },
  "en-revision": { label: "En Revisión", variant: "secondary" },
  cumplido: { label: "Cumplido", variant: "default" },
  "no-cumplido": { label: "No Cumplido", variant: "destructive" },
  suspendido: { label: "Suspendido", variant: "outline" },
};

/**
 * Configuraciones de estado para proveedores/contratistas
 */
export const PROVEEDOR_STATUS_CONFIGS: Record<string, BadgeConfig> = {
  evaluacion: { label: "En Evaluación", variant: "secondary" },
  aprobado: { label: "Aprobado", variant: "default" },
  condicional: { label: "Condicional", variant: "secondary" },
  rechazado: { label: "Rechazado", variant: "destructive" },
  inactivo: { label: "Inactivo", variant: "outline" },
};

/**
 * Configuraciones de estado para evaluaciones de proveedores
 */
export const EVALUACION_PROVEEDOR_STATUS_CONFIGS: Record<string, BadgeConfig> = {
  pendiente: { label: "Pendiente", variant: "secondary" },
  en_proceso: { label: "En Proceso", variant: "default" },
  completada: { label: "Completada", variant: "default" },
  vencida: { label: "Vencida", variant: "destructive" },
};

/**
 * Configuraciones de estado para gestión de cambios
 */
export const CAMBIO_STATUS_CONFIGS: Record<string, BadgeConfig> = {
  propuesto: { label: "Propuesto", variant: "outline" },
  en_evaluacion: { label: "En Evaluación", variant: "secondary" },
  aprobado: { label: "Aprobado", variant: "default" },
  rechazado: { label: "Rechazado", variant: "destructive" },
  en_implementacion: { label: "En Implementación", variant: "secondary" },
  implementado: { label: "Implementado", variant: "default" },
  cancelado: { label: "Cancelado", variant: "outline" },
};

/**
 * Configuraciones de estado general (fallback para otros módulos)
 */
export const GENERAL_STATUS_CONFIGS: Record<string, BadgeConfig> = {
  pendiente: { label: "Pendiente", variant: "secondary" },
  "en-progreso": { label: "En Progreso", variant: "default" },
  "en-revision": { label: "En Revisión", variant: "secondary" },
  completado: { label: "Completado", variant: "default" },
  aprobado: { label: "Aprobado", variant: "default" },
  rechazado: { label: "Rechazado", variant: "destructive" },
  cancelado: { label: "Cancelado", variant: "outline" },
  cerrado: { label: "Cerrado", variant: "outline" },
  activo: { label: "Activo", variant: "default" },
  inactivo: { label: "Inactivo", variant: "outline" },
};

/**
 * Configuraciones para cumplimiento (sí/no)
 */
export const CUMPLIMIENTO_CONFIGS: Record<string, BadgeConfig> = {
  si: { label: "Sí", variant: "default" },
  no: { label: "No", variant: "destructive" },
  "n/a": { label: "N/A", variant: "outline" },
  parcial: { label: "Parcial", variant: "secondary" },
};

/**
 * Configuraciones para nivel de impacto
 */
export const IMPACTO_CONFIGS: Record<string, BadgeConfig> = {
  bajo: { label: "Bajo", variant: "default" },
  medio: { label: "Medio", variant: "secondary" },
  alto: { label: "Alto", variant: "destructive" },
  critico: { label: "Crítico", variant: "destructive" },
};

/**
 * Configuraciones de estado para adquisiciones SST
 */
export const ADQUISICION_STATUS_CONFIGS: Record<string, BadgeConfig> = {
  solicitud: { label: "Solicitud", variant: "secondary" },
  evaluacion: { label: "Evaluación", variant: "secondary" },
  aprobado: { label: "Aprobado", variant: "default" },
  rechazado: { label: "Rechazado", variant: "destructive" },
  adquirido: { label: "Adquirido", variant: "default" },
  cancelado: { label: "Cancelado", variant: "outline" },
};

/**
 * Configuraciones para tipo de cambio/comunicación
 */
export const TIPO_CONFIGS: Record<string, BadgeConfig> = {
  organizacional: { label: "Organizacional", variant: "default" },
  tecnologico: { label: "Tecnológico", variant: "secondary" },
  proceso: { label: "Proceso", variant: "default" },
  normativo: { label: "Normativo", variant: "secondary" },
  general: { label: "General", variant: "outline" },
};

/**
 * Configuraciones de clasificación para vigilancia epidemiológica (SVE)
 */
export const SVE_CLASSIFICATION_CONFIGS: Record<string, BadgeConfig> = {
  normal: { label: "Normal", variant: "default" },
  vigilancia: { label: "Vigilancia", variant: "secondary" },
  caso_confirmado: { label: "Caso Confirmado", variant: "destructive" },
  caso_cerrado: { label: "Caso Cerrado", variant: "outline" },
};

/**
 * Obtiene la configuración de badge para un estado dado
 */
export const getBadgeConfig = (
  status: string, 
  configMap: Record<string, BadgeConfig>,
  defaultLabel?: string
): BadgeConfig => {
  return configMap[status] || { 
    label: defaultLabel || status, 
    variant: "outline" 
  };
};
