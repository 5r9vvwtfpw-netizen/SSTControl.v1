
PRICING MODULE PLUG-IN SPECIFICATION FOR REPLIT AI

IMPORTANT CONSTRAINTS

1. This project must be implemented as a non-invasive PLUG-IN MODULE to the existing program.
2. You MUST NOT:
   - Change or delete any existing business logic.
   - Change or delete any existing database tables, columns, constraints, or triggers.
   - Change or remove any existing API endpoints, routes, or handlers.
3. You MAY:
   - Add new modules/files.
   - Add new API endpoints that are clearly namespaced.
   - Add new database tables and, if absolutely necessary, new columns (but NEVER modify or drop existing ones).
4. All new code must be written so that:
   - It can be enabled/disabled without breaking the current application.
   - It can be safely tested in isolation (e.g. behind a feature flag, config toggle, or dedicated routes).
5. The goal is to plug in a pricing & subscription module alongside the existing program, NOT to refactor or rebuild it.

You are an AI developer working in Replit. Read this specification and implement the requested functionality as a PLUG-IN only.

------------------------------------------------
1. BUSINESS CONTEXT
------------------------------------------------

I sell an online software product on a license-based monthly subscription.

Pricing depends on the number of employees of the client company and uses tiers.

There are 4 employee tiers:
- 1 to 10 employees
- 11 to 49 employees
- 50 to 199 employees
- 200 or more employees

Key rule:
- Companies from 1 to 10 employees: pay a minimum fixed monthly fee PLUS a per-employee license fee.
- Companies of 11 or more employees: pay only a per-employee license fee with NO minimum fee.

The plug-in must support:
1. An online simulator: potential customers enter their number of employees and see their estimated monthly total cost and effective cost per employee.
2. Admin configuration: I can set and later update the pricing values.
3. Recurring billing: every month, the system uses the stored pricing values and the stored number of licensed employees per customer to compute the monthly invoice amount and trigger a payment (for now: mock or stub payment, but keep the structure compatible with Stripe or similar).

This must be done without breaking or changing existing logic.

------------------------------------------------
2. ARCHITECTURE & INTEGRATION STRATEGY
------------------------------------------------

You must treat this as a plug-in / add-on module.

2.1. General approach

- Create a new folder/module, for example:
  - /pricing_plugin
- All new backend logic, routes, database access, and scheduled billing should live under this folder or its submodules.
- Existing modules should only be touched minimally:
  - You may add imports and route mounting (e.g. app.use("/api/pricing-plugin", pricingRouter)) BUT must not alter existing behavior.
- Any integration with the existing database must be additive:
  - New tables are allowed.
  - New columns are allowed (only if really needed).
  - No changes to existing constraints or data types.
  - No drops, renames, or destructive migrations.

2.2. Safe testing / isolation

- All new routes must be namespaced, for example:
  - Public simulator:    /api/pricing-plugin/calculate
  - Admin endpoints:     /api/pricing-plugin/admin/...
  - Subscription routes: /api/pricing-plugin/subscriptions/...
- Do not reuse existing route paths.
- Introduce a simple config flag, e.g.:
  - ENABLE_PRICING_PLUGIN = true/false
- If ENABLE_PRICING_PLUGIN is false:
  - Do not mount any of the plug-in routes.
  - Do not run the recurring billing job.
- This allows testing in a staging environment or with the flag disabled, without impacting the current system.

------------------------------------------------
3. PRICING PARAMETERS
------------------------------------------------

These values must be configurable in an admin interface or through an internal API.

Global pricing parameters (same for all customers for now):
- MIN_FEE_SMALL: minimum monthly fee for companies between 1 and 10 employees
- PRICE_1_10: price per license per employee per month for 1 to 10 employees
- PRICE_11_49: price per license per employee per month for 11 to 49 employees
- PRICE_50_199: price per license per employee per month for 50 to 199 employees
- PRICE_200_PLUS: price per license per employee per month for 200 or more employees

Later this may become customer-specific, but for now treat them as global configuration.

------------------------------------------------
4. TIER AND PRICING LOGIC
------------------------------------------------

Input:
- employee_count: integer >= 1

Tier selection logic:

If employee_count between 1 and 10 inclusive:
- tier = "1-10"

If employee_count between 11 and 49 inclusive:
- tier = "11-49"

If employee_count between 50 and 199 inclusive:
- tier = "50-199"

If employee_count >= 200:
- tier = "200+"

Calculation rules:

Case A. employee_count between 1 and 10:
- monthly_cost = MIN_FEE_SMALL + (employee_count * PRICE_1_10)
- price_per_license = PRICE_1_10
- minimum_fee_applied = MIN_FEE_SMALL
- cost_per_employee = monthly_cost / employee_count

Case B. employee_count between 11 and 49:
- monthly_cost = employee_count * PRICE_11_49
- price_per_license = PRICE_11_49
- minimum_fee_applied = 0
- cost_per_employee = price_per_license

Case C. employee_count between 50 and 199:
- monthly_cost = employee_count * PRICE_50_199
- price_per_license = PRICE_50_199
- minimum_fee_applied = 0
- cost_per_employee = price_per_license

Case D. employee_count 200 or more:
- monthly_cost = employee_count * PRICE_200_PLUS
- price_per_license = PRICE_200_PLUS
- minimum_fee_applied = 0
- cost_per_employee = price_per_license

Result object for any calculation:
- tier: string
- employee_count: integer
- price_per_license: number
- minimum_fee: number
- monthly_cost: number
- cost_per_employee: number

Implement this logic in a reusable function, for example:
- Node:   calculatePricing(employees, config)
- Python: calculate_pricing(employees, config)

This function must NOT depend on any existing legacy logic, so it can be tested in isolation.

------------------------------------------------
5. DATABASE INTEGRATION (NON-DESTRUCTIVE)
------------------------------------------------

Assume there is already a customers (or companies) table in the existing program.

You must only add to the DB, never modify or remove existing entities.

5.1. New table: pricing_config

Purpose: store current global pricing parameters.

Fields:
- id: primary key
- min_fee_small: decimal
- price_1_10: decimal
- price_11_49: decimal
- price_50_199: decimal
- price_200_plus: decimal
- currency: string (e.g. "EUR")
- is_active: boolean
- valid_from: datetime (optional, for future versioning)
- created_at: datetime
- updated_at: datetime

Behavior:
- At any time there should be exactly one active configuration.
- The plug-in code enforces this by marking others inactive when a new one is created.

5.2. New table: subscriptions

Purpose: store subscription information per customer for billing.

Fields:
- id: primary key
- customer_id: foreign key to existing customers table
- employee_count: integer (number of licensed employees used for billing)
- pricing_config_id: foreign key to pricing_config (which config is used)
- tier: string ("1-10", "11-49", "50-199", "200+")
- monthly_cost: decimal (last calculated monthly amount)
- price_per_license: decimal
- minimum_fee: decimal
- status: string ("active", "paused", "cancelled")
- created_at: datetime
- updated_at: datetime

5.3. New table: invoices

Purpose: record monthly invoices generated for each subscription.

Fields:
- id: primary key
- subscription_id: foreign key to subscriptions
- customer_id: foreign key to customers
- period_start: date
- period_end: date
- employee_count_billed: integer
- tier: string
- monthly_cost: decimal
- price_per_license: decimal
- minimum_fee: decimal
- payment_status: string ("pending", "paid", "failed")
- payment_reference: string (gateway id if integrated later)
- created_at: datetime

If the existing DB already has invoices or subscriptions, mirror these fields within that structure instead of altering existing business logic.

------------------------------------------------
6. BACKEND API DESIGN (NAMESPACED, PLUG-IN ONLY)
------------------------------------------------

All endpoints must be namespaced to avoid collisions, for example:

Base path: /api/pricing-plugin

6.1. Public endpoint: pricing simulation

POST /api/pricing-plugin/calculate

Request JSON:
{
  "employees": 37
}

Behavior:
- Fetch active pricing_config from the plug-in tables.
- Run the pricing logic.
- Return the result.

Response JSON:
{
  "tier": "11-49",
  "employee_count": 37,
  "price_per_license": 5,
  "minimum_fee": 0,
  "monthly_cost": 185,
  "cost_per_employee": 5,
  "currency": "EUR"
}

6.2. Admin endpoint: get current pricing configuration

GET /api/pricing-plugin/admin/pricing

Response JSON:
{
  "min_fee_small": 49,
  "price_1_10": 6,
  "price_11_49": 5,
  "price_50_199": 4,
  "price_200_plus": 3,
  "currency": "EUR"
}

6.3. Admin endpoint: update pricing configuration

POST /api/pricing-plugin/admin/pricing

Request JSON:
{
  "min_fee_small": 49,
  "price_1_10": 6,
  "price_11_49": 5,
  "price_50_199": 4,
  "price_200_plus": 3,
  "currency": "EUR"
}

Behavior:
- Insert a new pricing_config row as active.
- Mark previous active row(s) as inactive.
- Validate that all numeric values are positive.

Response JSON:
{
  "success": true,
  "pricing_config_id": 3
}

6.4. Create or update a subscription

POST /api/pricing-plugin/subscriptions

Request JSON:
{
  "customer_id": 123,
  "employees": 37
}

Behavior:
- Fetch active pricing_config.
- Compute pricing using pricing logic.
- Create or update a subscription row for this customer in the plug-in table.
- Store employee_count, tier, price_per_license, minimum_fee, monthly_cost, pricing_config_id.
- Do NOT alter any existing subscription logic outside this plug-in.

Response JSON:
{
  "subscription_id": 987,
  "customer_id": 123,
  "employee_count": 37,
  "tier": "11-49",
  "price_per_license": 5,
  "minimum_fee": 0,
  "monthly_cost": 185,
  "currency": "EUR",
  "status": "active"
}

6.5. List subscriptions for admin

GET /api/pricing-plugin/admin/subscriptions

Optional query parameters: page, page_size, customer_id

Response: list of plug-in subscription records.

6.6. Generate invoice manually for a subscription (test only)

POST /api/pricing-plugin/admin/subscriptions/{subscription_id}/generate-invoice

Behavior:
- Use the subscription’s stored values.
- Create an invoice record for the current billing period.
- Set payment_status = "pending".
- Do NOT call any real payment gateway yet.

Return: invoice object.

------------------------------------------------
7. RECURRING BILLING LOGIC (ISOLATED)
------------------------------------------------

Implement a recurring billing job as part of the plug-in only.

- It can be a function like runPricingPluginBillingJob().
- The main application can optionally schedule this, e.g. by cron or a scheduler.

Pseudo-logic:

For each active subscription in the plug-in:
  - Check if there is already an invoice for the current billing period.
  - If not, create a new invoice row with:
    - employee_count_billed, tier, monthly_cost, price_per_license, minimum_fee
    - payment_status = "pending"
  - Optionally call a stub function chargeCustomer(invoice) (for future Stripe integration).

IMPORTANT:
- This job must be opt-in and controlled by the ENABLE_PRICING_PLUGIN flag.
- If the flag is false, the job should not run.
- The job must not touch existing non-plug-in invoices or subscriptions.

------------------------------------------------
8. FRONTEND: CUSTOMER PRICING SIMULATOR
------------------------------------------------

Create a simple, separate front-end component or page. It must NOT modify existing pages, only add a new one.

Suggested route: /pricing-plugin/calculator

Elements:
- Input field: "Number of employees" (integer).
- Button: "Calculate price".
- Area to display results:
  - Number of employees.
  - Applied tier.
  - Price per license.
  - Whether a minimum fee is applied.
  - Total monthly cost.
  - Effective cost per employee.

Behavior:
- When the user inputs a number and clicks the button:
  - Call POST /api/pricing-plugin/calculate with {"employees": <value>}.
  - Display formatted results from the response.

Validation:
- Employees must be >= 1.
- If invalid, show a user-friendly error.

------------------------------------------------
9. FRONTEND: ADMIN CONFIGURATION SCREEN
------------------------------------------------

Create a new admin-only page for managing pricing configuration. Do NOT alter existing admin pages; just add a new one.

Suggested route: /pricing-plugin/admin/pricing

Elements:
- Input fields for:
  - min_fee_small
  - price_1_10
  - price_11_49
  - price_50_199
  - price_200_plus
  - currency
- "Save" button.

Behavior:
- On load: call GET /api/pricing-plugin/admin/pricing to populate fields.
- On save: POST the new values to /api/pricing-plugin/admin/pricing.
- Show success or error messages.
- All logic contained within the plug-in module.

------------------------------------------------
10. ERROR HANDLING AND SAFETY
------------------------------------------------

Error handling:
- If no active pricing_config exists, return HTTP 500 with:
  { "error": "Pricing configuration not set" }
- If employees is missing or invalid in a request, return HTTP 400 with:
  { "error": "Invalid employees value" }

Safety constraints:
- Never modify / delete existing DB structures or code paths.
- All destructive operations (drops, renames, migrations) are forbidden.
- All changes must be strictly additive and namespaced.

------------------------------------------------
11. IMPLEMENTATION NOTES
------------------------------------------------

- Backend stack: use the same stack as the existing app (Node/Express or Python/FastAPI). If unknown, prefer Node/Express.
- Put all new backend code in a clearly named module/folder such as /pricing_plugin.
- Expose the plugin router under /api/pricing-plugin, mounted only if ENABLE_PRICING_PLUGIN is true.
- Keep the pricing calculation logic in a single small, well-tested function that can be called from:
  - the simulator endpoint,
  - the subscription creation/update endpoint,
  - the billing job.

End of specification.
