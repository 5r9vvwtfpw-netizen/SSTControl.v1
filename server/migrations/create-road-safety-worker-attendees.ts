import { db } from '../db';
import { sql } from 'drizzle-orm';

async function tableExists(tableName: string): Promise<boolean> {
  const result = await db.execute(
    sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ${tableName}`
  );
  const rows = Array.isArray(result) ? result : (result as any).rows || [];
  return rows.length > 0;
}

export async function createRoadSafetyWorkerAttendees() {
  console.log('[Migration] Verificando tabla road_safety_worker_attendees...');
  try {
    if (await tableExists('road_safety_worker_attendees')) {
      console.log('[Migration] Tabla road_safety_worker_attendees ya existe');
      return;
    }
    await db.execute(sql`
      CREATE TABLE road_safety_worker_attendees (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        training_id VARCHAR NOT NULL REFERENCES road_safety_trainings(id) ON DELETE CASCADE,
        worker_id VARCHAR NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
        invited INTEGER NOT NULL DEFAULT 1,
        attended INTEGER NOT NULL DEFAULT 0,
        notified_at TIMESTAMP,
        confirmed_at TIMESTAMP,
        score INTEGER,
        certificate TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
    console.log('[Migration] ✅ Tabla road_safety_worker_attendees creada');
  } catch (error) {
    console.error('[Migration] Error en createRoadSafetyWorkerAttendees:', error);
    throw error;
  }
}
