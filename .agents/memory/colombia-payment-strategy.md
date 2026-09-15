---
name: Colombia payment strategy
description: Decisión comercial y condición de activación de las pasarelas de pago en Colombia.
---

Para Colombia, el método definitivo es Wompi/PSE por transferencia bancaria; Stripe para tarjetas debe ocultarse cuando PSE quede habilitado. Mientras Wompi no haya aprobado la cuenta empresarial, PSE debe permanecer desactivado y Stripe puede seguir disponible para no dejar el sistema sin medio de pago.

**Why:** El propietario confirmó que recibió la cuenta bancaria empresarial, pero aún debe registrar y aprobar el comercio en Wompi. El botón PSE se ocultó intencionalmente hasta completar esa certificación.

**How to apply:** Preparar y probar la integración sin activar cobros reales. Habilitar PSE y retirar Stripe para Colombia únicamente después de cargar credenciales productivas, configurar el webhook público y completar pruebas sandbox y una transferencia controlada.