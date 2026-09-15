---
name: Daily driver alcohol flow
description: Reglas persistentes del flujo condicional de alcohol en la encuesta diaria del conductor PESV.
---

La configuración de empresa es el interruptor general para exigir el resultado diario de alcoholimetría. La declaración de no consumo siempre debe confirmarse y persistirse cuando el conductor responde “No”, incluso si la empresa no realiza alcoholimetría diaria.

**Why:** La validación únicamente visual permitiría omitir la declaración o el resultado mediante una llamada directa a la API, y no dejaría trazabilidad de la responsabilidad asumida.

**How to apply:** Mantener las mismas reglas en el portal y en el servidor. Los datos históricos deben seguir siendo válidos: el resultado puede ser nulo y la configuración de empresas existentes inicia desactivada.