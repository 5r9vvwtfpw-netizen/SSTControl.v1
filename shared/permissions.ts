import type { UserRole } from "./schema";

// Definición de permisos del sistema SST
export type Permission =
  // Gestión de empresa
  | "companies:view"
  | "companies:create"
  | "companies:edit"
  | "companies:delete"
  
  // Gestión de usuarios
  | "users:view"
  | "users:create"
  | "users:edit"
  | "users:delete"
  | "users:manage_roles"
  
  // Gestión de trabajadores
  | "workers:view"
  | "workers:view_self"
  | "workers:create"
  | "workers:edit"
  | "workers:delete"
  
  // Accidentes e incidentes
  | "accidents:view"
  | "accidents:view_self"
  | "accidents:create"
  | "accidents:edit"
  | "accidents:delete"
  
  // Capacitaciones
  | "trainings:view"
  | "trainings:view_self"
  | "trainings:create"
  | "trainings:edit"
  | "trainings:delete"
  
  // Inspecciones
  | "inspections:view"
  | "inspections:view_self"
  | "inspections:create"
  | "inspections:edit"
  | "inspections:delete"
  
  // Medidas preventivas
  | "measures:view"
  | "measures:create"
  | "measures:edit"
  | "measures:delete"
  
  // Enfermedades ocupacionales
  | "diseases:view"
  | "diseases:create"
  | "diseases:edit"
  | "diseases:delete"
  
  // Salud ocupacional (PCA, audiometrías, etc.)
  | "health:view"
  | "health:create"
  | "health:edit"
  | "health:delete"
  
  // Evaluaciones SST
  | "sst_evaluations:view"
  | "sst_evaluations:create"
  | "sst_evaluations:edit"
  | "sst_evaluations:delete"
  
  // Estándares SST
  | "sst_standards:view"
  | "sst_standards:create"
  | "sst_standards:edit"
  | "sst_standards:delete"
  
  // Items SST
  | "sst_items:view"
  | "sst_items:create"
  | "sst_items:edit"
  | "sst_items:delete"
  
  // PESV - Vehículos
  | "vehicles:view"
  | "vehicles:create"
  | "vehicles:edit"
  | "vehicles:delete"
  
  // PESV - Conductores
  | "drivers:view"
  | "drivers:create"
  | "drivers:edit"
  | "drivers:delete"
  
  // PESV - Inspecciones vehículos
  | "vehicle_inspections:view"
  | "vehicle_inspections:create"
  | "vehicle_inspections:edit"
  | "vehicle_inspections:delete"
  
  // PESV - Incidentes viales
  | "road_incidents:view"
  | "road_incidents:create"
  | "road_incidents:edit"
  | "road_incidents:delete"
  
  // PESV - Capacitaciones viales
  | "road_trainings:view"
  | "road_trainings:create"
  | "road_trainings:edit"
  | "road_trainings:delete"
  
  // PESV - Capacitaciones de seguridad vial (alias)
  | "road_safety_trainings:view"
  | "road_safety_trainings:create"
  | "road_safety_trainings:edit"
  | "road_safety_trainings:delete"
  
  // PESV - Auditorías
  | "pesv_audits:view"
  | "pesv_audits:create"
  | "pesv_audits:edit"
  | "pesv_audits:delete"
  
  // Perfiles de cargo
  | "job_profiles:view"
  | "job_profiles:view_self"
  | "job_profiles:create"
  | "job_profiles:edit"
  | "job_profiles:delete"
  
  // Contratos
  | "contracts:view"
  | "contracts:view_self"
  | "contracts:create"
  | "contracts:edit"
  | "contracts:delete"
  
  // Exámenes médicos ocupacionales
  | "medical_exams:view"
  | "medical_exams:view_self"
  | "medical_exams:create"
  | "medical_exams:edit"
  | "medical_exams:delete"
  
  // Reportes e informes
  | "reports:view"
  | "reports:generate"
  
  // Políticas SST
  | "sst_management:view"
  | "sst_management:create"
  | "sst_management:edit"
  | "sst_management:delete"
  
  // Plan de Comunicación SST
  | "comunicacion_plan:view"
  | "comunicacion_plan:create"
  | "comunicacion_plan:edit"
  
  // Comunicaciones SST
  | "comunicaciones_sst:view"
  | "comunicaciones_sst:create"
  | "comunicaciones_sst:send"
  | "comunicaciones_sst:edit"
  | "comunicaciones_sst:delete"
  
  // Reportes de trabajadores (buzón de sugerencias/peligros)
  | "reportes_trabajadores:view"
  | "reportes_trabajadores:create"
  | "reportes_trabajadores:manage"
  | "reportes_trabajadores:respond"
  
  // Portal de empleados
  | "portal_empleados:access"
  
  // Portal de licenciados SST
  | "portal_licenciado:access"
  
  // Dashboard
  | "dashboard:view"
  
  // Document Management (Conservación de Documentos - Estándar 2.5.1)
  | "documents:view"
  | "documents:view_self"
  | "documents:create"
  | "documents:edit"
  | "documents:delete"
  
  // Planes de Emergencia
  | "emergency_plans:view"
  | "emergency_plans:view_self"
  | "emergency_plans:create"
  | "emergency_plans:edit"
  | "emergency_plans:delete"
  
  // Consent Records (GDPR)
  | "consent_records:view"
  | "consent_records:view_self"
  | "consent_records:create"
  | "consent_records:edit"
  | "consent_records:delete"
  
  // Salud Ocupacional (datos sensibles - Ley 1581/2012)
  | "health_records:view"
  | "health_records:view_self"
  | "health_records:create"
  | "health_records:edit"
  | "health_records:delete"
  
  // Incapacidades
  | "incapacidades:view"
  | "incapacidades:view_self"
  | "incapacidades:create"
  | "incapacidades:edit"
  | "incapacidades:delete"
  
  // Reportes de Seguridad Social (EPS, ARL, AFP)
  | "social_security_reports:view"
  | "social_security_reports:generate"
  
  // Firma y aprobación de documentos SST (LSO)
  | "sst_documents:sign"
  | "sst_documents:approve"
  | "policies:sign"
  | "policies:approve"
  
  // Gestión de profesionales licenciados en salud ocupacional
  | "licensed_professionals:view"
  | "licensed_professionals:create"
  | "licensed_professionals:edit"
  | "licensed_professionals:delete"
  | "licensed_professionals:assign"
  | "licensed_professionals:edit_self"
  
  // Suscripciones de la empresa (solo superusuario del cliente)
  | "subscriptions:view"
  | "subscriptions:manage"
  
  // Administración global del sistema (solo superadmin)
  | "billing:global_view"
  | "billing:global_manage"
  | "companies:global_view"
  | "companies:global_manage"
  | "system:configure";

// Matriz de permisos por rol
export const rolePermissions: Record<UserRole, Permission[]> = {
  // SuperAdmin - Rol INTERNO del proveedor SaaS (acceso global a todas las empresas y facturación)
  superadmin: [
    "companies:view",
    "companies:create",
    "companies:edit",
    "companies:delete",
    "users:view",
    "users:create",
    "users:edit",
    "users:delete",
    "users:manage_roles",
    "workers:view",
    "workers:create",
    "workers:edit",
    "workers:delete",
    "accidents:view",
    "accidents:create",
    "accidents:edit",
    "accidents:delete",
    "trainings:view",
    "trainings:create",
    "trainings:edit",
    "trainings:delete",
    "inspections:view",
    "inspections:create",
    "inspections:edit",
    "inspections:delete",
    "measures:view",
    "measures:create",
    "measures:edit",
    "measures:delete",
    "diseases:view",
    "diseases:create",
    "diseases:edit",
    "diseases:delete",
    "health:view",
    "health:create",
    "health:edit",
    "health:delete",
    "sst_evaluations:view",
    "sst_evaluations:create",
    "sst_evaluations:edit",
    "sst_evaluations:delete",
    "sst_standards:view",
    "sst_standards:create",
    "sst_standards:edit",
    "sst_standards:delete",
    "sst_items:view",
    "sst_items:create",
    "sst_items:edit",
    "sst_items:delete",
    "vehicles:view",
    "vehicles:create",
    "vehicles:edit",
    "vehicles:delete",
    "drivers:view",
    "drivers:create",
    "drivers:edit",
    "drivers:delete",
    "vehicle_inspections:view",
    "vehicle_inspections:create",
    "vehicle_inspections:edit",
    "vehicle_inspections:delete",
    "road_incidents:view",
    "road_incidents:create",
    "road_incidents:edit",
    "road_incidents:delete",
    "road_trainings:view",
    "road_trainings:create",
    "road_trainings:edit",
    "road_trainings:delete",
    "road_safety_trainings:view",
    "road_safety_trainings:create",
    "road_safety_trainings:edit",
    "road_safety_trainings:delete",
    "pesv_audits:view",
    "pesv_audits:create",
    "pesv_audits:edit",
    "pesv_audits:delete",
    "job_profiles:view",
    "job_profiles:create",
    "job_profiles:edit",
    "job_profiles:delete",
    "contracts:view",
    "contracts:create",
    "contracts:edit",
    "contracts:delete",
    "medical_exams:view",
    "medical_exams:create",
    "medical_exams:edit",
    "medical_exams:delete",
    "sst_management:view",
    "sst_management:create",
    "sst_management:edit",
    "sst_management:delete",
    "comunicacion_plan:view",
    "comunicacion_plan:create",
    "comunicacion_plan:edit",
    "comunicaciones_sst:view",
    "comunicaciones_sst:create",
    "comunicaciones_sst:send",
    "comunicaciones_sst:edit",
    "comunicaciones_sst:delete",
    "reportes_trabajadores:view",
    "reportes_trabajadores:create",
    "reportes_trabajadores:manage",
    "reportes_trabajadores:respond",
    "portal_empleados:access",
    "reports:view",
    "reports:generate",
    "dashboard:view",
    "documents:view",
    "documents:create",
    "documents:edit",
    "documents:delete",
    "emergency_plans:view",
    "emergency_plans:create",
    "emergency_plans:edit",
    "emergency_plans:delete",
    "consent_records:view",
    "consent_records:create",
    "consent_records:edit",
    "consent_records:delete",
    "health_records:view",
    "health_records:create",
    "health_records:edit",
    "health_records:delete",
    "incapacidades:view",
    "incapacidades:create",
    "incapacidades:edit",
    "incapacidades:delete",
    "social_security_reports:view",
    "social_security_reports:generate",
    "sst_documents:sign",
    "sst_documents:approve",
    "policies:sign",
    "policies:approve",
    "licensed_professionals:view",
    "licensed_professionals:create",
    "licensed_professionals:edit",
    "licensed_professionals:delete",
    "licensed_professionals:assign",
    "subscriptions:view",
    "subscriptions:manage",
    "billing:global_view",
    "billing:global_manage",
    "companies:global_view",
    "companies:global_manage",
    "system:configure",
  ],

  // Super Usuario - Acceso completo a SU empresa únicamente (rol CLIENTE)
  superusuario: [
    "companies:view",
    "companies:create",
    "companies:edit",
    "companies:delete",
    "users:view",
    "users:create",
    "users:edit",
    "users:delete",
    "users:manage_roles",
    "workers:view",
    "workers:create",
    "workers:edit",
    "workers:delete",
    "accidents:view",
    "accidents:create",
    "accidents:edit",
    "accidents:delete",
    "trainings:view",
    "trainings:create",
    "trainings:edit",
    "trainings:delete",
    "inspections:view",
    "inspections:create",
    "inspections:edit",
    "inspections:delete",
    "measures:view",
    "measures:create",
    "measures:edit",
    "measures:delete",
    "diseases:view",
    "diseases:create",
    "diseases:edit",
    "diseases:delete",
    "health:view",
    "health:create",
    "health:edit",
    "health:delete",
    "sst_evaluations:view",
    "sst_evaluations:create",
    "sst_evaluations:edit",
    "sst_evaluations:delete",
    "sst_standards:view",
    "sst_standards:create",
    "sst_standards:edit",
    "sst_standards:delete",
    "sst_items:view",
    "sst_items:create",
    "sst_items:edit",
    "sst_items:delete",
    "vehicles:view",
    "vehicles:create",
    "vehicles:edit",
    "vehicles:delete",
    "drivers:view",
    "drivers:create",
    "drivers:edit",
    "drivers:delete",
    "vehicle_inspections:view",
    "vehicle_inspections:create",
    "vehicle_inspections:edit",
    "vehicle_inspections:delete",
    "road_incidents:view",
    "road_incidents:create",
    "road_incidents:edit",
    "road_incidents:delete",
    "road_trainings:view",
    "road_trainings:create",
    "road_trainings:edit",
    "road_trainings:delete",
    "road_safety_trainings:view",
    "road_safety_trainings:create",
    "road_safety_trainings:edit",
    "road_safety_trainings:delete",
    "pesv_audits:view",
    "pesv_audits:create",
    "pesv_audits:edit",
    "pesv_audits:delete",
    "job_profiles:view",
    "job_profiles:create",
    "job_profiles:edit",
    "job_profiles:delete",
    "contracts:view",
    "contracts:create",
    "contracts:edit",
    "contracts:delete",
    "medical_exams:view",
    "medical_exams:create",
    "medical_exams:edit",
    "medical_exams:delete",
    "sst_management:view",
    "sst_management:create",
    "sst_management:edit",
    "sst_management:delete",
    "comunicacion_plan:view",
    "comunicacion_plan:create",
    "comunicacion_plan:edit",
    "comunicaciones_sst:view",
    "comunicaciones_sst:create",
    "comunicaciones_sst:send",
    "comunicaciones_sst:edit",
    "comunicaciones_sst:delete",
    "reportes_trabajadores:view",
    "reportes_trabajadores:create",
    "reportes_trabajadores:manage",
    "reportes_trabajadores:respond",
    "portal_empleados:access",
    "reports:view",
    "reports:generate",
    "dashboard:view",
    "documents:view",
    "documents:create",
    "documents:edit",
    "documents:delete",
    "emergency_plans:view",
    "emergency_plans:create",
    "emergency_plans:edit",
    "emergency_plans:delete",
    "consent_records:view",
    "consent_records:create",
    "consent_records:edit",
    "consent_records:delete",
    "health_records:view",
    "health_records:create",
    "health_records:edit",
    "health_records:delete",
    "incapacidades:view",
    "incapacidades:create",
    "incapacidades:edit",
    "incapacidades:delete",
    "social_security_reports:view",
    "social_security_reports:generate",
    "sst_documents:sign",
    "sst_documents:approve",
    "policies:sign",
    "policies:approve",
    // Solo superusuario puede ver/gestionar suscripciones de su empresa
    "subscriptions:view",
    "subscriptions:manage",
  ],

  // Admin - Acceso completo
  admin: [
    "companies:view",
    "companies:create",
    "companies:edit",
    "companies:delete",
    "users:view",
    "users:create",
    "users:edit",
    "users:delete",
    "users:manage_roles",
    "workers:view",
    "workers:create",
    "workers:edit",
    "workers:delete",
    "accidents:view",
    "accidents:create",
    "accidents:edit",
    "accidents:delete",
    "trainings:view",
    "trainings:create",
    "trainings:edit",
    "trainings:delete",
    "inspections:view",
    "inspections:create",
    "inspections:edit",
    "inspections:delete",
    "measures:view",
    "measures:create",
    "measures:edit",
    "measures:delete",
    "diseases:view",
    "diseases:create",
    "diseases:edit",
    "diseases:delete",
    "health:view",
    "health:create",
    "health:edit",
    "health:delete",
    "sst_evaluations:view",
    "sst_evaluations:create",
    "sst_evaluations:edit",
    "sst_evaluations:delete",
    "sst_standards:view",
    "sst_standards:create",
    "sst_standards:edit",
    "sst_standards:delete",
    "sst_items:view",
    "sst_items:create",
    "sst_items:edit",
    "sst_items:delete",
    "vehicles:view",
    "vehicles:create",
    "vehicles:edit",
    "vehicles:delete",
    "drivers:view",
    "drivers:create",
    "drivers:edit",
    "drivers:delete",
    "vehicle_inspections:view",
    "vehicle_inspections:create",
    "vehicle_inspections:edit",
    "vehicle_inspections:delete",
    "road_incidents:view",
    "road_incidents:create",
    "road_incidents:edit",
    "road_incidents:delete",
    "road_trainings:view",
    "road_trainings:create",
    "road_trainings:edit",
    "road_trainings:delete",
    "road_safety_trainings:view",
    "road_safety_trainings:create",
    "road_safety_trainings:edit",
    "road_safety_trainings:delete",
    "pesv_audits:view",
    "pesv_audits:create",
    "pesv_audits:edit",
    "pesv_audits:delete",
    "job_profiles:view",
    "job_profiles:create",
    "job_profiles:edit",
    "job_profiles:delete",
    "contracts:view",
    "contracts:create",
    "contracts:edit",
    "contracts:delete",
    "medical_exams:view",
    "medical_exams:create",
    "medical_exams:edit",
    "medical_exams:delete",
    "sst_management:view",
    "sst_management:create",
    "sst_management:edit",
    "sst_management:delete",
    "comunicacion_plan:view",
    "comunicacion_plan:create",
    "comunicacion_plan:edit",
    "comunicaciones_sst:view",
    "comunicaciones_sst:create",
    "comunicaciones_sst:send",
    "comunicaciones_sst:edit",
    "comunicaciones_sst:delete",
    "reportes_trabajadores:view",
    "reportes_trabajadores:create",
    "reportes_trabajadores:manage",
    "reportes_trabajadores:respond",
    "portal_empleados:access",
    "reports:view",
    "reports:generate",
    "dashboard:view",
    "documents:view",
    "documents:create",
    "documents:edit",
    "documents:delete",
    "emergency_plans:view",
    "emergency_plans:create",
    "emergency_plans:edit",
    "emergency_plans:delete",
    "consent_records:view",
    "consent_records:create",
    "consent_records:edit",
    "consent_records:delete",
  ],

  // Responsable SST - Dueño de suscripción, gestiona su empresa y todo el SST
  // Similar a admin pero limitado a SU empresa (no puede crear otras empresas ni gestionar roles admin)
  // NOTA: No tiene acceso a datos médicos detallados - usar coordinador_salud para datos sensibles
  responsable_sst: [
    "companies:view",
    "companies:create",
    "companies:edit",
    "users:view",
    "users:create",
    "users:edit",
    "workers:view",
    "workers:create",
    "workers:edit",
    "workers:delete",
    "accidents:view",
    "accidents:create",
    "accidents:edit",
    "accidents:delete",
    "trainings:view",
    "trainings:create",
    "trainings:edit",
    "trainings:delete",
    "inspections:view",
    "inspections:create",
    "inspections:edit",
    "inspections:delete",
    "measures:view",
    "measures:create",
    "measures:edit",
    "measures:delete",
    "diseases:view",
    "diseases:create",
    "diseases:edit",
    "diseases:delete",
    "health:view",
    "health:create",
    "health:edit",
    "health:delete",
    "sst_evaluations:view",
    "sst_evaluations:create",
    "sst_evaluations:edit",
    "sst_evaluations:delete",
    "sst_standards:view",
    "sst_standards:create",
    "sst_standards:edit",
    "sst_standards:delete",
    "sst_items:view",
    "sst_items:create",
    "sst_items:edit",
    "sst_items:delete",
    "vehicles:view",
    "vehicles:create",
    "vehicles:edit",
    "vehicles:delete",
    "drivers:view",
    "drivers:create",
    "drivers:edit",
    "drivers:delete",
    "vehicle_inspections:view",
    "vehicle_inspections:create",
    "vehicle_inspections:edit",
    "vehicle_inspections:delete",
    "road_incidents:view",
    "road_incidents:create",
    "road_incidents:edit",
    "road_incidents:delete",
    "road_trainings:view",
    "road_trainings:create",
    "road_trainings:edit",
    "road_trainings:delete",
    "road_safety_trainings:view",
    "road_safety_trainings:create",
    "road_safety_trainings:edit",
    "road_safety_trainings:delete",
    "pesv_audits:view",
    "pesv_audits:create",
    "pesv_audits:edit",
    "pesv_audits:delete",
    "job_profiles:view",
    "job_profiles:create",
    "job_profiles:edit",
    "job_profiles:delete",
    "contracts:view",
    "contracts:create",
    "contracts:edit",
    "contracts:delete",
    "sst_management:view",
    "sst_management:create",
    "sst_management:edit",
    "sst_management:delete",
    "comunicacion_plan:view",
    "comunicacion_plan:create",
    "comunicacion_plan:edit",
    "comunicaciones_sst:view",
    "comunicaciones_sst:create",
    "comunicaciones_sst:send",
    "comunicaciones_sst:edit",
    "comunicaciones_sst:delete",
    "reportes_trabajadores:view",
    "reportes_trabajadores:create",
    "reportes_trabajadores:manage",
    "reportes_trabajadores:respond",
    "portal_empleados:access",
    "reports:view",
    "reports:generate",
    "dashboard:view",
    "documents:view",
    "documents:create",
    "documents:edit",
    "documents:delete",
    "emergency_plans:view",
    "emergency_plans:create",
    "emergency_plans:edit",
    "emergency_plans:delete",
    "consent_records:view",
    "consent_records:create",
    "consent_records:edit",
    "consent_records:delete",
  ],

  // Coordinador de Salud Ocupacional - Acceso a datos médicos sensibles
  coordinador_salud: [
    "companies:view",
    "workers:view",
    "accidents:view",
    "accidents:create",
    "accidents:edit",
    "trainings:view",
    "diseases:view",
    "diseases:create",
    "diseases:edit",
    "diseases:delete",
    "medical_exams:view",
    "medical_exams:create",
    "medical_exams:edit",
    "medical_exams:delete",
    "health_records:view",
    "health_records:create",
    "health_records:edit",
    "health_records:delete",
    "incapacidades:view",
    "incapacidades:create",
    "incapacidades:edit",
    "incapacidades:delete",
    "social_security_reports:view",
    "social_security_reports:generate",
    "reports:view",
    "reports:generate",
    "job_profiles:view",
    "contracts:view",
    "dashboard:view",
    "portal_empleados:access",
    "sst_management:view",
    "consent_records:view",
  ],

  // LSO - Licenciado en Salud Ocupacional - Revisa y firma documentos SST según normatividad colombiana
  lso: [
    "companies:view",
    "workers:view",
    "accidents:view",
    "trainings:view",
    "inspections:view",
    "diseases:view",
    "medical_exams:view",
    "health_records:view",
    "sst_evaluations:view",
    "sst_evaluations:create",
    "sst_evaluations:edit",
    "sst_standards:view",
    "sst_standards:create",
    "sst_standards:edit",
    "sst_items:view",
    "sst_items:create",
    "sst_items:edit",
    "reports:view",
    "reports:generate",
    "sst_management:view",
    "sst_management:create",
    "sst_management:edit",
    "job_profiles:view",
    "contracts:view",
    "dashboard:view",
    "documents:view",
    "emergency_plans:view",
    "vehicles:view",
    "drivers:view",
    "pesv_audits:view",
    "pesv_audits:create",
    "pesv_audits:edit",
    "sst_documents:sign",
    "sst_documents:approve",
    "policies:sign",
    "policies:approve",
    "consent_records:view",
    "licensed_professionals:view",
    "licensed_professionals:edit_self",
    "portal_licenciado:access",
  ],

  // Coordinador SST - Gestión SST completa, PESV, auditorías
  coordinador_sst: [
    "workers:view",
    "accidents:view",
    "accidents:create",
    "accidents:edit",
    "trainings:view",
    "trainings:create",
    "trainings:edit",
    "trainings:delete",
    "inspections:view",
    "inspections:create",
    "inspections:edit",
    "inspections:delete",
    "measures:view",
    "measures:create",
    "measures:edit",
    "measures:delete",
    "diseases:view",
    "diseases:create",
    "diseases:edit",
    "diseases:delete",
    "health:view",
    "health:create",
    "health:edit",
    "health:delete",
    "sst_evaluations:view",
    "sst_evaluations:create",
    "sst_evaluations:edit",
    "sst_standards:view",
    "sst_standards:create",
    "sst_standards:edit",
    "sst_items:view",
    "sst_items:create",
    "sst_items:edit",
    "vehicles:view",
    "vehicles:create",
    "vehicles:edit",
    "drivers:view",
    "drivers:create",
    "drivers:edit",
    "vehicle_inspections:view",
    "vehicle_inspections:create",
    "vehicle_inspections:edit",
    "road_incidents:view",
    "road_incidents:create",
    "road_incidents:edit",
    "road_trainings:view",
    "road_trainings:create",
    "road_trainings:edit",
    "road_trainings:delete",
    "road_safety_trainings:view",
    "road_safety_trainings:create",
    "road_safety_trainings:edit",
    "road_safety_trainings:delete",
    "pesv_audits:view",
    "pesv_audits:create",
    "pesv_audits:edit",
    "job_profiles:view",
    "medical_exams:view",
    "medical_exams:create",
    "medical_exams:edit",
    "sst_management:view",
    "sst_management:create",
    "sst_management:edit",
    "comunicacion_plan:view",
    "comunicacion_plan:create",
    "comunicacion_plan:edit",
    "comunicaciones_sst:view",
    "comunicaciones_sst:create",
    "comunicaciones_sst:send",
    "comunicaciones_sst:edit",
    "comunicaciones_sst:delete",
    "reportes_trabajadores:view",
    "reportes_trabajadores:create",
    "reportes_trabajadores:manage",
    "reportes_trabajadores:respond",
    "portal_empleados:access",
    "reports:view",
    "reports:generate",
    "dashboard:view",
    "documents:view",
    "documents:create",
    "documents:edit",
  ],

  // Coordinador RRHH - Gestión trabajadores, capacitaciones, reportes, contratos
  coordinador_rrhh: [
    "workers:view",
    "workers:create",
    "workers:edit",
    "accidents:view",
    "trainings:view",
    "trainings:create",
    "trainings:edit",
    "trainings:delete",
    "inspections:view",
    "measures:view",
    "diseases:view",
    "diseases:create",
    "diseases:edit",
    "job_profiles:view",
    "job_profiles:create",
    "job_profiles:edit",
    "contracts:view",
    "contracts:create",
    "contracts:edit",
    "medical_exams:view",
    "medical_exams:create",
    "medical_exams:edit",
    "comunicaciones_sst:view",
    "reportes_trabajadores:view",
    "reportes_trabajadores:create",
    "portal_empleados:access",
    "reports:view",
    "reports:generate",
    "dashboard:view",
    "documents:view",
    "documents:view_self",
  ],

  // Jefe Personal - Consulta amplia, reportes básicos
  jefe_personal: [
    "workers:view",
    "accidents:view",
    "trainings:view",
    "inspections:view",
    "measures:view",
    "diseases:view",
    "sst_evaluations:view",
    "vehicles:view",
    "drivers:view",
    "vehicle_inspections:view",
    "road_incidents:view",
    "road_trainings:view",
    "pesv_audits:view",
    "job_profiles:view",
    "contracts:view",
    "medical_exams:view",
    "comunicaciones_sst:view",
    "reportes_trabajadores:view",
    "portal_empleados:access",
    "reports:view",
    "dashboard:view",
  ],

  // Supervisor - Inspecciones, medidas preventivas en su área
  supervisor: [
    "workers:view",
    "accidents:view",
    "accidents:create",
    "trainings:view",
    "inspections:view",
    "inspections:create",
    "inspections:edit",
    "measures:view",
    "measures:create",
    "measures:edit",
    "diseases:view",
    "vehicle_inspections:view",
    "vehicle_inspections:create",
    "road_incidents:view",
    "job_profiles:view",
    "comunicaciones_sst:view",
    "reportes_trabajadores:create",
    "portal_empleados:access",
    "dashboard:view",
  ],

  // Vigía SST - Para empresas <10 trabajadores (Decreto 1072/2015, Res. 2013/1986)
  // Cumple funciones similares al COPASST pero como una sola persona
  vigia_sst: [
    "workers:view",
    "accidents:view",
    "accidents:create",
    "accidents:edit",
    "trainings:view",
    "trainings:create",
    "inspections:view",
    "inspections:create",
    "inspections:edit",
    "measures:view",
    "measures:create",
    "measures:edit",
    "diseases:view",
    "sst_evaluations:view",
    "job_profiles:view",
    "contracts:view",
    "medical_exams:view",
    "comunicaciones_sst:view",
    "comunicaciones_sst:create",
    "reportes_trabajadores:view",
    "reportes_trabajadores:respond",
    "portal_empleados:access",
    "reports:view",
    "dashboard:view",
  ],

  // Auditor Interno SG-SST - Auditorías según ISO 45001 y Decreto 1072/2015
  auditor_interno: [
    "workers:view",
    "accidents:view",
    "trainings:view",
    "inspections:view",
    "measures:view",
    "diseases:view",
    "sst_evaluations:view",
    "sst_standards:view",
    "sst_items:view",
    "vehicles:view",
    "drivers:view",
    "vehicle_inspections:view",
    "road_incidents:view",
    "road_trainings:view",
    "pesv_audits:view",
    "pesv_audits:create",
    "pesv_audits:edit",
    "job_profiles:view",
    "contracts:view",
    "medical_exams:view",
    "comunicaciones_sst:view",
    "portal_empleados:access",
    "reports:view",
    "dashboard:view",
    "sst_evaluations:create",
    "sst_evaluations:edit",
  ],

  // Técnico Mecánico - Solo mantenimiento vehicular PESV (H05)
  tecnico_mecanico: [
    "vehicles:view",
    "vehicles:create",
    "vehicles:edit",
    "vehicles:delete",
  ],

  // Trabajador - Solo consulta su información personal (no puede crear/editar/eliminar en Planear/Hacer)
  trabajador: [
    "workers:view_self",
    "accidents:view_self",
    "trainings:view_self",
    "inspections:view_self",
    "contracts:view_self",
    "medical_exams:view_self",
    "job_profiles:view_self",
    "reportes_trabajadores:create",
    "portal_empleados:access",
  ],

  // Soporte - Personal de soporte técnico con acceso limitado para resolver incidencias
  soporte: [
    "dashboard:view",
  ],
};

// Función para verificar si un rol tiene un permiso específico
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

// Función para verificar si un rol tiene al menos uno de varios permisos
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(role, permission));
}

// Función para verificar si un rol tiene todos los permisos especificados
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission));
}

// Obtener todos los permisos de un rol
export function getRolePermissions(role: UserRole): Permission[] {
  return rolePermissions[role] ?? [];
}

// Verificar si un usuario solo tiene permiso de vista personal (view_self) para un recurso
export function hasOnlySelfViewPermission(role: UserRole, resource: string): boolean {
  const selfPermission = `${resource}:view_self` as Permission;
  const fullPermission = `${resource}:view` as Permission;
  return hasPermission(role, selfPermission) && !hasPermission(role, fullPermission);
}

// Verificar si un usuario puede realizar acciones de escritura en un recurso
export function canWrite(role: UserRole, resource: string): boolean {
  const createPermission = `${resource}:create` as Permission;
  const editPermission = `${resource}:edit` as Permission;
  const deletePermission = `${resource}:delete` as Permission;
  return hasAnyPermission(role, [createPermission, editPermission, deletePermission]);
}

// Labels amigables para los roles
export const roleLabels: Record<UserRole, string> = {
  superadmin: "Super Administrador (Sistema)",
  soporte: "Soporte Técnico",
  superusuario: "Super Usuario",
  admin: "Gerente General",
  responsable_sst: "Responsable SST",
  coordinador_salud: "Coordinador de Salud Ocupacional",
  lso: "Licenciado en Salud Ocupacional",
  coordinador_sst: "Coordinador SST",
  coordinador_rrhh: "Coordinador RRHH",
  jefe_personal: "Jefe de Personal",
  supervisor: "Supervisor",
  vigia_sst: "Vigía SST",
  auditor_interno: "Auditor Interno SG-SST",
  tecnico_mecanico: "Técnico Mecánico",
  trabajador: "Trabajador",
};

// Descripciones de roles
export const roleDescriptions: Record<UserRole, string> = {
  superadmin: "Proveedor del sistema - Acceso global a todas las empresas y facturación",
  soporte: "Personal de soporte técnico - Acceso limitado para resolver incidencias",
  superusuario: "Acceso completo a todos los módulos de su empresa, incluyendo suscripciones",
  admin: "Acceso completo al sistema, gestión de usuarios y configuración",
  responsable_sst: "Gestión interna de SST y operaciones de la empresa (sin acceso a suscripciones)",
  coordinador_salud: "Gestión de datos médicos, exámenes ocupacionales y reportes a seguridad social",
  lso: "Revisa y firma documentos SST según normatividad colombiana (Res. 0312/2019)",
  coordinador_sst: "Gestión de SST, PESV, auditorías y evaluaciones",
  coordinador_rrhh: "Gestión de trabajadores, capacitaciones y reportes de personal",
  jefe_personal: "Consulta de información y generación de reportes",
  supervisor: "Inspecciones y medidas preventivas en su área de trabajo",
  vigia_sst: "Vigía de SST para empresas con menos de 10 trabajadores (Decreto 1072/2015, Res. 2013/1986)",
  auditor_interno: "Auditorías internas del SG-SST según ISO 45001 y Decreto 1072/2015",
  tecnico_mecanico: "Registro y gestión de mantenimientos vehiculares PESV (H05). Sin acceso a datos SST.",
  trabajador: "Consulta de capacitaciones e información personal",
};

/**
 * Verifica si un rol tiene acceso global a todas las empresas
 * SOLO superadmin (proveedor SaaS) puede acceder a datos de cualquier empresa
 * admin es un rol de cliente y solo puede acceder a su propia empresa
 * @param role - El rol del usuario
 * @returns true si el usuario tiene acceso global a todas las empresas
 */
export function hasGlobalAccess(role: UserRole): boolean {
  return role === 'superadmin';
}

/**
 * Verifica si un rol tiene acceso administrativo dentro de su empresa
 * Incluye superadmin, superusuario y admin (gerente general)
 * @param role - El rol del usuario
 * @returns true si el usuario es administrador de su empresa
 */
export function hasCompanyAdminAccess(role: UserRole): boolean {
  return role === 'superadmin' || role === 'superusuario' || role === 'admin' || role === 'responsable_sst';
}

/**
 * Verifica si un rol puede acceder a datos médicos sensibles
 * Solo superadmin, admin y coordinador_salud pueden acceder
 * Cumple con Ley 1581/2012 (Habeas Data Colombia)
 * @param role - El rol del usuario
 * @returns true si el usuario puede ver datos médicos
 */
export function canAccessMedicalData(role: UserRole): boolean {
  return role === 'superadmin' || role === 'admin' || role === 'coordinador_salud';
}
