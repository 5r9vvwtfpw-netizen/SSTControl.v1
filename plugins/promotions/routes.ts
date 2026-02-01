/**
 * Plugin de Promociones y Referidos - Rutas API
 * 
 * ARQUITECTURA SIDECAR: Rutas completamente independientes.
 * Se montan en /api/plugins/promotions/*
 */

import { Router, Request, Response } from "express";
import {
  validatePromotionJwt,
  generatePromotionJwt,
  createCoupon,
  getCouponByCode,
  validateCoupon,
  useCoupon,
  getAllCoupons,
  deleteCoupon,
  toggleCouponActive,
  registerDigitalContract,
  getDigitalContractByCompany,
  getAllDigitalContracts,
  createReferralEntry,
  activateReferralCredit,
  getReferrerCredits,
  getTotalRemainingCredit,
  getAllReferralLedger,
  createPromotionalCheckout,
  handleInvoicePaid,
  getPromotionStats,
} from "./service";
import { insertPluginPromotionCouponSchema, jwtPromotionPayloadSchema } from "./schema";

const router = Router();

// ==================== LOBBY DIGITAL (JWT Reception) ====================

/**
 * POST /api/plugins/promotions/lobby
 * Receives JWT from landing page and validates/registers the digital contract
 */
router.post("/lobby", async (req: Request, res: Response) => {
  try {
    const { token, companyId } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: "Token JWT requerido" });
    }
    
    // Validate JWT
    const validation = await validatePromotionJwt(token);
    if (!validation.valid || !validation.payload) {
      return res.status(401).json({ error: validation.error || "JWT inválido" });
    }
    
    const payload = validation.payload;
    
    // If companyId provided, register the contract
    if (companyId) {
      const contract = await registerDigitalContract(
        companyId,
        payload,
        req.ip,
        req.headers["user-agent"]
      );
      
      return res.json({
        valid: true,
        contract,
        pricing: {
          baseMonthlyPrice: payload.sub_data.base_monthly_price,
          currentPeriodPrice: payload.sub_data.current_period_price,
          discountDurationMonths: payload.sub_data.discount_duration_months,
          currency: payload.sub_data.currency,
        },
      });
    }
    
    // Just validate and return pricing info (pre-registration)
    res.json({
      valid: true,
      pricing: {
        baseMonthlyPrice: payload.sub_data.base_monthly_price,
        currentPeriodPrice: payload.sub_data.current_period_price,
        discountDurationMonths: payload.sub_data.discount_duration_months,
        currency: payload.sub_data.currency,
      },
      metadata: payload.metadata,
      referral: payload.referral,
    });
  } catch (error: any) {
    console.error("[PromotionsPlugin] Lobby error:", error);
    res.status(500).json({ error: "Error procesando contrato digital" });
  }
});

/**
 * POST /api/plugins/promotions/generate-token
 * Admin endpoint to generate promotional JWT for testing
 */
router.post("/generate-token", async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user || !['superadmin', 'admin'].includes(user.role)) {
      return res.status(403).json({ error: "No autorizado" });
    }
    
    const parsed = jwtPromotionPayloadSchema.omit({ exp: true }).safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Payload inválido", details: parsed.error.errors });
    }
    
    const expiresInMinutes = req.body.expiresInMinutes || 30;
    const token = generatePromotionJwt(parsed.data as any, expiresInMinutes);
    
    res.json({ token, expiresInMinutes });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== CUPONES ====================

/**
 * GET /api/plugins/promotions/coupons
 * List all coupons (admin only)
 */
router.get("/coupons", async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user || !['superadmin', 'admin'].includes(user.role)) {
      return res.status(403).json({ error: "No autorizado" });
    }
    
    const coupons = await getAllCoupons();
    res.json(coupons);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/plugins/promotions/coupons
 * Create a new coupon
 */
router.post("/coupons", async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user || !['superadmin', 'admin'].includes(user.role)) {
      return res.status(403).json({ error: "No autorizado" });
    }
    
    const parsed = insertPluginPromotionCouponSchema.safeParse({
      ...req.body,
      code: req.body.code?.toUpperCase(),
      createdBy: user.username,
    });
    
    if (!parsed.success) {
      return res.status(400).json({ error: "Datos inválidos", details: parsed.error.errors });
    }
    
    const coupon = await createCoupon(parsed.data);
    res.status(201).json(coupon);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/plugins/promotions/coupons/validate/:code
 * Validate a coupon code (public endpoint)
 */
router.get("/coupons/validate/:code", async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const employees = req.query.employees ? parseInt(req.query.employees as string) : undefined;
    
    const result = await validateCoupon(code, employees);
    
    if (result.valid && result.coupon) {
      res.json({
        valid: true,
        discountType: result.coupon.discountType,
        discountValue: result.coupon.discountValue,
        discountDurationMonths: result.coupon.discountDurationMonths,
        description: result.coupon.description,
      });
    } else {
      res.json({ valid: false, error: result.error });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/plugins/promotions/coupons/:id
 * Delete a coupon
 */
router.delete("/coupons/:id", async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user || !['superadmin', 'admin'].includes(user.role)) {
      return res.status(403).json({ error: "No autorizado" });
    }
    
    await deleteCoupon(parseInt(req.params.id));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/plugins/promotions/coupons/:id/toggle
 * Toggle coupon active status
 */
router.patch("/coupons/:id/toggle", async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user || !['superadmin', 'admin'].includes(user.role)) {
      return res.status(403).json({ error: "No autorizado" });
    }
    
    const { isActive } = req.body;
    await toggleCouponActive(parseInt(req.params.id), isActive);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== CONTRATOS DIGITALES (AUDITORÍA) ====================

/**
 * GET /api/plugins/promotions/contracts
 * List all digital contracts (admin only)
 */
router.get("/contracts", async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user || !['superadmin', 'admin'].includes(user.role)) {
      return res.status(403).json({ error: "No autorizado" });
    }
    
    const contracts = await getAllDigitalContracts();
    res.json(contracts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/plugins/promotions/contracts/:companyId
 * Get contract for a specific company
 */
router.get("/contracts/:companyId", async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user || !['superadmin', 'admin'].includes(user.role)) {
      return res.status(403).json({ error: "No autorizado" });
    }
    
    const contract = await getDigitalContractByCompany(req.params.companyId);
    if (!contract) {
      return res.status(404).json({ error: "Contrato no encontrado" });
    }
    res.json(contract);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== PROGRAMA DE ALIADOS (REFERIDOS) ====================

/**
 * GET /api/plugins/promotions/referrals
 * List all referral entries (admin only)
 */
router.get("/referrals", async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user || !['superadmin', 'admin'].includes(user.role)) {
      return res.status(403).json({ error: "No autorizado" });
    }
    
    const referrals = await getAllReferralLedger();
    res.json(referrals);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/plugins/promotions/referrals/credits/:referrerId
 * Get credit balance for a referrer
 */
router.get("/referrals/credits/:referrerId", async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user) {
      return res.status(401).json({ error: "No autenticado" });
    }
    
    const totalCredit = await getTotalRemainingCredit(req.params.referrerId);
    const credits = await getReferrerCredits(req.params.referrerId);
    
    res.json({
      referrerId: req.params.referrerId,
      totalRemainingCredit: totalCredit,
      activeCredits: credits,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== CHECKOUT PROMOCIONAL ====================

/**
 * POST /api/plugins/promotions/checkout
 * Create promotional checkout session from JWT
 */
router.post("/checkout", async (req: Request, res: Response) => {
  try {
    const { token, companyId, successUrl, cancelUrl } = req.body;
    
    if (!token || !companyId) {
      return res.status(400).json({ error: "Token y companyId requeridos" });
    }
    
    // Validate JWT
    const validation = await validatePromotionJwt(token);
    if (!validation.valid || !validation.payload) {
      return res.status(401).json({ error: validation.error || "JWT inválido" });
    }
    
    // Register digital contract
    await registerDigitalContract(
      companyId,
      validation.payload,
      req.ip,
      req.headers["user-agent"]
    );
    
    // Create Stripe checkout
    const result = await createPromotionalCheckout(
      companyId,
      validation.payload,
      successUrl || `${req.protocol}://${req.get("host")}/checkout-success`,
      cancelUrl || `${req.protocol}://${req.get("host")}/pricing`
    );
    
    if ("error" in result) {
      return res.status(500).json({ error: result.error });
    }
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ESTADÍSTICAS ====================

/**
 * GET /api/plugins/promotions/stats
 * Get promotion statistics (admin only)
 */
router.get("/stats", async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user || !['superadmin', 'admin'].includes(user.role)) {
      return res.status(403).json({ error: "No autorizado" });
    }
    
    const stats = await getPromotionStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== WEBHOOK HANDLER (for invoice.paid) ====================

/**
 * POST /api/plugins/promotions/webhook/invoice-paid
 * Internal webhook handler for invoice.paid events
 * Called by main Stripe webhook handler
 */
router.post("/webhook/invoice-paid", async (req: Request, res: Response) => {
  try {
    const { invoiceId, subscriptionId, customerId } = req.body;
    
    if (!invoiceId || !subscriptionId) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    await handleInvoicePaid(invoiceId, subscriptionId, customerId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== STRIPE WEBHOOK DEDICADO (Receptor Directo) ====================

import Stripe from "stripe";

const stripeWebhook = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-04-30.basil" as any })
  : null;

/**
 * POST /api/plugins/promotions/webhook
 * Webhook directo de Stripe para el plugin de referidos
 * Escucha eventos: invoice.paid, customer.subscription.created
 * 
 * ARQUITECTURA SIDECAR: Este webhook es completamente independiente
 * del webhook principal del sistema. Debe configurarse en Stripe Dashboard
 * con su propia signing secret (STRIPE_PROMOTIONS_WEBHOOK_SECRET).
 */
router.post("/webhook", async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_PROMOTIONS_WEBHOOK_SECRET;
  
  if (!stripeWebhook) {
    console.error("[PromotionsPlugin] Stripe not configured");
    return res.status(500).json({ error: "Stripe not configured" });
  }
  
  if (!webhookSecret) {
    console.error("[PromotionsPlugin] STRIPE_PROMOTIONS_WEBHOOK_SECRET not configured");
    return res.status(500).json({ error: "Webhook secret not configured" });
  }
  
  let event: Stripe.Event;
  
  try {
    // Validate webhook signature
    const rawBody = (req as any).rawBody || req.body;
    event = stripeWebhook.webhooks.constructEvent(
      typeof rawBody === "string" ? rawBody : JSON.stringify(rawBody),
      sig,
      webhookSecret
    );
  } catch (err: any) {
    console.error("[PromotionsPlugin] Webhook signature verification failed:", err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }
  
  console.log(`[PromotionsPlugin] Received webhook event: ${event.type}`);
  
  try {
    switch (event.type) {
      case "invoice.paid": {
        const invoice = event.data.object as any;
        const subscriptionId = typeof invoice.subscription === "string" 
          ? invoice.subscription 
          : invoice.subscription?.id;
        
        if (subscriptionId) {
          await handleInvoicePaid(
            invoice.id,
            subscriptionId,
            typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id || ""
          );
        }
        break;
      }
      
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`[PromotionsPlugin] New subscription created: ${subscription.id}`);
        // Log for audit purposes
        break;
      }
      
      default:
        console.log(`[PromotionsPlugin] Unhandled event type: ${event.type}`);
    }
    
    res.json({ received: true });
  } catch (error: any) {
    console.error(`[PromotionsPlugin] Error processing webhook:`, error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== SISTEMA DE INVITACIÓN (PADRINO) ====================

import { sendReferralInvitation, type ReferralInvitationData } from "./email-service";

/**
 * POST /api/plugins/promotions/invite
 * Permite a un cliente (Padrino) invitar a otra empresa
 * 
 * Recibe: source_id, source_email, friend_name, friend_email, friend_company
 */
router.post("/invite", async (req: Request, res: Response) => {
  try {
    const { 
      sourceId, 
      sourceEmail, 
      sourceName,
      sourceCompany,
      friendName, 
      friendEmail, 
      friendCompany 
    } = req.body;
    
    if (!sourceId || !sourceEmail || !friendName || !friendEmail) {
      return res.status(400).json({ 
        error: "Campos requeridos: sourceId, sourceEmail, friendName, friendEmail" 
      });
    }
    
    // Generate referral link with tracking
    const referralToken = Buffer.from(JSON.stringify({
      referrerId: sourceId,
      referrerEmail: sourceEmail,
      timestamp: Date.now(),
    })).toString("base64url");
    
    const referralLink = `${process.env.LANDING_PAGE_URL || "https://sst-colombia.com.co"}/registro?ref=${referralToken}`;
    
    // Send invitation email
    const invitationData: ReferralInvitationData = {
      referrerName: sourceName || "Un cliente de SST-Colombia",
      referrerEmail: sourceEmail,
      referrerCompany: sourceCompany,
      friendName,
      friendEmail,
      friendCompany,
      referralLink,
      benefitDescription: "tu segundo mes es gratis",
    };
    
    const emailResult = await sendReferralInvitation(invitationData);
    
    if (!emailResult.success) {
      return res.status(500).json({ error: emailResult.error || "Error enviando invitación" });
    }
    
    res.json({ 
      success: true, 
      message: "Invitación enviada exitosamente",
      referralLink,
    });
  } catch (error: any) {
    console.error("[PromotionsPlugin] Invite error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/plugins/promotions/my-referrals/:companyId
 * Obtiene los referidos de una empresa (para mostrar en el panel del Padrino)
 */
router.get("/my-referrals/:companyId", async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user) {
      return res.status(401).json({ error: "No autenticado" });
    }
    
    const { companyId } = req.params;
    const referrals = await getReferrerCredits(companyId);
    const totalCredit = await getTotalRemainingCredit(companyId);
    
    res.json({
      companyId,
      totalReferrals: referrals.length,
      activeReferrals: referrals.filter(r => r.status === "active").length,
      totalRemainingCredit: totalCredit,
      referrals: referrals.map(r => ({
        id: r.id,
        refereeId: r.refereeId,
        creditAmount: parseFloat(r.creditPoolTotal || "0"),
        remainingBalance: parseFloat(r.remainingBalance || "0"),
        status: r.status,
        activatedAt: r.activatedAt,
        expiresAt: r.expiresAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
