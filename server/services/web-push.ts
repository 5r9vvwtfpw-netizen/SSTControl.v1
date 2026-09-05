import webpush from "web-push";
import { eq } from "drizzle-orm";
import * as schema from "@shared/schema";
import { db } from "../db";
import { decrypt, encrypt, isEncryptionEnabled, type EncryptedData } from "../lib/crypto";
import { storage } from "../storage";

const VAPID_CONFIG_KEY = "web_push_vapid";
const VAPID_CONTEXT = "web-push:vapid-private-key";
let configuredPublicKey: string | null = null;

export type WorkerPushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  badgeCount?: number;
};

function safePortalPath(value?: string): string {
  return value && /^\/(portal-empleados)(?:\/|$)/.test(value) ? value : "/portal-empleados";
}

async function configureVapid(): Promise<string | null> {
  if (!isEncryptionEnabled()) return null;
  if (configuredPublicKey) return configuredPublicKey;

  const [stored] = await db.select().from(schema.appConfig)
    .where(eq(schema.appConfig.key, VAPID_CONFIG_KEY)).limit(1);
  if (stored) {
    const saved = JSON.parse(stored.value) as { publicKey: string; privateKey: EncryptedData };
    webpush.setVapidDetails("mailto:security@sstcolombia.com", saved.publicKey, decrypt(saved.privateKey, VAPID_CONTEXT));
    configuredPublicKey = saved.publicKey;
    return configuredPublicKey;
  }

  const keys = webpush.generateVAPIDKeys();
  const value = JSON.stringify({
    publicKey: keys.publicKey,
    privateKey: encrypt(keys.privateKey, VAPID_CONTEXT),
  });
  try {
    await db.insert(schema.appConfig).values({ key: VAPID_CONFIG_KEY, value });
  } catch (error: any) {
    // A concurrent instance may have generated the one canonical key.
    if (error?.code !== "23505") throw error;
    return configureVapid();
  }
  webpush.setVapidDetails("mailto:security@sstcolombia.com", keys.publicKey, keys.privateKey);
  configuredPublicKey = keys.publicKey;
  return configuredPublicKey;
}

export async function getWebPushPublicKey(): Promise<{ enabled: boolean; publicKey?: string }> {
  try {
    const publicKey = await configureVapid();
    return publicKey ? { enabled: true, publicKey } : { enabled: false };
  } catch {
    // Do not include VAPID/decryption details in logs.
    console.error("[WebPush] VAPID unavailable; push disabled");
    return { enabled: false };
  }
}

export async function sendPushToUser(userId: string, payload: WorkerPushPayload): Promise<void> {
  try {
    if (!(await configureVapid())) return;
    const subscriptions = await db.select().from(schema.pushSubscriptions)
      .where(eq(schema.pushSubscriptions.userId, userId));
    const notification = JSON.stringify({
      title: payload.title.slice(0, 120),
      body: payload.body.slice(0, 240),
      url: safePortalPath(payload.url),
      tag: (payload.tag || "sst-portal").slice(0, 80),
      badgeCount: Math.max(0, Math.floor(payload.badgeCount || 0)),
    });
    await Promise.all(subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification({
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.p256dh, auth: subscription.auth },
        }, notification);
      } catch (error: any) {
        if (error?.statusCode === 404 || error?.statusCode === 410) {
          await db.delete(schema.pushSubscriptions).where(eq(schema.pushSubscriptions.endpoint, subscription.endpoint));
        } else {
          console.error("[WebPush] Delivery failed", { userId, statusCode: error?.statusCode });
        }
      }
    }));
  } catch {
    // Notifications must never roll back the originating business action.
    console.error("[WebPush] Unable to deliver notifications");
  }
}

export async function sendInternalMessagePush(message: schema.InternalMessage): Promise<void> {
  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, message.receiverId)).limit(1);
  let badgeCount = await storage.getUnreadMessageCount(message.receiverId, message.companyId);
  let workerId = user?.workerId;
  if (!workerId && user?.email) {
    workerId = (await storage.getWorkerByEmail(user.email, message.companyId))?.id ?? null;
  }
  if (workerId) {
    const [attendees, exams] = await Promise.all([
      storage.getAsistentesByWorker(workerId),
      storage.getMedicalExamsByWorker(workerId, message.companyId),
    ]);
    badgeCount += attendees.filter((item) => item.estado === "invitado").length;
    badgeCount += exams.filter((item) => item.notificationSentAt && !item.readConfirmedAt).length;
  }
  await sendPushToUser(message.receiverId, {
    title: message.subject,
    body: message.content,
    url: "/portal-empleados",
    tag: `internal-message-${message.id}`,
    badgeCount,
  });
}