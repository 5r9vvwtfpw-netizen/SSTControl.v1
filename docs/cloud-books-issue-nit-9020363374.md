# Seguimiento: endpoint /api/integration/sst-invoice sigue fallando

## Problema
Con el payload completo y real (todos los datos del cliente presentes), el endpoint sigue devolviendo:

```
HTTP 500
{"success":false,"error":"Empresa no encontrada (NIT=9020363374)"}
```

## Evidencia clave
Con un payload deliberadamente incompleto (sin email ni dirección), la validación de Zod sí funciona bien:

```
HTTP 400
{"success":false,"error":"Datos de entrada inválidos","details":[
  {"path":["cliente","email"],"message":"Required"},
  {"path":["cliente","direccion"],"message":"Required"}
]}
```

Esto confirma que la solicitud SÍ llega al servidor y SÍ pasa por validación. El problema está después: con todos los campos completos, no crea el cliente — sigue lanzando "Empresa no encontrada".

## Hipótesis
- La lógica de auto-creación no quedó en la versión publicada, o
- Hay un lookup previo que falla y corta el flujo antes de llegar al paso de "crear cliente si no existe".

## Payload real que enviamos
```json
{
  "cliente": {
    "tipoDocumento": "NIT",
    "numeroDocumento": "9020363374",
    "digitoVerificacion": "0",
    "razonSocial": "SISTEMA AUTOMATIZADO DE GESTION INTEGRAL S.A.S",
    "tipoPersona": "Juridica",
    "regimen": "Responsable de IVA",
    "email": "ladic2023@icloud.com",
    "direccion": "CL 48 38 45",
    "departamento": "Medellín",
    "municipio": "Medellín",
    "codigoMunicipio": "Medellín",
    "telefono": "3115552054"
  },
  "referencia": {
    "empresaId": "9a3011eb-1b89-4ff8-ac89-18fc508ea62a"
  }
}
```

## Pregunta para el equipo de Cloud Books
¿Pueden revisar en logs de producción si, para este NIT, el flujo llega al paso de "crear cliente" o se detiene antes en una validación de "empresa existente"?
