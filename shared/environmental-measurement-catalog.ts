export type EnvironmentalMeasurementType =
  | "ruido"
  | "iluminacion"
  | "temperatura"
  | "agentes_quimicos"
  | "material_particulado"
  | "vibraciones";

export interface EnvironmentalMeasurementOption {
  value: string;
  label: string;
  legalLimit: string;
  unit: string;
  reference: string;
}

export interface EnvironmentalMeasurementCatalogEntry {
  unit: string;
  legalLimit: string;
  reference: string;
  options: EnvironmentalMeasurementOption[];
}

/**
 * Valores y escenarios de referencia para orientar el registro de mediciones.
 * Los agentes químicos y las vibraciones requieren confirmar la sustancia,
 * la vía de exposición y/o el equipo utilizado en la evaluación higiénica.
 */
export const ENVIRONMENTAL_MEASUREMENT_CATALOG: Record<
  EnvironmentalMeasurementType,
  EnvironmentalMeasurementCatalogEntry
> = {
  ruido: {
    unit: "dB(A)",
    legalLimit: "85 dB(A) para una exposición máxima de 8 horas",
    reference: "Resolución 1792 de 1990 y Resolución 2400 de 1979",
    options: [
      {
        value: "85",
        label: "85 dB(A) — exposición máxima de 8 horas",
        legalLimit: "85 dB(A) — 8 horas",
        unit: "dB(A)",
        reference: "Resolución 1792 de 1990",
      },
      {
        value: "90",
        label: "90 dB(A) — exposición máxima de 4 horas",
        legalLimit: "90 dB(A) — 4 horas",
        unit: "dB(A)",
        reference: "Resolución 1792 de 1990",
      },
      {
        value: "95",
        label: "95 dB(A) — exposición máxima de 2 horas",
        legalLimit: "95 dB(A) — 2 horas",
        unit: "dB(A)",
        reference: "Resolución 1792 de 1990",
      },
      {
        value: "100",
        label: "100 dB(A) — exposición máxima de 1 hora",
        legalLimit: "100 dB(A) — 1 hora",
        unit: "dB(A)",
        reference: "Resolución 1792 de 1990",
      },
      {
        value: "105",
        label: "105 dB(A) — exposición máxima de 30 minutos",
        legalLimit: "105 dB(A) — 30 minutos",
        unit: "dB(A)",
        reference: "Resolución 1792 de 1990",
      },
      {
        value: "110",
        label: "110 dB(A) — exposición máxima de 15 minutos",
        legalLimit: "110 dB(A) — 15 minutos",
        unit: "dB(A)",
        reference: "Resolución 1792 de 1990",
      },
      {
        value: "115",
        label: "115 dB(A) — exposición máxima de 7,5 minutos",
        legalLimit: "115 dB(A) — 7,5 minutos",
        unit: "dB(A)",
        reference: "Resolución 1792 de 1990",
      },
    ],
  },
  iluminacion: {
    unit: "lux",
    legalLimit: "Nivel mínimo según actividad y precisión visual",
    reference: "Resolución 2400 de 1979 — niveles de iluminación según actividad",
    options: [
      {
        value: "100",
        label: "100 lux — circulación y actividades de baja exigencia visual",
        legalLimit: "Mínimo de referencia: 100 lux",
        unit: "lux",
        reference: "Resolución 2400 de 1979",
      },
      {
        value: "200",
        label: "200 lux — áreas generales de trabajo",
        legalLimit: "Mínimo de referencia: 200 lux",
        unit: "lux",
        reference: "Resolución 2400 de 1979",
      },
      {
        value: "300",
        label: "300 lux — oficinas y trabajo administrativo",
        legalLimit: "Mínimo de referencia: 300 lux",
        unit: "lux",
        reference: "Resolución 2400 de 1979",
      },
      {
        value: "500",
        label: "500 lux — trabajo normal y manufactura",
        legalLimit: "Mínimo de referencia: 500 lux",
        unit: "lux",
        reference: "Resolución 2400 de 1979",
      },
      {
        value: "750",
        label: "750 lux — trabajo fino o de mayor precisión",
        legalLimit: "Mínimo de referencia: 750 lux",
        unit: "lux",
        reference: "Resolución 2400 de 1979",
      },
      {
        value: "1000",
        label: "1000 lux — alta precisión o detalle crítico",
        legalLimit: "Mínimo de referencia: 1000 lux",
        unit: "lux",
        reference: "Resolución 2400 de 1979",
      },
    ],
  },
  temperatura: {
    unit: "°C",
    legalLimit: "Evaluar confort y estrés térmico según carga de trabajo",
    reference: "Resolución 2400 de 1979 — condiciones de temperatura y ventilación",
    options: [
      {
        value: "16-24",
        label: "16–24 °C — rango de confort térmico de referencia",
        legalLimit: "Rango de confort de referencia: 16–24 °C",
        unit: "°C",
        reference: "Referencia de confort térmico; validar carga térmica",
      },
      {
        value: "25-28",
        label: "25–28 °C — requiere revisar carga térmica y ventilación",
        legalLimit: "Requiere evaluación de carga térmica",
        unit: "°C",
        reference: "Resolución 2400 de 1979",
      },
      {
        value: "mayor-28",
        label: "Mayor de 28 °C — requiere evaluación de estrés térmico",
        legalLimit: "Requiere evaluación higiénica de estrés térmico",
        unit: "°C",
        reference: "Resolución 2400 de 1979",
      },
      {
        value: "menor-16",
        label: "Menor de 16 °C — requiere evaluación de exposición al frío",
        legalLimit: "Requiere evaluación higiénica de exposición al frío",
        unit: "°C",
        reference: "Resolución 2400 de 1979",
      },
    ],
  },
  agentes_quimicos: {
    unit: "mg/m³ o ppm",
    legalLimit: "Según sustancia, concentración y tiempo de exposición",
    reference: "Resolución 2400 de 1979 y valor límite aplicable a la sustancia",
    options: [
      {
        value: "dentro-limite",
        label: "Concentración dentro del límite permisible de la sustancia",
        legalLimit: "Dentro del valor límite aplicable",
        unit: "mg/m³ o ppm",
        reference: "Debe verificarse contra la sustancia evaluada y su VLP",
      },
      {
        value: "sobre-limite",
        label: "Concentración superior al límite permisible de la sustancia",
        legalLimit: "Supera el valor límite aplicable",
        unit: "mg/m³ o ppm",
        reference: "Requiere acción correctiva y confirmación higiénica",
      },
      {
        value: "no-detectable",
        label: "Concentración no detectable por el método utilizado",
        legalLimit: "No detectable por el método de medición",
        unit: "mg/m³ o ppm",
        reference: "Conservar el límite de detección del laboratorio",
      },
    ],
  },
  material_particulado: {
    unit: "mg/m³",
    legalLimit: "Según fracción y composición del material",
    reference: "Resolución 2400 de 1979 y evaluación de higiene ocupacional",
    options: [
      {
        value: "inhalable-10",
        label: "Polvo inhalable — referencia de 10 mg/m³",
        legalLimit: "Referencia: 10 mg/m³",
        unit: "mg/m³",
        reference: "Valor de referencia de higiene ocupacional; confirmar composición",
      },
      {
        value: "respirable-3",
        label: "Polvo respirable — referencia de 3 mg/m³",
        legalLimit: "Referencia: 3 mg/m³",
        unit: "mg/m³",
        reference: "Valor de referencia de higiene ocupacional; confirmar composición",
      },
      {
        value: "pm10",
        label: "PM10 — seleccionar cuando el método reporte material particulado PM10",
        legalLimit: "Comparar con el límite aplicable al método y al ambiente evaluado",
        unit: "µg/m³",
        reference: "Debe indicarse el método y la norma técnica utilizada",
      },
      {
        value: "pm25",
        label: "PM2.5 — seleccionar cuando el método reporte material particulado PM2.5",
        legalLimit: "Comparar con el límite aplicable al método y al ambiente evaluado",
        unit: "µg/m³",
        reference: "Debe indicarse el método y la norma técnica utilizada",
      },
    ],
  },
  vibraciones: {
    unit: "m/s²",
    legalLimit: "Según segmento corporal, frecuencia y tiempo de exposición",
    reference: "Resolución 2400 de 1979 y evaluación específica de vibraciones",
    options: [
      {
        value: "mano-brazo",
        label: "Vibración mano-brazo — evaluar exposición A(8)",
        legalLimit: "Comparar con el valor límite según frecuencia y tiempo",
        unit: "m/s²",
        reference: "Requiere medición específica del segmento mano-brazo",
      },
      {
        value: "cuerpo-entero",
        label: "Vibración de cuerpo entero — evaluar exposición A(8)",
        legalLimit: "Comparar con el valor límite según frecuencia y tiempo",
        unit: "m/s²",
        reference: "Requiere medición específica de cuerpo entero",
      },
      {
        value: "sin-exposicion",
        label: "Sin exposición significativa identificada",
        legalLimit: "No aplica límite por ausencia de exposición significativa",
        unit: "m/s²",
        reference: "Dejar soporte de la evaluación realizada",
      },
    ],
  },
};

export function getEnvironmentalMeasurementCatalogEntry(
  measurementType: string,
): EnvironmentalMeasurementCatalogEntry | undefined {
  return ENVIRONMENTAL_MEASUREMENT_CATALOG[
    measurementType as EnvironmentalMeasurementType
  ];
}

export function isAllowedEnvironmentalMeasurementValue(
  measurementType: string,
  value: string | null | undefined,
): boolean {
  if (!value) return false;
  return Boolean(
    getEnvironmentalMeasurementCatalogEntry(measurementType)?.options.some(
      (option) => option.value === value,
    ),
  );
}