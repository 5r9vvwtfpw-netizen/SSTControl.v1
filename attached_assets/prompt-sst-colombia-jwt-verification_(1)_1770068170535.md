# Instrucciones para sst-colombia.com: Implementar Verificación de JWT

## Contexto

La landing page (sst-colombia.com.co) ahora envía un JWT firmado criptográficamente en lugar de un simple base64 cuando los usuarios hacen click en "Suscribirse". Este cambio mejora la seguridad al garantizar que los precios no pueden ser manipulados.

**IMPORTANTE**: Esta implementación debe ser un ADD-ON. No debe modificar ni interferir con la funcionalidad existente de la aplicación.

---

## Tarea

Implementar verificación de JWT en el endpoint que recibe el parámetro `quote` de la URL `/auth?quote={token}`.

---

## Requisitos

### 1. Instalar dependencia (si no existe)

```bash
npm install jsonwebtoken @types/jsonwebtoken
```

### 2. Crear un módulo de verificación de JWT

Crear un nuevo archivo `server/jwt-quote-verifier.ts`:

```typescript
import jwt from "jsonwebtoken";

// Estructura del payload del JWT
export interface QuotePayload {
  sub_data: {
    base_monthly_price: number;      // Precio base mensual (sin descuento)
    current_period_price: number;    // Precio a cobrar este período (con descuento si aplica)
    discount_duration_months: number; // Meses que dura el descuento
    currency: "COP";
  };
  metadata: {
    employees: number;               // Número de empleados
    risk_level: "I" | "II" | "III" | "IV" | "V";
    vehicles: number;                // Vehículos para PESV
    coupon_code: string | null;      // Código del cupón aplicado
  };
  referral: {
    referrer_id: string;             // ID de la empresa que refirió
    program_type: "aliados_2026";
  } | null;
  iat: number;                       // Timestamp de creación
  exp: number;                       // Timestamp de expiración
}

/**
 * Verifica y decodifica un JWT de cotización de sst-colombia.com.co
 * 
 * @param token - El JWT recibido en el parámetro quote
 * @returns El payload decodificado si es válido
 * @throws Error si el JWT es inválido, expirado, o fue manipulado
 */
export function verifyQuoteJWT(token: string): QuotePayload {
  const JWT_SECRET = process.env.JWT_SECRET;
  
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET not configured");
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as QuotePayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("La cotización ha expirado. Por favor, genera una nueva desde la landing.");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Cotización inválida o manipulada.");
    }
    throw error;
  }
}

/**
 * Intenta decodificar como JWT firmado, con fallback a base64 legacy
 * Esto permite compatibilidad con versiones anteriores durante la transición
 * 
 * @param token - El token recibido (puede ser JWT o base64)
 * @returns El payload decodificado
 */
export function decodeQuoteWithFallback(token: string): QuotePayload {
  // Primero intentar como JWT firmado (nuevo formato)
  try {
    return verifyQuoteJWT(token);
  } catch (jwtError) {
    // Si falla, intentar como base64 legacy (formato anterior)
    // NOTA: Eliminar este fallback después de confirmar que la landing está actualizada
    try {
      const decoded = JSON.parse(atob(token));
      console.warn("WARNING: Received legacy base64 quote. Update landing page.");
      return decoded as QuotePayload;
    } catch (base64Error) {
      // Si ambos fallan, lanzar el error del JWT
      throw jwtError;
    }
  }
}
```

### 3. Integrar en el endpoint de autenticación/registro

Buscar el archivo que maneja la ruta `/auth` (probablemente en `server/routes.ts` o similar) y agregar la verificación:

```typescript
import { decodeQuoteWithFallback, QuotePayload } from "./jwt-quote-verifier";

// En el handler de /auth o donde se procese el parámetro quote
app.get("/auth", async (req, res) => {
  const quoteToken = req.query.quote as string;
  
  let quoteData: QuotePayload | null = null;
  
  if (quoteToken) {
    try {
      // Verificar y decodificar el JWT
      quoteData = decodeQuoteWithFallback(quoteToken);
      
      // Los datos verificados están disponibles:
      // - quoteData.sub_data.current_period_price -> Precio acordado (usar en Stripe)
      // - quoteData.sub_data.base_monthly_price -> Precio base después del período promocional
      // - quoteData.metadata -> Info de la empresa
      // - quoteData.referral -> Info del referido (si aplica)
      
      // Guardar en sesión o pasar al frontend para el proceso de registro
      req.session.quoteData = quoteData;
      
    } catch (error) {
      console.error("Quote verification failed:", error);
      // Permitir continuar sin quote (usuario puede registrarse manualmente)
      // O redirigir a la landing con error
    }
  }
  
  // Continuar con la lógica existente de renderizado/registro
  // ...existing code...
});
```

### 4. Usar los datos verificados al crear la suscripción en Stripe

```typescript
// Cuando crees la suscripción en Stripe, usa los precios del JWT
// NO recalcules los precios - confía en current_period_price

const quoteData = req.session.quoteData; // O de donde lo hayas guardado

if (quoteData) {
  // Crear suscripción con el precio acordado
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    // Si hay descuento, usar Subscription Schedule para transición automática
    ...(quoteData.sub_data.discount_duration_months > 0 && {
      // Configurar precio promocional por N meses
      // Después de N meses, cobra base_monthly_price
    }),
    metadata: {
      employees: quoteData.metadata.employees,
      risk_level: quoteData.metadata.risk_level,
      vehicles: quoteData.metadata.vehicles,
      coupon_code: quoteData.metadata.coupon_code || "",
      referrer_id: quoteData.referral?.referrer_id || "",
    }
  });
}
```

---

## Verificación

### Variable de entorno requerida

Asegúrate de que `JWT_SECRET` esté configurada con **exactamente el mismo valor** que en sst-colombia.com.co.

### Probar la integración

1. Ir a sst-colombia.com.co
2. Usar la calculadora de precios
3. Aplicar un cupón (ej: NYC49QUE si está disponible)
4. Click en "Suscribirse"
5. Verificar que la página de auth en sst-colombia.com recibe y decodifica correctamente el JWT
6. Verificar en los logs que no hay warnings de "legacy base64"

---

## Notas importantes

1. **NO modificar la lógica de registro existente** - Solo agregar la verificación del JWT como fuente de datos de precios

2. **Mantener compatibilidad** - La función `decodeQuoteWithFallback` permite que tokens base64 antiguos sigan funcionando durante la transición

3. **Confiar en los precios** - El JWT está firmado, por lo que los precios son confiables. NO recalcular.

4. **Programa de referidos** - Si `quoteData.referral` existe, guardar el `referrer_id` para aplicar créditos cuando se pague la primera factura (webhook `invoice.paid`)

5. **Expiración** - Los JWT expiran en 30 minutos. Si el usuario tarda más, deberá volver a la landing.

---

## Estructura del JWT decodificado (ejemplo)

```json
{
  "sub_data": {
    "base_monthly_price": 286000,
    "current_period_price": 0,
    "discount_duration_months": 1,
    "currency": "COP"
  },
  "metadata": {
    "employees": 10,
    "risk_level": "III",
    "vehicles": 0,
    "coupon_code": "NYC49QUE"
  },
  "referral": null,
  "iat": 1770067200,
  "exp": 1770069000
}
```

Este ejemplo muestra un usuario con 10 empleados, riesgo III, cupón NYC49QUE (100% descuento primer mes), sin referido.
