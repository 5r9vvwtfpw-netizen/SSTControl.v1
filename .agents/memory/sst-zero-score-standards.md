---
name: Applicable SST standards with zero points
description: Keep zero-weight standards in completeness checks and evaluation flows
---

An SST standard with a non-null score is applicable even when its score is zero. Include it in the evaluation and require a response; a 100% score alone does not prove every applicable standard was answered.

**Why:** Filtering standards with `score > 0` omitted two applicable records from a DEMO-PRUEBA evaluation while the calculated percentage still showed 100%.

**How to apply:** Determine applicability from the score being non-null, then independently verify that response count equals the full applicable-standard count.
