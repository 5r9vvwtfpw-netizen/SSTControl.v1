/**
 * Banner de advertencia para ambiente de desarrollo.
 * Se muestra únicamente cuando import.meta.env.PROD === false.
 * Evita que clientes se registren accidentalmente en el entorno de desarrollo.
 */

import { AlertTriangle, ExternalLink } from "lucide-react";

const IS_PROD = import.meta.env.PROD;
const PROD_URL = "https://sst.sagisas.co";

export function DevEnvBanner() {
  if (IS_PROD) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white"
      style={{ background: "linear-gradient(90deg, #b91c1c 0%, #d97706 100%)" }}
      role="alert"
    >
      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
      <span>⚠️ AMBIENTE DE DESARROLLO — Los datos aquí NO se guardan en producción.</span>
      <a
        href={PROD_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="ml-2 inline-flex items-center gap-1 underline underline-offset-2 hover:opacity-80"
      >
        Ir a la app real <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

/** Espaciador para compensar la altura del banner fijo (evitar que tape contenido). */
export function DevEnvBannerSpacer() {
  if (IS_PROD) return null;
  return <div className="h-10" />;
}
