import type { Express, Request, Response } from "express";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import * as schema from "@shared/schema";
import { db } from "../db";
import { requireAuth as authRequireAuth, requirePermission } from "../auth";
import { getAuthorizedReportCompanyId } from "../lib/report-company-context";
import {
  buildSiniestrosExcelBuffer,
  buildSiniestrosPdfBuffer,
  getMissingSiniestroReportFields,
  type SiniestroReportPeriod,
  type SiniestroReportRecord,
} from "../reports/pesv-siniestros-report";
import { storage } from "../storage";
import { getTrialStatus } from "@shared/utils";
import {
  buildActasSiniestrosExcelBuffer,
  buildActasSiniestrosPdfBuffer,
  type ActaSiniestroEvidence,
} from "../reports/pesv-actas-siniestros-report";

type ReportDataset = {
  company: typeof schema.companies.$inferSelect;
  records: SiniestroReportRecord[];
  period: SiniestroReportPeriod;
};

function isValidIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
    && !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
    && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
}

function parseReportPeriod(req: Request, res: Response): SiniestroReportPeriod | null {
  const fromValue = req.query.from;
  const toValue = req.query.to;
  if (
    (fromValue !== undefined && typeof fromValue !== "string")
    || (toValue !== undefined && typeof toValue !== "string")
  ) {
    res.status(400).json({ message: "Las fechas deben tener el formato AAAA-MM-DD." });
    return null;
  }

  const from = typeof fromValue === "string" ? fromValue.trim() || undefined : undefined;
  const to = typeof toValue === "string" ? toValue.trim() || undefined : undefined;
  if ((from && !isValidIsoDate(from)) || (to && !isValidIsoDate(to))) {
    res.status(400).json({ message: "Las fechas deben tener el formato AAAA-MM-DD y ser fechas válidas." });
    return null;
  }
  if (from && to && from > to) {
    res.status(400).json({ message: "La fecha inicial no puede ser posterior a la fecha final." });
    return null;
  }
  return { from, to };
}

function reportPeriodFilenameSuffix(period: SiniestroReportPeriod): string {
  if (!period.from && !period.to) return "";
  return `_desde_${period.from || "inicio"}_hasta_${period.to || "actualidad"}`;
}

async function loadReportDataset(
  req: Request,
  res: Response,
): Promise<ReportDataset | null> {
  const period = parseReportPeriod(req, res);
  if (!period) return null;

  const companyId = getAuthorizedReportCompanyId(req);
  if (!companyId) {
    res.status(403).json({ message: "Selecciona una empresa autorizada para consultar el informe." });
    return null;
  }

  const [company] = await db
    .select()
    .from(schema.companies)
    .where(eq(schema.companies.id, companyId))
    .limit(1);

  if (!company) {
    res.status(404).json({ message: "No se encontró la empresa seleccionada." });
    return null;
  }

  const records = await db
    .select({
      id: schema.roadIncidents.id,
      incidentDate: schema.roadIncidents.incidentDate,
      fatalities: schema.roadIncidents.fatalities,
      severeInjuries: schema.roadIncidents.severeInjuries,
      minorInjuries: schema.roadIncidents.minorInjuries,
      simpleCollisionPeople: schema.roadIncidents.simpleCollisionPeople,
      vehiclePlate: schema.vehicles.plate,
      driverName: schema.drivers.name,
      driverIdentification: schema.drivers.identificationNumber,
      policeReport: schema.roadIncidents.policeReport,
      ipatAuthorityName: schema.roadIncidents.ipatAuthorityName,
      committeeActaId: schema.roadIncidents.committeeActaId,
      committeeActaNumber: schema.actasComitePesv.numeroActa,
      committeeAnalysisDate: schema.actasComitePesv.fechaReunion,
    })
    .from(schema.roadIncidents)
    .leftJoin(
      schema.vehicles,
      and(
        eq(schema.vehicles.id, schema.roadIncidents.vehicleId),
        eq(schema.vehicles.companyId, companyId),
      ),
    )
    .leftJoin(
      schema.drivers,
      and(
        eq(schema.drivers.id, schema.roadIncidents.driverId),
        eq(schema.drivers.companyId, companyId),
      ),
    )
    .leftJoin(
      schema.actasComitePesv,
      and(
        eq(schema.actasComitePesv.id, schema.roadIncidents.committeeActaId),
        eq(schema.actasComitePesv.companyId, companyId),
      ),
    )
    .where(and(
      eq(schema.roadIncidents.companyId, companyId),
      period.from ? gte(schema.roadIncidents.incidentDate, period.from) : undefined,
      period.to ? lte(schema.roadIncidents.incidentDate, period.to) : undefined,
    ))
    .orderBy(desc(schema.roadIncidents.incidentDate), desc(schema.roadIncidents.createdAt));

  return { company, records, period };
}

function getIncompleteRecords(records: SiniestroReportRecord[]) {
  return records
    .map((record) => ({
      id: record.id,
      incidentDate: record.incidentDate,
      vehiclePlate: record.vehiclePlate,
      driverName: record.driverName,
      missingFields: getMissingSiniestroReportFields(record),
    }))
    .filter((record) => record.missingFields.length > 0);
}

function validateReportDownload(
  req: Request,
  res: Response,
  dataset: ReportDataset,
): boolean | null {
  const declaration = req.query.confirmNoIncidents;
  if (declaration !== undefined && declaration !== "true") {
    res.status(400).json({ message: "La confirmación del informe en cero no es válida." });
    return null;
  }

  const noIncidentsConfirmed = declaration === "true";
  if (dataset.records.length === 0) {
    if (!dataset.period.from || !dataset.period.to) {
      res.status(400).json({
        message: "Para generar un informe en cero, selecciona una fecha inicial y una fecha final.",
      });
      return null;
    }
    if (!noIncidentsConfirmed) {
      res.status(409).json({
        message: "No hay siniestros registrados en este período. Confirma que no ocurrieron siniestros para generar el informe en cero.",
      });
      return null;
    }
    return true;
  }

  if (noIncidentsConfirmed) {
    res.status(409).json({
      message: "El período tiene siniestros registrados; no se puede generar como informe en cero.",
    });
    return null;
  }

  const incomplete = getIncompleteRecords(dataset.records);
  if (incomplete.length > 0) {
    res.status(409).json({
      message: "Completa los datos señalados en el módulo Siniestros antes de descargar el informe del período seleccionado.",
      incomplete,
    });
    return null;
  }

  return false;
}

function companyFileSlug(companyName: string): string {
  const slug = companyName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase()
    .slice(0, 48);
  return slug || "empresa";
}

export function registerPesvInformeRoutes(app: Express) {
  const reportViewPermission = requirePermission("road_incidents:view");

  async function loadQuarterlyActasDataset(req: Request, res: Response) {
    const period = parseReportPeriod(req, res);
    if (!period) return null;
    if (!period.from || !period.to) {
      res.status(400).json({ message: "Selecciona el trimestre completo para consultar las actas." });
      return null;
    }
    const companyId = getAuthorizedReportCompanyId(req);
    if (!companyId) {
      res.status(403).json({ message: "Selecciona una empresa autorizada para consultar el informe." });
      return null;
    }
    const [company] = await db.select().from(schema.companies)
      .where(eq(schema.companies.id, companyId)).limit(1);
    if (!company) {
      res.status(404).json({ message: "No se encontró la empresa seleccionada." });
      return null;
    }
    const records = await db.select({
      incidentId: schema.roadIncidents.id,
      incidentDate: schema.roadIncidents.incidentDate,
      vehiclePlate: schema.vehicles.plate,
      driverName: schema.drivers.name,
      actaId: schema.actasComitePesv.id,
      numeroActa: schema.actasComitePesv.numeroActa,
      fechaReunion: schema.actasComitePesv.fechaReunion,
      estado: schema.actasComitePesv.estado,
      temasOrdenDia: schema.actasComitePesv.temasOrdenDia,
      desarrolloReunion: schema.actasComitePesv.desarrolloReunion,
      compromisos: schema.actasComitePesv.compromisos,
      observaciones: schema.actasComitePesv.observaciones,
    }).from(schema.roadIncidents)
      .leftJoin(schema.vehicles, and(
        eq(schema.vehicles.id, schema.roadIncidents.vehicleId),
        eq(schema.vehicles.companyId, companyId),
      ))
      .leftJoin(schema.drivers, and(
        eq(schema.drivers.id, schema.roadIncidents.driverId),
        eq(schema.drivers.companyId, companyId),
      ))
      .leftJoin(schema.actasComitePesv, and(
        eq(schema.actasComitePesv.id, schema.roadIncidents.committeeActaId),
        eq(schema.actasComitePesv.companyId, companyId),
      ))
      .where(and(
        eq(schema.roadIncidents.companyId, companyId),
        gte(schema.roadIncidents.incidentDate, period.from),
        lte(schema.roadIncidents.incidentDate, period.to),
      ))
      .orderBy(desc(schema.roadIncidents.incidentDate));
    const incomplete = records.flatMap((record) => {
      const missing: string[] = [];
      if (!record.actaId) missing.push("No hay un acta del Comité PESV vinculada al siniestro.");
      else {
        if (!record.desarrolloReunion?.trim()) missing.push("El acta no contiene el desarrollo de la investigación interna.");
        if (record.estado !== "aprobada") missing.push("El acta debe estar aprobada para incluirse como evidencia.");
      }
      return missing.length ? [{
        incidentId: record.incidentId,
        incidentDate: record.incidentDate,
        vehiclePlate: record.vehiclePlate,
        driverName: record.driverName,
        actaId: record.actaId,
        missing,
      }] : [];
    });
    return { company, records: records as ActaSiniestroEvidence[], incomplete, period, companyId };
  }

  function confirmNoQuarterlyActas(req: Request, res: Response, total: number): boolean {
    const declaration = req.query.confirmNoIncidents;
    if (total === 0 && declaration !== "true") {
      res.status(409).json({ message: "No hay siniestros en el trimestre. Confirma esta situación para generar el informe sin actas." });
      return false;
    }
    if (total > 0 && declaration === "true") {
      res.status(409).json({ message: "El trimestre tiene siniestros registrados; no se puede declarar sin actas." });
      return false;
    }
    return true;
  }

  app.get("/api/pesv/informes-trimestrales/actas-siniestros/estado", authRequireAuth, reportViewPermission, async (req, res) => {
    try {
      const dataset = await loadQuarterlyActasDataset(req, res);
      if (!dataset) return;
      res.json({
        companyName: dataset.company.name,
        companyNit: dataset.company.nit,
        total: dataset.records.length,
        ready: dataset.records.length - dataset.incomplete.length,
        incomplete: dataset.incomplete,
        records: dataset.records,
        period: dataset.period,
      });
    } catch (error) {
      console.error("Error consultando actas trimestrales PESV:", error);
      res.status(500).json({ message: "No fue posible revisar las actas del trimestre." });
    }
  });

  app.get("/api/pesv/informes-trimestrales/actas-siniestros.xlsx", authRequireAuth, reportViewPermission, async (req, res) => {
    try {
      const dataset = await loadQuarterlyActasDataset(req, res);
      if (!dataset) return;
      if (dataset.incomplete.length) return res.status(409).json({ message: "Completa las actas pendientes antes de descargar el informe.", incomplete: dataset.incomplete });
      if (!confirmNoQuarterlyActas(req, res, dataset.records.length)) return;
      const buffer = buildActasSiniestrosExcelBuffer(dataset.company, dataset.records, dataset.period as { from: string; to: string });
      const suffix = reportPeriodFilenameSuffix(dataset.period);
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="actas_comite_pesv_siniestros${suffix}.xlsx"`);
      res.setHeader("Content-Length", buffer.length);
      res.send(buffer);
    } catch (error) {
      console.error("Error generando Excel de actas trimestrales:", error);
      res.status(500).json({ message: "No fue posible generar el Excel de actas." });
    }
  });

  app.get("/api/pesv/informes-trimestrales/actas-siniestros.pdf", authRequireAuth, reportViewPermission, async (req, res) => {
    try {
      const dataset = await loadQuarterlyActasDataset(req, res);
      if (!dataset) return;
      if (dataset.incomplete.length) return res.status(409).json({ message: "Completa las actas pendientes antes de descargar el informe.", incomplete: dataset.incomplete });
      if (!confirmNoQuarterlyActas(req, res, dataset.records.length)) return;
      const subscription = await storage.getSubscriptionByCompany(dataset.companyId);
      const trialStatus = getTrialStatus(subscription?.status || "trial", subscription?.trialEnd || null, true, true);
      const buffer = await buildActasSiniestrosPdfBuffer(
        dataset.company,
        dataset.records,
        dataset.period as { from: string; to: string },
        trialStatus.requiresWatermark,
      );
      const suffix = reportPeriodFilenameSuffix(dataset.period);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="actas_comite_pesv_siniestros${suffix}.pdf"`);
      res.setHeader("Content-Length", buffer.length);
      res.send(buffer);
    } catch (error) {
      console.error("Error generando PDF de actas trimestrales:", error);
      res.status(500).json({ message: "No fue posible generar el PDF de actas." });
    }
  });

  app.get(
    "/api/pesv/informes/siniestros/estado",
    authRequireAuth,
    reportViewPermission,
    async (req, res) => {
      try {
        const dataset = await loadReportDataset(req, res);
        if (!dataset) return;

        const incompleteRecords = getIncompleteRecords(dataset.records);
        res.json({
          companyName: dataset.company.name,
          companyNit: dataset.company.nit,
          total: dataset.records.length,
          ready: dataset.records.length - incompleteRecords.length,
          incomplete: incompleteRecords,
          period: dataset.period,
        });
      } catch (error: any) {
        console.error("Error consultando el estado del informe PESV:", error);
        res.status(500).json({ message: "No fue posible revisar los datos del informe." });
      }
    },
  );

  app.get(
    "/api/pesv/informes/siniestros.xlsx",
    authRequireAuth,
    reportViewPermission,
    async (req, res) => {
      try {
        const dataset = await loadReportDataset(req, res);
        if (!dataset) return;

        const noIncidentsConfirmed = validateReportDownload(req, res, dataset);
        if (noIncidentsConfirmed === null) return;

        const buffer = buildSiniestrosExcelBuffer(
          dataset.company,
          dataset.records,
          new Date(),
          dataset.period,
          noIncidentsConfirmed,
        );
        const filename = `registro_vehiculos_siniestrados_${companyFileSlug(dataset.company.name)}${reportPeriodFilenameSuffix(dataset.period)}.xlsx`;
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.setHeader("Content-Length", buffer.length);
        res.send(buffer);
      } catch (error: any) {
        console.error("Error generando Excel de siniestros PESV:", error);
        res.status(500).json({ message: "No fue posible generar el archivo Excel." });
      }
    },
  );

  app.get(
    "/api/pesv/informes/siniestros.pdf",
    authRequireAuth,
    reportViewPermission,
    async (req, res) => {
      try {
        const dataset = await loadReportDataset(req, res);
        if (!dataset) return;

        const noIncidentsConfirmed = validateReportDownload(req, res, dataset);
        if (noIncidentsConfirmed === null) return;

        const subscription = await storage.getSubscriptionByCompany(dataset.company.id);
        const trialStatus = getTrialStatus(
          subscription?.status || "trial",
          subscription?.trialEnd || null,
          true,
          true,
        );
        const buffer = await buildSiniestrosPdfBuffer(
          dataset.company,
          dataset.records,
          trialStatus.requiresWatermark,
          dataset.period,
          noIncidentsConfirmed,
        );
        const filename = `registro_vehiculos_siniestrados_${companyFileSlug(dataset.company.name)}${reportPeriodFilenameSuffix(dataset.period)}.pdf`;
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.setHeader("Content-Length", buffer.length);
        res.send(buffer);
      } catch (error: any) {
        console.error("Error generando PDF de siniestros PESV:", error);
        res.status(500).json({ message: "No fue posible generar el archivo PDF." });
      }
    },
  );
}
