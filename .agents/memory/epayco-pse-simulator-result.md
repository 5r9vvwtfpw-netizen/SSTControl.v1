---
name: Resultado PSE simulado frente a ePayco
description: Diferenciar la aprobación bancaria de prueba del resultado final del procesador.
---

**Regla:** Nunca activar o renovar una suscripción basándose en la pantalla o el correo de aprobación del banco de pruebas PSE. El resultado comercial requiere confirmación firmada y validada de ePayco, con importe y moneda coincidentes.

**Why:** En una prueba real, Banka/ACH mostró aprobación y envió correo, pero ePayco mantuvo el registro previo como rechazado y más tarde envió una confirmación firmada de rechazo para la misma operación. Una consulta temprana a ePayco puede devolver el estado de creación anterior a la respuesta bancaria; no confundir su hora con la de una decisión final.

**How to apply:** Al diagnosticar PSE, contrastar identificador, importe, moneda, estado y fecha de cada fuente. Mantener el pago pendiente hasta una confirmación verificable, mostrar el estado final del servidor al usuario y no repetir ni marcar pagos manualmente por una captura o correo.