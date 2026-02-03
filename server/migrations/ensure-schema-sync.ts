import { db } from "../db";
import { sql } from "drizzle-orm";

export async function ensureSchemaSync(): Promise<void> {
  console.log("[Schema Sync] Checking schema synchronization...");
  
  try {
    // Check if column exists using the same db connection
    const result = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'objetivos_sst' 
      AND column_name = 'porcentaje_avance'
    `);
    
    const rows = result.rows || result;
    const columnExists = Array.isArray(rows) && rows.length > 0;
    
    if (!columnExists) {
      console.log("[Schema Sync] Adding missing column 'porcentaje_avance' to objetivos_sst...");
      await db.execute(sql`
        ALTER TABLE objetivos_sst 
        ADD COLUMN IF NOT EXISTS porcentaje_avance integer DEFAULT 0
      `);
      console.log("[Schema Sync] ✅ Column 'porcentaje_avance' added successfully");
    } else {
      console.log("[Schema Sync] ✅ Column 'porcentaje_avance' already exists");
    }
    
    console.log("[Schema Sync] Schema synchronization complete");
  } catch (error: any) {
    console.error("[Schema Sync] ❌ Error during schema sync:", error?.message || error);
    // Re-throw to ensure the error is visible
    throw error;
  }
}
