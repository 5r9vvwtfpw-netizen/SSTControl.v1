/**
 * SST Colombia - Sistema de Gestión de Seguridad y Salud en el Trabajo
 * 
 * Copyright (c) 2024-2026. Todos los derechos reservados.
 * 
 * Este software es propiedad confidencial y está protegido por las leyes de
 * propiedad intelectual de Colombia (Ley 23 de 1982, Decisión Andina 351).
 * 
 * Queda estrictamente prohibida su reproducción, distribución, modificación
 * o ingeniería inversa sin autorización expresa por escrito del propietario.
 * 
 * CONFIDENCIAL - NO DISTRIBUIR
 */

import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, bigint, date, pgEnum, jsonb, boolean, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Companies table - Multi-tenant support
export const riskLevelEnum = pgEnum("risk_level", ["I", "II", "III", "IV", "V"]);
export type RiskLevel = typeof riskLevelEnum.enumValues[number];
export const chapterEnum = pgEnum("chapter", ["1", "2", "3"]);

// User roles enum
export const userRoleEnum = pgEnum("user_role", [
  "superadmin",         // Rol INTERNO - Proveedor SaaS (acceso global, facturación, todas las empresas)
  "soporte",            // Rol INTERNO - Equipo de soporte (solo gestión de tickets, sin acceso a datos de empresas)
  "superusuario",       // Rol CLIENTE - Acceso completo a SU empresa únicamente
  "admin",              // Gerente General - Acceso completo
  "responsable_sst",    // Responsable SST - Dueño de suscripción, gestiona su empresa
  "coordinador_salud",  // Coordinador de Salud Ocupacional - Datos médicos sensibles (Ley 1581/2012)
  "lso",                // Licenciado en Salud Ocupacional - Revisa y firma documentos SST
  "coordinador_sst",    // Coordinador SST - Gestión SST, PESV, auditorías
  "coordinador_rrhh",   // Coordinador RRHH - Gestión trabajadores, capacitaciones
  "jefe_personal",      // Jefe Personal - Consulta y reportes
  "supervisor",         // Supervisor - Inspecciones y medidas en su área
  "vigia_sst",          // Vigía SST - Para empresas <10 trabajadores (Decreto 1072/2015, Res. 2013/1986)
  "auditor_interno",    // Auditor Interno SG-SST - Auditorías ISO 45001, Decreto 1072/2015
  "trabajador"          // Trabajador - Solo su información
]);

// Tipo de inducción enum
export const inductionTypeEnum = pgEnum("induction_type", ["induccion", "reinduccion"]);

// Tipo de profesión SST enum (Resolución 0312/2019, Decreto 1072/2015)
export const sstProfessionTypeEnum = pgEnum("sst_profession_type", [
  "medico_ocupacional",       // Médico con especialización en Salud Ocupacional/Medicina del Trabajo
  "profesional_sst",          // Profesional con posgrado en SST
  "tecnologo_sst",            // Tecnólogo en SST
  "tecnico_sst",              // Técnico en SST
  "fisioterapeuta",           // Fisioterapeuta (SVE osteomuscular)
  "psicologo_sst",            // Psicólogo especialista en SST (SVE psicosocial)
  "fonoaudiologo",            // Fonoaudiólogo (SVE auditivo)
  "ingeniero_sst",            // Ingeniero con especialización en SST
  "enfermero_sst",            // Enfermero con formación en SST
  "otro"                      // Otro profesional con licencia SST
]);

// Estado de licencia SST
export const sstLicenseStatusEnum = pgEnum("sst_license_status", [
  "vigente",                  // Licencia activa y válida
  "vencida",                  // Licencia expirada
  "pendiente_verificacion",   // Pendiente de verificar
  "suspendida"                // Licencia suspendida
]);

export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nit: text("nit").notNull().unique(),
  city: text("city"), // Ciudad de Colombia para documentos oficiales
  ciiuCode: text("ciiu_code"), // Código CIIU (Clasificación Industrial Internacional Uniforme) de actividad económica
  address: text("address"),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  logoUrl: text("logo_url"),
  legalRepSignatureUrl: text("legal_rep_signature_url"), // Firma digital del representante legal
  legalRepName: text("legal_rep_name"), // Nombre del representante legal
  legalRepId: text("legal_rep_id"), // Cédula del representante legal
  legalRepPosition: text("legal_rep_position"), // Cargo del representante legal
  numberOfWorkers: integer("number_of_workers").notNull().default(1),
  riskLevel: riskLevelEnum("risk_level").notNull().default("I"),
  calculatedChapter: chapterEnum("calculated_chapter").notNull().default("1"),
  // Configuración de afiliaciones por defecto (SST-2025-0038)
  epsNombreEmpresa: text("eps_nombre_empresa"), // EPS por defecto para todos los trabajadores
  arlNombreEmpresa: text("arl_nombre_empresa"), // ARL por defecto para todos los trabajadores
  afpNombreEmpresa: text("afp_nombre_empresa"), // AFP por defecto para todos los trabajadores
  ccfNombreEmpresa: text("ccf_nombre_empresa"), // CCF por defecto para todos los trabajadores
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Users table for authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default("trabajador"),
  fullName: text("full_name"),
  email: text("email"),
  department: text("department"),
  companyId: varchar("company_id").references(() => companies.id),
  workerId: varchar("worker_id"), // Reference to worker if role is trabajador
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  // Support staff specialties (for soporte role)
  supportSpecialties: text("support_specialties").array(), // ["soporte_tecnico", "facturacion", etc.]
  // Email verification fields
  emailVerificationToken: text("email_verification_token"),
  emailVerificationExpires: timestamp("email_verification_expires"),
  emailVerifiedAt: timestamp("email_verified_at"),
  // Password reset fields
  passwordResetToken: text("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  // Subscription and trial fields
  selectedPlan: varchar("selected_plan"),
  trialEndsAt: timestamp("trial_ends_at"),
  // Credenciales SST (Resolución 0312/2019, Decreto 1072/2015)
  sstProfessionType: sstProfessionTypeEnum("sst_profession_type"), // Tipo de profesión SST
  sstLicenseNumber: text("sst_license_number"), // Número de licencia SST
  sstLicenseIssuer: text("sst_license_issuer"), // Entidad que expide (Secretaría de Salud, etc.)
  sstLicenseIssuedAt: date("sst_license_issued_at"), // Fecha de expedición
  sstLicenseExpiresAt: date("sst_license_expires_at"), // Fecha de vencimiento
  sstLicenseStatus: sstLicenseStatusEnum("sst_license_status"), // Estado de la licencia
  sstSignatureUrl: text("sst_signature_url"), // Firma digital del licenciado (imagen)
  sstPhone: text("sst_phone"), // Teléfono de contacto del licenciado
});

// Tabla de asignación de Licenciados a Empresas (relación muchos a muchos)
export const licensedProfessionalAssignments = pgTable("licensed_professional_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id), // Licenciado (usuario con rol lso)
  companyId: varchar("company_id").notNull().references(() => companies.id),
  assignedAt: timestamp("assigned_at").notNull().default(sql`now()`),
  assignedBy: varchar("assigned_by").references(() => users.id), // Quien hizo la asignación
  isActive: boolean("is_active").notNull().default(true),
});

export const insertLicensedProfessionalAssignmentSchema = createInsertSchema(licensedProfessionalAssignments).omit({
  id: true,
  assignedAt: true,
});
export type InsertLicensedProfessionalAssignment = z.infer<typeof insertLicensedProfessionalAssignmentSchema>;
export type LicensedProfessionalAssignment = typeof licensedProfessionalAssignments.$inferSelect;

// Consent Records table - Habeas Data (Ley 1581/2012)
export const consentTypeEnum = pgEnum("consent_type", [
  "habeas_data_general",     // Consentimiento general de protección de datos
  "datos_sensibles_salud",   // Datos sensibles de salud ocupacional
  "datos_biometricos",       // Datos biométricos (huella, facial)
  "uso_imagen",              // Uso de imagen (fotografías, videos)
  "transferencia_internacional", // Transferencia internacional de datos
  "marketing",               // Marketing y comunicaciones comerciales
]);

export const consentStatusEnum = pgEnum("consent_status", [
  "otorgado",    // Consent granted
  "revocado",    // Consent revoked
  "vencido",     // Consent expired
]);

export const consentChannelEnum = pgEnum("consent_channel", [
  "web",         // Consentimiento otorgado vía plataforma web
  "paper",       // Consentimiento físico (formulario firmado)
  "email",       // Consentimiento por correo electrónico
  "verbal",      // Consentimiento verbal (con grabación)
  "mobile",      // Consentimiento vía aplicación móvil
]);

export const consentRecords = pgTable("consent_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  workerId: varchar("worker_id").notNull().references(() => workers.id), // FK enforced
  workerName: text("worker_name").notNull(), // Denormalized for audit trail
  workerEmail: text("worker_email"),
  workerIdentification: text("worker_identification").notNull(), // CC, CE, Pasaporte
  
  // Consent details
  consentType: consentTypeEnum("consent_type").notNull(),
  status: consentStatusEnum("status").notNull().default("otorgado"),
  channel: consentChannelEnum("channel").notNull().default("web"), // How consent was captured
  
  // Policy versioning (CRITICAL for legal evidencing)
  policyVersion: text("policy_version").notNull(), // e.g., "1.0", "2.1" - version of privacy policy accepted
  policyDocumentUrl: text("policy_document_url"), // URL to exact policy version accepted
  consentText: text("consent_text"), // Optional: exact consent text presented (for audit)
  
  // Timestamps
  grantedAt: timestamp("granted_at").notNull().default(sql`now()`),
  revokedAt: timestamp("revoked_at"),
  expiresAt: timestamp("expires_at"), // Optional expiration date
  
  // Purpose and legal basis
  purpose: text("purpose").notNull(), // Finalidad específica del tratamiento
  legalBasis: text("legal_basis"), // Base legal: consentimiento, contrato, obligación legal, etc.
  
  // Revocation details
  revocationReason: text("revocation_reason"), // Why consent was revoked (if applicable)
  revokedBy: varchar("revoked_by").references(() => users.id), // User who processed revocation
  
  // Audit trail - Who recorded/updated
  recordedBy: varchar("recorded_by").references(() => users.id), // User who recorded consent
  updatedBy: varchar("updated_by").references(() => users.id), // User who last updated
  
  // Technical metadata
  ipAddress: text("ip_address"), // IP desde donde se otorgó el consentimiento
  userAgent: text("user_agent"), // Navegador/dispositivo usado
  evidenceUrl: text("evidence_url"), // URL de evidencia (PDF firmado, escaneo, etc.)
  notes: text("notes"), // Notas adicionales
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// ARCO Requests table - Derechos de Acceso, Rectificación, Cancelación, Oposición
export const arcoRequestTypeEnum = pgEnum("arco_request_type", [
  "acceso",         // Right to access personal data
  "rectificacion",  // Right to rectify inaccurate data
  "cancelacion",    // Right to delete/anonymize data
  "oposicion",      // Right to object to processing
  "portabilidad",   // Right to data portability (GDPR)
  "limitacion",     // Right to restrict processing (GDPR)
]);

export const arcoRequestStatusEnum = pgEnum("arco_request_status", [
  "pendiente",     // Pending review
  "en_proceso",    // Being processed
  "completada",    // Request fulfilled
  "rechazada",     // Request denied
  "parcialmente_completada", // Partially fulfilled
]);

export const arcoRequests = pgTable("arco_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  requestType: arcoRequestTypeEnum("request_type").notNull(),
  status: arcoRequestStatusEnum("status").notNull().default("pendiente"),
  
  // Linkage to internal records (optional - requester may not be in system)
  workerId: varchar("worker_id").references(() => workers.id), // If requester is a worker
  userId: varchar("user_id").references(() => users.id), // If requester is a system user
  
  // Requester information
  requesterName: text("requester_name").notNull(),
  requesterEmail: text("requester_email").notNull(),
  requesterPhone: text("requester_phone"),
  requesterIdentification: text("requester_identification").notNull(), // CC, CE, Pasaporte
  
  // If requester is not the data subject (representative)
  isRepresentative: integer("is_representative").notNull().default(0), // Boolean: 0=titular, 1=representante
  dataSubjectName: text("data_subject_name"), // If representative, name of data subject
  dataSubjectIdentification: text("data_subject_identification"), // If representative
  representationProofUrl: text("representation_proof_url"), // Power of attorney document
  representativeVerified: integer("representative_verified"), // 1=verified, 0=not verified, null=pending
  representativeVerifiedBy: varchar("representative_verified_by").references(() => users.id),
  representativeVerifiedAt: timestamp("representative_verified_at"),
  
  // Request details
  requestDescription: text("request_description").notNull(), // What the requester is asking for
  specificDataRequested: text("specific_data_requested"), // Specific fields or categories
  justification: text("justification"), // Reason for the request (especially for cancelación/oposición)
  
  // Assignment and escalation lifecycle
  assignedTo: varchar("assigned_to").references(() => users.id), // Current assignee
  assignedAt: timestamp("assigned_at"),
  previousAssignees: text("previous_assignees").array().default(sql`'{}'`), // History of assignee user IDs
  escalatedTo: varchar("escalated_to").references(() => users.id), // Escalation to supervisor/DPO
  escalatedAt: timestamp("escalated_at"),
  escalationReason: text("escalation_reason"),
  
  // Intake and resolution tracking
  intakeRecordedBy: varchar("intake_recorded_by").references(() => users.id), // User who registered request
  
  // Response and resolution
  responseDate: timestamp("response_date"), // Date response was sent
  responseDescription: text("response_description"), // How the request was handled
  responseProvidedBy: varchar("response_provided_by").references(() => users.id), // User who handled it
  rejectionReason: text("rejection_reason"), // If status=rechazada, why?
  
  // Partial completion details
  partialCompletionDetails: text("partial_completion_details"), // What was completed, what wasn't
  
  // Attachments and evidence
  requestAttachmentsUrls: text("request_attachments_urls").array().default(sql`'{}'`),
  responseAttachmentsUrls: text("response_attachments_urls").array().default(sql`'{}'`),
  
  // Compliance tracking - Legal deadline auto-calculated
  submittedAt: timestamp("submitted_at").notNull().default(sql`now()`),
  legalDeadline: timestamp("legal_deadline").notNull().default(sql`now() + interval '10 days'`), // 10 días hábiles automático
  reminderSentAt: timestamp("reminder_sent_at"), // When reminder email was sent
  completedAt: timestamp("completed_at"), // When status changed to completada
  
  // Audit trail
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Workers table
export const contractTypeEnum = pgEnum("contract_type", ["indefinido", "fijo", "temporal", "obra-labor", "aprendizaje"]);
export const workerStatusEnum = pgEnum("worker_status", ["activo", "inactivo", "retirado"]);
// Enums for sociodemographic profile (Standard 3.1.1 - Resolución 0312/2019)
export const genderEnum = pgEnum("gender", ["masculino", "femenino", "otro", "prefiero_no_decir"]);
export const educationLevelEnum = pgEnum("education_level", ["ninguno", "primaria", "secundaria", "tecnico", "tecnologo", "profesional", "especializacion", "maestria", "doctorado"]);
export const civilStatusEnum = pgEnum("civil_status", ["soltero", "casado", "union_libre", "divorciado", "viudo", "separado"]);

export const workers = pgTable("workers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  identificationNumber: text("identification_number").notNull().unique(), // Cédula de Ciudadanía, Pasaporte o Cédula de Extranjería - acepta números y letras (globally unique)
  name: text("name").notNull(),
  email: text("email").unique(), // Email para notificaciones de exámenes y capacitaciones (globally unique to prevent duplicates)
  position: text("position").notNull(),
  department: text("department").notNull(),
  contractType: contractTypeEnum("contract_type").notNull(),
  contractNumber: text("contract_number").notNull().unique(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  status: workerStatusEnum("status").notNull().default("activo"),
  // Perfil de cargo asignado (vinculación directa con job_profiles)
  jobProfileId: varchar("job_profile_id"), // Referencia al perfil de cargo (validación en aplicación)
  // Datos sociodemográficos (Estándar 3.1.1 - Resolución 0312/2019)
  gender: genderEnum("gender"), // Género del trabajador
  birthDate: date("birth_date"), // Fecha de nacimiento para cálculo de edad
  educationLevel: educationLevelEnum("education_level"), // Nivel educativo
  civilStatus: civilStatusEnum("civil_status"), // Estado civil
  // Afiliaciones SSSS - pueden ser configuradas individualmente o heredar de la empresa
  epsNombre: text("eps_nombre"), // Entidad Promotora de Salud
  arlNombre: text("arl_nombre"), // Administradora de Riesgos Laborales
  afpNombre: text("afp_nombre"), // Administradora de Fondos de Pensiones
  ccfNombre: text("ccf_nombre"), // Caja de Compensación Familiar
  // Foto para carnet de trabajador
  photoUrl: text("photo_url"), // URL de la foto del trabajador en S3
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Health conditions table (Standard 3.1.1 - Resolución 0312/2019)
export const healthConditionTypeEnum = pgEnum("health_condition_type", ["cronica", "temporal", "discapacidad", "restriccion"]);
export const healthConditionStatusEnum = pgEnum("health_condition_status", ["activo", "en_seguimiento", "controlado", "cerrado"]);

export const healthConditions = pgTable("health_conditions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  workerId: varchar("worker_id").notNull().references(() => workers.id),
  conditionType: healthConditionTypeEnum("condition_type").notNull(),
  description: text("description").notNull(),
  diagnosisDate: date("diagnosis_date").notNull(),
  status: healthConditionStatusEnum("status").notNull().default("activo"),
  requiresFollowUp: integer("requires_follow_up").notNull().default(0),
  followUpDate: date("follow_up_date"),
  observations: text("observations"),
  registeredBy: varchar("registered_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Sociodemographic diagnosis cycle tracking table (Standard 3.1.1 - Resolución 0312/2019)
// Tracks when a sociodemographic diagnosis cycle was opened and closed
export const sociodemographicDiagnosisStatusEnum = pgEnum("sociodemographic_diagnosis_status", ["abierto", "cerrado"]);

export const sociodemographicDiagnosis = pgTable("sociodemographic_diagnosis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  year: integer("year").notNull(), // Año del diagnóstico
  status: sociodemographicDiagnosisStatusEnum("status").notNull().default("abierto"),
  openedAt: timestamp("opened_at").notNull().default(sql`now()`),
  closedAt: timestamp("closed_at"), // Fecha de cierre
  closedBy: varchar("closed_by").references(() => users.id), // Usuario que cerró el diagnóstico
  totalWorkers: integer("total_workers"), // Total de trabajadores al momento del cierre
  totalConditions: integer("total_conditions"), // Total de condiciones de salud al momento del cierre
  observations: text("observations"), // Observaciones del cierre
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Accidents table
export const severityEnum = pgEnum("severity", ["leve", "grave", "mortal"]);
export const accidentTypeEnum = pgEnum("accident_type", [
  // Caídas
  "caida_mismo_nivel",
  "caida_diferente_nivel",
  "caida_objetos",
  "caida", // Legacy
  
  // Golpes
  "golpe_objeto",
  "golpe_objeto_movil",
  "golpe_herramientas",
  "proyeccion_particulas",
  "golpe", // Legacy
  
  // Cortes
  "corte",
  "punzamiento",
  "amputacion",
  
  // Atrapamientos
  "atrapamiento",
  "aplastamiento",
  "atrapamiento_maquinaria",
  
  // Quemaduras
  "quemadura_termica",
  "quemadura_quimica",
  "quemadura_electrica",
  "quemadura_radiacion",
  "quemadura", // Legacy
  
  // Eléctricos
  "electrocucion",
  "choque_electrico",
  "arco_electrico",
  
  // Químicos/Biológicos
  "intoxicacion",
  "inhalacion_gases",
  "contacto_sustancias",
  "exposicion_biologica",
  "mordedura_picadura",
  
  // Esfuerzos físicos
  "sobreesfuerzo",
  "movimiento_repetitivo",
  "manipulacion_cargas",
  "postura_forzada",
  
  // Tránsito
  "accidente_transito",
  "accidente_vehiculo_trabajo",
  "atropellamiento",
  
  // Sector minero
  "derrumbe",
  "explosion",
  "incendio",
  "asfixia",
  "inmersion",
  
  // Espacios confinados
  "atmosfera_peligrosa",
  
  // Violencia
  "agresion_fisica",
  "asalto_robo",
  
  // Otros
  "exposicion_ruido",
  "exposicion_vibraciones",
  "exposicion_temperaturas",
  "radiacion_ionizante",
  "esfuerzo_visual",
  "estres_agudo",
  "otro"
]);
export const journeyTypeEnum = pgEnum("journey_type", ["ordinaria", "extraordinaria"]);
export const accidentClassificationEnum = pgEnum("accident_classification", ["normal", "in_itinere", "en_mision"]);

export const accidents = pgTable("accidents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  workerId: varchar("worker_id").notNull().references(() => workers.id),
  type: accidentTypeEnum("type").notNull(),
  customType: text("custom_type"), // For "otro" type
  description: text("description").notNull(),
  severity: severityEnum("severity").notNull(),
  date: date("date").notNull(),
  time: text("time").notNull(),
  location: text("location").notNull(),
  witnesses: text("witnesses"),
  actionsTaken: text("actions_taken"),
  bodyPartAffected: text("body_part_affected"),
  injuryNature: text("injury_nature"),
  medicalDiagnosis: text("medical_diagnosis"),
  ipsName: text("ips_name"),
  accidentMechanism: text("accident_mechanism"),
  causativeAgent: text("causative_agent"),
  journeyType: journeyTypeEnum("journey_type"),
  accidentClassification: accidentClassificationEnum("accident_classification"),
  wasHospitalized: integer("was_hospitalized").default(0),
  erReferral: integer("er_referral").default(0),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Trainings table
export const trainingStatusEnum = pgEnum("training_status", ["programada", "en-curso", "completada", "cancelada"]);

export const trainings = pgTable("trainings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  title: text("title").notNull(),
  description: text("description"),
  instructor: text("instructor"),
  date: date("date").notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
  location: text("location"),
  totalWorkers: integer("total_workers").notNull().default(0),
  validityMonths: integer("validity_months"), // Meses de vigencia para renovación (null = no requiere renovación)
  status: trainingStatusEnum("status").notNull().default("programada"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Training attendees (many-to-many)
export const trainingAttendees = pgTable("training_attendees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trainingId: varchar("training_id").notNull().references(() => trainings.id, { onDelete: "cascade" }),
  workerId: varchar("worker_id").notNull().references(() => workers.id, { onDelete: "cascade" }),
  attended: integer("attended").notNull().default(0), // 0 = not attended, 1 = attended
  confirmed: integer("confirmed").notNull().default(0), // 0 = no confirmado, 1 = confirmado
  confirmedAt: timestamp("confirmed_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Inspections table
export const inspectionStatusEnum = pgEnum("inspection_status", ["aprobada", "pendiente", "rechazada"]);

export const inspections = pgTable("inspections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  area: text("area").notNull(),
  inspector: text("inspector").notNull(),
  date: date("date").notNull(),
  findings: integer("findings").notNull().default(0),
  compliance: integer("compliance").notNull(), // Percentage 0-100
  observations: text("observations"),
  status: inspectionStatusEnum("status").notNull().default("pendiente"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Inspections-IPERC linkage table (HACER phase - operational control verification)
export const estadoControlInspeccionEnum = pgEnum("estado_control_inspeccion", [
  "conforme",       // Control implementado y funcionando correctamente
  "no-conforme",    // Control ausente o deficiente
  "observacion",    // Control presente pero requiere mejoras
]);

export const inspeccionesPeligrosVinculados = pgTable("inspecciones_peligros_vinculados", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  inspeccionId: varchar("inspeccion_id").notNull().references(() => inspections.id, { onDelete: "cascade" }),
  peligroId: varchar("peligro_id").notNull().references(() => peligrosIperc.id, { onDelete: "cascade" }),
  
  // Estado del control verificado en la inspección
  estadoControl: estadoControlInspeccionEnum("estado_control").notNull().default("conforme"),
  
  // Hallazgos específicos de la verificación
  hallazgos: text("hallazgos"), // Descripción de lo encontrado
  evidenciaFotografica: text("evidencia_fotografica"), // URL o path de foto (si aplica)
  
  // Trazabilidad
  verificadoPor: varchar("verificado_por").references(() => users.id), // Quién verificó este control
  fechaVerificacion: timestamp("fecha_verificacion").notNull().default(sql`now()`),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Preventive measures table
export const measureStatusEnum = pgEnum("measure_status", ["pendiente", "en-progreso", "completada", "vencida"]);

export const preventiveMeasures = pgTable("preventive_measures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  responsible: text("responsible").notNull(),
  dueDate: date("due_date").notNull(),
  status: measureStatusEnum("status").notNull().default("pendiente"),
  priority: text("priority").notNull(), // "alta", "media", "baja"
  relatedArea: text("related_area"),
  completedDate: date("completed_date"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Occupational diseases table
export const diseaseStatusEnum = pgEnum("disease_status", ["activo", "en-tratamiento", "recuperado", "incapacidad"]);

export const occupationalDiseases = pgTable("occupational_diseases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  workerId: varchar("worker_id").notNull().references(() => workers.id),
  diseaseName: text("disease_name").notNull(),
  diagnosis: text("diagnosis").notNull(),
  diagnosisDate: date("diagnosis_date").notNull(),
  exposureFactor: text("exposure_factor"),
  status: diseaseStatusEnum("status").notNull().default("activo"),
  treatment: text("treatment"),
  followUpDate: date("follow_up_date"),
  symptoms: text("symptoms"),
  yearsOfExposure: integer("years_of_exposure"),
  detailedRiskAgent: text("detailed_risk_agent"),
  ipsName: text("ips_name"),
  diagnosticTests: text("diagnostic_tests"),
  workAreaExposure: text("work_area_exposure"),
  protectiveEquipment: text("protective_equipment"),
  wasHospitalized: integer("was_hospitalized").default(0),
  incapacityDays: integer("incapacity_days"),
  preventiveMeasures: text("preventive_measures"),
  arlCode: text("arl_code"),
  epsCode: text("eps_code"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Insert schemas and types
export const insertCompanySchema = createInsertSchema(companies)
  .omit({ 
    id: true, 
    createdAt: true, 
    calculatedChapter: true 
  })
  .extend({
    name: z.string().min(1, "El nombre de la empresa es obligatorio"),
    nit: z.string().min(1, "El NIT es obligatorio"),
    address: z.string().min(1, "La dirección es obligatoria"),
    contactPhone: z.string().min(1, "El teléfono de contacto es obligatorio"),
    contactEmail: z.string().min(1, "El correo de contacto es obligatorio").email("Debe ser un correo válido"),
    numberOfWorkers: z.coerce.number().min(1, "El número de trabajadores debe ser al menos 1"),
  });
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;

export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true })
  .extend({
    fullName: z.string()
      .min(1, "El nombre es requerido")
      .max(50, "El nombre debe tener máximo 50 caracteres")
      .regex(/^[A-Z][a-záéíóúñA-Z\s\-]*$/, "El nombre debe empezar con mayúscula, contener solo letras, espacios y guiones")
      .optional(),
    username: z.string()
      .min(1, "El usuario es requerido")
      .max(30, "El usuario debe tener máximo 30 caracteres")
      .regex(/^[a-zA-Z0-9._]+$/, "El usuario solo puede contener letras, números, puntos y guiones bajos"),
    password: z.string()
      .min(1, "La contraseña es requerida")
      .max(30, "La contraseña debe tener máximo 30 caracteres")
      .refine(
        (pwd) => !["123456789", "password", "qwerty", "123123123", "abc123"].includes(pwd.toLowerCase()),
        "Esta contraseña es muy común. Por favor usa una contraseña más segura"
      ),
  });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Type for user roles
export type UserRole = typeof userRoleEnum.enumValues[number];

export const insertWorkerSchema = createInsertSchema(workers)
  .omit({ id: true, createdAt: true, contractNumber: true })
  .extend({
    identificationNumber: z.string().min(1, "El número de identificación es obligatorio"),
    name: z.string().min(1, "El nombre es obligatorio"),
    position: z.string().min(1, "El cargo es obligatorio"),
    department: z.string().min(1, "El área/departamento es obligatorio"),
    contractType: z.string().min(1, "El tipo de contrato es obligatorio"),
    startDate: z.string().min(1, "La fecha de inicio es obligatoria"),
  });
export type InsertWorker = z.infer<typeof insertWorkerSchema>;
export type Worker = typeof workers.$inferSelect;

// Health conditions schema and types (Standard 3.1.1)
export const insertHealthConditionSchema = createInsertSchema(healthConditions)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    workerId: z.string().min(1, "Debe seleccionar un trabajador"),
    conditionType: z.string().min(1, "El tipo de condición es obligatorio"),
    description: z.string().min(1, "La descripción es obligatoria"),
    diagnosisDate: z.string().min(1, "La fecha de diagnóstico es obligatoria"),
  });
export type InsertHealthCondition = z.infer<typeof insertHealthConditionSchema>;
export type HealthCondition = typeof healthConditions.$inferSelect;

// Sociodemographic diagnosis cycle schema and types (Standard 3.1.1)
export const insertSociodemographicDiagnosisSchema = createInsertSchema(sociodemographicDiagnosis)
  .omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSociodemographicDiagnosis = z.infer<typeof insertSociodemographicDiagnosisSchema>;
export type SociodemographicDiagnosis = typeof sociodemographicDiagnosis.$inferSelect;

export const insertAccidentSchema = createInsertSchema(accidents)
  .omit({ id: true, createdAt: true })
  .extend({
    workerId: z.string().min(1, "Debe seleccionar un trabajador"),
    type: z.string().min(1, "El tipo de accidente es obligatorio"),
    description: z.string().min(1, "La descripción del accidente es obligatoria"),
    severity: z.string().min(1, "La severidad es obligatoria"),
    date: z.string().min(1, "La fecha del accidente es obligatoria"),
    time: z.string().min(1, "La hora del accidente es obligatoria"),
    location: z.string().min(1, "El lugar del accidente es obligatorio"),
    actionsTaken: z.string().optional(),
  });
export type InsertAccident = z.infer<typeof insertAccidentSchema>;
export type Accident = typeof accidents.$inferSelect;

export const insertTrainingSchema = createInsertSchema(trainings)
  .omit({ id: true, createdAt: true })
  .extend({
    title: z.string().min(1, "El título de la capacitación es obligatorio"),
    description: z.string().optional().default(""),
    instructor: z.string().optional().default(""),
    date: z.string().min(1, "La fecha es obligatoria"),
    startTime: z.string().optional().default(""),
    endTime: z.string().optional().default(""),
    location: z.string().optional().default(""),
    totalWorkers: z.coerce.number().min(1, "El cupo total debe ser al menos 1 trabajador"),
  });
export type InsertTraining = z.infer<typeof insertTrainingSchema>;
export type Training = typeof trainings.$inferSelect;

export const insertTrainingAttendeeSchema = createInsertSchema(trainingAttendees).omit({ id: true, createdAt: true });
export type InsertTrainingAttendee = z.infer<typeof insertTrainingAttendeeSchema>;
export type TrainingAttendee = typeof trainingAttendees.$inferSelect;

export const insertInspectionSchema = createInsertSchema(inspections)
  .omit({ id: true, createdAt: true })
  .extend({
    area: z.string().min(1, "El área de inspección es obligatoria"),
    inspector: z.string().min(1, "El nombre del inspector es obligatorio"),
    date: z.string().min(1, "La fecha de inspección es obligatoria"),
    findings: z.coerce.number().min(0, "El número de hallazgos es obligatorio"),
    compliance: z.coerce.number().min(0, "El porcentaje de cumplimiento es obligatorio").max(100, "El porcentaje no puede ser mayor a 100"),
    observations: z.string().min(1, "Las observaciones son obligatorias"),
  });
export type InsertInspection = z.infer<typeof insertInspectionSchema>;
export type Inspection = typeof inspections.$inferSelect;

export const insertInspeccionPeligroVinculadoSchema = createInsertSchema(inspeccionesPeligrosVinculados)
  .omit({ id: true, createdAt: true, updatedAt: true, companyId: true })
  .extend({
    fechaVerificacion: z.coerce.date().optional(),
  });
export type InsertInspeccionPeligroVinculado = z.infer<typeof insertInspeccionPeligroVinculadoSchema>;
export type InspeccionPeligroVinculado = typeof inspeccionesPeligrosVinculados.$inferSelect;

export const insertPreventiveMeasureSchema = createInsertSchema(preventiveMeasures)
  .omit({ id: true, createdAt: true })
  .extend({
    title: z.string().min(1, "El título de la medida es obligatorio"),
    description: z.string().min(1, "La descripción es obligatoria"),
    responsible: z.string().min(1, "El responsable es obligatorio"),
    priority: z.string().min(1, "La prioridad es obligatoria"),
  });
export type InsertPreventiveMeasure = z.infer<typeof insertPreventiveMeasureSchema>;
export type PreventiveMeasure = typeof preventiveMeasures.$inferSelect;

export const insertOccupationalDiseaseSchema = createInsertSchema(occupationalDiseases)
  .omit({ id: true, createdAt: true })
  .extend({
    workerId: z.string().min(1, "Debe seleccionar un trabajador"),
    diseaseName: z.string().min(1, "El nombre de la enfermedad es obligatorio"),
    diagnosis: z.string().min(1, "El diagnóstico es obligatorio"),
  });
export type InsertOccupationalDisease = z.infer<typeof insertOccupationalDiseaseSchema>;
export type OccupationalDisease = typeof occupationalDiseases.$inferSelect;

// SST Standards - Supports both Resolución 0312 and ISO 45001
export const phvaCycleEnum = pgEnum("phva_cycle", ["planear", "hacer", "verificar", "actuar"]);
export const standardTypeEnum = pgEnum("standard_type", ["RES_0312", "ISO_45001"]);

export const sstStandards = pgTable("sst_standards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  standardType: standardTypeEnum("standard_type").notNull().default("RES_0312"),
  name: text("name").notNull(),
  description: text("description"),
  phvaCycle: phvaCycleEnum("phva_cycle").notNull(),
  maxScore: integer("max_score").notNull(),
  order: integer("order").notNull(),
  clauseNumber: text("clause_number"), // For ISO 45001: "4", "5", "6", etc. For Res 0312: null
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// SST Items - Individual evaluation criteria for each standard
export const sstItems = pgTable("sst_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  standardId: varchar("standard_id").notNull().references(() => sstStandards.id, { onDelete: "cascade" }),
  itemNumber: text("item_number").notNull(), // e.g., "1.1.1"
  description: text("description").notNull(),
  evaluationCriteria: text("evaluation_criteria").notNull(), // What needs to be verified
  maxScore: integer("max_score").notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// SST Evaluations - Overall evaluation sessions (supports RES_0312 and ISO_45001)
export const evaluationStatusEnum = pgEnum("evaluation_status", ["en-progreso", "completada", "aprobada", "rechazada"]);

export const sstEvaluations = pgTable("sst_evaluations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  standardType: standardTypeEnum("standard_type").notNull().default("RES_0312"),
  title: text("title").notNull(),
  description: text("description"),
  evaluationDate: date("evaluation_date").notNull(),
  evaluator: text("evaluator").notNull(),
  totalScore: integer("total_score").notNull().default(0),
  maxTotalScore: integer("max_total_score").notNull().default(100),
  compliancePercentage: integer("compliance_percentage").notNull().default(0),
  status: evaluationStatusEnum("status").notNull().default("en-progreso"),
  observations: text("observations"),
  
  // Campos de aprobación vinculados a trabajadores
  elaboradoPorId: varchar("elaborado_por_id").references(() => workers.id),
  autorizadoPorId: varchar("autorizado_por_id").references(() => workers.id),
  aprobadoPorId: varchar("aprobado_por_id").references(() => workers.id),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// SST Evaluation Items - Scores for each item in an evaluation
export const sstEvaluationItems = pgTable("sst_evaluation_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  evaluationId: varchar("evaluation_id").notNull().references(() => sstEvaluations.id, { onDelete: "cascade" }),
  itemId: varchar("item_id").notNull().references(() => sstItems.id, { onDelete: "cascade" }),
  score: integer("score").notNull().default(0),
  observations: text("observations"),
  evidenceUrl: text("evidence_url"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// SST Evidence - Supporting documents for evaluation items
export const sstEvidence = pgTable("sst_evidence", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  evaluationItemId: varchar("evaluation_item_id").notNull().references(() => sstEvaluationItems.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type"),
  description: text("description"),
  uploadDate: timestamp("upload_date").notNull().default(sql`now()`),
});

// Insert schemas and types for SST tables
export const insertSstStandardSchema = createInsertSchema(sstStandards).omit({ id: true, createdAt: true });
export type InsertSstStandard = z.infer<typeof insertSstStandardSchema>;
export type SstStandard = typeof sstStandards.$inferSelect;

export const insertSstItemSchema = createInsertSchema(sstItems).omit({ id: true, createdAt: true });
export type InsertSstItem = z.infer<typeof insertSstItemSchema>;
export type SstItem = typeof sstItems.$inferSelect;

export const insertSstEvaluationSchema = createInsertSchema(sstEvaluations)
  .omit({ id: true, createdAt: true })
  .extend({
    title: z.string().min(1, "El título de la evaluación es obligatorio"),
    evaluator: z.string().min(1, "El nombre del evaluador es obligatorio"),
  });
export type InsertSstEvaluation = z.infer<typeof insertSstEvaluationSchema>;
export type SstEvaluation = typeof sstEvaluations.$inferSelect;

export const insertSstEvaluationItemSchema = createInsertSchema(sstEvaluationItems).omit({ id: true, createdAt: true });
export type InsertSstEvaluationItem = z.infer<typeof insertSstEvaluationItemSchema>;
export type SstEvaluationItem = typeof sstEvaluationItems.$inferSelect;

export const insertSstEvidenceSchema = createInsertSchema(sstEvidence).omit({ id: true });
export type InsertSstEvidence = z.infer<typeof insertSstEvidenceSchema>;
export type SstEvidence = typeof sstEvidence.$inferSelect;

// ==================== PESV (Plan Estratégico de Seguridad Vial) ====================

// Vehicle ownership types
export const vehicleOwnershipEnum = pgEnum("vehicle_ownership", ["propio", "arrendado", "contratado"]);
export const vehicleStatusEnum = pgEnum("vehicle_status", ["activo", "mantenimiento", "inactivo", "dado-de-baja"]);
export const vehicleTypeEnum = pgEnum("vehicle_type", ["automovil", "camioneta", "camion", "motocicleta", "bus", "otro"]);

// Vehicles table - Fleet management
export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  plate: text("plate").notNull().unique(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  type: vehicleTypeEnum("type").notNull(),
  ownership: vehicleOwnershipEnum("ownership").notNull(),
  capacity: integer("capacity"), // Number of passengers
  mileage: integer("mileage"),
  color: text("color"),
  vin: text("vin"), // Vehicle Identification Number
  insurancePolicy: text("insurance_policy"),
  insuranceExpiry: date("insurance_expiry"),
  soatExpiry: date("soat_expiry"),
  technicalReviewExpiry: date("technical_review_expiry"),
  status: vehicleStatusEnum("status").notNull().default("activo"),
  observations: text("observations"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Driver license types
export const licenseTypeEnum = pgEnum("license_type", ["A1", "A2", "B1", "B2", "B3", "C1", "C2", "C3"]);
export const driverStatusEnum = pgEnum("driver_status", ["activo", "inactivo", "suspendido", "retirado"]);

// Drivers table - Driver management
export const drivers = pgTable("drivers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  workerId: varchar("worker_id").references(() => workers.id), // Link to existing worker if applicable
  name: text("name").notNull(),
  identificationNumber: text("identification_number").notNull().unique(),
  licenseNumber: text("license_number").notNull().unique(),
  licenseType: licenseTypeEnum("license_type").notNull(),
  licenseExpiry: date("license_expiry").notNull(),
  bloodType: text("blood_type"),
  emergencyContact: text("emergency_contact"),
  emergencyPhone: text("emergency_phone"),
  medicalExamExpiry: date("medical_exam_expiry"),
  status: driverStatusEnum("status").notNull().default("activo"),
  observations: text("observations"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Pre-operational inspection status
export const inspectionResultEnum = pgEnum("inspection_result", ["apto", "apto-con-observaciones", "no-apto"]);

// Vehicle Inspections table - Daily pre-operational checks
export const vehicleInspections = pgTable("vehicle_inspections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
  driverId: varchar("driver_id").notNull().references(() => drivers.id),
  inspectionDate: date("inspection_date").notNull(),
  inspectionTime: text("inspection_time").notNull(),
  
  // Exterior checks
  tires: integer("tires").notNull().default(0), // 0=bad, 1=good
  lights: integer("lights").notNull().default(0),
  mirrors: integer("mirrors").notNull().default(0),
  bodywork: integer("bodywork").notNull().default(0),
  
  // Interior checks
  seatbelts: integer("seatbelts").notNull().default(0),
  horn: integer("horn").notNull().default(0),
  windshield: integer("windshield").notNull().default(0),
  instruments: integer("instruments").notNull().default(0),
  
  // Mechanical checks
  brakes: integer("brakes").notNull().default(0),
  steering: integer("steering").notNull().default(0),
  suspension: integer("suspension").notNull().default(0),
  fluids: integer("fluids").notNull().default(0),
  
  // Safety equipment
  fireExtinguisher: integer("fire_extinguisher").notNull().default(0),
  firstAidKit: integer("first_aid_kit").notNull().default(0),
  reflectiveTriangles: integer("reflective_triangles").notNull().default(0),
  safetyVest: integer("safety_vest").notNull().default(0),
  
  result: inspectionResultEnum("result").notNull(),
  observations: text("observations"),
  correctiveActions: text("corrective_actions"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Road incident severity
export const incidentSeverityEnum = pgEnum("incident_severity", ["solo-danos", "con-heridos", "mortal"]);
export const incidentTypeEnum = pgEnum("incident_type", ["colision", "volcamiento", "atropello", "salida-via", "choque-objeto", "otro"]);

// Road Incidents table - Traffic accidents/incidents
export const roadIncidents = pgTable("road_incidents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
  driverId: varchar("driver_id").notNull().references(() => drivers.id),
  incidentDate: date("incident_date").notNull(),
  incidentTime: text("incident_time").notNull(),
  location: text("location").notNull(),
  type: incidentTypeEnum("type").notNull(),
  customType: text("custom_type"), // For "otro" type
  severity: incidentSeverityEnum("severity").notNull(),
  description: text("description").notNull(),
  weatherConditions: text("weather_conditions"),
  roadConditions: text("road_conditions"),
  witnesses: text("witnesses"),
  authoritiesNotified: integer("authorities_notified").notNull().default(0), // 0=no, 1=yes
  policeReport: text("police_report"),
  injuries: integer("injuries").notNull().default(0), // Number of injured
  fatalities: integer("fatalities").notNull().default(0), // Number of fatalities
  estimatedCost: integer("estimated_cost"), // Estimated cost in COP
  rootCause: text("root_cause"),
  correctiveActions: text("corrective_actions"),
  preventiveActions: text("preventive_actions"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Road Safety Training table - Specific PESV training
export const roadSafetyTrainings = pgTable("road_safety_trainings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  title: text("title").notNull(),
  description: text("description"),
  instructor: text("instructor"),
  trainingDate: date("training_date").notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
  location: text("location"),
  topics: text("topics"), // Comma-separated topics
  totalAttendees: integer("total_attendees").notNull().default(0),
  status: trainingStatusEnum("status").notNull().default("programada"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Training attendees for road safety (many-to-many with drivers)
export const roadSafetyAttendees = pgTable("road_safety_attendees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trainingId: varchar("training_id").notNull().references(() => roadSafetyTrainings.id, { onDelete: "cascade" }),
  driverId: varchar("driver_id").notNull().references(() => drivers.id, { onDelete: "cascade" }),
  attended: integer("attended").notNull().default(0), // 0 = not attended, 1 = attended
  score: integer("score"), // Training evaluation score
  certificate: text("certificate"), // Certificate URL
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// PESV Audit status
export const auditStatusEnum = pgEnum("audit_status", ["programada", "en-curso", "completada"]);
export const auditResultEnum = pgEnum("audit_result", ["cumple", "cumple-parcialmente", "no-cumple"]);

// PESV Audits table - Annual PESV audits with 24 steps (Res. 40595/2022)
export const pesvAudits = pgTable("pesv_audits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  auditDate: date("audit_date").notNull(),
  auditor: text("auditor").notNull(),
  auditorEntity: text("auditor_entity"),
  scope: text("scope").notNull(), // What was audited
  
  // PLANEAR - Planning (Steps 1-8) - Score 0-100 each
  step1Leader: integer("step1_leader").notNull().default(0), // Líder del PESV
  step2Committee: integer("step2_committee").notNull().default(0), // Comité de Seguridad Vial
  step3Policy: integer("step3_policy").notNull().default(0), // Política de Seguridad Vial
  step4Leadership: integer("step4_leadership").notNull().default(0), // Liderazgo y compromiso
  step5Diagnosis: integer("step5_diagnosis").notNull().default(0), // Diagnóstico
  step6RiskAssessment: integer("step6_risk_assessment").notNull().default(0), // Caracterización de riesgos
  step7Objectives: integer("step7_objectives").notNull().default(0), // Objetivos y metas
  step8CriticalRisks: integer("step8_critical_risks").notNull().default(0), // Programa de riesgos críticos
  
  // HACER - Implementation (Steps 9-19) - Score 0-100 each
  step9AnnualPlan: integer("step9_annual_plan").notNull().default(0), // Plan anual de trabajo
  step10Training: integer("step10_training").notNull().default(0), // Competencia y formación
  step11Fatigue: integer("step11_fatigue").notNull().default(0), // Fatiga y somnolencia
  step12Emergency: integer("step12_emergency").notNull().default(0), // Preparación emergencias
  step13Investigation: integer("step13_investigation").notNull().default(0), // Investigación siniestros
  step14SafeRoads: integer("step14_safe_roads").notNull().default(0), // Vías seguras
  step15DriverSelection: integer("step15_driver_selection").notNull().default(0), // Selección conductores
  step16VehicleInspection: integer("step16_vehicle_inspection").notNull().default(0), // Inspección vehículos
  step17Maintenance: integer("step17_maintenance").notNull().default(0), // Mantenimiento
  step18ChangeManagement: integer("step18_change_management").notNull().default(0), // Gestión del cambio
  step19Procurement: integer("step19_procurement").notNull().default(0), // Adquisición bienes
  
  // VERIFICAR - Verification (Steps 20-22) - Score 0-100 each
  step20Indicators: integer("step20_indicators").notNull().default(0), // Indicadores mínimos
  step21Supervision: integer("step21_supervision").notNull().default(0), // Supervisión del PESV
  step22Audit: integer("step22_audit").notNull().default(0), // Auditoría anual
  
  // ACTUAR - Act (Steps 23-24) - Score 0-100 each
  step23Improvement: integer("step23_improvement").notNull().default(0), // Mejora continua
  step24Communication: integer("step24_communication").notNull().default(0), // Comunicación y participación
  
  // Aggregate scores by PHVA phase (calculated from 24 steps)
  policyCompliance: integer("policy_compliance").notNull().default(0), // Average of steps 1-8
  planningCompliance: integer("planning_compliance").notNull().default(0), // Complementary planning score
  implementationCompliance: integer("implementation_compliance").notNull().default(0), // Average of steps 9-19
  verificationCompliance: integer("verification_compliance").notNull().default(0), // Average of steps 20-22
  improvementCompliance: integer("improvement_compliance").notNull().default(0), // Average of steps 23-24
  
  totalScore: integer("total_score").notNull().default(0), // Sum of all 24 steps
  compliancePercentage: integer("compliance_percentage").notNull().default(0), // Average of all 24 steps
  result: auditResultEnum("result").notNull(),
  findings: text("findings"), // Non-conformities found
  recommendations: text("recommendations"),
  actionPlan: text("action_plan"),
  status: auditStatusEnum("status").notNull().default("programada"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Insert schemas and types for PESV tables
export const insertVehicleSchema = createInsertSchema(vehicles)
  .omit({ id: true, createdAt: true })
  .extend({
    plate: z.string().min(1, "La placa del vehículo es obligatoria"),
    brand: z.string().min(1, "La marca del vehículo es obligatoria"),
    model: z.string().min(1, "El modelo del vehículo es obligatorio"),
    year: z.coerce.number().min(1900, "El año del vehículo es obligatorio"),
  });
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;

export const insertDriverSchema = createInsertSchema(drivers)
  .omit({ id: true, createdAt: true })
  .extend({
    workerId: z.string().min(1, "Debe seleccionar un trabajador"),
    licenseNumber: z.string().min(1, "El número de licencia es obligatorio"),
    licenseCategory: z.string().min(1, "La categoría de licencia es obligatoria"),
  });
export type InsertDriver = z.infer<typeof insertDriverSchema>;
export type Driver = typeof drivers.$inferSelect;

export const insertVehicleInspectionSchema = createInsertSchema(vehicleInspections)
  .omit({ id: true, createdAt: true })
  .extend({
    vehicleId: z.string().min(1, "Debe seleccionar un vehículo"),
    inspector: z.string().min(1, "El nombre del inspector es obligatorio"),
  });
export type InsertVehicleInspection = z.infer<typeof insertVehicleInspectionSchema>;
export type VehicleInspection = typeof vehicleInspections.$inferSelect;

export const insertRoadIncidentSchema = createInsertSchema(roadIncidents)
  .omit({ id: true, createdAt: true })
  .extend({
    description: z.string().min(1, "La descripción del incidente es obligatoria"),
    location: z.string().min(1, "El lugar del incidente es obligatorio"),
  });
export type InsertRoadIncident = z.infer<typeof insertRoadIncidentSchema>;
export type RoadIncident = typeof roadIncidents.$inferSelect;

export const insertRoadSafetyTrainingSchema = createInsertSchema(roadSafetyTrainings)
  .omit({ id: true, createdAt: true })
  .extend({
    title: z.string().min(1, "El título de la capacitación es obligatorio"),
  });
export type InsertRoadSafetyTraining = z.infer<typeof insertRoadSafetyTrainingSchema>;
export type RoadSafetyTraining = typeof roadSafetyTrainings.$inferSelect;

export const insertRoadSafetyAttendeeSchema = createInsertSchema(roadSafetyAttendees).omit({ id: true, createdAt: true });
export type InsertRoadSafetyAttendee = z.infer<typeof insertRoadSafetyAttendeeSchema>;
export type RoadSafetyAttendee = typeof roadSafetyAttendees.$inferSelect;

export const insertPesvAuditSchema = createInsertSchema(pesvAudits).omit({ id: true, createdAt: true });
export type InsertPesvAudit = z.infer<typeof insertPesvAuditSchema>;
export type PesvAudit = typeof pesvAudits.$inferSelect;

// ============================================================================
// MÓDULO DE CONTRATOS Y PERFILES DE CARGO - LEGISLACIÓN COLOMBIANA 2025
// ============================================================================

// Enum para tipos de contrato laboral (Código Sustantivo del Trabajo + Ley 2466/2025)
export const contractTypeEnumV2 = pgEnum("contract_type_v2", [
  "indefinido",           // Término indefinido (principal por Ley 2466/2025)
  "fijo",                 // Término fijo (máximo 4 años según reforma 2025)
  "obra_labor",           // Por obra o labor determinada
  "ocasional",            // Ocasional, accidental o transitorio (máx 30 días)
  "aprendizaje",          // Contrato de aprendizaje
  "servicios"             // Prestación de servicios (no laboral, civil/comercial)
]);

// Enum para tipos de examen médico ocupacional (Resolución 1843/2025)
export const medicalExamTypeEnum = pgEnum("medical_exam_type", [
  "preocupacional",       // Pre-ocupacional o de ingreso
  "periodico",            // Periódico programado
  "cambio_ocupacion",     // Por cambio de ocupación
  "post_incapacidad",     // Post-incapacidad o reintegro
  "egreso"                // De egreso o retiro
]);

// Enum para estado del contrato
export const contractStatusEnumV2 = pgEnum("contract_status_v2", [
  "activo",
  "vencido",
  "terminado",
  "suspendido"
]);

// Enum para estado de examen médico
export const medicalExamStatusEnum = pgEnum("medical_exam_status", [
  "programado",
  "realizado",
  "vencido",
  "cancelado"
]);

// Enum para concepto de aptitud médica
export const medicalAptitudeEnum = pgEnum("medical_aptitude", [
  "apto",
  "apto_con_restricciones",
  "no_apto_temporal",
  "no_apto_permanente"
]);

// Perfiles de cargo - Basado en Resolución 1843/2025
export const jobProfiles = pgTable("job_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  name: text("name").notNull(), // Nombre del cargo (ej: Operario de Producción)
  description: text("description").notNull(), // Descripción de funciones
  riskClass: riskLevelEnum("risk_class").notNull(), // Clase de riesgo I-V (Decreto 768/2022)
  riskFactors: text("risk_factors").array(), // Factores de riesgo específicos
  physicalDemands: text("physical_demands"), // Demandas físicas del cargo
  mentalDemands: text("mental_demands"), // Demandas mentales/cognitivas
  requiredPpe: text("required_ppe").array(), // EPP requeridos
  requiredExams: text("required_exams").array(), // Exámenes médicos requeridos
  examFrequencyMonths: integer("exam_frequency_months"), // Frecuencia de exámenes periódicos
  requiredTrainings: text("required_trainings").array(), // Capacitaciones obligatorias
  linkedRole: userRoleEnum("linked_role"), // Rol del sistema vinculado (opcional)
  isActive: integer("is_active").notNull().default(1), // 1 = activo, 0 = inactivo
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Contratos laborales - Basado en CST + Ley 2466/2025
export const contracts = pgTable("contracts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  workerId: varchar("worker_id").notNull().references(() => workers.id),
  identificationNumber: text("identification_number"), // Cédula de ciudadanía (opcional para compatibilidad con datos existentes)
  jobProfileId: varchar("job_profile_id").references(() => jobProfiles.id),
  contractType: contractTypeEnumV2("contract_type_v2").notNull(),
  contractNumber: text("contract_number").notNull().unique(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"), // Null si es indefinido
  salary: integer("salary"), // Salario base (opcional - información sensible)
  position: text("position").notNull(), // Cargo
  department: text("department"),
  workSchedule: text("work_schedule"), // Horario de trabajo
  arlRate: text("arl_rate"), // Tasa ARL calculada (porcentaje)
  additionalClauses: text("additional_clauses"), // Cláusulas adicionales
  status: contractStatusEnumV2("contract_status_v2").notNull().default("activo"),
  terminationDate: date("termination_date"), // Fecha de terminación si aplica
  terminationReason: text("termination_reason"), // Razón de terminación
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Exámenes médicos ocupacionales - Basado en Resolución 1843/2025
export const medicalExams = pgTable("medical_exams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  workerId: varchar("worker_id").notNull().references(() => workers.id),
  jobProfileId: varchar("job_profile_id").references(() => jobProfiles.id),
  examType: medicalExamTypeEnum("exam_type").notNull(),
  scheduledDate: date("scheduled_date").notNull(),
  performedDate: date("performed_date"), // Fecha de realización
  medicalCenter: text("medical_center"), // IPS o centro médico
  attendingPhysician: text("attending_physician"), // Médico ocupacional
  aptitude: medicalAptitudeEnum("aptitude"), // Concepto de aptitud
  restrictions: text("restrictions"), // Restricciones laborales
  recommendations: text("recommendations"), // Recomendaciones médicas
  followUpDate: date("follow_up_date"), // Fecha de próximo seguimiento
  examResults: text("exam_results"), // Resultados generales (sin diagnósticos específicos)
  status: medicalExamStatusEnum("status").notNull().default("programado"),
  // Documento del examen médico (PDF/imagen del certificado)
  documentUrl: text("document_url"), // URL del archivo del examen
  documentFileName: text("document_file_name"), // Nombre original del archivo
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  // Portal de empleados - notificación y confirmación de lectura (Estándar 3.1.4)
  notificationSentAt: timestamp("notification_sent_at"), // Cuando se notificó al empleado
  notificationReadAt: timestamp("notification_read_at"), // Cuando el empleado abrió la notificación
  readConfirmedAt: timestamp("read_confirmed_at"), // Cuando el empleado confirmó lectura
  readConfirmedBy: varchar("read_confirmed_by"), // ID del usuario que confirmó
});

// Insert schemas y types para el módulo de contratos
export const insertJobProfileSchema = createInsertSchema(jobProfiles)
  .omit({ id: true, createdAt: true, companyId: true })
  .extend({
    name: z.string().min(1, "El nombre del cargo es obligatorio"),
    description: z.string().min(1, "La descripción del cargo es obligatoria"),
  });
export type InsertJobProfile = z.infer<typeof insertJobProfileSchema>;
export type JobProfile = typeof jobProfiles.$inferSelect;

export const insertContractSchema = createInsertSchema(contracts)
  .omit({ id: true, createdAt: true, companyId: true, salary: true })
  .extend({
    workerId: z.string().min(1, "Debe seleccionar un trabajador"),
    contractNumber: z.string().optional(), // Auto-generated if not provided
    position: z.string().min(1, "El cargo es obligatorio"),
  });
export type InsertContract = z.infer<typeof insertContractSchema>;
export type Contract = typeof contracts.$inferSelect;

export const insertMedicalExamSchema = createInsertSchema(medicalExams)
  .omit({ id: true, createdAt: true, companyId: true })
  .extend({
    workerId: z.string().min(1, "Debe seleccionar un trabajador"),
    examType: z.string().min(1, "El tipo de examen es obligatorio"),
  });
export type InsertMedicalExam = z.infer<typeof insertMedicalExamSchema>;
export type MedicalExam = typeof medicalExams.$inferSelect;

// Designación de Responsable SST - Módulo Planear/Recursos (Resolución 0312/2019)
export const designationStatusEnum = pgEnum("designation_status", ["activo", "inactivo"]);

export const responsibleDesignations = pgTable("responsible_designations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  workerId: varchar("worker_id").notNull().references(() => workers.id),
  jobProfileId: varchar("job_profile_id").references(() => jobProfiles.id), // Vinculación con perfil de cargo (opcional)
  designationDate: date("designation_date").notNull(),
  position: text("position").notNull(), // Cargo específico (ej: Responsable del SG-SST, Coordinador SST)
  responsibilities: text("responsibilities").array().notNull(), // Array de responsabilidades seleccionables
  signatureUrl: text("signature_url"), // Documento de firma escaneado
  status: designationStatusEnum("status").notNull().default("activo"),
  // Campos adicionales para cumplimiento Resolución 0312/2019 - Estándar 1.1.1
  licenciaSstNumero: text("licencia_sst_numero"), // Número de licencia SST
  licenciaSstVigencia: date("licencia_sst_vigencia"), // Fecha de vigencia de la licencia SST
  curso50Horas: boolean("curso_50_horas").default(false), // ¿Tiene certificado del curso de 50 horas?
  curso50HorasFecha: date("curso_50_horas_fecha"), // Fecha del certificado del curso de 50 horas
  nivelFormacion: text("nivel_formacion"), // Técnico, Tecnólogo, Profesional, Especialista
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertResponsibleDesignationSchema = createInsertSchema(responsibleDesignations).omit({ id: true, createdAt: true, companyId: true });
export type InsertResponsibleDesignation = z.infer<typeof insertResponsibleDesignationSchema>;
export type ResponsibleDesignation = typeof responsibleDesignations.$inferSelect;

// Actas de Designación de Recursos - Módulo Planear (Resolución 0312/2019)
export const resourceTypeEnum = pgEnum("resource_type", ["humano", "fisico", "financiero"]);
export const implementLevelEnum = pgEnum("implement_level", ["basico", "intervencion"]);

export const resourceAllocations = pgTable("resource_allocations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  date: date("date").notNull(), // Fecha del acta
  resourceType: resourceTypeEnum("resource_type").notNull(), // Tipo de recurso: humano, físico, financiero
  
  // Campos para recursos humanos
  workerId: varchar("worker_id").references(() => workers.id), // Referencia al trabajador (opcional)
  cargo: text("cargo"), // Cargo del personal
  cedula: text("cedula"), // Cédula de ciudadanía
  nombreCompleto: text("nombre_completo"), // Nombre completo del personal
  
  // Campos para recursos físicos y financieros
  nombreEquipo: text("nombre_equipo"), // Nombre del equipo/recurso
  objeto: text("objeto"), // Descripción del objeto/recurso
  numUnidades: integer("num_unidades"), // Número de unidades
  serial: text("serial"), // Serial del equipo
  implementosNivel: implementLevelEnum("implementos_nivel"), // Nivel: básico o intervención
  
  // Campos financieros
  inversionEstimada: text("inversion_estimada"), // Inversión estimada (stored as text for currency formatting)
  fechaDesembolso: date("fecha_desembolso"), // Fecha de desembolso
  montoEjecutado: text("monto_ejecutado").default("0"), // Monto ejecutado en adquisiciones vinculadas
  
  // Campos generales
  objetivoGeneral: text("objetivo_general"), // Objetivo general de la asignación
  
  // Campos de aprobación vinculados a trabajadores
  elaboradoPorId: varchar("elaborado_por_id").references(() => workers.id),
  autorizadoPorId: varchar("autorizado_por_id").references(() => workers.id),
  aprobadoPorId: varchar("aprobado_por_id").references(() => workers.id),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertResourceAllocationSchema = createInsertSchema(resourceAllocations)
  .omit({ id: true, createdAt: true, companyId: true })
  .superRefine((data, ctx) => {
    // Validación condicional para recursos humanos
    if (data.resourceType === "humano") {
      if (!data.workerId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Debe seleccionar un trabajador para recursos humanos",
          path: ["workerId"],
        });
      }
      if (!data.cargo) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Cargo es requerido para recursos humanos",
          path: ["cargo"],
        });
      }
      if (!data.cedula) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Cédula es requerida para recursos humanos",
          path: ["cedula"],
        });
      }
      if (!data.nombreCompleto) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Nombre completo es requerido para recursos humanos",
          path: ["nombreCompleto"],
        });
      }
    }
    
    // Validación condicional para recursos físicos
    if (data.resourceType === "fisico") {
      if (!data.nombreEquipo) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Nombre del equipo es requerido para recursos físicos",
          path: ["nombreEquipo"],
        });
      }
      if (!data.numUnidades) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Número de unidades es requerido para recursos físicos",
          path: ["numUnidades"],
        });
      }
    }
    
    // Validación condicional para recursos financieros
    if (data.resourceType === "financiero") {
      if (!data.inversionEstimada) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Inversión estimada es requerida para recursos financieros",
          path: ["inversionEstimada"],
        });
      }
      if (!data.fechaDesembolso) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Fecha de desembolso es requerida para recursos financieros",
          path: ["fechaDesembolso"],
        });
      }
    }
  });

export type InsertResourceAllocation = z.infer<typeof insertResourceAllocationSchema>;
export type ResourceAllocation = typeof resourceAllocations.$inferSelect;

// Actas de Constitución del COPASST - Módulo Planear (Resolución 2013/1986)
export const copasstActas = pgTable("copasst_actas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  fecha: date("fecha").notNull(), // Fecha del acta
  numeroActa: text("numero_acta").notNull(), // Número del acta (auto-generado: "001-2025")
  notas: text("notas").notNull(), // Contenido del acta
  presidenteWorkerId: varchar("presidente_worker_id").references(() => workers.id), // Enlace con trabajador presidente
  presidente: text("presidente"), // Nombre del presidente
  secretariaWorkerId: varchar("secretaria_worker_id").references(() => workers.id), // Enlace con trabajador secretario/a
  secretaria: text("secretaria"), // Nombre del secretario/a
  archivoAdjuntoUrl: text("archivo_adjunto_url"), // URL del archivo PDF firmado adjunto (SST-2025-0039, SST-2025-0042)
  archivoAdjuntoNombre: text("archivo_adjunto_nombre"), // Nombre original del archivo
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertCopasstActaSchema = createInsertSchema(copasstActas).omit({ id: true, createdAt: true, companyId: true, numeroActa: true }).extend({
  fecha: z.string().min(1, "La fecha es obligatoria"),
  notas: z.string().min(1, "El contenido del acta es obligatorio"),
});
export type InsertCopasstActa = z.infer<typeof insertCopasstActaSchema>;
export type CopasstActa = typeof copasstActas.$inferSelect;

// Afiliaciones al Sistema de Seguridad Social (SSSS) - Módulo Planear
export const afiliacionesSSSS = pgTable("afiliaciones_ssss", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  workerId: varchar("worker_id").notNull().references(() => workers.id), // Enlace con trabajador
  fecha: date("fecha").notNull(), // Fecha de afiliación
  // Entidades de Seguridad Social seleccionadas de catálogos oficiales
  epsNombre: text("eps_nombre"), // Nombre de la EPS
  arlNombre: text("arl_nombre"), // Nombre de la ARL
  afpNombre: text("afp_nombre"), // Nombre del Fondo de Pensiones (AFP)
  ccfNombre: text("ccf_nombre"), // Nombre de la Caja de Compensación Familiar
  // Campos legacy para archivos (mantenidos por compatibilidad)
  epsFileUrl: text("eps_file_url"),
  arlFileUrl: text("arl_file_url"),
  pensionFileUrl: text("pension_file_url"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertAfiliacionSsssSchema = createInsertSchema(afiliacionesSSSS).omit({ id: true, createdAt: true, companyId: true }).extend({
  workerId: z.string().min(1, "Debe seleccionar un trabajador"),
  fecha: z.string().min(1, "La fecha de afiliación es obligatoria"),
});
export type InsertAfiliacionSsss = z.infer<typeof insertAfiliacionSsssSchema>;
export type AfiliacionSsss = typeof afiliacionesSSSS.$inferSelect;

// Verificación de Muestreo SGSS - Estándar 1.1.4
export const verificacionesMuestreoSgss = pgTable("verificaciones_muestreo_sgss", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  fecha: date("fecha").notNull(),
  periodoVerificado: text("periodo_verificado"),
  totalTrabajadores: integer("total_trabajadores").notNull(),
  totalContratistas: integer("total_contratistas").default(0),
  muestraRequerida: integer("muestra_requerida").notNull(),
  muestraVerificada: integer("muestra_verificada").default(0),
  porcentajeCumplimiento: integer("porcentaje_cumplimiento").default(0),
  observaciones: text("observaciones"),
  pilaFileUrl: text("pila_file_url"),
  verificadoPor: varchar("verificado_por").references(() => workers.id),
  estado: text("estado").default("pendiente"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertVerificacionMuestreoSgssSchema = createInsertSchema(verificacionesMuestreoSgss).omit({ id: true, createdAt: true, companyId: true });
export type InsertVerificacionMuestreoSgss = z.infer<typeof insertVerificacionMuestreoSgssSchema>;
export type VerificacionMuestreoSgss = typeof verificacionesMuestreoSgss.$inferSelect;

// Detalle de Verificación por Trabajador - Estándar 1.1.4
export const detalleVerificacionSgss = pgTable("detalle_verificacion_sgss", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  verificacionId: varchar("verificacion_id").notNull().references(() => verificacionesMuestreoSgss.id),
  workerId: varchar("worker_id").notNull().references(() => workers.id),
  tipoTrabajador: text("tipo_trabajador").default("empleado"),
  verificadoEps: boolean("verificado_eps").default(false),
  verificadoArl: boolean("verificado_arl").default(false),
  verificadoAfp: boolean("verificado_afp").default(false),
  verificadoCcf: boolean("verificado_ccf").default(false),
  agremiacionNombre: text("agremiacion_nombre"),
  agremiacionAutorizada: boolean("agremiacion_autorizada").default(false),
  observaciones: text("observaciones"),
  cumple: boolean("cumple").default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertDetalleVerificacionSgssSchema = createInsertSchema(detalleVerificacionSgss).omit({ id: true, createdAt: true });
export type InsertDetalleVerificacionSgss = z.infer<typeof insertDetalleVerificacionSgssSchema>;
export type DetalleVerificacionSgss = typeof detalleVerificacionSgss.$inferSelect;

// Trabajadores de Alto Riesgo - Módulo Planear
export const trabajadoresAltoRiesgo = pgTable("trabajadores_alto_riesgo", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  workerId: varchar("worker_id").notNull().references(() => workers.id),
  fecha: date("fecha").notNull(),
  certificadoArlUrl: text("certificado_arl_url"),
  observaciones: text("observaciones"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertTrabajadorAltoRiesgoSchema = createInsertSchema(trabajadoresAltoRiesgo).omit({ id: true, createdAt: true, companyId: true }).extend({
  workerId: z.string().min(1, "Debe seleccionar un trabajador"),
  fecha: z.string().min(1, "La fecha es obligatoria"),
});
export type InsertTrabajadorAltoRiesgo = z.infer<typeof insertTrabajadorAltoRiesgoSchema>;
export type TrabajadorAltoRiesgo = typeof trabajadoresAltoRiesgo.$inferSelect;

// Actas de Constitución del Comité de Convivencia - Módulo Planear (Resolución 3461/2025)
export const comiteConvivenciaActas = pgTable("comite_convivencia_actas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  fecha: date("fecha").notNull(),
  numeroActa: text("numero_acta").notNull(),
  notas: text("notas"),
  
  // Representantes por los trabajadores
  trabajador1WorkerId: varchar("trabajador1_worker_id").references(() => workers.id),
  trabajador1Nombre: text("trabajador1_nombre"),
  trabajador1Cedula: text("trabajador1_cedula"),
  trabajador1Tipo: text("trabajador1_tipo"),
  
  trabajador2WorkerId: varchar("trabajador2_worker_id").references(() => workers.id),
  trabajador2Nombre: text("trabajador2_nombre"),
  trabajador2Cedula: text("trabajador2_cedula"),
  trabajador2Tipo: text("trabajador2_tipo"),
  
  trabajador3WorkerId: varchar("trabajador3_worker_id").references(() => workers.id),
  trabajador3Nombre: text("trabajador3_nombre"),
  trabajador3Cedula: text("trabajador3_cedula"),
  trabajador3Tipo: text("trabajador3_tipo"),
  
  // Representantes por los empleadores
  empleador1WorkerId: varchar("empleador1_worker_id").references(() => workers.id),
  empleador1Nombre: text("empleador1_nombre"),
  empleador1Cedula: text("empleador1_cedula"),
  empleador1Tipo: text("empleador1_tipo"),
  
  empleador2WorkerId: varchar("empleador2_worker_id").references(() => workers.id),
  empleador2Nombre: text("empleador2_nombre"),
  empleador2Cedula: text("empleador2_cedula"),
  empleador2Tipo: text("empleador2_tipo"),
  
  empleador3WorkerId: varchar("empleador3_worker_id").references(() => workers.id),
  empleador3Nombre: text("empleador3_nombre"),
  empleador3Cedula: text("empleador3_cedula"),
  empleador3Tipo: text("empleador3_tipo"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertComiteConvivenciaActaSchema = createInsertSchema(comiteConvivenciaActas).omit({ id: true, createdAt: true, companyId: true, numeroActa: true }).extend({
  fecha: z.string().min(1, "La fecha es obligatoria"),
});
export type InsertComiteConvivenciaActa = z.infer<typeof insertComiteConvivenciaActaSchema>;
export type ComiteConvivenciaActa = typeof comiteConvivenciaActas.$inferSelect;

// Programa de Capacitación y Prevención - Módulo Planear
export const programasCapacitacion = pgTable("programas_capacitacion", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  fecha: date("fecha").notNull(),
  titulo: text("titulo").notNull(),
  archivoUrl: text("archivo_url"),
  archivoNombre: text("archivo_nombre"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertProgramaCapacitacionSchema = createInsertSchema(programasCapacitacion).omit({ id: true, createdAt: true, companyId: true }).extend({
  fecha: z.coerce.date(),
  titulo: z.string().min(1, "El título del programa es obligatorio"),
});
export type InsertProgramaCapacitacion = z.infer<typeof insertProgramaCapacitacionSchema>;
export type ProgramaCapacitacion = typeof programasCapacitacion.$inferSelect;

// ==================== CATÁLOGO DE CAPACITACIONES SST (Normativa Colombiana) ====================

// Catálogo de capacitaciones predefinidas según normativa colombiana
export const capacitacionCategoriaEnum = pgEnum("capacitacion_categoria", [
  "seguridad",       // Seguridad Industrial
  "salud",           // Salud Ocupacional
  "emergencias",     // Emergencias y Primeros Auxilios
  "normatividad",    // Normatividad SST
  "especializadas"   // Capacitaciones Especializadas
]);

export const capacitacionNivelEnum = pgEnum("capacitacion_nivel", [
  "basico",
  "intermedio", 
  "avanzado"
]);

export const capacitacionesCatalogo = pgTable("capacitaciones_catalogo", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  codigo: varchar("codigo", { length: 20 }).notNull().unique(),
  titulo: text("titulo").notNull(),
  descripcion: text("descripcion").notNull(),
  duracionHoras: integer("duracion_horas").notNull(),
  validezMeses: integer("validez_meses"), // null = sin vencimiento
  categoria: capacitacionCategoriaEnum("categoria").notNull(),
  nivel: capacitacionNivelEnum("nivel").notNull(),
  obligatoria: boolean("obligatoria").notNull().default(false),
  normativa: text("normativa"), // Resolución/Decreto aplicable
  activo: boolean("activo").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertCapacitacionCatalogoSchema = createInsertSchema(capacitacionesCatalogo).omit({ id: true, createdAt: true });
export type InsertCapacitacionCatalogo = z.infer<typeof insertCapacitacionCatalogoSchema>;
export type CapacitacionCatalogo = typeof capacitacionesCatalogo.$inferSelect;

// Eventos/Sesiones de capacitación programadas por empresa
export const capacitacionEventoEstadoEnum = pgEnum("capacitacion_evento_estado", [
  "programado",   // Próximo a realizarse
  "en_curso",     // En ejecución
  "completado",   // Finalizado exitosamente
  "cancelado",    // Cancelado
  "reprogramado"  // Reprogramado para otra fecha
]);

export const capacitacionEventos = pgTable("capacitacion_eventos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  catalogoId: varchar("catalogo_id").notNull().references(() => capacitacionesCatalogo.id),
  
  // Copia inmutable de datos del catálogo al momento de crear el evento
  codigoCurso: varchar("codigo_curso", { length: 20 }).notNull(),
  tituloCurso: text("titulo_curso").notNull(),
  descripcionCurso: text("descripcion_curso").notNull(),
  duracionHoras: integer("duracion_horas").notNull(),
  categoria: capacitacionCategoriaEnum("categoria").notNull(),
  nivel: capacitacionNivelEnum("nivel").notNull(),
  obligatoria: boolean("obligatoria").notNull(),
  normativa: text("normativa"),
  
  // Datos de programación
  fechaInicio: date("fecha_inicio").notNull(),
  fechaFin: date("fecha_fin"),
  horaInicio: text("hora_inicio"), // HH:MM
  horaFin: text("hora_fin"),       // HH:MM
  lugar: text("lugar"),
  instructor: text("instructor"),
  
  // Estado y seguimiento
  estado: capacitacionEventoEstadoEnum("estado").notNull().default("programado"),
  observaciones: text("observaciones"),
  
  // Documentación
  archivoUrl: text("archivo_url"),
  archivoNombre: text("archivo_nombre"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertCapacitacionEventoSchema = createInsertSchema(capacitacionEventos).omit({ 
  id: true, createdAt: true, updatedAt: true, companyId: true 
}).extend({
  fechaInicio: z.string().min(1, "Fecha de inicio requerida"),
  fechaFin: z.string().nullish(),
  horaInicio: z.string().nullish(),
  horaFin: z.string().nullish(),
  lugar: z.string().nullish(),
  instructor: z.string().nullish(),
  observaciones: z.string().nullish(),
});
export type InsertCapacitacionEvento = z.infer<typeof insertCapacitacionEventoSchema>;
export type CapacitacionEvento = typeof capacitacionEventos.$inferSelect;

// Asistentes a eventos de capacitación
export const capacitacionAsistenteEstadoEnum = pgEnum("capacitacion_asistente_estado", [
  "invitado",     // Invitado, pendiente confirmar
  "confirmado",   // Confirmó asistencia
  "asistio",      // Asistió a la capacitación
  "ausente",      // No asistió sin excusa
  "excusado"      // No asistió pero con excusa válida
]);

export const capacitacionAsistentes = pgTable("capacitacion_asistentes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventoId: varchar("evento_id").notNull().references(() => capacitacionEventos.id, { onDelete: 'cascade' }),
  workerId: varchar("worker_id").notNull().references(() => workers.id),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  
  estado: capacitacionAsistenteEstadoEnum("estado").notNull().default("invitado"),
  horasAsistidas: integer("horas_asistidas"),
  calificacion: integer("calificacion"), // 0-100
  certificadoUrl: text("certificado_url"),
  observaciones: text("observaciones"),
  
  fechaConfirmacion: timestamp("fecha_confirmacion"),
  fechaAsistencia: timestamp("fecha_asistencia"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertCapacitacionAsistenteSchema = createInsertSchema(capacitacionAsistentes).omit({ 
  id: true, createdAt: true, companyId: true 
});
export type InsertCapacitacionAsistente = z.infer<typeof insertCapacitacionAsistenteSchema>;
export type CapacitacionAsistente = typeof capacitacionAsistentes.$inferSelect;

// Curso de 50 Horas - Módulo Planear
export const curso50Horas = pgTable("curso_50_horas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  archivoUrl: text("archivo_url"),
  archivoNombre: text("archivo_nombre"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertCurso50HorasSchema = createInsertSchema(curso50Horas).omit({ id: true, createdAt: true, updatedAt: true, companyId: true });
export type InsertCurso50Horas = z.infer<typeof insertCurso50HorasSchema>;
export type Curso50Horas = typeof curso50Horas.$inferSelect;

// Email Notifications table - Sistema de alertas de renovación
export const notificationTypeEnum = pgEnum("notification_type", ["exam_renewal", "training_renewal"]);
export const notificationStatusEnum = pgEnum("notification_status", ["pending", "sent", "failed"]);

export const emailNotifications = pgTable("email_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  workerId: varchar("worker_id").notNull().references(() => workers.id),
  type: notificationTypeEnum("type").notNull(),
  referenceId: varchar("reference_id").notNull(), // ID del examen o capacitación
  scheduledDate: date("scheduled_date").notNull(), // Fecha programada para envío
  sentDate: timestamp("sent_date"), // Fecha real de envío
  status: notificationStatusEnum("status").notNull().default("pending"),
  recipientEmail: text("recipient_email").notNull(),
  subject: text("subject").notNull(),
  errorMessage: text("error_message"), // Error si falla el envío
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertEmailNotificationSchema = createInsertSchema(emailNotifications).omit({ id: true, createdAt: true });
export type InsertEmailNotification = z.infer<typeof insertEmailNotificationSchema>;
export type EmailNotification = typeof emailNotifications.$inferSelect;

// ==================== GESTIÓN AMBIENTAL OCUPACIONAL (Resolución 0312/2019) ====================

// Mediciones Ambientales Ocupacionales
export const measurementTypeEnum = pgEnum("measurement_type", [
  "ruido",              // Ruido ocupacional
  "iluminacion",        // Iluminación
  "temperatura",        // Temperatura y humedad
  "agentes_quimicos",   // Concentración de agentes químicos
  "material_particulado", // Material particulado
  "vibraciones"         // Vibraciones
]);

export const measurementStatusEnum = pgEnum("measurement_status", [
  "conforme",           // Dentro de límites permisibles
  "no_conforme",        // Fuera de límites - requiere acción
  "pendiente_analisis"  // Análisis pendiente
]);

export const environmentalMeasurements = pgTable("environmental_measurements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  measurementType: measurementTypeEnum("measurement_type").notNull(),
  area: text("area").notNull(), // Área o puesto de trabajo medido
  measurementDate: date("measurement_date").notNull(),
  measuredBy: text("measured_by").notNull(), // Responsable de la medición
  
  // Valores medidos (se usan según el tipo)
  valueNumeric: text("value_numeric"), // Valor numérico (ej: 85 dB, 300 lux)
  unit: text("unit"), // Unidad de medida (dB, lux, °C, ppm, mg/m³, m/s²)
  legalLimit: text("legal_limit"), // Límite legal aplicable
  
  // Datos adicionales
  equipment: text("equipment"), // Equipo utilizado
  calibrationDate: date("calibration_date"), // Última calibración del equipo
  temperature: text("temperature"), // Temperatura ambiente al medir
  humidity: text("humidity"), // Humedad relativa al medir
  
  // Evaluación y acciones
  status: measurementStatusEnum("status").notNull().default("pendiente_analisis"),
  observations: text("observations"), // Observaciones adicionales
  correctiveActions: text("corrective_actions"), // Acciones correctivas si es no conforme
  
  // Archivo adjunto (reporte técnico)
  reportUrl: text("report_url"), // URL del reporte de medición
  reportName: text("report_name"), // Nombre del archivo
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertEnvironmentalMeasurementSchema = createInsertSchema(environmentalMeasurements)
  .omit({ id: true, createdAt: true, companyId: true })
  .extend({
    measurementDate: z.coerce.date(),
    calibrationDate: z.coerce.date().optional(),
    area: z.string().min(1, "El área de medición es obligatoria"),
    measuredBy: z.string().min(1, "El responsable de medición es obligatorio"),
  });
export type InsertEnvironmentalMeasurement = z.infer<typeof insertEnvironmentalMeasurementSchema>;
export type EnvironmentalMeasurement = typeof environmentalMeasurements.$inferSelect;

// Inventario de Sustancias Químicas Peligrosas
export const hazardClassEnum = pgEnum("hazard_class", [
  "cancerígena",           // Sustancia cancerígena
  "toxicidad_aguda",       // Toxicidad aguda
  "corrosiva",             // Corrosiva
  "inflamable",            // Inflamable
  "explosiva",             // Explosiva
  "oxidante",              // Oxidante
  "irritante",             // Irritante
  "sensibilizante",        // Sensibilizante
  "mutagena",              // Mutagénica
  "teratogenica",          // Teratogénica
  "otro"                   // Otra clasificación
]);

export const hazardousSubstances = pgTable("hazardous_substances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  
  // Identificación de la sustancia
  commercialName: text("commercial_name").notNull(), // Nombre comercial
  chemicalName: text("chemical_name"), // Nombre químico
  casNumber: text("cas_number"), // Número CAS (Chemical Abstracts Service)
  
  // Clasificación de peligro
  hazardClass: hazardClassEnum("hazard_class").array().notNull(), // Puede tener múltiples clasificaciones
  
  // Ubicación y uso
  storageLocation: text("storage_location").notNull(), // Ubicación de almacenamiento
  usageArea: text("usage_area"), // Área donde se utiliza
  quantity: text("quantity"), // Cantidad almacenada
  unit: text("unit"), // Unidad (litros, kg, etc.)
  
  // Información de seguridad
  supplier: text("supplier"), // Proveedor
  emergencyPhone: text("emergency_phone"), // Teléfono de emergencias
  
  // Hoja de seguridad (SDS/MSDS)
  sdsUrl: text("sds_url"), // URL de la ficha de seguridad
  sdsName: text("sds_name"), // Nombre del archivo
  sdsUpdateDate: date("sds_update_date"), // Fecha de actualización de la FDS
  
  // Controles y EPP requerido
  controlMeasures: text("control_measures"), // Medidas de control
  requiredPpe: text("required_ppe"), // EPP requerido
  
  // Estado
  isActive: integer("is_active").notNull().default(1), // 1 = en uso, 0 = descontinuada
  
  observations: text("observations"), // Observaciones adicionales
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertHazardousSubstanceSchema = createInsertSchema(hazardousSubstances)
  .omit({ id: true, createdAt: true, companyId: true })
  .extend({
    sdsUpdateDate: z.coerce.date().optional(),
    commercialName: z.string().min(1, "El nombre comercial es obligatorio"),
    storageLocation: z.string().min(1, "La ubicación de almacenamiento es obligatoria"),
  });
export type InsertHazardousSubstance = z.infer<typeof insertHazardousSubstanceSchema>;
export type HazardousSubstance = typeof hazardousSubstances.$inferSelect;

// Sistemas de Vigilancia Epidemiológica Ocupacional (SVE)
// Según Resolución 0312/2019 y normativa colombiana vigente
export const sveRiskTypeEnum = pgEnum("sve_risk_type", [
  "biomecanico", // Desórdenes Musculoesqueléticos (DME)
  "psicosocial", // Estrés laboral, factores psicosociales
  "auditivo", // Conservación auditiva - Hipoacusia por ruido
  "quimico", // Exposición a sustancias químicas
  "biologico", // Infecciones ocupacionales
  "visual", // Conservación visual
  "cardiovascular", // Riesgo cardiovascular
  "respiratorio", // Material particulado, gases
]);

export const sveProgramStatusEnum = pgEnum("sve_program_status", [
  "activo",
  "inactivo",
  "en_revision",
]);

export const svePrograms = pgTable("sve_programs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  
  // Información básica del programa
  name: text("name").notNull(), // Nombre del programa SVE
  riskType: sveRiskTypeEnum("risk_type").notNull(), // Tipo de riesgo
  objective: text("objective").notNull(), // Objetivo del programa
  
  // Población y alcance
  targetPopulation: text("target_population").notNull(), // Descripción de población objetivo
  inclusionCriteria: text("inclusion_criteria"), // Criterios de inclusión
  exclusionCriteria: text("exclusion_criteria"), // Criterios de exclusión
  
  // Protocolo y actividades
  protocol: text("protocol"), // Descripción del protocolo de vigilancia
  preventionActivities: text("prevention_activities"), // Actividades de prevención
  controlMeasures: text("control_measures"), // Medidas de control
  
  // Responsabilidad y gestión
  responsibleName: text("responsible_name").notNull(), // Responsable del programa
  responsiblePosition: text("responsible_position"), // Cargo del responsable
  
  // Indicadores
  indicators: text("indicators"), // Indicadores de gestión del programa
  
  // Fechas y estado
  startDate: date("start_date").notNull(), // Fecha de inicio
  reviewDate: date("review_date"), // Fecha de última revisión
  status: sveProgramStatusEnum("status").notNull().default("activo"),
  
  observations: text("observations"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertSveProgramSchema = createInsertSchema(svePrograms)
  .omit({ id: true, createdAt: true, companyId: true })
  .extend({
    startDate: z.coerce.date(),
    reviewDate: z.coerce.date().optional(),
  });
export type InsertSveProgram = z.infer<typeof insertSveProgramSchema>;
export type SveProgram = typeof svePrograms.$inferSelect;

// Casos individuales de vigilancia epidemiológica
export const sveCaseStatusEnum = pgEnum("sve_case_status", [
  "normal", // Sin hallazgos significativos
  "vigilancia", // Requiere seguimiento
  "caso_confirmado", // Caso confirmado de enfermedad/condición
  "caso_cerrado", // Caso cerrado
]);

export const sveEvaluationTypeEnum = pgEnum("sve_evaluation_type", [
  "medica", // Evaluación médica ocupacional
  "higienica", // Medición higiénica (ambiente)
  "seguimiento", // Seguimiento de caso
  "inicial", // Evaluación inicial
]);

export const sveCases = pgTable("sve_cases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  programId: varchar("program_id").notNull().references(() => svePrograms.id, { onDelete: "cascade" }),
  workerId: text("worker_id").notNull(), // Número de identificación del trabajador (cédula)
  
  // Información de la evaluación
  evaluationDate: date("evaluation_date").notNull(), // Fecha de evaluación
  evaluationType: sveEvaluationTypeEnum("evaluation_type").notNull(), // Tipo de evaluación
  evaluatedBy: text("evaluated_by").notNull(), // Profesional que evaluó
  
  // Resultados
  findings: text("findings"), // Hallazgos
  results: text("results"), // Resultados de la evaluación
  classification: sveCaseStatusEnum("classification").notNull().default("normal"), // Clasificación del caso
  
  // Seguimiento y acciones
  recommendations: text("recommendations"), // Recomendaciones
  followUpDate: date("follow_up_date"), // Fecha de próximo seguimiento
  interventions: text("interventions"), // Intervenciones realizadas
  
  // Datos adicionales según tipo de riesgo
  additionalData: text("additional_data"), // JSON con datos específicos
  
  observations: text("observations"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertSveCaseSchema = createInsertSchema(sveCases)
  .omit({ id: true, createdAt: true, companyId: true })
  .extend({
    evaluationDate: z.coerce.date(),
    followUpDate: z.coerce.date().optional(),
  });
export type InsertSveCase = z.infer<typeof insertSveCaseSchema>;
export type SveCase = typeof sveCases.$inferSelect;

// ============================================
// PROGRAMA DE CAPACITACIÓN Y PREVENCIÓN SST
// Conforme a Resolución 0312/2019 y Decreto 1072/2015
// ============================================

// Programa anual de capacitación (documento maestro)
export const trainingProgramStatusEnum = pgEnum("training_program_status", [
  "borrador", // En diseño
  "aprobado", // Aprobado por dirección y COPASST
  "en_ejecucion", // En ejecución
  "completado", // Año finalizado
  "cerrado", // Cerrado y archivado
]);

export const trainingPrograms = pgTable("training_programs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  
  // Información del programa
  year: integer("year").notNull(), // Año del programa (2025, 2026, etc.)
  title: text("title").notNull(), // "Programa de Capacitación y Prevención SST 2025"
  
  // Objetivos
  generalObjective: text("general_objective").notNull(),
  specificObjectives: text("specific_objectives").notNull(), // JSON array de objetivos
  
  // Alcance y población
  scope: text("scope").notNull(), // Descripción del alcance
  targetPopulation: text("target_population").notNull(), // Descripción de población objetivo
  
  // Responsables
  responsible: text("responsible").notNull(), // Responsable principal
  copasstApproval: integer("copasst_approval").default(0), // 0 = pendiente, 1 = aprobado
  copasstApprovalDate: date("copasst_approval_date"),
  
  // Recursos
  humanResources: text("human_resources"), // Descripción de recursos humanos
  technicalResources: text("technical_resources"), // Descripción de recursos técnicos
  financialBudget: integer("financial_budget"), // Presupuesto en pesos
  
  // Metodología
  methodology: text("methodology"), // Descripción de metodología
  
  // Estado y seguimiento
  status: trainingProgramStatusEnum("status").notNull().default("borrador"),
  observations: text("observations"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertTrainingProgramSchema = createInsertSchema(trainingPrograms)
  .omit({ id: true, createdAt: true, updatedAt: true, companyId: true })
  .extend({
    year: z.number().int().min(2020).max(2100),
    copasstApprovalDate: z.coerce.date().optional(),
  });
export type InsertTrainingProgram = z.infer<typeof insertTrainingProgramSchema>;
export type TrainingProgram = typeof trainingPrograms.$inferSelect;

// Capacitaciones específicas del programa (cronograma)
export const trainingFrequencyEnum = pgEnum("training_frequency", [
  "unica", // Una sola vez
  "mensual", // Mensual
  "trimestral", // Trimestral
  "semestral", // Semestral
  "anual", // Anual
]);

export const trainingModalityEnum = pgEnum("training_modality", [
  "presencial", // Presencial
  "virtual", // Virtual
  "mixta", // Mixta (presencial + virtual)
]);

export const programTrainingStatusEnum = pgEnum("program_training_status", [
  "programada", // Programada (no ejecutada)
  "en_curso", // En ejecución
  "completada", // Completada
  "cancelada", // Cancelada
  "reprogramada", // Reprogramada
]);

export const programTrainings = pgTable("program_trainings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  programId: varchar("program_id").notNull().references(() => trainingPrograms.id, { onDelete: "cascade" }),
  
  // Información de la capacitación
  topic: text("topic").notNull(), // Tema de la capacitación
  description: text("description"), // Descripción detallada
  
  // Clasificación según normativa
  trainingCategory: text("training_category").notNull(), // "Inducción", "Prevención", "Promoción", "COPASST", "Brigada", etc.
  isObligatory: integer("is_obligatory").notNull().default(1), // 0 = no, 1 = sí (según norma)
  legalBasis: text("legal_basis"), // Resolución 0312/2019, Decreto 1072/2015, etc.
  
  // Programación
  scheduledDate: date("scheduled_date").notNull(), // Fecha programada
  scheduledTime: text("scheduled_time"), // Hora programada (HH:MM)
  duration: integer("duration").notNull(), // Duración en horas
  frequency: trainingFrequencyEnum("frequency").notNull().default("unica"),
  
  // Ejecución
  actualDate: date("actual_date"), // Fecha real de ejecución
  actualTime: text("actual_time"), // Hora real
  location: text("location"), // Lugar de la capacitación
  modality: trainingModalityEnum("modality").notNull().default("presencial"),
  
  // Responsables e instructor
  instructor: text("instructor").notNull(), // Nombre del instructor
  instructorQualifications: text("instructor_qualifications"), // Calificaciones del instructor
  responsible: text("responsible"), // Responsable de coordinar
  
  // Población objetivo
  targetAudience: text("target_audience").notNull(), // "Todos los trabajadores", "Área operativa", etc.
  estimatedAttendees: integer("estimated_attendees").notNull().default(0), // Número estimado de asistentes
  actualAttendees: integer("actual_attendees").default(0), // Número real de asistentes
  
  // Materiales y recursos
  materials: text("materials"), // Materiales didácticos utilizados
  equipment: text("equipment"), // Equipo audiovisual, etc.
  
  // Evaluación
  requiresEvaluation: integer("requires_evaluation").notNull().default(1), // 0 = no, 1 = sí
  evaluationScore: integer("evaluation_score"), // Promedio de evaluaciones (0-100)
  
  // Estado
  status: programTrainingStatusEnum("status").notNull().default("programada"),
  observations: text("observations"),
  
  // Archivos y evidencias
  attachmentUrl: text("attachment_url"), // URL de material de apoyo
  evidenceUrl: text("evidence_url"), // URL de evidencia (fotos, videos)
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertProgramTrainingSchema = createInsertSchema(programTrainings)
  .omit({ id: true, createdAt: true, updatedAt: true, companyId: true })
  .extend({
    scheduledDate: z.coerce.date(),
    actualDate: z.coerce.date().optional(),
  });
export type InsertProgramTraining = z.infer<typeof insertProgramTrainingSchema>;
export type ProgramTraining = typeof programTrainings.$inferSelect;

// Registro de asistencia detallado por capacitación
export const programTrainingAttendance = pgTable("program_training_attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  trainingId: varchar("training_id").notNull().references(() => programTrainings.id, { onDelete: "cascade" }),
  workerId: varchar("worker_id").notNull().references(() => workers.id, { onDelete: "cascade" }),
  
  // Registro de asistencia
  attended: integer("attended").notNull().default(0), // 0 = no asistió, 1 = asistió
  attendanceTime: text("attendance_time"), // Hora de llegada (HH:MM)
  departureTime: text("departure_time"), // Hora de salida (HH:MM)
  
  // Evaluación individual
  evaluationScore: integer("evaluation_score"), // Calificación individual (0-100)
  passed: integer("passed"), // 0 = no aprobó, 1 = aprobó, null = no evaluado
  
  // Certificación
  certificateIssued: integer("certificate_issued").default(0), // 0 = no emitido, 1 = emitido
  certificateNumber: text("certificate_number"), // Número de certificado
  certificateDate: date("certificate_date"), // Fecha de emisión del certificado
  
  // Observaciones
  observations: text("observations"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertProgramTrainingAttendanceSchema = createInsertSchema(programTrainingAttendance)
  .omit({ id: true, createdAt: true, companyId: true })
  .extend({
    certificateDate: z.coerce.date().optional(),
  });
export type InsertProgramTrainingAttendance = z.infer<typeof insertProgramTrainingAttendanceSchema>;
export type ProgramTrainingAttendance = typeof programTrainingAttendance.$inferSelect;

// Registros de Inducción - Evaluación completa de inducción por trabajador
export const registrosInduccion = pgTable("registros_induccion", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  workerId: varchar("worker_id").notNull().references(() => workers.id),
  
  // Información básica
  tipo: inductionTypeEnum("tipo").notNull().default("induccion"),
  fecha: date("fecha").notNull(),
  horaInicio: text("hora_inicio").notNull(), // HH:MM
  duracionMinutos: integer("duracion_minutos"), // Duración en minutos
  
  // Responsable de la inducción
  responsableNombre: text("responsable_nombre").notNull(),
  responsableLicencia: text("responsable_licencia"), // Licencia SO
  
  // Datos de seguridad social del trabajador
  eps: text("eps"),
  pension: text("pension"),
  arl: text("arl"),
  
  // Evaluación: Inducción en Seguridad y Salud en el Trabajo (JSON con ítems Sí/No)
  // Estructura: { "item1": true, "item2": false, ... }
  evaluacionSst: text("evaluacion_sst").notNull(), // JSON string
  
  // Evaluación: Reconocimiento de la sección (JSON con ítems Sí/No)
  evaluacionSeccion: text("evaluacion_seccion").notNull(), // JSON string
  
  // Factores de riesgo identificados (texto con descripción)
  factoresRiesgo: text("factores_riesgo"),
  
  // Evaluación: Conocimiento de máquinas, equipos, herramientas (JSON con ítems Sí/No)
  evaluacionMaquinas: text("evaluacion_maquinas").notNull(), // JSON string
  
  // Explicación del cargo
  cargoFuncion: text("cargo_funcion"),
  cargoObjetivo: text("cargo_objetivo"),
  cargoProceso: text("cargo_proceso"),
  
  // Evaluación del trabajador
  tieneExperiencia: integer("tiene_experiencia").notNull().default(0), // 0 = no, 1 = sí
  tiempoExperiencia: text("tiempo_experiencia"),
  observacionesExperiencia: text("observaciones_experiencia"),
  
  // Observaciones generales
  observaciones: text("observaciones"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertRegistroInduccionSchema = createInsertSchema(registrosInduccion)
  .omit({ id: true, createdAt: true, updatedAt: true, companyId: true })
  .extend({
    fecha: z.coerce.date(),
  });
export type InsertRegistroInduccion = z.infer<typeof insertRegistroInduccionSchema>;
export type RegistroInduccion = typeof registrosInduccion.$inferSelect;

// ============================================================================
// INDUCCIÓN VIRTUAL - Sistema de inducción digital para trabajadores
// ============================================================================

// Estado del contenido de inducción
export const contenidoInduccionEstadoEnum = pgEnum("contenido_induccion_estado", ["borrador", "publicado", "archivado"]);

// Tipo de contenido de inducción
export const contenidoInduccionTipoEnum = pgEnum("contenido_induccion_tipo", ["video", "documento", "presentacion", "texto"]);

// Contenido de inducción - Materiales educativos configurables por empresa
export const contenidosInduccion = pgTable("contenidos_induccion", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  
  // Información del contenido
  titulo: text("titulo").notNull(),
  descripcion: text("descripcion"),
  tipoContenido: contenidoInduccionTipoEnum("tipo_contenido").notNull().default("video"),
  
  // URL o contenido según tipo
  urlVideo: text("url_video"), // YouTube, Vimeo, etc.
  urlDocumento: text("url_documento"), // PDF, presentación
  contenidoTexto: text("contenido_texto"), // Contenido HTML/Markdown
  
  // Duración estimada en minutos
  duracionMinutos: integer("duracion_minutos").notNull().default(10),
  
  // Orden de visualización
  orden: integer("orden").notNull().default(0),
  
  // Estado
  estado: contenidoInduccionEstadoEnum("estado").notNull().default("borrador"),
  
  // Obligatorio ver para completar inducción
  obligatorio: integer("obligatorio").notNull().default(1), // 1 = sí, 0 = no
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertContenidoInduccionSchema = createInsertSchema(contenidosInduccion)
  .omit({ id: true, createdAt: true, updatedAt: true, companyId: true });
export type InsertContenidoInduccion = z.infer<typeof insertContenidoInduccionSchema>;
export type ContenidoInduccion = typeof contenidosInduccion.$inferSelect;

// Preguntas de evaluación de inducción
export const preguntasInduccion = pgTable("preguntas_induccion", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  contenidoId: varchar("contenido_id").references(() => contenidosInduccion.id), // Opcional: asociar a contenido específico
  
  // Pregunta
  pregunta: text("pregunta").notNull(),
  
  // Opciones de respuesta (JSON array)
  opciones: text("opciones").notNull(), // JSON: ["opción A", "opción B", "opción C", "opción D"]
  
  // Índice de respuesta correcta (0-based)
  respuestaCorrecta: integer("respuesta_correcta").notNull(),
  
  // Explicación de la respuesta correcta
  explicacion: text("explicacion"),
  
  // Orden de la pregunta
  orden: integer("orden").notNull().default(0),
  
  // Activa
  activa: integer("activa").notNull().default(1),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertPreguntaInduccionSchema = createInsertSchema(preguntasInduccion)
  .omit({ id: true, createdAt: true, companyId: true });
export type InsertPreguntaInduccion = z.infer<typeof insertPreguntaInduccionSchema>;
export type PreguntaInduccion = typeof preguntasInduccion.$inferSelect;

// Estado de la sesión de inducción virtual
export const sesionInduccionEstadoEnum = pgEnum("sesion_induccion_estado", ["pendiente", "en_progreso", "completada", "expirada"]);

// Sesiones de inducción virtual - Token único para cada trabajador
export const sesionesInduccionVirtual = pgTable("sesiones_induccion_virtual", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  workerId: varchar("worker_id").notNull().references(() => workers.id),
  
  // Token único para acceso (sin login)
  token: text("token").notNull().unique(),
  
  // Tipo de inducción
  tipoInduccion: inductionTypeEnum("tipo_induccion").notNull().default("induccion"),
  
  // Estado de la sesión
  estado: sesionInduccionEstadoEnum("estado").notNull().default("pendiente"),
  
  // Fechas
  fechaEnvio: timestamp("fecha_envio").notNull().default(sql`now()`),
  fechaExpiracion: timestamp("fecha_expiracion").notNull(), // Ej: 7 días después
  fechaInicio: timestamp("fecha_inicio"), // Cuando el trabajador abrió el enlace
  fechaFinalizacion: timestamp("fecha_finalizacion"), // Cuando completó todo
  
  // Progreso
  contenidosVistos: text("contenidos_vistos").notNull().default("[]"), // JSON array de IDs
  progresoEvaluacion: text("progreso_evaluacion").notNull().default("{}"), // JSON: { preguntaId: respuestaSeleccionada }
  
  // Resultados de evaluación
  puntajeEvaluacion: integer("puntaje_evaluacion"), // Porcentaje 0-100
  aprobado: integer("aprobado"), // 1 = sí, 0 = no, null = no evaluado
  
  // Firma digital
  firmaDigital: text("firma_digital"), // Base64 de la firma
  fechaFirma: timestamp("fecha_firma"),
  ipFirma: text("ip_firma"), // IP desde donde firmó
  userAgentFirma: text("user_agent_firma"), // Navegador/dispositivo
  
  // Datos adicionales capturados
  datosAdicionales: text("datos_adicionales"), // JSON con cualquier dato extra
  
  // Referencia al registro de inducción creado automáticamente
  registroInduccionId: varchar("registro_induccion_id").references(() => registrosInduccion.id),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertSesionInduccionVirtualSchema = createInsertSchema(sesionesInduccionVirtual)
  .omit({ id: true, createdAt: true, updatedAt: true, companyId: true, token: true });
export type InsertSesionInduccionVirtual = z.infer<typeof insertSesionInduccionVirtualSchema>;
export type SesionInduccionVirtual = typeof sesionesInduccionVirtual.$inferSelect;

// Políticas SST - Sistema de gestión de políticas de seguridad y salud en el trabajo
export const politicaSstEstadoEnum = pgEnum("politica_sst_estado", ["borrador", "vigente", "archivada"]);

export const politicasSst = pgTable("politicas_sst", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  
  // Metadatos del documento
  codigo: text("codigo").notNull(), // Ej: POL-SST-001
  version: text("version").notNull().default("1.0"),
  fechaEmision: date("fecha_emision").notNull(),
  fechaProximaRevision: date("fecha_proxima_revision").notNull(),
  estado: politicaSstEstadoEnum("estado").notNull().default("borrador"),
  
  // Contenido de la política (JSON para flexibilidad)
  declaracionCompromiso: text("declaracion_compromiso").notNull(),
  objetivos: text("objetivos").notNull(), // JSON array de strings
  alcance: text("alcance").notNull(),
  responsabilidades: text("responsabilidades").notNull(), // JSON object {altaDireccion, responsableSst, trabajadores}
  compromisos: text("compromisos").notNull(), // JSON array de strings
  recursos: text("recursos").notNull(),
  revisionComunicacion: text("revision_comunicacion").notNull(),
  
  // Firmas
  representanteLegal: text("representante_legal").notNull(),
  cedulaRepresentante: text("cedula_representante").notNull(),
  responsableSst: text("responsable_sst").notNull(),
  licenciaSst: text("licencia_sst"),
  fechaFirma: date("fecha_firma").notNull(),
  
  // Control de comunicación
  comunicada: integer("comunicada").notNull().default(0), // 0 = no, 1 = sí
  fechaComunicacion: date("fecha_comunicacion"),
  observaciones: text("observaciones"),
  
  // Campos de aprobación vinculados a trabajadores
  elaboradoPorId: varchar("elaborado_por_id").references(() => workers.id),
  autorizadoPorId: varchar("autorizado_por_id").references(() => workers.id),
  aprobadoPorId: varchar("aprobado_por_id").references(() => workers.id),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertPoliticaSstSchema = createInsertSchema(politicasSst)
  .omit({ id: true, createdAt: true, updatedAt: true, companyId: true })
  .extend({
    fechaEmision: z.coerce.date(),
    fechaProximaRevision: z.coerce.date(),
    fechaFirma: z.coerce.date(),
    fechaComunicacion: z.coerce.date().optional().nullable(),
  });
export type InsertPoliticaSst = z.infer<typeof insertPoliticaSstSchema>;
export type PoliticaSst = typeof politicasSst.$inferSelect;

// ============================================================================
// MÓDULO DE EVALUACIÓN INICIAL DEL SG-SST (Resolución 0312/2019)
// ============================================================================

// Enums para Evaluación SST
export const nivelCumplimientoEnum = pgEnum("nivel_cumplimiento", ["critico", "moderadamente-aceptable", "aceptable"]);
export const tipoEmpresaSstEnum = pgEnum("tipo_empresa_sst", ["tipo1", "tipo2", "tipo3", "tipo4"]);
export const estadoEvaluacionEnum = pgEnum("estado_evaluacion", ["en-progreso", "completada", "enviada"]);
export const prioridadMejoraEnum = pgEnum("prioridad_mejora", ["baja", "media", "alta", "critica"]);
export const estadoAccionEnum = pgEnum("estado_accion", ["pendiente", "en-proceso", "completada", "vencida"]);

// Ciclos PHVA para SG-SST
export const cicloPhvaEnum = pgEnum("ciclo_phva", ["planear", "hacer", "verificar", "actuar"]);

// Componentes SST según Resolución 0312/2019
export const componentesSst = pgTable("componentes_sst", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  numero: integer("numero").notNull().unique(), // 1-7
  nombre: text("nombre").notNull(),
  descripcion: text("descripcion"),
  pesoTotal: integer("peso_total").notNull(), // Peso porcentual (10%, 15%, 20%, 30%, etc.)
  orden: integer("orden").notNull(),
  cicloPhva: cicloPhvaEnum("ciclo_phva"), // Ciclo PHVA: planear, hacer, verificar, actuar
});

// Estándares SST - Catálogo de los 60 estándares mínimos
export const estandaresSst = pgTable("estandares_sst", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  componenteId: varchar("componente_id").notNull().references(() => componentesSst.id),
  
  numeroEstandar: text("numero_estandar").notNull().unique(), // Ej: "1.1.1", "1.1.2", etc.
  nombre: text("nombre").notNull(),
  descripcion: text("descripcion").notNull(),
  marcoLegal: text("marco_legal"), // Referencias normativas
  
  // Puntajes según tipo de empresa (NULL si no aplica)
  puntajeTipo1: integer("puntaje_tipo1"), // 10 o menos trabajadores, riesgo I-III
  puntajeTipo2: integer("puntaje_tipo2"), // 11-50 trabajadores, riesgo I-III
  puntajeTipo3: integer("puntaje_tipo3"), // Hasta 50 trabajadores, riesgo IV-V
  puntajeTipo4: integer("puntaje_tipo4"), // Más de 50 trabajadores o cualquier riesgo IV-V
  
  criteriosVerificacion: text("criterios_verificacion"), // JSON array de criterios
  modoVerificacion: text("modo_verificacion"), // Instrucciones detalladas para verificar el estándar
  orden: integer("orden").notNull(),
  activo: integer("activo").notNull().default(1), // 0 = inactivo, 1 = activo
});

// Evaluaciones SST - Evaluaciones anuales de estándares mínimos
export const evaluacionesSst = pgTable("evaluaciones_sst", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  
  // Información de la evaluación
  anio: integer("anio").notNull(), // Año de la evaluación
  mes: integer("mes").notNull().default(12), // Mes de evaluación (típicamente diciembre)
  tipoEmpresa: tipoEmpresaSstEnum("tipo_empresa").notNull(),
  estado: estadoEvaluacionEnum("estado").notNull().default("en-progreso"),
  
  // Responsable de la evaluación
  responsableNombre: text("responsable_nombre").notNull(),
  responsableCargo: text("responsable_cargo").notNull(),
  responsableLicencia: text("responsable_licencia"), // Licencia SST si aplica
  
  // Resultados calculados
  puntajeTotal: integer("puntaje_total").notNull().default(0), // Puntaje obtenido
  puntajeMaximo: integer("puntaje_maximo").notNull(), // Puntaje máximo posible
  porcentajeCumplimiento: integer("porcentaje_cumplimiento").notNull().default(0), // 0-100
  nivelCumplimiento: nivelCumplimientoEnum("nivel_cumplimiento"),
  
  // Puntajes por componente (JSON)
  // Estructura: { "1": {obtenido: 50, maximo: 100}, "2": {...}, ... }
  puntajesPorComponente: text("puntajes_por_componente"),
  
  // Puntajes por ciclo PHVA (JSON)
  // Estructura: { "planear": {obtenido: 20, maximo: 25}, "hacer": {...}, "verificar": {...}, "actuar": {...} }
  puntajesPorCicloPhva: text("puntajes_por_ciclo_phva"),
  
  // Fechas clave
  fechaEvaluacion: date("fecha_evaluacion").notNull(),
  fechaEnvio: date("fecha_envio"), // Fecha de envío a MinTrabajo
  fechaLimitePlanMejora: date("fecha_limite_plan_mejora"), // 6 meses si moderado/crítico
  
  // Observaciones generales
  observaciones: text("observaciones"),
  
  // Control de versión
  version: integer("version").notNull().default(1),
  evaluacionAnteriorId: varchar("evaluacion_anterior_id"), // Para comparaciones
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Respuestas a estándares - Respuestas individuales en una evaluación
export const respuestasEstandares = pgTable("respuestas_estandares", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  evaluacionId: varchar("evaluacion_id").notNull().references(() => evaluacionesSst.id, { onDelete: "cascade" }),
  estandarId: varchar("estandar_id").notNull().references(() => estandaresSst.id),
  
  cumple: integer("cumple").notNull(), // 0 = No cumple, 1 = Cumple
  noAplica: integer("no_aplica").notNull().default(0), // 0 = Aplica, 1 = No aplica (se otorga puntaje)
  justificacionNoAplica: text("justificacion_no_aplica"), // Requerido si noAplica = 1
  
  puntajeObtenido: integer("puntaje_obtenido").notNull(),
  puntajeMaximo: integer("puntaje_maximo").notNull(),
  
  // Evidencias y observaciones
  evidencias: text("evidencias"), // Descripción de evidencias documentales
  modoVerificacion: text("modo_verificacion"), // Cómo se verificó el cumplimiento
  observaciones: text("observaciones"),
  
  // Hallazgos si no cumple
  hallazgo: text("hallazgo"), // Descripción del incumplimiento
  causaRaiz: text("causa_raiz"), // Análisis de causa raíz
  
  // Campos de herencia/trazabilidad anual
  isInherited: integer("is_inherited").notNull().default(0), // 1 = heredada de evaluación anterior
  inheritedFromRespuestaId: varchar("inherited_from_respuesta_id"), // ID de respuesta origen
  requiresRefresh: integer("requires_refresh").notNull().default(0), // 1 = pendiente de revisión
  lastVerifiedAt: timestamp("last_verified_at"), // Última verificación/confirmación
  
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Plan de Mejora - Generado automáticamente de estándares no cumplidos
export const accionesMejora = pgTable("acciones_mejora", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  evaluacionId: varchar("evaluacion_id").notNull().references(() => evaluacionesSst.id, { onDelete: "cascade" }),
  respuestaEstandarId: varchar("respuesta_estandar_id").references(() => respuestasEstandares.id),
  
  // Información de la acción correctiva
  descripcionAccion: text("descripcion_accion").notNull(),
  objetivo: text("objetivo").notNull(), // Qué se busca lograr
  
  // Clasificación
  tipoAccion: text("tipo_accion").notNull(), // "correctiva", "preventiva", "mejora"
  prioridad: prioridadMejoraEnum("prioridad").notNull().default("media"),
  
  // Responsables y recursos
  responsable: text("responsable").notNull(),
  areaResponsable: text("area_responsable"),
  recursosNecesarios: text("recursos_necesarios"),
  presupuestoEstimado: integer("presupuesto_estimado"), // En pesos colombianos
  
  // Plazos
  fechaInicio: date("fecha_inicio").notNull(),
  fechaCompromiso: date("fecha_compromiso").notNull(),
  fechaEjecucion: date("fecha_ejecucion"), // Fecha real de ejecución
  
  // Seguimiento
  estado: estadoAccionEnum("estado").notNull().default("pendiente"),
  porcentajeAvance: integer("porcentaje_avance").notNull().default(0), // 0-100
  
  // Verificación de eficacia
  indicadorEficacia: text("indicador_eficacia"),
  resultadoEsperado: text("resultado_esperado"),
  resultadoObtenido: text("resultado_obtenido"),
  eficaz: integer("eficaz"), // NULL = no verificado, 0 = no eficaz, 1 = eficaz
  
  observaciones: text("observaciones"),
  
  // Campos de herencia/arrastre de año anterior
  carriedOverFromId: varchar("carried_over_from_id"), // ID de acción origen en evaluación anterior
  statusCarryReason: text("status_carry_reason"), // Motivo del arrastre (ej: "Pendiente de año anterior")
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Zod schemas para validación
export const insertEvaluacionSstSchema = createInsertSchema(evaluacionesSst)
  .omit({ id: true, createdAt: true, updatedAt: true, companyId: true })
  .extend({
    fechaEvaluacion: z.coerce.date(),
    fechaEnvio: z.coerce.date().optional().nullable(),
    fechaLimitePlanMejora: z.coerce.date().optional().nullable(),
    puntajeMaximo: z.number().optional(), // Calculado automáticamente en backend
  });
export type InsertEvaluacionSst = z.infer<typeof insertEvaluacionSstSchema>;
export type EvaluacionSst = typeof evaluacionesSst.$inferSelect;

export const insertRespuestaEstandarSchema = createInsertSchema(respuestasEstandares)
  .omit({ id: true, updatedAt: true });
export type InsertRespuestaEstandar = z.infer<typeof insertRespuestaEstandarSchema>;
export type RespuestaEstandar = typeof respuestasEstandares.$inferSelect;

export const insertAccionMejoraSchema = createInsertSchema(accionesMejora)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    fechaInicio: z.coerce.date(),
    fechaCompromiso: z.coerce.date(),
    fechaEjecucion: z.coerce.date().optional().nullable(),
  });
export type InsertAccionMejora = z.infer<typeof insertAccionMejoraSchema>;
export type AccionMejora = typeof accionesMejora.$inferSelect;

export type ComponenteSst = typeof componentesSst.$inferSelect;
export type EstandarSst = typeof estandaresSst.$inferSelect;

// ============================================================================
// RECOMENDACIONES ARL Y AUTORIDADES - Estándar 7.1.4 Resolución 0312/2019
// Implementar medidas y acciones correctivas de autoridades y de ARL
// ============================================================================

export const origenRecomendacionEnum = pgEnum("origen_recomendacion", [
  "arl",                      // Administradora de Riesgos Laborales
  "ministerio_trabajo",       // Ministerio del Trabajo
  "eps",                      // Entidad Promotora de Salud
  "afp",                      // Administradora de Fondos de Pensiones
  "secretaria_salud",         // Secretaría de Salud
  "otro"                      // Otra autoridad competente
]);

export const estadoRecomendacionEnum = pgEnum("estado_recomendacion", [
  "pendiente",        // Sin iniciar
  "en_proceso",       // En implementación
  "implementada",     // Implementada (pendiente verificación)
  "verificada",       // Verificada como efectiva
  "cerrada",          // Cerrada satisfactoriamente
  "rechazada"         // Rechazada o no aplica
]);

export const tipoRecomendacionEnum = pgEnum("tipo_recomendacion", [
  "correctiva",       // Corregir situación existente
  "preventiva",       // Prevenir situación potencial
  "mejora",           // Oportunidad de mejora
  "obligatoria"       // Cumplimiento legal obligatorio
]);

export const recomendacionesArlAutoridades = pgTable("recomendaciones_arl_autoridades", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  
  // Identificación de la recomendación
  codigo: text("codigo").notNull(), // Código único interno (ej: ARL-2024-001)
  origen: origenRecomendacionEnum("origen").notNull(),
  nombreEntidad: text("nombre_entidad").notNull(), // Nombre específico (ej: "Colmena ARL", "Min. Trabajo Bogotá")
  
  // Información del documento/visita
  numeroDocumento: text("numero_documento"), // Radicado, acta, o número de referencia
  fechaDocumento: date("fecha_documento").notNull(), // Fecha del documento o visita
  fechaRecepcion: date("fecha_recepcion").notNull(), // Fecha de recepción en la empresa
  
  // Contenido de la recomendación
  tipoRecomendacion: tipoRecomendacionEnum("tipo_recomendacion").notNull(),
  descripcion: text("descripcion").notNull(), // Descripción detallada de la recomendación
  fundamentoLegal: text("fundamento_legal"), // Base normativa citada
  areaAfectada: text("area_afectada"), // Área o proceso afectado
  
  // Plazos
  fechaLimite: date("fecha_limite"), // Fecha límite de cumplimiento
  diasPlazo: integer("dias_plazo"), // Días otorgados para cumplimiento
  
  // Plan de acción
  planAccion: text("plan_accion"), // Plan para dar cumplimiento
  responsable: text("responsable").notNull(), // Responsable de implementación
  recursos: text("recursos"), // Recursos requeridos
  presupuesto: integer("presupuesto"), // Presupuesto estimado (COP)
  
  // Seguimiento
  estado: estadoRecomendacionEnum("estado").notNull().default("pendiente"),
  porcentajeAvance: integer("porcentaje_avance").notNull().default(0), // 0-100
  fechaImplementacion: date("fecha_implementacion"), // Fecha real de implementación
  
  // Verificación
  verificadoPor: text("verificado_por"), // Quién verificó
  fechaVerificacion: date("fecha_verificacion"), // Cuándo se verificó
  evidenciaCumplimiento: text("evidencia_cumplimiento"), // Descripción de evidencias
  documentoRespuesta: text("documento_respuesta"), // Radicado de respuesta a la entidad
  
  // Observaciones
  observaciones: text("observaciones"),
  
  // Vinculación con accidente/incidente (si aplica)
  accidenteId: varchar("accidente_id").references(() => accidents.id),
  
  // Auditoría
  creadoPor: varchar("creado_por").references(() => users.id),
  actualizadoPor: varchar("actualizado_por").references(() => users.id),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Seguimiento de acciones por recomendación
export const seguimientoRecomendaciones = pgTable("seguimiento_recomendaciones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  recomendacionId: varchar("recomendacion_id").notNull().references(() => recomendacionesArlAutoridades.id, { onDelete: "cascade" }),
  
  fechaSeguimiento: date("fecha_seguimiento").notNull(),
  accionRealizada: text("accion_realizada").notNull(),
  avanceReportado: integer("avance_reportado").notNull(), // 0-100
  observaciones: text("observaciones"),
  registradoPor: varchar("registrado_por").references(() => users.id),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Zod schemas para validación
export const insertRecomendacionArlAutoridadSchema = createInsertSchema(recomendacionesArlAutoridades)
  .omit({ id: true, createdAt: true, updatedAt: true, companyId: true, creadoPor: true, actualizadoPor: true })
  .extend({
    nombreEntidad: z.string().min(1, "La entidad origen es obligatoria"),
    descripcion: z.string().min(1, "La descripción de la recomendación es obligatoria"),
    fechaDocumento: z.coerce.date(),
    fechaRecepcion: z.coerce.date(),
    fechaLimite: z.coerce.date().optional().nullable(),
    fechaImplementacion: z.coerce.date().optional().nullable(),
    fechaVerificacion: z.coerce.date().optional().nullable(),
  });
export type InsertRecomendacionArlAutoridad = z.infer<typeof insertRecomendacionArlAutoridadSchema>;
export type RecomendacionArlAutoridad = typeof recomendacionesArlAutoridades.$inferSelect;

export const insertSeguimientoRecomendacionSchema = createInsertSchema(seguimientoRecomendaciones)
  .omit({ id: true, createdAt: true, registradoPor: true })
  .extend({
    fechaSeguimiento: z.coerce.date(),
  });
export type InsertSeguimientoRecomendacion = z.infer<typeof insertSeguimientoRecomendacionSchema>;
export type SeguimientoRecomendacion = typeof seguimientoRecomendaciones.$inferSelect;

// ============================================================================
// PLAN ANUAL DE TRABAJO - Sistema de Planificación SST
// ============================================================================

// Enums para Plan Anual de Trabajo
export const estadoPlanTrabajoEnum = pgEnum("estado_plan_trabajo", [
  "borrador",       // En construcción
  "aprobado",       // Aprobado por alta dirección
  "en-ejecucion",   // En ejecución - plan actualmente siendo implementado
  "vigente",        // Plan activo del año
  "cerrado",        // Año finalizado
  "archivado"       // Histórico
]);

export const programaSstEnum = pgEnum("programa_sst", [
  "identificacion-peligros",     // Identificación de peligros y valoración de riesgos (IPERC)
  "medicina-preventiva",          // Medicina preventiva y del trabajo
  "higiene-seguridad",           // Higiene y seguridad industrial
  "riesgo-psicosocial",          // Prevención riesgo psicosocial
  "seguridad-vial",              // PESV - Seguridad vial
  "emergencias",                 // Plan de prevención y emergencias
  "vigilancia-epidemiologica",   // Sistemas de vigilancia epidemiológica
  "capacitacion",                // Capacitaciones y entrenamiento
  "inspeccion",                  // Inspecciones de seguridad
  "epp",                         // Dotación y EPP
  "comites",                     // COPASST, Comité Convivencia
  "comunicacion",                // Comunicación y divulgación
  "auditoria",                   // Auditorías internas
  "mejora-continua",             // Mejoramiento continuo
  "otro"                         // Otras actividades SST
]);

export const estadoActividadEnum = pgEnum("estado_actividad", [
  "pendiente",      // No iniciada
  "en-proceso",     // En ejecución
  "completada",     // Finalizada
  "cancelada",      // Cancelada
  "reprogramada"    // Reprogramada a otra fecha
]);

export const mesesEnum = pgEnum("meses", [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
]);

// Tabla principal: Plan Anual de Trabajo
export const planesTrabajoAnual = pgTable("planes_trabajo_anual", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  
  // Información general del plan
  anio: integer("anio").notNull(),
  fechaElaboracion: date("fecha_elaboracion").notNull(),
  objetivoGeneral: text("objetivo_general").notNull(),
  alcance: text("alcance").notNull(), // Cobertura del plan (sedes, procesos, trabajadores)
  
  // Vinculación con IPERC (Estándar 1.1.2 - Resolución 0312/2019)
  matrizIpercId: varchar("matriz_iperc_id").references(() => matricesIperc.id),
  
  // Presupuesto total
  presupuestoTotal: integer("presupuesto_total"), // En pesos colombianos
  presupuestoEjecutado: integer("presupuesto_ejecutado").notNull().default(0),
  
  // Estado y aprobación
  estado: estadoPlanTrabajoEnum("estado").notNull().default("borrador"),
  
  // Responsable de elaboración
  responsableElaboracion: text("responsable_elaboracion").notNull(),
  cargoResponsable: text("cargo_responsable").notNull(),
  emailResponsable: text("email_responsable"),
  
  // Aprobación por alta dirección
  fechaAprobacion: date("fecha_aprobacion"),
  aprobadoPor: text("aprobado_por"), // Nombre del representante legal/gerente
  cargoAprobador: text("cargo_aprobador"),
  
  // Observaciones generales
  observaciones: text("observaciones"),
  
  // Métricas de seguimiento
  totalActividades: integer("total_actividades").notNull().default(0),
  actividadesCompletadas: integer("actividades_completadas").notNull().default(0),
  porcentajeCumplimiento: integer("porcentaje_cumplimiento").notNull().default(0), // 0-100
  
  // Campos de aprobación vinculados a trabajadores
  elaboradoPorId: varchar("elaborado_por_id").references(() => workers.id),
  autorizadoPorId: varchar("autorizado_por_id").references(() => workers.id),
  aprobadoPorId: varchar("aprobado_por_id").references(() => workers.id),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Tabla: Actividades del Plan Anual de Trabajo
export const actividadesPlanTrabajo = pgTable("actividades_plan_trabajo", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  planTrabajoId: varchar("plan_trabajo_id").notNull().references(() => planesTrabajoAnual.id, { onDelete: "cascade" }),
  
  // Clasificación de la actividad
  programa: programaSstEnum("programa").notNull(),
  programaOtro: text("programa_otro"), // Descripción si programa = "otro"
  
  // Descripción de la actividad
  actividad: text("actividad").notNull(),
  objetivo: text("objetivo").notNull(),
  meta: text("meta").notNull(), // Meta medible y cuantificable
  
  // Responsables
  responsable: text("responsable").notNull(),
  cargo: text("cargo").notNull(),
  areaResponsable: text("area_responsable"),
  
  // Programación temporal
  mes: mesesEnum("mes").notNull(),
  trimestre: integer("trimestre").notNull(), // 1, 2, 3, 4
  fechaInicio: date("fecha_inicio"),
  fechaFin: date("fecha_fin"),
  
  // Recursos necesarios
  recursosHumanos: text("recursos_humanos"), // Personal requerido
  recursosFinancieros: integer("recursos_financieros"), // Presupuesto en pesos
  recursosTecnicos: text("recursos_tecnicos"), // Equipos, herramientas, tecnología
  recursosAdministrativos: boolean("recursos_administrativos").default(false), // Checkbox recursos admin
  recursosFinancierosCheck: boolean("recursos_financieros_check").default(false), // Checkbox recursos financieros
  
  // Estado de ejecución por mes
  ejecutado: boolean("ejecutado").default(false), // Si la actividad del mes fue ejecutada
  
  // Indicador de cumplimiento
  indicador: text("indicador"), // Cómo medir el cumplimiento
  metaIndicador: text("meta_indicador"), // Valor esperado del indicador
  valorIndicador: text("valor_indicador"), // Valor real obtenido
  
  // Estado y avance
  estado: estadoActividadEnum("estado").notNull().default("pendiente"),
  porcentajeAvance: integer("porcentaje_avance").notNull().default(0), // 0-100
  
  // Evidencias y observaciones
  evidencias: text("evidencias"), // Descripción de evidencias documentales
  archivoUrl: text("archivo_url"), // URL de archivo de evidencia
  archivoNombre: text("archivo_nombre"),
  observaciones: text("observaciones"),
  
  // Reprogramación
  fechaReprogramacion: date("fecha_reprogramacion"),
  motivoReprogramacion: text("motivo_reprogramacion"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Zod schemas para validación
export const insertPlanTrabajoAnualSchema = createInsertSchema(planesTrabajoAnual)
  .omit({ id: true, createdAt: true, updatedAt: true, companyId: true })
  .extend({
    fechaElaboracion: z.coerce.date(),
    fechaAprobacion: z.coerce.date().optional().nullable(),
    presupuestoTotal: z.number().optional().nullable(),
    matrizIpercId: z.string().optional().nullable(),
  });
export type InsertPlanTrabajoAnual = z.infer<typeof insertPlanTrabajoAnualSchema>;
export type PlanTrabajoAnual = typeof planesTrabajoAnual.$inferSelect;

export const insertActividadPlanTrabajoSchema = createInsertSchema(actividadesPlanTrabajo)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    fechaInicio: z.coerce.date().optional().nullable(),
    fechaFin: z.coerce.date().optional().nullable(),
    fechaReprogramacion: z.coerce.date().optional().nullable(),
    recursosFinancieros: z.number().optional().nullable(),
  });
export type InsertActividadPlanTrabajo = z.infer<typeof insertActividadPlanTrabajoSchema>;
export type ActividadPlanTrabajo = typeof actividadesPlanTrabajo.$inferSelect;

// Matriz Legal - Normatividad colombiana SST
export const categoriaNormaEnum = pgEnum("categoria_norma", [
  "sistema-gestion",
  "seguridad-industrial",
  "medicina-trabajo",
  "higiene-industrial",
  "seguridad-vial",
  "riesgo-psicosocial",
  "emergencias",
  "sustancias-quimicas",
  "trabajo-alturas",
  "espacios-confinados",
  "seguridad-electrica",
  "prevencion-incendios",
  "comites-sst",
  "investigacion-incidentes",
  "capacitacion",
  "otras"
]);

export const estadoCumplimientoEnum = pgEnum("estado_cumplimiento", [
  "cumple",
  "cumple-parcialmente",
  "no-cumple",
  "no-aplica"
]);

export const matrizLegal = pgTable("matriz_legal", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  
  // Identificación de la norma
  norma: text("norma").notNull(), // Ej: "Resolución 0312 de 2019"
  fechaEmision: date("fecha_emision"), // Fecha de emisión
  entidadEmisora: text("entidad_emisora"), // Ministerio del Trabajo, etc.
  categoria: categoriaNormaEnum("categoria").notNull(),
  
  // Contenido
  titulo: text("titulo").notNull(), // Nombre descriptivo de la norma
  descripcion: text("descripcion"), // Descripción general
  articulosAplicables: text("articulos_aplicables"), // Artículos que aplican
  obligaciones: text("obligaciones").notNull(), // Qué obliga hacer
  alcance: text("alcance"), // A quién aplica
  
  // Cumplimiento
  estadoCumplimiento: estadoCumplimientoEnum("estado_cumplimiento").notNull().default("no-cumple"),
  responsableCumplimiento: text("responsable_cumplimiento"), // Cargo responsable
  periodicidad: text("periodicidad"), // Anual, mensual, permanente, etc.
  
  // Evidencias y documentación
  evidencias: text("evidencias"), // Descripción de evidencias
  documentoUrl: text("documento_url"), // URL del documento legal
  documentoNombre: text("documento_nombre"),
  
  // Control y seguimiento
  fechaUltimaVerificacion: date("fecha_ultima_verificacion"),
  fechaProximaVerificacion: date("fecha_proxima_verificacion"),
  observaciones: text("observaciones"),
  planesAccion: text("planes_accion"), // Planes si no cumple
  
  // Validación automática
  validacionAutomatica: integer("validacion_automatica").notNull().default(0), // 0 = manual, 1 = automática
  codigoValidacion: text("codigo_validacion"), // Código para identificar la regla de validación
  estadoAutomatico: estadoCumplimientoEnum("estado_automatico"), // Estado calculado automáticamente
  ultimaValidacionAutomatica: timestamp("ultima_validacion_automatica"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertMatrizLegalSchema = createInsertSchema(matrizLegal)
  .omit({ id: true, createdAt: true, updatedAt: true, companyId: true })
  .extend({
    fechaEmision: z.coerce.date().optional().nullable(),
    fechaUltimaVerificacion: z.coerce.date().optional().nullable(),
    fechaProximaVerificacion: z.coerce.date().optional().nullable(),
  });
export type InsertMatrizLegal = z.infer<typeof insertMatrizLegalSchema>;
export type MatrizLegal = typeof matrizLegal.$inferSelect;

// Objetivos e Indicadores SST - Gestión Integral (Decreto 1072 de 2015, Art. 2.2.4.6.19-22)

// Estado del objetivo
export const estadoObjetivoEnum = pgEnum("estado_objetivo", [
  "activo",
  "en-revision",
  "cumplido",
  "no-cumplido",
  "cancelado",
  "suspendido"
]);

// Tipo de indicador según Decreto 1072
export const tipoIndicadorEnum = pgEnum("tipo_indicador", [
  "estructura",  // Miden capacidad técnico-administrativa (Art. 2.2.4.6.20)
  "proceso",     // Miden ejecución de actividades (Art. 2.2.4.6.21)
  "resultado"    // Miden logros alcanzados (Art. 2.2.4.6.22)
]);

// Frecuencia de medición
export const frecuenciaIndicadorEnum = pgEnum("frecuencia_indicador", [
  "diaria",
  "semanal",
  "quincenal",
  "mensual",
  "bimestral",
  "trimestral",
  "semestral",
  "anual"
]);

// Objetivos SST
export const objetivosSst = pgTable("objetivos_sst", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  
  // Definición del objetivo (SMART)
  nombre: text("nombre").notNull(), // Nombre corto del objetivo
  descripcion: text("descripcion").notNull(), // Descripción detallada
  meta: text("meta").notNull(), // Meta cuantificable (ej: "Reducir AT en 20%")
  valorMeta: integer("valor_meta"), // Valor numérico de la meta (ej: 20 para 20%)
  
  // Ámbito y responsabilidad
  area: text("area"), // Área de aplicación
  responsable: text("responsable").notNull(), // Cargo del responsable
  
  // Clasificación
  categoriaObjetivo: text("categoria_objetivo"), // Prevención AT, reducción riesgos, etc.
  alineadoConNorma: text("alineado_con_norma"), // Norma(s) con la que se alinea
  
  // Control y seguimiento
  anio: integer("anio").notNull(), // Año del objetivo
  frecuenciaRevision: frecuenciaIndicadorEnum("frecuencia_revision").notNull().default("trimestral"),
  estado: estadoObjetivoEnum("estado").notNull().default("activo"),
  
  // Fechas
  fechaInicio: date("fecha_inicio").notNull(),
  fechaFin: date("fecha_fin").notNull(),
  fechaUltimaRevision: date("fecha_ultima_revision"),
  
  // Observaciones
  observaciones: text("observaciones"),
  planesAccion: text("planes_accion"), // Planes de acción si no se cumple
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertObjetivoSstSchema = createInsertSchema(objetivosSst)
  .omit({ id: true, createdAt: true, updatedAt: true, companyId: true })
  .extend({
    nombre: z.string().min(1, "El nombre del objetivo es obligatorio"),
    meta: z.string().min(1, "La meta es obligatoria"),
    responsable: z.string().min(1, "El responsable es obligatorio"),
    fechaInicio: z.coerce.date(),
    fechaFin: z.coerce.date(),
    fechaUltimaRevision: z.coerce.date().optional().nullable(),
    valorMeta: z.number().optional().nullable(),
  });
export type InsertObjetivoSst = z.infer<typeof insertObjetivoSstSchema>;
export type ObjetivoSst = typeof objetivosSst.$inferSelect;

// Indicadores SST
export const indicadoresSst = pgTable("indicadores_sst", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  objetivoId: varchar("objetivo_id").references(() => objetivosSst.id), // Opcional: vinculado a un objetivo
  
  // Clasificación
  tipo: tipoIndicadorEnum("tipo").notNull(), // Estructura, proceso o resultado
  
  // Ficha técnica del indicador (7 variables obligatorias)
  nombre: text("nombre").notNull(), // Nombre del indicador
  definicion: text("definicion").notNull(), // Qué mide el indicador
  interpretacion: text("interpretacion").notNull(), // Cómo interpretar el resultado
  formula: text("formula").notNull(), // Fórmula de cálculo
  fuenteInformacion: text("fuente_informacion").notNull(), // De dónde se obtienen los datos
  
  // Meta y seguimiento
  meta: text("meta").notNull(), // Valor esperado (ej: "≥ 90%", "< 5")
  valorMeta: integer("valor_meta"), // Valor numérico de la meta si aplica
  unidadMedida: text("unidad_medida"), // %, número, días, etc.
  frecuenciaMedicion: frecuenciaIndicadorEnum("frecuencia_medicion").notNull(),
  responsables: text("responsables").notNull(), // Quién debe conocer el resultado
  
  // Para indicadores de resultado (NTC-3701, NTC-3793)
  esCalculoAutomatico: integer("es_calculo_automatico").notNull().default(0), // 1 = se calcula automáticamente
  codigoCalculo: text("codigo_calculo"), // IF, IS, ILI, AUSENTISMO, etc.
  
  // Vinculación con Matriz Legal
  normasRelacionadas: text("normas_relacionadas"), // IDs de normas de matriz legal (JSON array)
  
  // Estado
  activo: integer("activo").notNull().default(1), // 0 = inactivo, 1 = activo
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertIndicadorSstSchema = createInsertSchema(indicadoresSst)
  .omit({ id: true, createdAt: true, updatedAt: true, companyId: true })
  .extend({
    valorMeta: z.number().optional().nullable(),
  });
export type InsertIndicadorSst = z.infer<typeof insertIndicadorSstSchema>;
export type IndicadorSst = typeof indicadoresSst.$inferSelect;

// Mediciones de Indicadores
export const medicionesIndicadores = pgTable("mediciones_indicadores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  indicadorId: varchar("indicador_id").notNull().references(() => indicadoresSst.id, { onDelete: "cascade" }),
  
  // Medición
  periodo: text("periodo").notNull(), // Ej: "2025-Q1", "2025-01", "2025"
  fechaMedicion: date("fecha_medicion").notNull(),
  valorMedido: text("valor_medido").notNull(), // Valor como texto para flexibilidad
  valorNumerico: integer("valor_numero"), // Valor numérico si aplica, para gráficas
  
  // Análisis
  cumpleMeta: integer("cumple_meta"), // 0 = no cumple, 1 = cumple, null = no aplica
  desviacion: integer("desviacion"), // % de desviación respecto a la meta
  analisis: text("analisis"), // Análisis del resultado
  accionesCorrectivas: text("acciones_correctivas"), // Acciones si no cumple
  
  // Responsable de la medición
  responsableMedicion: text("responsable_medicion"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertMedicionIndicadorSchema = createInsertSchema(medicionesIndicadores)
  .omit({ id: true, createdAt: true, updatedAt: true, companyId: true })
  .extend({
    fechaMedicion: z.coerce.date(),
    valorNumerico: z.number().optional().nullable(),
    cumpleMeta: z.number().optional().nullable(),
    desviacion: z.number().optional().nullable(),
  });
export type InsertMedicionIndicador = z.infer<typeof insertMedicionIndicadorSchema>;
export type MedicionIndicador = typeof medicionesIndicadores.$inferSelect;

// Datos base para cálculo automático de indicadores (NTC-3701/3793)
// Almacena datos agregados por periodo para calcular IF, IS, ILI, AUSENTISMO
export const datosCalculoIndicadores = pgTable("datos_calculo_indicadores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  
  periodo: text("periodo").notNull(), // "2025-Q1", "2025-01", etc. (único por compañía)
  
  // Datos para cálculos
  numeroTrabajadores: integer("numero_trabajadores").notNull().default(0), // Trabajadores en el periodo
  horasTrabajadas: integer("horas_trabajadas").notNull().default(0), // Horas hombre totales (HHT)
  numeroAccidentes: integer("numero_accidentes").notNull().default(0), // Total accidentes en periodo
  diasPerdidos: integer("dias_perdidos").notNull().default(0), // Días de incapacidad por accidentes
  diasAusencia: integer("dias_ausencia").notNull().default(0), // Días de ausencia totales (ausentismo)
  diasTrabajados: integer("dias_trabajados").notNull().default(0), // Días laborables en el periodo
  
  // Observaciones
  observaciones: text("observaciones"), // Notas adicionales del periodo
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertDatosCalculoSchema = createInsertSchema(datosCalculoIndicadores)
  .omit({ id: true, createdAt: true, updatedAt: true, companyId: true });
export type InsertDatosCalculo = z.infer<typeof insertDatosCalculoSchema>;
export type DatosCalculo = typeof datosCalculoIndicadores.$inferSelect;

// ============================================================================
// EVALUACIÓN DE PROVEEDORES Y CONTRATISTAS SST (Decreto 1072/2015, Res. 0312/2019)
// ============================================================================

// Tipo de proveedor/contratista
export const tipoProveedorEnum = pgEnum("tipo_proveedor", [
  "proveedor",           // Proveedor de bienes/servicios
  "contratista",         // Contratista de obras o servicios
  "subcontratista",      // Subcontratista
  "temporal",            // Empresa temporal
]);

// Estado del proveedor
export const estadoProveedorEnum = pgEnum("estado_proveedor", [
  "evaluacion",          // En evaluación inicial
  "aprobado",            // Aprobado para contratar
  "condicional",         // Aprobado con condiciones
  "rechazado",           // Rechazado
  "inactivo",            // Inactivo (no se contrata actualmente)
]);

// Estado de evaluación de proveedor
export const estadoEvaluacionProveedorEnum = pgEnum("estado_evaluacion_proveedor", [
  "pendiente",           // Evaluación pendiente
  "en_proceso",          // En proceso de evaluación
  "completada",          // Evaluación completada
  "vencida",             // Evaluación vencida (requiere re-evaluación)
]);

// Nivel de riesgo del servicio
export const nivelRiesgoServicioEnum = pgEnum("nivel_riesgo_servicio", [
  "critico",             // Servicio crítico de alto riesgo
  "alto",                // Alto riesgo
  "medio",               // Riesgo medio
  "bajo",                // Bajo riesgo
]);

// Proveedores y Contratistas
export const proveedoresContratistas = pgTable("proveedores_contratistas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  
  // Información básica
  razonSocial: text("razon_social").notNull(),
  nit: text("nit").notNull(),
  tipoProveedor: tipoProveedorEnum("tipo_proveedor").notNull(),
  tipoServicio: text("tipo_servicio").notNull(), // Tipo de servicio/bien que provee
  nivelRiesgoServicio: nivelRiesgoServicioEnum("nivel_riesgo_servicio").notNull().default("medio"),
  
  // Contacto
  representanteLegal: text("representante_legal"),
  direccion: text("direccion"),
  telefono: text("telefono"),
  email: text("email"),
  ciudad: text("ciudad"),
  
  // Información SST
  nombreArl: text("nombre_arl"), // ARL a la que está afiliado
  numeroTrabajadores: integer("numero_trabajadores").notNull().default(1),
  nivelRiesgoEmpresa: riskLevelEnum("nivel_riesgo_empresa"), // Nivel de riesgo de la empresa
  
  // Estado y calificación
  estado: estadoProveedorEnum("estado").notNull().default("evaluacion"),
  ultimaCalificacion: integer("ultima_calificacion"), // Última calificación (0-100)
  fechaUltimaEvaluacion: date("fecha_ultima_evaluacion"),
  fechaProximaReevaluacion: date("fecha_proxima_reevaluacion"),
  
  // Observaciones
  observaciones: text("observaciones"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertProveedorContratistaSchema = createInsertSchema(proveedoresContratistas)
  .omit({ id: true, createdAt: true, updatedAt: true, companyId: true })
  .extend({
    numeroTrabajadores: z.number().min(1),
    ultimaCalificacion: z.number().min(0).max(100).optional().nullable(),
    fechaUltimaEvaluacion: z.coerce.date().optional().nullable(),
    fechaProximaReevaluacion: z.coerce.date().optional().nullable(),
  });
export type InsertProveedorContratista = z.infer<typeof insertProveedorContratistaSchema>;
export type ProveedorContratista = typeof proveedoresContratistas.$inferSelect;

// Evaluaciones de Proveedores
export const evaluacionesProveedores = pgTable("evaluaciones_proveedores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  proveedorId: varchar("proveedor_id").notNull().references(() => proveedoresContratistas.id, { onDelete: "cascade" }),
  
  // Información de la evaluación
  fechaEvaluacion: date("fecha_evaluacion").notNull(),
  tipoEvaluacion: text("tipo_evaluacion").notNull(), // "inicial", "seguimiento", "reevaluacion"
  evaluador: text("evaluador").notNull(), // Responsable de la evaluación
  
  // Resultados
  puntajeTotal: integer("puntaje_total").notNull().default(0), // Suma de todos los criterios (0-100)
  puntajeMaximo: integer("puntaje_maximo").notNull().default(100),
  porcentajeCumplimiento: integer("porcentaje_cumplimiento").notNull().default(0),
  
  // Clasificación según puntaje
  clasificacion: text("clasificacion"), // "excelente", "bueno", "regular", "malo"
  
  // Estado y decisión
  estado: estadoEvaluacionProveedorEnum("estado").notNull().default("pendiente"),
  aprobado: integer("aprobado"), // 0 = rechazado, 1 = aprobado, null = pendiente
  observaciones: text("observaciones"),
  recomendaciones: text("recomendaciones"),
  planMejora: text("plan_mejora"), // Plan de mejora si no cumple
  
  // Próxima evaluación
  fechaProximaEvaluacion: date("fecha_proxima_evaluacion"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertEvaluacionProveedorSchema = createInsertSchema(evaluacionesProveedores)
  .omit({ id: true, createdAt: true, updatedAt: true, companyId: true })
  .extend({
    fechaEvaluacion: z.coerce.date(),
    puntajeTotal: z.number().min(0).max(100),
    porcentajeCumplimiento: z.number().min(0).max(100),
    aprobado: z.number().optional().nullable(),
    fechaProximaEvaluacion: z.coerce.date().optional().nullable(),
  });
export type InsertEvaluacionProveedor = z.infer<typeof insertEvaluacionProveedorSchema>;
export type EvaluacionProveedor = typeof evaluacionesProveedores.$inferSelect;

// Criterios de Evaluación de Proveedores (configurables por empresa)
export const criteriosEvaluacionProveedor = pgTable("criterios_evaluacion_proveedor", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  
  // Criterio
  nombre: text("nombre").notNull(),
  descripcion: text("descripcion"),
  categoria: text("categoria").notNull(), // "certificacion_arl", "estandares_minimos", "afiliacion", "documentacion", etc.
  puntajeMaximo: integer("puntaje_maximo").notNull().default(10),
  
  // Configuración
  esObligatorio: integer("es_obligatorio").notNull().default(1), // 1 = obligatorio, 0 = opcional
  orden: integer("orden").notNull().default(0), // Orden de presentación
  activo: integer("activo").notNull().default(1), // 1 = activo, 0 = inactivo
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertCriterioEvaluacionSchema = createInsertSchema(criteriosEvaluacionProveedor)
  .omit({ id: true, createdAt: true, companyId: true })
  .extend({
    puntajeMaximo: z.number().min(0).max(100),
    esObligatorio: z.number().min(0).max(1),
    orden: z.number().min(0),
    activo: z.number().min(0).max(1),
  });
export type InsertCriterioEvaluacion = z.infer<typeof insertCriterioEvaluacionSchema>;
export type CriterioEvaluacion = typeof criteriosEvaluacionProveedor.$inferSelect;

// Respuestas a Criterios de Evaluación
export const respuestasCriteriosProveedor = pgTable("respuestas_criterios_proveedor", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  evaluacionId: varchar("evaluacion_id").notNull().references(() => evaluacionesProveedores.id, { onDelete: "cascade" }),
  criterioId: varchar("criterio_id").notNull().references(() => criteriosEvaluacionProveedor.id),
  
  // Respuesta
  puntajeObtenido: integer("puntaje_obtenido").notNull().default(0),
  cumple: integer("cumple").notNull().default(0), // 0 = no cumple, 1 = cumple
  evidencia: text("evidencia"), // Descripción de la evidencia
  observaciones: text("observaciones"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertRespuestaCriterioSchema = createInsertSchema(respuestasCriteriosProveedor)
  .omit({ id: true, createdAt: true })
  .extend({
    puntajeObtenido: z.number().min(0),
    cumple: z.number().min(0).max(1),
  });
export type InsertRespuestaCriterio = z.infer<typeof insertRespuestaCriterioSchema>;
export type RespuestaCriterio = typeof respuestasCriteriosProveedor.$inferSelect;

// Documentos de Proveedores
export const documentosProveedores = pgTable("documentos_proveedores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  proveedorId: varchar("proveedor_id").notNull().references(() => proveedoresContratistas.id, { onDelete: "cascade" }),
  
  // Documento
  tipoDocumento: text("tipo_documento").notNull(), // "certificado_arl", "matriz_riesgos", "politica_sst", etc.
  nombreDocumento: text("nombre_documento").notNull(),
  archivoUrl: text("archivo_url").notNull(),
  
  // Vigencia
  fechaEmision: date("fecha_emision"),
  fechaVencimiento: date("fecha_vencimiento"),
  vigente: integer("vigente").notNull().default(1), // 1 = vigente, 0 = vencido
  
  // Observaciones
  observaciones: text("observaciones"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertDocumentoProveedorSchema = createInsertSchema(documentosProveedores)
  .omit({ id: true, createdAt: true, updatedAt: true, companyId: true })
  .extend({
    fechaEmision: z.coerce.date().optional().nullable(),
    fechaVencimiento: z.coerce.date().optional().nullable(),
    vigente: z.number().min(0).max(1),
  });
export type InsertDocumentoProveedor = z.infer<typeof insertDocumentoProveedorSchema>;
export type DocumentoProveedor = typeof documentosProveedores.$inferSelect;

// Seguimientos a Proveedores (inspecciones periódicas durante ejecución)
export const seguimientosProveedores = pgTable("seguimientos_proveedores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  proveedorId: varchar("proveedor_id").notNull().references(() => proveedoresContratistas.id, { onDelete: "cascade" }),
  
  // Seguimiento
  fechaSeguimiento: date("fecha_seguimiento").notNull(),
  tipoSeguimiento: text("tipo_seguimiento").notNull(), // "inspeccion", "auditoria", "verificacion_documental", "reunion"
  responsable: text("responsable").notNull(),
  
  // Hallazgos
  cumpleRequisitos: integer("cumple_requisitos"), // 0 = no, 1 = sí, null = parcial
  hallazgos: text("hallazgos"), // Hallazgos encontrados
  noConformidades: text("no_conformidades"), // No conformidades detectadas
  
  // Acciones
  accionesCorrectivas: text("acciones_correctivas"),
  plazoImplementacion: date("plazo_implementacion"),
  estadoAcciones: text("estado_acciones"), // "pendiente", "en_proceso", "completado"
  
  // Observaciones
  observaciones: text("observaciones"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertSeguimientoProveedorSchema = createInsertSchema(seguimientosProveedores)
  .omit({ id: true, createdAt: true, updatedAt: true, companyId: true })
  .extend({
    fechaSeguimiento: z.coerce.date(),
    cumpleRequisitos: z.number().min(0).max(1).optional().nullable(),
    plazoImplementacion: z.coerce.date().optional().nullable(),
  });
export type InsertSeguimientoProveedor = z.infer<typeof insertSeguimientoProveedorSchema>;
export type SeguimientoProveedor = typeof seguimientosProveedores.$inferSelect;

// ============================================================================
// MÓDULO: GESTIÓN DE CAMBIOS SST (Decreto 1072/2015 - Art. 2.2.4.6.26)
// ============================================================================

// Enums para Gestión de Cambios
export const tipoCambioEnum = pgEnum("tipo_cambio", ["interno", "externo"]);
export const categoriaCambioEnum = pgEnum("categoria_cambio", [
  "proceso",           // Nuevos procesos o cambios en métodos de trabajo
  "instalacion",       // Modificaciones en instalaciones físicas
  "equipo",            // Nueva maquinaria o equipos
  "organizacional",    // Reorganización de áreas o estructuras
  "tecnologico",       // Nuevas tecnologías o sistemas
  "legal",             // Cambios en legislación SST
  "producto",          // Nuevos productos o materias primas
  "personal",          // Cambios en personal o roles
  "otro"
]);

export const estadoCambioEnum = pgEnum("estado_cambio", [
  "propuesto",         // Cambio propuesto pero no evaluado
  "en_evaluacion",     // En proceso de evaluación de impacto
  "aprobado",          // Aprobado para implementación
  "rechazado",         // Rechazado (no se implementará)
  "en_implementacion", // Aprobado y en proceso de implementación
  "implementado",      // Completamente implementado
  "cancelado"          // Cancelado después de aprobación
]);

export const nivelImpactoEnum = pgEnum("nivel_impacto", ["bajo", "medio", "alto", "critico"]);

export const estadoAprobacionEnum = pgEnum("estado_aprobacion", [
  "pendiente",
  "aprobado",
  "rechazado",
  "requiere_revision"
]);

// Tabla principal: Cambios SST
export const cambiosSst = pgTable("cambios_sst", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  
  // Información del cambio
  codigo: text("codigo").notNull(), // Ej: "CAM-2025-001"
  titulo: text("titulo").notNull(),
  descripcion: text("descripcion").notNull(),
  tipo: tipoCambioEnum("tipo").notNull(), // Interno o externo
  categoria: categoriaCambioEnum("categoria").notNull(),
  
  // Área/proceso afectado
  areaAfectada: text("area_afectada").notNull(),
  procesoAfectado: text("proceso_afectado"),
  numeroTrabajadoresAfectados: integer("numero_trabajadores_afectados").notNull().default(0),
  
  // Justificación y objetivos
  justificacion: text("justificacion").notNull(),
  objetivos: text("objetivos"),
  
  // Fechas
  fechaPropuesta: date("fecha_propuesta").notNull(),
  fechaImplementacionPlanificada: date("fecha_implementacion_planificada"),
  fechaImplementacionReal: date("fecha_implementacion_real"),
  
  // Responsables
  solicitante: text("solicitante").notNull(), // Quien propone el cambio
  responsableImplementacion: text("responsable_implementacion"),
  
  // Estado y aprobación
  estado: estadoCambioEnum("estado").notNull().default("propuesto"),
  nivelImpacto: nivelImpactoEnum("nivel_impacto"), // Calculado en evaluación
  
  // Integración con otros módulos (IDs de registros creados automáticamente)
  requiereActualizacionMatrizRiesgos: integer("requiere_actualizacion_matriz_riesgos").notNull().default(0),
  requiereActualizacionPlanTrabajo: integer("requiere_actualizacion_plan_trabajo").notNull().default(0),
  requiereCapacitacion: integer("requiere_capacitacion").notNull().default(0),
  requiereAprobacionCopasst: integer("requiere_aprobacion_copasst").notNull().default(0),
  
  // Observaciones
  observaciones: text("observaciones"),
  leccionesAprendidas: text("lecciones_aprendidas"), // Post-implementación
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertCambioSstSchema = createInsertSchema(cambiosSst)
  .omit({ id: true, createdAt: true, updatedAt: true, companyId: true, codigo: true })
  .extend({
    fechaPropuesta: z.coerce.date(),
    fechaImplementacionPlanificada: z.coerce.date().optional().nullable(),
    fechaImplementacionReal: z.coerce.date().optional().nullable(),
    numeroTrabajadoresAfectados: z.number().min(0),
    requiereActualizacionMatrizRiesgos: z.number().min(0).max(1),
    requiereActualizacionPlanTrabajo: z.number().min(0).max(1),
    requiereCapacitacion: z.number().min(0).max(1),
    requiereAprobacionCopasst: z.number().min(0).max(1),
  });
export type InsertCambioSst = z.infer<typeof insertCambioSstSchema>;
export type CambioSst = typeof cambiosSst.$inferSelect;

// Evaluación de Impacto en SST
export const evaluacionesImpactoCambios = pgTable("evaluaciones_impacto_cambios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  cambioId: varchar("cambio_id").notNull().references(() => cambiosSst.id, { onDelete: "cascade" }),
  
  // Información de la evaluación
  fechaEvaluacion: date("fecha_evaluacion").notNull(),
  evaluador: text("evaluador").notNull(), // Coordinador SST o responsable
  
  // Identificación de peligros
  peligrosIdentificados: text("peligros_identificados").notNull(), // JSON array o texto separado
  numeroPeligrosNuevos: integer("numero_peligros_nuevos").notNull().default(0),
  
  // Valoración de riesgos (simple)
  nivelRiesgoResultante: nivelImpactoEnum("nivel_riesgo_resultante").notNull(),
  probabilidadOcurrencia: integer("probabilidad_ocurrencia").notNull(), // 1-5
  severidadConsecuencia: integer("severidad_consecuencia").notNull(), // 1-5
  
  // Impacto en diferentes áreas
  impactoTrabajadores: text("impacto_trabajadores"), // Descripción del impacto
  impactoInstalaciones: text("impacto_instalaciones"),
  impactoOperaciones: text("impacto_operaciones"),
  impactoAmbiental: text("impacto_ambiental"),
  
  // Análisis de causas
  causasRiesgo: text("causas_riesgo"),
  
  // Conclusión
  requiereControles: integer("requiere_controles").notNull().default(1), // 1 = sí, 0 = no
  recomendacionGeneral: text("recomendacion_general"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertEvaluacionImpactoCambioSchema = createInsertSchema(evaluacionesImpactoCambios)
  .omit({ id: true, createdAt: true, updatedAt: true, companyId: true })
  .extend({
    fechaEvaluacion: z.coerce.date(),
    numeroPeligrosNuevos: z.number().min(0),
    probabilidadOcurrencia: z.number().min(1).max(5),
    severidadConsecuencia: z.number().min(1).max(5),
    requiereControles: z.number().min(0).max(1),
  });
export type InsertEvaluacionImpactoCambio = z.infer<typeof insertEvaluacionImpactoCambioSchema>;
export type EvaluacionImpactoCambio = typeof evaluacionesImpactoCambios.$inferSelect;

// Controles para Cambios
export const tipoControlCambioEnum = pgEnum("tipo_control_cambio", [
  "eliminacion",      // Eliminar el peligro
  "sustitucion",      // Sustituir por algo menos peligroso
  "controles_ingenieria", // Controles de ingeniería
  "controles_administrativos", // Señalización, procedimientos
  "epp",              // Equipos de protección personal
  "capacitacion"      // Capacitación y entrenamiento
]);

export const estadoControlCambioEnum = pgEnum("estado_control_cambio", [
  "planificado",
  "en_implementacion",
  "implementado",
  "verificado"
]);

export const controlesCambios = pgTable("controles_cambios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  cambioId: varchar("cambio_id").notNull().references(() => cambiosSst.id, { onDelete: "cascade" }),
  evaluacionId: varchar("evaluacion_id").references(() => evaluacionesImpactoCambios.id, { onDelete: "cascade" }),
  
  // Control
  descripcionControl: text("descripcion_control").notNull(),
  tipoControl: tipoControlCambioEnum("tipo_control").notNull(),
  
  // Implementación
  responsable: text("responsable").notNull(),
  fechaLimite: date("fecha_limite").notNull(), // Debe implementarse antes del cambio
  fechaImplementacion: date("fecha_implementacion"),
  
  // Estado
  estado: estadoControlCambioEnum("estado").notNull().default("planificado"),
  
  // Costos (opcional)
  costoEstimado: integer("costo_estimado"), // En pesos colombianos
  costoReal: integer("costo_real"),
  
  // Verificación
  fechaVerificacion: date("fecha_verificacion"),
  verificadoPor: text("verificado_por"),
  efectivo: integer("efectivo"), // 0 = no, 1 = sí, null = no verificado aún
  
  observaciones: text("observaciones"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertControlCambioSchema = createInsertSchema(controlesCambios)
  .omit({ id: true, createdAt: true, updatedAt: true, companyId: true })
  .extend({
    fechaLimite: z.coerce.date(),
    fechaImplementacion: z.coerce.date().optional().nullable(),
    fechaVerificacion: z.coerce.date().optional().nullable(),
    costoEstimado: z.number().min(0).optional().nullable(),
    costoReal: z.number().min(0).optional().nullable(),
    efectivo: z.number().min(0).max(1).optional().nullable(),
  });
export type InsertControlCambio = z.infer<typeof insertControlCambioSchema>;
export type ControlCambio = typeof controlesCambios.$inferSelect;

// Capacitaciones relacionadas con Cambios (antes de implementar)
export const capacitacionesCambios = pgTable("capacitaciones_cambios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  cambioId: varchar("cambio_id").notNull().references(() => cambiosSst.id, { onDelete: "cascade" }),
  trainingId: varchar("training_id").references(() => trainings.id), // Vinculado a capacitación existente
  
  // Capacitación
  temaCapacitacion: text("tema_capacitacion").notNull(),
  objetivos: text("objetivos"),
  duracionHoras: integer("duracion_horas").notNull().default(1),
  
  // Trabajadores afectados
  trabajadoresObjetivo: text("trabajadores_objetivo"), // IDs o descripción
  numeroTrabajadores: integer("numero_trabajadores").notNull().default(0),
  
  // Programación
  fechaProgramada: date("fecha_programada"),
  fechaRealizada: date("fecha_realizada"),
  instructor: text("instructor"),
  
  // Estado
  completada: integer("completada").notNull().default(0), // 0 = no, 1 = sí
  porcentajeAsistencia: integer("porcentaje_asistencia"), // 0-100
  
  // Observaciones
  observaciones: text("observaciones"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertCapacitacionCambioSchema = createInsertSchema(capacitacionesCambios)
  .omit({ id: true, createdAt: true, updatedAt: true, companyId: true })
  .extend({
    duracionHoras: z.number().min(1),
    numeroTrabajadores: z.number().min(0),
    fechaProgramada: z.coerce.date().optional().nullable(),
    fechaRealizada: z.coerce.date().optional().nullable(),
    completada: z.number().min(0).max(1),
    porcentajeAsistencia: z.number().min(0).max(100).optional().nullable(),
  });
export type InsertCapacitacionCambio = z.infer<typeof insertCapacitacionCambioSchema>;
export type CapacitacionCambio = typeof capacitacionesCambios.$inferSelect;

// Seguimiento Post-Implementación
export const seguimientosCambios = pgTable("seguimientos_cambios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  cambioId: varchar("cambio_id").notNull().references(() => cambiosSst.id, { onDelete: "cascade" }),
  
  // Seguimiento
  fechaSeguimiento: date("fecha_seguimiento").notNull(),
  responsable: text("responsable").notNull(),
  tipoSeguimiento: text("tipo_seguimiento").notNull(), // "verificacion_inicial", "seguimiento_mensual", "cierre"
  
  // Verificaciones
  controlesEfectivos: integer("controles_efectivos"), // 0 = no, 1 = sí, null = parcial
  capacitacionCompletada: integer("capacitacion_completada"), // 0 = no, 1 = sí
  documentacionActualizada: integer("documentacion_actualizada"), // 0 = no, 1 = sí
  
  // Resultados
  incidentesRelacionados: integer("incidentes_relacionados").notNull().default(0),
  descripcionIncidentes: text("descripcion_incidentes"),
  
  // Hallazgos
  hallazgos: text("hallazgos"),
  noConformidades: text("no_conformidades"),
  mejoras: text("mejoras"), // Mejoras identificadas
  
  // Acciones correctivas
  accionesCorrectivas: text("acciones_correctivas"),
  plazoAcciones: date("plazo_acciones"),
  
  // Conclusión
  cambioExitoso: integer("cambio_exitoso"), // 0 = no, 1 = sí, null = en evaluación
  observaciones: text("observaciones"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertSeguimientoCambioSchema = createInsertSchema(seguimientosCambios)
  .omit({ id: true, createdAt: true, updatedAt: true, companyId: true })
  .extend({
    fechaSeguimiento: z.coerce.date(),
    controlesEfectivos: z.number().min(0).max(1).optional().nullable(),
    capacitacionCompletada: z.number().min(0).max(1).optional().nullable(),
    documentacionActualizada: z.number().min(0).max(1).optional().nullable(),
    incidentesRelacionados: z.number().min(0),
    plazoAcciones: z.coerce.date().optional().nullable(),
    cambioExitoso: z.number().min(0).max(1).optional().nullable(),
  });
export type InsertSeguimientoCambio = z.infer<typeof insertSeguimientoCambioSchema>;
export type SeguimientoCambio = typeof seguimientosCambios.$inferSelect;

// Aprobaciones de Cambios (Flujo de aprobación multinivel)
export const nivelAprobadorEnum = pgEnum("nivel_aprobador", [
  "coordinador_sst",   // Primera aprobación técnica
  "alta_direccion",    // Aprobación gerencial
  "copasst",           // Aprobación del Comité (para cambios críticos)
  "especialista_externo" // Consultor externo si es necesario
]);

export const aprobacionesCambios = pgTable("aprobaciones_cambios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  cambioId: varchar("cambio_id").notNull().references(() => cambiosSst.id, { onDelete: "cascade" }),
  
  // Aprobador
  nivelAprobacion: nivelAprobadorEnum("nivel_aprobacion").notNull(),
  aprobador: text("aprobador").notNull(), // Nombre de quien aprueba
  cargo: text("cargo"),
  
  // Decisión
  estado: estadoAprobacionEnum("estado").notNull().default("pendiente"),
  fechaAprobacion: date("fecha_aprobacion"),
  
  // Comentarios y condiciones
  comentarios: text("comentarios"),
  condiciones: text("condiciones"), // Condiciones para aprobar
  
  // Orden de aprobación (para flujo secuencial)
  orden: integer("orden").notNull().default(1),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertAprobacionCambioSchema = createInsertSchema(aprobacionesCambios)
  .omit({ id: true, createdAt: true, updatedAt: true, companyId: true })
  .extend({
    fechaAprobacion: z.coerce.date().optional().nullable(),
    orden: z.number().min(1),
  });
export type InsertAprobacionCambio = z.infer<typeof insertAprobacionCambioSchema>;
export type AprobacionCambio = typeof aprobacionesCambios.$inferSelect;

// Logs de Automatización de Cambios
export const moduloDestinoAutomatizacionEnum = pgEnum("modulo_destino_automatizacion", [
  "matriz_riesgos",
  "plan_trabajo",
  "capacitaciones",
  "copasst",
  "matriz_legal",
  "politicas",
  "indicadores",
  "notificaciones"
]);

export const estadoAutomatizacionEnum = pgEnum("estado_automatizacion", [
  "exito",
  "error",
  "pendiente"
]);

export const automatizacionCambioLogs = pgTable("automatizacion_cambio_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  cambioId: varchar("cambio_id").notNull().references(() => cambiosSst.id, { onDelete: "cascade" }),
  
  moduloDestino: moduloDestinoAutomatizacionEnum("modulo_destino").notNull(),
  registroDestinoId: varchar("registro_destino_id"),
  estado: estadoAutomatizacionEnum("estado").notNull().default("pendiente"),
  mensaje: text("mensaje"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertAutomatizacionCambioLogSchema = createInsertSchema(automatizacionCambioLogs)
  .omit({ id: true, createdAt: true, companyId: true });
export type InsertAutomatizacionCambioLog = z.infer<typeof insertAutomatizacionCambioLogSchema>;
export type AutomatizacionCambioLog = typeof automatizacionCambioLogs.$inferSelect;

// ============================================================================
// MÓDULO: ADQUISICIONES SST (Decreto 1072/2015 - Art. 2.2.4.6.27)
// Resolución 0312/2019 - Estándar 1.6
// ============================================================================

// Enums para Adquisiciones SST
export const tipoAdquisicionEnum = pgEnum("tipo_adquisicion", [
  "epp",                // Equipos de Protección Personal
  "maquinaria",         // Maquinaria y equipos
  "herramientas",       // Herramientas y utensilios
  "sustancias_quimicas", // Sustancias químicas
  "servicios",          // Servicios de contratistas
  "equipos_emergencia", // Equipos de emergencia
  "mobiliario",         // Mobiliario ergonómico
  "software",           // Software de gestión SST
  "otros"               // Otros
]);

export const estadoAdquisicionEnum = pgEnum("estado_adquisicion", [
  "solicitud",          // Solicitud inicial
  "evaluacion",         // En evaluación SST
  "aprobada",           // Aprobada para compra
  "rechazada",          // Rechazada por criterios SST
  "comprada",           // Comprada/contratada
  "recibida",           // Recibida y verificada
  "cancelada"           // Cancelada
]);

export const nivelRiesgoAdquisicionEnum = pgEnum("nivel_riesgo_adquisicion", [
  "critico",            // Puede generar riesgos críticos
  "alto",               // Alto riesgo
  "medio",              // Riesgo medio
  "bajo"                // Bajo riesgo
]);

export const resultadoEvaluacionAdquisicionEnum = pgEnum("resultado_evaluacion_adquisicion", [
  "aprobado",           // Cumple todos los requisitos SST
  "aprobado_condiciones", // Aprobado con condiciones
  "requiere_controles", // Requiere controles adicionales
  "rechazado"           // No cumple requisitos SST
]);

// Solicitudes de Adquisición SST
export const solicitudesAdquisicion = pgTable("solicitudes_adquisicion", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  
  // Información básica
  numeroSolicitud: text("numero_solicitud").notNull(), // Auto-generado: "ADQ-001-2025"
  fechaSolicitud: date("fecha_solicitud").notNull(),
  solicitante: text("solicitante").notNull(), // Nombre del solicitante
  departamento: text("departamento").notNull(),
  area: text("area"), // Área específica
  
  // Detalle de la adquisición
  tipoAdquisicion: tipoAdquisicionEnum("tipo_adquisicion").notNull(),
  descripcion: text("descripcion").notNull(),
  justificacion: text("justificacion").notNull(), // Justificación de la compra
  cantidad: integer("cantidad").notNull().default(1),
  unidad: text("unidad"), // "unidades", "litros", "kilos", etc.
  presupuestoEstimado: integer("presupuesto_estimado"), // COP
  
  // Evaluación de riesgo inicial
  nivelRiesgo: nivelRiesgoAdquisicionEnum("nivel_riesgo").notNull().default("medio"),
  peligrosAsociados: text("peligros_asociados"), // Peligros que puede generar
  requiereEvaluacion: integer("requiere_evaluacion").notNull().default(1), // 1 = requiere evaluación previa
  
  // Proveedor propuesto (vinculación con proveedores evaluados)
  proveedorPropuestoId: varchar("proveedor_propuesto_id").references(() => proveedoresContratistas.id),
  proveedorNombre: text("proveedor_nombre"), // Nombre si no está en la base
  
  // Vinculación con recurso financiero asignado
  recursoFinancieroId: varchar("recurso_financiero_id").references(() => resourceAllocations.id),
  
  // Estado y aprobación
  estado: estadoAdquisicionEnum("estado").notNull().default("solicitud"),
  fechaEvaluacion: date("fecha_evaluacion"),
  evaluador: text("evaluador"), // Coordinador SST que evalúa
  
  // Decisión
  aprobado: integer("aprobado"), // 0 = rechazado, 1 = aprobado, null = pendiente
  motivoRechazo: text("motivo_rechazo"),
  condiciones: text("condiciones"), // Condiciones para aprobar
  
  // Seguimiento
  fechaCompra: date("fecha_compra"),
  fechaRecepcion: date("fecha_recepcion"),
  observaciones: text("observaciones"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertSolicitudAdquisicionSchema = createInsertSchema(solicitudesAdquisicion)
  .omit({ id: true, createdAt: true, updatedAt: true, companyId: true, numeroSolicitud: true })
  .extend({
    fechaSolicitud: z.coerce.date(),
    cantidad: z.number().min(1).default(1),
    presupuestoEstimado: z.number().min(0).optional().nullable(),
    requiereEvaluacion: z.number().min(0).max(1).default(1),
    aprobado: z.number().min(0).max(1).optional().nullable(),
    fechaEvaluacion: z.coerce.date().optional().nullable(),
    fechaCompra: z.coerce.date().optional().nullable(),
    fechaRecepcion: z.coerce.date().optional().nullable(),
  });
export type InsertSolicitudAdquisicion = z.infer<typeof insertSolicitudAdquisicionSchema>;
export type SolicitudAdquisicion = typeof solicitudesAdquisicion.$inferSelect;

// Evaluaciones Previas de Adquisiciones (Análisis SST antes de comprar)
export const evaluacionesAdquisicion = pgTable("evaluaciones_adquisicion", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  solicitudId: varchar("solicitud_id").notNull().references(() => solicitudesAdquisicion.id, { onDelete: "cascade" }),
  
  // Información de la evaluación
  fechaEvaluacion: date("fecha_evaluacion").notNull(),
  evaluador: text("evaluador").notNull(), // Coordinador SST
  
  // Análisis de peligros y riesgos
  peligrosIdentificados: text("peligros_identificados"), // Peligros que genera el producto/servicio
  nivelRiesgo: nivelRiesgoAdquisicionEnum("nivel_riesgo").notNull(),
  afectaMatrizRiesgos: integer("afecta_matriz_riesgos").notNull().default(0), // 1 = debe actualizar matriz
  
  // Verificación de requisitos legales
  cumpleNormatividad: integer("cumple_normatividad"), // 1 = cumple normatividad
  normasAplicables: text("normas_aplicables"), // NTC, ISO, etc.
  requiereCertificaciones: integer("requiere_certificaciones").notNull().default(0),
  certificacionesRequeridas: text("certificaciones_requeridas"),
  
  // Especificaciones técnicas SST
  especificacionesSst: text("especificaciones_sst").notNull(), // Requisitos SST específicos
  requiereFichaTecnica: integer("requiere_ficha_tecnica").notNull().default(0),
  requiereHojaDatos: integer("requiere_hoja_datos").notNull().default(0), // MSDS para químicos
  requiereManualOperacion: integer("requiere_manual_operacion").notNull().default(0),
  
  // Controles requeridos
  controlesNecesarios: text("controles_necesarios"), // Controles para mitigar riesgos
  eppRequerido: text("epp_requerido"), // EPP necesario para usar el producto
  capacitacionRequerida: integer("capacitacion_requerida").notNull().default(0),
  temaCapacitacion: text("tema_capacitacion"),
  
  // Evaluación del proveedor
  proveedorEvaluado: integer("proveedor_evaluado"), // 1 = proveedor ya evaluado
  cumpleRequisitosProveedor: integer("cumple_requisitos_proveedor"),
  observacionesProveedor: text("observaciones_proveedor"),
  
  // Resultado y decisión
  resultado: resultadoEvaluacionAdquisicionEnum("resultado").notNull(),
  puntajeTotal: integer("puntaje_total"), // Puntaje de cumplimiento (0-100)
  recomendaciones: text("recomendaciones"),
  condicionesAprobacion: text("condiciones_aprobacion"),
  
  // Observaciones
  observaciones: text("observaciones"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertEvaluacionAdquisicionSchema = createInsertSchema(evaluacionesAdquisicion)
  .omit({ id: true, createdAt: true, updatedAt: true, companyId: true })
  .extend({
    fechaEvaluacion: z.coerce.date(),
    afectaMatrizRiesgos: z.number().min(0).max(1),
    cumpleNormatividad: z.number().min(0).max(1).optional().nullable(),
    requiereCertificaciones: z.number().min(0).max(1),
    requiereFichaTecnica: z.number().min(0).max(1),
    requiereHojaDatos: z.number().min(0).max(1),
    requiereManualOperacion: z.number().min(0).max(1),
    capacitacionRequerida: z.number().min(0).max(1),
    proveedorEvaluado: z.number().min(0).max(1).optional().nullable(),
    cumpleRequisitosProveedor: z.number().min(0).max(1).optional().nullable(),
    puntajeTotal: z.number().min(0).max(100).optional().nullable(),
  });
export type InsertEvaluacionAdquisicion = z.infer<typeof insertEvaluacionAdquisicionSchema>;
export type EvaluacionAdquisicion = typeof evaluacionesAdquisicion.$inferSelect;

// Especificaciones Técnicas SST (Requisitos específicos en órdenes de compra)
export const especificacionesTecnicas = pgTable("especificaciones_tecnicas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  solicitudId: varchar("solicitud_id").notNull().references(() => solicitudesAdquisicion.id, { onDelete: "cascade" }),
  
  // Especificación
  nombreEspecificacion: text("nombre_especificacion").notNull(),
  descripcion: text("descripcion").notNull(),
  tipoEspecificacion: text("tipo_especificacion").notNull(), // "certificacion", "norma_tecnica", "caracteristica_seguridad", etc.
  esObligatoria: integer("es_obligatoria").notNull().default(1), // 1 = obligatoria
  
  // Normativa aplicable
  normaReferencia: text("norma_referencia"), // NTC, ISO, ANSI, etc.
  
  // Verificación
  cumplimiento: integer("cumplimiento"), // 0 = no cumple, 1 = cumple, null = no verificado
  evidencia: text("evidencia"), // Evidencia del cumplimiento
  observaciones: text("observaciones"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertEspecificacionTecnicaSchema = createInsertSchema(especificacionesTecnicas)
  .omit({ id: true, createdAt: true, companyId: true })
  .extend({
    esObligatoria: z.number().min(0).max(1),
    cumplimiento: z.number().min(0).max(1).optional().nullable(),
  });
export type InsertEspecificacionTecnica = z.infer<typeof insertEspecificacionTecnicaSchema>;
export type EspecificacionTecnica = typeof especificacionesTecnicas.$inferSelect;

// Hojas de Datos de Seguridad (MSDS/FDS - Material Safety Data Sheets)
export const hojasSeguridad = pgTable("hojas_seguridad", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  solicitudId: varchar("solicitud_id").references(() => solicitudesAdquisicion.id, { onDelete: "cascade" }),
  
  // Información del producto/sustancia
  nombreProducto: text("nombre_producto").notNull(),
  nombreComercial: text("nombre_comercial"),
  fabricante: text("fabricante"),
  proveedor: text("proveedor"),
  
  // Identificación
  numeroOnu: text("numero_onu"), // Número ONU para sustancias peligrosas
  numeroCas: text("numero_cas"), // Chemical Abstracts Service number
  
  // Clasificación de peligro
  clasificacionPeligro: text("clasificacion_peligro"), // Según GHS
  pictogramas: text("pictogramas"), // Pictogramas de peligro (separados por comas)
  palabraAdvertencia: text("palabra_advertencia"), // "Peligro" o "Atención"
  indicacionesPeligro: text("indicaciones_peligro"), // Frases H
  consejosSeguridad: text("consejos_seguridad"), // Frases P
  
  // Composición
  componentesPeligrosos: text("componentes_peligrosos"),
  concentracion: text("concentracion"),
  
  // Medidas de seguridad
  primerosauxilios: text("primerosauxilios"),
  medidasLuchaIncendios: text("medidas_lucha_incendios"),
  medidasVertidesAccidentales: text("medidas_vertides_accidentales"),
  
  // Manipulación y almacenamiento
  precaucionesManipulacion: text("precauciones_manipulacion"),
  condicionesAlmacenamiento: text("condiciones_almacenamiento"),
  
  // EPP requerido
  proteccionRespiratoria: text("proteccion_respiratoria"),
  proteccionManos: text("proteccion_manos"),
  proteccionOjos: text("proteccion_ojos"),
  proteccionCuerpo: text("proteccion_cuerpo"),
  
  // Documentos
  archivoMsdsUrl: text("archivo_msds_url"), // Archivo PDF de la MSDS
  archivoFichaTecnicaUrl: text("archivo_ficha_tecnica_url"),
  
  // Vigencia
  fechaEmision: date("fecha_emision"),
  fechaRevision: date("fecha_revision"),
  version: text("version"),
  
  // Observaciones
  observaciones: text("observaciones"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertHojaSeguridadSchema = createInsertSchema(hojasSeguridad)
  .omit({ id: true, createdAt: true, updatedAt: true, companyId: true })
  .extend({
    fechaEmision: z.coerce.date().optional().nullable(),
    fechaRevision: z.coerce.date().optional().nullable(),
  });
export type InsertHojaSeguridad = z.infer<typeof insertHojaSeguridadSchema>;
export type HojaSeguridad = typeof hojasSeguridad.$inferSelect;

// Items de Adquisición (Productos con fichas técnicas)
export const categoriaItemEnum = pgEnum("categoria_item", [
  "epp", "equipos", "maquinaria", "mobiliario", "quimicos", "materiales", "emergencia", "otros"
]);

export const adquisicionItems = pgTable("adquisicion_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  solicitudId: varchar("solicitud_id").references(() => solicitudesAdquisicion.id, { onDelete: "cascade" }),
  
  // Información del producto
  nombreProducto: text("nombre_producto").notNull(),
  categoria: categoriaItemEnum("categoria").notNull(),
  marca: text("marca"),
  modelo: text("modelo"),
  referencia: text("referencia"),
  serial: text("serial"),
  
  // Cantidades y costo
  cantidad: integer("cantidad").notNull().default(1),
  unidad: text("unidad").default("unidades"),
  precioUnitario: integer("precio_unitario"),
  precioTotal: integer("precio_total"),
  
  // Vinculación con recursos financieros (1.1.3)
  resourceAllocationId: varchar("resource_allocation_id").references(() => resourceAllocations.id),
  
  // Fichas técnicas y documentación
  fichaTecnicaUrl: text("ficha_tecnica_url"),
  fichaTecnicaNombre: text("ficha_tecnica_nombre"),
  hojaSeguridadUrl: text("hoja_seguridad_url"),
  hojaSeguridadNombre: text("hoja_seguridad_nombre"),
  certificadoUrl: text("certificado_url"),
  certificadoNombre: text("certificado_nombre"),
  
  // Especificaciones SST
  especificacionesSst: text("especificaciones_sst"),
  cumpleNormativa: integer("cumple_normativa").default(1),
  normasAplicables: text("normas_aplicables"),
  
  // Vida útil y mantenimiento
  vidaUtilMeses: integer("vida_util_meses"),
  fechaVencimiento: date("fecha_vencimiento"),
  requiereMantenimiento: integer("requiere_mantenimiento").default(0),
  frecuenciaMantenimientoDias: integer("frecuencia_mantenimiento_dias"),
  
  // Estado
  estado: text("estado").notNull().default("activo"),
  fechaCompra: date("fecha_compra"),
  fechaBaja: date("fecha_baja"),
  motivoBaja: text("motivo_baja"),
  
  observaciones: text("observaciones"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertAdquisicionItemSchema = createInsertSchema(adquisicionItems)
  .omit({ id: true, createdAt: true, updatedAt: true, companyId: true })
  .extend({
    fechaVencimiento: z.coerce.date().optional().nullable(),
    fechaCompra: z.coerce.date().optional().nullable(),
    fechaBaja: z.coerce.date().optional().nullable(),
    cantidad: z.number().min(1).default(1),
    cumpleNormativa: z.number().min(0).max(1).optional().nullable(),
    requiereMantenimiento: z.number().min(0).max(1).optional().nullable(),
  });
export type InsertAdquisicionItem = z.infer<typeof insertAdquisicionItemSchema>;
export type AdquisicionItem = typeof adquisicionItems.$inferSelect;

// Verificación de Cumplimiento de Adquisiciones (Post-compra)
export const verificacionesAdquisicion = pgTable("verificaciones_adquisicion", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  solicitudId: varchar("solicitud_id").notNull().references(() => solicitudesAdquisicion.id, { onDelete: "cascade" }),
  
  // Verificación
  fechaVerificacion: date("fecha_verificacion").notNull(),
  verificador: text("verificador").notNull(),
  
  // Cumplimiento de especificaciones
  cumpleEspecificaciones: integer("cumple_especificaciones"), // 1 = cumple todas
  especificacionesIncumplidas: text("especificaciones_incumplidas"),
  
  // Documentación recibida
  recibiMsds: integer("recibi_msds").notNull().default(0),
  recibiFichaTecnica: integer("recibi_ficha_tecnica").notNull().default(0),
  recibiManual: integer("recibi_manual").notNull().default(0),
  recibiCertificaciones: integer("recibi_certificaciones").notNull().default(0),
  
  // Estado del producto
  estadoProducto: text("estado_producto"), // "conforme", "no_conforme", "requiere_devolucion"
  hallazgos: text("hallazgos"),
  
  // Acciones
  accionesTomadas: text("acciones_tomadas"),
  requiereDevolucion: integer("requiere_devolucion").notNull().default(0),
  motivoDevolucion: text("motivo_devolucion"),
  
  // Observaciones
  observaciones: text("observaciones"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertVerificacionAdquisicionSchema = createInsertSchema(verificacionesAdquisicion)
  .omit({ id: true, createdAt: true, companyId: true })
  .extend({
    fechaVerificacion: z.coerce.date(),
    cumpleEspecificaciones: z.number().min(0).max(1).optional().nullable(),
    recibiMsds: z.number().min(0).max(1),
    recibiFichaTecnica: z.number().min(0).max(1),
    recibiManual: z.number().min(0).max(1),
    recibiCertificaciones: z.number().min(0).max(1),
    requiereDevolucion: z.number().min(0).max(1),
  });
export type InsertVerificacionAdquisicion = z.infer<typeof insertVerificacionAdquisicionSchema>;
export type VerificacionAdquisicion = typeof verificacionesAdquisicion.$inferSelect;

// ==========================================
// MÓDULO DE COMUNICACIÓN SST
// Decreto 1072/2015 Art. 2.2.4.6.14 - Comunicación
// ==========================================

// Enums para Comunicación SST
export const tipoComunicacionEnum = pgEnum("tipo_comunicacion", [
  "politica",           // Política de SST
  "procedimiento",      // Procedimientos operativos
  "alerta",             // Alertas de seguridad
  "informativo",        // Información general
  "formacion",          // Material de formación
  "emergencia",         // Comunicado de emergencia
  "normativo",          // Cambios normativos
  "evento"              // Eventos SST
]);

export const mediosComunicacionEnum = pgEnum("medios_comunicacion", [
  "correo",             // Email
  "cartelera",          // Cartelera física
  "intranet",           // Portal interno
  "reunion",            // Reunión presencial
  "whatsapp",           // Grupo de WhatsApp
  "sms",                // Mensaje de texto
  "aplicacion",         // App móvil
  "documento"           // Documento físico/PDF
]);

export const publicoObjetivoEnum = pgEnum("publico_objetivo", [
  "todos",              // Todos los trabajadores
  "trabajadores",       // Solo trabajadores directos
  "contratistas",       // Contratistas y proveedores
  "copasst",            // Comité COPASST
  "alta_direccion",     // Alta dirección
  "supervisores",       // Supervisores
  "area_especifica",    // Área/departamento específico
  "nuevos_empleados"    // Nuevos ingresos
]);

export const estadoReporteEnum = pgEnum("estado_reporte", [
  "pendiente",          // Recién creado
  "en_revision",        // En revisión por SST
  "requiere_accion",    // Requiere acción inmediata
  "en_proceso",         // Acción en proceso
  "resuelto",           // Resuelto
  "cerrado"             // Cerrado sin acción
]);

export const prioridadReporteEnum = pgEnum("prioridad_reporte", [
  "baja",
  "media",
  "alta",
  "urgente"
]);

export const categoriaReporteEnum = pgEnum("categoria_reporte", [
  "peligro",            // Identificación de peligro
  "incidente",          // Reporte de incidente
  "sugerencia",         // Sugerencia de mejora
  "queja",              // Queja o reclamo
  "consulta",           // Consulta SST
  "reconocimiento"      // Reconocimiento de buena práctica
]);

// Plan de Comunicación SST - Art. 2.2.4.6.8, punto 7
export const planComunicacionSst = pgTable("plan_comunicacion_sst", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  
  // Información del plan
  version: text("version").notNull().default("1.0"),
  fechaElaboracion: date("fecha_elaboracion").notNull(),
  fechaRevision: date("fecha_revision"),
  elaboradoPor: varchar("elaborado_por").notNull().references(() => users.id), // Referencia a usuario
  aprobadoPor: varchar("aprobado_por").references(() => users.id), // Referencia a usuario
  
  // Objetivos del plan
  objetivoGeneral: text("objetivo_general").notNull(),
  objetivosEspecificos: text("objetivos_especificos").array(),
  
  // Alcance
  alcance: text("alcance").notNull(),
  
  // Público objetivo y frecuencia
  publicosObjetivo: text("publicos_objetivo").array(), // ["todos", "contratistas", etc.]
  mediosComunicacion: text("medios_comunicacion").array(), // ["correo", "cartelera", etc.]
  frecuenciaReuniones: text("frecuencia_reuniones"), // "mensual", "trimestral", etc.
  
  // Responsables (referencias a usuarios)
  responsableComunicacionInterna: varchar("responsable_comunicacion_interna").references(() => users.id),
  responsableComunicacionExterna: varchar("responsable_comunicacion_externa").references(() => users.id),
  responsableComunicacionContratistas: varchar("responsable_comunicacion_contratistas").references(() => users.id),
  
  // Indicadores
  indicadores: text("indicadores").array(),
  metasIndicadores: text("metas_indicadores").array(),
  
  // Estado
  estado: text("estado").notNull().default("vigente"), // vigente, en_revision, obsoleto
  observaciones: text("observaciones"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Comunicaciones SST
export const comunicacionesSst = pgTable("comunicaciones_sst", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  
  // Clasificación
  tipo: tipoComunicacionEnum("tipo").notNull(),
  asunto: text("asunto").notNull(),
  contenido: text("contenido").notNull(),
  
  // ISO 45001 7.4 - Comunicación Externa
  esExterna: integer("es_externa").notNull().default(0), // 1 = comunicación externa
  parteInteresadaDestinataria: text("parte_interesada_destinataria"), // ARL, Ministerio, proveedores, etc.
  respuestaRecibida: integer("respuesta_recibida").default(0), // 1 = sí recibió respuesta
  fechaRespuesta: timestamp("fecha_respuesta"),
  resumenRespuesta: text("resumen_respuesta"),
  
  // Público y medios
  publicoObjetivo: publicoObjetivoEnum("publico_objetivo").notNull(),
  departamentoEspecifico: text("departamento_especifico"), // Si es área específica
  mediosUtilizados: text("medios_utilizados").array(), // ["correo", "cartelera", etc.]
  
  // Archivos adjuntos
  archivosAdjuntos: text("archivos_adjuntos").array(),
  
  // Envío
  fechaEnvio: timestamp("fecha_envio").notNull().default(sql`now()`),
  enviadoPor: varchar("enviado_por").notNull().references(() => users.id),
  
  // Seguimiento
  requiereConfirmacionLectura: integer("requiere_confirmacion_lectura").notNull().default(0),
  totalDestinatarios: integer("total_destinatarios").notNull().default(0),
  totalLecturas: integer("total_lecturas").notNull().default(0),
  
  // Vigencia
  fechaVigenciaInicio: date("fecha_vigencia_inicio"),
  fechaVigenciaFin: date("fecha_vigencia_fin"),
  
  // Relacionado con otros módulos
  relacionadoCon: text("relacionado_con"), // "accidente", "capacitacion", "inspeccion", etc.
  relacionadoId: varchar("relacionado_id"),
  
  // Observaciones
  observaciones: text("observaciones"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Registro de lecturas de comunicaciones
export const lecturasComunicacion = pgTable("lecturas_comunicacion", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  comunicacionId: varchar("comunicacion_id").notNull().references(() => comunicacionesSst.id, { onDelete: "cascade" }),
  
  // Usuario que leyó (userId O workerId debe estar presente)
  userId: varchar("user_id").references(() => users.id),
  workerId: varchar("worker_id").references(() => workers.id),
  
  // Registro de lectura
  fechaLectura: timestamp("fecha_lectura"),
  confirmado: integer("confirmado").notNull().default(1), // 1 = confirmó lectura
  
  // Retroalimentación (opcional)
  comentarios: text("comentarios"),
  calificacion: integer("calificacion"), // 1-5 estrellas
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Reportes de trabajadores (buzón de sugerencias/peligros)
export const reportesTrabajadores = pgTable("reportes_trabajadores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  
  // Código único de reporte
  codigo: text("codigo").notNull().unique(), // REP-001-2025, REP-002-2025, etc.
  
  // Quien reporta
  reportadoPor: varchar("reportado_por").references(() => users.id), // Puede ser anónimo (null)
  workerId: varchar("worker_id").references(() => workers.id),
  nombreReportante: text("nombre_reportante"), // Si es anónimo, puede omitirse
  departamento: text("departamento"),
  esAnonimo: integer("es_anonimo").notNull().default(0), // 1 = anónimo
  
  // Clasificación del reporte
  categoria: categoriaReporteEnum("categoria").notNull(),
  prioridad: prioridadReporteEnum("prioridad").notNull().default("media"),
  
  // Contenido del reporte
  asunto: text("asunto").notNull(),
  descripcion: text("descripcion").notNull(),
  ubicacion: text("ubicacion"), // Área/lugar donde ocurre
  
  // Evidencias
  archivosAdjuntos: text("archivos_adjuntos").array(),
  
  // Gestión del reporte
  estado: estadoReporteEnum("estado").notNull().default("pendiente"),
  asignadoA: varchar("asignado_a").references(() => users.id),
  fechaAsignacion: timestamp("fecha_asignacion"),
  
  // Respuesta y acciones
  respuesta: text("respuesta"),
  accionesTomadas: text("acciones_tomadas"),
  fechaRespuesta: timestamp("fecha_respuesta"),
  respondidoPor: varchar("respondido_por").references(() => users.id),
  
  // Cierre
  fechaCierre: timestamp("fecha_cierre"),
  motivoCierre: text("motivo_cierre"),
  
  // Notificaciones
  notificarEmail: integer("notificar_email").notNull().default(1),
  emailContacto: text("email_contacto"),
  
  // Métricas
  tiempoRespuestaDias: integer("tiempo_respuesta_dias"),
  satisfaccionReportante: integer("satisfaccion_reportante"), // 1-5
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Enum para tipos de acciones de auditoría
export const tipoAccionAuditoriaEnum = pgEnum("tipo_accion_auditoria", [
  "crear",
  "editar",
  "eliminar",
  "enviar",
  "leer",
  "confirmar_lectura",
  "asignar",
  "responder",
  "cerrar",
  "cambiar_estado",
  "adjuntar_archivo",
  "eliminar_archivo",
]);

// Tabla de historial/auditoría para comunicaciones SST
export const historialComunicacionesSst = pgTable("historial_comunicaciones_sst", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  
  // Qué se modificó
  entidad: text("entidad").notNull(), // "plan", "comunicacion", "reporte", "lectura"
  entidadId: varchar("entidad_id").notNull(), // ID del registro modificado
  
  // Qué acción se realizó
  accion: tipoAccionAuditoriaEnum("accion").notNull(),
  descripcion: text("descripcion").notNull(), // Descripción legible de la acción
  
  // Quién realizó la acción
  userId: varchar("user_id").notNull().references(() => users.id),
  nombreUsuario: text("nombre_usuario").notNull(), // Para registro incluso si el user se elimina
  rolUsuario: text("rol_usuario").notNull(), // Rol al momento de la acción
  
  // Detalles del cambio
  campoModificado: text("campo_modificado"), // Campo específico modificado
  valorAnterior: text("valor_anterior"), // Valor antes del cambio (JSON si es necesario)
  valorNuevo: text("valor_nuevo"), // Valor después del cambio
  
  // Metadata
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  
  // Timestamp
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Insert schemas y types para Comunicación SST
export const insertPlanComunicacionSstSchema = createInsertSchema(planComunicacionSst)
  .omit({ id: true, createdAt: true, updatedAt: true, companyId: true })
  .extend({
    fechaElaboracion: z.coerce.date(),
    fechaRevision: z.coerce.date().optional().nullable(),
  });
export type InsertPlanComunicacionSst = z.infer<typeof insertPlanComunicacionSstSchema>;
export type PlanComunicacionSst = typeof planComunicacionSst.$inferSelect;

export const insertComunicacionSstSchema = createInsertSchema(comunicacionesSst)
  .omit({ id: true, createdAt: true, companyId: true, enviadoPor: true, totalDestinatarios: true, totalLecturas: true })
  .extend({
    asunto: z.string().min(1, "El título de la comunicación es obligatorio"),
    contenido: z.string().min(1, "El contenido es obligatorio"),
    tipo: z.string().min(1, "El tipo de comunicación es obligatorio"),
    fechaVigenciaInicio: z.coerce.date().optional().nullable(),
    fechaVigenciaFin: z.coerce.date().optional().nullable(),
    requiereConfirmacionLectura: z.number().min(0).max(1),
    // ISO 45001 7.4 - Nuevos campos para comunicación externa
    esExterna: z.number().min(0).max(1).default(0),
    parteInteresadaDestinataria: z.string().optional().nullable(),
    respuestaRecibida: z.number().min(0).max(1).default(0),
    fechaRespuesta: z.coerce.date().optional().nullable(),
    resumenRespuesta: z.string().optional().nullable(),
  });
export type InsertComunicacionSst = z.infer<typeof insertComunicacionSstSchema>;
export type ComunicacionSst = typeof comunicacionesSst.$inferSelect;

export const insertLecturaComunicacionSchema = createInsertSchema(lecturasComunicacion)
  .omit({ id: true, createdAt: true, companyId: true, userId: true, fechaLectura: true })
  .extend({
    confirmado: z.number().min(0).max(1),
    calificacion: z.number().min(1).max(5).optional().nullable(),
  });
export type InsertLecturaComunicacion = z.infer<typeof insertLecturaComunicacionSchema>;
export type LecturaComunicacion = typeof lecturasComunicacion.$inferSelect;

export const insertReporteTrabajadorSchema = createInsertSchema(reportesTrabajadores)
  .omit({ id: true, createdAt: true, updatedAt: true, companyId: true, codigo: true, tiempoRespuestaDias: true })
  .extend({
    esAnonimo: z.number().min(0).max(1).default(0),
    notificarEmail: z.number().min(0).max(1).default(1),
    satisfaccionReportante: z.number().min(1).max(5).optional().nullable(),
  });
export type InsertReporteTrabajador = z.infer<typeof insertReporteTrabajadorSchema>;
export type ReporteTrabajador = typeof reportesTrabajadores.$inferSelect;

export const insertHistorialComunicacionSstSchema = createInsertSchema(historialComunicacionesSst)
  .omit({ id: true, createdAt: true, companyId: true });
export type InsertHistorialComunicacionSst = z.infer<typeof insertHistorialComunicacionSstSchema>;
export type HistorialComunicacionSst = typeof historialComunicacionesSst.$inferSelect;

// ============================================================================
// MÓDULO: IPERC - IDENTIFICACIÓN DE PELIGROS Y EVALUACIÓN DE RIESGOS
// Metodología GTC-45 (Guía Técnica Colombiana para Identificación de Peligros)
// Resolución 0312/2019 - Estándar 1.1.2
// ISO 45001:2018 - Cláusula 6.1 (Acciones para abordar riesgos y oportunidades)
// ============================================================================

// Enums para IPERC según metodología GTC-45
export const clasificacionPeligroEnum = pgEnum("clasificacion_peligro", [
  "fisico",                  // Ruido, vibración, temperatura, iluminación, radiación
  "quimico",                 // Polvos, gases, vapores, líquidos, humos
  "biologico",               // Virus, bacterias, hongos, parásitos
  "biomecanico",             // Postura, movimiento repetitivo, manipulación de cargas
  "psicosocial",             // Estrés, carga mental, acoso, turnos
  "condiciones_seguridad",   // Mecánico, eléctrico, locativo, tecnológico, accidentes de tránsito
  "fenomenos_naturales",     // Sismo, inundación, vendaval, deslizamiento
]);

export const nivelProbabilidadEnum = pgEnum("nivel_probabilidad", [
  "baja",           // 1 - Improbable que ocurra
  "media",          // 2 - Puede ocurrir ocasionalmente
  "alta",           // 3 - Probable que ocurra
  "muy_alta",       // 4 - Ocurrirá repetidamente
]);

export const nivelSeveridadEnum = pgEnum("nivel_severidad", [
  "ligeramente_danino",      // 1 - Lesiones leves, molestias
  "danino",                  // 2 - Lesiones moderadas, enfermedad temporal
  "extremadamente_danino",   // 3 - Lesiones graves, enfermedad permanente o muerte
]);

export const nivelRiesgoEnum = pgEnum("nivel_riesgo", [
  "trivial",        // 1 - Probabilidad Baja × Severidad Ligeramente Dañino
  "tolerable",      // 2-3 - Riesgo aceptable con controles mínimos
  "moderado",       // 4-6 - Requiere controles específicos
  "importante",     // 8-9 - No iniciar trabajo hasta reducir riesgo
  "intolerable",    // 12-16 - Prohibido iniciar o continuar trabajo
]);

export const tipoControlEnum = pgEnum("tipo_control", [
  "eliminacion",       // Nivel 1 - Eliminar el peligro
  "sustitucion",       // Nivel 2 - Reemplazar por menos peligroso
  "ingenieria",        // Nivel 3 - Controles de ingeniería (guardas, ventilación)
  "administrativo",    // Nivel 4 - Procedimientos, capacitación, señalización
  "epp",              // Nivel 5 - Equipos de Protección Personal
]);

export const estadoMatrizIpercEnum = pgEnum("estado_matriz_iperc", [
  "borrador",       // En proceso de elaboración
  "revision",       // En revisión por responsable SST
  "aprobada",       // Aprobada por gerencia
  "vigente",        // En vigencia y aplicación
  "obsoleta",       // Superada por nueva versión
]);

// Enum para clasificar registros IPERC como Riesgos u Oportunidades (ISO 45001 Cláusula 6.1.1)
export const tipoRegistroIpercEnum = pgEnum("tipo_registro_iperc", [
  "riesgo",        // Evaluación de riesgos
  "oportunidad",   // Identificación de oportunidades de mejora
]);

// Tabla principal: Matrices IPERC (una por área/proceso evaluado)
export const matricesIperc = pgTable("matrices_iperc", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  
  // Identificación de la matriz
  nombre: text("nombre").notNull(), // "Matriz IPERC - Área Producción 2025"
  codigo: text("codigo"), // Código único de la matriz
  area: text("area").notNull(), // Área o proceso evaluado
  proceso: text("proceso"), // Proceso específico dentro del área
  
  // Datos del responsable de la evaluación
  responsableEvaluacion: text("responsable_evaluacion").notNull(), // Cargo responsable
  responsableEvaluacionId: varchar("responsable_evaluacion_id").references(() => users.id),
  cargoResponsable: text("cargo_responsable"),
  
  // Fechas
  fechaEvaluacion: date("fecha_evaluacion").notNull(), // Fecha de la evaluación
  fechaProximaRevision: date("fecha_proxima_revision"), // Próxima revisión (anual típicamente)
  fechaAprobacion: date("fecha_aprobacion"), // Fecha de aprobación gerencial
  
  // Vigencia de la matriz (Estándar 1.1.2 - Resolución 0312/2019)
  vigenciaDesde: date("vigencia_desde"), // Inicio de vigencia de la matriz
  vigenciaHasta: date("vigencia_hasta"), // Fin de vigencia de la matriz (típicamente 1 año)
  vigenteAuto: integer("vigente_auto").notNull().default(1), // 1 = calcular automáticamente, 0 = manual
  
  // Estado y versión
  estado: estadoMatrizIpercEnum("estado").notNull().default("borrador"),
  version: integer("version").notNull().default(1), // Número de versión
  
  // Alcance y metodología
  alcance: text("alcance"), // Descripción del alcance de la evaluación
  metodologia: text("metodologia").notNull().default("GTC-45"), // Metodología utilizada
  tipoRegistro: tipoRegistroIpercEnum("tipo_registro").notNull().default("riesgo"), // ISO 45001 6.1.1 - Riesgos y Oportunidades
  
  // Observaciones generales
  observaciones: text("observaciones"),
  
  // Aprobaciones
  aprobadoPor: text("aprobado_por"), // Nombre del aprobador
  aprobadoPorId: varchar("aprobado_por_id").references(() => users.id),
  cargoAprobador: text("cargo_aprobador"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Tabla de peligros identificados (cada registro es un peligro específico)
export const peligrosIperc = pgTable("peligros_iperc", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  matrizId: varchar("matriz_id").notNull().references(() => matricesIperc.id, { onDelete: "cascade" }),
  
  // Clasificación del peligro
  clasificacion: clasificacionPeligroEnum("clasificacion").notNull(),
  subclasificacion: text("subclasificacion"), // Ej: "Ruido continuo", "Gases tóxicos"
  tipoRegistro: tipoRegistroIpercEnum("tipo_registro").notNull().default("riesgo"), // ISO 45001 6.1.1 - Clasificar como riesgo u oportunidad
  
  // Descripción del peligro
  descripcionPeligro: text("descripcion_peligro").notNull(), // Qué es el peligro
  fuenteGeneradora: text("fuente_generadora").notNull(), // De dónde viene (máquina, proceso, etc)
  actividadProceso: text("actividad_proceso").notNull(), // En qué actividad se presenta
  ubicacion: text("ubicacion"), // Ubicación física del peligro
  
  // Personas expuestas
  numeroPersonasExpuestas: integer("numero_personas_expuestas").notNull(),
  tipoExposicion: text("tipo_exposicion"), // "permanente", "ocasional", "temporal"
  tiempoExposicion: text("tiempo_exposicion"), // "8 horas/día", "2 horas/semana"
  
  // Efectos posibles
  efectosPosibles: text("efectos_posibles").notNull(), // Qué puede pasar (lesiones, enfermedades)
  parteCuerpoAfectada: text("parte_cuerpo_afectada"), // Qué parte del cuerpo se afecta
  
  // Evaluación del riesgo según GTC-45
  nivelProbabilidad: nivelProbabilidadEnum("nivel_probabilidad").notNull(),
  nivelSeveridad: nivelSeveridadEnum("nivel_severidad").notNull(),
  valorRiesgo: integer("valor_riesgo").notNull(), // Probabilidad × Severidad (1-12)
  nivelRiesgo: nivelRiesgoEnum("nivel_riesgo").notNull(), // Clasificación final
  
  // Controles existentes (antes de la evaluación)
  controlesExistentes: text("controles_existentes"), // Qué controles ya hay
  efectividadControlesExistentes: text("efectividad_controles_existentes"), // "alta", "media", "baja"
  
  // Controles propuestos (jerarquía de controles)
  requiereControles: integer("requiere_controles").notNull().default(1), // 1 = sí, 0 = no
  controlesPropuestos: text("controles_propuestos"), // Descripción de controles propuestos
  tipoControlPrincipal: tipoControlEnum("tipo_control_principal"), // Control prioritario
  tipoControlSecundario: tipoControlEnum("tipo_control_secundario"), // Control secundario
  
  // Implementación de controles
  responsableImplementacion: text("responsable_implementacion"), // Quién implementará
  responsableImplementacionId: varchar("responsable_implementacion_id").references(() => users.id),
  fechaImplementacionPropuesta: date("fecha_implementacion_propuesta"), // Cuándo se implementará
  estadoImplementacion: text("estado_implementacion").default("pendiente"), // "pendiente", "en_proceso", "implementado"
  fechaImplementacionReal: date("fecha_implementacion_real"), // Cuándo se implementó realmente
  
  // Evaluación residual (después de controles)
  nivelProbabilidadResidual: nivelProbabilidadEnum("nivel_probabilidad_residual"),
  nivelSeveridadResidual: nivelSeveridadEnum("nivel_severidad_residual"),
  valorRiesgoResidual: integer("valor_riesgo_residual"), // Riesgo después de controles
  nivelRiesgoResidual: nivelRiesgoEnum("nivel_riesgo_residual"),
  
  // Observaciones y seguimiento
  observaciones: text("observaciones"),
  requiereSeguimiento: integer("requiere_seguimiento").notNull().default(1), // 1 = sí, 0 = no
  proximaRevision: date("proxima_revision"), // Próxima fecha de revisión
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Insert schemas y types para IPERC
export const insertMatrizIpercSchema = createInsertSchema(matricesIperc)
  .omit({ id: true, createdAt: true, updatedAt: true, companyId: true })
  .extend({
    nombre: z.string().min(1, "El nombre de la matriz IPERC es obligatorio"),
    fechaEvaluacion: z.coerce.date(),
    fechaProximaRevision: z.coerce.date().optional().nullable(),
    fechaAprobacion: z.coerce.date().optional().nullable(),
    vigenciaDesde: z.coerce.date().optional().nullable(),
    vigenciaHasta: z.coerce.date().optional().nullable(),
    vigenteAuto: z.number().min(0).max(1).default(1),
    version: z.number().min(1).default(1),
    tipoRegistro: z.enum(["riesgo", "oportunidad"]).default("riesgo"),
  });
export type InsertMatrizIperc = z.infer<typeof insertMatrizIpercSchema>;
export type MatrizIperc = typeof matricesIperc.$inferSelect;

export const insertPeligroIpercSchema = createInsertSchema(peligrosIperc)
  .omit({ id: true, createdAt: true, updatedAt: true, companyId: true })
  .extend({
    matrizId: z.string().min(1, "Debe seleccionar una matriz IPERC"),
    actividadProceso: z.string().min(1, "El proceso/actividad es obligatorio"),
    descripcionPeligro: z.string().min(1, "La descripción del peligro es obligatoria"),
    fuenteGeneradora: z.string().min(1, "La fuente generadora es obligatoria"),
    efectosPosibles: z.string().min(1, "Los efectos posibles son obligatorios"),
    numeroPersonasExpuestas: z.number().min(1, "El número de personas expuestas es obligatorio"),
    valorRiesgo: z.number().min(1).max(16), // GTC-45: Probabilidad (1-4) × Severidad (1-4) = 1-16
    requiereControles: z.number().min(0).max(1),
    requiereSeguimiento: z.number().min(0).max(1),
    valorRiesgoResidual: z.number().min(1).max(16).optional().nullable(),
    fechaImplementacionPropuesta: z.coerce.date().optional().nullable(),
    fechaImplementacionReal: z.coerce.date().optional().nullable(),
    proximaRevision: z.coerce.date().optional().nullable(),
    tipoRegistro: z.enum(["riesgo", "oportunidad"]).default("riesgo"),
  });
export type InsertPeligroIperc = z.infer<typeof insertPeligroIpercSchema>;
export type PeligroIperc = typeof peligrosIperc.$inferSelect;

// Tabla de asignación de peligros a trabajadores por área/cargo
// Permite vincular riesgos identificados con trabajadores específicos
export const peligrosTrabajadoresAsignacion = pgTable("peligros_trabajadores_asignacion", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  peligroId: varchar("peligro_id").notNull().references(() => peligrosIperc.id, { onDelete: "cascade" }),
  
  // Asignación por área/cargo (al menos uno debe estar presente)
  department: text("department"), // Si está presente, aplica a todos los trabajadores de este departamento
  position: text("position"), // Si está presente, aplica a todos los trabajadores con este cargo
  
  // Metadata de asignación
  asignadoPor: varchar("asignado_por").references(() => users.id),
  fechaAsignacion: timestamp("fecha_asignacion").notNull().default(sql`now()`),
  activo: integer("activo").notNull().default(1), // 1 = activo, 0 = inactivo
  observaciones: text("observaciones"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertPeligroTrabajadorAsignacionSchema = createInsertSchema(peligrosTrabajadoresAsignacion)
  .omit({ id: true, createdAt: true, companyId: true })
  .extend({
    activo: z.number().min(0).max(1).default(1),
    fechaAsignacion: z.coerce.date().optional(),
  })
  .refine(data => data.department || data.position, {
    message: "Debe especificar al menos un departamento o cargo para la asignación",
  });
export type InsertPeligroTrabajadorAsignacion = z.infer<typeof insertPeligroTrabajadorAsignacionSchema>;
export type PeligroTrabajadorAsignacion = typeof peligrosTrabajadoresAsignacion.$inferSelect;

// ============================================================================
// MÓDULO DE AUDITORÍAS INTERNAS SST
// Resolución 0312/2019 e ISO 45001:2018
// ============================================================================

// Enums para Auditorías Internas
export const auditoriaEstadoEnum = pgEnum("auditoria_estado", [
  "programada",
  "en_ejecucion",
  "completada",
  "cerrada"
]);

export const auditoriaTipoEnum = pgEnum("auditoria_tipo", [
  "interna",
  "externa",
  "seguimiento"
]);

export const auditoriaNormaEnum = pgEnum("auditoria_norma", [
  "ISO_45001",
  "res_0312_2019",
  "ambas"
]);

export const hallazgoTipoEnum = pgEnum("hallazgo_tipo", [
  "conformidad",
  "no_conformidad_menor",
  "no_conformidad_mayor",
  "observacion"
]);

export const hallazgoSeveridadEnum = pgEnum("hallazgo_severidad", [
  "baja",
  "media",
  "alta",
  "critica"
]);

export const planAccionEstadoEnum = pgEnum("plan_accion_estado", [
  "abierto",
  "en_progreso",
  "completado",
  "verificado",
  "cerrado"
]);

// Tabla principal de auditorías internas
export const auditoriasInternas = pgTable("auditorias_internas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  
  // Información básica de la auditoría
  codigo: text("codigo").notNull(), // Código único de auditoría (ej: "AUD-INT-2025-001")
  titulo: text("titulo").notNull(),
  tipo: auditoriaTipoEnum("tipo").notNull(),
  normaReferencia: auditoriaNormaEnum("norma_referencia").notNull(),
  objetivo: text("objetivo").notNull(), // Objetivo de la auditoría
  alcance: text("alcance").notNull(), // Alcance (áreas, procesos, estándares)
  
  // Fechas de planificación
  fechaProgramada: date("fecha_programada").notNull(),
  fechaInicio: date("fecha_inicio"),
  fechaFin: date("fecha_fin"),
  duracionEstimadaHoras: integer("duracion_estimada_horas"), // Duración estimada en horas
  
  // Responsables
  auditoristaLider: text("auditorista_lider").notNull(), // Nombre del auditor líder
  auditoristaLiderId: varchar("auditorista_lider_id").references(() => users.id),
  responsableAuditado: text("responsable_auditado"), // Responsable del área auditada
  responsableAuditadoId: varchar("responsable_auditado_id").references(() => users.id),
  
  // Estado y resultados
  estado: auditoriaEstadoEnum("estado").notNull().default("programada"),
  numeroHallazgos: integer("numero_hallazgos").default(0), // Total de hallazgos
  numeroConformidades: integer("numero_conformidades").default(0),
  numeroNoConformidadesMenores: integer("numero_no_conformidades_menores").default(0),
  numeroNoConformidadesMayores: integer("numero_no_conformidades_mayores").default(0),
  numeroObservaciones: integer("numero_observaciones").default(0),
  porcentajeCumplimiento: integer("porcentaje_cumplimiento"), // % de cumplimiento general
  
  // Informe final
  conclusiones: text("conclusiones"), // Conclusiones generales
  recomendaciones: text("recomendaciones"), // Recomendaciones generales
  fechaInforme: date("fecha_informe"), // Fecha de emisión del informe
  archivoInforme: text("archivo_informe"), // Ruta al PDF del informe
  
  // Aprobación y cierre
  aprobadoPor: text("aprobado_por"),
  aprobadoPorId: varchar("aprobado_por_id").references(() => users.id),
  fechaAprobacion: date("fecha_aprobacion"),
  observacionesCierre: text("observaciones_cierre"),
  
  // Integración con COPASST - Estándar 6.1.4 Resolución 0312/2019
  planificadaConCopasst: boolean("planificada_con_copasst").default(false), // Si fue planificada con participación COPASST
  copasstActaId: varchar("copasst_acta_id").references(() => copasstActas.id), // Acta COPASST donde se planificó/discutió
  observacionesCopasst: text("observaciones_copasst"), // Observaciones del comité COPASST
  fechaAprobacionCopasst: date("fecha_aprobacion_copasst"), // Fecha en que el COPASST aprobó el plan de auditoría
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Tabla de auditores asignados a cada auditoría
export const auditoriaAuditores = pgTable("auditoria_auditores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  auditoriaId: varchar("auditoria_id").notNull().references(() => auditoriasInternas.id, { onDelete: "cascade" }),
  
  // Auditor interno (usuario del sistema) o externo
  auditorId: varchar("auditor_id").references(() => users.id), // NULL si es auditor externo
  nombreExterno: text("nombre_externo"), // Nombre si es auditor externo
  emailExterno: text("email_externo"), // Email si es auditor externo
  organizacionExterna: text("organizacion_externa"), // Organización externa
  
  // Rol en la auditoría
  rol: text("rol").notNull().default("auditor"), // "auditor_lider", "auditor", "observador"
  areasAsignadas: text("areas_asignadas"), // Áreas que auditará este auditor
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Tabla de listas de verificación (checklists) de la auditoría
export const auditoriaChecklists = pgTable("auditoria_checklists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  auditoriaId: varchar("auditoria_id").notNull().references(() => auditoriasInternas.id, { onDelete: "cascade" }),
  
  // Criterio de auditoría
  numeroItem: integer("numero_item").notNull(), // Número del ítem en la lista
  criterioAuditoria: text("criterio_auditoria").notNull(), // Requisito o criterio a verificar
  clausulaReferencia: text("clausula_referencia"), // Cláusula de la norma (ej: "ISO 45001:2018 - 5.1")
  areaProcesoAuditado: text("area_proceso_auditado"), // Área o proceso específico
  
  // Evidencias y resultados
  cumple: integer("cumple"), // 1 = cumple, 0 = no cumple, NULL = no evaluado aún
  evidenciasObtenidas: text("evidencias_obtenidas"), // Descripción de evidencias encontradas
  observaciones: text("observaciones"), // Observaciones del auditor
  archivoEvidencia: text("archivo_evidencia"), // Ruta a archivo de evidencia (foto, doc)
  
  // Evaluación
  evaluadoPor: text("evaluado_por"), // Nombre del auditor que evaluó
  evaluadoPorId: varchar("evaluado_por_id").references(() => users.id),
  fechaEvaluacion: date("fecha_evaluacion"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Tabla de hallazgos de auditoría
export const hallazgosAuditoria = pgTable("hallazgos_auditoria", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  auditoriaId: varchar("auditoria_id").notNull().references(() => auditoriasInternas.id),
  
  // Clasificación del hallazgo
  numeroHallazgo: text("numero_hallazgo").notNull(), // Código del hallazgo (ej: "NC-MAY-001")
  tipo: hallazgoTipoEnum("tipo").notNull(),
  severidad: hallazgoSeveridadEnum("severidad").notNull(),
  
  // Descripción del hallazgo
  descripcion: text("descripcion").notNull(), // Descripción detallada del hallazgo
  requisito: text("requisito").notNull(), // Requisito o cláusula incumplida
  clausulaReferencia: text("clausula_referencia"), // Referencia de la norma
  areaAfectada: text("area_afectada").notNull(), // Área o proceso afectado
  
  // Evidencias
  evidencia: text("evidencia"), // Evidencia objetiva del hallazgo
  archivoEvidencia: text("archivo_evidencia"), // Ruta a fotos/docs de evidencia
  causaRaiz: text("causa_raiz"), // Análisis de causa raíz
  
  // Responsables
  detectadoPor: text("detectado_por"), // Auditor que detectó el hallazgo
  detectadoPorId: varchar("detectado_por_id").references(() => users.id),
  fechaDeteccion: date("fecha_deteccion").notNull(),
  responsableArea: text("responsable_area"), // Responsable del área afectada
  responsableAreaId: varchar("responsable_area_id").references(() => users.id),
  
  // Estado del hallazgo
  estadoCierre: text("estado_cierre").default("abierto"), // "abierto", "en_correccion", "verificado", "cerrado"
  fechaCierre: date("fecha_cierre"),
  verificadoPor: text("verificado_por"),
  verificadoPorId: varchar("verificado_por_id").references(() => users.id),
  observacionesCierre: text("observaciones_cierre"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Tabla de planes de acción para hallazgos
export const planesAccionAuditoria = pgTable("planes_accion_auditoria", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  hallazgoId: varchar("hallazgo_id").notNull().references(() => hallazgosAuditoria.id, { onDelete: "cascade" }),
  
  // Acción correctiva/preventiva
  numeroAccion: text("numero_accion").notNull(), // Código de la acción (ej: "ACC-001")
  tipoAccion: text("tipo_accion").notNull(), // "correctiva", "preventiva", "mejora"
  descripcionAccion: text("descripcion_accion").notNull(), // Descripción de la acción a tomar
  justificacion: text("justificacion"), // Por qué se toma esta acción
  
  // Responsable y plazos
  responsable: text("responsable").notNull(), // Nombre del responsable
  responsableId: varchar("responsable_id").references(() => users.id),
  fechaCompromiso: date("fecha_compromiso").notNull(), // Fecha límite comprometida
  fechaImplementacion: date("fecha_implementacion"), // Fecha real de implementación
  
  // Estado y seguimiento
  estado: planAccionEstadoEnum("estado").notNull().default("abierto"),
  porcentajeAvance: integer("porcentaje_avance").default(0), // 0-100%
  observacionesAvance: text("observaciones_avance"), // Comentarios de progreso
  
  // Verificación de eficacia
  requiereVerificacion: integer("requiere_verificacion").default(1), // 1 = sí, 0 = no
  fechaVerificacion: date("fecha_verificacion"),
  verificadoPor: text("verificado_por"),
  verificadoPorId: varchar("verificado_por_id").references(() => users.id),
  resultadoVerificacion: text("resultado_verificacion"), // Resultado de la verificación de eficacia
  eficaz: integer("eficaz"), // 1 = eficaz, 0 = no eficaz, NULL = no verificado
  
  // Recursos necesarios
  recursosNecesarios: text("recursos_necesarios"), // Recursos (humanos, técnicos, financieros)
  presupuestoEstimado: integer("presupuesto_estimado"), // Presupuesto en pesos colombianos
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Insert schemas y types para Auditorías Internas
export const insertAuditoriaInternaSchema = createInsertSchema(auditoriasInternas)
  .omit({ id: true, createdAt: true, updatedAt: true, companyId: true })
  .extend({
    titulo: z.string().min(1, "El título de la auditoría es obligatorio"),
    objetivo: z.string().min(1, "El objetivo es obligatorio"),
    alcance: z.string().min(1, "El alcance es obligatorio"),
    fechaProgramada: z.coerce.date(),
    fechaInicio: z.coerce.date().optional().nullable(),
    fechaFin: z.coerce.date().optional().nullable(),
    fechaInforme: z.coerce.date().optional().nullable(),
    fechaAprobacion: z.coerce.date().optional().nullable(),
    fechaAprobacionCopasst: z.coerce.date().optional().nullable(),
    duracionEstimadaHoras: z.number().min(1).optional().nullable(),
    numeroHallazgos: z.number().min(0).default(0),
    numeroConformidades: z.number().min(0).default(0),
    numeroNoConformidadesMenores: z.number().min(0).default(0),
    numeroNoConformidadesMayores: z.number().min(0).default(0),
    numeroObservaciones: z.number().min(0).default(0),
    porcentajeCumplimiento: z.number().min(0).max(100).optional().nullable(),
  });
export type InsertAuditoriaInterna = z.infer<typeof insertAuditoriaInternaSchema>;
export type AuditoriaInterna = typeof auditoriasInternas.$inferSelect;

export const insertAuditoriaAuditorSchema = createInsertSchema(auditoriaAuditores)
  .omit({ id: true, createdAt: true });
export type InsertAuditoriaAuditor = z.infer<typeof insertAuditoriaAuditorSchema>;
export type AuditoriaAuditor = typeof auditoriaAuditores.$inferSelect;

export const insertAuditoriaChecklistSchema = createInsertSchema(auditoriaChecklists)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    numeroItem: z.number().min(1),
    cumple: z.number().min(0).max(1).optional().nullable(),
    fechaEvaluacion: z.coerce.date().optional().nullable(),
  });
export type InsertAuditoriaChecklist = z.infer<typeof insertAuditoriaChecklistSchema>;
export type AuditoriaChecklist = typeof auditoriaChecklists.$inferSelect;

export const insertHallazgoAuditoriaSchema = createInsertSchema(hallazgosAuditoria)
  .omit({ id: true, createdAt: true, updatedAt: true, companyId: true })
  .extend({
    fechaDeteccion: z.coerce.date(),
    fechaCierre: z.coerce.date().optional().nullable(),
  });
export type InsertHallazgoAuditoria = z.infer<typeof insertHallazgoAuditoriaSchema>;
export type HallazgoAuditoria = typeof hallazgosAuditoria.$inferSelect;

export const insertPlanAccionAuditoriaSchema = createInsertSchema(planesAccionAuditoria)
  .omit({ id: true, createdAt: true, updatedAt: true, companyId: true })
  .extend({
    fechaCompromiso: z.coerce.date(),
    fechaImplementacion: z.coerce.date().optional().nullable(),
    fechaVerificacion: z.coerce.date().optional().nullable(),
    porcentajeAvance: z.number().min(0).max(100).default(0),
    requiereVerificacion: z.number().min(0).max(1).default(1),
    eficaz: z.number().min(0).max(1).optional().nullable(),
    presupuestoEstimado: z.number().min(0).optional().nullable(),
  });
export type InsertPlanAccionAuditoria = z.infer<typeof insertPlanAccionAuditoriaSchema>;
export type PlanAccionAuditoria = typeof planesAccionAuditoria.$inferSelect;

// ============================================================================
// REVISIÓN POR DIRECCIÓN - ISO 45001:2018 Cláusula 9.3 / Resolución 0312/2019
// ============================================================================

// Enums para Revisión por Dirección
export const tipoParticipanteRevisionEnum = pgEnum("tipo_participante_revision", [
  "alta_direccion",         // Gerente General, Director, Presidente
  "coordinador_sst",        // Responsable del SG-SST
  "copasst",                // Representante COPASST
  "rrhh",                   // Jefe de RRHH
  "operaciones",            // Jefe de Operaciones
  "otro"                    // Otro participante relevante
]);

export const tipoTemaRevisionEnum = pgEnum("tipo_tema_revision", [
  "indicadores_sst",        // Análisis de indicadores de desempeño SST
  "objetivos_metas",        // Cumplimiento de objetivos y metas
  "auditorias",             // Resultados de auditorías internas/externas
  "accidentes_incidentes",  // Análisis de accidentalidad e incidentalidad
  "enfermedades",           // Enfermedades laborales diagnosticadas
  "capacitaciones",         // Cumplimiento del programa de capacitación
  "recursos",               // Asignación y necesidades de recursos
  "cambios_normativos",     // Cambios en legislación SST
  "no_conformidades",       // No conformidades y hallazgos
  "mejora_continua",        // Oportunidades de mejora identificadas
  "contexto_organizacion",  // Cambios en el contexto de la organización
  "otro"                    // Otro tema relevante
]);

export const tipoDecisionRevisionEnum = pgEnum("tipo_decision_revision", [
  "mejora_continua",        // Implementar mejora en proceso/sistema
  "cambio_politica",        // Modificar Política SST
  "asignacion_recursos",    // Asignar recursos adicionales
  "cambio_objetivos",       // Modificar objetivos SST
  "nueva_accion",           // Iniciar nueva acción correctiva/preventiva
  "mantener",               // Mantener situación actual
  "otro"                    // Otra decisión estratégica
]);

export const estadoRevisionDireccionEnum = pgEnum("estado_revision_direccion", [
  "programada",             // Revisión programada
  "en_ejecucion",           // Revisión en curso
  "completada",             // Revisión realizada, acta completa
  "aprobada",               // Acta aprobada por Alta Dirección
  "seguimiento"             // En seguimiento de decisiones
]);

// Tabla principal: Revisiones por la Dirección (Actas de Revisión Gerencial)
export const revisionesDireccion = pgTable("revisiones_direccion", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  
  // Identificación de la revisión
  codigo: text("codigo").notNull().unique(),
  fechaRevision: date("fecha_revision").notNull(),
  periodicidad: text("periodicidad").notNull(), // "mensual", "trimestral", "semestral", "anual"
  titulo: text("titulo").notNull(),
  
  // Contexto y estado
  estado: estadoRevisionDireccionEnum("estado").notNull().default("programada"),
  lugar: text("lugar"), // Sala de juntas, virtual, etc.
  duracion: integer("duracion"), // Duración en minutos
  
  // Contenido del acta
  antecedentes: text("antecedentes"), // Contexto y antecedentes
  resumenEjecutivo: text("resumen_ejecutivo"), // Resumen de lo discutido
  conclusiones: text("conclusiones"), // Conclusiones generales
  
  // Aprobación
  aprobadoPor: varchar("aprobado_por").references(() => users.id), // ID del usuario que aprobó
  fechaAprobacion: date("fecha_aprobacion"),
  
  // Seguimiento
  proximaRevision: date("proxima_revision"), // Fecha programada de próxima revisión
  
  // Auditoría
  creadoPor: varchar("creado_por").references(() => users.id),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Participantes de la Revisión por Dirección
export const participantesRevision = pgTable("participantes_revision", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  revisionId: varchar("revision_id").notNull().references(() => revisionesDireccion.id, { onDelete: "cascade" }),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  
  // Información del participante
  userId: varchar("user_id").references(() => users.id), // Usuario si está en el sistema
  nombre: text("nombre").notNull(), // Nombre del participante
  cargo: text("cargo").notNull(), // Cargo en la empresa
  tipo: tipoParticipanteRevisionEnum("tipo").notNull(),
  
  // Participación
  asistio: integer("asistio").notNull().default(1), // 1=asistió, 0=no asistió
  observaciones: text("observaciones"), // Observaciones del participante
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Temas tratados en la Revisión por Dirección
// Nota: Schema híbrido - mantiene columnas legacy (responsablePresentacion, tiempoAsignado, conclusiones)
// + nuevas columnas ISO-compliant (tipo, datosAnalisis, hallazgos, oportunidadesMejora)
// para permitir migración gradual de datos existentes
export const temasRevision = pgTable("temas_revision", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  revisionId: varchar("revision_id").notNull().references(() => revisionesDireccion.id, { onDelete: "cascade" }),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  
  // Identificación del tema
  titulo: text("titulo").notNull(),
  descripcion: text("descripcion").notNull(),
  
  // Legacy metadata (columnas existentes en BD de producción)
  responsablePresentacion: varchar("responsable_presentacion").references(() => users.id), // Usuario que presenta
  tiempoAsignado: integer("tiempo_asignado"), // Minutos asignados para presentación
  conclusiones: text("conclusiones"), // Conclusiones generales (deprecated - migrar a hallazgos/oportunidadesMejora)
  
  // Columnas ISO 45001:2018 compliant (añadidas para granularidad)
  tipo: tipoTemaRevisionEnum("tipo"), // Categorización del tema (nullable para migración gradual)
  datosAnalisis: text("datos_analisis"), // Datos/indicadores presentados (JSON string)
  hallazgos: text("hallazgos"), // Hallazgos identificados durante la revisión
  oportunidadesMejora: text("oportunidades_mejora"), // Oportunidades de mejora detectadas
  
  // Orden de presentación
  orden: integer("orden").notNull().default(0),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Decisiones tomadas en la Revisión por Dirección
export const decisionesRevision = pgTable("decisiones_revision", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  revisionId: varchar("revision_id").notNull().references(() => revisionesDireccion.id, { onDelete: "cascade" }),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  
  // Identificación de la decisión
  tipo: tipoDecisionRevisionEnum("tipo").notNull(),
  descripcion: text("descripcion").notNull(),
  justificacion: text("justificacion"), // Por qué se tomó esta decisión
  
  // Impacto y alcance
  alcance: text("alcance"), // Áreas/procesos afectados
  recursoNecesario: text("recurso_necesario"), // Recursos necesarios para implementar
  
  // Seguimiento
  requiereAccion: integer("requiere_accion").notNull().default(1), // 1=sí, 0=no
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Acciones derivadas de las Decisiones de Revisión por Dirección
// Nota: Reutiliza estadoAccionEnum y prioridadMejoraEnum existentes para consistencia
export const accionesRevision = pgTable("acciones_revision", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  decisionId: varchar("decision_id").notNull().references(() => decisionesRevision.id, { onDelete: "cascade" }),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  
  // Identificación de la acción
  descripcion: text("descripcion").notNull(),
  
  // Responsabilidad y plazos
  responsable: varchar("responsable").references(() => users.id), // Usuario responsable
  responsableNombre: text("responsable_nombre").notNull(), // Nombre del responsable (puede ser externo)
  fechaCompromiso: date("fecha_compromiso").notNull(),
  fechaImplementacion: date("fecha_implementacion"),
  
  // Prioridad y estado (reutilizando enums existentes)
  prioridad: prioridadMejoraEnum("prioridad").notNull().default("media"),
  estado: estadoAccionEnum("estado").notNull().default("pendiente"),
  
  // Seguimiento
  avanceDescripcion: text("avance_descripcion"), // Descripción del avance
  porcentajeAvance: integer("porcentaje_avance").notNull().default(0), // 0-100
  evidenciaUrl: text("evidencia_url"), // URL de evidencia de cumplimiento
  
  // Verificación
  verificadoPor: varchar("verificado_por").references(() => users.id),
  fechaVerificacion: date("fecha_verificacion"),
  eficaz: integer("eficaz"), // 1=eficaz, 0=no eficaz, null=no verificado
  observacionesVerificacion: text("observaciones_verificacion"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// ============================================================================
// SCHEMAS DE VALIDACIÓN - Revisión por Dirección
// ============================================================================

export const insertRevisionDireccionSchema = createInsertSchema(revisionesDireccion)
  .omit({ id: true, createdAt: true, updatedAt: true, companyId: true })
  .extend({
    titulo: z.string().min(1, "El título de la revisión es obligatorio"),
    codigo: z.string().min(1, "El código es obligatorio"),
    fechaRevision: z.coerce.date(),
    fechaAprobacion: z.coerce.date().optional().nullable(),
    proximaRevision: z.coerce.date().optional().nullable(),
    duracion: z.number().min(0).optional().nullable(),
  });
export type InsertRevisionDireccion = z.infer<typeof insertRevisionDireccionSchema>;
export type RevisionDireccion = typeof revisionesDireccion.$inferSelect;

export const insertParticipanteRevisionSchema = createInsertSchema(participantesRevision)
  .omit({ id: true, createdAt: true, companyId: true })
  .extend({
    asistio: z.number().min(0).max(1).default(1),
  });
export type InsertParticipanteRevision = z.infer<typeof insertParticipanteRevisionSchema>;
export type ParticipanteRevision = typeof participantesRevision.$inferSelect;

export const insertTemaRevisionSchema = createInsertSchema(temasRevision)
  .omit({ id: true, createdAt: true, companyId: true })
  .extend({
    orden: z.number().min(0).default(0),
  });
export type InsertTemaRevision = z.infer<typeof insertTemaRevisionSchema>;
export type TemaRevision = typeof temasRevision.$inferSelect;

export const insertDecisionRevisionSchema = createInsertSchema(decisionesRevision)
  .omit({ id: true, createdAt: true, companyId: true })
  .extend({
    requiereAccion: z.number().min(0).max(1).default(1),
  });
export type InsertDecisionRevision = z.infer<typeof insertDecisionRevisionSchema>;
export type DecisionRevision = typeof decisionesRevision.$inferSelect;

export const insertAccionRevisionSchema = createInsertSchema(accionesRevision)
  .omit({ id: true, createdAt: true, updatedAt: true, companyId: true })
  .extend({
    fechaCompromiso: z.coerce.date(),
    fechaImplementacion: z.coerce.date().optional().nullable(),
    fechaVerificacion: z.coerce.date().optional().nullable(),
    porcentajeAvance: z.number().min(0).max(100).default(0),
    eficaz: z.number().min(0).max(1).optional().nullable(),
  });
export type InsertAccionRevision = z.infer<typeof insertAccionRevisionSchema>;
export type AccionRevision = typeof accionesRevision.$inferSelect;

// ============================================================================
// AUDIT LOGS - Sistema de Auditoría Legal (Bloque 2: Infraestructura)
// ============================================================================
// Cumple con:
// - Ley 1581/2012 (Habeas Data)
// - Decreto 1074/2015 (Registros SST - 20 años)
// - Resolución 2346/2007 (Historia Clínica Ocupacional)

export const auditActionEnum = pgEnum("audit_action", [
  "create",
  "update", 
  "delete",
  "view",
  "export",
  "access_report"
]);

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  
  // WHO - Quién realizó la acción
  userId: varchar("user_id").notNull().references(() => users.id),
  userRole: text("user_role").notNull(), // Denormalized for audit trail
  username: text("username").notNull(), // Denormalized for audit trail
  
  // WHAT - Qué entidad fue afectada
  entityType: text("entity_type").notNull(), // "worker", "accident", "medical_exam", etc.
  entityId: text("entity_id").notNull(), // ID del registro afectado
  action: auditActionEnum("action").notNull(),
  
  // SUBJECT - Afectado (para Habeas Data)
  dataSubjectId: text("data_subject_id"), // WorkerId si aplica
  dataSubjectName: text("data_subject_name"), // Nombre del trabajador
  
  // CHANGES - Registro de cambios (JSONB para flexibilidad)
  oldValues: text("old_values"), // JSON string de valores anteriores (full snapshot)
  newValues: text("new_values"), // JSON string de valores nuevos (full snapshot)
  changedFields: text("changed_fields"), // Array de campos modificados (para updates)
  
  // WHEN & WHERE - Contexto temporal y geográfico
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  requestId: text("request_id"), // Correlación con Pino logs
  
  // CONTEXT - Descripción legible
  description: text("description"),
  source: text("source").default("api"), // "api", "batch", "migration"
  
  // IMMUTABILITY - Registros de auditoría NO se modifican ni eliminan
  // No updatedAt field - audit logs are write-once
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Consent Records Validation Schemas
export const insertConsentRecordSchema = createInsertSchema(consentRecords)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    grantedAt: z.coerce.date().optional(),
    revokedAt: z.coerce.date().optional().nullable(),
    expiresAt: z.coerce.date().optional().nullable(),
  });
export type InsertConsentRecord = z.infer<typeof insertConsentRecordSchema>;
export type ConsentRecord = typeof consentRecords.$inferSelect;

// ARCO Requests Validation Schemas
export const insertArcoRequestSchema = createInsertSchema(arcoRequests)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    isRepresentative: z.number().min(0).max(1).default(0),
    representativeVerified: z.number().min(0).max(1).optional().nullable(),
    representativeVerifiedAt: z.coerce.date().optional().nullable(),
    assignedAt: z.coerce.date().optional().nullable(),
    escalatedAt: z.coerce.date().optional().nullable(),
    responseDate: z.coerce.date().optional().nullable(),
    submittedAt: z.coerce.date().optional(),
    legalDeadline: z.coerce.date().optional(),
    reminderSentAt: z.coerce.date().optional().nullable(),
    completedAt: z.coerce.date().optional().nullable(),
  });
export type InsertArcoRequest = z.infer<typeof insertArcoRequestSchema>;
export type ArcoRequest = typeof arcoRequests.$inferSelect;

// Validation schemas
export const insertAuditLogSchema = createInsertSchema(auditLogs)
  .omit({ id: true, createdAt: true });
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

// ============================================================================
// SUBSCRIPTION SYSTEM - Sistema de Facturación (Bloque 4: Monetización)
// ============================================================================
// Sistema SaaS de suscripciones con Wompi (Pasarela de Pagos Colombia)
// - Planes de suscripción (Basic/Pro/Enterprise)
// - Pagos recurrentes automatizados
// - Facturación electrónica DIAN incluida
// - Trials gratuitos
// - Gestión de límites por plan

// Subscription Plans
export const billingIntervalEnum = pgEnum("billing_interval", ["monthly", "yearly"]);
export const planStatusEnum = pgEnum("plan_status", ["active", "archived"]);

export const subscriptionPlans = pgTable("subscription_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // "esencial", "profesional", "empresarial", "corporativo"
  displayName: text("display_name").notNull(), // "Plan Esencial", "Plan Profesional", etc.
  description: text("description"),
  tagline: text("tagline"), // Subtítulo para marketing ("Ideal para microempresas")
  
  // Pricing - Using bigint to support large annual prices (e.g., $43,200,000 COP = 4320000000 centavos)
  priceMonthly: bigint("price_monthly", { mode: "number" }).notNull(), // En centavos COP (e.g., 19900000 = $199,000 COP)
  priceYearly: bigint("price_yearly", { mode: "number" }), // En centavos COP (opcional, con descuento)
  currency: text("currency").notNull().default("COP"),
  
  // Límites del plan
  maxWorkers: integer("max_workers").notNull().default(50), // -1 = ilimitado
  maxUsers: integer("max_users").notNull().default(3),
  maxCompanies: integer("max_companies").notNull().default(1),
  maxSedes: integer("max_sedes").notNull().default(1), // Máximo número de sedes/plantas
  storageGB: integer("storage_gb").notNull().default(5), // Almacenamiento en GB
  
  // Features generales (array para UI)
  features: text("features").array(), // ["Gestión de accidentes", "Inspecciones", "PESV", etc.]
  
  // Feature flags específicos (para validación backend)
  hasIPERCCompleto: integer("has_iperc_completo").notNull().default(0), // 1 = IPERC completo con GTC-45
  hasAuditorias: integer("has_auditorias").notNull().default(0), // 1 = Auditorías Internas SST
  hasPESV: integer("has_pesv").notNull().default(0), // 1 = Módulo PESV completo
  hasRevisionDireccion: integer("has_revision_direccion").notNull().default(0), // 1 = Revisión por Dirección
  hasGestionCambios: integer("has_gestion_cambios").notNull().default(0), // 1 = Gestión de Cambios
  hasMatrizLegal: integer("has_matriz_legal").notNull().default(0), // 1 = Matriz Legal actualizada automáticamente
  hasObjetivosIndicadores: integer("has_objetivos_indicadores").notNull().default(0), // 1 = Objetivos e Indicadores SST
  hasEvaluacionProveedores: integer("has_evaluacion_proveedores").notNull().default(0), // 1 = Evaluación Proveedores
  hasComunicacionSST: integer("has_comunicacion_sst").notNull().default(0), // 1 = Comunicación SST
  hasAdquisicionesSST: integer("has_adquisiciones_sst").notNull().default(0), // 1 = Adquisiciones SST
  hasDashboardsEjecutivos: integer("has_dashboards_ejecutivos").notNull().default(0), // 1 = Dashboards PHVA
  hasPDFsNormativos: integer("has_pdfs_normativos").notNull().default(0), // 1 = Generación PDFs normativos
  hasExamenesMedicos: integer("has_examenes_medicos").notNull().default(0), // 1 = Exámenes médicos y vigilancia
  hasMedicionesAmbientales: integer("has_mediciones_ambientales").notNull().default(0), // 1 = Mediciones ambientales
  hasSustanciasQuimicas: integer("has_sustancias_quimicas").notNull().default(0), // 1 = Gestión sustancias químicas
  hasCOPASST: integer("has_copasst").notNull().default(0), // 1 = COPASST
  hasComiteConvivencia: integer("has_comite_convivencia").notNull().default(0), // 1 = Comité de Convivencia
  hasAPI: integer("has_api").notNull().default(0), // 1 = Acceso API REST
  hasExportacionMasiva: integer("has_exportacion_masiva").notNull().default(0), // 1 = Exportación masiva Excel/CSV
  hasWhiteLabel: integer("has_white_label").notNull().default(0), // 1 = White-label (marca propia)
  hasSLA: integer("has_sla").notNull().default(0), // 1 = SLA garantizado 99.9%
  hasGerenteCuenta: integer("has_gerente_cuenta").notNull().default(0), // 1 = Gerente de cuenta dedicado
  hasConsultoriaSST: integer("has_consultoria_sst").notNull().default(0), // 1 = Consultoría SST incluida
  horasConsultoriaMes: integer("horas_consultoria_mes").notNull().default(0), // Horas de consultoría/mes
  
  // Soporte
  supportLevel: text("support_level").notNull().default("email"), // "email", "chat_email", "phone", "24_7"
  supportResponseTime: text("support_response_time").notNull().default("48h"), // "48h", "24h", "12h", "4h", "2h"
  
  // Capacitación incluida
  capacitacionesAnuales: integer("capacitaciones_anuales").notNull().default(0), // Número de sesiones incluidas
  horasPorCapacitacion: integer("horas_por_capacitacion").notNull().default(0), // Duración de cada sesión
  
  // Trial settings
  trialDays: integer("trial_days").default(30), // Días de prueba gratuita
  
  // Status y marketing
  status: planStatusEnum("status").notNull().default("active"),
  isPopular: integer("is_popular").default(0), // 1 = marcar como "Más popular"
  isRecommended: integer("is_recommended").default(0), // 1 = marcar como "Recomendado"
  sortOrder: integer("sort_order").default(0), // Para ordenar en UI
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Company Subscriptions
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "trial",           // En período de prueba
  "active",          // Activa y al día
  "past_due",        // Pago vencido pero aún activa
  "suspended",       // Suspendida por falta de pago
  "canceled",        // Cancelada por el usuario
  "expired"          // Expirada
]);

// Plan Change Management (Bloque 4 - Tarea 8: Upgrade/Downgrade)
export const planChangeTypeEnum = pgEnum("plan_change_type", [
  "upgrade",           // Cambio a plan superior
  "downgrade",         // Cambio a plan inferior
  "trial_conversion"   // Conversión de prueba a plan pago
]);

export const planChangeStatusEnum = pgEnum("plan_change_status", [
  "pending_payment",   // Esperando confirmación de pago (upgrades)
  "completed",         // Cambio completado exitosamente
  "failed"             // Cambio falló (pago rechazado, validación, etc.)
]);

export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id).unique(), // One subscription per company
  planId: varchar("plan_id").notNull().references(() => subscriptionPlans.id),
  
  // Worker limit purchased - cantidad de trabajadores que el cliente pagó
  // Este campo limita cuántos trabajadores puede registrar (validado por checkWorkerLimit middleware)
  workersPurchased: integer("workers_purchased").default(2), // Mínimo 2 para Microempresa
  
  // Status
  status: subscriptionStatusEnum("status").notNull().default("trial"),
  
  // Billing
  billingInterval: billingIntervalEnum("billing_interval").notNull().default("monthly"),
  currentPeriodStart: timestamp("current_period_start").notNull().default(sql`now()`),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  
  // Trial
  trialStart: timestamp("trial_start"),
  trialEnd: timestamp("trial_end"),
  
  // Cancellation
  cancelAtPeriodEnd: integer("cancel_at_period_end").default(0), // 1 = cancelar al final del período
  canceledAt: timestamp("canceled_at"),
  cancellationReason: text("cancellation_reason"),
  
  // Payment tracking
  lastPaymentDate: timestamp("last_payment_date"),
  nextPaymentDate: timestamp("next_payment_date"),
  failedPaymentAttempts: integer("failed_payment_attempts").default(0),
  
  // Metadata (Bloque 4 - Tarea 8: Plan Changes)
  metadata: jsonb("metadata"), // { credit: COP, creditDate, creditReason, lastPlanChangeId, customNotes }
  notes: text("notes"),
  
  // Contract Acceptance (Ley 527/1999 - Comercio Electrónico)
  contractAcceptedAt: timestamp("contract_accepted_at"), // Fecha de aceptación del contrato
  contractTermsVersion: text("contract_terms_version"), // Versión del contrato aceptado (e.g., "1.0")
  contractData: jsonb("contract_data"), // { acceptedTerms, acceptedDataTreatment, acceptedAutoRenewal, planName, ipAddress }
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Payment Sources (Wompi Tokenization)
export const paymentSourceTypeEnum = pgEnum("payment_source_type", [
  "CARD",                    // Tarjeta crédito/débito
  "NEQUI",                   // Nequi
  "BANCOLOMBIA_TRANSFER",    // Transferencia Bancolombia
]);

export const paymentSourceStatusEnum = pgEnum("payment_source_status", [
  "available",   // Disponible para usar
  "pending",     // Pendiente de verificación
  "failed",      // Falló la verificación
  "expired",     // Expirado
]);

export const paymentSources = pgTable("payment_sources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  subscriptionId: varchar("subscription_id").notNull().references(() => subscriptions.id),
  
  // Wompi Integration
  wompiPaymentSourceId: integer("wompi_payment_source_id").notNull(), // ID retornado por Wompi
  wompiToken: text("wompi_token"), // Token de la tarjeta (si aplica)
  
  // Payment method details
  type: paymentSourceTypeEnum("type").notNull(),
  status: paymentSourceStatusEnum("status").notNull().default("available"),
  
  // Card details (masked/tokenized)
  cardBrand: text("card_brand"), // Visa, Mastercard, Amex
  cardLastFour: text("card_last_four"), // Últimos 4 dígitos
  cardExpiryMonth: integer("card_expiry_month"),
  cardExpiryYear: integer("card_expiry_year"),
  cardHolderName: text("card_holder_name"),
  
  // Nequi/Bank details
  accountHolderName: text("account_holder_name"),
  
  // Customer info
  customerEmail: text("customer_email").notNull(),
  
  // Default payment method
  isDefault: integer("is_default").default(0), // 1 = método de pago predeterminado
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Payment Transactions (Wompi Payments)
export const transactionStatusEnum = pgEnum("transaction_status", [
  "PENDING",      // Pendiente de confirmación
  "APPROVED",     // Aprobada
  "DECLINED",     // Rechazada
  "VOIDED",       // Anulada
  "ERROR",        // Error en procesamiento
]);

export const transactionTypeEnum = pgEnum("transaction_type", [
  "subscription_payment",  // Pago de suscripción mensual/anual
  "trial_conversion",      // Conversión de trial a pago
  "upgrade",              // Upgrade de plan
  "downgrade",            // Downgrade de plan
  "refund",               // Reembolso
]);

export const paymentTransactions = pgTable("payment_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  subscriptionId: varchar("subscription_id").notNull().references(() => subscriptions.id),
  paymentSourceId: varchar("payment_source_id").references(() => paymentSources.id),
  
  // Wompi Integration
  wompiTransactionId: text("wompi_transaction_id").unique(), // ID de transacción Wompi
  wompiReference: text("wompi_reference").notNull().unique(), // Referencia única
  
  // Transaction details
  type: transactionTypeEnum("type").notNull(),
  status: transactionStatusEnum("status").notNull().default("PENDING"),
  amount: integer("amount").notNull(), // En centavos COP
  currency: text("currency").notNull().default("COP"),
  
  // Payment period
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),
  
  // Wompi response data
  wompiPaymentMethod: text("wompi_payment_method"), // CARD, NEQUI, etc.
  wompiStatusMessage: text("wompi_status_message"),
  wompiErrorCode: text("wompi_error_code"),
  
  // Metadata
  description: text("description"),
  receiptUrl: text("receipt_url"), // URL del comprobante
  invoiceId: varchar("invoice_id"), // FK to invoices (if generated)
  
  // Timestamps
  paidAt: timestamp("paid_at"),
  failedAt: timestamp("failed_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Invoices (Facturación Electrónica)
export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",        // Borrador
  "sent",         // Enviada al cliente
  "paid",         // Pagada
  "overdue",      // Vencida
  "canceled",     // Cancelada
]);

export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  subscriptionId: varchar("subscription_id").notNull().references(() => subscriptions.id),
  transactionId: varchar("transaction_id").references(() => paymentTransactions.id),
  
  // Invoice details
  invoiceNumber: text("invoice_number").notNull().unique(), // SST-2025-001
  status: invoiceStatusEnum("status").notNull().default("draft"),
  
  // Amounts
  subtotal: integer("subtotal").notNull(), // En centavos COP
  taxAmount: integer("tax_amount").notNull().default(0), // IVA
  total: integer("total").notNull(), // Total a pagar
  currency: text("currency").notNull().default("COP"),
  
  // Billing period
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  
  // Due dates
  issueDate: timestamp("issue_date").notNull().default(sql`now()`),
  dueDate: timestamp("due_date").notNull(),
  paidDate: timestamp("paid_date"),
  
  // Customer details (denormalized for invoice record)
  customerName: text("customer_name").notNull(),
  customerNit: text("customer_nit").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerAddress: text("customer_address"),
  
  // Line items (JSON)
  lineItems: text("line_items").notNull(), // JSON: [{ description, quantity, unitPrice, total }]
  
  // DIAN Facturación Electrónica (integrado vía Wompi)
  dianCufe: text("dian_cufe"), // Código Único de Factura Electrónica
  dianXmlUrl: text("dian_xml_url"), // URL del XML enviado a DIAN
  dianPdfUrl: text("dian_pdf_url"), // URL del PDF de la factura
  
  // File attachments
  pdfUrl: text("pdf_url"), // URL del PDF generado localmente
  
  // Email tracking
  emailSentAt: timestamp("email_sent_at"),
  emailSentTo: text("email_sent_to"),
  
  // Notes
  notes: text("notes"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Plan Change History (Bloque 4 - Tarea 8: Upgrade/Downgrade)
// Auditable trail of all plan transitions with proration tracking
export const planChangeHistory = pgTable("plan_change_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // References
  subscriptionId: varchar("subscription_id").notNull().references(() => subscriptions.id),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  
  // Plan change details
  oldPlanId: varchar("old_plan_id").notNull().references(() => subscriptionPlans.id),
  newPlanId: varchar("new_plan_id").notNull().references(() => subscriptionPlans.id),
  
  // Billing snapshot at time of change
  billingInterval: billingIntervalEnum("billing_interval").notNull(),
  billingCycleDays: integer("billing_cycle_days").notNull().default(30),
  
  // Financial tracking (amounts in COP cents)
  proratedCredit: integer("prorated_credit").notNull().default(0), // Credit from old plan
  amountCharged: integer("amount_charged").notNull().default(0), // Amount charged for upgrade (0 for downgrades)
  
  // Payment reference (nullable for downgrades which don't require payment)
  wompiTransactionId: varchar("wompi_transaction_id").references(() => paymentTransactions.id),
  
  // Change metadata
  changeType: planChangeTypeEnum("change_type").notNull(),
  status: planChangeStatusEnum("status").notNull().default("pending_payment"),
  
  // Validation warnings shown to user before change
  validationWarnings: text("validation_warnings").array().default(sql`'{}'`),
  
  // Audit trail
  requestedBy: varchar("requested_by").references(() => users.id), // Nullable for system-initiated
  requestedByRole: userRoleEnum("requested_by_role"), // Nullable for system-initiated
  isAdminOverride: integer("is_admin_override").default(0), // 1 if admin forced despite warnings
  
  // Request context (for compliance - Ley 1581/2012)
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  
  // Additional metadata (JSON for extensibility)
  metadata: jsonb("metadata"), // { reason, previousUsage, featureGates, etc. }
  
  // Timestamps
  requestedAt: timestamp("requested_at").notNull().default(sql`now()`),
  completedAt: timestamp("completed_at"), // When status changed to 'completed'
  effectiveDate: timestamp("effective_date").notNull(), // When plan actually changed
});

// Validation Schemas - Subscription Plans
export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans)
  .omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;

// Validation Schemas - Subscriptions
export const insertSubscriptionSchema = createInsertSchema(subscriptions)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    currentPeriodStart: z.coerce.date().optional(),
    currentPeriodEnd: z.coerce.date(),
    trialStart: z.coerce.date().optional().nullable(),
    trialEnd: z.coerce.date().optional().nullable(),
    canceledAt: z.coerce.date().optional().nullable(),
    lastPaymentDate: z.coerce.date().optional().nullable(),
    nextPaymentDate: z.coerce.date().optional().nullable(),
  });
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

// Validation Schemas - Payment Sources
export const insertPaymentSourceSchema = createInsertSchema(paymentSources)
  .omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPaymentSource = z.infer<typeof insertPaymentSourceSchema>;
export type PaymentSource = typeof paymentSources.$inferSelect;

// Validation Schemas - Payment Transactions
export const insertPaymentTransactionSchema = createInsertSchema(paymentTransactions)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    periodStart: z.coerce.date().optional().nullable(),
    periodEnd: z.coerce.date().optional().nullable(),
    paidAt: z.coerce.date().optional().nullable(),
    failedAt: z.coerce.date().optional().nullable(),
  });
export type InsertPaymentTransaction = z.infer<typeof insertPaymentTransactionSchema>;
export type PaymentTransaction = typeof paymentTransactions.$inferSelect;

// Validation Schemas - Invoices
export const insertInvoiceSchema = createInsertSchema(invoices)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    issueDate: z.coerce.date().optional(),
    dueDate: z.coerce.date(),
    paidDate: z.coerce.date().optional().nullable(),
    periodStart: z.coerce.date(),
    periodEnd: z.coerce.date(),
    emailSentAt: z.coerce.date().optional().nullable(),
  });
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

// Validation Schemas - Plan Change History (Bloque 4 - Tarea 8)
export const insertPlanChangeHistorySchema = createInsertSchema(planChangeHistory)
  .omit({ id: true, requestedAt: true })
  .extend({
    completedAt: z.coerce.date().optional().nullable(),
    effectiveDate: z.coerce.date(),
  });
export type InsertPlanChangeHistory = z.infer<typeof insertPlanChangeHistorySchema>;
export type PlanChangeHistory = typeof planChangeHistory.$inferSelect;

// ============================================================================
// DOCUMENT MANAGEMENT - Conservación de Documentación (Estándar 2.5.1)
// Resolución 0312/2019 - Archivo y retención documental del SG-SST
// ============================================================================

// Document category enum - Types of SST documents
export const documentCategoryEnum = pgEnum("document_category", [
  "politica",           // Políticas del SG-SST
  "procedimiento",      // Procedimientos operativos
  "formato",            // Formatos y plantillas
  "registro",           // Registros y evidencias
  "manual",             // Manuales y guías
  "plan",               // Planes (emergencias, trabajo, etc.)
  "matriz",             // Matrices (legal, riesgos, EPP)
  "acta",               // Actas de reuniones
  "informe",            // Informes y reportes
  "certificado",        // Certificados y licencias
  "contrato",           // Contratos relacionados con SST
  "normativa",          // Normativa y legislación aplicable
  "capacitacion",       // Material de capacitación
  "otro",               // Otros documentos
]);

// Document status enum - Lifecycle states
export const documentStatusEnum = pgEnum("document_status", [
  "borrador",           // Draft - under development
  "en_revision",        // Under review/approval
  "vigente",            // Active/current version
  "obsoleto",           // Obsolete - superseded by new version
  "archivado",          // Archived - retention period active
  "eliminado",          // Marked for deletion (after retention)
]);

// SST Standard reference enum - Links documents to specific standards
export const sstStandardReferenceEnum = pgEnum("sst_standard_reference", [
  "1.1.1", "1.1.2", "1.1.3", "1.1.4", "1.1.5", "1.1.6", "1.1.7", "1.1.8",
  "1.2.1", "1.2.2", "1.2.3",
  "2.1.1", "2.2.1", "2.3.1", "2.4.1", "2.5.1", "2.6.1", "2.7.1", "2.8.1", "2.9.1", "2.10.1", "2.11.1",
  "3.1.1", "3.1.2", "3.1.3", "3.1.4", "3.1.5", "3.1.6", "3.1.7", "3.1.8", "3.1.9",
  "3.2.1", "3.2.2", "3.2.3", "3.3.1", "3.3.2", "3.3.3", "3.3.4", "3.3.5", "3.3.6",
  "4.1.1", "4.1.2", "4.1.3", "4.1.4", "4.2.1", "4.2.2", "4.2.3", "4.2.4", "4.2.5", "4.2.6",
  "5.1.1", "5.1.2", "5.1.3",
  "6.1.1", "6.1.2", "6.1.3", "6.1.4",
  "7.1.1", "7.1.2", "7.1.3", "7.1.4",
]);

// Main documents table
export const sstDocuments = pgTable("sst_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  
  // Document identification
  code: text("code").notNull(), // Document code (e.g., POL-SST-001, FOR-SST-010)
  title: text("title").notNull(),
  description: text("description"),
  category: documentCategoryEnum("category").notNull(),
  
  // Classification and compliance
  sstStandards: text("sst_standards").array().default(sql`'{}'`), // Array of standard references (1.1.1, 2.5.1, etc.)
  phvaCycle: text("phva_cycle"), // PLANEAR, HACER, VERIFICAR, ACTUAR
  
  // Version control
  currentVersion: text("current_version").notNull().default("1.0"),
  status: documentStatusEnum("status").notNull().default("borrador"),
  
  // File storage
  fileUrl: text("file_url"), // URL to the stored file
  fileName: text("file_name"),
  fileSize: integer("file_size"), // Size in bytes
  mimeType: text("mime_type"),
  
  // Dates and retention
  documentDate: timestamp("document_date"), // Fecha original del documento (para documentos históricos)
  createdDate: timestamp("created_date").notNull().default(sql`now()`),
  effectiveDate: timestamp("effective_date"), // When document becomes effective
  expirationDate: timestamp("expiration_date"), // When document expires/needs review
  nextReviewDate: timestamp("next_review_date"), // Scheduled review date
  retentionYears: integer("retention_years").notNull().default(20), // Years to retain (Res. 0312 requires 20 years)
  archiveDate: timestamp("archive_date"), // When moved to archive
  deleteAfterDate: timestamp("delete_after_date"), // When can be deleted after retention
  
  // Approval workflow
  preparedBy: varchar("prepared_by").references(() => users.id),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvalDate: timestamp("approval_date"),
  
  // Access control
  isConfidential: boolean("is_confidential").default(false),
  accessRoles: text("access_roles").array().default(sql`'{}'`), // Roles that can access
  
  // Automation flags
  autoAlertDays: integer("auto_alert_days").default(30), // Days before expiration to send alerts
  lastAlertSent: timestamp("last_alert_sent"),
  alertRecipients: text("alert_recipients").array().default(sql`'{}'`), // User IDs to notify
  
  // Metadata
  tags: text("tags").array().default(sql`'{}'`), // Searchable tags
  relatedDocuments: text("related_documents").array().default(sql`'{}'`), // IDs of related docs
  externalReferences: text("external_references"), // External law/regulation references
  notes: text("notes"),
  
  // Audit trail
  createdBy: varchar("created_by").references(() => users.id),
  updatedBy: varchar("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Document versions table - Version history
export const sstDocumentVersions = pgTable("sst_document_versions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").notNull().references(() => sstDocuments.id),
  
  // Version info
  versionNumber: text("version_number").notNull(), // e.g., "1.0", "1.1", "2.0"
  changeDescription: text("change_description"), // What changed in this version
  changeType: text("change_type"), // "major", "minor", "correction"
  
  // File for this version
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  
  // Who made the changes
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  
  // Approval for this version
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  
  // Status at creation
  previousStatus: documentStatusEnum("previous_status"),
  newStatus: documentStatusEnum("new_status"),
});

// Document access log - Track who accessed what
export const sstDocumentAccessLog = pgTable("sst_document_access_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").notNull().references(() => sstDocuments.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  accessType: text("access_type").notNull(), // "view", "download", "edit", "approve"
  accessedAt: timestamp("accessed_at").notNull().default(sql`now()`),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

// Document alerts - Scheduled notifications
export const sstDocumentAlerts = pgTable("sst_document_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").notNull().references(() => sstDocuments.id),
  
  alertType: text("alert_type").notNull(), // "expiration", "review", "retention_end"
  scheduledDate: timestamp("scheduled_date").notNull(),
  sentAt: timestamp("sent_at"),
  recipientIds: text("recipient_ids").array().default(sql`'{}'`),
  
  // Alert message
  subject: text("subject"),
  message: text("message"),
  
  // Status
  status: text("status").notNull().default("pending"), // "pending", "sent", "failed"
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Validation Schemas - SST Documents
export const insertSstDocumentSchema = createInsertSchema(sstDocuments)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    title: z.string().min(1, "El título del documento es obligatorio"),
    category: z.string().min(1, "El tipo de documento es obligatorio"),
    documentDate: z.coerce.date().optional().nullable(),
    effectiveDate: z.coerce.date().optional().nullable(),
    expirationDate: z.coerce.date().optional().nullable(),
    nextReviewDate: z.coerce.date().optional().nullable(),
    archiveDate: z.coerce.date().optional().nullable(),
    deleteAfterDate: z.coerce.date().optional().nullable(),
    approvalDate: z.coerce.date().optional().nullable(),
    lastAlertSent: z.coerce.date().optional().nullable(),
  });
export type InsertSstDocument = z.infer<typeof insertSstDocumentSchema>;
export type SstDocument = typeof sstDocuments.$inferSelect;

// Validation Schemas - Document Versions
export const insertSstDocumentVersionSchema = createInsertSchema(sstDocumentVersions)
  .omit({ id: true, createdAt: true })
  .extend({
    approvedAt: z.coerce.date().optional().nullable(),
  });
export type InsertSstDocumentVersion = z.infer<typeof insertSstDocumentVersionSchema>;
export type SstDocumentVersion = typeof sstDocumentVersions.$inferSelect;

// Validation Schemas - Document Access Log
export const insertSstDocumentAccessLogSchema = createInsertSchema(sstDocumentAccessLog)
  .omit({ id: true, accessedAt: true });
export type InsertSstDocumentAccessLog = z.infer<typeof insertSstDocumentAccessLogSchema>;
export type SstDocumentAccessLog = typeof sstDocumentAccessLog.$inferSelect;

// Validation Schemas - Document Alerts
export const insertSstDocumentAlertSchema = createInsertSchema(sstDocumentAlerts)
  .omit({ id: true, createdAt: true })
  .extend({
    scheduledDate: z.coerce.date(),
    sentAt: z.coerce.date().optional().nullable(),
  });
export type InsertSstDocumentAlert = z.infer<typeof insertSstDocumentAlertSchema>;
export type SstDocumentAlert = typeof sstDocumentAlerts.$inferSelect;

// ==================== PLAN DE EMERGENCIAS (Resolución 0312/2019 - Gestión de Amenazas 10%) ====================

// Tipo de amenaza enum
export const tipoAmenazaEnum = pgEnum("tipo_amenaza", [
  "natural",        // Sismos, inundaciones, tormentas
  "tecnologico",    // Incendios, explosiones, derrames
  "social",         // Atentados, robos, disturbios
  "sanitario",      // Pandemias, epidemias
  "ambiental"       // Contaminación, derrames químicos
]);

// Nivel de probabilidad y severidad
export const nivelProbabilidadAmenazaEnum = pgEnum("nivel_probabilidad_amenaza", [
  "improbable",     // Muy baja probabilidad
  "posible",        // Baja probabilidad
  "ocasional",      // Media probabilidad
  "frecuente"       // Alta probabilidad
]);

export const nivelSeveridadAmenazaEnum = pgEnum("nivel_severidad_amenaza", [
  "leve",           // Impacto menor
  "moderado",       // Impacto medio
  "severo",         // Impacto alto
  "catastrofico"    // Impacto extremo
]);

// Estado del plan
export const estadoPlanEmergenciaEnum = pgEnum("estado_plan_emergencia", [
  "borrador",
  "vigente",
  "en_revision",
  "obsoleto"
]);

// Tipo de brigada
export const tipoBrigadaEnum = pgEnum("tipo_brigada", [
  "primeros_auxilios",
  "evacuacion",
  "control_incendios",
  "busqueda_rescate",
  "comunicaciones",
  "integral"         // Brigada única que cubre todo
]);

// Rol en brigada
export const rolBrigadaEnum = pgEnum("rol_brigada", [
  "jefe_brigada",
  "subjefe",
  "brigadista",
  "coordinador_zona"
]);

// Tipo de recurso de emergencia
export const tipoRecursoEmergenciaEnum = pgEnum("tipo_recurso_emergencia", [
  "extintor",
  "botiquin",
  "camilla",
  "dea",                    // Desfibrilador Externo Automático
  "kit_derrames",
  "linterna_emergencia",
  "megafono",
  "equipo_rescate",
  "senalizacion",
  "otro"
]);

// Estado del recurso
export const estadoRecursoEmergenciaEnum = pgEnum("estado_recurso_emergencia", [
  "operativo",
  "requiere_mantenimiento",
  "vencido",
  "fuera_servicio"
]);

// Tipo de simulacro
export const tipoSimulacroEnum = pgEnum("tipo_simulacro", [
  "evacuacion",
  "incendio",
  "sismo",
  "derrame_quimico",
  "primeros_auxilios",
  "confinamiento",
  "integral"
]);

// Estado del simulacro
export const estadoSimulacroEnum = pgEnum("estado_simulacro", [
  "programado",
  "en_ejecucion",
  "completado",
  "cancelado"
]);

// 1. Tabla principal: Plan de Emergencias
export const planesEmergencia = pgTable("planes_emergencia", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  
  // Identificación
  codigo: text("codigo").notNull(), // PE-2024-001
  nombre: text("nombre").notNull(),
  version: text("version").notNull().default("1.0"),
  estado: estadoPlanEmergenciaEnum("estado").notNull().default("borrador"),
  
  // Fechas
  fechaElaboracion: date("fecha_elaboracion").notNull(),
  fechaAprobacion: date("fecha_aprobacion"),
  fechaVigencia: date("fecha_vigencia"),
  fechaProximaRevision: date("fecha_proxima_revision"),
  
  // Responsables
  elaboradoPor: text("elaborado_por"),
  revisadoPor: text("revisado_por"),
  aprobadoPor: text("aprobado_por"),
  
  // Contenido general
  alcance: text("alcance"), // Alcance del plan
  objetivoGeneral: text("objetivo_general"),
  objetivosEspecificos: text("objetivos_especificos"),
  marcoLegal: text("marco_legal"), // Normativa aplicable
  
  // Análisis de contexto
  descripcionInstalaciones: text("descripcion_instalaciones"),
  numeroPisos: integer("numero_pisos"),
  areaTotal: integer("area_total"), // metros cuadrados
  capacidadMaximaPersonas: integer("capacidad_maxima_personas"),
  horarioOperacion: text("horario_operacion"),
  
  // Datos de contacto emergencia
  telefonoEmergencias: text("telefono_emergencias"),
  contactoArl: text("contacto_arl"),
  contactoBomberos: text("contacto_bomberos"),
  contactoPolicia: text("contacto_policia"),
  contactoAmbulancia: text("contacto_ambulancia"),
  contactoDefensaCivil: text("contacto_defensa_civil"),
  
  // Observaciones
  notas: text("notas"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// 2. Brigadas de Emergencia
export const brigadasEmergencia = pgTable("brigadas_emergencia", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  planEmergenciaId: varchar("plan_emergencia_id").references(() => planesEmergencia.id),
  
  nombre: text("nombre").notNull(),
  tipo: tipoBrigadaEnum("tipo").notNull(),
  descripcion: text("descripcion"),
  
  // Funciones y responsabilidades
  funcionesAntes: text("funciones_antes"), // Antes de la emergencia
  funcionesDurante: text("funciones_durante"), // Durante la emergencia
  funcionesDespues: text("funciones_despues"), // Después de la emergencia
  
  // Equipamiento asignado
  equipamientoAsignado: text("equipamiento_asignado"),
  
  // Estado
  activa: integer("activa").notNull().default(1), // 1=activa, 0=inactiva
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// 3. Miembros de la Brigada
export const miembrosBrigada = pgTable("miembros_brigada", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  brigadaId: varchar("brigada_id").notNull().references(() => brigadasEmergencia.id),
  workerId: varchar("worker_id").notNull().references(() => workers.id),
  
  rol: rolBrigadaEnum("rol").notNull().default("brigadista"),
  fechaIngreso: date("fecha_ingreso").notNull(),
  fechaRetiro: date("fecha_retiro"),
  
  // Capacitación
  certificadoVigente: integer("certificado_vigente").default(0), // 0=No, 1=Sí
  fechaUltimaCapacitacion: date("fecha_ultima_capacitacion"),
  fechaProximaCapacitacion: date("fecha_proxima_capacitacion"),
  
  // Zona asignada (para coordinadores de evacuación)
  zonaAsignada: text("zona_asignada"),
  
  activo: integer("activo").notNull().default(1),
  observaciones: text("observaciones"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// 4. Análisis de Vulnerabilidad
export const analisisVulnerabilidad = pgTable("analisis_vulnerabilidad", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  planEmergenciaId: varchar("plan_emergencia_id").references(() => planesEmergencia.id),
  
  codigo: text("codigo").notNull(), // AV-2024-001
  fechaAnalisis: date("fecha_analisis").notNull(),
  realizadoPor: text("realizado_por").notNull(),
  
  // Metodología usada (Diamante, etc.)
  metodologia: text("metodologia").default("diamante"),
  
  // Resultados globales
  nivelVulnerabilidadPersonas: text("nivel_vulnerabilidad_personas"), // Alto, Medio, Bajo
  nivelVulnerabilidadRecursos: text("nivel_vulnerabilidad_recursos"),
  nivelVulnerabilidadSistemas: text("nivel_vulnerabilidad_sistemas"),
  nivelRiesgoGlobal: text("nivel_riesgo_global"),
  
  conclusiones: text("conclusiones"),
  recomendaciones: text("recomendaciones"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// 5. Amenazas Identificadas
export const amenazasIdentificadas = pgTable("amenazas_identificadas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  analisisId: varchar("analisis_id").notNull().references(() => analisisVulnerabilidad.id),
  
  tipo: tipoAmenazaEnum("tipo").notNull(),
  nombre: text("nombre").notNull(), // Ej: "Sismo de magnitud 6.0"
  descripcion: text("descripcion"),
  fuenteAmenaza: text("fuente_amenaza"), // Origen de la amenaza
  
  // Calificación
  probabilidad: nivelProbabilidadAmenazaEnum("probabilidad").notNull(),
  severidad: nivelSeveridadAmenazaEnum("severidad").notNull(),
  nivelRiesgo: text("nivel_riesgo"), // Calculado: Alto, Medio, Bajo
  valorRiesgo: integer("valor_riesgo"), // Valor numérico calculado
  colorRiesgo: text("color_riesgo"), // Para visualización
  
  // Controles
  controlesExistentes: text("controles_existentes"),
  controlesRequeridos: text("controles_requeridos"),
  
  // Vinculación con IPERC (opcional)
  peligroIpercId: varchar("peligro_iperc_id").references(() => peligrosIperc.id),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// 6. Recursos de Emergencia (Inventario)
export const recursosEmergencia = pgTable("recursos_emergencia", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  
  codigo: text("codigo").notNull(), // EXT-001, BOT-001
  tipo: tipoRecursoEmergenciaEnum("tipo").notNull(),
  nombre: text("nombre").notNull(), // Ej: "Extintor PQS 10 lbs"
  descripcion: text("descripcion"),
  
  // Ubicación
  ubicacion: text("ubicacion").notNull(), // Piso/área
  ubicacionDetalle: text("ubicacion_detalle"), // Descripción específica
  
  // Datos del recurso
  marca: text("marca"),
  modelo: text("modelo"),
  capacidad: text("capacidad"), // Ej: "10 lbs", "20 litros"
  numeroSerie: text("numero_serie"),
  
  // Fechas importantes
  fechaAdquisicion: date("fecha_adquisicion"),
  fechaVencimiento: date("fecha_vencimiento"),
  fechaUltimaInspeccion: date("fecha_ultima_inspeccion"),
  fechaProximaInspeccion: date("fecha_proxima_inspeccion"),
  fechaUltimaRecarga: date("fecha_ultima_recarga"), // Para extintores
  fechaProximaRecarga: date("fecha_proxima_recarga"),
  
  // Estado
  estado: estadoRecursoEmergenciaEnum("estado").notNull().default("operativo"),
  
  // Responsable
  responsableArea: text("responsable_area"),
  
  observaciones: text("observaciones"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// 7. Inspecciones de Recursos de Emergencia
export const inspeccionesRecursosEmergencia = pgTable("inspecciones_recursos_emergencia", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  recursoId: varchar("recurso_id").notNull().references(() => recursosEmergencia.id),
  
  fechaInspeccion: date("fecha_inspeccion").notNull(),
  inspectorNombre: text("inspector_nombre").notNull(),
  inspectorCargo: text("inspector_cargo"),
  
  // Resultado
  estadoEncontrado: estadoRecursoEmergenciaEnum("estado_encontrado").notNull(),
  cumpleNormativa: integer("cumple_normativa").notNull().default(1), // 1=Sí, 0=No
  
  // Lista de verificación general
  checklistItems: jsonb("checklist_items"), // JSON con items verificados
  
  hallazgos: text("hallazgos"),
  accionesRequeridas: text("acciones_requeridas"),
  fechaAccionRequerida: date("fecha_accion_requerida"),
  accionesCompletadas: integer("acciones_completadas").default(0),
  
  // Vinculación con inspecciones generales (opcional)
  inspeccionGeneralId: varchar("inspeccion_general_id").references(() => inspections.id),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// 8. Simulacros de Emergencia
export const simulacros = pgTable("simulacros", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  planEmergenciaId: varchar("plan_emergencia_id").references(() => planesEmergencia.id),
  
  codigo: text("codigo").notNull(), // SIM-2024-001
  nombre: text("nombre").notNull(),
  tipo: tipoSimulacroEnum("tipo").notNull(),
  descripcion: text("descripcion"),
  escenario: text("escenario"), // Descripción del escenario simulado
  
  // Programación
  fechaProgramada: date("fecha_programada").notNull(),
  horaProgramada: text("hora_programada"),
  duracionEstimada: integer("duracion_estimada"), // minutos
  
  // Ejecución
  fechaEjecucion: date("fecha_ejecucion"),
  horaInicio: text("hora_inicio"),
  horaFin: text("hora_fin"),
  duracionReal: integer("duracion_real"), // minutos
  
  // Evaluación
  tiempoEvacuacion: integer("tiempo_evacuacion"), // segundos
  numeroParticipantes: integer("numero_participantes"),
  numeroEvacuados: integer("numero_evacuados"),
  
  // Estado
  estado: estadoSimulacroEnum("estado").notNull().default("programado"),
  avisado: integer("avisado").default(1), // 1=Anunciado, 0=Sorpresa
  
  // Responsables
  coordinadorNombre: text("coordinador_nombre"),
  coordinadorCargo: text("coordinador_cargo"),
  
  // Evaluación post-simulacro
  aspectosPositivos: text("aspectos_positivos"),
  aspectosMejorar: text("aspectos_mejorar"),
  leccionesAprendidas: text("lecciones_aprendidas"),
  calificacionGeneral: text("calificacion_general"), // Excelente, Bueno, Regular, Malo
  
  // Seguimiento
  accionesMejora: text("acciones_mejora"),
  responsableSeguimiento: text("responsable_seguimiento"),
  fechaSeguimiento: date("fecha_seguimiento"),
  
  // Vinculación con capacitaciones (opcional)
  capacitacionEventoId: varchar("capacitacion_evento_id").references(() => capacitacionEventos.id),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// 9. Participantes del Simulacro
export const participantesSimulacro = pgTable("participantes_simulacro", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  simulacroId: varchar("simulacro_id").notNull().references(() => simulacros.id),
  workerId: varchar("worker_id").references(() => workers.id),
  
  // Si no es trabajador registrado
  nombreParticipante: text("nombre_participante"),
  tipoParticipante: text("tipo_participante"), // "trabajador", "visitante", "contratista"
  
  // Rol en el simulacro
  rolSimulacro: text("rol_simulacro"), // "evacuado", "herido_simulado", "brigadista", "observador"
  zonaEvacuacion: text("zona_evacuacion"),
  
  // Evaluación individual
  cumplioProcedimiento: integer("cumplio_procedimiento"), // 1=Sí, 0=No, null=No aplica
  tiempoEvacuacion: integer("tiempo_evacuacion"), // segundos
  observaciones: text("observaciones"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// 10. Zonas de Evacuación
export const zonasEvacuacion = pgTable("zonas_evacuacion", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  planEmergenciaId: varchar("plan_emergencia_id").references(() => planesEmergencia.id),
  
  codigo: text("codigo").notNull(), // ZONA-A, ZONA-B
  nombre: text("nombre").notNull(),
  descripcion: text("descripcion"),
  
  // Ubicación
  piso: text("piso"),
  area: text("area"),
  capacidadPersonas: integer("capacidad_personas"),
  
  // Coordinador de zona
  coordinadorId: varchar("coordinador_id").references(() => workers.id),
  coordinadorSustitutoId: varchar("coordinador_sustituto_id").references(() => workers.id),
  
  // Punto de encuentro asignado
  puntoEncuentroId: varchar("punto_encuentro_id"), // Se vinculará después
  
  // Instrucciones específicas
  instruccionesEvacuacion: text("instrucciones_evacuacion"),
  consideracionesEspeciales: text("consideraciones_especiales"), // Personas con discapacidad, etc.
  
  activa: integer("activa").notNull().default(1),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// 11. Rutas de Evacuación
export const rutasEvacuacion = pgTable("rutas_evacuacion", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  zonaOrigenId: varchar("zona_origen_id").references(() => zonasEvacuacion.id),
  
  codigo: text("codigo").notNull(), // RUTA-A1, RUTA-B1
  nombre: text("nombre").notNull(), // Ej: "Salida Principal Piso 1"
  descripcion: text("descripcion"),
  
  // Detalles de la ruta
  puntoInicio: text("punto_inicio").notNull(),
  puntoFin: text("punto_fin").notNull(), // Generalmente el punto de encuentro
  distanciaMetros: integer("distancia_metros"),
  tiempoEstimadoSegundos: integer("tiempo_estimado_segundos"),
  
  // Características
  tieneEscaleras: integer("tiene_escaleras").default(0),
  tieneRampa: integer("tiene_rampa").default(0),
  anchoMetros: text("ancho_metros"), // Ancho del pasillo/ruta
  iluminacionEmergencia: integer("iluminacion_emergencia").default(1),
  senalizacionCompleta: integer("senalizacion_completa").default(1),
  
  // Estado
  rutaPrincipal: integer("ruta_principal").default(1), // 1=Principal, 0=Alternativa
  activa: integer("activa").notNull().default(1),
  
  observaciones: text("observaciones"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// 12. Puntos de Encuentro
export const puntosEncuentro = pgTable("puntos_encuentro", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  planEmergenciaId: varchar("plan_emergencia_id").references(() => planesEmergencia.id),
  
  codigo: text("codigo").notNull(), // PE-01, PE-02
  nombre: text("nombre").notNull(),
  descripcion: text("descripcion"),
  
  // Ubicación
  ubicacion: text("ubicacion").notNull(), // Descripción de ubicación
  coordenadas: text("coordenadas"), // GPS si aplica
  
  // Características
  capacidadPersonas: integer("capacidad_personas"),
  tieneProteccion: integer("tiene_proteccion").default(0), // Techo, sombra
  esAccesible: integer("es_accesible").default(1), // Acceso personas con discapacidad
  distanciaSalidaPrincipal: integer("distancia_salida_principal"), // metros
  
  // Responsable del punto
  responsableId: varchar("responsable_id").references(() => workers.id),
  responsableSustitutoId: varchar("responsable_sustituto_id").references(() => workers.id),
  
  // Equipamiento en el punto
  tieneKit: integer("tiene_kit").default(0), // Kit de emergencia
  tieneMegafono: integer("tiene_megafono").default(0),
  tieneListadoPersonal: integer("tiene_listado_personal").default(0),
  
  // Estado
  puntoPrincipal: integer("punto_principal").default(1), // 1=Principal, 0=Alternativo
  activo: integer("activo").notNull().default(1),
  
  observaciones: text("observaciones"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// ==================== VALIDATION SCHEMAS - PLAN DE EMERGENCIAS ====================

// Plan de Emergencias
export const insertPlanEmergenciaSchema = createInsertSchema(planesEmergencia)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    nombre: z.string().min(1, "El nombre del plan es obligatorio"),
    version: z.string().min(1, "La versión es obligatoria"),
    fechaElaboracion: z.coerce.date(),
    fechaAprobacion: z.coerce.date().optional().nullable(),
    fechaVigencia: z.coerce.date().optional().nullable(),
    fechaProximaRevision: z.coerce.date().optional().nullable(),
  });
export type InsertPlanEmergencia = z.infer<typeof insertPlanEmergenciaSchema>;
export type PlanEmergencia = typeof planesEmergencia.$inferSelect;

// Brigadas de Emergencia
export const insertBrigadaEmergenciaSchema = createInsertSchema(brigadasEmergencia)
  .omit({ id: true, createdAt: true })
  .extend({
    nombre: z.string().min(1, "El nombre de la brigada es obligatorio"),
    tipoBrigada: z.string().min(1, "El tipo de brigada es obligatorio"),
  });
export type InsertBrigadaEmergencia = z.infer<typeof insertBrigadaEmergenciaSchema>;
export type BrigadaEmergencia = typeof brigadasEmergencia.$inferSelect;

// Miembros de Brigada
export const insertMiembroBrigadaSchema = createInsertSchema(miembrosBrigada)
  .omit({ id: true, createdAt: true })
  .extend({
    workerId: z.string().min(1, "Debe seleccionar un trabajador"),
    fechaIngreso: z.coerce.date(),
    fechaRetiro: z.coerce.date().optional().nullable(),
    fechaUltimaCapacitacion: z.coerce.date().optional().nullable(),
    fechaProximaCapacitacion: z.coerce.date().optional().nullable(),
  });
export type InsertMiembroBrigada = z.infer<typeof insertMiembroBrigadaSchema>;
export type MiembroBrigada = typeof miembrosBrigada.$inferSelect;

// Análisis de Vulnerabilidad
export const insertAnalisisVulnerabilidadSchema = createInsertSchema(analisisVulnerabilidad)
  .omit({ id: true, createdAt: true })
  .extend({
    fechaAnalisis: z.coerce.date(),
  });
export type InsertAnalisisVulnerabilidad = z.infer<typeof insertAnalisisVulnerabilidadSchema>;
export type AnalisisVulnerabilidad = typeof analisisVulnerabilidad.$inferSelect;

// Amenazas Identificadas
export const insertAmenazaIdentificadaSchema = createInsertSchema(amenazasIdentificadas)
  .omit({ id: true, createdAt: true });
export type InsertAmenazaIdentificada = z.infer<typeof insertAmenazaIdentificadaSchema>;
export type AmenazaIdentificada = typeof amenazasIdentificadas.$inferSelect;

// Recursos de Emergencia
export const insertRecursoEmergenciaSchema = createInsertSchema(recursosEmergencia)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    fechaAdquisicion: z.coerce.date().optional().nullable(),
    fechaVencimiento: z.coerce.date().optional().nullable(),
    fechaUltimaInspeccion: z.coerce.date().optional().nullable(),
    fechaProximaInspeccion: z.coerce.date().optional().nullable(),
    fechaUltimaRecarga: z.coerce.date().optional().nullable(),
    fechaProximaRecarga: z.coerce.date().optional().nullable(),
  });
export type InsertRecursoEmergencia = z.infer<typeof insertRecursoEmergenciaSchema>;
export type RecursoEmergencia = typeof recursosEmergencia.$inferSelect;

// Inspecciones de Recursos
export const insertInspeccionRecursoEmergenciaSchema = createInsertSchema(inspeccionesRecursosEmergencia)
  .omit({ id: true, createdAt: true })
  .extend({
    fechaInspeccion: z.coerce.date(),
    fechaAccionRequerida: z.coerce.date().optional().nullable(),
  });
export type InsertInspeccionRecursoEmergencia = z.infer<typeof insertInspeccionRecursoEmergenciaSchema>;
export type InspeccionRecursoEmergencia = typeof inspeccionesRecursosEmergencia.$inferSelect;

// Simulacros
export const insertSimulacroSchema = createInsertSchema(simulacros)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    nombre: z.string().min(1, "El nombre del simulacro es obligatorio"),
    tipoEmergencia: z.string().min(1, "El tipo de emergencia es obligatorio"),
    fechaProgramada: z.coerce.date(),
    fechaEjecucion: z.coerce.date().optional().nullable(),
    fechaSeguimiento: z.coerce.date().optional().nullable(),
  });
export type InsertSimulacro = z.infer<typeof insertSimulacroSchema>;
export type Simulacro = typeof simulacros.$inferSelect;

// Participantes Simulacro
export const insertParticipanteSimulacroSchema = createInsertSchema(participantesSimulacro)
  .omit({ id: true, createdAt: true });
export type InsertParticipanteSimulacro = z.infer<typeof insertParticipanteSimulacroSchema>;
export type ParticipanteSimulacro = typeof participantesSimulacro.$inferSelect;

// Zonas de Evacuación
export const insertZonaEvacuacionSchema = createInsertSchema(zonasEvacuacion)
  .omit({ id: true, createdAt: true });
export type InsertZonaEvacuacion = z.infer<typeof insertZonaEvacuacionSchema>;
export type ZonaEvacuacion = typeof zonasEvacuacion.$inferSelect;

// Rutas de Evacuación
export const insertRutaEvacuacionSchema = createInsertSchema(rutasEvacuacion)
  .omit({ id: true, createdAt: true });
export type InsertRutaEvacuacion = z.infer<typeof insertRutaEvacuacionSchema>;
export type RutaEvacuacion = typeof rutasEvacuacion.$inferSelect;

// Puntos de Encuentro
export const insertPuntoEncuentroSchema = createInsertSchema(puntosEncuentro)
  .omit({ id: true, createdAt: true });
export type InsertPuntoEncuentro = z.infer<typeof insertPuntoEncuentroSchema>;
export type PuntoEncuentro = typeof puntosEncuentro.$inferSelect;

// ============================================================================
// PROVIDER ACCESS LOGS - Registro de Accesos del Proveedor SaaS (Ley 1581/2012)
// ============================================================================
// Documenta cada acceso del superadmin a datos de empresas clientes para
// cumplir con el principio de Acceso Restringido y Transparencia de la Ley 1581
// Conforme a: Art. 4 (Principios), Art. 17 (Deberes del Responsable)

export const providerAccessReasonEnum = pgEnum("provider_access_reason", [
  "soporte_tecnico",      // Resolución de incidencia técnica
  "mantenimiento",        // Mantenimiento preventivo/correctivo
  "auditoria_interna",    // Auditoría interna del proveedor
  "verificacion_datos",   // Verificación de integridad de datos
  "configuracion",        // Configuración del sistema
  "capacitacion",         // Sesión de capacitación al cliente
  "migracion",            // Migración de datos
  "backup",               // Respaldo de datos
  "otro"                  // Otro motivo documentado
]);

export const providerAccessLogs = pgTable("provider_access_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // WHO - Quién del proveedor accedió
  providerId: varchar("provider_id").notNull().references(() => users.id),
  providerName: text("provider_name").notNull(),
  providerEmail: text("provider_email").notNull(),
  providerRole: text("provider_role").notNull(), // Siempre "superadmin"
  
  // WHICH COMPANY - Empresa cliente accedida
  clientCompanyId: varchar("client_company_id").notNull().references(() => companies.id),
  clientCompanyName: text("client_company_name").notNull(),
  clientCompanyNit: text("client_company_nit"),
  
  // WHAT - Razón y descripción del acceso
  accessReason: providerAccessReasonEnum("access_reason").notNull(),
  accessDescription: text("access_description").notNull(), // Descripción detallada obligatoria
  ticketNumber: text("ticket_number"), // Número de ticket de soporte si aplica
  
  // DURATION - Duración del acceso
  accessStart: timestamp("access_start").notNull().default(sql`now()`),
  accessEnd: timestamp("access_end"), // NULL = sesión activa
  
  // ACTIONS - Resumen de acciones realizadas
  modulesAccessed: text("modules_accessed").array(), // ["trabajadores", "accidentes", "capacitaciones"]
  actionsPerformed: text("actions_performed"), // JSON con resumen de acciones
  recordsViewed: integer("records_viewed").default(0),
  recordsModified: integer("records_modified").default(0),
  
  // CONTEXT - Contexto técnico
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  sessionId: text("session_id"),
  
  // LEGAL - Conformidad legal
  legalBasis: text("legal_basis").default("Ley 1581/2012 Art. 17 - Transmisión de datos para soporte técnico"),
  clientNotified: integer("client_notified").default(0), // 1 = cliente notificado del acceso
  
  // TIMESTAMPS
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Validation Schemas
export const insertProviderAccessLogSchema = createInsertSchema(providerAccessLogs)
  .omit({ id: true, createdAt: true })
  .extend({
    accessStart: z.coerce.date().optional(),
    accessEnd: z.coerce.date().optional().nullable(),
  });
export type InsertProviderAccessLog = z.infer<typeof insertProviderAccessLogSchema>;
export type ProviderAccessLog = typeof providerAccessLogs.$inferSelect;

// ============================================================================
// SISTEMA DE TICKETS DE SOPORTE
// ============================================================================
// Sistema de gestión de tickets para soporte técnico y atención al cliente
// Permite a los clientes crear tickets, hacer seguimiento y recibir respuestas

export const ticketStatusEnum = pgEnum("ticket_status", [
  "abierto",           // Ticket recién creado
  "en_revision",       // Asignado a soporte, en revisión
  "en_progreso",       // Trabajando en solución
  "pendiente_cliente", // Esperando respuesta del cliente
  "resuelto",          // Solucionado, pendiente confirmación
  "cerrado"            // Finalizado
]);

export const ticketPriorityEnum = pgEnum("ticket_priority", [
  "baja",      // No urgente
  "media",     // Normal
  "alta",      // Urgente
  "critica"    // Crítico, afecta operación
]);

export const ticketCategoryEnum = pgEnum("ticket_category", [
  "soporte_tecnico",    // Problemas técnicos
  "facturacion",        // Consultas de facturación/pagos
  "nueva_funcionalidad", // Solicitud de nuevas funciones
  "error_bug",          // Reporte de errores
  "capacitacion",       // Solicitud de capacitación
  "consulta_general"    // Consultas generales
]);

export const supportTickets = pgTable("support_tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Número de ticket único y legible (SST-2024-0001)
  ticketNumber: text("ticket_number").notNull().unique(),
  
  // Información del solicitante
  companyId: varchar("company_id").notNull().references(() => companies.id),
  companyName: text("company_name").notNull(), // Denormalizado para reportes
  userId: varchar("user_id").notNull().references(() => users.id),
  userName: text("user_name").notNull(), // Denormalizado
  userEmail: text("user_email"),
  
  // Detalles del ticket
  subject: text("subject").notNull(), // Asunto breve
  description: text("description").notNull(), // Descripción detallada
  category: ticketCategoryEnum("category").notNull(),
  priority: ticketPriorityEnum("priority").notNull().default("media"),
  status: ticketStatusEnum("status").notNull().default("abierto"),
  
  // Asignación (para el superadmin)
  assignedTo: varchar("assigned_to").references(() => users.id),
  assignedToName: text("assigned_to_name"),
  
  // Archivos adjuntos (URLs)
  attachments: text("attachments").array(),
  
  // Resolución
  resolution: text("resolution"), // Descripción de la solución
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: varchar("resolved_by").references(() => users.id),
  
  // Satisfacción del cliente (1-5)
  satisfactionRating: integer("satisfaction_rating"),
  satisfactionComment: text("satisfaction_comment"),
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
  closedAt: timestamp("closed_at"),
});

// Respuestas/Comentarios de tickets
export const ticketResponses = pgTable("ticket_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  ticketId: varchar("ticket_id").notNull().references(() => supportTickets.id),
  
  // Autor de la respuesta
  userId: varchar("user_id").notNull().references(() => users.id),
  userName: text("user_name").notNull(),
  userRole: text("user_role").notNull(), // Para mostrar si es cliente o soporte
  isStaff: integer("is_staff").notNull().default(0), // 1 = respuesta del staff de soporte
  
  // Contenido
  content: text("content").notNull(),
  attachments: text("attachments").array(),
  
  // Visibilidad
  isInternal: integer("is_internal").notNull().default(0), // 1 = nota interna (solo staff)
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Historial de cambios de estado del ticket (para trazabilidad)
export const ticketStatusHistory = pgTable("ticket_status_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  ticketId: varchar("ticket_id").notNull().references(() => supportTickets.id),
  
  // Cambio de estado
  previousStatus: ticketStatusEnum("previous_status"),
  newStatus: ticketStatusEnum("new_status").notNull(),
  
  // Quién hizo el cambio
  changedBy: varchar("changed_by").notNull().references(() => users.id),
  changedByName: text("changed_by_name").notNull(),
  
  // Motivo del cambio (opcional)
  reason: text("reason"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Validation Schemas - Tickets
export const insertSupportTicketSchema = createInsertSchema(supportTickets)
  .omit({ id: true, ticketNumber: true, createdAt: true, updatedAt: true });
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;

// Validation Schemas - Responses
export const insertTicketResponseSchema = createInsertSchema(ticketResponses)
  .omit({ id: true, createdAt: true });
export type InsertTicketResponse = z.infer<typeof insertTicketResponseSchema>;
export type TicketResponse = typeof ticketResponses.$inferSelect;

// Validation Schemas - Status History
export const insertTicketStatusHistorySchema = createInsertSchema(ticketStatusHistory)
  .omit({ id: true, createdAt: true });
export type InsertTicketStatusHistory = z.infer<typeof insertTicketStatusHistorySchema>;
export type TicketStatusHistory = typeof ticketStatusHistory.$inferSelect;

// ============================================================================
// INTERNAL MESSAGING SYSTEM - Comunicación LSO ↔ Responsable SST
// ============================================================================

// Estado del mensaje
export const messageStatusEnum = pgEnum("message_status", [
  "unread",    // No leído
  "read",      // Leído
  "archived",  // Archivado
]);

// Prioridad del mensaje
export const messagePriorityEnum = pgEnum("message_priority", [
  "normal",    // Normal
  "urgent",    // Urgente
]);

// Tabla de mensajes internos
export const internalMessages = pgTable("internal_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Empresa (multi-tenant)
  companyId: varchar("company_id").notNull().references(() => companies.id),
  
  // Remitente y destinatario
  senderId: varchar("sender_id").notNull().references(() => users.id),
  senderName: text("sender_name").notNull(), // Denormalized for display
  senderRole: userRoleEnum("sender_role").notNull(),
  
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  receiverName: text("receiver_name").notNull(), // Denormalized for display
  receiverRole: userRoleEnum("receiver_role").notNull(),
  
  // Contenido del mensaje
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  
  // Estado y prioridad
  status: messageStatusEnum("status").notNull().default("unread"),
  priority: messagePriorityEnum("priority").notNull().default("normal"),
  
  // Referencia opcional a entidades del sistema (para trazabilidad)
  relatedEntity: text("related_entity"), // "worker", "document", "accident", etc.
  relatedEntityId: varchar("related_entity_id"),
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  readAt: timestamp("read_at"),
  archivedAt: timestamp("archived_at"),
});

// Validation Schemas - Internal Messages
export const insertInternalMessageSchema = createInsertSchema(internalMessages)
  .omit({ id: true, createdAt: true, readAt: true, archivedAt: true });
export type InsertInternalMessage = z.infer<typeof insertInternalMessageSchema>;
export type InternalMessage = typeof internalMessages.$inferSelect;

// ============================================================================
// SUPPORT ACCESS AUTHORIZATION SYSTEM - Transparencia y autorización de acceso
// Cumplimiento con Ley 1581/2012 (Protección de Datos Personales)
// ============================================================================

// Estado de la sesión de acceso de soporte
export const supportAccessStatusEnum = pgEnum("support_access_status", [
  "pending",      // Pendiente de aprobación del cliente
  "approved",     // Aprobado por el cliente
  "denied",       // Denegado por el cliente
  "expired",      // Expirado automáticamente
  "revoked",      // Revocado por el cliente después de aprobar
  "cancelled",    // Cancelado por soporte antes de aprobación
]);

// Tipos de eventos de acceso (para auditoría inmutable)
export const supportAccessEventTypeEnum = pgEnum("support_access_event_type", [
  "request_created",      // Solicitud creada por soporte
  "notification_sent",    // Notificación enviada al cliente
  "client_viewed",        // Cliente vio la solicitud
  "approved",             // Cliente aprobó el acceso
  "denied",               // Cliente denegó el acceso
  "access_started",       // Soporte comenzó a acceder datos
  "access_ended",         // Soporte terminó de acceder
  "data_accessed",        // Soporte accedió a un recurso (lectura)
  "data_modified",        // Soporte modificó un recurso (escritura)
  "revoked",              // Cliente revocó el acceso
  "expired",              // Sesión expiró automáticamente
  "cancelled",            // Soporte canceló la solicitud
]);

// Alcance del acceso (qué módulos puede ver el soporte)
export const supportAccessScopeEnum = pgEnum("support_access_scope", [
  "read_only",      // Solo lectura
  "read_write",     // Lectura y escritura (para resolver problemas)
]);

// Tabla de sesiones de acceso de soporte
export const supportAccessSessions = pgTable("support_access_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Número de sesión único y legible (ACC-2024-0001)
  sessionNumber: text("session_number").notNull().unique(),
  
  // Quién solicita el acceso
  supportUserId: varchar("support_user_id").notNull().references(() => users.id),
  supportUserName: text("support_user_name").notNull(), // Denormalized
  
  // A qué empresa quiere acceder
  companyId: varchar("company_id").notNull().references(() => companies.id),
  companyName: text("company_name").notNull(), // Denormalized
  
  // Estado de la sesión
  status: supportAccessStatusEnum("status").notNull().default("pending"),
  
  // Justificación obligatoria (por qué necesita acceso)
  justification: text("justification").notNull(),
  
  // Alcance del acceso
  scope: supportAccessScopeEnum("scope").notNull().default("read_only"),
  
  // Referencia opcional a ticket de soporte
  relatedTicketId: varchar("related_ticket_id").references(() => supportTickets.id),
  relatedTicketNumber: text("related_ticket_number"),
  
  // Aprobación
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedByName: text("approved_by_name"),
  approvedAt: timestamp("approved_at"),
  denialReason: text("denial_reason"), // Razón si fue denegado
  
  // Duración del acceso
  requestedDurationMinutes: integer("requested_duration_minutes").notNull().default(120), // 2 horas default
  expiresAt: timestamp("expires_at"), // Se establece cuando se aprueba
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  revokedAt: timestamp("revoked_at"),
  revokedReason: text("revoked_reason"),
  
  // Metadata de cumplimiento Ley 1581/2012
  legalBasis: text("legal_basis").default("Prestación de servicios de soporte técnico"),
  dataProcessingPurpose: text("data_processing_purpose").default("Resolución de incidencia técnica"),
});

// Tabla de eventos de acceso (auditoría inmutable - append-only)
export const supportAccessEvents = pgTable("support_access_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Sesión relacionada
  sessionId: varchar("session_id").notNull().references(() => supportAccessSessions.id),
  
  // Tipo de evento
  eventType: supportAccessEventTypeEnum("event_type").notNull(),
  
  // Quién realizó la acción
  actorId: varchar("actor_id").notNull().references(() => users.id),
  actorName: text("actor_name").notNull(),
  actorRole: text("actor_role").notNull(),
  
  // Detalles del evento (JSON para flexibilidad)
  details: text("details"), // JSON string con información adicional
  
  // Contexto de auditoría
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  
  // Timestamp inmutable
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Validation Schemas - Support Access Sessions
export const insertSupportAccessSessionSchema = createInsertSchema(supportAccessSessions)
  .omit({ id: true, sessionNumber: true, createdAt: true, approvedAt: true, revokedAt: true, expiresAt: true });
export type InsertSupportAccessSession = z.infer<typeof insertSupportAccessSessionSchema>;
export type SupportAccessSession = typeof supportAccessSessions.$inferSelect;

// Validation Schemas - Support Access Events
export const insertSupportAccessEventSchema = createInsertSchema(supportAccessEvents)
  .omit({ id: true, createdAt: true });
export type InsertSupportAccessEvent = z.infer<typeof insertSupportAccessEventSchema>;
export type SupportAccessEvent = typeof supportAccessEvents.$inferSelect;

// ============================================================================
// TRABAJADORES DE ALTO RIESGO - Estándar 1.1.5 (Decreto 2090/2003)
// Identificación y cotización de pensión especial
// ============================================================================

export const highRiskWorkers = pgTable("high_risk_workers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  workerId: varchar("worker_id").notNull().references(() => workers.id, { onDelete: "cascade" }),
  actividadRiesgo: text("actividad_riesgo").notNull(), // 'mineria_subterranea', 'altas_temperaturas', 'radiaciones_ionizantes', 'sustancias_cancerigenas', 'bomberos', 'vigilancia_seguridad'
  descripcionActividad: text("descripcion_actividad"),
  fechaInicio: date("fecha_inicio"),
  fechaFin: date("fecha_fin"),
  porcentajeCotizacionEspecial: numeric("porcentaje_cotizacion_especial"), // Porcentaje adicional AFP
  ultimoMesPagado: text("ultimo_mes_pagado"), // Formato: "2025-12"
  cumpleCotizacion: boolean("cumple_cotizacion").default(false),
  soportePilaUrl: text("soporte_pila_url"),
  observaciones: text("observaciones"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertHighRiskWorkerSchema = createInsertSchema(highRiskWorkers).omit({ id: true, createdAt: true });
export type InsertHighRiskWorker = z.infer<typeof insertHighRiskWorkerSchema>;
export type HighRiskWorker = typeof highRiskWorkers.$inferSelect;

// ============================================================================
// COPASST COMPLETO - Estándar 1.1.6 (Resolución 2013/1986)
// Ciclo completo: Períodos, Miembros, Elecciones, Candidatos
// ============================================================================

// Períodos del COPASST - Vigencia de 2 años
export const copasstPeriodos = pgTable("copasst_periodos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  tipoComite: text("tipo_comite").notNull(), // 'copasst' | 'vigia'
  fechaInicio: date("fecha_inicio").notNull(),
  fechaFin: date("fecha_fin").notNull(), // 2 años después de inicio
  estado: text("estado").notNull().default("activo"), // 'activo' | 'vencido' | 'renovado'
  actaConstitucionUrl: text("acta_constitucion_url"),
  resolucionConformacionUrl: text("resolucion_conformacion_url"),
  observaciones: text("observaciones"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCopasstPeriodoSchema = createInsertSchema(copasstPeriodos).omit({ id: true, createdAt: true });
export type InsertCopasstPeriodo = z.infer<typeof insertCopasstPeriodoSchema>;
export type CopasstPeriodo = typeof copasstPeriodos.$inferSelect;

// Miembros del COPASST - Representantes del empleador y trabajadores
export const copasstMiembros = pgTable("copasst_miembros", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  periodoId: varchar("periodo_id").notNull().references(() => copasstPeriodos.id, { onDelete: "cascade" }),
  workerId: varchar("worker_id").notNull().references(() => workers.id, { onDelete: "cascade" }),
  tipoRepresentante: text("tipo_representante").notNull(), // 'empleador' | 'trabajador'
  rolMiembro: text("rol_miembro").notNull(), // 'principal' | 'suplente'
  cargo: text("cargo"), // 'presidente' | 'secretario' | 'miembro'
  votosObtenidos: integer("votos_obtenidos"), // Solo para representantes de trabajadores
  fechaDesignacion: date("fecha_designacion").notNull(),
  activo: boolean("activo").default(true),
  capacitado: boolean("capacitado").default(false), // 20 horas mínimo según Res. 0312/2019
  fechaCapacitacion: date("fecha_capacitacion"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCopasstMiembroSchema = createInsertSchema(copasstMiembros).omit({ id: true, createdAt: true });
export type InsertCopasstMiembro = z.infer<typeof insertCopasstMiembroSchema>;
export type CopasstMiembro = typeof copasstMiembros.$inferSelect;

// Elecciones COPASST - Proceso electoral para representantes de trabajadores
export const copasstElecciones = pgTable("copasst_elecciones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  periodoId: varchar("periodo_id").references(() => copasstPeriodos.id), // Se vincula después de constitución
  // Fechas del proceso
  fechaConvocatoria: date("fecha_convocatoria").notNull(),
  fechaInicioInscripcion: date("fecha_inicio_inscripcion").notNull(),
  fechaFinInscripcion: date("fecha_fin_inscripcion").notNull(),
  fechaVotacion: date("fecha_votacion").notNull(),
  horaInicioVotacion: text("hora_inicio_votacion"), // "08:00"
  horaFinVotacion: text("hora_fin_votacion"), // "16:00"
  // Estado del proceso
  estado: text("estado").notNull().default("convocatoria"), // 'convocatoria' | 'inscripcion' | 'votacion' | 'escrutinio' | 'completada'
  // Configuración según tamaño empresa (Res. 2013/1986)
  totalTrabajadores: integer("total_trabajadores").notNull(),
  principalesRequeridos: integer("principales_requeridos").notNull(), // 1-4 según tamaño
  suplentesRequeridos: integer("suplentes_requeridos").notNull(),
  // Resultados
  totalVotantes: integer("total_votantes"),
  votosValidos: integer("votos_validos"),
  votosNulos: integer("votos_nulos"),
  votosEnBlanco: integer("votos_en_blanco"),
  // Documentos
  convocatoriaUrl: text("convocatoria_url"),
  actaEscrutinioUrl: text("acta_escrutinio_url"),
  observaciones: text("observaciones"),
  // SST-2025-0097: Portal visibility
  publicadoEnPortal: boolean("publicado_en_portal").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCopasstEleccionSchema = createInsertSchema(copasstElecciones).omit({ id: true, createdAt: true });
export type InsertCopasstEleccion = z.infer<typeof insertCopasstEleccionSchema>;
export type CopasstEleccion = typeof copasstElecciones.$inferSelect;

// Candidatos a elecciones COPASST
export const copasstCandidatos = pgTable("copasst_candidatos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eleccionId: varchar("eleccion_id").notNull().references(() => copasstElecciones.id, { onDelete: "cascade" }),
  workerId: varchar("worker_id").notNull().references(() => workers.id, { onDelete: "cascade" }),
  fechaInscripcion: date("fecha_inscripcion").notNull(),
  propuestas: text("propuestas"), // Propuestas del candidato (opcional)
  aceptaCandidatura: boolean("acepta_candidatura").default(true),
  estado: text("estado").notNull().default("inscrito"), // 'inscrito' | 'aceptado' | 'rechazado' | 'electo_principal' | 'electo_suplente'
  votosObtenidos: integer("votos_obtenidos").default(0),
  ordenEleccion: integer("orden_eleccion"), // Posición en resultados (1 = más votos)
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCopasstCandidatoSchema = createInsertSchema(copasstCandidatos).omit({ id: true, createdAt: true });
export type InsertCopasstCandidato = z.infer<typeof insertCopasstCandidatoSchema>;
export type CopasstCandidato = typeof copasstCandidatos.$inferSelect;

// Registro de votación COPASST (para auditoría, sin identificar al votante)
export const copasstRegistroVotacion = pgTable("copasst_registro_votacion", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eleccionId: varchar("eleccion_id").notNull().references(() => copasstElecciones.id, { onDelete: "cascade" }),
  workerId: varchar("worker_id").notNull().references(() => workers.id, { onDelete: "cascade" }), // Solo para verificar quién votó, no su voto
  fechaVoto: timestamp("fecha_voto").defaultNow(),
});

export const insertCopasstRegistroVotacionSchema = createInsertSchema(copasstRegistroVotacion).omit({ id: true });
export type InsertCopasstRegistroVotacion = z.infer<typeof insertCopasstRegistroVotacionSchema>;
export type CopasstRegistroVotacion = typeof copasstRegistroVotacion.$inferSelect;

// Votos individuales COPASST (anónimos pero vinculados a candidatos)
export const copasstVotos = pgTable("copasst_votos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eleccionId: varchar("eleccion_id").notNull().references(() => copasstElecciones.id, { onDelete: "cascade" }),
  candidatoId: varchar("candidato_id").notNull().references(() => copasstCandidatos.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCopasstVotoSchema = createInsertSchema(copasstVotos).omit({ id: true, createdAt: true });
export type InsertCopasstVoto = z.infer<typeof insertCopasstVotoSchema>;
export type CopasstVoto = typeof copasstVotos.$inferSelect;

// ============================================================================
// CAPACITACIÓN VIRTUAL COPASST - E-Learning Gamificado
// ============================================================================

// Tipo de audiencia para cursos COPASST
export const cursoAudienciaEnum = pgEnum("curso_audiencia", [
  "todos",           // Todos los trabajadores de la empresa
  "solo_copasst",    // Solo miembros activos del COPASST
  "seleccion_manual" // Selección manual de trabajadores/miembros
]);

// Catálogo de cursos de capacitación
export const copasstCursos = pgTable("copasst_cursos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  codigo: text("codigo").notNull().unique(), // "COPASST-001"
  titulo: text("titulo").notNull(),
  descripcion: text("descripcion"),
  imagenUrl: text("imagen_url"), // Imagen de portada del curso
  duracionMinutos: integer("duracion_minutos").notNull().default(15),
  ordenCurso: integer("orden_curso").notNull().default(1), // Orden en que se muestran
  esObligatorio: boolean("es_obligatorio").default(true),
  prerequisitoCursoId: varchar("prerequisito_curso_id"), // Curso que debe completarse primero
  puntosCompletar: integer("puntos_completar").notNull().default(100), // Puntos al completar
  activo: boolean("activo").default(true),
  // Configuración de audiencia - vinculación con COPASST
  tipoAudiencia: cursoAudienciaEnum("tipo_audiencia").notNull().default("solo_copasst"), // Por defecto solo miembros COPASST
  miembrosAsignados: text("miembros_asignados").array(), // IDs de miembros COPASST o trabajadores asignados manualmente
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCopasstCursoSchema = createInsertSchema(copasstCursos).omit({ id: true, createdAt: true });
export type InsertCopasstCurso = z.infer<typeof insertCopasstCursoSchema>;
export type CopasstCurso = typeof copasstCursos.$inferSelect;

// Lecciones dentro de cada curso
export const copasstLecciones = pgTable("copasst_lecciones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cursoId: varchar("curso_id").notNull().references(() => copasstCursos.id, { onDelete: "cascade" }),
  titulo: text("titulo").notNull(),
  contenidoHtml: text("contenido_html").notNull(), // Contenido HTML de la lección
  videoUrl: text("video_url"), // URL de video embebido (YouTube, Vimeo)
  duracionMinutos: integer("duracion_minutos").notNull().default(5),
  ordenLeccion: integer("orden_leccion").notNull().default(1),
  puntosCompletar: integer("puntos_completar").notNull().default(10),
  activo: boolean("activo").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCopasstLeccionSchema = createInsertSchema(copasstLecciones).omit({ id: true, createdAt: true });
export type InsertCopasstLeccion = z.infer<typeof insertCopasstLeccionSchema>;
export type CopasstLeccion = typeof copasstLecciones.$inferSelect;

// Preguntas de quiz para cada curso
export const copasstQuizPreguntas = pgTable("copasst_quiz_preguntas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cursoId: varchar("curso_id").notNull().references(() => copasstCursos.id, { onDelete: "cascade" }),
  pregunta: text("pregunta").notNull(),
  tipoPregunta: text("tipo_pregunta").notNull().default("seleccion_multiple"), // 'seleccion_multiple' | 'verdadero_falso' | 'ordenar'
  opciones: jsonb("opciones").notNull(), // ["Opción A", "Opción B", "Opción C", "Opción D"]
  respuestaCorrecta: text("respuesta_correcta").notNull(), // Índice o valor correcto
  explicacion: text("explicacion"), // Retroalimentación al responder
  puntosPregunta: integer("puntos_pregunta").notNull().default(10),
  ordenPregunta: integer("orden_pregunta").notNull().default(1),
  activo: boolean("activo").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCopasstQuizPreguntaSchema = createInsertSchema(copasstQuizPreguntas).omit({ id: true, createdAt: true });
export type InsertCopasstQuizPregunta = z.infer<typeof insertCopasstQuizPreguntaSchema>;
export type CopasstQuizPregunta = typeof copasstQuizPreguntas.$inferSelect;

// Progreso del usuario en cursos y lecciones
export const copasstProgreso = pgTable("copasst_progreso", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  cursoId: varchar("curso_id").notNull().references(() => copasstCursos.id, { onDelete: "cascade" }),
  leccionId: varchar("leccion_id").references(() => copasstLecciones.id, { onDelete: "cascade" }), // NULL si es progreso de curso completo
  // Estado de progreso
  leccionesCompletadas: integer("lecciones_completadas").notNull().default(0),
  leccionesTotales: integer("lecciones_totales").notNull().default(0),
  porcentajeProgreso: integer("porcentaje_progreso").notNull().default(0), // 0-100
  completado: boolean("completado").default(false),
  fechaInicio: timestamp("fecha_inicio").defaultNow(),
  fechaCompletado: timestamp("fecha_completado"),
  // Quiz
  quizAprobado: boolean("quiz_aprobado").default(false),
  quizPuntaje: integer("quiz_puntaje"), // Puntos obtenidos en quiz
  quizIntentos: integer("quiz_intentos").notNull().default(0),
  ultimoIntentoQuiz: timestamp("ultimo_intento_quiz"),
  // Puntos gamificación
  puntosObtenidos: integer("puntos_obtenidos").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCopasstProgresoSchema = createInsertSchema(copasstProgreso).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCopasstProgreso = z.infer<typeof insertCopasstProgresoSchema>;
export type CopasstProgreso = typeof copasstProgreso.$inferSelect;

// Certificados de capacitación COPASST
export const copasstCertificados = pgTable("copasst_certificados", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  cursoId: varchar("curso_id").notNull().references(() => copasstCursos.id, { onDelete: "cascade" }),
  // Información del certificado
  codigoCertificado: text("codigo_certificado").notNull().unique(), // "CERT-COPASST-2024-001"
  nombreCompleto: text("nombre_completo").notNull(), // Nombre del usuario en el certificado
  identificacion: text("identificacion").notNull(), // CC o documento
  tituloCurso: text("titulo_curso").notNull(),
  duracionHoras: numeric("duracion_horas").notNull(), // Horas de capacitación
  puntajeObtenido: integer("puntaje_obtenido").notNull(), // Puntos del quiz
  puntajeMaximo: integer("puntaje_maximo").notNull(), // Puntos máximos posibles
  // Fechas
  fechaEmision: timestamp("fecha_emision").notNull().defaultNow(),
  fechaVencimiento: timestamp("fecha_vencimiento"), // 1 año típicamente
  // Estado
  activo: boolean("activo").default(true),
  // Verificación
  codigoQr: text("codigo_qr"), // URL para verificación
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCopasstCertificadoSchema = createInsertSchema(copasstCertificados).omit({ id: true, createdAt: true });
export type InsertCopasstCertificado = z.infer<typeof insertCopasstCertificadoSchema>;
export type CopasstCertificado = typeof copasstCertificados.$inferSelect;

// ============================================================================
// CAPACITACIÓN VIRTUAL COPASST - Phase 2: Gamification Tables
// ============================================================================

// Catálogo de insignias (badges)
export const copasstInsignias = pgTable("copasst_insignias", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  codigo: text("codigo").notNull().unique(), // "BADGE-FIRST-COURSE"
  titulo: text("titulo").notNull(), // "Primera Victoria"
  descripcion: text("descripcion").notNull(),
  iconoUrl: text("icono_url"), // URL for custom icons
  iconoLucide: text("icono_lucide"), // Lucide icon name: "trophy", "star", "award"
  categoria: text("categoria").notNull(), // "curso" | "quiz" | "racha" | "escenario" | "especial"
  condicion: jsonb("condicion").notNull(), // {"tipo": "cursos_completados", "valor": 1}
  puntosBonus: integer("puntos_bonus").notNull().default(50),
  activo: boolean("activo").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCopasstInsigniaSchema = createInsertSchema(copasstInsignias).omit({ id: true, createdAt: true });
export type InsertCopasstInsignia = z.infer<typeof insertCopasstInsigniaSchema>;
export type CopasstInsignia = typeof copasstInsignias.$inferSelect;

// Insignias desbloqueadas por usuario
export const copasstInsigniasUsuario = pgTable("copasst_insignias_usuario", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  insigniaId: varchar("insignia_id").notNull().references(() => copasstInsignias.id, { onDelete: "cascade" }),
  fechaDesbloqueo: timestamp("fecha_desbloqueo").notNull().defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  // UNIQUE constraint: (userId, insigniaId) - each user can unlock each badge only once
});

export const insertCopasstInsigniaUsuarioSchema = createInsertSchema(copasstInsigniasUsuario).omit({ id: true, createdAt: true });
export type InsertCopasstInsigniaUsuario = z.infer<typeof insertCopasstInsigniaUsuarioSchema>;
export type CopasstInsigniaUsuario = typeof copasstInsigniasUsuario.$inferSelect;

// Rachas de actividad del usuario (streaks)
export const copasstRachasUsuario = pgTable("copasst_rachas_usuario", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rachaActual: integer("racha_actual").notNull().default(0),
  rachaMaxima: integer("racha_maxima").notNull().default(0),
  ultimaActividad: date("ultima_actividad"), // Date only, not timestamp
  puntosBonusAcumulados: integer("puntos_bonus_acumulados").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  // UNIQUE constraint: (userId, companyId) - one streak record per user per company
});

export const insertCopasstRachaUsuarioSchema = createInsertSchema(copasstRachasUsuario).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCopasstRachaUsuario = z.infer<typeof insertCopasstRachaUsuarioSchema>;
export type CopasstRachaUsuario = typeof copasstRachasUsuario.$inferSelect;

// Puntos mensuales para leaderboard
export const copasstPuntosMensuales = pgTable("copasst_puntos_mensuales", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  anio: integer("anio").notNull(), // Year (2024, 2025, etc.)
  mes: integer("mes").notNull(), // Month 1-12
  puntosTotal: integer("puntos_total").notNull().default(0),
  cursosCompletados: integer("cursos_completados").notNull().default(0),
  leccionesCompletadas: integer("lecciones_completadas").notNull().default(0),
  quizzesAprobados: integer("quizzes_aprobados").notNull().default(0),
  insigniasDesbloqueadas: integer("insignias_desbloqueadas").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  // UNIQUE constraint: (userId, companyId, anio, mes) - one record per user per company per month
});

export const insertCopasstPuntosMensualesSchema = createInsertSchema(copasstPuntosMensuales).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCopasstPuntosMensuales = z.infer<typeof insertCopasstPuntosMensualesSchema>;
export type CopasstPuntosMensuales = typeof copasstPuntosMensuales.$inferSelect;

// Escenarios interactivos (scenarios catalog)
export const copasstEscenarios = pgTable("copasst_escenarios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  codigo: text("codigo").notNull().unique(), // "ESC-INVEST-001"
  titulo: text("titulo").notNull(),
  descripcion: text("descripcion").notNull(),
  categoria: text("categoria").notNull(), // "investigacion_accidentes" | "inspeccion" | "emergencia"
  duracionMinutos: integer("duracion_minutos").notNull().default(15),
  puntosPerfecto: integer("puntos_perfecto").notNull().default(100), // Max points for optimal path
  imagenUrl: text("imagen_url"),
  activo: boolean("activo").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCopasstEscenarioSchema = createInsertSchema(copasstEscenarios).omit({ id: true, createdAt: true });
export type InsertCopasstEscenario = z.infer<typeof insertCopasstEscenarioSchema>;
export type CopasstEscenario = typeof copasstEscenarios.$inferSelect;

// Nodos de decisión de escenarios
export const copasstEscenarioNodos = pgTable("copasst_escenario_nodos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  escenarioId: varchar("escenario_id").notNull().references(() => copasstEscenarios.id, { onDelete: "cascade" }),
  tipo: text("tipo").notNull(), // "inicio" | "decision" | "resultado"
  titulo: text("titulo").notNull(),
  contenidoHtml: text("contenido_html").notNull(),
  imagenUrl: text("imagen_url"),
  orden: integer("orden").notNull().default(1),
  opciones: jsonb("opciones"), // Array of {texto, siguienteNodoId, puntos, feedback}
  esCorrecta: boolean("es_correcta").default(false), // For optimal path marking
  puntosNodo: integer("puntos_nodo").notNull().default(10),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCopasstEscenarioNodoSchema = createInsertSchema(copasstEscenarioNodos).omit({ id: true, createdAt: true });
export type InsertCopasstEscenarioNodo = z.infer<typeof insertCopasstEscenarioNodoSchema>;
export type CopasstEscenarioNodo = typeof copasstEscenarioNodos.$inferSelect;

// Progreso del usuario en escenarios interactivos
export const copasstEscenarioProgreso = pgTable("copasst_escenario_progreso", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  escenarioId: varchar("escenario_id").notNull().references(() => copasstEscenarios.id, { onDelete: "cascade" }),
  nodosVisitados: jsonb("nodos_visitados").default(sql`'[]'`), // Array of node IDs visited
  decisionesTomadas: jsonb("decisiones_tomadas").default(sql`'[]'`), // Array of {nodoId, opcionIndex, puntos}
  puntosObtenidos: integer("puntos_obtenidos").notNull().default(0),
  completado: boolean("completado").default(false),
  fechaInicio: timestamp("fecha_inicio").defaultNow(),
  fechaCompletado: timestamp("fecha_completado"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCopasstEscenarioProgresoSchema = createInsertSchema(copasstEscenarioProgreso).omit({ id: true, createdAt: true });
export type InsertCopasstEscenarioProgreso = z.infer<typeof insertCopasstEscenarioProgresoSchema>;
export type CopasstEscenarioProgreso = typeof copasstEscenarioProgreso.$inferSelect;

// ============================================================================
// CAPACITACIÓN VIRTUAL COPASST - Phase 3: CMS, Question Bank, 360° Evaluations
// ============================================================================

// Categorías de cursos COPASST (administrables por empresa)
export const copasstCursoCategorias = pgTable("copasst_curso_categorias", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  nombre: text("nombre").notNull(),
  descripcion: text("descripcion"),
  orden: integer("orden").notNull().default(1),
  activo: boolean("activo").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCopasstCursoCategoriaSchema = createInsertSchema(copasstCursoCategorias).omit({ id: true, createdAt: true });
export type InsertCopasstCursoCategoria = z.infer<typeof insertCopasstCursoCategoriaSchema>;
export type CopasstCursoCategoria = typeof copasstCursoCategorias.$inferSelect;

// Asignaciones de cursos a usuarios
export const copasstCursoAsignaciones = pgTable("copasst_curso_asignaciones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  cursoId: varchar("curso_id").notNull().references(() => copasstCursos.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  asignadoPor: varchar("asignado_por").notNull().references(() => users.id),
  fechaAsignacion: timestamp("fecha_asignacion").notNull().defaultNow(),
  fechaLimite: timestamp("fecha_limite"),
  notificarDiasAntes: integer("notificar_dias_antes").default(3),
  estado: text("estado").notNull().default("pendiente"),
  fechaCompletado: timestamp("fecha_completado"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCopasstCursoAsignacionSchema = createInsertSchema(copasstCursoAsignaciones).omit({ id: true, createdAt: true });
export type InsertCopasstCursoAsignacion = z.infer<typeof insertCopasstCursoAsignacionSchema>;
export type CopasstCursoAsignacion = typeof copasstCursoAsignaciones.$inferSelect;

// Banco de preguntas reutilizables
export const copasstBancoPreguntas = pgTable("copasst_banco_preguntas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").references(() => companies.id, { onDelete: "cascade" }),
  categoriaId: varchar("categoria_id").references(() => copasstCursoCategorias.id, { onDelete: "set null" }),
  enunciadoHtml: text("enunciado_html").notNull(),
  tipoPregunta: text("tipo_pregunta").notNull().default("seleccion_multiple"),
  opciones: jsonb("opciones").notNull(),
  respuestaCorrecta: text("respuesta_correcta").notNull(),
  explicacionHtml: text("explicacion_html"),
  dificultad: text("dificultad").notNull().default("media"),
  etiquetas: text("etiquetas").array(),
  puntos: integer("puntos").notNull().default(10),
  activo: boolean("activo").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCopasstBancoPreguntaSchema = createInsertSchema(copasstBancoPreguntas).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCopasstBancoPregunta = z.infer<typeof insertCopasstBancoPreguntaSchema>;
export type CopasstBancoPregunta = typeof copasstBancoPreguntas.$inferSelect;

// Períodos de evaluación 360°
export const copasstEvaluacionPeriodos = pgTable("copasst_evaluacion_periodos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  nombre: text("nombre").notNull(),
  descripcion: text("descripcion"),
  fechaInicio: date("fecha_inicio").notNull(),
  fechaFin: date("fecha_fin").notNull(),
  estado: text("estado").notNull().default("configuracion"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCopasstEvaluacionPeriodoSchema = createInsertSchema(copasstEvaluacionPeriodos).omit({ id: true, createdAt: true });
export type InsertCopasstEvaluacionPeriodo = z.infer<typeof insertCopasstEvaluacionPeriodoSchema>;
export type CopasstEvaluacionPeriodo = typeof copasstEvaluacionPeriodos.$inferSelect;

// Catálogo de competencias evaluables
export const copasstCompetencias = pgTable("copasst_competencias", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").references(() => companies.id, { onDelete: "cascade" }),
  nombre: text("nombre").notNull(),
  descripcion: text("descripcion"),
  dimension: text("dimension").notNull(),
  activo: boolean("activo").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCopasstCompetenciaSchema = createInsertSchema(copasstCompetencias).omit({ id: true, createdAt: true });
export type InsertCopasstCompetencia = z.infer<typeof insertCopasstCompetenciaSchema>;
export type CopasstCompetencia = typeof copasstCompetencias.$inferSelect;

// Items de plantilla de evaluación (criterios a evaluar)
export const copasstEvaluacionItems = pgTable("copasst_evaluacion_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  periodoId: varchar("periodo_id").notNull().references(() => copasstEvaluacionPeriodos.id, { onDelete: "cascade" }),
  competenciaId: varchar("competencia_id").notNull().references(() => copasstCompetencias.id, { onDelete: "cascade" }),
  enunciado: text("enunciado").notNull(),
  escalaMinima: integer("escala_minima").notNull().default(1),
  escalaMaxima: integer("escala_maxima").notNull().default(5),
  peso: integer("peso").notNull().default(1),
  orden: integer("orden").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCopasstEvaluacionItemSchema = createInsertSchema(copasstEvaluacionItems).omit({ id: true, createdAt: true });
export type InsertCopasstEvaluacionItem = z.infer<typeof insertCopasstEvaluacionItemSchema>;
export type CopasstEvaluacionItem = typeof copasstEvaluacionItems.$inferSelect;

// Asignaciones de evaluación (evaluador → evaluado)
export const copasstEvaluacionAsignaciones = pgTable("copasst_evaluacion_asignaciones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  periodoId: varchar("periodo_id").notNull().references(() => copasstEvaluacionPeriodos.id, { onDelete: "cascade" }),
  evaluadorId: varchar("evaluador_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  evaluadoId: varchar("evaluado_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tipoEvaluador: text("tipo_evaluador").notNull(),
  estado: text("estado").notNull().default("pendiente"),
  fechaCompletada: timestamp("fecha_completada"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCopasstEvaluacionAsignacionSchema = createInsertSchema(copasstEvaluacionAsignaciones).omit({ id: true, createdAt: true });
export type InsertCopasstEvaluacionAsignacion = z.infer<typeof insertCopasstEvaluacionAsignacionSchema>;
export type CopasstEvaluacionAsignacion = typeof copasstEvaluacionAsignaciones.$inferSelect;

// Respuestas de evaluación
export const copasstEvaluacionRespuestas = pgTable("copasst_evaluacion_respuestas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  asignacionId: varchar("asignacion_id").notNull().references(() => copasstEvaluacionAsignaciones.id, { onDelete: "cascade" }),
  itemId: varchar("item_id").notNull().references(() => copasstEvaluacionItems.id, { onDelete: "cascade" }),
  valor: integer("valor").notNull(),
  comentario: text("comentario"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCopasstEvaluacionRespuestaSchema = createInsertSchema(copasstEvaluacionRespuestas).omit({ id: true, createdAt: true });
export type InsertCopasstEvaluacionRespuesta = z.infer<typeof insertCopasstEvaluacionRespuestaSchema>;
export type CopasstEvaluacionRespuesta = typeof copasstEvaluacionRespuestas.$inferSelect;

// Resultados agregados de evaluación
export const copasstEvaluacionResultados = pgTable("copasst_evaluacion_resultados", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  periodoId: varchar("periodo_id").notNull().references(() => copasstEvaluacionPeriodos.id, { onDelete: "cascade" }),
  evaluadoId: varchar("evaluado_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  promedioGeneral: numeric("promedio_general").notNull(),
  promediosPorDimension: jsonb("promedios_por_dimension").notNull(),
  fortalezas: jsonb("fortalezas"),
  oportunidades: jsonb("oportunidades"),
  comentariosGenerales: text("comentarios_generales"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCopasstEvaluacionResultadoSchema = createInsertSchema(copasstEvaluacionResultados).omit({ id: true, createdAt: true });
export type InsertCopasstEvaluacionResultado = z.infer<typeof insertCopasstEvaluacionResultadoSchema>;
export type CopasstEvaluacionResultado = typeof copasstEvaluacionResultados.$inferSelect;

// Notificaciones de capacitación
export const copasstNotificaciones = pgTable("copasst_notificaciones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  asignacionId: varchar("asignacion_id").references(() => copasstCursoAsignaciones.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tipo: text("tipo").notNull(),
  titulo: text("titulo").notNull(),
  mensaje: text("mensaje").notNull(),
  estado: text("estado").notNull().default("pendiente"),
  fechaProgramada: timestamp("fecha_programada").notNull(),
  fechaEnvio: timestamp("fecha_envio"),
  intentos: integer("intentos").notNull().default(0),
  errorMensaje: text("error_mensaje"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCopasstNotificacionSchema = createInsertSchema(copasstNotificaciones).omit({ id: true, createdAt: true });
export type InsertCopasstNotificacion = z.infer<typeof insertCopasstNotificacionSchema>;
export type CopasstNotificacion = typeof copasstNotificaciones.$inferSelect;

// ============================================================================
// COMITÉ DE CONVIVENCIA LABORAL - Resolución 652/2012, Resolución 1356/2012
// Ciclo completo: Períodos, Miembros, Elecciones, Candidatos, Votación, Actas
// ============================================================================

// Períodos del Comité de Convivencia Laboral - Vigencia de 2 años
export const convivenciaPeriodos = pgTable("convivencia_periodos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  fechaInicio: date("fecha_inicio").notNull(),
  fechaFin: date("fecha_fin").notNull(), // 2 años después de inicio
  estado: text("estado").notNull().default("activo"), // 'activo' | 'inactivo' | 'pendiente'
  observaciones: text("observaciones"),
  actaConstitucionUrl: text("acta_constitucion_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertConvivenciaPeriodoSchema = createInsertSchema(convivenciaPeriodos).omit({ id: true, createdAt: true });
export type InsertConvivenciaPeriodo = z.infer<typeof insertConvivenciaPeriodoSchema>;
export type ConvivenciaPeriodo = typeof convivenciaPeriodos.$inferSelect;

// Miembros del Comité de Convivencia Laboral
export const convivenciaMiembros = pgTable("convivencia_miembros", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  periodoId: varchar("periodo_id").notNull().references(() => convivenciaPeriodos.id, { onDelete: "cascade" }),
  workerId: varchar("worker_id").notNull().references(() => workers.id, { onDelete: "cascade" }),
  representacion: text("representacion").notNull(), // 'empleador' | 'trabajador'
  cargo: text("cargo").notNull(), // 'presidente' | 'secretario' | 'miembro_principal' | 'miembro_suplente'
  fechaDesignacion: date("fecha_designacion").notNull(),
  estado: text("estado").notNull().default("activo"), // 'activo' | 'inactivo'
  votosObtenidos: integer("votos_obtenidos"), // Solo para representantes de trabajadores electos
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertConvivenciaMiembroSchema = createInsertSchema(convivenciaMiembros).omit({ id: true, createdAt: true });
export type InsertConvivenciaMiembro = z.infer<typeof insertConvivenciaMiembroSchema>;
export type ConvivenciaMiembro = typeof convivenciaMiembros.$inferSelect;

// Elecciones Comité de Convivencia Laboral
export const convivenciaElecciones = pgTable("convivencia_elecciones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  periodoId: varchar("periodo_id").references(() => convivenciaPeriodos.id), // Se vincula después de constitución
  // Fechas del proceso
  fechaConvocatoria: date("fecha_convocatoria").notNull(),
  fechaInicioInscripcion: date("fecha_inicio_inscripcion").notNull(),
  fechaFinInscripcion: date("fecha_fin_inscripcion").notNull(),
  fechaVotacion: date("fecha_votacion").notNull(),
  horaInicioVotacion: text("hora_inicio_votacion"), // "08:00"
  horaFinVotacion: text("hora_fin_votacion"), // "16:00"
  // Modalidad de votación
  modalidadVotacion: text("modalidad_votacion").notNull().default("presencial"), // 'presencial' | 'virtual' | 'mixta'
  // Estado del proceso
  estado: text("estado").notNull().default("convocatoria"), // 'convocatoria' | 'inscripcion' | 'votacion' | 'escrutinio' | 'completada'
  // Publicación en Portal de Trabajadores (SST-2025-0097)
  publicadoEnPortal: boolean("publicado_en_portal").notNull().default(false), // Controla visibilidad en portal de trabajadores
  // Configuración según Resolución 652/2012
  principalesRequeridos: integer("principales_requeridos").notNull().default(2), // Mínimo 2 por cada parte
  suplentesRequeridos: integer("suplentes_requeridos").notNull().default(2),
  // Resultados
  totalVotantes: integer("total_votantes"),
  votosValidos: integer("votos_validos"),
  votosNulos: integer("votos_nulos"),
  votosEnBlanco: integer("votos_en_blanco"),
  // Documentos
  convocatoriaUrl: text("convocatoria_url"),
  actaEscrutinioUrl: text("acta_escrutinio_url"),
  observaciones: text("observaciones"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertConvivenciaEleccionSchema = createInsertSchema(convivenciaElecciones).omit({ id: true, createdAt: true });
export type InsertConvivenciaEleccion = z.infer<typeof insertConvivenciaEleccionSchema>;
export type ConvivenciaEleccion = typeof convivenciaElecciones.$inferSelect;

// Candidatos a elecciones Comité de Convivencia Laboral
export const convivenciaCandidatos = pgTable("convivencia_candidatos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eleccionId: varchar("eleccion_id").notNull().references(() => convivenciaElecciones.id, { onDelete: "cascade" }),
  workerId: varchar("worker_id").notNull().references(() => workers.id, { onDelete: "cascade" }),
  propuestaLaboral: text("propuesta_laboral"), // Propuesta del candidato para el comité
  fechaInscripcion: date("fecha_inscripcion").notNull(),
  estado: text("estado").notNull().default("inscrito"), // 'inscrito' | 'aceptado' | 'rechazado' | 'electo' | 'no_electo'
  votosRecibidos: integer("votos_recibidos").notNull().default(0),
  ordenEleccion: integer("orden_eleccion"), // Posición en resultados (1 = más votos)
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertConvivenciaCandidatoSchema = createInsertSchema(convivenciaCandidatos).omit({ id: true, createdAt: true });
export type InsertConvivenciaCandidato = z.infer<typeof insertConvivenciaCandidatoSchema>;
export type ConvivenciaCandidato = typeof convivenciaCandidatos.$inferSelect;

// Registro de votación Comité de Convivencia (para auditoría, sin identificar el voto)
export const convivenciaRegistroVotacion = pgTable("convivencia_registro_votacion", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eleccionId: varchar("eleccion_id").notNull().references(() => convivenciaElecciones.id, { onDelete: "cascade" }),
  workerId: varchar("worker_id").notNull().references(() => workers.id, { onDelete: "cascade" }), // Solo para verificar quién votó, no su voto
  fechaHoraVoto: timestamp("fecha_hora_voto").defaultNow(),
  ipAddress: text("ip_address"), // IP desde donde votó (opcional)
});

export const insertConvivenciaRegistroVotacionSchema = createInsertSchema(convivenciaRegistroVotacion).omit({ id: true });
export type InsertConvivenciaRegistroVotacion = z.infer<typeof insertConvivenciaRegistroVotacionSchema>;
export type ConvivenciaRegistroVotacion = typeof convivenciaRegistroVotacion.$inferSelect;

// Votos individuales Comité de Convivencia (anónimos pero vinculados a candidatos)
export const convivenciaVotos = pgTable("convivencia_votos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eleccionId: varchar("eleccion_id").notNull().references(() => convivenciaElecciones.id, { onDelete: "cascade" }),
  candidatoId: varchar("candidato_id").notNull().references(() => convivenciaCandidatos.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertConvivenciaVotoSchema = createInsertSchema(convivenciaVotos).omit({ id: true, createdAt: true });
export type InsertConvivenciaVoto = z.infer<typeof insertConvivenciaVotoSchema>;
export type ConvivenciaVoto = typeof convivenciaVotos.$inferSelect;

// Actas del Comité de Convivencia Laboral
export const convivenciaActas = pgTable("convivencia_actas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  eleccionId: varchar("eleccion_id").references(() => convivenciaElecciones.id, { onDelete: "set null" }), // Nullable, no todas las actas son de elección
  // Información del acta
  tipo: text("tipo").notNull(), // 'convocatoria' | 'escrutinio' | 'constitucion' | 'sesion' | 'queja'
  numero: integer("numero").notNull(), // Número consecutivo del acta
  fecha: date("fecha").notNull(),
  asunto: text("asunto").notNull(), // Tema principal del acta
  contenido: text("contenido").notNull(), // Contenido completo del acta
  // Participantes
  asistentes: text("asistentes").array().notNull(), // Lista de asistentes
  acuerdos: text("acuerdos").array(), // Acuerdos tomados (opcional)
  observaciones: text("observaciones"),
  // Firmas
  firmas: jsonb("firmas"), // [{nombre, cargo, firmado: boolean}]
  // Documento
  documentoUrl: text("documento_url"), // URL del PDF del acta
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertConvivenciaActaSchema = createInsertSchema(convivenciaActas).omit({ id: true, createdAt: true });
export type InsertConvivenciaActa = z.infer<typeof insertConvivenciaActaSchema>;
export type ConvivenciaActa = typeof convivenciaActas.$inferSelect;

// ============================================================================
// WORKER PORTAL ACCESS LOGS (SST-2025-0082)
// ============================================================================
// Tracks when workers/employees access the Employee Portal (Portal de Empleados)

export const deviceTypeEnum = pgEnum("device_type", ["mobile", "desktop", "tablet"]);

export const workerPortalAccessLogs = pgTable("worker_portal_access_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  workerId: varchar("worker_id").references(() => workers.id, { onDelete: "set null" }),
  userName: text("user_name"),
  workerName: text("worker_name"),
  accessTime: timestamp("access_time").notNull().default(sql`now()`),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  deviceType: deviceTypeEnum("device_type"),
});

export const insertWorkerPortalAccessLogSchema = createInsertSchema(workerPortalAccessLogs).omit({ id: true });
export type InsertWorkerPortalAccessLog = z.infer<typeof insertWorkerPortalAccessLogSchema>;
export type WorkerPortalAccessLog = typeof workerPortalAccessLogs.$inferSelect;

// ============================================================================
// PRICING PLUGIN - Re-export for Drizzle migrations (non-invasive plugin)
// ============================================================================
export * from "../pricing_plugin/schema";

// ============================================================================
// PROMOCIÓN Y PREVENCIÓN EN SALUD - ESTÁNDAR 3.1.2
// ============================================================================
// Actividades de medicina del trabajo, promoción y prevención de la salud

export const activityTypeEnum = pgEnum("activity_type", [
  "medicina_trabajo",
  "promocion_prevencion", 
  "campana_especial",
  "examen_ocupacional",
  "capacitacion_salud"
]);

export const activityModalityEnum = pgEnum("activity_modality", [
  "presencial",
  "virtual",
  "mixta"
]);

export const activityFrequencyEnum = pgEnum("activity_frequency", [
  "unica",
  "diaria",
  "semanal",
  "quincenal",
  "mensual",
  "trimestral",
  "semestral",
  "anual"
]);

export const promotionPreventionActivities = pgTable("promotion_prevention_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  // Información de la actividad
  title: text("title").notNull(),
  activityType: activityTypeEnum("activity_type").notNull(),
  objective: text("objective").notNull(),
  scope: text("scope"), // Alcance de la actividad
  description: text("description"),
  // Vinculación con riesgos (IPERC)
  priorityRiskType: text("priority_risk_type"), // Tipo de riesgo prioritario del IPERC
  priorityRiskDescription: text("priority_risk_description"),
  // Vinculación con SVE
  sveProgramId: varchar("sve_program_id").references(() => svePrograms.id, { onDelete: "set null" }),
  // Modalidad y programación
  modality: activityModalityEnum("modality").notNull().default("presencial"),
  frequency: activityFrequencyEnum("frequency").notNull().default("unica"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  scheduledTime: text("scheduled_time"), // Hora programada
  location: text("location"), // Lugar de ejecución
  // Responsable
  responsibleName: text("responsible_name").notNull(),
  responsiblePosition: text("responsible_position"),
  responsibleEmail: text("responsible_email"),
  // Población objetivo
  targetPopulation: text("target_population").notNull(), // Descripción de población objetivo
  estimatedParticipants: integer("estimated_participants"),
  actualParticipants: integer("actual_participants"),
  // Evidencias y cumplimiento
  evidenceRequired: text("evidence_required").array(), // Tipos de evidencia requeridos
  evidenceUrls: text("evidence_urls").array(), // URLs de evidencias cargadas
  // Estado
  status: text("status").notNull().default("programada"), // programada, en_ejecucion, completada, cancelada
  completionPercentage: integer("completion_percentage").default(0),
  completionDate: date("completion_date"),
  observations: text("observations"),
  // Metadatos
  createdBy: varchar("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPromotionPreventionActivitySchema = createInsertSchema(promotionPreventionActivities)
  .omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPromotionPreventionActivity = z.infer<typeof insertPromotionPreventionActivitySchema>;
export type PromotionPreventionActivity = typeof promotionPreventionActivities.$inferSelect;

// Participantes de actividades de promoción y prevención
export const promotionPreventionParticipants = pgTable("promotion_prevention_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  activityId: varchar("activity_id").notNull().references(() => promotionPreventionActivities.id, { onDelete: "cascade" }),
  workerId: varchar("worker_id").references(() => workers.id, { onDelete: "set null" }),
  workerName: text("worker_name").notNull(),
  workerDocument: text("worker_document"),
  participationRole: text("participation_role").notNull().default("participante"), // participante, facilitador, observador
  attended: boolean("attended").default(false),
  attendanceDate: date("attendance_date"),
  observations: text("observations"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPromotionPreventionParticipantSchema = createInsertSchema(promotionPreventionParticipants)
  .omit({ id: true, createdAt: true });
export type InsertPromotionPreventionParticipant = z.infer<typeof insertPromotionPreventionParticipantSchema>;
export type PromotionPreventionParticipant = typeof promotionPreventionParticipants.$inferSelect;

// =====================================================
// INDICADORES DE ACCIDENTALIDAD SST (Estándar 3.2.2)
// Resolución 0312/2019, Decreto 1072/2015
// =====================================================

// Estado del registro de indicadores
export const indicatorStatusEnum = pgEnum("indicator_status", [
  "borrador",      // En elaboración
  "completado",    // Registro completo
  "aprobado",      // Aprobado por responsable SST
  "cerrado"        // Período cerrado
]);

// Tabla de registro estadístico de accidentalidad
export const accidentStatistics = pgTable("accident_statistics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  
  // Período de reporte
  year: integer("year").notNull(), // Año del registro (ej: 2024, 2025)
  month: integer("month"), // Mes específico (1-12), null = acumulado anual
  
  // Datos base para cálculo de indicadores
  totalWorkers: integer("total_workers").notNull(), // Número promedio de trabajadores en el período
  hoursWorkedHHT: numeric("hours_worked_hht", { precision: 12, scale: 2 }).notNull(), // Horas Hombre Trabajadas
  
  // Estadísticas de accidentalidad
  totalAccidents: integer("total_accidents").notNull().default(0), // Total de accidentes de trabajo
  fatalAccidents: integer("fatal_accidents").notNull().default(0), // Accidentes mortales
  severeAccidents: integer("severe_accidents").notNull().default(0), // Accidentes graves
  lostDays: integer("lost_days").notNull().default(0), // Días perdidos por incapacidad
  
  // Enfermedades laborales
  totalOccupationalDiseases: integer("total_occupational_diseases").notNull().default(0), // Total EL diagnosticadas
  
  // Incidentes
  totalIncidents: integer("total_incidents").notNull().default(0), // Total de incidentes reportados
  
  // Indicadores calculados (se recalculan automáticamente)
  indicadorIF: numeric("indicador_if", { precision: 10, scale: 4 }), // Índice de Frecuencia = (AT x 200.000) / HHT
  indicadorIS: numeric("indicador_is", { precision: 10, scale: 4 }), // Índice de Severidad = (Días perdidos x 200.000) / HHT
  indicadorILI: numeric("indicador_ili", { precision: 10, scale: 4 }), // Índice de Lesión Incapacitante = (IF x IS) / 1000
  tasaAccidentalidad: numeric("tasa_accidentalidad", { precision: 10, scale: 4 }), // (AT / Trabajadores) x 100
  tasaEnfermedadLaboral: numeric("tasa_enfermedad_laboral", { precision: 10, scale: 4 }), // (EL / Trabajadores) x 100
  tasaAusentismo: numeric("tasa_ausentismo", { precision: 10, scale: 4 }), // (Días ausencia / Días programados) x 100
  
  // Análisis y conclusiones (requerido por Resolución 0312/2019)
  trendAnalysis: text("trend_analysis"), // Análisis de tendencias vs período anterior
  conclusions: text("conclusions"), // Conclusiones del estudio estadístico
  improvementActions: text("improvement_actions"), // Acciones de mejora derivadas del análisis
  
  // Estado y metadatos
  status: indicatorStatusEnum("status").notNull().default("borrador"),
  approvedBy: varchar("approved_by").references(() => users.id, { onDelete: "set null" }),
  approvedAt: timestamp("approved_at"),
  createdBy: varchar("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAccidentStatisticsSchema = createInsertSchema(accidentStatistics)
  .omit({ id: true, createdAt: true, updatedAt: true, indicadorIF: true, indicadorIS: true, indicadorILI: true, tasaAccidentalidad: true, tasaEnfermedadLaboral: true, tasaAusentismo: true });
export type InsertAccidentStatistics = z.infer<typeof insertAccidentStatisticsSchema>;
export type AccidentStatistics = typeof accidentStatistics.$inferSelect;

// =====================================================
// ESTILOS DE VIDA SALUDABLE - EVS (Estándar 3.1.7)
// Resolución 0312/2019: Controles tabaquismo, alcoholismo,
// farmacodependencia y otros programas de promoción de la salud
// =====================================================

// Estado del programa EVS
export const evsProgramStatusEnum = pgEnum("evs_program_status", [
  "borrador",       // En elaboración
  "activo",         // Vigente y en ejecución
  "cerrado",        // Período finalizado
  "suspendido"      // Temporalmente suspendido
]);

// Categorías de control de sustancias
export const evsControlCategoryEnum = pgEnum("evs_control_category", [
  "tabaquismo",           // Control de consumo de tabaco
  "alcoholismo",          // Control de consumo de alcohol
  "farmacodependencia",   // Control de sustancias psicoactivas
  "habitos_alimenticios", // Alimentación saludable
  "actividad_fisica",     // Ejercicio y movimiento
  "salud_mental",         // Bienestar psicológico
  "riesgo_cardiovascular",// Prevención cardiovascular
  "otro"                  // Otras categorías
]);

// Resultado de controles/tamizajes
export const evsControlResultEnum = pgEnum("evs_control_result", [
  "negativo",         // Sin hallazgos
  "positivo",         // Consumo detectado
  "sospechoso",       // Requiere confirmación
  "no_realizado",     // No se pudo realizar
  "rechazado"         // Trabajador rechazó el control
]);

// Estado de seguimiento de casos
export const evsFollowupStatusEnum = pgEnum("evs_followup_status", [
  "activo",           // En seguimiento
  "en_tratamiento",   // Remitido a tratamiento
  "recuperado",       // Caso resuelto satisfactoriamente
  "abandonado",       // Abandonó el seguimiento
  "cerrado"           // Caso cerrado administrativamente
]);

// Programa anual de Estilos de Vida Saludable
export const evsPrograms = pgTable("evs_programs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  
  // Identificación del programa
  year: integer("year").notNull(), // Año de vigencia
  name: text("name").notNull(), // Nombre del programa (ej: "Programa EVS 2025")
  
  // Política y marco normativo
  policy: text("policy").notNull(), // Política de empresa sobre estilos de vida saludables
  objectives: text("objectives").notNull(), // Objetivos específicos del programa
  scope: text("scope"), // Alcance del programa (trabajadores, contratistas, etc.)
  
  // Diagnóstico inicial (línea base)
  diagnosticSummary: text("diagnostic_summary"), // Resumen del diagnóstico de hábitos
  identifiedRisks: text("identified_risks").array(), // Riesgos comportamentales identificados
  priorityAreas: text("priority_areas").array(), // Áreas prioritarias de intervención
  
  // Responsables
  responsibleName: text("responsible_name").notNull(), // Responsable del programa
  responsiblePosition: text("responsible_position"),
  responsibleEmail: text("responsible_email"),
  
  // Recursos y presupuesto
  approvedBudget: numeric("approved_budget", { precision: 12, scale: 2 }), // Presupuesto asignado
  executedBudget: numeric("executed_budget", { precision: 12, scale: 2 }), // Presupuesto ejecutado
  
  // Cronograma general
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  
  // Indicadores meta
  participationTarget: integer("participation_target"), // Meta de % participación
  complianceTarget: integer("compliance_target"), // Meta de % cumplimiento de actividades
  
  // Estado y metadatos
  status: evsProgramStatusEnum("status").notNull().default("borrador"),
  approvedBy: varchar("approved_by").references(() => users.id, { onDelete: "set null" }),
  approvedAt: timestamp("approved_at"),
  createdBy: varchar("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEvsProgramSchema = createInsertSchema(evsPrograms)
  .omit({ id: true, createdAt: true, updatedAt: true });
export type InsertEvsProgram = z.infer<typeof insertEvsProgramSchema>;
export type EvsProgram = typeof evsPrograms.$inferSelect;

// Actividades/Campañas del programa EVS
export const evsActivities = pgTable("evs_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  programId: varchar("program_id").references(() => evsPrograms.id, { onDelete: "set null" }),
  
  // Clasificación
  category: evsControlCategoryEnum("category").notNull(),
  customCategory: text("custom_category"), // Si category es "otro"
  
  // Información de la actividad
  title: text("title").notNull(),
  description: text("description"),
  objective: text("objective").notNull(),
  methodology: text("methodology"), // Metodología de la actividad
  
  // Programación
  scheduledDate: date("scheduled_date").notNull(),
  executionDate: date("execution_date"), // Fecha real de ejecución
  startTime: text("start_time"),
  endTime: text("end_time"),
  location: text("location"),
  modality: text("modality").default("presencial"), // presencial, virtual, mixta
  meetingLink: text("meeting_link"), // Enlace de reunión virtual (Zoom, Meet, Teams, etc.)
  
  // Responsable
  facilitatorName: text("facilitator_name").notNull(),
  facilitatorPosition: text("facilitator_position"),
  externalProvider: text("external_provider"), // Proveedor externo si aplica (ARL, EPS, etc.)
  
  // Población y cobertura
  targetPopulation: text("target_population"),
  estimatedParticipants: integer("estimated_participants"),
  actualParticipants: integer("actual_participants"),
  coveragePercentage: numeric("coverage_percentage", { precision: 5, scale: 2 }),
  
  // Estado y cumplimiento
  status: text("status").notNull().default("programada"), // programada, ejecutada, cancelada, reprogramada
  observations: text("observations"),
  lessonsLearned: text("lessons_learned"),
  
  // Metadatos
  createdBy: varchar("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEvsActivitySchema = createInsertSchema(evsActivities)
  .omit({ id: true, createdAt: true, updatedAt: true });
export type InsertEvsActivity = z.infer<typeof insertEvsActivitySchema>;
export type EvsActivity = typeof evsActivities.$inferSelect;

// Controles y tamizajes realizados
export const evsControls = pgTable("evs_controls", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  workerId: varchar("worker_id").notNull().references(() => workers.id, { onDelete: "cascade" }),
  programId: varchar("program_id").references(() => evsPrograms.id, { onDelete: "set null" }),
  
  // Tipo de control
  category: evsControlCategoryEnum("category").notNull(),
  controlType: text("control_type").notNull(), // aleatorio, periodico, post_incidente, ingreso
  
  // Información del control
  controlDate: date("control_date").notNull(),
  controlTime: text("control_time"),
  location: text("location"),
  
  // Resultado
  result: evsControlResultEnum("result").notNull(),
  resultDetails: text("result_details"), // Detalles adicionales del resultado
  substanceDetected: text("substance_detected"), // Sustancia específica si aplica
  
  // Consentimiento
  informedConsent: integer("informed_consent").notNull().default(1), // 1=Firmó consentimiento
  consentDate: date("consent_date"),
  
  // Responsable del control
  performedBy: text("performed_by").notNull(), // Quien realizó el control
  performerPosition: text("performer_position"),
  witnessName: text("witness_name"), // Testigo si aplica
  
  // Acciones derivadas
  requiresFollowup: integer("requires_followup").notNull().default(0), // 1=Requiere seguimiento
  referralRequired: integer("referral_required").notNull().default(0), // 1=Requiere remisión
  referralEntity: text("referral_entity"), // EPS, ARL, especialista, etc.
  
  // Estado
  observations: text("observations"),
  isConfidential: integer("is_confidential").notNull().default(1), // 1=Información confidencial
  
  // Metadatos
  createdBy: varchar("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEvsControlSchema = createInsertSchema(evsControls)
  .omit({ id: true, createdAt: true, updatedAt: true });
export type InsertEvsControl = z.infer<typeof insertEvsControlSchema>;
export type EvsControl = typeof evsControls.$inferSelect;

// Incidentes relacionados con consumo de sustancias
export const evsIncidents = pgTable("evs_incidents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  workerId: varchar("worker_id").references(() => workers.id, { onDelete: "set null" }),
  controlId: varchar("control_id").references(() => evsControls.id, { onDelete: "set null" }),
  
  // Tipo de incidente
  category: evsControlCategoryEnum("category").notNull(),
  incidentType: text("incident_type").notNull(), // consumo_trabajo, olor_aliento, comportamiento_alterado, accidente_consumo
  
  // Información del incidente
  incidentDate: date("incident_date").notNull(),
  incidentTime: text("incident_time"),
  incidentLocation: text("incident_location"),
  description: text("description").notNull(),
  
  // Personas involucradas
  reportedBy: text("reported_by").notNull(),
  reporterPosition: text("reporter_position"),
  witnesses: text("witnesses").array(),
  
  // Medidas aplicadas
  immediateMeasures: text("immediate_measures"), // Acciones inmediatas tomadas
  wasRemoved: integer("was_removed").notNull().default(0), // 1=Fue retirado del puesto
  medicalAssessment: integer("medical_assessment").notNull().default(0), // 1=Valoración médica
  disciplinaryAction: text("disciplinary_action"), // Acción disciplinaria si aplica
  
  // Seguimiento
  requiresFollowup: integer("requires_followup").notNull().default(1),
  commitmentSigned: integer("commitment_signed").notNull().default(0), // 1=Firmó compromiso
  commitmentDate: date("commitment_date"),
  
  // Estado
  status: text("status").notNull().default("abierto"), // abierto, en_proceso, cerrado
  closureDate: date("closure_date"),
  closureReason: text("closure_reason"),
  
  // Metadatos
  createdBy: varchar("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEvsIncidentSchema = createInsertSchema(evsIncidents)
  .omit({ id: true, createdAt: true, updatedAt: true });
export type InsertEvsIncident = z.infer<typeof insertEvsIncidentSchema>;
export type EvsIncident = typeof evsIncidents.$inferSelect;

// Seguimiento de casos EVS
export const evsFollowups = pgTable("evs_followups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  workerId: varchar("worker_id").notNull().references(() => workers.id, { onDelete: "cascade" }),
  controlId: varchar("control_id").references(() => evsControls.id, { onDelete: "set null" }),
  incidentId: varchar("incident_id").references(() => evsIncidents.id, { onDelete: "set null" }),
  
  // Información del caso
  caseNumber: text("case_number"), // Número de caso para seguimiento
  category: evsControlCategoryEnum("category").notNull(),
  openDate: date("open_date").notNull(),
  
  // Diagnóstico inicial
  initialAssessment: text("initial_assessment").notNull(),
  riskLevel: text("risk_level").notNull(), // bajo, medio, alto, critico
  
  // Plan de intervención
  interventionPlan: text("intervention_plan"),
  treatmentType: text("treatment_type"), // interno, externo, mixto
  referralEntity: text("referral_entity"),
  referralDate: date("referral_date"),
  
  // Compromisos
  workerCommitments: text("worker_commitments"),
  companyCommitments: text("company_commitments"),
  nextReviewDate: date("next_review_date"),
  
  // Seguimiento periódico (JSONB para múltiples notas)
  followupNotes: text("followup_notes"), // JSON array de notas de seguimiento
  lastFollowupDate: date("last_followup_date"),
  totalFollowups: integer("total_followups").notNull().default(0),
  
  // Estado del caso
  status: evsFollowupStatusEnum("status").notNull().default("activo"),
  closeDate: date("close_date"),
  closeReason: text("close_reason"),
  outcome: text("outcome"), // resultado_exitoso, reincidencia, abandono, otro
  
  // Confidencialidad
  isConfidential: integer("is_confidential").notNull().default(1),
  accessLog: text("access_log"), // JSON de quién ha accedido al caso
  
  // Metadatos
  responsibleProfessional: text("responsible_professional"), // Profesional a cargo
  createdBy: varchar("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEvsFollowupSchema = createInsertSchema(evsFollowups)
  .omit({ id: true, createdAt: true, updatedAt: true });
export type InsertEvsFollowup = z.infer<typeof insertEvsFollowupSchema>;
export type EvsFollowup = typeof evsFollowups.$inferSelect;

// Participantes en actividades EVS
export const evsParticipants = pgTable("evs_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  activityId: varchar("activity_id").notNull().references(() => evsActivities.id, { onDelete: "cascade" }),
  workerId: varchar("worker_id").references(() => workers.id, { onDelete: "set null" }),
  
  // Información del participante
  workerName: text("worker_name").notNull(),
  workerDocument: text("worker_document"),
  workerArea: text("worker_area"),
  
  // Participación
  attended: integer("attended").notNull().default(0), // 1=Asistió
  attendanceDate: date("attendance_date"),
  attendanceTime: text("attendance_time"),
  
  // Evaluación (si aplica)
  preEvaluation: numeric("pre_evaluation", { precision: 5, scale: 2 }), // Evaluación pre-actividad
  postEvaluation: numeric("post_evaluation", { precision: 5, scale: 2 }), // Evaluación post-actividad
  
  // Observaciones
  observations: text("observations"),
  
  // Metadatos
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEvsParticipantSchema = createInsertSchema(evsParticipants)
  .omit({ id: true, createdAt: true });
export type InsertEvsParticipant = z.infer<typeof insertEvsParticipantSchema>;
export type EvsParticipant = typeof evsParticipants.$inferSelect;

// =====================================================
// INVESTIGACIÓN DE ACCIDENTES (Estándar 3.2.1)
// Resolución 0312/2019, Resolución 1401/2007
// Decreto 1072/2015 Art. 2.2.4.6.32
// =====================================================

// Estado de la investigación
export const investigationStatusEnum = pgEnum("investigation_status", [
  "pendiente",        // Investigación sin iniciar
  "en_proceso",       // Investigación en curso
  "completada",       // Investigación finalizada
  "remitida",         // Enviada al Ministerio (casos graves/mortales)
  "cerrada"           // Caso cerrado con seguimiento completo
]);

// Rol del participante en la investigación
export const investigationParticipantRoleEnum = pgEnum("investigation_participant_role", [
  "investigador_lider",    // Líder del equipo investigador
  "copasst",               // Miembro COPASST/Vigía
  "profesional_sst",       // Profesional con licencia SST (obligatorio casos graves/mortales)
  "testigo",               // Testigo del evento
  "jefe_inmediato",        // Jefe inmediato del accidentado
  "trabajador_afectado",   // Trabajador que sufrió el accidente
  "brigadista",            // Miembro de brigada de emergencia
  "otro"                   // Otro participante
]);

// Tipo de causa identificada
export const causaTypeEnum = pgEnum("causa_type", [
  "inmediata_acto",        // Acto inseguro
  "inmediata_condicion",   // Condición insegura
  "basica_personal",       // Factor personal
  "basica_trabajo",        // Factor del trabajo
  "raiz"                   // Causa raíz
]);

// Tabla principal de investigaciones de accidentes
export const accidentInvestigations = pgTable("accident_investigations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  accidentId: varchar("accident_id").notNull().references(() => accidents.id, { onDelete: "cascade" }),
  
  // Información del evento
  eventType: text("event_type").notNull(), // "accidente_trabajo", "incidente", "enfermedad_laboral"
  eventDate: date("event_date").notNull(), // Fecha del evento
  investigationStartDate: date("investigation_start_date").notNull(), // Fecha inicio investigación
  investigationEndDate: date("investigation_end_date"), // Fecha cierre investigación
  
  // Control SLA 15 días (Resolución 1401/2007)
  dueDate: date("due_date").notNull(), // Fecha límite (15 días desde evento)
  slaStatus: text("sla_status").notNull().default("en_tiempo"), // "en_tiempo", "proximo_vencer", "vencido"
  daysRemaining: integer("days_remaining"), // Días restantes para el SLA
  
  // Clasificación del accidente
  isSevere: integer("is_severe").notNull().default(0), // 1=Grave (requiere profesional SST)
  isFatal: integer("is_fatal").notNull().default(0), // 1=Mortal (requiere profesional SST + reporte Ministerio)
  requiresLicensedProfessional: integer("requires_licensed_professional").notNull().default(0),
  requiresMinistryReport: integer("requires_ministry_report").notNull().default(0),
  
  // Profesional SST con licencia (obligatorio casos graves/mortales)
  licensedProfessionalName: text("licensed_professional_name"),
  licensedProfessionalDocument: text("licensed_professional_document"),
  licensedProfessionalLicense: text("licensed_professional_license"), // Número de licencia
  licensedProfessionalLicenseExpiry: date("licensed_professional_license_expiry"),
  
  // Participación COPASST/Vigía
  copasstParticipation: integer("copasst_participation").notNull().default(0), // 1=Participó
  copasstMemberName: text("copasst_member_name"),
  copasstMemberRole: text("copasst_member_role"),
  copasstActNumber: text("copasst_act_number"), // Número de acta de reunión
  
  // Descripción del evento
  eventDescription: text("event_description").notNull(),
  injuredWorkerStatement: text("injured_worker_statement"), // Declaración del trabajador
  witnessStatements: text("witness_statements"), // Declaraciones de testigos (JSON)
  
  // Análisis de causas (metodología árbol de causas o 5 por qués)
  analysisMethodology: text("analysis_methodology").notNull().default("arbol_causas"), // "arbol_causas", "5_porques", "espina_pescado"
  immediateActCauses: text("immediate_act_causes").array(), // Actos inseguros
  immediateConditionCauses: text("immediate_condition_causes").array(), // Condiciones inseguras
  basicPersonalCauses: text("basic_personal_causes").array(), // Factores personales
  basicWorkCauses: text("basic_work_causes").array(), // Factores del trabajo
  rootCause: text("root_cause"), // Causa raíz identificada
  
  // Conclusiones
  conclusions: text("conclusions").notNull().default(""),
  lessonLearned: text("lesson_learned"),
  
  // Acciones correctivas y preventivas
  correctiveActions: text("corrective_actions"), // JSON array de acciones
  preventiveActions: text("preventive_actions"), // JSON array de acciones
  
  // Seguimiento a acciones
  actionsImplemented: integer("actions_implemented").notNull().default(0),
  actionsTotal: integer("actions_total").notNull().default(0),
  actionsClosedDate: date("actions_closed_date"),
  
  // Notificaciones y reportes
  furatNumber: text("furat_number"), // Número FURAT radicado
  furatDate: date("furat_date"), // Fecha de radicación FURAT
  ministryReportNumber: text("ministry_report_number"), // Reporte al Ministerio
  ministryReportDate: date("ministry_report_date"),
  arlNotificationDate: date("arl_notification_date"),
  epsNotificationDate: date("eps_notification_date"),
  
  // Evidencias documentales
  evidencePhotos: text("evidence_photos").array(), // URLs de fotos
  evidenceDocuments: text("evidence_documents").array(), // URLs de documentos
  
  // Estado y metadatos
  status: investigationStatusEnum("status").notNull().default("pendiente"),
  completionPercentage: integer("completion_percentage").notNull().default(0), // 0-100
  createdBy: varchar("created_by").references(() => users.id, { onDelete: "set null" }),
  approvedBy: varchar("approved_by").references(() => users.id, { onDelete: "set null" }),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAccidentInvestigationSchema = createInsertSchema(accidentInvestigations)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    companyId: z.string().optional(), // Backend determines from user session
  });
export type InsertAccidentInvestigation = z.infer<typeof insertAccidentInvestigationSchema>;
export type AccidentInvestigation = typeof accidentInvestigations.$inferSelect;

// Participantes en la investigación
export const investigationParticipants = pgTable("investigation_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  investigationId: varchar("investigation_id").notNull().references(() => accidentInvestigations.id, { onDelete: "cascade" }),
  
  // Información del participante
  participantName: text("participant_name").notNull(),
  participantDocument: text("participant_document"),
  participantRole: investigationParticipantRoleEnum("participant_role").notNull(),
  participantPosition: text("participant_position"),
  participantArea: text("participant_area"),
  
  // Licencia SST (si aplica)
  hasLicense: integer("has_license").notNull().default(0),
  licenseNumber: text("license_number"),
  licenseExpiry: date("license_expiry"),
  licenseVerified: integer("license_verified").notNull().default(0),
  
  // Participación
  participationDate: date("participation_date"),
  signature: text("signature"), // Base64 o URL de firma
  observations: text("observations"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInvestigationParticipantSchema = createInsertSchema(investigationParticipants)
  .omit({ id: true, createdAt: true });
export type InsertInvestigationParticipant = z.infer<typeof insertInvestigationParticipantSchema>;
export type InvestigationParticipant = typeof investigationParticipants.$inferSelect;

// Hallazgos de la investigación (causas identificadas)
export const investigationFindings = pgTable("investigation_findings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  investigationId: varchar("investigation_id").notNull().references(() => accidentInvestigations.id, { onDelete: "cascade" }),
  
  // Tipo de causa
  findingType: causaTypeEnum("finding_type").notNull(),
  description: text("description").notNull(),
  
  // Vinculación con peligro IPERC (si aplica)
  linkedIpercId: varchar("linked_iperc_id").references(() => peligrosIperc.id, { onDelete: "set null" }),
  
  // Acción correctiva asociada
  correctiveAction: text("corrective_action").notNull(),
  responsibleName: text("responsible_name").notNull(),
  responsibleArea: text("responsible_area"),
  dueDate: date("due_date").notNull(),
  
  // Seguimiento
  status: text("status").notNull().default("pendiente"), // pendiente, en_proceso, completada, verificada
  completionDate: date("completion_date"),
  verificationDate: date("verification_date"),
  verifiedBy: varchar("verified_by").references(() => users.id, { onDelete: "set null" }),
  effectiveness: text("effectiveness"), // efectiva, parcial, no_efectiva
  
  // Evidencia de cierre
  closureEvidence: text("closure_evidence"),
  observations: text("observations"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertInvestigationFindingSchema = createInsertSchema(investigationFindings)
  .omit({ id: true, createdAt: true, updatedAt: true });
export type InsertInvestigationFinding = z.infer<typeof insertInvestigationFindingSchema>;
export type InvestigationFinding = typeof investigationFindings.$inferSelect;

// =====================================================
// CONTROL DE AUSENTISMO LABORAL (Estándar 3.2.3)
// Resolución 0312/2019
// =====================================================

// Tipo de ausencia
export const absenceTypeEnum = pgEnum("absence_type", [
  "incapacidad_at",        // Incapacidad por Accidente de Trabajo (ARL)
  "incapacidad_el",        // Incapacidad por Enfermedad Laboral (ARL)
  "incapacidad_comun",     // Incapacidad por Enfermedad Común (EPS)
  "licencia_maternidad",   // Licencia de maternidad
  "licencia_paternidad",   // Licencia de paternidad
  "licencia_luto",         // Licencia por luto
  "permiso_personal",      // Permiso personal
  "calamidad_domestica",   // Calamidad doméstica
  "suspension",            // Suspensión disciplinaria
  "otro"                   // Otro tipo de ausencia
]);

// Estado de la ausencia
export const absenceStatusEnum = pgEnum("absence_status", [
  "activa",          // Ausencia en curso
  "finalizada",      // Ausencia terminada, trabajador reintegrado
  "prorroga",        // En prórroga de incapacidad
  "reubicacion"      // Trabajador en proceso de reubicación
]);

// Tabla de registro de ausencias
export const workerAbsences = pgTable("worker_absences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  workerId: varchar("worker_id").notNull().references(() => workers.id, { onDelete: "cascade" }),
  
  // Vinculación con accidente (si aplica)
  accidentId: varchar("accident_id").references(() => accidents.id, { onDelete: "set null" }),
  investigationId: varchar("investigation_id").references(() => accidentInvestigations.id, { onDelete: "set null" }),
  
  // Información de la ausencia
  absenceType: absenceTypeEnum("absence_type").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  daysLost: integer("days_lost").notNull().default(0), // Días perdidos
  
  // Información médica
  diagnosis: text("diagnosis"),
  cie10Code: text("cie10_code"), // Código CIE-10 del diagnóstico
  prognosis: text("prognosis"), // Pronóstico de recuperación
  restrictions: text("restrictions"), // Restricciones médicas
  
  // Documentación
  incapacityNumber: text("incapacity_number"), // Número de incapacidad
  issuerEntity: text("issuer_entity"), // EPS/ARL que emite
  issueDate: date("issue_date"),
  
  // Seguimiento EPS/ARL
  epsFollowup: integer("eps_followup").notNull().default(0), // 1=Seguimiento activo EPS
  arlFollowup: integer("arl_followup").notNull().default(0), // 1=Seguimiento activo ARL
  lastFollowupDate: date("last_followup_date"),
  followupNotes: text("followup_notes"), // JSON de notas de seguimiento
  
  // Prórroga
  hasExtension: integer("has_extension").notNull().default(0),
  extensionDays: integer("extension_days").default(0),
  extensionCount: integer("extension_count").default(0), // Número de prórrogas
  
  // Reintegro laboral
  reintegrationDate: date("reintegration_date"),
  reintegrationRestrictions: text("reintegration_restrictions"),
  requiresRelocation: integer("requires_relocation").notNull().default(0),
  newPosition: text("new_position"),
  
  // Estado
  status: absenceStatusEnum("status").notNull().default("activa"),
  observations: text("observations"),
  
  // Metadatos
  createdBy: varchar("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertWorkerAbsenceSchema = createInsertSchema(workerAbsences)
  .omit({ id: true, createdAt: true, updatedAt: true });
export type InsertWorkerAbsence = z.infer<typeof insertWorkerAbsenceSchema>;
export type WorkerAbsence = typeof workerAbsences.$inferSelect;

// Estadísticas de ausentismo por período
export const absenceStatistics = pgTable("absence_statistics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  
  // Período
  year: integer("year").notNull(),
  month: integer("month"), // null = acumulado anual
  
  // Datos base
  totalWorkers: integer("total_workers").notNull(),
  scheduledDays: integer("scheduled_days").notNull(), // Días programados de trabajo
  
  // Días perdidos por tipo
  daysLostAT: integer("days_lost_at").notNull().default(0), // Por accidente de trabajo
  daysLostEL: integer("days_lost_el").notNull().default(0), // Por enfermedad laboral
  daysLostCommon: integer("days_lost_common").notNull().default(0), // Por enfermedad común
  daysLostOther: integer("days_lost_other").notNull().default(0), // Otros
  totalDaysLost: integer("total_days_lost").notNull().default(0),
  
  // Casos por tipo
  casesAT: integer("cases_at").notNull().default(0),
  casesEL: integer("cases_el").notNull().default(0),
  casesCommon: integer("cases_common").notNull().default(0),
  casesOther: integer("cases_other").notNull().default(0),
  totalCases: integer("total_cases").notNull().default(0),
  
  // Indicadores calculados
  absenteeismRate: numeric("absenteeism_rate", { precision: 10, scale: 4 }), // (Días perdidos / Días programados) x 100
  frequencyRate: numeric("frequency_rate", { precision: 10, scale: 4 }), // (Casos / Trabajadores) x 100
  averageDuration: numeric("average_duration", { precision: 10, scale: 2 }), // Días promedio por caso
  
  // Análisis
  topCauses: text("top_causes").array(), // Principales causas de ausentismo
  trendAnalysis: text("trend_analysis"),
  recommendations: text("recommendations"),
  
  // Estado
  status: text("status").notNull().default("borrador"), // borrador, completado, aprobado
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAbsenceStatisticsSchema = createInsertSchema(absenceStatistics)
  .omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAbsenceStatistics = z.infer<typeof insertAbsenceStatisticsSchema>;
export type AbsenceStatistics = typeof absenceStatistics.$inferSelect;

// ============================================================================
// PROGRAMA DE CONSERVACIÓN AUDITIVA (PCA) - RESOLUCIÓN 8321/1983
// ============================================================================

// Estado del resultado audiométrico
export const audiometryResultEnum = pgEnum("audiometry_result", [
  "normal",                    // Audición normal
  "trauma_leve",              // Trauma acústico leve (pérdida 15-25 dB)
  "trauma_moderado",          // Trauma acústico moderado (pérdida 26-40 dB)
  "trauma_severo",            // Trauma acústico severo (pérdida >40 dB)
  "pendiente"                 // Resultado pendiente de interpretación
]);

// Tipo de audiometría según momento laboral
export const audiometryTypeEnum = pgEnum("audiometry_type", [
  "ingreso",                  // Audiometría de ingreso/pre-ocupacional
  "inicial_90_dias",          // Primera audiometría post-ingreso (90 días)
  "periodica",                // Audiometría periódica (cada 1-2 años)
  "seguimiento",              // Audiometría de seguimiento por alteración detectada
  "retiro"                    // Audiometría de egreso/retiro
]);

// Estado de la audiometría
export const audiometryStatusEnum = pgEnum("audiometry_status", [
  "programada",               // Programada
  "realizada",                // Realizada
  "vencida",                  // Vencida (no realizada en fecha)
  "cancelada"                 // Cancelada
]);

// Registros de Audiometría Ocupacional (Res. 8321/1983 Art. 53)
export const audiometryRecords = pgTable("audiometry_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  workerId: varchar("worker_id").notNull().references(() => workers.id, { onDelete: "cascade" }),
  medicalExamId: varchar("medical_exam_id").references(() => medicalExams.id, { onDelete: "set null" }),
  
  // Tipo y fecha
  audiometryType: audiometryTypeEnum("audiometry_type").notNull(),
  scheduledDate: date("scheduled_date").notNull(),
  examDate: date("exam_date"),
  status: audiometryStatusEnum("audiometry_status").notNull().default("programada"),
  
  // Resultados oído derecho (dB) - Frecuencias Res. 8321/1983 Art. 53
  rightEar500Hz: integer("right_ear_500hz"),      // 500 Hz
  rightEar1000Hz: integer("right_ear_1000hz"),    // 1000 Hz
  rightEar2000Hz: integer("right_ear_2000hz"),    // 2000 Hz
  rightEar3000Hz: integer("right_ear_3000hz"),    // 3000 Hz
  rightEar4000Hz: integer("right_ear_4000hz"),    // 4000 Hz
  rightEar6000Hz: integer("right_ear_6000hz"),    // 6000 Hz
  rightEarAverage: integer("right_ear_average"),  // Promedio calculado
  
  // Resultados oído izquierdo (dB)
  leftEar500Hz: integer("left_ear_500hz"),
  leftEar1000Hz: integer("left_ear_1000hz"),
  leftEar2000Hz: integer("left_ear_2000hz"),
  leftEar3000Hz: integer("left_ear_3000hz"),
  leftEar4000Hz: integer("left_ear_4000hz"),
  leftEar6000Hz: integer("left_ear_6000hz"),
  leftEarAverage: integer("left_ear_average"),
  
  // Interpretación
  overallResult: audiometryResultEnum("overall_result").default("pendiente"),
  isBaseline: integer("is_baseline").notNull().default(0), // 1=Audiometría base de referencia
  
  // Comparación con baseline (si existe)
  thresholdShiftDetected: integer("threshold_shift_detected").default(0), // 1=Cambio significativo detectado
  thresholdShiftDetails: text("threshold_shift_details"),
  
  // Profesional que realiza
  performedBy: text("performed_by"),
  professionalLicense: text("professional_license"), // Licencia SST
  clinicName: text("clinic_name"),
  
  // Documentación
  reportUrl: text("report_url"),
  reportName: text("report_name"),
  observations: text("observations"),
  recommendations: text("recommendations"),
  
  // Seguimiento
  nextAudiometryDate: date("next_audiometry_date"),
  requiresFollowup: integer("requires_followup").notNull().default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAudiometryRecordSchema = createInsertSchema(audiometryRecords)
  .omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAudiometryRecord = z.infer<typeof insertAudiometryRecordSchema>;
export type AudiometryRecord = typeof audiometryRecords.$inferSelect;

// Perfiles de Exposición a Ruido (vincula cargos/áreas con niveles de ruido)
export const noiseExposureProfiles = pgTable("noise_exposure_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  
  // Identificación del perfil
  name: text("name").notNull(), // Nombre del perfil (ej: "Operador de Maquinaria Pesada")
  area: text("area").notNull(), // Área de trabajo
  jobPosition: text("job_position"), // Cargo asociado
  jobProfileId: varchar("job_profile_id").references(() => jobProfiles.id, { onDelete: "set null" }),
  
  // Medición de ruido asociada
  environmentalMeasurementId: varchar("environmental_measurement_id").references(() => environmentalMeasurements.id, { onDelete: "set null" }),
  
  // Nivel de exposición
  noiseLevel: integer("noise_level").notNull(), // Nivel en dB(A)
  exposureHoursDay: numeric("exposure_hours_day", { precision: 4, scale: 2 }).notNull(), // Horas de exposición/día
  dosePercentage: integer("dose_percentage"), // Dosis porcentual calculada
  
  // Clasificación según Res. 8321/1983
  exceedsLimit: integer("exceeds_limit").notNull().default(0), // 1=Supera 85 dB(A)
  requiredProtection: text("required_protection").array(), // EPP auditivo requerido
  
  // Trabajadores afectados
  exposedWorkersCount: integer("exposed_workers_count").default(0),
  
  // Frecuencia de audiometría recomendada
  audiometryFrequencyMonths: integer("audiometry_frequency_months").default(24), // Máximo 24 meses Res. 8321
  
  // Estado
  isActive: integer("is_active").notNull().default(1),
  lastReviewDate: date("last_review_date"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertNoiseExposureProfileSchema = createInsertSchema(noiseExposureProfiles)
  .omit({ id: true, createdAt: true, updatedAt: true });
export type InsertNoiseExposureProfile = z.infer<typeof insertNoiseExposureProfileSchema>;
export type NoiseExposureProfile = typeof noiseExposureProfiles.$inferSelect;

// Asignación de trabajadores a perfiles de exposición
export const workerExposureAssignments = pgTable("worker_exposure_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  workerId: varchar("worker_id").notNull().references(() => workers.id, { onDelete: "cascade" }),
  exposureProfileId: varchar("exposure_profile_id").notNull().references(() => noiseExposureProfiles.id, { onDelete: "cascade" }),
  
  // Fechas de asignación
  assignmentDate: date("assignment_date").notNull(),
  endDate: date("end_date"), // Null si está activo
  
  // Estado
  isActive: integer("is_active").notNull().default(1),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWorkerExposureAssignmentSchema = createInsertSchema(workerExposureAssignments)
  .omit({ id: true, createdAt: true });
export type InsertWorkerExposureAssignment = z.infer<typeof insertWorkerExposureAssignmentSchema>;
export type WorkerExposureAssignment = typeof workerExposureAssignments.$inferSelect;

// Tipo de control PCA (Res. 8321/1983 Art. 49-50)
export const pcaControlTypeEnum = pgEnum("pca_control_type", [
  "fuente",                   // Control en la fuente (reducción del ruido en origen)
  "medio",                    // Control en el medio de transmisión
  "epp",                      // Protección personal auditiva
  "administrativo"            // Control administrativo (rotación, pausas)
]);

// Estado de la acción de control
export const pcaActionStatusEnum = pgEnum("pca_action_status", [
  "planificada",
  "en_progreso",
  "implementada",
  "verificada",
  "cancelada"
]);

// Acciones de Control del Programa de Conservación Auditiva
export const pcaControlActions = pgTable("pca_control_actions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  exposureProfileId: varchar("exposure_profile_id").references(() => noiseExposureProfiles.id, { onDelete: "set null" }),
  
  // Descripción de la acción
  controlType: pcaControlTypeEnum("control_type").notNull(),
  description: text("description").notNull(),
  objective: text("objective"), // Objetivo esperado (ej: reducir a 80 dB)
  
  // Fechas
  plannedDate: date("planned_date").notNull(),
  implementationDate: date("implementation_date"),
  verificationDate: date("verification_date"),
  
  // Responsables
  responsible: text("responsible").notNull(),
  verifiedBy: text("verified_by"),
  
  // Efectividad
  preImplementationLevel: integer("pre_implementation_level"), // Nivel dB antes
  postImplementationLevel: integer("post_implementation_level"), // Nivel dB después
  effectivenessPercentage: integer("effectiveness_percentage"), // % de reducción
  isEffective: integer("is_effective"), // 1=Efectivo, 0=No efectivo
  
  // Estado
  status: pcaActionStatusEnum("status").notNull().default("planificada"),
  
  // Documentación
  evidenceUrl: text("evidence_url"),
  evidenceName: text("evidence_name"),
  observations: text("observations"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPcaControlActionSchema = createInsertSchema(pcaControlActions)
  .omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPcaControlAction = z.infer<typeof insertPcaControlActionSchema>;
export type PcaControlAction = typeof pcaControlActions.$inferSelect;

// Registro del Programa de Conservación Auditiva (consolidado anual)
export const pcaPrograms = pgTable("pca_programs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  
  // Período
  year: integer("year").notNull(),
  
  // Resumen del programa
  totalExposedWorkers: integer("total_exposed_workers").default(0),
  totalAudiometriesScheduled: integer("total_audiometries_scheduled").default(0),
  totalAudiometriesCompleted: integer("total_audiometries_completed").default(0),
  totalControlActions: integer("total_control_actions").default(0),
  totalControlsImplemented: integer("total_controls_implemented").default(0),
  
  // Indicadores
  audiometryComplianceRate: integer("audiometry_compliance_rate"), // % cumplimiento audiometrías
  hearingLossIncidenceRate: numeric("hearing_loss_incidence_rate", { precision: 10, scale: 4 }), // Tasa de incidencia de pérdida auditiva
  controlEffectivenessRate: integer("control_effectiveness_rate"), // % efectividad controles
  
  // Análisis
  analysisNotes: text("analysis_notes"),
  recommendations: text("recommendations"),
  
  // Estado
  status: text("status").notNull().default("borrador"), // borrador, completado, aprobado
  approvedBy: text("approved_by"),
  approvalDate: date("approval_date"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPcaProgramSchema = createInsertSchema(pcaPrograms)
  .omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPcaProgram = z.infer<typeof insertPcaProgramSchema>;
export type PcaProgram = typeof pcaPrograms.$inferSelect;

// ==================== DOCUMENT ACKNOWLEDGMENTS (Acuse de Recibo) - SST-2026-0019 ====================

// Document assignments to workers (to track which documents workers need to acknowledge)
export const documentWorkerAssignments = pgTable("document_worker_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  documentId: varchar("document_id").notNull().references(() => sstDocuments.id, { onDelete: "cascade" }),
  workerId: varchar("worker_id").notNull().references(() => workers.id, { onDelete: "cascade" }),
  
  // Assignment details
  assignedBy: varchar("assigned_by").references(() => users.id),
  assignedAt: timestamp("assigned_at").notNull().default(sql`now()`),
  dueDate: timestamp("due_date"), // Optional deadline for acknowledgment
  
  // Priority
  isRequired: boolean("is_required").notNull().default(true), // Mandatory document?
  priority: text("priority").default("normal"), // "urgente", "normal", "informativo"
  
  // Message/instructions
  message: text("message"), // Optional message to worker when assigning
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertDocumentWorkerAssignmentSchema = createInsertSchema(documentWorkerAssignments)
  .omit({ id: true, createdAt: true, assignedAt: true });
export type InsertDocumentWorkerAssignment = z.infer<typeof insertDocumentWorkerAssignmentSchema>;
export type DocumentWorkerAssignment = typeof documentWorkerAssignments.$inferSelect;

// Document acknowledgments (Acuse de Recibo)
export const documentAcknowledgments = pgTable("document_acknowledgments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  documentId: varchar("document_id").notNull().references(() => sstDocuments.id, { onDelete: "cascade" }),
  workerId: varchar("worker_id").notNull().references(() => workers.id, { onDelete: "cascade" }),
  assignmentId: varchar("assignment_id").references(() => documentWorkerAssignments.id, { onDelete: "set null" }),
  
  // Acknowledgment details
  acknowledgedAt: timestamp("acknowledged_at").notNull().default(sql`now()`),
  
  // Technical metadata for audit trail
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  
  // Optional worker comment
  comments: text("comments"),
  
  // Digital signature confirmation
  signatureConfirmation: text("signature_confirmation"), // "Yo, [nombre], confirmo haber leído..."
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertDocumentAcknowledgmentSchema = createInsertSchema(documentAcknowledgments)
  .omit({ id: true, createdAt: true, acknowledgedAt: true });
export type InsertDocumentAcknowledgment = z.infer<typeof insertDocumentAcknowledgmentSchema>;
export type DocumentAcknowledgment = typeof documentAcknowledgments.$inferSelect;

// ==================== EPP - ELEMENTOS DE PROTECCIÓN PERSONAL ====================

// Categorías de EPP según normativa colombiana (valores deben coincidir con BD)
export const eppCategoryEnum = pgEnum("epp_category", [
  "proteccion_cabeza",       // Cascos, gorras, cofias
  "proteccion_visual",       // Gafas, caretas, visores
  "proteccion_auditiva",     // Tapones, orejeras
  "proteccion_respiratoria", // Mascarillas, respiradores
  "proteccion_manos",        // Guantes por tipo
  "proteccion_pies",         // Botas, zapatos de seguridad
  "proteccion_corporal",     // Overoles, delantales, chalecos
  "proteccion_caidas",       // Arneses, líneas de vida, conectores
  "proteccion_facial",       // Caretas faciales, protectores
  "otro"                     // Otros elementos de protección
]);

export const eppDeliveryStatusEnum = pgEnum("status", [
  "entregado",        // EPP entregado al trabajador
  "devuelto",         // EPP devuelto por el trabajador
  "vencido",          // EPP vencido/caducado
  "pendiente"         // Entrega pendiente
]);

// Catálogo maestro de EPP (asistente inteligente)
export const eppCatalog = pgTable("epp_catalog", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Clasificación
  category: text("category").notNull(), // cabeza, ojos_cara, auditiva, respiratoria, manos, pies, cuerpo, caidas, otros
  subcategory: text("subcategory"), // Subcategoría específica
  
  // Identificación
  name: text("name").notNull(), // Nombre del EPP
  description: text("description"), // Descripción detallada
  code: text("code"), // Código interno opcional
  
  // Normativa
  normaAplicable: text("norma_aplicable"), // Norma técnica (NTC, ANSI, EN, etc.)
  nivelProteccion: text("nivel_proteccion"), // Nivel de protección (si aplica)
  
  // Características
  material: text("material"), // Material del EPP
  vidaUtil: text("vida_util"), // Vida útil recomendada
  frecuenciaCambio: text("frecuencia_cambio"), // Frecuencia de cambio/reposición
  
  // Uso recomendado
  riesgosProtegidos: text("riesgos_protegidos").array(), // Peligros/riesgos que protege
  actividadesRecomendadas: text("actividades_recomendadas").array(), // Actividades donde se recomienda
  cargosRecomendados: text("cargos_recomendados").array(), // Cargos donde típicamente se usa
  
  // Disponibilidad de tallas
  tallasDisponibles: text("tallas_disponibles").array(), // S, M, L, XL, etc.
  
  // Imagen de referencia
  imagenUrl: text("imagen_url"),
  
  // Estado
  activo: boolean("activo").notNull().default(true),
  esPersonalizado: boolean("es_personalizado").notNull().default(false), // Si fue creado por una empresa
  companyId: varchar("company_id").references(() => companies.id, { onDelete: "cascade" }), // Solo si es personalizado
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertEppCatalogSchema = createInsertSchema(eppCatalog)
  .omit({ id: true, createdAt: true, updatedAt: true });
export type InsertEppCatalog = z.infer<typeof insertEppCatalogSchema>;
export type EppCatalog = typeof eppCatalog.$inferSelect;

// Registro de entregas de EPP a trabajadores
export const eppDeliveries = pgTable("epp_deliveries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  workerId: varchar("worker_id").notNull().references(() => workers.id, { onDelete: "cascade" }),
  
  // EPP entregado (referencia al catálogo o personalizado)
  eppCatalogId: varchar("epp_catalog_id").references(() => eppCatalog.id),
  eppName: text("epp_name").notNull(), // Nombre del EPP (por si no está en catálogo)
  eppCategory: eppCategoryEnum("epp_category").notNull(), // Categoría del EPP
  
  // Detalles de la entrega
  deliveryDate: date("delivery_date").notNull(),
  quantity: integer("quantity").notNull().default(1),
  size: text("size"), // Talla entregada
  serialNumber: text("serial_number"), // Número de serie del EPP
  lotNumber: text("lot_number"), // Número de lote si aplica
  
  // Condición y motivo
  deliveryReason: text("delivery_reason"), // Motivo de la entrega: dotacion_inicial, reposicion, cambio_talla
  
  // Fechas
  expirationDate: date("expiration_date"), // Fecha de vencimiento del EPP
  returnDate: date("return_date"), // Fecha de devolución si aplica
  
  // Firma del trabajador
  workerSignature: boolean("worker_signature").notNull().default(false), // Si el trabajador firmó
  workerSignatureDate: timestamp("worker_signature_date"), // Fecha/hora de la firma
  workerSignatureIp: text("worker_signature_ip"), // IP desde donde firmó
  
  // Responsable de la entrega
  deliveredBy: text("delivered_by"),
  
  // Observaciones
  observations: text("observations"),
  
  // Estado
  status: eppDeliveryStatusEnum("status").notNull().default("entregado"), // entregado, devuelto, vencido
  
  // Referencia a riesgo IPERC
  ipercRiskId: varchar("iperc_risk_id"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertEppDeliverySchema = createInsertSchema(eppDeliveries)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    deliveryDate: z.union([
      z.string().transform(str => new Date(str)),
      z.date()
    ]),
    expirationDate: z.union([
      z.string().transform(str => new Date(str)),
      z.date()
    ]).optional().nullable(),
    returnDate: z.union([
      z.string().transform(str => new Date(str)),
      z.date()
    ]).optional().nullable(),
    workerSignatureDate: z.union([
      z.string().transform(str => new Date(str)),
      z.date()
    ]).optional().nullable(),
  });
export type InsertEppDelivery = z.infer<typeof insertEppDeliverySchema>;
export type EppDelivery = typeof eppDeliveries.$inferSelect;

// ==========================================
// ISO 45001:2018 - PARTES INTERESADAS (Cláusula 4.2)
// ==========================================
export const tipoParteInteresadaEnum = pgEnum("tipo_parte_interesada", [
  "interna",
  "externa"
]);

export const categoriaParteInteresadaEnum = pgEnum("categoria_parte_interesada", [
  "trabajadores",
  "sindicatos",
  "contratistas",
  "proveedores",
  "clientes",
  "arl",
  "autoridades",
  "comunidad",
  "accionistas",
  "otros"
]);

export const partesInteresadas = pgTable("partes_interesadas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  
  // Identificación
  nombre: text("nombre").notNull(),
  tipo: tipoParteInteresadaEnum("tipo").notNull(),
  categoria: categoriaParteInteresadaEnum("categoria").notNull(),
  descripcion: text("descripcion"),
  
  // Contacto
  contactoPrincipal: text("contacto_principal"),
  cargo: text("cargo"),
  email: text("email"),
  telefono: text("telefono"),
  
  // Requisitos y expectativas (ISO 45001 4.2)
  necesidades: text("necesidades").array(), // Lo que necesitan de la organización
  expectativas: text("expectativas").array(), // Lo que esperan
  requisitosLegales: text("requisitos_legales").array(), // Requisitos legales aplicables
  
  // Comunicación
  frecuenciaComunicacion: text("frecuencia_comunicacion"), // mensual, trimestral, etc.
  medioComunicacion: text("medio_comunicacion"), // email, reunión, informe, etc.
  responsableComunicacion: varchar("responsable_comunicacion").references(() => users.id),
  
  // Influencia e interés
  nivelInfluencia: text("nivel_influencia").notNull().default("medio"), // alto, medio, bajo
  nivelInteres: text("nivel_interes").notNull().default("medio"), // alto, medio, bajo
  
  // Estado
  activo: integer("activo").notNull().default(1),
  
  // Auditoría
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertParteInteresadaSchema = createInsertSchema(partesInteresadas)
  .omit({ id: true, createdAt: true, updatedAt: true, companyId: true });
export type InsertParteInteresada = z.infer<typeof insertParteInteresadaSchema>;
export type ParteInteresada = typeof partesInteresadas.$inferSelect;

// ==========================================
// ISO 45001:2018 - ANÁLISIS DE CONTEXTO (Cláusula 4.1)
// ==========================================
export const tipoFactorContextoEnum = pgEnum("tipo_factor_contexto", [
  "politico",
  "economico",
  "social",
  "tecnologico",
  "ambiental",
  "legal"
]);

export const tipoAnalisisContextoEnum = pgEnum("tipo_analisis_contexto", [
  "externo",
  "interno"
]);

export const analisisContexto = pgTable("analisis_contexto", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  
  // Identificación del análisis
  titulo: text("titulo").notNull(),
  periodo: text("periodo").notNull(), // "2025", "2025-2026"
  tipoAnalisis: tipoAnalisisContextoEnum("tipo_analisis").notNull(),
  
  // Fechas
  fechaElaboracion: date("fecha_elaboracion").notNull(),
  fechaRevision: date("fecha_revision"),
  
  // Responsables
  elaboradoPor: varchar("elaborado_por").references(() => users.id),
  aprobadoPor: varchar("aprobado_por").references(() => users.id),
  
  // Observaciones
  observaciones: text("observaciones"),
  
  // Estado
  estado: text("estado").notNull().default("borrador"), // borrador, aprobado, vigente
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const factoresContexto = pgTable("factores_contexto", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  analisisContextoId: varchar("analisis_contexto_id").notNull().references(() => analisisContexto.id, { onDelete: "cascade" }),
  
  // Factor identificado
  tipoFactor: tipoFactorContextoEnum("tipo_factor").notNull(),
  descripcion: text("descripcion").notNull(),
  
  // Clasificación FODA
  esFortaleza: integer("es_fortaleza").notNull().default(0),
  esDebilidad: integer("es_debilidad").notNull().default(0),
  esOportunidad: integer("es_oportunidad").notNull().default(0),
  esAmenaza: integer("es_amenaza").notNull().default(0),
  
  // Impacto en SST
  impactoSst: text("impacto_sst"), // Cómo afecta al SG-SST
  nivelImpacto: text("nivel_impacto").notNull().default("medio"), // alto, medio, bajo
  
  // Acciones requeridas
  accionesRequeridas: text("acciones_requeridas").array(),
  responsableAccion: varchar("responsable_accion").references(() => users.id),
  fechaLimite: date("fecha_limite"),
  
  // Estado
  estado: text("estado").notNull().default("identificado"), // identificado, en_tratamiento, controlado
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertAnalisisContextoSchema = createInsertSchema(analisisContexto)
  .omit({ id: true, createdAt: true, updatedAt: true, companyId: true })
  .extend({
    fechaElaboracion: z.coerce.date(),
    fechaRevision: z.coerce.date().optional().nullable(),
  });
export type InsertAnalisisContexto = z.infer<typeof insertAnalisisContextoSchema>;
export type AnalisisContexto = typeof analisisContexto.$inferSelect;

export const insertFactorContextoSchema = createInsertSchema(factoresContexto)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    fechaLimite: z.coerce.date().optional().nullable(),
  });
export type InsertFactorContexto = z.infer<typeof insertFactorContextoSchema>;
export type FactorContexto = typeof factoresContexto.$inferSelect;

// ==========================================
// ACCIONES DE MEJORA DESDE CONTEXTO (Vinculación FODA → Plan Mejora)
// ==========================================
export const estadoAccionMejoraEnum = pgEnum("estado_accion_mejora", [
  "pendiente",
  "en_progreso",
  "completada",
  "cancelada"
]);

export const prioridadAccionEnum = pgEnum("prioridad_accion", [
  "alta",
  "media",
  "baja"
]);

export const accionesMejoraContexto = pgTable("acciones_mejora_contexto", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  
  // Vinculación con factor FODA (opcional - puede crearse independiente)
  factorContextoId: varchar("factor_contexto_id").references(() => factoresContexto.id, { onDelete: "set null" }),
  
  // Descripción de la acción
  accion: text("accion").notNull(),
  descripcion: text("descripcion"),
  
  // Origen del hallazgo
  origenHallazgo: text("origen_hallazgo").notNull().default("analisis_contexto"), // analisis_contexto, auditoria, inspeccion, etc.
  hallazgoDescripcion: text("hallazgo_descripcion"), // Descripción del problema identificado
  
  // Clasificación FODA del origen
  tipoFoda: text("tipo_foda"), // fortaleza, debilidad, oportunidad, amenaza
  
  // Responsables
  responsableId: varchar("responsable_id").references(() => users.id),
  
  // Fechas
  fechaIdentificacion: date("fecha_identificacion").notNull().default(sql`CURRENT_DATE`),
  fechaInicio: date("fecha_inicio"),
  fechaLimite: date("fecha_limite"),
  fechaCierre: date("fecha_cierre"),
  
  // Seguimiento
  porcentajeAvance: integer("porcentaje_avance").notNull().default(0),
  prioridad: prioridadAccionEnum("prioridad").notNull().default("media"),
  estado: estadoAccionMejoraEnum("estado").notNull().default("pendiente"),
  
  // Evidencia y observaciones
  evidenciaCierre: text("evidencia_cierre"),
  observaciones: text("observaciones"),
  
  // Auditoría
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertAccionMejoraContextoSchema = createInsertSchema(accionesMejoraContexto)
  .omit({ id: true, createdAt: true, updatedAt: true, companyId: true })
  .extend({
    fechaIdentificacion: z.coerce.date().optional(),
    fechaInicio: z.coerce.date().optional().nullable(),
    fechaLimite: z.coerce.date().optional().nullable(),
    fechaCierre: z.coerce.date().optional().nullable(),
  });
export type InsertAccionMejoraContexto = z.infer<typeof insertAccionMejoraContextoSchema>;
export type AccionMejoraContexto = typeof accionesMejoraContexto.$inferSelect;

// ==========================================
// ASIENTOS EXTRA POR ROL (Usuarios Adicionales de Pago)
// ==========================================
// Cuando una empresa necesita más de 1 usuario del mismo rol administrativo,
// puede comprar asientos adicionales a $10,000 COP/mes por asiento.
// Esta tabla registra cuántos asientos extra tiene cada empresa por rol.
export const companyExtraSeats = pgTable("company_extra_seats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  
  // Rol para el cual se compraron asientos adicionales
  role: userRoleEnum("role").notNull(),
  
  // Cantidad de asientos extra comprados (además del 1 incluido gratis)
  extraSeats: integer("extra_seats").notNull().default(1),
  
  // Precio por asiento en COP (para histórico)
  pricePerSeatCop: integer("price_per_seat_cop").notNull().default(10000),
  
  // Stripe subscription item ID para gestión de facturación
  stripeSubscriptionItemId: text("stripe_subscription_item_id"),
  
  // Estado del asiento
  status: text("status").notNull().default("active"), // active, canceled, pending
  
  // Auditoría
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertCompanyExtraSeatsSchema = createInsertSchema(companyExtraSeats)
  .omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCompanyExtraSeats = z.infer<typeof insertCompanyExtraSeatsSchema>;
export type CompanyExtraSeats = typeof companyExtraSeats.$inferSelect;
