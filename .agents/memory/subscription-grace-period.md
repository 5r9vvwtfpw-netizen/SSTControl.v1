---
name: Subscription expiry grace period
description: How subscriptions transition from active to blocked/past_due and where the grace period is configured.
---

Subscription status has two tables: `subscriptions` (has `current_period_end`, the real source of the billing period) and `pricing_plugin_subscriptions` (has `subscription_status`, which is what `server/middleware/subscription-check.ts` actually reads first to decide if the app should block access / show the payment button).

The `status` field on `pricing_plugin_subscriptions` does NOT auto-expire based on any date column — it only changes when a Stripe webhook fires, or when the daily cron in `server/cron/manual-subscription-expiry.ts` runs and finds `subscriptions.current_period_end` older than `GRACE_PERIOD_DAYS` (in that file), at which point it updates both tables to `past_due`.

**Why:** Clients on bank-transfer billing (no Stripe subscription object, `stripe_subscription_id` null) never get a webhook-driven status change, so this cron is their only path to being flagged as overdue. A short grace period (previously 3 days, now 1) intentionally delays showing the "renew" button so a client isn't blocked the instant the period ends.

**How to apply:** If a client reports "my subscription shows vencido/expired but the payment button isn't showing," check `subscriptions.current_period_end` for that company via direct AWS RDS query (see production-db-tool-vs-aws-rds.md) — it's very likely just within the grace period window in `manual-subscription-expiry.ts`, not a bug.
