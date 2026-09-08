import { db } from "../db";
import { sql } from "drizzle-orm";

async function columnExists(columnName: string): Promise<boolean> {
  const result = await db.execute(sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'vehicles' AND column_name = ${columnName}
  `);
  const rows = Array.isArray(result) ? result : (result as any).rows || [];
  return rows.length > 0;
}

export async function syncVehicleMachineryColumns() {
  console.log("[Migration] Sincronizando clasificación de maquinaria en vehicles...");
  const columns = [
    ["asset_category", "TEXT NOT NULL DEFAULT 'vehiculo_carretera'"],
    ["machinery_type", "TEXT"],
    ["serial_number", "TEXT"],
    ["engine_hours", "INTEGER"],
  ] as const;

  for (const [name, definition] of columns) {
    if (!(await columnExists(name))) {
      await db.execute(sql.raw(`ALTER TABLE vehicles ADD COLUMN ${name} ${definition}`));
    }
  }

  // Clasificación determinista y reversible para la máquina ya identificada.
  await db.execute(sql`
    UPDATE vehicles
    SET asset_category = 'maquinaria_amarilla',
        machinery_type = 'excavadora_compacta'
    WHERE LOWER(brand) = 'hitachi'
      AND LOWER(model) LIKE '%zx30u-5b%'
      AND (asset_category = 'vehiculo_carretera' OR asset_category IS NULL)
  `);
  console.log("[Migration] ✅ Clasificación de maquinaria sincronizada");
}