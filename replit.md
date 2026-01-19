# SST Colombia - Sistema de Salud y Seguridad en el Trabajo

## Overview
This project is an integral management system for Occupational Health and Safety (SST) in Colombia. It ensures compliance with national regulations (Resolución 0312/2019) and international ISO 45001:2018 standards. The system offers a comprehensive digital solution for managing workers, tracking incidents, scheduling training, conducting safety inspections, and generating real-time statistical reports. It aims to be a leading digital tool for SST compliance and management, enhancing worker safety and operational efficiency within the Colombian market. Key features include a multi-tenant architecture, automatic company classification, and a complete PESV module.

## User Preferences
I prefer simple language and clear explanations. I want iterative development with regular updates. Please ask before making major architectural changes or introducing new dependencies. I prefer detailed explanations for complex features. Do not make changes to the `shared/` folder without explicit instruction.

## System Architecture

### UI/UX Decisions
The frontend uses React 18, TypeScript, and Vite, with Tailwind CSS and Shadcn UI for a modern, responsive, Material Design-inspired interface. Navigation aligns with the PHVA cycle (Plan-Do-Check-Act) using horizontal tabs. Company logos are integrated into all PDF documents.

### Technical Implementations
The system is built with a React 18, TypeScript, Vite frontend and an Express.js, TypeScript backend using PostgreSQL with Drizzle ORM. It features an 11-Tier Role-Based Access Control (RBAC) system with multi-tenant architecture. Key modules include comprehensive compliance for Resolution 0312/2019 standards, ISO 45001:2018 internal audits, management reviews, and various specific modules like EVS, COPASST management, virtual training, smart induction, sociodemographic profiling, accident investigation and statistics, worker absenteeism control, and EPP delivery management. The system tracks SST evaluations year-to-year, offering data inheritance and review workflows. It includes automated email notifications, a worker portal, Stripe-integrated billing, an interactive chatbot, and full legal compliance for Habeas Data and GDPR.

### System Design Choices
The system uses a client-server architecture with a RESTful API. Data integrity is ensured through Zod validations. Security features include hashed passwords, secure session management, and restricted privilege escalation. It is designed for scalability and maintainability, incorporating health checks, structured JSON logging, automated database backups, and audit logging. Form validation uses required fields, field-specific error messages, and converts empty strings to null for optional fields. A robust data encryption system compliant with Ley 1581/2012 uses AES-256-GCM with per-field key derivation for sensitive worker, company, document, and evaluation data, enabling searchable hashes for querying encrypted fields.

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
-   **Stripe**: Payment gateway for subscription billing.
-   **Tailwind CSS**: Utility-first CSS framework.
-   **Shadcn UI**: UI component library built on Tailwind CSS.
-   **Amazon S3**: Cloud object storage for file uploads with 20-year retention compliance.
-   **AWS SDK v3**: For S3 operations.

## User Limits System - Per-Role Model (January 2026)

### Business Model
The monetization comes from **worker count**, not from admin users. The user limit system is designed to allow companies to operate their SST system without artificial restrictions on administrative roles.

### Implementation Details (`checkUserLimit()` middleware in server/middleware/subscription-limits.ts)

**Three categories of roles:**

1. **Global Access Roles** (superadmin, admin, soporte): 
   - NO LIMIT - These are platform-level roles for SST Colombia staff
   - Cannot be created by tenant users
   - Badge: "Solo proveedor" (amber color)

2. **Unlimited Roles** (trabajador, worker):
   - UNLIMITED - Workers only access the Portal de Empleados (read-only)
   - Low server impact as they only read their own information
   - Badge: "Ilimitado" (green color)

3. **Company Roles with Limit** (9 roles):
   - 1 user per role INCLUDED in the plan
   - Roles: superusuario, responsable_sst, coordinador_sst, coordinador_rrhh, coordinador_salud, jefe_personal, supervisor, vigia_sst, auditor_interno
   - Additional users of the same role require contacting support (soporte@sstcolombia.com)
   - Badge: "X/1" with red color when limit reached

**Hidden from User Management:**
- LSO (Licenciado en Salud Ocupacional): Managed from "Directorio de Profesionales", not from user management

**Error Message when limit exceeded:**
"Tu plan incluye 1 usuario [RoleName] sin costo adicional. Para agregar usuarios adicionales de este rol, por favor contacta a nuestro equipo de soporte."

## Billing System - Worker Quantity Enforcement

### Implementation Details (January 2026)
The billing system enforces strict worker quantity limits based on what customers purchase:

1. **`workersPurchased` field**: Added to `subscriptions` table to store the exact number of workers the customer paid for.

2. **Enforcement Logic** (`checkWorkerLimit()` middleware):
   - Priority 1: Validates against `subscription.workersPurchased` (what customer PAID for)
   - Fallback: Uses `plan.maxWorkers` for legacy subscriptions without `workersPurchased`
   - Error message: "Tu suscripción permite hasta X trabajadores. Para registrar más, actualiza tu plan."

3. **Checkout Flow**:
   - `PlanesSuscripcion.tsx` passes `workersPurchased` based on company's current worker count
   - `Checkout.tsx` reads `workersPurchased` from URL and sends to backend
   - Server validates that `workersPurchased` >= current active workers
   - Stripe metadata stores `workersPurchased` for webhook processing

4. **Webhook Processing**:
   - On successful payment, `workersPurchased` is saved from Stripe metadata to subscription

5. **Business Logic**:
   - Minimum 2 workers for Microempresa plan
   - Customers cannot buy fewer licenses than their current active workers
   - Error: "Tu empresa ya tiene X trabajadores registrados. Debes comprar al menos X licencias."

## Troubleshooting - Problemas Conocidos y Soluciones

### Error: "certificado autofirmado en cadena de certificados" (Enero 2026) - SOLUCIONADO

**Síntoma:** Al generar informes PDF (como el Informe de Verificación del Sistema SG-SST), el usuario ve el mensaje técnico "certificado autofirmado en cadena de certificados" en lugar del PDF.

**Causa:** Error SSL/TLS en conexiones a servicios externos (Base de datos Neon o Amazon S3) en producción.

**Solución Multicapa Implementada (Enero 2026):**

1. **Configuración SSL en server/db.ts:**
   - Agregado `rejectUnauthorized: false` para conexiones Neon PostgreSQL
   - Esta configuración es estándar para conexiones a Neon en ambientes cloud como Replit

2. **Función Helper `handlePdfError()` en server/services/pdf-standardizer.ts:**
   - Detecta errores técnicos (SSL, certificate, ECONNREFUSED, etc.)
   - Retorna mensaje amigable al usuario
   - Aplicada a endpoints de PDF críticos

3. **Middleware de Sanitización de Respuestas (server/routes.ts línea ~1398):**
   - Intercepta tanto `res.send()` como `res.json()`
   - Solo actúa en respuestas con status >= 500
   - Detecta patrones técnicos en mensajes de error
   - Reemplaza con mensaje genérico amigable
   - Patrones detectados: certificate, certificado, CERT, SSL, TLS, ECONNREFUSED, ECONNRESET, ETIMEDOUT, self signed, autofirmado, socket hang up, UNABLE_TO_VERIFY_LEAF_SIGNATURE

4. **Middleware Global de Manejo de Errores (server/routes.ts al final):**
   - Captura errores no manejados con `next(err)` o `throw`
   - Registra error completo en logs del servidor
   - Retorna mensaje sanitizado al cliente

**Resultado:** Los usuarios ahora ven "Error al procesar la solicitud. Por favor intente nuevamente o contacte soporte técnico." en lugar de mensajes técnicos internos.

**Archivos modificados:**
- `server/db.ts` - Configuración SSL de PostgreSQL
- `server/services/pdf-standardizer.ts` - Función handlePdfError()
- `server/routes.ts` - Middlewares de sanitización y error global

### Error: "Rendered more hooks than during the previous render" (React Hooks)

**Síntoma:** Página en blanco o error de React al cargar ciertos módulos.

**Causa:** Hooks de React (`useState`, `useEffect`, `useQuery`) ubicados después de un `return` condicional.

**Solución:** Mover TODOS los hooks antes de cualquier `return` condicional en el componente.

```typescript
// ❌ INCORRECTO - Hook después de return condicional
function MyComponent() {
  if (!user) return <Loading />;
  const [data, setData] = useState(null); // ERROR!
}

// ✅ CORRECTO - Todos los hooks primero
function MyComponent() {
  const [data, setData] = useState(null);
  if (!user) return <Loading />;
}
```

### Error: SelectItem con valor vacío

**Síntoma:** Error de React/Radix al usar `<SelectItem value="">`.

**Causa:** Radix Select no permite valores vacíos en SelectItem.

**Solución:** Usar un valor placeholder como "none" o "all" en lugar de string vacío.

```typescript
// ❌ INCORRECTO
<SelectItem value="">Todos</SelectItem>

// ✅ CORRECTO  
<SelectItem value="all">Todos</SelectItem>
```