CREATE TYPE "public"."accident_type" AS ENUM('caida', 'golpe', 'corte', 'quemadura', 'intoxicacion', 'electrocucion', 'atrapamiento', 'otro');--> statement-breakpoint
CREATE TYPE "public"."audit_result" AS ENUM('cumple', 'cumple-parcialmente', 'no-cumple');--> statement-breakpoint
CREATE TYPE "public"."audit_status" AS ENUM('programada', 'en-curso', 'completada');--> statement-breakpoint
CREATE TYPE "public"."categoria_cambio" AS ENUM('proceso', 'instalacion', 'equipo', 'organizacional', 'tecnologico', 'legal', 'producto', 'personal', 'otro');--> statement-breakpoint
CREATE TYPE "public"."categoria_norma" AS ENUM('sistema-gestion', 'seguridad-industrial', 'medicina-trabajo', 'higiene-industrial', 'seguridad-vial', 'riesgo-psicosocial', 'emergencias', 'sustancias-quimicas', 'trabajo-alturas', 'espacios-confinados', 'seguridad-electrica', 'prevencion-incendios', 'comites-sst', 'investigacion-incidentes', 'capacitacion', 'otras');--> statement-breakpoint
CREATE TYPE "public"."chapter" AS ENUM('1', '2', '3');--> statement-breakpoint
CREATE TYPE "public"."contract_status_v2" AS ENUM('activo', 'vencido', 'terminado', 'suspendido');--> statement-breakpoint
CREATE TYPE "public"."contract_type" AS ENUM('indefinido', 'temporal', 'obra-labor', 'aprendizaje');--> statement-breakpoint
CREATE TYPE "public"."contract_type_v2" AS ENUM('indefinido', 'fijo', 'obra_labor', 'ocasional', 'aprendizaje', 'servicios');--> statement-breakpoint
CREATE TYPE "public"."designation_status" AS ENUM('activo', 'inactivo');--> statement-breakpoint
CREATE TYPE "public"."disease_status" AS ENUM('activo', 'en-tratamiento', 'recuperado', 'incapacidad');--> statement-breakpoint
CREATE TYPE "public"."driver_status" AS ENUM('activo', 'inactivo', 'suspendido', 'retirado');--> statement-breakpoint
CREATE TYPE "public"."estado_accion" AS ENUM('pendiente', 'en-proceso', 'completada', 'vencida');--> statement-breakpoint
CREATE TYPE "public"."estado_actividad" AS ENUM('pendiente', 'en-proceso', 'completada', 'cancelada', 'reprogramada');--> statement-breakpoint
CREATE TYPE "public"."estado_aprobacion" AS ENUM('pendiente', 'aprobado', 'rechazado', 'requiere_revision');--> statement-breakpoint
CREATE TYPE "public"."estado_cambio" AS ENUM('propuesto', 'en_evaluacion', 'aprobado', 'rechazado', 'en_implementacion', 'implementado', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."estado_control_cambio" AS ENUM('planificado', 'en_implementacion', 'implementado', 'verificado');--> statement-breakpoint
CREATE TYPE "public"."estado_cumplimiento" AS ENUM('cumple', 'cumple-parcialmente', 'no-cumple', 'no-aplica');--> statement-breakpoint
CREATE TYPE "public"."estado_evaluacion" AS ENUM('en-progreso', 'completada', 'enviada');--> statement-breakpoint
CREATE TYPE "public"."estado_evaluacion_proveedor" AS ENUM('pendiente', 'en_proceso', 'completada', 'vencida');--> statement-breakpoint
CREATE TYPE "public"."estado_objetivo" AS ENUM('activo', 'en-revision', 'cumplido', 'no-cumplido', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."estado_plan_trabajo" AS ENUM('borrador', 'aprobado', 'vigente', 'cerrado', 'archivado');--> statement-breakpoint
CREATE TYPE "public"."estado_proveedor" AS ENUM('evaluacion', 'aprobado', 'condicional', 'rechazado', 'inactivo');--> statement-breakpoint
CREATE TYPE "public"."evaluation_status" AS ENUM('en-progreso', 'completada', 'aprobada', 'rechazada');--> statement-breakpoint
CREATE TYPE "public"."frecuencia_indicador" AS ENUM('diaria', 'semanal', 'quincenal', 'mensual', 'bimestral', 'trimestral', 'semestral', 'anual');--> statement-breakpoint
CREATE TYPE "public"."hazard_class" AS ENUM('cancerígena', 'toxicidad_aguda', 'corrosiva', 'inflamable', 'explosiva', 'oxidante', 'irritante', 'sensibilizante', 'mutagena', 'teratogenica', 'otro');--> statement-breakpoint
CREATE TYPE "public"."implement_level" AS ENUM('basico', 'intervencion');--> statement-breakpoint
CREATE TYPE "public"."incident_severity" AS ENUM('solo-danos', 'con-heridos', 'mortal');--> statement-breakpoint
CREATE TYPE "public"."incident_type" AS ENUM('colision', 'volcamiento', 'atropello', 'salida-via', 'choque-objeto', 'otro');--> statement-breakpoint
CREATE TYPE "public"."induction_type" AS ENUM('induccion', 'reinduccion');--> statement-breakpoint
CREATE TYPE "public"."inspection_result" AS ENUM('apto', 'apto-con-observaciones', 'no-apto');--> statement-breakpoint
CREATE TYPE "public"."inspection_status" AS ENUM('aprobada', 'pendiente', 'rechazada');--> statement-breakpoint
CREATE TYPE "public"."license_type" AS ENUM('A1', 'A2', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3');--> statement-breakpoint
CREATE TYPE "public"."measure_status" AS ENUM('pendiente', 'en-progreso', 'completada', 'vencida');--> statement-breakpoint
CREATE TYPE "public"."measurement_status" AS ENUM('conforme', 'no_conforme', 'pendiente_analisis');--> statement-breakpoint
CREATE TYPE "public"."measurement_type" AS ENUM('ruido', 'iluminacion', 'temperatura', 'agentes_quimicos', 'material_particulado', 'vibraciones');--> statement-breakpoint
CREATE TYPE "public"."medical_aptitude" AS ENUM('apto', 'apto_con_restricciones', 'no_apto_temporal', 'no_apto_permanente');--> statement-breakpoint
CREATE TYPE "public"."medical_exam_status" AS ENUM('programado', 'realizado', 'vencido', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."medical_exam_type" AS ENUM('preocupacional', 'periodico', 'cambio_ocupacion', 'post_incapacidad', 'egreso');--> statement-breakpoint
CREATE TYPE "public"."meses" AS ENUM('enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre');--> statement-breakpoint
CREATE TYPE "public"."nivel_aprobador" AS ENUM('coordinador_sst', 'alta_direccion', 'copasst', 'especialista_externo');--> statement-breakpoint
CREATE TYPE "public"."nivel_cumplimiento" AS ENUM('critico', 'moderadamente-aceptable', 'aceptable');--> statement-breakpoint
CREATE TYPE "public"."nivel_impacto" AS ENUM('bajo', 'medio', 'alto', 'critico');--> statement-breakpoint
CREATE TYPE "public"."nivel_riesgo_servicio" AS ENUM('critico', 'alto', 'medio', 'bajo');--> statement-breakpoint
CREATE TYPE "public"."notification_status" AS ENUM('pending', 'sent', 'failed');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('exam_renewal', 'training_renewal');--> statement-breakpoint
CREATE TYPE "public"."phva_cycle" AS ENUM('planear', 'hacer', 'verificar', 'actuar');--> statement-breakpoint
CREATE TYPE "public"."politica_sst_estado" AS ENUM('borrador', 'vigente', 'archivada');--> statement-breakpoint
CREATE TYPE "public"."prioridad_mejora" AS ENUM('baja', 'media', 'alta', 'critica');--> statement-breakpoint
CREATE TYPE "public"."program_training_status" AS ENUM('programada', 'en_curso', 'completada', 'cancelada', 'reprogramada');--> statement-breakpoint
CREATE TYPE "public"."programa_sst" AS ENUM('medicina-preventiva', 'higiene-seguridad', 'riesgo-psicosocial', 'seguridad-vial', 'emergencias', 'vigilancia-epidemiologica', 'capacitacion', 'inspeccion', 'epp', 'comites', 'comunicacion', 'auditoria', 'mejora-continua', 'otro');--> statement-breakpoint
CREATE TYPE "public"."resource_type" AS ENUM('humano', 'fisico', 'financiero');--> statement-breakpoint
CREATE TYPE "public"."risk_level" AS ENUM('I', 'II', 'III', 'IV', 'V');--> statement-breakpoint
CREATE TYPE "public"."severity" AS ENUM('leve', 'grave', 'mortal');--> statement-breakpoint
CREATE TYPE "public"."standard_type" AS ENUM('RES_0312', 'ISO_45001');--> statement-breakpoint
CREATE TYPE "public"."sve_case_status" AS ENUM('normal', 'vigilancia', 'caso_confirmado', 'caso_cerrado');--> statement-breakpoint
CREATE TYPE "public"."sve_evaluation_type" AS ENUM('medica', 'higienica', 'seguimiento', 'inicial');--> statement-breakpoint
CREATE TYPE "public"."sve_program_status" AS ENUM('activo', 'inactivo', 'en_revision');--> statement-breakpoint
CREATE TYPE "public"."sve_risk_type" AS ENUM('biomecanico', 'psicosocial', 'auditivo', 'quimico', 'biologico', 'visual', 'cardiovascular', 'respiratorio');--> statement-breakpoint
CREATE TYPE "public"."tipo_cambio" AS ENUM('interno', 'externo');--> statement-breakpoint
CREATE TYPE "public"."tipo_control_cambio" AS ENUM('eliminacion', 'sustitucion', 'controles_ingenieria', 'controles_administrativos', 'epp', 'capacitacion');--> statement-breakpoint
CREATE TYPE "public"."tipo_empresa_sst" AS ENUM('tipo1', 'tipo2', 'tipo3', 'tipo4');--> statement-breakpoint
CREATE TYPE "public"."tipo_indicador" AS ENUM('estructura', 'proceso', 'resultado');--> statement-breakpoint
CREATE TYPE "public"."tipo_proveedor" AS ENUM('proveedor', 'contratista', 'subcontratista', 'temporal');--> statement-breakpoint
CREATE TYPE "public"."training_frequency" AS ENUM('unica', 'mensual', 'trimestral', 'semestral', 'anual');--> statement-breakpoint
CREATE TYPE "public"."training_modality" AS ENUM('presencial', 'virtual', 'mixta');--> statement-breakpoint
CREATE TYPE "public"."training_program_status" AS ENUM('borrador', 'aprobado', 'en_ejecucion', 'completado', 'cerrado');--> statement-breakpoint
CREATE TYPE "public"."training_status" AS ENUM('programada', 'en-curso', 'completada', 'cancelada');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'coordinador_sst', 'coordinador_rrhh', 'jefe_personal', 'supervisor', 'trabajador');--> statement-breakpoint
CREATE TYPE "public"."vehicle_ownership" AS ENUM('propio', 'arrendado', 'contratado');--> statement-breakpoint
CREATE TYPE "public"."vehicle_status" AS ENUM('activo', 'mantenimiento', 'inactivo', 'dado-de-baja');--> statement-breakpoint
CREATE TYPE "public"."vehicle_type" AS ENUM('automovil', 'camioneta', 'camion', 'motocicleta', 'bus', 'otro');--> statement-breakpoint
CREATE TYPE "public"."worker_status" AS ENUM('activo', 'inactivo', 'retirado');--> statement-breakpoint
CREATE TABLE "accidents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"worker_id" varchar NOT NULL,
	"type" "accident_type" NOT NULL,
	"custom_type" text,
	"description" text NOT NULL,
	"severity" "severity" NOT NULL,
	"date" date NOT NULL,
	"time" text NOT NULL,
	"location" text NOT NULL,
	"witnesses" text,
	"actions_taken" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "acciones_mejora" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"evaluacion_id" varchar NOT NULL,
	"respuesta_estandar_id" varchar,
	"descripcion_accion" text NOT NULL,
	"objetivo" text NOT NULL,
	"tipo_accion" text NOT NULL,
	"prioridad" "prioridad_mejora" DEFAULT 'media' NOT NULL,
	"responsable" text NOT NULL,
	"area_responsable" text,
	"recursos_necesarios" text,
	"presupuesto_estimado" integer,
	"fecha_inicio" date NOT NULL,
	"fecha_compromiso" date NOT NULL,
	"fecha_ejecucion" date,
	"estado" "estado_accion" DEFAULT 'pendiente' NOT NULL,
	"porcentaje_avance" integer DEFAULT 0 NOT NULL,
	"indicador_eficacia" text,
	"resultado_esperado" text,
	"resultado_obtenido" text,
	"eficaz" integer,
	"observaciones" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "actividades_plan_trabajo" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_trabajo_id" varchar NOT NULL,
	"programa" "programa_sst" NOT NULL,
	"programa_otro" text,
	"actividad" text NOT NULL,
	"objetivo" text NOT NULL,
	"meta" text NOT NULL,
	"responsable" text NOT NULL,
	"cargo" text NOT NULL,
	"area_responsable" text,
	"mes" "meses" NOT NULL,
	"trimestre" integer NOT NULL,
	"fecha_inicio" date,
	"fecha_fin" date,
	"recursos_humanos" text,
	"recursos_financieros" integer,
	"recursos_tecnicos" text,
	"indicador" text,
	"meta_indicador" text,
	"valor_indicador" text,
	"estado" "estado_actividad" DEFAULT 'pendiente' NOT NULL,
	"porcentaje_avance" integer DEFAULT 0 NOT NULL,
	"evidencias" text,
	"archivo_url" text,
	"archivo_nombre" text,
	"observaciones" text,
	"fecha_reprogramacion" date,
	"motivo_reprogramacion" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "afiliaciones_ssss" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"worker_id" varchar NOT NULL,
	"fecha" date NOT NULL,
	"eps_file_url" text,
	"arl_file_url" text,
	"pension_file_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aprobaciones_cambios" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"cambio_id" varchar NOT NULL,
	"nivel_aprobacion" "nivel_aprobador" NOT NULL,
	"aprobador" text NOT NULL,
	"cargo" text,
	"estado" "estado_aprobacion" DEFAULT 'pendiente' NOT NULL,
	"fecha_aprobacion" date,
	"comentarios" text,
	"condiciones" text,
	"orden" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cambios_sst" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"codigo" text NOT NULL,
	"titulo" text NOT NULL,
	"descripcion" text NOT NULL,
	"tipo" "tipo_cambio" NOT NULL,
	"categoria" "categoria_cambio" NOT NULL,
	"area_afectada" text NOT NULL,
	"proceso_afectado" text,
	"numero_trabajadores_afectados" integer DEFAULT 0 NOT NULL,
	"justificacion" text NOT NULL,
	"objetivos" text,
	"fecha_propuesta" date NOT NULL,
	"fecha_implementacion_planificada" date,
	"fecha_implementacion_real" date,
	"solicitante" text NOT NULL,
	"responsable_implementacion" text,
	"estado" "estado_cambio" DEFAULT 'propuesto' NOT NULL,
	"nivel_impacto" "nivel_impacto",
	"requiere_actualizacion_matriz_riesgos" integer DEFAULT 0 NOT NULL,
	"requiere_actualizacion_plan_trabajo" integer DEFAULT 0 NOT NULL,
	"requiere_capacitacion" integer DEFAULT 0 NOT NULL,
	"requiere_aprobacion_copasst" integer DEFAULT 0 NOT NULL,
	"observaciones" text,
	"lecciones_aprendidas" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "capacitaciones_cambios" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"cambio_id" varchar NOT NULL,
	"training_id" varchar,
	"tema_capacitacion" text NOT NULL,
	"objetivos" text,
	"duracion_horas" integer DEFAULT 1 NOT NULL,
	"trabajadores_objetivo" text,
	"numero_trabajadores" integer DEFAULT 0 NOT NULL,
	"fecha_programada" date,
	"fecha_realizada" date,
	"instructor" text,
	"completada" integer DEFAULT 0 NOT NULL,
	"porcentaje_asistencia" integer,
	"observaciones" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comite_convivencia_actas" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"fecha" date NOT NULL,
	"numero_acta" text NOT NULL,
	"notas" text,
	"trabajador1_worker_id" varchar,
	"trabajador1_nombre" text,
	"trabajador1_cedula" text,
	"trabajador1_tipo" text,
	"trabajador2_worker_id" varchar,
	"trabajador2_nombre" text,
	"trabajador2_cedula" text,
	"trabajador2_tipo" text,
	"trabajador3_worker_id" varchar,
	"trabajador3_nombre" text,
	"trabajador3_cedula" text,
	"trabajador3_tipo" text,
	"empleador1_worker_id" varchar,
	"empleador1_nombre" text,
	"empleador1_cedula" text,
	"empleador1_tipo" text,
	"empleador2_worker_id" varchar,
	"empleador2_nombre" text,
	"empleador2_cedula" text,
	"empleador2_tipo" text,
	"empleador3_worker_id" varchar,
	"empleador3_nombre" text,
	"empleador3_cedula" text,
	"empleador3_tipo" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"nit" text NOT NULL,
	"address" text,
	"contact_phone" text,
	"contact_email" text,
	"logo_url" text,
	"number_of_workers" integer DEFAULT 1 NOT NULL,
	"risk_level" "risk_level" DEFAULT 'I' NOT NULL,
	"calculated_chapter" "chapter" DEFAULT '1' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "companies_nit_unique" UNIQUE("nit")
);
--> statement-breakpoint
CREATE TABLE "componentes_sst" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"numero" integer NOT NULL,
	"nombre" text NOT NULL,
	"descripcion" text,
	"peso_total" integer NOT NULL,
	"orden" integer NOT NULL,
	CONSTRAINT "componentes_sst_numero_unique" UNIQUE("numero")
);
--> statement-breakpoint
CREATE TABLE "contracts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"worker_id" varchar NOT NULL,
	"identification_number" text,
	"job_profile_id" varchar,
	"contract_type_v2" "contract_type_v2" NOT NULL,
	"contract_number" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"salary" integer NOT NULL,
	"position" text NOT NULL,
	"department" text,
	"work_schedule" text,
	"arl_rate" text,
	"additional_clauses" text,
	"contract_status_v2" "contract_status_v2" DEFAULT 'activo' NOT NULL,
	"termination_date" date,
	"termination_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "contracts_contract_number_unique" UNIQUE("contract_number")
);
--> statement-breakpoint
CREATE TABLE "controles_cambios" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"cambio_id" varchar NOT NULL,
	"evaluacion_id" varchar,
	"descripcion_control" text NOT NULL,
	"tipo_control" "tipo_control_cambio" NOT NULL,
	"responsable" text NOT NULL,
	"fecha_limite" date NOT NULL,
	"fecha_implementacion" date,
	"estado" "estado_control_cambio" DEFAULT 'planificado' NOT NULL,
	"costo_estimado" integer,
	"costo_real" integer,
	"fecha_verificacion" date,
	"verificado_por" text,
	"efectivo" integer,
	"observaciones" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "copasst_actas" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"fecha" date NOT NULL,
	"numero_acta" text NOT NULL,
	"notas" text NOT NULL,
	"presidente_worker_id" varchar,
	"presidente" text,
	"secretaria_worker_id" varchar,
	"secretaria" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "criterios_evaluacion_proveedor" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"nombre" text NOT NULL,
	"descripcion" text,
	"categoria" text NOT NULL,
	"puntaje_maximo" integer DEFAULT 10 NOT NULL,
	"es_obligatorio" integer DEFAULT 1 NOT NULL,
	"orden" integer DEFAULT 0 NOT NULL,
	"activo" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "curso_50_horas" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"archivo_url" text,
	"archivo_nombre" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "datos_calculo_indicadores" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"periodo" text NOT NULL,
	"numero_trabajadores" integer DEFAULT 0 NOT NULL,
	"horas_trabajadas" integer DEFAULT 0 NOT NULL,
	"numero_accidentes" integer DEFAULT 0 NOT NULL,
	"dias_perdidos" integer DEFAULT 0 NOT NULL,
	"dias_ausencia" integer DEFAULT 0 NOT NULL,
	"dias_trabajados" integer DEFAULT 0 NOT NULL,
	"observaciones" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documentos_proveedores" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"proveedor_id" varchar NOT NULL,
	"tipo_documento" text NOT NULL,
	"nombre_documento" text NOT NULL,
	"archivo_url" text NOT NULL,
	"fecha_emision" date,
	"fecha_vencimiento" date,
	"vigente" integer DEFAULT 1 NOT NULL,
	"observaciones" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "drivers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"worker_id" varchar,
	"name" text NOT NULL,
	"identification_number" text NOT NULL,
	"license_number" text NOT NULL,
	"license_type" "license_type" NOT NULL,
	"license_expiry" date NOT NULL,
	"blood_type" text,
	"emergency_contact" text,
	"emergency_phone" text,
	"medical_exam_expiry" date,
	"status" "driver_status" DEFAULT 'activo' NOT NULL,
	"observations" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "drivers_identification_number_unique" UNIQUE("identification_number"),
	CONSTRAINT "drivers_license_number_unique" UNIQUE("license_number")
);
--> statement-breakpoint
CREATE TABLE "email_notifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"worker_id" varchar NOT NULL,
	"type" "notification_type" NOT NULL,
	"reference_id" varchar NOT NULL,
	"scheduled_date" date NOT NULL,
	"sent_date" timestamp,
	"status" "notification_status" DEFAULT 'pending' NOT NULL,
	"recipient_email" text NOT NULL,
	"subject" text NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "environmental_measurements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"measurement_type" "measurement_type" NOT NULL,
	"area" text NOT NULL,
	"measurement_date" date NOT NULL,
	"measured_by" text NOT NULL,
	"value_numeric" text,
	"unit" text,
	"legal_limit" text,
	"equipment" text,
	"calibration_date" date,
	"temperature" text,
	"humidity" text,
	"status" "measurement_status" DEFAULT 'pendiente_analisis' NOT NULL,
	"observations" text,
	"corrective_actions" text,
	"report_url" text,
	"report_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "estandares_sst" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"componente_id" varchar NOT NULL,
	"numero_estandar" text NOT NULL,
	"nombre" text NOT NULL,
	"descripcion" text NOT NULL,
	"marco_legal" text,
	"puntaje_tipo1" integer,
	"puntaje_tipo2" integer,
	"puntaje_tipo3" integer,
	"puntaje_tipo4" integer,
	"criterios_verificacion" text,
	"orden" integer NOT NULL,
	"activo" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "estandares_sst_numero_estandar_unique" UNIQUE("numero_estandar")
);
--> statement-breakpoint
CREATE TABLE "evaluaciones_impacto_cambios" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"cambio_id" varchar NOT NULL,
	"fecha_evaluacion" date NOT NULL,
	"evaluador" text NOT NULL,
	"peligros_identificados" text NOT NULL,
	"numero_peligros_nuevos" integer DEFAULT 0 NOT NULL,
	"nivel_riesgo_resultante" "nivel_impacto" NOT NULL,
	"probabilidad_ocurrencia" integer NOT NULL,
	"severidad_consecuencia" integer NOT NULL,
	"impacto_trabajadores" text,
	"impacto_instalaciones" text,
	"impacto_operaciones" text,
	"impacto_ambiental" text,
	"causas_riesgo" text,
	"requiere_controles" integer DEFAULT 1 NOT NULL,
	"recomendacion_general" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evaluaciones_proveedores" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"proveedor_id" varchar NOT NULL,
	"fecha_evaluacion" date NOT NULL,
	"tipo_evaluacion" text NOT NULL,
	"evaluador" text NOT NULL,
	"puntaje_total" integer DEFAULT 0 NOT NULL,
	"puntaje_maximo" integer DEFAULT 100 NOT NULL,
	"porcentaje_cumplimiento" integer DEFAULT 0 NOT NULL,
	"clasificacion" text,
	"estado" "estado_evaluacion_proveedor" DEFAULT 'pendiente' NOT NULL,
	"aprobado" integer,
	"observaciones" text,
	"recomendaciones" text,
	"plan_mejora" text,
	"fecha_proxima_evaluacion" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evaluaciones_sst" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"anio" integer NOT NULL,
	"mes" integer DEFAULT 12 NOT NULL,
	"tipo_empresa" "tipo_empresa_sst" NOT NULL,
	"estado" "estado_evaluacion" DEFAULT 'en-progreso' NOT NULL,
	"responsable_nombre" text NOT NULL,
	"responsable_cargo" text NOT NULL,
	"responsable_licencia" text,
	"puntaje_total" integer DEFAULT 0 NOT NULL,
	"puntaje_maximo" integer NOT NULL,
	"porcentaje_cumplimiento" integer DEFAULT 0 NOT NULL,
	"nivel_cumplimiento" "nivel_cumplimiento",
	"puntajes_por_componente" text,
	"fecha_evaluacion" date NOT NULL,
	"fecha_envio" date,
	"fecha_limite_plan_mejora" date,
	"observaciones" text,
	"version" integer DEFAULT 1 NOT NULL,
	"evaluacion_anterior_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hazardous_substances" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"commercial_name" text NOT NULL,
	"chemical_name" text,
	"cas_number" text,
	"hazard_class" "hazard_class"[] NOT NULL,
	"storage_location" text NOT NULL,
	"usage_area" text,
	"quantity" text,
	"unit" text,
	"supplier" text,
	"emergency_phone" text,
	"sds_url" text,
	"sds_name" text,
	"sds_update_date" date,
	"control_measures" text,
	"required_ppe" text,
	"is_active" integer DEFAULT 1 NOT NULL,
	"observations" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "indicadores_sst" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"objetivo_id" varchar,
	"tipo" "tipo_indicador" NOT NULL,
	"nombre" text NOT NULL,
	"definicion" text NOT NULL,
	"interpretacion" text NOT NULL,
	"formula" text NOT NULL,
	"fuente_informacion" text NOT NULL,
	"meta" text NOT NULL,
	"valor_meta" integer,
	"unidad_medida" text,
	"frecuencia_medicion" "frecuencia_indicador" NOT NULL,
	"responsables" text NOT NULL,
	"es_calculo_automatico" integer DEFAULT 0 NOT NULL,
	"codigo_calculo" text,
	"normas_relacionadas" text,
	"activo" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inspections" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"area" text NOT NULL,
	"inspector" text NOT NULL,
	"date" date NOT NULL,
	"findings" integer DEFAULT 0 NOT NULL,
	"compliance" integer NOT NULL,
	"observations" text,
	"status" "inspection_status" DEFAULT 'pendiente' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_profiles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"risk_class" "risk_level" NOT NULL,
	"risk_factors" text[],
	"physical_demands" text,
	"mental_demands" text,
	"required_ppe" text[],
	"required_exams" text[],
	"exam_frequency_months" integer,
	"required_trainings" text[],
	"linked_role" "user_role",
	"is_active" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matriz_legal" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"norma" text NOT NULL,
	"fecha_emision" date,
	"entidad_emisora" text,
	"categoria" "categoria_norma" NOT NULL,
	"titulo" text NOT NULL,
	"descripcion" text,
	"articulos_aplicables" text,
	"obligaciones" text NOT NULL,
	"alcance" text,
	"estado_cumplimiento" "estado_cumplimiento" DEFAULT 'no-cumple' NOT NULL,
	"responsable_cumplimiento" text,
	"periodicidad" text,
	"evidencias" text,
	"documento_url" text,
	"documento_nombre" text,
	"fecha_ultima_verificacion" date,
	"fecha_proxima_verificacion" date,
	"observaciones" text,
	"planes_accion" text,
	"validacion_automatica" integer DEFAULT 0 NOT NULL,
	"codigo_validacion" text,
	"estado_automatico" "estado_cumplimiento",
	"ultima_validacion_automatica" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medical_exams" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"worker_id" varchar NOT NULL,
	"job_profile_id" varchar,
	"exam_type" "medical_exam_type" NOT NULL,
	"scheduled_date" date NOT NULL,
	"performed_date" date,
	"medical_center" text,
	"attending_physician" text,
	"aptitude" "medical_aptitude",
	"restrictions" text,
	"recommendations" text,
	"follow_up_date" date,
	"exam_results" text,
	"status" "medical_exam_status" DEFAULT 'programado' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mediciones_indicadores" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"indicador_id" varchar NOT NULL,
	"periodo" text NOT NULL,
	"fecha_medicion" date NOT NULL,
	"valor_medido" text NOT NULL,
	"valor_numero" integer,
	"cumple_meta" integer,
	"desviacion" integer,
	"analisis" text,
	"acciones_correctivas" text,
	"responsable_medicion" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "objetivos_sst" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"nombre" text NOT NULL,
	"descripcion" text NOT NULL,
	"meta" text NOT NULL,
	"valor_meta" integer,
	"area" text,
	"responsable" text NOT NULL,
	"categoria_objetivo" text,
	"alineado_con_norma" text,
	"anio" integer NOT NULL,
	"frecuencia_revision" "frecuencia_indicador" DEFAULT 'trimestral' NOT NULL,
	"estado" "estado_objetivo" DEFAULT 'activo' NOT NULL,
	"fecha_inicio" date NOT NULL,
	"fecha_fin" date NOT NULL,
	"fecha_ultima_revision" date,
	"observaciones" text,
	"planes_accion" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "occupational_diseases" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"worker_id" varchar NOT NULL,
	"disease_name" text NOT NULL,
	"diagnosis" text NOT NULL,
	"diagnosis_date" date NOT NULL,
	"exposure_factor" text,
	"status" "disease_status" DEFAULT 'activo' NOT NULL,
	"treatment" text,
	"follow_up_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pesv_audits" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"audit_date" date NOT NULL,
	"auditor" text NOT NULL,
	"auditor_entity" text,
	"scope" text NOT NULL,
	"step1_leader" integer DEFAULT 0 NOT NULL,
	"step2_committee" integer DEFAULT 0 NOT NULL,
	"step3_policy" integer DEFAULT 0 NOT NULL,
	"step4_leadership" integer DEFAULT 0 NOT NULL,
	"step5_diagnosis" integer DEFAULT 0 NOT NULL,
	"step6_risk_assessment" integer DEFAULT 0 NOT NULL,
	"step7_objectives" integer DEFAULT 0 NOT NULL,
	"step8_critical_risks" integer DEFAULT 0 NOT NULL,
	"step9_annual_plan" integer DEFAULT 0 NOT NULL,
	"step10_training" integer DEFAULT 0 NOT NULL,
	"step11_fatigue" integer DEFAULT 0 NOT NULL,
	"step12_emergency" integer DEFAULT 0 NOT NULL,
	"step13_investigation" integer DEFAULT 0 NOT NULL,
	"step14_safe_roads" integer DEFAULT 0 NOT NULL,
	"step15_driver_selection" integer DEFAULT 0 NOT NULL,
	"step16_vehicle_inspection" integer DEFAULT 0 NOT NULL,
	"step17_maintenance" integer DEFAULT 0 NOT NULL,
	"step18_change_management" integer DEFAULT 0 NOT NULL,
	"step19_procurement" integer DEFAULT 0 NOT NULL,
	"step20_indicators" integer DEFAULT 0 NOT NULL,
	"step21_supervision" integer DEFAULT 0 NOT NULL,
	"step22_audit" integer DEFAULT 0 NOT NULL,
	"step23_improvement" integer DEFAULT 0 NOT NULL,
	"step24_communication" integer DEFAULT 0 NOT NULL,
	"policy_compliance" integer DEFAULT 0 NOT NULL,
	"planning_compliance" integer DEFAULT 0 NOT NULL,
	"implementation_compliance" integer DEFAULT 0 NOT NULL,
	"verification_compliance" integer DEFAULT 0 NOT NULL,
	"improvement_compliance" integer DEFAULT 0 NOT NULL,
	"total_score" integer DEFAULT 0 NOT NULL,
	"compliance_percentage" integer DEFAULT 0 NOT NULL,
	"result" "audit_result" NOT NULL,
	"findings" text,
	"recommendations" text,
	"action_plan" text,
	"status" "audit_status" DEFAULT 'programada' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "planes_trabajo_anual" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"anio" integer NOT NULL,
	"fecha_elaboracion" date NOT NULL,
	"objetivo_general" text NOT NULL,
	"alcance" text NOT NULL,
	"presupuesto_total" integer,
	"presupuesto_ejecutado" integer DEFAULT 0 NOT NULL,
	"estado" "estado_plan_trabajo" DEFAULT 'borrador' NOT NULL,
	"responsable_elaboracion" text NOT NULL,
	"cargo_responsable" text NOT NULL,
	"email_responsable" text,
	"fecha_aprobacion" date,
	"aprobado_por" text,
	"cargo_aprobador" text,
	"observaciones" text,
	"total_actividades" integer DEFAULT 0 NOT NULL,
	"actividades_completadas" integer DEFAULT 0 NOT NULL,
	"porcentaje_cumplimiento" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "politicas_sst" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"codigo" text NOT NULL,
	"version" text DEFAULT '1.0' NOT NULL,
	"fecha_emision" date NOT NULL,
	"fecha_proxima_revision" date NOT NULL,
	"estado" "politica_sst_estado" DEFAULT 'borrador' NOT NULL,
	"declaracion_compromiso" text NOT NULL,
	"objetivos" text NOT NULL,
	"alcance" text NOT NULL,
	"responsabilidades" text NOT NULL,
	"compromisos" text NOT NULL,
	"recursos" text NOT NULL,
	"revision_comunicacion" text NOT NULL,
	"representante_legal" text NOT NULL,
	"cedula_representante" text NOT NULL,
	"responsable_sst" text NOT NULL,
	"licencia_sst" text,
	"fecha_firma" date NOT NULL,
	"comunicada" integer DEFAULT 0 NOT NULL,
	"fecha_comunicacion" date,
	"observaciones" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "preventive_measures" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"responsible" text NOT NULL,
	"due_date" date NOT NULL,
	"status" "measure_status" DEFAULT 'pendiente' NOT NULL,
	"priority" text NOT NULL,
	"related_area" text,
	"completed_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "program_training_attendance" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"training_id" varchar NOT NULL,
	"worker_id" varchar NOT NULL,
	"attended" integer DEFAULT 0 NOT NULL,
	"attendance_time" text,
	"departure_time" text,
	"evaluation_score" integer,
	"passed" integer,
	"certificate_issued" integer DEFAULT 0,
	"certificate_number" text,
	"certificate_date" date,
	"observations" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "program_trainings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"program_id" varchar NOT NULL,
	"topic" text NOT NULL,
	"description" text,
	"training_category" text NOT NULL,
	"is_obligatory" integer DEFAULT 1 NOT NULL,
	"legal_basis" text,
	"scheduled_date" date NOT NULL,
	"scheduled_time" text,
	"duration" integer NOT NULL,
	"frequency" "training_frequency" DEFAULT 'unica' NOT NULL,
	"actual_date" date,
	"actual_time" text,
	"location" text,
	"modality" "training_modality" DEFAULT 'presencial' NOT NULL,
	"instructor" text NOT NULL,
	"instructor_qualifications" text,
	"responsible" text,
	"target_audience" text NOT NULL,
	"estimated_attendees" integer DEFAULT 0 NOT NULL,
	"actual_attendees" integer DEFAULT 0,
	"materials" text,
	"equipment" text,
	"requires_evaluation" integer DEFAULT 1 NOT NULL,
	"evaluation_score" integer,
	"status" "program_training_status" DEFAULT 'programada' NOT NULL,
	"observations" text,
	"attachment_url" text,
	"evidence_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "programas_capacitacion" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"fecha" date NOT NULL,
	"titulo" text NOT NULL,
	"archivo_url" text,
	"archivo_nombre" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proveedores_contratistas" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"razon_social" text NOT NULL,
	"nit" text NOT NULL,
	"tipo_proveedor" "tipo_proveedor" NOT NULL,
	"tipo_servicio" text NOT NULL,
	"nivel_riesgo_servicio" "nivel_riesgo_servicio" DEFAULT 'medio' NOT NULL,
	"representante_legal" text,
	"direccion" text,
	"telefono" text,
	"email" text,
	"ciudad" text,
	"nombre_arl" text,
	"numero_trabajadores" integer DEFAULT 1 NOT NULL,
	"nivel_riesgo_empresa" "risk_level",
	"estado" "estado_proveedor" DEFAULT 'evaluacion' NOT NULL,
	"ultima_calificacion" integer,
	"fecha_ultima_evaluacion" date,
	"fecha_proxima_reevaluacion" date,
	"observaciones" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "registros_induccion" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"worker_id" varchar NOT NULL,
	"tipo" "induction_type" DEFAULT 'induccion' NOT NULL,
	"fecha" date NOT NULL,
	"hora_inicio" text NOT NULL,
	"duracion_minutos" integer,
	"responsable_nombre" text NOT NULL,
	"responsable_licencia" text,
	"eps" text,
	"pension" text,
	"arl" text,
	"evaluacion_sst" text NOT NULL,
	"evaluacion_seccion" text NOT NULL,
	"factores_riesgo" text,
	"evaluacion_maquinas" text NOT NULL,
	"cargo_funcion" text,
	"cargo_objetivo" text,
	"cargo_proceso" text,
	"tiene_experiencia" integer DEFAULT 0 NOT NULL,
	"tiempo_experiencia" text,
	"observaciones_experiencia" text,
	"observaciones" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resource_allocations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"date" date NOT NULL,
	"resource_type" "resource_type" NOT NULL,
	"worker_id" varchar,
	"cargo" text,
	"cedula" text,
	"nombre_completo" text,
	"nombre_equipo" text,
	"objeto" text,
	"num_unidades" integer,
	"serial" text,
	"implementos_nivel" "implement_level",
	"inversion_estimada" text,
	"fecha_desembolso" date,
	"objetivo_general" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "responsible_designations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"worker_id" varchar NOT NULL,
	"job_profile_id" varchar,
	"designation_date" date NOT NULL,
	"position" text NOT NULL,
	"responsibilities" text[] NOT NULL,
	"signature_url" text,
	"status" "designation_status" DEFAULT 'activo' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "respuestas_criterios_proveedor" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"evaluacion_id" varchar NOT NULL,
	"criterio_id" varchar NOT NULL,
	"puntaje_obtenido" integer DEFAULT 0 NOT NULL,
	"cumple" integer DEFAULT 0 NOT NULL,
	"evidencia" text,
	"observaciones" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "respuestas_estandares" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"evaluacion_id" varchar NOT NULL,
	"estandar_id" varchar NOT NULL,
	"cumple" integer NOT NULL,
	"no_aplica" integer DEFAULT 0 NOT NULL,
	"justificacion_no_aplica" text,
	"puntaje_obtenido" integer NOT NULL,
	"puntaje_maximo" integer NOT NULL,
	"evidencias" text,
	"modo_verificacion" text,
	"observaciones" text,
	"hallazgo" text,
	"causa_raiz" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "road_incidents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"vehicle_id" varchar NOT NULL,
	"driver_id" varchar NOT NULL,
	"incident_date" date NOT NULL,
	"incident_time" text NOT NULL,
	"location" text NOT NULL,
	"type" "incident_type" NOT NULL,
	"custom_type" text,
	"severity" "incident_severity" NOT NULL,
	"description" text NOT NULL,
	"weather_conditions" text,
	"road_conditions" text,
	"witnesses" text,
	"authorities_notified" integer DEFAULT 0 NOT NULL,
	"police_report" text,
	"injuries" integer DEFAULT 0 NOT NULL,
	"fatalities" integer DEFAULT 0 NOT NULL,
	"estimated_cost" integer,
	"root_cause" text,
	"corrective_actions" text,
	"preventive_actions" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "road_safety_attendees" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"training_id" varchar NOT NULL,
	"driver_id" varchar NOT NULL,
	"attended" integer DEFAULT 0 NOT NULL,
	"score" integer,
	"certificate" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "road_safety_trainings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"instructor" text,
	"training_date" date NOT NULL,
	"start_time" text,
	"end_time" text,
	"location" text,
	"topics" text,
	"total_attendees" integer DEFAULT 0 NOT NULL,
	"status" "training_status" DEFAULT 'programada' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seguimientos_cambios" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"cambio_id" varchar NOT NULL,
	"fecha_seguimiento" date NOT NULL,
	"responsable" text NOT NULL,
	"tipo_seguimiento" text NOT NULL,
	"controles_efectivos" integer,
	"capacitacion_completada" integer,
	"documentacion_actualizada" integer,
	"incidentes_relacionados" integer DEFAULT 0 NOT NULL,
	"descripcion_incidentes" text,
	"hallazgos" text,
	"no_conformidades" text,
	"mejoras" text,
	"acciones_correctivas" text,
	"plazo_acciones" date,
	"cambio_exitoso" integer,
	"observaciones" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seguimientos_proveedores" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"proveedor_id" varchar NOT NULL,
	"fecha_seguimiento" date NOT NULL,
	"tipo_seguimiento" text NOT NULL,
	"responsable" text NOT NULL,
	"cumple_requisitos" integer,
	"hallazgos" text,
	"no_conformidades" text,
	"acciones_correctivas" text,
	"plazo_implementacion" date,
	"estado_acciones" text,
	"observaciones" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sst_evaluation_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"evaluation_id" varchar NOT NULL,
	"item_id" varchar NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"observations" text,
	"evidence_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sst_evaluations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"standard_type" "standard_type" DEFAULT 'RES_0312' NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"evaluation_date" date NOT NULL,
	"evaluator" text NOT NULL,
	"total_score" integer DEFAULT 0 NOT NULL,
	"max_total_score" integer DEFAULT 100 NOT NULL,
	"compliance_percentage" integer DEFAULT 0 NOT NULL,
	"status" "evaluation_status" DEFAULT 'en-progreso' NOT NULL,
	"observations" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sst_evidence" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"evaluation_item_id" varchar NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"file_type" text,
	"description" text,
	"upload_date" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sst_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"standard_id" varchar NOT NULL,
	"item_number" text NOT NULL,
	"description" text NOT NULL,
	"evaluation_criteria" text NOT NULL,
	"max_score" integer NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sst_standards" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"standard_type" "standard_type" DEFAULT 'RES_0312' NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"phva_cycle" "phva_cycle" NOT NULL,
	"max_score" integer NOT NULL,
	"order" integer NOT NULL,
	"clause_number" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sve_cases" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"program_id" varchar NOT NULL,
	"worker_id" text NOT NULL,
	"evaluation_date" date NOT NULL,
	"evaluation_type" "sve_evaluation_type" NOT NULL,
	"evaluated_by" text NOT NULL,
	"findings" text,
	"results" text,
	"classification" "sve_case_status" DEFAULT 'normal' NOT NULL,
	"recommendations" text,
	"follow_up_date" date,
	"interventions" text,
	"additional_data" text,
	"observations" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sve_programs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"name" text NOT NULL,
	"risk_type" "sve_risk_type" NOT NULL,
	"objective" text NOT NULL,
	"target_population" text NOT NULL,
	"inclusion_criteria" text,
	"exclusion_criteria" text,
	"protocol" text,
	"prevention_activities" text,
	"control_measures" text,
	"responsible_name" text NOT NULL,
	"responsible_position" text,
	"indicators" text,
	"start_date" date NOT NULL,
	"review_date" date,
	"status" "sve_program_status" DEFAULT 'activo' NOT NULL,
	"observations" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trabajadores_alto_riesgo" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"worker_id" varchar NOT NULL,
	"fecha" date NOT NULL,
	"certificado_arl_url" text,
	"observaciones" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "training_attendees" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"training_id" varchar NOT NULL,
	"worker_id" varchar NOT NULL,
	"attended" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "training_programs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"year" integer NOT NULL,
	"title" text NOT NULL,
	"general_objective" text NOT NULL,
	"specific_objectives" text NOT NULL,
	"scope" text NOT NULL,
	"target_population" text NOT NULL,
	"responsible" text NOT NULL,
	"copasst_approval" integer DEFAULT 0,
	"copasst_approval_date" date,
	"human_resources" text,
	"technical_resources" text,
	"financial_budget" integer,
	"methodology" text,
	"status" "training_program_status" DEFAULT 'borrador' NOT NULL,
	"observations" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trainings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"instructor" text,
	"date" date NOT NULL,
	"start_time" text,
	"end_time" text,
	"location" text,
	"total_workers" integer DEFAULT 0 NOT NULL,
	"validity_months" integer,
	"status" "training_status" DEFAULT 'programada' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"role" "user_role" DEFAULT 'trabajador' NOT NULL,
	"full_name" text,
	"email" text,
	"department" text,
	"company_id" varchar,
	"worker_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "vehicle_inspections" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"vehicle_id" varchar NOT NULL,
	"driver_id" varchar NOT NULL,
	"inspection_date" date NOT NULL,
	"inspection_time" text NOT NULL,
	"tires" integer DEFAULT 0 NOT NULL,
	"lights" integer DEFAULT 0 NOT NULL,
	"mirrors" integer DEFAULT 0 NOT NULL,
	"bodywork" integer DEFAULT 0 NOT NULL,
	"seatbelts" integer DEFAULT 0 NOT NULL,
	"horn" integer DEFAULT 0 NOT NULL,
	"windshield" integer DEFAULT 0 NOT NULL,
	"instruments" integer DEFAULT 0 NOT NULL,
	"brakes" integer DEFAULT 0 NOT NULL,
	"steering" integer DEFAULT 0 NOT NULL,
	"suspension" integer DEFAULT 0 NOT NULL,
	"fluids" integer DEFAULT 0 NOT NULL,
	"fire_extinguisher" integer DEFAULT 0 NOT NULL,
	"first_aid_kit" integer DEFAULT 0 NOT NULL,
	"reflective_triangles" integer DEFAULT 0 NOT NULL,
	"safety_vest" integer DEFAULT 0 NOT NULL,
	"result" "inspection_result" NOT NULL,
	"observations" text,
	"corrective_actions" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"plate" text NOT NULL,
	"brand" text NOT NULL,
	"model" text NOT NULL,
	"year" integer NOT NULL,
	"type" "vehicle_type" NOT NULL,
	"ownership" "vehicle_ownership" NOT NULL,
	"capacity" integer,
	"mileage" integer,
	"color" text,
	"vin" text,
	"insurance_policy" text,
	"insurance_expiry" date,
	"soat_expiry" date,
	"technical_review_expiry" date,
	"status" "vehicle_status" DEFAULT 'activo' NOT NULL,
	"observations" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vehicles_plate_unique" UNIQUE("plate")
);
--> statement-breakpoint
CREATE TABLE "workers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"identification_number" text NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"position" text NOT NULL,
	"department" text NOT NULL,
	"contract_type" "contract_type" NOT NULL,
	"contract_number" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"status" "worker_status" DEFAULT 'activo' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "workers_identification_number_unique" UNIQUE("identification_number"),
	CONSTRAINT "workers_contract_number_unique" UNIQUE("contract_number")
);
--> statement-breakpoint
ALTER TABLE "accidents" ADD CONSTRAINT "accidents_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accidents" ADD CONSTRAINT "accidents_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "acciones_mejora" ADD CONSTRAINT "acciones_mejora_evaluacion_id_evaluaciones_sst_id_fk" FOREIGN KEY ("evaluacion_id") REFERENCES "public"."evaluaciones_sst"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "acciones_mejora" ADD CONSTRAINT "acciones_mejora_respuesta_estandar_id_respuestas_estandares_id_fk" FOREIGN KEY ("respuesta_estandar_id") REFERENCES "public"."respuestas_estandares"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actividades_plan_trabajo" ADD CONSTRAINT "actividades_plan_trabajo_plan_trabajo_id_planes_trabajo_anual_id_fk" FOREIGN KEY ("plan_trabajo_id") REFERENCES "public"."planes_trabajo_anual"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "afiliaciones_ssss" ADD CONSTRAINT "afiliaciones_ssss_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "afiliaciones_ssss" ADD CONSTRAINT "afiliaciones_ssss_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aprobaciones_cambios" ADD CONSTRAINT "aprobaciones_cambios_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aprobaciones_cambios" ADD CONSTRAINT "aprobaciones_cambios_cambio_id_cambios_sst_id_fk" FOREIGN KEY ("cambio_id") REFERENCES "public"."cambios_sst"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cambios_sst" ADD CONSTRAINT "cambios_sst_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capacitaciones_cambios" ADD CONSTRAINT "capacitaciones_cambios_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capacitaciones_cambios" ADD CONSTRAINT "capacitaciones_cambios_cambio_id_cambios_sst_id_fk" FOREIGN KEY ("cambio_id") REFERENCES "public"."cambios_sst"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capacitaciones_cambios" ADD CONSTRAINT "capacitaciones_cambios_training_id_trainings_id_fk" FOREIGN KEY ("training_id") REFERENCES "public"."trainings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comite_convivencia_actas" ADD CONSTRAINT "comite_convivencia_actas_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comite_convivencia_actas" ADD CONSTRAINT "comite_convivencia_actas_trabajador1_worker_id_workers_id_fk" FOREIGN KEY ("trabajador1_worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comite_convivencia_actas" ADD CONSTRAINT "comite_convivencia_actas_trabajador2_worker_id_workers_id_fk" FOREIGN KEY ("trabajador2_worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comite_convivencia_actas" ADD CONSTRAINT "comite_convivencia_actas_trabajador3_worker_id_workers_id_fk" FOREIGN KEY ("trabajador3_worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comite_convivencia_actas" ADD CONSTRAINT "comite_convivencia_actas_empleador1_worker_id_workers_id_fk" FOREIGN KEY ("empleador1_worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comite_convivencia_actas" ADD CONSTRAINT "comite_convivencia_actas_empleador2_worker_id_workers_id_fk" FOREIGN KEY ("empleador2_worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comite_convivencia_actas" ADD CONSTRAINT "comite_convivencia_actas_empleador3_worker_id_workers_id_fk" FOREIGN KEY ("empleador3_worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_job_profile_id_job_profiles_id_fk" FOREIGN KEY ("job_profile_id") REFERENCES "public"."job_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "controles_cambios" ADD CONSTRAINT "controles_cambios_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "controles_cambios" ADD CONSTRAINT "controles_cambios_cambio_id_cambios_sst_id_fk" FOREIGN KEY ("cambio_id") REFERENCES "public"."cambios_sst"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "controles_cambios" ADD CONSTRAINT "controles_cambios_evaluacion_id_evaluaciones_impacto_cambios_id_fk" FOREIGN KEY ("evaluacion_id") REFERENCES "public"."evaluaciones_impacto_cambios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_actas" ADD CONSTRAINT "copasst_actas_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_actas" ADD CONSTRAINT "copasst_actas_presidente_worker_id_workers_id_fk" FOREIGN KEY ("presidente_worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_actas" ADD CONSTRAINT "copasst_actas_secretaria_worker_id_workers_id_fk" FOREIGN KEY ("secretaria_worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "criterios_evaluacion_proveedor" ADD CONSTRAINT "criterios_evaluacion_proveedor_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curso_50_horas" ADD CONSTRAINT "curso_50_horas_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "datos_calculo_indicadores" ADD CONSTRAINT "datos_calculo_indicadores_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documentos_proveedores" ADD CONSTRAINT "documentos_proveedores_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documentos_proveedores" ADD CONSTRAINT "documentos_proveedores_proveedor_id_proveedores_contratistas_id_fk" FOREIGN KEY ("proveedor_id") REFERENCES "public"."proveedores_contratistas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_notifications" ADD CONSTRAINT "email_notifications_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_notifications" ADD CONSTRAINT "email_notifications_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "environmental_measurements" ADD CONSTRAINT "environmental_measurements_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "estandares_sst" ADD CONSTRAINT "estandares_sst_componente_id_componentes_sst_id_fk" FOREIGN KEY ("componente_id") REFERENCES "public"."componentes_sst"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluaciones_impacto_cambios" ADD CONSTRAINT "evaluaciones_impacto_cambios_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluaciones_impacto_cambios" ADD CONSTRAINT "evaluaciones_impacto_cambios_cambio_id_cambios_sst_id_fk" FOREIGN KEY ("cambio_id") REFERENCES "public"."cambios_sst"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluaciones_proveedores" ADD CONSTRAINT "evaluaciones_proveedores_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluaciones_proveedores" ADD CONSTRAINT "evaluaciones_proveedores_proveedor_id_proveedores_contratistas_id_fk" FOREIGN KEY ("proveedor_id") REFERENCES "public"."proveedores_contratistas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluaciones_sst" ADD CONSTRAINT "evaluaciones_sst_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hazardous_substances" ADD CONSTRAINT "hazardous_substances_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "indicadores_sst" ADD CONSTRAINT "indicadores_sst_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "indicadores_sst" ADD CONSTRAINT "indicadores_sst_objetivo_id_objetivos_sst_id_fk" FOREIGN KEY ("objetivo_id") REFERENCES "public"."objetivos_sst"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_profiles" ADD CONSTRAINT "job_profiles_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matriz_legal" ADD CONSTRAINT "matriz_legal_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_exams" ADD CONSTRAINT "medical_exams_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_exams" ADD CONSTRAINT "medical_exams_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_exams" ADD CONSTRAINT "medical_exams_job_profile_id_job_profiles_id_fk" FOREIGN KEY ("job_profile_id") REFERENCES "public"."job_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mediciones_indicadores" ADD CONSTRAINT "mediciones_indicadores_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mediciones_indicadores" ADD CONSTRAINT "mediciones_indicadores_indicador_id_indicadores_sst_id_fk" FOREIGN KEY ("indicador_id") REFERENCES "public"."indicadores_sst"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "objetivos_sst" ADD CONSTRAINT "objetivos_sst_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "occupational_diseases" ADD CONSTRAINT "occupational_diseases_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "occupational_diseases" ADD CONSTRAINT "occupational_diseases_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pesv_audits" ADD CONSTRAINT "pesv_audits_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planes_trabajo_anual" ADD CONSTRAINT "planes_trabajo_anual_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "politicas_sst" ADD CONSTRAINT "politicas_sst_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "preventive_measures" ADD CONSTRAINT "preventive_measures_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_training_attendance" ADD CONSTRAINT "program_training_attendance_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_training_attendance" ADD CONSTRAINT "program_training_attendance_training_id_program_trainings_id_fk" FOREIGN KEY ("training_id") REFERENCES "public"."program_trainings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_training_attendance" ADD CONSTRAINT "program_training_attendance_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_trainings" ADD CONSTRAINT "program_trainings_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_trainings" ADD CONSTRAINT "program_trainings_program_id_training_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."training_programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programas_capacitacion" ADD CONSTRAINT "programas_capacitacion_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proveedores_contratistas" ADD CONSTRAINT "proveedores_contratistas_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registros_induccion" ADD CONSTRAINT "registros_induccion_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registros_induccion" ADD CONSTRAINT "registros_induccion_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_allocations" ADD CONSTRAINT "resource_allocations_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_allocations" ADD CONSTRAINT "resource_allocations_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responsible_designations" ADD CONSTRAINT "responsible_designations_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responsible_designations" ADD CONSTRAINT "responsible_designations_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responsible_designations" ADD CONSTRAINT "responsible_designations_job_profile_id_job_profiles_id_fk" FOREIGN KEY ("job_profile_id") REFERENCES "public"."job_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "respuestas_criterios_proveedor" ADD CONSTRAINT "respuestas_criterios_proveedor_evaluacion_id_evaluaciones_proveedores_id_fk" FOREIGN KEY ("evaluacion_id") REFERENCES "public"."evaluaciones_proveedores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "respuestas_criterios_proveedor" ADD CONSTRAINT "respuestas_criterios_proveedor_criterio_id_criterios_evaluacion_proveedor_id_fk" FOREIGN KEY ("criterio_id") REFERENCES "public"."criterios_evaluacion_proveedor"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "respuestas_estandares" ADD CONSTRAINT "respuestas_estandares_evaluacion_id_evaluaciones_sst_id_fk" FOREIGN KEY ("evaluacion_id") REFERENCES "public"."evaluaciones_sst"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "respuestas_estandares" ADD CONSTRAINT "respuestas_estandares_estandar_id_estandares_sst_id_fk" FOREIGN KEY ("estandar_id") REFERENCES "public"."estandares_sst"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "road_incidents" ADD CONSTRAINT "road_incidents_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "road_incidents" ADD CONSTRAINT "road_incidents_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "road_incidents" ADD CONSTRAINT "road_incidents_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "road_safety_attendees" ADD CONSTRAINT "road_safety_attendees_training_id_road_safety_trainings_id_fk" FOREIGN KEY ("training_id") REFERENCES "public"."road_safety_trainings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "road_safety_attendees" ADD CONSTRAINT "road_safety_attendees_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "road_safety_trainings" ADD CONSTRAINT "road_safety_trainings_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seguimientos_cambios" ADD CONSTRAINT "seguimientos_cambios_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seguimientos_cambios" ADD CONSTRAINT "seguimientos_cambios_cambio_id_cambios_sst_id_fk" FOREIGN KEY ("cambio_id") REFERENCES "public"."cambios_sst"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seguimientos_proveedores" ADD CONSTRAINT "seguimientos_proveedores_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seguimientos_proveedores" ADD CONSTRAINT "seguimientos_proveedores_proveedor_id_proveedores_contratistas_id_fk" FOREIGN KEY ("proveedor_id") REFERENCES "public"."proveedores_contratistas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sst_evaluation_items" ADD CONSTRAINT "sst_evaluation_items_evaluation_id_sst_evaluations_id_fk" FOREIGN KEY ("evaluation_id") REFERENCES "public"."sst_evaluations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sst_evaluation_items" ADD CONSTRAINT "sst_evaluation_items_item_id_sst_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."sst_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sst_evaluations" ADD CONSTRAINT "sst_evaluations_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sst_evidence" ADD CONSTRAINT "sst_evidence_evaluation_item_id_sst_evaluation_items_id_fk" FOREIGN KEY ("evaluation_item_id") REFERENCES "public"."sst_evaluation_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sst_items" ADD CONSTRAINT "sst_items_standard_id_sst_standards_id_fk" FOREIGN KEY ("standard_id") REFERENCES "public"."sst_standards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sve_cases" ADD CONSTRAINT "sve_cases_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sve_cases" ADD CONSTRAINT "sve_cases_program_id_sve_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."sve_programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sve_programs" ADD CONSTRAINT "sve_programs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trabajadores_alto_riesgo" ADD CONSTRAINT "trabajadores_alto_riesgo_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trabajadores_alto_riesgo" ADD CONSTRAINT "trabajadores_alto_riesgo_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_attendees" ADD CONSTRAINT "training_attendees_training_id_trainings_id_fk" FOREIGN KEY ("training_id") REFERENCES "public"."trainings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_attendees" ADD CONSTRAINT "training_attendees_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_programs" ADD CONSTRAINT "training_programs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trainings" ADD CONSTRAINT "trainings_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_inspections" ADD CONSTRAINT "vehicle_inspections_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_inspections" ADD CONSTRAINT "vehicle_inspections_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_inspections" ADD CONSTRAINT "vehicle_inspections_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workers" ADD CONSTRAINT "workers_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;