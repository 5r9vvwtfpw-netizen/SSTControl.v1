/**
 * Error message mapping and handling for report generation
 */

export type ReportErrorCode = 
  | "NO_COMPANY_SELECTED"
  | "NO_COMPANY_ASSIGNED"
  | "NO_DATA_FOR_PERIOD"
  | "MISSING_REQUIRED_DATA"
  | "SUBSCRIPTION_LIMIT"
  | "PDF_GENERATION_FAILED"
  | "DATABASE_ERROR"
  | "UNAUTHORIZED"
  | "NETWORK_ERROR"
  | "INVALID_PARAMETERS"
  | "TRIAL_PERIOD_LIMIT"
  | "UNKNOWN_ERROR";

interface ErrorMessage {
  title: string;
  description: string;
  suggestion?: string;
}

const errorMessages: Record<ReportErrorCode, ErrorMessage> = {
  NO_COMPANY_SELECTED: {
    title: "Empresa no seleccionada",
    description: "Como proveedor, debe seleccionar una empresa del menú superior para generar informes.",
    suggestion: "Utilice el selector de empresa en la barra de navegación superior.",
  },
  NO_COMPANY_ASSIGNED: {
    title: "Empresa no asignada",
    description: "Su cuenta no tiene una empresa asignada. No se puede generar informes sin una empresa vinculada.",
    suggestion: "Por favor vaya a Configuración → Empresa para registrar su empresa, o contacte al administrador del sistema.",
  },
  NO_DATA_FOR_PERIOD: {
    title: "Sin datos para el período seleccionado",
    description: "No se encontraron registros para el período especificado. Verifique que existan datos capturados en las fechas indicadas.",
    suggestion: "Seleccione un período diferente o asegúrese de haber registrado la información requerida.",
  },
  MISSING_REQUIRED_DATA: {
    title: "Datos incompletos",
    description: "No se pueden generar el informe debido a que faltan datos obligatorios en el sistema.",
    suggestion: "Verifique que todos los campos requeridos estén completos (datos de empresa, trabajadores, registros de seguridad, etc.).",
  },
  SUBSCRIPTION_LIMIT: {
    title: "Límite de suscripción alcanzado",
    description: "Su plan actual no permite generar este tipo de informe o ha alcanzado el límite de descargas.",
    suggestion: "Actualice su plan de suscripción para acceder a esta funcionalidad.",
  },
  PDF_GENERATION_FAILED: {
    title: "Error al generar el documento PDF",
    description: "Ocurrió un problema al procesar y generar el archivo PDF del informe.",
    suggestion: "Intente nuevamente en unos momentos. Si el problema persiste, contacte al soporte técnico.",
  },
  DATABASE_ERROR: {
    title: "Error al acceder a los datos",
    description: "Hubo un problema al consultar la información de la base de datos.",
    suggestion: "Intente nuevamente más tarde. Si el problema persiste, contacte al administrador del sistema.",
  },
  UNAUTHORIZED: {
    title: "Acceso denegado",
    description: "No tiene permisos suficientes para generar este informe.",
    suggestion: "Contacte al administrador del sistema para solicitar los permisos necesarios.",
  },
  NETWORK_ERROR: {
    title: "Error de conexión",
    description: "No se pudo conectar con el servidor para generar el informe. Verifique su conexión a Internet.",
    suggestion: "Intente nuevamente cuando la conexión sea estable.",
  },
  INVALID_PARAMETERS: {
    title: "Parámetros inválidos",
    description: "Los parámetros enviados para generar el informe no son válidos.",
    suggestion: "Verifique los filtros y criterios seleccionados e intente nuevamente.",
  },
  TRIAL_PERIOD_LIMIT: {
    title: "Función no disponible en período de prueba",
    description: "Las descargas de reportes están disponibles solo después de activar una suscripción.",
    suggestion: "Complete su suscripción para acceder a esta funcionalidad.",
  },
  UNKNOWN_ERROR: {
    title: "Error desconocido",
    description: "Ocurrió un error inesperado al generar el informe.",
    suggestion: "Intente nuevamente. Si el problema persiste, contacte al soporte técnico.",
  },
};

/**
 * Parse error response and extract code and message
 */
export function parseReportError(error: any): { code: ReportErrorCode; message: ErrorMessage } {
  // Check if error has a specific code
  if (error?.response?.data?.error) {
    const code = error.response.data.error as ReportErrorCode;
    if (errorMessages[code]) {
      return { code, message: errorMessages[code] };
    }
  }

  // Check if error message matches known patterns
  const errorMsg = error?.message || error?.toString() || "";
  
  if (errorMsg.includes("NO_COMPANY_SELECTED")) {
    return { code: "NO_COMPANY_SELECTED", message: errorMessages.NO_COMPANY_SELECTED };
  }
  if (errorMsg.includes("NO_COMPANY_ASSIGNED")) {
    return { code: "NO_COMPANY_ASSIGNED", message: errorMessages.NO_COMPANY_ASSIGNED };
  }
  if (errorMsg.includes("NO_DATA") || errorMsg.includes("no data")) {
    return { code: "NO_DATA_FOR_PERIOD", message: errorMessages.NO_DATA_FOR_PERIOD };
  }
  if (errorMsg.includes("required") || errorMsg.includes("obligatorio")) {
    return { code: "MISSING_REQUIRED_DATA", message: errorMessages.MISSING_REQUIRED_DATA };
  }
  if (errorMsg.includes("subscription") || errorMsg.includes("suscripción")) {
    return { code: "SUBSCRIPTION_LIMIT", message: errorMessages.SUBSCRIPTION_LIMIT };
  }
  if (errorMsg.includes("PDF") || errorMsg.includes("pdf")) {
    return { code: "PDF_GENERATION_FAILED", message: errorMessages.PDF_GENERATION_FAILED };
  }
  if (errorMsg.includes("network") || errorMsg.includes("Network")) {
    return { code: "NETWORK_ERROR", message: errorMessages.NETWORK_ERROR };
  }
  if (errorMsg.includes("401") || errorMsg.includes("unauthorized")) {
    return { code: "UNAUTHORIZED", message: errorMessages.UNAUTHORIZED };
  }
  if (errorMsg.includes("trial") || errorMsg.includes("prueba")) {
    return { code: "TRIAL_PERIOD_LIMIT", message: errorMessages.TRIAL_PERIOD_LIMIT };
  }

  // Default to unknown error
  return { code: "UNKNOWN_ERROR", message: errorMessages.UNKNOWN_ERROR };
}

/**
 * Format error for display
 */
export function formatReportError(error: any): { title: string; description: string; fullMessage: string } {
  const { message } = parseReportError(error);
  
  const fullMessage = message.suggestion
    ? `${message.description}\n\n${message.suggestion}`
    : message.description;

  return {
    title: message.title,
    description: message.description,
    fullMessage,
  };
}
