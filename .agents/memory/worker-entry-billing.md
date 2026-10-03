---
name: Cobro por alta de trabajador
description: Regla de negocio sobre entradas de trabajadores, retiros y facturación sin deducir reembolsos.
---

Cada trabajador que entra al sistema se cobra en el ciclo en que fue registrado, incluso si se retira en ese mismo ciclo. Registrar su retiro no implica cancelar ni devolver automáticamente el cobro ya causado. Desde el ciclo siguiente al retiro efectivo, el trabajador retirado deja de sumar a la mensualidad. Un trabajador nuevo que lo reemplace también se cobra, no hereda gratis el cobro anterior. Distinguir registros históricos, trabajadores vigentes y la base facturable de cada período.

**Why:** El usuario aclaró explícitamente que todo trabajador que entra se cobra, pero «retirado» no suma en los demás ciclos. Bajar un conteo vigente no demuestra por sí mismo si debe bajar un importe ya causado; se necesita la fecha efectiva y el período facturado.

**How to apply:** Pedir confirmación de la fecha efectiva mediante un diálogo al marcar el retiro; contar al trabajador en el ciclo del retiro y excluirlo de los posteriores. Guardar un desglose por ciclo para no reescribir pagos anteriores ni el importe de un PSE ya iniciado. No inferir la fecha de retiro de la fecha de fin del contrato.

Al pasar de pagos por transferencia externa a PSE, tratar la fecha de fin del período previamente pagado como límite de cobertura; no reconstruir cobros de retirados históricos sin evidencia de su fecha efectiva. Una vez confirmado un PSE, usar la fecha de **inicio del intento cobrado**, no la fecha de aprobación, como límite para arrastrar nuevas altas no incluidas en aquel importe.

**Why:** Una confirmación bancaria puede llegar después de que se registró y retiró un trabajador; usar la aprobación como límite haría que su alta se perdiera entre ciclos. También sería incorrecto cobrar otra vez los retiros anteriores a la transición.

**How to apply:** Separar la cobertura externa del primer PSE y conservar la fecha de instantánea de cada pago para el ciclo siguiente. No reescribir transacciones pendientes ni pagos confirmados al actualizar la plantilla de cotización.

Al reabrir administrativamente un pago, conservar el límite de conteo del ciclo que el usuario confirmó. Cambiar la suscripción de activa a vencida no debe volver a incluir retiros de ciclos anteriores. Un límite administrativo de conteo no acredita pago, no extiende la licencia y nunca reemplaza la instantánea de un PSE aprobado.

**Why:** Al reabrir una mensualidad, el cálculo dependiente del estado podía usar el inicio del período anterior y sumar otra vez a un trabajador retirado antes del ciclo solicitado.

**How to apply:** Confirmar las fechas y el alcance del ajuste, conservar el límite sin inventar fechas de pago y comprobar el importe con el mismo cálculo verificado que inicia PSE. Distinguir la actualización de datos en producción de una corrección de cálculo que todavía requiere publicación.