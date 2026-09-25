---
name: Stripe to PSE transition
description: Boundary between disabling new Stripe purchases and settling pre-existing Stripe obligations.
---

Do not equate hiding Stripe checkout or blocking new sessions with cancelling existing Stripe subscriptions. Keep signed Stripe webhooks for payments already initiated; review externally managed recurring subscriptions separately before disabling their credentials or webhooks.

**Why:** A customer may complete a previously opened checkout, and an externally managed Stripe subscription may renew independently of this application's new checkout buttons. Removing settlement could leave a charge without service; cancelling recurring billing affects existing customers and requires an explicit business decision.

**How to apply:** When changing available payment providers, distinguish new transaction initiation from existing payment settlement and external recurring commitments. Never assume a new-provider-only UI has stopped existing provider renewals.