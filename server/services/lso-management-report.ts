import PDFDocument from "pdfkit";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import * as schema from "@shared/schema";
import { db } from "../db";
import {
  addSectionBar, addStandardHeader, addSignatureFooter, formatDate,
  PDF_CONFIG,
} from "./pdf-standardizer";

type AnyRecord = Record<string, any>;
const text = (v: unknown, empty = "Sin registro") => v === null || v === undefined || v === "" ? empty : String(v);
const asNumber = (v: unknown) => Number(v || 0);
const query = async <T>(fn: () => Promise<T>, fallback: T, label: string, errors: string[]): Promise<T> => {
  try { return await fn(); } catch (error: any) {
    errors.push(label);
    console.error(`[LSO management report] ${label} query failed`, error?.message || error);
    throw new Error(`Report module unavailable: ${label}`);
  }
};

function writeBlock(doc: any, title: string, lines: string[], y: number): number {
  y = addSectionBar(doc, title, y);
  doc.font("Helvetica").fontSize(8).fillColor("#000000");
  for (const line of lines) {
    const width = doc.page.width - PDF_CONFIG.MARGIN * 2 - 10;
    const rendered = `• ${line}`;
    const height = doc.heightOfString(rendered, { width, lineGap: 2 });
    if (y + height > doc.page.height - PDF_CONFIG.FOOTER_HEIGHT - 12) { doc.addPage(); y = PDF_CONFIG.MARGIN + 15; }
    doc.text(rendered, PDF_CONFIG.MARGIN + 5, y, { width, lineGap: 2 });
    y = doc.y + 3;
  }
  return y + 4;
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
  const sstActions = sstLatest ? await query(() => db.select().from(schema.accionesMejora).where(eq(schema.accionesMejora.evaluacionId, sstLatest.id)), [], "acciones SST", moduleErrors) : [];
  const pesvActions = pesvLatest ? await query(() => db.select().from(schema.accionesMejoraPesv).where(eq(schema.accionesMejoraPesv.evaluacionId, pesvLatest.id)), [], "acciones PESV", moduleErrors) : [];
  const requesterAudit = await query(() => db.select({ count: sql<number>`count(*)` }).from(schema.auditLogs).where(and(eq(schema.auditLogs.companyId, companyId), eq(schema.auditLogs.userId, userId), sql`${schema.auditLogs.timestamp} >= make_date(${year}, 1, 1)`, sql`${schema.auditLogs.timestamp} < make_date(${year + 1}, 1, 1)`)), [{ count: 0 }], "trazabilidad del LSO", moduleErrors);
  const committees = await query(() => db.select().from(schema.pesvComiteIntegrantes).where(eq(schema.pesvComiteIntegrantes.companyId, companyId)), [], "comité PESV", moduleErrors);
  const acts = await query(() => db.select().from(schema.pesvComiteActas).where(and(eq(schema.pesvComiteActas.companyId, companyId), sql`EXTRACT(YEAR FROM ${schema.pesvComiteActas.fechaReunion}) = ${year}`)), [], "actas PESV", moduleErrors);
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
  const [gps] = await query(() => db.select({ total: sql<number>`count(*)`, exceeded: sql<number>`count(*) filter (where ${schema.vehicleGpsTracking.speedExceeded} = 1)` }).from(schema.vehicleGpsTracking).where(and(eq(schema.vehicleGpsTracking.companyId, companyId), sql`EXTRACT(YEAR FROM ${schema.vehicleGpsTracking.trackingDate}) = ${year}`)), [{ total: 0, exceeded: 0 }], "GPS", moduleErrors);
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

  const chunks: Buffer[] = [];
  const doc = new PDFDocument({ size: "LETTER", margin: PDF_CONFIG.MARGIN, bufferPages: true });
  doc.on("data", (c: Buffer) => chunks.push(c));
  const signerName = lso.fullName || lso.username;
  const signerLicense = lso.sstLicenseNumber || assignment.externalLsoLicenseNumber || "";
  const normalize = (value?: string | null) => (value || "").trim().toLowerCase().replace(/\s+/g, " ");
  const matchesRequester = (record: { name?: string | null; license?: string | null; signedAt?: Date | string | null; userId?: string | null }) => {
    const signedAt = record.signedAt ? new Date(record.signedAt) : null;
    const starts = new Date(assignment.assignedAt).getTime();
    const ends = (assignment.unassignedAt || new Date()).getTime();
    return normalize(record.name) !== "" &&
      normalize(record.license) !== "" &&
      normalize(record.name) === normalize(signerName) &&
      normalize(record.license) === normalize(signerLicense) &&
      !!signedAt && !Number.isNaN(signedAt.getTime()) &&
      signedAt.getTime() >= starts && signedAt.getTime() <= ends &&
      (!record.userId || record.userId === userId);
  };
  const signers = {
    elaboro: { name: "SST-Colombia", role: "Sistema de Gestión SST" },
    autorizo: { name: company.legalRepName || "Representante de la Dirección", role: "Representante de la Dirección", signatureUrl: company.legalRepSignatureUrl || undefined },
    aprobo: { name: company.legalRepName || "Alta Dirección", role: "Alta Dirección / Gerencia", signatureUrl: company.legalRepSignatureUrl || undefined },
    lso: { name: signerName, licenseNumber: lso.sstLicenseNumber || assignment.externalLsoLicenseNumber || "Pendiente", licenseIssuer: lso.sstLicenseIssuer || assignment.externalLsoLicenseIssuer || "Secretaría de Salud", signatureUrl: lso.sstSignatureUrl || assignment.externalLsoSignatureUrl || undefined },
  };
  let y = await addStandardHeader({ doc, company: { id: company.id, name: company.name, nit: company.nit, address: company.address, logoUrl: company.logoUrl }, documentTitle: "INFORME DE GESTIÓN SST + PESV — ENTREGA LSO", documentCode: "LSO-GEST-01", version: "1.0" });
  y = writeBlock(doc, "CONTEXTO DE LA ENTREGA", [
    `Empresa: ${company.name} | NIT: ${company.nit} | ${text(company.city)} | Vigencia analizada: ${year}.`,
    `Profesional asignado: ${text(lso?.fullName || assignment?.externalLsoName)} | Licencia: ${text(lso?.sstLicenseNumber || assignment?.externalLsoLicenseNumber)} | Asignación desde: ${formatDate(assignment?.assignedAt)}.`,
    "Gestión atribuible al LSO: se limita a registros con firma, responsable o trazabilidad de auditoría. Estado de la empresa durante la vigencia: refleja datos operativos registrados, sin atribuirlos automáticamente al LSO.",
  ], y);
  y = writeBlock(doc, "KPI EJECUTIVO", [
    `SST: ${sstLatest ? `${text(sstLatest.porcentajeCumplimiento)}% (${text(sstLatest.nivelCumplimiento)})` : "sin evaluación para el año"}; PESV: ${pesvLatest ? `${text(pesvLatest.porcentajeCumplimiento)}%` : "sin evaluación para el año"}.`,
    `Plan anual: ${plan ? `${text(plan.porcentajeCumplimiento)}% (${text(plan.estado)})` : "sin registro"}; IPERC: ${iperc.length} matriz(es); hallazgos/acciones abiertas se priorizan al final.`,
    `Estado de la empresa (corte de generación ${formatDate(new Date())}): ${vehicles.length} vehículo(s), ${drivers.length} conductor(es); inspecciones ${year}: ${asNumber(inspections.total)}; investigaciones: ${investigations.length}.`,
  ], y);
  if (sstLatest) {
    const phva = (() => { try { return JSON.parse(sstLatest.puntajesPorCicloPhva || "{}"); } catch { return {}; } })();
    const failed = sstAnswers.filter(a => !a.noAplica && a.cumple === 0).length;
    y = writeBlock(doc, "SST — ÚLTIMA EVALUACIÓN Y BRECHAS", [
      `Evaluación ${sstLatest.anio}, ${formatDate(sstLatest.fechaEvaluacion)}: ${text(sstLatest.puntajeTotal)}/${text(sstLatest.puntajeMaximo)} (${text(sstLatest.porcentajeCumplimiento)}%), ${text(sstLatest.estado)}.`,
      `PHVA: ${Object.entries(phva).map(([k, v]: any) => `${k} ${text(v?.obtenido)}/${text(v?.maximo)}`).join(" · ") || "sin desglose registrado"}. Comparación anterior: ${sstPrior ? `${text(sstPrior.porcentajeCumplimiento)}% (${asNumber(sstLatest.porcentajeCumplimiento) - asNumber(sstPrior.porcentajeCumplimiento) >= 0 ? "+" : ""}${asNumber(sstLatest.porcentajeCumplimiento) - asNumber(sstPrior.porcentajeCumplimiento)} pp)` : "sin evaluación previa"}.`,
      `Respuestas: ${sstAnswers.length}; no conformes: ${failed}; acciones de mejora: ${sstActions.length} (${sstActions.filter((a: AnyRecord) => a.estado !== "cerrada" && a.estado !== "completada").length} pendientes).`,
      text(sstLatest.observaciones, "Sin observaciones generales registradas."),
    ], y);
  } else y = writeBlock(doc, "SST", ["No hay evaluación SST para la vigencia solicitada."], y);
  y = writeBlock(doc, "PLAN ANUAL, IPERC Y EVIDENCIAS", [
    plan ? `Plan ${year}: ${text(plan.totalActividades)} actividades, ${text(plan.actividadesCompletadas)} completadas, cumplimiento ${text(plan.porcentajeCumplimiento)}%; presupuesto ejecutado ${text(plan.presupuestoEjecutado)}.` : "No hay plan anual registrado.",
    `Familia IPERC (corte ${formatDate(new Date())}): ${iperc.length} matriz(es). Gestión atribuible al LSO: ${plan?.lsoSignedAt && matchesRequester({ name: plan.lsoSignatureName, license: plan.lsoSignatureLicense, signedAt: plan.lsoSignedAt }) ? "plan firmado por el LSO autenticado" : "sin firma atribuible al LSO autenticado"}; estado empresa: ${plan?.lsoSignedAt ? "firma LSO registrada" : "sin firma registrada"}. Auditoría explícita del usuario autenticado en ${year}: ${asNumber(requesterAudit[0]?.count)} evento(s).`,
  ], y);
  y = writeBlock(doc, "ACCIDENTES E INVESTIGACIONES — EXCEPCIONES", investigations.length ? investigations.slice(0, 12).map((i: AnyRecord) => `${formatDate(i.eventDate)} ${text(i.eventType)}: ${text(i.status)}; SLA ${text(i.slaStatus)}; acciones ${text(i.actionsImplemented)}/${text(i.actionsTotal)}; ${i.licensedProfessionalName ? "firma LSO registrada (empresa; sin atribución de autoría)" : "firma LSO pendiente"}.`) : ["No hay investigaciones registradas para la vigencia."], y);
  if (pesvLatest) {
    const counts = { aplicables: pesvAnswers.filter(a => !a.noAplica).length, cumplimiento: pesvAnswers.filter(a => !a.noAplica && a.cumple === 1).length, noCumple: pesvAnswers.filter(a => !a.noAplica && a.cumple === 0).length, na: pesvAnswers.filter(a => a.noAplica === 1).length, sinRespuesta: pesvAnswers.filter(a => !a.noAplica && a.cumple === null).length };
    y = writeBlock(doc, "PESV — EVALUACIÓN Y OPERACIÓN", [
      `Evaluación ${pesvLatest.anio}, ${formatDate(pesvLatest.createdAt)}: nivel ${text(pesvLatest.nivel)}, cumplimiento ${text(pesvLatest.porcentajeCumplimiento)}%, estado ${text(pesvLatest.estado)}.`,
      `Fases: Planear ${text(pesvLatest.puntajePlanear)}, Hacer ${text(pesvLatest.puntajeHacer)}, Verificar ${text(pesvLatest.puntajeVerificar)}, Actuar ${text(pesvLatest.puntajeActuar)}. Respuestas: aplicables ${counts.aplicables}, cumple ${counts.cumplimiento}, no cumple ${counts.noCumple}, N/A ${counts.na}, sin respuesta ${counts.sinRespuesta}.`,
      `Hallazgos clave: ${pesvAnswers.filter(a => a.hallazgo).slice(0, 4).map(a => text(a.hallazgo, "")).join(" | ") || "sin hallazgos descritos"}; acciones ${pesvActions.length}, pendientes ${pesvActions.filter((a: AnyRecord) => a.estado !== "cerrada" && a.estado !== "completada").length}.`,
      `Estado operativo: ${drivers.length} conductores, ${vehicles.length} vehículos; documentos con vencimiento registrado ${vehicles.filter((v: AnyRecord) => v.soatExpiry || v.technicalReviewExpiry || v.insuranceExpiry).length}; inspecciones ${asNumber(inspections.total)}, no aptas ${asNumber(inspections.noAptas)}.`,
    ], y);
  }
  if (!pesvLatest) y = writeBlock(doc, "PESV — EVALUACIÓN", ["No hay evaluación PESV para la vigencia solicitada; los dominios operativos se informan independientemente."], y);
  {
    y = writeBlock(doc, "PESV — DOMINIOS OPERATIVOS Y GOBERNANZA", [
      metric("integrantes comité ampliado", `Gobernanza: ${(expandedMembers.length ? expandedMembers.filter((c: AnyRecord) => c.estado === "activo").length : committees.filter((c: AnyRecord) => c.activo === 1).length)} integrantes activos y ${(expandedActs.length || expandedMembers.length ? expandedActs.length : acts.length)} acta(s) en ${year}; se prioriza el modelo ampliado.`),
      `${metric("fatiga PESV", `Fatiga: ${asNumber(fatigue.total)} controles (${asNumber(fatigue.exceptions)} excepciones)`) }; ${metric("alcohol PESV", `alcohol: ${asNumber(alcohol.total)} pruebas (${asNumber(alcohol.exceptions)} requieren atención)`) }; ${metric("encuestas de aptitud", `aptitud: ${asNumber(driverSurveys.total)} encuestas`)}`,
      `Objetivos e indicadores: ${objectives.length} objetivo(s) de ${year}, ${indicators.length} indicador(es); auditorías PESV programadas ${audits.length}, ejecutadas ${audits.filter((a: AnyRecord) => a.fechaEjecucion).length}.`,
      metric("revisión por dirección PESV", `Revisión por dirección: ${reviews.length} revisión(es) en ${year}; decisiones/compromisos ${reviewDecisions.length}, pendientes ${reviewDecisions.filter((d: AnyRecord) => d.estado !== "completada").length}.`),
      `Aptitud conductores: ${asNumber(driverSurveys.total)} encuestas, aptos ${asNumber(driverSurveys.aptos)}, no aptos ${asNumber(driverSurveys.noAptos)}; alertas de sueño/salud/alcohol ${asNumber(driverSurveys.alerts)}.`,
    ], y);
    y = writeBlock(doc, "RIESGOS VIALES Y TRATAMIENTOS", riskRows.length || treatments.length ? [
      `Matriz vial: ${riskRows.length} riesgo(s), ${riskRows.filter((r: AnyRecord) => ["alto", "muy_alto", "critico"].includes(r.nivelRiesgo)).length} de nivel alto/muy alto; activos ${riskRows.filter((r: AnyRecord) => r.activo === 1).length}.`,
      `Tratamientos: ${treatments.length}; pendientes/en curso ${treatments.filter((t: AnyRecord) => !["implementado", "cerrado", "completado"].includes(t.estado)).length}. Priorizar riesgos sin tratamiento o con eficacia baja.`,
    ] : ["No hay riesgos ni tratamientos viales registrados."], y);
    y = writeBlock(doc, "FLOTA, CONDUCTORES Y COMPARENDOS", vehicles.length || drivers.length || comparendos.length ? [
      `Estado al corte ${formatDate(new Date())}: ${vehicles.length} vehículo(s), ${drivers.length} conductor(es), ${assignments.length} asignación(es) vigentes durante ${year}.`,
      `Comparendos ${year}: ${comparendos.length}; pendientes ${comparendos.filter((c: AnyRecord) => c.estado === "pendiente").length}. Verificar licencias y vencimientos en la fecha de corte.`,
    ] : ["No hay registros de flota, conductores ni comparendos."], y);
    y = writeBlock(doc, "INSPECCIÓN Y MANTENIMIENTO", asNumber(inspections.total) || maintenances.length ? [
      `Inspecciones preoperacionales ${year}: ${asNumber(inspections.total)}; no aptas ${asNumber(inspections.noAptas)}.`,
      `Mantenimientos ${year}: ${maintenances.length}; soportes documentales registrados ${maintenances.filter((m: AnyRecord) => !!m.documentUrl).length}.`,
    ] : ["No hay inspecciones ni mantenimientos en la vigencia."], y);
    y = writeBlock(doc, "RUTAS Y VELOCIDAD", routes.length || asNumber(gps.total) || asNumber(speedAlerts.total) ? [
      `Rutas seguras registradas: ${routes.length}, activas ${routes.filter((r: AnyRecord) => r.isActive === 1).length}; riesgo alto/muy alto ${routes.filter((r: AnyRecord) => ["alto", "muy_alto"].includes(r.riskLevel)).length}.`,
      `GPS ${year}: ${asNumber(gps.total)} registros, excedencias ${asNumber(gps.exceeded)}; alertas SST ${asNumber(speedAlerts.total)}, abiertas ${asNumber(speedAlerts.open)}.`,
    ] : ["No hay rutas, trazas GPS ni alertas de velocidad."], y);
    y = writeBlock(doc, "SINIESTROS Y VÍCTIMAS", asNumber(incidents.total) || victims.length ? [
      `Siniestros viales ${year}: ${asNumber(incidents.total)}; con heridos/mortales ${asNumber(incidents.serious)}; fatalidades registradas ${asNumber(incidents.fatalities)}.`,
      `Atención a víctimas: ${victims.length} registro(s), seguimiento abierto ${victims.filter((v: AnyRecord) => v.estadoSeguimiento !== "cerrado").length}.`,
    ] : ["No hay siniestros ni registros de víctimas en la vigencia."], y);
    y = writeBlock(doc, "FORMACIÓN VIAL", trainings.length ? [
      `Formaciones ${year}: ${trainings.length}; asistentes registrados por relación conductor-formación: ${trainingAttendees.length}, asistencias confirmadas ${trainingAttendees.filter((a: AnyRecord) => a.attended === 1).length}.`,
      `Promedio declarado por eventos: ${trainings.length ? Math.round(trainings.reduce((n: number, t: AnyRecord) => n + asNumber(t.totalAttendees), 0) / trainings.length) : 0} asistentes; validar brechas contra la asistencia efectiva.`,
    ] : ["No hay formaciones viales en la vigencia."], y);
    y = writeBlock(doc, "OBJETIVOS, INDICADORES Y AUDITORÍA", objectives.length || indicators.length || measurements.length || audits.length || asNumber(pesvFindings.total) ? [
      `Objetivos ${year}: ${objectives.length}; indicadores definidos ${indicators.length}; mediciones ${year}: ${measurements.length}, fuera de meta ${measurements.filter((m: AnyRecord) => m.cumpleMeta === 0).length}.`,
      `Auditorías PESV programadas ${year}: ${audits.length}; hallazgos registrados ${asNumber(pesvFindings.total)}, abiertos ${asNumber(pesvFindings.open)}.`,
    ] : ["No hay objetivos, mediciones ni auditorías viales en la vigencia."], y);
    if (pesvLatest) {
      y = writeBlock(doc, "COBERTURA DE EVIDENCIA PESV", criteria.length || evidence.length ? [
        `Evaluación seleccionada: ${criteria.length} criterio(s) de verificación y ${evidence.length} evidencia(s) documental(es).`,
        `Evidencias con archivo: ${evidence.filter((e: AnyRecord) => !!e.archivoUrl).length}; criterios con observación/hallazgo: ${criteria.filter((c: AnyRecord) => !!c.observacion).length}.`,
      ] : ["No hay criterios ni evidencias documentales vinculadas a la evaluación PESV."], y);
    }
  }
  const queue = [
    ...(sstAnswers.filter(a => !a.noAplica && a.cumple === 0).length ? [`ALTA: cerrar ${sstAnswers.filter(a => !a.noAplica && a.cumple === 0).length} no conformidad(es) SST y verificar evidencia.`] : []),
    ...(investigations.some((i: AnyRecord) => !i.licensedProfessionalName || i.slaStatus === "vencido") ? ["CRÍTICA: completar firmas o SLA vencido en investigaciones de accidentes."] : []),
    ...(pesvAnswers.filter(a => a.hallazgo && a.cumple === 0).length ? [`ALTA: tratar ${pesvAnswers.filter(a => a.hallazgo && a.cumple === 0).length} hallazgo(s) PESV.`] : []),
    ...(vehicles.some((v: AnyRecord) => [v.soatExpiry, v.technicalReviewExpiry, v.insuranceExpiry].some((d: any) => d && new Date(d) < new Date())) ? ["ALTA: regularizar documentos vencidos de flota."] : []),
    "MEDIA: confirmar soportes, responsables y fechas de cierre en la próxima revisión de entrega.",
  ];
  y = writeBlock(doc, "COLA PRIORIZADA DE ENTREGA", queue, y);
  if (y + doc.heightOfString("Documento analítico generado con datos registrados en el sistema; no sustituye la verificación documental.", { width: doc.page.width - PDF_CONFIG.MARGIN * 2 }) > doc.page.height - PDF_CONFIG.FOOTER_HEIGHT) {
    doc.addPage();
    y = PDF_CONFIG.MARGIN + 15;
  }
  doc.fontSize(7).fillColor("#666666").text("Documento analítico generado con datos registrados en el sistema; no sustituye la verificación documental.", PDF_CONFIG.MARGIN, y, { width: doc.page.width - PDF_CONFIG.MARGIN * 2, align: "center" });
  await addSignatureFooter(doc, signers, true);
  return new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.end();
  });
}