import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { eq, and, or } from "drizzle-orm";
import { pricingPluginSubscriptions } from "../../pricing_plugin/schema";
import { users, subscriptions } from "@shared/schema";
import logger from "../lib/logger";

// Días de gracia después de current_period_end antes de considerar una
// suscripción "active" como vencida. Debe coincidir con el valor usado en
// server/cron/manual-subscription-expiry.ts (ese cron es un respaldo por
// lote; esta verificación en vivo es la que realmente aplica el bloqueo,
// ya que en despliegues Autoscale el cron no está garantizado a ejecutarse).
export const SUBSCRIPTION_GRACE_PERIOD_DAYS = 1;

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

  // Fallback: if no record in pricing_plugin_subscriptions, check the main subscriptions table
  if (!subscription) {
    try {
      const [mainSub] = await db
        .select({
          id: subscriptions.id,
          status: subscriptions.status,
          trialEnd: subscriptions.trialEnd,
          currentPeriodEnd: subscriptions.currentPeriodEnd,
          lastPaymentDate: subscriptions.lastPaymentDate,
        })
        .from(subscriptions)
        .where(eq(subscriptions.companyId, companyId))
        .limit(1);

      if (mainSub) {
        const now = new Date();
        const periodEnd = mainSub.currentPeriodEnd ? new Date(mainSub.currentPeriodEnd) : null;
        const trialEnd = mainSub.trialEnd ? new Date(mainSub.trialEnd) : null;

        logger.info({ companyId, mainSubStatus: mainSub.status, periodEnd }, "Fallback to subscriptions table - no pricing_plugin record found");

        if (mainSub.status === "active") {
          if (periodEnd && periodEnd < now) {
            return {
              isActive: false,
              isBlocked: true,
              isTrial: false,
              trialEndsAt: trialEnd,
              subscriptionStatus: "past_due",
              blockedReason: "Su período de suscripción ha vencido. Por favor renueve su suscripción.",
              daysRemaining: null,
            };
          }
          return {
            isActive: true,
            isBlocked: false,
            isTrial: false,
            trialEndsAt: trialEnd,
            subscriptionStatus: "active",
            blockedReason: null,
            daysRemaining: null,
          };
        }

        if (mainSub.status === "trial") {
          if (trialEnd) {
            const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            if (daysRemaining <= 0) {
              return {
                isActive: false,
                isBlocked: true,
                isTrial: true,
                trialEndsAt: trialEnd,
                subscriptionStatus: "trial_expired",
                blockedReason: "Su período de prueba ha expirado. Por favor active su suscripción para continuar.",
                daysRemaining: 0,
              };
            }
            return {
              isActive: true,
              isBlocked: false,
              isTrial: true,
              trialEndsAt: trialEnd,
              subscriptionStatus: "trial",
              blockedReason: null,
              daysRemaining,
            };
          }
          return {
            isActive: true,
            isBlocked: false,
            isTrial: true,
            trialEndsAt: null,
            subscriptionStatus: "trial",
            blockedReason: null,
            daysRemaining: null,
          };
        }

        if (mainSub.status === "canceled") {
          return {
            isActive: false,
            isBlocked: true,
            isTrial: false,
            trialEndsAt: trialEnd,
            subscriptionStatus: "cancelled",
            blockedReason: "Su suscripción ha sido cancelada.",
            daysRemaining: null,
          };
        }

        if (mainSub.status === "past_due") {
          return {
            isActive: false,
            isBlocked: true,
            isTrial: false,
            trialEndsAt: trialEnd,
            subscriptionStatus: "past_due",
            blockedReason: "Su pago está pendiente. Por favor actualice su método de pago.",
            daysRemaining: null,
          };
        }
      }
    } catch (fallbackError: any) {
      logger.error({ error: fallbackError.message, companyId }, "Error querying fallback subscriptions table");
    }

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
    // pricing_plugin_subscriptions has no period-end date of its own; the real
    // billing period lives in the `subscriptions` table. Check it live here
    // instead of relying solely on the background cron (unreliable on
    // Autoscale deployments, which can scale to zero between requests).
    try {
      const [mainSub] = await db
        .select({
          currentPeriodEnd: subscriptions.currentPeriodEnd,
        })
        .from(subscriptions)
        .where(eq(subscriptions.companyId, companyId))
        .limit(1);

      if (mainSub?.currentPeriodEnd) {
        const periodEnd = new Date(mainSub.currentPeriodEnd);
        const graceMs = SUBSCRIPTION_GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000;
        if (periodEnd.getTime() + graceMs < now.getTime()) {
          return {
            isActive: false,
            isBlocked: true,
            isTrial: false,
            trialEndsAt,
            subscriptionStatus: "past_due",
            blockedReason: "Su período de suscripción ha vencido. Por favor renueve su suscripción.",
            daysRemaining: null,
          };
        }
      }
    } catch (periodCheckError: any) {
      logger.error({ error: periodCheckError.message, companyId }, "Error checking current_period_end for active subscription - allowing access");
    }

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
