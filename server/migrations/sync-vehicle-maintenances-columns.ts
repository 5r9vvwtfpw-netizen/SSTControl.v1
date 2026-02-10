import { db } from '../db';
import { sql } from 'drizzle-orm';

export async function syncVehicleMaintenancesColumns() {
  console.log('[Migration] Sincronizando columnas en vehicle_maintenances...');

  try {
    const columns = [
      { name: 'parts_replaced', type: 'TEXT' },
      { name: 'observations', type: 'TEXT' },
      { name: 'document_url', type: 'TEXT' },
      { name: 'evaluacion_pesv_id', type: 'VARCHAR' },
    ];

    for (const col of columns) {
      const result = await db.execute(
        sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'vehicle_maintenances' AND column_name = ${col.name}`
      );

      const rows = Array.isArray(result) ? result : (result as any).rows || [];
      if (rows.length > 0) {
        console.log(`[Migration] ✅ Columna ${col.name} ya existe en vehicle_maintenances`);
        continue;
      }

      await db.execute(sql.raw(`ALTER TABLE vehicle_maintenances ADD COLUMN ${col.name} ${col.type}`));
      console.log(`[Migration] ✅ Columna ${col.name} agregada a vehicle_maintenances`);
    }

    console.log('[Migration] ✅ Todas las columnas sincronizadas en vehicle_maintenances');
  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      console.log('[Migration] ✅ Columnas ya existen en vehicle_maintenances');
      return;
    }
    console.error('[Migration] Error sincronizando columnas en vehicle_maintenances:', error.message);
    throw error;
  }
}
