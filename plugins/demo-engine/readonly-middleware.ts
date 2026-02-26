import { Request, Response, NextFunction } from "express";
import { DEMO_COMPANY_IDS } from "./types";
import logger from "../../server/lib/logger";

const BLOCKED_PATHS = [
  "/api/send-email",
  "/api/resend",
  "/api/stripe",
  "/api/billing",
  "/api/checkout",
  "/api/change-password",
  "/api/update-email",
  "/api/plugins/promotions",
  "/api/plugins/landing-page",
  "/api/pricing-plugin/subscribe",
  "/api/pricing-plugin/cancel",
  "/api/export",
];

function isBlockedPath(path: string): boolean {
  return BLOCKED_PATHS.some((blocked) =>
    path === blocked || path.startsWith(blocked + "/")
  );
}

export function demoReadOnlyMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next();
    }

    const companyId = (req.user as any).companyId;
    if (!companyId) {
      return next();
    }

    if (!DEMO_COMPANY_IDS.includes(companyId as any)) {
      return next();
    }

    if (isBlockedPath(req.path)) {
      logger.warn(
        { method: req.method, path: req.path, companyId },
        "[Demo] Sensitive operation blocked for demo company"
      );

      return res.status(403).json({
        error: "demo_blocked",
        message:
          "Esta función no está disponible en la demostración. Para acceder a todas las funcionalidades, adquiera su suscripción en sst-colombia.com.co",
      });
    }

    return next();
  };
}
