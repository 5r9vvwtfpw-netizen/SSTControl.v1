import { db } from "../db";
import { sql } from "drizzle-orm";

/**
 * Agrega columnas ciiu_code_2, ciiu_code_3, ciiu_code_4 a la tabla companies
 * para soportar empresas con múltiples actividades económicas (CIIU).
 * Las columnas son opcionales (nullable) — no afecta datos existentes.
 */
export async function syncCiiuMultiColumns() {
  try {
    const columns = [
      { name: "ciiu_code_2", definition: "TEXT" },
      { name: "ciiu_code_3", definition: "TEXT" },
      { name: "ciiu_code_4", definition: "TEXT" },
    ];

    for (const col of columns) {
      const check = await db.execute(sql`
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'companies' AND column_name = ${col.name}
      `);
      if (check.rows && check.rows.length > 0) {
        console.log(`[Migration] ✅ Columna ${col.name} ya existe en companies`);
        continue;
      }
      await db.execute(sql.raw(`ALTER TABLE companies ADD COLUMN ${col.name} ${col.definition}`));
      console.log(`[Migration] ✅ Columna ${col.name} agregada a companies (multi-CIIU)`);
    }
  } catch (error: any) {
    console.error("[Migration] Error sincronizando columnas multi-CIIU en companies:", error.message);
  }
}
