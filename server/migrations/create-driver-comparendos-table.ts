import { db } from "../db";
import { sql } from "drizzle-orm";

export async function createDriverComparendosTable() {
  console.log("[Migration] Verificando tabla driver_comparendos...");
  try {
    await db.execute(sql`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'comparendo_status') THEN
          CREATE TYPE comparendo_status AS ENUM ('pendiente', 'pagado', 'recurrido', 'prescrito');
        END IF;
      END $$;
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS driver_comparendos (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id VARCHAR NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        driver_id VARCHAR NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
        fecha_comparendo DATE NOT NULL,
        numero_comparendo TEXT,
        tipo_infraccion TEXT NOT NULL,
        descripcion TEXT,
        valor_comparendo INTEGER,
        estado comparendo_status NOT NULL DEFAULT 'pendiente',
        observaciones TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    console.log("[Migration] ✅ Tabla driver_comparendos verificada/creada");
  } catch (error: any) {
    console.error("[Migration] Error en driver_comparendos:", error.message);
    throw error;
  }
}
