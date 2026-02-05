/**
 * Landing Page Integration Plugin - API Routes
 * 
 * These routes are mounted at /api/plugins/landing-page/*
 * They provide endpoints for landing page integration.
 * 
 * @module plugins/landing-page-integration/routes
 * @version 1.0.0
 */

import { Router, Request, Response } from "express";
import { verifyQuote, isPluginEnabled, isPluginConfigured, getQuoteSummary } from "./facade";

const router = Router();

/**
 * POST /api/plugins/landing-page/verify-quote
 * Verify a quote token from the landing page
 */
router.post("/verify-quote", (req: Request, res: Response) => {
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

  console.info(`[LandingPagePlugin] Verified: ${getQuoteSummary(result.data!)}`);
  return res.json(result);
});

/**
 * GET /api/plugins/landing-page/health
 * Health check endpoint for the plugin
 */
router.get("/health", (_req: Request, res: Response) => {
  res.json({
    plugin: "landing-page-integration",
    version: "1.0.0",
    status: isPluginEnabled() ? "enabled" : "disabled",
    configured: isPluginConfigured(),
  });
});

export default router;
