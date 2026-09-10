/**
 * Monitor de seguridad de sesiones.
 * Cierra sesiones inactivas.
 * Se ejecuta cada minuto.
 */
import { db } from "../db";
import { sql } from "drizzle-orm";
import logger from "../lib/logger";
import { processSecurityAlert } from "../services/security-access";

// Debe coincidir con el límite aplicado por server/auth.ts y el guardia del cliente.
const SESSION_IDLE_MINUTES = 8 * 60;

async function closeExpiredSessions() {
  const result = await db.execute(sql`
    UPDATE user_sessions_log
    SET is_active = false,
        logout_at = now(),
        duration_minutes = EXTRACT(EPOCH FROM (now() - login_at)) / 60,
        alert_type = 'idle_timeout',
        alert_note = CONCAT_WS(
          ' | ',
          alert_note,
          ${`Sesión cerrada automáticamente después de ${SESSION_IDLE_MINUTES} minutos de inactividad`}::text
        )
    WHERE is_active = true
      AND COALESCE(last_activity_at, login_at) <= now() - (${SESSION_IDLE_MINUTES} * interval '1 minute')
    RETURNING id, user_id, ip_address, user_agent
  `);
  const rows = ((result as any).rows ?? []) as Array<{
    id: string;
    user_id: string;
    ip_address: string | null;
    user_agent: string | null;
  }>;
  if (rows.length > 0) {
    logger.info({ count: rows.length }, `[SESSION-MONITOR] ${rows.length} sesión(es) cerradas por inactividad`);
    for (const row of rows) {
      void processSecurityAlert({
        sessionRecordId: row.id,
        userId: row.user_id,
        eventType: "idle_timeout",
        decision: "allowed",
        ip: row.ip_address || "unknown",
        userAgent: row.user_agent || null,
      });
    }
  }
}

export async function checkSessionTimeouts() {
  try {
    await closeExpiredSessions();
  } catch (err) {
    logger.error({ err }, "[SESSION-MONITOR] Error en checkSessionTimeouts");
  }
}

export function registerSessionMonitorCron() {
  const INTERVAL_MS = 60 * 1000;
  setInterval(checkSessionTimeouts, INTERVAL_MS);
  // Ejecutar una vez al arrancar
  checkSessionTimeouts();
  logger.info("[SESSION-MONITOR] Monitor de seguridad de sesiones registrado (cada 1 min)");
}
