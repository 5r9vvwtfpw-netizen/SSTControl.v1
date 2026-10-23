---
name: Blank form validation
description: Regla para formularios vírgenes y validación de campos obligatorios antes de guardar
---

Los formularios de creación deben iniciar vacíos en los campos que representan decisiones o hechos del negocio. En propuestas para clientes, los datos de la empresa destinataria (razón social, NIT, persona destinataria y ciudad) no deben venir precargados con datos de un cliente anterior; la identidad fija del proveedor puede conservarse. No basta con confiar en el esquema inferido desde Drizzle: algunos campos de fecha y texto aceptan la cadena vacía, por lo que cada formulario debe declarar validaciones explícitas para sus campos obligatorios y no ejecutar la mutación hasta que estén completos.

**Why:** Al convertir defaults de negocio en valores vacíos, un formulario de períodos de comité llegó a enviar fechas `""` a la API porque el esquema derivado no las rechazaba; esto produjo un error SQL en lugar de una validación de interfaz.

**How to apply:** Mantener vacíos los defaults de creación, conservar solo contexto técnico (por ejemplo `companyId`), y añadir validadores `.min(1)` o comprobaciones equivalentes para cada selección, fecha y dato obligatorio antes de construir el payload. Al restablecer una propuesta de cliente, volver a los mismos campos vacíos sin borrar los datos fijos del proveedor ni los valores administrativos que no identifican al cliente.