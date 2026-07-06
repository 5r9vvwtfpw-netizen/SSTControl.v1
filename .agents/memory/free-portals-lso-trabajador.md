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
