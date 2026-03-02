import { db } from "../db";
import { sql } from "drizzle-orm";

export async function syncUnassignedAtColumn() {
  try {
    await db.execute(sql`
      ALTER TABLE licensed_professional_assignments ADD COLUMN IF NOT EXISTS unassigned_at TIMESTAMP
    `);
    console.log("[Migration] ✅ Columna unassigned_at sincronizada en licensed_professional_assignments");
  } catch (error: any) {
    console.error("[Migration] Error adding unassigned_at column:", error.message);
  }
}
