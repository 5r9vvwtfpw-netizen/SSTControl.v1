import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { isDemoEnabled } from "./types";
import { checkIn, getDemoRoomStatus, runHousekeeping, getDemoHealthDiagnostics } from "./service";
import logger from "../../server/lib/logger";
import { db } from "../../server/db";
import { sql } from "drizzle-orm";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 255;

function extractRows(result: any): any[] {
  return (result as any).rows || result;
}

function extractEmailFromJwt(authHeader: string | undefined): { email: string } | { error: string } {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Authorization header with Bearer token required" };
  }

  const token = authHeader.substring(7);
  const secret = process.env.JWT_RECALCULATE_SECRET;

  if (!secret) {
    logger.error("[DemoEngine] JWT_RECALCULATE_SECRET not configured");
    return { error: "Server configuration error" };
  }

  try {
    const payload = jwt.verify(token, secret, { algorithms: ["HS256"] }) as any;
    const email = payload.email;

    if (!email || typeof email !== "string") {
      return { error: "JWT payload must contain email field" };
    }

    return { email };
  } catch (err: any) {
    logger.warn({ err: err.message }, "[DemoEngine] JWT verification failed");
    return { error: "Invalid or expired JWT token" };
  }
}

const router = Router();

router.post("/check-in", async (req: Request, res: Response) => {
  if (!isDemoEnabled()) {
    return res.status(404).json({ error: "Not found" });
  }

  try {
    const authHeader = req.headers.authorization;
    let inputEmail: string | undefined;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const jwtResult = extractEmailFromJwt(authHeader);
      if ("error" in jwtResult) {
        return res.status(401).json({ error: jwtResult.error });
      }
      inputEmail = jwtResult.email;
      logger.info({ email: inputEmail }, "[DemoEngine] Check-in via JWT from landing page");
    } else {
      const { email, prospectEmail } = req.body || {};
      inputEmail = email || prospectEmail || undefined;
    }

    if (inputEmail !== undefined && inputEmail !== null && inputEmail !== "") {
      if (typeof inputEmail !== "string" || inputEmail.length > MAX_EMAIL_LENGTH || !EMAIL_REGEX.test(inputEmail)) {
        return res.status(400).json({
          error: "Invalid email",
          message: "Por favor proporcione un correo electrónico válido.",
        });
      }
    }

    const countCheck = await db.execute(sql`SELECT count(*) as cnt FROM demo_room_bookings`);
    const countRows = extractRows(countCheck);
    const roomCount = parseInt(countRows[0]?.cnt || countRows[0]?.count || "0", 10);
    if (roomCount === 0) {
      logger.info("[DemoEngine] No rooms in DB during check-in, auto-initializing...");
      await initializeRoomsViaRawSql();
    }

    const result = await checkIn(inputEmail || undefined);

    const appUrl = process.env.APP_URL || process.env.VITE_APP_URL || "";
    const fullVerifyUrl = appUrl ? `${appUrl}${result.verifyUrl}` : result.verifyUrl;

    return res.json({
      ...result,
      token: result.verifyUrl?.split("token=")[1] || "",
      verifyUrl: fullVerifyUrl,
      email: inputEmail || null,
      resent: false,
    });
  } catch (error: any) {
    if (error.message === "NO_ROOMS_AVAILABLE") {
      return res.status(503).json({
        error: "All demo rooms are currently in use",
        message: "Todas las salas demo están en uso. Por favor intente de nuevo en unos minutos.",
        retryAfter: 300,
      });
    }

    logger.error({ err: error, stack: error.stack }, "[DemoEngine] Check-in error");
    return res.status(500).json({
      error: "Demo check-in failed",
      message: "Error al inicializar la demo. Por favor intente de nuevo.",
    });
  }
});

router.get("/status", async (req: Request, res: Response) => {
  if (!isDemoEnabled()) {
    return res.status(404).json({ error: "Not found" });
  }

  const user = req.user as any;
  if (!user || !["superadmin", "admin", "soporte"].includes(user?.role)) {
    return res.status(403).json({ error: "Not authorized" });
  }

  try {
    const rooms = await getDemoRoomStatus();
    return res.json({ rooms });
  } catch (error: any) {
    logger.error({ err: error }, "[DemoEngine] Status error");
    return res.status(500).json({ error: "Failed to get demo status" });
  }
});

router.post("/force-reset", async (req: Request, res: Response) => {
  if (!isDemoEnabled()) {
    return res.status(404).json({ error: "Not found" });
  }

  const user = req.user as any;
  if (!user || !["superadmin"].includes(user?.role)) {
    return res.status(403).json({ error: "Not authorized" });
  }

  try {
    const result = await runHousekeeping();
    return res.json({ message: "Housekeeping completed", ...result });
  } catch (error: any) {
    logger.error({ err: error }, "[DemoEngine] Force reset error");
    return res.status(500).json({ error: "Housekeeping failed" });
  }
});

router.get("/health", async (_req: Request, res: Response) => {
  if (!isDemoEnabled()) {
    return res.status(404).json({ error: "Not found" });
  }

  try {
    const countResult = await db.execute(sql`SELECT count(*) as cnt FROM demo_room_bookings`);
    const countRows = extractRows(countResult);
    const roomCount = parseInt(countRows[0]?.cnt || countRows[0]?.count || "0", 10);

    if (roomCount === 0) {
      logger.info("[DemoEngine] Health check: No rooms found, auto-initializing...");
      try {
        await initializeRoomsViaRawSql();
      } catch (initErr: any) {
        logger.error({ err: initErr }, "[DemoEngine] Auto-init failed during health check");
      }
    }

    const diagnostics = await getDemoHealthDiagnostics();
    return res.json(diagnostics);
  } catch (error: any) {
    logger.error({ err: error }, "[DemoEngine] Health check error");
    return res.status(500).json({ error: "Health check failed", message: error.message });
  }
});

async function initializeRoomsViaRawSql() {
  const ROOM_IDS = [
    "demo-room-001", "demo-room-002", "demo-room-003", "demo-room-004", "demo-room-005",
    "demo-room-006", "demo-room-007", "demo-room-008", "demo-room-009", "demo-room-010",
  ];
  const COMPANY_IDS = [
    "demo-company-room-001", "demo-company-room-002", "demo-company-room-003",
    "demo-company-room-004", "demo-company-room-005", "demo-company-room-006",
    "demo-company-room-007", "demo-company-room-008", "demo-company-room-009",
    "demo-company-room-010",
  ];
  for (let i = 0; i < ROOM_IDS.length; i++) {
    await db.execute(sql`
      INSERT INTO demo_room_bookings (room_id, company_id, demo_username, status, updated_at)
      VALUES (${ROOM_IDS[i]}, ${COMPANY_IDS[i]}, ${`demo${i + 1}`}, 'available', now())
      ON CONFLICT (room_id) DO NOTHING
    `);
  }
  logger.info("[DemoEngine] Auto-initialized 10 demo rooms via health check");
}

router.post("/verify", async (req: Request, res: Response) => {
  if (!isDemoEnabled()) {
    return res.status(404).json({ error: "Not found" });
  }

  try {
    const { token } = req.body || {};

    if (!token || typeof token !== "string") {
      return res.status(400).json({ success: false, error: "Token requerido" });
    }

    logger.info({ tokenLength: token.length, tokenPreview: token.substring(0, 8) + "..." }, "[DemoEngine] Verify attempt");

    const roomResult = await db.execute(sql`
      SELECT * FROM demo_room_bookings
      WHERE assigned_session_token = ${token}
      LIMIT 1
    `);

    const roomRows = extractRows(roomResult);
    const room = roomRows[0];

    if (!room) {
      logger.warn({ tokenPreview: token.substring(0, 8) + "..." }, "[DemoEngine] Verify failed - token not found in any room");
      return res.status(401).json({ success: false, error: "Token inválido o expirado" });
    }

    logger.info({ roomId: room.room_id, status: room.status, expiresAt: room.expires_at }, "[DemoEngine] Room found for token");

    if (room.status === "resetting") {
      return res.status(202).json({
        success: false,
        error: "La demo se está preparando. Espere un momento...",
        retry: true,
        retryAfter: 3,
      });
    }

    if (room.status !== "occupied") {
      logger.warn({ roomId: room.room_id, status: room.status }, "[DemoEngine] Verify failed - room not in occupied status");
      return res.status(401).json({ success: false, error: "Token inválido o expirado" });
    }

    if (room.expires_at && new Date(room.expires_at) < new Date()) {
      logger.warn({ roomId: room.room_id, expiresAt: room.expires_at }, "[DemoEngine] Verify failed - token expired");
      return res.status(401).json({ success: false, error: "La demo ha expirado" });
    }

    const companyId = room.company_id;

    const userResult = await db.execute(sql`
      SELECT * FROM users WHERE company_id = ${companyId} AND role = 'admin' LIMIT 1
    `);

    const userRows = extractRows(userResult);
    const demoUser = userRows[0];

    if (!demoUser) {
      logger.error({ companyId, roomId: room.room_id }, "[DemoEngine] No admin user found for demo company");
      return res.status(500).json({ success: false, error: "Error al preparar la demo. La sala aún no está lista." });
    }

    req.session.regenerate((err) => {
      if (err) {
        logger.error({ err }, "[DemoEngine] Session regeneration error during verify");
        return res.status(500).json({ success: false, error: "Error al crear la sesión" });
      }

      req.logIn(demoUser as any, (err) => {
        if (err) {
          logger.error({ err }, "[DemoEngine] Login error during verify");
          return res.status(500).json({ success: false, error: "Error al iniciar sesión" });
        }

        logger.info({ roomId: room.room_id, companyId, username: demoUser.username }, "[DemoEngine] Auto-login via verify token successful");

        return res.json({
          success: true,
          user: {
            id: demoUser.id,
            username: demoUser.username,
            role: demoUser.role,
            fullName: demoUser.full_name,
            companyId: demoUser.company_id,
          },
        });
      });
    });
  } catch (error: any) {
    logger.error({ err: error, stack: error.stack }, "[DemoEngine] Verify error");
    return res.status(500).json({ success: false, error: "Error al verificar el token" });
  }
});

export default router;
