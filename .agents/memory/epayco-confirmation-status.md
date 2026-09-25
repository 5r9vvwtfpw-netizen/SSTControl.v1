---
name: ePayco confirmation status
description: Provider signature does not authenticate the response-status field.
---

Do not grant service based solely on a valid ePayco confirmation signature plus an approved-looking response string. For approvals, query ePayco directly and match the transaction to the local invoice, reference, ID, amount, currency, and sandbox/live environment.

**Why:** The ePayco confirmation signature covers reference, transaction ID, amount, and currency, but not the response-status text. A changed status on an otherwise signed payload can falsely appear approved.

**How to apply:** Treat the callback as a notification to verify the provider's actual status before any entitlement change; retry when provider verification is unavailable rather than granting or silently dropping service.

An ePayco PSE confirmation can carry an `x_transaction_id` different from the `transactionID` returned when starting/querying that PSE transaction. Rejecting the signed callback solely for that difference prevented activation of a real approved payment. The provider's direct PSE lookup for the saved ticket must instead match the locally stored invoice, ePayco reference, original PSE transaction ID, amount, currency, and test/live mode.

**Why:** The signed callback was rejected with HTTP 400 despite a direct provider lookup reporting APPROVED and matching every stored payment field. The signed reference ties the callback to the local payment; the callback ID is not the authoritative identifier for the PSE lookup.

**How to apply:** Reconcile on both valid signed callbacks and authenticated status polling; the latter covers a dropped or rejected notification without treating browser-return parameters as proof of payment. Claim entitlements idempotently.