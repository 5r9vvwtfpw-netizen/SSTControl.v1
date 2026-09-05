---
name: Application version source
description: Regla para mantener sincronizada la versión visible de la aplicación y sus metadatos públicos.
---

La versión de ejecución, su etiqueta, fecha de publicación y notas de lanzamiento deben definirse una sola vez y consumirse desde los componentes visibles y la transformación del HTML.

**Why:** El footer normal, el footer móvil, la navegación y los metadatos llegaron a contener copias independientes; actualizar unas dejaba otras mostrando la versión anterior.

**How to apply:** Para una nueva publicación, modificar la fuente central de versión. No volver a escribir números de versión directamente en componentes. El changelog y el manual siguen siendo registros documentales y deben regenerarse como parte del proceso de publicación.