---
name: Worker portal billing block and LSO access
description: Neutral worker-facing block for an unpaid company, separate from LSO portal access and manual company suspension.
---

The contracting company is responsible for the subscription. When its access is blocked for non-payment, a worker entering the Employee Portal must see a discreet, neutral "Acceso bloqueado" notice that directs them to their company administrator. Never expose subscription/payment details or a payment button to workers, and never send workers to the company's billing panel.

**Why:** On 2026-10-20, the user reported that a worker saw a conspicuous payment modal and its button opened the company billing panel; the user requested a more subtle blocked message instead. A server restart does not clear stored browser sessions, so a full-screen blocked state must also let the worker log out.

**How to apply:** In the worker portal, use only the neutral blocked state and do not expose subscription status reasons or payment navigation. Keep payment management restricted to company administrators, but provide a working logout action from the blocked state. LSO and external LSO access remains governed separately by their assigned-company suspension policy. Review all duplicate exemption lists when changing subscription behavior:
- `client/src/hooks/useSubscriptionCheck.ts`
- `server/middleware/subscription-check.ts`
- `server/auth.ts`
- `client/src/pages/MiSuscripcion.tsx`

Separately, `server/middleware/feature-gate.ts` (`GLOBAL_ACCESS_ROLES`) and `server/middleware/subscription-limits.ts` gate specific premium *features* by plan (not payment status) — a different concern, not necessarily to be touched for pure "is my subscription paid" checks, but worth checking if LSO/trabajador ever hit a "Feature not available" 403.

## Suspensión manual de una empresa en el Portal LSO

Cuando superadmin bloquea una empresa desde Gestión de Empresas, el LSO y el LSO externo no pueden abrir sus módulos, consultar registros, modificarlos, firmarlos ni descargar informes. La empresa sigue visible como suspendida; la cuenta del profesional y el acceso a sus otras empresas permanecen activos. Conservar la asignación y restablecer el acceso cuando superadmin reactive la empresa.

**Why:** El usuario indicó «si yo bloqueo aquí por superadmin, se bloque en el portal LSO también» y autorizó el bloqueo completo por empresa. Que el portal sea gratuito no permite eludir la suspensión de esa empresa.

**How to apply:** Aplicar la restricción al propietario real de los registros y al contexto autorizado de empresa, sin desactivar la cuenta ni eliminar asignaciones. No extender esta autorización al Portal de Empleados ni convertir la mora por sí sola en una nueva restricción LSO.

**Confirmed bug (2026-07-08):** `checkWorkerLimit()` in `subscription-limits.ts` had an unconditional `403 "Suscripción requerida"` when a company had no active/trial subscription row — this fired even for `superadmin`, blocking worker creation for any company without a subscription record, unrelated to any companyId-resolution bug. Fixed by adding the same `platformExemptRoles` (`superadmin`, `soporte`, `lso`, `lso_externo`) bypass used elsewhere, applied to both `checkWorkerLimit()` and `checkFeatureAccess()`. Lesson: when auditing "is superadmin blocked anywhere," check every subscription/limit middleware for unconditional company-status branches, not just role/permission checks — a company-status block can 403 a platform role just as easily as a missing permission can.
