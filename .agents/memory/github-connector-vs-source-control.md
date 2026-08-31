---
name: GitHub connectors
description: Distinción entre la integración general de GitHub y la de GitHub Source Control en Replit.
---

En la interfaz de Integrations de Replit, **GitHub** y **GitHub Source Control** son conexiones distintas. La integración general abre una pantalla de configuración de permisos; la conexión **Source Control** es la que controla el enlace del código del workspace con el repositorio remoto.

**Why:** Las dos tarjetas tienen el mismo logotipo y nombres parecidos, por lo que gestionar la tarjeta general puede mostrar `Delete` y permisos sin ofrecer la desconexión de la cuenta usada para sincronizar el código.

**How to apply:** Para cambiar la cuenta que hace push o sincroniza el repositorio, usar `Disconnect` en la tarjeta **GitHub — Source Control** y volver a autorizarla con la cuenta propietaria. No eliminar ni modificar la integración general salvo que también se quiera retirar el acceso de la aplicación a GitHub.