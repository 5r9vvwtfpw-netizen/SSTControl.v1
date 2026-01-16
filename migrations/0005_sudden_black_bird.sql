CREATE TYPE "public"."absence_status" AS ENUM('activa', 'finalizada', 'prorroga', 'reubicacion');--> statement-breakpoint
CREATE TYPE "public"."absence_type" AS ENUM('incapacidad_at', 'incapacidad_el', 'incapacidad_comun', 'licencia_maternidad', 'licencia_paternidad', 'licencia_luto', 'permiso_personal', 'calamidad_domestica', 'suspension', 'otro');--> statement-breakpoint
CREATE TYPE "public"."audiometry_result" AS ENUM('normal', 'trauma_leve', 'trauma_moderado', 'trauma_severo', 'pendiente');--> statement-breakpoint
CREATE TYPE "public"."audiometry_status" AS ENUM('programada', 'realizada', 'vencida', 'cancelada');--> statement-breakpoint
CREATE TYPE "public"."audiometry_type" AS ENUM('ingreso', 'inicial_90_dias', 'periodica', 'seguimiento', 'retiro');--> statement-breakpoint
CREATE TYPE "public"."causa_type" AS ENUM('inmediata_acto', 'inmediata_condicion', 'basica_personal', 'basica_trabajo', 'raiz');--> statement-breakpoint
CREATE TYPE "public"."ciclo_phva" AS ENUM('planear', 'hacer', 'verificar', 'actuar');--> statement-breakpoint
CREATE TYPE "public"."civil_status" AS ENUM('soltero', 'casado', 'union_libre', 'divorciado', 'viudo', 'separado');--> statement-breakpoint
CREATE TYPE "public"."curso_audiencia" AS ENUM('todos', 'solo_copasst', 'seleccion_manual');--> statement-breakpoint
CREATE TYPE "public"."education_level" AS ENUM('ninguno', 'primaria', 'secundaria', 'tecnico', 'tecnologo', 'profesional', 'especializacion', 'maestria', 'doctorado');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('masculino', 'femenino', 'otro', 'prefiero_no_decir');--> statement-breakpoint
CREATE TYPE "public"."health_condition_status" AS ENUM('activo', 'en_seguimiento', 'controlado', 'cerrado');--> statement-breakpoint
CREATE TYPE "public"."health_condition_type" AS ENUM('cronica', 'temporal', 'discapacidad', 'restriccion');--> statement-breakpoint
CREATE TYPE "public"."investigation_participant_role" AS ENUM('investigador_lider', 'copasst', 'profesional_sst', 'testigo', 'jefe_inmediato', 'trabajador_afectado', 'brigadista', 'otro');--> statement-breakpoint
CREATE TYPE "public"."investigation_status" AS ENUM('pendiente', 'en_proceso', 'completada', 'remitida', 'cerrada');--> statement-breakpoint
CREATE TYPE "public"."pca_action_status" AS ENUM('planificada', 'en_progreso', 'implementada', 'verificada', 'cancelada');--> statement-breakpoint
CREATE TYPE "public"."pca_control_type" AS ENUM('fuente', 'medio', 'epp', 'administrativo');--> statement-breakpoint
ALTER TYPE "public"."estado_objetivo" ADD VALUE 'suspendido';--> statement-breakpoint
ALTER TYPE "public"."sst_standard_reference" ADD VALUE '5.1.3' BEFORE '6.1.1';--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'vigia_sst' BEFORE 'trabajador';--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'auditor_interno' BEFORE 'trabajador';--> statement-breakpoint
CREATE TABLE "absence_statistics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"year" integer NOT NULL,
	"month" integer,
	"total_workers" integer NOT NULL,
	"scheduled_days" integer NOT NULL,
	"days_lost_at" integer DEFAULT 0 NOT NULL,
	"days_lost_el" integer DEFAULT 0 NOT NULL,
	"days_lost_common" integer DEFAULT 0 NOT NULL,
	"days_lost_other" integer DEFAULT 0 NOT NULL,
	"total_days_lost" integer DEFAULT 0 NOT NULL,
	"cases_at" integer DEFAULT 0 NOT NULL,
	"cases_el" integer DEFAULT 0 NOT NULL,
	"cases_common" integer DEFAULT 0 NOT NULL,
	"cases_other" integer DEFAULT 0 NOT NULL,
	"total_cases" integer DEFAULT 0 NOT NULL,
	"absenteeism_rate" numeric(10, 4),
	"frequency_rate" numeric(10, 4),
	"average_duration" numeric(10, 2),
	"top_causes" text[],
	"trend_analysis" text,
	"recommendations" text,
	"status" text DEFAULT 'borrador' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "accident_investigations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"accident_id" varchar NOT NULL,
	"event_type" text NOT NULL,
	"event_date" date NOT NULL,
	"investigation_start_date" date NOT NULL,
	"investigation_end_date" date,
	"due_date" date NOT NULL,
	"sla_status" text DEFAULT 'en_tiempo' NOT NULL,
	"days_remaining" integer,
	"is_severe" integer DEFAULT 0 NOT NULL,
	"is_fatal" integer DEFAULT 0 NOT NULL,
	"requires_licensed_professional" integer DEFAULT 0 NOT NULL,
	"requires_ministry_report" integer DEFAULT 0 NOT NULL,
	"licensed_professional_name" text,
	"licensed_professional_document" text,
	"licensed_professional_license" text,
	"licensed_professional_license_expiry" date,
	"copasst_participation" integer DEFAULT 0 NOT NULL,
	"copasst_member_name" text,
	"copasst_member_role" text,
	"copasst_act_number" text,
	"event_description" text NOT NULL,
	"injured_worker_statement" text,
	"witness_statements" text,
	"analysis_methodology" text DEFAULT 'arbol_causas' NOT NULL,
	"immediate_act_causes" text[],
	"immediate_condition_causes" text[],
	"basic_personal_causes" text[],
	"basic_work_causes" text[],
	"root_cause" text,
	"conclusions" text DEFAULT '' NOT NULL,
	"lesson_learned" text,
	"corrective_actions" text,
	"preventive_actions" text,
	"actions_implemented" integer DEFAULT 0 NOT NULL,
	"actions_total" integer DEFAULT 0 NOT NULL,
	"actions_closed_date" date,
	"furat_number" text,
	"furat_date" date,
	"ministry_report_number" text,
	"ministry_report_date" date,
	"arl_notification_date" date,
	"eps_notification_date" date,
	"evidence_photos" text[],
	"evidence_documents" text[],
	"status" "investigation_status" DEFAULT 'pendiente' NOT NULL,
	"completion_percentage" integer DEFAULT 0 NOT NULL,
	"created_by" varchar,
	"approved_by" varchar,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "audiometry_records" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"worker_id" varchar NOT NULL,
	"medical_exam_id" varchar,
	"audiometry_type" "audiometry_type" NOT NULL,
	"scheduled_date" date NOT NULL,
	"exam_date" date,
	"audiometry_status" "audiometry_status" DEFAULT 'programada' NOT NULL,
	"right_ear_500hz" integer,
	"right_ear_1000hz" integer,
	"right_ear_2000hz" integer,
	"right_ear_3000hz" integer,
	"right_ear_4000hz" integer,
	"right_ear_6000hz" integer,
	"right_ear_average" integer,
	"left_ear_500hz" integer,
	"left_ear_1000hz" integer,
	"left_ear_2000hz" integer,
	"left_ear_3000hz" integer,
	"left_ear_4000hz" integer,
	"left_ear_6000hz" integer,
	"left_ear_average" integer,
	"overall_result" "audiometry_result" DEFAULT 'pendiente',
	"is_baseline" integer DEFAULT 0 NOT NULL,
	"threshold_shift_detected" integer DEFAULT 0,
	"threshold_shift_details" text,
	"performed_by" text,
	"professional_license" text,
	"clinic_name" text,
	"report_url" text,
	"report_name" text,
	"observations" text,
	"recommendations" text,
	"next_audiometry_date" date,
	"requires_followup" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "document_acknowledgments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"document_id" varchar NOT NULL,
	"worker_id" varchar NOT NULL,
	"assignment_id" varchar,
	"acknowledged_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"comments" text,
	"signature_confirmation" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_worker_assignments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"document_id" varchar NOT NULL,
	"worker_id" varchar NOT NULL,
	"assigned_by" varchar,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"due_date" timestamp,
	"is_required" boolean DEFAULT true NOT NULL,
	"priority" text DEFAULT 'normal',
	"message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "health_conditions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"worker_id" varchar NOT NULL,
	"condition_type" "health_condition_type" NOT NULL,
	"description" text NOT NULL,
	"diagnosis_date" date NOT NULL,
	"status" "health_condition_status" DEFAULT 'activo' NOT NULL,
	"requires_follow_up" integer DEFAULT 0 NOT NULL,
	"follow_up_date" date,
	"observations" text,
	"registered_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "investigation_findings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"investigation_id" varchar NOT NULL,
	"finding_type" "causa_type" NOT NULL,
	"description" text NOT NULL,
	"linked_iperc_id" varchar,
	"corrective_action" text NOT NULL,
	"responsible_name" text NOT NULL,
	"responsible_area" text,
	"due_date" date NOT NULL,
	"status" text DEFAULT 'pendiente' NOT NULL,
	"completion_date" date,
	"verification_date" date,
	"verified_by" varchar,
	"effectiveness" text,
	"closure_evidence" text,
	"observations" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "investigation_participants" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"investigation_id" varchar NOT NULL,
	"participant_name" text NOT NULL,
	"participant_document" text,
	"participant_role" "investigation_participant_role" NOT NULL,
	"participant_position" text,
	"participant_area" text,
	"has_license" integer DEFAULT 0 NOT NULL,
	"license_number" text,
	"license_expiry" date,
	"license_verified" integer DEFAULT 0 NOT NULL,
	"participation_date" date,
	"signature" text,
	"observations" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "licensed_professional_assignments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"company_id" varchar NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"assigned_by" varchar,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "noise_exposure_profiles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"name" text NOT NULL,
	"area" text NOT NULL,
	"job_position" text,
	"job_profile_id" varchar,
	"environmental_measurement_id" varchar,
	"noise_level" integer NOT NULL,
	"exposure_hours_day" numeric(4, 2) NOT NULL,
	"dose_percentage" integer,
	"exceeds_limit" integer DEFAULT 0 NOT NULL,
	"required_protection" text[],
	"exposed_workers_count" integer DEFAULT 0,
	"audiometry_frequency_months" integer DEFAULT 24,
	"is_active" integer DEFAULT 1 NOT NULL,
	"last_review_date" date,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pca_control_actions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"exposure_profile_id" varchar,
	"control_type" "pca_control_type" NOT NULL,
	"description" text NOT NULL,
	"objective" text,
	"planned_date" date NOT NULL,
	"implementation_date" date,
	"verification_date" date,
	"responsible" text NOT NULL,
	"verified_by" text,
	"pre_implementation_level" integer,
	"post_implementation_level" integer,
	"effectiveness_percentage" integer,
	"is_effective" integer,
	"status" "pca_action_status" DEFAULT 'planificada' NOT NULL,
	"evidence_url" text,
	"evidence_name" text,
	"observations" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pca_programs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"year" integer NOT NULL,
	"total_exposed_workers" integer DEFAULT 0,
	"total_audiometries_scheduled" integer DEFAULT 0,
	"total_audiometries_completed" integer DEFAULT 0,
	"total_control_actions" integer DEFAULT 0,
	"total_controls_implemented" integer DEFAULT 0,
	"audiometry_compliance_rate" integer,
	"hearing_loss_incidence_rate" numeric(10, 4),
	"control_effectiveness_rate" integer,
	"analysis_notes" text,
	"recommendations" text,
	"status" text DEFAULT 'borrador' NOT NULL,
	"approved_by" text,
	"approval_date" date,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "worker_absences" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"worker_id" varchar NOT NULL,
	"accident_id" varchar,
	"investigation_id" varchar,
	"absence_type" "absence_type" NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"days_lost" integer DEFAULT 0 NOT NULL,
	"diagnosis" text,
	"cie10_code" text,
	"prognosis" text,
	"restrictions" text,
	"incapacity_number" text,
	"issuer_entity" text,
	"issue_date" date,
	"eps_followup" integer DEFAULT 0 NOT NULL,
	"arl_followup" integer DEFAULT 0 NOT NULL,
	"last_followup_date" date,
	"followup_notes" text,
	"has_extension" integer DEFAULT 0 NOT NULL,
	"extension_days" integer DEFAULT 0,
	"extension_count" integer DEFAULT 0,
	"reintegration_date" date,
	"reintegration_restrictions" text,
	"requires_relocation" integer DEFAULT 0 NOT NULL,
	"new_position" text,
	"status" "absence_status" DEFAULT 'activa' NOT NULL,
	"observations" text,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "worker_exposure_assignments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"worker_id" varchar NOT NULL,
	"exposure_profile_id" varchar NOT NULL,
	"assignment_date" date NOT NULL,
	"end_date" date,
	"is_active" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "acciones_mejora" ADD COLUMN "carried_over_from_id" varchar;--> statement-breakpoint
ALTER TABLE "acciones_mejora" ADD COLUMN "status_carry_reason" text;--> statement-breakpoint
ALTER TABLE "componentes_sst" ADD COLUMN "ciclo_phva" "ciclo_phva";--> statement-breakpoint
ALTER TABLE "copasst_cursos" ADD COLUMN "tipo_audiencia" "curso_audiencia" DEFAULT 'solo_copasst' NOT NULL;--> statement-breakpoint
ALTER TABLE "copasst_cursos" ADD COLUMN "miembros_asignados" text[];--> statement-breakpoint
ALTER TABLE "copasst_elecciones" ADD COLUMN "publicado_en_portal" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "estandares_sst" ADD COLUMN "modo_verificacion" text;--> statement-breakpoint
ALTER TABLE "evaluaciones_sst" ADD COLUMN "puntajes_por_ciclo_phva" text;--> statement-breakpoint
ALTER TABLE "medical_exams" ADD COLUMN "notification_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "medical_exams" ADD COLUMN "notification_read_at" timestamp;--> statement-breakpoint
ALTER TABLE "medical_exams" ADD COLUMN "read_confirmed_at" timestamp;--> statement-breakpoint
ALTER TABLE "medical_exams" ADD COLUMN "read_confirmed_by" varchar;--> statement-breakpoint
ALTER TABLE "respuestas_estandares" ADD COLUMN "is_inherited" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "respuestas_estandares" ADD COLUMN "inherited_from_respuesta_id" varchar;--> statement-breakpoint
ALTER TABLE "respuestas_estandares" ADD COLUMN "requires_refresh" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "respuestas_estandares" ADD COLUMN "last_verified_at" timestamp;--> statement-breakpoint
ALTER TABLE "training_attendees" ADD COLUMN "confirmed" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "training_attendees" ADD COLUMN "confirmed_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "sst_signature_url" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "sst_phone" text;--> statement-breakpoint
ALTER TABLE "workers" ADD COLUMN "gender" "gender";--> statement-breakpoint
ALTER TABLE "workers" ADD COLUMN "birth_date" date;--> statement-breakpoint
ALTER TABLE "workers" ADD COLUMN "education_level" "education_level";--> statement-breakpoint
ALTER TABLE "workers" ADD COLUMN "civil_status" "civil_status";--> statement-breakpoint
ALTER TABLE "workers" ADD COLUMN "photo_url" text;--> statement-breakpoint
ALTER TABLE "absence_statistics" ADD CONSTRAINT "absence_statistics_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accident_investigations" ADD CONSTRAINT "accident_investigations_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accident_investigations" ADD CONSTRAINT "accident_investigations_accident_id_accidents_id_fk" FOREIGN KEY ("accident_id") REFERENCES "public"."accidents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accident_investigations" ADD CONSTRAINT "accident_investigations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accident_investigations" ADD CONSTRAINT "accident_investigations_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audiometry_records" ADD CONSTRAINT "audiometry_records_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audiometry_records" ADD CONSTRAINT "audiometry_records_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audiometry_records" ADD CONSTRAINT "audiometry_records_medical_exam_id_medical_exams_id_fk" FOREIGN KEY ("medical_exam_id") REFERENCES "public"."medical_exams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_acknowledgments" ADD CONSTRAINT "document_acknowledgments_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_acknowledgments" ADD CONSTRAINT "document_acknowledgments_document_id_sst_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."sst_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_acknowledgments" ADD CONSTRAINT "document_acknowledgments_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_acknowledgments" ADD CONSTRAINT "document_acknowledgments_assignment_id_document_worker_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."document_worker_assignments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_worker_assignments" ADD CONSTRAINT "document_worker_assignments_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_worker_assignments" ADD CONSTRAINT "document_worker_assignments_document_id_sst_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."sst_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_worker_assignments" ADD CONSTRAINT "document_worker_assignments_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_worker_assignments" ADD CONSTRAINT "document_worker_assignments_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "health_conditions" ADD CONSTRAINT "health_conditions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "health_conditions" ADD CONSTRAINT "health_conditions_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "health_conditions" ADD CONSTRAINT "health_conditions_registered_by_users_id_fk" FOREIGN KEY ("registered_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investigation_findings" ADD CONSTRAINT "investigation_findings_investigation_id_accident_investigations_id_fk" FOREIGN KEY ("investigation_id") REFERENCES "public"."accident_investigations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investigation_findings" ADD CONSTRAINT "investigation_findings_linked_iperc_id_peligros_iperc_id_fk" FOREIGN KEY ("linked_iperc_id") REFERENCES "public"."peligros_iperc"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investigation_findings" ADD CONSTRAINT "investigation_findings_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investigation_participants" ADD CONSTRAINT "investigation_participants_investigation_id_accident_investigations_id_fk" FOREIGN KEY ("investigation_id") REFERENCES "public"."accident_investigations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "licensed_professional_assignments" ADD CONSTRAINT "licensed_professional_assignments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "licensed_professional_assignments" ADD CONSTRAINT "licensed_professional_assignments_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "licensed_professional_assignments" ADD CONSTRAINT "licensed_professional_assignments_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "noise_exposure_profiles" ADD CONSTRAINT "noise_exposure_profiles_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "noise_exposure_profiles" ADD CONSTRAINT "noise_exposure_profiles_job_profile_id_job_profiles_id_fk" FOREIGN KEY ("job_profile_id") REFERENCES "public"."job_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "noise_exposure_profiles" ADD CONSTRAINT "noise_exposure_profiles_environmental_measurement_id_environmental_measurements_id_fk" FOREIGN KEY ("environmental_measurement_id") REFERENCES "public"."environmental_measurements"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pca_control_actions" ADD CONSTRAINT "pca_control_actions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pca_control_actions" ADD CONSTRAINT "pca_control_actions_exposure_profile_id_noise_exposure_profiles_id_fk" FOREIGN KEY ("exposure_profile_id") REFERENCES "public"."noise_exposure_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pca_programs" ADD CONSTRAINT "pca_programs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_absences" ADD CONSTRAINT "worker_absences_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_absences" ADD CONSTRAINT "worker_absences_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_absences" ADD CONSTRAINT "worker_absences_accident_id_accidents_id_fk" FOREIGN KEY ("accident_id") REFERENCES "public"."accidents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_absences" ADD CONSTRAINT "worker_absences_investigation_id_accident_investigations_id_fk" FOREIGN KEY ("investigation_id") REFERENCES "public"."accident_investigations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_absences" ADD CONSTRAINT "worker_absences_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_exposure_assignments" ADD CONSTRAINT "worker_exposure_assignments_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_exposure_assignments" ADD CONSTRAINT "worker_exposure_assignments_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_exposure_assignments" ADD CONSTRAINT "worker_exposure_assignments_exposure_profile_id_noise_exposure_profiles_id_fk" FOREIGN KEY ("exposure_profile_id") REFERENCES "public"."noise_exposure_profiles"("id") ON DELETE cascade ON UPDATE no action;