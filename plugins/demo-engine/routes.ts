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

    logger.error({ err: error }, "[DemoEngine] Check-in error");
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
    await initializeDemoRooms();
    const rooms = await getDemoRoomStatus();
    return res.json({ message: "Demo rooms initialized", rooms });
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
