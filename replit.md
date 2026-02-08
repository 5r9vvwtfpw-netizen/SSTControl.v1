# SST Colombia - Sistema de Salud y Seguridad en el Trabajo

## Overview
This project is an integral management system for Occupational Health and Safety (SST) in Colombia. It ensures compliance with national regulations (Resolución 0312/2019) and ISO 45001:2018 standards, offering a comprehensive digital solution for managing workers, tracking incidents, scheduling training, and generating real-time statistical reports. The system aims to be a leading tool for SST compliance and management, enhancing worker safety and operational efficiency, featuring a multi-tenant architecture, automatic company classification, and a complete PESV (Strategic Road Safety Plan) module.

## User Preferences
I prefer simple language and clear explanations. I want iterative development with regular updates. Please ask before making major architectural changes or introducing new dependencies. I prefer detailed explanations for complex features. Do not make changes to the `shared/` folder without explicit instruction.

### REGLA CRÍTICA: Base de Datos de Producción
- **Producción usa EXCLUSIVAMENTE AWS RDS** (PostgreSQL). NO Neon.
- **Desarrollo usa Neon** (DATABASE_URL).
- **TODAS las migraciones automáticas DEBEN usar la instancia `db` compartida de `server/db.ts`**, que conecta automáticamente a AWS RDS cuando `NODE_ENV=production` y a Neon cuando es development.
- **NUNCA usar `neon(process.env.DATABASE_URL!)` directamente en migraciones**, porque en producción DATABASE_URL apunta a Neon pero el app usa AWS RDS. Esto causa que las migraciones se ejecuten en la BD equivocada.
- **Conexión en producción**: `server/db.ts` construye la cadena de conexión AWS RDS usando `AWS_RDS_HOST`, `AWS_RDS_PASSWORD`, `AWS_RDS_USER`, `AWS_RDS_PORT`, `AWS_RDS_DATABASE`.
- **Antes de publicar**: Verificar que TODAS las migraciones en `server/migrations/` usen `import { db } from '../db'` y `import { sql } from 'drizzle-orm'`, NO `import { neon } from '@neondatabase/serverless'`.

## System Architecture

### UI/UX Decisions
The frontend uses React 18, TypeScript, and Vite, with Tailwind CSS and Shadcn UI for a modern, responsive interface inspired by Material Design. Navigation follows the PHVA cycle (Plan-Do-Check-Act) using horizontal tabs. Company logos are integrated into all PDF documents. The company registration flow uses a 2-step wizard, automatically calculating risk levels and applicable standards based on the CIIU code.

### Technical Implementations
The system is built with a React 18, TypeScript, Vite frontend and an Express.js, TypeScript backend using PostgreSQL with Drizzle ORM. It features an 11-Tier Role-Based Access Control (RBAC) system with multi-tenant architecture. All PDF reports adhere to a corporate standard managed by `server/services/pdf-standardizer.ts`. New forms follow a "Smart Form Pattern" with auto-generated tracking codes, type-based auto-filling, context auto-filling, and visual indicators. Universal "Back to Evaluation" navigation is implemented across relevant pages. New components are added following an "Add-Only" principle.

### System Design Choices
The system uses a client-server architecture with a RESTful API. Data integrity is ensured through Zod validations. Security features include hashed passwords, secure session management, and restricted privilege escalation. It is designed for scalability and maintainability, incorporating health checks, structured JSON logging, automated database backups, and audit logging. Form validation includes required fields, field-specific error messages, and converts empty strings to null for optional fields. A robust data encryption system compliant with Ley 1581/2012 uses AES-256-GCM with per-field key derivation for sensitive data. Companies are automatically classified by ARL risk level based on their CIIU code, using official Colombian decrees.

The PESV module manages evaluations according to Resolución 40595/2022, supporting three complexity levels and providing bidirectional traceability with SST. It incorporates ISO 31000:2018 for road risk management and ISO 39001:2012 for road safety performance management.

### PESV Evaluation-Centric Architecture (In Progress)
The PESV module is being restructured to be evaluation-centric, where all modules are managed within annual evaluations instead of a separate control panel. Key design decisions:
- **Master data** (vehicles, drivers) remain global across evaluations
- **Annual data** (inspections, trainings, incidents) are scoped by `evaluacion_pesv_id`
- **Evaluation inheritance**: New evaluations can inherit from previous years via `parent_evaluacion_id`, copying documentary responses (P01-P11) to reduce data entry
- **UI approach**: Filtered pages with `EvaluacionPesvContextHeader` showing year, phase, module, and compliance percentage
- **Endpoint**: `POST /api/evaluaciones-pesv/:id/heredar` creates year+1 evaluation with inherited documentary responses
- **Routes**: Evaluation-scoped at `/pesv/evaluacion/:evaluacionId/[module]`
- **Database columns**: `parent_evaluacion_id` in `evaluaciones_pesv`, `evaluacion_pesv_id` in `vehicle_inspections`, `road_incidents`, `road_safety_trainings`

### PESV Ciclo Actuar (A01-A02) - Completo
The PESV PHVA cycle is now fully implemented with the Actuar phase:
- **A01 - Mejora Continua**: `PesvMejoraContinua.tsx` at `/pesv/evaluacion/:evaluacionId/mejora-continua`
  - CRUD for acciones correctivas, preventivas y de mejora
  - Fields: descripcion, tipoAccion, prioridad, fuenteHallazgo, responsable, fechaLimite, estado, evidenciaCierre
  - Bidirectional traceability with SST Plan de Mejoramiento (Decreto 1072/2015 Art. 2.2.4.6.33)
  - Table `acciones_mejora_pesv` enriched with fuente_hallazgo, tipo_accion, prioridad, evidencia_cierre, eficacia_verificada
- **A02 - Revisión por la Dirección**: `PesvRevisionDireccion.tsx` at `/pesv/evaluacion/:evaluacionId/revision-direccion`
  - Management review records with 8 topic checkboxes (indicadores, auditorias, siniestros, etc.)
  - Decisions and commitments tracking
  - Bidirectional traceability with SST Revisiones por la Dirección (Decreto 1072/2015 Art. 2.2.4.6.31)
  - New table `revisiones_direccion_pesv` with full review structure
- **Endpoints**: GET/POST/PATCH for both modules scoped to evaluacion_pesv_id
- **Normative compliance**: Resolución 40595/2022, ISO 39001:2012 Cláusula 9.3, Decreto 1072/2015

### PESV Immediate Level Migration System
When a company updates its `numberOfVehicles` in the company profile, the system immediately:
1. **Detects level change**: Compares old vs new PESV level (basico ≤10, estandar 11-50, avanzado 50+)
2. **Migrates active evaluations**: Updates `nivel` and `numero_vehiculos` on all active (`en-progreso`) evaluaciones_pesv immediately, unlocking/adjusting steps via `getPasosPorNivel()`
3. **Deferred billing**: The cost difference is NOT charged immediately. Instead, it is applied on the next monthly invoice cycle (billingMode: 'next_invoice')
4. **Frontend notification**: Shows informative toasts with migration details, new/old costs, and explains the difference will appear in the next monthly invoice
- Migration is immediate, no waiting for next evaluation cycle
- Billing is deferred to next invoice (no Stripe redirect at update time)
- Pricing: Básico=20 steps×$8,000=$160,000/mo, Estándar/Avanzado=24 steps×$8,000=$192,000/mo
- Downgrade scenario: If vehicles decrease but level stays same, no migration. If vehicles=0, evaluation keeps current level

The billing system includes a robust validator (`server/lib/billing-validator.ts`) for data integrity before invoice generation, utilizing Zod schema validation, company validation, and subscription validation, and provides a health check endpoint.

The system incorporates a comprehensive pricing calculator (V2) integrating SST, PESV, and user licensing, with real-time cost breakdowns and Stripe checkout. The user licensing model includes one user per administrative role at no additional cost, with additional users charged monthly. Stripe integration handles COP as a non-zero-decimal currency.

A subscription blocking system manages user access based on subscription status (`trial`, `active`, `past_due`, `blocked`, `cancelled`, `no_subscription`, `trial_expired`), with specific middleware and UI components enforcing restrictions. Stripe webhooks update subscription statuses automatically.

A centralized Document Traceability System tracks all system-generated PDFs using a metadata-only approach, registering documents with source module, endpoint, and record ID, and providing API endpoints for retrieval and statistics.

The system tracks SST objective progress (`porcentaje_avance`) and formal compliance, adhering to Art. 2.2.4.6.19 of Decreto 1072/2015. It also allows linking SST Objectives with Resolución 0312/2019 Standards to automatically calculate objective advancement based on standard compliance. The main Dashboard includes a consolidated PHVA cycle view through the `PHVASummary` component, providing 4-phase cards with key metrics, traceability links, additional KPIs, and alerts for overdue actions.

The PESV Smart Forms System includes intelligent auto-fill capabilities for PESV cycle forms (Planear, Hacer, Verificar, Actuar) to minimize manual data entry. It uses hooks for data consolidation and mapping, a configuration for prefill mapping, and a UI component for user interaction.

The system includes features for PESV Committee Traceability in the Worker Portal, allowing workers to view their committee membership and approved meeting minutes as per Resolución 40595/2022.

A dedicated hub page for PESV Step 4 (P04) - Leadership and Commitment provides traceability and links to related SST modules, adhering to an "Add-Only" principle for implementation.

Bidirectional traceability for SST and PESV training (`Capacitaciones SST ↔ PESV`) is implemented through visual banners and links, ensuring compliance with Decreto 1072/2015 and Resolución 40595/2022.

The system allows for PESV Training Notifications for Workers (Non-Drivers), enabling administrators to invite non-driver personnel to road safety trainings and track their attendance via a dedicated database table and API endpoints.

The Promotions Plugin (`plugins/promotions/`) operates as an independent Sidecar Architecture module, handling promotional pricing, coupons, digital contracts with JWT-validated price locking, and a net-zero risk referral program. It communicates via the database, has dedicated API routes, its own database tables, and environment variables, with a kill-switch protocol for removal.

The Landing Page Integration Plugin (`plugins/landing-page-integration/`) provides secure JWT verification for pricing quotes from the external landing page (`sst-colombia.com.co`). This plugin is encapsulated following Sidecar Architecture principles to isolate any changes from the main application. Key features:
- **Stable Facade Interface**: Main app only imports from `facade.ts` (`verifyQuote`, `getQuoteSummary`) - internal changes don't break the app
- **Kill Switch**: Call `disablePlugin()` to immediately disable all quote verifications without code changes
- **Type-safe Contracts**: `NormalizedQuoteData` provides a consistent interface for the main app
- **Backward Compatible**: Supports legacy base64 tokens during migration period
- **Health Endpoint**: `/api/plugins/landing-page/health` for monitoring
- **Environment**: Requires `LANDING_PAGE_API_KEY` secret for JWT verification

The quote verification flow ensures data integrity during registration and checkout by using HMAC-SHA256 signed JWTs. Prices are NOT recalculated - the app trusts the signed JWT to prevent tampering. COP currency is handled as a zero-decimal currency for Stripe transactions, and 100% discount coupons are converted into 30-day trials.

### Quote-to-Checkout Flow (JWT Token Pricing)
When a user arrives from the landing page with a JWT quote token, the flow is:
1. **AuthPage**: Verifies JWT token, stores `NormalizedQuoteData` in sessionStorage (`sst_quote_data`)
2. **CrearEmpresaCiiuFirst**: Auto-fills form fields from quote data. On submit, sends quote pricing fields (`quoteBaseMonthlyPrice`, `quoteCurrentPeriodPrice`, `quoteDiscountDurationMonths`, `quoteCouponCode`, `quoteReferrerId`) alongside company data to `POST /api/my-company`
3. **Backend**: Persists quote fields in the `companies` table for later use during checkout
4. **Checkout**: Detects if company has `quoteBaseMonthlyPrice > 0`. If yes, displays the agreed price and sends quote data to `POST /api/pricing-v2/create-checkout-v2`
5. **Stripe Checkout**: Creates a single line item with the quote base price. If `currentPeriodPrice < baseMonthlyPrice`, creates a Stripe coupon for the discount period
- **Security**: Backend reads quote prices from `companies` table (source of truth), NEVER from client request payload. Client cannot tamper with pricing.
- Trial subscriptions unlock ALL features (hasPESV, hasAuditorias, etc.) regardless of plan, so users can explore the full system during the 7-day trial

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