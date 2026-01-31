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
  getNivelPesv,
  getNivelPesvLabel,
  getPasosAplicablesPorNivel,
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
    const vehiculos = vehiculosParam ? parseInt(vehiculosParam as string, 10) : 0;

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

export default router;
