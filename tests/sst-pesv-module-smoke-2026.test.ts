import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import test from "node:test";
import { and, desc, eq, like } from "drizzle-orm";

const enabled = process.env.RUN_SST_PESV_MODULE_SMOKE_2026 === "1";
const marker = "PRUEBAS 2026 — revisión funcional DEMO-PRUEBA";
const outputDir = "attached_assets/DEMO-PRUEBA-pruebas-2026";

test("PRUEBAS 2026: carga funcional de las rutas SST y PESV", { skip: !enabled }, async () => {
  assert.equal(process.env.NODE_ENV, "development", "Solo se ejecuta en desarrollo.");
  const [{ db }, schema, { hashPassword }, { chromium }] = await Promise.all([
    import("../server/db"),
    import("../shared/schema"),
    import("../server/auth"),
    import("playwright"),
  ]);
  const [company] = await db.select({ id: schema.companies.id, name: schema.companies.name })
    .from(schema.companies).where(eq(schema.companies.name, "DEMO-PRUEBA")).limit(1);
  assert.equal(company?.name, "DEMO-PRUEBA");

  const [sst] = await db.select({ id: schema.evaluacionesSst.id }).from(schema.evaluacionesSst)
    .where(and(eq(schema.evaluacionesSst.companyId, company.id), like(schema.evaluacionesSst.observaciones, "PRUEBA FUNCIONAL DEMO-PRUEBA%")))
    .orderBy(desc(schema.evaluacionesSst.createdAt)).limit(1);
  const [pesv] = await db.select({ id: schema.evaluacionesPesv.id }).from(schema.evaluacionesPesv)
    .where(and(eq(schema.evaluacionesPesv.companyId, company.id), like(schema.evaluacionesPesv.observaciones, "PRUEBA FUNCIONAL DEMO-PRUEBA%")))
    .orderBy(desc(schema.evaluacionesPesv.createdAt)).limit(1);
  assert.ok(sst && pesv, "Las evaluaciones marcadas de prueba deben existir.");

  const appSource = await readFile("client/src/App.tsx", "utf8");
  const declarations = appSource.split("\n").flatMap((line, index) => {
    const lineNumber = index + 1;
    const section = lineNumber >= 340 && lineNumber <= 434
      ? "SST"
      : lineNumber >= 436 && lineNumber <= 498 ? "PESV" : null;
    const match = line.match(/path="([^"]+)"\s+component=\{([^}]+)\}/);
    if (!section || !match) return [];
    const [, template, component] = match;
    if (section === "PESV" && template.includes(":evaluacionId")) {
      return [{ section, template, component, path: template.replaceAll(":evaluacionId", pesv.id) }];
    }
    if (section === "PESV" && template === "/pesv/evaluacion/:id") {
      return [{ section, template, component, path: template.replace(":id", pesv.id) }];
    }
    if (template.includes(":")) return [];
    return [{ section, template, component, path: template }];
  });
  const routes = [...new Map(declarations.map((item) => [`${item.section}:${item.path}`, item])).values()];
  assert.ok(routes.some((item) => item.section === "SST") && routes.some((item) => item.section === "PESV"));

  const userId = randomUUID();
  const username = `qa-modules-2026-${randomBytes(6).toString("hex")}`;
  const password = randomBytes(32).toString("base64url");
  let accountCreated = false;
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
  const results: Array<{ section: string; path: string; component: string; status: string; note: string }> = [];
  try {
    await db.insert(schema.users).values({
      id: userId, username, password: await hashPassword(password), role: "admin",
      companyId: company.id, fullName: "Responsable de pruebas funcionales 2026",
      email: `${username}@example.invalid`, emailVerifiedAt: new Date(),
    });
    accountCreated = true;
    browser = await chromium.launch({
      executablePath: "/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium",
      args: ["--no-sandbox"], headless: true,
    });
    const context = await browser.newContext({ baseURL: "http://127.0.0.1:5000" });
    const login = await context.request.post("/api/login", { data: { username, password } });
    assert.equal(login.status(), 200, "No fue posible autenticar la cuenta temporal.");
    const page = await context.newPage();
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));

    for (const route of routes) {
      try {
        const response = await page.goto(route.path, { waitUntil: "domcontentloaded", timeout: 20000 });
        await page.waitForTimeout(300);
        const textLength = await page.locator("body").innerText().then((text) => text.trim().length).catch(() => 0);
        const errors = pageErrors.splice(0);
        const pass = Boolean(response?.ok()) && textLength > 10 && errors.length === 0;
        results.push({
          section: route.section, path: route.path, component: route.component,
          status: pass ? "CARGÓ" : "REVISAR",
          note: errors.length ? errors.join(" | ") : `HTTP ${response?.status() ?? "sin respuesta"}; contenido ${textLength} caracteres; URL ${page.url()}`,
        });
      } catch (error) {
        results.push({
          section: route.section, path: route.path, component: route.component,
          status: "REVISAR", note: error instanceof Error ? error.message : String(error),
        });
        pageErrors.splice(0);
      }
    }

    const escape = (value: string) => value.replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[char]!);
    const rows = results.map((item) => `<tr><td>${escape(item.section)}</td><td>${escape(item.component)}</td><td><code>${escape(item.path)}</code></td><td>${escape(item.status)}</td><td>${escape(item.note)}</td></tr>`).join("");
    await mkdir(outputDir, { recursive: true });
    await writeFile(`${outputDir}/matriz-modulos-sst-pesv-2026.json`, JSON.stringify({
      title: marker, date: "2026-10-26", company: company.name,
      scope: "Carga y renderizado de rutas autenticadas; no sustituye pruebas de escritura específicas.",
      total: results.length, passed: results.filter((item) => item.status === "CARGÓ").length,
      needsReview: results.filter((item) => item.status !== "CARGÓ").length, results,
    }, null, 2));
    await writeFile(`${outputDir}/matriz-modulos-sst-pesv-2026.html`, `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${marker}</title><style>body{font:14px/1.45 system-ui;margin:24px;color:#18302b}h1{font-size:26px}.tag{color:#9a3412;font-weight:700}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccd7d0;padding:8px;text-align:left;vertical-align:top}th{background:#e7f0ea;position:sticky;top:0}tr:nth-child(even){background:#f5f8f6}code{word-break:break-all}</style><h1>${marker}</h1><p>Fecha: 26/10/2026 · Empresa: DEMO-PRUEBA · Revisadas ${results.length} rutas: ${results.filter((item) => item.status === "CARGÓ").length} cargaron; ${results.filter((item) => item.status !== "CARGÓ").length} requieren revisión.</p><p><b>Alcance:</b> autenticación, navegación y renderizado de pantallas. Las pruebas de guardado/descarga se reportan en sus evidencias específicas.</p><table><thead><tr><th>Área</th><th>Módulo / componente</th><th>Ruta</th><th>Resultado</th><th>Detalle</th></tr></thead><tbody>${rows}</tbody></table></html>`);
    await context.close();
    const failures = results.filter((item) => item.status !== "CARGÓ");
    assert.equal(failures.length, 0, `${failures.length} rutas requieren revisión; consulta la matriz ${outputDir}.`);
    console.log(JSON.stringify({ marker, total: results.length, loaded: results.length - failures.length, outputDir }));
  } finally {
    await browser?.close().catch(() => undefined);
    if (accountCreated) {
      await db.update(schema.users).set({
        username: `revoked-${userId}`, password: await hashPassword(randomBytes(32).toString("base64url")),
        role: "trabajador", workerId: null, companyId: null, emailVerifiedAt: null,
      }).where(eq(schema.users.id, userId));
    }
    await db.$client.end();
  }
});
