---
name: Policy PDF signers
description: The Política SST report must reflect the signers selected and stored on that policy.
---

The Política SST form and PDF use the signers configured for the company: SST-Colombia as ELABORÓ, the active assigned LSO as AUTORIZÓ, and the company's legal representative/high management as APROBÓ. Their configured signature images come from the standard company/LSO signer sources.

**Why:** The policy form previously allowed arbitrary workers and the PDF displayed those workers, while the required approval signatures are configured centrally in Empresas and the LSO assignment.

**How to apply:** Keep the form read-only for these three roles and load the same configured signer source used by the PDF. Do not let policy worker IDs override the company-configured names or signature URLs.