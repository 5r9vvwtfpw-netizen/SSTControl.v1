import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import type { Company } from "@shared/schema";
import {
  addLabeledField,
  addParagraph,
  addSectionBar,
  addSimpleTable,
  addStandardHeader,
  checkPageBreak,
  PDF_COLORS,
} from "../services/pdf-standardizer";
import { setupTrialWatermarkOnAllPages } from "../services/pdf-watermark";
import { objectStorageService } from "../objectStorage";

export type AnnualCertificationCode = "resolucion-1565-2014" | "resolucion-40595-2022";
export type AnnualCertificationAnswer = "implemented" | "not-implemented" | "in-development";

type CompanyForPdf = Company & { address?: string | null };

const certificationDetails: Record<AnnualCertificationCode, {
  documentTitle: string;
  documentCode: string;
  question: string;
  resolution: string;
  answers: Record<AnnualCertificationAnswer, string>;
}> = {
  "resolucion-1565-2014": {
    documentTitle: "Certificación anual del PESV — Resolución 1565 de 2014",
    documentCode: "SISI-PESV-ANUAL-01",
    question: "¿La empresa cuenta con un PESV implementado conforme a la Resolución 1565 de 2014?",
    resolution: "Resolución 1565 de 2014",
    answers: {
      implemented: "La empresa cuenta con un PESV implementado conforme a la Resolución 1565 de 2014.",
      "not-implemented": "La empresa no cuenta con un PESV implementado conforme a la Resolución 1565 de 2014.",
      "in-development": "",
    },
  },
  "resolucion-40595-2022": {
    documentTitle: "Certificación anual del PESV — Resolución 40595 de 2022",
    documentCode: "SISI-PESV-ANUAL-02",
    question: "¿La empresa cuenta con un PESV implementado conforme a la Resolución 40595 de 2022 o lo está desarrollando?",
    resolution: "Resolución 40595 de 2022",
    answers: {
      implemented: "La empresa cuenta con un PESV implementado conforme a la Resolución 40595 de 2022.",
      "not-implemented": "",
      "in-development": "La empresa se encuentra desarrollando su PESV conforme a la Resolución 40595 de 2022.",
    },
  },
};

async function loadRepresentativeSignature(company: CompanyForPdf): Promise<Buffer> {
  const signatureUrl = company.legalRepSignatureUrl;
  if (!signatureUrl) throw new Error("No está configurada la firma del Representante Legal.");

  if (signatureUrl.startsWith("/uploads/") || signatureUrl.startsWith("/objects/uploads/")) {
    const localPath = path.join(process.cwd(), "public", signatureUrl.replace(/^\/objects/, ""));
    if (fs.existsSync(localPath)) return fs.readFileSync(localPath);
  }

  const signature = await objectStorageService.getObjectBuffer(signatureUrl);
  if (!signature) throw new Error("No fue posible cargar la firma registrada del Representante Legal.");
  return signature;
}

export async function buildAnnualCertificationPdfBuffer(
  company: CompanyForPdf,
  reportCode: AnnualCertificationCode,
  answer: AnnualCertificationAnswer,
  watermark = false,
): Promise<Buffer> {
  const details = certificationDetails[reportCode];
  const answerText = details.answers[answer];
  if (!answerText) throw new Error("La respuesta seleccionada no corresponde a esta certificación.");
  if (!company.legalRepName?.trim() || !company.legalRepId?.trim()) {
    throw new Error("Completa el nombre y la identificación del Representante Legal en Empresas.");
  }
  const signature = await loadRepresentativeSignature(company);

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
    documentTitle: details.documentTitle,
    documentCode: details.documentCode,
  });
  y = addParagraph(doc, `Fecha de expedición: ${new Date().toLocaleDateString("es-CO")}`, { y, bold: true });
  y = addParagraph(doc, "CERTIFICACIÓN DEL REPRESENTANTE LEGAL", { y, bold: true });
  y = addParagraph(
    doc,
    `Yo, ${company.legalRepName.trim()}, identificado(a) con documento No. ${company.legalRepId.trim()}, en calidad de Representante Legal de ${company.name}, NIT ${company.nit}, certifico bajo mi responsabilidad la siguiente declaración:`,
    { y },
  );

  y = checkPageBreak(doc, 120, y);
  y = addSectionBar(doc, "Declaración reportada", y);
  y = addLabeledField(doc, "Pregunta del formulario SISI/PESV", details.question, { y });
  y = addLabeledField(doc, "Normatividad específica de este punto", details.resolution, { y });
  y = addSimpleTable(doc, ["Respuesta certificada"], [[answerText]], { y });
  y = addParagraph(
    doc,
    "La presente certificación corresponde exclusivamente a la pregunta y la referencia normativa indicadas en este documento.",
    { y },
  );

  y = checkPageBreak(doc, 115, y);
  const margin = 35;
  const top = y + 8;
  const width = doc.page.width - margin * 2;
  const boxHeight = 92;
  doc.lineWidth(1).strokeColor(PDF_COLORS.GREEN_PRIMARY).rect(margin, top, width, boxHeight).stroke();
  doc.fillColor(PDF_COLORS.GREEN_PRIMARY).font("Helvetica-Bold").fontSize(9)
    .text("FIRMA DEL REPRESENTANTE LEGAL", margin + 10, top + 8, { width: width - 20, align: "center" });
  doc.image(signature, margin + 24, top + 32, { fit: [115, 40], align: "center", valign: "center" });
  doc.fillColor(PDF_COLORS.BLACK).font("Helvetica-Bold").fontSize(9)
    .text(company.legalRepName.trim(), margin + 155, top + 36, { width: width - 175 });
  doc.font("Helvetica").fontSize(8)
    .text(`Identificación: ${company.legalRepId.trim()}\nRepresentante Legal`, margin + 155, top + 52, { width: width - 175 });

  doc.end();
  return finished;
}
