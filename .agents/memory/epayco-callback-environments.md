---
name: ePayco callback environments
description: Keep PSE return and confirmation URLs isolated between development and production.
---

Use the Replit development domain for ePayco return and confirmation URLs outside production; use the configured public APP_URL in production.

**Why:** APP_URL is shared and points at the production site. Sending development PSE callbacks there would mix sandbox traffic with the live app and its records.

**How to apply:** When building callback URLs for ePayco or another external payment provider, resolve the base URL by runtime environment instead of using a shared APP_URL unconditionally.