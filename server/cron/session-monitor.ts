/**
 * Cron: Monitor de sesiones largas
 * Marca como sospechosas las sesiones activas que superen 8 horas continuas.
 * Se ejecuta cada hora.
 */
import { db } from "../db";
import { sql } from "drizzle-orm";
import logger from "../lib/logger";
import { processSecurityAlert } from "../services/security-access";

const MAX_SESSION_HOURS = 8;

export async function checkLongSessions() {
  try {
    const result = await db.execute(sql`
      UPDATE user_sessions_log
      SET is_suspicious = true,
          alert_type = COALESCE(alert_type, 'long_session'),
          alert_note = COALESCE(alert_note, 'Sesión activa superó las ' || ${MAX_SESSION_HOURS} || ' horas continuas')
      WHERE is_active = true
        AND is_suspicious = false
        AND EXTRACT(EPOCH FROM (now() - login_at)) / 3600 > ${MAX_SESSION_HOURS}
      RETURNING id, user_id, ip_address, user_agent, login_at
    `);

    const rows = (result as any).rows ?? [];
    if (rows.length > 0) {
      logger.warn({ count: rows.length }, `[SESSION-MONITOR] ${rows.length} sesión(es) larga(s) marcadas como sospechosas`);
      for (const row of rows) {
        void processSecurityAlert({
          sessionRecordId: row.id,
          userId: row.user_id,
          eventType: "long_session",
          decision: "allowed",
          ip: row.ip_address || "unknown",
          userAgent: row.user_agent || null,
        });
      }
    }
  } catch (err) {
    logger.error({ err }, "[SESSION-MONITOR] Error en checkLongSessions");
  }
}

export function registerSessionMonitorCron() {
  // Ejecutar cada hora
  const INTERVAL_MS = 60 * 60 * 1000;
  setInterval(checkLongSessions, INTERVAL_MS);
  // Ejecutar una vez al arrancar
  checkLongSessions();
  logger.info("[SESSION-MONITOR] Monitor de sesiones largas registrado (cada 1h)");
}
