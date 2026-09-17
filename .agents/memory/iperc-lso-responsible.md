---
name: IPER responsible is assigned LSO
description: The responsible person for an IPER matrix must come from the company's active LSO assignment.
---

When a company has an active internal or external LSO assignment, IPER uses that person's name and the cargo "Licenciado en Salud Ocupacional (LSO)" as the matrix responsible. The server enforces the same values on matrix create and update; the form only displays the assignment and disables manual replacement while it is available.

**Why:** The matrix was previously using an active worker or generic SST responsible, which disconnected the document from the professional actually assigned by the company.

**How to apply:** Resolve the active assignment by company, support both `externalLsoName` and the linked user's name/license, and preserve the worker fallback only when no active LSO assignment exists.