import PDFDocument from "pdfkit";
import { writeFile } from "node:fs/promises";

const outputPath = "attached_assets/SST-Colombia-Propuesta-Comercial-LOS-PICAS-sin-calculo.pdf";

const C = {
  greenDark: "#1a3d2b",
  greenMid: "#1e7e34",
  greenLight: "#f0f7f2",
  gold: "#c9a84c",
  white: "#ffffff",
  grayText: "#444444",
  black: "#111111",
};

const page = {
  width: 612,
  height: 792,
  margin: 44,
};

const money = (value: string) => value;

function sectionHeading(doc: PDFKit.PDFDocument, title: string, y: number) {
  doc.fontSize(10).font("Helvetica-Bold").fillColor(C.greenDark).text(title, page.margin, y);
  doc
    .moveTo(page.margin, y + 14)
    .lineTo(page.width - page.margin, y + 14)
    .strokeColor(C.greenDark)
    .lineWidth(1)
    .stroke();
}

function drawBullet(doc: PDFKit.PDFDocument, text: string, y: number) {
  doc.circle(page.margin + 4, y + 4, 2.2).fill(C.greenMid);
  doc.fontSize(8.5).font("Helvetica").fillColor(C.grayText).text(text, page.margin + 12, y, {
    width: page.width - page.margin * 2 - 12,
  });
}

async function createStandaloneProposal() {
  const doc = new PDFDocument({
    size: "LETTER",
    margin: 0,
    info: {
      Title: "Propuesta Comercial — LOS PICAS S.A.S",
      Author: "SISTEMA AUTOMATIZADO DE GESTION INTEGRAL S.A.S",
      Subject: "Sistema Inteligente de Gestión SG-SST",
    },
  });

  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  // Encabezado.
  doc.rect(0, 0, page.width, 140).fill(C.greenDark);
  doc
    .fontSize(8)
    .font("Helvetica")
    .fillColor("#b8c8be")
    .text("PROPUESTA COMERCIAL · SG-SST AUTOMATIZADO", 0, 18, { width: page.width, align: "center" });
  doc
    .fontSize(10)
    .font("Helvetica")
    .fillColor(C.white)
    .text("Presentada a:", 0, 42, { width: page.width, align: "center" });
  doc
    .fontSize(24)
    .font("Helvetica-Bold")
    .fillColor(C.gold)
    .text("LOS PICAS S.A.S", 0, 58, { width: page.width, align: "center" });
  doc
    .fontSize(9)
    .font("Helvetica")
    .fillColor("#b8c8be")
    .text("NIT 9 0 0 8 0 9 3 4 6 - 1", 0, 99, { width: page.width, align: "center" });
  doc
    .fontSize(8)
    .fillColor("#b8c8be")
    .text("Fecha: 22 de septiembre de 2026", 0, 122, { width: page.width, align: "center" });
  doc.rect(0, 140, page.width, 4).fill(C.gold);

  // Contexto y alcance.
  const introY = 160;
  const introHeight = 200;
  doc.rect(page.margin, introY, page.width - page.margin * 2, introHeight).fill(C.greenLight);
  doc.rect(page.margin, introY, 4, introHeight).fill(C.gold);
  doc
    .fontSize(8)
    .font("Helvetica")
    .fillColor(C.grayText)
    .text(
      "La propuesta comprende dos componentes: la plataforma SaaS (Sadgi SAS) y el servicio de auditoría y gestión por parte del profesional en SST. Operamos bajo un modelo de colaboración sin exclusividad.",
      page.margin + 14,
      introY + 12,
      { width: page.width - page.margin * 2 - 28, lineGap: 2 },
    );
  doc
    .fontSize(8)
    .text("Lo que incluye la propuesta.", page.margin + 14, introY + 58);

  const includedServices = [
    "Actualización documental y legal",
    "Ejecución del Plan de Trabajo Anual",
    "Medición y análisis de indicadores",
    "Investigación de incidentes y accidentes",
    "Gestión y asesoría a Comités",
    "Preparación para emergencias",
    "Activación de protocolos de contingencia",
    "Auditorías y mejora continua",
    "Sistematización de procesos",
  ];
  let serviceY = introY + 84;
  for (const service of includedServices) {
    doc.text(service, page.margin + 14, serviceY);
    serviceY += 13;
  }

  // Resumen de inversión sin multiplicar la tarifa por el número de trabajadores.
  sectionHeading(doc, "RESUMEN DE INVERSIÓN MENSUAL", 374);
  const tableX = page.margin;
  const tableWidth = page.width - page.margin * 2;
  const conceptWidth = 194;
  const detailWidth = 220;
  const valueWidth = tableWidth - conceptWidth - detailWidth;
  const detailX = tableX + conceptWidth;
  const valueX = tableX + conceptWidth + detailWidth;
  let tableY = 408;

  doc.rect(tableX, tableY, tableWidth, 22).fill(C.greenDark);
  doc.fontSize(8).font("Helvetica-Bold").fillColor(C.white);
  doc.text("Concepto", tableX + 6, tableY + 7, { width: conceptWidth });
  doc.text("Detalle", detailX + 6, tableY + 7, { width: detailWidth });
  doc.text("Valor Mensual", valueX, tableY + 7, { width: valueWidth, align: "right" });
  tableY += 22;

  const rows = [
    {
      concept: "Licencia de Software SG-SST",
      detail: "Tarifa por trabajador activo",
      value: money("$8.000 por trabajador"),
      color: C.greenDark,
    },
    {
      concept: "Auditoría y Administración",
      detail: "Mensualidad profesional · Johana Casarrubia",
      value: money("$700.000"),
      color: C.gold,
    },
  ];

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const rowHeight = 52;
    doc.rect(tableX, tableY, tableWidth, rowHeight).fill(index % 2 === 0 ? "#f8fdf9" : C.white);
    doc.rect(tableX, tableY, 5, rowHeight).fill(row.color);
    doc.fontSize(9).font("Helvetica-Bold").fillColor(C.black).text(row.concept, tableX + 12, tableY + 10, {
      width: conceptWidth - 14,
    });
    doc.fontSize(8).font("Helvetica").fillColor(C.grayText).text(row.detail, detailX + 6, tableY + 14, {
      width: detailWidth - 8,
    });
    doc.fontSize(index === 0 ? 10 : 12).font("Helvetica-Bold").fillColor(row.color).text(row.value, valueX, tableY + 15, {
      width: valueWidth,
      align: "right",
    });
    doc
      .moveTo(tableX, tableY + rowHeight)
      .lineTo(tableX + tableWidth, tableY + rowHeight)
      .strokeColor("#e0e0e0")
      .lineWidth(0.5)
      .stroke();
    tableY += rowHeight;
  }

  doc.rect(tableX, tableY, tableWidth, 46).fill(C.greenDark);
  doc.fontSize(11).font("Helvetica-Bold").fillColor(C.white).text("INVERSIÓN MENSUAL", tableX + 12, tableY + 15, {
    width: conceptWidth + detailWidth,
  });
  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .fillColor(C.gold)
    .text("$8.000 / trabajador + $700.000 COP", valueX - 22, tableY + 16, {
      width: valueWidth + 22,
      align: "right",
    });

  // Condiciones de pago y paquete incluido.
  sectionHeading(doc, "ESTRUCTURA DE PAGO", 594);
  doc.fontSize(10).font("Helvetica-Bold").fillColor(C.greenDark).text("PAQUETE COMPLETO SST", page.margin, 618);
  doc
    .fontSize(9)
    .font("Helvetica-Bold")
    .fillColor(C.grayText)
    .text("Forma de pago: Suscripción mensual por adelantado", page.margin, 636);

  let bulletY = 658;
  for (const item of [
    "Licencia software: $8.000 por trabajador",
    "Portal empleados incluido",
    "Soporte técnico 24/7",
    "Auditoría y Administración: paquete completo",
  ]) {
    drawBullet(doc, item, bulletY);
    bulletY += 14;
  }

  // Pie.
  doc.rect(0, page.height - 28, page.width, 28).fill(C.greenDark);
  doc.rect(0, page.height - 28, page.width, 3).fill(C.gold);
  doc
    .fontSize(7.5)
    .font("Helvetica")
    .fillColor(C.gold)
    .text(
      "SISTEMA AUTOMATIZADO DE GESTION INTEGRAL S.A.S · NIT 902.036.337-4 · sst.sagisas.co · +57 300 522 0679",
      0,
      page.height - 17,
      { width: page.width, align: "center" },
    );

  doc.end();
  await new Promise<void>((resolve) => doc.on("end", resolve));
  await writeFile(outputPath, Buffer.concat(chunks));
  console.log(`Created ${outputPath}`);
}

createStandaloneProposal().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});