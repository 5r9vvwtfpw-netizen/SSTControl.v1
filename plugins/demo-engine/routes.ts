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
    const { email } = req.body || {};
    const result = await checkIn(email);
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
