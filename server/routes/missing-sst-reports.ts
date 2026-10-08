import type { Express, Request, Response } from "express";
import { withPdfSemaphore } from "../services/pdf-semaphore";
import { generateMissingSstReport, type MissingSstReport } from "../reports/missing-sst-reports";
import { getAuthorizedReportCompanyId } from "../lib/report-company-context";

export function registerMissingSstReportsRoutes(app: Express, requireAuth: any) {
  const register = (path: string, report: MissingSstReport, acceptsPeriod = false) => app.get(path, requireAuth, async (req: Request, res: Response) => {
    const companyId = getAuthorizedReportCompanyId(req);
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