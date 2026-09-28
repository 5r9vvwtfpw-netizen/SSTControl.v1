import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import PDFDocument from "pdfkit";
import { createHash } from "crypto";
import { ContratoSaaSContent } from "../../client/src/pages/ContratoSaaS";
import { renderSaasContractPdf } from "./saas-contract-pdf-layout";

export interface ContractSignerSnapshot {
  signerName: string;
  signerId: string;
  capacity: "legal_representative" | "attorney";
  companyName: string;
  companyNit: string;
  contractVersion: string;
  sourceSha256: string;
  challengeId?: string;
  signingMethod?: "email_otp" | "admin_upload";
  signedByUserId?: string;
  signedByName?: string;
  signedAt: Date;
  ip: string;
  userAgent: string;
  testOnly?: boolean;
  signatureImage: Buffer;
  readingCopy?: boolean;
  originalPdfSha256?: string;
}

export function sha256(buffer: Buffer | string): string {
  return createHash("sha256").update(buffer).digest("hex");
}

/**
 * Server-renders the exact contract body used by the public React contract page.
 * Keeping the renderer pointed at that component avoids maintaining a second
 * legal-text copy on the server.
 */
export function renderCanonicalSaasContractHtml(): string {
  const globalReact = globalThis as any;
  const priorReact = globalReact.React;
  globalReact.React = React;
  let html: string;
  try {
    // The existing public TSX contract is compiled with the classic JSX
    // transform by tsx on the server and the automatic transform by Vite.
    html = renderToStaticMarkup(createElement(ContratoSaaSContent));
  } finally {
    if (priorReact) globalReact.React = priorReact;
    else delete globalReact.React;
  }
  if (!html.includes("1. Partes del Contrato") || !html.includes("17. Contacto")) {
    throw new Error("No se pudo obtener el contenido completo del contrato SaaS");
  }
  return html;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]!);
}

export function renderSignedSaasContractHtml(
  contractHtml: string,
  snapshot: ContractSignerSnapshot,
): string {
  const capacityLabel = snapshot.capacity === "attorney"
    ? "Apoderado autorizado"
    : "Representante legal";
  const adminUpload = snapshot.signingMethod === "admin_upload";
  const methodText = adminUpload
    ? "El administrador cargó una imagen de firma específica para este contrato y registró su aceptación declarando contar con autorización del representante legal."
    : "Código de un solo uso enviado al correo registrado del firmante.";
  const limitation = adminUpload
    ? "La imagen aportada y la declaración del administrador no verifican externamente la identidad ni la autorización específica del representante legal."
    : "La imagen adjunta y el código no constituyen una validación externa de la identidad o de las facultades del firmante.";
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Contrato SaaS firmado</title></head><body>
${snapshot.testOnly ? `<div style="padding:12px;background:#fee2e2;color:#991b1b;font-weight:bold">PRUEBA FUNCIONAL — SIN EFECTO CONTRACTUAL</div>` : ""}
<main>${contractHtml}</main>
<section style="page-break-before:always;border-top:2px solid #166534;margin-top:32px;padding-top:20px;font-family:Arial,sans-serif;color:#1f2937">
<h1>Constancia de firma electrónica</h1>
${snapshot.testOnly ? `<p style="color:#b91c1c;font-weight:bold">PRUEBA FUNCIONAL — SIN EFECTO CONTRACTUAL</p>` : ""}
<p>Documento correspondiente al contrato SaaS aceptado.</p>
<p><strong>Empresa:</strong> ${escapeHtml(snapshot.companyName)} — NIT ${escapeHtml(snapshot.companyNit)}</p>
<p><strong>Representante legal indicado:</strong> ${escapeHtml(snapshot.signerName)} — identificación ${escapeHtml(snapshot.signerId)}</p>
<p><strong>Calidad declarada:</strong> ${capacityLabel}</p>
<p><strong>Fecha y hora (UTC):</strong> ${escapeHtml(snapshot.signedAt.toISOString())}</p>
${adminUpload
  ? `<p><strong>Acción realizada por:</strong> ${escapeHtml(snapshot.signedByName || "Administrador")} (usuario ${escapeHtml(snapshot.signedByUserId || "no registrado")})</p>`
  : `<p><strong>Reto OTP:</strong> ${escapeHtml(snapshot.challengeId || "")}</p>`}
<p><strong>Integridad del contrato presentado:</strong> SHA-256 ${escapeHtml(snapshot.sourceSha256)}</p>
<p><strong>Registro de la firma:</strong> ${methodText} Dirección IP ${escapeHtml(snapshot.ip)}.</p>
<p><strong>Imagen de firma adjunta:</strong> SHA-256 ${sha256(snapshot.signatureImage)}</p>
<img alt="Firma adjunta por el representante legal" src="data:image/png;base64,${snapshot.signatureImage.toString("base64")}" style="display:block;max-width:260px;max-height:110px;object-fit:contain;margin:16px 0">
<p><strong>Agente de usuario:</strong> ${escapeHtml(snapshot.userAgent)}</p>
<p>La constancia identifica la operación y el documento aceptado. ${limitation}</p>
</section></body></html>`;
}

export async function generateSignedSaasContractPdf(
  contractHtml: string,
  snapshot: ContractSignerSnapshot,
): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({
      size: "LETTER",
      margin: 0,
      bufferPages: true,
      info: {
        Title: `Contrato SaaS — ${snapshot.companyName}`,
        Author: "SST Colombia",
        Subject: `Integridad de la fuente SHA-256 ${snapshot.sourceSha256}`,
      },
    });
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("error", reject);
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    try {
      renderSaasContractPdf(doc, contractHtml, snapshot, sha256(snapshot.signatureImage));
      doc.end();
    } catch (error) {
      doc.removeAllListeners("data");
      reject(error);
    }
  });
}