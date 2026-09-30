import assert from "node:assert/strict";
import test from "node:test";
import { getSuggestedProfileNamesForCiiu } from "../client/src/data/ciiu-profile-suggestions";
import { PREDEFINED_PROFILES } from "../client/src/data/perfiles-cargo-predefinidos";

test("sugiere plantillas de carga para CIIU de transporte y almacenamiento", () => {
  const suggestions = getSuggestedProfileNamesForCiiu(["4923", "5210"]);
  assert.ok(suggestions.includes("Manipulador de Carga"));
  assert.ok(suggestions.includes("Operador de Montacargas"));
  assert.equal(suggestions.filter(name => name === "Manipulador de Carga").length, 1);
  assert.ok(suggestions.every(name => Object.hasOwn(PREDEFINED_PROFILES, name)));
});

test("recomienda perfiles para otros sectores sin atribuirles un cargo obligatorio", () => {
  assert.ok(getSuggestedProfileNamesForCiiu(["0111"]).includes("Operario Agrícola"));
  assert.ok(getSuggestedProfileNamesForCiiu(["8610"]).includes("Médico General"));
  assert.ok(getSuggestedProfileNamesForCiiu(["9602"]).includes("Estilista"));
  assert.equal(PREDEFINED_PROFILES["Manipulador de Carga"].riskFactors.includes("Sobreesfuerzo físico"), true);
});

test("ignora CIIU ausentes, mal formados o no clasificados", () => {
  assert.deepEqual(getSuggestedProfileNamesForCiiu([null, "", "9999", "no es un CIIU"]), []);
});