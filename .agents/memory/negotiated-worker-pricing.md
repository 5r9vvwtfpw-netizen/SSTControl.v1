---
name: Tarifas negociadas por empresa
description: Regla comercial para tarifas particulares, cupones y cobros en curso.
---

Una empresa puede tener una tarifa fija por trabajador o un descuento porcentual sobre la tarifa general. La tarifa negociada no se combina con cupones promocionales. Los cambios de acuerdo aplican a cobros futuros: una operación ya iniciada conserva su importe y las facturas anteriores no se recalculan.

**Why:** Acumular cupón y acuerdo podría aplicar dos descuentos no pactados. Recalcular un pago pendiente después de mostrar su importe al pagador rompería la correspondencia entre transacción y comprobante.

**How to apply:** Al añadir un canal de cobro, verificar la cotización pública, aplicar solo el acuerdo vigente autorizado para la empresa y guardar cantidad facturable, tarifa y total al iniciar el pago. Si cambia el acuerdo antes de usar un enlace de pago, exigir una cotización nueva.