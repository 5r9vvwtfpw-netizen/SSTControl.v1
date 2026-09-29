---
name: Evidencia de invitaciones a capacitación
description: Alcance del comprobante que se muestra al inscribir trabajadores y generar avisos internos.
---

Al asignar trabajadores a una capacitación, distinguir siempre la inscripción guardada del aviso interno efectivamente creado. Un aviso persistido no es un comprobante de correo, push ni lectura; tampoco una inscripción por sí sola prueba que haya una cuenta de trabajador vinculada para recibir avisos.

**Why:** En una prueba funcional, el alta mostraba éxito aunque no confirmaba qué aviso se había creado, mientras el contador de la tarjeta podía quedar desactualizado. El usuario pidió que el resultado fuera explícito y fiable, no que se describiera la inscripción como una entrega.

**How to apply:** En flujos individuales y masivos, informar inscripciones nuevas, avisos internos creados, trabajadores sin cuenta vinculada y errores de creación por separado. Al cerrar una ventana no afirmar un segundo envío. Usar una confirmación de proveedor únicamente si se añade una entrega externa verificable.