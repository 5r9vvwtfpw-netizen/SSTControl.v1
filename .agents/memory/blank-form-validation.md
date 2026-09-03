---
name: Blank form validation
description: Regla para formularios vírgenes y validación de campos obligatorios antes de guardar
---

Los formularios de creación deben iniciar vacíos en los campos que representan decisiones o hechos del negocio. No basta con confiar en el esquema inferido desde Drizzle: algunos campos de fecha y texto aceptan la cadena vacía, por lo que cada formulario debe declarar validaciones explícitas para sus campos obligatorios y no ejecutar la mutación hasta que estén completos.

**Why:** Al convertir defaults de negocio en valores vacíos, un formulario de períodos de comité llegó a enviar fechas `""` a la API porque el esquema derivado no las rechazaba; esto produjo un error SQL en lugar de una validación de interfaz.

**How to apply:** Mantener vacíos los defaults de creación, conservar solo contexto técnico (por ejemplo `companyId`), y añadir validadores `.min(1)` o comprobaciones equivalentes para cada selección, fecha y dato obligatorio antes de construir el payload.