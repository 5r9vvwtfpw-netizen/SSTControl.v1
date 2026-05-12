/**
 * ENDPOINT TEMPORAL DE RESTAURACIÓN — SADGI S.A.S.
 * Uso único para recrear la empresa eliminada accidentalmente.
 * ELIMINAR después de usar.
 */
import { Router } from "express";
import { db } from "../db";
import { sql } from "drizzle-orm";
import { hashPassword } from "../auth";

const router = Router();

const RESTORE_SECRET = "SADGI-RESTORE-2026-ONCE";

router.post("/restore-sadgi", async (req, res) => {
  const { secret, adminPassword } = req.body;

  if (secret !== RESTORE_SECRET) {
    return res.status(403).json({ error: "Clave incorrecta" });
  }

  if (!adminPassword || adminPassword.length < 8) {
    return res.status(400).json({ error: "adminPassword requerido (mín 8 caracteres)" });
  }

  try {
    // Verificar que no exista ya
    const existing = await db.execute(sql`SELECT id FROM companies WHERE nit = '902.036.337-4' LIMIT 1`);
    const rows = (existing as any).rows || existing;
    if (Array.isArray(rows) && rows.length > 0) {
      return res.status(409).json({ error: "La empresa ya existe", id: rows[0].id });
    }

    // 1. Crear la empresa
    const companyResult = await db.execute(sql`
      INSERT INTO companies (
        id, name, nit, city, address, contact_email,
        number_of_workers, risk_level, calculated_chapter,
        onboarding_completed, created_at
      ) VALUES (
        gen_random_uuid(),
        'SISTEMA AUTOMATIZADO DE GESTION INTEGRAL S.A.S',
        '902.036.337-4',
        'Bogotá',
        'Colombia',
        'admin@sst-colombia.com',
        10,
        'I',
        '1',
        1,
        now()
      ) RETURNING id, name, nit
    `);

    const companyRows = (companyResult as any).rows || companyResult;
    const company = companyRows[0];

    if (!company) {
      return res.status(500).json({ error: "No se pudo crear la empresa" });
    }

    // 2. Crear suscripción activa con plan sst_dinamico (ilimitado, precio $0)
    await db.execute(sql`
      INSERT INTO subscriptions (
        id, company_id, plan_id, workers_purchased,
        status, billing_interval,
        current_period_start, current_period_end,
        notes
      ) VALUES (
        gen_random_uuid(),
        ${company.id},
        'sst_dinamico',
        9999,
        'active',
        'monthly',
        now(),
        '2099-12-31 23:59:59',
        'Empresa propietaria del sistema — suscripción permanente'
      )
    `);

    // 3. Crear pricing_plugin_subscriptions (requerido por el sistema)
    await db.execute(sql`
      INSERT INTO pricing_plugin_subscriptions (
        id, company_id, plan_key, status,
        current_period_start, current_period_end,
        workers_included, price_per_worker, base_price
      ) VALUES (
        gen_random_uuid(),
        ${company.id},
        'sst_dinamico',
        'active',
        now(),
        '2099-12-31 23:59:59',
        9999,
        0,
        0
      )
    `);

    // 4. Crear usuario admin de la empresa
    const hashedPassword = await hashPassword(adminPassword);
    const userResult = await db.execute(sql`
      INSERT INTO users (
        id, username, password, role, full_name,
        email, company_id, created_at
      ) VALUES (
        gen_random_uuid(),
        'admin_sadgi',
        ${hashedPassword},
        'superusuario',
        'Administrador SADGI S.A.S.',
        'admin@sst-colombia.com',
        ${company.id},
        now()
      ) RETURNING id, username, role
    `);

    const userRows = (userResult as any).rows || userResult;
    const user = userRows[0];

    return res.json({
      success: true,
      message: "Empresa SADGI S.A.S. restaurada exitosamente",
      company,
      user,
      subscription: "sst_dinamico — activa hasta 2099",
    });

  } catch (error: any) {
    console.error("[RESTORE-SADGI] Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
