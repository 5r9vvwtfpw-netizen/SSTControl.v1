import { db } from '../db';
import { sql } from 'drizzle-orm';

async function columnExists(tableName: string, columnName: string): Promise<boolean> {
  const result = await db.execute(
    sql`SELECT column_name FROM information_schema.columns WHERE table_name = ${tableName} AND column_name = ${columnName}`
  );
  const rows = Array.isArray(result) ? result : (result as any).rows || [];
  return rows.length > 0;
}

export async function syncVehicleDefaultMaxSpeed() {
  console.log('[Migration] Sincronizando columna default_max_speed en vehicles...');
  try {
    if (await columnExists('vehicles', 'default_max_speed')) {
      console.log('[Migration] ✅ Columna default_max_speed ya existe en vehicles');
      return;
    }
    await db.execute(sql.raw(`ALTER TABLE vehicles ADD COLUMN default_max_speed INTEGER`));
    console.log('[Migration] ✅ Columna default_max_speed agregada a vehicles');
  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      console.log('[Migration] ✅ Columna default_max_speed ya existe en vehicles');
      return;
    }
    console.error('[Migration] Error sincronizando default_max_speed en vehicles:', error.message);
    throw error;
  }
}
