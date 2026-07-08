---
name: Effective companyId resolution pattern
description: How to resolve the "company being viewed" for global roles (superadmin, lso, lso_externo) that lack their own companyId
---

Roles like `superadmin`, `lso`, and `lso_externo` don't belong to a single company (their `req.user.companyId` is `null`). Any backend route that reads `req.user.companyId` directly to scope a query will silently return nothing (or 403/empty) for these roles — blocking them from viewing/managing any company's modules.

**Why:** This was the root cause of a global bug where superadmin appeared "blocked" from many company modules across the app (billing, induction, subscription limits, stripe/wompi payment routes, etc.) — each route independently reimplemented the same wrong pattern.

**How to apply:** Any route/middleware that needs "the company currently being viewed" must resolve it via a helper, not raw `req.user.companyId`:

```ts
function getEffectiveCompanyId(req: any): string | null {
  const globalRoles = ['superadmin', 'lso', 'lso_externo'];
  if (globalRoles.includes(req.user?.role)) {
    const headerCompanyId = req.headers['x-company-id'] as string | undefined;
    const queryCompanyId = req.query?.companyId as string | undefined;
    if (headerCompanyId) return headerCompanyId;
    if (queryCompanyId) return queryCompanyId;
  }
  return req.user?.companyId || null;
}
```

The frontend must send `X-Company-Id` header (or `?companyId=` query) when a global-role user is viewing a specific company (e.g. via the "Company Vault" pattern used in pages like PESV Evaluaciones / EvaluacionesSst).

This helper is duplicated locally in several files (`server/routes.ts`, `server/routes/billing.ts`, `server/middleware/subscription-limits.ts`, `server/induccion-virtual-routes.ts`, `server/routes/stripe.ts`, `server/routes/wompi.ts`, `server/routes/licensed-professionals.ts`, `server/routes/lso-directory-external.ts`) rather than centralized — when adding new routes, copy this exact pattern rather than reading `req.user.companyId` directly. Some older files use a slightly different role list (e.g. `['superadmin','admin','asesor']` or a `hasGlobalAccess()` helper) — match whatever pattern already exists in that file if present.
