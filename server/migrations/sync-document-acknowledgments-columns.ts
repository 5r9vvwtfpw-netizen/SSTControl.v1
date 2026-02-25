import { db } from '../db';

export async function syncDocumentAcknowledgmentsColumns() {
  console.log('[Migration] Sincronizando columnas en document_acknowledgments...');

  const columns = [
    { name: 'document_id', type: 'VARCHAR(255)', nullable: true },
    { name: 'assignment_id', type: 'VARCHAR(255)', nullable: true },
    { name: 'comments', type: 'TEXT', nullable: true },
    { name: 'signature_confirmation', type: 'TEXT', nullable: true },
  ];

  try {
    for (const col of columns) {
      try {
        await db.execute(
          `ALTER TABLE document_acknowledgments ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`
        );
        console.log(`[Migration] ✅ Columna ${col.name} verificada/agregada en document_acknowledgments`);
      } catch (err: any) {
        if (err.message?.includes('already exists')) {
          console.log(`[Migration] ✅ Columna ${col.name} ya existe en document_acknowledgments`);
        } else {
          console.warn(`[Migration] ⚠️ Error con columna ${col.name}: ${err.message}`);
        }
      }
    }
    console.log('[Migration] ✅ Todas las columnas sincronizadas en document_acknowledgments');
  } catch (error: any) {
    console.error('[Migration] ⚠️ Error sincronizando document_acknowledgments:', error.message);
  }
}
