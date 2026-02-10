import { db } from '../db';
import { sql } from 'drizzle-orm';

export async function syncInvoiceSnapshotColumns() {
  console.log('[Migration] Sincronizando columnas snapshot en invoices...');

  try {
    const columns = [
      { name: 'snapshot_ciiu_code', type: 'TEXT' },
      { name: 'snapshot_number_of_workers', type: 'INTEGER' },
      { name: 'snapshot_number_of_vehicles', type: 'INTEGER' },
    ];

    for (const col of columns) {
      const result = await db.execute(
        sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = ${col.name}`
      );

      const rows = Array.isArray(result) ? result : (result as any).rows || [];
      if (rows.length > 0) {
        console.log(`[Migration] ✅ Columna ${col.name} ya existe en invoices`);
        continue;
      }

      await db.execute(sql.raw(`ALTER TABLE invoices ADD COLUMN ${col.name} ${col.type}`));
      console.log(`[Migration] ✅ Columna ${col.name} agregada a invoices`);
    }

    console.log('[Migration] ✅ Todas las columnas snapshot sincronizadas en invoices');
  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      console.log('[Migration] ✅ Columnas snapshot ya existen en invoices');
      return;
    }
    console.error('[Migration] Error sincronizando columnas snapshot en invoices:', error.message);
    throw error;
  }
}
