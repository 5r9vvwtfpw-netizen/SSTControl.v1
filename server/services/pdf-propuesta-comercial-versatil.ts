import PDFDocument from "pdfkit";
import type { PropuestaComercialInput } from "@shared/propuesta-comercial";

const C = {
  green: "#123F2E",
  gold: "#D3AE3D",
  pale: "#F4F7F4",
  text: "#1D2924",
  muted: "#637069",
  border: "#D5DED8",
  white: "#FFFFFF",
};

const PROVIDER = {
  name: "SISTEMA AUTOMATIZADO DE GESTION INTEGRAL S.A.S.",
  nit: "902.036.337-4",
  city: "Medellín, Antioquia, Colombia",
  web: "sst.sagisas.co",
  email: "legal@sst-colombia.com",
  phone: "+57 300 522 0679",
};

const money = (amount: number) =>
  `$${Math.round(amount).toLocaleString("es-CO", { maximumFractionDigits: 0 })}`;

function formatDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("es-CO", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export async function generateVersatilePropuestaPdf(input: PropuestaComercialInput): Promise<Buffer> {
  const subtotal = input.conceptos.reduce((sum, item) => sum + item.cantidad * item.tarifa, 0);
  const iva = input.aplicaIva ? Math.round(subtotal * input.tarifaIva / 100) : 0;
  const total = subtotal + iva;
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 132, bottom: 58, left: 52, right: 52 },
    info: {
      Title: `Propuesta comercial — ${input.empresa}`,
      Author: PROVIDER.name,
      Subject: input.titulo,
    },
  });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  const header = () => {
    doc.save();
    doc.rect(0, 0, doc.page.width, 116).fill(C.green);
    doc.rect(0, 112, doc.page.width, 4).fill(C.gold);
    doc.font("Helvetica-Bold").fontSize(9).fillColor(C.gold)
      .text("SST-COLOMBIA  ·  PROPUESTA COMERCIAL", 52, 20, { width: doc.page.width - 104 });
    doc.font("Helvetica-Bold").fontSize(20).fillColor(C.white)
      .text(input.titulo, 52, 42, { width: doc.page.width - 104, height: 42, ellipsis: true });
    doc.font("Helvetica").fontSize(9).fillColor("#D9E9DF")
      .text(`Presentada a ${input.empresa}`, 52, 91, { width: doc.page.width - 104 });
    doc.restore();
  };

  const startPage = () => {
    doc.addPage();
    header();
    doc.y = 132;
    doc.x = 52;
  };

  const ensureSpace = (height: number) => {
    if (doc.y + height > doc.page.height - 58) startPage();
  };

  const sectionTitle = (title: string) => {
    ensureSpace(42);
    doc.x = 52;
    doc.moveDown(0.65);
    doc.font("Helvetica-Bold").fontSize(12).fillColor(C.green).text(title, { width: 491 });
    const ruleY = doc.y + 3;
    doc.moveTo(52, ruleY).lineTo(doc.page.width - 52, ruleY).strokeColor(C.gold).lineWidth(1).stroke();
    doc.y = ruleY + 10;
    doc.x = 52;
  };

  const paragraphs = (value: string, bullet = false) => {
    const entries = value.split("\n").map((line) => line.trim()).filter(Boolean);
    if (!entries.length) {
      doc.x = 52;
      doc.font("Helvetica").fontSize(9.5).fillColor(C.muted).text("No se especificaron.", { width: 491 });
      return;
    }
    for (const entry of entries) {
      doc.font("Helvetica").fontSize(9.5);
      const width = bullet ? 470 : 491;
      const height = doc.heightOfString(entry, { width, lineGap: 2 }) + 7;
      ensureSpace(height);
      doc.x = 52;
      doc.font("Helvetica").fontSize(9.5).fillColor(C.text)
        .text(bullet ? `•  ${entry}` : entry, { width: 491, lineGap: 2 });
      doc.moveDown(0.35);
    }
  };

  header();
  doc.y = 132;
  doc.x = 52;
  doc.font("Helvetica-Bold").fontSize(9).fillColor(C.green)
    .text(`PROPUESTA No. SST-${input.fechaEmision.replace(/-/g, "")}`, { width: 491 });
  doc.font("Helvetica").fontSize(9).fillColor(C.muted)
    .text(`Fecha: ${formatDate(input.fechaEmision)}  ·  Vigencia: ${input.vigenciaDias} días calendario`, { width: 491 });
  doc.moveDown(0.7);

  const clientHeight = 50 + (input.ciudad ? 15 : 0) + (input.destinatario ? 15 : 0);
  const clientY = doc.y;
  doc.roundedRect(52, clientY, 491, clientHeight, 6).fill(C.pale)
    .strokeColor(C.border).lineWidth(0.7).stroke();
  doc.font("Helvetica-Bold").fontSize(8).fillColor(C.muted).text("CLIENTE", 64, clientY + 10);
  doc.font("Helvetica-Bold").fontSize(10).fillColor(C.text).text(input.empresa, 64, clientY + 23, { width: 230 });
  doc.font("Helvetica-Bold").fontSize(8).fillColor(C.muted).text("NIT", 310, clientY + 10);
  doc.font("Helvetica").fontSize(9.5).fillColor(C.text).text(input.nit || "No indicado", 310, clientY + 23, { width: 215 });
  let clientDetailY = clientY + 43;
  if (input.ciudad) {
    doc.font("Helvetica-Bold").fontSize(8).fillColor(C.muted).text("CIUDAD", 64, clientDetailY);
    doc.font("Helvetica").fontSize(9).fillColor(C.text).text(input.ciudad, 130, clientDetailY, { width: 395 });
    clientDetailY += 15;
  }
  if (input.destinatario) {
    doc.font("Helvetica-Bold").fontSize(8).fillColor(C.muted).text("DIRIGIDO A", 64, clientDetailY);
    doc.font("Helvetica").fontSize(9).fillColor(C.text).text(input.destinatario, 130, clientDetailY, { width: 395 });
  }
  doc.y = clientY + clientHeight + 10;
  doc.x = 52;

  sectionTitle("Objeto de la propuesta");
  paragraphs(input.objeto);
  sectionTitle("Alcance del servicio");
  paragraphs(input.alcance, true);
  sectionTitle("Entregables");
  paragraphs(input.entregables, true);

  sectionTitle("Inversión");
  ensureSpace(65);
  const left = 52;
  const right = doc.page.width - 52;
  const tableWidth = right - left;
  const tableY = doc.y;
  doc.rect(left, tableY, tableWidth, 25).fill(C.green);
  doc.font("Helvetica-Bold").fontSize(8).fillColor(C.white)
    .text("CONCEPTO", left + 10, tableY + 8, { width: 245 })
    .text("PERIODICIDAD", left + 275, tableY + 8, { width: 92 })
    .text("VALOR", right - 128, tableY + 8, { width: 118, align: "right" });
  doc.y = tableY + 25;

  for (const [index, item] of input.conceptos.entries()) {
    const rowHeight = Math.max(34, doc.font("Helvetica").fontSize(9)
      .heightOfString(item.descripcion, { width: 245, lineGap: 1 }) + 16);
    ensureSpace(rowHeight + 30);
    const rowY = doc.y;
    doc.rect(left, rowY, tableWidth, rowHeight).fill(index % 2 === 0 ? C.pale : C.white)
      .strokeColor(C.border).lineWidth(0.35).stroke();
    doc.font("Helvetica").fontSize(9).fillColor(C.text)
      .text(item.descripcion, left + 10, rowY + 8, { width: 245 });
    doc.font("Helvetica").fontSize(8.5).fillColor(C.muted)
      .text(`${item.cantidad} × ${money(item.tarifa)}\n${item.periodicidad}`, left + 275, rowY + 6, { width: 92 });
    doc.font("Helvetica-Bold").fontSize(9).fillColor(C.text)
      .text(money(item.cantidad * item.tarifa), right - 128, rowY + 9, { width: 118, align: "right" });
    doc.y = rowY + rowHeight;
    doc.x = 52;
  }

  ensureSpace(105);
  const summaryX = right - 220;
  let summaryY = doc.y + 12;
  doc.font("Helvetica").fontSize(9.5).fillColor(C.text)
    .text("Subtotal", summaryX, summaryY, { width: 100 })
    .text(money(subtotal), right - 118, summaryY, { width: 108, align: "right" });
  summaryY += 19;
  if (input.aplicaIva) {
    doc.text(`IVA (${input.tarifaIva}%)`, summaryX, summaryY, { width: 100 })
      .text(money(iva), right - 118, summaryY, { width: 108, align: "right" });
    summaryY += 21;
  } else {
    doc.fontSize(8).fillColor(C.muted)
      .text("IVA no aplicado a esta propuesta.", summaryX, summaryY, { width: 220, align: "right" });
    summaryY += 21;
  }
  doc.roundedRect(summaryX, summaryY, 220, 34, 5).fill(C.green);
  doc.font("Helvetica-Bold").fontSize(10).fillColor(C.white)
    .text("TOTAL", summaryX + 12, summaryY + 11)
    .text(`${money(total)} COP`, summaryX + 100, summaryY + 10, { width: 108, align: "right" });
  doc.y = summaryY + 42;
  doc.x = 52;

  sectionTitle("Condiciones comerciales");
  paragraphs(input.condiciones, true);
  sectionTitle("Datos del proveedor");
  doc.font("Helvetica-Bold").fontSize(9).fillColor(C.green)
    .text(PROVIDER.name, { width: 491 });
  doc.font("Helvetica").fontSize(8.5).fillColor(C.muted)
    .text(`NIT ${PROVIDER.nit} · ${PROVIDER.city}\n${PROVIDER.web} · ${PROVIDER.email} · ${PROVIDER.phone}`, {
      width: 491,
      lineGap: 2,
    });

  doc.end();
  return new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
}
