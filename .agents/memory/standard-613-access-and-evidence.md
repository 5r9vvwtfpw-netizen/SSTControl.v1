---
name: Estándar 6.1.3 — acceso y evidencia
description: El estándar 6.1.3 y el módulo de revisión por dirección tienen una brecha entre alta dirección, permisos y evidencia estructurada.
---

La revisión por la dirección solo es accesible dentro del sistema a usuarios con `sst_management:view`; no existe un rol independiente de alta dirección o representante legal. La empresa guarda los datos del representante legal, pero eso no crea automáticamente una cuenta ni vincula a esa persona como aprobador de la revisión. Además, el componente de verificación mezcla el alcance de auditoría del artículo 2.2.4.6.30 con la revisión por dirección del artículo 2.2.4.6.31, mientras que el esquema contiene participantes, temas y aprobación que la interfaz no expone.

**Why:** Para que la evidencia sea defendible, debe probarse tanto la revisión gerencial (entradas, participantes, decisiones, aprobación y seguimiento) como el acceso real de la alta dirección; enlazar a un módulo protegido no prueba que el directivo pueda revisarlo.

**How to apply:** Al corregir 6.1.3, separar auditoría interna y revisión por dirección, definir el mecanismo de acceso o entrega a la alta dirección y habilitar/usar la evidencia estructurada antes de marcar el estándar como cumplido.