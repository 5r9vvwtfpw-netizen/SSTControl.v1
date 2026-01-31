/**
 * Módulo de Precios PESV - Plan Estratégico de Seguridad Vial
 * 
 * PRINCIPIO DE CÓDIGO SEGURO: Solo agregar código nuevo
 * Creado: Enero 2026
 * 
 * FÓRMULA PESV:
 * Costo PESV = Pasos Aplicables × Tarifa por Paso ($8,000)
 * 
 * NIVELES PESV (Resolución 40595/2022):
 * - Básico:   1-10 vehículos  → 20 pasos → $160,000/mes
 * - Estándar: 11-50 vehículos → 24 pasos → $192,000/mes
 * - Avanzado: 50+ vehículos   → 24 pasos → $192,000/mes
 * 
 * TARIFA POR PASO PESV: $8,000/mes (igual a estándar SST)
 */

export type NivelPesv = 'basico' | 'estandar' | 'avanzado';

export interface PesvPricingConfig {
  tarifaPorPasoPesv: number;  // $8,000 (igual a estándar SST)
  currency: string;           // COP
}

export interface PesvPricingParams {
  vehiculos: number;
}

export interface PesvPricingResult {
  vehiculos: number;
  nivelPesv: NivelPesv;
  nivelPesvLabel: string;
  pasosAplicables: number;
  tarifaPorPaso: number;
  costoMensualPesv: number;
  costoAnualPesv: number;
  desglosePorFase: {
    planear: number;
    hacer: number;
    verificar: number;
    actuar: number;
  };
  currency: string;
}

export const DEFAULT_PESV_PRICING_CONFIG: PesvPricingConfig = {
  tarifaPorPasoPesv: 8000,  // $8,000 por paso (igual a estándar SST)
  currency: "COP",
};

/**
 * Determina el nivel PESV basado en el número de vehículos
 * Según Resolución 40595 de 2022
 */
export function getNivelPesv(vehiculos: number): NivelPesv {
  if (vehiculos <= 0) {
    throw new Error("El número de vehículos debe ser mayor a 0");
  }
  
  if (vehiculos <= 10) {
    return 'basico';
  } else if (vehiculos <= 50) {
    return 'estandar';
  } else {
    return 'avanzado';
  }
}

/**
 * Obtiene la etiqueta descriptiva del nivel PESV
 */
export function getNivelPesvLabel(nivel: NivelPesv): string {
  switch (nivel) {
    case 'basico':
      return 'Básico (1-10 vehículos)';
    case 'estandar':
      return 'Estándar (11-50 vehículos)';
    case 'avanzado':
      return 'Avanzado (50+ vehículos)';
  }
}

/**
 * Obtiene el número de pasos PESV aplicables por nivel
 * Basado en los datos de shared/pasos-pesv.ts
 * 
 * - Básico: 20 pasos (H07, H08, H09, V03 no aplican)
 * - Estándar: 24 pasos (todos aplican)
 * - Avanzado: 24 pasos (todos aplican)
 */
export function getPasosAplicablesPorNivel(nivel: NivelPesv): number {
  switch (nivel) {
    case 'basico':
      return 20;  // 24 - 4 (H07, H08, H09, V03 no aplican)
    case 'estandar':
      return 24;  // Todos aplican
    case 'avanzado':
      return 24;  // Todos aplican
  }
}

/**
 * Obtiene el desglose de pasos por fase PHVA
 */
export function getDesglosePorFase(nivel: NivelPesv): {
  planear: number;
  hacer: number;
  verificar: number;
  actuar: number;
} {
  switch (nivel) {
    case 'basico':
      return {
        planear: 8,   // P01-P08 (todos aplican)
        hacer: 8,     // H01-H06, H10, H11 (H07, H08, H09 no aplican)
        verificar: 2, // V01, V02 (V03 no aplica)
        actuar: 2     // A01, A02 (todos aplican)
      };
    case 'estandar':
    case 'avanzado':
      return {
        planear: 8,    // P01-P08
        hacer: 11,     // H01-H11
        verificar: 3,  // V01-V03
        actuar: 2      // A01-A02
      };
  }
}

/**
 * Calcula el costo del módulo PESV
 */
export function calculatePesvPricing(
  params: PesvPricingParams,
  config: PesvPricingConfig = DEFAULT_PESV_PRICING_CONFIG
): PesvPricingResult {
  const { vehiculos } = params;

  if (vehiculos < 1) {
    throw new Error("El número de vehículos debe ser al menos 1");
  }

  const nivelPesv = getNivelPesv(vehiculos);
  const pasosAplicables = getPasosAplicablesPorNivel(nivelPesv);
  const costoMensualPesv = pasosAplicables * config.tarifaPorPasoPesv;
  const costoAnualPesv = costoMensualPesv * 12;

  return {
    vehiculos,
    nivelPesv,
    nivelPesvLabel: getNivelPesvLabel(nivelPesv),
    pasosAplicables,
    tarifaPorPaso: config.tarifaPorPasoPesv,
    costoMensualPesv,
    costoAnualPesv,
    desglosePorFase: getDesglosePorFase(nivelPesv),
    currency: config.currency,
  };
}

/**
 * Combina el cálculo SST + PESV para obtener el costo total
 */
export interface CombinedPricingParams {
  trabajadores: number;
  claseRiesgo: "I" | "II" | "III" | "IV" | "V";
  estandaresAplicables: number;
  vehiculos: number;  // Si es 0, no se cobra PESV
}

export interface CombinedPricingResult {
  // SST
  costoTrabajadores: number;
  costoEstandaresSst: number;
  subtotalSst: number;
  
  // PESV (solo si vehiculos > 0)
  tienePesv: boolean;
  costoPasosPesv: number;
  nivelPesv?: NivelPesv;
  pasosAplicablesPesv?: number;
  
  // Totales
  costoMensualTotal: number;
  costoAnualTotal: number;
  currency: string;
}

/**
 * Calcula el costo combinado SST + PESV
 * 
 * Fórmula:
 * Total = (Trabajadores × Tarifa Riesgo) + (Estándares SST × $8,000) + (Pasos PESV × $8,000)
 */
export function calculateCombinedPricing(
  params: CombinedPricingParams,
  tarifaPorTrabajador: number,
  tarifaPorEstandar: number = 8000,
  tarifaPorPasoPesv: number = 8000
): CombinedPricingResult {
  const { trabajadores, estandaresAplicables, vehiculos } = params;

  // Cálculo SST
  const costoTrabajadores = trabajadores * tarifaPorTrabajador;
  const costoEstandaresSst = estandaresAplicables * tarifaPorEstandar;
  const subtotalSst = costoTrabajadores + costoEstandaresSst;

  // Cálculo PESV (solo si tiene vehículos)
  let tienePesv = false;
  let costoPasosPesv = 0;
  let nivelPesv: NivelPesv | undefined;
  let pasosAplicablesPesv: number | undefined;

  if (vehiculos > 0) {
    tienePesv = true;
    nivelPesv = getNivelPesv(vehiculos);
    pasosAplicablesPesv = getPasosAplicablesPorNivel(nivelPesv);
    costoPasosPesv = pasosAplicablesPesv * tarifaPorPasoPesv;
  }

  // Totales
  const costoMensualTotal = subtotalSst + costoPasosPesv;
  const costoAnualTotal = costoMensualTotal * 12;

  return {
    costoTrabajadores,
    costoEstandaresSst,
    subtotalSst,
    tienePesv,
    costoPasosPesv,
    nivelPesv,
    pasosAplicablesPesv,
    costoMensualTotal,
    costoAnualTotal,
    currency: "COP",
  };
}
