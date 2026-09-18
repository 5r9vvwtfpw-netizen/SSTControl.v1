# Evidencia funcional — Revisión por la Dirección 6.1.3

**Empresa:** DEMO-PRUEBA  
**Company ID:** `demo-company-001`  
**Fecha de ejecución:** 2026-09-18  
**Código de la revisión:** `RD-2026-E2E-613`  
**ID de la revisión:** `d7b7c7b8-33a5-4033-a8a4-25c2ded16dc5`

## Resultado

La prueba funcional se ejecutó usando la API real de la aplicación y el registro quedó conservado en DEMO-PRUEBA para revisión manual.

- **Estado final:** `aprobada`
- **Estándar de referencia:** `6.1.3`
- **Fecha de aprobación:** `2026-09-18`
- **Aprobación registrada por:** cuenta administrativa autenticada de DEMO-PRUEBA
- **PDF generado:** `revision-direccion-demo-prueba-rd-2026-e2e-613.pdf`

## Secuencia comprobada

1. Se creó una nueva revisión por la dirección con el código único `RD-2026-E2E-613`.
2. Se intentó aprobarla sin evidencia asociada. La aplicación rechazó la operación con el mensaje:
   `La revisión debe tener al menos un participante antes de aprobarse`.
3. Se agregó un participante:
   - **ID:** `ff5c95d8-5bee-4790-b564-5632bd860afe`
   - **Tipo:** `alta_direccion`
   - **Cargo:** Representante Legal / Alta Dirección
4. Se agregó una entrada de revisión:
   - **ID:** `6cf8c3ff-6169-4c91-a324-229c63117005`
   - **Tipo:** `auditorias`
   - **Título:** Resultados de auditoría interna y desempeño SST
5. Se agregó una decisión:
   - **ID:** `c111fc88-6c28-4131-8a1f-f0dee73345bf`
   - **Tipo:** `mejora_continua`
   - **Requiere acción:** Sí
6. Se aprobó nuevamente la revisión. La aplicación la dejó en estado `aprobada`.
7. Se consultaron de nuevo la revisión, sus participantes, sus entradas y sus decisiones; los cuatro registros respondieron correctamente.
8. Se generó y guardó el PDF del acta desde la ruta real de la aplicación.

## Evidencia mínima confirmada

| Elemento | Cantidad |
|---|---:|
| Participantes | 1 |
| Entradas / temas | 1 |
| Decisiones | 1 |

La evidencia permanece en la base de datos de DEMO-PRUEBA y no se eliminaron los registros creados.