import { db } from "../db";
import { sql } from "drizzle-orm";

export async function addGpsWebhookKey() {
  try {
    await db.execute(sql.raw(`ALTER TABLE companies ADD COLUMN IF NOT EXISTS gps_webhook_key TEXT`));
    console.log('[Migration] ✅ Columna gps_webhook_key agregada a companies');
  } catch (error: any) {
    console.log('[Migration] ℹ️ gps_webhook_key:', error.message);
  }
}
