# SST Colombia - Sistema de Salud y Seguridad en el Trabajo

## Overview
This project is an integral management system for Occupational Health and Safety (SST) in Colombia, ensuring compliance with national regulations (Resolución 0312/2019) and ISO 45001:2018 standards. It offers a comprehensive digital solution for managing workers, tracking incidents, scheduling training, conducting safety inspections, and generating real-time statistical reports. The system aims to be a leading digital tool for SST compliance and management, enhancing worker safety and operational efficiency within the Colombian market, featuring a multi-tenant architecture, automatic company classification, and a complete PESV module. The system integrates modules for comprehensive compliance, internal audits, management reviews, EVS, COPASST, virtual training, smart induction, sociodemographic profiling, accident investigation, absenteeism control, and EPP delivery. It also includes year-to-year SST evaluation tracking, data inheritance, review workflows, automated email notifications, a worker portal, Stripe-integrated billing, an interactive chatbot, and full legal compliance for Habeas Data and GDPR.

## User Preferences
I prefer simple language and clear explanations. I want iterative development with regular updates. Please ask before making major architectural changes or introducing new dependencies. I prefer detailed explanations for complex features. Do not make changes to the `shared/` folder without explicit instruction.

## System Architecture

### UI/UX Decisions
The frontend uses React 18, TypeScript, and Vite, with Tailwind CSS and Shadcn UI for a modern, responsive, Material Design-inspired interface. Navigation aligns with the PHVA cycle (Plan-Do-Check-Act) using horizontal tabs. Company logos are integrated into all PDF documents. The company registration flow uses a 2-step wizard that asks for the CIIU code first to automatically calculate the risk level and determine applicable standards. CIIU integration components filter hazards and standards based on the CIIU code.

### Technical Implementations
The system is built with a React 18, TypeScript, Vite frontend and an Express.js, TypeScript backend using PostgreSQL with Drizzle ORM. It features an 11-Tier Role-Based Access Control (RBAC) system with multi-tenant architecture. All PDF reports adhere to a corporate standard managed by `server/services/pdf-standardizer.ts`. New forms follow a "Smart Form Pattern" that includes auto-generated tracking codes, type-based auto-filling, context auto-filling, and visual indicators for auto-filled fields. Universal "Back to Evaluation" navigation has been implemented across relevant pages using URL parameters. New components are added following an "Add-Only" principle.

### System Design Choices
The system uses a client-server architecture with a RESTful API. Data integrity is ensured through Zod validations. Security features include hashed passwords, secure session management, and restricted privilege escalation. It is designed for scalability and maintainability, incorporating health checks, structured JSON logging, automated database backups, and audit logging. Form validation uses required fields, field-specific error messages, and converts empty strings to null for optional fields. A robust data encryption system compliant with Ley 1581/2012 uses AES-256-GCM with per-field key derivation for sensitive data, enabling searchable hashes for querying encrypted fields. The system automatically classifies companies by ARL risk level based on their CIIU code, using official Colombian decrees.

The PESV (Strategic Road Safety Plan) module manages evaluations according to Resolución 40595/2022, supporting three complexity levels (Basic, Standard, Advanced) and providing bidirectional traceability with SST. It incorporates ISO 31000:2018 for road risk management with a 5x5 probability/impact matrix and ISO 39001:2012 for road safety performance management, including Safety Performance Factors (SPF) and Safety Performance Indicators (SPI). The billing system includes a robust validator (`server/lib/billing-validator.ts`) to ensure data integrity before invoice generation and insertion, utilizing Zod schema validation, company validation, and subscription validation. It also provides a health check endpoint for monitoring billing system operations.

### PESV Pricing Module (Enero 2026)
The PESV pricing module (`pricing_plugin/calculate-pesv.ts`) calculates costs based on vehicle count following Resolución 40595/2022:

**Formula:** `Costo PESV = Pasos Aplicables × $8,000`

**PESV Levels by Vehicle Count:**
- Básico (1-10 vehículos): 20 pasos → $160,000/mes
- Estándar (11-50 vehículos): 24 pasos → $192,000/mes
- Avanzado (50+ vehículos): 24 pasos → $192,000/mes

**Combined SST + PESV Formula:**
`Total = (Trabajadores × Tarifa Riesgo) + (Estándares SST × $8,000) + (Pasos PESV × $8,000)`

**PESV API Endpoints:**
- `POST /api/pricing-v2/pesv/calculate` - Calculate PESV pricing
- `GET /api/pricing-v2/pesv/tarifas` - Get PESV rates
- `POST /api/pricing-v2/calculate-combined` - Calculate SST + PESV combined
- `GET /api/pricing-v2/simulador-completo/:companyId` - Simulate pricing for existing company

### Pricing Calculator V2 with Stripe Integration (Febrero 2026)
The pricing calculator V2 (`client/src/pages/PricingCalculatorV2.tsx`) provides a complete pricing simulation with Stripe checkout integration.

**Calculator Features:**
- Workers count input (determines SST cost based on risk class)
- Risk class selector (I-V, affects per-worker rate)
- Vehicles input (enables PESV module calculation)
- Real-time cost breakdown by component

**User Licensing Model (Febrero 2026):**
- Each company includes 1 user per role at no additional cost (11 administrative roles)
- 'trabajador' role is unlimited (Portal del Trabajador)
- Additional users of the same role: $10,000 COP/month each
- When limit is reached, modal appears with Stripe checkout for extra seat purchase
- Backend middleware: `server/middleware/subscription-limits.ts` (checkUserLimit)
- Frontend modal: `client/src/pages/GestionUsuarios.tsx` (extraSeatPurchaseInfo)

**Pricing Formula V2:**
```
Total = (Trabajadores × Tarifa Riesgo) + (Estándares × $8,000) + (Pasos PESV × $8,000)
```
Note: Additional users are NOT calculated in the initial subscription - they are purchased on-demand when needed.

**Risk Class Rates:**
- Clase I: $26,000/worker/month
- Clase II: $24,000/worker/month
- Clase III: $22,000/worker/month
- Clase IV-V: $20,000/worker/month

**API Endpoints V2:**
- `POST /api/pricing-v2/calculate-combined-v2` - Calculate complete pricing (SST + PESV + users)
- `POST /api/pricing-v2/create-checkout-v2` - Create dynamic Stripe checkout session

**Stripe Checkout Integration:**
- Separate line items for: workers, standards, PESV steps, additional users
- Promotion codes enabled
- Metadata includes full pricing breakdown for tracking

### CRITICAL: Stripe COP Currency Handling (Febrero 2026)
**COP (Colombian Peso) is NOT a zero-decimal currency in Stripe.**

This means ALL prices must be multiplied by 100 when creating prices in Stripe API:

| Precio Real | Valor en Stripe API | Ejemplo |
|-------------|---------------------|---------|
| $10,000 COP | 1,000,000 | Usuario Adicional |
| $60,000 COP | 6,000,000 | Plan Microempresa |
| $160,000 COP | 16,000,000 | PESV Básico |
| $192,000 COP | 19,200,000 | PESV Estándar |

**Zero-decimal currencies (NO multiplier needed):** JPY, KRW, VND, etc.
**Non-zero-decimal currencies (multiply by 100):** COP, USD, EUR, etc.

**Code Pattern:**
```typescript
// WRONG - Creates $100 COP instead of $10,000 COP
unit_amount: 10000

// CORRECT - Creates $10,000 COP
unit_amount: 10000 * 100  // = 1,000,000
```

**Stripe Products Active (Febrero 2026):**
- prod_TjIHMkMpTGFGSq: Microempresa ($60,000/mes)
- prod_TjIHy0oxEo4W3h: Pequeña Empresa ($264,000/mes)
- prod_TjIHXR4XX5bCUf: Mediana Empresa ($1,100,000/mes)
- prod_TjIH2xE3jvxFwf: Gran Empresa ($4,000,000/mes)
- prod_TtjQa1Nv5mfLu0: PESV (Básico $160k, Estándar $192k)
- prod_TtjQHVri7U8hJS: Usuarios Adicionales ($10,000/mes)

**Database Columns Added to `pricing_plugin_subscriptions`:**
- `vehiculos` (integer, default 0)
- `nivel_pesv` (text, nullable)
- `costo_pesv_mensual` (decimal, default 0)

### Centralized Document Traceability System (Enero 2026)
The document traceability system provides centralized tracking of all system-generated PDFs following the "Add-Only Principle" (principio de código seguro). It uses a metadata-only approach, storing references to PDFs without duplicating file storage.

**Database Columns Added to `sst_documents`:**
- `sourceModule` (text, nullable) - Module that generated the document (e.g., designaciones, capacitaciones)
- `sourceEndpoint` (text, nullable) - API endpoint to retrieve the PDF
- `sourceRecordId` (text, nullable) - ID of the source record
- `isSystemGenerated` (boolean, default false) - Flag for system-generated documents

**Document Registry Service** (`server/services/document-registry.ts`):
- `registerDocument()` - Registers a system-generated document with metadata
- `getSystemDocuments()` - Retrieves all system-generated documents for a company
- `getDocumentStats()` - Returns statistics by module and PHVA cycle

**API Endpoints:**
- `GET /api/system-documents` - Lists all system-generated documents
- `GET /api/system-documents/stats` - Returns statistics by module

**UI - Conservación de Documentos:**
- Collapsible "Documentos del Sistema" section showing system-generated PDFs
- Table with columns: Código, Título, Módulo, Ciclo PHVA, Fecha, Acciones
- Download button redirects to source endpoint for PDF retrieval

**Module Categories (30+ modules):**
designaciones, capacitaciones, examenes_medicos, accidentes, inspecciones, investigaciones, presupuesto, recursos, politicas, trabajadores, evaluaciones, planes_trabajo, epp, contratos, afiliaciones, copasst, ausentismo, emergencias, pesv, auditorias, indicadores, comunicaciones, induccion, perfiles_cargo, cambios, adquisiciones, matriz_legal, vigilancia_epidemiologica, revisiones_direccion, otros

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