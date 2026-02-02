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

### Seguimiento de Avance de Objetivos SST (Decreto 1072/2015)
El sistema incluye un campo `porcentaje_avance` en la tabla `objetivos_sst` que permite trackear el progreso de cada objetivo independientemente del estado formal (activo, cumplido, etc.). El Dashboard VERIFICAR muestra dos métricas complementarias:
- **Cumplimiento Objetivos**: Basado en el estado formal (`estado = 'cumplido'`)
- **Avance Objetivos**: Basado en el promedio de `porcentaje_avance` de todos los objetivos

Esto cumple con el Art. 2.2.4.6.19 del Decreto 1072/2015 que requiere seguimiento y medición de objetivos SST.

### PHVA Cycle Consolidated Dashboard
The main Dashboard (`client/src/pages/Dashboard.tsx`) includes a consolidated PHVA cycle view through the `PHVASummary` component (`client/src/components/PHVASummary.tsx`). This component provides:
- **4 Phase Cards**: PLANEAR, HACER, VERIFICAR, ACTUAR with 2 key metrics each
- **Traceability Links**: Direct navigation to each phase's detailed panel
- **Additional KPIs**: Peligros Identificados, Objetivos SST, Plan de Trabajo
- **Alerts**: Warning banner for overdue actions requiring immediate attention
- **API Integration**: Consumes `/api/dashboard-hacer`, `/api/dashboard-verificar`, `/api/dashboard-actuar`

The component follows the "Add-Only" principle and uses the same visual patterns as the existing PESV dashboard (border-l-4 with gradient backgrounds).

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

## Promotions Plugin (Sidecar Architecture)

### Overview
The Promotions Plugin (`plugins/promotions/`) is a completely independent module that handles promotional pricing, coupons, digital contracts (JWT validation), and the referral program "Aliados 2026" (Net-Zero Risk). It follows a **Sidecar Architecture** pattern, meaning it can be entirely removed without affecting the main system.

### Plugin Structure
```
plugins/promotions/
├── index.ts          # Plugin initialization and export
├── schema.ts         # Drizzle ORM schema (4 independent tables)
├── service.ts        # Business logic (JWT, coupons, referrals, Stripe)
├── routes.ts         # API routes mounted at /api/plugins/promotions/*
├── email-service.ts  # Referral invitation emails
└── migrate.ts        # Database migration script
```

### Database Tables (Independent)
- `plugin_promotion_coupons`: Discount coupons with usage limits
- `plugin_referral_ledger`: Referral credits ledger (Padrino → Nuevo)
- `plugin_digital_contracts`: JWT-based price lock audit trail
- `plugin_credit_usage_history`: Credit consumption history

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/plugins/promotions/lobby` | Validate JWT from landing page |
| POST | `/api/plugins/promotions/generate-token` | Admin: generate test JWT |
| GET | `/api/plugins/promotions/coupons` | List all coupons (admin) |
| POST | `/api/plugins/promotions/coupons` | Create coupon (admin) |
| GET | `/api/plugins/promotions/coupons/validate/:code` | Validate coupon (public) |
| DELETE | `/api/plugins/promotions/coupons/:id` | Delete coupon (admin) |
| GET | `/api/plugins/promotions/contracts` | List digital contracts (admin) |
| GET | `/api/plugins/promotions/referrals` | List referral ledger (admin) |
| GET | `/api/plugins/promotions/referrals/credits/:referrerId` | Get referrer credits |
| POST | `/api/plugins/promotions/checkout` | Create promotional checkout |
| POST | `/api/plugins/promotions/invite` | Send referral invitation email |
| GET | `/api/plugins/promotions/my-referrals/:companyId` | Get company's referrals |
| POST | `/api/plugins/promotions/webhook` | Dedicated Stripe webhook |
| GET | `/api/plugins/promotions/stats` | Plugin statistics (admin) |

### Environment Variables Required
- `LANDING_PAGE_API_KEY` or `JWT_SECRET`: **MANDATORY** - For JWT validation (fail-closed security)
- `STRIPE_SECRET_KEY`: For Stripe integration
- `STRIPE_PROMOTIONS_WEBHOOK_SECRET`: For dedicated plugin webhook
- `RESEND_API_KEY`: For referral invitation emails
- `LANDING_PAGE_URL`: Base URL for referral links (default: https://sst-colombia.com.co)

### Frontend Pages
- `/admin-promociones`: Admin panel with 3 tabs (Cupones, Ledger Aliados, Contratos Digitales)
- `/recomendar`: Public page for clients to invite other companies (Padrino flow)

### Referral Program "Net-Zero Risk"
1. **Padrino (Referrer)** invites a company via `/recomendar` page
2. **Nuevo (Referee)** registers with referral token in URL
3. When **Nuevo** pays first invoice:
   - Referral credit activated for **Padrino** (1 month of Nuevo's plan value)
   - Credit valid for 12 months
   - Can be applied to **Padrino's** future invoices
4. **Nuevo** receives 2nd month free (configured via `discount_duration_months`)

### Kill-Switch Protocol (Complete Removal)
To completely remove this plugin without affecting the main system:

1. **Delete the plugin folder:**
   ```bash
   rm -rf plugins/promotions/
   ```

2. **Remove the import from server/index.ts:**
   Remove the line: `import promotionsPlugin from "../plugins/promotions";`
   Remove the line: `app.use("/api/plugins/promotions", promotionsPlugin);`

3. **Remove frontend routes from App.tsx:**
   - Remove import: `import AdminPromociones from "@/pages/AdminPromociones";`
   - Remove import: `import Recomendar from "@/pages/Recomendar";`
   - Remove routes for `/admin-promociones` and `/recomendar`

4. **Remove frontend pages:**
   ```bash
   rm client/src/pages/AdminPromociones.tsx
   rm client/src/pages/Recomendar.tsx
   ```

5. **Remove Stripe webhook from Dashboard:**
   Delete the webhook endpoint `/api/plugins/promotions/webhook` from Stripe Dashboard

6. **Optional - Remove database tables:**
   ```sql
   DROP TABLE IF EXISTS plugin_credit_usage_history;
   DROP TABLE IF EXISTS plugin_digital_contracts;
   DROP TABLE IF EXISTS plugin_referral_ledger;
   DROP TABLE IF EXISTS plugin_promotion_coupons;
   ```

**Result:** The main system returns to its original state immediately. No changes to core billing, subscriptions, or checkout flow required.

### COP Currency Handling
All prices are multiplied by 100 when sending to Stripe API (COP is a zero-decimal currency in real terms but Stripe requires ×100 for all amounts).