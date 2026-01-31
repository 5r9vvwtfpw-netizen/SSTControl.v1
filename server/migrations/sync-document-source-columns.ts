import { sql } from 'drizzle-orm';
import { db } from '../db';

/**
 * Migration: Add source tracking columns to sst_documents table
 * 
 * Adds support for centralized document traceability:
 * - sourceModule: Module that generated the document
 * - sourceEndpoint: API endpoint for regenerating the PDF
 * - sourceRecordId: ID of the source record
 * - isSystemGenerated: Flag to distinguish system-generated docs
 */
export async function syncDocumentSourceColumns(): Promise<void> {
  console.log('[Migration] Sincronizando columnas de trazabilidad en sst_documents...');
  
  try {
    console.log('[Migration] Ejecutando ALTER TABLE para source_module...');
    await db.execute(sql`
      ALTER TABLE sst_documents 
      ADD COLUMN IF NOT EXISTS source_module TEXT
    `);
    console.log('[Migration] ✅ Columna source_module verificada/agregada');

    console.log('[Migration] Ejecutando ALTER TABLE para source_endpoint...');
    await db.execute(sql`
      ALTER TABLE sst_documents 
      ADD COLUMN IF NOT EXISTS source_endpoint TEXT
    `);
    console.log('[Migration] ✅ Columna source_endpoint verificada/agregada');

    console.log('[Migration] Ejecutando ALTER TABLE para source_record_id...');
    await db.execute(sql`
      ALTER TABLE sst_documents 
      ADD COLUMN IF NOT EXISTS source_record_id TEXT
    `);
    console.log('[Migration] ✅ Columna source_record_id verificada/agregada');

    console.log('[Migration] Ejecutando ALTER TABLE para is_system_generated...');
    await db.execute(sql`
      ALTER TABLE sst_documents 
      ADD COLUMN IF NOT EXISTS is_system_generated BOOLEAN DEFAULT FALSE
    `);
    console.log('[Migration] ✅ Columna is_system_generated verificada/agregada');

    // Create index for efficient querying of system-generated documents
    console.log('[Migration] Creando índice para documentos generados por el sistema...');
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_sst_documents_source_module 
      ON sst_documents(source_module) 
      WHERE source_module IS NOT NULL
    `);
    console.log('[Migration] ✅ Índice idx_sst_documents_source_module creado/verificado');

    console.log('[Migration] ✅ Todas las columnas de trazabilidad sincronizadas correctamente en sst_documents');
  } catch (error: any) {
    console.error('[Migration] ✗ Error sincronizando columnas de trazabilidad:', error.message);
    console.error('[Migration] Stack:', error.stack);
  }
}
