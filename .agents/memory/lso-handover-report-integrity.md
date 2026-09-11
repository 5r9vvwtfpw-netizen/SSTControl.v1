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