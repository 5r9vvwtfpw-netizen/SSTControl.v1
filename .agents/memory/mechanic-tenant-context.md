---
name: Mechanic tenant context
description: Reglas no obvias para persistencia y caché del contexto multiempresa de técnicos mecánicos.
---

El contexto de empresa externa de un técnico debe separar o eliminar toda caché operativa al cambiar de empresa y al cerrar sesión. La selección persistida no se puede validar mientras la consulta de autorizaciones siga cargando.

**Why:** validar el valor guardado contra una lista todavía vacía lo reemplaza por la empleadora durante una recarga; reutilizar claves de caché entre empresas puede mostrar datos del tenant anterior.

**How to apply:** cualquier módulo nuevo autorizado para técnicos debe incluir la empresa efectiva en sus claves de caché, limpiar datos al cambiar de contexto y esperar el resultado definitivo de autorizaciones antes de aceptar o descartar la selección guardada.