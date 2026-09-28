import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateWorkerPricingCharge,
  parseWorkerPricingUpdate,
  workerPricingConfigMatchesQuote,
  workerPricingSnapshotMatchesQuote,
  WorkerPricingValidationError,
} from "../server/services/company-worker-pricing";

test("fixed worker pricing multiplies authoritative workers by configured COP unit price", () => {
  const pricing = parseWorkerPricingUpdate({ mode: "fixed", unitPriceCop: 8000 });
  const charge = calculateWorkerPricingCharge(pricing, 12, 180000, 170000);

  assert.equal(charge.paymentAmount, 96000);
  assert.equal(charge.effectiveUnitPriceCop, 8000);
  assert.equal(charge.currentPeriodAmount, 180000);
});

test("percentage pricing applies only to the verified public base", () => {
  const pricing = parseWorkerPricingUpdate({ mode: "percentage", discountPercent: 20 });
  const charge = calculateWorkerPricingCharge(pricing, 4, 100001, 70000);

  assert.equal(charge.paymentAmount, 80001);
  assert.equal(charge.currentPeriodAmount, 100001);
  assert.equal(charge.discountPercent, 20);
});

test("standard pricing preserves coupon-adjusted quote behavior", () => {
  const pricing = parseWorkerPricingUpdate({ mode: "standard" });
  const charge = calculateWorkerPricingCharge(pricing, 2, 100000, 65000);

  assert.equal(charge.paymentAmount, 65000);
  assert.equal(charge.currentPeriodAmount, 65000);
});

test("payment-link identity rejects same amount and worker count under changed pricing terms", () => {
  const quote = {
    paymentAmount: 80000,
    employeeCount: 10,
    pricingMode: "fixed" as const,
    publicBaseMonthlyPrice: 180000,
    effectiveUnitPriceCop: 8000,
    discountPercent: null,
  };
  const snapshot = {
    amount: 80000,
    employeeCount: 10,
    mode: "fixed",
    publicBaseAmount: 180000,
    effectiveUnitPriceCop: "8000.00",
    discountPercent: null,
  };

  assert.equal(workerPricingSnapshotMatchesQuote(quote, snapshot), true);
  assert.equal(
    workerPricingSnapshotMatchesQuote(quote, { ...snapshot, mode: "standard" }),
    false,
  );
  assert.equal(
    workerPricingSnapshotMatchesQuote(quote, { ...snapshot, publicBaseAmount: 190000 }),
    false,
  );
  assert.equal(
    workerPricingSnapshotMatchesQuote(quote, { ...snapshot, effectiveUnitPriceCop: "9000.00" }),
    false,
  );
  assert.equal(
    workerPricingSnapshotMatchesQuote(quote, { ...snapshot, discountPercent: 20 }),
    false,
  );
});

test("transaction pricing guard rejects rates changed after quote verification", () => {
  const fixedQuote = {
    pricingMode: "fixed" as const,
    effectiveUnitPriceCop: 8000,
    discountPercent: null,
  };
  assert.equal(workerPricingConfigMatchesQuote(fixedQuote, {
    mode: "fixed",
    unitPriceCop: 8000,
    discountPercent: null,
  }), true);
  assert.equal(workerPricingConfigMatchesQuote(fixedQuote, {
    mode: "fixed",
    unitPriceCop: 9000,
    discountPercent: null,
  }), false);
  assert.equal(workerPricingConfigMatchesQuote(fixedQuote, {
    mode: "standard",
    unitPriceCop: null,
    discountPercent: null,
  }), false);
  assert.equal(workerPricingConfigMatchesQuote(fixedQuote, {
    mode: "fixed",
    unitPriceCop: 8000,
    discountPercent: 10,
  }), false);

  assert.equal(workerPricingConfigMatchesQuote({
    pricingMode: "percentage",
    effectiveUnitPriceCop: 8000,
    discountPercent: 20,
  }, {
    mode: "percentage",
    unitPriceCop: null,
    discountPercent: 25,
  }), false);
});

test("worker pricing validation rejects conflicting and invalid settings", () => {
  assert.throws(
    () => parseWorkerPricingUpdate({ mode: "fixed", unitPriceCop: 8000, discountPercent: 20 }),
    WorkerPricingValidationError,
  );
  assert.throws(
    () => parseWorkerPricingUpdate({ mode: "percentage", discountPercent: 100 }),
    WorkerPricingValidationError,
  );
  assert.throws(
    () => parseWorkerPricingUpdate({ mode: "fixed", unitPriceCop: 0 }),
    WorkerPricingValidationError,
  );
  assert.throws(
    () => calculateWorkerPricingCharge(
      parseWorkerPricingUpdate({ mode: "percentage", discountPercent: 99 }),
      1,
      1,
      1,
    ),
    WorkerPricingValidationError,
  );
});