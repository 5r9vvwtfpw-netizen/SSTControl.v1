---
name: Subscription expiry grace period
description: How subscriptions transition from active to blocked/past_due and where the grace period is configured.
---

Subscription status has two tables: `subscriptions` (has `current_period_end`, the real source of the billing period) and `pricing_plugin_subscriptions` (has `subscription_status`, which is what `server/middleware/subscription-check.ts` actually reads first to decide if the app should block access / show the payment button).

Do not treat a persisted `active` label as proof that the billing period is still valid or paid. Live access checks can recognize an expired period before the background job synchronizes the persisted statuses. An administration list may therefore still show `active` for an overdue company.

**Why:** Autoscale does not guarantee that a daily background timer runs. A production company retained active labels after its due date despite having no payment transactions, while its emailed payment link had already expired. The grace interval can change; a previously recorded fixed-day value became stale.

**How to apply:** If a client reports "my subscription shows vencido/expired but the payment button isn't showing," check `subscriptions.current_period_end` for that company via direct AWS RDS query (see production-db-tool-vs-aws-rds.md), then read the current grace-period constant and status logic. Do not assume the contract's stated grace period matches the app configuration.
