/**
 * Automatización CIIU para Empresas
 * 
 * Este módulo integra la clasificación CIIU con el sistema de empresas,
 * permitiendo la asignación automática de nivel de riesgo ARL basado
 * en el código CIIU de la empresa.
 * 
 * Referencias normativas:
 * - Decreto 1607 de 2002: Clasificación de Actividades Económicas
 * - Resolución 0312 de 2019: Estándares Mínimos del SG-SST
 * 
 * Principio: Solo agregar código - Este archivo es independiente y no modifica
 * ningún archivo existente del sistema.
 * 
 * @author SST Colombia
 * @version 1.0.0
 * @date 2026-01
 */

import { 
  getRiskLevelFromCiiu, 
  getRiskLevelFromCiiuDetailed,
  isValidCiiuCode,
  getCiiuClassification,
  type RiskLevel,
  type CiiuLookupResult
} from './ciiu-risk-classification';

import { calculateChapter, getChapterStandards } from './utils';

/**
 * Resultado de la automatización CIIU para una empresa
 */
export interface CiiuAutomationResult {
  /** Código CIIU procesado */
  ciiuCode: string;
  /** Si el código CIIU es válido y existe en la tabla */
  isValidCiiu: boolean;
  /** Nivel de riesgo determinado (null si no se pudo determinar) */
  riskLevel: RiskLevel | null;
  /** Capítulo calculado basado en trabajadores y riesgo */
  calculatedChapter: "1" | "2" | "3";
  /** Número de estándares que aplican */
  standardsCount: number;
  /** Fuente del nivel de riesgo */
  riskSource: 'ciiu_exact' | 'manual' | 'default';
  /** Si el riesgo fue asignado automáticamente desde CIIU */
  wasAutoAssigned: boolean;
  /** Descripción de la actividad económica (si existe) */
  activityDescription?: string;
  /** Mensaje informativo sobre la clasificación */
  message: string;
}

/**
 * Opciones para la automatización CIIU
 */
export interface CiiuAutomationOptions {
  /** Código CIIU de la empresa (4 dígitos) */
  ciiuCode?: string | null;
  /** Nivel de riesgo proporcionado manualmente (tiene prioridad sobre CIIU) */
  manualRiskLevel?: RiskLevel | null;
  /** Número de trabajadores de la empresa */
  numberOfWorkers: number;
}

/**
 * Procesa la automatización CIIU para una empresa
 * 
 * Lógica de prioridad:
 * 1. Si se proporciona `manualRiskLevel`, se usa ese (el usuario sabe mejor)
 * 2. Si hay `ciiuCode` válido, se obtiene el riesgo automáticamente
 * 3. Si no hay ninguno, se usa el default "I"
 * 
 * @param options - Opciones con CIIU, riesgo manual y trabajadores
 * @returns Resultado con nivel de riesgo, capítulo y estándares
 * 
 * @example
 * // Empresa de minería con CIIU
 * const result = processCiiuAutomation({
 *   ciiuCode: "0510", // Extracción de carbón
 *   numberOfWorkers: 15
 * });
 * // result.riskLevel = "V"
 * // result.calculatedChapter = "3"
 * // result.standardsCount = 61
 * // result.wasAutoAssigned = true
 */
export function processCiiuAutomation(options: CiiuAutomationOptions): CiiuAutomationResult {
  const { ciiuCode, manualRiskLevel, numberOfWorkers } = options;
  
  // Caso 1: Nivel de riesgo proporcionado manualmente (prioridad máxima)
  if (manualRiskLevel) {
    const chapter = calculateChapter(numberOfWorkers, manualRiskLevel);
    return {
      ciiuCode: ciiuCode || '',
      isValidCiiu: ciiuCode ? isValidCiiuCode(ciiuCode) : false,
      riskLevel: manualRiskLevel,
      calculatedChapter: chapter,
      standardsCount: getChapterStandards(chapter),
      riskSource: 'manual',
      wasAutoAssigned: false,
      message: `Nivel de riesgo ${manualRiskLevel} asignado manualmente. Aplican ${getChapterStandards(chapter)} estándares.`
    };
  }
  
  // Caso 2: Hay código CIIU - intentar obtener riesgo automáticamente
  if (ciiuCode) {
    const ciiuResult = getRiskLevelFromCiiuDetailed(ciiuCode);
    const classification = getCiiuClassification(ciiuCode);
    
    if (ciiuResult && ciiuResult.source === 'exact') {
      // Código CIIU encontrado exactamente en la tabla
      const chapter = calculateChapter(numberOfWorkers, ciiuResult.riskLevel);
      return {
        ciiuCode,
        isValidCiiu: true,
        riskLevel: ciiuResult.riskLevel,
        calculatedChapter: chapter,
        standardsCount: getChapterStandards(chapter),
        riskSource: 'ciiu_exact',
        wasAutoAssigned: true,
        activityDescription: classification?.description,
        message: `Nivel de riesgo ${ciiuResult.riskLevel} asignado automáticamente desde CIIU ${ciiuCode} (${classification?.description || 'Actividad económica'}). Aplican ${getChapterStandards(chapter)} estándares obligatorios según Resolución 0312/2019.`
      };
    }
    
    // Código CIIU no encontrado - usar default pero informar
    const defaultRisk: RiskLevel = "I";
    const chapter = calculateChapter(numberOfWorkers, defaultRisk);
    return {
      ciiuCode,
      isValidCiiu: false,
      riskLevel: defaultRisk,
      calculatedChapter: chapter,
      standardsCount: getChapterStandards(chapter),
      riskSource: 'default',
      wasAutoAssigned: false,
      message: `Código CIIU ${ciiuCode} no encontrado en tabla Decreto 1607/2002. Se asignó nivel de riesgo I por defecto. Recomendación: Verificar el código CIIU o asignar nivel de riesgo manualmente.`
    };
  }
  
  // Caso 3: Sin CIIU ni riesgo manual - usar default
  const defaultRisk: RiskLevel = "I";
  const chapter = calculateChapter(numberOfWorkers, defaultRisk);
  return {
    ciiuCode: '',
    isValidCiiu: false,
    riskLevel: defaultRisk,
    calculatedChapter: chapter,
    standardsCount: getChapterStandards(chapter),
    riskSource: 'default',
    wasAutoAssigned: false,
    message: `Sin código CIIU. Nivel de riesgo I asignado por defecto. Aplican ${getChapterStandards(chapter)} estándares.`
  };
}

/**
 * Prepara los datos de empresa con automatización CIIU antes de guardar
 * 
 * Esta función debe llamarse antes de crear o actualizar una empresa.
 * Automáticamente asigna el nivel de riesgo si hay un código CIIU válido
 * y el usuario no proporcionó un nivel de riesgo manual.
 * 
 * @param companyData - Datos de la empresa a procesar
 * @returns Datos procesados con riesgo y capítulo calculados
 */
export function prepareCompanyWithCiiuAutomation<T extends {
  ciiuCode?: string | null;
  riskLevel?: RiskLevel | null;
  numberOfWorkers?: number | null;
}>(companyData: T): T & { 
  riskLevel: RiskLevel;
  calculatedChapter: "1" | "2" | "3";
  _ciiuAutomationApplied?: boolean;
  _ciiuAutomationMessage?: string;
} {
  const workers = companyData.numberOfWorkers ?? 1;
  
  // Determinar si debemos auto-asignar el nivel de riesgo
  // Solo auto-asignar si:
  // 1. Hay un código CIIU
  // 2. No se proporcionó un nivel de riesgo manualmente
  const shouldAutoAssign = companyData.ciiuCode && !companyData.riskLevel;
  
  if (shouldAutoAssign) {
    const automation = processCiiuAutomation({
      ciiuCode: companyData.ciiuCode,
      numberOfWorkers: workers
    });
    
    if (automation.wasAutoAssigned && automation.riskLevel) {
      return {
        ...companyData,
        riskLevel: automation.riskLevel,
        calculatedChapter: automation.calculatedChapter,
        _ciiuAutomationApplied: true,
        _ciiuAutomationMessage: automation.message
      };
    }
  }
  
  // Si hay riesgo manual o no se pudo auto-asignar, calcular capítulo normalmente
  const riskLevel = companyData.riskLevel ?? "I";
  const chapter = calculateChapter(workers, riskLevel);
  
  return {
    ...companyData,
    riskLevel,
    calculatedChapter: chapter,
    _ciiuAutomationApplied: false
  };
}

/**
 * Simula la automatización CIIU para preview (sin guardar)
 * 
 * Útil para mostrar al usuario qué pasaría si registra una empresa
 * con un código CIIU específico.
 * 
 * @param ciiuCode - Código CIIU a simular
 * @param numberOfWorkers - Número de trabajadores
 * @returns Resultado de la simulación
 */
export function simulateCiiuAutomation(
  ciiuCode: string,
  numberOfWorkers: number = 10
): CiiuAutomationResult {
  return processCiiuAutomation({
    ciiuCode,
    numberOfWorkers
  });
}

/**
 * Obtiene un resumen de la clasificación para una lista de códigos CIIU
 * Útil para reportes y análisis
 */
export function batchCiiuClassification(ciiuCodes: string[]): {
  code: string;
  riskLevel: RiskLevel | null;
  isValid: boolean;
  description?: string;
}[] {
  return ciiuCodes.map(code => {
    const classification = getCiiuClassification(code);
    const riskLevel = getRiskLevelFromCiiu(code);
    
    return {
      code,
      riskLevel,
      isValid: isValidCiiuCode(code),
      description: classification?.description
    };
  });
}
