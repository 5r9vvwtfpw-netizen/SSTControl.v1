import assert from "node:assert/strict";
import test from "node:test";
import {
  buildSveProgramDraft,
  SVE_RISK_TYPES,
} from "../client/src/pages/VigilanciaEpidemiologica";
import { insertSveProgramSchema } from "../shared/schema";

test("every SVE list option builds and validates its own program type", () => {
  const names = new Set<string>();
  const fixedDate = new Date(2026, 8, 14);

  assert.equal(SVE_RISK_TYPES.length, 8);

  for (const riskType of SVE_RISK_TYPES) {
    const draft = buildSveProgramDraft(riskType, fixedDate);

    assert.equal(draft.riskType, riskType);
    assert.ok(draft.name.length > 0);
    assert.ok(draft.objective.length > 0);
    assert.ok(draft.targetPopulation.length > 0);
    assert.ok(draft.protocol.length > 0);
    assert.equal(draft.startDate, "2026-09-14");
    assert.equal(draft.reviewDate, "2027-03-14");
    assert.equal(insertSveProgramSchema.safeParse({
      ...draft,
      responsibleName: "Responsable de prueba",
      responsiblePosition: "SST",
      status: "activo",
    }).success, true);

    names.add(draft.name);
  }

  assert.equal(names.size, SVE_RISK_TYPES.length);
});