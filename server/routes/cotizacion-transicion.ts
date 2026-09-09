import { Express } from "express";
import { requireAuth, requireSuperadmin } from "../auth";
import { generateCotizacionTransicionPdf, type CotizacionTransicionParams } from "../services/pdf-cotizacion-transicion";

export function registerCotizacionTransicionRoutes(app: Express) {
  app.post(
    "/api/cotizacion-transicion/pdf",
    requireAuth,
    requireSuperadmin,
    async (req, res) => {
      try {
        const body = req.body as Partial<CotizacionTransicionParams>;
        if (!body.empresa?.trim()) {
          return res.status(400).json({ error: "La empresa destinataria es requerida" });
        }
        const pdfBuffer = await generateCotizacionTransicionPdf({
          empresa: body.empresa,
          nit: body.nit,
          ciudad: body.ciudad,
          tarifaHora: body.tarifaHora,
          horasMinimas: body.horasMinimas,
          horasPorSesion: body.horasPorSesion,
          vigenciaDias: body.vigenciaDias,
          nombreProveedor: body.nombreProveedor,
          nitProveedor: body.nitProveedor,
          email: body.email,
          whatsapp: body.whatsapp,
          fechaEmision: body.fechaEmision,
          mensajePrincipal: body.mensajePrincipal,
        });
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", 'attachment; filename="Cotizacion-Transicion-SST-PESV.pdf"');
        res.send(pdfBuffer);
      } catch (error: any) {
        console.error("Error generando cotización de transición:", error);
        res.status(500).json({ error: "Error al generar la cotización" });
      }
    },
  );
}