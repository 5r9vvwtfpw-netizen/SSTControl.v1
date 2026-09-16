---
name: Identidad de usuario Técnico Mecánico
description: Regla para vincular cuentas de Técnico Mecánico con trabajadores y reutilizar su identificación.
---

La cuenta de Técnico Mecánico debe vincularse a un trabajador y tomar automáticamente su número de identificación; no debe pedir una segunda digitación manual.

**Why:** La identificación ya pertenece al registro del trabajador y duplicarla en el formulario genera confusión y riesgo de inconsistencias.

**How to apply:** Mantener el dato en la cuenta para las validaciones y accesos PESV, pero derivarlo del trabajador al crear o editar. Rechazar únicamente cuentas nuevas sin trabajador vinculado o sin identificación registrada.