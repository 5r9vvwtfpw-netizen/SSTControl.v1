---
name: Cobro por alta de trabajador
description: Regla de negocio sobre entradas de trabajadores, retiros y facturación sin deducir reembolsos.
---

Cada trabajador que entra al sistema se cobra en el ciclo en que fue registrado, incluso si se retira en ese mismo ciclo. Registrar su retiro no implica cancelar ni devolver automáticamente el cobro ya causado. Desde el ciclo siguiente al retiro efectivo, el trabajador retirado deja de sumar a la mensualidad. Un trabajador nuevo que lo reemplace también se cobra, no hereda gratis el cobro anterior. Distinguir registros históricos, trabajadores vigentes y la base facturable de cada período.

**Why:** El usuario aclaró explícitamente que todo trabajador que entra se cobra, pero «retirado» no suma en los demás ciclos. Bajar un conteo vigente no demuestra por sí mismo si debe bajar un importe ya causado; se necesita la fecha efectiva y el período facturado.

**How to apply:** Pedir confirmación de la fecha efectiva mediante un diálogo al marcar el retiro; contar al trabajador en el ciclo del retiro y excluirlo de los posteriores. Guardar un desglose por ciclo para no reescribir pagos anteriores ni el importe de un PSE ya iniciado. No inferir la fecha de retiro de la fecha de fin del contrato.