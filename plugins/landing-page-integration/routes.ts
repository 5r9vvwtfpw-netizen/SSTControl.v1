/**
 * Landing Page Integration Plugin - API Routes
 * 
 * Mounted at /api/plugins/landing-page/*
 * Health check endpoint for monitoring plugin status.
 * 
 * Note: Quote verification is handled by the main app's /api/verify-quote endpoint
 * which calls the facade's verifyQuote() function directly.
 * 
 * @module plugins/landing-page-integration/routes
 * @version 1.1.0
 */

import { Router, Request, Response } from "express";

const router = Router();

/**
 * GET /api/plugins/landing-page/health
 * Health check endpoint for the plugin
 */
router.get("/health", (_req: Request, _res: Response) => {
  const configured = !!process.env.LANDING_PAGE_API_KEY;
  _res.json({
    plugin: "landing-page-integration",
    version: "1.1.0",
    configured,
  });
});

export default router;
