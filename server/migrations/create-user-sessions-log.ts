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
    console.log("[Migration] ✅ Tabla user_sessions_log y columna authorized_ips creadas");
  } catch (error: any) {
    console.error("[Migration] Error en create-user-sessions-log:", error.message);
  }
}
