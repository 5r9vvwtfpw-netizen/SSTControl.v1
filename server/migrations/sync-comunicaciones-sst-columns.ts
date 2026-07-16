import { db } from "../db";
import { sql } from "drizzle-orm";

export async function syncComunicacionesSstColumns() {
  try {
    console.log('[Migration] Sincronizando columnas de comunicaciones_sst...');

    const tableCheck = await db.execute(
      sql`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'comunicaciones_sst') as exists`
    );
    if (!tableCheck.rows?.[0]?.exists) {
      console.log('[Migration] ⏭️  Tabla comunicaciones_sst no existe, saltando');
      return;
    }

    const columns: { name: string; definition: string }[] = [
      { name: 'es_externa', definition: 'INTEGER NOT NULL DEFAULT 0' },
    ];

    for (const col of columns) {
      const colCheck = await db.execute(sql`
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'comunicaciones_sst' AND column_name = ${col.name}
      `);

      if (colCheck.rows && colCheck.rows.length > 0) {
        console.log(`[Migration] ✅ Columna ${col.name} ya existe en comunicaciones_sst`);
        continue;
      }

      try {
        await db.execute(sql.raw(`ALTER TABLE comunicaciones_sst ADD COLUMN ${col.name} ${col.definition}`));
        console.log(`[Migration] ✅ Columna ${col.name} agregada a comunicaciones_sst`);
      } catch (e: any) {
        if (!e.message?.includes('already exists')) {
          console.error(`[Migration] Error agregando ${col.name} a comunicaciones_sst:`, e.message);
        }
      }
    }

    console.log('[Migration] ✅ Columnas de comunicaciones_sst sincronizadas');
  } catch (error: any) {
    console.error('[Migration] Error sincronizando comunicaciones_sst:', error.message);
  }
}
