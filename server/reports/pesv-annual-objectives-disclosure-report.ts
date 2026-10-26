import PDFDocument from "pdfkit";
import type { Company, ObjetivoSV } from "@shared/schema";
import {
  addParagraph,
  addSectionBar,
  addSimpleTable,
  addSignatureFooter,
  addStandardHeader,
  checkPageBreak,
  type PdfSigners,
} from "../services/pdf-standardizer";
import { setupTrialWatermarkOnAllPages } from "../services/pdf-watermark";

export type ObjectiveDisclosure = {
  objective: ObjetivoSV & { responsableNombre: string | null };
  communications: Array<{
    id: string;
    asunto: string;
    contenido: string;
    fechaEnvio: Date | string;
    publicoObjetivo: string;
    mediosUtilizados: string[] | null;
    totalDestinatarios: number;
    totalLecturas: number;
    requiereConfirmacionLectura: number;
  }>;
};

export async function buildPesvAnnualObjectivesDisclosurePdfBuffer(input: {
  company: Company;
  objectives: ObjectiveDisclosure[];
  signers: PdfSigners;
  isTestCompany: boolean;
  watermark?: boolean;
}): Promise<Buffer> {
  const doc = new PDFDocument({
    margin: 35,
    size: "LETTER",
    info: {
      Title: "Divulgación de objetivos y metas del PESV",
      Author: "SST-Colombia",
      Subject: "Informe anual SISI/PESV n.º 11",
    },
  });
  setupTrialWatermarkOnAllPages(doc, Boolean(input.watermark));
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  let y = await addStandardHeader({
    doc,
    company: input.company,
    documentTitle: "DIVULGACIÓN DE OBJETIVOS Y METAS DEL PESV",
    documentCode: "SISI-PESV-ANUAL-11",
  });
  y = addParagraph(doc, "Pregunta SISI/PESV: ¿Los objetivos y metas son del conocimiento del personal de la organización?", { y, bold: true });
  y = addParagraph(doc, `Empresa: ${input.company.name} · NIT ${input.company.nit || "Sin registro"}`, { y });
  y = addParagraph(doc, `Generado: ${new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" })}`, { y });
  y = addParagraph(doc, `Objetivos P05 registrados: ${input.objectives.length}`, { y });

  if (input.isTestCompany) {
    y = checkPageBreak(doc, 70, y);
    y = addSectionBar(doc, "DATOS DE PRUEBA", y);
    y = addParagraph(doc, "DEMO-PRUEBA: este documento es material de prueba funcional y no debe presentarse como evidencia regulatoria real.", { y });
  }

  y = checkPageBreak(doc, 90, y);
  y = addSectionBar(doc, "Alcance y lectura de la evidencia", y);
  y = addParagraph(
    doc,
    "Este consolidado reúne copias PDF de comunicaciones SST vinculadas expresamente con cada objetivo P05. El envío acredita una comunicación registrada; las lecturas son confirmaciones individuales en el Portal de Empleados. Ninguno de esos registros demuestra por sí solo que todo el personal comprenda el contenido.",
    { y },
  );

  if (input.objectives.length === 0) {
    y = checkPageBreak(doc, 55, y);
    y = addParagraph(doc, "No hay objetivos P05 registrados para esta empresa. No se puede asociar ni verificar evidencia de divulgación.", { y, bold: true });
  }

  for (const [index, item] of input.objectives.entries()) {
    y = checkPageBreak(doc, 150, y);
    y = addSectionBar(doc, `Objetivo ${index + 1}: ${item.objective.titulo}`, y);
    y = addSimpleTable(doc, ["Dato del objetivo P05", "Registro"], [
      ["Código / año", `${item.objective.codigo} · ${item.objective.anio}`],
      ["Meta cuantitativa", item.objective.metaCuantitativa || "Sin registro"],
      ["Indicador", item.objective.indicadorAsociado || "Sin registro"],
      ["Responsable", item.objective.responsableNombre || "Sin registro"],
      ["Comunicaciones vinculadas", String(item.communications.length)],
    ], { y, columnWidths: [190, 352] });

    if (item.communications.length === 0) {
      y = addParagraph(doc, "No se encontró una comunicación vinculada a este objetivo.", { y });
      continue;
    }
    for (const communication of item.communications) {
      y = checkPageBreak(doc, 110, y);
      y = addSimpleTable(doc, ["Evidencia de difusión", "Registro"], [
        ["Asunto y fecha", `${communication.asunto} · ${new Date(communication.fechaEnvio).toLocaleDateString("es-CO", { timeZone: "America/Bogota" })}`],
        ["Público objetivo", communication.publicoObjetivo],
        ["Medios registrados", communication.mediosUtilizados?.join(", ") || "Sin registro"],
        ["Destinatarios / lecturas", `${communication.totalDestinatarios} / ${communication.totalLecturas}`],
        ["Confirmación de lectura", communication.requiereConfirmacionLectura ? "Solicitada" : "No solicitada"],
        ["Contenido", communication.contenido],
      ], { y, columnWidths: [150, 392] });
    }
  }

  await addSignatureFooter(doc, input.signers, true);
  doc.end();
  return finished;
}
