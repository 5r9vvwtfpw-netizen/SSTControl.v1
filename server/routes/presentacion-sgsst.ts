import type { Express } from "express";
import { requireAuth, requireSuperadmin } from "../auth";
import { presentacionSgsstSchema, presentacionSgsstFilename } from "@shared/presentacion-sgsst";
import { generatePresentacionSgsstPdf } from "../services/pdf-presentacion-sgsst";

export function registerPresentacionSgsstRoutes(app: Express): void {
  app.post("/api/presentacion-sgsst/pdf", requireAuth, requireSuperadmin, async (req, res) => {
    const parsed = presentacionSgsstSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || "Los datos enviados no son válidos." });
    }
    try {
      const buffer = await generatePresentacionSgsstPdf(parsed.data);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${presentacionSgsstFilename(parsed.data.empresa)}"`);
      res.setHeader("Cache-Control", "private, no-store");
      return res.send(buffer);
    } catch (error) {
      console.error("[Presentación SG-SST] No se pudo generar el PDF:", error instanceof Error ? error.message : "Error desconocido");
      return res.status(500).json({ error: "No se pudo generar la presentación. Intente nuevamente." });
    }
  });
}