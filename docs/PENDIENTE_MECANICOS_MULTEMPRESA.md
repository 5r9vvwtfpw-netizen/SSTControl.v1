# Tarea pendiente: técnicos mecánicos multiempresa

**Estado:** parcialmente implementada, no lista para uso  
**Última revisión:** 4 de septiembre de 2026  
**Prioridad:** alta — requiere validación de aislamiento de datos antes de publicar

## Objetivo

Permitir que un usuario con rol `tecnico_mecanico` opere en empresas adicionales autorizadas, usando el sistema normal y sin crear una relación laboral adicional.

El técnico mecánico debe conservar una única empresa empleadora principal en `users.companyId`. Las empresas adicionales solo conceden acceso operativo, con vigencia y alcance definidos.

## Reglas de negocio confirmadas

- El rol visible para el usuario es **Técnico Mecánico** (`tecnico_mecanico`).
- No existe un portal independiente para mecánicos.
- No se crean trabajadores duplicados.
- No se crean contratos, nóminas, conteos laborales ni cobros laborales adicionales.
- Cada empresa autorizadora concede acceso únicamente a sus propios recursos.
- Solo el **Super Usuario** de la empresa autorizadora puede conceder o revocar el acceso.
- El técnico puede ver únicamente:
  - Su empresa empleadora.
  - Las empresas que lo hayan autorizado activamente y cuya vigencia aplique.
- Nunca se debe cargar ni mostrar el directorio global de clientes.
- La autorización debe validarse en el servidor; ocultar opciones en la interfaz no es suficiente.

## Implementado hasta ahora

### Modelo y migración

- Se añadió `mechanicCompanyAccess` en `shared/schema.ts`.
- Se añadió la migración `create-mechanic-company-access.ts`.
- La migración está registrada en `server/run-migrations.ts`.
- La tabla conserva:
  - Técnico mecánico.
  - Empresa empleadora.
  - Empresa autorizadora.
  - Alcance operativo.
  - Fecha inicial y fecha final opcional.
  - Estado activo/revocado.
  - Usuario que concedió o revocó.
  - Fechas de trazabilidad.
- Existen restricciones para impedir:
  - Autorizar la empresa empleadora como empresa externa.
  - Fechas finales anteriores a la fecha inicial.
  - Más de una autorización activa para la misma combinación técnico/empresa autorizadora.

### Backend aislado

Existe `server/routes/mechanic-access.ts` con endpoints para:

- Listar autorizaciones de la empresa del Super Usuario.
- Buscar técnicos mecánicos con búsqueda mínima y límite de resultados.
- Crear autorizaciones.
- Revocar autorizaciones.
- Obtener para el técnico su empresa empleadora y sus autorizaciones vigentes.

También existe el permiso `mechanic_access:manage`, asignado únicamente a `superusuario`.

## Pendientes para retomar

### 1. Registrar las rutas

Importar y ejecutar `registerMechanicAccessRoutes(app)` desde `server/routes.ts`.

Actualmente el archivo de rutas existe, pero no está conectado al registro principal de Express.

### 2. Completar Gestión de Usuarios

En `client/src/pages/GestionUsuarios.tsx`, añadir para el Super Usuario:

- Sección de autorizaciones de técnicos mecánicos.
- Búsqueda por usuario, nombre, correo o identificación.
- Selección del técnico encontrado.
- Fecha de inicio obligatoria.
- Fecha de finalización opcional.
- Selección de alcance:
  - Mantenimientos.
  - Vehículos.
  - Maquinaria.
  - Inspecciones.
- Listado de autorizaciones vigentes e históricas de la empresa actual.
- Acción para revocar una autorización.
- Mensajes claros de error, duplicado y autorización vencida.

La interfaz no debe consultar `/api/companies` para buscar mecánicos ni mostrar una lista global de clientes.

### 3. Selector de contexto para el técnico

En la navegación normal del usuario `tecnico_mecanico`:

- Consultar `/api/mechanic-access/companies`.
- Mostrar la empresa empleadora y las empresas externas autorizadas.
- Mostrar solo las empresas con autorización activa y vigente.
- Mostrar el alcance disponible de cada empresa.
- Permitir cambiar de empresa sin modificar `users.companyId`.
- Persistir el contexto seleccionado durante la sesión y recuperarlo al recargar.
- Limpiar el contexto cuando el usuario cierre sesión o pierda la autorización.

El selector no debe aparecer para otros roles por esta funcionalidad.

### 4. Validar el contexto en backend

Extender el patrón de contexto efectivo para que, cuando el usuario sea `tecnico_mecanico`:

- La empresa empleadora siempre sea válida.
- Una empresa externa solo sea válida si existe una autorización activa y vigente para ese técnico.
- El módulo solicitado esté incluido en el alcance autorizado.
- Un `X-Company-Id` manipulado no permita saltarse la autorización.
- La empresa seleccionada no cambie `users.companyId`.

La validación debe aplicarse antes de leer o mutar datos.

### 5. Aplicar aislamiento por módulo

Revisar y proteger servidor e interfaz para:

- Vehículos.
- Mantenimientos vehiculares.
- Maquinaria.
- Inspecciones operativas.

El técnico debe poder operar únicamente sobre los recursos de la empresa contextual y solo en los módulos incluidos en su alcance.

Debe quedar bloqueado para la empresa externa el acceso a:

- Trabajadores.
- Contratos.
- Nómina y conteo laboral.
- Facturación y suscripciones.
- Evaluaciones y datos SST.
- Cualquier otro recurso no incluido expresamente en el alcance.

### 6. Pruebas funcionales

No se debe considerar terminada la tarea solo porque `npm run check` o `npm run build` pasen.

Ejecutar una prueba real con navegador y API que cubra como mínimo:

1. Super Usuario de empresa A encuentra un técnico de empresa B.
2. La búsqueda no devuelve el directorio global ni resultados antes de tres caracteres.
3. Super Usuario concede acceso con alcance y vigencia.
4. El técnico ve empresa B y empresa A, pero no otras empresas.
5. El técnico puede cambiar el contexto sin cambiar su empresa empleadora.
6. El técnico puede operar vehículos/mantenimientos/maquinaria/inspecciones solo según el alcance.
7. El técnico recibe `403` al intentar usar un módulo no autorizado.
8. El técnico no puede leer ni modificar trabajadores, contratos, facturación o SST de la empresa externa.
9. Otro usuario distinto del Super Usuario no puede conceder ni revocar.
10. La revocación elimina el acceso inmediatamente.
11. Una autorización vencida no aparece como vigente y no permite acceso.
12. El aislamiento se mantiene si se envía manualmente un `X-Company-Id` no autorizado.
13. Se verifica que la importación masiva de conductores PESV continúe funcionando.

## Validación previa a publicación

Antes de publicar:

- Registrar las rutas y ejecutar la migración en el entorno de desarrollo.
- Ejecutar `npm run check`.
- Ejecutar `npm run build`.
- Reiniciar el workflow y revisar logs.
- Realizar la prueba funcional completa con navegador.
- Probar al menos dos empresas y dos roles no autorizados.
- Confirmar que no se crean trabajadores, contratos ni conteos laborales adicionales.
- Revisar que no haya consultas que carguen el listado global de empresas para el técnico.
- No publicar mientras exista una ruta sin protección de empresa, alcance o rol.

## Archivos de referencia

- `shared/schema.ts`
- `shared/permissions.ts`
- `server/migrations/create-mechanic-company-access.ts`
- `server/run-migrations.ts`
- `server/routes/mechanic-access.ts`
- `server/routes.ts`
- `client/src/pages/GestionUsuarios.tsx`
- `client/src/hooks/use-company-context.tsx`
- `client/src/lib/queryClient.ts`
- `client/src/components/PHVANavigation.tsx`
