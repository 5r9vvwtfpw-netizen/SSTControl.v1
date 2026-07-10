---
name: CIIU auto-classification must be explicitly invoked per entry point
description: Company creation/update paths that skip prepareCompanyWithCiiuAutomation silently default riskLevel to "I", misclassifying required SST standards.
---

Any code path that inserts/updates a `companies` row (self-registration onboarding, admin creation, admin update, imports, etc.) must explicitly call `prepareCompanyWithCiiuAutomation` (from `shared/ciiu-company-automation.ts`) on the payload before persisting. There is no automation triggered inside the DB layer or schema defaults — it only happens if the route code calls it.

**Why:** The self-registration route (`/api/my-company`) built its insert payload by hand and never called the automation helper, so any company registering without manually picking a risk level silently fell back to risk "I" (7 standards) regardless of CIIU code — even for high-risk activities like mining (CIIU 0510, risk V, 61 standards). A zod `.default("I")` on the `riskLevel` field made this worse by masking the missing automation call entirely.

**How to apply:** When adding or auditing any company-creation/update endpoint, grep for `prepareCompanyWithCiiuAutomation` usage and confirm it wraps the final data object passed to `storage.createCompany`/`updateCompany`. Do not rely on schema-level defaults for `riskLevel` — leave it `.optional()` with no default so the automation helper can detect "no manual risk level given" via `!companyData.riskLevel`. This automation only affects risk level / standards chapter — it must never touch pricing/quote fields, which are driven solely by `numberOfWorkers`.
