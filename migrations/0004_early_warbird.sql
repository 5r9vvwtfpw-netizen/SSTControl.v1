CREATE TYPE "public"."activity_frequency" AS ENUM('unica', 'diaria', 'semanal', 'quincenal', 'mensual', 'trimestral', 'semestral', 'anual');--> statement-breakpoint
CREATE TYPE "public"."activity_modality" AS ENUM('presencial', 'virtual', 'mixta');--> statement-breakpoint
CREATE TYPE "public"."activity_type" AS ENUM('medicina_trabajo', 'promocion_prevencion', 'campana_especial', 'examen_ocupacional', 'capacitacion_salud');--> statement-breakpoint
CREATE TYPE "public"."categoria_item" AS ENUM('epp', 'equipos', 'maquinaria', 'mobiliario', 'quimicos', 'materiales', 'emergencia', 'otros');--> statement-breakpoint
CREATE TYPE "public"."contenido_induccion_estado" AS ENUM('borrador', 'publicado', 'archivado');--> statement-breakpoint
CREATE TYPE "public"."contenido_induccion_tipo" AS ENUM('video', 'documento', 'presentacion', 'texto');--> statement-breakpoint
CREATE TYPE "public"."device_type" AS ENUM('mobile', 'desktop', 'tablet');--> statement-breakpoint
CREATE TYPE "public"."estado_automatizacion" AS ENUM('exito', 'error', 'pendiente');--> statement-breakpoint
CREATE TYPE "public"."evs_control_category" AS ENUM('tabaquismo', 'alcoholismo', 'farmacodependencia', 'habitos_alimenticios', 'actividad_fisica', 'salud_mental', 'riesgo_cardiovascular', 'otro');--> statement-breakpoint
CREATE TYPE "public"."evs_control_result" AS ENUM('negativo', 'positivo', 'sospechoso', 'no_realizado', 'rechazado');--> statement-breakpoint
CREATE TYPE "public"."evs_followup_status" AS ENUM('activo', 'en_tratamiento', 'recuperado', 'abandonado', 'cerrado');--> statement-breakpoint
CREATE TYPE "public"."evs_program_status" AS ENUM('borrador', 'activo', 'cerrado', 'suspendido');--> statement-breakpoint
CREATE TYPE "public"."indicator_status" AS ENUM('borrador', 'completado', 'aprobado', 'cerrado');--> statement-breakpoint
CREATE TYPE "public"."modulo_destino_automatizacion" AS ENUM('matriz_riesgos', 'plan_trabajo', 'capacitaciones', 'copasst', 'matriz_legal', 'politicas', 'indicadores', 'notificaciones');--> statement-breakpoint
CREATE TYPE "public"."sesion_induccion_estado" AS ENUM('pendiente', 'en_progreso', 'completada', 'expirada');--> statement-breakpoint
CREATE TYPE "public"."sst_license_status" AS ENUM('vigente', 'vencida', 'pendiente_verificacion', 'suspendida');--> statement-breakpoint
CREATE TYPE "public"."sst_profession_type" AS ENUM('medico_ocupacional', 'profesional_sst', 'tecnologo_sst', 'tecnico_sst', 'fisioterapeuta', 'psicologo_sst', 'fonoaudiologo', 'ingeniero_sst', 'enfermero_sst', 'otro');--> statement-breakpoint
CREATE TABLE "accident_statistics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"year" integer NOT NULL,
	"month" integer,
	"total_workers" integer NOT NULL,
	"hours_worked_hht" numeric(12, 2) NOT NULL,
	"total_accidents" integer DEFAULT 0 NOT NULL,
	"fatal_accidents" integer DEFAULT 0 NOT NULL,
	"severe_accidents" integer DEFAULT 0 NOT NULL,
	"lost_days" integer DEFAULT 0 NOT NULL,
	"total_occupational_diseases" integer DEFAULT 0 NOT NULL,
	"total_incidents" integer DEFAULT 0 NOT NULL,
	"indicador_if" numeric(10, 4),
	"indicador_is" numeric(10, 4),
	"indicador_ili" numeric(10, 4),
	"tasa_accidentalidad" numeric(10, 4),
	"tasa_enfermedad_laboral" numeric(10, 4),
	"tasa_ausentismo" numeric(10, 4),
	"trend_analysis" text,
	"conclusions" text,
	"improvement_actions" text,
	"status" "indicator_status" DEFAULT 'borrador' NOT NULL,
	"approved_by" varchar,
	"approved_at" timestamp,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "adquisicion_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"solicitud_id" varchar,
	"nombre_producto" text NOT NULL,
	"categoria" "categoria_item" NOT NULL,
	"marca" text,
	"modelo" text,
	"referencia" text,
	"serial" text,
	"cantidad" integer DEFAULT 1 NOT NULL,
	"unidad" text DEFAULT 'unidades',
	"precio_unitario" integer,
	"precio_total" integer,
	"resource_allocation_id" varchar,
	"ficha_tecnica_url" text,
	"ficha_tecnica_nombre" text,
	"hoja_seguridad_url" text,
	"hoja_seguridad_nombre" text,
	"certificado_url" text,
	"certificado_nombre" text,
	"especificaciones_sst" text,
	"cumple_normativa" integer DEFAULT 1,
	"normas_aplicables" text,
	"vida_util_meses" integer,
	"fecha_vencimiento" date,
	"requiere_mantenimiento" integer DEFAULT 0,
	"frecuencia_mantenimiento_dias" integer,
	"estado" text DEFAULT 'activo' NOT NULL,
	"fecha_compra" date,
	"fecha_baja" date,
	"motivo_baja" text,
	"observaciones" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "automatizacion_cambio_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"cambio_id" varchar NOT NULL,
	"modulo_destino" "modulo_destino_automatizacion" NOT NULL,
	"registro_destino_id" varchar,
	"estado" "estado_automatizacion" DEFAULT 'pendiente' NOT NULL,
	"mensaje" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contenidos_induccion" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"titulo" text NOT NULL,
	"descripcion" text,
	"tipo_contenido" "contenido_induccion_tipo" DEFAULT 'video' NOT NULL,
	"url_video" text,
	"url_documento" text,
	"contenido_texto" text,
	"duracion_minutos" integer DEFAULT 10 NOT NULL,
	"orden" integer DEFAULT 0 NOT NULL,
	"estado" "contenido_induccion_estado" DEFAULT 'borrador' NOT NULL,
	"obligatorio" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "convivencia_actas" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"eleccion_id" varchar,
	"tipo" text NOT NULL,
	"numero" integer NOT NULL,
	"fecha" date NOT NULL,
	"asunto" text NOT NULL,
	"contenido" text NOT NULL,
	"asistentes" text[] NOT NULL,
	"acuerdos" text[],
	"observaciones" text,
	"firmas" jsonb,
	"documento_url" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "convivencia_candidatos" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"eleccion_id" varchar NOT NULL,
	"worker_id" varchar NOT NULL,
	"propuesta_laboral" text,
	"fecha_inscripcion" date NOT NULL,
	"estado" text DEFAULT 'inscrito' NOT NULL,
	"votos_recibidos" integer DEFAULT 0 NOT NULL,
	"orden_eleccion" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "convivencia_elecciones" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"periodo_id" varchar,
	"fecha_convocatoria" date NOT NULL,
	"fecha_inicio_inscripcion" date NOT NULL,
	"fecha_fin_inscripcion" date NOT NULL,
	"fecha_votacion" date NOT NULL,
	"hora_inicio_votacion" text,
	"hora_fin_votacion" text,
	"modalidad_votacion" text DEFAULT 'presencial' NOT NULL,
	"estado" text DEFAULT 'convocatoria' NOT NULL,
	"publicado_en_portal" boolean DEFAULT false NOT NULL,
	"principales_requeridos" integer DEFAULT 2 NOT NULL,
	"suplentes_requeridos" integer DEFAULT 2 NOT NULL,
	"total_votantes" integer,
	"votos_validos" integer,
	"votos_nulos" integer,
	"votos_en_blanco" integer,
	"convocatoria_url" text,
	"acta_escrutinio_url" text,
	"observaciones" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "convivencia_miembros" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"periodo_id" varchar NOT NULL,
	"worker_id" varchar NOT NULL,
	"representacion" text NOT NULL,
	"cargo" text NOT NULL,
	"fecha_designacion" date NOT NULL,
	"estado" text DEFAULT 'activo' NOT NULL,
	"votos_obtenidos" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "convivencia_periodos" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"fecha_inicio" date NOT NULL,
	"fecha_fin" date NOT NULL,
	"estado" text DEFAULT 'activo' NOT NULL,
	"observaciones" text,
	"acta_constitucion_url" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "convivencia_registro_votacion" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"eleccion_id" varchar NOT NULL,
	"worker_id" varchar NOT NULL,
	"fecha_hora_voto" timestamp DEFAULT now(),
	"ip_address" text
);
--> statement-breakpoint
CREATE TABLE "convivencia_votos" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"eleccion_id" varchar NOT NULL,
	"candidato_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "copasst_banco_preguntas" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar,
	"categoria_id" varchar,
	"enunciado_html" text NOT NULL,
	"tipo_pregunta" text DEFAULT 'seleccion_multiple' NOT NULL,
	"opciones" jsonb NOT NULL,
	"respuesta_correcta" text NOT NULL,
	"explicacion_html" text,
	"dificultad" text DEFAULT 'media' NOT NULL,
	"etiquetas" text[],
	"puntos" integer DEFAULT 10 NOT NULL,
	"activo" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "copasst_competencias" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar,
	"nombre" text NOT NULL,
	"descripcion" text,
	"dimension" text NOT NULL,
	"activo" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "copasst_curso_asignaciones" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"curso_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"asignado_por" varchar NOT NULL,
	"fecha_asignacion" timestamp DEFAULT now() NOT NULL,
	"fecha_limite" timestamp,
	"notificar_dias_antes" integer DEFAULT 3,
	"estado" text DEFAULT 'pendiente' NOT NULL,
	"fecha_completado" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "copasst_curso_categorias" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"nombre" text NOT NULL,
	"descripcion" text,
	"orden" integer DEFAULT 1 NOT NULL,
	"activo" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "copasst_evaluacion_asignaciones" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"periodo_id" varchar NOT NULL,
	"evaluador_id" varchar NOT NULL,
	"evaluado_id" varchar NOT NULL,
	"tipo_evaluador" text NOT NULL,
	"estado" text DEFAULT 'pendiente' NOT NULL,
	"fecha_completada" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "copasst_evaluacion_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"periodo_id" varchar NOT NULL,
	"competencia_id" varchar NOT NULL,
	"enunciado" text NOT NULL,
	"escala_minima" integer DEFAULT 1 NOT NULL,
	"escala_maxima" integer DEFAULT 5 NOT NULL,
	"peso" integer DEFAULT 1 NOT NULL,
	"orden" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "copasst_evaluacion_periodos" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"nombre" text NOT NULL,
	"descripcion" text,
	"fecha_inicio" date NOT NULL,
	"fecha_fin" date NOT NULL,
	"estado" text DEFAULT 'configuracion' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "copasst_evaluacion_respuestas" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asignacion_id" varchar NOT NULL,
	"item_id" varchar NOT NULL,
	"valor" integer NOT NULL,
	"comentario" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "copasst_evaluacion_resultados" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"periodo_id" varchar NOT NULL,
	"evaluado_id" varchar NOT NULL,
	"promedio_general" numeric NOT NULL,
	"promedios_por_dimension" jsonb NOT NULL,
	"fortalezas" jsonb,
	"oportunidades" jsonb,
	"comentarios_generales" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "copasst_notificaciones" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"asignacion_id" varchar,
	"user_id" varchar NOT NULL,
	"tipo" text NOT NULL,
	"titulo" text NOT NULL,
	"mensaje" text NOT NULL,
	"estado" text DEFAULT 'pendiente' NOT NULL,
	"fecha_programada" timestamp NOT NULL,
	"fecha_envio" timestamp,
	"intentos" integer DEFAULT 0 NOT NULL,
	"error_mensaje" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "copasst_votos" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"eleccion_id" varchar NOT NULL,
	"candidato_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "evs_activities" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"program_id" varchar,
	"category" "evs_control_category" NOT NULL,
	"custom_category" text,
	"title" text NOT NULL,
	"description" text,
	"objective" text NOT NULL,
	"methodology" text,
	"scheduled_date" date NOT NULL,
	"execution_date" date,
	"start_time" text,
	"end_time" text,
	"location" text,
	"modality" text DEFAULT 'presencial',
	"meeting_link" text,
	"facilitator_name" text NOT NULL,
	"facilitator_position" text,
	"external_provider" text,
	"target_population" text,
	"estimated_participants" integer,
	"actual_participants" integer,
	"coverage_percentage" numeric(5, 2),
	"status" text DEFAULT 'programada' NOT NULL,
	"observations" text,
	"lessons_learned" text,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "evs_controls" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"worker_id" varchar NOT NULL,
	"program_id" varchar,
	"category" "evs_control_category" NOT NULL,
	"control_type" text NOT NULL,
	"control_date" date NOT NULL,
	"control_time" text,
	"location" text,
	"result" "evs_control_result" NOT NULL,
	"result_details" text,
	"substance_detected" text,
	"informed_consent" integer DEFAULT 1 NOT NULL,
	"consent_date" date,
	"performed_by" text NOT NULL,
	"performer_position" text,
	"witness_name" text,
	"requires_followup" integer DEFAULT 0 NOT NULL,
	"referral_required" integer DEFAULT 0 NOT NULL,
	"referral_entity" text,
	"observations" text,
	"is_confidential" integer DEFAULT 1 NOT NULL,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "evs_followups" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"worker_id" varchar NOT NULL,
	"control_id" varchar,
	"incident_id" varchar,
	"case_number" text,
	"category" "evs_control_category" NOT NULL,
	"open_date" date NOT NULL,
	"initial_assessment" text NOT NULL,
	"risk_level" text NOT NULL,
	"intervention_plan" text,
	"treatment_type" text,
	"referral_entity" text,
	"referral_date" date,
	"worker_commitments" text,
	"company_commitments" text,
	"next_review_date" date,
	"followup_notes" text,
	"last_followup_date" date,
	"total_followups" integer DEFAULT 0 NOT NULL,
	"status" "evs_followup_status" DEFAULT 'activo' NOT NULL,
	"close_date" date,
	"close_reason" text,
	"outcome" text,
	"is_confidential" integer DEFAULT 1 NOT NULL,
	"access_log" text,
	"responsible_professional" text,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "evs_incidents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"worker_id" varchar,
	"control_id" varchar,
	"category" "evs_control_category" NOT NULL,
	"incident_type" text NOT NULL,
	"incident_date" date NOT NULL,
	"incident_time" text,
	"incident_location" text,
	"description" text NOT NULL,
	"reported_by" text NOT NULL,
	"reporter_position" text,
	"witnesses" text[],
	"immediate_measures" text,
	"was_removed" integer DEFAULT 0 NOT NULL,
	"medical_assessment" integer DEFAULT 0 NOT NULL,
	"disciplinary_action" text,
	"requires_followup" integer DEFAULT 1 NOT NULL,
	"commitment_signed" integer DEFAULT 0 NOT NULL,
	"commitment_date" date,
	"status" text DEFAULT 'abierto' NOT NULL,
	"closure_date" date,
	"closure_reason" text,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "evs_participants" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"activity_id" varchar NOT NULL,
	"worker_id" varchar,
	"worker_name" text NOT NULL,
	"worker_document" text,
	"worker_area" text,
	"attended" integer DEFAULT 0 NOT NULL,
	"attendance_date" date,
	"attendance_time" text,
	"pre_evaluation" numeric(5, 2),
	"post_evaluation" numeric(5, 2),
	"observations" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "evs_programs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"year" integer NOT NULL,
	"name" text NOT NULL,
	"policy" text NOT NULL,
	"objectives" text NOT NULL,
	"scope" text,
	"diagnostic_summary" text,
	"identified_risks" text[],
	"priority_areas" text[],
	"responsible_name" text NOT NULL,
	"responsible_position" text,
	"responsible_email" text,
	"approved_budget" numeric(12, 2),
	"executed_budget" numeric(12, 2),
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"participation_target" integer,
	"compliance_target" integer,
	"status" "evs_program_status" DEFAULT 'borrador' NOT NULL,
	"approved_by" varchar,
	"approved_at" timestamp,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "preguntas_induccion" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"contenido_id" varchar,
	"pregunta" text NOT NULL,
	"opciones" text NOT NULL,
	"respuesta_correcta" integer NOT NULL,
	"explicacion" text,
	"orden" integer DEFAULT 0 NOT NULL,
	"activa" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promotion_prevention_activities" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"title" text NOT NULL,
	"activity_type" "activity_type" NOT NULL,
	"objective" text NOT NULL,
	"scope" text,
	"description" text,
	"priority_risk_type" text,
	"priority_risk_description" text,
	"sve_program_id" varchar,
	"modality" "activity_modality" DEFAULT 'presencial' NOT NULL,
	"frequency" "activity_frequency" DEFAULT 'unica' NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"scheduled_time" text,
	"location" text,
	"responsible_name" text NOT NULL,
	"responsible_position" text,
	"responsible_email" text,
	"target_population" text NOT NULL,
	"estimated_participants" integer,
	"actual_participants" integer,
	"evidence_required" text[],
	"evidence_urls" text[],
	"status" text DEFAULT 'programada' NOT NULL,
	"completion_percentage" integer DEFAULT 0,
	"completion_date" date,
	"observations" text,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "promotion_prevention_participants" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"activity_id" varchar NOT NULL,
	"worker_id" varchar,
	"worker_name" text NOT NULL,
	"worker_document" text,
	"participation_role" text DEFAULT 'participante' NOT NULL,
	"attended" boolean DEFAULT false,
	"attendance_date" date,
	"observations" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sesiones_induccion_virtual" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"worker_id" varchar NOT NULL,
	"token" text NOT NULL,
	"tipo_induccion" "induction_type" DEFAULT 'induccion' NOT NULL,
	"estado" "sesion_induccion_estado" DEFAULT 'pendiente' NOT NULL,
	"fecha_envio" timestamp DEFAULT now() NOT NULL,
	"fecha_expiracion" timestamp NOT NULL,
	"fecha_inicio" timestamp,
	"fecha_finalizacion" timestamp,
	"contenidos_vistos" text DEFAULT '[]' NOT NULL,
	"progreso_evaluacion" text DEFAULT '{}' NOT NULL,
	"puntaje_evaluacion" integer,
	"aprobado" integer,
	"firma_digital" text,
	"fecha_firma" timestamp,
	"ip_firma" text,
	"user_agent_firma" text,
	"datos_adicionales" text,
	"registro_induccion_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sesiones_induccion_virtual_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "worker_portal_access_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"user_id" varchar,
	"worker_id" varchar,
	"user_name" text,
	"worker_name" text,
	"access_time" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"device_type" "device_type"
);
--> statement-breakpoint
ALTER TABLE "resource_allocations" ADD COLUMN "monto_ejecutado" text DEFAULT '0';--> statement-breakpoint
ALTER TABLE "solicitudes_adquisicion" ADD COLUMN "recurso_financiero_id" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "sst_profession_type" "sst_profession_type";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "sst_license_number" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "sst_license_issuer" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "sst_license_issued_at" date;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "sst_license_expires_at" date;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "sst_license_status" "sst_license_status";--> statement-breakpoint
ALTER TABLE "workers" ADD COLUMN "job_profile_id" varchar;--> statement-breakpoint
ALTER TABLE "accident_statistics" ADD CONSTRAINT "accident_statistics_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accident_statistics" ADD CONSTRAINT "accident_statistics_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accident_statistics" ADD CONSTRAINT "accident_statistics_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adquisicion_items" ADD CONSTRAINT "adquisicion_items_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adquisicion_items" ADD CONSTRAINT "adquisicion_items_solicitud_id_solicitudes_adquisicion_id_fk" FOREIGN KEY ("solicitud_id") REFERENCES "public"."solicitudes_adquisicion"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adquisicion_items" ADD CONSTRAINT "adquisicion_items_resource_allocation_id_resource_allocations_id_fk" FOREIGN KEY ("resource_allocation_id") REFERENCES "public"."resource_allocations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automatizacion_cambio_logs" ADD CONSTRAINT "automatizacion_cambio_logs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automatizacion_cambio_logs" ADD CONSTRAINT "automatizacion_cambio_logs_cambio_id_cambios_sst_id_fk" FOREIGN KEY ("cambio_id") REFERENCES "public"."cambios_sst"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contenidos_induccion" ADD CONSTRAINT "contenidos_induccion_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "convivencia_actas" ADD CONSTRAINT "convivencia_actas_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "convivencia_actas" ADD CONSTRAINT "convivencia_actas_eleccion_id_convivencia_elecciones_id_fk" FOREIGN KEY ("eleccion_id") REFERENCES "public"."convivencia_elecciones"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "convivencia_candidatos" ADD CONSTRAINT "convivencia_candidatos_eleccion_id_convivencia_elecciones_id_fk" FOREIGN KEY ("eleccion_id") REFERENCES "public"."convivencia_elecciones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "convivencia_candidatos" ADD CONSTRAINT "convivencia_candidatos_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "convivencia_elecciones" ADD CONSTRAINT "convivencia_elecciones_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "convivencia_elecciones" ADD CONSTRAINT "convivencia_elecciones_periodo_id_convivencia_periodos_id_fk" FOREIGN KEY ("periodo_id") REFERENCES "public"."convivencia_periodos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "convivencia_miembros" ADD CONSTRAINT "convivencia_miembros_periodo_id_convivencia_periodos_id_fk" FOREIGN KEY ("periodo_id") REFERENCES "public"."convivencia_periodos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "convivencia_miembros" ADD CONSTRAINT "convivencia_miembros_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "convivencia_periodos" ADD CONSTRAINT "convivencia_periodos_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "convivencia_registro_votacion" ADD CONSTRAINT "convivencia_registro_votacion_eleccion_id_convivencia_elecciones_id_fk" FOREIGN KEY ("eleccion_id") REFERENCES "public"."convivencia_elecciones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "convivencia_registro_votacion" ADD CONSTRAINT "convivencia_registro_votacion_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "convivencia_votos" ADD CONSTRAINT "convivencia_votos_eleccion_id_convivencia_elecciones_id_fk" FOREIGN KEY ("eleccion_id") REFERENCES "public"."convivencia_elecciones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "convivencia_votos" ADD CONSTRAINT "convivencia_votos_candidato_id_convivencia_candidatos_id_fk" FOREIGN KEY ("candidato_id") REFERENCES "public"."convivencia_candidatos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_banco_preguntas" ADD CONSTRAINT "copasst_banco_preguntas_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_banco_preguntas" ADD CONSTRAINT "copasst_banco_preguntas_categoria_id_copasst_curso_categorias_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."copasst_curso_categorias"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_competencias" ADD CONSTRAINT "copasst_competencias_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_curso_asignaciones" ADD CONSTRAINT "copasst_curso_asignaciones_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_curso_asignaciones" ADD CONSTRAINT "copasst_curso_asignaciones_curso_id_copasst_cursos_id_fk" FOREIGN KEY ("curso_id") REFERENCES "public"."copasst_cursos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_curso_asignaciones" ADD CONSTRAINT "copasst_curso_asignaciones_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_curso_asignaciones" ADD CONSTRAINT "copasst_curso_asignaciones_asignado_por_users_id_fk" FOREIGN KEY ("asignado_por") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_curso_categorias" ADD CONSTRAINT "copasst_curso_categorias_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_evaluacion_asignaciones" ADD CONSTRAINT "copasst_evaluacion_asignaciones_periodo_id_copasst_evaluacion_periodos_id_fk" FOREIGN KEY ("periodo_id") REFERENCES "public"."copasst_evaluacion_periodos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_evaluacion_asignaciones" ADD CONSTRAINT "copasst_evaluacion_asignaciones_evaluador_id_users_id_fk" FOREIGN KEY ("evaluador_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_evaluacion_asignaciones" ADD CONSTRAINT "copasst_evaluacion_asignaciones_evaluado_id_users_id_fk" FOREIGN KEY ("evaluado_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_evaluacion_items" ADD CONSTRAINT "copasst_evaluacion_items_periodo_id_copasst_evaluacion_periodos_id_fk" FOREIGN KEY ("periodo_id") REFERENCES "public"."copasst_evaluacion_periodos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_evaluacion_items" ADD CONSTRAINT "copasst_evaluacion_items_competencia_id_copasst_competencias_id_fk" FOREIGN KEY ("competencia_id") REFERENCES "public"."copasst_competencias"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_evaluacion_periodos" ADD CONSTRAINT "copasst_evaluacion_periodos_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_evaluacion_respuestas" ADD CONSTRAINT "copasst_evaluacion_respuestas_asignacion_id_copasst_evaluacion_asignaciones_id_fk" FOREIGN KEY ("asignacion_id") REFERENCES "public"."copasst_evaluacion_asignaciones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_evaluacion_respuestas" ADD CONSTRAINT "copasst_evaluacion_respuestas_item_id_copasst_evaluacion_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."copasst_evaluacion_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_evaluacion_resultados" ADD CONSTRAINT "copasst_evaluacion_resultados_periodo_id_copasst_evaluacion_periodos_id_fk" FOREIGN KEY ("periodo_id") REFERENCES "public"."copasst_evaluacion_periodos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_evaluacion_resultados" ADD CONSTRAINT "copasst_evaluacion_resultados_evaluado_id_users_id_fk" FOREIGN KEY ("evaluado_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_notificaciones" ADD CONSTRAINT "copasst_notificaciones_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_notificaciones" ADD CONSTRAINT "copasst_notificaciones_asignacion_id_copasst_curso_asignaciones_id_fk" FOREIGN KEY ("asignacion_id") REFERENCES "public"."copasst_curso_asignaciones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_notificaciones" ADD CONSTRAINT "copasst_notificaciones_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_votos" ADD CONSTRAINT "copasst_votos_eleccion_id_copasst_elecciones_id_fk" FOREIGN KEY ("eleccion_id") REFERENCES "public"."copasst_elecciones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_votos" ADD CONSTRAINT "copasst_votos_candidato_id_copasst_candidatos_id_fk" FOREIGN KEY ("candidato_id") REFERENCES "public"."copasst_candidatos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evs_activities" ADD CONSTRAINT "evs_activities_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evs_activities" ADD CONSTRAINT "evs_activities_program_id_evs_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."evs_programs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evs_activities" ADD CONSTRAINT "evs_activities_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evs_controls" ADD CONSTRAINT "evs_controls_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evs_controls" ADD CONSTRAINT "evs_controls_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evs_controls" ADD CONSTRAINT "evs_controls_program_id_evs_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."evs_programs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evs_controls" ADD CONSTRAINT "evs_controls_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evs_followups" ADD CONSTRAINT "evs_followups_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evs_followups" ADD CONSTRAINT "evs_followups_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evs_followups" ADD CONSTRAINT "evs_followups_control_id_evs_controls_id_fk" FOREIGN KEY ("control_id") REFERENCES "public"."evs_controls"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evs_followups" ADD CONSTRAINT "evs_followups_incident_id_evs_incidents_id_fk" FOREIGN KEY ("incident_id") REFERENCES "public"."evs_incidents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evs_followups" ADD CONSTRAINT "evs_followups_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evs_incidents" ADD CONSTRAINT "evs_incidents_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evs_incidents" ADD CONSTRAINT "evs_incidents_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evs_incidents" ADD CONSTRAINT "evs_incidents_control_id_evs_controls_id_fk" FOREIGN KEY ("control_id") REFERENCES "public"."evs_controls"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evs_incidents" ADD CONSTRAINT "evs_incidents_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evs_participants" ADD CONSTRAINT "evs_participants_activity_id_evs_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."evs_activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evs_participants" ADD CONSTRAINT "evs_participants_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evs_programs" ADD CONSTRAINT "evs_programs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evs_programs" ADD CONSTRAINT "evs_programs_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evs_programs" ADD CONSTRAINT "evs_programs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "preguntas_induccion" ADD CONSTRAINT "preguntas_induccion_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "preguntas_induccion" ADD CONSTRAINT "preguntas_induccion_contenido_id_contenidos_induccion_id_fk" FOREIGN KEY ("contenido_id") REFERENCES "public"."contenidos_induccion"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promotion_prevention_activities" ADD CONSTRAINT "promotion_prevention_activities_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promotion_prevention_activities" ADD CONSTRAINT "promotion_prevention_activities_sve_program_id_sve_programs_id_fk" FOREIGN KEY ("sve_program_id") REFERENCES "public"."sve_programs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promotion_prevention_activities" ADD CONSTRAINT "promotion_prevention_activities_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promotion_prevention_participants" ADD CONSTRAINT "promotion_prevention_participants_activity_id_promotion_prevention_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."promotion_prevention_activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promotion_prevention_participants" ADD CONSTRAINT "promotion_prevention_participants_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sesiones_induccion_virtual" ADD CONSTRAINT "sesiones_induccion_virtual_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sesiones_induccion_virtual" ADD CONSTRAINT "sesiones_induccion_virtual_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sesiones_induccion_virtual" ADD CONSTRAINT "sesiones_induccion_virtual_registro_induccion_id_registros_induccion_id_fk" FOREIGN KEY ("registro_induccion_id") REFERENCES "public"."registros_induccion"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_portal_access_logs" ADD CONSTRAINT "worker_portal_access_logs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_portal_access_logs" ADD CONSTRAINT "worker_portal_access_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worker_portal_access_logs" ADD CONSTRAINT "worker_portal_access_logs_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solicitudes_adquisicion" ADD CONSTRAINT "solicitudes_adquisicion_recurso_financiero_id_resource_allocations_id_fk" FOREIGN KEY ("recurso_financiero_id") REFERENCES "public"."resource_allocations"("id") ON DELETE no action ON UPDATE no action;