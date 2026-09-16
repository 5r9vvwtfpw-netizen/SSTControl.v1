# Plan de implementación — Auditorías Internas SST

## Objetivo

Convertir el módulo de Auditorías Internas SST en un ciclo completo de auditoría del SG-SST:

```text
Plan anual → Programación → Preparación → Ejecución → Hallazgos
→ Acciones correctivas → Informe → Aprobación y cierre → Seguimiento
```

El módulo debe servir para verificar con evidencia objetiva el cumplimiento y la eficacia del SG-SST, no solamente para registrar una fecha y un auditor.

## Base normativa

- Decreto 1072 de 2015, artículos 2.2.4.6.29 y 2.2.4.6.30:
  auditoría anual, participación del COPASST/Vigía en la planificación,
  independencia del auditor interno y alcance mínimo de la auditoría.
- Decreto 1072 de 2015, artículo 2.2.4.6.31:
  revisión del SG-SST por la alta dirección.
- Resolución 0312 de 2019:
  bloque de verificación, especialmente 6.1.2 (auditoría al SG-SST),
  6.1.3 (revisión por la alta dirección) y 6.1.4 (planificación con
  participación del COPASST).
- ISO 45001:2018, cuando la empresa la adopta:
  cláusulas 9.2 (auditoría interna), 10.2 (no conformidades y acciones
  correctivas) y 9.3 (revisión por la dirección).

## Diagnóstico inicial

La implementación existente permite crear y listar auditorías, pero la interfaz no permite todavía ejecutar el proceso completo. El modelo de datos y varias rutas backend ya contemplan auditores, checklists, hallazgos y planes de acción, pero no están integrados en una pantalla de detalle.

Problemas base identificados:

1. La referencia `Resolución 0312 — 3.1.1` usada por el formulario no corresponde a auditorías; debe ser 6.1.2.
2. La interfaz usa estados que no coinciden completamente con el enum de base de datos.
3. Las tarjetas no abren un detalle de auditoría.
4. El cambio de estado depende de un `PATCH` genérico, sin reglas de transición.
5. No existe todavía una interfaz para checklist, evidencias, hallazgos, acciones ni cierre.
6. El rol `auditor_interno` debe recibir permisos específicos y validación por asignación.

## Fases

### Fase 0 — Base y consistencia

- Corregir referencias normativas.
- Unificar estados:
  `programada`, `en_ejecucion`, `completada`, `cerrada`.
- Verificar tablas, enums y migraciones en desarrollo y producción.
- Definir reglas de transición y permisos.

### Fase 1 — Detalle y ciclo de estados

- Crear `/auditorias-internas/:id`.
- Hacer navegables las tarjetas.
- Mostrar resumen, responsables, alcance, fechas, estado y contadores.
- Implementar iniciar, completar y cerrar con endpoints específicos.
- Registrar fechas de inicio, fin, informe y aprobación.

### Fase 2 — Equipo auditor y plan

- Asignar auditor líder, auditores, observadores y auditores externos.
- Guardar usuarios por ID, no solamente nombres.
- Registrar competencia, independencia y conflicto de interés.
- Definir áreas/procesos y cronograma.
- Relacionar formalmente la participación del COPASST.

### Fase 3 — Checklist

- Crear plantillas legales, ISO e internas.
- Generar una copia del checklist al iniciar cada auditoría.
- Registrar cumple, no cumple, no aplica, observación o pendiente.
- Relacionar cada criterio con norma, cláusula, área y evidencia.

### Fase 4 — Evidencias

- Crear entidad de evidencias propia de auditorías.
- Integrarla con almacenamiento privado S3.
- Permitir carga, consulta, descarga y eliminación controlada.
- Relacionar evidencias con checklist, hallazgos y acciones.

### Fase 5 — Hallazgos y acciones

- Registrar conformidades, observaciones y no conformidades.
- Exigir requisito, evidencia y área para una no conformidad.
- Crear acciones correctivas, preventivas o de mejora.
- Hacer seguimiento de responsables, fechas, avance y eficacia.

### Fase 6 — Informe y cierre

- Generar informe individual de cada auditoría.
- Incluir metodología, checklist, evidencias, hallazgos y acciones.
- Permitir aprobación y cierre con trazabilidad.
- Bloquear cambios directos en auditorías cerradas.

### Fase 7 — Integración PHVA y validación

- Vincular resultados con IPERC, capacitaciones, inspecciones,
  accidentes, matriz legal, indicadores y revisión por dirección.
- Ejecutar pruebas de aislamiento por empresa, permisos, flujo completo y PDF.
- Validar el proceso en DEMO-PRUEBA sin eliminar la evidencia funcional.

## Reglas de cierre propuestas

- No se puede iniciar una auditoría sin objetivo, alcance, auditor líder y criterios.
- No se puede completar si existen ítems del checklist pendientes.
- Toda no conformidad debe tener evidencia, requisito, responsable y fecha.
- No se puede cerrar sin informe y aprobación.
- Las acciones correctivas pueden continuar abiertas después del cierre de la auditoría,
  pero deben quedar en seguimiento y con fecha de verificación.

## Entregas implementadas

### Entrega 1 — Base y ciclo de estados

- Corrección de la referencia normativa y etiquetas de estado.
- Navegación desde la tarjeta hacia el detalle.
- Pantalla de detalle con resumen y ciclo de estados.
- Endpoints de transición con validaciones básicas.

### Entrega 2 — Checklist y evidencias

- Plantilla normativa base con criterios de Decreto 1072, Resolución 0312 e ISO 45001.
- Creación de checklist personalizado.
- Evaluación de cada criterio como pendiente, cumple o no cumple.
- Registro de evidencia obtenida y observaciones del auditor.
- Carga privada de archivos PDF, imágenes, Word y Excel de hasta 10 MB.
- Restricción de carga y edición cuando la auditoría está cerrada.
- El porcentaje de cumplimiento se calcula al completar la auditoría.

### Entrega 3 — Hallazgos y planes de acción

- Registro de hallazgos desde la auditoría o directamente desde un criterio “No cumple”.
- Clasificación por tipo y severidad.
- Requisito, área afectada, evidencia objetiva y causa raíz inicial.
- Registro de planes correctivos, preventivos o de mejora.
- Responsable y fecha de compromiso obligatorios para cada plan.
- Seguimiento inicial del estado del hallazgo y bloqueo de cambios al cerrar la auditoría.

Las siguientes fases se implementarán sobre esta base, sin crear pantallas aisladas ni duplicar el modelo existente.