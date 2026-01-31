# Instrucciones Finales para sst-colombia.com

## Objetivo
Hacer que el botón "Encontrar Profesionales Certificados" abra el directorio LSO con autenticación SSO.

---

## PASO 1: Configurar Secret

Agregar este secret en el proyecto:

```
LANDING_PAGE_API_KEY=a3f94d1b0f6c4a2e9d8b1c5e7f3a6b0d9e2f4c7a8b5d6e0f1a9c3d4e7b2f5c6a1
```

---

## PASO 2: Crear UN SOLO Endpoint en el Backend

Agregar este endpoint en el archivo de rutas del servidor (routes.ts o similar):

```typescript
// Endpoint para generar URL del directorio LSO con token
app.get("/api/lso-directory-url", async (req, res) => {
  // Obtener empresa del usuario autenticado (ajustar según su sistema)
  const company = req.user?.company || req.session?.company;
  
  if (!company) {
    return res.status(401).json({ ok: false, error: "No autenticado" });
  }

  const API_KEY = process.env.LANDING_PAGE_API_KEY;
  const LSO_URL = "https://lso.sst-colombia.com.co";

  if (!API_KEY) {
    return res.status(500).json({ ok: false, error: "API no configurada" });
  }

  try {
    const response = await fetch(`${LSO_URL}/api/external/token`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        clientId: String(company.id),
        companyName: company.name || company.razonSocial,
        email: company.email,
        city: company.city || company.ciudad,
        employeeCount: company.employeeCount || company.numeroTrabajadores,
        riskLevel: company.riskLevel || company.nivelRiesgo,
        permissions: ["read"]
      })
    });

    const result = await response.json();
    
    if (!result.ok || !result.data?.token) {
      console.error("Error LSO:", result.error);
      return res.status(500).json({ ok: false, error: "Error al conectar" });
    }

    return res.json({ 
      ok: true, 
      url: `${LSO_URL}/directorio?token=${result.data.token}` 
    });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ ok: false, error: "Error de conexión" });
  }
});
```

---

## PASO 3: Modificar el Botón en el Frontend

Reemplazar el botón actual con este código:

```tsx
import { useState } from "react";

function FindProfessionalsButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/lso-directory-url");
      const result = await response.json();
      
      if (result.ok && result.url) {
        window.open(result.url, "_blank");
      } else {
        alert(result.error || "Error al acceder al directorio");
      }
    } catch {
      alert("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleClick}
      disabled={isLoading}
      className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded"
    >
      {isLoading ? "Cargando..." : "Encontrar Profesionales Certificados"}
    </button>
  );
}

export default FindProfessionalsButton;
```

---

## PASO 4: Limpiar Código No Usado

Eliminar cualquier código anterior relacionado con:
- Enlaces directos a `lso.sst-colombia.com.co/directorio` sin token
- Variables `JWT_SECRET` o `LSO_DIRECTORY_URL` (no son necesarias)
- Endpoints duplicados para el directorio LSO
- Cualquier archivo `lso-directory-client.ts` si existe

---

## Resumen del Flujo

```
Usuario hace clic en botón
        ↓
Frontend llama GET /api/lso-directory-url
        ↓
Backend obtiene datos de la empresa logueada
        ↓
Backend solicita token a lso.sst-colombia.com.co
        ↓
Backend devuelve URL con token
        ↓
Frontend abre nueva pestaña con esa URL
        ↓
Usuario ve el directorio (autenticado automáticamente)
```

---

## Verificación

Después de implementar:
1. Usuario debe estar logueado en sst-colombia.com
2. Al hacer clic en el botón, debe abrir nueva pestaña
3. La nueva pestaña muestra el directorio de profesionales (sin error de token)
