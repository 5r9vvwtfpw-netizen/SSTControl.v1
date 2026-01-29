# LSO Directory External API Integration Guide

This document provides instructions for integrating with the LSO Directory API to pull registration data and create new registrations from external portals.

## Base URL

```
https://lso.sst-colombia.com.co
```

Replace with your actual deployed URL if different.

---

## Authentication

The API supports two authentication methods:

### Option 1: API Key (Simple)

Use the API key directly in the Authorization header:

```
Authorization: Bearer YOUR_API_KEY
```

### Option 2: JWT Token (Recommended for Production)

Generate a JWT token using your API key, then use the JWT for subsequent requests. JWT tokens can have specific permissions and expiration times.

#### Generate JWT Token

```javascript
const response = await fetch('https://lso.sst-colombia.com.co/api/external/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    clientId: 'my-portal-name',
    permissions: ['read', 'write'],
    expiresIn: '7d'  // Options: "1h", "24h", "7d", "30d"
  })
});

const { data } = await response.json();
// Use data.token for subsequent API calls
console.log('JWT Token:', data.token);
console.log('Expires at:', data.expiresAt);
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresAt": "2026-02-05T12:00:00.000Z",
    "expiresIn": 604800,
    "clientId": "my-portal-name",
    "permissions": ["read", "write"]
  }
}
```

---

## Environment Setup

Add these environment variables to your Replit project:

```
LSO_API_BASE_URL=https://lso.sst-colombia.com.co
LSO_API_KEY=your_api_key_here
```

Then create an API client:

```javascript
// lib/lso-api.js
const LSO_API_BASE_URL = process.env.LSO_API_BASE_URL;
const LSO_API_KEY = process.env.LSO_API_KEY;

async function lsoApiRequest(endpoint, options = {}) {
  const response = await fetch(`${LSO_API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LSO_API_KEY}`,
      ...options.headers,
    },
  });
  return response.json();
}

module.exports = { lsoApiRequest };
```

---

## API Endpoints

### 1. Get Registrations

Retrieve a list of LSO professional registrations.

**Endpoint:** `GET /api/external/registrations`

**Required Permission:** `read`

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | all | Filter by status: `pending`, `confirmed`, `rejected`, `email_failed` |
| `limit` | number | 100 | Max records to return (max: 500) |
| `offset` | number | 0 | Pagination offset |
| `since` | string | - | ISO date string for incremental sync (e.g., `2026-01-01T00:00:00Z`) |

**Example Request:**

```javascript
// Get all confirmed registrations
const response = await fetch(
  'https://lso.sst-colombia.com.co/api/external/registrations?status=confirmed&limit=100',
  {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    }
  }
);
const data = await response.json();
```

**Example - Incremental Sync:**

```javascript
// Get registrations created after a specific date
const lastSync = '2026-01-15T00:00:00.000Z';
const response = await fetch(
  `https://lso.sst-colombia.com.co/api/external/registrations?since=${encodeURIComponent(lastSync)}`,
  {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    }
  }
);
```

**Response:**

```json
{
  "ok": true,
  "data": [
    {
      "id": 1,
      "fullName": "Juan Carlos Pérez García",
      "email": "juan.perez@example.com",
      "phone": "3001234567",
      "city": "Bogotá",
      "status": "confirmed",
      "confirmedAt": "2026-01-14T12:30:00.000Z",
      "createdAt": "2026-01-14T11:00:00.000Z"
    },
    {
      "id": 2,
      "fullName": "María López Rodríguez",
      "email": "maria.lopez@example.com",
      "phone": "3109876543",
      "city": "Medellín",
      "status": "confirmed",
      "confirmedAt": "2026-01-15T09:15:00.000Z",
      "createdAt": "2026-01-15T08:45:00.000Z"
    }
  ],
  "total": 2,
  "limit": 100,
  "offset": 0
}
```

**Registration Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Unique registration ID |
| `fullName` | string | Full name of the LSO professional |
| `email` | string | Email address |
| `phone` | string | Phone number |
| `city` | string | City in Colombia |
| `status` | string | Registration status |
| `confirmedAt` | string/null | ISO timestamp when email was confirmed |
| `createdAt` | string | ISO timestamp when registration was created |

> **Note:** New fields may be added in the future. Your integration should handle unknown fields gracefully by ignoring them.

---

### 2. Create Registration

Create a new LSO registration from your portal. The user will receive a confirmation email.

**Endpoint:** `POST /api/external/register`

**Required Permission:** `write`

**Request Body:**

```json
{
  "fullName": "string (required, 3-100 characters)",
  "email": "string (required, valid email)",
  "phone": "string (optional, 7-15 characters)",
  "city": "string (optional)",
  "source": "string (optional, defaults to 'landing_page')"
}
```

**Example Request:**

```javascript
const response = await fetch('https://lso.sst-colombia.com.co/api/external/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    fullName: 'Carlos Andrés Martínez',
    email: 'carlos.martinez@example.com',
    phone: '3201234567',
    city: 'Cali',
    source: 'partner_portal'  // Identify your portal
  })
});

const result = await response.json();
```

**Success Response (201):**

```json
{
  "ok": true,
  "message": "Registration created successfully",
  "registrationId": 123
}
```

**Error Responses:**

| Status | Code | Description |
|--------|------|-------------|
| 400 | - | Invalid request data |
| 401 | - | Missing or invalid API key |
| 403 | `BLOCKED` | Email is blocked due to suspicious activity |
| 409 | `ALREADY_REGISTERED` | Email already registered |
| 409 | `NAME_MISMATCH` | Email registered with a different name |
| 500 | - | Server error |

**Example Error Response:**

```json
{
  "ok": false,
  "code": "ALREADY_REGISTERED",
  "error": "Email already registered"
}
```

---

## Complete Integration Example

Here's a complete example for syncing registrations:

```javascript
// lib/lso-sync.js

const LSO_API_BASE_URL = process.env.LSO_API_BASE_URL;
const LSO_API_KEY = process.env.LSO_API_KEY;

class LsoApiClient {
  constructor() {
    this.baseUrl = LSO_API_BASE_URL;
    this.apiKey = LSO_API_KEY;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    });
    
    const data = await response.json();
    
    if (!data.ok) {
      throw new Error(data.error || 'API request failed');
    }
    
    return data;
  }

  // Get all confirmed registrations with pagination
  async getAllConfirmedRegistrations() {
    const allRegistrations = [];
    let offset = 0;
    const limit = 100;
    
    while (true) {
      const result = await this.request(
        `/api/external/registrations?status=confirmed&limit=${limit}&offset=${offset}`
      );
      
      allRegistrations.push(...result.data);
      
      if (result.data.length < limit) {
        break; // No more pages
      }
      
      offset += limit;
    }
    
    return allRegistrations;
  }

  // Get registrations since last sync
  async getNewRegistrations(sinceDate) {
    const isoDate = sinceDate.toISOString();
    const result = await this.request(
      `/api/external/registrations?status=confirmed&since=${encodeURIComponent(isoDate)}`
    );
    return result.data;
  }

  // Create a new registration
  async createRegistration(data) {
    return this.request('/api/external/register', {
      method: 'POST',
      body: JSON.stringify({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || '',
        city: data.city || '',
        source: 'your_portal_name',
      }),
    });
  }
}

module.exports = { LsoApiClient };
```

**Usage:**

```javascript
const { LsoApiClient } = require('./lib/lso-sync');

const client = new LsoApiClient();

// Full sync
const allRegistrations = await client.getAllConfirmedRegistrations();
console.log(`Found ${allRegistrations.length} confirmed registrations`);

// Incremental sync (get new registrations since last sync)
const lastSyncDate = new Date('2026-01-15T00:00:00Z');
const newRegistrations = await client.getNewRegistrations(lastSyncDate);
console.log(`Found ${newRegistrations.length} new registrations`);

// Create a registration
try {
  const result = await client.createRegistration({
    fullName: 'Ana María González',
    email: 'ana.gonzalez@example.com',
    phone: '3101234567',
    city: 'Barranquilla',
  });
  console.log('Registration created:', result.registrationId);
} catch (error) {
  console.error('Registration failed:', error.message);
}
```

---

## Webhooks (Real-time Updates)

For real-time notifications instead of polling, configure webhooks in the LSO Admin Panel.

**Available Events:**
- `registration.created` - New registration submitted
- `registration.confirmed` - Email confirmed
- `registration.rejected` - Registration rejected by admin
- `registration.deleted` - Registration deleted
- `profile.updated` - LSO profile updated

**Webhook Payload:**

```json
{
  "event": "registration.confirmed",
  "timestamp": "2026-01-29T12:00:00.000Z",
  "data": {
    "id": 123,
    "fullName": "Juan Pérez",
    "email": "juan@example.com",
    "city": "Bogotá"
  }
}
```

**Verifying Webhook Signatures:**

Each webhook includes an `X-Webhook-Signature` header with an HMAC-SHA256 signature:

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// In your webhook handler
app.post('/webhook/lso', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const isValid = verifyWebhookSignature(
    JSON.stringify(req.body),
    signature,
    process.env.WEBHOOK_SECRET
  );
  
  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process the webhook
  const { event, data } = req.body;
  console.log(`Received ${event}:`, data);
  
  res.status(200).send('OK');
});
```

---

## Error Handling Best Practices

```javascript
async function safeApiCall(apiFunction) {
  try {
    return await apiFunction();
  } catch (error) {
    if (error.message.includes('ALREADY_REGISTERED')) {
      // Handle duplicate registration gracefully
      console.log('User already registered, skipping...');
      return null;
    }
    if (error.message.includes('BLOCKED')) {
      // Handle blocked email
      console.warn('Email is blocked, cannot register');
      return null;
    }
    // Re-throw unexpected errors
    throw error;
  }
}
```

---

## Rate Limits

- Maximum 100 requests per minute per API key
- For bulk operations, use pagination with reasonable delays

---

## Security Notes

1. **Never expose your API key in client-side code**
2. Store the API key in environment variables/secrets
3. Use HTTPS for all API requests
4. For production, use JWT tokens with short expiration times
5. Implement webhook signature verification

---

## Support

For API issues or to request additional fields, contact the LSO Directory administrator.
