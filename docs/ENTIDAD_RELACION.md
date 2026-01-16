# Diagrama Entidad-Relación - SST Colombia

## Resumen General
- **Total de Tablas**: 161
- **Base de Datos**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM

---

## 1. NÚCLEO DEL SISTEMA

### 1.1 Empresas y Usuarios
```
┌─────────────────────┐       ┌─────────────────────┐
│     companies       │       │       users         │
├─────────────────────┤       ├─────────────────────┤
│ id (PK)             │◄──────│ company_id (FK)     │
│ name                │       │ id (PK)             │
│ nit                 │       │ username            │
│ address             │       │ password            │
│ phone               │       │ role                │
│ email               │       │ worker_id (FK)      │
│ sector              │       │ full_name           │
│ size                │       │ email               │
│ arl                 │       │ department          │
│ risk_class          │       └─────────────────────┘
│ legal_rep_name      │
│ legal_rep_id        │
│ sst_responsible     │
│ logo_url            │
│ chapter (1-3)       │
│ created_at          │
└─────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────┐
│      workers        │
├─────────────────────┤
│ id (PK)             │
│ company_id (FK)     │
│ name                │
│ document_type       │
│ document_number     │
│ email               │
│ phone               │
│ position            │
│ department          │
│ hire_date           │
│ birth_date          │
│ gender              │
│ blood_type          │
│ eps                 │
│ pension_fund        │
│ arl                 │
│ emergency_contact   │
│ emergency_phone     │
│ photo_url           │
│ status              │
└─────────────────────┘
```

### 1.2 Planes y Suscripciones
```
┌─────────────────────┐       ┌─────────────────────┐
│ subscription_plans  │       │   subscriptions     │
├─────────────────────┤       ├─────────────────────┤
│ id (PK)             │◄──────│ plan_id (FK)        │
│ name                │       │ id (PK)             │
│ code                │       │ company_id (FK)     │
│ price               │       │ status              │
│ max_workers         │       │ trial_ends_at       │
│ features            │       │ current_period_start│
│ active              │       │ current_period_end  │
└─────────────────────┘       │ stripe_customer_id  │
                              │ stripe_subscription │
                              └─────────────────────┘
```

---

## 2. MÓDULO DE SEGURIDAD Y SALUD

### 2.1 Accidentes e Incidentes
```
┌─────────────────────┐
│     accidents       │
├─────────────────────┤
│ id (PK)             │
│ company_id (FK)     │
│ worker_id (FK)      │
│ date                │
│ time                │
│ location            │
│ description         │
│ injury_type         │
│ body_part           │
│ severity            │
│ days_lost           │
│ immediate_cause     │
│ basic_cause         │
│ corrective_actions  │
│ investigation_date  │
│ furat_filed         │
│ created_at          │
└─────────────────────┘
```

### 2.2 Enfermedades Laborales
```
┌─────────────────────────┐
│  occupational_diseases  │
├─────────────────────────┤
│ id (PK)                 │
│ company_id (FK)         │
│ worker_id (FK)          │
│ diagnosis               │
│ diagnosis_date          │
│ origin                  │
│ incapacity_days         │
│ status                  │
│ eps                     │
│ arl                     │
│ created_at              │
└─────────────────────────┘
```

### 2.3 Indicadores SST
```
┌─────────────────────────┐
│   indicadores_sst       │
├─────────────────────────┤
│ id (PK)                 │
│ company_id (FK)         │
│ year                    │
│ month                   │
│ hht (Horas Hombre)      │
│ if_at (Índice Frec AT)  │
│ if_el (Índice Frec EL)  │
│ is_at (Índice Sev AT)   │
│ is_el (Índice Sev EL)   │
│ ili_at (Índice LI AT)   │
│ tasa_ausentismo         │
│ tasa_accidentalidad     │
│ tasa_mortalidad         │
│ prevalencia_el          │
│ incidencia_el           │
│ cobertura_induccion     │
│ cobertura_capacitacion  │
│ created_at              │
└─────────────────────────┘
```

---

## 3. MÓDULO DE CAPACITACIÓN

### 3.1 Capacitaciones y Asistencia
```
┌─────────────────────┐       ┌─────────────────────────┐
│     trainings       │       │  training_attendees     │
├─────────────────────┤       ├─────────────────────────┤
│ id (PK)             │◄──────│ training_id (FK)        │
│ company_id (FK)     │       │ id (PK)                 │
│ title               │       │ worker_id (FK)          │
│ description         │       │ attended                │
│ date                │       │ confirmed_by_worker     │
│ duration            │       │ score                   │
│ instructor          │       │ certificate_url         │
│ type                │       └─────────────────────────┘
│ topics              │
│ attendees_count     │
│ created_at          │
└─────────────────────┘

┌─────────────────────────┐       ┌─────────────────────────┐
│  training_programs      │       │   program_trainings     │
├─────────────────────────┤       ├─────────────────────────┤
│ id (PK)                 │◄──────│ program_id (FK)         │
│ company_id (FK)         │       │ id (PK)                 │
│ year                    │       │ training_id (FK)        │
│ name                    │       │ scheduled_month         │
│ objectives              │       │ status                  │
│ created_at              │       └─────────────────────────┘
└─────────────────────────┘
```

### 3.2 Inducción SST
```
┌─────────────────────────┐       ┌─────────────────────────┐
│  contenidos_induccion   │       │  registros_induccion    │
├─────────────────────────┤       ├─────────────────────────┤
│ id (PK)                 │       │ id (PK)                 │
│ company_id (FK)         │       │ company_id (FK)         │
│ title                   │       │ worker_id (FK)          │
│ description             │       │ contenido_id (FK)       │
│ type (video/pdf/quiz)   │       │ fecha_completado        │
│ content_url             │       │ calificacion            │
│ order                   │       │ intentos                │
│ duration_minutes        │       │ estado                  │
│ required                │       └─────────────────────────┘
└─────────────────────────┘
                │
                │ 1:N
                ▼
┌─────────────────────────┐
│  preguntas_induccion    │
├─────────────────────────┤
│ id (PK)                 │
│ contenido_id (FK)       │
│ question                │
│ options (JSON)          │
│ correct_answer          │
│ order                   │
└─────────────────────────┘
```

---

## 4. MÓDULO DE INSPECCIONES

```
┌─────────────────────┐       ┌────────────────────────────────┐
│    inspections      │       │ inspecciones_peligros_vinculados│
├─────────────────────┤       ├────────────────────────────────┤
│ id (PK)             │◄──────│ inspeccion_id (FK)             │
│ company_id (FK)     │       │ id (PK)                        │
│ date                │       │ peligro_id (FK)                │
│ area                │       │ descripcion                    │
│ type                │       │ nivel_riesgo                   │
│ findings            │       │ medidas_control                │
│ recommendations     │       └────────────────────────────────┘
│ status              │
│ responsible         │
│ due_date            │
│ evidence_url        │
│ created_at          │
└─────────────────────┘

┌─────────────────────────┐
│  preventive_measures    │
├─────────────────────────┤
│ id (PK)                 │
│ company_id (FK)         │
│ inspection_id (FK)      │
│ description             │
│ responsible             │
│ due_date                │
│ status                  │
│ completion_date         │
│ evidence_url            │
└─────────────────────────┘
```

---

## 5. MÓDULO IPERC (Identificación de Peligros y Evaluación de Riesgos)

```
┌─────────────────────────┐       ┌─────────────────────────┐
│    matrices_iperc       │       │    peligros_iperc       │
├─────────────────────────┤       ├─────────────────────────┤
│ id (PK)                 │◄──────│ matriz_id (FK)          │
│ company_id (FK)         │       │ id (PK)                 │
│ area                    │       │ proceso                 │
│ proceso                 │       │ actividad               │
│ version                 │       │ tarea                   │
│ fecha_elaboracion       │       │ peligro_tipo            │
│ fecha_actualizacion     │       │ peligro_descripcion     │
│ elaborado_por           │       │ efectos_posibles        │
│ aprobado_por            │       │ nd (Nivel Deficiencia)  │
│ estado                  │       │ ne (Nivel Exposición)   │
│ created_at              │       │ np (Nivel Probabilidad) │
└─────────────────────────┘       │ nc (Nivel Consecuencia) │
                                  │ nr (Nivel Riesgo)       │
                                  │ interpretacion_nr       │
                                  │ aceptabilidad           │
                                  │ controles_existentes    │
                                  │ controles_propuestos    │
                                  │ responsable             │
                                  │ fecha_implementacion    │
                                  └─────────────────────────┘
```

---

## 6. MÓDULO DE EVALUACIÓN SST (Resolución 0312/2019)

```
┌─────────────────────────┐       ┌─────────────────────────┐
│    componentes_sst      │       │    estandares_sst       │
├─────────────────────────┤       ├─────────────────────────┤
│ id (PK)                 │◄──────│ componente_id (FK)      │
│ name                    │       │ id (PK)                 │
│ code                    │       │ code                    │
│ phase (PHVA)            │       │ name                    │
│ order                   │       │ description             │
└─────────────────────────┘       │ mode_verification       │
                                  │ legal_criteria          │
                                  │ max_score               │
                                  │ chapter_1               │
                                  │ chapter_2               │
                                  │ chapter_3               │
                                  │ order                   │
                                  └─────────────────────────┘
                                           │
                                           │ 1:N
                                           ▼
┌─────────────────────────┐       ┌─────────────────────────┐
│    evaluaciones_sst     │       │  respuestas_estandares  │
├─────────────────────────┤       ├─────────────────────────┤
│ id (PK)                 │◄──────│ evaluacion_id (FK)      │
│ company_id (FK)         │       │ id (PK)                 │
│ year                    │       │ estandar_id (FK)        │
│ status                  │       │ cumple                  │
│ score_total             │       │ puntaje_obtenido        │
│ classification          │       │ justificacion           │
│ fecha_evaluacion        │       │ evidencias (JSON)       │
│ evaluador               │       │ observaciones           │
│ created_at              │       │ fecha_respuesta         │
└─────────────────────────┘       └─────────────────────────┘
```

---

## 7. MÓDULO COPASST (Comité Paritario)

### 7.1 Gestión de Períodos y Miembros
```
┌─────────────────────────┐       ┌─────────────────────────┐
│    copasst_periodos     │       │    copasst_miembros     │
├─────────────────────────┤       ├─────────────────────────┤
│ id (PK)                 │◄──────│ periodo_id (FK)         │
│ company_id (FK)         │       │ id (PK)                 │
│ fecha_inicio            │       │ worker_id (FK)          │
│ fecha_fin               │       │ tipo (principal/suplente)│
│ estado                  │       │ representacion          │
│ acta_constitucion_url   │       │ cargo                   │
│ created_at              │       │ estado                  │
└─────────────────────────┘       └─────────────────────────┘
```

### 7.2 Proceso Electoral
```
┌─────────────────────────┐       ┌─────────────────────────┐
│   copasst_elecciones    │       │   copasst_candidatos    │
├─────────────────────────┤       ├─────────────────────────┤
│ id (PK)                 │◄──────│ eleccion_id (FK)        │
│ company_id (FK)         │       │ id (PK)                 │
│ fecha_convocatoria      │       │ worker_id (FK)          │
│ fecha_inicio_inscripcion│       │ propuestas              │
│ fecha_fin_inscripcion   │       │ votos_obtenidos         │
│ fecha_votacion          │       │ orden_eleccion          │
│ hora_inicio_votacion    │       │ estado                  │
│ hora_fin_votacion       │       │ created_at              │
│ estado                  │       └─────────────────────────┘
│ principales_requeridos  │
│ suplentes_requeridos    │
│ convocatoria_url        │
│ acta_escrutinio_url     │
│ created_at              │
└─────────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────────┐       ┌─────────────────────────┐
│ copasst_registro_votacion│      │    copasst_votos        │
├─────────────────────────┤       ├─────────────────────────┤
│ id (PK)                 │       │ id (PK)                 │
│ eleccion_id (FK)        │       │ eleccion_id (FK)        │
│ worker_id (FK)          │       │ candidato_id (FK)       │
│ fecha_voto              │       │ created_at              │
│ created_at              │       └─────────────────────────┘
└─────────────────────────┘
```

### 7.3 Capacitación Virtual COPASST
```
┌─────────────────────────┐       ┌─────────────────────────┐
│    copasst_cursos       │       │   copasst_lecciones     │
├─────────────────────────┤       ├─────────────────────────┤
│ id (PK)                 │◄──────│ curso_id (FK)           │
│ titulo                  │       │ id (PK)                 │
│ descripcion             │       │ titulo                  │
│ duracion_estimada       │       │ contenido               │
│ nivel                   │       │ tipo                    │
│ categoria_id (FK)       │       │ duracion_minutos        │
│ imagen_url              │       │ orden                   │
│ activo                  │       │ video_url               │
│ puntos_completar        │       │ documento_url           │
│ created_at              │       └─────────────────────────┘
└─────────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────────┐       ┌─────────────────────────┐
│  copasst_quiz_preguntas │       │    copasst_progreso     │
├─────────────────────────┤       ├─────────────────────────┤
│ id (PK)                 │       │ id (PK)                 │
│ leccion_id (FK)         │       │ user_id (FK)            │
│ pregunta                │       │ curso_id (FK)           │
│ opciones (JSON)         │       │ leccion_id (FK)         │
│ respuesta_correcta      │       │ completado              │
│ explicacion             │       │ puntaje_quiz            │
│ orden                   │       │ fecha_completado        │
└─────────────────────────┘       └─────────────────────────┘

┌─────────────────────────┐       ┌─────────────────────────┐
│   copasst_insignias     │       │copasst_insignias_usuario│
├─────────────────────────┤       ├─────────────────────────┤
│ id (PK)                 │◄──────│ insignia_id (FK)        │
│ nombre                  │       │ id (PK)                 │
│ descripcion             │       │ user_id (FK)            │
│ icono                   │       │ fecha_obtenida          │
│ condicion               │       └─────────────────────────┘
│ puntos_otorga           │
│ activa                  │
└─────────────────────────┘
```

---

## 8. MÓDULO PESV (Plan Estratégico de Seguridad Vial)

```
┌─────────────────────────┐       ┌─────────────────────────┐
│      vehicles           │       │       drivers           │
├─────────────────────────┤       ├─────────────────────────┤
│ id (PK)                 │       │ id (PK)                 │
│ company_id (FK)         │       │ company_id (FK)         │
│ plate                   │       │ worker_id (FK)          │
│ type                    │       │ license_number          │
│ brand                   │       │ license_category        │
│ model                   │       │ license_expiry          │
│ year                    │       │ medical_cert_expiry     │
│ soat_expiry             │       │ years_experience        │
│ tecno_expiry            │       │ status                  │
│ status                  │       │ created_at              │
│ created_at              │       └─────────────────────────┘
└─────────────────────────┘

┌─────────────────────────┐       ┌─────────────────────────┐
│  vehicle_inspections    │       │    road_incidents       │
├─────────────────────────┤       ├─────────────────────────┤
│ id (PK)                 │       │ id (PK)                 │
│ company_id (FK)         │       │ company_id (FK)         │
│ vehicle_id (FK)         │       │ vehicle_id (FK)         │
│ driver_id (FK)          │       │ driver_id (FK)          │
│ date                    │       │ date                    │
│ type                    │       │ location                │
│ findings                │       │ description             │
│ status                  │       │ severity                │
│ created_at              │       │ injuries                │
└─────────────────────────┘       │ damages                 │
                                  │ created_at              │
                                  └─────────────────────────┘
```

---

## 9. MÓDULO DE EMERGENCIAS

```
┌─────────────────────────┐       ┌─────────────────────────┐
│    planes_emergencia    │       │  brigadas_emergencia    │
├─────────────────────────┤       ├─────────────────────────┤
│ id (PK)                 │       │ id (PK)                 │
│ company_id (FK)         │       │ company_id (FK)         │
│ version                 │       │ nombre                  │
│ fecha_elaboracion       │       │ tipo                    │
│ fecha_actualizacion     │       │ responsable_id (FK)     │
│ objetivos               │       │ created_at              │
│ alcance                 │       └─────────────────────────┘
│ amenazas_identificadas  │                │
│ recursos_disponibles    │                │ 1:N
│ estado                  │                ▼
│ created_at              │       ┌─────────────────────────┐
└─────────────────────────┘       │  miembros_brigada       │
                                  ├─────────────────────────┤
                                  │ id (PK)                 │
┌─────────────────────────┐       │ brigada_id (FK)         │
│      simulacros         │       │ worker_id (FK)          │
├─────────────────────────┤       │ rol                     │
│ id (PK)                 │       │ capacitado              │
│ company_id (FK)         │       │ fecha_capacitacion      │
│ tipo                    │       └─────────────────────────┘
│ fecha                   │
│ hora_inicio             │
│ hora_fin                │
│ participantes_esperados │
│ participantes_reales    │
│ tiempo_evacuacion       │
│ observaciones           │
│ lecciones_aprendidas    │
│ created_at              │
└─────────────────────────┘
```

---

## 10. MÓDULO DE AUDITORÍAS

```
┌─────────────────────────┐       ┌─────────────────────────┐
│   auditorias_internas   │       │  hallazgos_auditoria    │
├─────────────────────────┤       ├─────────────────────────┤
│ id (PK)                 │◄──────│ auditoria_id (FK)       │
│ company_id (FK)         │       │ id (PK)                 │
│ fecha                   │       │ tipo (NC/OBS/OM)        │
│ auditor                 │       │ proceso                 │
│ alcance                 │       │ descripcion             │
│ criterios               │       │ evidencia               │
│ conclusion              │       │ clausula_iso            │
│ estado                  │       │ estado                  │
│ informe_url             │       │ responsable             │
│ created_at              │       │ fecha_cierre            │
└─────────────────────────┘       └─────────────────────────┘

┌─────────────────────────┐
│   revisiones_gerencia   │
├─────────────────────────┤
│ id (PK)                 │
│ company_id (FK)         │
│ fecha                   │
│ participantes           │
│ entradas_revision       │
│ salidas_revision        │
│ decisiones              │
│ acciones                │
│ acta_url                │
│ created_at              │
└─────────────────────────┘
```

---

## 11. MÓDULO DE DOCUMENTOS

```
┌─────────────────────────┐       ┌─────────────────────────┐
│   documentos_sst        │       │  versiones_documento    │
├─────────────────────────┤       ├─────────────────────────┤
│ id (PK)                 │◄──────│ documento_id (FK)       │
│ company_id (FK)         │       │ id (PK)                 │
│ tipo                    │       │ version                 │
│ codigo                  │       │ archivo_url             │
│ nombre                  │       │ fecha_emision           │
│ descripcion             │       │ cambios                 │
│ proceso                 │       │ aprobado_por            │
│ version_actual          │       │ created_at              │
│ estado                  │       └─────────────────────────┘
│ fecha_vigencia          │
│ tiempo_retencion_anos   │
│ created_at              │
└─────────────────────────┘
```

---

## 12. MÓDULO DE SOPORTE

```
┌─────────────────────────┐       ┌─────────────────────────┐
│    support_tickets      │       │   ticket_responses      │
├─────────────────────────┤       ├─────────────────────────┤
│ id (PK)                 │◄──────│ ticket_id (FK)          │
│ company_id (FK)         │       │ id (PK)                 │
│ user_id (FK)            │       │ user_id (FK)            │
│ subject                 │       │ message                 │
│ description             │       │ attachments (JSON)      │
│ category                │       │ is_internal             │
│ priority                │       │ created_at              │
│ status                  │       └─────────────────────────┘
│ assigned_to (FK)        │
│ attachments (JSON)      │
│ created_at              │
│ updated_at              │
└─────────────────────────┘

┌─────────────────────────┐
│   internal_messages     │
├─────────────────────────┤
│ id (PK)                 │
│ sender_id (FK)          │
│ recipient_id (FK)       │
│ subject                 │
│ message                 │
│ priority                │
│ read                    │
│ read_at                 │
│ created_at              │
└─────────────────────────┘
```

---

## 13. MÓDULO DE PRIVACIDAD (HABEAS DATA / GDPR)

```
┌─────────────────────────┐       ┌─────────────────────────┐
│    consent_records      │       │     arco_requests       │
├─────────────────────────┤       ├─────────────────────────┤
│ id (PK)                 │       │ id (PK)                 │
│ user_id (FK)            │       │ user_id (FK)            │
│ consent_type            │       │ request_type (A/R/C/O)  │
│ consent_given           │       │ description             │
│ ip_address              │       │ status                  │
│ user_agent              │       │ response                │
│ created_at              │       │ responded_at            │
│ revoked_at              │       │ created_at              │
└─────────────────────────┘       └─────────────────────────┘
```

---

## 14. RELACIONES PRINCIPALES

### Empresa → Entidades
- `companies` 1:N `users`
- `companies` 1:N `workers`
- `companies` 1:N `accidents`
- `companies` 1:N `trainings`
- `companies` 1:N `inspections`
- `companies` 1:N `evaluaciones_sst`
- `companies` 1:N `copasst_periodos`
- `companies` 1:N `copasst_elecciones`
- `companies` 1:N `planes_emergencia`
- `companies` 1:N `documentos_sst`
- `companies` 1:N `support_tickets`
- `companies` 1:N `subscriptions`

### Trabajador → Entidades
- `workers` 1:N `accidents` (como afectado)
- `workers` 1:N `training_attendees`
- `workers` 1:N `medical_exams`
- `workers` 1:N `contracts`
- `workers` 1:N `copasst_candidatos`
- `workers` 1:N `copasst_miembros`
- `workers` 1:1 `users` (portal de empleados)

### Usuario → Entidades
- `users` 1:N `support_tickets`
- `users` 1:N `internal_messages` (sender/recipient)
- `users` 1:N `copasst_progreso`
- `users` 1:N `consent_records`
- `users` 1:N `arco_requests`

---

## 15. NOTAS TÉCNICAS

### Tipos de ID
- Todas las tablas usan UUID como clave primaria (`varchar` con `gen_random_uuid()`)

### Campos de Auditoría
- `created_at`: Timestamp de creación
- `updated_at`: Timestamp de última modificación (cuando aplica)

### Soft Delete
- Algunas tablas usan campo `status` o `estado` para eliminación lógica

### JSON Columns
- `attachments`: Almacena rutas de archivos adjuntos
- `options`/`opciones`: Almacena opciones de respuesta en quizzes
- `features`: Almacena características de planes

---

*Documento generado automáticamente - SST Colombia*
*Última actualización: Diciembre 2025*
