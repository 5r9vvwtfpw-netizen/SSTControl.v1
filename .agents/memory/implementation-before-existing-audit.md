---
name: Auditoría antes de implementar
description: Revisa controles y flujos existentes antes de añadir o duplicar funcionalidades.
---

Antes de implementar una solución, inspeccionar los flujos actuales de interfaz, autenticación, rutas, trazabilidad y documentos fuente para separar lo que ya existe de las brechas reales; corregir las brechas sin duplicar controles. No crear informes, estados, respuestas, datos ni evidencias que el usuario no haya autorizado, ni alterar documentos fuente sin instrucción explícita.

**Why:** el usuario pidió auditar lo existente antes de implementar y prohibió expresamente inventar entregables o datos no autorizados.

**How to apply:** en este proyecto, informar brevemente qué controles, trazabilidad y documentos fuente existentes se encontraron y qué falta antes de modificar código, sobre todo en cambios de acceso, seguridad y cumplimiento. Reutilizar la fuente existente cuando corresponda; no derivar estados ni contenido que no esté en esa fuente.
