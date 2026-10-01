---
name: ABI de bibliotecas nativas en Nix
description: Selección de arquitectura al usar librerías nativas de Python para procesar documentos.
---

Cuando una herramienta nativa necesita una biblioteca del entorno Nix, comprobar la arquitectura ELF de la biblioteca antes de usarla. No seleccionar simplemente el primer resultado de un glob.

**Why:** Este entorno contiene runtimes GCC de 32 y 64 bits. Una biblioteca existente puede ser incompatible con Python y producir «wrong ELF class», aunque su nombre coincida con el solicitado.

**How to apply:** Ante errores de carga de dependencias nativas, distinguir biblioteca ausente de arquitectura incompatible y elegir una biblioteca con el ABI del proceso. Los hashes de las rutas Nix no son estables y no deben convertirse en configuración permanente.