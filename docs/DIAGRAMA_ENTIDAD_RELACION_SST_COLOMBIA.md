# DIAGRAMA ENTIDAD-RELACIÓN - SST COLOMBIA
## Sistema de Gestión de Seguridad y Salud en el Trabajo

**Fecha de generación:** 30 de diciembre de 2025  
**Total de tablas:** 144

---

## 1. NÚCLEO DEL SISTEMA

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              COMPANIES                                       │
│  (Empresas - Tabla central)                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  id (PK), name, nit, legal_rep, industry, address, phone, email             │
│  risk_level, worker_count, subscription_plan, logo_url, created_at          │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         ├────────────────────────────────────────────────────────────────────┐
         │                                                                    │
         ▼                                                                    ▼
┌─────────────────────────┐                              ┌─────────────────────────┐
│        USERS            │                              │       WORKERS           │
├─────────────────────────┤                              ├─────────────────────────┤
│ id (PK)                 │                              │ id (PK)                 │
│ company_id (FK)         │                              │ company_id (FK)         │
│ username, password      │                              │ first_name, last_name   │
│ email, full_name        │                              │ document_type, document │
│ role (11 niveles RBAC)  │                              │ position, department    │
│ permissions (JSON)      │                              │ hire_date, contract_type│
│ created_at              │                              │ email, phone, user_id   │
└─────────────────────────┘                              └─────────────────────────┘
```

### Roles del Sistema (11 niveles RBAC)
1. superadmin - Proveedor SaaS
2. admin - Administrador de empresa
3. responsable_sst - Responsable SST
4. coordinador - Coordinador
5. supervisor - Supervisor
6. medico - Médico ocupacional
7. auditor - Auditor interno
8. empleado - Empleado
9. contratista - Contratista
10. visitante - Visitante
11. soporte - Soporte técnico

---

## 2. MÓDULO EVALUACIÓN INICIAL SST (Resolución 0312/2019)

```
┌─────────────────────────┐
│   COMPONENTES_SST       │ ◄── Datos Seed (7 componentes PHVA)
│   id, numero, nombre    │
│   descripcion           │
│   peso_total, orden     │
└───────────┬─────────────┘
            │ 1:N
            ▼
┌─────────────────────────┐
│    ESTANDARES_SST       │ ◄── Datos Seed (60 estándares mínimos)
│   id, componente_id(FK) │
│   numero_estandar       │
│   nombre, descripcion   │
│   puntaje_tipo1         │
│   puntaje_tipo2         │
│   puntaje_tipo3         │
│   puntaje_tipo4         │
│   marco_legal           │
│   criterios_verificacion│
│   activo, orden         │
└───────────┬─────────────┘
            │
            │ N:1
            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EVALUACIONES_SST                                     │
│  id (PK)                                                                     │
│  company_id (FK → companies.id)                                              │
│  anio, mes                          -- Período de evaluación                 │
│  tipo_empresa                       -- tipo1, tipo2, tipo3, tipo4            │
│  estado                             -- en-progreso, completada, enviada      │
│  responsable_nombre, responsable_cargo, responsable_licencia                 │
│  puntaje_total, puntaje_maximo, porcentaje_cumplimiento                     │
│  nivel_cumplimiento                 -- critico, moderado, aceptable          │
│  puntajes_por_componente (JSON)     -- {"1":{obtenido:X, maximo:Y},...}     │
│  fecha_evaluacion, fecha_envio, fecha_limite_plan_mejora                    │
│  observaciones, version, evaluacion_anterior_id                              │
│  created_at, updated_at                                                      │
└─────────────────────────────────────────────────────────────────────────────┘
              │                                          │
              │ 1:N                                      │ 1:N
              ▼                                          ▼
┌────────────────────────────────────────┐  ┌────────────────────────────────────┐
│      RESPUESTAS_ESTANDARES             │  │        ACCIONES_MEJORA             │
│  (Respuestas individuales por estándar)│  │  (Plan de mejora automático)       │
├────────────────────────────────────────┤  ├────────────────────────────────────┤
│  id (PK)                               │  │  id (PK)                           │
│  evaluacion_id (FK)                    │  │  evaluacion_id (FK)                │
│  estandar_id (FK → estandares_sst)     │  │  respuesta_estandar_id (FK)        │
│  cumple (0/1)                          │  │  descripcion_accion                │
│  no_aplica (0/1)                       │  │  objetivo, tipo_accion             │
│  justificacion_no_aplica               │  │  prioridad (alta, media, baja)     │
│  puntaje_obtenido, puntaje_maximo      │  │  responsable, area_responsable     │
│  evidencias, modo_verificacion         │  │  recursos_necesarios               │
│  observaciones                         │  │  presupuesto_estimado              │
│  hallazgo, causa_raiz                  │  │  fecha_inicio, fecha_compromiso    │
│  updated_at                            │  │  fecha_ejecucion                   │
└────────────────────────────────────────┘  │  estado (pendiente, en-proceso,    │
                                            │         completada, verificada)    │
                                            │  porcentaje_avance (0-100)         │
                                            │  indicador_eficacia                │
                                            │  resultado_esperado/obtenido       │
                                            │  eficaz (0/1/null)                 │
                                            │  observaciones                     │
                                            │  created_at, updated_at            │
                                            └────────────────────────────────────┘
```

### Tipos de Empresa según Resolución 0312/2019
| Tipo | Descripción | Estándares |
|------|-------------|------------|
| tipo1 | Capítulo I - ≤10 trabajadores, riesgo I-III | 7 estándares |
| tipo2 | Capítulo II - 11-50 riesgo I-III ó ≤10 riesgo IV-V | 21 estándares |
| tipo3 | Capítulo III - >50 trabajadores, riesgo I-III | 60 estándares |
| tipo4 | Capítulo III - >50 trabajadores ó 11-50 riesgo IV-V | 60 estándares |

---

## 3. MÓDULO GESTIÓN DE TRABAJADORES

```
┌─────────────────────────┐
│       WORKERS           │
│  id, company_id (FK)    │
│  first_name, last_name  │
│  document_type, document│
│  position, department   │
│  hire_date, contract    │
│  email, phone           │
│  user_id (FK → users)   │
│  status                 │
└───────────┬─────────────┘
            │
    ┌───────┼───────┬───────────────┬───────────────┬───────────────┐
    ▼       ▼       ▼               ▼               ▼               ▼
┌─────────┐┌─────────┐┌─────────────┐┌─────────────┐┌─────────────┐┌─────────────┐
│JOB_     ││CONTRACTS││MEDICAL_     ││HIGH_RISK_   ││TRABAJADORES_││AFILIACIONES_│
│PROFILES ││         ││EXAMS        ││WORKERS      ││ALTO_RIESGO  ││SSSS         │
│         ││         ││             ││             ││             ││             │
│Perfiles ││Contratos││Exámenes     ││Alto riesgo  ││Asignación   ││Afiliaciones │
│de cargo ││laborales││ocupacionales││             ││de riesgo    ││Seg. Social  │
└─────────┘└─────────┘└─────────────┘└─────────────┘└─────────────┘└─────────────┘
```

### Detalle de tablas relacionadas

**JOB_PROFILES** (Perfiles de cargo)
- id, company_id, name, department
- responsibilities, competencies
- ppe_required, health_requirements
- risk_factors, created_at

**CONTRACTS** (Contratos)
- id, worker_id, company_id
- contract_type, start_date, end_date
- salary, position, status

**MEDICAL_EXAMS** (Exámenes médicos ocupacionales)
- id, worker_id, company_id
- exam_type (ingreso, periódico, egreso)
- exam_date, next_exam_date
- result, recommendations, restrictions

**AFILIACIONES_SSSS** (Afiliaciones Seguridad Social)
- id, worker_id, company_id
- eps, arl, afp, caja_compensacion
- fecha_afiliacion, estado

---

## 4. MÓDULO CAPACITACIONES

```
┌─────────────────────────────────────┐
│       PROGRAMAS_CAPACITACION        │ ◄── Programa anual de capacitación
│  id, company_id, anio               │
│  nombre, descripcion, estado        │
│  fecha_elaboracion, aprobado_por    │
└───────────────┬─────────────────────┘
                │ 1:N
                ▼
┌─────────────────────────────────────┐
│       CAPACITACION_EVENTOS          │ ◄── Eventos de capacitación
│  id, programa_id (FK)               │
│  titulo, descripcion                │
│  fecha_evento, hora_inicio          │
│  hora_fin, duracion_horas           │
│  instructor, modalidad              │
│  ubicacion, link_virtual            │
│  estado, cupo_maximo                │
└───────────────┬─────────────────────┘
                │ 1:N
                ▼
┌─────────────────────────────────────┐
│     CAPACITACION_ASISTENTES         │
│  id, evento_id (FK)                 │
│  trabajador_id (FK)                 │
│  estado (invitado, confirmado,      │
│          asistio, no_asistio)       │
│  confirmado_at, asistio_at          │
│  calificacion_evaluacion            │
│  observaciones                      │
└─────────────────────────────────────┘

─────────────────────────────────────────────────────────────────────────────
                         SISTEMA LEGACY (Trainings)
─────────────────────────────────────────────────────────────────────────────

┌─────────────────────────┐
│      TRAININGS          │ ◄── Sistema legacy de capacitaciones
│  id, company_id (FK)    │
│  topic, date            │
│  duration, trainer      │
│  description, type      │
│  status                 │
└───────────┬─────────────┘
            │ 1:N
            ▼
┌─────────────────────────┐
│   TRAINING_ATTENDEES    │
│  id, training_id (FK)   │
│  worker_id (FK)         │
│  attended, score        │
│  confirmed              │
│  confirmed_at           │
└─────────────────────────┘
```

---

## 5. MÓDULO COPASST (Comité Paritario de SST)

```
┌─────────────────────────────────────┐
│       COPASST_PERIODOS              │ ◄── Períodos del comité (2 años)
│  id, company_id                     │
│  fecha_inicio, fecha_fin            │
│  estado (activo, finalizado)        │
│  resolucion_conformacion            │
└───────────────┬─────────────────────┘
                │
    ┌───────────┼───────────┬───────────────┐
    ▼           ▼           ▼               ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐
│COPASST_ │ │COPASST_ │ │COPASST_ │ │COPASST_     │
│MIEMBROS │ │ELECCIONES│ │ACTAS   │ │CANDIDATOS   │
│         │ │          │ │        │ │             │
│Miembros │ │Proceso   │ │Actas   │ │Candidatos   │
│titulares│ │electoral │ │reunión │ │inscritos    │
│y supl.  │ │          │ │        │ │             │
└─────────┘ └────┬─────┘ └────────┘ └─────────────┘
                 │
         ┌───────┼───────┐
         ▼       ▼       ▼
    ┌─────────┐┌─────────┐┌─────────────────┐
    │COPASST_ ││COPASST_ ││COPASST_REGISTRO_│
    │VOTOS    ││REGISTRO_││VOTACION         │
    │         ││VOTACION ││                 │
    │Votos    ││Control  ││                 │
    │emitidos ││votación ││                 │
    └─────────┘└─────────┘└─────────────────┘
```

### Tablas adicionales COPASST

**COPASST_CAPACITACIONES** (Capacitación de miembros)
- id, miembro_id, tema
- fecha, duracion, certificado

**COPASST_COMPETENCIAS** (Competencias de miembros)
- id, miembro_id, competencia
- nivel, fecha_evaluacion

---

## 6. MÓDULO COMITÉ DE CONVIVENCIA LABORAL

```
┌─────────────────────────────────────┐
│     CONVIVENCIA_PERIODOS            │ ◄── Períodos del comité (2 años)
│  id, company_id                     │
│  fecha_inicio, fecha_fin            │
│  estado                             │
└───────────────┬─────────────────────┘
                │
    ┌───────────┼───────────┬───────────────┐
    ▼           ▼           ▼               ▼
┌─────────────┐┌───────────┐┌─────────────┐┌─────────────┐
│CONVIVENCIA_ ││CONVIVENCIA││CONVIVENCIA_ ││CONVIVENCIA_ │
│MIEMBROS     ││_ELECCIONES││ACTAS        ││CANDIDATOS   │
│             ││           ││             ││             │
│Miembros     ││Proceso    ││Actas de     ││Candidatos   │
│designados   ││electoral  ││reuniones    ││inscritos    │
└─────────────┘└─────┬─────┘└─────────────┘└─────────────┘
                     │
             ┌───────┼───────┐
             ▼       ▼       ▼
        ┌─────────┐┌─────────┐┌─────────────────┐
        │CONVIV._ ││CONVIV._ ││COMITE_          │
        │VOTOS    ││REGISTRO_││CONVIVENCIA_ACTAS│
        │         ││VOTACION ││                 │
        └─────────┘└─────────┘└─────────────────┘
```

---

## 7. MÓDULO FORMACIÓN VIRTUAL (Gamificación)

```
┌─────────────────────────────────────┐
│    COPASST_CURSO_CATEGORIAS         │ ◄── Categorías de cursos
│  id, nombre, descripcion            │
│  icono, orden, activo               │
└───────────────┬─────────────────────┘
                │ 1:N
                ▼
┌─────────────────────────────────────┐
│        COPASST_CURSOS               │ ◄── CMS de cursos virtuales
│  id, categoria_id (FK)              │
│  titulo, descripcion                │
│  duracion_estimada, nivel           │
│  imagen_portada, requisitos         │
│  puntos_completar, publicado        │
│  target_roles (JSON)                │
│  created_at                         │
└───────────────┬─────────────────────┘
                │ 1:N
                ▼
┌─────────────────────────────────────┐
│       COPASST_LECCIONES             │ ◄── Lecciones del curso
│  id, curso_id (FK)                  │
│  titulo, contenido (HTML/MD)        │
│  tipo (texto, video, quiz)          │
│  orden, duracion_minutos            │
│  puntos                             │
└───────────────┬─────────────────────┘
                │
        ┌───────┴───────┐
        ▼               ▼
┌─────────────────┐ ┌─────────────────────────┐
│COPASST_PROGRESO │ │COPASST_QUIZ_PREGUNTAS   │
│                 │ │                         │
│id, user_id      │ │id, leccion_id (FK)      │
│leccion_id (FK)  │ │pregunta, tipo           │
│completado       │ │opciones (JSON)          │
│fecha_completado │ │respuesta_correcta       │
│puntaje_obtenido │ │explicacion              │
└─────────────────┘ └─────────────────────────┘

─────────────────────────────────────────────────────────────────────────────
                         BANCO DE PREGUNTAS
─────────────────────────────────────────────────────────────────────────────

┌─────────────────────────────────────┐
│    COPASST_BANCO_PREGUNTAS          │ ◄── Banco centralizado de preguntas
│  id, company_id                     │
│  pregunta, tipo                     │
│  opciones (JSON)                    │
│  respuesta_correcta                 │
│  explicacion                        │
│  tags (JSON) - filtrado por tags    │
│  dificultad, puntos                 │
│  activo, created_at                 │
└─────────────────────────────────────┘

─────────────────────────────────────────────────────────────────────────────
                         GAMIFICACIÓN
─────────────────────────────────────────────────────────────────────────────

┌─────────────────────────────────────┐
│      COPASST_INSIGNIAS              │ ◄── Badges/logros disponibles
│  id, nombre, descripcion            │
│  icono, criterio                    │
│  puntos_requeridos                  │
│  tipo (curso, racha, puntaje)       │
└───────────────┬─────────────────────┘
                │ N:M
                ▼
┌─────────────────────────────────────┐
│   COPASST_INSIGNIAS_USUARIO         │ ◄── Insignias obtenidas
│  id, user_id, insignia_id (FK)      │
│  fecha_obtencion                    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│    COPASST_RACHAS_USUARIO           │ ◄── Streaks de actividad
│  id, user_id                        │
│  racha_actual, racha_maxima         │
│  ultima_actividad                   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   COPASST_PUNTOS_MENSUALES          │ ◄── Puntos para leaderboard
│  id, user_id                        │
│  anio, mes                          │
│  puntos_totales                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│    COPASST_CERTIFICADOS             │ ◄── Certificados emitidos
│  id, user_id, curso_id (FK)         │
│  fecha_emision                      │
│  codigo_verificacion                │
│  pdf_url                            │
└─────────────────────────────────────┘

─────────────────────────────────────────────────────────────────────────────
                         ESCENARIOS INTERACTIVOS
─────────────────────────────────────────────────────────────────────────────

┌─────────────────────────────────────┐
│      COPASST_ESCENARIOS             │ ◄── Escenarios de simulación
│  id, titulo, descripcion            │
│  contexto, dificultad               │
│  puntos_maximos                     │
└───────────────┬─────────────────────┘
                │ 1:N
                ▼
┌─────────────────────────────────────┐
│    COPASST_ESCENARIO_NODOS          │ ◄── Nodos del escenario (árbol)
│  id, escenario_id (FK)              │
│  texto, opciones (JSON)             │
│  es_final, puntos                   │
│  retroalimentacion                  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   COPASST_ESCENARIO_PROGRESO        │ ◄── Progreso del usuario
│  id, user_id, escenario_id          │
│  nodo_actual_id                     │
│  puntaje_acumulado                  │
│  completado                         │
└─────────────────────────────────────┘
```

---

## 8. MÓDULO EVALUACIÓN 360° DE COMPETENCIAS

```
┌─────────────────────────────────────┐
│  COPASST_EVALUACION_PERIODOS        │ ◄── Períodos de evaluación
│  id, company_id                     │
│  nombre, fecha_inicio, fecha_fin    │
│  estado                             │
└───────────────┬─────────────────────┘
                │ 1:N
                ▼
┌─────────────────────────────────────┐
│  COPASST_EVALUACION_ASIGNACIONES    │ ◄── Quién evalúa a quién
│  id, periodo_id (FK)                │
│  evaluador_id, evaluado_id          │
│  tipo (auto, par, supervisor)       │
│  estado, fecha_completado           │
└───────────────┬─────────────────────┘
                │ 1:N
                ▼
┌─────────────────────────────────────┐
│   COPASST_EVALUACION_RESPUESTAS     │ ◄── Respuestas de evaluación
│  id, asignacion_id (FK)             │
│  item_id (FK)                       │
│  puntaje, comentario                │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│    COPASST_EVALUACION_ITEMS         │ ◄── Ítems/preguntas a evaluar
│  id, nombre, descripcion            │
│  categoria, peso                    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  COPASST_EVALUACION_RESULTADOS      │ ◄── Resultados consolidados
│  id, periodo_id, evaluado_id        │
│  puntaje_promedio                   │
│  fortalezas, areas_mejora           │
└─────────────────────────────────────┘
```

---

## 9. MÓDULO ACCIDENTES E INCIDENTES

```
┌─────────────────────────────────────┐
│          ACCIDENTS                  │ ◄── Registro de accidentes
│  id, company_id (FK)                │
│  worker_id (FK)                     │
│  date, time, location               │
│  type (trabajo, trayecto)           │
│  severity (leve, grave, mortal)     │
│  description                        │
│  body_part_affected                 │
│  injury_type                        │
│  immediate_causes                   │
│  basic_causes                       │
│  corrective_actions                 │
│  days_lost                          │
│  furat_number                       │
│  reported_to_arl                    │
│  status                             │
└───────────────┬─────────────────────┘
                │
        ┌───────┴───────┐
        ▼               ▼
┌─────────────────┐ ┌─────────────────────────┐
│ACCIDENT_        │ │OCCUPATIONAL_DISEASES    │
│STATISTICS       │ │                         │
│                 │ │id, company_id, worker_id│
│Estadísticas     │ │disease_name, diagnosis  │
│anuales AT       │ │date_diagnosis, origin   │
│                 │ │restrictions, status     │
└─────────────────┘ └─────────────────────────┘
```

---

## 10. MÓDULO IPERC (Identificación de Peligros)

```
┌─────────────────────────────────────┐
│        MATRICES_IPERC               │ ◄── Matrices de peligros
│  id, company_id (FK)                │
│  nombre, descripcion                │
│  proceso, area                      │
│  fecha_elaboracion                  │
│  fecha_actualizacion                │
│  elaborado_por, aprobado_por        │
│  estado                             │
└───────────────┬─────────────────────┘
                │ 1:N
                ▼
┌─────────────────────────────────────┐
│       PELIGROS_IPERC                │ ◄── Peligros identificados
│  id, matriz_id (FK)                 │
│  actividad, tarea                   │
│  peligro, descripcion_peligro       │
│  clasificacion_peligro              │
│  efectos_posibles                   │
│  fuente, medio, individuo           │
│  nivel_deficiencia                  │
│  nivel_exposicion                   │
│  nivel_probabilidad                 │
│  nivel_consecuencia                 │
│  nivel_riesgo                       │
│  interpretacion_riesgo              │
│  aceptabilidad_riesgo               │
│  medidas_intervencion               │
│  responsable, fecha_implementacion  │
└───────────────┬─────────────────────┘
                │ N:M
                ▼
┌─────────────────────────────────────┐
│ PELIGROS_TRABAJADORES_ASIGNACION    │
│  id, peligro_id, worker_id          │
│  fecha_asignacion                   │
└─────────────────────────────────────┘
```

---

## 11. MÓDULO EMERGENCIAS

```
┌─────────────────────────────────────┐
│       PLANES_EMERGENCIA             │ ◄── Plan de emergencias
│  id, company_id (FK)                │
│  nombre, version                    │
│  fecha_elaboracion                  │
│  fecha_actualizacion                │
│  objetivo, alcance                  │
│  normativa_aplicable                │
│  elaborado_por, aprobado_por        │
│  estado                             │
└───────────────┬─────────────────────┘
                │
    ┌───────────┼───────────┬───────────────┬───────────────┐
    ▼           ▼           ▼               ▼               ▼
┌─────────┐ ┌─────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│AMENAZAS_│ │ANALISIS_│ │BRIGADAS_    │ │RECURSOS_    │ │RUTAS_       │
│IDENTIF. │ │VULNERAB.│ │EMERGENCIA   │ │EMERGENCIA   │ │EVACUACION   │
│         │ │         │ │             │ │             │ │             │
│Amenazas │ │Análisis │ │Brigadas     │ │Equipos de   │ │Rutas de     │
│internas │ │de vuln. │ │conformadas  │ │emergencia   │ │evacuación   │
│y externas│ │         │ │             │ │             │ │             │
└─────────┘ └─────────┘ └──────┬──────┘ └─────────────┘ └─────────────┘
                               │
                               ▼
                        ┌─────────────┐
                        │MIEMBROS_    │
                        │BRIGADA      │
                        │             │
                        │Brigadistas  │
                        │asignados    │
                        └─────────────┘

┌─────────────────────────────────────┐
│         SIMULACROS                  │ ◄── Simulacros programados
│  id, plan_id (FK)                   │
│  tipo, fecha_programada             │
│  fecha_ejecucion                    │
│  duracion, participantes_esperados  │
│  observaciones, estado              │
└───────────────┬─────────────────────┘
                │ 1:N
                ▼
┌─────────────────────────────────────┐
│    PARTICIPANTES_SIMULACRO          │
│  id, simulacro_id, worker_id        │
│  asistio, observaciones             │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│       ZONAS_EVACUACION              │
│  id, plan_id, nombre                │
│  capacidad, punto_encuentro         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│       PUNTOS_ENCUENTRO              │
│  id, plan_id, nombre                │
│  ubicacion, capacidad               │
└─────────────────────────────────────┘
```

---

## 12. MÓDULO AUDITORÍAS INTERNAS

```
┌─────────────────────────────────────┐
│      AUDITORIAS_INTERNAS            │ ◄── Programación de auditorías
│  id, company_id (FK)                │
│  nombre, objetivo                   │
│  alcance, criterios                 │
│  fecha_programada, fecha_ejecucion  │
│  auditor_lider                      │
│  estado                             │
└───────────────┬─────────────────────┘
                │
        ┌───────┼───────┬───────────────┐
        ▼       ▼       ▼               ▼
┌─────────────┐┌─────────────┐┌─────────────────┐┌─────────────────┐
│AUDITORIA_   ││AUDITORIA_   ││HALLAZGOS_       ││PLANES_ACCION_   │
│AUDITORES    ││CHECKLISTS   ││AUDITORIA        ││AUDITORIA        │
│             ││             ││                 ││                 │
│Equipo       ││Listas de    ││No conformidades ││Acciones         │
│auditor      ││verificación ││y observaciones  ││correctivas      │
└─────────────┘└─────────────┘└─────────────────┘└─────────────────┘
```

---

## 13. MÓDULO REVISIÓN POR LA DIRECCIÓN

```
┌─────────────────────────────────────┐
│     REVISIONES_DIRECCION            │ ◄── Reuniones de revisión
│  id, company_id (FK)                │
│  fecha, periodo_evaluado            │
│  participantes, estado              │
│  conclusiones_generales             │
└───────────────┬─────────────────────┘
                │
        ┌───────┼───────┬───────────────┐
        ▼       ▼       ▼               ▼
┌─────────────┐┌─────────────┐┌─────────────────┐┌─────────────────┐
│TEMAS_       ││PARTICIPANTES││DECISIONES_      ││ACCIONES_        │
│REVISION     ││_REVISION    ││REVISION         ││REVISION         │
│             ││             ││                 ││                 │
│Temas        ││Asistentes   ││Decisiones       ││Compromisos      │
│tratados     ││a la reunión ││tomadas          ││asignados        │
└─────────────┘└─────────────┘└─────────────────┘└─────────────────┘
```

---

## 14. MÓDULO INDICADORES SST

```
┌─────────────────────────────────────┐
│        INDICADORES_SST              │ ◄── Definición de indicadores
│  id, company_id (FK)                │
│  nombre, tipo (estructura,          │
│         proceso, resultado)         │
│  formula, meta                      │
│  frecuencia_medicion                │
│  responsable, activo                │
└───────────────┬─────────────────────┘
                │ 1:N
                ▼
┌─────────────────────────────────────┐
│     MEDICIONES_INDICADORES          │ ◄── Mediciones periódicas
│  id, indicador_id (FK)              │
│  periodo, valor_obtenido            │
│  valor_meta, cumplimiento           │
│  analisis, acciones                 │
└───────────────┬─────────────────────┘
                │ 1:N
                ▼
┌─────────────────────────────────────┐
│    DATOS_CALCULO_INDICADORES        │ ◄── Datos fuente
│  id, medicion_id (FK)               │
│  variable, valor                    │
│  fuente                             │
└─────────────────────────────────────┘
```

---

## 15. MÓDULO DOCUMENTOS SST

```
┌─────────────────────────────────────┐
│        SST_DOCUMENTS                │ ◄── Gestión documental
│  id, company_id (FK)                │
│  titulo, tipo_documento             │
│  codigo, version_actual             │
│  fecha_elaboracion                  │
│  fecha_vigencia                     │
│  elaborado_por, aprobado_por        │
│  archivo_url (S3)                   │
│  estado, retención_años             │
└───────────────┬─────────────────────┘
                │
        ┌───────┼───────┬───────────────┐
        ▼       ▼       ▼               ▼
┌─────────────┐┌─────────────┐┌─────────────────┐┌─────────────────┐
│SST_DOCUMENT_││SST_DOCUMENT_││SST_DOCUMENT_    ││SST_EVIDENCE     │
│VERSIONS     ││ALERTS       ││ACCESS_LOG       ││                 │
│             ││             ││                 ││                 │
│Historial    ││Alertas de   ││Log de accesos   ││Evidencias       │
│versiones    ││vencimiento  ││al documento     ││adjuntas         │
└─────────────┘└─────────────┘└─────────────────┘└─────────────────┘
```

---

## 16. MÓDULO FACTURACIÓN Y SUSCRIPCIONES

```
┌─────────────────────────────────────┐
│      SUBSCRIPTION_PLANS             │ ◄── Planes disponibles
│  id, name (microempresa, pequeña,   │
│          mediana, grande)           │
│  price_monthly, price_annual        │
│  worker_limit, features (JSON)      │
│  stripe_price_id                    │
└───────────────┬─────────────────────┘
                │ 1:N
                ▼
┌─────────────────────────────────────┐
│        SUBSCRIPTIONS                │ ◄── Suscripciones activas
│  id, company_id (FK)                │
│  plan_id (FK)                       │
│  status (trial, active, cancelled)  │
│  trial_ends_at                      │
│  current_period_start               │
│  current_period_end                 │
│  stripe_subscription_id             │
│  stripe_customer_id                 │
└───────────────┬─────────────────────┘
                │ 1:N
                ▼
┌─────────────────────────────────────┐
│          INVOICES                   │ ◄── Facturas generadas
│  id, subscription_id (FK)           │
│  invoice_number                     │
│  amount, status                     │
│  due_date, paid_at                  │
│  stripe_invoice_id                  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│      PAYMENT_TRANSACTIONS           │ ◄── Transacciones de pago
│  id, subscription_id                │
│  amount, status                     │
│  stripe_payment_intent_id           │
│  created_at                         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│       PAYMENT_SOURCES               │ ◄── Métodos de pago
│  id, company_id                     │
│  type, last_four                    │
│  stripe_payment_method_id           │
│  is_default                         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│       PRICING_CONFIG                │ ◄── Configuración precios
│  id, config (JSON)                  │
│  activo                             │
└─────────────────────────────────────┘
```

---

## 17. MÓDULO EVS (Estilos de Vida Saludable)

```
┌─────────────────────────────────────┐
│        EVS_PROGRAMS                 │ ◄── Programas de bienestar
│  id, company_id                     │
│  nombre, tipo (tabaco, alcohol,     │
│         drogas, actividad_fisica,   │
│         salud_mental)               │
│  descripcion, objetivos             │
│  fecha_inicio, fecha_fin            │
│  responsable, estado                │
└───────────────┬─────────────────────┘
                │
    ┌───────────┼───────────┬───────────────┬───────────────┐
    ▼           ▼           ▼               ▼               ▼
┌─────────┐ ┌─────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│EVS_     │ │EVS_     │ │EVS_         │ │EVS_         │ │EVS_         │
│ACTIVITIES│ │CONTROLS │ │INCIDENTS    │ │FOLLOWUPS    │ │PARTICIPANTS │
│         │ │         │ │             │ │             │ │             │
│Actividades││Controles││Incidentes   ││Seguimientos ││Participantes│
│programadas││de salud ││reportados   ││de casos     ││inscritos    │
└─────────┘ └─────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

---

## 18. MÓDULO PESV (Plan Estratégico de Seguridad Vial)

```
┌─────────────────────────────────────┐
│          VEHICLES                   │ ◄── Flota vehicular
│  id, company_id                     │
│  placa, tipo, marca, modelo         │
│  año, capacidad                     │
│  soat_vigencia, rtm_vigencia        │
└───────────────┬─────────────────────┘
                │
        ┌───────┼───────┬───────────────┐
        ▼       ▼       ▼               ▼
┌─────────────┐┌─────────────┐┌─────────────────┐┌─────────────────┐
│VEHICLE_     ││DRIVERS      ││PESV_            ││ROAD_INCIDENTS   │
│INSPECTIONS  ││             ││CAPACITACIONES   ││                 │
│             ││             ││                 ││                 │
│Inspecciones ││Conductores  ││Capacitaciones   ││Incidentes       │
│preoperac.   ││autorizados  ││seguridad vial   ││viales           │
└─────────────┘└─────────────┘└─────────────────┘└─────────────────┘

┌─────────────────────────────────────┐
│        PESV_AUDITS                  │ ◄── Auditorías PESV
│  id, company_id                     │
│  fecha, tipo, hallazgos             │
│  estado                             │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│       PESV_SINIESTROS               │ ◄── Registro siniestros
│  id, company_id, vehicle_id         │
│  driver_id, fecha, descripcion      │
│  gravedad, causas                   │
└─────────────────────────────────────┘
```

---

## 19. MÓDULO SOPORTE Y TICKETS

```
┌─────────────────────────────────────┐
│       SUPPORT_TICKETS               │ ◄── Tickets de soporte
│  id, company_id, user_id            │
│  asunto, descripcion                │
│  prioridad, categoria               │
│  estado, asignado_a                 │
│  created_at, closed_at              │
└───────────────┬─────────────────────┘
                │ 1:N
                ▼
┌─────────────────────────────────────┐
│      TICKET_RESPONSES               │ ◄── Respuestas al ticket
│  id, ticket_id (FK)                 │
│  user_id, mensaje                   │
│  created_at                         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│    TICKET_STATUS_HISTORY            │ ◄── Historial de estados
│  id, ticket_id                      │
│  estado_anterior, estado_nuevo      │
│  changed_by, created_at             │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   SUPPORT_ACCESS_SESSIONS           │ ◄── Accesos de soporte
│  id, company_id, user_id            │
│  reason, approved_by                │
│  start_time, end_time               │
│  status                             │
└───────────────┬─────────────────────┘
                │ 1:N
                ▼
┌─────────────────────────────────────┐
│    SUPPORT_ACCESS_EVENTS            │ ◄── Log de actividades
│  id, session_id                     │
│  action, details                    │
│  created_at                         │
└─────────────────────────────────────┘
```

---

## 20. MÓDULO COMUNICACIONES

```
┌─────────────────────────────────────┐
│      INTERNAL_MESSAGES              │ ◄── Mensajería interna
│  id, company_id                     │
│  from_user_id, to_user_id           │
│  subject, body                      │
│  read, read_at                      │
│  created_at                         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│     EMAIL_NOTIFICATIONS             │ ◄── Notificaciones email
│  id, company_id, user_id            │
│  tipo, destinatario                 │
│  asunto, contenido                  │
│  estado, enviado_at                 │
│  error_message                      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│     COMUNICACIONES_SST              │ ◄── Comunicados SST
│  id, company_id                     │
│  titulo, mensaje                    │
│  tipo, destinatarios                │
│  fecha_publicacion                  │
│  created_by                         │
└───────────────┬─────────────────────┘
                │ 1:N
                ▼
┌─────────────────────────────────────┐
│   LECTURAS_COMUNICACION             │ ◄── Confirmación de lectura
│  id, comunicacion_id                │
│  user_id, leido_at                  │
└─────────────────────────────────────┘
```

---

## 21. OTRAS TABLAS IMPORTANTES

```
MATRIZ_LEGAL                  - Requisitos legales aplicables
POLITICAS_SST                 - Políticas documentadas
OBJETIVOS_SST                 - Objetivos e indicadores
RECOMENDACIONES_ARL           - Recomendaciones de ARL/autoridades
SEGUIMIENTO_RECOMENDACIONES   - Seguimiento a recomendaciones
PROVEEDORES_CONTRATISTAS      - Gestión de proveedores
EVALUACIONES_PROVEEDORES      - Evaluación de proveedores
SUSTANCIAS_QUIMICAS           - Sustancias peligrosas
HOJAS_SEGURIDAD               - Fichas de seguridad (SDS)
ENVIRONMENTAL_MEASUREMENTS    - Mediciones ambientales
PREVENTIVE_MEASURES           - Medidas preventivas
PROMOTION_PREVENTION_ACTIVITIES - Actividades P&P
CONTENIDOS_INDUCCION          - Contenidos de inducción
REGISTROS_INDUCCION           - Registros de inducción
AUDIT_LOGS                    - Auditoría de sistema
SESSION                       - Sesiones de usuario
CONSENT_RECORDS               - Registros de consentimiento GDPR
ARCO_REQUESTS                 - Solicitudes ARCO (Habeas Data)
```

---

## RESUMEN POR MÓDULOS

| # | Módulo | Tablas | Descripción |
|---|--------|--------|-------------|
| 1 | Núcleo | 3 | Companies, Users, Workers |
| 2 | Evaluación SST | 5 | Estándares mínimos Res. 0312/2019 |
| 3 | Trabajadores | 6 | Perfiles, contratos, exámenes |
| 4 | Capacitaciones | 8 | Programas, eventos, asistencia |
| 5 | COPASST | 14 | Períodos, elecciones, actas |
| 6 | Convivencia | 10 | Comité de convivencia laboral |
| 7 | Formación Virtual | 18 | CMS, gamificación, certificados |
| 8 | Evaluación 360° | 5 | Evaluación de competencias |
| 9 | Accidentes | 4 | AT, EL, estadísticas |
| 10 | IPERC | 3 | Matrices de peligros |
| 11 | Emergencias | 12 | Planes, brigadas, simulacros |
| 12 | Auditorías | 4 | Auditorías internas |
| 13 | Revisión Dirección | 4 | Reuniones de revisión |
| 14 | Indicadores | 3 | KPIs del SG-SST |
| 15 | Documentos | 5 | Gestión documental |
| 16 | Facturación | 8 | Suscripciones Stripe |
| 17 | EVS | 6 | Estilos vida saludable |
| 18 | PESV | 8 | Seguridad vial |
| 19 | Soporte | 5 | Tickets y accesos |
| 20 | Comunicaciones | 5 | Mensajería y notificaciones |
| 21 | Otros | 18 | Módulos adicionales |
| **TOTAL** | | **144** | |

---

## NOTAS TÉCNICAS

### Almacenamiento de Archivos
- **Amazon S3**: Bucket `sst-colombia-archivos-2026`
- **Retención**: 20 años (Decreto 1072 de 2015)
- **Prefijo en BD**: `uploads/uploads/...`

### Base de Datos
- **Motor**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **Migraciones**: `npm run db:push`

### Autenticación
- **Método**: Passport.js con sesiones
- **Hash**: Scrypt
- **RBAC**: 11 niveles de roles

---

*Documento generado automáticamente - SST Colombia v1.0*
