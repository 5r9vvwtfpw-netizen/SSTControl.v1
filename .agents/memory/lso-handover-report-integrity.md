---
name: LSO handover report integrity
description: Reglas para informes oficiales que atribuyen gestión a un profesional LSO y consolidan datos SST/PESV.
---

Un informe de entrega LSO solo puede atribuir una actuación cuando coincide la asignación autenticada, la identidad completa del profesional y una fecha inmutable dentro de la vigencia. Una firma genérica sin usuario, asignación o fecha de firma debe presentarse únicamente como estado de la empresa.

**Why:** Los nombres pueden repetirse, los registros heredados pueden carecer de licencia y fechas generales como `updatedAt` no prueban cuándo ni quién firmó.

**How to apply:** Validar la asignación exacta en autorización y generación; exigir nombre y licencia coincidentes más una fecha de firma dentro de la vigencia, o identificadores estables cuando existan.

Los informes oficiales deben abortar si un módulo necesario no puede consultarse, en vez de convertir el error en cero o “sin registros”. Los módulos operativos de alto volumen deben agregarse en SQL.

**Why:** Un fallback vacío publica conclusiones falsas, y cargar telemetría o eventos completos para contar registros puede agotar memoria y bloquear el servidor.

**How to apply:** Propagar errores de consulta al endpoint y calcular conteos/condicionales en PostgreSQL; cargar detalles solo cuando el documento realmente presenta una muestra acotada.

El cierre de una asignación debe archivar el PDF, registrar sus metadatos y desactivar la asignación dentro de una operación serializada por empresa. Cada intento de almacenamiento usa una ruta única; la limpieza diferida nunca reutiliza ni elimina la ruta de otro intento.

**Why:** Separar archivo y desactivación permite cierres parciales; reutilizar rutas entre reintentos permite que la compensación de un fallo borre un PDF confirmado posteriormente.

**How to apply:** Bloquear empresa y asignación, conservar ciclos por `assignedAt`, compensar objetos fallidos con una cola duradera y comprobar referencias antes de limpiar. Los reemplazos solo terminan las asignaciones objetivo.

Los endpoints de lectura necesarios para montar el Portal LSO antes de seleccionar empresa deben quedar fuera del gate de contexto, pero las rutas operativas continúan exigiendo una asignación activa validada.

**Why:** Si `/api/auth/user` o los archivos históricos propios exigen una empresa previamente seleccionada, React no puede montar el portal desde el cual se realiza esa selección.

**How to apply:** Mantener una allowlist mínima de bootstrap para identidad, portal, ayuda contextual y archivos históricos propios; no ampliar la excepción a mutaciones ni datos operativos.

El informe para entrega al representante legal debe abrir con una síntesis en lenguaje común; cada fortaleza, alerta y recomendación se genera únicamente desde un dato consultado y conserva su módulo de origen.

**Why:** Un consolidado técnicamente correcto no cumple su propósito si el representante legal no entiende el estado general, las prioridades y las acciones siguientes, o si una recomendación parece inventada.

**How to apply:** Mantener reglas deterministas y probables por separado del generador PDF; mostrar una portada ejecutiva breve y repetir en el detalle todas las recomendaciones sin truncarlas.