# Manual de Usuario — SST Colombia
**Versión:** 4.0.0
**Fecha:** 11 de junio de 2026
**Conforme a:** Resolución 0312/2019, Decreto 1072/2015, ISO 45001:2018, Resolución 40595/2022

---

## Índice

1. [Introducción](#1-introducción)
2. [Primeros Pasos](#2-primeros-pasos)
3. [Administración Global](#3-administración-global)
4. [Módulo PLANEAR](#4-módulo-planear)
5. [Módulo HACER](#5-módulo-hacer)
6. [Módulo VERIFICAR](#6-módulo-verificar)
7. [Módulo ACTUAR](#7-módulo-actuar)
8. [Módulo PESV](#8-módulo-pesv-plan-estratégico-de-seguridad-vial)
9. [Portal de Empleados](#9-portal-de-empleados)
10. [Portal del Licenciado (LSO)](#10-portal-del-licenciado-lso)
11. [Roles y Permisos](#11-roles-y-permisos)
12. [Suscripción y Facturación](#12-suscripción-y-facturación)
13. [Soporte y Ayuda](#13-soporte-y-ayuda)
14. [Preguntas Frecuentes](#14-preguntas-frecuentes)
15. [Glosario](#15-glosario)

---

## 1. Introducción

### ¿Qué es SST Colombia?

SST Colombia es una plataforma digital integral diseñada para empresas colombianas que necesitan implementar, gestionar y demostrar cumplimiento del **Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST)**. El sistema cubre desde la evaluación inicial hasta la mejora continua, siguiendo el ciclo PHVA.

### Marco Normativo

| Norma | Descripción |
|-------|-------------|
| **Resolución 0312 de 2019** | Estándares Mínimos del SG-SST |
| **Decreto 1072 de 2015** | Decreto Único Reglamentario del Sector Trabajo |
| **ISO 45001:2018** | Sistema de Gestión de la Seguridad y Salud en el Trabajo |
| **ISO 39001:2012** | Sistema de Gestión de Seguridad Vial |
| **Resolución 40595 de 2022** | Plan Estratégico de Seguridad Vial (PESV) |
| **Ley 1562 de 2012** | Sistema General de Riesgos Laborales |
| **Resolución 1401 de 2007** | Investigación de Accidentes de Trabajo |
| **Ley 1581 de 2012** | Protección de Datos Personales |
| **Ley 1010 de 2006** | Acoso Laboral |

### Ciclo PHVA — Estructura del Sistema

El sistema está organizado siguiendo el **Ciclo PHVA** con módulos adicionales:

| Pestaña | Descripción |
|---------|-------------|
| **Administración Global** | Gestión de empresas, usuarios, facturación, soporte |
| **Planear** | Diagnóstico, planificación, designaciones, política |
| **Hacer** | Implementación de controles, capacitaciones, inspecciones, EPP |
| **Verificar** | Indicadores, auditorías, evaluaciones, revisiones |
| **Actuar** | Mejora continua, planes de acción |
| **PESV** | Plan Estratégico de Seguridad Vial (24 pasos) |

> **Importante:** No existe una pestaña llamada "Configuración". La gestión administrativa se hace desde **Administración Global**.

---

## 2. Primeros Pasos

### 2.1 Acceso al Sistema

**URL:** `https://sst-colombia.replit.app`

**Credenciales del administrador principal:**
- Se asignan durante el proceso de registro/suscripción
- El superadmin activa el acceso una vez completado el onboarding

> ⚠️ **Cambie la contraseña por defecto en su primer ingreso** desde Administración Global → Mi Cuenta.

### 2.2 Onboarding (Activación de la Cuenta)

Las empresas nuevas ven una pantalla de bienvenida (**WelcomeGate**) hasta que el equipo SST Colombia complete su proceso de inducción y active el acceso completo. Si ve esta pantalla, contacte a soporte para programar su sesión de inducción.

### 2.3 Navegación Principal

La barra superior contiene las pestañas del ciclo PHVA. Al hacer clic en cada pestaña se despliega un submenú con todos los módulos disponibles. La pestaña **PESV** solo aparece si la empresa tiene vehículos registrados.

### 2.4 Flujo General de Trabajo

El punto de partida para gestionar el SG-SST es siempre la **Evaluación Inicial**:

1. **Registrar Trabajadores** → Planear → Trabajadores (único módulo fuera de la Evaluación)
2. **Crear Evaluación Inicial** → Planear → Evaluación Inicial → Nueva Evaluación
3. **Completar Estándares** → Desde cada estándar, acceder al módulo correspondiente
4. **Verificar Cumplimiento** → El porcentaje se calcula automáticamente
5. **Actuar** → Generar planes de mejora desde los hallazgos

### 2.5 Asistente Virtual (Chatbot)

El ícono de chat en la esquina inferior derecha abre el **Asistente SST Colombia**, disponible 24/7 para responder dudas sobre:
- Cómo usar cualquier módulo de la plataforma
- Normativa colombiana de SST
- Ciclo PHVA y estándares de la Resolución 0312/2019
- Plan PESV (Resolución 40595/2022)

---

## 3. Administración Global

Accesible desde la pestaña **"Administración Global"** en la barra superior.

### 3.1 Gestión de Empresas

**Ruta:** Administración Global → Empresas (`/empresas`)

#### Crear una Nueva Empresa (Asistente de 2 pasos)

**Paso 1 — Datos básicos:**
- NIT (único en el sistema)
- Razón Social
- CIIU (código de actividad económica)
- Número de trabajadores
- Número de vehículos (activa el módulo PESV)
- Ciudad, dirección, teléfono, email

**Paso 2 — Clasificación automática:**

El sistema calcula automáticamente según el CIIU y número de trabajadores:
- **Capítulo I** (Microempresa): hasta 10 trabajadores, Riesgo I/II/III → 7 estándares
- **Capítulo II** (Pequeña empresa): 11-50 trabajadores, Riesgo I/II/III → 21 estándares
- **Capítulo III** (Mediana/Grande): más de 50 trabajadores o Riesgo IV/V → 61 estándares
- **Nivel de riesgo ARL** según CIIU (automático)
- **PESV obligatorio** si tiene vehículos o trabajadores con misión de conducir

#### Funciones de Gestión de Empresa

| Función | Descripción |
|---------|-------------|
| **Editar empresa** | Clic en ícono lápiz → editar datos básicos, CIIU, número de vehículos |
| **Logo** | Subir logotipo (PNG/JPG, máx 5MB) — aparece en todos los PDF generados |
| **Asignar LSO** | Botón "Encontrar Profesionales Certificados" → vincula un LSO externo |
| **Completar Onboarding** | Desbloquea el acceso completo para la empresa (solo Superadmin) |
| **Sedes** | Gestionar sucursales o sedes adicionales de la empresa |

#### Sedes (Sucursales)

Desde la ficha de empresa se pueden crear y gestionar **sedes adicionales**. Cada trabajador puede vincularse a una sede específica, permitiendo segmentar reportes y cumplimiento por ubicación.

### 3.2 Gestión de Usuarios

**Ruta:** Administración Global → Usuarios (`/usuarios`)

#### Los 11 Roles del Sistema

| Rol | Descripción | Acceso |
|-----|-------------|--------|
| **Superadmin** | Proveedor SST Colombia — acceso total | Todo el sistema + todas las empresas |
| **Admin** | Administrador del proveedor SST | Gestión de empresas y facturación |
| **Soporte** | Equipo de soporte técnico | Panel de tickets y chat interno |
| **Empresa (empresa_admin)** | Administrador de la empresa cliente | Módulos PHVA + PESV de su empresa |
| **Responsable SST** | Encargado del SG-SST en la empresa | Módulos PHVA + PESV completos |
| **Vigía SST** | Para empresas con menos de 10 trabajadores | Módulos SST limitados |
| **Coordinador PESV** | Coordinador del Plan de Seguridad Vial | Módulos PESV |
| **Trabajador** | Empleado con acceso al portal | Solo Portal de Empleados |
| **Conductor** | Conductor de vehículos | Portal de Empleados + sección PESV |
| **LSO Externo** | Profesional licenciado externo | Portal del Licenciado |
| **Asistente SST** | Auxiliar del área SST | Módulos SST con permisos limitados |

#### Crear Usuario

**Ruta:** Usuarios → Nuevo Usuario

Campos obligatorios: username, contraseña, rol, empresa vinculada.

> **Nota:** Los usuarios tipo "Trabajador" y "Conductor" se crean desde el módulo de Gestión de Accesos del Portal de Empleados, no desde este menú.

### 3.3 Portal de Empleados (Panel Admin)

**Ruta:** Administración Global → Portal de Empleados (`/portal-empleados`)

Panel administrativo con 3 pestañas:

1. **Vista General:** Estadísticas de acceso y últimos reportes enviados por empleados
2. **Gestión de Accesos:** Crear o revocar acceso al portal para trabajadores (uno por uno o todos en bloque, requiere que el trabajador tenga email registrado)
3. **Historial de Accesos:** Log de cuándo cada trabajador ingresó al portal

### 3.4 Panel de Facturación

**Ruta:** Administración Global → Panel de Facturación (`/dashboard-facturacion`)

Dashboard con métricas de facturación, suscripciones activas, ingresos y próximas renovaciones.

### 3.5 Mi Cuenta / Suscripción

**Ruta:** Administración Global → Mi Cuenta (`/mi-cuenta`)

Desde aquí se puede:
- Ver y actualizar datos de la empresa
- Ver el plan activo y el precio actual (se recalcula automáticamente según número de trabajadores y vehículos)
- Ver historial de facturas
- Cambiar método de pago (Stripe)
- Descargar facturas en PDF

> **Precio dinámico:** El sistema calcula el precio automáticamente según el número de trabajadores activos, vehículos y el nivel de riesgo ARL de la empresa.

### 3.6 Profesionales Licenciados (LSO)

**Ruta:** Administración Global → Profesionales Licenciados (`/profesionales-licenciados`)

Directorio de todos los profesionales LSO registrados. Permite:
- Registrar nuevos LSO con sus datos de licencia
- Ver vigencia de licencias (calculada automáticamente)
- Asignar LSO a empresas
- Ver empresas actualmente bajo su responsabilidad

### 3.7 Tickets de Soporte

**Ruta:** Administración Global → Tickets de Soporte (`/tickets-soporte`)

Sistema para reportar problemas o solicitar ayuda. El equipo de soporte responde en un máximo de 24 horas.

### 3.8 Alertas de Cumplimiento (Sistema Automático)

El sistema ejecuta automáticamente verificaciones periódicas y genera **alertas de cumplimiento** para:
- **Lunes:** Estándares 0312 incompletos
- **Mensual:** Evaluación anual pendiente de crear
- **Diario:** Acciones del plan de mejoramiento vencidas
- **Lunes:** Empresas sin evaluación iniciada

Cada alerta genera una notificación COPASST y envía email al administrador.

---

## 4. Módulo PLANEAR

> **Recuerde:** Todo parte de la Evaluación Inicial. Primero registre trabajadores, luego cree la evaluación y desde ahí gestione todo el SG-SST.

### 4.1 Trabajadores

**Ruta:** Planear → Trabajadores (`/trabajadores`)

**Único módulo que se gestiona FUERA de la Evaluación Inicial.**

#### Registrar Trabajador Individualmente

Clic en "Agregar Trabajador" → completar:
- Documento (cédula, pasaporte, etc.)
- Nombres y apellidos completos
- Fecha de nacimiento y sexo
- Email (requerido para acceso al portal)
- Cargo, área, tipo de contrato
- Fecha de ingreso
- Estado: **Activo / Retirado / Vacaciones / Incapacitado**

> **Estado Retirado:** Al retirar un trabajador, el sistema ajusta automáticamente los trabajadores activos del plan de suscripción (puede reducir el precio mensual).

#### Importar Trabajadores desde Excel

1. Clic en "Importar Excel" → "Descargar Plantilla"
2. Llenar la plantilla con los datos (el sistema tolera variaciones en nombres de columnas)
3. Subir el archivo .xlsx
4. El sistema valida los datos y muestra los registros importados

#### Gestión de Sedes por Trabajador

Cada trabajador puede vincularse a una sede específica de la empresa para segmentar reportes.

### 4.2 Evaluación Inicial SST (Centro del Sistema)

**Ruta:** Planear → Gestión Integral → Evaluación Inicial (`/evaluaciones-sst`)

La Evaluación Inicial es el **núcleo del SG-SST**. Todo el cumplimiento se gestiona desde aquí.

#### Crear una Nueva Evaluación

1. Clic "Nueva Evaluación" → seleccionar año
2. El sistema detecta automáticamente el capítulo de la empresa (I, II o III) y carga los estándares aplicables
3. Cada estándar muestra su estado: **Cumple / No Cumple / No Aplica / Justifica No Cumplimiento**

#### Completar Estándares

Para cada estándar:
1. Hacer clic en el estándar → se abre el modo de verificación
2. Ver las evidencias requeridas y preguntas de verificación
3. Clic en "Ir al módulo" → navega al módulo correspondiente
4. Registrar la actividad en el módulo
5. El estándar se actualiza automáticamente

#### Generar PDF Ministerio del Trabajo

Botón "PDF Ministerio del Trabajo" → genera el informe oficial con el **sistema de trazabilidad "Hilo Dorado"** que vincula cada estándar con sus evidencias.

### 4.3 Designación de Responsables

**Ruta:** Planear → Designación de Responsable (`/designacion-responsable`)
**Estándar:** 1.1.1 (4 puntos)

#### Flujo para Asignar el Responsable del SG-SST

**Paso 1 — Asignar LSO a la empresa:**
- Administración Global → Empresas → editar empresa → "Encontrar Profesionales Certificados"
- Seleccionar el LSO del directorio (debe estar registrado en Profesionales Licenciados)

**Paso 2 — Crear la Designación:**
- Desde el Estándar 1.1.1 → "Ir a Designación de Responsables" → "+Nueva Designación"
- El sistema detecta el LSO asignado y pre-llena automáticamente: nombre, cédula, licencia, vigencia, formación, curso 50h
- Seleccionar cargo y confirmar → Guardar
- Generar el Acta de Designación en PDF desde la columna de acciones

#### Tipos de Designación

| Cargo | Descripción |
|-------|-------------|
| Responsable del SG-SST | Designación principal (estándar 1.1.1) |
| Coordinador SST | Coordinador de área |
| Responsable del Plan de Emergencias | Líder de brigadas |
| Líder del PESV | Coordinador del plan vial |

### 4.4 Políticas SST

**Ruta:** Planear → Políticas SST (`/politicas-sst`)
**Estándar:** 2.1.1 (2 puntos)

Redactar y gestionar la Política de Seguridad y Salud en el Trabajo. Debe incluir compromiso con la seguridad, mejora continua, cumplimiento legal y participación de trabajadores. El sistema genera el PDF firmado.

### 4.5 Asignación de Recursos

**Ruta:** Planear → Asignación de Recursos (`/asignacion-recursos`)
**Estándar:** 1.1.3 (4 puntos)

Registrar el presupuesto y recursos (financieros, técnicos, humanos) asignados al SG-SST para el año.

### 4.6 COPASST / Vigía SST

**Ruta:** Planear → COPASST (`/copasst`)
**Estándar:** 1.1.6 (2 puntos)

#### El módulo tiene 4 pestañas:

**1. Período Vigente**
- Clic "Nuevo Período" → tipo (COPASST para ≥10 trabajadores / Vigía SST para <10)
- Fechas de inicio y fin (período de 2 años)
- Guardar

**2. Proceso Electoral**
Los trabajadores participan desde el **Portal de Empleados** (Participación → Elecciones COPASST):
- Postularse como candidatos (fase Inscripción)
- Votar por representantes (fase Votación)
- El empleador designa directamente sus representantes

**3. Miembros**
Una vez completado el proceso, los integrantes quedan registrados (2 del empleador + 2 de trabajadores para COPASST; 1 Vigía para empresas pequeñas).

**4. Actas Mensuales**
Registrar las reuniones mensuales obligatorias del COPASST. El sistema genera el Acta de Constitución en PDF.

### 4.7 Comité de Convivencia Laboral

**Ruta:** Planear → Comité de Convivencia (`/comite-convivencia-actas`)
**Estándar:** 1.1.8 (2 puntos) — Obligatorio para empresas con ≥10 trabajadores

#### El módulo tiene 4 pestañas con 5 fases electorales:

**Proceso Electoral:** Convocatoria → Inscripción → Votación (desde Portal de Empleados) → Escrutinio → Completada

El empleador designa directamente sus 2 representantes. Los trabajadores eligen sus 2 representantes votando desde el portal.

**Actas:** Reuniones bimestrales obligatorias. El sistema genera actas con firma del presidente y secretario.

### 4.8 Programa de Capacitación Anual

**Ruta:** Planear → Programa de Capacitación Anual (`/programa-capacitacion-anual`)
**Estándar:** 1.2.1 (2 puntos)

Cronograma anual de capacitaciones planificadas. Se actualiza automáticamente conforme se ejecutan.

### 4.9 Objetivos SST

**Ruta:** Planear → Objetivos SST (`/objetivos-sst`)
**Estándar:** 2.2.1 (1 punto)

Definir objetivos SMART con indicadores de medición, metas cuantitativas, responsable y plazo. El sistema hace seguimiento automático del avance.

### 4.10 Matriz Legal

**Ruta:** Planear → Matriz Legal (`/matriz-legal`)
**Estándar:** 2.7.1 (1 punto)

El sistema incluye la legislación SST aplicable vigente. Las siguientes normas se sincronizan automáticamente:
- Resolución 2346/2007 Art. 4-5 (Profesiograma)
- Decreto 1072/2015 Art. 2.2.4.6.8 (Organigrama SST)
- Resolución 2646/2008 Art. 8 (Perfil Sociodemográfico)

### 4.11 Perfiles de Cargo

**Ruta:** Planear → Perfiles de Cargo (`/perfiles-cargo`)

Define cada puesto de trabajo con funciones, clase de riesgo, factores de riesgo, EPP requeridos y exámenes necesarios. Al crear un nuevo usuario/trabajador y seleccionar un perfil, los campos se auto-completan.

### 4.12 Afiliaciones SSSS

**Ruta:** Planear → Afiliaciones SSSS (`/afiliaciones-ssss`)
**Estándar:** 1.1.4 (4 puntos)

Gestión de afiliaciones de trabajadores a EPS, AFP, ARL y Caja de Compensación Familiar.

### 4.13 Partes Interesadas y Contexto

- **Partes Interesadas** → `/partes-interesadas`: Identificación de stakeholders del SG-SST
- **Análisis de Contexto** → `/analisis-contexto`: Contexto organizacional para SST
- **Plan de Mejoramiento Contexto** → `/plan-mejoramiento-contexto`

### 4.14 Conservación de Documentos

**Ruta:** Planear → Conservación de Documentos (`/conservacion-documentos`)
**Estándar:** 2.5.1 (2 puntos)

La plataforma conserva automáticamente todos los documentos del SG-SST (Decreto 1072/2015 exige mínimo 20 años).

### 4.15 Perfil Sociodemográfico

**Ruta:** Planear → Perfil Sociodemográfico (`/perfil-sociodemografico`)

Estadísticas sociodemográficas de los trabajadores. Cumple la Resolución 2646/2008 Art. 8.

### 4.16 Organigrama SST

**Ruta:** Planear → Organigrama SST (`/organigrama-sst`)

Visualización jerárquica automática de la estructura organizacional SST. Muestra:
- Representante legal (de los datos de la empresa)
- Integrantes del COPASST o Vigía SST (del período vigente)
- Brigadas de emergencia

Soporta impresión directa. Cumple el Decreto 1072/2015 Art. 2.2.4.6.8.

> **Nota:** El organigrama se genera automáticamente con los datos ya registrados — no requiere información adicional.

### 4.17 Planes de Trabajo Anual

**Ruta:** Planear → Planes de Trabajo Anual (`/planes-trabajo-anual`)
**Estándar:** 2.4.1 (2 puntos)

El sistema genera el plan basado en los estándares "No Cumple" de la evaluación. Incluye actividades, responsables, cronograma mensual y seguimiento de avance.

### 4.18 Asignar LSO Externo

**Ruta:** Planear → Asignar LSO Externo (`/asignar-lso-externo`)

Paso previo obligatorio antes de crear la designación de responsable. Permite vincular un LSO externo del directorio a la empresa.

---

## 5. Módulo HACER

### 5.1 Capacitaciones SST

**Ruta:** Hacer → Capacitaciones (`/capacitaciones`)
**Estándares:** 1.2.1 (programa anual), 1.2.2 (inducción/reinducción)

> **Importante:** Este módulo es para capacitaciones SST generales. Las capacitaciones de seguridad vial están en PESV → H02.

**Crear Nueva Capacitación:**
1. Desde Estándar 1.2.1 o 1.2.2 → "Ir al módulo" → "Nueva Capacitación"
2. Completar: tema, tipo (inducción / reinducción / capacitación / entrenamiento), fecha, instructor, duración, asistentes
3. El sistema genera los certificados automáticamente

**Conexión con Portal de Empleados:** Los trabajadores ven sus capacitaciones asignadas en Portal → Formación → "Capacitaciones".

### 5.2 Registros de Inducción

**Ruta:** Hacer → Registros de Inducción (`/registros-induccion`)
**Estándar:** 1.2.2 (2 puntos)

Registrar inducciones y reinducciones. Los trabajadores ven su historial en Portal → Formación → "Mis Inducciones". La plataforma también ofrece **Inducciones Virtuales** con cuestionarios interactivos que los trabajadores completan desde su portal.

### 5.3 Curso de 50 Horas

**Ruta:** Hacer → Curso 50 Horas (`/curso-50-horas`)
**Estándar:** 1.2.3 (2 puntos)

Registrar el curso virtual de 50 horas del SG-SST: nombre del responsable, institución, fecha y número de certificado.

### 5.4 Inspecciones

**Ruta:** Hacer → Inspecciones (`/inspecciones`)
**Estándar:** 4.2.4 (2.5 puntos)

Registrar inspecciones de seguridad (locativas, equipos, EPP, eléctrica, etc.) con hallazgos, clasificación (inmediato / corto plazo / largo plazo) y acciones correctivas con seguimiento automático.

### 5.5 Entrega de EPP

**Ruta:** Hacer → Entrega de EPP (`/entrega-epp`)
**Estándar:** 4.2.6 (2.5 puntos)

Registrar entrega de Elementos de Protección Personal: trabajador, tipo de EPP, referencia, cantidad, fecha y firma de recibido. El sistema genera el soporte y lleva historial por trabajador.

### 5.6 Accidentes e Incidentes

**Ruta:** Hacer → Accidentes (`/accidentes`)
**Estándares:** 3.2.1 (reporte), 3.2.2 (investigación), 3.2.3 (estadísticas)

**Registrar un Accidente:**
1. Desde Estándar 3.2.1 → "Ir al módulo" → "Nuevo Accidente"
2. Completar: tipo (AT / Incidente), trabajador, fecha y hora, lugar, descripción, parte del cuerpo, tipo de lesión, días de incapacidad, severidad y medidas inmediatas
3. Guardar → el indicador de accidentalidad se actualiza automáticamente

**Investigación:** Desde el estándar 3.2.2 → causas inmediatas (actos y condiciones inseguras), causas básicas, causa raíz, medidas correctivas. Plazo legal: AT graves o mortales dentro de los 15 días hábiles.

### 5.7 Exámenes Médicos Ocupacionales

**Ruta:** Hacer → Exámenes Médicos (`/examenes-medicos`)
**Estándar:** 3.1.4

Tipos: ingreso, periódico, egreso, post-incapacidad, cambio de cargo. Incluye concepto médico y alertas de vencimiento. **Los trabajadores ven sus resultados en Portal → Salud → "Mis Exámenes Médicos".**

### 5.8 IPERC — Matriz de Riesgos

**Ruta:** Hacer → IPERC (`/iperc`)
**Estándar:** 4.1.1 (15 puntos — el más importante)

Identificación de peligros, evaluación y valoración de riesgos según metodología GTC 45. Incluye: proceso/área, peligro, riesgo, controles existentes, evaluación (probabilidad × consecuencia) y medidas de control adicionales.

### 5.9 Plan de Emergencias

**Ruta:** Hacer → Plan de Emergencias (`/plan-emergencias`)
**Estándares:** 5.1.1, 5.1.2, 5.1.3

Incluye: análisis de amenazas, recursos disponibles, procedimientos de respuesta, brigadas de emergencia y simulacros. Se exige mínimo un simulacro al año.

### 5.10 COPASST — Gestión

**Ruta:** Hacer → COPASST Gestión (`/copasst-gestion`)

Gestión del Comité Paritario: períodos, proceso electoral, miembros y actas mensuales. (Ver detalle en sección 4.6)

### 5.11 Medidas Preventivas

**Ruta:** Hacer → Medidas Preventivas (`/medidas`)

Acciones preventivas y correctivas vinculadas a inspecciones, accidentes o auditorías.

### 5.12 Conservación Auditiva

**Ruta:** Hacer → Conservación Auditiva (`/conservacion-auditiva`)

Registro de audiometrías por trabajador con clasificación auditiva. **Los trabajadores ven sus audiometrías en Portal → Salud → "Mis Audiometrías".**

### 5.13 Vigilancia Epidemiológica

**Ruta:** Hacer → Vigilancia Epidemiológica (`/vigilancia-epidemiologica`)

Sistemas de vigilancia para enfermedades laborales, riesgo psicosocial y otras condiciones de salud.

### 5.14 Comunicación SST

**Ruta:** Hacer → Comunicación SST (`/comunicacion-sst`)
**Estándar:** 2.8.1 (1 punto)

**Flujo Admin → Trabajadores:** Crear comunicados (memorandos, circulares, alertas de seguridad) con destinatarios. Los trabajadores los ven en Portal → Comunicación → "Comunicaciones SST" y confirman lectura con un clic.

**Flujo Trabajadores → Admin:** Los trabajadores envían reportes de peligros o sugerencias desde el portal. El admin los ve en `/portal-empleados` → pestaña "Reportes" y puede responder.

### 5.15 Actividades de Promoción y Prevención

**Ruta:** Hacer → Actividades de Promoción y Prevención (`/actividades-promocion-prevencion`)

Registro de actividades de bienestar, prevención de enfermedades y estilos de vida saludable.

### 5.16 Evaluación de Proveedores

**Ruta:** Hacer → Evaluación de Proveedores (`/evaluacion-proveedores`)
**Estándar:** 2.10.1 — Requiere suscripción

Evaluar y calificar contratistas y proveedores en criterios SST (afiliaciones, capacitaciones, EPP, etc.).

### 5.17 Gestión de Cambios

**Ruta:** Hacer → Gestión de Cambios (`/gestion-cambios`)
**Estándar:** 2.11.1 — Requiere suscripción

Documentar cambios en procesos, equipos, instalaciones o personal con evaluación de impacto en SST.

### 5.18 Mediciones Ambientales

**Ruta:** Hacer → Mediciones Ambientales (`/mediciones-ambientales`)
**Estándar:** 4.1.4 — Requiere suscripción

Registro de mediciones de ruido, iluminación, temperatura, vibraciones con comparación frente a valores límite permisibles (TLV).

---

## 6. Módulo VERIFICAR

### 6.1 Indicadores de Accidentalidad

El sistema calcula automáticamente todos los indicadores con base en los accidentes registrados:

| Indicador | Fórmula | Ruta |
|-----------|---------|------|
| **Frecuencia (IF)** | (N° AT × 240.000) / HHT | `/indicador-frecuencia-severidad` |
| **Severidad (IS)** | (Días perdidos × 240.000) / HHT | `/indicador-frecuencia-severidad` |
| **ILI** | IF × IS / 1.000 | `/indicador-ili-incidentes` |
| **Mortalidad** | (N° muertes × 100.000) / N° trabajadores | `/indicador-mortalidad` |
| **Prevalencia EL** | Calculada automáticamente | `/indicador-prevalencia` |
| **Incidencia EL** | Calculada automáticamente | `/indicador-incidencia` |
| **Ausentismo** | Días perdidos por AT + EG + EL | `/indicador-ausentismo` |

### 6.2 Estándares SST

**Ruta:** Verificar → Estándares SST (`/estandares-sst`)

Cumplimiento por estándar de la Resolución 0312/2019 con porcentaje de avance y semáforo de criticidad:

| Calificación | Rango | Implicación |
|-------------|-------|-------------|
| **Crítico** | < 60% | Paralización de actividades |
| **Moderadamente aceptable** | 60-85% | Plan de mejora en 6 meses |
| **Aceptable** | > 85% | Mantener y mejorar |

### 6.3 Evaluaciones SST

**Ruta:** Verificar → Evaluaciones SST (`/evaluaciones-sst`)

Historial de evaluaciones anuales con porcentaje de cumplimiento y plan de mejoramiento vinculado.

### 6.4 Auditorías Internas

**Ruta:** Verificar → Auditorías Internas (`/auditorias-internas`)
**Estándar:** 6.1.2 — Requiere suscripción

Auditoría anual con criterios pre-cargados, hallazgos, no conformidades y plan de acción. El auditor no puede auditar su propio trabajo.

### 6.5 Recomendaciones ARL

**Ruta:** Verificar → Recomendaciones ARL (`/recomendaciones-arl`)

Seguimiento a recomendaciones recibidas de la Administradora de Riesgos Laborales.

---

## 7. Módulo ACTUAR

### 7.1 Revisiones por la Dirección

**Ruta:** Actuar → Revisiones por la Dirección (`/revisiones-direccion`)
**Estándar:** 6.1.3 — Requiere suscripción

Actas de revisión anual por la alta dirección con análisis de indicadores, auditorías, recursos SST, conclusiones y compromisos de mejora.

### 7.2 Plan de Mejoramiento

**Ruta:** Actuar → Plan de Mejoramiento (`/plan-mejoramiento`)
**Estándar:** 7.1.1 a 7.1.4

Consolida todas las acciones correctivas, preventivas y de mejora provenientes de auditorías, investigación de accidentes, revisiones por la dirección e inspecciones. El sistema hace seguimiento automático del cierre.

### 7.3 Ausentismo Laboral

**Ruta:** Actuar → Ausentismo Laboral (`/ausentismo-laboral`)

Análisis y seguimiento de ausentismo por categoría (AT, enfermedad general, enfermedad laboral).

---

## 8. Módulo PESV (Plan Estratégico de Seguridad Vial)

**Solo disponible si la empresa tiene vehículos** (numberOfVehicles > 0). Requiere suscripción.

**Base legal:** Resolución 40595/2022 del Ministerio de Transporte.

### 8.1 ¿Cuándo es Obligatorio el PESV?

La empresa debe implementar PESV si cumple **al menos una** de estas condiciones:
- Tiene 1 o más vehículos propios, arrendados o en intermediación
- Tiene trabajadores con misión de conducir

El módulo PESV se activa automáticamente cuando se registran vehículos en la empresa.

### 8.2 Cómo Iniciar el PESV

**Paso 1:** Pestaña **PESV** → "Evaluaciones PESV" → `/pesv/evaluaciones`

**Paso 2:** Clic "Nueva Evaluación" → el sistema determina automáticamente el **nivel de complejidad:**

| Nivel | Vehículos/Conductores | Pasos activos |
|-------|----------------------|---------------|
| **Básico** | ≤10 | 20 pasos (H07, H08, H09, V03 no aplican) |
| **Estándar** | 11-50 | 24 pasos |
| **Avanzado** | >50 | 24 pasos |

**Paso 3:** Clic en la evaluación → 4 pestañas: Planear | Hacer | Verificar | Actuar

**Paso 4:** Clic en cada paso → panel lateral con descripción, estado, evidencias y botón **"Ir al módulo"**

### 8.3 Los 24 Pasos del PESV

#### FASE PLANEAR (P01-P08)

**P01 — Conformación del Equipo de Trabajo** (Comité PESV)
- Ruta módulo: `/pesv/evaluacion/:id/comite`
- **Pestaña Integrantes:** Conformar el equipo PESV con roles según Res. 40595/2022

**Cómo agregar integrantes:**
1. Clic "Agregar Integrante"
2. Seleccionar rol en el equipo (Líder PESV, Presidente, Secretario, Representante de trabajadores, etc.)
3. Al seleccionar el rol, el campo "Funciones y Responsabilidades" se auto-completa

**Función especial — Asignar LSO del SG-SST como Líder PESV:**
> Si la empresa ya tiene un LSO designado como Responsable del SG-SST, al seleccionar el rol **"Líder PESV"** aparece un **banner azul** automático:
> *"LSO asignado al SG-SST detectado — [Nombre] · Lic. [Número] · [Cargo]"*
>
> **Opciones:**
> - Clic **"Sí, usar LSO asignado"** → nombre y cargo se pre-llenan automáticamente → solo falta confirmar y clic "Agregar"
> - Clic "No, ingresar manualmente" → campos en blanco para digitar
>
> **Requisito previo:** La empresa debe tener una designación SST activa en Planear → Designación de Responsables.

- **Pestaña Cronograma:** Planificar reuniones del comité

| P02 | Política de Seguridad Vial / Liderazgo | `/pesv/evaluacion/:id/liderazgo` |
|-----|---------------------------------------|--------------------------------|
| P03 | Diagnóstico / Contexto Organizacional | `/pesv/evaluacion/:id/contexto-organizacional` |
| P04 | Matriz de Riesgos Viales | `/pesv/evaluacion/:id/matriz-riesgos` |
| P05 | Objetivos e Indicadores | Panel del paso en la evaluación |
| P06 | Programas y Planes / Factores de Desempeño | `/pesv/evaluacion/:id/factores-desempeno` |
| P07 | Roles y Responsabilidades | Panel del paso en la evaluación |
| P08 | Recursos | Panel del paso en la evaluación |

#### FASE HACER (H01-H11)

| Paso | Módulo | Descripción |
|------|--------|-------------|
| **H01** | Conductores | Registro de conductores, licencias, exámenes médicos de aptitud |
| **H02** | Capacitaciones PESV | Capacitaciones de seguridad vial (plantillas pre-llenadas disponibles) |
| **H03** | Documentación y Comparendos | Seguimiento de licencias + registro de infracciones de tránsito por conductor |
| **H04** | Vehículos Seguros | Inventario de vehículos, SOAT, tecnomecánica, alertas de vencimiento |
| **H05** | Mantenimiento Vehicular | Mantenimiento preventivo y correctivo de vehículos |
| **H06** | Inspecciones Preoperacionales | Lista de chequeo diaria de 16 ítems (conductores pueden completarla desde portal) |
| **H06-ENC** | Encuesta Diaria del Conductor | Auto-reporte de aptitud antes de cada jornada (Art. 18, Res. 40595/2022) |
| **H07** ⭐ | Gestión de la Velocidad | Registro GPS, alertas de exceso de velocidad *(no aplica a nivel Básico)* |
| **H08** ⭐ | Rutas Seguras | Análisis de rutas, puntos críticos, medidas de control *(no aplica a nivel Básico)* |
| **H09** ⭐ | Fatiga y Somnolencia | Control de jornadas, pausas activas, vigilancia de somnolencia *(no aplica a nivel Básico)* |
| **H10** | Alcohol y Sustancias | Pruebas de alcoholimetría, política de cero tolerancia |
| **H11** | Atención a Víctimas | Protocolo de atención a víctimas de siniestros |

⭐ Solo aplica a niveles Estándar y Avanzado.

**H06 e H06-ENC — Flujo desde Portal de Empleados:**
- Conductor → Portal → PESV → "Inspección Vehículo": completa los 16 ítems y envía
- Conductor → Portal → PESV → "Encuesta Diaria": completa los campos de aptitud y envía
- Los registros aparecen instantáneamente en el módulo del admin

#### FASE VERIFICAR (V01-V03)

| Paso | Módulo | Descripción |
|------|--------|-------------|
| **V01** | Indicadores de Gestión | KPIs viales calculados automáticamente |
| **V02** | Registro y Análisis de Siniestros | Siniestros viales con análisis de causas |
| **V03** ⭐ | Auditoría del PESV | Evaluación del cumplimiento de los 24 pasos *(no aplica a nivel Básico)* |

#### FASE ACTUAR (A01-A02)

| Paso | Descripción |
|------|-------------|
| **A01** | Mejora Continua: acciones preventivas y correctivas derivadas de siniestros, auditorías e indicadores |
| **A02** | Revisión por la Alta Dirección: análisis anual de resultados y compromisos para el siguiente período |

### 8.4 Porcentaje de Cumplimiento PESV

El sistema calcula automáticamente el porcentaje de cumplimiento basado en cuántos pasos están en estado "Cumple". Se puede generar el **PDF ISO 39001:2012** (botón naranja en la evaluación) con el alineamiento de los 24 pasos.

### 8.5 Comparendos de Conductores

Desde la lista de conductores (H03), el ícono ⚠️ en la columna Acciones abre el panel de comparendos de ese conductor. Para registrar una infracción:
1. Seleccionar vehículo/placa del desplegable
2. Fecha, tipo de infracción, estado, valor en COP (opcional)
3. Clic "Registrar comparendo"

**Requisito:** Los vehículos deben estar registrados en H04 para que aparezcan en el selector.

---

## 9. Portal de Empleados

El Portal de Empleados es la interfaz que ven los trabajadores cuando inician sesión. Acceden con sus credenciales a `/portal-empleados`.

### 9.1 Secciones del Portal

#### Mi Cuenta
- **Mi Contrato:** Ver el contrato laboral activo vigente
- **Mi Perfil:** Ver y actualizar información personal
- **Mi Foto de Carnet:** Subir o actualizar foto
- **Cambiar Contraseña:** Cambiar la contraseña de acceso

#### Formación
- **Capacitaciones:** Ver capacitaciones SST asignadas (pendientes e historial)
- **Mis Inducciones:** Historial de inducciones y reinducciones recibidas
- **Inducciones Virtuales:** Completar módulos de inducción en línea con cuestionarios interactivos

#### Comunicación
- **Comunicaciones SST:** Ver comunicados emitidos por el área SST y confirmar lectura con un clic
- **Reportar Inquietud, Peligro o Sugerencia:** Enviar reportes (peligro / sugerencia / queja / consulta / anónimo)
- **Mis Reportes:** Historial de reportes enviados y respuestas del equipo SST

#### Participación
- **Elecciones COPASST:** Postularse como candidato y/o votar durante el proceso electoral activo
- **Elecciones Convivencia:** Participar en la elección del Comité de Convivencia

#### Salud
- **Mis Exámenes Médicos:** Ver exámenes programados e historial de realizados con concepto de aptitud
- **Mis Audiometrías:** Ver audiometrías programadas e historial de realizadas con clasificación auditiva

#### PESV *(solo para usuarios con rol "conductor")*
- **Comité de Seguridad Vial:** Información del comité PESV de la empresa
- **Capacitaciones PESV:** Capacitaciones de seguridad vial
- **Encuesta Diaria:** Auto-reporte de aptitud antes de cada jornada (Art. 18, Res. 40595/2022)
- **Inspección Vehículo:** Lista de chequeo preoperacional de 16 ítems

### 9.2 Cómo Crear Acceso para un Trabajador

1. Ir a Administración Global → Portal de Empleados
2. Pestaña "Gestión de Accesos"
3. Buscar el trabajador (debe tener email registrado en Trabajadores)
4. Clic "Dar acceso" → el sistema crea las credenciales y envía email de bienvenida
5. También se puede dar acceso a todos en bloque con "Dar acceso masivo"

---

## 10. Portal del Licenciado (LSO)

Los profesionales LSO externos acceden al sistema con su rol `lso_externo` y ven un portal especializado en `/portal-licenciado`.

### 10.1 Funcionalidades del Portal LSO

#### Company Vault (Bóveda de Empresas)
Navegación en dos niveles:
1. **Lista de empresas asignadas:** Vista de tarjetas con datos clave y estado de cumplimiento
2. **Detalle de empresa:** Acceso a evaluaciones, estándares, accidentes, capacitaciones e inspecciones (solo lectura)

#### Panel PHVA
Dashboard consolidado con el estado del ciclo PHVA de cada empresa asignada.

#### Firma Digital LSO
Los LSO pueden firmar digitalmente los 5 tipos de documentos que requieren firma profesional obligatoria según la normativa.

#### Tickets de Soporte
Los LSO pueden crear tickets de soporte directamente desde su portal.

---

## 11. Roles y Permisos

### Matriz de Acceso por Rol

| Módulo | Superadmin | Admin/Empresa | Resp. SST | Vigía SST | LSO | Trabajador | Conductor |
|--------|:----------:|:-------------:|:---------:|:---------:|:---:|:----------:|:---------:|
| Administración Global | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Planear (todos) | ✅ | ✅ | ✅ | Parcial | Solo lectura | ❌ | ❌ |
| Hacer (todos) | ✅ | ✅ | ✅ | Parcial | Solo lectura | ❌ | ❌ |
| Verificar (todos) | ✅ | ✅ | ✅ | Parcial | Solo lectura | ❌ | ❌ |
| Actuar (todos) | ✅ | ✅ | ✅ | Parcial | Solo lectura | ❌ | ❌ |
| PESV (todos) | ✅ | ✅ | ✅ | ❌ | Solo lectura | ❌ | ❌ |
| Portal de Empleados | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Portal Licenciado | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| PESV Encuesta/Inspección | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

✅ Acceso completo | Solo lectura = Ver sin editar | Parcial = Algunos módulos | ❌ Sin acceso

---

## 12. Suscripción y Facturación

### Modelo de Precio Dinámico

El precio se calcula automáticamente según:
- **Número de trabajadores activos** (los retirados no cuentan)
- **Número de vehículos** registrados
- **Nivel de riesgo ARL** de la empresa (según CIIU)
- **Cupones o promociones** aplicadas

### Gestionar la Suscripción

**Ruta:** Administración Global → Mi Cuenta → sección "Suscripción"

Desde aquí se puede:
- Ver el plan y precio actual
- Actualizar método de pago (Stripe)
- Ver y descargar facturas
- Aplicar cupones de descuento

### Descuentos por Número de Trabajadores

Al retirar trabajadores, el sistema reduce automáticamente el número de trabajadores activos. Si la reducción es significativa, el precio mensual disminuye en la próxima renovación.

---

## 13. Soporte y Ayuda

### Asistente Virtual (Chatbot)

Disponible 24/7 desde el ícono de chat en la esquina inferior derecha. Responde preguntas sobre:
- Uso de cada módulo de la plataforma
- Normativa SST colombiana
- Ciclo PHVA y Resolución 0312/2019
- PESV (Resolución 40595/2022)
- Pasos exactos para completar cualquier estándar

### Tickets de Soporte

**Ruta:** Administración Global → Tickets de Soporte

Para reportar problemas técnicos o solicitar ayuda especializada.

**Tiempos de respuesta:**
- Incidencias críticas (sistema caído): 2 horas
- Incidencias altas (módulo no funcional): 4 horas
- Consultas y mejoras: 24-48 horas

### Videos de Ayuda

**Ruta:** Administración Global → Videos de Ayuda

Tutoriales en video disponibles para los módulos más utilizados.

### Ícono de Ayuda (❓) en cada módulo

Cada módulo tiene un botón de ayuda que muestra videos tutoriales específicos para ese módulo.

---

## 14. Preguntas Frecuentes

### Navegación y Configuración

**¿Dónde está el menú de Configuración?**
No existe una pestaña llamada "Configuración". Toda la administración (empresas, usuarios, facturación) está en la pestaña **Administración Global**.

**¿Por qué no veo el módulo PESV?**
El módulo PESV aparece solo cuando la empresa tiene al menos 1 vehículo registrado. Vaya a Administración Global → Empresas → edite su empresa y actualice el campo "Número de Vehículos".

**¿Por qué veo una pantalla de bienvenida al ingresar?**
Su empresa está en proceso de onboarding. Contacte a soporte para programar su sesión de inducción y activar el acceso completo.

### Evaluación Inicial

**¿Cuántos estándares me aplican?**
- Microempresa (hasta 10 trabajadores, Riesgo I-III): 7 estándares
- Pequeña empresa (11-50, Riesgo I-III): 21 estándares
- Mediana/Grande (más de 50 o Riesgo IV-V): 61 estándares

El sistema lo calcula automáticamente.

**¿Puedo tener más de una evaluación por año?**
No. Se crea una evaluación por año. Si necesita actualizar datos, hágalo dentro de la evaluación existente.

**¿Cómo genero el informe para el Ministerio del Trabajo?**
Abra su Evaluación Inicial → busque el botón "PDF Ministerio del Trabajo" en la parte superior.

### Trabajadores

**¿Cómo doy acceso al Portal de Empleados a un trabajador?**
Administración Global → Portal de Empleados → pestaña "Gestión de Accesos" → buscar el trabajador → clic "Dar acceso". El trabajador debe tener email registrado.

**¿Qué pasa cuando retiro un trabajador?**
El estado cambia a "Retirado", deja de contar en el plan de suscripción, y el sistema puede reducir el precio mensual automáticamente.

### PESV

**¿Cómo asigno el LSO del SG-SST como Líder PESV?**
1. PESV → Evaluaciones PESV → abrir evaluación → paso P01 → "Ir al módulo"
2. Pestaña "Integrantes" → "Agregar Integrante"
3. En "Rol en el Equipo" seleccionar **"Líder PESV"**
4. Si hay LSO asignado en el SG-SST, aparece un **banner azul** automático con sus datos
5. Clic **"Sí, usar LSO asignado"** → nombre y cargo se llenan solos → "Agregar"

*Requisito previo: la empresa debe tener un LSO designado en Planear → Designación de Responsables.*

**¿Qué diferencia hay entre las Capacitaciones SST y las Capacitaciones PESV?**
Son módulos completamente separados:
- **Capacitaciones SST** (Estándares 1.2.1/1.2.2): temas generales de seguridad laboral. Se gestionan desde la Evaluación Inicial.
- **Capacitaciones PESV** (Paso H02): temas de seguridad vial (manejo defensivo, normativa de tránsito). Se gestionan solo desde la Evaluación PESV.

**¿Cómo registra un conductor la inspección preoperacional?**
El conductor inicia sesión en el Portal de Empleados → sección PESV → "Inspección Vehículo" → completa los 16 ítems → envía. El registro aparece instantáneamente en el módulo H06 del admin.

**¿Los pasos H07, H08 y H09 aplican a todas las empresas PESV?**
No. Estos pasos solo aplican a empresas con nivel **Estándar** (11-50 vehículos) o **Avanzado** (>50). Las empresas de nivel **Básico** (≤10 vehículos) no tienen estos pasos.

### Suscripción

**¿Cómo cambio el plan?**
Administración Global → Mi Cuenta → actualice el número de trabajadores o vehículos. El precio se recalcula automáticamente.

**¿Puedo aplicar un cupón de descuento?**
Sí. En el proceso de pago o en Administración Global → Mi Cuenta puede ingresar un código de cupón.

---

## 15. Glosario

| Término | Definición |
|---------|-----------|
| **ARL** | Administradora de Riesgos Laborales |
| **AT** | Accidente de Trabajo |
| **CIIU** | Clasificación Industrial Internacional Uniforme |
| **COPASST** | Comité Paritario de Seguridad y Salud en el Trabajo |
| **EL** | Enfermedad Laboral |
| **EPS** | Entidad Promotora de Salud |
| **EPP** | Elementos de Protección Personal |
| **GTC 45** | Guía Técnica Colombiana para identificación de peligros y valoración de riesgos |
| **HHT** | Horas-Hombre Trabajadas |
| **ILI** | Índice de Lesiones Incapacitantes |
| **IPERC** | Identificación de Peligros, Evaluación y Control de Riesgos |
| **IT** | Incidente de Trabajo |
| **LSO** | Licenciado en Salud Ocupacional |
| **PESV** | Plan Estratégico de Seguridad Vial |
| **PHVA** | Planear, Hacer, Verificar, Actuar (ciclo de mejora continua) |
| **SG-SST** | Sistema de Gestión de Seguridad y Salud en el Trabajo |
| **SOAT** | Seguro Obligatorio de Accidentes de Tránsito |
| **SST** | Seguridad y Salud en el Trabajo |
| **TLV** | Threshold Limit Value (valor límite permisible de exposición) |
| **Vigía SST** | Figura equivalente al COPASST para empresas con menos de 10 trabajadores |

---

<!-- INICIO-CHANGELOG -->

## 16. Historial de Versiones

> Esta sección se genera automáticamente desde `docs/changelog.json`.
> Para agregar cambios, edita ese archivo y ejecuta `npx tsx scripts/generate-manual.ts`.

### v4.0.0 — 11 de junio de 2026

#### Nueva funcionalidad

**PESV P01 — Comité PESV** — Sugerencia automática de LSO como Líder PESV
Al seleccionar el rol 'Líder PESV' en el formulario de integrantes del comité PESV, el sistema detecta automáticamente el LSO designado en el SG-SST y lo sugiere mediante un banner azul. El usuario puede aceptar (auto-rellena nombre y cargo) o ingresar datos manualmente.
*Ruta:* `/pesv/evaluacion/:id/comite`
*Fase:* PESV - Planear

**Organigrama SST** — Módulo de Organigrama SST visual
Visualización jerárquica automática de la estructura SST de la empresa. Muestra representante legal, integrantes del COPASST/Vigía y brigadas de emergencia. Generado automáticamente desde los datos ya existentes. Incluye soporte de impresión.
*Ruta:* `/organigrama-sst`
*Fase:* Planear

**Perfil Sociodemográfico** — Módulo de Perfil Sociodemográfico
Estadísticas sociodemográficas de la fuerza laboral. Cumple Resolución 2646/2008 Art. 8. Incluye distribución por edad, género, escolaridad, estado civil y antigüedad.
*Ruta:* `/perfil-sociodemografico`
*Fase:* Planear

#### Mejora

**Matriz Legal** — Tres nuevas normas sincronizadas automáticamente
Se agregaron automáticamente a la Matriz Legal de todas las empresas: Resolución 2346/2007 Art. 4-5 (Profesiograma), Decreto 1072/2015 Art. 2.2.4.6.8 (Organigrama SST), Resolución 2646/2008 Art. 8 (Perfil Sociodemográfico).
*Ruta:* `/matriz-legal`
*Fase:* Planear

**Chatbot / Asistente Virtual** — Base de conocimiento actualizada con instrucciones de LSO → Líder PESV
El asistente ahora responde correctamente cómo asignar el LSO del SG-SST como Líder PESV, incluyendo el flujo del banner azul y los requisitos previos.
*Fase:* Global

**Manual de Usuario** — Manual actualizado a v4.0.0
Reescritura completa del manual: 11 roles, 24 pasos PESV, navegación correcta (Administración Global), Portal de Empleados con 6 secciones, Portal del Licenciado, Onboarding Gate, sistema de alertas de cumplimiento, organigrama SST y todos los módulos actuales.
*Fase:* Documentación

---

### v3.9.0 — 1 de mayo de 2026

#### Nueva funcionalidad

**Alertas de Cumplimiento** — Sistema automático de alertas de cumplimiento SST
Cron jobs automáticos que generan 4 tipos de alertas: estándares 0312 incompletos (lunes), evaluación anual pendiente (mensual), acciones del plan vencidas (diario), empresas sin evaluación iniciada (lunes). Cada alerta crea notificación COPASST y envía email al admin. Trigger manual disponible para superadmin.
*Ruta:* `POST /api/admin/trigger-compliance-alerts`
*Fase:* Global

**Chat Interno de Soporte** — Rediseño del chat interno con tema dark Slack-style
Chat de coordinación interna para el equipo de soporte rediseñado con fondo slate-800, canal activo resaltado en azul, soporte de @menciones, indicadores de no leído y carga de archivos/imágenes.
*Fase:* Soporte

**PESV Evaluaciones — Company Vault** — Patrón Company Vault en la página de Evaluaciones PESV
Para superadmin, la página de evaluaciones PESV ahora muestra una cuadrícula de tarjetas por empresa con el último puntaje de cumplimiento y nivel PESV. Clic en una empresa despliega sus evaluaciones con filtro por año. Los usuarios no-superadmin siguen viendo solo sus propias evaluaciones.
*Ruta:* `/pesv/evaluaciones`
*Fase:* PESV

#### Mejora

**Stripe / Facturación** — Corrección de montos en notificaciones de pago y renovaciones
Corregido el monto que aparecía en los webhooks de Stripe (dividir entre 100 para convertir de centavos a pesos). Agregadas notificaciones de renovación en eventos invoice.paid de tipo subscription_cycle.
*Fase:* Facturación

---

### v3.8.0 — 1 de abril de 2026

#### Nueva funcionalidad

**Onboarding Gate** — Sistema de bloqueo de onboarding para empresas nuevas
Las empresas nuevas ven una pantalla completa de bienvenida (WelcomeGate) bloqueando el acceso hasta que el superadmin marque la inducción como completada. Los roles superadmin, soporte, lso y lso_externo bypass la puerta automáticamente.
*Ruta:* `PATCH /api/companies/:id/complete-onboarding`
*Fase:* Global

**Portal del Licenciado (LSO)** — Portal especializado para LSO externos con Company Vault
Los profesionales LSO externos acceden a un portal dedicado con navegación de dos niveles: lista de empresas asignadas → detalle de empresa. Panel PHVA consolidado. Firma digital en 5 tipos de documentos. Creación de tickets de soporte desde el portal.
*Ruta:* `/portal-licenciado`
*Fase:* Portal LSO

**Portal de Empleados** — Sección PESV para conductores en Portal de Empleados
Los usuarios con rol conductor tienen una sección PESV en su portal: comité de seguridad vial, capacitaciones PESV, encuesta diaria de aptitud (Art. 18 Res. 40595/2022) e inspección preoperacional de 16 ítems. Los registros aparecen en tiempo real en el panel del admin.
*Ruta:* `/portal-empleados`
*Fase:* Portal Empleados

---

<!-- FIN-CHANGELOG -->

*© 2026 SST Colombia — Sistema de Gestión de Seguridad y Salud en el Trabajo*  
*Versión 4.0.0 — Actualizado: Junio 2026*  
*Conforme a: Resolución 0312/2019 · Decreto 1072/2015 · ISO 45001:2018 · Resolución 40595/2022*
