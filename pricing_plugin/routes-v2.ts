/**
 * Rutas API para Modelo de Precios V2 - Basado en Riesgo ARL
 * 
 * Endpoints:
 * - POST /api/pricing-v2/calculate - Calcular precio basado en riesgo
 * - GET /api/pricing-v2/tarifas - Obtener tarifas actuales
 * - GET /api/pricing-v2/simulador/:companyId - Simular precio para empresa existente
 */

import { Router, Request, Response } from "express";
import { db } from "../server/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { companies } from "../shared/schema";
import { getUncachableStripeClient, getStripePublishableKey } from "../server/stripeClient";
import { pricingPluginSubscriptions } from "./schema";
import logger from "../server/lib/logger";
import {
  calculatePricingV2,
  DEFAULT_PRICING_V2_CONFIG,
  getDescripcionClaseRiesgo,
  getEstandaresAplicablesPorClase,
  getTarifaPorRiesgo,
  type RiskLevel,
  type PricingV2Config,
} from "./calculate-v2";
import {
  calculatePesvPricing,
  calculateCombinedPricing,
  getNivelPesvLabel,
  getDesglosePorFase,
  DEFAULT_PESV_PRICING_CONFIG,
  type NivelPesv,
} from "./calculate-pesv";

const router = Router();

const RiskLevelSchema = z.enum(["I", "II", "III", "IV", "V"]);

router.post("/calculate", async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      trabajadores: z.number().int().min(1, "Debe tener al menos 1 trabajador"),
      claseRiesgo: RiskLevelSchema,
      estandaresAplicables: z.number().int().min(1).optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        error: "Datos inválidos", 
        details: parsed.error.errors 
      });
    }

    const { trabajadores, claseRiesgo } = parsed.data;
    const estandaresAplicables = parsed.data.estandaresAplicables 
      || getEstandaresAplicablesPorClase(claseRiesgo, trabajadores);

    const result = calculatePricingV2(
      { trabajadores, claseRiesgo, estandaresAplicables },
      DEFAULT_PRICING_V2_CONFIG
    );

    return res.json({
      ...result,
      descripcionRiesgo: getDescripcionClaseRiesgo(claseRiesgo),
      formula: "(Trabajadores × Tarifa Riesgo) + (Estándares × $8,000)",
      ventajaCompetitiva: [
        "Único en Colombia con precio basado en riesgo real",
        "Portal del Trabajador INCLUIDO (valor $3k-$5k/usuario/mes)",
        "Portal del Licenciado SST INCLUIDO (valor $150k-$300k/mes)",
        result.ahorroEstimado,
      ],
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/tarifas", async (_req: Request, res: Response) => {
  try {
    const config = DEFAULT_PRICING_V2_CONFIG;
    
    return res.json({
      tarifasPorClaseRiesgo: {
        claseI: {
          tarifa: config.tarifaClaseI,
          descripcion: getDescripcionClaseRiesgo("I"),
        },
        claseII: {
          tarifa: config.tarifaClaseII,
          descripcion: getDescripcionClaseRiesgo("II"),
        },
        claseIII: {
          tarifa: config.tarifaClaseIII,
          descripcion: getDescripcionClaseRiesgo("III"),
        },
        claseIV: {
          tarifa: config.tarifaClaseIV,
          descripcion: getDescripcionClaseRiesgo("IV"),
        },
        claseV: {
          tarifa: config.tarifaClaseV,
          descripcion: getDescripcionClaseRiesgo("V"),
        },
      },
      tarifaPorEstandar: config.tarifaPorEstandar,
      currency: config.currency,
      formula: "Precio = (Trabajadores × Tarifa Riesgo) + (Estándares × $8,000)",
      estandaresSegunTamano: {
        microempresa: { trabajadores: "1-10", estandares: 7 },
        pequeña: { trabajadores: "11-50", estandares: 21 },
        mediana_grande: { trabajadores: "51+", estandares: 61 },
      },
      incluido: [
        "Portal del Trabajador (valor mercado $3,000-$5,000/usuario/mes)",
        "Portal del Licenciado SST (valor mercado $150,000-$300,000/mes)",
        "Soporte técnico ilimitado",
        "Actualizaciones automáticas",
        "Cumplimiento Resolución 0312/2019",
        "Cumplimiento ISO 45001:2018",
      ],
      ventajaCompetitiva: "Hasta 80% de ahorro vs consultor tradicional",
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/simulador/:companyId", async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;

    const [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1);

    if (!company) {
      return res.status(404).json({ error: "Empresa no encontrada" });
    }

    const claseRiesgo = (company.riskLevel || "I") as RiskLevel;
    const trabajadores = company.numberOfWorkers || 1;
    const estandaresAplicables = getEstandaresAplicablesPorClase(claseRiesgo, trabajadores);

    const result = calculatePricingV2(
      { trabajadores, claseRiesgo, estandaresAplicables },
      DEFAULT_PRICING_V2_CONFIG
    );

    return res.json({
      empresa: {
        id: company.id,
        nombre: company.name,
        trabajadores,
        claseRiesgo,
        descripcionRiesgo: getDescripcionClaseRiesgo(claseRiesgo),
      },
      pricing: result,
      mensaje: `Con ${trabajadores} trabajadores en Clase ${claseRiesgo}, tu inversión mensual es de ${new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(result.costoMensualTotal)}`,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/cotizacion", async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      nombreEmpresa: z.string().min(2),
      nit: z.string().optional(),
      contactoNombre: z.string().min(2),
      contactoEmail: z.string().email(),
      contactoTelefono: z.string().optional(),
      trabajadores: z.number().int().min(1),
      claseRiesgo: RiskLevelSchema,
      actividadEconomica: z.string().optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        error: "Datos inválidos", 
        details: parsed.error.errors 
      });
    }

    const { trabajadores, claseRiesgo } = parsed.data;
    const estandaresAplicables = getEstandaresAplicablesPorClase(claseRiesgo, trabajadores);

    const pricing = calculatePricingV2(
      { trabajadores, claseRiesgo, estandaresAplicables },
      DEFAULT_PRICING_V2_CONFIG
    );

    const cotizacion = {
      numero: `COT-${Date.now().toString(36).toUpperCase()}`,
      fecha: new Date().toISOString(),
      validezDias: 30,
      empresa: parsed.data,
      pricing,
      condiciones: [
        "Precios en pesos colombianos (COP)",
        "Facturación mensual",
        "Incluye Portal del Trabajador sin costo adicional",
        "Incluye Portal del Licenciado SST sin costo adicional",
        "Soporte técnico ilimitado incluido",
        "Actualizaciones automáticas incluidas",
        "Cancelación sin penalidad con 30 días de aviso",
      ],
      contactoComercial: {
        email: "comercial@sst-colombia.com",
        telefono: "+57 XXX XXX XXXX",
      },
    };

    return res.json(cotizacion);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * ============================================================
 * ENDPOINTS PESV - Plan Estratégico de Seguridad Vial
 * Resolución 40595/2022
 * PRINCIPIO DE CÓDIGO SEGURO: Solo agregar código nuevo
 * ============================================================
 */

router.post("/pesv/calculate", async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      vehiculos: z.number().int().min(1, "Debe tener al menos 1 vehículo"),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        error: "Datos inválidos", 
        details: parsed.error.errors 
      });
    }

    const { vehiculos } = parsed.data;
    const result = calculatePesvPricing(
      { vehiculos },
      DEFAULT_PESV_PRICING_CONFIG
    );

    return res.json({
      ...result,
      formula: "Costo PESV = Pasos Aplicables × $8,000",
      normativa: "Resolución 40595/2022 - Ministerio de Transporte",
      mensaje: `Con ${vehiculos} vehículos (Nivel ${result.nivelPesvLabel}), su inversión mensual PESV es de ${new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(result.costoMensualPesv)}`,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/pesv/tarifas", async (_req: Request, res: Response) => {
  try {
    const config = DEFAULT_PESV_PRICING_CONFIG;
    
    return res.json({
      tarifaPorPasoPesv: config.tarifaPorPasoPesv,
      currency: config.currency,
      formula: "Costo PESV = Pasos Aplicables × $8,000",
      nivelesPesv: {
        basico: {
          vehiculos: "1-10",
          pasosAplicables: 20,
          costoMensual: 20 * config.tarifaPorPasoPesv,
          descripcion: getNivelPesvLabel("basico"),
          desglosePorFase: getDesglosePorFase("basico"),
        },
        estandar: {
          vehiculos: "11-50",
          pasosAplicables: 24,
          costoMensual: 24 * config.tarifaPorPasoPesv,
          descripcion: getNivelPesvLabel("estandar"),
          desglosePorFase: getDesglosePorFase("estandar"),
        },
        avanzado: {
          vehiculos: "50+",
          pasosAplicables: 24,
          costoMensual: 24 * config.tarifaPorPasoPesv,
          descripcion: getNivelPesvLabel("avanzado"),
          desglosePorFase: getDesglosePorFase("avanzado"),
        },
      },
      normativa: [
        "Resolución 40595/2022 - Ministerio de Transporte",
        "ISO 39001:2012 - Sistemas de gestión de seguridad vial",
        "ISO 31000:2018 - Gestión del riesgo",
      ],
      pasosNoAplicanBasico: ["H07 - Gestión de velocidad", "H08 - Rutas seguras", "H09 - Fatiga y somnolencia", "V03 - Auditoría PESV"],
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/calculate-combined", async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      trabajadores: z.number().int().min(1, "Debe tener al menos 1 trabajador"),
      claseRiesgo: RiskLevelSchema,
      estandaresAplicables: z.number().int().min(1).optional(),
      vehiculos: z.number().int().min(0).default(0),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        error: "Datos inválidos", 
        details: parsed.error.errors 
      });
    }

    const { trabajadores, claseRiesgo, vehiculos } = parsed.data;
    const estandaresAplicables = parsed.data.estandaresAplicables 
      || getEstandaresAplicablesPorClase(claseRiesgo, trabajadores);

    const tarifaPorTrabajador = getTarifaPorRiesgo(claseRiesgo, DEFAULT_PRICING_V2_CONFIG);

    const result = calculateCombinedPricing(
      { trabajadores, claseRiesgo, estandaresAplicables, vehiculos },
      tarifaPorTrabajador,
      DEFAULT_PRICING_V2_CONFIG.tarifaPorEstandar,
      DEFAULT_PESV_PRICING_CONFIG.tarifaPorPasoPesv
    );

    const formatCurrency = (value: number) => 
      new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(value);

    return res.json({
      empresa: {
        trabajadores,
        claseRiesgo,
        descripcionRiesgo: getDescripcionClaseRiesgo(claseRiesgo),
        vehiculos,
      },
      desgloseSst: {
        tarifaPorTrabajador,
        costoTrabajadores: result.costoTrabajadores,
        estandaresAplicables,
        tarifaPorEstandar: DEFAULT_PRICING_V2_CONFIG.tarifaPorEstandar,
        costoEstandares: result.costoEstandaresSst,
        subtotalSst: result.subtotalSst,
      },
      desglosePesv: result.tienePesv ? {
        nivelPesv: result.nivelPesv,
        descripcion: getNivelPesvLabel(result.nivelPesv!),
        pasosAplicables: result.pasosAplicablesPesv,
        tarifaPorPaso: DEFAULT_PESV_PRICING_CONFIG.tarifaPorPasoPesv,
        costoPesv: result.costoPasosPesv,
        desglosePorFase: getDesglosePorFase(result.nivelPesv!),
      } : null,
      totales: {
        costoMensualTotal: result.costoMensualTotal,
        costoAnualTotal: result.costoAnualTotal,
        currency: result.currency,
      },
      formula: vehiculos > 0 
        ? "(Trabajadores × Tarifa Riesgo) + (Estándares SST × $8,000) + (Pasos PESV × $8,000)"
        : "(Trabajadores × Tarifa Riesgo) + (Estándares SST × $8,000)",
      mensaje: `Su inversión mensual total es de ${formatCurrency(result.costoMensualTotal)}${result.tienePesv ? ' (incluye SST + PESV)' : ' (solo SST)'}`,
      incluido: [
        "Portal del Trabajador INCLUIDO",
        "Portal del Licenciado SST INCLUIDO",
        "Soporte técnico ilimitado",
        "Actualizaciones automáticas",
        "Cumplimiento Resolución 0312/2019 (SST)",
        "Cumplimiento ISO 45001:2018 (SST)",
        ...(result.tienePesv ? [
          "Cumplimiento Resolución 40595/2022 (PESV)",
          "Cumplimiento ISO 39001:2012 (PESV)",
          "Cumplimiento ISO 31000:2018 (Riesgos)",
        ] : []),
      ],
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/simulador-completo/:companyId", async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const vehiculosParam = req.query.vehiculos;

    const [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1);

    if (!company) {
      return res.status(404).json({ error: "Empresa no encontrada" });
    }

    const claseRiesgo = (company.riskLevel || "I") as RiskLevel;
    const trabajadores = company.numberOfWorkers || 1;
    const estandaresAplicables = getEstandaresAplicablesPorClase(claseRiesgo, trabajadores);
    // Usar vehículos de la BD o del parámetro query (BD tiene prioridad si existe)
    const vehiculos = (company as any).numberOfVehicles || (vehiculosParam ? parseInt(vehiculosParam as string, 10) : 0);

    const tarifaPorTrabajador = getTarifaPorRiesgo(claseRiesgo, DEFAULT_PRICING_V2_CONFIG);

    const result = calculateCombinedPricing(
      { trabajadores, claseRiesgo, estandaresAplicables, vehiculos },
      tarifaPorTrabajador,
      DEFAULT_PRICING_V2_CONFIG.tarifaPorEstandar,
      DEFAULT_PESV_PRICING_CONFIG.tarifaPorPasoPesv
    );

    const formatCurrency = (value: number) => 
      new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(value);

    return res.json({
      empresa: {
        id: company.id,
        nombre: company.name,
        trabajadores,
        claseRiesgo,
        descripcionRiesgo: getDescripcionClaseRiesgo(claseRiesgo),
        vehiculos,
      },
      pricing: {
        sst: {
          costoTrabajadores: result.costoTrabajadores,
          costoEstandares: result.costoEstandaresSst,
          subtotal: result.subtotalSst,
        },
        pesv: result.tienePesv ? {
          nivelPesv: result.nivelPesv,
          pasosAplicables: result.pasosAplicablesPesv,
          costo: result.costoPasosPesv,
        } : null,
        total: {
          mensual: result.costoMensualTotal,
          anual: result.costoAnualTotal,
        },
      },
      mensaje: `${company.name} - Inversión mensual: ${formatCurrency(result.costoMensualTotal)}`,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * ============================================================
 * ENDPOINT V2 COMBINADO - SST + PESV + USUARIOS ADICIONALES
 * Integración completa con Stripe
 * PRINCIPIO DE CÓDIGO SEGURO: Solo agregar código nuevo
 * ============================================================
 */

const TARIFA_USUARIO_ADICIONAL = 10000; // $10,000 COP/mes por usuario adicional

router.post("/calculate-combined-v2", async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      trabajadores: z.number().int().min(1, "Debe tener al menos 1 trabajador"),
      claseRiesgo: RiskLevelSchema,
      estandaresAplicables: z.number().int().min(1).optional(),
      vehiculos: z.number().int().min(0).default(0),
      usuariosAdicionales: z.number().int().min(0).default(0),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        error: "Datos inválidos", 
        details: parsed.error.errors 
      });
    }

    const { trabajadores, claseRiesgo, vehiculos, usuariosAdicionales } = parsed.data;
    const estandaresAplicables = parsed.data.estandaresAplicables 
      || getEstandaresAplicablesPorClase(claseRiesgo, trabajadores);

    const tarifaPorTrabajador = getTarifaPorRiesgo(claseRiesgo, DEFAULT_PRICING_V2_CONFIG);

    const result = calculateCombinedPricing(
      { trabajadores, claseRiesgo, estandaresAplicables, vehiculos },
      tarifaPorTrabajador,
      DEFAULT_PRICING_V2_CONFIG.tarifaPorEstandar,
      DEFAULT_PESV_PRICING_CONFIG.tarifaPorPasoPesv
    );

    // Calcular costo de usuarios adicionales
    const costoUsuariosAdicionales = usuariosAdicionales * TARIFA_USUARIO_ADICIONAL;
    const costoMensualFinal = result.costoMensualTotal + costoUsuariosAdicionales;
    const costoAnualFinal = costoMensualFinal * 12;

    const formatCurrency = (value: number) => 
      new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(value);

    // Construir fórmula
    let formula = "(Trabajadores × Tarifa Riesgo) + (Estándares SST × $8,000)";
    if (vehiculos > 0) {
      formula += " + (Pasos PESV × $8,000)";
    }
    if (usuariosAdicionales > 0) {
      formula += " + (Usuarios × $10,000)";
    }

    return res.json({
      empresa: {
        trabajadores,
        claseRiesgo,
        descripcionRiesgo: getDescripcionClaseRiesgo(claseRiesgo),
        vehiculos,
      },
      desgloseSst: {
        tarifaPorTrabajador,
        costoTrabajadores: result.costoTrabajadores,
        estandaresAplicables,
        tarifaPorEstandar: DEFAULT_PRICING_V2_CONFIG.tarifaPorEstandar,
        costoEstandares: result.costoEstandaresSst,
        subtotalSst: result.subtotalSst,
      },
      desglosePesv: result.tienePesv ? {
        nivelPesv: result.nivelPesv,
        descripcion: getNivelPesvLabel(result.nivelPesv!),
        pasosAplicables: result.pasosAplicablesPesv,
        tarifaPorPaso: DEFAULT_PESV_PRICING_CONFIG.tarifaPorPasoPesv,
        costoPesv: result.costoPasosPesv,
        desglosePorFase: getDesglosePorFase(result.nivelPesv!),
      } : null,
      usuariosAdicionales: usuariosAdicionales > 0 ? {
        cantidad: usuariosAdicionales,
        tarifaPorUsuario: TARIFA_USUARIO_ADICIONAL,
        costoUsuarios: costoUsuariosAdicionales,
      } : null,
      totales: {
        costoMensualTotal: costoMensualFinal,
        costoAnualTotal: costoAnualFinal,
        currency: "COP",
      },
      formula,
      mensaje: `Su inversión mensual total es de ${formatCurrency(costoMensualFinal)}`,
      incluido: [
        "Portal del Trabajador INCLUIDO",
        "Portal del Licenciado SST INCLUIDO",
        "Soporte técnico ilimitado",
        "Actualizaciones automáticas",
        "Cumplimiento Resolución 0312/2019 (SST)",
        "Cumplimiento ISO 45001:2018 (SST)",
        ...(result.tienePesv ? [
          "Cumplimiento Resolución 40595/2022 (PESV)",
          "Cumplimiento ISO 39001:2012 (PESV)",
          "Cumplimiento ISO 31000:2018 (Riesgos)",
        ] : []),
      ],
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * ============================================================
 * CHECKOUT DINÁMICO V2 - STRIPE
 * Crea sesión de checkout con precio calculado dinámicamente
 * SST + PESV + Usuarios Adicionales
 * PRINCIPIO DE CÓDIGO SEGURO: Solo agregar código nuevo
 * ============================================================
 */

router.post("/create-checkout-v2", async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      companyId: z.string().min(1),
      trabajadores: z.number().int().min(1),
      claseRiesgo: RiskLevelSchema,
      vehiculos: z.number().int().min(0).default(0),
      usuariosAdicionales: z.number().int().min(0).default(0),
      customerEmail: z.string().email(),
      customerName: z.string().min(2),
      successUrl: z.string().url(),
      cancelUrl: z.string().url(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        error: "Datos inválidos", 
        details: parsed.error.errors 
      });
    }

    const { 
      companyId, trabajadores, claseRiesgo, vehiculos, 
      usuariosAdicionales, customerEmail, customerName, 
      successUrl, cancelUrl
    } = parsed.data;

    // PRINCIPIO V2: El precio SIEMPRE se calcula dinámicamente usando datos actuales
    // Fórmula: (Trabajadores × Tarifa Riesgo) + (Estándares × $8,000) + (Pasos PESV × $8,000)
    
    const estandaresAplicables = getEstandaresAplicablesPorClase(claseRiesgo, trabajadores);
    const tarifaPorTrabajador = getTarifaPorRiesgo(claseRiesgo, DEFAULT_PRICING_V2_CONFIG);

    const result = calculateCombinedPricing(
      { trabajadores, claseRiesgo, estandaresAplicables, vehiculos },
      tarifaPorTrabajador,
      DEFAULT_PRICING_V2_CONFIG.tarifaPorEstandar,
      DEFAULT_PESV_PRICING_CONFIG.tarifaPorPasoPesv
    );

    const costoTrabajadores = result.costoTrabajadores;
    const costoEstandaresSst = result.costoEstandaresSst;
    const costoPasosPesv = result.costoPasosPesv;
    const tienePesv = result.tienePesv;
    const nivelPesv: NivelPesv | null = result.nivelPesv ?? null;
    const pasosAplicablesPesv = result.pasosAplicablesPesv ?? 0;
    const costoUsuariosAdicionales = usuariosAdicionales * TARIFA_USUARIO_ADICIONAL;
    const costoMensualTotal = result.costoMensualTotal + costoUsuariosAdicionales;

    logger.info({
      companyId, trabajadores, claseRiesgo, vehiculos, estandaresAplicables,
      costoTrabajadores, costoEstandaresSst, costoPasosPesv, costoUsuariosAdicionales,
      costoMensualTotal,
    }, 'Dynamic pricing V2 calculated for checkout');

    const finalMonthlyPrice = costoMensualTotal;

    // Inicializar Stripe
    const stripe = await getUncachableStripeClient();

    // Buscar o crear cliente de Stripe
    let stripeCustomerId: string | undefined;
    const [existingSubscription] = await db
      .select()
      .from(pricingPluginSubscriptions)
      .where(eq(pricingPluginSubscriptions.customerId, companyId))
      .limit(1);

    if (existingSubscription?.stripeCustomerId) {
      stripeCustomerId = existingSubscription.stripeCustomerId;
    } else {
      const customer = await stripe.customers.create({
        email: customerEmail,
        name: customerName,
        metadata: {
          company_id: companyId,
          trabajadores: trabajadores.toString(),
          clase_riesgo: claseRiesgo,
          vehiculos: vehiculos.toString(),
          usuarios_adicionales: usuariosAdicionales.toString(),
        },
      });
      stripeCustomerId = customer.id;
    }

    // Crear line items para Stripe - SIEMPRE desglose dinámico real
    const lineItems: any[] = [];

    // COP es zero-decimal currency en Stripe - NO multiplicar por 100
    // Item 1: SST - Trabajadores
    if (costoTrabajadores > 0) {
      lineItems.push({
        price_data: {
          currency: 'cop',
          product_data: {
            name: 'SST - Licencia por Trabajadores',
            description: `${trabajadores} trabajadores × $${tarifaPorTrabajador.toLocaleString('es-CO')}/mes (Clase ${claseRiesgo})`,
          },
          unit_amount: costoTrabajadores,
          recurring: { interval: 'month' as const },
        },
        quantity: 1,
      });
    }

    // Item 2: SST - Estándares
    if (costoEstandaresSst > 0) {
      lineItems.push({
        price_data: {
          currency: 'cop',
          product_data: {
            name: 'SST - Estándares Aplicables',
            description: `${estandaresAplicables} estándares × $8,000/mes (Resolución 0312/2019)`,
          },
          unit_amount: costoEstandaresSst,
          recurring: { interval: 'month' as const },
        },
        quantity: 1,
      });
    }

    // Item 3: PESV - Pasos (si aplica)
    if (tienePesv && costoPasosPesv > 0) {
      const nivelLabel = getNivelPesvLabel(nivelPesv!);
      lineItems.push({
        price_data: {
          currency: 'cop',
          product_data: {
            name: 'PESV - Plan Estratégico de Seguridad Vial',
            description: `${pasosAplicablesPesv} pasos × $8,000/mes (${nivelLabel})`,
          },
          unit_amount: costoPasosPesv,
          recurring: { interval: 'month' as const },
        },
        quantity: 1,
      });
    }

    // Item 4: Usuarios adicionales (si aplica)
    if (usuariosAdicionales > 0 && costoUsuariosAdicionales > 0) {
      lineItems.push({
        price_data: {
          currency: 'cop',
          product_data: {
            name: 'Usuarios Adicionales',
            description: `${usuariosAdicionales} usuarios × $10,000/mes`,
          },
          unit_amount: costoUsuariosAdicionales,
          recurring: { interval: 'month' as const },
        },
        quantity: 1,
      });
    }

    // Crear sesión de checkout con 7 días de prueba gratis
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      subscription_data: {
        trial_period_days: 7,
        description: 'SST Colombia - Prueba gratis de 7 días',
      },
      metadata: {
        pricing_v2: 'true',
        company_id: companyId,
        pricing_mode: 'dynamic_v2',
        trabajadores: trabajadores.toString(),
        clase_riesgo: claseRiesgo,
        estandares_aplicables: estandaresAplicables.toString(),
        vehiculos: vehiculos.toString(),
        nivel_pesv: nivelPesv || '',
        pasos_pesv: pasosAplicablesPesv.toString(),
        usuarios_adicionales: usuariosAdicionales.toString(),
        costo_trabajadores: costoTrabajadores.toString(),
        costo_estandares: costoEstandaresSst.toString(),
        costo_pesv: costoPasosPesv.toString(),
        costo_usuarios: costoUsuariosAdicionales.toString(),
        costo_mensual_total: finalMonthlyPrice.toString(),
      },
    });

    logger.info({
      companyId,
      trabajadores,
      claseRiesgo,
      estandaresAplicables,
      vehiculos,
      usuariosAdicionales,
      costoMensualTotal,
      sessionId: session.id,
    }, 'Stripe checkout V2 session created');

    return res.json({
      sessionUrl: session.url,
      sessionId: session.id,
      pricing: {
        trabajadores,
        claseRiesgo,
        estandaresAplicables,
        vehiculos,
        nivelPesv,
        pasosAplicables: pasosAplicablesPesv,
        usuariosAdicionales,
        costoTrabajadores,
        costoEstandares: costoEstandaresSst,
        costoPesv: costoPasosPesv,
        costoUsuarios: costoUsuariosAdicionales,
        costoMensualTotal: finalMonthlyPrice,
        costoAnualTotal: finalMonthlyPrice * 12,
        currency: 'COP',
      },
    });
  } catch (error: any) {
    logger.error({ err: error }, 'Error creating Stripe checkout V2 session');
    return res.status(500).json({ error: error.message });
  }
});

export default router;
