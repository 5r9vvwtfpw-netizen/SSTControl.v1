const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const outputPath = path.resolve(
  "documents/cotizacion-transicion-sst-pesv-transportes-limicio.pdf",
);
fs.mkdirSync(path.dirname(outputPath), { recursive: true });

const doc = new PDFDocument({
  size: "A4",
  margins: { top: 54, bottom: 54, left: 54, right: 54 },
  info: {
    Title: "Cotización - Transición SST/PESV Transportes Limicio",
    Author: "SADGI S.A.S. - SST Colombia",
    Subject: "Capacitación virtual y habilitación de nueva responsable SST/PESV",
  },
});

const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

const COLORS = {
  green: "#123F2E",
  green2: "#1B6847",
  gold: "#D3AE3D",
  mint: "#DCEFE2",
  pale: "#F4F7F4",
  text: "#1D2924",
  muted: "#637069",
  border: "#D5DED8",
  white: "#FFFFFF",
  warning: "#FFF7E3",
  warningBorder: "#D8B34B",
};

const money = (amount) =>
  `$${amount.toLocaleString("es-CO", { maximumFractionDigits: 0 })}`;

function header(title, subtitle) {
  doc.rect(0, 0, doc.page.width, 144).fill(COLORS.green);
  doc.roundedRect(54, 25, 175, 25, 12).fill(COLORS.gold);
  doc.font("Helvetica-Bold").fontSize(10).fillColor(COLORS.green)
    .text("SST COLOMBIA", 72, 33, { width: 140, align: "center" });
  doc.font("Helvetica-Bold").fontSize(23).fillColor(COLORS.white)
    .text(title, 54, 68, { width: 487, align: "center" });
  doc.font("Helvetica").fontSize(10).fillColor("#D9E9DF")
    .text(subtitle, 54, 106, { width: 487, align: "center" });
  doc.rect(0, 140, doc.page.width, 5).fill(COLORS.gold);
}

function footer() {
  const y = doc.page.height - 66;
  doc.moveTo(54, y - 10).lineTo(doc.page.width - 54, y - 10)
    .strokeColor(COLORS.border).lineWidth(0.7).stroke();
  doc.font("Helvetica").fontSize(8).fillColor(COLORS.muted)
    .text("SADGI S.A.S. · NIT 902.036.337-4 · Medellín, Colombia", 54, y, {
      width: 300,
    });
  doc.text("admin@sst-colombia.com · 311 555 2054", 300, y, {
    width: 258,
    align: "right",
  });
}

function sectionTitle(text, y) {
  doc.font("Helvetica-Bold").fontSize(13).fillColor(COLORS.green)
    .text(text, 54, y);
  doc.moveTo(54, y + 19).lineTo(541, y + 19)
    .strokeColor(COLORS.gold).lineWidth(1.2).stroke();
}

function bullet(text, x, y, width, size = 10) {
  doc.circle(x + 3, y + 6, 2.2).fill(COLORS.green2);
  doc.font("Helvetica").fontSize(size).fillColor(COLORS.text)
    .text(text, x + 13, y, { width, lineGap: 2 });
}

function labelValue(label, value, x, y, width) {
  doc.font("Helvetica-Bold").fontSize(9).fillColor(COLORS.muted)
    .text(label.toUpperCase(), x, y, { width });
  doc.font("Helvetica").fontSize(10.5).fillColor(COLORS.text)
    .text(value, x, y + 14, { width });
}

header(
  "Cotización de transición SST y PESV",
  "Capacitación virtual y habilitación operativa para TRANSPORTES LIMICIO LTDA",
);

doc.font("Helvetica-Bold").fontSize(11).fillColor(COLORS.green)
  .text("COTIZACIÓN No. COT-2026-0908-01", 54, 171);
doc.font("Helvetica").fontSize(9).fillColor(COLORS.muted)
  .text("Fecha de emisión: 8 de septiembre de 2026", 54, 188);

doc.roundedRect(54, 220, 487, 76, 8).fill(COLORS.pale)
  .strokeColor(COLORS.border).lineWidth(0.7).stroke();
labelValue("Cliente", "TRANSPORTES LIMICIO LTDA", 70, 237, 220);
labelValue("Servicio", "Transición de responsable externa SST/PESV", 310, 237, 215);
labelValue("Modalidad", "Virtual · individual · una empresa", 70, 272, 220);
labelValue("Vigencia", "15 días calendario", 310, 272, 215);

sectionTitle("Objeto de la propuesta", 324);
doc.font("Helvetica").fontSize(10.5).fillColor(COLORS.text)
  .text(
    "Capacitar y habilitar a la nueva responsable externa que continuará la gestión SST y PESV de TRANSPORTES LIMICIO LTDA dentro de la infraestructura digital de SST Colombia, utilizando la suscripción que la empresa ya tiene activa.",
    54,
    350,
    { width: 487, lineGap: 4 },
  );

sectionTitle("Alcance de la capacitación", 414);
bullet("Capacitación virtual individual de hasta 8 horas, dividida en 4 sesiones de 2 horas diarias.", 60, 442, 460);
bullet("Portal de la Empresa: usuarios, actividades, documentos, cronogramas y seguimiento.", 60, 466, 460);
bullet("Portal LSO: estándares SST, evidencias, actividades pendientes, avances e informes.", 60, 490, 460);
bullet("Portal de Empleados: inducciones, capacitaciones, evaluaciones y confirmaciones.", 60, 514, 460);
bullet("Ejercicio práctico utilizando la información de TRANSPORTES LIMICIO LTDA.", 60, 538, 460);
bullet("Una sesión virtual de seguimiento de hasta 30 minutos dentro de los 7 días siguientes.", 60, 562, 460);

doc.addPage();
header(
  "Propuesta económica",
  "Transferencia operativa para la continuidad del programa de gestión",
);

sectionTitle("Inversión", 174);
const tableX = 54;
const tableY = 204;
const tableW = 487;
const rowH = 34;
doc.roundedRect(tableX, tableY, tableW, 34).fill(COLORS.green);
doc.font("Helvetica-Bold").fontSize(9).fillColor(COLORS.white)
  .text("CONCEPTO", tableX + 14, tableY + 12)
  .text("VALOR", tableX + 385, tableY + 12, { width: 88, align: "right" });
doc.rect(tableX, tableY + rowH, tableW, 48).fill(COLORS.pale)
  .strokeColor(COLORS.border).lineWidth(0.7).stroke();
doc.font("Helvetica").fontSize(10).fillColor(COLORS.text)
  .text("Capacitación virtual de transición SST/PESV y habilitación operativa (8 horas)", tableX + 14, tableY + 50, {
    width: 350,
  })
  .text(money(1200000), tableX + 385, tableY + 50, { width: 88, align: "right" });
doc.font("Helvetica").fontSize(10).fillColor(COLORS.text)
  .text("Subtotal", tableX + 280, tableY + 78, { width: 155, align: "right" })
  .text(money(1200000), tableX + 385, tableY + 78, { width: 88, align: "right" });
doc.text("IVA 19%", tableX + 280, tableY + 98, { width: 155, align: "right" })
  .text(money(228000), tableX + 385, tableY + 98, { width: 88, align: "right" });
doc.roundedRect(tableX + 270, tableY + 126, 217, 39, 6).fill(COLORS.gold);
doc.font("Helvetica-Bold").fontSize(12).fillColor(COLORS.green)
  .text("TOTAL", tableX + 284, tableY + 139)
  .text(money(1428000), tableX + 385, tableY + 139, { width: 88, align: "right" });

sectionTitle("Incluye", 393);
bullet("Acceso habilitado únicamente para la operación de TRANSPORTES LIMICIO LTDA.", 60, 421, 460);
bullet("No incluye una licencia nueva ni una mensualidad adicional para la consultora.", 60, 445, 460);
bullet("Los valores están expresados en pesos colombianos. El IVA se presenta al 19%, si aplica.", 60, 469, 460);

doc.roundedRect(54, 510, 487, 132, 8).fill(COLORS.warning)
  .strokeColor(COLORS.warningBorder).lineWidth(1).stroke();
doc.font("Helvetica-Bold").fontSize(11).fillColor(COLORS.green)
  .text("Precisión importante", 70, 528);
doc.font("Helvetica").fontSize(9.5).fillColor(COLORS.text)
  .text(
    "Esta capacitación se limita al uso de la plataforma y a la transferencia operativa del estado del programa de TRANSPORTES LIMICIO LTDA. No sustituye los requisitos profesionales, académicos, de experiencia o de licencia que puedan resultar exigibles para asumir formalmente funciones de SST o PESV. La empresa contratante debe verificar, antes de habilitarla, que el perfil de la nueva responsable sea adecuado y que cuente con las autorizaciones o licencias aplicables.",
    70,
    552,
    { width: 455, lineGap: 3.5 },
  );

doc.font("Helvetica-Bold").fontSize(10).fillColor(COLORS.green)
  .text("Aceptación de la propuesta", 54, 680);
doc.font("Helvetica").fontSize(9.5).fillColor(COLORS.text)
  .text(
    "La aceptación podrá confirmarse por escrito para coordinar la agenda de las sesiones virtuales y la habilitación del usuario.",
    54,
    699,
    { width: 487 },
  );

footer();

doc.end();

stream.on("finish", () => {
  console.log(`PDF creado: ${outputPath}`);
});