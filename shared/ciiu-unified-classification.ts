/**
 * Clasificación CIIU Unificada - Sistema de Riesgos Laborales Colombia
 * 
 * Este archivo unifica las clasificaciones CIIU de:
 * - Decreto 1607/2002 (archivo ciiu-risk-classification.ts)
 * - Decreto 768/2022 (archivo ciiu-decreto-768-2022.ts)
 * 
 * El Decreto 768/2022 derogó el Decreto 1607/2002, pero este archivo
 * mantiene compatibilidad con ambos para manejar códigos históricos.
 * 
 * Norma vigente: Decreto 768 de 2022 (desde 17 nov 2022)
 * 
 * @author SST Colombia
 * @version 1.0.0
 * @date 2026-01
 */

import { 
  CIIU_RISK_CLASSIFICATION, 
  type RiskLevel,
  type CiiuClassification 
} from './ciiu-risk-classification';

import { 
  CIIU_DECRETO_768, 
  TASAS_COTIZACION,
  type CiiuDecreto768 
} from './ciiu-decreto-768-2022';

export { RiskLevel, TASAS_COTIZACION };

export interface CiiuUnifiedResult {
  found: boolean;
  ciiu: string;
  description: string;
  riskLevel: RiskLevel;
  riskClass: 1 | 2 | 3 | 4 | 5;
  cotizacion: number;
  source: 'decreto_768_2022' | 'decreto_1607_2002' | 'not_found';
  division: string;
}

const riskLevelToClass = (level: RiskLevel): 1 | 2 | 3 | 4 | 5 => {
  const map: Record<RiskLevel, 1 | 2 | 3 | 4 | 5> = {
    "I": 1, "II": 2, "III": 3, "IV": 4, "V": 5
  };
  return map[level];
};

/**
 * Obtiene la clasificación de riesgo para un código CIIU
 * Prioriza el Decreto 768/2022 (norma vigente) sobre el Decreto 1607/2002
 * 
 * @param ciiu - Código CIIU de 4 dígitos
 * @returns Información unificada de clasificación
 */
export function getCiiuRiskClassification(ciiu: string | null | undefined): CiiuUnifiedResult {
  const defaultResult: CiiuUnifiedResult = {
    found: false,
    ciiu: ciiu || '',
    description: 'Código CIIU no encontrado',
    riskLevel: 'I',
    riskClass: 1,
    cotizacion: TASAS_COTIZACION[1],
    source: 'not_found',
    division: '',
  };

  if (!ciiu) {
    return defaultResult;
  }

  const normalizedCiiu = ciiu.trim().replace(/\D/g, '').substring(0, 4);

  if (CIIU_DECRETO_768[normalizedCiiu]) {
    const entry = CIIU_DECRETO_768[normalizedCiiu];
    return {
      found: true,
      ciiu: normalizedCiiu,
      description: entry.description,
      riskLevel: entry.riskLevel,
      riskClass: entry.riskClass,
      cotizacion: entry.cotizacion,
      source: 'decreto_768_2022',
      division: entry.division,
    };
  }

  if (CIIU_RISK_CLASSIFICATION[normalizedCiiu]) {
    const entry = CIIU_RISK_CLASSIFICATION[normalizedCiiu];
    return {
      found: true,
      ciiu: normalizedCiiu,
      description: entry.description,
      riskLevel: entry.riskLevel,
      riskClass: riskLevelToClass(entry.riskLevel),
      cotizacion: TASAS_COTIZACION[riskLevelToClass(entry.riskLevel)],
      source: 'decreto_1607_2002',
      division: entry.division,
    };
  }

  return defaultResult;
}

/**
 * Obtiene todos los códigos CIIU disponibles (unificados)
 */
export function getAllCiiuCodes(): string[] {
  const codes1607 = Object.keys(CIIU_RISK_CLASSIFICATION);
  const codes768 = Object.keys(CIIU_DECRETO_768);
  const allCodes = Array.from(new Set(codes768.concat(codes1607)));
  return allCodes.sort();
}

/**
 * Obtiene estadísticas de la clasificación unificada
 */
export function getUnifiedCiiuStats(): {
  totalDecrero768: number;
  totalDecreto1607: number;
  totalUnified: number;
} {
  const codes1607 = Object.keys(CIIU_RISK_CLASSIFICATION).length;
  const codes768 = Object.keys(CIIU_DECRETO_768).length;
  const allCodes = getAllCiiuCodes().length;
  
  return {
    totalDecrero768: codes768,
    totalDecreto1607: codes1607,
    totalUnified: allCodes,
  };
}

/**
 * Marco legal aplicable para clasificación de riesgos laborales
 */
export const MARCO_LEGAL_CLASIFICACION_RIESGOS = {
  vigente: {
    norma: 'Decreto 768 de 2022',
    expedido: '16 de mayo de 2022',
    vigente_desde: '17 de noviembre de 2022',
    objeto: 'Actualiza la Tabla de Clasificación de Actividades Económicas para el Sistema General de Riesgos Laborales',
    deroga: 'Decreto 1607 de 2002',
    actividades: 1104,
  },
  derogado: {
    norma: 'Decreto 1607 de 2002',
    objeto: 'Tabla de Clasificación de Actividades Económicas para el Sistema General de Riesgos Profesionales',
    actividades: 604,
    estado: 'DEROGADO por Decreto 768 de 2022',
  },
  relacionadas: [
    {
      norma: 'Resolución DANE 066 de 2012',
      objeto: 'Adopta CIIU Rev. 4 A.C. para Colombia',
    },
    {
      norma: 'Decreto 1072 de 2015',
      objeto: 'Decreto Único Reglamentario del Sector Trabajo',
    },
    {
      norma: 'Resolución 0312 de 2019',
      objeto: 'Estándares Mínimos del SG-SST',
    },
    {
      norma: 'Ley 1562 de 2012',
      objeto: 'Modifica el Sistema de Riesgos Laborales',
    },
  ],
} as const;
