---
name: Cobro por alta de trabajador
description: Regla de negocio sobre entradas de trabajadores, retiros y facturación sin deducir reembolsos.
---

Cada trabajador que entra al sistema se cobra. Registrar su retiro no implica cancelar ni devolver automáticamente el cobro ya causado. Distinguir registros históricos, trabajadores vigentes y la base facturable de cada período; no equipararlos sin una regla expresa.

**Why:** El usuario aclaró explícitamente que todo trabajador que entra se cobra al cuestionar si reducir automáticamente el próximo PSE de 20 a 18 por dos estados `retirado`. Bajar un conteo vigente no demuestra por sí mismo que corresponda bajar el importe.

**How to apply:** Antes de recalcular PSE o `workersPurchased` por un retiro, verificar la fecha efectiva y la política de meses posteriores. Aún no está decidido si un retirado sigue cobrándose cada mes o deja de cobrarse desde un período determinado. No inferir la fecha de retiro de la fecha de fin del contrato.