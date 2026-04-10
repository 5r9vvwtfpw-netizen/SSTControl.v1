import { db } from "../db";
import { sql } from "drizzle-orm";

export async function addPesvComiteP01Tables() {
  console.log("[MIGRATION] Adding PESV P01 tables: actos_administrativos_pesv, cronograma_reuniones_pesv, and funciones_responsabilidades column...");

  await db.execute(sql.raw(`
    DO $$ BEGIN
      CREATE TYPE estado_acto_administrativo AS ENUM ('vigente', 'modificado', 'anulado');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `));

  await db.execute(sql.raw(`
    DO $$ BEGIN
      CREATE TYPE estado_reunion_programada AS ENUM ('programada', 'realizada', 'cancelada', 'reprogramada');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `));

  await db.execute(sql.raw(`
    DO $$ BEGIN
      CREATE TYPE frecuencia_reunion AS ENUM ('semanal', 'quincenal', 'mensual', 'bimestral', 'trimestral', 'semestral', 'anual');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `));

  await db.execute(sql.raw(`ALTER TABLE comite_integrantes_pesv ADD COLUMN IF NOT EXISTS funciones_responsabilidades text`));

  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS actos_administrativos_pesv (
      id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      tipo_documento text NOT NULL,
      numero_documento text NOT NULL,
      fecha_expedicion date NOT NULL,
      fecha_vigencia date,
      firmado_por text NOT NULL,
      cargo_firmante text NOT NULL,
      objeto_conformacion text NOT NULL,
      considerandos text,
      articulado text,
      estado estado_acto_administrativo NOT NULL DEFAULT 'vigente',
      observaciones text,
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    )
  `));

  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS cronograma_reuniones_pesv (
      id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id varchar NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      anio integer NOT NULL,
      frecuencia frecuencia_reunion NOT NULL DEFAULT 'mensual',
      fecha_programada date NOT NULL,
      tema_principal text,
      estado estado_reunion_programada NOT NULL DEFAULT 'programada',
      acta_id varchar REFERENCES actas_comite_pesv(id),
      observaciones text,
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    )
  `));

  console.log("[MIGRATION] PESV P01 tables created successfully.");
}
