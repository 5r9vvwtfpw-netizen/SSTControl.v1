import { db } from '../db';
import { sql } from 'drizzle-orm';

export async function syncAccidentInvestigationsTable(): Promise<void> {
  console.log('[Migration] Sincronizando tabla accident_investigations...');
  
  try {
    const columnsToAdd = [
      { name: 'injured_worker_statement', type: 'TEXT' },
      { name: 'witness_statements', type: 'TEXT' },
      { name: 'analysis_methodology', type: "TEXT DEFAULT 'arbol_causas'" },
      { name: 'immediate_act_causes', type: 'TEXT[]' },
      { name: 'immediate_condition_causes', type: 'TEXT[]' },
      { name: 'basic_personal_causes', type: 'TEXT[]' },
      { name: 'basic_work_causes', type: 'TEXT[]' },
      { name: 'root_cause', type: 'TEXT' },
      { name: 'corrective_actions', type: 'TEXT' },
      { name: 'preventive_actions', type: 'TEXT' },
      { name: 'actions_implemented', type: 'INTEGER DEFAULT 0' },
      { name: 'actions_total', type: 'INTEGER DEFAULT 0' },
      { name: 'actions_closed_date', type: 'DATE' },
      { name: 'furat_number', type: 'TEXT' },
      { name: 'furat_date', type: 'DATE' },
      { name: 'ministry_report_number', type: 'TEXT' },
      { name: 'ministry_report_date', type: 'DATE' },
      { name: 'arl_notification_date', type: 'DATE' },
      { name: 'eps_notification_date', type: 'DATE' },
      { name: 'evidence_photos', type: 'TEXT[]' },
      { name: 'evidence_documents', type: 'TEXT[]' },
      { name: 'completion_percentage', type: 'INTEGER DEFAULT 0' },
      { name: 'created_by', type: 'VARCHAR' },
      { name: 'approved_by', type: 'VARCHAR' },
      { name: 'approved_at', type: 'TIMESTAMP' },
      { name: 'lesson_learned', type: 'TEXT' },
      { name: 'conclusions', type: "TEXT DEFAULT ''" },
      { name: 'licensed_professional_signature_url', type: 'TEXT' },
    ];

    for (const col of columnsToAdd) {
      try {
        await db.execute(sql.raw(`
          ALTER TABLE accident_investigations 
          ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}
        `));
      } catch (err: any) {
        if (!err.message?.includes('already exists')) {
          console.log(`[Migration] Columna ${col.name}: ${err.message}`);
        }
      }
    }

    console.log('[Migration] ✅ Tabla accident_investigations sincronizada correctamente');
  } catch (error: any) {
    console.error('[Migration] Error sincronizando accident_investigations:', error.message);
  }
}
