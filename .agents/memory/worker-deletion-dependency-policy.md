---
name: Borrado seguro de trabajadores con vínculos
description: Los registros asociados indirectamente también deben clasificarse antes de borrar una ficha.
---

La eliminación de un trabajador sin vínculos puede estar disponible para quien tenga el permiso ordinario. Si existen vínculos con otros procesos, solo superadmin puede iniciar una eliminación profunda y debe confirmar que la ficha y las evidencias se crearon por error. La vista previa debe incluir también los registros que caerían por cascadas indirectas; cualquier dependencia o archivo externo no clasificado bloquea la operación. Los registros de auditoría se preservan.

**Why:** Una consulta de claves foráneas directas no revela los descendientes: eliminar inspecciones de maquinaria también elimina respuestas; otros procesos pueden añadir descendientes de otra empresa o archivos que la base de datos no borra. El antiguo borrado masivo permitía pérdidas parciales y el proyecto exige conservar evidencias oficiales por 20 años cuando no son erróneas.

**How to apply:** Al agregar una relación con trabajadores o hijos de esas relaciones, revisar la vista previa, la verificación de empresa, la retención, el tratamiento de archivos y la atomicidad. No reactivar una eliminación masiva sin un flujo seguro separado.