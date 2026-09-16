import { db } from "../db";

/**
 * Adds the PHVA traceability columns to existing internal audit records.
 * The enum is already part of the shared schema and is created by Drizzle.
 */
export async function syncAuditoriasInternasPhva() {
  try {
    await db.execute(`
      ALTER TABLE auditorias_internas
        ADD COLUMN IF NOT EXISTS ciclo_phva ciclo_phva NOT NULL DEFAULT 'verificar',
        ADD COLUMN IF NOT EXISTS proceso_phva text,
        ADD COLUMN IF NOT EXISTS estandar_relacionado text
    `);
    console.log("[Migration] ✅ Trazabilidad PHVA de auditorías internas sincronizada");
  } catch (error: any) {
    console.error("[Migration] ❌ Error sincronizando PHVA de auditorías internas:", error?.message || error);
  }
}