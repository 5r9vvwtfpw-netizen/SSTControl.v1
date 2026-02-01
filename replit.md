# SST Colombia - Sistema de Salud y Seguridad en el Trabajo

## Overview
This project is an integral management system for Occupational Health and Safety (SST) in Colombia, ensuring compliance with national regulations (Resolución 0312/2019) and ISO 45001:2018 standards. It provides a comprehensive digital solution for managing workers, tracking incidents, scheduling training, conducting safety inspections, and generating real-time statistical reports. The system aims to be a leading digital tool for SST compliance and management, enhancing worker safety and operational efficiency within the Colombian market, featuring a multi-tenant architecture, automatic company classification, and a complete PESV module.

## User Preferences
I prefer simple language and clear explanations. I want iterative development with regular updates. Please ask before making major architectural changes or introducing new dependencies. I prefer detailed explanations for complex features. Do not make changes to the `shared/` folder without explicit instruction.

## System Architecture

### UI/UX Decisions
The frontend uses React 18, TypeScript, and Vite, with Tailwind CSS and Shadcn UI for a modern, responsive, Material Design-inspired interface. Navigation aligns with the PHVA cycle (Plan-Do-Check-Act) using horizontal tabs. Company logos are integrated into all PDF documents. The company registration flow uses a 2-step wizard that asks for the CIIU code first to automatically calculate the risk level and determine applicable standards.

### Technical Implementations
The system is built with a React 18, TypeScript, Vite frontend and an Express.js, TypeScript backend using PostgreSQL with Drizzle ORM. It features an 11-Tier Role-Based Access Control (RBAC) system with multi-tenant architecture. All PDF reports adhere to a corporate standard managed by `server/services/pdf-standardizer.ts`. New forms follow a "Smart Form Pattern" that includes auto-generated tracking codes, type-based auto-filling, context auto-filling, and visual indicators for auto-filled fields. Universal "Back to Evaluation" navigation has been implemented across relevant pages using URL parameters. New components are added following an "Add-Only" principle.

### System Design Choices
The system uses a client-server architecture with a RESTful API. Data integrity is ensured through Zod validations. Security features include hashed passwords, secure session management, and restricted privilege escalation. It is designed for scalability and maintainability, incorporating health checks, structured JSON logging, automated database backups, and audit logging. Form validation uses required fields, field-specific error messages, and converts empty strings to null for optional fields. A robust data encryption system compliant with Ley 1581/2012 uses AES-256-GCM with per-field key derivation for sensitive data, enabling searchable hashes for querying encrypted fields. The system automatically classifies companies by ARL risk level based on their CIIU code, using official Colombian decrees.

The PESV (Strategic Road Safety Plan) module manages evaluations according to Resolución 40595/2022, supporting three complexity levels and providing bidirectional traceability with SST. It incorporates ISO 31000:2018 for road risk management with a 5x5 probability/impact matrix and ISO 39001:2012 for road safety performance management, including Safety Performance Factors (SPF) and Safety Performance Indicators (SPI). The billing system includes a robust validator (`server/lib/billing-validator.ts`) to ensure data integrity before invoice generation and insertion, utilizing Zod schema validation, company validation, and subscription validation. It also provides a health check endpoint for monitoring billing system operations.

The system incorporates a comprehensive pricing calculator (V2) which integrates SST, PESV, and user licensing, with real-time cost breakdowns and Stripe checkout. The user licensing model includes one user per administrative role at no additional cost, with additional users charged per month. A critical aspect of the Stripe integration is the handling of COP as a non-zero-decimal currency, requiring all prices to be multiplied by 100 for API calls.

A subscription blocking system is in place to manage user access based on subscription status (`trial`, `active`, `past_due`, `blocked`, `cancelled`, `no_subscription`, `trial_expired`), with specific middleware and UI components to enforce access restrictions. Stripe webhooks are integrated to update subscription statuses automatically.

A centralized Document Traceability System provides tracking of all system-generated PDFs using a metadata-only approach. It registers documents with metadata like source module, endpoint, and record ID, and provides API endpoints for retrieval and statistics.

The Promotions Plugin (`plugins/promotions/`) follows a Sidecar Architecture pattern, operating independently with its own database tables and API routes. It features a coupon system, digital contracts with JWT-validated price locking, and a net-zero risk referral program. It communicates with the main system via the database and requires specific environment variables for functionality.

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