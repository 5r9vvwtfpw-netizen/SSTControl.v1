# Evidencia de prueba funcional — Matriz Legal SST

**Fecha de ejecución:** 11 de septiembre de 2026  
**Ambiente:** Desarrollo  
**Cambio validado:** Inclusión de la Resolución 3461 de 2025 en la Matriz Legal SST.

## Resultado

**Aprobado.** La Resolución 3461 de 2025 quedó sincronizada en las matrices legales existentes y está disponible para las matrices que se inicialicen en adelante.

## Casos verificados

| Caso | Resultado | Evidencia |
| --- | --- | --- |
| Compilación de TypeScript | Aprobado | `npm run check` finalizó correctamente. |
| Integridad del cambio | Aprobado | `git diff --check` no reportó errores de espacios o formato. |
| Inicio de la aplicación | Aprobado | El workflow `Start application` está en ejecución después del reinicio. |
| Sincronización de matrices existentes | Aprobado | El inicio registró: `Matriz legal: 2 nuevas normas agregadas a 2 empresa(s).` |
| Registro de la Resolución 3461 | Aprobado | Consulta directa a la base de desarrollo encontró 2 registros, todos en la categoría `comites-sst`. |
| Contenido normativo principal | Aprobado | Cada registro contiene reuniones mensuales y extraordinarias por queja, confidencialidad, plazo máximo de 65 días, informes trimestrales y anual, y ruta separada para acoso sexual o violencia por razones de género. |

## Registro validado

| Campo | Valor esperado y confirmado |
| --- | --- |
| Norma | Resolución 3461 de 2025 |
| Título | Conformación y funcionamiento del Comité de Convivencia Laboral |
| Categoría | Comités SST |
| Entidad emisora | Ministerio del Trabajo |
| Periodicidad | Reuniones ordinarias mensuales y extraordinarias por queja |
| Responsable | RRHH / Coordinador SST |
| Norma anterior | Las Resoluciones 652 y 1356 de 2012 se indican como derogadas. |

## Contenido de obligaciones confirmado

La ficha exige:

1. Conformar y mantener el Comité de Convivencia Laboral por centro de trabajo, según el número de trabajadores.
2. Realizar reuniones ordinarias mensuales y extraordinarias por cada queja recibida.
3. Proteger la confidencialidad.
4. Completar el procedimiento preventivo en un máximo de 65 días calendario.
5. Elaborar informes trimestrales y un informe anual.
6. Remitir el acoso sexual y la violencia por razones de género a una ruta separada.

## Cómo revisarlo en la aplicación

1. Ingrese al ambiente de desarrollo con una empresa que tenga la matriz legal inicializada.
2. Abra **Planear → Matriz Legal SST**.
3. Filtre por la categoría **Comités SST**.
4. Busque **Resolución 3461 de 2025**.
5. Abra o edite el registro para contrastar los campos listados en esta evidencia.

## Observación

Durante el inicio se registraron errores independientes en el proceso automático de conversión de períodos de prueba. No afectaron el inicio de la aplicación, la migración de la matriz legal ni la disponibilidad del registro de la Resolución 3461 de 2025.