---
name: Resultado PSE simulado frente a ePayco
description: Diferenciar la aprobación bancaria de prueba del resultado final del procesador.
---

**Regla:** Nunca activar o renovar una suscripción basándose en la pantalla o el correo de aprobación del banco de pruebas PSE. El resultado comercial requiere confirmación firmada y validada de ePayco, con importe y moneda coincidentes.

**Why:** En pruebas reales, los correos y el paso por Banka/PSE no implicaron aprobación: ePayco comunicó finalmente rechazo. La confirmación firmada puede tardar varios minutos después del retorno del navegador; durante ese intervalo la aplicación puede seguir en pendiente. Una consulta temprana a ePayco puede devolver el estado de creación anterior a la respuesta bancaria; no confundir su hora con la de una decisión final.

**How to apply:** Al diagnosticar PSE, contrastar identificador, importe, moneda, estado y fecha de cada fuente. Si el webhook aún no llegó, una consulta autenticada puede informar el resultado provisional en la pantalla, pero no debe activar la suscripción ni sustituir la confirmación firmada. No repetir ni marcar pagos manualmente por una captura o correo.

**Regla de comunicación:** En mensajes a ePayco y cronologías de pagos colombianos, expresar las horas en Colombia (UTC−5). No atribuir al correo una hora colombiana a partir de una captura si no está confirmada la zona horaria del buzón.

**Why:** El entorno puede mostrar horas en otra zona horaria y confundir la secuencia entre PSE y ePayco ante el soporte colombiano.

**How to apply:** Convertir timestamps UTC del servidor a Colombia; identificar por separado las horas del correo cuya zona horaria no esté verificada.