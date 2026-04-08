import { db } from "../db";
import { sql } from "drizzle-orm";

export async function migratePesvVictimasTable() {
  console.log("[PESV H11] Checking victimas table...");

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS pesv_victimas_registros (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id VARCHAR NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        evaluacion_id VARCHAR REFERENCES evaluaciones_pesv(id) ON DELETE SET NULL,
        fecha_siniestro DATE NOT NULL,
        tipo_victima VARCHAR NOT NULL,
        nombre_victima VARCHAR,
        descripcion_siniestro TEXT NOT NULL,
        atencion_inmediata TEXT,
        remision_ips INTEGER DEFAULT 0,
        nombre_ips VARCHAR,
        estado_seguimiento VARCHAR NOT NULL DEFAULT 'activo',
        programa_acompanamiento INTEGER DEFAULT 0,
        responsable VARCHAR,
        observaciones TEXT,
        created_at TIMESTAMP DEFAULT now()
      )
    `);
    console.log("[PESV H11] Table pesv_victimas_registros created/verified");
    console.log("[PESV H11] Migration completed successfully");
  } catch (error) {
    console.error("[PESV H11] Migration error:", error);
    throw error;
  }
}
