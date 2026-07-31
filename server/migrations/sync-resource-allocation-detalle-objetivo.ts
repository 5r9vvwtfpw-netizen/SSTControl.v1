import { db } from '../db';
import { sql } from 'drizzle-orm';

export async function syncResourceAllocationDetalleObjetivo() {
  console.log('[Migration] Sincronizando columna detalle_objetivo en resource_allocations...');
  try {
    await db.execute(sql`
      ALTER TABLE resource_allocations
      ADD COLUMN IF NOT EXISTS detalle_objetivo TEXT
    `);
    console.log('[Migration] ✅ Columna detalle_objetivo verificada/agregada');
  } catch (error: any) {
    console.error('[Migration] Error en detalle_objetivo:', error.message);
  }
}
