import { db } from '../db';
import { sql } from 'drizzle-orm';

async function columnExists(tableName: string, columnName: string): Promise<boolean> {
  const result = await db.execute(
    sql`SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = ${tableName} AND column_name = ${columnName}`
  );
  const rows = Array.isArray(result) ? result : (result as any).rows || [];
  return rows.length > 0;
}

async function getColumnType(tableName: string, columnName: string): Promise<string | null> {
  const result = await db.execute(
    sql`SELECT data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = ${tableName} AND column_name = ${columnName}`
  );
  const rows = Array.isArray(result) ? result : (result as any).rows || [];
  return rows.length > 0 ? (rows[0] as any).data_type : null;
}

export async function syncSafeRoutesColumns() {
  console.log('[Migration] Sincronizando columnas en safe_routes...');

  try {
    const hasDistanceKm = await columnExists('safe_routes', 'distance_km');
    const hasDistance = await columnExists('safe_routes', 'distance');

    if (hasDistanceKm && !hasDistance) {
      await db.execute(sql`ALTER TABLE safe_routes ADD COLUMN distance INTEGER`);
      await db.execute(sql`UPDATE safe_routes SET distance = CASE WHEN distance_km ~ '^\d+$' THEN distance_km::integer ELSE NULL END`);
      await db.execute(sql`ALTER TABLE safe_routes DROP COLUMN distance_km`);
      console.log('[Migration] ✅ Columna distance_km migrada a distance (INTEGER)');
    } else if (!hasDistance) {
      await db.execute(sql`ALTER TABLE safe_routes ADD COLUMN distance INTEGER`);
      console.log('[Migration] ✅ Columna distance agregada');
    } else {
      const distType = await getColumnType('safe_routes', 'distance');
      if (distType === 'text') {
        await db.execute(sql`ALTER TABLE safe_routes ALTER COLUMN distance TYPE INTEGER USING CASE WHEN distance ~ '^\d+$' THEN distance::integer ELSE NULL END`);
        console.log('[Migration] ✅ Columna distance convertida de TEXT a INTEGER');
      } else {
        console.log('[Migration] ✅ Columna distance ya existe correctamente');
      }
    }

    const estType = await getColumnType('safe_routes', 'estimated_time');
    if (estType === 'text') {
      await db.execute(sql`ALTER TABLE safe_routes ALTER COLUMN estimated_time TYPE INTEGER USING CASE WHEN estimated_time ~ '^\d+$' THEN estimated_time::integer ELSE NULL END`);
      console.log('[Migration] ✅ Columna estimated_time convertida de TEXT a INTEGER');
    } else if (!estType) {
      await db.execute(sql`ALTER TABLE safe_routes ADD COLUMN estimated_time INTEGER`);
      console.log('[Migration] ✅ Columna estimated_time agregada');
    } else {
      console.log('[Migration] ✅ Columna estimated_time ya es INTEGER');
    }

    const columnsToAdd = [
      { name: 'rest_stops', type: 'TEXT' },
      { name: 'emergency_contacts', type: 'TEXT' },
      { name: 'restrictions', type: 'TEXT' },
      { name: 'map_url', type: 'TEXT' },
    ];

    for (const col of columnsToAdd) {
      if (!await columnExists('safe_routes', col.name)) {
        await db.execute(sql.raw(`ALTER TABLE safe_routes ADD COLUMN ${col.name} ${col.type}`));
        console.log(`[Migration] ✅ Columna ${col.name} agregada a safe_routes`);
      }
    }

    console.log('[Migration] ✅ Columnas de safe_routes sincronizadas correctamente');
  } catch (error: any) {
    console.error('[Migration] Error sincronizando safe_routes:', error.message);
  }
}
