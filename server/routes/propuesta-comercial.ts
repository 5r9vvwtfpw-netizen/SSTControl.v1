import { Express } from "express";
import { requireAuth, requireSuperadmin } from "../auth";
import { generatePropuestaComercialPdf } from "../services/pdf-propuesta-comercial";

export function registerPropuestaComercialRoutes(app: Express) {
  app.post(
    "/api/propuesta-comercial/pdf",
    requireAuth,
    requireSuperadmin,
    async (req, res) => {
      try {
        const pdfBuffer = await generatePropuestaComercialPdf(req.body);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="SST-Colombia-Propuesta-Comercial.pdf"'
        );
        res.send(pdfBuffer);
      } catch (err: any) {
        console.error("Error generando propuesta comercial PDF:", err);
        res.status(500).json({ error: "Error al generar el PDF" });
      }
    }
  );

  // GET para descarga directa sin parámetros (valores por defecto)
  app.get(
    "/api/propuesta-comercial/pdf",
    requireAuth,
    requireSuperadmin,
    async (_req, res) => {
      try {
        const pdfBuffer = await generatePropuestaComercialPdf({});
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="SST-Colombia-Propuesta-Comercial.pdf"'
        );
        res.send(pdfBuffer);
      } catch (err: any) {
        console.error("Error generando propuesta comercial PDF:", err);
        res.status(500).json({ error: "Error al generar el PDF" });
      }
    }
  );
}
