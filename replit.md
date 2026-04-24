# SST Colombia - Sistema de Salud y Seguridad en el Trabajo
**Versión actual: v4.0.0**

## Overview
This project is an integral management system for Occupational Health and Safety (SST) in Colombia, designed for compliance with national regulations (Resolución 0312/2019) and ISO 45001:2018 standards. It offers a comprehensive digital solution for managing workers, tracking incidents, scheduling training, and generating real-time statistical reports. The system aims to be a leading tool for SST compliance and management, enhancing worker safety and operational efficiency through features like multi-tenant architecture, automatic company classification, and a complete Strategic Road Safety Plan (PESV) module.

## User Preferences
I prefer simple language and clear explanations. I want iterative development with regular updates. Please ask before making major architectural changes or introducing new dependencies. I prefer detailed explanations for complex features. Do not make changes to the `shared/` folder without explicit instruction.

## System Architecture

### UI/UX Decisions
The frontend uses React 18, TypeScript, and Vite, with Tailwind CSS and Shadcn UI, inspired by Material Design. Navigation follows the PHVA cycle using horizontal tabs. Company logos are integrated into all PDF documents. The company registration process uses a 2-step wizard that automatically calculates risk levels and applicable standards based on the CIIU code.

### Technical Implementations
The system employs a client-server architecture with a React 18 frontend and an Express.js, TypeScript backend using PostgreSQL with Drizzle ORM. It features an 11-Tier Role-Based Access Control (RBAC) system and multi-tenancy. PDF reports adhere to a corporate standard. New forms implement a "Smart Form Pattern" with auto-generated tracking codes and context-based auto-filling. Data integrity is maintained through Zod validations. Security includes hashed passwords, secure session management, restricted privilege escalation, and AES-256-GCM data encryption. Companies are automatically classified by ARL risk level based on their CIIU code.

A comprehensive **Colombia Timezone Protection Layer** is implemented in `client/src/lib/utils/formatters.ts` with three utilities: `getTodayDateString()` (today's date in YYYY-MM-DD for Colombia), `formatDateCO()` (display any date string without UTC drift), and `toDateInputValue()` (convert Date objects or strings to `<input type="date">` values using America/Bogota timezone). These are applied across all form initializations and display components to prevent the +/- 1 day drift caused by UTC vs Colombia (UTC-5) timezone differences when creating records late at night or early morning.

The PESV module manages evaluations according to Resolución 40595/2022, supporting three complexity levels with bidirectional traceability to SST, incorporating ISO 31000:2018 and ISO 39001:2012. It's evaluation-centric, with annual data scoping and inheritance from previous years. The Actuar phase is fully implemented with CRUD and bidirectional traceability. PESV level changes are automatically detected and migrated. The PESV navigation covers 24 steps (P01-P08 Planear, H01-H11 Hacer, V01-V03 Verificar, A01-A02 Actuar). Specific modules (H09, H10, H11) provide CRUD management of control records. Server routes for H09/H10/H11 use `rowToCamel` helper function for data consistency.

A Sidecar module handles accounting integration, sending invoice data and saving DIAN CUFE. The billing system uses quote-based pricing, with a subscription blocking system updated via Stripe webhooks. A centralized Document Traceability System tracks all system-generated PDFs. SST objective progress and compliance are tracked, allowing linkage with Resolución 0312/2019 standards. The main Dashboard provides a consolidated PHVA cycle view. A Promotions Plugin handles promotional pricing, coupons, digital contracts, and a net-zero risk referral program. A Landing Page Integration Plugin provides secure JWT verification for pricing quotes. The Ministerio del Trabajo PDF report implements the "Hilo Dorado" traceability system.

The Company Sedes module allows managing multiple branches/locations per company with proper RBAC. The Excel worker import system uses a tolerant normalization pipeline. When an external LSO (Occupational Health and Safety License Holder) is assigned, the system auto-provisions a user account or sends a notification. LSO license status is auto-calculated. The LSO Digital Signature System implements mandatory professional signatures across 5 required document types. The LSO portal features a two-level "Company Vault" navigation and a PHVA Dashboard Panel, displaying enriched company data and supporting ticket creation. The Superadmin Portal Administration panel manages LSO and Worker portals.

The Support Portal includes a real-time internal chat system for agent coordination using WebSockets, supporting @mentions, unread indicators, and file/image uploads. Support tickets have an archive system and auto-assignment. Admin and superadmin pages utilize a "Company Vault System" or "Professional Vault System" for data filtering. The NGO Portal Integration receives `company.onboarded` webhooks from an external NGO sidecar.

A Compliance Alerts System (v3.9.0) runs automated cron jobs generating 4 types of alerts: incomplete 0312 standards (Mondays), pending annual evaluation (monthly), overdue improvement plan actions (daily), and companies without evaluation started (Mondays). Each alert creates a COPASST notification + sends email to admin, with deduplication windows. Manual trigger available at `POST /api/admin/trigger-compliance-alerts` (superadmin only).

The Organigrama SST module (`/organigrama-sst`) provides a visual hierarchical display of the SST organizational structure, pulling data from existing modules: company info (legal rep), COPASST periods/members, brigadas de emergencia. Includes print support and normative references (Decreto 1072/2015 Art. 2.2.4.6.8).

The Matriz Legal includes 3 new entries added via migration (`syncMatrizLegalNormas`): Resolución 2346/2007 Art. 4-5 (Profesiograma), Decreto 1072/2015 Art. 2.2.4.6.8 (Organigrama SST), Resolución 2646/2008 Art. 8 (Perfil Sociodemográfico). These are idempotently applied to all existing companies on startup.

An Onboarding Gate system (`WelcomeGate` component) blocks company-level users until superadmin marks induction as complete. New companies start with `onboarding_completed = 0` and see a full-screen welcome page with scheduling CTAs. Superadmin unlocks via Companies Management (`PATCH /api/companies/:id/complete-onboarding`). Roles superadmin, soporte, lso, lso_externo bypass the gate. All pre-existing companies were migrated to `onboarding_completed = 1` on feature deploy.

The PESV Evaluaciones page (`/pesv/evaluaciones`) implements the "Company Vault" pattern for superadmin: a company cards grid grouped by company with latest compliance score and PESV level; clicking a company drills into that company's evaluations with year filter. Non-superadmin users see their own evaluations directly. Mirrors the same pattern as EvaluacionesSst.tsx. Stripe payment notifications: corrected amount from cents (÷100), added renewal notifications on `invoice.paid` for `subscription_cycle` events. Internal team chat redesigned with dark Slack-style theme (slate-800 background, active channel in blue).

### Database & Infrastructure
The production environment uses AWS RDS PostgreSQL, deployed on Replit Autoscale. Development uses Replit-provisioned Neon PostgreSQL. The system employs database indexes, a connection pool, PDF concurrency limiting, pagination, and N+1 query fixes for performance optimization.

## External Dependencies

-   **AWS RDS PostgreSQL**: Production relational database.
-   **Neon PostgreSQL**: Development-only database.
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