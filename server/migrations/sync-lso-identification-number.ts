import { db } from "../db";
import { sql } from "drizzle-orm";

export async function syncLsoIdentificationNumber() {
  try {
    await db.execute(sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS sst_identification_number TEXT
    `);
    await db.execute(sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS sst_course_50_hours BOOLEAN DEFAULT false
    `);
    await db.execute(sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS sst_course_50_hours_date DATE
    `);
    console.log("[Migration] Added sst_identification_number and sst_course_50_hours columns to users table");
  } catch (error: any) {
    console.error("[Migration] Error adding LSO profile columns:", error.message);
  }
}
