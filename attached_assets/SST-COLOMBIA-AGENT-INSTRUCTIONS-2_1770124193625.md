# Instrucciones para el Agente de SST-Colombia.com

## Resumen Ejecutivo

Este documento describe tres correcciones necesarias para el flujo de registro y pago de nuevos usuarios que llegan desde la landing page (sst-colombia.com.co) a la aplicación principal (sst-colombia.com).

**IMPORTANTE:** Estas correcciones NO deben alterar el motor de facturación existente. Solo deben mejorar cómo se reciben y procesan los datos del JWT "Contrato Digital".

---

## Problema 1: Nombre de Empresa No Pre-llenado en Paso 2

### Descripción del Problema
Cuando un usuario se registra en sst-colombia.com.co e ingresa el nombre de su empresa (ej: "Cie2"), al llegar al "Paso 2: Datos de la Empresa" en sst-colombia.com, el campo "Nombre de la Empresa" aparece vacío con un placeholder genérico, obligando al usuario a escribirlo nuevamente.

### Causa Raíz
El JWT "Contrato Digital" ya incluye `metadata.company_name`, pero la aplicación no está extrayendo este valor para pre-llenar el formulario.

### Solución Requerida

1. **Al decodificar el JWT en `/auth?quote={jwt}`**, extraer el campo `company_name`:

```javascript
// Ejemplo de extracción del JWT
const decoded = jwt.verify(token, process.env.JWT_SECRET);
const companyName = decoded.metadata?.company_name || '';
```

2. **Almacenar en la sesión del usuario** o pasar al componente del Paso 2:

```javascript
// Guardar en sesión o estado
session.pendingCompanyData = {
  companyName: decoded.metadata.company_name,
  employees: decoded.metadata.employees,
  riskLevel: decoded.metadata.risk_level,
  // ... otros campos
};
```

3. **Pre-llenar el campo en el formulario** del Paso 2:

```jsx
// En el componente de Paso 2
<Input
  label="Nombre de la Empresa *"
  defaultValue={pendingCompanyData?.companyName || ''}
  // El campo debe seguir siendo editable
/>
```

### Comportamiento Esperado
- Si el JWT incluye `company_name`, pre-llenar el campo
- Si no existe, mostrar el placeholder normal
- El campo debe ser editable en ambos casos

---

## Problema 2: Stripe Cobrando en USD en Lugar de COP

### Descripción del Problema
La pantalla de pago de Stripe muestra "$15.00 USD" cuando el cálculo en la landing page mostró "$132,000 COP". Esto indica que la suscripción se está creando con la moneda incorrecta.

### Causa Raíz
Al crear el producto/precio en Stripe, se está usando USD como moneda por defecto en lugar de leer la moneda del JWT.

### Datos del JWT Relevantes
```json
{
  "sub_data": {
    "base_monthly_price": 132000,
    "currency": "COP"
  }
}
```

### Solución Requerida

1. **Leer la moneda del JWT** al crear la suscripción:

```javascript
const currency = decoded.sub_data.currency || 'COP'; // Default a COP
const amount = decoded.sub_data.base_monthly_price;
```

2. **Crear o buscar el precio en Stripe con la moneda correcta**:

```javascript
// Crear precio dinámico en COP
const price = await stripe.prices.create({
  unit_amount: amount, // 132000 (en centavos para COP = 132000)
  currency: currency.toLowerCase(), // 'cop'
  recurring: { interval: 'month' },
  product: productId,
});
```

3. **Verificar configuración de Stripe**:
- La cuenta de Stripe debe tener habilitada la moneda COP
- Si no está habilitada, ir a Dashboard > Settings > Business settings > Currencies

### Nota sobre COP en Stripe
Para COP (Peso Colombiano), Stripe maneja los valores sin decimales. Es decir:
- `132000` COP = $132,000 pesos colombianos
- NO dividir entre 100 como se hace con USD

---

## Problema 3: Cupón No Aplicado en Stripe

### Descripción del Problema
El usuario aplicó el cupón "NYC49QUE" (100% descuento, primer mes gratis) en la landing page. La calculadora mostró correctamente "$0" para el primer mes. Sin embargo, Stripe cobró el precio completo sin aplicar el descuento.

### Datos del JWT Relevantes
```json
{
  "sub_data": {
    "base_monthly_price": 132000,
    "current_period_price": 0,
    "discount_duration_months": 1
  },
  "metadata": {
    "coupon_code": "NYC49QUE"
  }
}
```

### Solución Requerida

**REGLA CRÍTICA:** La aplicación principal NO debe recalcular precios. Debe confiar en `current_period_price` como el "Precio Acordado" por el usuario.

#### Opción A: Usar Trial Period (Para 100% de Descuento)

```javascript
if (decoded.sub_data.current_period_price === 0) {
  // Cupón de 100% = primer mes gratis
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    trial_period_days: 30,
    metadata: {
      coupon_code: decoded.metadata.coupon_code,
      original_price: decoded.sub_data.base_monthly_price,
      agreed_price: decoded.sub_data.current_period_price
    }
  });
}
```

#### Opción B: Usar Subscription Schedule (Para Descuentos Parciales)

```javascript
const discountMonths = decoded.sub_data.discount_duration_months || 1;
const discountedPrice = decoded.sub_data.current_period_price;
const regularPrice = decoded.sub_data.base_monthly_price;

// Crear precios para ambas fases
const discountedPriceObj = await stripe.prices.create({
  unit_amount: discountedPrice,
  currency: 'cop',
  recurring: { interval: 'month' },
  product: productId,
});

const regularPriceObj = await stripe.prices.create({
  unit_amount: regularPrice,
  currency: 'cop',
  recurring: { interval: 'month' },
  product: productId,
});

// Crear schedule con dos fases
const schedule = await stripe.subscriptionSchedules.create({
  customer: customerId,
  start_date: 'now',
  end_behavior: 'release',
  phases: [
    {
      items: [{ price: discountedPriceObj.id }],
      iterations: discountMonths,
      metadata: { phase: 'promotional', coupon_code: decoded.metadata.coupon_code }
    },
    {
      items: [{ price: regularPriceObj.id }],
      metadata: { phase: 'regular' }
    }
  ]
});
```

#### Opción C: Crear Cupón en Stripe Dinámicamente

```javascript
// Si el cupón no existe en Stripe, crearlo
let stripeCoupon;
try {
  stripeCoupon = await stripe.coupons.retrieve(decoded.metadata.coupon_code);
} catch (e) {
  // Crear cupón si no existe
  const discountPercent = Math.round(
    ((regularPrice - discountedPrice) / regularPrice) * 100
  );
  
  stripeCoupon = await stripe.coupons.create({
    id: decoded.metadata.coupon_code,
    percent_off: discountPercent,
    duration: 'repeating',
    duration_in_months: discountMonths,
    currency: 'cop'
  });
}

// Aplicar cupón a la suscripción
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: priceId }],
  coupon: stripeCoupon.id,
  metadata: {
    coupon_code: decoded.metadata.coupon_code,
    applied_at: new Date().toISOString()
  }
});
```

---

## Estructura Completa del JWT "Contrato Digital"

Este es el formato que envía sst-colombia.com.co (ACTUALIZADO):

```json
{
  "sub_data": {
    "base_monthly_price": 132000,
    "current_period_price": 0,
    "discount_duration_months": 1,
    "currency": "COP"
  },
  "metadata": {
    "company_name": "Cie2",  // ✅ AHORA INCLUIDO - capturado en la calculadora
    "employees": 2,
    "risk_level": "II",
    "vehicles": 2,
    "coupon_code": "NYC49QUE"
  },
  "referral": {
    "referrer_id": "USER_ID_O_EMAIL",
    "program_type": "aliados_2026"
  },
  "iat": 1770101400,
  "exp": 1770103200
}
```

### Campos Clave:

| Campo | Descripción | Uso |
|-------|-------------|-----|
| `sub_data.base_monthly_price` | Precio base sin descuento | Para meses siguientes |
| `sub_data.current_period_price` | Precio acordado con descuento | Para primer(os) mes(es) |
| `sub_data.discount_duration_months` | Cuántos meses aplica el descuento | Para Subscription Schedule |
| `sub_data.currency` | Moneda (siempre "COP") | Para Stripe |
| `metadata.company_name` | Nombre de empresa | **Pre-llenar en registro y Paso 2** |
| `metadata.employees` | Número de empleados | **Pre-llenar en Paso 1** |
| `metadata.risk_level` | Nivel de riesgo (I-V) | **Pre-llenar en Paso 1** |
| `metadata.vehicles` | Cantidad de vehículos | **Pre-llenar en Paso 1** |
| `metadata.coupon_code` | Código de cupón aplicado | Registro y auditoría |
| `referral.referrer_id` | ID del referidor (si aplica) | Para programa de aliados |

### Pre-llenado de Campos en el Flujo de Registro

El endpoint `/auth?quote={JWT}` debe:

1. **Página de Registro** - Pre-llenar:
   - `Nombre de empresa` ← `metadata.company_name`

2. **Paso 1: Actividad Económica y Trabajadores** - Pre-llenar:
   - `Número de Trabajadores` ← `metadata.employees`
   - El nivel de riesgo se calcula automáticamente por CIIU, pero mostrar indicador visual si `metadata.risk_level` difiere

3. **Paso 2: Datos de la Empresa** - Pre-llenar:
   - `Nombre de la Empresa` ← `metadata.company_name`
   - Vehículos se usarán para validar PESV si `metadata.vehicles > 0`

**Código de ejemplo:**
```javascript
// En el endpoint /auth
app.get('/auth', (req, res) => {
  const { quote } = req.query;
  const decoded = jwt.verify(Buffer.from(quote, 'base64url').toString(), JWT_SECRET);
  
  // Guardar en sesión para uso en pasos posteriores
  req.session.quoteData = decoded;
  req.session.prefillData = {
    companyName: decoded.metadata.company_name,
    employees: decoded.metadata.employees,
    riskLevel: decoded.metadata.risk_level,
    vehicles: decoded.metadata.vehicles,
    couponCode: decoded.metadata.coupon_code
  };
  
  // Redirigir a registro con tab "Registrarse" activo
  res.redirect('/registro?tab=registrarse');
});

// En el componente de registro
const prefill = session.prefillData || {};
<input name="companyName" defaultValue={prefill.companyName || ''} />

// En Paso 1
<input name="employees" defaultValue={prefill.employees || ''} />

// En Paso 2
<input name="companyName" defaultValue={prefill.companyName || ''} />
```

---

## Flujo de Persistencia de Datos

Los datos del JWT pasan por dos etapas: almacenamiento temporal (sesión) y almacenamiento permanente (base de datos).

### Diagrama de Flujo

```
sst-colombia.com.co                     sst-colombia.com
       │                                       │
       │ JWT con datos ──────────────────────> │
       │                                       │
       │                            /auth?quote={JWT}
       │                                  │
       │                            Decodifica JWT
       │                            Guarda en SESIÓN (temporal)
       │                                  │
       │                            /registro (Crear cuenta)
       │                                  │
       │                            Usuario llena email, usuario, contraseña
       │                            Click "Crear cuenta gratis"
       │                                  │
       │                            ┌─────────────────────────┐
       │                            │ INSERT INTO users       │
       │                            │ (username, email, etc.) │
       │                            └─────────────────────────┘
       │                                  │
       │                            /onboarding/paso-1
       │                            (Pre-llenado desde sesión)
       │                                  │
       │                            /onboarding/paso-2
       │                            Click "Crear Empresa"
       │                                  │
       │                            ┌─────────────────────────┐
       │                            │ INSERT INTO companies   │
       │                            │ (nombre, NIT, ciudad,   │
       │                            │  employees, risk, etc.) │
       │                            └─────────────────────────┘
```

### Momentos de Persistencia en Base de Datos

| Paso | Acción del Usuario | Tabla | Datos Guardados |
|------|-------------------|-------|-----------------|
| Registro | "Crear cuenta gratis" | `users` | username, email, password_hash |
| Paso 2 | "Crear Empresa y Comenzar Prueba" | `companies` | nombre, NIT, ciudad, dirección, teléfono, employees, risk_level, vehicles |
| Post-Paso 2 | Al activar suscripción | `subscriptions` | user_id, company_id, stripe_subscription_id, base_price, agreed_price, coupon_code |

### Almacenamiento Temporal (Sesión)

El JWT decodificado debe guardarse en la sesión del servidor para mantener los datos entre pasos:

```javascript
// En /auth - Guardar en sesión
req.session.quoteData = {
  sub_data: decoded.sub_data,
  metadata: decoded.metadata,
  referral: decoded.referral
};

// En Paso 1 - Leer de sesión para pre-llenar
const quoteData = req.session.quoteData || {};
const employees = quoteData.metadata?.employees || '';
const vehicles = quoteData.metadata?.vehicles || 0;

// En Paso 2 - Leer de sesión para pre-llenar
const companyName = quoteData.metadata?.company_name || '';
```

### Persistencia Permanente (Base de Datos)

```javascript
// Al hacer click en "Crear cuenta gratis"
const newUser = await db.insert(users).values({
  username: formData.username,
  email: formData.email,
  passwordHash: await hash(formData.password),
  // NO guardar datos de empresa aquí
}).returning();

req.session.userId = newUser.id;

// Al hacer click en "Crear Empresa y Comenzar Prueba"
const quoteData = req.session.quoteData;

const newCompany = await db.insert(companies).values({
  userId: req.session.userId,
  nombre: formData.companyName || quoteData.metadata.company_name,
  nit: formData.nit,
  ciudad: formData.ciudad,
  direccion: formData.direccion,
  telefono: formData.telefono,
  email: formData.email,
  // Datos del JWT
  employees: quoteData.metadata.employees,
  riskLevel: quoteData.metadata.risk_level,
  vehicles: quoteData.metadata.vehicles,
}).returning();

// Crear suscripción en Stripe usando quoteData.sub_data
await createStripeSubscription(newCompany.id, quoteData);
```

### Limpieza de Sesión

Después de completar el registro y crear la empresa, limpiar los datos temporales:

```javascript
// Después de crear la empresa exitosamente
delete req.session.quoteData;
```

---

## Reglas Críticas de Implementación

### ✅ HACER:
1. **Validar firma del JWT** usando `JWT_SECRET` compartido
2. **Confiar en `current_period_price`** como precio acordado
3. **Registrar en audit_log** todos los cupones y precios aplicados
4. **Usar la moneda del JWT** (siempre COP para Colombia)
5. **Pre-llenar campos** cuando los datos estén disponibles

### ❌ NO HACER:
1. **NO recalcular precios** en el servidor de sst-colombia.com
2. **NO ignorar el cupón** del JWT
3. **NO asumir USD** como moneda por defecto
4. **NO alterar el motor de facturación** existente para otras funcionalidades

---

## Checklist de Verificación

Antes de desplegar, verificar:

- [ ] El JWT se decodifica correctamente y se valida la firma
- [ ] El campo `company_name` se extrae y pre-llena en Paso 2
- [ ] La moneda COP se usa al crear precios en Stripe
- [ ] Los cupones se aplican correctamente (100% = trial, parcial = schedule)
- [ ] Los metadatos del cupón se guardan en la suscripción de Stripe
- [ ] El audit_log registra el cupón aplicado y precios originales

---

## Ejemplo de Flujo Completo

```javascript
// 1. Recibir y validar JWT
app.get('/auth', async (req, res) => {
  const { quote } = req.query;
  
  try {
    // Decodificar JWT
    const decoded = jwt.verify(
      Buffer.from(quote, 'base64').toString('utf-8'),
      process.env.JWT_SECRET
    );
    
    // 2. Extraer datos
    const {
      sub_data: { base_monthly_price, current_period_price, discount_duration_months, currency },
      metadata: { company_name, employees, risk_level, vehicles, coupon_code }
    } = decoded;
    
    // 3. Guardar en sesión para Paso 2
    req.session.pendingCompany = {
      companyName: company_name,
      employees,
      riskLevel: risk_level,
      vehicles
    };
    
    // 4. Guardar datos de facturación para cuando se cree la suscripción
    req.session.billingData = {
      basePrice: base_monthly_price,
      agreedPrice: current_period_price,
      discountMonths: discount_duration_months,
      currency,
      couponCode: coupon_code
    };
    
    // Redirigir al onboarding
    res.redirect('/onboarding/paso-1');
    
  } catch (error) {
    console.error('JWT inválido:', error);
    res.redirect('/registro?error=invalid_quote');
  }
});

// 5. Al crear suscripción (después de completar onboarding)
async function createSubscription(customerId, session) {
  const { basePrice, agreedPrice, discountMonths, currency, couponCode } = session.billingData;
  
  // Determinar tipo de descuento
  if (agreedPrice === 0) {
    // 100% descuento = Trial
    return stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: await getOrCreatePrice(basePrice, currency) }],
      trial_period_days: 30,
      metadata: { coupon_code: couponCode, source: 'landing_jwt' }
    });
  } else if (agreedPrice < basePrice) {
    // Descuento parcial = Subscription Schedule
    return stripe.subscriptionSchedules.create({
      customer: customerId,
      start_date: 'now',
      phases: [
        {
          items: [{ price: await getOrCreatePrice(agreedPrice, currency) }],
          iterations: discountMonths
        },
        {
          items: [{ price: await getOrCreatePrice(basePrice, currency) }]
        }
      ]
    });
  } else {
    // Sin descuento
    return stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: await getOrCreatePrice(basePrice, currency) }]
    });
  }
}
```

---

## Contacto para Dudas

Si tienes preguntas sobre la estructura del JWT o el flujo de datos, el equipo de sst-colombia.com.co puede proporcionar más detalles sobre cómo se generan los tokens y qué datos incluyen.

**Secreto JWT compartido:** Variable de entorno `JWT_SECRET` (debe ser el mismo en ambos sistemas)
