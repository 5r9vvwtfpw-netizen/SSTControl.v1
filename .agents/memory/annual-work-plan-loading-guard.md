---
name: Annual work plan loading guard
description: Keep the annual work-plan UI from presenting transient empty data as a plan with no activities.
---

Do not render zero activity metrics or offer calendar generation while the activity and insight queries are still loading or refreshing. A creation endpoint must keep its duplicate guard, but its error should explain that stored activities were preserved and how to view them. Never trigger force regeneration as an automatic retry because it deletes and recreates existing activities.

**Why:** A user saw zero metrics while the backend already had saved activities; clicking the visible generator then correctly rejected a duplicate request, which looked like data loss. Force regeneration could destroy manual status and evidence.

**How to apply:** In annual-plan detail views, distinguish loading, fetch error, loaded-empty, and loaded-with-activities states before showing metrics or generator controls.
