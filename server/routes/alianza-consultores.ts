import { Express } from "express";
import { requireAuth, requireSuperadmin } from "../auth";
import { generateAlianzaConsultoresPdf } from "../services/pdf-alianza-consultores";

export function registerAlianzaConsultoresRoutes(app: Express) {
  app.post(
    "/api/alianza-consultores/pdf",
    requireAuth,
    requireSuperadmin,
    async (req, res) => {
      try {
        const pdfBuffer = await generateAlianzaConsultoresPdf(req.body);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="Alianza-Consultores-SST.pdf"'
        );
        res.send(pdfBuffer);
      } catch (err: any) {
        console.error("Error generando alianza PDF:", err);
        res.status(500).json({ error: "Error al generar el PDF" });
      }
    }
  );
}
