import PDFDocument from "pdfkit";
import fs from "node:fs";
import path from "node:path";

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
    Subject: "Capacitación para reemplazo del Profesional en SST",
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
  "Capacitación para reemplazar al Profesional en SST",
);

doc.font("Helvetica-Bold").fontSize(11).fillColor(COLORS.green)
  .text("COTIZACIÓN No. COT-2026-0908-01", 54, 171);
doc.font("Helvetica").fontSize(9).fillColor(COLORS.muted)
  .text("Fecha de emisión: 8 de septiembre de 2026", 54, 188);

doc.roundedRect(54, 220, 487, 96, 8).fill(COLORS.pale)
  .strokeColor(COLORS.border).lineWidth(0.7).stroke();
labelValue("Cliente", "TRANSPORTES LIMICIO LTDA", 70, 237, 220);
labelValue("Servicio", "Reemplazo operativo del Profesional en SST", 310, 237, 205);
labelValue("Modalidad", "Virtual · individual · una empresa", 70, 291, 220);
labelValue("Vigencia", "15 días calendario", 310, 291, 205);

sectionTitle("Objeto de la propuesta", 338);
doc.font("Helvetica").fontSize(10.5).fillColor(COLORS.text)
  .text(
    "Capacitar y habilitar al equipo designado por TRANSPORTES LIMICIO LTDA para reemplazar al Profesional en SST y continuar directamente la gestión SST y PESV dentro de la infraestructura digital de SST Colombia, utilizando la suscripción que la empresa ya tiene activa.",
    54,
    364,
    { width: 487, lineGap: 4 },
  );

sectionTitle("Alcance de la capacitación", 444);
bullet("Mínimo requerido para enseñar los tres portales: 8 horas, divididas en 4 sesiones de 2 horas diarias.", 60, 472, 460);
bullet("Transferencia operativa para que TRANSPORTES LIMICIO LTDA reemplace al Profesional en SST.", 60, 496, 460);
bullet("Portal de la Empresa: usuarios, actividades, documentos, cronogramas y seguimiento.", 60, 520, 460);
bullet("Portal de gestión SST: estándares, evidencias, actividades pendientes, avances e informes.", 60, 544, 460);
bullet("Portal de Empleados: inducciones, capacitaciones, evaluaciones y confirmaciones.", 60, 568, 460);
bullet("Ejercicio práctico utilizando la información de TRANSPORTES LIMICIO LTDA.", 60, 592, 460);
bullet("Una sesión virtual de seguimiento de hasta 30 minutos dentro de los 7 días siguientes.", 60, 616, 460);

doc.addPage();
header(
  "Propuesta económica",
  "Transferencia operativa para la continuidad del programa de gestión",
);

sectionTitle("Inversión", 174);
const hourlyRate = 50000;
const trainingHours = 8;
const subtotal = hourlyRate * trainingHours;
const iva = Math.round(subtotal * 0.19);
const total = subtotal + iva;
const tableX = 54;
const tableY = 204;
const tableW = 487;
const rowH = 34;
const amountX = tableX + 376;
const amountW = 93;
doc.roundedRect(tableX, tableY, tableW, 34).fill(COLORS.green);
doc.font("Helvetica-Bold").fontSize(9).fillColor(COLORS.white)
  .text("CONCEPTO", tableX + 14, tableY + 12)
  .text("VALOR", amountX, tableY + 12, { width: amountW, align: "right" });
doc.rect(tableX, tableY + rowH, tableW, 64).fill(COLORS.pale)
  .strokeColor(COLORS.border).lineWidth(0.7).stroke();
doc.font("Helvetica").fontSize(10).fillColor(COLORS.text)
  .text("Capacitación virtual para enseñar los tres portales y reemplazar al Profesional en SST (mínimo 8 horas)", tableX + 14, tableY + 50, {
    width: 345,
  })
  .text(money(subtotal), amountX, tableY + 50, { width: amountW, align: "right" });
doc.font("Helvetica").fontSize(10).fillColor(COLORS.text)
  .text("Subtotal", tableX + 275, tableY + 108, { width: 95, align: "right" })
  .text(money(subtotal), amountX, tableY + 108, { width: amountW, align: "right" });
doc.text("IVA 19%", tableX + 275, tableY + 136, { width: 95, align: "right" })
  .text(money(iva), amountX, tableY + 136, { width: amountW, align: "right" });
doc.roundedRect(tableX + 270, tableY + 166, 217, 42, 6).fill(COLORS.gold);
doc.font("Helvetica-Bold").fontSize(12).fillColor(COLORS.green)
  .text("TOTAL", tableX + 284, tableY + 181)
  .text(money(total), amountX, tableY + 181, { width: amountW, align: "right" });

sectionTitle("Incluye", 458);
bullet("Acceso habilitado únicamente para la operación de TRANSPORTES LIMICIO LTDA.", 60, 486, 460);
bullet("No incluye una licencia nueva ni una mensualidad adicional para la consultora.", 60, 510, 460);

doc.roundedRect(54, 575, 487, 122, 8).fill(COLORS.warning)
  .strokeColor(COLORS.warningBorder).lineWidth(1).stroke();
doc.font("Helvetica-Bold").fontSize(11).fillColor(COLORS.green)
  .text("Precisión importante", 70, 593);
doc.font("Helvetica").fontSize(9.5).fillColor(COLORS.text)
  .text(
    "Esta capacitación se limita al uso de la plataforma y a la transferencia operativa del estado del programa de TRANSPORTES LIMICIO LTDA. No sustituye los requisitos profesionales, académicos, de experiencia o de licencia que puedan resultar exigibles para asumir formalmente funciones de SST o PESV. La empresa contratante debe verificar, antes de habilitarla, que el perfil de la nueva responsable sea adecuado y que cuente con las autorizaciones o licencias aplicables.",
    70,
    617,
    { width: 455, lineGap: 3.5 },
  );

doc.font("Helvetica-Bold").fontSize(10).fillColor(COLORS.green)
  .text("Aceptación de la propuesta", 54, 708);
doc.font("Helvetica").fontSize(9.5).fillColor(COLORS.text)
  .text(
    "El pago se realiza por adelantado. Una vez confirmado el pago, se enviará la agenda con la distribución mínima de 8 horas: 4 sesiones virtuales de 2 horas diarias para enseñar los tres portales y coordinar la habilitación del usuario.",
    54,
    727,
    { width: 487 },
  );

footer();

doc.end();

stream.on("finish", () => {
  console.log(`PDF creado: ${outputPath}`);
});