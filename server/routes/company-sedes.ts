import type { Express } from "express";
import { db } from "../db";
import { companySedes, workers, insertCompanySedeSchema } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth as authRequireAuth, requirePermission } from "../auth";
import { z } from "zod";

const updateSedeSchema = insertCompanySedeSchema.partial().omit({ companyId: true });
const assignSedeSchema = z.object({
  sedeId: z.string().min(1).nullable(),
});

export function registerCompanySedesRoutes(app: Express) {
  app.get("/api/company-sedes", authRequireAuth, requirePermission("companies:view"), async (req, res) => {
    try {
      const user = req.user as any;
      if (!user.companyId) return res.json([]);

      const sedes = await db.select().from(companySedes)
        .where(eq(companySedes.companyId, user.companyId))
        .orderBy(companySedes.isMain, companySedes.name);

      const sedesWithCount = await Promise.all(sedes.map(async (sede) => {
        const [result] = await db.select({ count: sql<number>`count(*)::int` })
          .from(workers)
          .where(and(eq(workers.sedeId, sede.id), eq(workers.companyId, user.companyId)));
        return { ...sede, workerCount: result?.count || 0 };
      }));

      res.json(sedesWithCount);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/company-sedes/:id", authRequireAuth, requirePermission("companies:view"), async (req, res) => {
    try {
      const user = req.user as any;
      const [sede] = await db.select().from(companySedes)
        .where(and(eq(companySedes.id, req.params.id), eq(companySedes.companyId, user.companyId)));
      if (!sede) return res.status(404).json({ error: "Sede no encontrada" });
      res.json(sede);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/company-sedes", authRequireAuth, requirePermission("companies:create"), async (req, res) => {
    try {
      const user = req.user as any;
      if (!user.companyId) return res.status(400).json({ error: "Usuario sin empresa" });

      const parsed = insertCompanySedeSchema.safeParse({ ...req.body, companyId: user.companyId });
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });

      const [sede] = await db.insert(companySedes).values(parsed.data).returning();
      res.status(201).json(sede);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/company-sedes/:id", authRequireAuth, requirePermission("companies:create"), async (req, res) => {
    try {
      const user = req.user as any;
      const [existing] = await db.select().from(companySedes)
        .where(and(eq(companySedes.id, req.params.id), eq(companySedes.companyId, user.companyId)));
      if (!existing) return res.status(404).json({ error: "Sede no encontrada" });

      const parsed = updateSedeSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });

      const [updated] = await db.update(companySedes)
        .set(parsed.data)
        .where(eq(companySedes.id, req.params.id))
        .returning();
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/company-sedes/:id", authRequireAuth, requirePermission("companies:create"), async (req, res) => {
    try {
      const user = req.user as any;
      const [existing] = await db.select().from(companySedes)
        .where(and(eq(companySedes.id, req.params.id), eq(companySedes.companyId, user.companyId)));
      if (!existing) return res.status(404).json({ error: "Sede no encontrada" });

      const [workerCount] = await db.select({ count: sql<number>`count(*)::int` })
        .from(workers).where(eq(workers.sedeId, req.params.id));
      if (workerCount && workerCount.count > 0) {
        return res.status(400).json({ error: `No se puede eliminar: ${workerCount.count} trabajadores asignados` });
      }

      await db.delete(companySedes).where(eq(companySedes.id, req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/workers/:id/sede", authRequireAuth, requirePermission("workers:edit"), async (req, res) => {
    try {
      const user = req.user as any;
      const parsed = assignSedeSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });

      const { sedeId } = parsed.data;

      if (sedeId) {
        const [sede] = await db.select().from(companySedes)
          .where(and(eq(companySedes.id, sedeId), eq(companySedes.companyId, user.companyId)));
        if (!sede) return res.status(400).json({ error: "Sede no válida" });
      }

      const [updated] = await db.update(workers)
        .set({ sedeId: sedeId || null })
        .where(and(eq(workers.id, req.params.id), eq(workers.companyId, user.companyId)))
        .returning();
      if (!updated) return res.status(404).json({ error: "Trabajador no encontrado" });
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}
