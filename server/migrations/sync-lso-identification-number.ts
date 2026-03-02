import { db } from "../db";
import { sql } from "drizzle-orm";

export async function syncLsoIdentificationNumber() {
  try {
    await db.execute(sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS sst_identification_number TEXT
    `);
    console.log("[Migration] Added sst_identification_number column to users table");
  } catch (error: any) {
    console.error("[Migration] Error adding sst_identification_number:", error.message);
  }
}
