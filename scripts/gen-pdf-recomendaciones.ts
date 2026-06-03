/**
 * Script para generar el PDF de Recomendaciones ARL + Plan de Mejoramiento
 * Uso: npx tsx scripts/gen-pdf-recomendaciones.ts
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
  getSignersForCompany,
  loadCompanyLogo,
} from "../server/services/pdf-standardizer";
import PDFDocument from "pdfkit";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const companyId = process.argv[2] || "demo-company-001";
  console.log(`Generando PDF para empresa: ${companyId}`);

  const [company] = await db.select().from(companies).where(eq(companies.id, companyId));
  if (!company) {
    console.error("Empresa no encontrada:", companyId);
    process.exit(1);
  }

  const logoBuffer = await loadCompanyLogo(company.logoUrl);
  const signers = await getSignersForCompany(companyId, true);
  const recomendaciones = await storage.getRecomendacionesArl(companyId);
  const acciones = await db
    .select()
    .from(accionesMejoraContexto)
    .where(eq(accionesMejoraContexto.companyId, companyId))
    .orderBy(desc(accionesMejoraContexto.createdAt));

  const subRec = await storage.getSubscriptionByCompany(companyId);
  const trialRec = getTrialStatus(subRec?.status || "trial", subRec?.trialEnd || null, true, true);

  const outputPath = path.join("/tmp", `recomendaciones-arl-plan-mejora-${companyId}.pdf`);
  const writeStream = fs.createWriteStream(outputPath);

  const doc = new PDFDocument({
    size: "LETTER",
    margin: 40,
    info: {
      Title: "Informe Unificado — Recomendaciones ARL y Plan de Mejoramiento",
      Author: "SST Colombia",
      Subject: "Estándar 7.1.4 — Resolución 0312/2019",
    },
  });
  setupTrialWatermarkOnAllPages(doc, trialRec.requiresWatermark);
  doc.pipe(writeStream);

  const margin = 40;
  const pageWidth = doc.page.width;
  const contentWidth = pageWidth - margin * 2;

  // ── SECCIÓN 1: Encabezado corporativo ─────────────────────────────────────
  let currentY = await addStandardHeader({
    doc,
    company: { id: companyId, name: company.name || "N/A", nit: company.nit || "N/A" },
    documentTitle: "RECOMENDACIONES ARL Y AUTORIDADES",
    documentCode: `SST-714-${new Date().getFullYear()}`,
    version: "1.0",
    date: new Date(),
    logoBuffer,
  });
  doc.y = currentY + 8;

  doc
    .fontSize(8)
    .font("Helvetica")
    .fillColor("#555555")
    .text(
      "Estándar 7.1.4 — Resolución 0312/2019 | Seguimiento a recomendaciones de ARL y autoridades competentes",
      margin,
      doc.y,
      { width: contentWidth, align: "center" }
    );
  doc.moveDown(0.8);

  // ── Tarjetas de estadísticas ───────────────────────────────────────────────
  const pendRec = recomendaciones.filter((r) => r.estado === "pendiente").length;
  const progrRec = recomendaciones.filter((r) => r.estado === "en_progreso").length;
  const cumpRec = recomendaciones.filter((r) => r.estado === "cumplida").length;

  const statsY = doc.y;
  const statW = contentWidth / 4;
  const statsData = [
    { label: "Total", value: recomendaciones.length.toString(), color: "#1e3a5f" },
    { label: "Pendientes", value: pendRec.toString(), color: "#dc2626" },
    { label: "En Progreso", value: progrRec.toString(), color: "#d97706" },
    { label: "Cumplidas", value: cumpRec.toString(), color: "#16a34a" },
  ];
  statsData.forEach((s, i) => {
    const x = margin + statW * i;
    doc.rect(x, statsY, statW - 4, 36).fillAndStroke("#f8fafc", s.color);
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .fillColor(s.color)
      .text(s.value, x, statsY + 4, { width: statW - 4, align: "center" });
    doc
      .fontSize(7)
      .font("Helvetica")
      .fillColor("#374151")
      .text(s.label, x, statsY + 24, { width: statW - 4, align: "center" });
  });
  doc.y = statsY + 52;
  doc.moveDown(0.3);

  // ── Tabla de recomendaciones ───────────────────────────────────────────────
  if (recomendaciones.length > 0) {
    const colW = [60, 110, 80, 70, 70, contentWidth - 390];
    const colX = [
      margin,
      margin + 60,
      margin + 170,
      margin + 250,
      margin + 320,
      margin + 390,
    ];
    const headers = ["Código", "Entidad", "Tipo", "Fecha Rec.", "Estado", "Descripción"];

    // Header row
    doc.rect(margin, doc.y, contentWidth, 16).fillAndStroke("#1e3a5f", "#1e3a5f");
    headers.forEach((h, i) => {
      doc
        .fontSize(7)
        .font("Helvetica-Bold")
        .fillColor("#ffffff")
        .text(h, colX[i] + 2, doc.y - 13, { width: colW[i] - 4 });
    });
    doc.moveDown(0.3);
    doc.fillColor("#000000");

    let rowY = doc.y;
    recomendaciones.forEach((rec, idx) => {
      if (rowY > 680) {
        doc.addPage();
        rowY = margin + 10;
      }
      const rowH = 20;
      doc
        .rect(margin, rowY, contentWidth, rowH)
        .fillAndStroke(idx % 2 === 0 ? "#f9fafb" : "#ffffff", "#e5e7eb");
      const estColor =
        rec.estado === "cumplida"
          ? "#16a34a"
          : rec.estado === "en_progreso"
          ? "#d97706"
          : "#dc2626";
      doc.fontSize(7).font("Helvetica").fillColor("#111827");
      doc.text(rec.codigo || "—", colX[0] + 2, rowY + 4, { width: colW[0] - 4 });
      doc.text((rec.nombreEntidad || rec.origen || "—").substring(0, 18), colX[1] + 2, rowY + 4, {
        width: colW[1] - 4,
      });
      doc.text((rec.tipoRecomendacion || "—").replace("_", " "), colX[2] + 2, rowY + 4, {
        width: colW[2] - 4,
      });
      doc.text(
        rec.fechaRecepcion
          ? new Date(rec.fechaRecepcion).toLocaleDateString("es-CO")
          : "—",
        colX[3] + 2,
        rowY + 4,
        { width: colW[3] - 4 }
      );
      doc
        .fillColor(estColor)
        .text((rec.estado || "pendiente").replace("_", " "), colX[4] + 2, rowY + 4, {
          width: colW[4] - 4,
        });
      doc
        .fillColor("#111827")
        .text((rec.descripcion || "—").substring(0, 55), colX[5] + 2, rowY + 4, {
          width: colW[5] - 4,
        });
      rowY += rowH;
    });
    doc.y = rowY + 8;
  } else {
    doc
      .fontSize(9)
      .font("Helvetica-Oblique")
      .fillColor("#6b7280")
      .text("No se han registrado recomendaciones ARL.", margin, doc.y, {
        width: contentWidth,
        align: "center",
      });
    doc.moveDown();
  }

  // ── SECCIÓN 2: Plan de Mejoramiento ───────────────────────────────────────
  doc.addPage();
  currentY = await addStandardHeader({
    doc,
    company: { id: companyId, name: company.name || "N/A", nit: company.nit || "N/A" },
    documentTitle: "PLAN DE MEJORAMIENTO",
    documentCode: `SST-PM-${new Date().getFullYear()}`,
    version: "1.0",
    date: new Date(),
    logoBuffer,
  });
  doc.y = currentY + 8;

  doc
    .fontSize(8)
    .font("Helvetica")
    .fillColor("#555555")
    .text(
      "Acciones de mejora generadas a partir de recomendaciones ARL y autoridades (origenHallazgo: arl_autoridad)",
      margin,
      doc.y,
      { width: contentWidth, align: "center" }
    );
  doc.moveDown(0.8);

  // Tarjetas acciones
  const arlAcciones = acciones.filter((a) => a.origenHallazgo === "arl_autoridad");
  const pendAcc = arlAcciones.filter((a) => a.estado === "pendiente").length;
  const progrAcc = arlAcciones.filter((a) => a.estado === "en_progreso").length;
  const compAcc = arlAcciones.filter((a) => a.estado === "completada").length;

  const statsY2 = doc.y;
  const statsData2 = [
    { label: "Total Acciones", value: arlAcciones.length.toString(), color: "#1e3a5f" },
    { label: "Pendientes", value: pendAcc.toString(), color: "#dc2626" },
    { label: "En Progreso", value: progrAcc.toString(), color: "#d97706" },
    { label: "Completadas", value: compAcc.toString(), color: "#16a34a" },
  ];
  statsData2.forEach((s, i) => {
    const x = margin + statW * i;
    doc.rect(x, statsY2, statW - 4, 36).fillAndStroke("#f8fafc", s.color);
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .fillColor(s.color)
      .text(s.value, x, statsY2 + 4, { width: statW - 4, align: "center" });
    doc
      .fontSize(7)
      .font("Helvetica")
      .fillColor("#374151")
      .text(s.label, x, statsY2 + 24, { width: statW - 4, align: "center" });
  });
  doc.y = statsY2 + 52;
  doc.moveDown(0.3);

  // Tabla acciones
  if (acciones.length > 0) {
    const aColW = [contentWidth - 280, 80, 70, 70, 60];
    const aColX = [
      margin,
      margin + contentWidth - 280,
      margin + contentWidth - 200,
      margin + contentWidth - 130,
      margin + contentWidth - 60,
    ];
    const aHeaders = ["Acción", "Origen", "Prioridad", "Fecha Límite", "Estado"];

    doc.rect(margin, doc.y, contentWidth, 16).fillAndStroke("#1e3a5f", "#1e3a5f");
    aHeaders.forEach((h, i) => {
      doc
        .fontSize(7)
        .font("Helvetica-Bold")
        .fillColor("#ffffff")
        .text(h, aColX[i] + 2, doc.y - 13, { width: aColW[i] - 4 });
    });
    doc.moveDown(0.3);
    doc.fillColor("#000000");

    let aRowY = doc.y;
    acciones.forEach((acc, idx) => {
      if (aRowY > 680) {
        doc.addPage();
        aRowY = margin + 10;
      }
      const rowH = 22;
      doc
        .rect(margin, aRowY, contentWidth, rowH)
        .fillAndStroke(idx % 2 === 0 ? "#f9fafb" : "#ffffff", "#e5e7eb");
      const prioColor =
        acc.prioridad === "alta"
          ? "#dc2626"
          : acc.prioridad === "media"
          ? "#d97706"
          : "#16a34a";
      const estColor =
        acc.estado === "completada"
          ? "#16a34a"
          : acc.estado === "en_progreso"
          ? "#d97706"
          : "#6b7280";
      doc.fontSize(7).font("Helvetica").fillColor("#111827");
      doc.text((acc.accion || "—").substring(0, 70), aColX[0] + 2, aRowY + 4, {
        width: aColW[0] - 4,
      });
      doc.text(
        (acc.origenHallazgo || acc.tipoFoda || "—").replace("_", " "),
        aColX[1] + 2,
        aRowY + 4,
        { width: aColW[1] - 4 }
      );
      doc
        .fillColor(prioColor)
        .text(acc.prioridad || "media", aColX[2] + 2, aRowY + 4, { width: aColW[2] - 4 });
      doc
        .fillColor("#111827")
        .text(
          acc.fechaLimite
            ? new Date(acc.fechaLimite).toLocaleDateString("es-CO")
            : "—",
          aColX[3] + 2,
          aRowY + 4,
          { width: aColW[3] - 4 }
        );
      doc
        .fillColor(estColor)
        .text(acc.estado || "pendiente", aColX[4] + 2, aRowY + 4, { width: aColW[4] - 4 });
      aRowY += rowH;
    });
    doc.y = aRowY + 6;
  } else {
    doc
      .fontSize(9)
      .font("Helvetica-Oblique")
      .fillColor("#6b7280")
      .text("No se han registrado acciones de mejora.", margin, doc.y, {
        width: contentWidth,
        align: "center",
      });
    doc.moveDown();
  }

  // ── Firma LSO ──────────────────────────────────────────────────────────────
  await addSignatureFooter(doc, signers, true);
  doc.end();

  await new Promise<void>((resolve, reject) => {
    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
  });

  console.log(`✅ PDF generado: ${outputPath}`);
  console.log(`   Recomendaciones: ${recomendaciones.length}`);
  console.log(`   Acciones de mejora: ${acciones.length}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
