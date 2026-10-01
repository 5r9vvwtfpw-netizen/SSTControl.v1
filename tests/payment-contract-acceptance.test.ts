import assert from "node:assert/strict";
import test from "node:test";
import pg from "pg";
import { PgDialect } from "drizzle-orm/pg-core";
import { SAAS_CONTRACT_VERSION } from "../shared/saas-contract";
import { hasAcceptedPaymentContract, currentSignedPaymentContractQuery } from "../server/services/payment-contract-acceptance";

test("la aceptación previa de checkout continúa habilitando el pago", async () => {
  let lookedUp = false;
  const accepted = await hasAcceptedPaymentContract(
    { companyId: "company-checkout", contractAcceptedAt: new Date() },
    async () => { lookedUp = true; return false; },
  );
  assert.equal(accepted, true);
  assert.equal(lookedUp, false);
});

test("la firma vigente habilita el pago aunque la marca antigua esté vacía", async () => {
  const accepted = await hasAcceptedPaymentContract(
    { companyId: "company-signed", contractAcceptedAt: null },
    async companyId => {
      assert.equal(companyId, "company-signed");
      return true;
    },
  );
  assert.equal(accepted, true);
});

test("sin aceptación ni firma válida no se habilita el pago", async () => {
  assert.equal(await hasAcceptedPaymentContract(
    { companyId: "company-unsigned", contractAcceptedAt: null },
    async () => false,
  ), false);
});

test("un fallo al consultar la firma no se convierte en autorización", async () => {
  await assert.rejects(hasAcceptedPaymentContract(
    { companyId: "company-unavailable", contractAcceptedAt: null },
    async () => { throw new Error("evidence lookup unavailable"); },
  ), /evidence lookup unavailable/);
});

test("la consulta real distingue firmas válidas, de prueba, ajenas e incompletas", async () => {
  assert.notEqual(process.env.NODE_ENV, "production", "Esta prueba solo usa la base de desarrollo");
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query("BEGIN");
    // Tablas temporales de sesión: no se alteran contratos ni empresas reales.
    await client.query(`
      CREATE TEMP TABLE saas_contract_signing_requests (
        id text, company_id text, contract_version text, source_sha256 text,
        status text, test_only boolean, capacity text, signature_required boolean
      ) ON COMMIT DROP;
      CREATE TEMP TABLE saas_contract_signatures (
        request_id text, company_id text, contract_version text, source_sha256 text,
        test_only boolean, capacity text
      ) ON COMMIT DROP;
    `);
    await client.query(`
      INSERT INTO saas_contract_signing_requests VALUES
        ('request', 'company-signed', $1, 'source-hash', 'signed', false, 'legal_representative', true);
      `, [SAAS_CONTRACT_VERSION]);
    const query = new PgDialect().sqlToQuery(currentSignedPaymentContractQuery("company-signed"));
    const accepted = async () => (await client.query(query.sql, query.params)).rows[0].accepted;
    assert.equal(await accepted(), false, "una solicitud sin registro de firma no autoriza");
    await client.query(`
      INSERT INTO saas_contract_signatures VALUES
        ('request', 'company-signed', $1, 'source-hash', false, 'legal_representative');
    `, [SAAS_CONTRACT_VERSION]);
    assert.equal(await accepted(), true, "contrato real vigente firmado");
    const invalidCases = [
      ["UPDATE saas_contract_signatures SET test_only = true", "UPDATE saas_contract_signatures SET test_only = false"],
      ["UPDATE saas_contract_signing_requests SET test_only = true", "UPDATE saas_contract_signing_requests SET test_only = false"],
      ["UPDATE saas_contract_signatures SET company_id = 'other-company'", "UPDATE saas_contract_signatures SET company_id = 'company-signed'"],
      ["UPDATE saas_contract_signatures SET contract_version = 'old-version'", "UPDATE saas_contract_signatures SET contract_version = $1"],
      ["UPDATE saas_contract_signing_requests SET contract_version = 'old-version'", "UPDATE saas_contract_signing_requests SET contract_version = $1"],
      ["UPDATE saas_contract_signatures SET source_sha256 = 'other-hash'", "UPDATE saas_contract_signatures SET source_sha256 = 'source-hash'"],
      ["UPDATE saas_contract_signing_requests SET status = 'approved'", "UPDATE saas_contract_signing_requests SET status = 'signed'"],
      ["UPDATE saas_contract_signing_requests SET signature_required = false", "UPDATE saas_contract_signing_requests SET signature_required = true"],
      ["UPDATE saas_contract_signatures SET capacity = 'attorney'", "UPDATE saas_contract_signatures SET capacity = 'legal_representative'"],
    ];
    for (const [invalidate, restore] of invalidCases) {
      await client.query(invalidate);
      assert.equal(await accepted(), false, invalidate);
      await client.query(restore, restore.includes("$1") ? [SAAS_CONTRACT_VERSION] : []);
    }
    const otherTenant = new PgDialect().sqlToQuery(currentSignedPaymentContractQuery("other-company"));
    assert.equal((await client.query(otherTenant.sql, otherTenant.params)).rows[0].accepted, false);
    assert.equal(await accepted(), true);
  } finally {
    await client.query("ROLLBACK");
    await client.end();
  }
});