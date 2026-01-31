import { sql } from 'drizzle-orm';
import { db } from '../db';

/**
 * Migration: Add External LSO columns to responsible_designations
 * 
 * Adds support for external LSO professionals (non-employee professionals)
 * as responsible parties for "Responsable del SG-SST" position.
 * Required for Resolution 0312/2019 compliance.
 */
export async function syncExternalLsoColumns(): Promise<void> {
  console.log('[Migration] Sincronizando columnas is_external_lso y external_lso_name...');
  
  try {
    // Directly add columns using IF NOT EXISTS - this is idempotent and safe
    // This approach avoids potential issues with information_schema queries across different PostgreSQL providers
    console.log('[Migration] Ejecutando ALTER TABLE para is_external_lso...');
    await db.execute(sql`
      ALTER TABLE responsible_designations 
      ADD COLUMN IF NOT EXISTS is_external_lso BOOLEAN DEFAULT FALSE
    `);
    console.log('[Migration] ✅ Columna is_external_lso verificada/agregada');

    console.log('[Migration] Ejecutando ALTER TABLE para external_lso_name...');
    await db.execute(sql`
      ALTER TABLE responsible_designations 
      ADD COLUMN IF NOT EXISTS external_lso_name TEXT
    `);
    console.log('[Migration] ✅ Columna external_lso_name verificada/agregada');

    console.log('[Migration] ✅ Columnas LSO externo sincronizadas correctamente');
  } catch (error: any) {
    console.error('[Migration] ✗ Error sincronizando columnas LSO externo:', error.message);
    console.error('[Migration] Stack:', error.stack);
    // Don't throw - let the app continue and fail gracefully on queries if columns don't exist
    // This prevents the app from crashing completely
  }
}
