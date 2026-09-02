---
name: TypeScript cleanup workflow
description: Cómo continuar una limpieza estricta de TypeScript cuando hay muchos contratos heredados y agentes delegados.
---

Las correcciones de tipos deben agruparse por dominio y validarse con un chequeo global después de cada grupo; los agentes delegados pueden aplicar mejoras parciales, pero su informe no sustituye `npm run check`.

**Why:** En este proyecto conviven esquemas actuales con nombres históricos y contratos de DTO antiguos; una edición que elimina errores en un archivo puede descubrir incompatibilidades en otro.

**How to apply:** Mantener `strict: true`, preferir conversiones explícitas y nombres reales del esquema, y no declarar terminada la limpieza hasta que el chequeo global, build y preview estén limpios.