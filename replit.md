# SST Colombia - Sistema de Salud y Seguridad en el Trabajo

## Overview
This project is an integral management system for Occupational Health and Safety (SST) in Colombia. It ensures compliance with national regulations (Resolución 0312/2019) and ISO 45001:2018 standards, offering a comprehensive digital solution for managing workers, tracking incidents, scheduling training, and generating real-time statistical reports. The system aims to be a leading tool for SST compliance and management, enhancing worker safety and operational efficiency, featuring a multi-tenant architecture, automatic company classification, and a complete PESV (Strategic Road Safety Plan) module.

## User Preferences
I prefer simple language and clear explanations. I want iterative development with regular updates. Please ask before making major architectural changes or introducing new dependencies. I prefer detailed explanations for complex features. Do not make changes to the `shared/` folder without explicit instruction.

### CRITICAL RULE: Production Database
- **Production uses EXCLUSIVELY AWS RDS** (PostgreSQL). NOT Neon.
- **Development uses Neon** (DATABASE_URL).
- **ALL automatic migrations MUST use the shared `db` instance from `server/db.ts`**, which automatically connects to AWS RDS when `NODE_ENV=production` and to Neon when in development.
- **NEVER use `neon(process.env.DATABASE_URL!)` directly in migrations**, because in production DATABASE_URL points to Neon but the app uses AWS RDS. This causes migrations to run on the wrong DB.
- **Production connection**: `server/db.ts` builds the AWS RDS connection string using `AWS_RDS_HOST`, `AWS_RDS_PASSWORD`, `AWS_RDS_USER`, `AWS_RDS_PORT`, `AWS_RDS_DATABASE`.
- **Before publishing**: Verify that ALL migrations in `server/migrations/` use `import { db } from '../db'` and `import { sql } from 'drizzle-orm'`, NOT `import { neon } from '@neondatabase/serverless'`.

## System Architecture

### UI/UX Decisions
The frontend uses React 18, TypeScript, and Vite, with Tailwind CSS and Shadcn UI for a modern, responsive interface inspired by Material Design. Navigation follows the PHVA cycle (Plan-Do-Check-Act) using horizontal tabs. Company logos are integrated into all PDF documents. The company registration flow uses a 2-step wizard, automatically calculating risk levels and applicable standards based on the CIIU code.

### Technical Implementations
The system is built with a React 18, TypeScript, Vite frontend and an Express.js, TypeScript backend using PostgreSQL with Drizzle ORM. It features an 11-Tier Role-Based Access Control (RBAC) system with multi-tenant architecture. All PDF reports adhere to a corporate standard managed by `server/services/pdf-standardizer.ts`. New forms follow a "Smart Form Pattern" with auto-generated tracking codes, type-based auto-filling, context auto-filling, and visual indicators. Universal "Back to Evaluation" navigation is implemented across relevant pages. New components are added following an "Add-Only" principle.

### System Design Choices
The system uses a client-server architecture with a RESTful API. Data integrity is ensured through Zod validations. Security features include hashed passwords, secure session management, and restricted privilege escalation. It is designed for scalability and maintainability, incorporating health checks, structured JSON logging, automated database backups, and audit logging. Form validation includes required fields, field-specific error messages, and converts empty strings to null for optional fields. A robust data encryption system compliant with Ley 1581/2012 uses AES-256-GCM with per-field key derivation for sensitive data. Companies are automatically classified by ARL risk level based on their CIIU code, using official Colombian decrees.

The PESV module manages evaluations according to Resolución 40595/2022, supporting three complexity levels and providing bidirectional traceability with SST. It incorporates ISO 31000:2018 for road risk management and ISO 39001:2012 for road safety performance management. The PESV module is evaluation-centric, with annual data scoped by `evaluacion_pesv_id` and new evaluations inheriting from previous years via `parent_evaluacion_id` to copy documentary responses. The Actuar phase (A01 - Mejora Continua, A02 - Revisión por la Dirección) is fully implemented, providing CRUD operations for actions and management review records with bidirectional traceability to SST modules.

When a company updates its `numberOfVehicles`, the system immediately detects PESV level changes and migrates active evaluations, updating the `nivel` and `numero_vehiculos` and adjusting steps. Billing for the cost difference is deferred to the next monthly invoice cycle.

The billing system operates exclusively on quote-based pricing from the landing page JWT. There is no internal price calculation engine — all prices come from the landing page (`sst-colombia.com.co`). When a company updates pricing-affecting data (CIIU, workers, vehicles) after registration, the system first sends the updated data to the landing page via `POST /api/calculate-quote`, receives a new JWT with the recalculated price, verifies it, and updates the company's quote fields. Only after successful price recalculation does the company data update proceed. If the landing page is unreachable, the update is blocked and the user is informed. A confirmation dialog warns the user before proceeding. The user licensing model includes one user per administrative role at no additional cost. A subscription blocking system manages user access based on subscription status, with Stripe webhooks updating statuses automatically.

A centralized Document Traceability System tracks all system-generated PDFs using a metadata-only approach. The system tracks SST objective progress and formal compliance, allowing linking SST Objectives with Resolución 0312/2019 Standards. The main Dashboard includes a consolidated PHVA cycle view with key metrics and alerts. The PESV Smart Forms System provides intelligent auto-fill capabilities to minimize manual data entry. Features for PESV Committee Traceability in the Worker Portal and dedicated hub pages for PESV Step 4 (P04) are included. Bidirectional traceability for SST and PESV training and PESV Training Notifications for Workers (Non-Drivers) are implemented.

The Promotions Plugin operates as an independent Sidecar Architecture module, handling promotional pricing, coupons, digital contracts with JWT-validated price locking, and a net-zero risk referral program. It communicates via the database, has dedicated API routes, its own database tables, and environment variables, with a kill-switch protocol.

The Landing Page Integration Plugin provides secure JWT verification for pricing quotes from the external landing page (`sst-colombia.com.co`). It follows Sidecar Architecture principles, providing a stable facade interface, a kill switch, type-safe contracts, and backward compatibility for legacy tokens. The quote verification flow ensures data integrity during registration and checkout by using HMAC-SHA256 signed JWTs. Prices are *not* recalculated; the app trusts the signed JWT. Trial subscriptions unlock all features for the duration of the trial.

### CRITICAL RULE: Pricing Principle (Token > Calculation)
- **The price ALWAYS comes from the JWT token from the landing page. It is NEVER recalculated during registration or checkout.**
- **It is only recalculated if the company changes data AFTER registration** (employees, vehicles, CIIU/risk).
- Flow: Landing page calculates price → JWT token → saved in `companies` table during onboarding → read from `companies` table when charging.
- **Source of truth**: `quoteBaseMonthlyPrice`, `quoteCurrentPeriodPrice`, `quoteCouponCode` fields in the `companies` table.
- **Affected endpoints**: `billing.ts /activate` and `pricing_plugin/routes-v2.ts /create-checkout-v2` both read from the `companies` table. If no quote exists, the system returns an error requiring the company to obtain a quote from the landing page.
- **Post-registration recalculation**: When a company changes pricing-affecting fields (CIIU, workers, vehicles), `POST /api/companies/:id/recalculate-quote` sends the new data to the landing page, receives a new JWT, and updates the quote fields. The UI shows a confirmation dialog before proceeding.
- **NEVER calculate prices internally. All prices come from the landing page JWT.**

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