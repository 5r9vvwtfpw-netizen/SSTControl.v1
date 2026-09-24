# Seguimiento: discrepancia de estado PSE con ePayco

**Última actualización:** 24 de septiembre de 2026  
**Entorno:** desarrollo / pruebas de ePayco  
**Estado:** pendiente de explicación de soporte ePayco

## Resumen

En el mismo intento de DEMO-PRUEBA, PSE envió un correo que indica **Aprobada**, mientras que ePayco notificó **Rechazada**. La confirmación de rechazo de ePayco fue procesada por el servidor y la consulta posterior autenticada a ePayco también devolvió rechazo.

La aplicación muestra el resultado final registrado por ePayco. No se cambió el pago ni la suscripción manualmente. Hace falta que ePayco aclare la discrepancia entre el resultado de PSE y el suyo antes de volver a probar.

## Identificadores del intento

- Factura interna: `sst-pse-sub-demo-trial-001-1790229024526`
- Referencia ePayco: `387022003`
- CUS que aparece en el correo de PSE: `5814299`
- Ticket PSE guardado al iniciar: `387022003179022902`
- Importe: `3.432.000 COP`
- Banco: BANKA
- Moneda: COP
- Entorno de proveedor: pruebas (`enpruebas = 1`)

## Cronología confirmada

Las horas de base de datos están en UTC y se convierten aquí a **hora de Colombia (UTC−5)**:

| Hora Colombia | Hecho |
| --- | --- |
| 24 sep, 00:50:24 | Se creó el intento en desarrollo. |
| 24 sep, 00:54:22 | La aplicación registró estado `DECLINED` tras una confirmación de ePayco; `paid_at` sigue vacío. |
| 24 sep, después | La consulta autenticada de ePayco siguió devolviendo `Rechazada`. |

El correo de PSE muestra **Aprobada** para el CUS `5814299`. La captura del buzón muestra 7:55 a. m., pero no se verificó la zona horaria configurada para ese buzón; **no convertir esa hora ni usarla para ordenar los eventos**. La captura del correo de ePayco no incluye una hora de recepción legible. La pantalla de retorno capturada después muestra el rechazo que ya estaba registrado.

## Respuesta consultada a ePayco

La consulta autenticada de la transacción PSE devolvió:

- `estado`: `Rechazada`
- `respuesta`: `Transacción rechazada por el centro de autorizaciones.`
- `cod_respuesta`: `2`
- `cod_error`: `00`
- `cc_network_response.code`: `0000`
- `cc_network_response.message`: `Franquicia no registrada`

El correo de ePayco también indica **Transacción rechazada** para la referencia `387022003`. El correo PSE indica **Transacción aprobada** para el CUS `5814299`. Ambos identificadores se asociaron a esta misma factura en la respuesta del proveedor.

## Estado local comprobado

- La fila del pago está en `DECLINED`, con `response = Rechazada` y motivo `00-Transacción rechazada por el centro de autorizaciones.`
- `paid_at` es nulo.
- La suscripción aparece `active`, pero `last_payment_date` es nulo y ya estaba activa antes de este intento. **No atribuir ese estado a este pago.**
- No se ha confirmado un cobro real; este intento se hizo en el sandbox de ePayco.

## Qué hace la implementación actualmente

- El retorno consulta primero el estado local del pago.
- Si aún está `PENDING`, el servidor consulta el estado PSE de ePayco mediante su endpoint `transactioninfomation.json` y verifica que coincidan factura, referencia, transacción, importe, moneda y modo de pruebas.
- El resultado directo del proveedor se presenta en pantalla como provisional. No activa ni renueva la suscripción.
- Solo una confirmación de ePayco con firma válida, referencia, importe y moneda coincidentes puede procesar el resultado final. Una aprobación firmada activa la suscripción; un rechazo firmado se guarda como rechazado.
- El navegador continúa consultando mientras el estado local sea pendiente, de modo que puede reflejar un webhook que llegue después del retorno.

## Limpieza y límites de la prueba

- La sustitución temporal de IP de salida para la prueba única se retiró del código.
- Se eliminaron las variables temporales `EPAYCO_TEST_EGRESS_IP` y `EPAYCO_TEST_EGRESS_UNTIL` de la configuración de desarrollo.
- No se publicaron cambios ni se modificó producción.
- No se debe volver a intentar el pago, aprobarlo manualmente ni cambiar la suscripción hasta tener una explicación y autorización para una nueva prueba.

## Preguntas pendientes para soporte

1. ¿Por qué PSE envió un correo de aprobación mientras ePayco confirmó y sigue consultando el intento como rechazado?
2. ¿Qué significa `Franquicia no registrada` para BANKA en este sandbox?
3. ¿El CUS `5814299` representa únicamente la decisión del simulador PSE o confirma un resultado que ePayco debería haber conciliado como aprobado?
4. ¿Falta habilitar o registrar BANKA/PSE en la cuenta de pruebas? ¿Qué parámetros o pasos se requieren para una prueba aprobada?
5. ¿Cuál es el estado final que ePayco considera autoritativo y puede ePayco reenviar la confirmación final correcta si hubo una desincronización?

## Al recibir la respuesta de soporte

1. Comparar su explicación con la referencia `387022003`, el CUS `5814299` y la factura interna arriba indicada.
2. Si ePayco confirma rechazo, conservar el pago como rechazado; no activar la suscripción.
3. Si ePayco confirma que el resultado final fue aprobación, solicitar la confirmación firmada correcta y verificar que el webhook la procese antes de actualizar el estado. No cambiar la base manualmente.
4. Si señalan una configuración o campo incorrecto, corregirlo en desarrollo, volver a ejecutar `npm run check` y acordar una nueva prueba antes de iniciarla.
