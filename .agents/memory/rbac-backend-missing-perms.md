---
name: RBAC backend routes missing permissions
description: 10 mutating routes in server/routes.ts that only had requireAuth were missing permission checks, allowing tecnico_mecanico (and otros roles) to write data they shouldn't.
---

# RBAC — Rutas mutantes sin requirePermission

## The Rule
Any `app.post`, `app.patch`, or `app.delete` route must use `requirePermission(...)` or `requireAnyPermission(...)`, NOT just `requireAuth`. Using only `requireAuth` means any authenticated user can call the endpoint regardless of their role.

**Why:** Discovered during RBAC overhaul testing — `tecnico_mecanico` (vehicles-only role) could POST to `/api/accidents`, `/api/vehicle-inspections`, `/api/road-incidents`, `/api/absences`, and `/api/health-conditions`. All returned 400 (validation) instead of 403 (forbidden), confirming the permission middleware was never called.

**How to apply:** When writing a new POST/PATCH/DELETE route, always check `shared/permissions.ts` for the right permission string and use `requirePermission("resource:action")` directly in the route signature.

## Fixed Routes (in server/routes.ts)
| Route | Old | New |
|-------|-----|-----|
| POST /api/accidents | requireAuth | requirePermission("accidents:create") |
| POST /api/absences | requireAuth | requirePermission("accidents:create") |
| PATCH /api/absences/:id | requireAuth | requirePermission("accidents:edit") |
| POST /api/health-conditions | requireAuth | requirePermission("diseases:create") |
| PATCH /api/health-conditions/:id | requireAuth | requirePermission("diseases:edit") |
| DELETE /api/health-conditions/:id | requireAuth | requirePermission("diseases:delete") |
| POST /api/sociodemographic-diagnosis | requireAuth | requirePermission("diseases:create") |
| POST /api/sociodemographic-diagnosis/:id/close | requireAuth | requirePermission("diseases:edit") |
| POST /api/vehicle-inspections | requireAuth | requirePermission("vehicle_inspections:create") |
| POST /api/road-incidents | requireAuth | requirePermission("road_incidents:create") |

## Test Verification Pattern
To verify RBAC on any route quickly:
```bash
# Login and save cookie
curl -s -c /tmp/mec_cookies.txt -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"Ladic","password":"TestRBAC2025!"}' > /dev/null

# Test a route (403=blocked, 400=allowed but validation failed, 200=allowed)
curl -s -o /dev/null -w "%{http_code}" -b /tmp/mec_cookies.txt -X POST \
  http://localhost:5000/api/accidents -H "Content-Type: application/json" -d '{}'
```

## Known Test Users (DEMO-PRUEBA company)
- admin / admin123 → role: admin
- Ladic / TestRBAC2025! → role: tecnico_mecanico
- test_responsable_1768822403205 / TestRBAC2025! → role: responsable_sst (email_verified_at set manually)
