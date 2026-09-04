---
name: Safari login autofill
description: Regla para evitar credenciales visualmente correctas pero obsoletas en el estado React.
---

Los formularios de acceso deben asignar `name` y `autocomplete` a usuario y contraseña, y construir las credenciales desde `FormData` al enviar. El estado controlado puede seguir usándose para renderizado.

**Why:** Safari puede cambiar o restaurar el valor visible de un campo sin disparar `onChange`. El usuario ve la credencial correcta, pero React envía un valor anterior y el backend responde 401.

**How to apply:** En cualquier formulario de autenticación controlado, leer los elementos reales del formulario durante `onSubmit`; no depender exclusivamente del estado React para las credenciales finales.