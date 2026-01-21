import { syncAccidentInvestigationsTable } from './migrations/sync-accident-investigations';
import { syncInvestigationFindings } from './migrations/sync-investigation-findings';
import { syncWorkersPurchasedColumn } from './migrations/sync-workers-purchased';

/**
 * Ejecuta migraciones de base de datos automáticamente
 * Sincroniza columnas faltantes en tablas críticas
 */
export async function runMigrations() {
  console.log('🔄 Ejecutando migraciones automáticas...');
  
  try {
    await syncWorkersPurchasedColumn();
    await syncAccidentInvestigationsTable();
    await syncInvestigationFindings();
    console.log('✅ Migraciones completadas exitosamente');
  } catch (error: any) {
    console.error('⚠️ Error en migraciones:', error.message);
  }
}
