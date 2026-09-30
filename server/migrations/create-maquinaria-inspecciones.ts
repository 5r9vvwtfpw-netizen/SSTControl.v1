import { db } from "../db";
import { sql } from "drizzle-orm";

/** Crea las tablas de maquinaria de forma segura para instalaciones existentes. */
export async function createMaquinariaInspecciones() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS maquinaria_inspecciones (
      id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      worker_id varchar NOT NULL REFERENCES workers(id),
      equipment_id varchar NOT NULL REFERENCES vehicles(id),
      assignment_id varchar NOT NULL REFERENCES driver_vehicle_assignments(id),
      inspection_date date NOT NULL,
      shift text NOT NULL,
      engine_hours numeric NOT NULL CHECK (engine_hours >= 0),
      work_front text,
      result text NOT NULL CHECK (result IN ('apta','no_apta')),
      checklist_version text NOT NULL DEFAULT 'maquinaria-amarilla-v1',
      answers jsonb NOT NULL,
      observations text,
      evidence_urls text[] NOT NULL DEFAULT '{}',
      created_at timestamp NOT NULL DEFAULT now(),
      CONSTRAINT maquinaria_inspecciones_equipo_fecha_turno_uk
        UNIQUE (company_id, equipment_id, inspection_date, shift)
    )
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS maquinaria_inspeccion_respuestas (
      id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
      inspection_id varchar NOT NULL REFERENCES maquinaria_inspecciones(id) ON DELETE CASCADE,
      section text NOT NULL,
      item_key text NOT NULL,
      answer text NOT NULL CHECK (answer IN ('conforme','falla','no_aplica')),
      comment text,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS maquinaria_inspecciones_company_date_idx ON maquinaria_inspecciones(company_id, inspection_date)`);
}