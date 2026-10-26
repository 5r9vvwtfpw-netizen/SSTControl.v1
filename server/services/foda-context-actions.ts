export type FodaType = "fortaleza" | "debilidad" | "oportunidad" | "amenaza";

export interface FodaFactorForAction {
  id: string;
  companyId: string;
  esFortaleza: number | null;
  esDebilidad: number | null;
  esOportunidad: number | null;
  esAmenaza: number | null;
}

export interface ContextActionForFoda {
  companyId: string;
  factorContextoId: string | null;
  tipoFoda: string | null;
}

export function getFodaTypeFromFactor(
  factor: Pick<FodaFactorForAction, "esFortaleza" | "esDebilidad" | "esOportunidad" | "esAmenaza">,
): FodaType | null {
  // Preserve the same priority used by the context-analysis form when a factor
  // has more than one FODA flag selected.
  if (factor.esDebilidad === 1) return "debilidad";
  if (factor.esAmenaza === 1) return "amenaza";
  if (factor.esFortaleza === 1) return "fortaleza";
  if (factor.esOportunidad === 1) return "oportunidad";
  return null;
}

export function filterFodaLinkedActions<T extends ContextActionForFoda>(
  actions: T[],
  factors: FodaFactorForAction[],
  companyId: string,
): Array<T & { tipoFoda: FodaType | null }> {
  const factorById = new Map(
    factors
      .filter((factor) => factor.companyId === companyId)
      .map((factor) => [factor.id, factor]),
  );

  return actions.flatMap((action) => {
    if (action.companyId !== companyId || !action.factorContextoId) return [];
    const factor = factorById.get(action.factorContextoId);
    if (!factor) return [];
    return [{ ...action, tipoFoda: getFodaTypeFromFactor(factor) }];
  });
}
