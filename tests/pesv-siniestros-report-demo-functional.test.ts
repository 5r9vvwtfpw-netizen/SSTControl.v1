import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import test from "node:test";
import { and, eq, sql } from "drizzle-orm";

const enabled = process.env.RUN_PESV_SINIESTROS_DEMO_FUNCTIONAL === "1";
const companyId = "demo-company-001";

test(
  "DEMO-PRUEBA: estado autenticado y descargas del informe PESV",
  { skip: !enabled },
  async () => {
    assert.notEqual(process.env.NODE_ENV, "production", "No ejecutar esta prueba en producción.");
    assert.ok(process.env.REPLIT_DEV_DOMAIN, "Se necesita el dominio de desarrollo.");

    const [{ db }, schema, { hashPassword }] = await Promise.all([
      import("../server/db"),
      import("../shared/schema"),
      import("../server/auth"),
    ]);

    const companyResult = await db.execute(sql`
      SELECT id, name FROM companies WHERE id = ${companyId} LIMIT 1
    `);
    const company = companyResult.rows[0] as { id: string; name: string } | undefined;
    assert.equal(company?.name, "DEMO-PRUEBA", "La prueba solo puede ejecutarse en la empresa DEMO-PRUEBA.");

    const accountId = randomUUID();
    const username = `pesv-report-test-${randomBytes(6).toString("hex")}`;
    const password = randomBytes(32).toString("base64url");
    const baseUrl = `https://${process.env.REPLIT_DEV_DOMAIN}`;
    let accountCreated = false;

    try {
      await db.insert(schema.users).values({
        id: accountId,
        username,
        password: await hashPassword(password),
        role: "admin",
        companyId,
        fullName: "Prueba funcional informe PESV DEMO-PRUEBA",
        email: `${username}@example.invalid`,
        emailVerifiedAt: new Date(),
      });
      accountCreated = true;

      const login = await fetch(`${baseUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      assert.equal(login.status, 200, "La cuenta temporal debe iniciar sesión en desarrollo.");
      const cookie = login.headers.getSetCookie().map((value) => value.split(";")[0]).join("; ");
      assert.ok(cookie, "El inicio de sesión debe establecer cookies.");

      const headers = { Cookie: cookie, "X-Company-Id": companyId };
      const statusResponse = await fetch(
        `${baseUrl}/api/pesv/informes/siniestros/estado`,
        { headers },
      );
      assert.equal(statusResponse.status, 200, await statusResponse.clone().text());
      const status = await statusResponse.json() as {
        companyName: string;
        total: number;
        ready: number;
        incomplete: Array<{ id: string; missingFields: string[] }>;
      };
      assert.equal(status.companyName, "DEMO-PRUEBA");
      assert.ok(status.total > 0, "La prueba debe encontrar siniestros existentes en DEMO-PRUEBA.");
      const pendingFieldNames = [...new Set(status.incomplete.flatMap((record) => record.missingFields))];

      const formats = [
        {
          name: "Excel",
          path: "/api/pesv/informes/siniestros.xlsx",
          contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          signature: Buffer.from([0x50, 0x4b, 0x03, 0x04]),
        },
        {
          name: "PDF",
          path: "/api/pesv/informes/siniestros.pdf",
          contentType: "application/pdf",
          signature: Buffer.from("%PDF-"),
        },
      ] as const;

      const outcomes: string[] = [];
      for (const format of formats) {
        const response = await fetch(`${baseUrl}${format.path}`, { headers });
        if (status.incomplete.length > 0) {
          assert.equal(response.status, 409, `${format.name} debe bloquearse mientras falten datos.`);
          const body = await response.json() as {
            message?: string;
            incomplete?: Array<{ id: string; missingFields: string[] }>;
          };
          assert.match(body.message || "", /Completa los datos/i);
          assert.equal(body.incomplete?.length, status.incomplete.length);
          outcomes.push(`${format.name}: bloqueado por ${body.incomplete.length} registros incompletos`);
        } else {
          assert.equal(response.status, 200, `${format.name}: ${await response.clone().text()}`);
          assert.match(response.headers.get("Content-Type") || "", new RegExp(format.contentType));
          const content = Buffer.from(await response.arrayBuffer());
          assert.deepEqual(content.subarray(0, format.signature.length), format.signature);
          outcomes.push(`${format.name}: descargado`);
        }
      }

      console.log(
        `DEMO-PRUEBA: siniestros=${status.total}, completos=${status.ready}, pendientes=${status.incomplete.length}, campos pendientes=${pendingFieldNames.join(" | ") || "ninguno"}; ${outcomes.join("; ")}`,
      );
    } finally {
      try {
        if (accountCreated) {
          await db.delete(schema.users).where(
            and(eq(schema.users.id, accountId), eq(schema.users.username, username)),
          );
        }
      } finally {
        await db.$client.end();
      }
    }
  },
);
