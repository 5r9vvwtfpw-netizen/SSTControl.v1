---
name: Production billing data alignment
description: Production billing dashboard records are not automatically evidence of gateway-collected revenue.
---

The production billing dashboard must distinguish local subscription/invoice state from gateway-confirmed payments. Active subscription rows, paid local invoices, Stripe PaymentIntents, and Wompi transactions are separate evidence sources and should only be reconciled through explicit gateway references and company metadata.

**Why:** A production review found active local subscriptions and paid local invoices without matching local transaction rows, while the configured Stripe account had successful payments unrelated to the application. Wompi also defaults to sandbox when its mode flag is unset.

**How to apply:** Before reporting revenue as collected, require a successful gateway record linked to the application company/subscription/invoice and verify the gateway mode. Treat unlinked local records as administrative/accounting records, not proof of payment.

For the superadmin billing dashboard, calculate MRR from each active subscription's latest approved monthly PSE payment matched to its paid invoice; use the invoice subtotal before VAT, exclude extra-seat purchases, and identify active subscriptions without PSE-confirmed revenue. Label annualized MRR as an estimate. Group cash revenue by provider payment/approval time in the Colombia calendar month and refresh the open dashboard periodically.

**Why:** The user chose to align this dashboard with PSE-confirmed charges. A catalog plan price or locally active subscription is not evidence of the negotiated PSE amount or cash receipt.

**How to apply:** Keep active-subscription counts, confirmed PSE MRR, and total collected payments as separate measures. Never silently fill unconfirmed PSE MRR with catalog prices.