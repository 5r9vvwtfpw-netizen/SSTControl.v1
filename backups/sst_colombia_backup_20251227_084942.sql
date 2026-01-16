--
-- PostgreSQL database dump
--

\restrict ufQitjJWK8VSeqr7OaPIvXWxdSPVW181aJbVhzt1Manrdikil8jiHBqOQqaHv2t

-- Dumped from database version 16.11 (74c6bb6)
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA drizzle;


--
-- Name: stripe; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA stripe;


--
-- Name: accident_classification; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.accident_classification AS ENUM (
    'normal',
    'in_itinere',
    'en_mision'
);


--
-- Name: accident_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.accident_type AS ENUM (
    'caida',
    'golpe',
    'corte',
    'quemadura',
    'intoxicacion',
    'electrocucion',
    'atrapamiento',
    'otro'
);


--
-- Name: activity_frequency; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.activity_frequency AS ENUM (
    'unica',
    'diaria',
    'semanal',
    'quincenal',
    'mensual',
    'trimestral',
    'semestral',
    'anual'
);


--
-- Name: activity_modality; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.activity_modality AS ENUM (
    'presencial',
    'virtual',
    'mixta'
);


--
-- Name: activity_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.activity_type AS ENUM (
    'medicina_trabajo',
    'promocion_prevencion',
    'campana_especial',
    'examen_ocupacional',
    'capacitacion_salud'
);


--
-- Name: arco_request_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.arco_request_status AS ENUM (
    'pendiente',
    'en_proceso',
    'completada',
    'rechazada',
    'parcialmente_completada'
);


--
-- Name: arco_request_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.arco_request_type AS ENUM (
    'acceso',
    'rectificacion',
    'cancelacion',
    'oposicion'
);


--
-- Name: audit_action; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.audit_action AS ENUM (
    'create',
    'update',
    'delete',
    'view',
    'export',
    'access_report'
);


--
-- Name: audit_result; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.audit_result AS ENUM (
    'cumple',
    'cumple-parcialmente',
    'no-cumple'
);


--
-- Name: audit_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.audit_status AS ENUM (
    'programada',
    'en-curso',
    'completada'
);


--
-- Name: auditoria_estado; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.auditoria_estado AS ENUM (
    'programada',
    'en_ejecucion',
    'completada',
    'cerrada'
);


--
-- Name: auditoria_norma; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.auditoria_norma AS ENUM (
    'ISO_45001',
    'res_0312_2019',
    'ambas'
);


--
-- Name: auditoria_tipo; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.auditoria_tipo AS ENUM (
    'interna',
    'externa',
    'seguimiento'
);


--
-- Name: billing_interval; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.billing_interval AS ENUM (
    'monthly',
    'yearly'
);


--
-- Name: capacitacion_asistente_estado; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.capacitacion_asistente_estado AS ENUM (
    'invitado',
    'confirmado',
    'asistio',
    'ausente',
    'excusado'
);


--
-- Name: capacitacion_categoria; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.capacitacion_categoria AS ENUM (
    'seguridad',
    'salud',
    'emergencias',
    'normatividad',
    'especializadas'
);


--
-- Name: capacitacion_evento_estado; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.capacitacion_evento_estado AS ENUM (
    'programado',
    'en_curso',
    'completado',
    'cancelado',
    'reprogramado'
);


--
-- Name: capacitacion_nivel; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.capacitacion_nivel AS ENUM (
    'basico',
    'intermedio',
    'avanzado'
);


--
-- Name: categoria_cambio; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.categoria_cambio AS ENUM (
    'proceso',
    'instalacion',
    'equipo',
    'organizacional',
    'tecnologico',
    'legal',
    'producto',
    'personal',
    'otro'
);


--
-- Name: categoria_item; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.categoria_item AS ENUM (
    'epp',
    'equipos',
    'maquinaria',
    'mobiliario',
    'quimicos',
    'materiales',
    'emergencia',
    'otros'
);


--
-- Name: categoria_norma; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.categoria_norma AS ENUM (
    'sistema-gestion',
    'seguridad-industrial',
    'medicina-trabajo',
    'higiene-industrial',
    'seguridad-vial',
    'riesgo-psicosocial',
    'emergencias',
    'sustancias-quimicas',
    'trabajo-alturas',
    'espacios-confinados',
    'seguridad-electrica',
    'prevencion-incendios',
    'comites-sst',
    'investigacion-incidentes',
    'capacitacion',
    'otras'
);


--
-- Name: categoria_reporte; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.categoria_reporte AS ENUM (
    'peligro',
    'incidente',
    'sugerencia',
    'queja',
    'consulta'
);


--
-- Name: chapter; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.chapter AS ENUM (
    '1',
    '2',
    '3'
);


--
-- Name: clasificacion_peligro; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.clasificacion_peligro AS ENUM (
    'fisico',
    'quimico',
    'biologico',
    'biomecanico',
    'psicosocial',
    'condiciones_seguridad',
    'fenomenos_naturales'
);


--
-- Name: consent_channel; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.consent_channel AS ENUM (
    'web',
    'paper',
    'email',
    'verbal',
    'mobile'
);


--
-- Name: consent_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.consent_status AS ENUM (
    'otorgado',
    'revocado',
    'vencido'
);


--
-- Name: consent_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.consent_type AS ENUM (
    'habeas_data_general',
    'datos_sensibles_salud',
    'datos_biometricos',
    'uso_imagen',
    'transferencia_internacional',
    'marketing'
);


--
-- Name: contenido_induccion_estado; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.contenido_induccion_estado AS ENUM (
    'borrador',
    'publicado',
    'archivado'
);


--
-- Name: contenido_induccion_tipo; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.contenido_induccion_tipo AS ENUM (
    'video',
    'documento',
    'presentacion',
    'texto'
);


--
-- Name: contract_status_v2; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.contract_status_v2 AS ENUM (
    'activo',
    'vencido',
    'terminado',
    'suspendido'
);


--
-- Name: contract_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.contract_type AS ENUM (
    'indefinido',
    'temporal',
    'obra-labor',
    'aprendizaje',
    'fijo'
);


--
-- Name: contract_type_v2; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.contract_type_v2 AS ENUM (
    'indefinido',
    'fijo',
    'obra_labor',
    'ocasional',
    'aprendizaje',
    'servicios'
);


--
-- Name: designation_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.designation_status AS ENUM (
    'activo',
    'inactivo'
);


--
-- Name: device_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.device_type AS ENUM (
    'mobile',
    'desktop',
    'tablet'
);


--
-- Name: disease_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.disease_status AS ENUM (
    'activo',
    'en-tratamiento',
    'recuperado',
    'incapacidad'
);


--
-- Name: document_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.document_category AS ENUM (
    'politica',
    'procedimiento',
    'formato',
    'registro',
    'manual',
    'plan',
    'matriz',
    'acta',
    'informe',
    'certificado',
    'contrato',
    'normativa',
    'capacitacion',
    'otro'
);


--
-- Name: document_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.document_status AS ENUM (
    'borrador',
    'en_revision',
    'vigente',
    'obsoleto',
    'archivado',
    'eliminado'
);


--
-- Name: driver_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.driver_status AS ENUM (
    'activo',
    'inactivo',
    'suspendido',
    'retirado'
);


--
-- Name: estado_accion; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estado_accion AS ENUM (
    'pendiente',
    'en-proceso',
    'completada',
    'vencida'
);


--
-- Name: estado_actividad; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estado_actividad AS ENUM (
    'pendiente',
    'en-proceso',
    'completada',
    'cancelada',
    'reprogramada'
);


--
-- Name: estado_adquisicion; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estado_adquisicion AS ENUM (
    'solicitud',
    'evaluacion',
    'aprobada',
    'rechazada',
    'comprada',
    'recibida',
    'cancelada'
);


--
-- Name: estado_aprobacion; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estado_aprobacion AS ENUM (
    'pendiente',
    'aprobado',
    'rechazado',
    'requiere_revision'
);


--
-- Name: estado_automatizacion; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estado_automatizacion AS ENUM (
    'exito',
    'error',
    'pendiente'
);


--
-- Name: estado_cambio; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estado_cambio AS ENUM (
    'propuesto',
    'en_evaluacion',
    'aprobado',
    'rechazado',
    'en_implementacion',
    'implementado',
    'cancelado'
);


--
-- Name: estado_control_cambio; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estado_control_cambio AS ENUM (
    'planificado',
    'en_implementacion',
    'implementado',
    'verificado'
);


--
-- Name: estado_control_inspeccion; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estado_control_inspeccion AS ENUM (
    'conforme',
    'no-conforme',
    'observacion'
);


--
-- Name: estado_cumplimiento; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estado_cumplimiento AS ENUM (
    'cumple',
    'cumple-parcialmente',
    'no-cumple',
    'no-aplica'
);


--
-- Name: estado_evaluacion; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estado_evaluacion AS ENUM (
    'en-progreso',
    'completada',
    'enviada'
);


--
-- Name: estado_evaluacion_proveedor; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estado_evaluacion_proveedor AS ENUM (
    'pendiente',
    'en_proceso',
    'completada',
    'vencida'
);


--
-- Name: estado_matriz_iperc; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estado_matriz_iperc AS ENUM (
    'borrador',
    'revision',
    'aprobada',
    'vigente',
    'obsoleta'
);


--
-- Name: estado_objetivo; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estado_objetivo AS ENUM (
    'activo',
    'en-revision',
    'cumplido',
    'no-cumplido',
    'cancelado'
);


--
-- Name: estado_plan_trabajo; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estado_plan_trabajo AS ENUM (
    'borrador',
    'aprobado',
    'vigente',
    'cerrado',
    'archivado'
);


--
-- Name: estado_proveedor; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estado_proveedor AS ENUM (
    'evaluacion',
    'aprobado',
    'condicional',
    'rechazado',
    'inactivo'
);


--
-- Name: estado_recomendacion; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estado_recomendacion AS ENUM (
    'pendiente',
    'en_proceso',
    'implementada',
    'verificada',
    'cerrada',
    'rechazada'
);


--
-- Name: estado_reporte; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estado_reporte AS ENUM (
    'pendiente',
    'en_revision',
    'resuelto',
    'cerrado'
);


--
-- Name: estado_revision_direccion; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estado_revision_direccion AS ENUM (
    'programada',
    'en_ejecucion',
    'completada',
    'aprobada',
    'seguimiento'
);


--
-- Name: evaluation_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.evaluation_status AS ENUM (
    'en-progreso',
    'completada',
    'aprobada',
    'rechazada'
);


--
-- Name: evs_control_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.evs_control_category AS ENUM (
    'tabaquismo',
    'alcoholismo',
    'farmacodependencia',
    'habitos_alimenticios',
    'actividad_fisica',
    'salud_mental',
    'riesgo_cardiovascular',
    'otro'
);


--
-- Name: evs_control_result; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.evs_control_result AS ENUM (
    'negativo',
    'positivo',
    'sospechoso',
    'no_realizado',
    'rechazado'
);


--
-- Name: evs_followup_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.evs_followup_status AS ENUM (
    'activo',
    'en_tratamiento',
    'recuperado',
    'abandonado',
    'cerrado'
);


--
-- Name: evs_program_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.evs_program_status AS ENUM (
    'borrador',
    'activo',
    'cerrado',
    'suspendido'
);


--
-- Name: frecuencia_indicador; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.frecuencia_indicador AS ENUM (
    'diaria',
    'semanal',
    'quincenal',
    'mensual',
    'bimestral',
    'trimestral',
    'semestral',
    'anual'
);


--
-- Name: hallazgo_severidad; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.hallazgo_severidad AS ENUM (
    'baja',
    'media',
    'alta',
    'critica'
);


--
-- Name: hallazgo_tipo; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.hallazgo_tipo AS ENUM (
    'conformidad',
    'no_conformidad_menor',
    'no_conformidad_mayor',
    'observacion'
);


--
-- Name: hazard_class; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.hazard_class AS ENUM (
    'cancerígena',
    'toxicidad_aguda',
    'corrosiva',
    'inflamable',
    'explosiva',
    'oxidante',
    'irritante',
    'sensibilizante',
    'mutagena',
    'teratogenica',
    'otro'
);


--
-- Name: implement_level; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.implement_level AS ENUM (
    'basico',
    'intervencion'
);


--
-- Name: incident_severity; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.incident_severity AS ENUM (
    'solo-danos',
    'con-heridos',
    'mortal'
);


--
-- Name: incident_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.incident_type AS ENUM (
    'colision',
    'volcamiento',
    'atropello',
    'salida-via',
    'choque-objeto',
    'otro'
);


--
-- Name: induction_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.induction_type AS ENUM (
    'induccion',
    'reinduccion'
);


--
-- Name: inspection_result; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.inspection_result AS ENUM (
    'apto',
    'apto-con-observaciones',
    'no-apto'
);


--
-- Name: inspection_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.inspection_status AS ENUM (
    'aprobada',
    'pendiente',
    'rechazada'
);


--
-- Name: invoice_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.invoice_status AS ENUM (
    'draft',
    'sent',
    'paid',
    'overdue',
    'canceled'
);


--
-- Name: journey_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.journey_type AS ENUM (
    'ordinaria',
    'extraordinaria'
);


--
-- Name: license_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.license_type AS ENUM (
    'A1',
    'A2',
    'B1',
    'B2',
    'B3',
    'C1',
    'C2',
    'C3'
);


--
-- Name: measure_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.measure_status AS ENUM (
    'pendiente',
    'en-progreso',
    'completada',
    'vencida'
);


--
-- Name: measurement_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.measurement_status AS ENUM (
    'conforme',
    'no_conforme',
    'pendiente_analisis'
);


--
-- Name: measurement_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.measurement_type AS ENUM (
    'ruido',
    'iluminacion',
    'temperatura',
    'agentes_quimicos',
    'material_particulado',
    'vibraciones'
);


--
-- Name: medical_aptitude; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.medical_aptitude AS ENUM (
    'apto',
    'apto_con_restricciones',
    'no_apto_temporal',
    'no_apto_permanente'
);


--
-- Name: medical_exam_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.medical_exam_status AS ENUM (
    'programado',
    'realizado',
    'vencido',
    'cancelado'
);


--
-- Name: medical_exam_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.medical_exam_type AS ENUM (
    'preocupacional',
    'periodico',
    'cambio_ocupacion',
    'post_incapacidad',
    'egreso'
);


--
-- Name: meses; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.meses AS ENUM (
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre'
);


--
-- Name: message_priority; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.message_priority AS ENUM (
    'normal',
    'urgent'
);


--
-- Name: message_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.message_status AS ENUM (
    'unread',
    'read',
    'archived'
);


--
-- Name: modulo_destino_automatizacion; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.modulo_destino_automatizacion AS ENUM (
    'matriz_riesgos',
    'plan_trabajo',
    'capacitaciones',
    'copasst',
    'matriz_legal',
    'politicas',
    'indicadores',
    'notificaciones'
);


--
-- Name: nivel_aprobador; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.nivel_aprobador AS ENUM (
    'coordinador_sst',
    'alta_direccion',
    'copasst',
    'especialista_externo'
);


--
-- Name: nivel_cumplimiento; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.nivel_cumplimiento AS ENUM (
    'critico',
    'moderadamente-aceptable',
    'aceptable'
);


--
-- Name: nivel_impacto; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.nivel_impacto AS ENUM (
    'bajo',
    'medio',
    'alto',
    'critico'
);


--
-- Name: nivel_probabilidad; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.nivel_probabilidad AS ENUM (
    'baja',
    'media',
    'alta',
    'muy_alta'
);


--
-- Name: nivel_riesgo; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.nivel_riesgo AS ENUM (
    'trivial',
    'tolerable',
    'moderado',
    'importante',
    'intolerable'
);


--
-- Name: nivel_riesgo_adquisicion; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.nivel_riesgo_adquisicion AS ENUM (
    'critico',
    'alto',
    'medio',
    'bajo'
);


--
-- Name: nivel_riesgo_servicio; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.nivel_riesgo_servicio AS ENUM (
    'critico',
    'alto',
    'medio',
    'bajo'
);


--
-- Name: nivel_severidad; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.nivel_severidad AS ENUM (
    'ligeramente_danino',
    'danino',
    'extremadamente_danino'
);


--
-- Name: notification_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.notification_status AS ENUM (
    'pending',
    'sent',
    'failed'
);


--
-- Name: notification_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.notification_type AS ENUM (
    'exam_renewal',
    'training_renewal'
);


--
-- Name: origen_recomendacion; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.origen_recomendacion AS ENUM (
    'arl',
    'ministerio_trabajo',
    'eps',
    'afp',
    'secretaria_salud',
    'otro'
);


--
-- Name: payment_source_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_source_status AS ENUM (
    'available',
    'pending',
    'failed',
    'expired'
);


--
-- Name: payment_source_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_source_type AS ENUM (
    'CARD',
    'NEQUI',
    'BANCOLOMBIA_TRANSFER'
);


--
-- Name: phva_cycle; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.phva_cycle AS ENUM (
    'planear',
    'hacer',
    'verificar',
    'actuar'
);


--
-- Name: plan_accion_estado; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.plan_accion_estado AS ENUM (
    'abierto',
    'en_progreso',
    'completado',
    'verificado',
    'cerrado'
);


--
-- Name: plan_change_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.plan_change_status AS ENUM (
    'pending_payment',
    'completed',
    'failed'
);


--
-- Name: plan_change_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.plan_change_type AS ENUM (
    'upgrade',
    'downgrade',
    'trial_conversion'
);


--
-- Name: plan_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.plan_status AS ENUM (
    'active',
    'archived'
);


--
-- Name: politica_sst_estado; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.politica_sst_estado AS ENUM (
    'borrador',
    'vigente',
    'archivada'
);


--
-- Name: prioridad_mejora; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.prioridad_mejora AS ENUM (
    'baja',
    'media',
    'alta',
    'critica'
);


--
-- Name: prioridad_reporte; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.prioridad_reporte AS ENUM (
    'baja',
    'media',
    'alta',
    'urgente'
);


--
-- Name: program_training_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.program_training_status AS ENUM (
    'programada',
    'en_curso',
    'completada',
    'cancelada',
    'reprogramada'
);


--
-- Name: programa_sst; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.programa_sst AS ENUM (
    'identificacion-peligros',
    'medicina-preventiva',
    'higiene-seguridad',
    'riesgo-psicosocial',
    'seguridad-vial',
    'emergencias',
    'vigilancia-epidemiologica',
    'capacitacion',
    'inspeccion',
    'epp',
    'comites',
    'comunicacion',
    'auditoria',
    'mejora-continua',
    'otro'
);


--
-- Name: provider_access_reason; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.provider_access_reason AS ENUM (
    'soporte_tecnico',
    'mantenimiento',
    'auditoria_interna',
    'verificacion_datos',
    'configuracion',
    'capacitacion',
    'migracion',
    'backup',
    'otro'
);


--
-- Name: publico_objetivo; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.publico_objetivo AS ENUM (
    'todos',
    'trabajadores',
    'contratistas',
    'copasst',
    'alta_direccion',
    'supervisores',
    'area_especifica',
    'nuevos_empleados'
);


--
-- Name: resource_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.resource_type AS ENUM (
    'humano',
    'fisico',
    'financiero'
);


--
-- Name: resultado_evaluacion_adquisicion; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.resultado_evaluacion_adquisicion AS ENUM (
    'aprobado',
    'aprobado_condiciones',
    'requiere_controles',
    'rechazado'
);


--
-- Name: risk_level; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.risk_level AS ENUM (
    'I',
    'II',
    'III',
    'IV',
    'V'
);


--
-- Name: sesion_induccion_estado; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.sesion_induccion_estado AS ENUM (
    'pendiente',
    'en_progreso',
    'completada',
    'expirada'
);


--
-- Name: severity; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.severity AS ENUM (
    'leve',
    'grave',
    'mortal'
);


--
-- Name: sst_license_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.sst_license_status AS ENUM (
    'vigente',
    'vencida',
    'pendiente_verificacion',
    'suspendida'
);


--
-- Name: sst_profession_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.sst_profession_type AS ENUM (
    'medico_ocupacional',
    'profesional_sst',
    'tecnologo_sst',
    'tecnico_sst',
    'fisioterapeuta',
    'psicologo_sst',
    'fonoaudiologo',
    'ingeniero_sst',
    'enfermero_sst',
    'otro'
);


--
-- Name: standard_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.standard_type AS ENUM (
    'RES_0312',
    'ISO_45001'
);


--
-- Name: subscription_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.subscription_status AS ENUM (
    'trial',
    'active',
    'past_due',
    'suspended',
    'canceled',
    'expired'
);


--
-- Name: support_access_event_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.support_access_event_type AS ENUM (
    'request_created',
    'notification_sent',
    'client_viewed',
    'approved',
    'denied',
    'access_started',
    'access_ended',
    'revoked',
    'expired',
    'cancelled',
    'data_accessed',
    'data_modified'
);


--
-- Name: support_access_scope; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.support_access_scope AS ENUM (
    'read_only',
    'read_write'
);


--
-- Name: support_access_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.support_access_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired',
    'revoked',
    'cancelled'
);


--
-- Name: sve_case_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.sve_case_status AS ENUM (
    'normal',
    'vigilancia',
    'caso_confirmado',
    'caso_cerrado'
);


--
-- Name: sve_evaluation_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.sve_evaluation_type AS ENUM (
    'medica',
    'higienica',
    'seguimiento',
    'inicial'
);


--
-- Name: sve_program_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.sve_program_status AS ENUM (
    'activo',
    'inactivo',
    'en_revision'
);


--
-- Name: sve_risk_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.sve_risk_type AS ENUM (
    'biomecanico',
    'psicosocial',
    'auditivo',
    'quimico',
    'biologico',
    'visual',
    'cardiovascular',
    'respiratorio'
);


--
-- Name: ticket_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.ticket_category AS ENUM (
    'soporte_tecnico',
    'facturacion',
    'nueva_funcionalidad',
    'error_bug',
    'capacitacion',
    'consulta_general'
);


--
-- Name: ticket_priority; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.ticket_priority AS ENUM (
    'baja',
    'media',
    'alta',
    'critica'
);


--
-- Name: ticket_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.ticket_status AS ENUM (
    'abierto',
    'en_revision',
    'en_progreso',
    'pendiente_cliente',
    'resuelto',
    'cerrado'
);


--
-- Name: tipo_accion_auditoria; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_accion_auditoria AS ENUM (
    'mejora',
    'correctiva',
    'preventiva',
    'cambio',
    'recurso',
    'seguimiento'
);


--
-- Name: tipo_adquisicion; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_adquisicion AS ENUM (
    'epp',
    'maquinaria',
    'herramientas',
    'sustancias_quimicas',
    'servicios',
    'equipos_emergencia',
    'mobiliario',
    'software',
    'otros'
);


--
-- Name: tipo_cambio; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_cambio AS ENUM (
    'interno',
    'externo'
);


--
-- Name: tipo_comunicacion; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_comunicacion AS ENUM (
    'politica',
    'procedimiento',
    'alerta',
    'informativo',
    'formacion',
    'emergencia',
    'normativo',
    'evento'
);


--
-- Name: tipo_control; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_control AS ENUM (
    'eliminacion',
    'sustitucion',
    'ingenieria',
    'administrativo',
    'epp'
);


--
-- Name: tipo_control_cambio; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_control_cambio AS ENUM (
    'eliminacion',
    'sustitucion',
    'controles_ingenieria',
    'controles_administrativos',
    'epp',
    'capacitacion'
);


--
-- Name: tipo_decision_revision; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_decision_revision AS ENUM (
    'fortaleza',
    'no_conformidad',
    'oportunidad_mejora',
    'accion_correctiva',
    'accion_preventiva',
    'cambio_sgsst',
    'necesidad_recursos'
);


--
-- Name: tipo_empresa_sst; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_empresa_sst AS ENUM (
    'tipo1',
    'tipo2',
    'tipo3',
    'tipo4'
);


--
-- Name: tipo_indicador; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_indicador AS ENUM (
    'estructura',
    'proceso',
    'resultado'
);


--
-- Name: tipo_participante_revision; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_participante_revision AS ENUM (
    'alta_direccion',
    'copasst',
    'coordinador_sst',
    'responsable_area',
    'asesor_externo',
    'invitado_especial'
);


--
-- Name: tipo_proveedor; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_proveedor AS ENUM (
    'proveedor',
    'contratista',
    'subcontratista',
    'temporal'
);


--
-- Name: tipo_recomendacion; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_recomendacion AS ENUM (
    'correctiva',
    'preventiva',
    'mejora',
    'obligatoria'
);


--
-- Name: tipo_tema_revision; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_tema_revision AS ENUM (
    'indicadores_sst',
    'objetivos_metas',
    'auditorias',
    'accidentes_incidentes',
    'enfermedades',
    'capacitaciones',
    'recursos',
    'cambios_normativos',
    'programas_gestion',
    'riesgos_oportunidades',
    'quejas_sugerencias',
    'partes_interesadas',
    'cambios_procesos',
    'clima_laboral',
    'otro'
);


--
-- Name: training_frequency; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.training_frequency AS ENUM (
    'unica',
    'mensual',
    'trimestral',
    'semestral',
    'anual'
);


--
-- Name: training_modality; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.training_modality AS ENUM (
    'presencial',
    'virtual',
    'mixta'
);


--
-- Name: training_program_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.training_program_status AS ENUM (
    'borrador',
    'aprobado',
    'en_ejecucion',
    'completado',
    'cerrado'
);


--
-- Name: training_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.training_status AS ENUM (
    'programada',
    'en-curso',
    'completada',
    'cancelada'
);


--
-- Name: transaction_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.transaction_status AS ENUM (
    'PENDING',
    'APPROVED',
    'DECLINED',
    'VOIDED',
    'ERROR'
);


--
-- Name: transaction_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.transaction_type AS ENUM (
    'subscription_payment',
    'trial_conversion',
    'upgrade',
    'downgrade',
    'refund'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'superadmin',
    'superusuario',
    'admin',
    'coordinador_sst',
    'coordinador_rrhh',
    'jefe_personal',
    'supervisor',
    'trabajador',
    'responsable_sst',
    'coordinador_salud',
    'lso'
);


--
-- Name: vehicle_ownership; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.vehicle_ownership AS ENUM (
    'propio',
    'arrendado',
    'contratado'
);


--
-- Name: vehicle_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.vehicle_status AS ENUM (
    'activo',
    'mantenimiento',
    'inactivo',
    'dado-de-baja'
);


--
-- Name: vehicle_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.vehicle_type AS ENUM (
    'automovil',
    'camioneta',
    'camion',
    'motocicleta',
    'bus',
    'otro'
);


--
-- Name: worker_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.worker_status AS ENUM (
    'activo',
    'inactivo',
    'retirado'
);


--
-- Name: pricing_tiers; Type: TYPE; Schema: stripe; Owner: -
--

CREATE TYPE stripe.pricing_tiers AS ENUM (
    'graduated',
    'volume'
);


--
-- Name: pricing_type; Type: TYPE; Schema: stripe; Owner: -
--

CREATE TYPE stripe.pricing_type AS ENUM (
    'one_time',
    'recurring'
);


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  new.updated_at = now();
  return NEW;
end;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: -
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: -
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: -
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: accidents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.accidents (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    worker_id character varying NOT NULL,
    type public.accident_type NOT NULL,
    custom_type text,
    description text NOT NULL,
    severity public.severity NOT NULL,
    date date NOT NULL,
    "time" text NOT NULL,
    location text NOT NULL,
    witnesses text,
    actions_taken text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    body_part_affected text,
    injury_nature text,
    medical_diagnosis text,
    ips_name text,
    accident_mechanism text,
    causative_agent text,
    journey_type public.journey_type,
    accident_classification public.accident_classification,
    was_hospitalized integer DEFAULT 0,
    er_referral integer DEFAULT 0
);


--
-- Name: acciones_mejora; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.acciones_mejora (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    evaluacion_id character varying NOT NULL,
    respuesta_estandar_id character varying,
    descripcion_accion text NOT NULL,
    objetivo text NOT NULL,
    tipo_accion text NOT NULL,
    prioridad public.prioridad_mejora DEFAULT 'media'::public.prioridad_mejora NOT NULL,
    responsable text NOT NULL,
    area_responsable text,
    recursos_necesarios text,
    presupuesto_estimado integer,
    fecha_inicio date NOT NULL,
    fecha_compromiso date NOT NULL,
    fecha_ejecucion date,
    estado public.estado_accion DEFAULT 'pendiente'::public.estado_accion NOT NULL,
    porcentaje_avance integer DEFAULT 0 NOT NULL,
    indicador_eficacia text,
    resultado_esperado text,
    resultado_obtenido text,
    eficaz integer,
    observaciones text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: acciones_revision; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.acciones_revision (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    revision_id character varying NOT NULL,
    company_id character varying NOT NULL,
    decision_id character varying,
    tipo public.tipo_accion_auditoria NOT NULL,
    descripcion text NOT NULL,
    responsable character varying,
    fecha_compromiso date NOT NULL,
    fecha_cumplimiento date,
    estado text DEFAULT 'pendiente'::text NOT NULL,
    prioridad text DEFAULT 'media'::text,
    recursos text,
    observaciones text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    responsable_nombre text DEFAULT 'Pendiente asignar'::text NOT NULL,
    avance_descripcion text,
    porcentaje_avance integer DEFAULT 0 NOT NULL,
    evidencia_url text,
    fecha_implementacion date,
    verificado_por character varying,
    fecha_verificacion date,
    eficaz integer,
    observaciones_verificacion text
);


--
-- Name: actividades_plan_trabajo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.actividades_plan_trabajo (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    plan_trabajo_id character varying NOT NULL,
    programa public.programa_sst NOT NULL,
    programa_otro text,
    actividad text NOT NULL,
    objetivo text NOT NULL,
    meta text NOT NULL,
    responsable text NOT NULL,
    cargo text NOT NULL,
    area_responsable text,
    mes public.meses NOT NULL,
    trimestre integer NOT NULL,
    fecha_inicio date,
    fecha_fin date,
    recursos_humanos text,
    recursos_financieros integer,
    recursos_tecnicos text,
    indicador text,
    meta_indicador text,
    valor_indicador text,
    estado public.estado_actividad DEFAULT 'pendiente'::public.estado_actividad NOT NULL,
    porcentaje_avance integer DEFAULT 0 NOT NULL,
    evidencias text,
    archivo_url text,
    archivo_nombre text,
    observaciones text,
    fecha_reprogramacion date,
    motivo_reprogramacion text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    recursos_administrativos boolean DEFAULT false,
    recursos_financieros_check boolean DEFAULT false,
    ejecutado boolean DEFAULT false
);


--
-- Name: adquisicion_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.adquisicion_items (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    solicitud_id character varying,
    nombre_producto text NOT NULL,
    categoria public.categoria_item NOT NULL,
    marca text,
    modelo text,
    referencia text,
    serial text,
    cantidad integer DEFAULT 1 NOT NULL,
    unidad text DEFAULT 'unidades'::text,
    precio_unitario integer,
    precio_total integer,
    resource_allocation_id character varying,
    ficha_tecnica_url text,
    ficha_tecnica_nombre text,
    hoja_seguridad_url text,
    hoja_seguridad_nombre text,
    certificado_url text,
    certificado_nombre text,
    especificaciones_sst text,
    cumple_normativa integer DEFAULT 1,
    normas_aplicables text,
    vida_util_meses integer,
    fecha_vencimiento date,
    requiere_mantenimiento integer DEFAULT 0,
    frecuencia_mantenimiento_dias integer,
    estado text DEFAULT 'activo'::text NOT NULL,
    fecha_compra date,
    fecha_baja date,
    motivo_baja text,
    observaciones text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: afiliaciones_ssss; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.afiliaciones_ssss (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    worker_id character varying NOT NULL,
    company_id character varying NOT NULL,
    fecha date NOT NULL,
    eps_file_url character varying,
    arl_file_url character varying,
    pension_file_url character varying,
    created_at timestamp without time zone DEFAULT now(),
    eps_nombre text,
    arl_nombre text,
    afp_nombre text,
    ccf_nombre text
);


--
-- Name: analisis_vulnerabilidad; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analisis_vulnerabilidad (
    id character varying DEFAULT (gen_random_uuid())::text NOT NULL,
    company_id character varying NOT NULL,
    plan_emergencia_id character varying,
    amenaza_tipo character varying(100) NOT NULL,
    amenaza_descripcion text NOT NULL,
    probabilidad character varying(20) DEFAULT 'posible'::character varying NOT NULL,
    severidad character varying(20) DEFAULT 'moderado'::character varying NOT NULL,
    nivel_riesgo character varying(20) DEFAULT 'medio'::character varying NOT NULL,
    personas_exposicion character varying(50) DEFAULT 'medio'::character varying,
    recursos_exposicion character varying(50) DEFAULT 'medio'::character varying,
    sistemas_exposicion character varying(50) DEFAULT 'medio'::character varying,
    medidas_prevencion text,
    medidas_mitigacion text,
    recursos_necesarios text,
    responsable_id character varying,
    fecha_evaluacion date DEFAULT CURRENT_DATE NOT NULL,
    proxima_revision date,
    estado character varying(50) DEFAULT 'vigente'::character varying NOT NULL,
    observaciones text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    codigo text,
    fecha_analisis date,
    realizado_por text,
    metodologia text DEFAULT 'diamante'::text,
    nivel_vulnerabilidad_personas text,
    nivel_vulnerabilidad_recursos text,
    nivel_vulnerabilidad_sistemas text,
    nivel_riesgo_global text,
    conclusiones text,
    recomendaciones text
);


--
-- Name: aprobaciones_cambios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.aprobaciones_cambios (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    cambio_id character varying NOT NULL,
    nivel_aprobacion public.nivel_aprobador NOT NULL,
    aprobador text NOT NULL,
    cargo text,
    estado public.estado_aprobacion DEFAULT 'pendiente'::public.estado_aprobacion NOT NULL,
    fecha_aprobacion date,
    comentarios text,
    condiciones text,
    orden integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: arco_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.arco_requests (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    request_type public.arco_request_type NOT NULL,
    status public.arco_request_status DEFAULT 'pendiente'::public.arco_request_status NOT NULL,
    worker_id character varying,
    user_id character varying,
    requester_name text NOT NULL,
    requester_email text NOT NULL,
    requester_phone text,
    requester_identification text NOT NULL,
    is_representative integer DEFAULT 0 NOT NULL,
    data_subject_name text,
    data_subject_identification text,
    representation_proof_url text,
    representative_verified integer,
    representative_verified_by character varying,
    representative_verified_at timestamp without time zone,
    request_description text NOT NULL,
    specific_data_requested text,
    justification text,
    assigned_to character varying,
    assigned_at timestamp without time zone,
    previous_assignees text[] DEFAULT '{}'::text[],
    escalated_to character varying,
    escalated_at timestamp without time zone,
    escalation_reason text,
    intake_recorded_by character varying,
    response_date timestamp without time zone,
    response_description text,
    response_provided_by character varying,
    rejection_reason text,
    partial_completion_details text,
    request_attachments_urls text[] DEFAULT '{}'::text[],
    response_attachments_urls text[] DEFAULT '{}'::text[],
    submitted_at timestamp without time zone DEFAULT now() NOT NULL,
    legal_deadline timestamp without time zone DEFAULT (now() + '10 days'::interval) NOT NULL,
    reminder_sent_at timestamp without time zone,
    completed_at timestamp without time zone,
    ip_address text,
    user_agent text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    user_id character varying NOT NULL,
    user_role text NOT NULL,
    username text NOT NULL,
    entity_type text NOT NULL,
    entity_id text NOT NULL,
    action public.audit_action NOT NULL,
    data_subject_id text,
    data_subject_name text,
    old_values text,
    new_values text,
    changed_fields text,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL,
    ip_address text,
    user_agent text,
    request_id text,
    description text,
    source text DEFAULT 'api'::text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: auditoria_auditores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auditoria_auditores (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    auditoria_id character varying NOT NULL,
    auditor_id character varying,
    nombre_externo text,
    email_externo text,
    organizacion_externa text,
    rol text DEFAULT 'auditor'::text NOT NULL,
    areas_asignadas text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: auditoria_checklists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auditoria_checklists (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    auditoria_id character varying NOT NULL,
    numero_item integer NOT NULL,
    criterio_auditoria text NOT NULL,
    clausula_referencia text,
    area_proceso_auditado text,
    cumple integer,
    evidencias_obtenidas text,
    observaciones text,
    archivo_evidencia text,
    evaluado_por text,
    evaluado_por_id character varying,
    fecha_evaluacion date,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: auditorias_internas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auditorias_internas (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    codigo text NOT NULL,
    titulo text NOT NULL,
    tipo public.auditoria_tipo NOT NULL,
    norma_referencia public.auditoria_norma NOT NULL,
    objetivo text NOT NULL,
    alcance text NOT NULL,
    fecha_programada date NOT NULL,
    fecha_inicio date,
    fecha_fin date,
    duracion_estimada_horas integer,
    auditorista_lider text NOT NULL,
    auditorista_lider_id character varying,
    responsable_auditado text,
    responsable_auditado_id character varying,
    estado public.auditoria_estado DEFAULT 'programada'::public.auditoria_estado NOT NULL,
    numero_hallazgos integer DEFAULT 0,
    numero_conformidades integer DEFAULT 0,
    numero_no_conformidades_menores integer DEFAULT 0,
    numero_no_conformidades_mayores integer DEFAULT 0,
    numero_observaciones integer DEFAULT 0,
    porcentaje_cumplimiento integer,
    conclusiones text,
    recomendaciones text,
    fecha_informe date,
    archivo_informe text,
    aprobado_por text,
    aprobado_por_id character varying,
    fecha_aprobacion date,
    observaciones_cierre text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    planificada_con_copasst boolean DEFAULT false,
    copasst_acta_id character varying,
    observaciones_copasst text,
    fecha_aprobacion_copasst date
);


--
-- Name: automatizacion_cambio_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.automatizacion_cambio_logs (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    cambio_id character varying NOT NULL,
    modulo_destino public.modulo_destino_automatizacion NOT NULL,
    registro_destino_id character varying,
    estado public.estado_automatizacion DEFAULT 'pendiente'::public.estado_automatizacion NOT NULL,
    mensaje text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: brigadas_emergencia; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brigadas_emergencia (
    id character varying DEFAULT (gen_random_uuid())::text NOT NULL,
    company_id character varying NOT NULL,
    plan_emergencia_id character varying,
    nombre character varying(255) NOT NULL,
    tipo character varying(100) NOT NULL,
    descripcion text,
    objetivos text,
    responsable_id character varying,
    fecha_conformacion date DEFAULT CURRENT_DATE NOT NULL,
    estado character varying(50) DEFAULT 'activa'::character varying NOT NULL,
    capacidad_personas integer DEFAULT 0,
    ubicacion_base text,
    turno character varying(50),
    equipos_asignados text,
    observaciones text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    funciones_antes text,
    funciones_durante text,
    funciones_despues text,
    equipamiento_asignado text,
    activa integer DEFAULT 1
);


--
-- Name: cambios_sst; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cambios_sst (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    codigo text NOT NULL,
    titulo text NOT NULL,
    descripcion text NOT NULL,
    tipo public.tipo_cambio NOT NULL,
    categoria public.categoria_cambio NOT NULL,
    area_afectada text NOT NULL,
    proceso_afectado text,
    numero_trabajadores_afectados integer DEFAULT 0 NOT NULL,
    justificacion text NOT NULL,
    objetivos text,
    fecha_propuesta date NOT NULL,
    fecha_implementacion_planificada date,
    fecha_implementacion_real date,
    solicitante text NOT NULL,
    responsable_implementacion text,
    estado public.estado_cambio DEFAULT 'propuesto'::public.estado_cambio NOT NULL,
    nivel_impacto public.nivel_impacto,
    requiere_actualizacion_matriz_riesgos integer DEFAULT 0 NOT NULL,
    requiere_actualizacion_plan_trabajo integer DEFAULT 0 NOT NULL,
    requiere_capacitacion integer DEFAULT 0 NOT NULL,
    requiere_aprobacion_copasst integer DEFAULT 0 NOT NULL,
    observaciones text,
    lecciones_aprendidas text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: capacitacion_asistentes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.capacitacion_asistentes (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    evento_id character varying NOT NULL,
    worker_id character varying NOT NULL,
    company_id character varying NOT NULL,
    estado public.capacitacion_asistente_estado DEFAULT 'invitado'::public.capacitacion_asistente_estado NOT NULL,
    horas_asistidas integer,
    calificacion integer,
    certificado_url text,
    observaciones text,
    fecha_confirmacion timestamp without time zone,
    fecha_asistencia timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: capacitacion_eventos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.capacitacion_eventos (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    catalogo_id character varying NOT NULL,
    codigo_curso character varying(20) NOT NULL,
    titulo_curso text NOT NULL,
    descripcion_curso text NOT NULL,
    duracion_horas integer NOT NULL,
    categoria public.capacitacion_categoria NOT NULL,
    nivel public.capacitacion_nivel NOT NULL,
    obligatoria boolean NOT NULL,
    normativa text,
    fecha_inicio date NOT NULL,
    fecha_fin date,
    hora_inicio text,
    hora_fin text,
    lugar text,
    instructor text,
    estado public.capacitacion_evento_estado DEFAULT 'programado'::public.capacitacion_evento_estado NOT NULL,
    observaciones text,
    archivo_url text,
    archivo_nombre text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: capacitaciones_cambios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.capacitaciones_cambios (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    cambio_id character varying NOT NULL,
    training_id character varying,
    tema_capacitacion text NOT NULL,
    objetivos text,
    duracion_horas integer DEFAULT 1 NOT NULL,
    trabajadores_objetivo text,
    numero_trabajadores integer DEFAULT 0 NOT NULL,
    fecha_programada date,
    fecha_realizada date,
    instructor text,
    completada integer DEFAULT 0 NOT NULL,
    porcentaje_asistencia integer,
    observaciones text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: capacitaciones_catalogo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.capacitaciones_catalogo (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    codigo character varying(20) NOT NULL,
    titulo text NOT NULL,
    descripcion text NOT NULL,
    duracion_horas integer NOT NULL,
    validez_meses integer,
    categoria public.capacitacion_categoria NOT NULL,
    nivel public.capacitacion_nivel NOT NULL,
    obligatoria boolean DEFAULT false NOT NULL,
    normativa text,
    activo boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: comite_convivencia_actas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comite_convivencia_actas (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    numero_acta character varying NOT NULL,
    fecha date NOT NULL,
    notas text,
    trabajador1_worker_id character varying,
    trabajador1_nombre character varying,
    trabajador1_cedula character varying,
    trabajador1_tipo character varying,
    trabajador2_worker_id character varying,
    trabajador2_nombre character varying,
    trabajador2_cedula character varying,
    trabajador2_tipo character varying,
    trabajador3_worker_id character varying,
    trabajador3_nombre character varying,
    trabajador3_cedula character varying,
    trabajador3_tipo character varying,
    empleador1_worker_id character varying,
    empleador1_nombre character varying,
    empleador1_cedula character varying,
    empleador1_tipo character varying,
    empleador2_worker_id character varying,
    empleador2_nombre character varying,
    empleador2_cedula character varying,
    empleador2_tipo character varying,
    empleador3_worker_id character varying,
    empleador3_nombre character varying,
    empleador3_cedula character varying,
    empleador3_tipo character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: companies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.companies (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    nit text NOT NULL,
    address text,
    contact_phone text,
    contact_email text,
    number_of_workers integer DEFAULT 1 NOT NULL,
    risk_level public.risk_level DEFAULT 'I'::public.risk_level NOT NULL,
    calculated_chapter public.chapter DEFAULT '1'::public.chapter NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    logo_url text,
    arl_nombre_empresa text,
    ccf_nombre_empresa text,
    eps_nombre_empresa text,
    afp_nombre_empresa text,
    city text,
    legal_rep_signature_url text,
    legal_rep_name text,
    legal_rep_id text,
    legal_rep_position text,
    ciiu_code text
);


--
-- Name: componentes_sst; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.componentes_sst (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    numero integer NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    peso_total integer NOT NULL,
    orden integer NOT NULL
);


--
-- Name: comunicaciones_sst; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comunicaciones_sst (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    tipo public.tipo_comunicacion NOT NULL,
    asunto text NOT NULL,
    contenido text NOT NULL,
    publico_objetivo public.publico_objetivo NOT NULL,
    departamento_especifico text,
    medios_utilizados text[],
    archivos_adjuntos text[],
    fecha_envio timestamp without time zone DEFAULT now() NOT NULL,
    enviado_por character varying NOT NULL,
    requiere_confirmacion_lectura integer DEFAULT 0 NOT NULL,
    total_destinatarios integer DEFAULT 0 NOT NULL,
    total_lecturas integer DEFAULT 0 NOT NULL,
    fecha_vigencia_inicio date,
    fecha_vigencia_fin date,
    relacionado_con text,
    relacionado_id character varying,
    observaciones text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: consent_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.consent_records (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    worker_id character varying NOT NULL,
    worker_name text NOT NULL,
    worker_email text,
    worker_identification text NOT NULL,
    consent_type public.consent_type NOT NULL,
    status public.consent_status DEFAULT 'otorgado'::public.consent_status NOT NULL,
    channel public.consent_channel DEFAULT 'web'::public.consent_channel NOT NULL,
    policy_version text NOT NULL,
    policy_document_url text,
    consent_text text,
    granted_at timestamp without time zone DEFAULT now() NOT NULL,
    revoked_at timestamp without time zone,
    expires_at timestamp without time zone,
    purpose text NOT NULL,
    legal_basis text,
    revocation_reason text,
    revoked_by character varying,
    recorded_by character varying,
    updated_by character varying,
    ip_address text,
    user_agent text,
    evidence_url text,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: contenidos_induccion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contenidos_induccion (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    titulo text NOT NULL,
    descripcion text,
    tipo_contenido public.contenido_induccion_tipo DEFAULT 'video'::public.contenido_induccion_tipo NOT NULL,
    url_video text,
    url_documento text,
    contenido_texto text,
    duracion_minutos integer DEFAULT 10 NOT NULL,
    orden integer DEFAULT 0 NOT NULL,
    estado public.contenido_induccion_estado DEFAULT 'borrador'::public.contenido_induccion_estado NOT NULL,
    obligatorio integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: contracts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contracts (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    worker_id character varying NOT NULL,
    job_profile_id character varying,
    contract_type_v2 public.contract_type_v2 NOT NULL,
    contract_number text NOT NULL,
    start_date date NOT NULL,
    end_date date,
    salary integer NOT NULL,
    "position" text NOT NULL,
    department text,
    work_schedule text,
    arl_rate text,
    additional_clauses text,
    contract_status_v2 public.contract_status_v2 DEFAULT 'activo'::public.contract_status_v2 NOT NULL,
    termination_date date,
    termination_reason text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    identification_number text
);


--
-- Name: controles_cambios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.controles_cambios (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    cambio_id character varying NOT NULL,
    evaluacion_id character varying,
    descripcion_control text NOT NULL,
    tipo_control public.tipo_control_cambio NOT NULL,
    responsable text NOT NULL,
    fecha_limite date NOT NULL,
    fecha_implementacion date,
    estado public.estado_control_cambio DEFAULT 'planificado'::public.estado_control_cambio NOT NULL,
    costo_estimado integer,
    costo_real integer,
    fecha_verificacion date,
    verificado_por text,
    efectivo integer,
    observaciones text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: convivencia_actas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.convivencia_actas (
    id character varying DEFAULT (gen_random_uuid())::character varying NOT NULL,
    company_id character varying NOT NULL,
    eleccion_id character varying,
    tipo text NOT NULL,
    numero integer DEFAULT 1 NOT NULL,
    fecha date NOT NULL,
    asunto text NOT NULL,
    contenido text,
    asistentes text[] DEFAULT '{}'::text[] NOT NULL,
    acuerdos text[],
    observaciones text,
    firmas jsonb,
    documento_url text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: convivencia_candidatos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.convivencia_candidatos (
    id character varying DEFAULT (gen_random_uuid())::character varying NOT NULL,
    eleccion_id character varying NOT NULL,
    worker_id character varying NOT NULL,
    propuesta_laboral text,
    fecha_inscripcion date NOT NULL,
    estado text DEFAULT 'inscrito'::text NOT NULL,
    votos_recibidos integer DEFAULT 0,
    orden_eleccion integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: convivencia_elecciones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.convivencia_elecciones (
    id character varying DEFAULT (gen_random_uuid())::character varying NOT NULL,
    company_id character varying NOT NULL,
    periodo_id character varying,
    fecha_convocatoria date NOT NULL,
    fecha_inicio_inscripcion date NOT NULL,
    fecha_fin_inscripcion date NOT NULL,
    fecha_votacion date NOT NULL,
    hora_inicio_votacion text,
    hora_fin_votacion text,
    modalidad_votacion text DEFAULT 'presencial'::text NOT NULL,
    estado text DEFAULT 'convocatoria'::text NOT NULL,
    principales_requeridos integer DEFAULT 2 NOT NULL,
    suplentes_requeridos integer DEFAULT 2 NOT NULL,
    total_votantes integer,
    votos_validos integer,
    votos_nulos integer,
    votos_en_blanco integer,
    convocatoria_url text,
    acta_escrutinio_url text,
    observaciones text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    publicado_en_portal boolean DEFAULT false NOT NULL
);


--
-- Name: convivencia_miembros; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.convivencia_miembros (
    id character varying DEFAULT (gen_random_uuid())::character varying NOT NULL,
    periodo_id character varying NOT NULL,
    worker_id character varying NOT NULL,
    representacion text NOT NULL,
    cargo text NOT NULL,
    fecha_designacion date NOT NULL,
    estado text DEFAULT 'activo'::text NOT NULL,
    votos_obtenidos integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: convivencia_periodos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.convivencia_periodos (
    id character varying DEFAULT (gen_random_uuid())::character varying NOT NULL,
    company_id character varying NOT NULL,
    fecha_inicio date NOT NULL,
    fecha_fin date NOT NULL,
    estado text DEFAULT 'activo'::text NOT NULL,
    observaciones text,
    acta_constitucion_url text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: convivencia_registro_votacion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.convivencia_registro_votacion (
    id character varying DEFAULT (gen_random_uuid())::character varying NOT NULL,
    eleccion_id character varying NOT NULL,
    worker_id character varying NOT NULL,
    fecha_hora_voto timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ip_address text
);


--
-- Name: convivencia_votos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.convivencia_votos (
    id character varying DEFAULT (gen_random_uuid())::character varying NOT NULL,
    eleccion_id character varying NOT NULL,
    candidato_id character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: copasst_actas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.copasst_actas (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    fecha date NOT NULL,
    numero_acta text NOT NULL,
    notas text NOT NULL,
    presidente text,
    secretaria text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    presidente_worker_id character varying,
    secretaria_worker_id character varying,
    archivo_adjunto_url text,
    archivo_adjunto_nombre text
);


--
-- Name: copasst_banco_preguntas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.copasst_banco_preguntas (
    id character varying DEFAULT (gen_random_uuid())::character varying NOT NULL,
    company_id character varying,
    categoria_id character varying,
    enunciado_html text NOT NULL,
    tipo_pregunta text DEFAULT 'seleccion_multiple'::text NOT NULL,
    opciones jsonb NOT NULL,
    respuesta_correcta text NOT NULL,
    explicacion_html text,
    dificultad text DEFAULT 'media'::text NOT NULL,
    etiquetas text[],
    puntos integer DEFAULT 10 NOT NULL,
    activo boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: copasst_candidatos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.copasst_candidatos (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    eleccion_id character varying NOT NULL,
    worker_id character varying NOT NULL,
    fecha_inscripcion date NOT NULL,
    propuestas text,
    acepta_candidatura boolean DEFAULT true,
    estado text DEFAULT 'inscrito'::text NOT NULL,
    votos_obtenidos integer DEFAULT 0,
    orden_eleccion integer,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: copasst_certificados; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.copasst_certificados (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    user_id character varying NOT NULL,
    curso_id character varying NOT NULL,
    codigo_certificado text NOT NULL,
    nombre_completo text NOT NULL,
    identificacion text NOT NULL,
    titulo_curso text NOT NULL,
    duracion_horas numeric NOT NULL,
    puntaje_obtenido integer NOT NULL,
    puntaje_maximo integer NOT NULL,
    fecha_emision timestamp without time zone DEFAULT now() NOT NULL,
    fecha_vencimiento timestamp without time zone,
    activo boolean DEFAULT true,
    codigo_qr text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: copasst_competencias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.copasst_competencias (
    id character varying DEFAULT (gen_random_uuid())::character varying NOT NULL,
    company_id character varying,
    nombre text NOT NULL,
    descripcion text,
    dimension text NOT NULL,
    activo boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: copasst_curso_asignaciones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.copasst_curso_asignaciones (
    id character varying DEFAULT (gen_random_uuid())::character varying NOT NULL,
    company_id character varying NOT NULL,
    curso_id character varying NOT NULL,
    user_id character varying NOT NULL,
    asignado_por character varying NOT NULL,
    fecha_asignacion timestamp without time zone DEFAULT now() NOT NULL,
    fecha_limite timestamp without time zone,
    notificar_dias_antes integer DEFAULT 3,
    estado text DEFAULT 'pendiente'::text NOT NULL,
    fecha_completado timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: copasst_curso_categorias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.copasst_curso_categorias (
    id character varying DEFAULT (gen_random_uuid())::character varying NOT NULL,
    company_id character varying NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    orden integer DEFAULT 1 NOT NULL,
    activo boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: copasst_cursos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.copasst_cursos (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    codigo text NOT NULL,
    titulo text NOT NULL,
    descripcion text,
    imagen_url text,
    duracion_minutos integer DEFAULT 15 NOT NULL,
    orden_curso integer DEFAULT 1 NOT NULL,
    es_obligatorio boolean DEFAULT true,
    prerequisito_curso_id character varying,
    puntos_completar integer DEFAULT 100 NOT NULL,
    activo boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: copasst_elecciones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.copasst_elecciones (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    periodo_id character varying,
    fecha_convocatoria date NOT NULL,
    fecha_inicio_inscripcion date NOT NULL,
    fecha_fin_inscripcion date NOT NULL,
    fecha_votacion date NOT NULL,
    hora_inicio_votacion text,
    hora_fin_votacion text,
    estado text DEFAULT 'convocatoria'::text NOT NULL,
    total_trabajadores integer NOT NULL,
    principales_requeridos integer NOT NULL,
    suplentes_requeridos integer NOT NULL,
    total_votantes integer,
    votos_validos integer,
    votos_nulos integer,
    votos_en_blanco integer,
    convocatoria_url text,
    acta_escrutinio_url text,
    observaciones text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: copasst_escenario_nodos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.copasst_escenario_nodos (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    escenario_id character varying NOT NULL,
    tipo text NOT NULL,
    titulo text NOT NULL,
    contenido_html text NOT NULL,
    imagen_url text,
    orden integer DEFAULT 1 NOT NULL,
    opciones jsonb,
    es_correcta boolean DEFAULT false,
    puntos_nodo integer DEFAULT 10 NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: copasst_escenario_progreso; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.copasst_escenario_progreso (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    user_id character varying NOT NULL,
    escenario_id character varying NOT NULL,
    nodos_visitados jsonb DEFAULT '[]'::jsonb,
    decisiones_tomadas jsonb DEFAULT '[]'::jsonb,
    puntos_obtenidos integer DEFAULT 0 NOT NULL,
    completado boolean DEFAULT false,
    fecha_inicio timestamp without time zone DEFAULT now(),
    fecha_completado timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: copasst_escenarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.copasst_escenarios (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    codigo text NOT NULL,
    titulo text NOT NULL,
    descripcion text NOT NULL,
    categoria text NOT NULL,
    duracion_minutos integer DEFAULT 15 NOT NULL,
    puntos_perfecto integer DEFAULT 100 NOT NULL,
    imagen_url text,
    activo boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: copasst_evaluacion_asignaciones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.copasst_evaluacion_asignaciones (
    id character varying DEFAULT (gen_random_uuid())::character varying NOT NULL,
    periodo_id character varying NOT NULL,
    evaluador_id character varying NOT NULL,
    evaluado_id character varying NOT NULL,
    tipo_evaluador text NOT NULL,
    estado text DEFAULT 'pendiente'::text NOT NULL,
    fecha_completada timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: copasst_evaluacion_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.copasst_evaluacion_items (
    id character varying DEFAULT (gen_random_uuid())::character varying NOT NULL,
    periodo_id character varying NOT NULL,
    competencia_id character varying NOT NULL,
    enunciado text NOT NULL,
    escala_minima integer DEFAULT 1 NOT NULL,
    escala_maxima integer DEFAULT 5 NOT NULL,
    peso integer DEFAULT 1 NOT NULL,
    orden integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: copasst_evaluacion_periodos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.copasst_evaluacion_periodos (
    id character varying DEFAULT (gen_random_uuid())::character varying NOT NULL,
    company_id character varying NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    fecha_inicio date NOT NULL,
    fecha_fin date NOT NULL,
    estado text DEFAULT 'configuracion'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: copasst_evaluacion_respuestas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.copasst_evaluacion_respuestas (
    id character varying DEFAULT (gen_random_uuid())::character varying NOT NULL,
    asignacion_id character varying NOT NULL,
    item_id character varying NOT NULL,
    valor integer NOT NULL,
    comentario text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: copasst_evaluacion_resultados; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.copasst_evaluacion_resultados (
    id character varying DEFAULT (gen_random_uuid())::character varying NOT NULL,
    periodo_id character varying NOT NULL,
    evaluado_id character varying NOT NULL,
    promedio_general numeric NOT NULL,
    promedios_por_dimension jsonb NOT NULL,
    fortalezas jsonb,
    oportunidades jsonb,
    comentarios_generales text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: copasst_insignias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.copasst_insignias (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    codigo text NOT NULL,
    titulo text NOT NULL,
    descripcion text NOT NULL,
    icono_url text,
    icono_lucide text,
    categoria text NOT NULL,
    condicion jsonb NOT NULL,
    puntos_bonus integer DEFAULT 50 NOT NULL,
    activo boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: copasst_insignias_usuario; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.copasst_insignias_usuario (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    user_id character varying NOT NULL,
    insignia_id character varying NOT NULL,
    fecha_desbloqueo timestamp without time zone DEFAULT now() NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: copasst_lecciones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.copasst_lecciones (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    curso_id character varying NOT NULL,
    titulo text NOT NULL,
    contenido_html text NOT NULL,
    video_url text,
    duracion_minutos integer DEFAULT 5 NOT NULL,
    orden_leccion integer DEFAULT 1 NOT NULL,
    puntos_completar integer DEFAULT 10 NOT NULL,
    activo boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: copasst_miembros; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.copasst_miembros (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    periodo_id character varying NOT NULL,
    worker_id character varying NOT NULL,
    tipo_representante text NOT NULL,
    rol_miembro text NOT NULL,
    cargo text,
    votos_obtenidos integer,
    fecha_designacion date NOT NULL,
    activo boolean DEFAULT true,
    capacitado boolean DEFAULT false,
    fecha_capacitacion date,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: copasst_notificaciones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.copasst_notificaciones (
    id character varying DEFAULT (gen_random_uuid())::character varying NOT NULL,
    company_id character varying NOT NULL,
    asignacion_id character varying,
    user_id character varying NOT NULL,
    tipo text NOT NULL,
    titulo text NOT NULL,
    mensaje text NOT NULL,
    estado text DEFAULT 'pendiente'::text NOT NULL,
    fecha_programada timestamp without time zone NOT NULL,
    fecha_envio timestamp without time zone,
    intentos integer DEFAULT 0 NOT NULL,
    error_mensaje text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: copasst_periodos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.copasst_periodos (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    tipo_comite text NOT NULL,
    fecha_inicio date NOT NULL,
    fecha_fin date NOT NULL,
    estado text DEFAULT 'activo'::text NOT NULL,
    acta_constitucion_url text,
    resolucion_conformacion_url text,
    observaciones text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: copasst_progreso; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.copasst_progreso (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    user_id character varying NOT NULL,
    curso_id character varying NOT NULL,
    leccion_id character varying,
    lecciones_completadas integer DEFAULT 0 NOT NULL,
    lecciones_totales integer DEFAULT 0 NOT NULL,
    porcentaje_progreso integer DEFAULT 0 NOT NULL,
    completado boolean DEFAULT false,
    fecha_inicio timestamp without time zone DEFAULT now(),
    fecha_completado timestamp without time zone,
    quiz_aprobado boolean DEFAULT false,
    quiz_puntaje integer,
    quiz_intentos integer DEFAULT 0 NOT NULL,
    ultimo_intento_quiz timestamp without time zone,
    puntos_obtenidos integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: copasst_puntos_mensuales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.copasst_puntos_mensuales (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    user_id character varying NOT NULL,
    anio integer NOT NULL,
    mes integer NOT NULL,
    puntos_total integer DEFAULT 0 NOT NULL,
    cursos_completados integer DEFAULT 0 NOT NULL,
    lecciones_completadas integer DEFAULT 0 NOT NULL,
    quizzes_aprobados integer DEFAULT 0 NOT NULL,
    insignias_desbloqueadas integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: copasst_quiz_preguntas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.copasst_quiz_preguntas (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    curso_id character varying NOT NULL,
    pregunta text NOT NULL,
    tipo_pregunta text DEFAULT 'seleccion_multiple'::text NOT NULL,
    opciones jsonb NOT NULL,
    respuesta_correcta text NOT NULL,
    explicacion text,
    puntos_pregunta integer DEFAULT 10 NOT NULL,
    orden_pregunta integer DEFAULT 1 NOT NULL,
    activo boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: copasst_rachas_usuario; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.copasst_rachas_usuario (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    user_id character varying NOT NULL,
    racha_actual integer DEFAULT 0 NOT NULL,
    racha_maxima integer DEFAULT 0 NOT NULL,
    ultima_actividad date,
    puntos_bonus_acumulados integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: copasst_registro_votacion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.copasst_registro_votacion (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    eleccion_id character varying NOT NULL,
    worker_id character varying NOT NULL,
    fecha_voto timestamp without time zone DEFAULT now()
);


--
-- Name: copasst_votos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.copasst_votos (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    eleccion_id character varying NOT NULL,
    candidato_id character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: criterios_evaluacion_proveedor; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.criterios_evaluacion_proveedor (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    categoria text NOT NULL,
    puntaje_maximo integer DEFAULT 10 NOT NULL,
    es_obligatorio integer DEFAULT 1 NOT NULL,
    orden integer DEFAULT 0 NOT NULL,
    activo integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: curso_50_horas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.curso_50_horas (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    archivo_url text,
    archivo_nombre text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: datos_calculo_indicadores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.datos_calculo_indicadores (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    periodo text NOT NULL,
    anio integer NOT NULL,
    numero_trabajadores integer DEFAULT 0 NOT NULL,
    horas_hombre_trabajadas integer DEFAULT 0 NOT NULL,
    numero_accidentes_trabajo integer DEFAULT 0 NOT NULL,
    dias_perdidos integer DEFAULT 0 NOT NULL,
    dias_trabajados integer DEFAULT 0 NOT NULL,
    ausencias_laborales integer DEFAULT 0 NOT NULL,
    observaciones text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    horas_trabajadas integer DEFAULT 0,
    numero_accidentes integer DEFAULT 0,
    dias_ausencia integer DEFAULT 0,
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: decisiones_revision; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.decisiones_revision (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    revision_id character varying NOT NULL,
    company_id character varying NOT NULL,
    tipo public.tipo_decision_revision NOT NULL,
    descripcion text NOT NULL,
    justificacion text,
    responsable character varying,
    fecha_compromiso date,
    recursos_necesarios text,
    seguimiento_requerido integer DEFAULT 1,
    fecha_seguimiento date,
    estado_implementacion text DEFAULT 'pendiente'::text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    alcance text,
    recurso_necesario text,
    requiere_accion integer DEFAULT 1 NOT NULL
);


--
-- Name: detalle_verificacion_sgss; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.detalle_verificacion_sgss (
    id character varying(36) DEFAULT (gen_random_uuid())::text NOT NULL,
    verificacion_id character varying(36) NOT NULL,
    worker_id character varying(36) NOT NULL,
    tipo_trabajador character varying(20) DEFAULT 'empleado'::character varying,
    verificado_eps boolean DEFAULT false,
    verificado_arl boolean DEFAULT false,
    verificado_afp boolean DEFAULT false,
    verificado_ccf boolean DEFAULT false,
    cumple boolean DEFAULT false,
    observacion text,
    agremiacion_nombre text,
    agremiacion_autorizada boolean DEFAULT false,
    seleccion_automatica boolean DEFAULT true,
    trabajador_nombre text,
    trabajador_documento text,
    trabajador_cargo text,
    tipo_vinculacion text,
    es_contratista boolean DEFAULT false,
    eps_reportada text,
    eps_verificada text,
    cumple_eps boolean DEFAULT false,
    arl_reportada text,
    arl_verificada text,
    cumple_arl boolean DEFAULT false,
    afp_reportada text,
    afp_verificada text,
    cumple_afp boolean DEFAULT false,
    ccf_reportada text,
    ccf_verificada text,
    cumple_ccf boolean DEFAULT false,
    pila_periodo_desde date,
    pila_periodo_hasta date,
    pila_archivo_url text,
    evidencia_url text,
    observaciones text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: documentos_proveedores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documentos_proveedores (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    proveedor_id character varying NOT NULL,
    tipo_documento text NOT NULL,
    nombre_documento text NOT NULL,
    archivo_url text NOT NULL,
    fecha_emision date,
    fecha_vencimiento date,
    vigente integer DEFAULT 1 NOT NULL,
    observaciones text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: drivers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.drivers (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    worker_id character varying,
    name text NOT NULL,
    identification_number text NOT NULL,
    license_number text NOT NULL,
    license_type public.license_type NOT NULL,
    license_expiry date NOT NULL,
    blood_type text,
    emergency_contact text,
    emergency_phone text,
    medical_exam_expiry date,
    status public.driver_status DEFAULT 'activo'::public.driver_status NOT NULL,
    observations text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: email_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_notifications (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    worker_id character varying NOT NULL,
    type public.notification_type NOT NULL,
    reference_id character varying NOT NULL,
    scheduled_date date NOT NULL,
    sent_date timestamp without time zone,
    status public.notification_status DEFAULT 'pending'::public.notification_status NOT NULL,
    recipient_email text NOT NULL,
    subject text NOT NULL,
    error_message text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: environmental_measurements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.environmental_measurements (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    measurement_type public.measurement_type NOT NULL,
    area text NOT NULL,
    measurement_date date NOT NULL,
    measured_by text NOT NULL,
    value_numeric text,
    unit text,
    legal_limit text,
    equipment text,
    calibration_date date,
    temperature text,
    humidity text,
    status public.measurement_status DEFAULT 'pendiente_analisis'::public.measurement_status NOT NULL,
    observations text,
    corrective_actions text,
    report_url text,
    report_name text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: especificaciones_tecnicas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.especificaciones_tecnicas (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    solicitud_id character varying NOT NULL,
    nombre_especificacion text NOT NULL,
    descripcion text NOT NULL,
    tipo_especificacion text NOT NULL,
    es_obligatoria integer DEFAULT 1 NOT NULL,
    norma_referencia text,
    cumplimiento integer,
    evidencia text,
    observaciones text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: estandares_sst; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.estandares_sst (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    componente_id character varying NOT NULL,
    numero_estandar text NOT NULL,
    nombre text NOT NULL,
    descripcion text NOT NULL,
    marco_legal text,
    puntaje_tipo1 integer,
    puntaje_tipo2 integer,
    puntaje_tipo3 integer,
    puntaje_tipo4 integer,
    criterios_verificacion text,
    orden integer NOT NULL,
    activo integer DEFAULT 1 NOT NULL
);


--
-- Name: evaluaciones_adquisicion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.evaluaciones_adquisicion (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    solicitud_id character varying NOT NULL,
    fecha_evaluacion date NOT NULL,
    evaluador text NOT NULL,
    peligros_identificados text,
    nivel_riesgo public.nivel_riesgo_adquisicion NOT NULL,
    afecta_matriz_riesgos integer DEFAULT 0 NOT NULL,
    cumple_normatividad integer,
    normas_aplicables text,
    requiere_certificaciones integer DEFAULT 0 NOT NULL,
    certificaciones_requeridas text,
    especificaciones_sst text NOT NULL,
    requiere_ficha_tecnica integer DEFAULT 0 NOT NULL,
    requiere_hoja_datos integer DEFAULT 0 NOT NULL,
    requiere_manual_operacion integer DEFAULT 0 NOT NULL,
    controles_necesarios text,
    epp_requerido text,
    capacitacion_requerida integer DEFAULT 0 NOT NULL,
    tema_capacitacion text,
    proveedor_evaluado integer,
    cumple_requisitos_proveedor integer,
    observaciones_proveedor text,
    resultado public.resultado_evaluacion_adquisicion NOT NULL,
    puntaje_total integer,
    recomendaciones text,
    condiciones_aprobacion text,
    observaciones text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: evaluaciones_impacto_cambios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.evaluaciones_impacto_cambios (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    cambio_id character varying NOT NULL,
    fecha_evaluacion date NOT NULL,
    evaluador text NOT NULL,
    peligros_identificados text NOT NULL,
    numero_peligros_nuevos integer DEFAULT 0 NOT NULL,
    nivel_riesgo_resultante public.nivel_impacto NOT NULL,
    probabilidad_ocurrencia integer NOT NULL,
    severidad_consecuencia integer NOT NULL,
    impacto_trabajadores text,
    impacto_instalaciones text,
    impacto_operaciones text,
    impacto_ambiental text,
    causas_riesgo text,
    requiere_controles integer DEFAULT 1 NOT NULL,
    recomendacion_general text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: evaluaciones_proveedores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.evaluaciones_proveedores (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    proveedor_id character varying NOT NULL,
    fecha_evaluacion date NOT NULL,
    tipo_evaluacion text NOT NULL,
    evaluador text NOT NULL,
    puntaje_total integer DEFAULT 0 NOT NULL,
    puntaje_maximo integer DEFAULT 100 NOT NULL,
    porcentaje_cumplimiento integer DEFAULT 0 NOT NULL,
    clasificacion text,
    estado public.estado_evaluacion_proveedor DEFAULT 'pendiente'::public.estado_evaluacion_proveedor NOT NULL,
    aprobado integer,
    observaciones text,
    recomendaciones text,
    plan_mejora text,
    fecha_proxima_evaluacion date,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: evaluaciones_sst; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.evaluaciones_sst (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    anio integer NOT NULL,
    mes integer DEFAULT 12 NOT NULL,
    tipo_empresa public.tipo_empresa_sst NOT NULL,
    estado public.estado_evaluacion DEFAULT 'en-progreso'::public.estado_evaluacion NOT NULL,
    responsable_nombre text NOT NULL,
    responsable_cargo text NOT NULL,
    responsable_licencia text,
    puntaje_total integer DEFAULT 0 NOT NULL,
    puntaje_maximo integer NOT NULL,
    porcentaje_cumplimiento integer DEFAULT 0 NOT NULL,
    nivel_cumplimiento public.nivel_cumplimiento,
    puntajes_por_componente text,
    fecha_evaluacion date NOT NULL,
    fecha_envio date,
    fecha_limite_plan_mejora date,
    observaciones text,
    version integer DEFAULT 1 NOT NULL,
    evaluacion_anterior_id character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: evs_activities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.evs_activities (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    program_id character varying,
    category public.evs_control_category NOT NULL,
    custom_category text,
    title text NOT NULL,
    description text,
    objective text NOT NULL,
    methodology text,
    scheduled_date date NOT NULL,
    execution_date date,
    start_time text,
    end_time text,
    location text,
    modality text DEFAULT 'presencial'::text,
    facilitator_name text NOT NULL,
    facilitator_position text,
    external_provider text,
    target_population text,
    estimated_participants integer,
    actual_participants integer,
    coverage_percentage numeric(5,2),
    status text DEFAULT 'programada'::text NOT NULL,
    observations text,
    lessons_learned text,
    created_by character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    meeting_link text
);


--
-- Name: evs_controls; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.evs_controls (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    worker_id character varying NOT NULL,
    program_id character varying,
    category public.evs_control_category NOT NULL,
    control_type text NOT NULL,
    control_date date NOT NULL,
    control_time text,
    location text,
    result public.evs_control_result NOT NULL,
    result_details text,
    substance_detected text,
    informed_consent integer DEFAULT 1 NOT NULL,
    consent_date date,
    performed_by text NOT NULL,
    performer_position text,
    witness_name text,
    requires_followup integer DEFAULT 0 NOT NULL,
    referral_required integer DEFAULT 0 NOT NULL,
    referral_entity text,
    observations text,
    is_confidential integer DEFAULT 1 NOT NULL,
    created_by character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: evs_followups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.evs_followups (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    worker_id character varying NOT NULL,
    control_id character varying,
    incident_id character varying,
    case_number text,
    category public.evs_control_category NOT NULL,
    open_date date NOT NULL,
    initial_assessment text NOT NULL,
    risk_level text NOT NULL,
    intervention_plan text,
    treatment_type text,
    referral_entity text,
    referral_date date,
    worker_commitments text,
    company_commitments text,
    next_review_date date,
    followup_notes text,
    last_followup_date date,
    total_followups integer DEFAULT 0 NOT NULL,
    status public.evs_followup_status DEFAULT 'activo'::public.evs_followup_status NOT NULL,
    close_date date,
    close_reason text,
    outcome text,
    is_confidential integer DEFAULT 1 NOT NULL,
    access_log text,
    responsible_professional text,
    created_by character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: evs_incidents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.evs_incidents (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    worker_id character varying,
    control_id character varying,
    category public.evs_control_category NOT NULL,
    incident_type text NOT NULL,
    incident_date date NOT NULL,
    incident_time text,
    incident_location text,
    description text NOT NULL,
    reported_by text NOT NULL,
    reporter_position text,
    witnesses text[],
    immediate_measures text,
    was_removed integer DEFAULT 0 NOT NULL,
    medical_assessment integer DEFAULT 0 NOT NULL,
    disciplinary_action text,
    requires_followup integer DEFAULT 1 NOT NULL,
    commitment_signed integer DEFAULT 0 NOT NULL,
    commitment_date date,
    status text DEFAULT 'abierto'::text NOT NULL,
    closure_date date,
    closure_reason text,
    created_by character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: evs_participants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.evs_participants (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    activity_id character varying NOT NULL,
    worker_id character varying,
    worker_name text NOT NULL,
    worker_document text,
    worker_area text,
    attended integer DEFAULT 0 NOT NULL,
    attendance_date date,
    attendance_time text,
    pre_evaluation numeric(5,2),
    post_evaluation numeric(5,2),
    observations text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: evs_programs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.evs_programs (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    year integer NOT NULL,
    name text NOT NULL,
    policy text NOT NULL,
    objectives text NOT NULL,
    scope text,
    diagnostic_summary text,
    identified_risks text[],
    priority_areas text[],
    responsible_name text NOT NULL,
    responsible_position text,
    responsible_email text,
    approved_budget numeric(12,2),
    executed_budget numeric(12,2),
    start_date date NOT NULL,
    end_date date NOT NULL,
    participation_target integer,
    compliance_target integer,
    status public.evs_program_status DEFAULT 'borrador'::public.evs_program_status NOT NULL,
    approved_by character varying,
    approved_at timestamp without time zone,
    created_by character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: hallazgos_auditoria; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hallazgos_auditoria (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    auditoria_id character varying NOT NULL,
    numero_hallazgo text NOT NULL,
    tipo public.hallazgo_tipo NOT NULL,
    severidad public.hallazgo_severidad NOT NULL,
    descripcion text NOT NULL,
    requisito text NOT NULL,
    clausula_referencia text,
    area_afectada text NOT NULL,
    evidencia text,
    archivo_evidencia text,
    causa_raiz text,
    detectado_por text,
    detectado_por_id character varying,
    fecha_deteccion date NOT NULL,
    responsable_area text,
    responsable_area_id character varying,
    estado_cierre text DEFAULT 'abierto'::text,
    fecha_cierre date,
    verificado_por text,
    verificado_por_id character varying,
    observaciones_cierre text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: hazardous_substances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hazardous_substances (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    commercial_name text NOT NULL,
    chemical_name text,
    cas_number text,
    hazard_class public.hazard_class[] NOT NULL,
    storage_location text NOT NULL,
    usage_area text,
    quantity text,
    unit text,
    supplier text,
    emergency_phone text,
    sds_url text,
    sds_name text,
    sds_update_date date,
    control_measures text,
    required_ppe text,
    is_active integer DEFAULT 1 NOT NULL,
    observations text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: high_risk_workers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.high_risk_workers (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    worker_id character varying NOT NULL,
    actividad_riesgo text NOT NULL,
    descripcion_actividad text,
    fecha_inicio date,
    fecha_fin date,
    porcentaje_cotizacion_especial numeric,
    ultimo_mes_pagado text,
    cumple_cotizacion boolean DEFAULT false,
    soporte_pila_url text,
    observaciones text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: historial_comunicaciones_sst; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.historial_comunicaciones_sst (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    entidad text NOT NULL,
    entidad_id character varying NOT NULL,
    accion character varying(50) NOT NULL,
    descripcion text NOT NULL,
    user_id character varying NOT NULL,
    nombre_usuario text NOT NULL,
    rol_usuario text NOT NULL,
    campo_modificado text,
    valor_anterior text,
    valor_nuevo text,
    ip_address text,
    user_agent text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: hojas_seguridad; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hojas_seguridad (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    solicitud_id character varying,
    nombre_producto text NOT NULL,
    nombre_comercial text,
    fabricante text,
    proveedor text,
    numero_onu text,
    numero_cas text,
    clasificacion_peligro text,
    pictogramas text,
    palabra_advertencia text,
    indicaciones_peligro text,
    consejos_seguridad text,
    componentes_peligrosos text,
    concentracion text,
    primerosauxilios text,
    medidas_lucha_incendios text,
    medidas_vertides_accidentales text,
    precauciones_manipulacion text,
    condiciones_almacenamiento text,
    proteccion_respiratoria text,
    proteccion_manos text,
    proteccion_ojos text,
    proteccion_cuerpo text,
    archivo_msds_url text,
    archivo_ficha_tecnica_url text,
    fecha_emision date,
    fecha_revision date,
    version text,
    observaciones text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: indicadores_sst; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.indicadores_sst (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    objetivo_id character varying,
    tipo public.tipo_indicador NOT NULL,
    nombre text NOT NULL,
    definicion text NOT NULL,
    interpretacion text NOT NULL,
    formula text NOT NULL,
    fuente_informacion text NOT NULL,
    meta text NOT NULL,
    valor_meta integer,
    unidad_medida text,
    frecuencia_medicion public.frecuencia_indicador NOT NULL,
    responsables text NOT NULL,
    es_calculo_automatico integer DEFAULT 0 NOT NULL,
    codigo_calculo text,
    normas_relacionadas text,
    activo integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: inspecciones_peligros_vinculados; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inspecciones_peligros_vinculados (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    inspeccion_id character varying NOT NULL,
    peligro_id character varying NOT NULL,
    estado_control public.estado_control_inspeccion DEFAULT 'conforme'::public.estado_control_inspeccion NOT NULL,
    hallazgos text,
    evidencia_fotografica text,
    verificado_por character varying,
    fecha_verificacion timestamp without time zone DEFAULT now() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: inspecciones_recursos_emergencia; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inspecciones_recursos_emergencia (
    id character varying DEFAULT (gen_random_uuid())::text NOT NULL,
    recurso_id character varying NOT NULL,
    inspector_id character varying NOT NULL,
    fecha_inspeccion date DEFAULT CURRENT_DATE NOT NULL,
    tipo_inspeccion character varying(100) DEFAULT 'rutinaria'::character varying NOT NULL,
    resultado character varying(50) DEFAULT 'conforme'::character varying NOT NULL,
    checklist_items jsonb,
    hallazgos text,
    acciones_correctivas text,
    fecha_proxima_inspeccion date,
    observaciones text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: inspections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inspections (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    area text NOT NULL,
    inspector text NOT NULL,
    date date NOT NULL,
    findings integer DEFAULT 0 NOT NULL,
    compliance integer NOT NULL,
    observations text,
    status public.inspection_status DEFAULT 'pendiente'::public.inspection_status NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: internal_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.internal_messages (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    sender_id character varying NOT NULL,
    sender_name text NOT NULL,
    sender_role public.user_role NOT NULL,
    receiver_id character varying NOT NULL,
    receiver_name text NOT NULL,
    receiver_role public.user_role NOT NULL,
    subject text NOT NULL,
    content text NOT NULL,
    status public.message_status DEFAULT 'unread'::public.message_status NOT NULL,
    priority public.message_priority DEFAULT 'normal'::public.message_priority NOT NULL,
    related_entity text,
    related_entity_id character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    read_at timestamp without time zone,
    archived_at timestamp without time zone
);


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoices (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    subscription_id character varying NOT NULL,
    transaction_id character varying,
    invoice_number text NOT NULL,
    status public.invoice_status DEFAULT 'draft'::public.invoice_status NOT NULL,
    subtotal integer NOT NULL,
    tax_amount integer DEFAULT 0 NOT NULL,
    total integer NOT NULL,
    currency text DEFAULT 'COP'::text NOT NULL,
    period_start timestamp without time zone NOT NULL,
    period_end timestamp without time zone NOT NULL,
    issue_date timestamp without time zone DEFAULT now() NOT NULL,
    due_date timestamp without time zone NOT NULL,
    paid_date timestamp without time zone,
    customer_name text NOT NULL,
    customer_nit text NOT NULL,
    customer_email text NOT NULL,
    customer_address text,
    line_items text NOT NULL,
    dian_cufe text,
    dian_xml_url text,
    dian_pdf_url text,
    pdf_url text,
    email_sent_at timestamp without time zone,
    email_sent_to text,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: job_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_profiles (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    risk_class public.risk_level NOT NULL,
    risk_factors text[],
    physical_demands text,
    mental_demands text,
    required_ppe text[],
    required_exams text[],
    exam_frequency_months integer,
    required_trainings text[],
    linked_role public.user_role,
    is_active integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: lecturas_comunicacion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lecturas_comunicacion (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    comunicacion_id character varying NOT NULL,
    user_id character varying,
    worker_id character varying,
    confirmado integer DEFAULT 0 NOT NULL,
    fecha_lectura timestamp without time zone,
    comentarios text,
    calificacion integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: matrices_iperc; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.matrices_iperc (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    nombre text NOT NULL,
    codigo text,
    area text NOT NULL,
    proceso text,
    responsable_evaluacion text NOT NULL,
    responsable_evaluacion_id character varying,
    cargo_responsable text,
    fecha_evaluacion date NOT NULL,
    fecha_proxima_revision date,
    fecha_aprobacion date,
    estado public.estado_matriz_iperc DEFAULT 'borrador'::public.estado_matriz_iperc NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    alcance text,
    metodologia text DEFAULT 'GTC-45'::text NOT NULL,
    observaciones text,
    aprobado_por text,
    aprobado_por_id character varying,
    cargo_aprobador text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    vigencia_desde date,
    vigencia_hasta date,
    vigente_auto integer DEFAULT 1 NOT NULL
);


--
-- Name: matriz_legal; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.matriz_legal (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    norma text NOT NULL,
    fecha_emision date,
    entidad_emisora text,
    categoria public.categoria_norma NOT NULL,
    titulo text NOT NULL,
    descripcion text,
    articulos_aplicables text,
    obligaciones text NOT NULL,
    alcance text,
    estado_cumplimiento public.estado_cumplimiento DEFAULT 'no-cumple'::public.estado_cumplimiento NOT NULL,
    responsable_cumplimiento text,
    periodicidad text,
    evidencias text,
    documento_url text,
    documento_nombre text,
    fecha_ultima_verificacion date,
    fecha_proxima_verificacion date,
    observaciones text,
    planes_accion text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    validacion_automatica integer DEFAULT 0,
    codigo_validacion character varying(255),
    estado_automatico public.estado_cumplimiento,
    ultima_validacion_automatica timestamp without time zone
);


--
-- Name: medical_exams; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.medical_exams (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    worker_id character varying NOT NULL,
    job_profile_id character varying,
    exam_type public.medical_exam_type NOT NULL,
    scheduled_date date NOT NULL,
    performed_date date,
    medical_center text,
    attending_physician text,
    aptitude public.medical_aptitude,
    restrictions text,
    recommendations text,
    follow_up_date date,
    exam_results text,
    status public.medical_exam_status DEFAULT 'programado'::public.medical_exam_status NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: mediciones_indicadores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mediciones_indicadores (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    indicador_id character varying NOT NULL,
    periodo text NOT NULL,
    fecha_medicion date NOT NULL,
    valor_medido text NOT NULL,
    valor_numero integer,
    cumple_meta integer,
    desviacion integer,
    analisis text,
    acciones_correctivas text,
    responsable_medicion text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: miembros_brigada; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.miembros_brigada (
    id character varying DEFAULT (gen_random_uuid())::text NOT NULL,
    brigada_id character varying NOT NULL,
    trabajador_id character varying NOT NULL,
    rol character varying(100) NOT NULL,
    fecha_ingreso date DEFAULT CURRENT_DATE NOT NULL,
    estado character varying(50) DEFAULT 'activo'::character varying NOT NULL,
    certificaciones text,
    fecha_ultima_capacitacion date,
    aptitud_medica character varying(50) DEFAULT 'apto'::character varying,
    observaciones text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: objetivos_sst; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.objetivos_sst (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    nombre text NOT NULL,
    descripcion text NOT NULL,
    meta text NOT NULL,
    valor_meta integer,
    area text,
    responsable text NOT NULL,
    categoria_objetivo text,
    alineado_con_norma text,
    anio integer NOT NULL,
    frecuencia_revision public.frecuencia_indicador DEFAULT 'trimestral'::public.frecuencia_indicador NOT NULL,
    estado public.estado_objetivo DEFAULT 'activo'::public.estado_objetivo NOT NULL,
    fecha_inicio date NOT NULL,
    fecha_fin date NOT NULL,
    fecha_ultima_revision date,
    observaciones text,
    planes_accion text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: occupational_diseases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.occupational_diseases (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    worker_id character varying NOT NULL,
    disease_name text NOT NULL,
    diagnosis text NOT NULL,
    diagnosis_date date NOT NULL,
    exposure_factor text,
    status public.disease_status DEFAULT 'activo'::public.disease_status NOT NULL,
    treatment text,
    follow_up_date date,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    symptoms text,
    years_of_exposure integer,
    detailed_risk_agent text,
    ips_name text,
    diagnostic_tests text,
    work_area_exposure text,
    protective_equipment text,
    was_hospitalized integer DEFAULT 0,
    incapacity_days integer,
    preventive_measures text,
    arl_code text,
    eps_code text
);


--
-- Name: participantes_revision; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.participantes_revision (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    revision_id character varying NOT NULL,
    company_id character varying NOT NULL,
    user_id character varying,
    nombre text NOT NULL,
    cargo text,
    area text,
    rol public.tipo_participante_revision NOT NULL,
    firma_digital text,
    asistio integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: participantes_simulacro; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.participantes_simulacro (
    id character varying DEFAULT (gen_random_uuid())::text NOT NULL,
    simulacro_id character varying NOT NULL,
    trabajador_id character varying NOT NULL,
    rol_asignado character varying(100),
    asistio boolean DEFAULT false,
    desempeno character varying(50),
    observaciones text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: payment_sources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_sources (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    subscription_id character varying NOT NULL,
    wompi_payment_source_id integer NOT NULL,
    wompi_token text,
    type public.payment_source_type NOT NULL,
    status public.payment_source_status DEFAULT 'available'::public.payment_source_status NOT NULL,
    card_brand text,
    card_last_four text,
    card_expiry_month integer,
    card_expiry_year integer,
    card_holder_name text,
    account_holder_name text,
    customer_email text NOT NULL,
    is_default integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: payment_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_transactions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    subscription_id character varying NOT NULL,
    payment_source_id character varying,
    wompi_transaction_id text,
    wompi_reference text NOT NULL,
    type public.transaction_type NOT NULL,
    status public.transaction_status DEFAULT 'PENDING'::public.transaction_status NOT NULL,
    amount integer NOT NULL,
    currency text DEFAULT 'COP'::text NOT NULL,
    period_start timestamp without time zone,
    period_end timestamp without time zone,
    wompi_payment_method text,
    wompi_status_message text,
    wompi_error_code text,
    description text,
    receipt_url text,
    invoice_id character varying,
    paid_at timestamp without time zone,
    failed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: peligros_iperc; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.peligros_iperc (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    matriz_id character varying NOT NULL,
    clasificacion public.clasificacion_peligro NOT NULL,
    subclasificacion text,
    descripcion_peligro text NOT NULL,
    fuente_generadora text NOT NULL,
    actividad_proceso text NOT NULL,
    ubicacion text,
    numero_personas_expuestas integer NOT NULL,
    tipo_exposicion text,
    tiempo_exposicion text,
    efectos_posibles text NOT NULL,
    parte_cuerpo_afectada text,
    nivel_probabilidad public.nivel_probabilidad NOT NULL,
    nivel_severidad public.nivel_severidad NOT NULL,
    valor_riesgo integer NOT NULL,
    nivel_riesgo public.nivel_riesgo NOT NULL,
    controles_existentes text,
    efectividad_controles_existentes text,
    requiere_controles integer DEFAULT 1 NOT NULL,
    controles_propuestos text,
    tipo_control_principal public.tipo_control,
    tipo_control_secundario public.tipo_control,
    responsable_implementacion text,
    responsable_implementacion_id character varying,
    fecha_implementacion_propuesta date,
    estado_implementacion text DEFAULT 'pendiente'::text,
    fecha_implementacion_real date,
    nivel_probabilidad_residual public.nivel_probabilidad,
    nivel_severidad_residual public.nivel_severidad,
    valor_riesgo_residual integer,
    nivel_riesgo_residual public.nivel_riesgo,
    observaciones text,
    requiere_seguimiento integer DEFAULT 1 NOT NULL,
    proxima_revision date,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: peligros_trabajadores_asignacion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.peligros_trabajadores_asignacion (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    peligro_id character varying NOT NULL,
    department text,
    "position" text,
    asignado_por character varying,
    fecha_asignacion timestamp without time zone DEFAULT now() NOT NULL,
    activo integer DEFAULT 1 NOT NULL,
    observaciones text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT peligros_asignacion_dept_or_position_check CHECK (((department IS NOT NULL) OR ("position" IS NOT NULL)))
);


--
-- Name: pesv_audits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pesv_audits (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    audit_date date NOT NULL,
    auditor text NOT NULL,
    auditor_entity text,
    scope text NOT NULL,
    step1_leader integer DEFAULT 0 NOT NULL,
    step2_committee integer DEFAULT 0 NOT NULL,
    step3_policy integer DEFAULT 0 NOT NULL,
    step4_leadership integer DEFAULT 0 NOT NULL,
    step5_diagnosis integer DEFAULT 0 NOT NULL,
    step6_risk_assessment integer DEFAULT 0 NOT NULL,
    step7_objectives integer DEFAULT 0 NOT NULL,
    step8_critical_risks integer DEFAULT 0 NOT NULL,
    step9_annual_plan integer DEFAULT 0 NOT NULL,
    step10_training integer DEFAULT 0 NOT NULL,
    step11_fatigue integer DEFAULT 0 NOT NULL,
    step12_emergency integer DEFAULT 0 NOT NULL,
    step13_investigation integer DEFAULT 0 NOT NULL,
    step14_safe_roads integer DEFAULT 0 NOT NULL,
    step15_driver_selection integer DEFAULT 0 NOT NULL,
    step16_vehicle_inspection integer DEFAULT 0 NOT NULL,
    step17_maintenance integer DEFAULT 0 NOT NULL,
    step18_change_management integer DEFAULT 0 NOT NULL,
    step19_procurement integer DEFAULT 0 NOT NULL,
    step20_indicators integer DEFAULT 0 NOT NULL,
    step21_supervision integer DEFAULT 0 NOT NULL,
    step22_audit integer DEFAULT 0 NOT NULL,
    step23_improvement integer DEFAULT 0 NOT NULL,
    step24_communication integer DEFAULT 0 NOT NULL,
    policy_compliance integer DEFAULT 0 NOT NULL,
    planning_compliance integer DEFAULT 0 NOT NULL,
    implementation_compliance integer DEFAULT 0 NOT NULL,
    verification_compliance integer DEFAULT 0 NOT NULL,
    improvement_compliance integer DEFAULT 0 NOT NULL,
    total_score integer DEFAULT 0 NOT NULL,
    compliance_percentage integer DEFAULT 0 NOT NULL,
    result public.audit_result NOT NULL,
    findings text,
    recommendations text,
    action_plan text,
    status public.audit_status DEFAULT 'programada'::public.audit_status NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: plan_change_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.plan_change_history (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    subscription_id character varying NOT NULL,
    company_id character varying NOT NULL,
    old_plan_id character varying NOT NULL,
    new_plan_id character varying NOT NULL,
    billing_interval public.billing_interval NOT NULL,
    billing_cycle_days integer DEFAULT 30 NOT NULL,
    prorated_credit integer DEFAULT 0 NOT NULL,
    amount_charged integer DEFAULT 0 NOT NULL,
    wompi_transaction_id character varying,
    change_type public.plan_change_type NOT NULL,
    status public.plan_change_status DEFAULT 'pending_payment'::public.plan_change_status NOT NULL,
    validation_warnings text[] DEFAULT '{}'::text[],
    requested_by character varying,
    requested_by_role public.user_role,
    is_admin_override integer DEFAULT 0,
    ip_address text,
    user_agent text,
    metadata jsonb,
    requested_at timestamp without time zone DEFAULT now() NOT NULL,
    completed_at timestamp without time zone,
    effective_date timestamp without time zone NOT NULL
);


--
-- Name: plan_comunicacion_sst; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.plan_comunicacion_sst (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    version text DEFAULT '1.0'::text NOT NULL,
    fecha_elaboracion date NOT NULL,
    fecha_revision date,
    objetivo_general text NOT NULL,
    objetivos_especificos text[],
    alcance text NOT NULL,
    publicos_objetivo text[],
    medios_comunicacion text[],
    frecuencia_reuniones text,
    indicadores text[],
    metas_indicadores text[],
    estado text DEFAULT 'vigente'::text NOT NULL,
    observaciones text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    elaborado_por character varying NOT NULL,
    aprobado_por character varying,
    responsable_comunicacion_interna character varying,
    responsable_comunicacion_externa character varying,
    responsable_comunicacion_contratistas character varying
);


--
-- Name: planes_accion_auditoria; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.planes_accion_auditoria (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    hallazgo_id character varying NOT NULL,
    numero_accion text NOT NULL,
    tipo_accion text NOT NULL,
    descripcion_accion text NOT NULL,
    justificacion text,
    responsable text NOT NULL,
    responsable_id character varying,
    fecha_compromiso date NOT NULL,
    fecha_implementacion date,
    estado public.plan_accion_estado DEFAULT 'abierto'::public.plan_accion_estado NOT NULL,
    porcentaje_avance integer DEFAULT 0,
    observaciones_avance text,
    requiere_verificacion integer DEFAULT 1,
    fecha_verificacion date,
    verificado_por text,
    verificado_por_id character varying,
    resultado_verificacion text,
    eficaz integer,
    recursos_necesarios text,
    presupuesto_estimado integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: planes_emergencia; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.planes_emergencia (
    id character varying DEFAULT (gen_random_uuid())::text NOT NULL,
    company_id character varying NOT NULL,
    nombre character varying(255) NOT NULL,
    version character varying(50) DEFAULT '1.0'::character varying NOT NULL,
    fecha_elaboracion date DEFAULT CURRENT_DATE NOT NULL,
    fecha_ultima_revision date,
    fecha_proxima_revision date,
    objetivos text,
    alcance text,
    responsable_id character varying,
    estado character varying(50) DEFAULT 'borrador'::character varying NOT NULL,
    aprobado_por character varying,
    fecha_aprobacion date,
    ubicacion_documento text,
    observaciones text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    codigo text,
    fecha_vigencia date,
    elaborado_por text,
    revisado_por text,
    objetivo_general text,
    objetivos_especificos text,
    marco_legal text,
    descripcion_instalaciones text,
    numero_pisos integer,
    area_total integer,
    capacidad_maxima_personas integer,
    horario_operacion text,
    turnos_trabajo text,
    poblacion_fija integer,
    poblacion_flotante integer,
    poblacion_vulnerable integer,
    telefono_emergencias text,
    contacto_arl text,
    contacto_bomberos text,
    contacto_policia text,
    contacto_ambulancia text,
    contacto_defensa_civil text,
    notas text
);


--
-- Name: planes_trabajo_anual; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.planes_trabajo_anual (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    anio integer NOT NULL,
    fecha_elaboracion date NOT NULL,
    objetivo_general text NOT NULL,
    alcance text NOT NULL,
    presupuesto_total integer,
    presupuesto_ejecutado integer DEFAULT 0 NOT NULL,
    estado public.estado_plan_trabajo DEFAULT 'borrador'::public.estado_plan_trabajo NOT NULL,
    responsable_elaboracion text NOT NULL,
    cargo_responsable text NOT NULL,
    email_responsable text,
    fecha_aprobacion date,
    aprobado_por text,
    cargo_aprobador text,
    observaciones text,
    total_actividades integer DEFAULT 0 NOT NULL,
    actividades_completadas integer DEFAULT 0 NOT NULL,
    porcentaje_cumplimiento integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    matriz_iperc_id character varying,
    elaborado_por_id character varying,
    autorizado_por_id character varying,
    aprobado_por_id character varying
);


--
-- Name: politicas_sst; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.politicas_sst (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    codigo text NOT NULL,
    version text DEFAULT '1.0'::text NOT NULL,
    fecha_emision date NOT NULL,
    fecha_proxima_revision date NOT NULL,
    estado public.politica_sst_estado DEFAULT 'borrador'::public.politica_sst_estado NOT NULL,
    declaracion_compromiso text NOT NULL,
    objetivos text NOT NULL,
    alcance text NOT NULL,
    responsabilidades text NOT NULL,
    compromisos text NOT NULL,
    recursos text NOT NULL,
    revision_comunicacion text NOT NULL,
    representante_legal text NOT NULL,
    cedula_representante text NOT NULL,
    responsable_sst text NOT NULL,
    licencia_sst text,
    fecha_firma date NOT NULL,
    comunicada integer DEFAULT 0 NOT NULL,
    fecha_comunicacion date,
    observaciones text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    elaborado_por_id character varying,
    autorizado_por_id character varying,
    aprobado_por_id character varying
);


--
-- Name: preguntas_induccion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.preguntas_induccion (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    contenido_id character varying,
    pregunta text NOT NULL,
    opciones text NOT NULL,
    respuesta_correcta integer NOT NULL,
    explicacion text,
    orden integer DEFAULT 0 NOT NULL,
    activa integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: preventive_measures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.preventive_measures (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    responsible text NOT NULL,
    due_date date NOT NULL,
    status public.measure_status DEFAULT 'pendiente'::public.measure_status NOT NULL,
    priority text NOT NULL,
    related_area text,
    completed_date date,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: pricing_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pricing_config (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    min_fee_small numeric(10,2) NOT NULL,
    price_1_10 numeric(10,2) NOT NULL,
    price_11_49 numeric(10,2) NOT NULL,
    price_50_199 numeric(10,2) NOT NULL,
    price_200_plus numeric(10,2) NOT NULL,
    currency text DEFAULT 'COP'::text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    valid_from timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: pricing_plugin_invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pricing_plugin_invoices (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    subscription_id character varying NOT NULL,
    customer_id character varying NOT NULL,
    period_start timestamp without time zone NOT NULL,
    period_end timestamp without time zone NOT NULL,
    employee_count_billed integer NOT NULL,
    tier text NOT NULL,
    monthly_cost numeric(10,2) NOT NULL,
    price_per_license numeric(10,2) NOT NULL,
    minimum_fee numeric(10,2) DEFAULT 0 NOT NULL,
    payment_status text DEFAULT 'pending'::text NOT NULL,
    payment_reference text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: pricing_plugin_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pricing_plugin_subscriptions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    customer_id character varying NOT NULL,
    employee_count integer NOT NULL,
    pricing_config_id character varying,
    tier text NOT NULL,
    monthly_cost numeric(10,2) NOT NULL,
    price_per_license numeric(10,2) NOT NULL,
    minimum_fee numeric(10,2) DEFAULT 0 NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    stripe_customer_id text,
    stripe_subscription_id text
);


--
-- Name: program_training_attendance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.program_training_attendance (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    training_id character varying NOT NULL,
    worker_id character varying NOT NULL,
    attended integer DEFAULT 0 NOT NULL,
    attendance_time text,
    departure_time text,
    evaluation_score integer,
    passed integer,
    certificate_issued integer DEFAULT 0,
    certificate_number text,
    certificate_date date,
    observations text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: program_trainings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.program_trainings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    program_id character varying NOT NULL,
    topic text NOT NULL,
    description text,
    training_category text NOT NULL,
    is_obligatory integer DEFAULT 1 NOT NULL,
    legal_basis text,
    scheduled_date date NOT NULL,
    scheduled_time text,
    duration integer NOT NULL,
    frequency public.training_frequency DEFAULT 'unica'::public.training_frequency NOT NULL,
    actual_date date,
    actual_time text,
    location text,
    modality public.training_modality DEFAULT 'presencial'::public.training_modality NOT NULL,
    instructor text NOT NULL,
    instructor_qualifications text,
    responsible text,
    target_audience text NOT NULL,
    estimated_attendees integer DEFAULT 0 NOT NULL,
    actual_attendees integer DEFAULT 0,
    materials text,
    equipment text,
    requires_evaluation integer DEFAULT 1 NOT NULL,
    evaluation_score integer,
    status public.program_training_status DEFAULT 'programada'::public.program_training_status NOT NULL,
    observations text,
    attachment_url text,
    evidence_url text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: programas_capacitacion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.programas_capacitacion (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    fecha date NOT NULL,
    titulo text NOT NULL,
    archivo_url text,
    archivo_nombre text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: promotion_prevention_activities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.promotion_prevention_activities (
    id character varying DEFAULT (gen_random_uuid())::text NOT NULL,
    company_id character varying NOT NULL,
    title text NOT NULL,
    activity_type public.activity_type NOT NULL,
    objective text NOT NULL,
    scope text,
    description text,
    priority_risk_type text,
    priority_risk_description text,
    sve_program_id character varying,
    modality public.activity_modality DEFAULT 'presencial'::public.activity_modality NOT NULL,
    frequency public.activity_frequency DEFAULT 'unica'::public.activity_frequency NOT NULL,
    start_date date NOT NULL,
    end_date date,
    scheduled_time text,
    location text,
    responsible_name text NOT NULL,
    responsible_position text,
    responsible_email text,
    target_population text NOT NULL,
    estimated_participants integer,
    actual_participants integer,
    evidence_required text[],
    evidence_urls text[],
    status text DEFAULT 'programada'::text NOT NULL,
    completion_percentage integer DEFAULT 0,
    completion_date date,
    observations text,
    created_by character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: promotion_prevention_participants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.promotion_prevention_participants (
    id character varying DEFAULT (gen_random_uuid())::text NOT NULL,
    activity_id character varying NOT NULL,
    worker_id character varying,
    worker_name text NOT NULL,
    worker_document text,
    participation_role text DEFAULT 'participante'::text NOT NULL,
    attended boolean DEFAULT false,
    attendance_date date,
    observations text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: proveedores_contratistas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proveedores_contratistas (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    razon_social text NOT NULL,
    nit text NOT NULL,
    tipo_proveedor public.tipo_proveedor NOT NULL,
    tipo_servicio text NOT NULL,
    nivel_riesgo_servicio public.nivel_riesgo_servicio DEFAULT 'medio'::public.nivel_riesgo_servicio NOT NULL,
    representante_legal text,
    direccion text,
    telefono text,
    email text,
    ciudad text,
    nombre_arl text,
    numero_trabajadores integer DEFAULT 1 NOT NULL,
    nivel_riesgo_empresa public.risk_level,
    estado public.estado_proveedor DEFAULT 'evaluacion'::public.estado_proveedor NOT NULL,
    ultima_calificacion integer,
    fecha_ultima_evaluacion date,
    fecha_proxima_reevaluacion date,
    observaciones text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: provider_access_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.provider_access_logs (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    provider_id character varying NOT NULL,
    provider_name text NOT NULL,
    provider_email text NOT NULL,
    provider_role text NOT NULL,
    client_company_id character varying NOT NULL,
    client_company_name text NOT NULL,
    client_company_nit text,
    access_reason public.provider_access_reason NOT NULL,
    access_description text NOT NULL,
    ticket_number text,
    access_start timestamp without time zone DEFAULT now() NOT NULL,
    access_end timestamp without time zone,
    modules_accessed text[],
    actions_performed text,
    records_viewed integer DEFAULT 0,
    records_modified integer DEFAULT 0,
    ip_address text,
    user_agent text,
    session_id text,
    legal_basis text DEFAULT 'Ley 1581/2012 Art. 17 - Transmisión de datos para soporte técnico'::text,
    client_notified integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: puntos_encuentro; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.puntos_encuentro (
    id character varying DEFAULT (gen_random_uuid())::text NOT NULL,
    company_id character varying NOT NULL,
    plan_emergencia_id character varying,
    nombre character varying(255) NOT NULL,
    tipo character varying(100) DEFAULT 'primario'::character varying NOT NULL,
    ubicacion text NOT NULL,
    capacidad_personas integer DEFAULT 100 NOT NULL,
    distancia_edificio_metros numeric(10,2),
    acceso_vehiculos_emergencia boolean DEFAULT true,
    "señalizacion_visible" boolean DEFAULT false,
    coordenadas_gps text,
    areas_asignadas text,
    responsable_punto_id character varying,
    tiene_kit_primeros_auxilios boolean DEFAULT false,
    tiene_megafono boolean DEFAULT false,
    tiene_lista_empleados boolean DEFAULT false,
    estado character varying(50) DEFAULT 'activo'::character varying NOT NULL,
    plano_referencia text,
    observaciones text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    codigo text,
    descripcion text,
    coordenadas text,
    tiene_proteccion integer DEFAULT 0,
    es_accesible integer DEFAULT 1,
    distancia_salida_principal integer,
    responsable_id character varying,
    responsable_sustituto_id character varying,
    activo integer DEFAULT 1,
    tiene_kit integer DEFAULT 0,
    tiene_listado_personal integer DEFAULT 0,
    punto_principal integer DEFAULT 1
);


--
-- Name: recomendaciones_arl_autoridades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recomendaciones_arl_autoridades (
    id character varying DEFAULT (gen_random_uuid())::text NOT NULL,
    company_id character varying NOT NULL,
    codigo text NOT NULL,
    origen public.origen_recomendacion NOT NULL,
    nombre_entidad text NOT NULL,
    numero_documento text,
    fecha_documento date NOT NULL,
    fecha_recepcion date NOT NULL,
    tipo_recomendacion public.tipo_recomendacion NOT NULL,
    descripcion text NOT NULL,
    fundamento_legal text,
    area_afectada text,
    fecha_limite date,
    dias_plazo integer,
    plan_accion text,
    responsable text NOT NULL,
    recursos text,
    presupuesto integer,
    estado public.estado_recomendacion DEFAULT 'pendiente'::public.estado_recomendacion NOT NULL,
    porcentaje_avance integer DEFAULT 0 NOT NULL,
    fecha_implementacion date,
    verificado_por text,
    fecha_verificacion date,
    evidencia_cumplimiento text,
    documento_respuesta text,
    observaciones text,
    accidente_id character varying,
    creado_por character varying,
    actualizado_por character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: recursos_emergencia; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recursos_emergencia (
    id character varying DEFAULT (gen_random_uuid())::text NOT NULL,
    company_id character varying NOT NULL,
    plan_emergencia_id character varying,
    categoria character varying(100) NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion text,
    cantidad integer DEFAULT 1 NOT NULL,
    unidad character varying(50) DEFAULT 'unidad'::character varying,
    ubicacion text NOT NULL,
    responsable_id character varying,
    estado character varying(50) DEFAULT 'operativo'::character varying NOT NULL,
    fecha_adquisicion date,
    fecha_vencimiento date,
    fecha_ultima_inspeccion date,
    proxima_inspeccion date,
    proveedor text,
    numero_serie character varying(100),
    observaciones text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    codigo text,
    tipo text,
    ubicacion_detalle text,
    marca text,
    modelo text,
    capacidad text,
    fecha_proxima_inspeccion date,
    fecha_ultima_recarga date,
    fecha_proxima_recarga date,
    responsable_area text,
    estado_operativo text DEFAULT 'operativo'::text
);


--
-- Name: registros_induccion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.registros_induccion (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    worker_id character varying NOT NULL,
    tipo public.induction_type DEFAULT 'induccion'::public.induction_type NOT NULL,
    fecha date NOT NULL,
    hora_inicio text NOT NULL,
    duracion_minutos integer,
    responsable_nombre text NOT NULL,
    responsable_licencia text,
    eps text,
    pension text,
    arl text,
    evaluacion_sst text NOT NULL,
    evaluacion_seccion text NOT NULL,
    factores_riesgo text,
    evaluacion_maquinas text NOT NULL,
    cargo_funcion text,
    cargo_objetivo text,
    cargo_proceso text,
    tiene_experiencia integer DEFAULT 0 NOT NULL,
    tiempo_experiencia text,
    observaciones_experiencia text,
    observaciones text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: reportes_trabajadores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reportes_trabajadores (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    codigo text NOT NULL,
    reportado_por character varying,
    worker_id character varying,
    nombre_reportante text,
    departamento text,
    es_anonimo integer DEFAULT 0 NOT NULL,
    categoria public.categoria_reporte NOT NULL,
    prioridad public.prioridad_reporte DEFAULT 'media'::public.prioridad_reporte NOT NULL,
    asunto text NOT NULL,
    descripcion text NOT NULL,
    ubicacion text,
    archivos_adjuntos text[],
    estado public.estado_reporte DEFAULT 'pendiente'::public.estado_reporte NOT NULL,
    asignado_a character varying,
    fecha_asignacion timestamp without time zone,
    respuesta text,
    acciones_tomadas text,
    fecha_respuesta timestamp without time zone,
    respondido_por character varying,
    fecha_cierre timestamp without time zone,
    motivo_cierre text,
    notificar_email integer DEFAULT 1 NOT NULL,
    email_contacto text,
    tiempo_respuesta_dias integer,
    satisfaccion_reportante integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: resource_allocations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resource_allocations (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    date date NOT NULL,
    resource_type public.resource_type NOT NULL,
    cargo text,
    cedula text,
    nombre_completo text,
    nombre_equipo text,
    objeto text,
    num_unidades integer,
    serial text,
    implementos_nivel public.implement_level,
    inversion_estimada text,
    fecha_desembolso date,
    objetivo_general text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    worker_id character varying,
    elaborado_por_id character varying,
    autorizado_por_id character varying,
    aprobado_por_id character varying,
    monto_ejecutado text DEFAULT '0'::text
);


--
-- Name: responsible_designations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.responsible_designations (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    worker_id character varying NOT NULL,
    designation_date date NOT NULL,
    "position" text NOT NULL,
    responsibilities text[] NOT NULL,
    signature_url text,
    status public.designation_status DEFAULT 'activo'::public.designation_status NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    job_profile_id character varying,
    licencia_sst_numero text,
    licencia_sst_vigencia date,
    curso_50_horas boolean DEFAULT false,
    curso_50_horas_fecha date,
    nivel_formacion text
);


--
-- Name: respuestas_criterios_proveedor; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.respuestas_criterios_proveedor (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    evaluacion_id character varying NOT NULL,
    criterio_id character varying NOT NULL,
    puntaje_obtenido integer DEFAULT 0 NOT NULL,
    cumple integer DEFAULT 0 NOT NULL,
    evidencia text,
    observaciones text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: respuestas_estandares; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.respuestas_estandares (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    evaluacion_id character varying NOT NULL,
    estandar_id character varying NOT NULL,
    cumple integer NOT NULL,
    no_aplica integer DEFAULT 0 NOT NULL,
    justificacion_no_aplica text,
    puntaje_obtenido integer NOT NULL,
    puntaje_maximo integer NOT NULL,
    evidencias text,
    modo_verificacion text,
    observaciones text,
    hallazgo text,
    causa_raiz text,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: revisiones_direccion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.revisiones_direccion (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    codigo text NOT NULL,
    fecha_revision date NOT NULL,
    periodicidad text NOT NULL,
    titulo text NOT NULL,
    estado public.estado_revision_direccion DEFAULT 'programada'::public.estado_revision_direccion NOT NULL,
    lugar text,
    duracion integer,
    antecedentes text,
    resumen_ejecutivo text,
    conclusiones text,
    aprobado_por character varying,
    fecha_aprobacion date,
    proxima_revision date,
    creado_por character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: road_incidents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.road_incidents (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    vehicle_id character varying NOT NULL,
    driver_id character varying NOT NULL,
    incident_date date NOT NULL,
    incident_time text NOT NULL,
    location text NOT NULL,
    type public.incident_type NOT NULL,
    custom_type text,
    severity public.incident_severity NOT NULL,
    description text NOT NULL,
    weather_conditions text,
    road_conditions text,
    witnesses text,
    authorities_notified integer DEFAULT 0 NOT NULL,
    police_report text,
    injuries integer DEFAULT 0 NOT NULL,
    fatalities integer DEFAULT 0 NOT NULL,
    estimated_cost integer,
    root_cause text,
    corrective_actions text,
    preventive_actions text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: road_safety_attendees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.road_safety_attendees (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    training_id character varying NOT NULL,
    driver_id character varying NOT NULL,
    attended integer DEFAULT 0 NOT NULL,
    score integer,
    certificate text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: road_safety_trainings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.road_safety_trainings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    title text NOT NULL,
    description text,
    instructor text,
    training_date date NOT NULL,
    start_time text,
    end_time text,
    location text,
    topics text,
    total_attendees integer DEFAULT 0 NOT NULL,
    status public.training_status DEFAULT 'programada'::public.training_status NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: rutas_evacuacion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rutas_evacuacion (
    id character varying DEFAULT (gen_random_uuid())::text NOT NULL,
    company_id character varying NOT NULL,
    plan_emergencia_id character varying,
    nombre character varying(255) NOT NULL,
    origen text NOT NULL,
    destino_zona_id character varying,
    tipo character varying(100) DEFAULT 'principal'::character varying NOT NULL,
    distancia_metros numeric(10,2),
    tiempo_estimado_segundos integer,
    capacidad_flujo integer,
    ancho_metros numeric(5,2),
    numero_escaleras integer DEFAULT 0,
    tiene_rampa boolean DEFAULT false,
    iluminacion_emergencia boolean DEFAULT false,
    "señalizacion_fotoluminiscente" boolean DEFAULT false,
    obstaculos_identificados text,
    estado character varying(50) DEFAULT 'activa'::character varying NOT NULL,
    plano_referencia text,
    observaciones text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    zona_origen_id character varying,
    codigo text,
    descripcion text,
    punto_inicio text,
    punto_fin text,
    tiene_escaleras integer DEFAULT 0,
    senalizacion_completa integer DEFAULT 1,
    ruta_principal integer DEFAULT 1,
    activa integer DEFAULT 1
);


--
-- Name: seguimiento_recomendaciones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seguimiento_recomendaciones (
    id character varying DEFAULT (gen_random_uuid())::text NOT NULL,
    recomendacion_id character varying NOT NULL,
    fecha_seguimiento date NOT NULL,
    accion_realizada text NOT NULL,
    avance_reportado integer NOT NULL,
    observaciones text,
    registrado_por character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: seguimientos_cambios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seguimientos_cambios (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    cambio_id character varying NOT NULL,
    fecha_seguimiento date NOT NULL,
    responsable text NOT NULL,
    tipo_seguimiento text NOT NULL,
    controles_efectivos integer,
    capacitacion_completada integer,
    documentacion_actualizada integer,
    incidentes_relacionados integer DEFAULT 0 NOT NULL,
    descripcion_incidentes text,
    hallazgos text,
    no_conformidades text,
    mejoras text,
    acciones_correctivas text,
    plazo_acciones date,
    cambio_exitoso integer,
    observaciones text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: seguimientos_proveedores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seguimientos_proveedores (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    proveedor_id character varying NOT NULL,
    fecha_seguimiento date NOT NULL,
    tipo_seguimiento text NOT NULL,
    responsable text NOT NULL,
    cumple_requisitos integer,
    hallazgos text,
    no_conformidades text,
    acciones_correctivas text,
    plazo_implementacion date,
    estado_acciones text,
    observaciones text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: sesiones_induccion_virtual; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sesiones_induccion_virtual (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    worker_id character varying NOT NULL,
    token text NOT NULL,
    tipo_induccion public.induction_type DEFAULT 'induccion'::public.induction_type NOT NULL,
    estado public.sesion_induccion_estado DEFAULT 'pendiente'::public.sesion_induccion_estado NOT NULL,
    fecha_envio timestamp without time zone DEFAULT now() NOT NULL,
    fecha_expiracion timestamp without time zone NOT NULL,
    fecha_inicio timestamp without time zone,
    fecha_finalizacion timestamp without time zone,
    contenidos_vistos text DEFAULT '[]'::text NOT NULL,
    progreso_evaluacion text DEFAULT '{}'::text NOT NULL,
    puntaje_evaluacion integer,
    aprobado integer,
    firma_digital text,
    fecha_firma timestamp without time zone,
    ip_firma text,
    user_agent_firma text,
    datos_adicionales text,
    registro_induccion_id character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


--
-- Name: simulacros; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.simulacros (
    id character varying DEFAULT (gen_random_uuid())::text NOT NULL,
    company_id character varying NOT NULL,
    plan_emergencia_id character varying,
    nombre character varying(255) NOT NULL,
    tipo_emergencia character varying(100) NOT NULL,
    objetivo text NOT NULL,
    alcance text,
    fecha_programada date NOT NULL,
    hora_programada time without time zone,
    duracion_estimada_minutos integer DEFAULT 60,
    fecha_ejecucion date,
    hora_inicio time without time zone,
    hora_fin time without time zone,
    duracion_real_minutos integer,
    coordinador_id character varying,
    estado character varying(50) DEFAULT 'programado'::character varying NOT NULL,
    participantes_esperados integer DEFAULT 0,
    participantes_reales integer DEFAULT 0,
    brigadas_participantes text,
    recursos_utilizados text,
    tiempo_respuesta_segundos integer,
    tiempo_evacuacion_segundos integer,
    evaluacion_general character varying(50),
    fortalezas text,
    debilidades text,
    oportunidades_mejora text,
    plan_accion text,
    observaciones text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    codigo text,
    descripcion text,
    escenario text,
    duracion_estimada integer,
    duracion_real integer,
    tipo text,
    tiempo_evacuacion integer,
    numero_participantes integer,
    numero_evacuados integer,
    avisado integer DEFAULT 1,
    coordinador_nombre text,
    coordinador_cargo text,
    aspectos_positivos text,
    aspectos_mejorar text,
    lecciones_aprendidas text,
    calificacion_general text,
    acciones_mejora text,
    responsable_seguimiento text,
    fecha_seguimiento date,
    capacitacion_evento_id character varying
);


--
-- Name: solicitudes_adquisicion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.solicitudes_adquisicion (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    numero_solicitud text NOT NULL,
    fecha_solicitud date NOT NULL,
    solicitante text NOT NULL,
    departamento text NOT NULL,
    area text,
    tipo_adquisicion public.tipo_adquisicion NOT NULL,
    descripcion text NOT NULL,
    justificacion text NOT NULL,
    cantidad integer DEFAULT 1 NOT NULL,
    unidad text,
    presupuesto_estimado integer,
    nivel_riesgo public.nivel_riesgo_adquisicion DEFAULT 'medio'::public.nivel_riesgo_adquisicion NOT NULL,
    peligros_asociados text,
    requiere_evaluacion integer DEFAULT 1 NOT NULL,
    proveedor_propuesto_id character varying,
    proveedor_nombre text,
    estado public.estado_adquisicion DEFAULT 'solicitud'::public.estado_adquisicion NOT NULL,
    fecha_evaluacion date,
    evaluador text,
    aprobado integer,
    motivo_rechazo text,
    condiciones text,
    fecha_compra date,
    fecha_recepcion date,
    observaciones text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    recurso_financiero_id character varying
);


--
-- Name: sst_document_access_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sst_document_access_log (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    document_id character varying NOT NULL,
    user_id character varying NOT NULL,
    access_type text NOT NULL,
    accessed_at timestamp without time zone DEFAULT now() NOT NULL,
    ip_address text,
    user_agent text
);


--
-- Name: sst_document_alerts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sst_document_alerts (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    document_id character varying NOT NULL,
    alert_type text NOT NULL,
    scheduled_date timestamp without time zone NOT NULL,
    sent_at timestamp without time zone,
    recipient_ids text[] DEFAULT '{}'::text[],
    subject text,
    message text,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: sst_document_versions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sst_document_versions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    document_id character varying NOT NULL,
    version_number text NOT NULL,
    change_description text,
    change_type text,
    file_url text,
    file_name text,
    file_size integer,
    created_by character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    approved_by character varying,
    approved_at timestamp without time zone,
    previous_status public.document_status,
    new_status public.document_status
);


--
-- Name: sst_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sst_documents (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    code text NOT NULL,
    title text NOT NULL,
    description text,
    category public.document_category NOT NULL,
    sst_standards text[] DEFAULT '{}'::text[],
    phva_cycle text,
    current_version text DEFAULT '1.0'::text NOT NULL,
    status public.document_status DEFAULT 'borrador'::public.document_status NOT NULL,
    file_url text,
    file_name text,
    file_size integer,
    mime_type text,
    created_date timestamp without time zone DEFAULT now() NOT NULL,
    effective_date timestamp without time zone,
    expiration_date timestamp without time zone,
    next_review_date timestamp without time zone,
    retention_years integer DEFAULT 20 NOT NULL,
    archive_date timestamp without time zone,
    delete_after_date timestamp without time zone,
    prepared_by character varying,
    reviewed_by character varying,
    approved_by character varying,
    approval_date timestamp without time zone,
    is_confidential boolean DEFAULT false,
    access_roles text[] DEFAULT '{}'::text[],
    auto_alert_days integer DEFAULT 30,
    last_alert_sent timestamp without time zone,
    alert_recipients text[] DEFAULT '{}'::text[],
    tags text[] DEFAULT '{}'::text[],
    related_documents text[] DEFAULT '{}'::text[],
    external_references text,
    notes text,
    created_by character varying,
    updated_by character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    document_date timestamp without time zone
);


--
-- Name: sst_evaluation_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sst_evaluation_items (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    evaluation_id character varying NOT NULL,
    item_id character varying NOT NULL,
    score integer DEFAULT 0 NOT NULL,
    observations text,
    evidence_url text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: sst_evaluations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sst_evaluations (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    standard_type public.standard_type DEFAULT 'RES_0312'::public.standard_type NOT NULL,
    title text NOT NULL,
    description text,
    evaluation_date date NOT NULL,
    evaluator text NOT NULL,
    total_score integer DEFAULT 0 NOT NULL,
    max_total_score integer DEFAULT 100 NOT NULL,
    compliance_percentage integer DEFAULT 0 NOT NULL,
    status public.evaluation_status DEFAULT 'en-progreso'::public.evaluation_status NOT NULL,
    observations text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    elaborado_por_id character varying,
    autorizado_por_id character varying,
    aprobado_por_id character varying
);


--
-- Name: sst_evidence; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sst_evidence (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    evaluation_item_id character varying NOT NULL,
    file_name text NOT NULL,
    file_url text NOT NULL,
    file_type text,
    description text,
    upload_date timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: sst_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sst_items (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    standard_id character varying NOT NULL,
    item_number text NOT NULL,
    description text NOT NULL,
    evaluation_criteria text NOT NULL,
    max_score integer NOT NULL,
    "order" integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: sst_standards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sst_standards (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    standard_type public.standard_type DEFAULT 'RES_0312'::public.standard_type NOT NULL,
    name text NOT NULL,
    description text,
    phva_cycle public.phva_cycle NOT NULL,
    max_score integer NOT NULL,
    "order" integer NOT NULL,
    clause_number text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: subscription_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscription_plans (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    display_name text NOT NULL,
    description text,
    price_monthly integer NOT NULL,
    price_yearly integer,
    currency text DEFAULT 'COP'::text NOT NULL,
    max_workers integer DEFAULT 50 NOT NULL,
    max_users integer DEFAULT 3 NOT NULL,
    max_companies integer DEFAULT 1 NOT NULL,
    features text[],
    trial_days integer DEFAULT 14,
    status public.plan_status DEFAULT 'active'::public.plan_status NOT NULL,
    is_popular integer DEFAULT 0,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    tagline text,
    max_sedes integer DEFAULT 1 NOT NULL,
    storage_gb integer DEFAULT 5 NOT NULL,
    has_iperc_completo integer DEFAULT 0 NOT NULL,
    has_auditorias integer DEFAULT 0 NOT NULL,
    has_pesv integer DEFAULT 0 NOT NULL,
    has_revision_direccion integer DEFAULT 0 NOT NULL,
    has_gestion_cambios integer DEFAULT 0 NOT NULL,
    has_matriz_legal integer DEFAULT 0 NOT NULL,
    has_objetivos_indicadores integer DEFAULT 0 NOT NULL,
    has_evaluacion_proveedores integer DEFAULT 0 NOT NULL,
    has_comunicacion_sst integer DEFAULT 0 NOT NULL,
    has_adquisiciones_sst integer DEFAULT 0 NOT NULL,
    has_dashboards_ejecutivos integer DEFAULT 0 NOT NULL,
    has_pdfs_normativos integer DEFAULT 0 NOT NULL,
    has_examenes_medicos integer DEFAULT 0 NOT NULL,
    has_mediciones_ambientales integer DEFAULT 0 NOT NULL,
    has_sustancias_quimicas integer DEFAULT 0 NOT NULL,
    has_copasst integer DEFAULT 0 NOT NULL,
    has_comite_convivencia integer DEFAULT 0 NOT NULL,
    has_api integer DEFAULT 0 NOT NULL,
    has_exportacion_masiva integer DEFAULT 0 NOT NULL,
    has_white_label integer DEFAULT 0 NOT NULL,
    has_sla integer DEFAULT 0 NOT NULL,
    has_gerente_cuenta integer DEFAULT 0 NOT NULL,
    has_consultoria_sst integer DEFAULT 0 NOT NULL,
    horas_consultoria_mes integer DEFAULT 0 NOT NULL,
    support_level text DEFAULT 'email'::text NOT NULL,
    support_response_time text DEFAULT '48h'::text NOT NULL,
    capacitaciones_anuales integer DEFAULT 0 NOT NULL,
    horas_por_capacitacion integer DEFAULT 0 NOT NULL,
    is_recommended integer DEFAULT 0
);


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscriptions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    plan_id character varying NOT NULL,
    status public.subscription_status DEFAULT 'trial'::public.subscription_status NOT NULL,
    billing_interval public.billing_interval DEFAULT 'monthly'::public.billing_interval NOT NULL,
    current_period_start timestamp without time zone DEFAULT now() NOT NULL,
    current_period_end timestamp without time zone NOT NULL,
    trial_start timestamp without time zone,
    trial_end timestamp without time zone,
    cancel_at_period_end integer DEFAULT 0,
    canceled_at timestamp without time zone,
    cancellation_reason text,
    last_payment_date timestamp without time zone,
    next_payment_date timestamp without time zone,
    failed_payment_attempts integer DEFAULT 0,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    metadata jsonb,
    contract_accepted_at timestamp without time zone,
    contract_terms_version text,
    contract_data jsonb
);


--
-- Name: support_access_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.support_access_events (
    id character varying DEFAULT (gen_random_uuid())::text NOT NULL,
    session_id character varying NOT NULL,
    event_type public.support_access_event_type NOT NULL,
    actor_id character varying NOT NULL,
    actor_name text NOT NULL,
    actor_role text NOT NULL,
    details text,
    ip_address text,
    user_agent text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: support_access_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.support_access_sessions (
    id character varying DEFAULT (gen_random_uuid())::text NOT NULL,
    session_number text NOT NULL,
    support_user_id character varying NOT NULL,
    support_user_name text NOT NULL,
    company_id character varying NOT NULL,
    company_name text NOT NULL,
    status public.support_access_status DEFAULT 'pending'::public.support_access_status NOT NULL,
    justification text NOT NULL,
    scope public.support_access_scope DEFAULT 'read_only'::public.support_access_scope NOT NULL,
    related_ticket_id character varying,
    related_ticket_number text,
    approved_by character varying,
    approved_by_name text,
    approved_at timestamp without time zone,
    denial_reason text,
    requested_duration_minutes integer DEFAULT 120 NOT NULL,
    expires_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    revoked_at timestamp without time zone,
    revoked_reason text,
    legal_basis text DEFAULT 'Prestación de servicios de soporte técnico'::text,
    data_processing_purpose text DEFAULT 'Resolución de incidencia técnica'::text
);


--
-- Name: support_tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.support_tickets (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    ticket_number text NOT NULL,
    company_id character varying NOT NULL,
    company_name text NOT NULL,
    user_id character varying NOT NULL,
    user_name text NOT NULL,
    user_email text,
    subject text NOT NULL,
    description text NOT NULL,
    category public.ticket_category NOT NULL,
    priority public.ticket_priority DEFAULT 'media'::public.ticket_priority NOT NULL,
    status public.ticket_status DEFAULT 'abierto'::public.ticket_status NOT NULL,
    assigned_to character varying,
    assigned_to_name text,
    attachments text[],
    resolution text,
    resolved_at timestamp without time zone,
    resolved_by character varying,
    satisfaction_rating integer,
    satisfaction_comment text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    closed_at timestamp without time zone
);


--
-- Name: sve_cases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sve_cases (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    program_id character varying NOT NULL,
    worker_id character varying NOT NULL,
    evaluation_date date NOT NULL,
    evaluation_type public.sve_evaluation_type NOT NULL,
    evaluated_by text NOT NULL,
    findings text,
    results text,
    classification public.sve_case_status DEFAULT 'normal'::public.sve_case_status NOT NULL,
    recommendations text,
    follow_up_date date,
    interventions text,
    additional_data text,
    observations text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: sve_programs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sve_programs (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    name text NOT NULL,
    risk_type public.sve_risk_type NOT NULL,
    objective text NOT NULL,
    target_population text NOT NULL,
    inclusion_criteria text,
    exclusion_criteria text,
    protocol text,
    prevention_activities text,
    control_measures text,
    responsible_name text NOT NULL,
    responsible_position text,
    indicators text,
    start_date date NOT NULL,
    review_date date,
    status public.sve_program_status DEFAULT 'activo'::public.sve_program_status NOT NULL,
    observations text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: temas_revision; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.temas_revision (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    revision_id character varying NOT NULL,
    company_id character varying NOT NULL,
    titulo text NOT NULL,
    descripcion text NOT NULL,
    responsable_presentacion character varying,
    tiempo_asignado integer,
    orden integer DEFAULT 0,
    conclusiones text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    tipo text,
    datos_analisis text,
    hallazgos text,
    oportunidades_mejora text
);


--
-- Name: ticket_responses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ticket_responses (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    ticket_id character varying NOT NULL,
    user_id character varying NOT NULL,
    user_name text NOT NULL,
    user_role text NOT NULL,
    is_staff integer DEFAULT 0 NOT NULL,
    content text NOT NULL,
    attachments text[],
    is_internal integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ticket_status_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ticket_status_history (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    ticket_id character varying NOT NULL,
    previous_status public.ticket_status,
    new_status public.ticket_status NOT NULL,
    changed_by character varying NOT NULL,
    changed_by_name text NOT NULL,
    reason text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: trabajadores_alto_riesgo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trabajadores_alto_riesgo (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    worker_id character varying NOT NULL,
    fecha date NOT NULL,
    certificado_arl_url text,
    observaciones text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: training_attendees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.training_attendees (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    training_id character varying NOT NULL,
    worker_id character varying NOT NULL,
    attended integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: training_programs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.training_programs (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    year integer NOT NULL,
    title text NOT NULL,
    general_objective text NOT NULL,
    specific_objectives text NOT NULL,
    scope text NOT NULL,
    target_population text NOT NULL,
    responsible text NOT NULL,
    copasst_approval integer DEFAULT 0,
    copasst_approval_date date,
    human_resources text,
    technical_resources text,
    financial_budget integer,
    methodology text,
    status public.training_program_status DEFAULT 'borrador'::public.training_program_status NOT NULL,
    observations text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: trainings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trainings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    title text NOT NULL,
    description text,
    instructor text,
    date date NOT NULL,
    start_time text,
    end_time text,
    location text,
    total_workers integer DEFAULT 0 NOT NULL,
    status public.training_status DEFAULT 'programada'::public.training_status NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    validity_months integer
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    role public.user_role DEFAULT 'trabajador'::public.user_role NOT NULL,
    company_id character varying,
    worker_id character varying,
    full_name text,
    email text,
    department text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    email_verification_token text,
    email_verification_expires timestamp without time zone,
    email_verified_at timestamp without time zone,
    selected_plan character varying,
    trial_ends_at timestamp without time zone,
    support_specialties text[],
    password_reset_token text,
    password_reset_expires timestamp without time zone,
    sst_profession_type public.sst_profession_type,
    sst_license_number text,
    sst_license_issuer text,
    sst_license_issued_at date,
    sst_license_expires_at date,
    sst_license_status public.sst_license_status
);


--
-- Name: vehicle_inspections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vehicle_inspections (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    vehicle_id character varying NOT NULL,
    driver_id character varying NOT NULL,
    inspection_date date NOT NULL,
    inspection_time text NOT NULL,
    tires integer DEFAULT 0 NOT NULL,
    lights integer DEFAULT 0 NOT NULL,
    mirrors integer DEFAULT 0 NOT NULL,
    bodywork integer DEFAULT 0 NOT NULL,
    seatbelts integer DEFAULT 0 NOT NULL,
    horn integer DEFAULT 0 NOT NULL,
    windshield integer DEFAULT 0 NOT NULL,
    instruments integer DEFAULT 0 NOT NULL,
    brakes integer DEFAULT 0 NOT NULL,
    steering integer DEFAULT 0 NOT NULL,
    suspension integer DEFAULT 0 NOT NULL,
    fluids integer DEFAULT 0 NOT NULL,
    fire_extinguisher integer DEFAULT 0 NOT NULL,
    first_aid_kit integer DEFAULT 0 NOT NULL,
    reflective_triangles integer DEFAULT 0 NOT NULL,
    safety_vest integer DEFAULT 0 NOT NULL,
    result public.inspection_result NOT NULL,
    observations text,
    corrective_actions text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: vehicles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vehicles (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    plate text NOT NULL,
    brand text NOT NULL,
    model text NOT NULL,
    year integer NOT NULL,
    type public.vehicle_type NOT NULL,
    ownership public.vehicle_ownership NOT NULL,
    capacity integer,
    mileage integer,
    color text,
    vin text,
    insurance_policy text,
    insurance_expiry date,
    soat_expiry date,
    technical_review_expiry date,
    status public.vehicle_status DEFAULT 'activo'::public.vehicle_status NOT NULL,
    observations text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: verificaciones_adquisicion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.verificaciones_adquisicion (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    solicitud_id character varying NOT NULL,
    fecha_verificacion date NOT NULL,
    verificador text NOT NULL,
    cumple_especificaciones integer,
    especificaciones_incumplidas text,
    recibi_msds integer DEFAULT 0 NOT NULL,
    recibi_ficha_tecnica integer DEFAULT 0 NOT NULL,
    recibi_manual integer DEFAULT 0 NOT NULL,
    recibi_certificaciones integer DEFAULT 0 NOT NULL,
    estado_producto text,
    hallazgos text,
    acciones_tomadas text,
    requiere_devolucion integer DEFAULT 0 NOT NULL,
    motivo_devolucion text,
    observaciones text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: verificaciones_muestreo_sgss; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.verificaciones_muestreo_sgss (
    id character varying(36) DEFAULT (gen_random_uuid())::text NOT NULL,
    company_id character varying(36) NOT NULL,
    fecha date NOT NULL,
    periodo_verificado character varying(20) NOT NULL,
    total_trabajadores integer DEFAULT 0 NOT NULL,
    total_contratistas integer DEFAULT 0 NOT NULL,
    muestra_requerida integer DEFAULT 0 NOT NULL,
    muestra_verificada integer DEFAULT 0 NOT NULL,
    porcentaje_cumplimiento numeric(5,2) DEFAULT 0,
    pila_file_url text,
    observaciones text,
    estado character varying(20) DEFAULT 'en_proceso'::character varying,
    verificado_por character varying(36),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    estandar_codigo text,
    trabajadores_nominados integer,
    porcentaje_muestreo integer,
    modo_seleccion text,
    fecha_verificacion date,
    periodo_verificado_desde date,
    periodo_verificado_hasta date,
    pila_meses_verificados integer,
    responsable_verificacion text,
    cargo_responsable text,
    observaciones_generales text,
    evidencia_general_url text
);


--
-- Name: worker_portal_access_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.worker_portal_access_logs (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    user_id character varying,
    worker_id character varying,
    access_time timestamp without time zone DEFAULT now() NOT NULL,
    ip_address text,
    user_agent text,
    device_type public.device_type,
    user_name text,
    worker_name text
);


--
-- Name: workers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workers (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    name text NOT NULL,
    "position" text NOT NULL,
    department text NOT NULL,
    contract_type public.contract_type NOT NULL,
    contract_number text NOT NULL,
    start_date date NOT NULL,
    end_date date,
    status public.worker_status DEFAULT 'activo'::public.worker_status NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    identification_number text,
    email text,
    eps_nombre text,
    arl_nombre text,
    afp_nombre text,
    ccf_nombre text,
    job_profile_id character varying
);


--
-- Name: zonas_evacuacion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.zonas_evacuacion (
    id character varying DEFAULT (gen_random_uuid())::text NOT NULL,
    company_id character varying NOT NULL,
    plan_emergencia_id character varying,
    nombre character varying(255) NOT NULL,
    tipo character varying(100) DEFAULT 'zona_segura'::character varying NOT NULL,
    ubicacion text NOT NULL,
    capacidad_personas integer DEFAULT 50 NOT NULL,
    nivel_piso character varying(20),
    "señalizacion_adecuada" boolean DEFAULT false,
    iluminacion_emergencia boolean DEFAULT false,
    accesibilidad_discapacidad boolean DEFAULT false,
    responsable_zona_id character varying,
    coordenadas_gps text,
    plano_referencia text,
    estado character varying(50) DEFAULT 'activa'::character varying NOT NULL,
    observaciones text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    codigo text,
    descripcion text,
    piso text,
    area text,
    coordinador_id character varying,
    coordinador_sustituto_id character varying,
    punto_encuentro_id character varying,
    instrucciones_evacuacion text,
    activa integer DEFAULT 1,
    consideraciones_especiales text
);


--
-- Name: _migrations; Type: TABLE; Schema: stripe; Owner: -
--

CREATE TABLE stripe._migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: customers; Type: TABLE; Schema: stripe; Owner: -
--

CREATE TABLE stripe.customers (
    id text NOT NULL,
    object text,
    address jsonb,
    description text,
    email text,
    metadata jsonb,
    name text,
    phone text,
    shipping jsonb,
    balance integer,
    created integer,
    currency text,
    default_source text,
    delinquent boolean,
    discount jsonb,
    invoice_prefix text,
    invoice_settings jsonb,
    livemode boolean,
    next_invoice_sequence integer,
    preferred_locales jsonb,
    tax_exempt text
);


--
-- Name: prices; Type: TABLE; Schema: stripe; Owner: -
--

CREATE TABLE stripe.prices (
    id text NOT NULL,
    object text,
    active boolean,
    currency text,
    metadata jsonb,
    nickname text,
    recurring jsonb,
    type stripe.pricing_type,
    unit_amount integer,
    billing_scheme text,
    created integer,
    livemode boolean,
    lookup_key text,
    tiers_mode stripe.pricing_tiers,
    transform_quantity jsonb,
    unit_amount_decimal text,
    product text
);


--
-- Name: products; Type: TABLE; Schema: stripe; Owner: -
--

CREATE TABLE stripe.products (
    id text NOT NULL,
    object text,
    active boolean,
    description text,
    metadata jsonb,
    name text,
    created integer,
    images jsonb,
    livemode boolean,
    package_dimensions jsonb,
    shippable boolean,
    statement_descriptor text,
    unit_label text,
    updated integer,
    url text
);


--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: -
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: -
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
\.


--
-- Data for Name: accidents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.accidents (id, company_id, worker_id, type, custom_type, description, severity, date, "time", location, witnesses, actions_taken, created_at, body_part_affected, injury_nature, medical_diagnosis, ips_name, accident_mechanism, causative_agent, journey_type, accident_classification, was_hospitalized, er_referral) FROM stdin;
5cc144f2-b7db-404c-8293-081e5c3cdc8b	76050645-7d63-46af-953b-bc86727b596f	ee616a95-a43f-44ee-bab5-124955c5e223	corte	\N	Corte superficial en mano derecha al manipular lámina metálica sin guantes de protección	leve	2024-10-15	10:30	Área de Producción - Zona de Corte	Carlos Rodríguez, Ana Martínez	Primeros auxilios en enfermería, se proporcionaron guantes de corte nivel 5	2025-12-02 14:46:08.375819	Mano derecha	Herida cortante	\N	\N	Contacto con objeto cortante	Lámina metálica	ordinaria	normal	0	0
d9ccf8e2-aa9d-40f9-8441-b1a627b547d5	76050645-7d63-46af-953b-bc86727b596f	3c13f96f-f86a-4572-af76-a319721b5d01	golpe	\N	Golpe en cabeza por caída de herramienta desde andamio	leve	2024-11-05	14:45	Área de Mantenimiento - Taller	Pedro Sánchez	Atención en enfermería, instalación de redes de protección	2025-12-02 14:46:08.375819	Cabeza	Contusión	\N	\N	Golpe por objeto	Llave de tubo	ordinaria	normal	0	1
\.


--
-- Data for Name: acciones_mejora; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.acciones_mejora (id, evaluacion_id, respuesta_estandar_id, descripcion_accion, objetivo, tipo_accion, prioridad, responsable, area_responsable, recursos_necesarios, presupuesto_estimado, fecha_inicio, fecha_compromiso, fecha_ejecucion, estado, porcentaje_avance, indicador_eficacia, resultado_esperado, resultado_obtenido, eficaz, observaciones, created_at, updated_at) FROM stdin;
aa002825-ddf2-4a96-b5d9-589816038e72	690f3be0-2d35-4397-b3bb-59f782bfac8d	040637c1-ef5e-4515-a8d9-8a3123fd8c79	Incumplimiento del Estándar 1.1.1 - Responsable del Sistema de Gestión de Seguridad y Salud en el Trabajo SG-SST	Lograr el cumplimiento del estándar 1.1.1 según los requisitos de la Resolución 0312/2019	correctiva	alta	Administrador del Sistema	SST		\N	2025-12-17	2026-03-17	\N	completada	100	Cumplimiento del estándar en próxima evaluación	Estándar cumplido al 100%	Estándar cumplido - verificado en evaluación SST	\N	\N	2025-12-17 12:29:34.054396	2025-12-18 20:41:39.52897
d848615c-a0ab-4743-a136-92f213c7aefc	690f3be0-2d35-4397-b3bb-59f782bfac8d	04abf368-40dd-4140-98f5-ca1fc21bad91	Incumplimiento del Estándar 1.1.2 - Responsabilidades en el Sistema de Gestión de Seguridad y Salud en el Trabajo – SG-SST	Lograr el cumplimiento del estándar 1.1.2 según los requisitos de la Resolución 0312/2019	correctiva	alta	Administrador del Sistema	SST		\N	2025-12-18	2026-03-18	\N	completada	100	Cumplimiento del estándar en próxima evaluación	Estándar cumplido al 100%	Estándar cumplido - verificado en evaluación SST	\N	\N	2025-12-18 20:44:26.538804	2025-12-18 20:44:50.146611
f34cfbdd-cb39-4ac8-b714-2d229ca93e08	690f3be0-2d35-4397-b3bb-59f782bfac8d	5203c0f4-bd7f-42f8-a6dc-e26b7a7c9528	Incumplimiento del Estándar 1.1.3 - Asignación de recursos para el Sistema de Gestión en Seguridad y Salud en el Trabajo – SG-SST	Lograr el cumplimiento del estándar 1.1.3 según los requisitos de la Resolución 0312/2019	correctiva	alta	Administrador del Sistema	SST		\N	2025-12-18	2026-03-18	\N	completada	100	Cumplimiento del estándar en próxima evaluación	Estándar cumplido al 100%	Estándar cumplido - verificado en evaluación SST	\N	\N	2025-12-18 20:46:08.002026	2025-12-18 21:52:07.141564
\.


--
-- Data for Name: acciones_revision; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.acciones_revision (id, revision_id, company_id, decision_id, tipo, descripcion, responsable, fecha_compromiso, fecha_cumplimiento, estado, prioridad, recursos, observaciones, created_at, updated_at, responsable_nombre, avance_descripcion, porcentaje_avance, evidencia_url, fecha_implementacion, verificado_por, fecha_verificacion, eficaz, observaciones_verificacion) FROM stdin;
\.


--
-- Data for Name: actividades_plan_trabajo; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.actividades_plan_trabajo (id, plan_trabajo_id, programa, programa_otro, actividad, objetivo, meta, responsable, cargo, area_responsable, mes, trimestre, fecha_inicio, fecha_fin, recursos_humanos, recursos_financieros, recursos_tecnicos, indicador, meta_indicador, valor_indicador, estado, porcentaje_avance, evidencias, archivo_url, archivo_nombre, observaciones, fecha_reprogramacion, motivo_reprogramacion, created_at, updated_at, recursos_administrativos, recursos_financieros_check, ejecutado) FROM stdin;
3d881f74-550d-4d98-8c75-3592475db058	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Seguimiento de Exámenes Médicos (Ingreso, Periódicos, Retiro)	Controlar la realización de exámenes ocupacionales	100% de exámenes registrados	Responsable SG-SST	Responsable SG-SST	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:14.653329	2025-12-15 21:31:14.653329	f	f	f
135f490e-6f31-44e2-8cd3-5bf65ba31bf4	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Seguimiento de Exámenes Médicos (Ingreso, Periódicos, Retiro)	Controlar la realización de exámenes ocupacionales	100% de exámenes registrados	Responsable SG-SST	Responsable SG-SST	\N	febrero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:14.981035	2025-12-15 21:31:14.981035	f	f	f
bf3fec00-3c32-4118-a468-77f8bbb8693e	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Seguimiento de Exámenes Médicos (Ingreso, Periódicos, Retiro)	Controlar la realización de exámenes ocupacionales	100% de exámenes registrados	Responsable SG-SST	Responsable SG-SST	\N	marzo	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:15.333343	2025-12-15 21:31:15.333343	f	f	f
1f04cde1-aa39-4406-bd7b-e0fbf4a0f483	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Seguimiento de Exámenes Médicos (Ingreso, Periódicos, Retiro)	Controlar la realización de exámenes ocupacionales	100% de exámenes registrados	Responsable SG-SST	Responsable SG-SST	\N	abril	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:15.661396	2025-12-15 21:31:15.661396	f	f	f
7bd8197b-c1ec-4f5d-aae6-8129f94d0091	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Seguimiento de Exámenes Médicos (Ingreso, Periódicos, Retiro)	Controlar la realización de exámenes ocupacionales	100% de exámenes registrados	Responsable SG-SST	Responsable SG-SST	\N	mayo	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:15.986185	2025-12-15 21:31:15.986185	f	f	f
64786e91-52af-4ef1-b782-44f8ff2281ce	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Seguimiento de Exámenes Médicos (Ingreso, Periódicos, Retiro)	Controlar la realización de exámenes ocupacionales	100% de exámenes registrados	Responsable SG-SST	Responsable SG-SST	\N	junio	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:16.315807	2025-12-15 21:31:16.315807	f	f	f
39ab6156-fb96-499f-bd30-2f7188620d88	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Seguimiento de Exámenes Médicos (Ingreso, Periódicos, Retiro)	Controlar la realización de exámenes ocupacionales	100% de exámenes registrados	Responsable SG-SST	Responsable SG-SST	\N	julio	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:16.654284	2025-12-15 21:31:16.654284	f	f	f
5bd8dfc5-e4cb-4d54-ba34-494b7b928b7e	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Seguimiento de Exámenes Médicos (Ingreso, Periódicos, Retiro)	Controlar la realización de exámenes ocupacionales	100% de exámenes registrados	Responsable SG-SST	Responsable SG-SST	\N	agosto	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:16.980961	2025-12-15 21:31:16.980961	f	f	f
c126ca1b-cd00-417b-b061-3add8410b6bc	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Seguimiento de Exámenes Médicos (Ingreso, Periódicos, Retiro)	Controlar la realización de exámenes ocupacionales	100% de exámenes registrados	Responsable SG-SST	Responsable SG-SST	\N	septiembre	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:17.308819	2025-12-15 21:31:17.308819	f	f	f
f336c2a5-4470-41cc-af07-4457b32548f8	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Seguimiento de Exámenes Médicos (Ingreso, Periódicos, Retiro)	Controlar la realización de exámenes ocupacionales	100% de exámenes registrados	Responsable SG-SST	Responsable SG-SST	\N	octubre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:17.640188	2025-12-15 21:31:17.640188	f	f	f
b47dc71f-5872-4390-9bd0-58d822db27d8	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Seguimiento de Exámenes Médicos (Ingreso, Periódicos, Retiro)	Controlar la realización de exámenes ocupacionales	100% de exámenes registrados	Responsable SG-SST	Responsable SG-SST	\N	noviembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:17.964636	2025-12-15 21:31:17.964636	f	f	f
700adfc0-74cb-4555-8e46-8976411f5c42	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Seguimiento de Exámenes Médicos (Ingreso, Periódicos, Retiro)	Controlar la realización de exámenes ocupacionales	100% de exámenes registrados	Responsable SG-SST	Responsable SG-SST	\N	diciembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:18.302077	2025-12-15 21:31:18.302077	f	f	f
dfbf1664-6ee8-415c-9d33-28a7f088e22f	07b9d6f3-e4bd-4571-91b6-79eacb92e416	vigilancia-epidemiologica	\N	Evaluación y Análisis de Estadísticas de Salud	Analizar indicadores de morbilidad y accidentalidad	Informe estadístico trimestral	Responsable SG-SST	Responsable SG-SST	\N	marzo	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:18.656075	2025-12-15 21:31:18.656075	f	f	f
ccbc39a4-1acc-4859-beb3-dea0647445eb	07b9d6f3-e4bd-4571-91b6-79eacb92e416	vigilancia-epidemiologica	\N	Evaluación y Análisis de Estadísticas de Salud	Analizar indicadores de morbilidad y accidentalidad	Informe estadístico trimestral	Responsable SG-SST	Responsable SG-SST	\N	junio	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:18.985088	2025-12-15 21:31:18.985088	f	f	f
bae7e00e-28b3-4bc0-bc88-4ceab0e38eb5	07b9d6f3-e4bd-4571-91b6-79eacb92e416	vigilancia-epidemiologica	\N	Evaluación y Análisis de Estadísticas de Salud	Analizar indicadores de morbilidad y accidentalidad	Informe estadístico trimestral	Responsable SG-SST	Responsable SG-SST	\N	septiembre	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:19.312215	2025-12-15 21:31:19.312215	f	f	f
69c46d95-6dd0-4155-b374-f9a74dab7366	07b9d6f3-e4bd-4571-91b6-79eacb92e416	vigilancia-epidemiologica	\N	Evaluación y Análisis de Estadísticas de Salud	Analizar indicadores de morbilidad y accidentalidad	Informe estadístico trimestral	Responsable SG-SST	Responsable SG-SST	\N	diciembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:19.66357	2025-12-15 21:31:19.66357	f	f	f
5e1543e3-afd6-4340-a95c-714c1f41cc31	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Programa de Estilos de Vida Saludable	Promover hábitos saludables en los trabajadores	4 actividades de bienestar al año	Responsable SG-SST	Responsable SG-SST	\N	marzo	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:19.997356	2025-12-15 21:31:19.997356	f	f	f
dcd3088f-73a7-45fc-bc2e-4e2ac777b111	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Programa de Estilos de Vida Saludable	Promover hábitos saludables en los trabajadores	4 actividades de bienestar al año	Responsable SG-SST	Responsable SG-SST	\N	junio	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:20.325833	2025-12-15 21:31:20.325833	f	f	f
acaac30d-3bd9-4c93-b9e5-53eaeeab6b0d	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Programa de Estilos de Vida Saludable	Promover hábitos saludables en los trabajadores	4 actividades de bienestar al año	Responsable SG-SST	Responsable SG-SST	\N	septiembre	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:20.655045	2025-12-15 21:31:20.655045	f	f	f
2bc64103-e86c-4caf-8b35-95258112793d	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Programa de Estilos de Vida Saludable	Promover hábitos saludables en los trabajadores	4 actividades de bienestar al año	Responsable SG-SST	Responsable SG-SST	\N	diciembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:20.982479	2025-12-15 21:31:20.982479	f	f	f
ce617e02-1c65-4734-b154-a8b63e59f99b	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Registro y Seguimiento de Ausentismo Laboral	Controlar el ausentismo por causas de salud	Registro mensual de ausentismo	Responsable SG-SST	Responsable SG-SST	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:21.322787	2025-12-15 21:31:21.322787	f	f	f
5c3c8cd8-4132-4c9e-857a-db6de673269e	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Registro y Seguimiento de Ausentismo Laboral	Controlar el ausentismo por causas de salud	Registro mensual de ausentismo	Responsable SG-SST	Responsable SG-SST	\N	febrero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:21.65066	2025-12-15 21:31:21.65066	f	f	f
142eb865-8e35-4c46-a8de-7841297c0043	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Registro y Seguimiento de Ausentismo Laboral	Controlar el ausentismo por causas de salud	Registro mensual de ausentismo	Responsable SG-SST	Responsable SG-SST	\N	marzo	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:21.982345	2025-12-15 21:31:21.982345	f	f	f
74d142f2-e9dc-4241-a643-c012f2ff8ffe	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Registro y Seguimiento de Ausentismo Laboral	Controlar el ausentismo por causas de salud	Registro mensual de ausentismo	Responsable SG-SST	Responsable SG-SST	\N	abril	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:22.313143	2025-12-15 21:31:22.313143	f	f	f
0bc92d27-6ccd-4a89-9842-67b3c167d217	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Registro y Seguimiento de Ausentismo Laboral	Controlar el ausentismo por causas de salud	Registro mensual de ausentismo	Responsable SG-SST	Responsable SG-SST	\N	mayo	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:22.637874	2025-12-15 21:31:22.637874	f	f	f
b20ebaad-e038-4a99-ab6d-cce0b6a2a20f	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Registro y Seguimiento de Ausentismo Laboral	Controlar el ausentismo por causas de salud	Registro mensual de ausentismo	Responsable SG-SST	Responsable SG-SST	\N	junio	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:22.972974	2025-12-15 21:31:22.972974	f	f	f
98d04053-b136-4e02-b14e-abdd6c0fee84	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Registro y Seguimiento de Ausentismo Laboral	Controlar el ausentismo por causas de salud	Registro mensual de ausentismo	Responsable SG-SST	Responsable SG-SST	\N	julio	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:23.30082	2025-12-15 21:31:23.30082	f	f	f
2946bbcc-ac47-49e2-82b4-3fceaee2f9d4	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Registro y Seguimiento de Ausentismo Laboral	Controlar el ausentismo por causas de salud	Registro mensual de ausentismo	Responsable SG-SST	Responsable SG-SST	\N	agosto	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:23.633128	2025-12-15 21:31:23.633128	f	f	f
67f7854b-f4c5-42ae-80c0-d9125a95983b	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Registro y Seguimiento de Ausentismo Laboral	Controlar el ausentismo por causas de salud	Registro mensual de ausentismo	Responsable SG-SST	Responsable SG-SST	\N	septiembre	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:23.966457	2025-12-15 21:31:23.966457	f	f	f
1ee98794-b97f-4cb9-a911-1d2583bf2d78	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Registro y Seguimiento de Ausentismo Laboral	Controlar el ausentismo por causas de salud	Registro mensual de ausentismo	Responsable SG-SST	Responsable SG-SST	\N	octubre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:24.294801	2025-12-15 21:31:24.294801	f	f	f
b8be09cc-ca32-4df1-ba3a-be7d996aec76	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Registro y Seguimiento de Ausentismo Laboral	Controlar el ausentismo por causas de salud	Registro mensual de ausentismo	Responsable SG-SST	Responsable SG-SST	\N	noviembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:24.618597	2025-12-15 21:31:24.618597	f	f	f
b0353d34-be13-4a33-aecf-3560d9ef4569	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Registro y Seguimiento de Ausentismo Laboral	Controlar el ausentismo por causas de salud	Registro mensual de ausentismo	Responsable SG-SST	Responsable SG-SST	\N	diciembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:24.943491	2025-12-15 21:31:24.943491	f	f	f
115815b1-91c9-40d2-a302-3630be3e6b05	07b9d6f3-e4bd-4571-91b6-79eacb92e416	inspeccion	\N	Inspecciones de Seguridad: Extintores y Redes Contra Incendio	Verificar condiciones de equipos contra incendio	Inspecciones mensuales realizadas	Responsable SG-SST	Responsable SG-SST	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:25.276904	2025-12-15 21:31:25.276904	f	f	f
2664cb4b-51aa-4f85-822e-6c5490988ae9	07b9d6f3-e4bd-4571-91b6-79eacb92e416	inspeccion	\N	Inspecciones de Seguridad: Extintores y Redes Contra Incendio	Verificar condiciones de equipos contra incendio	Inspecciones mensuales realizadas	Responsable SG-SST	Responsable SG-SST	\N	febrero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:25.604287	2025-12-15 21:31:25.604287	f	f	f
59edd9fc-6c86-463c-9597-3ea7d6ca7d12	07b9d6f3-e4bd-4571-91b6-79eacb92e416	inspeccion	\N	Inspecciones de Seguridad: Extintores y Redes Contra Incendio	Verificar condiciones de equipos contra incendio	Inspecciones mensuales realizadas	Responsable SG-SST	Responsable SG-SST	\N	marzo	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:25.928317	2025-12-15 21:31:25.928317	f	f	f
a5094668-3ec9-43d2-b394-fc3e82cc1bdf	07b9d6f3-e4bd-4571-91b6-79eacb92e416	inspeccion	\N	Inspecciones de Seguridad: Extintores y Redes Contra Incendio	Verificar condiciones de equipos contra incendio	Inspecciones mensuales realizadas	Responsable SG-SST	Responsable SG-SST	\N	abril	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:26.254188	2025-12-15 21:31:26.254188	f	f	f
b50e5f84-b87c-437f-a681-5c99ea7f6403	07b9d6f3-e4bd-4571-91b6-79eacb92e416	inspeccion	\N	Inspecciones de Seguridad: Extintores y Redes Contra Incendio	Verificar condiciones de equipos contra incendio	Inspecciones mensuales realizadas	Responsable SG-SST	Responsable SG-SST	\N	mayo	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:26.584127	2025-12-15 21:31:26.584127	f	f	f
005494c6-b761-46ef-86bf-33ea981c450f	07b9d6f3-e4bd-4571-91b6-79eacb92e416	inspeccion	\N	Inspecciones de Seguridad: Extintores y Redes Contra Incendio	Verificar condiciones de equipos contra incendio	Inspecciones mensuales realizadas	Responsable SG-SST	Responsable SG-SST	\N	junio	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:26.920915	2025-12-15 21:31:26.920915	f	f	f
cf074197-7b25-43d0-9bcb-73a0e19bd94a	07b9d6f3-e4bd-4571-91b6-79eacb92e416	inspeccion	\N	Inspecciones de Seguridad: Extintores y Redes Contra Incendio	Verificar condiciones de equipos contra incendio	Inspecciones mensuales realizadas	Responsable SG-SST	Responsable SG-SST	\N	julio	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:27.247179	2025-12-15 21:31:27.247179	f	f	f
7157b174-87aa-4c32-86e4-1e005ecbe846	07b9d6f3-e4bd-4571-91b6-79eacb92e416	inspeccion	\N	Inspecciones de Seguridad: Extintores y Redes Contra Incendio	Verificar condiciones de equipos contra incendio	Inspecciones mensuales realizadas	Responsable SG-SST	Responsable SG-SST	\N	agosto	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:27.573622	2025-12-15 21:31:27.573622	f	f	f
8e201ed0-80b6-4455-869a-34ee2d511b08	07b9d6f3-e4bd-4571-91b6-79eacb92e416	inspeccion	\N	Inspecciones de Seguridad: Extintores y Redes Contra Incendio	Verificar condiciones de equipos contra incendio	Inspecciones mensuales realizadas	Responsable SG-SST	Responsable SG-SST	\N	septiembre	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:27.901936	2025-12-15 21:31:27.901936	f	f	f
a1d7042a-ffd1-477d-a718-a539e1fe43db	07b9d6f3-e4bd-4571-91b6-79eacb92e416	inspeccion	\N	Inspecciones de Seguridad: Extintores y Redes Contra Incendio	Verificar condiciones de equipos contra incendio	Inspecciones mensuales realizadas	Responsable SG-SST	Responsable SG-SST	\N	octubre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:28.229347	2025-12-15 21:31:28.229347	f	f	f
dd92f684-556d-4650-b384-dc42aeca8d5e	07b9d6f3-e4bd-4571-91b6-79eacb92e416	inspeccion	\N	Inspecciones de Seguridad: Extintores y Redes Contra Incendio	Verificar condiciones de equipos contra incendio	Inspecciones mensuales realizadas	Responsable SG-SST	Responsable SG-SST	\N	noviembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:28.55499	2025-12-15 21:31:28.55499	f	f	f
40c16351-05d4-4224-b49b-867ae23c6936	07b9d6f3-e4bd-4571-91b6-79eacb92e416	inspeccion	\N	Inspecciones de Seguridad: Extintores y Redes Contra Incendio	Verificar condiciones de equipos contra incendio	Inspecciones mensuales realizadas	Responsable SG-SST	Responsable SG-SST	\N	diciembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:28.8879	2025-12-15 21:31:28.8879	f	f	f
02c3de5d-da34-4b76-af01-de48b7cce314	07b9d6f3-e4bd-4571-91b6-79eacb92e416	inspeccion	\N	Inspecciones de Seguridad: Botiquines y Primeros Auxilios	Verificar dotación y vigencia de botiquines	Inspecciones trimestrales realizadas	Responsable SG-SST	Responsable SG-SST	\N	marzo	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:29.211028	2025-12-15 21:31:29.211028	f	f	f
0ff0474e-c16e-4bb4-9787-bdd8a7f90b50	07b9d6f3-e4bd-4571-91b6-79eacb92e416	inspeccion	\N	Inspecciones de Seguridad: Botiquines y Primeros Auxilios	Verificar dotación y vigencia de botiquines	Inspecciones trimestrales realizadas	Responsable SG-SST	Responsable SG-SST	\N	junio	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:29.538061	2025-12-15 21:31:29.538061	f	f	f
dffb45e7-1c37-4f26-a712-df22715c4ec8	07b9d6f3-e4bd-4571-91b6-79eacb92e416	inspeccion	\N	Inspecciones de Seguridad: Botiquines y Primeros Auxilios	Verificar dotación y vigencia de botiquines	Inspecciones trimestrales realizadas	Responsable SG-SST	Responsable SG-SST	\N	septiembre	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:29.872462	2025-12-15 21:31:29.872462	f	f	f
ec968a0b-56cd-4a95-b862-0d454fc76294	07b9d6f3-e4bd-4571-91b6-79eacb92e416	inspeccion	\N	Inspecciones de Seguridad: Botiquines y Primeros Auxilios	Verificar dotación y vigencia de botiquines	Inspecciones trimestrales realizadas	Responsable SG-SST	Responsable SG-SST	\N	diciembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:30.201379	2025-12-15 21:31:30.201379	f	f	f
cd99f3d4-132d-4a31-b4ee-c16c3f7247eb	07b9d6f3-e4bd-4571-91b6-79eacb92e416	inspeccion	\N	Inspecciones de Seguridad: Señalización y Demarcación	Verificar condiciones de señalización de seguridad	Inspecciones semestrales realizadas	Responsable SG-SST	Responsable SG-SST	\N	junio	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:30.5265	2025-12-15 21:31:30.5265	f	f	f
3ecb6734-bab9-499d-9397-f17d217b1e04	07b9d6f3-e4bd-4571-91b6-79eacb92e416	inspeccion	\N	Inspecciones de Seguridad: Señalización y Demarcación	Verificar condiciones de señalización de seguridad	Inspecciones semestrales realizadas	Responsable SG-SST	Responsable SG-SST	\N	diciembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:30.855896	2025-12-15 21:31:30.855896	f	f	f
f76088bd-2406-478e-af9b-f62461e7e73a	07b9d6f3-e4bd-4571-91b6-79eacb92e416	epp	\N	Elaboración de la Matriz de EPP	Definir EPP requeridos por cargo y riesgo	Matriz de EPP documentada	Responsable SG-SST	Responsable SG-SST	\N	febrero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:31.18071	2025-12-15 21:31:31.18071	f	f	f
ec8109d8-4aca-482a-9c34-b2546ea0537b	07b9d6f3-e4bd-4571-91b6-79eacb92e416	epp	\N	Entrega y Registro de EPP	Suministrar EPP a todos los trabajadores	100% de trabajadores con EPP entregados	Responsable SG-SST	Responsable SG-SST	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:31.50626	2025-12-15 21:31:31.50626	f	f	f
de1aa1fb-7734-4016-b6d3-d47fe10c4a17	07b9d6f3-e4bd-4571-91b6-79eacb92e416	epp	\N	Entrega y Registro de EPP	Suministrar EPP a todos los trabajadores	100% de trabajadores con EPP entregados	Responsable SG-SST	Responsable SG-SST	\N	febrero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:31.83821	2025-12-15 21:31:31.83821	f	f	f
df2f07ba-f1d8-42de-abe2-a4f8567219e3	07b9d6f3-e4bd-4571-91b6-79eacb92e416	epp	\N	Entrega y Registro de EPP	Suministrar EPP a todos los trabajadores	100% de trabajadores con EPP entregados	Responsable SG-SST	Responsable SG-SST	\N	marzo	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:32.163559	2025-12-15 21:31:32.163559	f	f	f
0f4c6c1f-ebfb-4f0b-bc1b-7c252d4d9107	07b9d6f3-e4bd-4571-91b6-79eacb92e416	epp	\N	Entrega y Registro de EPP	Suministrar EPP a todos los trabajadores	100% de trabajadores con EPP entregados	Responsable SG-SST	Responsable SG-SST	\N	abril	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:32.492831	2025-12-15 21:31:32.492831	f	f	f
73c903cd-b020-4cda-b7ab-356ad20f562a	07b9d6f3-e4bd-4571-91b6-79eacb92e416	epp	\N	Entrega y Registro de EPP	Suministrar EPP a todos los trabajadores	100% de trabajadores con EPP entregados	Responsable SG-SST	Responsable SG-SST	\N	mayo	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:32.818478	2025-12-15 21:31:32.818478	f	f	f
e3570400-97df-4c4f-af17-f568e44689ca	07b9d6f3-e4bd-4571-91b6-79eacb92e416	epp	\N	Entrega y Registro de EPP	Suministrar EPP a todos los trabajadores	100% de trabajadores con EPP entregados	Responsable SG-SST	Responsable SG-SST	\N	junio	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:33.15325	2025-12-15 21:31:33.15325	f	f	f
2ab950db-2d25-4f2e-8243-7982cee1b5f2	07b9d6f3-e4bd-4571-91b6-79eacb92e416	epp	\N	Entrega y Registro de EPP	Suministrar EPP a todos los trabajadores	100% de trabajadores con EPP entregados	Responsable SG-SST	Responsable SG-SST	\N	julio	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:33.487046	2025-12-15 21:31:33.487046	f	f	f
86178784-c70f-4837-9c9d-6fc7760c4550	07b9d6f3-e4bd-4571-91b6-79eacb92e416	epp	\N	Entrega y Registro de EPP	Suministrar EPP a todos los trabajadores	100% de trabajadores con EPP entregados	Responsable SG-SST	Responsable SG-SST	\N	agosto	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:33.816518	2025-12-15 21:31:33.816518	f	f	f
17a7b940-52b9-450a-ab74-ec8979c699b4	07b9d6f3-e4bd-4571-91b6-79eacb92e416	epp	\N	Entrega y Registro de EPP	Suministrar EPP a todos los trabajadores	100% de trabajadores con EPP entregados	Responsable SG-SST	Responsable SG-SST	\N	septiembre	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:34.152726	2025-12-15 21:31:34.152726	f	f	f
e0cf385c-df5e-48d4-80d1-bdac039f6871	07b9d6f3-e4bd-4571-91b6-79eacb92e416	epp	\N	Entrega y Registro de EPP	Suministrar EPP a todos los trabajadores	100% de trabajadores con EPP entregados	Responsable SG-SST	Responsable SG-SST	\N	octubre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:34.476537	2025-12-15 21:31:34.476537	f	f	f
a47c49e1-a7c8-479a-9bb8-76ad50aad013	07b9d6f3-e4bd-4571-91b6-79eacb92e416	epp	\N	Entrega y Registro de EPP	Suministrar EPP a todos los trabajadores	100% de trabajadores con EPP entregados	Responsable SG-SST	Responsable SG-SST	\N	noviembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:34.819879	2025-12-15 21:31:34.819879	f	f	f
840fdd8e-55f9-4979-9033-489034c89f6d	07b9d6f3-e4bd-4571-91b6-79eacb92e416	epp	\N	Entrega y Registro de EPP	Suministrar EPP a todos los trabajadores	100% de trabajadores con EPP entregados	Responsable SG-SST	Responsable SG-SST	\N	diciembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:35.145327	2025-12-15 21:31:35.145327	f	f	f
0c1e882e-aa10-4774-8b69-1cecb7a96864	07b9d6f3-e4bd-4571-91b6-79eacb92e416	epp	\N	Inspecciones de EPP	Verificar uso y estado de EPP	Inspecciones mensuales realizadas	Responsable SG-SST	Responsable SG-SST	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:35.46943	2025-12-15 21:31:35.46943	f	f	f
6c980ba9-9c5b-4f17-8d9c-4e24d761b1db	07b9d6f3-e4bd-4571-91b6-79eacb92e416	epp	\N	Inspecciones de EPP	Verificar uso y estado de EPP	Inspecciones mensuales realizadas	Responsable SG-SST	Responsable SG-SST	\N	febrero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:35.798559	2025-12-15 21:31:35.798559	f	f	f
4bead73e-6358-4ee0-a881-6f42cf1a0435	07b9d6f3-e4bd-4571-91b6-79eacb92e416	epp	\N	Inspecciones de EPP	Verificar uso y estado de EPP	Inspecciones mensuales realizadas	Responsable SG-SST	Responsable SG-SST	\N	marzo	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:36.122431	2025-12-15 21:31:36.122431	f	f	f
a8bc7463-7f63-42c1-96d8-4d39f91ceef4	07b9d6f3-e4bd-4571-91b6-79eacb92e416	epp	\N	Inspecciones de EPP	Verificar uso y estado de EPP	Inspecciones mensuales realizadas	Responsable SG-SST	Responsable SG-SST	\N	abril	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:36.455345	2025-12-15 21:31:36.455345	f	f	f
b9901689-8f69-4f19-aadf-06f54b71ce4e	07b9d6f3-e4bd-4571-91b6-79eacb92e416	epp	\N	Inspecciones de EPP	Verificar uso y estado de EPP	Inspecciones mensuales realizadas	Responsable SG-SST	Responsable SG-SST	\N	mayo	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:36.78017	2025-12-15 21:31:36.78017	f	f	f
a6a743c6-8c57-442e-93a5-c90f3723908c	07b9d6f3-e4bd-4571-91b6-79eacb92e416	epp	\N	Inspecciones de EPP	Verificar uso y estado de EPP	Inspecciones mensuales realizadas	Responsable SG-SST	Responsable SG-SST	\N	junio	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:37.117372	2025-12-15 21:31:37.117372	f	f	f
11dddf04-10f2-4f0d-be68-f723760e0478	07b9d6f3-e4bd-4571-91b6-79eacb92e416	epp	\N	Inspecciones de EPP	Verificar uso y estado de EPP	Inspecciones mensuales realizadas	Responsable SG-SST	Responsable SG-SST	\N	julio	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:37.441804	2025-12-15 21:31:37.441804	f	f	f
6f17da31-aa9f-4d54-b3d3-71f75ea809b6	07b9d6f3-e4bd-4571-91b6-79eacb92e416	epp	\N	Inspecciones de EPP	Verificar uso y estado de EPP	Inspecciones mensuales realizadas	Responsable SG-SST	Responsable SG-SST	\N	agosto	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:37.765569	2025-12-15 21:31:37.765569	f	f	f
839ad257-5994-4076-ac09-6f6d1d39b5f1	07b9d6f3-e4bd-4571-91b6-79eacb92e416	epp	\N	Inspecciones de EPP	Verificar uso y estado de EPP	Inspecciones mensuales realizadas	Responsable SG-SST	Responsable SG-SST	\N	septiembre	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:38.092363	2025-12-15 21:31:38.092363	f	f	f
efcc4f61-7781-4ca6-875a-5f7027b4db18	07b9d6f3-e4bd-4571-91b6-79eacb92e416	epp	\N	Inspecciones de EPP	Verificar uso y estado de EPP	Inspecciones mensuales realizadas	Responsable SG-SST	Responsable SG-SST	\N	octubre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:38.426242	2025-12-15 21:31:38.426242	f	f	f
d86fbed3-287d-42e7-9b07-7fc0c2cf8d63	07b9d6f3-e4bd-4571-91b6-79eacb92e416	epp	\N	Inspecciones de EPP	Verificar uso y estado de EPP	Inspecciones mensuales realizadas	Responsable SG-SST	Responsable SG-SST	\N	noviembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:38.752732	2025-12-15 21:31:38.752732	f	f	f
5a1578de-8725-459f-87a6-90655e5425c6	07b9d6f3-e4bd-4571-91b6-79eacb92e416	epp	\N	Inspecciones de EPP	Verificar uso y estado de EPP	Inspecciones mensuales realizadas	Responsable SG-SST	Responsable SG-SST	\N	diciembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:39.080251	2025-12-15 21:31:39.080251	f	f	f
754a1e4c-bf0b-45d5-8d74-ef521abcb2ee	07b9d6f3-e4bd-4571-91b6-79eacb92e416	higiene-seguridad	\N	Control de Plagas: Registro de Fumigación	Mantener control sanitario de instalaciones	Fumigaciones programadas realizadas	Responsable SG-SST	Responsable SG-SST	\N	marzo	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:39.408813	2025-12-15 21:31:39.408813	f	f	f
2af1e5bb-f14d-4c6b-8949-82ac00746f36	07b9d6f3-e4bd-4571-91b6-79eacb92e416	higiene-seguridad	\N	Control de Plagas: Registro de Fumigación	Mantener control sanitario de instalaciones	Fumigaciones programadas realizadas	Responsable SG-SST	Responsable SG-SST	\N	junio	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:39.737829	2025-12-15 21:31:39.737829	f	f	f
8e9a2315-dbb0-4bce-81e7-928fcef0a0ee	07b9d6f3-e4bd-4571-91b6-79eacb92e416	higiene-seguridad	\N	Control de Plagas: Registro de Fumigación	Mantener control sanitario de instalaciones	Fumigaciones programadas realizadas	Responsable SG-SST	Responsable SG-SST	\N	septiembre	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:40.064668	2025-12-15 21:31:40.064668	f	f	f
05e2da79-ac85-4740-9f6f-b8d6d22bf521	07b9d6f3-e4bd-4571-91b6-79eacb92e416	higiene-seguridad	\N	Control de Plagas: Registro de Fumigación	Mantener control sanitario de instalaciones	Fumigaciones programadas realizadas	Responsable SG-SST	Responsable SG-SST	\N	diciembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:40.393566	2025-12-15 21:31:40.393566	f	f	f
694e9116-984b-41b9-b0e8-197ac3fd50be	07b9d6f3-e4bd-4571-91b6-79eacb92e416	emergencias	\N	Actualización del Análisis de Vulnerabilidad	Identificar amenazas y vulnerabilidades	Análisis de vulnerabilidad actualizado	Responsable SG-SST	Responsable SG-SST	\N	marzo	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:40.716693	2025-12-15 21:31:40.716693	f	f	f
63004284-e149-4a51-a886-7f469db381e8	07b9d6f3-e4bd-4571-91b6-79eacb92e416	emergencias	\N	Elaboración del Mapa de Riesgo de las Instalaciones	Identificar gráficamente los riesgos por área	Mapa de riesgo actualizado	Responsable SG-SST	Responsable SG-SST	\N	abril	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:41.04211	2025-12-15 21:31:41.04211	f	f	f
57fad867-042c-40eb-8102-8d5d45bc3e0e	07b9d6f3-e4bd-4571-91b6-79eacb92e416	emergencias	\N	Actualización del Plan de Emergencias	Mantener actualizado el plan de preparación y respuesta	Plan de emergencias vigente	Responsable SG-SST	Responsable SG-SST	\N	febrero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:41.373067	2025-12-15 21:31:41.373067	f	f	f
3856b17a-93e7-433c-ab1c-faa20a50549b	07b9d6f3-e4bd-4571-91b6-79eacb92e416	emergencias	\N	Conformación de Brigadas de Emergencias	Organizar equipos de respuesta ante emergencias	Brigada conformada y documentada	Responsable SG-SST	Responsable SG-SST	\N	febrero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:41.701227	2025-12-15 21:31:41.701227	f	f	f
a540cf67-3fd1-44d9-9132-359977a562a2	07b9d6f3-e4bd-4571-91b6-79eacb92e416	capacitacion	\N	Capacitación a Brigadas de Emergencias	Entrenar a los brigadistas en respuesta a emergencias	100% de brigadistas capacitados	Responsable SG-SST	Responsable SG-SST	\N	marzo	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:42.028474	2025-12-15 21:31:42.028474	f	f	f
3fb556be-b25f-4913-92bd-5a8de99ce299	07b9d6f3-e4bd-4571-91b6-79eacb92e416	capacitacion	\N	Capacitación a Brigadas de Emergencias	Entrenar a los brigadistas en respuesta a emergencias	100% de brigadistas capacitados	Responsable SG-SST	Responsable SG-SST	\N	septiembre	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:42.365019	2025-12-15 21:31:42.365019	f	f	f
d003a1a2-9899-4f5b-bfbc-58c9e136f238	07b9d6f3-e4bd-4571-91b6-79eacb92e416	emergencias	\N	Dotación de Brigadas de Emergencias	Suministrar equipos a los brigadistas	100% de brigadistas dotados	Responsable SG-SST	Responsable SG-SST	\N	marzo	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:42.704792	2025-12-15 21:31:42.704792	f	f	f
9f67e501-b044-4168-b2a6-51fc7b08e602	07b9d6f3-e4bd-4571-91b6-79eacb92e416	emergencias	\N	Realización de Simulacros de Emergencia	Evaluar la respuesta ante situaciones de emergencia	2 simulacros anuales	Responsable SG-SST	Responsable SG-SST	\N	mayo	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:43.030776	2025-12-15 21:31:43.030776	f	f	f
40bc08da-6753-4ea7-a463-a42f52cd3682	07b9d6f3-e4bd-4571-91b6-79eacb92e416	emergencias	\N	Realización de Simulacros de Emergencia	Evaluar la respuesta ante situaciones de emergencia	2 simulacros anuales	Responsable SG-SST	Responsable SG-SST	\N	noviembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:43.368891	2025-12-15 21:31:43.368891	f	f	f
c3d4f8da-9a4c-4847-8fae-b7539a04b1cd	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Instructivo para Reporte de Enfermedad Laboral	Establecer procedimiento de reporte de enfermedad laboral	Instructivo documentado y socializado	Responsable SG-SST	Responsable SG-SST	\N	febrero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:43.691877	2025-12-15 21:31:43.691877	f	f	f
8f26b2f3-d823-46ac-84e7-3f00b9fdf572	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Instructivo para Investigación de Accidentes	Establecer procedimiento de investigación de incidentes	Instructivo documentado y socializado	Responsable SG-SST	Responsable SG-SST	\N	febrero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:44.016561	2025-12-15 21:31:44.016561	f	f	f
14683285-ed6a-48b8-bc5b-d873e080f1b8	07b9d6f3-e4bd-4571-91b6-79eacb92e416	inspeccion	\N	Matriz de Seguimiento de Actos y Condiciones Inseguras	Controlar el reporte y cierre de condiciones inseguras	100% de reportes con seguimiento	Responsable SG-SST	Responsable SG-SST	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:44.345751	2025-12-15 21:31:44.345751	f	f	f
b34138f9-da9e-495e-be03-1c49a472f421	07b9d6f3-e4bd-4571-91b6-79eacb92e416	inspeccion	\N	Matriz de Seguimiento de Actos y Condiciones Inseguras	Controlar el reporte y cierre de condiciones inseguras	100% de reportes con seguimiento	Responsable SG-SST	Responsable SG-SST	\N	febrero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:44.670209	2025-12-15 21:31:44.670209	f	f	f
443b3806-fd68-479b-8f5f-8492dc2e8d3c	07b9d6f3-e4bd-4571-91b6-79eacb92e416	inspeccion	\N	Matriz de Seguimiento de Actos y Condiciones Inseguras	Controlar el reporte y cierre de condiciones inseguras	100% de reportes con seguimiento	Responsable SG-SST	Responsable SG-SST	\N	marzo	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:44.999554	2025-12-15 21:31:44.999554	f	f	f
b7ed3c99-0dde-45b9-9958-72d69cd3d9f3	07b9d6f3-e4bd-4571-91b6-79eacb92e416	inspeccion	\N	Matriz de Seguimiento de Actos y Condiciones Inseguras	Controlar el reporte y cierre de condiciones inseguras	100% de reportes con seguimiento	Responsable SG-SST	Responsable SG-SST	\N	abril	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:45.346544	2025-12-15 21:31:45.346544	f	f	f
dc904034-51e3-40f2-b0e3-1b08cdaf7ada	07b9d6f3-e4bd-4571-91b6-79eacb92e416	inspeccion	\N	Matriz de Seguimiento de Actos y Condiciones Inseguras	Controlar el reporte y cierre de condiciones inseguras	100% de reportes con seguimiento	Responsable SG-SST	Responsable SG-SST	\N	mayo	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:45.671406	2025-12-15 21:31:45.671406	f	f	f
5e361511-0d12-4702-b369-32b1ec04f7cd	07b9d6f3-e4bd-4571-91b6-79eacb92e416	inspeccion	\N	Matriz de Seguimiento de Actos y Condiciones Inseguras	Controlar el reporte y cierre de condiciones inseguras	100% de reportes con seguimiento	Responsable SG-SST	Responsable SG-SST	\N	junio	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:46.007321	2025-12-15 21:31:46.007321	f	f	f
66af14cd-264e-480f-a2db-4410b3e588bd	07b9d6f3-e4bd-4571-91b6-79eacb92e416	inspeccion	\N	Matriz de Seguimiento de Actos y Condiciones Inseguras	Controlar el reporte y cierre de condiciones inseguras	100% de reportes con seguimiento	Responsable SG-SST	Responsable SG-SST	\N	julio	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:46.330204	2025-12-15 21:31:46.330204	f	f	f
ea6af324-3384-4f04-a654-ad629ed79da9	07b9d6f3-e4bd-4571-91b6-79eacb92e416	inspeccion	\N	Matriz de Seguimiento de Actos y Condiciones Inseguras	Controlar el reporte y cierre de condiciones inseguras	100% de reportes con seguimiento	Responsable SG-SST	Responsable SG-SST	\N	agosto	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:46.662008	2025-12-15 21:31:46.662008	f	f	f
303f05eb-5261-46f8-bf76-36727d1ad4cf	07b9d6f3-e4bd-4571-91b6-79eacb92e416	inspeccion	\N	Matriz de Seguimiento de Actos y Condiciones Inseguras	Controlar el reporte y cierre de condiciones inseguras	100% de reportes con seguimiento	Responsable SG-SST	Responsable SG-SST	\N	septiembre	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:46.992047	2025-12-15 21:31:46.992047	f	f	f
075df531-aaac-4de3-8334-a5f20e869557	07b9d6f3-e4bd-4571-91b6-79eacb92e416	inspeccion	\N	Matriz de Seguimiento de Actos y Condiciones Inseguras	Controlar el reporte y cierre de condiciones inseguras	100% de reportes con seguimiento	Responsable SG-SST	Responsable SG-SST	\N	octubre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:47.319055	2025-12-15 21:31:47.319055	f	f	f
7e1b41eb-5ec1-49c8-98ae-64138c1a8f3f	07b9d6f3-e4bd-4571-91b6-79eacb92e416	inspeccion	\N	Matriz de Seguimiento de Actos y Condiciones Inseguras	Controlar el reporte y cierre de condiciones inseguras	100% de reportes con seguimiento	Responsable SG-SST	Responsable SG-SST	\N	noviembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:47.65887	2025-12-15 21:31:47.65887	f	f	f
1ac5a0b6-8e15-41b2-8374-11ac8844b558	07b9d6f3-e4bd-4571-91b6-79eacb92e416	inspeccion	\N	Matriz de Seguimiento de Actos y Condiciones Inseguras	Controlar el reporte y cierre de condiciones inseguras	100% de reportes con seguimiento	Responsable SG-SST	Responsable SG-SST	\N	diciembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:47.990925	2025-12-15 21:31:47.990925	f	f	f
1f8df2bc-48dd-4fe1-bdb9-94ef0dc8055a	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Seguimiento de Indicadores de Estructura, Proceso y Resultado	Monitorear el desempeño del SG-SST mediante indicadores	Indicadores medidos mensualmente	Responsable SG-SST	Responsable SG-SST	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:48.317614	2025-12-15 21:31:48.317614	f	f	f
dbc4766f-3d0a-430f-9ffd-39b09812d8a6	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Seguimiento de Indicadores de Estructura, Proceso y Resultado	Monitorear el desempeño del SG-SST mediante indicadores	Indicadores medidos mensualmente	Responsable SG-SST	Responsable SG-SST	\N	marzo	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:48.651179	2025-12-15 21:31:48.651179	f	f	f
f29a9bbc-a3ae-42fd-bc7f-c3cb9be5ffab	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Seguimiento de Indicadores de Estructura, Proceso y Resultado	Monitorear el desempeño del SG-SST mediante indicadores	Indicadores medidos mensualmente	Responsable SG-SST	Responsable SG-SST	\N	junio	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:48.979081	2025-12-15 21:31:48.979081	f	f	f
d9c730c5-8adc-419c-8ea4-e48712696db9	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Seguimiento de Indicadores de Estructura, Proceso y Resultado	Monitorear el desempeño del SG-SST mediante indicadores	Indicadores medidos mensualmente	Responsable SG-SST	Responsable SG-SST	\N	septiembre	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:49.307271	2025-12-15 21:31:49.307271	f	f	f
550a1d69-2e28-4d4a-820e-1c94e6540e49	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Seguimiento de Indicadores de Estructura, Proceso y Resultado	Monitorear el desempeño del SG-SST mediante indicadores	Indicadores medidos mensualmente	Responsable SG-SST	Responsable SG-SST	\N	diciembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:49.633506	2025-12-15 21:31:49.633506	f	f	f
126457b2-c55b-40d6-9228-7933e5982619	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Revisión por la Alta Dirección	Evaluar el desempeño del SG-SST por la gerencia	1 revisión anual documentada	Gerencia General	Gerencia General	\N	diciembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:49.960397	2025-12-15 21:31:49.960397	f	f	f
311304eb-572c-4b58-a707-7d24a965d4a6	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Seguimiento a Programas del SG-SST	Verificar avance y cumplimiento de programas	Seguimiento mensual documentado	Responsable SG-SST	Responsable SG-SST	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:50.293221	2025-12-15 21:31:50.293221	f	f	f
369903e3-7440-4745-a171-e994b3804db1	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Seguimiento a Programas del SG-SST	Verificar avance y cumplimiento de programas	Seguimiento mensual documentado	Responsable SG-SST	Responsable SG-SST	\N	febrero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:50.634279	2025-12-15 21:31:50.634279	f	f	f
8b83fa57-0f67-4812-8fda-ba6905167c24	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Seguimiento a Programas del SG-SST	Verificar avance y cumplimiento de programas	Seguimiento mensual documentado	Responsable SG-SST	Responsable SG-SST	\N	marzo	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:50.967096	2025-12-15 21:31:50.967096	f	f	f
b2a0aa29-1327-4d3e-813e-ed271e290c56	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Seguimiento a Programas del SG-SST	Verificar avance y cumplimiento de programas	Seguimiento mensual documentado	Responsable SG-SST	Responsable SG-SST	\N	abril	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:51.322511	2025-12-15 21:31:51.322511	f	f	f
cf56c1d5-7890-4f07-9340-f83a1a1d92b6	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Seguimiento a Programas del SG-SST	Verificar avance y cumplimiento de programas	Seguimiento mensual documentado	Responsable SG-SST	Responsable SG-SST	\N	mayo	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:51.669701	2025-12-15 21:31:51.669701	f	f	f
b0fcfd4f-78d6-4e06-a48a-996c158a7cd1	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Seguimiento a Programas del SG-SST	Verificar avance y cumplimiento de programas	Seguimiento mensual documentado	Responsable SG-SST	Responsable SG-SST	\N	junio	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:51.995437	2025-12-15 21:31:51.995437	f	f	f
4c583ff2-a891-4bef-83c2-d86a6cf9c5c0	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Seguimiento a Programas del SG-SST	Verificar avance y cumplimiento de programas	Seguimiento mensual documentado	Responsable SG-SST	Responsable SG-SST	\N	julio	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:52.329706	2025-12-15 21:31:52.329706	f	f	f
813cfc2e-3eb7-412e-ae03-172945b85fc4	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Seguimiento a Programas del SG-SST	Verificar avance y cumplimiento de programas	Seguimiento mensual documentado	Responsable SG-SST	Responsable SG-SST	\N	agosto	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:52.655665	2025-12-15 21:31:52.655665	f	f	f
5bf207da-36ed-4506-970b-fe37b7a54660	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Seguimiento a Programas del SG-SST	Verificar avance y cumplimiento de programas	Seguimiento mensual documentado	Responsable SG-SST	Responsable SG-SST	\N	septiembre	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:52.984153	2025-12-15 21:31:52.984153	f	f	f
e8197cb3-da05-43eb-9190-c2f740f92f0c	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Seguimiento a Programas del SG-SST	Verificar avance y cumplimiento de programas	Seguimiento mensual documentado	Responsable SG-SST	Responsable SG-SST	\N	octubre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:53.310543	2025-12-15 21:31:53.310543	f	f	f
840f9ee6-1311-4f3d-b148-2b392554f10f	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Seguimiento a Programas del SG-SST	Verificar avance y cumplimiento de programas	Seguimiento mensual documentado	Responsable SG-SST	Responsable SG-SST	\N	noviembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:53.659192	2025-12-15 21:31:53.659192	f	f	f
0242445a-7974-4388-91f1-eac90417a53b	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Seguimiento a Programas del SG-SST	Verificar avance y cumplimiento de programas	Seguimiento mensual documentado	Responsable SG-SST	Responsable SG-SST	\N	diciembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:53.983605	2025-12-15 21:31:53.983605	f	f	f
19bd455f-0bd0-4dc5-bb1c-ffffa2254ce8	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Seguimiento y Análisis del Ausentismo Laboral	Analizar tendencias de ausentismo y definir acciones	Informe mensual de ausentismo	Responsable SG-SST	Responsable SG-SST	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:54.310799	2025-12-15 21:31:54.310799	f	f	f
b5262a17-2486-4ce1-b09d-103933318b7f	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Seguimiento y Análisis del Ausentismo Laboral	Analizar tendencias de ausentismo y definir acciones	Informe mensual de ausentismo	Responsable SG-SST	Responsable SG-SST	\N	febrero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:54.638963	2025-12-15 21:31:54.638963	f	f	f
dd95fc28-2bb2-486e-857a-39c636909aee	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Seguimiento y Análisis del Ausentismo Laboral	Analizar tendencias de ausentismo y definir acciones	Informe mensual de ausentismo	Responsable SG-SST	Responsable SG-SST	\N	marzo	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:54.964099	2025-12-15 21:31:54.964099	f	f	f
94ae6289-ed51-49e6-b7f5-2bb0481c2e14	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Seguimiento y Análisis del Ausentismo Laboral	Analizar tendencias de ausentismo y definir acciones	Informe mensual de ausentismo	Responsable SG-SST	Responsable SG-SST	\N	abril	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:55.293196	2025-12-15 21:31:55.293196	f	f	f
03fb5dfd-554a-4175-a6d9-6da6df0cce53	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Seguimiento y Análisis del Ausentismo Laboral	Analizar tendencias de ausentismo y definir acciones	Informe mensual de ausentismo	Responsable SG-SST	Responsable SG-SST	\N	mayo	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:55.620946	2025-12-15 21:31:55.620946	f	f	f
eba1dcd0-e0b3-4b8d-9bb2-73a94ff9b5e5	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Seguimiento y Análisis del Ausentismo Laboral	Analizar tendencias de ausentismo y definir acciones	Informe mensual de ausentismo	Responsable SG-SST	Responsable SG-SST	\N	junio	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:55.957143	2025-12-15 21:31:55.957143	f	f	f
f6d5ccd5-2804-4185-9228-1615885ffef0	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Seguimiento y Análisis del Ausentismo Laboral	Analizar tendencias de ausentismo y definir acciones	Informe mensual de ausentismo	Responsable SG-SST	Responsable SG-SST	\N	julio	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:56.284623	2025-12-15 21:31:56.284623	f	f	f
f36d6ad3-bfc3-4b21-8d91-980f8f174b26	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Seguimiento y Análisis del Ausentismo Laboral	Analizar tendencias de ausentismo y definir acciones	Informe mensual de ausentismo	Responsable SG-SST	Responsable SG-SST	\N	agosto	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:56.610959	2025-12-15 21:31:56.610959	f	f	f
6368a67f-91aa-4d33-8df1-1458da69ed5a	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Seguimiento y Análisis del Ausentismo Laboral	Analizar tendencias de ausentismo y definir acciones	Informe mensual de ausentismo	Responsable SG-SST	Responsable SG-SST	\N	septiembre	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:56.938289	2025-12-15 21:31:56.938289	f	f	f
49188e17-ae09-4dcd-9061-1f934636c327	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Seguimiento y Análisis del Ausentismo Laboral	Analizar tendencias de ausentismo y definir acciones	Informe mensual de ausentismo	Responsable SG-SST	Responsable SG-SST	\N	octubre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:57.265364	2025-12-15 21:31:57.265364	f	f	f
af012b54-5392-41a4-8600-fda71862f98c	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Seguimiento y Análisis del Ausentismo Laboral	Analizar tendencias de ausentismo y definir acciones	Informe mensual de ausentismo	Responsable SG-SST	Responsable SG-SST	\N	noviembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:57.618584	2025-12-15 21:31:57.618584	f	f	f
99047db7-642d-42d3-b91c-33e71156e6dc	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Seguimiento y Análisis del Ausentismo Laboral	Analizar tendencias de ausentismo y definir acciones	Informe mensual de ausentismo	Responsable SG-SST	Responsable SG-SST	\N	diciembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:57.955187	2025-12-15 21:31:57.955187	f	f	f
5412e69f-62e2-4bb2-a5de-4180a49ed09f	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Acciones Correctivas, Preventivas y de Mejora	Implementar mejoras basadas en hallazgos del SG-SST	100% de acciones cerradas en plazo	Responsable SG-SST	Responsable SG-SST	\N	marzo	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:58.281587	2025-12-15 21:31:58.281587	f	f	f
a43a7e3d-fa03-4258-9a7e-94c0d084a588	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Acciones Correctivas, Preventivas y de Mejora	Implementar mejoras basadas en hallazgos del SG-SST	100% de acciones cerradas en plazo	Responsable SG-SST	Responsable SG-SST	\N	junio	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:58.609786	2025-12-15 21:31:58.609786	f	f	f
b98af7fa-e9f6-4ede-85d5-b3308e2cd243	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Acciones Correctivas, Preventivas y de Mejora	Implementar mejoras basadas en hallazgos del SG-SST	100% de acciones cerradas en plazo	Responsable SG-SST	Responsable SG-SST	\N	septiembre	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:58.943785	2025-12-15 21:31:58.943785	f	f	f
1d585e39-f73f-4f8e-a451-6b2e16054a23	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Acciones Correctivas, Preventivas y de Mejora	Implementar mejoras basadas en hallazgos del SG-SST	100% de acciones cerradas en plazo	Responsable SG-SST	Responsable SG-SST	\N	diciembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:59.280022	2025-12-15 21:31:59.280022	f	f	f
eebf6c87-3435-4faf-a692-1dd5b512a3fe	07b9d6f3-e4bd-4571-91b6-79eacb92e416	capacitacion	\N	Diseño del Programa de Capacitación y Entrenamiento SST	Establecer el plan de formación anual	Programa documentado	Responsable SG-SST	Responsable SG-SST	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:36:17.537417	2025-12-15 21:36:17.537417	f	f	f
cdaad02c-d905-407c-81f8-c9896ae8d4ed	07b9d6f3-e4bd-4571-91b6-79eacb92e416	inspeccion	\N	Diseño del Programa de Inspecciones de Seguridad	Establecer el cronograma de inspecciones	Programa documentado	Responsable SG-SST	Responsable SG-SST	\N	febrero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:36:17.537417	2025-12-15 21:36:17.537417	f	f	f
34971c2f-d32e-4b23-8be8-2f7ede02bc42	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Caracterización de Condiciones de Salud de los Trabajadores	Conocer el perfil de salud de los trabajadores	Informe de condiciones de salud	Responsable SG-SST	Responsable SG-SST	\N	marzo	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:36:17.537417	2025-12-15 21:36:17.537417	f	f	f
25b6daff-3b63-4ba5-8aa6-dc2f1d531e1a	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Descripción Sociodemográfica de los Trabajadores	Caracterizar la población trabajadora	Informe sociodemográfico	Responsable SG-SST	Responsable SG-SST	\N	marzo	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:36:17.537417	2025-12-15 21:36:17.537417	f	f	f
1b5a1415-0da6-4d73-98a5-fad1ba2ee280	07b9d6f3-e4bd-4571-91b6-79eacb92e416	emergencias	\N	Actualización del Plan de Emergencias	Mantener actualizado el plan de emergencias	Plan actualizado	Responsable SG-SST	Responsable SG-SST	\N	febrero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:36:17.537417	2025-12-15 21:36:17.537417	f	f	f
85467b5a-7b6f-40c2-9358-ddee7f5d48db	07b9d6f3-e4bd-4571-91b6-79eacb92e416	emergencias	\N	Actualización del Análisis de Vulnerabilidad	Identificar amenazas y vulnerabilidades	Análisis actualizado	Responsable SG-SST	Responsable SG-SST	\N	marzo	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:36:17.537417	2025-12-15 21:36:17.537417	f	f	f
e58d71d6-aac0-4427-8750-ce9a24c67bab	07b9d6f3-e4bd-4571-91b6-79eacb92e416	emergencias	\N	Conformación de Brigadas de Emergencias	Conformar y actualizar brigadas	Brigadas conformadas	Responsable SG-SST	Responsable SG-SST	\N	febrero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:36:17.537417	2025-12-15 21:36:17.537417	f	f	f
b4f870b9-3b93-448e-b364-43b7594e02dc	07b9d6f3-e4bd-4571-91b6-79eacb92e416	capacitacion	\N	Capacitación a Brigadas de Emergencias	Formar a los brigadistas	100% de brigadistas capacitados	Responsable SG-SST	Responsable SG-SST	\N	marzo	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:36:17.537417	2025-12-15 21:36:17.537417	f	f	f
7436a39f-3b66-4d1b-8c88-81530deca26e	07b9d6f3-e4bd-4571-91b6-79eacb92e416	capacitacion	\N	Capacitación a Brigadas de Emergencias	Formar a los brigadistas	100% de brigadistas capacitados	Responsable SG-SST	Responsable SG-SST	\N	septiembre	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:36:17.537417	2025-12-15 21:36:17.537417	f	f	f
d7141bee-553e-49d7-9736-77d96f5ece65	07b9d6f3-e4bd-4571-91b6-79eacb92e416	auditoria	\N	Auditoría Interna del SG-SST	Evaluar cumplimiento del sistema de gestión	1 auditoría anual	Responsable SG-SST	Responsable SG-SST	\N	noviembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:38:28.516282	2025-12-15 21:38:28.516282	f	f	f
bc54dc52-6a2c-4144-bcd1-50ebe38a7ac1	07b9d6f3-e4bd-4571-91b6-79eacb92e416	auditoria	\N	Revisión por la Alta Dirección	Evaluar eficacia del SG-SST por la alta dirección	1 revisión anual	Gerencia General	Gerente General	\N	diciembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:38:28.516282	2025-12-15 21:38:28.516282	f	f	f
25a2ecfe-bfba-4603-af45-d493a5a88607	07b9d6f3-e4bd-4571-91b6-79eacb92e416	auditoria	\N	Medición de Indicadores de Gestión SST	Evaluar indicadores de estructura, proceso y resultado	Informe trimestral de indicadores	Responsable SG-SST	Responsable SG-SST	\N	marzo	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:38:28.516282	2025-12-15 21:38:28.516282	f	f	f
b228ff16-65f1-46cb-a0a1-f727184e0bff	07b9d6f3-e4bd-4571-91b6-79eacb92e416	auditoria	\N	Medición de Indicadores de Gestión SST	Evaluar indicadores de estructura, proceso y resultado	Informe trimestral de indicadores	Responsable SG-SST	Responsable SG-SST	\N	junio	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:38:28.516282	2025-12-15 21:38:28.516282	f	f	f
4bfbdd78-a4ef-4875-a2ff-a15e19f6daa8	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Aplicación de Estándares Mínimos de SG-SST (Resolución 0312/2019)	Verificar el cumplimiento de los estándares mínimos del SG-SST	100% de estándares evaluados	Responsable SG-SST	Responsable SG-SST	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:34:16.574321	2025-12-15 21:34:16.574321	f	f	f
7b3ad30d-cd8f-42cf-b59b-0a87c96edff5	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Publicación y Socialización de la Política de SST	Divulgar la política de SST a todos los trabajadores	100% de trabajadores informados	COPASST	COPASST	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:34:16.574321	2025-12-15 21:34:16.574321	f	f	f
d47833cf-1548-46a1-8171-18a2a6564cdd	07b9d6f3-e4bd-4571-91b6-79eacb92e416	identificacion-peligros	\N	Actualización de la Matriz IPERC	Identificar y valorar peligros y riesgos	100% de áreas evaluadas	COPASST	COPASST	\N	agosto	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:34:16.574321	2025-12-15 21:34:16.574321	f	f	f
6311095c-8675-44eb-9b4b-87f8035d6c7d	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Definición de Indicadores de Gestión SST	Establecer indicadores de estructura, proceso y resultado	3 tipos de indicadores	Responsable SG-SST	Responsable SG-SST	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:34:16.574321	2025-12-15 21:34:16.574321	f	f	f
f188c86b-a6db-429b-b87e-cef3fa39985e	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Definición de Indicadores de Gestión SST	Establecer indicadores de estructura, proceso y resultado	3 tipos de indicadores	Responsable SG-SST	Responsable SG-SST	\N	agosto	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:34:16.574321	2025-12-15 21:34:16.574321	f	f	f
80f77954-5058-4068-b1e4-7a6ddd0f7ea6	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Documentación Designación Responsable SG-SST	Formalizar el nombramiento del responsable	Acta firmada	Gerencia General	Gerente General	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:34:16.574321	2025-12-15 21:34:16.574321	f	f	f
dcb92af2-a0ed-4af3-a36a-d08c1db0ee2d	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Documentación de Responsabilidades Específicas en SST	Definir responsabilidades de SST	Manual actualizado	Gerencia General	Gerente General	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:34:16.574321	2025-12-15 21:34:16.574321	f	f	f
ccce97a6-6878-436f-99f0-2d1c671b2378	07b9d6f3-e4bd-4571-91b6-79eacb92e416	capacitacion	\N	Verificar Certificación Curso 50 Horas SST	Asegurar certificación del responsable	Certificado verificado	Responsable SG-SST	Responsable SG-SST	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:34:16.574321	2025-12-15 21:34:16.574321	f	f	f
4fd95ed2-3ae1-4cf1-8a6f-5fdb24c54b49	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Actualización Matriz de Requisitos Legales	Mantener normatividad actualizada	Matriz actualizada	Responsable SG-SST	Responsable SG-SST	\N	septiembre	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:34:16.574321	2025-12-15 21:34:16.574321	f	f	f
7679e1af-f9de-4784-a97a-d6b27def60ca	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Conformación del COPASST	Conformar COPASST según normatividad	COPASST constituido	Responsable SG-SST	Responsable SG-SST	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:34:16.574321	2025-12-15 21:34:16.574321	f	f	f
6145a1a8-a768-4cd0-88c4-cf40b0c76d59	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Conformación del COPASST	Conformar COPASST según normatividad	COPASST constituido	Responsable SG-SST	Responsable SG-SST	\N	julio	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:34:16.574321	2025-12-15 21:34:16.574321	f	f	f
bd9870a1-0be9-4bcc-b18e-ae942da5a336	07b9d6f3-e4bd-4571-91b6-79eacb92e416	emergencias	\N	Simulacro de Evacuación	Evaluar la capacidad de respuesta ante emergencias	Mínimo 2 simulacros anuales	Responsable SG-SST	Responsable SG-SST	\N	mayo	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:36:49.19646	2025-12-15 21:36:49.19646	f	f	f
2e2a3aa5-0f77-4c9b-922d-d759a9a1f7a1	07b9d6f3-e4bd-4571-91b6-79eacb92e416	emergencias	\N	Simulacro de Evacuación	Evaluar la capacidad de respuesta ante emergencias	Mínimo 2 simulacros anuales	Responsable SG-SST	Responsable SG-SST	\N	octubre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:36:49.19646	2025-12-15 21:36:49.19646	f	f	f
6533208f-ebd2-4fc9-a88e-0361f6a56bdb	07b9d6f3-e4bd-4571-91b6-79eacb92e416	inspeccion	\N	Inspecciones Planeadas de Seguridad	Identificar condiciones y actos inseguros	12 inspecciones anuales	COPASST	COPASST	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:36:49.19646	2025-12-15 21:36:49.19646	f	f	f
a2bfa8d5-f865-4e6c-9dc4-21feea88062f	07b9d6f3-e4bd-4571-91b6-79eacb92e416	inspeccion	\N	Inspecciones Planeadas de Seguridad	Identificar condiciones y actos inseguros	12 inspecciones anuales	COPASST	COPASST	\N	febrero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:36:49.19646	2025-12-15 21:36:49.19646	f	f	f
0d98d20c-73d2-4357-b291-a7faa1422687	07b9d6f3-e4bd-4571-91b6-79eacb92e416	inspeccion	\N	Inspecciones Planeadas de Seguridad	Identificar condiciones y actos inseguros	12 inspecciones anuales	COPASST	COPASST	\N	marzo	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:36:49.19646	2025-12-15 21:36:49.19646	f	f	f
bf9f2306-1379-42d7-9fb0-b964253b5058	07b9d6f3-e4bd-4571-91b6-79eacb92e416	inspeccion	\N	Inspecciones Planeadas de Seguridad	Identificar condiciones y actos inseguros	12 inspecciones anuales	COPASST	COPASST	\N	abril	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:36:49.19646	2025-12-15 21:36:49.19646	f	f	f
143c4c5a-180e-45c2-b5e2-6bc729612550	07b9d6f3-e4bd-4571-91b6-79eacb92e416	inspeccion	\N	Inspecciones Planeadas de Seguridad	Identificar condiciones y actos inseguros	12 inspecciones anuales	COPASST	COPASST	\N	mayo	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:36:49.19646	2025-12-15 21:36:49.19646	f	f	f
cc02bfba-3e72-46fd-b193-f624ae1d7481	07b9d6f3-e4bd-4571-91b6-79eacb92e416	inspeccion	\N	Inspecciones Planeadas de Seguridad	Identificar condiciones y actos inseguros	12 inspecciones anuales	COPASST	COPASST	\N	junio	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:36:49.19646	2025-12-15 21:36:49.19646	f	f	f
2300d3ce-9ab9-4faa-bd40-310cad6613c5	07b9d6f3-e4bd-4571-91b6-79eacb92e416	inspeccion	\N	Inspecciones Planeadas de Seguridad	Identificar condiciones y actos inseguros	12 inspecciones anuales	COPASST	COPASST	\N	julio	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:36:49.19646	2025-12-15 21:36:49.19646	f	f	f
1ce3560b-1077-4a19-81dd-926009346d53	07b9d6f3-e4bd-4571-91b6-79eacb92e416	inspeccion	\N	Inspecciones Planeadas de Seguridad	Identificar condiciones y actos inseguros	12 inspecciones anuales	COPASST	COPASST	\N	agosto	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:36:49.19646	2025-12-15 21:36:49.19646	f	f	f
f792756f-5584-42c9-a065-e62e1a4bb461	07b9d6f3-e4bd-4571-91b6-79eacb92e416	inspeccion	\N	Inspecciones Planeadas de Seguridad	Identificar condiciones y actos inseguros	12 inspecciones anuales	COPASST	COPASST	\N	septiembre	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:36:49.19646	2025-12-15 21:36:49.19646	f	f	f
2d485ba5-881a-4305-8a2a-67547590e029	07b9d6f3-e4bd-4571-91b6-79eacb92e416	inspeccion	\N	Inspecciones Planeadas de Seguridad	Identificar condiciones y actos inseguros	12 inspecciones anuales	COPASST	COPASST	\N	octubre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:36:49.19646	2025-12-15 21:36:49.19646	f	f	f
81c18794-f4c2-4803-8f0d-5feac343f9fa	07b9d6f3-e4bd-4571-91b6-79eacb92e416	inspeccion	\N	Inspecciones Planeadas de Seguridad	Identificar condiciones y actos inseguros	12 inspecciones anuales	COPASST	COPASST	\N	noviembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:36:49.19646	2025-12-15 21:36:49.19646	f	f	f
6e75753f-68c9-46f2-9a4f-6ea6c41ab7ea	07b9d6f3-e4bd-4571-91b6-79eacb92e416	inspeccion	\N	Inspecciones Planeadas de Seguridad	Identificar condiciones y actos inseguros	12 inspecciones anuales	COPASST	COPASST	\N	diciembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:36:49.19646	2025-12-15 21:36:49.19646	f	f	f
7cb79683-ae5a-40ad-ab09-c6757c3cd995	07b9d6f3-e4bd-4571-91b6-79eacb92e416	auditoria	\N	Medición de Indicadores de Gestión SST	Evaluar indicadores de estructura, proceso y resultado	Informe trimestral de indicadores	Responsable SG-SST	Responsable SG-SST	\N	septiembre	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:38:28.516282	2025-12-15 21:38:28.516282	f	f	f
d9c62837-ae73-447c-8bf8-c04a5d6a8bd2	07b9d6f3-e4bd-4571-91b6-79eacb92e416	auditoria	\N	Medición de Indicadores de Gestión SST	Evaluar indicadores de estructura, proceso y resultado	Informe trimestral de indicadores	Responsable SG-SST	Responsable SG-SST	\N	diciembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:38:28.516282	2025-12-15 21:38:28.516282	f	f	f
c76c870f-cb88-4712-9a05-9327e27d6008	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Actas de Reuniones Mensuales del COPASST	Documentar las reuniones mensuales del comité	12 actas anuales	COPASST	COPASST	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:34:43.475074	2025-12-15 21:34:43.475074	f	f	f
913ff68e-8439-47e9-96d5-7e92dfd9df1b	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Actas de Reuniones Mensuales del COPASST	Documentar las reuniones mensuales del comité	12 actas anuales	COPASST	COPASST	\N	marzo	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:34:43.475074	2025-12-15 21:34:43.475074	f	f	f
445dd177-566f-43e8-81aa-eb704f223896	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Actas de Reuniones Mensuales del COPASST	Documentar las reuniones mensuales del comité	12 actas anuales	COPASST	COPASST	\N	abril	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:34:43.475074	2025-12-15 21:34:43.475074	f	f	f
9104c49b-7357-4889-938d-90bd401354ea	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Actas de Reuniones Mensuales del COPASST	Documentar las reuniones mensuales del comité	12 actas anuales	COPASST	COPASST	\N	mayo	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:34:43.475074	2025-12-15 21:34:43.475074	f	f	f
c98763f9-dab3-4d3c-b2ff-eae1057bb45b	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Actas de Reuniones Mensuales del COPASST	Documentar las reuniones mensuales del comité	12 actas anuales	COPASST	COPASST	\N	junio	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:34:43.475074	2025-12-15 21:34:43.475074	f	f	f
2cf2a3e4-3299-4a8f-a0ae-983924978385	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Actas de Reuniones Mensuales del COPASST	Documentar las reuniones mensuales del comité	12 actas anuales	COPASST	COPASST	\N	julio	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:34:43.475074	2025-12-15 21:34:43.475074	f	f	f
893087b9-890e-4d7f-ad8a-c20f794fe3f7	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Actas de Reuniones Mensuales del COPASST	Documentar las reuniones mensuales del comité	12 actas anuales	COPASST	COPASST	\N	agosto	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:34:43.475074	2025-12-15 21:34:43.475074	f	f	f
3c0cf878-cb6f-483d-8338-fb3d351c8e3a	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Actas de Reuniones Mensuales del COPASST	Documentar las reuniones mensuales del comité	12 actas anuales	COPASST	COPASST	\N	septiembre	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:34:43.475074	2025-12-15 21:34:43.475074	f	f	f
78a192cf-5b4d-440b-ba63-f557563ec81c	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Actas de Reuniones Mensuales del COPASST	Documentar las reuniones mensuales del comité	12 actas anuales	COPASST	COPASST	\N	octubre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:34:43.475074	2025-12-15 21:34:43.475074	f	f	f
c6c3e861-2f54-4cde-b0f2-8b602b8d083a	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Actas de Reuniones Mensuales del COPASST	Documentar las reuniones mensuales del comité	12 actas anuales	COPASST	COPASST	\N	noviembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:34:43.475074	2025-12-15 21:34:43.475074	f	f	f
67044eaa-afe0-49c2-92a7-7253d68eadb5	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Actas de Reuniones Mensuales del COPASST	Documentar las reuniones mensuales del comité	12 actas anuales	COPASST	COPASST	\N	diciembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:34:43.475074	2025-12-15 21:34:43.475074	f	f	f
f31bf2f6-2b12-4e61-8873-6f130c402479	07b9d6f3-e4bd-4571-91b6-79eacb92e416	epp	\N	Entrega y Registro de EPP	Suministrar EPP a los trabajadores	100% de trabajadores con EPP	Responsable SG-SST	Responsable SG-SST	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:37:32.679526	2025-12-15 21:37:32.679526	f	f	f
a4c73220-b2c9-43d1-a145-e6cff71025a1	07b9d6f3-e4bd-4571-91b6-79eacb92e416	epp	\N	Entrega y Registro de EPP	Suministrar EPP a los trabajadores	100% de trabajadores con EPP	Responsable SG-SST	Responsable SG-SST	\N	abril	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:37:32.679526	2025-12-15 21:37:32.679526	f	f	f
2bc5c90d-aa80-49c5-9cb0-b0bf589f1899	07b9d6f3-e4bd-4571-91b6-79eacb92e416	epp	\N	Entrega y Registro de EPP	Suministrar EPP a los trabajadores	100% de trabajadores con EPP	Responsable SG-SST	Responsable SG-SST	\N	julio	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:37:32.679526	2025-12-15 21:37:32.679526	f	f	f
56ada53c-6b85-474a-971b-1fc36c1281c2	07b9d6f3-e4bd-4571-91b6-79eacb92e416	epp	\N	Entrega y Registro de EPP	Suministrar EPP a los trabajadores	100% de trabajadores con EPP	Responsable SG-SST	Responsable SG-SST	\N	octubre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:37:32.679526	2025-12-15 21:37:32.679526	f	f	f
5cfe3092-6b1e-42f9-8e20-e6f8045bdac3	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Seguimiento a Programas del SG-SST	Evaluar avance de programas de gestión	Informe mensual de seguimiento	Responsable SG-SST	Responsable SG-SST	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:37:32.679526	2025-12-15 21:37:32.679526	f	f	f
5751c21f-4a80-48b6-8cc2-0d8ea4e1f303	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Seguimiento a Programas del SG-SST	Evaluar avance de programas de gestión	Informe mensual de seguimiento	Responsable SG-SST	Responsable SG-SST	\N	febrero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:37:32.679526	2025-12-15 21:37:32.679526	f	f	f
c3a24e1f-0aae-415c-9fe0-1d6942123caf	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Seguimiento a Programas del SG-SST	Evaluar avance de programas de gestión	Informe mensual de seguimiento	Responsable SG-SST	Responsable SG-SST	\N	marzo	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:37:32.679526	2025-12-15 21:37:32.679526	f	f	f
f78300da-2e48-46c2-81f8-628d8fda9a47	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Seguimiento a Programas del SG-SST	Evaluar avance de programas de gestión	Informe mensual de seguimiento	Responsable SG-SST	Responsable SG-SST	\N	abril	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:37:32.679526	2025-12-15 21:37:32.679526	f	f	f
7d44d593-8fb3-4d6d-b10a-60d45effdb06	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Seguimiento a Programas del SG-SST	Evaluar avance de programas de gestión	Informe mensual de seguimiento	Responsable SG-SST	Responsable SG-SST	\N	mayo	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:37:32.679526	2025-12-15 21:37:32.679526	f	f	f
643f4ca5-ec4c-4332-9646-ba2504d8670f	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Seguimiento a Programas del SG-SST	Evaluar avance de programas de gestión	Informe mensual de seguimiento	Responsable SG-SST	Responsable SG-SST	\N	junio	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:37:32.679526	2025-12-15 21:37:32.679526	f	f	f
9986c7a5-5b9c-4b8d-a860-f54874c27fdd	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Seguimiento a Programas del SG-SST	Evaluar avance de programas de gestión	Informe mensual de seguimiento	Responsable SG-SST	Responsable SG-SST	\N	julio	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:37:32.679526	2025-12-15 21:37:32.679526	f	f	f
b5749ee6-1df5-4f3f-a3a5-9ad2d4c96292	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Seguimiento a Programas del SG-SST	Evaluar avance de programas de gestión	Informe mensual de seguimiento	Responsable SG-SST	Responsable SG-SST	\N	agosto	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:37:32.679526	2025-12-15 21:37:32.679526	f	f	f
32c331b2-05a0-4067-97d1-05364f0e0ff8	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Seguimiento a Programas del SG-SST	Evaluar avance de programas de gestión	Informe mensual de seguimiento	Responsable SG-SST	Responsable SG-SST	\N	septiembre	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:37:32.679526	2025-12-15 21:37:32.679526	f	f	f
20194646-775d-475a-809d-50ae85fb03b7	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Seguimiento a Programas del SG-SST	Evaluar avance de programas de gestión	Informe mensual de seguimiento	Responsable SG-SST	Responsable SG-SST	\N	octubre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:37:32.679526	2025-12-15 21:37:32.679526	f	f	f
9e3d0e94-3b5a-4b52-b28d-a98fc0b97058	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Seguimiento a Programas del SG-SST	Evaluar avance de programas de gestión	Informe mensual de seguimiento	Responsable SG-SST	Responsable SG-SST	\N	noviembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:37:32.679526	2025-12-15 21:37:32.679526	f	f	f
36e7c1c4-f5e8-45d9-8624-4cc513b6676a	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Seguimiento a Programas del SG-SST	Evaluar avance de programas de gestión	Informe mensual de seguimiento	Responsable SG-SST	Responsable SG-SST	\N	diciembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:37:32.679526	2025-12-15 21:37:32.679526	f	f	f
541bf474-0643-4f94-a8e5-2f18b4c0843e	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Actas de Reuniones Mensuales del COPASST	Documentar las reuniones mensuales del comité	12 actas anuales	COPASST	COPASST	\N	marzo	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:30:57.382057	2025-12-16 06:07:54.699461	f	f	f
bf095290-b2e8-43a8-be55-5dab704897f7	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Publicación y Socialización de la Política de SST	Divulgar la política de SST a todos los trabajadores	100% de trabajadores informados	COPASST	COPASST	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:30:53.162329	2025-12-15 21:30:53.162329	f	f	f
111409a6-9950-4f7e-8039-d66d77188fb5	07b9d6f3-e4bd-4571-91b6-79eacb92e416	identificacion-peligros	\N	Actualización de la Matriz IPERC	Identificar y valorar los peligros y riesgos presentes en las actividades laborales	100% de áreas de trabajo evaluadas	COPASST	COPASST	\N	agosto	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:30:53.512467	2025-12-15 21:30:53.512467	f	f	f
e614e3fe-a17f-4ae1-9d3c-02a8cad265cc	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Definición de Indicadores de Gestión SST	Establecer indicadores de estructura, proceso y resultado	3 tipos de indicadores definidos	Responsable SG-SST	Responsable SG-SST	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:30:53.863356	2025-12-15 21:30:53.863356	f	f	f
fdecb65a-82ce-4aea-ba6e-7b226efbbd18	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Definición de Indicadores de Gestión SST	Establecer indicadores de estructura, proceso y resultado	3 tipos de indicadores definidos	Responsable SG-SST	Responsable SG-SST	\N	agosto	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:30:54.212552	2025-12-15 21:30:54.212552	f	f	f
0f56e75f-1d57-4d42-98e1-c3538d347919	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Documentación de la Designación del Responsable del SG-SST	Formalizar el nombramiento del responsable del sistema	Acta de designación firmada	Gerencia General	Gerencia General	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:30:54.573433	2025-12-15 21:30:54.573433	f	f	f
9e91460e-44ef-4875-a3a2-0fafc80a8eb9	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Documentación de Responsabilidades Específicas en SST	Definir responsabilidades de SST para cada nivel de la organización	Manual de responsabilidades actualizado	Gerencia General	Gerencia General	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:30:54.922485	2025-12-15 21:30:54.922485	f	f	f
569a2710-030f-42c0-813e-ec5f04d23060	07b9d6f3-e4bd-4571-91b6-79eacb92e416	capacitacion	\N	Verificar Certificación del Curso Virtual de 50 Horas en SST	Asegurar que el responsable del SG-SST cuente con la certificación requerida	Certificado vigente verificado	Responsable SG-SST	Responsable SG-SST	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:30:55.272328	2025-12-15 21:30:55.272328	f	f	f
79e9132c-c6a9-48de-97c8-1b54f434061d	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Actualización de la Matriz de Requisitos Legales	Mantener actualizada la normatividad aplicable en SST	Matriz actualizada con normatividad vigente	Responsable SG-SST	Responsable SG-SST	\N	septiembre	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:30:55.621371	2025-12-15 21:30:55.621371	f	f	f
c7d27b57-224c-4e90-83a1-9f551d5ba43e	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Conformación del COPASST	Conformar o actualizar el COPASST según normatividad	COPASST legalmente constituido	Responsable SG-SST	Responsable SG-SST	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:30:55.981421	2025-12-15 21:30:55.981421	f	f	f
21a8bf4a-945e-4fe9-a3d3-2271c58f9bba	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Conformación del COPASST	Conformar o actualizar el COPASST según normatividad	COPASST legalmente constituido	Responsable SG-SST	Responsable SG-SST	\N	julio	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:30:56.329693	2025-12-15 21:30:56.329693	f	f	f
e62bd35e-47b7-4887-9498-cf5e29be8100	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Actas de Reuniones Mensuales del COPASST	Documentar las reuniones mensuales del comité	12 actas anuales	COPASST	COPASST	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:30:56.68048	2025-12-15 21:30:56.68048	f	f	f
cb1d1f9e-d55e-4e3b-943e-f9634ef3b404	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Actas de Reuniones Mensuales del COPASST	Documentar las reuniones mensuales del comité	12 actas anuales	COPASST	COPASST	\N	febrero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:30:57.030793	2025-12-15 21:30:57.030793	f	f	f
8f40b938-b048-4249-819f-41295382ed8b	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Actas de Reuniones Mensuales del COPASST	Documentar las reuniones mensuales del comité	12 actas anuales	COPASST	COPASST	\N	abril	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:30:57.7308	2025-12-15 21:30:57.7308	f	f	f
2027fe06-47c1-486d-a26f-de49851166b8	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Actas de Reuniones Mensuales del COPASST	Documentar las reuniones mensuales del comité	12 actas anuales	COPASST	COPASST	\N	mayo	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:30:58.079693	2025-12-15 21:30:58.079693	f	f	f
a8b4867d-2e1e-47c7-927b-4d531f997e62	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Actas de Reuniones Mensuales del COPASST	Documentar las reuniones mensuales del comité	12 actas anuales	COPASST	COPASST	\N	junio	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:30:58.433306	2025-12-15 21:30:58.433306	f	f	f
db0219f3-e004-4fa0-a692-6e18fb6d5094	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Actas de Reuniones Mensuales del COPASST	Documentar las reuniones mensuales del comité	12 actas anuales	COPASST	COPASST	\N	julio	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:30:58.786357	2025-12-15 21:30:58.786357	f	f	f
37562d1a-21e3-4e39-a782-bb118f2bb965	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Actas de Reuniones Mensuales del COPASST	Documentar las reuniones mensuales del comité	12 actas anuales	COPASST	COPASST	\N	agosto	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:30:59.13498	2025-12-15 21:30:59.13498	f	f	f
701a0946-f156-4488-9843-d689ac37b232	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Actas de Reuniones Mensuales del COPASST	Documentar las reuniones mensuales del comité	12 actas anuales	COPASST	COPASST	\N	septiembre	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:30:59.484464	2025-12-15 21:30:59.484464	f	f	f
9af5c1c2-a767-4bed-90d3-9bcc7dfbf289	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Actas de Reuniones Mensuales del COPASST	Documentar las reuniones mensuales del comité	12 actas anuales	COPASST	COPASST	\N	octubre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:30:59.833241	2025-12-15 21:30:59.833241	f	f	f
f6dbdeb0-56f6-4e8a-8cf4-be4153085cfb	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Actas de Reuniones Mensuales del COPASST	Documentar las reuniones mensuales del comité	12 actas anuales	COPASST	COPASST	\N	noviembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:00.181753	2025-12-15 21:31:00.181753	f	f	f
a6d92a17-44cb-4d81-b1e5-edf379849324	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Actas de Reuniones Mensuales del COPASST	Documentar las reuniones mensuales del comité	12 actas anuales	COPASST	COPASST	\N	diciembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:00.542022	2025-12-15 21:31:00.542022	f	f	f
c20c0ba4-c45d-44c6-b24b-8f5038537084	07b9d6f3-e4bd-4571-91b6-79eacb92e416	capacitacion	\N	Capacitación al Comité COPASST	Formar a los miembros del COPASST en sus funciones	100% de miembros capacitados	Responsable SG-SST	Responsable SG-SST	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:00.89136	2025-12-15 21:31:00.89136	f	f	f
ecdce109-2673-44dd-a9a9-809835707929	07b9d6f3-e4bd-4571-91b6-79eacb92e416	capacitacion	\N	Capacitación al Comité COPASST	Formar a los miembros del COPASST en sus funciones	100% de miembros capacitados	Responsable SG-SST	Responsable SG-SST	\N	julio	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:01.239888	2025-12-15 21:31:01.239888	f	f	f
cb0efbd2-a0f6-46ab-aa0e-b22c1bb588cb	07b9d6f3-e4bd-4571-91b6-79eacb92e416	riesgo-psicosocial	\N	Conformación del Comité de Convivencia Laboral	Conformar el comité según normatividad vigente	CCL legalmente constituido	Gerencia - COPASST	Gerencia - COPASST	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:01.58988	2025-12-15 21:31:01.58988	f	f	f
f9bd5d1f-1f03-4c68-8423-64ca87ab1ee8	07b9d6f3-e4bd-4571-91b6-79eacb92e416	riesgo-psicosocial	\N	Conformación del Comité de Convivencia Laboral	Conformar el comité según normatividad vigente	CCL legalmente constituido	Gerencia - COPASST	Gerencia - COPASST	\N	julio	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:01.937709	2025-12-15 21:31:01.937709	f	f	f
8efde659-eea8-47cd-9705-2d2b54a184b9	07b9d6f3-e4bd-4571-91b6-79eacb92e416	riesgo-psicosocial	\N	Actas de Reuniones del Comité de Convivencia Laboral	Documentar las reuniones trimestrales del comité	4 actas trimestrales	CCL	CCL	\N	marzo	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:02.286437	2025-12-15 21:31:02.286437	f	f	f
f25fa746-c611-416a-9955-9b1bab78f9e1	07b9d6f3-e4bd-4571-91b6-79eacb92e416	riesgo-psicosocial	\N	Actas de Reuniones del Comité de Convivencia Laboral	Documentar las reuniones trimestrales del comité	4 actas trimestrales	CCL	CCL	\N	junio	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:02.639563	2025-12-15 21:31:02.639563	f	f	f
018d82f8-427f-4e7c-82aa-515cf4b95661	07b9d6f3-e4bd-4571-91b6-79eacb92e416	riesgo-psicosocial	\N	Actas de Reuniones del Comité de Convivencia Laboral	Documentar las reuniones trimestrales del comité	4 actas trimestrales	CCL	CCL	\N	septiembre	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:02.993228	2025-12-15 21:31:02.993228	f	f	f
73fb5e95-543e-458e-a377-4d8cf870e0a0	07b9d6f3-e4bd-4571-91b6-79eacb92e416	riesgo-psicosocial	\N	Actas de Reuniones del Comité de Convivencia Laboral	Documentar las reuniones trimestrales del comité	4 actas trimestrales	CCL	CCL	\N	diciembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:03.34273	2025-12-15 21:31:03.34273	f	f	f
934473ca-2e83-472c-b470-f18358999935	07b9d6f3-e4bd-4571-91b6-79eacb92e416	capacitacion	\N	Capacitación al Comité de Convivencia Laboral	Formar a los miembros del CCL en sus funciones	100% de miembros capacitados	Responsable SG-SST	Responsable SG-SST	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:03.693695	2025-12-15 21:31:03.693695	f	f	f
c6e8f3bb-9010-430f-9724-10b368afae01	07b9d6f3-e4bd-4571-91b6-79eacb92e416	capacitacion	\N	Capacitación al Comité de Convivencia Laboral	Formar a los miembros del CCL en sus funciones	100% de miembros capacitados	Responsable SG-SST	Responsable SG-SST	\N	julio	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:04.057209	2025-12-15 21:31:04.057209	f	f	f
14984ff7-47b0-4c93-90bd-92ec161a0554	07b9d6f3-e4bd-4571-91b6-79eacb92e416	higiene-seguridad	\N	Diseño y Publicación del Reglamento de Higiene y Seguridad Industrial	Establecer normas internas de higiene y seguridad	Reglamento publicado y socializado	Responsable SG-SST	Responsable SG-SST	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:04.405122	2025-12-15 21:31:04.405122	f	f	f
3b4f70e5-661f-4601-a0fd-793bb8d480f4	07b9d6f3-e4bd-4571-91b6-79eacb92e416	higiene-seguridad	\N	Diseño y Publicación del Reglamento de Higiene y Seguridad Industrial	Establecer normas internas de higiene y seguridad	Reglamento publicado y socializado	Responsable SG-SST	Responsable SG-SST	\N	septiembre	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:04.754844	2025-12-15 21:31:04.754844	f	f	f
d3c8fd5d-a80a-482d-8c66-d57d6df6a8d6	07b9d6f3-e4bd-4571-91b6-79eacb92e416	capacitacion	\N	Diseño del Programa de Capacitación y Entrenamiento SST	Planificar las capacitaciones anuales en SST	Programa aprobado con cronograma	Responsable SG-SST	Responsable SG-SST	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:05.106697	2025-12-15 21:31:05.106697	f	f	f
2fa96b18-d701-4f95-8429-a63d46f1516f	07b9d6f3-e4bd-4571-91b6-79eacb92e416	capacitacion	\N	Verificar Certificación de Miembros COPASST y CCL	Asegurar formación certificada del personal de comités	100% certificados verificados	Responsable SG-SST	Responsable SG-SST	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:05.460747	2025-12-15 21:31:05.460747	f	f	f
2b4b85e6-0413-45f5-b35e-d18e56a976fe	07b9d6f3-e4bd-4571-91b6-79eacb92e416	capacitacion	\N	Verificar Certificación de Miembros COPASST y CCL	Asegurar formación certificada del personal de comités	100% certificados verificados	Responsable SG-SST	Responsable SG-SST	\N	agosto	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:05.812201	2025-12-15 21:31:05.812201	f	f	f
671cb742-8c6a-4832-8bbd-206608406037	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Diseño e Implementación del Plan de Comunicaciones SST	Establecer mecanismos de comunicación en SST	Plan de comunicaciones implementado	Responsable SG-SST	Responsable SG-SST	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:06.172144	2025-12-15 21:31:06.172144	f	f	f
2ae0b72e-1558-4cc6-9240-269bebb5d884	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Diseño e Implementación del Plan de Comunicaciones SST	Establecer mecanismos de comunicación en SST	Plan de comunicaciones implementado	Responsable SG-SST	Responsable SG-SST	\N	febrero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:06.524756	2025-12-15 21:31:06.524756	f	f	f
2d083a66-f78f-4697-8603-1362b44a8ec1	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Procedimiento de Compras con Criterios SST	Incluir criterios de SST en el proceso de compras	Procedimiento documentado e implementado	Responsable SG-SST	Responsable SG-SST	\N	febrero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:06.873854	2025-12-15 21:31:06.873854	f	f	f
bb511c6c-8813-49fc-9280-934e8af9c790	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Procedimiento de Evaluación y Selección de Proveedores/Contratistas	Evaluar proveedores con criterios de SST	100% proveedores críticos evaluados	Responsable SG-SST	Responsable SG-SST	\N	febrero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:07.221628	2025-12-15 21:31:07.221628	f	f	f
ad159187-1afe-4317-98e9-172764ad5848	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Procedimiento de Gestión del Cambio	Evaluar impacto de cambios en SST	Procedimiento documentado e implementado	Responsable SG-SST	Responsable SG-SST	\N	marzo	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:07.578117	2025-12-15 21:31:07.578117	f	f	f
c8cdb5ba-044b-455d-a546-d2c586459aac	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Inclusión del SG-SST en la Tabla de Retención Documental	Organizar la documentación del SG-SST	TRD actualizada con documentos SST	Responsable SG-SST	Responsable SG-SST	\N	marzo	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:07.92983	2025-12-15 21:31:07.92983	f	f	f
970f2faf-5165-42c5-8075-e7bfd933cca9	07b9d6f3-e4bd-4571-91b6-79eacb92e416	inspeccion	\N	Diseño del Programa de Inspecciones de Seguridad	Planificar inspecciones periódicas de seguridad	Programa de inspecciones documentado	Responsable SG-SST	Responsable SG-SST	\N	febrero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:08.28216	2025-12-15 21:31:08.28216	f	f	f
a7b2f176-7f0b-4df9-95c1-cdbce9fd77e0	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Diseño del Procedimiento del SG-SST	Documentar el procedimiento general del sistema	Procedimiento documentado y aprobado	Responsable SG-SST	Responsable SG-SST	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:08.646173	2025-12-15 21:31:08.646173	f	f	f
66e2541d-233c-442d-967e-a7ec231a4bfc	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Exámenes Médicos Ocupacionales Periódicos	Realizar exámenes periódicos a todos los trabajadores	100% de trabajadores con examen periódico	Responsable SG-SST	Responsable SG-SST	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:09.005368	2025-12-15 21:31:09.005368	f	f	f
b3e65cb9-d3dd-4890-b721-078c02416fda	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Exámenes Médicos Ocupacionales Periódicos	Realizar exámenes periódicos a todos los trabajadores	100% de trabajadores con examen periódico	Responsable SG-SST	Responsable SG-SST	\N	febrero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:09.358136	2025-12-15 21:31:09.358136	f	f	f
94b400d7-4707-44e2-926b-21e916f0b417	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Exámenes Médicos Ocupacionales Periódicos	Realizar exámenes periódicos a todos los trabajadores	100% de trabajadores con examen periódico	Responsable SG-SST	Responsable SG-SST	\N	marzo	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:09.708911	2025-12-15 21:31:09.708911	f	f	f
ba7bf4dc-9289-4d9d-aa9e-dc718056cd61	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Exámenes Médicos Ocupacionales Periódicos	Realizar exámenes periódicos a todos los trabajadores	100% de trabajadores con examen periódico	Responsable SG-SST	Responsable SG-SST	\N	abril	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:10.061094	2025-12-15 21:31:10.061094	f	f	f
92a6cd12-ab98-4278-a2c5-a55ff311926e	07b9d6f3-e4bd-4571-91b6-79eacb92e416	capacitacion	\N	Capacitación al Comité COPASST	Formar a los miembros del COPASST	100% de miembros capacitados	Responsable SG-SST	Responsable SG-SST	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:35:16.658822	2025-12-15 21:35:16.658822	f	f	f
1c405171-ece0-41b1-9181-0225f7292dbc	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Exámenes Médicos Ocupacionales Periódicos	Realizar exámenes periódicos a todos los trabajadores	100% de trabajadores con examen periódico	Responsable SG-SST	Responsable SG-SST	\N	mayo	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:10.402123	2025-12-15 21:31:10.402123	f	f	f
2467404d-f818-4dd3-a392-094dab76fa7a	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Exámenes Médicos Ocupacionales Periódicos	Realizar exámenes periódicos a todos los trabajadores	100% de trabajadores con examen periódico	Responsable SG-SST	Responsable SG-SST	\N	junio	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:10.730391	2025-12-15 21:31:10.730391	f	f	f
db96735d-ea67-44f5-9199-5c4ab0ed0864	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Exámenes Médicos Ocupacionales Periódicos	Realizar exámenes periódicos a todos los trabajadores	100% de trabajadores con examen periódico	Responsable SG-SST	Responsable SG-SST	\N	julio	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:11.057556	2025-12-15 21:31:11.057556	f	f	f
38d3a684-7d52-4022-a431-f1faefbeab25	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Exámenes Médicos Ocupacionales Periódicos	Realizar exámenes periódicos a todos los trabajadores	100% de trabajadores con examen periódico	Responsable SG-SST	Responsable SG-SST	\N	agosto	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:11.382117	2025-12-15 21:31:11.382117	f	f	f
9db2f0f4-d4ba-4cae-878d-cce8345529ed	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Exámenes Médicos Ocupacionales Periódicos	Realizar exámenes periódicos a todos los trabajadores	100% de trabajadores con examen periódico	Responsable SG-SST	Responsable SG-SST	\N	septiembre	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:11.71102	2025-12-15 21:31:11.71102	f	f	f
3d6f7727-2684-4336-b6c4-e4826a22e2b8	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Exámenes Médicos Ocupacionales Periódicos	Realizar exámenes periódicos a todos los trabajadores	100% de trabajadores con examen periódico	Responsable SG-SST	Responsable SG-SST	\N	octubre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:12.039178	2025-12-15 21:31:12.039178	f	f	f
3a9aa92b-c85b-4ad6-af4c-b04a0515839b	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Exámenes Médicos Ocupacionales Periódicos	Realizar exámenes periódicos a todos los trabajadores	100% de trabajadores con examen periódico	Responsable SG-SST	Responsable SG-SST	\N	noviembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:12.370092	2025-12-15 21:31:12.370092	f	f	f
110591b8-659f-41ee-8b5b-d74146066a9b	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Exámenes Médicos Ocupacionales Periódicos	Realizar exámenes periódicos a todos los trabajadores	100% de trabajadores con examen periódico	Responsable SG-SST	Responsable SG-SST	\N	diciembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:12.695325	2025-12-15 21:31:12.695325	f	f	f
c6d904d9-47a8-483d-a0d1-2fb6dae469cb	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Elaboración del Profesiograma	Definir requisitos de salud por cargo	Profesiograma para todos los cargos	Responsable SG-SST	Responsable SG-SST	\N	febrero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:13.021856	2025-12-15 21:31:13.021856	f	f	f
63c8582c-74a1-43fd-ab43-e3cc1ba04bdc	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Caracterización de Condiciones de Salud de los Trabajadores	Analizar el estado de salud de la población trabajadora	Informe de condiciones de salud elaborado	Responsable SG-SST	Responsable SG-SST	\N	marzo	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:13.347045	2025-12-15 21:31:13.347045	f	f	f
4d9b12fc-0f30-466d-9ed7-752a8299a196	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Descripción Sociodemográfica de los Trabajadores	Caracterizar la población trabajadora	Perfil sociodemográfico actualizado	Responsable SG-SST	Responsable SG-SST	\N	marzo	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:13.681115	2025-12-15 21:31:13.681115	f	f	f
48cd2c5b-cc22-479c-8ac8-a715ec3f2156	07b9d6f3-e4bd-4571-91b6-79eacb92e416	vigilancia-epidemiologica	\N	Implementación del SVE (Sistema de Vigilancia Epidemiológica)	Implementar SVE según riesgos prioritarios	SVE documentado e implementado	Responsable SG-SST	Responsable SG-SST	\N	abril	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:14.004983	2025-12-15 21:31:14.004983	f	f	f
34f4c3bd-6032-4be0-ac3d-e491ef9b4455	07b9d6f3-e4bd-4571-91b6-79eacb92e416	vigilancia-epidemiologica	\N	Implementación del SVE (Sistema de Vigilancia Epidemiológica)	Implementar SVE según riesgos prioritarios	SVE documentado e implementado	Responsable SG-SST	Responsable SG-SST	\N	octubre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:31:14.328533	2025-12-15 21:31:14.328533	f	f	f
19618db6-7d3a-42eb-bc4b-f2724028cc93	07b9d6f3-e4bd-4571-91b6-79eacb92e416	capacitacion	\N	Capacitación al Comité COPASST	Formar a los miembros del COPASST	100% de miembros capacitados	Responsable SG-SST	Responsable SG-SST	\N	julio	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:35:16.658822	2025-12-15 21:35:16.658822	f	f	f
58f8caed-0cff-43c5-b056-7d041858e3b2	07b9d6f3-e4bd-4571-91b6-79eacb92e416	riesgo-psicosocial	\N	Conformación del Comité de Convivencia Laboral	Conformar el comité según normatividad	CCL legalmente constituido	Gerencia - COPASST	Gerente General	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:35:16.658822	2025-12-15 21:35:16.658822	f	f	f
0980f717-f4b0-48c7-a864-46c4f125da31	07b9d6f3-e4bd-4571-91b6-79eacb92e416	riesgo-psicosocial	\N	Conformación del Comité de Convivencia Laboral	Conformar el comité según normatividad	CCL legalmente constituido	Gerencia - COPASST	Gerente General	\N	julio	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:35:16.658822	2025-12-15 21:35:16.658822	f	f	f
85ae7fa1-9955-47e5-b9ed-2737ae8b5659	07b9d6f3-e4bd-4571-91b6-79eacb92e416	capacitacion	\N	Capacitación al Comité de Convivencia Laboral	Formar a los miembros del CCL	100% de miembros capacitados	Responsable SG-SST	Responsable SG-SST	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:35:16.658822	2025-12-15 21:35:16.658822	f	f	f
d5cbe2bc-dd9b-42d7-accf-1dc295245299	07b9d6f3-e4bd-4571-91b6-79eacb92e416	riesgo-psicosocial	\N	Actas de Reuniones del Comité de Convivencia Laboral	Documentar las reuniones del CCL	4 actas anuales	Comité Convivencia	Presidente CCL	\N	marzo	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:35:16.658822	2025-12-15 21:35:16.658822	f	f	f
9e4de044-f836-45a1-8665-ea4400ee2ad1	07b9d6f3-e4bd-4571-91b6-79eacb92e416	riesgo-psicosocial	\N	Actas de Reuniones del Comité de Convivencia Laboral	Documentar las reuniones del CCL	4 actas anuales	Comité Convivencia	Presidente CCL	\N	junio	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:35:16.658822	2025-12-15 21:35:16.658822	f	f	f
3db602dc-5418-45a6-8d26-ca094ef17224	07b9d6f3-e4bd-4571-91b6-79eacb92e416	riesgo-psicosocial	\N	Actas de Reuniones del Comité de Convivencia Laboral	Documentar las reuniones del CCL	4 actas anuales	Comité Convivencia	Presidente CCL	\N	septiembre	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:35:16.658822	2025-12-15 21:35:16.658822	f	f	f
e980ac73-e7ad-4c8f-81df-f4085a53ac79	07b9d6f3-e4bd-4571-91b6-79eacb92e416	riesgo-psicosocial	\N	Actas de Reuniones del Comité de Convivencia Laboral	Documentar las reuniones del CCL	4 actas anuales	Comité Convivencia	Presidente CCL	\N	diciembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:35:16.658822	2025-12-15 21:35:16.658822	f	f	f
36b5a5c0-b66f-4e49-be3b-e19130263e88	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Diseño del Procedimiento del SG-SST	Establecer el procedimiento general del sistema	Procedimiento documentado	Responsable SG-SST	Responsable SG-SST	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:35:16.658822	2025-12-15 21:35:16.658822	f	f	f
4b0de266-289e-4824-8775-72e9d997fe25	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Diseño e Implementación del Plan de Comunicaciones SST	Establecer canales de comunicación en SST	Plan documentado e implementado	Responsable SG-SST	Responsable SG-SST	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:35:16.658822	2025-12-15 21:35:16.658822	f	f	f
0c75b001-0801-4ff2-bca7-186ca3c3416d	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Diseño y Publicación del Reglamento de Higiene y Seguridad Industrial	Establecer y divulgar el reglamento	Reglamento publicado	Responsable SG-SST	Responsable SG-SST	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:35:16.658822	2025-12-15 21:35:16.658822	f	f	f
c372f0f3-fa39-4fd8-b290-d5498d40fac9	07b9d6f3-e4bd-4571-91b6-79eacb92e416	auditoria	\N	Autoevaluación de Estándares Mínimos Res. 0312/2019	Evaluar cumplimiento de estándares mínimos	Evaluación anual con calificación	Responsable SG-SST	Responsable SG-SST	\N	diciembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:38:28.516282	2025-12-15 21:38:28.516282	f	f	f
0a42bbb8-37ef-46a0-9253-5e66152c0d97	07b9d6f3-e4bd-4571-91b6-79eacb92e416	auditoria	\N	Verificación de Efectividad de Controles	Verificar efectividad de las medidas de prevención	Informe de verificación	Responsable SG-SST	Responsable SG-SST	\N	junio	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:38:28.516282	2025-12-15 21:38:28.516282	f	f	f
264510eb-88fa-4cba-a6d2-a263332807fe	07b9d6f3-e4bd-4571-91b6-79eacb92e416	auditoria	\N	Verificación de Efectividad de Controles	Verificar efectividad de las medidas de prevención	Informe de verificación	Responsable SG-SST	Responsable SG-SST	\N	diciembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:38:28.516282	2025-12-15 21:38:28.516282	f	f	f
7f81b548-b112-489d-8d37-f2a9c783a656	07b9d6f3-e4bd-4571-91b6-79eacb92e416	mejora-continua	\N	Gestión de Acciones Correctivas y Preventivas	Implementar acciones de mejora identificadas	100% de acciones gestionadas	Responsable SG-SST	Responsable SG-SST	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:38:51.700866	2025-12-15 21:38:51.700866	f	f	f
a841312b-6615-4a96-9240-158b0a56eef5	07b9d6f3-e4bd-4571-91b6-79eacb92e416	mejora-continua	\N	Gestión de Acciones Correctivas y Preventivas	Implementar acciones de mejora identificadas	100% de acciones gestionadas	Responsable SG-SST	Responsable SG-SST	\N	abril	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:38:51.700866	2025-12-15 21:38:51.700866	f	f	f
bee81924-3363-4edd-ad3b-aff274285ba9	07b9d6f3-e4bd-4571-91b6-79eacb92e416	mejora-continua	\N	Gestión de Acciones Correctivas y Preventivas	Implementar acciones de mejora identificadas	100% de acciones gestionadas	Responsable SG-SST	Responsable SG-SST	\N	julio	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:38:51.700866	2025-12-15 21:38:51.700866	f	f	f
25f2f9e6-04aa-4098-8bfc-ed95251b34e0	07b9d6f3-e4bd-4571-91b6-79eacb92e416	mejora-continua	\N	Gestión de Acciones Correctivas y Preventivas	Implementar acciones de mejora identificadas	100% de acciones gestionadas	Responsable SG-SST	Responsable SG-SST	\N	octubre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:38:51.700866	2025-12-15 21:38:51.700866	f	f	f
a9cbb439-243f-4f6d-86ca-ddedc2cb4b0f	07b9d6f3-e4bd-4571-91b6-79eacb92e416	mejora-continua	\N	Formulación del Plan de Mejoramiento	Establecer acciones para mejorar el SG-SST	Plan de mejoramiento aprobado	Responsable SG-SST	Responsable SG-SST	\N	diciembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:38:51.700866	2025-12-15 21:38:51.700866	f	f	f
1b4cea1e-6035-47bf-b75b-9f8238422be3	07b9d6f3-e4bd-4571-91b6-79eacb92e416	mejora-continua	\N	Seguimiento a Hallazgos de Auditoría	Cerrar los hallazgos identificados en auditoría	100% de hallazgos cerrados	Responsable SG-SST	Responsable SG-SST	\N	diciembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:38:51.700866	2025-12-15 21:38:51.700866	f	f	f
724143d5-a10f-4f4f-9307-9ca1d847a591	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Actualización de Documentos del SG-SST	Mantener documentación actualizada	Documentos actualizados	Responsable SG-SST	Responsable SG-SST	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:38:51.700866	2025-12-15 21:38:51.700866	f	f	f
e8ef1c75-40d2-471a-99cf-77b467c08c6d	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Actualización de Documentos del SG-SST	Mantener documentación actualizada	Documentos actualizados	Responsable SG-SST	Responsable SG-SST	\N	julio	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:38:51.700866	2025-12-15 21:38:51.700866	f	f	f
61eb838e-823f-4956-b5d1-c46592156ec7	07b9d6f3-e4bd-4571-91b6-79eacb92e416	capacitacion	\N	Inducción y Reinducción en SST	Capacitar a trabajadores nuevos y actuales	100% de trabajadores inducidos	Responsable SG-SST	Responsable SG-SST	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:39:37.199257	2025-12-15 21:39:37.199257	f	f	f
531434c4-3b80-497a-9225-286c403c71b9	07b9d6f3-e4bd-4571-91b6-79eacb92e416	capacitacion	\N	Inducción y Reinducción en SST	Capacitar a trabajadores nuevos y actuales	100% de trabajadores inducidos	Responsable SG-SST	Responsable SG-SST	\N	febrero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:39:37.199257	2025-12-15 21:39:37.199257	f	f	f
b791ac42-03a1-4933-ae6f-5a906b753203	07b9d6f3-e4bd-4571-91b6-79eacb92e416	capacitacion	\N	Inducción y Reinducción en SST	Capacitar a trabajadores nuevos y actuales	100% de trabajadores inducidos	Responsable SG-SST	Responsable SG-SST	\N	marzo	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:39:37.199257	2025-12-15 21:39:37.199257	f	f	f
344abcef-991c-42b8-a273-a5e911dca841	07b9d6f3-e4bd-4571-91b6-79eacb92e416	capacitacion	\N	Inducción y Reinducción en SST	Capacitar a trabajadores nuevos y actuales	100% de trabajadores inducidos	Responsable SG-SST	Responsable SG-SST	\N	abril	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:39:37.199257	2025-12-15 21:39:37.199257	f	f	f
815da860-ad0a-40b2-b98b-f642f7b56145	07b9d6f3-e4bd-4571-91b6-79eacb92e416	capacitacion	\N	Inducción y Reinducción en SST	Capacitar a trabajadores nuevos y actuales	100% de trabajadores inducidos	Responsable SG-SST	Responsable SG-SST	\N	mayo	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:39:37.199257	2025-12-15 21:39:37.199257	f	f	f
ace52a8b-95eb-4abb-a7ad-9442ad5be909	07b9d6f3-e4bd-4571-91b6-79eacb92e416	capacitacion	\N	Inducción y Reinducción en SST	Capacitar a trabajadores nuevos y actuales	100% de trabajadores inducidos	Responsable SG-SST	Responsable SG-SST	\N	junio	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:39:37.199257	2025-12-15 21:39:37.199257	f	f	f
237e8372-2bf8-4755-a44a-aeb22dd9d6db	07b9d6f3-e4bd-4571-91b6-79eacb92e416	capacitacion	\N	Inducción y Reinducción en SST	Capacitar a trabajadores nuevos y actuales	100% de trabajadores inducidos	Responsable SG-SST	Responsable SG-SST	\N	julio	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:39:37.199257	2025-12-15 21:39:37.199257	f	f	f
ecfffcfb-d033-42d1-85f0-7802d5c74f0f	07b9d6f3-e4bd-4571-91b6-79eacb92e416	capacitacion	\N	Inducción y Reinducción en SST	Capacitar a trabajadores nuevos y actuales	100% de trabajadores inducidos	Responsable SG-SST	Responsable SG-SST	\N	agosto	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:39:37.199257	2025-12-15 21:39:37.199257	f	f	f
0edcb84b-9346-4bc6-a083-8a085be0ecd9	07b9d6f3-e4bd-4571-91b6-79eacb92e416	capacitacion	\N	Inducción y Reinducción en SST	Capacitar a trabajadores nuevos y actuales	100% de trabajadores inducidos	Responsable SG-SST	Responsable SG-SST	\N	septiembre	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:39:37.199257	2025-12-15 21:39:37.199257	f	f	f
0a1c0802-e9c7-44b7-8d3b-6ecdcdbd50ef	07b9d6f3-e4bd-4571-91b6-79eacb92e416	capacitacion	\N	Inducción y Reinducción en SST	Capacitar a trabajadores nuevos y actuales	100% de trabajadores inducidos	Responsable SG-SST	Responsable SG-SST	\N	octubre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:39:37.199257	2025-12-15 21:39:37.199257	f	f	f
8efda9b4-4715-44d9-b5b3-a4ecdf95ab4b	07b9d6f3-e4bd-4571-91b6-79eacb92e416	capacitacion	\N	Inducción y Reinducción en SST	Capacitar a trabajadores nuevos y actuales	100% de trabajadores inducidos	Responsable SG-SST	Responsable SG-SST	\N	noviembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:39:37.199257	2025-12-15 21:39:37.199257	f	f	f
1cf5c2ae-83e7-4257-9643-b6594284f518	07b9d6f3-e4bd-4571-91b6-79eacb92e416	capacitacion	\N	Inducción y Reinducción en SST	Capacitar a trabajadores nuevos y actuales	100% de trabajadores inducidos	Responsable SG-SST	Responsable SG-SST	\N	diciembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:39:37.199257	2025-12-15 21:39:37.199257	f	f	f
d14af81a-52f5-4318-9889-66e2192bd631	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Exámenes Médicos Ocupacionales de Ingreso	Evaluar estado de salud de trabajadores nuevos	100% de ingresos evaluados	Responsable SG-SST	Responsable SG-SST	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:40:08.352041	2025-12-15 21:40:08.352041	f	f	f
52869dcf-4028-4973-8425-b7bc05927461	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Exámenes Médicos Ocupacionales de Ingreso	Evaluar estado de salud de trabajadores nuevos	100% de ingresos evaluados	Responsable SG-SST	Responsable SG-SST	\N	febrero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:40:08.352041	2025-12-15 21:40:08.352041	f	f	f
fec89b7f-6af2-4a5f-bf1c-e25af9584a43	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Exámenes Médicos Ocupacionales de Ingreso	Evaluar estado de salud de trabajadores nuevos	100% de ingresos evaluados	Responsable SG-SST	Responsable SG-SST	\N	marzo	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:40:08.352041	2025-12-15 21:40:08.352041	f	f	f
d1fdba70-07e4-4240-9b9a-fc9e2a1d9f40	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Exámenes Médicos Ocupacionales de Ingreso	Evaluar estado de salud de trabajadores nuevos	100% de ingresos evaluados	Responsable SG-SST	Responsable SG-SST	\N	abril	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:40:08.352041	2025-12-15 21:40:08.352041	f	f	f
d02c9d01-0f83-48e1-8283-f9807322ba61	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Exámenes Médicos Ocupacionales de Ingreso	Evaluar estado de salud de trabajadores nuevos	100% de ingresos evaluados	Responsable SG-SST	Responsable SG-SST	\N	mayo	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:40:08.352041	2025-12-15 21:40:08.352041	f	f	f
06cc1581-3ab1-466e-a203-5e49eb1c5817	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Exámenes Médicos Ocupacionales de Ingreso	Evaluar estado de salud de trabajadores nuevos	100% de ingresos evaluados	Responsable SG-SST	Responsable SG-SST	\N	junio	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:40:08.352041	2025-12-15 21:40:08.352041	f	f	f
f50d6dd1-7362-4867-b4fd-65bb0d694a6b	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Exámenes Médicos Ocupacionales de Ingreso	Evaluar estado de salud de trabajadores nuevos	100% de ingresos evaluados	Responsable SG-SST	Responsable SG-SST	\N	julio	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:40:08.352041	2025-12-15 21:40:08.352041	f	f	f
4ce28095-d4ce-4a2c-a53e-8bb2edf87e46	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Exámenes Médicos Ocupacionales de Ingreso	Evaluar estado de salud de trabajadores nuevos	100% de ingresos evaluados	Responsable SG-SST	Responsable SG-SST	\N	agosto	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:40:08.352041	2025-12-15 21:40:08.352041	f	f	f
a8117990-348d-40bf-bc83-d25ea0a826e2	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Exámenes Médicos Ocupacionales de Ingreso	Evaluar estado de salud de trabajadores nuevos	100% de ingresos evaluados	Responsable SG-SST	Responsable SG-SST	\N	septiembre	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:40:08.352041	2025-12-15 21:40:08.352041	f	f	f
8127a114-b224-4bd7-bf4a-ee07725f713f	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Exámenes Médicos Ocupacionales de Ingreso	Evaluar estado de salud de trabajadores nuevos	100% de ingresos evaluados	Responsable SG-SST	Responsable SG-SST	\N	octubre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:40:08.352041	2025-12-15 21:40:08.352041	f	f	f
d13194be-7566-4f38-a1d3-a76d289d8207	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Exámenes Médicos Ocupacionales de Ingreso	Evaluar estado de salud de trabajadores nuevos	100% de ingresos evaluados	Responsable SG-SST	Responsable SG-SST	\N	noviembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:40:08.352041	2025-12-15 21:40:08.352041	f	f	f
87e0d7ae-2edb-4539-9247-620eaa20b124	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Exámenes Médicos Ocupacionales de Ingreso	Evaluar estado de salud de trabajadores nuevos	100% de ingresos evaluados	Responsable SG-SST	Responsable SG-SST	\N	diciembre	4	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:40:08.352041	2025-12-15 21:40:08.352041	f	f	f
326a6764-c29a-4d2b-b524-ebc44fd04b30	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Exámenes Médicos Periódicos	Evaluar estado de salud periódicamente	100% de trabajadores evaluados	Responsable SG-SST	Responsable SG-SST	\N	febrero	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:40:08.352041	2025-12-15 21:40:08.352041	f	f	f
ac6a1d1d-eacb-4f1a-bb04-aa183acb349c	07b9d6f3-e4bd-4571-91b6-79eacb92e416	medicina-preventiva	\N	Exámenes Médicos Periódicos	Evaluar estado de salud periódicamente	100% de trabajadores evaluados	Responsable SG-SST	Responsable SG-SST	\N	agosto	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:40:08.352041	2025-12-15 21:40:08.352041	f	f	f
cbc4f9ef-23fd-4e7e-9974-52f094855717	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Aplicación de Estándares Mínimos de SG-SST (Resolución 0312/2019)	Verificar el cumplimiento de los estándares mínimos del SG-SST	100% de estándares evaluados	Responsable SG-SST	Responsable SG-SST	\N	enero	1	\N	\N	\N	\N	\N	\N	\N	\N	completada	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:30:52.803758	2025-12-15 21:57:51.271081	f	f	t
5de81b9b-8dd6-4bd7-b380-53289a03640c	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Diseño e Implementación del Plan de Comunicaciones SST	Establecer canales de comunicación en SST	Plan documentado e implementado	Responsable SG-SST	Responsable SG-SST	\N	febrero	1	\N	\N	\N	\N	\N	\N	\N	\N	completada	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:35:16.658822	2025-12-15 22:07:17.027485	f	f	t
b7056a96-3462-4199-b286-afc611722260	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Actas de Reuniones Mensuales del COPASST	Documentar las reuniones mensuales del comité	12 actas anuales	COPASST	COPASST	\N	febrero	1	\N	\N	\N	\N	\N	\N	\N	\N	completada	0	\N	\N	\N	\N	\N	\N	2025-12-15 21:34:43.475074	2025-12-15 22:07:50.434172	f	f	t
00e4293d-35e7-4d27-bd7b-a1d0297ddb43	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Diseño e Implementación del Plan de Comunicaciones SST	Establecer canales de comunicación en SST	Plan documentado e implementado	Responsable SG-SST	Responsable SG-SST	\N	marzo	1	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-16 06:12:58.785232	2025-12-16 06:12:58.785232	f	f	f
c5c035b2-1eb3-49ce-9454-9305b0caa587	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Definición de Indicadores de Gestión SST	Establecer indicadores de estructura, proceso y resultado	3 tipos de indicadores	Responsable SG-SST	Responsable SG-SST	\N	julio	3	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-17 18:16:54.647056	2025-12-17 18:16:54.647056	f	f	f
82cdd258-a049-4a5a-a99b-e08b5b3b3ec7	07b9d6f3-e4bd-4571-91b6-79eacb92e416	otro	\N	Diseño e Implementación del Plan de Comunicaciones SST	Establecer canales de comunicación en SST	Plan documentado e implementado	Responsable SG-SST	Responsable SG-SST	\N	junio	2	\N	\N	\N	\N	\N	\N	\N	\N	pendiente	0	\N	\N	\N	\N	\N	\N	2025-12-17 18:17:02.801036	2025-12-17 18:17:02.801036	f	f	f
\.


--
-- Data for Name: adquisicion_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.adquisicion_items (id, company_id, solicitud_id, nombre_producto, categoria, marca, modelo, referencia, serial, cantidad, unidad, precio_unitario, precio_total, resource_allocation_id, ficha_tecnica_url, ficha_tecnica_nombre, hoja_seguridad_url, hoja_seguridad_nombre, certificado_url, certificado_nombre, especificaciones_sst, cumple_normativa, normas_aplicables, vida_util_meses, fecha_vencimiento, requiere_mantenimiento, frecuencia_mantenimiento_dias, estado, fecha_compra, fecha_baja, motivo_baja, observaciones, created_at, updated_at) FROM stdin;
8f6d1219-b303-4058-a27d-3ee2fcc43690	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	\N	Casco de Seguridad Industrial Clase G - Casco de seguridad para protección contra impactos y golpes,	epp					1	unidades	500000	500000	806e1f24-ac21-417d-b8d1-8f96388643f0		\N		\N	\N	\N	Certificación según clase (G, E, C). Sistema de suspensión de 4 puntos mínimo. Banda de sudor reemplazable. Ranuras para accesorios compatibles.	1	NTC 1523 - Cascos de seguridad industrial. ANSI/ISEA Z89.1 - Requisitos de rendimiento. Resolución 2400/1979 Art. 177. Decreto 1072/2015 Art. 2.2.4.6.24.	12	2026-03-20	0	\N	activo	2025-12-19	\N	\N		2025-12-20 10:10:11.966374	2025-12-20 10:26:46.755362
\.


--
-- Data for Name: afiliaciones_ssss; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.afiliaciones_ssss (id, worker_id, company_id, fecha, eps_file_url, arl_file_url, pension_file_url, created_at, eps_nombre, arl_nombre, afp_nombre, ccf_nombre) FROM stdin;
bb546dc2-3de5-4310-8c2f-889cbd1d2e6c	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	2025-12-18	\N	\N	\N	2025-12-18 21:52:21.187012	EPS Sura	Seguros de Riesgos Laborales SURA	Protección S.A.	Caja de Compensación Familiar CAFAM
\.


--
-- Data for Name: analisis_vulnerabilidad; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.analisis_vulnerabilidad (id, company_id, plan_emergencia_id, amenaza_tipo, amenaza_descripcion, probabilidad, severidad, nivel_riesgo, personas_exposicion, recursos_exposicion, sistemas_exposicion, medidas_prevencion, medidas_mitigacion, recursos_necesarios, responsable_id, fecha_evaluacion, proxima_revision, estado, observaciones, created_at, updated_at, codigo, fecha_analisis, realizado_por, metodologia, nivel_vulnerabilidad_personas, nivel_vulnerabilidad_recursos, nivel_vulnerabilidad_sistemas, nivel_riesgo_global, conclusiones, recomendaciones) FROM stdin;
\.


--
-- Data for Name: aprobaciones_cambios; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.aprobaciones_cambios (id, company_id, cambio_id, nivel_aprobacion, aprobador, cargo, estado, fecha_aprobacion, comentarios, condiciones, orden, created_at, updated_at) FROM stdin;
3b9457fe-9bf2-4c90-be90-11b767f5059b	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	c2b9b898-545f-4777-874c-ef2774d753bd	coordinador_sst	admin	\N	aprobado	2025-12-23	sdfghjk	\N	1	2025-12-23 11:55:45.938206	2025-12-23 11:55:45.938206
8c1dbcd3-4dee-43e5-a702-49a770e7eea6	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	c2b9b898-545f-4777-874c-ef2774d753bd	alta_direccion	admin	\N	aprobado	2025-12-23		\N	2	2025-12-23 11:56:24.846336	2025-12-23 11:56:24.846336
174cf05a-cabe-4031-9fec-b5fdd778c763	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	c2b9b898-545f-4777-874c-ef2774d753bd	copasst	admin	\N	aprobado	2025-12-23		\N	3	2025-12-23 11:56:39.122864	2025-12-23 11:56:39.122864
\.


--
-- Data for Name: arco_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.arco_requests (id, company_id, request_type, status, worker_id, user_id, requester_name, requester_email, requester_phone, requester_identification, is_representative, data_subject_name, data_subject_identification, representation_proof_url, representative_verified, representative_verified_by, representative_verified_at, request_description, specific_data_requested, justification, assigned_to, assigned_at, previous_assignees, escalated_to, escalated_at, escalation_reason, intake_recorded_by, response_date, response_description, response_provided_by, rejection_reason, partial_completion_details, request_attachments_urls, response_attachments_urls, submitted_at, legal_deadline, reminder_sent_at, completed_at, ip_address, user_agent, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, company_id, user_id, user_role, username, entity_type, entity_id, action, data_subject_id, data_subject_name, old_values, new_values, changed_fields, "timestamp", ip_address, user_agent, request_id, description, source, created_at) FROM stdin;
8a6d8e4b-252c-4d06-a97a-0297e3e6bbec	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	360f5e46-96e8-47a0-9c5b-0bbf1c2cecf1	admin	admin	consent_record	857e52dd-e135-4001-9e8e-639f62691646	create	1d50f465-71c5-48ff-b365-142863ad5f9a	PRUEBA 1	\N	"{\\"id\\":\\"857e52dd-e135-4001-9e8e-639f62691646\\",\\"companyId\\":\\"c6d3c1d1-0418-46a8-a0ee-23c46a4e806a\\",\\"workerId\\":\\"1d50f465-71c5-48ff-b365-142863ad5f9a\\",\\"workerName\\":\\"PRUEBA 1\\",\\"workerEmail\\":\\"ladic2023@ocloud.com\\",\\"workerIdentification\\":\\"1654445567\\",\\"consentType\\":\\"habeas_data_general\\",\\"status\\":\\"otorgado\\",\\"channel\\":\\"web\\",\\"policyVersion\\":\\"1.0\\",\\"policyDocumentUrl\\":\\"/politica-privacidad\\",\\"consentText\\":null,\\"grantedAt\\":\\"2025-12-23T09:48:22.461Z\\",\\"revokedAt\\":null,\\"expiresAt\\":null,\\"purpose\\":\\"Gestión de la relación laboral y administración de personal; Cumplimiento de obligaciones en materia de SST (Sistema de Gestión de Seguridad y Salud en el Trabajo); Comunicaciones empresariales y notificaciones relacionadas con la empresa; Generación de informes y estadísticas internas de SST; Cumplimiento de obligaciones legales y regulatorias aplicables\\",\\"legalBasis\\":\\"consentimiento expreso - Ley 1581/2012\\",\\"revocationReason\\":null,\\"revokedBy\\":null,\\"recordedBy\\":\\"360f5e46-96e8-47a0-9c5b-0bbf1c2cecf1\\",\\"updatedBy\\":null,\\"ipAddress\\":null,\\"userAgent\\":null,\\"evidenceUrl\\":null,\\"notes\\":null,\\"createdAt\\":\\"2025-12-23T09:48:22.461Z\\",\\"updatedAt\\":\\"2025-12-23T09:48:22.461Z\\"}"	\N	2025-12-23 09:48:22.581027	\N	\N	\N	Consentimiento habeas_data_general otorgado por trabajador PRUEBA 1	api	2025-12-23 09:48:22.581027
af812379-1dd5-4f32-a746-c112c2df2efd	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	360f5e46-96e8-47a0-9c5b-0bbf1c2cecf1	admin	admin	worker	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	create	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	Luz Adriana Diaz Calle	\N	{"id":"42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38","companyId":"c6d3c1d1-0418-46a8-a0ee-23c46a4e806a","identificationNumber":"52223631","name":"Luz Adriana Diaz Calle","email":"sg.sst.cumplimiento@gmail.com","position":"Analista de Recursos Humanos","department":"Recursos Humanos","contractType":"indefinido","contractNumber":"CONT-C6D3C1-2025-0001","startDate":"2025-12-12","endDate":null,"status":"activo","epsNombre":null,"arlNombre":null,"afpNombre":null,"ccfNombre":null,"createdAt":"2025-12-11T06:03:58.109Z"}	\N	2025-12-11 06:03:58.419566	10.82.9.8	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36	a876a76c-7d1c-4836-b4df-c0c7cddf85e8	Created worker: Luz Adriana Diaz Calle (52223631)	api	2025-12-11 06:03:58.419566
3378d00c-2a05-41d6-ac38-e1e9d0934d5a	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	360f5e46-96e8-47a0-9c5b-0bbf1c2cecf1	admin	admin	consent_record	5b86c7eb-c701-4b62-a638-c968b4ac8ada	create	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	Luz Adriana Diaz Calle	\N	"{\\"id\\":\\"5b86c7eb-c701-4b62-a638-c968b4ac8ada\\",\\"companyId\\":\\"c6d3c1d1-0418-46a8-a0ee-23c46a4e806a\\",\\"workerId\\":\\"42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38\\",\\"workerName\\":\\"Luz Adriana Diaz Calle\\",\\"workerEmail\\":\\"sg.sst.cumplimiento@gmail.com\\",\\"workerIdentification\\":\\"52223631\\",\\"consentType\\":\\"habeas_data_general\\",\\"status\\":\\"otorgado\\",\\"channel\\":\\"web\\",\\"policyVersion\\":\\"1.0\\",\\"policyDocumentUrl\\":\\"/politica-privacidad\\",\\"consentText\\":null,\\"grantedAt\\":\\"2025-12-11T06:03:58.954Z\\",\\"revokedAt\\":null,\\"expiresAt\\":null,\\"purpose\\":\\"Gestión de la relación laboral y administración de personal; Cumplimiento de obligaciones en materia de SST (Sistema de Gestión de Seguridad y Salud en el Trabajo); Comunicaciones empresariales y notificaciones relacionadas con la empresa; Generación de informes y estadísticas internas de SST; Cumplimiento de obligaciones legales y regulatorias aplicables\\",\\"legalBasis\\":\\"consentimiento expreso - Ley 1581/2012\\",\\"revocationReason\\":null,\\"revokedBy\\":null,\\"recordedBy\\":\\"360f5e46-96e8-47a0-9c5b-0bbf1c2cecf1\\",\\"updatedBy\\":null,\\"ipAddress\\":null,\\"userAgent\\":null,\\"evidenceUrl\\":null,\\"notes\\":null,\\"createdAt\\":\\"2025-12-11T06:03:58.954Z\\",\\"updatedAt\\":\\"2025-12-11T06:03:58.954Z\\"}"	\N	2025-12-11 06:03:59.075827	\N	\N	\N	Consentimiento habeas_data_general otorgado por trabajador Luz Adriana Diaz Calle	api	2025-12-11 06:03:59.075827
b927d602-c935-46a5-a659-5102a704881e	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	360f5e46-96e8-47a0-9c5b-0bbf1c2cecf1	admin	admin	worker	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	update	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	Luz Adriana Diaz Calle	{"id":"42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38","companyId":"c6d3c1d1-0418-46a8-a0ee-23c46a4e806a","identificationNumber":"52223631","name":"Luz Adriana Diaz Calle","email":"sg.sst.cumplimiento@gmail.com","position":"Analista Financiero","department":"Recursos Humanos","contractType":"indefinido","contractNumber":"CONT-C6D3C1-2025-0001","startDate":"2025-12-12","endDate":null,"status":"activo","jobProfileId":null,"epsNombre":null,"arlNombre":null,"afpNombre":null,"ccfNombre":null,"createdAt":"2025-12-11T06:03:58.109Z"}	{"id":"42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38","companyId":"c6d3c1d1-0418-46a8-a0ee-23c46a4e806a","identificationNumber":"52223631","name":"Luz Adriana Diaz Calle","email":"sg.sst.cumplimiento@gmail.com","position":"Analista de Recursos Humanos","department":"Recursos Humanos","contractType":"indefinido","contractNumber":"CONT-C6D3C1-2025-0001","startDate":"2025-12-12","endDate":null,"status":"activo","jobProfileId":"25e671bb-4d49-43c9-8610-bd83ad8cfd4c","epsNombre":null,"arlNombre":null,"afpNombre":null,"ccfNombre":null,"createdAt":"2025-12-11T06:03:58.109Z"}	["position","jobProfileId"]	2025-12-23 09:41:22.038954	10.82.3.59	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36	6e4a4af3-df96-4b4f-9260-ffa28831d6a7	Updated worker: Luz Adriana Diaz Calle (52223631)	api	2025-12-23 09:41:22.038954
ad9f0f0e-1434-4fc7-aa68-033d67cb724d	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	360f5e46-96e8-47a0-9c5b-0bbf1c2cecf1	admin	admin	worker	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	update	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	Luz Adriana Diaz Calle	{"id":"42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38","companyId":"c6d3c1d1-0418-46a8-a0ee-23c46a4e806a","identificationNumber":"52223631","name":"Luz Adriana Diaz Calle","email":"sg.sst.cumplimiento@gmail.com","position":"Analista de Recursos Humanos","department":"Recursos Humanos","contractType":"indefinido","contractNumber":"CONT-C6D3C1-2025-0001","startDate":"2025-12-12","endDate":null,"status":"activo","jobProfileId":"25e671bb-4d49-43c9-8610-bd83ad8cfd4c","epsNombre":null,"arlNombre":null,"afpNombre":null,"ccfNombre":null,"createdAt":"2025-12-11T06:03:58.109Z"}	{"id":"42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38","companyId":"c6d3c1d1-0418-46a8-a0ee-23c46a4e806a","identificationNumber":"52223631","name":"Luz Adriana Diaz Calle","email":"sg.sst.cumplimiento@gmail.com","position":"Analista de Recursos Humanos","department":"Recursos Humanos","contractType":"indefinido","contractNumber":"CONT-C6D3C1-2025-0001","startDate":"2025-12-12","endDate":null,"status":"activo","jobProfileId":"25e671bb-4d49-43c9-8610-bd83ad8cfd4c","epsNombre":null,"arlNombre":null,"afpNombre":null,"ccfNombre":null,"createdAt":"2025-12-11T06:03:58.109Z"}	\N	2025-12-23 09:45:43.478423	10.82.6.215	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36	5e4b08ce-a2ad-419a-91b1-af2a3ad5c6e0	Updated worker: Luz Adriana Diaz Calle (52223631)	api	2025-12-23 09:45:43.478423
e7a458b0-1d9e-45c2-880e-3ef6090d8905	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	360f5e46-96e8-47a0-9c5b-0bbf1c2cecf1	admin	admin	worker	1d50f465-71c5-48ff-b365-142863ad5f9a	create	1d50f465-71c5-48ff-b365-142863ad5f9a	PRUEBA 1	\N	{"id":"1d50f465-71c5-48ff-b365-142863ad5f9a","companyId":"c6d3c1d1-0418-46a8-a0ee-23c46a4e806a","identificationNumber":"1654445567","name":"PRUEBA 1","email":"ladic2023@ocloud.com","position":"Almacenista","department":"Logística","contractType":"indefinido","contractNumber":"CONT-C6D3C1-2025-0002","startDate":"2025-12-23","endDate":null,"status":"activo","jobProfileId":"a288b46a-94f1-478c-b2ec-eb6d6d5c87e9","epsNombre":null,"arlNombre":null,"afpNombre":null,"ccfNombre":null,"createdAt":"2025-12-23T09:48:21.506Z"}	\N	2025-12-23 09:48:21.814769	10.82.6.215	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36	183149e0-5ee9-442d-8cdc-a6a4d6c87605	Created worker: PRUEBA 1 (1654445567)	api	2025-12-23 09:48:21.814769
\.


--
-- Data for Name: auditoria_auditores; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.auditoria_auditores (id, auditoria_id, auditor_id, nombre_externo, email_externo, organizacion_externa, rol, areas_asignadas, created_at) FROM stdin;
\.


--
-- Data for Name: auditoria_checklists; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.auditoria_checklists (id, auditoria_id, numero_item, criterio_auditoria, clausula_referencia, area_proceso_auditado, cumple, evidencias_obtenidas, observaciones, archivo_evidencia, evaluado_por, evaluado_por_id, fecha_evaluacion, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: auditorias_internas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.auditorias_internas (id, company_id, codigo, titulo, tipo, norma_referencia, objetivo, alcance, fecha_programada, fecha_inicio, fecha_fin, duracion_estimada_horas, auditorista_lider, auditorista_lider_id, responsable_auditado, responsable_auditado_id, estado, numero_hallazgos, numero_conformidades, numero_no_conformidades_menores, numero_no_conformidades_mayores, numero_observaciones, porcentaje_cumplimiento, conclusiones, recomendaciones, fecha_informe, archivo_informe, aprobado_por, aprobado_por_id, fecha_aprobacion, observaciones_cierre, created_at, updated_at, planificada_con_copasst, copasst_acta_id, observaciones_copasst, fecha_aprobacion_copasst) FROM stdin;
\.


--
-- Data for Name: automatizacion_cambio_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.automatizacion_cambio_logs (id, company_id, cambio_id, modulo_destino, registro_destino_id, estado, mensaje, created_at) FROM stdin;
8d8dead0-e4b7-452f-a273-049bd4fad63b	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	c2b9b898-545f-4777-874c-ef2774d753bd	matriz_riesgos	981ec0b5-b7c1-46a4-b303-0fcde93200e6	exito	Se crearon 1 registros de seguimiento de matriz de riesgos	2025-12-23 11:56:40.123908
26598988-7d98-4540-995f-4179b38f0c76	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	c2b9b898-545f-4777-874c-ef2774d753bd	plan_trabajo	\N	error	No se encontró plan de trabajo activo para el año actual	2025-12-23 11:56:40.246109
290b76e2-58e3-4d51-9115-2d3aae7e2a92	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	c2b9b898-545f-4777-874c-ef2774d753bd	capacitaciones	02ea11fb-ac07-4913-b16c-132eea86e618	exito	Se programaron 1 capacitaciones	2025-12-23 11:56:40.432148
f575d341-c8c4-412c-9210-d6bc1d2cd2bd	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	c2b9b898-545f-4777-874c-ef2774d753bd	copasst	\N	error	null value in column "notas" of relation "copasst_actas" violates not-null constraint	2025-12-23 11:56:40.912568
8022433f-2c7c-4f30-b16f-0fd40d7737d2	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	c2b9b898-545f-4777-874c-ef2774d753bd	matriz_legal	\N	exito	Se identificó que el cambio "Cambio Funcional 62-H80" puede afectar cumplimiento legal. Se recomienda revisar la matriz legal.	2025-12-23 11:56:41.152459
b99cb073-8679-4c0e-ad99-88ee751ffe1d	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	c2b9b898-545f-4777-874c-ef2774d753bd	indicadores	1c94bfe6-61d0-48f7-a51c-0e28b9297881	exito	Se crearon 1 indicadores de seguimiento	2025-12-23 11:56:41.272436
f012b274-0739-466b-802e-3cc7f64281b5	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	c2b9b898-545f-4777-874c-ef2774d753bd	notificaciones	\N	exito	Notificaciones programadas para: Luz Adriana Diaz Calle, coordinador_sst_demo, admin	2025-12-23 11:56:41.446182
\.


--
-- Data for Name: brigadas_emergencia; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.brigadas_emergencia (id, company_id, plan_emergencia_id, nombre, tipo, descripcion, objetivos, responsable_id, fecha_conformacion, estado, capacidad_personas, ubicacion_base, turno, equipos_asignados, observaciones, created_at, updated_at, funciones_antes, funciones_durante, funciones_despues, equipamiento_asignado, activa) FROM stdin;
\.


--
-- Data for Name: cambios_sst; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cambios_sst (id, company_id, codigo, titulo, descripcion, tipo, categoria, area_afectada, proceso_afectado, numero_trabajadores_afectados, justificacion, objetivos, fecha_propuesta, fecha_implementacion_planificada, fecha_implementacion_real, solicitante, responsable_implementacion, estado, nivel_impacto, requiere_actualizacion_matriz_riesgos, requiere_actualizacion_plan_trabajo, requiere_capacitacion, requiere_aprobacion_copasst, observaciones, lecciones_aprendidas, created_at, updated_at) FROM stdin;
696169a7-b8b2-49f4-9dbb-9364028d1ff4	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	CAM-2025-001	Sistema General de Riesgos Laborales	REQUISITOS SST PARA CAMBIO EN EQUIPOS (Art. 2.2.4.6.26 Decreto 1072/2015):\n\n• Evaluación de riesgos del nuevo equipo o tecnología\n• Verificación de certificaciones y fichas técnicas de seguridad\n• Capacitación específica a operadores y personal de mantenimiento\n• Definición de procedimientos de operación segura\n• Actualización del programa de mantenimiento preventivo\n• Señalización y demarcación según aplique\n• Verificación de EPP requeridos para el nuevo equipo\n• Registro en inventario de activos críticos SST	interno	equipo	Produccion	Ensamble de productos	1			2025-12-20	2025-12-22	\N	Luz Adriana Diaz Calle	Luz Adriana Diaz Calle	propuesto	\N	1	1	1	1		\N	2025-12-20 13:04:09.406296	2025-12-20 13:04:09.406296
c2b9b898-545f-4777-874c-ef2774d753bd	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	CAM-2025-002	Cambio Funcional 62-H80	REQUISITOS SST PARA CAMBIO ORGANIZACIONAL (Art. 2.2.4.6.26 Decreto 1072/2015):\n\n• Evaluación de impacto en responsabilidades SST\n• Actualización de matriz de responsabilidades SST\n• Inducción y reinducción en SST para personal afectado\n• Revisión de perfiles de cargo con componente SST\n• Actualización de matriz de capacitación\n• Verificación de competencias SST requeridas\n• Actualización del organigrama y roles SST\n• Comunicación de cambios al COPASST	interno	personal	Testing	Ensamble de productos	2	sdefgvbhjn	sdfghjk	2025-12-23	2025-12-22	\N	PRUEBA 1	Luz Adriana Diaz Calle	aprobado	alto	1	1	1	1	sdfvgbhnjmk,	\N	2025-12-23 11:54:31.03699	2025-12-23 11:56:39.826563
\.


--
-- Data for Name: capacitacion_asistentes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.capacitacion_asistentes (id, evento_id, worker_id, company_id, estado, horas_asistidas, calificacion, certificado_url, observaciones, fecha_confirmacion, fecha_asistencia, created_at) FROM stdin;
\.


--
-- Data for Name: capacitacion_eventos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.capacitacion_eventos (id, company_id, catalogo_id, codigo_curso, titulo_curso, descripcion_curso, duracion_horas, categoria, nivel, obligatoria, normativa, fecha_inicio, fecha_fin, hora_inicio, hora_fin, lugar, instructor, estado, observaciones, archivo_url, archivo_nombre, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: capacitaciones_cambios; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.capacitaciones_cambios (id, company_id, cambio_id, training_id, tema_capacitacion, objetivos, duracion_horas, trabajadores_objetivo, numero_trabajadores, fecha_programada, fecha_realizada, instructor, completada, porcentaje_asistencia, observaciones, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: capacitaciones_catalogo; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.capacitaciones_catalogo (id, codigo, titulo, descripcion, duracion_horas, validez_meses, categoria, nivel, obligatoria, normativa, activo, created_at) FROM stdin;
cf8736b1-5dc7-468c-9251-e22b4c17d4a0	CAP-SEG-01	Inducción y Reinducción en SST	Capacitación de inducción para nuevos trabajadores y reinducción anual para personal existente sobre el Sistema de Gestión de Seguridad y Salud en el Trabajo de la empresa.	4	12	normatividad	basico	t	Resolución 0312/2019 - Art. 18	t	2025-11-26 07:59:46.920593
e455bd55-0614-41e5-8eb3-91c0d7e1ffdd	CAP-SEG-02	Trabajo en Alturas - Nivel Básico	Capacitación obligatoria para trabajadores que realizan labores en alturas con riesgos de caída mayores a 1.50 metros. Incluye medidas de prevención, protección contra caídas, selección y uso de equipos.	8	24	seguridad	basico	t	Resolución 1409/2012 - Trabajo en Alturas	t	2025-11-26 07:59:46.920593
826e8ac7-7bf9-41b8-af4f-693cb7222329	CAP-SEG-03	Trabajo en Alturas - Nivel Avanzado	Capacitación avanzada para supervisores de trabajo en alturas, rescatistas y coordinadores. Incluye evaluación de riesgos, supervisión de trabajos, técnicas de rescate y procedimientos de emergencia.	40	24	seguridad	avanzado	f	Resolución 1409/2012 - Trabajo en Alturas	t	2025-11-26 07:59:46.920593
5e6a571e-2702-45d0-9361-1a7f39a5047e	CAP-SEG-04	Uso y Mantenimiento de Elementos de Protección Personal (EPP)	Capacitación sobre selección, uso correcto, mantenimiento y almacenamiento de EPP. Incluye cascos, gafas, guantes, protección auditiva, respiratoria y equipos de protección contra caídas.	2	12	seguridad	basico	t	Resolución 2400/1979 - Art. 176-177	t	2025-11-26 07:59:46.920593
58cc68f9-c6fb-4b26-808d-716c4ab21909	CAP-SEG-05	Prevención y Control de Incendios	Capacitación en prevención de incendios, uso de extintores portátiles, clases de fuego, plan de evacuación y actuación en caso de conato de incendio.	4	12	emergencias	basico	t	NSR-10 Título J	t	2025-11-26 07:59:46.920593
62d36682-1a97-4858-b2a0-dd7876de8bcf	CAP-SEG-06	Brigada de Emergencias - Nivel Básico	Formación de brigadistas en primeros auxilios, evacuación, prevención y control de incendios, y comunicaciones de emergencia. Incluye práctica y simulacros.	16	12	emergencias	intermedio	f	Resolución 2400/1979	t	2025-11-26 07:59:46.920593
eb80c37e-caf8-4abb-b364-9deb0b0fcb52	CAP-SAL-01	Primeros Auxilios Básicos	Capacitación en atención inicial de emergencias médicas: RCP, atención de hemorragias, fracturas, quemaduras, desmayos, shock y traslado de lesionados.	8	12	emergencias	basico	t	Resolución 0705/2007	t	2025-11-26 07:59:46.920593
ef0d2d55-e2ce-41ec-84be-da3308500db9	CAP-SAL-02	Prevención de Riesgos Ergonómicos	Capacitación en identificación y control de riesgos ergonómicos, pausas activas, higiene postural, manipulación manual de cargas y acondicionamiento del puesto de trabajo.	4	12	salud	basico	t	Resolución 2400/1979 - Capítulo V	t	2025-11-26 07:59:46.920593
e3146bd2-7110-4c15-b94e-d67b8b15405c	CAP-SAL-03	Prevención de Riesgos Psicosociales	Capacitación en identificación de factores de riesgo psicosocial, prevención del estrés laboral, manejo de conflictos y promoción de la salud mental en el trabajo.	4	12	salud	basico	t	Resolución 2646/2008	t	2025-11-26 07:59:46.920593
45c37605-5eae-402a-a04b-42b06d61d31a	CAP-SAL-04	Prevención del Consumo de Alcohol y Sustancias Psicoactivas	Capacitación sobre efectos del consumo de alcohol, tabaco y sustancias psicoactivas en el ambiente laboral, estrategias de prevención y apoyo al trabajador.	2	12	salud	basico	f	Ley 1566/2012	t	2025-11-26 07:59:46.920593
584638fc-2091-4d0e-b136-b298297d5904	CAP-SEG-07	Seguridad Eléctrica	Capacitación sobre riesgos eléctricos, protección contra contactos directos e indirectos, procedimientos de trabajo seguro con energía eléctrica, bloqueo y etiquetado.	8	12	seguridad	intermedio	f	Resolución 5018/2019 - RETIE	t	2025-11-26 07:59:46.920593
d77b2359-b077-40b1-bf5d-6090be0f1527	CAP-SEG-08	Manejo Seguro de Sustancias Químicas	Capacitación en identificación de sustancias peligrosas, interpretación de fichas de seguridad (SDS), Sistema Globalmente Armonizado (SGA), uso de EPP químico y respuesta a derrames.	6	12	seguridad	intermedio	f	Decreto 1496/2018 - SGA	t	2025-11-26 07:59:46.920593
467bff6e-b95e-42dd-a621-b1c4067ab0a2	CAP-SEG-09	Espacios Confinados	Capacitación sobre identificación de espacios confinados, evaluación de atmósferas peligrosas, procedimientos de entrada segura, uso de equipos de ventilación y rescate.	8	12	seguridad	avanzado	f	Resolución 2400/1979 - Art. 191-193	t	2025-11-26 07:59:46.920593
ff8bb4fc-8843-4dbf-b129-2c4c75f815fd	CAP-SEG-10	Seguridad Vial y Conducción Defensiva	Capacitación en normatividad vial colombiana, técnicas de conducción defensiva, gestión del riesgo vial, prevención de accidentes de tránsito y responsabilidad del conductor.	4	12	seguridad	basico	f	Resolución 1565/2014 - PESV	t	2025-11-26 07:59:46.920593
ca057428-c82f-49aa-8196-e86f2b9c5406	CAP-SEG-11	Máquinas y Herramientas	Capacitación sobre uso seguro de maquinaria industrial, herramientas manuales y eléctricas, protecciones mecánicas, mantenimiento preventivo y procedimientos de trabajo seguro.	4	12	seguridad	intermedio	f	Resolución 2400/1979 - Título IV	t	2025-11-26 07:59:46.920593
951f468a-b038-4ae7-b867-ce3f8bfdc529	CAP-NOR-01	Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST)	Capacitación sobre el Sistema de Gestión de SST según Decreto 1072/2015, ciclo PHVA, estándares mínimos Resolución 0312/2019, roles y responsabilidades.	6	12	normatividad	intermedio	t	Decreto 1072/2015 - Libro 2, Parte 2, Título 4, Capítulo 6	t	2025-11-26 07:59:46.920593
6206cf2a-8b57-44be-bbc2-f63197d7e218	CAP-NOR-02	Investigación de Accidentes e Incidentes de Trabajo	Capacitación en metodología de investigación de accidentes e incidentes, identificación de causas básicas e inmediatas, análisis de árbol de causas, reporte y medidas correctivas.	8	12	normatividad	intermedio	t	Resolución 1401/2007	t	2025-11-26 07:59:46.920593
9a108a53-e548-45bd-ad0e-20507a7de4b4	CAP-NOR-03	COPASST - Comité Paritario de Seguridad y Salud en el Trabajo	Capacitación para miembros del COPASST sobre funciones, obligaciones, investigación de incidentes, inspecciones de seguridad y participación en el SG-SST.	50	24	normatividad	avanzado	t	Resolución 2013/1986 - Decreto 1072/2015	t	2025-11-26 07:59:46.920593
0454e242-57e7-44a0-bf48-64697306a021	CAP-NOR-04	Comité de Convivencia Laboral	Capacitación para integrantes del Comité de Convivencia sobre prevención y manejo del acoso laboral, procedimientos de atención de quejas y resolución de conflictos.	20	24	normatividad	intermedio	t	Resolución 652/2012 - Ley 1010/2006	t	2025-11-26 07:59:46.920593
053d1f14-3ce6-4ff6-9682-3335d18a4702	CAP-ESP-01	Curso de 50 Horas en SST (Decreto 1443)	Capacitación de 50 horas para personal del SG-SST sobre implementación, mantenimiento y mejora continua del sistema según normativa colombiana vigente.	50	\N	especializadas	avanzado	f	Decreto 1072/2015 - Art. 2.2.4.6.11	t	2025-11-26 07:59:46.920593
\.


--
-- Data for Name: comite_convivencia_actas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.comite_convivencia_actas (id, company_id, numero_acta, fecha, notas, trabajador1_worker_id, trabajador1_nombre, trabajador1_cedula, trabajador1_tipo, trabajador2_worker_id, trabajador2_nombre, trabajador2_cedula, trabajador2_tipo, trabajador3_worker_id, trabajador3_nombre, trabajador3_cedula, trabajador3_tipo, empleador1_worker_id, empleador1_nombre, empleador1_cedula, empleador1_tipo, empleador2_worker_id, empleador2_nombre, empleador2_cedula, empleador2_tipo, empleador3_worker_id, empleador3_nombre, empleador3_cedula, empleador3_tipo, created_at) FROM stdin;
cb044823-7b13-4437-b746-a477db40dd16	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	001-2025	2025-12-11		42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	Luz Adriana Diaz Calle	52223631	Titular	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	Luz Adriana Diaz Calle	52223631	Suplente	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	Luz Adriana Diaz Calle	52223631	Suplente	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	Luz Adriana Diaz Calle	52223631	Suplente	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	Luz Adriana Diaz Calle	52223631	Titular	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	Luz Adriana Diaz Calle	52223631	Suplente	2025-12-11 16:45:28.793749
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.companies (id, name, nit, address, contact_phone, contact_email, number_of_workers, risk_level, calculated_chapter, created_at, logo_url, arl_nombre_empresa, ccf_nombre_empresa, eps_nombre_empresa, afp_nombre_empresa, city, legal_rep_signature_url, legal_rep_name, legal_rep_id, legal_rep_position, ciiu_code) FROM stdin;
c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	DEMO-PRUEBA	900000000-0	Calle 100 # 10-50	3001234567	demo@sstcolombia.com	250	I	3	2025-12-10 17:43:49.403534	/objects/uploads/logos/bbeeb684-3760-4273-96e4-6dab1e65f209.jpeg	Sura	\N	EPS Sura	\N	Bogotá	\N				
76050645-7d63-46af-953b-bc86727b596f	Empresa PHVA Demo	900123456-1	Carrera 15 #100-50, Bogotá D.C.	3001234567	contacto@empresaphva.com	50	III	2	2025-12-02 14:42:05.691921	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
abc0795d-73cd-4294-9bd5-7ba2872c203a	Empresa Prueba SST	900123456-7	Calle 123 #45-67, Bogotá	3001234567	prueba@empresasst.com	5	I	1	2025-12-03 16:56:46.254552	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
fe08737b-d9ba-4bba-8477-4734d59a093e	Mi Empresa Trial 1764781057	900176478	Calle 45 #12-34, Medellín	3109876543	contacto_1764781057@empresa.com	8	II	1	2025-12-03 16:57:38.812194	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
d3296e1d-415e-4223-a6a3-68740b517685	Empresa Flow Test 1764839505	9012342612341-7	Calle Test 123	3001234567	flow_1764839505@test.com	25	II	2	2025-12-04 09:11:46.829859	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: componentes_sst; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.componentes_sst (id, numero, nombre, descripcion, peso_total, orden) FROM stdin;
comp-sst-1	1	Recursos	Recursos financieros, técnicos, humanos y de otra índole requeridos para coordinar y desarrollar el Sistema de Gestión de la Seguridad y Salud en el Trabajo (SG-SST)	10	1
comp-sst-2	2	Gestión Integral del Sistema de Gestión de la Seguridad y Salud en el Trabajo	Política, objetivos, evaluación inicial, plan de trabajo anual y conservación de documentos	15	2
comp-sst-3	3	Gestión de la Salud	Condiciones de salud en el trabajo, registro y reporte de condiciones de trabajo y de salud, mecanismos de vigilancia de las condiciones de salud de los trabajadores	20	3
comp-sst-4	4	Gestión de Peligros y Riesgos	Identificación de peligros, evaluación y valoración de riesgos, medidas de prevención y control	30	4
comp-sst-5	5	Gestión de Amenazas	Plan de prevención, preparación y respuesta ante emergencias	10	5
comp-sst-6	6	Verificación del SG-SST	Gestión y resultados del SG-SST (auditoría y revisión por la alta dirección)	5	6
comp-sst-7	7	Mejoramiento	Acciones preventivas y correctivas con base en los resultados del SG-SST	10	7
\.


--
-- Data for Name: comunicaciones_sst; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.comunicaciones_sst (id, company_id, tipo, asunto, contenido, publico_objetivo, departamento_especifico, medios_utilizados, archivos_adjuntos, fecha_envio, enviado_por, requiere_confirmacion_lectura, total_destinatarios, total_lecturas, fecha_vigencia_inicio, fecha_vigencia_fin, relacionado_con, relacionado_id, observaciones, created_at) FROM stdin;
01cf399a-4ede-4134-8095-8931aba02e80	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	informativo	Escalera Dañada	Hemos hecho la inspección y hemos atendido a su sugerencia el chico Jukiro se apropiara  personalmente de arreglar la escalera, ya que con una exhaustiva investigación decidimos que el es el apropiado para este trabajo, agradecemos enormemente su colaboración.	trabajadores		\N	\N	2025-12-19 07:39:26.112882	360f5e46-96e8-47a0-9c5b-0bbf1c2cecf1	1	1	0	\N	\N	\N	\N		2025-12-19 07:39:26.112882
\.


--
-- Data for Name: consent_records; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.consent_records (id, company_id, worker_id, worker_name, worker_email, worker_identification, consent_type, status, channel, policy_version, policy_document_url, consent_text, granted_at, revoked_at, expires_at, purpose, legal_basis, revocation_reason, revoked_by, recorded_by, updated_by, ip_address, user_agent, evidence_url, notes, created_at, updated_at) FROM stdin;
5b86c7eb-c701-4b62-a638-c968b4ac8ada	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	Luz Adriana Diaz Calle	sg.sst.cumplimiento@gmail.com	52223631	habeas_data_general	otorgado	web	1.0	/politica-privacidad	\N	2025-12-11 06:03:58.954603	\N	\N	Gestión de la relación laboral y administración de personal; Cumplimiento de obligaciones en materia de SST (Sistema de Gestión de Seguridad y Salud en el Trabajo); Comunicaciones empresariales y notificaciones relacionadas con la empresa; Generación de informes y estadísticas internas de SST; Cumplimiento de obligaciones legales y regulatorias aplicables	consentimiento expreso - Ley 1581/2012	\N	\N	360f5e46-96e8-47a0-9c5b-0bbf1c2cecf1	\N	\N	\N	\N	\N	2025-12-11 06:03:58.954603	2025-12-11 06:03:58.954603
857e52dd-e135-4001-9e8e-639f62691646	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	1d50f465-71c5-48ff-b365-142863ad5f9a	PRUEBA 1	ladic2023@ocloud.com	1654445567	habeas_data_general	otorgado	web	1.0	/politica-privacidad	\N	2025-12-23 09:48:22.461069	\N	\N	Gestión de la relación laboral y administración de personal; Cumplimiento de obligaciones en materia de SST (Sistema de Gestión de Seguridad y Salud en el Trabajo); Comunicaciones empresariales y notificaciones relacionadas con la empresa; Generación de informes y estadísticas internas de SST; Cumplimiento de obligaciones legales y regulatorias aplicables	consentimiento expreso - Ley 1581/2012	\N	\N	360f5e46-96e8-47a0-9c5b-0bbf1c2cecf1	\N	\N	\N	\N	\N	2025-12-23 09:48:22.461069	2025-12-23 09:48:22.461069
\.


--
-- Data for Name: contenidos_induccion; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contenidos_induccion (id, company_id, titulo, descripcion, tipo_contenido, url_video, url_documento, contenido_texto, duracion_minutos, orden, estado, obligatorio, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: contracts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contracts (id, company_id, worker_id, job_profile_id, contract_type_v2, contract_number, start_date, end_date, salary, "position", department, work_schedule, arl_rate, additional_clauses, contract_status_v2, termination_date, termination_reason, created_at, identification_number) FROM stdin;
cd26f137-80c9-4c57-b7eb-6e48bbd0485c	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	\N	indefinido	CONT-C6D3C1-2025-0001	2025-12-12	\N	0	Analista de Recursos Humanos	Recursos Humanos	\N	\N	\N	activo	\N	\N	2025-12-11 06:03:58.55442	\N
fd39ab18-7913-4d2f-8475-c867c46cf982	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	1d50f465-71c5-48ff-b365-142863ad5f9a	\N	indefinido	CONT-C6D3C1-2025-0002	2025-12-23	\N	0	Almacenista	Logística	\N	\N	\N	activo	\N	\N	2025-12-23 09:48:21.935535	\N
\.


--
-- Data for Name: controles_cambios; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.controles_cambios (id, company_id, cambio_id, evaluacion_id, descripcion_control, tipo_control, responsable, fecha_limite, fecha_implementacion, estado, costo_estimado, costo_real, fecha_verificacion, verificado_por, efectivo, observaciones, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: convivencia_actas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.convivencia_actas (id, company_id, eleccion_id, tipo, numero, fecha, asunto, contenido, asistentes, acuerdos, observaciones, firmas, documento_url, created_at) FROM stdin;
\.


--
-- Data for Name: convivencia_candidatos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.convivencia_candidatos (id, eleccion_id, worker_id, propuesta_laboral, fecha_inscripcion, estado, votos_recibidos, orden_eleccion, created_at) FROM stdin;
\.


--
-- Data for Name: convivencia_elecciones; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.convivencia_elecciones (id, company_id, periodo_id, fecha_convocatoria, fecha_inicio_inscripcion, fecha_fin_inscripcion, fecha_votacion, hora_inicio_votacion, hora_fin_votacion, modalidad_votacion, estado, principales_requeridos, suplentes_requeridos, total_votantes, votos_validos, votos_nulos, votos_en_blanco, convocatoria_url, acta_escrutinio_url, observaciones, created_at, publicado_en_portal) FROM stdin;
f025f55d-d465-4721-bad6-054b99d753c8	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	\N	2025-12-20	2025-12-20	2025-12-22	2025-12-24	08:00	16:00	virtual	completada	2	2	\N	\N	\N	\N	\N	\N	\N	2025-12-20 10:09:10.25564	f
da3ee983-d4bc-4744-9dfc-1fb694901f00	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	\N	2025-12-20	2025-12-20	2025-12-22	2025-12-25	09:00	16:00	virtual	inscripcion	2	2	\N	\N	\N	\N	\N	\N	\N	2025-12-20 10:14:25.062949	t
\.


--
-- Data for Name: convivencia_miembros; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.convivencia_miembros (id, periodo_id, worker_id, representacion, cargo, fecha_designacion, estado, votos_obtenidos, created_at) FROM stdin;
\.


--
-- Data for Name: convivencia_periodos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.convivencia_periodos (id, company_id, fecha_inicio, fecha_fin, estado, observaciones, acta_constitucion_url, created_at) FROM stdin;
1cd42b7f-67cd-46b5-a1e7-c49438134046	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	2025-12-20	2027-12-20	activo	\N	\N	2025-12-20 10:07:40.69596
\.


--
-- Data for Name: convivencia_registro_votacion; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.convivencia_registro_votacion (id, eleccion_id, worker_id, fecha_hora_voto, ip_address) FROM stdin;
\.


--
-- Data for Name: convivencia_votos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.convivencia_votos (id, eleccion_id, candidato_id, created_at) FROM stdin;
\.


--
-- Data for Name: copasst_actas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.copasst_actas (id, company_id, fecha, numero_acta, notas, presidente, secretaria, created_at, presidente_worker_id, secretaria_worker_id, archivo_adjunto_url, archivo_adjunto_nombre) FROM stdin;
9ce6d733-794f-4bc4-a0fb-e30b4a9f8d26	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	2025-12-18	001-2025	SZDXFGVHJNKM,LSZMK,	\N	\N	2025-12-18 10:54:39.239214	\N	\N	/uploads/copasst-actas/acta-copasst-1766055279834-719996504.pdf	informe_completo_Luz_Adriana_Diaz_Calle.pdf
\.


--
-- Data for Name: copasst_banco_preguntas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.copasst_banco_preguntas (id, company_id, categoria_id, enunciado_html, tipo_pregunta, opciones, respuesta_correcta, explicacion_html, dificultad, etiquetas, puntos, activo, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: copasst_candidatos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.copasst_candidatos (id, eleccion_id, worker_id, fecha_inscripcion, propuestas, acepta_candidatura, estado, votos_obtenidos, orden_eleccion, created_at) FROM stdin;
\.


--
-- Data for Name: copasst_certificados; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.copasst_certificados (id, company_id, user_id, curso_id, codigo_certificado, nombre_completo, identificacion, titulo_curso, duracion_horas, puntaje_obtenido, puntaje_maximo, fecha_emision, fecha_vencimiento, activo, codigo_qr, created_at) FROM stdin;
\.


--
-- Data for Name: copasst_competencias; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.copasst_competencias (id, company_id, nombre, descripcion, dimension, activo, created_at) FROM stdin;
\.


--
-- Data for Name: copasst_curso_asignaciones; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.copasst_curso_asignaciones (id, company_id, curso_id, user_id, asignado_por, fecha_asignacion, fecha_limite, notificar_dias_antes, estado, fecha_completado, created_at) FROM stdin;
\.


--
-- Data for Name: copasst_curso_categorias; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.copasst_curso_categorias (id, company_id, nombre, descripcion, orden, activo, created_at) FROM stdin;
\.


--
-- Data for Name: copasst_cursos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.copasst_cursos (id, codigo, titulo, descripcion, imagen_url, duracion_minutos, orden_curso, es_obligatorio, prerequisito_curso_id, puntos_completar, activo, created_at) FROM stdin;
5c1480a0-3a20-4c2d-9784-d8e1e32f3b98	COPASST-001	Funciones del COPASST	Conozca las responsabilidades y funciones del Comité Paritario de Seguridad y Salud en el Trabajo según la Resolución 2013/1986. Este curso le enseñará cómo participar activamente en la gestión de la seguridad laboral.	\N	15	1	t	\N	100	t	2025-12-10 08:28:36.540892
cbab735a-385e-4418-bdae-77d146d81f98	COPASST-002	Investigación de Accidentes	Aprenda la metodología de los 5 porqués y el diligenciamiento del FURAT para investigar accidentes e incidentes de trabajo. Identifique causas raíz y proponga acciones correctivas efectivas.	\N	20	2	t	\N	120	t	2025-12-10 08:28:36.540892
16987a7d-d8a2-4de9-9805-181838a51d69	COPASST-003	Inspecciones de Seguridad	Domine las técnicas de inspección de seguridad en el lugar de trabajo. Aprenda a identificar condiciones y actos inseguros, documentar hallazgos y hacer seguimiento a las acciones correctivas.	\N	20	3	t	\N	120	t	2025-12-10 08:28:36.540892
0db339c6-a30b-45c8-b989-ae205bc9387d	COPASST-004	Matriz IPEVR (GTC-45)	Comprenda la metodología GTC-45 para identificar peligros y valorar riesgos ocupacionales. Aprenda a priorizar intervenciones y participar en la actualización de la matriz de riesgos.	\N	25	4	t	\N	150	t	2025-12-10 08:28:36.540892
e033934e-dd64-4886-96fb-477f7cc35e3e	COPASST-005	Gestión de Emergencias	Conozca los elementos fundamentales del plan de emergencias empresarial. Aprenda sobre brigadas de emergencia, planes de evacuación y simulacros para proteger a todos los trabajadores.	\N	20	5	t	\N	120	t	2025-12-10 08:28:36.540892
a3480118-5fd7-4558-b75c-fe9904b1069f	COPASST-006	Marco Legal SST	Comprenda el Decreto 1072/2015, la Resolución 0312/2019 y demás normativa colombiana de SST. Identifique las responsabilidades legales del empleador y los trabajadores.	\N	15	6	t	\N	100	t	2025-12-10 08:28:36.540892
\.


--
-- Data for Name: copasst_elecciones; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.copasst_elecciones (id, company_id, periodo_id, fecha_convocatoria, fecha_inicio_inscripcion, fecha_fin_inscripcion, fecha_votacion, hora_inicio_votacion, hora_fin_votacion, estado, total_trabajadores, principales_requeridos, suplentes_requeridos, total_votantes, votos_validos, votos_nulos, votos_en_blanco, convocatoria_url, acta_escrutinio_url, observaciones, created_at) FROM stdin;
0c54705b-4a56-4430-8f4f-261057300a72	76050645-7d63-46af-953b-bc86727b596f	\N	2025-12-10	2025-12-10	2025-12-12	2025-12-27	08:00	16:00	convocatoria	5	1	0	\N	\N	\N	\N	\N	\N	\N	2025-12-10 17:39:14.390097
890af00d-c411-4af2-a455-bc1301c07296	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	\N	2025-12-10	2025-12-10	2025-12-17	2025-12-24	09:00	17:00	completada	1	1	0	\N	\N	\N	\N	\N	\N	\N	2025-12-10 18:10:10.4867
8c7afadc-6b42-45e8-af22-faee15bc888c	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	\N	2025-12-18	2025-12-20	2025-12-23	2025-12-30	08:00	16:00	inscripcion	1	1	0	\N	\N	\N	\N	\N	\N	\N	2025-12-18 21:54:12.900165
\.


--
-- Data for Name: copasst_escenario_nodos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.copasst_escenario_nodos (id, escenario_id, tipo, titulo, contenido_html, imagen_url, orden, opciones, es_correcta, puntos_nodo, created_at) FROM stdin;
nodo-001	esc-invest-001	inicio	Notificación del Accidente	<h3>Situación Inicial</h3>\n<p>Son las 10:30 AM. Recibes una llamada urgente: <strong>Juan Pérez</strong>, operario de mantenimiento, ha caído desde un andamio de 3 metros de altura mientras realizaba trabajos de pintura en la fachada.</p>\n<p><strong>Estado del trabajador:</strong> Consciente, con dolor en pierna izquierda. Ya fue trasladado al centro médico.</p>\n<p><strong>Tu primera acción como miembro del COPASST debe ser:</strong></p>	\N	1	[{"texto": "Ir inmediatamente al lugar del accidente para preservar la escena", "puntos": 20, "feedback": "¡Correcto! Preservar la escena es fundamental para la investigación.", "siguienteNodoId": "nodo-002"}, {"texto": "Llamar primero al jefe de área para informarle", "puntos": 10, "feedback": "Informar es importante, pero la prioridad es preservar evidencias.", "siguienteNodoId": "nodo-002b"}, {"texto": "Esperar a que termine la jornada para investigar", "puntos": 0, "feedback": "Incorrecto. La investigación debe iniciarse inmediatamente.", "siguienteNodoId": "nodo-002c"}]	t	20	2025-12-10 09:51:20.365524
nodo-002	esc-invest-001	decision	En el Lugar del Accidente	<h3>Inspección de la Escena</h3>\n<p>Llegas al lugar y encuentras:</p>\n<ul>\n<li>El andamio sigue en posición, pero se observa que una de las tablas está rota</li>\n<li>Hay herramientas dispersas en el piso</li>\n<li>El arnés de seguridad está en el piso, aparentemente sin usar</li>\n<li>Dos compañeros de trabajo están presentes</li>\n</ul>\n<p><strong>¿Qué haces primero?</strong></p>	\N	2	[{"texto": "Tomar fotografías y acordonar el área antes de tocar nada", "puntos": 20, "feedback": "¡Excelente! Documentar antes de modificar la escena es la práctica correcta.", "siguienteNodoId": "nodo-003"}, {"texto": "Recoger el arnés para examinarlo", "puntos": 5, "feedback": "Manipular evidencia antes de documentar puede comprometer la investigación.", "siguienteNodoId": "nodo-003b"}, {"texto": "Interrogar inmediatamente a los testigos", "puntos": 10, "feedback": "Las entrevistas son importantes pero primero se debe documentar la escena.", "siguienteNodoId": "nodo-003b"}]	t	20	2025-12-10 09:51:20.365524
nodo-002b	esc-invest-001	decision	Después de Informar	<h3>Llegada Tardía</h3>\n<p>Después de informar a los supervisores, llegas al lugar 30 minutos después. El área ya fue parcialmente limpiada por el personal.</p>\n<p>Aún puedes observar el andamio y algunos elementos, pero las herramientas ya fueron recogidas.</p>\n<p><strong>¿Cómo procedes?</strong></p>	\N	2	[{"texto": "Documentar lo que queda y entrevistar testigos", "puntos": 15, "feedback": "Correcto dado el contexto, aunque perdiste evidencia valiosa.", "siguienteNodoId": "nodo-003b"}, {"texto": "Solicitar que devuelvan las herramientas a su posición original", "puntos": 5, "feedback": "Reconstruir la escena puede introducir errores.", "siguienteNodoId": "nodo-003b"}]	f	15	2025-12-10 09:51:20.365524
nodo-002c	esc-invest-001	decision	Al Día Siguiente	<h3>Investigación Tardía</h3>\n<p>Al día siguiente, la escena ha sido completamente alterada. El andamio fue desmontado y el área está en operación normal.</p>\n<p><strong>¿Qué puedes hacer ahora?</strong></p>	\N	2	[{"texto": "Entrevistar testigos y revisar documentación", "puntos": 10, "feedback": "Es lo único que puedes hacer ahora, pero la investigación estará muy limitada.", "siguienteNodoId": "nodo-003c"}]	f	10	2025-12-10 09:51:20.365524
nodo-003	esc-invest-001	decision	Metodología de Investigación	<h3>Análisis de Causas</h3>\n<p>Con la escena documentada, procedes a entrevistar a los testigos y aplicar la metodología de los <strong>5 Porqués</strong>:</p>\n<p><strong>¿Por qué cayó el trabajador?</strong> → La tabla del andamio se rompió</p>\n<p><strong>¿Por qué se rompió la tabla?</strong> → Estaba deteriorada por la humedad</p>\n<p><strong>¿Por qué no se detectó el deterioro?</strong> → No se hizo inspección previa</p>\n<p><strong>¿Por qué no hubo inspección?</strong> → No existe un procedimiento de inspección de andamios</p>\n<p><strong>¿Por qué no hay procedimiento?</strong> → Falta de gestión en el programa de SST</p>\n<p><strong>¿Cuál es la causa raíz principal?</strong></p>	\N	3	[{"texto": "Fallas en el sistema de gestión de SST (falta de procedimientos)", "puntos": 20, "feedback": "¡Correcto! La causa raíz es sistémica, no solo el deterioro físico.", "siguienteNodoId": "nodo-004"}, {"texto": "El deterioro de la tabla del andamio", "puntos": 10, "feedback": "Esta es una causa inmediata, no la causa raíz.", "siguienteNodoId": "nodo-004b"}, {"texto": "Negligencia del trabajador por no usar arnés", "puntos": 5, "feedback": "Culpar al trabajador no identifica las fallas sistémicas.", "siguienteNodoId": "nodo-004b"}]	t	20	2025-12-10 09:51:20.365524
nodo-003b	esc-invest-001	decision	Análisis Parcial	<h3>Información Limitada</h3>\n<p>Con la información disponible, intentas aplicar el análisis de causas. Los testigos mencionan:</p>\n<ul>\n<li>El andamio llevaba varias semanas instalado</li>\n<li>Juan no estaba usando el arnés de seguridad</li>\n<li>La tabla que se rompió ya tenía grietas visibles</li>\n</ul>\n<p><strong>¿Cuál consideras la causa principal?</strong></p>	\N	3	[{"texto": "Falta de inspección y procedimientos de trabajo seguro", "puntos": 15, "feedback": "Buen análisis considerando la información limitada.", "siguienteNodoId": "nodo-004"}, {"texto": "El trabajador no usó su arnés de seguridad", "puntos": 5, "feedback": "El arnés es una barrera, pero ¿por qué no lo usó?", "siguienteNodoId": "nodo-004b"}]	f	15	2025-12-10 09:52:10.350563
nodo-003c	esc-invest-001	decision	Investigación Limitada	<h3>Reconstrucción Difícil</h3>\n<p>Sin evidencia física, dependes completamente de testimonios que pueden ser imprecisos.</p>\n<p>El supervisor menciona que "estas cosas pasan" y sugiere cerrar el caso rápidamente.</p>\n<p><strong>¿Qué decides?</strong></p>	\N	3	[{"texto": "Insistir en una investigación completa aunque sea difícil", "puntos": 10, "feedback": "Buena decisión, aunque la investigación estará comprometida.", "siguienteNodoId": "nodo-004b"}, {"texto": "Aceptar que no hay suficiente información y cerrar el caso", "puntos": 0, "feedback": "Incorrecto. Siempre debe investigarse para prevenir futuros accidentes.", "siguienteNodoId": "nodo-fin-malo"}]	f	10	2025-12-10 09:52:10.350563
nodo-004	esc-invest-001	decision	Medidas Correctivas	<h3>Plan de Acción</h3>\n<p>Identificadas las causas raíz, debes proponer medidas correctivas. ¿Cuáles priorizas?</p>	\N	4	[{"texto": "Crear procedimiento de inspección de andamios + capacitación + supervisión", "puntos": 20, "feedback": "¡Excelente! Atacas la causa raíz con medidas de control en varios niveles.", "siguienteNodoId": "nodo-fin-bueno"}, {"texto": "Comprar andamios nuevos y sancionar al trabajador", "puntos": 5, "feedback": "Reemplazar equipos es costoso y las sanciones no previenen accidentes.", "siguienteNodoId": "nodo-fin-regular"}, {"texto": "Exigir uso obligatorio de arnés en todo momento", "puntos": 10, "feedback": "El arnés es importante pero no soluciona la falta de procedimientos.", "siguienteNodoId": "nodo-fin-regular"}]	t	20	2025-12-10 09:52:10.350563
nodo-004b	esc-invest-001	decision	Propuestas de Mejora	<h3>Acciones Correctivas</h3>\n<p>Basándote en tu análisis, ¿qué recomiendas?</p>	\N	4	[{"texto": "Implementar programa de inspecciones periódicas y capacitación", "puntos": 15, "feedback": "Buenas medidas, aunque el análisis inicial pudo ser más completo.", "siguienteNodoId": "nodo-fin-regular"}, {"texto": "Sancionar al trabajador y supervisores", "puntos": 0, "feedback": "Las sanciones no abordan las causas sistémicas del accidente.", "siguienteNodoId": "nodo-fin-malo"}]	f	15	2025-12-10 09:52:10.350563
nodo-fin-bueno	esc-invest-001	resultado	Investigación Exitosa	<h3>¡Excelente Trabajo!</h3>\n<p>Tu investigación fue ejemplar. Lograste:</p>\n<ul>\n<li>✅ Preservar la escena del accidente</li>\n<li>✅ Documentar adecuadamente las evidencias</li>\n<li>✅ Identificar la causa raíz sistémica</li>\n<li>✅ Proponer medidas correctivas efectivas</li>\n</ul>\n<p><strong>Resultado:</strong> La empresa implementó el procedimiento de inspección de andamios y no se han presentado más accidentes de este tipo.</p>\n<p class="text-green-600 font-bold">Has demostrado dominio de la metodología de investigación de accidentes.</p>	\N	5	[]	t	0	2025-12-10 09:52:10.350563
nodo-fin-regular	esc-invest-001	resultado	Investigación Aceptable	<h3>Buen Esfuerzo</h3>\n<p>Tu investigación tuvo algunos aspectos positivos, pero hay áreas de mejora:</p>\n<ul>\n<li>⚠️ La identificación de causas pudo ser más profunda</li>\n<li>⚠️ Las medidas correctivas podrían ser más completas</li>\n</ul>\n<p><strong>Resultado:</strong> Se implementaron algunas mejoras pero el riesgo no fue completamente controlado.</p>\n<p class="text-yellow-600 font-bold">Te recomendamos revisar la metodología de los 5 Porqués.</p>	\N	5	[]	f	0	2025-12-10 09:52:10.350563
nodo-fin-malo	esc-invest-001	resultado	Investigación Deficiente	<h3>Oportunidad de Mejora</h3>\n<p>La investigación no logró sus objetivos:</p>\n<ul>\n<li>❌ No se identificaron las causas raíz reales</li>\n<li>❌ Las acciones correctivas no atacan el problema</li>\n<li>❌ El accidente podría repetirse</li>\n</ul>\n<p><strong>Resultado:</strong> Tres meses después, otro trabajador sufrió un accidente similar.</p>\n<p class="text-red-600 font-bold">Es importante capacitarte más en metodología de investigación de accidentes.</p>	\N	5	[]	f	0	2025-12-10 09:52:10.350563
\.


--
-- Data for Name: copasst_escenario_progreso; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.copasst_escenario_progreso (id, company_id, user_id, escenario_id, nodos_visitados, decisiones_tomadas, puntos_obtenidos, completado, fecha_inicio, fecha_completado, created_at) FROM stdin;
1c8e8387-5bf7-4257-84e5-3733a6b55189	76050645-7d63-46af-953b-bc86727b596f	e0ce2417-ad06-4b8d-9a55-a9eda01c8e67	esc-invest-001	[]	[]	0	f	2025-12-10 17:17:15.452	\N	2025-12-10 17:17:15.493221
f1719ab9-0fdb-4bdf-a4bd-11792560e221	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	360f5e46-96e8-47a0-9c5b-0bbf1c2cecf1	esc-invest-001	[]	[]	0	f	2025-12-11 06:45:23.773	\N	2025-12-11 06:45:23.806216
\.


--
-- Data for Name: copasst_escenarios; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.copasst_escenarios (id, codigo, titulo, descripcion, categoria, duracion_minutos, puntos_perfecto, imagen_url, activo, created_at) FROM stdin;
esc-invest-001	ESC-INVEST-001	Investigación de Accidente: Caída en Altura	Un trabajador ha sufrido una caída desde un andamio. Como miembro del COPASST, debes investigar el accidente siguiendo la metodología de los 5 Porqués para identificar las causas raíz y proponer medidas correctivas.	investigacion_accidentes	20	100	\N	t	2025-12-10 09:51:20.365524
\.


--
-- Data for Name: copasst_evaluacion_asignaciones; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.copasst_evaluacion_asignaciones (id, periodo_id, evaluador_id, evaluado_id, tipo_evaluador, estado, fecha_completada, created_at) FROM stdin;
\.


--
-- Data for Name: copasst_evaluacion_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.copasst_evaluacion_items (id, periodo_id, competencia_id, enunciado, escala_minima, escala_maxima, peso, orden, created_at) FROM stdin;
\.


--
-- Data for Name: copasst_evaluacion_periodos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.copasst_evaluacion_periodos (id, company_id, nombre, descripcion, fecha_inicio, fecha_fin, estado, created_at) FROM stdin;
\.


--
-- Data for Name: copasst_evaluacion_respuestas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.copasst_evaluacion_respuestas (id, asignacion_id, item_id, valor, comentario, created_at) FROM stdin;
\.


--
-- Data for Name: copasst_evaluacion_resultados; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.copasst_evaluacion_resultados (id, periodo_id, evaluado_id, promedio_general, promedios_por_dimension, fortalezas, oportunidades, comentarios_generales, created_at) FROM stdin;
\.


--
-- Data for Name: copasst_insignias; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.copasst_insignias (id, codigo, titulo, descripcion, icono_url, icono_lucide, categoria, condicion, puntos_bonus, activo, created_at) FROM stdin;
2fc35404-b9c8-4540-b96f-4731c64545d6	BADGE-FIRST-COURSE	Primera Victoria	Completaste tu primer curso de capacitación COPASST	\N	trophy	curso	{"tipo": "cursos_completados", "valor": 1}	50	t	2025-12-10 09:50:07.436397
26fa1421-5e73-46d3-8e77-90cab6b000ad	BADGE-HALF-COURSES	A Mitad de Camino	Completaste 3 de los 6 cursos obligatorios	\N	target	curso	{"tipo": "cursos_completados", "valor": 3}	75	t	2025-12-10 09:50:07.436397
e291c1b0-4148-4651-8c55-a8e55d107bfd	BADGE-ALL-COURSES	Maestro COPASST	Completaste todos los 6 cursos obligatorios	\N	graduation-cap	curso	{"tipo": "cursos_completados", "valor": 6}	200	t	2025-12-10 09:50:07.436397
57a6ac02-747e-45d4-8c01-7e09b434d4b5	BADGE-PERFECT-QUIZ	Respuesta Perfecta	Obtuviste 100% en un quiz de evaluación	\N	sparkles	quiz	{"tipo": "quiz_perfecto", "valor": 100}	100	t	2025-12-10 09:50:07.436397
a0e7143c-6304-4f13-bf15-6e21c12550fd	BADGE-QUIZ-MASTER	Experto Evaluador	Aprobaste 5 quizzes con más del 90%	\N	brain	quiz	{"tipo": "quizzes_alto_puntaje", "valor": 5}	150	t	2025-12-10 09:50:07.436397
9905685b-e760-4d54-b8ac-ec73e1ec7be7	BADGE-STREAK-3	Constancia Inicial	Mantuviste una racha de 3 días consecutivos	\N	flame	racha	{"tipo": "racha_dias", "valor": 3}	30	t	2025-12-10 09:50:07.436397
cbdcb680-2355-482d-a1bc-a6b45fef9d0a	BADGE-STREAK-7	Semana Dedicada	Mantuviste una racha de 7 días consecutivos	\N	zap	racha	{"tipo": "racha_dias", "valor": 7}	75	t	2025-12-10 09:50:07.436397
08f83c33-c214-421f-82e9-b7fc5edfa413	BADGE-STREAK-30	Compromiso Total	Mantuviste una racha de 30 días consecutivos	\N	crown	racha	{"tipo": "racha_dias", "valor": 30}	300	t	2025-12-10 09:50:07.436397
93d5a2ee-2585-443b-9b76-b7deb849b0df	BADGE-FIRST-SCENARIO	Investigador Novato	Completaste tu primer escenario interactivo	\N	search	escenario	{"tipo": "escenarios_completados", "valor": 1}	50	t	2025-12-10 09:50:07.436397
7817a5c2-a4d1-4872-be61-b310b467841a	BADGE-PERFECT-SCENARIO	Investigador Experto	Obtuviste puntuación perfecta en un escenario	\N	shield-check	escenario	{"tipo": "escenario_perfecto", "valor": 1}	150	t	2025-12-10 09:50:07.436397
18b9e96a-0480-4879-9449-f11df71035e8	BADGE-POINTS-100	Primeros Pasos	Acumulaste 100 puntos en total	\N	star	especial	{"tipo": "puntos_totales", "valor": 100}	25	t	2025-12-10 09:50:07.436397
d33f9393-7665-4464-b36e-2a49b4af084e	BADGE-POINTS-500	Aprendiz Dedicado	Acumulaste 500 puntos en total	\N	medal	especial	{"tipo": "puntos_totales", "valor": 500}	75	t	2025-12-10 09:50:07.436397
e292976d-c3ad-4c33-aa9b-feb176024a42	BADGE-POINTS-1000	Campeón SST	Acumulaste 1000 puntos en total	\N	award	especial	{"tipo": "puntos_totales", "valor": 1000}	200	t	2025-12-10 09:50:07.436397
\.


--
-- Data for Name: copasst_insignias_usuario; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.copasst_insignias_usuario (id, company_id, user_id, insignia_id, fecha_desbloqueo, created_at) FROM stdin;
\.


--
-- Data for Name: copasst_lecciones; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.copasst_lecciones (id, curso_id, titulo, contenido_html, video_url, duracion_minutos, orden_leccion, puntos_completar, activo, created_at) FROM stdin;
a9c941b7-d56a-4a55-a798-311a96244519	5c1480a0-3a20-4c2d-9784-d8e1e32f3b98	¿Qué es el COPASST?	<h2>Definición del COPASST</h2><p>El <strong>Comité Paritario de Seguridad y Salud en el Trabajo (COPASST)</strong> es un organismo de promoción y vigilancia de las normas y reglamentos de Seguridad y Salud en el Trabajo dentro de la empresa.</p><h3>Origen Normativo</h3><p>Fue establecido por la <strong>Resolución 2013 de 1986</strong> y sus funciones han sido actualizadas por el Decreto 1072 de 2015 y la Resolución 0312 de 2019.</p><h3>Composición</h3><ul><li>Representantes del empleador (designados)</li><li>Representantes de los trabajadores (elegidos por votación)</li><li>Número igual de principales y suplentes por cada parte</li></ul><h3>Importancia</h3><p>El COPASST es fundamental para:</p><ol><li>Promover la cultura de seguridad</li><li>Vigilar el cumplimiento del SG-SST</li><li>Proponer mejoras en condiciones de trabajo</li><li>Investigar incidentes y accidentes</li></ol>	\N	5	1	10	t	2025-12-10 08:29:22.172409
4551b1f9-982e-43a4-ba3d-c3faec3f7310	5c1480a0-3a20-4c2d-9784-d8e1e32f3b98	Funciones Principales	<h2>Funciones del COPASST según la Res. 2013/1986</h2><p>El COPASST tiene <strong>12 funciones principales</strong> que debe cumplir para garantizar la seguridad de los trabajadores:</p><h3>1. Proponer y participar</h3><ul><li>Proponer medidas de prevención y control de riesgos</li><li>Participar en inspecciones de seguridad</li><li>Colaborar en el análisis de causas de accidentes</li></ul><h3>2. Vigilar y verificar</h3><ul><li>Vigilar el desarrollo de actividades del SG-SST</li><li>Verificar el cumplimiento de normas de SST</li><li>Revisar las estadísticas de accidentalidad</li></ul><h3>3. Investigar y proponer</h3><ul><li>Investigar incidentes y accidentes de trabajo</li><li>Proponer planes de capacitación en SST</li><li>Recibir y dar trámite a quejas de trabajadores</li></ul><h3>Frecuencia de Reuniones</h3><p>El COPASST debe reunirse <strong>mínimo una vez al mes</strong> y de forma extraordinaria cuando ocurra un accidente grave o mortal.</p>	\N	5	2	10	t	2025-12-10 08:29:22.172409
a849fa99-be9e-4946-b3cd-b24c2b9374d3	5c1480a0-3a20-4c2d-9784-d8e1e32f3b98	Conformación y Período	<h2>Conformación del COPASST</h2><h3>Según el Número de Trabajadores</h3><table><tr><th>Trabajadores</th><th>Principales</th><th>Suplentes</th></tr><tr><td>Menos de 10</td><td colspan="2">Vigía de SST</td></tr><tr><td>10 - 49</td><td>1 por parte</td><td>1 por parte</td></tr><tr><td>50 - 499</td><td>2 por parte</td><td>2 por parte</td></tr><tr><td>500 - 999</td><td>3 por parte</td><td>4 por parte</td></tr><tr><td>1000 o más</td><td>4 por parte</td><td>4 por parte</td></tr></table><h3>Período de Vigencia</h3><p>El COPASST tiene un período de <strong>2 años</strong>, durante los cuales los miembros pueden ser reelegidos.</p><h3>Roles Clave</h3><ul><li><strong>Presidente:</strong> Designado por el empleador</li><li><strong>Secretario:</strong> Elegido por el comité</li></ul>	\N	5	3	10	t	2025-12-10 08:29:22.172409
1c194de6-b0ef-4778-9232-d0eb43ff3bfc	cbab735a-385e-4418-bdae-77d146d81f98	Conceptos Básicos de Investigación	<h2>Investigación de Accidentes e Incidentes</h2><h3>Definiciones Clave</h3><ul><li><strong>Accidente de Trabajo:</strong> Suceso repentino que produzca una lesión, perturbación o la muerte durante la ejecución del trabajo.</li><li><strong>Incidente de Trabajo:</strong> Suceso que no causa lesión o enfermedad pero que pudo haberlo causado.</li><li><strong>Enfermedad Laboral:</strong> Enfermedad contraída como resultado de la exposición a factores de riesgo del trabajo.</li></ul><h3>¿Por qué Investigar?</h3><ol><li>Identificar causas raíz del evento</li><li>Prevenir la repetición</li><li>Cumplir con la normativa legal</li><li>Mejorar las condiciones de trabajo</li></ol><h3>Tiempos de Reporte</h3><p>Los accidentes deben reportarse a la ARL dentro de los <strong>2 días hábiles</strong> siguientes a su ocurrencia.</p>	\N	5	1	10	t	2025-12-10 08:29:43.089812
aab20d8a-7227-4211-9d7d-388cc8636700	cbab735a-385e-4418-bdae-77d146d81f98	Metodología de los 5 Porqués	<h2>Técnica de los 5 Porqués</h2><p>Esta técnica simple pero efectiva permite llegar a la <strong>causa raíz</strong> de un problema haciendo preguntas sucesivas de "¿Por qué?"</p><h3>Ejemplo Práctico</h3><div style="background:#f0f0f0;padding:15px;border-radius:8px;"><p><strong>Problema:</strong> Un trabajador se resbaló y cayó</p><ol><li>¿Por qué se resbaló? <em>Porque el piso estaba mojado</em></li><li>¿Por qué estaba mojado? <em>Porque hay una fuga de agua</em></li><li>¿Por qué hay fuga? <em>Porque la tubería está dañada</em></li><li>¿Por qué está dañada? <em>Porque no se hizo mantenimiento</em></li><li>¿Por qué no se hizo? <em>Porque no hay programa de mantenimiento</em></li></ol><p><strong>Causa Raíz:</strong> Falta de programa de mantenimiento preventivo</p></div><h3>Recomendaciones</h3><ul><li>No siempre son exactamente 5 preguntas</li><li>Evite respuestas que culpen a personas</li><li>Enfóquese en procesos y sistemas</li></ul>	\N	8	2	10	t	2025-12-10 08:29:43.089812
1142a89e-abfd-43af-8640-17362623ba98	cbab735a-385e-4418-bdae-77d146d81f98	Diligenciamiento del FURAT	<h2>Formato Único de Reporte de Accidente de Trabajo (FURAT)</h2><p>El FURAT es el documento oficial para reportar accidentes de trabajo a la ARL.</p><h3>Secciones del FURAT</h3><ol><li><strong>Datos del empleador:</strong> NIT, razón social, actividad económica, dirección</li><li><strong>Datos del trabajador:</strong> Identificación, cargo, antigüedad, jornada</li><li><strong>Datos del accidente:</strong> Fecha, hora, lugar, descripción detallada</li><li><strong>Descripción de la lesión:</strong> Parte del cuerpo afectada, tipo de lesión</li><li><strong>Agente y mecanismo:</strong> Qué causó la lesión y cómo ocurrió</li></ol><h3>Errores Comunes a Evitar</h3><ul><li>Descripción incompleta del evento</li><li>Datos incorrectos del trabajador</li><li>No identificar claramente el agente causal</li><li>Demora en el reporte (máximo 2 días hábiles)</li></ul>	\N	7	3	10	t	2025-12-10 08:29:43.089812
9a796336-2561-4b88-ba72-311b3bc5cacb	16987a7d-d8a2-4de9-9805-181838a51d69	Tipos de Inspecciones	<h2>Inspecciones de Seguridad en el Trabajo</h2><p>Las inspecciones son herramientas fundamentales para identificar condiciones y actos inseguros antes de que causen accidentes.</p><h3>Tipos de Inspecciones</h3><ol><li><strong>Inspecciones Planeadas:</strong> Programadas con frecuencia definida (mensuales, trimestrales)</li><li><strong>Inspecciones No Planeadas:</strong> Se realizan sin previo aviso para verificar condiciones reales</li><li><strong>Inspecciones Especiales:</strong> Después de un accidente, cambio de proceso o instalación nueva</li></ol><h3>¿Qué Buscar?</h3><ul><li><strong>Condiciones Inseguras:</strong> Estado físico del ambiente (pisos, equipos, herramientas)</li><li><strong>Actos Inseguros:</strong> Comportamientos de riesgo de los trabajadores</li></ul><h3>Frecuencia Recomendada</h3><p>La Resolución 0312/2019 exige inspecciones <strong>mensuales</strong> como mínimo en áreas críticas.</p>	\N	7	1	10	t	2025-12-10 08:30:03.528699
803cae6b-6777-4abc-a372-8f6283df9659	16987a7d-d8a2-4de9-9805-181838a51d69	Lista de Chequeo y Documentación	<h2>Listas de Chequeo para Inspecciones</h2><h3>Elementos a Inspeccionar</h3><ul><li><strong>Orden y aseo:</strong> Áreas despejadas, materiales almacenados correctamente</li><li><strong>Señalización:</strong> Visible, completa y en buen estado</li><li><strong>EPP:</strong> Uso adecuado, estado de conservación, disponibilidad</li><li><strong>Equipos de emergencia:</strong> Extintores cargados y accesibles, botiquines completos</li><li><strong>Instalaciones eléctricas:</strong> Sin cables expuestos, tomacorrientes en buen estado</li><li><strong>Herramientas:</strong> En buen estado, almacenamiento adecuado</li></ul><h3>Documentación de Hallazgos</h3><p>Cada hallazgo debe registrarse con:</p><ol><li>Descripción clara del hallazgo</li><li>Ubicación exacta</li><li>Clasificación de prioridad (Alta/Media/Baja)</li><li>Evidencia fotográfica</li><li>Responsable de corrección</li><li>Fecha límite de corrección</li></ol>	\N	7	2	10	t	2025-12-10 08:30:03.528699
6950fdf9-e71f-4a57-9f3d-ad059944620d	16987a7d-d8a2-4de9-9805-181838a51d69	Seguimiento a Hallazgos	<h2>Gestión de Hallazgos de Inspección</h2><h3>Ciclo de Gestión</h3><ol><li><strong>Identificación:</strong> Detectar la condición o acto inseguro</li><li><strong>Clasificación:</strong> Determinar la prioridad según el riesgo</li><li><strong>Asignación:</strong> Designar responsable de la corrección</li><li><strong>Seguimiento:</strong> Verificar que se ejecute la acción correctiva</li><li><strong>Cierre:</strong> Documentar la corrección realizada</li></ol><h3>Indicadores de Gestión</h3><ul><li>% de hallazgos cerrados en tiempo</li><li>Tiempo promedio de cierre</li><li>Número de hallazgos por área</li><li>Tendencia de hallazgos recurrentes</li></ul><h3>Rol del COPASST</h3><p>El COPASST debe:</p><ul><li>Participar activamente en las inspecciones</li><li>Hacer seguimiento mensual a los hallazgos</li><li>Proponer acciones correctivas</li><li>Reportar incumplimientos a la gerencia</li></ul>	\N	6	3	10	t	2025-12-10 08:30:03.528699
bd6b9e09-0e29-4062-bb1e-d02925636bf8	0db339c6-a30b-45c8-b989-ae205bc9387d	Conceptos de la GTC-45	<h2>Guía Técnica Colombiana GTC-45</h2><p>La GTC-45 es la metodología estándar en Colombia para la <strong>identificación de peligros y valoración de riesgos</strong> ocupacionales.</p><h3>Conceptos Clave</h3><ul><li><strong>Peligro:</strong> Fuente, situación o acto con potencial de causar daño</li><li><strong>Riesgo:</strong> Combinación de probabilidad de que ocurra un evento peligroso y la severidad de la lesión o enfermedad</li><li><strong>Control:</strong> Medida que modifica el riesgo (eliminar, sustituir, controles de ingeniería, controles administrativos, EPP)</li></ul><h3>Clasificación de Peligros</h3><ol><li>Biológicos (virus, bacterias, hongos)</li><li>Físicos (ruido, iluminación, temperatura)</li><li>Químicos (gases, vapores, polvos)</li><li>Psicosociales (estrés, carga laboral)</li><li>Biomecánicos (posturas, movimientos repetitivos)</li><li>Condiciones de seguridad (locativo, mecánico, eléctrico)</li></ol>	\N	8	1	10	t	2025-12-10 08:30:26.343089
02091ee8-4170-4795-8a53-4793e9cb4ada	0db339c6-a30b-45c8-b989-ae205bc9387d	Valoración del Riesgo	<h2>Metodología de Valoración GTC-45</h2><h3>Nivel de Deficiencia (ND)</h3><table><tr><th>Nivel</th><th>Valor</th><th>Significado</th></tr><tr><td>Muy Alto</td><td>10</td><td>Se detectan peligros muy significativos</td></tr><tr><td>Alto</td><td>6</td><td>Se detectan peligros significativos</td></tr><tr><td>Medio</td><td>2</td><td>Se detectan peligros de bajo significado</td></tr><tr><td>Bajo</td><td>-</td><td>No se detectan anomalías</td></tr></table><h3>Nivel de Exposición (NE)</h3><table><tr><th>Nivel</th><th>Valor</th><th>Significado</th></tr><tr><td>Continua</td><td>4</td><td>La situación ocurre constantemente</td></tr><tr><td>Frecuente</td><td>3</td><td>Ocurre varias veces en la jornada</td></tr><tr><td>Ocasional</td><td>2</td><td>Ocurre alguna vez</td></tr><tr><td>Esporádica</td><td>1</td><td>La exposición es de forma esporádica</td></tr></table><h3>Fórmula</h3><p><strong>NP = ND × NE</strong> (Nivel de Probabilidad)</p><p><strong>NR = NP × NC</strong> (Nivel de Riesgo)</p>	\N	10	2	10	t	2025-12-10 08:30:26.343089
da3251c2-623a-4974-8926-aaed20e87f3b	0db339c6-a30b-45c8-b989-ae205bc9387d	Jerarquía de Controles	<h2>Jerarquía de Controles según GTC-45</h2><p>Los controles deben aplicarse en el siguiente orden de prioridad:</p><h3>1. Eliminación (Más Efectivo)</h3><p>Remover el peligro completamente del proceso o actividad.</p><h3>2. Sustitución</h3><p>Reemplazar el peligro por algo menos peligroso.</p><h3>3. Controles de Ingeniería</h3><p>Aislar el peligro de las personas o las personas del peligro (guardas, ventilación, barreras).</p><h3>4. Controles Administrativos</h3><p>Cambiar la forma de trabajar (procedimientos, capacitación, rotación, señalización).</p><h3>5. Equipos de Protección Personal (Menos Efectivo)</h3><p>Último recurso cuando otros controles no son viables.</p><h3>Rol del COPASST</h3><ul><li>Participar en la identificación de peligros</li><li>Proponer controles efectivos</li><li>Verificar la implementación de controles</li><li>Revisar la matriz anualmente o cuando cambian las condiciones</li></ul>	\N	7	3	10	t	2025-12-10 08:30:26.343089
2f783139-155a-4f8d-b247-31d6adef6000	e033934e-dd64-4886-96fb-477f7cc35e3e	Plan de Emergencias	<h2>Plan de Emergencias Empresarial</h2><p>Todo empleador debe contar con un <strong>Plan de Prevención, Preparación y Respuesta ante Emergencias</strong> según el Decreto 1072/2015.</p><h3>Componentes del Plan</h3><ol><li><strong>Análisis de vulnerabilidad:</strong> Identificar amenazas y evaluar capacidad de respuesta</li><li><strong>Procedimientos operativos:</strong> Qué hacer antes, durante y después de cada emergencia</li><li><strong>Recursos:</strong> Equipos, personal, comunicaciones</li><li><strong>Programa de capacitación:</strong> Entrenar al personal</li><li><strong>Simulacros:</strong> Practicar la respuesta</li></ol><h3>Tipos de Emergencias</h3><ul><li>Incendios y explosiones</li><li>Sismos y terremotos</li><li>Inundaciones</li><li>Derrames de sustancias</li><li>Emergencias médicas</li><li>Asonadas y disturbios</li></ul>	\N	7	1	10	t	2025-12-10 08:30:45.456446
9ab70aad-179f-46e8-b402-f2fb23381647	e033934e-dd64-4886-96fb-477f7cc35e3e	Brigadas de Emergencia	<h2>Brigadas de Emergencia</h2><p>Las brigadas son grupos de trabajadores capacitados para responder ante emergencias.</p><h3>Tipos de Brigadas</h3><ol><li><strong>Brigada de Evacuación:</strong> Guía la evacuación ordenada del personal</li><li><strong>Brigada de Primeros Auxilios:</strong> Brinda atención inicial a lesionados</li><li><strong>Brigada de Incendios:</strong> Control de conatos y evacuación en incendios</li><li><strong>Brigada de Rescate:</strong> Búsqueda y rescate de personas atrapadas</li></ol><h3>Perfil del Brigadista</h3><ul><li>Voluntario y comprometido</li><li>Buen estado de salud</li><li>Conocimiento del área de trabajo</li><li>Capacidad de liderazgo y trabajo en equipo</li></ul><h3>Capacitación Requerida</h3><p>Los brigadistas deben recibir capacitación teórico-práctica <strong>mínimo cada año</strong> en:</p><ul><li>Primeros auxilios</li><li>Control de incendios</li><li>Evacuación</li><li>Manejo de extintores</li></ul>	\N	7	2	10	t	2025-12-10 08:30:45.456446
04240346-1d7a-46bc-b97e-135f70d1a95c	e033934e-dd64-4886-96fb-477f7cc35e3e	Simulacros de Evacuación	<h2>Simulacros de Evacuación</h2><p>Los simulacros son ejercicios prácticos que permiten evaluar la capacidad de respuesta ante emergencias.</p><h3>Tipos de Simulacros</h3><ul><li><strong>Avisado:</strong> El personal sabe con anticipación (para entrenar)</li><li><strong>Sin aviso:</strong> Solo conoce el coordinador (para evaluar)</li><li><strong>Parcial:</strong> Solo un área o proceso</li><li><strong>Total:</strong> Toda la organización</li></ul><h3>Frecuencia</h3><p>La Resolución 0312/2019 exige <strong>mínimo un simulacro anual</strong>.</p><h3>Evaluación del Simulacro</h3><p>Se debe medir:</p><ul><li>Tiempo total de evacuación</li><li>Puntos de encuentro utilizados</li><li>Comportamiento del personal</li><li>Funcionamiento de alarmas y señalización</li><li>Actuación de los brigadistas</li></ul><h3>Rol del COPASST</h3><ul><li>Participar en la planificación del simulacro</li><li>Observar y evaluar la ejecución</li><li>Proponer mejoras basadas en los resultados</li></ul>	\N	6	3	10	t	2025-12-10 08:30:45.456446
b6e27853-c679-48fe-8bc5-6393239b25e6	a3480118-5fd7-4558-b75c-fe9904b1069f	Decreto 1072 de 2015	<h2>Decreto Único Reglamentario del Sector Trabajo</h2><p>El <strong>Decreto 1072 de 2015</strong> compila toda la normativa laboral colombiana, incluyendo el Sistema de Gestión de SST.</p><h3>Libro 2, Parte 2, Título 4, Capítulo 6</h3><p>Contiene los requisitos del <strong>Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST)</strong>.</p><h3>Aspectos Clave</h3><ul><li><strong>Política de SST:</strong> Compromiso de la alta dirección</li><li><strong>Organización:</strong> Roles, responsabilidades, recursos</li><li><strong>Planificación:</strong> Identificación de peligros, requisitos legales, objetivos</li><li><strong>Aplicación:</strong> Gestión del cambio, EPP, vigilancia de la salud</li><li><strong>Auditoría y revisión:</strong> Evaluación del cumplimiento</li><li><strong>Mejoramiento:</strong> Acciones correctivas y preventivas</li></ul><h3>Sanciones</h3><p>El incumplimiento puede generar multas de hasta <strong>500 SMMLV</strong> e incluso cierre temporal o definitivo del establecimiento.</p>	\N	5	1	10	t	2025-12-10 08:31:10.470379
d8b8373e-0f1d-4769-aa61-642e325b4304	a3480118-5fd7-4558-b75c-fe9904b1069f	Resolución 0312 de 2019	<h2>Estándares Mínimos del SG-SST</h2><p>La <strong>Resolución 0312 de 2019</strong> establece los estándares mínimos que toda empresa debe cumplir según su clasificación.</p><h3>Clasificación por Capítulos</h3><table><tr><th>Capítulo</th><th>Trabajadores</th><th>Estándares</th></tr><tr><td>I</td><td>≤10 trabajadores (riesgo I, II, III)</td><td>7 estándares</td></tr><tr><td>II</td><td>11-50 trabajadores o cualquier riesgo IV-V</td><td>21 estándares</td></tr><tr><td>III</td><td>&gt;50 trabajadores</td><td>60 estándares</td></tr></table><h3>Ciclo PHVA</h3><p>Los estándares se organizan según el ciclo:</p><ul><li><strong>Planear:</strong> Política, recursos, responsables, matriz legal</li><li><strong>Hacer:</strong> Gestión de peligros, medidas de prevención</li><li><strong>Verificar:</strong> Indicadores, auditoría, revisión</li><li><strong>Actuar:</strong> Mejora continua, acciones correctivas</li></ul>	\N	5	2	10	t	2025-12-10 08:31:10.470379
63570c28-b4b0-4b30-91aa-89785f20486e	a3480118-5fd7-4558-b75c-fe9904b1069f	Responsabilidades Legales	<h2>Responsabilidades en SST</h2><h3>Responsabilidades del Empleador</h3><ul><li>Implementar y mantener el SG-SST</li><li>Asignar recursos financieros, técnicos y humanos</li><li>Garantizar la participación de los trabajadores</li><li>Pagar las cotizaciones al Sistema de Riesgos Laborales</li><li>Investigar accidentes e incidentes</li><li>Realizar exámenes médicos ocupacionales</li></ul><h3>Responsabilidades de los Trabajadores</h3><ul><li>Cumplir las normas y reglamentos de SST</li><li>Usar correctamente los EPP</li><li>Participar en las actividades de capacitación</li><li>Informar peligros y riesgos en el trabajo</li><li>Participar en el COPASST si son elegidos</li></ul><h3>Responsabilidad del COPASST</h3><ul><li>Vigilar el cumplimiento del SG-SST</li><li>Proponer mejoras</li><li>Investigar incidentes y accidentes</li><li>Tramitar quejas de los trabajadores</li></ul><h3>Tipos de Responsabilidad</h3><ol><li><strong>Civil:</strong> Indemnización por daños</li><li><strong>Penal:</strong> Lesiones culposas, homicidio culposo</li><li><strong>Administrativa:</strong> Multas del MinTrabajo</li><li><strong>Laboral:</strong> Pago de prestaciones</li></ol>	\N	5	3	10	t	2025-12-10 08:31:10.470379
\.


--
-- Data for Name: copasst_miembros; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.copasst_miembros (id, periodo_id, worker_id, tipo_representante, rol_miembro, cargo, votos_obtenidos, fecha_designacion, activo, capacitado, fecha_capacitacion, created_at) FROM stdin;
\.


--
-- Data for Name: copasst_notificaciones; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.copasst_notificaciones (id, company_id, asignacion_id, user_id, tipo, titulo, mensaje, estado, fecha_programada, fecha_envio, intentos, error_mensaje, created_at) FROM stdin;
\.


--
-- Data for Name: copasst_periodos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.copasst_periodos (id, company_id, tipo_comite, fecha_inicio, fecha_fin, estado, acta_constitucion_url, resolucion_conformacion_url, observaciones, created_at) FROM stdin;
2c5a180f-dc98-47e1-9b81-d3ad4e746351	76050645-7d63-46af-953b-bc86727b596f	copasst	2025-12-10	2027-12-10	activo	\N	\N	\N	2025-12-10 17:38:51.46336
86d3862a-f244-4b69-90ce-401b45cfa14c	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	copasst	2025-12-10	2027-12-10	activo	\N	\N	\N	2025-12-10 18:09:34.987058
\.


--
-- Data for Name: copasst_progreso; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.copasst_progreso (id, company_id, user_id, curso_id, leccion_id, lecciones_completadas, lecciones_totales, porcentaje_progreso, completado, fecha_inicio, fecha_completado, quiz_aprobado, quiz_puntaje, quiz_intentos, ultimo_intento_quiz, puntos_obtenidos, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: copasst_puntos_mensuales; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.copasst_puntos_mensuales (id, company_id, user_id, anio, mes, puntos_total, cursos_completados, lecciones_completadas, quizzes_aprobados, insignias_desbloqueadas, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: copasst_quiz_preguntas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.copasst_quiz_preguntas (id, curso_id, pregunta, tipo_pregunta, opciones, respuesta_correcta, explicacion, puntos_pregunta, orden_pregunta, activo, created_at) FROM stdin;
cc3ebedc-60b6-406f-9069-30748c19a515	5c1480a0-3a20-4c2d-9784-d8e1e32f3b98	¿Cuál es el período de vigencia del COPASST?	seleccion_multiple	["1 año", "2 años", "3 años", "4 años"]	1	El COPASST tiene un período de vigencia de 2 años, durante los cuales los miembros pueden ser reelegidos.	20	1	t	2025-12-10 08:31:59.329619
c60657d2-88ef-4c78-8136-cc119d7e9842	5c1480a0-3a20-4c2d-9784-d8e1e32f3b98	¿Cuál norma establece las funciones del COPASST?	seleccion_multiple	["Decreto 1072/2015", "Resolución 2013/1986", "Resolución 0312/2019", "Ley 1562/2012"]	1	La Resolución 2013 de 1986 establece las funciones y conformación del COPASST.	20	2	t	2025-12-10 08:31:59.329619
bead1bfd-2c7a-427c-9b36-2a057433fe6d	5c1480a0-3a20-4c2d-9784-d8e1e32f3b98	En una empresa con 30 trabajadores, ¿cuántos miembros principales debe tener el COPASST por cada parte?	seleccion_multiple	["1 principal", "2 principales", "3 principales", "No requiere COPASST"]	0	Empresas entre 10-49 trabajadores requieren 1 principal y 1 suplente por cada parte (empleador y trabajadores).	20	3	t	2025-12-10 08:31:59.329619
641be207-0c6b-41e2-a03e-5f17c41c6378	5c1480a0-3a20-4c2d-9784-d8e1e32f3b98	¿Con qué frecuencia mínima debe reunirse el COPASST?	seleccion_multiple	["Semanalmente", "Mensualmente", "Trimestralmente", "Semestralmente"]	1	El COPASST debe reunirse mínimo una vez al mes y de forma extraordinaria cuando ocurra un accidente grave.	20	4	t	2025-12-10 08:31:59.329619
b5d351a1-0e79-4e9e-8a12-e76637d18ddc	5c1480a0-3a20-4c2d-9784-d8e1e32f3b98	¿Quién designa al presidente del COPASST?	seleccion_multiple	["Los trabajadores por votación", "El empleador", "El Ministerio del Trabajo", "La ARL"]	1	El presidente del COPASST es designado por el empleador.	20	5	t	2025-12-10 08:31:59.329619
857e4147-bba5-496f-91c2-447488e24191	cbab735a-385e-4418-bdae-77d146d81f98	¿Cuánto tiempo máximo tiene el empleador para reportar un accidente a la ARL?	seleccion_multiple	["24 horas", "2 días hábiles", "5 días hábiles", "1 semana"]	1	Los accidentes deben reportarse a la ARL dentro de los 2 días hábiles siguientes a su ocurrencia.	20	1	t	2025-12-10 08:32:11.358765
829ad53c-c27c-4a3a-a034-35bd66b620a1	cbab735a-385e-4418-bdae-77d146d81f98	¿Cuál es el objetivo principal de la técnica de los 5 Porqués?	seleccion_multiple	["Encontrar culpables", "Identificar la causa raíz", "Calcular estadísticas", "Cerrar el caso rápidamente"]	1	La técnica de los 5 Porqués busca identificar la causa raíz del problema haciendo preguntas sucesivas.	20	2	t	2025-12-10 08:32:11.358765
f4d378d8-513c-40f8-a8fa-bca15f40d8c6	cbab735a-385e-4418-bdae-77d146d81f98	¿Qué significa FURAT?	seleccion_multiple	["Formato Único de Registro de Accidentes y Tareas", "Formato Único de Reporte de Accidente de Trabajo", "Formulario Unificado de Riesgos y Accidentes del Trabajo", "Formato Universal de Registro de AT"]	1	FURAT significa Formato Único de Reporte de Accidente de Trabajo.	20	3	t	2025-12-10 08:32:11.358765
f7cb0092-7c43-494e-a05a-3221afa52e54	cbab735a-385e-4418-bdae-77d146d81f98	¿Cuál es la diferencia entre accidente e incidente de trabajo?	seleccion_multiple	["No hay diferencia", "El incidente causa lesión, el accidente no", "El accidente causa lesión, el incidente no", "El accidente solo ocurre en horario laboral"]	2	El accidente de trabajo produce lesión, mientras que el incidente no causa lesión pero pudo haberla causado.	20	4	t	2025-12-10 08:32:11.358765
fe883a98-2949-4226-87a9-addc259cb6d1	cbab735a-385e-4418-bdae-77d146d81f98	Al aplicar los 5 Porqués, ¿qué tipo de respuestas se deben evitar?	seleccion_multiple	["Respuestas técnicas", "Respuestas que culpen a personas", "Respuestas sobre procesos", "Respuestas sobre equipos"]	1	Se deben evitar respuestas que culpen a personas; el enfoque debe estar en procesos y sistemas.	20	5	t	2025-12-10 08:32:11.358765
465bc96c-e9a2-47ac-91d5-0fea98dc0c2a	16987a7d-d8a2-4de9-9805-181838a51d69	¿Cuál es la frecuencia mínima de inspecciones según la Resolución 0312/2019?	seleccion_multiple	["Semanal", "Mensual", "Trimestral", "Anual"]	1	La Resolución 0312/2019 exige inspecciones mensuales como mínimo en áreas críticas.	20	1	t	2025-12-10 08:32:24.85445
79cb22c9-9d94-4a0b-a3bd-03c56f43a011	16987a7d-d8a2-4de9-9805-181838a51d69	¿Cuáles son los dos tipos principales de hallazgos en una inspección?	seleccion_multiple	["Graves y leves", "Condiciones inseguras y actos inseguros", "Urgentes y normales", "Internos y externos"]	1	Las inspecciones buscan identificar condiciones inseguras (estado físico) y actos inseguros (comportamientos).	20	2	t	2025-12-10 08:32:24.85445
e6813494-6c9f-4cdb-a7ff-b49d8899f17d	16987a7d-d8a2-4de9-9805-181838a51d69	¿Qué tipo de inspección se realiza sin previo aviso?	seleccion_multiple	["Planeada", "No planeada", "Especial", "Periódica"]	1	Las inspecciones no planeadas se realizan sin previo aviso para verificar condiciones reales.	20	3	t	2025-12-10 08:32:24.85445
a25ea6cc-003a-4188-8697-3830f2bf913c	16987a7d-d8a2-4de9-9805-181838a51d69	¿Qué debe incluir la documentación de un hallazgo?	seleccion_multiple	["Solo la descripción", "Solo evidencia fotográfica", "Descripción, ubicación, prioridad, responsable y fecha límite", "Solo el nombre del trabajador"]	2	Los hallazgos deben documentarse con descripción, ubicación, prioridad, evidencia, responsable y fecha límite.	20	4	t	2025-12-10 08:32:24.85445
b44fb3e7-c4bd-4f03-bd49-660a1d7d6c0a	16987a7d-d8a2-4de9-9805-181838a51d69	¿Cuándo se debe realizar una inspección especial?	seleccion_multiple	["Cada mes", "Después de un accidente o cambio de proceso", "Solo al inicio del año", "Cuando lo pida la ARL"]	1	Las inspecciones especiales se realizan después de un accidente, cambio de proceso o instalación nueva.	20	5	t	2025-12-10 08:32:24.85445
30d462cd-765a-424a-abd6-c1491ed0e38b	0db339c6-a30b-45c8-b989-ae205bc9387d	¿Cuál es el primer nivel de la jerarquía de controles?	seleccion_multiple	["EPP", "Controles administrativos", "Eliminación", "Sustitución"]	2	La eliminación del peligro es el control más efectivo y el primero en la jerarquía.	20	1	t	2025-12-10 08:32:38.672977
06017559-eff3-453e-aa28-79990351ddfd	0db339c6-a30b-45c8-b989-ae205bc9387d	¿Qué significa IPEVR?	seleccion_multiple	["Identificación de Peligros y Evaluación de Vulnerabilidad y Riesgos", "Identificación de Peligros, Evaluación y Valoración de Riesgos", "Inspección de Puestos y Evaluación de Valoración de Riesgos", "Identificación de Procesos y Evaluación de Valores de Riesgo"]	1	IPEVR significa Identificación de Peligros, Evaluación y Valoración de Riesgos.	20	2	t	2025-12-10 08:32:38.672977
421b036f-ec59-41d4-a81c-006e46cc5f02	0db339c6-a30b-45c8-b989-ae205bc9387d	¿Cuál norma técnica colombiana guía la metodología de identificación de peligros?	seleccion_multiple	["GTC-45", "NTC-4114", "NTC-5254", "ISO 45001"]	0	La GTC-45 (Guía Técnica Colombiana 45) es la metodología estándar para identificación de peligros.	20	3	t	2025-12-10 08:32:38.672977
f5e67fa9-2b6c-4a82-88a5-606a9526fea0	0db339c6-a30b-45c8-b989-ae205bc9387d	¿Cuál es el control menos efectivo según la jerarquía?	seleccion_multiple	["Eliminación", "Sustitución", "Controles de ingeniería", "EPP"]	3	El EPP (Equipo de Protección Personal) es el último recurso y menos efectivo en la jerarquía de controles.	20	4	t	2025-12-10 08:32:38.672977
72e7d541-86f3-4803-94fc-5589d25f96d6	0db339c6-a30b-45c8-b989-ae205bc9387d	¿Cómo se calcula el Nivel de Riesgo (NR) según GTC-45?	seleccion_multiple	["NR = ND + NE", "NR = NP × NC", "NR = ND × NC", "NR = NE × NC"]	1	El Nivel de Riesgo se calcula como NR = NP × NC (Nivel de Probabilidad × Nivel de Consecuencia).	20	5	t	2025-12-10 08:32:38.672977
5454edff-1a2d-4851-8fac-d8ae8d65f137	e033934e-dd64-4886-96fb-477f7cc35e3e	¿Cuál es la frecuencia mínima de simulacros según la Resolución 0312/2019?	seleccion_multiple	["Trimestral", "Semestral", "Anual", "Bianual"]	2	La Resolución 0312/2019 exige mínimo un simulacro anual de evacuación.	20	1	t	2025-12-10 08:32:52.935302
4897dfdf-c46a-4387-a22e-882ff5f46cce	e033934e-dd64-4886-96fb-477f7cc35e3e	¿Cuál NO es un tipo de brigada de emergencia?	seleccion_multiple	["Brigada de evacuación", "Brigada de primeros auxilios", "Brigada de producción", "Brigada de incendios"]	2	La brigada de producción no existe; las brigadas típicas son evacuación, primeros auxilios, incendios y rescate.	20	2	t	2025-12-10 08:32:52.935302
79b0fa65-7d5d-4fae-95f4-359bf7eb2b02	e033934e-dd64-4886-96fb-477f7cc35e3e	¿Qué es un simulacro avisado?	seleccion_multiple	["El personal no sabe que habrá simulacro", "El personal sabe con anticipación del simulacro", "Solo participan los brigadistas", "Se realiza fuera del horario laboral"]	1	En un simulacro avisado, el personal sabe con anticipación que se realizará el ejercicio.	20	3	t	2025-12-10 08:32:52.935302
73d54202-2fd2-4075-a3f0-992ece1a40a3	e033934e-dd64-4886-96fb-477f7cc35e3e	¿Con qué frecuencia mínima deben capacitarse los brigadistas?	seleccion_multiple	["Mensualmente", "Trimestralmente", "Anualmente", "Cada dos años"]	2	Los brigadistas deben recibir capacitación teórico-práctica mínimo cada año.	20	4	t	2025-12-10 08:32:52.935302
3c1e09fb-6c99-46ab-b2a9-2e0bf7ed2587	e033934e-dd64-4886-96fb-477f7cc35e3e	¿Cuál es el componente principal de un plan de emergencias?	seleccion_multiple	["Solo el análisis de vulnerabilidad", "Solo los recursos disponibles", "Todos: análisis, procedimientos, recursos, capacitación y simulacros", "Solo los procedimientos operativos"]	2	El plan de emergencias debe incluir todos: análisis de vulnerabilidad, procedimientos, recursos, capacitación y simulacros.	20	5	t	2025-12-10 08:32:52.935302
95801892-943c-4e33-92dd-2d1f578c7815	a3480118-5fd7-4558-b75c-fe9904b1069f	¿Cuál decreto compila toda la normativa laboral colombiana?	seleccion_multiple	["Decreto 614/1984", "Decreto 1295/1994", "Decreto 1072/2015", "Decreto 472/2015"]	2	El Decreto 1072 de 2015 es el Decreto Único Reglamentario del Sector Trabajo que compila toda la normativa.	20	1	t	2025-12-10 08:33:06.824404
af4b1c0c-efdc-4bcd-9cfb-99104e110a2f	a3480118-5fd7-4558-b75c-fe9904b1069f	¿Cuántos estándares mínimos aplican para empresas de más de 50 trabajadores según la Res. 0312/2019?	seleccion_multiple	["7 estándares", "21 estándares", "60 estándares", "100 estándares"]	2	Las empresas con más de 50 trabajadores deben cumplir 60 estándares mínimos (Capítulo III).	20	2	t	2025-12-10 08:33:06.824404
107346b2-1f1b-41cc-8941-a2dab9934002	a3480118-5fd7-4558-b75c-fe9904b1069f	¿Cuál es la multa máxima por incumplimiento de normas de SST?	seleccion_multiple	["100 SMMLV", "200 SMMLV", "500 SMMLV", "1000 SMMLV"]	2	El incumplimiento puede generar multas de hasta 500 SMMLV según la gravedad de la falta.	20	3	t	2025-12-10 08:33:06.824404
a6db26bb-aa17-435e-a671-eb666998b97e	a3480118-5fd7-4558-b75c-fe9904b1069f	¿Qué ciclo organiza los estándares del SG-SST?	seleccion_multiple	["Ciclo DMAIC", "Ciclo PHVA", "Ciclo PDSA", "Ciclo Six Sigma"]	1	Los estándares se organizan según el ciclo PHVA: Planear, Hacer, Verificar, Actuar.	20	4	t	2025-12-10 08:33:06.824404
a18d93a5-1973-44da-b169-c90a421c1b1e	a3480118-5fd7-4558-b75c-fe9904b1069f	¿Cuál NO es una responsabilidad del trabajador en SST?	seleccion_multiple	["Usar correctamente los EPP", "Cumplir las normas de seguridad", "Implementar el SG-SST", "Informar peligros en el trabajo"]	2	Implementar el SG-SST es responsabilidad del empleador, no del trabajador.	20	5	t	2025-12-10 08:33:06.824404
\.


--
-- Data for Name: copasst_rachas_usuario; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.copasst_rachas_usuario (id, company_id, user_id, racha_actual, racha_maxima, ultima_actividad, puntos_bonus_acumulados, created_at, updated_at) FROM stdin;
3b9cb64a-0b9d-462f-8fc0-f344ec2af909	76050645-7d63-46af-953b-bc86727b596f	e0ce2417-ad06-4b8d-9a55-a9eda01c8e67	0	0	\N	0	2025-12-10 17:17:00.18314	2025-12-10 17:17:00.18314
c863de25-a5ed-4f61-bf3a-172bbfe3bd6f	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	360f5e46-96e8-47a0-9c5b-0bbf1c2cecf1	0	0	\N	0	2025-12-11 06:45:07.748709	2025-12-11 06:45:07.748709
\.


--
-- Data for Name: copasst_registro_votacion; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.copasst_registro_votacion (id, eleccion_id, worker_id, fecha_voto) FROM stdin;
\.


--
-- Data for Name: copasst_votos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.copasst_votos (id, eleccion_id, candidato_id, created_at) FROM stdin;
\.


--
-- Data for Name: criterios_evaluacion_proveedor; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.criterios_evaluacion_proveedor (id, company_id, nombre, descripcion, categoria, puntaje_maximo, es_obligatorio, orden, activo, created_at) FROM stdin;
7332f54b-fbcd-426c-96ee-ecad5d13f476	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	Certificación ARL - Cumplimiento Decreto 1072	% de cumplimiento del SG-SST certificado por la ARL	certificacion_arl	25	1	1	1	2025-12-17 07:28:46.480735
38053fda-3fde-4b77-b0df-e7e9eb8f404d	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	Autoevaluación Estándares Mínimos (Res. 0312/2019)	Cumplimiento de estándares mínimos según tamaño y riesgo	estandares_minimos	25	1	2	1	2025-12-17 07:28:46.543508
754f51aa-0889-4a81-a2d6-c1d29ceeb955	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	Afiliación al Sistema de Seguridad Social	Afiliación vigente de trabajadores a ARL, EPS, AFP	afiliacion	15	1	3	1	2025-12-17 07:28:46.600756
d1444cdf-1b99-4b2c-a993-b9254a1752fc	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	Matriz de Identificación de Peligros	Matriz de riesgos actualizada y documentada	matriz_riesgos	15	1	4	1	2025-12-17 07:28:46.658913
781af078-8f40-4baf-8edc-b1b56dcd21c1	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	Documentación SST	Política SST, procedimientos, planes de emergencia	documentacion	20	1	5	1	2025-12-17 07:28:46.71798
\.


--
-- Data for Name: curso_50_horas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.curso_50_horas (id, company_id, archivo_url, archivo_nombre, created_at, updated_at) FROM stdin;
e2aa5500-41cd-4986-ad22-36359b9938da	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	/objects/uploads/curso-50-horas/c6d3c1d1-0418-46a8-a0ee-23c46a4e806a/122b755b-fcc4-43e9-b779-6230c795eb51.pdf	informe_completo_Luz_Adriana_Diaz_Calle (1).pdf	2025-12-18 10:01:06.206332	2025-12-18 11:45:16.480026
\.


--
-- Data for Name: datos_calculo_indicadores; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.datos_calculo_indicadores (id, company_id, periodo, anio, numero_trabajadores, horas_hombre_trabajadas, numero_accidentes_trabajo, dias_perdidos, dias_trabajados, ausencias_laborales, observaciones, created_at, horas_trabajadas, numero_accidentes, dias_ausencia, updated_at) FROM stdin;
\.


--
-- Data for Name: decisiones_revision; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.decisiones_revision (id, revision_id, company_id, tipo, descripcion, justificacion, responsable, fecha_compromiso, recursos_necesarios, seguimiento_requerido, fecha_seguimiento, estado_implementacion, created_at, updated_at, alcance, recurso_necesario, requiere_accion) FROM stdin;
\.


--
-- Data for Name: detalle_verificacion_sgss; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.detalle_verificacion_sgss (id, verificacion_id, worker_id, tipo_trabajador, verificado_eps, verificado_arl, verificado_afp, verificado_ccf, cumple, observacion, agremiacion_nombre, agremiacion_autorizada, seleccion_automatica, trabajador_nombre, trabajador_documento, trabajador_cargo, tipo_vinculacion, es_contratista, eps_reportada, eps_verificada, cumple_eps, arl_reportada, arl_verificada, cumple_arl, afp_reportada, afp_verificada, cumple_afp, ccf_reportada, ccf_verificada, cumple_ccf, pila_periodo_desde, pila_periodo_hasta, pila_archivo_url, evidencia_url, observaciones, created_at) FROM stdin;
199994a5-dd89-472f-8691-ee059dd661ae	e0d23c9d-8221-42c0-87ad-e0fadbad9f04	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	empleado	t	t	t	t	t	\N	\N	f	t	\N	\N	\N	\N	f	\N	\N	f	\N	\N	f	\N	\N	f	\N	\N	f	\N	\N	\N	\N	\N	2025-12-18 21:52:39.713745
2d461ec1-9106-4982-8a78-efa01c0d480e	e0d23c9d-8221-42c0-87ad-e0fadbad9f04	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	empleado	f	f	f	f	f	\N	Seguros de Riesgos Laborales SURA	f	t	\N	\N	\N	\N	f	\N	\N	f	\N	\N	f	\N	\N	f	\N	\N	f	\N	\N	\N	\N	\N	2025-12-18 21:52:40.340383
\.


--
-- Data for Name: documentos_proveedores; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.documentos_proveedores (id, company_id, proveedor_id, tipo_documento, nombre_documento, archivo_url, fecha_emision, fecha_vencimiento, vigente, observaciones, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: drivers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.drivers (id, company_id, worker_id, name, identification_number, license_number, license_type, license_expiry, blood_type, emergency_contact, emergency_phone, medical_exam_expiry, status, observations, created_at) FROM stdin;
\.


--
-- Data for Name: email_notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.email_notifications (id, company_id, worker_id, type, reference_id, scheduled_date, sent_date, status, recipient_email, subject, error_message, created_at) FROM stdin;
\.


--
-- Data for Name: environmental_measurements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.environmental_measurements (id, company_id, measurement_type, area, measurement_date, measured_by, value_numeric, unit, legal_limit, equipment, calibration_date, temperature, humidity, status, observations, corrective_actions, report_url, report_name, created_at) FROM stdin;
\.


--
-- Data for Name: especificaciones_tecnicas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.especificaciones_tecnicas (id, company_id, solicitud_id, nombre_especificacion, descripcion, tipo_especificacion, es_obligatoria, norma_referencia, cumplimiento, evidencia, observaciones, created_at) FROM stdin;
\.


--
-- Data for Name: estandares_sst; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.estandares_sst (id, componente_id, numero_estandar, nombre, descripcion, marco_legal, puntaje_tipo1, puntaje_tipo2, puntaje_tipo3, puntaje_tipo4, criterios_verificacion, orden, activo) FROM stdin;
std-1.1.1	comp-sst-1	1.1.1	Responsable del Sistema de Gestión de Seguridad y Salud en el Trabajo SG-SST	Asignar y comunicar a un responsable del SG-SST quien debe dar cuenta de manera periódica a la alta dirección de su funcionamiento y resultados.	Decreto 1072 de 2015, artículo 2.2.4.6.8, numeral 1	5	5	5	5	Documento que contenga la asignación y comunicación del responsable del SG-SST	1	1
std-1.1.2	comp-sst-1	1.1.2	Responsabilidades en el Sistema de Gestión de Seguridad y Salud en el Trabajo – SG-SST	Asignar responsabilidades específicas en Seguridad y Salud en el Trabajo (SST) a los distintos niveles de la organización.	Decreto 1072 de 2015, artículo 2.2.4.6.8, numeral 2	5	5	5	5	Documentos que contengan la asignación de responsabilidades específicas	2	1
std-3.1.1	comp-sst-3	3.1.1	Evaluación Médica Ocupacional	Realizar evaluaciones médicas ocupacionales (ingreso, periódicas, retiro) acorde con la identificación de peligros.	Resolución 2346 de 2007, Decreto 1072 de 2015 art 2.2.4.6.24	10	10	10	10	Documentos de evaluaciones médicas ocupacionales y restricciones	4	1
std-4.1.1	comp-sst-4	4.1.1	Identificación de peligros, evaluación y valoración de riesgos	Identificar los peligros, evaluar y valorar los riesgos con participación de todos los niveles de la empresa.	Decreto 1072 de 2015, artículos 2.2.4.6.15 y 2.2.4.6.23, GTC 45	40	40	40	40	Matriz de identificación de peligros, evaluación y valoración de riesgos actualizada	5	1
std-5.1.1	comp-sst-5	5.1.1	Plan de prevención, preparación y respuesta ante emergencias	Implementar y mantener un plan de prevención, preparación y respuesta ante emergencias.	Decreto 1072 de 2015, artículo 2.2.4.6.25	10	10	10	10	Plan de emergencias documentado y socializado	6	1
std-6.1.1	comp-sst-6	6.1.1	Auditoría anual	Realizar una auditoría anual del cumplimiento del Sistema de Gestión de la Seguridad y Salud en el Trabajo.	Decreto 1072 de 2015, artículo 2.2.4.6.29	\N	\N	10	10	Informe de auditoría anual del SG-SST	7	1
std-7.1.1	comp-sst-7	7.1.1	Acciones preventivas y correctivas	Definir e implementar acciones preventivas y correctivas con base en los resultados del SG-SST.	Decreto 1072 de 2015, artículo 2.2.4.6.33	5	5	5	5	Registro de acciones preventivas y correctivas implementadas	8	1
std-1.1.3	comp-sst-1	1.1.3	Asignación de recursos para el Sistema de Gestión en Seguridad y Salud en el Trabajo – SG-SST	Asignar recursos económicos, técnicos y el personal necesario para el diseño, implementación, revisión evaluación y mejora de las medidas de prevención y control, para la gestión eficaz de los peligros y riesgos en el lugar de trabajo.	Decreto 1072 de 2015, artículo 2.2.4.6.8, numeral 4	\N	5	5	5	Documento soporte con la asignación y disponibilidad de recursos	3	1
std-1.1.4	comp-sst-1	1.1.4	Afiliación al Sistema General de Riesgos Laborales	Garantizar que todos los trabajadores, independientemente de su forma de vinculación o contratación están afiliados al Sistema General de Riesgos Laborales.	Decreto 1072 de 2015, artículo 2.2.4.2.2.6; Ley 1562 de 2012	5	5	5	5	Soportes de afiliación a la ARL de todos los trabajadores	4	1
std-1.1.5	comp-sst-1	1.1.5	Pago de pensión trabajadores de alto riesgo	Identificar los trabajadores que se dediquen en forma permanente al ejercicio de las actividades de alto riesgo establecidas en el Decreto 2090 de 2003 o de las normas que lo adicionen, modifiquen o complementen y cotizar el monto establecido en la norma.	Decreto 2090 de 2003; Decreto 1072 de 2015	\N	\N	5	5	Soportes del pago de aportes al Sistema General de Pensiones por actividades de alto riesgo	5	1
std-1.1.6	comp-sst-1	1.1.6	Conformación COPASST / Vigía	Conformar y garantizar el funcionamiento del Comité Paritario de Seguridad y Salud en el Trabajo – COPASST (empresas con 10 o más trabajadores) o el Vigía en Seguridad y Salud en el Trabajo (empresas con menos de 10 trabajadores).	Decreto 1072 de 2015, artículo 2.2.4.6.8, numeral 9; Resolución 2013 de 1986	5	5	5	5	Acta de conformación del COPASST o documento de designación del Vigía SST; Actas de reuniones del COPASST o soportes de gestión del Vigía	6	1
std-1.1.7	comp-sst-1	1.1.7	Capacitación COPASST / Vigía	Garantizar que todos los integrantes del COPASST o el Vigía de SST reciban una capacitación de mínimo veinte (20) horas en Seguridad y Salud en el Trabajo.	Decreto 1072 de 2015; Resolución 2013 de 1986	\N	5	5	5	Certificados de capacitación de mínimo 20 horas en SST para los integrantes del COPASST o Vigía	7	1
std-1.1.8	comp-sst-1	1.1.8	Conformación Comité de Convivencia Laboral	Conformar y garantizar el funcionamiento del Comité de Convivencia Laboral de acuerdo con la normatividad vigente.	Resolución 652 de 2012; Resolución 1356 de 2012	\N	5	5	5	Acta de conformación del Comité de Convivencia Laboral; Actas de reuniones trimestrales del Comité	8	1
std-1.2.1	comp-sst-1	1.2.1	Programa de capacitación anual en promoción y prevención PYP	Elaborar y ejecutar el programa de capacitación anual en promoción y prevención, que incluya lo referente a los peligros/riesgos prioritarios y las medidas de prevención y control, extensivo a todos los niveles de la organización.	Decreto 1072 de 2015, artículo 2.2.4.6.11	\N	20	20	20	Programa de capacitación anual y ejecutoria del mismo; Registro de asistencia de los trabajadores	9	1
std-1.2.2	comp-sst-1	1.2.2	Capacitación, Inducción y Reinducción en Sistema de Gestión de Seguridad y Salud en el Trabajo SG-SST, actividades de Promoción y Prevención PyP	Realizar la inducción y reinducción en los aspectos generales y específicos de las actividades por realizar que incluya entre otros, la identificación de peligros y control de los riesgos en su trabajo, y la prevención de accidentes de trabajo y enfermedades laborales.	Decreto 1072 de 2015, artículo 2.2.4.6.11	\N	20	20	20	Registros de inducción y reinducción en SST; Contenido de la inducción y reinducción	10	1
std-2.2.1	comp-sst-2	2.2.1	Objetivos definidos, claros, medibles, cuantificables, con metas, documentados, revisados del SG-SST	Definir los objetivos del SG-SST de conformidad con la política de SST, los cuales deben ser claros, medibles, cuantificables y tener metas, coherentes con el plan de trabajo anual, compatibles con la normatividad vigente.	Decreto 1072 de 2015, artículo 2.2.4.6.7 y 2.2.4.6.18	\N	10	10	10	Objetivos del SG-SST documentados; Indicadores de cumplimiento de los objetivos	13	1
std-2.5.1	comp-sst-2	2.5.1	Archivo o retención documental del Sistema de Gestión en Seguridad y Salud en el Trabajo SG-SST	Mantener disponibles y debidamente actualizados todos los documentos que soportan el SG-SST y garantizar la conservación de los mismos de conformidad con la normatividad vigente.	Decreto 1072 de 2015, artículo 2.2.4.6.13	\N	\N	20	20	Sistema de archivo y retención documental del SG-SST; Procedimiento de control de documentos	16	1
std-2.7.1	comp-sst-2	2.7.1	Matriz legal	Identificar la normatividad vigente en materia de SST, el Sistema General de Riesgos Laborales y mantenerla actualizada.	Decreto 1072 de 2015, artículo 2.2.4.6.8, numeral 5	\N	\N	20	20	Matriz legal actualizada; Procedimiento de identificación y actualización de requisitos legales	18	1
std-2.8.1	comp-sst-2	2.8.1	Mecanismos de comunicación, auto reporte en Sistema de Gestión de Seguridad y Salud en el Trabajo SG-SST	Establecer mecanismos eficaces para recibir y dar respuesta a las comunicaciones internas y externas relativas a la SST, así como para disponer de canales que permitan recolectar inquietudes, ideas y aportes de los trabajadores.	Decreto 1072 de 2015, artículo 2.2.4.6.14	\N	\N	10	10	Mecanismos de comunicación implementados; Registros de comunicaciones internas y externas en SST	19	1
std-2.9.1	comp-sst-2	2.9.1	Identificación, evaluación, para adquisición de productos y servicios en Sistema de Gestión de Seguridad y Salud en el Trabajo SG-SST	Establecer un procedimiento para la identificación y evaluación de las especificaciones en SST de las compras o adquisición de productos y servicios de proveedores y contratistas.	Decreto 1072 de 2015, artículo 2.2.4.6.27	\N	\N	10	10	Procedimiento de adquisiciones con criterios de SST; Especificaciones técnicas de SST en compras	20	1
std-2.10.1	comp-sst-2	2.10.1	Evaluación y selección de proveedores y contratistas	Establecer los aspectos de SST que podrá tener en cuenta la empresa en la evaluación y selección de proveedores y contratistas.	Decreto 1072 de 2015, artículo 2.2.4.6.28	\N	\N	20	20	Procedimiento de evaluación y selección de proveedores y contratistas con criterios de SST; Registros de evaluación	21	1
std-2.11.1	comp-sst-2	2.11.1	Gestión del cambio	Disponer de un procedimiento para evaluar el impacto sobre la SST que puedan generar los cambios internos o externos.	Decreto 1072 de 2015, artículo 2.2.4.6.26	\N	\N	10	10	Procedimiento de gestión del cambio; Registros de análisis de cambios y su impacto en SST	22	1
std-3.1.2	comp-sst-3	3.1.2	Actividades de Promoción y Prevención en Salud	Desarrollar actividades de promoción de la salud y prevención de accidentes de trabajo y enfermedades laborales.	Decreto 1072 de 2015, artículo 2.2.4.6.8, numeral 8	\N	10	10	10	Programa de promoción y prevención; Registros de actividades desarrolladas	24	1
std-3.1.3	comp-sst-3	3.1.3	Información al médico de los perfiles de cargo	Informar al médico que realiza las evaluaciones ocupacionales los perfiles de cargo con una descripción de las tareas y el medio en el cual se desarrollará la labor respectiva.	Resolución 2346 de 2007; Decreto 1072 de 2015	\N	\N	10	10	Perfiles de cargo con descripción de tareas y riesgos; Comunicación al médico de los perfiles	25	1
std-3.1.4	comp-sst-3	3.1.4	Realización de los exámenes médicos ocupacionales: pre ingreso, periódicos	Realizar los exámenes médicos ocupacionales de ingreso, periódicos conforme a lo establecido en la normatividad y los riesgos a los que están expuestos los trabajadores.	Resolución 2346 de 2007; Resolución 1918 de 2009	\N	\N	10	10	Registros de exámenes médicos de ingreso y periódicos; Cronograma de exámenes periódicos	26	1
std-3.1.5	comp-sst-3	3.1.5	Custodia de Historias Clínicas	Tener la custodia de las historias clínicas a cargo de una institución prestadora de servicios en SST o del médico que practica los exámenes laborales.	Resolución 2346 de 2007; Resolución 1918 de 2009	\N	\N	10	10	Certificado de custodia de historias clínicas; Contrato con IPS para custodia de historias	27	1
std-3.1.6	comp-sst-3	3.1.6	Restricciones y recomendaciones médico laborales	Acatar las restricciones y recomendaciones médico laborales realizadas por parte de la Entidad Promotora de Salud (EPS) o Administradora de Riesgos Laborales (ARL).	Decreto 1072 de 2015; Ley 776 de 2002	\N	\N	10	10	Registros de restricciones y recomendaciones médicas; Soportes de seguimiento a recomendaciones	28	1
std-3.1.7	comp-sst-3	3.1.7	Estilos de vida y entornos saludables (controles tabaquismo, alcoholismo, farmacodependencia y otros)	Elaborar y ejecutar un programa para promover entre los trabajadores estilos de vida saludables.	Decreto 1072 de 2015; Resolución 1075 de 1992; Ley 1335 de 2009	\N	\N	10	10	Programa de estilos de vida saludables; Política de prevención de consumo de sustancias psicoactivas	29	1
std-3.1.8	comp-sst-3	3.1.8	Agua potable, servicios sanitarios y disposición de basuras	Contar con un suministro permanente de agua potable, servicios sanitarios y mecanismos para disposición de excretas y de basuras en las instalaciones de la empresa.	Resolución 2400 de 1979; Decreto 1072 de 2015	\N	\N	10	10	Certificado de potabilidad del agua; Verificación de servicios sanitarios; Plan de gestión de residuos	30	1
std-3.1.9	comp-sst-3	3.1.9	Eliminación adecuada de residuos sólidos, líquidos o gaseosos	Eliminar de forma segura los residuos sólidos, líquidos o gaseosos que se originen en los lugares de trabajo, de acuerdo con la normatividad vigente.	Decreto 4741 de 2005; Resolución 1164 de 2002; Decreto 1076 de 2015	\N	\N	10	10	Plan de gestión integral de residuos; Registros de disposición de residuos peligrosos	31	1
std-2.3.1	comp-sst-2	2.3.1	Evaluación Inicial del Sistema de Gestión	Realizar la evaluación inicial del Sistema de Gestión de SST, identificando las prioridades para establecer el plan de trabajo anual o para la actualización del existente.	Decreto 1072 de 2015, artículo 2.2.4.6.16	\N	\N	10	10	Evaluación inicial del SG-SST; Identificación de prioridades en SST; Autoevaluación de estándares mínimos	14	1
std-2.6.1	comp-sst-2	2.6.1	Rendición de cuentas	Realizar anualmente la rendición de cuentas del desarrollo del SG-SST, que incluya a todos los niveles de la empresa.	Decreto 1072 de 2015, artículo 2.2.4.6.8, numeral 3	\N	\N	10	10	Documento de rendición de cuentas anual; Evidencia de participación de los diferentes niveles	17	1
std-3.2.1	comp-sst-3	3.2.1	Reporte de los accidentes de trabajo y enfermedad laboral a la ARL, EPS y Dirección Territorial del Ministerio de Trabajo	Reportar a la Administradora de Riesgos Laborales (ARL), Entidad Promotora de Salud (EPS) y la Dirección Territorial del Ministerio del Trabajo los accidentes de trabajo y enfermedades laborales.	Decreto 1072 de 2015, artículo 2.2.4.1.6; Resolución 156 de 2005	\N	20	20	20	FURAT diligenciados y radicados; Registros de reporte de enfermedades laborales	32	1
std-3.2.2	comp-sst-3	3.2.2	Investigación de Accidentes, Incidentes y Enfermedad Laboral	Investigar los accidentes de trabajo y enfermedades laborales, determinando las causas básicas e inmediatas y la posibilidad que se presenten nuevos casos.	Resolución 1401 de 2007; Decreto 1072 de 2015, artículo 2.2.4.6.32	\N	20	20	20	Informes de investigación de accidentes e incidentes; Análisis de causalidad; Planes de acción	33	1
std-3.2.3	comp-sst-3	3.2.3	Registro y análisis estadístico de Incidentes, Accidentes de Trabajo y Enfermedad Laboral	Llevar registro estadístico de los accidentes de trabajo, enfermedades laborales e incidentes que ocurren, y analizar este registro para identificar tendencias, causas o patrones.	Decreto 1072 de 2015, artículo 2.2.4.6.21	\N	\N	10	10	Base de datos de accidentalidad; Análisis estadístico de accidentes; Informes de tendencias	34	1
std-3.3.1	comp-sst-3	3.3.1	Medición de la severidad de los Accidentes de Trabajo y Enfermedad Laboral	Medir la severidad de los accidentes de trabajo como mínimo una vez al año y realizar la clasificación del origen del peligro/riesgo que los generó.	Decreto 1072 de 2015, artículo 2.2.4.6.21; Resolución 0312 de 2019	\N	\N	10	10	Cálculo del índice de severidad; Análisis de severidad por tipo de lesión	35	1
std-3.3.2	comp-sst-3	3.3.2	Medición de la frecuencia de los Incidentes, Accidentes de Trabajo y Enfermedad Laboral	Medir la frecuencia de los incidentes, accidentes de trabajo y enfermedad laboral como mínimo una vez al año.	Decreto 1072 de 2015, artículo 2.2.4.6.21; Resolución 0312 de 2019	\N	\N	10	10	Cálculo del índice de frecuencia; Análisis de frecuencia por área y proceso	36	1
std-3.3.3	comp-sst-3	3.3.3	Medición de la mortalidad de Accidentes de Trabajo y Enfermedad Laboral	Medir la mortalidad por accidentes de trabajo y enfermedades laborales como mínimo una vez al año.	Decreto 1072 de 2015, artículo 2.2.4.6.21; Resolución 0312 de 2019	\N	\N	10	10	Cálculo del índice de mortalidad; Análisis de eventos mortales	37	1
std-3.3.4	comp-sst-3	3.3.4	Medición de la prevalencia de incidentes, Accidentes de Trabajo y Enfermedad Laboral	Medir la prevalencia de la enfermedad laboral como mínimo una vez al año.	Decreto 1072 de 2015, artículo 2.2.4.6.21; Resolución 0312 de 2019	\N	\N	10	10	Cálculo de la prevalencia de enfermedad laboral; Análisis por tipo de enfermedad	38	1
std-3.3.5	comp-sst-3	3.3.5	Medición de la incidencia de Accidentes de Trabajo y Enfermedad Laboral	Medir la incidencia de la enfermedad laboral como mínimo una vez al año.	Decreto 1072 de 2015, artículo 2.2.4.6.21; Resolución 0312 de 2019	\N	\N	10	10	Cálculo de la incidencia de enfermedad laboral; Análisis de nuevos casos	39	1
std-3.3.6	comp-sst-3	3.3.6	Medición del ausentismo por incidentes, Accidentes de Trabajo y Enfermedad Laboral	Medir el ausentismo por incidentes, accidentes de trabajo y enfermedad laboral como mínimo una vez al año.	Decreto 1072 de 2015, artículo 2.2.4.6.21; Resolución 0312 de 2019	\N	\N	10	10	Cálculo del índice de ausentismo laboral; Análisis de días perdidos por causa	40	1
std-4.1.2	comp-sst-4	4.1.2	Identificación de peligros con participación de todos los niveles de la empresa	Realizar la identificación de peligros y evaluación y valoración de los riesgos con participación de los trabajadores de todos los niveles de la empresa.	Decreto 1072 de 2015, artículo 2.2.4.6.15, parágrafo 1	\N	40	40	40	Registros de participación de trabajadores en identificación de peligros; Actas de reuniones con trabajadores	42	1
std-4.1.3	comp-sst-4	4.1.3	Identificación y priorización de la naturaleza de los peligros (Metodología adicional, cancerígenos y otros)	Identificar la naturaleza de los peligros, priorizando los cancerígenos, tóxicos para la reproducción, neurotóxicos, inmunológicos, dermatotóxicos, sensibilizantes, genotóxicos, entre otros.	Decreto 1072 de 2015; Resolución 0312 de 2019; Ley 55 de 1993	\N	\N	30	30	Matriz de sustancias químicas con clasificación de peligrosidad; Priorización de sustancias cancerígenas	43	1
std-4.1.4	comp-sst-4	4.1.4	Realización mediciones ambientales, químicos, físicos y biológicos	Realizar mediciones ambientales cuando se requiera según la priorización de los riesgos, para dar cumplimiento a la identificación de peligros y valoración de riesgos.	Decreto 1072 de 2015, artículo 2.2.4.6.15; Resolución 2400 de 1979	\N	\N	40	40	Informes de mediciones ambientales (ruido, iluminación, material particulado, etc.); Estudios higiénicos	44	1
std-4.2.1	comp-sst-4	4.2.1	Se implementan las medidas de prevención y control de peligros	Ejecutar las medidas de prevención y control según la jerarquía de controles (eliminación, sustitución, controles de ingeniería, controles administrativos, equipos y elementos de protección personal y colectivo).	Decreto 1072 de 2015, artículo 2.2.4.6.24	\N	25	25	25	Evidencia de implementación de controles; Seguimiento a la efectividad de controles	45	1
std-4.2.2	comp-sst-4	4.2.2	Se verifica aplicación de las medidas de prevención y control	Verificar la aplicación por parte de la empresa de las medidas de prevención y control.	Decreto 1072 de 2015, artículo 2.2.4.6.24	\N	25	25	25	Registros de verificación de controles implementados; Listas de chequeo de control operacional	46	1
std-4.2.3	comp-sst-4	4.2.3	Hay procedimientos, instructivos, fichas, protocolos	Elaborar procedimientos, instructivos y fichas técnicas de seguridad para las tareas de alto riesgo y de actividades rutinarias.	Decreto 1072 de 2015, artículo 2.2.4.6.24	\N	\N	25	25	Procedimientos de trabajo seguro; Instructivos operacionales; Fichas de seguridad de productos químicos	47	1
std-4.2.4	comp-sst-4	4.2.4	Inspección con el COPASST o Vigía	Realizar inspecciones sistemáticas a las instalaciones, maquinaria o equipos con la participación del COPASST o Vigía de SST.	Decreto 1072 de 2015; Resolución 2013 de 1986	\N	25	25	25	Actas de inspección con participación del COPASST o Vigía; Cronograma de inspecciones	48	1
std-4.2.5	comp-sst-4	4.2.5	Mantenimiento periódico de instalaciones, equipos, máquinas, herramientas	Realizar el mantenimiento periódico de instalaciones, equipos, máquinas y herramientas, de acuerdo con los manuales de uso y los informes de las inspecciones realizadas.	Decreto 1072 de 2015, artículo 2.2.4.6.24; Resolución 2400 de 1979	\N	\N	25	25	Programa de mantenimiento preventivo y correctivo; Registros de mantenimiento de equipos críticos	49	1
std-4.2.6	comp-sst-4	4.2.6	Entrega de Elementos de Protección Personal EPP, se verifica con contratistas y subcontratistas	Suministrar a los trabajadores los elementos de protección personal que se requieran y verificar que sean utilizados, incluyendo los trabajadores en misión y contratistas.	Decreto 1072 de 2015, artículo 2.2.4.6.24; Resolución 2400 de 1979	\N	25	25	25	Matriz de EPP por cargo; Registros de entrega de EPP; Verificación de uso de EPP por contratistas	50	1
std-5.1.2	comp-sst-5	5.1.2	Brigada de prevención conformada, capacitada y dotada	Conformar, capacitar y dotar la brigada de emergencias, primeros auxilios, contra incendios, evacuación, etc., según las necesidades y el tamaño de la empresa.	Decreto 1072 de 2015, artículo 2.2.4.6.25; Ley 1523 de 2012	\N	\N	50	50	Acta de conformación de brigada; Certificados de capacitación de brigadistas; Inventario de dotación de brigada	52	1
std-6.1.2	comp-sst-6	6.1.2	Las empresa adelanta auditoría por lo menos una vez al año	Realizar una auditoría anual, que sea planificada con la participación del COPASST o Vigía de SST.	Decreto 1072 de 2015, artículos 2.2.4.6.29 y 2.2.4.6.30	\N	\N	12	12	Programa de auditoría; Informe de auditoría anual del SG-SST; Plan de acción de hallazgos	54	1
std-6.1.3	comp-sst-6	6.1.3	Revisión anual por la alta dirección, resultados y alcance de la auditoría	Revisar como mínimo una vez al año, por parte de la alta dirección los resultados del SG-SST.	Decreto 1072 de 2015, artículo 2.2.4.6.31	\N	\N	13	13	Acta de revisión por la alta dirección; Informe de revisión gerencial del SG-SST	55	1
std-6.1.4	comp-sst-6	6.1.4	Planificar auditoría con el COPASST	Planificar la auditoría anual del cumplimiento del SG-SST con la participación del COPASST o Vigía.	Decreto 1072 de 2015, artículo 2.2.4.6.29	\N	\N	12	12	Programa de auditoría con participación del COPASST; Acta de planificación de auditoría	56	1
std-7.1.2	comp-sst-7	7.1.2	Toma de medidas correctivas, preventivas y de mejora	Cuando después de la revisión por la Alta Dirección del SG-SST se evidencie que las medidas de prevención y protección relativas a los peligros y riesgos son inadecuadas o pueden dejar de ser eficaces, tomar las medidas correctivas.	Decreto 1072 de 2015, artículo 2.2.4.6.34	\N	\N	25	25	Acta de revisión por dirección con decisiones de mejora; Plan de mejoramiento continuo	58	1
std-7.1.3	comp-sst-7	7.1.3	Ejecución de acciones preventivas, correctivas y de mejora de la investigación de incidentes, accidentes de trabajo y enfermedad laboral	Definir e implementar acciones preventivas y/o correctivas producto de las investigaciones de los incidentes, accidentes de trabajo y enfermedades laborales.	Decreto 1072 de 2015, artículo 2.2.4.6.32; Resolución 1401 de 2007	\N	\N	25	25	Plan de acción de investigaciones; Seguimiento a implementación de medidas de investigaciones	59	1
std-7.1.4	comp-sst-7	7.1.4	Implementar medidas y acciones correctivas de autoridades y de ARL	Implementar las medidas y acciones correctivas producto de requerimientos o recomendaciones de autoridades administrativas y de la Administradora de Riesgos Laborales.	Decreto 1072 de 2015, artículo 2.2.4.6.34	\N	\N	25	25	Registro de requerimientos de autoridades y ARL; Plan de acción de cumplimiento; Evidencia de implementación	60	1
std-1.2.3	comp-sst-1	1.2.3	Responsables del Sistema de Gestión de Seguridad y Salud en el Trabajo SG-SST con curso (50 horas)	El responsable del SG-SST debe realizar un curso de capacitación virtual de cincuenta (50) horas sobre el Sistema de Gestión de la Seguridad y Salud en el Trabajo SG-SST.	Resolución 4927 de 2016; Decreto 1072 de 2015	\N	20	20	20	Solicitar el certificado de aprobación del curso de capacitación virtual de cincuenta (50) horas en SST definido por el Ministerio del Trabajo, expedido a nombre del responsable del Sistema de Gestión de Seguridad y Salud en el Trabajo.	11	1
std-2.1.1	comp-sst-2	2.1.1	Política del Sistema de Gestión de Seguridad y Salud en el Trabajo SG-SST firmada	Política de Seguridad y Salud en el Trabajo firmada, fechada y comunicada al COPASST/Vigía de SST.	Decreto 1072 de 2015, artículo 2.2.4.6.5	10	10	10	10	Solicitar la política del Sistema de Gestión de SST de la empresa y confirmar que cumpla con los aspectos contenidos en el criterio. Validar para la revisión anual de la política como mínimo: fecha de emisión, firmada por el representante legal actual, que estén incluidos los requisitos normativos actuales. Entrevistar a los miembros del COPASST para indagar el conocimiento de la política en SST.	3	1
std-2.4.1	comp-sst-2	2.4.1	Plan Anual de Trabajo	Diseñar y definir un plan de trabajo anual para alcanzar cada uno de los objetivos, en el que se especifiquen metas, actividades claras para su desarrollo, responsables, cronograma y recursos necesarios.	Decreto 1072 de 2015, artículo 2.2.4.6.8, numeral 7 y 2.2.4.6.17	\N	20	20	20	Plan de trabajo anual firmado por el empleador; Cronograma de actividades; Asignación de recursos y responsables	15	1
\.


--
-- Data for Name: evaluaciones_adquisicion; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.evaluaciones_adquisicion (id, company_id, solicitud_id, fecha_evaluacion, evaluador, peligros_identificados, nivel_riesgo, afecta_matriz_riesgos, cumple_normatividad, normas_aplicables, requiere_certificaciones, certificaciones_requeridas, especificaciones_sst, requiere_ficha_tecnica, requiere_hoja_datos, requiere_manual_operacion, controles_necesarios, epp_requerido, capacitacion_requerida, tema_capacitacion, proveedor_evaluado, cumple_requisitos_proveedor, observaciones_proveedor, resultado, puntaje_total, recomendaciones, condiciones_aprobacion, observaciones, created_at, updated_at) FROM stdin;
e6283a4e-b8d7-45f6-8772-e32033bec350	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	e7aafd87-0d9a-4af0-93e8-54c276694805	2025-12-20	Luz Adriana  Diaz Calle	Caída de objetos. Golpes contra estructuras. Contacto con elementos a tensión (si aplica Clase E). Exposición a salpicaduras.	medio	0	1	NTC 1523 - Cascos de seguridad industrial. ANSI/ISEA Z89.1 - Requisitos de rendimiento. Resolución 2400/1979 Art. 177. Decreto 1072/2015 Art. 2.2.4.6.24.	0		Certificación según clase (G, E, C). Sistema de suspensión de 4 puntos mínimo. Banda de sudor reemplazable. Ranuras para accesorios compatibles.	0	0	0	Inspección visual diaria antes de uso. Verificación de grietas, deformaciones o daños. Reemplazo tras impacto fuerte. Almacenamiento adecuado.	Barbuquejo si trabajo en alturas. Gafas de seguridad complementarias. Protección auditiva según ambiente.	0		\N	\N	\N	aprobado	100	Verificar compatibilidad con otros EPP. Capacitar en uso y mantenimiento. Establecer programa de reposición. Registrar entrega y devolución.	\N		2025-12-20 09:49:42.896372	2025-12-20 09:49:42.896372
\.


--
-- Data for Name: evaluaciones_impacto_cambios; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.evaluaciones_impacto_cambios (id, company_id, cambio_id, fecha_evaluacion, evaluador, peligros_identificados, numero_peligros_nuevos, nivel_riesgo_resultante, probabilidad_ocurrencia, severidad_consecuencia, impacto_trabajadores, impacto_instalaciones, impacto_operaciones, impacto_ambiental, causas_riesgo, requiere_controles, recomendacion_general, created_at, updated_at) FROM stdin;
e25885a4-689d-43ff-8195-a371c463c16f	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	c2b9b898-545f-4777-874c-ef2774d753bd	2025-12-23	PRUEBA 1	sdxcfgvbhjn	3	alto	3	4	xsdcfvgbhjk	dsfghjmk	sdfghjk	swedfghj	edrfgthyj	1	sedrftvgbhnj	2025-12-23 11:55:28.096973	2025-12-23 11:55:28.096973
\.


--
-- Data for Name: evaluaciones_proveedores; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.evaluaciones_proveedores (id, company_id, proveedor_id, fecha_evaluacion, tipo_evaluacion, evaluador, puntaje_total, puntaje_maximo, porcentaje_cumplimiento, clasificacion, estado, aprobado, observaciones, recomendaciones, plan_mejora, fecha_proxima_evaluacion, created_at, updated_at) FROM stdin;
8b5ca6fd-7fd0-4120-8393-1129ea849228	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	9c07b565-92e6-4fe2-84c3-d5be7bfe0811	2025-12-17	inicial	Administrador del Sistema	100	100	100	excelente	completada	1				\N	2025-12-17 10:41:28.167023	2025-12-17 11:01:29.207798
fe96689c-eddc-4348-bc05-03f71059c1a4	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	300e7670-90ba-4a08-a848-d75c7b6b970d	2025-12-17	inicial	Administrador del Sistema	46	100	46	deficiente	pendiente	0	No cumple		Cuando tenga toda la documentacion en regla, vuelve	\N	2025-12-17 11:13:32.729234	2025-12-17 11:13:32.729234
\.


--
-- Data for Name: evaluaciones_sst; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.evaluaciones_sst (id, company_id, anio, mes, tipo_empresa, estado, responsable_nombre, responsable_cargo, responsable_licencia, puntaje_total, puntaje_maximo, porcentaje_cumplimiento, nivel_cumplimiento, puntajes_por_componente, fecha_evaluacion, fecha_envio, fecha_limite_plan_mejora, observaciones, version, evaluacion_anterior_id, created_at, updated_at) FROM stdin;
690f3be0-2d35-4397-b3bb-59f782bfac8d	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	2025	12	tipo3	en-progreso	Administrador del Sistema	Responsable SG-SST	\N	45	937	5	critico	{"1":{"obtenido":35,"maximo":100},"2":{"obtenido":0,"maximo":150},"3":{"obtenido":10,"maximo":200},"4":{"obtenido":0,"maximo":300},"5":{"obtenido":0,"maximo":60},"6":{"obtenido":0,"maximo":47},"7":{"obtenido":0,"maximo":80}}	2025-12-10	\N	\N		1	\N	2025-12-10 18:02:19.83862	2025-12-25 21:12:50.407913
\.


--
-- Data for Name: evs_activities; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.evs_activities (id, company_id, program_id, category, custom_category, title, description, objective, methodology, scheduled_date, execution_date, start_time, end_time, location, modality, facilitator_name, facilitator_position, external_provider, target_population, estimated_participants, actual_participants, coverage_percentage, status, observations, lessons_learned, created_by, created_at, updated_at, meeting_link) FROM stdin;
156d4b34-bb3f-4f60-bd98-b9d1d7b11b1d	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	1c132893-ed1a-4b83-a25e-9c5ce27b0c47	tabaquismo	\N	Charla: Espacios Libres de Humo		Promover estilos de vida libres de tabaco y fortalecer las competencias para la cesación tabáquica, conforme al Estándar 3.1.7 de la Resolución 0312 de 2019.	\N	2025-12-26	2025-12-27	\N	\N	Virtual (En línea)	virtual	Luz Adriana Diaz Calle	\N	\N	\N	20	2	\N	programada	\N	\N	360f5e46-96e8-47a0-9c5b-0bbf1c2cecf1	2025-12-26 18:54:04.680904	2025-12-26 18:54:04.680904	\N
\.


--
-- Data for Name: evs_controls; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.evs_controls (id, company_id, worker_id, program_id, category, control_type, control_date, control_time, location, result, result_details, substance_detected, informed_consent, consent_date, performed_by, performer_position, witness_name, requires_followup, referral_required, referral_entity, observations, is_confidential, created_by, created_at, updated_at) FROM stdin;
de7400c6-c0be-42fa-81a7-42e700a9a911	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	1c132893-ed1a-4b83-a25e-9c5ce27b0c47	alcoholismo	periodico	2025-12-26	\N	\N	positivo		\N	1	\N	Luz Adriana Diaz Calle	\N	\N	1	0	\N		1	360f5e46-96e8-47a0-9c5b-0bbf1c2cecf1	2025-12-26 18:58:53.562969	2025-12-26 18:58:53.562969
\.


--
-- Data for Name: evs_followups; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.evs_followups (id, company_id, worker_id, control_id, incident_id, case_number, category, open_date, initial_assessment, risk_level, intervention_plan, treatment_type, referral_entity, referral_date, worker_commitments, company_commitments, next_review_date, followup_notes, last_followup_date, total_followups, status, close_date, close_reason, outcome, is_confidential, access_log, responsible_professional, created_by, created_at, updated_at) FROM stdin;
77f24169-6d2d-4520-a0f3-568cc46c8b8d	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	1d50f465-71c5-48ff-b365-142863ad5f9a	\N	\N	\N	alcoholismo	2025-12-26		medio		\N	\N	\N	Cumplir con el tratamiento médico prescrito	No discriminación por condición de salud	2026-01-26	\N	\N	0	activo	\N	\N	\N	1	\N	Luz Adriana Diaz Calle	360f5e46-96e8-47a0-9c5b-0bbf1c2cecf1	2025-12-26 21:57:01.346626	2025-12-26 21:57:01.346626
\.


--
-- Data for Name: evs_incidents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.evs_incidents (id, company_id, worker_id, control_id, category, incident_type, incident_date, incident_time, incident_location, description, reported_by, reporter_position, witnesses, immediate_measures, was_removed, medical_assessment, disciplinary_action, requires_followup, commitment_signed, commitment_date, status, closure_date, closure_reason, created_by, created_at, updated_at) FROM stdin;
3f08e072-bcb9-4fb3-bb08-0286b0fb11f1	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	1d50f465-71c5-48ff-b365-142863ad5f9a	\N	alcoholismo	comportamiento_alterado	2025-12-26	22:56	Virtual (En línea)		Luz Adriana Diaz Calle	\N	\N		1	0	\N	1	0	\N	abierto	\N	\N	360f5e46-96e8-47a0-9c5b-0bbf1c2cecf1	2025-12-26 21:56:36.256547	2025-12-26 21:56:36.256547
\.


--
-- Data for Name: evs_participants; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.evs_participants (id, activity_id, worker_id, worker_name, worker_document, worker_area, attended, attendance_date, attendance_time, pre_evaluation, post_evaluation, observations, created_at) FROM stdin;
\.


--
-- Data for Name: evs_programs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.evs_programs (id, company_id, year, name, policy, objectives, scope, diagnostic_summary, identified_risks, priority_areas, responsible_name, responsible_position, responsible_email, approved_budget, executed_budget, start_date, end_date, participation_target, compliance_target, status, approved_by, approved_at, created_by, created_at, updated_at) FROM stdin;
1c132893-ed1a-4b83-a25e-9c5ce27b0c47	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	2025	Programa EVS 2025	La empresa se compromete a promover estilos de vida saludables, previniendo el consumo de tabaco, alcohol y sustancias psicoactivas, fomentando la actividad física y el bienestar integral de todos los trabajadores.	1. Reducir factores de riesgo asociados al consumo de sustancias psicoactivas\n2. Promover hábitos de vida saludable\n3. Detectar de manera temprana casos de consumo problemático\n4. Brindar apoyo y acompañamiento a trabajadores en proceso de recuperación	Todos los trabajadores de la empresa	\N	\N	{Tabaquismo,Alcoholismo,Farmacodependencia,"Actividad Física","Salud Mental"}	Luz Adriana Diaz Calle	Analista de Recursos Humanos	sg.sst.cumplimiento@gmail.com	3000000.00	1000000.00	2025-01-01	2025-12-31	80	90	activo	\N	\N	360f5e46-96e8-47a0-9c5b-0bbf1c2cecf1	2025-12-26 18:18:47.904476	2025-12-26 18:18:47.904476
\.


--
-- Data for Name: hallazgos_auditoria; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.hallazgos_auditoria (id, company_id, auditoria_id, numero_hallazgo, tipo, severidad, descripcion, requisito, clausula_referencia, area_afectada, evidencia, archivo_evidencia, causa_raiz, detectado_por, detectado_por_id, fecha_deteccion, responsable_area, responsable_area_id, estado_cierre, fecha_cierre, verificado_por, verificado_por_id, observaciones_cierre, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: hazardous_substances; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.hazardous_substances (id, company_id, commercial_name, chemical_name, cas_number, hazard_class, storage_location, usage_area, quantity, unit, supplier, emergency_phone, sds_url, sds_name, sds_update_date, control_measures, required_ppe, is_active, observations, created_at) FROM stdin;
\.


--
-- Data for Name: high_risk_workers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.high_risk_workers (id, company_id, worker_id, actividad_riesgo, descripcion_actividad, fecha_inicio, fecha_fin, porcentaje_cotizacion_especial, ultimo_mes_pagado, cumple_cotizacion, soporte_pila_url, observaciones, created_at) FROM stdin;
85f7f7e6-4fd3-4f8b-8de7-7787a0f42e4e	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	mineria_subterranea	\N	\N	\N	10	2025-12	f			2025-12-18 21:52:55.222335
\.


--
-- Data for Name: historial_comunicaciones_sst; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.historial_comunicaciones_sst (id, company_id, entidad, entidad_id, accion, descripcion, user_id, nombre_usuario, rol_usuario, campo_modificado, valor_anterior, valor_nuevo, ip_address, user_agent, created_at) FROM stdin;
a3269123-3328-4a0e-b4c1-b0e5ed76dc11	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	plan	f46eb2c4-885d-4834-96b4-e1844d1386b7	crear	Plan de comunicación SST creado: v1.0	360f5e46-96e8-47a0-9c5b-0bbf1c2cecf1	Administrador del Sistema	admin	\N	\N	{"version":"1.0","estado":"vigente"}	\N	\N	2025-12-16 21:13:15.108796
5a5401af-01a5-4b1f-be70-a5ea40657d29	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	comunicacion	01cf399a-4ede-4134-8095-8931aba02e80	enviar	Comunicación enviada: Escalera Dañada (informativo)	360f5e46-96e8-47a0-9c5b-0bbf1c2cecf1	Administrador del Sistema	admin	\N	\N	{"asunto":"Escalera Dañada","tipo":"informativo"}	\N	\N	2025-12-19 07:39:26.299958
\.


--
-- Data for Name: hojas_seguridad; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.hojas_seguridad (id, company_id, solicitud_id, nombre_producto, nombre_comercial, fabricante, proveedor, numero_onu, numero_cas, clasificacion_peligro, pictogramas, palabra_advertencia, indicaciones_peligro, consejos_seguridad, componentes_peligrosos, concentracion, primerosauxilios, medidas_lucha_incendios, medidas_vertides_accidentales, precauciones_manipulacion, condiciones_almacenamiento, proteccion_respiratoria, proteccion_manos, proteccion_ojos, proteccion_cuerpo, archivo_msds_url, archivo_ficha_tecnica_url, fecha_emision, fecha_revision, version, observaciones, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: indicadores_sst; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.indicadores_sst (id, company_id, objetivo_id, tipo, nombre, definicion, interpretacion, formula, fuente_informacion, meta, valor_meta, unidad_medida, frecuencia_medicion, responsables, es_calculo_automatico, codigo_calculo, normas_relacionadas, activo, created_at, updated_at) FROM stdin;
767e6058-ae68-4c54-9334-e2db81cdd1fa	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	0cb039e9-4e94-4623-b197-c02ce873aee9	estructura	Cobertura del Sistema de Gestión SST	Mide el porcentaje de trabajadores cubiertos por el Sistema de Gestión de SST implementado	Un valor del 100% indica que todos los trabajadores están cubiertos por el SG-SST. Valores inferiores requieren acciones de inclusión.	(Trabajadores cubiertos por SG-SST / Total de trabajadores) * 100	Registros de personal y documentos del SG-SST	100%	\N	%	trimestral	Luz Adriana Diaz Calle - Analista de Recursos Humanos	0			1	2025-12-14 15:27:36.103861	2025-12-14 15:27:36.103861
34b0d86f-4005-411b-a38d-9e28b0a29eb5	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	\N	proceso	Cumplimiento del Plan Anual de Trabajo SST	Porcentaje de actividades ejecutadas del Plan Anual de Trabajo en SST respecto a las planificadas	Indica el nivel de ejecución del plan. Valores por debajo del 80% requieren análisis de causas y acciones correctivas.	(Actividades SST ejecutadas / Actividades SST planificadas) * 100	Plan Anual de Trabajo SST y registros de ejecución	≥ 90%	\N	%	trimestral	Luz Adriana Diaz Calle - Analista de Recursos Humanos	0			1	2025-12-15 17:24:02.047468	2025-12-15 17:24:02.047468
1c94bfe6-61d0-48f7-a51c-0e28b9297881	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	\N	proceso	Cumplimiento implementación: Cambio Funcional 62-H80	Verificar cumplimiento del plan de implementación del cambio tipo interno - personal	Porcentaje de actividades completadas según el cronograma del cambio. 100% indica implementación completa.	(Actividades completadas / Total actividades planificadas) × 100	Sistema de Gestión de Cambios SST - Módulo de Seguimiento	≥ 100%	100	%	mensual	Luz Adriana Diaz Calle	0	\N	\N	1	2025-12-23 11:56:41.210641	2025-12-23 11:56:41.210641
\.


--
-- Data for Name: inspecciones_peligros_vinculados; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inspecciones_peligros_vinculados (id, company_id, inspeccion_id, peligro_id, estado_control, hallazgos, evidencia_fotografica, verificado_por, fecha_verificacion, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: inspecciones_recursos_emergencia; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inspecciones_recursos_emergencia (id, recurso_id, inspector_id, fecha_inspeccion, tipo_inspeccion, resultado, checklist_items, hallazgos, acciones_correctivas, fecha_proxima_inspeccion, observaciones, created_at) FROM stdin;
\.


--
-- Data for Name: inspections; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inspections (id, company_id, area, inspector, date, findings, compliance, observations, status, created_at) FROM stdin;
57c111d8-84dc-4be4-9e19-5dacc0e4a1c7	76050645-7d63-46af-953b-bc86727b596f	Producción	María López	2024-11-10	3	85	Se encontraron 3 hallazgos menores: falta señalización en zona de carga, EPP incompleto en 2 trabajadores, extintor vencido en área norte.	aprobada	2025-12-02 14:45:18.355871
af75bcea-4d50-475e-b6cc-0a598d657c72	76050645-7d63-46af-953b-bc86727b596f	Mantenimiento	Carlos Rodríguez	2024-11-18	2	90	Área en buen estado general. Hallazgos: orden y aseo mejorable, guardas de seguridad en máquinas requieren mantenimiento.	aprobada	2025-12-02 14:45:18.355871
50199cb2-5267-4590-aea9-86154b4adf86	76050645-7d63-46af-953b-bc86727b596f	Almacén	María López	2024-11-25	5	75	Se requiere atención urgente: estibas en mal estado, pasillos obstruidos, iluminación deficiente, falta señalización de emergencia, capacidad de carga excedida en racks.	pendiente	2025-12-02 14:45:18.355871
60e2a90b-9fb8-4a2b-a45d-c48bc14337ea	76050645-7d63-46af-953b-bc86727b596f	Oficinas	Ana Martínez	2024-12-01	1	95	Excelente cumplimiento. Único hallazgo: cables de equipos sin canalizar en algunos puestos.	aprobada	2025-12-02 14:45:18.355871
\.


--
-- Data for Name: internal_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.internal_messages (id, company_id, sender_id, sender_name, sender_role, receiver_id, receiver_name, receiver_role, subject, content, status, priority, related_entity, related_entity_id, created_at, read_at, archived_at) FROM stdin;
35cc9c13-55c2-4f72-9d7e-812b278d65f9	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	360f5e46-96e8-47a0-9c5b-0bbf1c2cecf1	Administrador del Sistema	admin	99eceb20-9a45-4fb2-8f26-8bb5aad4e7aa	Coordinador SST Demo	coordinador_sst	No puedo crear un trabajador	Soy feliz......	unread	normal	\N	\N	2025-12-16 22:05:31.470657	\N	\N
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.invoices (id, company_id, subscription_id, transaction_id, invoice_number, status, subtotal, tax_amount, total, currency, period_start, period_end, issue_date, due_date, paid_date, customer_name, customer_nit, customer_email, customer_address, line_items, dian_cufe, dian_xml_url, dian_pdf_url, pdf_url, email_sent_at, email_sent_to, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: job_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.job_profiles (id, company_id, name, description, risk_class, risk_factors, physical_demands, mental_demands, required_ppe, required_exams, exam_frequency_months, required_trainings, linked_role, is_active, created_at) FROM stdin;
a288b46a-94f1-478c-b2ec-eb6d6d5c87e9	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	Almacenista	Recibir y despachar mercancías, organizar inventario, operar montacargas, verificar estado de productos, mantener registros de movimientos.	II	{"Levantamiento de cargas","Atrapamiento por estanterías","Caídas de objetos","Riesgo vial (montacargas)","Posturas forzadas"}	Trabajo físico moderado a alto, levantamiento y transporte de cargas, trabajo de pie prolongado, operación de montacargas	Organización, atención al detalle, manejo de inventarios, cumplimiento de procedimientos	{"Calzado de seguridad con puntera","Faja ergonómica","Guantes de seguridad","Chaleco reflectivo"}	{"Examen médico ocupacional general","Valoración osteomuscular","Evaluación visual"}	24	{"Manejo seguro de cargas","Operación de montacargas","Prevención de riesgos en almacenes","Primeros auxilios"}	\N	1	2025-12-23 09:47:36.396045
25e671bb-4d49-43c9-8610-bd83ad8cfd4c	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	Analista de Recursos Humanos	Gestionar procesos de selección, administrar nómina, coordinar capacitaciones, atender requerimientos de personal.	I	{"Estrés laboral",Sedentarismo,"Exposición a pantallas"}	Trabajo sedentario en oficina	Análisis de perfiles, comunicación, organización, confidencialidad	{}	{"Examen médico ocupacional general","Evaluación visual"}	24	{"Gestión del talento humano","Legislación laboral","Técnicas de selección"}	\N	1	2025-12-11 06:04:33.785523
de02249e-4f90-4609-ba93-7b806e5fe9b8	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	Analista Financiero	Analizar información financiera, elaborar reportes, proyectar flujos de caja, evaluar inversiones.	I	{"Estrés por plazos",Sedentarismo,"Exposición a pantallas"}	Trabajo sedentario en oficina	Análisis numérico, pensamiento crítico, cumplimiento de plazos	{}	{"Examen médico ocupacional general","Evaluación visual"}	24	{"Análisis financiero","Herramientas de modelación","Normatividad financiera"}	\N	1	2025-12-20 11:52:34.038467
\.


--
-- Data for Name: lecturas_comunicacion; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.lecturas_comunicacion (id, company_id, comunicacion_id, user_id, worker_id, confirmado, fecha_lectura, comentarios, calificacion, created_at) FROM stdin;
348432d1-e283-4f25-a4a0-1343d27e1698	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	01cf399a-4ede-4134-8095-8931aba02e80	\N	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	0	\N	\N	\N	2025-12-19 07:39:26.179429
\.


--
-- Data for Name: matrices_iperc; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.matrices_iperc (id, company_id, nombre, codigo, area, proceso, responsable_evaluacion, responsable_evaluacion_id, cargo_responsable, fecha_evaluacion, fecha_proxima_revision, fecha_aprobacion, estado, version, alcance, metodologia, observaciones, aprobado_por, aprobado_por_id, cargo_aprobador, created_at, updated_at, vigencia_desde, vigencia_hasta, vigente_auto) FROM stdin;
b7bec78c-fd7d-4cc4-8cb8-96cb87169cb7	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	Matriz IPERC 2025 - Administración	IPERC-ADM-2025-001	Administración	Gestión Administrativa	Luz Adriana Diaz Calle	\N	Coordinador SST	2025-12-11	\N	\N	revision	1	Aplica a todas las actividades administrativas, incluyendo trabajo en oficinas, uso de equipos de cómputo y gestión documental.	GTC-45	\N	\N	\N	\N	2025-12-11 17:14:43.065511	2025-12-11 17:14:43.065511	\N	\N	1
f4b1bd88-40db-4c3b-ab99-7554b2dd9ad2	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	Matriz IPERC 2025 - Comercial	IPERC-COM-2025-002	Comercial	Gestión Comercial	Luz Adriana Diaz Calle	\N	Licenciado en Salud Ocupacional	2025-12-11	\N	\N	aprobada	1	Aplica a todas las actividades de almacenamiento, recepción, despacho y manejo de materiales en bodega.	GTC-45	\N	\N	\N	\N	2025-12-11 17:41:15.485196	2025-12-11 17:41:15.485196	\N	\N	1
\.


--
-- Data for Name: matriz_legal; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.matriz_legal (id, company_id, norma, fecha_emision, entidad_emisora, categoria, titulo, descripcion, articulos_aplicables, obligaciones, alcance, estado_cumplimiento, responsable_cumplimiento, periodicidad, evidencias, documento_url, documento_nombre, fecha_ultima_verificacion, fecha_proxima_verificacion, observaciones, planes_accion, created_at, updated_at, validacion_automatica, codigo_validacion, estado_automatico, ultima_validacion_automatica) FROM stdin;
435d47a1-616e-49d4-ab45-d966331c9e77	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	ISO 45001:2018	2018-03-12	ISO - Organización Internacional de Normalización	sistema-gestion	Sistema de Gestión de la Seguridad y Salud en el Trabajo	Estándar internacional para SG-SST, reemplaza OHSAS 18001	\N	Voluntaria - Certificación internacional	Organizaciones que buscan certificación internacional	no-cumple	Alta Dirección / Coordinador SST	Auditorías anuales y recertificación cada 3 años	\N	\N	\N	\N	\N	\N	\N	2025-12-16 18:36:04.876041	2025-12-16 18:36:04.876041	0	\N	\N	\N
e506ec27-8e7b-4431-963f-0629d427bbc4	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	Resolución 2346 de 2007	2007-07-11	Ministerio de la Protección Social	medicina-trabajo	Práctica de Evaluaciones Médicas Ocupacionales	Regula la práctica de evaluaciones médicas ocupacionales y manejo de historias clínicas	\N	Realizar exámenes médicos de ingreso, periódicos, retiro y post-incapacidad	Todos los empleadores	no-cumple	Coordinador SST / RRHH	Según tipo de examen: ingreso, periódico (anual), retiro	\N	\N	\N	\N	\N	\N	\N	2025-12-16 18:36:04.930976	2025-12-16 18:36:04.930976	0	\N	\N	\N
0e0263da-7e07-4218-abd6-890edcab56a6	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	Resolución 1918 de 2009	2009-06-05	Ministerio de la Protección Social	medicina-trabajo	Calificación de Origen de la Enfermedad y el Grado de Pérdida de la Capacidad Laboral	Modificación del Manual Único de Calificación de Invalidez	\N	Aplicar protocolos de calificación según normatividad	Entidades evaluadoras y empresas	no-cumple	Medicina del Trabajo	Según necesidad	\N	\N	\N	\N	\N	\N	\N	2025-12-16 18:36:04.986748	2025-12-16 18:36:04.986748	0	\N	\N	\N
43e02e7b-4155-46d0-b8d3-35f6e629ae7f	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	Resolución 2400 de 1979	1979-05-22	Ministerio del Trabajo	higiene-industrial	Estatuto de Seguridad Industrial	Disposiciones sobre vivienda, higiene y seguridad en los establecimientos de trabajo	\N	Cumplir con condiciones de seguridad e higiene en los lugares de trabajo	Todos los establecimientos de trabajo	no-cumple	Coordinador SST / Mantenimiento	Permanente	\N	\N	\N	\N	\N	\N	\N	2025-12-16 18:36:05.041699	2025-12-16 18:36:05.041699	0	\N	\N	\N
1ffec85d-e957-4397-9609-4149c770aaa3	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	Resolución 2413 de 1979	1979-05-22	Ministerio del Trabajo	higiene-industrial	Reglamento de Higiene y Seguridad para la Industria de la Construcción	Normas de higiene y seguridad específicas para construcción	\N	Aplicar medidas de seguridad en construcción	Empresas del sector construcción	no-cumple	Coordinador SST / Residente de Obra	Permanente durante obras	\N	\N	\N	\N	\N	\N	\N	2025-12-16 18:36:05.095411	2025-12-16 18:36:05.095411	0	\N	\N	\N
513d13b4-06f0-43ba-be4c-1bf96cd7f63b	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	Resolución 1565 de 2014	2014-06-06	Ministerio del Trabajo	seguridad-vial	Guía Metodológica para la Elaboración del Plan Estratégico de Seguridad Vial	Guía para implementar el PESV en empresas	\N	Diseñar e implementar el Plan Estratégico de Seguridad Vial (PESV)	Empresas con flotillas de vehículos	no-cumple	Líder PESV / Coordinador SST	Actualización anual	\N	\N	\N	\N	\N	\N	\N	2025-12-16 18:36:05.150718	2025-12-16 18:36:05.150718	0	\N	\N	\N
9045db1b-156c-4412-a1fa-68a11e8e9dc9	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	Ley 1503 de 2011	2011-12-29	Congreso de la República	seguridad-vial	Promoción de la Formación de Hábitos, Comportamientos y Conductas Seguros en la Vía	Política nacional de seguridad vial	\N	Promover formación en seguridad vial para conductores	Empresas con vehículos y conductores	no-cumple	Líder PESV / RRHH	Capacitaciones anuales	\N	\N	\N	\N	\N	\N	\N	2025-12-16 18:36:05.205586	2025-12-16 18:36:05.205586	0	\N	\N	\N
fe6d04d7-8f72-4919-a710-6c2541cd3c6d	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	Resolución 2646 de 2008	2008-07-17	Ministerio de la Protección Social	riesgo-psicosocial	Factores de Riesgo Psicosocial en el Trabajo	Define factores de riesgo psicosocial y establece responsabilidades	\N	Identificar, evaluar e intervenir los factores de riesgo psicosocial	Todos los empleadores	no-cumple	Coordinador SST / Psicología Organizacional	Evaluación cada 2 años	\N	\N	\N	\N	\N	\N	\N	2025-12-16 18:36:05.260362	2025-12-16 18:36:05.260362	0	\N	\N	\N
ca95e71e-2ec1-4766-8ff0-15711d273b6b	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	Resolución 652 de 2012	2012-04-30	Ministerio del Trabajo	riesgo-psicosocial	Conformación del Comité de Convivencia Laboral	Reglamentación de la conformación y funcionamiento del Comité de Convivencia Laboral	\N	Conformar el Comité de Convivencia Laboral para prevenir acoso laboral	Empresas con 10 o más trabajadores	no-cumple	RRHH / Coordinador SST	Sesiones bimestrales mínimo	\N	\N	\N	\N	\N	\N	\N	2025-12-16 18:36:05.315033	2025-12-16 18:36:05.315033	0	\N	\N	\N
0c754155-cf5c-4337-9939-26aefa8d413d	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	Ley 1010 de 2006	2006-01-23	Congreso de la República	riesgo-psicosocial	Acoso Laboral	Medidas para prevenir, corregir y sancionar el acoso laboral	\N	Prevenir y atender casos de acoso laboral	Todos los empleadores	no-cumple	Comité de Convivencia / RRHH	Permanente	\N	\N	\N	\N	\N	\N	\N	2025-12-16 18:36:05.369742	2025-12-16 18:36:05.369742	0	\N	\N	\N
b7b32e85-afe7-47a5-8bdc-952b1811bab8	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	Resolución 1016 de 1989	1989-03-31	Ministerio del Trabajo	emergencias	Organización, Funcionamiento y Forma de los Programas de Salud Ocupacional	Reglamenta programas de salud ocupacional, incluye plan de emergencias	\N	Conformar brigadas de emergencia y realizar simulacros	Empresas con más de 10 trabajadores	no-cumple	Coordinador SST / Brigada de Emergencias	Simulacros semestrales mínimo	\N	\N	\N	\N	\N	\N	\N	2025-12-16 18:36:05.424343	2025-12-16 18:36:05.424343	0	\N	\N	\N
32085d3a-f5d8-42ca-ba08-10284749c5f3	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	Ley 1523 de 2012	2012-04-24	Congreso de la República	emergencias	Política Nacional de Gestión del Riesgo de Desastres	Sistema Nacional de Gestión del Riesgo de Desastres	\N	Implementar medidas de gestión del riesgo de desastres	Todas las organizaciones públicas y privadas	no-cumple	Alta Dirección / Coordinador SST	Actualización anual del plan	\N	\N	\N	\N	\N	\N	\N	2025-12-16 18:36:05.480454	2025-12-16 18:36:05.480454	0	\N	\N	\N
d7b46ea4-8e54-46a3-a3d3-962ee304a035	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	Decreto 1496 de 2018	2018-08-06	Ministerio del Trabajo	sustancias-quimicas	Sistema Globalmente Armonizado (SGA)	Adopción del SGA de clasificación y etiquetado de productos químicos	\N	Etiquetar productos químicos según SGA y mantener Fichas de Datos de Seguridad (FDS)	Empresas que manejan sustancias químicas	no-cumple	Coordinador SST / Almacén	Actualización de FDS según cambios	\N	\N	\N	\N	\N	\N	\N	2025-12-16 18:36:05.535065	2025-12-16 18:36:05.535065	0	\N	\N	\N
69203dce-cfe6-4f3e-ac21-ec64c481c848	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	Resolución 1409 de 2012	2012-07-23	Ministerio del Trabajo	trabajo-alturas	Reglamento de Seguridad para Protección contra Caídas en Trabajo en Alturas	Establece requisitos para trabajo en alturas con riesgo de caída	\N	Implementar sistema de protección contra caídas y certificar trabajadores	Empresas con trabajo en alturas (>1.50 m)	no-cumple	Coordinador SST / Coordinador de Alturas	Recertificación cada 2 años	\N	\N	\N	\N	\N	\N	\N	2025-12-16 18:36:05.589938	2025-12-16 18:36:05.589938	0	\N	\N	\N
13b5b944-27e9-4c95-969f-641c8820eaf1	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	Decreto 1072 de 2015	2015-05-26	Ministerio del Trabajo	sistema-gestion	Decreto Único Reglamentario del Sector Trabajo	Compilación de la normatividad del sector trabajo, incluye Libro 2 Parte 2 Título 4 Capítulo 6 sobre SG-SST	\N	Cumplir con todo el marco normativo del sector trabajo y SST	Todos los empleadores públicos y privados	no-cumple	Gerencia / Coordinador SST	Permanente	\N	\N	\N	\N	\N	\N	\N	2025-12-16 18:36:04.821105	2025-12-16 18:36:04.821105	1	POLITICA_SST	cumple	2025-12-18 10:54:39.607316
e4529658-9ed6-48c3-9162-3b50f12f51e7	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	Resolución 3673 de 2008	2008-09-26	Ministerio de la Protección Social	trabajo-alturas	Reglamento Técnico de Trabajo Seguro en Alturas	Establece requisitos para trabajo seguro en alturas (Derogada parcialmente por Res. 1409/2012)	\N	Complementaria a Res. 1409 para aspectos técnicos	Empresas con trabajo en alturas	no-cumple	Coordinador SST	Según Res. 1409/2012	\N	\N	\N	\N	\N	\N	\N	2025-12-16 18:36:05.644693	2025-12-16 18:36:05.644693	0	\N	\N	\N
90242e73-a9ef-4bf9-a8d4-0e26fa300249	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	Resolución 491 de 2020	2020-03-24	Ministerio del Trabajo	espacios-confinados	Protocolos de Seguridad para Trabajo en Espacios Confinados	Lineamientos para trabajo seguro en espacios confinados	\N	Implementar protocolos de seguridad para espacios confinados	Empresas con espacios confinados	no-cumple	Coordinador SST / Supervisor de Operaciones	Permanente - Permiso por entrada	\N	\N	\N	\N	\N	\N	\N	2025-12-16 18:36:05.698398	2025-12-16 18:36:05.698398	0	\N	\N	\N
182388ab-51ea-4a7e-b9cb-342dafa8f562	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	Resolución 5018 de 2019	2019-12-20	Ministerio del Trabajo	seguridad-electrica	Reglamento de Seguridad en Actividades de Alto Riesgo Eléctrico	Requisitos para trabajo con riesgo eléctrico	\N	Certificar trabajadores en riesgo eléctrico y aplicar protocolos de seguridad	Empresas con riesgo eléctrico	no-cumple	Coordinador SST / Jefe de Mantenimiento	Recertificación cada 2 años	\N	\N	\N	\N	\N	\N	\N	2025-12-16 18:36:05.752945	2025-12-16 18:36:05.752945	0	\N	\N	\N
46596f03-395e-4694-85ec-cd1af8f285e3	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	Resolución 90708 de 2013 - RETIE	2013-08-30	Ministerio de Minas y Energía	seguridad-electrica	Reglamento Técnico de Instalaciones Eléctricas	Requisitos técnicos de instalaciones eléctricas	\N	Cumplir con requisitos técnicos en instalaciones eléctricas	Todas las instalaciones eléctricas	no-cumple	Mantenimiento / Coordinador SST	Inspecciones según normatividad	\N	\N	\N	\N	\N	\N	\N	2025-12-16 18:36:05.807787	2025-12-16 18:36:05.807787	0	\N	\N	\N
0d459c10-4a8c-49ba-af2a-8941a8c1b8e2	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	NSR-10 - Título J	2010-03-26	Ministerio de Ambiente, Vivienda y Desarrollo Territorial	prevencion-incendios	Requisitos de Protección contra Incendios en Edificaciones	Norma Sismo Resistente - Requisitos de protección contra incendios	\N	Cumplir con sistemas de protección contra incendios según uso de la edificación	Todas las edificaciones	no-cumple	Mantenimiento / Coordinador SST	Inspecciones anuales	\N	\N	\N	\N	\N	\N	\N	2025-12-16 18:36:05.862371	2025-12-16 18:36:05.862371	0	\N	\N	\N
b294f10a-489e-4b3a-ac9a-0503b2e1bab1	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	NFPA 10	2018-01-01	National Fire Protection Association	prevencion-incendios	Extintores Portátiles contra Incendios	Estándar para selección, instalación, inspección y mantenimiento de extintores	\N	Mantenimiento mensual y recarga anual de extintores	Todas las empresas	no-cumple	Mantenimiento / Brigada de Emergencias	Inspección mensual, recarga anual	\N	\N	\N	\N	\N	\N	\N	2025-12-16 18:36:05.917293	2025-12-16 18:36:05.917293	0	\N	\N	\N
a783f068-187b-4e0f-90ab-8a7df38693a4	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	Resolución 2013 de 1986	1986-06-06	Ministerio del Trabajo	comites-sst	Organización y Funcionamiento de los Comités de Medicina, Higiene y Seguridad Industrial (COPASST)	Reglamenta conformación y funciones del COPASST	\N	Conformar COPASST y realizar reuniones mensuales	Empresas con 10 o más trabajadores	no-cumple	RRHH / Coordinador SST	Reuniones mensuales mínimo	\N	\N	\N	\N	\N	\N	\N	2025-12-16 18:36:05.972302	2025-12-16 18:36:05.972302	0	\N	\N	\N
e7fc393a-ccad-4dd9-b1b1-e269a230d32a	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	Decreto 1295 de 1994	1994-06-22	Ministerio de Gobierno	comites-sst	Sistema General de Riesgos Laborales	Determina organización del Sistema General de Riesgos Laborales	\N	Afiliación a ARL y reporte de accidentes/enfermedades laborales	Todos los empleadores y trabajadores	no-cumple	RRHH / Nómina	Permanente	\N	\N	\N	\N	\N	\N	\N	2025-12-16 18:36:06.026732	2025-12-16 18:36:06.026732	0	\N	\N	\N
2e9b48f3-2e39-476e-b53b-2d5f4a62a45a	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	Resolución 1401 de 2007	2007-05-14	Ministerio de la Protección Social	investigacion-incidentes	Investigación de Incidentes y Accidentes de Trabajo	Procedimientos para investigación de accidentes e incidentes de trabajo	\N	Investigar todos los accidentes e incidentes de trabajo	Todos los empleadores	no-cumple	Coordinador SST / COPASST	Según ocurrencia de eventos	\N	\N	\N	\N	\N	\N	\N	2025-12-16 18:36:06.080425	2025-12-16 18:36:06.080425	0	\N	\N	\N
06884405-eae7-4e57-bf09-66d0c571db6d	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	Resolución 4927 de 2016	2016-11-23	Ministerio del Trabajo	capacitacion	Licencia en Seguridad y Salud en el Trabajo	Requisitos para obtener licencia en SST y curso de 50 horas	\N	Responsable SST debe tener licencia vigente y curso de 50 horas	Profesionales que ejercen como responsables SST	no-cumple	Coordinador SST	Renovación cada 4 años	\N	\N	\N	\N	\N	\N	\N	2025-12-16 18:36:06.135098	2025-12-16 18:36:06.135098	0	\N	\N	\N
e705a815-be04-4cfd-ad5c-f66ead470361	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	Resolución 0312 de 2019	2019-02-13	Ministerio del Trabajo	sistema-gestion	Estándares Mínimos del Sistema de Gestión SST	Define los estándares mínimos del SG-SST para empleadores y contratantes	\N	Implementar y mantener el SG-SST según los estándares mínimos establecidos	Empresas de todos los sectores económicos	no-cumple	Coordinador SST / Gerencia	Evaluación anual	\N	\N	\N	\N	\N	\N	\N	2025-12-16 18:36:04.754704	2025-12-16 18:36:04.754704	1	PLAN_ANUAL_TRABAJO	no-cumple	2025-12-18 10:54:39.427387
\.


--
-- Data for Name: medical_exams; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.medical_exams (id, company_id, worker_id, job_profile_id, exam_type, scheduled_date, performed_date, medical_center, attending_physician, aptitude, restrictions, recommendations, follow_up_date, exam_results, status, created_at) FROM stdin;
fdb99c02-f74e-40a0-a101-8291e21b813f	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	1d50f465-71c5-48ff-b365-142863ad5f9a	a288b46a-94f1-478c-b2ec-eb6d6d5c87e9	preocupacional	2025-12-26	2025-12-27	Gema IPS	Andres	apto	\N	\N	2026-01-29	\N	realizado	2025-12-25 10:56:15.495085
\.


--
-- Data for Name: mediciones_indicadores; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mediciones_indicadores (id, company_id, indicador_id, periodo, fecha_medicion, valor_medido, valor_numero, cumple_meta, desviacion, analisis, acciones_correctivas, responsable_medicion, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: miembros_brigada; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.miembros_brigada (id, brigada_id, trabajador_id, rol, fecha_ingreso, estado, certificaciones, fecha_ultima_capacitacion, aptitud_medica, observaciones, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: objetivos_sst; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.objetivos_sst (id, company_id, nombre, descripcion, meta, valor_meta, area, responsable, categoria_objetivo, alineado_con_norma, anio, frecuencia_revision, estado, fecha_inicio, fecha_fin, fecha_ultima_revision, observaciones, planes_accion, created_at, updated_at) FROM stdin;
40e43fd0-8a65-4759-a9bf-44c9863be6cc	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	Planear...	Planear, implementar y evaluar las actividades del Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST) para garantizar ambientes de trabajo seguros y saludables, previniendo accidentes laborales y enfermedades profesionales.	Reducir en un 20% respecto al período anterior	\N	Aplica a todos los trabajadores, contratistas y visitantes en todas las sedes de la empresa	Administrador del Sistema	Objetivos Generales SG-SST	Decreto 1072/2015 - Art. 2.2.4.6.5	2025	trimestral	activo	2025-12-13	2026-12-13	\N	Indicadores sugeridos:\n1. Índice de frecuencia de accidentalidad\n2. Índice de severidad\n3. Índice de lesiones incapacitantes (ILI)\n4. Porcentaje de cumplimiento del plan de trabajo anual		2025-12-13 12:53:25.247561	2025-12-13 12:53:25.247561
75b1b58d-435b-4187-8c19-65b40495ab40	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	Identificar los peligros...	Identificar los peligros, evaluar y valorar los riesgos, y establecer los respectivos controles para minimizar la probabilidad de ocurrencia de accidentes de trabajo y enfermedades laborales.	Reducir en un 20% respecto al período anterior	\N	Todas las actividades, procesos y áreas de trabajo	Administrador del Sistema	Objetivos Generales SG-SST	Resolución 0312/2019 - Estándar 1.1.2	2025	trimestral	activo	2025-12-13	2026-12-13	\N	Indicadores sugeridos:\n1. Número de peligros identificados\n2. Porcentaje de riesgos con controles implementados\n3. Número de controles priorizados vs implementados		2025-12-13 12:53:41.84165	2025-12-13 12:53:41.84165
0cb039e9-4e94-4623-b197-c02ce873aee9	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	Promover una cultura de prevención y autocuidado en todos los niveles de la organización...	Promover una cultura de prevención y autocuidado en todos los niveles de la organización, fomentando la participación activa de los trabajadores en la identificación de peligros y control de riesgos.	Reducir en un 20% respecto al período anterior	\N	Producción	undefined - Analista de Recursos Humanos	Objetivos Generales SG-SST	ISO 45001:2018 - Cláusula 5.4	2025	trimestral	activo	2025-12-14	2026-12-14	\N	Indicadores sugeridos:\n1. Número de reportes de actos y condiciones inseguras\n2. Porcentaje de participación en COPASST\n3. Número de sugerencias de mejora implementadas		2025-12-14 15:26:54.026007	2025-12-14 15:26:54.026007
099d782a-c9a4-4c62-9e73-3753873c5c17	76050645-7d63-46af-953b-bc86727b596f	Reducción de Accidentes	Reducir la tasa de accidentalidad en un 20% respecto al año anterior	Reducir accidentes en 20%	20	Toda la empresa	María López - Coordinadora SST	Seguridad	\N	2024	trimestral	activo	2024-01-01	2024-12-31	\N	\N	\N	2025-12-02 14:51:54.992228	2025-12-02 14:51:54.992228
7340df40-cfc2-48e8-9ae1-64d546405c5e	76050645-7d63-46af-953b-bc86727b596f	Capacitación SST	Capacitar al 100% del personal en temas básicos de SST	Cobertura 100% capacitación	100	Toda la empresa	María López - Coordinadora SST	Formación	\N	2024	trimestral	activo	2024-01-01	2024-12-31	\N	\N	\N	2025-12-02 14:51:54.992228	2025-12-02 14:51:54.992228
18af6a21-ab47-4e62-8b84-e737c5f4ea65	76050645-7d63-46af-953b-bc86727b596f	Cumplimiento Inspecciones	Ejecutar el 100% de las inspecciones programadas	Cumplimiento inspecciones 100%	100	Operaciones	Carlos Rodríguez - Supervisor	Monitoreo	\N	2024	trimestral	activo	2024-01-01	2024-12-31	\N	\N	\N	2025-12-02 14:51:54.992228	2025-12-02 14:51:54.992228
\.


--
-- Data for Name: occupational_diseases; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.occupational_diseases (id, company_id, worker_id, disease_name, diagnosis, diagnosis_date, exposure_factor, status, treatment, follow_up_date, created_at, symptoms, years_of_exposure, detailed_risk_agent, ips_name, diagnostic_tests, work_area_exposure, protective_equipment, was_hospitalized, incapacity_days, preventive_measures, arl_code, eps_code) FROM stdin;
\.


--
-- Data for Name: participantes_revision; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.participantes_revision (id, revision_id, company_id, user_id, nombre, cargo, area, rol, firma_digital, asistio, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: participantes_simulacro; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.participantes_simulacro (id, simulacro_id, trabajador_id, rol_asignado, asistio, desempeno, observaciones, created_at) FROM stdin;
\.


--
-- Data for Name: payment_sources; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_sources (id, company_id, subscription_id, wompi_payment_source_id, wompi_token, type, status, card_brand, card_last_four, card_expiry_month, card_expiry_year, card_holder_name, account_holder_name, customer_email, is_default, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: payment_transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_transactions (id, company_id, subscription_id, payment_source_id, wompi_transaction_id, wompi_reference, type, status, amount, currency, period_start, period_end, wompi_payment_method, wompi_status_message, wompi_error_code, description, receipt_url, invoice_id, paid_at, failed_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: peligros_iperc; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.peligros_iperc (id, company_id, matriz_id, clasificacion, subclasificacion, descripcion_peligro, fuente_generadora, actividad_proceso, ubicacion, numero_personas_expuestas, tipo_exposicion, tiempo_exposicion, efectos_posibles, parte_cuerpo_afectada, nivel_probabilidad, nivel_severidad, valor_riesgo, nivel_riesgo, controles_existentes, efectividad_controles_existentes, requiere_controles, controles_propuestos, tipo_control_principal, tipo_control_secundario, responsable_implementacion, responsable_implementacion_id, fecha_implementacion_propuesta, estado_implementacion, fecha_implementacion_real, nivel_probabilidad_residual, nivel_severidad_residual, valor_riesgo_residual, nivel_riesgo_residual, observaciones, requiere_seguimiento, proxima_revision, created_at, updated_at) FROM stdin;
f360f475-294c-4c83-9eab-2c04f16bcd2b	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	b7bec78c-fd7d-4cc4-8cb8-96cb87169cb7	fisico	\N	Iluminación inadecuada	mala	Levantar carga de 25 kilos	Oficinas	1	permanente	8 horas/día	Cefalea, fatiga visual, errores en tareas, caídas		baja	ligeramente_danino	1	trivial		media	1	Medición de luxes, Mantenimiento de luminarias, Iluminación localizada en puestos, Pausas visuales, Uso de luz natural cuando sea posible	sustitucion	\N		\N	\N	pendiente	\N	\N	\N	\N	\N	\N	1	\N	2025-12-11 17:15:56.090247	2025-12-11 17:15:56.090247
81cdacaa-a497-42e3-a4ee-c1e898069e5b	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	f4b1bd88-40db-4c3b-ab99-7554b2dd9ad2	biologico	\N	Virus	Maquina 	Levantar carga de 25 kilos		1	permanente	8 horas/día	Enfermedades respiratorias, hepáticas, inmunodeficiencia		baja	ligeramente_danino	1	trivial		media	1	Vacunación, EPP (mascarillas N95, batas, guantes), Protocolo de bioseguridad, Lavado frecuente de manos, Distanciamiento social	eliminacion	\N		\N	\N	pendiente	\N	\N	\N	\N	\N	\N	1	\N	2025-12-16 18:39:26.089009	2025-12-16 18:39:26.089009
\.


--
-- Data for Name: peligros_trabajadores_asignacion; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.peligros_trabajadores_asignacion (id, company_id, peligro_id, department, "position", asignado_por, fecha_asignacion, activo, observaciones, created_at) FROM stdin;
\.


--
-- Data for Name: pesv_audits; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pesv_audits (id, company_id, audit_date, auditor, auditor_entity, scope, step1_leader, step2_committee, step3_policy, step4_leadership, step5_diagnosis, step6_risk_assessment, step7_objectives, step8_critical_risks, step9_annual_plan, step10_training, step11_fatigue, step12_emergency, step13_investigation, step14_safe_roads, step15_driver_selection, step16_vehicle_inspection, step17_maintenance, step18_change_management, step19_procurement, step20_indicators, step21_supervision, step22_audit, step23_improvement, step24_communication, policy_compliance, planning_compliance, implementation_compliance, verification_compliance, improvement_compliance, total_score, compliance_percentage, result, findings, recommendations, action_plan, status, created_at) FROM stdin;
\.


--
-- Data for Name: plan_change_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.plan_change_history (id, subscription_id, company_id, old_plan_id, new_plan_id, billing_interval, billing_cycle_days, prorated_credit, amount_charged, wompi_transaction_id, change_type, status, validation_warnings, requested_by, requested_by_role, is_admin_override, ip_address, user_agent, metadata, requested_at, completed_at, effective_date) FROM stdin;
\.


--
-- Data for Name: plan_comunicacion_sst; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.plan_comunicacion_sst (id, company_id, version, fecha_elaboracion, fecha_revision, objetivo_general, objetivos_especificos, alcance, publicos_objetivo, medios_comunicacion, frecuencia_reuniones, indicadores, metas_indicadores, estado, observaciones, created_at, updated_at, elaborado_por, aprobado_por, responsable_comunicacion_interna, responsable_comunicacion_externa, responsable_comunicacion_contratistas) FROM stdin;
f46eb2c4-885d-4834-96b4-e1844d1386b7	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	1.0	2025-12-16	\N	Establecer los mecanismos de comunicación interna y externa eficaces que permitan garantizar la divulgación oportuna de la información relacionada con el Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST), en cumplimiento del Decreto 1072 de 2015, Artículo 2.2.4.6.14.\n\nLos objetivos específicos incluyen:\n- Mantener informados a todos los trabajadores sobre los peligros y riesgos identificados\n- Comunicar las políticas, objetivos y resultados del SG-SST\n- Recibir y atender las comunicaciones de las partes interesadas\n- Garantizar canales bidireccionales de comunicación efectiva	\N	Este plan de comunicación aplica a todos los trabajadores de la empresa, independientemente de su forma de vinculación laboral, incluyendo contratistas, subcontratistas, trabajadores en misión, visitantes y demás partes interesadas en materia de Seguridad y Salud en el Trabajo.\n\nCubre las comunicaciones internas (entre niveles de la organización) y externas (con ARL, entes de control, proveedores y otras partes interesadas).	{"Trabajadores directos",Contratistas,Subcontratistas,Visitantes,Proveedores,"ARL y entidades de control"}	{"Correo electrónico","Carteleras informativas","Reuniones periódicas","Intranet corporativa","Capacitaciones presenciales"}	Mensual	\N	\N	vigente		2025-12-16 21:13:14.995349	2025-12-16 21:13:14.995349	360f5e46-96e8-47a0-9c5b-0bbf1c2cecf1	360f5e46-96e8-47a0-9c5b-0bbf1c2cecf1	360f5e46-96e8-47a0-9c5b-0bbf1c2cecf1	360f5e46-96e8-47a0-9c5b-0bbf1c2cecf1	360f5e46-96e8-47a0-9c5b-0bbf1c2cecf1
\.


--
-- Data for Name: planes_accion_auditoria; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.planes_accion_auditoria (id, company_id, hallazgo_id, numero_accion, tipo_accion, descripcion_accion, justificacion, responsable, responsable_id, fecha_compromiso, fecha_implementacion, estado, porcentaje_avance, observaciones_avance, requiere_verificacion, fecha_verificacion, verificado_por, verificado_por_id, resultado_verificacion, eficaz, recursos_necesarios, presupuesto_estimado, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: planes_emergencia; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.planes_emergencia (id, company_id, nombre, version, fecha_elaboracion, fecha_ultima_revision, fecha_proxima_revision, objetivos, alcance, responsable_id, estado, aprobado_por, fecha_aprobacion, ubicacion_documento, observaciones, created_at, updated_at, codigo, fecha_vigencia, elaborado_por, revisado_por, objetivo_general, objetivos_especificos, marco_legal, descripcion_instalaciones, numero_pisos, area_total, capacidad_maxima_personas, horario_operacion, turnos_trabajo, poblacion_fija, poblacion_flotante, poblacion_vulnerable, telefono_emergencias, contacto_arl, contacto_bomberos, contacto_policia, contacto_ambulancia, contacto_defensa_civil, notas) FROM stdin;
\.


--
-- Data for Name: planes_trabajo_anual; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.planes_trabajo_anual (id, company_id, anio, fecha_elaboracion, objetivo_general, alcance, presupuesto_total, presupuesto_ejecutado, estado, responsable_elaboracion, cargo_responsable, email_responsable, fecha_aprobacion, aprobado_por, cargo_aprobador, observaciones, total_actividades, actividades_completadas, porcentaje_cumplimiento, created_at, updated_at, matriz_iperc_id, elaborado_por_id, autorizado_por_id, aprobado_por_id) FROM stdin;
07b9d6f3-e4bd-4571-91b6-79eacb92e416	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	2026	2025-12-13		Aplica a todos los trabajadores, contratistas y visitantes de la empresa	0	0	aprobado	Administrador del Sistema	Responsable SG-SST	\N	\N	Adriana Diaz	Gerente General	\N	320	3	1	2025-12-13 18:25:22.703034	2025-12-17 18:17:03.179852	\N	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38
\.


--
-- Data for Name: politicas_sst; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.politicas_sst (id, company_id, codigo, version, fecha_emision, fecha_proxima_revision, estado, declaracion_compromiso, objetivos, alcance, responsabilidades, compromisos, recursos, revision_comunicacion, representante_legal, cedula_representante, responsable_sst, licencia_sst, fecha_firma, comunicada, fecha_comunicacion, observaciones, created_at, updated_at, elaborado_por_id, autorizado_por_id, aprobado_por_id) FROM stdin;
b75665b2-3e86-4760-9de5-4bc28d87fe92	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	POL-SEG-03	1.0	2025-12-15	2026-12-15	vigente	[NOMBRE_EMPRESA] establece:\n\n1. CAPACITACIÓN:\n   - Certificación obligatoria en trabajo en alturas (nivel básico, avanzado o coordinador según corresponda).\n   - Recertificación cada 2 años.\n   - Entrenamiento en procedimientos y equipos.\n\n2. REQUISITOS DE SALUD:\n   - Evaluación médica ocupacional específica para trabajo en alturas.\n   - Aptitud médica vigente.\n\n3. JERARQUÍA DE CONTROLES:\n   - Eliminar el trabajo en alturas (primera opción).\n   - Controles de ingeniería (plataformas, andamios).\n   - Equipos de protección contra caídas (arnés, línea de vida, etc.).\n\n4. EQUIPOS:\n   - Inspección diaria de elementos de protección.\n   - Uso obligatorio de arnés y doble línea de vida.\n   - Equipos certificados y en buen estado.\n\n5. PERMISOS DE TRABAJO:\n   - Permiso escrito para cada actividad en alturas.\n   - Análisis de riesgos previo.\n   - Medidas de rescate disponibles.\n\nEsta política cumple con la Resolución 1409/2012 y la Resolución 4272/2021.	["[NOMBRE_EMPRESA] establece:","Certificación obligatoria en trabajo en alturas (nivel básico, avanzado o coordinador según corresponda).","Evaluación médica ocupacional específica para trabajo en alturas.","Eliminar el trabajo en alturas (primera opción).","Inspección diaria de elementos de protección.","Permiso escrito para cada actividad en alturas."]	Aplica a todos los trabajadores que realicen actividades a 1.50 metros o más sobre un nivel inferior.	{"altaDireccion":"La Alta Dirección es responsable de liderar y comprometerse con la implementación y mejora del SG-SST, asignando los recursos necesarios, definiendo objetivos, metas y políticas, garantizando el cumplimiento normativo, y promoviendo la participación de todos los trabajadores en el sistema.","responsableSst":"El Responsable del SG-SST tiene la función de planificar, organizar, dirigir, desarrollar y aplicar el Sistema de Gestión de Seguridad y Salud en el Trabajo. Debe coordinar con las diferentes áreas de la empresa, realizar seguimiento al cumplimiento de las actividades programadas, reportar el desempeño del sistema a la alta dirección, y mantener actualizada la documentación del SG-SST.","trabajadores":"Los trabajadores tienen la responsabilidad de cumplir con las normas de seguridad, utilizar adecuadamente los elementos de protección personal, reportar condiciones inseguras y accidentes, participar activamente en las actividades de capacitación y prevención, y velar por su propia seguridad y la de sus compañeros."}	["Identificar los peligros, evaluar y valorar los riesgos y establecer los respectivos controles.","Proteger la seguridad y salud de todos los trabajadores, mediante la mejora continua del SG-SST.","Cumplir la normatividad nacional vigente aplicable en materia de riesgos laborales.","Destinar los recursos necesarios (humanos, técnicos, físicos y financieros) para el diseño, implementación, revisión, evaluación y mejora de las medidas de prevención y control.","Garantizar la participación de todos los trabajadores y sus representantes en la implementación del SG-SST.","Promover y mantener un ambiente de trabajo seguro y saludable.","Realizar capacitación y entrenamiento continuo en aspectos de seguridad y salud en el trabajo.","Investigar todos los incidentes y accidentes de trabajo para implementar acciones correctivas y preventivas.","Mejorar continuamente los procesos y el desempeño del SG-SST.","Comunicar y socializar esta política a todos los niveles de la organización y partes interesadas."]	La organización se compromete a asignar y mantener los recursos necesarios para la implementación, mantenimiento y mejora continua del Sistema de Gestión de Seguridad y Salud en el Trabajo, incluyendo:\n\n- **Recursos Humanos**: Personal competente y capacitado, incluyendo el Responsable del SG-SST con licencia vigente, COPASST, Comité de Convivencia Laboral, y personal médico cuando sea requerido.\n\n- **Recursos Físicos**: Instalaciones adecuadas, equipos de protección personal, equipos de emergencia, señalización, y herramientas necesarias para el control de riesgos.\n\n- **Recursos Financieros**: Presupuesto anual asignado para actividades de promoción, prevención, capacitación, exámenes médicos ocupacionales, adquisición de EPP y equipos de emergencia, y mejora de condiciones de trabajo.\n\n- **Recursos Tecnológicos**: Sistemas de información, software especializado para la gestión del SG-SST, y herramientas tecnológicas para la identificación y control de peligros.	Esta política será revisada como mínimo una vez al año por la alta dirección, o cuando las circunstancias lo ameriten, tales como cambios en la legislación, cambios en los procesos, incidentes graves, o resultados de auditorías. Las actualizaciones y modificaciones quedarán registradas mediante un control de versiones.\n\nLa política será comunicada a todos los trabajadores a través de los siguientes medios:\n- Publicación en carteleras y lugares visibles de la empresa\n- Inducción y reinducción de personal\n- Capacitaciones periódicas del SG-SST\n- Correo electrónico corporativo\n- Reuniones de seguridad y charlas de 5 minutos\n- Página web o intranet corporativa (si aplica)\n\nLa política estará disponible para todas las partes interesadas que lo soliciten.	Luz Adriana Diaz Calle - Analista de Recursos Humanos	52223631	Luz Adriana Diaz Calle - Analista de Recursos Humanos	L.S.O 7856936	2025-12-15	0	\N	\N	2025-12-15 18:54:30.636639	2025-12-15 18:54:30.636639	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38
8c03c907-e8cc-49d2-b109-4c7e4be0072d	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	POL-GEN-01	1.0	2025-12-13	2026-12-13	vigente	La Dirección de [NOMBRE_EMPRESA] se compromete a:\n\n1. PROTECCIÓN DE LA SALUD Y LA VIDA: Proveer condiciones de trabajo seguras y saludables para prevenir lesiones y enfermedades relacionadas con el trabajo.\n\n2. CUMPLIMIENTO LEGAL: Cumplir con la normatividad colombiana vigente en materia de SST, incluyendo el Decreto 1072/2015, la Resolución 0312/2019 y demás normas aplicables.\n\n3. MEJORA CONTINUA: Implementar el ciclo PHVA (Planear, Hacer, Verificar, Actuar) para mejorar continuamente la eficacia del SG-SST.\n\n4. PARTICIPACIÓN: Promover la participación activa de todos los trabajadores en la identificación de peligros, evaluación de riesgos y determinación de controles.\n\n5. RECURSOS: Asignar los recursos humanos, técnicos y financieros necesarios para el funcionamiento efectivo del SG-SST.\n\n6. RESPONSABILIDAD: Asignar responsabilidades en SST a todos los niveles de la organización.\n\n7. PREVENCIÓN: Identificar peligros, evaluar y valorar riesgos, estableciendo controles necesarios.\n\nEsta política será revisada anualmente y comunicada a todos los niveles de la organización.	["La Dirección de [NOMBRE_EMPRESA] se compromete a:","Proveer condiciones de trabajo seguras y saludables para prevenir lesiones y enfermedades relacionadas con el trabajo.","Cumplir con la normatividad colombiana vigente en materia de SST, incluyendo el Decreto 1072/2015, la Resolución 0312/2019 y demás normas aplicables.","Implementar el ciclo PHVA (Planear, Hacer, Verificar, Actuar) para mejorar continuamente la eficacia del SG-SST.","Promover la participación activa de todos los trabajadores en la identificación de peligros, evaluación de riesgos y determinación de controles.","Asignar los recursos humanos, técnicos y financieros necesarios para el funcionamiento efectivo del SG-SST.","Asignar responsabilidades en SST a todos los niveles de la organización.","Identificar peligros, evaluar y valorar riesgos, estableciendo controles necesarios."]	Aplica a todos los trabajadores, contratistas, visitantes y cualquier persona que realice actividades en nombre de la organización.	{"altaDireccion":"La Alta Dirección es responsable de liderar y comprometerse con la implementación y mejora del SG-SST, asignando los recursos necesarios, definiendo objetivos, metas y políticas, garantizando el cumplimiento normativo, y promoviendo la participación de todos los trabajadores en el sistema.","responsableSst":"El Responsable del SG-SST tiene la función de planificar, organizar, dirigir, desarrollar y aplicar el Sistema de Gestión de Seguridad y Salud en el Trabajo. Debe coordinar con las diferentes áreas de la empresa, realizar seguimiento al cumplimiento de las actividades programadas, reportar el desempeño del sistema a la alta dirección, y mantener actualizada la documentación del SG-SST.","trabajadores":"Los trabajadores tienen la responsabilidad de cumplir con las normas de seguridad, utilizar adecuadamente los elementos de protección personal, reportar condiciones inseguras y accidentes, participar activamente en las actividades de capacitación y prevención, y velar por su propia seguridad y la de sus compañeros."}	["Identificar los peligros, evaluar y valorar los riesgos y establecer los respectivos controles.","Proteger la seguridad y salud de todos los trabajadores, mediante la mejora continua del SG-SST.","Cumplir la normatividad nacional vigente aplicable en materia de riesgos laborales.","Destinar los recursos necesarios (humanos, técnicos, físicos y financieros) para el diseño, implementación, revisión, evaluación y mejora de las medidas de prevención y control.","Garantizar la participación de todos los trabajadores y sus representantes en la implementación del SG-SST.","Promover y mantener un ambiente de trabajo seguro y saludable.","Realizar capacitación y entrenamiento continuo en aspectos de seguridad y salud en el trabajo.","Investigar todos los incidentes y accidentes de trabajo para implementar acciones correctivas y preventivas.","Mejorar continuamente los procesos y el desempeño del SG-SST.","Comunicar y socializar esta política a todos los niveles de la organización y partes interesadas."]	La organización se compromete a asignar y mantener los recursos necesarios para la implementación, mantenimiento y mejora continua del Sistema de Gestión de Seguridad y Salud en el Trabajo, incluyendo:\n\n- **Recursos Humanos**: Personal competente y capacitado, incluyendo el Responsable del SG-SST con licencia vigente, COPASST, Comité de Convivencia Laboral, y personal médico cuando sea requerido.\n\n- **Recursos Físicos**: Instalaciones adecuadas, equipos de protección personal, equipos de emergencia, señalización, y herramientas necesarias para el control de riesgos.\n\n- **Recursos Financieros**: Presupuesto anual asignado para actividades de promoción, prevención, capacitación, exámenes médicos ocupacionales, adquisición de EPP y equipos de emergencia, y mejora de condiciones de trabajo.\n\n- **Recursos Tecnológicos**: Sistemas de información, software especializado para la gestión del SG-SST, y herramientas tecnológicas para la identificación y control de peligros.	Esta política será revisada como mínimo una vez al año por la alta dirección, o cuando las circunstancias lo ameriten, tales como cambios en la legislación, cambios en los procesos, incidentes graves, o resultados de auditorías. Las actualizaciones y modificaciones quedarán registradas mediante un control de versiones.\n\nLa política será comunicada a todos los trabajadores a través de los siguientes medios:\n- Publicación en carteleras y lugares visibles de la empresa\n- Inducción y reinducción de personal\n- Capacitaciones periódicas del SG-SST\n- Correo electrónico corporativo\n- Reuniones de seguridad y charlas de 5 minutos\n- Página web o intranet corporativa (si aplica)\n\nLa política estará disponible para todas las partes interesadas que lo soliciten.	Luz Adriana Diaz Calle - Analista de Recursos Humanos	52223631	Luz Adriana Diaz Calle - Analista de Recursos Humanos	L.S.O 7856936	2025-12-13	0	\N	\N	2025-12-13 19:28:06.930756	2025-12-13 19:28:06.930756	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38
\.


--
-- Data for Name: preguntas_induccion; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.preguntas_induccion (id, company_id, contenido_id, pregunta, opciones, respuesta_correcta, explicacion, orden, activa, created_at) FROM stdin;
\.


--
-- Data for Name: preventive_measures; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.preventive_measures (id, company_id, title, description, responsible, due_date, status, priority, related_area, completed_date, created_at) FROM stdin;
\.


--
-- Data for Name: pricing_config; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pricing_config (id, min_fee_small, price_1_10, price_11_49, price_50_199, price_200_plus, currency, is_active, valid_from, created_at, updated_at) FROM stdin;
86c71dc7-9a0d-42df-9170-00aa20081660	49000.00	6000.00	5000.00	4000.00	3000.00	COP	f	\N	2025-11-25 10:22:15.754478	2025-12-03 14:20:07.2892
c325a5ee-dd62-4c0c-9de3-83059a04b064	60000.00	26000.00	24000.00	22000.00	20000.00	COP	t	\N	2025-12-03 14:20:07.2892	2025-12-03 14:20:07.2892
\.


--
-- Data for Name: pricing_plugin_invoices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pricing_plugin_invoices (id, subscription_id, customer_id, period_start, period_end, employee_count_billed, tier, monthly_cost, price_per_license, minimum_fee, payment_status, payment_reference, created_at) FROM stdin;
\.


--
-- Data for Name: pricing_plugin_subscriptions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pricing_plugin_subscriptions (id, customer_id, employee_count, pricing_config_id, tier, monthly_cost, price_per_license, minimum_fee, status, created_at, updated_at, stripe_customer_id, stripe_subscription_id) FROM stdin;
\.


--
-- Data for Name: program_training_attendance; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.program_training_attendance (id, company_id, training_id, worker_id, attended, attendance_time, departure_time, evaluation_score, passed, certificate_issued, certificate_number, certificate_date, observations, created_at) FROM stdin;
\.


--
-- Data for Name: program_trainings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.program_trainings (id, company_id, program_id, topic, description, training_category, is_obligatory, legal_basis, scheduled_date, scheduled_time, duration, frequency, actual_date, actual_time, location, modality, instructor, instructor_qualifications, responsible, target_audience, estimated_attendees, actual_attendees, materials, equipment, requires_evaluation, evaluation_score, status, observations, attachment_url, evidence_url, created_at, updated_at) FROM stdin;
02ea11fb-ac07-4913-b16c-132eea86e618	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	94f0a35f-7553-4f6d-930a-00c2735c562f	Capacitación sobre cambio: Cambio Funcional 62-H80	Preparar al personal para la implementación del cambio tipo interno - personal. Área afectada: Testing. Proceso: Ensamble de productos.	gestion_cambio	1	\N	2025-12-30	\N	4	unica	\N	\N	\N	presencial	Luz Adriana Diaz Calle	\N	\N	Personal de Testing (2 trabajadores)	0	0	\N	\N	1	\N	programada	Capacitación generada automáticamente desde Gestión de Cambios (ID: c2b9b898-545f-4777-874c-ef2774d753bd)	\N	\N	2025-12-23 11:56:40.369546	2025-12-23 11:56:40.369546
\.


--
-- Data for Name: programas_capacitacion; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.programas_capacitacion (id, company_id, fecha, titulo, archivo_url, archivo_nombre, created_at) FROM stdin;
\.


--
-- Data for Name: promotion_prevention_activities; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.promotion_prevention_activities (id, company_id, title, activity_type, objective, scope, description, priority_risk_type, priority_risk_description, sve_program_id, modality, frequency, start_date, end_date, scheduled_time, location, responsible_name, responsible_position, responsible_email, target_population, estimated_participants, actual_participants, evidence_required, evidence_urls, status, completion_percentage, completion_date, observations, created_by, created_at, updated_at) FROM stdin;
9f2577ce-fbaf-43a9-afaf-0fa7711521c4	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	Programa de Pausas Activas	promocion_prevencion	Prevenir desórdenes musculoesqueléticos mediante ejercicios de estiramiento y movilidad articular durante la jornada laboral		Sesiones de 10-15 minutos de ejercicios guiados enfocados en grupos musculares según exposición al riesgo biomecánico.	biomecanico	\N	da741590-371d-4c5d-bf3a-ce1ef0ee6a92	presencial	diaria	2025-12-25	2025-12-26	\N	\N	Médico Ocupacional	Fisioterapeuta	\N	Trabajadores con exposición a riesgo biomecánico	2	\N	\N	\N	completada	0	\N	\N	360f5e46-96e8-47a0-9c5b-0bbf1c2cecf1	2025-12-25 06:12:13.807494	2025-12-25 06:13:02.076
\.


--
-- Data for Name: promotion_prevention_participants; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.promotion_prevention_participants (id, activity_id, worker_id, worker_name, worker_document, participation_role, attended, attendance_date, observations, created_at) FROM stdin;
\.


--
-- Data for Name: proveedores_contratistas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.proveedores_contratistas (id, company_id, razon_social, nit, tipo_proveedor, tipo_servicio, nivel_riesgo_servicio, representante_legal, direccion, telefono, email, ciudad, nombre_arl, numero_trabajadores, nivel_riesgo_empresa, estado, ultima_calificacion, fecha_ultima_evaluacion, fecha_proxima_reevaluacion, observaciones, created_at, updated_at) FROM stdin;
9c07b565-92e6-4fe2-84c3-d5be7bfe0811	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	SIMENS	900123456-7	proveedor	Servicios	medio	Andres 	5552525555	45296341	ladic2023@ocloud.com	fgbfhngnj	positiva	1	I	aprobado	100	2025-12-17	\N	dxxcfvghbjnmk	2025-12-17 10:09:10.482721	2025-12-17 10:09:10.482721
300e7670-90ba-4a08-a848-d75c7b6b970d	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	EMPRESA PRUEBA-1	2459995856	proveedor	Servicios	medio	Diego	666546456	854296453964	ladic2023@ocloud.com	hgfddfgbh	positiva	20	IV	rechazado	46	2025-12-17	\N	dexcfrtgvhbnj	2025-12-17 11:12:25.039877	2025-12-17 11:13:32.792559
\.


--
-- Data for Name: provider_access_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.provider_access_logs (id, provider_id, provider_name, provider_email, provider_role, client_company_id, client_company_name, client_company_nit, access_reason, access_description, ticket_number, access_start, access_end, modules_accessed, actions_performed, records_viewed, records_modified, ip_address, user_agent, session_id, legal_basis, client_notified, created_at) FROM stdin;
\.


--
-- Data for Name: puntos_encuentro; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.puntos_encuentro (id, company_id, plan_emergencia_id, nombre, tipo, ubicacion, capacidad_personas, distancia_edificio_metros, acceso_vehiculos_emergencia, "señalizacion_visible", coordenadas_gps, areas_asignadas, responsable_punto_id, tiene_kit_primeros_auxilios, tiene_megafono, tiene_lista_empleados, estado, plano_referencia, observaciones, created_at, updated_at, codigo, descripcion, coordenadas, tiene_proteccion, es_accesible, distancia_salida_principal, responsable_id, responsable_sustituto_id, activo, tiene_kit, tiene_listado_personal, punto_principal) FROM stdin;
\.


--
-- Data for Name: recomendaciones_arl_autoridades; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.recomendaciones_arl_autoridades (id, company_id, codigo, origen, nombre_entidad, numero_documento, fecha_documento, fecha_recepcion, tipo_recomendacion, descripcion, fundamento_legal, area_afectada, fecha_limite, dias_plazo, plan_accion, responsable, recursos, presupuesto, estado, porcentaje_avance, fecha_implementacion, verificado_por, fecha_verificacion, evidencia_cumplimiento, documento_respuesta, observaciones, accidente_id, creado_por, actualizado_por, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: recursos_emergencia; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.recursos_emergencia (id, company_id, plan_emergencia_id, categoria, nombre, descripcion, cantidad, unidad, ubicacion, responsable_id, estado, fecha_adquisicion, fecha_vencimiento, fecha_ultima_inspeccion, proxima_inspeccion, proveedor, numero_serie, observaciones, created_at, updated_at, codigo, tipo, ubicacion_detalle, marca, modelo, capacidad, fecha_proxima_inspeccion, fecha_ultima_recarga, fecha_proxima_recarga, responsable_area, estado_operativo) FROM stdin;
\.


--
-- Data for Name: registros_induccion; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.registros_induccion (id, company_id, worker_id, tipo, fecha, hora_inicio, duracion_minutos, responsable_nombre, responsable_licencia, eps, pension, arl, evaluacion_sst, evaluacion_seccion, factores_riesgo, evaluacion_maquinas, cargo_funcion, cargo_objetivo, cargo_proceso, tiene_experiencia, tiempo_experiencia, observaciones_experiencia, observaciones, created_at, updated_at) FROM stdin;
5f56caaa-4dab-4489-9716-a584b775ffc9	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	induccion	2025-12-11	19:59	120	Administrador del Sistema	T-9876544	Sura	Colpensiones	Positiva	{"item1":false,"item2":false,"item3":false,"item4":false,"item5":false,"item6":false,"item7":false,"item8":false,"item9":false,"item10":false,"item11":false,"item12":false,"item13":false,"item14":false,"item15":false}	{"item1":false,"item2":false,"item3":false}		{"item1":false,"item2":false,"item3":false}				0				2025-12-11 17:59:24.348495	2025-12-11 17:59:24.348495
\.


--
-- Data for Name: reportes_trabajadores; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reportes_trabajadores (id, company_id, codigo, reportado_por, worker_id, nombre_reportante, departamento, es_anonimo, categoria, prioridad, asunto, descripcion, ubicacion, archivos_adjuntos, estado, asignado_a, fecha_asignacion, respuesta, acciones_tomadas, fecha_respuesta, respondido_por, fecha_cierre, motivo_cierre, notificar_email, email_contacto, tiempo_respuesta_dias, satisfaccion_reportante, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: resource_allocations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.resource_allocations (id, company_id, date, resource_type, cargo, cedula, nombre_completo, nombre_equipo, objeto, num_unidades, serial, implementos_nivel, inversion_estimada, fecha_desembolso, objetivo_general, created_at, worker_id, elaborado_por_id, autorizado_por_id, aprobado_por_id, monto_ejecutado) FROM stdin;
c311e846-d65d-4c23-9e2d-e4de19258745	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	2025-12-18	humano	Analista de Recursos Humanos	52223631	Luz Adriana Diaz Calle	\N	\N	\N	\N	\N	\N	\N	Asignación de recurso humano capacitado para el desarrollo, implementación y mantenimiento del Sistema de Gestión de SST según Decreto 1072/2015, Art. 2.2.4.6.8	2025-12-18 21:50:49.743326	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	0
806e1f24-ac21-417d-b8d1-8f96388643f0	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	2025-12-18	financiero	\N	\N	\N	\N	\N	\N	\N	\N	10000000	2025-12-18	Asignación de presupuesto para el desarrollo de actividades del SG-SST: capacitación, EPP, señalización, exámenes médicos, equipos de emergencia y auditorías según Decreto 1072/2015, Art. 2.2.4.6.8	2025-12-18 21:51:13.065554	\N	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	0
5bc13cb0-a884-4223-8031-bd09b2363ad8	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	2025-12-18	fisico	\N	\N	\N	laptop	apoyo laboral	5	00001-00001	intervencion	\N	\N	Asignación de equipos y herramientas técnicas para el desarrollo del SG-SST: equipos de medición, software SST, equipos de emergencia, señalización y EPP según Decreto 1072/2015, Art. 2.2.4.6.8	2025-12-18 21:51:37.20523	\N	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	0
a0ddad25-8ee7-4558-92ff-7625a16615ae	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	2025-12-26	financiero	\N	\N	\N	\N	\N	\N	\N	\N	3000000	2025-12-28	Programa EVS - Estilos de Vida Saludable	2025-12-26 18:17:51.415087	\N	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	0
\.


--
-- Data for Name: responsible_designations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.responsible_designations (id, company_id, worker_id, designation_date, "position", responsibilities, signature_url, status, created_at, job_profile_id, licencia_sst_numero, licencia_sst_vigencia, curso_50_horas, curso_50_horas_fecha, nivel_formacion) FROM stdin;
6f67b136-bc3a-4289-a0c3-dae2b9d73317	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	2025-12-11	Líder del Comité de Convivencia	{"Promover y liderar las actividades del Comité de Convivencia Laboral orientadas a prevenir el acoso laboral.","Recibir y dar trámite a las quejas presentadas en las que se describan situaciones que puedan constituir acoso laboral.","Examinar de manera confidencial los casos específicos o puntuales en los que se formule queja o reclamo.","Escuchar a las partes involucradas de manera individual sobre los hechos que dieron lugar a la queja.","Adelantar reuniones con el fin de crear un espacio de diálogo entre las partes involucradas, promoviendo compromisos mutuos.","Formular recomendaciones constructivas a las partes involucradas para superar las situaciones de conflicto.","Hacer seguimiento a los compromisos adquiridos por las partes involucradas en la queja.","Elaborar informes trimestrales sobre la gestión del Comité que incluyan estadísticas de las quejas, seguimiento y recomendaciones.","Promover espacios de diálogo, campañas de divulgación preventiva, formación y capacitación sobre el acoso laboral.","Hacer seguimiento al cumplimiento de las recomendaciones dadas por el Comité en casos específicos."}		activo	2025-12-11 16:46:29.926772	25e671bb-4d49-43c9-8610-bd83ad8cfd4c		\N	t	2011-06-11	Especialista
ba7ca14c-5db4-4f9f-a3ab-0988e66dbc76	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	2025-12-13	Responsable del SG-SST	{"Planear, organizar, dirigir, desarrollar y aplicar el Sistema de Gestión de la Seguridad y Salud en el Trabajo SG-SST.","Informar a la alta dirección sobre el funcionamiento y los resultados del Sistema de Gestión de la Seguridad y Salud en el Trabajo SG-SST.","Promover la participación de todos los miembros de la empresa en la implementación del Sistema de Gestión de la Seguridad y Salud en el Trabajo SG-SST.","Coordinar con los responsables de las áreas de la empresa la adopción de medidas preventivas y correctivas.","Verificar el cumplimiento de los estándares mínimos del Sistema de Gestión de la Seguridad y Salud en el Trabajo SG-SST.","Gestionar los recursos financieros, técnicos y humanos necesarios para el diseño, implementación y mantenimiento del SG-SST.","Mantener actualizada la matriz legal aplicable a la empresa en materia de seguridad y salud en el trabajo.","Realizar la identificación de peligros, evaluación y valoración de riesgos.","Diseñar e implementar las medidas de prevención y control de los peligros y riesgos identificados.","Reportar a la alta dirección sobre el desempeño del SG-SST y los accidentes de trabajo y enfermedades laborales ocurridas."}		activo	2025-12-13 18:57:24.66423	25e671bb-4d49-43c9-8610-bd83ad8cfd4c	L.S.O 7856936	\N	t	2010-07-09	Especialista
\.


--
-- Data for Name: respuestas_criterios_proveedor; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.respuestas_criterios_proveedor (id, evaluacion_id, criterio_id, puntaje_obtenido, cumple, evidencia, observaciones, created_at) FROM stdin;
\.


--
-- Data for Name: respuestas_estandares; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.respuestas_estandares (id, evaluacion_id, estandar_id, cumple, no_aplica, justificacion_no_aplica, puntaje_obtenido, puntaje_maximo, evidencias, modo_verificacion, observaciones, hallazgo, causa_raiz, updated_at) FROM stdin;
040637c1-ef5e-4515-a8d9-8a3123fd8c79	690f3be0-2d35-4397-b3bb-59f782bfac8d	std-1.1.1	1	0	\N	5	5	https://a5002b18-b6d5-4933-979a-3a5dc1d5f223-00-1hqb6aqvhuopf.spock.replit.dev/designacion-responsable	\N		\N	\N	2025-12-18 20:41:38.377567
04abf368-40dd-4140-98f5-ca1fc21bad91	690f3be0-2d35-4397-b3bb-59f782bfac8d	std-1.1.2	1	0	\N	5	5	https://a5002b18-b6d5-4933-979a-3a5dc1d5f223-00-1hqb6aqvhuopf.spock.replit.dev/perfiles-cargo	\N		\N	\N	2025-12-18 20:44:49.194254
5203c0f4-bd7f-42f8-a6dc-e26b7a7c9528	690f3be0-2d35-4397-b3bb-59f782bfac8d	std-1.1.3	1	0	\N	5	5	https://a5002b18-b6d5-4933-979a-3a5dc1d5f223-00-1hqb6aqvhuopf.spock.replit.dev/asignacion-recursos	\N		\N	\N	2025-12-18 21:52:06.088908
c5203bc1-6914-40a1-9a93-f1f97b57c91a	690f3be0-2d35-4397-b3bb-59f782bfac8d	std-1.1.4	1	0	\N	5	5		\N		\N	\N	2025-12-18 21:53:03.889678
a337cbfd-345d-4dcd-8e7e-20a6134aa87d	690f3be0-2d35-4397-b3bb-59f782bfac8d	std-1.1.5	1	0	\N	5	5		\N		\N	\N	2025-12-18 21:53:31.56177
1e026aee-78fc-471e-823d-6ab36c7ad298	690f3be0-2d35-4397-b3bb-59f782bfac8d	std-1.1.6	1	0	\N	5	5	https://a5002b18-b6d5-4933-979a-3a5dc1d5f223-00-1hqb6aqvhuopf.spock.replit.dev/copasst-gestion	\N		\N	\N	2025-12-18 21:55:27.738051
aa96464b-99c3-45c9-8b95-2e68c3a2224a	690f3be0-2d35-4397-b3bb-59f782bfac8d	std-1.1.7	1	0	\N	5	5	https://a5002b18-b6d5-4933-979a-3a5dc1d5f223-00-1hqb6aqvhuopf.spock.replit.dev/capacitacion-copasst	\N		\N	\N	2025-12-18 21:56:30.893048
456f9610-d14d-486d-a353-60e4ae8a5d16	690f3be0-2d35-4397-b3bb-59f782bfac8d	std-3.1.8	1	0	\N	10	10		\N		\N	\N	2025-12-25 21:12:49.930996
\.


--
-- Data for Name: revisiones_direccion; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.revisiones_direccion (id, company_id, codigo, fecha_revision, periodicidad, titulo, estado, lugar, duracion, antecedentes, resumen_ejecutivo, conclusiones, aprobado_por, fecha_aprobacion, proxima_revision, creado_por, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: road_incidents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.road_incidents (id, company_id, vehicle_id, driver_id, incident_date, incident_time, location, type, custom_type, severity, description, weather_conditions, road_conditions, witnesses, authorities_notified, police_report, injuries, fatalities, estimated_cost, root_cause, corrective_actions, preventive_actions, created_at) FROM stdin;
\.


--
-- Data for Name: road_safety_attendees; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.road_safety_attendees (id, training_id, driver_id, attended, score, certificate, created_at) FROM stdin;
\.


--
-- Data for Name: road_safety_trainings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.road_safety_trainings (id, company_id, title, description, instructor, training_date, start_time, end_time, location, topics, total_attendees, status, created_at) FROM stdin;
\.


--
-- Data for Name: rutas_evacuacion; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rutas_evacuacion (id, company_id, plan_emergencia_id, nombre, origen, destino_zona_id, tipo, distancia_metros, tiempo_estimado_segundos, capacidad_flujo, ancho_metros, numero_escaleras, tiene_rampa, iluminacion_emergencia, "señalizacion_fotoluminiscente", obstaculos_identificados, estado, plano_referencia, observaciones, created_at, updated_at, zona_origen_id, codigo, descripcion, punto_inicio, punto_fin, tiene_escaleras, senalizacion_completa, ruta_principal, activa) FROM stdin;
\.


--
-- Data for Name: seguimiento_recomendaciones; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.seguimiento_recomendaciones (id, recomendacion_id, fecha_seguimiento, accion_realizada, avance_reportado, observaciones, registrado_por, created_at) FROM stdin;
\.


--
-- Data for Name: seguimientos_cambios; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.seguimientos_cambios (id, company_id, cambio_id, fecha_seguimiento, responsable, tipo_seguimiento, controles_efectivos, capacitacion_completada, documentacion_actualizada, incidentes_relacionados, descripcion_incidentes, hallazgos, no_conformidades, mejoras, acciones_correctivas, plazo_acciones, cambio_exitoso, observaciones, created_at, updated_at) FROM stdin;
981ec0b5-b7c1-46a4-b303-0fcde93200e6	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	c2b9b898-545f-4777-874c-ef2774d753bd	2025-12-23	Sistema de Automatización SST	automatico	\N	\N	\N	0	\N	\nAUTOMATIZACIÓN: Matriz de Riesgos\n- Tipo de cambio: interno - personal\n- Área afectada: Testing\n- Proceso afectado: Ensamble de productos\n- Trabajadores afectados: 2\n- Evaluaciones de impacto: 1 realizadas\n- Impacto alto detectado: Sí\n- Peligros identificados: sdxcfgvbhjn\n- Acción requerida: El coordinador SST debe revisar y actualizar la matriz de riesgos IPERC\n	\N	\N	\N	\N	\N	Seguimiento automático generado - Requiere actualización de Matriz de Riesgos	2025-12-23 11:56:40.061784	2025-12-23 11:56:40.061784
6f94380d-bca7-43ed-aaa3-dec0632013f3	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	c2b9b898-545f-4777-874c-ef2774d753bd	2025-12-23	Sistema de Automatización SST	automatico	\N	\N	\N	0	\N	Se identificó que el cambio "Cambio Funcional 62-H80" puede afectar el cumplimiento legal. Tipo: interno. Se recomienda revisar la matriz legal y actualizar requisitos normativos aplicables.	\N	\N	\N	\N	\N	Seguimiento automático - Revisión de Matriz Legal requerida	2025-12-23 11:56:41.093842	2025-12-23 11:56:41.093842
35e95646-051a-433c-8b38-87021df3ef89	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	c2b9b898-545f-4777-874c-ef2774d753bd	2025-12-23	Sistema de Automatización SST	automatico	\N	\N	\N	0	\N	Notificaciones enviadas a: Luz Adriana Diaz Calle, coordinador_sst_demo, admin	\N	\N	\N	\N	\N	Notificación automática de cambio aprobado	2025-12-23 11:56:41.388581	2025-12-23 11:56:41.388581
\.


--
-- Data for Name: seguimientos_proveedores; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.seguimientos_proveedores (id, company_id, proveedor_id, fecha_seguimiento, tipo_seguimiento, responsable, cumple_requisitos, hallazgos, no_conformidades, acciones_correctivas, plazo_implementacion, estado_acciones, observaciones, created_at, updated_at) FROM stdin;
7c49549f-cba5-4e13-908c-68cef0b3e9bd	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	9c07b565-92e6-4fe2-84c3-d5be7bfe0811	2025-12-17	inspeccion	Administrador del Sistema	1	Se identifican buenas prácticas		Realizar capacitación específica. Reforzar procedimiento operativo	2025-12-25	completado		2025-12-17 11:02:50.124313	2025-12-17 11:02:50.124313
675a9964-daea-45f2-96c5-f070e9f51bcf	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	300e7670-90ba-4a08-a848-d75c7b6b970d	2025-12-17	inspeccion	Administrador del Sistema	0	Uso correcto de EPP: No cumple. Señalización de seguridad: No cumple. Orden y aseo: No cumple. Rutas de emergencia: No cumple	EPP incompleto o inadecuado. Documentación vencida o incompleta. Falta de capacitación en SST	Actualizar documentación faltante. Implementar control de riesgo. Revisar y actualizar matriz de peligros. Reforzar procedimiento operativo	2025-12-19	pendiente		2025-12-17 11:15:27.162487	2025-12-17 11:15:27.162487
\.


--
-- Data for Name: sesiones_induccion_virtual; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sesiones_induccion_virtual (id, company_id, worker_id, token, tipo_induccion, estado, fecha_envio, fecha_expiracion, fecha_inicio, fecha_finalizacion, contenidos_vistos, progreso_evaluacion, puntaje_evaluacion, aprobado, firma_digital, fecha_firma, ip_firma, user_agent_firma, datos_adicionales, registro_induccion_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.session (sid, sess, expire) FROM stdin;
NVt1_czeOd0cvueHDmDVca2r6mMk-oqN	{"cookie":{"originalMaxAge":43200000,"expires":"2025-12-27T11:14:04.131Z","secure":false,"httpOnly":true,"path":"/","sameSite":"strict"},"passport":{"user":"360f5e46-96e8-47a0-9c5b-0bbf1c2cecf1"}}	2025-12-27 11:14:05
BLMaNlDDfEfe1N6Eh1F_XQUwcFeK2P5f	{"cookie":{"originalMaxAge":43200000,"expires":"2025-12-27T11:11:06.581Z","secure":false,"httpOnly":true,"path":"/","sameSite":"strict"},"passport":{"user":"360f5e46-96e8-47a0-9c5b-0bbf1c2cecf1"}}	2025-12-27 11:11:13
fF3rNF_XPpoMw0tCNWRUXXLs1vn5yTJb	{"cookie":{"originalMaxAge":43200000,"expires":"2025-12-27T11:09:20.170Z","secure":false,"httpOnly":true,"path":"/","sameSite":"strict"},"passport":{"user":"360f5e46-96e8-47a0-9c5b-0bbf1c2cecf1"}}	2025-12-27 11:10:39
0HrSsQGQg7Mu3X4NqcchiepC8-ld1vMA	{"cookie":{"originalMaxAge":43200000,"expires":"2025-12-27T20:07:27.973Z","secure":false,"httpOnly":true,"path":"/","sameSite":"strict"},"passport":{"user":"360f5e46-96e8-47a0-9c5b-0bbf1c2cecf1"}}	2025-12-27 20:08:46
lZqNjnDDbKGQSxZzjZhcNHpNjah9cQtT	{"cookie":{"originalMaxAge":43200000,"expires":"2025-12-27T11:16:49.333Z","secure":false,"httpOnly":true,"path":"/","sameSite":"strict"},"passport":{"user":"360f5e46-96e8-47a0-9c5b-0bbf1c2cecf1"}}	2025-12-27 11:16:50
QkgNy9-Z7wa2eiabJIBTcMu99fH2gCpH	{"cookie":{"originalMaxAge":43200000,"expires":"2025-12-26T22:18:08.912Z","secure":false,"httpOnly":true,"path":"/","sameSite":"strict"},"passport":{"user":"360f5e46-96e8-47a0-9c5b-0bbf1c2cecf1"}}	2025-12-27 10:08:54
y8qL8d9YIxFl41RTtMohq8qgPSCIeF6q	{"cookie":{"originalMaxAge":43200000,"expires":"2025-12-27T11:04:29.729Z","secure":false,"httpOnly":true,"path":"/","sameSite":"strict"},"passport":{"user":"360f5e46-96e8-47a0-9c5b-0bbf1c2cecf1"}}	2025-12-27 11:17:24
ygZIFG_hupcHfNtaHERJUg7WfY34pRBk	{"cookie":{"originalMaxAge":43200000,"expires":"2025-12-27T11:12:17.348Z","secure":false,"httpOnly":true,"path":"/","sameSite":"strict"},"passport":{"user":"360f5e46-96e8-47a0-9c5b-0bbf1c2cecf1"}}	2025-12-27 11:12:18
j_Coz0Lfde8SLGMa4kH9s-a8r20fsbdc	{"cookie":{"originalMaxAge":43200000,"expires":"2025-12-27T20:04:57.674Z","secure":false,"httpOnly":true,"path":"/","sameSite":"strict"},"passport":{"user":"360f5e46-96e8-47a0-9c5b-0bbf1c2cecf1"}}	2025-12-27 20:05:42
\.


--
-- Data for Name: simulacros; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.simulacros (id, company_id, plan_emergencia_id, nombre, tipo_emergencia, objetivo, alcance, fecha_programada, hora_programada, duracion_estimada_minutos, fecha_ejecucion, hora_inicio, hora_fin, duracion_real_minutos, coordinador_id, estado, participantes_esperados, participantes_reales, brigadas_participantes, recursos_utilizados, tiempo_respuesta_segundos, tiempo_evacuacion_segundos, evaluacion_general, fortalezas, debilidades, oportunidades_mejora, plan_accion, observaciones, created_at, updated_at, codigo, descripcion, escenario, duracion_estimada, duracion_real, tipo, tiempo_evacuacion, numero_participantes, numero_evacuados, avisado, coordinador_nombre, coordinador_cargo, aspectos_positivos, aspectos_mejorar, lecciones_aprendidas, calificacion_general, acciones_mejora, responsable_seguimiento, fecha_seguimiento, capacitacion_evento_id) FROM stdin;
\.


--
-- Data for Name: solicitudes_adquisicion; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.solicitudes_adquisicion (id, company_id, numero_solicitud, fecha_solicitud, solicitante, departamento, area, tipo_adquisicion, descripcion, justificacion, cantidad, unidad, presupuesto_estimado, nivel_riesgo, peligros_asociados, requiere_evaluacion, proveedor_propuesto_id, proveedor_nombre, estado, fecha_evaluacion, evaluador, aprobado, motivo_rechazo, condiciones, fecha_compra, fecha_recepcion, observaciones, created_at, updated_at, recurso_financiero_id) FROM stdin;
e7aafd87-0d9a-4af0-93e8-54c276694805	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	ADQ-001-2025	2025-12-18	Luz Adriana Diaz Calle - Analista de Recursos Humanos		produccion	epp	Casco de Seguridad Industrial Clase G - Casco de seguridad para protección contra impactos y golpes, con sistema de suspensión ajustable	Adquisición de Casco de Seguridad Industrial Clase G según norma NTC 1523. Clase G (General): Protección contra impactos. Materiales: Polietileno de alta densidad o ABS	1	\N	500000	medio	\N	1	\N	Proveedor Prueba	solicitud	\N	\N	\N	\N	\N	\N	\N		2025-12-18 21:57:15.617806	2025-12-18 21:57:15.617806	806e1f24-ac21-417d-b8d1-8f96388643f0
\.


--
-- Data for Name: sst_document_access_log; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sst_document_access_log (id, document_id, user_id, access_type, accessed_at, ip_address, user_agent) FROM stdin;
\.


--
-- Data for Name: sst_document_alerts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sst_document_alerts (id, document_id, alert_type, scheduled_date, sent_at, recipient_ids, subject, message, status, created_at) FROM stdin;
\.


--
-- Data for Name: sst_document_versions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sst_document_versions (id, document_id, version_number, change_description, change_type, file_url, file_name, file_size, created_by, created_at, approved_by, approved_at, previous_status, new_status) FROM stdin;
\.


--
-- Data for Name: sst_documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sst_documents (id, company_id, code, title, description, category, sst_standards, phva_cycle, current_version, status, file_url, file_name, file_size, mime_type, created_date, effective_date, expiration_date, next_review_date, retention_years, archive_date, delete_after_date, prepared_by, reviewed_by, approved_by, approval_date, is_confidential, access_roles, auto_alert_days, last_alert_sent, alert_recipients, tags, related_documents, external_references, notes, created_by, updated_by, created_at, updated_at, document_date) FROM stdin;
\.


--
-- Data for Name: sst_evaluation_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sst_evaluation_items (id, evaluation_id, item_id, score, observations, evidence_url, created_at) FROM stdin;
\.


--
-- Data for Name: sst_evaluations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sst_evaluations (id, company_id, standard_type, title, description, evaluation_date, evaluator, total_score, max_total_score, compliance_percentage, status, observations, created_at, elaborado_por_id, autorizado_por_id, aprobado_por_id) FROM stdin;
\.


--
-- Data for Name: sst_evidence; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sst_evidence (id, evaluation_item_id, file_name, file_url, file_type, description, upload_date) FROM stdin;
\.


--
-- Data for Name: sst_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sst_items (id, standard_id, item_number, description, evaluation_criteria, max_score, "order", created_at) FROM stdin;
\.


--
-- Data for Name: sst_standards; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sst_standards (id, standard_type, name, description, phva_cycle, max_score, "order", clause_number, created_at) FROM stdin;
60146c99-f615-4c04-9452-2a9f944fc67b	RES_0312	Recursos	Recursos financieros, técnicos, humanos y de otra índole requeridos para coordinar y desarrollar el Sistema de Gestión de SST	planear	10	1	\N	2025-10-18 18:06:27.754947
1f933b8c-085a-4f07-b64b-a3bd101a6432	RES_0312	Gestión Integral del SG-SST	Política, objetivos, planificación, aplicación, evaluación, auditoría y acciones de mejora con el propósito de anticipar, reconocer, evaluar y controlar los riesgos	planear	15	2	\N	2025-10-18 18:06:27.754947
21f56527-2e78-4357-abf4-6f8f6ed9ebde	RES_0312	Gestión de la Salud	Evaluaciones médicas ocupacionales, restricciones y recomendaciones médico laborales, estilos de vida y entorno saludable, custodia de historias clínicas	hacer	20	3	\N	2025-10-18 18:06:27.754947
6b4f550d-d13b-44db-aaba-5c326a5f9e4e	RES_0312	Gestión de Peligros y Riesgos	Identificación de peligros, evaluación y valoración de riesgos, medidas de prevención y control, prevención y preparación ante emergencias	hacer	30	4	\N	2025-10-18 18:06:27.754947
1b9917cb-dd59-4dea-b00f-62033f829d3f	RES_0312	Gestión de Amenazas	Prevención, preparación y respuesta ante emergencias. Plan de prevención, preparación y respuesta ante emergencias	hacer	10	5	\N	2025-10-18 18:06:27.754947
91c3da17-5ca2-4301-a2fe-d80028cbe13a	RES_0312	Verificación del SG-SST	Gestión y resultados del SG-SST: Revisión por la alta dirección, investigación de incidentes y accidentes	verificar	5	6	\N	2025-10-18 18:06:27.754947
c3d03c0f-9c93-43f6-8b1f-f3cc3c4f16d9	RES_0312	Mejoramiento	Acciones preventivas y correctivas con base en los resultados del SG-SST. Acciones de mejora conforme a revisión de la alta dirección	actuar	10	7	\N	2025-10-18 18:06:27.754947
\.


--
-- Data for Name: subscription_plans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subscription_plans (id, name, display_name, description, price_monthly, price_yearly, currency, max_workers, max_users, max_companies, features, trial_days, status, is_popular, sort_order, created_at, updated_at, tagline, max_sedes, storage_gb, has_iperc_completo, has_auditorias, has_pesv, has_revision_direccion, has_gestion_cambios, has_matriz_legal, has_objetivos_indicadores, has_evaluacion_proveedores, has_comunicacion_sst, has_adquisiciones_sst, has_dashboards_ejecutivos, has_pdfs_normativos, has_examenes_medicos, has_mediciones_ambientales, has_sustancias_quimicas, has_copasst, has_comite_convivencia, has_api, has_exportacion_masiva, has_white_label, has_sla, has_gerente_cuenta, has_consultoria_sst, horas_consultoria_mes, support_level, support_response_time, capacitaciones_anuales, horas_por_capacitacion, is_recommended) FROM stdin;
d5ab30ed-6eb6-4e9b-9115-33aebe04012f	microempresa	Microempresa	Empresas de 1 a 10 trabajadores - Capítulo I Res. 0312/2019	19900000	199000000	COP	10	3	1	{"Gestión de trabajadores y contratos","Capacitaciones con asistente inteligente (50+ temas)","Inspecciones con checklist predefinidos (20+ tipos)","Registro de accidentes e incidentes","Matriz IPERC simplificada (GTC-45)","Políticas SST con generación automatizada","Reportes básicos para Ministerio de Trabajo","Portal de empleados","Soporte por email (48h respuesta)"}	30	active	0	1	2025-11-18 11:28:50.1426	2025-11-18 11:28:50.1426	Ideal para microempresas (1-10 trabajadores)	1	5	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	email	48h	0	0	0
ab52394e-d689-46a8-8601-77bc711d6260	pequena	Pequeña Empresa	Empresas de 11 a 49 trabajadores - Capítulo II Res. 0312/2019	49900000	499000000	COP	50	10	1	{"✅ TODO de Plan Esencial +","IPERC completo con asistente GTC-45 (60+ peligros)","Auditorías Internas SST con templates","Gestión de Cambios automatizada","Matriz Legal actualizada automáticamente","Objetivos e Indicadores SST (cálculo automático)","Evaluación de Proveedores y Contratistas","Comunicación SST (tableros, carteleras)","Adquisiciones SST","Dashboards ejecutivos PHVA (HACER, VERIFICAR, ACTUAR)","Generación automática de PDFs normativos","Soporte prioritario (chat + email, 24h respuesta)"}	45	active	1	2	2025-11-18 11:28:50.272097	2025-11-18 11:28:50.272097	Ideal para pequeñas empresas (11-50 trabajadores)	3	20	1	1	0	0	1	1	1	1	1	1	1	1	0	0	0	0	0	0	0	0	0	0	0	0	chat_email	24h	0	0	1
ab23d295-663b-40cc-9776-4d09a5a0acef	mediana	Mediana Empresa	Empresas de 50 a 199 trabajadores - Capítulo III Res. 0312/2019	99900000	999000000	COP	200	25	1	{"✅ TODO de Plan Profesional +","PESV completo (vehículos, conductores, inspecciones, siniestros)","Revisión por Dirección (ISO 45001:2018)","Exámenes médicos y vigilancia epidemiológica","Mediciones ambientales (ruido, iluminación, temperatura)","Gestión de sustancias químicas","COPASST (actas, elecciones, reuniones)","Comité de Convivencia (actas, casos)","Múltiples sedes (hasta 5)","API REST para integraciones","Exportación masiva de datos (Excel, CSV)","Soporte telefónico dedicado (12h respuesta)","Capacitación virtual incluida (2 sesiones/año, 4h c/u)"}	60	active	0	3	2025-11-18 11:28:50.391626	2025-11-18 11:28:50.391626	Ideal para medianas empresas (51-200 trabajadores)	5	100	1	1	1	1	1	1	1	1	1	1	1	1	1	1	1	1	1	1	1	0	0	0	0	0	phone	12h	2	4	0
d67ec544-c396-4080-9064-204b614e3e07	grande	Gran Empresa	Empresas de 200+ trabajadores - Capítulo III+ Res. 0312/2019	199900000	1999000000	COP	-1	-1	1	{"✅ TODO de Plan Empresarial +","Trabajadores ilimitados","Sedes ilimitadas","Usuarios administradores ilimitados","Personalización de módulos y campos","White-label (marca propia, logo, colores)","SLA garantizado 99.9% (uptime)","Backups diarios automáticos (retención 90 días)","Disaster Recovery Plan","Gerente de cuenta dedicado","Capacitación presencial (4 sesiones/año, 8h c/u)","Consultoría SST incluida (4 horas/mes con profesional licenciado)","Integración con ERPs corporativos (SAP, Oracle, Dynamics)","Single Sign-On (SSO) SAML/OAuth","Auditoría de logs completa","Soporte 24/7 (teléfono, chat, email)","Prioridad en roadmap de producto"}	90	active	0	4	2025-11-18 11:28:50.517958	2025-11-18 11:28:50.517958	Ideal para grandes empresas (+200 trabajadores)	-1	500	1	1	1	1	1	1	1	1	1	1	1	1	1	1	1	1	1	1	1	1	1	1	1	4	24_7	2h	4	8	0
microempresa	microempresa	Microempresa	Plan ideal para microempresas con hasta 10 trabajadores. Cumplimiento del Capítulo I de la Resolución 0312/2019.	2000000	21600000	COP	10	2	1	{"Gestión de trabajadores","Registro de accidentes e incidentes","Capacitaciones SST","Inspecciones básicas","Documentos SST esenciales","Soporte técnico por email"}	14	active	0	1	2025-12-04 09:51:45.948707	2025-12-04 09:51:45.948707	Empresas de 1 a 10 trabajadores	1	2	0	0	0	0	0	0	0	0	0	0	0	1	1	0	0	0	0	0	0	0	0	0	0	0	email	48h	0	0	0
pequena	pequena	Pequeña Empresa	Plan para pequeñas empresas de 11 a 49 trabajadores. Cumplimiento del Capítulo II de la Resolución 0312/2019.	2200000	23760000	COP	49	5	1	{"Todo lo del plan Microempresa","IPERC completo con GTC-45","Auditorías internas SST","Matriz legal básica","Gestión de proveedores","Objetivos e indicadores SST","Soporte técnico prioritario"}	14	active	0	2	2025-12-04 09:51:46.07557	2025-12-04 09:51:46.07557	Empresas de 11 a 49 trabajadores	2	5	1	1	0	0	0	1	1	1	0	0	0	1	1	0	0	1	0	0	0	0	0	0	0	0	chat_email	24h	2	2	1
mediana	mediana	Mediana Empresa	Plan completo para medianas empresas de 50 a 199 trabajadores. Cumplimiento total del Capítulo III de la Resolución 0312/2019.	2400000	25920000	COP	199	10	1	{"Todo lo del plan Pequeña Empresa","Módulo PESV completo","Revisión por la Dirección","Gestión de cambios","Gestión de adquisiciones","Sistema de comunicaciones SST","Reportes avanzados","Compatible ISO 45001:2018"}	14	active	0	3	2025-12-04 09:51:46.216806	2025-12-04 09:51:46.216806	Empresas de 50 a 199 trabajadores	5	15	1	1	1	1	1	1	1	1	1	1	1	1	1	1	1	1	1	0	1	0	0	0	0	0	phone	12h	4	2	0
grande	grande	Gran Empresa	Plan empresarial para grandes empresas con 200+ trabajadores. Cumplimiento total de la Resolución 0312/2019 y certificación ISO 45001:2018.	2600000	28080000	COP	-1	-1	1	{"Todo lo del plan Mediana Empresa","Usuarios ilimitados","Sedes ilimitadas","Acceso API completo","Consultor SST dedicado","Personalización de marca","Soporte 24/7","SLA garantizado 99.9%"}	14	active	0	4	2025-12-04 09:51:46.335863	2025-12-04 09:51:46.335863	Empresas de 200+ trabajadores	-1	50	1	1	1	1	1	1	1	1	1	1	1	1	1	1	1	1	1	1	1	1	1	1	1	4	24_7	2h	12	2	0
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subscriptions (id, company_id, plan_id, status, billing_interval, current_period_start, current_period_end, trial_start, trial_end, cancel_at_period_end, canceled_at, cancellation_reason, last_payment_date, next_payment_date, failed_payment_attempts, notes, created_at, updated_at, metadata, contract_accepted_at, contract_terms_version, contract_data) FROM stdin;
7483f886-33f7-4ab4-ae5c-af8a20c958df	abc0795d-73cd-4294-9bd5-7ba2872c203a	d5ab30ed-6eb6-4e9b-9115-33aebe04012f	active	monthly	2025-12-08 12:59:45.732393	2026-01-07 12:59:45.732393	\N	\N	0	\N	\N	\N	\N	0	\N	2025-12-08 12:59:45.732393	2025-12-08 12:59:45.732393	\N	\N	\N	\N
c2a0e970-5fba-4f80-91fb-617561e1b63b	d3296e1d-415e-4223-a6a3-68740b517685	ab52394e-d689-46a8-8601-77bc711d6260	suspended	monthly	2025-12-04 09:11:47.043	2025-12-18 09:11:47.043	2025-12-04 09:11:47.043	2025-12-18 09:11:47.043	0	\N	\N	\N	\N	0	\N	2025-12-04 09:11:47.043	2025-12-21 20:07:06.977	\N	\N	\N	\N
7756816a-a4f1-43bb-bb0a-5f7e692f802c	fe08737b-d9ba-4bba-8477-4734d59a093e	d5ab30ed-6eb6-4e9b-9115-33aebe04012f	suspended	monthly	2025-12-03 16:57:39.021	2025-12-17 16:57:39.021	2025-12-03 16:57:39.021	2025-12-17 16:57:39.021	0	\N	\N	\N	\N	0	\N	2025-12-03 16:57:39.021	2025-12-21 20:07:08.635	\N	\N	\N	\N
5eba0ff1-1923-4814-8a23-a396f34537aa	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	grande	active	monthly	2025-12-23 22:34:31.412952	2026-01-23 22:34:31.412952	\N	\N	0	\N	\N	\N	\N	0	\N	2025-12-23 22:34:31.412952	2025-12-23 22:34:31.412952	\N	\N	\N	\N
\.


--
-- Data for Name: support_access_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.support_access_events (id, session_id, event_type, actor_id, actor_name, actor_role, details, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- Data for Name: support_access_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.support_access_sessions (id, session_number, support_user_id, support_user_name, company_id, company_name, status, justification, scope, related_ticket_id, related_ticket_number, approved_by, approved_by_name, approved_at, denial_reason, requested_duration_minutes, expires_at, created_at, revoked_at, revoked_reason, legal_basis, data_processing_purpose) FROM stdin;
\.


--
-- Data for Name: support_tickets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.support_tickets (id, ticket_number, company_id, company_name, user_id, user_name, user_email, subject, description, category, priority, status, assigned_to, assigned_to_name, attachments, resolution, resolved_at, resolved_by, satisfaction_rating, satisfaction_comment, created_at, updated_at, closed_at) FROM stdin;
\.


--
-- Data for Name: sve_cases; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sve_cases (id, company_id, program_id, worker_id, evaluation_date, evaluation_type, evaluated_by, findings, results, classification, recommendations, follow_up_date, interventions, additional_data, observations, created_at) FROM stdin;
\.


--
-- Data for Name: sve_programs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sve_programs (id, company_id, name, risk_type, objective, target_population, inclusion_criteria, exclusion_criteria, protocol, prevention_activities, control_measures, responsible_name, responsible_position, indicators, start_date, review_date, status, observations, created_at) FROM stdin;
da741590-371d-4c5d-bf3a-ce1ef0ee6a92	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	SVE Riesgo Biomecánico (DME)	biomecanico	Prevenir, identificar y controlar los Desórdenes Músculo Esqueléticos (DME) en trabajadores expuestos a factores de riesgo biomecánico mediante vigilancia activa y medidas de intervención	Trabajadores con exposición a posturas prolongadas, movimientos repetitivos y manipulación manual de cargas	\N	\N		\N	\N	Fisioterapeuta SST		\N	2025-12-25	2026-12-25	activo	\N	2025-12-25 06:06:50.755001
\.


--
-- Data for Name: temas_revision; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.temas_revision (id, revision_id, company_id, titulo, descripcion, responsable_presentacion, tiempo_asignado, orden, conclusiones, created_at, updated_at, tipo, datos_analisis, hallazgos, oportunidades_mejora) FROM stdin;
\.


--
-- Data for Name: ticket_responses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ticket_responses (id, ticket_id, user_id, user_name, user_role, is_staff, content, attachments, is_internal, created_at) FROM stdin;
\.


--
-- Data for Name: ticket_status_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ticket_status_history (id, ticket_id, previous_status, new_status, changed_by, changed_by_name, reason, created_at) FROM stdin;
\.


--
-- Data for Name: trabajadores_alto_riesgo; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.trabajadores_alto_riesgo (id, company_id, worker_id, fecha, certificado_arl_url, observaciones, created_at) FROM stdin;
9f1973c0-a1bf-4ae0-ad3b-5236b83fef0b	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	2025-12-18	/objects/uploads/alto-riesgo/0ce3599a-902c-4f46-9065-0021ad7e48e8.pdf	ACTIVIDAD DE ALTO RIESGO: Exposición a sustancias cancerígenas (Decreto 2090/2003)\n\nREQUISITOS ESPECIALES:\n• Identificación de sustancias cancerígenas (Grupo 1 IARC)\n• Fichas de seguridad (SDS) actualizadas\n• Exámenes médicos: biomarcadores específicos según exposición\n• Capacitación en manejo seguro de sustancias peligrosas\n• EPP: respiradores con filtros específicos, trajes de protección química, guantes químicos\n\nCONTROLES:\n• Sustitución por sustancias menos peligrosas\n• Sistemas de ventilación localizada\n• Procedimientos de trabajo seguro\n• Monitoreo ambiental\n\nVIGILANCIA EPIDEMIOLÓGICA:\n• Programa específico según tipo de exposición\n• Seguimiento post-ocupacional\n• Registro de expuestos\n\nCERTIFICACIÓN ARL: Cotización especial clase V	2025-12-18 09:50:17.090784
\.


--
-- Data for Name: training_attendees; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.training_attendees (id, training_id, worker_id, attended, created_at) FROM stdin;
\.


--
-- Data for Name: training_programs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.training_programs (id, company_id, year, title, general_objective, specific_objectives, scope, target_population, responsible, copasst_approval, copasst_approval_date, human_resources, technical_resources, financial_budget, methodology, status, observations, created_at, updated_at) FROM stdin;
94f0a35f-7553-4f6d-930a-00c2735c562f	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	2025	Programa de Capacitación y Prevención SST 2025	Identificar los peligros, evaluar y valorar los riesgos, y establecer los respectivos controles para minimizar la probabilidad de ocurrencia de accidentes de trabajo y enfermedades laborales.	[]	Todas las actividades, procesos y áreas de trabajo	Todos los trabajadores de la organización (administrativos y operativos), contratistas, miembros del COPASST/Vigía SST, brigada de emergencias y alta dirección	Responsable del Sistema de Gestión de Seguridad y Salud en el Trabajo	0	\N	\N	\N	\N	Presencial / Virtual - Sesiones teórico-prácticas, talleres, simulacros, evaluaciones escritas y prácticas. Frecuencia según cronograma anual establecido.	aprobado		2025-12-11 17:13:45.649861	2025-12-11 17:13:56.913373
1c0f804d-c5e8-4381-be03-43177500aae1	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	2025	Programa de Capacitación y Prevención SST 2025	Cumplir con la normatividad nacional vigente en materia de Seguridad y Salud en el Trabajo, estableciendo mecanismos de seguimiento y medición del desempeño del SG-SST.	[]	Aplica a todos los trabajadores, contratistas y visitantes en todas las sedes de la empresa	Todos los trabajadores de la organización (administrativos y operativos), contratistas, miembros del COPASST/Vigía SST, brigada de emergencias y alta dirección	Responsable del Sistema de Gestión de Seguridad y Salud en el Trabajo	0	\N	\N	\N	\N	Presencial / Virtual - Sesiones teórico-prácticas, talleres, simulacros, evaluaciones escritas y prácticas. Frecuencia según cronograma anual establecido.	aprobado	\N	2025-12-11 17:40:36.166821	2025-12-11 17:40:36.166821
\.


--
-- Data for Name: trainings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.trainings (id, company_id, title, description, instructor, date, start_time, end_time, location, total_workers, status, created_at, validity_months) FROM stdin;
6f6edbe7-4177-41ef-b96d-eddf6525d626	76050645-7d63-46af-953b-bc86727b596f	Inducción SST	Capacitación inicial en seguridad y salud en el trabajo para nuevos empleados	María López	2024-11-15	08:00	12:00	Sala de Capacitación	10	completada	2025-12-02 14:45:09.576174	12
4a9f8111-a398-4b8b-9d9e-d8b5dc932401	76050645-7d63-46af-953b-bc86727b596f	Manejo de Extintores	Uso correcto de extintores y prevención de incendios	Bomberos Voluntarios	2024-11-20	14:00	17:00	Patio Principal	25	completada	2025-12-02 14:45:09.576174	12
d57fea04-854a-4d20-ac25-f60d69b38cc9	76050645-7d63-46af-953b-bc86727b596f	Trabajo en Alturas	Capacitación certificada para trabajo en alturas según Resolución 1409/2012	SENA	2024-12-10	07:00	16:00	Centro de Entrenamiento SENA	8	programada	2025-12-02 14:45:09.576174	12
c026c2c9-4608-4289-bf5a-3e94265cf4f8	76050645-7d63-46af-953b-bc86727b596f	Primeros Auxilios	Técnicas básicas de primeros auxilios y RCP	Cruz Roja	2024-12-15	08:00	17:00	Sala de Capacitación	15	programada	2025-12-02 14:45:09.576174	24
2f110908-fe70-443a-a7fc-601ba2ac5d41	abc0795d-73cd-4294-9bd5-7ba2872c203a	Espacios Confinados	Capacitación sobre identificación de espacios confinados, evaluación de atmósferas peligrosas, procedimientos de entrada segura, uso de equipos de ventilación y rescate.	Carlos Rodríguez - Supervisor	2025-12-11	18:27	18:30	BODEGA	10	programada	2025-12-10 17:28:06.998393	12
14fc68cd-9cb4-4ecb-a2f1-98169a8478ff	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	Uso y Mantenimiento de Elementos de Protección Personal (EPP)	Capacitación sobre selección, uso correcto, mantenimiento y almacenamiento de EPP. Incluye cascos, gafas, guantes, protección auditiva, respiratoria y equipos de protección contra caídas.	Luz Adriana Diaz Calle - Analista de Recursos Humanos	2025-12-11	19:44	22:46	BODEGA	4	programada	2025-12-11 17:42:38.568019	12
42e0326c-88ca-41a6-8cde-f891f516c9a2	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	Manejo Seguro de Sustancias Químicas	Capacitación en identificación de sustancias peligrosas, interpretación de fichas de seguridad (SDS), Sistema Globalmente Armonizado (SGA), uso de EPP químico y respuesta a derrames.	Luz Adriana Diaz Calle - Analista de Recursos Humanos	2025-12-19	08:33	14:40	BODEGA	10	programada	2025-12-19 07:34:37.804839	12
bf0e30bf-172f-4993-a886-7c462f7240e7	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	Actividad Test Vnb1b3	Objetivo de prueba para el sistema SST		2025-12-23				1	programada	2025-12-23 22:37:52.783299	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, password, role, company_id, worker_id, full_name, email, department, created_at, email_verification_token, email_verification_expires, email_verified_at, selected_plan, trial_ends_at, support_specialties, password_reset_token, password_reset_expires, sst_profession_type, sst_license_number, sst_license_issuer, sst_license_issued_at, sst_license_expires_at, sst_license_status) FROM stdin;
4c95867f-e84f-4236-9ea7-cc3cd53d36dd	worker_test_1761906267488	295e0857f0e5e71e67874f466e0e96cea9dfc1e52f19628a67f312fb518f726a5235aded966a905f04d188500e5a7e1e4efe8302a5566fd57c25cfe3e67d45d4.7e8f103e217a38f67a99ad8377462b00	trabajador	\N	\N	\N	\N	\N	2025-10-31 10:24:32.376407	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
45db485d-7079-4225-9900-b597cf9c8b40	testuser_PDHtmu	dbb21ea5bf92abd5a66c6d99696b77431a9fab2d99cd87d5064fd0b9429958b72c265ada7a83243080f81a5bfa4faa0bef02517e6846ee43fd82333c3ef08215.bb468939fb9482002ea882b9687c8e6a	trabajador	\N	\N	\N	\N	\N	2025-10-18 17:49:40.741843	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
5a091d39-ce82-48e7-85e9-c07c52c69d52	coord_sst_KfMP	b08c4383a85af4521dbaaacc9c74e79e67ecf79ccf1e8c724de44264783cb353eea0d66d82125d2c54cbcb5744f4b50c3202012d5e214bdde127a6b3e88da6c6.837dc450be4300646e3a27118931ef80	coordinador_sst	\N	\N	Test Coordinador SST	coord_sst_KfMP@example.com	Seguridad	2025-10-18 11:11:39.078514	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
39155276-fa11-4dfe-ae2c-fde5b2875fd7	e2e_test_user	090604398a9fcd72c00c28753aa1ee29778824fc85807ee5f95908c3c6362b6154b40a435ae7b97d9267b6faeaaf9edf41fb6d9141f0a4dd1a7e22f528abda1d.276389991b982e5d1bc52bfdd544f40d	trabajador	\N	\N	\N	\N	\N	2025-10-21 04:50:32.371841	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
47fd7d15-be0a-4891-97d3-77667e129476	testuser+ayGLRj@example.com	168915cabdca911fb10920331fc35a497600233a2303596f6a05366fd7fecc79b334e04c965cde78ba7960f3018f0b4721a2d334f8869690d508259768327490.54c0c609b0cac531ba90b75d426b1eb4	trabajador	\N	\N	\N	\N	\N	2025-10-25 05:41:14.782704	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
6a35a300-2db2-4010-a2a0-1b3de00cf997	supervisor_Tgpk	a16919cd834aad323b2685e9493163b3aff7d3391b0055df512cd052fd45a95385651402ebd1d37341dd0ea2ba754b95f4be43ba8170e1df0e170ec8a6449ade.3f86ecf783aff542b86fe5c8030465e1	supervisor	\N	\N	Test Supervisor	supervisor_Tgpk@example.com	Operaciones	2025-10-18 11:15:12.121467	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
4f872a17-6e5f-4a75-a9b5-f1fc6699def3	worker_8YtP	b3eebc4b2cfb0cb27033633f94210a5a13b8f7a4d394a8803ed4487b6cbf794d7adeaba939fd1bf57bb6f624bdb67a1fa20ae270e5e96745058b6d6c09ec6ff8.3f833f320501f8361ebb153606b165a5	trabajador	\N	\N	Test Trabajador	worker_8YtP@example.com	Producción	2025-10-18 11:17:00.362933	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
d218d494-b695-4828-af26-f7a6ed3b3972	QA	70ae58b1af2bcc88db696bcdcdc9cfbd55a89f82d9c71e21dd631e0316d5b51b4fdea54c5df016015e45cfb9dbce9438e57e7d6657cc9584b06c214bcb4874cb.38648a332821b1a8a47b5738ea593428	trabajador	\N	\N	Analista del Sistma	aveatradingcompany@gmail.com	Producción	2025-10-21 05:01:28.251016	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
55962112-4176-4498-8314-32495df1c3ad	admin@test.com	65fadf1de34a77e6f21f0e64181726cb9c96dd73fbd34b4e680db7897a31e8d3a9ff14597120b9f9bda8434efd55cf61153957b1c610d11ab9dca17e0ec451d7.02f4cd72be5026e013dd14c82f581445	admin	\N	\N	Administrador de Pruebas	admin@test.com	\N	2025-10-22 07:51:58.505813	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
02abccf1-b4b4-4b23-8f9a-568d8d62df4e	testuser@example.com	1fa8824ac4894feeeb6cb72cb865a8234b605fe7fbc486c05b86412848650067d4c3c88f0e94bd810915eeddb8208324fe1cc44bdeee91b2908531a6a51f842e.f1b1df6229538fe8e9422659db4a7e54	trabajador	\N	5f95824c-393b-499b-916a-7d6b373f6fa2	\N	\N	\N	2025-10-20 11:11:08.371379	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
ac87f157-68e9-4e26-aead-566e06352598	trabajador1	3444babe21e0cf126f1e230fd04e80c10ccbf952c5e034b68c49e835c8f174dce5a170080eba96fcbd63aec24745d25d2cd65165e8d2c3bb1ed595411ac27e65.e52dc80f4e6166ff1874cd7cf145618c	trabajador	\N	5f95824c-393b-499b-916a-7d6b373f6fa2	Trabajador Demo	\N	\N	2025-11-01 13:54:39.620407	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
323aa4db-241a-4f3e-9224-c031d00dcac7	testuser_sst	a178b041f0c9b6a647252b9d6251dcc8db1145d96a9b8aed9bb61b505e60872b690d051e19ab16c494aa22d5d4ddbafe28d24ed1597f14d5191dce29d8695a97.888a96f7fd1fd9a581c3aef3f1b914b8	admin	\N	\N	Usuario de Prueba SST	\N	\N	2025-10-24 11:30:07.789898	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
46cd947a-eb88-49ca-8be1-507210cfdc43	Lso_1	17a3dcc7d9f195cde7c62d62c0adca15b3837bda1193dd67cd01aa5d1f3551296181407aa6264ca4207ea1b4ef6d8d0eadadf63c0ea0cc844d16bc70cb3ca225.12eb1bcacc961de20cec5260a1493c77	coordinador_rrhh	\N	\N	Hernan Gil			2025-10-25 06:00:49.768872	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
56c78585-90a6-4c40-8c62-1ebe5cf62d80	testuser	17a3dcc7d9f195cde7c62d62c0adca15b3837bda1193dd67cd01aa5d1f3551296181407aa6264ca4207ea1b4ef6d8d0eadadf63c0ea0cc844d16bc70cb3ca225.12eb1bcacc961de20cec5260a1493c77	coordinador_sst	\N	\N	Usuario de Prueba	test@sst.co	SST	2025-10-21 11:02:24.805227	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
7dd72fe9-e48f-406b-997f-cb1b7aa738ee	cliente1	7cbbc31674f188c4a28cef71dc97b2ded748a6d528d7a929d0eef92c2fdca3c015ef878caf76e94af37c3142a4b01fc4b1663ffd97f314bb1c066b2b5e0f4fcb.70503a0f564b1e2ef18eec776b0364cc	admin	\N	\N	Cliente Demo	cliente@empresa.com	\N	2025-11-03 09:04:48.085591	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
09d59a6d-4194-416e-bc71-fbfea4213229	auto_admin	cb1a845fb2dc79669c0e1f3f1b06391770f1fc9b142a6f2f08cfbad9e02b3bcf880a94350beb44d2a77e18c8ebf0f83c1fcbf5515ae90252292a5fb2d494168b.6b7acd3b47538d7396e849ba90545682	admin	\N	\N	\N	\N	\N	2025-11-04 21:04:11.762112	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
e38367dc-8d31-4fca-aeef-418e3c565942	e2e_trabajador	password	coordinador_sst	\N	\N	\N	\N	\N	2025-11-10 10:30:24.196809	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
3f6c9913-4d5a-40fc-afbe-6cbab1b046b7	loadtest	2c7f3896aa6fe7fb1ddaa00c6197b828c023839798811c6ff2f4814b0a057ad5bf328e907f8a6d37e56e493e9b25dd1f7573267ac29bd1ce9c2f0b19872bc9cb.7a8f0bbf5b333dccd10d3870c742ad21	trabajador	\N	\N	Load Test User	loadtest@loadtest.local	\N	2025-11-13 07:43:00.459702	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
c6c111d7-55fb-4bbd-a36b-70635e0b70ee	testuser__nqP78	66a6252b0de2a0339ae0043b30ee1434211189f925e6d3380f030e041523e8595ddcee55aaaba606d7d48cea565bbc251183eeeba3d05fc21d49b90991781457.548f2e14e29738125ebb65f20dc6e17b	trabajador	\N	\N	Usuario de Prueba	test_G5vkOa@prueba.com	\N	2025-11-26 16:57:38.869311	\N	\N	2025-11-26 16:57:38.906	basico	2025-12-11 16:57:38.74	\N	\N	\N	\N	\N	\N	\N	\N	\N
1ff5b402-77ec-4732-8771-0cf148ad0954	beta	f2de5fa460eb0a7481a183fef8a7a42e5f19982caf84fb670534a514942b88d2c5bff4e9e72b22f573f9c5f93bae05b98b4de91172bc29699cded6ac75ff516e.595a0e26811413f070a25db088aea22f	coordinador_sst	\N	\N	Usuario Beta - Coordinador SST	beta@sstcolombia.com	\N	2025-11-14 11:41:25.823707	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
ab80185b-6746-4553-b4cd-772a7b142ffa	testuser_XZ8CSI	15f12579aaa39bc6dc76d93ed6694f6bf91b0eec12af2967b374b1ddb5db73361ef390c1a96f9e398117e31f40d6ef8724e3832718c172123252d6012fc0e4e6.92be458eb3aa2428aa21e51c67f0595a	trabajador	\N	\N	\N	\N	\N	2025-11-18 18:36:37.883489	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
6c10fe26-82e8-49b0-800b-c4f9ce202999	testuserf74uxF	6022ad9d64c784e798a1a0d2f3d0dc33ddf716e3352753e91b5079ef260464e7324e4e72a7a9cd80190aca15f474e78c6c0f3b34fce8e58165e96d8406bacdeb.974c4212f4c3ae9164b06060e265d5eb	trabajador	\N	\N	Test User f74uxF	testf74uxF@example.com	\N	2025-11-25 10:57:59.35594	80b279fd4956eb347ce52af78a19a7a12161590a964cb396b5b6caf97e7697b1	2025-11-26 10:57:59.272	\N	profesional	2025-12-10 10:57:59.272	\N	\N	\N	\N	\N	\N	\N	\N	\N
b5e3413b-fa80-4a78-ab4b-6a724578649c	test_chatbot_Z6BreA	9bc2a1063493a6261dcd11e4ee561904006d93234b47a9317e712f09aea2cc4617001c32580ee1e85c2aa53ffb7db8bad8507319fa0c1b93d49af1fb86cd10c8.ee7fc85949ea752cc44c2aa23a74ad89	responsable_sst	\N	\N	test_chatbot_Z6BreA	test_chatbot_Z6BreA@test.com	\N	2025-11-29 14:02:39.810019	\N	\N	2025-11-29 14:02:39.844	basico	2025-12-14 14:02:39.651	\N	\N	\N	\N	\N	\N	\N	\N	\N
afc7fa9d-c64b-47cc-bbf9-f9c385436cdf	usuario_XhShbc	fb4495c4fbfd857c83bc449329a6799295930991469a507fac1ca1524706dcbf3f8d530ba16c77979916003133c7fc4c75a4bb14e5b1410d6e17e270166a0743.4b6dddf66d5f46d63cbc75cc297a31a2	trabajador	\N	\N	Usuario Prueba	test_ZzBhrCye@prueba.com	\N	2025-11-26 16:29:11.275746	57cc59fda954a536aac3f928bafae9101c1e2441fcedff3ebb71203fc93aa695	2025-11-27 16:29:11.179	\N	basico	2025-12-11 16:29:11.179	\N	\N	\N	\N	\N	\N	\N	\N	\N
42e7f6bc-d82b-4ed2-ab5b-698d42edfd2f	test_chatbot_UK6Jwx	f460cf8d534f2b88faa55876c108c445eb0ccd988c61aef538e3ce8bbe3e221c08d18dc8fbbc1fb1b211045b0db2ecf1c5cf8fb059ccb2ea543036d171b5b3b1.d3db76c1d58cb62fa80967a4a816032e	responsable_sst	\N	\N	Test Chatbot User	test_chatbot_UK6Jwx@test.com	\N	2025-11-29 14:05:06.029579	\N	\N	2025-11-29 14:05:06.057	basico	2025-12-14 14:05:05.913	\N	\N	\N	\N	\N	\N	\N	\N	\N
360f5e46-96e8-47a0-9c5b-0bbf1c2cecf1	admin	b3b314e3647b85a61889b6662f64f3e0fca3447c7db88a99005b3a5448d1b81acef66b8bcd96b7f4169f16a3ea45d5ee836a71fc3d80354cc855fe06e13e18d4.59c8949d62ce83c74e4f4b543e29a0c2	admin	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	\N	Administrador del Sistema	admin@sstcolombia.com	\N	2025-12-01 13:31:41.101318	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
c9996cb9-2deb-43cc-862b-a4568b46a2cf	testuser_1764780927	b09a91d920ced8e1585905c0650e27e8efd8d2da41e410a85f7ec26df47ed18d626b4723fb2a514fe1db27b460a71790ad81aaeda5a97b9c1830766014544802.9cf689e163404254f0f47f6f956523d2	superusuario	abc0795d-73cd-4294-9bd5-7ba2872c203a	\N	Usuario de Prueba	test_1764780927@example.com	\N	2025-12-03 16:55:27.547349	\N	\N	2025-12-03 16:55:27.593	esencial	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
5403389c-faf1-4563-8b05-93fac37a909a	juan.perez	2486e2c8ef48a7134dd50ef6dbc9aa28b51bade1b7659073f9d6cb3aac75d145522b87bab272f10efd65a11d828d0aa9735a512a94e1d1c4f9dbb5ed794f1d00.8b2a3aa1406b7e9de5295670f6d567dc	trabajador	\N	5ebfcc81-2208-4e56-93ab-9b65d47fd014	Juan Pérez	juan.perez@empresademo.com	Producción	2025-11-28 06:35:54.051593	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
0f96e070-cb30-4bdb-9ebe-a150565b18da	testuser_pricing_1764839429	58b93354b688de9aa58b0717b66f445e3985beb599b53b6e4747d4a845b68c3ca113704afe1105103eb2ab55956a215fe73c2b091c033868952f8dfa91ea4b1c.e3f1203d4017f7ac9e58d897e6ed8c18	superusuario	\N	\N	Test Usuario Pricing	test_1764839429@prueba.com	\N	2025-12-04 09:10:30.360727	\N	\N	2025-12-04 09:10:30.392	microempresa	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
3d65eab4-00d3-46ec-b851-1dcdefba53c3	trial_user_1764781057	4f30c73aaf8106e2c3e6760ab1e305d953dd827e12b1cf952e2ee1688477fc3d3305adccf1236882c981551ee622fcbb41c0b5314827f07b40a37dc29d893aa7.ab06aef5ef8e7e4cb6dc1cb76c2fd3a9	superusuario	fe08737b-d9ba-4bba-8477-4734d59a093e	\N	Usuario Trial	trial_1764781057@example.com	\N	2025-12-03 16:57:37.997876	\N	\N	2025-12-03 16:57:38.027	esencial	2025-12-17 16:57:39.084	\N	\N	\N	\N	\N	\N	\N	\N	\N
1a72b018-726e-4b30-aac8-a1a3266aa0cb	testflow_1764839505	9df24db8f43839e109e3e586aa3133477deb0a0c1dee84274b8806a83951f41a31e269552d1d6251c0bd21c1b16ad9779bedad6dae78d07d332a81799ee6589f.bb3e5317aca249124337ab009345fec9	superusuario	d3296e1d-415e-4223-a6a3-68740b517685	\N	Flow Test	flow_1764839505@test.com	\N	2025-12-04 09:11:45.99574	\N	\N	2025-12-04 09:11:46.023	pequena	2025-12-18 09:11:47.105	\N	\N	\N	\N	\N	\N	\N	\N	\N
e0ce2417-ad06-4b8d-9a55-a9eda01c8e67	superadmin	00e4e45893e12146581f2c8287c637214e3d7def014c8695ee944f2dc2d826367e84d729e9c45aa06b531583b48cd82591ad4196d163286a20b0a9c9def72016.c21158a8a7c40e3ab390fa73190b6777	superadmin	76050645-7d63-46af-953b-bc86727b596f	\N	Administrador Proveedor SaaS	superadmin@sstcolombia.com	\N	2025-11-27 17:27:16.628511	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
62f302f6-5bed-49f2-8cb5-59fc9486062d	testexisting_1764840997	3ee91313ffb404e8c1d56e6be07e85227e51215d61234469660acf84f7f405aa562b0975dc9eb5db7ccded0e67bda9b7c6565c1ee06394ac02196e64e2c8333f.6d3b037157d759c9d57865e99f53ba69	superusuario	\N	\N	Test User	test_existing_1764840997@test.com	\N	2025-12-04 09:36:39.532562	\N	\N	2025-12-04 09:36:39.57	pequena	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
db4e5557-8264-438c-86a3-597fa2c9b1a0	testworker.playwright_1764198492323	45529f2bafddd251b874af4d38c8a5a764b13e05d3ead6ea1d0a3aea0a55f928b578ccf270c5661f1a1495d89e3a5af1ee67417983ef1cd52f77f83f1cdf87d5.428a996305e57910328e93d144f9f1e3	trabajador	\N	ccab92ea-bf0e-4da9-9450-762d2112fc8f	TestWorker Playwright_1764198492323	test1764198492323@test.com	QA	2025-11-27 10:32:17.578791	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
4fc3887d-33d4-4a4e-8a84-b9559893022a	juan.test	f168a1a0e500a12e09df5aacb3dc1a3a18404bf9c66d67645abddbd29a32578a46aed7a6bc4a33eae1139d25cc9032936f205defb57e1edcc68981a826fb64ee.5b0da9336d659bc2315a0fada45921e6	trabajador	\N	b141f07c-a535-43a9-85ce-4aa845bd3745	Juan Pérez Test	juan.perez.test@example.com	Producción	2025-11-27 11:31:44.656452	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
99eceb20-9a45-4fb2-8f26-8bb5aad4e7aa	coordinador_sst_demo	$scrypt$N=32768,r=8,p=1$gYmJ5BnVJHPM5bT8u8ZqBA$Z/nKWJHvHN8n+c0rKEWMVd4W5u9vHlJMzLXCR0FqDVQ	coordinador_sst	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	\N	Coordinador SST Demo	coordinador.sst@demo.com	\N	2025-12-16 21:56:40.708497	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: vehicle_inspections; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vehicle_inspections (id, company_id, vehicle_id, driver_id, inspection_date, inspection_time, tires, lights, mirrors, bodywork, seatbelts, horn, windshield, instruments, brakes, steering, suspension, fluids, fire_extinguisher, first_aid_kit, reflective_triangles, safety_vest, result, observations, corrective_actions, created_at) FROM stdin;
\.


--
-- Data for Name: vehicles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vehicles (id, company_id, plate, brand, model, year, type, ownership, capacity, mileage, color, vin, insurance_policy, insurance_expiry, soat_expiry, technical_review_expiry, status, observations, created_at) FROM stdin;
\.


--
-- Data for Name: verificaciones_adquisicion; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.verificaciones_adquisicion (id, company_id, solicitud_id, fecha_verificacion, verificador, cumple_especificaciones, especificaciones_incumplidas, recibi_msds, recibi_ficha_tecnica, recibi_manual, recibi_certificaciones, estado_producto, hallazgos, acciones_tomadas, requiere_devolucion, motivo_devolucion, observaciones, created_at) FROM stdin;
\.


--
-- Data for Name: verificaciones_muestreo_sgss; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.verificaciones_muestreo_sgss (id, company_id, fecha, periodo_verificado, total_trabajadores, total_contratistas, muestra_requerida, muestra_verificada, porcentaje_cumplimiento, pila_file_url, observaciones, estado, verificado_por, created_at, estandar_codigo, trabajadores_nominados, porcentaje_muestreo, modo_seleccion, fecha_verificacion, periodo_verificado_desde, periodo_verificado_hasta, pila_meses_verificados, responsable_verificacion, cargo_responsable, observaciones_generales, evidencia_general_url) FROM stdin;
e0d23c9d-8221-42c0-87ad-e0fadbad9f04	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	2025-12-18	2025-12	1	0	1	1	100.00			completada	\N	2025-12-18 21:52:39.542458	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: worker_portal_access_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.worker_portal_access_logs (id, company_id, user_id, worker_id, access_time, ip_address, user_agent, device_type, user_name, worker_name) FROM stdin;
\.


--
-- Data for Name: workers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.workers (id, company_id, name, "position", department, contract_type, contract_number, start_date, end_date, status, created_at, identification_number, email, eps_nombre, arl_nombre, afp_nombre, ccf_nombre, job_profile_id) FROM stdin;
0fb30eed-283f-406c-af68-12d85f23d6a4	76050645-7d63-46af-953b-bc86727b596f	María López	Coordinadora SST	Seguridad y Salud	indefinido	CONT-002	2022-06-01	\N	activo	2025-12-02 14:43:45.956446	0987654321	maria.lopez@empresa.com	\N	\N	\N	\N	\N
0278fb95-e92e-4100-8ce4-ca5c147a3b4a	76050645-7d63-46af-953b-bc86727b596f	Carlos Rodríguez	Supervisor	Producción	indefinido	CONT-003	2021-03-10	\N	activo	2025-12-02 14:43:45.956446	1122334455	carlos.rodriguez@empresa.com	\N	\N	\N	\N	\N
48139ed1-3b27-4009-b2c6-65f4b5891881	76050645-7d63-46af-953b-bc86727b596f	Ana Martínez	Jefe de Mantenimiento	Mantenimiento	indefinido	CONT-004	2020-08-20	\N	activo	2025-12-02 14:43:45.956446	5566778899	ana.martinez@empresa.com	\N	\N	\N	\N	\N
3c13f96f-f86a-4572-af76-a319721b5d01	76050645-7d63-46af-953b-bc86727b596f	Pedro Sánchez	Técnico Electricista	Mantenimiento	temporal	CONT-005	2024-01-10	\N	activo	2025-12-02 14:43:45.956446	9988776655	pedro.sanchez@empresa.com	\N	\N	\N	\N	\N
ee616a95-a43f-44ee-bab5-124955c5e223	76050645-7d63-46af-953b-bc86727b596f	Juan García	Operador de Producción	Producción	indefinido	CONT-001	2023-01-15	\N	activo	2025-12-12 16:25:53.501158	1234567890	juan.garcia@empresa.com	\N	\N	\N	\N	\N
42a4e7fe-cc05-4ac9-8c02-3ca6bb2cce38	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	Luz Adriana Diaz Calle	Analista de Recursos Humanos	Recursos Humanos	indefinido	CONT-C6D3C1-2025-0001	2025-12-12	\N	activo	2025-12-11 06:03:58.109167	52223631	sg.sst.cumplimiento@gmail.com	\N	\N	\N	\N	25e671bb-4d49-43c9-8610-bd83ad8cfd4c
1d50f465-71c5-48ff-b365-142863ad5f9a	c6d3c1d1-0418-46a8-a0ee-23c46a4e806a	PRUEBA 1	Almacenista	Logística	indefinido	CONT-C6D3C1-2025-0002	2025-12-23	\N	activo	2025-12-23 09:48:21.506624	1654445567	ladic2023@ocloud.com	\N	\N	\N	\N	a288b46a-94f1-478c-b2ec-eb6d6d5c87e9
\.


--
-- Data for Name: zonas_evacuacion; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.zonas_evacuacion (id, company_id, plan_emergencia_id, nombre, tipo, ubicacion, capacidad_personas, nivel_piso, "señalizacion_adecuada", iluminacion_emergencia, accesibilidad_discapacidad, responsable_zona_id, coordenadas_gps, plano_referencia, estado, observaciones, created_at, updated_at, codigo, descripcion, piso, area, coordinador_id, coordinador_sustituto_id, punto_encuentro_id, instrucciones_evacuacion, activa, consideraciones_especiales) FROM stdin;
\.


--
-- Data for Name: _migrations; Type: TABLE DATA; Schema: stripe; Owner: -
--

COPY stripe._migrations (id, name, hash, executed_at) FROM stdin;
0	initial_migration	c18983eedaa79cc2f6d92727d70c4f772256ef3d	2025-11-27 08:03:06.841787
1	products	b99ffc23df668166b94156f438bfa41818d4e80c	2025-11-27 08:03:07.065599
2	customers	33e481247ddc217f4e27ad10dfe5430097981670	2025-11-27 08:03:07.292375
3	prices	7d5ff35640651606cc24cec8a73ff7c02492ecdf	2025-11-27 08:03:07.517647
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: stripe; Owner: -
--

COPY stripe.customers (id, object, address, description, email, metadata, name, phone, shipping, balance, created, currency, default_source, delinquent, discount, invoice_prefix, invoice_settings, livemode, next_invoice_sequence, preferred_locales, tax_exempt) FROM stdin;
\.


--
-- Data for Name: prices; Type: TABLE DATA; Schema: stripe; Owner: -
--

COPY stripe.prices (id, object, active, currency, metadata, nickname, recurring, type, unit_amount, billing_scheme, created, livemode, lookup_key, tiers_mode, transform_quantity, unit_amount_decimal, product) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: stripe; Owner: -
--

COPY stripe.products (id, object, active, description, metadata, name, created, images, livemode, package_dimensions, shippable, statement_descriptor, unit_label, updated, url) FROM stdin;
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: -
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 1, false);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: -
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: accidents accidents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accidents
    ADD CONSTRAINT accidents_pkey PRIMARY KEY (id);


--
-- Name: acciones_mejora acciones_mejora_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.acciones_mejora
    ADD CONSTRAINT acciones_mejora_pkey PRIMARY KEY (id);


--
-- Name: acciones_revision acciones_revision_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.acciones_revision
    ADD CONSTRAINT acciones_revision_pkey PRIMARY KEY (id);


--
-- Name: actividades_plan_trabajo actividades_plan_trabajo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.actividades_plan_trabajo
    ADD CONSTRAINT actividades_plan_trabajo_pkey PRIMARY KEY (id);


--
-- Name: adquisicion_items adquisicion_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.adquisicion_items
    ADD CONSTRAINT adquisicion_items_pkey PRIMARY KEY (id);


--
-- Name: afiliaciones_ssss afiliaciones_ssss_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.afiliaciones_ssss
    ADD CONSTRAINT afiliaciones_ssss_pkey PRIMARY KEY (id);


--
-- Name: analisis_vulnerabilidad analisis_vulnerabilidad_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analisis_vulnerabilidad
    ADD CONSTRAINT analisis_vulnerabilidad_pkey PRIMARY KEY (id);


--
-- Name: aprobaciones_cambios aprobaciones_cambios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aprobaciones_cambios
    ADD CONSTRAINT aprobaciones_cambios_pkey PRIMARY KEY (id);


--
-- Name: arco_requests arco_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arco_requests
    ADD CONSTRAINT arco_requests_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: auditoria_auditores auditoria_auditores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auditoria_auditores
    ADD CONSTRAINT auditoria_auditores_pkey PRIMARY KEY (id);


--
-- Name: auditoria_checklists auditoria_checklists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auditoria_checklists
    ADD CONSTRAINT auditoria_checklists_pkey PRIMARY KEY (id);


--
-- Name: auditorias_internas auditorias_internas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auditorias_internas
    ADD CONSTRAINT auditorias_internas_pkey PRIMARY KEY (id);


--
-- Name: automatizacion_cambio_logs automatizacion_cambio_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automatizacion_cambio_logs
    ADD CONSTRAINT automatizacion_cambio_logs_pkey PRIMARY KEY (id);


--
-- Name: brigadas_emergencia brigadas_emergencia_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brigadas_emergencia
    ADD CONSTRAINT brigadas_emergencia_pkey PRIMARY KEY (id);


--
-- Name: cambios_sst cambios_sst_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cambios_sst
    ADD CONSTRAINT cambios_sst_pkey PRIMARY KEY (id);


--
-- Name: capacitacion_asistentes capacitacion_asistentes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.capacitacion_asistentes
    ADD CONSTRAINT capacitacion_asistentes_pkey PRIMARY KEY (id);


--
-- Name: capacitacion_eventos capacitacion_eventos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.capacitacion_eventos
    ADD CONSTRAINT capacitacion_eventos_pkey PRIMARY KEY (id);


--
-- Name: capacitaciones_cambios capacitaciones_cambios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.capacitaciones_cambios
    ADD CONSTRAINT capacitaciones_cambios_pkey PRIMARY KEY (id);


--
-- Name: capacitaciones_catalogo capacitaciones_catalogo_codigo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.capacitaciones_catalogo
    ADD CONSTRAINT capacitaciones_catalogo_codigo_key UNIQUE (codigo);


--
-- Name: capacitaciones_catalogo capacitaciones_catalogo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.capacitaciones_catalogo
    ADD CONSTRAINT capacitaciones_catalogo_pkey PRIMARY KEY (id);


--
-- Name: comite_convivencia_actas comite_convivencia_actas_company_id_numero_acta_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comite_convivencia_actas
    ADD CONSTRAINT comite_convivencia_actas_company_id_numero_acta_key UNIQUE (company_id, numero_acta);


--
-- Name: comite_convivencia_actas comite_convivencia_actas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comite_convivencia_actas
    ADD CONSTRAINT comite_convivencia_actas_pkey PRIMARY KEY (id);


--
-- Name: companies companies_nit_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_nit_unique UNIQUE (nit);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: componentes_sst componentes_sst_numero_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.componentes_sst
    ADD CONSTRAINT componentes_sst_numero_key UNIQUE (numero);


--
-- Name: componentes_sst componentes_sst_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.componentes_sst
    ADD CONSTRAINT componentes_sst_pkey PRIMARY KEY (id);


--
-- Name: comunicaciones_sst comunicaciones_sst_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comunicaciones_sst
    ADD CONSTRAINT comunicaciones_sst_pkey PRIMARY KEY (id);


--
-- Name: consent_records consent_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consent_records
    ADD CONSTRAINT consent_records_pkey PRIMARY KEY (id);


--
-- Name: contenidos_induccion contenidos_induccion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contenidos_induccion
    ADD CONSTRAINT contenidos_induccion_pkey PRIMARY KEY (id);


--
-- Name: contracts contracts_contract_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_contract_number_key UNIQUE (contract_number);


--
-- Name: contracts contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_pkey PRIMARY KEY (id);


--
-- Name: controles_cambios controles_cambios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.controles_cambios
    ADD CONSTRAINT controles_cambios_pkey PRIMARY KEY (id);


--
-- Name: convivencia_actas convivencia_actas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.convivencia_actas
    ADD CONSTRAINT convivencia_actas_pkey PRIMARY KEY (id);


--
-- Name: convivencia_candidatos convivencia_candidatos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.convivencia_candidatos
    ADD CONSTRAINT convivencia_candidatos_pkey PRIMARY KEY (id);


--
-- Name: convivencia_elecciones convivencia_elecciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.convivencia_elecciones
    ADD CONSTRAINT convivencia_elecciones_pkey PRIMARY KEY (id);


--
-- Name: convivencia_miembros convivencia_miembros_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.convivencia_miembros
    ADD CONSTRAINT convivencia_miembros_pkey PRIMARY KEY (id);


--
-- Name: convivencia_periodos convivencia_periodos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.convivencia_periodos
    ADD CONSTRAINT convivencia_periodos_pkey PRIMARY KEY (id);


--
-- Name: convivencia_registro_votacion convivencia_registro_votacion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.convivencia_registro_votacion
    ADD CONSTRAINT convivencia_registro_votacion_pkey PRIMARY KEY (id);


--
-- Name: convivencia_votos convivencia_votos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.convivencia_votos
    ADD CONSTRAINT convivencia_votos_pkey PRIMARY KEY (id);


--
-- Name: copasst_actas copasst_actas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_actas
    ADD CONSTRAINT copasst_actas_pkey PRIMARY KEY (id);


--
-- Name: copasst_banco_preguntas copasst_banco_preguntas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_banco_preguntas
    ADD CONSTRAINT copasst_banco_preguntas_pkey PRIMARY KEY (id);


--
-- Name: copasst_candidatos copasst_candidatos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_candidatos
    ADD CONSTRAINT copasst_candidatos_pkey PRIMARY KEY (id);


--
-- Name: copasst_certificados copasst_certificados_codigo_certificado_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_certificados
    ADD CONSTRAINT copasst_certificados_codigo_certificado_key UNIQUE (codigo_certificado);


--
-- Name: copasst_certificados copasst_certificados_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_certificados
    ADD CONSTRAINT copasst_certificados_pkey PRIMARY KEY (id);


--
-- Name: copasst_competencias copasst_competencias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_competencias
    ADD CONSTRAINT copasst_competencias_pkey PRIMARY KEY (id);


--
-- Name: copasst_curso_asignaciones copasst_curso_asignaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_curso_asignaciones
    ADD CONSTRAINT copasst_curso_asignaciones_pkey PRIMARY KEY (id);


--
-- Name: copasst_curso_categorias copasst_curso_categorias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_curso_categorias
    ADD CONSTRAINT copasst_curso_categorias_pkey PRIMARY KEY (id);


--
-- Name: copasst_cursos copasst_cursos_codigo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_cursos
    ADD CONSTRAINT copasst_cursos_codigo_key UNIQUE (codigo);


--
-- Name: copasst_cursos copasst_cursos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_cursos
    ADD CONSTRAINT copasst_cursos_pkey PRIMARY KEY (id);


--
-- Name: copasst_elecciones copasst_elecciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_elecciones
    ADD CONSTRAINT copasst_elecciones_pkey PRIMARY KEY (id);


--
-- Name: copasst_escenario_nodos copasst_escenario_nodos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_escenario_nodos
    ADD CONSTRAINT copasst_escenario_nodos_pkey PRIMARY KEY (id);


--
-- Name: copasst_escenario_progreso copasst_escenario_progreso_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_escenario_progreso
    ADD CONSTRAINT copasst_escenario_progreso_pkey PRIMARY KEY (id);


--
-- Name: copasst_escenarios copasst_escenarios_codigo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_escenarios
    ADD CONSTRAINT copasst_escenarios_codigo_key UNIQUE (codigo);


--
-- Name: copasst_escenarios copasst_escenarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_escenarios
    ADD CONSTRAINT copasst_escenarios_pkey PRIMARY KEY (id);


--
-- Name: copasst_evaluacion_asignaciones copasst_evaluacion_asignaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_evaluacion_asignaciones
    ADD CONSTRAINT copasst_evaluacion_asignaciones_pkey PRIMARY KEY (id);


--
-- Name: copasst_evaluacion_items copasst_evaluacion_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_evaluacion_items
    ADD CONSTRAINT copasst_evaluacion_items_pkey PRIMARY KEY (id);


--
-- Name: copasst_evaluacion_periodos copasst_evaluacion_periodos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_evaluacion_periodos
    ADD CONSTRAINT copasst_evaluacion_periodos_pkey PRIMARY KEY (id);


--
-- Name: copasst_evaluacion_respuestas copasst_evaluacion_respuestas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_evaluacion_respuestas
    ADD CONSTRAINT copasst_evaluacion_respuestas_pkey PRIMARY KEY (id);


--
-- Name: copasst_evaluacion_resultados copasst_evaluacion_resultados_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_evaluacion_resultados
    ADD CONSTRAINT copasst_evaluacion_resultados_pkey PRIMARY KEY (id);


--
-- Name: copasst_insignias copasst_insignias_codigo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_insignias
    ADD CONSTRAINT copasst_insignias_codigo_key UNIQUE (codigo);


--
-- Name: copasst_insignias copasst_insignias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_insignias
    ADD CONSTRAINT copasst_insignias_pkey PRIMARY KEY (id);


--
-- Name: copasst_insignias_usuario copasst_insignias_usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_insignias_usuario
    ADD CONSTRAINT copasst_insignias_usuario_pkey PRIMARY KEY (id);


--
-- Name: copasst_insignias_usuario copasst_insignias_usuario_user_id_insignia_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_insignias_usuario
    ADD CONSTRAINT copasst_insignias_usuario_user_id_insignia_id_key UNIQUE (user_id, insignia_id);


--
-- Name: copasst_lecciones copasst_lecciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_lecciones
    ADD CONSTRAINT copasst_lecciones_pkey PRIMARY KEY (id);


--
-- Name: copasst_miembros copasst_miembros_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_miembros
    ADD CONSTRAINT copasst_miembros_pkey PRIMARY KEY (id);


--
-- Name: copasst_notificaciones copasst_notificaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_notificaciones
    ADD CONSTRAINT copasst_notificaciones_pkey PRIMARY KEY (id);


--
-- Name: copasst_periodos copasst_periodos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_periodos
    ADD CONSTRAINT copasst_periodos_pkey PRIMARY KEY (id);


--
-- Name: copasst_progreso copasst_progreso_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_progreso
    ADD CONSTRAINT copasst_progreso_pkey PRIMARY KEY (id);


--
-- Name: copasst_puntos_mensuales copasst_puntos_mensuales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_puntos_mensuales
    ADD CONSTRAINT copasst_puntos_mensuales_pkey PRIMARY KEY (id);


--
-- Name: copasst_puntos_mensuales copasst_puntos_mensuales_user_id_company_id_anio_mes_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_puntos_mensuales
    ADD CONSTRAINT copasst_puntos_mensuales_user_id_company_id_anio_mes_key UNIQUE (user_id, company_id, anio, mes);


--
-- Name: copasst_quiz_preguntas copasst_quiz_preguntas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_quiz_preguntas
    ADD CONSTRAINT copasst_quiz_preguntas_pkey PRIMARY KEY (id);


--
-- Name: copasst_rachas_usuario copasst_rachas_usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_rachas_usuario
    ADD CONSTRAINT copasst_rachas_usuario_pkey PRIMARY KEY (id);


--
-- Name: copasst_rachas_usuario copasst_rachas_usuario_user_id_company_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_rachas_usuario
    ADD CONSTRAINT copasst_rachas_usuario_user_id_company_id_key UNIQUE (user_id, company_id);


--
-- Name: copasst_registro_votacion copasst_registro_votacion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_registro_votacion
    ADD CONSTRAINT copasst_registro_votacion_pkey PRIMARY KEY (id);


--
-- Name: copasst_votos copasst_votos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_votos
    ADD CONSTRAINT copasst_votos_pkey PRIMARY KEY (id);


--
-- Name: criterios_evaluacion_proveedor criterios_evaluacion_proveedor_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.criterios_evaluacion_proveedor
    ADD CONSTRAINT criterios_evaluacion_proveedor_pkey PRIMARY KEY (id);


--
-- Name: curso_50_horas curso_50_horas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.curso_50_horas
    ADD CONSTRAINT curso_50_horas_pkey PRIMARY KEY (id);


--
-- Name: datos_calculo_indicadores datos_calculo_indicadores_company_id_periodo_anio_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.datos_calculo_indicadores
    ADD CONSTRAINT datos_calculo_indicadores_company_id_periodo_anio_key UNIQUE (company_id, periodo, anio);


--
-- Name: datos_calculo_indicadores datos_calculo_indicadores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.datos_calculo_indicadores
    ADD CONSTRAINT datos_calculo_indicadores_pkey PRIMARY KEY (id);


--
-- Name: decisiones_revision decisiones_revision_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.decisiones_revision
    ADD CONSTRAINT decisiones_revision_pkey PRIMARY KEY (id);


--
-- Name: detalle_verificacion_sgss detalle_verificacion_sgss_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.detalle_verificacion_sgss
    ADD CONSTRAINT detalle_verificacion_sgss_pkey PRIMARY KEY (id);


--
-- Name: documentos_proveedores documentos_proveedores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documentos_proveedores
    ADD CONSTRAINT documentos_proveedores_pkey PRIMARY KEY (id);


--
-- Name: drivers drivers_identification_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_identification_number_unique UNIQUE (identification_number);


--
-- Name: drivers drivers_license_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_license_number_unique UNIQUE (license_number);


--
-- Name: drivers drivers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_pkey PRIMARY KEY (id);


--
-- Name: email_notifications email_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_notifications
    ADD CONSTRAINT email_notifications_pkey PRIMARY KEY (id);


--
-- Name: environmental_measurements environmental_measurements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.environmental_measurements
    ADD CONSTRAINT environmental_measurements_pkey PRIMARY KEY (id);


--
-- Name: especificaciones_tecnicas especificaciones_tecnicas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.especificaciones_tecnicas
    ADD CONSTRAINT especificaciones_tecnicas_pkey PRIMARY KEY (id);


--
-- Name: estandares_sst estandares_sst_numero_estandar_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estandares_sst
    ADD CONSTRAINT estandares_sst_numero_estandar_key UNIQUE (numero_estandar);


--
-- Name: estandares_sst estandares_sst_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estandares_sst
    ADD CONSTRAINT estandares_sst_pkey PRIMARY KEY (id);


--
-- Name: evaluaciones_adquisicion evaluaciones_adquisicion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evaluaciones_adquisicion
    ADD CONSTRAINT evaluaciones_adquisicion_pkey PRIMARY KEY (id);


--
-- Name: evaluaciones_impacto_cambios evaluaciones_impacto_cambios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evaluaciones_impacto_cambios
    ADD CONSTRAINT evaluaciones_impacto_cambios_pkey PRIMARY KEY (id);


--
-- Name: evaluaciones_proveedores evaluaciones_proveedores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evaluaciones_proveedores
    ADD CONSTRAINT evaluaciones_proveedores_pkey PRIMARY KEY (id);


--
-- Name: evaluaciones_sst evaluaciones_sst_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evaluaciones_sst
    ADD CONSTRAINT evaluaciones_sst_pkey PRIMARY KEY (id);


--
-- Name: evs_activities evs_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evs_activities
    ADD CONSTRAINT evs_activities_pkey PRIMARY KEY (id);


--
-- Name: evs_controls evs_controls_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evs_controls
    ADD CONSTRAINT evs_controls_pkey PRIMARY KEY (id);


--
-- Name: evs_followups evs_followups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evs_followups
    ADD CONSTRAINT evs_followups_pkey PRIMARY KEY (id);


--
-- Name: evs_incidents evs_incidents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evs_incidents
    ADD CONSTRAINT evs_incidents_pkey PRIMARY KEY (id);


--
-- Name: evs_participants evs_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evs_participants
    ADD CONSTRAINT evs_participants_pkey PRIMARY KEY (id);


--
-- Name: evs_programs evs_programs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evs_programs
    ADD CONSTRAINT evs_programs_pkey PRIMARY KEY (id);


--
-- Name: hallazgos_auditoria hallazgos_auditoria_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hallazgos_auditoria
    ADD CONSTRAINT hallazgos_auditoria_pkey PRIMARY KEY (id);


--
-- Name: hazardous_substances hazardous_substances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hazardous_substances
    ADD CONSTRAINT hazardous_substances_pkey PRIMARY KEY (id);


--
-- Name: high_risk_workers high_risk_workers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.high_risk_workers
    ADD CONSTRAINT high_risk_workers_pkey PRIMARY KEY (id);


--
-- Name: historial_comunicaciones_sst historial_comunicaciones_sst_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historial_comunicaciones_sst
    ADD CONSTRAINT historial_comunicaciones_sst_pkey PRIMARY KEY (id);


--
-- Name: hojas_seguridad hojas_seguridad_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hojas_seguridad
    ADD CONSTRAINT hojas_seguridad_pkey PRIMARY KEY (id);


--
-- Name: indicadores_sst indicadores_sst_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.indicadores_sst
    ADD CONSTRAINT indicadores_sst_pkey PRIMARY KEY (id);


--
-- Name: inspecciones_peligros_vinculados inspecciones_peligros_vinculados_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspecciones_peligros_vinculados
    ADD CONSTRAINT inspecciones_peligros_vinculados_pkey PRIMARY KEY (id);


--
-- Name: inspecciones_recursos_emergencia inspecciones_recursos_emergencia_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspecciones_recursos_emergencia
    ADD CONSTRAINT inspecciones_recursos_emergencia_pkey PRIMARY KEY (id);


--
-- Name: inspections inspections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_pkey PRIMARY KEY (id);


--
-- Name: internal_messages internal_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.internal_messages
    ADD CONSTRAINT internal_messages_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key UNIQUE (invoice_number);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: job_profiles job_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_profiles
    ADD CONSTRAINT job_profiles_pkey PRIMARY KEY (id);


--
-- Name: lecturas_comunicacion lecturas_comunicacion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lecturas_comunicacion
    ADD CONSTRAINT lecturas_comunicacion_pkey PRIMARY KEY (id);


--
-- Name: matrices_iperc matrices_iperc_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matrices_iperc
    ADD CONSTRAINT matrices_iperc_pkey PRIMARY KEY (id);


--
-- Name: matriz_legal matriz_legal_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matriz_legal
    ADD CONSTRAINT matriz_legal_pkey PRIMARY KEY (id);


--
-- Name: medical_exams medical_exams_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medical_exams
    ADD CONSTRAINT medical_exams_pkey PRIMARY KEY (id);


--
-- Name: mediciones_indicadores mediciones_indicadores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mediciones_indicadores
    ADD CONSTRAINT mediciones_indicadores_pkey PRIMARY KEY (id);


--
-- Name: miembros_brigada miembros_brigada_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.miembros_brigada
    ADD CONSTRAINT miembros_brigada_pkey PRIMARY KEY (id);


--
-- Name: objetivos_sst objetivos_sst_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.objetivos_sst
    ADD CONSTRAINT objetivos_sst_pkey PRIMARY KEY (id);


--
-- Name: occupational_diseases occupational_diseases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.occupational_diseases
    ADD CONSTRAINT occupational_diseases_pkey PRIMARY KEY (id);


--
-- Name: participantes_revision participantes_revision_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.participantes_revision
    ADD CONSTRAINT participantes_revision_pkey PRIMARY KEY (id);


--
-- Name: participantes_simulacro participantes_simulacro_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.participantes_simulacro
    ADD CONSTRAINT participantes_simulacro_pkey PRIMARY KEY (id);


--
-- Name: payment_sources payment_sources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_sources
    ADD CONSTRAINT payment_sources_pkey PRIMARY KEY (id);


--
-- Name: payment_transactions payment_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_pkey PRIMARY KEY (id);


--
-- Name: payment_transactions payment_transactions_wompi_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_wompi_reference_key UNIQUE (wompi_reference);


--
-- Name: payment_transactions payment_transactions_wompi_transaction_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_wompi_transaction_id_key UNIQUE (wompi_transaction_id);


--
-- Name: peligros_iperc peligros_iperc_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.peligros_iperc
    ADD CONSTRAINT peligros_iperc_pkey PRIMARY KEY (id);


--
-- Name: peligros_trabajadores_asignacion peligros_trabajadores_asignacion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.peligros_trabajadores_asignacion
    ADD CONSTRAINT peligros_trabajadores_asignacion_pkey PRIMARY KEY (id);


--
-- Name: pesv_audits pesv_audits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pesv_audits
    ADD CONSTRAINT pesv_audits_pkey PRIMARY KEY (id);


--
-- Name: plan_change_history plan_change_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_change_history
    ADD CONSTRAINT plan_change_history_pkey PRIMARY KEY (id);


--
-- Name: plan_comunicacion_sst plan_comunicacion_sst_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_comunicacion_sst
    ADD CONSTRAINT plan_comunicacion_sst_pkey PRIMARY KEY (id);


--
-- Name: planes_accion_auditoria planes_accion_auditoria_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.planes_accion_auditoria
    ADD CONSTRAINT planes_accion_auditoria_pkey PRIMARY KEY (id);


--
-- Name: planes_emergencia planes_emergencia_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.planes_emergencia
    ADD CONSTRAINT planes_emergencia_pkey PRIMARY KEY (id);


--
-- Name: planes_trabajo_anual planes_trabajo_anual_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.planes_trabajo_anual
    ADD CONSTRAINT planes_trabajo_anual_pkey PRIMARY KEY (id);


--
-- Name: politicas_sst politicas_sst_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.politicas_sst
    ADD CONSTRAINT politicas_sst_pkey PRIMARY KEY (id);


--
-- Name: preguntas_induccion preguntas_induccion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preguntas_induccion
    ADD CONSTRAINT preguntas_induccion_pkey PRIMARY KEY (id);


--
-- Name: preventive_measures preventive_measures_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preventive_measures
    ADD CONSTRAINT preventive_measures_pkey PRIMARY KEY (id);


--
-- Name: pricing_config pricing_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pricing_config
    ADD CONSTRAINT pricing_config_pkey PRIMARY KEY (id);


--
-- Name: pricing_plugin_invoices pricing_plugin_invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pricing_plugin_invoices
    ADD CONSTRAINT pricing_plugin_invoices_pkey PRIMARY KEY (id);


--
-- Name: pricing_plugin_subscriptions pricing_plugin_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pricing_plugin_subscriptions
    ADD CONSTRAINT pricing_plugin_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: program_training_attendance program_training_attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.program_training_attendance
    ADD CONSTRAINT program_training_attendance_pkey PRIMARY KEY (id);


--
-- Name: program_trainings program_trainings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.program_trainings
    ADD CONSTRAINT program_trainings_pkey PRIMARY KEY (id);


--
-- Name: programas_capacitacion programas_capacitacion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.programas_capacitacion
    ADD CONSTRAINT programas_capacitacion_pkey PRIMARY KEY (id);


--
-- Name: promotion_prevention_activities promotion_prevention_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotion_prevention_activities
    ADD CONSTRAINT promotion_prevention_activities_pkey PRIMARY KEY (id);


--
-- Name: promotion_prevention_participants promotion_prevention_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotion_prevention_participants
    ADD CONSTRAINT promotion_prevention_participants_pkey PRIMARY KEY (id);


--
-- Name: proveedores_contratistas proveedores_contratistas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proveedores_contratistas
    ADD CONSTRAINT proveedores_contratistas_pkey PRIMARY KEY (id);


--
-- Name: provider_access_logs provider_access_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_access_logs
    ADD CONSTRAINT provider_access_logs_pkey PRIMARY KEY (id);


--
-- Name: puntos_encuentro puntos_encuentro_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.puntos_encuentro
    ADD CONSTRAINT puntos_encuentro_pkey PRIMARY KEY (id);


--
-- Name: recomendaciones_arl_autoridades recomendaciones_arl_autoridades_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recomendaciones_arl_autoridades
    ADD CONSTRAINT recomendaciones_arl_autoridades_pkey PRIMARY KEY (id);


--
-- Name: recursos_emergencia recursos_emergencia_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recursos_emergencia
    ADD CONSTRAINT recursos_emergencia_pkey PRIMARY KEY (id);


--
-- Name: registros_induccion registros_induccion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registros_induccion
    ADD CONSTRAINT registros_induccion_pkey PRIMARY KEY (id);


--
-- Name: reportes_trabajadores reportes_trabajadores_codigo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reportes_trabajadores
    ADD CONSTRAINT reportes_trabajadores_codigo_key UNIQUE (codigo);


--
-- Name: reportes_trabajadores reportes_trabajadores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reportes_trabajadores
    ADD CONSTRAINT reportes_trabajadores_pkey PRIMARY KEY (id);


--
-- Name: resource_allocations resource_allocations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_allocations
    ADD CONSTRAINT resource_allocations_pkey PRIMARY KEY (id);


--
-- Name: responsible_designations responsible_designations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.responsible_designations
    ADD CONSTRAINT responsible_designations_pkey PRIMARY KEY (id);


--
-- Name: respuestas_criterios_proveedor respuestas_criterios_proveedor_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.respuestas_criterios_proveedor
    ADD CONSTRAINT respuestas_criterios_proveedor_pkey PRIMARY KEY (id);


--
-- Name: respuestas_estandares respuestas_estandares_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.respuestas_estandares
    ADD CONSTRAINT respuestas_estandares_pkey PRIMARY KEY (id);


--
-- Name: revisiones_direccion revisiones_direccion_codigo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revisiones_direccion
    ADD CONSTRAINT revisiones_direccion_codigo_key UNIQUE (codigo);


--
-- Name: revisiones_direccion revisiones_direccion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revisiones_direccion
    ADD CONSTRAINT revisiones_direccion_pkey PRIMARY KEY (id);


--
-- Name: road_incidents road_incidents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.road_incidents
    ADD CONSTRAINT road_incidents_pkey PRIMARY KEY (id);


--
-- Name: road_safety_attendees road_safety_attendees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.road_safety_attendees
    ADD CONSTRAINT road_safety_attendees_pkey PRIMARY KEY (id);


--
-- Name: road_safety_trainings road_safety_trainings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.road_safety_trainings
    ADD CONSTRAINT road_safety_trainings_pkey PRIMARY KEY (id);


--
-- Name: rutas_evacuacion rutas_evacuacion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rutas_evacuacion
    ADD CONSTRAINT rutas_evacuacion_pkey PRIMARY KEY (id);


--
-- Name: seguimiento_recomendaciones seguimiento_recomendaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seguimiento_recomendaciones
    ADD CONSTRAINT seguimiento_recomendaciones_pkey PRIMARY KEY (id);


--
-- Name: seguimientos_cambios seguimientos_cambios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seguimientos_cambios
    ADD CONSTRAINT seguimientos_cambios_pkey PRIMARY KEY (id);


--
-- Name: seguimientos_proveedores seguimientos_proveedores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seguimientos_proveedores
    ADD CONSTRAINT seguimientos_proveedores_pkey PRIMARY KEY (id);


--
-- Name: sesiones_induccion_virtual sesiones_induccion_virtual_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sesiones_induccion_virtual
    ADD CONSTRAINT sesiones_induccion_virtual_pkey PRIMARY KEY (id);


--
-- Name: sesiones_induccion_virtual sesiones_induccion_virtual_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sesiones_induccion_virtual
    ADD CONSTRAINT sesiones_induccion_virtual_token_key UNIQUE (token);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: simulacros simulacros_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.simulacros
    ADD CONSTRAINT simulacros_pkey PRIMARY KEY (id);


--
-- Name: solicitudes_adquisicion solicitudes_adquisicion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes_adquisicion
    ADD CONSTRAINT solicitudes_adquisicion_pkey PRIMARY KEY (id);


--
-- Name: sst_document_access_log sst_document_access_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sst_document_access_log
    ADD CONSTRAINT sst_document_access_log_pkey PRIMARY KEY (id);


--
-- Name: sst_document_alerts sst_document_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sst_document_alerts
    ADD CONSTRAINT sst_document_alerts_pkey PRIMARY KEY (id);


--
-- Name: sst_document_versions sst_document_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sst_document_versions
    ADD CONSTRAINT sst_document_versions_pkey PRIMARY KEY (id);


--
-- Name: sst_documents sst_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sst_documents
    ADD CONSTRAINT sst_documents_pkey PRIMARY KEY (id);


--
-- Name: sst_evaluation_items sst_evaluation_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sst_evaluation_items
    ADD CONSTRAINT sst_evaluation_items_pkey PRIMARY KEY (id);


--
-- Name: sst_evaluations sst_evaluations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sst_evaluations
    ADD CONSTRAINT sst_evaluations_pkey PRIMARY KEY (id);


--
-- Name: sst_evidence sst_evidence_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sst_evidence
    ADD CONSTRAINT sst_evidence_pkey PRIMARY KEY (id);


--
-- Name: sst_items sst_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sst_items
    ADD CONSTRAINT sst_items_pkey PRIMARY KEY (id);


--
-- Name: sst_standards sst_standards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sst_standards
    ADD CONSTRAINT sst_standards_pkey PRIMARY KEY (id);


--
-- Name: subscription_plans subscription_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_company_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_company_id_key UNIQUE (company_id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: support_access_events support_access_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_access_events
    ADD CONSTRAINT support_access_events_pkey PRIMARY KEY (id);


--
-- Name: support_access_sessions support_access_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_access_sessions
    ADD CONSTRAINT support_access_sessions_pkey PRIMARY KEY (id);


--
-- Name: support_access_sessions support_access_sessions_session_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_access_sessions
    ADD CONSTRAINT support_access_sessions_session_number_key UNIQUE (session_number);


--
-- Name: support_tickets support_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_pkey PRIMARY KEY (id);


--
-- Name: support_tickets support_tickets_ticket_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_ticket_number_key UNIQUE (ticket_number);


--
-- Name: sve_cases sve_cases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sve_cases
    ADD CONSTRAINT sve_cases_pkey PRIMARY KEY (id);


--
-- Name: sve_programs sve_programs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sve_programs
    ADD CONSTRAINT sve_programs_pkey PRIMARY KEY (id);


--
-- Name: temas_revision temas_revision_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.temas_revision
    ADD CONSTRAINT temas_revision_pkey PRIMARY KEY (id);


--
-- Name: ticket_responses ticket_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_responses
    ADD CONSTRAINT ticket_responses_pkey PRIMARY KEY (id);


--
-- Name: ticket_status_history ticket_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_status_history
    ADD CONSTRAINT ticket_status_history_pkey PRIMARY KEY (id);


--
-- Name: trabajadores_alto_riesgo trabajadores_alto_riesgo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trabajadores_alto_riesgo
    ADD CONSTRAINT trabajadores_alto_riesgo_pkey PRIMARY KEY (id);


--
-- Name: training_attendees training_attendees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_attendees
    ADD CONSTRAINT training_attendees_pkey PRIMARY KEY (id);


--
-- Name: training_programs training_programs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_programs
    ADD CONSTRAINT training_programs_pkey PRIMARY KEY (id);


--
-- Name: trainings trainings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trainings
    ADD CONSTRAINT trainings_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: vehicle_inspections vehicle_inspections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicle_inspections
    ADD CONSTRAINT vehicle_inspections_pkey PRIMARY KEY (id);


--
-- Name: vehicles vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_pkey PRIMARY KEY (id);


--
-- Name: vehicles vehicles_plate_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_plate_unique UNIQUE (plate);


--
-- Name: verificaciones_adquisicion verificaciones_adquisicion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verificaciones_adquisicion
    ADD CONSTRAINT verificaciones_adquisicion_pkey PRIMARY KEY (id);


--
-- Name: verificaciones_muestreo_sgss verificaciones_muestreo_sgss_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verificaciones_muestreo_sgss
    ADD CONSTRAINT verificaciones_muestreo_sgss_pkey PRIMARY KEY (id);


--
-- Name: worker_portal_access_logs worker_portal_access_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worker_portal_access_logs
    ADD CONSTRAINT worker_portal_access_logs_pkey PRIMARY KEY (id);


--
-- Name: workers workers_contract_number_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workers
    ADD CONSTRAINT workers_contract_number_unique UNIQUE (contract_number);


--
-- Name: workers workers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workers
    ADD CONSTRAINT workers_pkey PRIMARY KEY (id);


--
-- Name: zonas_evacuacion zonas_evacuacion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zonas_evacuacion
    ADD CONSTRAINT zonas_evacuacion_pkey PRIMARY KEY (id);


--
-- Name: _migrations _migrations_name_key; Type: CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe._migrations
    ADD CONSTRAINT _migrations_name_key UNIQUE (name);


--
-- Name: _migrations _migrations_pkey; Type: CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe._migrations
    ADD CONSTRAINT _migrations_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: prices prices_pkey; Type: CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.prices
    ADD CONSTRAINT prices_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: idx_audit_logs_company_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_company_id ON public.audit_logs USING btree (company_id);


--
-- Name: idx_audit_logs_data_subject_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_data_subject_id ON public.audit_logs USING btree (data_subject_id) WHERE (data_subject_id IS NOT NULL);


--
-- Name: idx_audit_logs_entity_type_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_entity_type_id ON public.audit_logs USING btree (entity_type, entity_id);


--
-- Name: idx_audit_logs_timestamp; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs USING btree ("timestamp" DESC);


--
-- Name: idx_audit_logs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs USING btree (user_id);


--
-- Name: idx_internal_messages_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_internal_messages_company ON public.internal_messages USING btree (company_id);


--
-- Name: idx_internal_messages_receiver; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_internal_messages_receiver ON public.internal_messages USING btree (receiver_id);


--
-- Name: idx_internal_messages_sender; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_internal_messages_sender ON public.internal_messages USING btree (sender_id);


--
-- Name: idx_internal_messages_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_internal_messages_status ON public.internal_messages USING btree (status);


--
-- Name: idx_peligros_asignacion_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_peligros_asignacion_company ON public.peligros_trabajadores_asignacion USING btree (company_id);


--
-- Name: idx_peligros_asignacion_dept; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_peligros_asignacion_dept ON public.peligros_trabajadores_asignacion USING btree (department);


--
-- Name: idx_peligros_asignacion_peligro; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_peligros_asignacion_peligro ON public.peligros_trabajadores_asignacion USING btree (peligro_id);


--
-- Name: idx_peligros_asignacion_position; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_peligros_asignacion_position ON public.peligros_trabajadores_asignacion USING btree ("position");


--
-- Name: idx_support_access_events_session; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_support_access_events_session ON public.support_access_events USING btree (session_id);


--
-- Name: idx_support_access_sessions_company; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_support_access_sessions_company ON public.support_access_sessions USING btree (company_id);


--
-- Name: idx_support_access_sessions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_support_access_sessions_status ON public.support_access_sessions USING btree (status);


--
-- Name: idx_support_access_sessions_support_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_support_access_sessions_support_user ON public.support_access_sessions USING btree (support_user_id);


--
-- Name: idx_workers_company_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_workers_company_created ON public.workers USING btree (company_id, created_at DESC);


--
-- Name: idx_workers_company_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_workers_company_status ON public.workers USING btree (company_id, status);


--
-- Name: accidents accidents_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accidents
    ADD CONSTRAINT accidents_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: accidents accidents_worker_id_workers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accidents
    ADD CONSTRAINT accidents_worker_id_workers_id_fk FOREIGN KEY (worker_id) REFERENCES public.workers(id);


--
-- Name: acciones_mejora acciones_mejora_evaluacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.acciones_mejora
    ADD CONSTRAINT acciones_mejora_evaluacion_id_fkey FOREIGN KEY (evaluacion_id) REFERENCES public.evaluaciones_sst(id) ON DELETE CASCADE;


--
-- Name: acciones_mejora acciones_mejora_respuesta_estandar_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.acciones_mejora
    ADD CONSTRAINT acciones_mejora_respuesta_estandar_id_fkey FOREIGN KEY (respuesta_estandar_id) REFERENCES public.respuestas_estandares(id);


--
-- Name: acciones_revision acciones_revision_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.acciones_revision
    ADD CONSTRAINT acciones_revision_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: acciones_revision acciones_revision_decision_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.acciones_revision
    ADD CONSTRAINT acciones_revision_decision_id_fkey FOREIGN KEY (decision_id) REFERENCES public.decisiones_revision(id) ON DELETE SET NULL;


--
-- Name: acciones_revision acciones_revision_responsable_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.acciones_revision
    ADD CONSTRAINT acciones_revision_responsable_fkey FOREIGN KEY (responsable) REFERENCES public.users(id);


--
-- Name: acciones_revision acciones_revision_revision_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.acciones_revision
    ADD CONSTRAINT acciones_revision_revision_id_fkey FOREIGN KEY (revision_id) REFERENCES public.revisiones_direccion(id) ON DELETE CASCADE;


--
-- Name: acciones_revision acciones_revision_verificado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.acciones_revision
    ADD CONSTRAINT acciones_revision_verificado_por_fkey FOREIGN KEY (verificado_por) REFERENCES public.users(id);


--
-- Name: actividades_plan_trabajo actividades_plan_trabajo_plan_trabajo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.actividades_plan_trabajo
    ADD CONSTRAINT actividades_plan_trabajo_plan_trabajo_id_fkey FOREIGN KEY (plan_trabajo_id) REFERENCES public.planes_trabajo_anual(id) ON DELETE CASCADE;


--
-- Name: adquisicion_items adquisicion_items_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.adquisicion_items
    ADD CONSTRAINT adquisicion_items_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: adquisicion_items adquisicion_items_resource_allocation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.adquisicion_items
    ADD CONSTRAINT adquisicion_items_resource_allocation_id_fkey FOREIGN KEY (resource_allocation_id) REFERENCES public.resource_allocations(id);


--
-- Name: adquisicion_items adquisicion_items_solicitud_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.adquisicion_items
    ADD CONSTRAINT adquisicion_items_solicitud_id_fkey FOREIGN KEY (solicitud_id) REFERENCES public.solicitudes_adquisicion(id) ON DELETE CASCADE;


--
-- Name: afiliaciones_ssss afiliaciones_ssss_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.afiliaciones_ssss
    ADD CONSTRAINT afiliaciones_ssss_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: afiliaciones_ssss afiliaciones_ssss_worker_id_workers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.afiliaciones_ssss
    ADD CONSTRAINT afiliaciones_ssss_worker_id_workers_id_fk FOREIGN KEY (worker_id) REFERENCES public.workers(id) ON DELETE CASCADE;


--
-- Name: analisis_vulnerabilidad analisis_vulnerabilidad_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analisis_vulnerabilidad
    ADD CONSTRAINT analisis_vulnerabilidad_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: analisis_vulnerabilidad analisis_vulnerabilidad_plan_emergencia_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analisis_vulnerabilidad
    ADD CONSTRAINT analisis_vulnerabilidad_plan_emergencia_id_fkey FOREIGN KEY (plan_emergencia_id) REFERENCES public.planes_emergencia(id) ON DELETE SET NULL;


--
-- Name: analisis_vulnerabilidad analisis_vulnerabilidad_responsable_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analisis_vulnerabilidad
    ADD CONSTRAINT analisis_vulnerabilidad_responsable_id_fkey FOREIGN KEY (responsable_id) REFERENCES public.workers(id);


--
-- Name: aprobaciones_cambios aprobaciones_cambios_cambio_id_cambios_sst_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aprobaciones_cambios
    ADD CONSTRAINT aprobaciones_cambios_cambio_id_cambios_sst_id_fk FOREIGN KEY (cambio_id) REFERENCES public.cambios_sst(id) ON DELETE CASCADE;


--
-- Name: aprobaciones_cambios aprobaciones_cambios_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aprobaciones_cambios
    ADD CONSTRAINT aprobaciones_cambios_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: arco_requests arco_requests_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arco_requests
    ADD CONSTRAINT arco_requests_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: arco_requests arco_requests_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arco_requests
    ADD CONSTRAINT arco_requests_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: arco_requests arco_requests_escalated_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arco_requests
    ADD CONSTRAINT arco_requests_escalated_to_fkey FOREIGN KEY (escalated_to) REFERENCES public.users(id);


--
-- Name: arco_requests arco_requests_intake_recorded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arco_requests
    ADD CONSTRAINT arco_requests_intake_recorded_by_fkey FOREIGN KEY (intake_recorded_by) REFERENCES public.users(id);


--
-- Name: arco_requests arco_requests_representative_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arco_requests
    ADD CONSTRAINT arco_requests_representative_verified_by_fkey FOREIGN KEY (representative_verified_by) REFERENCES public.users(id);


--
-- Name: arco_requests arco_requests_response_provided_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arco_requests
    ADD CONSTRAINT arco_requests_response_provided_by_fkey FOREIGN KEY (response_provided_by) REFERENCES public.users(id);


--
-- Name: arco_requests arco_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arco_requests
    ADD CONSTRAINT arco_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: arco_requests arco_requests_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arco_requests
    ADD CONSTRAINT arco_requests_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(id);


--
-- Name: audit_logs audit_logs_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: auditoria_auditores auditoria_auditores_auditor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auditoria_auditores
    ADD CONSTRAINT auditoria_auditores_auditor_id_fkey FOREIGN KEY (auditor_id) REFERENCES public.users(id);


--
-- Name: auditoria_auditores auditoria_auditores_auditoria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auditoria_auditores
    ADD CONSTRAINT auditoria_auditores_auditoria_id_fkey FOREIGN KEY (auditoria_id) REFERENCES public.auditorias_internas(id) ON DELETE CASCADE;


--
-- Name: auditoria_checklists auditoria_checklists_auditoria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auditoria_checklists
    ADD CONSTRAINT auditoria_checklists_auditoria_id_fkey FOREIGN KEY (auditoria_id) REFERENCES public.auditorias_internas(id) ON DELETE CASCADE;


--
-- Name: auditoria_checklists auditoria_checklists_evaluado_por_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auditoria_checklists
    ADD CONSTRAINT auditoria_checklists_evaluado_por_id_fkey FOREIGN KEY (evaluado_por_id) REFERENCES public.users(id);


--
-- Name: auditorias_internas auditorias_internas_aprobado_por_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auditorias_internas
    ADD CONSTRAINT auditorias_internas_aprobado_por_id_fkey FOREIGN KEY (aprobado_por_id) REFERENCES public.users(id);


--
-- Name: auditorias_internas auditorias_internas_auditorista_lider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auditorias_internas
    ADD CONSTRAINT auditorias_internas_auditorista_lider_id_fkey FOREIGN KEY (auditorista_lider_id) REFERENCES public.users(id);


--
-- Name: auditorias_internas auditorias_internas_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auditorias_internas
    ADD CONSTRAINT auditorias_internas_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: auditorias_internas auditorias_internas_copasst_acta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auditorias_internas
    ADD CONSTRAINT auditorias_internas_copasst_acta_id_fkey FOREIGN KEY (copasst_acta_id) REFERENCES public.copasst_actas(id);


--
-- Name: auditorias_internas auditorias_internas_responsable_auditado_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auditorias_internas
    ADD CONSTRAINT auditorias_internas_responsable_auditado_id_fkey FOREIGN KEY (responsable_auditado_id) REFERENCES public.users(id);


--
-- Name: automatizacion_cambio_logs automatizacion_cambio_logs_cambio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automatizacion_cambio_logs
    ADD CONSTRAINT automatizacion_cambio_logs_cambio_id_fkey FOREIGN KEY (cambio_id) REFERENCES public.cambios_sst(id) ON DELETE CASCADE;


--
-- Name: automatizacion_cambio_logs automatizacion_cambio_logs_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automatizacion_cambio_logs
    ADD CONSTRAINT automatizacion_cambio_logs_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: brigadas_emergencia brigadas_emergencia_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brigadas_emergencia
    ADD CONSTRAINT brigadas_emergencia_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: brigadas_emergencia brigadas_emergencia_plan_emergencia_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brigadas_emergencia
    ADD CONSTRAINT brigadas_emergencia_plan_emergencia_id_fkey FOREIGN KEY (plan_emergencia_id) REFERENCES public.planes_emergencia(id) ON DELETE SET NULL;


--
-- Name: brigadas_emergencia brigadas_emergencia_responsable_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brigadas_emergencia
    ADD CONSTRAINT brigadas_emergencia_responsable_id_fkey FOREIGN KEY (responsable_id) REFERENCES public.workers(id);


--
-- Name: cambios_sst cambios_sst_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cambios_sst
    ADD CONSTRAINT cambios_sst_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: capacitacion_asistentes capacitacion_asistentes_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.capacitacion_asistentes
    ADD CONSTRAINT capacitacion_asistentes_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: capacitacion_asistentes capacitacion_asistentes_evento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.capacitacion_asistentes
    ADD CONSTRAINT capacitacion_asistentes_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.capacitacion_eventos(id) ON DELETE CASCADE;


--
-- Name: capacitacion_asistentes capacitacion_asistentes_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.capacitacion_asistentes
    ADD CONSTRAINT capacitacion_asistentes_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(id);


--
-- Name: capacitacion_eventos capacitacion_eventos_catalogo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.capacitacion_eventos
    ADD CONSTRAINT capacitacion_eventos_catalogo_id_fkey FOREIGN KEY (catalogo_id) REFERENCES public.capacitaciones_catalogo(id);


--
-- Name: capacitacion_eventos capacitacion_eventos_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.capacitacion_eventos
    ADD CONSTRAINT capacitacion_eventos_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: capacitaciones_cambios capacitaciones_cambios_cambio_id_cambios_sst_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.capacitaciones_cambios
    ADD CONSTRAINT capacitaciones_cambios_cambio_id_cambios_sst_id_fk FOREIGN KEY (cambio_id) REFERENCES public.cambios_sst(id) ON DELETE CASCADE;


--
-- Name: capacitaciones_cambios capacitaciones_cambios_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.capacitaciones_cambios
    ADD CONSTRAINT capacitaciones_cambios_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: capacitaciones_cambios capacitaciones_cambios_training_id_trainings_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.capacitaciones_cambios
    ADD CONSTRAINT capacitaciones_cambios_training_id_trainings_id_fk FOREIGN KEY (training_id) REFERENCES public.trainings(id);


--
-- Name: comite_convivencia_actas comite_convivencia_actas_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comite_convivencia_actas
    ADD CONSTRAINT comite_convivencia_actas_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: comite_convivencia_actas comite_convivencia_actas_empleador1_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comite_convivencia_actas
    ADD CONSTRAINT comite_convivencia_actas_empleador1_worker_id_fkey FOREIGN KEY (empleador1_worker_id) REFERENCES public.workers(id);


--
-- Name: comite_convivencia_actas comite_convivencia_actas_empleador2_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comite_convivencia_actas
    ADD CONSTRAINT comite_convivencia_actas_empleador2_worker_id_fkey FOREIGN KEY (empleador2_worker_id) REFERENCES public.workers(id);


--
-- Name: comite_convivencia_actas comite_convivencia_actas_empleador3_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comite_convivencia_actas
    ADD CONSTRAINT comite_convivencia_actas_empleador3_worker_id_fkey FOREIGN KEY (empleador3_worker_id) REFERENCES public.workers(id);


--
-- Name: comite_convivencia_actas comite_convivencia_actas_trabajador1_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comite_convivencia_actas
    ADD CONSTRAINT comite_convivencia_actas_trabajador1_worker_id_fkey FOREIGN KEY (trabajador1_worker_id) REFERENCES public.workers(id);


--
-- Name: comite_convivencia_actas comite_convivencia_actas_trabajador2_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comite_convivencia_actas
    ADD CONSTRAINT comite_convivencia_actas_trabajador2_worker_id_fkey FOREIGN KEY (trabajador2_worker_id) REFERENCES public.workers(id);


--
-- Name: comite_convivencia_actas comite_convivencia_actas_trabajador3_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comite_convivencia_actas
    ADD CONSTRAINT comite_convivencia_actas_trabajador3_worker_id_fkey FOREIGN KEY (trabajador3_worker_id) REFERENCES public.workers(id);


--
-- Name: comunicaciones_sst comunicaciones_sst_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comunicaciones_sst
    ADD CONSTRAINT comunicaciones_sst_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: comunicaciones_sst comunicaciones_sst_enviado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comunicaciones_sst
    ADD CONSTRAINT comunicaciones_sst_enviado_por_fkey FOREIGN KEY (enviado_por) REFERENCES public.users(id);


--
-- Name: consent_records consent_records_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consent_records
    ADD CONSTRAINT consent_records_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: consent_records consent_records_recorded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consent_records
    ADD CONSTRAINT consent_records_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES public.users(id);


--
-- Name: consent_records consent_records_revoked_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consent_records
    ADD CONSTRAINT consent_records_revoked_by_fkey FOREIGN KEY (revoked_by) REFERENCES public.users(id);


--
-- Name: consent_records consent_records_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consent_records
    ADD CONSTRAINT consent_records_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: consent_records consent_records_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consent_records
    ADD CONSTRAINT consent_records_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(id);


--
-- Name: contenidos_induccion contenidos_induccion_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contenidos_induccion
    ADD CONSTRAINT contenidos_induccion_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: contracts contracts_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: contracts contracts_job_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_job_profile_id_fkey FOREIGN KEY (job_profile_id) REFERENCES public.job_profiles(id);


--
-- Name: contracts contracts_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(id);


--
-- Name: controles_cambios controles_cambios_cambio_id_cambios_sst_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.controles_cambios
    ADD CONSTRAINT controles_cambios_cambio_id_cambios_sst_id_fk FOREIGN KEY (cambio_id) REFERENCES public.cambios_sst(id) ON DELETE CASCADE;


--
-- Name: controles_cambios controles_cambios_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.controles_cambios
    ADD CONSTRAINT controles_cambios_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: controles_cambios controles_cambios_evaluacion_id_evaluaciones_impacto_cambios_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.controles_cambios
    ADD CONSTRAINT controles_cambios_evaluacion_id_evaluaciones_impacto_cambios_id FOREIGN KEY (evaluacion_id) REFERENCES public.evaluaciones_impacto_cambios(id) ON DELETE CASCADE;


--
-- Name: convivencia_actas convivencia_actas_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.convivencia_actas
    ADD CONSTRAINT convivencia_actas_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: convivencia_actas convivencia_actas_eleccion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.convivencia_actas
    ADD CONSTRAINT convivencia_actas_eleccion_id_fkey FOREIGN KEY (eleccion_id) REFERENCES public.convivencia_elecciones(id) ON DELETE SET NULL;


--
-- Name: convivencia_candidatos convivencia_candidatos_eleccion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.convivencia_candidatos
    ADD CONSTRAINT convivencia_candidatos_eleccion_id_fkey FOREIGN KEY (eleccion_id) REFERENCES public.convivencia_elecciones(id) ON DELETE CASCADE;


--
-- Name: convivencia_candidatos convivencia_candidatos_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.convivencia_candidatos
    ADD CONSTRAINT convivencia_candidatos_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(id) ON DELETE CASCADE;


--
-- Name: convivencia_elecciones convivencia_elecciones_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.convivencia_elecciones
    ADD CONSTRAINT convivencia_elecciones_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: convivencia_elecciones convivencia_elecciones_periodo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.convivencia_elecciones
    ADD CONSTRAINT convivencia_elecciones_periodo_id_fkey FOREIGN KEY (periodo_id) REFERENCES public.convivencia_periodos(id);


--
-- Name: convivencia_miembros convivencia_miembros_periodo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.convivencia_miembros
    ADD CONSTRAINT convivencia_miembros_periodo_id_fkey FOREIGN KEY (periodo_id) REFERENCES public.convivencia_periodos(id) ON DELETE CASCADE;


--
-- Name: convivencia_miembros convivencia_miembros_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.convivencia_miembros
    ADD CONSTRAINT convivencia_miembros_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(id) ON DELETE CASCADE;


--
-- Name: convivencia_periodos convivencia_periodos_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.convivencia_periodos
    ADD CONSTRAINT convivencia_periodos_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: convivencia_registro_votacion convivencia_registro_votacion_eleccion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.convivencia_registro_votacion
    ADD CONSTRAINT convivencia_registro_votacion_eleccion_id_fkey FOREIGN KEY (eleccion_id) REFERENCES public.convivencia_elecciones(id) ON DELETE CASCADE;


--
-- Name: convivencia_registro_votacion convivencia_registro_votacion_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.convivencia_registro_votacion
    ADD CONSTRAINT convivencia_registro_votacion_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(id) ON DELETE CASCADE;


--
-- Name: convivencia_votos convivencia_votos_candidato_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.convivencia_votos
    ADD CONSTRAINT convivencia_votos_candidato_id_fkey FOREIGN KEY (candidato_id) REFERENCES public.convivencia_candidatos(id) ON DELETE CASCADE;


--
-- Name: convivencia_votos convivencia_votos_eleccion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.convivencia_votos
    ADD CONSTRAINT convivencia_votos_eleccion_id_fkey FOREIGN KEY (eleccion_id) REFERENCES public.convivencia_elecciones(id) ON DELETE CASCADE;


--
-- Name: copasst_actas copasst_actas_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_actas
    ADD CONSTRAINT copasst_actas_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: copasst_actas copasst_actas_presidente_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_actas
    ADD CONSTRAINT copasst_actas_presidente_worker_id_fkey FOREIGN KEY (presidente_worker_id) REFERENCES public.workers(id);


--
-- Name: copasst_actas copasst_actas_secretaria_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_actas
    ADD CONSTRAINT copasst_actas_secretaria_worker_id_fkey FOREIGN KEY (secretaria_worker_id) REFERENCES public.workers(id);


--
-- Name: copasst_banco_preguntas copasst_banco_preguntas_categoria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_banco_preguntas
    ADD CONSTRAINT copasst_banco_preguntas_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.copasst_curso_categorias(id) ON DELETE SET NULL;


--
-- Name: copasst_banco_preguntas copasst_banco_preguntas_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_banco_preguntas
    ADD CONSTRAINT copasst_banco_preguntas_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: copasst_candidatos copasst_candidatos_eleccion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_candidatos
    ADD CONSTRAINT copasst_candidatos_eleccion_id_fkey FOREIGN KEY (eleccion_id) REFERENCES public.copasst_elecciones(id) ON DELETE CASCADE;


--
-- Name: copasst_candidatos copasst_candidatos_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_candidatos
    ADD CONSTRAINT copasst_candidatos_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(id) ON DELETE CASCADE;


--
-- Name: copasst_certificados copasst_certificados_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_certificados
    ADD CONSTRAINT copasst_certificados_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: copasst_certificados copasst_certificados_curso_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_certificados
    ADD CONSTRAINT copasst_certificados_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.copasst_cursos(id) ON DELETE CASCADE;


--
-- Name: copasst_certificados copasst_certificados_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_certificados
    ADD CONSTRAINT copasst_certificados_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: copasst_competencias copasst_competencias_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_competencias
    ADD CONSTRAINT copasst_competencias_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: copasst_curso_asignaciones copasst_curso_asignaciones_asignado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_curso_asignaciones
    ADD CONSTRAINT copasst_curso_asignaciones_asignado_por_fkey FOREIGN KEY (asignado_por) REFERENCES public.users(id);


--
-- Name: copasst_curso_asignaciones copasst_curso_asignaciones_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_curso_asignaciones
    ADD CONSTRAINT copasst_curso_asignaciones_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: copasst_curso_asignaciones copasst_curso_asignaciones_curso_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_curso_asignaciones
    ADD CONSTRAINT copasst_curso_asignaciones_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.copasst_cursos(id) ON DELETE CASCADE;


--
-- Name: copasst_curso_asignaciones copasst_curso_asignaciones_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_curso_asignaciones
    ADD CONSTRAINT copasst_curso_asignaciones_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: copasst_curso_categorias copasst_curso_categorias_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_curso_categorias
    ADD CONSTRAINT copasst_curso_categorias_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: copasst_elecciones copasst_elecciones_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_elecciones
    ADD CONSTRAINT copasst_elecciones_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: copasst_elecciones copasst_elecciones_periodo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_elecciones
    ADD CONSTRAINT copasst_elecciones_periodo_id_fkey FOREIGN KEY (periodo_id) REFERENCES public.copasst_periodos(id);


--
-- Name: copasst_escenario_nodos copasst_escenario_nodos_escenario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_escenario_nodos
    ADD CONSTRAINT copasst_escenario_nodos_escenario_id_fkey FOREIGN KEY (escenario_id) REFERENCES public.copasst_escenarios(id) ON DELETE CASCADE;


--
-- Name: copasst_escenario_progreso copasst_escenario_progreso_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_escenario_progreso
    ADD CONSTRAINT copasst_escenario_progreso_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: copasst_escenario_progreso copasst_escenario_progreso_escenario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_escenario_progreso
    ADD CONSTRAINT copasst_escenario_progreso_escenario_id_fkey FOREIGN KEY (escenario_id) REFERENCES public.copasst_escenarios(id) ON DELETE CASCADE;


--
-- Name: copasst_escenario_progreso copasst_escenario_progreso_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_escenario_progreso
    ADD CONSTRAINT copasst_escenario_progreso_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: copasst_evaluacion_asignaciones copasst_evaluacion_asignaciones_evaluado_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_evaluacion_asignaciones
    ADD CONSTRAINT copasst_evaluacion_asignaciones_evaluado_id_fkey FOREIGN KEY (evaluado_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: copasst_evaluacion_asignaciones copasst_evaluacion_asignaciones_evaluador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_evaluacion_asignaciones
    ADD CONSTRAINT copasst_evaluacion_asignaciones_evaluador_id_fkey FOREIGN KEY (evaluador_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: copasst_evaluacion_asignaciones copasst_evaluacion_asignaciones_periodo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_evaluacion_asignaciones
    ADD CONSTRAINT copasst_evaluacion_asignaciones_periodo_id_fkey FOREIGN KEY (periodo_id) REFERENCES public.copasst_evaluacion_periodos(id) ON DELETE CASCADE;


--
-- Name: copasst_evaluacion_items copasst_evaluacion_items_competencia_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_evaluacion_items
    ADD CONSTRAINT copasst_evaluacion_items_competencia_id_fkey FOREIGN KEY (competencia_id) REFERENCES public.copasst_competencias(id) ON DELETE CASCADE;


--
-- Name: copasst_evaluacion_items copasst_evaluacion_items_periodo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_evaluacion_items
    ADD CONSTRAINT copasst_evaluacion_items_periodo_id_fkey FOREIGN KEY (periodo_id) REFERENCES public.copasst_evaluacion_periodos(id) ON DELETE CASCADE;


--
-- Name: copasst_evaluacion_periodos copasst_evaluacion_periodos_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_evaluacion_periodos
    ADD CONSTRAINT copasst_evaluacion_periodos_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: copasst_evaluacion_respuestas copasst_evaluacion_respuestas_asignacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_evaluacion_respuestas
    ADD CONSTRAINT copasst_evaluacion_respuestas_asignacion_id_fkey FOREIGN KEY (asignacion_id) REFERENCES public.copasst_evaluacion_asignaciones(id) ON DELETE CASCADE;


--
-- Name: copasst_evaluacion_respuestas copasst_evaluacion_respuestas_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_evaluacion_respuestas
    ADD CONSTRAINT copasst_evaluacion_respuestas_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.copasst_evaluacion_items(id) ON DELETE CASCADE;


--
-- Name: copasst_evaluacion_resultados copasst_evaluacion_resultados_evaluado_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_evaluacion_resultados
    ADD CONSTRAINT copasst_evaluacion_resultados_evaluado_id_fkey FOREIGN KEY (evaluado_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: copasst_evaluacion_resultados copasst_evaluacion_resultados_periodo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_evaluacion_resultados
    ADD CONSTRAINT copasst_evaluacion_resultados_periodo_id_fkey FOREIGN KEY (periodo_id) REFERENCES public.copasst_evaluacion_periodos(id) ON DELETE CASCADE;


--
-- Name: copasst_insignias_usuario copasst_insignias_usuario_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_insignias_usuario
    ADD CONSTRAINT copasst_insignias_usuario_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: copasst_insignias_usuario copasst_insignias_usuario_insignia_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_insignias_usuario
    ADD CONSTRAINT copasst_insignias_usuario_insignia_id_fkey FOREIGN KEY (insignia_id) REFERENCES public.copasst_insignias(id) ON DELETE CASCADE;


--
-- Name: copasst_insignias_usuario copasst_insignias_usuario_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_insignias_usuario
    ADD CONSTRAINT copasst_insignias_usuario_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: copasst_lecciones copasst_lecciones_curso_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_lecciones
    ADD CONSTRAINT copasst_lecciones_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.copasst_cursos(id) ON DELETE CASCADE;


--
-- Name: copasst_miembros copasst_miembros_periodo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_miembros
    ADD CONSTRAINT copasst_miembros_periodo_id_fkey FOREIGN KEY (periodo_id) REFERENCES public.copasst_periodos(id) ON DELETE CASCADE;


--
-- Name: copasst_miembros copasst_miembros_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_miembros
    ADD CONSTRAINT copasst_miembros_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(id) ON DELETE CASCADE;


--
-- Name: copasst_notificaciones copasst_notificaciones_asignacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_notificaciones
    ADD CONSTRAINT copasst_notificaciones_asignacion_id_fkey FOREIGN KEY (asignacion_id) REFERENCES public.copasst_curso_asignaciones(id) ON DELETE CASCADE;


--
-- Name: copasst_notificaciones copasst_notificaciones_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_notificaciones
    ADD CONSTRAINT copasst_notificaciones_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: copasst_notificaciones copasst_notificaciones_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_notificaciones
    ADD CONSTRAINT copasst_notificaciones_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: copasst_periodos copasst_periodos_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_periodos
    ADD CONSTRAINT copasst_periodos_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: copasst_progreso copasst_progreso_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_progreso
    ADD CONSTRAINT copasst_progreso_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: copasst_progreso copasst_progreso_curso_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_progreso
    ADD CONSTRAINT copasst_progreso_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.copasst_cursos(id) ON DELETE CASCADE;


--
-- Name: copasst_progreso copasst_progreso_leccion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_progreso
    ADD CONSTRAINT copasst_progreso_leccion_id_fkey FOREIGN KEY (leccion_id) REFERENCES public.copasst_lecciones(id) ON DELETE CASCADE;


--
-- Name: copasst_progreso copasst_progreso_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_progreso
    ADD CONSTRAINT copasst_progreso_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: copasst_puntos_mensuales copasst_puntos_mensuales_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_puntos_mensuales
    ADD CONSTRAINT copasst_puntos_mensuales_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: copasst_puntos_mensuales copasst_puntos_mensuales_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_puntos_mensuales
    ADD CONSTRAINT copasst_puntos_mensuales_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: copasst_quiz_preguntas copasst_quiz_preguntas_curso_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_quiz_preguntas
    ADD CONSTRAINT copasst_quiz_preguntas_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.copasst_cursos(id) ON DELETE CASCADE;


--
-- Name: copasst_rachas_usuario copasst_rachas_usuario_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_rachas_usuario
    ADD CONSTRAINT copasst_rachas_usuario_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: copasst_rachas_usuario copasst_rachas_usuario_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_rachas_usuario
    ADD CONSTRAINT copasst_rachas_usuario_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: copasst_registro_votacion copasst_registro_votacion_eleccion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_registro_votacion
    ADD CONSTRAINT copasst_registro_votacion_eleccion_id_fkey FOREIGN KEY (eleccion_id) REFERENCES public.copasst_elecciones(id) ON DELETE CASCADE;


--
-- Name: copasst_registro_votacion copasst_registro_votacion_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_registro_votacion
    ADD CONSTRAINT copasst_registro_votacion_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(id) ON DELETE CASCADE;


--
-- Name: copasst_votos copasst_votos_candidato_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_votos
    ADD CONSTRAINT copasst_votos_candidato_id_fkey FOREIGN KEY (candidato_id) REFERENCES public.copasst_candidatos(id) ON DELETE CASCADE;


--
-- Name: copasst_votos copasst_votos_eleccion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.copasst_votos
    ADD CONSTRAINT copasst_votos_eleccion_id_fkey FOREIGN KEY (eleccion_id) REFERENCES public.copasst_elecciones(id) ON DELETE CASCADE;


--
-- Name: criterios_evaluacion_proveedor criterios_evaluacion_proveedor_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.criterios_evaluacion_proveedor
    ADD CONSTRAINT criterios_evaluacion_proveedor_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: curso_50_horas curso_50_horas_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.curso_50_horas
    ADD CONSTRAINT curso_50_horas_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: datos_calculo_indicadores datos_calculo_indicadores_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.datos_calculo_indicadores
    ADD CONSTRAINT datos_calculo_indicadores_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: decisiones_revision decisiones_revision_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.decisiones_revision
    ADD CONSTRAINT decisiones_revision_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: decisiones_revision decisiones_revision_responsable_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.decisiones_revision
    ADD CONSTRAINT decisiones_revision_responsable_fkey FOREIGN KEY (responsable) REFERENCES public.users(id);


--
-- Name: decisiones_revision decisiones_revision_revision_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.decisiones_revision
    ADD CONSTRAINT decisiones_revision_revision_id_fkey FOREIGN KEY (revision_id) REFERENCES public.revisiones_direccion(id) ON DELETE CASCADE;


--
-- Name: detalle_verificacion_sgss detalle_verificacion_sgss_verificacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.detalle_verificacion_sgss
    ADD CONSTRAINT detalle_verificacion_sgss_verificacion_id_fkey FOREIGN KEY (verificacion_id) REFERENCES public.verificaciones_muestreo_sgss(id) ON DELETE CASCADE;


--
-- Name: detalle_verificacion_sgss detalle_verificacion_sgss_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.detalle_verificacion_sgss
    ADD CONSTRAINT detalle_verificacion_sgss_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(id) ON DELETE CASCADE;


--
-- Name: documentos_proveedores documentos_proveedores_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documentos_proveedores
    ADD CONSTRAINT documentos_proveedores_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: documentos_proveedores documentos_proveedores_proveedor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documentos_proveedores
    ADD CONSTRAINT documentos_proveedores_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES public.proveedores_contratistas(id) ON DELETE CASCADE;


--
-- Name: drivers drivers_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: drivers drivers_worker_id_workers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_worker_id_workers_id_fk FOREIGN KEY (worker_id) REFERENCES public.workers(id);


--
-- Name: email_notifications email_notifications_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_notifications
    ADD CONSTRAINT email_notifications_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: email_notifications email_notifications_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_notifications
    ADD CONSTRAINT email_notifications_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(id);


--
-- Name: environmental_measurements environmental_measurements_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.environmental_measurements
    ADD CONSTRAINT environmental_measurements_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: especificaciones_tecnicas especificaciones_tecnicas_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.especificaciones_tecnicas
    ADD CONSTRAINT especificaciones_tecnicas_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: especificaciones_tecnicas especificaciones_tecnicas_solicitud_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.especificaciones_tecnicas
    ADD CONSTRAINT especificaciones_tecnicas_solicitud_id_fkey FOREIGN KEY (solicitud_id) REFERENCES public.solicitudes_adquisicion(id) ON DELETE CASCADE;


--
-- Name: estandares_sst estandares_sst_componente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estandares_sst
    ADD CONSTRAINT estandares_sst_componente_id_fkey FOREIGN KEY (componente_id) REFERENCES public.componentes_sst(id);


--
-- Name: evaluaciones_adquisicion evaluaciones_adquisicion_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evaluaciones_adquisicion
    ADD CONSTRAINT evaluaciones_adquisicion_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: evaluaciones_adquisicion evaluaciones_adquisicion_solicitud_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evaluaciones_adquisicion
    ADD CONSTRAINT evaluaciones_adquisicion_solicitud_id_fkey FOREIGN KEY (solicitud_id) REFERENCES public.solicitudes_adquisicion(id) ON DELETE CASCADE;


--
-- Name: evaluaciones_impacto_cambios evaluaciones_impacto_cambios_cambio_id_cambios_sst_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evaluaciones_impacto_cambios
    ADD CONSTRAINT evaluaciones_impacto_cambios_cambio_id_cambios_sst_id_fk FOREIGN KEY (cambio_id) REFERENCES public.cambios_sst(id) ON DELETE CASCADE;


--
-- Name: evaluaciones_impacto_cambios evaluaciones_impacto_cambios_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evaluaciones_impacto_cambios
    ADD CONSTRAINT evaluaciones_impacto_cambios_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: evaluaciones_proveedores evaluaciones_proveedores_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evaluaciones_proveedores
    ADD CONSTRAINT evaluaciones_proveedores_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: evaluaciones_proveedores evaluaciones_proveedores_proveedor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evaluaciones_proveedores
    ADD CONSTRAINT evaluaciones_proveedores_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES public.proveedores_contratistas(id) ON DELETE CASCADE;


--
-- Name: evaluaciones_sst evaluaciones_sst_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evaluaciones_sst
    ADD CONSTRAINT evaluaciones_sst_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: evs_activities evs_activities_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evs_activities
    ADD CONSTRAINT evs_activities_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: evs_activities evs_activities_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evs_activities
    ADD CONSTRAINT evs_activities_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: evs_activities evs_activities_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evs_activities
    ADD CONSTRAINT evs_activities_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.evs_programs(id) ON DELETE SET NULL;


--
-- Name: evs_controls evs_controls_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evs_controls
    ADD CONSTRAINT evs_controls_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: evs_controls evs_controls_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evs_controls
    ADD CONSTRAINT evs_controls_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: evs_controls evs_controls_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evs_controls
    ADD CONSTRAINT evs_controls_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.evs_programs(id) ON DELETE SET NULL;


--
-- Name: evs_controls evs_controls_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evs_controls
    ADD CONSTRAINT evs_controls_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(id) ON DELETE CASCADE;


--
-- Name: evs_followups evs_followups_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evs_followups
    ADD CONSTRAINT evs_followups_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: evs_followups evs_followups_control_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evs_followups
    ADD CONSTRAINT evs_followups_control_id_fkey FOREIGN KEY (control_id) REFERENCES public.evs_controls(id) ON DELETE SET NULL;


--
-- Name: evs_followups evs_followups_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evs_followups
    ADD CONSTRAINT evs_followups_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: evs_followups evs_followups_incident_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evs_followups
    ADD CONSTRAINT evs_followups_incident_id_fkey FOREIGN KEY (incident_id) REFERENCES public.evs_incidents(id) ON DELETE SET NULL;


--
-- Name: evs_followups evs_followups_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evs_followups
    ADD CONSTRAINT evs_followups_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(id) ON DELETE CASCADE;


--
-- Name: evs_incidents evs_incidents_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evs_incidents
    ADD CONSTRAINT evs_incidents_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: evs_incidents evs_incidents_control_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evs_incidents
    ADD CONSTRAINT evs_incidents_control_id_fkey FOREIGN KEY (control_id) REFERENCES public.evs_controls(id) ON DELETE SET NULL;


--
-- Name: evs_incidents evs_incidents_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evs_incidents
    ADD CONSTRAINT evs_incidents_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: evs_incidents evs_incidents_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evs_incidents
    ADD CONSTRAINT evs_incidents_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(id) ON DELETE SET NULL;


--
-- Name: evs_participants evs_participants_activity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evs_participants
    ADD CONSTRAINT evs_participants_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.evs_activities(id) ON DELETE CASCADE;


--
-- Name: evs_participants evs_participants_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evs_participants
    ADD CONSTRAINT evs_participants_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(id) ON DELETE SET NULL;


--
-- Name: evs_programs evs_programs_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evs_programs
    ADD CONSTRAINT evs_programs_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: evs_programs evs_programs_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evs_programs
    ADD CONSTRAINT evs_programs_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: evs_programs evs_programs_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.evs_programs
    ADD CONSTRAINT evs_programs_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: hallazgos_auditoria hallazgos_auditoria_auditoria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hallazgos_auditoria
    ADD CONSTRAINT hallazgos_auditoria_auditoria_id_fkey FOREIGN KEY (auditoria_id) REFERENCES public.auditorias_internas(id);


--
-- Name: hallazgos_auditoria hallazgos_auditoria_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hallazgos_auditoria
    ADD CONSTRAINT hallazgos_auditoria_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: hallazgos_auditoria hallazgos_auditoria_detectado_por_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hallazgos_auditoria
    ADD CONSTRAINT hallazgos_auditoria_detectado_por_id_fkey FOREIGN KEY (detectado_por_id) REFERENCES public.users(id);


--
-- Name: hallazgos_auditoria hallazgos_auditoria_responsable_area_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hallazgos_auditoria
    ADD CONSTRAINT hallazgos_auditoria_responsable_area_id_fkey FOREIGN KEY (responsable_area_id) REFERENCES public.users(id);


--
-- Name: hallazgos_auditoria hallazgos_auditoria_verificado_por_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hallazgos_auditoria
    ADD CONSTRAINT hallazgos_auditoria_verificado_por_id_fkey FOREIGN KEY (verificado_por_id) REFERENCES public.users(id);


--
-- Name: hazardous_substances hazardous_substances_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hazardous_substances
    ADD CONSTRAINT hazardous_substances_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: high_risk_workers high_risk_workers_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.high_risk_workers
    ADD CONSTRAINT high_risk_workers_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: high_risk_workers high_risk_workers_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.high_risk_workers
    ADD CONSTRAINT high_risk_workers_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(id) ON DELETE CASCADE;


--
-- Name: historial_comunicaciones_sst historial_comunicaciones_sst_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historial_comunicaciones_sst
    ADD CONSTRAINT historial_comunicaciones_sst_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: historial_comunicaciones_sst historial_comunicaciones_sst_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historial_comunicaciones_sst
    ADD CONSTRAINT historial_comunicaciones_sst_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: hojas_seguridad hojas_seguridad_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hojas_seguridad
    ADD CONSTRAINT hojas_seguridad_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: hojas_seguridad hojas_seguridad_solicitud_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hojas_seguridad
    ADD CONSTRAINT hojas_seguridad_solicitud_id_fkey FOREIGN KEY (solicitud_id) REFERENCES public.solicitudes_adquisicion(id) ON DELETE CASCADE;


--
-- Name: indicadores_sst indicadores_sst_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.indicadores_sst
    ADD CONSTRAINT indicadores_sst_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: indicadores_sst indicadores_sst_objetivo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.indicadores_sst
    ADD CONSTRAINT indicadores_sst_objetivo_id_fkey FOREIGN KEY (objetivo_id) REFERENCES public.objetivos_sst(id);


--
-- Name: inspecciones_peligros_vinculados inspecciones_peligros_vinculados_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspecciones_peligros_vinculados
    ADD CONSTRAINT inspecciones_peligros_vinculados_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: inspecciones_peligros_vinculados inspecciones_peligros_vinculados_inspeccion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspecciones_peligros_vinculados
    ADD CONSTRAINT inspecciones_peligros_vinculados_inspeccion_id_fkey FOREIGN KEY (inspeccion_id) REFERENCES public.inspections(id) ON DELETE CASCADE;


--
-- Name: inspecciones_peligros_vinculados inspecciones_peligros_vinculados_peligro_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspecciones_peligros_vinculados
    ADD CONSTRAINT inspecciones_peligros_vinculados_peligro_id_fkey FOREIGN KEY (peligro_id) REFERENCES public.peligros_iperc(id) ON DELETE CASCADE;


--
-- Name: inspecciones_peligros_vinculados inspecciones_peligros_vinculados_verificado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspecciones_peligros_vinculados
    ADD CONSTRAINT inspecciones_peligros_vinculados_verificado_por_fkey FOREIGN KEY (verificado_por) REFERENCES public.users(id);


--
-- Name: inspecciones_recursos_emergencia inspecciones_recursos_emergencia_inspector_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspecciones_recursos_emergencia
    ADD CONSTRAINT inspecciones_recursos_emergencia_inspector_id_fkey FOREIGN KEY (inspector_id) REFERENCES public.workers(id);


--
-- Name: inspecciones_recursos_emergencia inspecciones_recursos_emergencia_recurso_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspecciones_recursos_emergencia
    ADD CONSTRAINT inspecciones_recursos_emergencia_recurso_id_fkey FOREIGN KEY (recurso_id) REFERENCES public.recursos_emergencia(id) ON DELETE CASCADE;


--
-- Name: inspections inspections_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inspections
    ADD CONSTRAINT inspections_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: internal_messages internal_messages_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.internal_messages
    ADD CONSTRAINT internal_messages_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: internal_messages internal_messages_receiver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.internal_messages
    ADD CONSTRAINT internal_messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id);


--
-- Name: internal_messages internal_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.internal_messages
    ADD CONSTRAINT internal_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- Name: invoices invoices_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: invoices invoices_subscription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id);


--
-- Name: invoices invoices_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.payment_transactions(id);


--
-- Name: job_profiles job_profiles_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_profiles
    ADD CONSTRAINT job_profiles_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: lecturas_comunicacion lecturas_comunicacion_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lecturas_comunicacion
    ADD CONSTRAINT lecturas_comunicacion_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: lecturas_comunicacion lecturas_comunicacion_comunicacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lecturas_comunicacion
    ADD CONSTRAINT lecturas_comunicacion_comunicacion_id_fkey FOREIGN KEY (comunicacion_id) REFERENCES public.comunicaciones_sst(id) ON DELETE CASCADE;


--
-- Name: lecturas_comunicacion lecturas_comunicacion_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lecturas_comunicacion
    ADD CONSTRAINT lecturas_comunicacion_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: lecturas_comunicacion lecturas_comunicacion_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lecturas_comunicacion
    ADD CONSTRAINT lecturas_comunicacion_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(id);


--
-- Name: matrices_iperc matrices_iperc_aprobado_por_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matrices_iperc
    ADD CONSTRAINT matrices_iperc_aprobado_por_id_fkey FOREIGN KEY (aprobado_por_id) REFERENCES public.users(id);


--
-- Name: matrices_iperc matrices_iperc_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matrices_iperc
    ADD CONSTRAINT matrices_iperc_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: matrices_iperc matrices_iperc_responsable_evaluacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matrices_iperc
    ADD CONSTRAINT matrices_iperc_responsable_evaluacion_id_fkey FOREIGN KEY (responsable_evaluacion_id) REFERENCES public.users(id);


--
-- Name: matriz_legal matriz_legal_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matriz_legal
    ADD CONSTRAINT matriz_legal_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: medical_exams medical_exams_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medical_exams
    ADD CONSTRAINT medical_exams_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: medical_exams medical_exams_job_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medical_exams
    ADD CONSTRAINT medical_exams_job_profile_id_fkey FOREIGN KEY (job_profile_id) REFERENCES public.job_profiles(id);


--
-- Name: medical_exams medical_exams_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medical_exams
    ADD CONSTRAINT medical_exams_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(id);


--
-- Name: mediciones_indicadores mediciones_indicadores_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mediciones_indicadores
    ADD CONSTRAINT mediciones_indicadores_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: mediciones_indicadores mediciones_indicadores_indicador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mediciones_indicadores
    ADD CONSTRAINT mediciones_indicadores_indicador_id_fkey FOREIGN KEY (indicador_id) REFERENCES public.indicadores_sst(id) ON DELETE CASCADE;


--
-- Name: miembros_brigada miembros_brigada_brigada_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.miembros_brigada
    ADD CONSTRAINT miembros_brigada_brigada_id_fkey FOREIGN KEY (brigada_id) REFERENCES public.brigadas_emergencia(id) ON DELETE CASCADE;


--
-- Name: miembros_brigada miembros_brigada_trabajador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.miembros_brigada
    ADD CONSTRAINT miembros_brigada_trabajador_id_fkey FOREIGN KEY (trabajador_id) REFERENCES public.workers(id) ON DELETE CASCADE;


--
-- Name: objetivos_sst objetivos_sst_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.objetivos_sst
    ADD CONSTRAINT objetivos_sst_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: occupational_diseases occupational_diseases_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.occupational_diseases
    ADD CONSTRAINT occupational_diseases_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: occupational_diseases occupational_diseases_worker_id_workers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.occupational_diseases
    ADD CONSTRAINT occupational_diseases_worker_id_workers_id_fk FOREIGN KEY (worker_id) REFERENCES public.workers(id);


--
-- Name: participantes_revision participantes_revision_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.participantes_revision
    ADD CONSTRAINT participantes_revision_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: participantes_revision participantes_revision_revision_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.participantes_revision
    ADD CONSTRAINT participantes_revision_revision_id_fkey FOREIGN KEY (revision_id) REFERENCES public.revisiones_direccion(id) ON DELETE CASCADE;


--
-- Name: participantes_revision participantes_revision_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.participantes_revision
    ADD CONSTRAINT participantes_revision_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: participantes_simulacro participantes_simulacro_simulacro_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.participantes_simulacro
    ADD CONSTRAINT participantes_simulacro_simulacro_id_fkey FOREIGN KEY (simulacro_id) REFERENCES public.simulacros(id) ON DELETE CASCADE;


--
-- Name: participantes_simulacro participantes_simulacro_trabajador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.participantes_simulacro
    ADD CONSTRAINT participantes_simulacro_trabajador_id_fkey FOREIGN KEY (trabajador_id) REFERENCES public.workers(id) ON DELETE CASCADE;


--
-- Name: payment_sources payment_sources_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_sources
    ADD CONSTRAINT payment_sources_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: payment_sources payment_sources_subscription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_sources
    ADD CONSTRAINT payment_sources_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id);


--
-- Name: payment_transactions payment_transactions_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: payment_transactions payment_transactions_payment_source_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_payment_source_id_fkey FOREIGN KEY (payment_source_id) REFERENCES public.payment_sources(id);


--
-- Name: payment_transactions payment_transactions_subscription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id);


--
-- Name: peligros_iperc peligros_iperc_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.peligros_iperc
    ADD CONSTRAINT peligros_iperc_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: peligros_iperc peligros_iperc_matriz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.peligros_iperc
    ADD CONSTRAINT peligros_iperc_matriz_id_fkey FOREIGN KEY (matriz_id) REFERENCES public.matrices_iperc(id) ON DELETE CASCADE;


--
-- Name: peligros_iperc peligros_iperc_responsable_implementacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.peligros_iperc
    ADD CONSTRAINT peligros_iperc_responsable_implementacion_id_fkey FOREIGN KEY (responsable_implementacion_id) REFERENCES public.users(id);


--
-- Name: peligros_trabajadores_asignacion peligros_trabajadores_asignacion_asignado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.peligros_trabajadores_asignacion
    ADD CONSTRAINT peligros_trabajadores_asignacion_asignado_por_fkey FOREIGN KEY (asignado_por) REFERENCES public.users(id);


--
-- Name: peligros_trabajadores_asignacion peligros_trabajadores_asignacion_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.peligros_trabajadores_asignacion
    ADD CONSTRAINT peligros_trabajadores_asignacion_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: peligros_trabajadores_asignacion peligros_trabajadores_asignacion_peligro_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.peligros_trabajadores_asignacion
    ADD CONSTRAINT peligros_trabajadores_asignacion_peligro_id_fkey FOREIGN KEY (peligro_id) REFERENCES public.peligros_iperc(id) ON DELETE CASCADE;


--
-- Name: pesv_audits pesv_audits_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pesv_audits
    ADD CONSTRAINT pesv_audits_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: plan_change_history plan_change_history_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_change_history
    ADD CONSTRAINT plan_change_history_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: plan_change_history plan_change_history_new_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_change_history
    ADD CONSTRAINT plan_change_history_new_plan_id_fkey FOREIGN KEY (new_plan_id) REFERENCES public.subscription_plans(id);


--
-- Name: plan_change_history plan_change_history_old_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_change_history
    ADD CONSTRAINT plan_change_history_old_plan_id_fkey FOREIGN KEY (old_plan_id) REFERENCES public.subscription_plans(id);


--
-- Name: plan_change_history plan_change_history_requested_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_change_history
    ADD CONSTRAINT plan_change_history_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES public.users(id);


--
-- Name: plan_change_history plan_change_history_subscription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_change_history
    ADD CONSTRAINT plan_change_history_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id);


--
-- Name: plan_change_history plan_change_history_wompi_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_change_history
    ADD CONSTRAINT plan_change_history_wompi_transaction_id_fkey FOREIGN KEY (wompi_transaction_id) REFERENCES public.payment_transactions(id);


--
-- Name: plan_comunicacion_sst plan_comunicacion_sst_aprobado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_comunicacion_sst
    ADD CONSTRAINT plan_comunicacion_sst_aprobado_por_fkey FOREIGN KEY (aprobado_por) REFERENCES public.users(id);


--
-- Name: plan_comunicacion_sst plan_comunicacion_sst_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_comunicacion_sst
    ADD CONSTRAINT plan_comunicacion_sst_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: plan_comunicacion_sst plan_comunicacion_sst_elaborado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_comunicacion_sst
    ADD CONSTRAINT plan_comunicacion_sst_elaborado_por_fkey FOREIGN KEY (elaborado_por) REFERENCES public.users(id);


--
-- Name: plan_comunicacion_sst plan_comunicacion_sst_responsable_comunicacion_contratista_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_comunicacion_sst
    ADD CONSTRAINT plan_comunicacion_sst_responsable_comunicacion_contratista_fkey FOREIGN KEY (responsable_comunicacion_contratistas) REFERENCES public.users(id);


--
-- Name: plan_comunicacion_sst plan_comunicacion_sst_responsable_comunicacion_externa_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_comunicacion_sst
    ADD CONSTRAINT plan_comunicacion_sst_responsable_comunicacion_externa_fkey FOREIGN KEY (responsable_comunicacion_externa) REFERENCES public.users(id);


--
-- Name: plan_comunicacion_sst plan_comunicacion_sst_responsable_comunicacion_interna_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_comunicacion_sst
    ADD CONSTRAINT plan_comunicacion_sst_responsable_comunicacion_interna_fkey FOREIGN KEY (responsable_comunicacion_interna) REFERENCES public.users(id);


--
-- Name: planes_accion_auditoria planes_accion_auditoria_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.planes_accion_auditoria
    ADD CONSTRAINT planes_accion_auditoria_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: planes_accion_auditoria planes_accion_auditoria_hallazgo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.planes_accion_auditoria
    ADD CONSTRAINT planes_accion_auditoria_hallazgo_id_fkey FOREIGN KEY (hallazgo_id) REFERENCES public.hallazgos_auditoria(id) ON DELETE CASCADE;


--
-- Name: planes_accion_auditoria planes_accion_auditoria_responsable_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.planes_accion_auditoria
    ADD CONSTRAINT planes_accion_auditoria_responsable_id_fkey FOREIGN KEY (responsable_id) REFERENCES public.users(id);


--
-- Name: planes_accion_auditoria planes_accion_auditoria_verificado_por_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.planes_accion_auditoria
    ADD CONSTRAINT planes_accion_auditoria_verificado_por_id_fkey FOREIGN KEY (verificado_por_id) REFERENCES public.users(id);


--
-- Name: planes_emergencia planes_emergencia_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.planes_emergencia
    ADD CONSTRAINT planes_emergencia_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: planes_emergencia planes_emergencia_responsable_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.planes_emergencia
    ADD CONSTRAINT planes_emergencia_responsable_id_fkey FOREIGN KEY (responsable_id) REFERENCES public.workers(id);


--
-- Name: planes_trabajo_anual planes_trabajo_anual_aprobado_por_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.planes_trabajo_anual
    ADD CONSTRAINT planes_trabajo_anual_aprobado_por_id_fkey FOREIGN KEY (aprobado_por_id) REFERENCES public.workers(id);


--
-- Name: planes_trabajo_anual planes_trabajo_anual_autorizado_por_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.planes_trabajo_anual
    ADD CONSTRAINT planes_trabajo_anual_autorizado_por_id_fkey FOREIGN KEY (autorizado_por_id) REFERENCES public.workers(id);


--
-- Name: planes_trabajo_anual planes_trabajo_anual_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.planes_trabajo_anual
    ADD CONSTRAINT planes_trabajo_anual_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: planes_trabajo_anual planes_trabajo_anual_elaborado_por_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.planes_trabajo_anual
    ADD CONSTRAINT planes_trabajo_anual_elaborado_por_id_fkey FOREIGN KEY (elaborado_por_id) REFERENCES public.workers(id);


--
-- Name: planes_trabajo_anual planes_trabajo_anual_matriz_iperc_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.planes_trabajo_anual
    ADD CONSTRAINT planes_trabajo_anual_matriz_iperc_id_fkey FOREIGN KEY (matriz_iperc_id) REFERENCES public.matrices_iperc(id);


--
-- Name: politicas_sst politicas_sst_aprobado_por_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.politicas_sst
    ADD CONSTRAINT politicas_sst_aprobado_por_id_fkey FOREIGN KEY (aprobado_por_id) REFERENCES public.workers(id);


--
-- Name: politicas_sst politicas_sst_autorizado_por_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.politicas_sst
    ADD CONSTRAINT politicas_sst_autorizado_por_id_fkey FOREIGN KEY (autorizado_por_id) REFERENCES public.workers(id);


--
-- Name: politicas_sst politicas_sst_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.politicas_sst
    ADD CONSTRAINT politicas_sst_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: politicas_sst politicas_sst_elaborado_por_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.politicas_sst
    ADD CONSTRAINT politicas_sst_elaborado_por_id_fkey FOREIGN KEY (elaborado_por_id) REFERENCES public.workers(id);


--
-- Name: preguntas_induccion preguntas_induccion_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preguntas_induccion
    ADD CONSTRAINT preguntas_induccion_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: preguntas_induccion preguntas_induccion_contenido_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preguntas_induccion
    ADD CONSTRAINT preguntas_induccion_contenido_id_fkey FOREIGN KEY (contenido_id) REFERENCES public.contenidos_induccion(id);


--
-- Name: preventive_measures preventive_measures_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preventive_measures
    ADD CONSTRAINT preventive_measures_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: pricing_plugin_invoices pricing_plugin_invoices_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pricing_plugin_invoices
    ADD CONSTRAINT pricing_plugin_invoices_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.companies(id);


--
-- Name: pricing_plugin_invoices pricing_plugin_invoices_subscription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pricing_plugin_invoices
    ADD CONSTRAINT pricing_plugin_invoices_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.pricing_plugin_subscriptions(id);


--
-- Name: pricing_plugin_subscriptions pricing_plugin_subscriptions_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pricing_plugin_subscriptions
    ADD CONSTRAINT pricing_plugin_subscriptions_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.companies(id);


--
-- Name: pricing_plugin_subscriptions pricing_plugin_subscriptions_pricing_config_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pricing_plugin_subscriptions
    ADD CONSTRAINT pricing_plugin_subscriptions_pricing_config_id_fkey FOREIGN KEY (pricing_config_id) REFERENCES public.pricing_config(id);


--
-- Name: program_training_attendance program_training_attendance_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.program_training_attendance
    ADD CONSTRAINT program_training_attendance_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: program_training_attendance program_training_attendance_training_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.program_training_attendance
    ADD CONSTRAINT program_training_attendance_training_id_fkey FOREIGN KEY (training_id) REFERENCES public.program_trainings(id) ON DELETE CASCADE;


--
-- Name: program_training_attendance program_training_attendance_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.program_training_attendance
    ADD CONSTRAINT program_training_attendance_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(id) ON DELETE CASCADE;


--
-- Name: program_trainings program_trainings_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.program_trainings
    ADD CONSTRAINT program_trainings_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: program_trainings program_trainings_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.program_trainings
    ADD CONSTRAINT program_trainings_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.training_programs(id) ON DELETE CASCADE;


--
-- Name: programas_capacitacion programas_capacitacion_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.programas_capacitacion
    ADD CONSTRAINT programas_capacitacion_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: promotion_prevention_activities promotion_prevention_activities_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotion_prevention_activities
    ADD CONSTRAINT promotion_prevention_activities_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: promotion_prevention_activities promotion_prevention_activities_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotion_prevention_activities
    ADD CONSTRAINT promotion_prevention_activities_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: promotion_prevention_activities promotion_prevention_activities_sve_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotion_prevention_activities
    ADD CONSTRAINT promotion_prevention_activities_sve_program_id_fkey FOREIGN KEY (sve_program_id) REFERENCES public.sve_programs(id) ON DELETE SET NULL;


--
-- Name: promotion_prevention_participants promotion_prevention_participants_activity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotion_prevention_participants
    ADD CONSTRAINT promotion_prevention_participants_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.promotion_prevention_activities(id) ON DELETE CASCADE;


--
-- Name: promotion_prevention_participants promotion_prevention_participants_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotion_prevention_participants
    ADD CONSTRAINT promotion_prevention_participants_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(id) ON DELETE SET NULL;


--
-- Name: proveedores_contratistas proveedores_contratistas_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proveedores_contratistas
    ADD CONSTRAINT proveedores_contratistas_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: provider_access_logs provider_access_logs_client_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_access_logs
    ADD CONSTRAINT provider_access_logs_client_company_id_fkey FOREIGN KEY (client_company_id) REFERENCES public.companies(id);


--
-- Name: provider_access_logs provider_access_logs_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_access_logs
    ADD CONSTRAINT provider_access_logs_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.users(id);


--
-- Name: puntos_encuentro puntos_encuentro_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.puntos_encuentro
    ADD CONSTRAINT puntos_encuentro_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: puntos_encuentro puntos_encuentro_plan_emergencia_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.puntos_encuentro
    ADD CONSTRAINT puntos_encuentro_plan_emergencia_id_fkey FOREIGN KEY (plan_emergencia_id) REFERENCES public.planes_emergencia(id) ON DELETE SET NULL;


--
-- Name: puntos_encuentro puntos_encuentro_responsable_punto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.puntos_encuentro
    ADD CONSTRAINT puntos_encuentro_responsable_punto_id_fkey FOREIGN KEY (responsable_punto_id) REFERENCES public.workers(id);


--
-- Name: recomendaciones_arl_autoridades recomendaciones_arl_autoridades_accidente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recomendaciones_arl_autoridades
    ADD CONSTRAINT recomendaciones_arl_autoridades_accidente_id_fkey FOREIGN KEY (accidente_id) REFERENCES public.accidents(id);


--
-- Name: recomendaciones_arl_autoridades recomendaciones_arl_autoridades_actualizado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recomendaciones_arl_autoridades
    ADD CONSTRAINT recomendaciones_arl_autoridades_actualizado_por_fkey FOREIGN KEY (actualizado_por) REFERENCES public.users(id);


--
-- Name: recomendaciones_arl_autoridades recomendaciones_arl_autoridades_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recomendaciones_arl_autoridades
    ADD CONSTRAINT recomendaciones_arl_autoridades_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: recomendaciones_arl_autoridades recomendaciones_arl_autoridades_creado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recomendaciones_arl_autoridades
    ADD CONSTRAINT recomendaciones_arl_autoridades_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES public.users(id);


--
-- Name: recursos_emergencia recursos_emergencia_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recursos_emergencia
    ADD CONSTRAINT recursos_emergencia_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: recursos_emergencia recursos_emergencia_plan_emergencia_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recursos_emergencia
    ADD CONSTRAINT recursos_emergencia_plan_emergencia_id_fkey FOREIGN KEY (plan_emergencia_id) REFERENCES public.planes_emergencia(id) ON DELETE SET NULL;


--
-- Name: recursos_emergencia recursos_emergencia_responsable_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recursos_emergencia
    ADD CONSTRAINT recursos_emergencia_responsable_id_fkey FOREIGN KEY (responsable_id) REFERENCES public.workers(id);


--
-- Name: registros_induccion registros_induccion_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registros_induccion
    ADD CONSTRAINT registros_induccion_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: registros_induccion registros_induccion_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registros_induccion
    ADD CONSTRAINT registros_induccion_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(id);


--
-- Name: reportes_trabajadores reportes_trabajadores_asignado_a_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reportes_trabajadores
    ADD CONSTRAINT reportes_trabajadores_asignado_a_fkey FOREIGN KEY (asignado_a) REFERENCES public.users(id);


--
-- Name: reportes_trabajadores reportes_trabajadores_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reportes_trabajadores
    ADD CONSTRAINT reportes_trabajadores_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: reportes_trabajadores reportes_trabajadores_reportado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reportes_trabajadores
    ADD CONSTRAINT reportes_trabajadores_reportado_por_fkey FOREIGN KEY (reportado_por) REFERENCES public.users(id);


--
-- Name: reportes_trabajadores reportes_trabajadores_respondido_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reportes_trabajadores
    ADD CONSTRAINT reportes_trabajadores_respondido_por_fkey FOREIGN KEY (respondido_por) REFERENCES public.users(id);


--
-- Name: reportes_trabajadores reportes_trabajadores_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reportes_trabajadores
    ADD CONSTRAINT reportes_trabajadores_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(id);


--
-- Name: resource_allocations resource_allocations_aprobado_por_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_allocations
    ADD CONSTRAINT resource_allocations_aprobado_por_id_fkey FOREIGN KEY (aprobado_por_id) REFERENCES public.workers(id);


--
-- Name: resource_allocations resource_allocations_autorizado_por_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_allocations
    ADD CONSTRAINT resource_allocations_autorizado_por_id_fkey FOREIGN KEY (autorizado_por_id) REFERENCES public.workers(id);


--
-- Name: resource_allocations resource_allocations_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_allocations
    ADD CONSTRAINT resource_allocations_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: resource_allocations resource_allocations_elaborado_por_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_allocations
    ADD CONSTRAINT resource_allocations_elaborado_por_id_fkey FOREIGN KEY (elaborado_por_id) REFERENCES public.workers(id);


--
-- Name: resource_allocations resource_allocations_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resource_allocations
    ADD CONSTRAINT resource_allocations_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(id);


--
-- Name: responsible_designations responsible_designations_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.responsible_designations
    ADD CONSTRAINT responsible_designations_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: responsible_designations responsible_designations_job_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.responsible_designations
    ADD CONSTRAINT responsible_designations_job_profile_id_fkey FOREIGN KEY (job_profile_id) REFERENCES public.job_profiles(id);


--
-- Name: responsible_designations responsible_designations_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.responsible_designations
    ADD CONSTRAINT responsible_designations_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(id);


--
-- Name: respuestas_criterios_proveedor respuestas_criterios_proveedor_criterio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.respuestas_criterios_proveedor
    ADD CONSTRAINT respuestas_criterios_proveedor_criterio_id_fkey FOREIGN KEY (criterio_id) REFERENCES public.criterios_evaluacion_proveedor(id);


--
-- Name: respuestas_criterios_proveedor respuestas_criterios_proveedor_evaluacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.respuestas_criterios_proveedor
    ADD CONSTRAINT respuestas_criterios_proveedor_evaluacion_id_fkey FOREIGN KEY (evaluacion_id) REFERENCES public.evaluaciones_proveedores(id) ON DELETE CASCADE;


--
-- Name: respuestas_estandares respuestas_estandares_estandar_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.respuestas_estandares
    ADD CONSTRAINT respuestas_estandares_estandar_id_fkey FOREIGN KEY (estandar_id) REFERENCES public.estandares_sst(id);


--
-- Name: respuestas_estandares respuestas_estandares_evaluacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.respuestas_estandares
    ADD CONSTRAINT respuestas_estandares_evaluacion_id_fkey FOREIGN KEY (evaluacion_id) REFERENCES public.evaluaciones_sst(id) ON DELETE CASCADE;


--
-- Name: revisiones_direccion revisiones_direccion_aprobado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revisiones_direccion
    ADD CONSTRAINT revisiones_direccion_aprobado_por_fkey FOREIGN KEY (aprobado_por) REFERENCES public.users(id);


--
-- Name: revisiones_direccion revisiones_direccion_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revisiones_direccion
    ADD CONSTRAINT revisiones_direccion_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: revisiones_direccion revisiones_direccion_creado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.revisiones_direccion
    ADD CONSTRAINT revisiones_direccion_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES public.users(id);


--
-- Name: road_incidents road_incidents_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.road_incidents
    ADD CONSTRAINT road_incidents_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: road_incidents road_incidents_driver_id_drivers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.road_incidents
    ADD CONSTRAINT road_incidents_driver_id_drivers_id_fk FOREIGN KEY (driver_id) REFERENCES public.drivers(id);


--
-- Name: road_incidents road_incidents_vehicle_id_vehicles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.road_incidents
    ADD CONSTRAINT road_incidents_vehicle_id_vehicles_id_fk FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id);


--
-- Name: road_safety_attendees road_safety_attendees_driver_id_drivers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.road_safety_attendees
    ADD CONSTRAINT road_safety_attendees_driver_id_drivers_id_fk FOREIGN KEY (driver_id) REFERENCES public.drivers(id) ON DELETE CASCADE;


--
-- Name: road_safety_attendees road_safety_attendees_training_id_road_safety_trainings_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.road_safety_attendees
    ADD CONSTRAINT road_safety_attendees_training_id_road_safety_trainings_id_fk FOREIGN KEY (training_id) REFERENCES public.road_safety_trainings(id) ON DELETE CASCADE;


--
-- Name: road_safety_trainings road_safety_trainings_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.road_safety_trainings
    ADD CONSTRAINT road_safety_trainings_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: rutas_evacuacion rutas_evacuacion_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rutas_evacuacion
    ADD CONSTRAINT rutas_evacuacion_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: rutas_evacuacion rutas_evacuacion_destino_zona_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rutas_evacuacion
    ADD CONSTRAINT rutas_evacuacion_destino_zona_id_fkey FOREIGN KEY (destino_zona_id) REFERENCES public.zonas_evacuacion(id);


--
-- Name: rutas_evacuacion rutas_evacuacion_plan_emergencia_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rutas_evacuacion
    ADD CONSTRAINT rutas_evacuacion_plan_emergencia_id_fkey FOREIGN KEY (plan_emergencia_id) REFERENCES public.planes_emergencia(id) ON DELETE SET NULL;


--
-- Name: seguimiento_recomendaciones seguimiento_recomendaciones_recomendacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seguimiento_recomendaciones
    ADD CONSTRAINT seguimiento_recomendaciones_recomendacion_id_fkey FOREIGN KEY (recomendacion_id) REFERENCES public.recomendaciones_arl_autoridades(id) ON DELETE CASCADE;


--
-- Name: seguimiento_recomendaciones seguimiento_recomendaciones_registrado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seguimiento_recomendaciones
    ADD CONSTRAINT seguimiento_recomendaciones_registrado_por_fkey FOREIGN KEY (registrado_por) REFERENCES public.users(id);


--
-- Name: seguimientos_cambios seguimientos_cambios_cambio_id_cambios_sst_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seguimientos_cambios
    ADD CONSTRAINT seguimientos_cambios_cambio_id_cambios_sst_id_fk FOREIGN KEY (cambio_id) REFERENCES public.cambios_sst(id) ON DELETE CASCADE;


--
-- Name: seguimientos_cambios seguimientos_cambios_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seguimientos_cambios
    ADD CONSTRAINT seguimientos_cambios_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: seguimientos_proveedores seguimientos_proveedores_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seguimientos_proveedores
    ADD CONSTRAINT seguimientos_proveedores_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: seguimientos_proveedores seguimientos_proveedores_proveedor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seguimientos_proveedores
    ADD CONSTRAINT seguimientos_proveedores_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES public.proveedores_contratistas(id) ON DELETE CASCADE;


--
-- Name: sesiones_induccion_virtual sesiones_induccion_virtual_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sesiones_induccion_virtual
    ADD CONSTRAINT sesiones_induccion_virtual_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: sesiones_induccion_virtual sesiones_induccion_virtual_registro_induccion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sesiones_induccion_virtual
    ADD CONSTRAINT sesiones_induccion_virtual_registro_induccion_id_fkey FOREIGN KEY (registro_induccion_id) REFERENCES public.registros_induccion(id);


--
-- Name: sesiones_induccion_virtual sesiones_induccion_virtual_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sesiones_induccion_virtual
    ADD CONSTRAINT sesiones_induccion_virtual_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(id);


--
-- Name: simulacros simulacros_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.simulacros
    ADD CONSTRAINT simulacros_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: simulacros simulacros_coordinador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.simulacros
    ADD CONSTRAINT simulacros_coordinador_id_fkey FOREIGN KEY (coordinador_id) REFERENCES public.workers(id);


--
-- Name: simulacros simulacros_plan_emergencia_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.simulacros
    ADD CONSTRAINT simulacros_plan_emergencia_id_fkey FOREIGN KEY (plan_emergencia_id) REFERENCES public.planes_emergencia(id) ON DELETE SET NULL;


--
-- Name: solicitudes_adquisicion solicitudes_adquisicion_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes_adquisicion
    ADD CONSTRAINT solicitudes_adquisicion_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: solicitudes_adquisicion solicitudes_adquisicion_proveedor_propuesto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes_adquisicion
    ADD CONSTRAINT solicitudes_adquisicion_proveedor_propuesto_id_fkey FOREIGN KEY (proveedor_propuesto_id) REFERENCES public.proveedores_contratistas(id);


--
-- Name: solicitudes_adquisicion solicitudes_adquisicion_recurso_financiero_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes_adquisicion
    ADD CONSTRAINT solicitudes_adquisicion_recurso_financiero_id_fkey FOREIGN KEY (recurso_financiero_id) REFERENCES public.resource_allocations(id);


--
-- Name: sst_document_access_log sst_document_access_log_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sst_document_access_log
    ADD CONSTRAINT sst_document_access_log_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.sst_documents(id);


--
-- Name: sst_document_access_log sst_document_access_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sst_document_access_log
    ADD CONSTRAINT sst_document_access_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: sst_document_alerts sst_document_alerts_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sst_document_alerts
    ADD CONSTRAINT sst_document_alerts_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.sst_documents(id);


--
-- Name: sst_document_versions sst_document_versions_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sst_document_versions
    ADD CONSTRAINT sst_document_versions_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: sst_document_versions sst_document_versions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sst_document_versions
    ADD CONSTRAINT sst_document_versions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: sst_document_versions sst_document_versions_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sst_document_versions
    ADD CONSTRAINT sst_document_versions_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.sst_documents(id);


--
-- Name: sst_documents sst_documents_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sst_documents
    ADD CONSTRAINT sst_documents_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: sst_documents sst_documents_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sst_documents
    ADD CONSTRAINT sst_documents_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: sst_documents sst_documents_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sst_documents
    ADD CONSTRAINT sst_documents_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: sst_documents sst_documents_prepared_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sst_documents
    ADD CONSTRAINT sst_documents_prepared_by_fkey FOREIGN KEY (prepared_by) REFERENCES public.users(id);


--
-- Name: sst_documents sst_documents_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sst_documents
    ADD CONSTRAINT sst_documents_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id);


--
-- Name: sst_documents sst_documents_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sst_documents
    ADD CONSTRAINT sst_documents_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: sst_evaluation_items sst_evaluation_items_evaluation_id_sst_evaluations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sst_evaluation_items
    ADD CONSTRAINT sst_evaluation_items_evaluation_id_sst_evaluations_id_fk FOREIGN KEY (evaluation_id) REFERENCES public.sst_evaluations(id) ON DELETE CASCADE;


--
-- Name: sst_evaluation_items sst_evaluation_items_item_id_sst_items_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sst_evaluation_items
    ADD CONSTRAINT sst_evaluation_items_item_id_sst_items_id_fk FOREIGN KEY (item_id) REFERENCES public.sst_items(id) ON DELETE CASCADE;


--
-- Name: sst_evaluations sst_evaluations_aprobado_por_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sst_evaluations
    ADD CONSTRAINT sst_evaluations_aprobado_por_id_fkey FOREIGN KEY (aprobado_por_id) REFERENCES public.workers(id);


--
-- Name: sst_evaluations sst_evaluations_autorizado_por_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sst_evaluations
    ADD CONSTRAINT sst_evaluations_autorizado_por_id_fkey FOREIGN KEY (autorizado_por_id) REFERENCES public.workers(id);


--
-- Name: sst_evaluations sst_evaluations_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sst_evaluations
    ADD CONSTRAINT sst_evaluations_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: sst_evaluations sst_evaluations_elaborado_por_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sst_evaluations
    ADD CONSTRAINT sst_evaluations_elaborado_por_id_fkey FOREIGN KEY (elaborado_por_id) REFERENCES public.workers(id);


--
-- Name: sst_evidence sst_evidence_evaluation_item_id_sst_evaluation_items_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sst_evidence
    ADD CONSTRAINT sst_evidence_evaluation_item_id_sst_evaluation_items_id_fk FOREIGN KEY (evaluation_item_id) REFERENCES public.sst_evaluation_items(id) ON DELETE CASCADE;


--
-- Name: sst_items sst_items_standard_id_sst_standards_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sst_items
    ADD CONSTRAINT sst_items_standard_id_sst_standards_id_fk FOREIGN KEY (standard_id) REFERENCES public.sst_standards(id) ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: subscriptions subscriptions_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id);


--
-- Name: support_access_events support_access_events_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_access_events
    ADD CONSTRAINT support_access_events_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id);


--
-- Name: support_access_events support_access_events_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_access_events
    ADD CONSTRAINT support_access_events_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.support_access_sessions(id);


--
-- Name: support_access_sessions support_access_sessions_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_access_sessions
    ADD CONSTRAINT support_access_sessions_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: support_access_sessions support_access_sessions_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_access_sessions
    ADD CONSTRAINT support_access_sessions_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: support_access_sessions support_access_sessions_related_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_access_sessions
    ADD CONSTRAINT support_access_sessions_related_ticket_id_fkey FOREIGN KEY (related_ticket_id) REFERENCES public.support_tickets(id);


--
-- Name: support_access_sessions support_access_sessions_support_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_access_sessions
    ADD CONSTRAINT support_access_sessions_support_user_id_fkey FOREIGN KEY (support_user_id) REFERENCES public.users(id);


--
-- Name: support_tickets support_tickets_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: support_tickets support_tickets_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: support_tickets support_tickets_resolved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES public.users(id);


--
-- Name: support_tickets support_tickets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: sve_cases sve_cases_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sve_cases
    ADD CONSTRAINT sve_cases_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: sve_cases sve_cases_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sve_cases
    ADD CONSTRAINT sve_cases_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.sve_programs(id) ON DELETE CASCADE;


--
-- Name: sve_programs sve_programs_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sve_programs
    ADD CONSTRAINT sve_programs_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: temas_revision temas_revision_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.temas_revision
    ADD CONSTRAINT temas_revision_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: temas_revision temas_revision_responsable_presentacion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.temas_revision
    ADD CONSTRAINT temas_revision_responsable_presentacion_fkey FOREIGN KEY (responsable_presentacion) REFERENCES public.users(id);


--
-- Name: temas_revision temas_revision_revision_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.temas_revision
    ADD CONSTRAINT temas_revision_revision_id_fkey FOREIGN KEY (revision_id) REFERENCES public.revisiones_direccion(id) ON DELETE CASCADE;


--
-- Name: ticket_responses ticket_responses_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_responses
    ADD CONSTRAINT ticket_responses_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.support_tickets(id);


--
-- Name: ticket_responses ticket_responses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_responses
    ADD CONSTRAINT ticket_responses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: ticket_status_history ticket_status_history_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_status_history
    ADD CONSTRAINT ticket_status_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(id);


--
-- Name: ticket_status_history ticket_status_history_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_status_history
    ADD CONSTRAINT ticket_status_history_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.support_tickets(id);


--
-- Name: trabajadores_alto_riesgo trabajadores_alto_riesgo_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trabajadores_alto_riesgo
    ADD CONSTRAINT trabajadores_alto_riesgo_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: trabajadores_alto_riesgo trabajadores_alto_riesgo_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trabajadores_alto_riesgo
    ADD CONSTRAINT trabajadores_alto_riesgo_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(id);


--
-- Name: training_attendees training_attendees_training_id_trainings_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_attendees
    ADD CONSTRAINT training_attendees_training_id_trainings_id_fk FOREIGN KEY (training_id) REFERENCES public.trainings(id) ON DELETE CASCADE;


--
-- Name: training_attendees training_attendees_worker_id_workers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_attendees
    ADD CONSTRAINT training_attendees_worker_id_workers_id_fk FOREIGN KEY (worker_id) REFERENCES public.workers(id) ON DELETE CASCADE;


--
-- Name: training_programs training_programs_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_programs
    ADD CONSTRAINT training_programs_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: trainings trainings_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trainings
    ADD CONSTRAINT trainings_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: users users_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: vehicle_inspections vehicle_inspections_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicle_inspections
    ADD CONSTRAINT vehicle_inspections_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: vehicle_inspections vehicle_inspections_driver_id_drivers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicle_inspections
    ADD CONSTRAINT vehicle_inspections_driver_id_drivers_id_fk FOREIGN KEY (driver_id) REFERENCES public.drivers(id);


--
-- Name: vehicle_inspections vehicle_inspections_vehicle_id_vehicles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicle_inspections
    ADD CONSTRAINT vehicle_inspections_vehicle_id_vehicles_id_fk FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id);


--
-- Name: vehicles vehicles_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: verificaciones_adquisicion verificaciones_adquisicion_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verificaciones_adquisicion
    ADD CONSTRAINT verificaciones_adquisicion_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: verificaciones_adquisicion verificaciones_adquisicion_solicitud_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verificaciones_adquisicion
    ADD CONSTRAINT verificaciones_adquisicion_solicitud_id_fkey FOREIGN KEY (solicitud_id) REFERENCES public.solicitudes_adquisicion(id) ON DELETE CASCADE;


--
-- Name: verificaciones_muestreo_sgss verificaciones_muestreo_sgss_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verificaciones_muestreo_sgss
    ADD CONSTRAINT verificaciones_muestreo_sgss_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: verificaciones_muestreo_sgss verificaciones_muestreo_sgss_verificado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verificaciones_muestreo_sgss
    ADD CONSTRAINT verificaciones_muestreo_sgss_verificado_por_fkey FOREIGN KEY (verificado_por) REFERENCES public.users(id);


--
-- Name: worker_portal_access_logs worker_portal_access_logs_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worker_portal_access_logs
    ADD CONSTRAINT worker_portal_access_logs_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: worker_portal_access_logs worker_portal_access_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worker_portal_access_logs
    ADD CONSTRAINT worker_portal_access_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: worker_portal_access_logs worker_portal_access_logs_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worker_portal_access_logs
    ADD CONSTRAINT worker_portal_access_logs_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: worker_portal_access_logs worker_portal_access_logs_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worker_portal_access_logs
    ADD CONSTRAINT worker_portal_access_logs_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(id) ON DELETE SET NULL;


--
-- Name: workers workers_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workers
    ADD CONSTRAINT workers_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: zonas_evacuacion zonas_evacuacion_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zonas_evacuacion
    ADD CONSTRAINT zonas_evacuacion_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: zonas_evacuacion zonas_evacuacion_plan_emergencia_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zonas_evacuacion
    ADD CONSTRAINT zonas_evacuacion_plan_emergencia_id_fkey FOREIGN KEY (plan_emergencia_id) REFERENCES public.planes_emergencia(id) ON DELETE SET NULL;


--
-- Name: zonas_evacuacion zonas_evacuacion_responsable_zona_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zonas_evacuacion
    ADD CONSTRAINT zonas_evacuacion_responsable_zona_id_fkey FOREIGN KEY (responsable_zona_id) REFERENCES public.workers(id);


--
-- Name: prices prices_product_fkey; Type: FK CONSTRAINT; Schema: stripe; Owner: -
--

ALTER TABLE ONLY stripe.prices
    ADD CONSTRAINT prices_product_fkey FOREIGN KEY (product) REFERENCES stripe.products(id);


--
-- PostgreSQL database dump complete
--

\unrestrict ufQitjJWK8VSeqr7OaPIvXWxdSPVW181aJbVhzt1Manrdikil8jiHBqOQqaHv2t

