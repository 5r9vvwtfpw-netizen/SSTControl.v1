/**
 * Landing Page Integration Plugin - API Routes
 * 
 * These routes are mounted at /api/plugins/landing-page/*
 * They provide endpoints for landing page integration.
 * 
 * @module plugins/landing-page-integration/routes
 */

import { Router, Request, Response } from "express";
import { verifyQuote, isPluginEnabled, getQuoteSummary } from "./facade";

const router = Router();

/**
 * POST /api/plugins/landing-page/verify-quote
 * Verify a quote token from the landing page
 */
router.post("/verify-quote", async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ 
        valid: false, 
        error: "Token de cotización requerido" 
      });
    }

    const result = verifyQuote(token);

    if (!result.valid) {
      return res.status(400).json(result);
    }

    console.log(`[LandingPagePlugin] ✅ Verified: ${getQuoteSummary(result.data!)}`);

    return res.json(result);
  } catch (error: any) {
    console.error("[LandingPagePlugin] Error verifying quote:", error);
    return res.status(500).json({
      valid: false,
      error: "Error interno al verificar cotización"
    });
  }
});

/**
 * GET /api/plugins/landing-page/health
 * Health check endpoint for the plugin
 */
router.get("/health", (_req: Request, res: Response) => {
  res.json({
    plugin: "landing-page-integration",
    version: "1.0.0",
    enabled: isPluginEnabled(),
    configured: !!process.env.LANDING_PAGE_API_KEY,
  });
});

export default router;
