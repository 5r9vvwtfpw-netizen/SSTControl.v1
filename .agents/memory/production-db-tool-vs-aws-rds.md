---
name: Production DB tool queries wrong database for this project
description: The database skill's environment="production" executeSql call hits Replit-managed Postgres, not this app's real AWS RDS production DB — use direct pg connection instead.
---

This project's actual production database is AWS RDS PostgreSQL (per replit.md), not Replit's managed Postgres. The `executeSql` tool with `environment: "production"` queries a Replit-managed replica that only has ~14-19 seed/demo companies — it will NOT show real client data (e.g. a client company created in the live app will be missing).

**Why:** The app's `server/db.ts` switches to AWS RDS only when `NODE_ENV === 'production'` AND `AWS_RDS_HOST`/`AWS_RDS_PASSWORD` are set; those secrets are available as real env vars in the workspace (bash tool), but not exposed via `process.env` inside the `code_execution` sandbox.

**How to apply:** To inspect real production data for this app, run a small Node script via the `bash` tool (not `code_execution`) using the `pg` package, connecting with `AWS_RDS_HOST`, `AWS_RDS_PORT` (default 5432), `AWS_RDS_USER` (default postgres), `AWS_RDS_PASSWORD`, `AWS_RDS_DATABASE` (default postgres), `ssl: { rejectUnauthorized: false }`. Only ever run read-only SELECT queries this way. If a company/record can't be found via the standard production DB skill, this mismatch is the likely reason — don't conclude the data doesn't exist without checking AWS RDS directly.
