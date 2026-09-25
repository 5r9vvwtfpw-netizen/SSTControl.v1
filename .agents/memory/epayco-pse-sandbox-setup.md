---
name: Catálogo y correo de prueba PSE
description: Requisitos no obvios para llegar al simulador y terminar una prueba bancaria por PSE.
---

**Regla:** La lista de bancos PSE debe consultarse con el mismo modo de pruebas que la creación de la transacción. Aun seleccionando Banka en ese catálogo, una prueba completa puede requerir acceso al correo utilizado para verificar el registro del pagador en PSE.

**Why:** Sin el indicador de pruebas, ePayco devolvió el catálogo general de bancos en lugar del catálogo del sandbox. Con el indicador aparecieron Banka y otro banco de pruebas, pero el registro PSE de desarrollo siguió pidiendo un código enviado al correo ficticio del pagador. La documentación pública de ePayco sobre medios de prueba no incluye un código PSE universal.

**How to apply:** Antes de probar el banco, verificar que el catálogo corresponda al sandbox. Para un extremo a extremo, usar un buzón QA accesible y autorizado, no una dirección ficticia imposible de consultar; no adivinar códigos ni usar credenciales bancarias reales. Conservar el estado pendiente si no hay confirmación auténtica.

**Regla adicional confirmada por ePayco:** Tanto el Dashboard de ePayco como la integración que crea la transacción deben estar en modo de pruebas al mismo tiempo. Si solo la integración está en pruebas, ACH/PSE puede confirmar éxito en el simulador mientras ePayco rechaza con «Transacción rechazada por el centro de autorizaciones». No deducir una aprobación comercial del simulador; al repetir, verificar primero ambos ajustes sin alterar el modo de una aplicación que esté aceptando pagos reales.

**Why:** ePayco explicó expresamente que la discordancia de modos provoca ese rechazo incluso si el banco de pruebas muestra una aprobación.

**How to apply:** Comprobar el modo de la integración y pedir al operador que verifique el del Dashboard antes de crear otra transacción. No cambiar la configuración de producción por una prueba sin consentimiento informado.

**Observación de producción:** El endpoint de catálogo de ePayco devolvió solamente BANKA y BANCO UNION COLOMBIANO tanto con `enpruebas=TRUE` como con `enpruebas=FALSE` en la URL. Con las mismas credenciales, omitir por completo ese parámetro en modo real devolvió el catálogo de 50 entidades bancarias; la biblioteca oficial de ePayco también solicita bancos con solo `public_key` en la URL. Por tanto, no usar `enpruebas=FALSE` en la URL para obtener bancos reales. Esta regla concierne a la consulta del catálogo, no al indicador cifrado de prueba que se envía al crear un pago.