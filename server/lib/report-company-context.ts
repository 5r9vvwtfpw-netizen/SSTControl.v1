import type { Request } from "express";

/**
 * Resolve a report tenant without treating login as company authorization.
 * LSO company context is populated only by the global middleware after it
 * validates an active assignment; regular users remain bound to their account.
 */
export function getAuthorizedReportCompanyId(req: Request): string | null {
  const user = req.user as { role?: string; companyId?: string | null } | undefined;
  if (!user) return null;

  if (user.role === "lso" || user.role === "lso_externo") {
    return (req as Request & { validatedLsoCompanyId?: string }).validatedLsoCompanyId || null;
  }

  const requestedCompanyId =
    (typeof req.headers["x-company-id"] === "string" && req.headers["x-company-id"]) ||
    (typeof req.query.companyId === "string" && req.query.companyId) ||
    null;

  if (user.role === "superadmin") {
    return requestedCompanyId || user.companyId || null;
  }

  return user.companyId || null;
}
