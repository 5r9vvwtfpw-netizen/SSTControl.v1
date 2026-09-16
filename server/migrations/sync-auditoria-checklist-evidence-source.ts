import { db } from "../db";

/**
 * Adds structured evidence-source metadata to internal-audit checklist items.
 * Existing items default to an internal system record so current text evidence
 * remains usable without requiring an upload.
 */
export async function syncAuditoriaChecklistEvidenceSource() {
  try {
    await db.execute(`
      ALTER TABLE auditoria_checklists
        ADD COLUMN IF NOT EXISTS fuente_evidencia text NOT NULL DEFAULT 'registro_interno',
        ADD COLUMN IF NOT EXISTS modulo_evidencia text,
        ADD COLUMN IF NOT EXISTS referencia_evidencia text,
        ADD COLUMN IF NOT EXISTS fecha_evidencia date
    `);
    console.log("[Migration] ✅ Fuente estructurada de evidencia de auditorías sincronizada");
  } catch (error: any) {
    console.error("[Migration] ❌ Error sincronizando fuente de evidencia de auditorías:", error?.message || error);
  }
}