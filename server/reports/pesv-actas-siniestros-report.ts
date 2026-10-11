import XLSX from "xlsx-js-style";
import type { Company } from "@shared/schema";
import {
  addParagraph,
  addSectionBar,
  addSimpleTable,
  addSignatureFooter,
  addStandardHeader,
  getSignersForCompany,
  PDF_CONFIG,
} from "../services/pdf-standardizer";
import { setupTrialWatermarkOnAllPages } from "../services/pdf-watermark";

export type ActaSiniestroEvidence = {
  incidentId: string;
  incidentDate: string;
  vehiclePlate: string | null;
  driverName: string | null;
  actaId: string | null;
  numeroActa: number | null;
  fechaReunion: string | null;
  estado: string | null;
  temasOrdenDia: string | null;
  desarrolloReunion: string | null;
  compromisos: string | null;
  observaciones: string | null;
};

export type ActasSiniestrosCompany = Pick<Company, "id" | "name" | "nit" | "address" | "logoUrl">;
export type ActasSiniestrosPeriod = { from: string; to: string };

const dateLabel = (value: string | null | undefined) => {
  if (!value) return "—";
  const match = value.slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
};

export function buildActasSiniestrosExcelBuffer(
  company: ActasSiniestrosCompany,
  records: ActaSiniestroEvidence[],
  period: ActasSiniestrosPeriod,
): Buffer {
  const workbook = XLSX.utils.book_new();
  const title = [
    ["COPIA DE ACTAS DEL COMITÉ PESV"],
    [`Empresa: ${company.name} · NIT: ${company.nit}`],
    [`Período trimestral: ${dateLabel(period.from)} al ${dateLabel(period.to)}`],
    ["Las actas se relacionan con siniestros ocurridos en el período; una reunión posterior puede analizar un siniestro anterior."],
    [],
    ["Fecha del siniestro", "Vehículo", "Conductor", "Número del acta", "Fecha de reunión", "Estado del acta", "Temas de la reunión", "Investigación / desarrollo registrado", "Compromisos", "Observaciones"],
    ...records.map((record) => [
      dateLabel(record.incidentDate),
      record.vehiclePlate || "",
      record.driverName || "",
      record.numeroActa ?? "",
      dateLabel(record.fechaReunion),
      record.estado || "",
      record.temasOrdenDia || "",
      record.desarrolloReunion || "",
      record.compromisos || "",
      record.observaciones || "",
    ]),
  ];
  const sheet = XLSX.utils.aoa_to_sheet(title);
  sheet["!cols"] = [16, 16, 28, 16, 18, 16, 36, 48, 36, 36].map((wch) => ({ wch }));
  sheet["!autofilter"] = { ref: `A6:J${Math.max(6, records.length + 6)}` };
  sheet["!freeze"] = { xSplit: 0, ySplit: 6 };
  for (let column = 0; column < 10; column += 1) {
    const cell = XLSX.utils.encode_cell({ r: 5, c: column });
    if (sheet[cell]) sheet[cell].s = {
      font: { name: "Arial", bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "236B45" } },
      alignment: { wrapText: true, vertical: "center" },
    };
  }
  XLSX.utils.book_append_sheet(workbook, sheet, "Actas de siniestros");
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

export async function buildActasSiniestrosPdfBuffer(
  company: ActasSiniestrosCompany,
  records: ActaSiniestroEvidence[],
  period: ActasSiniestrosPeriod,
  requiresWatermark: boolean,
): Promise<Buffer> {
  const { default: PDFDocument } = await import("pdfkit");
  const doc = new PDFDocument({ size: PDF_CONFIG.PAGE_SIZE, margin: PDF_CONFIG.MARGIN, bufferPages: true });
  const chunks: Buffer[] = [];
  const result = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
  setupTrialWatermarkOnAllPages(doc, requiresWatermark);

  let y = await addStandardHeader({
    doc,
    company,
    documentTitle: "COPIA DE ACTAS DEL COMITÉ PESV",
    documentCode: "PESV-ACTAS-SINIESTROS-02",
  });
  y = addParagraph(doc, `Período: ${dateLabel(period.from)} al ${dateLabel(period.to)}`, { y, bold: true });
  y = addParagraph(doc, "Actas vinculadas a siniestros ocurridos durante el trimestre. Se conserva el contenido registrado en el Comité PESV.", { y });
  const unique = [...new Map(records.filter((record) => record.actaId).map((record) => [record.actaId, record])).values()];
  if (unique.length === 0) {
    y = addSectionBar(doc, "Resultado del período", y);
    y = addParagraph(doc, "No hay siniestros con actas vinculadas para el período consultado.", { y });
  }
  for (let index = 0; index < unique.length; index += 1) {
    const record = unique[index];
    if (index > 0) doc.addPage();
    y = await addStandardHeader({
      doc,
      company,
      documentTitle: "COPIA DEL ACTA DE INVESTIGACIÓN INTERNA",
      documentCode: `PESV-ACTA-CSV-${record.numeroActa ?? "PENDIENTE"}`,
    });
    y = addSectionBar(doc, "Datos del acta", y);
    y = addSimpleTable(doc, ["Dato", "Información registrada"], [
      ["Número del acta", String(record.numeroActa ?? "Pendiente")],
      ["Fecha de reunión", dateLabel(record.fechaReunion)],
      ["Estado", record.estado || "Sin estado"],
      ["Siniestro relacionado", `${dateLabel(record.incidentDate)} · ${record.vehiclePlate || "Vehículo sin placa"} · ${record.driverName || "Conductor sin nombre"}`],
    ], { y, columnWidths: [190, doc.page.width - PDF_CONFIG.MARGIN * 2 - 190] });
    y = addSectionBar(doc, "Temas de la reunión", y);
    y = addParagraph(doc, record.temasOrdenDia || "No hay temas registrados.", { y });
    y = addSectionBar(doc, "Investigación interna y desarrollo", y);
    y = addParagraph(doc, record.desarrolloReunion || "No hay desarrollo registrado.", { y });
    y = addSectionBar(doc, "Compromisos", y);
    y = addParagraph(doc, record.compromisos || "No hay compromisos registrados.", { y });
    y = addSectionBar(doc, "Observaciones", y);
    y = addParagraph(doc, record.observaciones || "Sin observaciones.", { y });
  }

  await addSignatureFooter(doc, await getSignersForCompany(company.id), true);
  const pages = doc.bufferedPageRange();
  for (let page = pages.start; page < pages.start + pages.count; page += 1) {
    doc.switchToPage(page);
    doc.font("Helvetica").fontSize(7).fillColor("#666666")
      .text(`SST Colombia · Página ${page + 1} de ${pages.count}`, PDF_CONFIG.MARGIN, doc.page.height - PDF_CONFIG.MARGIN - 12, {
        width: doc.page.width - PDF_CONFIG.MARGIN * 2, align: "right", lineBreak: false,
      });
  }
  doc.end();
  return result;
}
