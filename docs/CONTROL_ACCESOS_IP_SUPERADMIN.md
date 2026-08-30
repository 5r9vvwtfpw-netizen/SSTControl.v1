# Control de accesos por IP y sesiones

## Guía operativa para Super Admin

Esta función se administra desde **Actividad Login** y solo está disponible para usuarios con rol `superadmin`.

## Verificación de dos pasos por correo

En cada inicio de sesión, todos los roles deben validar un código temporal enviado al correo de su cuenta, con dos excepciones:

- **Super Administrador:** acceso directo después de validar contraseña y controles de IP.
- **Trabajador:** acceso directo al portal de empleados después de validar contraseña y controles de IP.

La verificación sí es obligatoria para Super Usuario, Gerente General, Responsable SST, Profesional/Licenciado SST, Soporte Técnico, coordinadores, jefes, supervisores, Vigía SST, Auditor Interno, Técnico Mecánico y cualquier otro rol distinto de las dos excepciones.

El código:

- Tiene 6 dígitos.
- Vence en 10 minutos.
- Solo puede utilizarse una vez.
- Admite como máximo 5 intentos.
- Se almacena protegido con HMAC; nunca se guarda ni registra en texto plano.
- No crea una sesión autenticada hasta ser validado.

Si una cuenta obligada a usar verificación no tiene correo registrado, el acceso se detiene y debe solicitar al Super Admin que actualice su correo.

El control está incluido tanto en el login principal como en el portal de soporte.

## Información mostrada

La pantalla principal presenta:

- Usuario, rol y empresa.
- Fecha del último acceso.
- Última IP utilizada.
- Estado del control de IP.
- Cantidad de alertas.
- Acceso al historial detallado de seguridad.

La columna **Última IP** no es el historial completo. El historial se consulta mediante **Ver seguridad**.

## Estados del control de IP

### Sin restricción

El usuario no tiene IP autorizadas configuradas. Puede ingresar desde cualquier IP y sus sesiones siguen quedando registradas. Una lista vacía siempre significa que la restricción por IP está desactivada.

### Monitoreo activo

El usuario tiene una o más IP autorizadas. Cada login exitoso se compara contra la lista.

El Super Admin puede agregar direcciones IPv4 o IPv6, guardar la lista y revocar direcciones. El sistema valida el formato y solicita confirmación antes de revocar.

## Política de IP no autorizada y bloqueo

Se utiliza una ventana móvil de 24 horas:

1. Los primeros tres accesos con credenciales correctas desde IP no autorizada se permiten.
2. Cada uno queda registrado como sospechoso.
3. Cada evento genera un correo a todos los Super Admin con email registrado.
4. El cuarto intento desde una IP no autorizada se bloquea.
5. Los siguientes intentos no autorizados permanecen bloqueados hasta que el acceso permitido más antiguo salga de la ventana de 24 horas.
6. Ingresar desde una IP autorizada sigue estando permitido.
7. Vaciar la lista de IP desactiva la restricción.

El bloqueo no es una suspensión definitiva de la cuenta. El evento bloqueado también queda registrado para auditoría.

## Alertas por correo

Se envía un correo por cada alerta de:

- IP no autorizada permitida.
- Intento bloqueado por reiteración.
- Sesión simultánea.
- Sesión superior a ocho horas.

El correo incluye cuenta, rol, IP, decisión tomada, fecha, navegador/dispositivo y ubicación aproximada cuando está disponible.

El envío es de mejor esfuerzo: una falla temporal del proveedor de correo no interrumpe un login legítimo ni elimina el registro de auditoría.

Para evitar avisos falsos durante pruebas, los correos están habilitados automáticamente en producción. En desarrollo solo se envían si se configura explícitamente `SECURITY_ALERT_EMAILS_ENABLED=true`.

## Historial de sesiones

Cada registro puede contener:

- Cuenta autenticada.
- IP.
- Fecha y hora.
- Duración.
- Sesión activa o cerrada.
- Decisión: permitida o bloqueada.
- Navegador y sistema operativo.
- Identificador persistente del navegador.
- Ciudad, región, país, zona horaria y proveedor de internet aproximados.
- Tipo y nota de alerta.

El historial puede filtrarse por estado de alerta y período.

## Sesiones simultáneas

Si una cuenta inicia una nueva sesión mientras otra permanece activa:

- La sesión anterior se cierra.
- Queda marcada como sospechosa.
- Se registra la duración.
- Se envía una alerta al Super Admin.
- La nueva sesión continúa si supera los demás controles.

## Sesiones superiores a ocho horas

Un monitor periódico marca como sospechosas las sesiones activas de más de ocho horas y envía la alerta correspondiente.

## Geolocalización

La ubicación se consulta por IP mediante `ipwho.is`, sin almacenar una clave externa. El resultado se guarda en el registro y se reutiliza temporalmente para reducir consultas.

La geolocalización:

- Es aproximada.
- Puede señalar la ciudad del proveedor, una VPN o un nodo corporativo.
- No está disponible para IP privadas o locales.
- Puede fallar sin impedir el acceso; en ese caso queda como no disponible.

## Identificación cuando varias personas comparten red

Una IP pública puede ser compartida por una oficina, vivienda, VPN o red móvil. Por eso una IP no identifica de manera exacta a una persona.

El sistema atribuye cada acceso mediante la combinación de:

- Cuenta y usuario autenticado.
- ID de sesión.
- IP.
- Fecha y hora.
- Navegador y sistema operativo.
- Identificador persistente del navegador.
- Ubicación aproximada.

El identificador de navegador ayuda a distinguir equipos o instalaciones de navegador que comparten la misma IP, pero no constituye prueba biométrica ni garantiza quién estaba físicamente frente al dispositivo. La identidad contractual continúa dependiendo del uso individual e intransferible de las credenciales.

## Procedimiento recomendado ante una alerta

1. Abrir **Actividad Login**.
2. Buscar al usuario y seleccionar **Ver seguridad**.
3. Revisar IP, fecha, ubicación, dispositivo, identificador y sesiones cercanas.
4. Confirmar con el titular si reconoce el acceso.
5. Autorizar la IP si corresponde.
6. Revocar IP antiguas o desconocidas.
7. Cambiar la contraseña o suspender manualmente la cuenta si hay indicios de credenciales compartidas.
8. Conservar el historial como evidencia de auditoría.

## Privacidad y límites

Estos registros son datos de seguridad. Deben consultarse solo con fines de control de acceso, investigación y auditoría. La geolocalización y el identificador del navegador son señales auxiliares, no pruebas concluyentes de identidad física.