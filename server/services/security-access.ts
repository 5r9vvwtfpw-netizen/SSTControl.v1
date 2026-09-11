import { isIP } from "net";
import { db } from "../db";
import { sql } from "drizzle-orm";
import logger from "../lib/logger";

export type SecurityEventType =
  | "unauthorized_ip"
  | "blocked_unauthorized_ip"
  | "simultaneous"
  | "long_session"
  | "idle_timeout";

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
    // Las alertas de seguridad se consultan exclusivamente desde el panel de
    // actividad. Conservamos la geolocalización del evento, sin enviar correos.
    await enrichSessionLocation(params.sessionRecordId, params.ip);
  } catch (error) {
    logger.error({ error, params }, "[SECURITY] Error procesando alerta");
  }
}