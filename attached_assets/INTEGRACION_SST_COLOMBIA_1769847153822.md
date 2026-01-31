# Integración: Botón "Encontrar Profesionales Certificados"

## Problema Actual
El botón "Encontrar Profesionales Certificados" redirige a `https://lso.sst-colombia.com.co/directorio` sin un token de autenticación, causando el error "Token de acceso inválido o expirado".

## Solución
Generar un token JWT en el backend antes de redirigir al usuario.

---

## PASO 1: Agregar Variables de Entorno

Agregar estos secrets en la configuración del proyecto:

```
LANDING_PAGE_API_KEY=tiV0o//Qhm6GqL6RYnTtrX3fDh5gsvkNNW4Wuk7zstQ=
LSO_DIRECTORY_URL=https://lso.sst-colombia.com.co
```

---

## PASO 2: Crear Endpoint Backend

Crear un nuevo endpoint que genere la URL con token:

```typescript
// Agregar este endpoint en el archivo de rutas del servidor

app.get("/api/lso-directory-url", async (req, res) => {
  // Obtener datos de la empresa del usuario autenticado
  // Ajustar según el sistema de autenticación existente
  const company = req.user?.company || req.session?.company;
  
  if (!company) {
    return res.status(401).json({ 
      ok: false, 
      error: "Debe iniciar sesión para acceder al directorio" 
    });
  }

  const LSO_API_KEY = process.env.LANDING_PAGE_API_KEY;
  const LSO_URL = process.env.LSO_DIRECTORY_URL || "https://lso.sst-colombia.com.co";

  if (!LSO_API_KEY) {
    console.error("LANDING_PAGE_API_KEY no configurado");
    return res.status(500).json({ 
      ok: false, 
      error: "Error de configuración del servidor" 
    });
  }

  try {
    // Solicitar token JWT al directorio LSO
    const tokenResponse = await fetch(`${LSO_URL}/api/external/token`, {
      method: "POST",
      headers: {
        "x-api-key": LSO_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        companyId: String(company.id),
        companyName: company.name || company.razonSocial,
        email: company.email,
        city: company.city || company.ciudad,
        employeeCount: company.employeeCount || company.numeroTrabajadores,
        riskLevel: company.riskLevel || company.nivelRiesgo,
        activityCIIU: company.activityCIIU || company.actividadCIIU,
        permissions: ["read"]  // Solo lectura para buscar profesionales
      })
    });

    const result = await tokenResponse.json();
    
    if (!result.ok || !result.data?.token) {
      console.error("Error obteniendo token LSO:", result.error);
      return res.status(500).json({ 
        ok: false, 
        error: "Error al conectar con el directorio de profesionales" 
      });
    }

    // Construir URL completa con el token
    const directoryUrl = `${LSO_URL}/directorio?token=${result.data.token}`;
    
    return res.json({ 
      ok: true, 
      url: directoryUrl 
    });

  } catch (error) {
    console.error("Error conectando con LSO Directory:", error);
    return res.status(500).json({ 
      ok: false, 
      error: "Error de conexión con el directorio" 
    });
  }
});
```

---

## PASO 3: Modificar el Botón en el Frontend

Reemplazar el enlace directo por una función que llame al endpoint:

### Opción A: React/TypeScript

```tsx
// Componente del botón
function FindProfessionalsButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/lso-directory-url");
      const result = await response.json();
      
      if (result.ok && result.url) {
        // Abrir directorio en nueva pestaña
        window.open(result.url, "_blank");
      } else {
        alert(result.error || "Error al acceder al directorio");
      }
    } catch (error) {
      alert("Error de conexión. Intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleClick}
      disabled={isLoading}
      className="btn-primary"
    >
      {isLoading ? "Cargando..." : "Encontrar Profesionales Certificados"}
    </button>
  );
}
```

### Opción B: JavaScript Vanilla

```html
<button id="btn-find-professionals" onclick="findProfessionals()">
  Encontrar Profesionales Certificados
</button>

<script>
async function findProfessionals() {
  const button = document.getElementById('btn-find-professionals');
  const originalText = button.textContent;
  
  button.disabled = true;
  button.textContent = 'Cargando...';
  
  try {
    const response = await fetch('/api/lso-directory-url');
    const result = await response.json();
    
    if (result.ok && result.url) {
      window.open(result.url, '_blank');
    } else {
      alert(result.error || 'Error al acceder al directorio');
    }
  } catch (error) {
    alert('Error de conexión. Intente nuevamente.');
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
}
</script>
```

---

## Flujo de Autenticación (SSO)

```
┌─────────────────────┐
│  Usuario en         │
│  sst-colombia.com   │
│  (ya autenticado)   │
└─────────┬───────────┘
          │
          │ 1. Click "Encontrar Profesionales"
          ▼
┌─────────────────────┐
│  Frontend llama     │
│  /api/lso-directory │
└─────────┬───────────┘
          │
          │ 2. Backend obtiene datos de empresa
          ▼
┌─────────────────────┐
│  Backend solicita   │
│  token JWT a LSO    │
│  (con API Key)      │
└─────────┬───────────┘
          │
          │ 3. LSO devuelve JWT con datos empresa
          ▼
┌─────────────────────┐
│  Backend devuelve   │
│  URL con token      │
└─────────┬───────────┘
          │
          │ 4. Frontend abre URL en nueva pestaña
          ▼
┌─────────────────────┐
│  Usuario ve         │
│  directorio LSO     │
│  (autenticado)      │
└─────────────────────┘
```

---

## Datos de la Empresa en el Token

El token incluye información de la empresa que se usa para:
- Personalizar los correos de contacto
- Registrar qué empresa contactó a qué profesional

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `companyId` | string | ID único de la empresa (requerido) |
| `companyName` | string | Razón social de la empresa |
| `email` | string | Correo de contacto de la empresa |
| `city` | string | Ciudad donde opera |
| `employeeCount` | number | Número de trabajadores |
| `riskLevel` | string | Nivel de riesgo (I, II, III, IV, V) |
| `activityCIIU` | string | Código CIIU de la actividad |
| `permissions` | array | `["read"]` = solo ver, `["read", "write"]` = contactar |

---

## Verificación

Después de implementar, verificar que:

1. El botón muestra "Cargando..." mientras procesa
2. Se abre una nueva pestaña con el directorio
3. El directorio muestra los profesionales (sin error de token)
4. Los datos de la empresa aparecen en el formulario de contacto

---

## Soporte

Si hay problemas con la integración, verificar:

1. Que `LANDING_PAGE_API_KEY` esté configurado correctamente
2. Que el usuario esté autenticado antes de hacer clic
3. Revisar los logs del servidor para errores de conexión
