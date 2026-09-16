---
name: Credenciales de roles vinculados
description: Regla para crear cuentas adicionales asociadas al mismo trabajador.
---

Un mismo trabajador puede tener una cuenta base del Portal de Empleados y cuentas adicionales para roles como Vigía SST. Las cuentas adicionales pueden compartir el correo de contacto, pero deben tener un nombre de usuario distinto y usar la contraseña inicial formada por la identificación del trabajador seguida de `21`.

**Why:** El trabajador puede cambiar la contraseña de su portal base usando solo su cédula; el sufijo `21` evita que la cuenta adicional comparta esa credencial inicial.

**How to apply:** Al crear usuarios desde Gestión de Usuarios, seleccionar el trabajador debe completar nombre, usuario, correo y área; la contraseña generada debe quedar bloqueada. Las validaciones de email deben permitir duplicidad únicamente cuando las cuentas están vinculadas al mismo trabajador. Las validaciones de nombres deben aceptar `Ñ` y vocales mayúsculas acentuadas.