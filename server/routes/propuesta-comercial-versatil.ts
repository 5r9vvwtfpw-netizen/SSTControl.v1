import type { Express } from "express";
import { requireAuth, requireSuperadmin } from "../auth";
import { propuestaComercialSchema } from "@shared/propuesta-comercial";
import { generateVersatilePropuestaPdf } from "../services/pdf-propuesta-comercial-versatil";

export function registerVersatilePropuestaRoutes(app: Express) {
  app.post("/api/propuesta-comercial/versatil/pdf", requireAuth, requireSuperadmin, async (req, res) => {
    const parsed = propuestaComercialSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || "Los datos enviados no son válidos." });
    }

    try {
      const pdf = await generateVersatilePropuestaPdf(parsed.data);
      const slug = parsed.data.empresa
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "cliente";
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="Propuesta-Comercial-${slug}.pdf"`);
      res.setHeader("Cache-Control", "private, no-store");
      return res.send(pdf);
    } catch (error) {
      console.error("[Propuesta comercial] Error al generar PDF:", error);
      return res.status(500).json({ error: "No se pudo generar la propuesta. Intenta nuevamente." });
    }
  });
}
