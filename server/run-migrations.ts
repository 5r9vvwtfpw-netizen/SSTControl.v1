import { syncAccidentInvestigationsTable } from './migrations/sync-accident-investigations';
import { syncInvestigationFindings } from './migrations/sync-investigation-findings';
import { syncWorkersPurchasedColumn } from './migrations/sync-workers-purchased';
import { syncAccidentTypeEnum } from './migrations/sync-accident-type-enum';
import { fixEvaluacionesPuntajes } from './migrations/fix-evaluaciones-puntajes';
import { syncMedicalExamsDocumentUrl } from './migrations/sync-medical-exams-document-url';
import { syncExternalLsoColumns } from './migrations/sync-external-lso-columns';
import { syncDocumentSourceColumns } from './migrations/sync-document-source-columns';
import { syncCompanyVehiclesColumn } from './migrations/sync-company-vehicles-column';
import { syncPesvEvaluationColumns } from './migrations/sync-pesv-evaluation-columns';

/**
 * Ejecuta migraciones de base de datos automáticamente
 * Sincroniza columnas faltantes en tablas críticas
 */
export async function runMigrations() {
  console.log('🔄 Ejecutando migraciones automáticas...');
  
  try {
    await syncWorkersPurchasedColumn();
    await syncAccidentTypeEnum();
    await syncAccidentInvestigationsTable();
    await syncInvestigationFindings();
    await fixEvaluacionesPuntajes();
    await syncMedicalExamsDocumentUrl();
    await syncExternalLsoColumns();
    await syncDocumentSourceColumns();
    await syncCompanyVehiclesColumn();
    await syncPesvEvaluationColumns();
    console.log('✅ Migraciones completadas exitosamente');
  } catch (error: any) {
    console.error('⚠️ Error en migraciones:', error.message);
  }
}
