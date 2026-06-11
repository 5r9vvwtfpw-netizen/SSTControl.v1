# Cómo Actualizar el Manual de Usuario

Cada vez que implementes una nueva funcionalidad, corrección o mejora, sigue este flujo de 3 pasos:

---

## Flujo de Actualización

### Paso 1 — Agrega la entrada al changelog

Edita el archivo **`docs/changelog.json`** y agrega tu cambio al array `changes` de la versión actual (o crea una nueva versión si es un release nuevo):

```jsonc
{
  "version": "4.1.0",           // ← versión del release
  "date": "2026-07-15",         // ← fecha YYYY-MM-DD
  "changes": [
    {
      "type": "nueva-funcionalidad",  // ver tipos abajo
      "modulo": "Nombre del módulo",   // ej: "PESV H07 — Velocidad"
      "titulo": "Título breve del cambio",
      "descripcion": "Descripción clara de qué hace esta funcionalidad y cómo la usa el administrador.",
      "ruta": "/ruta-del-modulo",     // null si no tiene ruta propia
      "fase": "PESV"                  // ver fases abajo
    }
  ]
}
```

**Tipos disponibles:**
| Valor | Cuándo usarlo |
|-------|--------------|
| `nueva-funcionalidad` | Un módulo o feature que no existía antes |
| `mejora` | Una funcionalidad existente que se mejoró o amplió |
| `correccion` | Un bug fix que afecta al usuario final |
| `deprecado` | Algo que se quitó o reemplazó |

**Fases disponibles:**
`Planear` · `Hacer` · `Verificar` · `Actuar` · `PESV` · `Portal Empleados` · `Portal LSO` · `Soporte` · `Facturación` · `Documentación` · `Global`

---

### Paso 2 — Ejecuta el script generador

```bash
npx tsx scripts/generate-manual.ts
```

El script:
- Lee `docs/changelog.json`
- Genera la sección **"Historial de Versiones"** en el manual
- Actualiza la versión y fecha del encabezado automáticamente
- Muestra un resumen de cuántos cambios se documentaron

---

### Paso 3 — Actualiza el contenido del módulo en el manual (si aplica)

Si el cambio agrega un **módulo completamente nuevo** o cambia cómo se usa uno existente, edita también la sección correspondiente en **`docs/manual/PLANTILLA-MANUAL.md`** directamente.

El changelog solo registra *qué cambió y cuándo*. La documentación detallada de cómo usar el módulo vive en el cuerpo del manual.

---

## Estructura del Sistema

```
docs/
├── changelog.json              ← FUENTE DE VERDAD de todos los cambios
├── manual/
│   ├── PLANTILLA-MANUAL.md     ← Manual completo (editable + auto-generado)
│   └── COMO-ACTUALIZAR.md      ← Este archivo
scripts/
└── generate-manual.ts          ← Script que inyecta el changelog en el manual
```

El manual tiene dos partes:
1. **Cuerpo manual** (líneas 1 hasta los marcadores) → se edita manualmente cuando cambia cómo se usa un módulo
2. **Historial de Versiones** (entre `<!-- INICIO-CHANGELOG -->` y `<!-- FIN-CHANGELOG -->`) → se genera automáticamente, no editar a mano

---

## Checklist Rápido al Implementar una Funcionalidad

Al terminar cada implementación, verifica:

- [ ] Agregar entrada en `docs/changelog.json`
- [ ] Si es módulo nuevo: actualizar la sección correspondiente en `PLANTILLA-MANUAL.md`
- [ ] Si cambia el flujo de un módulo existente: actualizar su descripción en `PLANTILLA-MANUAL.md`
- [ ] Si el chatbot necesita saber del cambio: actualizar `APP_KNOWLEDGE_BASE` en `server/chatbot.ts`
- [ ] Ejecutar `npx tsx scripts/generate-manual.ts`

---

## Ejemplo Completo

Implementamos un nuevo módulo "Profesiogramas" en la fase Hacer:

**1. Entrada en `docs/changelog.json`:**
```json
{
  "type": "nueva-funcionalidad",
  "modulo": "Profesiogramas",
  "titulo": "Módulo de gestión de profesiogramas por cargo",
  "descripcion": "Permite registrar los exámenes médicos requeridos por cargo según la Resolución 2346/2007. Vinculado con Perfiles de Cargo y Exámenes Médicos. Genera el documento PDF del profesiograma.",
  "ruta": "/profesiogramas",
  "fase": "Hacer"
}
```

**2. Agregar sección en el manual** (sección 5 — Módulo HACER):
```markdown
### 5.X Profesiogramas
**Ruta:** Hacer → Profesiogramas (`/profesiogramas`)
...
```

**3. Actualizar chatbot** (`server/chatbot.ts`) con instrucciones de uso del módulo.

**4. Ejecutar:**
```bash
npx tsx scripts/generate-manual.ts
```

Listo.
