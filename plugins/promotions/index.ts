/**
 * Plugin de Promociones y Referidos (Lobby Digital)
 * 
 * ARQUITECTURA SIDECAR:
 * - Este plugin es completamente independiente del sistema principal
 * - Si se elimina, sst-colombia.com sigue funcionando al 100%
 * - Comunicación solo a través de Base de Datos
 * - Principio de código seguro: Solo añadir, no modificar
 * 
 * Ubicación: /plugins/promotions/
 * 
 * Rutas expuestas: /api/plugins/promotions/*
 */

export { default as promotionsRouter } from "./routes";
export * from "./schema";
export * from "./service";

// Plugin metadata
export const PLUGIN_INFO = {
  name: "promotions",
  version: "1.0.0",
  description: "Plugin de Promociones y Referidos para SST Colombia",
  author: "SST Colombia",
  mountPath: "/api/plugins/promotions",
  tables: [
    "plugin_promotion_coupons",
    "plugin_referral_ledger",
    "plugin_digital_contracts",
    "plugin_credit_usage_history",
  ],
};
