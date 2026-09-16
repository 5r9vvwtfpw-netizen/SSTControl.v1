# Evidencia de prueba funcional — Mediciones Ambientales

**Empresa:** DEMO-PRUEBA  
**Fecha de prueba:** 16 de septiembre de 2026  
**Flujo probado:** crear medición pendiente → registrar resultado desde la tarjeta → evaluar estado → generar PDF

## Registro probado

- **Identificador de medición:** `5d753b33-559a-4999-8652-169575002916`
- **Tipo:** Ruido ocupacional
- **Área:** Área de Mecanizado
- **Referencia:** 85 dB(A) para una exposición máxima de 8 horas
- **Resultado usado en la prueba:** 80 dB(A)
- **Resultado inicial:** Sin valor, estado `Pendiente de análisis`
- **Resultado final:** 80 dB(A), estado `Conforme`

## Verificaciones realizadas

1. Se creó la medición sin resultado numérico.
2. La medición quedó visible como pendiente de registrar.
3. Se actualizó desde el flujo de **Registrar resultado**.
4. El backend guardó el valor real `80` y la unidad `dB(A)`.
5. El sistema comparó 80 dB(A) con el límite de 85 dB(A) y asignó estado `Conforme`.
6. La consulta posterior confirmó que el registro pertenece a DEMO-PRUEBA.
7. El informe PDF se generó correctamente:
   - Estado HTTP: `200`
   - Tipo: `application/pdf`
   - Tamaño: `767214` bytes

El resultado utilizado es simulado y se dejó identificado como prueba funcional en las observaciones del registro. El registro y el PDF se conservan para revisión.