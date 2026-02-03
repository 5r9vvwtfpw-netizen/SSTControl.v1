import { db } from "../db";
import { sql } from "drizzle-orm";

export async function ensureSchemaSync(): Promise<void> {
  console.log("[Schema Sync] Checking schema synchronization...");
  
  try {
    // 1. Check porcentaje_avance column in objetivos_sst
    const columnResult = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'objetivos_sst' 
      AND column_name = 'porcentaje_avance'
    `);
    
    const columnRows = columnResult.rows || columnResult;
    const columnExists = Array.isArray(columnRows) && columnRows.length > 0;
    
    if (!columnExists) {
      console.log("[Schema Sync] Adding missing column 'porcentaje_avance' to objetivos_sst...");
      await db.execute(sql`
        ALTER TABLE objetivos_sst 
        ADD COLUMN IF NOT EXISTS porcentaje_avance integer DEFAULT 0
      `);
      console.log("[Schema Sync] ✅ Column 'porcentaje_avance' added");
    } else {
      console.log("[Schema Sync] ✅ Column 'porcentaje_avance' exists");
    }
    
    // 2. Check objetivos_estandares_vinculacion table
    const tableResult = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'objetivos_estandares_vinculacion'
    `);
    
    const tableRows = tableResult.rows || tableResult;
    const tableExists = Array.isArray(tableRows) && tableRows.length > 0;
    
    if (!tableExists) {
      console.log("[Schema Sync] Creating missing table 'objetivos_estandares_vinculacion'...");
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS objetivos_estandares_vinculacion (
          id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
          company_id VARCHAR(255) NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
          objetivo_id VARCHAR(255) NOT NULL REFERENCES objetivos_sst(id) ON DELETE CASCADE,
          estandar_id VARCHAR(255) NOT NULL REFERENCES sst_standards(id) ON DELETE CASCADE,
          peso INTEGER DEFAULT 100,
          notas TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(objetivo_id, estandar_id)
        )
      `);
      
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_vinculacion_company 
        ON objetivos_estandares_vinculacion(company_id)
      `);
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_vinculacion_objetivo 
        ON objetivos_estandares_vinculacion(objetivo_id)
      `);
      await db.execute(sql`
        CREATE INDEX IF NOT EXISTS idx_vinculacion_estandar 
        ON objetivos_estandares_vinculacion(estandar_id)
      `);
      
      console.log("[Schema Sync] ✅ Table 'objetivos_estandares_vinculacion' created with indexes");
    } else {
      console.log("[Schema Sync] ✅ Table 'objetivos_estandares_vinculacion' exists");
    }
    
    console.log("[Schema Sync] Schema synchronization complete");
  } catch (error: any) {
    console.error("[Schema Sync] ❌ Error during schema sync:", error?.message || error);
    throw error;
  }
}
