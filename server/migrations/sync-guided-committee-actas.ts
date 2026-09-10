import { db } from "../db";
import { sql } from "drizzle-orm";

const columns = [
  ["hora_inicio", "TEXT"],
  ["hora_fin", "TEXT"],
  ["lugar", "TEXT"],
  ["modalidad", "TEXT NOT NULL DEFAULT 'presencial'"],
  ["periodo_comite", "TEXT"],
  ["tipo_reunion", "TEXT NOT NULL DEFAULT 'ordinaria'"],
  ["participantes", "JSONB NOT NULL DEFAULT '[]'::jsonb"],
  ["invitados", "JSONB NOT NULL DEFAULT '[]'::jsonb"],
  ["orden_dia", "JSONB NOT NULL DEFAULT '[]'::jsonb"],
  ["compromisos", "JSONB NOT NULL DEFAULT '[]'::jsonb"],
  ["firmantes", "JSONB NOT NULL DEFAULT '[]'::jsonb"],
  ["proxima_reunion", "DATE"],
  ["estado", "TEXT NOT NULL DEFAULT 'borrador'"],
  ["version", "INTEGER NOT NULL DEFAULT 1"],
  ["updated_at", "TIMESTAMP NOT NULL DEFAULT now()"],
] as const;

async function addColumns(tableName: string) {
  for (const [name, type] of columns) {
    await db.execute(sql.raw(`ALTER TABLE ${tableName} ADD COLUMN IF NOT EXISTS ${name} ${type}`));
  }
}

async function normalizeStatuses(tableName: string) {
  await db.execute(sql.raw(`
    UPDATE ${tableName}
    SET estado = CASE
      WHEN estado = 'anulada' THEN 'cerrada'
      WHEN estado IN ('pendiente_revision', 'pendiente_firmas', 'parcialmente_firmada', 'firmada') THEN 'aprobada'
      ELSE estado
    END
    WHERE estado IN ('anulada', 'pendiente_revision', 'pendiente_firmas', 'parcialmente_firmada', 'firmada')
  `));
}

export async function syncGuidedCommitteeActas() {
  console.log("[Migration] Sincronizando campos de actas guiadas...");
  await addColumns("copasst_actas");
  await addColumns("convivencia_actas");
  await normalizeStatuses("copasst_actas");
  await normalizeStatuses("convivencia_actas");
  console.log("[Migration] ✅ Campos de actas guiadas sincronizados");
}