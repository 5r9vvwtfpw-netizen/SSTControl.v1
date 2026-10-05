import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, and, or, sql, desc, inArray } from "drizzle-orm";
import * as schema from "../shared/schema";
import { getVerificarPeriod } from "../server/services/dashboard-verificar-period";

const now = new Date("2026-10-05T15:00:00Z");

test("periods use bounded calendar years and explicit month labels", () => {
  const current = getVerificarPeriod(2026, now);
  assert.equal(current.yearEnd, "2027-01-01");
  assert.equal(current.monthStart, "2026-09-01");
  assert.equal(current.monthEnd, "2026-10-01");
  assert.equal(current.monthLabel, "Sep 2026");
  const historical = getVerificarPeriod(2025, now);
  assert.equal(historical.monthLabel, "Dic 2025");
  assert.equal(historical.trend[0].start, "2025-07-01");
  assert.equal(historical.trend[5].end, "2026-01-01");
});

test("January window includes previous-year months in Colombia", () => {
  const period = getVerificarPeriod(2026, new Date("2026-01-03T12:00:00Z"));
  assert.equal(period.monthLabel, "Dic 2025");
  assert.equal(period.accidentsStart, "2025-08-01");
  assert.equal(period.trend[0].label, "Ago 2025");
  assert.equal(period.trend[5].label, "Ene 2026");
  // UTC January 1 is still December 31 in Colombia.
  assert.equal(getVerificarPeriod(2025, new Date("2026-01-01T02:00:00Z")).monthLabel, "Nov 2025");
});

test("invalid years are rejected", () => {
  for (const year of [NaN, 2019, 2101, 2026.5]) assert.throws(() => getVerificarPeriod(year, now), RangeError);
});

export function loadVerificarDashboard(db: unknown) {
  // Exercise the actual storage method without starting application services or migrations.
  const source = ts.createSourceFile("storage.ts", readFileSync("server/storage.ts", "utf8"), ts.ScriptTarget.Latest, true);
  let method = "";
  function visit(node: ts.Node) {
    if (ts.isMethodDeclaration(node) && node.name.getText(source) === "getDashboardVerificar") method = node.getText(source);
    ts.forEachChild(node, visit);
  }
  visit(source);
  assert.ok(method);
  const compiled = ts.transpileModule(`class Dashboard { ${method} }; Dashboard;`, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
  }).outputText;
  const Dashboard = vm.runInNewContext(compiled, {
    db, schema, eq, and, or, sql, desc, inArray, Date,
    getVerificarPeriod: (year: number) => getVerificarPeriod(year, now),
  });
  return new Dashboard();
}

test("actual dashboard SQL isolates years, links, missing results and evaluation sources", {
  skip: !process.env.DATABASE_URL,
}, async () => {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15000 });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Session-local copies with no constraints: no application records are touched.
    const tables = [
      "objetivos_sst", "indicadores_sst", "mediciones_indicadores", "auditorias_internas",
      "hallazgos_auditoria", "revisiones_direccion", "decisiones_revision", "acciones_revision",
      "evaluaciones_sst", "respuestas_estandares", "sst_evaluations", "accidents",
    ];
    for (const table of tables) await client.query(`CREATE TEMP TABLE ${table} ON COMMIT DROP AS SELECT * FROM public.${table} WITH NO DATA`);
    await client.query(`
      INSERT INTO objetivos_sst (id,company_id,anio,estado,porcentaje_avance) VALUES
        ('o1','fixture',2026,'cumplido',100),('o2','fixture',2026,'activo',50),('o3','fixture',2025,'activo',10),('other','other',2026,'cumplido',100);
      INSERT INTO indicadores_sst (id,company_id,tipo,activo) VALUES
        ('i1','fixture','estructura',1),('i2','fixture','proceso',1),('inactive','fixture','resultado',0);
      INSERT INTO mediciones_indicadores (id,company_id,indicador_id,fecha_medicion) VALUES
        ('m1','fixture','i1','2026-09-01'),('m2','fixture','i1','2026-09-30'),('m3','fixture','inactive','2026-09-20'),('m4','fixture','i2','2026-10-01');
      INSERT INTO auditorias_internas (id,company_id,fecha_programada,estado,porcentaje_cumplimiento) VALUES
        ('a1','fixture','2026-01-01','completada',NULL),('a2','fixture','2026-12-31','cerrada',80),
        ('a3','fixture','2026-10-01','en_ejecucion',NULL),('a4','fixture','2025-12-31','completada',0),
        ('a5','fixture','2027-01-01','completada',100),('a6','other','2026-10-01','completada',100);
      INSERT INTO hallazgos_auditoria (id,company_id,auditoria_id,severidad) VALUES
        ('h1','fixture','a2','alta'),('h2','fixture','a4','critica'),('h3','fixture','a5','critica');
      INSERT INTO revisiones_direccion (id,company_id,fecha_revision,estado) VALUES
        ('r1','fixture','2026-10-01','seguimiento'),('r2','fixture','2025-10-01','aprobada'),('r3','fixture','2027-01-01','completada');
      INSERT INTO decisiones_revision (id,company_id,revision_id) VALUES
        ('d1','fixture','r1'),('d2','fixture','r2'),('d3','fixture','r3');
      INSERT INTO acciones_revision (id,company_id,decision_id,estado) VALUES
        ('ac1','fixture','d1','en-proceso'),('ac2','fixture','d2','pendiente'),('ac3','fixture','d3','pendiente');
      INSERT INTO evaluaciones_sst (id,company_id,anio,estado,fecha_evaluacion,version,porcentaje_cumplimiento) VALUES
        ('e1','fixture',2026,'completada','2026-09-01',1,70),
        ('e2','fixture',2026,'enviada','2026-09-01',2,80),
        ('draft','fixture',2026,'en-progreso','2026-10-01',1,100),
        ('e2025','fixture',2025,'completada','2025-12-01',1,60);
      INSERT INTO respuestas_estandares (id,evaluacion_id,cumple,no_aplica) VALUES
        ('s1','e2',0,0),('s2','e2',0,1),('s3','e2',1,0),('s4','e1',0,0);
      INSERT INTO sst_evaluations (id,company_id,status,compliance_percentage,evaluation_date) VALUES
        ('legacy','fixture','completada',99,'2026-10-01');
      INSERT INTO accidents (id,company_id,date) VALUES
        ('x1','fixture','2025-12-31'),('x2','fixture','2026-09-30'),('x3','fixture','2026-10-31'),('x4','fixture','2027-01-01'),('x5','other','2026-10-01');
    `);
    const dashboard = loadVerificarDashboard(drizzle(client));
    const current = await dashboard.getDashboardVerificar("fixture", 2026);
    assert.equal(current.objetivos.total, 2);
    assert.equal(current.objetivos.porcentajeCumplimiento, 50);
    assert.equal(current.objetivos.promedioAvance, 75);
    assert.equal(current.indicadores.total, 2);
    assert.equal(current.indicadores.ultimasMediciones, 2);
    assert.equal(current.indicadores.indicadoresConMedicion, 1);
    assert.equal(current.auditorias.totalAnio, 3);
    assert.equal(current.auditorias.completadas, 2);
    assert.equal(current.auditorias.enCurso, 1);
    assert.equal(current.auditorias.sinResultado, 1);
    assert.equal(current.auditorias.porcentajeConformidad, 80);
    assert.equal(current.auditorias.hallazgosPorSeveridad.critica, 0);
    assert.equal(current.auditorias.hallazgosPorSeveridad.alta, 1);
    assert.equal(current.revisiones.totalAnio, 1);
    assert.equal(current.revisiones.completadas, 1);
    assert.equal(current.revisiones.decisionesTomadas, 1);
    assert.equal(current.revisiones.accionesPendientes, 1);
    assert.equal(current.cumplimientoNormativo.ultimaEvaluacion, 80);
    assert.equal(current.cumplimientoNormativo.estandaresCriticos, 1);
    assert.equal(current.cumplimientoNormativo.estandaresCumplidos, 2);
    assert.equal(current.accidentalidad.totalAccidentes, 2);
    assert.equal(current.accidentalidad.accidentesUltimoMes, 1);
    assert.equal(current.accidentalidad.tendenciaMensual.find((m: any) => m.mes === "Sep 2026").cantidad, 1);
    const historical = await dashboard.getDashboardVerificar("fixture", 2025);
    assert.equal(historical.auditorias.totalAnio, 1);
    assert.equal(historical.auditorias.porcentajeConformidad, 0); // A real zero is not missing.
    assert.equal(historical.revisiones.accionesPendientes, 1);
    assert.equal(historical.cumplimientoNormativo.ultimaEvaluacion, 60);
    assert.equal(historical.accidentalidad.totalAccidentes, 1);
    assert.equal(historical.accidentalidad.tendenciaMensual[5].cantidad, 1);
    const empty = await dashboard.getDashboardVerificar("empty", 2026);
    assert.equal(empty.auditorias.porcentajeConformidad, null);
    assert.equal(empty.auditorias.totalAnio, 0);
    assert.equal(empty.cumplimientoNormativo.ultimaEvaluacion, null);
    assert.equal(empty.accidentalidad.totalAccidentes, 0);
    await client.query("UPDATE auditorias_internas SET porcentaje_cumplimiento=NULL WHERE company_id='fixture'");
    const missing = await dashboard.getDashboardVerificar("fixture", 2026);
    assert.equal(missing.auditorias.porcentajeConformidad, null);
    assert.equal(missing.auditorias.sinResultado, 2);
  } finally {
    await client.query("ROLLBACK");
    client.release();
    await pool.end();
  }
});
