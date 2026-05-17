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
import { addChatAttachmentsMentions } from './migrations/add-chat-attachments-mentions';
import { createPesvTables } from './migrations/create-pesv-tables';
import { syncQuoteColumns } from './migrations/sync-quote-columns';
import { syncInvoiceSnapshotColumns } from './migrations/sync-invoice-snapshot-columns';
import { syncVehicleMaintenancesColumns } from './migrations/sync-vehicle-maintenances-columns';
import { syncVehicleDefaultMaxSpeed } from './migrations/sync-vehicle-default-max-speed';
import { createSstSpeedAlerts } from './migrations/create-sst-speed-alerts';
import { syncSafeRoutesColumns } from './migrations/sync-safe-routes-columns';
import { createCertificacionesProfesionales } from './migrations/create-certificaciones-profesionales';
import { syncPricingPluginSubscriptions } from './migrations/sync-pricing-plugin-subscriptions';
import { syncInvestigationParticipants } from './migrations/sync-investigation-participants';
import { syncDocumentAcknowledgmentsColumns } from './migrations/sync-document-acknowledgments-columns';
import { syncActividadAccionMejoraLink } from './migrations/sync-actividad-accion-mejora-link';
import { syncPcaTables } from './migrations/sync-pca-tables';
import { syncLsoSignatureColumns } from './migrations/sync-lso-signature-columns';
import { syncLsoIdentificationNumber } from './migrations/sync-lso-identification-number';
import { syncUnassignedAtColumn } from './migrations/sync-unassigned-at-column';
import { createNgoOnboardedCompanies } from './migrations/create-ngo-onboarded-companies';
import { createSupportChatMessages } from './migrations/create-support-chat-messages';
import { addPerformanceIndexes } from './migrations/add-performance-indexes';
import { syncLoginTrackingColumns } from './migrations/sync-login-tracking-columns';
import { syncCompanySedes } from './migrations/sync-company-sedes';
import { createPesvCriteriosEvidencias } from './migrations/create-pesv-criterios-evidencias';
import { createPesvFatigaAlcoholTables } from './migrations/create-pesv-fatiga-alcohol-tables';
import { migratePesvVictimasTable } from './migrations/create-pesv-victimas-table';
import { addPesvComiteP01Tables } from './migrations/add-pesv-comite-p01-tables';
import { syncMatrizLegalNormas } from './migrations/sync-matriz-legal-normas';
import { syncOnboardingColumns } from './migrations/sync-onboarding-columns';
import { createPesvEncuestaConductorTable } from './migrations/create-pesv-encuesta-conductor';
import { fixInvoiceStripeAmount } from './migrations/fix-invoice-stripe-amount';
import { syncRoadSafetyContentFields } from './migrations/sync-road-safety-content-fields';

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
    await syncInvestigationParticipants();
    await fixEvaluacionesPuntajes();
    await syncMedicalExamsDocumentUrl();
    await syncExternalLsoColumns();
    await syncDocumentSourceColumns();
    await syncCompanyVehiclesColumn();
    await createPesvTables();
    await syncPesvEvaluationColumns();
    await syncQuoteColumns();
    await syncInvoiceSnapshotColumns();
    await syncVehicleMaintenancesColumns();
    await syncVehicleDefaultMaxSpeed();
    await createSstSpeedAlerts();
    await syncSafeRoutesColumns();
    await createCertificacionesProfesionales();
    await syncPricingPluginSubscriptions();
    await syncDocumentAcknowledgmentsColumns();
    await syncActividadAccionMejoraLink();
    await syncPcaTables();
    await syncLsoSignatureColumns();
    await syncLsoIdentificationNumber();
    await syncUnassignedAtColumn();
    await createNgoOnboardedCompanies();
    await createSupportChatMessages();
    await addChatAttachmentsMentions();
    await addPerformanceIndexes();
    await syncLoginTrackingColumns();
    await syncCompanySedes();
    await addPesvComiteP01Tables();
    await syncMatrizLegalNormas();
    await createPesvCriteriosEvidencias();
    await createPesvFatigaAlcoholTables();
    await migratePesvVictimasTable();
    await syncOnboardingColumns();
    await createPesvEncuestaConductorTable();
    await fixInvoiceStripeAmount();
    await syncRoadSafetyContentFields();
    console.log('✅ Migraciones completadas exitosamente');
  } catch (error: any) {
    console.error('⚠️ Error en migraciones:', error.message);
  }
}
