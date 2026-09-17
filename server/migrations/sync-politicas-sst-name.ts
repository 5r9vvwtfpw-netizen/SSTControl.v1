import { db } from "../db";
import { sql } from "drizzle-orm";

async function columnExists(tableName: string, columnName: string): Promise<boolean> {
  const result = await db.execute(
    sql`SELECT column_name
        FROM information_schema.columns
        WHERE table_name = ${tableName}
          AND column_name = ${columnName}`,
  );
  const rows = Array.isArray(result) ? result : (result as any).rows || [];
  return rows.length > 0;
}

export async function syncPoliticasSstName() {
  console.log("[Migration] Sincronizando nombre de políticas SST...");
  try {
    if (!(await columnExists("politicas_sst", "nombre"))) {
      await db.execute(sql`ALTER TABLE politicas_sst ADD COLUMN nombre TEXT`);
      console.log("[Migration] Columna nombre agregada en politicas_sst");
    }
    console.log("[Migration] Nombre de políticas SST: OK");
  } catch (error) {
    console.error("[Migration] Error en syncPoliticasSstName:", error);
    throw error;
  }
}