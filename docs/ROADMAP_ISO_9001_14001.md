# Roadmap: Implementación ISO 9001:2015 e ISO 14001:2015

**Estado:** Pendiente — documentado para implementación futura  
**Fecha de registro:** Junio 2026  
**Prioridad:** Media (después de consolidar el módulo PESV y SG-SST actual)

---

## ISO 9001:2015 — Sistema de Gestión de Calidad (SGC)

### ¿Por qué agregarlo?
Permite a las empresas clientes certificarse en calidad junto con SST, ampliando el valor de la plataforma y el ticket promedio. Muchas empresas requieren ISO 9001 para licitar con el Estado o con grandes empresas.

### Módulos a construir

| Módulo | Descripción | Complejidad |
|---|---|---|
| Política y objetivos de calidad | CRUD de política, objetivos medibles y seguimiento | Baja |
| Mapa de procesos | Editor visual de procesos de la empresa (inputs, outputs, responsables) | Alta |
| Control de documentos | Versiones, aprobaciones, vigencia de documentos de calidad | Media |
| No conformidades (NC) | Registro, análisis de causa raíz, acciones correctivas y cierre | Media |
| Auditorías internas SGC | Programación, ejecución y hallazgos de auditorías de calidad | Media |
| Satisfacción del cliente | Encuestas, indicadores de satisfacción, tendencias | Media |
| Revisión por la dirección | Acta periódica de revisión del SGC con indicadores consolidados | Baja |

### Integración con el sistema actual
- Reutilizar el sistema de **objetivos SST** como base para objetivos de calidad.
- Reutilizar la **Matriz Legal** para requisitos legales de calidad.
- El módulo de **auditorías** puede ser compartido entre SST y SGC.
- El ciclo **PHVA** ya implementado aplica directamente.

### Estimación de desarrollo
- **Duración estimada:** 6-8 semanas
- **Archivos principales a crear:**
  - `server/routes/calidad.ts`
  - `client/src/pages/CalidadDashboard.tsx`
  - `client/src/pages/NoConformidades.tsx`
  - `client/src/pages/AuditoriasCalidad.tsx`
  - Tablas nuevas en `shared/schema.ts`: `quality_policies`, `processes`, `nonconformities`, `quality_audits`

---

## ISO 14001:2015 — Sistema de Gestión Ambiental (SGA)

### ¿Por qué agregarlo?
Es la norma ambiental más adoptada mundialmente. Empresas con operaciones industriales, de manufactura o con flotas (que ya usan PESV) frecuentemente necesitan también gestión ambiental. Aumenta el valor percibido de la plataforma.

### Módulos a construir

| Módulo | Descripción | Complejidad |
|---|---|---|
| Aspectos e impactos ambientales | Matriz de identificación (similar a Matriz de Riesgos GTC-45 pero ambiental) | Alta |
| Requisitos legales ambientales | Similar a la Matriz Legal SST pero con normas ambientales colombianas | Media |
| Objetivos y metas ambientales | Indicadores: consumo de agua, energía, residuos, emisiones | Media |
| Plan de emergencias ambientales | Derrames, contaminación, protocolos de respuesta | Media |
| Indicadores ambientales | Dashboard con tendencias de consumo y generación de residuos | Media |
| Auditorías de cumplimiento ambiental | Programación y seguimiento de auditorías SGA | Media |
| Proveedores ambientales | Gestión de proveedores de disposición de residuos, etc. | Baja |

### Normativa colombiana relevante a incluir
- Decreto 1076 de 2015 (Decreto Único Ambiental)
- Ley 99 de 1993 (Sistema Nacional Ambiental - SINA)
- Resolución 631 de 2015 (Vertimientos)
- Decreto 1713 de 2002 (Residuos sólidos)
- NTC-ISO 14001:2015

### Integración con el sistema actual
- La **Matriz de Aspectos Ambientales** puede reutilizar la arquitectura de la Matriz de Riesgos GTC-45.
- La **Matriz Legal Ambiental** puede ser una categoría adicional de la Matriz Legal SST existente.
- El módulo **PESV** ya gestiona vehículos — los indicadores de emisiones de la flota pueden conectarse.

### Estimación de desarrollo
- **Duración estimada:** 8-10 semanas
- **Archivos principales a crear:**
  - `server/routes/ambiental.ts`
  - `client/src/pages/AmbientalDashboard.tsx`
  - `client/src/pages/AspectosImpactosAmbientales.tsx`
  - `client/src/pages/IndicadoresAmbientales.tsx`
  - Tablas nuevas en `shared/schema.ts`: `environmental_aspects`, `environmental_objectives`, `environmental_audits`

---

## Orden de implementación sugerido

1. **Primero ISO 9001** — más demandada por clientes colombianos, más cercana a lo que ya existe en el sistema (objetivos, auditorías, documentos).
2. **Luego ISO 14001** — requiere más infraestructura nueva, pero el mercado industrial lo exige.

## Impacto comercial esperado
- Permite ofrecer un **plan Premium** que incluya los tres sistemas integrados (SST + Calidad + Ambiental).
- Diferenciación frente a competidores que solo cubren SST.
- Acceso a segmentos industriales y manufactureros de mayor ticket.
