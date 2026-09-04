import type { NextFunction, Request, Response } from "express";
import { and, eq, gte, isNull, or, sql } from "drizzle-orm";
import { db } from "../db";
import * as schema from "@shared/schema";

type MechanicScope = "maintenance" | "vehicles" | "inspections";

declare global {
  namespace Express {
    interface Request {
      mechanicEffectiveCompanyId?: string;
    }
  }
}

function scopeForPath(path: string): MechanicScope | null {
  if (path === "/api/vehicle-maintenances" || path.startsWith("/api/vehicle-maintenances/")) {
    return "maintenance";
  }
  if (path === "/api/vehicle-inspections" || path.startsWith("/api/vehicle-inspections/")) {
    return "inspections";
  }
  if (path === "/api/mechanic-access/inspection-drivers") {
    return "inspections";
  }
  // Only the vehicle resource itself is enabled. Related driver, GPS, road
  // safety and other PESV resources remain outside a mechanic's external scope.
  if (
    path === "/api/vehicles" ||
    path === "/api/vehicles/import" ||
    path === "/api/vehicles/template/download" ||
    /^\/api\/vehicles\/[^/]+$/.test(path)
  ) {
    return "vehicles";
  }
  return null;
}

/**
 * Validates an external company context before any route reads or mutates data.
 * A technician's employer company remains available everywhere; an external
 * company is only available for the explicitly scoped operational resources.
 */
export async function mechanicCompanyContextMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== "tecnico_mecanico") return next();

  const requestedCompanyId = req.get("X-Company-Id");
  if (!requestedCompanyId) return next();

  // The employer context is always valid, but still record it as the
  // middleware-validated value so downstream code never has to read the
  // header itself.
  if (requestedCompanyId === req.user.companyId) {
    req.mechanicEffectiveCompanyId = requestedCompanyId;
    return next();
  }

  const requiredScope = scopeForPath(req.path);
  if (!requiredScope) {
    // The header is attached globally by the client. For non-operational
    // resources, ignore the external context so downstream routes resolve the
    // employer company. This prevents external SST/worker/billing access while
    // keeping session, notifications and logout requests functional.
    return next();
  }

  try {
    const today = sql`CURRENT_DATE`;
    const [access] = await db
      .select({ scope: schema.mechanicCompanyAccess.scope })
      .from(schema.mechanicCompanyAccess)
      .where(and(
        eq(schema.mechanicCompanyAccess.mechanicUserId, req.user.id),
        eq(schema.mechanicCompanyAccess.employerCompanyId, req.user.companyId || ""),
        eq(schema.mechanicCompanyAccess.authorizedCompanyId, requestedCompanyId),
        eq(schema.mechanicCompanyAccess.isActive, true),
        sql`${schema.mechanicCompanyAccess.startDate} <= ${today}`,
        or(isNull(schema.mechanicCompanyAccess.endDate), gte(schema.mechanicCompanyAccess.endDate, today)),
      ))
      .limit(1);

    if (!access || !access.scope.includes(requiredScope)) {
      return res.status(403).json({ error: "No tienes autorización vigente para esta empresa o módulo" });
    }

    // This request-only value deliberately does not alter users.companyId.
    req.mechanicEffectiveCompanyId = requestedCompanyId;
    return next();
  } catch (error) {
    return next(error);
  }
}