import PDFDocument from "pdfkit";

const INK = "#172B36";
const GREEN = "#17613B";
const MUTED = "#52616B";
const RULE = "#D8E1DE";
const LIGHT = "#F4F8F6";
const LEFT = 54;
const RIGHT = 54;
const WIDTH = 612 - LEFT - RIGHT;
const TOP = 88;
const BOTTOM = 722;

export interface ContractPdfSnapshot {
  companyName: string;
  companyNit: string;
  contractVersion: string;
  signerName: string;
  signerId: string;
  capacity: "legal_representative" | "attorney";
  signedAt: Date;
  signingMethod?: "email_otp" | "admin_upload";
  signedByName?: string;
  signedByUserId?: string;
  challengeId?: string;
  ip: string;
  userAgent: string;
  sourceSha256: string;
  signatureImage: Buffer;
  testOnly?: boolean;
  readingCopy?: boolean;
  originalPdfSha256?: string;
}

type Block = { kind: "paragraph" | "bullet" | "row"; text: string };
type Section = { title: string; blocks: Block[] };

function plainText(fragment: string): string {
  return fragment
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_match, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_match, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/\s+/g, " ")
    .trim();
}

function parseSections(html: string): Section[] {
  const sections: Section[] = [];
  for (const match of html.matchAll(/<section\b[^>]*>([\s\S]*?)<\/section>/gi)) {
    const body = match[1];
    const heading = body.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/i);
    if (!heading) continue;
    const blocks: Block[] = [];
    const content = body.slice((heading.index || 0) + heading[0].length);
    for (const part of content.matchAll(/<(p|li|tr)\b[^>]*>[\s\S]*?<\/\1>/gi)) {
      const kind = part[1].toLowerCase();
      if (kind === "tr") {
        const cells = Array.from(part[0].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi), cell => plainText(cell[1]));
        if (cells.length) blocks.push({ kind: "row", text: cells.join("  —  ") });
      } else {
        const text = plainText(part[0]);
        if (text) blocks.push({ kind: kind === "li" ? "bullet" : "paragraph", text });
      }
    }
    sections.push({ title: plainText(heading[1]), blocks });
  }
  if (sections.length < 17 || sections[0].title !== "1. Partes del Contrato" || sections.at(-1)?.title !== "17. Contacto") {
    throw new Error("El contrato fuente está incompleto y no puede firmarse");
  }
  return sections;
}

function drawFrame(doc: PDFKit.PDFDocument, readingCopy = false) {
  doc.fillColor(GREEN).rect(LEFT, 34, 24, 3).fill();
  doc.font("Helvetica-Bold").fontSize(8.5).fillColor(INK).text("SST COLOMBIA", LEFT + 33, 30, { lineBreak: false });
  doc.font("Helvetica").fontSize(7.5).fillColor(MUTED)
    .text(readingCopy ? "COPIA DE LECTURA" : "DOCUMENTO CONTRACTUAL", 360, 31, { width: 198, align: "right", lineBreak: false });
  doc.strokeColor(RULE).lineWidth(0.7).moveTo(LEFT, 52).lineTo(612 - RIGHT, 52).stroke();
}

class ContractLayout {
  y = TOP;
  constructor(readonly doc: PDFKit.PDFDocument, readonly readingCopy = false) {
    drawFrame(doc, readingCopy);
  }

  space(height: number) {
    if (this.y + height <= BOTTOM) return;
    this.doc.addPage();
    drawFrame(this.doc, this.readingCopy);
    this.y = TOP;
  }

  text(value: string, options: { size?: number; bold?: boolean; color?: string; indent?: number; gap?: number; lineGap?: number } = {}) {
    const { size = 10, bold = false, color = INK, indent = 0, gap = 9, lineGap = 3 } = options;
    const x = LEFT + indent;
    const width = WIDTH - indent;
    this.doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(size);
    const height = this.doc.heightOfString(value, { width, lineGap });
    this.space(height + gap);
    this.doc.fillColor(color).text(value, x, this.y, { width, lineGap });
    this.y += height + gap;
  }

  section(title: string) {
    this.space(72);
    this.y += 11;
    this.doc.strokeColor(RULE).lineWidth(0.6).moveTo(LEFT, this.y).lineTo(LEFT + WIDTH, this.y).stroke();
    this.y += 12;
    this.text(title, { size: 11.5, bold: true, color: GREEN, gap: 12, lineGap: 2 });
  }

  bullet(value: string) {
    this.doc.font("Helvetica").fontSize(10);
    const height = this.doc.heightOfString(value, { width: WIDTH - 28, lineGap: 3 });
    this.space(height + 6);
    this.doc.fillColor(GREEN).circle(LEFT + 9, this.y + 6, 1.8).fill();
    this.doc.fillColor(INK).text(value, LEFT + 22, this.y, { width: WIDTH - 28, lineGap: 3 });
    this.y += height + 6;
  }

  partyHeading(value: string) {
    this.space(31);
    this.doc.fillColor(LIGHT).roundedRect(LEFT, this.y, WIDTH, 27, 3).fill();
    this.doc.font("Helvetica-Bold").fontSize(9.5).fillColor(GREEN)
      .text(value, LEFT + 12, this.y + 8, { width: WIDTH - 24, lineBreak: false });
    this.y += 34;
  }

  partyField(value: string) {
    const colon = value.indexOf(":");
    if (colon < 0) return this.text(value);
    const label = value.slice(0, colon + 1);
    const detail = value.slice(colon + 1).trim();
    const fieldWidth = WIDTH - 155;
    this.doc.font("Helvetica").fontSize(9.8);
    const height = Math.max(18, this.doc.heightOfString(detail, { width: fieldWidth, lineGap: 2 }) + 6);
    this.space(height);
    this.doc.font("Helvetica-Bold").fontSize(9).fillColor(MUTED)
      .text(label, LEFT + 12, this.y + 2, { width: 135 });
    this.doc.font("Helvetica").fontSize(9.8).fillColor(INK)
      .text(detail, LEFT + 155, this.y + 2, { width: fieldWidth, lineGap: 2 });
    this.y += height;
  }

  row(value: string, index: number) {
    this.doc.font("Helvetica").fontSize(9);
    const height = this.doc.heightOfString(value, { width: WIDTH - 24, lineGap: 2 }) + 12;
    this.space(height + 2);
    if (index % 2 === 0) this.doc.fillColor(LIGHT).rect(LEFT, this.y, WIDTH, height).fill();
    this.doc.fillColor(INK).text(value, LEFT + 12, this.y + 6, { width: WIDTH - 24, lineGap: 2 });
    this.y += height + 2;
  }
}

function drawCoverHeading(layout: ContractLayout, snapshot: ContractPdfSnapshot, effectiveDate: string) {
  const { doc } = layout;
  doc.font("Helvetica-Bold").fontSize(19).fillColor(GREEN)
    .text("Contrato de prestación de servicios", LEFT, layout.y, { width: WIDTH, lineGap: 2 });
  layout.y = doc.y + 4;
  doc.font("Helvetica").fontSize(12).fillColor(INK)
    .text("Software como Servicio (SaaS)", LEFT, layout.y, { width: WIDTH });
  layout.y = doc.y + 17;
  doc.fillColor(LIGHT).rect(LEFT, layout.y, WIDTH, 48).fill();
  doc.font("Helvetica-Bold").fontSize(8).fillColor(MUTED)
    .text("VERSIÓN", LEFT + 15, layout.y + 10);
  doc.font("Helvetica").fontSize(10).fillColor(INK)
    .text(snapshot.contractVersion, LEFT + 15, layout.y + 23);
  if (effectiveDate) {
    doc.font("Helvetica-Bold").fontSize(8).fillColor(MUTED)
      .text("VIGENCIA", LEFT + 170, layout.y + 10);
    doc.font("Helvetica").fontSize(10).fillColor(INK)
      .text(effectiveDate, LEFT + 170, layout.y + 23);
  }
  layout.y += 62;
  if (snapshot.readingCopy) {
    layout.text(
      "COPIA DE LECTURA. Documento remaquetado a partir del texto archivado; no reemplaza el PDF firmado original.",
      { size: 8.5, bold: true, color: MUTED, gap: 10 },
    );
  }
  if (snapshot.testOnly) {
    layout.text("PRUEBA FUNCIONAL — SIN EFECTO CONTRACTUAL", { bold: true, size: 10, color: "#A52828", gap: 8 });
  }
}

function drawSignaturePage(layout: ContractLayout, snapshot: ContractPdfSnapshot, signatureHash: string) {
  const { doc } = layout;
  doc.addPage();
  drawFrame(doc, layout.readingCopy);
  layout.y = TOP;
  layout.text(snapshot.readingCopy ? "Constancia de la copia de lectura" : "Constancia de firma electrónica", { size: 17, bold: true, color: GREEN, gap: 7 });
  layout.text(
    snapshot.readingCopy
      ? "Esta representación facilita la lectura. El PDF firmado original y su huella de integridad se conservan sin modificaciones y pueden descargarse por separado."
      : "Registro de aceptación del contrato indicado en las páginas anteriores.",
    { color: MUTED, gap: 13 },
  );
  if (snapshot.testOnly) layout.text("PRUEBA FUNCIONAL — SIN EFECTO CONTRACTUAL", { bold: true, color: "#A52828" });

  const adminUpload = snapshot.signingMethod === "admin_upload";
  const details: Array<[string, string]> = [
    ["Empresa", `${snapshot.companyName} — NIT ${snapshot.companyNit}`],
    ["Representante legal indicado", `${snapshot.signerName} — identificación ${snapshot.signerId}`],
    ["Calidad declarada", snapshot.capacity === "attorney" ? "Apoderado autorizado" : "Representante legal"],
    ["Fecha y hora (UTC)", snapshot.signedAt.toISOString()],
    ["Método", adminUpload
      ? "Imagen de firma aportada por el administrador de la cuenta para este contrato"
      : "Código de verificación de un solo uso enviado al correo registrado del firmante"],
    ...(adminUpload
      ? [
          ["Acción realizada por", `${snapshot.signedByName || "Administrador"} (usuario ${snapshot.signedByUserId || "no registrado"})`],
          ["Declaración", "El administrador declaró contar con autorización del representante legal para aceptar este contrato."],
        ] as Array<[string, string]>
      : [["Reto OTP", snapshot.challengeId || ""]] as Array<[string, string]>),
    ["Dirección IP", snapshot.ip],
    ["Agente de usuario", snapshot.userAgent],
  ];
  for (const [label, value] of details) {
    doc.font("Helvetica-Bold").fontSize(8.4);
    const labelHeight = doc.heightOfString(label.toUpperCase(), { width: 145, lineGap: 2 });
    doc.font("Helvetica").fontSize(9);
    const valueHeight = doc.heightOfString(value, { width: WIDTH - 160, lineGap: 2 });
    const height = Math.max(20, labelHeight + 10, valueHeight + 10);
    layout.space(height);
    doc.strokeColor(RULE).lineWidth(0.4).moveTo(LEFT, layout.y + height - 2).lineTo(LEFT + WIDTH, layout.y + height - 2).stroke();
    doc.font("Helvetica-Bold").fontSize(8.4).fillColor(MUTED)
      .text(label.toUpperCase(), LEFT, layout.y + 3, { width: 145, lineGap: 2 });
    doc.font("Helvetica").fontSize(9).fillColor(INK)
      .text(value, LEFT + 160, layout.y + 3, { width: WIDTH - 160, lineGap: 2 });
    layout.y += height;
  }

  layout.y += 12;
  layout.text("Firma aportada para este contrato", { size: 11, bold: true, color: GREEN, gap: 8 });
  layout.space(110);
  doc.strokeColor(RULE).roundedRect(LEFT, layout.y, 278, 100, 3).stroke();
  doc.image(snapshot.signatureImage, LEFT + 14, layout.y + 10, { fit: [250, 75] });
  layout.y += 113;
  layout.text(
    adminUpload
      ? "La constancia identifica la operación y la versión aceptada. La imagen aportada y la declaración del administrador no verifican externamente la identidad ni la autorización específica del representante legal."
      : "La constancia identifica el método electrónico y la versión del documento aceptada. La imagen adjunta y el código no constituyen una validación externa de la identidad o de las facultades del firmante.",
    { size: 8.5, color: MUTED, lineGap: 2, gap: 13 },
  );
  layout.text("Integridad documental", { size: 10, bold: true, color: GREEN, gap: 6 });
  layout.text(`SHA-256 del contrato presentado: ${snapshot.sourceSha256}`, { size: 8, color: MUTED, gap: 5 });
  if (snapshot.readingCopy && snapshot.originalPdfSha256) {
    layout.text(`SHA-256 del PDF firmado original: ${snapshot.originalPdfSha256}`, { size: 8, color: MUTED, gap: 5 });
  }
  layout.text(`SHA-256 de la imagen de firma: ${signatureHash}`, { size: 8, color: MUTED, gap: 0 });
}

export function renderSaasContractPdf(
  doc: PDFKit.PDFDocument,
  html: string,
  snapshot: ContractPdfSnapshot,
  signatureHash: string,
) {
  const sections = parseSections(html);
  const effectiveDate = plainText(html.match(/Fecha de vigencia:\s*([^<]+)/i)?.[1] || "");
  const layout = new ContractLayout(doc, snapshot.readingCopy);
  drawCoverHeading(layout, snapshot, effectiveDate);
  for (const section of sections) {
    layout.section(section.title);
    let row = 0;
    for (const block of section.blocks) {
      if (block.kind === "bullet") layout.bullet(block.text);
      else if (block.kind === "row") layout.row(block.text, row++);
      else if (section.title === "1. Partes del Contrato" && (block.text === "Proveedor:" || block.text === "Cliente:")) layout.partyHeading(block.text);
      else if (section.title === "1. Partes del Contrato" && block.text.includes(":")) layout.partyField(block.text);
      else layout.text(block.text);
    }
  }
  const copyright = plainText(html.match(/<p\b[^>]*>©[\s\S]*?<\/p>/i)?.[0] || "");
  if (copyright) layout.text(copyright, { size: 7.5, color: MUTED, gap: 0 });
  drawSignaturePage(layout, snapshot, signatureHash);

  const { start, count } = doc.bufferedPageRange();
  for (let page = start; page < start + count; page++) {
    doc.switchToPage(page);
    doc.strokeColor(RULE).lineWidth(0.7).moveTo(LEFT, 742).lineTo(LEFT + WIDTH, 742).stroke();
    doc.font("Helvetica").fontSize(8).fillColor(MUTED)
      .text(`SST Colombia  •  ${snapshot.readingCopy ? "Copia de lectura" : "Contrato SaaS"}  •  Versión ${snapshot.contractVersion}`, LEFT, 753, { lineBreak: false });
    doc.text(`Página ${page - start + 1} de ${count}`, 450, 753, { width: 108, align: "right", lineBreak: false });
  }
}