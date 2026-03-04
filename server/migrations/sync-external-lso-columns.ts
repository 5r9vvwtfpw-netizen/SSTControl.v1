import { sql } from 'drizzle-orm';
import { db } from '../db';

/**
 * Migration: Add all missing columns to responsible_designations and licensed_professional_assignments
 * 
 * Adds support for:
 * - External LSO professionals (non-employee professionals) for "Responsable del SG-SST" position
 * - SST License information (Resolución 0312/2019, Estándar 1.1.1)
 * - 50-hour course certification
 * - Licensed Professional Assignments with external LSO data
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

    console.log('[Migration] Ejecutando ALTER TABLE para external_lso_identification_number...');
    await db.execute(sql`
      ALTER TABLE responsible_designations 
      ADD COLUMN IF NOT EXISTS external_lso_identification_number TEXT
    `);
    console.log('[Migration] ✅ Columna external_lso_identification_number verificada/agregada');

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

    await db.execute(sql`
      ALTER TABLE responsible_designations 
      ADD COLUMN IF NOT EXISTS lso_signature_name TEXT
    `);
    console.log('[Migration] ✅ Columna lso_signature_name verificada/agregada');

    await db.execute(sql`
      ALTER TABLE responsible_designations 
      ADD COLUMN IF NOT EXISTS lso_signature_license TEXT
    `);
    console.log('[Migration] ✅ Columna lso_signature_license verificada/agregada');

    await db.execute(sql`
      ALTER TABLE responsible_designations 
      ADD COLUMN IF NOT EXISTS lso_signature_url TEXT
    `);
    console.log('[Migration] ✅ Columna lso_signature_url verificada/agregada');

    await db.execute(sql`
      ALTER TABLE responsible_designations 
      ADD COLUMN IF NOT EXISTS lso_signed_at TIMESTAMP
    `);
    console.log('[Migration] ✅ Columna lso_signed_at verificada/agregada');

    console.log('[Migration] ✅ Todas las columnas sincronizadas correctamente en responsible_designations');
  } catch (error: any) {
    console.error('[Migration] ✗ Error sincronizando columnas en responsible_designations:', error.message);
    console.error('[Migration] Stack:', error.stack);
  }

  // Now sync columns for licensed_professional_assignments table (External LSO data)
  console.log('[Migration] Sincronizando columnas en licensed_professional_assignments...');
  
  try {
    console.log('[Migration] Ejecutando ALTER TABLE para external_lso_id...');
    await db.execute(sql`
      ALTER TABLE licensed_professional_assignments 
      ADD COLUMN IF NOT EXISTS external_lso_id VARCHAR(255)
    `);
    console.log('[Migration] ✅ Columna external_lso_id verificada/agregada');

    console.log('[Migration] Ejecutando ALTER TABLE para external_lso_name...');
    await db.execute(sql`
      ALTER TABLE licensed_professional_assignments 
      ADD COLUMN IF NOT EXISTS external_lso_name VARCHAR(255)
    `);
    console.log('[Migration] ✅ Columna external_lso_name verificada/agregada');

    console.log('[Migration] Ejecutando ALTER TABLE para external_lso_email...');
    await db.execute(sql`
      ALTER TABLE licensed_professional_assignments 
      ADD COLUMN IF NOT EXISTS external_lso_email VARCHAR(255)
    `);
    console.log('[Migration] ✅ Columna external_lso_email verificada/agregada');

    console.log('[Migration] Ejecutando ALTER TABLE para external_lso_phone...');
    await db.execute(sql`
      ALTER TABLE licensed_professional_assignments 
      ADD COLUMN IF NOT EXISTS external_lso_phone VARCHAR(50)
    `);
    console.log('[Migration] ✅ Columna external_lso_phone verificada/agregada');

    console.log('[Migration] Ejecutando ALTER TABLE para external_lso_city...');
    await db.execute(sql`
      ALTER TABLE licensed_professional_assignments 
      ADD COLUMN IF NOT EXISTS external_lso_city VARCHAR(100)
    `);
    console.log('[Migration] ✅ Columna external_lso_city verificada/agregada');

    console.log('[Migration] Ejecutando ALTER TABLE para external_lso_license_number...');
    await db.execute(sql`
      ALTER TABLE licensed_professional_assignments 
      ADD COLUMN IF NOT EXISTS external_lso_license_number VARCHAR(100)
    `);
    console.log('[Migration] ✅ Columna external_lso_license_number verificada/agregada');

    console.log('[Migration] Ejecutando ALTER TABLE para external_lso_license_issuer...');
    await db.execute(sql`
      ALTER TABLE licensed_professional_assignments 
      ADD COLUMN IF NOT EXISTS external_lso_license_issuer VARCHAR(255)
    `);
    console.log('[Migration] ✅ Columna external_lso_license_issuer verificada/agregada');

    console.log('[Migration] Ejecutando ALTER TABLE para external_lso_license_expiry...');
    await db.execute(sql`
      ALTER TABLE licensed_professional_assignments 
      ADD COLUMN IF NOT EXISTS external_lso_license_expiry TIMESTAMP
    `);
    console.log('[Migration] ✅ Columna external_lso_license_expiry verificada/agregada');

    console.log('[Migration] Ejecutando ALTER TABLE para external_lso_signature_url...');
    await db.execute(sql`
      ALTER TABLE licensed_professional_assignments 
      ADD COLUMN IF NOT EXISTS external_lso_signature_url TEXT
    `);
    console.log('[Migration] ✅ Columna external_lso_signature_url verificada/agregada');

    console.log('[Migration] ✅ Todas las columnas sincronizadas correctamente en licensed_professional_assignments');
  } catch (error: any) {
    console.error('[Migration] ✗ Error sincronizando columnas en licensed_professional_assignments:', error.message);
    console.error('[Migration] Stack:', error.stack);
  }

  // Make worker_id nullable in responsible_designations (required for external LSO support)
  console.log('[Migration] Haciendo worker_id nullable en responsible_designations...');
  
  try {
    await db.execute(sql`
      ALTER TABLE responsible_designations 
      ALTER COLUMN worker_id DROP NOT NULL
    `);
    console.log('[Migration] ✅ Columna worker_id ahora es nullable en responsible_designations');
  } catch (error: any) {
    // If column is already nullable, this will fail silently
    if (error.message?.includes('does not have a default') || error.message?.includes('already nullable') || error.message?.includes('is not')) {
      console.log('[Migration] ✅ Columna worker_id ya es nullable en responsible_designations');
    } else {
      console.error('[Migration] ⚠️ Error modificando worker_id:', error.message);
    }
  }
}
