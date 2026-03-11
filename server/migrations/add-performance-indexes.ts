import { sql } from "drizzle-orm";
import { db } from "../db";

export async function addPerformanceIndexes() {
  try {
    const result = await db.execute(sql`
      SELECT COUNT(*) as cnt FROM pg_indexes 
      WHERE indexname LIKE 'idx_%_company_id' 
        OR indexname LIKE 'idx_%_worker_id'
        OR indexname LIKE 'idx_%_evaluacion_id'
    `);
    const existingCount = parseInt((result as any)[0]?.cnt || '0', 10);
    if (existingCount >= 40) {
      console.log(`[Migration] Performance indexes already exist (${existingCount} found). Skipping.`);
      return;
    }
  } catch {}

  console.log("[Migration] Adding performance indexes...");
  const ddl = `
    CREATE INDEX IF NOT EXISTS idx_users_company_id ON users (company_id);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
    CREATE INDEX IF NOT EXISTS idx_workers_company_id ON workers (company_id);
    CREATE INDEX IF NOT EXISTS idx_workers_status ON workers (status);
    CREATE INDEX IF NOT EXISTS idx_accidents_company_id ON accidents (company_id);
    CREATE INDEX IF NOT EXISTS idx_trainings_company_id ON trainings (company_id);
    CREATE INDEX IF NOT EXISTS idx_inspections_company_id ON inspections (company_id);
    CREATE INDEX IF NOT EXISTS idx_support_tickets_company_id ON support_tickets (company_id);
    CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets (status);
    CREATE INDEX IF NOT EXISTS idx_hallazgos_auditoria_company_id ON hallazgos_auditoria (company_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs (entity_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_company_id ON audit_logs (company_id);
    CREATE INDEX IF NOT EXISTS idx_responsible_designations_company_id ON responsible_designations (company_id);
    CREATE INDEX IF NOT EXISTS idx_consent_records_company_id ON consent_records (company_id);
    CREATE INDEX IF NOT EXISTS idx_health_conditions_worker_id ON health_conditions (worker_id);
    CREATE INDEX IF NOT EXISTS idx_health_conditions_company_id ON health_conditions (company_id);
    CREATE INDEX IF NOT EXISTS idx_training_attendees_training_id ON training_attendees (training_id);
    CREATE INDEX IF NOT EXISTS idx_training_attendees_worker_id ON training_attendees (worker_id);
    CREATE INDEX IF NOT EXISTS idx_respuestas_estandares_evaluacion_id ON respuestas_estandares (evaluacion_id);
    CREATE INDEX IF NOT EXISTS idx_evaluaciones_sst_company_id ON evaluaciones_sst (company_id);
    CREATE INDEX IF NOT EXISTS idx_planes_trabajo_anual_company_id ON planes_trabajo_anual (company_id);
    CREATE INDEX IF NOT EXISTS idx_matriz_legal_company_id ON matriz_legal (company_id);
    CREATE INDEX IF NOT EXISTS idx_objetivos_sst_company_id ON objetivos_sst (company_id);
    CREATE INDEX IF NOT EXISTS idx_indicadores_sst_company_id ON indicadores_sst (company_id);
    CREATE INDEX IF NOT EXISTS idx_mediciones_indicadores_indicador_id ON mediciones_indicadores (indicador_id);
    CREATE INDEX IF NOT EXISTS idx_vehicles_company_id ON vehicles (company_id);
    CREATE INDEX IF NOT EXISTS idx_drivers_company_id ON drivers (company_id);
    CREATE INDEX IF NOT EXISTS idx_vehicle_inspections_company_id ON vehicle_inspections (company_id);
    CREATE INDEX IF NOT EXISTS idx_road_incidents_company_id ON road_incidents (company_id);
    CREATE INDEX IF NOT EXISTS idx_medical_exams_worker_id ON medical_exams (worker_id);
    CREATE INDEX IF NOT EXISTS idx_medical_exams_company_id ON medical_exams (company_id);
    CREATE INDEX IF NOT EXISTS idx_job_profiles_company_id ON job_profiles (company_id);
    CREATE INDEX IF NOT EXISTS idx_contracts_worker_id ON contracts (worker_id);
    CREATE INDEX IF NOT EXISTS idx_contracts_company_id ON contracts (company_id);
    CREATE INDEX IF NOT EXISTS idx_copasst_actas_company_id ON copasst_actas (company_id);
    CREATE INDEX IF NOT EXISTS idx_afiliaciones_ssss_company_id ON afiliaciones_ssss (company_id);
    CREATE INDEX IF NOT EXISTS idx_afiliaciones_ssss_worker_id ON afiliaciones_ssss (worker_id);
    CREATE INDEX IF NOT EXISTS idx_politicas_sst_company_id ON politicas_sst (company_id);
    CREATE INDEX IF NOT EXISTS idx_email_notifications_company_id ON email_notifications (company_id);
    CREATE INDEX IF NOT EXISTS idx_proveedores_contratistas_company_id ON proveedores_contratistas (company_id);
    CREATE INDEX IF NOT EXISTS idx_cambios_sst_company_id ON cambios_sst (company_id);
    CREATE INDEX IF NOT EXISTS idx_evaluaciones_pesv_company_id ON evaluaciones_pesv (company_id);
    CREATE INDEX IF NOT EXISTS idx_licensed_professional_assignments_company_id ON licensed_professional_assignments (company_id);
    CREATE INDEX IF NOT EXISTS idx_document_worker_assignments_company_id ON document_worker_assignments (company_id);
    CREATE INDEX IF NOT EXISTS idx_document_worker_assignments_worker_id ON document_worker_assignments (worker_id);
    CREATE INDEX IF NOT EXISTS idx_worker_absences_worker_id ON worker_absences (worker_id);
    CREATE INDEX IF NOT EXISTS idx_worker_absences_company_id ON worker_absences (company_id);
    CREATE INDEX IF NOT EXISTS idx_epp_deliveries_worker_id ON epp_deliveries (worker_id);
    CREATE INDEX IF NOT EXISTS idx_epp_deliveries_company_id ON epp_deliveries (company_id);
    CREATE INDEX IF NOT EXISTS idx_accident_investigations_accident_id ON accident_investigations (accident_id);
    CREATE INDEX IF NOT EXISTS idx_accident_investigations_company_id ON accident_investigations (company_id);
    CREATE INDEX IF NOT EXISTS idx_sve_cases_company_id ON sve_cases (company_id);
    CREATE INDEX IF NOT EXISTS idx_sve_cases_worker_id ON sve_cases (worker_id);
  `;

  try {
    await db.execute(sql.raw(ddl));
    console.log("[Migration] Performance indexes created successfully.");
  } catch (error: any) {
    console.warn(`[Migration] Performance indexes partial: ${error.message?.slice(0, 100)}`);
  }
}
