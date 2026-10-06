import assert from "node:assert/strict";
import test from "node:test";
import { aggregateBillingRevenueByMonth } from "../server/lib/billing-revenue-metrics";

test("combina Wompi y PSE en el mes de pago y cuenta una sola suscripción por mes", () => {
  const revenue = aggregateBillingRevenueByMonth([
    {
      subscriptionId: "sub-1",
      amount: 180000,
      createdAt: "2026-08-31T18:00:00.000Z",
      paidAt: "2026-09-01T05:30:00.000Z",
    },
    {
      subscriptionId: "sub-1",
      amount: "20000",
      createdAt: new Date("2026-09-29T10:00:00.000Z"),
      paidAt: new Date("2026-09-29T10:15:00.000Z"),
    },
    {
      subscriptionId: "sub-2",
      amount: 50000,
      createdAt: "2026-08-15T12:00:00.000Z",
    },
  ]);

  assert.deepEqual(revenue, [
    { month: "2026-08", revenue: 50000, subscriptions: 1 },
    { month: "2026-09", revenue: 200000, subscriptions: 1 },
  ]);
});

test("usa la fecha de aprobación del PSE en vez de la fecha en que se inició el cobro", () => {
  const revenue = aggregateBillingRevenueByMonth([
    {
      subscriptionId: "sub-pse",
      amount: 168000,
      createdAt: "2026-09-30T22:00:00.000Z",
      paidAt: "2026-10-01T05:30:00.000Z",
    },
  ]);

  assert.deepEqual(revenue, [
    { month: "2026-10", revenue: 168000, subscriptions: 1 },
  ]);
});