---
name: Neon WebSocket test instability
description: Development browser tests may be interrupted by an uncaught ErrorEvent in the Neon serverless WebSocket client.
---

In development, the Neon serverless WebSocket client has emitted an uncaught `TypeError` while assigning `message` on an `ErrorEvent`. During A02 browser validation, direct authenticated API requests and PDF generation succeeded, while the browser session intermittently remained blank and the workflow logged this exception.

**Why:** Repeating the browser test created delay and confusing partial results without fixing the database transport error.

**How to apply:** When authenticated browser tests against development Neon go blank, inspect workflow logs before repeating. Separate API/PDF results from UI navigation results, reuse retained test records, and avoid reporting the UI click as verified unless its response is observed.
