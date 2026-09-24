import { Express } from "express";
import { requireAuth, requireSuperadmin } from "../auth";
import { generateInformeEjecutivoPdfForRecipients } from "../services/pdf-informe-ejecutivo";

const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f-\u009f]/;
const DEFAULT_REPORT_TITLE = "Gestión del SG-SST de la empresa";

function readTextField(
  body: Record<string, unknown>,
  field: string,
  maxLength: number,
  required = false,
): string {
  if (!Object.prototype.hasOwnProperty.call(body, field)) {
    if (required) throw new Error(`${field} es obligatorio.`);
    return "";
  }
  const value = body[field];
  if (typeof value !== "string" || CONTROL_CHARACTERS.test(value)) {
    throw new Error(`${field} debe ser texto válido.`);
  }
  const trimmed = value.trim();
  if ((required && !trimmed) || trimmed.length > maxLength) {
    throw new Error(`${field} no cumple con la longitud permitida.`);
  }
  return trimmed;
}

function readBooleanField(
  body: Record<string, unknown>,
  field: string,
  defaultValue = false,
): boolean {
  if (!Object.prototype.hasOwnProperty.call(body, field)) return defaultValue;
  if (typeof body[field] !== "boolean") {
    throw new Error(`${field} debe ser verdadero o falso.`);
  }
  return body[field] as boolean;
}

export function registerInformeEjecutivoRoutes(app: Express) {
  app.post(
    "/api/informe-ejecutivo/pdf",
    requireAuth,
    requireSuperadmin,
    async (req, res) => {
      const body = req.body;
      if (!body || typeof body !== "object" || Array.isArray(body)) {
        return res.status(400).json({ error: "Se requiere una empresa válida." });
      }

      let first: string;
      let second: string;
      let nitFirst: string;
      let nitSecond: string;
      let professionalName: string;
      let reportTitle: string;
      let includePesv: boolean;
      try {
        const fields = body as Record<string, unknown>;
        if (
          Object.prototype.hasOwnProperty.call(fields, "nitLosPicas") ||
          Object.prototype.hasOwnProperty.call(fields, "nombreBreveEmpresaInforme") ||
          Object.prototype.hasOwnProperty.call(fields, "empresaInforme") ||
          Object.prototype.hasOwnProperty.call(fields, "nitEmpresaInforme")
        ) {
          throw new Error("El payload contiene un campo que ya no es válido.");
        }
        first = readTextField(fields, "empresaDestinataria1", 120, true);
        second = readTextField(fields, "empresaDestinataria2", 120);
        nitFirst = readTextField(fields, "nitDestinataria1", 30);
        nitSecond = readTextField(fields, "nitDestinataria2", 30);
        professionalName = readTextField(fields, "nombreProfesional", 100);
        reportTitle = Object.prototype.hasOwnProperty.call(fields, "tituloInforme")
          ? readTextField(fields, "tituloInforme", 100, true)
          : DEFAULT_REPORT_TITLE;
        includePesv = readBooleanField(fields, "incluirPesv");
      } catch (error) {
        return res.status(400).json({
          error: error instanceof Error ? error.message : "Los datos enviados no son válidos.",
        });
      }

      if (!second && nitSecond) {
        return res.status(400).json({
          error: "No se puede indicar el NIT de una segunda empresa sin su nombre.",
        });
      }
      const recipients = [
        { name: first, ...(nitFirst ? { nit: nitFirst } : {}) },
        ...(second ? [{ name: second, ...(nitSecond ? { nit: nitSecond } : {}) }] : []),
      ];
      if (
        recipients.length === 2 &&
        recipients[0].name.replace(/\s+/g, " ").toLocaleLowerCase("es") ===
          recipients[1].name.replace(/\s+/g, " ").toLocaleLowerCase("es")
      ) {
        return res.status(400).json({ error: "Las empresas deben ser diferentes." });
      }

      const pdfInput = {
        recipients,
        professionalName,
        title: reportTitle,
        includePesv,
      };
      try {
        const pdfBuffer = await generateInformeEjecutivoPdfForRecipients(pdfInput);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="Informe-Ejecutivo-SG-SST.pdf"',
        );
        return res.send(pdfBuffer);
      } catch (error) {
        console.error("Error generando Informe Ejecutivo PDF:", error);
        return res.status(500).json({ error: "Error al generar el PDF." });
      }
    },
  );
}