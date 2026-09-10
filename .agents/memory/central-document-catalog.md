---
name: Central document catalog
description: The document module should index and audit documents owned by other modules, not become a second upload repository.
---

The central document area should be a catalog and traceability layer. Each business module remains the source of truth for its files, lifecycle, and permissions; the catalog stores metadata and links to the originating record or PDF endpoint.

**Why:** Requiring every company to upload copies of documents that the system already generates creates duplicated storage, confusing ownership, and an unmanageable administrative burden at scale.

**How to apply:** Prefer automatic, idempotent registration of generated documents and deep links to their source. Keep manual upload only for external or legacy documents, clearly separated as an exception. Use pagination and server-side counts for cross-company views.