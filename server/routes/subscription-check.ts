import { Express } from "express";
import { storage } from "../storage";

export function registerSubscriptionCheckRoutes(app: Express) {
  // Endpoint de diagnóstico para verificar planes de suscripción
  app.get("/api/subscription-check", async (req, res) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      const activePlans = plans.filter(p => p.status === 'active');
      
      const microempresa = plans.find(p => p.name === 'microempresa');
      const pequena = plans.find(p => p.name === 'pequena');
      const mediana = plans.find(p => p.name === 'mediana');
      const grande = plans.find(p => p.name === 'grande');
      
      res.json({
        timestamp: new Date().toISOString(),
        totalPlans: plans.length,
        activePlans: activePlans.length,
        plansAvailable: {
          microempresa: microempresa ? { id: microempresa.id, status: microempresa.status } : null,
          pequena: pequena ? { id: pequena.id, status: pequena.status } : null,
          mediana: mediana ? { id: mediana.id, status: mediana.status } : null,
          grande: grande ? { id: grande.id, status: grande.status } : null,
        },
        allPlans: plans.map(p => ({ id: p.id, name: p.name, status: p.status })),
        canCreateTrialSubscription: activePlans.length > 0,
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });
}
