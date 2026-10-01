import { readFile } from "node:fs/promises";
import path from "node:path";
import PDFKit from "pdfkit";
import { PDFDocument } from "pdf-lib";
import { presentacionSgsstSchema, type PresentacionSgsstInput } from "@shared/presentacion-sgsst";

const COLORS = {
  green: "#193D2D",
  gold: "#C5A74C",
  mint: "#F1F6F2",
  text: "#25372E",
  muted: "#526459",
};

function createRecipientCover(input: PresentacionSgsstInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFKit({ size: "A4", margin: 0 });
    const chunks: Buffer[] = [];
    doc.on("data", chunk => chunks.push(Buffer.from(chunk)));
    doc.on("error", reject);
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    try {
      const width = doc.page.width;
      const contentWidth = width - 128;
      const formatDate = new Date(`${input.fechaEmision}T12:00:00Z`).toLocaleDateString("es-CO", {
        year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
      });

      doc.rect(0, 0, width, 211).fill(COLORS.green);
      doc.rect(0, 211, width, 4).fill(COLORS.gold);
      doc.font("Helvetica-Bold").fontSize(12).fillColor(COLORS.gold)
        .text("SST COLOMBIA", 48, 40, { width: width - 96 });
      doc.fontSize(28).fillColor("white")
        .text("Presentación comercial", 48, 82, { width: width - 96 });
      doc.fontSize(23).text("Sistema de gestión SG-SST y PESV", 48, 121, { width: width - 96 });
      doc.font("Helvetica").fontSize(10).fillColor("#D8E8DD")
        .text("Información de la plataforma, muestras de informes y suscripción.", 48, 176, { width: width - 96 });

      let companyFontSize = 22;
      doc.font("Helvetica-Bold").fontSize(companyFontSize);
      while (doc.heightOfString(input.empresa, { width: contentWidth }) > 78 && companyFontSize > 14) {
        doc.fontSize(--companyFontSize);
      }
      const companyHeight = doc.heightOfString(input.empresa, { width: contentWidth });
      doc.font("Helvetica").fontSize(10);
      const attentionText = input.destinatario ? `Atención: ${input.destinatario}` : "";
      const attentionHeight = attentionText ? doc.heightOfString(attentionText, { width: contentWidth }) + 10 : 0;
      const cardHeight = 86 + companyHeight + (input.nit ? 23 : 0) + attentionHeight;
      const cardTop = 246;
      doc.roundedRect(44, cardTop, width - 88, cardHeight, 8).fill(COLORS.mint);
      doc.font("Helvetica-Bold").fontSize(9).fillColor(COLORS.muted)
        .text("EMPRESA DESTINATARIA", 64, cardTop + 21, { width: contentWidth });
      doc.fontSize(companyFontSize).fillColor(COLORS.green)
        .text(input.empresa, 64, cardTop + 44, { width: contentWidth });
      let y = cardTop + 44 + companyHeight + 12;
      doc.font("Helvetica").fontSize(10).fillColor(COLORS.text);
      if (input.nit) {
        doc.text(`NIT: ${input.nit}`, 64, y, { width: contentWidth });
        y += 23;
      }
      if (attentionText) {
        doc.text(attentionText, 64, y, { width: contentWidth });
        y += attentionHeight;
      }
      doc.text(`Fecha de emisión: ${formatDate}`, 64, y, { width: contentWidth });

      y = cardTop + cardHeight + 27;
      doc.font("Helvetica-Bold").fontSize(13).fillColor(COLORS.green)
        .text("Contenido de la presentación", 48, y, { width: width - 96 });
      y += 30;
      const sections = [
        ["01", "Sistema de gestión SG-SST", "Alcance y funcionalidades de la plataforma."],
        ["02", "Muestra de evaluación inicial SST", "Ejemplo de informe conforme a la Resolución 0312 de 2019."],
        ["03", "Muestra de autoevaluación PESV", "Ejemplo de informe conforme a la Resolución 40595 de 2022."],
        ["04", "Suscripción y contacto", "Tarifa y servicios descritos en el documento adjunto."],
      ];
      for (const [number, title, description] of sections) {
        doc.font("Helvetica-Bold").fontSize(11).fillColor(COLORS.gold).text(number, 48, y);
        doc.fillColor(COLORS.text).text(title, 78, y, { width: width - 126 });
        doc.font("Helvetica").fontSize(9).fillColor(COLORS.muted)
          .text(description, 78, y + 15, { width: width - 126 });
        y += 40;
      }
      y += 6;
      doc.font("Helvetica").fontSize(9).fillColor(COLORS.muted).text(
        "Las evaluaciones incluidas son muestras ilustrativas. No constituyen un diagnóstico ni acreditan resultados o cumplimiento de la empresa destinataria. Las cuatro páginas siguientes conservan el contenido del documento de presentación suministrado.",
        48, y, { width: width - 96, lineGap: 2 },
      );
      doc.rect(0, doc.page.height - 38, width, 38).fill(COLORS.green);
      doc.fontSize(8).fillColor(COLORS.gold).text(
        "SADGI S.A.S. · NIT 902.036.337-4 · SST Colombia",
        48, doc.page.height - 24, { width: width - 96, align: "center", lineBreak: false },
      );
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export async function generatePresentacionSgsstPdf(data: PresentacionSgsstInput): Promise<Buffer> {
  const input = presentacionSgsstSchema.parse(data);
  // Keep a permanent deployable asset, not a reference to a transient upload.
  const templatePath = path.join(process.cwd(), "server", "assets", "presentacion-sgsst-base.pdf");
  const [templateBuffer, coverBuffer] = await Promise.all([
    readFile(templatePath),
    createRecipientCover(input),
  ]);
  const [template, cover] = await Promise.all([
    PDFDocument.load(templateBuffer),
    PDFDocument.load(coverBuffer),
  ]);
  if (template.getPageCount() !== 4 || cover.getPageCount() !== 1) {
    throw new Error("El documento base o su portada no tienen el número de páginas esperado.");
  }
  const document = await PDFDocument.create();
  for (const page of await document.copyPages(cover, cover.getPageIndices())) document.addPage(page);
  for (const page of await document.copyPages(template, template.getPageIndices())) document.addPage(page);
  document.setTitle(`Presentación SG-SST — ${input.empresa}`);
  document.setAuthor("SST Colombia · SADGI S.A.S.");
  document.setSubject("Presentación comercial con muestras ilustrativas de informes SG-SST y PESV.");
  return Buffer.from(await document.save());
}