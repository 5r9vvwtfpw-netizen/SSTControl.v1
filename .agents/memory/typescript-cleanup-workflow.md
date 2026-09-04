---
name: TypeScript cleanup workflow
description: Cómo continuar una limpieza estricta de TypeScript cuando hay muchos contratos heredados y agentes delegados.
---

Las correcciones de tipos deben agruparse por dominio y validarse con un chequeo global después de cada grupo; los agentes delegados pueden aplicar mejoras parciales, pero su informe no sustituye `npm run check`.

**Why:** En este proyecto conviven esquemas actuales con nombres históricos y contratos de DTO antiguos; una edición que elimina errores en un archivo puede descubrir incompatibilidades en otro.

**How to apply:** Mantener `strict: true`, preferir conversiones explícitas y nombres reales del esquema, y no declarar terminada la limpieza hasta que el chequeo global, build y preview estén limpios.

Los errores de exceso de propiedades en DTO públicos se corrigen ampliando el tipo para reflejar el contrato real, no eliminando campos de la respuesta.

**Why:** Una limpieza de tipos eliminó campos de contenido de capacitaciones que la interfaz consumía; compiló correctamente, pero produjo una regresión funcional silenciosa.

**How to apply:** Antes de borrar una propiedad para satisfacer TypeScript, buscar consumidores y comparar el contrato con la última versión funcional; probar al menos una respuesta representativa del endpoint afectado.

Cuando `pool` es una unión entre los clientes Neon y `pg`, sus overloads de `query` pueden volverse incompatibles aunque ambos acepten SQL; encapsular la llamada en un adaptador estructural explícito evita relajar todo el archivo a `any`.

**Why:** TypeScript no puede resolver de forma segura las sobrecargas divergentes de ambos drivers en una unión, y los casts genéricos directos fallan o dejan las filas como `unknown`.

**How to apply:** Mantener el narrowing localizado en scripts/migraciones y tipar la forma mínima de `query` y `rows`, sin modificar el tipo global del pool.