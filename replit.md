# SST Colombia - Sistema de Salud y Seguridad en el Trabajo

## Overview
This project is an integral management system for Occupational Health and Safety (SST) in Colombia, ensuring compliance with national regulations (Resolución 0312/2019) and ISO 45001:2018 standards. It provides a comprehensive digital solution for managing workers, tracking incidents, scheduling training, and generating real-time statistical reports. The system aims to be a leading tool for SST compliance and management, enhancing worker safety and operational efficiency through features like multi-tenant architecture, automatic company classification, and a complete Strategic Road Safety Plan (PESV) module.

## User Preferences
I prefer simple language and clear explanations. I want iterative development with regular updates. Please ask before making major architectural changes or introducing new dependencies. I prefer detailed explanations for complex features. Do not make changes to the `shared/` folder without explicit instruction.

## System Architecture

### UI/UX Decisions
The frontend uses React 18, TypeScript, and Vite, with Tailwind CSS and Shadcn UI, inspired by Material Design principles. Navigation is structured around the PHVA cycle (Plan-Do-Check-Act) using horizontal tabs. Company logos are integrated into all PDF documents. The company registration process utilizes a 2-step wizard that automatically calculates risk levels and applicable standards based on the CIIU code.

### Technical Implementations
The system employs a client-server architecture with a React 18, TypeScript, Vite frontend and an Express.js, TypeScript backend using PostgreSQL with Drizzle ORM. It features an 11-Tier Role-Based Access Control (RBAC) system and a multi-tenant architecture. All PDF reports adhere to a corporate standard. New forms implement a "Smart Form Pattern" with auto-generated tracking codes, type-based auto-filling, context auto-filling, and visual indicators. Universal "Back to Evaluation" navigation is provided across relevant pages. Components are added following an "Add-Only" principle.

### System Design Choices
Data integrity is maintained through Zod validations. Security features include hashed passwords, secure session management, restricted privilege escalation, and robust data encryption compliant with Ley 1581/2012 using AES-256-GCM. Companies are automatically classified by ARL risk level based on their CIIU code.

The PESV module manages evaluations according to Resolución 40595/2022, supporting three complexity levels with bidirectional traceability to SST. It incorporates ISO 31000:2018 for road risk management and ISO 39001:2012 for road safety performance management. The module is evaluation-centric, with annual data scoped by `evaluacion_pesv_id` and new evaluations inheriting from previous years via `parent_evaluacion_id`. The Actuar phase (Continuous Improvement, Management Review) is fully implemented with CRUD operations and bidirectional traceability. The system automatically detects and migrates PESV level changes when a company updates its `numberOfVehicles`.

A Sidecar module handles accounting integration, sending invoice data to external accounting software and saving DIAN CUFE if returned.

The billing system operates on quote-based pricing from the landing page. Updates to pricing-affecting data trigger a recalculation via the landing page's API, and the company's quote is updated only after successful price verification. The user licensing model includes one user per administrative role at no additional cost. A subscription blocking system, updated via Stripe webhooks, manages user access.

A centralized Document Traceability System tracks all system-generated PDFs. SST objective progress and formal compliance are tracked, allowing linking SST Objectives with Resolución 0312/2019 Standards. The main Dashboard provides a consolidated PHVA cycle view.

The Promotions Plugin, an independent Sidecar module, handles promotional pricing, coupons, digital contracts with JWT-validated price locking, and a net-zero risk referral program.

The Landing Page Integration Plugin provides secure JWT verification for pricing quotes, ensuring data integrity during registration and checkout. Trial subscriptions unlock all features.

The Ministerio del Trabajo PDF report implements the "Hilo Dorado" traceability system, visualizing the improvement cycle connecting evaluation standards, improvement actions, and work plan activities.

The Excel worker import system uses a tolerant normalization pipeline to map free-text input to valid database enum values.

When an external LSO (Occupational Health and Safety License Holder) is assigned to a company, the system auto-provisions a user account if one doesn't exist. If an LSO has an active portal account, a new assignment notification is sent instead of new credentials. The LSO license status is auto-calculated based on the expiry date.

The LSO Digital Signature System implements mandatory professional signatures across 5 document types required by Colombian regulations. Signature fields are frozen upon signing, and images are stored in Replit Object Storage. The LSO portal features a two-level "Company Vault" navigation and a PHVA Dashboard Panel.

The LSO Portal Empresas tab displays enriched company data, including SG-SST compliance, subscription status, and activity. The LSO Removal Notification System triggers when an LSO is unassigned, sending internal messages and emails. The LSO Portal Soporte tab allows LSOs to create and manage support tickets, reusing the existing support system.

The Superadmin Portal Administration panel provides comprehensive management of LSO and Worker portals, including user details, password resets, and assignment management.

The Support Portal includes a real-time internal chat system for agent coordination, utilizing WebSocket for role-restricted broadcasts. The team chat is available as a floating window in the support portal layout (FloatingTeamChat component). Support tickets have an archive system: closed/resolved tickets are hidden from the main view by default and accessible via a "Ver archivo" toggle button. Auto-assignment assigns tickets to the first agent who responds publicly.

The Evaluaciones SST page (`/evaluaciones-sst`) uses a **Company Vault System** for superadmin users: evaluations are grouped by company as clickable vault cards showing company name, latest compliance score, and year badges. Clicking a vault shows that company's evaluations with a year filter dropdown. Regular (non-superadmin) users see the traditional flat list of their own company's evaluations.

The Trabajadores page (`/trabajadores`) also uses a **Company Vault System** for superadmin users: workers are grouped by company as clickable vault cards showing company name, total worker count, active/inactive badges, and department count. Clicking a vault shows that company's workers with a back button. The Informes tab retains a company dropdown when no vault is selected and shows company context when a vault is active. Regular (non-superadmin) users see the traditional flat worker list.

The Gestión de Empresas page (`/empresas`) includes a search bar for filtering companies by name or NIT, and a subscription status filter dropdown (superadmin only) with options: all, active, trial, past_due, blocked, cancelled, sin_suscripcion. A company count badge displays "X de Y empresas".

The Gestión de Usuarios page (`/usuarios`) uses a **Company Vault System** for superadmin/global users: users are grouped by company as clickable vault cards showing company name, user count, and role distribution badges. Users without a companyId are grouped under "Sin empresa asignada". Clicking a vault shows that company's users with search and a back button. Regular users see the traditional flat user table.

The NGO Portal Integration receives `company.onboarded` webhooks from the external NGO sidecar at `POST /api/v1/ngo/company-onboarded`. Authentication uses a shared JWT secret (`CORE_API_JWT`). Records are stored in the `ngo_onboarded_companies` table with idempotency via `sidecar_invite_id`. A read endpoint at `GET /api/v1/ngo/onboarded-companies` lists all onboarded companies with optional `projectId` and `region` filters. Route file: `server/routes/ngo-webhook.ts`.

## Database & Infrastructure

### Production Environment
-   **Database**: AWS RDS PostgreSQL (production). Connection configured via `AWS_RDS_HOST`, `AWS_RDS_PASSWORD`, `AWS_RDS_USER`, `AWS_RDS_PORT`, `AWS_RDS_DATABASE` environment variables. Uses the `pg` driver with SSL and Drizzle ORM (`drizzle-orm/node-postgres`). Pool: max 15, min 2 connections with keep-alive every 60s.
-   **Deployment**: Replit Autoscale (4 vCPU / 8 GiB RAM / 3 Max). Domains: `sst-colombia.com`, `sst.sagisas.co`, `sst-control--sgsstcumplimien.replit.app`.
-   **Startup**: No FastBoot. The server only starts listening after all migrations, seeds, and route registration complete. Replit Autoscale keeps the previous deployment active until the new one passes healthchecks, so clients never see a loading page or downtime.
-   **Middleware order in `server/index.ts`**: `express.json()` → `cors` → `session` → `passport` → `static` → `requestLogger` → `requireValidLicense` → `featureGate` → routes.

### Development Environment
-   **Database**: Replit-provisioned Neon PostgreSQL (development only). Uses `DATABASE_URL` env var with `@neondatabase/serverless` driver and WebSocket transport. This is NOT the production database.
-   **Connection Logic** (`server/db.ts`): When `NODE_ENV=production` AND `AWS_RDS_HOST`/`AWS_RDS_PASSWORD` are set, the app connects to AWS RDS. Otherwise, it falls back to Neon via `DATABASE_URL`.

## External Dependencies

-   **AWS RDS PostgreSQL**: Production relational database.
-   **Neon PostgreSQL**: Development-only database (Replit-provisioned).
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