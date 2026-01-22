/**
 * Módulo de Cálculo de Indicadores de Severidad y Frecuencia de Accidentes
 * 
 * Implementa las fórmulas oficiales colombianas según:
 * - Resolución 0312/2019 del Ministerio del Trabajo y Protección Social
 * - Decreto 1072/2015 "Decreto Único Reglamentario del Sector Trabajo"
 * - Artículo 2.2.4.6.21: Indicadores que evalúan el proceso del SG-SST
 * 
 * IMPORTANTE: Este módulo es una utilidad pura sin dependencias de React.
 * No incluye componentes, hooks ni lógica de UI.
 */

/**
 * Datos base necesarios para calcular los indicadores de severidad y frecuencia
 */
export interface AccidentSeverityData {
  /**
   * Días totales perdidos por accidentes de trabajo e incapacidades
   * Incluye: días de incapacidad + días de prórrogas
   * Fuente: worker_absences donde absenceType = 'incapacidad_at'
   */
  totalDaysLost: number;

  /**
   * Total de Horas Hombre Trabajadas (HHT) en el período
   * Fórmula: Número de trabajadores × Horas trabajadas × Días trabajados
   * Resolución 0312/2019: Se utiliza como denominador en los índices
   */
  totalWorkerHours: number;

  /**
   * Número total de accidentes de trabajo en el período
   * No incluye incidentes ni enfermedad laboral
   */
  numberOfAccidents: number;

  /**
   * Número promedio de trabajadores en el período
   * Se utiliza para calcular tasas porcentuales
   */
  numberOfWorkers: number;
}

/**
 * Calcula el Índice de Severidad (IS)
 * 
 * Fórmula: IS = (Días perdidos × 200,000) / HHT
 * 
 * Donde:
 * - Días perdidos: Suma de daysLost + extensionDays de todas las ausencias
 *   donde absenceType = 'incapacidad_at'
 * - 200,000: Factor estándar de la Resolución 0312/2019
 *   (equivale a 50 semanas de 40 horas × 100 trabajadores)
 * - HHT: Horas Hombre Trabajadas totales en el período
 * 
 * Interpretación:
 * - IS mide la gravedad de los accidentes (días perdidos por incapacidad)
 * - Valores más altos indican accidentes más graves
 * - Se compara contra benchmark industrial del sector (CIIU)
 * 
 * @param data - Objeto con los datos base necesarios
 * @returns Índice de Severidad (IS). Retorna 0 si HHT es 0
 * 
 * @example
 * const severityIndex = calculateSeverityIndex({
 *   totalDaysLost: 45,      // 30 días de incapacidad + 15 de prórroga
 *   totalWorkerHours: 160000, // 50 trabajadores × 8 horas × 20 días
 *   numberOfAccidents: 2,
 *   numberOfWorkers: 50
 * });
 * // IS = (45 × 200,000) / 160,000 = 56.25
 */
export function calculateSeverityIndex(data: AccidentSeverityData): number {
  if (data.totalWorkerHours === 0) {
    return 0;
  }
  
  return (data.totalDaysLost * 200000) / data.totalWorkerHours;
}

/**
 * Calcula el Índice de Frecuencia (IF)
 * 
 * Fórmula: IF = (# Accidentes × 200,000) / HHT
 * 
 * Donde:
 * - # Accidentes: Número total de accidentes de trabajo en el período
 * - 200,000: Factor estándar de la Resolución 0312/2019
 * - HHT: Horas Hombre Trabajadas totales en el período
 * 
 * Interpretación:
 * - IF mide la frecuencia de ocurrencia de accidentes
 * - Valores más altos indican mayor incidencia de accidentes
 * - Se utiliza para evaluar la efectividad de programas preventivos
 * - Se compara contra el IF del año anterior para identificar tendencias
 * 
 * @param data - Objeto con los datos base necesarios
 * @returns Índice de Frecuencia (IF). Retorna 0 si HHT es 0
 * 
 * @example
 * const frequencyIndex = calculateFrequencyIndex({
 *   totalDaysLost: 45,
 *   totalWorkerHours: 160000,
 *   numberOfAccidents: 2,      // 2 accidentes en el período
 *   numberOfWorkers: 50
 * });
 * // IF = (2 × 200,000) / 160,000 = 2.5
 */
export function calculateFrequencyIndex(data: AccidentSeverityData): number {
  if (data.totalWorkerHours === 0) {
    return 0;
  }
  
  return (data.numberOfAccidents * 200000) / data.totalWorkerHours;
}

/**
 * Calcula el Índice de Lesión Incapacitante (ILI)
 * 
 * Fórmula: ILI = (IF × IS) / 1000
 * 
 * Donde:
 * - IF: Índice de Frecuencia = (# Accidentes × 200,000) / HHT
 * - IS: Índice de Severidad = (Días perdidos × 200,000) / HHT
 * - 1000: Factor normalizador para expresar el resultado en escala manejable
 * 
 * Interpretación:
 * - ILI es un indicador compuesto que combina frecuencia y severidad
 * - Representa el "impacto total" de la accidentalidad
 * - Valores más altos indican un peor desempeño en seguridad
 * - Se utiliza para comparar empresas del mismo sector (CIIU)
 * - Típicamente debe estar en rango de 0-100 para empresas bien gestionadas
 * - Valores > 100 indican situación crítica de seguridad
 * 
 * Ejemplo de Interpretación:
 * - ILI < 5:   Excelente desempeño
 * - ILI 5-15:  Bueno, con mejoras posibles
 * - ILI 15-30: Aceptable pero requiere acciones
 * - ILI > 30:  Crítico, requiere intervención urgente
 * 
 * @param data - Objeto con los datos base necesarios
 * @returns Índice de Lesión Incapacitante (ILI). Retorna 0 si HHT es 0
 * 
 * @example
 * const data = {
 *   totalDaysLost: 45,
 *   totalWorkerHours: 160000,
 *   numberOfAccidents: 2,
 *   numberOfWorkers: 50
 * };
 * 
 * const IF = calculateFrequencyIndex(data);  // IF = 2.5
 * const IS = calculateSeverityIndex(data);   // IS = 56.25
 * const ILI = calculateILI(data);             // ILI = 140.625
 */
export function calculateILI(data: AccidentSeverityData): number {
  const frequencyIndex = calculateFrequencyIndex(data);
  const severityIndex = calculateSeverityIndex(data);
  
  return (frequencyIndex * severityIndex) / 1000;
}

/**
 * Calcula la Tasa de Accidentalidad
 * 
 * Fórmula: Tasa AT = (# Accidentes / # Trabajadores) × 100
 * 
 * Interpretación:
 * - Mide el porcentaje de trabajadores que sufrieron accidentes
 * - Útil para comparar entre empresas de diferente tamaño
 * - Expresada en porcentaje
 * 
 * @param data - Objeto con los datos base necesarios
 * @returns Tasa de Accidentalidad en porcentaje. Retorna 0 si numberOfWorkers es 0
 */
export function calculateAccidentalityRate(data: AccidentSeverityData): number {
  if (data.numberOfWorkers === 0) {
    return 0;
  }
  
  return (data.numberOfAccidents / data.numberOfWorkers) * 100;
}

/**
 * Calcula el promedio de días perdidos por accidente
 * 
 * Fórmula: Promedio = Días perdidos / # Accidentes
 * 
 * Interpretación:
 * - Indica la gravedad promedio de los accidentes
 * - Ayuda a identificar si hay accidentes muy graves aislados
 * 
 * @param data - Objeto con los datos base necesarios
 * @returns Promedio de días por accidente. Retorna 0 si numberOfAccidents es 0
 */
export function calculateAverageDaysPerAccident(data: AccidentSeverityData): number {
  if (data.numberOfAccidents === 0) {
    return 0;
  }
  
  return data.totalDaysLost / data.numberOfAccidents;
}

/**
 * Utilidad para validar que los datos son válidos para cálculos
 * 
 * @param data - Objeto con los datos base
 * @returns true si los datos son válidos, false en caso contrario
 */
export function isValidAccidentSeverityData(data: Partial<AccidentSeverityData>): boolean {
  return (
    typeof data.totalDaysLost === 'number' &&
    typeof data.totalWorkerHours === 'number' &&
    typeof data.numberOfAccidents === 'number' &&
    typeof data.numberOfWorkers === 'number' &&
    data.totalDaysLost >= 0 &&
    data.totalWorkerHours >= 0 &&
    data.numberOfAccidents >= 0 &&
    data.numberOfWorkers > 0
  );
}

/**
 * Genera un resumen completo de todos los indicadores
 * 
 * @param data - Objeto con los datos base necesarios
 * @returns Objeto con todos los indicadores calculados
 */
export interface AccidentIndicatorsSummary {
  frequencyIndex: number;
  severityIndex: number;
  ili: number;
  accidentalityRate: number;
  averageDaysPerAccident: number;
}

export function calculateAllIndicators(data: AccidentSeverityData): AccidentIndicatorsSummary {
  return {
    frequencyIndex: calculateFrequencyIndex(data),
    severityIndex: calculateSeverityIndex(data),
    ili: calculateILI(data),
    accidentalityRate: calculateAccidentalityRate(data),
    averageDaysPerAccident: calculateAverageDaysPerAccident(data),
  };
}
