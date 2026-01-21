/**
 * Modelo de Precios V2 - Basado en Riesgo ARL
 * 
 * FÓRMULA APROBADA:
 * Precio = (Trabajadores × Tarifa por Riesgo) + (Estándares Aplicables × $8,000)
 * 
 * TARIFAS POR CLASE DE RIESGO ARL (INNEGOCIABLES):
 * - Clase I:   $26,000/trabajador/mes
 * - Clase II:  $24,000/trabajador/mes
 * - Clase III: $22,000/trabajador/mes
 * - Clase IV:  $20,000/trabajador/mes
 * - Clase V:   $20,000/trabajador/mes
 * 
 * TARIFA POR ESTÁNDAR APLICABLE: $8,000/mes
 * 
 * INCLUIDO SIN COSTO ADICIONAL:
 * - Portal del Trabajador (valor mercado $3k-$5k/usuario/mes)
 * - Portal del Licenciado SST (valor mercado $150k-$300k/mes)
 * 
 * VENTAJA COMPETITIVA:
 * - Único en Colombia con precio basado en riesgo real
 * - 2 portales gratis como "gancho" comercial
 * - Hasta 80% de ahorro vs consultor tradicional
 */

export type RiskLevel = "I" | "II" | "III" | "IV" | "V";

export interface PricingV2Config {
  tarifaClaseI: number;      // $26,000
  tarifaClaseII: number;     // $24,000
  tarifaClaseIII: number;    // $22,000
  tarifaClaseIV: number;     // $20,000
  tarifaClaseV: number;      // $20,000
  tarifaPorEstandar: number; // $8,000
  currency: string;          // COP
}

export interface PricingV2Params {
  trabajadores: number;
  claseRiesgo: RiskLevel;
  estandaresAplicables: number;
}

export interface PricingV2Result {
  claseRiesgo: RiskLevel;
  trabajadores: number;
  tarifaPorTrabajador: number;
  costoTrabajadores: number;
  estandaresAplicables: number;
  tarifaPorEstandar: number;
  costoEstandares: number;
  costoMensualTotal: number;
  costoAnualTotal: number;
  costoPorTrabajador: number;
  incluye: {
    portalTrabajador: boolean;
    portalLicenciado: boolean;
    valorMercadoPortales: string;
  };
  ahorroEstimado: string;
  currency: string;
}

export const DEFAULT_PRICING_V2_CONFIG: PricingV2Config = {
  tarifaClaseI: 26000,
  tarifaClaseII: 24000,
  tarifaClaseIII: 22000,
  tarifaClaseIV: 20000,
  tarifaClaseV: 20000,
  tarifaPorEstandar: 8000,
  currency: "COP",
};

export function getTarifaPorRiesgo(claseRiesgo: RiskLevel, config: PricingV2Config): number {
  switch (claseRiesgo) {
    case "I":
      return config.tarifaClaseI;
    case "II":
      return config.tarifaClaseII;
    case "III":
      return config.tarifaClaseIII;
    case "IV":
      return config.tarifaClaseIV;
    case "V":
      return config.tarifaClaseV;
    default:
      return config.tarifaClaseI;
  }
}

export function getDescripcionClaseRiesgo(claseRiesgo: RiskLevel): string {
  switch (claseRiesgo) {
    case "I":
      return "Riesgo Mínimo - Actividades administrativas, comerciales";
    case "II":
      return "Riesgo Bajo - Manufactura liviana, almacenes";
    case "III":
      return "Riesgo Medio - Manufactura, transporte";
    case "IV":
      return "Riesgo Alto - Construcción, minería, agricultura";
    case "V":
      return "Riesgo Máximo - Trabajo en alturas, sustancias peligrosas";
    default:
      return "Clase de riesgo no especificada";
  }
}

export function calculatePricingV2(
  params: PricingV2Params,
  config: PricingV2Config = DEFAULT_PRICING_V2_CONFIG
): PricingV2Result {
  const { trabajadores, claseRiesgo, estandaresAplicables } = params;

  if (trabajadores < 1) {
    throw new Error("El número de trabajadores debe ser al menos 1");
  }

  if (estandaresAplicables < 1) {
    throw new Error("El número de estándares aplicables debe ser al menos 1");
  }

  const tarifaPorTrabajador = getTarifaPorRiesgo(claseRiesgo, config);
  const costoTrabajadores = trabajadores * tarifaPorTrabajador;
  const costoEstandares = estandaresAplicables * config.tarifaPorEstandar;
  const costoMensualTotal = costoTrabajadores + costoEstandares;
  const costoAnualTotal = costoMensualTotal * 12;
  const costoPorTrabajador = costoMensualTotal / trabajadores;

  const costoConsultorTradicional = trabajadores * 80000;
  const ahorroPorcentaje = Math.round((1 - costoMensualTotal / costoConsultorTradicional) * 100);

  return {
    claseRiesgo,
    trabajadores,
    tarifaPorTrabajador,
    costoTrabajadores,
    estandaresAplicables,
    tarifaPorEstandar: config.tarifaPorEstandar,
    costoEstandares,
    costoMensualTotal,
    costoAnualTotal,
    costoPorTrabajador,
    incluye: {
      portalTrabajador: true,
      portalLicenciado: true,
      valorMercadoPortales: "$153,000 - $305,000/mes",
    },
    ahorroEstimado: `Hasta ${Math.max(ahorroPorcentaje, 50)}% vs consultor tradicional`,
    currency: config.currency,
  };
}

export function getEstandaresAplicablesPorClase(
  claseRiesgo: RiskLevel,
  trabajadores: number
): number {
  if (trabajadores <= 10) {
    return 7;
  } else if (trabajadores <= 50) {
    return 21;
  } else {
    return 61;
  }
}
