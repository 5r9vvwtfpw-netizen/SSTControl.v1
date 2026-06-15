---
name: RBAC isAdmin pattern
description: Convention for page-level write access guards — use canWrite(role, resource) instead of hasCompanyAdminAccess for all operational modules.
---

## Rule
Every page that controls CRUD visibility with an `isAdmin` variable must use:
```ts
const isAdmin = user?.role ? canWrite(user.role, 'RESOURCE_NAME') : false;
```
Never use `hasCompanyAdminAccess` directly for `isAdmin` — it only covers superadmin/superusuario/admin/responsable_sst and blocks all other operational roles.

**Why:** `hasCompanyAdminAccess` was the original guard but it blocked coordinador_sst, supervisores, and all other operational roles from creating/editing records in their own modules. Replaced with role-specific `canWrite(role, resource)` checks across ~30 pages.

**How to apply:**
- Import `canWrite` from `@shared/permissions`
- Pick the resource string that matches the page's domain (see list below)
- Replace all inline `hasCompanyAdminAccess(user.role)` JSX calls with `isAdmin`

## Resource mapping (page → resource)
- Trabajadores → `workers`
- Contratos → `contracts`
- PerfilesCargo → `job_profiles`
- SolicitudesArco → `workers`
- Capacitaciones → `trainings`
- Inspecciones → `inspections`
- Accidentes → `accidents`
- MedidasPreventivas → `measures`
- SaludOcupacional → `diseases`
- ConservacionAuditiva → `documents`
- DocumentosLegalesPdf → `documents`
- RevisionesDireccion, ObjetivosSst, AnalisisContexto, MedicionesAmbientales, PesvComite → `sst_management`
- PlanEmergencias → `emergency_plans`
- DetalleEstandarSst → `sst_items`
- PesvVehiculos, PesvMonitoreoGps → `vehicles`
- PesvConductores → `drivers`
- PesvInspecciones → `vehicle_inspections`
- PesvCapacitaciones → `road_trainings`
- PesvCapacitacionesEvaluacion → `road_safety_trainings`
- PesvAuditorias → `pesv_audits`
- PesvRutasSeguras, PesvSiniestros → `road_incidents`

## Exceptions (intentionally kept as hasCompanyAdminAccess)
- `PesvMantenimientoVehicular.tsx` — uses `hasCompanyAdminAccess(role) || role === 'tecnico_mecanico'` (special dual-role check)
- `CompanyManagement.tsx` — `hasAccess` guards company-level admin panel, not a write resource

## hasCompanyAdminAccess
Now covers: superadmin | superusuario | admin | **responsable_sst**
(responsable_sst added to support legacy paths and CompanyManagement access)
