import PDFDocument from "pdfkit";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import * as schema from "@shared/schema";
import { db } from "../db";
import {
  addSectionBar, addStandardHeader, addSignatureFooter, formatDate,
  PDF_CONFIG,
} from "./pdf-standardizer";
import { interpretGpsAggregate, isLsoAttributable, shouldRenderPesvOperationalSections } from "./lso-management-report-policy";
import {
  buildLsoManagementReportSummary,
  formatLsoSummaryItemForPdf,
  formatInvestigationActions,
  formatInvestigationDeadlineStatus,
  formatInvestigationEventType,
  formatInvestigationStatus,
  groupRecommendationPeriods,
  limitExecutiveItems,
  selectExecutiveRecommendationGroups,
  type LsoReportSummary,
  type LsoSummaryItem,
} from "./lso-management-report-summary";

export { buildLsoManagementReportSummary } from "./lso-management-report-summary";
export {
  formatLsoSummaryItemForPdf,
  formatInvestigationActions,
  formatInvestigationDeadlineStatus,
  formatInvestigationEventType,
  formatInvestigationStatus,
  groupRecommendationPeriods,
  limitExecutiveItems,
  selectExecutiveRecommendationGroups,
} from "./lso-management-report-summary";
export type { LsoReportFacts, LsoReportSummary, LsoSummaryItem } from "./lso-management-report-summary";

type AnyRecord = Record<string, any>;
const text = (v: unknown, empty = "Sin registro") => v === null || v === undefined || v === "" ? empty : String(v);
const asNumber = (v: unknown) => Number(v || 0);
const asOptionalNumber = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const value = Number(v);
  return Number.isFinite(value) ? value : null;
};
const normalizeForComparison = (value: unknown) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
const isSyntheticTestAction = (action: AnyRecord) => {
  const searchable = normalizeForComparison([
    action.descripcionAccion,
    action.descripcion,
    action.objetivo,
    action.observaciones,
    action.responsable,
    action.areaResponsable,
  ].filter(Boolean).join(" "));
  return [
    "registro sintetico",
    "no representa una accion real",
    "prueba funcional",
    "development",
  ].some((marker) => searchable.includes(marker));
};
const query = async <T>(fn: () => Promise<T>, fallback: T, label: string, errors: string[]): Promise<T> => {
  try { return await fn(); } catch (error: any) {
    errors.push(label);
    console.error(`[LSO management report] ${label} query failed`, error?.message || error);
    return fallback;
  }
};

function writeBlock(doc: any, title: string, lines: string[], y: number): number {
  y = addSectionBar(doc, title, y);
  doc.font("Helvetica").fontSize(8).fillColor("#000000");
  for (const line of lines) {
    const width = doc.page.width - PDF_CONFIG.MARGIN * 2 - 10;
    const rendered = `• ${line}`;
    const height = doc.heightOfString(rendered, { width, lineGap: 2 });
    if (y + height > doc.page.height - PDF_CONFIG.FOOTER_HEIGHT - 12) {
      doc.addPage();
      y = addSectionBar(doc, `${title} — continuación`, PDF_CONFIG.MARGIN + 15);
      doc.font("Helvetica").fontSize(8).fillColor("#000000");
    }
    doc.text(rendered, PDF_CONFIG.MARGIN + 5, y, { width, lineGap: 2 });
    y = doc.y + 3;
  }
  return y + 4;
}

function writeExecutiveBlock(doc: any, title: string, lines: string[], y: number): number {
  y = addSectionBar(doc, title, y);
  doc.font("Helvetica").fontSize(7).fillColor("#000000");
  for (const line of lines) {
    const width = doc.page.width - PDF_CONFIG.MARGIN * 2 - 10;
    const rendered = `• ${line}`;
    const height = doc.heightOfString(rendered, { width, lineGap: 1 });
    if (y + height > doc.page.height - PDF_CONFIG.FOOTER_HEIGHT - 8) {
      doc.addPage();
      y = PDF_CONFIG.MARGIN + 10;
    }
    doc.text(rendered, PDF_CONFIG.MARGIN + 5, y, { width, lineGap: 1 });
    y = doc.y + 1;
  }
  return y + 1;
}

function summaryItemLine(entry: LsoSummaryItem): string {
  return formatLsoSummaryItemForPdf(entry);
}

function writeExecutiveSummaryItems(doc: any, title: string, entries: LsoSummaryItem[], y: number, omittedCount = 0): number {
  const lines = entries.length ? entries.map(summaryItemLine) : ["No se encontró información registrada para este apartado."];
  if (omittedCount > 0) lines.push(`Hay ${omittedCount} asuntos adicionales, detallados al final del informe.`);
  return writeExecutiveBlock(doc, title, lines, y);
}

type ExecutiveCard = {
  label: string;
  value: string;
  detail: string;
  tone?: "critical" | "warning" | "good" | "neutral";
};

function writeExecutiveCards(doc: any, cards: ExecutiveCard[], y: number): number {
  const gap = 7;
  const columns = 2;
  const cardWidth = (doc.page.width - PDF_CONFIG.MARGIN * 2 - gap) / columns;
  const cardHeight = 58;
  const colors = {
    critical: { fill: "#fff1f2", border: "#dc2626", accent: "#991b1b" },
    warning: { fill: "#fffbeb", border: "#d97706", accent: "#92400e" },
    good: { fill: "#f0fdf4", border: "#16a34a", accent: "#166534" },
    neutral: { fill: "#f8fafc", border: "#94a3b8", accent: "#334155" },
  };

  for (let index = 0; index < cards.length; index++) {
    if (index % columns === 0 && y + cardHeight > doc.page.height - PDF_CONFIG.FOOTER_HEIGHT - 10) {
      doc.addPage();
      y = PDF_CONFIG.MARGIN + 15;
    }
    const column = index % columns;
    const x = PDF_CONFIG.MARGIN + column * (cardWidth + gap);
    const card = cards[index];
    const palette = colors[card.tone || "neutral"];
    if (column === 0 && index > 0) y += cardHeight + gap;
    doc.roundedRect(x, y, cardWidth, cardHeight, 4).fillAndStroke(palette.fill, palette.border);
    doc.rect(x, y, 5, cardHeight).fill(palette.border);
    doc.font("Helvetica-Bold").fontSize(7).fillColor("#475569")
      .text(card.label.toUpperCase(), x + 13, y + 8, { width: cardWidth - 22, lineBreak: false });
    doc.font("Helvetica-Bold").fontSize(17).fillColor(palette.accent)
      .text(card.value, x + 13, y + 20, { width: cardWidth - 22, lineBreak: false });
    doc.font("Helvetica").fontSize(7).fillColor("#334155")
      .text(card.detail, x + 13, y + 41, { width: cardWidth - 22, height: 12, lineBreak: false });
  }
  return y + cardHeight + 8;
}

function executivePriorityRank(entry: LsoSummaryItem): number {
  const ranks: Record<string, number> = {
    "Atención a víctimas": 1,
    "Siniestros viales": 2,
    "Evaluación de seguridad y salud en el trabajo": 3,
    "Acciones de investigaciones de accidentes": 4,
    "Riesgos viales": 5,
    "Evidencia documental PESV": 6,
    "Documentos de vehículos": 7,
    "Inspecciones de vehículos": 8,
    "Acciones del Plan Estratégico de Seguridad Vial": 9,
    "Plan anual de trabajo": 10,
  };
  return ranks[entry.sourceLabel] || 50;
}

function writeManagerDecisions(
  doc: any,
  entries: LsoSummaryItem[],
  recommendations: LsoReportSummary["recommendations"],
  y: number,
): number {
  y = addSectionBar(doc, "DECISIONES REQUERIDAS DE LA GERENCIA", y);
  const recommendationMap = new Map(
    [...recommendations.next30Days, ...recommendations.next60Days, ...recommendations.continuityNext90Days]
      .map((entry) => [entry.sourceLabel, entry] as const),
  );
  const visible = entries;
  if (!visible.length) {
    doc.font("Helvetica").fontSize(7).fillColor("#000000")
      .text("• No se identificaron decisiones pendientes con los registros consultados.", PDF_CONFIG.MARGIN + 5, y, {
        width: doc.page.width - PDF_CONFIG.MARGIN * 2 - 10,
      });
    return doc.y + 5;
  }
  for (const entry of visible) {
    const action = recommendationMap.get(entry.sourceLabel)?.text || "Asignar responsable, fecha límite y evidencia de cierre en el sistema.";
    const priority = entry.priority === "urgente" ? "URGENTE" : entry.priority === "atencion" ? "ATENCIÓN" : "SEGUIMIENTO";
    const body = `${entry.text} Acción requerida: ${action}`;
    const width = doc.page.width - PDF_CONFIG.MARGIN * 2 - 70;
    const height = doc.heightOfString(body, { width, lineGap: 1 }) + 16;
    if (y + height > doc.page.height - PDF_CONFIG.FOOTER_HEIGHT - 8) {
      doc.addPage();
      y = PDF_CONFIG.MARGIN + 15;
    }
    const tone = entry.priority === "urgente" ? "#dc2626" : "#d97706";
    doc.roundedRect(PDF_CONFIG.MARGIN + 3, y, 58, height, 3).fillAndStroke(entry.priority === "urgente" ? "#fff1f2" : "#fffbeb", tone);
    doc.font("Helvetica-Bold").fontSize(6.5).fillColor(tone)
      .text(priority, PDF_CONFIG.MARGIN + 8, y + 8, { width: 48, align: "center" });
    doc.font("Helvetica").fontSize(7.5).fillColor("#111827")
      .text(body, PDF_CONFIG.MARGIN + 70, y + 8, { width, lineGap: 1 });
    y += height + 4;
  }
  return y + 4;
}

function writeEvidenceAndTraceability(
  doc: any,
  lines: string[],
  y: number,
): number {
  return writeExecutiveBlock(doc, "CALIDAD DE INFORMACIÓN Y TRAZABILIDAD", lines, y);
}

function formatImprovementActionForPdf(action: AnyRecord, area: string): string {
  const description = text(action.descripcionAccion || action.descripcion, "Descripción no registrada");
  const responsible = text(action.responsable, "no registrado");
  const dueDate = formatDate(action.fechaCompromiso || action.fechaLimite);
  const status = text(action.estado, "sin estado");
  const evidence = action.evidenciaCierre ? "evidencia de cierre registrada" : "sin evidencia de cierre registrada";
  return `${area}: ${description}; responsable: ${responsible}; fecha límite: ${dueDate}; estado: ${status}; ${evidence}.`;
}

function startDetailPageAfterExecutive(doc: any, y: number): number {
  const pages = doc.bufferedPageRange();
  if (pages.count > 0 && y > PDF_CONFIG.MARGIN + 15) {
    doc.addPage();
    return PDF_CONFIG.MARGIN + 15;
  }
  return y;
}

export async function generateLsoManagementReport(companyId: string, year: number, userId: string, assignmentId: string): Promise<Buffer | null> {
  const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, companyId)).limit(1);
  if (!company) return null;
  const [assignment] = await db.select().from(schema.licensedProfessionalAssignments)
    .where(and(eq(schema.licensedProfessionalAssignments.id, assignmentId), eq(schema.licensedProfessionalAssignments.companyId, companyId), eq(schema.licensedProfessionalAssignments.userId, userId), eq(schema.licensedProfessionalAssignments.isActive, true))).limit(1);
  if (!assignment) throw new Error("Active LSO assignment not found");
  const [lso] = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
  if (!lso) throw new Error("Authenticated LSO not found");
  const moduleErrors: string[] = [];
  const metric = (label: string, value: string) => moduleErrors.includes(label) ? "No disponible por error de consulta" : value;

  const sst = await query(() => db.select().from(schema.evaluacionesSst).where(and(eq(schema.evaluacionesSst.companyId, companyId), eq(schema.evaluacionesSst.anio, year))).orderBy(desc(schema.evaluacionesSst.fechaEvaluacion)).limit(1), [], "evaluación SST", moduleErrors);
  const priorSst = await query(() => db.select().from(schema.evaluacionesSst).where(and(eq(schema.evaluacionesSst.companyId, companyId), sql`${schema.evaluacionesSst.anio} < ${year}`)).orderBy(desc(schema.evaluacionesSst.anio), desc(schema.evaluacionesSst.fechaEvaluacion)).limit(1), [], "evaluación SST previa", moduleErrors);
  const sstLatest = sst[0] as AnyRecord | undefined;
  const sstPrior = priorSst[0] as AnyRecord | undefined;
  const pesv = await query(() => db.select().from(schema.evaluacionesPesv).where(and(eq(schema.evaluacionesPesv.companyId, companyId), eq(schema.evaluacionesPesv.anio, year))).orderBy(desc(schema.evaluacionesPesv.createdAt)).limit(1), [], "evaluación PESV", moduleErrors);
  if (moduleErrors.includes("evaluación SST") || moduleErrors.includes("evaluación PESV")) throw new Error("Core evaluation query failed");
  const pesvLatest = pesv[0] as AnyRecord | undefined;

  const [plan] = await query(() => db.select().from(schema.planesTrabajoAnual).where(and(eq(schema.planesTrabajoAnual.companyId, companyId), eq(schema.planesTrabajoAnual.anio, year))).orderBy(desc(schema.planesTrabajoAnual.createdAt)).limit(1), [], "plan anual", moduleErrors);
  const iperc = await query(() => db.select({ id: schema.matricesIperc.id }).from(schema.matricesIperc).where(eq(schema.matricesIperc.companyId, companyId)), [], "IPERC", moduleErrors);
  const vehicles = await query(() => db.select().from(schema.vehicles).where(eq(schema.vehicles.companyId, companyId)), [], "vehículos", moduleErrors);
  const drivers = await query(() => db.select().from(schema.drivers).where(eq(schema.drivers.companyId, companyId)), [], "conductores", moduleErrors);
  const [inspections] = await query(() => db.select({ total: sql<number>`count(*)`, noAptas: sql<number>`count(*) filter (where ${schema.vehicleInspections.result} = 'no-apto')` }).from(schema.vehicleInspections).where(and(eq(schema.vehicleInspections.companyId, companyId), sql`EXTRACT(YEAR FROM ${schema.vehicleInspections.inspectionDate}) = ${year}`)), [{ total: 0, noAptas: 0 }], "inspecciones", moduleErrors);
  const investigations = await query(() => db.select().from(schema.accidentInvestigations).where(and(eq(schema.accidentInvestigations.companyId, companyId), sql`EXTRACT(YEAR FROM ${schema.accidentInvestigations.eventDate}) = ${year}`)), [], "investigaciones", moduleErrors);

  let sstAnswers: AnyRecord[] = [];
  if (sstLatest) sstAnswers = await query(() => db.select().from(schema.respuestasEstandares).where(eq(schema.respuestasEstandares.evaluacionId, sstLatest.id)), [], "respuestas SST", moduleErrors);
  let pesvAnswers: AnyRecord[] = [];
  if (pesvLatest) pesvAnswers = await query(() => db.select().from(schema.respuestasPasosPesv).where(eq(schema.respuestasPasosPesv.evaluacionId, pesvLatest.id)), [], "respuestas PESV", moduleErrors);
  const rawSstActions = sstLatest ? await query(() => db.select().from(schema.accionesMejora).where(eq(schema.accionesMejora.evaluacionId, sstLatest.id)), [], "acciones SST", moduleErrors) : [];
  const rawPesvActions = pesvLatest ? await query(() => db.select().from(schema.accionesMejoraPesv).where(eq(schema.accionesMejoraPesv.evaluacionId, pesvLatest.id)), [], "acciones PESV", moduleErrors) : [];
  const sstActions = rawSstActions.filter((action: AnyRecord) => !isSyntheticTestAction(action));
  const pesvActions = rawPesvActions.filter((action: AnyRecord) => !isSyntheticTestAction(action));
  const excludedSyntheticActionCount = rawSstActions.length + rawPesvActions.length - sstActions.length - pesvActions.length;
  const requesterAudit = await query(() => db.select({ count: sql<number>`count(*)` }).from(schema.auditLogs).where(and(eq(schema.auditLogs.companyId, companyId), eq(schema.auditLogs.userId, userId), sql`${schema.auditLogs.timestamp} >= make_date(${year}, 1, 1)`, sql`${schema.auditLogs.timestamp} < make_date(${year + 1}, 1, 1)`)), [{ count: 0 }], "trazabilidad del LSO", moduleErrors);
  const [fatigue] = await query(() => db.select({ total: sql<number>`count(*)`, exceptions: sql<number>`count(*) filter (where ${schema.pesvFatigaRegistros.resultado} <> 'sin_novedad')` }).from(schema.pesvFatigaRegistros).where(and(eq(schema.pesvFatigaRegistros.companyId, companyId), sql`EXTRACT(YEAR FROM ${schema.pesvFatigaRegistros.fechaRegistro}) = ${year}`)), [{ total: 0, exceptions: 0 }], "fatiga PESV", moduleErrors);
  const [alcohol] = await query(() => db.select({ total: sql<number>`count(*)`, exceptions: sql<number>`count(*) filter (where ${schema.pesvAlcoholRegistros.resultado} <> 'negativo')` }).from(schema.pesvAlcoholRegistros).where(and(eq(schema.pesvAlcoholRegistros.companyId, companyId), sql`EXTRACT(YEAR FROM ${schema.pesvAlcoholRegistros.fechaRegistro}) = ${year}`)), [{ total: 0, exceptions: 0 }], "alcohol PESV", moduleErrors);
  const victims = await query(() => db.select().from(schema.pesvVictimasRegistros).where(and(eq(schema.pesvVictimasRegistros.companyId, companyId), sql`EXTRACT(YEAR FROM ${schema.pesvVictimasRegistros.fechaSiniestro}) = ${year}`)), [], "víctimas PESV", moduleErrors);
  const objectives = await query(() => db.select().from(schema.objetivosSV).where(and(eq(schema.objetivosSV.companyId, companyId), eq(schema.objetivosSV.anio, year))), [], "objetivos PESV", moduleErrors);
  const indicators = await query(() => db.select().from(schema.indicadoresSV).where(eq(schema.indicadoresSV.companyId, companyId)), [], "indicadores PESV", moduleErrors);
  const audits = await query(() => db.select().from(schema.auditoriasPesv).where(and(eq(schema.auditoriasPesv.companyId, companyId), sql`EXTRACT(YEAR FROM ${schema.auditoriasPesv.fechaProgramada}) = ${year}`)), [], "auditorías PESV", moduleErrors);
  const assignments = await query(() => db.select().from(schema.driverVehicleAssignments).where(and(eq(schema.driverVehicleAssignments.companyId, companyId), sql`EXTRACT(YEAR FROM ${schema.driverVehicleAssignments.startDate}) <= ${year}`, sql`(${schema.driverVehicleAssignments.endDate} IS NULL OR EXTRACT(YEAR FROM ${schema.driverVehicleAssignments.endDate}) >= ${year})`)), [], "asignaciones conductor-vehículo", moduleErrors);
  const comparendos = await query(() => db.select().from(schema.driverComparendos).where(and(eq(schema.driverComparendos.companyId, companyId), sql`EXTRACT(YEAR FROM ${schema.driverComparendos.fechaComparendo}) = ${year}`)), [], "comparendos", moduleErrors);
  const maintenances = await query(() => db.select().from(schema.vehicleMaintenances).where(and(eq(schema.vehicleMaintenances.companyId, companyId), sql`EXTRACT(YEAR FROM ${schema.vehicleMaintenances.maintenanceDate}) = ${year}`)), [], "mantenimientos", moduleErrors);
  const routes = await query(() => db.select().from(schema.safeRoutes).where(eq(schema.safeRoutes.companyId, companyId)), [], "rutas seguras", moduleErrors);
  const [gpsAggregate] = await query(() => db.select({ total: sql<number>`count(*)`, exceeded: sql<number>`count(*) filter (where ${schema.vehicleGpsTracking.speedExceeded} = 1)` }).from(schema.vehicleGpsTracking).where(and(eq(schema.vehicleGpsTracking.companyId, companyId), sql`EXTRACT(YEAR FROM ${schema.vehicleGpsTracking.trackingDate}) = ${year}`)), [{ total: 0, exceeded: 0 }], "GPS", moduleErrors);
  const gps = interpretGpsAggregate(gpsAggregate);
  const [speedAlerts] = await query(() => db.select({ total: sql<number>`count(*)`, open: sql<number>`count(*) filter (where ${schema.sstSpeedAlerts.status} <> 'cerrada')` }).from(schema.sstSpeedAlerts).where(and(eq(schema.sstSpeedAlerts.companyId, companyId), sql`EXTRACT(YEAR FROM ${schema.sstSpeedAlerts.alertDate}) = ${year}`)), [{ total: 0, open: 0 }], "alertas de velocidad", moduleErrors);
  const [incidents] = await query(() => db.select({ total: sql<number>`count(*)`, serious: sql<number>`count(*) filter (where ${schema.roadIncidents.severity} <> 'solo-danos')`, fatalities: sql<number>`coalesce(sum(${schema.roadIncidents.fatalities}), 0)` }).from(schema.roadIncidents).where(and(eq(schema.roadIncidents.companyId, companyId), sql`EXTRACT(YEAR FROM ${schema.roadIncidents.incidentDate}) = ${year}`)), [{ total: 0, serious: 0, fatalities: 0 }], "siniestros viales", moduleErrors);
  const trainings = await query(() => db.select().from(schema.roadSafetyTrainings).where(and(eq(schema.roadSafetyTrainings.companyId, companyId), sql`EXTRACT(YEAR FROM ${schema.roadSafetyTrainings.trainingDate}) = ${year}`)), [], "formación vial", moduleErrors);
  const riskRows = await query(() => db.select().from(schema.riesgosViales).where(eq(schema.riesgosViales.companyId, companyId)), [], "riesgos viales", moduleErrors);
  const treatments = await query(() => db.select().from(schema.tratamientosRiesgoVial).where(eq(schema.tratamientosRiesgoVial.companyId, companyId)), [], "tratamientos de riesgo vial", moduleErrors);
  const measurements = await query(() => db.select().from(schema.medicionesIndicadorSV).where(and(eq(schema.medicionesIndicadorSV.companyId, companyId), sql`EXTRACT(YEAR FROM ${schema.medicionesIndicadorSV.fechaMedicion}) = ${year}`)), [], "mediciones de indicadores", moduleErrors);
  const [pesvFindings] = await query(() => db.select({ total: sql<number>`count(*)`, open: sql<number>`count(*) filter (where ${schema.hallazgosAuditoriaPesv.estado} <> 'cerrado')` }).from(schema.hallazgosAuditoriaPesv).where(and(eq(schema.hallazgosAuditoriaPesv.companyId, companyId), sql`EXTRACT(YEAR FROM ${schema.hallazgosAuditoriaPesv.createdAt}) = ${year}`)), [{ total: 0, open: 0 }], "hallazgos de auditoría PESV", moduleErrors);
  const meetings = await query(() => db.select().from(schema.cronogramaReunionesPesv).where(and(eq(schema.cronogramaReunionesPesv.companyId, companyId), eq(schema.cronogramaReunionesPesv.anio, year))), [], "cronograma PESV", moduleErrors);
  const expandedMembers = await query(() => db.select().from(schema.comiteIntegrantesPesv).where(eq(schema.comiteIntegrantesPesv.companyId, companyId)), [], "integrantes comité ampliado", moduleErrors);
  const expandedActs = await query(() => db.select().from(schema.actasComitePesv).where(and(eq(schema.actasComitePesv.companyId, companyId), sql`EXTRACT(YEAR FROM ${schema.actasComitePesv.fechaReunion}) = ${year}`)), [], "actas comité ampliado", moduleErrors);
  const criteria = pesvLatest ? await query(() => db.select().from(schema.pesvCriteriosVerificacion).where(eq(schema.pesvCriteriosVerificacion.evaluacionId, pesvLatest.id)), [], "criterios PESV", moduleErrors) : [];
  const evidence = pesvLatest ? await query(() => db.select().from(schema.pesvEvidenciasDocumentos).where(eq(schema.pesvEvidenciasDocumentos.evaluacionId, pesvLatest.id)), [], "evidencia PESV", moduleErrors) : [];
  const trainingAttendees = trainings.length ? await query(() => db.select({ trainingId: schema.roadSafetyAttendees.trainingId, attended: schema.roadSafetyAttendees.attended }).from(schema.roadSafetyAttendees).innerJoin(schema.roadSafetyTrainings, eq(schema.roadSafetyAttendees.trainingId, schema.roadSafetyTrainings.id)).where(and(eq(schema.roadSafetyTrainings.companyId, companyId), sql`EXTRACT(YEAR FROM ${schema.roadSafetyTrainings.trainingDate}) = ${year}`)), [], "asistentes formación vial", moduleErrors) : [];
  const reviews = await query(() => db.select().from(schema.revisionesDireccionPesv).where(and(eq(schema.revisionesDireccionPesv.companyId, companyId), sql`EXTRACT(YEAR FROM ${schema.revisionesDireccionPesv.fechaRevision}) = ${year}`)), [], "revisión por dirección PESV", moduleErrors);
  const reviewIds = reviews.map((r: AnyRecord) => r.id);
  const reviewDecisions = reviewIds.length ? await query(() => db.select().from(schema.decisionesRevisionPesv).where(and(eq(schema.decisionesRevisionPesv.companyId, companyId), inArray(schema.decisionesRevisionPesv.revisionPesvId, reviewIds))), [], "decisiones de revisión PESV", moduleErrors) : [];
  const [driverSurveys] = await query(() => db.select({
    total: sql<number>`count(*)`,
    aptos: sql<number>`count(*) filter (where ${schema.pesvEncuestasConductor.resultado} = 'apto')`,
    noAptos: sql<number>`count(*) filter (where ${schema.pesvEncuestasConductor.resultado} = 'no_apto')`,
    alerts: sql<number>`count(*) filter (where ${schema.pesvEncuestasConductor.horasSueno} < 6 or ${schema.pesvEncuestasConductor.estadoFisico} <> 'bueno' or ${schema.pesvEncuestasConductor.estadoEmocional} <> 'bueno' or ${schema.pesvEncuestasConductor.consumoAlcohol} = 1 or ${schema.pesvEncuestasConductor.presentaEnfermedad} = 1)`,
  }).from(schema.pesvEncuestasConductor).where(and(eq(schema.pesvEncuestasConductor.companyId, companyId), sql`EXTRACT(YEAR FROM ${schema.pesvEncuestasConductor.fechaRegistro}) = ${year}`)), [{ total: 0, aptos: 0, noAptos: 0, alerts: 0 }], "encuestas de aptitud", moduleErrors);

  const reportGeneratedAt = new Date();
  const isExpired = (value: unknown) => !!value && new Date(String(value)) < reportGeneratedAt;
  const expiredVehicles = vehicles.filter((vehicle: AnyRecord) =>
    [vehicle.soatExpiry, vehicle.technicalReviewExpiry, vehicle.insuranceExpiry].some(isExpired),
  );
  const expiredDocumentCount = vehicles.reduce((total, vehicle: AnyRecord) =>
    total + [vehicle.soatExpiry, vehicle.technicalReviewExpiry, vehicle.insuranceExpiry].filter(isExpired).length, 0);
  const totalInvestigationActions = investigations.reduce((total, investigation: AnyRecord) => total + asNumber(investigation.actionsTotal), 0);
  const implementedInvestigationActions = investigations.reduce((total, investigation: AnyRecord) => total + asNumber(investigation.actionsImplemented), 0);
  const pendingInvestigationActions = Math.max(0, totalInvestigationActions - implementedInvestigationActions);
  const highRiskRows = riskRows.filter((risk: AnyRecord) =>
    ["alto", "muy_alto", "critico"].includes(String(risk.nivelRiesgo || "").toLowerCase()),
  );
  const untreatedHighRiskRows = highRiskRows.filter((risk: AnyRecord) => !treatments.some((treatment: AnyRecord) =>
    treatment.riesgoVialId === risk.id &&
    ["implementado", "cerrado", "completado"].includes(String(treatment.estado || "").toLowerCase()),
  ));
  const reportSummary: LsoReportSummary = buildLsoManagementReportSummary({
    sstEvaluation: {
      exists: !!sstLatest,
      percentage: sstLatest ? asOptionalNumber(sstLatest.porcentajeCumplimiento) : null,
      status: sstLatest?.estado || null,
      nonCompliantAnswers: sstLatest ? sstAnswers.filter((answer) => !answer.noAplica && answer.cumple === 0).length : null,
      pendingActions: sstLatest ? sstActions.filter((action: AnyRecord) => action.estado !== "cerrada" && action.estado !== "completada").length : null,
      totalActions: sstLatest ? sstActions.length : null,
    },
    pesvEvaluation: {
      exists: !!pesvLatest,
      percentage: pesvLatest ? asOptionalNumber(pesvLatest.porcentajeCumplimiento) : null,
      status: pesvLatest?.estado || null,
      nonCompliantAnswers: pesvLatest ? pesvAnswers.filter((answer) => !answer.noAplica && answer.cumple === 0).length : null,
      pendingActions: pesvLatest ? pesvActions.filter((action: AnyRecord) => action.estado !== "cerrada" && action.estado !== "completada").length : null,
      totalActions: pesvLatest ? pesvActions.length : null,
    },
    annualPlan: {
      exists: !!plan,
      activities: plan ? asOptionalNumber(plan.totalActividades) : null,
      completedActivities: plan ? asOptionalNumber(plan.actividadesCompletadas) : null,
      percentage: plan ? asOptionalNumber(plan.porcentajeCumplimiento) : null,
    },
    hazardIdentification: { matrices: iperc.length },
    investigations: {
      total: investigations.length,
      overdue: investigations.filter((investigation: AnyRecord) => investigation.slaStatus === "vencido").length,
      missingSignatures: investigations.filter((investigation: AnyRecord) => !investigation.licensedProfessionalName).length,
      pendingActions: pendingInvestigationActions,
      totalActions: totalInvestigationActions,
    },
    fleet: {
      vehicles: vehicles.length,
      drivers: drivers.length,
      expiredDocuments: expiredVehicles.length,
    },
    inspections: {
      total: asNumber(inspections.total),
      requiresReviewBeforeOperating: asNumber(inspections.noAptas),
    },
    pesvFindings: { total: asNumber(pesvFindings.total), open: asNumber(pesvFindings.open) },
    roadIncidents: { total: asNumber(incidents.total), serious: asNumber(incidents.serious), fatalities: asNumber(incidents.fatalities) },
    evidenceCoverage: {
      criteria: criteria.length,
      files: evidence.filter((entry: AnyRecord) => !!entry.archivoUrl).length,
      observations: criteria.filter((entry: AnyRecord) => !!entry.observacion).length,
    },
    operational: {
      objectives: objectives.length,
      indicators: indicators.length,
      measurements: measurements.length,
      auditsScheduled: audits.length,
      auditsExecuted: audits.filter((audit: AnyRecord) => !!audit.fechaEjecucion).length,
      trainingSessions: trainings.length,
      trainingAttendees: trainingAttendees.length,
      confirmedAttendees: trainingAttendees.filter((attendee: AnyRecord) => attendee.attended === 1).length,
      maintenanceRecords: maintenances.length,
      maintenanceDocuments: maintenances.filter((maintenance: AnyRecord) => !!maintenance.documentUrl).length,
      vehicles: vehicles.length,
      highRiskCount: highRiskRows.length,
      untreatedHighRiskCount: untreatedHighRiskRows.length,
      victimRecords: victims.length,
      openVictimFollowups: victims.filter((victim: AnyRecord) => victim.estadoSeguimiento !== "cerrado").length,
      speedAlerts: asNumber(speedAlerts.total),
      openSpeedAlerts: asNumber(speedAlerts.open),
    },
  });

  const chunks: Buffer[] = [];
  const doc = new PDFDocument({ size: "LETTER", margin: PDF_CONFIG.MARGIN, bufferPages: true });
  doc.on("data", (c: Buffer) => chunks.push(c));
  const signerName = lso.fullName || lso.username;
  const signerLicense = lso.sstLicenseNumber || assignment.externalLsoLicenseNumber || "";
  const matchesRequester = (record: { name?: string | null; license?: string | null; signedAt?: Date | string | null; userId?: string | null }) => {
    return isLsoAttributable(record, {
      name: signerName,
      license: signerLicense,
      userId,
      assignedAt: assignment.assignedAt,
      unassignedAt: assignment.unassignedAt,
    });
  };
  const signers = {
    elaboro: { name: "SST-Colombia", role: "Sistema de Gestión SST" },
    autorizo: { name: company.legalRepName || "Representante de la Dirección", role: "Representante de la Dirección", signatureUrl: company.legalRepSignatureUrl || undefined },
    aprobo: { name: company.legalRepName || "Alta Dirección", role: "Alta Dirección / Gerencia", signatureUrl: company.legalRepSignatureUrl || undefined },
    lso: { name: signerName, licenseNumber: lso.sstLicenseNumber || assignment.externalLsoLicenseNumber || "Pendiente", licenseIssuer: lso.sstLicenseIssuer || assignment.externalLsoLicenseIssuer || "Secretaría de Salud", signatureUrl: lso.sstSignatureUrl || assignment.externalLsoSignatureUrl || undefined },
  };
  let y = await addStandardHeader({ doc, company: { id: company.id, name: company.name, nit: company.nit, address: company.address, logoUrl: company.logoUrl }, documentTitle: "INFORME GERENCIAL DE GESTIÓN SST Y SEGURIDAD VIAL — ENTREGA LSO", documentCode: "LSO-GEST-01", version: "2.0" });
  y = writeBlock(doc, "CONTEXTO DE LA ENTREGA", [
    `Empresa: ${company.name} | NIT: ${company.nit} | ${text(company.city)} | Vigencia analizada: ${year}.`,
    `Profesional asignado: ${text(lso?.fullName || assignment?.externalLsoName)} | Licencia: ${text(lso?.sstLicenseNumber || assignment?.externalLsoLicenseNumber)} | Asignación desde: ${formatDate(assignment?.assignedAt)}.`,
    "Alcance: lectura gerencial de los registros disponibles en SST y PESV. Un registro inexistente, incompleto o sin soporte no se interpreta automáticamente como incumplimiento legal.",
  ], y);
  const sstPercentage = sstLatest ? asOptionalNumber(sstLatest.porcentajeCumplimiento) : null;
  const pesvPercentage = pesvLatest ? asOptionalNumber(pesvLatest.porcentajeCumplimiento) : null;
  const pendingPlanActivities = plan
    ? Math.max(0, asNumber(plan.totalActividades) - asNumber(plan.actividadesCompletadas))
    : null;
  const planTotalActivities = plan ? asNumber(plan.totalActividades) : 0;
  const planCompletedActivities = plan ? asNumber(plan.actividadesCompletadas) : 0;
  const planProgress = planTotalActivities > 0
    ? `${((planCompletedActivities / planTotalActivities) * 100).toFixed(1)}%`
    : "N/D";
  const evaluationIsClosed = (value: unknown) =>
    ["finalizada", "aprobada", "completada", "cerrada"].includes(normalizeForComparison(value));
  y = addSectionBar(doc, "TABLERO EJECUTIVO", y);
  y = writeExecutiveCards(doc, [
    {
      label: "Resultado SST",
      value: sstPercentage === null ? "N/D" : `${sstPercentage}%`,
      detail: sstLatest
        ? `${text(sstLatest.estado)} · ${evaluationIsClosed(sstLatest.estado) ? "resultado cerrado" : "resultado registrado; sin cierre verificado"}`
        : "Evaluación no registrada",
      tone: sstPercentage !== null && sstPercentage < 60
        ? "critical"
        : sstPercentage !== null && (!evaluationIsClosed(sstLatest?.estado) || sstPercentage < 80)
          ? "warning"
          : "good",
    },
    {
      label: "Resultado PESV",
      value: pesvPercentage === null ? "N/D" : `${pesvPercentage}%`,
      detail: pesvLatest
        ? `${text(pesvLatest.estado)} · ${pesvAnswers.filter((a) => !a.noAplica && a.cumple === 0).length} no conformes · ${evidence.filter((e: AnyRecord) => !!e.archivoUrl).length}/${evidence.length} soportes con archivo`
        : "Evaluación no registrada",
      tone: pesvLatest && evaluationIsClosed(pesvLatest.estado) && evidence.length > 0 && evidence.every((e: AnyRecord) => !!e.archivoUrl)
        ? "good"
        : pesvLatest
          ? "warning"
          : "neutral",
    },
    {
      label: "Plan anual",
      value: plan ? planProgress : "N/D",
      detail: plan ? `${planCompletedActivities}/${planTotalActivities} actividades · estado ${text(plan.estado)}` : "Plan no registrado",
      tone: pendingPlanActivities !== null && pendingPlanActivities > 0 ? "warning" : plan ? "good" : "neutral",
    },
    {
      label: "Asuntos pendientes",
      value: String(reportSummary.attentionItems.length),
      detail: `${reportSummary.attentionItems.filter((entry) => entry.priority === "urgente").length} urgentes · ver prioridades y acciones`,
      tone: reportSummary.attentionItems.some((entry) => entry.priority === "urgente") ? "critical" : reportSummary.attentionItems.length ? "warning" : "good",
    },
  ], y);
  y = writeExecutiveBlock(doc, "APRECIACIÓN GENERAL", [
    `${reportSummary.overallNarrative} Clasificación: ${reportSummary.overallStatus}. Fecha del informe: ${formatDate(reportGeneratedAt)}.`,
  ], y);
  y = writeExecutiveSummaryItems(doc, "FORTALEZAS IDENTIFICADAS", limitExecutiveItems(reportSummary.strengths, 4), y);
  const topAttention = [...reportSummary.attentionItems]
    .sort((left, right) => {
      const priorityDifference = (left.priority === "urgente" ? 0 : left.priority === "atencion" ? 1 : 2) -
        (right.priority === "urgente" ? 0 : right.priority === "atencion" ? 1 : 2);
      return priorityDifference || executivePriorityRank(left) - executivePriorityRank(right);
    })
    .slice(0, 6);
  y = writeExecutiveSummaryItems(doc, "ASUNTOS QUE REQUIEREN ATENCIÓN", topAttention, y, reportSummary.attentionItems.length - topAttention.length);
  const urgentDecisions = [...reportSummary.attentionItems]
    .filter((entry) => entry.priority === "urgente")
    .sort((left, right) => executivePriorityRank(left) - executivePriorityRank(right));
  y = writeManagerDecisions(doc, urgentDecisions, reportSummary.recommendations, y);
  y = writeEvidenceAndTraceability(doc, [
    `Trazabilidad del profesional: ${asNumber(requesterAudit[0]?.count)} actividad(es) registrada(s) por el LSO autenticado durante ${year}; la firma del plan es ${plan?.lsoSignedAt && matchesRequester({ name: plan.lsoSignatureName, license: plan.lsoSignatureLicense, signedAt: plan.lsoSignedAt }) ? "validada para esta asignación" : "no validada para esta asignación"}.`,
    `Firma empresarial del plan: ${plan?.lsoSignedAt ? "registrada" : "no registrada"}. Esto se informa como trazabilidad y no demuestra por sí solo la ejecución de las actividades.`,
    `Evidencia PESV: ${criteria.length} criterio(s), ${evidence.length} registro(s) de evidencia y ${evidence.filter((e: AnyRecord) => !!e.archivoUrl).length} archivo(s) vinculados. Un porcentaje de evaluación no sustituye la verificación documental.`,
    excludedSyntheticActionCount > 0 ? `Se excluyeron ${excludedSyntheticActionCount} ${excludedSyntheticActionCount === 1 ? "registro sintético identificado" : "registros sintéticos identificados"} como prueba del cálculo gerencial.` : "No se identificaron registros sintéticos de prueba dentro de las acciones reportadas.",
    moduleErrors.length ? `Módulos sin consulta completa: ${moduleErrors.join(", ")}.` : "No se registraron errores de consulta durante la preparación del informe.",
  ], y);
  const recommendationGroups = selectExecutiveRecommendationGroups(reportSummary.recommendations, 4);
  const recommendationLines = recommendationGroups.flatMap(({ label, entries }) => [label, ...entries.map(summaryItemLine)]);
  y = writeExecutiveBlock(doc, "RECOMENDACIONES PARA LA CONTINUIDAD", recommendationLines.length ? recommendationLines : ["No se encontró información registrada que requiera una recomendación."], y);
  y = writeExecutiveSummaryItems(doc, "CONCEPTO DE ENTREGA", [reportSummary.handoverConcept], y);
  y = startDetailPageAfterExecutive(doc, y);
  y = writeBlock(doc, "RESUMEN GENERAL DE RESULTADOS", [
    `Seguridad y salud en el trabajo: ${sstLatest ? `${text(sstLatest.porcentajeCumplimiento)}% como resultado registrado; estado ${text(sstLatest.estado)}${evaluationIsClosed(sstLatest.estado) ? "" : ", sin cierre verificado"}` : "no se encontró información registrada de una evaluación para el año"}. Seguridad vial: ${pesvLatest ? `${text(pesvLatest.porcentajeCumplimiento)}% como resultado registrado; estado ${text(pesvLatest.estado)}${evaluationIsClosed(pesvLatest.estado) ? "" : ", sin cierre verificado"}` : "no se encontró información registrada de una evaluación para el año"}.`,
    `Plan anual: ${plan ? `${planProgress} de ejecución (${planCompletedActivities} de ${planTotalActivities} actividades), estado administrativo ${text(plan.estado)}, ${pendingPlanActivities} actividad(es) pendiente(s)` : "no se encontró información registrada"}; matrices para identificar peligros y valorar riesgos: ${iperc.length}; hallazgos y acciones pendientes se describen en los apartados finales.`,
    `Estado registrado a la fecha del informe ${formatDate(reportGeneratedAt)}: ${vehicles.length} vehículo(s), ${drivers.length} conductor(es); inspecciones ${year}: ${asNumber(inspections.total)}; investigaciones: ${investigations.length}.`,
    `Lectura de evidencia: ${evidence.filter((e: AnyRecord) => !!e.archivoUrl).length} archivo(s) vinculados de ${evidence.length} registro(s) de evidencia y ${criteria.length} criterio(s); este dato mide soporte cargado, no reemplaza la revisión de contenido.`,
  ], y);
  if (sstLatest) {
     const improvementCycle = (() => { try { return JSON.parse(sstLatest.puntajesPorCicloPhva || "{}"); } catch { return {}; } })();
    const failed = sstAnswers.filter(a => !a.noAplica && a.cumple === 0).length;
     y = writeBlock(doc, "ESTADO DE LA SEGURIDAD Y SALUD EN EL TRABAJO", [
      `Evaluación ${sstLatest.anio}, ${formatDate(sstLatest.fechaEvaluacion)}: puntaje ${text(sstLatest.puntajeTotal)} de ${text(sstLatest.puntajeMaximo)} (${text(sstLatest.porcentajeCumplimiento)}%), ${text(sstLatest.estado)}.`,
       `Ciclo de mejora: ${Object.entries(improvementCycle).map(([k, v]: any) => `${k}: obtenido ${text(v?.obtenido)} de máximo ${text(v?.maximo)}`).join(" · ") || "sin desglose registrado"}. Comparación anterior: ${sstPrior ? `${text(sstPrior.porcentajeCumplimiento)}% (${asNumber(sstLatest.porcentajeCumplimiento) - asNumber(sstPrior.porcentajeCumplimiento) >= 0 ? "+" : ""}${asNumber(sstLatest.porcentajeCumplimiento) - asNumber(sstPrior.porcentajeCumplimiento)} puntos porcentuales)` : "sin evaluación previa"}.`,
      `Respuestas: ${sstAnswers.length}; no conformes: ${failed}; acciones de mejora: ${sstActions.length} (${sstActions.filter((a: AnyRecord) => a.estado !== "cerrada" && a.estado !== "completada").length} pendientes).`,
      text(sstLatest.observaciones, "Sin observaciones generales registradas."),
    ], y);
   } else y = writeBlock(doc, "ESTADO DE LA SEGURIDAD Y SALUD EN EL TRABAJO", ["No se encontró información registrada de una evaluación de seguridad y salud en el trabajo para la vigencia solicitada."], y);
   y = writeBlock(doc, "PLAN DE TRABAJO, IDENTIFICACIÓN DE PELIGROS Y SOPORTES", [
      plan ? `Plan ${year}: ${text(plan.totalActividades)} actividades, ${text(plan.actividadesCompletadas)} completadas, ejecución calculada ${planProgress} (registro: ${text(plan.porcentajeCumplimiento)}%); presupuesto ejecutado ${text(plan.presupuestoEjecutado)}.` : "No se encontró información registrada de un plan anual de trabajo.",
     `Matrices para identificar peligros y valorar riesgos (fecha del informe ${formatDate(reportGeneratedAt)}): ${iperc.length}. Registro del LSO: ${plan?.lsoSignedAt && matchesRequester({ name: plan.lsoSignatureName, license: plan.lsoSignatureLicense, signedAt: plan.lsoSignedAt }) ? "plan firmado por el LSO autenticado" : "sin firma validada para el LSO autenticado"}; registro de la empresa: ${plan?.lsoSignedAt ? "firma LSO registrada" : "sin firma registrada"}. Actividades identificadas en el historial del profesional durante ${year}: ${asNumber(requesterAudit[0]?.count)}.`,
  ], y);
   y = writeBlock(doc, "ACCIONES DE MEJORA CON RESPONSABLE Y PLAZO", [
     ...sstActions.filter((action: AnyRecord) => action.estado !== "cerrada" && action.estado !== "completada").slice(0, 12)
       .map((action: AnyRecord) => formatImprovementActionForPdf(action, "SST")),
     ...pesvActions.filter((action: AnyRecord) => action.estado !== "cerrada" && action.estado !== "completada").slice(0, 12)
       .map((action: AnyRecord) => formatImprovementActionForPdf(action, "PESV")),
     ...(sstActions.some((action: AnyRecord) => action.estado !== "cerrada" && action.estado !== "completada") ||
       pesvActions.some((action: AnyRecord) => action.estado !== "cerrada" && action.estado !== "completada")
       ? [] : ["No hay acciones de mejora SST o PESV pendientes en las evaluaciones consultadas."]),
   ], y);
   y = writeBlock(doc, "ACCIDENTES E INVESTIGACIONES", investigations.length ? investigations.slice(0, 12).map((i: AnyRecord) => {
     const actionSentence = Number(i.actionsTotal) > 0 ? `; ${formatInvestigationActions(i.actionsImplemented, i.actionsTotal)}` : "";
     return `${formatDate(i.eventDate)} ${formatInvestigationEventType(i.eventType)}: ${formatInvestigationStatus(i.status)}; la investigación ${formatInvestigationDeadlineStatus(i.slaStatus)}${actionSentence}; ${i.licensedProfessionalName ? "firma LSO registrada (empresa; el registro no permite confirmar quién realizó la actividad)" : "firma LSO pendiente"}.`;
    }) : ["No se encontró información registrada de investigaciones para la vigencia."], y);
    if (totalInvestigationActions > 0) {
      y = writeBlock(doc, "SEGUIMIENTO DE ACCIONES DE INVESTIGACIONES", [
        `Acciones de investigaciones: ${totalInvestigationActions}; implementadas: ${implementedInvestigationActions}; pendientes según los contadores registrados: ${pendingInvestigationActions}.`,
        "Estas acciones se mantienen separadas de las acciones generales SST/PESV para no mezclar fuentes de mejora.",
      ], y);
    }
  if (pesvLatest) {
    const counts = { aplicables: pesvAnswers.filter(a => !a.noAplica).length, cumplimiento: pesvAnswers.filter(a => !a.noAplica && a.cumple === 1).length, noCumple: pesvAnswers.filter(a => !a.noAplica && a.cumple === 0).length, na: pesvAnswers.filter(a => a.noAplica === 1).length, sinRespuesta: pesvAnswers.filter(a => !a.noAplica && a.cumple === null).length };
      y = writeBlock(doc, "ESTADO DE LA SEGURIDAD VIAL", [
      `Evaluación ${pesvLatest.anio}, ${formatDate(pesvLatest.createdAt)}: nivel ${text(pesvLatest.nivel)}, cumplimiento ${text(pesvLatest.porcentajeCumplimiento)}%, estado ${text(pesvLatest.estado)}.`,
       `Fases: Planear ${text(pesvLatest.puntajePlanear)}, Hacer ${text(pesvLatest.puntajeHacer)}, Verificar ${text(pesvLatest.puntajeVerificar)}, Actuar ${text(pesvLatest.puntajeActuar)}. Respuestas: aplicables ${counts.aplicables}, cumple ${counts.cumplimiento}, no cumple ${counts.noCumple}, no aplica ${counts.na}, sin respuesta ${counts.sinRespuesta}.`,
      `Hallazgos clave: ${pesvAnswers.filter(a => a.hallazgo).slice(0, 4).map(a => text(a.hallazgo, "")).join(" | ") || "sin hallazgos descritos"}; acciones ${pesvActions.length}, pendientes ${pesvActions.filter((a: AnyRecord) => a.estado !== "cerrada" && a.estado !== "completada").length}.`,
       `Registros de la operación: ${drivers.length} conductores, ${vehicles.length} vehículos; ${expiredDocumentCount} documento(s) vencido(s) en ${expiredVehicles.length} vehículo(s) a la fecha del informe; inspecciones ${asNumber(inspections.total)}, requieren revisión antes de operar ${asNumber(inspections.noAptas)}.`,
    ], y);
  }
   if (!pesvLatest) y = writeBlock(doc, "ESTADO DE LA SEGURIDAD VIAL", ["No se encontró información registrada de una evaluación del Plan Estratégico de Seguridad Vial para la vigencia solicitada; los registros de la operación se informan independientemente."], y);
  if (shouldRenderPesvOperationalSections(!!pesvLatest)) {
     y = writeBlock(doc, "ORGANIZACIÓN Y SEGUIMIENTO DE LA SEGURIDAD VIAL", [
       metric("integrantes comité ampliado", `Organización y seguimiento: ${expandedMembers.filter((c: AnyRecord) => c.estado === "activo").length} integrantes activos y ${expandedActs.length} acta(s) en ${year}.`),
      `${metric("fatiga PESV", `Fatiga: ${asNumber(fatigue.total)} controles (${asNumber(fatigue.exceptions)} excepciones)`) }; ${metric("alcohol PESV", `alcohol: ${asNumber(alcohol.total)} pruebas (${asNumber(alcohol.exceptions)} requieren atención)`) }; ${metric("encuestas de aptitud", `aptitud: ${asNumber(driverSurveys.total)} encuestas`)}`,
      `Objetivos e indicadores: ${objectives.length} objetivo(s) de ${year}, ${indicators.length} indicador(es); auditorías PESV programadas ${audits.length}, ejecutadas ${audits.filter((a: AnyRecord) => a.fechaEjecucion).length}.`,
      metric("revisión por dirección PESV", `Revisión por dirección: ${reviews.length} revisión(es) en ${year}; decisiones/compromisos ${reviewDecisions.length}, pendientes ${reviewDecisions.filter((d: AnyRecord) => d.estado !== "completada").length}.`),
       `Aptitud conductores: ${asNumber(driverSurveys.total)} encuestas, aptos ${asNumber(driverSurveys.aptos)}, requieren revisión antes de operar ${asNumber(driverSurveys.noAptos)}; alertas de sueño/salud/alcohol ${asNumber(driverSurveys.alerts)}.`,
    ], y);
    y = writeBlock(doc, "RIESGOS VIALES Y TRATAMIENTOS", riskRows.length || treatments.length ? [
       `Matriz vial: ${riskRows.length} riesgo(s), ${highRiskRows.length} de nivel alto/muy alto/crítico; activos ${riskRows.filter((r: AnyRecord) => r.activo === 1).length}.`,
       `Riesgos altos/muy altos/críticos sin tratamiento cerrado: ${untreatedHighRiskRows.length}; este conteo identifica necesidad de seguimiento, no prueba por sí solo incumplimiento.`,
       `Tratamientos: ${treatments.length}; pendientes/en curso ${treatments.filter((t: AnyRecord) => !["implementado", "cerrado", "completado"].includes(t.estado)).length}. Riesgos sin tratamiento o con eficacia baja: revisar en los registros correspondientes.`,
     ] : ["No se encontró información registrada de riesgos ni tratamientos viales."], y);
    y = writeBlock(doc, "FLOTA, CONDUCTORES Y COMPARENDOS", vehicles.length || drivers.length || comparendos.length ? [
       `Registros a la fecha del informe ${formatDate(reportGeneratedAt)}: ${vehicles.length} vehículo(s), ${drivers.length} conductor(es), ${assignments.length} asignación(es) vigentes durante ${year}.`,
       `Comparendos ${year}: ${comparendos.length}; pendientes ${comparendos.filter((c: AnyRecord) => c.estado === "pendiente").length}. Verificar licencias y vencimientos a la fecha del informe.`,
     ] : ["No se encontró información registrada de flota, conductores ni comparendos."], y);
    y = writeBlock(doc, "INSPECCIÓN Y MANTENIMIENTO", asNumber(inspections.total) || maintenances.length ? [
       `Inspecciones preoperacionales ${year}: ${asNumber(inspections.total)}; requieren revisión antes de operar ${asNumber(inspections.noAptas)}.`,
      `Mantenimientos ${year}: ${maintenances.length}; documentos de respaldo registrados ${maintenances.filter((m: AnyRecord) => !!m.documentUrl).length}; registros sin soporte vinculado ${maintenances.filter((m: AnyRecord) => !m.documentUrl).length}.`,
     ] : ["No se encontró información registrada de inspecciones ni mantenimientos en la vigencia."], y);
    y = writeBlock(doc, "RUTAS Y VELOCIDAD", routes.length || asNumber(gps.total) || asNumber(speedAlerts.total) ? [
      `Rutas seguras registradas: ${routes.length}, activas ${routes.filter((r: AnyRecord) => r.isActive === 1).length}; riesgo alto/muy alto ${routes.filter((r: AnyRecord) => ["alto", "muy_alto"].includes(r.riskLevel)).length}.`,
      `GPS ${year}: ${asNumber(gps.total)} registros, excedencias ${asNumber(gps.exceeded)}; alertas SST ${asNumber(speedAlerts.total)}, abiertas ${asNumber(speedAlerts.open)}.`,
     ] : ["No se encontró información registrada de rutas, registros de ubicación y velocidad ni alertas de velocidad."], y);
    y = writeBlock(doc, "SINIESTROS Y VÍCTIMAS", asNumber(incidents.total) || victims.length ? [
        `Siniestros viales ${year}: ${asNumber(incidents.total)}; con heridos o consecuencias graves ${asNumber(incidents.serious)}; personas fallecidas registradas ${asNumber(incidents.fatalities)}.`,
       `Atención a víctimas: ${victims.length} registro(s), seguimiento abierto ${victims.filter((v: AnyRecord) => v.estadoSeguimiento !== "cerrado").length}; verificar la actuación registrada y completar los cierres. La ausencia de un registro no permite confirmar que la atención no haya ocurrido.`,
     ] : ["No se encontró información registrada de siniestros ni víctimas en la vigencia."], y);
    y = writeBlock(doc, "FORMACIÓN VIAL", trainings.length ? [
      `Formaciones ${year}: ${trainings.length}; asistentes registrados por relación conductor-formación: ${trainingAttendees.length}, asistencias confirmadas ${trainingAttendees.filter((a: AnyRecord) => a.attended === 1).length}.`,
        `Promedio declarado por eventos: ${trainings.length ? Math.round(trainings.reduce((n: number, t: AnyRecord) => n + asNumber(t.totalAttendees), 0) / trainings.length) : 0} asistentes; relaciones conductor-formación registradas: ${trainingAttendees.length}; asistencias confirmadas: ${trainingAttendees.filter((a: AnyRecord) => a.attended === 1).length}.`,
     ] : ["No se encontró información registrada de formaciones viales en la vigencia."], y);
    y = writeBlock(doc, "OBJETIVOS, INDICADORES Y AUDITORÍA", objectives.length || indicators.length || measurements.length || audits.length || asNumber(pesvFindings.total) ? [
       `Objetivos ${year}: ${objectives.length}; indicadores definidos ${indicators.length}; mediciones ${year}: ${measurements.length}, fuera de meta registrada ${measurements.filter((m: AnyRecord) => m.cumpleMeta === 0).length}.`,
       `Auditorías PESV programadas ${year}: ${audits.length}, ejecutadas ${audits.filter((a: AnyRecord) => !!a.fechaEjecucion).length}; hallazgos registrados ${asNumber(pesvFindings.total)}, abiertos ${asNumber(pesvFindings.open)}.`,
       objectives.length === 0 && indicators.length > 0 ? "Hay indicadores registrados sin objetivos anuales asociados; no es posible verificar su contribución a una meta gerencial." : "La existencia de indicadores no demuestra por sí sola que tengan meta, responsable y seguimiento suficiente.",
     ] : ["No se encontró información registrada de objetivos, mediciones ni auditorías viales en la vigencia."], y);
    if (pesvLatest) {
      y = writeBlock(doc, "COBERTURA DE EVIDENCIA PESV", criteria.length || evidence.length ? [
        `Evaluación seleccionada: ${criteria.length} criterio(s) de verificación y ${evidence.length} evidencia(s) documental(es).`,
         `Evidencias con archivo: ${evidence.filter((e: AnyRecord) => !!e.archivoUrl).length}; criterios con observación/hallazgo: ${criteria.filter((c: AnyRecord) => !!c.observacion).length}.`,
         evidence.length > 0 && evidence.every((e: AnyRecord) => !e.archivoUrl) ? "No hay archivos cargados en los registros de evidencia consultados; el porcentaje de evaluación debe leerse como resultado registrado, no como verificación documental completa." : "La cobertura de archivos debe revisarse junto con el contenido y la vigencia de cada soporte.",
       ] : ["No se encontró información registrada de criterios ni evidencias documentales vinculadas a la evaluación del Plan Estratégico de Seguridad Vial."], y);
    }
  }
  const queue = reportSummary.attentionItems.map(summaryItemLine);
  const completeRecommendationLines = groupRecommendationPeriods(reportSummary.recommendations)
    .flatMap(({ label, entries }) => [label, ...entries.map(summaryItemLine)]);
  if (completeRecommendationLines.length) {
    y = writeBlock(doc, "PLAN COMPLETO DE RECOMENDACIONES", completeRecommendationLines, y);
  }
  y = writeBlock(doc, "ASUNTOS PRIORITARIOS", queue.length ? queue : ["No se encontró información registrada de asuntos prioritarios."], y);
  await addSignatureFooter(doc, signers, true);
  return new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.end();
  });
}