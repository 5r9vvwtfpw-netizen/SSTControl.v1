---
name: ePayco confirmation status
description: Provider signature does not authenticate the response-status field.
---

Do not grant service based solely on a valid ePayco confirmation signature plus an approved-looking response string. For approvals, query ePayco directly and match the transaction to the local invoice, reference, ID, amount, currency, and sandbox/live environment.

**Why:** The ePayco confirmation signature covers reference, transaction ID, amount, and currency, but not the response-status text. A changed status on an otherwise signed payload can falsely appear approved.

**How to apply:** Treat the callback as a notification to verify the provider's actual status before any entitlement change; retry when provider verification is unavailable rather than granting or silently dropping service.