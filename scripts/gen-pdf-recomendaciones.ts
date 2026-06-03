/**
 * Script para generar el PDF de Recomendaciones ARL + Plan de Mejoramiento
 * Uso: npx tsx scripts/gen-pdf-recomendaciones.ts [companyId]
 */
import { db } from "../server/db";
import { eq, desc } from "drizzle-orm";
import { companies, accionesMejoraContexto } from "@shared/schema";
import { storage } from "../server/storage";
import { getTrialStatus } from "@shared/utils";
import { setupTrialWatermarkOnAllPages } from "../server/services/pdf-watermark";
import {
  addStandardHeader,
  addSignatureFooter,
  addSectionBar,
  addSimpleTable,
  getSignersForCompany,
  loadCompanyLogo,
  PDF_COLORS,
  PDF_CONFIG,
} from "../server/services/pdf-standardizer";
import PDFDocument from "pdfkit";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const companyId = process.argv[2] || "demo-company-001";
  console.log(`Generando PDF para empresa: ${companyId}`);

  const [company] = await db.select().from(companies).where(eq(companies.id, companyId));
  if (!company) { console.error("Empresa no encontrada:", companyId); process.exit(1); }

  const logoBuffer = await loadCompanyLogo(company.logoUrl);
  const signers = await getSignersForCompany(companyId, true);
  const recomendaciones = await storage.getRecomendacionesArl(companyId);
  const acciones = await db.select().from(accionesMejoraContexto)
    .where(eq(accionesMejoraContexto.companyId, companyId))
    .orderBy(desc(accionesMejoraContexto.createdAt));

  const subRec = await storage.getSubscriptionByCompany(companyId);
  const trialRec = getTrialStatus(subRec?.status || "trial", subRec?.trialEnd || null, true, true);

  const outputPath = path.join("/tmp", `recomendaciones-arl-plan-mejora-${companyId}.pdf`);
  const writeStream = fs.createWriteStream(outputPath);

  const doc = new PDFDocument({
    size: "LETTER",
    margin: PDF_CONFIG.MARGIN,
    info: {
      Title: "Recomendaciones ARL y Plan de Mejoramiento",
      Author: "SST Colombia",
      Subject: "Estándar 7.1.4 — Resolución 0312/2019",
    },
  });
  setupTrialWatermarkOnAllPages(doc, trialRec.requiresWatermark);
  doc.pipe(writeStream);

  const margin = PDF_CONFIG.MARGIN;
  const pageWidth = doc.page.width;
  const contentWidth = pageWidth - margin * 2;

  const fmtDate = (d: string | Date | null | undefined) =>
    d ? new Date(d).toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";
  const labelEstado: Record<string, string> = {
    pendiente: "Pendiente", en_progreso: "En Progreso", cumplida: "Cumplida",
    completada: "Completada", cancelada: "Cancelada",
  };
  const labelTipo: Record<string, string> = {
    arl: "ARL", autoridad_competente: "Autoridad", ministerio_trabajo: "Min. Trabajo",
    inspector: "Inspector", otro: "Otro",
  };
  const labelOrigen: Record<string, string> = {
    arl_autoridad: "ARL/Autoridad", investigacion_accidente: "Inv. Accidente",
    auditoria: "Auditoría", analisis_contexto: "Análisis Contexto",
    copasst: "COPASST", brigada: "Brigada", otro: "Otro",
  };
  const labelPrioridad: Record<string, string> = { alta: "Alta", media: "Media", baja: "Baja" };

  // ════════════════ PÁGINA 1 — RECOMENDACIONES ARL ════════════════
  let y = await addStandardHeader({
    doc,
    company: { id: companyId, name: company.name || "N/A", nit: company.nit || "N/A" },
    documentTitle: "RECOMENDACIONES ARL Y AUTORIDADES",
    documentCode: `SST-714-${new Date().getFullYear()}`,
    version: "1.0",
    date: new Date(),
    logoBuffer,
  });
  doc.moveTo(margin, y + 4).lineTo(pageWidth - margin, y + 4).stroke("#cccccc");
  doc.y = y + 14;

  const pendRec  = recomendaciones.filter(r => r.estado === "pendiente").length;
  const progrRec = recomendaciones.filter(r => r.estado === "en_progreso").length;
  const cumpRec  = recomendaciones.filter(r => r.estado === "cumplida").length;

  y = addSectionBar(doc, "1. RESUMEN — ESTÁNDAR 7.1.4 (RESOLUCIÓN 0312/2019)", doc.y);
  doc.y = y + 4;
  addSimpleTable(doc, ["Indicador", "Cantidad"], [
    ["Total recomendaciones registradas", recomendaciones.length.toString()],
    ["Recomendaciones pendientes",        pendRec.toString()],
    ["Recomendaciones en progreso",       progrRec.toString()],
    ["Recomendaciones cumplidas",         cumpRec.toString()],
  ], { y: doc.y, columnWidths: [contentWidth * 0.70, contentWidth * 0.30] });
  doc.y += 14;

  y = addSectionBar(doc, "2. DETALLE DE RECOMENDACIONES", doc.y);
  doc.y = y + 4;
  if (recomendaciones.length > 0) {
    const cw = [contentWidth*0.09, contentWidth*0.18, contentWidth*0.12, contentWidth*0.11, contentWidth*0.12, contentWidth*0.38];
    addSimpleTable(doc, ["Código", "Entidad", "Tipo", "Fecha Rec.", "Estado", "Descripción"],
      recomendaciones.map(r => [
        r.codigo || "—",
        (r.nombreEntidad || r.origen || "—").substring(0, 22),
        labelTipo[r.tipoRecomendacion || ""] || (r.tipoRecomendacion || "—"),
        fmtDate(r.fechaRecepcion),
        labelEstado[r.estado || ""] || (r.estado || "—"),
        (r.descripcion || "—").substring(0, 120),
      ]),
      { y: doc.y, columnWidths: cw }
    );
  } else {
    doc.y += 6;
    doc.fontSize(9).font("Helvetica-Oblique").fillColor("#666666")
      .text("No se han registrado recomendaciones para esta empresa.", margin, doc.y, { width: contentWidth, align: "center" });
    doc.y += 18;
  }
  doc.fillColor(PDF_COLORS.BLACK);
  doc.y += 8;

  const hoy = new Date();
  const porVencer = recomendaciones.filter(r => {
    if (r.estado === "cumplida") return false;
    if (!r.fechaLimite) return false;
    const diff = (new Date(r.fechaLimite).getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 30;
  });
  if (porVencer.length > 0) {
    y = addSectionBar(doc, "3. RECOMENDACIONES PRÓXIMAS A VENCER (≤ 30 DÍAS)", doc.y);
    doc.y = y + 4;
    addSimpleTable(doc, ["Código", "Entidad", "Fecha Límite", "Días Restantes", "Estado"],
      porVencer.map(r => {
        const dias = Math.ceil((new Date(r.fechaLimite!).getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
        return [r.codigo || "—", (r.nombreEntidad || "—").substring(0, 28), fmtDate(r.fechaLimite), dias <= 0 ? "VENCIDA" : `${dias} días`, labelEstado[r.estado || ""] || "—"];
      }),
      { y: doc.y, columnWidths: [contentWidth*0.12, contentWidth*0.30, contentWidth*0.18, contentWidth*0.18, contentWidth*0.22] }
    );
    doc.fillColor(PDF_COLORS.BLACK);
    doc.y += 14;
  }

  // ════════════════ PÁGINA 2 — PLAN DE MEJORAMIENTO ════════════════
  doc.addPage();
  y = await addStandardHeader({
    doc,
    company: { id: companyId, name: company.name || "N/A", nit: company.nit || "N/A" },
    documentTitle: "PLAN DE MEJORAMIENTO",
    documentCode: `SST-PM-${new Date().getFullYear()}`,
    version: "1.0",
    date: new Date(),
    logoBuffer,
  });
  doc.moveTo(margin, y + 4).lineTo(pageWidth - margin, y + 4).stroke("#cccccc");
  doc.y = y + 14;

  const pendAcc  = acciones.filter(a => a.estado === "pendiente").length;
  const progrAcc = acciones.filter(a => a.estado === "en_progreso").length;
  const compAcc  = acciones.filter(a => a.estado === "completada").length;
  const altaAcc  = acciones.filter(a => a.prioridad === "alta").length;

  y = addSectionBar(doc, "1. RESUMEN DEL PLAN DE MEJORAMIENTO", doc.y);
  doc.y = y + 4;
  addSimpleTable(doc, ["Indicador", "Cantidad"], [
    ["Total acciones de mejora registradas", acciones.length.toString()],
    ["Acciones pendientes",                  pendAcc.toString()],
    ["Acciones en progreso",                 progrAcc.toString()],
    ["Acciones completadas",                 compAcc.toString()],
    ["Acciones de prioridad alta",           altaAcc.toString()],
  ], { y: doc.y, columnWidths: [contentWidth * 0.70, contentWidth * 0.30] });
  doc.y += 14;

  y = addSectionBar(doc, "2. DETALLE DE ACCIONES DE MEJORA", doc.y);
  doc.y = y + 4;
  if (acciones.length > 0) {
    const aw = [contentWidth*0.34, contentWidth*0.18, contentWidth*0.12, contentWidth*0.18, contentWidth*0.18];
    addSimpleTable(doc, ["Acción", "Origen", "Prioridad", "Fecha Límite", "Estado"],
      acciones.map(a => [
        (a.accion || "—").substring(0, 90),
        labelOrigen[a.origenHallazgo || ""] || (a.origenHallazgo || a.tipoFoda || "—"),
        labelPrioridad[a.prioridad || ""] || (a.prioridad || "—"),
        fmtDate(a.fechaLimite),
        labelEstado[a.estado || ""] || (a.estado || "—"),
      ]),
      { y: doc.y, columnWidths: aw }
    );
  } else {
    doc.y += 6;
    doc.fontSize(9).font("Helvetica-Oblique").fillColor("#666666")
      .text("No se han registrado acciones de mejora para esta empresa.", margin, doc.y, { width: contentWidth, align: "center" });
    doc.y += 18;
  }
  doc.fillColor(PDF_COLORS.BLACK);
  doc.y += 14;

  y = addSectionBar(doc, "3. REFERENCIA NORMATIVA Y COMPROMISO", doc.y);
  doc.y = y + 8;
  doc.fontSize(8).font("Helvetica").fillColor("#333333")
    .text(
      "Este documento es parte integral del Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST) " +
      "y da cumplimiento al Estándar 7.1.4 de la Resolución 0312 de 2019, el cual exige el seguimiento y " +
      "cierre de las recomendaciones emitidas por la ARL, el Ministerio de Trabajo, inspectores de trabajo " +
      "y demás autoridades competentes. El Plan de Mejoramiento consolida las acciones correctivas, " +
      "preventivas y de mejora continua derivadas de estos hallazgos conforme a los requisitos del " +
      "numeral 10.2 de la norma ISO 45001:2018.",
      margin, doc.y, { width: contentWidth, align: "justify", lineGap: 2 }
    );
  doc.fillColor(PDF_COLORS.BLACK);
  doc.y += 14;

  await addSignatureFooter(doc, signers, true);
  doc.end();

  await new Promise<void>((resolve, reject) => {
    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
  });

  console.log(`✅ PDF generado: ${outputPath}`);
  console.log(`   Recomendaciones: ${recomendaciones.length} | Acciones: ${acciones.length}`);
  process.exit(0);
}

main().catch(err => { console.error("Error:", err); process.exit(1); });
