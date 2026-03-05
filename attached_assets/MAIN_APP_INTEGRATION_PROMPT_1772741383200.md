# Prompt for Main SST-Colombia.com Replit Agent

Copy everything below the `---` line and paste it into the Replit Agent chat on the **main sst-colombia.com** project.

---

## Context

The NGO Portal sidecar at `lso.sst-colombia.com.co/ngo-portal` manages projects where NGO consultants invite companies to onboard into Colombia's SG-SST system. Each company gets assigned a consultant and optionally an LSO (Licenciado en Seguridad y Salud en el Trabajo) supervisor who signs official documents.

When a company finishes registration through a consultant's invitation link, the sidecar fires a **`company.onboarded`** webhook to the main app. Your app already has a **receiving endpoint** at `POST /api/v1/ngo/company-onboarded` in `server/routes.ts` that validates auth, logs the event, and re-triggers the webhook system. **However, it currently only logs — it does NOT persist anything to the database.**

**Important:** The main app already has infrastructure for companies selecting LSO professionals — the `company_contacts` table, the JWT-based company auth flow (`POST /api/external/token`), and the full contact CRUD (`POST/GET/PATCH/DELETE /api/public/contacts`). The NGO integration MUST build on this same foundation. When an NGO company onboards with a pre-assigned LSO, the system should create a `company_contact` record linking that company to the LSO with status `contratado` — exactly the same way a company that found an LSO through the directory search would end up after hiring them.

---

## 1. The webhook payload the sidecar sends

When a company onboards, the sidecar POSTs to `POST /api/v1/ngo/company-onboarded` with this JSON body (authenticated via `Authorization: Bearer <CORE_API_JWT>`):

```json
{
  "event": "company.onboarded",
  "timestamp": "2026-03-05T19:30:00.000Z",
  "data": {
    "ngoId": "clxxx...",
    "projectId": "clyyy...",
    "projectName": "Piloto Medellín 2026",
    "companyId": "clzzz...",
    "companyName": "Transportes Medellín S.A.",
    "companyEmail": "contacto@transportesmedellin.co",
    "ciio": "4923",
    "city": "Medellín",
    "region": "Antioquia",
    "employeesCount": 85,
    "riskLevel": "IV",
    "consultant": {
      "id": "clabc...",
      "name": "María García",
      "email": "maria.garcia@ngo.co"
    },
    "lso": {
      "id": "cldef...",
      "name": "Carlos Rodríguez SST",
      "email": "carlos.r@sst-prof.co",
      "mode": "GLOBAL"
    },
    "couponCode": "NGO2026",
    "inviteId": "clghi..."
  }
}
```

**Field details:**

| Field | Type | Notes |
|---|---|---|
| `ngoId` | string | UUID of the NGO that owns the project (from sidecar) |
| `projectId` | string | UUID of the NGO project (from sidecar) |
| `projectName` | string | Human-readable project name |
| `companyId` | string | UUID of the company in the **sidecar** database |
| `companyName` | string | Required. Company legal name |
| `companyEmail` | string | Required. Primary contact email |
| `ciio` | string or null | CIIU industrial classification code (Colombian standard) |
| `city` | string or null | Company city |
| `region` | string or null | Colombian department (Antioquia, Cundinamarca, etc.) |
| `employeesCount` | number or null | Number of workers |
| `riskLevel` | string or null | ARL risk classification: "I", "II", "III", "IV", or "V" |
| `consultant` | object | Always present. The NGO consultant who manages this company |
| `consultant.id` | string | Consultant UUID in the sidecar |
| `consultant.name` | string | Full name |
| `consultant.email` | string | Email |
| `lso` | object or **null** | The assigned LSO supervisor. **Null** if no LSO was configured for this company |
| `lso.id` | string | LSO UUID in the sidecar |
| `lso.name` | string | Full name of the LSO professional |
| `lso.email` | string | Email — **use this to look up the LSO in `lso_registrations` table** |
| `lso.mode` | string | `"GLOBAL"` (one LSO for whole project) or `"BY_REGION"` (per-region) |
| `couponCode` | string or null | Promotional/scholarship coupon used |
| `inviteId` | string | UUID of the invitation that triggered this onboarding — use for **idempotency** |

---

## 2. What you need to change in `shared/schema.ts`

Add new nullable columns to the **existing** `company_contacts` table to support NGO-sourced contacts. These columns are optional (nullable) so the existing directory-based flow is unaffected:

```typescript
// Add these columns to the EXISTING companyContacts table definition:
  source: varchar("source", { length: 20 }).default("directory"), // "directory" or "ngo"
  ngoProjectId: varchar("ngo_project_id", { length: 100 }),
  ngoProjectName: text("ngo_project_name"),
  ngoCompanyId: varchar("ngo_company_id", { length: 100 }), // sidecar company UUID
  ngoInviteId: varchar("ngo_invite_id", { length: 100 }), // sidecar invite UUID — unique for idempotency
  consultantName: text("consultant_name"),
  consultantEmail: varchar("consultant_email", { length: 255 }),
  couponCode: text("coupon_code"),
  companyEmail: varchar("company_email", { length: 255 }),
  region: varchar("region", { length: 150 }),
  activityCIIU: varchar("activity_ciiu", { length: 20 }),
```

Also add an index for the `ngoInviteId` column for fast idempotency checks:

```typescript
// Add to the table's index array:
  index("idx_company_contacts_ngo_invite").on(table.ngoInviteId),
```

The full table definition should look like this after the change:

```typescript
export const companyContacts = pgTable("company_contacts", {
  id: serial("id").primaryKey(),
  companyId: varchar("company_id", { length: 100 }).notNull(),
  companyName: text("company_name"),
  lsoRegistrationId: integer("lso_registration_id").notNull().references(() => lsoRegistrations.id),
  status: varchar("status", { length: 50 }).default("contactado").notNull(),
  notes: text("notes"),
  riskLevel: varchar("risk_level", { length: 50 }),
  employeeCount: integer("employee_count"),
  city: varchar("city", { length: 150 }),
  contactedAt: timestamp("contacted_at").defaultNow().notNull(),
  lastActionAt: timestamp("last_action_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  // NGO onboarding fields (nullable — only set for NGO-sourced contacts)
  source: varchar("source", { length: 20 }).default("directory"),
  ngoProjectId: varchar("ngo_project_id", { length: 100 }),
  ngoProjectName: text("ngo_project_name"),
  ngoCompanyId: varchar("ngo_company_id", { length: 100 }),
  ngoInviteId: varchar("ngo_invite_id", { length: 100 }),
  consultantName: text("consultant_name"),
  consultantEmail: varchar("consultant_email", { length: 255 }),
  couponCode: text("coupon_code"),
  companyEmail: varchar("company_email", { length: 255 }),
  region: varchar("region", { length: 150 }),
  activityCIIU: varchar("activity_ciiu", { length: 20 }),
}, (table) => [
  index("idx_company_contacts_company").on(table.companyId),
  index("idx_company_contacts_lso").on(table.lsoRegistrationId),
  index("idx_company_contacts_ngo_invite").on(table.ngoInviteId),
]);
```

After editing, run `npm run db:push` to sync the schema. The new columns are all nullable, so existing data is unaffected.

---

## 3. What you need to add to `server/storage.ts`

Add one new method to the `IStorage` interface and the `DatabaseStorage` implementation for idempotency:

```typescript
// In IStorage interface:
getCompanyContactByNgoInviteId(ngoInviteId: string): Promise<CompanyContact | null>;

// In DatabaseStorage class:
async getCompanyContactByNgoInviteId(ngoInviteId: string): Promise<CompanyContact | null> {
  const [contact] = await db
    .select()
    .from(companyContacts)
    .where(eq(companyContacts.ngoInviteId, ngoInviteId))
    .limit(1);
  return contact ?? null;
}
```

The existing `createCompanyContact` method will automatically work with the new columns since `InsertCompanyContact` is derived from the schema.

---

## 4. What you need to change in `server/routes.ts`

Replace the body of the existing `POST /api/v1/ngo/company-onboarded` handler (inside the `try { ... }` block) with the implementation below. The endpoint skeleton, auth middleware (`validateExternalAuth("write")`), and rate limiter are already in place — only replace the inner logic:

```typescript
app.post("/api/v1/ngo/company-onboarded", externalApiRateLimiter, validateExternalAuth("write"), async (req: AuthenticatedRequest, res) => {
  try {
    const { event, data } = req.body;
    if (event !== "company.onboarded" || !data) {
      return res.status(400).json({ ok: false, error: "Invalid payload" });
    }

    const {
      ngoId, projectId, projectName,
      companyId, companyName, companyEmail,
      ciio, city, region, employeesCount, riskLevel,
      consultant, lso, couponCode, inviteId,
    } = data;

    if (!companyName || !companyEmail || !projectId || !inviteId) {
      return res.status(400).json({ ok: false, error: "Missing required fields" });
    }

    // ── Idempotency: check if this invite was already processed ──
    const existing = await storage.getCompanyContactByNgoInviteId(inviteId);
    if (existing) {
      console.log(`[company.onboarded] Duplicate event for invite ${inviteId}, returning existing contact #${existing.id}`);
      return res.json({
        ok: true,
        message: "Already processed",
        companyId,
        coreCompanyId: existing.id,
      });
    }

    // ── Resolve the LSO in lso_registrations by email ──
    let lsoRegistrationId: number | null = null;
    if (lso?.email) {
      const lsoRecord = await storage.getLsoRegistrationByEmail(lso.email.toLowerCase());
      if (lsoRecord) {
        lsoRegistrationId = lsoRecord.id;
      } else {
        console.warn(
          `[company.onboarded] LSO "${lso.name}" (${lso.email}) not found in lso_registrations` +
          ` — cannot create company_contact link. Company "${companyName}" will be logged but not linked.`
        );
      }
    }

    // ── Create company_contact record (only if we have an LSO to link to) ──
    let contactRecord = null;
    if (lsoRegistrationId) {
      // Use the sidecar's companyId as the companyId (same role as JWT clientId for directory-sourced contacts)
      contactRecord = await storage.createCompanyContact({
        companyId: `ngo-${companyId}`,
        companyName,
        lsoRegistrationId,
        status: "contratado",
        notes: `Asignado vía proyecto NGO "${projectName}". Consultor: ${consultant?.name || "N/A"} (${consultant?.email || "N/A"}).` +
               (couponCode ? ` Cupón: ${couponCode}.` : "") +
               (lso?.mode ? ` Modo LSO: ${lso.mode}.` : ""),
        riskLevel: riskLevel || null,
        employeeCount: employeesCount || null,
        city: city || null,
        // NGO-specific fields
        source: "ngo",
        ngoProjectId: projectId,
        ngoProjectName: projectName,
        ngoCompanyId: companyId,
        ngoInviteId: inviteId,
        consultantName: consultant?.name || null,
        consultantEmail: consultant?.email || null,
        couponCode: couponCode || null,
        companyEmail: companyEmail.toLowerCase(),
        region: region || null,
        activityCIIU: ciio || null,
      });

      console.log(
        `[company.onboarded] Created company_contact #${contactRecord.id} → ` +
        `company "${companyName}" (${companyEmail}) linked to LSO #${lsoRegistrationId}` +
        ` in project "${projectName}" — status: contratado`
      );
    } else {
      console.log(
        `[company.onboarded] Company "${companyName}" (${companyEmail}) onboarded` +
        ` into project "${projectName}" but no LSO link created` +
        (lso ? ` (LSO "${lso.name}" not in registry)` : " (no LSO assigned)")
      );
    }

    // ── Re-trigger webhooks for any external subscribers ──
    await triggerWebhooks("company.onboarded" as any, {
      ngoId, projectId, projectName,
      companyId, companyName, companyEmail,
      ciio, city, region, employeesCount, riskLevel,
      consultant, lso, couponCode, inviteId,
      coreCompanyId: contactRecord?.id || null,
      lsoRegistrationId,
    });

    return res.json({
      ok: true,
      message: lsoRegistrationId
        ? "Company onboarded and linked to LSO"
        : "Company onboarded (no LSO link — LSO not in registry)",
      companyId,
      coreCompanyId: contactRecord?.id || null,
      lsoRegistrationId,
    });
  } catch (error) {
    console.error("[company.onboarded] error:", error);
    return res.status(500).json({ ok: false, error: "Internal error processing onboarding event" });
  }
});
```

---

## 5. Check if `getLsoRegistrationByEmail` exists in storage

The handler above calls `storage.getLsoRegistrationByEmail()`. This method may or may not already exist. Check `server/storage.ts` for it. If it doesn't exist, add it:

```typescript
// In IStorage interface:
getLsoRegistrationByEmail(email: string): Promise<LsoRegistration | undefined>;

// In DatabaseStorage class:
async getLsoRegistrationByEmail(email: string): Promise<LsoRegistration | undefined> {
  const [registration] = await db
    .select()
    .from(lsoRegistrations)
    .where(eq(lsoRegistrations.email, email))
    .limit(1);
  return registration;
}
```

If the method already exists (perhaps under a different name), use the existing one instead.

---

## 6. How this connects to the existing system

Here's how the NGO flow maps to the existing company→LSO flow:

| Existing directory flow | NGO onboarding flow |
|---|---|
| Company gets JWT via `POST /api/external/token` | Sidecar sends webhook to `POST /api/v1/ngo/company-onboarded` |
| Company searches LSOs via `/api/public/search` | LSO is pre-assigned at invite creation time |
| Company contacts LSO via `POST /api/public/contacts` → status `contactado` | Webhook handler creates `company_contact` → status **`contratado`** (already hired) |
| Company updates status via `PATCH /api/public/contacts/:id` → eventually `contratado` | No status progression needed — direct to `contratado` |
| `companyId` = JWT `clientId` from sst-colombia.com | `companyId` = `ngo-{sidecarCompanyId}` (prefixed to avoid collisions) |
| `source` column = `"directory"` (default) | `source` column = `"ngo"` |
| NGO-specific fields are null | `ngoProjectId`, `ngoProjectName`, `consultantName`, etc. are populated |

**Key design decisions:**
1. The `companyId` is prefixed with `ngo-` to avoid collisions with JWT-issued `clientId` values from the directory flow.
2. The status is set directly to `contratado` because the LSO assignment is already finalized by the NGO — no negotiation phase.
3. NGO-specific metadata (project, consultant, coupon) lives in the new nullable columns, invisible to the existing directory flow.
4. If the LSO's email isn't found in `lso_registrations`, no `company_contact` is created — the event is logged but doesn't fail. The LSO may not have registered in the directory yet.

---

## 7. Safety rules

1. **Idempotency**: The handler checks `ngoInviteId` uniqueness before inserting. If the same invite is sent twice (e.g., network retry), it returns the existing record.

2. **LSO not found is NOT a failure**: If `lso.email` doesn't match any record in `lso_registrations`, the webhook returns success but with `coreCompanyId: null`. The company can be linked later when the LSO registers.

3. **Do NOT modify** the `validateExternalAuth` middleware, the `externalApiRateLimiter`, or the existing `POST /api/public/contacts` endpoint. Those work correctly for the directory flow.

4. **Do NOT modify** the `lso_registrations` table schema.

5. **Do NOT change** the `lsoRegistrationId` column from `notNull` — it must remain required. NGO contacts without an LSO simply don't get a `company_contact` record.

6. The new columns on `company_contacts` are all **nullable** with a **default** on `source`, so existing data and the existing directory flow are completely unaffected.

7. After editing the schema, run `npm run db:push` to sync the database. Do NOT manually write SQL migrations.

---

## 8. Field mapping: sidecar payload → company_contacts columns

| Sidecar payload field | `company_contacts` column | Notes |
|---|---|---|
| `data.companyId` | `ngo_company_id` | Sidecar UUID, stored for cross-reference |
| `"ngo-" + data.companyId` | `company_id` | Prefixed to avoid collision with directory clientIds |
| `data.companyName` | `company_name` | Display name |
| `data.companyEmail` | `company_email` | New column for NGO contacts |
| `data.inviteId` | `ngo_invite_id` | Used for idempotency check |
| `data.projectId` | `ngo_project_id` | For project filtering |
| `data.projectName` | `ngo_project_name` | Display name |
| `data.ciio` | `activity_ciiu` | CIIU industrial code |
| `data.city` | `city` | Existing column |
| `data.region` | `region` | New column for department |
| `data.employeesCount` | `employee_count` | Existing column |
| `data.riskLevel` | `risk_level` | Existing column |
| `data.consultant.name` | `consultant_name` | New column |
| `data.consultant.email` | `consultant_email` | New column |
| `data.lso.email` → lookup | `lso_registration_id` | FK to `lso_registrations.id` via email lookup |
| `data.couponCode` | `coupon_code` | New column |
| `"ngo"` (hardcoded) | `source` | Distinguishes from `"directory"` |
| `"contratado"` (hardcoded) | `status` | LSO already assigned, no negotiation |

---

## 9. Admin dashboard considerations

The admin panel already has access to `company_contacts` via `getAllCompanyContacts()`. After this change:

- NGO-sourced contacts will appear alongside directory-sourced contacts
- You can filter by `source = "ngo"` to show only NGO companies
- You can filter by `ngoProjectId` to show companies from a specific NGO project
- The `consultantName` and `couponCode` fields provide extra context for NGO-sourced contacts

If you want to add a dedicated NGO section in the admin panel, you can query:
```typescript
const ngoContacts = allContacts.filter(c => c.source === "ngo");
```

---

## 10. Testing

After implementing, test with this curl command (replace `YOUR_JWT` with your actual `CORE_API_JWT` value, and use a real LSO email from your `lso_registrations` table):

```bash
# Test 1: NGO company with an LSO that EXISTS in the registry
curl -X POST http://localhost:5000/api/v1/ngo/company-onboarded \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT" \
  -d '{
    "event": "company.onboarded",
    "timestamp": "2026-03-05T20:00:00.000Z",
    "data": {
      "ngoId": "test-ngo-001",
      "projectId": "test-project-001",
      "projectName": "Piloto Test 2026",
      "companyId": "test-company-001",
      "companyName": "Empresa Test S.A.S.",
      "companyEmail": "test@empresatest.co",
      "ciio": "4921",
      "city": "Bogotá",
      "region": "Bogotá D.C.",
      "employeesCount": 25,
      "riskLevel": "III",
      "consultant": {
        "id": "test-consultant-001",
        "name": "María García",
        "email": "maria@consultant.co"
      },
      "lso": {
        "id": "test-lso-001",
        "name": "REPLACE_WITH_REAL_LSO_NAME",
        "email": "REPLACE_WITH_REAL_LSO_EMAIL",
        "mode": "GLOBAL"
      },
      "couponCode": "TEST2026",
      "inviteId": "test-invite-001"
    }
  }'
```

Expected response (LSO found):
```json
{
  "ok": true,
  "message": "Company onboarded and linked to LSO",
  "companyId": "test-company-001",
  "coreCompanyId": 123,
  "lsoRegistrationId": 45
}
```

```bash
# Test 2: Send the SAME request again (idempotency)
# Expected: "Already processed" with same coreCompanyId
```

```bash
# Test 3: NGO company with NO LSO
curl -X POST http://localhost:5000/api/v1/ngo/company-onboarded \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT" \
  -d '{
    "event": "company.onboarded",
    "timestamp": "2026-03-05T20:00:00.000Z",
    "data": {
      "ngoId": "test-ngo-001",
      "projectId": "test-project-001",
      "projectName": "Piloto Test 2026",
      "companyId": "test-company-002",
      "companyName": "Empresa Sin LSO S.A.S.",
      "companyEmail": "nolso@empresa.co",
      "ciio": "4921",
      "city": "Medellín",
      "region": "Antioquia",
      "employeesCount": 10,
      "riskLevel": "II",
      "consultant": {
        "id": "test-consultant-001",
        "name": "María García",
        "email": "maria@consultant.co"
      },
      "lso": null,
      "couponCode": null,
      "inviteId": "test-invite-002"
    }
  }'
```

Expected response (no LSO):
```json
{
  "ok": true,
  "message": "Company onboarded (no LSO link — LSO not in registry)",
  "companyId": "test-company-002",
  "coreCompanyId": null,
  "lsoRegistrationId": null
}
```

After testing, verify that the new `company_contact` record appears in the admin panel alongside the directory-sourced contacts, and that the `source` column shows `"ngo"`.
