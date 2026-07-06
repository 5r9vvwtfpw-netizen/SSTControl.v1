---
name: Accounting sync test-company exclusion
description: How test/demo companies are permanently excluded from the Cloud Books accounting integration
---

Some companies in this app are internal test/demo accounts (identifiable by placeholder-looking NITs, e.g. sequential digits or non-standard prefixes) that should never have their invoices synced to the real Cloud Books accounting system, even though they have real `paid` invoices in the DB.

**Why:** Confirmed with the client (2026-07-06) after 3 of 5 invoices stuck in the accounting retry queue turned out to belong to two demo companies (NECTRA FOOD SA, Mi Comida) created during earlier testing/demos, not real customers.

**How to apply:** `isExcludedFromAccounting(companyId)` in `server/services/accounting-integration.ts` holds a hardcoded exclusion set. Any code path that sends invoices to accounting (Stripe webhook handler in `server/index.ts`, `server/jobs/monthly-billing.ts`, `server/jobs/accounting-retry.ts`) must check this before calling `sendInvoiceToAccounting`, and mark the invoice `accountingSyncStatus = 'excluded'` instead. The retry-eligibility query in `storage.ts` (`getInvoicesPendingAccountingSync`) also excludes status `'excluded'` so these invoices stop being retried. When a new demo/test company is created, add its ID to the exclusion set — there is no schema flag for this, it's an explicit allowlist maintained in code.
