import { db } from "../db";
import { sql } from "drizzle-orm";

export async function syncUserRoleEnum() {
  try {
    await db.execute(sql.raw(`ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'tecnico_mecanico'`));
    console.log('[Migration] ✅ Enum user_role: valor tecnico_mecanico sincronizado');
  } catch (error: any) {
    console.log('[Migration] ℹ️ user_role enum sync:', error.message);
  }
}
