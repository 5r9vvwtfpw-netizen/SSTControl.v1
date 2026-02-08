import { db } from '../db';
import { sql } from 'drizzle-orm';

/**
 * Sincroniza la columna number_of_vehicles en companies
 * Para PESV (Plan Estratégico de Seguridad Vial) - Resolución 40595/2022
 * Usa instancia db compartida (AWS RDS en prod, Neon en dev)
 */
export async function syncCompanyVehiclesColumn() {
  console.log('[Migration] Sincronizando columna number_of_vehicles en companies...');

  try {
    const result = await db.execute(
      sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'number_of_vehicles'`
    );

    const rows = Array.isArray(result) ? result : (result as any).rows || [];
    if (rows.length > 0) {
      console.log('[Migration] ✅ Columna number_of_vehicles ya existe en companies');
      return;
    }

    await db.execute(sql.raw('ALTER TABLE companies ADD COLUMN number_of_vehicles INTEGER DEFAULT 0'));
    console.log('[Migration] ✅ Columna number_of_vehicles agregada a companies');
  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      console.log('[Migration] ✅ Columna number_of_vehicles ya existe en companies');
      return;
    }
    console.error('[Migration] ⚠️ Error sincronizando number_of_vehicles:', error.message);
    throw error;
  }
}
