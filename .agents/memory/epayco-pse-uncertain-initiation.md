---
name: Inicio incierto de cobros PSE
description: Manejo seguro de errores al iniciar un cobro con ePayco y de enlaces públicos para terceros.
---

Cuando el inicio de un pago PSE devuelve un error de red, respuesta incompleta o HTTP 5xx, conservar el intento pendiente hasta reconciliarlo con ePayco. Solo una negativa comercial inequívoca permite marcarlo rechazado y abrir otro intento para la misma suscripción. Los enlaces enviados a terceros llevan el identificador secreto en el fragmento de URL, se presentan a la API en una cabecera y nunca se incluyen en la URL de retorno del proveedor.

**Why:** El proveedor puede haber creado la transacción antes de que falle la respuesta. Clasificarla como fallida y habilitar otro cobro puede producir dos pagos reales; un token en rutas o retornos puede quedar expuesto en registros.

**How to apply:** Serializar el inicio de pagos por empresa, bloquear nuevos inicios mientras existan operaciones pendientes no verificadas y consultar directamente al proveedor antes de activar. Mantener los identificadores secretos fuera de rutas, parámetros y registros.