---
name: Entrega de PDF en Safari desde Replit
description: Evitar confundir la vista previa y el buscador de archivos con una descarga real del PDF.
---

Al entregar un PDF, no dar por hecho que abrir su tarjeta y usar «Guardar como» descarga el archivo: Safari puede guardar la página HTML de vista previa. Tampoco indicar el menú de tres puntos si el usuario está viendo el buscador «Find a file»; el clic derecho allí muestra el menú del navegador, no el del archivo.

**Why:** Capturas del usuario mostraron formatos «Página web» en Safari y resultados de búsqueda sin menú de descarga, pese a que el PDF original sí existía y era válido. Repetir las mismas instrucciones no resolvió la entrega.

**How to apply:** Comprobar primero el PDF real. Un botón JavaScript en una vista previa HTML puede no iniciar descargas; preferir una ruta temporal solo de desarrollo que envíe el PDF con `Content-Disposition: attachment`. Verificar tipo y bytes de la respuesta, mantener la ruta ausente en producción y no afirmar que el navegador del usuario terminó la descarga hasta que lo confirme.