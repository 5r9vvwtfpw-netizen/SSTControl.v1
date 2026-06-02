---
name: Seed onConflictDoNothing pattern
description: Why onConflictDoNothing can leave stale data in production and how to fix it
---

# Seed onConflictDoNothing — Stale Data in Production

## The rule
When a seed uses `onConflictDoNothing()`, any column that is added or changed after the initial production deployment will remain with its old/null value forever. To ensure catalog data is always in sync, add explicit `UPDATE` queries for critical fields **in addition to** the insert.

**Why:** The `estandaresSst` table uses `onConflictDoNothing` for all 61 standards. The `puntajeTipo1` column was added/changed after initial deployment for some standards, leaving them as `null` in production. `getEstandaresByTipoEmpresa('tipo1')` filters by `puntajeTipo1 IS NOT NULL`, so null values meant 0 applicable standards → `generarPlanMejoraAutomatico` always returned `[]`.

**How to apply:** After any `onConflictDoNothing` insert loop for catalog data, add idempotent `UPDATE` queries for fields that may have changed since initial deployment. Already applied in `server/sst-seed.ts` for all 10 tipo1 standards.

## Affected function
- `generarPlanMejoraAutomatico` in `server/storage.ts`
- Seed in `server/sst-seed.ts` (the `tipo1Updates` loop after the insert)
