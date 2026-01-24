# SST Colombia - Sistema de Salud y Seguridad en el Trabajo

## Overview
This project is an integral management system for Occupational Health and Safety (SST) in Colombia, ensuring compliance with national regulations (Resolución 0312/2019) and ISO 45001:2018 standards. It offers a comprehensive digital solution for managing workers, tracking incidents, scheduling training, conducting safety inspections, and generating real-time statistical reports. The system aims to be a leading digital tool for SST compliance and management, enhancing worker safety and operational efficiency within the Colombian market, featuring a multi-tenant architecture, automatic company classification, and a complete PESV module.

## User Preferences
I prefer simple language and clear explanations. I want iterative development with regular updates. Please ask before making major architectural changes or introducing new dependencies. I prefer detailed explanations for complex features. Do not make changes to the `shared/` folder without explicit instruction.

### Secure Coding Principles
1. **Add-Only Principle**: Do not modify existing code; only add new code. Create new files/components instead of editing existing ones.
2. **Secure Development**: Follow established patterns, validations, and maintain architectural coherence.

## Recent Changes

### January 24, 2026 - Smart Form Pattern (Formularios Inteligentes)

**MANDATORY STANDARD FOR ALL NEW FORMS:**

All new forms in the SST Colombia system MUST follow the Smart Form Pattern to minimize client data entry and improve user experience.

**Pattern Requirements:**

1. **Auto-generated Code**: Every form must auto-generate a unique tracking code
   - Format: `{PREFIX}-{YEAR}-{NNN}` (e.g., MP-2026-001, AV-2026-003)
   - Generated on form open, read-only field

2. **Type-based Auto-fill**: When user selects a type/category, auto-populate:
   - Title/Name (from catalog)
   - Description (suggested text from catalog)
   - Priority (based on type)
   - Due date (calculated from type's standard days)
   - Related area (if applicable)

3. **Context Auto-fill**: Pre-fill fields from context:
   - Responsible: Current user by default
   - Date: Current date by default
   - Company: From session context

4. **Visual Indicators**: Show `<Badge>Auto</Badge>` next to auto-filled fields
   - Use Sparkles icon from lucide-react
   - Badge style: `variant="secondary" className="bg-primary/10 text-primary"`

5. **Editable**: All auto-filled fields remain editable by user

**Implementation Files:**
- **Data Catalog**: `client/src/data/{module}-automatizacion.ts`
- **Enhanced Form Component**: `client/src/components/{Module}FormEnhanced.tsx`

**Example Implementation:**
```typescript
// Data catalog (medidas-preventivas-automatizacion.ts)
export interface TipoMedidaPreventiva {
  codigo: string;
  categoria: 'preventiva' | 'correctiva' | 'mejora';
  nombre: string;
  descripcionSugerida: string;
  prioridadSugerida: 'baja' | 'media' | 'alta';
  diasPlazoSugerido: number;
  areasSugeridas: string[];
}

// Form component (MedidaPreventivaFormEnhanced.tsx)
const handleTipoChange = (codigo: string) => {
  const tipo = CATALOGO.find(t => t.codigo === codigo);
  if (tipo) {
    form.setValue("title", tipo.nombre);
    form.setValue("description", tipo.descripcionSugerida);
    form.setValue("priority", tipo.prioridadSugerida);
    form.setValue("dueDate", calcularFecha(tipo.diasPlazoSugerido));
    setAutoFilledFields(new Set(['title', 'description', 'priority', 'dueDate']));
  }
};
```

**Modules Already Implemented:**
- Plan Emergencias (8 sub-modules): Planes, Brigadas, Vulnerabilidad, Recursos, Simulacros, Zonas, Rutas, Puntos
- Medidas Preventivas/Correctivas: `MedidaPreventivaFormEnhanced.tsx`
- Mediciones Ambientales: `MedicionAmbientalFormEnhanced.tsx`

**Code Locations:**
- `client/src/data/plan-emergencias-automatizacion.ts`
- `client/src/data/medidas-preventivas-automatizacion.ts`
- `client/src/components/MedidaPreventivaFormEnhanced.tsx`

### January 24, 2026 - Universal "Back to Evaluation" Navigation

**Enhanced Navigation Flow:**
- All 79 Links/setLocation in `DetalleEvaluacionSst.tsx` now include `?from=evaluation&evaluationId=${id}` parameters
- Added `BackToEvaluationButton` to 7 pages that were missing it: EntregaEpp, GestionCambios, SustanciasQuimicas, Curso50Horas, AnalisisContexto, PlanMejoramientoContexto, Informes
- Total: 45+ pages now have consistent back navigation

**Refactored BackToEvaluationButton:**
- Uses `useSearch` hook from wouter for reactive URL parameter handling
- Uses `useMemo` for efficient parameter parsing
- Styled with `variant="outline" size="sm"` per UI guidelines
- No custom hover overrides (follows design system)

**Navigation Pattern:**
- When navigating from evaluation → module: URL includes `?from=evaluation&evaluationId={uuid}`
- BackToEvaluationButton only shows when `from=evaluation` is present
- Clicking back returns to specific evaluation `/evaluaciones-sst/{evaluationId}`

**Component Location:** `client/src/components/BackToEvaluationButton.tsx`

### January 23, 2026 - Standard 4.2.3 Verification Module

**New Component Created (Following Add-Only Principle):**

7. **`client/src/components/Estandar423VerificacionProcedimientos.tsx`**
   - Verification module for Standard 4.2.3: Procedures, instructional manuals, technical safety sheets (FDS/MSDS), and SST protocols
   - Document checklist with categories: Work procedures, operational instructions, safety data sheets, SST protocols
   - Verification criteria per Decreto 1072/2015 Art. 2.2.4.6.24
   - Normative references: Decreto 1072/2015, Resolución 0312/2019, Decreto 1496/2018 (SGA/GHS), Resolución 0773/2021, Resolución 0491/2020
   - Evidence tracking for worker document delivery support
   - Navigation buttons to related modules (Documents, Training, Workers, IPERC)
   - Integrated into DetalleEvaluacionSst.tsx dialog for Standard 4.2.3 evaluation

**Integration:**
- Component automatically renders in the SST evaluation dialog when Standard 4.2.3 is selected
- Import: `import { Estandar423VerificacionProcedimientos } from "@/components/Estandar423VerificacionProcedimientos"`

### January 22, 2026 - Error Corrections Phase (8 Issues Resolved)

**New Components Created (Following Add-Only Principle):**

1. **`client/src/components/MedicionAmbientalFormEnhanced.tsx`**
   - Enhanced environmental measurement form with automatic traceability
   - Auto-generates tracking number (format: MA-YYYY-NNNN)
   - Pre-fills Colombian legal limits per measurement type (Resolución 2400/1979)
   - Auto-assigns evaluator from current user
   - Auto-captures creation timestamp
   - Measurement types: Ruido (85 dB), Iluminación (300-1000 lux), Temperatura (16-24°C), etc.
   
2. **`client/src/components/Cie10AutocompleteField.tsx`**
   - Searchable CIE-10 code selector with auto-fill functionality
   - Automatically populates diagnosis field when code is selected
   - Uses existing CIE10_CATALOG from `client/src/data/cie10-colombia.ts`
   - Full react-hook-form integration with generics for type safety

3. **`client/src/lib/finding-payload-adapter.ts`**
   - Adapter to fix "finding_description NOT NULL" constraint violation
   - Maps `description` to both `description` and `finding_description` fields
   - Includes validation to ensure no required fields are empty

4. **`client/src/components/ParticipantDialogEnhanced.tsx`**
   - Enhanced ParticipantDialogSmart with `participationDate` field
   - shadcn/ui DatePicker (Calendar + Popover) for date selection
   - Defaults to current date, supports Colombian locale (es-CO)
   - Sends `participationDate` in API payload to backend

5. **`client/src/components/ArbolCausasVisualization.tsx`**
   - Visual tree representation of accident causes
   - 4-level hierarchy: Event → Immediate Causes → Basic Causes → Root Cause
   - Color-coded by cause type with icons (lucide-react)
   - Responsive design with dark mode support
   - Used with "Árbol de Causas" analysis methodology

6. **`client/src/lib/accident-severity-calculator.ts`**
   - Pure TypeScript module for Colombian accident indicators
   - Implements formulas per Resolución 0312/2019 and Decreto 1072/2015:
     - IF (Índice Frecuencia) = (Accidentes × 200,000) / HHT
     - IS (Índice Severidad) = (Días perdidos × 200,000) / HHT
     - ILI = IF × IS / 1000
   - Exports: `calculateFrequencyIndex()`, `calculateSeverityIndex()`, `calculateILI()`, `calculateAccidentalityRate()`

**Integration Instructions:**
- To use enhanced components, import them in the respective pages:
  - `import { MedicionAmbientalFormEnhanced } from "@/components/MedicionAmbientalFormEnhanced"`
  - `import { Cie10AutocompleteField } from "@/components/Cie10AutocompleteField"`
  - `import { ParticipantDialogEnhanced } from "@/components/ParticipantDialogEnhanced"`
  - `import { ArbolCausasVisualization } from "@/components/ArbolCausasVisualization"`
  - `import { adaptFindingPayload } from "@/lib/finding-payload-adapter"`
  - `import { calculateFrequencyIndex, calculateSeverityIndex, calculateILI } from "@/lib/accident-severity-calculator"`

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