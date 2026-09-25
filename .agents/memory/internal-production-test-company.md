---
name: Empresa interna de pruebas en producción
description: Excepción comercial limitada para pruebas funcionales en DEMO-PRUEBA publicada.
---

DEMO-PRUEBA es la empresa interna de pruebas funcionales en producción. Debe poder registrar trabajadores sin contratar una suscripción y sin imputar sobrecupos como consumo facturable. No equivale a las salas demo temporales ni a una exención para todos los clientes.

**Why:** El usuario necesita comprobar flujos reales en producción con sus datos de prueba; exigir pago a la propia empresa interna impide ese trabajo.

**How to apply:** Basar la excepción en la identidad estable de la empresa autenticada, nunca en el nombre recibido del navegador ni en un ID enviado en el cuerpo. Conservar la validación de permisos, ámbito de empresa y datos para todos los demás. No borrar registros funcionales de esta empresa.