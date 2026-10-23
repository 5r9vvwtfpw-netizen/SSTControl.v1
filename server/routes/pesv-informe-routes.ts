import type { Express, Request, Response } from "express";
import { and, desc, eq, gte, lte, ne, or } from "drizzle-orm";
import * as schema from "@shared/schema";
import { db } from "../db";
import { requireAuth as authRequireAuth, requirePermission } from "../auth";
import { getAuthorizedReportCompanyId } from "../lib/report-company-context";
import { isInternalTestCompany } from "../lib/internal-test-company";
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
  buildLeccionesExcelBuffer,
  buildLeccionesPdfBuffer,
  type LeccionReportRow,
} from "../reports/pesv-lecciones-aprendidas-report";
import { buildMedidasPrevencionPdfBuffer } from "../reports/pesv-medidas-prevencion-report";
import {
  buildAnnualCertificationPdfBuffer,
  type AnnualCertificationAnswer,
  type AnnualCertificationCode,
} from "../reports/pesv-annual-certification-report";

const ANNUAL_PESV_CERTIFICATIONS: Record<AnnualCertificationCode, {
  title: string;
  question: string;
  resolution: string;
  answers: AnnualCertificationAnswer[];
}> = {
  "resolucion-40595-2022": {
    title: "Certificación PESV — Resolución 40595 de 2022",
    question: "¿La empresa cuenta con un PESV implementado conforme a la Resolución 40595 de 2022 o lo está desarrollando?",
    resolution: "Resolución 40595 de 2022",
    answers: ["implemented", "in-development"],
  },
};

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
  app.use("/api/pesv/informes-anuales", (_req, res, next) => {
    if (process.env.NODE_ENV === "production") {
      return res.status(404).json({ message: "No encontrado." });
    }
    next();
  });

  app.get(
    "/api/pesv/informes-anuales/comite-seguridad-vial/evidencia",
    authRequireAuth,
    reportViewPermission,
    async (req, res) => {
      const companyId = getAuthorizedReportCompanyId(req);
      if (!companyId) return res.status(403).json({ message: "Selecciona una empresa autorizada." });
      const [company] = await db.select({ name: schema.companies.name, nit: schema.companies.nit })
        .from(schema.companies).where(eq(schema.companies.id, companyId)).limit(1);
      if (!company) return res.status(404).json({ message: "No se encontró la empresa seleccionada." });
      res.json({ companyName: company.name, companyNit: company.nit });
    },
  );

  app.get(
    "/api/pesv/informes-anuales/linea-base/evidencias",
    authRequireAuth,
    reportViewPermission,
    async (req, res) => {
      const companyId = getAuthorizedReportCompanyId(req);
      if (!companyId) return res.status(403).json({ message: "Selecciona una empresa autorizada." });
      const [company] = await db.select({
        name: schema.companies.name,
        nit: schema.companies.nit,
      }).from(schema.companies).where(eq(schema.companies.id, companyId)).limit(1);
      if (!company) return res.status(404).json({ message: "No se encontró la empresa seleccionada." });

      const factors = await db.select({
        id: schema.factoresDesempenoSV.id,
        codigo: schema.factoresDesempenoSV.codigo,
        nombre: schema.factoresDesempenoSV.nombre,
        categoria: schema.factoresDesempenoSV.categoria,
        unidadMedida: schema.factoresDesempenoSV.unidadMedida,
        valorBase: schema.factoresDesempenoSV.valorBase,
        valorActual: schema.factoresDesempenoSV.valorActual,
        activo: schema.factoresDesempenoSV.activo,
      }).from(schema.factoresDesempenoSV).where(and(
        eq(schema.factoresDesempenoSV.companyId, companyId),
        eq(schema.factoresDesempenoSV.activo, 1),
      )).orderBy(schema.factoresDesempenoSV.codigo);

      res.json({
        companyName: company.name,
        companyNit: company.nit,
        isTestCompany: isInternalTestCompany(companyId),
        factors,
      });
    },
  );

  async function loadAnnualCertification(req: Request, res: Response) {
    const reportCode = req.params.reportCode as AnnualCertificationCode;
    const definition = ANNUAL_PESV_CERTIFICATIONS[reportCode];
    if (!definition) {
      res.status(404).json({ message: "No se encontró esta certificación anual." });
      return null;
    }
    const companyId = getAuthorizedReportCompanyId(req);
    if (!companyId) {
      res.status(403).json({ message: "Selecciona una empresa autorizada para consultar el informe." });
      return null;
    }
    const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, companyId)).limit(1);
    if (!company) {
      res.status(404).json({ message: "No se encontró la empresa seleccionada." });
      return null;
    }

    const missing: string[] = [];
    if (!company.legalRepName?.trim()) missing.push("Registra el nombre del Representante Legal en Empresas.");
    if (!company.legalRepId?.trim()) missing.push("Registra la identificación del Representante Legal en Empresas.");
    if (!company.legalRepSignatureUrl?.trim()) missing.push("Carga la firma del Representante Legal en Empresas.");

    let latestEvaluation: typeof schema.evaluacionesPesv.$inferSelect | null = null;
    if (reportCode === "resolucion-40595-2022") {
      [latestEvaluation] = await db.select().from(schema.evaluacionesPesv)
        .where(eq(schema.evaluacionesPesv.companyId, companyId))
        .orderBy(desc(schema.evaluacionesPesv.createdAt))
        .limit(1);
      latestEvaluation ??= null;
    }

    return { company, definition, missing, latestEvaluation, reportCode };
  }

  app.get("/api/pesv/informes-anuales/:reportCode/estado", authRequireAuth, reportViewPermission, async (req, res) => {
    try {
      const data = await loadAnnualCertification(req, res);
      if (!data) return;
      res.json({
        reportCode: data.reportCode,
        title: data.definition.title,
        question: data.definition.question,
        resolution: data.definition.resolution,
        answers: data.definition.answers,
        companyName: data.company.name,
        companyNit: data.company.nit,
        representativeName: data.company.legalRepName,
        representativeId: data.company.legalRepId,
        hasSignature: Boolean(data.company.legalRepSignatureUrl?.trim()),
        latestEvaluation: data.latestEvaluation ? {
          year: data.latestEvaluation.anio,
          status: data.latestEvaluation.estado,
          completion: data.latestEvaluation.porcentajeCumplimiento,
        } : null,
        missing: data.missing,
      });
    } catch (error) {
      console.error("Error consultando certificación anual PESV:", error);
      res.status(500).json({ message: "No fue posible consultar los datos de la certificación." });
    }
  });

  app.get("/api/pesv/informes-anuales/:reportCode.pdf", authRequireAuth, reportViewPermission, async (req, res) => {
    try {
      if (req.query.confirm !== "1") {
        return res.status(409).json({ message: "Confirma expresamente la declaración del Representante Legal antes de generar el PDF." });
      }
      const data = await loadAnnualCertification(req, res);
      if (!data) return;
      if (data.missing.length) {
        return res.status(409).json({ message: "Completa los datos del Representante Legal antes de generar el PDF.", missing: data.missing });
      }
      const answer = typeof req.query.answer === "string" ? req.query.answer as AnnualCertificationAnswer : null;
      if (!answer || !data.definition.answers.includes(answer)) {
        return res.status(400).json({ message: "Selecciona una respuesta válida para esta certificación." });
      }
      const subscription = await storage.getSubscriptionByCompany(data.company.id);
      const trialStatus = getTrialStatus(subscription?.status || "trial", subscription?.trialEnd || null, true, true);
      const buffer = await buildAnnualCertificationPdfBuffer(
        data.company,
        data.reportCode,
        answer,
        trialStatus.requiresWatermark,
      );
      const filename = `certificacion_pesv_${data.reportCode}_${companyFileSlug(data.company.name)}.pdf`;
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Length", buffer.length);
      res.send(buffer);
    } catch (error) {
      console.error("Error generando certificación anual PESV:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "No fue posible generar el PDF." });
    }
  });

  async function loadQuarterlyMeasures(req: Request, res: Response) {
    const period = parseReportPeriod(req, res);
    if (!period?.from || !period.to) {
      if (period) res.status(400).json({ message: "Selecciona el trimestre completo." });
      return null;
    }
    const companyId = getAuthorizedReportCompanyId(req);
    if (!companyId) {
      res.status(403).json({ message: "Selecciona una empresa autorizada para consultar el informe." });
      return null;
    }
    const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, companyId)).limit(1);
    if (!company) {
      res.status(404).json({ message: "No se encontró la empresa seleccionada." });
      return null;
    }
    const allRoutes = await db.select().from(schema.safeRoutes).where(eq(schema.safeRoutes.companyId, companyId));
    const incomplete: string[] = [];
    const routes = allRoutes.filter((route) => {
      const content = [route.routeName, route.observations, route.signageMeasures, route.controlPoints].join(" ").toUpperCase();
      if (content.includes("PRUEBA FUNCIONAL")) return false;
      let signageInPeriod = false;
      let controlInPeriod = false;
      if (route.signageImplemented === 1) {
        if (!route.signageImplementationDate) incomplete.push(`${route.routeName}: indica la fecha de implementación de señalización en Rutas Seguras (H08).`);
        else if (route.signageEndDate && route.signageEndDate < route.signageImplementationDate) {
          incomplete.push(`${route.routeName}: corrige la fecha de fin de vigencia de la señalización en Rutas Seguras (H08).`);
        } else if (route.signageImplementationDate <= period.to! && (!route.signageEndDate || route.signageEndDate >= period.from!)) {
          if (route.isActive === 1 || route.signageEndDate) signageInPeriod = true;
          else incomplete.push(`${route.routeName}: registra cuándo terminó la señalización para verificar este trimestre en Rutas Seguras (H08).`);
        }
      }
      if (route.controlImplemented === 1) {
        if (!route.controlImplementationDate) incomplete.push(`${route.routeName}: indica la fecha de implementación de los puestos de control en Rutas Seguras (H08).`);
        else if (route.controlEndDate && route.controlEndDate < route.controlImplementationDate) {
          incomplete.push(`${route.routeName}: corrige la fecha de fin de vigencia de los puestos de control en Rutas Seguras (H08).`);
        } else if (route.controlImplementationDate <= period.to! && (!route.controlEndDate || route.controlEndDate >= period.from!)) {
          if (route.isActive === 1 || route.controlEndDate) controlInPeriod = true;
          else incomplete.push(`${route.routeName}: registra cuándo terminaron los puestos para verificar este trimestre en Rutas Seguras (H08).`);
        }
      }
      if (!signageInPeriod && !controlInPeriod) return false;
      if (signageInPeriod && (!route.signageMeasures?.trim() || !route.signageEvidenceReference?.startsWith(`uploads/${companyId}/evidencias/`))) {
        incomplete.push(`${route.routeName}: completa la descripción y adjunta el soporte de señalización en Rutas Seguras (H08).`);
      }
      if (controlInPeriod && (!route.controlPoints?.trim() || !route.controlEvidenceReference?.startsWith(`uploads/${companyId}/evidencias/`))) {
        incomplete.push(`${route.routeName}: completa los puestos y adjunta el soporte de control en Rutas Seguras (H08).`);
      }
      return true;
    });
    const allExpenses = await db.select().from(schema.pesvGpsExpenses)
      .where(and(
        eq(schema.pesvGpsExpenses.companyId, companyId),
        or(
          and(gte(schema.pesvGpsExpenses.expenseDate, period.from), lte(schema.pesvGpsExpenses.expenseDate, period.to)),
          and(lte(schema.pesvGpsExpenses.periodStart, period.to), gte(schema.pesvGpsExpenses.periodEnd, period.from)),
        ),
      ));
    const expenses = allExpenses.filter((expense) =>
      ![expense.provider, expense.concept, expense.observations].join(" ").toUpperCase().includes("PRUEBA FUNCIONAL"));
    const trackingRows = await db.select().from(schema.vehicleGpsTracking)
      .where(and(
        eq(schema.vehicleGpsTracking.companyId, companyId),
        gte(schema.vehicleGpsTracking.trackingDate, period.from),
        lte(schema.vehicleGpsTracking.trackingDate, period.to),
      ));
    const tracking = trackingRows.filter((row) =>
      ![row.observations, row.alertType].join(" ").toUpperCase().includes("PRUEBA FUNCIONAL"));
    const alertRows = await db.select().from(schema.sstSpeedAlerts)
      .where(and(
        eq(schema.sstSpeedAlerts.companyId, companyId),
        gte(schema.sstSpeedAlerts.alertDate, period.from),
        lte(schema.sstSpeedAlerts.alertDate, period.to),
      ));
    const speedAlerts = alertRows.filter((row) =>
      ![row.observations, row.correctiveAction].join(" ").toUpperCase().includes("PRUEBA FUNCIONAL"));
    const missing: string[] = [];
    if (!company.legalRepName?.trim()) missing.push("Configura el nombre del Representante Legal en Empresas.");
    if (!company.legalRepId?.trim()) missing.push("Configura la identificación del Representante Legal en Empresas.");
    if (!company.legalRepSignatureUrl?.trim()) missing.push("Carga la firma del Representante Legal en Empresas.");
    if (routes.length === 0 && expenses.length === 0 && tracking.length === 0 && speedAlerts.length === 0) {
      missing.push("Registra medidas implementadas en Rutas Seguras o información de operación GPS/alertas del trimestre.");
    }
    missing.push(...incomplete);
    for (const expense of expenses) if (!expense.supportReference?.startsWith(`uploads/${companyId}/evidencias/`)) {
      missing.push(`${expense.provider} · ${expense.expenseDate}: adjunta la factura o el soporte en Monitoreo GPS (H07).`);
    }
    return { company, routes, expenses, tracking, speedAlerts, period, missing };
  }

  app.get("/api/pesv/informes-trimestrales/medidas-prevencion/estado", authRequireAuth, reportViewPermission, async (req, res) => {
    try {
      const data = await loadQuarterlyMeasures(req, res);
      if (!data) return;
      res.json({
        companyName: data.company.name,
        companyNit: data.company.nit,
        representativeName: data.company.legalRepName,
        period: data.period,
        routeMeasures: data.routes.length,
        gpsExpenses: data.expenses.length,
        gpsExpensesTotalCop: data.expenses.reduce((sum, row) => sum + row.amountCop, 0),
        gpsMonitoringRecords: data.tracking.length,
        speedAlerts: data.speedAlerts.length,
        missing: data.missing,
      });
    } catch (error) {
      console.error("Error consultando medidas preventivas trimestrales:", error);
      res.status(500).json({ message: "No fue posible revisar los datos del informe." });
    }
  });

  app.get("/api/pesv/informes-trimestrales/medidas-prevencion.pdf", authRequireAuth, reportViewPermission, async (req, res) => {
    try {
      if (req.query.confirm !== "1") {
        return res.status(409).json({ message: "Confirma que revisaste los datos antes de generar la certificación." });
      }
      const data = await loadQuarterlyMeasures(req, res);
      if (!data) return;
      if (data.missing.length) {
        return res.status(409).json({ message: "Completa los datos del informe antes de generar la certificación.", missing: data.missing });
      }
      const subscription = await storage.getSubscriptionByCompany(data.company.id);
      const trialStatus = getTrialStatus(subscription?.status || "trial", subscription?.trialEnd || null, true, true);
      const buffer = await buildMedidasPrevencionPdfBuffer(
        data.company,
        data.routes,
        data.expenses,
        data.tracking,
        data.speedAlerts,
        { from: data.period.from!, to: data.period.to! },
        trialStatus.requiresWatermark,
      );
      const filename = `certificacion_medidas_prevencion_${companyFileSlug(data.company.name)}_${data.period.from}_${data.period.to}.pdf`;
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Length", buffer.length);
      res.send(buffer);
    } catch (error) {
      console.error("Error generando certificación trimestral de medidas preventivas:", error);
      res.status(500).json({ message: "No fue posible generar la certificación PDF." });
    }
  });

  async function loadQuarterlyLessonsDataset(req: Request, res: Response) {
    const period = parseReportPeriod(req, res);
    if (!period) return null;
    if (!period.from || !period.to) {
      res.status(400).json({ message: "Selecciona el trimestre completo para consultar las comunicaciones." });
      return null;
    }
    const companyId = getAuthorizedReportCompanyId(req);
    if (!companyId) {
      res.status(403).json({ message: "Selecciona una empresa autorizada para consultar el informe." });
      return null;
    }
    const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, companyId)).limit(1);
    if (!company) {
      res.status(404).json({ message: "No se encontró la empresa seleccionada." });
      return null;
    }
    const rows = await db.select({
      asunto: schema.comunicacionesSst.asunto,
      contenido: schema.comunicacionesSst.contenido,
      fechaEnvio: schema.comunicacionesSst.fechaEnvio,
      fechaEvento: schema.accidentInvestigations.eventDate,
      leccionAprendida: schema.accidentInvestigations.lessonLearned,
      trabajador: schema.workers.name,
      fechaLectura: schema.lecturasComunicacion.fechaLectura,
      retroalimentacion: schema.lecturasComunicacion.comentarios,
    }).from(schema.comunicacionesSst)
      .leftJoin(schema.accidentInvestigations, and(
        eq(schema.accidentInvestigations.id, schema.comunicacionesSst.relacionadoId),
        eq(schema.accidentInvestigations.companyId, companyId),
      ))
      .leftJoin(schema.lecturasComunicacion, and(
        eq(schema.lecturasComunicacion.comunicacionId, schema.comunicacionesSst.id),
        eq(schema.lecturasComunicacion.companyId, companyId),
      ))
      .leftJoin(schema.workers, and(
        eq(schema.workers.id, schema.lecturasComunicacion.workerId),
        eq(schema.workers.companyId, companyId),
      ))
      .where(and(
        eq(schema.comunicacionesSst.companyId, companyId),
        eq(schema.comunicacionesSst.relacionadoCon, "pesv_leccion_aprendida"),
        gte(schema.comunicacionesSst.fechaEnvio, new Date(`${period.from}T00:00:00`)),
        lte(schema.comunicacionesSst.fechaEnvio, new Date(`${period.to}T23:59:59.999`)),
      ))
      .orderBy(schema.comunicacionesSst.fechaEnvio, schema.workers.name);
    return { company, rows: rows as LeccionReportRow[], period };
  }

  function getQuarterlyLessonsMissing(rows: LeccionReportRow[]): string[] {
    const missing = new Set<string>();
    if (rows.length === 0) missing.add("No hay comunicaciones PESV de lecciones aprendidas en el trimestre.");
    for (const row of rows) {
      if (!row.leccionAprendida?.trim()) missing.add("Completa la lección aprendida en la investigación del siniestro (V02).");
      if (!row.trabajador?.trim()) missing.add("Asocia destinatarios a la divulgación desde Comunicación SST.");
      if (!row.fechaLectura) missing.add("Falta confirmación de lectura de uno o más destinatarios en el Portal de Empleados.");
      if (!row.retroalimentacion?.trim()) missing.add("Falta la retroalimentación de uno o más destinatarios.");
    }
    return [...missing];
  }

  app.get("/api/pesv/informes-trimestrales/lecciones-aprendidas/estado", authRequireAuth, reportViewPermission, async (req, res) => {
    try {
      const dataset = await loadQuarterlyLessonsDataset(req, res);
      if (!dataset) return;
      res.json({
        companyName: dataset.company.name,
        companyNit: dataset.company.nit,
        total: dataset.rows.length,
        read: dataset.rows.filter((row) => row.fechaLectura).length,
        feedback: dataset.rows.filter((row) => row.retroalimentacion?.trim()).length,
        missing: getQuarterlyLessonsMissing(dataset.rows),
        records: dataset.rows,
        period: dataset.period,
      });
    } catch (error) {
      console.error("Error consultando divulgación de lecciones PESV:", error);
      res.status(500).json({ message: "No fue posible consultar las comunicaciones del trimestre." });
    }
  });

  app.get("/api/pesv/informes-trimestrales/lecciones-aprendidas.xlsx", authRequireAuth, reportViewPermission, async (req, res) => {
    try {
      const dataset = await loadQuarterlyLessonsDataset(req, res);
      if (!dataset) return;
      const missing = getQuarterlyLessonsMissing(dataset.rows);
      if (missing.length) {
        return res.status(409).json({ message: "Completa la evidencia pendiente antes de descargar el informe.", missing });
      }
      const buffer = buildLeccionesExcelBuffer(dataset.company, dataset.rows, dataset.period as {from:string;to:string});
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="evidencia_lecciones_aprendidas_${companyFileSlug(dataset.company.name)}_${dataset.period.from}_${dataset.period.to}.xlsx"`);
      res.setHeader("Content-Length", buffer.length);
      res.send(buffer);
    } catch (error) {
      console.error("Error generando Excel de lecciones PESV:", error);
      res.status(500).json({ message: "No fue posible generar el archivo Excel." });
    }
  });

  app.get("/api/pesv/informes-trimestrales/lecciones-aprendidas.pdf", authRequireAuth, reportViewPermission, async (req, res) => {
    try {
      const dataset = await loadQuarterlyLessonsDataset(req, res);
      if (!dataset) return;
      const missing = getQuarterlyLessonsMissing(dataset.rows);
      if (missing.length) {
        return res.status(409).json({ message: "Completa la evidencia pendiente antes de descargar el informe.", missing });
      }
      const subscription = await storage.getSubscriptionByCompany(dataset.company.id);
      const trial = getTrialStatus(subscription?.status || "trial", subscription?.trialEnd || null, true, true);
      const buffer = await buildLeccionesPdfBuffer(dataset.company, dataset.rows, dataset.period as {from:string;to:string}, trial.requiresWatermark);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="evidencia_lecciones_aprendidas_${companyFileSlug(dataset.company.name)}_${dataset.period.from}_${dataset.period.to}.pdf"`);
      res.setHeader("Content-Length", buffer.length);
      res.send(buffer);
    } catch (error) {
      console.error("Error generando PDF de lecciones PESV:", error);
      res.status(500).json({ message: "No fue posible generar el archivo PDF." });
    }
  });

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
      meetingId: schema.cronogramaReunionesPesv.id,
      scheduledDate: schema.cronogramaReunionesPesv.fechaProgramada,
      meetingTopic: schema.cronogramaReunionesPesv.temaPrincipal,
      meetingState: schema.cronogramaReunionesPesv.estado,
      frequency: schema.cronogramaReunionesPesv.frecuencia,
      actaId: schema.actasComitePesv.id,
      numeroActa: schema.actasComitePesv.numeroActa,
      fechaReunion: schema.actasComitePesv.fechaReunion,
      estado: schema.actasComitePesv.estado,
      horaInicio: schema.actasComitePesv.horaInicio,
      horaFin: schema.actasComitePesv.horaFin,
      lugar: schema.actasComitePesv.lugar,
      modalidad: schema.actasComitePesv.modalidad,
      asistentesIds: schema.actasComitePesv.asistentesIds,
      invitados: schema.actasComitePesv.invitados,
      temasOrdenDia: schema.actasComitePesv.temasOrdenDia,
      desarrolloReunion: schema.actasComitePesv.desarrolloReunion,
      compromisos: schema.actasComitePesv.compromisos,
      observaciones: schema.actasComitePesv.observaciones,
      proximaReunion: schema.actasComitePesv.proximaReunion,
    }).from(schema.cronogramaReunionesPesv)
      .leftJoin(schema.actasComitePesv, and(
        eq(schema.actasComitePesv.id, schema.cronogramaReunionesPesv.actaId),
        eq(schema.actasComitePesv.companyId, companyId),
      ))
      .where(and(
        eq(schema.cronogramaReunionesPesv.companyId, companyId),
        gte(schema.cronogramaReunionesPesv.fechaProgramada, period.from),
        lte(schema.cronogramaReunionesPesv.fechaProgramada, period.to),
        ne(schema.cronogramaReunionesPesv.estado, "cancelada"),
      ))
      .orderBy(schema.cronogramaReunionesPesv.fechaProgramada);
    const members = await db.select({
      id: schema.comiteIntegrantesPesv.id,
      nombre: schema.comiteIntegrantesPesv.nombre,
      cargo: schema.comiteIntegrantesPesv.cargo,
      rol: schema.comiteIntegrantesPesv.rol,
    }).from(schema.comiteIntegrantesPesv)
      .where(eq(schema.comiteIntegrantesPesv.companyId, companyId));
    const enrichedRecords = records.map((record) => ({
      ...record,
      asistentesTexto: members
        .filter((member) => record.asistentesIds?.includes(member.id))
        .map((member) => `${member.nombre} · ${member.cargo} · ${member.rol}`)
        .join("; "),
    }));
    const incomplete = enrichedRecords.flatMap((record) => {
      const missing: string[] = [];
      if (record.meetingState !== "realizada") missing.push("La reunión del cronograma aún no figura como realizada.");
      if (!record.actaId) missing.push("No hay un acta vinculada a esta reunión del cronograma.");
      else {
        if (!record.desarrolloReunion?.trim()) missing.push("El acta no contiene el desarrollo de la investigación interna.");
        if (record.estado !== "aprobada") missing.push("El acta debe estar aprobada para incluirse como evidencia.");
      }
      return missing.length ? [{
        meetingId: record.meetingId,
        scheduledDate: record.scheduledDate,
        meetingTopic: record.meetingTopic,
        actaId: record.actaId,
        missing,
      }] : [];
    });
    return { company, records: enrichedRecords, incomplete, period, companyId };
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
