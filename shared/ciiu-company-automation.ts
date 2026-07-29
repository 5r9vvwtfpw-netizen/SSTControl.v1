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
  /** Código CIIU principal de la empresa (4 dígitos) */
  ciiuCode?: string | null;
  /** Código CIIU secundario (opcional) */
  ciiuCode2?: string | null;
  /** Código CIIU terciario (opcional) */
  ciiuCode3?: string | null;
  /** Código CIIU cuaternario (opcional) */
  ciiuCode4?: string | null;
  /** Nivel de riesgo proporcionado manualmente (tiene prioridad sobre CIIU) */
  manualRiskLevel?: RiskLevel | null;
  /** Número de trabajadores de la empresa */
  numberOfWorkers: number;
}

/** Orden numérico de los niveles de riesgo para comparación */
const RISK_ORDER: Record<string, number> = { I: 1, II: 2, III: 3, IV: 4, V: 5 };

/**
 * Dado un arreglo de códigos CIIU, retorna el nivel de riesgo más alto
 * y el código que lo determinó (código dominante).
 */
function getHighestRiskFromCodes(codes: (string | null | undefined)[]): {
  riskLevel: RiskLevel | null;
  dominantCode: string | null;
} {
  let highestRisk: RiskLevel | null = null;
  let dominantCode: string | null = null;

  for (const code of codes) {
    if (!code) continue;
    const result = getRiskLevelFromCiiuDetailed(code);
    if (result && result.source === 'exact') {
      if (!highestRisk || RISK_ORDER[result.riskLevel] > RISK_ORDER[highestRisk]) {
        highestRisk = result.riskLevel;
        dominantCode = code;
      }
    }
  }

  return { riskLevel: highestRisk, dominantCode };
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
  const { ciiuCode, ciiuCode2, ciiuCode3, ciiuCode4, manualRiskLevel, numberOfWorkers } = options;
  const allCodes = [ciiuCode, ciiuCode2, ciiuCode3, ciiuCode4];
  
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
  
  // Caso 2: Hay uno o más CIIUs — tomar el de mayor riesgo
  const validCodes = allCodes.filter(Boolean);
  if (validCodes.length > 0) {
    const { riskLevel: highestRisk, dominantCode } = getHighestRiskFromCodes(allCodes);

    if (highestRisk && dominantCode) {
      const chapter = calculateChapter(numberOfWorkers, highestRisk);
      const classification = getCiiuClassification(dominantCode);
      const activeCodes = allCodes.filter(Boolean).join(', ');
      return {
        ciiuCode: ciiuCode || dominantCode,
        isValidCiiu: true,
        riskLevel: highestRisk,
        calculatedChapter: chapter,
        standardsCount: getChapterStandards(chapter),
        riskSource: 'ciiu_exact',
        wasAutoAssigned: true,
        activityDescription: classification?.description,
        message: `Nivel de riesgo ${highestRisk} asignado automáticamente desde CIIU ${dominantCode} (${classification?.description || 'Actividad económica'}). CIIUs activos: ${activeCodes}. Aplican ${getChapterStandards(chapter)} estándares según Resolución 0312/2019.`
      };
    }

    // Código(s) CIIU no encontrado(s) — requiere riesgo manual
    return {
      ciiuCode: ciiuCode || '',
      isValidCiiu: false,
      riskLevel: null,
      calculatedChapter: "1",
      standardsCount: 7,
      riskSource: 'default',
      wasAutoAssigned: false,
      message: `[CIIU-WARN] Código(s) CIIU ${validCodes.join(', ')} no encontrado(s) en tabla Decreto 1607/2002. Se requiere asignar nivel de riesgo manualmente.`
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
  ciiuCode2?: string | null;
  ciiuCode3?: string | null;
  ciiuCode4?: string | null;
  riskLevel?: RiskLevel | null;
  numberOfWorkers?: number | null;
}>(companyData: T): T & { 
  riskLevel: RiskLevel;
  calculatedChapter: "1" | "2" | "3";
  _ciiuAutomationApplied?: boolean;
  _ciiuAutomationMessage?: string;
} {
  const workers = companyData.numberOfWorkers ?? 1;

  // Determinar si hay al menos un CIIU y no se proporcionó riesgo manual
  const anyCiiu = companyData.ciiuCode || companyData.ciiuCode2 || companyData.ciiuCode3 || companyData.ciiuCode4;
  const shouldAutoAssign = anyCiiu && !companyData.riskLevel;
  
  if (shouldAutoAssign) {
    const automation = processCiiuAutomation({
      ciiuCode: companyData.ciiuCode,
      ciiuCode2: companyData.ciiuCode2,
      ciiuCode3: companyData.ciiuCode3,
      ciiuCode4: companyData.ciiuCode4,
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
  
  // Si hay riesgo manual, calcular capítulo normalmente
  if (companyData.riskLevel) {
    const chapter = calculateChapter(workers, companyData.riskLevel);
    return {
      ...companyData,
      riskLevel: companyData.riskLevel,
      calculatedChapter: chapter,
      _ciiuAutomationApplied: false
    };
  }
  
  // MODO ESTRICTO: Si hay CIIU pero es inválido, NO asignar riesgo por defecto
  // El sistema debe requerir selección manual del nivel de riesgo
  if (companyData.ciiuCode && !isValidCiiuCode(companyData.ciiuCode)) {
    console.log(`[CIIU-WARN] Código CIIU ${companyData.ciiuCode} no reconocido. Se requiere nivel de riesgo manual.`);
    const chapter = calculateChapter(workers, "I"); // Temporal para cálculos
    return {
      ...companyData,
      riskLevel: "I" as RiskLevel, // Fallback conservador pero con advertencia
      calculatedChapter: chapter,
      _ciiuAutomationApplied: false,
      _ciiuAutomationMessage: `[CIIU-WARN] Código CIIU ${companyData.ciiuCode} no encontrado en Decreto 1607/2002. Nivel de riesgo I asignado temporalmente - verificar y ajustar según actividad real.`
    };
  }
  
  // Sin CIIU - usar default "I" (comportamiento normal)
  const riskLevel = companyData.riskLevel ?? "I" as RiskLevel;
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
