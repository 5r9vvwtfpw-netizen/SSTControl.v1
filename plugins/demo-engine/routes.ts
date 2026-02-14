import { Router, Request, Response } from "express";
import { isDemoEnabled } from "./types";
import { checkIn, getDemoRoomStatus, runHousekeeping } from "./service";
import logger from "../../server/lib/logger";

const router = Router();

router.post("/check-in", async (req: Request, res: Response) => {
  if (!isDemoEnabled()) {
    return res.status(404).json({ error: "Not found" });
  }

  try {
    const { email, prospectEmail } = req.body || {};
    const result = await checkIn(email || prospectEmail);
    return res.json(result);
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
      debug: process.env.NODE_ENV !== "production" ? error.message : undefined,
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

router.post("/debug-checkin", async (req: Request, res: Response) => {
  if (!isDemoEnabled()) {
    return res.status(404).json({ error: "Not found" });
  }

  const { secret, email } = req.body || {};
  if (secret !== process.env.JWT_RECALCULATE_SECRET) {
    return res.status(403).json({ error: "Not authorized" });
  }

  try {
    const { db } = await import("../../server/db");
    const { sql } = await import("drizzle-orm");

    const goldenMasterId = process.env.DEMO_GOLDEN_MASTER_ID || "demo-golden-master";
    const gmResult = await db.execute(sql.raw(
      `SELECT id, name FROM companies WHERE id = '${goldenMasterId}' LIMIT 1`
    ));
    const gmRows = (gmResult as any).rows || gmResult;

    const allCompanies = await db.execute(sql.raw(
      `SELECT id, name FROM companies ORDER BY name LIMIT 20`
    ));
    const allRows = (allCompanies as any).rows || allCompanies;

    const dbInfo = {
      goldenMasterId,
      goldenMasterFound: gmRows.length > 0,
      goldenMaster: gmRows[0] || null,
      companiesInDb: allRows,
      nodeEnv: process.env.NODE_ENV,
      dbType: process.env.AWS_RDS_HOST ? "AWS RDS" : "Neon",
    };

    if (email === "list-companies") {
      return res.json(dbInfo);
    }

    const result = await checkIn(email || "debug@sst-colombia.com");
    return res.json({ ...result, dbInfo });
  } catch (error: any) {
    return res.status(500).json({
      error: "Check-in failed",
      message: error.message,
      stack: error.stack?.split("\n").slice(0, 5),
    });
  }
});

router.post("/force-init", async (req: Request, res: Response) => {
  if (!isDemoEnabled()) {
    return res.status(404).json({ error: "Not found" });
  }

  const { secret } = req.body || {};
  if (secret !== process.env.JWT_RECALCULATE_SECRET) {
    return res.status(403).json({ error: "Not authorized" });
  }

  try {
    const { initializeDemoRooms } = await import("./service");
    const { db } = await import("../../server/db");
    const { sql } = await import("drizzle-orm");

    await db.execute(sql.raw(`
      UPDATE demo_room_bookings 
      SET status = 'available', 
          error_message = NULL,
          assigned_prospect_email = NULL,
          assigned_session_token = NULL,
          expires_at = NULL,
          updated_at = now()
      WHERE status IN ('error', 'resetting')
    `));

    await initializeDemoRooms();
    const rooms = await getDemoRoomStatus();
    return res.json({ message: "Demo rooms initialized (errors cleared)", rooms });
  } catch (error: any) {
    logger.error({ err: error }, "[DemoEngine] Force init error");
    return res.status(500).json({ error: "Initialization failed", detail: error.message });
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

export default router;
