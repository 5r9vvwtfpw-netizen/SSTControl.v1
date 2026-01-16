CREATE TYPE "public"."accident_classification" AS ENUM('normal', 'in_itinere', 'en_mision');--> statement-breakpoint
CREATE TYPE "public"."arco_request_status" AS ENUM('pendiente', 'en_proceso', 'completada', 'rechazada', 'parcialmente_completada');--> statement-breakpoint
CREATE TYPE "public"."arco_request_type" AS ENUM('acceso', 'rectificacion', 'cancelacion', 'oposicion', 'portabilidad', 'limitacion');--> statement-breakpoint
CREATE TYPE "public"."audit_action" AS ENUM('create', 'update', 'delete', 'view', 'export', 'access_report');--> statement-breakpoint
CREATE TYPE "public"."auditoria_estado" AS ENUM('programada', 'en_ejecucion', 'completada', 'cerrada');--> statement-breakpoint
CREATE TYPE "public"."auditoria_norma" AS ENUM('ISO_45001', 'res_0312_2019', 'ambas');--> statement-breakpoint
CREATE TYPE "public"."auditoria_tipo" AS ENUM('interna', 'externa', 'seguimiento');--> statement-breakpoint
CREATE TYPE "public"."billing_interval" AS ENUM('monthly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."categoria_reporte" AS ENUM('peligro', 'incidente', 'sugerencia', 'queja', 'consulta', 'reconocimiento');--> statement-breakpoint
CREATE TYPE "public"."clasificacion_peligro" AS ENUM('fisico', 'quimico', 'biologico', 'biomecanico', 'psicosocial', 'condiciones_seguridad', 'fenomenos_naturales');--> statement-breakpoint
CREATE TYPE "public"."consent_channel" AS ENUM('web', 'paper', 'email', 'verbal', 'mobile');--> statement-breakpoint
CREATE TYPE "public"."consent_status" AS ENUM('otorgado', 'revocado', 'vencido');--> statement-breakpoint
CREATE TYPE "public"."consent_type" AS ENUM('habeas_data_general', 'datos_sensibles_salud', 'datos_biometricos', 'uso_imagen', 'transferencia_internacional', 'marketing');--> statement-breakpoint
CREATE TYPE "public"."estado_control_inspeccion" AS ENUM('conforme', 'no-conforme', 'observacion');--> statement-breakpoint
CREATE TYPE "public"."estado_matriz_iperc" AS ENUM('borrador', 'revision', 'aprobada', 'vigente', 'obsoleta');--> statement-breakpoint
CREATE TYPE "public"."estado_reporte" AS ENUM('pendiente', 'en_revision', 'requiere_accion', 'en_proceso', 'resuelto', 'cerrado');--> statement-breakpoint
CREATE TYPE "public"."estado_revision_direccion" AS ENUM('programada', 'en_ejecucion', 'completada', 'aprobada', 'seguimiento');--> statement-breakpoint
CREATE TYPE "public"."hallazgo_severidad" AS ENUM('baja', 'media', 'alta', 'critica');--> statement-breakpoint
CREATE TYPE "public"."hallazgo_tipo" AS ENUM('conformidad', 'no_conformidad_menor', 'no_conformidad_mayor', 'observacion');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('draft', 'sent', 'paid', 'overdue', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."journey_type" AS ENUM('ordinaria', 'extraordinaria');--> statement-breakpoint
CREATE TYPE "public"."medios_comunicacion" AS ENUM('correo', 'cartelera', 'intranet', 'reunion', 'whatsapp', 'sms', 'aplicacion', 'documento');--> statement-breakpoint
CREATE TYPE "public"."nivel_probabilidad" AS ENUM('baja', 'media', 'alta', 'muy_alta');--> statement-breakpoint
CREATE TYPE "public"."nivel_riesgo" AS ENUM('trivial', 'tolerable', 'moderado', 'importante', 'intolerable');--> statement-breakpoint
CREATE TYPE "public"."nivel_severidad" AS ENUM('ligeramente_danino', 'danino', 'extremadamente_danino');--> statement-breakpoint
CREATE TYPE "public"."payment_source_status" AS ENUM('available', 'pending', 'failed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."payment_source_type" AS ENUM('CARD', 'NEQUI', 'BANCOLOMBIA_TRANSFER');--> statement-breakpoint
CREATE TYPE "public"."plan_accion_estado" AS ENUM('abierto', 'en_progreso', 'completado', 'verificado', 'cerrado');--> statement-breakpoint
CREATE TYPE "public"."plan_change_status" AS ENUM('pending_payment', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."plan_change_type" AS ENUM('upgrade', 'downgrade', 'trial_conversion');--> statement-breakpoint
CREATE TYPE "public"."plan_status" AS ENUM('active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."prioridad_reporte" AS ENUM('baja', 'media', 'alta', 'urgente');--> statement-breakpoint
CREATE TYPE "public"."publico_objetivo" AS ENUM('todos', 'trabajadores', 'contratistas', 'copasst', 'alta_direccion', 'supervisores', 'area_especifica', 'nuevos_empleados');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('trial', 'active', 'past_due', 'suspended', 'canceled', 'expired');--> statement-breakpoint
CREATE TYPE "public"."tipo_accion_auditoria" AS ENUM('crear', 'editar', 'eliminar', 'enviar', 'leer', 'confirmar_lectura', 'asignar', 'responder', 'cerrar', 'cambiar_estado', 'adjuntar_archivo', 'eliminar_archivo');--> statement-breakpoint
CREATE TYPE "public"."tipo_comunicacion" AS ENUM('politica', 'procedimiento', 'alerta', 'informativo', 'formacion', 'emergencia', 'normativo', 'evento');--> statement-breakpoint
CREATE TYPE "public"."tipo_control" AS ENUM('eliminacion', 'sustitucion', 'ingenieria', 'administrativo', 'epp');--> statement-breakpoint
CREATE TYPE "public"."tipo_decision_revision" AS ENUM('mejora_continua', 'cambio_politica', 'asignacion_recursos', 'cambio_objetivos', 'nueva_accion', 'mantener', 'otro');--> statement-breakpoint
CREATE TYPE "public"."tipo_participante_revision" AS ENUM('alta_direccion', 'coordinador_sst', 'copasst', 'rrhh', 'operaciones', 'otro');--> statement-breakpoint
CREATE TYPE "public"."tipo_tema_revision" AS ENUM('indicadores_sst', 'objetivos_metas', 'auditorias', 'accidentes_incidentes', 'enfermedades', 'capacitaciones', 'recursos', 'cambios_normativos', 'no_conformidades', 'mejora_continua', 'contexto_organizacion', 'otro');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('PENDING', 'APPROVED', 'DECLINED', 'VOIDED', 'ERROR');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('subscription_payment', 'trial_conversion', 'upgrade', 'downgrade', 'refund');--> statement-breakpoint
ALTER TYPE "public"."contract_type" ADD VALUE 'fijo' BEFORE 'temporal';--> statement-breakpoint
ALTER TYPE "public"."programa_sst" ADD VALUE 'identificacion-peligros' BEFORE 'medicina-preventiva';--> statement-breakpoint
CREATE TABLE "acciones_revision" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"decision_id" varchar NOT NULL,
	"company_id" varchar NOT NULL,
	"descripcion" text NOT NULL,
	"responsable" varchar,
	"responsable_nombre" text NOT NULL,
	"fecha_compromiso" date NOT NULL,
	"fecha_implementacion" date,
	"prioridad" "prioridad_mejora" DEFAULT 'media' NOT NULL,
	"estado" "estado_accion" DEFAULT 'pendiente' NOT NULL,
	"avance_descripcion" text,
	"porcentaje_avance" integer DEFAULT 0 NOT NULL,
	"evidencia_url" text,
	"verificado_por" varchar,
	"fecha_verificacion" date,
	"eficaz" integer,
	"observaciones_verificacion" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "arco_requests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"request_type" "arco_request_type" NOT NULL,
	"status" "arco_request_status" DEFAULT 'pendiente' NOT NULL,
	"worker_id" varchar,
	"user_id" varchar,
	"requester_name" text NOT NULL,
	"requester_email" text NOT NULL,
	"requester_phone" text,
	"requester_identification" text NOT NULL,
	"is_representative" integer DEFAULT 0 NOT NULL,
	"data_subject_name" text,
	"data_subject_identification" text,
	"representation_proof_url" text,
	"representative_verified" integer,
	"representative_verified_by" varchar,
	"representative_verified_at" timestamp,
	"request_description" text NOT NULL,
	"specific_data_requested" text,
	"justification" text,
	"assigned_to" varchar,
	"assigned_at" timestamp,
	"previous_assignees" text[] DEFAULT '{}',
	"escalated_to" varchar,
	"escalated_at" timestamp,
	"escalation_reason" text,
	"intake_recorded_by" varchar,
	"response_date" timestamp,
	"response_description" text,
	"response_provided_by" varchar,
	"rejection_reason" text,
	"partial_completion_details" text,
	"request_attachments_urls" text[] DEFAULT '{}',
	"response_attachments_urls" text[] DEFAULT '{}',
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"legal_deadline" timestamp DEFAULT now() + interval '10 days' NOT NULL,
	"reminder_sent_at" timestamp,
	"completed_at" timestamp,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"user_role" text NOT NULL,
	"username" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"action" "audit_action" NOT NULL,
	"data_subject_id" text,
	"data_subject_name" text,
	"old_values" text,
	"new_values" text,
	"changed_fields" text,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"request_id" text,
	"description" text,
	"source" text DEFAULT 'api',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auditoria_auditores" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auditoria_id" varchar NOT NULL,
	"auditor_id" varchar,
	"nombre_externo" text,
	"email_externo" text,
	"organizacion_externa" text,
	"rol" text DEFAULT 'auditor' NOT NULL,
	"areas_asignadas" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auditoria_checklists" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auditoria_id" varchar NOT NULL,
	"numero_item" integer NOT NULL,
	"criterio_auditoria" text NOT NULL,
	"clausula_referencia" text,
	"area_proceso_auditado" text,
	"cumple" integer,
	"evidencias_obtenidas" text,
	"observaciones" text,
	"archivo_evidencia" text,
	"evaluado_por" text,
	"evaluado_por_id" varchar,
	"fecha_evaluacion" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auditorias_internas" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"codigo" text NOT NULL,
	"titulo" text NOT NULL,
	"tipo" "auditoria_tipo" NOT NULL,
	"norma_referencia" "auditoria_norma" NOT NULL,
	"objetivo" text NOT NULL,
	"alcance" text NOT NULL,
	"fecha_programada" date NOT NULL,
	"fecha_inicio" date,
	"fecha_fin" date,
	"duracion_estimada_horas" integer,
	"auditorista_lider" text NOT NULL,
	"auditorista_lider_id" varchar,
	"responsable_auditado" text,
	"responsable_auditado_id" varchar,
	"estado" "auditoria_estado" DEFAULT 'programada' NOT NULL,
	"numero_hallazgos" integer DEFAULT 0,
	"numero_conformidades" integer DEFAULT 0,
	"numero_no_conformidades_menores" integer DEFAULT 0,
	"numero_no_conformidades_mayores" integer DEFAULT 0,
	"numero_observaciones" integer DEFAULT 0,
	"porcentaje_cumplimiento" integer,
	"conclusiones" text,
	"recomendaciones" text,
	"fecha_informe" date,
	"archivo_informe" text,
	"aprobado_por" text,
	"aprobado_por_id" varchar,
	"fecha_aprobacion" date,
	"observaciones_cierre" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comunicaciones_sst" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"tipo" "tipo_comunicacion" NOT NULL,
	"asunto" text NOT NULL,
	"contenido" text NOT NULL,
	"publico_objetivo" "publico_objetivo" NOT NULL,
	"departamento_especifico" text,
	"medios_utilizados" text[],
	"archivos_adjuntos" text[],
	"fecha_envio" timestamp DEFAULT now() NOT NULL,
	"enviado_por" varchar NOT NULL,
	"requiere_confirmacion_lectura" integer DEFAULT 0 NOT NULL,
	"total_destinatarios" integer DEFAULT 0 NOT NULL,
	"total_lecturas" integer DEFAULT 0 NOT NULL,
	"fecha_vigencia_inicio" date,
	"fecha_vigencia_fin" date,
	"relacionado_con" text,
	"relacionado_id" varchar,
	"observaciones" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consent_records" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"worker_id" varchar NOT NULL,
	"worker_name" text NOT NULL,
	"worker_email" text,
	"worker_identification" text NOT NULL,
	"consent_type" "consent_type" NOT NULL,
	"status" "consent_status" DEFAULT 'otorgado' NOT NULL,
	"channel" "consent_channel" DEFAULT 'web' NOT NULL,
	"policy_version" text NOT NULL,
	"policy_document_url" text,
	"consent_text" text,
	"granted_at" timestamp DEFAULT now() NOT NULL,
	"revoked_at" timestamp,
	"expires_at" timestamp,
	"purpose" text NOT NULL,
	"legal_basis" text,
	"revocation_reason" text,
	"revoked_by" varchar,
	"recorded_by" varchar,
	"updated_by" varchar,
	"ip_address" text,
	"user_agent" text,
	"evidence_url" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "decisiones_revision" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"revision_id" varchar NOT NULL,
	"company_id" varchar NOT NULL,
	"tipo" "tipo_decision_revision" NOT NULL,
	"descripcion" text NOT NULL,
	"justificacion" text,
	"alcance" text,
	"recurso_necesario" text,
	"requiere_accion" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hallazgos_auditoria" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"auditoria_id" varchar NOT NULL,
	"numero_hallazgo" text NOT NULL,
	"tipo" "hallazgo_tipo" NOT NULL,
	"severidad" "hallazgo_severidad" NOT NULL,
	"descripcion" text NOT NULL,
	"requisito" text NOT NULL,
	"clausula_referencia" text,
	"area_afectada" text NOT NULL,
	"evidencia" text,
	"archivo_evidencia" text,
	"causa_raiz" text,
	"detectado_por" text,
	"detectado_por_id" varchar,
	"fecha_deteccion" date NOT NULL,
	"responsable_area" text,
	"responsable_area_id" varchar,
	"estado_cierre" text DEFAULT 'abierto',
	"fecha_cierre" date,
	"verificado_por" text,
	"verificado_por_id" varchar,
	"observaciones_cierre" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "historial_comunicaciones_sst" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"entidad" text NOT NULL,
	"entidad_id" varchar NOT NULL,
	"accion" "tipo_accion_auditoria" NOT NULL,
	"descripcion" text NOT NULL,
	"user_id" varchar NOT NULL,
	"nombre_usuario" text NOT NULL,
	"rol_usuario" text NOT NULL,
	"campo_modificado" text,
	"valor_anterior" text,
	"valor_nuevo" text,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inspecciones_peligros_vinculados" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"inspeccion_id" varchar NOT NULL,
	"peligro_id" varchar NOT NULL,
	"estado_control" "estado_control_inspeccion" DEFAULT 'conforme' NOT NULL,
	"hallazgos" text,
	"evidencia_fotografica" text,
	"verificado_por" varchar,
	"fecha_verificacion" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"subscription_id" varchar NOT NULL,
	"transaction_id" varchar,
	"invoice_number" text NOT NULL,
	"status" "invoice_status" DEFAULT 'draft' NOT NULL,
	"subtotal" integer NOT NULL,
	"tax_amount" integer DEFAULT 0 NOT NULL,
	"total" integer NOT NULL,
	"currency" text DEFAULT 'COP' NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"issue_date" timestamp DEFAULT now() NOT NULL,
	"due_date" timestamp NOT NULL,
	"paid_date" timestamp,
	"customer_name" text NOT NULL,
	"customer_nit" text NOT NULL,
	"customer_email" text NOT NULL,
	"customer_address" text,
	"line_items" text NOT NULL,
	"dian_cufe" text,
	"dian_xml_url" text,
	"dian_pdf_url" text,
	"pdf_url" text,
	"email_sent_at" timestamp,
	"email_sent_to" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "lecturas_comunicacion" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"comunicacion_id" varchar NOT NULL,
	"user_id" varchar,
	"worker_id" varchar,
	"fecha_lectura" timestamp,
	"confirmado" integer DEFAULT 1 NOT NULL,
	"comentarios" text,
	"calificacion" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matrices_iperc" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"nombre" text NOT NULL,
	"codigo" text,
	"area" text NOT NULL,
	"proceso" text,
	"responsable_evaluacion" text NOT NULL,
	"responsable_evaluacion_id" varchar,
	"cargo_responsable" text,
	"fecha_evaluacion" date NOT NULL,
	"fecha_proxima_revision" date,
	"fecha_aprobacion" date,
	"vigencia_desde" date,
	"vigencia_hasta" date,
	"vigente_auto" integer DEFAULT 1 NOT NULL,
	"estado" "estado_matriz_iperc" DEFAULT 'borrador' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"alcance" text,
	"metodologia" text DEFAULT 'GTC-45' NOT NULL,
	"observaciones" text,
	"aprobado_por" text,
	"aprobado_por_id" varchar,
	"cargo_aprobador" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "participantes_revision" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"revision_id" varchar NOT NULL,
	"company_id" varchar NOT NULL,
	"user_id" varchar,
	"nombre" text NOT NULL,
	"cargo" text NOT NULL,
	"tipo" "tipo_participante_revision" NOT NULL,
	"asistio" integer DEFAULT 1 NOT NULL,
	"observaciones" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_sources" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"subscription_id" varchar NOT NULL,
	"wompi_payment_source_id" integer NOT NULL,
	"wompi_token" text,
	"type" "payment_source_type" NOT NULL,
	"status" "payment_source_status" DEFAULT 'available' NOT NULL,
	"card_brand" text,
	"card_last_four" text,
	"card_expiry_month" integer,
	"card_expiry_year" integer,
	"card_holder_name" text,
	"account_holder_name" text,
	"customer_email" text NOT NULL,
	"is_default" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_transactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"subscription_id" varchar NOT NULL,
	"payment_source_id" varchar,
	"wompi_transaction_id" text,
	"wompi_reference" text NOT NULL,
	"type" "transaction_type" NOT NULL,
	"status" "transaction_status" DEFAULT 'PENDING' NOT NULL,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'COP' NOT NULL,
	"period_start" timestamp,
	"period_end" timestamp,
	"wompi_payment_method" text,
	"wompi_status_message" text,
	"wompi_error_code" text,
	"description" text,
	"receipt_url" text,
	"invoice_id" varchar,
	"paid_at" timestamp,
	"failed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payment_transactions_wompi_transaction_id_unique" UNIQUE("wompi_transaction_id"),
	CONSTRAINT "payment_transactions_wompi_reference_unique" UNIQUE("wompi_reference")
);
--> statement-breakpoint
CREATE TABLE "peligros_iperc" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"matriz_id" varchar NOT NULL,
	"clasificacion" "clasificacion_peligro" NOT NULL,
	"subclasificacion" text,
	"descripcion_peligro" text NOT NULL,
	"fuente_generadora" text NOT NULL,
	"actividad_proceso" text NOT NULL,
	"ubicacion" text,
	"numero_personas_expuestas" integer NOT NULL,
	"tipo_exposicion" text,
	"tiempo_exposicion" text,
	"efectos_posibles" text NOT NULL,
	"parte_cuerpo_afectada" text,
	"nivel_probabilidad" "nivel_probabilidad" NOT NULL,
	"nivel_severidad" "nivel_severidad" NOT NULL,
	"valor_riesgo" integer NOT NULL,
	"nivel_riesgo" "nivel_riesgo" NOT NULL,
	"controles_existentes" text,
	"efectividad_controles_existentes" text,
	"requiere_controles" integer DEFAULT 1 NOT NULL,
	"controles_propuestos" text,
	"tipo_control_principal" "tipo_control",
	"tipo_control_secundario" "tipo_control",
	"responsable_implementacion" text,
	"responsable_implementacion_id" varchar,
	"fecha_implementacion_propuesta" date,
	"estado_implementacion" text DEFAULT 'pendiente',
	"fecha_implementacion_real" date,
	"nivel_probabilidad_residual" "nivel_probabilidad",
	"nivel_severidad_residual" "nivel_severidad",
	"valor_riesgo_residual" integer,
	"nivel_riesgo_residual" "nivel_riesgo",
	"observaciones" text,
	"requiere_seguimiento" integer DEFAULT 1 NOT NULL,
	"proxima_revision" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "peligros_trabajadores_asignacion" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"peligro_id" varchar NOT NULL,
	"department" text,
	"position" text,
	"asignado_por" varchar,
	"fecha_asignacion" timestamp DEFAULT now() NOT NULL,
	"activo" integer DEFAULT 1 NOT NULL,
	"observaciones" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plan_change_history" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" varchar NOT NULL,
	"company_id" varchar NOT NULL,
	"old_plan_id" varchar NOT NULL,
	"new_plan_id" varchar NOT NULL,
	"billing_interval" "billing_interval" NOT NULL,
	"billing_cycle_days" integer DEFAULT 30 NOT NULL,
	"prorated_credit" integer DEFAULT 0 NOT NULL,
	"amount_charged" integer DEFAULT 0 NOT NULL,
	"wompi_transaction_id" varchar,
	"change_type" "plan_change_type" NOT NULL,
	"status" "plan_change_status" DEFAULT 'pending_payment' NOT NULL,
	"validation_warnings" text[] DEFAULT '{}',
	"requested_by" varchar,
	"requested_by_role" "user_role",
	"is_admin_override" integer DEFAULT 0,
	"ip_address" text,
	"user_agent" text,
	"metadata" jsonb,
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"effective_date" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plan_comunicacion_sst" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"version" text DEFAULT '1.0' NOT NULL,
	"fecha_elaboracion" date NOT NULL,
	"fecha_revision" date,
	"elaborado_por" varchar NOT NULL,
	"aprobado_por" varchar,
	"objetivo_general" text NOT NULL,
	"objetivos_especificos" text[],
	"alcance" text NOT NULL,
	"publicos_objetivo" text[],
	"medios_comunicacion" text[],
	"frecuencia_reuniones" text,
	"responsable_comunicacion_interna" varchar,
	"responsable_comunicacion_externa" varchar,
	"responsable_comunicacion_contratistas" varchar,
	"indicadores" text[],
	"metas_indicadores" text[],
	"estado" text DEFAULT 'vigente' NOT NULL,
	"observaciones" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "planes_accion_auditoria" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"hallazgo_id" varchar NOT NULL,
	"numero_accion" text NOT NULL,
	"tipo_accion" text NOT NULL,
	"descripcion_accion" text NOT NULL,
	"justificacion" text,
	"responsable" text NOT NULL,
	"responsable_id" varchar,
	"fecha_compromiso" date NOT NULL,
	"fecha_implementacion" date,
	"estado" "plan_accion_estado" DEFAULT 'abierto' NOT NULL,
	"porcentaje_avance" integer DEFAULT 0,
	"observaciones_avance" text,
	"requiere_verificacion" integer DEFAULT 1,
	"fecha_verificacion" date,
	"verificado_por" text,
	"verificado_por_id" varchar,
	"resultado_verificacion" text,
	"eficaz" integer,
	"recursos_necesarios" text,
	"presupuesto_estimado" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reportes_trabajadores" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"codigo" text NOT NULL,
	"reportado_por" varchar,
	"worker_id" varchar,
	"nombre_reportante" text,
	"departamento" text,
	"es_anonimo" integer DEFAULT 0 NOT NULL,
	"categoria" "categoria_reporte" NOT NULL,
	"prioridad" "prioridad_reporte" DEFAULT 'media' NOT NULL,
	"asunto" text NOT NULL,
	"descripcion" text NOT NULL,
	"ubicacion" text,
	"archivos_adjuntos" text[],
	"estado" "estado_reporte" DEFAULT 'pendiente' NOT NULL,
	"asignado_a" varchar,
	"fecha_asignacion" timestamp,
	"respuesta" text,
	"acciones_tomadas" text,
	"fecha_respuesta" timestamp,
	"respondido_por" varchar,
	"fecha_cierre" timestamp,
	"motivo_cierre" text,
	"notificar_email" integer DEFAULT 1 NOT NULL,
	"email_contacto" text,
	"tiempo_respuesta_dias" integer,
	"satisfaccion_reportante" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "reportes_trabajadores_codigo_unique" UNIQUE("codigo")
);
--> statement-breakpoint
CREATE TABLE "revisiones_direccion" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"codigo" text NOT NULL,
	"fecha_revision" date NOT NULL,
	"periodicidad" text NOT NULL,
	"titulo" text NOT NULL,
	"estado" "estado_revision_direccion" DEFAULT 'programada' NOT NULL,
	"lugar" text,
	"duracion" integer,
	"antecedentes" text,
	"resumen_ejecutivo" text,
	"conclusiones" text,
	"aprobado_por" varchar,
	"fecha_aprobacion" date,
	"proxima_revision" date,
	"creado_por" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "revisiones_direccion_codigo_unique" UNIQUE("codigo")
);
--> statement-breakpoint
CREATE TABLE "subscription_plans" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"description" text,
	"price_monthly" integer NOT NULL,
	"price_yearly" integer,
	"currency" text DEFAULT 'COP' NOT NULL,
	"max_workers" integer DEFAULT 50 NOT NULL,
	"max_users" integer DEFAULT 3 NOT NULL,
	"max_companies" integer DEFAULT 1 NOT NULL,
	"features" text[],
	"trial_days" integer DEFAULT 14,
	"status" "plan_status" DEFAULT 'active' NOT NULL,
	"is_popular" integer DEFAULT 0,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"plan_id" varchar NOT NULL,
	"status" "subscription_status" DEFAULT 'trial' NOT NULL,
	"billing_interval" "billing_interval" DEFAULT 'monthly' NOT NULL,
	"current_period_start" timestamp DEFAULT now() NOT NULL,
	"current_period_end" timestamp NOT NULL,
	"trial_start" timestamp,
	"trial_end" timestamp,
	"cancel_at_period_end" integer DEFAULT 0,
	"canceled_at" timestamp,
	"cancellation_reason" text,
	"last_payment_date" timestamp,
	"next_payment_date" timestamp,
	"failed_payment_attempts" integer DEFAULT 0,
	"metadata" jsonb,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_company_id_unique" UNIQUE("company_id")
);
--> statement-breakpoint
CREATE TABLE "temas_revision" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"revision_id" varchar NOT NULL,
	"company_id" varchar NOT NULL,
	"tipo" "tipo_tema_revision" NOT NULL,
	"titulo" text NOT NULL,
	"descripcion" text NOT NULL,
	"datos_analisis" text,
	"hallazgos" text,
	"oportunidades_mejora" text,
	"orden" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accidents" ADD COLUMN "body_part_affected" text;--> statement-breakpoint
ALTER TABLE "accidents" ADD COLUMN "injury_nature" text;--> statement-breakpoint
ALTER TABLE "accidents" ADD COLUMN "medical_diagnosis" text;--> statement-breakpoint
ALTER TABLE "accidents" ADD COLUMN "ips_name" text;--> statement-breakpoint
ALTER TABLE "accidents" ADD COLUMN "accident_mechanism" text;--> statement-breakpoint
ALTER TABLE "accidents" ADD COLUMN "causative_agent" text;--> statement-breakpoint
ALTER TABLE "accidents" ADD COLUMN "journey_type" "journey_type";--> statement-breakpoint
ALTER TABLE "accidents" ADD COLUMN "accident_classification" "accident_classification";--> statement-breakpoint
ALTER TABLE "accidents" ADD COLUMN "was_hospitalized" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "accidents" ADD COLUMN "er_referral" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "occupational_diseases" ADD COLUMN "symptoms" text;--> statement-breakpoint
ALTER TABLE "occupational_diseases" ADD COLUMN "years_of_exposure" integer;--> statement-breakpoint
ALTER TABLE "occupational_diseases" ADD COLUMN "detailed_risk_agent" text;--> statement-breakpoint
ALTER TABLE "occupational_diseases" ADD COLUMN "ips_name" text;--> statement-breakpoint
ALTER TABLE "occupational_diseases" ADD COLUMN "diagnostic_tests" text;--> statement-breakpoint
ALTER TABLE "occupational_diseases" ADD COLUMN "work_area_exposure" text;--> statement-breakpoint
ALTER TABLE "occupational_diseases" ADD COLUMN "protective_equipment" text;--> statement-breakpoint
ALTER TABLE "occupational_diseases" ADD COLUMN "was_hospitalized" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "occupational_diseases" ADD COLUMN "incapacity_days" integer;--> statement-breakpoint
ALTER TABLE "occupational_diseases" ADD COLUMN "preventive_measures" text;--> statement-breakpoint
ALTER TABLE "occupational_diseases" ADD COLUMN "arl_code" text;--> statement-breakpoint
ALTER TABLE "occupational_diseases" ADD COLUMN "eps_code" text;--> statement-breakpoint
ALTER TABLE "planes_trabajo_anual" ADD COLUMN "matriz_iperc_id" varchar;--> statement-breakpoint
ALTER TABLE "acciones_revision" ADD CONSTRAINT "acciones_revision_decision_id_decisiones_revision_id_fk" FOREIGN KEY ("decision_id") REFERENCES "public"."decisiones_revision"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "acciones_revision" ADD CONSTRAINT "acciones_revision_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "acciones_revision" ADD CONSTRAINT "acciones_revision_responsable_users_id_fk" FOREIGN KEY ("responsable") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "acciones_revision" ADD CONSTRAINT "acciones_revision_verificado_por_users_id_fk" FOREIGN KEY ("verificado_por") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arco_requests" ADD CONSTRAINT "arco_requests_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arco_requests" ADD CONSTRAINT "arco_requests_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arco_requests" ADD CONSTRAINT "arco_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arco_requests" ADD CONSTRAINT "arco_requests_representative_verified_by_users_id_fk" FOREIGN KEY ("representative_verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arco_requests" ADD CONSTRAINT "arco_requests_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arco_requests" ADD CONSTRAINT "arco_requests_escalated_to_users_id_fk" FOREIGN KEY ("escalated_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arco_requests" ADD CONSTRAINT "arco_requests_intake_recorded_by_users_id_fk" FOREIGN KEY ("intake_recorded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arco_requests" ADD CONSTRAINT "arco_requests_response_provided_by_users_id_fk" FOREIGN KEY ("response_provided_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auditoria_auditores" ADD CONSTRAINT "auditoria_auditores_auditoria_id_auditorias_internas_id_fk" FOREIGN KEY ("auditoria_id") REFERENCES "public"."auditorias_internas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auditoria_auditores" ADD CONSTRAINT "auditoria_auditores_auditor_id_users_id_fk" FOREIGN KEY ("auditor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auditoria_checklists" ADD CONSTRAINT "auditoria_checklists_auditoria_id_auditorias_internas_id_fk" FOREIGN KEY ("auditoria_id") REFERENCES "public"."auditorias_internas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auditoria_checklists" ADD CONSTRAINT "auditoria_checklists_evaluado_por_id_users_id_fk" FOREIGN KEY ("evaluado_por_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auditorias_internas" ADD CONSTRAINT "auditorias_internas_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auditorias_internas" ADD CONSTRAINT "auditorias_internas_auditorista_lider_id_users_id_fk" FOREIGN KEY ("auditorista_lider_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auditorias_internas" ADD CONSTRAINT "auditorias_internas_responsable_auditado_id_users_id_fk" FOREIGN KEY ("responsable_auditado_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auditorias_internas" ADD CONSTRAINT "auditorias_internas_aprobado_por_id_users_id_fk" FOREIGN KEY ("aprobado_por_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comunicaciones_sst" ADD CONSTRAINT "comunicaciones_sst_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comunicaciones_sst" ADD CONSTRAINT "comunicaciones_sst_enviado_por_users_id_fk" FOREIGN KEY ("enviado_por") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_revoked_by_users_id_fk" FOREIGN KEY ("revoked_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_recorded_by_users_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decisiones_revision" ADD CONSTRAINT "decisiones_revision_revision_id_revisiones_direccion_id_fk" FOREIGN KEY ("revision_id") REFERENCES "public"."revisiones_direccion"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decisiones_revision" ADD CONSTRAINT "decisiones_revision_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hallazgos_auditoria" ADD CONSTRAINT "hallazgos_auditoria_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hallazgos_auditoria" ADD CONSTRAINT "hallazgos_auditoria_auditoria_id_auditorias_internas_id_fk" FOREIGN KEY ("auditoria_id") REFERENCES "public"."auditorias_internas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hallazgos_auditoria" ADD CONSTRAINT "hallazgos_auditoria_detectado_por_id_users_id_fk" FOREIGN KEY ("detectado_por_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hallazgos_auditoria" ADD CONSTRAINT "hallazgos_auditoria_responsable_area_id_users_id_fk" FOREIGN KEY ("responsable_area_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hallazgos_auditoria" ADD CONSTRAINT "hallazgos_auditoria_verificado_por_id_users_id_fk" FOREIGN KEY ("verificado_por_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "historial_comunicaciones_sst" ADD CONSTRAINT "historial_comunicaciones_sst_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "historial_comunicaciones_sst" ADD CONSTRAINT "historial_comunicaciones_sst_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspecciones_peligros_vinculados" ADD CONSTRAINT "inspecciones_peligros_vinculados_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspecciones_peligros_vinculados" ADD CONSTRAINT "inspecciones_peligros_vinculados_inspeccion_id_inspections_id_fk" FOREIGN KEY ("inspeccion_id") REFERENCES "public"."inspections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspecciones_peligros_vinculados" ADD CONSTRAINT "inspecciones_peligros_vinculados_peligro_id_peligros_iperc_id_fk" FOREIGN KEY ("peligro_id") REFERENCES "public"."peligros_iperc"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspecciones_peligros_vinculados" ADD CONSTRAINT "inspecciones_peligros_vinculados_verificado_por_users_id_fk" FOREIGN KEY ("verificado_por") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_transaction_id_payment_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."payment_transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lecturas_comunicacion" ADD CONSTRAINT "lecturas_comunicacion_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lecturas_comunicacion" ADD CONSTRAINT "lecturas_comunicacion_comunicacion_id_comunicaciones_sst_id_fk" FOREIGN KEY ("comunicacion_id") REFERENCES "public"."comunicaciones_sst"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lecturas_comunicacion" ADD CONSTRAINT "lecturas_comunicacion_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lecturas_comunicacion" ADD CONSTRAINT "lecturas_comunicacion_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matrices_iperc" ADD CONSTRAINT "matrices_iperc_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matrices_iperc" ADD CONSTRAINT "matrices_iperc_responsable_evaluacion_id_users_id_fk" FOREIGN KEY ("responsable_evaluacion_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matrices_iperc" ADD CONSTRAINT "matrices_iperc_aprobado_por_id_users_id_fk" FOREIGN KEY ("aprobado_por_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participantes_revision" ADD CONSTRAINT "participantes_revision_revision_id_revisiones_direccion_id_fk" FOREIGN KEY ("revision_id") REFERENCES "public"."revisiones_direccion"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participantes_revision" ADD CONSTRAINT "participantes_revision_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participantes_revision" ADD CONSTRAINT "participantes_revision_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_sources" ADD CONSTRAINT "payment_sources_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_sources" ADD CONSTRAINT "payment_sources_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_payment_source_id_payment_sources_id_fk" FOREIGN KEY ("payment_source_id") REFERENCES "public"."payment_sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "peligros_iperc" ADD CONSTRAINT "peligros_iperc_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "peligros_iperc" ADD CONSTRAINT "peligros_iperc_matriz_id_matrices_iperc_id_fk" FOREIGN KEY ("matriz_id") REFERENCES "public"."matrices_iperc"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "peligros_iperc" ADD CONSTRAINT "peligros_iperc_responsable_implementacion_id_users_id_fk" FOREIGN KEY ("responsable_implementacion_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "peligros_trabajadores_asignacion" ADD CONSTRAINT "peligros_trabajadores_asignacion_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "peligros_trabajadores_asignacion" ADD CONSTRAINT "peligros_trabajadores_asignacion_peligro_id_peligros_iperc_id_fk" FOREIGN KEY ("peligro_id") REFERENCES "public"."peligros_iperc"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "peligros_trabajadores_asignacion" ADD CONSTRAINT "peligros_trabajadores_asignacion_asignado_por_users_id_fk" FOREIGN KEY ("asignado_por") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_change_history" ADD CONSTRAINT "plan_change_history_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_change_history" ADD CONSTRAINT "plan_change_history_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_change_history" ADD CONSTRAINT "plan_change_history_old_plan_id_subscription_plans_id_fk" FOREIGN KEY ("old_plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_change_history" ADD CONSTRAINT "plan_change_history_new_plan_id_subscription_plans_id_fk" FOREIGN KEY ("new_plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_change_history" ADD CONSTRAINT "plan_change_history_wompi_transaction_id_payment_transactions_id_fk" FOREIGN KEY ("wompi_transaction_id") REFERENCES "public"."payment_transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_change_history" ADD CONSTRAINT "plan_change_history_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_comunicacion_sst" ADD CONSTRAINT "plan_comunicacion_sst_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_comunicacion_sst" ADD CONSTRAINT "plan_comunicacion_sst_elaborado_por_users_id_fk" FOREIGN KEY ("elaborado_por") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_comunicacion_sst" ADD CONSTRAINT "plan_comunicacion_sst_aprobado_por_users_id_fk" FOREIGN KEY ("aprobado_por") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_comunicacion_sst" ADD CONSTRAINT "plan_comunicacion_sst_responsable_comunicacion_interna_users_id_fk" FOREIGN KEY ("responsable_comunicacion_interna") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_comunicacion_sst" ADD CONSTRAINT "plan_comunicacion_sst_responsable_comunicacion_externa_users_id_fk" FOREIGN KEY ("responsable_comunicacion_externa") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_comunicacion_sst" ADD CONSTRAINT "plan_comunicacion_sst_responsable_comunicacion_contratistas_users_id_fk" FOREIGN KEY ("responsable_comunicacion_contratistas") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planes_accion_auditoria" ADD CONSTRAINT "planes_accion_auditoria_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planes_accion_auditoria" ADD CONSTRAINT "planes_accion_auditoria_hallazgo_id_hallazgos_auditoria_id_fk" FOREIGN KEY ("hallazgo_id") REFERENCES "public"."hallazgos_auditoria"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planes_accion_auditoria" ADD CONSTRAINT "planes_accion_auditoria_responsable_id_users_id_fk" FOREIGN KEY ("responsable_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planes_accion_auditoria" ADD CONSTRAINT "planes_accion_auditoria_verificado_por_id_users_id_fk" FOREIGN KEY ("verificado_por_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reportes_trabajadores" ADD CONSTRAINT "reportes_trabajadores_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reportes_trabajadores" ADD CONSTRAINT "reportes_trabajadores_reportado_por_users_id_fk" FOREIGN KEY ("reportado_por") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reportes_trabajadores" ADD CONSTRAINT "reportes_trabajadores_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reportes_trabajadores" ADD CONSTRAINT "reportes_trabajadores_asignado_a_users_id_fk" FOREIGN KEY ("asignado_a") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reportes_trabajadores" ADD CONSTRAINT "reportes_trabajadores_respondido_por_users_id_fk" FOREIGN KEY ("respondido_por") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revisiones_direccion" ADD CONSTRAINT "revisiones_direccion_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revisiones_direccion" ADD CONSTRAINT "revisiones_direccion_aprobado_por_users_id_fk" FOREIGN KEY ("aprobado_por") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revisiones_direccion" ADD CONSTRAINT "revisiones_direccion_creado_por_users_id_fk" FOREIGN KEY ("creado_por") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "temas_revision" ADD CONSTRAINT "temas_revision_revision_id_revisiones_direccion_id_fk" FOREIGN KEY ("revision_id") REFERENCES "public"."revisiones_direccion"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "temas_revision" ADD CONSTRAINT "temas_revision_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planes_trabajo_anual" ADD CONSTRAINT "planes_trabajo_anual_matriz_iperc_id_matrices_iperc_id_fk" FOREIGN KEY ("matriz_iperc_id") REFERENCES "public"."matrices_iperc"("id") ON DELETE no action ON UPDATE no action;