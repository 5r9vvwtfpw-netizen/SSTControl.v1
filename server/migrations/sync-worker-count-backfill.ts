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
    // Subquery correlacionado: cubre TODAS las empresas, incluyendo las que tienen 0 trabajadores
    const result = await db.execute(sql`
      UPDATE companies
      SET number_of_workers = (
        SELECT COUNT(*)::int FROM workers WHERE company_id = companies.id
      )
      WHERE number_of_workers IS DISTINCT FROM (
        SELECT COUNT(*)::int FROM workers WHERE company_id = companies.id
      )
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
