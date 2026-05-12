/**
 * Seed Golden Master para el Demo Engine
 * Pobla la empresa demo-golden-master con datos realistas
 * Ejecutar: NODE_ENV=production npx tsx scripts/seed_golden_master.ts
 */

import { Pool } from "pg";
import * as dotenv from "dotenv";
dotenv.config();

const GM = "demo-golden-master";

const pool = new Pool({
  host: process.env.AWS_RDS_HOST,
  port: parseInt(process.env.AWS_RDS_PORT || "5432"),
  database: process.env.AWS_RDS_DATABASE || "postgres",
  user: process.env.AWS_RDS_USER || "postgres",
  password: process.env.AWS_RDS_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

function uuid() {
  const hex = () => Math.floor(Math.random() * 16).toString(16);
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

async function run() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // ── 0. Desbloquear sala 001 atascada ─────────────────────────────────────
    console.log("0. Desbloqueando demo-room-001...");
    await client.query(`
      UPDATE demo_room_bookings
      SET status = 'available', expires_at = NULL, assigned_session_token = NULL,
          assigned_prospect_email = NULL, updated_at = now()
      WHERE room_id = 'demo-room-001'
    `);

    // ── 0b. Asegurar que la empresa Golden Master exista ─────────────────────
    console.log("0b. Asegurando empresa Golden Master en companies...");
    await client.query(`
      INSERT INTO companies (id, name, nit, city, ciiu_code, address, number_of_workers, number_of_vehicles, risk_level, calculated_chapter)
      VALUES ($1, 'Soluciones Integrales Demo SAS', '901555000-1', 'Bogotá', '4711',
              'Calle 80 # 45-32, Zona Industrial', 15, 5, 'I', '2')
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        number_of_workers = EXCLUDED.number_of_workers,
        calculated_chapter = EXCLUDED.calculated_chapter
    `, [GM]);

    // ── 1. Limpiar datos anteriores del Golden Master ─────────────────────────
    console.log("1. Limpiando Golden Master existente...");
    const childTables = [
      "respuestas_estandares", "sst_evidence", "sst_evaluation_items",
      "training_attendees",
    ];
    for (const ct of childTables) {
      if (ct === "respuestas_estandares") {
        await client.query(`DELETE FROM respuestas_estandares WHERE evaluacion_id IN (SELECT id FROM evaluaciones_sst WHERE company_id = $1)`, [GM]);
      } else if (ct === "sst_evidence") {
        await client.query(`DELETE FROM sst_evidence WHERE evaluation_item_id IN (SELECT id FROM sst_evaluation_items WHERE evaluation_id IN (SELECT id FROM sst_evaluations WHERE company_id = $1))`, [GM]);
      } else if (ct === "sst_evaluation_items") {
        await client.query(`DELETE FROM sst_evaluation_items WHERE evaluation_id IN (SELECT id FROM sst_evaluations WHERE company_id = $1)`, [GM]);
      } else if (ct === "training_attendees") {
        await client.query(`DELETE FROM training_attendees WHERE training_id IN (SELECT id FROM trainings WHERE company_id = $1)`, [GM]);
      }
    }
    const mainTables = [
      "evaluaciones_sst", "sst_evaluations", "planes_trabajo_anual",
      "medical_exams", "health_conditions", "accidents", "trainings",
      "inspections", "preventive_measures", "occupational_diseases",
      "contracts", "afiliaciones_ssss", "resource_allocations",
      "responsible_designations", "job_profiles", "politicas_sst", "workers",
    ];
    for (const t of mainTables) {
      await client.query(`DELETE FROM ${t} WHERE company_id = $1`, [GM]);
    }

    // ── 2. Perfiles de cargo ──────────────────────────────────────────────────
    console.log("2. Creando perfiles de cargo...");
    const jpOperario = uuid();
    const jpConductor = uuid();
    const jpAdmin = uuid();
    const jpSupervisor = uuid();

    await client.query(`
      INSERT INTO job_profiles (id, company_id, name, description, risk_class, risk_factors, physical_demands, mental_demands, required_ppe, required_exams, exam_frequency_months, required_trainings, is_active)
      VALUES
        ($1,$2,'Operario de Producción','Ejecuta tareas de manufactura y ensamble en planta','III',ARRAY['ruido','vibraciones','posturas_forzadas'],'Alta exigencia física, carga manual hasta 20 kg','Concentración media','{"casco","guantes","botas","gafas"}','{"ingreso","periodico"}',12,'{"induccion_sst","trabajo_alturas","manejo_quimicos"}',1),
        ($3,$2,'Conductor','Transporte de mercancía y personal en rutas urbanas e intermunicipales','II',ARRAY['carga_mental','postura_sedente','accidentes_tránsito'],'Conducción prolongada','Alta concentración y tiempo de reacción','{"cinturón","chaleco"}','{"ingreso","periodico","retiro"}',12,'{"manejo_defensivo","primeros_auxilios"}',1),
        ($4,$2,'Auxiliar Administrativo','Apoyo a procesos administrativos y de gestión documental','I',ARRAY['carga_mental','posturas_sedentes','pantallas'],'Baja exigencia física','Alta concentración','{"ninguno"}','{"ingreso","periodico"}',24,'{"induccion_sst","riesgo_psicosocial"}',1),
        ($5,$2,'Supervisor SST','Supervisión y control de actividades de seguridad y salud en el trabajo','II',ARRAY['carga_mental','trabajo_en_alturas','ruido'],'Media exigencia física, recorridos en planta','Alta concentración y toma de decisiones','{"casco","botas","chaleco"}','{"ingreso","periodico"}',12,'{"trabajo_alturas","primeros_auxilios","investigacion_accidentes"}',1)
    `, [jpOperario, GM, jpConductor, jpAdmin, jpSupervisor]);

    // ── 3. Trabajadores (15) ──────────────────────────────────────────────────
    console.log("3. Creando 15 trabajadores...");
    const workers = [
      { id: uuid(), num: "GM-10234567", name: "Carlos Andrés Martínez López",    email: "carlos.martinez.gm@demosst.co",  pos: "Operario de Producción",   dept: "Producción",     jp: jpOperario,   ct: "indefinido", gender: "masculino", bd: "1988-03-14", edu: "secundaria",   cs: "casado",      eps: "Sura EPS",       arl: "ARL Sura",      afp: "Protección",     ccf: "Cafam" },
      { id: uuid(), num: "GM-20345678", name: "María Fernanda Gómez Ríos",       email: "maria.gomez.gm@demosst.co",     pos: "Auxiliar Administrativa",  dept: "Administración", jp: jpAdmin,      ct: "indefinido", gender: "femenino",  bd: "1992-07-22", edu: "tecnico",      cs: "soltero",     eps: "Compensar EPS",  arl: "Positiva",      afp: "Colpensiones",   ccf: "Compensar" },
      { id: uuid(), num: "GM-30456789", name: "Jorge Luis Herrera Patiño",       email: "jorge.herrera.gm@demosst.co",   pos: "Conductor",                dept: "Logística",      jp: jpConductor,  ct: "indefinido", gender: "masculino", bd: "1985-11-05", edu: "secundaria",   cs: "casado",      eps: "Famisanar",      arl: "ARL Sura",      afp: "Protección",     ccf: "Colsubsidio" },
      { id: uuid(), num: "GM-40567890", name: "Luz Marina Castillo Vargas",      email: "luz.castillo.gm@demosst.co",    pos: "Operaria de Producción",   dept: "Producción",     jp: jpOperario,   ct: "fijo",       gender: "femenino",  bd: "1990-04-18", edu: "tecnico",      cs: "union_libre", eps: "Sura EPS",       arl: "Positiva",      afp: "Colfondos",      ccf: "Cafam" },
      { id: uuid(), num: "GM-50678901", name: "Andrés Felipe Torres Morales",    email: "andres.torres.gm@demosst.co",   pos: "Supervisor SST",           dept: "SST",            jp: jpSupervisor, ct: "indefinido", gender: "masculino", bd: "1983-09-30", edu: "profesional",  cs: "casado",      eps: "Compensar EPS",  arl: "ARL Sura",      afp: "Protección",     ccf: "Compensar" },
      { id: uuid(), num: "GM-60789012", name: "Sandra Milena Rojas Cifuentes",   email: "sandra.rojas.gm@demosst.co",    pos: "Operaria de Producción",   dept: "Producción",     jp: jpOperario,   ct: "obra-labor", gender: "femenino",  bd: "1995-01-28", edu: "secundaria",   cs: "soltero",     eps: "Sura EPS",       arl: "Positiva",      afp: "Colpensiones",   ccf: "Cafam" },
      { id: uuid(), num: "GM-70890123", name: "Ricardo Alberto Peña Suárez",     email: "ricardo.pena.gm@demosst.co",    pos: "Conductor",                dept: "Logística",      jp: jpConductor,  ct: "indefinido", gender: "masculino", bd: "1987-06-12", edu: "tecnico",      cs: "casado",      eps: "Famisanar",      arl: "ARL Sura",      afp: "Protección",     ccf: "Colsubsidio" },
      { id: uuid(), num: "GM-80901234", name: "Paola Andrea Jiménez Acosta",     email: "paola.jimenez.gm@demosst.co",   pos: "Auxiliar Administrativa",  dept: "Administración", jp: jpAdmin,      ct: "indefinido", gender: "femenino",  bd: "1993-12-03", edu: "tecnologo",    cs: "soltero",     eps: "Compensar EPS",  arl: "Positiva",      afp: "Colfondos",      ccf: "Compensar" },
      { id: uuid(), num: "GM-90012345", name: "Eduardo José Sánchez Bermúdez",   email: "eduardo.sanchez.gm@demosst.co", pos: "Operario de Producción",   dept: "Producción",     jp: jpOperario,   ct: "indefinido", gender: "masculino", bd: "1989-08-25", edu: "secundaria",   cs: "casado",      eps: "Sura EPS",       arl: "ARL Sura",      afp: "Protección",     ccf: "Cafam" },
      { id: uuid(), num: "GM-11223344", name: "Claudia Patricia Reyes Montoya",  email: "claudia.reyes.gm@demosst.co",   pos: "Operaria de Producción",   dept: "Producción",     jp: jpOperario,   ct: "fijo",       gender: "femenino",  bd: "1991-05-17", edu: "secundaria",   cs: "casado",      eps: "Famisanar",      arl: "Positiva",      afp: "Protección",     ccf: "Colsubsidio" },
      { id: uuid(), num: "GM-22334455", name: "Felipe Augusto Moreno Castro",    email: "felipe.moreno.gm@demosst.co",   pos: "Conductor",                dept: "Logística",      jp: jpConductor,  ct: "indefinido", gender: "masculino", bd: "1986-02-09", edu: "tecnico",      cs: "union_libre", eps: "Compensar EPS",  arl: "ARL Sura",      afp: "Colpensiones",   ccf: "Compensar" },
      { id: uuid(), num: "GM-33445566", name: "Natalia Esperanza Duarte Ruiz",   email: "natalia.duarte.gm@demosst.co",  pos: "Auxiliar Administrativa",  dept: "Administración", jp: jpAdmin,      ct: "indefinido", gender: "femenino",  bd: "1994-10-20", edu: "profesional",  cs: "soltero",     eps: "Sura EPS",       arl: "Positiva",      afp: "Colfondos",      ccf: "Cafam" },
      { id: uuid(), num: "GM-44556677", name: "Germán Alirio Vargas Ospina",     email: "german.vargas.gm@demosst.co",   pos: "Operario de Producción",   dept: "Producción",     jp: jpOperario,   ct: "obra-labor", gender: "masculino", bd: "1990-07-07", edu: "secundaria",   cs: "casado",      eps: "Famisanar",      arl: "ARL Sura",      afp: "Protección",     ccf: "Colsubsidio" },
      { id: uuid(), num: "GM-55667788", name: "Adriana Lucía Cardona Aguilar",   email: "adriana.cardona.gm@demosst.co", pos: "Operaria de Producción",   dept: "Producción",     jp: jpOperario,   ct: "indefinido", gender: "femenino",  bd: "1988-11-30", edu: "tecnico",      cs: "casado",      eps: "Compensar EPS",  arl: "Positiva",      afp: "Colpensiones",   ccf: "Compensar" },
      { id: uuid(), num: "GM-66778899", name: "Hernando José Mejía Londoño",     email: "hernando.mejia.gm@demosst.co",  pos: "Operario de Producción",   dept: "Producción",     jp: jpOperario,   ct: "indefinido", gender: "masculino", bd: "1987-04-22", edu: "secundaria",   cs: "casado",      eps: "Sura EPS",       arl: "ARL Sura",      afp: "Protección",     ccf: "Cafam" },
    ];

    for (const w of workers) {
      await client.query(`
        INSERT INTO workers (id, company_id, identification_number, name, email, position, department, contract_type, contract_number, start_date, status, job_profile_id, eps_nombre, arl_nombre, afp_nombre, ccf_nombre, gender, birth_date, education_level, civil_status)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'2023-01-15','activo',$10,$11,$12,$13,$14,$15,$16,$17,$18)
      `, [w.id, GM, w.num, w.name, w.email, w.pos, w.dept, w.ct,
          `CONT-GM-2023-${w.num.replace("GM-","").substring(0,4)}`, w.jp,
          w.eps, w.arl, w.afp, w.ccf, w.gender, w.bd, w.edu, w.cs]);
    }

    // ── 4. Afiliaciones SSSS ──────────────────────────────────────────────────
    console.log("4. Creando afiliaciones SSSS...");
    for (const w of workers) {
      await client.query(`
        INSERT INTO afiliaciones_ssss (id, company_id, worker_id, fecha, eps_nombre, arl_nombre, afp_nombre, ccf_nombre)
        VALUES ($1,$2,$3,'2023-01-15',$4,$5,$6,$7)
      `, [uuid(), GM, w.id, w.eps, w.arl, w.afp, w.ccf]);
    }

    // ── 5. Contratos ──────────────────────────────────────────────────────────
    console.log("5. Creando contratos...");
    const ctV2Map: Record<string,string> = { "indefinido":"indefinido","fijo":"fijo","temporal":"ocasional","obra-labor":"obra_labor","aprendizaje":"aprendizaje" };
    let cSeq = 1;
    for (const w of workers) {
      const endDate = w.ct === "fijo" ? "'2025-01-14'" : "NULL";
      const ctV2 = ctV2Map[w.ct] || "indefinido";
      await client.query(`
        INSERT INTO contracts (id, company_id, worker_id, identification_number, job_profile_id, contract_type_v2, contract_number, start_date, end_date, salary, position, department, work_schedule, arl_rate, contract_status_v2)
        VALUES ($1,$2,$3,$4,$5,$6,$7,'2023-01-15',${endDate},$8,$9,$10,'Lunes a Viernes 7am-5pm','0.522',$11)
      `, [uuid(), GM, w.id, w.num.replace("GM-",""), w.jp, ctV2,
          `CONT-GM-2023-${String(cSeq++).padStart(4,"0")}`,
          w.dept === "Logística" ? 1800000 : w.dept === "Administración" ? 1500000 : 1300000,
          w.pos, w.dept, "activo"]);
    }

    // ── 6. Capacitaciones ─────────────────────────────────────────────────────
    console.log("6. Creando capacitaciones...");
    const trainings = [
      { id: uuid(), title: "Inducción SST - Reglamento Interno y Política", instructor: "Andrés Torres", date: "2023-02-01", status: "completada", desc: "Inducción inicial en Seguridad y Salud en el Trabajo, reglamento interno y política SST." },
      { id: uuid(), title: "Trabajo en Alturas - Nivel Básico", instructor: "Instituto Colombiano SST", date: "2023-03-15", status: "completada", desc: "Capacitación obligatoria para trabajo en alturas según Resolución 4272/2021." },
      { id: uuid(), title: "Uso y Mantenimiento de Extintores", instructor: "Bomberos Voluntarios", date: "2023-04-10", status: "completada", desc: "Manejo práctico de extintores, tipos de fuego y evacuación de emergencias." },
      { id: uuid(), title: "Primeros Auxilios Básicos", instructor: "Cruz Roja Colombiana", date: "2023-06-20", status: "completada", desc: "Atención de emergencias médicas, RCP básico y manejo de heridas." },
      { id: uuid(), title: "Manejo Defensivo y Seguridad Vial", instructor: "FIA Foundation Colombia", date: "2023-08-05", status: "completada", desc: "Conducción defensiva, normativa vial y prevención de accidentes de tránsito." },
      { id: uuid(), title: "Riesgo Químico y Manejo de Sustancias Peligrosas", instructor: "CISPROQUIM", date: "2024-02-14", status: "completada", desc: "Identificación, almacenamiento y manejo seguro de sustancias químicas." },
      { id: uuid(), title: "Riesgo Psicosocial y Bienestar Laboral", instructor: "Psicóloga Ocupacional - Dra. Rivera", date: "2024-04-22", status: "completada", desc: "Identificación de factores de riesgo psicosocial e intervención en bienestar." },
      { id: uuid(), title: "Actualización Anual SST 2025", instructor: "Andrés Torres", date: "2025-01-20", status: "completada", desc: "Actualización de conocimientos SST, cambios normativos y lecciones aprendidas." },
    ];

    for (const t of trainings) {
      await client.query(`
        INSERT INTO trainings (id, company_id, title, description, instructor, date, start_time, end_time, location, total_workers, validity_months, status)
        VALUES ($1,$2,$3,$4,$5,$6,'08:00','12:00','Sala de Capacitaciones',$7,12,$8)
      `, [t.id, GM, t.title, t.desc, t.instructor, t.date, workers.length, t.status]);
    }

    // Asistentes: todos los trabajadores en las primeras 5 capacitaciones, operarios en las técnicas
    for (const t of trainings) {
      const attendees = t.title.includes("Manejo Defensivo")
        ? workers.filter(w => w.dept === "Logística")
        : t.title.includes("Riesgo Psicosocial")
        ? workers.filter(w => w.dept === "Administración" || w.pos.includes("Supervisor"))
        : workers;

      for (const w of attendees) {
        await client.query(`
          INSERT INTO training_attendees (id, training_id, worker_id, attended, confirmed)
          VALUES ($1,$2,$3,1,1)
        `, [uuid(), t.id, w.id]);
      }
    }

    // ── 7. Exámenes médicos ───────────────────────────────────────────────────
    console.log("7. Creando exámenes médicos...");
    for (const w of workers) {
      // Ingreso
      await client.query(`
        INSERT INTO medical_exams (id, company_id, worker_id, job_profile_id, exam_type, scheduled_date, performed_date, medical_center, attending_physician, aptitude, status)
        VALUES ($1,$2,$3,$4,'preocupacional','2023-01-10','2023-01-12','IPS Salud Ocupacional Norte','Dr. Ramírez Ortiz','apto','realizado')
      `, [uuid(), GM, w.id, w.jp]);
    }
    // Periódicos (solo los primeros 10)
    for (const w of workers.slice(0, 10)) {
      await client.query(`
        INSERT INTO medical_exams (id, company_id, worker_id, job_profile_id, exam_type, scheduled_date, performed_date, medical_center, attending_physician, aptitude, status, follow_up_date)
        VALUES ($1,$2,$3,$4,'periodico','2024-01-15','2024-01-17','IPS Salud Ocupacional Norte','Dr. Ramírez Ortiz','apto','realizado','2025-01-17')
      `, [uuid(), GM, w.id, w.jp]);
    }

    // ── 8. Condiciones de salud ───────────────────────────────────────────────
    console.log("8. Creando condiciones de salud...");
    const conditions = [
      { wIdx: 2, type: "cronica", desc: "Lumbalgia crónica por postura sedente prolongada durante conducción", rfu: 1, fud: "2025-06-15" },
      { wIdx: 5, type: "restriccion", desc: "Síndrome del túnel carpiano leve en mano derecha", rfu: 1, fud: "2025-04-30" },
      { wIdx: 9, type: "cronica", desc: "Hipoacusia leve bilateral - exposición a ruido industrial", rfu: 0, fud: null },
    ];
    for (const c of conditions) {
      await client.query(`
        INSERT INTO health_conditions (id, company_id, worker_id, condition_type, description, diagnosis_date, status, requires_follow_up, follow_up_date)
        VALUES ($1,$2,$3,$4,$5,'2024-02-10','activo',$6,${c.fud ? `'${c.fud}'` : "NULL"})
      `, [uuid(), GM, workers[c.wIdx].id, c.type, c.desc, c.rfu]);
    }

    // ── 9. Designación de responsable SST ────────────────────────────────────
    console.log("9. Creando designación SST...");
    await client.query(`
      INSERT INTO responsible_designations (id, company_id, worker_id, job_profile_id, designation_date, position, responsibilities, status, curso_50_horas, nivel_formacion)
      VALUES ($1,$2,$3,$4,'2023-01-15','Supervisor de SST',ARRAY['Planear y ejecutar el SG-SST','Realizar inspecciones de seguridad','Investigar incidentes y accidentes','Coordinar capacitaciones','Reportar indicadores SST'],'activo',true,'tecnologo')
    `, [uuid(), GM, workers[4].id, jpSupervisor]);

    // ── 10. Accidentes ────────────────────────────────────────────────────────
    console.log("10. Creando accidentes...");
    await client.query(`
      INSERT INTO accidents (id, company_id, worker_id, type, severity, description, date, time, location, body_part_affected, injury_nature, actions_taken, accident_mechanism, accident_classification, was_hospitalized, er_referral)
      VALUES
        ($1,$2,$3,'caida_mismo_nivel','leve','Trabajador resbaló en piso húmedo al salir del baño industrial, cayó sobre brazo derecho.','2023-09-12','10:30','Zona de Baños - Planta','Brazo derecho - codo','Contusión y hematoma','Atención médica inmediata, señalización de piso húmedo, análisis de causa raíz','Caída por piso resbaloso','normal',0,0),
        ($4,$2,$5,'otro','leve','Operario detectó fuga menor de aceite hidráulico en máquina inyectora. No hubo lesionados.','2024-03-07','14:15','Área de Producción - Máquina 3','N/A','Sin lesión','Paro inmediato de máquina, limpieza y sellado de fuga, reporte al área técnica','Falla mecánica - sello desgastado','normal',0,0)
    `, [uuid(), GM, workers[2].id, uuid(), workers[7].id]);

    // ── 11. Inspecciones ──────────────────────────────────────────────────────
    console.log("11. Creando inspecciones...");
    const inspections = [
      { area: "Planta de Producción", inspector: "Andrés Torres", date: "2023-11-08", findings: 3, compliance: 78, status: "aprobada", obs: "Se encontraron 3 hallazgos menores: señalización inadecuada en 2 puestos, falta de EPP en rack de herramientas. Todos corregidos." },
      { area: "Almacén y Bodega", inspector: "Andrés Torres", date: "2024-01-20", findings: 2, compliance: 85, status: "aprobada", obs: "Estanterías sin seguro en 2 bahías, extintores con etiqueta vencida. Acciones correctivas ejecutadas." },
      { area: "Área Administrativa", inspector: "Sandra Rojas", date: "2024-03-15", findings: 1, compliance: 92, status: "aprobada", obs: "Cableado eléctrico bajo escritorio sin organizar. Corregido en 5 días." },
      { area: "Parqueadero y Vías Internas", inspector: "Andrés Torres", date: "2024-06-10", findings: 2, compliance: 80, status: "aprobada", obs: "Demarcación desgastada en zona de cargue. Señalización actualizada." },
      { area: "Planta de Producción", inspector: "Andrés Torres", date: "2025-01-25", findings: 1, compliance: 90, status: "pendiente", obs: "Revisión de inicio de año. Hallazgo: extintor requiere recarga. En proceso de corrección." },
    ];
    for (const ins of inspections) {
      await client.query(`
        INSERT INTO inspections (id, company_id, area, inspector, date, findings, compliance, observations, status)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      `, [uuid(), GM, ins.area, ins.inspector, ins.date, ins.findings, ins.compliance, ins.obs, ins.status]);
    }

    // ── 12. Política SST ──────────────────────────────────────────────────────
    console.log("12. Creando política SST...");
    await client.query(`
      INSERT INTO politicas_sst (id, company_id, codigo, version, fecha_emision, fecha_proxima_revision, estado, declaracion_compromiso, objetivos, alcance, responsabilidades, compromisos, recursos, revision_comunicacion, representante_legal, cedula_representante, responsable_sst, fecha_firma, comunicada, fecha_comunicacion)
      VALUES ($1,$2,'POL-SST-001','2.0','2023-01-15','2025-01-15','vigente',
        'SOLUCIONES INTEGRALES DEMO SAS se compromete con la protección de la salud y seguridad de todos sus trabajadores, contratistas y partes interesadas, cumpliendo con la legislación colombiana vigente en SST y mejorando continuamente su desempeño.',
        'Identificar y controlar los peligros y riesgos laborales; garantizar condiciones seguras de trabajo; promover la participación activa de los trabajadores; cumplir con Resolución 0312/2019 y Decreto 1072/2015.',
        'Aplica a todas las actividades, procesos, trabajadores directos, contratistas y visitantes en las instalaciones de la empresa.',
        'La Alta Dirección provee recursos y lidera el SG-SST. El Supervisor SST ejecuta y hace seguimiento. Todos los trabajadores participan activamente en la identificación de peligros.',
        'Implementar y mantener el SG-SST; investigar incidentes; realizar inspecciones periódicas; ejecutar exámenes médicos ocupacionales; gestionar el COPASST.',
        'La empresa asigna los recursos financieros, técnicos y humanos necesarios para el SG-SST según el presupuesto anual aprobado.',
        'La política es comunicada a todos los trabajadores en la inducción y publicada en carteleras. Se revisa anualmente.',
        'Representante Legal Demo','900000001','Andrés Felipe Torres Morales','2023-01-15',1,'2023-02-01')
    `, [uuid(), GM]);

    // ── 13. Plan de trabajo anual ─────────────────────────────────────────────
    console.log("13. Creando plan de trabajo anual...");
    await client.query(`
      INSERT INTO planes_trabajo_anual (id, company_id, anio, fecha_elaboracion, objetivo_general, alcance, presupuesto_total, presupuesto_ejecutado, estado, responsable_elaboracion, cargo_responsable, email_responsable, fecha_aprobacion, aprobado_por, cargo_aprobador, total_actividades, actividades_completadas, porcentaje_cumplimiento)
      VALUES ($1,$2,2025,'2025-01-10',
        'Fortalecer el SG-SST de la empresa para alcanzar un cumplimiento superior al 85% en los estándares mínimos de la Resolución 0312/2019 y reducir la tasa de accidentalidad en un 20% respecto al año anterior.',
        'Todas las áreas de la empresa: producción, logística, administración y dirección, incluyendo trabajadores directos y contratistas.',
        12000000, 7200000, 'vigente',
        'Andrés Felipe Torres Morales', 'Supervisor SST', 'andres.torres@demosst.co',
        '2025-01-20', 'Carlos Representante Legal', 'Gerente General',
        24, 14, 58)
    `, [uuid(), GM]);

    // ── 14. Asignación de recursos ────────────────────────────────────────────
    console.log("14. Creando asignaciones de recursos...");
    await client.query(`
      INSERT INTO resource_allocations (id, company_id, date, resource_type, nombre_completo, cargo, objeto, num_unidades, inversion_estimada, monto_ejecutado, objetivo_general)
      VALUES
        ($1,$2,'2025-01-15','fisico','Andrés Felipe Torres Morales','Supervisor SST','Dotación EPP para trabajadores de producción (casco, botas, guantes, gafas)',15,'4500000','4500000','Garantizar el uso adecuado de EPP por parte de todos los trabajadores de planta'),
        ($3,$2,'2025-03-01','financiero','Andrés Felipe Torres Morales','Supervisor SST','Capacitación trabajo en alturas nivel avanzado - recertificación anual',5,'1800000','1800000','Cumplir con la Resolución 4272/2021 para trabajos en alturas')
    `, [uuid(), GM, uuid()]);

    // ── 15. Evaluación SST (para sección PESV/estándares) ────────────────────
    console.log("15. Creando evaluación SST...");
    const evalId = uuid();
    await client.query(`
      INSERT INTO sst_evaluations (id, company_id, standard_type, title, description, evaluation_date, evaluator, total_score, max_total_score, compliance_percentage, status, observations)
      VALUES ($1,$2,'RES_0312','Evaluación Inicial SG-SST - Resolución 0312/2019',
        'Evaluación de los estándares mínimos del SG-SST según Resolución 0312 de 2019. Empresa tipo 2 - Riesgo I a III con más de 10 trabajadores.',
        '2025-01-10','Andrés Felipe Torres Morales',77,102,75,'completada',
        'Se obtuvo un cumplimiento del 75% (Moderadamente Aceptable). Se identificaron oportunidades de mejora en los ciclos Verificar y Actuar.')
    `, [evalId, GM]);

    await client.query("COMMIT");
    console.log("\n✅ Golden Master poblado exitosamente.");
    console.log("✅ demo-room-001 desbloqueada.");
    console.log("\nResumen:");
    console.log(`  - ${workers.length} trabajadores creados`);
    console.log("  - 4 perfiles de cargo");
    console.log("  - 15 afiliaciones SSSS");
    console.log("  - 15 contratos");
    console.log(`  - ${trainings.length} capacitaciones`);
    console.log("  - 25 exámenes médicos (ingreso + periódicos)");
    console.log("  - 3 condiciones de salud");
    console.log("  - 1 designación SST");
    console.log("  - 2 accidentes/incidentes");
    console.log(`  - ${inspections.length} inspecciones`);
    console.log("  - 1 política SST");
    console.log("  - 1 plan de trabajo anual");
    console.log("  - 2 asignaciones de recursos");
    console.log("  - 1 evaluación SST (75% cumplimiento)");

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Error:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

run();
