import { db } from "../db";
import { sql } from "drizzle-orm";

export async function createUserSessionsLog() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_sessions_log (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        session_id TEXT,
        ip_address TEXT,
        user_agent TEXT,
        device_id TEXT,
        access_decision TEXT NOT NULL DEFAULT 'allowed',
        geo_country TEXT,
        geo_region TEXT,
        geo_city TEXT,
        geo_timezone TEXT,
        geo_isp TEXT,
        geo_latitude TEXT,
        geo_longitude TEXT,
        geo_status TEXT,
        login_at TIMESTAMP NOT NULL DEFAULT now(),
        last_activity_at TIMESTAMP DEFAULT now(),
        logout_at TIMESTAMP,
        duration_minutes INTEGER,
        is_active BOOLEAN NOT NULL DEFAULT true,
        is_suspicious BOOLEAN NOT NULL DEFAULT false,
        alert_type TEXT,
        alert_note TEXT
      )
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_user_sessions_log_user_id ON user_sessions_log(user_id)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_user_sessions_log_is_active ON user_sessions_log(is_active)
    `);
    await db.execute(sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS authorized_ips TEXT[] DEFAULT '{}'
    `);
    await db.execute(sql`
      ALTER TABLE user_sessions_log
        ADD COLUMN IF NOT EXISTS device_id TEXT,
        ADD COLUMN IF NOT EXISTS access_decision TEXT NOT NULL DEFAULT 'allowed',
        ADD COLUMN IF NOT EXISTS geo_country TEXT,
        ADD COLUMN IF NOT EXISTS geo_region TEXT,
        ADD COLUMN IF NOT EXISTS geo_city TEXT,
        ADD COLUMN IF NOT EXISTS geo_timezone TEXT,
        ADD COLUMN IF NOT EXISTS geo_isp TEXT,
        ADD COLUMN IF NOT EXISTS geo_latitude TEXT,
        ADD COLUMN IF NOT EXISTS geo_longitude TEXT,
        ADD COLUMN IF NOT EXISTS geo_status TEXT
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_user_sessions_unauthorized_window
      ON user_sessions_log(user_id, login_at)
      WHERE alert_type = 'unauthorized_ip' AND access_decision = 'allowed'
    `);
    console.log("[Migration] ✅ Tabla user_sessions_log y columna authorized_ips creadas");
  } catch (error: any) {
    console.error("[Migration] Error en create-user-sessions-log:", error.message);
  }
}
