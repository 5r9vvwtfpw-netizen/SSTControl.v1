# Design Guidelines: Sistema SST Colombia - Ciclo PHVA

## Design Approach: Material Design con Organización PHVA

**Rationale:** Este sistema de gestión de seguridad y salud en el trabajo está organizado según el ciclo PHVA (Planear, Hacer, Verificar, Actuar) según ISO 45001:2018 y la legislación colombiana. El diseño debe transmitir profesionalismo, seguridad y cumplimiento normativo.

**Core Principles:**
- Organización clara según ciclo PHVA
- Confiabilidad profesional (la seguridad es seria)
- Jerarquía clara de información
- Entrada y consulta eficiente de datos
- Seguimiento accesible de cumplimiento

---

## Estructura de Navegación PHVA

### 🔧 CONFIGURACIÓN
Módulos base del sistema:
- ✅ Panel de control
- ✅ Empresas
- ✅ Usuarios
- ✅ Trabajadores

### 📋 PLANEAR
Identificación y planificación:
- ✅ Perfiles de Cargo
- 🔜 Identificación de Peligros y Riesgos
- 🔜 Objetivos SST
- 🔜 Recursos y Planificación

### 🛠️ HACER
Implementación y ejecución:
- ✅ Contratos Laborales
- ✅ Exámenes Médicos
- ✅ Capacitaciones
- ✅ Inspecciones
- 🔜 Controles Operacionales
- ✅ PESV (Plan Estratégico de Seguridad Vial)
  - ✅ Panel de control PESV
  - ✅ Vehículos
  - ✅ Conductores
  - ✅ Inspecciones Preoperacionales
  - ✅ Siniestros Viales
  - ✅ Capacitaciones Viales
  - ✅ Auditorías PESV

### ✅ VERIFICAR
Monitoreo y medición:
- ✅ Accidentes e Incidentes
- ✅ Estándares SST (7 estándares mínimos)
- ✅ Evaluaciones SST
- ✅ Informes
- 🔜 Indicadores de Gestión

### 🔄 ACTUAR
Mejora continua:
- ✅ Medidas Preventivas
- ✅ Salud Ocupacional
- 🔜 Planes de Mejoramiento
- 🔜 Revisión por la Dirección
- 🔜 Acciones de Mejora

**Leyenda:**
- ✅ Implementado
- 🔜 Por implementar

---

## Core Design Elements

### A. Color Palette - Verde Oscuro Profesional

**Light Mode (Primary):**
- Primary: 145 63% 25% (Verde oscuro profesional - seguridad y confianza)
- Primary Light: 145 63% 35% (Estados hover)
- Primary Dark: 145 63% 15% (Estados activos)
- Success: 142 71% 45% (Indicadores de cumplimiento)
- Warning: 38 92% 50% (Alertas, items pendientes)
- Danger: 0 84% 60% (Incidentes, problemas críticos)
- Neutral: 220 14% 96% (Fondos)
- Text: 220 9% 16% (Texto principal)

**Dark Mode:**
- Primary: 145 63% 45%
- Background: 145 15% 12%
- Surface: 145 12% 16%
- Text: 220 9% 96%

**Semantic Colors:**
- Accidente/Incidente: Escala roja
- Capacitación: Escala verde
- Inspección: Escala ámbar
- Salud: Escala verde claro
- PHVA Tabs: Verde oscuro degradado

### B. Typography

**Font Stack:** Inter (vía Google Fonts) para superior legibilidad en interfaces densas de datos

**Hierarchy:**
- H1: 2.5rem (40px), font-bold - Títulos de página
- H2: 2rem (32px), font-semibold - Encabezados de sección
- H3: 1.5rem (24px), font-semibold - Títulos de cards/módulos
- H4: 1.25rem (20px), font-medium - Encabezados de subsección
- Body: 1rem (16px), font-normal - Contenido
- Small: 0.875rem (14px), font-normal - Labels, captions
- Mono: JetBrains Mono para tablas de datos y estadísticas

### C. Layout System

**Header PHVA:**
- Logo SG-SST en esquina superior izquierda
- Navegación horizontal con tabs: Configuración | Planear | Hacer | Verificar | Actuar
- Fondo degradado verde oscuro
- Info de usuario y fecha en esquina superior derecha

**Spacing Primitives:** Usar unidades Tailwind de 2, 4, 6, 8, 12, 16
- Tight spacing: p-2, gap-2 (items relacionados)
- Standard spacing: p-4, gap-4 (uso general)
- Section spacing: p-6, p-8 (cards, contenedores)
- Page margins: p-12, p-16 (contenedores externos)

**Grid System:**
- Panel de control: Grid de 12 columnas (grid-cols-12)
- Forms: Columna única max-w-2xl
- Data tables: Ancho completo con scroll horizontal responsive
- Cards: Grid con gap-6 (1-2-3 columnas responsive)

### D. Component Library

**Navigation:**
- Top header: Fijo con navegación PHVA horizontal
- Submenú: Dropdown bajo cada tab PHVA
- Breadcrumbs: Para jerarquías profundas
- Tabs secundarios: Para contenido relacionado

**Data Display:**
- Tables: Filas rayadas, headers ordenables, paginación
- Cards: Elevadas (shadow-md), rounded-lg, con headers claros
- Statistics: Números grandes con indicadores de tendencia (↑↓)
- Charts: Bar/line para tendencias, pie para distribuciones
- Status badges: Forma de píldora con colores semánticos

**Forms & Inputs:**
- Text inputs: Border-2 con focus ring-2
- Selects: Dropdowns estilizados personalizados
- Date pickers: Overlay de calendario
- File uploads: Zona drag-drop con vista previa
- Validation: Mensajes de error inline con texto rojo

**Actions:**
- Primary buttons: Relleno con color primario (verde oscuro)
- Secondary buttons: Outlined con border-2
- Danger buttons: Relleno rojo para acciones destructivas
- Icon buttons: Para acciones compactas en tablas

**Overlays:**
- Modals: Centrados con backdrop blur
- Alerts/Toasts: Notificaciones top-right
- Confirmation dialogs: Para acciones críticas

### E. Page-Specific Layouts

**Panel de control (Configuración):**
- 4 stat cards en la parte superior (accidentes, capacitaciones, inspecciones, % cumplimiento)
- 2 columnas abajo: Incidentes recientes (izq) + Capacitaciones próximas (der)
- Ancho completo: Charts de tendencias y timeline de cumplimiento

**Módulos PHVA:**
Cada sección tiene su propio submenu con los módulos correspondientes organizados lógicamente

**Sección de Informes:**
- Panel de filtros (sidebar izquierdo): Rango de fechas, departamento, tipo
- Área de resultados: Vista de tabla imprimible
- Controles de exportación: Botones PDF, Excel (top right)

**Forms (Incidente, Capacitación, Inspección):**
- Forms por pasos para entradas complejas
- Indicador de progreso en la parte superior
- Funcionalidad de guardar borrador
- Indicadores de campos requeridos (*)

---

## Data Visualization Guidelines

**Chart Types:**
- Tendencias de accidentes: Line chart con datos mensuales
- Cumplimiento de capacitación: Horizontal bar chart por departamento
- Severidad de incidentes: Pie chart con codificación de color
- Scores de inspección: Radar chart para multi-criterio

**Color Coding:**
- Verde: Seguro/Conforme (>90%)
- Amarillo: Advertencia (70-90%)
- Rojo: Crítico (<70%)

---

## Accessibility & Responsiveness

- Cumplimiento WCAG AA mínimo
- Todos los elementos interactivos min 44px touch target
- Navegación por teclado en todo el sitio
- Labels de screen reader en todos los iconos
- Breakpoints responsive: sm(640px), md(768px), lg(1024px), xl(1280px)
- Mobile: Stack columnas, tablas simplificadas (swipe para ver)

---

## Colombian Compliance Indicators

- Display de referencias relevantes de ley SST colombiana (Decreto 1072, Resolución 0312)
- Estado de cumplimiento codificado por color para reportes requeridos
- Advertencias de fecha límite para presentaciones obligatorias
- Placeholders de integración ARL (Administradora de Riesgos Laborales)
- Ciclo PHVA según ISO 45001:2018
