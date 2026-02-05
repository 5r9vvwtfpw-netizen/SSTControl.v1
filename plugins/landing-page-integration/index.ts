/**
 * Landing Page Integration Plugin
 * 
 * ARQUITECTURA SIDECAR:
 * - Este plugin es independiente del sistema principal
 * - Si se deshabilita, la app sigue funcionando (sin integración landing page)
 * - Comunicación a través de una facade estable
 * - Principio de código seguro: Solo añadir, no modificar
 * 
 * KILL SWITCH:
 * - Importar { disablePlugin } y llamarlo para deshabilitar inmediatamente
 * - Todas las verificaciones de quotes fallarán gracefully
 * 
 * Ubicación: /plugins/landing-page-integration/
 * Rutas expuestas: /api/plugins/landing-page/*
 * 
 * USO DESDE LA APP PRINCIPAL:
 * ```typescript
 * import { verifyQuote, getQuoteSummary } from "../plugins/landing-page-integration";
 * 
 * const result = verifyQuote(token);
 * if (result.valid) {
 *   console.log(getQuoteSummary(result.data!));
 * }
 * ```
 */

export { default as landingPageRouter } from "./routes";

export {
  verifyQuote,
  getRawQuotePayload,
  getQuoteSummary,
  disablePlugin,
  enablePlugin,
  isPluginEnabled,
  updateConfig,
  refreshConfig,
} from "./facade";

export type {
  QuotePayload,
  NormalizedQuoteData,
  QuoteVerificationResult,
  PluginConfig,
} from "./types";

export const PLUGIN_INFO = {
  name: "landing-page-integration",
  version: "1.0.0",
  description: "Integración segura con landing page sst-colombia.com.co vía JWT",
  author: "SST Colombia",
  mountPath: "/api/plugins/landing-page",
  killSwitch: {
    import: "import { disablePlugin } from '../plugins/landing-page-integration'",
    usage: "disablePlugin() // Deshabilita inmediatamente todas las verificaciones",
  },
  stableInterface: {
    verifyQuote: "Verificar y normalizar token de cotización",
    getQuoteSummary: "Obtener resumen legible para logs",
  },
};
