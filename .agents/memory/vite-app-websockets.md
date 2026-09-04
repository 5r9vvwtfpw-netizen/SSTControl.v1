---
name: Vite and application WebSockets
description: Cómo evitar que un WebSocket de la aplicación rompa HMR y las recargas en el Preview.
---

Los WebSockets propios montados sobre el mismo servidor HTTP que Vite deben usar `noServer` y ejecutar `handleUpgrade` únicamente cuando el pathname coincide exactamente con su ruta. Las demás solicitudes `upgrade` deben ignorarse.

**Why:** `WebSocketServer({ server, path })` puede responder 400 a upgrades que no coinciden, incluyendo HMR de Vite. En el proxy de Replit esto provoca reconexiones, pantallas blancas y errores de recarga.

**How to apply:** Para cada canal de aplicación, registrar un listener `upgrade` que filtre primero su pathname. Configurar además el cliente HMR con el dominio de desarrollo de Replit y puerto seguro cuando esté disponible.