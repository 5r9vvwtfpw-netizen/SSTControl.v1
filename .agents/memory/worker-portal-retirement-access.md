---
name: Retiro y acceso al Portal de Empleados
description: Regla de autorización laboral para la cuenta base del trabajador y límite de otros roles vinculados.
---

La cuenta del Portal de Empleados con rol `trabajador` depende del estado laboral `retirado` del trabajador vinculado. Ni la fecha de fin ni el estado `terminado` de un contrato histórico equivalen por sí solos al retiro. Las cuentas adicionales de otros roles vinculadas a la misma persona no se bloquean sin una decisión de negocio separada.

**Why:** El contrato y el registro del trabajador son entidades distintas; una persona puede conservar contratos históricos. Usar el estado laboral como fuente de verdad evita que una marca de bloqueo independiente se desincronice y deje accesos abiertos después del retiro. El retiro debe impedir también el uso de sesiones ya iniciadas.

**How to apply:** Al modificar entradas de autenticación, sesiones o emisión de credenciales del portal, consultar el estado laboral vigente. Si se propone extender el bloqueo a roles adicionales, acordar primero la política con el usuario y preservar sus registros históricos.