import { Router, Request, Response } from "express";
import { db } from "../../server/db";
import { sql } from "drizzle-orm";
import { runHousekeeping } from "./service";
import logger from "../../server/lib/logger";
import { storage } from "../../server/storage";
import { comparePasswords } from "../../server/auth";

function extractRows(result: any): any[] {
  return (result as any).rows || result;
}

const router = Router();

function isTestMode(): boolean {
  return process.env.TEST_MODE === "true" && process.env.NODE_ENV !== "production";
}

async function recordTestLoginSession(req: Request, userId: string): Promise<void> {
  await db.execute(sql`
    UPDATE user_sessions_log
    SET is_active = false,
        logout_at = now(),
        duration_minutes = EXTRACT(EPOCH FROM (now() - login_at)) / 60
    WHERE user_id = ${userId} AND is_active = true
  `);

  await db.execute(sql`
    INSERT INTO user_sessions_log (
      user_id,
      session_id,
      ip_address,
      user_agent,
      device_id,
      access_decision,
      login_at,
      last_activity_at,
      is_active,
      is_suspicious
    )
    VALUES (
      ${userId},
      ${req.sessionID},
      ${req.ip || "127.0.0.1"},
      ${req.get("user-agent") || null},
      'automated-test',
      'allowed',
      now(),
      now(),
      true,
      false
    )
  `);
}

router.use((req, res, next) => {
  if (!isTestMode()) {
    return res.status(404).json({ error: "Not found" });
  }
  next();
});

router.post("/demo/expire-room", async (req: Request, res: Response) => {
  try {
    const { roomId } = req.body;
    if (!roomId) {
      return res.status(400).json({ error: "roomId is required" });
    }
    
    await db.execute(sql`
      UPDATE demo_room_bookings 
      SET expires_at = now() - interval '1 minute',
          updated_at = now()
      WHERE room_id = ${roomId}
    `);
    
    return res.json({ success: true, message: `Room ${roomId} expired` });
  } catch (error: any) {
    logger.error({ err: error }, "[TestHooks] expire-room failed");
    return res.status(500).json({ error: error.message });
  }
});

router.post("/demo/run-housekeeping", async (req: Request, res: Response) => {
  try {
    const result = await runHousekeeping();
    return res.json({ success: true, ...result });
  } catch (error: any) {
    logger.error({ err: error }, "[TestHooks] run-housekeeping failed");
    return res.status(500).json({ error: error.message });
  }
});

router.get("/demo/room-status", async (req: Request, res: Response) => {
  try {
    const rooms = await db.execute(sql`
      SELECT room_id, company_id, demo_username, status, assigned_prospect_email, assigned_session_token, expires_at, last_reset_at, error_message, updated_at
       FROM demo_room_bookings ORDER BY room_id
    `);
    const rows = extractRows(rooms);
    return res.json({ rooms: rows });
  } catch (error: any) {
    logger.error({ err: error }, "[TestHooks] room-status failed");
    return res.status(500).json({ error: error.message });
  }
});

router.post("/demo/force-available", async (req: Request, res: Response) => {
  try {
    const { roomId } = req.body;
    if (!roomId) {
      return res.status(400).json({ error: "roomId is required" });
    }
    
    await db.execute(sql`
      UPDATE demo_room_bookings 
      SET status = 'available',
          assigned_prospect_email = NULL,
          assigned_session_token = NULL,
          expires_at = NULL,
          error_message = NULL,
          updated_at = now()
      WHERE room_id = ${roomId}
    `);
    
    const roomResult = await db.execute(sql`
      SELECT company_id FROM demo_room_bookings WHERE room_id = ${roomId}
    `);
    const roomRows = extractRows(roomResult);
    if (roomRows[0]) {
      await db.execute(sql`DELETE FROM users WHERE company_id = ${roomRows[0].company_id}`);
    }
    
    return res.json({ success: true, message: `Room ${roomId} forced to available` });
  } catch (error: any) {
    logger.error({ err: error }, "[TestHooks] force-available failed");
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/test/login-redirect?username=X&password=Y — login sin CAPTCHA con redirect (para Playwright)
// El navegador navega a esta URL, recibe la cookie de sesión y es redirigido al dashboard
router.get("/login-redirect", async (req: Request, res: Response) => {
  try {
    const { username, password, redirect = "/" } = req.query as { username?: string; password?: string; redirect?: string };
    if (!username || !password) {
      return res.status(400).send("username y password son requeridos como query params");
    }
    const user = await storage.getUserByUsername(username);
    if (!user) {
      return res.status(401).send("Usuario no encontrado");
    }
    const valid = await comparePasswords(password, user.password);
    if (!valid) {
      return res.status(401).send("Contraseña incorrecta");
    }
    req.logIn(user, async (err) => {
      if (err) {
        logger.error({ err }, "[TestHooks] login-redirect session error");
        return res.status(500).send("Error al establecer sesión");
      }
      try {
        await recordTestLoginSession(req, user.id);
        return res.redirect(redirect as string);
      } catch (sessionError) {
        logger.error({ err: sessionError }, "[TestHooks] login-redirect audit session error");
        return res.status(500).send("Error al registrar sesión de prueba");
      }
    });
  } catch (error: any) {
    logger.error({ err: error }, "[TestHooks] login-redirect failed");
    return res.status(500).send(error.message);
  }
});

// POST /api/test/login — login sin CAPTCHA para pruebas automatizadas (solo TEST_MODE)
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "username y password requeridos" });
    }
    const user = await storage.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }
    const valid = await comparePasswords(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }
    req.logIn(user, async (err) => {
      if (err) {
        logger.error({ err }, "[TestHooks] login session error");
        return res.status(500).json({ error: "Error al establecer sesión" });
      }
      try {
        await recordTestLoginSession(req, user.id);
        const { password: _pw, ...safeUser } = user as any;
        return res.json({ ok: true, user: safeUser });
      } catch (sessionError) {
        logger.error({ err: sessionError }, "[TestHooks] login audit session error");
        return res.status(500).json({ error: "Error al registrar sesión de prueba" });
      }
    });
  } catch (error: any) {
    logger.error({ err: error }, "[TestHooks] login failed");
    return res.status(500).json({ error: error.message });
  }
});

export default router;
