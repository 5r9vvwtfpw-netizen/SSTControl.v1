---
name: Development module access
description: El entorno de desarrollo debe permitir revisar módulos premium sin alterar las restricciones comerciales de producción.
---

En desarrollo, las restricciones de capítulo, feature de suscripción y visibilidad del menú se omiten para permitir pruebas integrales. En producción, las tres validaciones siguen activas.

**Why:** Empresas de prueba pequeñas pueden quedar en Capítulo 1 y no deben bloquear la revisión de módulos avanzados como Adquisiciones SST.

**How to apply:** Usar únicamente la bandera de desarrollo del frontend; no cambiar planes, capítulos ni permisos persistidos para conseguir acceso de prueba.