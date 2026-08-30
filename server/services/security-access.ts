import { isIP } from "net";
import { db } from "../db";
import { sql } from "drizzle-orm";
import logger from "../lib/logger";
import { sendSecurityAccessAlertEmail } from "../email";

export type SecurityEventType =
  | "unauthorized_ip"
  | "blocked_unauthorized_ip"
  | "simultaneous"
  | "long_session";

interface GeoResult {
  status: "resolved" | "private" | "unavailable";
  country: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
  isp: string | null;
  latitude: string | null;
  longitude: string | null;
}

const geoCache = new Map<string, { expiresAt: number; value: GeoResult }>();
const GEO_CACHE_MS = 24 * 60 * 60 * 1000;

function unavailable(status: GeoResult["status"]): GeoResult {
  return { status, country: null, region: null, city: null, timezone: null, isp: null, latitude: null, longitude: null };
}

function isPrivateIp(ip: string): boolean {
  if (ip === "unknown" || ip === "::1" || ip === "127.0.0.1") return true;
  if (isIP(ip) === 4) {
    const [a, b] = ip.split(".").map(Number);
    return a === 10 || a === 127 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 169 && b === 254);
  }
  return ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("fe80");
}

export async function geolocateIp(ip: string): Promise<GeoResult> {
  const cached = geoCache.get(ip);
  if (cached && cached.expiresAt > Date.now()) return cached.value;
  if (!isIP(ip) || isPrivateIp(ip)) return unavailable("private");

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const response = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      signal: controller.signal,
      headers: { "User-Agent": "SST-Colombia-Security/1.0" },
    });
    clearTimeout(timeout);
    if (!response.ok) throw new Error(`GeoIP HTTP ${response.status}`);
    const data: any = await response.json();
    if (!data.success) throw new Error(data.message || "GeoIP sin resultado");
    const value: GeoResult = {
      status: "resolved",
      country: data.country || null,
      region: data.region || null,
      city: data.city || null,
      timezone: data.timezone?.id || null,
      isp: data.connection?.isp || null,
      latitude: data.latitude == null ? null : String(data.latitude),
      longitude: data.longitude == null ? null : String(data.longitude),
    };
    geoCache.set(ip, { expiresAt: Date.now() + GEO_CACHE_MS, value });
    return value;
  } catch (error) {
    logger.warn({ ip, error }, "[SECURITY] No fue posible geolocalizar la IP");
    return unavailable("unavailable");
  }
}

const eventLabels: Record<SecurityEventType, string> = {
  unauthorized_ip: "IP no autorizada",
  blocked_unauthorized_ip: "Bloqueo por reiteración de IP no autorizada",
  simultaneous: "Sesión simultánea",
  long_session: "Sesión superior a ocho horas",
};

export async function enrichSessionLocation(sessionRecordId: string, ip: string): Promise<GeoResult> {
  const geo = await geolocateIp(ip);
  await db.execute(sql`
    UPDATE user_sessions_log
    SET geo_country = ${geo.country},
        geo_region = ${geo.region},
        geo_city = ${geo.city},
        geo_timezone = ${geo.timezone},
        geo_isp = ${geo.isp},
        geo_latitude = ${geo.latitude},
        geo_longitude = ${geo.longitude},
        geo_status = ${geo.status}
    WHERE id = ${sessionRecordId}
  `);
  return geo;
}

export async function processSecurityAlert(params: {
  sessionRecordId: string;
  userId: string;
  eventType: SecurityEventType;
  decision: "allowed" | "blocked";
  ip: string;
  userAgent: string | null;
}): Promise<void> {
  try {
    const geo = await enrichSessionLocation(params.sessionRecordId, params.ip);
    const userResult = await db.execute(sql`
      SELECT id, username, full_name, role
      FROM users
      WHERE id = ${params.userId}
      LIMIT 1
    `);
    const user: any = (userResult as any).rows?.[0];
    if (!user) return;

    const adminResult = await db.execute(sql`
      SELECT DISTINCT email
      FROM users
      WHERE role = 'superadmin' AND email IS NOT NULL AND email <> ''
    `);
    const recipients = ((adminResult as any).rows ?? []).map((row: any) => row.email as string);
    const location = [geo.city, geo.region, geo.country].filter(Boolean).join(", ") || null;

    const emailEnabled = process.env.NODE_ENV === "production" ||
      process.env.SECURITY_ALERT_EMAILS_ENABLED === "true";
    if (!emailEnabled) {
      logger.info(
        { eventType: params.eventType, userId: params.userId, recipients: recipients.length },
        "[SECURITY] Correo de alerta suprimido fuera de producción",
      );
      return;
    }

    const results = await Promise.allSettled(recipients.map((to: string) =>
      sendSecurityAccessAlertEmail({
        to,
        userName: user.full_name || user.username,
        username: user.username,
        role: user.role,
        eventLabel: eventLabels[params.eventType],
        decision: params.decision,
        ip: params.ip,
        device: params.userAgent,
        location,
        occurredAt: new Date(),
      })
    ));
    const failed = results.filter((result) =>
      result.status === "rejected" || (result.status === "fulfilled" && !result.value.success)
    ).length;
    if (failed) logger.warn({ failed, recipients: recipients.length }, "[SECURITY] Algunas alertas por correo no se enviaron");
  } catch (error) {
    logger.error({ error, params }, "[SECURITY] Error procesando alerta");
  }
}