---
name: LSO and worker portals are free
description: Los portales son gratuitos; una suspensión de empresa por superadmin limita al LSO solo respecto a esa empresa, no a su cuenta.
---

The SST Colombia system charges only the contracting company (roles like superusuario, admin, responsable_sst, etc.). The LSO portal (`/portal-licenciado`) and the worker/employee portal (`/portal-empleados`) are completely free for those users. LSO accounts must remain able to sign in and access their portal even when one of their companies is suspended.

**Why:** Confirmed explicitly by the user: "ni los empleados ni los lso pagan nada, los portales son totalmente gratis." A bug surfaced where the "Pago pendiente" subscription-blocked modal appeared for an LSO user because an `exemptRoles` allowlist was missing `lso`/`trabajador`.

**How to apply:** Account-wide subscription/billing gating logic (frontend hooks, backend middleware, UI pages) must treat `lso`, `lso_externo`, and `trabajador` as always-exempt. This is distinct from the per-company manual suspension rule below. This codebase has multiple independent, duplicated exemption lists that can drift out of sync — when adding a new one, check and update all of them:
- `client/src/hooks/useSubscriptionCheck.ts` (`exemptRoles`)
- `server/middleware/subscription-check.ts` → `requireActiveSubscription` (`exemptRoles`)
- `server/auth.ts` → `requireActiveSubscription` (inline role check)
- `client/src/pages/MiSuscripcion.tsx` — shows company billing/invoice data; must render a "free access" message instead for lso/lso_externo/trabajador rather than the company's subscription/invoice data.

Separately, `server/middleware/feature-gate.ts` (`GLOBAL_ACCESS_ROLES`) and `server/middleware/subscription-limits.ts` gate specific premium *features* by plan (not payment status) — a different concern, not necessarily to be touched for pure "is my subscription paid" checks, but worth checking if LSO/trabajador ever hit a "Feature not available" 403.

## Suspensión manual de una empresa en el Portal LSO

Cuando superadmin bloquea una empresa desde Gestión de Empresas, el LSO y el LSO externo no pueden abrir sus módulos, consultar registros, modificarlos, firmarlos ni descargar informes. La empresa sigue visible como suspendida; la cuenta del profesional y el acceso a sus otras empresas permanecen activos. Conservar la asignación y restablecer el acceso cuando superadmin reactive la empresa.

**Why:** El usuario indicó «si yo bloqueo aquí por superadmin, se bloque en el portal LSO también» y autorizó el bloqueo completo por empresa. Que el portal sea gratuito no permite eludir la suspensión de esa empresa.

**How to apply:** Aplicar la restricción al propietario real de los registros y al contexto autorizado de empresa, sin desactivar la cuenta ni eliminar asignaciones. No extender esta autorización al Portal de Empleados ni convertir la mora por sí sola en una nueva restricción LSO.

**Confirmed bug (2026-07-08):** `checkWorkerLimit()` in `subscription-limits.ts` had an unconditional `403 "Suscripción requerida"` when a company had no active/trial subscription row — this fired even for `superadmin`, blocking worker creation for any company without a subscription record, unrelated to any companyId-resolution bug. Fixed by adding the same `platformExemptRoles` (`superadmin`, `soporte`, `lso`, `lso_externo`) bypass used elsewhere, applied to both `checkWorkerLimit()` and `checkFeatureAccess()`. Lesson: when auditing "is superadmin blocked anywhere," check every subscription/limit middleware for unconditional company-status branches, not just role/permission checks — a company-status block can 403 a platform role just as easily as a missing permission can.
