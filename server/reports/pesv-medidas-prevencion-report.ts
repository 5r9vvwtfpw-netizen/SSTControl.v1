import PDFDocument from "pdfkit";
import type { Company, PesvGpsExpense, SafeRoute } from "@shared/schema";
import {
  addParagraph,
  addSectionBar,
  addSimpleTable,
  addStandardHeader,
  getSignersForCompany,
  addSignatureFooter,
  checkPageBreak,
} from "../services/pdf-standardizer";
import { setupTrialWatermarkOnAllPages } from "../services/pdf-watermark";

type Period = { from: string; to: string };
type CompanyForPdf = Company & { address?: string | null };

const dateText = (value: string | Date | null | undefined) => {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString("es-CO");
};
const evidenceText = (value: string | null | undefined) =>
  value?.startsWith("uploads/") ? "Soporte adjunto al registro PESV" : value || "Soporte no adjuntado";

export async function buildMedidasPrevencionPdfBuffer(
  company: CompanyForPdf,
  routes: SafeRoute[],
  expenses: PesvGpsExpense[],
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

  const signers = await getSignersForCompany(company.id, false);
  let y = await addStandardHeader({
    doc,
    company,
    documentTitle: "Certificación trimestral de medidas para prevenir la accidentalidad vial",
    documentCode: "PESV-INFO-TRI-04",
  });
  y = addParagraph(doc, `Período certificado: ${dateText(period.from)} al ${dateText(period.to)}`, { y, bold: true });
  y = addParagraph(doc,
    `La empresa, por medio de su Representante Legal, certifica que los datos fueron revisados y que las medidas de señalización y puestos de control relacionadas a continuación fueron implementadas para contribuir a reducir la accidentalidad vial durante el período indicado. También certifica que los gastos GPS corresponden a los registros de la empresa. La firma incorporada es la registrada en la configuración empresarial.`,
    { y });

  y = checkPageBreak(doc, 110, y);
  y = addSectionBar(doc, "Señalización y puestos de control — Rutas Seguras", y);
  const routeRows = routes.map((route) => [
    route.routeName,
    [
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
  y = addParagraph(doc, "Esta certificación consolida la información registrada por la empresa en Rutas Seguras y Monitoreo GPS. Los archivos de soporte permanecen adjuntos a sus registros fuente y deben estar disponibles para consulta durante la verificación.", { y });
  await addSignatureFooter(doc, signers, false, { startY: y + 15 });
  doc.end();
  return finished;
}
