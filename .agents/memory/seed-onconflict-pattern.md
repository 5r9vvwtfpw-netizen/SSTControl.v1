---
name: Seed onConflictDoNothing pattern
description: Why onConflictDoNothing can leave stale data in production and how to fix it
---

# Seed onConflictDoNothing — Stale Data in Production

## The rule
When a seed uses `onConflictDoNothing()`, any column that is added or changed after the initial production deployment will remain with its old/null value forever. To ensure catalog data is always in sync, add explicit `UPDATE` queries for critical fields **in addition to** the insert.

**Why:** Production has retained stale master data more than once after fields were added or expanded. This affected both SST applicability values and EPP size lists because existing seeded rows were silently skipped.

**How to apply:** After inserting missing catalog rows, idempotently synchronize authoritative master rows by stable ID. Guard the update so tenant-created or customized records are never overwritten.
