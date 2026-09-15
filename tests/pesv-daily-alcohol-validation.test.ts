import assert from "node:assert/strict";
import test from "node:test";
import { validateDailyAlcoholSubmission } from "../server/lib/pesv-daily-alcohol-validation";

test("disabled company accepts a confirmed No without alcoholimetry result", () => {
  const result = validateDailyAlcoholSubmission({
    consumoAlcohol: 0,
    declaracionNoAlcoholConfirmada: 1,
  }, false);

  assert.equal(result.consumoAlcohol, 0);
  assert.equal(result.resultadoAlcoholimetria, null);
  assert.equal(result.declaracionNoAlcoholConfirmada, 1);
  assert.ok(result.declaracionNoAlcoholConfirmadaAt instanceof Date);
});

test("enabled company requires and normalizes the alcoholimetry result", () => {
  assert.throws(
    () => validateDailyAlcoholSubmission({
      consumoAlcohol: 0,
      declaracionNoAlcoholConfirmada: 1,
    }, true),
    /resultado de alcoholimetría válido/,
  );

  const result = validateDailyAlcoholSubmission({
    consumoAlcohol: 0,
    declaracionNoAlcoholConfirmada: 1,
    resultadoAlcoholimetria: " 0,000 ",
  }, true);

  assert.equal(result.resultadoAlcoholimetria, "0.000");
});

test("a No answer cannot bypass the responsibility declaration", () => {
  assert.throws(
    () => validateDailyAlcoholSubmission({
      consumoAlcohol: 0,
      declaracionNoAlcoholConfirmada: 0,
      resultadoAlcoholimetria: "0.000",
    }, true),
    /confirmar la declaración/,
  );
});

test("a Yes answer does not persist the No-consumption declaration", () => {
  const result = validateDailyAlcoholSubmission({
    consumoAlcohol: 1,
    declaracionNoAlcoholConfirmada: 1,
    resultadoAlcoholimetria: "0.25",
  }, true);

  assert.equal(result.declaracionNoAlcoholConfirmada, 0);
  assert.equal(result.declaracionNoAlcoholConfirmadaAt, null);
});