import { db } from '../db';
import { sql } from 'drizzle-orm';

async function columnExists(tableName: string, columnName: string): Promise<boolean> {
  const result = await db.execute(
    sql`SELECT column_name FROM information_schema.columns WHERE table_name = ${tableName} AND column_name = ${columnName}`
  );
  const rows = Array.isArray(result) ? result : (result as any).rows || [];
  return rows.length > 0;
}

export async function syncRoadSafetyContentFields() {
  console.log('[Migration] Sincronizando campos de contenido en road_safety_trainings...');
  try {
    if (!await columnExists('road_safety_trainings', 'content_type')) {
      await db.execute(sql`ALTER TABLE road_safety_trainings ADD COLUMN content_type TEXT DEFAULT 'presencial'`);
      console.log('[Migration] Columna content_type agregada');
    }
    if (!await columnExists('road_safety_trainings', 'content_url')) {
      await db.execute(sql`ALTER TABLE road_safety_trainings ADD COLUMN content_url TEXT`);
      console.log('[Migration] Columna content_url agregada');
    }
    if (!await columnExists('road_safety_trainings', 'content_text')) {
      await db.execute(sql`ALTER TABLE road_safety_trainings ADD COLUMN content_text TEXT`);
      console.log('[Migration] Columna content_text agregada');
    }
    console.log('[Migration] road_safety_trainings contenido: OK');
  } catch (error) {
    console.error('[Migration] Error en syncRoadSafetyContentFields:', error);
    throw error;
  }
}
