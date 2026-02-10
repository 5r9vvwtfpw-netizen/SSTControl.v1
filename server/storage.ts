import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless";
import { Pool as PgPool } from "pg";
import * as schema from "@shared/schema";
import { calculateChapter } from "@shared/utils";
import { logAuditEvent, type AuditContext } from './lib/audit-logger';
import logger from './lib/logger';
import { validateInvoiceData, validateCompanyForBilling, validateSubscriptionForBilling } from './lib/billing-validator';
import type {
  Company,
  InsertCompany,
  User,
  InsertUser,
  Worker,
  InsertWorker,
  Accident,
  InsertAccident,
  Training,
  InsertTraining,
  TrainingAttendee,
  InsertTrainingAttendee,
  Inspection,
  InsertInspection,
  PreventiveMeasure,
  InsertPreventiveMeasure,
  OccupationalDisease,
  InsertOccupationalDisease,
  HealthCondition,
  InsertHealthCondition,
  SociodemographicDiagnosis,
  InsertSociodemographicDiagnosis,
  SstStandard,
  InsertSstStandard,
  SstItem,
  InsertSstItem,
  SstEvaluation,
  InsertSstEvaluation,
  SstEvaluationItem,
  InsertSstEvaluationItem,
  SstEvidence,
  InsertSstEvidence,
  Vehicle,
  InsertVehicle,
  Driver,
  InsertDriver,
  VehicleInspection,
  InsertVehicleInspection,
  RoadIncident,
  InsertRoadIncident,
  RoadSafetyTraining,
  InsertRoadSafetyTraining,
  RoadSafetyAttendee,
  InsertRoadSafetyAttendee,
  PesvAudit,
  InsertPesvAudit,
  JobProfile,
  InsertJobProfile,
  Contract,
  InsertContract,
  MedicalExam,
  InsertMedicalExam,
  ResponsibleDesignation,
  InsertResponsibleDesignation,
  ResourceAllocation,
  InsertResourceAllocation,
  CopasstActa,
  InsertCopasstActa,
  AfiliacionSsss,
  InsertAfiliacionSsss,
  VerificacionMuestreoSgss,
  InsertVerificacionMuestreoSgss,
  DetalleVerificacionSgss,
  InsertDetalleVerificacionSgss,
  TrabajadorAltoRiesgo,
  InsertTrabajadorAltoRiesgo,
  ComiteConvivenciaActa,
  InsertComiteConvivenciaActa,
  ProgramaCapacitacion,
  InsertProgramaCapacitacion,
  Curso50Horas,
  InsertCurso50Horas,
  EmailNotification,
  InsertEmailNotification,
  EnvironmentalMeasurement,
  InsertEnvironmentalMeasurement,
  HazardousSubstance,
  InsertHazardousSubstance,
  TrainingProgram,
  InsertTrainingProgram,
  ProgramTraining,
  InsertProgramTraining,
  ProgramTrainingAttendance,
  InsertProgramTrainingAttendance,
  SveProgram,
  InsertSveProgram,
  SveCase,
  InsertSveCase,
  PoliticaSst,
  InsertPoliticaSst,
  RegistroInduccion,
  InsertRegistroInduccion,
  ComponenteSst,
  EstandarSst,
  EvaluacionSst,
  InsertEvaluacionSst,
  RespuestaEstandar,
  InsertRespuestaEstandar,
  AccionMejora,
  InsertAccionMejora,
  PlanTrabajoAnual,
  InsertPlanTrabajoAnual,
  ActividadPlanTrabajo,
  InsertActividadPlanTrabajo,
  MatrizLegal,
  InsertMatrizLegal,
  ObjetivoSst,
  InsertObjetivoSst,
  IndicadorSst,
  InsertIndicadorSst,
  MedicionIndicador,
  InsertMedicionIndicador,
  DatosCalculo,
  InsertDatosCalculo,
  ProveedorContratista,
  InsertProveedorContratista,
  EvaluacionProveedor,
  InsertEvaluacionProveedor,
  CriterioEvaluacion,
  InsertCriterioEvaluacion,
  RespuestaCriterio,
  InsertRespuestaCriterio,
  DocumentoProveedor,
  InsertDocumentoProveedor,
  SeguimientoProveedor,
  InsertSeguimientoProveedor,
  CambioSst,
  InsertCambioSst,
  EvaluacionImpactoCambio,
  InsertEvaluacionImpactoCambio,
  ControlCambio,
  InsertControlCambio,
  CapacitacionCambio,
  InsertCapacitacionCambio,
  SeguimientoCambio,
  InsertSeguimientoCambio,
  AprobacionCambio,
  InsertAprobacionCambio,
  AutomatizacionCambioLog,
  InsertAutomatizacionCambioLog,
  SolicitudAdquisicion,
  InsertSolicitudAdquisicion,
  EvaluacionAdquisicion,
  InsertEvaluacionAdquisicion,
  EspecificacionTecnica,
  InsertEspecificacionTecnica,
  HojaSeguridad,
  InsertHojaSeguridad,
  AdquisicionItem,
  InsertAdquisicionItem,
  VerificacionAdquisicion,
  InsertVerificacionAdquisicion,
  PlanComunicacionSst,
  InsertPlanComunicacionSst,
  ComunicacionSst,
  InsertComunicacionSst,
  LecturaComunicacion,
  InsertLecturaComunicacion,
  ReporteTrabajador,
  InsertReporteTrabajador,
  HistorialComunicacionSst,
  InsertHistorialComunicacionSst,
  AuditoriaInterna,
  InsertAuditoriaInterna,
  AuditoriaAuditor,
  InsertAuditoriaAuditor,
  AuditoriaChecklist,
  InsertAuditoriaChecklist,
  HallazgoAuditoria,
  InsertHallazgoAuditoria,
  PlanAccionAuditoria,
  InsertPlanAccionAuditoria,
  RevisionDireccion,
  InsertRevisionDireccion,
  ParticipanteRevision,
  InsertParticipanteRevision,
  TemaRevision,
  InsertTemaRevision,
  DecisionRevision,
  InsertDecisionRevision,
  AccionRevision,
  InsertAccionRevision,
  ConsentRecord,
  InsertConsentRecord,
  ArcoRequest,
  InsertArcoRequest,
  SubscriptionPlan,
  Subscription,
  InsertSubscription,
  PaymentSource,
  InsertPaymentSource,
  PaymentTransaction,
  InsertPaymentTransaction,
  Invoice,
  InsertInvoice,
  SstDocument,
  InsertSstDocument,
  SstDocumentVersion,
  InsertSstDocumentVersion,
  SstDocumentAccessLog,
  InsertSstDocumentAccessLog,
  SstDocumentAlert,
  InsertSstDocumentAlert,
  CapacitacionCatalogo,
  InsertCapacitacionCatalogo,
  CapacitacionEvento,
  InsertCapacitacionEvento,
  CapacitacionAsistente,
  InsertCapacitacionAsistente,
  PlanEmergencia,
  InsertPlanEmergencia,
  BrigadaEmergencia,
  InsertBrigadaEmergencia,
  MiembroBrigada,
  InsertMiembroBrigada,
  AnalisisVulnerabilidad,
  InsertAnalisisVulnerabilidad,
  RecursoEmergencia,
  InsertRecursoEmergencia,
  InspeccionRecursoEmergencia,
  InsertInspeccionRecursoEmergencia,
  Simulacro,
  InsertSimulacro,
  ParticipanteSimulacro,
  InsertParticipanteSimulacro,
  ZonaEvacuacion,
  InsertZonaEvacuacion,
  RutaEvacuacion,
  InsertRutaEvacuacion,
  PuntoEncuentro,
  InsertPuntoEncuentro,
  RecomendacionArlAutoridad,
  InsertRecomendacionArlAutoridad,
  SeguimientoRecomendacion,
  InsertSeguimientoRecomendacion,
  ProviderAccessLog,
  InsertProviderAccessLog,
  WorkerPortalAccessLog,
  InsertWorkerPortalAccessLog,
  SupportTicket,
  InsertSupportTicket,
  TicketResponse,
  InsertTicketResponse,
  TicketStatusHistory,
  InsertTicketStatusHistory,
  InternalMessage,
  InsertInternalMessage,
  SupportAccessSession,
  InsertSupportAccessSession,
  SupportAccessEvent,
  InsertSupportAccessEvent,
  HighRiskWorker,
  InsertHighRiskWorker,
  CopasstPeriodo,
  InsertCopasstPeriodo,
  CopasstMiembro,
  InsertCopasstMiembro,
  CopasstEleccion,
  InsertCopasstEleccion,
  CopasstCandidato,
  InsertCopasstCandidato,
  CopasstRegistroVotacion,
  InsertCopasstRegistroVotacion,
  CopasstVoto,
  InsertCopasstVoto,
  CopasstCurso,
  InsertCopasstCurso,
  CopasstLeccion,
  InsertCopasstLeccion,
  CopasstQuizPregunta,
  InsertCopasstQuizPregunta,
  CopasstProgreso,
  InsertCopasstProgreso,
  CopasstCertificado,
  InsertCopasstCertificado,
  CopasstInsignia,
  InsertCopasstInsignia,
  CopasstInsigniaUsuario,
  InsertCopasstInsigniaUsuario,
  CopasstRachaUsuario,
  InsertCopasstRachaUsuario,
  CopasstPuntosMensuales,
  InsertCopasstPuntosMensuales,
  CopasstEscenario,
  InsertCopasstEscenario,
  CopasstEscenarioNodo,
  InsertCopasstEscenarioNodo,
  CopasstEscenarioProgreso,
  InsertCopasstEscenarioProgreso,
  CopasstCursoCategoria,
  InsertCopasstCursoCategoria,
  CopasstCursoAsignacion,
  InsertCopasstCursoAsignacion,
  CopasstBancoPregunta,
  InsertCopasstBancoPregunta,
  CopasstNotificacion,
  InsertCopasstNotificacion,
  CopasstEvaluacionPeriodo,
  InsertCopasstEvaluacionPeriodo,
  CopasstCompetencia,
  InsertCopasstCompetencia,
  CopasstEvaluacionItem,
  InsertCopasstEvaluacionItem,
  CopasstEvaluacionAsignacion,
  InsertCopasstEvaluacionAsignacion,
  CopasstEvaluacionRespuesta,
  InsertCopasstEvaluacionRespuesta,
  CopasstEvaluacionResultado,
  InsertCopasstEvaluacionResultado,
  ConvivenciaPeriodo,
  InsertConvivenciaPeriodo,
  ConvivenciaMiembro,
  InsertConvivenciaMiembro,
  ConvivenciaEleccion,
  InsertConvivenciaEleccion,
  ConvivenciaCandidato,
  InsertConvivenciaCandidato,
  ConvivenciaRegistroVotacion,
  InsertConvivenciaRegistroVotacion,
  ConvivenciaVoto,
  InsertConvivenciaVoto,
  ConvivenciaActa,
  InsertConvivenciaActa,
  PromotionPreventionActivity,
  InsertPromotionPreventionActivity,
  PromotionPreventionParticipant,
  InsertPromotionPreventionParticipant,
  AccidentStatistics,
  InsertAccidentStatistics,
  EvsProgram,
  InsertEvsProgram,
  EvsActivity,
  InsertEvsActivity,
  EvsControl,
  InsertEvsControl,
  EvsIncident,
  InsertEvsIncident,
  EvsFollowup,
  InsertEvsFollowup,
  EvsParticipant,
  InsertEvsParticipant,
  AudiometryRecord,
  InsertAudiometryRecord,
  NoiseExposureProfile,
  InsertNoiseExposureProfile,
  WorkerExposureAssignment,
  InsertWorkerExposureAssignment,
  PcaControlAction,
  InsertPcaControlAction,
  PcaProgram,
  InsertPcaProgram,
  DocumentWorkerAssignment,
  InsertDocumentWorkerAssignment,
  DocumentAcknowledgment,
  InsertDocumentAcknowledgment,
  CompanyExtraSeats,
  InsertCompanyExtraSeats,
} from "@shared/schema";
import { eq, desc, asc, and, or, lt, lte, gte, sql, inArray, isNotNull, isNull, count } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import ws from "ws";

// Configure Neon to use ws for WebSocket connections
neonConfig.webSocketConstructor = ws;

const PostgresSessionStore = connectPg(session);

// AWS RDS detection for production environment
const isProduction = process.env.NODE_ENV === 'production';
const hasAwsRds = !!(process.env.AWS_RDS_HOST && process.env.AWS_RDS_PASSWORD);

// Connection pool configuration to prevent "Too many connections" errors
const poolConfig = {
  max: 10, // Maximum connections in pool
  idleTimeoutMillis: 30000, // Close idle connections after 30s
  connectionTimeoutMillis: 10000, // Timeout after 10s when connecting
};

// Use 'any' type to avoid TypeScript conflicts between NeonPool and PgPool interfaces
// Both drivers are functionally compatible at runtime
let pool: any;
let db: any;

if (isProduction && hasAwsRds) {
  // Production: AWS RDS PostgreSQL - SSL configured in object, not in connection string
  const awsConnectionString = `postgresql://${process.env.AWS_RDS_USER || 'postgres'}:${process.env.AWS_RDS_PASSWORD}@${process.env.AWS_RDS_HOST}:${process.env.AWS_RDS_PORT || '5432'}/${process.env.AWS_RDS_DATABASE || 'postgres'}`;
  pool = new PgPool({ 
    connectionString: awsConnectionString,
    ...poolConfig,
    ssl: { rejectUnauthorized: false }
  });
  db = drizzlePg({ client: pool, schema });
  console.log('[Storage] Connected to AWS RDS PostgreSQL (Production, max:', poolConfig.max, 'connections)');
} else {
  // Development: Neon PostgreSQL with connection pool limits
  pool = new NeonPool({ 
    connectionString: process.env.DATABASE_URL,
    ...poolConfig,
    ssl: { rejectUnauthorized: false }
  });
  db = drizzleNeon(pool, { schema });
  console.log('[Storage] Connected to Neon PostgreSQL (Development, max:', poolConfig.max, 'connections)');
}

export interface IStorage {
  sessionStore: session.Store;
  
  // Company methods
  getCompanies(): Promise<Company[]>;
  getCompany(id: string): Promise<Company | undefined>;
  getCompanyByNit(nit: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: string, company: Partial<InsertCompany>): Promise<Company | undefined>;
  deleteCompany(id: string): Promise<void>;
  deleteCompanyWithAllData(id: string): Promise<{ deletedTables: string[], totalDeleted: number, failedTables?: string[] }>;
  
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByWorkerId(workerId: string): Promise<User | undefined>;
  getUsersByWorkerIds(workerIds: string[]): Promise<Map<string, User>>;
  getUsersByCompany(companyId: string): Promise<User[]>;
  getUsersByRole(roles: string[], companyId: string): Promise<User[]>;
  getUsersByRoleGlobal(role: string): Promise<User[]>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  updateUserSpecialties(id: string, specialties: string[]): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;

  // Worker methods (company-scoped)
  getWorkers(companyId: string): Promise<Worker[]>;
  getAllWorkers(): Promise<Worker[]>; // For admin: get all workers from all companies
  getWorker(id: string, companyId: string): Promise<Worker | undefined>;
  getWorkerById(id: string): Promise<Worker | undefined>; // For admin: get worker by id without company filter
  getWorkerByContract(contractNumber: string, companyId: string): Promise<Worker | undefined>;
  getWorkerByEmail(email: string, companyId: string): Promise<Worker | undefined>;
  createWorker(worker: InsertWorker, companyId: string, userId?: string, auditContext?: AuditContext): Promise<Worker>;
  updateWorker(id: string, worker: Partial<InsertWorker>, companyId: string, userId?: string, auditContext?: AuditContext): Promise<Worker | undefined>;
  deleteWorker(id: string, companyId: string, userId?: string, auditContext?: AuditContext, cascade?: boolean): Promise<{ deletedRecords: Record<string, number> }>;

  // Health condition methods (company-scoped)
  getHealthConditions(companyId: string): Promise<HealthCondition[]>;
  getHealthConditionsByWorker(workerId: string): Promise<HealthCondition[]>;
  createHealthCondition(data: InsertHealthCondition): Promise<HealthCondition>;
  updateHealthCondition(id: string, data: Partial<InsertHealthCondition>): Promise<HealthCondition | undefined>;
  deleteHealthCondition(id: string): Promise<void>;

  // Sociodemographic diagnosis cycle methods (company-scoped - Standard 3.1.1)
  getSociodemographicDiagnoses(companyId: string): Promise<SociodemographicDiagnosis[]>;
  getCurrentSociodemographicDiagnosis(companyId: string): Promise<SociodemographicDiagnosis | undefined>;
  getSociodemographicDiagnosisByYear(companyId: string, year: number): Promise<SociodemographicDiagnosis | undefined>;
  createSociodemographicDiagnosis(data: InsertSociodemographicDiagnosis): Promise<SociodemographicDiagnosis>;
  closeSociodemographicDiagnosis(id: string, companyId: string, closedBy: string, totalWorkers: number, totalConditions: number, observations?: string): Promise<SociodemographicDiagnosis | undefined>;

  // Accident methods (company-scoped)
  getAccidents(companyId: string): Promise<Accident[]>;
  getAllAccidents(): Promise<Accident[]>; // For admin: get all accidents from all companies
  getAccident(id: string, companyId: string): Promise<Accident | undefined>;
  getAccidentById(id: string): Promise<Accident | undefined>; // For admin: get accident by id without company filter
  createAccident(accident: InsertAccident, companyId: string): Promise<Accident>;
  updateAccident(id: string, accident: Partial<InsertAccident>, companyId: string): Promise<Accident | undefined>;
  deleteAccident(id: string, companyId: string): Promise<void>;

  // Training methods (company-scoped)
  getTrainings(companyId: string): Promise<Training[]>;
  getAllTrainings(): Promise<Training[]>; // For admin: get all trainings from all companies
  getTraining(id: string, companyId: string): Promise<Training | undefined>;
  getTrainingById(id: string): Promise<Training | undefined>; // For admin: get training by id without company filter
  createTraining(training: InsertTraining, companyId: string): Promise<Training>;
  updateTraining(id: string, training: Partial<InsertTraining>, companyId: string): Promise<Training | undefined>;
  deleteTraining(id: string, companyId: string): Promise<void>;

  // Training attendee methods (company-scoped via training)
  getTrainingAttendees(trainingId: string, companyId: string): Promise<TrainingAttendee[]>;
  getTrainingAttendeesByWorker(workerId: string): Promise<TrainingAttendee[]>;
  getTrainingAttendeeById(id: string): Promise<TrainingAttendee | undefined>;
  updateTrainingAttendee(id: string, data: Partial<{ confirmed: number; confirmedAt: Date }>): Promise<TrainingAttendee | undefined>;
  addTrainingAttendee(attendee: InsertTrainingAttendee, companyId: string): Promise<TrainingAttendee>;
  updateAttendance(trainingId: string, workerId: string, attended: number, companyId: string): Promise<void>;

  // Inspection methods (company-scoped)
  getInspections(companyId: string): Promise<Inspection[]>;
  getAllInspections(): Promise<Inspection[]>; // For admin: get all inspections from all companies
  getInspection(id: string, companyId: string): Promise<Inspection | undefined>;
  getInspectionById(id: string): Promise<Inspection | undefined>; // For admin: get inspection by id without company filter
  createInspection(inspection: InsertInspection, companyId: string): Promise<Inspection>;
  updateInspection(id: string, inspection: Partial<InsertInspection>, companyId: string): Promise<Inspection | undefined>;
  deleteInspection(id: string, companyId: string): Promise<void>;

  // Inspections-IPERC linkage methods (company-scoped)
  getPeligrosVinculadosByInspeccion(inspeccionId: string, companyId: string): Promise<schema.InspeccionPeligroVinculado[]>;
  getAllInspeccionesPeligrosVinculados(companyId?: string): Promise<schema.InspeccionPeligroVinculado[]>; // For admin: all companies
  getInspeccionPeligroVinculado(id: string, companyId: string): Promise<schema.InspeccionPeligroVinculado | undefined>;
  getInspeccionPeligroVinculadoById(id: string): Promise<schema.InspeccionPeligroVinculado | undefined>; // For admin: get by id without company filter
  createInspeccionPeligroVinculado(vinculo: schema.InsertInspeccionPeligroVinculado, companyId: string, userId: string): Promise<schema.InspeccionPeligroVinculado>;
  updateInspeccionPeligroVinculado(id: string, vinculo: Partial<schema.InsertInspeccionPeligroVinculado>, companyId: string): Promise<schema.InspeccionPeligroVinculado | undefined>;
  deleteInspeccionPeligroVinculado(id: string, companyId: string): Promise<void>;

  // Preventive measure methods (company-scoped)
  getPreventiveMeasures(companyId: string): Promise<PreventiveMeasure[]>;
  getPreventiveMeasure(id: string, companyId: string): Promise<PreventiveMeasure | undefined>;
  createPreventiveMeasure(measure: InsertPreventiveMeasure, companyId: string): Promise<PreventiveMeasure>;
  updatePreventiveMeasure(id: string, measure: Partial<InsertPreventiveMeasure>, companyId: string): Promise<PreventiveMeasure | undefined>;
  deletePreventiveMeasure(id: string, companyId: string): Promise<void>;

  // ARL/Authority Recommendations methods (Estándar 7.1.4 Resolución 0312/2019)
  getRecomendacionesArl(companyId: string): Promise<RecomendacionArlAutoridad[]>;
  getRecomendacionArl(id: string, companyId: string): Promise<RecomendacionArlAutoridad | undefined>;
  createRecomendacionArl(recomendacion: InsertRecomendacionArlAutoridad, companyId: string, userId: string): Promise<RecomendacionArlAutoridad>;
  updateRecomendacionArl(id: string, recomendacion: Partial<InsertRecomendacionArlAutoridad>, companyId: string, userId: string): Promise<RecomendacionArlAutoridad | undefined>;
  deleteRecomendacionArl(id: string, companyId: string): Promise<void>;

  // Seguimiento Recomendaciones methods
  getSeguimientosRecomendacion(recomendacionId: string): Promise<SeguimientoRecomendacion[]>;
  createSeguimientoRecomendacion(seguimiento: InsertSeguimientoRecomendacion, userId: string): Promise<SeguimientoRecomendacion>;

  // Occupational disease methods (company-scoped)
  getOccupationalDiseases(companyId: string): Promise<OccupationalDisease[]>;
  getOccupationalDisease(id: string, companyId: string): Promise<OccupationalDisease | undefined>;
  createOccupationalDisease(disease: InsertOccupationalDisease, companyId: string): Promise<OccupationalDisease>;
  updateOccupationalDisease(id: string, disease: Partial<InsertOccupationalDisease>, companyId: string): Promise<OccupationalDisease | undefined>;
  deleteOccupationalDisease(id: string, companyId: string): Promise<void>;

  // SST Standards methods
  getSstStandards(): Promise<SstStandard[]>;
  getSstStandard(id: string): Promise<SstStandard | undefined>;
  createSstStandard(standard: InsertSstStandard): Promise<SstStandard>;
  updateSstStandard(id: string, standard: Partial<InsertSstStandard>): Promise<SstStandard | undefined>;
  deleteSstStandard(id: string): Promise<void>;

  // SST Items methods
  getSstItems(): Promise<SstItem[]>;
  getSstItemsByStandard(standardId: string): Promise<SstItem[]>;
  getSstItem(id: string): Promise<SstItem | undefined>;
  createSstItem(item: InsertSstItem): Promise<SstItem>;
  updateSstItem(id: string, item: Partial<InsertSstItem>): Promise<SstItem | undefined>;
  deleteSstItem(id: string): Promise<void>;

  // SST Evaluations methods (company-scoped)
  getSstEvaluations(companyId: string): Promise<SstEvaluation[]>;
  getSstEvaluation(id: string, companyId: string): Promise<SstEvaluation | undefined>;
  createSstEvaluation(evaluation: InsertSstEvaluation, companyId: string): Promise<SstEvaluation>;
  updateSstEvaluation(id: string, evaluation: Partial<InsertSstEvaluation>, companyId: string): Promise<SstEvaluation | undefined>;
  deleteSstEvaluation(id: string, companyId: string): Promise<void>;

  // SST Evaluation Items methods (company-scoped via evaluation)
  getSstEvaluationItems(evaluationId: string, companyId: string): Promise<SstEvaluationItem[]>;
  getSstEvaluationItem(id: string, companyId: string): Promise<SstEvaluationItem | undefined>;
  createSstEvaluationItem(item: InsertSstEvaluationItem, companyId: string): Promise<SstEvaluationItem>;
  updateSstEvaluationItem(id: string, item: Partial<InsertSstEvaluationItem>, companyId: string): Promise<SstEvaluationItem | undefined>;
  deleteSstEvaluationItem(id: string, companyId: string): Promise<void>;
  recalculateEvaluationScore(evaluationId: string, companyId: string): Promise<void>;

  // SST Evidence methods (company-scoped via evaluation item)
  getSstEvidence(evaluationItemId: string, companyId: string): Promise<SstEvidence[]>;
  getSstEvidenceItem(id: string, companyId: string): Promise<SstEvidence | undefined>;
  createSstEvidence(evidence: InsertSstEvidence, companyId: string): Promise<SstEvidence>;
  deleteSstEvidence(id: string, companyId: string): Promise<void>;

  // PESV - Vehicle methods (company-scoped)
  getVehicles(companyId: string): Promise<Vehicle[]>;
  getAllVehicles(): Promise<Vehicle[]>; // For admin: get all vehicles from all companies
  getVehicle(id: string, companyId: string): Promise<Vehicle | undefined>;
  getVehicleById(id: string): Promise<Vehicle | undefined>; // For admin: get vehicle by id without company filter
  createVehicle(vehicle: InsertVehicle, companyId: string): Promise<Vehicle>;
  updateVehicle(id: string, vehicle: Partial<InsertVehicle>, companyId: string): Promise<Vehicle | undefined>;
  deleteVehicle(id: string, companyId: string): Promise<void>;

  // PESV - Driver methods (company-scoped)
  getDrivers(companyId: string): Promise<Driver[]>;
  getAllDrivers(): Promise<Driver[]>; // For admin: get all drivers from all companies
  getDriver(id: string, companyId: string): Promise<Driver | undefined>;
  getDriverById(id: string): Promise<Driver | undefined>; // For admin: get driver by id without company filter
  createDriver(driver: InsertDriver, companyId: string): Promise<Driver>;
  updateDriver(id: string, driver: Partial<InsertDriver>, companyId: string): Promise<Driver | undefined>;
  deleteDriver(id: string, companyId: string): Promise<void>;

  // PESV - Vehicle Inspection methods (company-scoped)
  getVehicleInspections(companyId: string): Promise<VehicleInspection[]>;
  getAllVehicleInspections(): Promise<VehicleInspection[]>; // For admin: get all vehicle inspections from all companies
  getVehicleInspection(id: string, companyId: string): Promise<VehicleInspection | undefined>;
  getVehicleInspectionById(id: string): Promise<VehicleInspection | undefined>; // For admin: get vehicle inspection by id without company filter
  getVehicleInspectionsByVehicle(vehicleId: string, companyId: string): Promise<VehicleInspection[]>;
  getVehicleInspectionsByDriver(driverId: string, companyId: string): Promise<VehicleInspection[]>;
  createVehicleInspection(inspection: InsertVehicleInspection, companyId: string): Promise<VehicleInspection>;
  updateVehicleInspection(id: string, inspection: Partial<InsertVehicleInspection>, companyId: string): Promise<VehicleInspection | undefined>;
  deleteVehicleInspection(id: string, companyId: string): Promise<void>;

  // PESV - Road Incident methods (company-scoped)
  getRoadIncidents(companyId: string): Promise<RoadIncident[]>;
  getAllRoadIncidents(): Promise<RoadIncident[]>; // For admin: get all road incidents from all companies
  getRoadIncident(id: string, companyId: string): Promise<RoadIncident | undefined>;
  getRoadIncidentById(id: string): Promise<RoadIncident | undefined>; // For admin: get road incident by id without company filter
  getRoadIncidentsByVehicle(vehicleId: string, companyId: string): Promise<RoadIncident[]>;
  getRoadIncidentsByDriver(driverId: string, companyId: string): Promise<RoadIncident[]>;
  createRoadIncident(incident: InsertRoadIncident, companyId: string): Promise<RoadIncident>;
  updateRoadIncident(id: string, incident: Partial<InsertRoadIncident>, companyId: string): Promise<RoadIncident | undefined>;
  deleteRoadIncident(id: string, companyId: string): Promise<void>;

  // PESV - Road Safety Training methods (company-scoped)
  getRoadSafetyTrainings(companyId: string): Promise<RoadSafetyTraining[]>;
  getRoadSafetyTraining(id: string, companyId: string): Promise<RoadSafetyTraining | undefined>;
  createRoadSafetyTraining(training: InsertRoadSafetyTraining, companyId: string): Promise<RoadSafetyTraining>;
  updateRoadSafetyTraining(id: string, training: Partial<InsertRoadSafetyTraining>, companyId: string): Promise<RoadSafetyTraining | undefined>;
  deleteRoadSafetyTraining(id: string, companyId: string): Promise<void>;

  // PESV - Evaluation-scoped query methods (for filtering by evaluacionPesvId)
  getVehicleInspectionsByEvaluacion(companyId: string, evaluacionPesvId: string): Promise<VehicleInspection[]>;
  getRoadIncidentsByEvaluacion(companyId: string, evaluacionPesvId: string): Promise<RoadIncident[]>;
  getRoadSafetyTrainingsByEvaluacion(companyId: string, evaluacionPesvId: string): Promise<RoadSafetyTraining[]>;

  // PESV - Road Safety Attendee methods (company-scoped via training)
  getRoadSafetyAttendees(trainingId: string, companyId: string): Promise<RoadSafetyAttendee[]>;
  addRoadSafetyAttendee(attendee: InsertRoadSafetyAttendee, companyId: string): Promise<RoadSafetyAttendee>;
  updateRoadSafetyAttendance(trainingId: string, driverId: string, attended: number, companyId: string): Promise<void>;

  // PESV - PESV Audit methods (company-scoped)
  getPesvAudits(companyId: string): Promise<PesvAudit[]>;
  getPesvAudit(id: string, companyId: string): Promise<PesvAudit | undefined>;
  createPesvAudit(audit: InsertPesvAudit, companyId: string): Promise<PesvAudit>;
  updatePesvAudit(id: string, audit: Partial<InsertPesvAudit>, companyId: string): Promise<PesvAudit | undefined>;
  deletePesvAudit(id: string, companyId: string): Promise<void>;

  // PESV - Comité de Seguridad Vial (Paso 2 - Res. 40595/2022)
  getComiteIntegrantesPesv(companyId: string): Promise<schema.ComiteIntegrantePesv[]>;
  getComiteIntegrantePesv(id: string, companyId: string): Promise<schema.ComiteIntegrantePesv | undefined>;
  createComiteIntegrantePesv(integrante: schema.InsertComiteIntegrantePesv, companyId: string): Promise<schema.ComiteIntegrantePesv>;
  updateComiteIntegrantePesv(id: string, integrante: Partial<schema.InsertComiteIntegrantePesv>, companyId: string): Promise<schema.ComiteIntegrantePesv | undefined>;
  deleteComiteIntegrantePesv(id: string, companyId: string): Promise<void>;

  // PESV - Actas Comité Seguridad Vial (Paso 2)
  getActasComitePesv(companyId: string): Promise<schema.ActaComitePesv[]>;
  getActaComitePesv(id: string, companyId: string): Promise<schema.ActaComitePesv | undefined>;
  createActaComitePesv(acta: schema.InsertActaComitePesv, companyId: string): Promise<schema.ActaComitePesv>;
  updateActaComitePesv(id: string, acta: Partial<schema.InsertActaComitePesv>, companyId: string): Promise<schema.ActaComitePesv | undefined>;
  deleteActaComitePesv(id: string, companyId: string): Promise<void>;

  // PESV - Vehicle Maintenances (Res. 40595/2022 - H06)
  getVehicleMaintenances(companyId: string): Promise<schema.VehicleMaintenance[]>;
  getVehicleMaintenance(id: string): Promise<schema.VehicleMaintenance | undefined>;
  createVehicleMaintenance(data: schema.InsertVehicleMaintenance, companyId: string): Promise<schema.VehicleMaintenance>;
  updateVehicleMaintenance(id: string, data: Partial<schema.InsertVehicleMaintenance>): Promise<schema.VehicleMaintenance>;
  deleteVehicleMaintenance(id: string): Promise<void>;

  // PESV - Vehicle GPS Tracking (Res. 40595/2022 - H07)
  getVehicleGpsTrackings(companyId: string): Promise<schema.VehicleGpsTracking[]>;
  getVehicleGpsTracking(id: string): Promise<schema.VehicleGpsTracking | undefined>;
  createVehicleGpsTracking(data: schema.InsertVehicleGpsTracking, companyId: string): Promise<schema.VehicleGpsTracking>;
  deleteVehicleGpsTracking(id: string): Promise<void>;

  // PESV - Safe Routes (Res. 40595/2022 - H08)
  getSafeRoutes(companyId: string): Promise<schema.SafeRoute[]>;
  getSafeRoute(id: string): Promise<schema.SafeRoute | undefined>;
  createSafeRoute(data: schema.InsertSafeRoute, companyId: string): Promise<schema.SafeRoute>;
  updateSafeRoute(id: string, data: Partial<schema.InsertSafeRoute>): Promise<schema.SafeRoute>;
  deleteSafeRoute(id: string): Promise<void>;
  
  // Job Profile methods (company-scoped)
  getJobProfiles(companyId: string): Promise<JobProfile[]>;
  getAllJobProfiles(): Promise<JobProfile[]>; // For admin: get all job profiles from all companies
  getJobProfile(id: string, companyId: string): Promise<JobProfile | undefined>;
  getJobProfileById(id: string): Promise<JobProfile | undefined>; // For admin: get job profile by id without company filter
  createJobProfile(profile: InsertJobProfile, companyId: string): Promise<JobProfile>;
  updateJobProfile(id: string, profile: Partial<InsertJobProfile>, companyId: string): Promise<JobProfile | undefined>;
  getJobProfileReferences(id: string): Promise<{ workers: number; medicalExams: number; altoRiesgo: number; contracts: number; designaciones: number }>;
  deleteJobProfile(id: string, companyId: string): Promise<void>;
  disassociateWorkersFromJobProfile(jobProfileId: string): Promise<number>;
  
  // Contract methods (company-scoped)
  getAllContracts(): Promise<Contract[]>; // For admin: get all contracts from all companies
  getContracts(companyId: string): Promise<Contract[]>;
  getContract(id: string, companyId: string): Promise<Contract | undefined>;
  getContractById(id: string): Promise<Contract | undefined>; // For admin: get contract by id without company filter
  getContractsByWorker(workerId: string, companyId: string): Promise<Contract[]>;
  getContractByNumber(contractNumber: string, companyId: string): Promise<Contract | undefined>;
  createContract(contract: InsertContract, companyId: string): Promise<Contract>;
  updateContract(id: string, contract: Partial<InsertContract>, companyId: string): Promise<Contract | undefined>;
  deleteContract(id: string, companyId: string): Promise<void>;
  
  // Medical Exam methods (company-scoped)
  getMedicalExams(companyId: string): Promise<MedicalExam[]>;
  getMedicalExam(id: string, companyId: string): Promise<MedicalExam | undefined>;
  getMedicalExamById(id: string): Promise<MedicalExam | undefined>; // For admin: get by id without company filter
  getMedicalExamsByWorker(workerId: string, companyId: string): Promise<MedicalExam[]>;
  getUpcomingMedicalExams(daysAhead: number): Promise<MedicalExam[]>;
  getCompanyAdminEmails(companyId: string): Promise<string[]>;
  createMedicalExam(exam: InsertMedicalExam, companyId: string): Promise<MedicalExam>;
  updateMedicalExam(id: string, exam: Partial<InsertMedicalExam>, companyId: string): Promise<MedicalExam | undefined>;
  deleteMedicalExam(id: string, companyId: string): Promise<void>;
  
  // Responsible Designation methods (company-scoped) - PLANEAR/Recursos
  getResponsibleDesignations(companyId: string): Promise<ResponsibleDesignation[]>;
  getResponsibleDesignation(id: string, companyId: string): Promise<ResponsibleDesignation | undefined>;
  getResponsibleDesignationById(id: string): Promise<ResponsibleDesignation | undefined>; // For admin: without company filter
  createResponsibleDesignation(designation: InsertResponsibleDesignation, companyId: string): Promise<ResponsibleDesignation>;
  updateResponsibleDesignation(id: string, designation: Partial<InsertResponsibleDesignation>, companyId: string): Promise<ResponsibleDesignation | undefined>;
  deleteResponsibleDesignation(id: string, companyId: string): Promise<void>;

  // Resource Allocation methods (company-scoped) - PLANEAR/Recursos
  getResourceAllocations(companyId: string): Promise<ResourceAllocation[]>;
  getResourceAllocation(id: string, companyId: string): Promise<ResourceAllocation | undefined>;
  createResourceAllocation(allocation: InsertResourceAllocation, companyId: string): Promise<ResourceAllocation>;
  updateResourceAllocation(id: string, allocation: Partial<InsertResourceAllocation>, companyId: string): Promise<ResourceAllocation | undefined>;
  deleteResourceAllocation(id: string, companyId: string): Promise<void>;
  getRecursosFinancieros(companyId: string): Promise<Array<ResourceAllocation & { presupuestoDisponible: number }>>;
  updateMontoEjecutado(id: string, monto: number, companyId: string): Promise<ResourceAllocation | undefined>;

  // COPASST Actas methods (company-scoped)
  getCopasstActas(companyId: string): Promise<CopasstActa[]>;
  getCopasstActa(id: string, companyId: string): Promise<CopasstActa | undefined>;
  createCopasstActa(acta: InsertCopasstActa, companyId: string): Promise<CopasstActa>;
  updateCopasstActa(id: string, acta: Partial<InsertCopasstActa>, companyId: string): Promise<CopasstActa | undefined>;
  updateCopasstActaFile(id: string, fileData: { archivoAdjuntoUrl: string | null; archivoAdjuntoNombre: string | null }, companyId: string): Promise<CopasstActa | undefined>;
  deleteCopasstActa(id: string, companyId: string): Promise<void>;

  // Afiliaciones SSSS methods (company-scoped)
  getAfiliacionesSsss(companyId: string): Promise<AfiliacionSsss[]>;
  getAllAfiliacionesSsss(): Promise<AfiliacionSsss[]>; // For admin: get all from all companies
  getAfiliacionSsss(id: string, companyId: string): Promise<AfiliacionSsss | undefined>;
  getAfiliacionSsssById(id: string): Promise<AfiliacionSsss | undefined>; // For admin: get by id without company filter
  createAfiliacionSsss(afiliacion: InsertAfiliacionSsss, companyId: string): Promise<AfiliacionSsss>;
  updateAfiliacionSsss(id: string, afiliacion: Partial<InsertAfiliacionSsss>, companyId: string): Promise<AfiliacionSsss | undefined>;
  deleteAfiliacionSsss(id: string, companyId: string): Promise<void>;
  bulkDeleteAfiliacionesSsss(companyId: string): Promise<{ deleted: number; total: number; errors: string[] }>;

  // Verificación de Muestreo SGSS - Estándar 1.1.4 (company-scoped)
  getVerificacionesMuestreoSgss(companyId: string): Promise<VerificacionMuestreoSgss[]>;
  getVerificacionMuestreoSgss(id: string, companyId: string): Promise<VerificacionMuestreoSgss | undefined>;
  getVerificacionMuestreoSgssById(id: string): Promise<VerificacionMuestreoSgss | undefined>;
  createVerificacionMuestreoSgss(verificacion: InsertVerificacionMuestreoSgss, companyId: string): Promise<VerificacionMuestreoSgss>;
  updateVerificacionMuestreoSgss(id: string, verificacion: Partial<InsertVerificacionMuestreoSgss>, companyId: string): Promise<VerificacionMuestreoSgss | undefined>;
  deleteVerificacionMuestreoSgss(id: string, companyId: string): Promise<void>;

  // Detalle de Verificación SGSS por trabajador
  getDetallesVerificacionSgss(verificacionId: string): Promise<DetalleVerificacionSgss[]>;
  getDetalleVerificacionSgss(id: string): Promise<DetalleVerificacionSgss | undefined>;
  createDetalleVerificacionSgss(detalle: InsertDetalleVerificacionSgss): Promise<DetalleVerificacionSgss>;
  updateDetalleVerificacionSgss(id: string, detalle: Partial<InsertDetalleVerificacionSgss>): Promise<DetalleVerificacionSgss | undefined>;
  deleteDetalleVerificacionSgss(id: string): Promise<void>;

  // Comité de Convivencia Actas methods (company-scoped)
  getComiteConvivenciaActas(companyId: string): Promise<ComiteConvivenciaActa[]>;
  getComiteConvivenciaActa(id: string, companyId: string): Promise<ComiteConvivenciaActa | undefined>;
  createComiteConvivenciaActa(acta: InsertComiteConvivenciaActa, companyId: string): Promise<ComiteConvivenciaActa>;
  updateComiteConvivenciaActa(id: string, acta: Partial<InsertComiteConvivenciaActa>, companyId: string): Promise<ComiteConvivenciaActa | undefined>;
  deleteComiteConvivenciaActa(id: string, companyId: string): Promise<void>;

  // Programa de Capacitación methods (company-scoped)
  getProgramasCapacitacion(companyId: string): Promise<ProgramaCapacitacion[]>;
  getProgramaCapacitacion(id: string, companyId: string): Promise<ProgramaCapacitacion | undefined>;
  createProgramaCapacitacion(programa: InsertProgramaCapacitacion, companyId: string): Promise<ProgramaCapacitacion>;
  updateProgramaCapacitacion(id: string, programa: Partial<InsertProgramaCapacitacion>, companyId: string): Promise<ProgramaCapacitacion | undefined>;
  deleteProgramaCapacitacion(id: string, companyId: string): Promise<void>;

  // Catálogo de Capacitaciones SST (global)
  getCapacitacionesCatalogo(): Promise<CapacitacionCatalogo[]>;
  getCapacitacionCatalogo(id: string): Promise<CapacitacionCatalogo | undefined>;
  getCapacitacionCatalogoByCodigo(codigo: string): Promise<CapacitacionCatalogo | undefined>;

  // Eventos de Capacitación (company-scoped)
  getCapacitacionEventos(companyId: string): Promise<CapacitacionEvento[]>;
  getAllCapacitacionEventos(): Promise<CapacitacionEvento[]>; // For admin
  getCapacitacionEvento(id: string, companyId: string): Promise<CapacitacionEvento | undefined>;
  getCapacitacionEventoById(id: string): Promise<CapacitacionEvento | undefined>; // For admin
  createCapacitacionEvento(evento: InsertCapacitacionEvento, companyId: string): Promise<CapacitacionEvento>;
  updateCapacitacionEvento(id: string, evento: Partial<InsertCapacitacionEvento>, companyId: string): Promise<CapacitacionEvento | undefined>;
  deleteCapacitacionEvento(id: string, companyId: string): Promise<void>;

  // Asistentes a Capacitación (company-scoped via evento)
  getCapacitacionAsistentes(eventoId: string): Promise<CapacitacionAsistente[]>;
  getCapacitacionAsistente(id: string): Promise<CapacitacionAsistente | undefined>;
  createCapacitacionAsistente(asistente: InsertCapacitacionAsistente, companyId: string): Promise<CapacitacionAsistente>;
  updateCapacitacionAsistente(id: string, asistente: Partial<InsertCapacitacionAsistente>): Promise<CapacitacionAsistente | undefined>;
  deleteCapacitacionAsistente(id: string): Promise<void>;
  getAsistentesByWorker(workerId: string): Promise<CapacitacionAsistente[]>;

  // Curso de 50 Horas methods (company-scoped)
  getCurso50Horas(companyId: string): Promise<Curso50Horas | undefined>;
  upsertCurso50Horas(curso: Partial<InsertCurso50Horas>, companyId: string): Promise<Curso50Horas>;

  // Registros de Inducción methods (company-scoped)
  getRegistrosInduccion(companyId: string): Promise<RegistroInduccion[]>;
  getRegistroInduccion(id: string, companyId: string): Promise<RegistroInduccion | undefined>;
  getRegistroInduccionById(id: string): Promise<RegistroInduccion | undefined>; // For admin: without company filter
  getRegistrosInduccionByWorker(workerId: string, companyId: string): Promise<RegistroInduccion[]>;
  createRegistroInduccion(registro: InsertRegistroInduccion, companyId: string): Promise<RegistroInduccion>;
  updateRegistroInduccion(id: string, registro: Partial<InsertRegistroInduccion>, companyId: string): Promise<RegistroInduccion | undefined>;
  deleteRegistroInduccion(id: string, companyId: string): Promise<void>;

  // Email Notification methods (company-scoped)
  getEmailNotifications(companyId: string): Promise<EmailNotification[]>;
  getEmailNotification(id: string, companyId: string): Promise<EmailNotification | undefined>;
  createEmailNotification(notification: InsertEmailNotification): Promise<EmailNotification>;
  updateEmailNotification(id: string, notification: Partial<InsertEmailNotification>): Promise<EmailNotification | undefined>;
  getPendingNotifications(companyId: string): Promise<EmailNotification[]>;
  
  // Notification Helper methods
  getUpcomingExamRenewals(companyId: string, daysAhead: number): Promise<Array<{
    exam: MedicalExam;
    worker: Worker;
  }>>;
  getUpcomingTrainingRenewals(companyId: string, daysAhead: number): Promise<Array<{
    training: Training;
    attendees: Array<{ worker: Worker; completedDate: string }>;
  }>>;
  
  // Environmental Measurement methods (company-scoped) - Gestión Ambiental Ocupacional
  getEnvironmentalMeasurements(companyId: string): Promise<EnvironmentalMeasurement[]>;
  getAllEnvironmentalMeasurements(): Promise<EnvironmentalMeasurement[]>; // For admin: get all environmental measurements from all companies
  getEnvironmentalMeasurement(id: string, companyId: string): Promise<EnvironmentalMeasurement | undefined>;
  getEnvironmentalMeasurementById(id: string): Promise<EnvironmentalMeasurement | undefined>; // For admin: get environmental measurement by id without company filter
  createEnvironmentalMeasurement(measurement: InsertEnvironmentalMeasurement, companyId: string): Promise<EnvironmentalMeasurement>;
  updateEnvironmentalMeasurement(id: string, measurement: Partial<InsertEnvironmentalMeasurement>, companyId: string): Promise<EnvironmentalMeasurement | undefined>;
  deleteEnvironmentalMeasurement(id: string, companyId: string): Promise<void>;
  
  // Hazardous Substance methods (company-scoped) - Gestión Ambiental Ocupacional
  getHazardousSubstances(companyId: string): Promise<HazardousSubstance[]>;
  getHazardousSubstance(id: string, companyId: string): Promise<HazardousSubstance | undefined>;
  createHazardousSubstance(substance: InsertHazardousSubstance, companyId: string): Promise<HazardousSubstance>;
  updateHazardousSubstance(id: string, substance: Partial<InsertHazardousSubstance>, companyId: string): Promise<HazardousSubstance | undefined>;
  deleteHazardousSubstance(id: string, companyId: string): Promise<void>;
  
  // Training Program methods (company-scoped) - Programa de Capacitación SST
  getTrainingPrograms(companyId: string): Promise<TrainingProgram[]>;
  getTrainingProgram(id: string, companyId: string): Promise<TrainingProgram | undefined>;
  getTrainingProgramByYear(year: number, companyId: string): Promise<TrainingProgram | undefined>;
  createTrainingProgram(program: InsertTrainingProgram, companyId: string): Promise<TrainingProgram>;
  updateTrainingProgram(id: string, program: Partial<InsertTrainingProgram>, companyId: string): Promise<TrainingProgram | undefined>;
  deleteTrainingProgram(id: string, companyId: string): Promise<void>;
  
  // Program Training methods (company-scoped) - Capacitaciones específicas del programa
  getProgramTrainings(programId: string, companyId: string): Promise<ProgramTraining[]>;
  getProgramTraining(id: string, companyId: string): Promise<ProgramTraining | undefined>;
  createProgramTraining(training: InsertProgramTraining, companyId: string): Promise<ProgramTraining>;
  updateProgramTraining(id: string, training: Partial<InsertProgramTraining>, companyId: string): Promise<ProgramTraining | undefined>;
  deleteProgramTraining(id: string, companyId: string): Promise<void>;
  
  // Program Training Attendance methods (company-scoped) - Registro de asistencia
  getProgramTrainingAttendance(trainingId: string, companyId: string): Promise<ProgramTrainingAttendance[]>;
  createProgramTrainingAttendance(attendance: InsertProgramTrainingAttendance, companyId: string): Promise<ProgramTrainingAttendance>;
  updateProgramTrainingAttendance(id: string, attendance: Partial<InsertProgramTrainingAttendance>, companyId: string): Promise<ProgramTrainingAttendance | undefined>;
  deleteProgramTrainingAttendance(id: string, companyId: string): Promise<void>;
  bulkCreateProgramTrainingAttendance(attendances: InsertProgramTrainingAttendance[], companyId: string): Promise<ProgramTrainingAttendance[]>;
  
  // SVE Program methods (company-scoped) - Sistema de Vigilancia Epidemiológica Ocupacional
  getSvePrograms(companyId: string): Promise<SveProgram[]>;
  getSveProgram(id: string, companyId: string): Promise<SveProgram | undefined>;
  createSveProgram(program: InsertSveProgram, companyId: string): Promise<SveProgram>;
  updateSveProgram(id: string, program: Partial<InsertSveProgram>, companyId: string): Promise<SveProgram | undefined>;
  deleteSveProgram(id: string, companyId: string): Promise<void>;
  
  // SVE Case methods (company-scoped) - Casos de vigilancia epidemiológica
  getSveCases(programId: string, companyId: string): Promise<SveCase[]>;
  getSveCase(id: string, companyId: string): Promise<SveCase | undefined>;
  createSveCase(sveCase: InsertSveCase, companyId: string): Promise<SveCase>;
  updateSveCase(id: string, sveCase: Partial<InsertSveCase>, companyId: string): Promise<SveCase | undefined>;
  deleteSveCase(id: string, companyId: string): Promise<void>;
  
  // Políticas SST methods (company-scoped) - Sistema de gestión de políticas de seguridad y salud
  getPoliticasSst(companyId: string): Promise<PoliticaSst[]>;
  getPoliticaSst(id: string, companyId: string): Promise<PoliticaSst | undefined>;
  getPoliticaSstVigente(companyId: string): Promise<PoliticaSst | undefined>;
  createPoliticaSst(politica: InsertPoliticaSst, companyId: string): Promise<PoliticaSst>;
  updatePoliticaSst(id: string, politica: Partial<InsertPoliticaSst>, companyId: string): Promise<PoliticaSst | undefined>;
  deletePoliticaSst(id: string, companyId: string): Promise<void>;
  
  // Componentes SST methods - Catálogo de 7 componentes de Resolución 0312/2019
  getComponentesSst(): Promise<ComponenteSst[]>;
  getComponenteSst(id: string): Promise<ComponenteSst | undefined>;
  
  // Estándares SST methods - Catálogo de 60 estándares mínimos
  getEstandaresSst(componenteId?: string): Promise<EstandarSst[]>;
  getEstandarSst(id: string): Promise<EstandarSst | undefined>;
  getEstandaresByTipoEmpresa(tipoEmpresa: string): Promise<EstandarSst[]>;
  
  // Evaluaciones SST methods (company-scoped) - Evaluación anual de estándares
  getEvaluacionesSst(companyId: string): Promise<EvaluacionSst[]>;
  getAllEvaluacionesSst(): Promise<EvaluacionSst[]>;
  getEvaluacionSst(id: string, companyId: string): Promise<EvaluacionSst | undefined>;
  getEvaluacionSstById(id: string): Promise<EvaluacionSst | undefined>;
  getEvaluacionSstByYear(anio: number, companyId: string): Promise<EvaluacionSst | undefined>;
  createEvaluacionSst(evaluacion: InsertEvaluacionSst, companyId: string): Promise<EvaluacionSst>;
  updateEvaluacionSst(id: string, evaluacion: Partial<InsertEvaluacionSst>, companyId: string): Promise<EvaluacionSst | undefined>;
  deleteEvaluacionSst(id: string, companyId: string): Promise<void>;
  calcularPuntajesEvaluacion(evaluacionId: string, companyId: string): Promise<void>;
  
  // Respuestas Estándares methods (company-scoped) - Respuestas individuales a cada estándar
  getRespuestasEstandares(evaluacionId: string, companyId: string): Promise<RespuestaEstandar[]>;
  getRespuestaEstandar(id: string, companyId: string): Promise<RespuestaEstandar | undefined>;
  createRespuestaEstandar(respuesta: InsertRespuestaEstandar, companyId: string): Promise<RespuestaEstandar>;
  updateRespuestaEstandar(id: string, respuesta: Partial<InsertRespuestaEstandar>, companyId: string): Promise<RespuestaEstandar | undefined>;
  deleteRespuestaEstandar(id: string, companyId: string): Promise<void>;
  
  // Acciones Mejora methods (company-scoped) - Plan de mejora basado en hallazgos
  getAccionesMejora(evaluacionId: string, companyId: string): Promise<AccionMejora[]>;
  getAllAccionesMejora(companyId: string): Promise<AccionMejora[]>;
  getAccionMejora(id: string, companyId: string): Promise<AccionMejora | undefined>;
  createAccionMejora(accion: InsertAccionMejora, companyId: string): Promise<AccionMejora>;
  updateAccionMejora(id: string, accion: Partial<InsertAccionMejora>, companyId: string): Promise<AccionMejora | undefined>;
  deleteAccionMejora(id: string, companyId: string): Promise<void>;
  generarPlanMejoraAutomatico(evaluacionId: string, companyId: string): Promise<AccionMejora[]>;
  
  // Plan Anual de Trabajo methods (company-scoped) - PLANEAR/Gestión Integral
  getPlanesTrabajoAnual(companyId: string): Promise<PlanTrabajoAnual[]>;
  getPlanTrabajoAnual(id: string, companyId: string): Promise<PlanTrabajoAnual | undefined>;
  getPlanTrabajoByYear(anio: number, companyId: string): Promise<PlanTrabajoAnual | undefined>;
  createPlanTrabajoAnual(plan: InsertPlanTrabajoAnual, companyId: string): Promise<PlanTrabajoAnual>;
  updatePlanTrabajoAnual(id: string, plan: Partial<InsertPlanTrabajoAnual>, companyId: string): Promise<PlanTrabajoAnual | undefined>;
  deletePlanTrabajoAnual(id: string, companyId: string): Promise<void>;
  actualizarMetricasPlan(planId: string, companyId: string): Promise<void>;
  
  // Actividades Plan Trabajo methods (company-scoped) - Actividades del plan anual
  getActividadesPlanTrabajo(planId: string, companyId: string): Promise<ActividadPlanTrabajo[]>;
  getActividadPlanTrabajo(id: string, companyId: string): Promise<ActividadPlanTrabajo | undefined>;
  createActividadPlanTrabajo(actividad: InsertActividadPlanTrabajo, companyId: string): Promise<ActividadPlanTrabajo>;
  updateActividadPlanTrabajo(id: string, actividad: Partial<InsertActividadPlanTrabajo>, companyId: string): Promise<ActividadPlanTrabajo | undefined>;
  deleteActividadPlanTrabajo(id: string, companyId: string): Promise<void>;
  
  // Matriz Legal methods (company-scoped) - Normatividad colombiana SST
  getMatrizLegal(companyId: string): Promise<MatrizLegal[]>;
  getMatrizLegalItem(id: string, companyId: string): Promise<MatrizLegal | undefined>;
  createMatrizLegalItem(item: InsertMatrizLegal, companyId: string): Promise<MatrizLegal>;
  updateMatrizLegalItem(id: string, item: Partial<InsertMatrizLegal>, companyId: string): Promise<MatrizLegal | undefined>;
  deleteMatrizLegalItem(id: string, companyId: string): Promise<void>;
  initializeMatrizLegal(companyId: string): Promise<void>;
  validateMatrizLegalCompliance(companyId: string): Promise<void>;
  
  // Objetivos SST methods (company-scoped) - Objetivos SMART del Sistema de Gestión SST
  getObjetivosSst(companyId: string): Promise<ObjetivoSst[]>;
  getObjetivoSst(id: string, companyId: string): Promise<ObjetivoSst | undefined>;
  createObjetivoSst(objetivo: InsertObjetivoSst, companyId: string): Promise<ObjetivoSst>;
  updateObjetivoSst(id: string, objetivo: Partial<InsertObjetivoSst>, companyId: string): Promise<ObjetivoSst | undefined>;
  deleteObjetivoSst(id: string, companyId: string): Promise<void>;
  
  // Indicadores SST methods (company-scoped) - Indicadores de Estructura, Proceso y Resultado
  getIndicadoresSst(companyId: string, objetivoId?: string): Promise<IndicadorSst[]>;
  getIndicadorSst(id: string, companyId: string): Promise<IndicadorSst | undefined>;
  createIndicadorSst(indicador: InsertIndicadorSst, companyId: string): Promise<IndicadorSst>;
  updateIndicadorSst(id: string, indicador: Partial<InsertIndicadorSst>, companyId: string): Promise<IndicadorSst | undefined>;
  deleteIndicadorSst(id: string, companyId: string): Promise<void>;
  
  // Mediciones de Indicadores methods (company-scoped) - Mediciones históricas de indicadores
  getMedicionesIndicador(indicadorId: string, companyId: string): Promise<MedicionIndicador[]>;
  getMedicionIndicador(id: string, companyId: string): Promise<MedicionIndicador | undefined>;
  createMedicionIndicador(medicion: InsertMedicionIndicador, companyId: string): Promise<MedicionIndicador>;
  updateMedicionIndicador(id: string, medicion: Partial<InsertMedicionIndicador>, companyId: string): Promise<MedicionIndicador | undefined>;
  deleteMedicionIndicador(id: string, companyId: string): Promise<void>;

  // Datos de Cálculo Indicadores methods (company-scoped) - Datos base para cálculos automáticos (NTC-3701/3793)
  getAllDatosCalculo(companyId: string): Promise<DatosCalculo[]>;
  getDatosCalculo(id: string, companyId: string): Promise<DatosCalculo | undefined>;
  getDatosCalculoByPeriodo(periodo: string, companyId: string): Promise<DatosCalculo | undefined>;
  createDatosCalculo(datos: InsertDatosCalculo, companyId: string): Promise<DatosCalculo>;
  updateDatosCalculo(id: string, datos: Partial<InsertDatosCalculo>, companyId: string): Promise<DatosCalculo | undefined>;
  deleteDatosCalculo(id: string, companyId: string): Promise<void>;
  
  // Proveedores y Contratistas methods (company-scoped) - Evaluación SST según Decreto 1072/2015 y Res. 0312/2019
  getProveedoresContratistas(companyId: string): Promise<ProveedorContratista[]>;
  getProveedorContratista(id: string, companyId: string): Promise<ProveedorContratista | undefined>;
  createProveedorContratista(proveedor: InsertProveedorContratista, companyId: string): Promise<ProveedorContratista>;
  updateProveedorContratista(id: string, proveedor: Partial<InsertProveedorContratista>, companyId: string): Promise<ProveedorContratista | undefined>;
  deleteProveedorContratista(id: string, companyId: string): Promise<void>;
  
  // Evaluaciones de Proveedores methods (company-scoped)
  getEvaluacionesProveedor(proveedorId: string, companyId: string): Promise<EvaluacionProveedor[]>;
  getAllEvaluacionesProveedores(companyId: string): Promise<EvaluacionProveedor[]>;
  getEvaluacionProveedor(id: string, companyId: string): Promise<EvaluacionProveedor | undefined>;
  createEvaluacionProveedor(evaluacion: InsertEvaluacionProveedor, companyId: string): Promise<EvaluacionProveedor>;
  updateEvaluacionProveedor(id: string, evaluacion: Partial<InsertEvaluacionProveedor>, companyId: string): Promise<EvaluacionProveedor | undefined>;
  deleteEvaluacionProveedor(id: string, companyId: string): Promise<void>;
  calcularPuntajeEvaluacionProveedor(evaluacionId: string, companyId: string): Promise<void>;
  
  // Criterios de Evaluación methods (company-scoped) - Criterios configurables por empresa
  getCriteriosEvaluacion(companyId: string): Promise<CriterioEvaluacion[]>;
  getCriterioEvaluacion(id: string, companyId: string): Promise<CriterioEvaluacion | undefined>;
  createCriterioEvaluacion(criterio: InsertCriterioEvaluacion, companyId: string): Promise<CriterioEvaluacion>;
  updateCriterioEvaluacion(id: string, criterio: Partial<InsertCriterioEvaluacion>, companyId: string): Promise<CriterioEvaluacion | undefined>;
  deleteCriterioEvaluacion(id: string, companyId: string): Promise<void>;
  initializeCriteriosEvaluacion(companyId: string): Promise<void>;
  
  // Respuestas a Criterios methods (company-scoped)
  getRespuestasCriterios(evaluacionId: string): Promise<RespuestaCriterio[]>;
  getRespuestaCriterio(id: string): Promise<RespuestaCriterio | undefined>;
  createRespuestaCriterio(respuesta: InsertRespuestaCriterio): Promise<RespuestaCriterio>;
  updateRespuestaCriterio(id: string, respuesta: Partial<InsertRespuestaCriterio>): Promise<RespuestaCriterio | undefined>;
  deleteRespuestaCriterio(id: string): Promise<void>;
  
  // Documentos de Proveedores methods (company-scoped)
  getDocumentosProveedor(proveedorId: string, companyId: string): Promise<DocumentoProveedor[]>;
  getDocumentoProveedor(id: string, companyId: string): Promise<DocumentoProveedor | undefined>;
  createDocumentoProveedor(documento: InsertDocumentoProveedor, companyId: string): Promise<DocumentoProveedor>;
  updateDocumentoProveedor(id: string, documento: Partial<InsertDocumentoProveedor>, companyId: string): Promise<DocumentoProveedor | undefined>;
  deleteDocumentoProveedor(id: string, companyId: string): Promise<void>;
  
  // Seguimientos a Proveedores methods (company-scoped)
  getSeguimientosProveedor(proveedorId: string, companyId: string): Promise<SeguimientoProveedor[]>;
  getAllSeguimientosProveedores(companyId: string): Promise<SeguimientoProveedor[]>;
  getSeguimientoProveedor(id: string, companyId: string): Promise<SeguimientoProveedor | undefined>;
  createSeguimientoProveedor(seguimiento: InsertSeguimientoProveedor, companyId: string): Promise<SeguimientoProveedor>;
  updateSeguimientoProveedor(id: string, seguimiento: Partial<InsertSeguimientoProveedor>, companyId: string): Promise<SeguimientoProveedor | undefined>;
  deleteSeguimientoProveedor(id: string, companyId: string): Promise<void>;

  // ========================================
  // Gestión de Cambios SST methods (company-scoped) - Decreto 1072/2015 Art. 2.2.4.6.26
  // ========================================
  
  // Cambios SST methods
  getCambiosSst(companyId: string): Promise<CambioSst[]>;
  getCambioSst(id: string, companyId: string): Promise<CambioSst | undefined>;
  getCambiosByCodigo(codigo: string, companyId: string): Promise<CambioSst[]>;
  createCambioSst(cambio: InsertCambioSst, companyId: string): Promise<CambioSst>;
  updateCambioSst(id: string, cambio: Partial<InsertCambioSst>, companyId: string): Promise<CambioSst | undefined>;
  deleteCambioSst(id: string, companyId: string): Promise<void>;
  generateCodigoCambio(companyId: string): Promise<string>;
  
  // Evaluaciones de Impacto methods
  getAllEvaluacionesImpacto(companyId: string): Promise<EvaluacionImpactoCambio[]>;
  getEvaluacionesImpactoCambio(cambioId: string, companyId: string): Promise<EvaluacionImpactoCambio[]>;
  getEvaluacionImpactoCambio(id: string, companyId: string): Promise<EvaluacionImpactoCambio | undefined>;
  createEvaluacionImpactoCambio(evaluacion: InsertEvaluacionImpactoCambio, companyId: string): Promise<EvaluacionImpactoCambio>;
  updateEvaluacionImpactoCambio(id: string, evaluacion: Partial<InsertEvaluacionImpactoCambio>, companyId: string): Promise<EvaluacionImpactoCambio | undefined>;
  deleteEvaluacionImpactoCambio(id: string, companyId: string): Promise<void>;
  
  // Controles de Cambios methods
  getControlesCambio(cambioId: string, companyId: string): Promise<ControlCambio[]>;
  getControlCambio(id: string, companyId: string): Promise<ControlCambio | undefined>;
  createControlCambio(control: InsertControlCambio, companyId: string): Promise<ControlCambio>;
  updateControlCambio(id: string, control: Partial<InsertControlCambio>, companyId: string): Promise<ControlCambio | undefined>;
  deleteControlCambio(id: string, companyId: string): Promise<void>;
  
  // Capacitaciones de Cambios methods
  getCapacitacionesCambio(cambioId: string, companyId: string): Promise<CapacitacionCambio[]>;
  getCapacitacionCambio(id: string, companyId: string): Promise<CapacitacionCambio | undefined>;
  createCapacitacionCambio(capacitacion: InsertCapacitacionCambio, companyId: string): Promise<CapacitacionCambio>;
  updateCapacitacionCambio(id: string, capacitacion: Partial<InsertCapacitacionCambio>, companyId: string): Promise<CapacitacionCambio | undefined>;
  deleteCapacitacionCambio(id: string, companyId: string): Promise<void>;
  
  // Seguimientos de Cambios methods
  getSeguimientosCambio(cambioId: string, companyId: string): Promise<SeguimientoCambio[]>;
  getSeguimientoCambio(id: string, companyId: string): Promise<SeguimientoCambio | undefined>;
  createSeguimientoCambio(seguimiento: InsertSeguimientoCambio, companyId: string): Promise<SeguimientoCambio>;
  updateSeguimientoCambio(id: string, seguimiento: Partial<InsertSeguimientoCambio>, companyId: string): Promise<SeguimientoCambio | undefined>;
  deleteSeguimientoCambio(id: string, companyId: string): Promise<void>;
  
  // Aprobaciones de Cambios methods
  getAprobacionesCambio(cambioId: string, companyId: string): Promise<AprobacionCambio[]>;
  getAprobacionCambio(id: string, companyId: string): Promise<AprobacionCambio | undefined>;
  createAprobacionCambio(aprobacion: InsertAprobacionCambio, companyId: string): Promise<AprobacionCambio>;
  updateAprobacionCambio(id: string, aprobacion: Partial<InsertAprobacionCambio>, companyId: string): Promise<AprobacionCambio | undefined>;
  deleteAprobacionCambio(id: string, companyId: string): Promise<void>;
  
  // Automatización de Cambios methods
  getAutomatizacionLogsForCompany(companyId: string): Promise<AutomatizacionCambioLog[]>;
  getAutomatizacionLogsForCambio(cambioId: string, companyId: string): Promise<AutomatizacionCambioLog[]>;
  createAutomatizacionLog(log: InsertAutomatizacionCambioLog, companyId: string): Promise<AutomatizacionCambioLog>;
  
  // Dashboard y estadísticas de Cambios
  getDashboardCambios(companyId: string): Promise<{
    totalCambios: number;
    cambiosPorEstado: Record<string, number>;
    cambiosPorCategoria: Record<string, number>;
    cambiosPorNivelImpacto: Record<string, number>;
    tiempoPromedioEvaluacion: number;
    cambiosPendientesEvaluacion: number;
    cambiosEnImplementacion: number;
  }>;

  // ========================================
  // Adquisiciones SST methods (company-scoped) - Decreto 1072/2015 Art. 2.2.4.6.27
  // ========================================
  
  // Solicitudes de Adquisición methods
  getSolicitudesAdquisicion(companyId: string): Promise<SolicitudAdquisicion[]>;
  getSolicitudAdquisicion(id: string, companyId: string): Promise<SolicitudAdquisicion | undefined>;
  createSolicitudAdquisicion(solicitud: InsertSolicitudAdquisicion, companyId: string): Promise<SolicitudAdquisicion>;
  updateSolicitudAdquisicion(id: string, solicitud: Partial<InsertSolicitudAdquisicion>, companyId: string): Promise<SolicitudAdquisicion | undefined>;
  deleteSolicitudAdquisicion(id: string, companyId: string): Promise<void>;
  generateNumeroSolicitud(companyId: string): Promise<string>;
  
  // Evaluaciones de Adquisición methods
  getEvaluacionesAdquisicion(companyId: string): Promise<EvaluacionAdquisicion[]>;
  getEvaluacionAdquisicion(id: string, companyId: string): Promise<EvaluacionAdquisicion | undefined>;
  getEvaluacionesBySolicitud(solicitudId: string, companyId: string): Promise<EvaluacionAdquisicion[]>;
  createEvaluacionAdquisicion(evaluacion: InsertEvaluacionAdquisicion, companyId: string): Promise<EvaluacionAdquisicion>;
  updateEvaluacionAdquisicion(id: string, evaluacion: Partial<InsertEvaluacionAdquisicion>, companyId: string): Promise<EvaluacionAdquisicion | undefined>;
  deleteEvaluacionAdquisicion(id: string, companyId: string): Promise<void>;
  
  // Especificaciones Técnicas methods
  getEspecificacionesTecnicas(solicitudId: string, companyId: string): Promise<EspecificacionTecnica[]>;
  getEspecificacionTecnica(id: string, companyId: string): Promise<EspecificacionTecnica | undefined>;
  createEspecificacionTecnica(especificacion: InsertEspecificacionTecnica, companyId: string): Promise<EspecificacionTecnica>;
  updateEspecificacionTecnica(id: string, especificacion: Partial<InsertEspecificacionTecnica>, companyId: string): Promise<EspecificacionTecnica | undefined>;
  deleteEspecificacionTecnica(id: string, companyId: string): Promise<void>;
  
  // Hojas de Seguridad methods
  getHojasSeguridad(companyId: string): Promise<HojaSeguridad[]>;
  getHojaSeguridad(id: string, companyId: string): Promise<HojaSeguridad | undefined>;
  getHojasSeguridadBySolicitud(solicitudId: string, companyId: string): Promise<HojaSeguridad[]>;
  createHojaSeguridad(hoja: InsertHojaSeguridad, companyId: string): Promise<HojaSeguridad>;
  updateHojaSeguridad(id: string, hoja: Partial<InsertHojaSeguridad>, companyId: string): Promise<HojaSeguridad | undefined>;
  deleteHojaSeguridad(id: string, companyId: string): Promise<void>;
  
  // Items de Adquisición methods (2.9.1)
  getAdquisicionItems(companyId: string): Promise<AdquisicionItem[]>;
  getAdquisicionItem(id: string, companyId: string): Promise<AdquisicionItem | undefined>;
  getAdquisicionItemsBySolicitud(solicitudId: string, companyId: string): Promise<AdquisicionItem[]>;
  createAdquisicionItem(item: InsertAdquisicionItem, companyId: string): Promise<AdquisicionItem>;
  updateAdquisicionItem(id: string, item: Partial<InsertAdquisicionItem>, companyId: string): Promise<AdquisicionItem | undefined>;
  deleteAdquisicionItem(id: string, companyId: string): Promise<void>;
  getResumenAdquisicionItems(companyId: string): Promise<{ porCategoria: Record<string, number>; gastoTotal: number; gastosPorCategoria: Record<string, number> }>;
  getResumenIntegradoEppAdquisiciones(companyId: string): Promise<{
    adquisiciones: { porCategoria: Record<string, number>; gastoTotal: number; gastosPorCategoria: Record<string, number>; totalItems: number; recursosVinculados: number };
    epp: { totalEntregas: number; trabajadoresConEpp: number; entregasPorCategoria: Record<string, number>; ultimasEntregas: { eppName: string; eppCategory: string; quantity: number; deliveryDate: string }[] };
    recursosFinancieros: { total: number; ejecutado: number; porcentajeEjecucion: number };
  }>;
  
  // Verificaciones de Adquisición methods
  getVerificacionesAdquisicion(companyId: string): Promise<VerificacionAdquisicion[]>;
  getVerificacionAdquisicion(id: string, companyId: string): Promise<VerificacionAdquisicion | undefined>;
  getVerificacionesBySolicitud(solicitudId: string, companyId: string): Promise<VerificacionAdquisicion[]>;
  createVerificacionAdquisicion(verificacion: InsertVerificacionAdquisicion, companyId: string): Promise<VerificacionAdquisicion>;
  updateVerificacionAdquisicion(id: string, verificacion: Partial<InsertVerificacionAdquisicion>, companyId: string): Promise<VerificacionAdquisicion | undefined>;
  deleteVerificacionAdquisicion(id: string, companyId: string): Promise<void>;
  
  // Dashboard y estadísticas de Adquisiciones
  getDashboardAdquisiciones(companyId: string): Promise<{
    totalSolicitudes: number;
    solicitudesPorEstado: Record<string, number>;
    solicitudesPorTipo: Record<string, number>;
    solicitudesPorNivelRiesgo: Record<string, number>;
    evaluacionesPendientes: number;
    aprobadas: number;
    rechazadas: number;
    enEvaluacion: number;
    presupuestoTotal: number;
  }>;

  // ========================================
  // Dashboard HACER - Controles Operacionales (PHVA cycle)
  // ========================================
  getDashboardHacer(companyId: string, year?: number): Promise<{
    totalInspecciones: number;
    peligrosVinculados: number;
    controlState: {
      conforme: number;
      noConforme: number;
      observacion: number;
    };
    trabajadoresConRiesgos: number;
    peligrosIdentificados: number;
    controlesPendientesVerificacion: number;
    porcentajeConformidad: number;
  }>;

  // ========================================
  // Dashboard VERIFICAR - Indicadores SG-SST (PHVA cycle)
  // ========================================
  getDashboardVerificar(companyId: string, year?: number): Promise<{
    objetivos: {
      total: number;
      activos: number;
      cumplidos: number;
      noCumplidos: number;
      porcentajeCumplimiento: number;
      // Campos adicionales (Add-Only - Decreto 1072/2015)
      promedioAvance: number;
      completadosPorAvance: number;
    };
    indicadores: {
      total: number;
      estructura: number;
      proceso: number;
      resultado: number;
      ultimasMediciones: number;
    };
    auditorias: {
      totalAnio: number;
      completadas: number;
      enCurso: number;
      programadas: number;
      hallazgosPorSeveridad: {
        baja: number;
        media: number;
        alta: number;
        critica: number;
      };
      porcentajeConformidad: number;
    };
    revisiones: {
      totalAnio: number;
      completadas: number;
      enEjecucion: number;
      programadas: number;
      decisionesTomadas: number;
      accionesPendientes: number;
    };
    cumplimientoNormativo: {
      ultimaEvaluacion: number | null;
      fechaUltimaEvaluacion: string | null;
      estandaresCriticos: number;
      estandaresCumplidos: number;
    };
    accidentalidad: {
      totalAccidentes: number;
      accidentesUltimoMes: number;
      tendenciaMensual: Array<{ mes: string; cantidad: number }>;
    };
  }>;

  // ========================================
  // Dashboard ACTUAR - Eficacia de Acciones Correctivas/Preventivas (PHVA cycle)
  // ========================================
  getDashboardActuar(companyId: string, year?: number): Promise<{
    accionesMejora: {
      total: number;
      completadas: number;
      enProceso: number;
      pendientes: number;
      vencidas: number;
      porcentajeCompletitud: number;
      eficacia: {
        eficaces: number;
        noEficaces: number;
        noVerificadas: number;
        porcentajeEficacia: number;
      };
      porPrioridad: {
        baja: number;
        media: number;
        alta: number;
        critica: number;
      };
      promedioAvance: number;
    };
    accionesRevision: {
      total: number;
      completadas: number;
      enProceso: number;
      pendientes: number;
      vencidas: number;
      porcentajeCompletitud: number;
      eficacia: {
        eficaces: number;
        noEficaces: number;
        noVerificadas: number;
        porcentajeEficacia: number;
      };
      porPrioridad: {
        baja: number;
        media: number;
        alta: number;
        critica: number;
      };
      promedioAvance: number;
    };
    planTrabajo: {
      porcentajeCumplimiento: number;
      actividadesCompletadas: number;
      totalActividades: number;
    };
    consolidado: {
      totalAcciones: number;
      tasaCompletitud: number;
      tasaEficacia: number;
      accionesVencidasTotal: number;
    };
  }>;

  // ========================================
  // Comunicación SST methods (company-scoped) - Decreto 1072/2015 Art. 2.2.4.6.14
  // ========================================
  
  // Plan de Comunicación SST methods
  getPlanComunicacionSst(companyId: string): Promise<PlanComunicacionSst[]>;
  getPlanComunicacionVigente(companyId: string): Promise<PlanComunicacionSst | undefined>;
  createPlanComunicacionSst(plan: InsertPlanComunicacionSst, companyId: string, userId: string): Promise<PlanComunicacionSst>;
  updatePlanComunicacionSst(id: string, plan: Partial<InsertPlanComunicacionSst>, companyId: string, userId: string): Promise<PlanComunicacionSst | undefined>;
  
  // Comunicaciones SST methods
  getComunicacionesSst(companyId: string): Promise<ComunicacionSst[]>;
  getComunicacionSstById(id: string, companyId: string): Promise<ComunicacionSst | undefined>;
  getComunicacionesForUser(userId: string, companyId: string): Promise<(ComunicacionSst & { fechaLecturaConfirmada: Date | null })[]>;
  createComunicacionSst(comunicacion: InsertComunicacionSst, companyId: string, userId: string, trabajadoresDestinatarios?: string[]): Promise<ComunicacionSst>;
  updateComunicacionSst(id: string, comunicacion: Partial<InsertComunicacionSst>, companyId: string, userId: string): Promise<ComunicacionSst | undefined>;
  deleteComunicacionSst(id: string, companyId: string, userId: string): Promise<void>;
  incrementarLecturasComunicacion(comunicacionId: string, companyId: string): Promise<void>;
  
  // Lecturas de Comunicación methods
  getLecturasComunicacion(comunicacionId: string, companyId: string): Promise<LecturaComunicacion[]>;
  createLecturaComunicacion(lectura: InsertLecturaComunicacion, companyId: string, userId: string): Promise<LecturaComunicacion>;
  confirmarLecturaComunicacion(comunicacionId: string, workerId: string | null, companyId: string, userId: string): Promise<boolean>;
  
  // Reportes de Trabajadores methods
  getReportesTrabajadores(companyId: string): Promise<ReporteTrabajador[]>;
  getReporteTrabajadorById(id: string, companyId: string): Promise<ReporteTrabajador | undefined>;
  getReportesForUser(userId: string, companyId: string): Promise<ReporteTrabajador[]>;
  createReporteTrabajador(reporte: InsertReporteTrabajador, companyId: string, userId: string): Promise<ReporteTrabajador>;
  updateReporteTrabajador(id: string, reporte: Partial<InsertReporteTrabajador>, companyId: string, userId: string): Promise<ReporteTrabajador | undefined>;
  deleteReporteTrabajador(id: string, companyId: string, userId: string): Promise<void>;
  getReportesCount(companyId: string): Promise<number>;
  
  // Trabajadores de Alto Riesgo methods (company-scoped)
  getTrabajadoresAltoRiesgo(companyId: string): Promise<TrabajadorAltoRiesgo[]>;
  getAllTrabajadoresAltoRiesgo(): Promise<TrabajadorAltoRiesgo[]>;
  getTrabajadorAltoRiesgo(id: string, companyId: string): Promise<TrabajadorAltoRiesgo | undefined>;
  getTrabajadorAltoRiesgoById(id: string): Promise<TrabajadorAltoRiesgo | undefined>;
  createTrabajadorAltoRiesgo(trabajador: InsertTrabajadorAltoRiesgo, companyId: string): Promise<TrabajadorAltoRiesgo>;
  updateTrabajadorAltoRiesgo(id: string, trabajador: Partial<InsertTrabajadorAltoRiesgo>, companyId: string): Promise<TrabajadorAltoRiesgo | undefined>;
  deleteTrabajadorAltoRiesgo(id: string, companyId: string): Promise<void>;
  
  // Historial/Auditoría methods - Trazabilidad
  getHistorialComunicacionSst(entidadId: string, companyId: string): Promise<HistorialComunicacionSst[]>;
  getHistorialComunicacionSstByEntidad(entidad: string, companyId: string): Promise<HistorialComunicacionSst[]>;
  getHistorialComunicacionSstAll(
    companyId: string, 
    filters?: {
      userId?: string;
      fechaInicio?: string;
      fechaFin?: string;
      accion?: string;
      entidad?: string;
    }
  ): Promise<HistorialComunicacionSst[]>;
  createHistorialComunicacionSst(historial: InsertHistorialComunicacionSst, companyId: string): Promise<HistorialComunicacionSst>;
  registrarAuditoria(params: {
    entidad: string;
    entidadId: string;
    accion: string;
    descripcion: string;
    userId?: string;
    nombreUsuario: string;
    rolUsuario?: string;
    campoModificado?: string;
    valorAnterior?: string;
    valorNuevo?: string;
    ipAddress?: string;
    userAgent?: string;
    companyId: string;
  }): Promise<void>;
  
  // ========================================
  // Auditorías Internas SST methods (company-scoped) - ISO 45001:2018 / Res. 0312/2019
  // ========================================
  
  // Auditorías Internas methods
  getAllAuditoriasInternas(): Promise<AuditoriaInterna[]>;
  getAuditoriasInternas(companyId: string): Promise<AuditoriaInterna[]>;
  getAuditoriaInternaById(id: string): Promise<AuditoriaInterna | undefined>;
  getAuditoriaInterna(id: string, companyId: string): Promise<AuditoriaInterna | undefined>;
  createAuditoriaInterna(auditoria: InsertAuditoriaInterna, companyId: string): Promise<AuditoriaInterna>;
  updateAuditoriaInterna(id: string, auditoria: Partial<InsertAuditoriaInterna>, companyId: string): Promise<AuditoriaInterna | undefined>;
  deleteAuditoriaInterna(id: string, companyId: string): Promise<void>;
  
  // Auditores de Auditoría methods
  getAuditoriaAuditores(auditoriaId: string, companyId: string): Promise<AuditoriaAuditor[]>;
  getAuditoriaAuditor(id: string, companyId: string): Promise<AuditoriaAuditor | undefined>;
  createAuditoriaAuditor(auditor: InsertAuditoriaAuditor, companyId: string): Promise<AuditoriaAuditor>;
  updateAuditoriaAuditor(id: string, auditor: Partial<InsertAuditoriaAuditor>, companyId: string): Promise<AuditoriaAuditor | undefined>;
  deleteAuditoriaAuditor(id: string, companyId: string): Promise<void>;
  
  // Checklists de Auditoría methods
  getAuditoriaChecklists(auditoriaId: string, companyId: string): Promise<AuditoriaChecklist[]>;
  getAuditoriaChecklist(id: string, companyId: string): Promise<AuditoriaChecklist | undefined>;
  createAuditoriaChecklist(checklist: InsertAuditoriaChecklist, companyId: string): Promise<AuditoriaChecklist>;
  updateAuditoriaChecklist(id: string, checklist: Partial<InsertAuditoriaChecklist>, companyId: string): Promise<AuditoriaChecklist | undefined>;
  deleteAuditoriaChecklist(id: string, companyId: string): Promise<void>;
  
  // Hallazgos de Auditoría methods (company-scoped)
  getHallazgosAuditoria(auditoriaId: string, companyId: string): Promise<HallazgoAuditoria[]>;
  getAllHallazgosAuditoria(companyId: string): Promise<HallazgoAuditoria[]>;
  getHallazgoAuditoria(id: string, companyId: string): Promise<HallazgoAuditoria | undefined>;
  getHallazgoAuditoriaById(id: string): Promise<HallazgoAuditoria | undefined>;
  createHallazgoAuditoria(hallazgo: InsertHallazgoAuditoria, companyId: string): Promise<HallazgoAuditoria>;
  updateHallazgoAuditoria(id: string, hallazgo: Partial<InsertHallazgoAuditoria>, companyId: string): Promise<HallazgoAuditoria | undefined>;
  deleteHallazgoAuditoria(id: string, companyId: string): Promise<void>;
  
  // Planes de Acción de Auditoría methods (company-scoped)
  getPlanesAccionAuditoria(hallazgoId: string, companyId: string): Promise<PlanAccionAuditoria[]>;
  getAllPlanesAccionAuditoria(companyId: string): Promise<PlanAccionAuditoria[]>;
  getPlanAccionAuditoria(id: string, companyId: string): Promise<PlanAccionAuditoria | undefined>;
  getPlanAccionAuditoriaById(id: string): Promise<PlanAccionAuditoria | undefined>;
  createPlanAccionAuditoria(plan: InsertPlanAccionAuditoria, companyId: string): Promise<PlanAccionAuditoria>;
  updatePlanAccionAuditoria(id: string, plan: Partial<InsertPlanAccionAuditoria>, companyId: string): Promise<PlanAccionAuditoria | undefined>;
  deletePlanAccionAuditoria(id: string, companyId: string): Promise<void>;

  // ============================================================================
  // REVISIÓN POR DIRECCIÓN - Management Review Methods
  // ============================================================================
  
  // Revisiones por Dirección - Main entity
  getAllRevisionesDireccion(): Promise<RevisionDireccion[]>;
  getRevisionesDireccion(companyId: string): Promise<RevisionDireccion[]>;
  getRevisionDireccion(id: string, companyId: string): Promise<RevisionDireccion | undefined>;
  getRevisionDireccionById(id: string): Promise<RevisionDireccion | undefined>;
  createRevisionDireccion(revision: InsertRevisionDireccion, companyId: string): Promise<RevisionDireccion>;
  updateRevisionDireccion(id: string, revision: Partial<InsertRevisionDireccion>, companyId: string): Promise<RevisionDireccion | undefined>;
  deleteRevisionDireccion(id: string, companyId: string): Promise<void>;
  
  // Participantes de Revisión - Nested entity
  getParticipantesRevision(revisionId: string, companyId: string): Promise<ParticipanteRevision[]>;
  getParticipanteRevision(id: string, companyId: string): Promise<ParticipanteRevision | undefined>;
  createParticipanteRevision(participante: InsertParticipanteRevision, companyId: string): Promise<ParticipanteRevision>;
  updateParticipanteRevision(id: string, participante: Partial<InsertParticipanteRevision>, companyId: string): Promise<ParticipanteRevision | undefined>;
  deleteParticipanteRevision(id: string, companyId: string): Promise<void>;
  
  // Temas de Revisión - Nested entity
  getTemasRevision(revisionId: string, companyId: string): Promise<TemaRevision[]>;
  getTemaRevision(id: string, companyId: string): Promise<TemaRevision | undefined>;
  createTemaRevision(tema: InsertTemaRevision, companyId: string): Promise<TemaRevision>;
  updateTemaRevision(id: string, tema: Partial<InsertTemaRevision>, companyId: string): Promise<TemaRevision | undefined>;
  deleteTemaRevision(id: string, companyId: string): Promise<void>;
  
  // Decisiones de Revisión - Nested entity
  getDecisionesRevision(revisionId: string, companyId: string): Promise<DecisionRevision[]>;
  getDecisionRevision(id: string, companyId: string): Promise<DecisionRevision | undefined>;
  createDecisionRevision(decision: InsertDecisionRevision, companyId: string): Promise<DecisionRevision>;
  updateDecisionRevision(id: string, decision: Partial<InsertDecisionRevision>, companyId: string): Promise<DecisionRevision | undefined>;
  deleteDecisionRevision(id: string, companyId: string): Promise<void>;
  
  // Acciones de Revisión - Nested to Decisiones
  getAccionesRevision(decisionId: string, companyId: string): Promise<AccionRevision[]>;
  getAccionRevision(id: string, companyId: string): Promise<AccionRevision | undefined>;
  createAccionRevision(accion: InsertAccionRevision, companyId: string): Promise<AccionRevision>;
  updateAccionRevision(id: string, accion: Partial<InsertAccionRevision>, companyId: string): Promise<AccionRevision | undefined>;
  deleteAccionRevision(id: string, companyId: string): Promise<void>;
  
  // IPERC ↔ Plan Trabajo Anual Integration (Estándar 1.1.2 - Resolución 0312/2019)
  getActiveMatrizIperc(companyId: string, year: number): Promise<schema.MatrizIperc | undefined>;
  linkPlanToMatriz(planId: string, matrizId: string, companyId: string): Promise<void>;
  ensurePlanHasIpercActivity(planId: string, companyId: string): Promise<boolean>;
  
  // Consent Records - Habeas Data (Ley 1581/2012 + GDPR Art. 7) - Bloque 3
  getConsentRecords(companyId: string): Promise<ConsentRecord[]>;
  getConsentRecord(id: string, companyId: string): Promise<ConsentRecord | undefined>;
  getConsentsByWorker(workerId: string, companyId: string): Promise<ConsentRecord[]>;
  createConsentRecord(consent: InsertConsentRecord, companyId: string, userId?: string, auditContext?: AuditContext): Promise<ConsentRecord>;
  updateConsentRecord(id: string, consent: Partial<InsertConsentRecord>, companyId: string, userId?: string, auditContext?: AuditContext): Promise<ConsentRecord | undefined>;
  revokeConsent(id: string, reason: string | null, revokedBy: string, companyId: string, auditContext?: AuditContext): Promise<ConsentRecord | undefined>;
  
  // ARCO Requests - Derechos de Acceso, Rectificación, Cancelación, Oposición (Ley 1581/2012 Art. 14-15) - Bloque 3
  getArcoRequests(companyId: string, filters?: { status?: string; requestType?: string }): Promise<ArcoRequest[]>;
  getArcoRequest(id: string, companyId: string): Promise<ArcoRequest | undefined>;
  createArcoRequest(request: InsertArcoRequest, companyId: string, userId?: string, auditContext?: AuditContext): Promise<ArcoRequest>;
  updateArcoRequest(id: string, request: Partial<InsertArcoRequest>, companyId: string, userId?: string, auditContext?: AuditContext): Promise<ArcoRequest | undefined>;
  assignArcoRequest(id: string, assigneeId: string, companyId: string, userId?: string, auditContext?: AuditContext): Promise<ArcoRequest | undefined>;
  escalateArcoRequest(id: string, escalationData: { escalatedTo: string; reason: string }, companyId: string, userId?: string, auditContext?: AuditContext): Promise<ArcoRequest | undefined>;
  completeArcoRequest(id: string, resolutionData: { responseDescription: string; status: 'completada' | 'rechazada' | 'parcialmente_completada'; rejectionReason?: string }, companyId: string, userId?: string, auditContext?: AuditContext): Promise<ArcoRequest | undefined>;
  
  // Infrastructure - Health Check (Bloque 2)
  healthCheck(): Promise<boolean>;
  
  // ============================================================================
  // BILLING & SUBSCRIPTIONS - Sistema de Facturación Wompi (Bloque 4)
  // ============================================================================
  
  // Subscription Plans - Read-only (seeded in database)
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlan(id: string): Promise<SubscriptionPlan | undefined>;
  getSubscriptionPlanByName(name: string): Promise<SubscriptionPlan | undefined>;
  
  // Subscriptions - Company subscription management
  getSubscriptionByCompany(companyId: string): Promise<Subscription | undefined>;
  getSubscription(id: string): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: string, subscription: Partial<InsertSubscription>): Promise<Subscription | undefined>;
  markSubscriptionActive(id: string, periodStart: Date, periodEnd: Date): Promise<Subscription | undefined>;
  markSubscriptionCanceled(id: string, canceledAt: Date): Promise<Subscription | undefined>;
  
  // Trial Subscriptions (Bloque 4 - Tarea 6)
  createTrialSubscription(companyId: string, planId: string, trialDays: number): Promise<Subscription>;
  getExpiredTrials(): Promise<Subscription[]>;
  hasDefaultPaymentSource(companyId: string): Promise<boolean>;
  transitionSubscriptionStatus(id: string, newStatus: 'active' | 'past_due' | 'suspended' | 'canceled' | 'expired', metadata?: { suspendedAt?: Date; canceledAt?: Date }): Promise<Subscription | undefined>;
  getActiveOrTrialSubscriptionByCompany(companyId: string): Promise<Subscription | undefined>;
  
  // Payment Sources - Tokenized payment methods
  getPaymentSourcesByCompany(companyId: string): Promise<PaymentSource[]>;
  getPaymentSource(id: string): Promise<PaymentSource | undefined>;
  createPaymentSource(source: InsertPaymentSource): Promise<PaymentSource>;
  deletePaymentSource(id: string): Promise<void>;
  setDefaultPaymentSource(companyId: string, sourceId: string): Promise<void>;
  
  // Payment Transactions - Transaction history
  getTransactionsByCompany(companyId: string): Promise<PaymentTransaction[]>;
  getTransaction(id: string): Promise<PaymentTransaction | undefined>;
  getTransactionByReference(reference: string): Promise<PaymentTransaction | undefined>;
  getTransactionByWompiId(wompiTransactionId: string): Promise<PaymentTransaction | undefined>;
  createTransaction(transaction: InsertPaymentTransaction): Promise<PaymentTransaction>;
  updateTransaction(id: string, transaction: Partial<InsertPaymentTransaction>): Promise<PaymentTransaction | undefined>;
  markTransactionApproved(id: string, paidAt: Date): Promise<PaymentTransaction | undefined>;
  markTransactionFailed(id: string, failedAt: Date, failureCode?: string, failureMessage?: string): Promise<PaymentTransaction | undefined>;
  
  // Invoices - Invoice generation and tracking
  getInvoicesByCompany(companyId: string): Promise<Invoice[]>;
  getInvoice(id: string): Promise<Invoice | undefined>;
  getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: string, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  markInvoicePaid(id: string, paidDate: Date): Promise<Invoice | undefined>;
  
  // Analytics & Metrics - Admin Dashboard (Bloque 4 - Tarea 7)
  getBillingMetrics(): Promise<{
    mrr: number;
    arr: number;
    activeSubscriptions: number;
    trialSubscriptions: number;
    churnRate: number;
    totalRevenue: number;
  }>;
  getAllSubscriptionsWithDetails(): Promise<Array<Subscription & { 
    companyName: string; 
    planName: string;
    planPrice: number;
  }>>;
  getRevenueTimeSeries(months: number): Promise<Array<{
    month: string;
    revenue: number;
    subscriptions: number;
  }>>;
  
  // Monthly Billing - Cron Job Support (Bloque 4 - Tarea 17)
  getSubscriptionsDueForBilling(): Promise<Array<Subscription & { 
    companyName: string; 
    planName: string;
    planPrice: number;
    companyNit: string;
    companyAddress?: string;
    companyCity?: string;
    companyEmail?: string;
    companyPhone?: string;
  }>>;
  
  // ============================================================================
  // SST DOCUMENTS - Conservación de Documentación (Estándar 2.5.1 - Res. 0312/2019)
  // ============================================================================
  
  getSstDocuments(companyId: string): Promise<SstDocument[]>;
  getAllSstDocuments(): Promise<SstDocument[]>;
  getSstDocument(id: string, companyId: string): Promise<SstDocument | undefined>;
  getSstDocumentById(id: string): Promise<SstDocument | undefined>;
  createSstDocument(doc: InsertSstDocument, companyId: string): Promise<SstDocument>;
  updateSstDocument(id: string, doc: Partial<InsertSstDocument>, companyId: string): Promise<SstDocument | undefined>;
  deleteSstDocument(id: string, companyId: string): Promise<void>;
  getSstDocumentVersions(documentId: string): Promise<SstDocumentVersion[]>;
  createSstDocumentVersion(version: InsertSstDocumentVersion): Promise<SstDocumentVersion>;
  logSstDocumentAccess(log: InsertSstDocumentAccessLog): Promise<SstDocumentAccessLog>;
  getSstDocumentAccessLog(documentId: string): Promise<SstDocumentAccessLog[]>;
  getSstDocumentAlerts(companyId: string): Promise<SstDocumentAlert[]>;
  createSstDocumentAlert(alert: InsertSstDocumentAlert): Promise<SstDocumentAlert>;
  updateSstDocumentAlert(id: string, alert: Partial<InsertSstDocumentAlert>): Promise<SstDocumentAlert | undefined>;
  getExpiringDocuments(companyId: string, days: number): Promise<SstDocument[]>;
  
  // ============================================================================
  // PLAN DE EMERGENCIAS - Gestión de Amenazas (Res. 0312/2019)
  // ============================================================================
  
  // Planes de Emergencia
  getPlanesEmergencia(companyId: string): Promise<PlanEmergencia[]>;
  getAllPlanesEmergencia(): Promise<PlanEmergencia[]>;
  getPlanEmergencia(id: string, companyId: string): Promise<PlanEmergencia | undefined>;
  getPlanEmergenciaById(id: string): Promise<PlanEmergencia | undefined>;
  createPlanEmergencia(plan: InsertPlanEmergencia, companyId: string): Promise<PlanEmergencia>;
  updatePlanEmergencia(id: string, plan: Partial<InsertPlanEmergencia>, companyId: string): Promise<PlanEmergencia | undefined>;
  deletePlanEmergencia(id: string, companyId: string): Promise<void>;
  
  // Brigadas de Emergencia
  getBrigadasEmergencia(companyId: string): Promise<BrigadaEmergencia[]>;
  getAllBrigadasEmergencia(): Promise<BrigadaEmergencia[]>;
  getBrigadaEmergencia(id: string, companyId: string): Promise<BrigadaEmergencia | undefined>;
  getBrigadaEmergenciaById(id: string): Promise<BrigadaEmergencia | undefined>;
  createBrigadaEmergencia(brigada: InsertBrigadaEmergencia, companyId: string): Promise<BrigadaEmergencia>;
  updateBrigadaEmergencia(id: string, brigada: Partial<InsertBrigadaEmergencia>, companyId: string): Promise<BrigadaEmergencia | undefined>;
  deleteBrigadaEmergencia(id: string, companyId: string): Promise<void>;
  
  // Miembros de Brigada
  getMiembrosBrigada(brigadaId: string): Promise<MiembroBrigada[]>;
  getMiembroBrigada(id: string): Promise<MiembroBrigada | undefined>;
  createMiembroBrigada(miembro: InsertMiembroBrigada): Promise<MiembroBrigada>;
  updateMiembroBrigada(id: string, miembro: Partial<InsertMiembroBrigada>): Promise<MiembroBrigada | undefined>;
  deleteMiembroBrigada(id: string): Promise<void>;
  
  // Análisis de Vulnerabilidad
  getAnalisisVulnerabilidad(companyId: string): Promise<AnalisisVulnerabilidad[]>;
  getAllAnalisisVulnerabilidad(): Promise<AnalisisVulnerabilidad[]>;
  getAnalisisVulnerabilidadItem(id: string, companyId: string): Promise<AnalisisVulnerabilidad | undefined>;
  getAnalisisVulnerabilidadById(id: string): Promise<AnalisisVulnerabilidad | undefined>;
  createAnalisisVulnerabilidad(analisis: InsertAnalisisVulnerabilidad, companyId: string): Promise<AnalisisVulnerabilidad>;
  updateAnalisisVulnerabilidad(id: string, analisis: Partial<InsertAnalisisVulnerabilidad>, companyId: string): Promise<AnalisisVulnerabilidad | undefined>;
  deleteAnalisisVulnerabilidad(id: string, companyId: string): Promise<void>;
  
  // Recursos de Emergencia
  getRecursosEmergencia(companyId: string): Promise<RecursoEmergencia[]>;
  getAllRecursosEmergencia(): Promise<RecursoEmergencia[]>;
  getRecursoEmergencia(id: string, companyId: string): Promise<RecursoEmergencia | undefined>;
  getRecursoEmergenciaById(id: string): Promise<RecursoEmergencia | undefined>;
  createRecursoEmergencia(recurso: InsertRecursoEmergencia, companyId: string): Promise<RecursoEmergencia>;
  updateRecursoEmergencia(id: string, recurso: Partial<InsertRecursoEmergencia>, companyId: string): Promise<RecursoEmergencia | undefined>;
  deleteRecursoEmergencia(id: string, companyId: string): Promise<void>;
  
  // Inspecciones de Recursos de Emergencia
  getInspeccionesRecursosEmergencia(recursoId: string): Promise<InspeccionRecursoEmergencia[]>;
  getInspeccionRecursoEmergencia(id: string): Promise<InspeccionRecursoEmergencia | undefined>;
  createInspeccionRecursoEmergencia(inspeccion: InsertInspeccionRecursoEmergencia): Promise<InspeccionRecursoEmergencia>;
  updateInspeccionRecursoEmergencia(id: string, inspeccion: Partial<InsertInspeccionRecursoEmergencia>): Promise<InspeccionRecursoEmergencia | undefined>;
  deleteInspeccionRecursoEmergencia(id: string): Promise<void>;
  
  // Simulacros
  getSimulacros(companyId: string): Promise<Simulacro[]>;
  getAllSimulacros(): Promise<Simulacro[]>;
  getSimulacro(id: string, companyId: string): Promise<Simulacro | undefined>;
  getSimulacroById(id: string): Promise<Simulacro | undefined>;
  createSimulacro(simulacro: InsertSimulacro, companyId: string): Promise<Simulacro>;
  updateSimulacro(id: string, simulacro: Partial<InsertSimulacro>, companyId: string): Promise<Simulacro | undefined>;
  deleteSimulacro(id: string, companyId: string): Promise<void>;
  
  // Participantes Simulacro
  getParticipantesSimulacro(simulacroId: string): Promise<ParticipanteSimulacro[]>;
  getParticipanteSimulacro(id: string): Promise<ParticipanteSimulacro | undefined>;
  createParticipanteSimulacro(participante: InsertParticipanteSimulacro): Promise<ParticipanteSimulacro>;
  updateParticipanteSimulacro(id: string, participante: Partial<InsertParticipanteSimulacro>): Promise<ParticipanteSimulacro | undefined>;
  deleteParticipanteSimulacro(id: string): Promise<void>;
  
  // Zonas de Evacuación
  getZonasEvacuacion(companyId: string): Promise<ZonaEvacuacion[]>;
  getAllZonasEvacuacion(): Promise<ZonaEvacuacion[]>;
  getZonaEvacuacion(id: string, companyId: string): Promise<ZonaEvacuacion | undefined>;
  getZonaEvacuacionById(id: string): Promise<ZonaEvacuacion | undefined>;
  createZonaEvacuacion(zona: InsertZonaEvacuacion, companyId: string): Promise<ZonaEvacuacion>;
  updateZonaEvacuacion(id: string, zona: Partial<InsertZonaEvacuacion>, companyId: string): Promise<ZonaEvacuacion | undefined>;
  deleteZonaEvacuacion(id: string, companyId: string): Promise<void>;
  
  // Rutas de Evacuación
  getRutasEvacuacion(companyId: string): Promise<RutaEvacuacion[]>;
  getAllRutasEvacuacion(): Promise<RutaEvacuacion[]>;
  getRutaEvacuacion(id: string, companyId: string): Promise<RutaEvacuacion | undefined>;
  getRutaEvacuacionById(id: string): Promise<RutaEvacuacion | undefined>;
  createRutaEvacuacion(ruta: InsertRutaEvacuacion, companyId: string): Promise<RutaEvacuacion>;
  updateRutaEvacuacion(id: string, ruta: Partial<InsertRutaEvacuacion>, companyId: string): Promise<RutaEvacuacion | undefined>;
  deleteRutaEvacuacion(id: string, companyId: string): Promise<void>;
  
  // Puntos de Encuentro
  getPuntosEncuentro(companyId: string): Promise<PuntoEncuentro[]>;
  getAllPuntosEncuentro(): Promise<PuntoEncuentro[]>;
  getPuntoEncuentro(id: string, companyId: string): Promise<PuntoEncuentro | undefined>;
  getPuntoEncuentroById(id: string): Promise<PuntoEncuentro | undefined>;
  createPuntoEncuentro(punto: InsertPuntoEncuentro, companyId: string): Promise<PuntoEncuentro>;
  updatePuntoEncuentro(id: string, punto: Partial<InsertPuntoEncuentro>, companyId: string): Promise<PuntoEncuentro | undefined>;
  deletePuntoEncuentro(id: string, companyId: string): Promise<void>;
  
  // ============================================================================
  // PROVIDER ACCESS LOGS - Registro de Accesos del Proveedor SaaS (Ley 1581/2012)
  // ============================================================================
  createProviderAccessLog(log: InsertProviderAccessLog): Promise<ProviderAccessLog>;
  getProviderAccessLogs(filters?: { providerId?: string; clientCompanyId?: string; startDate?: Date; endDate?: Date }): Promise<ProviderAccessLog[]>;
  getProviderAccessLogById(id: string): Promise<ProviderAccessLog | undefined>;
  updateProviderAccessLog(id: string, updates: Partial<InsertProviderAccessLog>): Promise<ProviderAccessLog | undefined>;
  getProviderAccessLogsByCompany(clientCompanyId: string): Promise<ProviderAccessLog[]>;
  
  // ============================================================================
  // WORKER PORTAL ACCESS LOGS (SST-2025-0082)
  // ============================================================================
  createWorkerPortalAccessLog(data: InsertWorkerPortalAccessLog): Promise<WorkerPortalAccessLog>;
  getWorkerPortalAccessLogs(companyId: string, filters?: { workerId?: string; from?: Date; to?: Date }): Promise<WorkerPortalAccessLog[]>;
  
  // ============================================================================
  // SISTEMA DE TICKETS DE SOPORTE
  // ============================================================================
  // Tickets
  getSupportTickets(companyId?: string): Promise<SupportTicket[]>;
  getSupportTicket(id: string): Promise<SupportTicket | undefined>;
  getSupportTicketByNumber(ticketNumber: string): Promise<SupportTicket | undefined>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  updateSupportTicket(id: string, updates: Partial<InsertSupportTicket>): Promise<SupportTicket | undefined>;
  getNextTicketNumber(): Promise<string>;
  
  // Ticket Responses
  getTicketResponses(ticketId: string): Promise<TicketResponse[]>;
  createTicketResponse(response: InsertTicketResponse): Promise<TicketResponse>;
  
  // Ticket Status History
  getTicketStatusHistory(ticketId: string): Promise<TicketStatusHistory[]>;
  createTicketStatusHistory(history: InsertTicketStatusHistory): Promise<TicketStatusHistory>;
  
  // ============================================================================
  // SISTEMA DE MENSAJERÍA INTERNA - Comunicación LSO ↔ Responsable SST
  // ============================================================================
  getInternalMessages(userId: string, companyId?: string | null): Promise<InternalMessage[]>;
  getInternalMessage(id: string): Promise<InternalMessage | undefined>;
  createInternalMessage(message: InsertInternalMessage): Promise<InternalMessage>;
  markMessageAsRead(id: string): Promise<InternalMessage | undefined>;
  archiveMessage(id: string): Promise<InternalMessage | undefined>;
  getUnreadMessageCount(userId: string, companyId?: string | null): Promise<number>;
  getMessageRecipients(companyId: string, senderRole: string): Promise<Array<{ id: string; fullName: string | null; role: string }>>;
  
  // ============================================================================
  // SUPPORT ACCESS AUTHORIZATION SYSTEM - Transparencia y autorización de acceso
  // ============================================================================
  getSupportAccessSessions(companyId?: string): Promise<SupportAccessSession[]>;
  getSupportAccessSessionsByUser(supportUserId: string): Promise<SupportAccessSession[]>;
  getSupportAccessSession(id: string): Promise<SupportAccessSession | undefined>;
  getSupportAccessSessionByNumber(sessionNumber: string): Promise<SupportAccessSession | undefined>;
  getActiveSupportAccessSession(supportUserId: string, companyId: string): Promise<SupportAccessSession | undefined>;
  getPendingSupportAccessSessions(companyId: string): Promise<SupportAccessSession[]>;
  createSupportAccessSession(session: InsertSupportAccessSession): Promise<SupportAccessSession>;
  updateSupportAccessSession(id: string, updates: Partial<SupportAccessSession>): Promise<SupportAccessSession | undefined>;
  getNextAccessSessionNumber(): Promise<string>;
  
  // Support Access Events (audit trail)
  getSupportAccessEvents(sessionId: string): Promise<SupportAccessEvent[]>;
  createSupportAccessEvent(event: InsertSupportAccessEvent): Promise<SupportAccessEvent>;
  
  // Helper methods for company admins
  getCompanySuperusuario(companyId: string): Promise<User | undefined>;
  
  // ============================================================================
  // HIGH RISK WORKERS - Estándar 1.1.5 (Decreto 2090/2003)
  // Identificación de trabajadores de alto riesgo y cotización de pensión especial
  // ============================================================================
  getHighRiskWorkers(companyId: string): Promise<HighRiskWorker[]>;
  getHighRiskWorkerById(id: string): Promise<HighRiskWorker | undefined>;
  createHighRiskWorker(data: InsertHighRiskWorker): Promise<HighRiskWorker>;
  updateHighRiskWorker(id: string, data: Partial<InsertHighRiskWorker>): Promise<HighRiskWorker>;
  deleteHighRiskWorker(id: string, companyId: string): Promise<void>;

  // ============================================================================
  // COPASST - Comité Paritario de Seguridad y Salud en el Trabajo
  // Resolución 2013/1986, Decreto 1295/1994, Decreto 1072/2015
  // ============================================================================
  
  // COPASST Períodos - Gestión de períodos del comité (vigencia 2 años)
  getCopasstPeriodos(companyId: string): Promise<CopasstPeriodo[]>;
  getCopasstPeriodo(id: string): Promise<CopasstPeriodo | undefined>;
  getCopasstPeriodoActivo(companyId: string): Promise<CopasstPeriodo | undefined>;
  createCopasstPeriodo(periodo: InsertCopasstPeriodo): Promise<CopasstPeriodo>;
  updateCopasstPeriodo(id: string, data: Partial<InsertCopasstPeriodo>): Promise<CopasstPeriodo | undefined>;

  // COPASST Miembros - Representantes patronales y de los trabajadores
  getCopasstMiembros(periodoId: string): Promise<CopasstMiembro[]>;
  getCopasstMiembro(id: string): Promise<CopasstMiembro | undefined>;
  createCopasstMiembro(miembro: InsertCopasstMiembro): Promise<CopasstMiembro>;
  updateCopasstMiembro(id: string, data: Partial<InsertCopasstMiembro>): Promise<CopasstMiembro | undefined>;
  deleteCopasstMiembro(id: string): Promise<void>;

  // COPASST Elecciones - Proceso electoral de representantes
  getCopasstElecciones(companyId: string): Promise<CopasstEleccion[]>;
  getCopasstEleccion(id: string): Promise<CopasstEleccion | undefined>;
  getCopasstEleccionById(id: string): Promise<CopasstEleccion | undefined>;
  createCopasstEleccion(eleccion: InsertCopasstEleccion): Promise<CopasstEleccion>;
  updateCopasstEleccion(id: string, data: Partial<InsertCopasstEleccion>): Promise<CopasstEleccion | undefined>;

  // COPASST Candidatos - Registro de candidatos
  getCopasstCandidatos(eleccionId: string): Promise<CopasstCandidato[]>;
  createCopasstCandidato(candidato: InsertCopasstCandidato): Promise<CopasstCandidato>;
  updateCopasstCandidato(id: string, data: Partial<InsertCopasstCandidato>): Promise<CopasstCandidato | undefined>;
  deleteCopasstCandidato(id: string): Promise<void>;

  // COPASST Votación - Registro de votación (auditoría, voto secreto)
  getCopasstRegistrosVotacion(eleccionId: string): Promise<CopasstRegistroVotacion[]>;
  hasVoted(eleccionId: string, workerId: string): Promise<boolean>;
  registrarVoto(eleccionId: string, workerId: string, candidatoId: string): Promise<void>;

  // ============================================================================
  // COPASST CAPACITACIÓN - E-Learning Gamificado
  // ============================================================================

  // COPASST Cursos - Catálogo de cursos de capacitación
  getCopasstCursos(): Promise<CopasstCurso[]>;
  getCopasstCursoById(id: string): Promise<CopasstCurso | undefined>;
  createCopasstCurso(data: InsertCopasstCurso): Promise<CopasstCurso>;
  updateCopasstCurso(id: string, data: Partial<InsertCopasstCurso>): Promise<CopasstCurso | undefined>;
  deleteCopasstCurso(id: string): Promise<void>;

  // COPASST Lecciones - Lecciones dentro de cada curso
  getCopasstLeccionesByCurso(cursoId: string): Promise<CopasstLeccion[]>;
  getCopasstLeccionById(id: string): Promise<CopasstLeccion | undefined>;
  createCopasstLeccion(data: InsertCopasstLeccion): Promise<CopasstLeccion>;
  updateCopasstLeccion(id: string, data: Partial<InsertCopasstLeccion>): Promise<CopasstLeccion | undefined>;

  // COPASST Quiz - Preguntas de evaluación
  getCopasstQuizByCurso(cursoId: string): Promise<CopasstQuizPregunta[]>;
  createCopasstQuizPregunta(data: InsertCopasstQuizPregunta): Promise<CopasstQuizPregunta>;
  updateCopasstQuizPregunta(id: string, data: Partial<InsertCopasstQuizPregunta>): Promise<CopasstQuizPregunta | undefined>;

  // COPASST Progreso - Seguimiento del progreso del usuario
  getCopasstProgresoByUser(companyId: string, userId: string): Promise<CopasstProgreso[]>;
  getCopasstProgresoByCurso(companyId: string, userId: string, cursoId: string): Promise<CopasstProgreso | undefined>;
  upsertCopasstProgreso(data: InsertCopasstProgreso): Promise<CopasstProgreso>;
  completarLeccion(companyId: string, userId: string, cursoId: string, leccionId: string): Promise<CopasstProgreso>;
  registrarQuizIntento(companyId: string, userId: string, cursoId: string, puntaje: number, aprobado: boolean): Promise<CopasstProgreso>;

  // COPASST Certificados - Certificados de capacitación
  getCopasstCertificadosByUser(companyId: string, userId: string): Promise<CopasstCertificado[]>;
  getCopasstCertificadoByCurso(companyId: string, userId: string, cursoId: string): Promise<CopasstCertificado | undefined>;
  createCopasstCertificado(data: InsertCopasstCertificado): Promise<CopasstCertificado>;
  getCopasstCertificadoByCode(code: string): Promise<CopasstCertificado | undefined>;

  // ============================================================================
  // COPASST GAMIFICACIÓN - Sistema de Insignias, Rachas, Leaderboard y Escenarios
  // ============================================================================

  // Insignias (Badges)
  listCopasstInsignias(): Promise<CopasstInsignia[]>;
  getCopasstInsignia(id: string): Promise<CopasstInsignia | undefined>;
  createCopasstInsignia(data: InsertCopasstInsignia): Promise<CopasstInsignia>;
  getUserInsignias(userId: string, companyId: string): Promise<CopasstInsigniaUsuario[]>;
  unlockCopasstInsignia(userId: string, companyId: string, insigniaId: string): Promise<CopasstInsigniaUsuario>;
  checkAndUnlockBadges(userId: string, companyId: string): Promise<CopasstInsigniaUsuario[]>;

  // Rachas (Streaks)
  getCopasstRacha(userId: string, companyId: string): Promise<CopasstRachaUsuario | undefined>;
  updateCopasstRacha(userId: string, companyId: string): Promise<CopasstRachaUsuario>;
  createOrGetCopasstRacha(userId: string, companyId: string): Promise<CopasstRachaUsuario>;

  // Leaderboard (Monthly Points)
  getMonthlyLeaderboard(companyId: string, year: number, month: number, limit?: number): Promise<CopasstPuntosMensuales[]>;
  updateMonthlyPoints(userId: string, companyId: string, points: number, type: 'curso' | 'leccion' | 'quiz' | 'insignia'): Promise<CopasstPuntosMensuales>;
  getUserMonthlyStats(userId: string, companyId: string, year: number, month: number): Promise<CopasstPuntosMensuales | undefined>;

  // Escenarios (Interactive Scenarios)
  listCopasstEscenarios(): Promise<CopasstEscenario[]>;
  getCopasstEscenario(id: string): Promise<CopasstEscenario | undefined>;
  getEscenarioNodos(escenarioId: string): Promise<CopasstEscenarioNodo[]>;
  startEscenarioProgreso(userId: string, companyId: string, escenarioId: string): Promise<CopasstEscenarioProgreso>;
  updateEscenarioProgreso(progresoId: string, nodoId: string, opcionIndex: number, puntos: number): Promise<CopasstEscenarioProgreso>;
  completeEscenario(progresoId: string, puntosTotal: number): Promise<CopasstEscenarioProgreso>;
  getUserEscenarioProgreso(userId: string, companyId: string, escenarioId: string): Promise<CopasstEscenarioProgreso | undefined>;

  // ============================================================================
  // COPASST CAPACITACIÓN FASE 3 - CMS, Banco de Preguntas, Asignaciones, Notificaciones
  // ============================================================================

  // Course Categories CRUD
  listCopasstCursoCategorias(companyId: string): Promise<CopasstCursoCategoria[]>;
  createCopasstCursoCategoria(data: InsertCopasstCursoCategoria): Promise<CopasstCursoCategoria>;
  updateCopasstCursoCategoria(id: string, data: Partial<InsertCopasstCursoCategoria>): Promise<CopasstCursoCategoria | undefined>;
  deleteCopasstCursoCategoria(id: string): Promise<boolean>;

  // Course Assignments CRUD
  listCopasstCursoAsignaciones(companyId: string, filters?: { userId?: string; cursoId?: string; estado?: string }): Promise<CopasstCursoAsignacion[]>;
  getCopasstCursoAsignacion(id: string): Promise<CopasstCursoAsignacion | undefined>;
  createCopasstCursoAsignacion(data: InsertCopasstCursoAsignacion): Promise<CopasstCursoAsignacion>;
  updateCopasstCursoAsignacion(id: string, data: Partial<InsertCopasstCursoAsignacion>): Promise<CopasstCursoAsignacion | undefined>;
  deleteCopasstCursoAsignacion(id: string): Promise<boolean>;
  getAsignacionesPendientesNotificacion(diasAntes: number): Promise<CopasstCursoAsignacion[]>;

  // Question Bank CRUD
  listCopasstBancoPreguntas(companyId: string | null, filters?: { categoriaId?: string; dificultad?: string; etiqueta?: string }): Promise<CopasstBancoPregunta[]>;
  getCopasstBancoPregunta(id: string): Promise<CopasstBancoPregunta | undefined>;
  createCopasstBancoPregunta(data: InsertCopasstBancoPregunta): Promise<CopasstBancoPregunta>;
  updateCopasstBancoPregunta(id: string, data: Partial<InsertCopasstBancoPregunta>): Promise<CopasstBancoPregunta | undefined>;
  deleteCopasstBancoPregunta(id: string): Promise<boolean>;
  importCopasstBancoPreguntas(companyId: string | null, preguntas: InsertCopasstBancoPregunta[]): Promise<number>;

  // Training Notifications
  listCopasstNotificaciones(companyId: string, filters?: { tipo?: string; estado?: string }): Promise<CopasstNotificacion[]>;
  getCopasstNotificacion(id: string): Promise<CopasstNotificacion | undefined>;
  createCopasstNotificacion(data: InsertCopasstNotificacion): Promise<CopasstNotificacion>;
  updateCopasstNotificacion(id: string, data: Partial<InsertCopasstNotificacion>): Promise<CopasstNotificacion | undefined>;
  getNotificacionesPendientes(): Promise<CopasstNotificacion[]>;
  marcarNotificacionEnviada(id: string, exitoso: boolean, errorMensaje?: string): Promise<void>;

  // ============================================================================
  // COPASST EVALUACIÓN 360° - Sistema de Evaluación de Desempeño
  // ============================================================================

  // Evaluation Periods CRUD
  listCopasstEvaluacionPeriodos(companyId: string): Promise<CopasstEvaluacionPeriodo[]>;
  getCopasstEvaluacionPeriodo(id: string): Promise<CopasstEvaluacionPeriodo | undefined>;
  createCopasstEvaluacionPeriodo(data: InsertCopasstEvaluacionPeriodo): Promise<CopasstEvaluacionPeriodo>;
  updateCopasstEvaluacionPeriodo(id: string, data: Partial<InsertCopasstEvaluacionPeriodo>): Promise<CopasstEvaluacionPeriodo | undefined>;
  deleteCopasstEvaluacionPeriodo(id: string): Promise<boolean>;

  // Competencies CRUD
  listCopasstCompetencias(companyId: string | null): Promise<CopasstCompetencia[]>;
  getCopasstCompetencia(id: string): Promise<CopasstCompetencia | undefined>;
  createCopasstCompetencia(data: InsertCopasstCompetencia): Promise<CopasstCompetencia>;
  updateCopasstCompetencia(id: string, data: Partial<InsertCopasstCompetencia>): Promise<CopasstCompetencia | undefined>;
  deleteCopasstCompetencia(id: string): Promise<boolean>;

  // Evaluation Items (Template) CRUD
  listCopasstEvaluacionItems(periodoId: string): Promise<CopasstEvaluacionItem[]>;
  createCopasstEvaluacionItem(data: InsertCopasstEvaluacionItem): Promise<CopasstEvaluacionItem>;
  updateCopasstEvaluacionItem(id: string, data: Partial<InsertCopasstEvaluacionItem>): Promise<CopasstEvaluacionItem | undefined>;
  deleteCopasstEvaluacionItem(id: string): Promise<boolean>;

  // Evaluation Assignments CRUD
  listCopasstEvaluacionAsignaciones(periodoId: string, filters?: { evaluadorId?: string; evaluadoId?: string; estado?: string }): Promise<CopasstEvaluacionAsignacion[]>;
  getCopasstEvaluacionAsignacion(id: string): Promise<CopasstEvaluacionAsignacion | undefined>;
  createCopasstEvaluacionAsignacion(data: InsertCopasstEvaluacionAsignacion): Promise<CopasstEvaluacionAsignacion>;
  updateCopasstEvaluacionAsignacion(id: string, data: Partial<InsertCopasstEvaluacionAsignacion>): Promise<CopasstEvaluacionAsignacion | undefined>;
  deleteCopasstEvaluacionAsignacion(id: string): Promise<boolean>;
  getMisEvaluacionesPendientes(userId: string): Promise<CopasstEvaluacionAsignacion[]>;

  // Evaluation Responses CRUD
  listCopasstEvaluacionRespuestas(asignacionId: string): Promise<CopasstEvaluacionRespuesta[]>;
  createCopasstEvaluacionRespuesta(data: InsertCopasstEvaluacionRespuesta): Promise<CopasstEvaluacionRespuesta>;
  createCopasstEvaluacionRespuestasBatch(respuestas: InsertCopasstEvaluacionRespuesta[]): Promise<number>;

  // Evaluation Results
  listCopasstEvaluacionResultados(periodoId: string): Promise<CopasstEvaluacionResultado[]>;
  getCopasstEvaluacionResultado(periodoId: string, evaluadoId: string): Promise<CopasstEvaluacionResultado | undefined>;
  getCopasstEvaluacionResultadosByEvaluadoId(evaluadoId: string): Promise<CopasstEvaluacionResultado[]>;
  createCopasstEvaluacionResultado(data: InsertCopasstEvaluacionResultado): Promise<CopasstEvaluacionResultado>;
  updateCopasstEvaluacionResultado(id: string, data: Partial<InsertCopasstEvaluacionResultado>): Promise<CopasstEvaluacionResultado | undefined>;
  calcularResultadosEvaluacion(periodoId: string, evaluadoId: string): Promise<CopasstEvaluacionResultado>;

  // ============================================================================
  // CONVIVENCIA - Comité de Convivencia Laboral
  // Resolución 652/2012, Resolución 1356/2012
  // ============================================================================

  // Convivencia Períodos
  getConvivenciaPeriodos(companyId: string): Promise<ConvivenciaPeriodo[]>;
  getConvivenciaPeriodo(id: string): Promise<ConvivenciaPeriodo | undefined>;
  getConvivenciaPeriodoActivo(companyId: string): Promise<ConvivenciaPeriodo | undefined>;
  createConvivenciaPeriodo(periodo: InsertConvivenciaPeriodo): Promise<ConvivenciaPeriodo>;
  updateConvivenciaPeriodo(id: string, data: Partial<InsertConvivenciaPeriodo>): Promise<ConvivenciaPeriodo | undefined>;

  // Convivencia Miembros
  getConvivenciaMiembros(periodoId: string): Promise<ConvivenciaMiembro[]>;
  getConvivenciaMiembro(id: string): Promise<ConvivenciaMiembro | undefined>;
  createConvivenciaMiembro(miembro: InsertConvivenciaMiembro): Promise<ConvivenciaMiembro>;
  updateConvivenciaMiembro(id: string, data: Partial<InsertConvivenciaMiembro>): Promise<ConvivenciaMiembro | undefined>;
  deleteConvivenciaMiembro(id: string): Promise<void>;

  // Convivencia Elecciones
  getConvivenciaElecciones(companyId: string): Promise<ConvivenciaEleccion[]>;
  getConvivenciaEleccion(id: string): Promise<ConvivenciaEleccion | undefined>;
  getConvivenciaEleccionActiva(companyId: string): Promise<ConvivenciaEleccion | undefined>;
  createConvivenciaEleccion(eleccion: InsertConvivenciaEleccion): Promise<ConvivenciaEleccion>;
  updateConvivenciaEleccion(id: string, data: Partial<InsertConvivenciaEleccion>): Promise<ConvivenciaEleccion | undefined>;
  advanceConvivenciaEleccionPhase(id: string): Promise<ConvivenciaEleccion | undefined>;

  // Convivencia Candidatos
  getConvivenciaCandidatos(eleccionId: string): Promise<ConvivenciaCandidato[]>;
  getConvivenciaCandidato(id: string): Promise<ConvivenciaCandidato | undefined>;
  getConvivenciaCandidatoByWorker(eleccionId: string, workerId: string): Promise<ConvivenciaCandidato | undefined>;
  createConvivenciaCandidato(candidato: InsertConvivenciaCandidato): Promise<ConvivenciaCandidato>;
  updateConvivenciaCandidato(id: string, data: Partial<InsertConvivenciaCandidato>): Promise<ConvivenciaCandidato | undefined>;
  deleteConvivenciaCandidato(id: string): Promise<void>;

  // Convivencia Votación
  getConvivenciaRegistrosVotacion(eleccionId: string): Promise<ConvivenciaRegistroVotacion[]>;
  hasVotedConvivencia(eleccionId: string, workerId: string): Promise<boolean>;
  registrarVotoConvivencia(eleccionId: string, workerId: string, candidatoIds: string[], ipAddress?: string): Promise<void>;
  getConvivenciaResults(eleccionId: string): Promise<{ candidatos: ConvivenciaCandidato[]; totalVotos: number; totalVotantes: number }>;

  // Convivencia Actas
  getConvivenciaActas(companyId: string): Promise<ConvivenciaActa[]>;
  getConvivenciaActa(id: string): Promise<ConvivenciaActa | undefined>;
  createConvivenciaActa(acta: InsertConvivenciaActa): Promise<ConvivenciaActa>;
  updateConvivenciaActa(id: string, data: Partial<InsertConvivenciaActa>): Promise<ConvivenciaActa | undefined>;

  // Promotion Prevention Activities (Standard 3.1.2)
  getPromotionPreventionActivities(companyId: string): Promise<PromotionPreventionActivity[]>;
  getPromotionPreventionActivity(id: string, companyId: string): Promise<PromotionPreventionActivity | undefined>;
  createPromotionPreventionActivity(activity: InsertPromotionPreventionActivity): Promise<PromotionPreventionActivity>;
  updatePromotionPreventionActivity(id: string, companyId: string, data: Partial<InsertPromotionPreventionActivity>): Promise<PromotionPreventionActivity | undefined>;
  deletePromotionPreventionActivity(id: string, companyId: string): Promise<boolean>;

  // Promotion Prevention Participants
  getPromotionPreventionParticipants(activityId: string): Promise<PromotionPreventionParticipant[]>;
  createPromotionPreventionParticipant(participant: InsertPromotionPreventionParticipant): Promise<PromotionPreventionParticipant>;
  updatePromotionPreventionParticipant(id: string, data: Partial<InsertPromotionPreventionParticipant>): Promise<PromotionPreventionParticipant | undefined>;
  deletePromotionPreventionParticipant(id: string): Promise<boolean>;

  // Accident Statistics (Estándar 3.2.2)
  getAccidentStatisticsByCompanyId(companyId: string): Promise<AccidentStatistics[]>;
  getAccidentStatisticsByYear(companyId: string, year: number): Promise<AccidentStatistics | null>;
  createAccidentStatistics(stats: InsertAccidentStatistics, companyId: string): Promise<AccidentStatistics>;
  updateAccidentStatistics(id: string, stats: Partial<InsertAccidentStatistics>): Promise<AccidentStatistics>;
  deleteAccidentStatistics(id: string): Promise<void>;

  // EVS - Estilos de Vida Saludable (Standard 3.1.7)
  getEvsPrograms(companyId: string): Promise<EvsProgram[]>;
  getEvsProgram(id: string, companyId: string): Promise<EvsProgram | undefined>;
  createEvsProgram(program: InsertEvsProgram): Promise<EvsProgram>;
  updateEvsProgram(id: string, companyId: string, data: Partial<InsertEvsProgram>): Promise<EvsProgram | undefined>;
  deleteEvsProgram(id: string, companyId: string): Promise<boolean>;

  getEvsActivities(companyId: string): Promise<EvsActivity[]>;
  getEvsActivitiesByProgram(programId: string, companyId: string): Promise<EvsActivity[]>;
  getEvsActivity(id: string, companyId: string): Promise<EvsActivity | undefined>;
  createEvsActivity(activity: InsertEvsActivity): Promise<EvsActivity>;
  updateEvsActivity(id: string, companyId: string, data: Partial<InsertEvsActivity>): Promise<EvsActivity | undefined>;
  deleteEvsActivity(id: string, companyId: string): Promise<boolean>;

  getEvsControls(companyId: string): Promise<EvsControl[]>;
  getEvsControlsByWorker(workerId: string, companyId: string): Promise<EvsControl[]>;
  getEvsControl(id: string, companyId: string): Promise<EvsControl | undefined>;
  createEvsControl(control: InsertEvsControl): Promise<EvsControl>;
  updateEvsControl(id: string, companyId: string, data: Partial<InsertEvsControl>): Promise<EvsControl | undefined>;
  deleteEvsControl(id: string, companyId: string): Promise<boolean>;

  getEvsIncidents(companyId: string): Promise<EvsIncident[]>;
  getEvsIncident(id: string, companyId: string): Promise<EvsIncident | undefined>;
  createEvsIncident(incident: InsertEvsIncident): Promise<EvsIncident>;
  updateEvsIncident(id: string, companyId: string, data: Partial<InsertEvsIncident>): Promise<EvsIncident | undefined>;
  deleteEvsIncident(id: string, companyId: string): Promise<boolean>;

  getEvsFollowups(companyId: string): Promise<EvsFollowup[]>;
  getEvsFollowupsByWorker(workerId: string, companyId: string): Promise<EvsFollowup[]>;
  getEvsFollowup(id: string, companyId: string): Promise<EvsFollowup | undefined>;
  createEvsFollowup(followup: InsertEvsFollowup): Promise<EvsFollowup>;
  updateEvsFollowup(id: string, companyId: string, data: Partial<InsertEvsFollowup>): Promise<EvsFollowup | undefined>;
  deleteEvsFollowup(id: string, companyId: string): Promise<boolean>;

  getEvsParticipants(activityId: string): Promise<EvsParticipant[]>;
  createEvsParticipant(participant: InsertEvsParticipant): Promise<EvsParticipant>;
  updateEvsParticipant(id: string, data: Partial<InsertEvsParticipant>): Promise<EvsParticipant | undefined>;
  deleteEvsParticipant(id: string): Promise<boolean>;

  // ==================== PCA - PROGRAMA DE CONSERVACIÓN AUDITIVA ====================
  
  // Audiometry Records methods
  getAudiometryRecords(companyId: string): Promise<AudiometryRecord[]>;
  getAllAudiometryRecords(): Promise<AudiometryRecord[]>;
  getAudiometryRecord(id: string, companyId: string): Promise<AudiometryRecord | undefined>;
  getAudiometryRecordById(id: string): Promise<AudiometryRecord | undefined>;
  createAudiometryRecord(record: InsertAudiometryRecord, companyId: string): Promise<AudiometryRecord>;
  updateAudiometryRecord(id: string, record: Partial<InsertAudiometryRecord>, companyId: string): Promise<AudiometryRecord | undefined>;
  deleteAudiometryRecord(id: string, companyId: string): Promise<void>;
  getAudiometryRecordsByWorker(workerId: string, companyId: string): Promise<AudiometryRecord[]>;
  
  // Noise Exposure Profiles methods
  getNoiseExposureProfiles(companyId: string): Promise<NoiseExposureProfile[]>;
  getAllNoiseExposureProfiles(): Promise<NoiseExposureProfile[]>;
  getNoiseExposureProfile(id: string, companyId: string): Promise<NoiseExposureProfile | undefined>;
  getNoiseExposureProfileById(id: string): Promise<NoiseExposureProfile | undefined>;
  createNoiseExposureProfile(profile: InsertNoiseExposureProfile, companyId: string): Promise<NoiseExposureProfile>;
  updateNoiseExposureProfile(id: string, profile: Partial<InsertNoiseExposureProfile>, companyId: string): Promise<NoiseExposureProfile | undefined>;
  deleteNoiseExposureProfile(id: string, companyId: string): Promise<void>;
  
  // Worker Exposure Assignments methods
  getWorkerExposureAssignments(companyId: string): Promise<WorkerExposureAssignment[]>;
  getWorkerExposureAssignment(id: string, companyId: string): Promise<WorkerExposureAssignment | undefined>;
  createWorkerExposureAssignment(assignment: InsertWorkerExposureAssignment, companyId: string): Promise<WorkerExposureAssignment>;
  deleteWorkerExposureAssignment(id: string, companyId: string): Promise<void>;
  
  // PCA Control Actions methods
  getPcaControlActions(companyId: string): Promise<PcaControlAction[]>;
  getAllPcaControlActions(): Promise<PcaControlAction[]>;
  getPcaControlAction(id: string, companyId: string): Promise<PcaControlAction | undefined>;
  getPcaControlActionById(id: string): Promise<PcaControlAction | undefined>;
  createPcaControlAction(action: InsertPcaControlAction, companyId: string): Promise<PcaControlAction>;
  updatePcaControlAction(id: string, action: Partial<InsertPcaControlAction>, companyId: string): Promise<PcaControlAction | undefined>;
  deletePcaControlAction(id: string, companyId: string): Promise<void>;
  
  // PCA Programs methods
  getPcaPrograms(companyId: string): Promise<PcaProgram[]>;
  getPcaProgram(id: string, companyId: string): Promise<PcaProgram | undefined>;
  getPcaProgramByYear(year: number, companyId: string): Promise<PcaProgram | undefined>;
  createPcaProgram(program: InsertPcaProgram, companyId: string): Promise<PcaProgram>;
  updatePcaProgram(id: string, program: Partial<InsertPcaProgram>, companyId: string): Promise<PcaProgram | undefined>;
}

export class DbStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // Company methods
  async getCompanies(): Promise<Company[]> {
    return await db.select().from(schema.companies).orderBy(desc(schema.companies.createdAt));
  }

  async getCompany(id: string): Promise<Company | undefined> {
    const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, id));
    return company;
  }

  async getCompanyByNit(nit: string): Promise<Company | undefined> {
    const [company] = await db.select().from(schema.companies).where(eq(schema.companies.nit, nit));
    return company;
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    // Calculate chapter based on workers and risk level
    const calculatedChapter = calculateChapter(
      company.numberOfWorkers ?? 1, 
      company.riskLevel ?? "I"
    );
    
    const [newCompany] = await db.insert(schema.companies).values({
      ...company,
      calculatedChapter,
    }).returning();
    return newCompany;
  }

  async updateCompany(id: string, company: Partial<InsertCompany>): Promise<Company | undefined> {
    // If workers or risk level changed, recalculate chapter
    let updateData: any = { ...company };
    if (company.numberOfWorkers !== undefined || company.riskLevel !== undefined) {
      const existing = await this.getCompany(id);
      if (existing) {
        const workers = company.numberOfWorkers ?? existing.numberOfWorkers;
        const riskLevel = company.riskLevel ?? existing.riskLevel;
        updateData.calculatedChapter = calculateChapter(workers, riskLevel);
      }
    }
    
    const [updated] = await db.update(schema.companies).set(updateData).where(eq(schema.companies.id, id)).returning();
    return updated;
  }

  async deleteCompany(id: string): Promise<void> {
    // Primero, desvincular usuarios de esta empresa (ponerlos como null)
    await db.update(schema.users)
      .set({ companyId: null })
      .where(eq(schema.users.companyId, id));
    
    // Luego eliminar la empresa
    await db.delete(schema.companies).where(eq(schema.companies.id, id));
  }

  async deleteCompanyWithAllData(id: string): Promise<{ deletedTables: string[], totalDeleted: number, failedTables: string[] }> {
    const deletedTables: string[] = [];
    const failedTables: string[] = [];
    let totalDeleted = 0;

    // Orden de eliminación: de más dependiente a menos dependiente
    // Usando SQL directo para mejor rendimiento y control de transacciones
    const tablesToDelete = [
      // 1. Logs y registros de acceso
      { table: 'consent_records', column: 'company_id' },
      { table: 'arco_requests', column: 'company_id' },
      { table: 'audit_logs', column: 'company_id' },
      { table: 'provider_access_logs', column: 'client_company_id' },
      { table: 'lecturas_comunicacion', column: 'company_id' },
      { table: 'worker_portal_access_logs', column: 'company_id' },
      { table: 'support_access_events', column: 'actor_id', subquery: 'SELECT id FROM users WHERE company_id = $1' },
      { table: 'support_access_sessions', column: 'company_id' },
      { table: 'lso_activity_log', column: 'company_id' },
      
      // 2. Notificaciones y comunicaciones
      { table: 'internal_messages', column: 'company_id' },
      { table: 'email_notifications', column: 'company_id' },
      { table: 'historial_comunicaciones_sst', column: 'company_id' },
      { table: 'comunicaciones_sst', column: 'company_id' },
      { table: 'plan_comunicacion_sst', column: 'company_id' },
      
      // 3. Capacitaciones y asistencia
      { table: 'capacitacion_asistentes', column: 'company_id' },
      { table: 'capacitacion_eventos', column: 'company_id' },
      { table: 'capacitaciones_cambios', column: 'company_id' },
      { table: 'program_training_attendance', column: 'company_id' },
      { table: 'program_trainings', column: 'company_id' },
      { table: 'programas_capacitacion', column: 'company_id' },
      { table: 'training_programs', column: 'company_id' },
      { table: 'trainings', column: 'company_id' },
      { table: 'registros_induccion', column: 'company_id' },
      { table: 'curso_50_horas', column: 'company_id' },
      { table: 'road_safety_trainings', column: 'company_id' },
      { table: 'contenidos_induccion', column: 'company_id' },
      { table: 'preguntas_induccion', column: 'company_id' },
      { table: 'sesiones_induccion_virtual', column: 'company_id' },
      
      // 4. Auditorías internas
      { table: 'auditoria_checklists', column: 'evaluado_por_id', subquery: 'SELECT id FROM users WHERE company_id = $1' },
      { table: 'auditoria_auditores', column: 'auditor_id', subquery: 'SELECT id FROM users WHERE company_id = $1' },
      { table: 'planes_accion_auditoria', column: 'company_id' },
      { table: 'hallazgos_auditoria', column: 'company_id' },
      { table: 'hallazgos_auditoria_pesv', column: 'company_id' },
      { table: 'auditorias_pesv', column: 'company_id' },
      { table: 'auditorias_internas', column: 'company_id' },
      { table: 'no_conformidades', column: 'company_id' },
      { table: 'acciones_correctivas', column: 'company_id' },
      { table: 'oportunidades_mejora', column: 'company_id' },
      
      // 4b. PESV - Módulos de evaluación
      { table: 'mediciones_indicador_sv', column: 'indicador_id', subquery: 'SELECT id FROM indicadores_sv WHERE company_id = $1' },
      { table: 'indicadores_sv', column: 'company_id' },
      { table: 'factores_desempeno_sv', column: 'company_id' },
      { table: 'objetivos_sv', column: 'company_id' },
      { table: 'tratamientos_riesgo_vial', column: 'company_id' },
      { table: 'riesgos_sst_pesv_vinculacion', column: 'company_id' },
      { table: 'riesgos_viales', column: 'company_id' },
      { table: 'contexto_organizacional_pesv', column: 'company_id' },
      { table: 'acciones_mejora_pesv', column: 'company_id' },
      { table: 'revisiones_direccion_pesv', column: 'company_id' },
      { table: 'pesv_comite_actas', column: 'company_id' },
      { table: 'pesv_comite_integrantes', column: 'company_id' },
      { table: 'safe_routes', column: 'company_id' },
      { table: 'vehicle_gps_tracking', column: 'company_id' },
      { table: 'vehicle_maintenances', column: 'company_id' },
      
      // 5. Revisión por dirección
      { table: 'acciones_revision', column: 'company_id' },
      { table: 'decisiones_revision', column: 'company_id' },
      { table: 'participantes_revision', column: 'company_id' },
      { table: 'temas_revision', column: 'company_id' },
      { table: 'revisiones_direccion', column: 'company_id' },
      
      // 6. IPERC y peligros
      { table: 'inspecciones_peligros_vinculados', column: 'company_id' },
      { table: 'inspecciones_peligros_vinculos', column: 'company_id' },
      { table: 'riesgos_trabajador', column: 'company_id' },
      { table: 'peligros', column: 'company_id' },
      { table: 'peligros_trabajadores_asignacion', column: 'company_id' },
      { table: 'peligros_iperc', column: 'company_id' },
      { table: 'matrices_iperc', column: 'company_id' },
      { table: 'inspecciones', column: 'company_id' },
      { table: 'controles_operacionales', column: 'company_id' },
      
      // 7. Inspecciones y mediciones
      { table: 'inspections', column: 'company_id' },
      { table: 'environmental_measurements', column: 'company_id' },
      
      // 8. Accidentes, investigaciones y enfermedades
      { table: 'accident_statistics', column: 'company_id' },
      { table: 'accident_investigations', column: 'company_id' },
      { table: 'accidents', column: 'company_id' },
      { table: 'occupational_diseases', column: 'company_id' },
      { table: 'road_incidents', column: 'company_id' },
      { table: 'worker_absences', column: 'company_id' },
      
      // 9. Gestión del cambio
      { table: 'automatizacion_cambio_logs', column: 'company_id' },
      { table: 'seguimientos_cambios', column: 'company_id' },
      { table: 'controles_cambios', column: 'company_id' },
      { table: 'evaluaciones_impacto_cambios', column: 'company_id' },
      { table: 'aprobaciones_cambios', column: 'company_id' },
      { table: 'cambios_sst', column: 'company_id' },
      
      // 10. Proveedores y contratistas
      { table: 'seguimientos_proveedores', column: 'company_id' },
      { table: 'documentos_proveedores', column: 'company_id' },
      { table: 'evaluaciones_proveedores', column: 'company_id' },
      { table: 'criterios_evaluacion_proveedor', column: 'company_id' },
      { table: 'proveedores_contratistas', column: 'company_id' },
      
      // 11. Adquisiciones
      { table: 'verificaciones_adquisicion', column: 'company_id' },
      { table: 'evaluaciones_adquisicion', column: 'company_id' },
      { table: 'especificaciones_tecnicas', column: 'company_id' },
      { table: 'adquisicion_items', column: 'company_id' },
      { table: 'solicitudes_adquisicion', column: 'company_id' },
      
      // 12. Plan de emergencias (orden correcto: primero tablas dependientes)
      { table: 'participantes_simulacro', column: 'simulacro_id', subquery: 'SELECT id FROM simulacros WHERE company_id = $1' },
      { table: 'simulacros', column: 'company_id' },
      { table: 'rutas_evacuacion', column: 'company_id' },
      { table: 'zonas_evacuacion', column: 'company_id' },
      { table: 'puntos_encuentro', column: 'company_id' },
      { table: 'inspecciones_recursos_emergencia', column: 'recurso_id', subquery: 'SELECT id FROM recursos_emergencia WHERE company_id = $1' },
      { table: 'recursos_emergencia', column: 'company_id' },
      { table: 'miembros_brigada', column: 'brigada_id', subquery: 'SELECT id FROM brigadas_emergencia WHERE company_id = $1' },
      { table: 'brigadas_emergencia', column: 'company_id' },
      { table: 'planes_emergencia', column: 'company_id' },
      { table: 'amenazas_identificadas', column: 'analisis_id', subquery: 'SELECT id FROM analisis_vulnerabilidad WHERE company_id = $1' },
      { table: 'analisis_vulnerabilidad', column: 'company_id' },
      
      // 13. PESV (vehículos)
      { table: 'vehicle_inspections', column: 'company_id' },
      { table: 'vehicles', column: 'company_id' },
      { table: 'drivers', column: 'company_id' },
      { table: 'pesv_audits', column: 'company_id' },
      
      // 14. SVE (vigilancia epidemiológica)
      { table: 'sve_cases', column: 'company_id' },
      { table: 'sve_programs', column: 'company_id' },
      
      // 15. Indicadores y objetivos
      { table: 'mediciones_indicadores', column: 'company_id' },
      { table: 'datos_calculo_indicadores', column: 'company_id' },
      { table: 'indicadores_sst', column: 'company_id' },
      { table: 'objetivos_estandares_vinculacion', column: 'company_id' },
      { table: 'objetivos_sst', column: 'company_id' },
      
      // 16. Documentos y matrices
      { table: 'sst_document_versions', column: 'document_id', subquery: 'SELECT id FROM sst_documents WHERE company_id = $1' },
      { table: 'sst_document_access_log', column: 'document_id', subquery: 'SELECT id FROM sst_documents WHERE company_id = $1' },
      { table: 'sst_document_alerts', column: 'document_id', subquery: 'SELECT id FROM sst_documents WHERE company_id = $1' },
      { table: 'document_acknowledgments', column: 'company_id' },
      { table: 'document_worker_assignments', column: 'company_id' },
      { table: 'sst_documents', column: 'company_id' },
      { table: 'matriz_legal', column: 'company_id' },
      { table: 'politicas_sst', column: 'company_id' },
      { table: 'hojas_seguridad', column: 'company_id' },
      { table: 'hazardous_substances', column: 'company_id' },
      
      // 17. Evaluaciones SST
      { table: 'evaluaciones_sst', column: 'company_id' },
      { table: 'sst_evaluations', column: 'company_id' },
      
      // 18. Comités y COPASST Electoral/Training
      { table: 'comite_convivencia_actas', column: 'company_id' },
      { table: 'convivencia_actas', column: 'company_id' },
      { table: 'convivencia_elecciones', column: 'company_id' },
      { table: 'convivencia_periodos', column: 'company_id' },
      { table: 'copasst_votos', column: 'candidato_id', subquery: 'SELECT id FROM copasst_candidatos WHERE eleccion_id IN (SELECT id FROM copasst_elecciones WHERE company_id = $1)' },
      { table: 'copasst_registro_votacion', column: 'eleccion_id', subquery: 'SELECT id FROM copasst_elecciones WHERE company_id = $1' },
      { table: 'copasst_candidatos', column: 'eleccion_id', subquery: 'SELECT id FROM copasst_elecciones WHERE company_id = $1' },
      { table: 'copasst_miembros', column: 'periodo_id', subquery: 'SELECT id FROM copasst_periodos WHERE company_id = $1' },
      { table: 'copasst_evaluacion_respuestas', column: 'asignacion_id', subquery: 'SELECT id FROM copasst_evaluacion_asignaciones WHERE periodo_id IN (SELECT id FROM copasst_evaluacion_periodos WHERE company_id = $1)' },
      { table: 'copasst_evaluacion_resultados', column: 'periodo_id', subquery: 'SELECT id FROM copasst_evaluacion_periodos WHERE company_id = $1' },
      { table: 'copasst_evaluacion_asignaciones', column: 'periodo_id', subquery: 'SELECT id FROM copasst_evaluacion_periodos WHERE company_id = $1' },
      { table: 'copasst_evaluacion_items', column: 'competencia_id', subquery: 'SELECT id FROM copasst_competencias WHERE company_id = $1' },
      { table: 'copasst_actas', column: 'company_id' },
      { table: 'copasst_banco_preguntas', column: 'company_id' },
      { table: 'copasst_certificados', column: 'company_id' },
      { table: 'copasst_competencias', column: 'company_id' },
      { table: 'copasst_curso_asignaciones', column: 'company_id' },
      { table: 'copasst_curso_categorias', column: 'company_id' },
      { table: 'copasst_elecciones', column: 'company_id' },
      { table: 'copasst_escenario_progreso', column: 'company_id' },
      { table: 'copasst_evaluacion_periodos', column: 'company_id' },
      { table: 'copasst_insignias', column: 'company_id' },
      { table: 'copasst_insignias_usuario', column: 'company_id' },
      { table: 'copasst_notificaciones', column: 'company_id' },
      { table: 'copasst_periodos', column: 'company_id' },
      { table: 'copasst_progreso', column: 'company_id' },
      { table: 'copasst_puntos_mensuales', column: 'company_id' },
      { table: 'copasst_rachas_usuario', column: 'company_id' },
      
      // 19. Recomendaciones ARL
      { table: 'seguimiento_recomendaciones', column: 'registrado_por', subquery: 'SELECT id FROM users WHERE company_id = $1' },
      { table: 'recomendaciones_arl_autoridades', column: 'company_id' },
      
      // 20. Planes de trabajo y contexto
      { table: 'planes_trabajo_anual', column: 'company_id' },
      { table: 'acciones_mejora_contexto', column: 'company_id' },
      { table: 'factores_contexto', column: 'responsable_accion', subquery: 'SELECT id FROM users WHERE company_id = $1' },
      { table: 'analisis_contexto', column: 'company_id' },
      { table: 'partes_interesadas', column: 'company_id' },
      
      // 21. Recursos y responsables
      { table: 'resource_allocations', column: 'company_id' },
      { table: 'responsible_designations', column: 'company_id' },
      
      // 22. Medidas preventivas
      { table: 'preventive_measures', column: 'company_id' },
      
      // 23. Tickets de soporte
      { table: 'ticket_responses', column: 'ticket_id', subquery: 'SELECT id FROM support_tickets WHERE company_id = $1' },
      { table: 'ticket_status_history', column: 'ticket_id', subquery: 'SELECT id FROM support_tickets WHERE company_id = $1' },
      { table: 'support_tickets', column: 'company_id' },
      
      // 24. Contratos
      { table: 'contracts', column: 'company_id' },
      
      // 25. EVS (Estilos de Vida Saludable) - eliminar antes de workers
      { table: 'evs_participants', column: 'activity_id', subquery: 'SELECT id FROM evs_activities WHERE company_id = $1' },
      { table: 'evs_activities', column: 'program_id', subquery: 'SELECT id FROM evs_programs WHERE company_id = $1' },
      { table: 'evs_followups', column: 'incident_id', subquery: 'SELECT id FROM evs_incidents WHERE company_id = $1' },
      { table: 'evs_incidents', column: 'company_id' },
      { table: 'evs_controls', column: 'company_id' },
      { table: 'evs_programs', column: 'company_id' },
      
      // 26. Verificación SGSS
      { table: 'detalle_verificacion_sgss', column: 'verificacion_id', subquery: 'SELECT id FROM verificaciones_muestreo_sgss WHERE company_id = $1' },
      { table: 'verificaciones_muestreo_sgss', column: 'company_id' },
      
      // 27. EPP
      { table: 'epp_deliveries', column: 'company_id' },
      { table: 'epp_catalog', column: 'company_id' },
      
      // 28. Sociodemográfico
      { table: 'sociodemographic_diagnosis', column: 'company_id' },
      { table: 'sociodemographic_diagnosis_periods', column: 'company_id' },
      
      // 29. Promoción y prevención
      { table: 'promotion_prevention_activities', column: 'company_id' },
      
      // 30. Conservación auditiva
      { table: 'audiometry_records', column: 'company_id' },
      { table: 'noise_exposure_profiles', column: 'company_id' },
      
      // 31. Trabajadores y sus dependencias
      { table: 'reportes_trabajadores', column: 'company_id' },
      { table: 'trabajadores_alto_riesgo', column: 'company_id' },
      { table: 'high_risk_workers', column: 'company_id' },
      { table: 'afiliaciones_ssss', column: 'company_id' },
      { table: 'medical_exams', column: 'company_id' },
      { table: 'job_profiles', column: 'company_id' },
      { table: 'health_conditions', column: 'company_id' },
      { table: 'trabajadores', column: 'company_id' },
      { table: 'workers', column: 'company_id' },
      
      // 32. Facturación y pagos
      { table: 'payment_transactions', column: 'company_id' },
      { table: 'payment_sources', column: 'company_id' },
      { table: 'invoices', column: 'company_id' },
      { table: 'plan_change_history', column: 'company_id' },
      
      // 33. Pricing plugin
      { table: 'pricing_plugin_invoices', column: 'customer_id' },
      { table: 'pricing_plugin_subscriptions', column: 'customer_id' },
      
      // 33b. Asientos extra
      { table: 'company_extra_seats', column: 'company_id' },
      
      // 34. Suscripción
      { table: 'subscriptions', column: 'company_id' },
      
      // 35. LSO profesionales y asignaciones (antes de users)
      { table: 'licensed_professional_assignments', column: 'company_id' },
      { table: 'lso_company_assignments', column: 'company_id' },
      { table: 'lso_invitations', column: 'company_id' },
      { table: 'lso_professionals', column: 'user_id', subquery: 'SELECT id FROM users WHERE company_id = $1' },
      { table: 'lso_registrations', column: 'reviewed_by', subquery: 'SELECT id FROM users WHERE company_id = $1' },
      
      // 36. Usuarios de la empresa (al final, muchas tablas referencian users)
      { table: 'users', column: 'company_id' },
    ];

    // Ejecutar eliminaciones en una transacción con un único cliente
    // Esto garantiza que BEGIN, DELETE y COMMIT usen la misma conexión
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Primero, obtener lista de tablas y sus columnas que realmente existen en la base de datos
      const existingTablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      `);
      const existingTables = new Set(existingTablesResult.rows.map(r => r.table_name));
      
      // Obtener columnas de cada tabla para verificar antes de eliminar
      const columnsResult = await client.query(`
        SELECT table_name, column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
      `);
      const tableColumns = new Map<string, Set<string>>();
      for (const row of columnsResult.rows) {
        if (!tableColumns.has(row.table_name)) {
          tableColumns.set(row.table_name, new Set());
        }
        tableColumns.get(row.table_name)!.add(row.column_name);
      }
      
      for (const tableConfig of tablesToDelete) {
        const { table, column, subquery } = tableConfig as { table: string; column: string; subquery?: string };
        
        // Verificar si la tabla existe antes de intentar eliminar
        if (!existingTables.has(table)) {
          continue; // Saltar tablas que no existen
        }
        
        // Verificar si la columna existe en la tabla
        const cols = tableColumns.get(table);
        if (!cols || !cols.has(column)) {
          continue; // Saltar si la columna no existe en la tabla
        }
        
        try {
          // Usar SAVEPOINT para permitir continuar aunque falle una tabla
          await client.query(`SAVEPOINT delete_${table.replace(/[^a-z0-9_]/gi, '_')}`);
          
          let result;
          
          if (subquery) {
            // Para subqueries, verificar primero si la tabla referenciada existe
            const subqueryMatch = subquery.match(/FROM\s+(\w+)/i);
            const parentTable = subqueryMatch ? subqueryMatch[1] : null;
            if (parentTable && !existingTables.has(parentTable)) {
              await client.query(`RELEASE SAVEPOINT delete_${table.replace(/[^a-z0-9_]/gi, '_')}`);
              continue; // Saltar si la tabla padre no existe
            }
            
            // Verificar columnas en la subquery también
            const subqueryColMatch = subquery.match(/WHERE\s+(\w+)/i);
            const subqueryCol = subqueryColMatch ? subqueryColMatch[1] : null;
            if (parentTable && subqueryCol) {
              const parentCols = tableColumns.get(parentTable);
              if (!parentCols || !parentCols.has(subqueryCol)) {
                await client.query(`RELEASE SAVEPOINT delete_${table.replace(/[^a-z0-9_]/gi, '_')}`);
                continue; // Saltar si la columna de la subquery no existe
              }
            }
            
            // Handle tables that need subquery (e.g., ticket_status_history via support_tickets)
            result = await client.query(
              `DELETE FROM ${table} WHERE ${column} IN (${subquery})`,
              [id]
            );
          } else {
            result = await client.query(
              `DELETE FROM ${table} WHERE ${column} = $1`,
              [id]
            );
          }
          
          await client.query(`RELEASE SAVEPOINT delete_${table.replace(/[^a-z0-9_]/gi, '_')}`);
          
          if (result.rowCount && result.rowCount > 0) {
            deletedTables.push(table);
            totalDeleted += result.rowCount;
          }
        } catch (tableError: any) {
          // Rollback solo este savepoint para continuar con la siguiente tabla
          try {
            await client.query(`ROLLBACK TO SAVEPOINT delete_${table.replace(/[^a-z0-9_]/gi, '_')}`);
          } catch (e) {
            // Ignorar si el savepoint no existe
          }
          // Log pero continuar - algunas tablas pueden tener restricciones FK que impiden eliminación
          console.error(`[DeleteCompany] Error eliminando de ${table}:`, tableError.message);
          failedTables.push(`${table}: ${tableError.message}`);
          // Continuar con la siguiente tabla en lugar de abortar toda la operación
        }
      }
      
      // Antes de eliminar la empresa, NULL-ificar referencias cruzadas de usuarios
      // en tablas de OTRAS empresas que podrían apuntar a usuarios de ESTA empresa
      const crossCompanyUserRefs = [
        { table: 'lso_company_assignments', columns: ['assigned_by', 'unassigned_by'] },
        { table: 'lso_invitations', columns: ['invited_by'] },
        { table: 'lso_registrations', columns: ['reviewed_by'] },
        { table: 'support_access_sessions', columns: ['support_user_id', 'approved_by'] },
        { table: 'support_tickets', columns: ['assigned_to', 'resolved_by'] },
        { table: 'ticket_responses', columns: ['user_id'] },
        { table: 'ticket_status_history', columns: ['changed_by'] },
      ];

      for (const ref of crossCompanyUserRefs) {
        if (!existingTables.has(ref.table)) continue;
        const cols = tableColumns.get(ref.table);
        if (!cols) continue;
        for (const col of ref.columns) {
          if (!cols.has(col)) continue;
          try {
            await client.query(`SAVEPOINT nullify_${ref.table}_${col}`);
            await client.query(
              `UPDATE ${ref.table} SET ${col} = NULL WHERE ${col} IN (SELECT id FROM users WHERE company_id = $1)`,
              [id]
            );
            await client.query(`RELEASE SAVEPOINT nullify_${ref.table}_${col}`);
          } catch (nullErr: any) {
            try { await client.query(`ROLLBACK TO SAVEPOINT nullify_${ref.table}_${col}`); } catch (e) {}
            console.warn(`[DeleteCompany] Could not nullify ${ref.table}.${col}:`, nullErr.message);
          }
        }
      }

      // Finalmente eliminar la empresa
      try {
        const companyResult = await client.query(
          'DELETE FROM companies WHERE id = $1',
          [id]
        );
        if (companyResult.rowCount && companyResult.rowCount > 0) {
          deletedTables.push('companies');
          totalDeleted += companyResult.rowCount;
        }
      } catch (companyError: any) {
        console.error('[DeleteCompany] Error eliminando la empresa:', companyError.message);
        failedTables.push(`companies: ${companyError.message}`);
        // Continuar con el commit de las demás eliminaciones
      }
      
      await client.query('COMMIT');
      
      // Si hubo errores en algunas tablas, loguearlos pero no fallar
      if (failedTables.length > 0) {
        console.warn('[DeleteCompany] Algunas tablas no pudieron eliminarse:', failedTables);
      }
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      // Siempre liberar el cliente al pool
      client.release();
    }

    return { deletedTables, totalDeleted, failedTables };
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
    return user;
  }

  async getUserByWorkerId(workerId: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.workerId, workerId));
    return user;
  }

  async getUsersByWorkerIds(workerIds: string[]): Promise<Map<string, User>> {
    if (workerIds.length === 0) {
      return new Map();
    }
    const users = await db.select().from(schema.users)
      .where(inArray(schema.users.workerId, workerIds));
    const userMap = new Map<string, User>();
    for (const user of users) {
      if (user.workerId) {
        userMap.set(user.workerId, user);
      }
    }
    return userMap;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(schema.users).values(insertUser).returning();
    return user;
  }

  async getUsersByCompany(companyId: string): Promise<User[]> {
    return await db.select().from(schema.users)
      .where(eq(schema.users.companyId, companyId))
      .orderBy(desc(schema.users.createdAt));
  }

  async getUsersByRole(roles: string[], companyId: string): Promise<User[]> {
    return await db.select().from(schema.users)
      .where(and(
        eq(schema.users.companyId, companyId),
        or(...roles.map(role => eq(schema.users.role, role as any)))
      ))
      .orderBy(desc(schema.users.createdAt));
  }

  async getUsersByRoleGlobal(role: string): Promise<User[]> {
    return await db.select().from(schema.users)
      .where(eq(schema.users.role, role as any))
      .orderBy(desc(schema.users.createdAt));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(schema.users)
      .orderBy(desc(schema.users.createdAt));
  }

  async updateUser(id: string, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(schema.users)
      .set(updateData)
      .where(eq(schema.users.id, id))
      .returning();
    return user;
  }

  async updateUserSpecialties(id: string, specialties: string[]): Promise<User | undefined> {
    const [user] = await db.update(schema.users)
      .set({ supportSpecialties: specialties })
      .where(eq(schema.users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.transaction(async (tx) => {
      // 1. Delete records from tables with NOT NULL references to users.id
      await tx.delete(schema.historialComunicacionesSst).where(eq(schema.historialComunicacionesSst.userId, id));
      await tx.delete(schema.auditLogs).where(eq(schema.auditLogs.userId, id));
      await tx.delete(schema.sstDocumentAccessLog).where(eq(schema.sstDocumentAccessLog.userId, id));
      await tx.delete(schema.providerAccessLogs).where(eq(schema.providerAccessLogs.providerId, id));
      await tx.delete(schema.ticketStatusHistory).where(eq(schema.ticketStatusHistory.changedBy, id));
      await tx.delete(schema.ticketResponses).where(eq(schema.ticketResponses.userId, id));
      await tx.delete(schema.supportAccessEvents).where(eq(schema.supportAccessEvents.actorId, id));
      await tx.delete(schema.supportAccessSessions).where(eq(schema.supportAccessSessions.supportUserId, id));
      await tx.delete(schema.supportTickets).where(eq(schema.supportTickets.userId, id));
      await tx.delete(schema.internalMessages).where(
        or(eq(schema.internalMessages.senderId, id), eq(schema.internalMessages.receiverId, id))
      );
      await tx.delete(schema.licensedProfessionalAssignments).where(eq(schema.licensedProfessionalAssignments.userId, id));
      await tx.delete(schema.copasstCursoAsignaciones).where(eq(schema.copasstCursoAsignaciones.asignadoPor, id));
      await tx.delete(schema.comunicacionesSst).where(eq(schema.comunicacionesSst.enviadoPor, id));
      await tx.delete(schema.planComunicacionSst).where(eq(schema.planComunicacionSst.elaboradoPor, id));

      // 2. Set NULL on all nullable references to users.id using raw SQL for type safety
      await tx.execute(sql`
        UPDATE consent_records SET revoked_by = NULL WHERE revoked_by = ${id};
        UPDATE consent_records SET recorded_by = NULL WHERE recorded_by = ${id};
        UPDATE consent_records SET updated_by = NULL WHERE updated_by = ${id};
        UPDATE arco_requests SET user_id = NULL WHERE user_id = ${id};
        UPDATE arco_requests SET assigned_to = NULL WHERE assigned_to = ${id};
        UPDATE arco_requests SET escalated_to = NULL WHERE escalated_to = ${id};
        UPDATE arco_requests SET intake_recorded_by = NULL WHERE intake_recorded_by = ${id};
        UPDATE arco_requests SET response_provided_by = NULL WHERE response_provided_by = ${id};
        UPDATE arco_requests SET representative_verified_by = NULL WHERE representative_verified_by = ${id};
        UPDATE health_conditions SET registered_by = NULL WHERE registered_by = ${id};
        UPDATE plan_comunicacion_sst SET aprobado_por = NULL WHERE aprobado_por = ${id};
        UPDATE plan_comunicacion_sst SET responsable_comunicacion_interna = NULL WHERE responsable_comunicacion_interna = ${id};
        UPDATE plan_comunicacion_sst SET responsable_comunicacion_externa = NULL WHERE responsable_comunicacion_externa = ${id};
        UPDATE plan_comunicacion_sst SET responsable_comunicacion_contratistas = NULL WHERE responsable_comunicacion_contratistas = ${id};
        UPDATE lecturas_comunicacion SET user_id = NULL WHERE user_id = ${id};
        UPDATE reportes_trabajadores SET reportado_por = NULL WHERE reportado_por = ${id};
        UPDATE reportes_trabajadores SET asignado_a = NULL WHERE asignado_a = ${id};
        UPDATE reportes_trabajadores SET respondido_por = NULL WHERE respondido_por = ${id};
        UPDATE sociodemographic_diagnosis SET closed_by = NULL WHERE closed_by = ${id};
        UPDATE support_tickets SET assigned_to = NULL WHERE assigned_to = ${id};
        UPDATE support_tickets SET resolved_by = NULL WHERE resolved_by = ${id};
        UPDATE support_access_sessions SET approved_by = NULL WHERE approved_by = ${id};
        UPDATE inspecciones_peligros_vinculados SET verificado_por = NULL WHERE verificado_por = ${id};
        UPDATE pesv_comite_actas SET creado_por = NULL WHERE creado_por = ${id};
        UPDATE recomendaciones_arl_autoridades SET creado_por = NULL WHERE creado_por = ${id};
        UPDATE recomendaciones_arl_autoridades SET actualizado_por = NULL WHERE actualizado_por = ${id};
        UPDATE seguimiento_recomendaciones SET registrado_por = NULL WHERE registrado_por = ${id};
        UPDATE matrices_iperc SET responsable_evaluacion_id = NULL WHERE responsable_evaluacion_id = ${id};
        UPDATE matrices_iperc SET aprobado_por_id = NULL WHERE aprobado_por_id = ${id};
        UPDATE peligros_iperc SET responsable_implementacion_id = NULL WHERE responsable_implementacion_id = ${id};
        UPDATE peligros_trabajadores_asignacion SET asignado_por = NULL WHERE asignado_por = ${id};
        UPDATE auditorias_internas SET auditorista_lider_id = NULL WHERE auditorista_lider_id = ${id};
        UPDATE auditorias_internas SET responsable_auditado_id = NULL WHERE responsable_auditado_id = ${id};
        UPDATE auditorias_internas SET aprobado_por_id = NULL WHERE aprobado_por_id = ${id};
        UPDATE auditoria_auditores SET auditor_id = NULL WHERE auditor_id = ${id};
        UPDATE auditoria_checklists SET evaluado_por_id = NULL WHERE evaluado_por_id = ${id};
        UPDATE hallazgos_auditoria SET detectado_por_id = NULL WHERE detectado_por_id = ${id};
        UPDATE hallazgos_auditoria SET responsable_area_id = NULL WHERE responsable_area_id = ${id};
        UPDATE hallazgos_auditoria SET verificado_por_id = NULL WHERE verificado_por_id = ${id};
        UPDATE planes_accion_auditoria SET responsable_id = NULL WHERE responsable_id = ${id};
        UPDATE planes_accion_auditoria SET verificado_por_id = NULL WHERE verificado_por_id = ${id};
        UPDATE revisiones_direccion SET aprobado_por = NULL WHERE aprobado_por = ${id};
        UPDATE revisiones_direccion SET creado_por = NULL WHERE creado_por = ${id};
        UPDATE participantes_revision SET user_id = NULL WHERE user_id = ${id};
        UPDATE temas_revision SET responsable_presentacion = NULL WHERE responsable_presentacion = ${id};
        UPDATE acciones_revision SET responsable = NULL WHERE responsable = ${id};
        UPDATE acciones_revision SET verificado_por = NULL WHERE verificado_por = ${id};
        UPDATE plan_change_history SET requested_by = NULL WHERE requested_by = ${id};
        UPDATE sst_documents SET prepared_by = NULL WHERE prepared_by = ${id};
        UPDATE sst_documents SET reviewed_by = NULL WHERE reviewed_by = ${id};
        UPDATE sst_documents SET approved_by = NULL WHERE approved_by = ${id};
        UPDATE sst_documents SET created_by = NULL WHERE created_by = ${id};
        UPDATE sst_documents SET updated_by = NULL WHERE updated_by = ${id};
        UPDATE sst_document_versions SET created_by = NULL WHERE created_by = ${id};
        UPDATE sst_document_versions SET approved_by = NULL WHERE approved_by = ${id};
        UPDATE document_worker_assignments SET assigned_by = NULL WHERE assigned_by = ${id};
        UPDATE partes_interesadas SET responsable_comunicacion = NULL WHERE responsable_comunicacion = ${id};
        UPDATE analisis_contexto SET elaborado_por = NULL WHERE elaborado_por = ${id};
        UPDATE analisis_contexto SET aprobado_por = NULL WHERE aprobado_por = ${id};
        UPDATE factores_contexto SET responsable_accion = NULL WHERE responsable_accion = ${id};
        UPDATE acciones_mejora_contexto SET responsable_id = NULL WHERE responsable_id = ${id};
        UPDATE mediciones_indicador_sv SET registrado_por = NULL WHERE registrado_por = ${id};
        UPDATE objetivos_estandares_vinculacion SET created_by = NULL WHERE created_by = ${id};
        UPDATE riesgos_sst_pesv_vinculacion SET vinculado_por = NULL WHERE vinculado_por = ${id};
        UPDATE evaluaciones_pesv SET responsable_evaluacion_id = NULL WHERE responsable_evaluacion_id = ${id};
        UPDATE evaluaciones_pesv SET aprobado_por_id = NULL WHERE aprobado_por_id = ${id};
        UPDATE pesv_step_details SET responsable_implementacion_id = NULL WHERE responsable_implementacion_id = ${id};
      `);

      // 3. Finally delete the user
      await tx.delete(schema.users).where(eq(schema.users.id, id));
    });
  }

  // Worker methods (company-scoped for multi-tenant isolation)
  async getWorkers(companyId: string): Promise<Worker[]> {
    return await db.select().from(schema.workers)
      .where(eq(schema.workers.companyId, companyId))
      .orderBy(desc(schema.workers.createdAt));
  }

  async getAllWorkers(): Promise<Worker[]> {
    // For admin: get all workers from all companies
    return await db.select().from(schema.workers)
      .orderBy(desc(schema.workers.createdAt));
  }

  async getWorker(id: string, companyId: string): Promise<Worker | undefined> {
    const [worker] = await db.select().from(schema.workers)
      .where(and(
        eq(schema.workers.id, id),
        eq(schema.workers.companyId, companyId)
      ));
    return worker;
  }

  async getWorkerById(id: string): Promise<Worker | undefined> {
    // For admin: get worker by id without company filter
    const [worker] = await db.select().from(schema.workers)
      .where(eq(schema.workers.id, id));
    return worker;
  }

  async getWorkerByContract(contractNumber: string, companyId: string): Promise<Worker | undefined> {
    const [worker] = await db.select().from(schema.workers)
      .where(and(
        eq(schema.workers.contractNumber, contractNumber),
        eq(schema.workers.companyId, companyId)
      ));
    return worker;
  }

  async getWorkerByEmail(email: string, companyId: string): Promise<Worker | undefined> {
    const [worker] = await db.select().from(schema.workers)
      .where(and(
        eq(schema.workers.email, email),
        eq(schema.workers.companyId, companyId)
      ));
    return worker;
  }

  async getWorkersByIdentification(identificationNumber: string): Promise<Worker[]> {
    // SECURITY: Check if identification number already exists (globally unique)
    return await db.select().from(schema.workers)
      .where(eq(schema.workers.identificationNumber, identificationNumber));
  }

  async getWorkersByEmail(email: string): Promise<Worker[]> {
    // SECURITY: Check if email already exists (globally unique)
    return await db.select().from(schema.workers)
      .where(eq(schema.workers.email, email));
  }

  async getWorkersByJobProfileId(companyId: string, jobProfileId: string): Promise<Worker[]> {
    // Get workers assigned to a specific job profile (efficient DB-level filter)
    return await db.select().from(schema.workers)
      .where(and(
        eq(schema.workers.companyId, companyId),
        eq(schema.workers.jobProfileId, jobProfileId)
      ))
      .orderBy(schema.workers.name);
  }

  async createWorker(worker: InsertWorker, companyId: string, userId?: string, auditContext?: AuditContext): Promise<Worker> {
    // VALIDATION: Check for duplicate identification number (unique globally to prevent duplicates)
    if (worker.identificationNumber) {
      const existingIdentification = await db.select()
        .from(schema.workers)
        .where(eq(schema.workers.identificationNumber, worker.identificationNumber))
        .limit(1);
      
      if (existingIdentification.length > 0) {
        throw new Error(`Ya existe un empleado con número de documento ${worker.identificationNumber}. Los números de documento deben ser únicos en el sistema.`);
      }
    }

    // VALIDATION: Check for duplicate email (unique globally to prevent duplicates)
    if (worker.email) {
      const existingEmail = await db.select()
        .from(schema.workers)
        .where(eq(schema.workers.email, worker.email))
        .limit(1);
      
      if (existingEmail.length > 0) {
        throw new Error(`Ya existe un empleado con el email ${worker.email}. Los emails deben ser únicos en el sistema.`);
      }
    }
    
    // Retry logic to handle race conditions in contract number generation
    const maxRetries = 5;
    let attempt = 0;
    
    while (attempt < maxRetries) {
      attempt++;
      
      try {
        // Generar automáticamente el número de contrato único GLOBALMENTE
        // Incluir identificador de empresa para garantizar unicidad global
        const year = new Date().getFullYear();
        // Usar los primeros 6 caracteres del companyId como identificador corto
        const companyCode = companyId.substring(0, 6).toUpperCase();
        const prefix = `CONT-${companyCode}-${year}-`;
        
        // Buscar el último trabajador de ESTA empresa específica con el formato actual
        const lastWorker = await db.select()
          .from(schema.workers)
          .where(and(
            eq(schema.workers.companyId, companyId),
            sql`${schema.workers.contractNumber} LIKE ${prefix + '%'}`
          ))
          .orderBy(desc(schema.workers.contractNumber))
          .limit(1);
        
        let nextNumber = 1;
        if (lastWorker.length > 0 && lastWorker[0].contractNumber) {
          // Extraer el número de secuencia del final del contrato (después del último guión)
          // Formato: CONT-{COMPANYCODE}-{YEAR}-{SEQUENCE}
          // Usa /-(\d+)$/ para capturar secuencias de cualquier longitud (soporta >9999)
          const match = lastWorker[0].contractNumber.match(/-(\d+)$/);
          if (match) {
            nextNumber = parseInt(match[1], 10) + 1;
          }
        }
        
        // Formatear el número de contrato: CONT-COMPANYCODE-YEAR-0001
        const contractNumber = `${prefix}${nextNumber.toString().padStart(4, '0')}`;
        
        // Intentar insertar el trabajador
        const [newWorker] = await db.insert(schema.workers).values({
          ...worker,
          companyId,
          contractNumber,
        }).returning();
        
        // Audit logging (Bloque 2: Legal Compliance)
        if (userId) {
          try {
            const user = await this.getUser(userId);
            if (user) {
              await logAuditEvent({
                companyId,
                userId,
                userRole: user.role,
                username: user.username,
                entityType: 'worker',
                entityId: newWorker.id,
                action: 'create',
                newValues: newWorker,
                dataSubjectId: newWorker.id,
                dataSubjectName: newWorker.name,
                description: `Created worker: ${newWorker.name} (${newWorker.identificationNumber})`,
                context: auditContext,
              });
            }
          } catch (auditError) {
            // Log audit error but don't fail worker creation
            logger.error({ err: auditError, workerId: newWorker.id }, 'Failed to log worker creation audit event');
          }
        }
        
        return newWorker;
      } catch (error: any) {
        // Si es un error de unique constraint y no es el último intento, reintentar
        if (error.message?.includes('duplicate key') && 
            error.message?.includes('workers_contract_number') && 
            attempt < maxRetries) {
          console.log(`Contract number collision detected, retrying... (attempt ${attempt}/${maxRetries})`);
          // Pequeño delay aleatorio para reducir colisiones
          await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
          continue;
        }
        // Si no es un error de unique constraint o es el último intento, lanzar el error
        throw error;
      }
    }
    
    throw new Error('Failed to create worker after maximum retries due to contract number collision');
  }

  async updateWorker(id: string, worker: Partial<InsertWorker>, companyId: string, userId?: string, auditContext?: AuditContext): Promise<Worker | undefined> {
    // Get current worker state before update (for audit log)
    const oldWorker = await this.getWorker(id, companyId);
    
    // Update worker
    const [updated] = await db.update(schema.workers)
      .set(worker)
      .where(and(
        eq(schema.workers.id, id),
        eq(schema.workers.companyId, companyId)
      ))
      .returning();
    
    // Audit logging (Bloque 2: Legal Compliance)
    if (updated && userId && oldWorker) {
      try {
        const user = await this.getUser(userId);
        if (user) {
          await logAuditEvent({
            companyId,
            userId,
            userRole: user.role,
            username: user.username,
            entityType: 'worker',
            entityId: updated.id,
            action: 'update',
            oldValues: oldWorker,
            newValues: updated,
            dataSubjectId: updated.id,
            dataSubjectName: updated.name,
            description: `Updated worker: ${updated.name} (${updated.identificationNumber})`,
            context: auditContext,
          });
        }
      } catch (auditError) {
        // Log audit error but don't fail worker update
        logger.error({ err: auditError, workerId: updated.id }, 'Failed to log worker update audit event');
      }
    }
    
    return updated;
  }

  async deleteWorker(id: string, companyId: string, userId?: string, auditContext?: AuditContext, cascade: boolean = true): Promise<{ deletedRecords: Record<string, number> }> {
    const deletedRecords: Record<string, number> = {};
    
    // Get worker before deletion (for audit log)
    const workerToDelete = await this.getWorker(id, companyId);
    
    if (!workerToDelete) {
      logger.warn({ workerId: id, companyId }, 'Worker not found for deletion');
      return { deletedRecords };
    }

    // SECURITY: Explicit company ownership verification to prevent cross-tenant data deletion
    if (workerToDelete.companyId !== companyId) {
      logger.error({ 
        workerId: id, 
        requestedCompanyId: companyId, 
        actualCompanyId: workerToDelete.companyId 
      }, 'SECURITY: Cross-tenant deletion attempt blocked - worker belongs to different company');
      return { deletedRecords };
    }

    if (cascade) {
      // Delete all associated records BEFORE deleting the worker
      // Order matters to avoid FK conflicts - delete child records first
      
      // 1. Set workerId to null in users table (nullable reference)
      try {
        const result = await db.update(schema.users)
          .set({ workerId: null })
          .where(eq(schema.users.workerId, id));
        deletedRecords['users (nullified)'] = 1;
        logger.info({ workerId: id }, 'Nullified user workerId reference');
      } catch (e) {
        logger.warn({ err: e, workerId: id }, 'Could not nullify user workerId');
      }

      // 2. Delete contracts (laborContracts)
      try {
        const result = await db.delete(schema.contracts)
          .where(eq(schema.contracts.workerId, id));
        deletedRecords['contracts'] = result.rowCount || 0;
        logger.info({ workerId: id, count: deletedRecords['contracts'] }, 'Deleted contracts');
      } catch (e) {
        logger.warn({ err: e, workerId: id }, 'Could not delete contracts');
      }

      // 3. Delete training attendees (trainingAttendance) - has onDelete cascade but delete explicitly for audit
      try {
        const result = await db.delete(schema.trainingAttendees)
          .where(eq(schema.trainingAttendees.workerId, id));
        deletedRecords['trainingAttendees'] = result.rowCount || 0;
        logger.info({ workerId: id, count: deletedRecords['trainingAttendees'] }, 'Deleted training attendees');
      } catch (e) {
        logger.warn({ err: e, workerId: id }, 'Could not delete training attendees');
      }

      // 4. Delete consent records (workerConsents)
      try {
        const result = await db.delete(schema.consentRecords)
          .where(eq(schema.consentRecords.workerId, id));
        deletedRecords['consentRecords'] = result.rowCount || 0;
        logger.info({ workerId: id, count: deletedRecords['consentRecords'] }, 'Deleted consent records');
      } catch (e) {
        logger.warn({ err: e, workerId: id }, 'Could not delete consent records');
      }

      // 5. Delete occupational diseases
      try {
        const result = await db.delete(schema.occupationalDiseases)
          .where(eq(schema.occupationalDiseases.workerId, id));
        deletedRecords['occupationalDiseases'] = result.rowCount || 0;
        logger.info({ workerId: id, count: deletedRecords['occupationalDiseases'] }, 'Deleted occupational diseases');
      } catch (e) {
        logger.warn({ err: e, workerId: id }, 'Could not delete occupational diseases');
      }

      // 6. Delete accidents
      try {
        const result = await db.delete(schema.accidents)
          .where(eq(schema.accidents.workerId, id));
        deletedRecords['accidents'] = result.rowCount || 0;
        logger.info({ workerId: id, count: deletedRecords['accidents'] }, 'Deleted accidents');
      } catch (e) {
        logger.warn({ err: e, workerId: id }, 'Could not delete accidents');
      }

      // 7. Delete health conditions (workerHealthConditions)
      try {
        const result = await db.delete(schema.healthConditions)
          .where(eq(schema.healthConditions.workerId, id));
        deletedRecords['healthConditions'] = result.rowCount || 0;
        logger.info({ workerId: id, count: deletedRecords['healthConditions'] }, 'Deleted health conditions');
      } catch (e) {
        logger.warn({ err: e, workerId: id }, 'Could not delete health conditions');
      }

      // 8. Delete induction records (inductionRecords)
      try {
        const result = await db.delete(schema.registrosInduccion)
          .where(eq(schema.registrosInduccion.workerId, id));
        deletedRecords['registrosInduccion'] = result.rowCount || 0;
        logger.info({ workerId: id, count: deletedRecords['registrosInduccion'] }, 'Deleted induction records');
      } catch (e) {
        logger.warn({ err: e, workerId: id }, 'Could not delete induction records');
      }

      // 9. Delete medical exams
      try {
        const result = await db.delete(schema.medicalExams)
          .where(eq(schema.medicalExams.workerId, id));
        deletedRecords['medicalExams'] = result.rowCount || 0;
        logger.info({ workerId: id, count: deletedRecords['medicalExams'] }, 'Deleted medical exams');
      } catch (e) {
        logger.warn({ err: e, workerId: id }, 'Could not delete medical exams');
      }

      // 10. Delete responsible designations
      try {
        const result = await db.delete(schema.responsibleDesignations)
          .where(eq(schema.responsibleDesignations.workerId, id));
        deletedRecords['responsibleDesignations'] = result.rowCount || 0;
        logger.info({ workerId: id, count: deletedRecords['responsibleDesignations'] }, 'Deleted responsible designations');
      } catch (e) {
        logger.warn({ err: e, workerId: id }, 'Could not delete responsible designations');
      }

      // 11. Delete afiliaciones SSSS
      try {
        const result = await db.delete(schema.afiliacionesSSSS)
          .where(eq(schema.afiliacionesSSSS.workerId, id));
        deletedRecords['afiliacionesSSSS'] = result.rowCount || 0;
        logger.info({ workerId: id, count: deletedRecords['afiliacionesSSSS'] }, 'Deleted afiliaciones SSSS');
      } catch (e) {
        logger.warn({ err: e, workerId: id }, 'Could not delete afiliaciones SSSS');
      }

      // 12. Delete trabajadores alto riesgo
      try {
        const result = await db.delete(schema.trabajadoresAltoRiesgo)
          .where(eq(schema.trabajadoresAltoRiesgo.workerId, id));
        deletedRecords['trabajadoresAltoRiesgo'] = result.rowCount || 0;
        logger.info({ workerId: id, count: deletedRecords['trabajadoresAltoRiesgo'] }, 'Deleted trabajadores alto riesgo');
      } catch (e) {
        logger.warn({ err: e, workerId: id }, 'Could not delete trabajadores alto riesgo');
      }

      // 13. Delete detalle verificacion SGSS
      try {
        const result = await db.delete(schema.detalleVerificacionSgss)
          .where(eq(schema.detalleVerificacionSgss.workerId, id));
        deletedRecords['detalleVerificacionSgss'] = result.rowCount || 0;
        logger.info({ workerId: id, count: deletedRecords['detalleVerificacionSgss'] }, 'Deleted detalle verificacion SGSS');
      } catch (e) {
        logger.warn({ err: e, workerId: id }, 'Could not delete detalle verificacion SGSS');
      }

      // 14. Delete capacitacion asistentes
      try {
        const result = await db.delete(schema.capacitacionAsistentes)
          .where(eq(schema.capacitacionAsistentes.workerId, id));
        deletedRecords['capacitacionAsistentes'] = result.rowCount || 0;
        logger.info({ workerId: id, count: deletedRecords['capacitacionAsistentes'] }, 'Deleted capacitacion asistentes');
      } catch (e) {
        logger.warn({ err: e, workerId: id }, 'Could not delete capacitacion asistentes');
      }

      // 15. Delete email notifications (has workerId reference)
      try {
        const result = await db.delete(schema.emailNotifications)
          .where(eq(schema.emailNotifications.workerId, id));
        deletedRecords['emailNotifications'] = result.rowCount || 0;
        logger.info({ workerId: id, count: deletedRecords['emailNotifications'] }, 'Deleted email notifications');
      } catch (e) {
        logger.warn({ err: e, workerId: id }, 'Could not delete email notifications');
      }

      // 16. Delete SVE cases
      try {
        const result = await db.delete(schema.sveCases)
          .where(eq(schema.sveCases.workerId, id));
        deletedRecords['sveCases'] = result.rowCount || 0;
        logger.info({ workerId: id, count: deletedRecords['sveCases'] }, 'Deleted SVE cases');
      } catch (e) {
        logger.warn({ err: e, workerId: id }, 'Could not delete SVE cases');
      }

      // 17. Delete sesiones induccion virtual
      try {
        const result = await db.delete(schema.sesionesInduccionVirtual)
          .where(eq(schema.sesionesInduccionVirtual.workerId, id));
        deletedRecords['sesionesInduccionVirtual'] = result.rowCount || 0;
        logger.info({ workerId: id, count: deletedRecords['sesionesInduccionVirtual'] }, 'Deleted sesiones induccion virtual');
      } catch (e) {
        logger.warn({ err: e, workerId: id }, 'Could not delete sesiones induccion virtual');
      }

      // 18. Delete miembros brigada
      try {
        const result = await db.delete(schema.miembrosBrigada)
          .where(eq(schema.miembrosBrigada.workerId, id));
        deletedRecords['miembrosBrigada'] = result.rowCount || 0;
        logger.info({ workerId: id, count: deletedRecords['miembrosBrigada'] }, 'Deleted miembros brigada');
      } catch (e) {
        logger.warn({ err: e, workerId: id }, 'Could not delete miembros brigada');
      }

      // 19. Delete program training attendance
      try {
        const result = await db.delete(schema.programTrainingAttendance)
          .where(eq(schema.programTrainingAttendance.workerId, id));
        deletedRecords['programTrainingAttendance'] = result.rowCount || 0;
        logger.info({ workerId: id, count: deletedRecords['programTrainingAttendance'] }, 'Deleted program training attendance');
      } catch (e) {
        logger.warn({ err: e, workerId: id }, 'Could not delete program training attendance');
      }

      // 20. Set workerId to null in ARCO requests (nullable reference)
      try {
        await db.update(schema.arcoRequests)
          .set({ workerId: null })
          .where(eq(schema.arcoRequests.workerId, id));
        deletedRecords['arcoRequests (nullified)'] = 1;
        logger.info({ workerId: id }, 'Nullified ARCO requests workerId');
      } catch (e) {
        logger.warn({ err: e, workerId: id }, 'Could not nullify ARCO requests workerId');
      }

      // 21. Set workerId to null in drivers (nullable reference)
      try {
        await db.update(schema.drivers)
          .set({ workerId: null })
          .where(eq(schema.drivers.workerId, id));
        deletedRecords['drivers (nullified)'] = 1;
        logger.info({ workerId: id }, 'Nullified drivers workerId');
      } catch (e) {
        logger.warn({ err: e, workerId: id }, 'Could not nullify drivers workerId');
      }

      // 22. Set workerId to null in resource allocations (nullable reference)
      try {
        await db.update(schema.resourceAllocations)
          .set({ workerId: null })
          .where(eq(schema.resourceAllocations.workerId, id));
        deletedRecords['resourceAllocations (nullified)'] = 1;
        logger.info({ workerId: id }, 'Nullified resource allocations workerId');
      } catch (e) {
        logger.warn({ err: e, workerId: id }, 'Could not nullify resource allocations workerId');
      }

      // 23. Set workerId to null in lecturas comunicacion (nullable reference)
      try {
        await db.update(schema.lecturasComunicacion)
          .set({ workerId: null })
          .where(eq(schema.lecturasComunicacion.workerId, id));
        deletedRecords['lecturasComunicacion (nullified)'] = 1;
        logger.info({ workerId: id }, 'Nullified lecturas comunicacion workerId');
      } catch (e) {
        logger.warn({ err: e, workerId: id }, 'Could not nullify lecturas comunicacion workerId');
      }

      // 24. Set workerId to null in reportes trabajadores (nullable reference)
      try {
        await db.update(schema.reportesTrabajadores)
          .set({ workerId: null })
          .where(eq(schema.reportesTrabajadores.workerId, id));
        deletedRecords['reportesTrabajadores (nullified)'] = 1;
        logger.info({ workerId: id }, 'Nullified reportes trabajadores workerId');
      } catch (e) {
        logger.warn({ err: e, workerId: id }, 'Could not nullify reportes trabajadores workerId');
      }

      // 25. Set workerId to null in participantes simulacro (nullable reference)
      try {
        await db.update(schema.participantesSimulacro)
          .set({ workerId: null })
          .where(eq(schema.participantesSimulacro.workerId, id));
        deletedRecords['participantesSimulacro (nullified)'] = 1;
        logger.info({ workerId: id }, 'Nullified participantes simulacro workerId');
      } catch (e) {
        logger.warn({ err: e, workerId: id }, 'Could not nullify participantes simulacro workerId');
      }

      // Tables with onDelete: "cascade" or "set null" are handled automatically by the database:
      // - highRiskWorkers (cascade)
      // - copasstMiembros, copasstCandidatos, copasstRegistroVotacion, copasstVotos (cascade)
      // - convivenciaMiembros, convivenciaCandidatos, convivenciaRegistroVotacion (cascade)
      // - evsControls, evsFollowups (cascade)
      // - workerPortalAccessLogs, promotionPreventionParticipants, evsIncidents, evsParticipants (set null)
    }

    // Finally delete the worker
    await db.delete(schema.workers)
      .where(and(
        eq(schema.workers.id, id),
        eq(schema.workers.companyId, companyId)
      ));
    deletedRecords['workers'] = 1;
    
    // Audit logging (Bloque 2: Legal Compliance)
    if (userId && workerToDelete) {
      try {
        const user = await this.getUser(userId);
        if (user) {
          await logAuditEvent({
            companyId,
            userId,
            userRole: user.role,
            username: user.username,
            entityType: 'worker',
            entityId: id,
            action: 'delete',
            oldValues: workerToDelete,
            newValues: { cascadeDeleted: cascade, deletedRecords },
            dataSubjectId: workerToDelete.id,
            dataSubjectName: workerToDelete.name,
            description: `Deleted worker: ${workerToDelete.name} (${workerToDelete.identificationNumber}). Cascade: ${cascade}. Deleted records: ${JSON.stringify(deletedRecords)}`,
            context: auditContext,
          });
        }
      } catch (auditError) {
        // Log audit error but don't fail worker deletion
        logger.error({ err: auditError, workerId: id }, 'Failed to log worker deletion audit event');
      }
    }

    logger.info({ workerId: id, companyId, deletedRecords }, 'Worker deleted with cascade');
    return { deletedRecords };
  }

  // Health condition methods (company-scoped for multi-tenant isolation)
  async getHealthConditions(companyId: string): Promise<HealthCondition[]> {
    return await db.select().from(schema.healthConditions)
      .where(eq(schema.healthConditions.companyId, companyId))
      .orderBy(desc(schema.healthConditions.createdAt));
  }

  async getHealthConditionsByWorker(workerId: string): Promise<HealthCondition[]> {
    return await db.select().from(schema.healthConditions)
      .where(eq(schema.healthConditions.workerId, workerId))
      .orderBy(desc(schema.healthConditions.createdAt));
  }

  async createHealthCondition(data: InsertHealthCondition): Promise<HealthCondition> {
    const [newCondition] = await db.insert(schema.healthConditions).values(data).returning();
    return newCondition;
  }

  async updateHealthCondition(id: string, data: Partial<InsertHealthCondition>): Promise<HealthCondition | undefined> {
    const [updated] = await db.update(schema.healthConditions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.healthConditions.id, id))
      .returning();
    return updated;
  }

  async deleteHealthCondition(id: string): Promise<void> {
    await db.delete(schema.healthConditions)
      .where(eq(schema.healthConditions.id, id));
  }

  // Sociodemographic diagnosis cycle methods (company-scoped - Standard 3.1.1)
  async getSociodemographicDiagnoses(companyId: string): Promise<SociodemographicDiagnosis[]> {
    return await db.select().from(schema.sociodemographicDiagnosis)
      .where(eq(schema.sociodemographicDiagnosis.companyId, companyId))
      .orderBy(desc(schema.sociodemographicDiagnosis.year));
  }

  async getCurrentSociodemographicDiagnosis(companyId: string): Promise<SociodemographicDiagnosis | undefined> {
    const [diagnosis] = await db.select().from(schema.sociodemographicDiagnosis)
      .where(and(
        eq(schema.sociodemographicDiagnosis.companyId, companyId),
        eq(schema.sociodemographicDiagnosis.status, "abierto")
      ))
      .orderBy(desc(schema.sociodemographicDiagnosis.year))
      .limit(1);
    return diagnosis;
  }

  async getSociodemographicDiagnosisByYear(companyId: string, year: number): Promise<SociodemographicDiagnosis | undefined> {
    const [diagnosis] = await db.select().from(schema.sociodemographicDiagnosis)
      .where(and(
        eq(schema.sociodemographicDiagnosis.companyId, companyId),
        eq(schema.sociodemographicDiagnosis.year, year)
      ));
    return diagnosis;
  }

  async createSociodemographicDiagnosis(data: InsertSociodemographicDiagnosis): Promise<SociodemographicDiagnosis> {
    const [newDiagnosis] = await db.insert(schema.sociodemographicDiagnosis).values(data).returning();
    return newDiagnosis;
  }

  async closeSociodemographicDiagnosis(id: string, companyId: string, closedBy: string, totalWorkers: number, totalConditions: number, observations?: string): Promise<SociodemographicDiagnosis | undefined> {
    const [updated] = await db.update(schema.sociodemographicDiagnosis)
      .set({
        status: "cerrado",
        closedAt: new Date(),
        closedBy,
        totalWorkers,
        totalConditions,
        observations,
        updatedAt: new Date(),
      })
      .where(and(
        eq(schema.sociodemographicDiagnosis.id, id),
        eq(schema.sociodemographicDiagnosis.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  // Accident methods (company-scoped for multi-tenant isolation)
  async getAccidents(companyId: string): Promise<Accident[]> {
    return await db.select().from(schema.accidents)
      .where(eq(schema.accidents.companyId, companyId))
      .orderBy(desc(schema.accidents.createdAt));
  }

  async getAllAccidents(): Promise<Accident[]> {
    return await db.select().from(schema.accidents)
      .orderBy(desc(schema.accidents.createdAt));
  }

  async getAccident(id: string, companyId: string): Promise<Accident | undefined> {
    const [accident] = await db.select().from(schema.accidents)
      .where(and(
        eq(schema.accidents.id, id),
        eq(schema.accidents.companyId, companyId)
      ));
    return accident;
  }

  async getAccidentById(id: string): Promise<Accident | undefined> {
    const [accident] = await db.select().from(schema.accidents)
      .where(eq(schema.accidents.id, id));
    return accident;
  }

  async createAccident(accident: InsertAccident, companyId: string): Promise<Accident> {
    const [newAccident] = await db.insert(schema.accidents).values({
      ...accident,
      companyId,
    }).returning();
    return newAccident;
  }

  async updateAccident(id: string, accident: Partial<InsertAccident>, companyId: string): Promise<Accident | undefined> {
    const [updated] = await db.update(schema.accidents)
      .set(accident)
      .where(and(
        eq(schema.accidents.id, id),
        eq(schema.accidents.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteAccident(id: string, companyId: string): Promise<void> {
    await db.delete(schema.accidents)
      .where(and(
        eq(schema.accidents.id, id),
        eq(schema.accidents.companyId, companyId)
      ));
  }

  // Training methods (company-scoped for multi-tenant isolation)
  async getTrainings(companyId: string): Promise<Training[]> {
    return await db.select().from(schema.trainings)
      .where(eq(schema.trainings.companyId, companyId))
      .orderBy(desc(schema.trainings.createdAt));
  }

  async getAllTrainings(): Promise<Training[]> {
    return await db.select().from(schema.trainings)
      .orderBy(desc(schema.trainings.createdAt));
  }

  async getTraining(id: string, companyId: string): Promise<Training | undefined> {
    const [training] = await db.select().from(schema.trainings)
      .where(and(
        eq(schema.trainings.id, id),
        eq(schema.trainings.companyId, companyId)
      ));
    return training;
  }

  async getTrainingById(id: string): Promise<Training | undefined> {
    const [training] = await db.select().from(schema.trainings)
      .where(eq(schema.trainings.id, id));
    return training;
  }

  async createTraining(training: InsertTraining, companyId: string): Promise<Training> {
    const [newTraining] = await db.insert(schema.trainings).values({
      ...training,
      companyId,
    }).returning();
    return newTraining;
  }

  async updateTraining(id: string, training: Partial<InsertTraining>, companyId: string): Promise<Training | undefined> {
    const [updated] = await db.update(schema.trainings)
      .set(training)
      .where(and(
        eq(schema.trainings.id, id),
        eq(schema.trainings.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteTraining(id: string, companyId: string): Promise<void> {
    await db.delete(schema.trainings)
      .where(and(
        eq(schema.trainings.id, id),
        eq(schema.trainings.companyId, companyId)
      ));
  }

  // Training attendee methods (company-scoped via training)
  async getTrainingAttendees(trainingId: string, companyId: string): Promise<TrainingAttendee[]> {
    const training = await db.select().from(schema.trainings)
      .where(and(
        eq(schema.trainings.id, trainingId),
        eq(schema.trainings.companyId, companyId)
      ));
    if (!training.length) return [];
    
    return await db.select().from(schema.trainingAttendees)
      .where(eq(schema.trainingAttendees.trainingId, trainingId));
  }

  async getTrainingAttendeesByWorker(workerId: string): Promise<TrainingAttendee[]> {
    return await db.select().from(schema.trainingAttendees)
      .where(eq(schema.trainingAttendees.workerId, workerId));
  }

  async getTrainingAttendeeById(id: string): Promise<TrainingAttendee | undefined> {
    const [attendee] = await db.select().from(schema.trainingAttendees)
      .where(eq(schema.trainingAttendees.id, id));
    return attendee;
  }

  async updateTrainingAttendee(id: string, data: Partial<{ confirmed: number; confirmedAt: Date }>): Promise<TrainingAttendee | undefined> {
    const [updated] = await db.update(schema.trainingAttendees)
      .set(data)
      .where(eq(schema.trainingAttendees.id, id))
      .returning();
    return updated;
  }

  async addTrainingAttendee(attendee: InsertTrainingAttendee, companyId: string): Promise<TrainingAttendee> {
    const training = await db.select().from(schema.trainings)
      .where(and(
        eq(schema.trainings.id, attendee.trainingId),
        eq(schema.trainings.companyId, companyId)
      ));
    if (!training.length) throw new Error("Training not found or access denied");
    
    const [newAttendee] = await db.insert(schema.trainingAttendees).values(attendee).returning();
    return newAttendee;
  }

  async updateAttendance(trainingId: string, workerId: string, attended: number, companyId: string): Promise<void> {
    const training = await db.select().from(schema.trainings)
      .where(and(
        eq(schema.trainings.id, trainingId),
        eq(schema.trainings.companyId, companyId)
      ));
    if (!training.length) return;
    
    await db
      .update(schema.trainingAttendees)
      .set({ attended })
      .where(and(
        eq(schema.trainingAttendees.trainingId, trainingId),
        eq(schema.trainingAttendees.workerId, workerId)
      ));
  }

  // Inspection methods (company-scoped for multi-tenant isolation)
  async getInspections(companyId: string): Promise<Inspection[]> {
    return await db.select().from(schema.inspections)
      .where(eq(schema.inspections.companyId, companyId))
      .orderBy(desc(schema.inspections.createdAt));
  }

  async getAllInspections(): Promise<Inspection[]> {
    return await db.select().from(schema.inspections)
      .orderBy(desc(schema.inspections.createdAt));
  }

  async getInspection(id: string, companyId: string): Promise<Inspection | undefined> {
    const [inspection] = await db.select().from(schema.inspections)
      .where(and(
        eq(schema.inspections.id, id),
        eq(schema.inspections.companyId, companyId)
      ));
    return inspection;
  }

  async getInspectionById(id: string): Promise<Inspection | undefined> {
    const [inspection] = await db.select().from(schema.inspections)
      .where(eq(schema.inspections.id, id));
    return inspection;
  }

  async createInspection(inspection: InsertInspection, companyId: string): Promise<Inspection> {
    const [newInspection] = await db.insert(schema.inspections).values({
      ...inspection,
      companyId,
    }).returning();
    return newInspection;
  }

  async updateInspection(id: string, inspection: Partial<InsertInspection>, companyId: string): Promise<Inspection | undefined> {
    const [updated] = await db.update(schema.inspections)
      .set(inspection)
      .where(and(
        eq(schema.inspections.id, id),
        eq(schema.inspections.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteInspection(id: string, companyId: string): Promise<void> {
    await db.delete(schema.inspections)
      .where(and(
        eq(schema.inspections.id, id),
        eq(schema.inspections.companyId, companyId)
      ));
  }

  // Inspections-IPERC linkage methods (company-scoped for multi-tenant isolation)
  async getPeligrosVinculadosByInspeccion(inspeccionId: string, companyId: string): Promise<schema.InspeccionPeligroVinculado[]> {
    return await db.select()
      .from(schema.inspeccionesPeligrosVinculados)
      .where(and(
        eq(schema.inspeccionesPeligrosVinculados.inspeccionId, inspeccionId),
        eq(schema.inspeccionesPeligrosVinculados.companyId, companyId)
      ));
  }

  async getAllInspeccionesPeligrosVinculados(companyId?: string): Promise<schema.InspeccionPeligroVinculado[]> {
    if (companyId) {
      return await db.select()
        .from(schema.inspeccionesPeligrosVinculados)
        .where(eq(schema.inspeccionesPeligrosVinculados.companyId, companyId));
    }
    return await db.select().from(schema.inspeccionesPeligrosVinculados);
  }

  async getInspeccionPeligroVinculado(id: string, companyId: string): Promise<schema.InspeccionPeligroVinculado | undefined> {
    const [vinculo] = await db.select()
      .from(schema.inspeccionesPeligrosVinculados)
      .where(and(
        eq(schema.inspeccionesPeligrosVinculados.id, id),
        eq(schema.inspeccionesPeligrosVinculados.companyId, companyId)
      ));
    return vinculo;
  }

  async getInspeccionPeligroVinculadoById(id: string): Promise<schema.InspeccionPeligroVinculado | undefined> {
    const [vinculo] = await db.select()
      .from(schema.inspeccionesPeligrosVinculados)
      .where(eq(schema.inspeccionesPeligrosVinculados.id, id));
    return vinculo;
  }

  async createInspeccionPeligroVinculado(vinculo: schema.InsertInspeccionPeligroVinculado, companyId: string, userId: string): Promise<schema.InspeccionPeligroVinculado> {
    const [created] = await db.insert(schema.inspeccionesPeligrosVinculados)
      .values({
        ...vinculo,
        companyId,
        verificadoPor: vinculo.verificadoPor || userId,
      })
      .returning();
    return created;
  }

  async updateInspeccionPeligroVinculado(id: string, vinculo: Partial<schema.InsertInspeccionPeligroVinculado>, companyId: string): Promise<schema.InspeccionPeligroVinculado | undefined> {
    const [updated] = await db.update(schema.inspeccionesPeligrosVinculados)
      .set({
        ...vinculo,
        updatedAt: new Date(),
      })
      .where(and(
        eq(schema.inspeccionesPeligrosVinculados.id, id),
        eq(schema.inspeccionesPeligrosVinculados.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteInspeccionPeligroVinculado(id: string, companyId: string): Promise<void> {
    await db.delete(schema.inspeccionesPeligrosVinculados)
      .where(and(
        eq(schema.inspeccionesPeligrosVinculados.id, id),
        eq(schema.inspeccionesPeligrosVinculados.companyId, companyId)
      ));
  }

  // Preventive measure methods (company-scoped for multi-tenant isolation)
  async getPreventiveMeasures(companyId: string): Promise<PreventiveMeasure[]> {
    return await db.select().from(schema.preventiveMeasures)
      .where(eq(schema.preventiveMeasures.companyId, companyId))
      .orderBy(desc(schema.preventiveMeasures.createdAt));
  }

  async getPreventiveMeasure(id: string, companyId: string): Promise<PreventiveMeasure | undefined> {
    const [measure] = await db.select().from(schema.preventiveMeasures)
      .where(and(
        eq(schema.preventiveMeasures.id, id),
        eq(schema.preventiveMeasures.companyId, companyId)
      ));
    return measure;
  }

  async createPreventiveMeasure(measure: InsertPreventiveMeasure, companyId: string): Promise<PreventiveMeasure> {
    const [newMeasure] = await db.insert(schema.preventiveMeasures).values({
      ...measure,
      companyId,
    }).returning();
    return newMeasure;
  }

  async updatePreventiveMeasure(id: string, measure: Partial<InsertPreventiveMeasure>, companyId: string): Promise<PreventiveMeasure | undefined> {
    const [updated] = await db.update(schema.preventiveMeasures)
      .set(measure)
      .where(and(
        eq(schema.preventiveMeasures.id, id),
        eq(schema.preventiveMeasures.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deletePreventiveMeasure(id: string, companyId: string): Promise<void> {
    await db.delete(schema.preventiveMeasures)
      .where(and(
        eq(schema.preventiveMeasures.id, id),
        eq(schema.preventiveMeasures.companyId, companyId)
      ));
  }

  // ARL/Authority Recommendations methods (Estándar 7.1.4 Resolución 0312/2019)
  async getRecomendacionesArl(companyId: string): Promise<RecomendacionArlAutoridad[]> {
    return await db.select().from(schema.recomendacionesArlAutoridades)
      .where(eq(schema.recomendacionesArlAutoridades.companyId, companyId))
      .orderBy(desc(schema.recomendacionesArlAutoridades.createdAt));
  }

  async getRecomendacionArl(id: string, companyId: string): Promise<RecomendacionArlAutoridad | undefined> {
    const [recomendacion] = await db.select().from(schema.recomendacionesArlAutoridades)
      .where(and(
        eq(schema.recomendacionesArlAutoridades.id, id),
        eq(schema.recomendacionesArlAutoridades.companyId, companyId)
      ));
    return recomendacion;
  }

  async createRecomendacionArl(recomendacion: InsertRecomendacionArlAutoridad, companyId: string, userId: string): Promise<RecomendacionArlAutoridad> {
    const normalizeDate = (date: string | Date | undefined | null): string | undefined => {
      if (!date) return undefined;
      if (typeof date === 'string') return date.split('T')[0];
      return date.toISOString().split('T')[0];
    };
    
    const [newRecomendacion] = await db.insert(schema.recomendacionesArlAutoridades).values({
      ...recomendacion,
      fechaDocumento: normalizeDate(recomendacion.fechaDocumento as string | Date) || '',
      fechaRecepcion: normalizeDate(recomendacion.fechaRecepcion as string | Date) || '',
      fechaLimite: normalizeDate(recomendacion.fechaLimite as string | Date | undefined),
      fechaImplementacion: normalizeDate(recomendacion.fechaImplementacion as string | Date | undefined),
      fechaVerificacion: normalizeDate(recomendacion.fechaVerificacion as string | Date | undefined),
      companyId,
      creadoPor: userId,
    }).returning();
    return newRecomendacion;
  }

  async updateRecomendacionArl(id: string, recomendacion: Partial<InsertRecomendacionArlAutoridad>, companyId: string, userId: string): Promise<RecomendacionArlAutoridad | undefined> {
    const normalizeDate = (date: string | Date | undefined | null): string | undefined => {
      if (!date) return undefined;
      if (typeof date === 'string') return date.split('T')[0];
      return date.toISOString().split('T')[0];
    };
    
    const updateData: Record<string, unknown> = {
      ...recomendacion,
      actualizadoPor: userId,
      updatedAt: new Date(),
    };
    if (recomendacion.fechaDocumento) {
      updateData.fechaDocumento = normalizeDate(recomendacion.fechaDocumento as string | Date);
    }
    if (recomendacion.fechaRecepcion) {
      updateData.fechaRecepcion = normalizeDate(recomendacion.fechaRecepcion as string | Date);
    }
    if (recomendacion.fechaLimite) {
      updateData.fechaLimite = normalizeDate(recomendacion.fechaLimite as string | Date);
    }
    if (recomendacion.fechaImplementacion) {
      updateData.fechaImplementacion = normalizeDate(recomendacion.fechaImplementacion as string | Date);
    }
    if (recomendacion.fechaVerificacion) {
      updateData.fechaVerificacion = normalizeDate(recomendacion.fechaVerificacion as string | Date);
    }
    const [updated] = await db.update(schema.recomendacionesArlAutoridades)
      .set(updateData)
      .where(and(
        eq(schema.recomendacionesArlAutoridades.id, id),
        eq(schema.recomendacionesArlAutoridades.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteRecomendacionArl(id: string, companyId: string): Promise<void> {
    await db.delete(schema.recomendacionesArlAutoridades)
      .where(and(
        eq(schema.recomendacionesArlAutoridades.id, id),
        eq(schema.recomendacionesArlAutoridades.companyId, companyId)
      ));
  }

  // Seguimiento Recomendaciones methods
  async getSeguimientosRecomendacion(recomendacionId: string): Promise<SeguimientoRecomendacion[]> {
    return await db.select().from(schema.seguimientoRecomendaciones)
      .where(eq(schema.seguimientoRecomendaciones.recomendacionId, recomendacionId))
      .orderBy(desc(schema.seguimientoRecomendaciones.createdAt));
  }

  async createSeguimientoRecomendacion(seguimiento: InsertSeguimientoRecomendacion, userId: string): Promise<SeguimientoRecomendacion> {
    const normalizeDate = (date: string | Date | undefined | null): string | undefined => {
      if (!date) return undefined;
      if (typeof date === 'string') return date.split('T')[0];
      return date.toISOString().split('T')[0];
    };
    
    const [newSeguimiento] = await db.insert(schema.seguimientoRecomendaciones).values({
      ...seguimiento,
      fechaSeguimiento: normalizeDate(seguimiento.fechaSeguimiento as string | Date) || '',
      registradoPor: userId,
    }).returning();
    return newSeguimiento;
  }

  // Occupational disease methods (company-scoped for multi-tenant isolation)
  async getOccupationalDiseases(companyId: string): Promise<OccupationalDisease[]> {
    return await db.select().from(schema.occupationalDiseases)
      .where(eq(schema.occupationalDiseases.companyId, companyId))
      .orderBy(desc(schema.occupationalDiseases.createdAt));
  }

  async getOccupationalDisease(id: string, companyId: string): Promise<OccupationalDisease | undefined> {
    const [disease] = await db.select().from(schema.occupationalDiseases)
      .where(and(
        eq(schema.occupationalDiseases.id, id),
        eq(schema.occupationalDiseases.companyId, companyId)
      ));
    return disease;
  }

  async createOccupationalDisease(disease: InsertOccupationalDisease, companyId: string): Promise<OccupationalDisease> {
    const [newDisease] = await db.insert(schema.occupationalDiseases).values({
      ...disease,
      companyId,
    }).returning();
    return newDisease;
  }

  async updateOccupationalDisease(id: string, disease: Partial<InsertOccupationalDisease>, companyId: string): Promise<OccupationalDisease | undefined> {
    const [updated] = await db.update(schema.occupationalDiseases)
      .set(disease)
      .where(and(
        eq(schema.occupationalDiseases.id, id),
        eq(schema.occupationalDiseases.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteOccupationalDisease(id: string, companyId: string): Promise<void> {
    await db.delete(schema.occupationalDiseases)
      .where(and(
        eq(schema.occupationalDiseases.id, id),
        eq(schema.occupationalDiseases.companyId, companyId)
      ));
  }

  // SST Standards methods
  async getSstStandards(standardType?: "RES_0312" | "ISO_45001"): Promise<SstStandard[]> {
    if (standardType) {
      return await db.select().from(schema.sstStandards)
        .where(eq(schema.sstStandards.standardType, standardType))
        .orderBy(schema.sstStandards.order);
    }
    return await db.select().from(schema.sstStandards).orderBy(schema.sstStandards.order);
  }

  async getSstStandard(id: string): Promise<SstStandard | undefined> {
    const [standard] = await db.select().from(schema.sstStandards).where(eq(schema.sstStandards.id, id));
    return standard;
  }

  async createSstStandard(standard: InsertSstStandard): Promise<SstStandard> {
    const [newStandard] = await db.insert(schema.sstStandards).values(standard).returning();
    return newStandard;
  }

  async updateSstStandard(id: string, standard: Partial<InsertSstStandard>): Promise<SstStandard | undefined> {
    const [updated] = await db.update(schema.sstStandards).set(standard).where(eq(schema.sstStandards.id, id)).returning();
    return updated;
  }

  async deleteSstStandard(id: string): Promise<void> {
    await db.delete(schema.sstStandards).where(eq(schema.sstStandards.id, id));
  }

  // SST Items methods
  async getSstItems(standardType?: "RES_0312" | "ISO_45001"): Promise<SstItem[]> {
    if (standardType) {
      // Filter items by joining with standards table
      return await db.select({
        id: schema.sstItems.id,
        createdAt: schema.sstItems.createdAt,
        standardId: schema.sstItems.standardId,
        itemNumber: schema.sstItems.itemNumber,
        description: schema.sstItems.description,
        evaluationCriteria: schema.sstItems.evaluationCriteria,
        maxScore: schema.sstItems.maxScore,
        order: schema.sstItems.order,
      })
      .from(schema.sstItems)
      .innerJoin(schema.sstStandards, eq(schema.sstItems.standardId, schema.sstStandards.id))
      .where(eq(schema.sstStandards.standardType, standardType))
      .orderBy(schema.sstItems.order);
    }
    return await db.select().from(schema.sstItems).orderBy(schema.sstItems.order);
  }

  async getSstItemsByStandard(standardId: string): Promise<SstItem[]> {
    return await db.select().from(schema.sstItems)
      .where(eq(schema.sstItems.standardId, standardId))
      .orderBy(schema.sstItems.order);
  }

  async getSstItem(id: string): Promise<SstItem | undefined> {
    const [item] = await db.select().from(schema.sstItems).where(eq(schema.sstItems.id, id));
    return item;
  }

  async createSstItem(item: InsertSstItem): Promise<SstItem> {
    const [newItem] = await db.insert(schema.sstItems).values(item).returning();
    return newItem;
  }

  async updateSstItem(id: string, item: Partial<InsertSstItem>): Promise<SstItem | undefined> {
    const [updated] = await db.update(schema.sstItems).set(item).where(eq(schema.sstItems.id, id)).returning();
    return updated;
  }

  async deleteSstItem(id: string): Promise<void> {
    await db.delete(schema.sstItems).where(eq(schema.sstItems.id, id));
  }

  // SST Evaluations methods (company-scoped for multi-tenant isolation)
  async getSstEvaluations(companyId: string): Promise<SstEvaluation[]> {
    return await db.select().from(schema.sstEvaluations)
      .where(eq(schema.sstEvaluations.companyId, companyId))
      .orderBy(desc(schema.sstEvaluations.createdAt));
  }

  async getSstEvaluation(id: string, companyId: string): Promise<SstEvaluation | undefined> {
    const [evaluation] = await db.select().from(schema.sstEvaluations)
      .where(and(
        eq(schema.sstEvaluations.id, id),
        eq(schema.sstEvaluations.companyId, companyId)
      ));
    return evaluation;
  }

  async createSstEvaluation(evaluation: InsertSstEvaluation, companyId: string): Promise<SstEvaluation> {
    const [newEvaluation] = await db.insert(schema.sstEvaluations).values({
      ...evaluation,
      companyId,
    }).returning();
    return newEvaluation;
  }

  async updateSstEvaluation(id: string, evaluation: Partial<InsertSstEvaluation>, companyId: string): Promise<SstEvaluation | undefined> {
    const [updated] = await db.update(schema.sstEvaluations)
      .set(evaluation)
      .where(and(
        eq(schema.sstEvaluations.id, id),
        eq(schema.sstEvaluations.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteSstEvaluation(id: string, companyId: string): Promise<void> {
    await db.delete(schema.sstEvaluations)
      .where(and(
        eq(schema.sstEvaluations.id, id),
        eq(schema.sstEvaluations.companyId, companyId)
      ));
  }

  // SST Evaluation Items methods (company-scoped via evaluation)
  async getSstEvaluationItems(evaluationId: string, companyId: string): Promise<SstEvaluationItem[]> {
    const evaluation = await db.select().from(schema.sstEvaluations)
      .where(and(
        eq(schema.sstEvaluations.id, evaluationId),
        eq(schema.sstEvaluations.companyId, companyId)
      ));
    if (!evaluation.length) return [];
    
    return await db.select().from(schema.sstEvaluationItems)
      .where(eq(schema.sstEvaluationItems.evaluationId, evaluationId))
      .orderBy(desc(schema.sstEvaluationItems.createdAt));
  }

  async getSstEvaluationItem(id: string, companyId: string): Promise<SstEvaluationItem | undefined> {
    const items = await db.select()
    .from(schema.sstEvaluationItems)
    .innerJoin(schema.sstEvaluations, eq(schema.sstEvaluationItems.evaluationId, schema.sstEvaluations.id))
    .where(and(
      eq(schema.sstEvaluationItems.id, id),
      eq(schema.sstEvaluations.companyId, companyId)
    ));
    return items[0]?.sst_evaluation_items;
  }

  async createSstEvaluationItem(item: InsertSstEvaluationItem, companyId: string): Promise<SstEvaluationItem> {
    const evaluation = await db.select().from(schema.sstEvaluations)
      .where(and(
        eq(schema.sstEvaluations.id, item.evaluationId),
        eq(schema.sstEvaluations.companyId, companyId)
      ));
    if (!evaluation.length) throw new Error("Evaluation not found or access denied");
    
    const [newItem] = await db.insert(schema.sstEvaluationItems).values(item).returning();
    return newItem;
  }

  async updateSstEvaluationItem(id: string, item: Partial<InsertSstEvaluationItem>, companyId: string): Promise<SstEvaluationItem | undefined> {
    const existing = await this.getSstEvaluationItem(id, companyId);
    if (!existing) return undefined;
    
    const [updated] = await db.update(schema.sstEvaluationItems)
      .set(item)
      .where(eq(schema.sstEvaluationItems.id, id))
      .returning();
    return updated;
  }

  async deleteSstEvaluationItem(id: string, companyId: string): Promise<void> {
    const existing = await this.getSstEvaluationItem(id, companyId);
    if (!existing) return;
    
    await db.delete(schema.sstEvaluationItems)
      .where(eq(schema.sstEvaluationItems.id, id));
  }

  async recalculateEvaluationScore(evaluationId: string, companyId: string): Promise<void> {
    const evaluation = await this.getSstEvaluation(evaluationId, companyId);
    if (!evaluation) return;
    
    const evaluationItems = await this.getSstEvaluationItems(evaluationId, companyId);
    
    let totalScore = 0;
    let maxTotalScore = 0;

    for (const evalItem of evaluationItems) {
      const item = await this.getSstItem(evalItem.itemId);
      if (item) {
        totalScore += evalItem.score;
        maxTotalScore += item.maxScore;
      }
    }

    const compliancePercentage = maxTotalScore > 0 
      ? Math.round((totalScore / maxTotalScore) * 100)
      : 0;

    await db.update(schema.sstEvaluations)
      .set({
        totalScore,
        maxTotalScore,
        compliancePercentage,
      })
      .where(and(
        eq(schema.sstEvaluations.id, evaluationId),
        eq(schema.sstEvaluations.companyId, companyId)
      ));
  }

  // SST Evidence methods (company-scoped via evaluation item)
  async getSstEvidence(evaluationItemId: string, companyId: string): Promise<SstEvidence[]> {
    const evalItem = await this.getSstEvaluationItem(evaluationItemId, companyId);
    if (!evalItem) return [];
    
    return await db.select().from(schema.sstEvidence)
      .where(eq(schema.sstEvidence.evaluationItemId, evaluationItemId))
      .orderBy(desc(schema.sstEvidence.uploadDate));
  }

  async getSstEvidenceItem(id: string, companyId: string): Promise<SstEvidence | undefined> {
    const items = await db.select()
    .from(schema.sstEvidence)
    .innerJoin(schema.sstEvaluationItems, eq(schema.sstEvidence.evaluationItemId, schema.sstEvaluationItems.id))
    .innerJoin(schema.sstEvaluations, eq(schema.sstEvaluationItems.evaluationId, schema.sstEvaluations.id))
    .where(and(
      eq(schema.sstEvidence.id, id),
      eq(schema.sstEvaluations.companyId, companyId)
    ));
    return items[0]?.sst_evidence;
  }

  async createSstEvidence(evidence: InsertSstEvidence, companyId: string): Promise<SstEvidence> {
    const evalItem = await this.getSstEvaluationItem(evidence.evaluationItemId, companyId);
    if (!evalItem) throw new Error("Evaluation item not found or access denied");
    
    const [newEvidence] = await db.insert(schema.sstEvidence).values(evidence).returning();
    return newEvidence;
  }

  async deleteSstEvidence(id: string, companyId: string): Promise<void> {
    const existing = await this.getSstEvidenceItem(id, companyId);
    if (!existing) return;
    
    await db.delete(schema.sstEvidence)
      .where(eq(schema.sstEvidence.id, id));
  }

  // ==================== PESV Methods ====================

  // Vehicle methods (company-scoped for multi-tenant isolation)
  async getVehicles(companyId: string): Promise<Vehicle[]> {
    return await db.select().from(schema.vehicles)
      .where(eq(schema.vehicles.companyId, companyId))
      .orderBy(desc(schema.vehicles.createdAt));
  }

  async getAllVehicles(): Promise<Vehicle[]> {
    return await db.select().from(schema.vehicles)
      .orderBy(desc(schema.vehicles.createdAt));
  }

  async getVehicle(id: string, companyId: string): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(schema.vehicles)
      .where(and(
        eq(schema.vehicles.id, id),
        eq(schema.vehicles.companyId, companyId)
      ));
    return vehicle;
  }

  async getVehicleById(id: string): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(schema.vehicles)
      .where(eq(schema.vehicles.id, id));
    return vehicle;
  }

  async createVehicle(vehicle: InsertVehicle, companyId: string): Promise<Vehicle> {
    const [newVehicle] = await db.insert(schema.vehicles).values({
      ...vehicle,
      companyId,
    }).returning();
    return newVehicle;
  }

  async updateVehicle(id: string, vehicle: Partial<InsertVehicle>, companyId: string): Promise<Vehicle | undefined> {
    const [updated] = await db.update(schema.vehicles)
      .set(vehicle)
      .where(and(
        eq(schema.vehicles.id, id),
        eq(schema.vehicles.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteVehicle(id: string, companyId: string): Promise<void> {
    await db.delete(schema.vehicles)
      .where(and(
        eq(schema.vehicles.id, id),
        eq(schema.vehicles.companyId, companyId)
      ));
  }

  // Driver methods (company-scoped for multi-tenant isolation)
  async getDrivers(companyId: string): Promise<Driver[]> {
    return await db.select().from(schema.drivers)
      .where(eq(schema.drivers.companyId, companyId))
      .orderBy(desc(schema.drivers.createdAt));
  }

  async getAllDrivers(): Promise<Driver[]> {
    return await db.select().from(schema.drivers)
      .orderBy(desc(schema.drivers.createdAt));
  }

  async getDriver(id: string, companyId: string): Promise<Driver | undefined> {
    const [driver] = await db.select().from(schema.drivers)
      .where(and(
        eq(schema.drivers.id, id),
        eq(schema.drivers.companyId, companyId)
      ));
    return driver;
  }

  async getDriverById(id: string): Promise<Driver | undefined> {
    const [driver] = await db.select().from(schema.drivers)
      .where(eq(schema.drivers.id, id));
    return driver;
  }

  async createDriver(driver: InsertDriver, companyId: string): Promise<Driver> {
    const [newDriver] = await db.insert(schema.drivers).values({
      ...driver,
      companyId,
    }).returning();
    return newDriver;
  }

  async updateDriver(id: string, driver: Partial<InsertDriver>, companyId: string): Promise<Driver | undefined> {
    const [updated] = await db.update(schema.drivers)
      .set(driver)
      .where(and(
        eq(schema.drivers.id, id),
        eq(schema.drivers.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteDriver(id: string, companyId: string): Promise<void> {
    await db.delete(schema.drivers)
      .where(and(
        eq(schema.drivers.id, id),
        eq(schema.drivers.companyId, companyId)
      ));
  }

  // Vehicle Inspection methods (company-scoped for multi-tenant isolation)
  async getVehicleInspections(companyId: string): Promise<VehicleInspection[]> {
    return await db.select().from(schema.vehicleInspections)
      .where(eq(schema.vehicleInspections.companyId, companyId))
      .orderBy(desc(schema.vehicleInspections.createdAt));
  }

  async getAllVehicleInspections(): Promise<VehicleInspection[]> {
    return await db.select().from(schema.vehicleInspections)
      .orderBy(desc(schema.vehicleInspections.createdAt));
  }

  async getVehicleInspection(id: string, companyId: string): Promise<VehicleInspection | undefined> {
    const [inspection] = await db.select().from(schema.vehicleInspections)
      .where(and(
        eq(schema.vehicleInspections.id, id),
        eq(schema.vehicleInspections.companyId, companyId)
      ));
    return inspection;
  }

  async getVehicleInspectionById(id: string): Promise<VehicleInspection | undefined> {
    const [inspection] = await db.select().from(schema.vehicleInspections)
      .where(eq(schema.vehicleInspections.id, id));
    return inspection;
  }

  async getVehicleInspectionsByVehicle(vehicleId: string, companyId: string): Promise<VehicleInspection[]> {
    return await db.select().from(schema.vehicleInspections)
      .where(and(
        eq(schema.vehicleInspections.vehicleId, vehicleId),
        eq(schema.vehicleInspections.companyId, companyId)
      ))
      .orderBy(desc(schema.vehicleInspections.createdAt));
  }

  async getVehicleInspectionsByDriver(driverId: string, companyId: string): Promise<VehicleInspection[]> {
    return await db.select().from(schema.vehicleInspections)
      .where(and(
        eq(schema.vehicleInspections.driverId, driverId),
        eq(schema.vehicleInspections.companyId, companyId)
      ))
      .orderBy(desc(schema.vehicleInspections.createdAt));
  }

  async createVehicleInspection(inspection: InsertVehicleInspection, companyId: string): Promise<VehicleInspection> {
    const [newInspection] = await db.insert(schema.vehicleInspections).values({
      ...inspection,
      companyId,
    }).returning();
    return newInspection;
  }

  async updateVehicleInspection(id: string, inspection: Partial<InsertVehicleInspection>, companyId: string): Promise<VehicleInspection | undefined> {
    const [updated] = await db.update(schema.vehicleInspections)
      .set(inspection)
      .where(and(
        eq(schema.vehicleInspections.id, id),
        eq(schema.vehicleInspections.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteVehicleInspection(id: string, companyId: string): Promise<void> {
    await db.delete(schema.vehicleInspections)
      .where(and(
        eq(schema.vehicleInspections.id, id),
        eq(schema.vehicleInspections.companyId, companyId)
      ));
  }

  // Road Incident methods (company-scoped for multi-tenant isolation)
  async getRoadIncidents(companyId: string): Promise<RoadIncident[]> {
    return await db.select().from(schema.roadIncidents)
      .where(eq(schema.roadIncidents.companyId, companyId))
      .orderBy(desc(schema.roadIncidents.createdAt));
  }

  async getAllRoadIncidents(): Promise<RoadIncident[]> {
    return await db.select().from(schema.roadIncidents)
      .orderBy(desc(schema.roadIncidents.createdAt));
  }

  async getRoadIncident(id: string, companyId: string): Promise<RoadIncident | undefined> {
    const [incident] = await db.select().from(schema.roadIncidents)
      .where(and(
        eq(schema.roadIncidents.id, id),
        eq(schema.roadIncidents.companyId, companyId)
      ));
    return incident;
  }

  async getRoadIncidentById(id: string): Promise<RoadIncident | undefined> {
    const [incident] = await db.select().from(schema.roadIncidents)
      .where(eq(schema.roadIncidents.id, id));
    return incident;
  }

  async getRoadIncidentsByVehicle(vehicleId: string, companyId: string): Promise<RoadIncident[]> {
    return await db.select().from(schema.roadIncidents)
      .where(and(
        eq(schema.roadIncidents.vehicleId, vehicleId),
        eq(schema.roadIncidents.companyId, companyId)
      ))
      .orderBy(desc(schema.roadIncidents.createdAt));
  }

  async getRoadIncidentsByDriver(driverId: string, companyId: string): Promise<RoadIncident[]> {
    return await db.select().from(schema.roadIncidents)
      .where(and(
        eq(schema.roadIncidents.driverId, driverId),
        eq(schema.roadIncidents.companyId, companyId)
      ))
      .orderBy(desc(schema.roadIncidents.createdAt));
  }

  async createRoadIncident(incident: InsertRoadIncident, companyId: string): Promise<RoadIncident> {
    const [newIncident] = await db.insert(schema.roadIncidents).values({
      ...incident,
      companyId,
    }).returning();
    return newIncident;
  }

  async updateRoadIncident(id: string, incident: Partial<InsertRoadIncident>, companyId: string): Promise<RoadIncident | undefined> {
    const [updated] = await db.update(schema.roadIncidents)
      .set(incident)
      .where(and(
        eq(schema.roadIncidents.id, id),
        eq(schema.roadIncidents.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteRoadIncident(id: string, companyId: string): Promise<void> {
    await db.delete(schema.roadIncidents)
      .where(and(
        eq(schema.roadIncidents.id, id),
        eq(schema.roadIncidents.companyId, companyId)
      ));
  }

  // Road Safety Training methods (company-scoped for multi-tenant isolation)
  async getRoadSafetyTrainings(companyId: string): Promise<RoadSafetyTraining[]> {
    return await db.select().from(schema.roadSafetyTrainings)
      .where(eq(schema.roadSafetyTrainings.companyId, companyId))
      .orderBy(desc(schema.roadSafetyTrainings.createdAt));
  }

  async getRoadSafetyTraining(id: string, companyId: string): Promise<RoadSafetyTraining | undefined> {
    const [training] = await db.select().from(schema.roadSafetyTrainings)
      .where(and(
        eq(schema.roadSafetyTrainings.id, id),
        eq(schema.roadSafetyTrainings.companyId, companyId)
      ));
    return training;
  }

  async createRoadSafetyTraining(training: InsertRoadSafetyTraining, companyId: string): Promise<RoadSafetyTraining> {
    const [newTraining] = await db.insert(schema.roadSafetyTrainings).values({
      ...training,
      companyId,
    }).returning();
    return newTraining;
  }

  async updateRoadSafetyTraining(id: string, training: Partial<InsertRoadSafetyTraining>, companyId: string): Promise<RoadSafetyTraining | undefined> {
    const [updated] = await db.update(schema.roadSafetyTrainings)
      .set(training)
      .where(and(
        eq(schema.roadSafetyTrainings.id, id),
        eq(schema.roadSafetyTrainings.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteRoadSafetyTraining(id: string, companyId: string): Promise<void> {
    await db.delete(schema.roadSafetyTrainings)
      .where(and(
        eq(schema.roadSafetyTrainings.id, id),
        eq(schema.roadSafetyTrainings.companyId, companyId)
      ));
  }

  // Evaluation-scoped query methods (for filtering by evaluacionPesvId)
  async getVehicleInspectionsByEvaluacion(companyId: string, evaluacionPesvId: string): Promise<VehicleInspection[]> {
    return await db.select().from(schema.vehicleInspections)
      .where(and(
        eq(schema.vehicleInspections.companyId, companyId),
        eq(schema.vehicleInspections.evaluacionPesvId, evaluacionPesvId)
      ))
      .orderBy(desc(schema.vehicleInspections.createdAt));
  }

  async getRoadIncidentsByEvaluacion(companyId: string, evaluacionPesvId: string): Promise<RoadIncident[]> {
    return await db.select().from(schema.roadIncidents)
      .where(and(
        eq(schema.roadIncidents.companyId, companyId),
        eq(schema.roadIncidents.evaluacionPesvId, evaluacionPesvId)
      ))
      .orderBy(desc(schema.roadIncidents.createdAt));
  }

  async getRoadSafetyTrainingsByEvaluacion(companyId: string, evaluacionPesvId: string): Promise<RoadSafetyTraining[]> {
    return await db.select().from(schema.roadSafetyTrainings)
      .where(and(
        eq(schema.roadSafetyTrainings.companyId, companyId),
        eq(schema.roadSafetyTrainings.evaluacionPesvId, evaluacionPesvId)
      ))
      .orderBy(desc(schema.roadSafetyTrainings.createdAt));
  }

  // Road Safety Attendee methods (company-scoped via training)
  async getRoadSafetyAttendees(trainingId: string, companyId: string): Promise<RoadSafetyAttendee[]> {
    const training = await db.select().from(schema.roadSafetyTrainings)
      .where(and(
        eq(schema.roadSafetyTrainings.id, trainingId),
        eq(schema.roadSafetyTrainings.companyId, companyId)
      ));
    if (!training.length) return [];
    
    return await db.select().from(schema.roadSafetyAttendees)
      .where(eq(schema.roadSafetyAttendees.trainingId, trainingId))
      .orderBy(desc(schema.roadSafetyAttendees.createdAt));
  }

  async addRoadSafetyAttendee(attendee: InsertRoadSafetyAttendee, companyId: string): Promise<RoadSafetyAttendee> {
    const training = await db.select().from(schema.roadSafetyTrainings)
      .where(and(
        eq(schema.roadSafetyTrainings.id, attendee.trainingId),
        eq(schema.roadSafetyTrainings.companyId, companyId)
      ));
    if (!training.length) throw new Error("Training not found or access denied");
    
    const [newAttendee] = await db.insert(schema.roadSafetyAttendees).values(attendee).returning();
    return newAttendee;
  }

  async updateRoadSafetyAttendance(trainingId: string, driverId: string, attended: number, companyId: string): Promise<void> {
    const training = await db.select().from(schema.roadSafetyTrainings)
      .where(and(
        eq(schema.roadSafetyTrainings.id, trainingId),
        eq(schema.roadSafetyTrainings.companyId, companyId)
      ));
    if (!training.length) return;
    
    await db.update(schema.roadSafetyAttendees)
      .set({ attended })
      .where(
        and(
          eq(schema.roadSafetyAttendees.trainingId, trainingId),
          eq(schema.roadSafetyAttendees.driverId, driverId)
        )
      );
  }

  // PESV Audit methods (company-scoped for multi-tenant isolation)
  async getPesvAudits(companyId: string): Promise<PesvAudit[]> {
    return await db.select().from(schema.pesvAudits)
      .where(eq(schema.pesvAudits.companyId, companyId))
      .orderBy(desc(schema.pesvAudits.createdAt));
  }

  async getPesvAudit(id: string, companyId: string): Promise<PesvAudit | undefined> {
    const [audit] = await db.select().from(schema.pesvAudits)
      .where(and(
        eq(schema.pesvAudits.id, id),
        eq(schema.pesvAudits.companyId, companyId)
      ));
    return audit;
  }

  async createPesvAudit(audit: InsertPesvAudit, companyId: string): Promise<PesvAudit> {
    const [newAudit] = await db.insert(schema.pesvAudits).values({
      ...audit,
      companyId,
    }).returning();
    return newAudit;
  }

  async updatePesvAudit(id: string, audit: Partial<InsertPesvAudit>, companyId: string): Promise<PesvAudit | undefined> {
    const [updated] = await db.update(schema.pesvAudits)
      .set(audit)
      .where(and(
        eq(schema.pesvAudits.id, id),
        eq(schema.pesvAudits.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deletePesvAudit(id: string, companyId: string): Promise<void> {
    await db.delete(schema.pesvAudits)
      .where(and(
        eq(schema.pesvAudits.id, id),
        eq(schema.pesvAudits.companyId, companyId)
      ));
  }

  // Job Profile methods (company-scoped for multi-tenant isolation)
  async getJobProfiles(companyId: string): Promise<JobProfile[]> {
    return await db.select().from(schema.jobProfiles)
      .where(eq(schema.jobProfiles.companyId, companyId))
      .orderBy(desc(schema.jobProfiles.createdAt));
  }

  async getAllJobProfiles(): Promise<JobProfile[]> {
    // For admin: get all job profiles from all companies
    return await db.select().from(schema.jobProfiles)
      .orderBy(desc(schema.jobProfiles.createdAt));
  }

  async getJobProfile(id: string, companyId: string): Promise<JobProfile | undefined> {
    const [profile] = await db.select().from(schema.jobProfiles)
      .where(and(
        eq(schema.jobProfiles.id, id),
        eq(schema.jobProfiles.companyId, companyId)
      ));
    return profile;
  }

  async getJobProfileById(id: string): Promise<JobProfile | undefined> {
    // For admin: get job profile by id without company filter
    const [profile] = await db.select().from(schema.jobProfiles)
      .where(eq(schema.jobProfiles.id, id));
    return profile;
  }

  async createJobProfile(profile: InsertJobProfile, companyId: string): Promise<JobProfile> {
    const [newProfile] = await db.insert(schema.jobProfiles).values({
      ...profile,
      companyId,
    }).returning();
    return newProfile;
  }

  async updateJobProfile(id: string, profile: Partial<InsertJobProfile>, companyId: string): Promise<JobProfile | undefined> {
    const [updated] = await db.update(schema.jobProfiles)
      .set(profile)
      .where(and(
        eq(schema.jobProfiles.id, id),
        eq(schema.jobProfiles.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async getJobProfileReferences(id: string): Promise<{ workers: number; medicalExams: number; altoRiesgo: number; contracts: number; designaciones: number }> {
    const [workersResult] = await db.select({ count: count() })
      .from(schema.workers)
      .where(eq(schema.workers.jobProfileId, id));
    
    const [examsResult] = await db.select({ count: count() })
      .from(schema.medicalExams)
      .where(eq(schema.medicalExams.jobProfileId, id));
    
    // Count alto riesgo through workers with this job profile
    const [altoRiesgoResult] = await db.select({ count: count() })
      .from(schema.trabajadoresAltoRiesgo)
      .innerJoin(schema.workers, eq(schema.trabajadoresAltoRiesgo.workerId, schema.workers.id))
      .where(eq(schema.workers.jobProfileId, id));
    
    const [contractsResult] = await db.select({ count: count() })
      .from(schema.contracts)
      .where(eq(schema.contracts.jobProfileId, id));
    
    const [designacionesResult] = await db.select({ count: count() })
      .from(schema.responsibleDesignations)
      .where(eq(schema.responsibleDesignations.jobProfileId, id));
    
    return {
      workers: workersResult?.count || 0,
      medicalExams: examsResult?.count || 0,
      altoRiesgo: altoRiesgoResult?.count || 0,
      contracts: contractsResult?.count || 0,
      designaciones: designacionesResult?.count || 0
    };
  }

  async deleteJobProfile(id: string, companyId: string): Promise<void> {
    await db.delete(schema.jobProfiles)
      .where(and(
        eq(schema.jobProfiles.id, id),
        eq(schema.jobProfiles.companyId, companyId)
      ));
  }

  async disassociateWorkersFromJobProfile(jobProfileId: string): Promise<number> {
    const result = await db.update(schema.workers)
      .set({ jobProfileId: null })
      .where(eq(schema.workers.jobProfileId, jobProfileId));
    return result.rowCount || 0;
  }

  // Contract methods (company-scoped for multi-tenant isolation)
  async getAllContracts(): Promise<Contract[]> {
    // For admin: get all contracts from all companies
    return await db.select().from(schema.contracts)
      .orderBy(desc(schema.contracts.createdAt));
  }

  async getContracts(companyId: string): Promise<Contract[]> {
    return await db.select().from(schema.contracts)
      .where(eq(schema.contracts.companyId, companyId))
      .orderBy(desc(schema.contracts.createdAt));
  }

  async getContract(id: string, companyId: string): Promise<Contract | undefined> {
    const [contract] = await db.select().from(schema.contracts)
      .where(and(
        eq(schema.contracts.id, id),
        eq(schema.contracts.companyId, companyId)
      ));
    return contract;
  }

  async getContractById(id: string): Promise<Contract | undefined> {
    // For admin: get contract by id without company filter
    const [contract] = await db.select().from(schema.contracts)
      .where(eq(schema.contracts.id, id));
    return contract;
  }

  async getContractsByWorker(workerId: string, companyId: string): Promise<Contract[]> {
    return await db.select().from(schema.contracts)
      .where(and(
        eq(schema.contracts.workerId, workerId),
        eq(schema.contracts.companyId, companyId)
      ))
      .orderBy(desc(schema.contracts.startDate));
  }

  async getContractByNumber(contractNumber: string, companyId: string): Promise<Contract | undefined> {
    const [contract] = await db.select().from(schema.contracts)
      .where(and(
        eq(schema.contracts.contractNumber, contractNumber),
        eq(schema.contracts.companyId, companyId)
      ));
    return contract;
  }

  async createContract(contract: InsertContract, companyId: string): Promise<Contract> {
    // Generar número de contrato automático si no se proporciona
    let contractNumber = contract.contractNumber;
    if (!contractNumber || contractNumber.trim() === '') {
      const year = new Date().getFullYear();
      const companyPrefix = companyId.substring(0, 6).toUpperCase();
      
      // Contar contratos existentes de esta empresa en este año
      const existingContracts = await db.select({ contractNumber: schema.contracts.contractNumber })
        .from(schema.contracts)
        .where(and(
          eq(schema.contracts.companyId, companyId),
          sql`EXTRACT(YEAR FROM ${schema.contracts.createdAt}) = ${year}`
        ));
      
      const sequenceNumber = existingContracts.length + 1;
      contractNumber = `CONT-${companyPrefix}-${year}-${sequenceNumber.toString().padStart(4, '0')}`;
    }
    
    const [newContract] = await db.insert(schema.contracts).values({
      ...contract,
      contractNumber,
      companyId,
      salary: (contract as any).salary ?? 0, // Default salary to 0 if not provided
    }).returning();
    return newContract;
  }

  async updateContract(id: string, contract: Partial<InsertContract>, companyId: string): Promise<Contract | undefined> {
    const [updated] = await db.update(schema.contracts)
      .set(contract)
      .where(and(
        eq(schema.contracts.id, id),
        eq(schema.contracts.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteContract(id: string, companyId: string): Promise<void> {
    await db.delete(schema.contracts)
      .where(and(
        eq(schema.contracts.id, id),
        eq(schema.contracts.companyId, companyId)
      ));
  }

  // Medical Exam methods (company-scoped for multi-tenant isolation)
  async getMedicalExams(companyId: string): Promise<MedicalExam[]> {
    return await db.select().from(schema.medicalExams)
      .where(eq(schema.medicalExams.companyId, companyId))
      .orderBy(desc(schema.medicalExams.scheduledDate));
  }

  async getMedicalExam(id: string, companyId: string): Promise<MedicalExam | undefined> {
    const [exam] = await db.select().from(schema.medicalExams)
      .where(and(
        eq(schema.medicalExams.id, id),
        eq(schema.medicalExams.companyId, companyId)
      ));
    return exam;
  }

  // For admin: get medical exam by id without company filter
  async getMedicalExamById(id: string): Promise<MedicalExam | undefined> {
    const [exam] = await db.select().from(schema.medicalExams)
      .where(eq(schema.medicalExams.id, id));
    return exam;
  }

  async getMedicalExamsByWorker(workerId: string, companyId: string): Promise<MedicalExam[]> {
    return await db.select().from(schema.medicalExams)
      .where(and(
        eq(schema.medicalExams.workerId, workerId),
        eq(schema.medicalExams.companyId, companyId)
      ))
      .orderBy(desc(schema.medicalExams.scheduledDate));
  }

  async createMedicalExam(exam: InsertMedicalExam, companyId: string): Promise<MedicalExam> {
    const [newExam] = await db.insert(schema.medicalExams).values({
      ...exam,
      companyId,
    }).returning();
    return newExam;
  }

  async updateMedicalExam(id: string, exam: Partial<InsertMedicalExam>, companyId: string): Promise<MedicalExam | undefined> {
    const [updated] = await db.update(schema.medicalExams)
      .set(exam)
      .where(and(
        eq(schema.medicalExams.id, id),
        eq(schema.medicalExams.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteMedicalExam(id: string, companyId: string): Promise<void> {
    await db.delete(schema.medicalExams)
      .where(and(
        eq(schema.medicalExams.id, id),
        eq(schema.medicalExams.companyId, companyId)
      ));
  }

  // Get upcoming medical exams across all companies (for cron jobs)
  async getUpcomingMedicalExams(daysAhead: number): Promise<MedicalExam[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + daysAhead);
    
    const todayStr = today.toISOString().split('T')[0];
    const futureStr = futureDate.toISOString().split('T')[0];
    
    return await db.select().from(schema.medicalExams)
      .where(and(
        eq(schema.medicalExams.status, 'programado'),
        gte(schema.medicalExams.scheduledDate, todayStr),
        lte(schema.medicalExams.scheduledDate, futureStr)
      ))
      .orderBy(schema.medicalExams.scheduledDate);
  }

  // Get admin email addresses for a company (for notifications)
  async getCompanyAdminEmails(companyId: string): Promise<string[]> {
    const adminRoles = ['superusuario', 'admin', 'coordinador_sst', 'lso'];
    const users = await db.select({ email: schema.users.email })
      .from(schema.users)
      .where(and(
        eq(schema.users.companyId, companyId),
        inArray(schema.users.role, adminRoles),
        isNotNull(schema.users.email)
      ));
    
    return users.map(u => u.email).filter((email): email is string => email !== null);
  }

  // Responsible Designation methods - PLANEAR/Recursos
  async getResponsibleDesignations(companyId: string): Promise<ResponsibleDesignation[]> {
    return await db.select().from(schema.responsibleDesignations)
      .where(eq(schema.responsibleDesignations.companyId, companyId))
      .orderBy(desc(schema.responsibleDesignations.designationDate));
  }

  async getResponsibleDesignation(id: string, companyId: string): Promise<ResponsibleDesignation | undefined> {
    const [designation] = await db.select().from(schema.responsibleDesignations)
      .where(and(
        eq(schema.responsibleDesignations.id, id),
        eq(schema.responsibleDesignations.companyId, companyId)
      ));
    return designation;
  }

  async getResponsibleDesignationById(id: string): Promise<ResponsibleDesignation | undefined> {
    // For admin: get designation by id without company filter
    const [designation] = await db.select().from(schema.responsibleDesignations)
      .where(eq(schema.responsibleDesignations.id, id));
    return designation;
  }

  async createResponsibleDesignation(designation: InsertResponsibleDesignation, companyId: string): Promise<ResponsibleDesignation> {
    const [newDesignation] = await db.insert(schema.responsibleDesignations).values({
      ...designation,
      companyId,
    }).returning();
    return newDesignation;
  }

  async updateResponsibleDesignation(id: string, designation: Partial<InsertResponsibleDesignation>, companyId: string): Promise<ResponsibleDesignation | undefined> {
    const [updated] = await db.update(schema.responsibleDesignations)
      .set(designation)
      .where(and(
        eq(schema.responsibleDesignations.id, id),
        eq(schema.responsibleDesignations.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteResponsibleDesignation(id: string, companyId: string): Promise<void> {
    await db.delete(schema.responsibleDesignations)
      .where(and(
        eq(schema.responsibleDesignations.id, id),
        eq(schema.responsibleDesignations.companyId, companyId)
      ));
  }

  // Resource Allocation methods - PLANEAR/Recursos
  async getResourceAllocations(companyId: string): Promise<ResourceAllocation[]> {
    return await db.select().from(schema.resourceAllocations)
      .where(eq(schema.resourceAllocations.companyId, companyId))
      .orderBy(desc(schema.resourceAllocations.date));
  }

  async getResourceAllocation(id: string, companyId: string): Promise<ResourceAllocation | undefined> {
    const [allocation] = await db.select().from(schema.resourceAllocations)
      .where(and(
        eq(schema.resourceAllocations.id, id),
        eq(schema.resourceAllocations.companyId, companyId)
      ));
    return allocation;
  }

  async createResourceAllocation(allocation: InsertResourceAllocation, companyId: string): Promise<ResourceAllocation> {
    const [newAllocation] = await db.insert(schema.resourceAllocations).values({
      ...allocation,
      companyId,
    }).returning();
    return newAllocation;
  }

  async updateResourceAllocation(id: string, allocation: Partial<InsertResourceAllocation>, companyId: string): Promise<ResourceAllocation | undefined> {
    const [updated] = await db.update(schema.resourceAllocations)
      .set(allocation)
      .where(and(
        eq(schema.resourceAllocations.id, id),
        eq(schema.resourceAllocations.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteResourceAllocation(id: string, companyId: string): Promise<void> {
    await db.delete(schema.resourceAllocations)
      .where(and(
        eq(schema.resourceAllocations.id, id),
        eq(schema.resourceAllocations.companyId, companyId)
      ));
  }

  async getRecursosFinancieros(companyId: string): Promise<Array<ResourceAllocation & { presupuestoDisponible: number }>> {
    const allocations = await db.select().from(schema.resourceAllocations)
      .where(and(
        eq(schema.resourceAllocations.companyId, companyId),
        eq(schema.resourceAllocations.resourceType, 'financiero')
      ))
      .orderBy(desc(schema.resourceAllocations.date));
    
    // Get all solicitudes for this company to calculate committed budgets
    const solicitudes = await db.select().from(schema.solicitudesAdquisicion)
      .where(eq(schema.solicitudesAdquisicion.companyId, companyId));
    
    return allocations.map(allocation => {
      const inversionEstimada = parseFloat((allocation.inversionEstimada || '0').replace(/[^0-9.-]+/g, '')) || 0;
      const montoEjecutado = parseFloat((allocation.montoEjecutado || '0').replace(/[^0-9.-]+/g, '')) || 0;
      
      // Calculate total committed from solicitudes linked to this resource
      const presupuestoComprometido = solicitudes
        .filter(s => s.recursoFinancieroId === allocation.id)
        .reduce((sum, s) => sum + (s.presupuestoEstimado || 0), 0);
      
      const presupuestoDisponible = inversionEstimada - montoEjecutado - presupuestoComprometido;
      return { ...allocation, presupuestoDisponible };
    });
  }

  async updateMontoEjecutado(id: string, monto: number, companyId: string): Promise<ResourceAllocation | undefined> {
    const allocation = await this.getResourceAllocation(id, companyId);
    if (!allocation) return undefined;
    
    const currentMonto = parseFloat((allocation.montoEjecutado || '0').replace(/[^0-9.-]+/g, '')) || 0;
    const newMonto = currentMonto + monto;
    
    const [updated] = await db.update(schema.resourceAllocations)
      .set({ montoEjecutado: newMonto.toString() })
      .where(and(
        eq(schema.resourceAllocations.id, id),
        eq(schema.resourceAllocations.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  // COPASST Actas methods
  async getCopasstActas(companyId: string): Promise<CopasstActa[]> {
    return await db.select().from(schema.copasstActas)
      .where(eq(schema.copasstActas.companyId, companyId))
      .orderBy(desc(schema.copasstActas.fecha));
  }

  async getCopasstActa(id: string, companyId: string): Promise<CopasstActa | undefined> {
    const [acta] = await db.select().from(schema.copasstActas)
      .where(and(
        eq(schema.copasstActas.id, id),
        eq(schema.copasstActas.companyId, companyId)
      ));
    return acta;
  }

  async createCopasstActa(acta: InsertCopasstActa, companyId: string): Promise<CopasstActa> {
    // Get the current year
    const currentYear = new Date().getFullYear();
    
    // Get the latest acta number for this company in this year
    const latestActas = await db.select().from(schema.copasstActas)
      .where(eq(schema.copasstActas.companyId, companyId))
      .orderBy(desc(schema.copasstActas.numeroActa))
      .limit(1);
    
    let nextNumber = 1;
    if (latestActas.length > 0) {
      const latestNumero = latestActas[0].numeroActa;
      // Extract number from format "001-2025"
      const match = latestNumero.match(/^(\d+)-(\d{4})$/);
      if (match) {
        const lastNumber = parseInt(match[1]);
        const lastYear = parseInt(match[2]);
        // If same year, increment; otherwise start from 1
        if (lastYear === currentYear) {
          nextNumber = lastNumber + 1;
        }
      }
    }
    
    // Generate the new acta number: "001-2025"
    const numeroActa = `${nextNumber.toString().padStart(3, '0')}-${currentYear}`;
    
    const [newActa] = await db.insert(schema.copasstActas).values({
      ...acta,
      numeroActa,
      companyId,
    }).returning();
    return newActa;
  }

  async updateCopasstActa(id: string, acta: Partial<InsertCopasstActa>, companyId: string): Promise<CopasstActa | undefined> {
    const [updated] = await db.update(schema.copasstActas)
      .set(acta)
      .where(and(
        eq(schema.copasstActas.id, id),
        eq(schema.copasstActas.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async updateCopasstActaFile(id: string, fileData: { archivoAdjuntoUrl: string | null; archivoAdjuntoNombre: string | null }, companyId: string): Promise<CopasstActa | undefined> {
    const [updated] = await db.update(schema.copasstActas)
      .set(fileData)
      .where(and(
        eq(schema.copasstActas.id, id),
        eq(schema.copasstActas.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteCopasstActa(id: string, companyId: string): Promise<void> {
    await db.delete(schema.copasstActas)
      .where(and(
        eq(schema.copasstActas.id, id),
        eq(schema.copasstActas.companyId, companyId)
      ));
  }

  // Afiliaciones SSSS methods
  async getAfiliacionesSsss(companyId: string): Promise<AfiliacionSsss[]> {
    return await db.select().from(schema.afiliacionesSSSS)
      .where(eq(schema.afiliacionesSSSS.companyId, companyId))
      .orderBy(desc(schema.afiliacionesSSSS.fecha));
  }

  async getAllAfiliacionesSsss(): Promise<AfiliacionSsss[]> {
    // For admin: get all afiliaciones from all companies
    return await db.select().from(schema.afiliacionesSSSS)
      .orderBy(desc(schema.afiliacionesSSSS.fecha));
  }

  async getAfiliacionSsss(id: string, companyId: string): Promise<AfiliacionSsss | undefined> {
    const [afiliacion] = await db.select().from(schema.afiliacionesSSSS)
      .where(and(
        eq(schema.afiliacionesSSSS.id, id),
        eq(schema.afiliacionesSSSS.companyId, companyId)
      ));
    return afiliacion;
  }

  async getAfiliacionSsssById(id: string): Promise<AfiliacionSsss | undefined> {
    // For admin: get by id without company filter
    const [afiliacion] = await db.select().from(schema.afiliacionesSSSS)
      .where(eq(schema.afiliacionesSSSS.id, id));
    return afiliacion;
  }

  async createAfiliacionSsss(afiliacion: InsertAfiliacionSsss, companyId: string): Promise<AfiliacionSsss> {
    const [newAfiliacion] = await db.insert(schema.afiliacionesSSSS).values({
      ...afiliacion,
      companyId,
    }).returning();
    return newAfiliacion;
  }

  async updateAfiliacionSsss(id: string, afiliacion: Partial<InsertAfiliacionSsss>, companyId: string): Promise<AfiliacionSsss | undefined> {
    const [updated] = await db.update(schema.afiliacionesSSSS)
      .set(afiliacion)
      .where(and(
        eq(schema.afiliacionesSSSS.id, id),
        eq(schema.afiliacionesSSSS.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteAfiliacionSsss(id: string, companyId: string): Promise<void> {
    await db.delete(schema.afiliacionesSSSS)
      .where(and(
        eq(schema.afiliacionesSSSS.id, id),
        eq(schema.afiliacionesSSSS.companyId, companyId)
      ));
  }

  async bulkDeleteAfiliacionesSsss(companyId: string): Promise<{ deleted: number; total: number; errors: string[] }> {
    const afiliaciones = await db.select().from(schema.afiliacionesSSSS)
      .where(eq(schema.afiliacionesSSSS.companyId, companyId));
    
    const total = afiliaciones.length;
    const errors: string[] = [];
    let deleted = 0;
    
    for (const afiliacion of afiliaciones) {
      try {
        await db.delete(schema.afiliacionesSSSS)
          .where(eq(schema.afiliacionesSSSS.id, afiliacion.id));
        deleted++;
      } catch (error: any) {
        errors.push(`Error eliminando afiliación ${afiliacion.id}: ${error.message}`);
      }
    }
    
    return { deleted, total, errors };
  }

  // Verificación de Muestreo SGSS - Estándar 1.1.4 methods
  async getVerificacionesMuestreoSgss(companyId: string): Promise<VerificacionMuestreoSgss[]> {
    return await db.select().from(schema.verificacionesMuestreoSgss)
      .where(eq(schema.verificacionesMuestreoSgss.companyId, companyId))
      .orderBy(desc(schema.verificacionesMuestreoSgss.fecha));
  }

  async getVerificacionMuestreoSgss(id: string, companyId: string): Promise<VerificacionMuestreoSgss | undefined> {
    const [verificacion] = await db.select().from(schema.verificacionesMuestreoSgss)
      .where(and(
        eq(schema.verificacionesMuestreoSgss.id, id),
        eq(schema.verificacionesMuestreoSgss.companyId, companyId)
      ));
    return verificacion;
  }

  async getVerificacionMuestreoSgssById(id: string): Promise<VerificacionMuestreoSgss | undefined> {
    const [verificacion] = await db.select().from(schema.verificacionesMuestreoSgss)
      .where(eq(schema.verificacionesMuestreoSgss.id, id));
    return verificacion;
  }

  async createVerificacionMuestreoSgss(verificacion: InsertVerificacionMuestreoSgss, companyId: string): Promise<VerificacionMuestreoSgss> {
    const [newVerificacion] = await db.insert(schema.verificacionesMuestreoSgss).values({
      ...verificacion,
      companyId,
    }).returning();
    return newVerificacion;
  }

  async updateVerificacionMuestreoSgss(id: string, verificacion: Partial<InsertVerificacionMuestreoSgss>, companyId: string): Promise<VerificacionMuestreoSgss | undefined> {
    const [updated] = await db.update(schema.verificacionesMuestreoSgss)
      .set(verificacion)
      .where(and(
        eq(schema.verificacionesMuestreoSgss.id, id),
        eq(schema.verificacionesMuestreoSgss.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteVerificacionMuestreoSgss(id: string, companyId: string): Promise<void> {
    // First delete all related details
    await db.delete(schema.detalleVerificacionSgss)
      .where(eq(schema.detalleVerificacionSgss.verificacionId, id));
    // Then delete the verification
    await db.delete(schema.verificacionesMuestreoSgss)
      .where(and(
        eq(schema.verificacionesMuestreoSgss.id, id),
        eq(schema.verificacionesMuestreoSgss.companyId, companyId)
      ));
  }

  // Detalle de Verificación SGSS methods
  async getDetallesVerificacionSgss(verificacionId: string): Promise<DetalleVerificacionSgss[]> {
    // Use raw SQL with DISTINCT ON to get unique workers, keeping the most recent record
    // Must explicitly select and alias columns to camelCase since raw SQL returns snake_case
    const result = await db.execute(sql`
      SELECT DISTINCT ON (worker_id) 
        id,
        verificacion_id AS "verificacionId",
        worker_id AS "workerId",
        tipo_trabajador AS "tipoTrabajador",
        verificado_eps AS "verificadoEps",
        verificado_arl AS "verificadoArl",
        verificado_afp AS "verificadoAfp",
        verificado_ccf AS "verificadoCcf",
        agremiacion_nombre AS "agremiacionNombre",
        agremiacion_autorizada AS "agremiacionAutorizada",
        observaciones,
        cumple,
        created_at AS "createdAt"
      FROM detalle_verificacion_sgss
      WHERE verificacion_id = ${verificacionId}
      ORDER BY worker_id, created_at DESC
    `);
    return result.rows as DetalleVerificacionSgss[];
  }

  async getDetalleVerificacionSgss(id: string): Promise<DetalleVerificacionSgss | undefined> {
    const [detalle] = await db.select().from(schema.detalleVerificacionSgss)
      .where(eq(schema.detalleVerificacionSgss.id, id));
    return detalle;
  }

  async createDetalleVerificacionSgss(detalle: InsertDetalleVerificacionSgss): Promise<DetalleVerificacionSgss> {
    // Check if a detalle already exists for this worker in this verificacion
    const existing = await db.select().from(schema.detalleVerificacionSgss)
      .where(and(
        eq(schema.detalleVerificacionSgss.verificacionId, detalle.verificacionId),
        eq(schema.detalleVerificacionSgss.workerId, detalle.workerId)
      ))
      .limit(1);
    
    if (existing.length > 0) {
      // Update the existing record instead of creating a duplicate
      const [updated] = await db.update(schema.detalleVerificacionSgss)
        .set(detalle)
        .where(eq(schema.detalleVerificacionSgss.id, existing[0].id))
        .returning();
      return updated;
    }
    
    const [newDetalle] = await db.insert(schema.detalleVerificacionSgss).values(detalle).returning();
    return newDetalle;
  }

  async updateDetalleVerificacionSgss(id: string, detalle: Partial<InsertDetalleVerificacionSgss>): Promise<DetalleVerificacionSgss | undefined> {
    const [updated] = await db.update(schema.detalleVerificacionSgss)
      .set(detalle)
      .where(eq(schema.detalleVerificacionSgss.id, id))
      .returning();
    return updated;
  }

  async deleteDetalleVerificacionSgss(id: string): Promise<void> {
    await db.delete(schema.detalleVerificacionSgss)
      .where(eq(schema.detalleVerificacionSgss.id, id));
  }

  // Comité de Convivencia Actas methods
  async getComiteConvivenciaActas(companyId: string): Promise<ComiteConvivenciaActa[]> {
    return await db.select().from(schema.comiteConvivenciaActas)
      .where(eq(schema.comiteConvivenciaActas.companyId, companyId))
      .orderBy(desc(schema.comiteConvivenciaActas.fecha));
  }

  async getComiteConvivenciaActa(id: string, companyId: string): Promise<ComiteConvivenciaActa | undefined> {
    const [acta] = await db.select().from(schema.comiteConvivenciaActas)
      .where(and(
        eq(schema.comiteConvivenciaActas.id, id),
        eq(schema.comiteConvivenciaActas.companyId, companyId)
      ));
    return acta;
  }

  async createComiteConvivenciaActa(acta: InsertComiteConvivenciaActa, companyId: string): Promise<ComiteConvivenciaActa> {
    // Get the current year
    const currentYear = new Date().getFullYear();
    
    // Find the last acta number for this company
    const lastActa = await db.select().from(schema.comiteConvivenciaActas)
      .where(eq(schema.comiteConvivenciaActas.companyId, companyId))
      .orderBy(desc(schema.comiteConvivenciaActas.numeroActa))
      .limit(1);

    let numeroActa: string;
    
    if (lastActa.length === 0) {
      // First acta for this company
      numeroActa = `001-${currentYear}`;
    } else {
      const lastNumero = lastActa[0].numeroActa;
      const [numStr, yearStr] = lastNumero.split('-');
      const lastYear = parseInt(yearStr, 10);
      
      if (lastYear === currentYear) {
        // Same year, increment
        const lastNum = parseInt(numStr, 10);
        const nextNum = lastNum + 1;
        numeroActa = `${String(nextNum).padStart(3, '0')}-${currentYear}`;
      } else {
        // New year, reset to 001
        numeroActa = `001-${currentYear}`;
      }
    }

    // Insert the new acta with the generated numero
    const [newActa] = await db.insert(schema.comiteConvivenciaActas).values({
      ...acta,
      numeroActa,
      companyId,
    }).returning();
    return newActa;
  }

  async updateComiteConvivenciaActa(id: string, acta: Partial<InsertComiteConvivenciaActa>, companyId: string): Promise<ComiteConvivenciaActa | undefined> {
    const [updated] = await db.update(schema.comiteConvivenciaActas)
      .set(acta)
      .where(and(
        eq(schema.comiteConvivenciaActas.id, id),
        eq(schema.comiteConvivenciaActas.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteComiteConvivenciaActa(id: string, companyId: string): Promise<void> {
    await db.delete(schema.comiteConvivenciaActas)
      .where(and(
        eq(schema.comiteConvivenciaActas.id, id),
        eq(schema.comiteConvivenciaActas.companyId, companyId)
      ));
  }

  // Trabajadores de Alto Riesgo methods
  async getTrabajadoresAltoRiesgo(companyId: string): Promise<TrabajadorAltoRiesgo[]> {
    return await db.select().from(schema.trabajadoresAltoRiesgo)
      .where(eq(schema.trabajadoresAltoRiesgo.companyId, companyId))
      .orderBy(desc(schema.trabajadoresAltoRiesgo.fecha));
  }

  async getAllTrabajadoresAltoRiesgo(): Promise<TrabajadorAltoRiesgo[]> {
    // For admin: get all trabajadores de alto riesgo from all companies
    return await db.select().from(schema.trabajadoresAltoRiesgo)
      .orderBy(desc(schema.trabajadoresAltoRiesgo.fecha));
  }

  async getTrabajadorAltoRiesgo(id: string, companyId: string): Promise<TrabajadorAltoRiesgo | undefined> {
    const [trabajador] = await db.select().from(schema.trabajadoresAltoRiesgo)
      .where(and(
        eq(schema.trabajadoresAltoRiesgo.id, id),
        eq(schema.trabajadoresAltoRiesgo.companyId, companyId)
      ));
    return trabajador;
  }

  async getTrabajadorAltoRiesgoById(id: string): Promise<TrabajadorAltoRiesgo | undefined> {
    // For admin: get by id without company filter
    const [trabajador] = await db.select().from(schema.trabajadoresAltoRiesgo)
      .where(eq(schema.trabajadoresAltoRiesgo.id, id));
    return trabajador;
  }

  async createTrabajadorAltoRiesgo(trabajador: InsertTrabajadorAltoRiesgo, companyId: string): Promise<TrabajadorAltoRiesgo> {
    const [newTrabajador] = await db.insert(schema.trabajadoresAltoRiesgo).values({
      ...trabajador,
      companyId,
    }).returning();
    return newTrabajador;
  }

  async updateTrabajadorAltoRiesgo(id: string, trabajador: Partial<InsertTrabajadorAltoRiesgo>, companyId: string): Promise<TrabajadorAltoRiesgo | undefined> {
    const [updated] = await db.update(schema.trabajadoresAltoRiesgo)
      .set(trabajador)
      .where(and(
        eq(schema.trabajadoresAltoRiesgo.id, id),
        eq(schema.trabajadoresAltoRiesgo.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteTrabajadorAltoRiesgo(id: string, companyId: string): Promise<void> {
    await db.delete(schema.trabajadoresAltoRiesgo)
      .where(and(
        eq(schema.trabajadoresAltoRiesgo.id, id),
        eq(schema.trabajadoresAltoRiesgo.companyId, companyId)
      ));
  }

  // Programa de Capacitación methods
  async getProgramasCapacitacion(companyId: string): Promise<ProgramaCapacitacion[]> {
    return await db.select().from(schema.programasCapacitacion)
      .where(eq(schema.programasCapacitacion.companyId, companyId))
      .orderBy(desc(schema.programasCapacitacion.fecha));
  }

  async getProgramaCapacitacion(id: string, companyId: string): Promise<ProgramaCapacitacion | undefined> {
    const [programa] = await db.select().from(schema.programasCapacitacion)
      .where(and(
        eq(schema.programasCapacitacion.id, id),
        eq(schema.programasCapacitacion.companyId, companyId)
      ));
    return programa;
  }

  async createProgramaCapacitacion(programa: InsertProgramaCapacitacion, companyId: string): Promise<ProgramaCapacitacion> {
    const [newPrograma] = await db.insert(schema.programasCapacitacion).values({
      ...programa,
      companyId,
    } as any).returning();
    return newPrograma;
  }

  async updateProgramaCapacitacion(id: string, programa: Partial<InsertProgramaCapacitacion>, companyId: string): Promise<ProgramaCapacitacion | undefined> {
    const [updated] = await db.update(schema.programasCapacitacion)
      .set(programa as any)
      .where(and(
        eq(schema.programasCapacitacion.id, id),
        eq(schema.programasCapacitacion.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteProgramaCapacitacion(id: string, companyId: string): Promise<void> {
    await db.delete(schema.programasCapacitacion)
      .where(and(
        eq(schema.programasCapacitacion.id, id),
        eq(schema.programasCapacitacion.companyId, companyId)
      ));
  }

  // ==================== Catálogo de Capacitaciones SST (global) ====================
  async getCapacitacionesCatalogo(): Promise<CapacitacionCatalogo[]> {
    return await db.select().from(schema.capacitacionesCatalogo)
      .where(eq(schema.capacitacionesCatalogo.activo, true))
      .orderBy(asc(schema.capacitacionesCatalogo.codigo));
  }

  async getCapacitacionCatalogo(id: string): Promise<CapacitacionCatalogo | undefined> {
    const [catalogo] = await db.select().from(schema.capacitacionesCatalogo)
      .where(eq(schema.capacitacionesCatalogo.id, id));
    return catalogo;
  }

  async getCapacitacionCatalogoByCodigo(codigo: string): Promise<CapacitacionCatalogo | undefined> {
    const [catalogo] = await db.select().from(schema.capacitacionesCatalogo)
      .where(eq(schema.capacitacionesCatalogo.codigo, codigo));
    return catalogo;
  }

  // ==================== Eventos de Capacitación (company-scoped) ====================
  async getCapacitacionEventos(companyId: string): Promise<CapacitacionEvento[]> {
    return await db.select().from(schema.capacitacionEventos)
      .where(eq(schema.capacitacionEventos.companyId, companyId))
      .orderBy(desc(schema.capacitacionEventos.fechaInicio));
  }

  async getAllCapacitacionEventos(): Promise<CapacitacionEvento[]> {
    return await db.select().from(schema.capacitacionEventos)
      .orderBy(desc(schema.capacitacionEventos.fechaInicio));
  }

  async getCapacitacionEvento(id: string, companyId: string): Promise<CapacitacionEvento | undefined> {
    const [evento] = await db.select().from(schema.capacitacionEventos)
      .where(and(
        eq(schema.capacitacionEventos.id, id),
        eq(schema.capacitacionEventos.companyId, companyId)
      ));
    return evento;
  }

  async getCapacitacionEventoById(id: string): Promise<CapacitacionEvento | undefined> {
    const [evento] = await db.select().from(schema.capacitacionEventos)
      .where(eq(schema.capacitacionEventos.id, id));
    return evento;
  }

  async createCapacitacionEvento(evento: InsertCapacitacionEvento, companyId: string): Promise<CapacitacionEvento> {
    const [newEvento] = await db.insert(schema.capacitacionEventos).values({
      ...evento,
      companyId,
    } as any).returning();
    return newEvento;
  }

  async updateCapacitacionEvento(id: string, evento: Partial<InsertCapacitacionEvento>, companyId: string): Promise<CapacitacionEvento | undefined> {
    const [updated] = await db.update(schema.capacitacionEventos)
      .set({
        ...evento,
        updatedAt: sql`now()`,
      } as any)
      .where(and(
        eq(schema.capacitacionEventos.id, id),
        eq(schema.capacitacionEventos.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteCapacitacionEvento(id: string, companyId: string): Promise<void> {
    await db.delete(schema.capacitacionEventos)
      .where(and(
        eq(schema.capacitacionEventos.id, id),
        eq(schema.capacitacionEventos.companyId, companyId)
      ));
  }

  // ==================== Asistentes a Capacitación ====================
  async getCapacitacionAsistentes(eventoId: string): Promise<CapacitacionAsistente[]> {
    return await db.select().from(schema.capacitacionAsistentes)
      .where(eq(schema.capacitacionAsistentes.eventoId, eventoId))
      .orderBy(asc(schema.capacitacionAsistentes.createdAt));
  }

  async getCapacitacionAsistente(id: string): Promise<CapacitacionAsistente | undefined> {
    const [asistente] = await db.select().from(schema.capacitacionAsistentes)
      .where(eq(schema.capacitacionAsistentes.id, id));
    return asistente;
  }

  async createCapacitacionAsistente(asistente: InsertCapacitacionAsistente, companyId: string): Promise<CapacitacionAsistente> {
    const [newAsistente] = await db.insert(schema.capacitacionAsistentes).values({
      ...asistente,
      companyId,
    } as any).returning();
    return newAsistente;
  }

  async updateCapacitacionAsistente(id: string, asistente: Partial<InsertCapacitacionAsistente>): Promise<CapacitacionAsistente | undefined> {
    const [updated] = await db.update(schema.capacitacionAsistentes)
      .set(asistente as any)
      .where(eq(schema.capacitacionAsistentes.id, id))
      .returning();
    return updated;
  }

  async deleteCapacitacionAsistente(id: string): Promise<void> {
    await db.delete(schema.capacitacionAsistentes)
      .where(eq(schema.capacitacionAsistentes.id, id));
  }

  async getAsistentesByWorker(workerId: string): Promise<CapacitacionAsistente[]> {
    return await db.select().from(schema.capacitacionAsistentes)
      .where(eq(schema.capacitacionAsistentes.workerId, workerId));
  }

  // Curso de 50 Horas methods
  async getCurso50Horas(companyId: string): Promise<Curso50Horas | undefined> {
    const [curso] = await db.select().from(schema.curso50Horas)
      .where(eq(schema.curso50Horas.companyId, companyId));
    return curso;
  }

  async upsertCurso50Horas(curso: Partial<InsertCurso50Horas>, companyId: string): Promise<Curso50Horas> {
    const existing = await this.getCurso50Horas(companyId);
    
    if (existing) {
      const [updated] = await db.update(schema.curso50Horas)
        .set({
          ...curso,
          updatedAt: sql`now()`,
        })
        .where(eq(schema.curso50Horas.companyId, companyId))
        .returning();
      return updated;
    } else {
      const [newCurso] = await db.insert(schema.curso50Horas)
        .values({
          ...curso,
          companyId,
        })
        .returning();
      return newCurso;
    }
  }

  // Registros de Inducción methods
  async getRegistrosInduccion(companyId: string): Promise<RegistroInduccion[]> {
    return await db.select().from(schema.registrosInduccion)
      .where(eq(schema.registrosInduccion.companyId, companyId))
      .orderBy(desc(schema.registrosInduccion.fecha));
  }

  async getRegistroInduccion(id: string, companyId: string): Promise<RegistroInduccion | undefined> {
    const [registro] = await db.select().from(schema.registrosInduccion)
      .where(and(
        eq(schema.registrosInduccion.id, id),
        eq(schema.registrosInduccion.companyId, companyId)
      ));
    return registro;
  }

  // For admin: get registro by id without company filter
  async getRegistroInduccionById(id: string): Promise<RegistroInduccion | undefined> {
    const [registro] = await db.select().from(schema.registrosInduccion)
      .where(eq(schema.registrosInduccion.id, id));
    return registro;
  }

  async getRegistrosInduccionByWorker(workerId: string, companyId: string): Promise<RegistroInduccion[]> {
    return await db.select().from(schema.registrosInduccion)
      .where(and(
        eq(schema.registrosInduccion.workerId, workerId),
        eq(schema.registrosInduccion.companyId, companyId)
      ))
      .orderBy(desc(schema.registrosInduccion.fecha));
  }

  async createRegistroInduccion(registro: InsertRegistroInduccion, companyId: string): Promise<RegistroInduccion> {
    const [newRegistro] = await db.insert(schema.registrosInduccion).values({
      ...registro,
      companyId,
    } as any).returning();
    return newRegistro;
  }

  async updateRegistroInduccion(id: string, registro: Partial<InsertRegistroInduccion>, companyId: string): Promise<RegistroInduccion | undefined> {
    const [updated] = await db.update(schema.registrosInduccion)
      .set({
        ...registro,
        updatedAt: sql`now()`,
      } as any)
      .where(and(
        eq(schema.registrosInduccion.id, id),
        eq(schema.registrosInduccion.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteRegistroInduccion(id: string, companyId: string): Promise<void> {
    await db.delete(schema.registrosInduccion)
      .where(and(
        eq(schema.registrosInduccion.id, id),
        eq(schema.registrosInduccion.companyId, companyId)
      ));
  }

  // Email Notification methods
  async getEmailNotifications(companyId: string): Promise<EmailNotification[]> {
    return await db.select().from(schema.emailNotifications)
      .where(eq(schema.emailNotifications.companyId, companyId))
      .orderBy(desc(schema.emailNotifications.createdAt));
  }

  async getEmailNotification(id: string, companyId: string): Promise<EmailNotification | undefined> {
    const [notification] = await db.select().from(schema.emailNotifications)
      .where(and(
        eq(schema.emailNotifications.id, id),
        eq(schema.emailNotifications.companyId, companyId)
      ));
    return notification;
  }

  async createEmailNotification(notification: InsertEmailNotification): Promise<EmailNotification> {
    const [newNotification] = await db.insert(schema.emailNotifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  async updateEmailNotification(id: string, notification: Partial<InsertEmailNotification>): Promise<EmailNotification | undefined> {
    const [updated] = await db.update(schema.emailNotifications)
      .set(notification)
      .where(eq(schema.emailNotifications.id, id))
      .returning();
    return updated;
  }

  async getPendingNotifications(companyId: string): Promise<EmailNotification[]> {
    return await db.select().from(schema.emailNotifications)
      .where(and(
        eq(schema.emailNotifications.companyId, companyId),
        eq(schema.emailNotifications.status, 'pending'),
        sql`${schema.emailNotifications.scheduledDate} <= CURRENT_DATE`
      ))
      .orderBy(schema.emailNotifications.scheduledDate);
  }

  // Notification Helper methods
  async getUpcomingExamRenewals(companyId: string, daysAhead: number): Promise<Array<{
    exam: MedicalExam;
    worker: Worker;
  }>> {
    const results = await db
      .select({
        exam: schema.medicalExams,
        worker: schema.workers,
      })
      .from(schema.medicalExams)
      .innerJoin(schema.workers, eq(schema.medicalExams.workerId, schema.workers.id))
      .where(and(
        eq(schema.medicalExams.companyId, companyId),
        sql`${schema.medicalExams.followUpDate} IS NOT NULL`,
        sql`${schema.medicalExams.followUpDate} BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '${sql.raw(daysAhead.toString())} days'`
      ));

    return results;
  }

  async getUpcomingTrainingRenewals(companyId: string, daysAhead: number): Promise<Array<{
    training: Training;
    attendees: Array<{ worker: Worker; completedDate: string }>;
  }>> {
    // Get trainings with validity period that are completed
    const trainingsWithValidity = await db
      .select()
      .from(schema.trainings)
      .where(and(
        eq(schema.trainings.companyId, companyId),
        eq(schema.trainings.status, 'completada'),
        sql`${schema.trainings.validityMonths} IS NOT NULL`
      ));

    const results: Array<{
      training: Training;
      attendees: Array<{ worker: Worker; completedDate: string }>;
    }> = [];

    for (const training of trainingsWithValidity) {
      // Calculate expiry date
      const completedDate = new Date(training.date);
      const expiryDate = new Date(completedDate);
      expiryDate.setMonth(expiryDate.getMonth() + (training.validityMonths || 0));

      // Check if expiry is within daysAhead
      const today = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry >= 0 && daysUntilExpiry <= daysAhead) {
        // Get attendees who completed this training
        const attendees = await db
          .select({
            worker: schema.workers,
            attendee: schema.trainingAttendees,
          })
          .from(schema.trainingAttendees)
          .innerJoin(schema.workers, eq(schema.trainingAttendees.workerId, schema.workers.id))
          .where(and(
            eq(schema.trainingAttendees.trainingId, training.id),
            eq(schema.trainingAttendees.attended, 1)
          ));

        if (attendees.length > 0) {
          results.push({
            training,
            attendees: attendees.map(a => ({
              worker: a.worker,
              completedDate: training.date,
            })),
          });
        }
      }
    }

    return results;
  }

  // ==================== GESTIÓN AMBIENTAL OCUPACIONAL ====================
  
  // Environmental Measurement methods
  async getEnvironmentalMeasurements(companyId: string): Promise<EnvironmentalMeasurement[]> {
    return await db.select().from(schema.environmentalMeasurements)
      .where(eq(schema.environmentalMeasurements.companyId, companyId))
      .orderBy(desc(schema.environmentalMeasurements.measurementDate));
  }

  async getAllEnvironmentalMeasurements(): Promise<EnvironmentalMeasurement[]> {
    return await db.select().from(schema.environmentalMeasurements)
      .orderBy(desc(schema.environmentalMeasurements.measurementDate));
  }

  async getEnvironmentalMeasurement(id: string, companyId: string): Promise<EnvironmentalMeasurement | undefined> {
    const [measurement] = await db.select().from(schema.environmentalMeasurements)
      .where(and(
        eq(schema.environmentalMeasurements.id, id),
        eq(schema.environmentalMeasurements.companyId, companyId)
      ));
    return measurement;
  }

  async getEnvironmentalMeasurementById(id: string): Promise<EnvironmentalMeasurement | undefined> {
    const [measurement] = await db.select().from(schema.environmentalMeasurements)
      .where(eq(schema.environmentalMeasurements.id, id));
    return measurement;
  }

  async createEnvironmentalMeasurement(measurement: InsertEnvironmentalMeasurement, companyId: string): Promise<EnvironmentalMeasurement> {
    const [newMeasurement] = await db.insert(schema.environmentalMeasurements)
      .values({ 
        ...measurement, 
        companyId,
        measurementDate: measurement.measurementDate.toISOString().split('T')[0],
        calibrationDate: measurement.calibrationDate ? measurement.calibrationDate.toISOString().split('T')[0] : undefined,
      } as any)
      .returning();
    return newMeasurement;
  }

  async updateEnvironmentalMeasurement(id: string, measurement: Partial<InsertEnvironmentalMeasurement>, companyId: string): Promise<EnvironmentalMeasurement | undefined> {
    const updateData: any = { ...measurement };
    if (measurement.measurementDate) {
      updateData.measurementDate = measurement.measurementDate.toISOString().split('T')[0];
    }
    if (measurement.calibrationDate) {
      updateData.calibrationDate = measurement.calibrationDate.toISOString().split('T')[0];
    }
    
    const [updated] = await db.update(schema.environmentalMeasurements)
      .set(updateData)
      .where(and(
        eq(schema.environmentalMeasurements.id, id),
        eq(schema.environmentalMeasurements.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteEnvironmentalMeasurement(id: string, companyId: string): Promise<void> {
    await db.delete(schema.environmentalMeasurements)
      .where(and(
        eq(schema.environmentalMeasurements.id, id),
        eq(schema.environmentalMeasurements.companyId, companyId)
      ));
  }

  // Hazardous Substance methods
  async getHazardousSubstances(companyId: string): Promise<HazardousSubstance[]> {
    return await db.select().from(schema.hazardousSubstances)
      .where(eq(schema.hazardousSubstances.companyId, companyId))
      .orderBy(desc(schema.hazardousSubstances.createdAt));
  }

  async getHazardousSubstance(id: string, companyId: string): Promise<HazardousSubstance | undefined> {
    const [substance] = await db.select().from(schema.hazardousSubstances)
      .where(and(
        eq(schema.hazardousSubstances.id, id),
        eq(schema.hazardousSubstances.companyId, companyId)
      ));
    return substance;
  }

  async createHazardousSubstance(substance: InsertHazardousSubstance, companyId: string): Promise<HazardousSubstance> {
    const [newSubstance] = await db.insert(schema.hazardousSubstances)
      .values({ 
        ...substance, 
        companyId,
        sdsUpdateDate: substance.sdsUpdateDate ? substance.sdsUpdateDate.toISOString().split('T')[0] : undefined,
      } as any)
      .returning();
    return newSubstance;
  }

  async updateHazardousSubstance(id: string, substance: Partial<InsertHazardousSubstance>, companyId: string): Promise<HazardousSubstance | undefined> {
    const updateData: any = { ...substance };
    if (substance.sdsUpdateDate) {
      updateData.sdsUpdateDate = substance.sdsUpdateDate.toISOString().split('T')[0];
    }
    
    const [updated] = await db.update(schema.hazardousSubstances)
      .set(updateData)
      .where(and(
        eq(schema.hazardousSubstances.id, id),
        eq(schema.hazardousSubstances.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteHazardousSubstance(id: string, companyId: string): Promise<void> {
    await db.delete(schema.hazardousSubstances)
      .where(and(
        eq(schema.hazardousSubstances.id, id),
        eq(schema.hazardousSubstances.companyId, companyId)
      ));
  }

  // ==================== VIGILANCIA EPIDEMIOLÓGICA OCUPACIONAL ====================
  
  // SVE Program methods
  async getSvePrograms(companyId: string): Promise<schema.SveProgram[]> {
    return await db.select().from(schema.svePrograms)
      .where(eq(schema.svePrograms.companyId, companyId))
      .orderBy(desc(schema.svePrograms.createdAt));
  }

  async getSveProgram(id: string, companyId: string): Promise<schema.SveProgram | undefined> {
    const [program] = await db.select().from(schema.svePrograms)
      .where(and(
        eq(schema.svePrograms.id, id),
        eq(schema.svePrograms.companyId, companyId)
      ));
    return program;
  }

  async createSveProgram(program: schema.InsertSveProgram, companyId: string): Promise<schema.SveProgram> {
    const [newProgram] = await db.insert(schema.svePrograms)
      .values({ 
        ...program, 
        companyId,
        startDate: program.startDate.toISOString().split('T')[0],
        reviewDate: program.reviewDate ? program.reviewDate.toISOString().split('T')[0] : undefined,
      } as any)
      .returning();
    return newProgram;
  }

  async updateSveProgram(id: string, program: Partial<schema.InsertSveProgram>, companyId: string): Promise<schema.SveProgram | undefined> {
    const updateData: any = { ...program };
    if (program.startDate) {
      updateData.startDate = program.startDate.toISOString().split('T')[0];
    }
    if (program.reviewDate) {
      updateData.reviewDate = program.reviewDate.toISOString().split('T')[0];
    }
    
    const [updated] = await db.update(schema.svePrograms)
      .set(updateData)
      .where(and(
        eq(schema.svePrograms.id, id),
        eq(schema.svePrograms.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteSveProgram(id: string, companyId: string): Promise<void> {
    await db.delete(schema.svePrograms)
      .where(and(
        eq(schema.svePrograms.id, id),
        eq(schema.svePrograms.companyId, companyId)
      ));
  }

  // SVE Case methods
  async getSveCases(companyId: string, programId?: string): Promise<schema.SveCase[]> {
    const conditions = [eq(schema.sveCases.companyId, companyId)];
    if (programId) {
      conditions.push(eq(schema.sveCases.programId, programId));
    }
    
    return await db.select().from(schema.sveCases)
      .where(and(...conditions))
      .orderBy(desc(schema.sveCases.evaluationDate));
  }

  async getSveCase(id: string, companyId: string): Promise<schema.SveCase | undefined> {
    const [sveCase] = await db.select().from(schema.sveCases)
      .where(and(
        eq(schema.sveCases.id, id),
        eq(schema.sveCases.companyId, companyId)
      ));
    return sveCase;
  }

  async createSveCase(sveCase: schema.InsertSveCase, companyId: string): Promise<schema.SveCase> {
    const [newCase] = await db.insert(schema.sveCases)
      .values({ 
        ...sveCase, 
        companyId,
        evaluationDate: sveCase.evaluationDate.toISOString().split('T')[0],
        followUpDate: sveCase.followUpDate ? sveCase.followUpDate.toISOString().split('T')[0] : undefined,
      } as any)
      .returning();
    return newCase;
  }

  async updateSveCase(id: string, sveCase: Partial<schema.InsertSveCase>, companyId: string): Promise<schema.SveCase | undefined> {
    const updateData: any = { ...sveCase };
    if (sveCase.evaluationDate) {
      updateData.evaluationDate = sveCase.evaluationDate.toISOString().split('T')[0];
    }
    if (sveCase.followUpDate) {
      updateData.followUpDate = sveCase.followUpDate.toISOString().split('T')[0];
    }
    
    const [updated] = await db.update(schema.sveCases)
      .set(updateData)
      .where(and(
        eq(schema.sveCases.id, id),
        eq(schema.sveCases.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteSveCase(id: string, companyId: string): Promise<void> {
    await db.delete(schema.sveCases)
      .where(and(
        eq(schema.sveCases.id, id),
        eq(schema.sveCases.companyId, companyId)
      ));
  }

  // Training Program methods implementation
  async getTrainingPrograms(companyId: string): Promise<schema.TrainingProgram[]> {
    return await db.select().from(schema.trainingPrograms)
      .where(eq(schema.trainingPrograms.companyId, companyId))
      .orderBy(desc(schema.trainingPrograms.year));
  }

  async getTrainingProgram(id: string, companyId: string): Promise<schema.TrainingProgram | undefined> {
    const [program] = await db.select().from(schema.trainingPrograms)
      .where(and(
        eq(schema.trainingPrograms.id, id),
        eq(schema.trainingPrograms.companyId, companyId)
      ));
    return program;
  }

  async getTrainingProgramByYear(year: number, companyId: string): Promise<schema.TrainingProgram | undefined> {
    const [program] = await db.select().from(schema.trainingPrograms)
      .where(and(
        eq(schema.trainingPrograms.year, year),
        eq(schema.trainingPrograms.companyId, companyId)
      ));
    return program;
  }

  async createTrainingProgram(program: schema.InsertTrainingProgram, companyId: string): Promise<schema.TrainingProgram> {
    const [newProgram] = await db.insert(schema.trainingPrograms)
      .values({ 
        ...program, 
        companyId,
        copasstApprovalDate: program.copasstApprovalDate ? program.copasstApprovalDate.toISOString().split('T')[0] : undefined,
      } as any)
      .returning();
    return newProgram;
  }

  async updateTrainingProgram(id: string, program: Partial<schema.InsertTrainingProgram>, companyId: string): Promise<schema.TrainingProgram | undefined> {
    const updateData: any = { ...program, updatedAt: sql`now()` };
    if (program.copasstApprovalDate) {
      updateData.copasstApprovalDate = program.copasstApprovalDate.toISOString().split('T')[0];
    }
    
    const [updated] = await db.update(schema.trainingPrograms)
      .set(updateData)
      .where(and(
        eq(schema.trainingPrograms.id, id),
        eq(schema.trainingPrograms.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteTrainingProgram(id: string, companyId: string): Promise<void> {
    await db.delete(schema.trainingPrograms)
      .where(and(
        eq(schema.trainingPrograms.id, id),
        eq(schema.trainingPrograms.companyId, companyId)
      ));
  }

  // Program Training methods implementation
  async getProgramTrainings(programId: string, companyId: string): Promise<schema.ProgramTraining[]> {
    return await db.select().from(schema.programTrainings)
      .where(and(
        eq(schema.programTrainings.programId, programId),
        eq(schema.programTrainings.companyId, companyId)
      ))
      .orderBy(schema.programTrainings.scheduledDate);
  }

  async getProgramTraining(id: string, companyId: string): Promise<schema.ProgramTraining | undefined> {
    const [training] = await db.select().from(schema.programTrainings)
      .where(and(
        eq(schema.programTrainings.id, id),
        eq(schema.programTrainings.companyId, companyId)
      ));
    return training;
  }

  async createProgramTraining(training: schema.InsertProgramTraining, companyId: string): Promise<schema.ProgramTraining> {
    const [newTraining] = await db.insert(schema.programTrainings)
      .values({ 
        ...training, 
        companyId,
        scheduledDate: training.scheduledDate.toISOString().split('T')[0],
        actualDate: training.actualDate ? training.actualDate.toISOString().split('T')[0] : undefined,
      } as any)
      .returning();
    return newTraining;
  }

  async updateProgramTraining(id: string, training: Partial<schema.InsertProgramTraining>, companyId: string): Promise<schema.ProgramTraining | undefined> {
    const updateData: any = { ...training, updatedAt: sql`now()` };
    if (training.scheduledDate) {
      updateData.scheduledDate = training.scheduledDate.toISOString().split('T')[0];
    }
    if (training.actualDate) {
      updateData.actualDate = training.actualDate.toISOString().split('T')[0];
    }
    
    const [updated] = await db.update(schema.programTrainings)
      .set(updateData)
      .where(and(
        eq(schema.programTrainings.id, id),
        eq(schema.programTrainings.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteProgramTraining(id: string, companyId: string): Promise<void> {
    await db.delete(schema.programTrainings)
      .where(and(
        eq(schema.programTrainings.id, id),
        eq(schema.programTrainings.companyId, companyId)
      ));
  }

  // Program Training Attendance methods implementation
  async getProgramTrainingAttendance(trainingId: string, companyId: string): Promise<schema.ProgramTrainingAttendance[]> {
    return await db.select().from(schema.programTrainingAttendance)
      .where(and(
        eq(schema.programTrainingAttendance.trainingId, trainingId),
        eq(schema.programTrainingAttendance.companyId, companyId)
      ))
      .orderBy(schema.programTrainingAttendance.createdAt);
  }

  async createProgramTrainingAttendance(attendance: schema.InsertProgramTrainingAttendance, companyId: string): Promise<schema.ProgramTrainingAttendance> {
    const [newAttendance] = await db.insert(schema.programTrainingAttendance)
      .values({ 
        ...attendance, 
        companyId,
        certificateDate: attendance.certificateDate ? attendance.certificateDate.toISOString().split('T')[0] : undefined,
      } as any)
      .returning();
    return newAttendance;
  }

  async updateProgramTrainingAttendance(id: string, attendance: Partial<schema.InsertProgramTrainingAttendance>, companyId: string): Promise<schema.ProgramTrainingAttendance | undefined> {
    const updateData: any = { ...attendance };
    if (attendance.certificateDate) {
      updateData.certificateDate = attendance.certificateDate.toISOString().split('T')[0];
    }
    
    const [updated] = await db.update(schema.programTrainingAttendance)
      .set(updateData)
      .where(and(
        eq(schema.programTrainingAttendance.id, id),
        eq(schema.programTrainingAttendance.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteProgramTrainingAttendance(id: string, companyId: string): Promise<void> {
    await db.delete(schema.programTrainingAttendance)
      .where(and(
        eq(schema.programTrainingAttendance.id, id),
        eq(schema.programTrainingAttendance.companyId, companyId)
      ));
  }

  async bulkCreateProgramTrainingAttendance(attendances: schema.InsertProgramTrainingAttendance[], companyId: string): Promise<schema.ProgramTrainingAttendance[]> {
    const values = attendances.map(attendance => ({
      ...attendance,
      companyId,
      certificateDate: attendance.certificateDate ? attendance.certificateDate.toISOString().split('T')[0] : undefined,
    })) as any[];
    
    const created = await db.insert(schema.programTrainingAttendance)
      .values(values)
      .returning();
    return created;
  }

  // Políticas SST methods implementation
  async getPoliticasSst(companyId: string): Promise<schema.PoliticaSst[]> {
    return await db.select().from(schema.politicasSst)
      .where(eq(schema.politicasSst.companyId, companyId))
      .orderBy(desc(schema.politicasSst.fechaEmision));
  }

  async getPoliticaSst(id: string, companyId: string): Promise<schema.PoliticaSst | undefined> {
    const [politica] = await db.select().from(schema.politicasSst)
      .where(and(
        eq(schema.politicasSst.id, id),
        eq(schema.politicasSst.companyId, companyId)
      ));
    return politica;
  }

  async getPoliticaSstVigente(companyId: string): Promise<schema.PoliticaSst | undefined> {
    const [politica] = await db.select().from(schema.politicasSst)
      .where(and(
        eq(schema.politicasSst.companyId, companyId),
        eq(schema.politicasSst.estado, 'vigente')
      ))
      .orderBy(desc(schema.politicasSst.fechaEmision))
      .limit(1);
    return politica;
  }

  async createPoliticaSst(politica: schema.InsertPoliticaSst, companyId: string): Promise<schema.PoliticaSst> {
    const [newPolitica] = await db.insert(schema.politicasSst)
      .values({
        ...politica,
        companyId,
        fechaEmision: politica.fechaEmision.toISOString().split('T')[0],
        fechaProximaRevision: politica.fechaProximaRevision.toISOString().split('T')[0],
        fechaFirma: politica.fechaFirma.toISOString().split('T')[0],
        fechaComunicacion: politica.fechaComunicacion ? politica.fechaComunicacion.toISOString().split('T')[0] : undefined,
      } as any)
      .returning();
    return newPolitica;
  }

  async updatePoliticaSst(id: string, politica: Partial<schema.InsertPoliticaSst>, companyId: string): Promise<schema.PoliticaSst | undefined> {
    const updateData: any = { ...politica };
    
    // Convert dates to ISO strings
    if (politica.fechaEmision) {
      updateData.fechaEmision = politica.fechaEmision.toISOString().split('T')[0];
    }
    if (politica.fechaProximaRevision) {
      updateData.fechaProximaRevision = politica.fechaProximaRevision.toISOString().split('T')[0];
    }
    if (politica.fechaFirma) {
      updateData.fechaFirma = politica.fechaFirma.toISOString().split('T')[0];
    }
    if (politica.fechaComunicacion) {
      updateData.fechaComunicacion = politica.fechaComunicacion.toISOString().split('T')[0];
    }
    
    // Always update updatedAt timestamp
    updateData.updatedAt = sql`now()`;
    
    const [updated] = await db.update(schema.politicasSst)
      .set(updateData)
      .where(and(
        eq(schema.politicasSst.id, id),
        eq(schema.politicasSst.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deletePoliticaSst(id: string, companyId: string): Promise<void> {
    await db.delete(schema.politicasSst)
      .where(and(
        eq(schema.politicasSst.id, id),
        eq(schema.politicasSst.companyId, companyId)
      ));
  }

  // ============================================================================
  // EVALUACIÓN INICIAL SST METHODS - Resolución 0312/2019
  // ============================================================================

  // Componentes SST - Catálogo de 7 componentes
  async getComponentesSst(): Promise<schema.ComponenteSst[]> {
    return await db.select().from(schema.componentesSst).orderBy(schema.componentesSst.orden);
  }

  async getComponenteSst(id: string): Promise<schema.ComponenteSst | undefined> {
    const [componente] = await db.select().from(schema.componentesSst)
      .where(eq(schema.componentesSst.id, id));
    return componente;
  }

  // Estándares SST - Catálogo de 60 estándares
  async getEstandaresSst(componenteId?: string): Promise<schema.EstandarSst[]> {
    if (componenteId) {
      return await db.select().from(schema.estandaresSst)
        .where(and(
          eq(schema.estandaresSst.componenteId, componenteId),
          eq(schema.estandaresSst.activo, 1)
        ))
        .orderBy(schema.estandaresSst.orden);
    }
    return await db.select().from(schema.estandaresSst)
      .where(eq(schema.estandaresSst.activo, 1))
      .orderBy(schema.estandaresSst.orden);
  }

  async getEstandarSst(id: string): Promise<schema.EstandarSst | undefined> {
    const [estandar] = await db.select().from(schema.estandaresSst)
      .where(eq(schema.estandaresSst.id, id));
    return estandar;
  }

  async getEstandaresByTipoEmpresa(tipoEmpresa: string): Promise<schema.EstandarSst[]> {
    // Filtrar estándares que aplican al tipo de empresa
    const puntajeColumn = `puntaje${tipoEmpresa.charAt(0).toUpperCase() + tipoEmpresa.slice(1)}` as 'puntajeTipo1' | 'puntajeTipo2' | 'puntajeTipo3' | 'puntajeTipo4';
    
    const estandares = await db.select().from(schema.estandaresSst)
      .where(eq(schema.estandaresSst.activo, 1))
      .orderBy(schema.estandaresSst.orden);
    
    // Filtrar donde el puntaje no es NULL para el tipo de empresa
    return estandares.filter(e => e[puntajeColumn] !== null);
  }

  // Evaluaciones SST - CRUD completo
  async getEvaluacionesSst(companyId: string): Promise<schema.EvaluacionSst[]> {
    return await db.select().from(schema.evaluacionesSst)
      .where(eq(schema.evaluacionesSst.companyId, companyId))
      .orderBy(desc(schema.evaluacionesSst.anio), desc(schema.evaluacionesSst.mes));
  }

  async getAllEvaluacionesSst(): Promise<schema.EvaluacionSst[]> {
    // For admin: get all evaluaciones from all companies
    return await db.select().from(schema.evaluacionesSst)
      .orderBy(desc(schema.evaluacionesSst.anio), desc(schema.evaluacionesSst.mes));
  }

  async getEvaluacionSst(id: string, companyId: string): Promise<schema.EvaluacionSst | undefined> {
    const [evaluacion] = await db.select().from(schema.evaluacionesSst)
      .where(and(
        eq(schema.evaluacionesSst.id, id),
        eq(schema.evaluacionesSst.companyId, companyId)
      ));
    return evaluacion;
  }

  async getEvaluacionSstById(id: string): Promise<schema.EvaluacionSst | undefined> {
    // For admin: get by id without company filter
    const [evaluacion] = await db.select().from(schema.evaluacionesSst)
      .where(eq(schema.evaluacionesSst.id, id));
    return evaluacion;
  }

  async getEvaluacionSstByYear(anio: number, companyId: string): Promise<schema.EvaluacionSst | undefined> {
    const [evaluacion] = await db.select().from(schema.evaluacionesSst)
      .where(and(
        eq(schema.evaluacionesSst.anio, anio),
        eq(schema.evaluacionesSst.companyId, companyId)
      ))
      .orderBy(desc(schema.evaluacionesSst.mes))
      .limit(1);
    return evaluacion;
  }

  async createEvaluacionSst(evaluacion: schema.InsertEvaluacionSst, companyId: string): Promise<schema.EvaluacionSst> {
    // Calcular puntaje máximo basado en estándares del tipo de empresa
    const estandares = await this.getEstandaresByTipoEmpresa(evaluacion.tipoEmpresa);
    
    // Obtener el campo de puntaje correcto según el tipo de empresa
    const puntajeMaximo = estandares.reduce((sum, estandar) => {
      let puntaje = 0;
      switch (evaluacion.tipoEmpresa) {
        case 'tipo1':
          puntaje = estandar.puntajeTipo1 || 0;
          break;
        case 'tipo2':
          puntaje = estandar.puntajeTipo2 || 0;
          break;
        case 'tipo3':
          puntaje = estandar.puntajeTipo3 || 0;
          break;
        case 'tipo4':
          puntaje = estandar.puntajeTipo4 || 0;
          break;
      }
      return sum + puntaje;
    }, 0);
    
    const [newEvaluacion] = await db.insert(schema.evaluacionesSst)
      .values({
        ...evaluacion,
        companyId,
        puntajeMaximo, // Agregar puntaje máximo calculado
        fechaEvaluacion: evaluacion.fechaEvaluacion.toISOString().split('T')[0],
        fechaEnvio: evaluacion.fechaEnvio ? evaluacion.fechaEnvio.toISOString().split('T')[0] : undefined,
        fechaLimitePlanMejora: evaluacion.fechaLimitePlanMejora ? evaluacion.fechaLimitePlanMejora.toISOString().split('T')[0] : undefined,
      } as any)
      .returning();
    return newEvaluacion;
  }

  async updateEvaluacionSst(id: string, evaluacion: Partial<schema.InsertEvaluacionSst>, companyId: string): Promise<schema.EvaluacionSst | undefined> {
    const updateData: any = { ...evaluacion };
    
    if (evaluacion.fechaEvaluacion) {
      updateData.fechaEvaluacion = evaluacion.fechaEvaluacion.toISOString().split('T')[0];
    }
    if (evaluacion.fechaEnvio) {
      updateData.fechaEnvio = evaluacion.fechaEnvio.toISOString().split('T')[0];
    }
    if (evaluacion.fechaLimitePlanMejora) {
      updateData.fechaLimitePlanMejora = evaluacion.fechaLimitePlanMejora.toISOString().split('T')[0];
    }
    
    updateData.updatedAt = sql`now()`;
    
    const [updated] = await db.update(schema.evaluacionesSst)
      .set(updateData)
      .where(and(
        eq(schema.evaluacionesSst.id, id),
        eq(schema.evaluacionesSst.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteEvaluacionSst(id: string, companyId: string): Promise<void> {
    await db.delete(schema.evaluacionesSst)
      .where(and(
        eq(schema.evaluacionesSst.id, id),
        eq(schema.evaluacionesSst.companyId, companyId)
      ));
  }

  async calcularPuntajesEvaluacion(evaluacionId: string, companyId: string): Promise<void> {
    // Obtener la evaluación
    const evaluacion = await this.getEvaluacionSst(evaluacionId, companyId);
    if (!evaluacion) return;

    // Obtener TODOS los estándares aplicables según el tipo de empresa
    const estandaresAplicables = await this.getEstandaresByTipoEmpresa(evaluacion.tipoEmpresa);
    
    // Calcular puntaje máximo de TODOS los estándares aplicables
    let puntajeMaximoTotal = 0;
    for (const estandar of estandaresAplicables) {
      let puntaje = 0;
      switch (evaluacion.tipoEmpresa) {
        case 'tipo1':
          puntaje = estandar.puntajeTipo1 || 0;
          break;
        case 'tipo2':
          puntaje = estandar.puntajeTipo2 || 0;
          break;
        case 'tipo3':
          puntaje = estandar.puntajeTipo3 || 0;
          break;
        case 'tipo4':
          puntaje = estandar.puntajeTipo4 || 0;
          break;
      }
      puntajeMaximoTotal += puntaje;
    }

    // Obtener todas las respuestas existentes
    const respuestas = await this.getRespuestasEstandares(evaluacionId, companyId);
    
    // Crear mapa de respuestas por estándar ID
    const respuestasPorEstandar = new Map<string, typeof respuestas[0]>();
    for (const respuesta of respuestas) {
      respuestasPorEstandar.set(respuesta.estandarId, respuesta);
    }
    
    // Calcular puntaje total (solo de respuestas existentes, estándares sin respuesta = 0)
    let puntajeTotal = 0;
    const puntajesPorComponente: Record<string, { obtenido: number; maximo: number }> = {};
    const puntajesPorCicloPhva: Record<string, { obtenido: number; maximo: number }> = {
      planear: { obtenido: 0, maximo: 0 },
      hacer: { obtenido: 0, maximo: 0 },
      verificar: { obtenido: 0, maximo: 0 },
      actuar: { obtenido: 0, maximo: 0 },
    };

    // Obtener componentes para agrupar
    const componentes = await this.getComponentesSst();
    
    // Iterar sobre TODOS los estándares aplicables
    for (const estandar of estandaresAplicables) {
      let puntajeMaxEstandar = 0;
      switch (evaluacion.tipoEmpresa) {
        case 'tipo1':
          puntajeMaxEstandar = estandar.puntajeTipo1 || 0;
          break;
        case 'tipo2':
          puntajeMaxEstandar = estandar.puntajeTipo2 || 0;
          break;
        case 'tipo3':
          puntajeMaxEstandar = estandar.puntajeTipo3 || 0;
          break;
        case 'tipo4':
          puntajeMaxEstandar = estandar.puntajeTipo4 || 0;
          break;
      }
      
      // Obtener puntaje obtenido (0 si no hay respuesta)
      const respuesta = respuestasPorEstandar.get(estandar.id);
      const puntajeObtenido = respuesta ? respuesta.puntajeObtenido : 0;
      puntajeTotal += puntajeObtenido;
      
      // Agrupar por componente
      const componente = componentes.find(c => c.id === estandar.componenteId);
      if (componente) {
        const key = componente.numero.toString();
        if (!puntajesPorComponente[key]) {
          puntajesPorComponente[key] = { obtenido: 0, maximo: 0 };
        }
        puntajesPorComponente[key].obtenido += puntajeObtenido;
        puntajesPorComponente[key].maximo += puntajeMaxEstandar;
        
        // Agrupar por ciclo PHVA
        const ciclo = componente.cicloPhva;
        if (ciclo && puntajesPorCicloPhva[ciclo]) {
          puntajesPorCicloPhva[ciclo].obtenido += puntajeObtenido;
          puntajesPorCicloPhva[ciclo].maximo += puntajeMaxEstandar;
        }
      }
    }

    // Calcular porcentaje basado en el puntaje máximo TOTAL aplicable
    const puntajeMaximo = puntajeMaximoTotal;
    const porcentajeCumplimiento = puntajeMaximo > 0 ? Math.round((puntajeTotal / puntajeMaximo) * 100) : 0;
    
    // Determinar nivel de cumplimiento
    let nivelCumplimiento: 'critico' | 'moderadamente-aceptable' | 'aceptable';
    if (porcentajeCumplimiento < 60) {
      nivelCumplimiento = 'critico';
    } else if (porcentajeCumplimiento < 85) {
      nivelCumplimiento = 'moderadamente-aceptable';
    } else {
      nivelCumplimiento = 'aceptable';
    }

    // Verificar si todos los estándares aplicables tienen respuesta para activación automática
    const totalEstandaresAplicables = estandaresAplicables.length;
    const totalRespuestasRegistradas = respuestas.length;
    const todosEstandaresRespondidos = totalRespuestasRegistradas >= totalEstandaresAplicables;
    
    // Determinar si debe activarse automáticamente
    // Si todos los estándares tienen respuesta Y estado es "en-progreso", cambiar a "completada"
    let nuevoEstado = evaluacion.estado;
    if (todosEstandaresRespondidos && evaluacion.estado === 'en-progreso') {
      nuevoEstado = 'completada';
      console.log(`[Evaluación ${evaluacionId}] ✅ Activación automática: Todos los ${totalEstandaresAplicables} estándares respondidos. Estado: en-progreso → completada`);
    }

    // Actualizar evaluación
    await this.updateEvaluacionSst(evaluacionId, {
      puntajeTotal,
      puntajeMaximo,
      porcentajeCumplimiento,
      nivelCumplimiento,
      puntajesPorComponente: JSON.stringify(puntajesPorComponente),
      puntajesPorCicloPhva: JSON.stringify(puntajesPorCicloPhva),
      ...(nuevoEstado !== evaluacion.estado ? { estado: nuevoEstado } : {}),
    } as any, companyId);
  }

  // Respuestas Estándares - CRUD completo
  async getRespuestasEstandares(evaluacionId: string, companyId: string): Promise<schema.RespuestaEstandar[]> {
    // Verificar que la evaluación pertenece a la empresa
    const evaluacion = await this.getEvaluacionSst(evaluacionId, companyId);
    if (!evaluacion) return [];
    
    return await db.select().from(schema.respuestasEstandares)
      .where(eq(schema.respuestasEstandares.evaluacionId, evaluacionId));
  }

  async getRespuestaEstandar(id: string, companyId: string): Promise<schema.RespuestaEstandar | undefined> {
    const [respuesta] = await db.select().from(schema.respuestasEstandares)
      .where(eq(schema.respuestasEstandares.id, id));
    
    // Verificar que pertenece a la empresa
    if (respuesta) {
      const evaluacion = await this.getEvaluacionSst(respuesta.evaluacionId, companyId);
      if (!evaluacion) return undefined;
    }
    
    return respuesta;
  }

  async createRespuestaEstandar(respuesta: schema.InsertRespuestaEstandar, companyId: string): Promise<schema.RespuestaEstandar> {
    // Verificar que la evaluación pertenece a la empresa
    const evaluacion = await this.getEvaluacionSst(respuesta.evaluacionId, companyId);
    if (!evaluacion) throw new Error('Evaluación no encontrada');
    
    const [newRespuesta] = await db.insert(schema.respuestasEstandares)
      .values(respuesta)
      .returning();
    
    // Recalcular puntajes de la evaluación
    await this.calcularPuntajesEvaluacion(respuesta.evaluacionId, companyId);
    
    return newRespuesta;
  }

  async updateRespuestaEstandar(id: string, respuesta: Partial<schema.InsertRespuestaEstandar>, companyId: string): Promise<schema.RespuestaEstandar | undefined> {
    // Verificar que la respuesta existe y pertenece a la empresa
    const existing = await this.getRespuestaEstandar(id, companyId);
    if (!existing) return undefined;
    
    const updateData: any = { ...respuesta, updatedAt: sql`now()` };
    
    const [updated] = await db.update(schema.respuestasEstandares)
      .set(updateData)
      .where(eq(schema.respuestasEstandares.id, id))
      .returning();
    
    // Recalcular puntajes
    if (updated) {
      await this.calcularPuntajesEvaluacion(updated.evaluacionId, companyId);
    }
    
    return updated;
  }

  async deleteRespuestaEstandar(id: string, companyId: string): Promise<void> {
    const respuesta = await this.getRespuestaEstandar(id, companyId);
    if (!respuesta) return;
    
    const evaluacionId = respuesta.evaluacionId;
    
    await db.delete(schema.respuestasEstandares)
      .where(eq(schema.respuestasEstandares.id, id));
    
    // Recalcular puntajes
    await this.calcularPuntajesEvaluacion(evaluacionId, companyId);
  }

  // Acciones Mejora - CRUD completo
  async getAccionesMejora(evaluacionId: string, companyId: string): Promise<schema.AccionMejora[]> {
    // Verificar que la evaluación pertenece a la empresa
    const evaluacion = await this.getEvaluacionSst(evaluacionId, companyId);
    if (!evaluacion) return [];
    
    return await db.select().from(schema.accionesMejora)
      .where(eq(schema.accionesMejora.evaluacionId, evaluacionId))
      .orderBy(desc(schema.accionesMejora.prioridad), schema.accionesMejora.fechaCompromiso);
  }

  async getAllAccionesMejora(companyId: string): Promise<schema.AccionMejora[]> {
    // Obtener todas las evaluaciones de la empresa
    const evaluaciones = await this.getEvaluacionesSst(companyId);
    if (evaluaciones.length === 0) return [];
    
    const evaluacionIds = evaluaciones.map(e => e.id);
    
    return await db.select().from(schema.accionesMejora)
      .where(inArray(schema.accionesMejora.evaluacionId, evaluacionIds))
      .orderBy(desc(schema.accionesMejora.prioridad), schema.accionesMejora.fechaCompromiso);
  }

  async getAccionMejora(id: string, companyId: string): Promise<schema.AccionMejora | undefined> {
    const [accion] = await db.select().from(schema.accionesMejora)
      .where(eq(schema.accionesMejora.id, id));
    
    // Verificar que pertenece a la empresa
    if (accion) {
      const evaluacion = await this.getEvaluacionSst(accion.evaluacionId, companyId);
      if (!evaluacion) return undefined;
    }
    
    return accion;
  }

  async createAccionMejora(accion: schema.InsertAccionMejora, companyId: string): Promise<schema.AccionMejora> {
    // Verificar que la evaluación pertenece a la empresa
    const evaluacion = await this.getEvaluacionSst(accion.evaluacionId, companyId);
    if (!evaluacion) throw new Error('Evaluación no encontrada');
    
    const [newAccion] = await db.insert(schema.accionesMejora)
      .values({
        ...accion,
        fechaInicio: accion.fechaInicio.toISOString().split('T')[0],
        fechaCompromiso: accion.fechaCompromiso.toISOString().split('T')[0],
        fechaEjecucion: accion.fechaEjecucion ? accion.fechaEjecucion.toISOString().split('T')[0] : undefined,
      } as any)
      .returning();
    return newAccion;
  }

  async updateAccionMejora(id: string, accion: Partial<schema.InsertAccionMejora>, companyId: string): Promise<schema.AccionMejora | undefined> {
    // Verificar que la acción existe y pertenece a la empresa
    const existing = await this.getAccionMejora(id, companyId);
    if (!existing) return undefined;
    
    const updateData: any = { ...accion };
    
    if (accion.fechaInicio) {
      updateData.fechaInicio = accion.fechaInicio.toISOString().split('T')[0];
    }
    if (accion.fechaCompromiso) {
      updateData.fechaCompromiso = accion.fechaCompromiso.toISOString().split('T')[0];
    }
    if (accion.fechaEjecucion) {
      updateData.fechaEjecucion = accion.fechaEjecucion.toISOString().split('T')[0];
    }
    
    // Sincronizar estado y porcentajeAvance automáticamente
    // Si el estado cambia a "completada", avance = 100%
    if (updateData.estado === 'completada' && !updateData.porcentajeAvance) {
      updateData.porcentajeAvance = 100;
      // Si no tiene fecha de ejecución, ponerla como hoy
      if (!updateData.fechaEjecucion && !existing.fechaEjecucion) {
        updateData.fechaEjecucion = new Date().toISOString().split('T')[0];
      }
    }
    // Si el avance llega a 100%, cambiar estado a "completada"
    if (updateData.porcentajeAvance === 100 && !updateData.estado) {
      updateData.estado = 'completada';
      if (!updateData.fechaEjecucion && !existing.fechaEjecucion) {
        updateData.fechaEjecucion = new Date().toISOString().split('T')[0];
      }
    }
    // Si el estado cambia a "en-proceso" y avance es 0, ponerlo en 10%
    if (updateData.estado === 'en-proceso' && existing.porcentajeAvance === 0 && !updateData.porcentajeAvance) {
      updateData.porcentajeAvance = 10;
    }
    // Si el estado cambia a "pendiente", avance = 0%
    if (updateData.estado === 'pendiente' && !updateData.porcentajeAvance) {
      updateData.porcentajeAvance = 0;
    }
    
    updateData.updatedAt = sql`now()`;
    
    const [updated] = await db.update(schema.accionesMejora)
      .set(updateData)
      .where(eq(schema.accionesMejora.id, id))
      .returning();
    return updated;
  }

  async deleteAccionMejora(id: string, companyId: string): Promise<void> {
    const accion = await this.getAccionMejora(id, companyId);
    if (!accion) return;
    
    await db.delete(schema.accionesMejora)
      .where(eq(schema.accionesMejora.id, id));
  }

  async generarPlanMejoraAutomatico(evaluacionId: string, companyId: string): Promise<schema.AccionMejora[]> {
    // Obtener evaluación
    const evaluacion = await this.getEvaluacionSst(evaluacionId, companyId);
    if (!evaluacion) return [];
    
    // Obtener respuestas que no cumplen
    const respuestas = await this.getRespuestasEstandares(evaluacionId, companyId);
    const respuestasNoCumplen = respuestas.filter(r => r.cumple === 0 && r.noAplica === 0);
    
    // Obtener acciones existentes para evitar duplicados
    const accionesExistentes = await this.getAccionesMejora(evaluacionId, companyId);
    const respuestasConAccion = new Set(
      accionesExistentes
        .filter(a => a.respuestaEstandarId)
        .map(a => a.respuestaEstandarId)
    );
    
    const accionesCreadas: schema.AccionMejora[] = [];
    
    for (const respuesta of respuestasNoCumplen) {
      // Verificar si ya existe una acción para este estándar (evitar duplicados)
      if (respuestasConAccion.has(respuesta.id)) {
        continue; // Saltar, ya existe una acción para este estándar
      }
      
      const estandar = await this.getEstandarSst(respuesta.estandarId);
      if (!estandar) continue;
      
      // Determinar prioridad basada en el componente
      let prioridad: 'baja' | 'media' | 'alta' | 'critica' = 'media';
      const componente = await db.select().from(schema.componentesSst)
        .where(eq(schema.componentesSst.id, estandar.componenteId))
        .limit(1);
      
      if (componente[0]) {
        // Componentes críticos: Gestión de Peligros (30%), Gestión de Salud (20%)
        if (componente[0].pesoTotal >= 20) {
          prioridad = 'alta';
        }
      }
      
      // Si el nivel de cumplimiento general es crítico, aumentar prioridad
      if (evaluacion.nivelCumplimiento === 'critico') {
        prioridad = prioridad === 'alta' ? 'critica' : 'alta';
      }
      
      // Fecha de compromiso: 6 meses para nivel crítico o moderado
      const fechaCompromiso = new Date();
      if (evaluacion.nivelCumplimiento === 'critico') {
        fechaCompromiso.setMonth(fechaCompromiso.getMonth() + 3);
      } else {
        fechaCompromiso.setMonth(fechaCompromiso.getMonth() + 6);
      }
      
      const accion: schema.InsertAccionMejora = {
        evaluacionId,
        respuestaEstandarId: respuesta.id,
        descripcionAccion: `Implementar: ${estandar.nombre}`,
        objetivo: `Dar cumplimiento al estándar ${estandar.numeroEstandar}: ${estandar.nombre}`,
        tipoAccion: 'correctiva',
        prioridad,
        responsable: evaluacion.responsableNombre,
        areaResponsable: 'SST',
        recursosNecesarios: 'Por definir según análisis técnico',
        fechaInicio: new Date(),
        fechaCompromiso,
        estado: 'pendiente',
        porcentajeAvance: 0,
        indicadorEficacia: 'Cumplimiento del estándar verificado en próxima evaluación',
        resultadoEsperado: `Estándar ${estandar.numeroEstandar} implementado y documentado`,
      };
      
      const nuevaAccion = await this.createAccionMejora(accion, companyId);
      accionesCreadas.push(nuevaAccion);
    }
    
    return accionesCreadas;
  }

  // ============================================================================
  // PLAN ANUAL DE TRABAJO METHODS
  // ============================================================================

  async getAllPlanesTrabajoAnual(): Promise<schema.PlanTrabajoAnual[]> {
    return await db.select()
      .from(schema.planesTrabajoAnual)
      .orderBy(desc(schema.planesTrabajoAnual.anio), desc(schema.planesTrabajoAnual.createdAt));
  }

  async getPlanesTrabajoAnual(companyId: string): Promise<schema.PlanTrabajoAnual[]> {
    return await db.select()
      .from(schema.planesTrabajoAnual)
      .where(eq(schema.planesTrabajoAnual.companyId, companyId))
      .orderBy(desc(schema.planesTrabajoAnual.anio), desc(schema.planesTrabajoAnual.createdAt));
  }

  async getPlanTrabajoAnualById(id: string): Promise<schema.PlanTrabajoAnual | undefined> {
    const [plan] = await db.select()
      .from(schema.planesTrabajoAnual)
      .where(eq(schema.planesTrabajoAnual.id, id));
    return plan;
  }

  async getPlanTrabajoAnual(id: string, companyId: string): Promise<schema.PlanTrabajoAnual | undefined> {
    const [plan] = await db.select()
      .from(schema.planesTrabajoAnual)
      .where(and(
        eq(schema.planesTrabajoAnual.id, id),
        eq(schema.planesTrabajoAnual.companyId, companyId)
      ));
    return plan;
  }

  async getPlanTrabajoByYear(anio: number, companyId: string): Promise<schema.PlanTrabajoAnual | undefined> {
    const [plan] = await db.select()
      .from(schema.planesTrabajoAnual)
      .where(and(
        eq(schema.planesTrabajoAnual.anio, anio),
        eq(schema.planesTrabajoAnual.companyId, companyId)
      ))
      .limit(1);
    return plan;
  }

  async createPlanTrabajoAnual(plan: schema.InsertPlanTrabajoAnual, companyId: string): Promise<schema.PlanTrabajoAnual> {
    const [newPlan] = await db.insert(schema.planesTrabajoAnual)
      .values({ ...plan, companyId } as any)
      .returning();
    return newPlan;
  }

  async updatePlanTrabajoAnual(id: string, plan: Partial<schema.InsertPlanTrabajoAnual>, companyId: string): Promise<schema.PlanTrabajoAnual | undefined> {
    const existing = await this.getPlanTrabajoAnual(id, companyId);
    if (!existing) return undefined;

    const updateData: any = { ...plan };
    updateData.updatedAt = sql`now()`;

    const [updated] = await db.update(schema.planesTrabajoAnual)
      .set(updateData)
      .where(eq(schema.planesTrabajoAnual.id, id))
      .returning();
    return updated;
  }

  async deletePlanTrabajoAnual(id: string, companyId: string): Promise<void> {
    const plan = await this.getPlanTrabajoAnual(id, companyId);
    if (!plan) return;

    await db.delete(schema.planesTrabajoAnual)
      .where(eq(schema.planesTrabajoAnual.id, id));
  }

  async actualizarMetricasPlan(planId: string, companyId: string): Promise<void> {
    const plan = await this.getPlanTrabajoAnual(planId, companyId);
    if (!plan) return;

    // Obtener todas las actividades del plan
    const actividades = await this.getActividadesPlanTrabajo(planId, companyId);

    const totalActividades = actividades.length;
    const actividadesCompletadas = actividades.filter(a => a.estado === 'completada').length;
    const porcentajeCumplimiento = totalActividades > 0 
      ? Math.round((actividadesCompletadas / totalActividades) * 100) 
      : 0;

    // Calcular presupuesto ejecutado
    const presupuestoEjecutado = actividades
      .filter(a => a.estado === 'completada' && a.recursosFinancieros)
      .reduce((sum, a) => sum + (a.recursosFinancieros || 0), 0);

    await db.update(schema.planesTrabajoAnual)
      .set({
        totalActividades,
        actividadesCompletadas,
        porcentajeCumplimiento,
        presupuestoEjecutado,
        updatedAt: sql`now()`,
      })
      .where(eq(schema.planesTrabajoAnual.id, planId));
  }

  // ============================================================================
  // ACTIVIDADES PLAN TRABAJO METHODS
  // ============================================================================

  async getActividadesPlanTrabajo(planId: string, companyId: string): Promise<schema.ActividadPlanTrabajo[]> {
    // Verificar que el plan pertenece a la empresa
    const plan = await this.getPlanTrabajoAnual(planId, companyId);
    if (!plan) return [];

    return await db.select()
      .from(schema.actividadesPlanTrabajo)
      .where(eq(schema.actividadesPlanTrabajo.planTrabajoId, planId))
      .orderBy(schema.actividadesPlanTrabajo.trimestre, schema.actividadesPlanTrabajo.mes);
  }

  async getActividadPlanTrabajo(id: string, companyId: string): Promise<schema.ActividadPlanTrabajo | undefined> {
    const [actividad] = await db.select()
      .from(schema.actividadesPlanTrabajo)
      .where(eq(schema.actividadesPlanTrabajo.id, id))
      .limit(1);

    if (!actividad) return undefined;

    // Verificar que pertenece a un plan de la empresa
    const plan = await this.getPlanTrabajoAnual(actividad.planTrabajoId, companyId);
    if (!plan) return undefined;

    return actividad;
  }

  async createActividadPlanTrabajo(actividad: schema.InsertActividadPlanTrabajo, companyId: string): Promise<schema.ActividadPlanTrabajo> {
    // Verificar que el plan pertenece a la empresa
    const plan = await this.getPlanTrabajoAnual(actividad.planTrabajoId, companyId);
    if (!plan) throw new Error('Plan de trabajo no encontrado');

    const [newActividad] = await db.insert(schema.actividadesPlanTrabajo)
      .values(actividad as any)
      .returning();

    // Actualizar métricas del plan
    await this.actualizarMetricasPlan(actividad.planTrabajoId, companyId);

    return newActividad;
  }

  async updateActividadPlanTrabajo(id: string, actividad: Partial<schema.InsertActividadPlanTrabajo>, companyId: string): Promise<schema.ActividadPlanTrabajo | undefined> {
    const existing = await this.getActividadPlanTrabajo(id, companyId);
    if (!existing) return undefined;

    const updateData: any = { ...actividad };
    updateData.updatedAt = sql`now()`;

    const [updated] = await db.update(schema.actividadesPlanTrabajo)
      .set(updateData)
      .where(eq(schema.actividadesPlanTrabajo.id, id))
      .returning();

    // Actualizar métricas del plan
    await this.actualizarMetricasPlan(existing.planTrabajoId, companyId);

    return updated;
  }

  async deleteActividadPlanTrabajo(id: string, companyId: string): Promise<void> {
    const actividad = await this.getActividadPlanTrabajo(id, companyId);
    if (!actividad) return;

    await db.delete(schema.actividadesPlanTrabajo)
      .where(eq(schema.actividadesPlanTrabajo.id, id));

    // Actualizar métricas del plan
    await this.actualizarMetricasPlan(actividad.planTrabajoId, companyId);
  }

  // Matriz Legal methods (company-scoped)
  async getMatrizLegal(companyId: string): Promise<schema.MatrizLegal[]> {
    return await db.select()
      .from(schema.matrizLegal)
      .where(eq(schema.matrizLegal.companyId, companyId))
      .orderBy(schema.matrizLegal.categoria, schema.matrizLegal.norma);
  }

  async getMatrizLegalItem(id: string, companyId: string): Promise<schema.MatrizLegal | undefined> {
    const [item] = await db.select()
      .from(schema.matrizLegal)
      .where(and(
        eq(schema.matrizLegal.id, id),
        eq(schema.matrizLegal.companyId, companyId)
      ));
    return item;
  }

  async createMatrizLegalItem(item: schema.InsertMatrizLegal, companyId: string): Promise<schema.MatrizLegal> {
    const [newItem] = await db.insert(schema.matrizLegal)
      .values({ ...item, companyId } as any)
      .returning();
    return newItem;
  }

  async updateMatrizLegalItem(id: string, item: Partial<schema.InsertMatrizLegal>, companyId: string): Promise<schema.MatrizLegal | undefined> {
    const existing = await this.getMatrizLegalItem(id, companyId);
    if (!existing) return undefined;

    const updateData: any = { ...item };
    updateData.updatedAt = sql`now()`;

    const [updated] = await db.update(schema.matrizLegal)
      .set(updateData)
      .where(eq(schema.matrizLegal.id, id))
      .returning();
    return updated;
  }

  async deleteMatrizLegalItem(id: string, companyId: string): Promise<void> {
    await db.delete(schema.matrizLegal)
      .where(and(
        eq(schema.matrizLegal.id, id),
        eq(schema.matrizLegal.companyId, companyId)
      ));
  }

  async initializeMatrizLegal(companyId: string): Promise<void> {
    // Verificar si ya existen datos
    const existing = await this.getMatrizLegal(companyId);
    if (existing.length > 0) return;

    // Normas colombianas de SST actualizadas al 2025
    const normasBase: Partial<schema.InsertMatrizLegal>[] = [
      // Sistema de Gestión
      {
        norma: "Resolución 0312 de 2019",
        fechaEmision: new Date("2019-02-13"),
        entidadEmisora: "Ministerio del Trabajo",
        categoria: "sistema-gestion",
        titulo: "Estándares Mínimos del Sistema de Gestión SST",
        descripcion: "Define los estándares mínimos del SG-SST para empleadores y contratantes",
        obligaciones: "Implementar y mantener el SG-SST según los estándares mínimos establecidos",
        alcance: "Empresas de todos los sectores económicos",
        periodicidad: "Evaluación anual",
        responsableCumplimiento: "Coordinador SST / Gerencia",
        validacionAutomatica: 1,
        codigoValidacion: "PLAN_ANUAL_TRABAJO"
      },
      {
        norma: "Decreto 1072 de 2015",
        fechaEmision: new Date("2015-05-26"),
        entidadEmisora: "Ministerio del Trabajo",
        categoria: "sistema-gestion",
        titulo: "Decreto Único Reglamentario del Sector Trabajo",
        descripcion: "Compilación de la normatividad del sector trabajo, incluye Libro 2 Parte 2 Título 4 Capítulo 6 sobre SG-SST",
        obligaciones: "Cumplir con todo el marco normativo del sector trabajo y SST",
        alcance: "Todos los empleadores públicos y privados",
        periodicidad: "Permanente",
        responsableCumplimiento: "Gerencia / Coordinador SST",
        validacionAutomatica: 1,
        codigoValidacion: "POLITICA_SST"
      },
      {
        norma: "ISO 45001:2018",
        fechaEmision: new Date("2018-03-12"),
        entidadEmisora: "ISO - Organización Internacional de Normalización",
        categoria: "sistema-gestion",
        titulo: "Sistema de Gestión de la Seguridad y Salud en el Trabajo",
        descripcion: "Estándar internacional para SG-SST, reemplaza OHSAS 18001",
        obligaciones: "Voluntaria - Certificación internacional",
        alcance: "Organizaciones que buscan certificación internacional",
        periodicidad: "Auditorías anuales y recertificación cada 3 años",
        responsableCumplimiento: "Alta Dirección / Coordinador SST"
      },
      // Medicina del Trabajo
      {
        norma: "Resolución 2346 de 2007",
        fechaEmision: new Date("2007-07-11"),
        entidadEmisora: "Ministerio de la Protección Social",
        categoria: "medicina-trabajo",
        titulo: "Práctica de Evaluaciones Médicas Ocupacionales",
        descripcion: "Regula la práctica de evaluaciones médicas ocupacionales y manejo de historias clínicas",
        obligaciones: "Realizar exámenes médicos de ingreso, periódicos, retiro y post-incapacidad",
        alcance: "Todos los empleadores",
        periodicidad: "Según tipo de examen: ingreso, periódico (anual), retiro",
        responsableCumplimiento: "Coordinador SST / RRHH"
      },
      {
        norma: "Resolución 1918 de 2009",
        fechaEmision: new Date("2009-06-05"),
        entidadEmisora: "Ministerio de la Protección Social",
        categoria: "medicina-trabajo",
        titulo: "Calificación de Origen de la Enfermedad y el Grado de Pérdida de la Capacidad Laboral",
        descripcion: "Modificación del Manual Único de Calificación de Invalidez",
        obligaciones: "Aplicar protocolos de calificación según normatividad",
        alcance: "Entidades evaluadoras y empresas",
        periodicidad: "Según necesidad",
        responsableCumplimiento: "Medicina del Trabajo"
      },
      // Higiene Industrial
      {
        norma: "Resolución 2400 de 1979",
        fechaEmision: new Date("1979-05-22"),
        entidadEmisora: "Ministerio del Trabajo",
        categoria: "higiene-industrial",
        titulo: "Estatuto de Seguridad Industrial",
        descripcion: "Disposiciones sobre vivienda, higiene y seguridad en los establecimientos de trabajo",
        obligaciones: "Cumplir con condiciones de seguridad e higiene en los lugares de trabajo",
        alcance: "Todos los establecimientos de trabajo",
        periodicidad: "Permanente",
        responsableCumplimiento: "Coordinador SST / Mantenimiento"
      },
      {
        norma: "Resolución 2413 de 1979",
        fechaEmision: new Date("1979-05-22"),
        entidadEmisora: "Ministerio del Trabajo",
        categoria: "higiene-industrial",
        titulo: "Reglamento de Higiene y Seguridad para la Industria de la Construcción",
        descripcion: "Normas de higiene y seguridad específicas para construcción",
        obligaciones: "Aplicar medidas de seguridad en construcción",
        alcance: "Empresas del sector construcción",
        periodicidad: "Permanente durante obras",
        responsableCumplimiento: "Coordinador SST / Residente de Obra"
      },
      // Seguridad Vial
      {
        norma: "Resolución 1565 de 2014",
        fechaEmision: new Date("2014-06-06"),
        entidadEmisora: "Ministerio del Trabajo",
        categoria: "seguridad-vial",
        titulo: "Guía Metodológica para la Elaboración del Plan Estratégico de Seguridad Vial",
        descripcion: "Guía para implementar el PESV en empresas",
        obligaciones: "Diseñar e implementar el Plan Estratégico de Seguridad Vial (PESV)",
        alcance: "Empresas con flotillas de vehículos",
        periodicidad: "Actualización anual",
        responsableCumplimiento: "Líder PESV / Coordinador SST"
      },
      {
        norma: "Ley 1503 de 2011",
        fechaEmision: new Date("2011-12-29"),
        entidadEmisora: "Congreso de la República",
        categoria: "seguridad-vial",
        titulo: "Promoción de la Formación de Hábitos, Comportamientos y Conductas Seguros en la Vía",
        descripcion: "Política nacional de seguridad vial",
        obligaciones: "Promover formación en seguridad vial para conductores",
        alcance: "Empresas con vehículos y conductores",
        periodicidad: "Capacitaciones anuales",
        responsableCumplimiento: "Líder PESV / RRHH"
      },
      // Riesgo Psicosocial
      {
        norma: "Resolución 2646 de 2008",
        fechaEmision: new Date("2008-07-17"),
        entidadEmisora: "Ministerio de la Protección Social",
        categoria: "riesgo-psicosocial",
        titulo: "Factores de Riesgo Psicosocial en el Trabajo",
        descripcion: "Define factores de riesgo psicosocial y establece responsabilidades",
        obligaciones: "Identificar, evaluar e intervenir los factores de riesgo psicosocial",
        alcance: "Todos los empleadores",
        periodicidad: "Evaluación cada 2 años",
        responsableCumplimiento: "Coordinador SST / Psicología Organizacional"
      },
      {
        norma: "Resolución 652 de 2012",
        fechaEmision: new Date("2012-04-30"),
        entidadEmisora: "Ministerio del Trabajo",
        categoria: "riesgo-psicosocial",
        titulo: "Conformación del Comité de Convivencia Laboral",
        descripcion: "Reglamentación de la conformación y funcionamiento del Comité de Convivencia Laboral",
        obligaciones: "Conformar el Comité de Convivencia Laboral para prevenir acoso laboral",
        alcance: "Empresas con 10 o más trabajadores",
        periodicidad: "Sesiones bimestrales mínimo",
        responsableCumplimiento: "RRHH / Coordinador SST"
      },
      {
        norma: "Ley 1010 de 2006",
        fechaEmision: new Date("2006-01-23"),
        entidadEmisora: "Congreso de la República",
        categoria: "riesgo-psicosocial",
        titulo: "Acoso Laboral",
        descripcion: "Medidas para prevenir, corregir y sancionar el acoso laboral",
        obligaciones: "Prevenir y atender casos de acoso laboral",
        alcance: "Todos los empleadores",
        periodicidad: "Permanente",
        responsableCumplimiento: "Comité de Convivencia / RRHH"
      },
      // Emergencias
      {
        norma: "Resolución 1016 de 1989",
        fechaEmision: new Date("1989-03-31"),
        entidadEmisora: "Ministerio del Trabajo",
        categoria: "emergencias",
        titulo: "Organización, Funcionamiento y Forma de los Programas de Salud Ocupacional",
        descripcion: "Reglamenta programas de salud ocupacional, incluye plan de emergencias",
        obligaciones: "Conformar brigadas de emergencia y realizar simulacros",
        alcance: "Empresas con más de 10 trabajadores",
        periodicidad: "Simulacros semestrales mínimo",
        responsableCumplimiento: "Coordinador SST / Brigada de Emergencias"
      },
      {
        norma: "Ley 1523 de 2012",
        fechaEmision: new Date("2012-04-24"),
        entidadEmisora: "Congreso de la República",
        categoria: "emergencias",
        titulo: "Política Nacional de Gestión del Riesgo de Desastres",
        descripcion: "Sistema Nacional de Gestión del Riesgo de Desastres",
        obligaciones: "Implementar medidas de gestión del riesgo de desastres",
        alcance: "Todas las organizaciones públicas y privadas",
        periodicidad: "Actualización anual del plan",
        responsableCumplimiento: "Alta Dirección / Coordinador SST"
      },
      // Sustancias Químicas
      {
        norma: "Decreto 1496 de 2018",
        fechaEmision: new Date("2018-08-06"),
        entidadEmisora: "Ministerio del Trabajo",
        categoria: "sustancias-quimicas",
        titulo: "Sistema Globalmente Armonizado (SGA)",
        descripcion: "Adopción del SGA de clasificación y etiquetado de productos químicos",
        obligaciones: "Etiquetar productos químicos según SGA y mantener Fichas de Datos de Seguridad (FDS)",
        alcance: "Empresas que manejan sustancias químicas",
        periodicidad: "Actualización de FDS según cambios",
        responsableCumplimiento: "Coordinador SST / Almacén"
      },
      // Trabajo en Alturas
      {
        norma: "Resolución 1409 de 2012",
        fechaEmision: new Date("2012-07-23"),
        entidadEmisora: "Ministerio del Trabajo",
        categoria: "trabajo-alturas",
        titulo: "Reglamento de Seguridad para Protección contra Caídas en Trabajo en Alturas",
        descripcion: "Establece requisitos para trabajo en alturas con riesgo de caída",
        obligaciones: "Implementar sistema de protección contra caídas y certificar trabajadores",
        alcance: "Empresas con trabajo en alturas (>1.50 m)",
        periodicidad: "Recertificación cada 2 años",
        responsableCumplimiento: "Coordinador SST / Coordinador de Alturas"
      },
      {
        norma: "Resolución 3673 de 2008",
        fechaEmision: new Date("2008-09-26"),
        entidadEmisora: "Ministerio de la Protección Social",
        categoria: "trabajo-alturas",
        titulo: "Reglamento Técnico de Trabajo Seguro en Alturas",
        descripcion: "Establece requisitos para trabajo seguro en alturas (Derogada parcialmente por Res. 1409/2012)",
        obligaciones: "Complementaria a Res. 1409 para aspectos técnicos",
        alcance: "Empresas con trabajo en alturas",
        periodicidad: "Según Res. 1409/2012",
        responsableCumplimiento: "Coordinador SST"
      },
      // Espacios Confinados
      {
        norma: "Resolución 491 de 2020",
        fechaEmision: new Date("2020-03-24"),
        entidadEmisora: "Ministerio del Trabajo",
        categoria: "espacios-confinados",
        titulo: "Protocolos de Seguridad para Trabajo en Espacios Confinados",
        descripcion: "Lineamientos para trabajo seguro en espacios confinados",
        obligaciones: "Implementar protocolos de seguridad para espacios confinados",
        alcance: "Empresas con espacios confinados",
        periodicidad: "Permanente - Permiso por entrada",
        responsableCumplimiento: "Coordinador SST / Supervisor de Operaciones"
      },
      // Seguridad Eléctrica
      {
        norma: "Resolución 5018 de 2019",
        fechaEmision: new Date("2019-12-20"),
        entidadEmisora: "Ministerio del Trabajo",
        categoria: "seguridad-electrica",
        titulo: "Reglamento de Seguridad en Actividades de Alto Riesgo Eléctrico",
        descripcion: "Requisitos para trabajo con riesgo eléctrico",
        obligaciones: "Certificar trabajadores en riesgo eléctrico y aplicar protocolos de seguridad",
        alcance: "Empresas con riesgo eléctrico",
        periodicidad: "Recertificación cada 2 años",
        responsableCumplimiento: "Coordinador SST / Jefe de Mantenimiento"
      },
      {
        norma: "Resolución 90708 de 2013 - RETIE",
        fechaEmision: new Date("2013-08-30"),
        entidadEmisora: "Ministerio de Minas y Energía",
        categoria: "seguridad-electrica",
        titulo: "Reglamento Técnico de Instalaciones Eléctricas",
        descripcion: "Requisitos técnicos de instalaciones eléctricas",
        obligaciones: "Cumplir con requisitos técnicos en instalaciones eléctricas",
        alcance: "Todas las instalaciones eléctricas",
        periodicidad: "Inspecciones según normatividad",
        responsableCumplimiento: "Mantenimiento / Coordinador SST"
      },
      // Prevención de Incendios
      {
        norma: "NSR-10 - Título J",
        fechaEmision: new Date("2010-03-26"),
        entidadEmisora: "Ministerio de Ambiente, Vivienda y Desarrollo Territorial",
        categoria: "prevencion-incendios",
        titulo: "Requisitos de Protección contra Incendios en Edificaciones",
        descripcion: "Norma Sismo Resistente - Requisitos de protección contra incendios",
        obligaciones: "Cumplir con sistemas de protección contra incendios según uso de la edificación",
        alcance: "Todas las edificaciones",
        periodicidad: "Inspecciones anuales",
        responsableCumplimiento: "Mantenimiento / Coordinador SST"
      },
      {
        norma: "NFPA 10",
        fechaEmision: new Date("2018-01-01"),
        entidadEmisora: "National Fire Protection Association",
        categoria: "prevencion-incendios",
        titulo: "Extintores Portátiles contra Incendios",
        descripcion: "Estándar para selección, instalación, inspección y mantenimiento de extintores",
        obligaciones: "Mantenimiento mensual y recarga anual de extintores",
        alcance: "Todas las empresas",
        periodicidad: "Inspección mensual, recarga anual",
        responsableCumplimiento: "Mantenimiento / Brigada de Emergencias"
      },
      // Comités SST
      {
        norma: "Resolución 2013 de 1986",
        fechaEmision: new Date("1986-06-06"),
        entidadEmisora: "Ministerio del Trabajo",
        categoria: "comites-sst",
        titulo: "Organización y Funcionamiento de los Comités de Medicina, Higiene y Seguridad Industrial (COPASST)",
        descripcion: "Reglamenta conformación y funciones del COPASST",
        obligaciones: "Conformar COPASST y realizar reuniones mensuales",
        alcance: "Empresas con 10 o más trabajadores",
        periodicidad: "Reuniones mensuales mínimo",
        responsableCumplimiento: "RRHH / Coordinador SST"
      },
      {
        norma: "Decreto 1295 de 1994",
        fechaEmision: new Date("1994-06-22"),
        entidadEmisora: "Ministerio de Gobierno",
        categoria: "comites-sst",
        titulo: "Sistema General de Riesgos Laborales",
        descripcion: "Determina organización del Sistema General de Riesgos Laborales",
        obligaciones: "Afiliación a ARL y reporte de accidentes/enfermedades laborales",
        alcance: "Todos los empleadores y trabajadores",
        periodicidad: "Permanente",
        responsableCumplimiento: "RRHH / Nómina"
      },
      // Investigación de Incidentes
      {
        norma: "Resolución 1401 de 2007",
        fechaEmision: new Date("2007-05-14"),
        entidadEmisora: "Ministerio de la Protección Social",
        categoria: "investigacion-incidentes",
        titulo: "Investigación de Incidentes y Accidentes de Trabajo",
        descripcion: "Procedimientos para investigación de accidentes e incidentes de trabajo",
        obligaciones: "Investigar todos los accidentes e incidentes de trabajo",
        alcance: "Todos los empleadores",
        periodicidad: "Según ocurrencia de eventos",
        responsableCumplimiento: "Coordinador SST / COPASST"
      },
      // Capacitación
      {
        norma: "Resolución 4927 de 2016",
        fechaEmision: new Date("2016-11-23"),
        entidadEmisora: "Ministerio del Trabajo",
        categoria: "capacitacion",
        titulo: "Licencia en Seguridad y Salud en el Trabajo",
        descripcion: "Requisitos para obtener licencia en SST y curso de 50 horas",
        obligaciones: "Responsable SST debe tener licencia vigente y curso de 50 horas",
        alcance: "Profesionales que ejercen como responsables SST",
        periodicidad: "Renovación cada 4 años",
        responsableCumplimiento: "Coordinador SST"
      }
    ];

    // Insertar todas las normas
    for (const norma of normasBase) {
      await this.createMatrizLegalItem(norma as schema.InsertMatrizLegal, companyId);
    }
  }

  async validateMatrizLegalCompliance(companyId: string): Promise<void> {
    // Obtener todas las normas con validación automática habilitada
    const normas = await db.select()
      .from(schema.matrizLegal)
      .where(and(
        eq(schema.matrizLegal.companyId, companyId),
        eq(schema.matrizLegal.validacionAutomatica, 1)
      ));

    const currentYear = new Date().getFullYear();

    // Validar cada norma según su código de validación
    for (const norma of normas) {
      let estadoAutomatico: "cumple" | "cumple-parcialmente" | "no-cumple" | "no-aplica" = "no-cumple";

      switch (norma.codigoValidacion) {
        case "PLAN_ANUAL_TRABAJO": {
          // Verificar si existe Plan Anual de Trabajo vigente del año actual
          const [plan] = await db.select()
            .from(schema.planesTrabajoAnual)
            .where(and(
              eq(schema.planesTrabajoAnual.companyId, companyId),
              eq(schema.planesTrabajoAnual.anio, currentYear),
              or(
                eq(schema.planesTrabajoAnual.estado, "aprobado"),
                eq(schema.planesTrabajoAnual.estado, "vigente")
              )
            ));
          estadoAutomatico = plan ? "cumple" : "no-cumple";
          break;
        }

        case "POLITICA_SST": {
          // Verificar si existe Política SST vigente
          const [politica] = await db.select()
            .from(schema.politicasSst)
            .where(and(
              eq(schema.politicasSst.companyId, companyId),
              eq(schema.politicasSst.estado, "vigente")
            ));
          estadoAutomatico = politica ? "cumple" : "no-cumple";
          break;
        }

        default:
          // Si no hay regla de validación, mantener el estado manual
          continue;
      }

      // Actualizar el estado automático de la norma
      await db.update(schema.matrizLegal)
        .set({
          estadoAutomatico,
          ultimaValidacionAutomatica: sql`now()`
        })
        .where(eq(schema.matrizLegal.id, norma.id));
    }
  }

  // Objetivos SST methods
  async getObjetivosSst(companyId: string): Promise<ObjetivoSst[]> {
    return await db.select()
      .from(schema.objetivosSst)
      .where(eq(schema.objetivosSst.companyId, companyId))
      .orderBy(desc(schema.objetivosSst.createdAt));
  }

  async getObjetivoSst(id: string, companyId: string): Promise<ObjetivoSst | undefined> {
    const [objetivo] = await db.select()
      .from(schema.objetivosSst)
      .where(and(
        eq(schema.objetivosSst.id, id),
        eq(schema.objetivosSst.companyId, companyId)
      ));
    return objetivo;
  }

  async createObjetivoSst(objetivo: InsertObjetivoSst, companyId: string): Promise<ObjetivoSst> {
    const [newObjetivo] = await db.insert(schema.objetivosSst)
      .values({
        ...objetivo,
        companyId
      } as any)
      .returning();
    return newObjetivo;
  }

  async updateObjetivoSst(id: string, objetivo: Partial<InsertObjetivoSst>, companyId: string): Promise<ObjetivoSst | undefined> {
    // Auto-update estado based on porcentajeAvance (Decreto 1072/2015, Art. 2.2.4.6.19)
    const updateData: any = { ...objetivo };
    
    // If porcentajeAvance is being updated to 100 or more, auto-set estado to 'cumplido'
    if (typeof objetivo.porcentajeAvance === 'number') {
      if (objetivo.porcentajeAvance >= 100) {
        updateData.estado = 'cumplido';
      } else if (objetivo.porcentajeAvance > 0 && !objetivo.estado) {
        // If avance > 0 but < 100 and estado wasn't explicitly set, ensure it's 'activo'
        updateData.estado = 'activo';
      }
    }
    
    const [updated] = await db.update(schema.objetivosSst)
      .set(updateData)
      .where(and(
        eq(schema.objetivosSst.id, id),
        eq(schema.objetivosSst.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteObjetivoSst(id: string, companyId: string): Promise<void> {
    await db.delete(schema.objetivosSst)
      .where(and(
        eq(schema.objetivosSst.id, id),
        eq(schema.objetivosSst.companyId, companyId)
      ));
  }

  // Indicadores SST methods
  async getIndicadoresSst(companyId: string, objetivoId?: string): Promise<IndicadorSst[]> {
    const conditions = [eq(schema.indicadoresSst.companyId, companyId)];
    if (objetivoId) {
      conditions.push(eq(schema.indicadoresSst.objetivoId, objetivoId));
    }
    return await db.select()
      .from(schema.indicadoresSst)
      .where(and(...conditions))
      .orderBy(schema.indicadoresSst.tipo, desc(schema.indicadoresSst.createdAt));
  }

  async getIndicadorSst(id: string, companyId: string): Promise<IndicadorSst | undefined> {
    const [indicador] = await db.select()
      .from(schema.indicadoresSst)
      .where(and(
        eq(schema.indicadoresSst.id, id),
        eq(schema.indicadoresSst.companyId, companyId)
      ));
    return indicador;
  }

  async createIndicadorSst(indicador: InsertIndicadorSst, companyId: string): Promise<IndicadorSst> {
    const [newIndicador] = await db.insert(schema.indicadoresSst)
      .values({
        ...indicador,
        companyId
      } as any)
      .returning();
    return newIndicador;
  }

  async updateIndicadorSst(id: string, indicador: Partial<InsertIndicadorSst>, companyId: string): Promise<IndicadorSst | undefined> {
    const [updated] = await db.update(schema.indicadoresSst)
      .set(indicador as any)
      .where(and(
        eq(schema.indicadoresSst.id, id),
        eq(schema.indicadoresSst.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteIndicadorSst(id: string, companyId: string): Promise<void> {
    await db.delete(schema.indicadoresSst)
      .where(and(
        eq(schema.indicadoresSst.id, id),
        eq(schema.indicadoresSst.companyId, companyId)
      ));
  }

  // Mediciones de Indicadores methods
  async getMedicionesIndicador(indicadorId: string, companyId: string): Promise<MedicionIndicador[]> {
    return await db.select()
      .from(schema.medicionesIndicadores)
      .where(and(
        eq(schema.medicionesIndicadores.indicadorId, indicadorId),
        eq(schema.medicionesIndicadores.companyId, companyId)
      ))
      .orderBy(desc(schema.medicionesIndicadores.periodo));
  }

  async getMedicionIndicador(id: string, companyId: string): Promise<MedicionIndicador | undefined> {
    const [medicion] = await db.select()
      .from(schema.medicionesIndicadores)
      .where(and(
        eq(schema.medicionesIndicadores.id, id),
        eq(schema.medicionesIndicadores.companyId, companyId)
      ));
    return medicion;
  }

  async createMedicionIndicador(medicion: InsertMedicionIndicador, companyId: string): Promise<MedicionIndicador> {
    const [newMedicion] = await db.insert(schema.medicionesIndicadores)
      .values({
        ...medicion,
        companyId
      } as any)
      .returning();
    return newMedicion;
  }

  async updateMedicionIndicador(id: string, medicion: Partial<InsertMedicionIndicador>, companyId: string): Promise<MedicionIndicador | undefined> {
    const [updated] = await db.update(schema.medicionesIndicadores)
      .set(medicion as any)
      .where(and(
        eq(schema.medicionesIndicadores.id, id),
        eq(schema.medicionesIndicadores.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteMedicionIndicador(id: string, companyId: string): Promise<void> {
    await db.delete(schema.medicionesIndicadores)
      .where(and(
        eq(schema.medicionesIndicadores.id, id),
        eq(schema.medicionesIndicadores.companyId, companyId)
      ));
  }

  // Datos de Cálculo Indicadores methods
  async getAllDatosCalculo(companyId: string): Promise<DatosCalculo[]> {
    return await db.select()
      .from(schema.datosCalculoIndicadores)
      .where(eq(schema.datosCalculoIndicadores.companyId, companyId))
      .orderBy(desc(schema.datosCalculoIndicadores.periodo));
  }

  async getDatosCalculo(id: string, companyId: string): Promise<DatosCalculo | undefined> {
    const [datos] = await db.select()
      .from(schema.datosCalculoIndicadores)
      .where(and(
        eq(schema.datosCalculoIndicadores.id, id),
        eq(schema.datosCalculoIndicadores.companyId, companyId)
      ));
    return datos;
  }

  async getDatosCalculoByPeriodo(periodo: string, companyId: string): Promise<DatosCalculo | undefined> {
    const [datos] = await db.select()
      .from(schema.datosCalculoIndicadores)
      .where(and(
        eq(schema.datosCalculoIndicadores.periodo, periodo),
        eq(schema.datosCalculoIndicadores.companyId, companyId)
      ));
    return datos;
  }

  async createDatosCalculo(datos: InsertDatosCalculo, companyId: string): Promise<DatosCalculo> {
    const [newDatos] = await db.insert(schema.datosCalculoIndicadores)
      .values({
        ...datos,
        companyId
      })
      .returning();
    return newDatos;
  }

  async updateDatosCalculo(id: string, datos: Partial<InsertDatosCalculo>, companyId: string): Promise<DatosCalculo | undefined> {
    const [updated] = await db.update(schema.datosCalculoIndicadores)
      .set({
        ...datos,
        updatedAt: sql`now()`
      })
      .where(and(
        eq(schema.datosCalculoIndicadores.id, id),
        eq(schema.datosCalculoIndicadores.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteDatosCalculo(id: string, companyId: string): Promise<void> {
    await db.delete(schema.datosCalculoIndicadores)
      .where(and(
        eq(schema.datosCalculoIndicadores.id, id),
        eq(schema.datosCalculoIndicadores.companyId, companyId)
      ));
  }

  // Proveedores y Contratistas methods
  async getProveedoresContratistas(companyId: string): Promise<ProveedorContratista[]> {
    return await db.select()
      .from(schema.proveedoresContratistas)
      .where(eq(schema.proveedoresContratistas.companyId, companyId))
      .orderBy(desc(schema.proveedoresContratistas.createdAt));
  }

  async getProveedorContratista(id: string, companyId: string): Promise<ProveedorContratista | undefined> {
    const [proveedor] = await db.select()
      .from(schema.proveedoresContratistas)
      .where(and(
        eq(schema.proveedoresContratistas.id, id),
        eq(schema.proveedoresContratistas.companyId, companyId)
      ));
    return proveedor;
  }

  async createProveedorContratista(proveedor: InsertProveedorContratista, companyId: string): Promise<ProveedorContratista> {
    const [newProveedor] = await db.insert(schema.proveedoresContratistas)
      .values({
        ...proveedor,
        companyId
      } as any)
      .returning();
    return newProveedor;
  }

  async updateProveedorContratista(id: string, proveedor: Partial<InsertProveedorContratista>, companyId: string): Promise<ProveedorContratista | undefined> {
    const [updated] = await db.update(schema.proveedoresContratistas)
      .set({
        ...proveedor,
        updatedAt: sql`now()`
      } as any)
      .where(and(
        eq(schema.proveedoresContratistas.id, id),
        eq(schema.proveedoresContratistas.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteProveedorContratista(id: string, companyId: string): Promise<void> {
    await db.delete(schema.proveedoresContratistas)
      .where(and(
        eq(schema.proveedoresContratistas.id, id),
        eq(schema.proveedoresContratistas.companyId, companyId)
      ));
  }

  // Evaluaciones de Proveedores methods
  async getEvaluacionesProveedor(proveedorId: string, companyId: string): Promise<EvaluacionProveedor[]> {
    return await db.select()
      .from(schema.evaluacionesProveedores)
      .where(and(
        eq(schema.evaluacionesProveedores.proveedorId, proveedorId),
        eq(schema.evaluacionesProveedores.companyId, companyId)
      ))
      .orderBy(desc(schema.evaluacionesProveedores.fechaEvaluacion));
  }

  async getAllEvaluacionesProveedores(companyId: string): Promise<EvaluacionProveedor[]> {
    return await db.select()
      .from(schema.evaluacionesProveedores)
      .where(eq(schema.evaluacionesProveedores.companyId, companyId))
      .orderBy(desc(schema.evaluacionesProveedores.fechaEvaluacion));
  }

  async getEvaluacionProveedor(id: string, companyId: string): Promise<EvaluacionProveedor | undefined> {
    const [evaluacion] = await db.select()
      .from(schema.evaluacionesProveedores)
      .where(and(
        eq(schema.evaluacionesProveedores.id, id),
        eq(schema.evaluacionesProveedores.companyId, companyId)
      ));
    return evaluacion;
  }

  async createEvaluacionProveedor(evaluacion: InsertEvaluacionProveedor, companyId: string): Promise<EvaluacionProveedor> {
    const [newEvaluacion] = await db.insert(schema.evaluacionesProveedores)
      .values({
        ...evaluacion,
        companyId
      } as any)
      .returning();
    return newEvaluacion;
  }

  async updateEvaluacionProveedor(id: string, evaluacion: Partial<InsertEvaluacionProveedor>, companyId: string): Promise<EvaluacionProveedor | undefined> {
    const [updated] = await db.update(schema.evaluacionesProveedores)
      .set({
        ...evaluacion,
        updatedAt: sql`now()`
      } as any)
      .where(and(
        eq(schema.evaluacionesProveedores.id, id),
        eq(schema.evaluacionesProveedores.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteEvaluacionProveedor(id: string, companyId: string): Promise<void> {
    await db.delete(schema.evaluacionesProveedores)
      .where(and(
        eq(schema.evaluacionesProveedores.id, id),
        eq(schema.evaluacionesProveedores.companyId, companyId)
      ));
  }

  async calcularPuntajeEvaluacionProveedor(evaluacionId: string, companyId: string): Promise<void> {
    // Obtener todas las respuestas de la evaluación
    const respuestas = await db.select()
      .from(schema.respuestasCriteriosProveedor)
      .where(eq(schema.respuestasCriteriosProveedor.evaluacionId, evaluacionId));

    // Calcular puntaje total
    const puntajeTotal = respuestas.reduce((sum, r) => sum + r.puntajeObtenido, 0);
    
    // Obtener puntaje máximo de los criterios
    const criteriosIds = respuestas.map(r => r.criterioId);
    const criterios = await db.select()
      .from(schema.criteriosEvaluacionProveedor)
      .where(and(
        sql`${schema.criteriosEvaluacionProveedor.id} = ANY(${criteriosIds})`,
        eq(schema.criteriosEvaluacionProveedor.companyId, companyId)
      ));
    
    const puntajeMaximo = criterios.reduce((sum, c) => sum + c.puntajeMaximo, 0);
    const porcentajeCumplimiento = puntajeMaximo > 0 ? Math.round((puntajeTotal / puntajeMaximo) * 100) : 0;

    // Determinar clasificación
    let clasificacion = 'malo';
    if (porcentajeCumplimiento >= 90) clasificacion = 'excelente';
    else if (porcentajeCumplimiento >= 70) clasificacion = 'bueno';
    else if (porcentajeCumplimiento >= 50) clasificacion = 'regular';

    // Actualizar evaluación
    await db.update(schema.evaluacionesProveedores)
      .set({
        puntajeTotal,
        puntajeMaximo,
        porcentajeCumplimiento,
        clasificacion,
        updatedAt: sql`now()`
      })
      .where(and(
        eq(schema.evaluacionesProveedores.id, evaluacionId),
        eq(schema.evaluacionesProveedores.companyId, companyId)
      ));
  }

  // Criterios de Evaluación methods
  async getCriteriosEvaluacion(companyId: string): Promise<CriterioEvaluacion[]> {
    return await db.select()
      .from(schema.criteriosEvaluacionProveedor)
      .where(eq(schema.criteriosEvaluacionProveedor.companyId, companyId))
      .orderBy(schema.criteriosEvaluacionProveedor.orden);
  }

  async getCriterioEvaluacion(id: string, companyId: string): Promise<CriterioEvaluacion | undefined> {
    const [criterio] = await db.select()
      .from(schema.criteriosEvaluacionProveedor)
      .where(and(
        eq(schema.criteriosEvaluacionProveedor.id, id),
        eq(schema.criteriosEvaluacionProveedor.companyId, companyId)
      ));
    return criterio;
  }

  async createCriterioEvaluacion(criterio: InsertCriterioEvaluacion, companyId: string): Promise<CriterioEvaluacion> {
    const [newCriterio] = await db.insert(schema.criteriosEvaluacionProveedor)
      .values({
        ...criterio,
        companyId
      })
      .returning();
    return newCriterio;
  }

  async updateCriterioEvaluacion(id: string, criterio: Partial<InsertCriterioEvaluacion>, companyId: string): Promise<CriterioEvaluacion | undefined> {
    const [updated] = await db.update(schema.criteriosEvaluacionProveedor)
      .set(criterio)
      .where(and(
        eq(schema.criteriosEvaluacionProveedor.id, id),
        eq(schema.criteriosEvaluacionProveedor.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteCriterioEvaluacion(id: string, companyId: string): Promise<void> {
    await db.delete(schema.criteriosEvaluacionProveedor)
      .where(and(
        eq(schema.criteriosEvaluacionProveedor.id, id),
        eq(schema.criteriosEvaluacionProveedor.companyId, companyId)
      ));
  }

  async initializeCriteriosEvaluacion(companyId: string): Promise<void> {
    // Verificar si ya existen criterios para esta empresa
    const existing = await this.getCriteriosEvaluacion(companyId);
    if (existing.length > 0) return;

    // Criterios estándar basados en Res. 0312/2019 y Decreto 1072/2015
    const criteriosBase = [
      {
        nombre: 'Certificación ARL - Cumplimiento Decreto 1072',
        descripcion: '% de cumplimiento del SG-SST certificado por la ARL',
        categoria: 'certificacion_arl',
        puntajeMaximo: 25,
        orden: 1
      },
      {
        nombre: 'Autoevaluación Estándares Mínimos (Res. 0312/2019)',
        descripcion: 'Cumplimiento de estándares mínimos según tamaño y riesgo',
        categoria: 'estandares_minimos',
        puntajeMaximo: 25,
        orden: 2
      },
      {
        nombre: 'Afiliación al Sistema de Seguridad Social',
        descripcion: 'Afiliación vigente de trabajadores a ARL, EPS, AFP',
        categoria: 'afiliacion',
        puntajeMaximo: 15,
        orden: 3
      },
      {
        nombre: 'Matriz de Identificación de Peligros',
        descripcion: 'Matriz de riesgos actualizada y documentada',
        categoria: 'matriz_riesgos',
        puntajeMaximo: 15,
        orden: 4
      },
      {
        nombre: 'Documentación SST',
        descripcion: 'Política SST, procedimientos, planes de emergencia',
        categoria: 'documentacion',
        puntajeMaximo: 20,
        orden: 5
      }
    ];

    // Insertar criterios base con valores por defecto
    for (const criterio of criteriosBase) {
      await this.createCriterioEvaluacion({
        ...criterio,
        activo: 1,
        esObligatorio: 1
      }, companyId);
    }
  }

  // Respuestas a Criterios methods
  async getRespuestasCriterios(evaluacionId: string): Promise<RespuestaCriterio[]> {
    return await db.select()
      .from(schema.respuestasCriteriosProveedor)
      .where(eq(schema.respuestasCriteriosProveedor.evaluacionId, evaluacionId));
  }

  async getRespuestaCriterio(id: string): Promise<RespuestaCriterio | undefined> {
    const [respuesta] = await db.select()
      .from(schema.respuestasCriteriosProveedor)
      .where(eq(schema.respuestasCriteriosProveedor.id, id));
    return respuesta;
  }

  async createRespuestaCriterio(respuesta: InsertRespuestaCriterio): Promise<RespuestaCriterio> {
    const [newRespuesta] = await db.insert(schema.respuestasCriteriosProveedor)
      .values(respuesta)
      .returning();
    return newRespuesta;
  }

  async updateRespuestaCriterio(id: string, respuesta: Partial<InsertRespuestaCriterio>): Promise<RespuestaCriterio | undefined> {
    const [updated] = await db.update(schema.respuestasCriteriosProveedor)
      .set(respuesta)
      .where(eq(schema.respuestasCriteriosProveedor.id, id))
      .returning();
    return updated;
  }

  async deleteRespuestaCriterio(id: string): Promise<void> {
    await db.delete(schema.respuestasCriteriosProveedor)
      .where(eq(schema.respuestasCriteriosProveedor.id, id));
  }

  // Documentos de Proveedores methods
  async getDocumentosProveedor(proveedorId: string, companyId: string): Promise<DocumentoProveedor[]> {
    return await db.select()
      .from(schema.documentosProveedores)
      .where(and(
        eq(schema.documentosProveedores.proveedorId, proveedorId),
        eq(schema.documentosProveedores.companyId, companyId)
      ))
      .orderBy(desc(schema.documentosProveedores.createdAt));
  }

  async getDocumentoProveedor(id: string, companyId: string): Promise<DocumentoProveedor | undefined> {
    const [documento] = await db.select()
      .from(schema.documentosProveedores)
      .where(and(
        eq(schema.documentosProveedores.id, id),
        eq(schema.documentosProveedores.companyId, companyId)
      ));
    return documento;
  }

  async createDocumentoProveedor(documento: InsertDocumentoProveedor, companyId: string): Promise<DocumentoProveedor> {
    const [newDocumento] = await db.insert(schema.documentosProveedores)
      .values({
        ...documento,
        companyId
      } as any)
      .returning();
    return newDocumento;
  }

  async updateDocumentoProveedor(id: string, documento: Partial<InsertDocumentoProveedor>, companyId: string): Promise<DocumentoProveedor | undefined> {
    const [updated] = await db.update(schema.documentosProveedores)
      .set({
        ...documento,
        updatedAt: sql`now()`
      } as any)
      .where(and(
        eq(schema.documentosProveedores.id, id),
        eq(schema.documentosProveedores.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteDocumentoProveedor(id: string, companyId: string): Promise<void> {
    await db.delete(schema.documentosProveedores)
      .where(and(
        eq(schema.documentosProveedores.id, id),
        eq(schema.documentosProveedores.companyId, companyId)
      ));
  }

  // Seguimientos a Proveedores methods
  async getSeguimientosProveedor(proveedorId: string, companyId: string): Promise<SeguimientoProveedor[]> {
    return await db.select()
      .from(schema.seguimientosProveedores)
      .where(and(
        eq(schema.seguimientosProveedores.proveedorId, proveedorId),
        eq(schema.seguimientosProveedores.companyId, companyId)
      ))
      .orderBy(desc(schema.seguimientosProveedores.fechaSeguimiento));
  }

  async getAllSeguimientosProveedores(companyId: string): Promise<SeguimientoProveedor[]> {
    return await db.select()
      .from(schema.seguimientosProveedores)
      .where(eq(schema.seguimientosProveedores.companyId, companyId))
      .orderBy(desc(schema.seguimientosProveedores.fechaSeguimiento));
  }

  async getSeguimientoProveedor(id: string, companyId: string): Promise<SeguimientoProveedor | undefined> {
    const [seguimiento] = await db.select()
      .from(schema.seguimientosProveedores)
      .where(and(
        eq(schema.seguimientosProveedores.id, id),
        eq(schema.seguimientosProveedores.companyId, companyId)
      ));
    return seguimiento;
  }

  async createSeguimientoProveedor(seguimiento: InsertSeguimientoProveedor, companyId: string): Promise<SeguimientoProveedor> {
    const [newSeguimiento] = await db.insert(schema.seguimientosProveedores)
      .values({
        ...seguimiento,
        companyId
      } as any)
      .returning();
    return newSeguimiento;
  }

  async updateSeguimientoProveedor(id: string, seguimiento: Partial<InsertSeguimientoProveedor>, companyId: string): Promise<SeguimientoProveedor | undefined> {
    const [updated] = await db.update(schema.seguimientosProveedores)
      .set({
        ...seguimiento,
        updatedAt: sql`now()`
      } as any)
      .where(and(
        eq(schema.seguimientosProveedores.id, id),
        eq(schema.seguimientosProveedores.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteSeguimientoProveedor(id: string, companyId: string): Promise<void> {
    await db.delete(schema.seguimientosProveedores)
      .where(and(
        eq(schema.seguimientosProveedores.id, id),
        eq(schema.seguimientosProveedores.companyId, companyId)
      ));
  }

  // ========================================
  // Gestión de Cambios SST methods - Decreto 1072/2015 Art. 2.2.4.6.26
  // ========================================

  // Cambios SST methods
  async getCambiosSst(companyId: string): Promise<CambioSst[]> {
    return await db.select()
      .from(schema.cambiosSst)
      .where(eq(schema.cambiosSst.companyId, companyId))
      .orderBy(desc(schema.cambiosSst.createdAt));
  }

  async getCambioSst(id: string, companyId: string): Promise<CambioSst | undefined> {
    const [cambio] = await db.select()
      .from(schema.cambiosSst)
      .where(and(
        eq(schema.cambiosSst.id, id),
        eq(schema.cambiosSst.companyId, companyId)
      ));
    return cambio;
  }

  async getCambiosByCodigo(codigo: string, companyId: string): Promise<CambioSst[]> {
    return await db.select()
      .from(schema.cambiosSst)
      .where(and(
        eq(schema.cambiosSst.codigo, codigo),
        eq(schema.cambiosSst.companyId, companyId)
      ));
  }

  async generateCodigoCambio(companyId: string): Promise<string> {
    const year = new Date().getFullYear();
    const cambiosDelAno = await db.select()
      .from(schema.cambiosSst)
      .where(and(
        eq(schema.cambiosSst.companyId, companyId),
        sql`EXTRACT(YEAR FROM ${schema.cambiosSst.createdAt}) = ${year}`
      ));
    
    const nextNumber = cambiosDelAno.length + 1;
    return `CAM-${year}-${String(nextNumber).padStart(3, '0')}`;
  }

  async createCambioSst(cambio: InsertCambioSst, companyId: string): Promise<CambioSst> {
    const codigo = await this.generateCodigoCambio(companyId);
    const [newCambio] = await db.insert(schema.cambiosSst)
      .values({
        ...cambio,
        codigo,
        companyId
      } as any)
      .returning();
    return newCambio;
  }

  async updateCambioSst(id: string, cambio: Partial<InsertCambioSst>, companyId: string): Promise<CambioSst | undefined> {
    const [updated] = await db.update(schema.cambiosSst)
      .set({
        ...cambio,
        updatedAt: sql`now()`
      } as any)
      .where(and(
        eq(schema.cambiosSst.id, id),
        eq(schema.cambiosSst.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteCambioSst(id: string, companyId: string): Promise<void> {
    await db.delete(schema.cambiosSst)
      .where(and(
        eq(schema.cambiosSst.id, id),
        eq(schema.cambiosSst.companyId, companyId)
      ));
  }

  // Evaluaciones de Impacto methods
  async getAllEvaluacionesImpacto(companyId: string): Promise<EvaluacionImpactoCambio[]> {
    return await db.select()
      .from(schema.evaluacionesImpactoCambios)
      .where(eq(schema.evaluacionesImpactoCambios.companyId, companyId))
      .orderBy(desc(schema.evaluacionesImpactoCambios.fechaEvaluacion));
  }

  async getEvaluacionesImpactoCambio(cambioId: string, companyId: string): Promise<EvaluacionImpactoCambio[]> {
    return await db.select()
      .from(schema.evaluacionesImpactoCambios)
      .where(and(
        eq(schema.evaluacionesImpactoCambios.cambioId, cambioId),
        eq(schema.evaluacionesImpactoCambios.companyId, companyId)
      ))
      .orderBy(desc(schema.evaluacionesImpactoCambios.fechaEvaluacion));
  }

  async getEvaluacionImpactoCambio(id: string, companyId: string): Promise<EvaluacionImpactoCambio | undefined> {
    const [evaluacion] = await db.select()
      .from(schema.evaluacionesImpactoCambios)
      .where(and(
        eq(schema.evaluacionesImpactoCambios.id, id),
        eq(schema.evaluacionesImpactoCambios.companyId, companyId)
      ));
    return evaluacion;
  }

  async createEvaluacionImpactoCambio(evaluacion: InsertEvaluacionImpactoCambio, companyId: string): Promise<EvaluacionImpactoCambio> {
    const [newEvaluacion] = await db.insert(schema.evaluacionesImpactoCambios)
      .values({
        ...evaluacion,
        companyId
      } as any)
      .returning();
    
    // Actualizar nivel de impacto del cambio basado en la evaluación
    if (newEvaluacion.cambioId) {
      await this.updateCambioSst(newEvaluacion.cambioId, {
        nivelImpacto: newEvaluacion.nivelRiesgoResultante,
        estado: 'en_evaluacion'
      }, companyId);
    }
    
    return newEvaluacion;
  }

  async updateEvaluacionImpactoCambio(id: string, evaluacion: Partial<InsertEvaluacionImpactoCambio>, companyId: string): Promise<EvaluacionImpactoCambio | undefined> {
    const [updated] = await db.update(schema.evaluacionesImpactoCambios)
      .set({
        ...evaluacion,
        updatedAt: sql`now()`
      } as any)
      .where(and(
        eq(schema.evaluacionesImpactoCambios.id, id),
        eq(schema.evaluacionesImpactoCambios.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteEvaluacionImpactoCambio(id: string, companyId: string): Promise<void> {
    await db.delete(schema.evaluacionesImpactoCambios)
      .where(and(
        eq(schema.evaluacionesImpactoCambios.id, id),
        eq(schema.evaluacionesImpactoCambios.companyId, companyId)
      ));
  }

  // Controles de Cambios methods
  async getControlesCambio(cambioId: string, companyId: string): Promise<ControlCambio[]> {
    return await db.select()
      .from(schema.controlesCambios)
      .where(and(
        eq(schema.controlesCambios.cambioId, cambioId),
        eq(schema.controlesCambios.companyId, companyId)
      ))
      .orderBy(desc(schema.controlesCambios.createdAt));
  }

  async getControlCambio(id: string, companyId: string): Promise<ControlCambio | undefined> {
    const [control] = await db.select()
      .from(schema.controlesCambios)
      .where(and(
        eq(schema.controlesCambios.id, id),
        eq(schema.controlesCambios.companyId, companyId)
      ));
    return control;
  }

  async createControlCambio(control: InsertControlCambio, companyId: string): Promise<ControlCambio> {
    const [newControl] = await db.insert(schema.controlesCambios)
      .values({
        ...control,
        companyId
      } as any)
      .returning();
    return newControl;
  }

  async updateControlCambio(id: string, control: Partial<InsertControlCambio>, companyId: string): Promise<ControlCambio | undefined> {
    const [updated] = await db.update(schema.controlesCambios)
      .set({
        ...control,
        updatedAt: sql`now()`
      } as any)
      .where(and(
        eq(schema.controlesCambios.id, id),
        eq(schema.controlesCambios.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteControlCambio(id: string, companyId: string): Promise<void> {
    await db.delete(schema.controlesCambios)
      .where(and(
        eq(schema.controlesCambios.id, id),
        eq(schema.controlesCambios.companyId, companyId)
      ));
  }

  // Capacitaciones de Cambios methods
  async getCapacitacionesCambio(cambioId: string, companyId: string): Promise<CapacitacionCambio[]> {
    return await db.select()
      .from(schema.capacitacionesCambios)
      .where(and(
        eq(schema.capacitacionesCambios.cambioId, cambioId),
        eq(schema.capacitacionesCambios.companyId, companyId)
      ))
      .orderBy(desc(schema.capacitacionesCambios.createdAt));
  }

  async getCapacitacionCambio(id: string, companyId: string): Promise<CapacitacionCambio | undefined> {
    const [capacitacion] = await db.select()
      .from(schema.capacitacionesCambios)
      .where(and(
        eq(schema.capacitacionesCambios.id, id),
        eq(schema.capacitacionesCambios.companyId, companyId)
      ));
    return capacitacion;
  }

  async createCapacitacionCambio(capacitacion: InsertCapacitacionCambio, companyId: string): Promise<CapacitacionCambio> {
    const [newCapacitacion] = await db.insert(schema.capacitacionesCambios)
      .values({
        ...capacitacion,
        companyId
      } as any)
      .returning();
    return newCapacitacion;
  }

  async updateCapacitacionCambio(id: string, capacitacion: Partial<InsertCapacitacionCambio>, companyId: string): Promise<CapacitacionCambio | undefined> {
    const [updated] = await db.update(schema.capacitacionesCambios)
      .set({
        ...capacitacion,
        updatedAt: sql`now()`
      } as any)
      .where(and(
        eq(schema.capacitacionesCambios.id, id),
        eq(schema.capacitacionesCambios.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteCapacitacionCambio(id: string, companyId: string): Promise<void> {
    await db.delete(schema.capacitacionesCambios)
      .where(and(
        eq(schema.capacitacionesCambios.id, id),
        eq(schema.capacitacionesCambios.companyId, companyId)
      ));
  }

  // Seguimientos de Cambios methods
  async getSeguimientosCambio(cambioId: string, companyId: string): Promise<SeguimientoCambio[]> {
    return await db.select()
      .from(schema.seguimientosCambios)
      .where(and(
        eq(schema.seguimientosCambios.cambioId, cambioId),
        eq(schema.seguimientosCambios.companyId, companyId)
      ))
      .orderBy(desc(schema.seguimientosCambios.fechaSeguimiento));
  }

  async getSeguimientoCambio(id: string, companyId: string): Promise<SeguimientoCambio | undefined> {
    const [seguimiento] = await db.select()
      .from(schema.seguimientosCambios)
      .where(and(
        eq(schema.seguimientosCambios.id, id),
        eq(schema.seguimientosCambios.companyId, companyId)
      ));
    return seguimiento;
  }

  async createSeguimientoCambio(seguimiento: InsertSeguimientoCambio, companyId: string): Promise<SeguimientoCambio> {
    const [newSeguimiento] = await db.insert(schema.seguimientosCambios)
      .values({
        ...seguimiento,
        companyId
      } as any)
      .returning();
    return newSeguimiento;
  }

  async updateSeguimientoCambio(id: string, seguimiento: Partial<InsertSeguimientoCambio>, companyId: string): Promise<SeguimientoCambio | undefined> {
    const [updated] = await db.update(schema.seguimientosCambios)
      .set({
        ...seguimiento,
        updatedAt: sql`now()`
      } as any)
      .where(and(
        eq(schema.seguimientosCambios.id, id),
        eq(schema.seguimientosCambios.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteSeguimientoCambio(id: string, companyId: string): Promise<void> {
    await db.delete(schema.seguimientosCambios)
      .where(and(
        eq(schema.seguimientosCambios.id, id),
        eq(schema.seguimientosCambios.companyId, companyId)
      ));
  }

  // Aprobaciones de Cambios methods
  async getAprobacionesCambio(cambioId: string, companyId: string): Promise<AprobacionCambio[]> {
    return await db.select()
      .from(schema.aprobacionesCambios)
      .where(and(
        eq(schema.aprobacionesCambios.cambioId, cambioId),
        eq(schema.aprobacionesCambios.companyId, companyId)
      ))
      .orderBy(schema.aprobacionesCambios.orden);
  }

  async getAprobacionCambio(id: string, companyId: string): Promise<AprobacionCambio | undefined> {
    const [aprobacion] = await db.select()
      .from(schema.aprobacionesCambios)
      .where(and(
        eq(schema.aprobacionesCambios.id, id),
        eq(schema.aprobacionesCambios.companyId, companyId)
      ));
    return aprobacion;
  }

  async createAprobacionCambio(aprobacion: InsertAprobacionCambio, companyId: string): Promise<AprobacionCambio> {
    const [newAprobacion] = await db.insert(schema.aprobacionesCambios)
      .values({
        ...aprobacion,
        companyId
      })
      .returning();
    return newAprobacion;
  }

  async updateAprobacionCambio(id: string, aprobacion: Partial<InsertAprobacionCambio>, companyId: string): Promise<AprobacionCambio | undefined> {
    const [updated] = await db.update(schema.aprobacionesCambios)
      .set({
        ...aprobacion,
        updatedAt: sql`now()`
      })
      .where(and(
        eq(schema.aprobacionesCambios.id, id),
        eq(schema.aprobacionesCambios.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteAprobacionCambio(id: string, companyId: string): Promise<void> {
    await db.delete(schema.aprobacionesCambios)
      .where(and(
        eq(schema.aprobacionesCambios.id, id),
        eq(schema.aprobacionesCambios.companyId, companyId)
      ));
  }

  // Automatización de Cambios methods
  async getAutomatizacionLogsForCompany(companyId: string): Promise<AutomatizacionCambioLog[]> {
    return await db.select()
      .from(schema.automatizacionCambioLogs)
      .where(eq(schema.automatizacionCambioLogs.companyId, companyId))
      .orderBy(desc(schema.automatizacionCambioLogs.createdAt));
  }

  async getAutomatizacionLogsForCambio(cambioId: string, companyId: string): Promise<AutomatizacionCambioLog[]> {
    return await db.select()
      .from(schema.automatizacionCambioLogs)
      .where(and(
        eq(schema.automatizacionCambioLogs.cambioId, cambioId),
        eq(schema.automatizacionCambioLogs.companyId, companyId)
      ))
      .orderBy(desc(schema.automatizacionCambioLogs.createdAt));
  }

  async createAutomatizacionLog(log: InsertAutomatizacionCambioLog, companyId: string): Promise<AutomatizacionCambioLog> {
    const [newLog] = await db.insert(schema.automatizacionCambioLogs)
      .values({
        ...log,
        companyId
      } as any)
      .returning();
    return newLog;
  }

  // Dashboard y estadísticas de Cambios
  async getDashboardCambios(companyId: string): Promise<{
    totalCambios: number;
    cambiosPorEstado: Record<string, number>;
    cambiosPorCategoria: Record<string, number>;
    cambiosPorNivelImpacto: Record<string, number>;
    tiempoPromedioEvaluacion: number;
    cambiosPendientesEvaluacion: number;
    cambiosEnImplementacion: number;
  }> {
    const cambios = await this.getCambiosSst(companyId);
    
    // Total de cambios
    const totalCambios = cambios.length;
    
    // Cambios por estado
    const cambiosPorEstado: Record<string, number> = {};
    cambios.forEach(c => {
      cambiosPorEstado[c.estado] = (cambiosPorEstado[c.estado] || 0) + 1;
    });
    
    // Cambios por categoría
    const cambiosPorCategoria: Record<string, number> = {};
    cambios.forEach(c => {
      cambiosPorCategoria[c.categoria] = (cambiosPorCategoria[c.categoria] || 0) + 1;
    });
    
    // Cambios por nivel de impacto
    const cambiosPorNivelImpacto: Record<string, number> = {};
    cambios.forEach(c => {
      if (c.nivelImpacto) {
        cambiosPorNivelImpacto[c.nivelImpacto] = (cambiosPorNivelImpacto[c.nivelImpacto] || 0) + 1;
      }
    });
    
    // Tiempo promedio de evaluación (días entre propuesta y evaluación)
    let tiempoPromedioEvaluacion = 0;
    const cambiosEvaluados = cambios.filter(c => c.estado !== 'propuesto');
    if (cambiosEvaluados.length > 0) {
      const tiempoTotal = await Promise.all(
        cambiosEvaluados.map(async c => {
          const evaluaciones = await this.getEvaluacionesImpactoCambio(c.id, companyId);
          if (evaluaciones.length > 0) {
            const fechaPropuesta = new Date(c.fechaPropuesta);
            const fechaEvaluacion = new Date(evaluaciones[0].fechaEvaluacion);
            return Math.floor((fechaEvaluacion.getTime() - fechaPropuesta.getTime()) / (1000 * 60 * 60 * 24));
          }
          return 0;
        })
      );
      const suma = tiempoTotal.reduce((acc, t) => acc + t, 0);
      tiempoPromedioEvaluacion = Math.round(suma / cambiosEvaluados.length);
    }
    
    // Cambios pendientes de evaluación
    const cambiosPendientesEvaluacion = cambios.filter(c => 
      c.estado === 'propuesto' || c.estado === 'en_evaluacion'
    ).length;
    
    // Cambios en implementación
    const cambiosEnImplementacion = cambios.filter(c => 
      c.estado === 'en_implementacion'
    ).length;
    
    return {
      totalCambios,
      cambiosPorEstado,
      cambiosPorCategoria,
      cambiosPorNivelImpacto,
      tiempoPromedioEvaluacion,
      cambiosPendientesEvaluacion,
      cambiosEnImplementacion
    };
  }

  // ========================================
  // Adquisiciones SST methods - Decreto 1072/2015 Art. 2.2.4.6.27
  // ========================================

  // Solicitudes de Adquisición methods
  async getSolicitudesAdquisicion(companyId: string): Promise<SolicitudAdquisicion[]> {
    return await db.select()
      .from(schema.solicitudesAdquisicion)
      .where(eq(schema.solicitudesAdquisicion.companyId, companyId))
      .orderBy(desc(schema.solicitudesAdquisicion.fechaSolicitud));
  }

  async getSolicitudAdquisicion(id: string, companyId: string): Promise<SolicitudAdquisicion | undefined> {
    const [solicitud] = await db.select()
      .from(schema.solicitudesAdquisicion)
      .where(and(
        eq(schema.solicitudesAdquisicion.id, id),
        eq(schema.solicitudesAdquisicion.companyId, companyId)
      ));
    return solicitud;
  }

  async createSolicitudAdquisicion(solicitud: InsertSolicitudAdquisicion, companyId: string): Promise<SolicitudAdquisicion> {
    // Generate numero de solicitud
    const numeroSolicitud = await this.generateNumeroSolicitud(companyId);
    
    const [newSolicitud] = await db.insert(schema.solicitudesAdquisicion)
      .values({
        ...solicitud,
        companyId,
        numeroSolicitud
      })
      .returning();
    return newSolicitud;
  }

  async updateSolicitudAdquisicion(id: string, solicitud: Partial<InsertSolicitudAdquisicion>, companyId: string): Promise<SolicitudAdquisicion | undefined> {
    const [updated] = await db.update(schema.solicitudesAdquisicion)
      .set({
        ...solicitud,
        updatedAt: sql`now()`
      })
      .where(and(
        eq(schema.solicitudesAdquisicion.id, id),
        eq(schema.solicitudesAdquisicion.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteSolicitudAdquisicion(id: string, companyId: string): Promise<void> {
    await db.delete(schema.solicitudesAdquisicion)
      .where(and(
        eq(schema.solicitudesAdquisicion.id, id),
        eq(schema.solicitudesAdquisicion.companyId, companyId)
      ));
  }

  async generateNumeroSolicitud(companyId: string): Promise<string> {
    const year = new Date().getFullYear();
    const solicitudes = await db.select()
      .from(schema.solicitudesAdquisicion)
      .where(eq(schema.solicitudesAdquisicion.companyId, companyId));
    
    const count = solicitudes.length + 1;
    return `ADQ-${String(count).padStart(3, '0')}-${year}`;
  }

  // Evaluaciones de Adquisición methods
  async getEvaluacionesAdquisicion(companyId: string): Promise<EvaluacionAdquisicion[]> {
    return await db.select()
      .from(schema.evaluacionesAdquisicion)
      .where(eq(schema.evaluacionesAdquisicion.companyId, companyId))
      .orderBy(desc(schema.evaluacionesAdquisicion.fechaEvaluacion));
  }

  async getEvaluacionAdquisicion(id: string, companyId: string): Promise<EvaluacionAdquisicion | undefined> {
    const [evaluacion] = await db.select()
      .from(schema.evaluacionesAdquisicion)
      .where(and(
        eq(schema.evaluacionesAdquisicion.id, id),
        eq(schema.evaluacionesAdquisicion.companyId, companyId)
      ));
    return evaluacion;
  }

  async getEvaluacionesBySolicitud(solicitudId: string, companyId: string): Promise<EvaluacionAdquisicion[]> {
    return await db.select()
      .from(schema.evaluacionesAdquisicion)
      .where(and(
        eq(schema.evaluacionesAdquisicion.solicitudId, solicitudId),
        eq(schema.evaluacionesAdquisicion.companyId, companyId)
      ))
      .orderBy(desc(schema.evaluacionesAdquisicion.fechaEvaluacion));
  }

  async createEvaluacionAdquisicion(evaluacion: InsertEvaluacionAdquisicion, companyId: string): Promise<EvaluacionAdquisicion> {
    const [newEvaluacion] = await db.insert(schema.evaluacionesAdquisicion)
      .values({
        ...evaluacion,
        companyId
      })
      .returning();
    return newEvaluacion;
  }

  async updateEvaluacionAdquisicion(id: string, evaluacion: Partial<InsertEvaluacionAdquisicion>, companyId: string): Promise<EvaluacionAdquisicion | undefined> {
    const [updated] = await db.update(schema.evaluacionesAdquisicion)
      .set({
        ...evaluacion,
        updatedAt: sql`now()`
      })
      .where(and(
        eq(schema.evaluacionesAdquisicion.id, id),
        eq(schema.evaluacionesAdquisicion.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteEvaluacionAdquisicion(id: string, companyId: string): Promise<void> {
    await db.delete(schema.evaluacionesAdquisicion)
      .where(and(
        eq(schema.evaluacionesAdquisicion.id, id),
        eq(schema.evaluacionesAdquisicion.companyId, companyId)
      ));
  }

  // Especificaciones Técnicas methods
  async getEspecificacionesTecnicas(solicitudId: string, companyId: string): Promise<EspecificacionTecnica[]> {
    return await db.select()
      .from(schema.especificacionesTecnicas)
      .where(and(
        eq(schema.especificacionesTecnicas.solicitudId, solicitudId),
        eq(schema.especificacionesTecnicas.companyId, companyId)
      ))
      .orderBy(schema.especificacionesTecnicas.nombreEspecificacion);
  }

  async getEspecificacionTecnica(id: string, companyId: string): Promise<EspecificacionTecnica | undefined> {
    const [especificacion] = await db.select()
      .from(schema.especificacionesTecnicas)
      .where(and(
        eq(schema.especificacionesTecnicas.id, id),
        eq(schema.especificacionesTecnicas.companyId, companyId)
      ));
    return especificacion;
  }

  async createEspecificacionTecnica(especificacion: InsertEspecificacionTecnica, companyId: string): Promise<EspecificacionTecnica> {
    const [newEspecificacion] = await db.insert(schema.especificacionesTecnicas)
      .values({
        ...especificacion,
        companyId
      })
      .returning();
    return newEspecificacion;
  }

  async updateEspecificacionTecnica(id: string, especificacion: Partial<InsertEspecificacionTecnica>, companyId: string): Promise<EspecificacionTecnica | undefined> {
    const [updated] = await db.update(schema.especificacionesTecnicas)
      .set(especificacion)
      .where(and(
        eq(schema.especificacionesTecnicas.id, id),
        eq(schema.especificacionesTecnicas.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteEspecificacionTecnica(id: string, companyId: string): Promise<void> {
    await db.delete(schema.especificacionesTecnicas)
      .where(and(
        eq(schema.especificacionesTecnicas.id, id),
        eq(schema.especificacionesTecnicas.companyId, companyId)
      ));
  }

  // Hojas de Seguridad methods
  async getHojasSeguridad(companyId: string): Promise<HojaSeguridad[]> {
    return await db.select()
      .from(schema.hojasSeguridad)
      .where(eq(schema.hojasSeguridad.companyId, companyId))
      .orderBy(desc(schema.hojasSeguridad.createdAt));
  }

  async getHojaSeguridad(id: string, companyId: string): Promise<HojaSeguridad | undefined> {
    const [hoja] = await db.select()
      .from(schema.hojasSeguridad)
      .where(and(
        eq(schema.hojasSeguridad.id, id),
        eq(schema.hojasSeguridad.companyId, companyId)
      ));
    return hoja;
  }

  async getHojasSeguridadBySolicitud(solicitudId: string, companyId: string): Promise<HojaSeguridad[]> {
    return await db.select()
      .from(schema.hojasSeguridad)
      .where(and(
        eq(schema.hojasSeguridad.solicitudId, solicitudId),
        eq(schema.hojasSeguridad.companyId, companyId)
      ))
      .orderBy(schema.hojasSeguridad.nombreProducto);
  }

  async createHojaSeguridad(hoja: InsertHojaSeguridad, companyId: string): Promise<HojaSeguridad> {
    const [newHoja] = await db.insert(schema.hojasSeguridad)
      .values({
        ...hoja,
        companyId
      })
      .returning();
    return newHoja;
  }

  async updateHojaSeguridad(id: string, hoja: Partial<InsertHojaSeguridad>, companyId: string): Promise<HojaSeguridad | undefined> {
    const [updated] = await db.update(schema.hojasSeguridad)
      .set({
        ...hoja,
        updatedAt: sql`now()`
      })
      .where(and(
        eq(schema.hojasSeguridad.id, id),
        eq(schema.hojasSeguridad.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteHojaSeguridad(id: string, companyId: string): Promise<void> {
    await db.delete(schema.hojasSeguridad)
      .where(and(
        eq(schema.hojasSeguridad.id, id),
        eq(schema.hojasSeguridad.companyId, companyId)
      ));
  }

  // Items de Adquisición methods (2.9.1)
  async getAdquisicionItems(companyId: string): Promise<AdquisicionItem[]> {
    return await db.select()
      .from(schema.adquisicionItems)
      .where(eq(schema.adquisicionItems.companyId, companyId))
      .orderBy(desc(schema.adquisicionItems.createdAt));
  }

  async getAdquisicionItem(id: string, companyId: string): Promise<AdquisicionItem | undefined> {
    const [item] = await db.select()
      .from(schema.adquisicionItems)
      .where(and(
        eq(schema.adquisicionItems.id, id),
        eq(schema.adquisicionItems.companyId, companyId)
      ));
    return item;
  }

  async getAdquisicionItemsBySolicitud(solicitudId: string, companyId: string): Promise<AdquisicionItem[]> {
    return await db.select()
      .from(schema.adquisicionItems)
      .where(and(
        eq(schema.adquisicionItems.solicitudId, solicitudId),
        eq(schema.adquisicionItems.companyId, companyId)
      ))
      .orderBy(schema.adquisicionItems.nombreProducto);
  }

  async createAdquisicionItem(item: InsertAdquisicionItem, companyId: string): Promise<AdquisicionItem> {
    // Calcular precioTotal automáticamente
    const precioTotal = (item.cantidad || 1) * (item.precioUnitario || 0);
    
    const [newItem] = await db.insert(schema.adquisicionItems)
      .values({
        ...item,
        precioTotal,
        companyId
      })
      .returning();
    return newItem;
  }

  async updateAdquisicionItem(id: string, item: Partial<InsertAdquisicionItem>, companyId: string): Promise<AdquisicionItem | undefined> {
    // Si se actualizan cantidad o precioUnitario, recalcular precioTotal
    let updateData: any = { ...item, updatedAt: sql`now()` };
    
    if (item.cantidad !== undefined || item.precioUnitario !== undefined) {
      // Obtener item actual para calcular precioTotal
      const currentItem = await this.getAdquisicionItem(id, companyId);
      if (currentItem) {
        const cantidad = item.cantidad ?? currentItem.cantidad ?? 1;
        const precioUnitario = item.precioUnitario ?? currentItem.precioUnitario ?? 0;
        updateData.precioTotal = cantidad * precioUnitario;
      }
    }
    
    const [updated] = await db.update(schema.adquisicionItems)
      .set(updateData)
      .where(and(
        eq(schema.adquisicionItems.id, id),
        eq(schema.adquisicionItems.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteAdquisicionItem(id: string, companyId: string): Promise<void> {
    await db.delete(schema.adquisicionItems)
      .where(and(
        eq(schema.adquisicionItems.id, id),
        eq(schema.adquisicionItems.companyId, companyId)
      ));
  }

  async getResumenAdquisicionItems(companyId: string): Promise<{ porCategoria: Record<string, number>; gastoTotal: number; gastosPorCategoria: Record<string, number> }> {
    const items = await db.select()
      .from(schema.adquisicionItems)
      .where(eq(schema.adquisicionItems.companyId, companyId));
    
    const porCategoria: Record<string, number> = {};
    const gastosPorCategoria: Record<string, number> = {};
    let gastoTotal = 0;
    
    for (const item of items) {
      const categoria = item.categoria || 'otros';
      porCategoria[categoria] = (porCategoria[categoria] || 0) + 1;
      const gasto = item.precioTotal || 0;
      gastosPorCategoria[categoria] = (gastosPorCategoria[categoria] || 0) + gasto;
      gastoTotal += gasto;
    }
    
    return { porCategoria, gastoTotal, gastosPorCategoria };
  }

  async getResumenIntegradoEppAdquisiciones(companyId: string): Promise<{
    adquisiciones: { porCategoria: Record<string, number>; gastoTotal: number; gastosPorCategoria: Record<string, number>; totalItems: number; recursosVinculados: number };
    epp: { totalEntregas: number; trabajadoresConEpp: number; entregasPorCategoria: Record<string, number>; ultimasEntregas: { eppName: string; eppCategory: string; quantity: number; deliveryDate: string }[] };
    recursosFinancieros: { total: number; ejecutado: number; porcentajeEjecucion: number };
  }> {
    // Obtener items de adquisición
    const items = await db.select()
      .from(schema.adquisicionItems)
      .where(eq(schema.adquisicionItems.companyId, companyId));
    
    const porCategoria: Record<string, number> = {};
    const gastosPorCategoria: Record<string, number> = {};
    let gastoTotal = 0;
    let recursosVinculados = 0;
    
    for (const item of items) {
      const categoria = item.categoria || 'otros';
      porCategoria[categoria] = (porCategoria[categoria] || 0) + 1;
      const gasto = item.precioTotal || 0;
      gastosPorCategoria[categoria] = (gastosPorCategoria[categoria] || 0) + gasto;
      gastoTotal += gasto;
      if (item.resourceAllocationId) recursosVinculados++;
    }
    
    // Obtener entregas de EPP
    const eppEntregas = await db.select()
      .from(schema.eppDeliveries)
      .where(eq(schema.eppDeliveries.companyId, companyId))
      .orderBy(desc(schema.eppDeliveries.deliveryDate))
      .limit(10);
    
    const allEppEntregas = await db.select()
      .from(schema.eppDeliveries)
      .where(eq(schema.eppDeliveries.companyId, companyId));
    
    const entregasPorCategoria: Record<string, number> = {};
    const trabajadoresUnicos = new Set<string>();
    
    for (const entrega of allEppEntregas) {
      const categoria = entrega.eppCategory || 'otros';
      entregasPorCategoria[categoria] = (entregasPorCategoria[categoria] || 0) + 1;
      trabajadoresUnicos.add(entrega.workerId);
    }
    
    const ultimasEntregas = eppEntregas.map(e => ({
      eppName: e.eppName,
      eppCategory: e.eppCategory,
      quantity: e.quantity,
      deliveryDate: e.deliveryDate ? new Date(e.deliveryDate).toISOString() : ''
    }));
    
    // Obtener recursos financieros
    const recursos = await db.select()
      .from(schema.resourceAllocations)
      .where(and(
        eq(schema.resourceAllocations.companyId, companyId),
        eq(schema.resourceAllocations.resourceType, "financiero")
      ));
    
    let totalRecursos = 0;
    let ejecutadoRecursos = 0;
    
    for (const recurso of recursos) {
      const monto = parseInt(String(recurso.inversionEstimada || '0').replace(/[^\d]/g, ''), 10) || 0;
      const ejecutado = parseInt(String(recurso.montoEjecutado || '0').replace(/[^\d]/g, ''), 10) || 0;
      totalRecursos += monto;
      ejecutadoRecursos += ejecutado;
    }
    
    const porcentajeEjecucion = totalRecursos > 0 ? Math.round((ejecutadoRecursos / totalRecursos) * 100) : 0;
    
    return {
      adquisiciones: {
        porCategoria,
        gastoTotal,
        gastosPorCategoria,
        totalItems: items.length,
        recursosVinculados
      },
      epp: {
        totalEntregas: allEppEntregas.length,
        trabajadoresConEpp: trabajadoresUnicos.size,
        entregasPorCategoria,
        ultimasEntregas
      },
      recursosFinancieros: {
        total: totalRecursos,
        ejecutado: ejecutadoRecursos,
        porcentajeEjecucion
      }
    };
  }

  // Verificaciones de Adquisición methods
  async getVerificacionesAdquisicion(companyId: string): Promise<VerificacionAdquisicion[]> {
    return await db.select()
      .from(schema.verificacionesAdquisicion)
      .where(eq(schema.verificacionesAdquisicion.companyId, companyId))
      .orderBy(desc(schema.verificacionesAdquisicion.fechaVerificacion));
  }

  async getVerificacionAdquisicion(id: string, companyId: string): Promise<VerificacionAdquisicion | undefined> {
    const [verificacion] = await db.select()
      .from(schema.verificacionesAdquisicion)
      .where(and(
        eq(schema.verificacionesAdquisicion.id, id),
        eq(schema.verificacionesAdquisicion.companyId, companyId)
      ));
    return verificacion;
  }

  async getVerificacionesBySolicitud(solicitudId: string, companyId: string): Promise<VerificacionAdquisicion[]> {
    return await db.select()
      .from(schema.verificacionesAdquisicion)
      .where(and(
        eq(schema.verificacionesAdquisicion.solicitudId, solicitudId),
        eq(schema.verificacionesAdquisicion.companyId, companyId)
      ))
      .orderBy(desc(schema.verificacionesAdquisicion.fechaVerificacion));
  }

  async createVerificacionAdquisicion(verificacion: InsertVerificacionAdquisicion, companyId: string): Promise<VerificacionAdquisicion> {
    const [newVerificacion] = await db.insert(schema.verificacionesAdquisicion)
      .values({
        ...verificacion,
        companyId
      })
      .returning();
    return newVerificacion;
  }

  async updateVerificacionAdquisicion(id: string, verificacion: Partial<InsertVerificacionAdquisicion>, companyId: string): Promise<VerificacionAdquisicion | undefined> {
    const [updated] = await db.update(schema.verificacionesAdquisicion)
      .set(verificacion)
      .where(and(
        eq(schema.verificacionesAdquisicion.id, id),
        eq(schema.verificacionesAdquisicion.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteVerificacionAdquisicion(id: string, companyId: string): Promise<void> {
    await db.delete(schema.verificacionesAdquisicion)
      .where(and(
        eq(schema.verificacionesAdquisicion.id, id),
        eq(schema.verificacionesAdquisicion.companyId, companyId)
      ));
  }

  // Dashboard y estadísticas de Adquisiciones
  async getDashboardAdquisiciones(companyId: string): Promise<{
    totalSolicitudes: number;
    solicitudesPorEstado: Record<string, number>;
    solicitudesPorTipo: Record<string, number>;
    solicitudesPorNivelRiesgo: Record<string, number>;
    evaluacionesPendientes: number;
    aprobadas: number;
    rechazadas: number;
    enEvaluacion: number;
    presupuestoTotal: number;
  }> {
    const solicitudes = await this.getSolicitudesAdquisicion(companyId);
    const evaluaciones = await this.getEvaluacionesAdquisicion(companyId);
    
    // Total de solicitudes
    const totalSolicitudes = solicitudes.length;
    
    // Solicitudes por estado
    const solicitudesPorEstado: Record<string, number> = {};
    solicitudes.forEach(s => {
      solicitudesPorEstado[s.estado] = (solicitudesPorEstado[s.estado] || 0) + 1;
    });
    
    // Solicitudes por tipo
    const solicitudesPorTipo: Record<string, number> = {};
    solicitudes.forEach(s => {
      solicitudesPorTipo[s.tipoAdquisicion] = (solicitudesPorTipo[s.tipoAdquisicion] || 0) + 1;
    });
    
    // Solicitudes por nivel de riesgo
    const solicitudesPorNivelRiesgo: Record<string, number> = {};
    solicitudes.forEach(s => {
      solicitudesPorNivelRiesgo[s.nivelRiesgo] = (solicitudesPorNivelRiesgo[s.nivelRiesgo] || 0) + 1;
    });
    
    // Evaluaciones pendientes (solicitudes que requieren evaluación pero no tienen evaluación)
    const solicitudesConEvaluacion = new Set(evaluaciones.map(e => e.solicitudId));
    const evaluacionesPendientes = solicitudes.filter(s => 
      s.requiereEvaluacion === 1 && !solicitudesConEvaluacion.has(s.id)
    ).length;
    
    // Aprobadas (evaluaciones con resultado aprobado o aprobado_condiciones)
    const aprobadas = evaluaciones.filter(e => 
      e.resultado === 'aprobado' || e.resultado === 'aprobado_condiciones'
    ).length;
    
    // Rechazadas (evaluaciones con resultado rechazado)
    const rechazadas = evaluaciones.filter(e => e.resultado === 'rechazado').length;
    
    // En evaluación (evaluaciones que requieren controles adicionales)
    const enEvaluacion = evaluaciones.filter(e => e.resultado === 'requiere_controles').length;
    
    // Presupuesto total
    const presupuestoTotal = solicitudes.reduce((sum, s) => 
      sum + (s.presupuestoEstimado || 0), 0
    );
    
    return {
      totalSolicitudes,
      solicitudesPorEstado,
      solicitudesPorTipo,
      solicitudesPorNivelRiesgo,
      evaluacionesPendientes,
      aprobadas,
      rechazadas,
      enEvaluacion,
      presupuestoTotal
    };
  }

  // ========================================
  // Dashboard HACER - Controles Operacionales
  // ========================================
  async getDashboardHacer(companyId: string, year: number = new Date().getFullYear()): Promise<{
    totalInspecciones: number;
    peligrosVinculados: number;
    controlState: {
      conforme: number;
      noConforme: number;
      observacion: number;
    };
    trabajadoresConRiesgos: number;
    peligrosIdentificados: number;
    controlesPendientesVerificacion: number;
    porcentajeConformidad: number;
  }> {
    // Get all relevant data
    const inspections = await this.getInspections(companyId);
    const vinculos = await this.getAllInspeccionesPeligrosVinculados(companyId);
    const asignaciones = await this.getAllPeligrosAsignacion(companyId);
    
    // Get ALL active matrices IPERC to count identified risks
    const matrices = await this.getMatricesIperc(companyId);
    const matricesActivas = matrices.filter(m => m.estado === 'vigente' || m.estado === 'aprobada');
    let peligrosIdentificados = 0;
    for (const matriz of matricesActivas) {
      const peligros = await this.getPeligrosIperc(matriz.id, companyId);
      peligrosIdentificados += peligros.length;
    }
    
    // Total inspections
    const totalInspecciones = inspections.length;
    
    // Linked hazards count (unique peligroId)
    const peligrosVinculadosSet = new Set(vinculos.map(v => v.peligroId));
    const peligrosVinculados = peligrosVinculadosSet.size;
    
    // Control state distribution
    const controlState = {
      conforme: vinculos.filter(v => v.estadoControl === 'conforme').length,
      noConforme: vinculos.filter(v => v.estadoControl === 'no-conforme').length,
      observacion: vinculos.filter(v => v.estadoControl === 'observacion').length,
    };
    
    // Workers with assigned risks - combine peligros assignments AND high risk workers
    const asignacionesCount = asignaciones.filter(a => a.department || a.position).length;
    
    // Also count unique workers from high_risk_workers table
    const highRiskWorkers = await this.getHighRiskWorkers(companyId);
    const uniqueHighRiskWorkerIds = new Set(highRiskWorkers.map(w => w.workerId));
    const trabajadoresConRiesgos = asignacionesCount + uniqueHighRiskWorkerIds.size;
    
    // Controls pending verification (identified risks not yet linked to inspections)
    const controlesPendientesVerificacion = Math.max(0, peligrosIdentificados - peligrosVinculados);
    
    // Compliance percentage
    const totalControlesVerificados = vinculos.length;
    const porcentajeConformidad = totalControlesVerificados > 0
      ? Math.round((controlState.conforme / totalControlesVerificados) * 100)
      : 0;
    
    return {
      totalInspecciones,
      peligrosVinculados,
      controlState,
      trabajadoresConRiesgos,
      peligrosIdentificados,
      controlesPendientesVerificacion,
      porcentajeConformidad
    };
  }

  // ========================================
  // Dashboard VERIFICAR - Indicadores SG-SST
  // ========================================
  async getDashboardVerificar(companyId: string, year: number = new Date().getFullYear()): Promise<{
    objetivos: {
      total: number;
      activos: number;
      cumplidos: number;
      noCumplidos: number;
      porcentajeCumplimiento: number;
      // Campos adicionales (Add-Only - Decreto 1072/2015)
      promedioAvance: number;
      completadosPorAvance: number;
    };
    indicadores: {
      total: number;
      estructura: number;
      proceso: number;
      resultado: number;
      ultimasMediciones: number;
    };
    auditorias: {
      totalAnio: number;
      completadas: number;
      enCurso: number;
      programadas: number;
      hallazgosPorSeveridad: {
        baja: number;
        media: number;
        alta: number;
        critica: number;
      };
      porcentajeConformidad: number;
    };
    revisiones: {
      totalAnio: number;
      completadas: number;
      enEjecucion: number;
      programadas: number;
      decisionesTomadas: number;
      accionesPendientes: number;
    };
    cumplimientoNormativo: {
      ultimaEvaluacion: number | null;
      fechaUltimaEvaluacion: string | null;
      estandaresCriticos: number;
      estandaresCumplidos: number;
    };
    accidentalidad: {
      totalAccidentes: number;
      accidentesUltimoMes: number;
      tendenciaMensual: Array<{ mes: string; cantidad: number }>;
    };
  }> {
    const currentYear = year;
    const currentMonth = new Date().getMonth();

    // ========== OBJETIVOS SST ==========
    const allObjetivos = await db.select()
      .from(schema.objetivosSst)
      .where(and(
        eq(schema.objetivosSst.companyId, companyId),
        eq(schema.objetivosSst.anio, currentYear)
      ));

    const cumplidos = allObjetivos.filter(o => o.estado === 'cumplido').length;
    const objetivos = {
      total: allObjetivos.length,
      activos: allObjetivos.filter(o => o.estado === 'activo').length,
      cumplidos: cumplidos,
      // No Cumplidos = Total - Cumplidos (objetivos que aún no alcanzan el 100%)
      noCumplidos: allObjetivos.length - cumplidos,
      porcentajeCumplimiento: allObjetivos.length > 0
        ? Math.round((cumplidos / allObjetivos.length) * 100)
        : 0,
      // ========== CAMPOS ADICIONALES (Add-Only - Decreto 1072/2015) ==========
      // Promedio de avance basado en porcentajeAvance de cada objetivo
      promedioAvance: allObjetivos.length > 0
        ? Math.round(allObjetivos.reduce((sum, o) => sum + (o.porcentajeAvance || 0), 0) / allObjetivos.length)
        : 0,
      // Objetivos con avance >= 100% (completados por avance)
      completadosPorAvance: allObjetivos.filter(o => (o.porcentajeAvance || 0) >= 100).length
    };

    // ========== INDICADORES SST ==========
    const allIndicadores = await db.select()
      .from(schema.indicadoresSst)
      .where(and(
        eq(schema.indicadoresSst.companyId, companyId),
        eq(schema.indicadoresSst.activo, 1)
      ));

    // Count last month's measurements
    const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfLastMonth = new Date(currentYear, currentMonth, 0);
    const recentMediciones = await db.select()
      .from(schema.medicionesIndicadores)
      .where(and(
        eq(schema.medicionesIndicadores.companyId, companyId),
        sql`${schema.medicionesIndicadores.fechaMedicion} >= ${startOfLastMonth.toISOString().split('T')[0]}`,
        sql`${schema.medicionesIndicadores.fechaMedicion} <= ${endOfLastMonth.toISOString().split('T')[0]}`
      ));

    const indicadores = {
      total: allIndicadores.length,
      estructura: allIndicadores.filter(i => i.tipo === 'estructura').length,
      proceso: allIndicadores.filter(i => i.tipo === 'proceso').length,
      resultado: allIndicadores.filter(i => i.tipo === 'resultado').length,
      ultimasMediciones: recentMediciones.length
    };

    // ========== AUDITORÍAS INTERNAS ==========
    const startOfYear = new Date(currentYear, 0, 1);
    const allAuditorias = await db.select()
      .from(schema.auditoriasInternas)
      .where(and(
        eq(schema.auditoriasInternas.companyId, companyId),
        sql`${schema.auditoriasInternas.fechaProgramada} >= ${startOfYear.toISOString().split('T')[0]}`
      ));

    // Get hallazgos for severity breakdown
    const hallazgosAuditorias = await db.select()
      .from(schema.hallazgosAuditoria)
      .where(eq(schema.hallazgosAuditoria.companyId, companyId));

    const hallazgosPorSeveridad = {
      baja: hallazgosAuditorias.filter(h => h.severidad === 'baja').length,
      media: hallazgosAuditorias.filter(h => h.severidad === 'media').length,
      alta: hallazgosAuditorias.filter(h => h.severidad === 'alta').length,
      critica: hallazgosAuditorias.filter(h => h.severidad === 'critica').length
    };

    const auditoriasCompletadas = allAuditorias.filter(a => 
      a.estado === 'completada' || a.estado === 'aprobada'
    );
    
    // Promedio del porcentaje de cumplimiento de auditorías completadas
    const totalPorcentaje = auditoriasCompletadas.reduce((sum, a) => 
      sum + (a.porcentajeCumplimiento || 0), 0
    );
    const promedioCumplimiento = auditoriasCompletadas.length > 0
      ? Math.round(totalPorcentaje / auditoriasCompletadas.length)
      : 0;

    const auditorias = {
      totalAnio: allAuditorias.length,
      completadas: auditoriasCompletadas.length,
      enCurso: allAuditorias.filter(a => a.estado === 'en_progreso').length,
      programadas: allAuditorias.filter(a => a.estado === 'programada').length,
      hallazgosPorSeveridad,
      porcentajeConformidad: promedioCumplimiento
    };

    // ========== REVISIONES POR DIRECCIÓN ==========
    const allRevisiones = await db.select()
      .from(schema.revisionesDireccion)
      .where(and(
        eq(schema.revisionesDireccion.companyId, companyId),
        sql`${schema.revisionesDireccion.fechaRevision} >= ${startOfYear.toISOString().split('T')[0]}`
      ));

    const decisionesCount = await db.select()
      .from(schema.decisionesRevision)
      .where(eq(schema.decisionesRevision.companyId, companyId));

    const accionesCount = await db.select()
      .from(schema.accionesRevision)
      .where(and(
        eq(schema.accionesRevision.companyId, companyId),
        or(
          eq(schema.accionesRevision.estado, 'pendiente'),
          eq(schema.accionesRevision.estado, 'en-proceso')
        )
      ));

    const revisiones = {
      totalAnio: allRevisiones.length,
      completadas: allRevisiones.filter(r => r.estado === 'completada' || r.estado === 'aprobada').length,
      enEjecucion: allRevisiones.filter(r => r.estado === 'en_ejecucion').length,
      programadas: allRevisiones.filter(r => r.estado === 'programada').length,
      decisionesTomadas: decisionesCount.length,
      accionesPendientes: accionesCount.length
    };

    // ========== CUMPLIMIENTO NORMATIVO ==========
    const lastEvaluation = await db.select()
      .from(schema.sstEvaluations)
      .where(and(
        eq(schema.sstEvaluations.companyId, companyId),
        eq(schema.sstEvaluations.status, 'completada')
      ))
      .orderBy(desc(schema.sstEvaluations.evaluationDate))
      .limit(1);

    const evaluationItems = lastEvaluation.length > 0
      ? await db.select()
          .from(schema.sstEvaluationItems)
          .where(eq(schema.sstEvaluationItems.evaluationId, lastEvaluation[0].id))
      : [];

    const cumplimientoNormativo = {
      ultimaEvaluacion: lastEvaluation.length > 0 ? lastEvaluation[0].compliancePercentage : null,
      fechaUltimaEvaluacion: lastEvaluation.length > 0 
        ? lastEvaluation[0].evaluationDate || null
        : null,
      estandaresCriticos: evaluationItems.filter(item => item.score === 0).length,
      estandaresCumplidos: evaluationItems.filter(item => 
        item.score !== null && item.score > 0
      ).length
    };

    // ========== ACCIDENTALIDAD ==========
    const accidentsThisYear = await db.select()
      .from(schema.accidents)
      .where(and(
        eq(schema.accidents.companyId, companyId),
        sql`${schema.accidents.date} >= ${startOfYear.toISOString().split('T')[0]}`
      ));

    const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
    const accidentsThisMonth = accidentsThisYear.filter(a => 
      new Date(a.date) >= startOfCurrentMonth
    );

    // Monthly trend (last 6 months)
    const tendenciaMensual: Array<{ mes: string; cantidad: number }> = [];
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    for (let i = 5; i >= 0; i--) {
      const targetMonth = currentMonth - i;
      const targetYear = targetMonth < 0 ? currentYear - 1 : currentYear;
      const adjustedMonth = targetMonth < 0 ? targetMonth + 12 : targetMonth;
      
      const monthStart = new Date(targetYear, adjustedMonth, 1);
      const monthEnd = new Date(targetYear, adjustedMonth + 1, 0);
      
      const accidentsInMonth = accidentsThisYear.filter(a => {
        const accidentDate = new Date(a.date);
        return accidentDate >= monthStart && accidentDate <= monthEnd;
      }).length;
      
      tendenciaMensual.push({
        mes: monthNames[adjustedMonth],
        cantidad: accidentsInMonth
      });
    }

    const accidentalidad = {
      totalAccidentes: accidentsThisYear.length,
      accidentesUltimoMes: accidentsThisMonth.length,
      tendenciaMensual
    };

    return {
      objetivos,
      indicadores,
      auditorias,
      revisiones,
      cumplimientoNormativo,
      accidentalidad
    };
  }

  // ========================================
  // Dashboard ACTUAR - Eficacia de Acciones Correctivas/Preventivas
  // ========================================
  async getDashboardActuar(companyId: string, year: number = new Date().getFullYear()): Promise<{
    accionesMejora: {
      total: number;
      completadas: number;
      enProceso: number;
      pendientes: number;
      vencidas: number;
      porcentajeCompletitud: number;
      eficacia: {
        eficaces: number;
        noEficaces: number;
        noVerificadas: number;
        porcentajeEficacia: number;
      };
      porPrioridad: {
        baja: number;
        media: number;
        alta: number;
        critica: number;
      };
      promedioAvance: number;
    };
    accionesRevision: {
      total: number;
      completadas: number;
      enProceso: number;
      pendientes: number;
      vencidas: number;
      porcentajeCompletitud: number;
      eficacia: {
        eficaces: number;
        noEficaces: number;
        noVerificadas: number;
        porcentajeEficacia: number;
      };
      porPrioridad: {
        baja: number;
        media: number;
        alta: number;
        critica: number;
      };
      promedioAvance: number;
    };
    planTrabajo: {
      porcentajeCumplimiento: number;
      actividadesCompletadas: number;
      totalActividades: number;
    };
    consolidado: {
      totalAcciones: number;
      tasaCompletitud: number;
      tasaEficacia: number;
      accionesVencidasTotal: number;
    };
  }> {
    const today = new Date().toISOString().split('T')[0];

    // ========== ACCIONES DE MEJORA (from SST Evaluations) ==========
    const allEvaluaciones = await db.select()
      .from(schema.evaluacionesSst)
      .where(eq(schema.evaluacionesSst.companyId, companyId));
    
    const evaluacionIds = allEvaluaciones.map(e => e.id);
    
    const accionesMejoraData = evaluacionIds.length > 0
      ? await db.select()
          .from(schema.accionesMejora)
          .where(sql`${schema.accionesMejora.evaluacionId} IN ${sql.raw(`(${evaluacionIds.map(id => `'${id}'`).join(',')})`)}`)
      : [];
    
    const totalAccionesMejora = accionesMejoraData.length;
    const completadasMejora = accionesMejoraData.filter(a => a.estado === 'completada').length;
    const enProcesoMejora = accionesMejoraData.filter(a => a.estado === 'en-proceso').length;
    const pendientesMejora = accionesMejoraData.filter(a => a.estado === 'pendiente').length;
    // FIX 1: Null-safe overdue detection - only count as vencida if fechaCompromiso exists and is past
    const vencidasMejora = accionesMejoraData.filter(a => 
      a.estado !== 'completada' && 
      a.fechaCompromiso !== null &&
      a.fechaCompromiso < today
    ).length;
    
    const eficacesMejora = accionesMejoraData.filter(a => a.eficaz === 1).length;
    const noEficacesMejora = accionesMejoraData.filter(a => a.eficaz === 0).length;
    const noVerificadasMejora = accionesMejoraData.filter(a => a.eficaz === null).length;
    
    const bajaP = accionesMejoraData.filter(a => a.prioridad === 'baja').length;
    const mediaP = accionesMejoraData.filter(a => a.prioridad === 'media').length;
    const altaP = accionesMejoraData.filter(a => a.prioridad === 'alta').length;
    const criticaP = accionesMejoraData.filter(a => a.prioridad === 'critica').length;
    
    // FIX: Calculate avance based on estado - completada=100%, en-proceso=porcentajeAvance, pendiente=0%
    const promedioAvanceMejora = totalAccionesMejora > 0
      ? Math.round(accionesMejoraData.reduce((sum, a) => {
          if (a.estado === 'completada') return sum + 100;
          if (a.estado === 'en-proceso') return sum + (a.porcentajeAvance ?? 0);
          return sum; // pendiente = 0
        }, 0) / totalAccionesMejora)
      : 0;
    
    const accionesMejora = {
      total: totalAccionesMejora,
      completadas: completadasMejora,
      enProceso: enProcesoMejora,
      pendientes: pendientesMejora,
      vencidas: vencidasMejora,
      porcentajeCompletitud: totalAccionesMejora > 0
        ? Math.round((completadasMejora / totalAccionesMejora) * 100)
        : 0,
      eficacia: {
        eficaces: eficacesMejora,
        noEficaces: noEficacesMejora,
        noVerificadas: noVerificadasMejora,
        porcentajeEficacia: eficacesMejora + noEficacesMejora > 0
          ? Math.round((eficacesMejora / (eficacesMejora + noEficacesMejora)) * 100)
          : 0
      },
      porPrioridad: {
        baja: bajaP,
        media: mediaP,
        alta: altaP,
        critica: criticaP
      },
      promedioAvance: promedioAvanceMejora
    };

    // ========== ACCIONES DE REVISIÓN (from Management Reviews) ==========
    const allRevisiones = await db.select()
      .from(schema.revisionesDireccion)
      .where(eq(schema.revisionesDireccion.companyId, companyId));
    
    const revisionIds = allRevisiones.map(r => r.id);
    
    const allDecisiones = revisionIds.length > 0
      ? await db.select()
          .from(schema.decisionesRevision)
          .where(sql`${schema.decisionesRevision.revisionId} IN ${sql.raw(`(${revisionIds.map(id => `'${id}'`).join(',')})`)}`)
      : [];
    
    const decisionIds = allDecisiones.map(d => d.id);
    
    const accionesRevisionData = decisionIds.length > 0
      ? await db.select()
          .from(schema.accionesRevision)
          .where(sql`${schema.accionesRevision.decisionId} IN ${sql.raw(`(${decisionIds.map(id => `'${id}'`).join(',')})`)}`)
      : [];
    
    const totalAccionesRevision = accionesRevisionData.length;
    // FIX 2: Align status enums with schema - use 'completada' not 'completado', 'en-proceso' not 'en_proceso'
    const completadasRevision = accionesRevisionData.filter(a => a.estado === 'completada').length;
    const enProcesoRevision = accionesRevisionData.filter(a => a.estado === 'en-proceso').length;
    const pendientesRevision = accionesRevisionData.filter(a => a.estado === 'pendiente').length;
    // FIX 1: Null-safe overdue detection - only count as vencida if fechaCompromiso exists and is past
    const vencidasRevision = accionesRevisionData.filter(a => 
      a.estado !== 'completada' && 
      a.fechaCompromiso !== null &&
      a.fechaCompromiso < today
    ).length;
    
    const eficacesRevision = accionesRevisionData.filter(a => a.eficaz === 1).length;
    const noEficacesRevision = accionesRevisionData.filter(a => a.eficaz === 0).length;
    const noVerificadasRevision = accionesRevisionData.filter(a => a.eficaz === null).length;
    
    const bajaPR = accionesRevisionData.filter(a => a.prioridad === 'baja').length;
    const mediaPR = accionesRevisionData.filter(a => a.prioridad === 'media').length;
    const altaPR = accionesRevisionData.filter(a => a.prioridad === 'alta').length;
    const criticaPR = accionesRevisionData.filter(a => a.prioridad === 'critica').length;
    
    // FIX: Calculate avance based on estado - completada=100%, en-proceso=porcentajeAvance, pendiente=0%
    const promedioAvanceRevision = totalAccionesRevision > 0
      ? Math.round(accionesRevisionData.reduce((sum, a) => {
          if (a.estado === 'completada') return sum + 100;
          if (a.estado === 'en-proceso') return sum + (a.porcentajeAvance ?? 0);
          return sum; // pendiente = 0
        }, 0) / totalAccionesRevision)
      : 0;
    
    const accionesRevision = {
      total: totalAccionesRevision,
      completadas: completadasRevision,
      enProceso: enProcesoRevision,
      pendientes: pendientesRevision,
      vencidas: vencidasRevision,
      porcentajeCompletitud: totalAccionesRevision > 0
        ? Math.round((completadasRevision / totalAccionesRevision) * 100)
        : 0,
      eficacia: {
        eficaces: eficacesRevision,
        noEficaces: noEficacesRevision,
        noVerificadas: noVerificadasRevision,
        porcentajeEficacia: eficacesRevision + noEficacesRevision > 0
          ? Math.round((eficacesRevision / (eficacesRevision + noEficacesRevision)) * 100)
          : 0
      },
      porPrioridad: {
        baja: bajaPR,
        media: mediaPR,
        alta: altaPR,
        critica: criticaPR
      },
      promedioAvance: promedioAvanceRevision
    };

    // ========== PLAN DE TRABAJO ANUAL ==========
    const currentYear = year;
    const [planTrabajo] = await db.select()
      .from(schema.planesTrabajoAnual)
      .where(and(
        eq(schema.planesTrabajoAnual.companyId, companyId),
        eq(schema.planesTrabajoAnual.anio, currentYear)
      ));
    
    const planData = planTrabajo
      ? {
          porcentajeCumplimiento: planTrabajo.porcentajeCumplimiento ?? 0,
          actividadesCompletadas: planTrabajo.actividadesCompletadas ?? 0,
          totalActividades: planTrabajo.totalActividades ?? 0
        }
      : {
          porcentajeCumplimiento: 0,
          actividadesCompletadas: 0,
          totalActividades: 0
        };

    // ========== CONSOLIDADO ==========
    const totalAcciones = totalAccionesMejora + totalAccionesRevision;
    const totalCompletadas = completadasMejora + completadasRevision;
    const totalEficaces = eficacesMejora + eficacesRevision;
    // FIX 3: Only include verified actions (exclude nulls) in efficacy calculation to avoid NaN
    const totalEvaluadas = eficacesMejora + noEficacesMejora + eficacesRevision + noEficacesRevision;
    
    const consolidado = {
      totalAcciones,
      tasaCompletitud: totalAcciones > 0
        ? Math.round((totalCompletadas / totalAcciones) * 100)
        : 0,
      tasaEficacia: totalEvaluadas > 0
        ? Math.round((totalEficaces / totalEvaluadas) * 100)
        : 0,
      accionesVencidasTotal: vencidasMejora + vencidasRevision
    };

    return {
      accionesMejora,
      accionesRevision,
      planTrabajo: planData,
      consolidado
    };
  }

  // ========================================
  // Comunicación SST methods
  // ========================================
  
  // Plan de Comunicación SST methods
  async getPlanComunicacionSst(companyId: string): Promise<PlanComunicacionSst[]> {
    return await db.select()
      .from(schema.planComunicacionSst)
      .where(eq(schema.planComunicacionSst.companyId, companyId))
      .orderBy(desc(schema.planComunicacionSst.fechaElaboracion));
  }

  async getPlanComunicacionVigente(companyId: string): Promise<PlanComunicacionSst | undefined> {
    const [plan] = await db.select()
      .from(schema.planComunicacionSst)
      .where(and(
        eq(schema.planComunicacionSst.companyId, companyId),
        eq(schema.planComunicacionSst.estado, "vigente")
      ));
    return plan;
  }

  async createPlanComunicacionSst(plan: InsertPlanComunicacionSst, companyId: string, userId: string): Promise<PlanComunicacionSst> {
    const [newPlan] = await db.insert(schema.planComunicacionSst)
      .values({
        ...plan,
        companyId
      })
      .returning();
    
    // Registrar auditoría
    await this.registrarAuditoria({
      entidad: 'plan',
      entidadId: newPlan.id,
      accion: 'crear',
      userId: userId,
      descripcion: `Plan de comunicación SST creado: v${newPlan.version}`,
      valorNuevo: JSON.stringify({ version: newPlan.version, estado: newPlan.estado })
    }, companyId);
    
    return newPlan;
  }

  async updatePlanComunicacionSst(id: string, plan: Partial<InsertPlanComunicacionSst>, companyId: string, userId: string): Promise<PlanComunicacionSst | undefined> {
    const [updated] = await db.update(schema.planComunicacionSst)
      .set({
        ...plan,
        updatedAt: sql`now()`
      })
      .where(and(
        eq(schema.planComunicacionSst.id, id),
        eq(schema.planComunicacionSst.companyId, companyId)
      ))
      .returning();
    
    // Registrar auditoría
    if (updated) {
      await this.registrarAuditoria({
        entidad: 'plan',
        entidadId: updated.id,
        accion: 'editar',
        userId: userId,
        descripcion: `Plan de comunicación SST actualizado: v${updated.version}`,
        valorNuevo: JSON.stringify(plan)
      }, companyId);
    }
    
    return updated;
  }

  // Comunicaciones SST methods
  async getComunicacionesSst(companyId: string): Promise<ComunicacionSst[]> {
    return await db.select()
      .from(schema.comunicacionesSst)
      .where(eq(schema.comunicacionesSst.companyId, companyId))
      .orderBy(desc(schema.comunicacionesSst.fechaEnvio));
  }

  async getComunicacionSstById(id: string, companyId: string): Promise<ComunicacionSst | undefined> {
    const [comunicacion] = await db.select()
      .from(schema.comunicacionesSst)
      .where(and(
        eq(schema.comunicacionesSst.id, id),
        eq(schema.comunicacionesSst.companyId, companyId)
      ));
    return comunicacion;
  }

  async getComunicacionesForUser(userId: string, companyId: string): Promise<(ComunicacionSst & { fechaLecturaConfirmada: Date | null })[]> {
    // Primero obtener el workerId del usuario
    const user = await db.select({ workerId: schema.users.workerId })
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);
    
    if (!user || !user[0] || !user[0].workerId) {
      // Si el usuario no tiene workerId asociado, no puede ver comunicaciones de trabajadores
      return [];
    }
    
    const workerId = user[0].workerId;
    
    // Obtener comunicaciones con su estado de lectura usando JOIN
    const result = await db
      .select({
        comunicacion: schema.comunicacionesSst,
        fechaLecturaConfirmada: schema.lecturasComunicacion.fechaLectura
      })
      .from(schema.lecturasComunicacion)
      .innerJoin(
        schema.comunicacionesSst,
        eq(schema.lecturasComunicacion.comunicacionId, schema.comunicacionesSst.id)
      )
      .where(and(
        eq(schema.lecturasComunicacion.workerId, workerId),
        eq(schema.lecturasComunicacion.companyId, companyId)
      ))
      .orderBy(desc(schema.comunicacionesSst.fechaEnvio));
    
    // Mapear resultados para incluir fechaLecturaConfirmada en cada comunicación
    return result.map(r => ({
      ...r.comunicacion,
      fechaLecturaConfirmada: r.fechaLecturaConfirmada
    }));
  }

  async createComunicacionSst(comunicacion: InsertComunicacionSst, companyId: string, userId: string, trabajadoresDestinatarios?: string[]): Promise<ComunicacionSst> {
    const destinatarios = trabajadoresDestinatarios || [];
    
    const [newComunicacion] = await db.insert(schema.comunicacionesSst)
      .values({
        ...comunicacion,
        companyId,
        enviadoPor: userId,
        totalDestinatarios: destinatarios.length,
        totalLecturas: 0
      })
      .returning();
    
    // Crear registros de lectura para cada trabajador destinatario
    if (destinatarios.length > 0) {
      const lecturasData = destinatarios.map(trabajadorId => ({
        comunicacionId: newComunicacion.id,
        workerId: trabajadorId, // Usamos workerId porque destinatarios son IDs de workers
        companyId: companyId
      }));
      
      await db.insert(schema.lecturasComunicacion)
        .values(lecturasData);
    }
    
    // Registrar auditoría
    await this.registrarAuditoria({
      entidad: 'comunicacion',
      entidadId: newComunicacion.id,
      accion: 'enviar',
      userId: userId,
      descripcion: `Comunicación enviada: ${newComunicacion.asunto} (${newComunicacion.tipo})`,
      valorNuevo: JSON.stringify({ asunto: newComunicacion.asunto, tipo: newComunicacion.tipo })
    }, companyId);
    
    return newComunicacion;
  }

  async updateComunicacionSst(id: string, comunicacion: Partial<InsertComunicacionSst>, companyId: string, userId: string): Promise<ComunicacionSst | undefined> {
    const [updated] = await db.update(schema.comunicacionesSst)
      .set(comunicacion)
      .where(and(
        eq(schema.comunicacionesSst.id, id),
        eq(schema.comunicacionesSst.companyId, companyId)
      ))
      .returning();
    
    // Registrar auditoría
    if (updated) {
      await this.registrarAuditoria({
        entidad: 'comunicacion',
        entidadId: updated.id,
        accion: 'editar',
        userId: userId,
        descripcion: `Comunicación actualizada: ${updated.asunto}`,
        valorNuevo: JSON.stringify(comunicacion)
      }, companyId);
    }
    
    return updated;
  }

  async deleteComunicacionSst(id: string, companyId: string, userId: string): Promise<void> {
    // Registrar auditoría antes de eliminar
    await this.registrarAuditoria({
      entidad: 'comunicacion',
      entidadId: id,
      accion: 'eliminar',
      userId: userId,
      descripcion: `Comunicación eliminada`
    }, companyId);
    
    await db.delete(schema.comunicacionesSst)
      .where(and(
        eq(schema.comunicacionesSst.id, id),
        eq(schema.comunicacionesSst.companyId, companyId)
      ));
  }

  async incrementarLecturasComunicacion(comunicacionId: string, companyId: string): Promise<void> {
    await db.update(schema.comunicacionesSst)
      .set({
        totalLecturas: sql`${schema.comunicacionesSst.totalLecturas} + 1`
      })
      .where(and(
        eq(schema.comunicacionesSst.id, comunicacionId),
        eq(schema.comunicacionesSst.companyId, companyId)
      ));
  }

  // Lecturas de Comunicación methods
  async getLecturasComunicacion(comunicacionId: string, companyId: string): Promise<LecturaComunicacion[]> {
    return await db.select()
      .from(schema.lecturasComunicacion)
      .where(and(
        eq(schema.lecturasComunicacion.comunicacionId, comunicacionId),
        eq(schema.lecturasComunicacion.companyId, companyId)
      ))
      .orderBy(desc(schema.lecturasComunicacion.fechaLectura));
  }

  async createLecturaComunicacion(lectura: InsertLecturaComunicacion, companyId: string, userId: string): Promise<LecturaComunicacion> {
    const [newLectura] = await db.insert(schema.lecturasComunicacion)
      .values({
        ...lectura,
        companyId,
        trabajadorId: userId
      })
      .returning();
    
    // Registrar auditoría
    await this.registrarAuditoria({
      entidad: 'lectura',
      entidadId: newLectura.id,
      accion: 'confirmar_lectura',
      userId: userId,
      descripcion: `Lectura de comunicación confirmada`
    }, companyId);
    
    return newLectura;
  }

  async confirmarLecturaComunicacion(comunicacionId: string, workerId: string | null, companyId: string, userId: string): Promise<boolean> {
    // Buscar la lectura existente
    const [lectura] = await db.select()
      .from(schema.lecturasComunicacion)
      .where(and(
        eq(schema.lecturasComunicacion.comunicacionId, comunicacionId),
        eq(schema.lecturasComunicacion.companyId, companyId),
        workerId ? eq(schema.lecturasComunicacion.workerId, workerId) : eq(schema.lecturasComunicacion.userId, userId)
      ));

    if (!lectura) {
      return false;
    }

    // Solo incrementar contador si no había sido leído antes
    const wasNotReadBefore = !lectura.fechaLectura;

    // Actualizar fecha_lectura
    await db.update(schema.lecturasComunicacion)
      .set({ fechaLectura: new Date() })
      .where(eq(schema.lecturasComunicacion.id, lectura.id));

    // Incrementar contador de lecturas en la comunicación solo si es primera confirmación
    if (wasNotReadBefore) {
      await this.incrementarLecturasComunicacion(comunicacionId, companyId);
    }

    // Registrar en trazabilidad
    await this.registrarAuditoria({
      entidad: 'comunicacion',
      entidadId: comunicacionId,
      accion: 'confirmar_lectura',
      userId: userId,
      descripcion: `Trabajador confirmó lectura de comunicación`
    }, companyId);

    return true;
  }

  // Reportes de Trabajadores methods
  async getReportesTrabajadores(companyId: string): Promise<ReporteTrabajador[]> {
    return await db.select()
      .from(schema.reportesTrabajadores)
      .where(eq(schema.reportesTrabajadores.companyId, companyId))
      .orderBy(desc(schema.reportesTrabajadores.createdAt));
  }

  async getReporteTrabajadorById(id: string, companyId: string): Promise<ReporteTrabajador | undefined> {
    const [reporte] = await db.select()
      .from(schema.reportesTrabajadores)
      .where(and(
        eq(schema.reportesTrabajadores.id, id),
        eq(schema.reportesTrabajadores.companyId, companyId)
      ));
    return reporte;
  }

  async getReportesForUser(userId: string, companyId: string): Promise<ReporteTrabajador[]> {
    return await db.select()
      .from(schema.reportesTrabajadores)
      .where(and(
        eq(schema.reportesTrabajadores.reportadoPor, userId),
        eq(schema.reportesTrabajadores.companyId, companyId)
      ))
      .orderBy(desc(schema.reportesTrabajadores.createdAt));
  }

  async createReporteTrabajador(reporte: InsertReporteTrabajador, companyId: string, userId: string): Promise<ReporteTrabajador> {
    // Generar código único de reporte basado en el máximo existente (evita duplicados por eliminaciones)
    const year = new Date().getFullYear();
    const yearPattern = `-${year}`;
    
    // Obtener el máximo número de código para este año y empresa
    const existingReportes = await db.select({ codigo: schema.reportesTrabajadores.codigo })
      .from(schema.reportesTrabajadores)
      .where(and(
        eq(schema.reportesTrabajadores.companyId, companyId),
        sql`${schema.reportesTrabajadores.codigo} LIKE '%' || ${yearPattern}`
      ));
    
    let maxNumber = 0;
    for (const r of existingReportes) {
      // Extraer número del código REP-XXX-YYYY
      const match = r.codigo.match(/REP-(\d+)-\d{4}/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNumber) maxNumber = num;
      }
    }
    
    const codigo = `REP-${String(maxNumber + 1).padStart(3, '0')}-${year}`;
    
    const [newReporte] = await db.insert(schema.reportesTrabajadores)
      .values({
        ...reporte,
        companyId,
        codigo
      })
      .returning();
    
    // Registrar auditoría
    await this.registrarAuditoria({
      entidad: 'reporte',
      entidadId: newReporte.id,
      accion: 'crear',
      userId: userId,
      descripcion: `Reporte trabajador creado: ${newReporte.categoria} (${newReporte.prioridad})`,
      valorNuevo: JSON.stringify({ categoria: newReporte.categoria, prioridad: newReporte.prioridad })
    }, companyId);
    
    return newReporte;
  }

  async updateReporteTrabajador(id: string, reporte: Partial<InsertReporteTrabajador>, companyId: string, userId: string): Promise<ReporteTrabajador | undefined> {
    const [updated] = await db.update(schema.reportesTrabajadores)
      .set({
        ...reporte,
        updatedAt: sql`now()`
      })
      .where(and(
        eq(schema.reportesTrabajadores.id, id),
        eq(schema.reportesTrabajadores.companyId, companyId)
      ))
      .returning();
    
    // Registrar auditoría
    if (updated) {
      // Determinar si es una respuesta o actualización
      const accion = reporte.respuesta ? 'responder' : 'editar';
      const descripcion = reporte.respuesta 
        ? `Respuesta agregada al reporte: ${reporte.estado}` 
        : `Reporte actualizado`;
      await this.registrarAuditoria({
        entidad: 'reporte',
        entidadId: updated.id,
        accion,
        userId: userId,
        descripcion,
        valorNuevo: JSON.stringify(reporte)
      }, companyId);
    }
    
    return updated;
  }

  async deleteReporteTrabajador(id: string, companyId: string, userId: string): Promise<void> {
    // Registrar auditoría antes de eliminar
    await this.registrarAuditoria({
      entidad: 'reporte',
      entidadId: id,
      accion: 'eliminar',
      userId: userId,
      descripcion: `Reporte trabajador eliminado`
    }, companyId);
    
    await db.delete(schema.reportesTrabajadores)
      .where(and(
        eq(schema.reportesTrabajadores.id, id),
        eq(schema.reportesTrabajadores.companyId, companyId)
      ));
  }

  async getReportesCount(companyId: string): Promise<number> {
    const reportes = await db.select()
      .from(schema.reportesTrabajadores)
      .where(eq(schema.reportesTrabajadores.companyId, companyId));
    return reportes.length;
  }

  // ========================================
  // Historial/Auditoría methods - Trazabilidad
  // ========================================

  async getHistorialComunicacionSst(entidadId: string, companyId: string): Promise<HistorialComunicacionSst[]> {
    return await db.select()
      .from(schema.historialComunicacionesSst)
      .where(
        and(
          eq(schema.historialComunicacionesSst.entidadId, entidadId),
          eq(schema.historialComunicacionesSst.companyId, companyId)
        )
      )
      .orderBy(desc(schema.historialComunicacionesSst.createdAt));
  }

  async getHistorialComunicacionSstByEntidad(entidad: string, companyId: string): Promise<HistorialComunicacionSst[]> {
    return await db.select()
      .from(schema.historialComunicacionesSst)
      .where(
        and(
          eq(schema.historialComunicacionesSst.entidad, entidad),
          eq(schema.historialComunicacionesSst.companyId, companyId)
        )
      )
      .orderBy(desc(schema.historialComunicacionesSst.createdAt));
  }

  async getHistorialComunicacionSstAll(
    companyId: string, 
    filters?: {
      userId?: string;
      fechaInicio?: string; // ISO date string
      fechaFin?: string;    // ISO date string
      accion?: string;
      entidad?: string;
    }
  ): Promise<HistorialComunicacionSst[]> {
    // Build dynamic where conditions
    const conditions: any[] = [eq(schema.historialComunicacionesSst.companyId, companyId)];
    
    if (filters?.userId) {
      conditions.push(eq(schema.historialComunicacionesSst.userId, filters.userId));
    }
    
    if (filters?.accion) {
      conditions.push(eq(schema.historialComunicacionesSst.accion, filters.accion as any));
    }
    
    if (filters?.entidad) {
      conditions.push(eq(schema.historialComunicacionesSst.entidad, filters.entidad));
    }
    
    if (filters?.fechaInicio) {
      conditions.push(sql`${schema.historialComunicacionesSst.createdAt} >= ${filters.fechaInicio}::timestamp`);
    }
    
    if (filters?.fechaFin) {
      conditions.push(sql`${schema.historialComunicacionesSst.createdAt} <= ${filters.fechaFin}::timestamp`);
    }
    
    return await db.select()
      .from(schema.historialComunicacionesSst)
      .where(and(...conditions))
      .orderBy(desc(schema.historialComunicacionesSst.createdAt));
  }

  async createHistorialComunicacionSst(historial: InsertHistorialComunicacionSst, companyId: string): Promise<HistorialComunicacionSst> {
    const [newHistorial] = await db.insert(schema.historialComunicacionesSst)
      .values({
        ...historial,
        companyId
      })
      .returning();
    return newHistorial;
  }

  async registrarAuditoria(params: {
    entidad: string;
    entidadId: string;
    accion: string;
    descripcion: string;
    userId: string; // Ahora obligatorio
    campoModificado?: string;
    valorAnterior?: string;
    valorNuevo?: string;
    ipAddress?: string;
    userAgent?: string;
  }, companyId: string): Promise<void> {
    try {
      // Obtener información del usuario
      const user = await this.getUser(params.userId);
      if (!user) {
        console.error(`Usuario ${params.userId} no encontrado para auditoría`);
        return;
      }

      await db.insert(schema.historialComunicacionesSst).values({
        entidad: params.entidad,
        entidadId: params.entidadId,
        accion: params.accion as any,
        descripcion: params.descripcion,
        userId: params.userId,
        nombreUsuario: user.fullName || user.email,
        rolUsuario: user.role,
        campoModificado: params.campoModificado || null,
        valorAnterior: params.valorAnterior || null,
        valorNuevo: params.valorNuevo || null,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
        companyId,
      });
    } catch (error) {
      console.error('Error al registrar auditoría:', error);
      // No lanzamos el error para que no se interrumpa la operación principal
    }
  }

  // ============================================================================
  // IPERC - IDENTIFICACIÓN DE PELIGROS Y EVALUACIÓN DE RIESGOS METHODS
  // ============================================================================

  // Matrices IPERC
  async getAllMatricesIperc(): Promise<schema.MatrizIperc[]> {
    return await db.select()
      .from(schema.matricesIperc)
      .orderBy(desc(schema.matricesIperc.fechaEvaluacion), desc(schema.matricesIperc.createdAt));
  }

  async getMatricesIperc(companyId: string): Promise<schema.MatrizIperc[]> {
    return await db.select()
      .from(schema.matricesIperc)
      .where(eq(schema.matricesIperc.companyId, companyId))
      .orderBy(desc(schema.matricesIperc.fechaEvaluacion), desc(schema.matricesIperc.createdAt));
  }

  async getMatrizIpercById(id: string): Promise<schema.MatrizIperc | undefined> {
    const [matriz] = await db.select()
      .from(schema.matricesIperc)
      .where(eq(schema.matricesIperc.id, id));
    return matriz;
  }

  async getMatrizIperc(id: string, companyId: string): Promise<schema.MatrizIperc | undefined> {
    const [matriz] = await db.select()
      .from(schema.matricesIperc)
      .where(and(
        eq(schema.matricesIperc.id, id),
        eq(schema.matricesIperc.companyId, companyId)
      ));
    return matriz;
  }

  async createMatrizIperc(matriz: schema.InsertMatrizIperc, companyId: string): Promise<schema.MatrizIperc> {
    const [newMatriz] = await db.insert(schema.matricesIperc)
      .values({ ...matriz, companyId } as any)
      .returning();
    return newMatriz;
  }

  async updateMatrizIperc(id: string, matriz: Partial<schema.InsertMatrizIperc>, companyId: string): Promise<schema.MatrizIperc | undefined> {
    const existing = await this.getMatrizIperc(id, companyId);
    if (!existing) return undefined;

    const updateData: any = { ...matriz };
    updateData.updatedAt = sql`now()`;

    const [updated] = await db.update(schema.matricesIperc)
      .set(updateData)
      .where(eq(schema.matricesIperc.id, id))
      .returning();
    return updated;
  }

  async deleteMatrizIperc(id: string, companyId: string): Promise<void> {
    const matriz = await this.getMatrizIperc(id, companyId);
    if (!matriz) return;

    await db.delete(schema.matricesIperc)
      .where(eq(schema.matricesIperc.id, id));
  }

  // Peligros IPERC
  async getPeligrosIperc(matrizId: string, companyId: string): Promise<schema.PeligroIperc[]> {
    return await db.select()
      .from(schema.peligrosIperc)
      .where(and(
        eq(schema.peligrosIperc.matrizId, matrizId),
        eq(schema.peligrosIperc.companyId, companyId)
      ))
      .orderBy(desc(schema.peligrosIperc.valorRiesgo), desc(schema.peligrosIperc.createdAt));
  }

  async getPeligroIpercById(id: string): Promise<schema.PeligroIperc | undefined> {
    const [peligro] = await db.select()
      .from(schema.peligrosIperc)
      .where(eq(schema.peligrosIperc.id, id));
    return peligro;
  }

  async getPeligroIperc(id: string, companyId: string): Promise<schema.PeligroIperc | undefined> {
    const [peligro] = await db.select()
      .from(schema.peligrosIperc)
      .where(and(
        eq(schema.peligrosIperc.id, id),
        eq(schema.peligrosIperc.companyId, companyId)
      ));
    return peligro;
  }

  async createPeligroIperc(peligro: schema.InsertPeligroIperc, companyId: string): Promise<schema.PeligroIperc> {
    const [newPeligro] = await db.insert(schema.peligrosIperc)
      .values({ ...peligro, companyId } as any)
      .returning();
    return newPeligro;
  }

  async updatePeligroIperc(id: string, peligro: Partial<schema.InsertPeligroIperc>, companyId: string): Promise<schema.PeligroIperc | undefined> {
    const existing = await this.getPeligroIperc(id, companyId);
    if (!existing) return undefined;

    const updateData: any = { ...peligro };
    updateData.updatedAt = sql`now()`;

    const [updated] = await db.update(schema.peligrosIperc)
      .set(updateData)
      .where(eq(schema.peligrosIperc.id, id))
      .returning();
    return updated;
  }

  async deletePeligroIperc(id: string, companyId: string): Promise<void> {
    const peligro = await this.getPeligroIperc(id, companyId);
    if (!peligro) return;

    await db.delete(schema.peligrosIperc)
      .where(eq(schema.peligrosIperc.id, id));
  }

  // Estadísticas IPERC
  async getEstadisticasIperc(matrizId: string, companyId: string): Promise<{
    totalPeligros: number;
    porNivelRiesgo: Record<string, number>;
    porClasificacion: Record<string, number>;
    porEstadoImplementacion: Record<string, number>;
  }> {
    const peligros = await this.getPeligrosIperc(matrizId, companyId);

    const stats = {
      totalPeligros: peligros.length,
      porNivelRiesgo: {} as Record<string, number>,
      porClasificacion: {} as Record<string, number>,
      porEstadoImplementacion: {} as Record<string, number>,
    };

    peligros.forEach(p => {
      stats.porNivelRiesgo[p.nivelRiesgo] = (stats.porNivelRiesgo[p.nivelRiesgo] || 0) + 1;
      stats.porClasificacion[p.clasificacion] = (stats.porClasificacion[p.clasificacion] || 0) + 1;
      stats.porEstadoImplementacion[p.estadoImplementacion || 'pendiente'] = 
        (stats.porEstadoImplementacion[p.estadoImplementacion || 'pendiente'] || 0) + 1;
    });

    return stats;
  }

  // Asignación de peligros a trabajadores (por área/cargo)
  async getPeligrosByWorker(workerId: string, companyId: string): Promise<Array<schema.PeligroIperc & { asignacion: schema.PeligroTrabajadorAsignacion }>> {
    const worker = await this.getWorker(workerId, companyId);
    if (!worker) return [];

    // Simplified query: match by department OR position
    const asignaciones = await db.select()
      .from(schema.peligrosTrabajadoresAsignacion)
      .innerJoin(schema.peligrosIperc, eq(schema.peligrosTrabajadoresAsignacion.peligroId, schema.peligrosIperc.id))
      .where(and(
        eq(schema.peligrosTrabajadoresAsignacion.companyId, companyId),
        eq(schema.peligrosTrabajadoresAsignacion.activo, 1),
        or(
          eq(schema.peligrosTrabajadoresAsignacion.department, worker.department),
          eq(schema.peligrosTrabajadoresAsignacion.position, worker.position)
        )
      ));

    return asignaciones.map(a => ({ ...a.peligros_iperc, asignacion: a.peligros_trabajadores_asignacion }));
  }

  async getAllPeligrosAsignacion(companyId?: string): Promise<schema.PeligroTrabajadorAsignacion[]> {
    if (companyId) {
      return await db.select()
        .from(schema.peligrosTrabajadoresAsignacion)
        .where(eq(schema.peligrosTrabajadoresAsignacion.companyId, companyId))
        .orderBy(desc(schema.peligrosTrabajadoresAsignacion.fechaAsignacion));
    }
    return await db.select()
      .from(schema.peligrosTrabajadoresAsignacion)
      .orderBy(desc(schema.peligrosTrabajadoresAsignacion.fechaAsignacion));
  }

  async createPeligroAsignacion(data: schema.InsertPeligroTrabajadorAsignacion, companyId: string, userId: string): Promise<schema.PeligroTrabajadorAsignacion> {
    const [asignacion] = await db.insert(schema.peligrosTrabajadoresAsignacion)
      .values({ ...data, companyId, asignadoPor: userId } as any)
      .returning();
    return asignacion;
  }

  async updatePeligroAsignacion(id: string, data: Partial<schema.InsertPeligroTrabajadorAsignacion>, companyId: string): Promise<schema.PeligroTrabajadorAsignacion | undefined> {
    const [existing] = await db.select()
      .from(schema.peligrosTrabajadoresAsignacion)
      .where(and(
        eq(schema.peligrosTrabajadoresAsignacion.id, id),
        eq(schema.peligrosTrabajadoresAsignacion.companyId, companyId)
      ));
    if (!existing) return undefined;

    const [updated] = await db.update(schema.peligrosTrabajadoresAsignacion)
      .set(data as any)
      .where(eq(schema.peligrosTrabajadoresAsignacion.id, id))
      .returning();
    return updated;
  }

  async deletePeligroAsignacion(id: string, companyId: string): Promise<void> {
    await db.delete(schema.peligrosTrabajadoresAsignacion)
      .where(and(
        eq(schema.peligrosTrabajadoresAsignacion.id, id),
        eq(schema.peligrosTrabajadoresAsignacion.companyId, companyId)
      ));
  }

  // ========================================
  // Auditorías Internas SST methods
  // ========================================

  // Auditorías Internas
  async getAllAuditoriasInternas(): Promise<schema.AuditoriaInterna[]> {
    return await db.select()
      .from(schema.auditoriasInternas)
      .orderBy(desc(schema.auditoriasInternas.fechaProgramada), desc(schema.auditoriasInternas.createdAt));
  }

  async getAuditoriasInternas(companyId: string): Promise<schema.AuditoriaInterna[]> {
    return await db.select()
      .from(schema.auditoriasInternas)
      .where(eq(schema.auditoriasInternas.companyId, companyId))
      .orderBy(desc(schema.auditoriasInternas.fechaProgramada), desc(schema.auditoriasInternas.createdAt));
  }

  async getAuditoriaInternaById(id: string): Promise<schema.AuditoriaInterna | undefined> {
    const [auditoria] = await db.select()
      .from(schema.auditoriasInternas)
      .where(eq(schema.auditoriasInternas.id, id));
    return auditoria;
  }

  async getAuditoriaInterna(id: string, companyId: string): Promise<schema.AuditoriaInterna | undefined> {
    const [auditoria] = await db.select()
      .from(schema.auditoriasInternas)
      .where(and(
        eq(schema.auditoriasInternas.id, id),
        eq(schema.auditoriasInternas.companyId, companyId)
      ));
    return auditoria;
  }

  async createAuditoriaInterna(auditoria: schema.InsertAuditoriaInterna, companyId: string): Promise<schema.AuditoriaInterna> {
    const [newAuditoria] = await db.insert(schema.auditoriasInternas)
      .values({ ...auditoria, companyId } as any)
      .returning();
    return newAuditoria;
  }

  async updateAuditoriaInterna(id: string, auditoria: Partial<schema.InsertAuditoriaInterna>, companyId: string): Promise<schema.AuditoriaInterna | undefined> {
    const existing = await this.getAuditoriaInterna(id, companyId);
    if (!existing) return undefined;

    const updateData: any = { ...auditoria };
    updateData.updatedAt = sql`now()`;

    const [updated] = await db.update(schema.auditoriasInternas)
      .set(updateData)
      .where(eq(schema.auditoriasInternas.id, id))
      .returning();
    return updated;
  }

  async deleteAuditoriaInterna(id: string, companyId: string): Promise<void> {
    const auditoria = await this.getAuditoriaInterna(id, companyId);
    if (!auditoria) return;

    await db.delete(schema.auditoriasInternas)
      .where(eq(schema.auditoriasInternas.id, id));
  }

  // Auditores de Auditoría
  async getAuditoriaAuditores(auditoriaId: string, companyId: string): Promise<schema.AuditoriaAuditor[]> {
    // Validar que la auditoría pertenece a la compañía
    const auditoria = await this.getAuditoriaInterna(auditoriaId, companyId);
    if (!auditoria) return [];

    return await db.select()
      .from(schema.auditoriaAuditores)
      .where(eq(schema.auditoriaAuditores.auditoriaId, auditoriaId))
      .orderBy(desc(schema.auditoriaAuditores.createdAt));
  }

  async getAuditoriaAuditor(id: string, companyId: string): Promise<schema.AuditoriaAuditor | undefined> {
    const [auditor] = await db.select()
      .from(schema.auditoriaAuditores)
      .where(eq(schema.auditoriaAuditores.id, id));
    
    if (!auditor) return undefined;

    // Validar que el auditor pertenece a una auditoría de la compañía
    const auditoria = await this.getAuditoriaInterna(auditor.auditoriaId, companyId);
    if (!auditoria) return undefined;

    return auditor;
  }

  async createAuditoriaAuditor(auditor: schema.InsertAuditoriaAuditor, companyId: string): Promise<schema.AuditoriaAuditor> {
    // Validar que la auditoría pertenece a la compañía
    const auditoria = await this.getAuditoriaInterna(auditor.auditoriaId, companyId);
    if (!auditoria) throw new Error("Auditoría no encontrada o no pertenece a la compañía");

    const [newAuditor] = await db.insert(schema.auditoriaAuditores)
      .values(auditor as any)
      .returning();
    return newAuditor;
  }

  async updateAuditoriaAuditor(id: string, auditor: Partial<schema.InsertAuditoriaAuditor>, companyId: string): Promise<schema.AuditoriaAuditor | undefined> {
    const existing = await this.getAuditoriaAuditor(id, companyId);
    if (!existing) return undefined;

    // Security: Prevent reassigning auditor to different auditoría (cross-tenant violation)
    const updateData: any = { ...auditor };
    delete updateData.auditoriaId;

    const [updated] = await db.update(schema.auditoriaAuditores)
      .set(updateData)
      .where(eq(schema.auditoriaAuditores.id, id))
      .returning();
    return updated;
  }

  async deleteAuditoriaAuditor(id: string, companyId: string): Promise<void> {
    const auditor = await this.getAuditoriaAuditor(id, companyId);
    if (!auditor) return;

    await db.delete(schema.auditoriaAuditores)
      .where(eq(schema.auditoriaAuditores.id, id));
  }

  // Checklists de Auditoría
  async getAuditoriaChecklists(auditoriaId: string, companyId: string): Promise<schema.AuditoriaChecklist[]> {
    // Validar que la auditoría pertenece a la compañía
    const auditoria = await this.getAuditoriaInterna(auditoriaId, companyId);
    if (!auditoria) return [];

    return await db.select()
      .from(schema.auditoriaChecklists)
      .where(eq(schema.auditoriaChecklists.auditoriaId, auditoriaId))
      .orderBy(asc(schema.auditoriaChecklists.numeroItem), desc(schema.auditoriaChecklists.createdAt));
  }

  async getAuditoriaChecklist(id: string, companyId: string): Promise<schema.AuditoriaChecklist | undefined> {
    const [checklist] = await db.select()
      .from(schema.auditoriaChecklists)
      .where(eq(schema.auditoriaChecklists.id, id));
    
    if (!checklist) return undefined;

    // Validar que el checklist pertenece a una auditoría de la compañía
    const auditoria = await this.getAuditoriaInterna(checklist.auditoriaId, companyId);
    if (!auditoria) return undefined;

    return checklist;
  }

  async createAuditoriaChecklist(checklist: schema.InsertAuditoriaChecklist, companyId: string): Promise<schema.AuditoriaChecklist> {
    // Validar que la auditoría pertenece a la compañía
    const auditoria = await this.getAuditoriaInterna(checklist.auditoriaId, companyId);
    if (!auditoria) throw new Error("Auditoría no encontrada o no pertenece a la compañía");

    const [newChecklist] = await db.insert(schema.auditoriaChecklists)
      .values(checklist as any)
      .returning();
    return newChecklist;
  }

  async updateAuditoriaChecklist(id: string, checklist: Partial<schema.InsertAuditoriaChecklist>, companyId: string): Promise<schema.AuditoriaChecklist | undefined> {
    const existing = await this.getAuditoriaChecklist(id, companyId);
    if (!existing) return undefined;

    // Security: Prevent reassigning checklist to different auditoría (cross-tenant violation)
    const updateData: any = { ...checklist };
    delete updateData.auditoriaId;
    updateData.updatedAt = sql`now()`;

    const [updated] = await db.update(schema.auditoriaChecklists)
      .set(updateData)
      .where(eq(schema.auditoriaChecklists.id, id))
      .returning();
    return updated;
  }

  async deleteAuditoriaChecklist(id: string, companyId: string): Promise<void> {
    const checklist = await this.getAuditoriaChecklist(id, companyId);
    if (!checklist) return;

    await db.delete(schema.auditoriaChecklists)
      .where(eq(schema.auditoriaChecklists.id, id));
  }

  // Hallazgos de Auditoría
  async getHallazgosAuditoria(auditoriaId: string, companyId: string): Promise<schema.HallazgoAuditoria[]> {
    return await db.select()
      .from(schema.hallazgosAuditoria)
      .where(and(
        eq(schema.hallazgosAuditoria.auditoriaId, auditoriaId),
        eq(schema.hallazgosAuditoria.companyId, companyId)
      ))
      .orderBy(desc(schema.hallazgosAuditoria.fechaDeteccion), desc(schema.hallazgosAuditoria.createdAt));
  }

  async getAllHallazgosAuditoria(companyId: string): Promise<schema.HallazgoAuditoria[]> {
    return await db.select()
      .from(schema.hallazgosAuditoria)
      .where(eq(schema.hallazgosAuditoria.companyId, companyId))
      .orderBy(desc(schema.hallazgosAuditoria.fechaDeteccion), desc(schema.hallazgosAuditoria.createdAt));
  }

  async getHallazgoAuditoria(id: string, companyId: string): Promise<schema.HallazgoAuditoria | undefined> {
    const [hallazgo] = await db.select()
      .from(schema.hallazgosAuditoria)
      .where(and(
        eq(schema.hallazgosAuditoria.id, id),
        eq(schema.hallazgosAuditoria.companyId, companyId)
      ));
    return hallazgo;
  }

  async getHallazgoAuditoriaById(id: string): Promise<schema.HallazgoAuditoria | undefined> {
    const [hallazgo] = await db.select()
      .from(schema.hallazgosAuditoria)
      .where(eq(schema.hallazgosAuditoria.id, id));
    return hallazgo;
  }

  async createHallazgoAuditoria(hallazgo: schema.InsertHallazgoAuditoria, companyId: string): Promise<schema.HallazgoAuditoria> {
    const [newHallazgo] = await db.insert(schema.hallazgosAuditoria)
      .values({ ...hallazgo, companyId } as any)
      .returning();
    return newHallazgo;
  }

  async updateHallazgoAuditoria(id: string, hallazgo: Partial<schema.InsertHallazgoAuditoria>, companyId: string): Promise<schema.HallazgoAuditoria | undefined> {
    const existing = await this.getHallazgoAuditoria(id, companyId);
    if (!existing) return undefined;

    // Security: Prevent changing companyId or auditoriaId (cross-tenant violation)
    const updateData: any = { ...hallazgo };
    delete updateData.companyId;
    delete updateData.auditoriaId;
    updateData.updatedAt = sql`now()`;

    const [updated] = await db.update(schema.hallazgosAuditoria)
      .set(updateData)
      .where(eq(schema.hallazgosAuditoria.id, id))
      .returning();
    return updated;
  }

  async deleteHallazgoAuditoria(id: string, companyId: string): Promise<void> {
    const hallazgo = await this.getHallazgoAuditoria(id, companyId);
    if (!hallazgo) return;

    await db.delete(schema.hallazgosAuditoria)
      .where(eq(schema.hallazgosAuditoria.id, id));
  }

  // Planes de Acción de Auditoría
  async getPlanesAccionAuditoria(hallazgoId: string, companyId: string): Promise<schema.PlanAccionAuditoria[]> {
    // Validar que el hallazgo pertenece a la compañía
    const hallazgo = await this.getHallazgoAuditoria(hallazgoId, companyId);
    if (!hallazgo) return [];

    return await db.select()
      .from(schema.planesAccionAuditoria)
      .where(and(
        eq(schema.planesAccionAuditoria.hallazgoId, hallazgoId),
        eq(schema.planesAccionAuditoria.companyId, companyId)
      ))
      .orderBy(desc(schema.planesAccionAuditoria.fechaCompromiso), desc(schema.planesAccionAuditoria.createdAt));
  }

  async getAllPlanesAccionAuditoria(companyId: string): Promise<schema.PlanAccionAuditoria[]> {
    return await db.select()
      .from(schema.planesAccionAuditoria)
      .where(eq(schema.planesAccionAuditoria.companyId, companyId))
      .orderBy(desc(schema.planesAccionAuditoria.fechaCompromiso), desc(schema.planesAccionAuditoria.createdAt));
  }

  async getPlanAccionAuditoria(id: string, companyId: string): Promise<schema.PlanAccionAuditoria | undefined> {
    const [plan] = await db.select()
      .from(schema.planesAccionAuditoria)
      .where(and(
        eq(schema.planesAccionAuditoria.id, id),
        eq(schema.planesAccionAuditoria.companyId, companyId)
      ));
    return plan;
  }

  async getPlanAccionAuditoriaById(id: string): Promise<schema.PlanAccionAuditoria | undefined> {
    const [plan] = await db.select()
      .from(schema.planesAccionAuditoria)
      .where(eq(schema.planesAccionAuditoria.id, id));
    return plan;
  }

  async createPlanAccionAuditoria(plan: schema.InsertPlanAccionAuditoria, companyId: string): Promise<schema.PlanAccionAuditoria> {
    const [newPlan] = await db.insert(schema.planesAccionAuditoria)
      .values({ ...plan, companyId } as any)
      .returning();
    return newPlan;
  }

  async updatePlanAccionAuditoria(id: string, plan: Partial<schema.InsertPlanAccionAuditoria>, companyId: string): Promise<schema.PlanAccionAuditoria | undefined> {
    const existing = await this.getPlanAccionAuditoria(id, companyId);
    if (!existing) return undefined;

    // Security: Prevent reassigning plan to different hallazgo (cross-tenant violation)
    const updateData: any = { ...plan };
    delete updateData.hallazgoId;
    delete updateData.companyId; // Also prevent changing companyId directly
    updateData.updatedAt = sql`now()`;

    const [updated] = await db.update(schema.planesAccionAuditoria)
      .set(updateData)
      .where(eq(schema.planesAccionAuditoria.id, id))
      .returning();
    return updated;
  }

  async deletePlanAccionAuditoria(id: string, companyId: string): Promise<void> {
    const plan = await this.getPlanAccionAuditoria(id, companyId);
    if (!plan) return;

    await db.delete(schema.planesAccionAuditoria)
      .where(eq(schema.planesAccionAuditoria.id, id));
  }

  // ============================================================================
  // REVISIÓN POR DIRECCIÓN - Implementation
  // ============================================================================

  // Revisiones por Dirección - Main entity with admin access pattern
  async getAllRevisionesDireccion(): Promise<schema.RevisionDireccion[]> {
    return await db.select()
      .from(schema.revisionesDireccion)
      .orderBy(desc(schema.revisionesDireccion.fechaRevision), desc(schema.revisionesDireccion.createdAt));
  }

  async getRevisionesDireccion(companyId: string): Promise<schema.RevisionDireccion[]> {
    return await db.select()
      .from(schema.revisionesDireccion)
      .where(eq(schema.revisionesDireccion.companyId, companyId))
      .orderBy(desc(schema.revisionesDireccion.fechaRevision), desc(schema.revisionesDireccion.createdAt));
  }

  async getRevisionDireccion(id: string, companyId: string): Promise<schema.RevisionDireccion | undefined> {
    const [revision] = await db.select()
      .from(schema.revisionesDireccion)
      .where(and(
        eq(schema.revisionesDireccion.id, id),
        eq(schema.revisionesDireccion.companyId, companyId)
      ));
    return revision;
  }

  async getRevisionDireccionById(id: string): Promise<schema.RevisionDireccion | undefined> {
    const [revision] = await db.select()
      .from(schema.revisionesDireccion)
      .where(eq(schema.revisionesDireccion.id, id));
    return revision;
  }

  async createRevisionDireccion(revision: schema.InsertRevisionDireccion, companyId: string): Promise<schema.RevisionDireccion> {
    const [newRevision] = await db.insert(schema.revisionesDireccion)
      .values({ ...revision, companyId } as any)
      .returning();
    return newRevision;
  }

  async updateRevisionDireccion(id: string, revision: Partial<schema.InsertRevisionDireccion>, companyId: string): Promise<schema.RevisionDireccion | undefined> {
    const existing = await this.getRevisionDireccion(id, companyId);
    if (!existing) return undefined;

    const updateData: any = { ...revision };
    delete updateData.companyId;
    updateData.updatedAt = sql`now()`;

    const [updated] = await db.update(schema.revisionesDireccion)
      .set(updateData)
      .where(eq(schema.revisionesDireccion.id, id))
      .returning();
    return updated;
  }

  async deleteRevisionDireccion(id: string, companyId: string): Promise<void> {
    const revision = await this.getRevisionDireccion(id, companyId);
    if (!revision) return;

    await db.delete(schema.revisionesDireccion)
      .where(eq(schema.revisionesDireccion.id, id));
  }

  // Participantes de Revisión - Nested entity with parent validation
  async getParticipantesRevision(revisionId: string, companyId: string): Promise<schema.ParticipanteRevision[]> {
    // Validate parent revision ownership
    const revision = await this.getRevisionDireccion(revisionId, companyId);
    if (!revision) return [];

    return await db.select()
      .from(schema.participantesRevision)
      .where(and(
        eq(schema.participantesRevision.revisionId, revisionId),
        eq(schema.participantesRevision.companyId, companyId)
      ))
      .orderBy(asc(schema.participantesRevision.nombre));
  }

  async getParticipanteRevision(id: string, companyId: string): Promise<schema.ParticipanteRevision | undefined> {
    const [participante] = await db.select()
      .from(schema.participantesRevision)
      .where(and(
        eq(schema.participantesRevision.id, id),
        eq(schema.participantesRevision.companyId, companyId)
      ));
    return participante;
  }

  async createParticipanteRevision(participante: schema.InsertParticipanteRevision, companyId: string): Promise<schema.ParticipanteRevision> {
    // Validate parent revision ownership
    const revision = await this.getRevisionDireccion(participante.revisionId, companyId);
    if (!revision) {
      throw new Error('Revisión not found or access denied');
    }

    const [newParticipante] = await db.insert(schema.participantesRevision)
      .values({ ...participante, companyId } as any)
      .returning();
    return newParticipante;
  }

  async updateParticipanteRevision(id: string, participante: Partial<schema.InsertParticipanteRevision>, companyId: string): Promise<schema.ParticipanteRevision | undefined> {
    const existing = await this.getParticipanteRevision(id, companyId);
    if (!existing) return undefined;

    // Security: Prevent reassigning to different revision
    const updateData: any = { ...participante };
    delete updateData.revisionId;
    delete updateData.companyId;

    const [updated] = await db.update(schema.participantesRevision)
      .set(updateData)
      .where(eq(schema.participantesRevision.id, id))
      .returning();
    return updated;
  }

  async deleteParticipanteRevision(id: string, companyId: string): Promise<void> {
    const participante = await this.getParticipanteRevision(id, companyId);
    if (!participante) return;

    await db.delete(schema.participantesRevision)
      .where(eq(schema.participantesRevision.id, id));
  }

  // Temas de Revisión - Nested entity with parent validation
  async getTemasRevision(revisionId: string, companyId: string): Promise<schema.TemaRevision[]> {
    // Validate parent revision ownership
    const revision = await this.getRevisionDireccion(revisionId, companyId);
    if (!revision) return [];

    return await db.select()
      .from(schema.temasRevision)
      .where(and(
        eq(schema.temasRevision.revisionId, revisionId),
        eq(schema.temasRevision.companyId, companyId)
      ))
      .orderBy(asc(schema.temasRevision.orden), asc(schema.temasRevision.titulo));
  }

  async getTemaRevision(id: string, companyId: string): Promise<schema.TemaRevision | undefined> {
    const [tema] = await db.select()
      .from(schema.temasRevision)
      .where(and(
        eq(schema.temasRevision.id, id),
        eq(schema.temasRevision.companyId, companyId)
      ));
    return tema;
  }

  async createTemaRevision(tema: schema.InsertTemaRevision, companyId: string): Promise<schema.TemaRevision> {
    // Validate parent revision ownership
    const revision = await this.getRevisionDireccion(tema.revisionId, companyId);
    if (!revision) {
      throw new Error('Revisión not found or access denied');
    }

    const [newTema] = await db.insert(schema.temasRevision)
      .values({ ...tema, companyId } as any)
      .returning();
    return newTema;
  }

  async updateTemaRevision(id: string, tema: Partial<schema.InsertTemaRevision>, companyId: string): Promise<schema.TemaRevision | undefined> {
    const existing = await this.getTemaRevision(id, companyId);
    if (!existing) return undefined;

    // Security: Prevent reassigning to different revision
    const updateData: any = { ...tema };
    delete updateData.revisionId;
    delete updateData.companyId;

    const [updated] = await db.update(schema.temasRevision)
      .set(updateData)
      .where(eq(schema.temasRevision.id, id))
      .returning();
    return updated;
  }

  async deleteTemaRevision(id: string, companyId: string): Promise<void> {
    const tema = await this.getTemaRevision(id, companyId);
    if (!tema) return;

    await db.delete(schema.temasRevision)
      .where(eq(schema.temasRevision.id, id));
  }

  // Decisiones de Revisión - Nested entity with parent validation
  async getDecisionesRevision(revisionId: string, companyId: string): Promise<schema.DecisionRevision[]> {
    // Validate parent revision ownership
    const revision = await this.getRevisionDireccion(revisionId, companyId);
    if (!revision) return [];

    return await db.select()
      .from(schema.decisionesRevision)
      .where(and(
        eq(schema.decisionesRevision.revisionId, revisionId),
        eq(schema.decisionesRevision.companyId, companyId)
      ))
      .orderBy(desc(schema.decisionesRevision.createdAt));
  }

  async getDecisionRevision(id: string, companyId: string): Promise<schema.DecisionRevision | undefined> {
    const [decision] = await db.select()
      .from(schema.decisionesRevision)
      .where(and(
        eq(schema.decisionesRevision.id, id),
        eq(schema.decisionesRevision.companyId, companyId)
      ));
    return decision;
  }

  async createDecisionRevision(decision: schema.InsertDecisionRevision, companyId: string): Promise<schema.DecisionRevision> {
    // Validate parent revision ownership
    const revision = await this.getRevisionDireccion(decision.revisionId, companyId);
    if (!revision) {
      throw new Error('Revisión not found or access denied');
    }

    const [newDecision] = await db.insert(schema.decisionesRevision)
      .values({ ...decision, companyId } as any)
      .returning();
    return newDecision;
  }

  async updateDecisionRevision(id: string, decision: Partial<schema.InsertDecisionRevision>, companyId: string): Promise<schema.DecisionRevision | undefined> {
    const existing = await this.getDecisionRevision(id, companyId);
    if (!existing) return undefined;

    // Security: Prevent reassigning to different revision
    const updateData: any = { ...decision };
    delete updateData.revisionId;
    delete updateData.companyId;

    const [updated] = await db.update(schema.decisionesRevision)
      .set(updateData)
      .where(eq(schema.decisionesRevision.id, id))
      .returning();
    return updated;
  }

  async deleteDecisionRevision(id: string, companyId: string): Promise<void> {
    const decision = await this.getDecisionRevision(id, companyId);
    if (!decision) return;

    await db.delete(schema.decisionesRevision)
      .where(eq(schema.decisionesRevision.id, id));
  }

  // Acciones de Revisión - Nested to Decisiones (double-nested validation)
  async getAccionesRevision(decisionId: string, companyId: string): Promise<schema.AccionRevision[]> {
    // Validate parent decision ownership
    const decision = await this.getDecisionRevision(decisionId, companyId);
    if (!decision) return [];

    return await db.select()
      .from(schema.accionesRevision)
      .where(and(
        eq(schema.accionesRevision.decisionId, decisionId),
        eq(schema.accionesRevision.companyId, companyId)
      ))
      .orderBy(desc(schema.accionesRevision.fechaCompromiso), desc(schema.accionesRevision.createdAt));
  }

  async getAccionRevision(id: string, companyId: string): Promise<schema.AccionRevision | undefined> {
    const [accion] = await db.select()
      .from(schema.accionesRevision)
      .where(and(
        eq(schema.accionesRevision.id, id),
        eq(schema.accionesRevision.companyId, companyId)
      ));
    return accion;
  }

  async createAccionRevision(accion: schema.InsertAccionRevision, companyId: string): Promise<schema.AccionRevision> {
    // Validate parent decision ownership
    const decision = await this.getDecisionRevision(accion.decisionId, companyId);
    if (!decision) {
      throw new Error('Decisión not found or access denied');
    }

    const [newAccion] = await db.insert(schema.accionesRevision)
      .values({ ...accion, companyId } as any)
      .returning();
    return newAccion;
  }

  async updateAccionRevision(id: string, accion: Partial<schema.InsertAccionRevision>, companyId: string): Promise<schema.AccionRevision | undefined> {
    const existing = await this.getAccionRevision(id, companyId);
    if (!existing) return undefined;

    // Security: Prevent reassigning to different decision
    const updateData: any = { ...accion };
    delete updateData.decisionId;
    delete updateData.companyId;
    updateData.updatedAt = sql`now()`;

    const [updated] = await db.update(schema.accionesRevision)
      .set(updateData)
      .where(eq(schema.accionesRevision.id, id))
      .returning();
    return updated;
  }

  async deleteAccionRevision(id: string, companyId: string): Promise<void> {
    const accion = await this.getAccionRevision(id, companyId);
    if (!accion) return;

    await db.delete(schema.accionesRevision)
      .where(eq(schema.accionesRevision.id, id));
  }

  // IPERC ↔ Plan Trabajo Anual Integration (Estándar 1.1.2 - Resolución 0312/2019)
  
  async getActiveMatrizIperc(companyId: string, year: number): Promise<schema.MatrizIperc | undefined> {
    // Get active matriz for the given year
    // For auto-validity: fechaEvaluacion to fechaEvaluacion + 12 months must overlap target year
    // For manual-validity: vigenciaDesde to vigenciaHasta must overlap target year
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    
    const [matriz] = await db.select()
      .from(schema.matricesIperc)
      .where(and(
        eq(schema.matricesIperc.companyId, companyId),
        eq(schema.matricesIperc.estado, "vigente"),
        or(
          // Matriz with automatic validity (12 months from fechaEvaluacion)
          // Valid if: fechaEvaluacion <= year-end AND (fechaEvaluacion + 12 months) >= year-start
          and(
            eq(schema.matricesIperc.vigenteAuto, 1),
            sql`${schema.matricesIperc.fechaEvaluacion} <= ${endDate}::date`,
            sql`(${schema.matricesIperc.fechaEvaluacion} + INTERVAL '12 months') >= ${startDate}::date`
          ),
          // Matriz with manual validity dates
          and(
            eq(schema.matricesIperc.vigenteAuto, 0),
            sql`${schema.matricesIperc.vigenciaDesde} <= ${endDate}::date`,
            sql`${schema.matricesIperc.vigenciaHasta} >= ${startDate}::date`
          )
        )
      ))
      .orderBy(desc(schema.matricesIperc.fechaEvaluacion))
      .limit(1);
    
    return matriz;
  }

  async linkPlanToMatriz(planId: string, matrizId: string, companyId: string): Promise<void> {
    // Validate plan ownership
    const plan = await this.getPlanTrabajoAnual(planId, companyId);
    if (!plan) {
      throw new Error('Plan de Trabajo not found or access denied');
    }

    // Validate matriz ownership
    const matriz = await this.getMatrizIperc(matrizId, companyId);
    if (!matriz) {
      throw new Error('Matriz IPERC not found or access denied');
    }

    // Link plan to matriz
    await db.update(schema.planesTrabajoAnual)
      .set({ matrizIpercId: matrizId, updatedAt: sql`now()` })
      .where(eq(schema.planesTrabajoAnual.id, planId));
  }

  async ensurePlanHasIpercActivity(planId: string, companyId: string): Promise<boolean> {
    // Check if plan has at least one activity with programa "identificacion-peligros"
    // SECURITY: Join with planes_trabajo_anual to validate company ownership
    const activities = await db.select()
      .from(schema.actividadesPlanTrabajo)
      .innerJoin(
        schema.planesTrabajoAnual,
        eq(schema.actividadesPlanTrabajo.planTrabajoId, schema.planesTrabajoAnual.id)
      )
      .where(and(
        eq(schema.actividadesPlanTrabajo.planTrabajoId, planId),
        eq(schema.planesTrabajoAnual.companyId, companyId),
        eq(schema.actividadesPlanTrabajo.programa, "identificacion-peligros")
      ));
    
    return activities.length > 0;
  }

  // Consent Records - Habeas Data (Ley 1581/2012 + GDPR Art. 7) - Bloque 3

  async getConsentRecords(companyId: string): Promise<schema.ConsentRecord[]> {
    return await db.select()
      .from(schema.consentRecords)
      .where(eq(schema.consentRecords.companyId, companyId))
      .orderBy(desc(schema.consentRecords.grantedAt));
  }

  async getConsentRecord(id: string, companyId: string): Promise<schema.ConsentRecord | undefined> {
    const [record] = await db.select()
      .from(schema.consentRecords)
      .where(and(
        eq(schema.consentRecords.id, id),
        eq(schema.consentRecords.companyId, companyId)
      ));
    return record;
  }

  async getConsentsByWorker(workerId: string, companyId: string): Promise<schema.ConsentRecord[]> {
    return await db.select()
      .from(schema.consentRecords)
      .where(and(
        eq(schema.consentRecords.workerId, workerId),
        eq(schema.consentRecords.companyId, companyId)
      ))
      .orderBy(desc(schema.consentRecords.grantedAt));
  }

  async createConsentRecord(
    consent: schema.InsertConsentRecord, 
    companyId: string, 
    userId?: string, 
    auditContext?: AuditContext
  ): Promise<schema.ConsentRecord> {
    const fullConsent = { 
      ...consent, 
      companyId,
      recordedBy: userId || consent.recordedBy
    };

    const [created] = await db.insert(schema.consentRecords)
      .values(fullConsent)
      .returning();

    // Audit logging para consentimiento otorgado
    if (userId && auditContext) {
      const user = await this.getUser(userId);
      if (user) {
        await logAuditEvent({
          companyId,
          userId,
          userRole: user.role,
          username: user.username,
          entityType: 'consent_record',
          entityId: created.id,
          action: 'create',
          dataSubjectId: consent.workerId,
          dataSubjectName: consent.workerName,
          newValues: JSON.stringify(created),
          description: `Consentimiento ${consent.consentType} otorgado por trabajador ${consent.workerName}`,
          ...auditContext
        });
      }
    }

    return created;
  }

  async updateConsentRecord(
    id: string, 
    consent: Partial<schema.InsertConsentRecord>, 
    companyId: string, 
    userId?: string, 
    auditContext?: AuditContext
  ): Promise<schema.ConsentRecord | undefined> {
    const existing = await this.getConsentRecord(id, companyId);
    if (!existing) return undefined;

    const updateData: any = { 
      ...consent, 
      updatedAt: sql`now()`,
      updatedBy: userId || consent.updatedBy
    };
    delete updateData.companyId;
    delete updateData.id;

    const [updated] = await db.update(schema.consentRecords)
      .set(updateData)
      .where(and(
        eq(schema.consentRecords.id, id),
        eq(schema.consentRecords.companyId, companyId)
      ))
      .returning();

    // Audit logging para actualización
    if (userId && auditContext && updated) {
      const user = await this.getUser(userId);
      if (user) {
        await logAuditEvent({
          companyId,
          userId,
          userRole: user.role,
          username: user.username,
          entityType: 'consent_record',
          entityId: id,
          action: 'update',
          dataSubjectId: existing.workerId,
          dataSubjectName: existing.workerName,
          oldValues: JSON.stringify(existing),
          newValues: JSON.stringify(updated),
          description: `Consentimiento ${existing.consentType} actualizado para ${existing.workerName}`,
          ...auditContext
        });
      }
    }

    return updated;
  }

  async revokeConsent(
    id: string, 
    reason: string | null, 
    revokedBy: string, 
    companyId: string, 
    auditContext?: AuditContext
  ): Promise<schema.ConsentRecord | undefined> {
    const existing = await this.getConsentRecord(id, companyId);
    if (!existing) return undefined;

    // No permitir revocar consentimientos ya revocados
    if (existing.status === 'revocado') {
      throw new Error('Consent already revoked');
    }

    const [revoked] = await db.update(schema.consentRecords)
      .set({
        status: 'revocado',
        revokedAt: sql`now()`,
        revokedBy,
        revocationReason: reason,
        updatedAt: sql`now()`,
        updatedBy: revokedBy
      })
      .where(and(
        eq(schema.consentRecords.id, id),
        eq(schema.consentRecords.companyId, companyId)
      ))
      .returning();

    // Audit logging crítico para revocación (Ley 1581/2012)
    if (auditContext && revoked) {
      const user = await this.getUser(revokedBy);
      if (user) {
        await logAuditEvent({
          companyId,
          userId: revokedBy,
          userRole: user.role,
          username: user.username,
          entityType: 'consent_record',
          entityId: id,
          action: 'update',
          dataSubjectId: existing.workerId,
          dataSubjectName: existing.workerName,
          oldValues: JSON.stringify(existing),
          newValues: JSON.stringify(revoked),
          description: `REVOCACIÓN DE CONSENTIMIENTO: ${existing.consentType} revocado para ${existing.workerName}. Razón: ${reason || 'No especificada'}`,
          ...auditContext
        });
      }
    }

    return revoked;
  }

  // ARCO Requests - Derechos de Acceso, Rectificación, Cancelación, Oposición (Ley 1581/2012 Art. 14-15) - Bloque 3

  async getArcoRequests(
    companyId: string, 
    filters?: { status?: string; requestType?: string }
  ): Promise<schema.ArcoRequest[]> {
    const conditions = [eq(schema.arcoRequests.companyId, companyId)];
    
    if (filters?.status) {
      conditions.push(eq(schema.arcoRequests.status, filters.status as any));
    }
    if (filters?.requestType) {
      conditions.push(eq(schema.arcoRequests.requestType, filters.requestType as any));
    }

    return await db.select()
      .from(schema.arcoRequests)
      .where(and(...conditions))
      .orderBy(desc(schema.arcoRequests.submittedAt));
  }

  async getArcoRequest(id: string, companyId: string): Promise<schema.ArcoRequest | undefined> {
    const [request] = await db.select()
      .from(schema.arcoRequests)
      .where(and(
        eq(schema.arcoRequests.id, id),
        eq(schema.arcoRequests.companyId, companyId)
      ));
    return request;
  }

  async createArcoRequest(
    request: schema.InsertArcoRequest, 
    companyId: string, 
    userId?: string, 
    auditContext?: AuditContext
  ): Promise<schema.ArcoRequest> {
    const fullRequest = { 
      ...request, 
      companyId,
      intakeRecordedBy: userId || request.intakeRecordedBy
    };

    const [created] = await db.insert(schema.arcoRequests)
      .values(fullRequest)
      .returning();

    // Audit logging para solicitud ARCO recibida
    if (userId && auditContext) {
      const user = await this.getUser(userId);
      if (user) {
        await logAuditEvent({
          companyId,
          userId,
          userRole: user.role,
          username: user.username,
          entityType: 'arco_request',
          entityId: created.id,
          action: 'create',
          dataSubjectId: request.workerId || null,
          dataSubjectName: request.requesterName,
          newValues: JSON.stringify(created),
          description: `Solicitud ARCO ${request.requestType} recibida de ${request.requesterName}. Plazo legal: 10 días`,
          ...auditContext
        });
      }
    }

    logger.info({
      requestId: auditContext?.requestId,
      arcoRequestId: created.id,
      requestType: created.requestType,
      legalDeadline: created.legalDeadline
    }, `Nueva solicitud ARCO ${created.requestType} - Deadline: ${created.legalDeadline}`);

    return created;
  }

  async updateArcoRequest(
    id: string, 
    request: Partial<schema.InsertArcoRequest>, 
    companyId: string, 
    userId?: string, 
    auditContext?: AuditContext
  ): Promise<schema.ArcoRequest | undefined> {
    const existing = await this.getArcoRequest(id, companyId);
    if (!existing) return undefined;

    const updateData: any = { 
      ...request, 
      updatedAt: sql`now()`
    };
    delete updateData.companyId;
    delete updateData.id;

    const [updated] = await db.update(schema.arcoRequests)
      .set(updateData)
      .where(and(
        eq(schema.arcoRequests.id, id),
        eq(schema.arcoRequests.companyId, companyId)
      ))
      .returning();

    // Audit logging
    if (userId && auditContext && updated) {
      const user = await this.getUser(userId);
      if (user) {
        await logAuditEvent({
          companyId,
          userId,
          userRole: user.role,
          username: user.username,
          entityType: 'arco_request',
          entityId: id,
          action: 'update',
          dataSubjectId: existing.workerId || null,
          dataSubjectName: existing.requesterName,
          oldValues: JSON.stringify(existing),
          newValues: JSON.stringify(updated),
          description: `Solicitud ARCO ${existing.requestType} actualizada`,
          ...auditContext
        });
      }
    }

    return updated;
  }

  async assignArcoRequest(
    id: string, 
    assigneeId: string, 
    companyId: string, 
    userId?: string, 
    auditContext?: AuditContext
  ): Promise<schema.ArcoRequest | undefined> {
    const existing = await this.getArcoRequest(id, companyId);
    if (!existing) return undefined;

    // Validar que el asignado es un usuario válido
    const assignee = await this.getUser(assigneeId);
    if (!assignee) {
      throw new Error('Assignee user not found');
    }

    // Actualizar historial de asignados
    const previousAssignees = existing.previousAssignees || [];
    if (existing.assignedTo) {
      previousAssignees.push(existing.assignedTo);
    }

    const [assigned] = await db.update(schema.arcoRequests)
      .set({
        assignedTo: assigneeId,
        assignedAt: sql`now()`,
        previousAssignees,
        status: 'en_proceso',
        updatedAt: sql`now()`
      })
      .where(and(
        eq(schema.arcoRequests.id, id),
        eq(schema.arcoRequests.companyId, companyId)
      ))
      .returning();

    // Audit logging
    if (userId && auditContext && assigned) {
      const user = await this.getUser(userId);
      if (user) {
        await logAuditEvent({
          companyId,
          userId,
          userRole: user.role,
          username: user.username,
          entityType: 'arco_request',
          entityId: id,
          action: 'update',
          dataSubjectId: existing.workerId || null,
          dataSubjectName: existing.requesterName,
          oldValues: JSON.stringify(existing),
          newValues: JSON.stringify(assigned),
          description: `Solicitud ARCO ${existing.requestType} asignada a ${assignee.username}`,
          ...auditContext
        });
      }
    }

    logger.info({
      requestId: auditContext?.requestId,
      arcoRequestId: id,
      assignedTo: assignee.username
    }, `Solicitud ARCO asignada a ${assignee.username}`);

    return assigned;
  }

  async escalateArcoRequest(
    id: string, 
    escalationData: { escalatedTo: string; reason: string }, 
    companyId: string, 
    userId?: string, 
    auditContext?: AuditContext
  ): Promise<schema.ArcoRequest | undefined> {
    const existing = await this.getArcoRequest(id, companyId);
    if (!existing) return undefined;

    // Validar que el usuario escalado es válido
    const escalatedUser = await this.getUser(escalationData.escalatedTo);
    if (!escalatedUser) {
      throw new Error('Escalation target user not found');
    }

    const [escalated] = await db.update(schema.arcoRequests)
      .set({
        escalatedTo: escalationData.escalatedTo,
        escalatedAt: sql`now()`,
        escalationReason: escalationData.reason,
        updatedAt: sql`now()`
      })
      .where(and(
        eq(schema.arcoRequests.id, id),
        eq(schema.arcoRequests.companyId, companyId)
      ))
      .returning();

    // Audit logging crítico para escalaciones
    if (userId && auditContext && escalated) {
      const user = await this.getUser(userId);
      if (user) {
        await logAuditEvent({
          companyId,
          userId,
          userRole: user.role,
          username: user.username,
          entityType: 'arco_request',
          entityId: id,
          action: 'update',
          dataSubjectId: existing.workerId || null,
          dataSubjectName: existing.requesterName,
          oldValues: JSON.stringify(existing),
          newValues: JSON.stringify(escalated),
          description: `ESCALACIÓN: Solicitud ARCO ${existing.requestType} escalada a ${escalatedUser.username}. Razón: ${escalationData.reason}`,
          ...auditContext
        });
      }
    }

    logger.warn({
      requestId: auditContext?.requestId,
      arcoRequestId: id,
      escalatedTo: escalatedUser.username,
      reason: escalationData.reason
    }, `Solicitud ARCO ESCALADA a ${escalatedUser.username}`);

    return escalated;
  }

  async completeArcoRequest(
    id: string, 
    resolutionData: { 
      responseDescription: string; 
      status: 'completada' | 'rechazada' | 'parcialmente_completada'; 
      rejectionReason?: string 
    }, 
    companyId: string, 
    userId?: string, 
    auditContext?: AuditContext
  ): Promise<schema.ArcoRequest | undefined> {
    const existing = await this.getArcoRequest(id, companyId);
    if (!existing) return undefined;

    // Validar que el estado actual permite completar
    if (existing.status === 'completada' || existing.status === 'rechazada') {
      throw new Error('Request already completed or rejected');
    }

    const [completed] = await db.update(schema.arcoRequests)
      .set({
        status: resolutionData.status,
        responseDescription: resolutionData.responseDescription,
        rejectionReason: resolutionData.rejectionReason,
        responseProvidedBy: userId,
        responseDate: sql`now()`,
        completedAt: sql`now()`,
        updatedAt: sql`now()`
      })
      .where(and(
        eq(schema.arcoRequests.id, id),
        eq(schema.arcoRequests.companyId, companyId)
      ))
      .returning();

    // Audit logging crítico para resolución (Ley 1581/2012 Art. 15)
    if (userId && auditContext && completed) {
      const user = await this.getUser(userId);
      if (user) {
        await logAuditEvent({
          companyId,
          userId,
          userRole: user.role,
          username: user.username,
          entityType: 'arco_request',
          entityId: id,
          action: 'update',
          dataSubjectId: existing.workerId || null,
          dataSubjectName: existing.requesterName,
          oldValues: JSON.stringify(existing),
          newValues: JSON.stringify(completed),
          description: `RESOLUCIÓN: Solicitud ARCO ${existing.requestType} ${resolutionData.status}. ${resolutionData.rejectionReason ? 'Razón rechazo: ' + resolutionData.rejectionReason : ''}`,
          ...auditContext
        });
      }
    }

    logger.info({
      requestId: auditContext?.requestId,
      arcoRequestId: id,
      status: resolutionData.status,
      resolvedBy: userId
    }, `Solicitud ARCO ${existing.requestType} ${resolutionData.status}`);

    return completed;
  }

  // Consolidated Reports for VERIFICAR Phase - Auditable Traceability

  async getEvaluacionesSstConsolidated(companyId: string | null, limit: number = 10) {
    const whereConditions = companyId != null 
      ? eq(schema.evaluacionesSst.companyId, companyId)
      : undefined;

    const evaluaciones = await db.select()
      .from(schema.evaluacionesSst)
      .where(whereConditions)
      .orderBy(desc(schema.evaluacionesSst.fechaEvaluacion))
      .limit(limit);

    const results = [];
    for (const evaluacion of evaluaciones) {
      const company = await this.getCompany(evaluacion.companyId);
      
      const respuestas = await db.select()
        .from(schema.respuestasEstandares)
        .where(eq(schema.respuestasEstandares.evaluacionId, evaluacion.id))
        .orderBy(schema.respuestasEstandares.estandarId);

      const estandares = [];
      for (const respuesta of respuestas) {
        const estandar = await db.select()
          .from(schema.estandaresSst)
          .where(eq(schema.estandaresSst.id, respuesta.estandarId))
          .limit(1);
        
        if (estandar[0]) {
          estandares.push({
            ...estandar[0],
            respuesta: respuesta
          });
        }
      }

      const accionesMejora = await db.select()
        .from(schema.accionesMejora)
        .where(eq(schema.accionesMejora.evaluacionId, evaluacion.id));

      results.push({
        evaluacion,
        company,
        estandares,
        accionesMejora,
        totalEstandares: estandares.length,
        estandaresCumplidos: estandares.filter(e => e.respuesta.cumple === 1).length,
        estandaresCriticosNoCumplidos: estandares.filter(e => 
          e.critico === 1 && e.respuesta.cumple === 0
        ).length
      });
    }

    return results;
  }

  async getAuditoriasInternasConsolidated(
    companyId: string | null, 
    startDate?: Date, 
    endDate?: Date
  ) {
    let whereConditions: any = companyId != null 
      ? eq(schema.auditoriasInternas.companyId, companyId)
      : undefined;

    if (startDate && endDate) {
      const dateCondition = and(
        sql`${schema.auditoriasInternas.fechaInicio} >= ${startDate.toISOString().split('T')[0]}`,
        sql`${schema.auditoriasInternas.fechaInicio} <= ${endDate.toISOString().split('T')[0]}`
      );
      
      whereConditions = whereConditions 
        ? and(whereConditions, dateCondition)
        : dateCondition;
    }

    const auditorias = await db.select()
      .from(schema.auditoriasInternas)
      .where(whereConditions)
      .orderBy(desc(schema.auditoriasInternas.fechaInicio));

    const results = [];
    for (const auditoria of auditorias) {
      const company = await this.getCompany(auditoria.companyId);
      
      const auditores = await db.select()
        .from(schema.auditoriaAuditores)
        .innerJoin(
          schema.users,
          eq(schema.auditoriaAuditores.userId, schema.users.id)
        )
        .where(eq(schema.auditoriaAuditores.auditoriaId, auditoria.id));

      const hallazgos = await db.select()
        .from(schema.hallazgosAuditoria)
        .where(eq(schema.hallazgosAuditoria.auditoriaId, auditoria.id));

      const planesAccion = await db.select()
        .from(schema.planesAccionAuditoria)
        .where(eq(schema.planesAccionAuditoria.auditoriaId, auditoria.id));

      results.push({
        auditoria,
        company,
        auditores: auditores.map(a => a.users),
        hallazgos,
        planesAccion,
        totalHallazgos: hallazgos.length,
        hallazgosPorSeveridad: {
          baja: hallazgos.filter(h => h.severidad === 'baja').length,
          media: hallazgos.filter(h => h.severidad === 'media').length,
          alta: hallazgos.filter(h => h.severidad === 'alta').length,
          critica: hallazgos.filter(h => h.severidad === 'critica').length
        },
        planesCompletados: planesAccion.filter(p => p.estado === 'completado').length
      });
    }

    return results;
  }

  async getRevisionesDireccionConsolidated(companyId: string | null, year?: number) {
    let whereConditions: any = companyId != null 
      ? eq(schema.revisionesDireccion.companyId, companyId)
      : undefined;

    if (year) {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      const yearCondition = and(
        sql`${schema.revisionesDireccion.fechaRevision} >= ${startDate}::date`,
        sql`${schema.revisionesDireccion.fechaRevision} <= ${endDate}::date`
      );
      
      whereConditions = whereConditions 
        ? and(whereConditions, yearCondition)
        : yearCondition;
    }

    const revisiones = await db.select()
      .from(schema.revisionesDireccion)
      .where(whereConditions)
      .orderBy(desc(schema.revisionesDireccion.fechaRevision));

    const results = [];
    for (const revision of revisiones) {
      const company = await this.getCompany(revision.companyId);
      
      const participantes = await db.select()
        .from(schema.participantesRevision)
        .where(eq(schema.participantesRevision.revisionId, revision.id));

      const temas = await db.select()
        .from(schema.temasRevision)
        .where(eq(schema.temasRevision.revisionId, revision.id));

      const decisiones = await db.select()
        .from(schema.decisionesRevision)
        .where(eq(schema.decisionesRevision.revisionId, revision.id));

      let acciones: any[] = [];
      for (const decision of decisiones) {
        const accionesDecision = await db.select()
          .from(schema.accionesRevision)
          .where(eq(schema.accionesRevision.decisionId, decision.id));
        acciones = [...acciones, ...accionesDecision];
      }

      results.push({
        revision,
        company,
        participantes,
        temas,
        decisiones,
        acciones,
        totalDecisiones: decisiones.length,
        totalAcciones: acciones.length,
        accionesPendientes: acciones.filter(a => a.estado === 'pendiente').length,
        accionesCompletadas: acciones.filter(a => a.estado === 'completado').length
      });
    }

    return results;
  }

  async getObjetivosIndicadoresConsolidated(companyId: string | null, year?: number) {
    const currentYear = year || new Date().getFullYear();

    let whereConditions: any = companyId != null 
      ? and(
          eq(schema.objetivosSst.companyId, companyId),
          eq(schema.objetivosSst.anio, currentYear)
        )
      : eq(schema.objetivosSst.anio, currentYear);

    const objetivos = await db.select()
      .from(schema.objetivosSst)
      .where(whereConditions)
      .orderBy(schema.objetivosSst.titulo);

    let indicadoresConditions: any = companyId != null 
      ? and(
          eq(schema.indicadoresSst.companyId, companyId),
          eq(schema.indicadoresSst.activo, 1)
        )
      : eq(schema.indicadoresSst.activo, 1);

    const indicadores = await db.select()
      .from(schema.indicadoresSst)
      .where(indicadoresConditions)
      .orderBy(schema.indicadoresSst.nombre);

    const objetivosData = [];
    for (const objetivo of objetivos) {
      const company = await this.getCompany(objetivo.companyId);
      
      const indicadoresObjetivo = indicadores.filter(
        i => i.objetivoId === objetivo.id
      );

      const medicionesPromises = indicadoresObjetivo.map(async (indicador) => {
        const mediciones = await db.select()
          .from(schema.medicionesIndicadores)
          .where(eq(schema.medicionesIndicadores.indicadorId, indicador.id))
          .orderBy(desc(schema.medicionesIndicadores.fechaMedicion))
          .limit(6);
        return { indicador, mediciones };
      });

      const indicadoresConMediciones = await Promise.all(medicionesPromises);

      objetivosData.push({
        objetivo,
        company,
        indicadores: indicadoresConMediciones
      });
    }

    const totalIndicadores = indicadores.length;
    const indicadoresPorTipo = {
      estructura: indicadores.filter(i => i.tipo === 'estructura').length,
      proceso: indicadores.filter(i => i.tipo === 'proceso').length,
      resultado: indicadores.filter(i => i.tipo === 'resultado').length
    };

    let totalMediciones = 0;
    objetivosData.forEach(obj => {
      obj.indicadores.forEach(ind => {
        totalMediciones += ind.mediciones.length;
      });
    });

    return {
      objetivos: objetivosData,
      resumen: {
        totalObjetivos: objetivos.length,
        objetivosCumplidos: objetivos.filter(o => o.estado === 'cumplido').length,
        totalIndicadores,
        indicadoresPorTipo,
        totalMediciones,
        anio: currentYear
      }
    };
  }

  // ============================================================================
  // BILLING & SUBSCRIPTIONS - Sistema de Facturación Wompi (Bloque 4)
  // ============================================================================

  // Subscription Plans
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await db.select().from(schema.subscriptionPlans).orderBy(asc(schema.subscriptionPlans.sortOrder));
  }

  async getSubscriptionPlan(id: string): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.select().from(schema.subscriptionPlans).where(eq(schema.subscriptionPlans.id, id));
    return plan;
  }

  async getSubscriptionPlanByName(name: string): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.select().from(schema.subscriptionPlans).where(eq(schema.subscriptionPlans.name, name));
    return plan;
  }

  // Subscriptions
  async getSubscriptionByCompany(companyId: string): Promise<Subscription | undefined> {
    const [subscription] = await db.select().from(schema.subscriptions).where(eq(schema.subscriptions.companyId, companyId));
    return subscription;
  }

  async getSubscription(id: string): Promise<Subscription | undefined> {
    const [subscription] = await db.select().from(schema.subscriptions).where(eq(schema.subscriptions.id, id));
    return subscription;
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [newSubscription] = await db.insert(schema.subscriptions).values(subscription).returning();
    return newSubscription;
  }

  async updateSubscription(id: string, subscription: Partial<InsertSubscription>): Promise<Subscription | undefined> {
    const [updated] = await db
      .update(schema.subscriptions)
      .set({ ...subscription, updatedAt: new Date() })
      .where(eq(schema.subscriptions.id, id))
      .returning();
    return updated;
  }

  async markSubscriptionActive(id: string, periodStart: Date, periodEnd: Date): Promise<Subscription | undefined> {
    const [updated] = await db
      .update(schema.subscriptions)
      .set({
        status: 'active',
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        updatedAt: new Date()
      })
      .where(eq(schema.subscriptions.id, id))
      .returning();
    return updated;
  }

  async markSubscriptionCanceled(id: string, canceledAt: Date): Promise<Subscription | undefined> {
    const [updated] = await db
      .update(schema.subscriptions)
      .set({
        status: 'canceled',
        canceledAt,
        updatedAt: new Date()
      })
      .where(eq(schema.subscriptions.id, id))
      .returning();
    return updated;
  }

  // Trial Subscriptions (Bloque 4 - Tarea 6)
  async createTrialSubscription(
    companyId: string,
    planId: string,
    trialDays: number
  ): Promise<Subscription> {
    console.log(`🔍 [TRIAL-DB] createTrialSubscription: companyId=${companyId}, planId=${planId}, trialDays=${trialDays}`);
    
    // Hardening: Enforce 7, 14 or 30 day trial limit at storage layer (Architect feedback)
    if (![7, 14, 30].includes(trialDays)) {
      console.error(`❌ [TRIAL-DB] Trial period inválido: ${trialDays}`);
      throw new Error('Trial period must be exactly 7, 14 or 30 days');
    }

    // Anti-abuse: Verify company has NO subscriptions at all (any status) - Architect feedback
    console.log(`🔍 [TRIAL-DB] Verificando suscripciones existentes para empresa ${companyId}...`);
    const anyExisting = await db.select().from(schema.subscriptions)
      .where(eq(schema.subscriptions.companyId, companyId))
      .limit(1);
    
    if (anyExisting.length > 0) {
      console.error(`❌ [TRIAL-DB] Empresa ${companyId} ya tiene suscripción: ${JSON.stringify(anyExisting[0])}`);
      throw new Error('Esta empresa ya tiene una suscripción. Solo se permite un período de prueba por empresa.');
    }
    console.log(`✅ [TRIAL-DB] No hay suscripciones previas para empresa ${companyId}`);

    const now = new Date();
    const trialEnd = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);
    const periodEnd = new Date(trialEnd);

    console.log(`🔍 [TRIAL-DB] Insertando suscripción trial en DB...`);
    try {
      const [subscription] = await db
        .insert(schema.subscriptions)
        .values({
          // Let database generate UUID automatically
          companyId,
          planId,
          status: 'trial',
          trialStart: now,
          trialEnd: trialEnd,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          createdAt: now,
          updatedAt: now
        })
        .returning();

      console.log(`✅ [TRIAL-DB] Suscripción trial creada: id=${subscription.id}`);
      return subscription;
    } catch (dbError: any) {
      console.error(`❌ [TRIAL-DB] Error de base de datos:`, dbError);
      console.error(`❌ [TRIAL-DB] Error message: ${dbError.message}`);
      console.error(`❌ [TRIAL-DB] Error code: ${dbError.code || 'N/A'}`);
      throw dbError;
    }
  }

  async getExpiredTrials(): Promise<Subscription[]> {
    const now = new Date();
    // Architect feedback: Also fetch past_due subscriptions for grace-period tracking
    return await db
      .select()
      .from(schema.subscriptions)
      .where(
        or(
          // Trials that just expired
          and(
            eq(schema.subscriptions.status, 'trial'),
            lt(schema.subscriptions.trialEnd, now)
          ),
          // Past_due subscriptions in grace period (for suspension check)
          eq(schema.subscriptions.status, 'past_due')
        )
      );
  }

  async hasDefaultPaymentSource(companyId: string): Promise<boolean> {
    const [source] = await db
      .select()
      .from(schema.paymentSources)
      .where(
        and(
          eq(schema.paymentSources.companyId, companyId),
          eq(schema.paymentSources.isDefault, 1)
        )
      )
      .limit(1);
    return !!source;
  }

  async transitionSubscriptionStatus(
    id: string,
    newStatus: 'active' | 'past_due' | 'suspended' | 'canceled' | 'expired',
    metadata?: { suspendedAt?: Date; canceledAt?: Date }
  ): Promise<Subscription | undefined> {
    const updateData: any = {
      status: newStatus,
      updatedAt: new Date()
    };

    // Architect feedback: Set pastDueSince when transitioning to past_due
    if (newStatus === 'past_due') {
      updateData.pastDueSince = new Date();
    }

    if (metadata?.suspendedAt) {
      updateData.suspendedAt = metadata.suspendedAt;
    }
    if (metadata?.canceledAt) {
      updateData.canceledAt = metadata.canceledAt;
    }

    const [updated] = await db
      .update(schema.subscriptions)
      .set(updateData)
      .where(eq(schema.subscriptions.id, id))
      .returning();
    
    return updated;
  }

  async getActiveOrTrialSubscriptionByCompany(companyId: string): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(schema.subscriptions)
      .where(
        and(
          eq(schema.subscriptions.companyId, companyId),
          or(
            eq(schema.subscriptions.status, 'trial'),
            eq(schema.subscriptions.status, 'active'),
            eq(schema.subscriptions.status, 'past_due')
          )
        )
      )
      .limit(1);
    return subscription;
  }

  // Payment Sources
  async getPaymentSourcesByCompany(companyId: string): Promise<PaymentSource[]> {
    return await db
      .select()
      .from(schema.paymentSources)
      .where(eq(schema.paymentSources.companyId, companyId))
      .orderBy(desc(schema.paymentSources.createdAt));
  }

  async getPaymentSource(id: string): Promise<PaymentSource | undefined> {
    const [source] = await db.select().from(schema.paymentSources).where(eq(schema.paymentSources.id, id));
    return source;
  }

  async createPaymentSource(source: InsertPaymentSource): Promise<PaymentSource> {
    const [newSource] = await db.insert(schema.paymentSources).values(source).returning();
    return newSource;
  }

  async deletePaymentSource(id: string): Promise<void> {
    await db.delete(schema.paymentSources).where(eq(schema.paymentSources.id, id));
  }

  async setDefaultPaymentSource(companyId: string, sourceId: string): Promise<void> {
    await db.transaction(async (tx) => {
      // Unset all default sources for this company
      await tx
        .update(schema.paymentSources)
        .set({ isDefault: 0 })
        .where(eq(schema.paymentSources.companyId, companyId));
      
      // Set new default
      await tx
        .update(schema.paymentSources)
        .set({ isDefault: 1 })
        .where(eq(schema.paymentSources.id, sourceId));
    });
  }

  // Payment Transactions
  async getTransactionsByCompany(companyId: string): Promise<PaymentTransaction[]> {
    return await db
      .select()
      .from(schema.paymentTransactions)
      .where(eq(schema.paymentTransactions.companyId, companyId))
      .orderBy(desc(schema.paymentTransactions.createdAt));
  }

  async getTransaction(id: string): Promise<PaymentTransaction | undefined> {
    const [transaction] = await db.select().from(schema.paymentTransactions).where(eq(schema.paymentTransactions.id, id));
    return transaction;
  }

  async getTransactionByReference(reference: string): Promise<PaymentTransaction | undefined> {
    const [transaction] = await db.select().from(schema.paymentTransactions).where(eq(schema.paymentTransactions.wompiReference, reference));
    return transaction;
  }

  async getTransactionByWompiId(wompiTransactionId: string): Promise<PaymentTransaction | undefined> {
    const [transaction] = await db.select().from(schema.paymentTransactions).where(eq(schema.paymentTransactions.wompiTransactionId, wompiTransactionId));
    return transaction;
  }

  async createTransaction(transaction: InsertPaymentTransaction): Promise<PaymentTransaction> {
    const [newTransaction] = await db.insert(schema.paymentTransactions).values(transaction).returning();
    return newTransaction;
  }

  async updateTransaction(id: string, transaction: Partial<InsertPaymentTransaction>): Promise<PaymentTransaction | undefined> {
    const [updated] = await db
      .update(schema.paymentTransactions)
      .set(transaction)
      .where(eq(schema.paymentTransactions.id, id))
      .returning();
    return updated;
  }

  async markTransactionApproved(id: string, paidAt: Date): Promise<PaymentTransaction | undefined> {
    const [updated] = await db
      .update(schema.paymentTransactions)
      .set({
        status: 'approved',
        paidAt
      })
      .where(eq(schema.paymentTransactions.id, id))
      .returning();
    return updated;
  }

  async markTransactionFailed(id: string, failedAt: Date, failureCode?: string, failureMessage?: string): Promise<PaymentTransaction | undefined> {
    const [updated] = await db
      .update(schema.paymentTransactions)
      .set({
        status: 'declined',
        failedAt,
        ...(failureCode && { failureCode }),
        ...(failureMessage && { failureMessage })
      })
      .where(eq(schema.paymentTransactions.id, id))
      .returning();
    return updated;
  }

  // Invoices
  async getInvoicesByCompany(companyId: string): Promise<Invoice[]> {
    return await db
      .select()
      .from(schema.invoices)
      .where(eq(schema.invoices.companyId, companyId))
      .orderBy(desc(schema.invoices.createdAt));
  }

  async getInvoice(id: string): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(schema.invoices).where(eq(schema.invoices.id, id));
    return invoice;
  }

  async getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(schema.invoices).where(eq(schema.invoices.invoiceNumber, invoiceNumber));
    return invoice;
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db.insert(schema.invoices).values(invoice).returning();
    return newInvoice;
  }

  async updateInvoice(id: string, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const [updated] = await db
      .update(schema.invoices)
      .set(invoice)
      .where(eq(schema.invoices.id, id))
      .returning();
    return updated;
  }

  async markInvoicePaid(id: string, paidDate: Date, transactionId?: string): Promise<Invoice | undefined> {
    const [updated] = await db
      .update(schema.invoices)
      .set({
        status: 'paid',
        paidDate,
        ...(transactionId && { paymentTransactionId: transactionId })
      })
      .where(eq(schema.invoices.id, id))
      .returning();
    return updated;
  }

  // ============================================================================
  // ANALYTICS & METRICS - Admin Dashboard (Bloque 4 - Tarea 7)
  // ============================================================================

  async getBillingMetrics(): Promise<{
    mrr: number;
    arr: number;
    activeSubscriptions: number;
    trialSubscriptions: number;
    churnRate: number;
    totalRevenue: number;
  }> {
    // Get all subscriptions with plans
    const subscriptions = await db
      .select({
        subscription: schema.subscriptions,
        plan: schema.subscriptionPlans
      })
      .from(schema.subscriptions)
      .leftJoin(
        schema.subscriptionPlans,
        eq(schema.subscriptions.planId, schema.subscriptionPlans.id)
      );

    // Count by status
    const activeCount = subscriptions.filter(s => s.subscription.status === 'active').length;
    const trialCount = subscriptions.filter(s => s.subscription.status === 'trial').length;

    // Calculate MRR (Monthly Recurring Revenue)
    const mrr = subscriptions
      .filter(s => s.subscription.status === 'active' && s.plan)
      .reduce((sum, s) => sum + (s.plan?.priceMonthly || 0), 0);

    // ARR = MRR * 12
    const arr = mrr * 12;

    // Get total revenue from approved transactions
    const transactions = await db
      .select()
      .from(schema.paymentTransactions)
      .where(eq(schema.paymentTransactions.status, 'APPROVED'));

    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);

    // Simple churn rate: canceled in last 30 days / total active 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentCancellations = subscriptions.filter(
      s => s.subscription.status === 'canceled' && 
           s.subscription.canceledAt && 
           new Date(s.subscription.canceledAt) > thirtyDaysAgo
    ).length;

    const churnRate = activeCount > 0 ? (recentCancellations / (activeCount + recentCancellations)) * 100 : 0;

    return {
      mrr,
      arr,
      activeSubscriptions: activeCount,
      trialSubscriptions: trialCount,
      churnRate: Math.round(churnRate * 100) / 100,
      totalRevenue
    };
  }

  async getAllSubscriptionsWithDetails(): Promise<Array<Subscription & { 
    companyName: string; 
    planName: string;
    planPrice: number;
  }>> {
    const results = await db
      .select({
        subscription: schema.subscriptions,
        company: schema.companies,
        plan: schema.subscriptionPlans
      })
      .from(schema.subscriptions)
      .leftJoin(
        schema.companies,
        eq(schema.subscriptions.companyId, schema.companies.id)
      )
      .leftJoin(
        schema.subscriptionPlans,
        eq(schema.subscriptions.planId, schema.subscriptionPlans.id)
      )
      .orderBy(desc(schema.subscriptions.createdAt));

    return results.map(r => ({
      ...r.subscription,
      companyName: r.company?.name || 'N/A',
      planName: r.plan?.name || 'N/A',
      planPrice: r.plan?.priceMonthly || 0
    }));
  }

  async getSubscriptionsDueForBilling(): Promise<Array<Subscription & { 
    companyName: string; 
    planName: string;
    planPrice: number;
    companyNit: string;
    companyAddress?: string;
    companyCity?: string;
    companyEmail?: string;
    companyPhone?: string;
  }>> {
    const today = new Date();
    
    const results = await db
      .select({
        subscription: schema.subscriptions,
        company: schema.companies,
        plan: schema.subscriptionPlans
      })
      .from(schema.subscriptions)
      .leftJoin(
        schema.companies,
        eq(schema.subscriptions.companyId, schema.companies.id)
      )
      .leftJoin(
        schema.subscriptionPlans,
        eq(schema.subscriptions.planId, schema.subscriptionPlans.id)
      )
      .where(
        and(
          eq(schema.subscriptions.status, 'active'),
          lte(schema.subscriptions.currentPeriodEnd, today)
        )
      )
      .orderBy(asc(schema.subscriptions.currentPeriodEnd));

    return results.map(r => ({
      ...r.subscription,
      companyName: r.company?.name || 'N/A',
      planName: r.plan?.name || 'N/A',
      planPrice: r.plan?.priceMonthly || 0,
      companyNit: r.company?.nit || '',
      companyAddress: r.company?.address,
      companyCity: r.company?.city,
      companyEmail: r.company?.contactEmail,
      companyPhone: r.company?.phone
    }));
  }

  async getRevenueTimeSeries(months: number = 6): Promise<Array<{
    month: string;
    revenue: number;
    subscriptions: number;
  }>> {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setMonth(now.getMonth() - months);

    // Get all approved transactions since startDate
    const transactions = await db
      .select()
      .from(schema.paymentTransactions)
      .where(
        and(
          eq(schema.paymentTransactions.status, 'APPROVED'),
          sql`${schema.paymentTransactions.createdAt} >= ${startDate.toISOString()}`
        )
      );

    // Group by month
    const monthlyData: { [key: string]: { revenue: number; subscriptions: Set<string> } } = {};

    transactions.forEach(t => {
      const date = new Date(t.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { revenue: 0, subscriptions: new Set() };
      }
      
      monthlyData[monthKey].revenue += t.amount;
      if (t.subscriptionId) {
        monthlyData[monthKey].subscriptions.add(t.subscriptionId);
      }
    });

    // Convert to array and format
    const result = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        revenue: data.revenue,
        subscriptions: data.subscriptions.size
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return result;
  }

  // ============================================================================
  // PLAN CHANGES - Upgrade/Downgrade System (Bloque 4 - Tarea 8)
  // ============================================================================

  /**
   * Calculate prorated credit from current plan
   * Uses actual billing cycle days for accuracy (not fixed 30)
   * FIX: Guards against edge cases (expired periods, zero-day cycles)
   */
  async calculateProration(
    subscription: Subscription,
    currentPlan: SubscriptionPlan
  ): Promise<{
    proratedCredit: number;
    remainingDays: number;
    totalCycleDays: number;
  }> {
    const now = new Date();
    const periodEnd = new Date(subscription.currentPeriodEnd);
    const periodStart = new Date(subscription.currentPeriodStart);

    // Calculate actual cycle length in days (minimum 1 to prevent division by zero)
    const totalCycleDays = Math.max(1, Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Calculate remaining days (0 if period already ended)
    const remainingDays = Math.max(0, Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    // Calculate prorated credit: (monthly price / cycle days) * remaining days
    // Returns 0 if period already ended
    const dailyRate = currentPlan.priceMonthly / totalCycleDays;
    const proratedCredit = Math.round(dailyRate * remainingDays);

    return {
      proratedCredit,
      remainingDays,
      totalCycleDays
    };
  }

  /**
   * Validate if plan change is allowed
   * FIX: Now returns BLOCKING errors for limit violations (unless admin override)
   * Returns { errors: string[], warnings: string[] }
   */
  async validatePlanChange(
    subscription: Subscription,
    oldPlan: SubscriptionPlan,
    newPlan: SubscriptionPlan,
    companyId: string,
    isAdminOverride: boolean = false
  ): Promise<{ errors: string[], warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Check status (CRITICAL - always block)
    if (subscription.status !== 'active' && subscription.status !== 'trial') {
      errors.push(`Cannot change plan: subscription status is '${subscription.status}'. Only active or trial subscriptions can be changed.`);
      return { errors, warnings }; // Critical - stop here
    }

    // 2. Check current usage against new plan limits (BLOCKING unless admin override)
    const workers = await db.select().from(schema.workers).where(eq(schema.workers.companyId, companyId));
    const users = await db.select().from(schema.users).where(eq(schema.users.companyId, companyId));

    if (newPlan.maxWorkers !== -1 && workers.length > newPlan.maxWorkers) {
      const msg = `Current workers (${workers.length}) exceeds new plan limit (${newPlan.maxWorkers}). Please reduce workers before downgrading.`;
      if (isAdminOverride) {
        warnings.push(`[ADMIN OVERRIDE] ${msg}`);
      } else {
        errors.push(msg);
      }
    }

    if (newPlan.maxUsers !== -1 && users.length > newPlan.maxUsers) {
      const msg = `Current users (${users.length}) exceeds new plan limit (${newPlan.maxUsers}). Please reduce users before downgrading.`;
      if (isAdminOverride) {
        warnings.push(`[ADMIN OVERRIDE] ${msg}`);
      } else {
        errors.push(msg);
      }
    }

    // 3. Check feature compatibility (informational warning only)
    if (oldPlan.priceMonthly > newPlan.priceMonthly) {
      // Downgrade - check if current plan has features not in new plan
      const oldFeatures = oldPlan.features || [];
      const newFeatures = newPlan.features || [];
      
      const missingFeatures = oldFeatures.filter(f => !newFeatures.includes(f));
      if (missingFeatures.length > 0) {
        warnings.push(`Downgrade will remove access to: ${missingFeatures.join(', ')}. Data will be preserved but not accessible.`);
      }
    }

    return { errors, warnings };
  }

  /**
   * Quote plan change (read-only - no state mutations)
   * Calculates proration and validates change WITHOUT committing anything
   * Use this BEFORE creating payment intent to preview costs
   */
  async quotePlanChange(params: {
    subscriptionId: string;
    newPlanId: string;
    isAdminOverride?: boolean;
  }): Promise<{
    subscription: Subscription;
    oldPlan: SubscriptionPlan;
    newPlan: SubscriptionPlan;
    proratedCredit: number;
    proratedNewPlanCost: number;
    amountToCharge: number;
    changeType: 'upgrade' | 'downgrade' | 'trial_conversion';
    requiresPayment: boolean;
    validationErrors: string[];
    validationWarnings: string[];
    remainingDays: number;
    totalCycleDays: number;
    creditFromOldPlan: number;
    chargeForNewPlan: number;
  }> {
    // Get subscription (no lock - read-only)
    const subscription = await this.getSubscription(params.subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const oldPlan = await this.getSubscriptionPlan(subscription.planId);
    const newPlan = await this.getSubscriptionPlan(params.newPlanId);
    
    if (!oldPlan || !newPlan) {
      throw new Error('Plan not found');
    }

    // Validate change
    const { errors, warnings } = await this.validatePlanChange(
      subscription,
      oldPlan,
      newPlan,
      subscription.companyId,
      params.isAdminOverride ?? false
    );

    // Calculate proration for old plan (credit for remaining days)
    const { proratedCredit, remainingDays, totalCycleDays } = await this.calculateProration(subscription, oldPlan);
    
    // Calculate prorated cost for new plan (for remaining days only)
    const dailyRateNewPlan = newPlan.priceMonthly / totalCycleDays;
    const proratedNewPlanCost = Math.round(dailyRateNewPlan * remainingDays);
    
    // Amount to charge = new plan prorated cost - old plan credit
    // This is the difference for the remaining period
    const amountToCharge = proratedNewPlanCost - proratedCredit;

    // Determine change type
    let changeType: 'upgrade' | 'downgrade' | 'trial_conversion';
    if (subscription.status === 'trial') {
      changeType = 'trial_conversion';
    } else if (newPlan.priceMonthly > oldPlan.priceMonthly) {
      changeType = 'upgrade';
    } else {
      changeType = 'downgrade';
    }

    const requiresPayment = amountToCharge > 0;

    return {
      subscription,
      oldPlan,
      newPlan,
      proratedCredit,
      proratedNewPlanCost,
      amountToCharge: Math.max(0, amountToCharge),
      changeType,
      requiresPayment,
      validationErrors: errors,
      validationWarnings: warnings,
      remainingDays,
      totalCycleDays,
      creditFromOldPlan: proratedCredit,
      chargeForNewPlan: proratedNewPlanCost
    };
  }

  /**
   * Commit plan change (transactional with row-level locking)
   * ARCHITECT FIX: Now accepts wompiTransactionId for paid upgrades
   * For upgrades: requires wompiTransactionId, creates pending_payment record
   * For downgrades: applies immediately, stores credit in metadata
   */
  async applyPlanChange(params: {
    subscriptionId: string;
    newPlanId: string;
    requestedBy: string;
    requestedByRole: string;
    isAdminOverride: boolean;
    ipAddress?: string;
    userAgent?: string;
    wompiTransactionId?: string; // Link to Wompi transaction for webhook reconciliation
  }): Promise<{
    success: boolean;
    planChangeId: string;
    changeType: 'upgrade' | 'downgrade' | 'trial_conversion';
    proratedCredit: number;
    amountToCharge: number;
    requiresPayment: boolean;
    paymentTransactionId?: string;
    warnings: string[];
  }> {
    // Execute entire operation in a transaction
    return await db.transaction(async (tx) => {
      // Get subscription with plan (with row-level lock to prevent concurrent changes)
      const [subscription] = await tx
        .select()
        .from(schema.subscriptions)
        .where(eq(schema.subscriptions.id, params.subscriptionId))
        .for('update'); // Row-level lock

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      const oldPlan = await this.getSubscriptionPlan(subscription.planId);
      const newPlan = await this.getSubscriptionPlan(params.newPlanId);
      
      if (!oldPlan || !newPlan) {
        throw new Error('Plan not found');
      }

      // Validate change
      const { errors, warnings } = await this.validatePlanChange(
        subscription,
        oldPlan,
        newPlan,
        subscription.companyId,
        params.isAdminOverride
      );
      
      // Block on errors (unless admin override allows it)
      if (errors.length > 0) {
        throw new Error(errors.join('; '));
      }

      // Calculate proration
      const { proratedCredit, remainingDays, totalCycleDays } = await this.calculateProration(subscription, oldPlan);
      const amountToCharge = newPlan.priceMonthly - proratedCredit;

      // Determine change type
      let changeType: 'upgrade' | 'downgrade' | 'trial_conversion';
      if (subscription.status === 'trial') {
        changeType = 'trial_conversion';
      } else if (newPlan.priceMonthly > oldPlan.priceMonthly) {
        changeType = 'upgrade';
      } else {
        changeType = 'downgrade';
      }

      const requiresPayment = amountToCharge > 0;
      const now = new Date();

      // Create plan change history record (inside transaction)
      const [planChange] = await tx.insert(schema.planChangeHistory).values({
        subscriptionId: params.subscriptionId,
        companyId: subscription.companyId,
        oldPlanId: subscription.planId,
        newPlanId: params.newPlanId,
        billingInterval: subscription.billingInterval,
        billingCycleDays: totalCycleDays,
        proratedCredit,
        amountCharged: Math.max(0, amountToCharge),
        changeType,
        status: requiresPayment ? 'pending_payment' : 'completed',
        wompiTransactionId: params.wompiTransactionId || null, // Link for webhook reconciliation
        validationWarnings: warnings,
        requestedBy: params.requestedBy,
        requestedByRole: params.requestedByRole as any,
        isAdminOverride: params.isAdminOverride ? 1 : 0,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        effectiveDate: requiresPayment ? now : now,
        completedAt: requiresPayment ? undefined : now,
      }).returning();

      // If downgrade or trial conversion with credit: apply immediately (inside transaction)
      if (!requiresPayment) {
        await tx.update(schema.subscriptions)
          .set({
            planId: params.newPlanId,
            currentPeriodStart: now,
            currentPeriodEnd: new Date(now.getTime() + totalCycleDays * 24 * 60 * 60 * 1000),
            status: 'active',
            // Store credit in metadata if downgrade created negative amount
            metadata: amountToCharge < 0 ? {
              credit: Math.abs(amountToCharge),
              creditDate: now.toISOString(),
              creditReason: `Downgrade from ${oldPlan.name} to ${newPlan.name}`,
              lastPlanChangeId: planChange.id
            } as any : subscription.metadata
          })
          .where(eq(schema.subscriptions.id, params.subscriptionId));
      }

      return {
        success: true,
        planChangeId: planChange.id,
        changeType,
        proratedCredit,
        amountToCharge: Math.max(0, amountToCharge),
        requiresPayment,
        warnings
      };
    });
  }

  /**
   * Get plan change history for a subscription
   */
  async getPlanChangeHistory(subscriptionId: string): Promise<any[]> {
    const history = await db
      .select()
      .from(schema.planChangeHistory)
      .where(eq(schema.planChangeHistory.subscriptionId, subscriptionId))
      .orderBy(desc(schema.planChangeHistory.requestedAt));
    
    return history;
  }

  /**
   * Update plan change status (for rollback scenarios)
   * Used when payment setup fails to mark change as failed
   */
  async updatePlanChangeStatus(
    planChangeId: string,
    status: 'pending_payment' | 'completed' | 'failed' | 'cancelled'
  ): Promise<void> {
    await db
      .update(schema.planChangeHistory)
      .set({ 
        status,
        completedAt: status === 'completed' ? new Date() : undefined
      })
      .where(eq(schema.planChangeHistory.id, planChangeId));
  }

  /**
   * Complete pending plan change after webhook confirms payment (Bloque 4 - Task 11)
   * Uses payment_link_id from Wompi webhook to find pending plan change
   * This is called by Wompi webhook when transaction status = APPROVED
   * Atomically updates subscription record and marks plan change as completed
   */
  async completePendingPlanChangeByPaymentLink(paymentLinkId: string): Promise<void> {
    await db.transaction(async (tx) => {
      // Find pending plan change by payment link ID (with row lock)
      const [planChange] = await tx
        .select()
        .from(schema.planChangeHistory)
        .where(
          and(
            eq(schema.planChangeHistory.wompiTransactionId, paymentLinkId),
            eq(schema.planChangeHistory.status, 'pending_payment')
          )
        )
        .for('update'); // Row-level lock for idempotency

      if (!planChange) {
        // Already completed or not found - idempotent behavior
        console.log(`No pending plan change found for payment link ${paymentLinkId}`);
        return;
      }

      // Get subscription (with lock)
      const [subscription] = await tx
        .select()
        .from(schema.subscriptions)
        .where(eq(schema.subscriptions.id, planChange.subscriptionId))
        .for('update');

      if (!subscription) {
        throw new Error(`Subscription ${planChange.subscriptionId} not found`);
      }

      // Get new plan details
      const newPlan = await this.getSubscriptionPlan(planChange.newPlanId);
      if (!newPlan) {
        throw new Error(`Plan ${planChange.newPlanId} not found`);
      }

      const now = new Date();

      // Update subscription to new plan
      await tx
        .update(schema.subscriptions)
        .set({
          planId: planChange.newPlanId,
          currentPeriodStart: now,
          currentPeriodEnd: new Date(now.getTime() + planChange.billingCycleDays * 24 * 60 * 60 * 1000),
          status: 'active',
          metadata: {
            ...(subscription.metadata as any || {}),
            lastPlanChangeId: planChange.id,
            lastUpgradeDate: now.toISOString()
          } as any
        })
        .where(eq(schema.subscriptions.id, planChange.subscriptionId));

      // Mark plan change as completed
      await tx
        .update(schema.planChangeHistory)
        .set({
          status: 'completed',
          completedAt: now,
          effectiveDate: now
        })
        .where(eq(schema.planChangeHistory.id, planChange.id));

      console.log(`Plan change ${planChange.id} completed via webhook for payment link ${paymentLinkId}`);
    });
  }

  /**
   * LEGACY: Complete pending plan change by wompiTransactionId (deprecated)
   * Kept for backward compatibility - use completePendingPlanChangeByPaymentLink instead
   */
  async completePendingPlanChange(wompiTransactionId: string): Promise<void> {
    await db.transaction(async (tx) => {
      // Find pending plan change by Wompi transaction ID (with row lock)
      const [planChange] = await tx
        .select()
        .from(schema.planChangeHistory)
        .where(
          and(
            eq(schema.planChangeHistory.wompiTransactionId, wompiTransactionId),
            eq(schema.planChangeHistory.status, 'pending_payment')
          )
        )
        .for('update'); // Row-level lock for idempotency

      if (!planChange) {
        // Already completed or not found - idempotent behavior
        console.log(`No pending plan change found for Wompi transaction ${wompiTransactionId}`);
        return;
      }

      // Get subscription (with lock)
      const [subscription] = await tx
        .select()
        .from(schema.subscriptions)
        .where(eq(schema.subscriptions.id, planChange.subscriptionId))
        .for('update');

      if (!subscription) {
        throw new Error(`Subscription ${planChange.subscriptionId} not found`);
      }

      // Get new plan details
      const newPlan = await this.getSubscriptionPlan(planChange.newPlanId);
      if (!newPlan) {
        throw new Error(`Plan ${planChange.newPlanId} not found`);
      }

      const now = new Date();

      // Update subscription to new plan
      await tx
        .update(schema.subscriptions)
        .set({
          planId: planChange.newPlanId,
          currentPeriodStart: now,
          currentPeriodEnd: new Date(now.getTime() + planChange.billingCycleDays * 24 * 60 * 60 * 1000),
          status: 'active',
          metadata: {
            ...(subscription.metadata as any || {}),
            lastPlanChangeId: planChange.id,
            lastUpgradeDate: now.toISOString()
          } as any
        })
        .where(eq(schema.subscriptions.id, planChange.subscriptionId));

      // Mark plan change as completed
      await tx
        .update(schema.planChangeHistory)
        .set({
          status: 'completed',
          completedAt: now,
          effectiveDate: now
        })
        .where(eq(schema.planChangeHistory.id, planChange.id));

      console.log(`Plan change ${planChange.id} completed via webhook for Wompi transaction ${wompiTransactionId}`);
    });
  }

  /**
   * Fail pending plan change by payment link ID (Bloque 4 - Task 11)
   * Called by Wompi webhook when transaction status = DECLINED/ERROR
   */
  async failPendingPlanChangeByPaymentLink(paymentLinkId: string, reason: string): Promise<void> {
    await db.transaction(async (tx) => {
      const [planChange] = await tx
        .select()
        .from(schema.planChangeHistory)
        .where(
          and(
            eq(schema.planChangeHistory.wompiTransactionId, paymentLinkId),
            eq(schema.planChangeHistory.status, 'pending_payment')
          )
        )
        .for('update');

      if (!planChange) {
        console.log(`No pending plan change found for failed payment link ${paymentLinkId}`);
        return;
      }

      // Mark as failed
      await tx
        .update(schema.planChangeHistory)
        .set({
          status: 'failed',
          metadata: {
            ...(planChange.metadata as any || {}),
            failureReason: reason,
            failedAt: new Date().toISOString()
          } as any
        })
        .where(eq(schema.planChangeHistory.id, planChange.id));

      console.log(`Plan change ${planChange.id} failed: ${reason}`);
    });
  }

  /**
   * LEGACY: Fail pending plan change by wompiTransactionId (deprecated)
   * Kept for backward compatibility - use failPendingPlanChangeByPaymentLink instead
   */
  async failPendingPlanChange(wompiTransactionId: string, reason: string): Promise<void> {
    await db.transaction(async (tx) => {
      const [planChange] = await tx
        .select()
        .from(schema.planChangeHistory)
        .where(
          and(
            eq(schema.planChangeHistory.wompiTransactionId, wompiTransactionId),
            eq(schema.planChangeHistory.status, 'pending_payment')
          )
        )
        .for('update');

      if (!planChange) {
        console.log(`No pending plan change found for failed Wompi transaction ${wompiTransactionId}`);
        return;
      }

      // Mark as failed
      await tx
        .update(schema.planChangeHistory)
        .set({
          status: 'failed',
          metadata: {
            ...(planChange.metadata as any || {}),
            failureReason: reason,
            failedAt: new Date().toISOString()
          } as any
        })
        .where(eq(schema.planChangeHistory.id, planChange.id));

      console.log(`Plan change ${planChange.id} failed: ${reason}`);
    });
  }

  // ============================================================================
  // INVOICING - Automated Invoice Generation (Bloque 4 - Tarea 9)
  // ============================================================================

  /**
   * Generate next sequential invoice number (SST-2025-001, SST-2025-002, etc.)
   */
  async getNextInvoiceNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `SST-${currentYear}-`;

    // Get latest invoice for this year
    const [lastInvoice] = await db
      .select()
      .from(schema.invoices)
      .where(sql`${schema.invoices.invoiceNumber} LIKE ${prefix + '%'}`)
      .orderBy(desc(schema.invoices.invoiceNumber))
      .limit(1);

    if (!lastInvoice) {
      return `${prefix}001`;
    }

    // Extract number from SST-2025-123 format
    const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-').pop() || '0', 10);
    const nextNumber = lastNumber + 1;

    return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
  }

  /**
   * Generate invoice for a subscription billing period (Bloque 4 - Tarea 9)
   * Creates invoice record with sequential numbering
   * TODO: Generate PDF using PDFKit (deferred to production hardening)
   */
  async generateInvoice(params: {
    subscriptionId: string;
    companyId: string;
    amount: number;
    periodStart: Date;
    periodEnd: Date;
    planChangeId?: string;
    description?: string;
  }): Promise<string> {
    // Get subscription details
    const subscription = await this.getSubscription(params.subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // BILLING SECURITY: Validate subscription data before generating invoice
    validateSubscriptionForBilling(subscription);

    const company = await this.getCompany(params.companyId);
    if (!company) {
      throw new Error('Company not found');
    }

    // BILLING SECURITY: Validate company data before generating invoice
    validateCompanyForBilling(company);

    // Generate next invoice number
    const invoiceNumber = await this.getNextInvoiceNumber();

    // BILLING SECURITY: Prepare invoice data with validation
    const invoiceData = {
      companyId: params.companyId,
      subscriptionId: params.subscriptionId,
      invoiceNumber,
      status: 'draft' as const,
      subtotal: params.amount,
      taxAmount: 0,
      total: params.amount,
      currency: 'COP',
      periodStart: params.periodStart,
      periodEnd: params.periodEnd,
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      customerName: company.name,
      customerNit: company.nit || '',
      customerEmail: company.contactEmail || '',
      customerAddress: `${company.address || ''}, ${company.city || ''}`,
      lineItems: JSON.stringify([{
        description: params.description || `Plan de suscripción`,
        quantity: 1,
        unitPrice: params.amount,
        total: params.amount
      }]),
    };

    // Validate invoice data BEFORE inserting (prevents NOT NULL constraint errors)
    validateInvoiceData(invoiceData);

    // Create invoice record (data already validated)
    const [invoice] = await db.insert(schema.invoices).values(invoiceData).returning();

    console.log(`Invoice ${invoiceNumber} generated for subscription ${params.subscriptionId}`);

    // TODO: Generate PDF using PDFKit (Tarea 9 - deferred to hardening)
    // TODO: Send email with invoice attached (Tarea 12 - deferred to hardening)

    return invoice.invoiceNumber;
  }

  /**
   * Get company admin email recipients for billing notifications (Bloque 4 - Tarea 16)
   * Returns array of admin user emails for a given company
   */
  async getCompanyAdminRecipients(companyId: string): Promise<string[]> {
    const admins = await db
      .select()
      .from(schema.users)
      .where(
        and(
          eq(schema.users.companyId, companyId),
          eq(schema.users.role, 'admin')
        )
      );

    return admins.map(admin => admin.email).filter(email => !!email);
  }

  // ============================================================================
  // SST DOCUMENTS - Conservación de Documentación (Estándar 2.5.1 - Res. 0312/2019)
  // ============================================================================

  async getSstDocuments(companyId: string): Promise<SstDocument[]> {
    return await db.select().from(schema.sstDocuments)
      .where(eq(schema.sstDocuments.companyId, companyId))
      .orderBy(desc(schema.sstDocuments.createdAt));
  }

  async getAllSstDocuments(): Promise<SstDocument[]> {
    return await db.select().from(schema.sstDocuments)
      .orderBy(desc(schema.sstDocuments.createdAt));
  }

  async getSstDocument(id: string, companyId: string): Promise<SstDocument | undefined> {
    const [doc] = await db.select().from(schema.sstDocuments)
      .where(and(
        eq(schema.sstDocuments.id, id),
        eq(schema.sstDocuments.companyId, companyId)
      ));
    return doc;
  }

  async getSstDocumentById(id: string): Promise<SstDocument | undefined> {
    const [doc] = await db.select().from(schema.sstDocuments)
      .where(eq(schema.sstDocuments.id, id));
    return doc;
  }

  async createSstDocument(doc: InsertSstDocument, companyId: string): Promise<SstDocument> {
    const [newDoc] = await db.insert(schema.sstDocuments).values({
      ...doc,
      companyId,
    }).returning();
    return newDoc;
  }

  async updateSstDocument(id: string, doc: Partial<InsertSstDocument>, companyId: string): Promise<SstDocument | undefined> {
    const [updated] = await db.update(schema.sstDocuments)
      .set({
        ...doc,
        updatedAt: new Date(),
      })
      .where(and(
        eq(schema.sstDocuments.id, id),
        eq(schema.sstDocuments.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteSstDocument(id: string, companyId: string): Promise<void> {
    await db.delete(schema.sstDocuments)
      .where(and(
        eq(schema.sstDocuments.id, id),
        eq(schema.sstDocuments.companyId, companyId)
      ));
  }

  async getSstDocumentVersions(documentId: string): Promise<SstDocumentVersion[]> {
    return await db.select().from(schema.sstDocumentVersions)
      .where(eq(schema.sstDocumentVersions.documentId, documentId))
      .orderBy(desc(schema.sstDocumentVersions.createdAt));
  }

  async createSstDocumentVersion(version: InsertSstDocumentVersion): Promise<SstDocumentVersion> {
    const [newVersion] = await db.insert(schema.sstDocumentVersions).values(version).returning();
    return newVersion;
  }

  async logSstDocumentAccess(log: InsertSstDocumentAccessLog): Promise<SstDocumentAccessLog> {
    const [newLog] = await db.insert(schema.sstDocumentAccessLog).values(log).returning();
    return newLog;
  }

  async getSstDocumentAccessLog(documentId: string): Promise<SstDocumentAccessLog[]> {
    return await db.select().from(schema.sstDocumentAccessLog)
      .where(eq(schema.sstDocumentAccessLog.documentId, documentId))
      .orderBy(desc(schema.sstDocumentAccessLog.accessedAt));
  }

  async getSstDocumentAlerts(companyId: string): Promise<SstDocumentAlert[]> {
    return await db
      .select({
        id: schema.sstDocumentAlerts.id,
        documentId: schema.sstDocumentAlerts.documentId,
        alertType: schema.sstDocumentAlerts.alertType,
        scheduledDate: schema.sstDocumentAlerts.scheduledDate,
        sentAt: schema.sstDocumentAlerts.sentAt,
        recipientIds: schema.sstDocumentAlerts.recipientIds,
        subject: schema.sstDocumentAlerts.subject,
        message: schema.sstDocumentAlerts.message,
        status: schema.sstDocumentAlerts.status,
        createdAt: schema.sstDocumentAlerts.createdAt,
      })
      .from(schema.sstDocumentAlerts)
      .innerJoin(schema.sstDocuments, eq(schema.sstDocumentAlerts.documentId, schema.sstDocuments.id))
      .where(eq(schema.sstDocuments.companyId, companyId))
      .orderBy(desc(schema.sstDocumentAlerts.scheduledDate));
  }

  async createSstDocumentAlert(alert: InsertSstDocumentAlert): Promise<SstDocumentAlert> {
    const [newAlert] = await db.insert(schema.sstDocumentAlerts).values(alert).returning();
    return newAlert;
  }

  async updateSstDocumentAlert(id: string, alert: Partial<InsertSstDocumentAlert>): Promise<SstDocumentAlert | undefined> {
    const [updated] = await db.update(schema.sstDocumentAlerts)
      .set(alert)
      .where(eq(schema.sstDocumentAlerts.id, id))
      .returning();
    return updated;
  }

  async getExpiringDocuments(companyId: string, days: number): Promise<SstDocument[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return await db.select().from(schema.sstDocuments)
      .where(and(
        eq(schema.sstDocuments.companyId, companyId),
        eq(schema.sstDocuments.status, 'vigente'),
        lte(schema.sstDocuments.expirationDate, futureDate)
      ))
      .orderBy(asc(schema.sstDocuments.expirationDate));
  }

  // ============================================================================
  // PLAN DE EMERGENCIAS - Gestión de Amenazas (Res. 0312/2019)
  // ============================================================================

  // Planes de Emergencia
  async getPlanesEmergencia(companyId: string): Promise<PlanEmergencia[]> {
    return await db.select().from(schema.planesEmergencia)
      .where(eq(schema.planesEmergencia.companyId, companyId))
      .orderBy(desc(schema.planesEmergencia.createdAt));
  }

  async getAllPlanesEmergencia(): Promise<PlanEmergencia[]> {
    return await db.select().from(schema.planesEmergencia)
      .orderBy(desc(schema.planesEmergencia.createdAt));
  }

  async getPlanEmergencia(id: string, companyId: string): Promise<PlanEmergencia | undefined> {
    const [plan] = await db.select().from(schema.planesEmergencia)
      .where(and(
        eq(schema.planesEmergencia.id, id),
        eq(schema.planesEmergencia.companyId, companyId)
      ));
    return plan;
  }

  async getPlanEmergenciaById(id: string): Promise<PlanEmergencia | undefined> {
    const [plan] = await db.select().from(schema.planesEmergencia)
      .where(eq(schema.planesEmergencia.id, id));
    return plan;
  }

  async createPlanEmergencia(plan: InsertPlanEmergencia, companyId: string): Promise<PlanEmergencia> {
    const [newPlan] = await db.insert(schema.planesEmergencia).values({
      ...plan,
      companyId,
    }).returning();
    return newPlan;
  }

  async updatePlanEmergencia(id: string, plan: Partial<InsertPlanEmergencia>, companyId: string): Promise<PlanEmergencia | undefined> {
    const [updated] = await db.update(schema.planesEmergencia)
      .set({
        ...plan,
        updatedAt: new Date(),
      })
      .where(and(
        eq(schema.planesEmergencia.id, id),
        eq(schema.planesEmergencia.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deletePlanEmergencia(id: string, companyId: string): Promise<void> {
    await db.delete(schema.planesEmergencia)
      .where(and(
        eq(schema.planesEmergencia.id, id),
        eq(schema.planesEmergencia.companyId, companyId)
      ));
  }

  // Brigadas de Emergencia
  async getBrigadasEmergencia(companyId: string): Promise<BrigadaEmergencia[]> {
    return await db.select().from(schema.brigadasEmergencia)
      .where(eq(schema.brigadasEmergencia.companyId, companyId))
      .orderBy(desc(schema.brigadasEmergencia.createdAt));
  }

  async getAllBrigadasEmergencia(): Promise<BrigadaEmergencia[]> {
    return await db.select().from(schema.brigadasEmergencia)
      .orderBy(desc(schema.brigadasEmergencia.createdAt));
  }

  async getBrigadaEmergencia(id: string, companyId: string): Promise<BrigadaEmergencia | undefined> {
    const [brigada] = await db.select().from(schema.brigadasEmergencia)
      .where(and(
        eq(schema.brigadasEmergencia.id, id),
        eq(schema.brigadasEmergencia.companyId, companyId)
      ));
    return brigada;
  }

  async getBrigadaEmergenciaById(id: string): Promise<BrigadaEmergencia | undefined> {
    const [brigada] = await db.select().from(schema.brigadasEmergencia)
      .where(eq(schema.brigadasEmergencia.id, id));
    return brigada;
  }

  async createBrigadaEmergencia(brigada: InsertBrigadaEmergencia, companyId: string): Promise<BrigadaEmergencia> {
    const [newBrigada] = await db.insert(schema.brigadasEmergencia).values({
      ...brigada,
      companyId,
    }).returning();
    return newBrigada;
  }

  async updateBrigadaEmergencia(id: string, brigada: Partial<InsertBrigadaEmergencia>, companyId: string): Promise<BrigadaEmergencia | undefined> {
    const [updated] = await db.update(schema.brigadasEmergencia)
      .set(brigada)
      .where(and(
        eq(schema.brigadasEmergencia.id, id),
        eq(schema.brigadasEmergencia.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteBrigadaEmergencia(id: string, companyId: string): Promise<void> {
    await db.delete(schema.brigadasEmergencia)
      .where(and(
        eq(schema.brigadasEmergencia.id, id),
        eq(schema.brigadasEmergencia.companyId, companyId)
      ));
  }

  // Miembros de Brigada
  async getMiembrosBrigada(brigadaId: string): Promise<MiembroBrigada[]> {
    return await db.select().from(schema.miembrosBrigada)
      .where(eq(schema.miembrosBrigada.brigadaId, brigadaId))
      .orderBy(desc(schema.miembrosBrigada.createdAt));
  }

  async getMiembroBrigada(id: string): Promise<MiembroBrigada | undefined> {
    const [miembro] = await db.select().from(schema.miembrosBrigada)
      .where(eq(schema.miembrosBrigada.id, id));
    return miembro;
  }

  async createMiembroBrigada(miembro: InsertMiembroBrigada): Promise<MiembroBrigada> {
    const [newMiembro] = await db.insert(schema.miembrosBrigada).values(miembro).returning();
    return newMiembro;
  }

  async updateMiembroBrigada(id: string, miembro: Partial<InsertMiembroBrigada>): Promise<MiembroBrigada | undefined> {
    const [updated] = await db.update(schema.miembrosBrigada)
      .set(miembro)
      .where(eq(schema.miembrosBrigada.id, id))
      .returning();
    return updated;
  }

  async deleteMiembroBrigada(id: string): Promise<void> {
    await db.delete(schema.miembrosBrigada)
      .where(eq(schema.miembrosBrigada.id, id));
  }

  // Análisis de Vulnerabilidad
  async getAnalisisVulnerabilidad(companyId: string): Promise<AnalisisVulnerabilidad[]> {
    return await db.select().from(schema.analisisVulnerabilidad)
      .where(eq(schema.analisisVulnerabilidad.companyId, companyId))
      .orderBy(desc(schema.analisisVulnerabilidad.createdAt));
  }

  async getAllAnalisisVulnerabilidad(): Promise<AnalisisVulnerabilidad[]> {
    return await db.select().from(schema.analisisVulnerabilidad)
      .orderBy(desc(schema.analisisVulnerabilidad.createdAt));
  }

  async getAnalisisVulnerabilidadItem(id: string, companyId: string): Promise<AnalisisVulnerabilidad | undefined> {
    const [analisis] = await db.select().from(schema.analisisVulnerabilidad)
      .where(and(
        eq(schema.analisisVulnerabilidad.id, id),
        eq(schema.analisisVulnerabilidad.companyId, companyId)
      ));
    return analisis;
  }

  async getAnalisisVulnerabilidadById(id: string): Promise<AnalisisVulnerabilidad | undefined> {
    const [analisis] = await db.select().from(schema.analisisVulnerabilidad)
      .where(eq(schema.analisisVulnerabilidad.id, id));
    return analisis;
  }

  async createAnalisisVulnerabilidad(analisis: InsertAnalisisVulnerabilidad, companyId: string): Promise<AnalisisVulnerabilidad> {
    const [newAnalisis] = await db.insert(schema.analisisVulnerabilidad).values({
      ...analisis,
      companyId,
    }).returning();
    return newAnalisis;
  }

  async updateAnalisisVulnerabilidad(id: string, analisis: Partial<InsertAnalisisVulnerabilidad>, companyId: string): Promise<AnalisisVulnerabilidad | undefined> {
    const [updated] = await db.update(schema.analisisVulnerabilidad)
      .set(analisis)
      .where(and(
        eq(schema.analisisVulnerabilidad.id, id),
        eq(schema.analisisVulnerabilidad.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteAnalisisVulnerabilidad(id: string, companyId: string): Promise<void> {
    await db.delete(schema.analisisVulnerabilidad)
      .where(and(
        eq(schema.analisisVulnerabilidad.id, id),
        eq(schema.analisisVulnerabilidad.companyId, companyId)
      ));
  }

  // Recursos de Emergencia
  async getRecursosEmergencia(companyId: string): Promise<RecursoEmergencia[]> {
    return await db.select().from(schema.recursosEmergencia)
      .where(eq(schema.recursosEmergencia.companyId, companyId))
      .orderBy(desc(schema.recursosEmergencia.createdAt));
  }

  async getAllRecursosEmergencia(): Promise<RecursoEmergencia[]> {
    return await db.select().from(schema.recursosEmergencia)
      .orderBy(desc(schema.recursosEmergencia.createdAt));
  }

  async getRecursoEmergencia(id: string, companyId: string): Promise<RecursoEmergencia | undefined> {
    const [recurso] = await db.select().from(schema.recursosEmergencia)
      .where(and(
        eq(schema.recursosEmergencia.id, id),
        eq(schema.recursosEmergencia.companyId, companyId)
      ));
    return recurso;
  }

  async getRecursoEmergenciaById(id: string): Promise<RecursoEmergencia | undefined> {
    const [recurso] = await db.select().from(schema.recursosEmergencia)
      .where(eq(schema.recursosEmergencia.id, id));
    return recurso;
  }

  async createRecursoEmergencia(recurso: InsertRecursoEmergencia, companyId: string): Promise<RecursoEmergencia> {
    const [newRecurso] = await db.insert(schema.recursosEmergencia).values({
      ...recurso,
      companyId,
    }).returning();
    return newRecurso;
  }

  async updateRecursoEmergencia(id: string, recurso: Partial<InsertRecursoEmergencia>, companyId: string): Promise<RecursoEmergencia | undefined> {
    const [updated] = await db.update(schema.recursosEmergencia)
      .set({
        ...recurso,
        updatedAt: new Date(),
      })
      .where(and(
        eq(schema.recursosEmergencia.id, id),
        eq(schema.recursosEmergencia.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteRecursoEmergencia(id: string, companyId: string): Promise<void> {
    await db.delete(schema.recursosEmergencia)
      .where(and(
        eq(schema.recursosEmergencia.id, id),
        eq(schema.recursosEmergencia.companyId, companyId)
      ));
  }

  // Inspecciones de Recursos de Emergencia
  async getInspeccionesRecursosEmergencia(recursoId: string): Promise<InspeccionRecursoEmergencia[]> {
    return await db.select().from(schema.inspeccionesRecursosEmergencia)
      .where(eq(schema.inspeccionesRecursosEmergencia.recursoId, recursoId))
      .orderBy(desc(schema.inspeccionesRecursosEmergencia.createdAt));
  }

  async getInspeccionRecursoEmergencia(id: string): Promise<InspeccionRecursoEmergencia | undefined> {
    const [inspeccion] = await db.select().from(schema.inspeccionesRecursosEmergencia)
      .where(eq(schema.inspeccionesRecursosEmergencia.id, id));
    return inspeccion;
  }

  async createInspeccionRecursoEmergencia(inspeccion: InsertInspeccionRecursoEmergencia): Promise<InspeccionRecursoEmergencia> {
    const [newInspeccion] = await db.insert(schema.inspeccionesRecursosEmergencia).values(inspeccion).returning();
    return newInspeccion;
  }

  async updateInspeccionRecursoEmergencia(id: string, inspeccion: Partial<InsertInspeccionRecursoEmergencia>): Promise<InspeccionRecursoEmergencia | undefined> {
    const [updated] = await db.update(schema.inspeccionesRecursosEmergencia)
      .set(inspeccion)
      .where(eq(schema.inspeccionesRecursosEmergencia.id, id))
      .returning();
    return updated;
  }

  async deleteInspeccionRecursoEmergencia(id: string): Promise<void> {
    await db.delete(schema.inspeccionesRecursosEmergencia)
      .where(eq(schema.inspeccionesRecursosEmergencia.id, id));
  }

  // Simulacros
  async getSimulacros(companyId: string): Promise<Simulacro[]> {
    return await db.select().from(schema.simulacros)
      .where(eq(schema.simulacros.companyId, companyId))
      .orderBy(desc(schema.simulacros.createdAt));
  }

  async getAllSimulacros(): Promise<Simulacro[]> {
    return await db.select().from(schema.simulacros)
      .orderBy(desc(schema.simulacros.createdAt));
  }

  async getSimulacro(id: string, companyId: string): Promise<Simulacro | undefined> {
    const [simulacro] = await db.select().from(schema.simulacros)
      .where(and(
        eq(schema.simulacros.id, id),
        eq(schema.simulacros.companyId, companyId)
      ));
    return simulacro;
  }

  async getSimulacroById(id: string): Promise<Simulacro | undefined> {
    const [simulacro] = await db.select().from(schema.simulacros)
      .where(eq(schema.simulacros.id, id));
    return simulacro;
  }

  async createSimulacro(simulacro: InsertSimulacro, companyId: string): Promise<Simulacro> {
    const [newSimulacro] = await db.insert(schema.simulacros).values({
      ...simulacro,
      companyId,
    }).returning();
    return newSimulacro;
  }

  async updateSimulacro(id: string, simulacro: Partial<InsertSimulacro>, companyId: string): Promise<Simulacro | undefined> {
    const [updated] = await db.update(schema.simulacros)
      .set({
        ...simulacro,
        updatedAt: new Date(),
      })
      .where(and(
        eq(schema.simulacros.id, id),
        eq(schema.simulacros.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteSimulacro(id: string, companyId: string): Promise<void> {
    await db.delete(schema.simulacros)
      .where(and(
        eq(schema.simulacros.id, id),
        eq(schema.simulacros.companyId, companyId)
      ));
  }

  // Participantes Simulacro
  async getParticipantesSimulacro(simulacroId: string): Promise<ParticipanteSimulacro[]> {
    return await db.select().from(schema.participantesSimulacro)
      .where(eq(schema.participantesSimulacro.simulacroId, simulacroId))
      .orderBy(desc(schema.participantesSimulacro.createdAt));
  }

  async getParticipanteSimulacro(id: string): Promise<ParticipanteSimulacro | undefined> {
    const [participante] = await db.select().from(schema.participantesSimulacro)
      .where(eq(schema.participantesSimulacro.id, id));
    return participante;
  }

  async createParticipanteSimulacro(participante: InsertParticipanteSimulacro): Promise<ParticipanteSimulacro> {
    const [newParticipante] = await db.insert(schema.participantesSimulacro).values(participante).returning();
    return newParticipante;
  }

  async updateParticipanteSimulacro(id: string, participante: Partial<InsertParticipanteSimulacro>): Promise<ParticipanteSimulacro | undefined> {
    const [updated] = await db.update(schema.participantesSimulacro)
      .set(participante)
      .where(eq(schema.participantesSimulacro.id, id))
      .returning();
    return updated;
  }

  async deleteParticipanteSimulacro(id: string): Promise<void> {
    await db.delete(schema.participantesSimulacro)
      .where(eq(schema.participantesSimulacro.id, id));
  }

  // Zonas de Evacuación
  async getZonasEvacuacion(companyId: string): Promise<ZonaEvacuacion[]> {
    return await db.select().from(schema.zonasEvacuacion)
      .where(eq(schema.zonasEvacuacion.companyId, companyId))
      .orderBy(desc(schema.zonasEvacuacion.createdAt));
  }

  async getAllZonasEvacuacion(): Promise<ZonaEvacuacion[]> {
    return await db.select().from(schema.zonasEvacuacion)
      .orderBy(desc(schema.zonasEvacuacion.createdAt));
  }

  async getZonaEvacuacion(id: string, companyId: string): Promise<ZonaEvacuacion | undefined> {
    const [zona] = await db.select().from(schema.zonasEvacuacion)
      .where(and(
        eq(schema.zonasEvacuacion.id, id),
        eq(schema.zonasEvacuacion.companyId, companyId)
      ));
    return zona;
  }

  async getZonaEvacuacionById(id: string): Promise<ZonaEvacuacion | undefined> {
    const [zona] = await db.select().from(schema.zonasEvacuacion)
      .where(eq(schema.zonasEvacuacion.id, id));
    return zona;
  }

  async createZonaEvacuacion(zona: InsertZonaEvacuacion, companyId: string): Promise<ZonaEvacuacion> {
    const [newZona] = await db.insert(schema.zonasEvacuacion).values({
      ...zona,
      companyId,
    }).returning();
    return newZona;
  }

  async updateZonaEvacuacion(id: string, zona: Partial<InsertZonaEvacuacion>, companyId: string): Promise<ZonaEvacuacion | undefined> {
    const [updated] = await db.update(schema.zonasEvacuacion)
      .set(zona)
      .where(and(
        eq(schema.zonasEvacuacion.id, id),
        eq(schema.zonasEvacuacion.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteZonaEvacuacion(id: string, companyId: string): Promise<void> {
    await db.delete(schema.zonasEvacuacion)
      .where(and(
        eq(schema.zonasEvacuacion.id, id),
        eq(schema.zonasEvacuacion.companyId, companyId)
      ));
  }

  // Rutas de Evacuación
  async getRutasEvacuacion(companyId: string): Promise<RutaEvacuacion[]> {
    return await db.select().from(schema.rutasEvacuacion)
      .where(eq(schema.rutasEvacuacion.companyId, companyId))
      .orderBy(desc(schema.rutasEvacuacion.createdAt));
  }

  async getAllRutasEvacuacion(): Promise<RutaEvacuacion[]> {
    return await db.select().from(schema.rutasEvacuacion)
      .orderBy(desc(schema.rutasEvacuacion.createdAt));
  }

  async getRutaEvacuacion(id: string, companyId: string): Promise<RutaEvacuacion | undefined> {
    const [ruta] = await db.select().from(schema.rutasEvacuacion)
      .where(and(
        eq(schema.rutasEvacuacion.id, id),
        eq(schema.rutasEvacuacion.companyId, companyId)
      ));
    return ruta;
  }

  async getRutaEvacuacionById(id: string): Promise<RutaEvacuacion | undefined> {
    const [ruta] = await db.select().from(schema.rutasEvacuacion)
      .where(eq(schema.rutasEvacuacion.id, id));
    return ruta;
  }

  async createRutaEvacuacion(ruta: InsertRutaEvacuacion, companyId: string): Promise<RutaEvacuacion> {
    const [newRuta] = await db.insert(schema.rutasEvacuacion).values({
      ...ruta,
      companyId,
    }).returning();
    return newRuta;
  }

  async updateRutaEvacuacion(id: string, ruta: Partial<InsertRutaEvacuacion>, companyId: string): Promise<RutaEvacuacion | undefined> {
    const [updated] = await db.update(schema.rutasEvacuacion)
      .set(ruta)
      .where(and(
        eq(schema.rutasEvacuacion.id, id),
        eq(schema.rutasEvacuacion.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteRutaEvacuacion(id: string, companyId: string): Promise<void> {
    await db.delete(schema.rutasEvacuacion)
      .where(and(
        eq(schema.rutasEvacuacion.id, id),
        eq(schema.rutasEvacuacion.companyId, companyId)
      ));
  }

  // Puntos de Encuentro
  async getPuntosEncuentro(companyId: string): Promise<PuntoEncuentro[]> {
    return await db.select().from(schema.puntosEncuentro)
      .where(eq(schema.puntosEncuentro.companyId, companyId))
      .orderBy(desc(schema.puntosEncuentro.createdAt));
  }

  async getAllPuntosEncuentro(): Promise<PuntoEncuentro[]> {
    return await db.select().from(schema.puntosEncuentro)
      .orderBy(desc(schema.puntosEncuentro.createdAt));
  }

  async getPuntoEncuentro(id: string, companyId: string): Promise<PuntoEncuentro | undefined> {
    const [punto] = await db.select().from(schema.puntosEncuentro)
      .where(and(
        eq(schema.puntosEncuentro.id, id),
        eq(schema.puntosEncuentro.companyId, companyId)
      ));
    return punto;
  }

  async getPuntoEncuentroById(id: string): Promise<PuntoEncuentro | undefined> {
    const [punto] = await db.select().from(schema.puntosEncuentro)
      .where(eq(schema.puntosEncuentro.id, id));
    return punto;
  }

  async createPuntoEncuentro(punto: InsertPuntoEncuentro, companyId: string): Promise<PuntoEncuentro> {
    const [newPunto] = await db.insert(schema.puntosEncuentro).values({
      ...punto,
      companyId,
    }).returning();
    return newPunto;
  }

  async updatePuntoEncuentro(id: string, punto: Partial<InsertPuntoEncuentro>, companyId: string): Promise<PuntoEncuentro | undefined> {
    const [updated] = await db.update(schema.puntosEncuentro)
      .set(punto)
      .where(and(
        eq(schema.puntosEncuentro.id, id),
        eq(schema.puntosEncuentro.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deletePuntoEncuentro(id: string, companyId: string): Promise<void> {
    await db.delete(schema.puntosEncuentro)
      .where(and(
        eq(schema.puntosEncuentro.id, id),
        eq(schema.puntosEncuentro.companyId, companyId)
      ));
  }

  // ============================================================================
  // PROVIDER ACCESS LOGS - Registro de Accesos del Proveedor SaaS (Ley 1581/2012)
  // ============================================================================

  async createProviderAccessLog(log: InsertProviderAccessLog): Promise<ProviderAccessLog> {
    const [newLog] = await db.insert(schema.providerAccessLogs).values(log).returning();
    return newLog;
  }

  async getProviderAccessLogs(filters?: { providerId?: string; clientCompanyId?: string; startDate?: Date; endDate?: Date }): Promise<ProviderAccessLog[]> {
    const conditions = [];
    
    if (filters?.providerId) {
      conditions.push(eq(schema.providerAccessLogs.providerId, filters.providerId));
    }
    if (filters?.clientCompanyId) {
      conditions.push(eq(schema.providerAccessLogs.clientCompanyId, filters.clientCompanyId));
    }
    if (filters?.startDate) {
      conditions.push(sql`${schema.providerAccessLogs.accessStart} >= ${filters.startDate.toISOString()}`);
    }
    if (filters?.endDate) {
      conditions.push(sql`${schema.providerAccessLogs.accessStart} <= ${filters.endDate.toISOString()}`);
    }
    
    if (conditions.length === 0) {
      return await db.select().from(schema.providerAccessLogs)
        .orderBy(desc(schema.providerAccessLogs.accessStart));
    }
    
    return await db.select().from(schema.providerAccessLogs)
      .where(and(...conditions))
      .orderBy(desc(schema.providerAccessLogs.accessStart));
  }

  async getProviderAccessLogById(id: string): Promise<ProviderAccessLog | undefined> {
    const [log] = await db.select().from(schema.providerAccessLogs)
      .where(eq(schema.providerAccessLogs.id, id));
    return log;
  }

  async updateProviderAccessLog(id: string, updates: Partial<InsertProviderAccessLog>): Promise<ProviderAccessLog | undefined> {
    const [updated] = await db.update(schema.providerAccessLogs)
      .set(updates)
      .where(eq(schema.providerAccessLogs.id, id))
      .returning();
    return updated;
  }

  async getProviderAccessLogsByCompany(clientCompanyId: string): Promise<ProviderAccessLog[]> {
    return await db.select().from(schema.providerAccessLogs)
      .where(eq(schema.providerAccessLogs.clientCompanyId, clientCompanyId))
      .orderBy(desc(schema.providerAccessLogs.accessStart));
  }

  // ============================================================================
  // WORKER PORTAL ACCESS LOGS (SST-2025-0082)
  // ============================================================================

  async createWorkerPortalAccessLog(data: InsertWorkerPortalAccessLog): Promise<WorkerPortalAccessLog> {
    // Denormalize user and worker names at insertion time for compliance
    // This preserves the names even if the user/worker is later deleted
    let userName: string | null = null;
    let workerName: string | null = null;
    
    if (data.userId) {
      const user = await this.getUser(data.userId);
      if (user) {
        userName = user.fullName || user.username;
      }
    }
    
    if (data.workerId) {
      const worker = await this.getWorker(data.workerId);
      if (worker) {
        workerName = worker.fullName;
      }
    }
    
    const enrichedData = {
      ...data,
      userName,
      workerName,
    };
    
    const [newLog] = await db.insert(schema.workerPortalAccessLogs).values(enrichedData).returning();
    return newLog;
  }

  async getWorkerPortalAccessLogs(companyId: string, filters?: { workerId?: string; from?: Date; to?: Date }): Promise<WorkerPortalAccessLog[]> {
    const conditions = [eq(schema.workerPortalAccessLogs.companyId, companyId)];
    
    if (filters?.workerId) {
      conditions.push(eq(schema.workerPortalAccessLogs.workerId, filters.workerId));
    }
    if (filters?.from) {
      conditions.push(sql`${schema.workerPortalAccessLogs.accessTime} >= ${filters.from.toISOString()}`);
    }
    if (filters?.to) {
      conditions.push(sql`${schema.workerPortalAccessLogs.accessTime} <= ${filters.to.toISOString()}`);
    }
    
    return await db.select().from(schema.workerPortalAccessLogs)
      .where(and(...conditions))
      .orderBy(desc(schema.workerPortalAccessLogs.accessTime));
  }

  // ============================================================================
  // SISTEMA DE TICKETS DE SOPORTE
  // ============================================================================

  async getSupportTickets(companyId?: string): Promise<SupportTicket[]> {
    if (companyId) {
      return await db.select().from(schema.supportTickets)
        .where(eq(schema.supportTickets.companyId, companyId))
        .orderBy(desc(schema.supportTickets.createdAt));
    }
    return await db.select().from(schema.supportTickets)
      .orderBy(desc(schema.supportTickets.createdAt));
  }

  async getSupportTicket(id: string): Promise<SupportTicket | undefined> {
    const [ticket] = await db.select().from(schema.supportTickets)
      .where(eq(schema.supportTickets.id, id));
    return ticket;
  }

  async getSupportTicketByNumber(ticketNumber: string): Promise<SupportTicket | undefined> {
    const [ticket] = await db.select().from(schema.supportTickets)
      .where(eq(schema.supportTickets.ticketNumber, ticketNumber));
    return ticket;
  }

  async getNextTicketNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `SST-${year}-`;
    
    // Get the latest ticket number for this year
    const [latestTicket] = await db.select()
      .from(schema.supportTickets)
      .where(sql`${schema.supportTickets.ticketNumber} LIKE ${prefix + '%'}`)
      .orderBy(desc(schema.supportTickets.createdAt))
      .limit(1);
    
    let nextNumber = 1;
    if (latestTicket) {
      const lastNumber = parseInt(latestTicket.ticketNumber.split('-')[2], 10);
      nextNumber = lastNumber + 1;
    }
    
    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  }

  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const ticketNumber = await this.getNextTicketNumber();
    const [newTicket] = await db.insert(schema.supportTickets)
      .values({ ...ticket, ticketNumber })
      .returning();
    return newTicket;
  }

  async updateSupportTicket(id: string, updates: Partial<InsertSupportTicket>): Promise<SupportTicket | undefined> {
    const [updated] = await db.update(schema.supportTickets)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.supportTickets.id, id))
      .returning();
    return updated;
  }

  // Ticket Responses
  async getTicketResponses(ticketId: string): Promise<TicketResponse[]> {
    return await db.select().from(schema.ticketResponses)
      .where(eq(schema.ticketResponses.ticketId, ticketId))
      .orderBy(asc(schema.ticketResponses.createdAt));
  }

  async createTicketResponse(response: InsertTicketResponse): Promise<TicketResponse> {
    const [newResponse] = await db.insert(schema.ticketResponses)
      .values(response)
      .returning();
    return newResponse;
  }

  // Ticket Status History
  async getTicketStatusHistory(ticketId: string): Promise<TicketStatusHistory[]> {
    return await db.select().from(schema.ticketStatusHistory)
      .where(eq(schema.ticketStatusHistory.ticketId, ticketId))
      .orderBy(asc(schema.ticketStatusHistory.createdAt));
  }

  async createTicketStatusHistory(history: InsertTicketStatusHistory): Promise<TicketStatusHistory> {
    const [newHistory] = await db.insert(schema.ticketStatusHistory)
      .values(history)
      .returning();
    return newHistory;
  }

  // ============================================================================
  // SISTEMA DE MENSAJERÍA INTERNA - Comunicación LSO ↔ Responsable SST
  // ============================================================================

  async getInternalMessages(userId: string, companyId?: string | null): Promise<InternalMessage[]> {
    // Si hay companyId, filtrar por empresa Y usuario
    // Si no hay companyId (ej: usuarios de soporte), buscar solo por userId
    if (companyId) {
      return await db.select().from(schema.internalMessages)
        .where(
          and(
            eq(schema.internalMessages.companyId, companyId),
            or(
              eq(schema.internalMessages.receiverId, userId),
              eq(schema.internalMessages.senderId, userId)
            )
          )
        )
        .orderBy(desc(schema.internalMessages.createdAt));
    } else {
      // Usuarios sin empresa (soporte, superadmin) ven mensajes donde son destinatario o remitente
      return await db.select().from(schema.internalMessages)
        .where(
          or(
            eq(schema.internalMessages.receiverId, userId),
            eq(schema.internalMessages.senderId, userId)
          )
        )
        .orderBy(desc(schema.internalMessages.createdAt));
    }
  }

  async getInternalMessage(id: string): Promise<InternalMessage | undefined> {
    const [message] = await db.select().from(schema.internalMessages)
      .where(eq(schema.internalMessages.id, id));
    return message;
  }

  async createInternalMessage(message: InsertInternalMessage): Promise<InternalMessage> {
    const [newMessage] = await db.insert(schema.internalMessages)
      .values(message)
      .returning();
    return newMessage;
  }

  async markMessageAsRead(id: string): Promise<InternalMessage | undefined> {
    const [updated] = await db.update(schema.internalMessages)
      .set({ status: 'read' as const, readAt: new Date() })
      .where(eq(schema.internalMessages.id, id))
      .returning();
    return updated;
  }

  async archiveMessage(id: string): Promise<InternalMessage | undefined> {
    const [updated] = await db.update(schema.internalMessages)
      .set({ status: 'archived' as const, archivedAt: new Date() })
      .where(eq(schema.internalMessages.id, id))
      .returning();
    return updated;
  }

  async getUnreadMessageCount(userId: string, companyId?: string | null): Promise<number> {
    // Si hay companyId, filtrar por empresa
    // Si no hay companyId (ej: usuarios de soporte), contar solo por userId
    if (companyId) {
      const result = await db.select({ count: sql<number>`count(*)` })
        .from(schema.internalMessages)
        .where(
          and(
            eq(schema.internalMessages.companyId, companyId),
            eq(schema.internalMessages.receiverId, userId),
            eq(schema.internalMessages.status, 'unread')
          )
        );
      return Number(result[0]?.count ?? 0);
    } else {
      const result = await db.select({ count: sql<number>`count(*)` })
        .from(schema.internalMessages)
        .where(
          and(
            eq(schema.internalMessages.receiverId, userId),
            eq(schema.internalMessages.status, 'unread')
          )
        );
      return Number(result[0]?.count ?? 0);
    }
  }

  async getMessageRecipients(companyId: string, senderRole: string): Promise<Array<{ id: string; fullName: string | null; role: string }>> {
    // Todos los usuarios de la empresa pueden recibir mensajes internos
    // Incluye todos los roles del enum userRoleEnum de la base de datos
    const validRoles = [
      'superadmin', 'superusuario', 'admin', 
      'responsable_sst', 'coordinador_salud', 'lso',
      'coordinador_sst', 'coordinador_rrhh', 'jefe_personal',
      'supervisor', 'trabajador'
    ];
    
    const users = await db.select({
      id: schema.users.id,
      fullName: schema.users.fullName,
      role: schema.users.role,
    })
    .from(schema.users)
    .where(
      and(
        eq(schema.users.companyId, companyId),
        inArray(schema.users.role, validRoles as any)
      )
    );
    
    return users;
  }

  // ============================================================================
  // SUPPORT ACCESS AUTHORIZATION SYSTEM - Transparencia y autorización de acceso
  // ============================================================================

  async getSupportAccessSessions(companyId?: string): Promise<SupportAccessSession[]> {
    if (companyId) {
      return await db.select().from(schema.supportAccessSessions)
        .where(eq(schema.supportAccessSessions.companyId, companyId))
        .orderBy(desc(schema.supportAccessSessions.createdAt));
    }
    return await db.select().from(schema.supportAccessSessions)
      .orderBy(desc(schema.supportAccessSessions.createdAt));
  }

  async getSupportAccessSessionsByUser(supportUserId: string): Promise<SupportAccessSession[]> {
    return await db.select().from(schema.supportAccessSessions)
      .where(eq(schema.supportAccessSessions.supportUserId, supportUserId))
      .orderBy(desc(schema.supportAccessSessions.createdAt));
  }

  async getSupportAccessSession(id: string): Promise<SupportAccessSession | undefined> {
    const [session] = await db.select().from(schema.supportAccessSessions)
      .where(eq(schema.supportAccessSessions.id, id));
    return session;
  }

  async getSupportAccessSessionByNumber(sessionNumber: string): Promise<SupportAccessSession | undefined> {
    const [session] = await db.select().from(schema.supportAccessSessions)
      .where(eq(schema.supportAccessSessions.sessionNumber, sessionNumber));
    return session;
  }

  async getActiveSupportAccessSession(supportUserId: string, companyId: string): Promise<SupportAccessSession | undefined> {
    const now = new Date();
    const [session] = await db.select().from(schema.supportAccessSessions)
      .where(
        and(
          eq(schema.supportAccessSessions.supportUserId, supportUserId),
          eq(schema.supportAccessSessions.companyId, companyId),
          eq(schema.supportAccessSessions.status, 'approved'),
          gte(schema.supportAccessSessions.expiresAt, now)
        )
      )
      .orderBy(desc(schema.supportAccessSessions.createdAt))
      .limit(1);
    return session;
  }

  async getPendingSupportAccessSessions(companyId: string): Promise<SupportAccessSession[]> {
    return await db.select().from(schema.supportAccessSessions)
      .where(
        and(
          eq(schema.supportAccessSessions.companyId, companyId),
          eq(schema.supportAccessSessions.status, 'pending')
        )
      )
      .orderBy(desc(schema.supportAccessSessions.createdAt));
  }

  async getNextAccessSessionNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `ACC-${year}-`;
    
    const [latestSession] = await db.select()
      .from(schema.supportAccessSessions)
      .where(sql`${schema.supportAccessSessions.sessionNumber} LIKE ${prefix + '%'}`)
      .orderBy(desc(schema.supportAccessSessions.createdAt))
      .limit(1);
    
    if (!latestSession) {
      return `${prefix}0001`;
    }
    
    const currentNumber = parseInt(latestSession.sessionNumber.split('-').pop() || '0', 10);
    return `${prefix}${String(currentNumber + 1).padStart(4, '0')}`;
  }

  async createSupportAccessSession(sessionData: InsertSupportAccessSession): Promise<SupportAccessSession> {
    const sessionNumber = await this.getNextAccessSessionNumber();
    const [newSession] = await db.insert(schema.supportAccessSessions)
      .values({ ...sessionData, sessionNumber })
      .returning();
    return newSession;
  }

  async updateSupportAccessSession(id: string, updates: Partial<SupportAccessSession>): Promise<SupportAccessSession | undefined> {
    const [updated] = await db.update(schema.supportAccessSessions)
      .set(updates)
      .where(eq(schema.supportAccessSessions.id, id))
      .returning();
    return updated;
  }

  async getSupportAccessEvents(sessionId: string): Promise<SupportAccessEvent[]> {
    return await db.select().from(schema.supportAccessEvents)
      .where(eq(schema.supportAccessEvents.sessionId, sessionId))
      .orderBy(asc(schema.supportAccessEvents.createdAt));
  }

  async createSupportAccessEvent(event: InsertSupportAccessEvent): Promise<SupportAccessEvent> {
    const [newEvent] = await db.insert(schema.supportAccessEvents)
      .values(event)
      .returning();
    return newEvent;
  }

  async getCompanySuperusuario(companyId: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users)
      .where(
        and(
          eq(schema.users.companyId, companyId),
          eq(schema.users.role, 'superusuario')
        )
      )
      .limit(1);
    return user;
  }

  // ============================================================================
  // HIGH RISK WORKERS - Estándar 1.1.5 (Decreto 2090/2003)
  // Identificación de trabajadores de alto riesgo y cotización de pensión especial
  // ============================================================================

  async getHighRiskWorkers(companyId: string): Promise<HighRiskWorker[]> {
    return await db.select().from(schema.highRiskWorkers)
      .where(eq(schema.highRiskWorkers.companyId, companyId))
      .orderBy(desc(schema.highRiskWorkers.createdAt));
  }

  async getHighRiskWorkerById(id: string): Promise<HighRiskWorker | undefined> {
    const [record] = await db.select().from(schema.highRiskWorkers)
      .where(eq(schema.highRiskWorkers.id, id));
    return record;
  }

  async createHighRiskWorker(data: InsertHighRiskWorker): Promise<HighRiskWorker> {
    const [newRecord] = await db.insert(schema.highRiskWorkers)
      .values(data)
      .returning();
    return newRecord;
  }

  async updateHighRiskWorker(id: string, data: Partial<InsertHighRiskWorker>): Promise<HighRiskWorker> {
    const [updated] = await db.update(schema.highRiskWorkers)
      .set(data)
      .where(eq(schema.highRiskWorkers.id, id))
      .returning();
    return updated;
  }

  async deleteHighRiskWorker(id: string, companyId: string): Promise<void> {
    await db.delete(schema.highRiskWorkers)
      .where(
        and(
          eq(schema.highRiskWorkers.id, id),
          eq(schema.highRiskWorkers.companyId, companyId)
        )
      );
  }

  // ============================================================================
  // COPASST - Comité Paritario de Seguridad y Salud en el Trabajo
  // Resolución 2013/1986, Decreto 1295/1994, Decreto 1072/2015
  // ============================================================================

  // COPASST Períodos
  async getCopasstPeriodos(companyId: string): Promise<CopasstPeriodo[]> {
    return await db.select().from(schema.copasstPeriodos)
      .where(eq(schema.copasstPeriodos.companyId, companyId))
      .orderBy(desc(schema.copasstPeriodos.fechaInicio));
  }

  async getCopasstPeriodo(id: string): Promise<CopasstPeriodo | undefined> {
    const [periodo] = await db.select().from(schema.copasstPeriodos)
      .where(eq(schema.copasstPeriodos.id, id));
    return periodo;
  }

  async getCopasstPeriodoActivo(companyId: string): Promise<CopasstPeriodo | undefined> {
    const now = new Date();
    const [periodo] = await db.select().from(schema.copasstPeriodos)
      .where(
        and(
          eq(schema.copasstPeriodos.companyId, companyId),
          eq(schema.copasstPeriodos.estado, 'activo'),
          lte(schema.copasstPeriodos.fechaInicio, now.toISOString().split('T')[0]),
          gte(schema.copasstPeriodos.fechaFin, now.toISOString().split('T')[0])
        )
      )
      .orderBy(desc(schema.copasstPeriodos.fechaInicio))
      .limit(1);
    return periodo;
  }

  async createCopasstPeriodo(periodo: InsertCopasstPeriodo): Promise<CopasstPeriodo> {
    // If creating a new active period, deactivate any existing active periods for this company
    if (periodo.estado === 'activo' && periodo.companyId) {
      await db.update(schema.copasstPeriodos)
        .set({ estado: 'vencido' })
        .where(
          and(
            eq(schema.copasstPeriodos.companyId, periodo.companyId),
            eq(schema.copasstPeriodos.estado, 'activo')
          )
        );
    }
    
    const [newPeriodo] = await db.insert(schema.copasstPeriodos)
      .values(periodo)
      .returning();
    return newPeriodo;
  }

  async updateCopasstPeriodo(id: string, data: Partial<InsertCopasstPeriodo>): Promise<CopasstPeriodo | undefined> {
    const [updated] = await db.update(schema.copasstPeriodos)
      .set(data)
      .where(eq(schema.copasstPeriodos.id, id))
      .returning();
    return updated;
  }

  // COPASST Miembros
  async getCopasstMiembros(periodoId: string): Promise<CopasstMiembro[]> {
    return await db.select().from(schema.copasstMiembros)
      .where(eq(schema.copasstMiembros.periodoId, periodoId))
      .orderBy(asc(schema.copasstMiembros.tipoRepresentante), asc(schema.copasstMiembros.cargo));
  }

  async getCopasstMiembro(id: string): Promise<CopasstMiembro | undefined> {
    const [miembro] = await db.select().from(schema.copasstMiembros)
      .where(eq(schema.copasstMiembros.id, id));
    return miembro;
  }

  async createCopasstMiembro(miembro: InsertCopasstMiembro): Promise<CopasstMiembro> {
    const [newMiembro] = await db.insert(schema.copasstMiembros)
      .values(miembro)
      .returning();
    return newMiembro;
  }

  async updateCopasstMiembro(id: string, data: Partial<InsertCopasstMiembro>): Promise<CopasstMiembro | undefined> {
    const [updated] = await db.update(schema.copasstMiembros)
      .set(data)
      .where(eq(schema.copasstMiembros.id, id))
      .returning();
    return updated;
  }

  async deleteCopasstMiembro(id: string): Promise<void> {
    await db.delete(schema.copasstMiembros)
      .where(eq(schema.copasstMiembros.id, id));
  }

  // COPASST Elecciones
  async getCopasstElecciones(companyId: string): Promise<CopasstEleccion[]> {
    return await db.select().from(schema.copasstElecciones)
      .where(eq(schema.copasstElecciones.companyId, companyId))
      .orderBy(desc(schema.copasstElecciones.createdAt));
  }

  async getCopasstEleccion(id: string): Promise<CopasstEleccion | undefined> {
    const [eleccion] = await db.select().from(schema.copasstElecciones)
      .where(eq(schema.copasstElecciones.id, id));
    return eleccion;
  }

  async getCopasstEleccionById(id: string): Promise<CopasstEleccion | undefined> {
    return this.getCopasstEleccion(id);
  }

  async createCopasstEleccion(eleccion: InsertCopasstEleccion): Promise<CopasstEleccion> {
    const [newEleccion] = await db.insert(schema.copasstElecciones)
      .values(eleccion)
      .returning();
    return newEleccion;
  }

  async updateCopasstEleccion(id: string, data: Partial<InsertCopasstEleccion>): Promise<CopasstEleccion | undefined> {
    const [updated] = await db.update(schema.copasstElecciones)
      .set(data)
      .where(eq(schema.copasstElecciones.id, id))
      .returning();
    return updated;
  }

  // COPASST Candidatos
  async getCopasstCandidatos(eleccionId: string): Promise<CopasstCandidato[]> {
    return await db.select().from(schema.copasstCandidatos)
      .where(eq(schema.copasstCandidatos.eleccionId, eleccionId))
      .orderBy(desc(schema.copasstCandidatos.votosObtenidos));
  }

  async getCopasstCandidato(id: string): Promise<CopasstCandidato | undefined> {
    const [candidato] = await db.select().from(schema.copasstCandidatos)
      .where(eq(schema.copasstCandidatos.id, id));
    return candidato;
  }

  async createCopasstCandidato(candidato: InsertCopasstCandidato): Promise<CopasstCandidato> {
    const [newCandidato] = await db.insert(schema.copasstCandidatos)
      .values(candidato)
      .returning();
    return newCandidato;
  }

  async updateCopasstCandidato(id: string, data: Partial<InsertCopasstCandidato>): Promise<CopasstCandidato | undefined> {
    const [updated] = await db.update(schema.copasstCandidatos)
      .set(data)
      .where(eq(schema.copasstCandidatos.id, id))
      .returning();
    return updated;
  }

  async deleteCopasstCandidato(id: string): Promise<void> {
    await db.delete(schema.copasstCandidatos)
      .where(eq(schema.copasstCandidatos.id, id));
  }

  // COPASST Votación
  async getCopasstRegistrosVotacion(eleccionId: string): Promise<CopasstRegistroVotacion[]> {
    return await db.select().from(schema.copasstRegistroVotacion)
      .where(eq(schema.copasstRegistroVotacion.eleccionId, eleccionId))
      .orderBy(desc(schema.copasstRegistroVotacion.fechaHoraVoto));
  }

  async hasVoted(eleccionId: string, workerId: string): Promise<boolean> {
    const [registro] = await db.select().from(schema.copasstRegistroVotacion)
      .where(
        and(
          eq(schema.copasstRegistroVotacion.eleccionId, eleccionId),
          eq(schema.copasstRegistroVotacion.workerId, workerId)
        )
      )
      .limit(1);
    return !!registro;
  }

  async registrarVoto(eleccionId: string, workerId: string, candidatoIds: string[]): Promise<void> {
    await db.transaction(async (tx) => {
      // Registrar que el trabajador votó (sin revelar por quién - voto secreto)
      await tx.insert(schema.copasstRegistroVotacion).values({
        eleccionId,
        workerId,
        fechaHoraVoto: new Date(),
      });

      // Registrar cada voto individual en copasst_votos (anónimo)
      for (const candidatoId of candidatoIds) {
        await tx.insert(schema.copasstVotos).values({
          eleccionId,
          candidatoId,
        });

        // Incrementar contador de votos del candidato
        await tx.execute(
          sql`UPDATE ${schema.copasstCandidatos} 
              SET votos_obtenidos = COALESCE(votos_obtenidos, 0) + 1 
              WHERE id = ${candidatoId}`
        );
      }

      // Actualizar estadísticas de la elección (usar total_votantes que existe en el schema)
      await tx.execute(
        sql`UPDATE ${schema.copasstElecciones} 
            SET total_votantes = COALESCE(total_votantes, 0) + 1 
            WHERE id = ${eleccionId}`
      );
    });
  }

  // Get active election for a company (votacion or inscripcion phase)
  // SST-2026-0010: Filter by publicadoEnPortal to ensure only published elections are visible to workers
  async getCopasstEleccionActiva(companyId: string): Promise<CopasstEleccion | undefined> {
    const [eleccion] = await db.select().from(schema.copasstElecciones)
      .where(
        and(
          eq(schema.copasstElecciones.companyId, companyId),
          eq(schema.copasstElecciones.publicadoEnPortal, true),
          sql`${schema.copasstElecciones.estado} IN ('convocatoria', 'inscripcion', 'votacion', 'escrutinio')`
        )
      )
      .orderBy(desc(schema.copasstElecciones.createdAt))
      .limit(1);
    return eleccion;
  }

  // Get candidato by worker and election
  async getCopasstCandidatoByWorker(eleccionId: string, workerId: string): Promise<CopasstCandidato | undefined> {
    const [candidato] = await db.select().from(schema.copasstCandidatos)
      .where(
        and(
          eq(schema.copasstCandidatos.eleccionId, eleccionId),
          eq(schema.copasstCandidatos.workerId, workerId)
        )
      );
    return candidato;
  }

  // Get election results with candidates sorted by votes
  async getCopasstResultados(eleccionId: string): Promise<CopasstCandidato[]> {
    return await db.select().from(schema.copasstCandidatos)
      .where(eq(schema.copasstCandidatos.eleccionId, eleccionId))
      .orderBy(desc(schema.copasstCandidatos.votosObtenidos));
  }

  // ============================================================================
  // COPASST CAPACITACIÓN - E-Learning Gamificado
  // ============================================================================

  // COPASST Cursos - Catálogo de cursos de capacitación
  // Devuelve todos los cursos (activos e inactivos) - el filtrado se hace en el frontend
  async getCopasstCursos(): Promise<CopasstCurso[]> {
    return await db.select().from(schema.copasstCursos)
      .orderBy(asc(schema.copasstCursos.ordenCurso));
  }

  async getCopasstCursoById(id: string): Promise<CopasstCurso | undefined> {
    const [curso] = await db.select().from(schema.copasstCursos)
      .where(eq(schema.copasstCursos.id, id));
    return curso;
  }

  async createCopasstCurso(data: InsertCopasstCurso): Promise<CopasstCurso> {
    const [newCurso] = await db.insert(schema.copasstCursos)
      .values(data)
      .returning();
    return newCurso;
  }

  async updateCopasstCurso(id: string, data: Partial<InsertCopasstCurso>): Promise<CopasstCurso | undefined> {
    const [updated] = await db.update(schema.copasstCursos)
      .set(data)
      .where(eq(schema.copasstCursos.id, id))
      .returning();
    return updated;
  }

  async deleteCopasstCurso(id: string): Promise<void> {
    await db.delete(schema.copasstCursos)
      .where(eq(schema.copasstCursos.id, id));
  }

  // COPASST Lecciones - Lecciones dentro de cada curso
  async getCopasstLeccionesByCurso(cursoId: string): Promise<CopasstLeccion[]> {
    return await db.select().from(schema.copasstLecciones)
      .where(
        and(
          eq(schema.copasstLecciones.cursoId, cursoId),
          eq(schema.copasstLecciones.activo, true)
        )
      )
      .orderBy(asc(schema.copasstLecciones.ordenLeccion));
  }

  async getCopasstLeccionById(id: string): Promise<CopasstLeccion | undefined> {
    const [leccion] = await db.select().from(schema.copasstLecciones)
      .where(eq(schema.copasstLecciones.id, id));
    return leccion;
  }

  async createCopasstLeccion(data: InsertCopasstLeccion): Promise<CopasstLeccion> {
    const [newLeccion] = await db.insert(schema.copasstLecciones)
      .values(data)
      .returning();
    return newLeccion;
  }

  async updateCopasstLeccion(id: string, data: Partial<InsertCopasstLeccion>): Promise<CopasstLeccion | undefined> {
    const [updated] = await db.update(schema.copasstLecciones)
      .set(data)
      .where(eq(schema.copasstLecciones.id, id))
      .returning();
    return updated;
  }

  // COPASST Quiz - Preguntas de evaluación
  async getCopasstQuizByCurso(cursoId: string): Promise<CopasstQuizPregunta[]> {
    return await db.select().from(schema.copasstQuizPreguntas)
      .where(
        and(
          eq(schema.copasstQuizPreguntas.cursoId, cursoId),
          eq(schema.copasstQuizPreguntas.activo, true)
        )
      )
      .orderBy(asc(schema.copasstQuizPreguntas.ordenPregunta));
  }

  async createCopasstQuizPregunta(data: InsertCopasstQuizPregunta): Promise<CopasstQuizPregunta> {
    const [newPregunta] = await db.insert(schema.copasstQuizPreguntas)
      .values(data)
      .returning();
    return newPregunta;
  }

  async updateCopasstQuizPregunta(id: string, data: Partial<InsertCopasstQuizPregunta>): Promise<CopasstQuizPregunta | undefined> {
    const [updated] = await db.update(schema.copasstQuizPreguntas)
      .set(data)
      .where(eq(schema.copasstQuizPreguntas.id, id))
      .returning();
    return updated;
  }

  // COPASST Progreso - Seguimiento del progreso del usuario
  async getCopasstProgresoByUser(companyId: string, userId: string): Promise<CopasstProgreso[]> {
    return await db.select().from(schema.copasstProgreso)
      .where(
        and(
          eq(schema.copasstProgreso.companyId, companyId),
          eq(schema.copasstProgreso.userId, userId)
        )
      )
      .orderBy(desc(schema.copasstProgreso.updatedAt));
  }

  async getCopasstProgresoByCurso(companyId: string, userId: string, cursoId: string): Promise<CopasstProgreso | undefined> {
    const [progreso] = await db.select().from(schema.copasstProgreso)
      .where(
        and(
          eq(schema.copasstProgreso.companyId, companyId),
          eq(schema.copasstProgreso.userId, userId),
          eq(schema.copasstProgreso.cursoId, cursoId)
        )
      );
    return progreso;
  }

  async upsertCopasstProgreso(data: InsertCopasstProgreso): Promise<CopasstProgreso> {
    const existing = await this.getCopasstProgresoByCurso(data.companyId, data.userId, data.cursoId);
    
    if (existing) {
      const [updated] = await db.update(schema.copasstProgreso)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(schema.copasstProgreso.id, existing.id))
        .returning();
      return updated;
    } else {
      const [newProgreso] = await db.insert(schema.copasstProgreso)
        .values(data)
        .returning();
      return newProgreso;
    }
  }

  async completarLeccion(companyId: string, userId: string, cursoId: string, leccionId: string): Promise<CopasstProgreso> {
    const lecciones = await this.getCopasstLeccionesByCurso(cursoId);
    const leccionesTotales = lecciones.length;
    
    let progreso = await this.getCopasstProgresoByCurso(companyId, userId, cursoId);
    
    if (!progreso) {
      progreso = await this.upsertCopasstProgreso({
        companyId,
        userId,
        cursoId,
        leccionId,
        leccionesCompletadas: 1,
        leccionesTotales,
        porcentajeProgreso: Math.round((1 / leccionesTotales) * 100),
        completado: leccionesTotales === 1,
        fechaInicio: new Date(),
        fechaCompletado: leccionesTotales === 1 ? new Date() : undefined,
        puntosObtenidos: lecciones.find(l => l.id === leccionId)?.puntosCompletar || 10,
      });
    } else {
      const nuevasLeccionesCompletadas = progreso.leccionesCompletadas + 1;
      const nuevoPorcentaje = Math.round((nuevasLeccionesCompletadas / leccionesTotales) * 100);
      const leccionPuntos = lecciones.find(l => l.id === leccionId)?.puntosCompletar || 10;
      
      const [updated] = await db.update(schema.copasstProgreso)
        .set({
          leccionesCompletadas: nuevasLeccionesCompletadas,
          porcentajeProgreso: nuevoPorcentaje,
          completado: nuevasLeccionesCompletadas >= leccionesTotales,
          fechaCompletado: nuevasLeccionesCompletadas >= leccionesTotales ? new Date() : undefined,
          puntosObtenidos: progreso.puntosObtenidos + leccionPuntos,
          updatedAt: new Date(),
        })
        .where(eq(schema.copasstProgreso.id, progreso.id))
        .returning();
      progreso = updated;
    }
    
    return progreso;
  }

  async registrarQuizIntento(companyId: string, userId: string, cursoId: string, puntaje: number, aprobado: boolean): Promise<CopasstProgreso> {
    let progreso = await this.getCopasstProgresoByCurso(companyId, userId, cursoId);
    
    if (!progreso) {
      const lecciones = await this.getCopasstLeccionesByCurso(cursoId);
      progreso = await this.upsertCopasstProgreso({
        companyId,
        userId,
        cursoId,
        leccionesCompletadas: 0,
        leccionesTotales: lecciones.length,
        porcentajeProgreso: aprobado ? 100 : 0,
        completado: aprobado, // Mark as completed if quiz passed
        fechaCompletado: aprobado ? new Date() : undefined,
        quizAprobado: aprobado,
        quizPuntaje: puntaje,
        quizIntentos: 1,
        ultimoIntentoQuiz: new Date(),
        puntosObtenidos: aprobado ? puntaje : 0,
      });
    } else {
      const nuevoCompletado = aprobado || progreso.completado;
      const [updated] = await db.update(schema.copasstProgreso)
        .set({
          quizAprobado: aprobado || progreso.quizAprobado,
          quizPuntaje: Math.max(puntaje, progreso.quizPuntaje || 0),
          quizIntentos: progreso.quizIntentos + 1,
          ultimoIntentoQuiz: new Date(),
          puntosObtenidos: aprobado ? progreso.puntosObtenidos + puntaje : progreso.puntosObtenidos,
          completado: nuevoCompletado, // Mark as completed if quiz passed
          porcentajeProgreso: nuevoCompletado ? 100 : progreso.porcentajeProgreso,
          fechaCompletado: nuevoCompletado && !progreso.fechaCompletado ? new Date() : progreso.fechaCompletado,
          updatedAt: new Date(),
        })
        .where(eq(schema.copasstProgreso.id, progreso.id))
        .returning();
      progreso = updated;
    }
    
    return progreso;
  }

  // COPASST Certificados - Certificados de capacitación
  async getCopasstCertificadosByUser(companyId: string, userId: string): Promise<CopasstCertificado[]> {
    return await db.select().from(schema.copasstCertificados)
      .where(
        and(
          eq(schema.copasstCertificados.companyId, companyId),
          eq(schema.copasstCertificados.userId, userId),
          eq(schema.copasstCertificados.activo, true)
        )
      )
      .orderBy(desc(schema.copasstCertificados.fechaEmision));
  }

  async getCopasstCertificadoByCurso(companyId: string, userId: string, cursoId: string): Promise<CopasstCertificado | undefined> {
    const [certificado] = await db.select().from(schema.copasstCertificados)
      .where(
        and(
          eq(schema.copasstCertificados.companyId, companyId),
          eq(schema.copasstCertificados.userId, userId),
          eq(schema.copasstCertificados.cursoId, cursoId),
          eq(schema.copasstCertificados.activo, true)
        )
      );
    return certificado;
  }

  async createCopasstCertificado(data: InsertCopasstCertificado): Promise<CopasstCertificado> {
    const [newCertificado] = await db.insert(schema.copasstCertificados)
      .values(data)
      .returning();
    return newCertificado;
  }

  async getCopasstCertificadoByCode(code: string): Promise<CopasstCertificado | undefined> {
    const [certificado] = await db.select().from(schema.copasstCertificados)
      .where(eq(schema.copasstCertificados.codigoCertificado, code));
    return certificado;
  }

  // ============================================================================
  // COPASST GAMIFICACIÓN - Sistema de Insignias, Rachas, Leaderboard y Escenarios
  // ============================================================================

  // Insignias (Badges)
  async listCopasstInsignias(): Promise<CopasstInsignia[]> {
    return await db.select().from(schema.copasstInsignias)
      .where(eq(schema.copasstInsignias.activo, true))
      .orderBy(asc(schema.copasstInsignias.categoria));
  }

  async getCopasstInsignia(id: string): Promise<CopasstInsignia | undefined> {
    const [insignia] = await db.select().from(schema.copasstInsignias)
      .where(eq(schema.copasstInsignias.id, id));
    return insignia;
  }

  async createCopasstInsignia(data: InsertCopasstInsignia): Promise<CopasstInsignia> {
    const [newInsignia] = await db.insert(schema.copasstInsignias)
      .values(data)
      .returning();
    return newInsignia;
  }

  async getUserInsignias(userId: string, companyId: string): Promise<CopasstInsigniaUsuario[]> {
    return await db.select().from(schema.copasstInsigniasUsuario)
      .where(
        and(
          eq(schema.copasstInsigniasUsuario.userId, userId),
          eq(schema.copasstInsigniasUsuario.companyId, companyId)
        )
      )
      .orderBy(desc(schema.copasstInsigniasUsuario.fechaDesbloqueo));
  }

  async unlockCopasstInsignia(userId: string, companyId: string, insigniaId: string): Promise<CopasstInsigniaUsuario> {
    const existing = await db.select().from(schema.copasstInsigniasUsuario)
      .where(
        and(
          eq(schema.copasstInsigniasUsuario.userId, userId),
          eq(schema.copasstInsigniasUsuario.companyId, companyId),
          eq(schema.copasstInsigniasUsuario.insigniaId, insigniaId)
        )
      );
    
    if (existing.length > 0) {
      return existing[0];
    }

    const [newUnlock] = await db.insert(schema.copasstInsigniasUsuario)
      .values({
        userId,
        companyId,
        insigniaId,
        fechaDesbloqueo: new Date(),
      })
      .returning();
    
    const insignia = await this.getCopasstInsignia(insigniaId);
    if (insignia) {
      await this.updateMonthlyPoints(userId, companyId, insignia.puntosBonus, 'insignia');
    }

    return newUnlock;
  }

  async checkAndUnlockBadges(userId: string, companyId: string): Promise<CopasstInsigniaUsuario[]> {
    const unlockedBadges: CopasstInsigniaUsuario[] = [];
    
    const allBadges = await this.listCopasstInsignias();
    const userBadges = await this.getUserInsignias(userId, companyId);
    const unlockedIds = new Set(userBadges.map(b => b.insigniaId));
    
    const progreso = await this.getCopasstProgresoByUser(companyId, userId);
    const racha = await this.getCopasstRacha(userId, companyId);
    
    const now = new Date();
    const monthlyStats = await this.getUserMonthlyStats(userId, companyId, now.getFullYear(), now.getMonth() + 1);
    
    const cursosCompletados = progreso.filter(p => p.completado).length;
    const quizzesAprobados = progreso.filter(p => p.quizAprobado);
    const quizPerfecto = quizzesAprobados.some(p => p.quizPuntaje === 100);
    const puntosTotal = monthlyStats?.puntosTotal || 0;
    const rachaDias = racha?.rachaActual || 0;

    for (const badge of allBadges) {
      if (unlockedIds.has(badge.id)) continue;

      const condicion = badge.condicion as { tipo: string; valor: number };
      let shouldUnlock = false;

      switch (condicion.tipo) {
        case 'cursos_completados':
          shouldUnlock = cursosCompletados >= condicion.valor;
          break;
        case 'quiz_perfecto':
          shouldUnlock = quizPerfecto;
          break;
        case 'racha_dias':
          shouldUnlock = rachaDias >= condicion.valor;
          break;
        case 'puntos_totales':
          shouldUnlock = puntosTotal >= condicion.valor;
          break;
        case 'escenario_perfecto':
          const escenarioProgresos = await db.select().from(schema.copasstEscenarioProgreso)
            .where(
              and(
                eq(schema.copasstEscenarioProgreso.userId, userId),
                eq(schema.copasstEscenarioProgreso.companyId, companyId),
                eq(schema.copasstEscenarioProgreso.completado, true)
              )
            );
          const escenarios = await this.listCopasstEscenarios();
          const perfectScores = escenarioProgresos.filter(ep => {
            const escenario = escenarios.find(e => e.id === ep.escenarioId);
            return escenario && ep.puntosObtenidos === escenario.puntosPerfecto;
          });
          shouldUnlock = perfectScores.length >= condicion.valor;
          break;
      }

      if (shouldUnlock) {
        const unlocked = await this.unlockCopasstInsignia(userId, companyId, badge.id);
        unlockedBadges.push(unlocked);
      }
    }

    return unlockedBadges;
  }

  // Rachas (Streaks)
  async getCopasstRacha(userId: string, companyId: string): Promise<CopasstRachaUsuario | undefined> {
    const [racha] = await db.select().from(schema.copasstRachasUsuario)
      .where(
        and(
          eq(schema.copasstRachasUsuario.userId, userId),
          eq(schema.copasstRachasUsuario.companyId, companyId)
        )
      );
    return racha;
  }

  async createOrGetCopasstRacha(userId: string, companyId: string): Promise<CopasstRachaUsuario> {
    const existing = await this.getCopasstRacha(userId, companyId);
    if (existing) return existing;

    const [newRacha] = await db.insert(schema.copasstRachasUsuario)
      .values({
        userId,
        companyId,
        rachaActual: 0,
        rachaMaxima: 0,
        puntosBonusAcumulados: 0,
      })
      .returning();
    return newRacha;
  }

  async updateCopasstRacha(userId: string, companyId: string): Promise<CopasstRachaUsuario> {
    const racha = await this.createOrGetCopasstRacha(userId, companyId);
    const today = new Date().toISOString().split('T')[0];
    const lastActivity = racha.ultimaActividad;

    if (lastActivity === today) {
      return racha;
    }

    let newRacha = racha.rachaActual;
    let bonusPoints = 0;

    if (lastActivity) {
      const lastDate = new Date(lastActivity);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newRacha = racha.rachaActual + 1;
        if (newRacha % 7 === 0) {
          bonusPoints = 25;
        }
      } else if (diffDays > 1) {
        newRacha = 1;
      }
    } else {
      newRacha = 1;
    }

    const newRachaMaxima = Math.max(racha.rachaMaxima, newRacha);

    const [updated] = await db.update(schema.copasstRachasUsuario)
      .set({
        rachaActual: newRacha,
        rachaMaxima: newRachaMaxima,
        ultimaActividad: today,
        puntosBonusAcumulados: racha.puntosBonusAcumulados + bonusPoints,
        updatedAt: new Date(),
      })
      .where(eq(schema.copasstRachasUsuario.id, racha.id))
      .returning();

    if (bonusPoints > 0) {
      await this.updateMonthlyPoints(userId, companyId, bonusPoints, 'insignia');
    }

    return updated;
  }

  // Leaderboard (Monthly Points)
  async getMonthlyLeaderboard(companyId: string, year: number, month: number, limit: number = 10): Promise<CopasstPuntosMensuales[]> {
    return await db.select().from(schema.copasstPuntosMensuales)
      .where(
        and(
          eq(schema.copasstPuntosMensuales.companyId, companyId),
          eq(schema.copasstPuntosMensuales.anio, year),
          eq(schema.copasstPuntosMensuales.mes, month)
        )
      )
      .orderBy(desc(schema.copasstPuntosMensuales.puntosTotal))
      .limit(limit);
  }

  async getUserMonthlyStats(userId: string, companyId: string, year: number, month: number): Promise<CopasstPuntosMensuales | undefined> {
    const [stats] = await db.select().from(schema.copasstPuntosMensuales)
      .where(
        and(
          eq(schema.copasstPuntosMensuales.userId, userId),
          eq(schema.copasstPuntosMensuales.companyId, companyId),
          eq(schema.copasstPuntosMensuales.anio, year),
          eq(schema.copasstPuntosMensuales.mes, month)
        )
      );
    return stats;
  }

  async updateMonthlyPoints(userId: string, companyId: string, points: number, type: 'curso' | 'leccion' | 'quiz' | 'insignia'): Promise<CopasstPuntosMensuales> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const existing = await this.getUserMonthlyStats(userId, companyId, year, month);

    const incrementField: Partial<Record<string, number>> = {};
    if (type === 'curso') incrementField.cursosCompletados = 1;
    if (type === 'leccion') incrementField.leccionesCompletadas = 1;
    if (type === 'quiz') incrementField.quizzesAprobados = 1;
    if (type === 'insignia') incrementField.insigniasDesbloqueadas = 1;

    if (existing) {
      const updateData: any = {
        puntosTotal: existing.puntosTotal + points,
        updatedAt: new Date(),
      };
      
      if (type === 'curso') updateData.cursosCompletados = existing.cursosCompletados + 1;
      if (type === 'leccion') updateData.leccionesCompletadas = existing.leccionesCompletadas + 1;
      if (type === 'quiz') updateData.quizzesAprobados = existing.quizzesAprobados + 1;
      if (type === 'insignia') updateData.insigniasDesbloqueadas = existing.insigniasDesbloqueadas + 1;

      const [updated] = await db.update(schema.copasstPuntosMensuales)
        .set(updateData)
        .where(eq(schema.copasstPuntosMensuales.id, existing.id))
        .returning();
      return updated;
    } else {
      const [newStats] = await db.insert(schema.copasstPuntosMensuales)
        .values({
          userId,
          companyId,
          anio: year,
          mes: month,
          puntosTotal: points,
          cursosCompletados: type === 'curso' ? 1 : 0,
          leccionesCompletadas: type === 'leccion' ? 1 : 0,
          quizzesAprobados: type === 'quiz' ? 1 : 0,
          insigniasDesbloqueadas: type === 'insignia' ? 1 : 0,
        })
        .returning();
      return newStats;
    }
  }

  // Escenarios (Interactive Scenarios)
  async listCopasstEscenarios(): Promise<CopasstEscenario[]> {
    return await db.select().from(schema.copasstEscenarios)
      .where(eq(schema.copasstEscenarios.activo, true))
      .orderBy(asc(schema.copasstEscenarios.categoria));
  }

  async getCopasstEscenario(id: string): Promise<CopasstEscenario | undefined> {
    const [escenario] = await db.select().from(schema.copasstEscenarios)
      .where(eq(schema.copasstEscenarios.id, id));
    return escenario;
  }

  async getEscenarioNodos(escenarioId: string): Promise<CopasstEscenarioNodo[]> {
    return await db.select().from(schema.copasstEscenarioNodos)
      .where(eq(schema.copasstEscenarioNodos.escenarioId, escenarioId))
      .orderBy(asc(schema.copasstEscenarioNodos.orden));
  }

  async getUserEscenarioProgreso(userId: string, companyId: string, escenarioId: string): Promise<CopasstEscenarioProgreso | undefined> {
    const [progreso] = await db.select().from(schema.copasstEscenarioProgreso)
      .where(
        and(
          eq(schema.copasstEscenarioProgreso.userId, userId),
          eq(schema.copasstEscenarioProgreso.companyId, companyId),
          eq(schema.copasstEscenarioProgreso.escenarioId, escenarioId),
          eq(schema.copasstEscenarioProgreso.completado, false)
        )
      )
      .orderBy(desc(schema.copasstEscenarioProgreso.fechaInicio))
      .limit(1);
    return progreso;
  }

  async startEscenarioProgreso(userId: string, companyId: string, escenarioId: string): Promise<CopasstEscenarioProgreso> {
    const existing = await this.getUserEscenarioProgreso(userId, companyId, escenarioId);
    if (existing) return existing;

    const [newProgreso] = await db.insert(schema.copasstEscenarioProgreso)
      .values({
        userId,
        companyId,
        escenarioId,
        nodosVisitados: [],
        decisionesTomadas: [],
        puntosObtenidos: 0,
        completado: false,
        fechaInicio: new Date(),
      })
      .returning();
    return newProgreso;
  }

  async updateEscenarioProgreso(progresoId: string, nodoId: string, opcionIndex: number, puntos: number): Promise<CopasstEscenarioProgreso> {
    const [progreso] = await db.select().from(schema.copasstEscenarioProgreso)
      .where(eq(schema.copasstEscenarioProgreso.id, progresoId));
    
    if (!progreso) {
      throw new Error('Progreso no encontrado');
    }

    const nodosVisitados = (progreso.nodosVisitados as string[]) || [];
    const decisionesTomadas = (progreso.decisionesTomadas as any[]) || [];

    nodosVisitados.push(nodoId);
    decisionesTomadas.push({ nodoId, opcionIndex, puntos });

    const [updated] = await db.update(schema.copasstEscenarioProgreso)
      .set({
        nodosVisitados,
        decisionesTomadas,
        puntosObtenidos: progreso.puntosObtenidos + puntos,
      })
      .where(eq(schema.copasstEscenarioProgreso.id, progresoId))
      .returning();
    return updated;
  }

  async completeEscenario(progresoId: string, puntosTotal: number): Promise<CopasstEscenarioProgreso> {
    const [progreso] = await db.select().from(schema.copasstEscenarioProgreso)
      .where(eq(schema.copasstEscenarioProgreso.id, progresoId));
    
    if (!progreso) {
      throw new Error('Progreso no encontrado');
    }

    const [updated] = await db.update(schema.copasstEscenarioProgreso)
      .set({
        completado: true,
        puntosObtenidos: puntosTotal,
        fechaCompletado: new Date(),
      })
      .where(eq(schema.copasstEscenarioProgreso.id, progresoId))
      .returning();

    await this.updateCopasstRacha(progreso.userId, progreso.companyId);
    await this.checkAndUnlockBadges(progreso.userId, progreso.companyId);

    return updated;
  }

  // ============================================================================
  // COPASST CAPACITACIÓN FASE 3 - CMS, Banco de Preguntas, Asignaciones, Notificaciones
  // ============================================================================

  // Course Categories CRUD
  async listCopasstCursoCategorias(companyId: string): Promise<CopasstCursoCategoria[]> {
    return await db.select()
      .from(schema.copasstCursoCategorias)
      .where(eq(schema.copasstCursoCategorias.companyId, companyId))
      .orderBy(asc(schema.copasstCursoCategorias.orden));
  }

  async createCopasstCursoCategoria(data: InsertCopasstCursoCategoria): Promise<CopasstCursoCategoria> {
    const [categoria] = await db.insert(schema.copasstCursoCategorias)
      .values(data)
      .returning();
    return categoria;
  }

  async updateCopasstCursoCategoria(id: string, data: Partial<InsertCopasstCursoCategoria>): Promise<CopasstCursoCategoria | undefined> {
    const [updated] = await db.update(schema.copasstCursoCategorias)
      .set(data)
      .where(eq(schema.copasstCursoCategorias.id, id))
      .returning();
    return updated;
  }

  async deleteCopasstCursoCategoria(id: string): Promise<boolean> {
    const result = await db.delete(schema.copasstCursoCategorias)
      .where(eq(schema.copasstCursoCategorias.id, id));
    return true;
  }

  // Course Assignments CRUD
  async listCopasstCursoAsignaciones(companyId: string, filters?: { userId?: string; cursoId?: string; estado?: string }): Promise<CopasstCursoAsignacion[]> {
    const conditions = [eq(schema.copasstCursoAsignaciones.companyId, companyId)];
    
    if (filters?.userId) {
      conditions.push(eq(schema.copasstCursoAsignaciones.userId, filters.userId));
    }
    if (filters?.cursoId) {
      conditions.push(eq(schema.copasstCursoAsignaciones.cursoId, filters.cursoId));
    }
    if (filters?.estado) {
      conditions.push(eq(schema.copasstCursoAsignaciones.estado, filters.estado));
    }

    return await db.select()
      .from(schema.copasstCursoAsignaciones)
      .where(and(...conditions))
      .orderBy(desc(schema.copasstCursoAsignaciones.fechaAsignacion));
  }

  async getCopasstCursoAsignacion(id: string): Promise<CopasstCursoAsignacion | undefined> {
    const [asignacion] = await db.select()
      .from(schema.copasstCursoAsignaciones)
      .where(eq(schema.copasstCursoAsignaciones.id, id));
    return asignacion;
  }

  async createCopasstCursoAsignacion(data: InsertCopasstCursoAsignacion): Promise<CopasstCursoAsignacion> {
    const [asignacion] = await db.insert(schema.copasstCursoAsignaciones)
      .values(data)
      .returning();
    return asignacion;
  }

  async updateCopasstCursoAsignacion(id: string, data: Partial<InsertCopasstCursoAsignacion>): Promise<CopasstCursoAsignacion | undefined> {
    const [updated] = await db.update(schema.copasstCursoAsignaciones)
      .set(data)
      .where(eq(schema.copasstCursoAsignaciones.id, id))
      .returning();
    return updated;
  }

  async deleteCopasstCursoAsignacion(id: string): Promise<boolean> {
    await db.delete(schema.copasstCursoAsignaciones)
      .where(eq(schema.copasstCursoAsignaciones.id, id));
    return true;
  }

  async getAsignacionesPendientesNotificacion(diasAntes: number): Promise<CopasstCursoAsignacion[]> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + diasAntes);
    
    return await db.select()
      .from(schema.copasstCursoAsignaciones)
      .where(
        and(
          eq(schema.copasstCursoAsignaciones.estado, 'pendiente'),
          lte(schema.copasstCursoAsignaciones.fechaLimite, fechaLimite),
          isNotNull(schema.copasstCursoAsignaciones.fechaLimite)
        )
      );
  }

  // Question Bank CRUD
  async listCopasstBancoPreguntas(companyId: string | null, filters?: { categoriaId?: string; dificultad?: string; etiqueta?: string }): Promise<CopasstBancoPregunta[]> {
    const conditions = [];
    
    if (companyId) {
      conditions.push(
        or(
          eq(schema.copasstBancoPreguntas.companyId, companyId),
          sql`${schema.copasstBancoPreguntas.companyId} IS NULL`
        )
      );
    } else {
      conditions.push(sql`${schema.copasstBancoPreguntas.companyId} IS NULL`);
    }
    
    if (filters?.categoriaId) {
      conditions.push(eq(schema.copasstBancoPreguntas.categoriaId, filters.categoriaId));
    }
    if (filters?.dificultad) {
      conditions.push(eq(schema.copasstBancoPreguntas.dificultad, filters.dificultad));
    }
    if (filters?.etiqueta) {
      conditions.push(sql`${filters.etiqueta} = ANY(${schema.copasstBancoPreguntas.etiquetas})`);
    }

    return await db.select()
      .from(schema.copasstBancoPreguntas)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(schema.copasstBancoPreguntas.createdAt));
  }

  async getCopasstBancoPregunta(id: string): Promise<CopasstBancoPregunta | undefined> {
    const [pregunta] = await db.select()
      .from(schema.copasstBancoPreguntas)
      .where(eq(schema.copasstBancoPreguntas.id, id));
    return pregunta;
  }

  async createCopasstBancoPregunta(data: InsertCopasstBancoPregunta): Promise<CopasstBancoPregunta> {
    const [pregunta] = await db.insert(schema.copasstBancoPreguntas)
      .values(data)
      .returning();
    return pregunta;
  }

  async updateCopasstBancoPregunta(id: string, data: Partial<InsertCopasstBancoPregunta>): Promise<CopasstBancoPregunta | undefined> {
    const [updated] = await db.update(schema.copasstBancoPreguntas)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.copasstBancoPreguntas.id, id))
      .returning();
    return updated;
  }

  async deleteCopasstBancoPregunta(id: string): Promise<boolean> {
    await db.delete(schema.copasstBancoPreguntas)
      .where(eq(schema.copasstBancoPreguntas.id, id));
    return true;
  }

  async importCopasstBancoPreguntas(companyId: string | null, preguntas: InsertCopasstBancoPregunta[]): Promise<number> {
    if (preguntas.length === 0) return 0;
    
    const preguntasConCompany = preguntas.map(p => ({
      ...p,
      companyId: companyId,
    }));
    
    const result = await db.insert(schema.copasstBancoPreguntas)
      .values(preguntasConCompany)
      .returning();
    
    return result.length;
  }

  // Training Notifications
  async listCopasstNotificaciones(companyId: string, filters?: { tipo?: string; estado?: string }): Promise<CopasstNotificacion[]> {
    const conditions = [eq(schema.copasstNotificaciones.companyId, companyId)];
    
    if (filters?.tipo) {
      conditions.push(eq(schema.copasstNotificaciones.tipo, filters.tipo));
    }
    if (filters?.estado) {
      conditions.push(eq(schema.copasstNotificaciones.estado, filters.estado));
    }

    return await db.select()
      .from(schema.copasstNotificaciones)
      .where(and(...conditions))
      .orderBy(desc(schema.copasstNotificaciones.fechaProgramada));
  }

  async getCopasstNotificacion(id: string): Promise<CopasstNotificacion | undefined> {
    const [notificacion] = await db.select()
      .from(schema.copasstNotificaciones)
      .where(eq(schema.copasstNotificaciones.id, id));
    return notificacion;
  }

  async createCopasstNotificacion(data: InsertCopasstNotificacion): Promise<CopasstNotificacion> {
    const [notificacion] = await db.insert(schema.copasstNotificaciones)
      .values(data)
      .returning();
    return notificacion;
  }

  async updateCopasstNotificacion(id: string, data: Partial<InsertCopasstNotificacion>): Promise<CopasstNotificacion | undefined> {
    const [updated] = await db.update(schema.copasstNotificaciones)
      .set(data)
      .where(eq(schema.copasstNotificaciones.id, id))
      .returning();
    return updated;
  }

  async getNotificacionesPendientes(): Promise<CopasstNotificacion[]> {
    const now = new Date();
    return await db.select()
      .from(schema.copasstNotificaciones)
      .where(
        and(
          eq(schema.copasstNotificaciones.estado, 'pendiente'),
          lte(schema.copasstNotificaciones.fechaProgramada, now)
        )
      )
      .orderBy(asc(schema.copasstNotificaciones.fechaProgramada));
  }

  async marcarNotificacionEnviada(id: string, exitoso: boolean, errorMensaje?: string): Promise<void> {
    await db.update(schema.copasstNotificaciones)
      .set({
        estado: exitoso ? 'enviada' : 'fallida',
        fechaEnvio: new Date(),
        intentos: sql`${schema.copasstNotificaciones.intentos} + 1`,
        errorMensaje: errorMensaje || null,
      })
      .where(eq(schema.copasstNotificaciones.id, id));
  }

  // ============================================================================
  // COPASST EVALUACIÓN 360° - Sistema de Evaluación de Desempeño
  // ============================================================================

  // Evaluation Periods CRUD
  async listCopasstEvaluacionPeriodos(companyId: string): Promise<CopasstEvaluacionPeriodo[]> {
    return await db.select()
      .from(schema.copasstEvaluacionPeriodos)
      .where(eq(schema.copasstEvaluacionPeriodos.companyId, companyId))
      .orderBy(desc(schema.copasstEvaluacionPeriodos.createdAt));
  }

  async getCopasstEvaluacionPeriodo(id: string): Promise<CopasstEvaluacionPeriodo | undefined> {
    const [periodo] = await db.select()
      .from(schema.copasstEvaluacionPeriodos)
      .where(eq(schema.copasstEvaluacionPeriodos.id, id));
    return periodo;
  }

  async createCopasstEvaluacionPeriodo(data: InsertCopasstEvaluacionPeriodo): Promise<CopasstEvaluacionPeriodo> {
    const [periodo] = await db.insert(schema.copasstEvaluacionPeriodos)
      .values(data)
      .returning();
    return periodo;
  }

  async updateCopasstEvaluacionPeriodo(id: string, data: Partial<InsertCopasstEvaluacionPeriodo>): Promise<CopasstEvaluacionPeriodo | undefined> {
    const [updated] = await db.update(schema.copasstEvaluacionPeriodos)
      .set(data)
      .where(eq(schema.copasstEvaluacionPeriodos.id, id))
      .returning();
    return updated;
  }

  async deleteCopasstEvaluacionPeriodo(id: string): Promise<boolean> {
    await db.delete(schema.copasstEvaluacionPeriodos)
      .where(eq(schema.copasstEvaluacionPeriodos.id, id));
    return true;
  }

  // Competencies CRUD
  async listCopasstCompetencias(companyId: string | null): Promise<CopasstCompetencia[]> {
    if (companyId) {
      return await db.select()
        .from(schema.copasstCompetencias)
        .where(
          or(
            eq(schema.copasstCompetencias.companyId, companyId),
            sql`${schema.copasstCompetencias.companyId} IS NULL`
          )
        )
        .orderBy(asc(schema.copasstCompetencias.dimension), asc(schema.copasstCompetencias.nombre));
    }
    return await db.select()
      .from(schema.copasstCompetencias)
      .where(sql`${schema.copasstCompetencias.companyId} IS NULL`)
      .orderBy(asc(schema.copasstCompetencias.dimension), asc(schema.copasstCompetencias.nombre));
  }

  async getCopasstCompetencia(id: string): Promise<CopasstCompetencia | undefined> {
    const [competencia] = await db.select()
      .from(schema.copasstCompetencias)
      .where(eq(schema.copasstCompetencias.id, id));
    return competencia;
  }

  async createCopasstCompetencia(data: InsertCopasstCompetencia): Promise<CopasstCompetencia> {
    const [competencia] = await db.insert(schema.copasstCompetencias)
      .values(data)
      .returning();
    return competencia;
  }

  async updateCopasstCompetencia(id: string, data: Partial<InsertCopasstCompetencia>): Promise<CopasstCompetencia | undefined> {
    const [updated] = await db.update(schema.copasstCompetencias)
      .set(data)
      .where(eq(schema.copasstCompetencias.id, id))
      .returning();
    return updated;
  }

  async deleteCopasstCompetencia(id: string): Promise<boolean> {
    await db.delete(schema.copasstCompetencias)
      .where(eq(schema.copasstCompetencias.id, id));
    return true;
  }

  // Evaluation Items (Template) CRUD
  async listCopasstEvaluacionItems(periodoId: string): Promise<CopasstEvaluacionItem[]> {
    return await db.select()
      .from(schema.copasstEvaluacionItems)
      .where(eq(schema.copasstEvaluacionItems.periodoId, periodoId))
      .orderBy(asc(schema.copasstEvaluacionItems.orden));
  }

  async createCopasstEvaluacionItem(data: InsertCopasstEvaluacionItem): Promise<CopasstEvaluacionItem> {
    const [item] = await db.insert(schema.copasstEvaluacionItems)
      .values(data)
      .returning();
    return item;
  }

  async updateCopasstEvaluacionItem(id: string, data: Partial<InsertCopasstEvaluacionItem>): Promise<CopasstEvaluacionItem | undefined> {
    const [updated] = await db.update(schema.copasstEvaluacionItems)
      .set(data)
      .where(eq(schema.copasstEvaluacionItems.id, id))
      .returning();
    return updated;
  }

  async deleteCopasstEvaluacionItem(id: string): Promise<boolean> {
    await db.delete(schema.copasstEvaluacionItems)
      .where(eq(schema.copasstEvaluacionItems.id, id));
    return true;
  }

  // Evaluation Assignments CRUD
  async listCopasstEvaluacionAsignaciones(periodoId: string, filters?: { evaluadorId?: string; evaluadoId?: string; estado?: string }): Promise<CopasstEvaluacionAsignacion[]> {
    const conditions = [eq(schema.copasstEvaluacionAsignaciones.periodoId, periodoId)];
    
    if (filters?.evaluadorId) {
      conditions.push(eq(schema.copasstEvaluacionAsignaciones.evaluadorId, filters.evaluadorId));
    }
    if (filters?.evaluadoId) {
      conditions.push(eq(schema.copasstEvaluacionAsignaciones.evaluadoId, filters.evaluadoId));
    }
    if (filters?.estado) {
      conditions.push(eq(schema.copasstEvaluacionAsignaciones.estado, filters.estado));
    }

    return await db.select()
      .from(schema.copasstEvaluacionAsignaciones)
      .where(and(...conditions))
      .orderBy(desc(schema.copasstEvaluacionAsignaciones.createdAt));
  }

  async getCopasstEvaluacionAsignacion(id: string): Promise<CopasstEvaluacionAsignacion | undefined> {
    const [asignacion] = await db.select()
      .from(schema.copasstEvaluacionAsignaciones)
      .where(eq(schema.copasstEvaluacionAsignaciones.id, id));
    return asignacion;
  }

  async createCopasstEvaluacionAsignacion(data: InsertCopasstEvaluacionAsignacion): Promise<CopasstEvaluacionAsignacion> {
    const [asignacion] = await db.insert(schema.copasstEvaluacionAsignaciones)
      .values(data)
      .returning();
    return asignacion;
  }

  async updateCopasstEvaluacionAsignacion(id: string, data: Partial<InsertCopasstEvaluacionAsignacion>): Promise<CopasstEvaluacionAsignacion | undefined> {
    const [updated] = await db.update(schema.copasstEvaluacionAsignaciones)
      .set(data)
      .where(eq(schema.copasstEvaluacionAsignaciones.id, id))
      .returning();
    return updated;
  }

  async deleteCopasstEvaluacionAsignacion(id: string): Promise<boolean> {
    await db.delete(schema.copasstEvaluacionAsignaciones)
      .where(eq(schema.copasstEvaluacionAsignaciones.id, id));
    return true;
  }

  async getMisEvaluacionesPendientes(userId: string): Promise<CopasstEvaluacionAsignacion[]> {
    return await db.select()
      .from(schema.copasstEvaluacionAsignaciones)
      .where(
        and(
          eq(schema.copasstEvaluacionAsignaciones.evaluadorId, userId),
          eq(schema.copasstEvaluacionAsignaciones.estado, 'pendiente')
        )
      )
      .orderBy(desc(schema.copasstEvaluacionAsignaciones.createdAt));
  }

  // Evaluation Responses CRUD
  async listCopasstEvaluacionRespuestas(asignacionId: string): Promise<CopasstEvaluacionRespuesta[]> {
    return await db.select()
      .from(schema.copasstEvaluacionRespuestas)
      .where(eq(schema.copasstEvaluacionRespuestas.asignacionId, asignacionId))
      .orderBy(asc(schema.copasstEvaluacionRespuestas.createdAt));
  }

  async createCopasstEvaluacionRespuesta(data: InsertCopasstEvaluacionRespuesta): Promise<CopasstEvaluacionRespuesta> {
    const [respuesta] = await db.insert(schema.copasstEvaluacionRespuestas)
      .values(data)
      .returning();
    return respuesta;
  }

  async createCopasstEvaluacionRespuestasBatch(respuestas: InsertCopasstEvaluacionRespuesta[]): Promise<number> {
    if (respuestas.length === 0) return 0;
    
    const result = await db.insert(schema.copasstEvaluacionRespuestas)
      .values(respuestas)
      .returning();
    
    return result.length;
  }

  // Evaluation Results
  async listCopasstEvaluacionResultados(periodoId: string): Promise<CopasstEvaluacionResultado[]> {
    return await db.select()
      .from(schema.copasstEvaluacionResultados)
      .where(eq(schema.copasstEvaluacionResultados.periodoId, periodoId))
      .orderBy(desc(schema.copasstEvaluacionResultados.createdAt));
  }

  async getCopasstEvaluacionResultado(periodoId: string, evaluadoId: string): Promise<CopasstEvaluacionResultado | undefined> {
    const [resultado] = await db.select()
      .from(schema.copasstEvaluacionResultados)
      .where(
        and(
          eq(schema.copasstEvaluacionResultados.periodoId, periodoId),
          eq(schema.copasstEvaluacionResultados.evaluadoId, evaluadoId)
        )
      );
    return resultado;
  }

  async getCopasstEvaluacionResultadosByEvaluadoId(evaluadoId: string): Promise<CopasstEvaluacionResultado[]> {
    return await db.select()
      .from(schema.copasstEvaluacionResultados)
      .where(eq(schema.copasstEvaluacionResultados.evaluadoId, evaluadoId))
      .orderBy(desc(schema.copasstEvaluacionResultados.createdAt));
  }

  async createCopasstEvaluacionResultado(data: InsertCopasstEvaluacionResultado): Promise<CopasstEvaluacionResultado> {
    const [resultado] = await db.insert(schema.copasstEvaluacionResultados)
      .values(data)
      .returning();
    return resultado;
  }

  async updateCopasstEvaluacionResultado(id: string, data: Partial<InsertCopasstEvaluacionResultado>): Promise<CopasstEvaluacionResultado | undefined> {
    const [updated] = await db.update(schema.copasstEvaluacionResultados)
      .set(data)
      .where(eq(schema.copasstEvaluacionResultados.id, id))
      .returning();
    return updated;
  }

  async calcularResultadosEvaluacion(periodoId: string, evaluadoId: string): Promise<CopasstEvaluacionResultado> {
    // 1. Get all completed assignments for this evaluado in this period
    const asignaciones = await db.select()
      .from(schema.copasstEvaluacionAsignaciones)
      .where(
        and(
          eq(schema.copasstEvaluacionAsignaciones.periodoId, periodoId),
          eq(schema.copasstEvaluacionAsignaciones.evaluadoId, evaluadoId),
          eq(schema.copasstEvaluacionAsignaciones.estado, 'completada')
        )
      );

    if (asignaciones.length === 0) {
      throw new Error('No hay evaluaciones completadas para calcular resultados');
    }

    // 2. Get all responses for these assignments
    const asignacionIds = asignaciones.map(a => a.id);
    const respuestas = await db.select()
      .from(schema.copasstEvaluacionRespuestas)
      .where(inArray(schema.copasstEvaluacionRespuestas.asignacionId, asignacionIds));

    // 3. Get items to know which competency each response belongs to
    const items = await db.select()
      .from(schema.copasstEvaluacionItems)
      .where(eq(schema.copasstEvaluacionItems.periodoId, periodoId));

    const itemMap = new Map(items.map(i => [i.id, i]));

    // 4. Get competencies to know dimensions
    const competenciaIds = [...new Set(items.map(i => i.competenciaId))];
    const competencias = await db.select()
      .from(schema.copasstCompetencias)
      .where(inArray(schema.copasstCompetencias.id, competenciaIds));

    const competenciaMap = new Map(competencias.map(c => [c.id, c]));

    // 5. Calculate averages per dimension
    const dimensionScores: Record<string, { sum: number; count: number; items: Array<{ nombre: string; promedio: number }> }> = {};
    const itemScores: Record<string, { sum: number; count: number; nombre: string; dimension: string }> = {};

    for (const respuesta of respuestas) {
      const item = itemMap.get(respuesta.itemId);
      if (!item) continue;

      const competencia = competenciaMap.get(item.competenciaId);
      if (!competencia) continue;

      const dimension = competencia.dimension;
      
      // Track dimension scores
      if (!dimensionScores[dimension]) {
        dimensionScores[dimension] = { sum: 0, count: 0, items: [] };
      }
      dimensionScores[dimension].sum += respuesta.valor;
      dimensionScores[dimension].count += 1;

      // Track individual item scores
      const itemKey = item.id;
      if (!itemScores[itemKey]) {
        itemScores[itemKey] = { sum: 0, count: 0, nombre: competencia.nombre, dimension };
      }
      itemScores[itemKey].sum += respuesta.valor;
      itemScores[itemKey].count += 1;
    }

    // Calculate dimension averages
    const promediosPorDimension: Record<string, number> = {};
    let totalSum = 0;
    let totalCount = 0;

    for (const [dimension, data] of Object.entries(dimensionScores)) {
      promediosPorDimension[dimension] = data.count > 0 ? Number((data.sum / data.count).toFixed(2)) : 0;
      totalSum += data.sum;
      totalCount += data.count;
    }

    const promedioGeneral = totalCount > 0 ? Number((totalSum / totalCount).toFixed(2)) : 0;

    // Calculate item averages for strengths/opportunities
    const itemAverages = Object.entries(itemScores).map(([id, data]) => ({
      id,
      nombre: data.nombre,
      dimension: data.dimension,
      promedio: data.count > 0 ? Number((data.sum / data.count).toFixed(2)) : 0
    }));

    // Sort to find top 3 strengths (highest scores) and opportunities (lowest scores)
    const sortedByScore = [...itemAverages].sort((a, b) => b.promedio - a.promedio);
    const fortalezas = sortedByScore.slice(0, 3).map(i => ({ nombre: i.nombre, dimension: i.dimension, promedio: i.promedio }));
    const oportunidades = sortedByScore.slice(-3).reverse().map(i => ({ nombre: i.nombre, dimension: i.dimension, promedio: i.promedio }));

    // 6. Create or update the resultado record
    const existingResultado = await this.getCopasstEvaluacionResultado(periodoId, evaluadoId);

    if (existingResultado) {
      const updated = await this.updateCopasstEvaluacionResultado(existingResultado.id, {
        promedioGeneral: promedioGeneral.toString(),
        promediosPorDimension,
        fortalezas,
        oportunidades
      });
      return updated!;
    }

    return await this.createCopasstEvaluacionResultado({
      periodoId,
      evaluadoId,
      promedioGeneral: promedioGeneral.toString(),
      promediosPorDimension,
      fortalezas,
      oportunidades
    });
  }

  // ============================================================================
  // CONVIVENCIA - Comité de Convivencia Laboral
  // Resolución 652/2012, Resolución 1356/2012
  // ============================================================================

  // Convivencia Períodos
  async getConvivenciaPeriodos(companyId: string): Promise<ConvivenciaPeriodo[]> {
    return await db.select().from(schema.convivenciaPeriodos)
      .where(eq(schema.convivenciaPeriodos.companyId, companyId))
      .orderBy(desc(schema.convivenciaPeriodos.fechaInicio));
  }

  async getConvivenciaPeriodo(id: string): Promise<ConvivenciaPeriodo | undefined> {
    const [periodo] = await db.select().from(schema.convivenciaPeriodos)
      .where(eq(schema.convivenciaPeriodos.id, id));
    return periodo;
  }

  async getConvivenciaPeriodoActivo(companyId: string): Promise<ConvivenciaPeriodo | undefined> {
    const now = new Date();
    const [periodo] = await db.select().from(schema.convivenciaPeriodos)
      .where(
        and(
          eq(schema.convivenciaPeriodos.companyId, companyId),
          eq(schema.convivenciaPeriodos.estado, 'activo'),
          lte(schema.convivenciaPeriodos.fechaInicio, now.toISOString().split('T')[0]),
          gte(schema.convivenciaPeriodos.fechaFin, now.toISOString().split('T')[0])
        )
      )
      .orderBy(desc(schema.convivenciaPeriodos.fechaInicio))
      .limit(1);
    return periodo;
  }

  async createConvivenciaPeriodo(periodo: InsertConvivenciaPeriodo): Promise<ConvivenciaPeriodo> {
    // If creating a new active period, deactivate any existing active periods for this company
    if (periodo.estado === 'activo' && periodo.companyId) {
      await db.update(schema.convivenciaPeriodos)
        .set({ estado: 'inactivo' })
        .where(
          and(
            eq(schema.convivenciaPeriodos.companyId, periodo.companyId),
            eq(schema.convivenciaPeriodos.estado, 'activo')
          )
        );
    }
    
    const [newPeriodo] = await db.insert(schema.convivenciaPeriodos)
      .values(periodo)
      .returning();
    return newPeriodo;
  }

  async updateConvivenciaPeriodo(id: string, data: Partial<InsertConvivenciaPeriodo>): Promise<ConvivenciaPeriodo | undefined> {
    const [updated] = await db.update(schema.convivenciaPeriodos)
      .set(data)
      .where(eq(schema.convivenciaPeriodos.id, id))
      .returning();
    return updated;
  }

  // Convivencia Miembros
  async getConvivenciaMiembros(periodoId: string): Promise<ConvivenciaMiembro[]> {
    return await db.select().from(schema.convivenciaMiembros)
      .where(eq(schema.convivenciaMiembros.periodoId, periodoId))
      .orderBy(asc(schema.convivenciaMiembros.representacion), asc(schema.convivenciaMiembros.cargo));
  }

  async getConvivenciaMiembro(id: string): Promise<ConvivenciaMiembro | undefined> {
    const [miembro] = await db.select().from(schema.convivenciaMiembros)
      .where(eq(schema.convivenciaMiembros.id, id));
    return miembro;
  }

  async createConvivenciaMiembro(miembro: InsertConvivenciaMiembro): Promise<ConvivenciaMiembro> {
    const [newMiembro] = await db.insert(schema.convivenciaMiembros)
      .values(miembro)
      .returning();
    return newMiembro;
  }

  async updateConvivenciaMiembro(id: string, data: Partial<InsertConvivenciaMiembro>): Promise<ConvivenciaMiembro | undefined> {
    const [updated] = await db.update(schema.convivenciaMiembros)
      .set(data)
      .where(eq(schema.convivenciaMiembros.id, id))
      .returning();
    return updated;
  }

  async deleteConvivenciaMiembro(id: string): Promise<void> {
    await db.delete(schema.convivenciaMiembros)
      .where(eq(schema.convivenciaMiembros.id, id));
  }

  // Convivencia Elecciones
  async getConvivenciaElecciones(companyId: string): Promise<ConvivenciaEleccion[]> {
    return await db.select().from(schema.convivenciaElecciones)
      .where(eq(schema.convivenciaElecciones.companyId, companyId))
      .orderBy(desc(schema.convivenciaElecciones.createdAt));
  }

  async getConvivenciaEleccion(id: string): Promise<ConvivenciaEleccion | undefined> {
    const [eleccion] = await db.select().from(schema.convivenciaElecciones)
      .where(eq(schema.convivenciaElecciones.id, id));
    return eleccion;
  }

  async getConvivenciaEleccionActiva(companyId: string): Promise<ConvivenciaEleccion | undefined> {
    // SST-2025-0097: Filter by publicadoEnPortal to ensure only published elections are visible to workers
    const [eleccion] = await db.select().from(schema.convivenciaElecciones)
      .where(
        and(
          eq(schema.convivenciaElecciones.companyId, companyId),
          eq(schema.convivenciaElecciones.publicadoEnPortal, true),
          sql`${schema.convivenciaElecciones.estado} IN ('convocatoria', 'inscripcion', 'votacion', 'escrutinio')`
        )
      )
      .orderBy(desc(schema.convivenciaElecciones.createdAt))
      .limit(1);
    return eleccion;
  }

  async createConvivenciaEleccion(eleccion: InsertConvivenciaEleccion): Promise<ConvivenciaEleccion> {
    const [newEleccion] = await db.insert(schema.convivenciaElecciones)
      .values(eleccion)
      .returning();
    return newEleccion;
  }

  async updateConvivenciaEleccion(id: string, data: Partial<InsertConvivenciaEleccion>): Promise<ConvivenciaEleccion | undefined> {
    const [updated] = await db.update(schema.convivenciaElecciones)
      .set(data)
      .where(eq(schema.convivenciaElecciones.id, id))
      .returning();
    return updated;
  }

  async advanceConvivenciaEleccionPhase(id: string): Promise<ConvivenciaEleccion | undefined> {
    const eleccion = await this.getConvivenciaEleccion(id);
    if (!eleccion) return undefined;

    const phaseOrder = ['convocatoria', 'inscripcion', 'votacion', 'escrutinio', 'completada'];
    const currentIndex = phaseOrder.indexOf(eleccion.estado);
    
    if (currentIndex === -1 || currentIndex >= phaseOrder.length - 1) {
      return eleccion; // Already at final phase or invalid state
    }

    const nextPhase = phaseOrder[currentIndex + 1];
    
    // When advancing to 'completada', automatically create members from election winners
    if (nextPhase === 'completada') {
      // Get or create the active period for this company
      let periodo = await this.getConvivenciaPeriodoActivo(eleccion.companyId);
      
      if (!periodo) {
        // Create a new period if none exists
        const fechaInicio = new Date();
        const fechaFin = new Date();
        fechaFin.setFullYear(fechaFin.getFullYear() + 2); // 2-year term as per Resolución 652/2012
        
        periodo = await this.createConvivenciaPeriodo({
          companyId: eleccion.companyId,
          fechaInicio: fechaInicio.toISOString().split('T')[0],
          fechaFin: fechaFin.toISOString().split('T')[0],
          estado: 'activo',
        });
      }
      
      // Get candidates ordered by votes (winners first)
      const candidatos = await this.getConvivenciaCandidatos(id);
      
      // Get workers count to determine committee size
      // Per Resolución 652/2012: <20 workers = 1+1, >=20 workers = 2+2
      const workers = await db.select().from(schema.workers)
        .where(eq(schema.workers.companyId, eleccion.companyId));
      const numMiembrosTrabajadores = workers.length >= 20 ? 2 : 1;
      
      // Create members from top voted candidates (workers' representatives elected by vote)
      const ganadores = candidatos.slice(0, numMiembrosTrabajadores);
      for (let i = 0; i < ganadores.length; i++) {
        const candidato = ganadores[i];
        if (candidato.workerId) {
          // Check if worker is already a member in this period
          const existingMember = await db.select().from(schema.convivenciaMiembros)
            .where(
              and(
                eq(schema.convivenciaMiembros.periodoId, periodo.id),
                eq(schema.convivenciaMiembros.workerId, candidato.workerId)
              )
            )
            .limit(1);
          
          if (existingMember.length === 0) {
            await this.createConvivenciaMiembro({
              periodoId: periodo.id,
              workerId: candidato.workerId,
              representacion: 'trabajador',
              cargo: i === 0 ? 'miembro_principal' : 'miembro_suplente',
              fechaDesignacion: new Date().toISOString().split('T')[0],
              estado: 'activo',
              votosObtenidos: candidato.votosRecibidos || 0,
            });
          }
        }
      }
      
      // Link election to period
      await this.updateConvivenciaEleccion(id, { estado: nextPhase, periodoId: periodo.id });
      return await this.getConvivenciaEleccion(id);
    }
    
    return await this.updateConvivenciaEleccion(id, { estado: nextPhase });
  }

  // Convivencia Candidatos
  async getConvivenciaCandidatos(eleccionId: string): Promise<ConvivenciaCandidato[]> {
    return await db.select().from(schema.convivenciaCandidatos)
      .where(eq(schema.convivenciaCandidatos.eleccionId, eleccionId))
      .orderBy(desc(schema.convivenciaCandidatos.votosRecibidos));
  }

  async getConvivenciaCandidato(id: string): Promise<ConvivenciaCandidato | undefined> {
    const [candidato] = await db.select().from(schema.convivenciaCandidatos)
      .where(eq(schema.convivenciaCandidatos.id, id));
    return candidato;
  }

  async getConvivenciaCandidatoByWorker(eleccionId: string, workerId: string): Promise<ConvivenciaCandidato | undefined> {
    const [candidato] = await db.select().from(schema.convivenciaCandidatos)
      .where(
        and(
          eq(schema.convivenciaCandidatos.eleccionId, eleccionId),
          eq(schema.convivenciaCandidatos.workerId, workerId)
        )
      );
    return candidato;
  }

  async createConvivenciaCandidato(candidato: InsertConvivenciaCandidato): Promise<ConvivenciaCandidato> {
    const [newCandidato] = await db.insert(schema.convivenciaCandidatos)
      .values(candidato)
      .returning();
    return newCandidato;
  }

  async updateConvivenciaCandidato(id: string, data: Partial<InsertConvivenciaCandidato>): Promise<ConvivenciaCandidato | undefined> {
    const [updated] = await db.update(schema.convivenciaCandidatos)
      .set(data)
      .where(eq(schema.convivenciaCandidatos.id, id))
      .returning();
    return updated;
  }

  async deleteConvivenciaCandidato(id: string): Promise<void> {
    await db.delete(schema.convivenciaCandidatos)
      .where(eq(schema.convivenciaCandidatos.id, id));
  }

  // Convivencia Votación
  async getConvivenciaRegistrosVotacion(eleccionId: string): Promise<ConvivenciaRegistroVotacion[]> {
    return await db.select().from(schema.convivenciaRegistroVotacion)
      .where(eq(schema.convivenciaRegistroVotacion.eleccionId, eleccionId))
      .orderBy(desc(schema.convivenciaRegistroVotacion.fechaHoraVoto));
  }

  async hasVotedConvivencia(eleccionId: string, workerId: string): Promise<boolean> {
    const [registro] = await db.select().from(schema.convivenciaRegistroVotacion)
      .where(
        and(
          eq(schema.convivenciaRegistroVotacion.eleccionId, eleccionId),
          eq(schema.convivenciaRegistroVotacion.workerId, workerId)
        )
      )
      .limit(1);
    return !!registro;
  }

  async registrarVotoConvivencia(eleccionId: string, workerId: string, candidatoIds: string[], ipAddress?: string): Promise<void> {
    await db.transaction(async (tx) => {
      // Registrar que el trabajador votó (sin revelar por quién - voto secreto)
      await tx.insert(schema.convivenciaRegistroVotacion).values({
        eleccionId,
        workerId,
        fechaHoraVoto: new Date(),
        ipAddress: ipAddress || null,
      });

      // Registrar cada voto individual (anónimo)
      for (const candidatoId of candidatoIds) {
        await tx.insert(schema.convivenciaVotos).values({
          eleccionId,
          candidatoId,
        });

        // Incrementar contador de votos del candidato
        await tx.execute(
          sql`UPDATE ${schema.convivenciaCandidatos} 
              SET votos_recibidos = COALESCE(votos_recibidos, 0) + 1 
              WHERE id = ${candidatoId}`
        );
      }

      // Actualizar estadísticas de la elección
      await tx.execute(
        sql`UPDATE ${schema.convivenciaElecciones} 
            SET total_votantes = COALESCE(total_votantes, 0) + 1,
                votos_validos = COALESCE(votos_validos, 0) + ${candidatoIds.length}
            WHERE id = ${eleccionId}`
      );
    });
  }

  async getConvivenciaResults(eleccionId: string): Promise<{ candidatos: ConvivenciaCandidato[]; totalVotos: number; totalVotantes: number }> {
    const candidatos = await this.getConvivenciaCandidatos(eleccionId);
    const registros = await this.getConvivenciaRegistrosVotacion(eleccionId);
    
    const totalVotos = candidatos.reduce((sum, c) => sum + (c.votosRecibidos || 0), 0);
    const totalVotantes = registros.length;

    return { candidatos, totalVotos, totalVotantes };
  }

  // Convivencia Actas
  async getConvivenciaActas(companyId: string): Promise<ConvivenciaActa[]> {
    return await db.select().from(schema.convivenciaActas)
      .where(eq(schema.convivenciaActas.companyId, companyId))
      .orderBy(desc(schema.convivenciaActas.fecha));
  }

  async getConvivenciaActa(id: string): Promise<ConvivenciaActa | undefined> {
    const [acta] = await db.select().from(schema.convivenciaActas)
      .where(eq(schema.convivenciaActas.id, id));
    return acta;
  }

  async createConvivenciaActa(acta: InsertConvivenciaActa): Promise<ConvivenciaActa> {
    const [newActa] = await db.insert(schema.convivenciaActas)
      .values(acta)
      .returning();
    return newActa;
  }

  async updateConvivenciaActa(id: string, data: Partial<InsertConvivenciaActa>): Promise<ConvivenciaActa | undefined> {
    const [updated] = await db.update(schema.convivenciaActas)
      .set(data)
      .where(eq(schema.convivenciaActas.id, id))
      .returning();
    return updated;
  }

  // ============================================================================
  // PROMOTION PREVENTION ACTIVITIES (Standard 3.1.2)
  // ============================================================================

  async getPromotionPreventionActivities(companyId: string): Promise<PromotionPreventionActivity[]> {
    return await db.select().from(schema.promotionPreventionActivities)
      .where(eq(schema.promotionPreventionActivities.companyId, companyId))
      .orderBy(desc(schema.promotionPreventionActivities.startDate));
  }

  async getPromotionPreventionActivity(id: string, companyId: string): Promise<PromotionPreventionActivity | undefined> {
    const [activity] = await db.select().from(schema.promotionPreventionActivities)
      .where(and(
        eq(schema.promotionPreventionActivities.id, id),
        eq(schema.promotionPreventionActivities.companyId, companyId)
      ));
    return activity;
  }

  async createPromotionPreventionActivity(activity: InsertPromotionPreventionActivity): Promise<PromotionPreventionActivity> {
    const [newActivity] = await db.insert(schema.promotionPreventionActivities)
      .values(activity)
      .returning();
    return newActivity;
  }

  async updatePromotionPreventionActivity(id: string, companyId: string, data: Partial<InsertPromotionPreventionActivity>): Promise<PromotionPreventionActivity | undefined> {
    const [updated] = await db.update(schema.promotionPreventionActivities)
      .set({ ...data, updatedAt: new Date() })
      .where(and(
        eq(schema.promotionPreventionActivities.id, id),
        eq(schema.promotionPreventionActivities.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deletePromotionPreventionActivity(id: string, companyId: string): Promise<boolean> {
    const result = await db.delete(schema.promotionPreventionActivities)
      .where(and(
        eq(schema.promotionPreventionActivities.id, id),
        eq(schema.promotionPreventionActivities.companyId, companyId)
      ));
    return true;
  }

  // Promotion Prevention Participants
  async getPromotionPreventionParticipants(activityId: string): Promise<PromotionPreventionParticipant[]> {
    return await db.select().from(schema.promotionPreventionParticipants)
      .where(eq(schema.promotionPreventionParticipants.activityId, activityId))
      .orderBy(asc(schema.promotionPreventionParticipants.workerName));
  }

  async createPromotionPreventionParticipant(participant: InsertPromotionPreventionParticipant): Promise<PromotionPreventionParticipant> {
    const [newParticipant] = await db.insert(schema.promotionPreventionParticipants)
      .values(participant)
      .returning();
    return newParticipant;
  }

  async updatePromotionPreventionParticipant(id: string, data: Partial<InsertPromotionPreventionParticipant>): Promise<PromotionPreventionParticipant | undefined> {
    const [updated] = await db.update(schema.promotionPreventionParticipants)
      .set(data)
      .where(eq(schema.promotionPreventionParticipants.id, id))
      .returning();
    return updated;
  }

  async deletePromotionPreventionParticipant(id: string): Promise<boolean> {
    await db.delete(schema.promotionPreventionParticipants)
      .where(eq(schema.promotionPreventionParticipants.id, id));
    return true;
  }

  // ============================================================================
  // ACCIDENT STATISTICS - Indicadores de Accidentalidad (Estándar 3.2.2)
  // Resolución 0312/2019, Decreto 1072/2015
  // ============================================================================

  async getAccidentStatisticsByCompanyId(companyId: string): Promise<AccidentStatistics[]> {
    return await db
      .select()
      .from(schema.accidentStatistics)
      .where(eq(schema.accidentStatistics.companyId, companyId))
      .orderBy(desc(schema.accidentStatistics.year), desc(schema.accidentStatistics.month));
  }

  async getAccidentStatisticsByYear(companyId: string, year: number): Promise<AccidentStatistics | null> {
    const result = await db
      .select()
      .from(schema.accidentStatistics)
      .where(and(
        eq(schema.accidentStatistics.companyId, companyId),
        eq(schema.accidentStatistics.year, year),
        isNull(schema.accidentStatistics.month)
      ))
      .limit(1);
    return result[0] ?? null;
  }

  async createAccidentStatistics(stats: InsertAccidentStatistics, companyId: string): Promise<AccidentStatistics> {
    const hht = parseFloat(stats.hoursWorkedHHT as string) || 0;
    const at = stats.totalAccidents || 0;
    const dias = stats.lostDays || 0;
    const trabajadores = stats.totalWorkers || 1;
    const el = stats.totalOccupationalDiseases || 0;
    
    const indicadorIF = hht > 0 ? (at * 200000) / hht : 0;
    const indicadorIS = hht > 0 ? (dias * 200000) / hht : 0;
    const indicadorILI = (indicadorIF * indicadorIS) / 1000;
    const tasaAccidentalidad = (at / trabajadores) * 100;
    const tasaEnfermedadLaboral = (el / trabajadores) * 100;
    
    const [result] = await db
      .insert(schema.accidentStatistics)
      .values({
        ...stats,
        companyId,
        indicadorIF: indicadorIF.toFixed(4),
        indicadorIS: indicadorIS.toFixed(4),
        indicadorILI: indicadorILI.toFixed(4),
        tasaAccidentalidad: tasaAccidentalidad.toFixed(4),
        tasaEnfermedadLaboral: tasaEnfermedadLaboral.toFixed(4),
      })
      .returning();
    return result;
  }

  async updateAccidentStatistics(id: string, stats: Partial<InsertAccidentStatistics>): Promise<AccidentStatistics> {
    const [current] = await db
      .select()
      .from(schema.accidentStatistics)
      .where(eq(schema.accidentStatistics.id, id));
    
    if (!current) throw new Error("Registro de estadísticas no encontrado");
    
    const hht = parseFloat((stats.hoursWorkedHHT ?? current.hoursWorkedHHT) as string) || 0;
    const at = stats.totalAccidents ?? current.totalAccidents ?? 0;
    const dias = stats.lostDays ?? current.lostDays ?? 0;
    const trabajadores = stats.totalWorkers ?? current.totalWorkers ?? 1;
    const el = stats.totalOccupationalDiseases ?? current.totalOccupationalDiseases ?? 0;
    
    const indicadorIF = hht > 0 ? (at * 200000) / hht : 0;
    const indicadorIS = hht > 0 ? (dias * 200000) / hht : 0;
    const indicadorILI = (indicadorIF * indicadorIS) / 1000;
    const tasaAccidentalidad = (at / trabajadores) * 100;
    const tasaEnfermedadLaboral = (el / trabajadores) * 100;
    
    const [result] = await db
      .update(schema.accidentStatistics)
      .set({
        ...stats,
        indicadorIF: indicadorIF.toFixed(4),
        indicadorIS: indicadorIS.toFixed(4),
        indicadorILI: indicadorILI.toFixed(4),
        tasaAccidentalidad: tasaAccidentalidad.toFixed(4),
        tasaEnfermedadLaboral: tasaEnfermedadLaboral.toFixed(4),
        updatedAt: new Date(),
      })
      .where(eq(schema.accidentStatistics.id, id))
      .returning();
    return result;
  }

  async deleteAccidentStatistics(id: string): Promise<void> {
    await db
      .delete(schema.accidentStatistics)
      .where(eq(schema.accidentStatistics.id, id));
  }

  // ============================================================================
  // EVS - Estilos de Vida Saludable (Standard 3.1.7)
  // ============================================================================

  async getEvsPrograms(companyId: string): Promise<EvsProgram[]> {
    return await db.select().from(schema.evsPrograms).where(eq(schema.evsPrograms.companyId, companyId)).orderBy(desc(schema.evsPrograms.createdAt));
  }

  async getEvsProgram(id: string, companyId: string): Promise<EvsProgram | undefined> {
    const [program] = await db.select().from(schema.evsPrograms).where(and(eq(schema.evsPrograms.id, id), eq(schema.evsPrograms.companyId, companyId)));
    return program;
  }

  async createEvsProgram(program: InsertEvsProgram): Promise<EvsProgram> {
    const [created] = await db.insert(schema.evsPrograms).values(program).returning();
    return created;
  }

  async updateEvsProgram(id: string, companyId: string, data: Partial<InsertEvsProgram>): Promise<EvsProgram | undefined> {
    const [updated] = await db.update(schema.evsPrograms).set({ ...data, updatedAt: new Date() }).where(and(eq(schema.evsPrograms.id, id), eq(schema.evsPrograms.companyId, companyId))).returning();
    return updated;
  }

  async deleteEvsProgram(id: string, companyId: string): Promise<boolean> {
    const result = await db.delete(schema.evsPrograms).where(and(eq(schema.evsPrograms.id, id), eq(schema.evsPrograms.companyId, companyId)));
    return true;
  }

  async getEvsActivities(companyId: string): Promise<EvsActivity[]> {
    return await db.select().from(schema.evsActivities).where(eq(schema.evsActivities.companyId, companyId)).orderBy(desc(schema.evsActivities.createdAt));
  }

  async getEvsActivitiesByProgram(programId: string, companyId: string): Promise<EvsActivity[]> {
    return await db.select().from(schema.evsActivities).where(and(eq(schema.evsActivities.programId, programId), eq(schema.evsActivities.companyId, companyId))).orderBy(desc(schema.evsActivities.createdAt));
  }

  async getEvsActivity(id: string, companyId: string): Promise<EvsActivity | undefined> {
    const [activity] = await db.select().from(schema.evsActivities).where(and(eq(schema.evsActivities.id, id), eq(schema.evsActivities.companyId, companyId)));
    return activity;
  }

  async createEvsActivity(activity: InsertEvsActivity): Promise<EvsActivity> {
    const [created] = await db.insert(schema.evsActivities).values(activity).returning();
    return created;
  }

  async updateEvsActivity(id: string, companyId: string, data: Partial<InsertEvsActivity>): Promise<EvsActivity | undefined> {
    const [updated] = await db.update(schema.evsActivities).set({ ...data, updatedAt: new Date() }).where(and(eq(schema.evsActivities.id, id), eq(schema.evsActivities.companyId, companyId))).returning();
    return updated;
  }

  async deleteEvsActivity(id: string, companyId: string): Promise<boolean> {
    await db.delete(schema.evsActivities).where(and(eq(schema.evsActivities.id, id), eq(schema.evsActivities.companyId, companyId)));
    return true;
  }

  async getEvsControls(companyId: string): Promise<EvsControl[]> {
    return await db.select().from(schema.evsControls).where(eq(schema.evsControls.companyId, companyId)).orderBy(desc(schema.evsControls.createdAt));
  }

  async getEvsControlsByWorker(workerId: string, companyId: string): Promise<EvsControl[]> {
    return await db.select().from(schema.evsControls).where(and(eq(schema.evsControls.workerId, workerId), eq(schema.evsControls.companyId, companyId))).orderBy(desc(schema.evsControls.createdAt));
  }

  async getEvsControl(id: string, companyId: string): Promise<EvsControl | undefined> {
    const [control] = await db.select().from(schema.evsControls).where(and(eq(schema.evsControls.id, id), eq(schema.evsControls.companyId, companyId)));
    return control;
  }

  async createEvsControl(control: InsertEvsControl): Promise<EvsControl> {
    const [created] = await db.insert(schema.evsControls).values(control).returning();
    return created;
  }

  async updateEvsControl(id: string, companyId: string, data: Partial<InsertEvsControl>): Promise<EvsControl | undefined> {
    const [updated] = await db.update(schema.evsControls).set({ ...data, updatedAt: new Date() }).where(and(eq(schema.evsControls.id, id), eq(schema.evsControls.companyId, companyId))).returning();
    return updated;
  }

  async deleteEvsControl(id: string, companyId: string): Promise<boolean> {
    await db.delete(schema.evsControls).where(and(eq(schema.evsControls.id, id), eq(schema.evsControls.companyId, companyId)));
    return true;
  }

  async getEvsIncidents(companyId: string): Promise<EvsIncident[]> {
    return await db.select().from(schema.evsIncidents).where(eq(schema.evsIncidents.companyId, companyId)).orderBy(desc(schema.evsIncidents.createdAt));
  }

  async getEvsIncident(id: string, companyId: string): Promise<EvsIncident | undefined> {
    const [incident] = await db.select().from(schema.evsIncidents).where(and(eq(schema.evsIncidents.id, id), eq(schema.evsIncidents.companyId, companyId)));
    return incident;
  }

  async createEvsIncident(incident: InsertEvsIncident): Promise<EvsIncident> {
    const [created] = await db.insert(schema.evsIncidents).values(incident).returning();
    return created;
  }

  async updateEvsIncident(id: string, companyId: string, data: Partial<InsertEvsIncident>): Promise<EvsIncident | undefined> {
    const [updated] = await db.update(schema.evsIncidents).set({ ...data, updatedAt: new Date() }).where(and(eq(schema.evsIncidents.id, id), eq(schema.evsIncidents.companyId, companyId))).returning();
    return updated;
  }

  async deleteEvsIncident(id: string, companyId: string): Promise<boolean> {
    await db.delete(schema.evsIncidents).where(and(eq(schema.evsIncidents.id, id), eq(schema.evsIncidents.companyId, companyId)));
    return true;
  }

  async getEvsFollowups(companyId: string): Promise<EvsFollowup[]> {
    return await db.select().from(schema.evsFollowups).where(eq(schema.evsFollowups.companyId, companyId)).orderBy(desc(schema.evsFollowups.createdAt));
  }

  async getEvsFollowupsByWorker(workerId: string, companyId: string): Promise<EvsFollowup[]> {
    return await db.select().from(schema.evsFollowups).where(and(eq(schema.evsFollowups.workerId, workerId), eq(schema.evsFollowups.companyId, companyId))).orderBy(desc(schema.evsFollowups.createdAt));
  }

  async getEvsFollowup(id: string, companyId: string): Promise<EvsFollowup | undefined> {
    const [followup] = await db.select().from(schema.evsFollowups).where(and(eq(schema.evsFollowups.id, id), eq(schema.evsFollowups.companyId, companyId)));
    return followup;
  }

  async createEvsFollowup(followup: InsertEvsFollowup): Promise<EvsFollowup> {
    const [created] = await db.insert(schema.evsFollowups).values(followup).returning();
    return created;
  }

  async updateEvsFollowup(id: string, companyId: string, data: Partial<InsertEvsFollowup>): Promise<EvsFollowup | undefined> {
    const [updated] = await db.update(schema.evsFollowups).set({ ...data, updatedAt: new Date() }).where(and(eq(schema.evsFollowups.id, id), eq(schema.evsFollowups.companyId, companyId))).returning();
    return updated;
  }

  async deleteEvsFollowup(id: string, companyId: string): Promise<boolean> {
    await db.delete(schema.evsFollowups).where(and(eq(schema.evsFollowups.id, id), eq(schema.evsFollowups.companyId, companyId)));
    return true;
  }

  async getEvsParticipants(activityId: string): Promise<EvsParticipant[]> {
    return await db.select().from(schema.evsParticipants).where(eq(schema.evsParticipants.activityId, activityId)).orderBy(desc(schema.evsParticipants.createdAt));
  }

  async createEvsParticipant(participant: InsertEvsParticipant): Promise<EvsParticipant> {
    const [created] = await db.insert(schema.evsParticipants).values(participant).returning();
    return created;
  }

  async updateEvsParticipant(id: string, data: Partial<InsertEvsParticipant>): Promise<EvsParticipant | undefined> {
    const [updated] = await db.update(schema.evsParticipants).set({ ...data, updatedAt: new Date() }).where(eq(schema.evsParticipants.id, id)).returning();
    return updated;
  }

  async deleteEvsParticipant(id: string): Promise<boolean> {
    await db.delete(schema.evsParticipants).where(eq(schema.evsParticipants.id, id));
    return true;
  }

  // ==================== PCA - PROGRAMA DE CONSERVACIÓN AUDITIVA ====================

  // Audiometry Records methods
  async getAudiometryRecords(companyId: string): Promise<AudiometryRecord[]> {
    return await db.select().from(schema.audiometryRecords).where(eq(schema.audiometryRecords.companyId, companyId)).orderBy(desc(schema.audiometryRecords.createdAt));
  }

  async getAllAudiometryRecords(): Promise<AudiometryRecord[]> {
    return await db.select().from(schema.audiometryRecords).orderBy(desc(schema.audiometryRecords.createdAt));
  }

  async getAudiometryRecord(id: string, companyId: string): Promise<AudiometryRecord | undefined> {
    const [record] = await db.select().from(schema.audiometryRecords).where(and(eq(schema.audiometryRecords.id, id), eq(schema.audiometryRecords.companyId, companyId)));
    return record;
  }

  async getAudiometryRecordById(id: string): Promise<AudiometryRecord | undefined> {
    const [record] = await db.select().from(schema.audiometryRecords).where(eq(schema.audiometryRecords.id, id));
    return record;
  }

  async createAudiometryRecord(record: InsertAudiometryRecord, companyId: string): Promise<AudiometryRecord> {
    const [created] = await db.insert(schema.audiometryRecords).values({ ...record, companyId }).returning();
    return created;
  }

  async updateAudiometryRecord(id: string, record: Partial<InsertAudiometryRecord>, companyId: string): Promise<AudiometryRecord | undefined> {
    const [updated] = await db.update(schema.audiometryRecords).set({ ...record, updatedAt: new Date() }).where(and(eq(schema.audiometryRecords.id, id), eq(schema.audiometryRecords.companyId, companyId))).returning();
    return updated;
  }

  async getAudiometryRecordsByWorker(workerId: string, companyId: string): Promise<AudiometryRecord[]> {
    return await db.select().from(schema.audiometryRecords).where(and(eq(schema.audiometryRecords.workerId, workerId), eq(schema.audiometryRecords.companyId, companyId))).orderBy(desc(schema.audiometryRecords.scheduledDate));
  }

  async deleteAudiometryRecord(id: string, companyId: string): Promise<void> {
    await db.delete(schema.audiometryRecords).where(and(eq(schema.audiometryRecords.id, id), eq(schema.audiometryRecords.companyId, companyId)));
  }

  // Noise Exposure Profiles methods
  async getNoiseExposureProfiles(companyId: string): Promise<NoiseExposureProfile[]> {
    return await db.select().from(schema.noiseExposureProfiles).where(eq(schema.noiseExposureProfiles.companyId, companyId)).orderBy(desc(schema.noiseExposureProfiles.createdAt));
  }

  async getAllNoiseExposureProfiles(): Promise<NoiseExposureProfile[]> {
    return await db.select().from(schema.noiseExposureProfiles).orderBy(desc(schema.noiseExposureProfiles.createdAt));
  }

  async getNoiseExposureProfile(id: string, companyId: string): Promise<NoiseExposureProfile | undefined> {
    const [profile] = await db.select().from(schema.noiseExposureProfiles).where(and(eq(schema.noiseExposureProfiles.id, id), eq(schema.noiseExposureProfiles.companyId, companyId)));
    return profile;
  }

  async getNoiseExposureProfileById(id: string): Promise<NoiseExposureProfile | undefined> {
    const [profile] = await db.select().from(schema.noiseExposureProfiles).where(eq(schema.noiseExposureProfiles.id, id));
    return profile;
  }

  async createNoiseExposureProfile(profile: InsertNoiseExposureProfile, companyId: string): Promise<NoiseExposureProfile> {
    const [created] = await db.insert(schema.noiseExposureProfiles).values({ ...profile, companyId }).returning();
    return created;
  }

  async updateNoiseExposureProfile(id: string, profile: Partial<InsertNoiseExposureProfile>, companyId: string): Promise<NoiseExposureProfile | undefined> {
    const [updated] = await db.update(schema.noiseExposureProfiles).set({ ...profile, updatedAt: new Date() }).where(and(eq(schema.noiseExposureProfiles.id, id), eq(schema.noiseExposureProfiles.companyId, companyId))).returning();
    return updated;
  }

  async deleteNoiseExposureProfile(id: string, companyId: string): Promise<void> {
    await db.delete(schema.noiseExposureProfiles).where(and(eq(schema.noiseExposureProfiles.id, id), eq(schema.noiseExposureProfiles.companyId, companyId)));
  }

  // Worker Exposure Assignments methods
  async getWorkerExposureAssignments(companyId: string): Promise<WorkerExposureAssignment[]> {
    return await db.select().from(schema.workerExposureAssignments).where(eq(schema.workerExposureAssignments.companyId, companyId)).orderBy(desc(schema.workerExposureAssignments.createdAt));
  }

  async getWorkerExposureAssignment(id: string, companyId: string): Promise<WorkerExposureAssignment | undefined> {
    const [assignment] = await db.select().from(schema.workerExposureAssignments).where(and(eq(schema.workerExposureAssignments.id, id), eq(schema.workerExposureAssignments.companyId, companyId)));
    return assignment;
  }

  async createWorkerExposureAssignment(assignment: InsertWorkerExposureAssignment, companyId: string): Promise<WorkerExposureAssignment> {
    const [created] = await db.insert(schema.workerExposureAssignments).values({ ...assignment, companyId }).returning();
    return created;
  }

  async deleteWorkerExposureAssignment(id: string, companyId: string): Promise<void> {
    await db.delete(schema.workerExposureAssignments).where(and(eq(schema.workerExposureAssignments.id, id), eq(schema.workerExposureAssignments.companyId, companyId)));
  }

  // PCA Control Actions methods
  async getPcaControlActions(companyId: string): Promise<PcaControlAction[]> {
    return await db.select().from(schema.pcaControlActions).where(eq(schema.pcaControlActions.companyId, companyId)).orderBy(desc(schema.pcaControlActions.createdAt));
  }

  async getAllPcaControlActions(): Promise<PcaControlAction[]> {
    return await db.select().from(schema.pcaControlActions).orderBy(desc(schema.pcaControlActions.createdAt));
  }

  async getPcaControlAction(id: string, companyId: string): Promise<PcaControlAction | undefined> {
    const [action] = await db.select().from(schema.pcaControlActions).where(and(eq(schema.pcaControlActions.id, id), eq(schema.pcaControlActions.companyId, companyId)));
    return action;
  }

  async getPcaControlActionById(id: string): Promise<PcaControlAction | undefined> {
    const [action] = await db.select().from(schema.pcaControlActions).where(eq(schema.pcaControlActions.id, id));
    return action;
  }

  async createPcaControlAction(action: InsertPcaControlAction, companyId: string): Promise<PcaControlAction> {
    const [created] = await db.insert(schema.pcaControlActions).values({ ...action, companyId }).returning();
    return created;
  }

  async updatePcaControlAction(id: string, action: Partial<InsertPcaControlAction>, companyId: string): Promise<PcaControlAction | undefined> {
    const [updated] = await db.update(schema.pcaControlActions).set({ ...action, updatedAt: new Date() }).where(and(eq(schema.pcaControlActions.id, id), eq(schema.pcaControlActions.companyId, companyId))).returning();
    return updated;
  }

  async deletePcaControlAction(id: string, companyId: string): Promise<void> {
    await db.delete(schema.pcaControlActions).where(and(eq(schema.pcaControlActions.id, id), eq(schema.pcaControlActions.companyId, companyId)));
  }

  // PCA Programs methods
  async getPcaPrograms(companyId: string): Promise<PcaProgram[]> {
    return await db.select().from(schema.pcaPrograms).where(eq(schema.pcaPrograms.companyId, companyId)).orderBy(desc(schema.pcaPrograms.year));
  }

  async getPcaProgram(id: string, companyId: string): Promise<PcaProgram | undefined> {
    const [program] = await db.select().from(schema.pcaPrograms).where(and(eq(schema.pcaPrograms.id, id), eq(schema.pcaPrograms.companyId, companyId)));
    return program;
  }

  async getPcaProgramByYear(year: number, companyId: string): Promise<PcaProgram | undefined> {
    const [program] = await db.select().from(schema.pcaPrograms).where(and(eq(schema.pcaPrograms.year, year), eq(schema.pcaPrograms.companyId, companyId)));
    return program;
  }

  async createPcaProgram(program: InsertPcaProgram, companyId: string): Promise<PcaProgram> {
    const [created] = await db.insert(schema.pcaPrograms).values({ ...program, companyId }).returning();
    return created;
  }

  async updatePcaProgram(id: string, program: Partial<InsertPcaProgram>, companyId: string): Promise<PcaProgram | undefined> {
    const [updated] = await db.update(schema.pcaPrograms).set({ ...program, updatedAt: new Date() }).where(and(eq(schema.pcaPrograms.id, id), eq(schema.pcaPrograms.companyId, companyId))).returning();
    return updated;
  }

  // ============================================================================
  // DOCUMENT ACKNOWLEDGMENTS (Acuse de Recibo) - SST-2026-0019
  // ============================================================================

  // Document Worker Assignments methods
  async getDocumentWorkerAssignments(companyId: string): Promise<DocumentWorkerAssignment[]> {
    return await db.select().from(schema.documentWorkerAssignments).where(eq(schema.documentWorkerAssignments.companyId, companyId)).orderBy(desc(schema.documentWorkerAssignments.assignedAt));
  }

  async getDocumentWorkerAssignmentsByWorker(workerId: string, companyId: string): Promise<DocumentWorkerAssignment[]> {
    return await db.select().from(schema.documentWorkerAssignments).where(and(eq(schema.documentWorkerAssignments.workerId, workerId), eq(schema.documentWorkerAssignments.companyId, companyId))).orderBy(desc(schema.documentWorkerAssignments.assignedAt));
  }

  async getDocumentWorkerAssignmentsByDocument(documentId: string, companyId: string): Promise<DocumentWorkerAssignment[]> {
    return await db.select().from(schema.documentWorkerAssignments).where(and(eq(schema.documentWorkerAssignments.documentId, documentId), eq(schema.documentWorkerAssignments.companyId, companyId))).orderBy(desc(schema.documentWorkerAssignments.assignedAt));
  }

  async createDocumentWorkerAssignment(assignment: InsertDocumentWorkerAssignment, companyId: string): Promise<DocumentWorkerAssignment> {
    const [created] = await db.insert(schema.documentWorkerAssignments).values({ ...assignment, companyId }).returning();
    return created;
  }

  async deleteDocumentWorkerAssignment(id: string, companyId: string): Promise<void> {
    await db.delete(schema.documentWorkerAssignments).where(and(eq(schema.documentWorkerAssignments.id, id), eq(schema.documentWorkerAssignments.companyId, companyId)));
  }

  // Document Acknowledgments methods
  async getDocumentAcknowledgments(companyId: string): Promise<DocumentAcknowledgment[]> {
    return await db.select().from(schema.documentAcknowledgments).where(eq(schema.documentAcknowledgments.companyId, companyId)).orderBy(desc(schema.documentAcknowledgments.acknowledgedAt));
  }

  async getDocumentAcknowledgmentsByDocument(documentId: string, companyId: string): Promise<DocumentAcknowledgment[]> {
    return await db.select().from(schema.documentAcknowledgments).where(and(eq(schema.documentAcknowledgments.documentId, documentId), eq(schema.documentAcknowledgments.companyId, companyId))).orderBy(desc(schema.documentAcknowledgments.acknowledgedAt));
  }

  async getDocumentAcknowledgmentsByWorker(workerId: string, companyId: string): Promise<DocumentAcknowledgment[]> {
    return await db.select().from(schema.documentAcknowledgments).where(and(eq(schema.documentAcknowledgments.workerId, workerId), eq(schema.documentAcknowledgments.companyId, companyId))).orderBy(desc(schema.documentAcknowledgments.acknowledgedAt));
  }

  async getDocumentAcknowledgment(documentId: string, workerId: string, companyId: string): Promise<DocumentAcknowledgment | undefined> {
    const [ack] = await db.select().from(schema.documentAcknowledgments).where(and(eq(schema.documentAcknowledgments.documentId, documentId), eq(schema.documentAcknowledgments.workerId, workerId), eq(schema.documentAcknowledgments.companyId, companyId)));
    return ack;
  }

  async createDocumentAcknowledgment(acknowledgment: InsertDocumentAcknowledgment, companyId: string): Promise<DocumentAcknowledgment> {
    const [created] = await db.insert(schema.documentAcknowledgments).values({ ...acknowledgment, companyId }).returning();
    return created;
  }

  async getDocumentAcknowledgmentStats(documentId: string, companyId: string): Promise<{ totalAssigned: number; totalAcknowledged: number }> {
    const [assignedCount] = await db.select({ count: count() }).from(schema.documentWorkerAssignments).where(and(eq(schema.documentWorkerAssignments.documentId, documentId), eq(schema.documentWorkerAssignments.companyId, companyId)));
    const [acknowledgedCount] = await db.select({ count: count() }).from(schema.documentAcknowledgments).where(and(eq(schema.documentAcknowledgments.documentId, documentId), eq(schema.documentAcknowledgments.companyId, companyId)));
    return { totalAssigned: assignedCount?.count || 0, totalAcknowledged: acknowledgedCount?.count || 0 };
  }

  // ============================================================================
  // COMPANY EXTRA SEATS (Usuarios Adicionales de Pago)
  // ============================================================================

  async getCompanyExtraSeats(companyId: string): Promise<CompanyExtraSeats[]> {
    return await db.select().from(schema.companyExtraSeats)
      .where(and(
        eq(schema.companyExtraSeats.companyId, companyId),
        eq(schema.companyExtraSeats.status, 'active')
      ))
      .orderBy(schema.companyExtraSeats.role);
  }

  async getCompanyExtraSeatsByRole(companyId: string, role: string): Promise<CompanyExtraSeats | undefined> {
    const [seat] = await db.select().from(schema.companyExtraSeats)
      .where(and(
        eq(schema.companyExtraSeats.companyId, companyId),
        eq(schema.companyExtraSeats.role, role as any),
        eq(schema.companyExtraSeats.status, 'active')
      ));
    return seat;
  }

  async createCompanyExtraSeat(data: InsertCompanyExtraSeats): Promise<CompanyExtraSeats> {
    const [created] = await db.insert(schema.companyExtraSeats).values(data).returning();
    return created;
  }

  async updateCompanyExtraSeat(id: string, data: Partial<InsertCompanyExtraSeats>): Promise<CompanyExtraSeats | undefined> {
    const [updated] = await db.update(schema.companyExtraSeats)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.companyExtraSeats.id, id))
      .returning();
    return updated;
  }

  async incrementCompanyExtraSeat(companyId: string, role: string): Promise<CompanyExtraSeats> {
    const existingSeat = await this.getCompanyExtraSeatsByRole(companyId, role);
    
    if (existingSeat) {
      const [updated] = await db.update(schema.companyExtraSeats)
        .set({ extraSeats: existingSeat.extraSeats + 1, updatedAt: new Date() })
        .where(eq(schema.companyExtraSeats.id, existingSeat.id))
        .returning();
      return updated;
    } else {
      return await this.createCompanyExtraSeat({
        companyId,
        role: role as any,
        extraSeats: 1,
        pricePerSeatCop: 10000,
        status: 'active'
      });
    }
  }

  // ============================================================================
  // INFRASTRUCTURE - Health Check (Bloque 2)
  // ============================================================================

  /**
   * Health check method for database connectivity
   * Used by /health endpoint for uptime monitoring
   * @returns Promise<boolean> - true if database is accessible, false otherwise
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Simple query to verify database connectivity
      // Using a lightweight table check (companies table exists in every deployment)
      const result = await db.select().from(schema.companies).limit(1);
      return true;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // ============================================================================
  // TRAZABILIDAD OBJETIVOS-ESTÁNDARES SST
  // Vinculación entre Objetivos SST (Decreto 1072/2015) y Estándares (Resolución 0312/2019)
  // Principio Add-Only: Solo nuevos métodos, sin modificar existentes
  // ============================================================================

  /**
   * Get all linkages between objectives and standards for a company
   */
  async getObjetivosEstandaresVinculacion(companyId: string): Promise<schema.ObjetivoEstandarVinculacion[]> {
    return await db.select()
      .from(schema.objetivosEstandaresVinculacion)
      .where(eq(schema.objetivosEstandaresVinculacion.companyId, companyId));
  }

  /**
   * Get linkages for a specific objective
   */
  async getVinculacionesByObjetivo(objetivoId: string): Promise<schema.ObjetivoEstandarVinculacion[]> {
    return await db.select()
      .from(schema.objetivosEstandaresVinculacion)
      .where(eq(schema.objetivosEstandaresVinculacion.objetivoId, objetivoId));
  }

  /**
   * Get linkages for a specific standard
   */
  async getVinculacionesByEstandar(estandarId: string): Promise<schema.ObjetivoEstandarVinculacion[]> {
    return await db.select()
      .from(schema.objetivosEstandaresVinculacion)
      .where(eq(schema.objetivosEstandaresVinculacion.estandarId, estandarId));
  }

  /**
   * Create a new linkage between objective and standard
   */
  async createObjetivoEstandarVinculacion(
    data: schema.InsertObjetivoEstandarVinculacion & { companyId: string }
  ): Promise<schema.ObjetivoEstandarVinculacion> {
    const [created] = await db.insert(schema.objetivosEstandaresVinculacion)
      .values(data)
      .returning();
    return created;
  }

  /**
   * Update linkage weight
   */
  async updateObjetivoEstandarVinculacion(
    id: string, 
    data: { pesoRelativo?: number }
  ): Promise<schema.ObjetivoEstandarVinculacion | undefined> {
    const [updated] = await db.update(schema.objetivosEstandaresVinculacion)
      .set(data)
      .where(eq(schema.objetivosEstandaresVinculacion.id, id))
      .returning();
    return updated;
  }

  /**
   * Delete a linkage
   */
  async deleteObjetivoEstandarVinculacion(id: string): Promise<boolean> {
    const result = await db.delete(schema.objetivosEstandaresVinculacion)
      .where(eq(schema.objetivosEstandaresVinculacion.id, id));
    return true;
  }

  /**
   * Calculate objective progress based on linked standards compliance
   * Uses weighted average if standards have different weights
   * Returns percentage (0-100)
   */
  async calcularAvanceObjetivoDesdeEstandares(
    objetivoId: string,
    evaluacionId: string
  ): Promise<number> {
    // Get all standards linked to this objective
    const vinculaciones = await this.getVinculacionesByObjetivo(objetivoId);
    
    if (vinculaciones.length === 0) {
      return 0; // No linked standards, return 0
    }

    // Get compliance status for each linked standard in the given evaluation
    let totalPeso = 0;
    let sumaCumplimiento = 0;

    for (const vinculacion of vinculaciones) {
      // Get the response for this standard in the evaluation
      const respuestas = await db.select()
        .from(schema.respuestasEstandares)
        .where(and(
          eq(schema.respuestasEstandares.evaluacionId, evaluacionId),
          eq(schema.respuestasEstandares.estandarId, vinculacion.estandarId)
        ));

      if (respuestas.length > 0) {
        const respuesta = respuestas[0];
        const peso = vinculacion.pesoRelativo || 1;
        totalPeso += peso;
        
        // cumple is 0 or 1, multiply by 100 and by weight
        sumaCumplimiento += (respuesta.cumple || 0) * 100 * peso;
      }
    }

    if (totalPeso === 0) {
      return 0;
    }

    // Calculate weighted average
    return Math.round(sumaCumplimiento / totalPeso);
  }

  /**
   * Get linked standards with their compliance status for an objective
   * Used to display traceability in the UI
   */
  async getVinculacionesConCumplimiento(
    objetivoId: string,
    evaluacionId: string
  ): Promise<Array<{
    vinculacion: schema.ObjetivoEstandarVinculacion;
    estandar: schema.EstandarSst | null;
    cumple: number | null;
  }>> {
    const vinculaciones = await this.getVinculacionesByObjetivo(objetivoId);
    const result = [];

    for (const vinculacion of vinculaciones) {
      // Get the standard details
      const estandares = await db.select()
        .from(schema.estandaresSst)
        .where(eq(schema.estandaresSst.id, vinculacion.estandarId));
      
      // Get compliance status
      const respuestas = await db.select()
        .from(schema.respuestasEstandares)
        .where(and(
          eq(schema.respuestasEstandares.evaluacionId, evaluacionId),
          eq(schema.respuestasEstandares.estandarId, vinculacion.estandarId)
        ));

      result.push({
        vinculacion,
        estandar: estandares[0] || null,
        cumple: respuestas.length > 0 ? respuestas[0].cumple : null
      });
    }

    return result;
  }

  // ============================================================================
  // PESV - Comité de Seguridad Vial (Paso 2 - Res. 40595/2022)
  // ============================================================================

  async getComiteIntegrantesPesv(companyId: string): Promise<schema.ComiteIntegrantePesv[]> {
    return await db.select()
      .from(schema.comiteIntegrantesPesv)
      .where(eq(schema.comiteIntegrantesPesv.companyId, companyId))
      .orderBy(desc(schema.comiteIntegrantesPesv.createdAt));
  }

  async getComiteIntegrantePesv(id: string, companyId: string): Promise<schema.ComiteIntegrantePesv | undefined> {
    const [integrante] = await db.select()
      .from(schema.comiteIntegrantesPesv)
      .where(and(
        eq(schema.comiteIntegrantesPesv.id, id),
        eq(schema.comiteIntegrantesPesv.companyId, companyId)
      ));
    return integrante;
  }

  async createComiteIntegrantePesv(integrante: schema.InsertComiteIntegrantePesv, companyId: string): Promise<schema.ComiteIntegrantePesv> {
    const [created] = await db.insert(schema.comiteIntegrantesPesv)
      .values({ ...integrante, companyId })
      .returning();
    return created;
  }

  async updateComiteIntegrantePesv(id: string, integrante: Partial<schema.InsertComiteIntegrantePesv>, companyId: string): Promise<schema.ComiteIntegrantePesv | undefined> {
    const [updated] = await db.update(schema.comiteIntegrantesPesv)
      .set({ ...integrante, updatedAt: new Date() })
      .where(and(
        eq(schema.comiteIntegrantesPesv.id, id),
        eq(schema.comiteIntegrantesPesv.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteComiteIntegrantePesv(id: string, companyId: string): Promise<void> {
    await db.delete(schema.comiteIntegrantesPesv)
      .where(and(
        eq(schema.comiteIntegrantesPesv.id, id),
        eq(schema.comiteIntegrantesPesv.companyId, companyId)
      ));
  }

  // PESV - Actas Comité Seguridad Vial
  async getActasComitePesv(companyId: string): Promise<schema.ActaComitePesv[]> {
    return await db.select()
      .from(schema.actasComitePesv)
      .where(eq(schema.actasComitePesv.companyId, companyId))
      .orderBy(desc(schema.actasComitePesv.fechaReunion));
  }

  async getActaComitePesv(id: string, companyId: string): Promise<schema.ActaComitePesv | undefined> {
    const [acta] = await db.select()
      .from(schema.actasComitePesv)
      .where(and(
        eq(schema.actasComitePesv.id, id),
        eq(schema.actasComitePesv.companyId, companyId)
      ));
    return acta;
  }

  async createActaComitePesv(acta: schema.InsertActaComitePesv, companyId: string): Promise<schema.ActaComitePesv> {
    const [created] = await db.insert(schema.actasComitePesv)
      .values({ ...acta, companyId })
      .returning();
    return created;
  }

  async updateActaComitePesv(id: string, acta: Partial<schema.InsertActaComitePesv>, companyId: string): Promise<schema.ActaComitePesv | undefined> {
    const [updated] = await db.update(schema.actasComitePesv)
      .set({ ...acta, updatedAt: new Date() })
      .where(and(
        eq(schema.actasComitePesv.id, id),
        eq(schema.actasComitePesv.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async deleteActaComitePesv(id: string, companyId: string): Promise<void> {
    await db.delete(schema.actasComitePesv)
      .where(and(
        eq(schema.actasComitePesv.id, id),
        eq(schema.actasComitePesv.companyId, companyId)
      ));
  }

  // ==================== PESV - Vehicle Maintenances (Res. 40595/2022 - H06) ====================

  async getVehicleMaintenances(companyId: string): Promise<schema.VehicleMaintenance[]> {
    return await db.select()
      .from(schema.vehicleMaintenances)
      .where(eq(schema.vehicleMaintenances.companyId, companyId))
      .orderBy(desc(schema.vehicleMaintenances.createdAt));
  }

  async getVehicleMaintenance(id: string): Promise<schema.VehicleMaintenance | undefined> {
    const [maintenance] = await db.select()
      .from(schema.vehicleMaintenances)
      .where(eq(schema.vehicleMaintenances.id, id));
    return maintenance;
  }

  async createVehicleMaintenance(data: schema.InsertVehicleMaintenance, companyId: string): Promise<schema.VehicleMaintenance> {
    const [created] = await db.insert(schema.vehicleMaintenances)
      .values({ ...data, companyId })
      .returning();
    return created;
  }

  async updateVehicleMaintenance(id: string, data: Partial<schema.InsertVehicleMaintenance>): Promise<schema.VehicleMaintenance> {
    const [updated] = await db.update(schema.vehicleMaintenances)
      .set(data)
      .where(eq(schema.vehicleMaintenances.id, id))
      .returning();
    return updated;
  }

  async deleteVehicleMaintenance(id: string): Promise<void> {
    await db.delete(schema.vehicleMaintenances)
      .where(eq(schema.vehicleMaintenances.id, id));
  }

  // ==================== PESV - Vehicle GPS Tracking (Res. 40595/2022 - H07) ====================

  async getVehicleGpsTrackings(companyId: string): Promise<schema.VehicleGpsTracking[]> {
    return await db.select()
      .from(schema.vehicleGpsTracking)
      .where(eq(schema.vehicleGpsTracking.companyId, companyId))
      .orderBy(desc(schema.vehicleGpsTracking.createdAt));
  }

  async getVehicleGpsTracking(id: string): Promise<schema.VehicleGpsTracking | undefined> {
    const [tracking] = await db.select()
      .from(schema.vehicleGpsTracking)
      .where(eq(schema.vehicleGpsTracking.id, id));
    return tracking;
  }

  async createVehicleGpsTracking(data: schema.InsertVehicleGpsTracking, companyId: string): Promise<schema.VehicleGpsTracking> {
    const [created] = await db.insert(schema.vehicleGpsTracking)
      .values({ ...data, companyId })
      .returning();
    return created;
  }

  async deleteVehicleGpsTracking(id: string): Promise<void> {
    await db.delete(schema.vehicleGpsTracking)
      .where(eq(schema.vehicleGpsTracking.id, id));
  }

  // ==================== PESV - Safe Routes (Res. 40595/2022 - H08) ====================

  async getSafeRoutes(companyId: string): Promise<schema.SafeRoute[]> {
    return await db.select()
      .from(schema.safeRoutes)
      .where(eq(schema.safeRoutes.companyId, companyId))
      .orderBy(desc(schema.safeRoutes.createdAt));
  }

  async getSafeRoute(id: string): Promise<schema.SafeRoute | undefined> {
    const [route] = await db.select()
      .from(schema.safeRoutes)
      .where(eq(schema.safeRoutes.id, id));
    return route;
  }

  async createSafeRoute(data: schema.InsertSafeRoute, companyId: string): Promise<schema.SafeRoute> {
    const [created] = await db.insert(schema.safeRoutes)
      .values({ ...data, companyId })
      .returning();
    return created;
  }

  async updateSafeRoute(id: string, data: Partial<schema.InsertSafeRoute>): Promise<schema.SafeRoute> {
    const [updated] = await db.update(schema.safeRoutes)
      .set(data)
      .where(eq(schema.safeRoutes.id, id))
      .returning();
    return updated;
  }

  async deleteSafeRoute(id: string): Promise<void> {
    await db.delete(schema.safeRoutes)
      .where(eq(schema.safeRoutes.id, id));
  }
}

export const storage = new DbStorage();
