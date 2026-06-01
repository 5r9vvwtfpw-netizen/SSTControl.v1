import { db } from '../db';
import { sql } from 'drizzle-orm';

/**
 * Backfill: sincroniza company.numberOfWorkers con el conteo real de
 * trabajadores en la tabla workers para todas las empresas.
 *
 * Esto corrige el desajuste histórico entre el campo manual numberOfWorkers
 * y los registros reales. A partir de ahora createWorker/deleteWorker
 * mantienen el campo sincronizado automáticamente.
 *
 * Es idempotente: solo actualiza empresas donde haya diferencia.
 */
export async function syncWorkerCountBackfill(): Promise<void> {
  try {
    const result = await db.execute(sql`
      UPDATE companies c
      SET number_of_workers = sub.real_count
      FROM (
        SELECT company_id, COUNT(*)::int AS real_count
        FROM workers
        GROUP BY company_id
      ) sub
      WHERE c.id = sub.company_id
        AND c.number_of_workers IS DISTINCT FROM sub.real_count
    `);

    const updated = (result as any).rowCount ?? 0;

    if (updated > 0) {
      console.log(`[Migration] ✅ Worker count backfill: ${updated} empresa(s) sincronizadas`);
    } else {
      console.log('[Migration] ✅ Worker count backfill: todo ya estaba sincronizado');
    }
  } catch (e: any) {
    console.error('[Migration] ⚠️ Worker count backfill falló:', e.message);
  }
}
