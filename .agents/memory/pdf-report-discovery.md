---
name: PDF report discovery before implementation
description: Cómo evitar duplicar generadores PDF existentes u ofrecer falsos positivos al auditar informes.
---

Antes de implementar un informe, verificar por separado: generador backend activo, endpoint registrado, botón frontend y cobertura real del contenido. Buscar también rutas indirectas y la biblioteca central de informes.

**Why:** En este proyecto varios generadores completos existían sin botón visible, mientras otras páginas solo contenían CRUD, adjuntos PDF o menciones comerciales. Clasificar por texto produjo falsos positivos y falsos negativos.

**How to apply:** Exigir evidencia de endpoint que genere `application/pdf` y de la llamada UI. Clasificar como existente sin UI, parcial o inexistente antes de editar; comprobar rutas activas, no archivos `.bak`.