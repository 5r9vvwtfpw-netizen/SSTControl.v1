import { Request, Response, NextFunction } from "express";
import { DEMO_COMPANY_IDS } from "./types";
import logger from "../../server/lib/logger";

const WRITE_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"]);

const ALLOWED_PATHS = [
  "/api/login",
  "/api/logout",
  "/api/auth/logout",
  "/api/demo",
];

function isAllowedPath(path: string): boolean {
  return ALLOWED_PATHS.some((allowed) =>
    path === allowed || path.startsWith(allowed + "/")
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

    if (!WRITE_METHODS.has(req.method)) {
      return next();
    }

    if (isAllowedPath(req.path)) {
      return next();
    }

    logger.warn(
      { method: req.method, path: req.path, companyId },
      "[Demo ReadOnly] Write operation blocked for demo company"
    );

    return res.status(403).json({
      error: "demo_readonly",
      message:
        "Esta es una versión de demostración. Solo puede observar el sistema. Para usar todas las funcionalidades, adquiera su suscripción en sst-colombia.com.co",
    });
  };
}
