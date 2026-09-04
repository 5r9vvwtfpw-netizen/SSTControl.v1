import type { Express, Request, Response } from "express";
import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { licensedProfessionalAssignments } from "@shared/schema";
import { withPdfSemaphore } from "../services/pdf-semaphore";
import { generateMissingSstReport, type MissingSstReport } from "../reports/missing-sst-reports";

async function effectiveCompanyId(req: Request): Promise<string | null> {
  const user = req.user as any;
  if (!user?.companyId && user?.role !== "superadmin") return null;
  const requested = typeof req.headers["x-company-id"] === "string"
    ? req.headers["x-company-id"] : typeof req.query.companyId === "string" ? req.query.companyId : null;
  if (!requested || requested === user.companyId) return user.companyId || null;
  if (user.role === "superadmin") return requested;
  if (user.role === "lso" || user.role === "lso_externo") {
    const [assignment] = await db.select({ id: licensedProfessionalAssignments.id }).from(licensedProfessionalAssignments)
      .where(and(eq(licensedProfessionalAssignments.companyId, requested), eq(licensedProfessionalAssignments.userId, user.id), eq(licensedProfessionalAssignments.isActive, true))).limit(1);
    return assignment ? requested : null;
  }
  return null;
}

export function registerMissingSstReportsRoutes(app: Express, requireAuth: any) {
  const register = (path: string, report: MissingSstReport, acceptsPeriod = false) => app.get(path, requireAuth, async (req: Request, res: Response) => {
    const companyId = await effectiveCompanyId(req);
    if (!companyId) return res.status(403).json({ error: "No autorizado para consultar esta empresa" });
    const year = acceptsPeriod && req.query.year !== undefined ? Number(req.query.year) : undefined;
    const month = acceptsPeriod && req.query.month !== undefined ? Number(req.query.month) : undefined;
    if ((year !== undefined && (!Number.isInteger(year) || year < 2000 || year > 2100)) || (month !== undefined && (!Number.isInteger(month) || month < 1 || month > 12))) {
      return res.status(400).json({ error: "Los parámetros year y month no son válidos" });
    }
    try {
      await withPdfSemaphore(() => generateMissingSstReport(report, companyId, res, { year, month }));
    } catch (error: any) {
      if (!res.headersSent) res.status(500).json({ error: "No fue posible generar el reporte", message: error.message });
    }
  });
  register("/api/reports/rendicion-cuentas", "rendicion-cuentas", true);
  register("/api/reports/mensual", "rendicion-cuentas", true);
  register("/api/reportes/condiciones-salud/pdf", "condiciones-salud");
  register("/api/reportes/examenes-medicos/pdf", "examenes-medicos");
  register("/api/partes-interesadas/pdf", "partes-interesadas");
  register("/api/company-sedes/pdf", "sedes");
  register("/api/reportes/evaluaciones-sst-consolidado/pdf", "evaluaciones-consolidado");
}