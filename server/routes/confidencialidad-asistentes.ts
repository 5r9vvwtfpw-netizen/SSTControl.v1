import { Express } from "express";
import { requireAuth, requireSuperadmin } from "../auth";
import { generateConfidencialidadAsistentePdf } from "../services/pdf-confidencialidad-asistentes";

export function registerConfidencialidadAsistentesRoutes(app: Express) {
  app.post(
    "/api/confidencialidad-asistentes/pdf",
    requireAuth,
    requireSuperadmin,
    async (req, res) => {
      try {
        const pdfBuffer = await generateConfidencialidadAsistentePdf(req.body);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="Acuerdo-Confidencialidad-Asistente-SST.pdf"'
        );
        res.send(pdfBuffer);
      } catch (err: any) {
        console.error("Error generando PDF confidencialidad asistente:", err);
        res.status(500).json({ error: "Error al generar el PDF" });
      }
    }
  );
}
