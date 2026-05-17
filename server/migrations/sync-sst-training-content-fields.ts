import { db } from '../db';
import { sql } from 'drizzle-orm';

async function columnExists(tableName: string, columnName: string): Promise<boolean> {
  const result = await db.execute(
    sql`SELECT column_name FROM information_schema.columns WHERE table_name = ${tableName} AND column_name = ${columnName}`
  );
  const rows = Array.isArray(result) ? result : (result as any).rows || [];
  return rows.length > 0;
}

export async function syncSstTrainingContentFields() {
  console.log('[Migration] Sincronizando campos de contenido en trainings (SST)...');
  try {
    if (!await columnExists('trainings', 'content_type')) {
      await db.execute(sql`ALTER TABLE trainings ADD COLUMN content_type TEXT DEFAULT 'presencial'`);
      console.log('[Migration] Columna content_type agregada en trainings');
    }
    if (!await columnExists('trainings', 'content_url')) {
      await db.execute(sql`ALTER TABLE trainings ADD COLUMN content_url TEXT`);
      console.log('[Migration] Columna content_url agregada en trainings');
    }
    if (!await columnExists('trainings', 'content_text')) {
      await db.execute(sql`ALTER TABLE trainings ADD COLUMN content_text TEXT`);
      console.log('[Migration] Columna content_text agregada en trainings');
    }
    console.log('[Migration] trainings contenido SST: OK');
  } catch (error) {
    console.error('[Migration] Error en syncSstTrainingContentFields:', error);
    throw error;
  }
}
