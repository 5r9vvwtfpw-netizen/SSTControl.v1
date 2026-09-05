import type { Express } from "express";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { pushSubscriptions } from "@shared/schema";
import { db } from "../db";
import { requireAuth } from "../auth";
import { getWebPushPublicKey } from "../services/web-push";
import { storage } from "../storage";

const subscriptionSchema = z.object({
  endpoint: z.string().url().max(4096),
  keys: z.object({
    p256dh: z.string().min(1).max(1024),
    auth: z.string().min(1).max(1024),
  }),
});
const deleteSchema = z.object({ endpoint: z.string().url().max(4096) });
const testNotificationCooldown = new Map<string, number>();

export function registerWebPushRoutes(app: Express): void {
  app.get("/api/web-push/public-key", requireAuth, async (_req, res) => {
    res.json(await getWebPushPublicKey());
  });

  app.post("/api/web-push/subscriptions", requireAuth, async (req, res) => {
    const parsed = subscriptionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Suscripción inválida" });
    try {
      const { endpoint, keys } = parsed.data;
      await db.insert(pushSubscriptions).values({ userId: req.user!.id, endpoint, p256dh: keys.p256dh, auth: keys.auth })
        .onConflictDoUpdate({ target: pushSubscriptions.endpoint, set: { userId: req.user!.id, p256dh: keys.p256dh, auth: keys.auth, updatedAt: new Date() } });
      res.status(204).end();
    } catch (error) {
      console.error("[WebPush] Could not save subscription", error);
      res.status(503).json({ error: "Notificaciones no disponibles" });
    }
  });

  app.delete("/api/web-push/subscriptions", requireAuth, async (req, res) => {
    const parsed = deleteSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Endpoint inválido" });
    await db.delete(pushSubscriptions).where(and(
      eq(pushSubscriptions.endpoint, parsed.data.endpoint),
      eq(pushSubscriptions.userId, req.user!.id),
    ));
    res.status(204).end();
  });

  app.post("/api/web-push/test", requireAuth, async (req, res) => {
    const user = req.user!;
    if (user.role !== "trabajador" || !user.companyId) {
      return res.status(403).json({ error: "Disponible únicamente para trabajadores" });
    }
    const lastTest = testNotificationCooldown.get(user.id) || 0;
    if (Date.now() - lastTest < 60_000) {
      return res.status(429).json({ error: "Espera un minuto antes de repetir la prueba" });
    }
    testNotificationCooldown.set(user.id, Date.now());
    res.status(202).json({ message: "La notificación llegará en aproximadamente 10 segundos." });

    setTimeout(() => {
      void storage.createInternalMessage({
        companyId: user.companyId!,
        senderId: user.id,
        senderName: "Portal de Empleados SST",
        senderRole: user.role,
        receiverId: user.id,
        receiverName: user.fullName || user.username,
        receiverRole: user.role,
        subject: "Notificación de prueba",
        content: "Las notificaciones están funcionando correctamente en este dispositivo.",
        priority: "normal",
        status: "unread",
        relatedEntity: "web_push_test",
      }).catch((error) => {
        console.error("[WebPush] Could not create test notification", { userId: user.id, error });
      });
    }, 10_000);
  });
}