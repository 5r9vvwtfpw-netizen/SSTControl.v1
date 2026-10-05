---
name: Cobro por alta de trabajador
description: Regla de negocio sobre entradas de trabajadores, retiros y facturación sin deducir reembolsos.
---

Cada trabajador que entra al sistema se cobra en el ciclo en que fue registrado, incluso si se retira en ese mismo ciclo. Registrar su retiro no implica cancelar ni devolver automáticamente el cobro ya causado. Desde el ciclo siguiente al retiro efectivo, el trabajador retirado deja de sumar a la mensualidad. Un trabajador nuevo que lo reemplace también se cobra, no hereda gratis el cobro anterior. Distinguir registros históricos, trabajadores vigentes y la base facturable de cada período.

**Why:** El usuario aclaró explícitamente que todo trabajador que entra se cobra, pero «retirado» no suma en los demás ciclos. Bajar un conteo vigente no demuestra por sí mismo si debe bajar un importe ya causado; se necesita la fecha efectiva y el período facturado.

**How to apply:** Pedir confirmación de la fecha efectiva mediante un diálogo al marcar el retiro; contar al trabajador en el ciclo del retiro y excluirlo de los posteriores. Guardar un desglose por ciclo para no reescribir pagos anteriores ni el importe de un PSE ya iniciado. No inferir la fecha de retiro de la fecha de fin del contrato.

Al pasar de pagos por transferencia externa a PSE, usar el inicio del período activo como corte del personal ya cubierto: las altas registradas después de ese inicio se cobran en la primera cotización PSE, aunque se retiren antes del próximo vencimiento. No volver a cobrar al personal anterior al corte. Una vez confirmado un PSE, usar la fecha de **inicio del intento cobrado**, no la fecha de aprobación, como corte para arrastrar nuevas altas no incluidas en aquel importe.

**Why:** El usuario confirmó que un trabajador que entra al sistema y consume el servicio debe cobrarse aunque se retire horas después; excluir una alta reciente por mirar solo el fin del período dejaría trabajo sin cobrar. También sería incorrecto volver a cobrar al personal ya cubierto antes del inicio del período.

**How to apply:** En la primera cotización PSE, distinguir la plantilla ya cubierta al inicio del período de las altas posteriores; tras PSE, conservar la instantánea de cada intento y no reescribir transacciones pendientes ni pagos confirmados.

Al reabrir administrativamente un pago, conservar el límite de conteo del ciclo que el usuario confirmó. Cambiar la suscripción de activa a vencida no debe volver a incluir retiros de ciclos anteriores. Un límite administrativo de conteo no acredita pago, no extiende la licencia y nunca reemplaza la instantánea de un PSE aprobado.

**Why:** Al reabrir una mensualidad, el cálculo dependiente del estado podía usar el inicio del período anterior y sumar otra vez a un trabajador retirado antes del ciclo solicitado.

**How to apply:** Confirmar las fechas y el alcance del ajuste, conservar el límite sin inventar fechas de pago y comprobar el importe con el mismo cálculo verificado que inicia PSE. Distinguir la actualización de datos en producción de una corrección de cálculo que todavía requiere publicación.