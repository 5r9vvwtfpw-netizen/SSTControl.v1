CREATE TYPE "public"."capacitacion_asistente_estado" AS ENUM('invitado', 'confirmado', 'asistio', 'ausente', 'excusado');--> statement-breakpoint
CREATE TYPE "public"."capacitacion_categoria" AS ENUM('seguridad', 'salud', 'emergencias', 'normatividad', 'especializadas');--> statement-breakpoint
CREATE TYPE "public"."capacitacion_evento_estado" AS ENUM('programado', 'en_curso', 'completado', 'cancelado', 'reprogramado');--> statement-breakpoint
CREATE TYPE "public"."capacitacion_nivel" AS ENUM('basico', 'intermedio', 'avanzado');--> statement-breakpoint
CREATE TYPE "public"."document_category" AS ENUM('politica', 'procedimiento', 'formato', 'registro', 'manual', 'plan', 'matriz', 'acta', 'informe', 'certificado', 'contrato', 'normativa', 'capacitacion', 'otro');--> statement-breakpoint
CREATE TYPE "public"."document_status" AS ENUM('borrador', 'en_revision', 'vigente', 'obsoleto', 'archivado', 'eliminado');--> statement-breakpoint
CREATE TYPE "public"."estado_plan_emergencia" AS ENUM('borrador', 'vigente', 'en_revision', 'obsoleto');--> statement-breakpoint
CREATE TYPE "public"."estado_recomendacion" AS ENUM('pendiente', 'en_proceso', 'implementada', 'verificada', 'cerrada', 'rechazada');--> statement-breakpoint
CREATE TYPE "public"."estado_recurso_emergencia" AS ENUM('operativo', 'requiere_mantenimiento', 'vencido', 'fuera_servicio');--> statement-breakpoint
CREATE TYPE "public"."estado_simulacro" AS ENUM('programado', 'en_ejecucion', 'completado', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."message_priority" AS ENUM('normal', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."message_status" AS ENUM('unread', 'read', 'archived');--> statement-breakpoint
CREATE TYPE "public"."nivel_probabilidad_amenaza" AS ENUM('improbable', 'posible', 'ocasional', 'frecuente');--> statement-breakpoint
CREATE TYPE "public"."nivel_severidad_amenaza" AS ENUM('leve', 'moderado', 'severo', 'catastrofico');--> statement-breakpoint
CREATE TYPE "public"."origen_recomendacion" AS ENUM('arl', 'ministerio_trabajo', 'eps', 'afp', 'secretaria_salud', 'otro');--> statement-breakpoint
CREATE TYPE "public"."provider_access_reason" AS ENUM('soporte_tecnico', 'mantenimiento', 'auditoria_interna', 'verificacion_datos', 'configuracion', 'capacitacion', 'migracion', 'backup', 'otro');--> statement-breakpoint
CREATE TYPE "public"."rol_brigada" AS ENUM('jefe_brigada', 'subjefe', 'brigadista', 'coordinador_zona');--> statement-breakpoint
CREATE TYPE "public"."sst_standard_reference" AS ENUM('1.1.1', '1.1.2', '1.1.3', '1.1.4', '1.1.5', '1.1.6', '1.1.7', '1.1.8', '1.2.1', '1.2.2', '1.2.3', '2.1.1', '2.2.1', '2.3.1', '2.4.1', '2.5.1', '2.6.1', '2.7.1', '2.8.1', '2.9.1', '2.10.1', '2.11.1', '3.1.1', '3.1.2', '3.1.3', '3.1.4', '3.1.5', '3.1.6', '3.1.7', '3.1.8', '3.1.9', '3.2.1', '3.2.2', '3.2.3', '3.3.1', '3.3.2', '3.3.3', '3.3.4', '3.3.5', '3.3.6', '4.1.1', '4.1.2', '4.1.3', '4.1.4', '4.2.1', '4.2.2', '4.2.3', '4.2.4', '4.2.5', '4.2.6', '5.1.1', '5.1.2', '6.1.1', '6.1.2', '6.1.3', '6.1.4', '7.1.1', '7.1.2', '7.1.3', '7.1.4');--> statement-breakpoint
CREATE TYPE "public"."support_access_event_type" AS ENUM('request_created', 'notification_sent', 'client_viewed', 'approved', 'denied', 'access_started', 'access_ended', 'data_accessed', 'data_modified', 'revoked', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."support_access_scope" AS ENUM('read_only', 'read_write');--> statement-breakpoint
CREATE TYPE "public"."support_access_status" AS ENUM('pending', 'approved', 'denied', 'expired', 'revoked', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."ticket_category" AS ENUM('soporte_tecnico', 'facturacion', 'nueva_funcionalidad', 'error_bug', 'capacitacion', 'consulta_general');--> statement-breakpoint
CREATE TYPE "public"."ticket_priority" AS ENUM('baja', 'media', 'alta', 'critica');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('abierto', 'en_revision', 'en_progreso', 'pendiente_cliente', 'resuelto', 'cerrado');--> statement-breakpoint
CREATE TYPE "public"."tipo_amenaza" AS ENUM('natural', 'tecnologico', 'social', 'sanitario', 'ambiental');--> statement-breakpoint
CREATE TYPE "public"."tipo_brigada" AS ENUM('primeros_auxilios', 'evacuacion', 'control_incendios', 'busqueda_rescate', 'comunicaciones', 'integral');--> statement-breakpoint
CREATE TYPE "public"."tipo_recomendacion" AS ENUM('correctiva', 'preventiva', 'mejora', 'obligatoria');--> statement-breakpoint
CREATE TYPE "public"."tipo_recurso_emergencia" AS ENUM('extintor', 'botiquin', 'camilla', 'dea', 'kit_derrames', 'linterna_emergencia', 'megafono', 'equipo_rescate', 'senalizacion', 'otro');--> statement-breakpoint
CREATE TYPE "public"."tipo_simulacro" AS ENUM('evacuacion', 'incendio', 'sismo', 'derrame_quimico', 'primeros_auxilios', 'confinamiento', 'integral');--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'superadmin' BEFORE 'admin';--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'soporte' BEFORE 'admin';--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'superusuario' BEFORE 'admin';--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'responsable_sst' BEFORE 'coordinador_sst';--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'coordinador_salud' BEFORE 'coordinador_sst';--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'lso' BEFORE 'coordinador_sst';--> statement-breakpoint
CREATE TABLE "amenazas_identificadas" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"analisis_id" varchar NOT NULL,
	"tipo" "tipo_amenaza" NOT NULL,
	"nombre" text NOT NULL,
	"descripcion" text,
	"fuente_amenaza" text,
	"probabilidad" "nivel_probabilidad_amenaza" NOT NULL,
	"severidad" "nivel_severidad_amenaza" NOT NULL,
	"nivel_riesgo" text,
	"valor_riesgo" integer,
	"color_riesgo" text,
	"controles_existentes" text,
	"controles_requeridos" text,
	"peligro_iperc_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analisis_vulnerabilidad" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"plan_emergencia_id" varchar,
	"codigo" text NOT NULL,
	"fecha_analisis" date NOT NULL,
	"realizado_por" text NOT NULL,
	"metodologia" text DEFAULT 'diamante',
	"nivel_vulnerabilidad_personas" text,
	"nivel_vulnerabilidad_recursos" text,
	"nivel_vulnerabilidad_sistemas" text,
	"nivel_riesgo_global" text,
	"conclusiones" text,
	"recomendaciones" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brigadas_emergencia" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"plan_emergencia_id" varchar,
	"nombre" text NOT NULL,
	"tipo" "tipo_brigada" NOT NULL,
	"descripcion" text,
	"funciones_antes" text,
	"funciones_durante" text,
	"funciones_despues" text,
	"equipamiento_asignado" text,
	"activa" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "capacitacion_asistentes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"evento_id" varchar NOT NULL,
	"worker_id" varchar NOT NULL,
	"company_id" varchar NOT NULL,
	"estado" "capacitacion_asistente_estado" DEFAULT 'invitado' NOT NULL,
	"horas_asistidas" integer,
	"calificacion" integer,
	"certificado_url" text,
	"observaciones" text,
	"fecha_confirmacion" timestamp,
	"fecha_asistencia" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "capacitacion_eventos" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"catalogo_id" varchar NOT NULL,
	"codigo_curso" varchar(20) NOT NULL,
	"titulo_curso" text NOT NULL,
	"descripcion_curso" text NOT NULL,
	"duracion_horas" integer NOT NULL,
	"categoria" "capacitacion_categoria" NOT NULL,
	"nivel" "capacitacion_nivel" NOT NULL,
	"obligatoria" boolean NOT NULL,
	"normativa" text,
	"fecha_inicio" date NOT NULL,
	"fecha_fin" date,
	"hora_inicio" text,
	"hora_fin" text,
	"lugar" text,
	"instructor" text,
	"estado" "capacitacion_evento_estado" DEFAULT 'programado' NOT NULL,
	"observaciones" text,
	"archivo_url" text,
	"archivo_nombre" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "capacitaciones_catalogo" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"codigo" varchar(20) NOT NULL,
	"titulo" text NOT NULL,
	"descripcion" text NOT NULL,
	"duracion_horas" integer NOT NULL,
	"validez_meses" integer,
	"categoria" "capacitacion_categoria" NOT NULL,
	"nivel" "capacitacion_nivel" NOT NULL,
	"obligatoria" boolean DEFAULT false NOT NULL,
	"normativa" text,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "capacitaciones_catalogo_codigo_unique" UNIQUE("codigo")
);
--> statement-breakpoint
CREATE TABLE "copasst_candidatos" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"eleccion_id" varchar NOT NULL,
	"worker_id" varchar NOT NULL,
	"fecha_inscripcion" date NOT NULL,
	"propuestas" text,
	"acepta_candidatura" boolean DEFAULT true,
	"estado" text DEFAULT 'inscrito' NOT NULL,
	"votos_obtenidos" integer DEFAULT 0,
	"orden_eleccion" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "copasst_certificados" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"curso_id" varchar NOT NULL,
	"codigo_certificado" text NOT NULL,
	"nombre_completo" text NOT NULL,
	"identificacion" text NOT NULL,
	"titulo_curso" text NOT NULL,
	"duracion_horas" numeric NOT NULL,
	"puntaje_obtenido" integer NOT NULL,
	"puntaje_maximo" integer NOT NULL,
	"fecha_emision" timestamp DEFAULT now() NOT NULL,
	"fecha_vencimiento" timestamp,
	"activo" boolean DEFAULT true,
	"codigo_qr" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "copasst_certificados_codigo_certificado_unique" UNIQUE("codigo_certificado")
);
--> statement-breakpoint
CREATE TABLE "copasst_cursos" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"codigo" text NOT NULL,
	"titulo" text NOT NULL,
	"descripcion" text,
	"imagen_url" text,
	"duracion_minutos" integer DEFAULT 15 NOT NULL,
	"orden_curso" integer DEFAULT 1 NOT NULL,
	"es_obligatorio" boolean DEFAULT true,
	"prerequisito_curso_id" varchar,
	"puntos_completar" integer DEFAULT 100 NOT NULL,
	"activo" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "copasst_cursos_codigo_unique" UNIQUE("codigo")
);
--> statement-breakpoint
CREATE TABLE "copasst_elecciones" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"periodo_id" varchar,
	"fecha_convocatoria" date NOT NULL,
	"fecha_inicio_inscripcion" date NOT NULL,
	"fecha_fin_inscripcion" date NOT NULL,
	"fecha_votacion" date NOT NULL,
	"hora_inicio_votacion" text,
	"hora_fin_votacion" text,
	"estado" text DEFAULT 'convocatoria' NOT NULL,
	"total_trabajadores" integer NOT NULL,
	"principales_requeridos" integer NOT NULL,
	"suplentes_requeridos" integer NOT NULL,
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
CREATE TABLE "copasst_escenario_nodos" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"escenario_id" varchar NOT NULL,
	"tipo" text NOT NULL,
	"titulo" text NOT NULL,
	"contenido_html" text NOT NULL,
	"imagen_url" text,
	"orden" integer DEFAULT 1 NOT NULL,
	"opciones" jsonb,
	"es_correcta" boolean DEFAULT false,
	"puntos_nodo" integer DEFAULT 10 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "copasst_escenario_progreso" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"escenario_id" varchar NOT NULL,
	"nodos_visitados" jsonb DEFAULT '[]',
	"decisiones_tomadas" jsonb DEFAULT '[]',
	"puntos_obtenidos" integer DEFAULT 0 NOT NULL,
	"completado" boolean DEFAULT false,
	"fecha_inicio" timestamp DEFAULT now(),
	"fecha_completado" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "copasst_escenarios" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"codigo" text NOT NULL,
	"titulo" text NOT NULL,
	"descripcion" text NOT NULL,
	"categoria" text NOT NULL,
	"duracion_minutos" integer DEFAULT 15 NOT NULL,
	"puntos_perfecto" integer DEFAULT 100 NOT NULL,
	"imagen_url" text,
	"activo" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "copasst_escenarios_codigo_unique" UNIQUE("codigo")
);
--> statement-breakpoint
CREATE TABLE "copasst_insignias" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"codigo" text NOT NULL,
	"titulo" text NOT NULL,
	"descripcion" text NOT NULL,
	"icono_url" text,
	"icono_lucide" text,
	"categoria" text NOT NULL,
	"condicion" jsonb NOT NULL,
	"puntos_bonus" integer DEFAULT 50 NOT NULL,
	"activo" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "copasst_insignias_codigo_unique" UNIQUE("codigo")
);
--> statement-breakpoint
CREATE TABLE "copasst_insignias_usuario" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"insignia_id" varchar NOT NULL,
	"fecha_desbloqueo" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "copasst_lecciones" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"curso_id" varchar NOT NULL,
	"titulo" text NOT NULL,
	"contenido_html" text NOT NULL,
	"video_url" text,
	"duracion_minutos" integer DEFAULT 5 NOT NULL,
	"orden_leccion" integer DEFAULT 1 NOT NULL,
	"puntos_completar" integer DEFAULT 10 NOT NULL,
	"activo" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "copasst_miembros" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"periodo_id" varchar NOT NULL,
	"worker_id" varchar NOT NULL,
	"tipo_representante" text NOT NULL,
	"rol_miembro" text NOT NULL,
	"cargo" text,
	"votos_obtenidos" integer,
	"fecha_designacion" date NOT NULL,
	"activo" boolean DEFAULT true,
	"capacitado" boolean DEFAULT false,
	"fecha_capacitacion" date,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "copasst_periodos" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"tipo_comite" text NOT NULL,
	"fecha_inicio" date NOT NULL,
	"fecha_fin" date NOT NULL,
	"estado" text DEFAULT 'activo' NOT NULL,
	"acta_constitucion_url" text,
	"resolucion_conformacion_url" text,
	"observaciones" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "copasst_progreso" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"curso_id" varchar NOT NULL,
	"leccion_id" varchar,
	"lecciones_completadas" integer DEFAULT 0 NOT NULL,
	"lecciones_totales" integer DEFAULT 0 NOT NULL,
	"porcentaje_progreso" integer DEFAULT 0 NOT NULL,
	"completado" boolean DEFAULT false,
	"fecha_inicio" timestamp DEFAULT now(),
	"fecha_completado" timestamp,
	"quiz_aprobado" boolean DEFAULT false,
	"quiz_puntaje" integer,
	"quiz_intentos" integer DEFAULT 0 NOT NULL,
	"ultimo_intento_quiz" timestamp,
	"puntos_obtenidos" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "copasst_puntos_mensuales" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"anio" integer NOT NULL,
	"mes" integer NOT NULL,
	"puntos_total" integer DEFAULT 0 NOT NULL,
	"cursos_completados" integer DEFAULT 0 NOT NULL,
	"lecciones_completadas" integer DEFAULT 0 NOT NULL,
	"quizzes_aprobados" integer DEFAULT 0 NOT NULL,
	"insignias_desbloqueadas" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "copasst_quiz_preguntas" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"curso_id" varchar NOT NULL,
	"pregunta" text NOT NULL,
	"tipo_pregunta" text DEFAULT 'seleccion_multiple' NOT NULL,
	"opciones" jsonb NOT NULL,
	"respuesta_correcta" text NOT NULL,
	"explicacion" text,
	"puntos_pregunta" integer DEFAULT 10 NOT NULL,
	"orden_pregunta" integer DEFAULT 1 NOT NULL,
	"activo" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "copasst_rachas_usuario" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"racha_actual" integer DEFAULT 0 NOT NULL,
	"racha_maxima" integer DEFAULT 0 NOT NULL,
	"ultima_actividad" date,
	"puntos_bonus_acumulados" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "copasst_registro_votacion" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"eleccion_id" varchar NOT NULL,
	"worker_id" varchar NOT NULL,
	"fecha_voto" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "detalle_verificacion_sgss" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"verificacion_id" varchar NOT NULL,
	"worker_id" varchar NOT NULL,
	"tipo_trabajador" text DEFAULT 'empleado',
	"verificado_eps" boolean DEFAULT false,
	"verificado_arl" boolean DEFAULT false,
	"verificado_afp" boolean DEFAULT false,
	"verificado_ccf" boolean DEFAULT false,
	"agremiacion_nombre" text,
	"agremiacion_autorizada" boolean DEFAULT false,
	"observaciones" text,
	"cumple" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "high_risk_workers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"worker_id" varchar NOT NULL,
	"actividad_riesgo" text NOT NULL,
	"descripcion_actividad" text,
	"fecha_inicio" date,
	"fecha_fin" date,
	"porcentaje_cotizacion_especial" numeric,
	"ultimo_mes_pagado" text,
	"cumple_cotizacion" boolean DEFAULT false,
	"soporte_pila_url" text,
	"observaciones" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "inspecciones_recursos_emergencia" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recurso_id" varchar NOT NULL,
	"fecha_inspeccion" date NOT NULL,
	"inspector_nombre" text NOT NULL,
	"inspector_cargo" text,
	"estado_encontrado" "estado_recurso_emergencia" NOT NULL,
	"cumple_normativa" integer DEFAULT 1 NOT NULL,
	"checklist_items" jsonb,
	"hallazgos" text,
	"acciones_requeridas" text,
	"fecha_accion_requerida" date,
	"acciones_completadas" integer DEFAULT 0,
	"inspeccion_general_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "internal_messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"sender_id" varchar NOT NULL,
	"sender_name" text NOT NULL,
	"sender_role" "user_role" NOT NULL,
	"receiver_id" varchar NOT NULL,
	"receiver_name" text NOT NULL,
	"receiver_role" "user_role" NOT NULL,
	"subject" text NOT NULL,
	"content" text NOT NULL,
	"status" "message_status" DEFAULT 'unread' NOT NULL,
	"priority" "message_priority" DEFAULT 'normal' NOT NULL,
	"related_entity" text,
	"related_entity_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"read_at" timestamp,
	"archived_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "miembros_brigada" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brigada_id" varchar NOT NULL,
	"worker_id" varchar NOT NULL,
	"rol" "rol_brigada" DEFAULT 'brigadista' NOT NULL,
	"fecha_ingreso" date NOT NULL,
	"fecha_retiro" date,
	"certificado_vigente" integer DEFAULT 0,
	"fecha_ultima_capacitacion" date,
	"fecha_proxima_capacitacion" date,
	"zona_asignada" text,
	"activo" integer DEFAULT 1 NOT NULL,
	"observaciones" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "participantes_simulacro" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"simulacro_id" varchar NOT NULL,
	"worker_id" varchar,
	"nombre_participante" text,
	"tipo_participante" text,
	"rol_simulacro" text,
	"zona_evacuacion" text,
	"cumplio_procedimiento" integer,
	"tiempo_evacuacion" integer,
	"observaciones" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "planes_emergencia" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"codigo" text NOT NULL,
	"nombre" text NOT NULL,
	"version" text DEFAULT '1.0' NOT NULL,
	"estado" "estado_plan_emergencia" DEFAULT 'borrador' NOT NULL,
	"fecha_elaboracion" date NOT NULL,
	"fecha_aprobacion" date,
	"fecha_vigencia" date,
	"fecha_proxima_revision" date,
	"elaborado_por" text,
	"revisado_por" text,
	"aprobado_por" text,
	"alcance" text,
	"objetivo_general" text,
	"objetivos_especificos" text,
	"marco_legal" text,
	"descripcion_instalaciones" text,
	"numero_pisos" integer,
	"area_total" integer,
	"capacidad_maxima_personas" integer,
	"horario_operacion" text,
	"telefono_emergencias" text,
	"contacto_arl" text,
	"contacto_bomberos" text,
	"contacto_policia" text,
	"contacto_ambulancia" text,
	"contacto_defensa_civil" text,
	"notas" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "provider_access_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" varchar NOT NULL,
	"provider_name" text NOT NULL,
	"provider_email" text NOT NULL,
	"provider_role" text NOT NULL,
	"client_company_id" varchar NOT NULL,
	"client_company_name" text NOT NULL,
	"client_company_nit" text,
	"access_reason" "provider_access_reason" NOT NULL,
	"access_description" text NOT NULL,
	"ticket_number" text,
	"access_start" timestamp DEFAULT now() NOT NULL,
	"access_end" timestamp,
	"modules_accessed" text[],
	"actions_performed" text,
	"records_viewed" integer DEFAULT 0,
	"records_modified" integer DEFAULT 0,
	"ip_address" text,
	"user_agent" text,
	"session_id" text,
	"legal_basis" text DEFAULT 'Ley 1581/2012 Art. 17 - Transmisión de datos para soporte técnico',
	"client_notified" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "puntos_encuentro" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"plan_emergencia_id" varchar,
	"codigo" text NOT NULL,
	"nombre" text NOT NULL,
	"descripcion" text,
	"ubicacion" text NOT NULL,
	"coordenadas" text,
	"capacidad_personas" integer,
	"tiene_proteccion" integer DEFAULT 0,
	"es_accesible" integer DEFAULT 1,
	"distancia_salida_principal" integer,
	"responsable_id" varchar,
	"responsable_sustituto_id" varchar,
	"tiene_kit" integer DEFAULT 0,
	"tiene_megafono" integer DEFAULT 0,
	"tiene_listado_personal" integer DEFAULT 0,
	"punto_principal" integer DEFAULT 1,
	"activo" integer DEFAULT 1 NOT NULL,
	"observaciones" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recomendaciones_arl_autoridades" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"codigo" text NOT NULL,
	"origen" "origen_recomendacion" NOT NULL,
	"nombre_entidad" text NOT NULL,
	"numero_documento" text,
	"fecha_documento" date NOT NULL,
	"fecha_recepcion" date NOT NULL,
	"tipo_recomendacion" "tipo_recomendacion" NOT NULL,
	"descripcion" text NOT NULL,
	"fundamento_legal" text,
	"area_afectada" text,
	"fecha_limite" date,
	"dias_plazo" integer,
	"plan_accion" text,
	"responsable" text NOT NULL,
	"recursos" text,
	"presupuesto" integer,
	"estado" "estado_recomendacion" DEFAULT 'pendiente' NOT NULL,
	"porcentaje_avance" integer DEFAULT 0 NOT NULL,
	"fecha_implementacion" date,
	"verificado_por" text,
	"fecha_verificacion" date,
	"evidencia_cumplimiento" text,
	"documento_respuesta" text,
	"observaciones" text,
	"accidente_id" varchar,
	"creado_por" varchar,
	"actualizado_por" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recursos_emergencia" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"codigo" text NOT NULL,
	"tipo" "tipo_recurso_emergencia" NOT NULL,
	"nombre" text NOT NULL,
	"descripcion" text,
	"ubicacion" text NOT NULL,
	"ubicacion_detalle" text,
	"marca" text,
	"modelo" text,
	"capacidad" text,
	"numero_serie" text,
	"fecha_adquisicion" date,
	"fecha_vencimiento" date,
	"fecha_ultima_inspeccion" date,
	"fecha_proxima_inspeccion" date,
	"fecha_ultima_recarga" date,
	"fecha_proxima_recarga" date,
	"estado" "estado_recurso_emergencia" DEFAULT 'operativo' NOT NULL,
	"responsable_area" text,
	"observaciones" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rutas_evacuacion" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"zona_origen_id" varchar,
	"codigo" text NOT NULL,
	"nombre" text NOT NULL,
	"descripcion" text,
	"punto_inicio" text NOT NULL,
	"punto_fin" text NOT NULL,
	"distancia_metros" integer,
	"tiempo_estimado_segundos" integer,
	"tiene_escaleras" integer DEFAULT 0,
	"tiene_rampa" integer DEFAULT 0,
	"ancho_metros" text,
	"iluminacion_emergencia" integer DEFAULT 1,
	"senalizacion_completa" integer DEFAULT 1,
	"ruta_principal" integer DEFAULT 1,
	"activa" integer DEFAULT 1 NOT NULL,
	"observaciones" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seguimiento_recomendaciones" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recomendacion_id" varchar NOT NULL,
	"fecha_seguimiento" date NOT NULL,
	"accion_realizada" text NOT NULL,
	"avance_reportado" integer NOT NULL,
	"observaciones" text,
	"registrado_por" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "simulacros" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"plan_emergencia_id" varchar,
	"codigo" text NOT NULL,
	"nombre" text NOT NULL,
	"tipo" "tipo_simulacro" NOT NULL,
	"descripcion" text,
	"escenario" text,
	"fecha_programada" date NOT NULL,
	"hora_programada" text,
	"duracion_estimada" integer,
	"fecha_ejecucion" date,
	"hora_inicio" text,
	"hora_fin" text,
	"duracion_real" integer,
	"tiempo_evacuacion" integer,
	"numero_participantes" integer,
	"numero_evacuados" integer,
	"estado" "estado_simulacro" DEFAULT 'programado' NOT NULL,
	"avisado" integer DEFAULT 1,
	"coordinador_nombre" text,
	"coordinador_cargo" text,
	"aspectos_positivos" text,
	"aspectos_mejorar" text,
	"lecciones_aprendidas" text,
	"calificacion_general" text,
	"acciones_mejora" text,
	"responsable_seguimiento" text,
	"fecha_seguimiento" date,
	"capacitacion_evento_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sst_document_access_log" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"access_type" text NOT NULL,
	"accessed_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "sst_document_alerts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" varchar NOT NULL,
	"alert_type" text NOT NULL,
	"scheduled_date" timestamp NOT NULL,
	"sent_at" timestamp,
	"recipient_ids" text[] DEFAULT '{}',
	"subject" text,
	"message" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sst_document_versions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" varchar NOT NULL,
	"version_number" text NOT NULL,
	"change_description" text,
	"change_type" text,
	"file_url" text,
	"file_name" text,
	"file_size" integer,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"approved_by" varchar,
	"approved_at" timestamp,
	"previous_status" "document_status",
	"new_status" "document_status"
);
--> statement-breakpoint
CREATE TABLE "sst_documents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" "document_category" NOT NULL,
	"sst_standards" text[] DEFAULT '{}',
	"phva_cycle" text,
	"current_version" text DEFAULT '1.0' NOT NULL,
	"status" "document_status" DEFAULT 'borrador' NOT NULL,
	"file_url" text,
	"file_name" text,
	"file_size" integer,
	"mime_type" text,
	"document_date" timestamp,
	"created_date" timestamp DEFAULT now() NOT NULL,
	"effective_date" timestamp,
	"expiration_date" timestamp,
	"next_review_date" timestamp,
	"retention_years" integer DEFAULT 20 NOT NULL,
	"archive_date" timestamp,
	"delete_after_date" timestamp,
	"prepared_by" varchar,
	"reviewed_by" varchar,
	"approved_by" varchar,
	"approval_date" timestamp,
	"is_confidential" boolean DEFAULT false,
	"access_roles" text[] DEFAULT '{}',
	"auto_alert_days" integer DEFAULT 30,
	"last_alert_sent" timestamp,
	"alert_recipients" text[] DEFAULT '{}',
	"tags" text[] DEFAULT '{}',
	"related_documents" text[] DEFAULT '{}',
	"external_references" text,
	"notes" text,
	"created_by" varchar,
	"updated_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_access_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar NOT NULL,
	"event_type" "support_access_event_type" NOT NULL,
	"actor_id" varchar NOT NULL,
	"actor_name" text NOT NULL,
	"actor_role" text NOT NULL,
	"details" text,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_access_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_number" text NOT NULL,
	"support_user_id" varchar NOT NULL,
	"support_user_name" text NOT NULL,
	"company_id" varchar NOT NULL,
	"company_name" text NOT NULL,
	"status" "support_access_status" DEFAULT 'pending' NOT NULL,
	"justification" text NOT NULL,
	"scope" "support_access_scope" DEFAULT 'read_only' NOT NULL,
	"related_ticket_id" varchar,
	"related_ticket_number" text,
	"approved_by" varchar,
	"approved_by_name" text,
	"approved_at" timestamp,
	"denial_reason" text,
	"requested_duration_minutes" integer DEFAULT 120 NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"revoked_at" timestamp,
	"revoked_reason" text,
	"legal_basis" text DEFAULT 'Prestación de servicios de soporte técnico',
	"data_processing_purpose" text DEFAULT 'Resolución de incidencia técnica',
	CONSTRAINT "support_access_sessions_session_number_unique" UNIQUE("session_number")
);
--> statement-breakpoint
CREATE TABLE "support_tickets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_number" text NOT NULL,
	"company_id" varchar NOT NULL,
	"company_name" text NOT NULL,
	"user_id" varchar NOT NULL,
	"user_name" text NOT NULL,
	"user_email" text,
	"subject" text NOT NULL,
	"description" text NOT NULL,
	"category" "ticket_category" NOT NULL,
	"priority" "ticket_priority" DEFAULT 'media' NOT NULL,
	"status" "ticket_status" DEFAULT 'abierto' NOT NULL,
	"assigned_to" varchar,
	"assigned_to_name" text,
	"attachments" text[],
	"resolution" text,
	"resolved_at" timestamp,
	"resolved_by" varchar,
	"satisfaction_rating" integer,
	"satisfaction_comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"closed_at" timestamp,
	CONSTRAINT "support_tickets_ticket_number_unique" UNIQUE("ticket_number")
);
--> statement-breakpoint
CREATE TABLE "ticket_responses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"user_name" text NOT NULL,
	"user_role" text NOT NULL,
	"is_staff" integer DEFAULT 0 NOT NULL,
	"content" text NOT NULL,
	"attachments" text[],
	"is_internal" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket_status_history" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" varchar NOT NULL,
	"previous_status" "ticket_status",
	"new_status" "ticket_status" NOT NULL,
	"changed_by" varchar NOT NULL,
	"changed_by_name" text NOT NULL,
	"reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verificaciones_muestreo_sgss" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"fecha" date NOT NULL,
	"periodo_verificado" text,
	"total_trabajadores" integer NOT NULL,
	"total_contratistas" integer DEFAULT 0,
	"muestra_requerida" integer NOT NULL,
	"muestra_verificada" integer DEFAULT 0,
	"porcentaje_cumplimiento" integer DEFAULT 0,
	"observaciones" text,
	"pila_file_url" text,
	"verificado_por" varchar,
	"estado" text DEFAULT 'pendiente',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "zonas_evacuacion" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"plan_emergencia_id" varchar,
	"codigo" text NOT NULL,
	"nombre" text NOT NULL,
	"descripcion" text,
	"piso" text,
	"area" text,
	"capacidad_personas" integer,
	"coordinador_id" varchar,
	"coordinador_sustituto_id" varchar,
	"punto_encuentro_id" varchar,
	"instrucciones_evacuacion" text,
	"consideraciones_especiales" text,
	"activa" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pricing_config" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"min_fee_small" numeric(10, 2) NOT NULL,
	"price_1_10" numeric(10, 2) NOT NULL,
	"price_11_49" numeric(10, 2) NOT NULL,
	"price_50_199" numeric(10, 2) NOT NULL,
	"price_200_plus" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'COP' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"valid_from" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pricing_plugin_invoices" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" varchar NOT NULL,
	"customer_id" varchar NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"employee_count_billed" integer NOT NULL,
	"tier" text NOT NULL,
	"monthly_cost" numeric(10, 2) NOT NULL,
	"price_per_license" numeric(10, 2) NOT NULL,
	"minimum_fee" numeric(10, 2) DEFAULT '0' NOT NULL,
	"payment_status" text DEFAULT 'pending' NOT NULL,
	"payment_reference" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pricing_plugin_subscriptions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" varchar NOT NULL,
	"employee_count" integer NOT NULL,
	"pricing_config_id" varchar,
	"tier" text NOT NULL,
	"monthly_cost" numeric(10, 2) NOT NULL,
	"price_per_license" numeric(10, 2) NOT NULL,
	"minimum_fee" numeric(10, 2) DEFAULT '0' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contracts" ALTER COLUMN "salary" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_plans" ALTER COLUMN "trial_days" SET DEFAULT 30;--> statement-breakpoint
ALTER TABLE "temas_revision" ALTER COLUMN "tipo" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "actividades_plan_trabajo" ADD COLUMN "recursos_administrativos" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "actividades_plan_trabajo" ADD COLUMN "recursos_financieros_check" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "actividades_plan_trabajo" ADD COLUMN "ejecutado" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "afiliaciones_ssss" ADD COLUMN "eps_nombre" text;--> statement-breakpoint
ALTER TABLE "afiliaciones_ssss" ADD COLUMN "arl_nombre" text;--> statement-breakpoint
ALTER TABLE "afiliaciones_ssss" ADD COLUMN "afp_nombre" text;--> statement-breakpoint
ALTER TABLE "afiliaciones_ssss" ADD COLUMN "ccf_nombre" text;--> statement-breakpoint
ALTER TABLE "auditorias_internas" ADD COLUMN "planificada_con_copasst" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "auditorias_internas" ADD COLUMN "copasst_acta_id" varchar;--> statement-breakpoint
ALTER TABLE "auditorias_internas" ADD COLUMN "observaciones_copasst" text;--> statement-breakpoint
ALTER TABLE "auditorias_internas" ADD COLUMN "fecha_aprobacion_copasst" date;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "ciiu_code" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "legal_rep_signature_url" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "legal_rep_name" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "legal_rep_id" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "legal_rep_position" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "eps_nombre_empresa" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "arl_nombre_empresa" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "afp_nombre_empresa" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "ccf_nombre_empresa" text;--> statement-breakpoint
ALTER TABLE "copasst_actas" ADD COLUMN "archivo_adjunto_url" text;--> statement-breakpoint
ALTER TABLE "copasst_actas" ADD COLUMN "archivo_adjunto_nombre" text;--> statement-breakpoint
ALTER TABLE "planes_trabajo_anual" ADD COLUMN "elaborado_por_id" varchar;--> statement-breakpoint
ALTER TABLE "planes_trabajo_anual" ADD COLUMN "autorizado_por_id" varchar;--> statement-breakpoint
ALTER TABLE "planes_trabajo_anual" ADD COLUMN "aprobado_por_id" varchar;--> statement-breakpoint
ALTER TABLE "politicas_sst" ADD COLUMN "elaborado_por_id" varchar;--> statement-breakpoint
ALTER TABLE "politicas_sst" ADD COLUMN "autorizado_por_id" varchar;--> statement-breakpoint
ALTER TABLE "politicas_sst" ADD COLUMN "aprobado_por_id" varchar;--> statement-breakpoint
ALTER TABLE "resource_allocations" ADD COLUMN "elaborado_por_id" varchar;--> statement-breakpoint
ALTER TABLE "resource_allocations" ADD COLUMN "autorizado_por_id" varchar;--> statement-breakpoint
ALTER TABLE "resource_allocations" ADD COLUMN "aprobado_por_id" varchar;--> statement-breakpoint
ALTER TABLE "responsible_designations" ADD COLUMN "licencia_sst_numero" text;--> statement-breakpoint
ALTER TABLE "responsible_designations" ADD COLUMN "licencia_sst_vigencia" date;--> statement-breakpoint
ALTER TABLE "responsible_designations" ADD COLUMN "curso_50_horas" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "responsible_designations" ADD COLUMN "curso_50_horas_fecha" date;--> statement-breakpoint
ALTER TABLE "responsible_designations" ADD COLUMN "nivel_formacion" text;--> statement-breakpoint
ALTER TABLE "sst_evaluations" ADD COLUMN "elaborado_por_id" varchar;--> statement-breakpoint
ALTER TABLE "sst_evaluations" ADD COLUMN "autorizado_por_id" varchar;--> statement-breakpoint
ALTER TABLE "sst_evaluations" ADD COLUMN "aprobado_por_id" varchar;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "tagline" text;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "max_sedes" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "storage_gb" integer DEFAULT 5 NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "has_iperc_completo" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "has_auditorias" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "has_pesv" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "has_revision_direccion" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "has_gestion_cambios" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "has_matriz_legal" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "has_objetivos_indicadores" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "has_evaluacion_proveedores" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "has_comunicacion_sst" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "has_adquisiciones_sst" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "has_dashboards_ejecutivos" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "has_pdfs_normativos" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "has_examenes_medicos" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "has_mediciones_ambientales" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "has_sustancias_quimicas" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "has_copasst" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "has_comite_convivencia" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "has_api" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "has_exportacion_masiva" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "has_white_label" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "has_sla" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "has_gerente_cuenta" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "has_consultoria_sst" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "horas_consultoria_mes" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "support_level" text DEFAULT 'email' NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "support_response_time" text DEFAULT '48h' NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "capacitaciones_anuales" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "horas_por_capacitacion" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "is_recommended" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "contract_accepted_at" timestamp;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "contract_terms_version" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "contract_data" jsonb;--> statement-breakpoint
ALTER TABLE "temas_revision" ADD COLUMN "responsable_presentacion" varchar;--> statement-breakpoint
ALTER TABLE "temas_revision" ADD COLUMN "tiempo_asignado" integer;--> statement-breakpoint
ALTER TABLE "temas_revision" ADD COLUMN "conclusiones" text;--> statement-breakpoint
ALTER TABLE "temas_revision" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "support_specialties" text[];--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verification_token" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verification_expires" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_reset_token" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_reset_expires" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "selected_plan" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "trial_ends_at" timestamp;--> statement-breakpoint
ALTER TABLE "workers" ADD COLUMN "eps_nombre" text;--> statement-breakpoint
ALTER TABLE "workers" ADD COLUMN "arl_nombre" text;--> statement-breakpoint
ALTER TABLE "workers" ADD COLUMN "afp_nombre" text;--> statement-breakpoint
ALTER TABLE "workers" ADD COLUMN "ccf_nombre" text;--> statement-breakpoint
ALTER TABLE "amenazas_identificadas" ADD CONSTRAINT "amenazas_identificadas_analisis_id_analisis_vulnerabilidad_id_fk" FOREIGN KEY ("analisis_id") REFERENCES "public"."analisis_vulnerabilidad"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "amenazas_identificadas" ADD CONSTRAINT "amenazas_identificadas_peligro_iperc_id_peligros_iperc_id_fk" FOREIGN KEY ("peligro_iperc_id") REFERENCES "public"."peligros_iperc"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analisis_vulnerabilidad" ADD CONSTRAINT "analisis_vulnerabilidad_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analisis_vulnerabilidad" ADD CONSTRAINT "analisis_vulnerabilidad_plan_emergencia_id_planes_emergencia_id_fk" FOREIGN KEY ("plan_emergencia_id") REFERENCES "public"."planes_emergencia"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brigadas_emergencia" ADD CONSTRAINT "brigadas_emergencia_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brigadas_emergencia" ADD CONSTRAINT "brigadas_emergencia_plan_emergencia_id_planes_emergencia_id_fk" FOREIGN KEY ("plan_emergencia_id") REFERENCES "public"."planes_emergencia"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capacitacion_asistentes" ADD CONSTRAINT "capacitacion_asistentes_evento_id_capacitacion_eventos_id_fk" FOREIGN KEY ("evento_id") REFERENCES "public"."capacitacion_eventos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capacitacion_asistentes" ADD CONSTRAINT "capacitacion_asistentes_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capacitacion_asistentes" ADD CONSTRAINT "capacitacion_asistentes_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capacitacion_eventos" ADD CONSTRAINT "capacitacion_eventos_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capacitacion_eventos" ADD CONSTRAINT "capacitacion_eventos_catalogo_id_capacitaciones_catalogo_id_fk" FOREIGN KEY ("catalogo_id") REFERENCES "public"."capacitaciones_catalogo"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_candidatos" ADD CONSTRAINT "copasst_candidatos_eleccion_id_copasst_elecciones_id_fk" FOREIGN KEY ("eleccion_id") REFERENCES "public"."copasst_elecciones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_candidatos" ADD CONSTRAINT "copasst_candidatos_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_certificados" ADD CONSTRAINT "copasst_certificados_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_certificados" ADD CONSTRAINT "copasst_certificados_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_certificados" ADD CONSTRAINT "copasst_certificados_curso_id_copasst_cursos_id_fk" FOREIGN KEY ("curso_id") REFERENCES "public"."copasst_cursos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_elecciones" ADD CONSTRAINT "copasst_elecciones_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_elecciones" ADD CONSTRAINT "copasst_elecciones_periodo_id_copasst_periodos_id_fk" FOREIGN KEY ("periodo_id") REFERENCES "public"."copasst_periodos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_escenario_nodos" ADD CONSTRAINT "copasst_escenario_nodos_escenario_id_copasst_escenarios_id_fk" FOREIGN KEY ("escenario_id") REFERENCES "public"."copasst_escenarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_escenario_progreso" ADD CONSTRAINT "copasst_escenario_progreso_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_escenario_progreso" ADD CONSTRAINT "copasst_escenario_progreso_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_escenario_progreso" ADD CONSTRAINT "copasst_escenario_progreso_escenario_id_copasst_escenarios_id_fk" FOREIGN KEY ("escenario_id") REFERENCES "public"."copasst_escenarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_insignias_usuario" ADD CONSTRAINT "copasst_insignias_usuario_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_insignias_usuario" ADD CONSTRAINT "copasst_insignias_usuario_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_insignias_usuario" ADD CONSTRAINT "copasst_insignias_usuario_insignia_id_copasst_insignias_id_fk" FOREIGN KEY ("insignia_id") REFERENCES "public"."copasst_insignias"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_lecciones" ADD CONSTRAINT "copasst_lecciones_curso_id_copasst_cursos_id_fk" FOREIGN KEY ("curso_id") REFERENCES "public"."copasst_cursos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_miembros" ADD CONSTRAINT "copasst_miembros_periodo_id_copasst_periodos_id_fk" FOREIGN KEY ("periodo_id") REFERENCES "public"."copasst_periodos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_miembros" ADD CONSTRAINT "copasst_miembros_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_periodos" ADD CONSTRAINT "copasst_periodos_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_progreso" ADD CONSTRAINT "copasst_progreso_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_progreso" ADD CONSTRAINT "copasst_progreso_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_progreso" ADD CONSTRAINT "copasst_progreso_curso_id_copasst_cursos_id_fk" FOREIGN KEY ("curso_id") REFERENCES "public"."copasst_cursos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_progreso" ADD CONSTRAINT "copasst_progreso_leccion_id_copasst_lecciones_id_fk" FOREIGN KEY ("leccion_id") REFERENCES "public"."copasst_lecciones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_puntos_mensuales" ADD CONSTRAINT "copasst_puntos_mensuales_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_puntos_mensuales" ADD CONSTRAINT "copasst_puntos_mensuales_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_quiz_preguntas" ADD CONSTRAINT "copasst_quiz_preguntas_curso_id_copasst_cursos_id_fk" FOREIGN KEY ("curso_id") REFERENCES "public"."copasst_cursos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_rachas_usuario" ADD CONSTRAINT "copasst_rachas_usuario_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_rachas_usuario" ADD CONSTRAINT "copasst_rachas_usuario_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_registro_votacion" ADD CONSTRAINT "copasst_registro_votacion_eleccion_id_copasst_elecciones_id_fk" FOREIGN KEY ("eleccion_id") REFERENCES "public"."copasst_elecciones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copasst_registro_votacion" ADD CONSTRAINT "copasst_registro_votacion_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "detalle_verificacion_sgss" ADD CONSTRAINT "detalle_verificacion_sgss_verificacion_id_verificaciones_muestreo_sgss_id_fk" FOREIGN KEY ("verificacion_id") REFERENCES "public"."verificaciones_muestreo_sgss"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "detalle_verificacion_sgss" ADD CONSTRAINT "detalle_verificacion_sgss_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "high_risk_workers" ADD CONSTRAINT "high_risk_workers_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "high_risk_workers" ADD CONSTRAINT "high_risk_workers_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspecciones_recursos_emergencia" ADD CONSTRAINT "inspecciones_recursos_emergencia_recurso_id_recursos_emergencia_id_fk" FOREIGN KEY ("recurso_id") REFERENCES "public"."recursos_emergencia"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspecciones_recursos_emergencia" ADD CONSTRAINT "inspecciones_recursos_emergencia_inspeccion_general_id_inspections_id_fk" FOREIGN KEY ("inspeccion_general_id") REFERENCES "public"."inspections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internal_messages" ADD CONSTRAINT "internal_messages_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internal_messages" ADD CONSTRAINT "internal_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internal_messages" ADD CONSTRAINT "internal_messages_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "miembros_brigada" ADD CONSTRAINT "miembros_brigada_brigada_id_brigadas_emergencia_id_fk" FOREIGN KEY ("brigada_id") REFERENCES "public"."brigadas_emergencia"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "miembros_brigada" ADD CONSTRAINT "miembros_brigada_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participantes_simulacro" ADD CONSTRAINT "participantes_simulacro_simulacro_id_simulacros_id_fk" FOREIGN KEY ("simulacro_id") REFERENCES "public"."simulacros"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participantes_simulacro" ADD CONSTRAINT "participantes_simulacro_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planes_emergencia" ADD CONSTRAINT "planes_emergencia_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_access_logs" ADD CONSTRAINT "provider_access_logs_provider_id_users_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_access_logs" ADD CONSTRAINT "provider_access_logs_client_company_id_companies_id_fk" FOREIGN KEY ("client_company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "puntos_encuentro" ADD CONSTRAINT "puntos_encuentro_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "puntos_encuentro" ADD CONSTRAINT "puntos_encuentro_plan_emergencia_id_planes_emergencia_id_fk" FOREIGN KEY ("plan_emergencia_id") REFERENCES "public"."planes_emergencia"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "puntos_encuentro" ADD CONSTRAINT "puntos_encuentro_responsable_id_workers_id_fk" FOREIGN KEY ("responsable_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "puntos_encuentro" ADD CONSTRAINT "puntos_encuentro_responsable_sustituto_id_workers_id_fk" FOREIGN KEY ("responsable_sustituto_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recomendaciones_arl_autoridades" ADD CONSTRAINT "recomendaciones_arl_autoridades_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recomendaciones_arl_autoridades" ADD CONSTRAINT "recomendaciones_arl_autoridades_accidente_id_accidents_id_fk" FOREIGN KEY ("accidente_id") REFERENCES "public"."accidents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recomendaciones_arl_autoridades" ADD CONSTRAINT "recomendaciones_arl_autoridades_creado_por_users_id_fk" FOREIGN KEY ("creado_por") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recomendaciones_arl_autoridades" ADD CONSTRAINT "recomendaciones_arl_autoridades_actualizado_por_users_id_fk" FOREIGN KEY ("actualizado_por") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recursos_emergencia" ADD CONSTRAINT "recursos_emergencia_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rutas_evacuacion" ADD CONSTRAINT "rutas_evacuacion_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rutas_evacuacion" ADD CONSTRAINT "rutas_evacuacion_zona_origen_id_zonas_evacuacion_id_fk" FOREIGN KEY ("zona_origen_id") REFERENCES "public"."zonas_evacuacion"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seguimiento_recomendaciones" ADD CONSTRAINT "seguimiento_recomendaciones_recomendacion_id_recomendaciones_arl_autoridades_id_fk" FOREIGN KEY ("recomendacion_id") REFERENCES "public"."recomendaciones_arl_autoridades"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seguimiento_recomendaciones" ADD CONSTRAINT "seguimiento_recomendaciones_registrado_por_users_id_fk" FOREIGN KEY ("registrado_por") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "simulacros" ADD CONSTRAINT "simulacros_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "simulacros" ADD CONSTRAINT "simulacros_plan_emergencia_id_planes_emergencia_id_fk" FOREIGN KEY ("plan_emergencia_id") REFERENCES "public"."planes_emergencia"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "simulacros" ADD CONSTRAINT "simulacros_capacitacion_evento_id_capacitacion_eventos_id_fk" FOREIGN KEY ("capacitacion_evento_id") REFERENCES "public"."capacitacion_eventos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sst_document_access_log" ADD CONSTRAINT "sst_document_access_log_document_id_sst_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."sst_documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sst_document_access_log" ADD CONSTRAINT "sst_document_access_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sst_document_alerts" ADD CONSTRAINT "sst_document_alerts_document_id_sst_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."sst_documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sst_document_versions" ADD CONSTRAINT "sst_document_versions_document_id_sst_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."sst_documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sst_document_versions" ADD CONSTRAINT "sst_document_versions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sst_document_versions" ADD CONSTRAINT "sst_document_versions_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sst_documents" ADD CONSTRAINT "sst_documents_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sst_documents" ADD CONSTRAINT "sst_documents_prepared_by_users_id_fk" FOREIGN KEY ("prepared_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sst_documents" ADD CONSTRAINT "sst_documents_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sst_documents" ADD CONSTRAINT "sst_documents_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sst_documents" ADD CONSTRAINT "sst_documents_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sst_documents" ADD CONSTRAINT "sst_documents_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_access_events" ADD CONSTRAINT "support_access_events_session_id_support_access_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."support_access_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_access_events" ADD CONSTRAINT "support_access_events_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_access_sessions" ADD CONSTRAINT "support_access_sessions_support_user_id_users_id_fk" FOREIGN KEY ("support_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_access_sessions" ADD CONSTRAINT "support_access_sessions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_access_sessions" ADD CONSTRAINT "support_access_sessions_related_ticket_id_support_tickets_id_fk" FOREIGN KEY ("related_ticket_id") REFERENCES "public"."support_tickets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_access_sessions" ADD CONSTRAINT "support_access_sessions_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_responses" ADD CONSTRAINT "ticket_responses_ticket_id_support_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_tickets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_responses" ADD CONSTRAINT "ticket_responses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_status_history" ADD CONSTRAINT "ticket_status_history_ticket_id_support_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_tickets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_status_history" ADD CONSTRAINT "ticket_status_history_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verificaciones_muestreo_sgss" ADD CONSTRAINT "verificaciones_muestreo_sgss_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verificaciones_muestreo_sgss" ADD CONSTRAINT "verificaciones_muestreo_sgss_verificado_por_workers_id_fk" FOREIGN KEY ("verificado_por") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "zonas_evacuacion" ADD CONSTRAINT "zonas_evacuacion_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "zonas_evacuacion" ADD CONSTRAINT "zonas_evacuacion_plan_emergencia_id_planes_emergencia_id_fk" FOREIGN KEY ("plan_emergencia_id") REFERENCES "public"."planes_emergencia"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "zonas_evacuacion" ADD CONSTRAINT "zonas_evacuacion_coordinador_id_workers_id_fk" FOREIGN KEY ("coordinador_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "zonas_evacuacion" ADD CONSTRAINT "zonas_evacuacion_coordinador_sustituto_id_workers_id_fk" FOREIGN KEY ("coordinador_sustituto_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_plugin_invoices" ADD CONSTRAINT "pricing_plugin_invoices_subscription_id_pricing_plugin_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."pricing_plugin_subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_plugin_invoices" ADD CONSTRAINT "pricing_plugin_invoices_customer_id_companies_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_plugin_subscriptions" ADD CONSTRAINT "pricing_plugin_subscriptions_customer_id_companies_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_plugin_subscriptions" ADD CONSTRAINT "pricing_plugin_subscriptions_pricing_config_id_pricing_config_id_fk" FOREIGN KEY ("pricing_config_id") REFERENCES "public"."pricing_config"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auditorias_internas" ADD CONSTRAINT "auditorias_internas_copasst_acta_id_copasst_actas_id_fk" FOREIGN KEY ("copasst_acta_id") REFERENCES "public"."copasst_actas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planes_trabajo_anual" ADD CONSTRAINT "planes_trabajo_anual_elaborado_por_id_workers_id_fk" FOREIGN KEY ("elaborado_por_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planes_trabajo_anual" ADD CONSTRAINT "planes_trabajo_anual_autorizado_por_id_workers_id_fk" FOREIGN KEY ("autorizado_por_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planes_trabajo_anual" ADD CONSTRAINT "planes_trabajo_anual_aprobado_por_id_workers_id_fk" FOREIGN KEY ("aprobado_por_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "politicas_sst" ADD CONSTRAINT "politicas_sst_elaborado_por_id_workers_id_fk" FOREIGN KEY ("elaborado_por_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "politicas_sst" ADD CONSTRAINT "politicas_sst_autorizado_por_id_workers_id_fk" FOREIGN KEY ("autorizado_por_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "politicas_sst" ADD CONSTRAINT "politicas_sst_aprobado_por_id_workers_id_fk" FOREIGN KEY ("aprobado_por_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_allocations" ADD CONSTRAINT "resource_allocations_elaborado_por_id_workers_id_fk" FOREIGN KEY ("elaborado_por_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_allocations" ADD CONSTRAINT "resource_allocations_autorizado_por_id_workers_id_fk" FOREIGN KEY ("autorizado_por_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_allocations" ADD CONSTRAINT "resource_allocations_aprobado_por_id_workers_id_fk" FOREIGN KEY ("aprobado_por_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sst_evaluations" ADD CONSTRAINT "sst_evaluations_elaborado_por_id_workers_id_fk" FOREIGN KEY ("elaborado_por_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sst_evaluations" ADD CONSTRAINT "sst_evaluations_autorizado_por_id_workers_id_fk" FOREIGN KEY ("autorizado_por_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sst_evaluations" ADD CONSTRAINT "sst_evaluations_aprobado_por_id_workers_id_fk" FOREIGN KEY ("aprobado_por_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "temas_revision" ADD CONSTRAINT "temas_revision_responsable_presentacion_users_id_fk" FOREIGN KEY ("responsable_presentacion") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workers" ADD CONSTRAINT "workers_email_unique" UNIQUE("email");