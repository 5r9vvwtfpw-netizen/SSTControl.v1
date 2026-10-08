---
name: Mechanic tenant context
description: Reglas no obvias para persistencia y caché del contexto multiempresa de técnicos mecánicos.
---

El contexto de empresa externa de un técnico debe separar o eliminar toda caché operativa al cambiar de empresa y al cerrar sesión. La selección persistida no se puede validar mientras la consulta de autorizaciones siga cargando. Para abrir rutas operativas, manda el alcance vigente de la autorización activa de la empresa seleccionada; no el capítulo ni los datos parciales del objeto de empresa.

**Why:** validar el valor guardado contra una lista todavía vacía lo reemplaza por la empleadora durante una recarga; reutilizar claves de caché entre empresas puede mostrar datos del tenant anterior. Los datos parciales de una autorización externa no incluyen clasificación ni vehículos y pueden hacer que una ruta asignada parezca fuera del capítulo permitido.

**How to apply:** cualquier módulo nuevo autorizado para técnicos debe incluir la empresa efectiva en sus claves de caché, limpiar datos al cambiar de contexto, esperar el resultado definitivo de autorizaciones antes de aceptar o descartar la selección guardada y permitir solo las rutas cubiertas por los scopes activos de esa empresa.