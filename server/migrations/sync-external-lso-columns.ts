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
  console.log('  → Verificando columnas is_external_lso y external_lso_name...');
  
  try {
    // Check if is_external_lso column exists
    const checkColumn = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'responsible_designations' 
      AND column_name = 'is_external_lso'
    `);
    
    if (checkColumn.rows.length === 0) {
      console.log('    - Agregando columna is_external_lso...');
      await db.execute(sql`
        ALTER TABLE responsible_designations 
        ADD COLUMN IF NOT EXISTS is_external_lso BOOLEAN DEFAULT FALSE
      `);
      console.log('    ✓ Columna is_external_lso agregada');
    } else {
      console.log('    ✓ Columna is_external_lso ya existe');
    }

    // Check if external_lso_name column exists
    const checkNameColumn = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'responsible_designations' 
      AND column_name = 'external_lso_name'
    `);
    
    if (checkNameColumn.rows.length === 0) {
      console.log('    - Agregando columna external_lso_name...');
      await db.execute(sql`
        ALTER TABLE responsible_designations 
        ADD COLUMN IF NOT EXISTS external_lso_name TEXT
      `);
      console.log('    ✓ Columna external_lso_name agregada');
    } else {
      console.log('    ✓ Columna external_lso_name ya existe');
    }

    console.log('  ✓ Columnas LSO externo sincronizadas correctamente');
  } catch (error: any) {
    console.error('  ✗ Error sincronizando columnas LSO externo:', error.message);
    throw error;
  }
}
