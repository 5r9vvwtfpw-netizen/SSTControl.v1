import test from "node:test";
import assert from "node:assert/strict";
import { filterFodaLinkedActions } from "../server/services/foda-context-actions";

test("FODA plan excludes PESV actions and keeps a linked factor action across reload", () => {
  const companyId = "qa-company";
  const otherCompanyId = "other-company";
  const legacyPesvActions = Array.from({ length: 20 }, (_, index) => ({
    id: `legacy-pesv-${index + 1}`,
    companyId,
    factorContextoId: null,
    tipoFoda: "debilidad",
    origenHallazgo: "evaluacion_pesv",
    accion: `Implementar paso PESV ${index + 1}`,
  }));
  const pesvPlanActions = Array.from({ length: 20 }, (_, index) => ({
    id: `pesv-plan-${index + 1}`,
    evaluacionId: "qa-pesv-evaluation",
    pasoId: `P${String(index + 1).padStart(2, "0")}`,
    descripcion: `Implementar paso PESV ${index + 1}`,
  }));

  const noFodaFactors = [];
  const emptyContextPlan = filterFodaLinkedActions(legacyPesvActions, noFodaFactors, companyId);
  assert.equal(emptyContextPlan.length, 0);
  assert.equal(pesvPlanActions.length, 20);

  const factor = {
    id: "qa-factor-1",
    companyId,
    esFortaleza: 0,
    esDebilidad: 0,
    esOportunidad: 0,
    esAmenaza: 1,
  };
  const contextAction = {
    id: "qa-context-action-1",
    companyId,
    factorContextoId: factor.id,
    tipoFoda: "debilidad",
    origenHallazgo: "analisis_contexto",
    accion: "Mitigar el riesgo externo identificado",
  };
  const actions = [...legacyPesvActions, contextAction];
  const factors = [factor, {
    ...factor,
    id: "foreign-factor",
    companyId: otherCompanyId,
  }];

  const contextPlan = filterFodaLinkedActions(actions, factors, companyId);
  assert.equal(contextPlan.length, 1);
  assert.equal(contextPlan[0].id, contextAction.id);
  assert.equal(contextPlan[0].tipoFoda, "amenaza");

  // A new read after navigation/reload must return the same separate plans.
  const reloadedContextPlan = filterFodaLinkedActions([...actions], [...factors], companyId);
  assert.deepEqual(reloadedContextPlan.map(({ id, tipoFoda }) => ({ id, tipoFoda })), [
    { id: contextAction.id, tipoFoda: "amenaza" },
  ]);
  assert.equal(pesvPlanActions.length, 20);
});
