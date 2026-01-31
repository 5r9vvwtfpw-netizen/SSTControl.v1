import { sql } from 'drizzle-orm';
import { db } from '../db';

/**
 * Migration: Add all missing columns to responsible_designations
 * 
 * Adds support for:
 * - External LSO professionals (non-employee professionals) for "Responsable del SG-SST" position
 * - SST License information (Resolución 0312/2019, Estándar 1.1.1)
 * - 50-hour course certification
 */
export async function syncExternalLsoColumns(): Promise<void> {
  console.log('[Migration] Sincronizando columnas en responsible_designations...');
  
  try {
    // External LSO columns
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

    // SST License columns (Resolución 0312/2019)
    console.log('[Migration] Ejecutando ALTER TABLE para licencia_sst_titular...');
    await db.execute(sql`
      ALTER TABLE responsible_designations 
      ADD COLUMN IF NOT EXISTS licencia_sst_titular TEXT
    `);
    console.log('[Migration] ✅ Columna licencia_sst_titular verificada/agregada');

    console.log('[Migration] Ejecutando ALTER TABLE para licencia_sst_numero...');
    await db.execute(sql`
      ALTER TABLE responsible_designations 
      ADD COLUMN IF NOT EXISTS licencia_sst_numero TEXT
    `);
    console.log('[Migration] ✅ Columna licencia_sst_numero verificada/agregada');

    console.log('[Migration] Ejecutando ALTER TABLE para licencia_sst_vigencia...');
    await db.execute(sql`
      ALTER TABLE responsible_designations 
      ADD COLUMN IF NOT EXISTS licencia_sst_vigencia DATE
    `);
    console.log('[Migration] ✅ Columna licencia_sst_vigencia verificada/agregada');

    // 50-hour course certification columns
    console.log('[Migration] Ejecutando ALTER TABLE para curso_50_horas...');
    await db.execute(sql`
      ALTER TABLE responsible_designations 
      ADD COLUMN IF NOT EXISTS curso_50_horas BOOLEAN DEFAULT FALSE
    `);
    console.log('[Migration] ✅ Columna curso_50_horas verificada/agregada');

    console.log('[Migration] Ejecutando ALTER TABLE para curso_50_horas_fecha...');
    await db.execute(sql`
      ALTER TABLE responsible_designations 
      ADD COLUMN IF NOT EXISTS curso_50_horas_fecha DATE
    `);
    console.log('[Migration] ✅ Columna curso_50_horas_fecha verificada/agregada');

    console.log('[Migration] ✅ Todas las columnas sincronizadas correctamente en responsible_designations');
  } catch (error: any) {
    console.error('[Migration] ✗ Error sincronizando columnas:', error.message);
    console.error('[Migration] Stack:', error.stack);
    // Don't throw - let the app continue and fail gracefully on queries if columns don't exist
  }
}
