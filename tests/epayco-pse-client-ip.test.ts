import test from "node:test";
import assert from "node:assert/strict";
import { getEpaycoPseClientIp } from "../server/services/epayco";

test("PSE server IP substitution is limited to DEMO-PRUEBA in development sandbox", () => {
  const original = {
    nodeEnv: process.env.NODE_ENV,
    epaycoTest: process.env.EPAYCO_TEST,
    egressIp: process.env.EPAYCO_DEMO_PSE_EGRESS_IP,
  };

  try {
    process.env.NODE_ENV = "development";
    process.env.EPAYCO_TEST = "true";
    process.env.EPAYCO_DEMO_PSE_EGRESS_IP = "35.227.2.20";

    assert.deepEqual(getEpaycoPseClientIp(undefined, "127.0.0.1", "DEMO-PRUEBA"), {
      ip: "35.227.2.20",
      usingServerIp: true,
    });
    assert.deepEqual(getEpaycoPseClientIp("8.8.8.8", "127.0.0.1", "DEMO-PRUEBA"), {
      ip: "8.8.8.8",
      usingServerIp: false,
    });
    assert.throws(() => getEpaycoPseClientIp(undefined, "127.0.0.1", "OTRA EMPRESA"));

    process.env.NODE_ENV = "production";
    assert.throws(() => getEpaycoPseClientIp(undefined, "127.0.0.1", "DEMO-PRUEBA"));

    process.env.NODE_ENV = "development";
    process.env.EPAYCO_TEST = "false";
    assert.throws(() => getEpaycoPseClientIp(undefined, "127.0.0.1", "DEMO-PRUEBA"));

    process.env.EPAYCO_TEST = "true";
    delete process.env.EPAYCO_DEMO_PSE_EGRESS_IP;
    assert.throws(() => getEpaycoPseClientIp(undefined, "127.0.0.1", "DEMO-PRUEBA"));
  } finally {
    for (const [key, value] of [
      ["NODE_ENV", original.nodeEnv],
      ["EPAYCO_TEST", original.epaycoTest],
      ["EPAYCO_DEMO_PSE_EGRESS_IP", original.egressIp],
    ] as const) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});