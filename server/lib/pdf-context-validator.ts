/**
 * PDF Context Validator
 * 
 * Helper para validar el contexto antes de generar PDFs.
 * Previene errores de variables undefined que causan fallos silenciosos.
 * 
 * Creado: Enero 2026
 * Razón: Bug detectado donde se usaba effectiveCompanyId sin definir,
 *        causando fallos en producción en /api/responsible-designations/:id/acta-pdf
 */

import { Request, Response } from "express";

interface PdfContextValidation {
  companyId: string;
  isValid: boolean;
  error?: string;
}

interface PdfContextOptions {
  requireCompanyId?: boolean;
  requireUserId?: boolean;
  contextName?: string; // Para logging descriptivo
}

/**
 * Valida que las variables críticas para generación de PDF estén definidas.
 * Debe llamarse al inicio de cada endpoint de PDF.
 * 
 * @example
 * const validation = validatePdfContext(req, { companyId }, { contextName: 'Acta Designación' });
 * if (!validation.isValid) {
 *   console.error(`[PDF-ERROR] ${validation.error}`);
 *   return res.status(400).send(validation.error);
 * }
 */
export function validatePdfContext(
  req: Request,
  variables: Record<string, any>,
  options: PdfContextOptions = {}
): PdfContextValidation {
  const { contextName = 'PDF Generation' } = options;
  const errors: string[] = [];
  
  // Validar cada variable proporcionada
  for (const [varName, value] of Object.entries(variables)) {
    if (value === undefined) {
      errors.push(`Variable '${varName}' is undefined`);
      console.error(`[PDF-CONTEXT-ERROR] ${contextName}: Variable '${varName}' is undefined. Request URL: ${req.originalUrl}`);
    } else if (value === null) {
      errors.push(`Variable '${varName}' is null`);
      console.error(`[PDF-CONTEXT-ERROR] ${contextName}: Variable '${varName}' is null. Request URL: ${req.originalUrl}`);
    } else if (typeof value === 'string' && value.trim() === '') {
      errors.push(`Variable '${varName}' is empty string`);
      console.error(`[PDF-CONTEXT-ERROR] ${contextName}: Variable '${varName}' is empty string. Request URL: ${req.originalUrl}`);
    }
  }
  
  if (errors.length > 0) {
    const errorMsg = `Error de contexto en ${contextName}: ${errors.join(', ')}`;
    console.error(`[PDF-CONTEXT-VALIDATION-FAILED] ${errorMsg}`);
    return {
      companyId: '',
      isValid: false,
      error: errorMsg
    };
  }
  
  return {
    companyId: variables.companyId || '',
    isValid: true
  };
}

/**
 * Wrapper para generar PDFs con validación automática.
 * Captura y loguea errores detallados en lugar de fallar silenciosamente.
 */
export async function withPdfErrorHandling<T>(
  contextName: string,
  req: Request,
  res: Response,
  generator: () => Promise<T>
): Promise<T | null> {
  try {
    return await generator();
  } catch (error: any) {
    const errorDetails = {
      context: contextName,
      url: req.originalUrl,
      method: req.method,
      userId: (req as any).user?.id,
      companyId: (req as any).user?.companyId,
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 5).join('\n')
    };
    
    console.error('[PDF-GENERATION-ERROR]', JSON.stringify(errorDetails, null, 2));
    
    // Mensaje más descriptivo para debugging
    if (error.message?.includes('undefined')) {
      console.error(`[PDF-DEBUG] Posible variable no definida en ${contextName}. Revisar el contexto del endpoint.`);
    }
    
    res.status(500).send(`Error al generar ${contextName}. Por favor contacte soporte si el problema persiste.`);
    return null;
  }
}

/**
 * Verifica que companyId sea válido antes de operaciones de BD.
 * Útil para prevenir queries con undefined/null.
 */
export function assertValidCompanyId(companyId: any, context: string): asserts companyId is string {
  if (!companyId || typeof companyId !== 'string' || companyId.trim() === '') {
    const error = new Error(`[${context}] companyId inválido: ${JSON.stringify(companyId)}`);
    console.error(error.message);
    throw error;
  }
}
