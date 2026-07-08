---
name: LSO and worker portals are free
description: LSO (lso/lso_externo) and worker (trabajador) portals must never be blocked or shown billing/subscription info — they don't pay for the system.
---

The SST Colombia system charges only the contracting company (roles like superusuario, admin, responsable_sst, etc.). The LSO portal (`/portal-licenciado`) and the worker/employee portal (`/portal-empleados`) are completely free for those users, regardless of the company's subscription status.

**Why:** Confirmed explicitly by the user: "ni los empleados ni los lso pagan nada, los portales son totalmente gratis." A bug surfaced where the "Pago pendiente" subscription-blocked modal appeared for an LSO user because an `exemptRoles` allowlist was missing `lso`/`trabajador`.

**How to apply:** Any subscription/billing gating logic (frontend hooks, backend middleware, UI pages) must treat `lso`, `lso_externo`, and `trabajador` as always-exempt. This codebase has multiple independent, duplicated exemption lists that can drift out of sync — when adding a new one, check and update all of them:
- `client/src/hooks/useSubscriptionCheck.ts` (`exemptRoles`)
- `server/middleware/subscription-check.ts` → `requireActiveSubscription` (`exemptRoles`)
- `server/auth.ts` → `requireActiveSubscription` (inline role check)
- `client/src/pages/MiSuscripcion.tsx` — shows company billing/invoice data; must render a "free access" message instead for lso/lso_externo/trabajador rather than the company's subscription/invoice data.

Separately, `server/middleware/feature-gate.ts` (`GLOBAL_ACCESS_ROLES`) and `server/middleware/subscription-limits.ts` gate specific premium *features* by plan (not payment status) — a different concern, not necessarily to be touched for pure "is my subscription paid" checks, but worth checking if LSO/trabajador ever hit a "Feature not available" 403.

**Confirmed bug (2026-07-08):** `checkWorkerLimit()` in `subscription-limits.ts` had an unconditional `403 "Suscripción requerida"` when a company had no active/trial subscription row — this fired even for `superadmin`, blocking worker creation for any company without a subscription record, unrelated to any companyId-resolution bug. Fixed by adding the same `platformExemptRoles` (`superadmin`, `soporte`, `lso`, `lso_externo`) bypass used elsewhere, applied to both `checkWorkerLimit()` and `checkFeatureAccess()`. Lesson: when auditing "is superadmin blocked anywhere," check every subscription/limit middleware for unconditional company-status branches, not just role/permission checks — a company-status block can 403 a platform role just as easily as a missing permission can.
