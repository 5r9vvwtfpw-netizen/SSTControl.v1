import XLSX from "xlsx-js-style";
import PDFDocument from "pdfkit";
import type { Company, PoliticaSst } from "@shared/schema";
import { addLabeledField, addParagraph, addSectionBar, addStandardHeader } from "../services/pdf-standardizer";
import { setupTrialWatermarkOnAllPages } from "../services/pdf-watermark";

type ReportCompany = Pick<Company, "id" | "name" | "nit" | "address" | "logoUrl">;
type PolicyRecord = Pick<PoliticaSst, "id" | "codigo" | "nombre" | "version" | "estado" | "fechaEmision" | "fechaProximaRevision" | "representanteLegal" | "cedulaRepresentante" | "fechaFirma">;

function policyRows(policy: PolicyRecord | null, issuedAt: Date) {
  const date = issuedAt.toLocaleDateString("es-CO");
  return [
    ["Fecha de consulta", date],
    ["¿Cuenta con Política de Seguridad Vial aprobada y vigente?", policy ? "Sí" : "No"],
    ["Documento", policy?.nombre || "No hay política aprobada y vigente registrada"],
    ["Código", policy?.codigo || "—"],
    ["Versión", policy?.version || "—"],
    ["Estado registrado", policy?.estado || "No registrada"],
    ["Fecha de emisión", policy?.fechaEmision || "—"],
    ["Próxima revisión", policy?.fechaProximaRevision || "—"],
    ["Representante Legal registrado en la política", policy?.representanteLegal || "—"],
    ["Identificación del Representante Legal", policy?.cedulaRepresentante || "—"],
    ["Fecha de firma registrada", policy?.fechaFirma || "—"],
  ];
}

export function buildPesvRoadSafetyPolicyExcel(company: ReportCompany, policy: PolicyRecord | null, issuedAt = new Date()): Buffer {
  const worksheet = XLSX.utils.aoa_to_sheet([
    ["INFORME TRIMESTRAL PESV — POLÍTICA DE SEGURIDAD VIAL"],
    [`Empresa: ${company.name} · NIT: ${company.nit}`],
    ...policyRows(policy, issuedAt),
    [],
    ["Fuente", "Módulo Políticas SST · Paso P03 — Política de Seguridad Vial"],
    ["Alcance temporal", "Consulta del estado vigente a la fecha indicada; no reconstruye estados históricos."],
  ]);
  worksheet["!cols"] = [{ wch: 48 }, { wch: 72 }];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Política vial");
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

export async function buildPesvRoadSafetyPolicyPdf(company: ReportCompany, policy: PolicyRecord | null, watermark = false, issuedAt = new Date()): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 35, size: "LETTER" });
  setupTrialWatermarkOnAllPages(doc, watermark);
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
  let y = await addStandardHeader({ doc, company, documentTitle: "Informe trimestral PESV — Política de Seguridad Vial", documentCode: "PESV-INFO-TRI-05" });
  y = addParagraph(doc, `Fecha de consulta: ${issuedAt.toLocaleDateString("es-CO")}`, { y, bold: true });
  y = addParagraph(doc, "Este informe presenta el estado vigente consultado en el módulo fuente. No reconstruye la vigencia histórica de trimestres anteriores.", { y });
  y = addSectionBar(doc, "Respuesta del informe", y);
  y = addLabeledField(doc, "¿Cuenta con Política de Seguridad Vial aprobada y vigente?", policy ? "Sí" : "No", { y });
  y = addLabeledField(doc, "Documento", policy?.nombre || "No hay política aprobada y vigente registrada", { y });
  if (policy) {
    y = addLabeledField(doc, "Código y versión", `${policy.codigo} · ${policy.version}`, { y });
    y = addLabeledField(doc, "Fecha de emisión", String(policy.fechaEmision), { y });
    y = addLabeledField(doc, "Fecha de firma registrada", String(policy.fechaFirma), { y });
    y = addLabeledField(doc, "Representante Legal", `${policy.representanteLegal} · C.C. ${policy.cedulaRepresentante}`, { y });
    y = addLabeledField(doc, "Próxima revisión", String(policy.fechaProximaRevision), { y });
    y = addParagraph(doc, "La copia aprobada de la política se descarga desde el módulo Políticas SST; este informe no reemplaza el documento fuente.", { y });
  } else {
    y = addParagraph(doc, "Pendiente: registrar y aprobar la Política de Seguridad Vial en el módulo fuente. Paso P03 del PESV.", { y });
  }
  doc.end();
  return finished;
}
