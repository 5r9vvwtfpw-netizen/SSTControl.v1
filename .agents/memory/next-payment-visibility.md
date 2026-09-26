---
name: Visibilidad del próximo pago
description: Ubicación y veracidad del importe tras movimientos de trabajadores.
---

El cliente consulta el importe del próximo pago en **Mi Cuenta**, no en la tarjeta de la empresa. En este flujo el pago es **solo PSE**; no plantear una cifra de renovación Stripe ni tratarla como una necesidad de Mi Cuenta. Al retirar personal debe poder entender por qué los trabajadores facturables pueden superar a los vigentes: un retiro no elimina importes ya causados en el ciclo. La cifra visible debe corresponder al cálculo usado para pagar, no a una fórmula fija ni a una cotización guardada que pueda haber quedado obsoleta.

**Why:** El usuario aclaró que después de retirar un trabajador el cliente no irá a buscar el precio en la tarjeta empresarial; mostrar allí una cifra o reutilizar una vista previa antigua lo deja sin una referencia práctica y confiable para su siguiente pago. También corrigió explícitamente que Stripe ya no se usa para este flujo y que mencionar renovaciones antiguas en Mi Cuenta es irrelevante.

**How to apply:** Usar la misma cotización verificada de PSE que se usa al iniciar el pago y distinguir un pago futuro calculado de una factura ya emitida. Ante un error o falta de datos, mostrar la indisponibilidad sin sustituirla por cero ni por un importe anterior. Mantener separado el historial de pagos del importe próximo; no introducir Stripe en la explicación ni en el cálculo de Mi Cuenta.