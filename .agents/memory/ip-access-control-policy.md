---
name: IP access-control policy
description: Política acordada para monitoreo y autorización de IP en cuentas de usuario.
---

Una cuenta solo queda restringida por IP cuando el superadmin configura al menos una IP autorizada. Una IP nueva o no registrada debe generar una alerta y quedar en el historial, pero no bloquear automáticamente el primer acceso.

**Why:** Las IP pueden cambiar por proveedor, VPN, red móvil o red compartida; bloquear el primer cambio puede dejar fuera a una persona legítima.

**How to apply:** Mantener la lista vacía como modo sin restricción. Cuando exista una lista, comparar y marcar accesos no coincidentes como sospechosos. Cualquier evolución a bloqueo por reincidencia o suspensión requiere una decisión explícita separada.