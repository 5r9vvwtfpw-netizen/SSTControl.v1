# SST Colombia - Sistema de Salud y Seguridad en el Trabajo

## Overview
This project is an integral management system for Occupational Health and Safety (SST) in Colombia, ensuring compliance with national regulations (Resolución 0312/2019) and ISO 45001:2018 standards. It offers a comprehensive digital solution for managing workers, tracking incidents, scheduling training, conducting safety inspections, and generating real-time statistical reports. The system aims to be a leading digital tool for SST compliance and management, enhancing worker safety and operational efficiency within the Colombian market, featuring a multi-tenant architecture, automatic company classification, and a complete PESV module.

## User Preferences
I prefer simple language and clear explanations. I want iterative development with regular updates. Please ask before making major architectural changes or introducing new dependencies. I prefer detailed explanations for complex features. Do not make changes to the `shared/` folder without explicit instruction.

### Secure Coding Principles
1. **Add-Only Principle**: Do not modify existing code; only add new code. Create new files/components instead of editing existing ones.
2. **Secure Development**: Follow established patterns, validations, and maintain architectural coherence.

## Recent Changes

### January 22, 2026
- **Created**: `client/src/components/ParticipantDialogEnhanced.tsx`
  - Enhanced version of ParticipantDialogSmart.tsx with `participationDate` field support
  - Adds shadcn/ui DatePicker (Calendar + Popover) for selecting participation dates
  - Defaults to current date for new participant entries
  - Includes full form validation with Zod schema including `participationDate: z.string().optional()`
  - Sends `participationDate` in API payload to backend
  - Maintains all existing functionality: worker auto-fill, SST license handling, role selection
  - Proper date formatting for Colombian locale (es-CO)
  - Note: ParticipantDialogSmart.tsx remains unchanged (follows Add-Only principle)

- **Created**: `client/src/lib/finding-payload-adapter.ts`
  - New adapter module to fix "finding_description NOT NULL" constraint violation in investigation_findings table
  - Transforms form data to populate both `description` and `finding_description` fields
  - Includes validation to ensure no required fields are empty
  - Resolves production error in Investigación Accidentes feature

## System Architecture

### UI/UX Decisions
The frontend uses React 18, TypeScript, and Vite, with Tailwind CSS and Shadcn UI for a modern, responsive, Material Design-inspired interface. Navigation aligns with the PHVA cycle (Plan-Do-Check-Act) using horizontal tabs. Company logos are integrated into all PDF documents.

**Company Registration Flow (CIIU-First):** The company creation form (`CrearEmpresaCiiuFirst.tsx`) uses a 2-step wizard that asks for CIIU code first. This automatically calculates the risk level (I-V) using Decreto 1607/2002 before showing applicable standards. This prevents false expectations where users with high-risk activities (IV/V) would need 61 standards regardless of worker count.

**CIIU Integration Components (January 2026):**
- `IpercCiiuFilter.tsx`: Filters sector-specific hazards by CIIU code with normative references, PPE requirements, and training recommendations
- `EstandaresLiberadosCiiu.tsx`: Determines applicable standards using CIIU→Risk Level→Chapter chain per Resolución 0312/2019 (7 Ch.1 / 21 Ch.2 / 61 Ch.3)
- `IpercIntegracionCiiu.tsx`: Integration wrapper combining filters and standards with unified `CompanyContext` interface
- Core function `calcularContextoIperc()` serves as single source of truth for the CIIU→Riesgo→Capítulo→Estándares chain

### Technical Implementations
The system is built with a React 18, TypeScript, Vite frontend and an Express.js, TypeScript backend using PostgreSQL with Drizzle ORM. It features an 11-Tier Role-Based Access Control (RBAC) system with multi-tenant architecture. Key modules include comprehensive compliance for Resolution 0312/2019 standards, ISO 45001:2018 internal audits, management reviews, EVS, COPASST management, virtual training, smart induction, sociodemographic profiling, accident investigation and statistics, worker absenteeism control, and EPP delivery management. The system tracks SST evaluations year-to-year, offering data inheritance and review workflows, automated email notifications, a worker portal, Stripe-integrated billing, an interactive chatbot, and full legal compliance for Habeas Data and GDPR.

### System Design Choices
The system uses a client-server architecture with a RESTful API. Data integrity is ensured through Zod validations. Security features include hashed passwords, secure session management, and restricted privilege escalation. It is designed for scalability and maintainability, incorporating health checks, structured JSON logging, automated database backups, and audit logging. Form validation uses required fields, field-specific error messages, and converts empty strings to null for optional fields. A robust data encryption system compliant with Ley 1581/2012 uses AES-256-GCM with per-field key derivation for sensitive data, enabling searchable hashes for querying encrypted fields. The system automatically classifies companies by ARL risk level based on their CIIU code, using official Colombian decrees.

## External Dependencies

-   **PostgreSQL (Neon/AWS RDS)**: Cloud-hosted relational database.
-   **TanStack Query v5**: Frontend data fetching and state management.
-   **Wouter**: Lightweight React routing library.
-   **React Hook Form + Zod**: Form management and validation.
-   **Express.js**: Backend web application framework.
-   **Drizzle ORM**: TypeScript ORM for PostgreSQL.
-   **Passport.js**: Node.js authentication middleware.
-   **PDFKit**: PDF document generation library.
-   **Resend**: Email sending service for automated notifications.
-   **Stripe**: Payment gateway for subscription billing and extra seat purchases.
-   **Tailwind CSS**: Utility-first CSS framework.
-   **Shadcn UI**: UI component library built on Tailwind CSS.
-   **Amazon S3**: Cloud object storage for file uploads with 20-year retention compliance.
-   **AWS SDK v3**: For S3 operations.