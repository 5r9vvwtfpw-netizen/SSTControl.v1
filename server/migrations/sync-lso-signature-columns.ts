import { db } from "../db";
import { sql } from "drizzle-orm";

const LSO_SIGNATURE_COLUMNS = [
  'lso_signature_name',
  'lso_signature_license',
  'lso_signature_url',
  'lso_signed_at',
];

const TABLES = [
  'evaluaciones_sst',
  'planes_trabajo_anual',
  'matrices_iperc',
];

export async function syncLsoSignatureColumns() {
  try {
    console.log('[Migration] Sincronizando columnas de firma LSO...');

    for (const tableName of TABLES) {
      const tableCheck = await db.execute(
        sql`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = ${tableName}) as exists`
      );
      if (!tableCheck.rows?.[0]?.exists) {
        console.log(`[Migration] ⏭️  Tabla ${tableName} no existe, saltando`);
        continue;
      }

      for (const colName of LSO_SIGNATURE_COLUMNS) {
        const colCheck = await db.execute(sql`
          SELECT column_name FROM information_schema.columns 
          WHERE table_name = ${tableName} AND column_name = ${colName}
        `);

        if (colCheck.rows && colCheck.rows.length > 0) {
          continue;
        }

        try {
          const colType = colName === 'lso_signed_at' ? 'TIMESTAMP' : 'TEXT';
          await db.execute(sql.raw(`ALTER TABLE ${tableName} ADD COLUMN ${colName} ${colType}`));
          console.log(`[Migration] ✅ Columna ${colName} agregada a ${tableName}`);
        } catch (e: any) {
          if (!e.message?.includes('already exists')) {
            console.error(`[Migration] Error agregando ${colName} a ${tableName}:`, e.message);
          }
        }
      }
    }

    console.log('[Migration] ✅ Columnas de firma LSO sincronizadas');
  } catch (error: any) {
    console.error('[Migration] Error sincronizando columnas de firma LSO:', error.message);
  }
}
