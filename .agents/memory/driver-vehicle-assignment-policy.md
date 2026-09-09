---
name: Driver–vehicle assignment policy
description: Regla funcional para asignaciones PESV entre conductores y vehículos, historial y compatibilidad transitoria.
---

La relación conductor–vehículo es muchos-a-muchos: un conductor puede operar varios vehículos y un vehículo puede tener varios conductores. Cada asignación tiene vigencia; se finaliza en vez de eliminarse para conservar el historial.

**Why:** La operación real no tiene una relación exclusiva uno-a-uno y SST/PESV requiere trazabilidad histórica. El triángulo naranja sigue reservado exclusivamente para comparendos.

**How to apply:** En flujos operativos, usar únicamente asignaciones vigentes. El fallback que muestra la flota activa completa solo protege la transición de conductores de vehículos de carretera que nunca han tenido una asignación; maquinaria amarilla y equipos especiales nunca usan fallback. Una vez existe historial, no volver a abrir acceso a toda la flota.