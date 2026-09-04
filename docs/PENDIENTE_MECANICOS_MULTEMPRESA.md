# Técnicos mecánicos multiempresa

**Estado:** implementado y verificado en desarrollo
**Última revisión:** 4 de septiembre de 2026  
**Publicación:** pendiente de decisión del usuario

## Alcance implementado

Un usuario con rol visible **Técnico Mecánico** (`tecnico_mecanico`) conserva una única empresa empleadora en `users.companyId` y puede operar recursos de otras empresas mediante autorizaciones independientes.

Las autorizaciones externas:

- No crean trabajadores, contratos, nómina, conteos laborales ni cobros adicionales.
- Solo pueden ser concedidas o revocadas por el `superusuario` de la empresa autorizadora.
- Tienen fecha inicial, fecha final opcional, estado y trazabilidad.
- Solo permiten los alcances realmente disponibles:
  - Vehículos.
  - Mantenimientos.
  - Inspecciones.
- No incluyen “Maquinaria”, porque no existe un módulo backend real que pueda aislarse y autorizarse.

## Controles de seguridad

- El técnico solo recibe su empresa empleadora y autorizaciones activas y vigentes.
- Nunca se carga el directorio global de empresas para el técnico.
- `X-Company-Id` se valida en el servidor contra técnico, empleadora, empresa autorizada, estado, fechas y alcance.
- Las rutas no operativas ignoran el contexto externo y usan la empleadora.
- Vehículos, mantenimientos e inspecciones validan empresa también en consultas por ID.
- Inspecciones usan una consulta mínima de conductores externos (`id`, `name`, `status`), sin abrir el módulo completo de conductores.
- Los datos de React Query se separan por empresa y se eliminan al cambiar de contexto o cerrar sesión.
- La selección externa se valida únicamente después de cargar las autorizaciones, evitando que una recarga borre prematuramente el contexto guardado.

## Interfaz

- Gestión de Usuarios contiene búsqueda limitada de técnicos, fechas, alcances, autorización, histórico y revocación.
- La búsqueda exige al menos tres caracteres y no muestra un directorio global.
- La navegación del técnico muestra un selector nativo con empleadora y empresas autorizadas.
- Los controles de Vehículos, Mantenimiento e Inspecciones se muestran según el alcance.
- El inicio del técnico va directamente a PESV, sin pasar por el Dashboard SST.
- La campana del técnico conserva contador y acceso a Mensajes Internos mediante una variante simple y estable.

## Validaciones realizadas

### Compilación

- `npm run check`: aprobado.
- `npm run build`: aprobado antes del cierre; debe repetirse tras cualquier cambio posterior.
- `git diff --check`: aprobado.
- Workflow de desarrollo reiniciado y operativo.
- Captura independiente de `/auth`: aplicación visible, sin error React.

### Navegador

Con datos aislados de dos empresas se comprobó:

- Panel de autorizaciones visible solo para Super Usuario.
- Cero búsquedas con menos de tres caracteres.
- Búsqueda del técnico con tres o más caracteres.
- Creación/listado de alcances y rechazo de autorización duplicada.
- Selector limitado exactamente a empleadora y empresa autorizada.
- Vehículos, mantenimientos e inspecciones muestran únicamente registros de la empresa seleccionada.
- Cambio A/B sin mostrar registros de la otra empresa.
- Navegación del técnico, controles de módulos y campana de notificaciones visibles.

### API autenticada

- Empresa autorizada activa: aparece en la lista y las rutas operativas responden `200`.
- Empresa no autorizada manipulada: `403`.
- Vehículo, mantenimiento e inspección de otra empresa consultados por ID: `404`.
- Trabajadores externos: `403`.
- Contratos, facturación y SST no exponen datos de la empresa externa.
- Autorización revocada: desaparece y las rutas operativas responden `403`.
- Autorización vencida: desaparece y las rutas operativas responden `403`.
- Autorización con inicio futuro: desaparece y las rutas operativas responden `403`.
- Logout autenticado: `200`.
- Todos los datos temporales de prueba fueron eliminados.

### Regresión de importación PESV

Se cargó un archivo Excel real mediante `/api/drivers/import`:

- Total: 1.
- Exitosos: 1.
- Fallidos: 0.
- El conductor, usuario y empresa temporales fueron eliminados después de la prueba.

## Archivos principales

- `shared/schema.ts`
- `shared/permissions.ts`
- `server/migrations/create-mechanic-company-access.ts`
- `server/run-migrations.ts`
- `server/routes/mechanic-access.ts`
- `server/middleware/mechanic-company-context.ts`
- `server/routes.ts`
- `server/storage.ts`
- `client/src/pages/GestionUsuarios.tsx`
- `client/src/hooks/use-company-context.tsx`
- `client/src/hooks/use-auth.tsx`
- `client/src/lib/queryClient.ts`
- `client/src/components/PHVANavigation.tsx`
- `client/src/components/NotificationBell.tsx`
- `client/src/pages/PesvVehiculos.tsx`
- `client/src/pages/PesvMantenimientoVehicular.tsx`
- `client/src/pages/PesvInspecciones.tsx`

## Antes de publicar

- No publicar automáticamente.
- Revisar el diff y ejecutar el build final.
- Aplicar la migración en el entorno de destino mediante el flujo normal de despliegue.
- Realizar una prueba breve post-despliegue con una autorización real controlada.