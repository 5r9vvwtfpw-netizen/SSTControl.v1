export const EPP_NUMERIC_GENDER_SIZES = [
  "Dama 4",
  "Dama 6",
  "Dama 8",
  "Dama 10",
  "Dama 12",
  "Dama 14",
  "Dama 16",
  "Dama 18",
  "Caballero 28",
  "Caballero 30",
  "Caballero 32",
  "Caballero 34",
  "Caballero 36",
  "Caballero 38",
  "Caballero 40",
  "Caballero 42",
  "Caballero 44",
  "Caballero 46",
] as const;

export const EPP_ALPHA_GENDER_SIZES = [
  "Dama XS",
  "Dama S",
  "Dama M",
  "Dama L",
  "Dama XL",
  "Dama XXL",
  "Caballero XS",
  "Caballero S",
  "Caballero M",
  "Caballero L",
  "Caballero XL",
  "Caballero XXL",
] as const;

export function getCanonicalEppSizes(name: string): string[] | null {
  const normalizedName = name.trim().toLocaleLowerCase("es-CO");

  if (
    normalizedName.includes("jeans") ||
    normalizedName.includes("pantalón de trabajo") ||
    normalizedName.includes("pantalon de trabajo")
  ) {
    return [...EPP_NUMERIC_GENDER_SIZES];
  }

  if (
    normalizedName.includes("overol") ||
    normalizedName.includes("pantalón impermeable") ||
    normalizedName.includes("pantalon impermeable")
  ) {
    return [...EPP_ALPHA_GENDER_SIZES];
  }

  return null;
}