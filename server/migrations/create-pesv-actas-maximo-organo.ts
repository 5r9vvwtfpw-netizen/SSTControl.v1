import { db } from "../db";
import { sql } from "drizzle-orm";

export async function createPesvActasMaximoOrgano() {
  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS actas_maximo_organo_pesv (
      id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      numero_acta varchar NOT NULL,
      organo_social text NOT NULL,
      tipo_sesion text NOT NULL,
      fecha_reunion date NOT NULL,
      lugar text NOT NULL,
      asistentes text NOT NULL,
      quorum text NOT NULL,
      decision text NOT NULL,
      presidente_nombre text NOT NULL,
      secretario_nombre text NOT NULL,
      estado text NOT NULL DEFAULT 'borrador',
      created_by varchar,
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    )
  `));
  await db.execute(sql.raw(`
    CREATE INDEX IF NOT EXISTS idx_actas_maximo_organo_pesv_company_date
    ON actas_maximo_organo_pesv (company_id, fecha_reunion DESC)
  `));
}
