/**
 * Migration: Sync investigation_findings table with schema
 * Adds missing columns to the investigation_findings table
 */

import { db } from '../db';
import { sql } from 'drizzle-orm';

export async function syncInvestigationFindings() {
  console.log('[Migration] Sincronizando tabla investigation_findings...');
  
  try {
    // Check if table exists
    const tableCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'investigation_findings'
      );
    `);
    
    const tableExists = tableCheck.rows[0]?.exists;
    
    if (!tableExists) {
      // Create table if it doesn't exist
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS investigation_findings (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          investigation_id VARCHAR NOT NULL REFERENCES accident_investigations(id) ON DELETE CASCADE,
          finding_type VARCHAR NOT NULL,
          description TEXT NOT NULL,
          linked_iperc_id VARCHAR REFERENCES peligros_iperc(id) ON DELETE SET NULL,
          corrective_action TEXT NOT NULL,
          responsible_name TEXT NOT NULL,
          responsible_area TEXT,
          due_date DATE NOT NULL,
          status TEXT NOT NULL DEFAULT 'pendiente',
          completion_date DATE,
          verification_date DATE,
          verified_by VARCHAR,
          evidence_urls TEXT[],
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('[Migration] ✅ Tabla investigation_findings creada');
      return;
    }
    
    // Get existing columns
    const columnsResult = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'investigation_findings';
    `);
    
    const existingColumns = new Set(columnsResult.rows.map((row: any) => row.column_name));
    
    // Define required columns with their SQL definitions
    const requiredColumns: Array<{ name: string; definition: string }> = [
      { name: 'id', definition: 'VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()' },
      { name: 'investigation_id', definition: 'VARCHAR NOT NULL' },
      { name: 'finding_type', definition: 'VARCHAR NOT NULL DEFAULT \'causa_inmediata_acto\'' },
      { name: 'description', definition: 'TEXT NOT NULL DEFAULT \'\'' },
      { name: 'linked_iperc_id', definition: 'VARCHAR' },
      { name: 'corrective_action', definition: 'TEXT NOT NULL DEFAULT \'\'' },
      { name: 'responsible_name', definition: 'TEXT NOT NULL DEFAULT \'\'' },
      { name: 'responsible_area', definition: 'TEXT' },
      { name: 'due_date', definition: 'DATE' },
      { name: 'status', definition: 'TEXT NOT NULL DEFAULT \'pendiente\'' },
      { name: 'completion_date', definition: 'DATE' },
      { name: 'verification_date', definition: 'DATE' },
      { name: 'verified_by', definition: 'VARCHAR' },
      { name: 'evidence_urls', definition: 'TEXT[]' },
      { name: 'effectiveness', definition: 'TEXT' },
      { name: 'closure_evidence', definition: 'TEXT' },
      { name: 'observations', definition: 'TEXT' },
      { name: 'created_at', definition: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
      { name: 'updated_at', definition: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
    ];
    
    let columnsAdded = 0;
    
    for (const column of requiredColumns) {
      if (!existingColumns.has(column.name)) {
        // Extract just the type part for ALTER TABLE
        const typePart = column.definition.replace(' PRIMARY KEY', '').replace(' NOT NULL', '').replace(' DEFAULT', '');
        const defaultMatch = column.definition.match(/DEFAULT\s+(.+?)(?:\s|$)/);
        
        let alterSql = `ALTER TABLE investigation_findings ADD COLUMN IF NOT EXISTS ${column.name} `;
        
        if (column.name === 'description') {
          alterSql += 'TEXT NOT NULL DEFAULT \'\'';
        } else if (column.name === 'finding_type') {
          alterSql += 'VARCHAR NOT NULL DEFAULT \'causa_inmediata_acto\'';
        } else if (column.name === 'corrective_action') {
          alterSql += 'TEXT NOT NULL DEFAULT \'\'';
        } else if (column.name === 'responsible_name') {
          alterSql += 'TEXT NOT NULL DEFAULT \'\'';
        } else if (column.name === 'status') {
          alterSql += 'TEXT NOT NULL DEFAULT \'pendiente\'';
        } else if (column.name === 'due_date') {
          alterSql += 'DATE';
        } else {
          alterSql += typePart;
        }
        
        try {
          await db.execute(sql.raw(alterSql));
          console.log(`[Migration] + Columna '${column.name}' agregada a investigation_findings`);
          columnsAdded++;
        } catch (error: any) {
          if (!error.message?.includes('already exists')) {
            console.error(`[Migration] Error agregando columna ${column.name}:`, error.message);
          }
        }
      }
    }
    
    if (columnsAdded === 0) {
      console.log('[Migration] ✅ Tabla investigation_findings ya está sincronizada');
    } else {
      console.log(`[Migration] ✅ ${columnsAdded} columnas agregadas a investigation_findings`);
    }
    
  } catch (error: any) {
    console.error('[Migration] Error sincronizando investigation_findings:', error.message);
    throw error;
  }
}
