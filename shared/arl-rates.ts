// Tasas de cotización ARL según Decreto 1072/2015 y Decreto 1295/1994
// Basadas en el nivel de riesgo de la actividad económica
// Actualizado para 2025

import type { RiskLevel } from "./schema";

export interface ArlRate {
  class: RiskLevel;
  initialRate: number; // % sobre IBC
  minRate: number;     // % sobre IBC
  maxRate: number;     // % sobre IBC
  description: string;
  examples: string[];
}

export const arlRates: Record<RiskLevel, ArlRate> = {
  "I": {
    class: "I",
    initialRate: 0.522,
    minRate: 0.348,
    maxRate: 0.696,
    description: "Riesgo Mínimo",
    examples: [
      "Actividades financieras",
      "Trabajos de oficina y administrativos",
      "Centros educativos",
      "Empresas de software y tecnología"
    ]
  },
  "II": {
    class: "II",
    initialRate: 1.044,
    minRate: 0.435,
    maxRate: 1.653,
    description: "Riesgo Bajo",
    examples: [
      "Comercio al por mayor y menor",
      "Restaurantes y hoteles",
      "Algunas manufacturas livianas",
      "Actividades de servicios"
    ]
  },
  "III": {
    class: "III",
    initialRate: 2.436,
    minRate: 0.783,
    maxRate: 3.654,
    description: "Riesgo Medio",
    examples: [
      "Manufactura de productos",
      "Talleres mecánicos",
      "Industria automotriz",
      "Fabricación de alimentos"
    ]
  },
  "IV": {
    class: "IV",
    initialRate: 4.350,
    minRate: 1.740,
    maxRate: 6.960,
    description: "Riesgo Alto",
    examples: [
      "Construcción",
      "Transporte terrestre",
      "Industria química",
      "Trabajos en altura"
    ]
  },
  "V": {
    class: "V",
    initialRate: 6.960,
    minRate: 3.219,
    maxRate: 8.700,
    description: "Riesgo Máximo",
    examples: [
      "Minería subterránea",
      "Manejo de explosivos",
      "Exposición a radiaciones ionizantes",
      "Exposición a sustancias cancerígenas"
    ]
  }
};

// Función para obtener la tasa inicial de ARL según clase de riesgo
export function getArlRate(riskClass: RiskLevel): ArlRate {
  return arlRates[riskClass];
}

// Función para calcular el valor de la cotización ARL
export function calculateArlContribution(salary: number, riskClass: RiskLevel): number {
  const rate = arlRates[riskClass].initialRate;
  return Math.round(salary * (rate / 100));
}

// Función para obtener el porcentaje formateado
export function getArlRateFormatted(riskClass: RiskLevel): string {
  const rate = arlRates[riskClass].initialRate;
  return `${rate}%`;
}

// Labels para tipos de contrato
export const contractTypeLabels: Record<string, string> = {
  "indefinido": "Término Indefinido",
  "fijo": "Término Fijo",
  "obra_labor": "Obra o Labor",
  "ocasional": "Ocasional/Transitorio",
  "aprendizaje": "Aprendizaje",
  "servicios": "Prestación de Servicios"
};

// Labels para tipos de examen médico
export const medicalExamTypeLabels: Record<string, string> = {
  "preocupacional": "Pre-ocupacional (Ingreso)",
  "periodico": "Periódico Programado",
  "cambio_ocupacion": "Cambio de Ocupación",
  "post_incapacidad": "Post-Incapacidad",
  "egreso": "Egreso (Retiro)"
};

// Labels para aptitud médica
export const medicalAptitudeLabels: Record<string, string> = {
  "apto": "Apto",
  "apto_con_restricciones": "Apto con Restricciones",
  "no_apto_temporal": "No Apto Temporal",
  "no_apto_permanente": "No Apto Permanente"
};

// Frecuencias recomendadas de exámenes periódicos según clase de riesgo
export const examFrequencyByRisk: Record<RiskLevel, number> = {
  "I": 24,    // Cada 2 años para riesgo mínimo
  "II": 24,   // Cada 2 años para riesgo bajo
  "III": 12,  // Cada año para riesgo medio
  "IV": 12,   // Cada año para riesgo alto
  "V": 6      // Cada 6 meses para riesgo máximo
};
