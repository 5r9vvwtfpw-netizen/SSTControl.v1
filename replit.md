# SST Colombia - Sistema de Salud y Seguridad en el Trabajo

## Overview
This project is an integral management system for Occupational Health and Safety (SST) in Colombia. It ensures compliance with national regulations (Resolución 0312/2019) and ISO 45001:2018 standards. The system offers a comprehensive digital solution for managing workers, tracking incidents, scheduling training, and generating real-time statistical reports. It aims to be a leading tool for SST compliance and management, enhancing worker safety and operational efficiency, featuring a multi-tenant architecture, automatic company classification, and a complete PESV (Strategic Road Safety Plan) module.

## User Preferences
I prefer simple language and clear explanations. I want iterative development with regular updates. Please ask before making major architectural changes or introducing new dependencies. I prefer detailed explanations for complex features. Do not make changes to the `shared/` folder without explicit instruction.

## System Architecture

### UI/UX Decisions
The frontend uses React 18, TypeScript, and Vite, with Tailwind CSS and Shadcn UI for a modern, responsive interface inspired by Material Design. Navigation follows the PHVA cycle (Plan-Do-Check-Act) using horizontal tabs. Company logos are integrated into all PDF documents. The company registration flow uses a 2-step wizard, automatically calculating risk levels and applicable standards based on the CIIU code.

### Technical Implementations
The system is built with a React 18, TypeScript, Vite frontend and an Express.js, TypeScript backend using PostgreSQL with Drizzle ORM. It features an 11-Tier Role-Based Access Control (RBAC) system with multi-tenant architecture. All PDF reports adhere to a corporate standard managed by `server/services/pdf-standardizer.ts`. New forms follow a "Smart Form Pattern" with auto-generated tracking codes, type-based auto-filling, context auto-filling, and visual indicators. Universal "Back to Evaluation" navigation is implemented across relevant pages. New components are added following an "Add-Only" principle.

### System Design Choices
The system uses a client-server architecture with a RESTful API. Data integrity is ensured through Zod validations. Security features include hashed passwords, secure session management, and restricted privilege escalation. It is designed for scalability and maintainability, incorporating health checks, structured JSON logging, automated database backups, and audit logging. Form validation includes required fields, field-specific error messages, and converts empty strings to null for optional fields. A robust data encryption system compliant with Ley 1581/2012 uses AES-256-GCM with per-field key derivation for sensitive data. Companies are automatically classified by ARL risk level based on their CIIU code.

The PESV module manages evaluations according to Resolución 40595/2022, supporting three complexity levels and providing bidirectional traceability with SST. It incorporates ISO 31000:2018 for road risk management and ISO 39001:2012 for road safety performance management. The PESV module is evaluation-centric, with annual data scoped by `evaluacion_pesv_id` and new evaluations inheriting from previous years via `parent_evaluacion_id` to copy documentary responses. The Actuar phase (A01 - Mejora Continua, A02 - Revisión por la Dirección) is fully implemented, providing CRUD operations for actions and management review records with bidirectional traceability to SST modules. When a company updates its `numberOfVehicles`, the system immediately detects PESV level changes and migrates active evaluations.

The Accounting Integration Service (`server/services/accounting-integration.ts`) is a Sidecar module with kill-switch (`ACCOUNTING_INTEGRATION_ENABLED`). When enabled, it sends invoice data to the external accounting software (`ACCOUNTING_API_URL`) via `POST /api/integration/sst-invoice` after every invoice creation (both Stripe webhook payments in `server/index.ts` and monthly billing in `server/jobs/monthly-billing.ts`). If the accounting system returns a DIAN CUFE, it's saved to the invoice record. The superadmin can check integration status via `GET /api/billing/accounting-integration/status`. Required env vars: `ACCOUNTING_API_URL`, `ACCOUNTING_API_KEY`, `ACCOUNTING_INTEGRATION_ENABLED=true`.

The billing system operates exclusively on quote-based pricing from the landing page JWT. When a company updates pricing-affecting data (CIIU, workers, vehicles) after registration, the system first sends the updated data to the landing page via `POST /api/calculate-quote`, receives a new JWT with the recalculated price, verifies it, and updates the company's quote fields. Only after successful price recalculation does the company data update proceed. The user licensing model includes one user per administrative role at no additional cost. A subscription blocking system manages user access based on subscription status, with Stripe webhooks updating statuses automatically.

A centralized Document Traceability System tracks all system-generated PDFs using a metadata-only approach. The system tracks SST objective progress and formal compliance, allowing linking SST Objectives with Resolución 0312/2019 Standards. The main Dashboard includes a consolidated PHVA cycle view with key metrics and alerts. The PESV Smart Forms System provides intelligent auto-fill capabilities. Features for PESV Committee Traceability in the Worker Portal and dedicated hub pages for PESV Step 4 (P04) are included. Bidirectional traceability for SST and PESV training and PESV Training Notifications for Workers (Non-Drivers) are implemented.

The Promotions Plugin operates as an independent Sidecar Architecture module, handling promotional pricing, coupons, digital contracts with JWT-validated price locking, and a net-zero risk referral program. It communicates via the database, has dedicated API routes, its own database tables, and environment variables, with a kill-switch protocol.

The Landing Page Integration Plugin provides secure JWT verification for pricing quotes from the external landing page (`sst-colombia.com.co`). It follows Sidecar Architecture principles, providing a stable facade interface, a kill switch, type-safe contracts, and backward compatibility for legacy tokens. The quote verification flow ensures data integrity during registration and checkout by using HMAC-SHA256 signed JWTs. Trial subscriptions unlock all features for the duration of the trial.

The Ministerio del Trabajo PDF report (`GET /api/evaluaciones-sst/:id/pdf-ministerio`) implements the "Hilo Dorado" (Golden Thread) traceability system with sections A-I: A) Resumen Ejecutivo, B) Análisis por Componente, C) Análisis de Datos del Sistema, D) Análisis de Brechas, E) Plan de Mejora - Acciones Registradas (real user-created actions with progress), F) Hilo Dorado - Trazabilidad del SG-SST (Standard → Action → Activity → Execution chain), G) Plan de Trabajo Anual - Avance del Cronograma (work plan progress by program), H) Plan de Mejora Recomendado (system-generated), I) Conclusiones. The Hilo Dorado section visualizes the complete improvement cycle connecting the three master files: evaluation standards, improvement actions, and work plan activities.

The Excel worker import system uses a **tolerant normalization pipeline** that accepts free-text input from users and maps it to valid database enum values. This includes `removeAccents`, `normalizeContractType`, `normalizeEducationLevel`, `normalizeGender`, `normalizeCivilStatus`, and status normalization functions. The validation strategy uses Zod `safeParse` with a retry mechanism to set invalid optional enum fields to `undefined` or default values, ensuring **no row is rejected** due to vocabulary variations.

## Reglas de Desarrollo Críticas

### Anti-patrón: Componentes Inline en Rutas Protegidas
**NUNCA** definir componentes como funciones inline dentro de otros componentes de ruta. Esto causa que React los destruya y recree en cada re-renderizado del padre, perdiendo todo el estado interno (diálogos abiertos, formularios, datos temporales).

**MAL (causa pérdida de estado):**
```tsx
function MiRutaProtegida({ component: Component }) {
  const Wrapper = () => <Gate><Component /></Gate>;  // NUEVA función cada render
  return <Route component={Wrapper} />;
}
```

**BIEN (referencia estable):**
```tsx
function MiRutaProtegida({ component: Component }) {
  const Wrapper = useMemo(() => {
    return function StableWrapper() {
      return <Gate><Component /></Gate>;
    };
  }, [Component]);  // Solo cambia si Component cambia
  return <Route component={Wrapper} />;
}
```

**Archivos protegidos con este patrón:**
- `client/src/lib/subscription-protected-route.tsx` — usa `useMemo` para estabilizar `GatedComponent`
- `client/src/lib/protected-route.tsx` — pasa `Component` directamente a `<Route>`

### Patrón de Mutaciones DELETE (Respuestas 204 No Content)
Las rutas DELETE del backend retornan `204 No Content` (sin cuerpo). **NUNCA** llamar `.json()` en la respuesta de un DELETE.

**MAL (causa error de parseo):**
```tsx
mutationFn: async (id: number) => {
  const res = await apiRequest("DELETE", `/api/something/${id}`);
  return res.json(); // FALLA: 204 no tiene cuerpo JSON
},
```

**BIEN:**
```tsx
mutationFn: async (id: number) => {
  await apiRequest("DELETE", `/api/something/${id}`);
},
```

### Formularios de Edición - Pre-carga de Datos
Al reutilizar un formulario para edición, los campos con "asistente inteligente" o selección de plantillas deben inicializarse con el valor existente del registro, no vacíos. Usar `useMemo` para calcular el valor inicial una sola vez.

### Rutas Internas en Componentes de Verificación
Los componentes `Estandar*Verificacion*.tsx` contienen botones que enlazan a módulos del sistema. Las rutas deben coincidir exactamente con las definidas en `client/src/App.tsx`. Verificar antes de crear un enlace que la ruta destino exista en App.tsx y en `shared/chapter-modules.ts`.

### Protección de Diálogos y Sheets contra Contenido Portalizado
Los componentes `Dialog` y `Sheet` (`client/src/components/ui/dialog.tsx` y `sheet.tsx`) tienen tres capas de protección para evitar que menús desplegables (Select, Combobox, DatePicker) cierren accidentalmente el diálogo al seleccionar opciones:

1. **`onPointerDownOutside`**: Detecta si el clic fue sobre contenido portalizado de Radix (`[data-radix-popper-content-wrapper]`, `[data-radix-select-viewport]`) y bloquea el cierre.
2. **`onInteractOutside`**: Misma lógica para eventos de interacción genéricos.
3. **`onOpenChange` wrapper**: Antes de cerrar, verifica si hay menús desplegables activos en el DOM y bloquea el cierre si los hay.

**IMPORTANTE:** No modificar estos handlers sin entender el ciclo de vida de los portales de Radix UI. Cualquier cambio debe probarse con un diálogo que contenga un Select dentro.

### Vinculación Actividades del Cronograma ↔ Plan de Mejora
Las actividades del Plan Anual de Trabajo (`actividades_plan_trabajo`) pueden vincularse opcionalmente a acciones del Plan de Mejora (`acciones_mejora`) mediante `accionMejoraId`. Cuando una actividad vinculada cambia de estado (completada/pendiente), el sistema recalcula automáticamente el `porcentajeAvance` de la acción de mejora correspondiente: `completadas / total_vinculadas * 100`. Si el 100% de actividades se completan, la acción se marca como "completada" automáticamente con su `fechaEjecucion`.

**Archivos involucrados:**
- `shared/schema.ts` — columna `accionMejoraId` en `actividadesPlanTrabajo`
- `server/storage.ts` — método `recalcularAvanceAccionMejora()`
- `server/migrations/sync-actividad-accion-mejora-link.ts` — migración para producción
- `client/src/pages/DetallePlanTrabajo.tsx` — selector de acción de mejora en formulario
- `client/src/components/CronogramaMensual.tsx` — invalidación de cache al toggle

## External Dependencies

-   **PostgreSQL (Neon/AWS RDS)**: Relational database.
-   **TanStack Query v5**: Frontend data fetching.
-   **Wouter**: React routing.
-   **React Hook Form + Zod**: Form management and validation.
-   **Express.js**: Backend framework.
-   **Drizzle ORM**: TypeScript ORM.
-   **Passport.js**: Authentication middleware.
-   **PDFKit**: PDF generation.
-   **Resend**: Email service.
-   **Stripe**: Payment gateway.
-   **Tailwind CSS**: CSS framework.
-   **Shadcn UI**: UI component library.
-   **Amazon S3**: Cloud object storage.
-   **AWS SDK v3**: For S3 operations.