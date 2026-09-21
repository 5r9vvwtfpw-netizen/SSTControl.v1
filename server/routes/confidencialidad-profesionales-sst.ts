import type { Express } from "express";
import { requireAuth, requireSuperadmin } from "../auth";
import {
  generateConfidencialidadProfesionalSstPdf,
  type ConfidencialidadProfesionalSstData,
} from "../services/pdf-confidencialidad-profesionales-sst";

export function registerConfidencialidadProfesionalesSstRoutes(app: Express) {
  app.post(
    "/api/confidencialidad-profesionales-sst/pdf",
    requireAuth,
    requireSuperadmin,
    async (req, res) => {
      try {
        const body = req.body as Partial<ConfidencialidadProfesionalSstData>;
        if (!body.nombreProfesional?.trim() || !body.identificacionProfesional?.trim()) {
          return res.status(400).json({ error: "El nombre y la identificación del profesional son requeridos" });
        }
        if (!body.correoProfesional?.trim()) {
          return res.status(400).json({ error: "El correo del profesional es requerido" });
        }

        const pdfBuffer = await generateConfidencialidadProfesionalSstPdf(body);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="Acuerdo-Confidencialidad-Profesional-SST.pdf"',
        );
        res.send(pdfBuffer);
      } catch (error) {
        console.error("Error generando confidencialidad de profesional SST:", error);
        res.status(500).json({ error: "Error al generar el acuerdo de confidencialidad" });
      }
    },
  );
}