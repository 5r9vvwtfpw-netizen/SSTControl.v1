/**
 * Monitor de seguridad de sesiones.
 * Cierra sesiones inactivas o vencidas y marca sesiones largas como sospechosas.
 * Se ejecuta cada minuto.
 */
import { db } from "../db";
import { sql } from "drizzle-orm";
import logger from "../lib/logger";
import { processSecurityAlert } from "../services/security-access";

const MAX_SESSION_HOURS = 8;
const ABSOLUTE_SESSION_HOURS = 12;
const IDLE_SESSION_MINUTES = 30;

async function closeExpiredSessions() {
  const result = await db.execute(sql`
    UPDATE user_sessions_log
    SET is_active = false,
        logout_at = now(),
        duration_minutes = EXTRACT(EPOCH FROM (now() - login_at)) / 60,
        alert_type = CASE
          WHEN login_at <= now() - (${ABSOLUTE_SESSION_HOURS} * interval '1 hour')
          THEN 'absolute_timeout'
          ELSE 'idle_timeout'
        END,
        alert_note = CONCAT_WS(
          ' | ',
          alert_note,
          CASE
            WHEN login_at <= now() - (${ABSOLUTE_SESSION_HOURS} * interval '1 hour')
            THEN ${`Sesión cerrada automáticamente al alcanzar el límite máximo de ${ABSOLUTE_SESSION_HOURS} horas`}::text
            ELSE ${`Sesión cerrada automáticamente después de ${IDLE_SESSION_MINUTES} minutos sin actividad`}::text
          END
        )
    WHERE is_active = true
      AND (
        COALESCE(last_activity_at, login_at) <= now() - (${IDLE_SESSION_MINUTES} * interval '1 minute')
        OR login_at <= now() - (${ABSOLUTE_SESSION_HOURS} * interval '1 hour')
      )
    RETURNING id
  `);
  const count = ((result as any).rows ?? []).length;
  if (count > 0) {
    logger.info({ count }, `[SESSION-MONITOR] ${count} sesión(es) cerradas automáticamente`);
  }
}

export async function checkLongSessions() {
  try {
    await closeExpiredSessions();
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
  const INTERVAL_MS = 60 * 1000;
  setInterval(checkLongSessions, INTERVAL_MS);
  // Ejecutar una vez al arrancar
  checkLongSessions();
  logger.info("[SESSION-MONITOR] Monitor de seguridad de sesiones registrado (cada 1 min)");
}
