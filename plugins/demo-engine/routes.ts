import { Router, Request, Response } from "express";
import { isDemoEnabled } from "./types";
import { checkIn, getDemoRoomStatus, runHousekeeping, getDemoHealthDiagnostics } from "./service";
import logger from "../../server/lib/logger";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 255;

const router = Router();

router.post("/check-in", async (req: Request, res: Response) => {
  if (!isDemoEnabled()) {
    return res.status(404).json({ error: "Not found" });
  }

  try {
    const { email, prospectEmail } = req.body || {};
    const inputEmail = email || prospectEmail;

    if (inputEmail !== undefined && inputEmail !== null && inputEmail !== "") {
      if (typeof inputEmail !== "string" || inputEmail.length > MAX_EMAIL_LENGTH || !EMAIL_REGEX.test(inputEmail)) {
        return res.status(400).json({
          error: "Invalid email",
          message: "Por favor proporcione un correo electrónico válido.",
        });
      }
    }

    const result = await checkIn(inputEmail || undefined);
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
    const diagnostics = await getDemoHealthDiagnostics();
    return res.json(diagnostics);
  } catch (error: any) {
    logger.error({ err: error }, "[DemoEngine] Health check error");
    return res.status(500).json({ error: "Health check failed", message: error.message });
  }
});

export default router;
