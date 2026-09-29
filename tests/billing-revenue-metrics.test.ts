import assert from "node:assert/strict";
import test from "node:test";
import { aggregateBillingRevenueByMonth } from "../server/lib/billing-revenue-metrics";

test("combina ingresos Wompi y PSE, contando una sola suscripción por mes", () => {
  const revenue = aggregateBillingRevenueByMonth([
    { subscriptionId: "sub-1", amount: 180000, createdAt: "2026-09-28T19:29:04.439Z" },
    { subscriptionId: "sub-1", amount: "20000", createdAt: new Date("2026-09-29T10:00:00.000Z") },
    { subscriptionId: "sub-2", amount: 50000, createdAt: "2026-08-15T12:00:00.000Z" },
  ]);

  assert.deepEqual(revenue, [
    { month: "2026-08", revenue: 50000, subscriptions: 1 },
    { month: "2026-09", revenue: 200000, subscriptions: 1 },
  ]);
});