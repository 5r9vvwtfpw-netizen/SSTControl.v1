import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { eq, and, or } from "drizzle-orm";
import { pricingPluginSubscriptions } from "../../pricing_plugin/schema";
import { users } from "@shared/schema";
import logger from "../lib/logger";

export interface SubscriptionStatus {
  isActive: boolean;
  isBlocked: boolean;
  isTrial: boolean;
  trialEndsAt: Date | null;
  subscriptionStatus: string;
  blockedReason: string | null;
  daysRemaining: number | null;
}

export async function getSubscriptionStatus(companyId: string): Promise<SubscriptionStatus> {
  let subscription: any;
  try {
    const [result] = await db
      .select({
        id: pricingPluginSubscriptions.id,
        customerId: pricingPluginSubscriptions.customerId,
        subscriptionStatus: pricingPluginSubscriptions.subscriptionStatus,
        trialEndsAt: pricingPluginSubscriptions.trialEndsAt,
        blockedAt: pricingPluginSubscriptions.blockedAt,
        blockedReason: pricingPluginSubscriptions.blockedReason,
        status: pricingPluginSubscriptions.status,
      })
      .from(pricingPluginSubscriptions)
      .where(eq(pricingPluginSubscriptions.customerId, companyId))
      .limit(1);
    subscription = result;
  } catch (error: any) {
    logger.error({ error: error.message, companyId }, "Error querying subscription status - allowing access as fallback");
    return {
      isActive: true,
      isBlocked: false,
      isTrial: false,
      trialEndsAt: null,
      subscriptionStatus: "active",
      blockedReason: null,
      daysRemaining: null,
    };
  }

  if (!subscription) {
    return {
      isActive: false,
      isBlocked: true,
      isTrial: false,
      trialEndsAt: null,
      subscriptionStatus: "no_subscription",
      blockedReason: "No tiene una suscripción activa",
      daysRemaining: null,
    };
  }

  const now = new Date();
  const trialEndsAt = subscription.trialEndsAt ? new Date(subscription.trialEndsAt) : null;
  const status = subscription.subscriptionStatus || "trial";

  if (status === "blocked" || subscription.blockedAt) {
    return {
      isActive: false,
      isBlocked: true,
      isTrial: false,
      trialEndsAt,
      subscriptionStatus: "blocked",
      blockedReason: subscription.blockedReason || "Suscripción bloqueada por falta de pago",
      daysRemaining: null,
    };
  }

  if (status === "trial" && trialEndsAt) {
    const daysRemaining = Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining <= 0) {
      return {
        isActive: false,
        isBlocked: true,
        isTrial: true,
        trialEndsAt,
        subscriptionStatus: "trial_expired",
        blockedReason: "Su período de prueba ha expirado. Por favor active su suscripción para continuar.",
        daysRemaining: 0,
      };
    }

    return {
      isActive: true,
      isBlocked: false,
      isTrial: true,
      trialEndsAt,
      subscriptionStatus: "trial",
      blockedReason: null,
      daysRemaining,
    };
  }

  if (status === "active") {
    return {
      isActive: true,
      isBlocked: false,
      isTrial: false,
      trialEndsAt,
      subscriptionStatus: "active",
      blockedReason: null,
      daysRemaining: null,
    };
  }

  if (status === "past_due") {
    return {
      isActive: false,
      isBlocked: true,
      isTrial: false,
      trialEndsAt,
      subscriptionStatus: "past_due",
      blockedReason: "Su pago está pendiente. Por favor actualice su método de pago.",
      daysRemaining: null,
    };
  }

  if (status === "cancelled") {
    return {
      isActive: false,
      isBlocked: true,
      isTrial: false,
      trialEndsAt,
      subscriptionStatus: "cancelled",
      blockedReason: "Su suscripción ha sido cancelada.",
      daysRemaining: null,
    };
  }

  return {
    isActive: true,
    isBlocked: false,
    isTrial: false,
    trialEndsAt,
    subscriptionStatus: status,
    blockedReason: null,
    daysRemaining: null,
  };
}

export function requireActiveSubscription(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: "No autenticado" });
  }

  const user = req.user as any;
  const userRole = user.role;
  const companyId = user.companyId;

  const exemptRoles = ['superadmin', 'soporte', 'lso_externo', 'admin'];
  if (exemptRoles.includes(userRole)) {
    return next();
  }

  if (!companyId) {
    return next();
  }

  getSubscriptionStatus(companyId)
    .then((status) => {
      if (status.isBlocked) {
        logger.warn({
          userId: user.id,
          companyId,
          subscriptionStatus: status.subscriptionStatus,
          blockedReason: status.blockedReason,
        }, "Acceso bloqueado por suscripción inactiva");

        return res.status(403).json({
          error: "subscription_blocked",
          message: status.blockedReason,
          subscriptionStatus: status.subscriptionStatus,
          trialEndsAt: status.trialEndsAt,
        });
      }

      (req as any).subscriptionStatus = status;
      next();
    })
    .catch((error) => {
      logger.error({ error }, "Error verificando estado de suscripción");
      next();
    });
}

export async function blockExpiredTrials(): Promise<number> {
  const now = new Date();
  
  const expiredTrials = await db
    .select({
      id: pricingPluginSubscriptions.id,
      trialEndsAt: pricingPluginSubscriptions.trialEndsAt,
      subscriptionStatus: pricingPluginSubscriptions.subscriptionStatus,
    })
    .from(pricingPluginSubscriptions)
    .where(eq(pricingPluginSubscriptions.subscriptionStatus, "trial"));

  let blockedCount = 0;
  for (const sub of expiredTrials) {
    if (sub.trialEndsAt && new Date(sub.trialEndsAt) < now) {
      await db
        .update(pricingPluginSubscriptions)
        .set({
          subscriptionStatus: "blocked",
          blockedAt: now,
          blockedReason: "Período de prueba expirado sin activar suscripción",
          updatedAt: now,
        })
        .where(eq(pricingPluginSubscriptions.id, sub.id));
      blockedCount++;
    }
  }

  return blockedCount;
}
