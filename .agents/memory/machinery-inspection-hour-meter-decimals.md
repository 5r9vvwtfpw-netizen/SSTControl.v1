---
name: Decimales en horómetro de maquinaria
description: Regla de precisión para las inspecciones preoperacionales de maquinaria amarilla.
---

Las lecturas del horómetro pueden incluir decimales. Mantener esta precisión desde el campo del Portal de Empleados hasta la validación de la API y el almacenamiento; no exigir enteros ni convertir el dato a un tipo entero.

**Why:** El formulario aceptaba visualmente valores como `8622.4`, pero el endpoint y la columna entera rechazaban la lectura.

**How to apply:** Al cambiar o reutilizar el campo de horómetro de inspecciones de maquinaria, comprobar el comportamiento de captura, validación, persistencia y lectura con un valor decimal.