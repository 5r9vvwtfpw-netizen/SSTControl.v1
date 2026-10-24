---
name: Auditoría antes de implementar
description: Revisa controles y flujos existentes antes de añadir o duplicar funcionalidades.
---

Antes de implementar una solución, inspeccionar los flujos actuales de interfaz, autenticación, rutas, trazabilidad y documentos fuente para separar lo que ya existe de las brechas reales; corregir las brechas sin duplicar controles. Presentar los hallazgos y esperar autorización expresa antes de cambiar código. No crear informes, estados, respuestas, datos ni evidencias que el usuario no haya autorizado, ni alterar documentos fuente sin instrucción explícita.

Al añadir un informe SISI/PESV, comparar la interfaz con todos los informes existentes de la misma familia (no solo el informe inmediatamente anterior) y conservar el patrón común que corresponda: encabezado y retorno, empresa, estado de evidencia, faltantes, resumen del registro y enlaces permanentes a cada módulo fuente, además de la acción de consulta o descarga. No sustituir el resumen y la tabla usados por la familia por tarjetas independientes que solo enumeren fuentes.

**Why:** el usuario pidió auditar lo existente antes de implementar y prohibió expresamente inventar entregables o datos no autorizados.

**How to apply:** en este proyecto, informar qué controles, trazabilidad y documentos fuente existentes se encontraron y qué falta; esperar aprobación antes de modificar código, sobre todo en cambios de acceso, seguridad y cumplimiento. Reutilizar la fuente existente cuando corresponda; no derivar estados ni contenido que no esté en esa fuente.

**How to apply:** antes de editar, abrir al menos un informe previo comparable y contrastar estructura, estados, tratamiento de ausencia/error y navegación al módulo. Verificar esa misma consistencia al revisar el resultado.

**How to apply:** para informes anuales, revisar toda la serie ya implementada; los informes con varias fuentes deben conservar un resumen compacto y una tabla de componentes, con los enlaces de los módulos y PDF agrupados según el patrón de la familia.
