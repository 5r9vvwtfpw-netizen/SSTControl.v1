import PDFDocument from "pdfkit";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../db";
import {
  accidents,
  companies,
  companySedes,
  evaluacionesSst,
  healthConditions,
  inspections,
  medicalExams,
  partesInteresadas,
  trainings,
  workers,
} from "@shared/schema";
import {
  addSectionBar,
  addSignatureFooter,
  addSimpleTable,
  addStandardHeader,
  formatDate,
  getSignersForCompany,
  PDF_CONFIG,
} from "../services/pdf-standardizer";

export type MissingSstReport =
  | "rendicion-cuentas"
  | "condiciones-salud"
  | "examenes-medicos"
  | "partes-interesadas"
  | "sedes"
  | "evaluaciones-consolidado";

const text = (value: unknown) => value == null || value === "" ? "No registrado" : String(value);
const list = (value: string[] | null) => value?.filter(Boolean).join("; ") || "No registrado";

function dateInPeriod(value: Date | string | null, year?: number, month?: number) {
  if (!value || (!year && !month)) return true;
  const date = new Date(value);
  return (!year || date.getFullYear() === year) && (!month || date.getMonth() + 1 === month);
}

export async function generateMissingSstReport(
  report: MissingSstReport,
  companyId: string,
  res: import("express").Response,
  period: { year?: number; month?: number } = {},
) {
  const [company] = await db.select().from(companies).where(eq(companies.id, companyId)).limit(1);
  if (!company) throw new Error("Empresa no encontrada");

  const titles: Record<MissingSstReport, string> = {
    "rendicion-cuentas": "Rendición de cuentas del SG-SST",
    "condiciones-salud": "Reporte de condiciones de salud",
    "examenes-medicos": "Reporte de exámenes médicos ocupacionales",
    "partes-interesadas": "Matriz de partes interesadas",
    sedes: "Reporte de sedes de la empresa",
    "evaluaciones-consolidado": "Consolidado histórico de evaluaciones SST",
  };
  const codes: Record<MissingSstReport, string> = {
    "rendicion-cuentas": "SST-INF-RC01",
    "condiciones-salud": "SST-INF-CS01",
    "examenes-medicos": "SST-INF-EM01",
    "partes-interesadas": "SST-MAT-PI01",
    sedes: "SST-INF-SE01",
    "evaluaciones-consolidado": "SST-INF-ES01",
  };

  const safeName = report.replace(/[^a-z0-9-]/gi, "-");
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${safeName}-${companyId.replace(/[^a-zA-Z0-9_-]/g, "")}.pdf"`);
  const doc = new PDFDocument({ margin: PDF_CONFIG.MARGIN, size: "LETTER", bufferPages: true });
  doc.pipe(res);
  await addStandardHeader({ doc, company, documentTitle: titles[report], documentCode: codes[report] });
  doc.font("Helvetica").fontSize(8);
  const periodLabel = period.year ? `Período: ${period.month ? `${period.month}/` : ""}${period.year}` : "Corte: información registrada a la fecha";
  doc.text(periodLabel, PDF_CONFIG.MARGIN, doc.y + 4);
  doc.text(`Fecha de generación: ${formatDate(new Date())}`, PDF_CONFIG.MARGIN, doc.y + 2);
  doc.moveDown(1);

  if (report === "rendicion-cuentas") {
    const [allWorkers, allTrainings, allInspections, allAccidents, allConditions, allExams] = await Promise.all([
      db.select().from(workers).where(eq(workers.companyId, companyId)),
      db.select().from(trainings).where(eq(trainings.companyId, companyId)),
      db.select().from(inspections).where(eq(inspections.companyId, companyId)),
      db.select().from(accidents).where(eq(accidents.companyId, companyId)),
      db.select().from(healthConditions).where(eq(healthConditions.companyId, companyId)),
      db.select().from(medicalExams).where(eq(medicalExams.companyId, companyId)),
    ]);
    const filter = <T extends { createdAt: Date }>(items: T[]) => items.filter(x => dateInPeriod(x.createdAt, period.year, period.month));
    const trainingData = filter(allTrainings);
    const inspectionData = filter(allInspections);
    const accidentData = allAccidents.filter(x => dateInPeriod(x.date, period.year, period.month));
    const conditionData = filter(allConditions);
    const examData = filter(allExams);
    let y = addSectionBar(doc, "Resumen de gestión");
    y = addSimpleTable(doc, ["Indicador", "Resultado"], [
      ["Trabajadores registrados", String(allWorkers.length)],
      ["Capacitaciones registradas en el período", String(trainingData.length)],
      ["Inspecciones registradas en el período", String(inspectionData.length)],
      ["Hallazgos de inspección", String(inspectionData.reduce((total, item) => total + item.findings, 0))],
      ["Accidentes registrados en el período", String(accidentData.length)],
      ["Condiciones de salud registradas en el período", String(conditionData.length)],
      ["Exámenes médicos registrados en el período", String(examData.length)],
    ], { y });
    y = addSectionBar(doc, "Detalle de inspecciones", y);
    addSimpleTable(doc, ["Fecha", "Área", "Cumplimiento", "Hallazgos", "Estado"], inspectionData.map(item => [
      formatDate(item.date), text(item.area), `${item.compliance}%`, String(item.findings), text(item.status),
    ]), { y });
  } else if (report === "condiciones-salud") {
    const rows = await db.select({ condition: healthConditions, worker: workers })
      .from(healthConditions).innerJoin(workers, and(eq(workers.id, healthConditions.workerId), eq(workers.companyId, companyId)))
      .where(eq(healthConditions.companyId, companyId)).orderBy(desc(healthConditions.diagnosisDate));
    let y = addSectionBar(doc, "Condiciones registradas");
    addSimpleTable(doc, ["Trabajador", "Tipo", "Descripción", "Diagnóstico", "Estado", "Seguimiento"], rows.map(({ condition, worker }) => [
      worker.name, text(condition.conditionType), text(condition.description), formatDate(condition.diagnosisDate),
      text(condition.status), condition.requiresFollowUp ? formatDate(condition.followUpDate) : "No requerido",
    ]), { y, columnWidths: [90, 55, 130, 65, 60, 65] });
  } else if (report === "examenes-medicos") {
    const rows = await db.select({ exam: medicalExams, worker: workers })
      .from(medicalExams).innerJoin(workers, and(eq(workers.id, medicalExams.workerId), eq(workers.companyId, companyId)))
      .where(eq(medicalExams.companyId, companyId)).orderBy(desc(medicalExams.scheduledDate));
    let y = addSectionBar(doc, "Exámenes registrados");
    addSimpleTable(doc, ["Trabajador", "Tipo", "Programado", "Realizado", "Aptitud", "Estado", "Seguimiento"], rows.map(({ exam, worker }) => [
      worker.name, text(exam.examType), formatDate(exam.scheduledDate), formatDate(exam.performedDate),
      text(exam.aptitude), text(exam.status), formatDate(exam.followUpDate),
    ]), { y, columnWidths: [80, 60, 62, 62, 60, 55, 66] });
  } else if (report === "partes-interesadas") {
    const rows = await db.select().from(partesInteresadas).where(eq(partesInteresadas.companyId, companyId)).orderBy(partesInteresadas.nombre);
    let y = addSectionBar(doc, "Partes interesadas identificadas");
    addSimpleTable(doc, ["Nombre", "Tipo / categoría", "Necesidades", "Expectativas", "Comunicación", "Influencia / interés"], rows.map(item => [
      item.nombre, `${item.tipo} / ${item.categoria}`, list(item.necesidades), list(item.expectativas),
      `${text(item.frecuenciaComunicacion)} - ${text(item.medioComunicacion)}`, `${item.nivelInfluencia} / ${item.nivelInteres}`,
    ]), { y, columnWidths: [75, 80, 100, 100, 80, 55] });
  } else if (report === "sedes") {
    const rows = await db.select().from(companySedes).where(eq(companySedes.companyId, companyId)).orderBy(desc(companySedes.isMain), companySedes.name);
    let y = addSectionBar(doc, "Sedes registradas");
    addSimpleTable(doc, ["Sede", "Ciudad", "Dirección", "Teléfono", "Correo", "Tipo", "Estado"], rows.map(item => [
      item.name, text(item.city), text(item.address), text(item.contactPhone), text(item.contactEmail),
      item.isMain ? "Principal" : "Sucursal", text(item.status),
    ]), { y, columnWidths: [75, 60, 105, 60, 95, 50, 40] });
  } else {
    const rows = await db.select().from(evaluacionesSst).where(eq(evaluacionesSst.companyId, companyId))
      .orderBy(desc(evaluacionesSst.anio), desc(evaluacionesSst.mes), desc(evaluacionesSst.version));
    let y = addSectionBar(doc, "Histórico de evaluaciones");
    addSimpleTable(doc, ["Año / mes", "Fecha", "Responsable", "Puntaje", "Cumplimiento", "Nivel", "Estado"], rows.map(item => [
      `${item.anio} / ${item.mes}`, formatDate(item.fechaEvaluacion), item.responsableNombre,
      `${item.puntajeTotal} / ${item.puntajeMaximo}`, `${item.porcentajeCumplimiento}%`,
      text(item.nivelCumplimiento), text(item.estado),
    ]), { y, columnWidths: [55, 58, 105, 65, 65, 70, 57] });
  }

  await addSignatureFooter(doc, await getSignersForCompany(companyId), false);
  doc.end();
}