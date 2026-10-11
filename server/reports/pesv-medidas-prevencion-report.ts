import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import type { Company, PesvGpsExpense, SafeRoute, SstSpeedAlert, VehicleGpsTracking } from "@shared/schema";
import {
  addParagraph,
  addSectionBar,
  addSimpleTable,
  addStandardHeader,
  PDF_COLORS,
  checkPageBreak,
} from "../services/pdf-standardizer";
import { setupTrialWatermarkOnAllPages } from "../services/pdf-watermark";
import { objectStorageService } from "../objectStorage";

type Period = { from: string; to: string };
type CompanyForPdf = Company & { address?: string | null };

const dateText = (value: string | Date | null | undefined) => {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString("es-CO");
};
const evidenceText = (value: string | null | undefined) =>
  value?.startsWith("uploads/") ? "Soporte adjunto al registro PESV" : value || "Soporte no adjuntado";

async function addRepresentativeSignature(doc: typeof PDFDocument.prototype, company: CompanyForPdf, y: number) {
  const margin = 35;
  const boxHeight = 104;
  if (!company.legalRepSignatureUrl) throw new Error("No está configurada la firma del Representante Legal.");
  let signature: Buffer | null = null;
  if (company.legalRepSignatureUrl.startsWith("/uploads/") || company.legalRepSignatureUrl.startsWith("/objects/uploads/")) {
    const localPath = path.join(process.cwd(), "public", company.legalRepSignatureUrl.replace(/^\/objects/, ""));
    if (fs.existsSync(localPath)) signature = fs.readFileSync(localPath);
  }
  if (!signature) signature = await objectStorageService.getObjectBuffer(company.legalRepSignatureUrl);
  if (!signature) throw new Error("No fue posible cargar la firma registrada del Representante Legal.");
  let top = y + 16;
  if (top + boxHeight > doc.page.height - margin) {
    doc.addPage();
    top = margin + 20;
  }
  const width = doc.page.width - margin * 2;
  doc.lineWidth(1).strokeColor(PDF_COLORS.GREEN_PRIMARY).rect(margin, top, width, boxHeight).stroke();
  doc.fillColor(PDF_COLORS.GREEN_PRIMARY).font("Helvetica-Bold").fontSize(9)
    .text("FIRMA DEL REPRESENTANTE LEGAL", margin + 10, top + 8, { width: width - 20, align: "center" });
  const imageX = margin + 22;
  const detailsX = imageX + 130;
  doc.image(signature, imageX, top + 34, { fit: [115, 42], align: "center", valign: "center" });
  doc.fillColor(PDF_COLORS.BLACK).font("Helvetica-Bold").fontSize(9)
    .text(company.legalRepName || "—", detailsX, top + 38, { width: width - detailsX + margin - 10 });
  doc.font("Helvetica").fontSize(8)
    .text(`Identificación: ${company.legalRepId || "—"}\nRepresentante Legal`, detailsX, top + 53, {
      width: width - detailsX + margin - 10,
    });
}

export async function buildMedidasPrevencionPdfBuffer(
  company: CompanyForPdf,
  routes: SafeRoute[],
  expenses: PesvGpsExpense[],
  tracking: VehicleGpsTracking[],
  speedAlerts: SstSpeedAlert[],
  period: Period,
  watermark = false,
): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 35, size: "LETTER", bufferPages: true });
  setupTrialWatermarkOnAllPages(doc, watermark);
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  let y = await addStandardHeader({
    doc,
    company,
    documentTitle: "Certificación trimestral de medidas para prevenir la accidentalidad vial",
    documentCode: "PESV-INFO-TRI-04",
  });
  y = addParagraph(doc, `Período certificado: ${dateText(period.from)} al ${dateText(period.to)}`, { y, bold: true });
  y = addParagraph(doc,
    `La empresa, por medio de su Representante Legal, certifica que revisó la información registrada para el período indicado y las medidas de prevención allí relacionadas para contribuir a reducir la accidentalidad vial. La vigencia de las medidas de H08 se toma del estado activo y de la fecha de implementación guardados en el sistema. Se incluyen señalización, puestos de control, gestión de rutas, monitoreo GPS, alertas de velocidad y gastos registrados.`,
    { y });

  y = checkPageBreak(doc, 110, y);
  y = addSectionBar(doc, "Medidas de rutas, señalización y puestos de control — H08", y);
  const routeRows = routes.map((route) => [
    route.routeName,
    [
      ...(route.criticalPoints ? [`Puntos críticos: ${route.criticalPoints}`] : []),
      ...(route.speedLimits ? [`Límites de velocidad: ${route.speedLimits}`] : []),
      ...(route.restrictions ? [`Restricciones: ${route.restrictions}`] : []),
      ...(route.signageImplemented === 1 ? [
        `Señalización: ${route.signageMeasures || "—"}`,
        `Fecha de implementación: ${dateText(route.signageImplementationDate)}`,
        `Responsable: ${route.signageResponsible || "—"}`,
      ] : []),
      ...(route.controlImplemented === 1 ? [
        `Puesto de control: ${route.controlPoints || "—"}`,
        `Frecuencia: ${route.controlFrequency || "—"}`,
        `Fecha de implementación: ${dateText(route.controlImplementationDate)}`,
        `Responsable del control: ${route.controlResponsible || "—"}`,
      ] : []),
    ].join("\n"),
    [
      ...(route.signageImplemented === 1 ? [`Señalización: ${evidenceText(route.signageEvidenceReference)}`] : []),
      ...(route.controlImplemented === 1 ? [`Control: ${evidenceText(route.controlEvidenceReference)}`] : []),
    ].join("\n"),
  ]);
  y = routeRows.length
    ? addSimpleTable(doc, ["Ruta", "Medidas reportadas", "Referencia de soportes"], routeRows, { y })
    : addParagraph(doc, "No hay medidas de señalización o puestos de control registrados para el trimestre.", { y });

  y = checkPageBreak(doc, 100, y);
  y = addSectionBar(doc, "Gastos de monitoreo GPS", y);
  const expenseRows = expenses.map((expense) => [
    dateText(expense.expenseDate),
    `${expense.provider}\n${expense.expenseType}: ${expense.concept}`,
    expense.coverage || "—",
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(expense.amountCop),
    evidenceText(expense.supportReference),
  ]);
  y = expenseRows.length
    ? addSimpleTable(doc, ["Fecha", "Proveedor y concepto", "Vehículos cubiertos", "Valor", "Soporte"], expenseRows, { y })
    : addParagraph(doc, "No hay gastos GPS registrados para el trimestre.", { y });

  const total = expenses.reduce((sum, row) => sum + row.amountCop, 0);
  y = addParagraph(doc, `Total de gastos GPS registrados: ${new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(total)}.`, { y, bold: true });
  y = checkPageBreak(doc, 100, y);
  y = addSectionBar(doc, "Operación GPS y alertas de velocidad — H07", y);
  const gpsExceeded = tracking.filter((row) => row.speedExceeded === 1).length;
  y = addParagraph(doc,
    `Registros de monitoreo GPS del período: ${tracking.length}. Registros con exceso de velocidad: ${gpsExceeded}. Alertas de velocidad registradas: ${speedAlerts.length}.`,
    { y, bold: true });
  const alertRows = speedAlerts.map((alert) => [
    dateText(alert.alertDate),
    `${alert.registeredSpeed} km/h`,
    `${alert.maxAllowedSpeed} km/h`,
    `${alert.severity} · ${alert.status}`,
    alert.correctiveAction || alert.observations || "Sin acción registrada",
  ]);
  if (alertRows.length) {
    y = checkPageBreak(doc, 90, y);
    y = addSimpleTable(doc, ["Fecha", "Velocidad", "Límite", "Nivel y estado", "Acción / observación"], alertRows, { y });
  }
  y = addParagraph(doc, "Los comprobantes permanecen adjuntos a sus registros fuente en H07 y H08 y deben estar disponibles para consulta durante la verificación.", { y });
  await addRepresentativeSignature(doc, company, y);
  doc.end();
  return finished;
}
