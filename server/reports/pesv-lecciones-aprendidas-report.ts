import XLSX from "xlsx-js-style";
import PDFDocument from "pdfkit";
import type { Company } from "@shared/schema";
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

export type LeccionReportRow = {
  asunto: string;
  contenido: string;
  fechaEnvio: Date | string;
  fechaEvento: string | null;
  leccionAprendida: string | null;
  trabajador: string | null;
  fechaLectura: Date | string | null;
  retroalimentacion: string | null;
};

export type LeccionesReportCompany = Pick<Company, "id" | "name" | "nit" | "address" | "logoUrl">;

function dateText(value: Date | string | null | undefined) {
  if (!value) return "Pendiente";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString("es-CO");
}

export function buildLeccionesExcelBuffer(company: LeccionesReportCompany, rows: LeccionReportRow[], period: {from: string; to: string}) {
  const sheet = XLSX.utils.aoa_to_sheet([
    ["EVIDENCIA DE DIVULGACIÓN DE LECCIONES APRENDIDAS"],
    [`Empresa: ${company.name} · NIT: ${company.nit}`],
    [`Período: ${dateText(period.from)} al ${dateText(period.to)}`],
    [],
    ["Fecha de divulgación", "Asunto", "Lección de la investigación", "Comunicación enviada", "Trabajador implicado", "Fecha de lectura", "Retroalimentación"],
    ...rows.map((row) => [
      dateText(row.fechaEnvio), row.asunto, row.leccionAprendida || "Pendiente en investigación",
      row.contenido, row.trabajador || "Destinatario sin trabajador asociado",
      dateText(row.fechaLectura), row.retroalimentacion || "Pendiente de respuesta",
    ]),
  ]);
  sheet["!cols"] = [{wch:18},{wch:32},{wch:48},{wch:48},{wch:32},{wch:18},{wch:48}];
  sheet["!merges"] = [
    {s:{r:0,c:0},e:{r:0,c:6}},
    {s:{r:1,c:0},e:{r:1,c:6}},
    {s:{r:2,c:0},e:{r:2,c:6}},
  ];
  sheet["A1"].s = {font:{name:"Arial",sz:16,bold:true,color:{rgb:"FFFFFF"}},fill:{fgColor:{rgb:"246B45"}},alignment:{horizontal:"center",vertical:"center"}};
  for (const cell of ["A2","A3"]) sheet[cell].s = {font:{name:"Arial",sz:10,bold:true}};
  for (let c=0;c<7;c++) {
    const cell = XLSX.utils.encode_cell({r:4,c});
    sheet[cell].s = {font:{name:"Arial",sz:10,bold:true,color:{rgb:"FFFFFF"}},fill:{fgColor:{rgb:"3B7657"}},alignment:{horizontal:"center",vertical:"center",wrapText:true}};
  }
  sheet["!rows"] = [{hpt:30},{hpt:20},{hpt:20},{hpt:8},{hpt:34}];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, "Lecciones aprendidas");
  return XLSX.write(wb, {type:"buffer", bookType:"xlsx"}) as Buffer;
}

export async function buildLeccionesPdfBuffer(company: LeccionesReportCompany, rows: LeccionReportRow[], period: {from: string; to: string}, watermark = false): Promise<Buffer> {
  const doc = new PDFDocument({margin:35,size:"LETTER",bufferPages:true});
  setupTrialWatermarkOnAllPages(doc, watermark);
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<Buffer>((resolve,reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
  let y = await addStandardHeader({doc,company,documentTitle:"Evidencia de divulgación de lecciones aprendidas",documentCode:"PESV-INFO-TRI-03"});
  y = addParagraph(doc, `Período trimestral: ${dateText(period.from)} al ${dateText(period.to)}`, {y,bold:true});
  y = addParagraph(doc, "Evidencia basada en las investigaciones de accidentes y las comunicaciones SST enviadas por el Portal de Empleados. La confirmación de lectura y la retroalimentación se presentan por destinatario.", {y});
  y = addSectionBar(doc,"Registro de divulgación y retroalimentación",y);
  const tableRows = rows.map((r) => [
    `${dateText(r.fechaEnvio)}\n${r.asunto}`,
    r.leccionAprendida || "Lección pendiente en investigación",
    r.trabajador || "Destinatario no asociado",
    r.fechaLectura ? dateText(r.fechaLectura) : "Lectura pendiente",
    r.retroalimentacion || "Retroalimentación pendiente",
  ]);
  if (tableRows.length) {
    y = checkPageBreak(doc, 100, y);
    y = addSimpleTable(doc, ["Divulgación","Lección aprendida","Implicado","Lectura","Retroalimentación"],tableRows,{y,columnWidths:[95,135,85,70,140]});
  } else {
    y = addParagraph(doc,"No hay comunicaciones de lecciones aprendidas registradas para este trimestre.",{y});
  }
  await addSignatureFooter(doc, await getSignersForCompany(company.id), true, {startY: Math.max(y + 18, 640)});
  doc.end();
  return finished;
}
