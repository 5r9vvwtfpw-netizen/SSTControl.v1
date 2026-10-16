---
name: Development schema push drift
description: Safe handling of Drizzle schema drift between this project and its development database.
---

When a development-only schema change is needed, inspect the full `drizzle-kit push` plan before accepting it. If it proposes unrelated enum renames or broad schema reconciliation, stop rather than selecting through the prompts; apply only the intended additive change using the project's documented development database workflow.

**Why:** the development database can lag behind the current Drizzle schema; even a one-table addition can surface unrelated enum renames that should not be accepted.

**How to apply:** before `db:push`, confirm the target is development and review all proposed operations. Never use this as a reason to write to production or to bypass the project's external-database migration policy.
