# Manual de Usuario - Sistema SG-SST Colombia

**Versión:** 1.0  
**Fecha:** Enero 2025  
**Conforme a:** Resolución 0312/2019, Decreto 1072/2015, ISO 45001:2018

---

## Índice

1. [Introducción](#introducción)
2. [Primeros Pasos](#primeros-pasos)
3. [Configuración](#configuración)
4. [Planear](#planear)
5. [Hacer](#hacer)
6. [Verificar](#verificar)
7. [Actuar](#actuar)
8. [Portal de Empleados](#portal-de-empleados)
9. [Roles y Permisos](#roles-y-permisos)
10. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## 1. Introducción

### ¿Qué es el Sistema SG-SST?

El Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST) es una plataforma digital integral diseñada específicamente para empresas colombianas que necesitan:

- ✅ Cumplir con la normatividad colombiana vigente
- ✅ Gestionar la seguridad y salud de sus trabajadores
- ✅ Implementar el ciclo PHVA (Planear-Hacer-Verificar-Actuar)
- ✅ Generar reportes de cumplimiento normativo
- ✅ Mantener trazabilidad completa de todas las actividades SST

### Marco Normativo

El sistema está diseñado para dar cumplimiento a:

- **Resolución 0312 de 2019:** Estándares mínimos del SG-SST
- **Decreto 1072 de 2015:** Decreto Único Reglamentario del Sector Trabajo
- **ISO 45001:2018:** Sistema de gestión de la seguridad y salud en el trabajo

### Arquitectura del Sistema

El sistema está organizado siguiendo el **Ciclo PHVA:**

1. **⚙️ Configuración:** Módulos base (empresas, usuarios, trabajadores)
2. **📋 Planear:** Identificación y planificación de riesgos
3. **🛠️ Hacer:** Implementación y ejecución de controles
4. **✅ Verificar:** Monitoreo, medición y evaluación
5. **🔄 Actuar:** Mejora continua del sistema

---

## 2. Primeros Pasos

### 2.1 Acceso al Sistema

**URL de acceso:** `https://tu-dominio.replit.app`

**Credenciales iniciales (administrador):**
- Usuario: `admin`
- Contraseña: `admin123`

> ⚠️ **IMPORTANTE:** Cambia la contraseña por defecto inmediatamente después del primer inicio de sesión.

### 2.2 Navegación Principal

El sistema utiliza una **navegación horizontal por pestañas PHVA** en la parte superior:

```
[Configuración ▼] [Planear ▼] [Hacer ▼] [Verificar ▼] [Actuar ▼]
```

Cada pestaña despliega un menú con los módulos correspondientes.

### 2.3 Interfaz de Usuario

**Elementos principales:**
- **Header verde:** Navegación PHVA, usuario actual, ayuda, tema, logout
- **Barra de información:** Nombre de usuario y fecha/hora actual
- **Área de contenido:** Muestra el módulo seleccionado
- **Botón de Ayuda (📖):** Acceso rápido a documentación y soporte

---

## 3. Configuración

### 3.1 Gestión de Empresas

#### ¿Qué es una Empresa en el Sistema?

Una empresa representa una organización cliente que implementará el SG-SST. El sistema es **multi-empresa**, permitiendo gestionar múltiples organizaciones desde una sola instalación.

#### Crear una Nueva Empresa

**Ruta:** Configuración → Empresas → + Nueva Empresa

**Campos obligatorios:**
- **NIT:** Número de Identificación Tributaria (único)
- **Razón Social:** Nombre legal de la empresa
- **Número de Empleados:** Cantidad de trabajadores actuales
- **Actividad Económica:** CIIU de la empresa
- **Dirección, Ciudad, Teléfono, Email**

**Campos opcionales:**
- **Logo:** Imagen representativa (PNG, JPG, máx 5MB)
- **Información de vehículos:** Para determinar si requiere PESV
  - Vehículos propios
  - Vehículos arrendados/leasing
  - Vehículos en intermediación
  - Trabajadores con misión de conducir

#### Clasificación Automática

El sistema calcula automáticamente:

1. **Capítulo Normativo** (según Res. 0312/2019):
   - Menos de 10 empleados: Capítulo IV
   - 11-50 empleados: Capítulo III
   - Más de 50 empleados: Capítulo II

2. **Requisito PESV:**
   - Si tiene 1 o más vehículos → PESV Obligatorio
   - Si tiene trabajadores con misión de conducir → PESV Obligatorio

#### Subir Logo de Empresa

1. Editar empresa existente
2. Sección "Logo" → Seleccionar archivo
3. Formatos: PNG, JPG, JPEG, GIF (máx 5MB)
4. Recomendación: 200x200px, PNG con fondo transparente
5. Guardar cambios

> 💡 **Tip:** El logo aparecerá en reportes PDF generados por el sistema.

#### Editar/Eliminar Empresa

- **Editar:** Click en ícono de lápiz ✏️
- **Eliminar:** Click en ícono de basura 🗑️
  - ⚠️ Eliminará TODOS los datos asociados (trabajadores, contratos, etc.)
  - Desvinculará automáticamente a todos los usuarios

---

### 3.2 Gestión de Usuarios

#### ¿Qué es un Usuario?

Un usuario es una **cuenta de acceso al sistema** con credenciales (username/password) y un rol específico que determina sus permisos.

> 📌 **Diferencia clave:** Un trabajador NO necesita ser usuario a menos que requiera acceder al sistema.

#### Crear un Nuevo Usuario

**Ruta:** Configuración → Usuarios → + Nuevo Usuario

**Campos obligatorios:**
- **Username:** Nombre de usuario único (sin espacios)
- **Password:** Contraseña (mínimo 6 caracteres)
- **Rol:** Nivel de permisos (ver sección Roles)
- **Empresa:** Empresa a la que pertenece

**Campos opcionales:**
- **Trabajador Vinculado:** Si el usuario es también un trabajador

#### Roles Disponibles

| Rol | Permisos | Uso Recomendado |
|-----|----------|-----------------|
| **Administrador** | Acceso total, gestión multi-empresa | Propietario del sistema |
| **Coordinador SST** | Gestión completa de módulos SST | Líder SST de la empresa |
| **Responsable SST** | Gestión y supervisión SST | Responsable designado |
| **Analista SST** | Registro de actividades específicas | Auxiliar SST |
| **Consultor** | Solo lectura | Asesores externos |
| **Trabajador** | Solo Portal de Empleados | Empleados de la empresa |

#### Vincular Usuario a Trabajador

Para que un trabajador pueda acceder al Portal de Empleados:

1. Primero crear el trabajador en **Planear → Trabajadores**
2. Crear usuario con rol "Trabajador"
3. En el campo "Trabajador Vinculado", seleccionar el trabajador creado
4. El usuario verá automáticamente su contrato, perfil, comunicaciones, etc.

---

### 3.3 Portal de Empleados

**Acceso exclusivo para rol "Trabajador"**

Cuando un usuario con rol "Trabajador" inicia sesión:
- Es redirigido automáticamente a `/portal-empleados`
- Solo puede acceder a esta sección (no ve menús administrativos)
- Interfaz simplificada con header verde y 5 secciones

**Secciones del Portal:**

1. **Mi Contrato:** Información del contrato laboral activo
2. **Mi Perfil de Cargo:** Descripción, riesgos, EPP requeridos
3. **Comunicaciones:** Mensajes SST recibidos (con confirmación de lectura)
4. **Reportar:** Formulario para reportar peligros, sugerencias, quejas
5. **Mis Reportes:** Seguimiento de reportes enviados y respuestas

---

## 4. Planear

### 4.1 Trabajadores

#### Registrar Nuevo Trabajador

**Ruta:** Planear → Trabajadores → + Nuevo Trabajador

**Información Personal:**
- Tipo y número de documento
- Nombres y apellidos
- Fecha de nacimiento
- Sexo
- Contacto (email, teléfono, dirección)

**Información Laboral:**
- Fecha de ingreso
- Estado (Activo/Inactivo)
- Empresa

**Mejores Prácticas:**
- Crear trabajadores antes de los contratos
- Mantener información actualizada
- Usar estado "Inactivo" en lugar de eliminar

---

### 4.2 Perfiles de Cargo

#### ¿Qué es un Perfil de Cargo?

Es la **definición completa de un puesto de trabajo**, incluyendo:
- Descripción de funciones
- Clase de riesgo
- Demandas físicas y mentales
- Factores de riesgo
- EPP requeridos
- Exámenes médicos necesarios
- Capacitaciones requeridas

#### Crear Perfil de Cargo

**Ruta:** Planear → Perfiles de Cargo → + Nuevo Perfil

**Campos clave:**
- **Título:** Nombre del cargo (ej: "Operario de Producción")
- **Descripción:** Funciones y responsabilidades
- **Salario Base:** Remuneración típica
- **Clase de Riesgo:** I, II, III, IV o V

**Sección Exigencias:**
- Demandas físicas (esfuerzo, postura, movimientos)
- Demandas mentales (atención, toma de decisiones)
- Factores de riesgo (químicos, físicos, biológicos, etc.)

**Sección EPP y Requisitos:**
- Elementos de Protección Personal requeridos
- Exámenes médicos necesarios
- Capacitaciones obligatorias

> 💡 **Ventaja:** Al crear un contrato y seleccionar el perfil, todos estos campos se auto-completan.

---

### 4.3 Contratos Laborales

#### Auto-completado Inteligente

El sistema utiliza los perfiles de cargo para auto-completar:
- Salario sugerido
- Clase de riesgo
- Descripción del cargo
- Exigencias físicas y mentales
- EPP requeridos
- Exámenes y capacitaciones necesarias

**Flujo recomendado:**
1. Crear perfiles de cargo primero
2. Al crear contrato, seleccionar perfil
3. Campos se llenan automáticamente
4. Ajustar si es necesario
5. Guardar

---

### 4.4 Afiliaciones al Sistema de Seguridad Social (SSSS)

#### Gestión de Afiliaciones

**Ruta:** Planear → Afiliaciones SSSS

Este módulo permite registrar y gestionar las afiliaciones de los trabajadores a:
- **EPS** (Entidad Promotora de Salud)
- **AFP** (Administradora de Fondos de Pensiones)
- **ARL** (Administradora de Riesgos Laborales)
- **CCF** (Caja de Compensación Familiar)

**Información registrada:**
- Entidad de afiliación
- Número de afiliación
- Fecha de afiliación
- Estado (Activa/Inactiva)
- Documentos de soporte (PDF)

---

### 4.5 Trabajadores de Alto Riesgo

#### Identificación de Trabajadores Expuestos

**Ruta:** Planear → Trabajadores Alto Riesgo

Permite identificar trabajadores que requieren **exámenes complementarios** según el Artículo 18 de la Resolución 2346 de 2007:

**Riesgos que activan exámenes complementarios:**
- Ruido (audiometrías)
- Químicos (espirometrías, laboratorios)
- Alturas (exámenes de vértigo, agudeza visual)
- Espacios confinados
- Radiaciones ionizantes
- Biológicos

**Funcionalidad:**
- Vinculación de trabajador
- Tipo de riesgo
- Nivel de exposición
- Exámenes requeridos
- Frecuencia de seguimiento
- Estado de vigencia

---

### 4.6 Evaluación Inicial SST

**Ruta:** Planear → Evaluación Inicial

Diagnóstico del estado actual del SG-SST según los 7 Estándares Mínimos.

---

### 4.7 Plan Anual de Trabajo

**Ruta:** Planear → Plan Anual de Trabajo

Planificación de actividades SST para el año, con:
- Objetivos
- Actividades específicas
- Responsables
- Recursos necesarios
- Cronograma
- Indicadores de cumplimiento

---

### 4.8 Objetivos e Indicadores SST

**Ruta:** Planear → Objetivos e Indicadores SST

Gestión de objetivos SMART (Específicos, Medibles, Alcanzables, Relevantes, Temporales):
- Definición de objetivos
- Indicadores de seguimiento
- Metas cuantificables
- Frecuencia de medición
- Responsables

---

### 4.9 Matriz Legal

**Ruta:** Planear → Matriz Legal

Gestión de requisitos legales aplicables en SST:
- Identificación de normativa aplicable
- Decreto/Resolución/Ley
- Fecha de emisión
- Requisitos específicos
- Estado de cumplimiento
- Evidencias de cumplimiento

---

### 4.10 Evaluación de Proveedores y Contratistas

**Ruta:** Planear → Evaluación de Proveedores

Sistema completo para evaluar y calificar proveedores y contratistas en criterios SST:
- Registro de proveedores
- Criterios de evaluación SST
- Calificación y seguimiento
- Renovación de evaluaciones
- Dashboard de proveedores aprobados/rechazados

---

### 4.11 Gestión de Cambios SST

**Ruta:** Planear → Gestión de Cambios SST

Control de cambios que puedan afectar el SG-SST:
- Identificación de cambios (procesos, equipos, instalaciones)
- Evaluación de riesgos del cambio
- Cálculo automático de nivel de riesgo
- Aprobación por niveles según criticidad
- Implementación y seguimiento
- Cierre y lecciones aprendidas

---

### 4.12 Adquisiciones SST

**Ruta:** Planear → Adquisiciones SST

Gestión de compras con criterios SST:
- Solicitudes de compra
- Evaluación de criterios SST
- Aprobaciones
- Seguimiento de entregas
- Verificación de especificaciones SST

---

### 4.13 Comunicación SST

**Ruta:** Planear → Comunicación SST

Sistema de comunicaciones internas SST:
- Plan de comunicación
- Creación y envío de comunicados
- Segmentación por áreas/cargos
- Confirmación de lectura por trabajadores
- Trazabilidad completa
- Reportes de comunicados no leídos

---

## 5. Hacer

### 5.1 Exámenes Médicos Ocupacionales

**Ruta:** Hacer → Exámenes Médicos

Gestión completa del Sistema de Vigilancia Epidemiológica:

**Tipos de exámenes:**
- Ingreso
- Periódico
- Retiro
- Post-incapacidad
- Cambio de ocupación

**Información registrada:**
- Trabajador
- Tipo de examen
- Fecha de realización
- Concepto médico (Apto/No apto/Apto con restricciones)
- IPS que realiza el examen
- Restricciones y recomendaciones
- Fecha de vencimiento

---

### 5.2 Capacitaciones

**Ruta:** Hacer → Capacitaciones

**Registro de capacitaciones:**
- Tema
- Fecha y duración
- Instructor
- Asistentes
- Evidencias (fotografías, listas de asistencia)

---

### 5.3 Inspecciones

**Ruta:** Hacer → Inspecciones

Control de inspecciones de seguridad:
- Tipo de inspección
- Área inspeccionada
- Hallazgos
- Acciones correctivas
- Seguimiento

---

### 5.4 PESV - Plan Estratégico de Seguridad Vial

#### ¿Cuándo es Obligatorio PESV?

El módulo PESV se activa automáticamente si la empresa tiene:
- 1 o más vehículos propios, arrendados o en intermediación
- Trabajadores con misión de conducir

#### Módulos PESV

**5.4.1 Vehículos**
- Registro de vehículos
- Documentación (SOAT, tecnomecánica, seguros)
- Alertas de vencimiento

**5.4.2 Conductores**
- Registro de conductores
- Licencias de conducción
- Exámenes médicos específicos
- Capacitaciones viales

**5.4.3 Inspecciones Preoperacionales**
- Listas de chequeo diarias
- Estado del vehículo
- Correcciones realizadas

**5.4.4 Siniestros Viales**
- Registro de accidentes viales
- Causas
- Afectados
- Medidas preventivas

**5.4.5 Capacitaciones Viales**
- Manejo defensivo
- Normatividad vial
- Primeros auxilios
- Uso de EPP

**5.4.6 Auditorías PESV**
- Verificación de cumplimiento
- Planes de mejora

---

## 6. Verificar

### 6.1 Accidentes e Incidentes de Trabajo

**Ruta:** Verificar → Accidentes e Incidentes

**Clasificación:**
- Accidente de Trabajo (AT)
- Incidente de Trabajo (IT)
- Enfermedad Laboral (EL)

**Información registrada:**
- Trabajador afectado
- Fecha, hora y lugar
- Descripción del evento
- Partes del cuerpo afectadas
- Causas inmediatas y básicas
- Severidad (leve, grave, mortal)
- Días de incapacidad
- Medidas correctivas

**Reportes generados:**
- Formato FURAT
- Investigación de accidente
- Estadísticas de accidentalidad

---

### 6.2 Estándares Mínimos SST

**Ruta:** Verificar → Estándares SST

Evaluación de cumplimiento de los 7 Estándares de la Resolución 0312/2019:

1. **Recursos (10%):** Financieros, técnicos, humanos
2. **Gestión Integral (15%):** Política, objetivos, plan de trabajo
3. **Gestión de la Salud (20%):** Evaluaciones médicas, profesiogramas
4. **Gestión de Peligros y Riesgos (30%):** Identificación, valoración, controles
5. **Gestión de Amenazas (10%):** Plan de emergencias
6. **Verificación del SG-SST (5%):** Auditorías, revisiones
7. **Mejoramiento (10%):** Acciones correctivas y preventivas

**Calificación:**
- **Crítico:** < 60% (paralización de actividades)
- **Moderadamente aceptable:** 60-85%
- **Aceptable:** > 85%

---

### 6.3 Evaluaciones SST

**Ruta:** Verificar → Evaluaciones SST

Registro de evaluaciones del SG-SST con:
- Calificación de cada estándar
- Porcentaje de cumplimiento global
- Plan de mejoramiento
- Evidencias

---

### 6.4 Informes

**Ruta:** Verificar → Informes

Generación de reportes en PDF:
- Reporte de trabajadores
- Reporte de contratos
- Reporte de exámenes médicos
- Reporte de capacitaciones
- Reporte de accidentes
- Estadísticas SST

---

## 7. Actuar

### 7.1 Medidas Preventivas y Correctivas

**Ruta:** Actuar → Medidas Preventivas

Registro de acciones para prevenir o corregir riesgos:
- Descripción de la medida
- Tipo (preventiva/correctiva)
- Origen (inspección, accidente, auditoría)
- Responsable
- Fecha compromiso
- Estado (Pendiente, En proceso, Completada)
- Evidencias

---

### 7.2 Salud Ocupacional

**Ruta:** Actuar → Salud Ocupacional

Gestión de enfermedades laborales y ausentismo:
- Registro de enfermedades laborales
- Seguimiento de incapacidades
- Reubicaciones laborales
- Programas de rehabilitación

---

## 8. Portal de Empleados

### Para Trabajadores

**Acceso:** Usuarios con rol "Trabajador" son redirigidos automáticamente

**Funcionalidades:**

#### 8.1 Mi Contrato
- Visualización de contrato activo
- Información salarial
- Horario laboral
- Cláusulas del contrato

#### 8.2 Mi Perfil de Cargo
- Descripción del cargo
- Riesgos asociados
- EPP requeridos
- Exámenes y capacitaciones necesarias

#### 8.3 Comunicaciones
- Mensajes SST recibidos
- Marcar como leído
- Historial de comunicaciones

#### 8.4 Reportar
- Reportar peligros
- Sugerencias de mejora
- Quejas
- Consultas
- Opción de reporte anónimo

#### 8.5 Mis Reportes
- Estado de reportes enviados
- Respuestas del equipo SST
- Estadísticas personales

---

## 9. Roles y Permisos

### Matriz de Permisos

| Módulo | Admin | Coordinador SST | Responsable SST | Analista SST | Consultor | Trabajador |
|--------|-------|-----------------|-----------------|--------------|-----------|------------|
| Empresas | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Usuarios | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Trabajadores | ✅ | ✅ | ✅ | ✅ | 👁️ | ❌ |
| Contratos | ✅ | ✅ | ✅ | ✅ | 👁️ | ❌ |
| Exámenes | ✅ | ✅ | ✅ | ✅ | 👁️ | ❌ |
| Capacitaciones | ✅ | ✅ | ✅ | ✅ | 👁️ | ❌ |
| Accidentes | ✅ | ✅ | ✅ | ✅ | 👁️ | ❌ |
| Evaluaciones | ✅ | ✅ | ✅ | ❌ | 👁️ | ❌ |
| Portal Empleados | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

✅ = Acceso completo | 👁️ = Solo lectura | ❌ = Sin acceso

---

## 10. Preguntas Frecuentes

Ver archivo completo en: [Preguntas Frecuentes](../faq/preguntas-frecuentes.html)

---

## Soporte Técnico

**Email:** soporte@sst.com.co  
**WhatsApp:** +57 300 123 4567  
**Horario:** Lunes a Viernes, 8:00am - 6:00pm  
**Tiempo de respuesta:** Máximo 24 horas

---

## Glosario

- **SST:** Seguridad y Salud en el Trabajo
- **SG-SST:** Sistema de Gestión de Seguridad y Salud en el Trabajo
- **PHVA:** Planear, Hacer, Verificar, Actuar
- **ARL:** Administradora de Riesgos Laborales
- **EPS:** Entidad Promotora de Salud
- **COPASST:** Comité Paritario de Seguridad y Salud en el Trabajo
- **PESV:** Plan Estratégico de Seguridad Vial
- **EPP:** Elementos de Protección Personal
- **FURAT:** Formato Único de Reporte de Accidente de Trabajo

---

**© 2025 SG-SST Colombia - Sistema de Gestión de Seguridad y Salud en el Trabajo**
