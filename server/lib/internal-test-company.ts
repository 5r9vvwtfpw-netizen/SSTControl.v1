// Empresa interna de pruebas en producción; no confundir con las salas
// temporales de plugins/demo-engine.
export const INTERNAL_TEST_COMPANY_ID = "demo-company-001";

export function isInternalTestCompany(companyId: string | null | undefined): boolean {
  return companyId === INTERNAL_TEST_COMPANY_ID;
}