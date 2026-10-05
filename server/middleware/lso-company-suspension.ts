import type { Response } from "express";
import { eq, inArray, and } from "drizzle-orm";
import { db } from "../db";
import { subscriptions } from "@shared/schema";

export const LSO_COMPANY_SUSPENDED = "LSO_COMPANY_SUSPENDED";
export const COMPANY_SUSPENDED_MESSAGE = "Esta empresa está suspendida por el administrador del sistema. Puede continuar trabajando con sus otras empresas.";

// Company restriction, not a subscription requirement for the professional.
// Do not cache: suspension and reactivation must affect the next request.
export async function getSuspendedCompanyIds(companyIds?: string[]): Promise<Set<string>> {
  if (companyIds?.length === 0) return new Set();
  const rows = await db.select({ companyId: subscriptions.companyId })
    .from(subscriptions)
    .where(and(
      eq(subscriptions.status, "suspended"),
      companyIds ? inArray(subscriptions.companyId, companyIds) : undefined,
    ));
  return new Set(rows.map(row => row.companyId));
}

export async function excludeSuspendedCompanies(companyIds: string[]): Promise<string[]> {
  const suspended = await getSuspendedCompanyIds(companyIds);
  return companyIds.filter(id => !suspended.has(id));
}

export async function denySuspendedLsoCompany(
  role: string, companyId: string, res: Response,
): Promise<boolean> {
  if (role !== "lso" && role !== "lso_externo") return false;
  if (!(await getSuspendedCompanyIds([companyId])).has(companyId)) return false;
  res.status(403).json({
    code: LSO_COMPANY_SUSPENDED,
    companyId,
    error: COMPANY_SUSPENDED_MESSAGE,
    message: COMPANY_SUSPENDED_MESSAGE,
  });
  return true;
}
