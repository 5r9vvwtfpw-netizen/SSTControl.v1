export function normalizeCopasstPeriodStatus(status: string | null | undefined): string {
  const normalized = status?.trim();
  return normalized || "activo";
}
