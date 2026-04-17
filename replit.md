# SST Colombia - Sistema de Salud y Seguridad en el Trabajo

## Overview
This project is an integral management system for Occupational Health and Safety (SST) in Colombia, designed for compliance with national regulations (Resolución 0312/2019) and ISO 45001:2018 standards. It offers a comprehensive digital solution for managing workers, tracking incidents, scheduling training, and generating real-time statistical reports. The system aims to be a leading tool for SST compliance and management, enhancing worker safety and operational efficiency through features like multi-tenant architecture, automatic company classification, and a complete Strategic Road Safety Plan (PESV) module, aligned with ISO 39001:2012.

## User Preferences
I prefer simple language and clear explanations. I want iterative development with regular updates. Please ask before making major architectural changes or introducing new dependencies. I prefer detailed explanations for complex features. Do not make changes to the `shared/` folder without explicit instruction.

## System Architecture

### UI/UX Decisions
The frontend uses React 18, TypeScript, and Vite, with Tailwind CSS and Shadcn UI, inspired by Material Design. Navigation follows the PHVA cycle using horizontal tabs. Company logos are integrated into all PDF documents. The company registration process uses a 2-step wizard that automatically calculates risk levels and applicable standards based on the CIIU code. The landing page has been redesigned with a focus on conversion, highlighting statistics, problem/solution comparisons, PHVA cycle phases, key differentiators, and clear CTAs for pricing and demos.

### Technical Implementations
The system employs a client-server architecture with a React 18 frontend and an Express.js, TypeScript backend using PostgreSQL with Drizzle ORM. It features an 11-Tier Role-Based Access Control (RBAC) system and multi-tenancy. PDF reports adhere to a corporate standard. New forms implement a "Smart Form Pattern" with auto-generated tracking codes and context-based auto-filling. Data integrity is maintained through Zod validations. Security includes hashed passwords, secure session management, restricted privilege escalation, and AES-256-GCM data encryption.

The PESV module manages evaluations according to Resolución 40595/2022, supporting three complexity levels with bidirectional traceability to SST, incorporating ISO 31000:2018 and ISO 39001:2012. It covers 24 steps (P01-P08 Planear, H01-H11 Hacer, V01-V03 Verificar, A01-A02 Actuar), with specific modules for Fatiga y Somnolencia (H09), Alcohol y Sustancias Psicoactivas (H10), and Atención a Víctimas (H11). Critical server routes in these modules use `rowToCamel()` for snake_case to camelCase conversion to ensure proper data display.

A Sidecar module handles accounting integration, sending invoice data and saving DIAN CUFE. The billing system uses quote-based pricing, a free administrative user per company, and a subscription blocking system via Stripe webhooks. A centralized Document Traceability System tracks all system-generated PDFs. The main Dashboard provides a consolidated PHVA cycle view. The Promotions Plugin manages promotional pricing, coupons, digital contracts, and a referral program. The Landing Page Integration Plugin provides secure JWT verification for pricing quotes.

The Ministerio del Trabajo PDF report implements the "Hilo Dorado" traceability system. The Company Sedes module allows managing multiple branches/locations per company with appropriate RBAC. An Excel worker import system uses a tolerant normalization pipeline. External LSO assignment auto-provisions user accounts or notifies existing ones, with license status auto-calculated. The LSO Digital Signature System implements mandatory professional signatures across 5 document types, storing images in Replit Object Storage. The LSO portal features a two-level "Company Vault" navigation, a PHVA Dashboard Panel, enriched company data, and a Removal Notification System. The LSO Portal Soporte tab allows creating and managing support tickets. The Superadmin Portal Administration panel manages LSO and Worker portals.

The Support Portal includes a real-time internal chat system using WebSockets, supporting @mentions, unread indicators, and file/image uploads, with ticket archiving and auto-assignment. Admin and superadmin pages utilize a "Company Vault System" or "Professional Vault System" for data grouping and filtering. The NGO Portal Integration receives and stores `company.onboarded` webhooks from an external NGO sidecar.

### System Design Choices
Companies are automatically classified by ARL risk level based on their CIIU code. The PESV module is evaluation-centric, with annual data scoping and inheritance from previous years. PESV level changes are automatically detected and migrated. The P01 auto-verification panel uses `memo` isolation. Production uses AWS RDS PostgreSQL on Replit Autoscale, development uses Neon PostgreSQL. Performance optimizations include database indexes, connection pooling, PDF concurrency limiting, pagination, and N+1 query fixes.

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