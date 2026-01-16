# SST Colombia - Sistema de Salud y Seguridad en el Trabajo

## Overview
This project is an integral management system for Occupational Health and Safety (SST) in Colombia. It ensures compliance with national regulations (Resolución 0312/2019) and international ISO 45001:2018 standards. The system offers a comprehensive digital solution for managing workers, tracking incidents, scheduling training, conducting safety inspections, and generating real-time statistical reports. It aims to be a leading digital tool for SST compliance and management, enhancing worker safety and operational efficiency within the Colombian market. Key features include a multi-tenant architecture, automatic company classification, and a complete PESV module.

## User Preferences
I prefer simple language and clear explanations. I want iterative development with regular updates. Please ask before making major architectural changes or introducing new dependencies. I prefer detailed explanations for complex features. Do not make changes to the `shared/` folder without explicit instruction.

## System Architecture

### UI/UX Decisions
The frontend uses React 18, TypeScript, and Vite, with Tailwind CSS and Shadcn UI for a modern, responsive, Material Design-inspired interface. Navigation aligns with the PHVA cycle (Plan-Do-Check-Act) using horizontal tabs. Company logos are integrated into all PDF documents.

### Technical Implementations
-   **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Shadcn UI, TanStack Query v5, Wouter, React Hook Form + Zod.
-   **Backend**: Express.js, TypeScript, PostgreSQL (Neon) with Drizzle ORM, Passport.js for authentication, Scrypt for password hashing.
-   **Authentication & Authorization**: 11-Tier Role-Based Access Control (RBAC) with granular permissions and multi-tenant access. Support Staff Isolation restricts `soporte` role access.
-   **Multi-Tenant Architecture**: Supports multiple companies with data isolation.
-   **Reporting**: PDF generation for normative SST reports.
-   **Compliance Modules**: Implements 7 Minimum SST Standards (Resolution 0312/2019), Internal Audits (ISO 45001:2018), Management Review (ISO 45001:2018), ARL Recommendations, IPERC, Emergency Plan, Document Management, Afiliaciones SSSS Automation, COPASST Management, and EVS (Estilos de Vida Saludable) Module.
-   **PHVA Cycle Traceability**: SST evaluations include score tracking by PHVA cycle, automatically calculated and displayed.
-   **EVS Module (Standard 3.1.7)**: Professional module for healthy lifestyle management implementing PHVA cycle with programs, activities, health controls, incident tracking, and case follow-ups.
-   **Email Notification System**: Automated notifications via Resend for various events.
-   **Worker Portal Access System**: Automated credential generation and delivery.
-   **Billing & Subscription System**: Monetization with Stripe integration, trial management, plan changes, and invoicing.
-   **Interactive Chatbot Assistant**: Floating chatbot with FAQ/user manual functionality.
-   **Legal Compliance**: Full-stack implementation of Colombian Habeas Data and GDPR, and SaaS service contract modal.
-   **Chapter-Based Module Restrictions**: Automatic module access control based on company chapter (Resolución 0312/2019) with filtered navigation.
-   **SEO**: Comprehensive SEO with meta tags, Open Graph, Twitter Cards, and JSON-LD.
-   **COPASST Electoral Cycle Module**: Manages the full electoral process for COPASST with PDF generation.
-   **Virtual Training Module**: Features courses, quizzes, certificates, gamification, and interactive scenarios. Includes a CMS and 360° evaluation system.
-   **Smart Induction Module (Standard 1.2.2)**: Intelligent induction registration with auto-complete for worker data, predefined dropdowns for responsible parties, and worker portal integration.
-   **Sociodemographic Profile (Standard 3.1.1)**: Real data traceability for worker demographics and health conditions, with statistical displays and health conditions API.
-   **Accident Investigation Module (Standard 3.2.1)**: Complete investigation lifecycle management per Resolución 1401/2007 with 15-day SLA tracking (color-coded indicators: green/yellow/red), COPASST participation requirement, licensed professional verification for severe/fatal cases, findings/causes analysis, and corporate PDF generation.
-   **Accident Statistics Module (Standard 3.2.2)**: Statistical register with IF, IS, ILI indicators calculation, trend analysis, comparative reports, and integration with SST evaluation workflow.
-   **Worker Absenteeism Control Module (Standard 3.2.3)**: Comprehensive absenteeism tracking by type (AT/EL/common illness), automatic calculation of absenteeism rate, frequency rate, and average duration, dashboard with Recharts visualizations, and integration with document management.
-   **Year-to-Year Traceability for SST Evaluations**: When creating annual evaluations, system offers to copy persistent data from previous year's evaluation. 36 persistent standards (e.g., responsible designation, policies, COPASST) are automatically inherited with review badges, while 21 annual standards (e.g., training programs, statistics) require new evidence. Inherited responses are marked for review/confirmation workflow. Includes historical comparison endpoint for trend analysis.
-   **EPP Delivery Management Module**: Complete Personal Protective Equipment (EPP) management with intelligent catalog assistant. Features include:
    - Master EPP catalog with 44+ items covering 9 protection categories (head, visual, auditory, respiratory, hands, feet, body, fall protection, facial, other)
    - Compliance with Colombian norms (NTC, ANSI, EN standards) per Decreto 1072/2015 and Resolución 2400/1979
    - Intelligent catalog assistant with dropdown selection and auto-fill capabilities
    - Worker selection with automatic EPP recommendations based on job position
    - Delivery tracking with digital signatures and condition tracking (nuevo/reposición/cambio_talla)
    - Integration with document management for delivery receipts
    - Chapter-based access: Available for ALL chapters (1, 2, 3)

### System Design Choices
The system uses a client-server architecture with a RESTful API. Data integrity is ensured through Zod validations. Security features include hashed passwords, secure session management, and restricted privilege escalation, designed for scalability and maintainability. Infrastructure includes health checks, structured JSON logging, automated database backups, and audit logging. Form validation uses required fields, field-specific error messages, and converts empty strings to null for optional fields.

### Data Encryption System (Ley 1581/2012 Compliance)
-   **Encryption Algorithm**: AES-256-GCM with per-field key derivation using HMAC-SHA256.
-   **Encrypted Worker Data**: name, identificationNumber, phone, address, healthConditions, medicalHistory, emergencyContactPhone, emergencyContactName, bankAccountNumber, observations, birthDate, bloodType, allergies, medications, disabilities.
-   **Encrypted Company Data**: nit, address, phone, legalRepresentativeName, legalRepresentativeId, legalRepresentativePhone, legalRepresentativeEmail.
-   **Encrypted Document Data**: fileName, description, observations.
-   **Encrypted Evaluation Data**: observations, findings, recommendations, evidenceNotes, actionPlan, complianceNotes, auditNotes.
-   **Searchable Hashes**: HMAC-based hashes for worker identification, company NIT, and worker name enable database queries on encrypted fields.
-   **Production Enforcement**: System throws error if ENCRYPTION_MASTER_KEY is not configured in production environment.
-   **Dual-Layer Security**: OWNER_LICENSE_KEY for software ownership protection, ENCRYPTION_MASTER_KEY for data confidentiality.

## External Dependencies

-   **PostgreSQL (Neon)**: Cloud-hosted relational database.
-   **TanStack Query v5**: Frontend data fetching and state management.
-   **Wouter**: Lightweight React routing library.
-   **React Hook Form + Zod**: Form management and validation.
-   **Express.js**: Backend web application framework.
-   **Drizzle ORM**: TypeScript ORM for PostgreSQL.
-   **Passport.js**: Node.js authentication middleware.
-   **PDFKit**: PDF document generation library.
-   **Resend**: Email sending service for automated notifications.
-   **Stripe**: Payment gateway for subscription billing.
-   **Tailwind CSS**: Utility-first CSS framework.
-   **Shadcn UI**: UI component library built on Tailwind CSS.
-   **Amazon S3**: Cloud object storage for file uploads (20-year retention compliance).
-   **AWS SDK v3**: For S3 operations.

## Recent Changes (January 2026)

### Form Improvements
-   **IPERC GTC-45 Auto-fill**: When selecting predefined hazards OR changing the hazard classification directly, the system now auto-fills Activity/Process, Source, and Location fields based on hazard type (7 classifications mapped: biológico, físico, químico, psicosocial, biomecánico, condiciones_seguridad, fenómenos_naturales).
-   **Training Form Simplification**: Removed company selector - forms now automatically use the authenticated user's company.
-   **Context Analysis Assistant**: Added intelligent assistant with 5 predefined templates for context analysis (External, Internal, PESTEL, Stakeholders, Risks/Opportunities).

### Plan Anual de Trabajo
-   **New Status**: Added "En Ejecución" status to track plans currently being implemented.
-   **Module Navigation**: Added navigation buttons to quickly access related modules from each activity in the annual plan.

### EPP Delivery Module
-   **Date Type Fix**: Fixed type mismatch between HTML date inputs and schema, enabling successful form submissions.
-   **PATCH Endpoint**: Added PATCH endpoint for updating existing EPP deliveries.

### UI/UX Enhancements
-   **Dashboard Redesign**: Professional, calm color scheme appropriate for corporate SST management.
-   **Real-time Updates**: Dashboard "Próximas Capacitaciones" section now auto-refreshes every 30 seconds with manual refresh button.
-   **Tickets Page Layout**: "Mis Tickets" section now expands to fill available page height.
-   **Ministry Warning Modal**: Enhanced with animated warning icon, proper risk colors, and link to professional directory.

### PDF and Reporting
-   **Explanatory Error Messages**: Report generation errors now display user-friendly Spanish messages explaining the issue and suggesting solutions.
-   **Blank Page Removal**: Optimized PDF generation logic to eliminate unnecessary blank pages in legal documents.

### New Alert Component Variant
-   **Warning Variant**: Added amber/yellow warning variant to shadcn Alert component for risk-appropriate notifications.

### Portal del Profesional Licenciado (LSO)
-   **Dedicated Portal**: New portal at `/portal-licenciado` exclusively for Licensed SST Professionals (role: lso).
-   **Dashboard**: Summary cards showing assigned companies, pending documents requiring signature, signed documents, and license status with expiry warning alerts.
-   **Empresas Asignadas Tab**: Table of companies where the LSO can sign documents, showing company name, NIT, city, risk level, workers count, and assignment date.
-   **Documentos Pendientes Tab**: List of accident investigations (severe/fatal) requiring licensed professional signature with SLA status color coding.
-   **Mi Licencia Tab**: Displays license information (profession type, license number, issuer, expiry date) with visual status indicators and signature preview.
-   **Automatic Redirect**: LSO users are redirected from "/" to their portal upon login.
-   **API Endpoints**: 3 new endpoints in server/routes/licensed-professionals.ts with proper permission enforcement (portal_licenciado:access).

## Pending Tasks

### GitHub Backup (COMPLETED - January 16, 2026)
-   **Repository**: https://github.com/5r9vvwtfpw-netizen/SSTControl.v1
-   **Status**: Successfully pushed clean repository (41MB vs previous 815MB)
-   **Solution Applied**: Cleaned git history removing large backup files (sst-colombia-completo.zip)
-   **Files Excluded**: *.zip, *.tar.gz, sst-colombia-* in .gitignore

### Infrastructure & Database Migration (COMPLETED - January 16, 2026)
-   **AWS RDS PostgreSQL**: Configured in São Paulo region (database-1.cpm6200cuaih.sa-east-1.rds.amazonaws.com)
-   **Database Engine**: PostgreSQL 17.6 on AWS Graviton (ARM64)
-   **Security Group**: Port 5432 open from 0.0.0.0/0 for Replit access
-   **Environment Variables**: AWS_RDS_HOST, AWS_RDS_PORT, AWS_RDS_USER, AWS_RDS_DATABASE, AWS_RDS_PASSWORD configured
-   **Dual Database**: server/db.ts supports Neon (dev) and AWS RDS (prod) based on NODE_ENV
-   **Data Migration**: Successfully migrated 205 tables (19MB) from Neon to AWS RDS
-   **Verified Data**: 4 companies, 15 users, 79 workers, 3 trainings - all migrated correctly
-   **20-Year Retention**: AWS RDS configured for long-term SST compliance data storage