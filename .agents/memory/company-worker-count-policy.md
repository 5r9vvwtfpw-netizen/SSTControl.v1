---
name: Conteo de trabajadores en Empresas
description: Distinción entre personal vigente, declaración inicial y capacidad comercial.
---

El número vigente mostrado al editar una empresa no es una cifra que el cliente deba poder corregir manualmente: se obtiene de las altas, retiros y cambios de estado en Trabajadores. Los retirados conservan su historial sin sumar al conteo vigente. La cantidad declarada al crear la empresa y el cupo comercial contratado tienen propósitos diferentes y no deben presentarse como si fueran ese conteo real.

**Why:** El usuario señaló que un cliente podría actualizar otros datos de la empresa y, por confusión, escribir menos trabajadores de los registrados. Aunque el servidor rechace discrepancias, permitir la edición da una impresión equivocada y dispara mensajes de precio que no corresponden a esa operación.

**How to apply:** Mantener el conteo de la ficha empresarial en solo lectura al editar. Los cambios de personal ocurren en Trabajadores; las revisiones del cupo o precio tienen su propio flujo. En el alta inicial puede solicitarse una cantidad declarada para la prueba o la cotización, pero no debe confundirse con la nómina registrada después.

Cuando la sincronización de Trabajadores actualice el número vigente, también debe recalcular `calculatedChapter` usando el nivel de riesgo guardado; no escribir solo `numberOfWorkers` directamente.

**Why:** Un conteo sincronizado superior a 50 puede convivir con un capítulo antiguo y dejar a la empresa viendo solo 7 estándares aunque ya tenga más de 50 trabajadores activos.

**How to apply:** En cada alta, retiro o cambio de estado que sincronice trabajadores, usar la ruta de actualización de empresa que recalcula el capítulo, y verificar que la combinación vigente de conteo y riesgo determina el capítulo guardado.

Si cambia el capítulo de una empresa, las evaluaciones SST que sigan en progreso conservan su `tipoEmpresa` anterior; deben migrarse al tipo nuevo y recalcular la escala de respuestas existentes, preservando sus respuestas.

**Why:** La evaluación guarda su tipo de empresa como instantánea. Corregir solo el capítulo de la empresa no amplía una evaluación que se creó con el tipo anterior.

**How to apply:** Al corregir un capítulo, localizar evaluaciones SST en progreso, migrar solo las que tengan un tipo obsoleto, recalcular puntuaciones con la escala vigente y verificar que las respuestas existentes no se borren.