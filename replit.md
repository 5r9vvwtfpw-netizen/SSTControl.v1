# SST Colombia - Sistema de Salud y Seguridad en el Trabajo

## Overview
This project is an integral management system for Occupational Health and Safety (SST) in Colombia. It ensures compliance with national regulations (Resolución 0312/2019) and ISO 45001:2018 standards. The system offers a comprehensive digital solution for managing workers, tracking incidents, scheduling training, and generating real-time statistical reports. It aims to be a leading tool for SST compliance and management, enhancing worker safety and operational efficiency. Key features include a multi-tenant architecture, automatic company classification, and a complete PESV (Strategic Road Safety Plan) module.

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

The Accounting Integration Service (`server/services/accounting-integration.ts`) is a Sidecar module with kill-switch (`ACCOUNTING_INTEGRATION_ENABLED`). When enabled, it sends invoice data to the external accounting software via `POST /api/integration/sst-invoice` after every invoice creation. If the accounting system returns a DIAN CUFE, it's saved to the invoice record. The superadmin can check integration status via `GET /api/billing/accounting-integration/status`.

The billing system operates exclusively on quote-based pricing from the landing page JWT. When a company updates pricing-affecting data (CIIU, workers, vehicles) after registration, the system first sends the updated data to the landing page via `POST /api/calculate-quote`, receives a new JWT with the recalculated price, verifies it, and updates the company's quote fields. Only after successful price recalculation does the company data update proceed. The user licensing model includes one user per administrative role at no additional cost. A subscription blocking system manages user access based on subscription status, with Stripe webhooks updating statuses automatically.

A centralized Document Traceability System tracks all system-generated PDFs using a metadata-only approach. The system tracks SST objective progress and formal compliance, allowing linking SST Objectives with Resolución 0312/2019 Standards. The main Dashboard includes a consolidated PHVA cycle view with key metrics and alerts. The PESV Smart Forms System provides intelligent auto-fill capabilities. Features for PESV Committee Traceability in the Worker Portal and dedicated hub pages for PESV Step 4 (P04) are included. Bidirectional traceability for SST and PESV training and PESV Training Notifications for Workers (Non-Drivers) are implemented.

The Promotions Plugin operates as an independent Sidecar Architecture module, handling promotional pricing, coupons, digital contracts with JWT-validated price locking, and a net-zero risk referral program. It communicates via the database, has dedicated API routes, its own database tables, and environment variables, with a kill-switch protocol.

The Landing Page Integration Plugin provides secure JWT verification for pricing quotes from the external landing page (`sst-colombia.com.co`). It follows Sidecar Architecture principles, providing a stable facade interface, a kill switch, type-safe contracts, and backward compatibility for legacy tokens. The quote verification flow ensures data integrity during registration and checkout by using HMAC-SHA256 signed JWTs. Trial subscriptions unlock all features for the duration of the trial.

The Ministerio del Trabajo PDF report (`GET /api/evaluaciones-sst/:id/pdf-ministerio`) implements the "Hilo Dorado" (Golden Thread) traceability system with sections A-I, visualizing the complete improvement cycle connecting evaluation standards, improvement actions, and work plan activities.

The Excel worker import system uses a tolerant normalization pipeline that accepts free-text input from users and maps it to valid database enum values, ensuring no row is rejected due to vocabulary variations.

When an external LSO is assigned to a company from the directory (`POST /api/lso-directory-jwt/assign`), the system auto-provisions a user account with the `lso` role if one doesn't already exist for that email. Credentials are generated automatically and sent via email using `sendLsoPortalAccessEmail`. The assignment card in the frontend (`AsignarLsoExterno.tsx`) displays a `portalAccess` indicator showing whether the LSO has an active portal account. Both `lso-directory-jwt.ts` and `lso-directory-external.ts` routes include this auto-provisioning logic.

The Designación de Responsables form (`ResponsibleDesignation.tsx`) auto-fills LSO license data when "Responsable del SG-SST" is selected and an LSO is assigned. The `autoFillLsoFields()` function populates: name, license number, expiry date, identification number, nivel de formación (mapped from `sstProfessionType` via `PROFESSION_TO_NIVEL`), and curso de 50 horas (boolean + date). The `GET /api/lso-directory-jwt/current-assignment` endpoint merges data from the external assignment record with the LSO's user profile (sstLicenseNumber, sstProfessionType, sstIdentificationNumber, sstCourse50Hours, sstCourse50HoursDate, etc.), preferring assignment data but falling back to user profile data. A `clearLsoFields()` function resets all fields when the LSO toggle is unchecked.

The LSO Digital Signature System implements mandatory professional signatures across 5 document types required by Colombian regulations: (1) Investigaciones de accidentes graves/mortales [Res. 1401/2007], (2) Evaluación de Estándares Mínimos [Res. 0312/2019], (3) Plan de Trabajo Anual [Decreto 1072/2015], (4) Matriz de Peligros IPERC [GTC-45/ISO 45001], (5) Evaluación Inicial SG-SST. Each document table has frozen signature fields (`lso_signature_name`, `lso_signature_license`, `lso_signature_url`, `lso_signed_at`). When the LSO signs, their data is captured immutably from their user profile. PDF generation uses frozen signature data when available, overriding `signers.lso` in the `addSignatureFooter` call. The LSO portal Documentos tab uses a two-level "Company Vault" (Bóveda) navigation: Level 1 shows company cards with pending/signed document counts and a search bar (when >3 companies); Level 2 (click a company) shows a PHVA Dashboard Panel with real company data followed by documents grouped by type (Investigaciones, Evaluaciones, Planes, Matrices) with sign buttons. The `buildCompanyVaults()` function aggregates the flat API response by `companyId`. The `PHVADashboardPanel` component fetches real PHVA cycle data via `GET /api/portal-licenciado/empresa/:companyId/dashboard-phva?year=YYYY`, showing: Cumplimiento SG-SST, Total Acciones, Tasa Eficacia, Plan Trabajo Anual metrics plus Hacer/Verificar/Actuar phase details with year selector. Sign endpoints: `PATCH /api/portal-licenciado/evaluacion-sst/:id/firmar`, `PATCH /api/portal-licenciado/plan-trabajo/:id/firmar`, `PATCH /api/portal-licenciado/matriz-iperc/:id/firmar`.

The LSO license status is auto-calculated when saving license data via `PATCH /api/portal-licenciado/license`. Status is derived from `sstLicenseExpiresAt`: expired → 'vencida', ≤90 days → 'pendiente_verificacion', >90 days → 'vigente'.

The LSO Portal Empresas tab (`GET /api/portal-licenciado/empresas`) returns enriched company data including: SG-SST compliance percentage and level (from latest `evaluaciones_sst`), subscription blocked status (from `pricing_plugin_subscriptions`), vehicle count, and last activity date (from `audit_logs`). The frontend displays a progress bar for SG-SST compliance (green ≥86%, yellow ≥60%, red <60%), a non-aggressive "Acceso suspendido" badge for blocked companies, and a quick "Mensaje" button that navigates to `/mensajes-internos` with the company name as context.

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