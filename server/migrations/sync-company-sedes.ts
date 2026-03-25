import { db } from "../db";
import { sql } from "drizzle-orm";

export async function syncCompanySedes() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS company_sedes (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id VARCHAR NOT NULL REFERENCES companies(id),
        name TEXT NOT NULL,
        city TEXT,
        address TEXT,
        contact_phone TEXT,
        contact_email TEXT,
        is_main INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'activa',
        created_at TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
    console.log("[Migration] Tabla company_sedes creada/verificada");

    await db.execute(sql`
      ALTER TABLE workers ADD COLUMN IF NOT EXISTS sede_id VARCHAR REFERENCES company_sedes(id)
    `);
    console.log("[Migration] Columna sede_id agregada a workers");
  } catch (error: any) {
    console.error("[Migration] Error en syncCompanySedes:", error.message);
  }
}
