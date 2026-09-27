---
name: Subscription expiry grace period
description: How subscriptions transition from active to blocked/past_due and where the grace period is configured.
---

Subscription status has two tables: `subscriptions` (has `current_period_end`, the real source of the billing period) and `pricing_plugin_subscriptions` (has `subscription_status`, which is what `server/middleware/subscription-check.ts` actually reads first to decide if the app should block access / show the payment button).

The `status` field on `pricing_plugin_subscriptions` does NOT auto-expire based on any date column — it only changes when a Stripe webhook fires, or when the daily cron in `server/cron/manual-subscription-expiry.ts` runs and finds `subscriptions.current_period_end` older than `GRACE_PERIOD_DAYS` (in that file), at which point it updates both tables to `past_due`.

**Why:** Clients on bank-transfer billing (no Stripe subscription object) never get a webhook-driven status change, so the daily cron is their only path to being flagged as overdue. The grace interval can change; read the live code before advising on when the renew button should appear. A previously recorded fixed-day value in this memory became stale.

**How to apply:** If a client reports "my subscription shows vencido/expired but the payment button isn't showing," check `subscriptions.current_period_end` for that company via direct AWS RDS query (see production-db-tool-vs-aws-rds.md), then read the current grace-period constant and status logic. Do not assume the contract's stated grace period matches the app configuration.
