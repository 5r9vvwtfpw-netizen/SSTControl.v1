## Context

When a company completes registration through a consultant's invitation link in the NGO Portal, the sidecar sends a `company.onboarded` webhook to `POST /api/v1/ngo/company-onboarded` on this app. This endpoint needs to be created from scratch.

The sidecar authenticates using a shared secret JWT stored in the `CORE_API_JWT` environment variable. This same variable is already set on the sidecar side.

---

## Step 1 — Add `CORE_API_JWT` to your environment secrets

Check if `CORE_API_JWT` already exists as a secret. If not, create it with the same value that is set on the NGO sidecar project. Both sides must share the exact same value. It is used to authenticate webhook requests from the sidecar.

Also ensure `CORE_API_JWT_ISSUER` is set (or default to `"ngo-sidecar"`). The sidecar signs tokens with issuer `"ngo-sidecar"` and the main app must verify against the same issuer.

---

## Step 2 — Create the `ngo_onboarded_companies` table in your Drizzle schema

In `shared/schema.ts` (or wherever your Drizzle tables are defined), add this new table. It is completely standalone — no foreign keys to existing tables are required, though an optional link to an LSO record is included:

```typescript
import { pgTable, serial, varchar, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const ngoOnboardedCompanies = pgTable("ngo_onboarded_companies", {
  id: serial("id").primaryKey(),

  // Sidecar cross-reference IDs
  sidecarCompanyId: varchar("sidecar_company_id", { length: 100 }).notNull(),
  sidecarInviteId:  varchar("sidecar_invite_id",  { length: 100 }).notNull().unique(), // idempotency key
  ngoId:            varchar("ngo_id",             { length: 100 }).notNull(),
  projectId:        varchar("project_id",         { length: 100 }).notNull(),
  projectName:      text("project_name").notNull(),

  // Company data (as received from sidecar)
  companyName:    text("company_name").notNull(),
  companyEmail:   varchar("company_email",  { length: 255 }).notNull(),
  ciio:           text("ciio"),
  city:           text("city"),
  region:         text("region"),
  employeesCount: integer("employees_count"),
  riskLevel:      varchar("risk_level", { length: 10 }),

  // Consultant info
  consultantName:      text("consultant_name").notNull(),
  consultantEmail:     varchar("consultant_email",     { length: 255 }).notNull(),
  consultantSidecarId: varchar("consultant_sidecar_id", { length: 100 }).notNull(),

  // LSO info (nullable — the LSO may not be assigned yet)
  lsoEmail:          varchar("lso_email",          { length: 255 }),
  lsoName:           text("lso_name"),
  lsoMode:           varchar("lso_mode",           { length: 20 }),
  lsoSidecarId:      varchar("lso_sidecar_id",     { length: 100 }),
  // Optional: link to your local LSO record if you have one
  lsoLocalRecordId:  integer("lso_local_record_id"),

  // Coupon/promo
  couponCode: text("coupon_code"),

  // Timestamps
  onboardedAt: timestamp("onboarded_at").notNull(),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_ngo_company_email").on(table.companyEmail),
  index("idx_ngo_company_project").on(table.projectId),
  index("idx_ngo_company_invite").on(table.sidecarInviteId),
]);

export const insertNgoOnboardedCompanySchema = createInsertSchema(ngoOnboardedCompanies).omit({
  id: true,
  createdAt: true,
});
export type InsertNgoOnboardedCompany = z.infer<typeof insertNgoOnboardedCompanySchema>;
export type NgoOnboardedCompany = typeof ngoOnboardedCompanies.$inferSelect;
```

After adding the table, run:
```bash
npm run db:push
```

---

## Step 3 — Add storage methods

In your storage interface and implementation (wherever you have other CRUD methods), add:

```typescript
// Interface
createNgoOnboardedCompany(data: InsertNgoOnboardedCompany): Promise<NgoOnboardedCompany>;
getNgoOnboardedCompanyByInviteId(sidecarInviteId: string): Promise<NgoOnboardedCompany | undefined>;
listNgoOnboardedCompanies(filters?: { projectId?: string; region?: string }): Promise<NgoOnboardedCompany[]>;

// Implementation (using Drizzle)
async createNgoOnboardedCompany(data: InsertNgoOnboardedCompany): Promise<NgoOnboardedCompany> {
  const [record] = await db.insert(ngoOnboardedCompanies).values(data).returning();
  return record;
}

async getNgoOnboardedCompanyByInviteId(sidecarInviteId: string): Promise<NgoOnboardedCompany | undefined> {
  const [record] = await db
    .select()
    .from(ngoOnboardedCompanies)
    .where(eq(ngoOnboardedCompanies.sidecarInviteId, sidecarInviteId))
    .limit(1);
  return record;
}

async listNgoOnboardedCompanies(filters?: { projectId?: string; region?: string }): Promise<NgoOnboardedCompany[]> {
  const conditions = [];
  if (filters?.projectId) conditions.push(eq(ngoOnboardedCompanies.projectId, filters.projectId));
  if (filters?.region)    conditions.push(eq(ngoOnboardedCompanies.region, filters.region));
  return db
    .select()
    .from(ngoOnboardedCompanies)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(ngoOnboardedCompanies.createdAt));
}
```

---

## Step 4 — Create the webhook endpoint

Add this endpoint to your Express app. It does not depend on any pre-existing auth middleware — it has its own simple JWT verification using the shared `CORE_API_JWT` secret:

```typescript
import jwt from "jsonwebtoken";

// POST /api/v1/ngo/company-onboarded
app.post("/api/v1/ngo/company-onboarded", async (req, res) => {
  try {
    // ── Auth: verify the sidecar's Bearer JWT ──
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ ok: false, error: "Missing authorization header" });
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.CORE_API_JWT;
    if (!jwtSecret) {
      console.error("[company.onboarded] CORE_API_JWT secret not configured");
      return res.status(500).json({ ok: false, error: "Server misconfigured" });
    }

    let tokenPayload: any;
    try {
      tokenPayload = jwt.verify(token, jwtSecret);
    } catch (err) {
      return res.status(401).json({ ok: false, error: "Invalid or expired token" });
    }

    // Verify the token has write permission
    if (!tokenPayload?.permissions?.includes("write") && !tokenPayload?.permissions?.includes("*")) {
      return res.status(403).json({ ok: false, error: "Insufficient permissions" });
    }

    // ── Validate payload ──
    const { event, data } = req.body;
    if (event !== "company.onboarded" || !data) {
      return res.status(400).json({ ok: false, error: "Invalid payload: expected event=company.onboarded" });
    }

    const {
      ngoId, projectId, projectName,
      companyId, companyName, companyEmail,
      ciio, city, region, employeesCount, riskLevel,
      consultant, lso, couponCode, inviteId,
    } = data;

    if (!companyName || !companyEmail || !projectId || !inviteId || !consultant) {
      return res.status(400).json({ ok: false, error: "Missing required fields: companyName, companyEmail, projectId, inviteId, consultant" });
    }

    // ── Idempotency: check if this invite was already processed ──
    const existing = await storage.getNgoOnboardedCompanyByInviteId(inviteId);
    if (existing) {
      console.log(`[company.onboarded] Duplicate event for invite ${inviteId} — returning existing record #${existing.id}`);
      return res.json({
        ok: true,
        message: "Already processed",
        companyId,
        coreCompanyId: existing.id,
      });
    }

    // ── Optional: try to link to a local LSO record by email ──
    // If you have an LSO table in your database, look up by lso.email here.
    // If not, just store lso.email as a string reference — no LSO lookup required.
    let lsoLocalRecordId: number | null = null;
    if (lso?.email) {
      // Uncomment and adapt if you have a local LSO table:
      // const lsoRecord = await storage.getLsoByEmail(lso.email.toLowerCase());
      // if (lsoRecord) lsoLocalRecordId = lsoRecord.id;
      // else console.warn(`[company.onboarded] LSO "${lso.name}" (${lso.email}) not found locally`);
    }

    // ── Persist the onboarded company ──
    const record = await storage.createNgoOnboardedCompany({
      sidecarCompanyId:    companyId,
      sidecarInviteId:     inviteId,
      ngoId:               ngoId,
      projectId:           projectId,
      projectName:         projectName,
      companyName:         companyName,
      companyEmail:        companyEmail.toLowerCase(),
      ciio:                ciio         ?? null,
      city:                city         ?? null,
      region:              region       ?? null,
      employeesCount:      employeesCount ?? null,
      riskLevel:           riskLevel    ?? null,
      consultantName:      consultant.name,
      consultantEmail:     consultant.email,
      consultantSidecarId: consultant.id,
      lsoEmail:            lso?.email   ?? null,
      lsoName:             lso?.name    ?? null,
      lsoMode:             lso?.mode    ?? null,
      lsoSidecarId:        lso?.id      ?? null,
      lsoLocalRecordId:    lsoLocalRecordId,
      couponCode:          couponCode   ?? null,
      onboardedAt:         new Date(data.timestamp ?? Date.now()),
    });

    console.log(
      `[company.onboarded] Persisted record #${record.id}` +
      ` — company "${companyName}" (${companyEmail})` +
      ` in project "${projectName}"` +
      ` by consultant "${consultant.name}"` +
      (lso ? ` — LSO: "${lso.name}" (${lso.email}, ${lso.mode})` : " — no LSO") +
      (couponCode ? ` — coupon: ${couponCode}` : "")
    );

    return res.json({
      ok: true,
      message: "Company onboarded successfully",
      companyId,
      coreCompanyId: record.id,
    });

  } catch (error) {
    console.error("[company.onboarded] Error:", error);
    return res.status(500).json({ ok: false, error: "Internal server error" });
  }
});
```

---

## Step 5 — What the sidecar expects back

The sidecar reads `coreCompanyId` from your response and uses it for cross-referencing. Always return:

```json
{
  "ok": true,
  "message": "...",
  "companyId": "...",
  "coreCompanyId": 123
}
```

---

## Step 6 — Token format

The sidecar generates the `CORE_API_JWT` using `jwt.sign()` with:
- `secret`: value of `CORE_API_JWT` environment variable (shared between both systems)
- `payload`: `{ permissions: ["write"], iss: "ngo-sidecar" }`
- `expiresIn`: `"1h"` (a new token is generated per request)

Your verification just needs to call `jwt.verify(token, process.env.CORE_API_JWT)` — the library handles expiry automatically.

---

## Step 7 — Optional LSO local record linkage

If you have an existing table of LSO professionals (e.g. from the external LSO Directory API integration in `server/routes-lso-directory.ts`), you can link the onboarded company to the local LSO record by matching on `lso.email`. 

To do this:
1. Add a storage method `getLsoByEmail(email: string)` that queries your local LSO table
2. Uncomment the relevant lines in Step 4
3. The `lsoLocalRecordId` column will then hold the FK to your LSO table

This is optional — the integration works correctly without this link. The sidecar stores its own copy of the LSO assignment.

---

## Step 8 — Testing

Once implemented, test with:

```bash
# Generate a test JWT first (replace YOUR_SECRET with the actual CORE_API_JWT value)
node -e "const jwt=require('jsonwebtoken'); console.log(jwt.sign({permissions:['write'],iss:'ngo-sidecar'}, 'YOUR_SECRET', {expiresIn:'1h'}))"

# Then POST with that token
curl -X POST http://localhost:PORT/api/v1/ngo/company-onboarded \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_FROM_ABOVE" \
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
        "name": "Carlos Rodríguez SST",
        "email": "carlos@sst-prof.co",
        "mode": "GLOBAL"
      },
      "couponCode": "TEST2026",
      "inviteId": "test-invite-unique-001"
    }
  }'
```

Expected first call:
```json
{ "ok": true, "message": "Company onboarded successfully", "companyId": "test-company-001", "coreCompanyId": 1 }
```

Expected second call (same `inviteId`):
```json
{ "ok": true, "message": "Already processed", "companyId": "test-company-001", "coreCompanyId": 1 }
```

---

## Summary of what this creates

| What | Where | Notes |
|---|---|---|
| `ngo_onboarded_companies` table | `shared/schema.ts` | New standalone table, no dependencies |
| 3 storage methods | `server/storage.ts` | create, getByInviteId, list |
| `POST /api/v1/ngo/company-onboarded` endpoint | `server/routes.ts` (or equivalent) | Self-contained JWT auth, idempotent |
| `CORE_API_JWT` secret | Environment secrets | Must match the value on the NGO sidecar |

No existing tables or middleware need to be modified.
