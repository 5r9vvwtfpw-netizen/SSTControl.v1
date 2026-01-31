/**
 * Billing Validator - Sistema de validación para facturación
 * 
 * PRINCIPIO DE CÓDIGO SEGURO:
 * Este módulo valida TODOS los datos de facturación ANTES de insertarlos
 * en la base de datos, previniendo errores de campos nulos o incorrectos.
 * 
 * Creado: Enero 2026
 * Motivo: Prevenir errores de constraint NOT NULL en tabla invoices
 */

import { z } from 'zod';
import logger from './logger';

/**
 * Schema de validación para datos de factura
 * Refleja EXACTAMENTE la estructura de la tabla invoices en shared/schema.ts
 */
export const invoiceInsertSchema = z.object({
  companyId: z.string().min(1, 'companyId es requerido'),
  subscriptionId: z.string().min(1, 'subscriptionId es requerido'),
  invoiceNumber: z.string().min(1, 'invoiceNumber es requerido'),
  status: z.enum(['draft', 'issued', 'paid', 'overdue', 'cancelled', 'refunded']).default('draft'),
  
  // Campos de montos - TODOS requeridos
  subtotal: z.number().int().min(0, 'subtotal debe ser >= 0'),
  taxAmount: z.number().int().min(0, 'taxAmount debe ser >= 0').default(0),
  total: z.number().int().min(0, 'total debe ser >= 0'),
  currency: z.string().default('COP'),
  
  // Período de facturación - requeridos
  periodStart: z.date({ required_error: 'periodStart es requerido' }),
  periodEnd: z.date({ required_error: 'periodEnd es requerido' }),
  
  // Fechas
  dueDate: z.date({ required_error: 'dueDate es requerido' }),
  
  // Datos del cliente - requeridos
  customerName: z.string().min(1, 'customerName es requerido'),
  customerNit: z.string().min(1, 'customerNit es requerido'),
  customerEmail: z.string().min(1, 'customerEmail es requerido'),
  customerAddress: z.string().optional(),
  
  // Line items - debe ser string JSON válido
  lineItems: z.string().min(2, 'lineItems debe ser un JSON válido'),
});

export type ValidatedInvoiceData = z.infer<typeof invoiceInsertSchema>;

/**
 * Valida los datos de una factura antes de insertarla
 * @throws Error si los datos son inválidos
 */
export function validateInvoiceData(data: unknown): ValidatedInvoiceData {
  const context = { module: 'billing-validator' };
  
  try {
    const validated = invoiceInsertSchema.parse(data);
    
    // Validaciones adicionales de negocio
    if (validated.total !== validated.subtotal + validated.taxAmount) {
      throw new Error(`Total (${validated.total}) no coincide con subtotal (${validated.subtotal}) + taxAmount (${validated.taxAmount})`);
    }
    
    if (validated.periodEnd <= validated.periodStart) {
      throw new Error('periodEnd debe ser posterior a periodStart');
    }
    
    // Validar que lineItems sea JSON válido
    try {
      const items = JSON.parse(validated.lineItems);
      if (!Array.isArray(items) || items.length === 0) {
        throw new Error('lineItems debe ser un array con al menos un elemento');
      }
    } catch (e) {
      throw new Error('lineItems no es un JSON válido');
    }
    
    logger.debug({ ...context, invoiceNumber: validated.invoiceNumber }, 'Invoice data validated successfully');
    return validated;
    
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      logger.error({ ...context, errors: fieldErrors }, '[BILLING-VALIDATION-ERROR] Invalid invoice data');
      throw new Error(`[BILLING-VALIDATION-ERROR] Datos de factura inválidos: ${fieldErrors}`);
    }
    
    logger.error({ ...context, error: error.message }, '[BILLING-VALIDATION-ERROR] Invoice validation failed');
    throw error;
  }
}

/**
 * Verifica que los campos requeridos para generar una factura estén presentes
 * en los datos de la suscripción
 */
export function validateSubscriptionForBilling(subscription: any): void {
  const context = { module: 'billing-validator', subscriptionId: subscription?.id };
  
  const requiredFields = [
    'id',
    'companyId', 
    'planId',
    'planPrice',
    'currentPeriodStart',
    'currentPeriodEnd',
    'companyName'
  ];
  
  const missingFields = requiredFields.filter(field => {
    const value = subscription?.[field];
    return value === undefined || value === null || value === '';
  });
  
  if (missingFields.length > 0) {
    const errorMsg = `[BILLING-VALIDATION-ERROR] Suscripción incompleta para facturación. Campos faltantes: ${missingFields.join(', ')}`;
    logger.error({ ...context, missingFields }, errorMsg);
    throw new Error(errorMsg);
  }
  
  // Validar que el precio sea válido
  if (typeof subscription.planPrice !== 'number' || subscription.planPrice < 0) {
    throw new Error(`[BILLING-VALIDATION-ERROR] planPrice inválido: ${subscription.planPrice}`);
  }
  
  logger.debug({ ...context }, 'Subscription validated for billing');
}

/**
 * Verifica que los datos de la empresa estén completos para facturación
 */
export function validateCompanyForBilling(company: any): void {
  const context = { module: 'billing-validator', companyId: company?.id };
  
  if (!company) {
    throw new Error('[BILLING-VALIDATION-ERROR] Empresa no encontrada');
  }
  
  const requiredFields = ['id', 'name', 'nit'];
  const missingFields = requiredFields.filter(field => {
    const value = company?.[field];
    return value === undefined || value === null || value === '';
  });
  
  if (missingFields.length > 0) {
    const errorMsg = `[BILLING-VALIDATION-ERROR] Empresa incompleta para facturación. Campos faltantes: ${missingFields.join(', ')}`;
    logger.error({ ...context, missingFields }, errorMsg);
    throw new Error(errorMsg);
  }
  
  logger.debug({ ...context }, 'Company validated for billing');
}

/**
 * Test de salud del sistema de facturación
 * Ejecutar periódicamente para verificar que todo funciona
 */
export async function billingHealthCheck(): Promise<{ success: boolean; message: string; details?: any }> {
  const context = { module: 'billing-validator', check: 'health' };
  
  try {
    // Test 1: Validar que el schema de Zod funciona
    const testData = {
      companyId: 'test-company',
      subscriptionId: 'test-subscription',
      invoiceNumber: 'TEST-001',
      status: 'draft' as const,
      subtotal: 10000,
      taxAmount: 0,
      total: 10000,
      currency: 'COP',
      periodStart: new Date(),
      periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      customerName: 'Test Company',
      customerNit: '123456789',
      customerEmail: 'test@test.com',
      lineItems: JSON.stringify([{ description: 'Test', quantity: 1, unitPrice: 10000, total: 10000 }])
    };
    
    validateInvoiceData(testData);
    
    logger.info({ ...context }, 'Billing health check passed');
    return { 
      success: true, 
      message: 'Sistema de facturación operativo',
      details: {
        schemaValidation: 'OK',
        timestamp: new Date().toISOString()
      }
    };
    
  } catch (error: any) {
    logger.error({ ...context, error: error.message }, 'Billing health check failed');
    return { 
      success: false, 
      message: `Error en sistema de facturación: ${error.message}`,
      details: { error: error.message }
    };
  }
}
