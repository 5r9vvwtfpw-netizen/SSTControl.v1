# SST Colombia - Sistema de Salud y Seguridad en el Trabajo

## Overview
This project is an integral management system for Occupational Health and Safety (SST) in Colombia. It ensures compliance with national regulations (Resolución 0312/2019) and ISO 45001:2018 standards, offering a comprehensive digital solution for managing workers, tracking incidents, scheduling training, and generating real-time statistical reports. The system aims to be a leading tool for SST compliance and management, enhancing worker safety and operational efficiency, featuring a multi-tenant architecture, automatic company classification, and a complete PESV (Strategic Road Safety Plan) module.

## User Preferences
I prefer simple language and clear explanations. I want iterative development with regular updates. Please ask before making major architectural changes or introducing new dependencies. I prefer detailed explanations for complex features. Do not make changes to the `shared/` folder without explicit instruction.

## System Architecture

### UI/UX Decisions
The frontend uses React 18, TypeScript, and Vite, with Tailwind CSS and Shadcn UI for a modern, responsive interface inspired by Material Design. Navigation follows the PHVA cycle (Plan-Do-Check-Act) using horizontal tabs. Company logos are integrated into all PDF documents. The company registration flow uses a 2-step wizard, automatically calculating risk levels and applicable standards based on the CIIU code.

### Technical Implementations
The system is built with a React 18, TypeScript, Vite frontend and an Express.js, TypeScript backend using PostgreSQL with Drizzle ORM. It features an 11-Tier Role-Based Access Control (RBAC) system with multi-tenant architecture. All PDF reports adhere to a corporate standard managed by `server/services/pdf-standardizer.ts`. New forms follow a "Smart Form Pattern" with auto-generated tracking codes, type-based auto-filling, context auto-filling, and visual indicators. Universal "Back to Evaluation" navigation is implemented across relevant pages. New components are added following an "Add-Only" principle.

### System Design Choices
The system uses a client-server architecture with a RESTful API. Data integrity is ensured through Zod validations. Security features include hashed passwords, secure session management, and restricted privilege escalation. It is designed for scalability and maintainability, incorporating health checks, structured JSON logging, automated database backups, and audit logging. Form validation includes required fields, field-specific error messages, and converts empty strings to null for optional fields. A robust data encryption system compliant with Ley 1581/2012 uses AES-256-GCM with per-field key derivation for sensitive data, enabling searchable hashes. Companies are automatically classified by ARL risk level based on their CIIU code, using official Colombian decrees.

The PESV module manages evaluations according to Resolución 40595/2022, supporting three complexity levels and providing bidirectional traceability with SST. It incorporates ISO 31000:2018 for road risk management and ISO 39001:2012 for road safety performance management. The billing system includes a robust validator (`server/lib/billing-validator.ts`) for data integrity before invoice generation, utilizing Zod schema validation, company validation, and subscription validation, and provides a health check endpoint.

The system incorporates a comprehensive pricing calculator (V2) integrating SST, PESV, and user licensing, with real-time cost breakdowns and Stripe checkout. The user licensing model includes one user per administrative role at no additional cost, with additional users charged monthly. Stripe integration handles COP as a non-zero-decimal currency, requiring amounts to be multiplied by 100 for API calls.

A subscription blocking system manages user access based on subscription status (`trial`, `active`, `past_due`, `blocked`, `cancelled`, `no_subscription`, `trial_expired`), with specific middleware and UI components enforcing restrictions. Stripe webhooks update subscription statuses automatically.

A centralized Document Traceability System tracks all system-generated PDFs using a metadata-only approach, registering documents with source module, endpoint, and record ID, and providing API endpoints for retrieval and statistics.

The system tracks SST objective progress (`porcentaje_avance`) and formal compliance, adhering to Art. 2.2.4.6.19 of Decreto 1072/2015. It also allows linking SST Objectives with Resolución 0312/2019 Standards to automatically calculate objective advancement based on standard compliance, using a `objetivos_estandares_vinculacion` table and dedicated API endpoints.

The main Dashboard includes a consolidated PHVA cycle view through the `PHVASummary` component, providing 4-phase cards with key metrics, traceability links, additional KPIs, and alerts for overdue actions, integrating with `/api/dashboard-hacer`, `/api/dashboard-verificar`, and `/api/dashboard-actuar`.

**PESV Smart Forms System**: The system includes an intelligent auto-fill capability for PESV cycle forms (Planear, Hacer, Verificar, Actuar) that minimizes manual data entry. Key files:
- `client/src/hooks/usePesvSmartPrefill.ts`: Central hook that consolidates data from company, vehicles, drivers, workers, and SST objectives APIs.
- `client/src/hooks/usePesvStepPrefill.ts`: Resolver hook that maps step codes (P01, H02, etc.) to field-level auto-fill values.
- `client/src/data/pesv-smart-prefill-map.ts`: Prefill mapping configuration covering all 24 PESV steps.
- `client/src/components/pesv/SmartPrefillBanner.tsx`: UI component showing detected fields and apply/clear actions.
- `client/src/components/pesv/PesvSmartFormExample.tsx`: Reference implementation with zodResolver validation.

Integration pattern: Import `usePesvStepPrefill(stepCode)` → render `SmartPrefillBanner` → apply `defaultValues` via `useEffect` with `form.setValue()`.

The Promotions Plugin (`plugins/promotions/`) operates as an independent Sidecar Architecture module, handling promotional pricing, coupons, digital contracts with JWT-validated price locking, and a net-zero risk referral program ("Aliados 2026"). It communicates with the main system via the database and has dedicated API routes mounted at `/api/plugins/promotions/*`. It features its own database tables (`plugin_promotion_coupons`, `plugin_referral_ledger`, `plugin_digital_contracts`, `plugin_credit_usage_history`) and environment variables for functionality. A kill-switch protocol allows for its complete removal without affecting the main system.

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