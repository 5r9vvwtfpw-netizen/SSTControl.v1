import { db } from "../db";
import { sql } from "drizzle-orm";

export async function createPesvInformeAnualEvidencias() {
  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS pesv_informe_anual_evidencias (
      id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      report_code varchar NOT NULL,
      file_url text NOT NULL,
      file_name text NOT NULL,
      file_size integer NOT NULL,
      content_type varchar NOT NULL DEFAULT 'application/pdf',
      uploaded_by varchar,
      uploaded_at timestamp NOT NULL DEFAULT now(),
      CONSTRAINT pesv_informe_anual_evidencias_company_report_unique UNIQUE (company_id, report_code)
    )
  `));
  await db.execute(sql.raw(`
    ALTER TABLE actos_administrativos_pesv
      DROP COLUMN IF EXISTS acta_maximo_organo_url,
      DROP COLUMN IF EXISTS acta_maximo_organo_file_name
  `));
  console.log("[Migration] Annual PESV evidence table ready; removed evidence fields from P01 administrative acts.");
}
