import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import PDFDocument from "pdfkit";
import { createHash } from "crypto";
import { ContratoSaaSContent } from "../../client/src/pages/ContratoSaaS";

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
<p>Documento correspondiente al contrato SaaS versión <strong>${escapeHtml(snapshot.contractVersion)}</strong>.</p>
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
<p>La constancia identifica la operación y la versión del documento aceptada. ${limitation}</p>
</section></body></html>`;
}

function decodeHtmlText(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<(br|\/p|\/div|\/section|\/h[1-6]|\/tr|\/li)>/gi, "\n")
    .replace(/<li\b[^>]*>/gi, " • ")
    .replace(/<\/t[dh]>/gi, " | ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_match, value: string) => String.fromCodePoint(Number(value)))
    .replace(/&#x([0-9a-f]+);/gi, (_match, value: string) => String.fromCodePoint(parseInt(value, 16)))
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function generateSignedSaasContractPdf(
  contractHtml: string,
  snapshot: ContractSignerSnapshot,
): Promise<Buffer> {
  const adminUpload = snapshot.signingMethod === "admin_upload";
  const contractText = decodeHtmlText(contractHtml);
  if (!contractText.includes("1. Partes del Contrato") || !contractText.includes("17. Contacto")) {
    throw new Error("El contrato fuente está incompleto y no puede firmarse");
  }

  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({
      size: "LETTER",
      margin: 52,
      info: {
        Title: `Contrato SaaS v${snapshot.contractVersion} — ${snapshot.companyName}`,
        Author: "SST Colombia",
        Subject: `Integridad de la fuente SHA-256 ${snapshot.sourceSha256}`,
      },
    });
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("error", reject);
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    doc.font("Helvetica-Bold").fontSize(18).fillColor("#166534")
      .text("Contrato de Prestación de Servicios SaaS", { align: "center" });
    if (snapshot.testOnly) {
      doc.moveDown(0.4).font("Helvetica-Bold").fontSize(12).fillColor("#b91c1c")
        .text("PRUEBA FUNCIONAL — SIN EFECTO CONTRACTUAL", { align: "center" });
    }
    doc.moveDown(0.4);
    doc.font("Helvetica").fontSize(9).fillColor("#374151")
      .text(`Versión ${snapshot.contractVersion} · SHA-256 de la fuente: ${snapshot.sourceSha256}`, { align: "center" });
    doc.moveDown(1);
    doc.font("Helvetica").fontSize(9).fillColor("#111827")
      .text(contractText, { lineGap: 3, paragraphGap: 2, align: "left" });
    doc.addPage();
    doc.font("Helvetica-Bold").fontSize(17).fillColor("#166534")
      .text("Constancia de firma electrónica");
    if (snapshot.testOnly) {
      doc.moveDown(0.4).font("Helvetica-Bold").fontSize(12).fillColor("#b91c1c")
        .text("PRUEBA FUNCIONAL — SIN EFECTO CONTRACTUAL", { align: "center" });
    }
    doc.moveDown();
    doc.font("Helvetica").fontSize(10).fillColor("#111827");
    const details: Array<[string, string]> = [
      ["Empresa", `${snapshot.companyName} — NIT ${snapshot.companyNit}`],
      ["Representante legal indicado", `${snapshot.signerName} — identificación ${snapshot.signerId}`],
      ["Calidad declarada", snapshot.capacity === "attorney" ? "Apoderado autorizado" : "Representante legal"],
      ["Versión del contrato", snapshot.contractVersion],
      ["Fecha y hora (UTC)", snapshot.signedAt.toISOString()],
      ["Método", adminUpload
        ? "Imagen de firma aportada por el administrador de la cuenta para este contrato"
        : "Código de verificación de un solo uso enviado al correo registrado del firmante"],
      ...(adminUpload
        ? [
            ["Acción realizada por", `${snapshot.signedByName || "Administrador"} (usuario ${snapshot.signedByUserId || "no registrado"})`],
            ["Declaración", "El administrador declaró contar con autorización del representante legal para aceptar este contrato."],
          ] as Array<[string, string]>
        : [["Reto OTP", snapshot.challengeId || ""]] as Array<[string, string]>),
      ["Dirección IP", snapshot.ip],
      ["Agente de usuario", snapshot.userAgent],
      ["SHA-256 del contrato presentado", snapshot.sourceSha256],
      ["SHA-256 de la imagen de firma", sha256(snapshot.signatureImage)],
    ];
    for (const [label, value] of details) {
      doc.font("Helvetica-Bold").text(`${label}: `, { continued: true });
      doc.font("Helvetica").text(value, { paragraphGap: 7 });
    }
    if (doc.y > doc.page.height - 190) doc.addPage();
    doc.moveDown(0.5);
    doc.font("Helvetica-Bold").fontSize(10).text("Firma adjunta por el representante legal:");
    doc.moveDown(0.4);
    const imageY = doc.y;
    doc.image(snapshot.signatureImage, 54, imageY, { fit: [240, 90] });
    doc.y = imageY + 95;
    doc.moveDown();
    doc.fontSize(8).fillColor("#4b5563").text(
      adminUpload
        ? "La constancia identifica la operación y la versión aceptada. La imagen aportada y la declaración del administrador no verifican externamente la identidad ni la autorización específica del representante legal."
        : "La constancia identifica el método electrónico y la versión del documento aceptada. La imagen adjunta y el código no constituyen una validación externa de la identidad o de las facultades del firmante.",
      { lineGap: 3 },
    );
    doc.end();
  });
}