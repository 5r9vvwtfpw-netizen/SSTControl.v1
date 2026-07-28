import { db } from '../db';
import { sql } from 'drizzle-orm';

export async function syncInspectionStatusEnum() {
  console.log('[Migration] Sincronizando valores enum inspection_status...');
  try {
    await db.execute(sql.raw(`ALTER TYPE inspection_status ADD VALUE IF NOT EXISTS 'completada'`));
    await db.execute(sql.raw(`ALTER TYPE inspection_status ADD VALUE IF NOT EXISTS 'requiere_accion'`));
    console.log('[Migration] ✅ Enum inspection_status sincronizado (completada, requiere_accion)');
  } catch (error: any) {
    console.error('[Migration] Error sincronizando inspection_status enum:', error.message);
  }
}
