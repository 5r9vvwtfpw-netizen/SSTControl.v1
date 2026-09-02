---
name: Production billing data alignment
description: Production billing dashboard records are not automatically evidence of gateway-collected revenue.
---

The production billing dashboard must distinguish local subscription/invoice state from gateway-confirmed payments. Active subscription rows, paid local invoices, Stripe PaymentIntents, and Wompi transactions are separate evidence sources and should only be reconciled through explicit gateway references and company metadata.

**Why:** A production review found active local subscriptions and paid local invoices without matching local transaction rows, while the configured Stripe account had successful payments unrelated to the application. Wompi also defaults to sandbox when its mode flag is unset.

**How to apply:** Before reporting revenue as collected, require a successful gateway record linked to the application company/subscription/invoice and verify the gateway mode. Treat unlinked local records as administrative/accounting records, not proof of payment.