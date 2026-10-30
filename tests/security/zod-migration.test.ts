import assert from "node:assert/strict";
import test from "node:test";
import { z } from "zod";
import * as schema from "../../shared/schema";
import fs from "node:fs";

test("shared Drizzle-Zod schemas load under Zod 4", () => {
  const exportedSchemas = Object.entries(schema).filter(
    ([name, value]) =>
      /Schema$/.test(name) &&
      typeof value === "object" &&
      value !== null &&
      "safeParse" in value,
  );

  assert.ok(exportedSchemas.length > 20, "expected representative exported schemas");
  for (const [name, candidate] of exportedSchemas) {
    assert.equal(typeof (candidate as z.ZodType).safeParse, "function", name);
  }
});

test("Zod 4 rejects oversized constrained arrays", () => {
  const bounded = z.array(z.string()).max(10);
  const result = bounded.safeParse(Array.from({ length: 11 }, () => "x"));
  assert.equal(result.success, false);
});

test("server code uses the Zod 4 issues API", () => {
  const files = [
    "server/auth.ts",
    "server/routes.ts",
    "server/routes/billing.ts",
    "server/routes/stripe.ts",
    "server/routes/wompi.ts",
    "server/lib/billing-validator.ts",
    "plugins/promotions/routes.ts",
    "pricing_plugin/routes.ts",
    "pricing_plugin/routes-v2.ts",
  ];
  const source = files.map((file) => fs.readFileSync(file, "utf8")).join("\n");
  assert.doesNotMatch(source, /(?:parsed|validationResult)?\.?error\.errors/);
  assert.doesNotMatch(source, /required_error/);
});

