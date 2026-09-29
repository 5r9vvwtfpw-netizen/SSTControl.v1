---
name: Effective companyId resolution pattern
description: How to resolve the "company being viewed" for global roles (superadmin, lso, lso_externo) that lack their own companyId
---

Roles like `superadmin`, `lso`, and `lso_externo` don't belong to a single company (their `req.user.companyId` is `null`). Any backend route that reads `req.user.companyId` directly to scope a query will silently return nothing (or 403/empty) for these roles — blocking them from viewing/managing any company's modules.

**Why:** This was the root cause of a global bug where superadmin appeared "blocked" from many company modules across the app (billing, induction, subscription limits, stripe/wompi payment routes, etc.) — each route independently reimplemented the same wrong pattern.

**How to apply:** Any route/middleware that needs "the company currently being viewed" must resolve it via a helper, not raw `req.user.companyId`. Superadmin may select any company. LSO and LSO externo may select only a company backed by an active professional assignment; validate once in middleware and make downstream resolvers consume that validated value.

The frontend must send `X-Company-Id` header (or `?companyId=` query) when a global-role user is viewing a specific company. If both selectors are present, reject contradictory values rather than validating one and letting a downstream handler consume the other.

For detail-page navigation, carry the company selector in the page URL and use it on the very first API request. Do not wait for the detail response to populate local storage: assignment middleware runs before that response exists, creating a circular failure on clean production sessions.

**Why:** The PESV list loaded correctly with a company selector, but opening an evaluation dropped it; both the detail and responses requests arrived with an empty query and were rejected before the page could recover the evaluation's company.

**How to apply:** When a global-role list opens a company-owned record, preserve `companyId` in the destination URL. The detail page must send it on its initial fetch, then persist the validated record context for subsequent submodule requests.

Company classification and feature gates must use that same contextual company, not the LSO account's base company. Tenant query caches on destination modules must include the effective company ID.

**Why:** SST standards 6.1.2/6.1.3 opened assigned-company modules, but the chapter gate showed the LSO base company's seven-standard classification; shared query keys could also display the previous assigned company's cached data.

**How to apply:** Make the destination URL context authoritative for LSO navigation, keep mechanic/superadmin selections higher priority, calculate chapter from the contextual company, and partition tenant query keys by effective company ID.

Some route modules duplicate their own resolver. They must never reinterpret raw headers, query parameters, or body fields for LSO after middleware validation; consume the validated context exclusively.

**Why:** Trusting raw company selectors for LSO created a tenant-IDOR risk: a professional could request a company to which they had no active assignment, or validate one selector while a handler consumed another.

For global list endpoints, "global role" must not automatically mean "return all companies." If an effective company context is present, use the company-scoped query; only return the global list when no company context was supplied.

**Why:** A PESV H01 link correctly selected an evaluation's company, but the drivers and vehicles endpoints discarded that context solely because the requester was superadmin, mixing multiple companies in one screen.

**How to apply:** Branch on both conditions: global role and absence of an effective company ID for the all-companies query. Partition frontend query caches by the same effective company ID.

LSO and LSO externo are never global-list roles. Even if a route also serves superadmin, keep the LSO branch separate and always filter by the assignment-validated effective company ID; a missing query selector must never fall through to an unfiltered result.

**Why:** Treating LSO as an admin for a PESV list caused omission of `companyId` to return every company's evaluations in production.

**How to apply:** Only true platform-wide roles may enter an unfiltered list branch. Resolve LSO scope first, require a validated company, and apply it in the database predicate.

Global-role navigation must also avoid company-only feature checks when no company is selected; otherwise a superadmin's missing `companyId` can hide a valid cross-company module before its global endpoint is reached.

**Why:** The vehicle-management menu used `/api/company/current` to decide whether PESV existed, so the superadmin could not see vehicles registered by client companies even though the data and route permissions were valid.

**How to apply:** For global roles, show the module and enable the all-companies query without a selected company; when a company context exists, keep the normal scoped query and feature checks.

A company vault may display company-scoped records without establishing the superadmin's audited provider-access session. Do not treat a local vault selection as authority for writes.

**Why:** A worker vault could show one company's workers using its own read header while module writes used another globally selected company (or none).

**How to apply:** Before entering an operational company vault for edits, confirm access with the existing audit-session flow and wait until the active company matches. Clear stale vault details when access ends or switches.
