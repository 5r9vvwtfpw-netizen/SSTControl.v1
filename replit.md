# SST Colombia - Sistema de Salud y Seguridad en el Trabajo

## Overview
This project is an integral management system for Occupational Health and Safety (SST) in Colombia, designed for compliance with national regulations (Resolución 0312/2019) and ISO 45001:2018 standards. It offers a comprehensive digital solution for managing workers, tracking incidents, scheduling training, and generating real-time statistical reports. The system aims to be a leading tool for SST compliance and management, enhancing worker safety and operational efficiency through features like multi-tenant architecture, automatic company classification, and a complete Strategic Road Safety Plan (PESV) module.

## User Preferences
I prefer simple language and clear explanations. I want iterative development with regular updates. Please ask before making major architectural changes or introducing new dependencies. I prefer detailed explanations for complex features. Do not make changes to the `shared/` folder without explicit instruction.

## Critical Development Rules
**BEFORE making any change, the agent MUST:**
1. Analyze the full impact of the change across all user roles (superadmin, admin, superusuario, lso, trabajador, soporte).
2. Verify that removing, hiding, or modifying any menu item, route, or feature does NOT break access for other roles that depend on it.
3. Check `shared/route-permissions.ts` and `PHVANavigation.tsx` to understand which roles use the affected feature.
4. If a change is role-specific (e.g., "remove X for superadmin only"), ensure it is implemented with a role-based condition, NOT by deleting the item entirely.
5. This system is in PRODUCTION with real paying clients. Any broken feature can violate client contracts. Treat every change as if it affects live users.
6. When in doubt, ask the user before proceeding.

## System Architecture

### UI/UX Decisions
The frontend uses React 18, TypeScript, and Vite, with Tailwind CSS and Shadcn UI, inspired by Material Design. Navigation follows the PHVA cycle using horizontal tabs. Company logos are integrated into all PDF documents. The company registration process uses a 2-step wizard that automatically calculates risk levels and applicable standards based on the CIIU code.

### Technical Implementations
The system employs a client-server architecture with a React 18 frontend and an Express.js, TypeScript backend using PostgreSQL with Drizzle ORM. It features an 11-Tier Role-Based Access Control (RBAC) system and multi-tenancy. PDF reports adhere to a corporate standard. New forms implement a "Smart Form Pattern" with auto-generated tracking codes and context-based auto-filling.

### System Design Choices
Data integrity is maintained through Zod validations. Security includes hashed passwords, secure session management, restricted privilege escalation, and AES-256-GCM data encryption. Companies are automatically classified by ARL risk level based on their CIIU code.

The PESV module manages evaluations according to Resolución 40595/2022, supporting three complexity levels with bidirectional traceability to SST, incorporating ISO 31000:2018 and ISO 39001:2012. It's evaluation-centric, with annual data scoping and inheritance from previous years. The Actuar phase is fully implemented with CRUD and bidirectional traceability. PESV level changes are automatically detected and migrated.

The PESV navigation covers 24 steps (P01-P08 Planear, H01-H11 Hacer, V01-V03 Verificar, A01-A02 Actuar). New modules H09 (Fatiga y Somnolencia, Art. 21) and H10 (Alcohol y Sustancias Psicoactivas, Art. 22) provide CRUD management of control records with tables `pesv_fatiga_registros` and `pesv_alcohol_registros`. H11 (Atención a Víctimas, Art. 23) manages `pesv_victimas_registros`. The P01 auto-verification panel uses `memo` isolation outside `IsolatedFormProvider` to prevent re-render loops.

CRITICAL: H09/H10/H11 server routes use raw `db.execute(sql...)` which returns snake_case. A `rowToCamel` helper function converts responses to camelCase to match the Drizzle-inferred TypeScript types. All GET/POST/PUT responses in these routes must use `rowToCamel()`. Without this conversion, CRUD operations appear to fail (records don't show, edit forms are empty, edits appear to delete records).

A Sidecar module handles accounting integration, sending invoice data and saving DIAN CUFE.

The billing system uses quote-based pricing. Pricing-affecting data updates trigger recalculation and update only after verification. The licensing model includes one free administrative user per company. A subscription blocking system, updated via Stripe webhooks, manages user access.

A centralized Document Traceability System tracks all system-generated PDFs. SST objective progress and compliance are tracked, allowing linkage with Resolución 0312/2019 standards. The main Dashboard provides a consolidated PHVA cycle view.

The Promotions Plugin (Sidecar module) handles promotional pricing, coupons, digital contracts with JWT-validated price locking, and a net-zero risk referral program. The Landing Page Integration Plugin provides secure JWT verification for pricing quotes.

The Ministerio del Trabajo PDF report implements the "Hilo Dorado" traceability system, visualizing the improvement cycle.

The Company Sedes module allows managing multiple branches/locations per company. Workers can be assigned to specific sedes. The module includes CRUD operations with proper RBAC (companies:view for read, companies:create for write, workers:edit for sede assignment). Table: `company_sedes`. Workers have a `sede_id` field. Route: `/sedes` in PLANEAR > Personal. Available for all chapter levels.

The Excel worker import system uses a tolerant normalization pipeline to map free-text input to valid database enum values.

When an external LSO (Occupational Health and Safety License Holder) is assigned, the system auto-provisions a user account or sends a notification if an account exists. LSO license status is auto-calculated based on expiry.

The LSO Digital Signature System implements mandatory professional signatures across 5 required document types. Signature fields are frozen upon signing, and images are stored in Replit Object Storage. The LSO portal features a two-level "Company Vault" navigation and a PHVA Dashboard Panel.

The LSO Portal displays enriched company data, including SG-SST compliance, subscription status, and activity. An LSO Removal Notification System triggers internal messages and emails upon unassignment. The LSO Portal Soporte tab allows LSOs to create and manage support tickets.

The Superadmin Portal Administration panel provides comprehensive management of LSO and Worker portals.

The Support Portal includes a real-time internal chat system for agent coordination using WebSockets, supporting @mentions, unread indicators, and file/image uploads. Support tickets have an archive system and auto-assignment.

Several admin and superadmin pages (`/evaluaciones-sst`, `/trabajadores`, `/empresas`, `/usuarios`, `/admin-tickets`, `/dashboard-facturacion`, `/profesionales-licenciados`, `/mensajes-internos`, `/admin-portales`) utilize a "Company Vault System" or "Professional Vault System" to group and filter data by company or LSO, enhancing navigability for global users while maintaining traditional flat lists for regular users.

The NGO Portal Integration receives `company.onboarded` webhooks from an external NGO sidecar and stores records with idempotency. A read endpoint lists onboarded companies.

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

## Control de Versiones

### Esquema de Versionado
El sistema usa **versionado semántico (MAJOR.MINOR.PATCH)**. La versión se muestra en el footer de todos los portales (`client/src/components/Footer.tsx`).

| Componente | Cuándo subirlo |
|---|---|
| **PATCH** (x.x.**1**) | Correcciones de errores, ajustes menores, cambios de texto/UI |
| **MINOR** (x.**1**.0) | Funcionalidad nueva compatible: nuevo módulo, nuevo estándar, mejora significativa |
| **MAJOR** (**4**.0.0) | Rediseño completo, cambio arquitectural mayor, ruptura de compatibilidad |

### Historial de versiones

#### v3.5.0 — 13 de Abril 2026 (versión inicial documentada)
**Lógica del número:** Se escogió v3.5.0 como punto de partida coherente con la madurez del sistema:
- **v1.x** — SG-SST básico: trabajadores, evaluación inicial, estándares Res. 0312/2019
- **v2.x** — Multi-tenant, suscripciones Stripe, portal de soporte, facturación
- **v3.x** — PESV completo (24 pasos, Res. 40595/2022), portal LSO con firma digital, chatbot inteligente, H09/H10/H11 con módulos dedicados

**Contenía al momento del tag:**
- SG-SST con 61 estándares (Resolución 0312/2019) + ISO 45001:2018
- PESV completo: P01-P08, H01-H11, V01-V03, A01-A02 (Resolución 40595/2022)
- Portal LSO con firma digital, bóveda de empresas, tickets de soporte
- Portal empleados (trabajador), portal soporte con chat interno en tiempo real
- Sistema de facturación con Stripe, cotizaciones, promociones y referidos
- Directorio de profesionales licenciados (LSO)
- Chatbot de soporte con ubicaciones exactas por ciclo+código (P01-A02)
- Videos de Ayuda temporalmente desactivados (ver sección siguiente)

#### v3.6.0 — 15 de Abril 2026
**Nuevas funcionalidades:**
- **ISO 45001:2018 — Módulo de alineación internacional completo:**
  - `shared/iso45001-mapping.ts`: Mapeo completo Res. 0312/2019 ↔ ISO 45001:2018 (61 estándares → cláusulas 4.x a 10.x)
  - Badge "ISO 45001 §X.X" en cada estándar de la evaluación SST (visible en `DetalleEvaluacionSst.tsx`)
  - Botón "PDF ISO 45001:2018" en evaluaciones SST → genera reporte profesional organizado por capítulos ISO
  - Endpoint `GET /api/evaluaciones-sst/:id/pdf-iso45001` con portada corporativa, tabla resumen por capítulo, detalle por cláusula, indicadores de cumplimiento y declaración de alineación normativa

### Cómo actualizar la versión
Editar **una sola línea** en `client/src/components/Footer.tsx`:
```typescript
// Hay DOS líneas (Footer y FooterMinimal), actualizar ambas:
<span>© 2026 SST Colombia | Registro DNDA 13-197-177 | v3.6.0</span>
<span>© 2026 SST Colombia | DNDA 13-197-177 | v3.6.0</span>
```
Cambiar `v3.6.0` por la nueva versión en ambas líneas.

---

## Funcionalidades Temporalmente Desactivadas

### Videos de Ayuda — Desactivado el 13 de Abril 2026
**Motivo:** Se decidió dirigir a los clientes exclusivamente al chatbot como canal de soporte. Los videos se ocultaron temporalmente hasta nuevo aviso.

**Qué se ocultó:**
- El botón "Video de Ayuda" (naranja) que aparecía en cada módulo y en todos los portales (LSO, empleados, PESV, SG-SST).
- El ítem de menú "Videos de Ayuda" en Administración Global → Ayuda (visible para clientes).
- El ítem de menú "Videos de Ayuda" / "Gestión Videos" en Administración Global → Administración Proveedor (visible para admin/superadmin).

**Qué NO se tocó:**
- Las rutas `/videos-ayuda` y `/admin-videos-ayuda` siguen existiendo y son accesibles directamente por URL.
- Todos los videos configurados siguen guardados en la base de datos sin cambios.
- La lógica completa del sistema de videos está intacta.

**Para reactivar completamente, hacer estos 3 cambios:**

**1. `client/src/components/HelpVideoButton.tsx` — línea ~9:**
```typescript
// Cambiar false → true
const HELP_VIDEOS_ENABLED = true;
```

**2. `client/src/components/PHVANavigation.tsx` — descomentar 2 líneas:**
```typescript
// Buscar y descomentar:
{ label: "Videos de Ayuda", path: "/admin-videos-ayuda" },
{ label: "Videos de Ayuda", path: "/videos-ayuda" },
```

**3. `client/src/components/AppSidebar.tsx` — descomentar 2 líneas:**
```typescript
// Buscar y descomentar:
{ title: "Gestión Videos", url: "/admin-videos-ayuda", icon: CirclePlay, superadminOnly: true },
{ title: "Videos de Ayuda", url: "/videos-ayuda", icon: CirclePlay },
```