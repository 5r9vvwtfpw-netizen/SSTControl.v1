# SST Colombia - Sistema de Salud y Seguridad en el Trabajo

## Overview
This project is an integral management system for Occupational Health and Safety (SST) in Colombia, ensuring compliance with national regulations (Resolución 0312/2019) and ISO 45001:2018 standards. It offers a comprehensive digital solution for managing workers, tracking incidents, scheduling training, conducting safety inspections, and generating real-time statistical reports. The system aims to be a leading digital tool for SST compliance and management, enhancing worker safety and operational efficiency within the Colombian market, featuring a multi-tenant architecture, automatic company classification, and a complete PESV module.

## User Preferences
I prefer simple language and clear explanations. I want iterative development with regular updates. Please ask before making major architectural changes or introducing new dependencies. I prefer detailed explanations for complex features. Do not make changes to the `shared/` folder without explicit instruction.

## System Architecture

### UI/UX Decisions
The frontend uses React 18, TypeScript, and Vite, with Tailwind CSS and Shadcn UI for a modern, responsive, Material Design-inspired interface. Navigation aligns with the PHVA cycle (Plan-Do-Check-Act) using horizontal tabs. Company logos are integrated into all PDF documents. The company registration flow (`CrearEmpresaCiiuFirst.tsx`) uses a 2-step wizard that asks for the CIIU code first to automatically calculate the risk level and determine applicable standards. CIIU integration components (`IpercCiiuFilter.tsx`, `EstandaresLiberadosCiiu.tsx`, `IpercIntegracionCiiu.tsx`) filter hazards and standards based on the CIIU code.

### Technical Implementations
The system is built with a React 18, TypeScript, Vite frontend and an Express.js, TypeScript backend using PostgreSQL with Drizzle ORM. It features an 11-Tier Role-Based Access Control (RBAC) system with multi-tenant architecture. Key modules include comprehensive compliance for Resolution 0312/2019 standards, ISO 45001:2018 internal audits, management reviews, EVS, COPASST management, virtual training, smart induction, sociodemographic profiling, accident investigation and statistics, worker absenteeism control, and EPP delivery management. The system tracks SST evaluations year-to-year, offering data inheritance and review workflows, automated email notifications, a worker portal, Stripe-integrated billing, an interactive chatbot, and full legal compliance for Habeas Data and GDPR. All PDF reports adhere to a corporate standard with specific headers, document titles, section bars, and footers with signers, managed by `server/services/pdf-standardizer.ts`. New forms follow a "Smart Form Pattern" that includes auto-generated tracking codes, type-based auto-filling, context auto-filling, and visual indicators for auto-filled fields. Universal "Back to Evaluation" navigation has been implemented across relevant pages using URL parameters. New components are added following an "Add-Only" principle, such as the `Estandar423VerificacionProcedimientos.tsx` module for standard verification, and various enhanced forms and utilities like `MedicionAmbientalFormEnhanced.tsx`, `Cie10AutocompleteField.tsx`, `ParticipantDialogEnhanced.tsx`, `ArbolCausasVisualization.tsx`, `finding-payload-adapter.ts`, and `accident-severity-calculator.ts`.

### System Design Choices
The system uses a client-server architecture with a RESTful API. Data integrity is ensured through Zod validations. Security features include hashed passwords, secure session management, and restricted privilege escalation. It is designed for scalability and maintainability, incorporating health checks, structured JSON logging, automated database backups, and audit logging. Form validation uses required fields, field-specific error messages, and converts empty strings to null for optional fields. A robust data encryption system compliant with Ley 1581/2012 uses AES-256-GCM with per-field key derivation for sensitive data, enabling searchable hashes for querying encrypted fields. The system automatically classifies companies by ARL risk level based on their CIIU code, using official Colombian decrees.

## External Dependencies

-   **PostgreSQL (Neon/AWS RDS)**: Cloud-hosted relational database.
-   **TanStack Query v5**: Frontend data fetching and state management.
-   **Wouter**: Lightweight React routing library.
-   **React Hook Form + Zod**: Form management and validation.
   **Express.js**: Backend web application framework.
-   **Drizzle ORM**: TypeScript ORM for PostgreSQL.
-   **Passport.js**: Node.js authentication middleware.
-   **PDFKit**: PDF document generation library.
-   **Resend**: Email sending service for automated notifications.
-   **Stripe**: Payment gateway for subscription billing and extra seat purchases.
-   **Tailwind CSS**: Utility-first CSS framework.
-   **Shadcn UI**: UI component library built on Tailwind CSS.
-   **Amazon S3**: Cloud object storage for file uploads with 20-year retention compliance.
-   **AWS SDK v3**: For S3 operations.
## PDF Generation Guidelines

### LECCIÓN CRÍTICA - Incidente Enero 2026

**INCIDENTE**: 53 endpoints PDF fallaban en producción con Error 500 por variables undefined.

**CAUSA RAÍZ**: Copy-paste de código entre endpoints sin verificar que las variables existieran en el nuevo contexto.

**ERRORES CORREGIDOS** (119+ correcciones):
| Tipo de Error | Cantidad | Ejemplo |
|---------------|----------|---------|
| `companyId` / `effectiveCompanyId` sin definir | 17 | Código copiado sin contexto |
| `const margin` sin declarar | 75 | Faltaba `const margin = 35` |
| `const pageWidth` sin declarar | 9 | Faltaba `const pageWidth = doc.page.width` |
| `logoBuffer` / `workerPhotoBuffer` incorrectas | 6 | Referencias a variables inexistentes |
| Template literal mal escapado | 1 | `\`...\`` en vez de `` `...` `` |

**SOLUCIÓN IMPLEMENTADA**: Se creó `server/lib/pdf-context-validator.ts` para prevenir errores futuros.

### REGLAS OBLIGATORIAS PARA ENDPOINTS PDF

1. **SIEMPRE** declarar al inicio del endpoint:
   ```typescript
   const margin = 35;
   const pageWidth = doc.page.width;
   ```

2. **SIEMPRE** validar contexto antes de generar PDF:
   ```typescript
   import { validatePdfContext, assertValidCompanyId } from "./lib/pdf-context-validator";

   const validation = validatePdfContext(req, { companyId }, { contextName: 'Nombre PDF' });
   if (!validation.isValid) {
     return res.status(400).send(validation.error);
   }
   ```

3. **NUNCA** copiar código entre endpoints sin verificar variables:
   - En endpoints con `getEffectiveCompanyId(req)` → usar `effectiveCompanyId`
   - En endpoints sin esa llamada → usar `companyId` (definida localmente)

4. **SIEMPRE** loguear errores con prefijos estándar:
   - `[PDF-CONTEXT-ERROR]` para errores de contexto
   - `[PDF-GENERATION-ERROR]` para errores de generación

### Checklist para Nuevos Endpoints PDF

- [ ] ¿Está definida `companyId` o `effectiveCompanyId`?
- [ ] ¿Están declaradas `margin` y `pageWidth`?
- [ ] ¿Se usa `validatePdfContext()` al inicio?
- [ ] ¿Se carga el logo con `loadCompanyLogoBuffer()`?
- [ ] ¿Se obtienen los firmantes con `getSignersForCompany()`?
- [ ] ¿Se usa `addStandardHeader()` y `addSignatureFooter()`?
