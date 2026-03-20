import { db } from "../db";
import { sql } from "drizzle-orm";

export async function syncLoginTrackingColumns() {
  try {
    await db.execute(sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP
    `);
    await db.execute(sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0
    `);
    await db.execute(sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_ip TEXT
    `);
    console.log("[Migration] ✅ Columnas de tracking de login sincronizadas en users");
  } catch (error: any) {
    console.error("[Migration] Error adding login tracking columns:", error.message);
  }
}
