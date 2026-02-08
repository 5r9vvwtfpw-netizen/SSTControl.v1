/**
 * SST Colombia - Sistema de Gestión de Seguridad y Salud en el Trabajo
 * 
 * Copyright (c) 2024-2026. Todos los derechos reservados.
 * 
 * Este software es propiedad confidencial y está protegido por las leyes de
 * propiedad intelectual de Colombia (Ley 23 de 1982, Decisión Andina 351).
 * 
 * Queda estrictamente prohibida su reproducción, distribución, modificación
 * o ingeniería inversa sin autorización expresa por escrito del propietario.
 * 
 * CONFIDENCIAL - NO DISTRIBUIR
 */


// Utility functions for SST system

// Trial configuration constants
export const TRIAL_DAYS = 7;

/**
 * Trial and subscription status utilities
 */
export interface TrialStatus {
  isTrial: boolean;
  isActive: boolean;
  isPaid: boolean;
  isExpired: boolean;
  daysRemaining: number | null;
  canDownloadDocuments: boolean;
  canExportData: boolean;
  requiresWatermark: boolean;
}

/**
 * Determines the complete trial/subscription status for a user
 * Used to control access to features during trial period
 * 
 * @param subscriptionStatus - Current subscription status
 * @param trialEndDate - Trial end date if in trial
 * @param emailVerified - Whether email is verified
 * @param companyProfileComplete - Whether company profile is complete
 * @returns TrialStatus object with all access flags
 */
export function getTrialStatus(
  subscriptionStatus: string | null,
  trialEndDate: Date | string | null,
  emailVerified: boolean = false,
  companyProfileComplete: boolean = false
): TrialStatus {
  const isTrial = subscriptionStatus === 'trial';
  const isActive = subscriptionStatus === 'active';
  const isPaid = isActive; // Active means they've paid
  const daysRemaining = getTrialDaysRemaining(trialEndDate);
  const isExpired = isTrial && (daysRemaining !== null && daysRemaining <= 0);
  
  // Can only download documents if:
  // 1. They have a paid/active subscription, OR
  // 2. They're in trial AND verified their email AND completed company profile
  const canDownloadDocuments = isPaid || (isTrial && emailVerified && companyProfileComplete && !isExpired);
  
  // Can only export data (bulk) if they have a paid subscription
  const canExportData = isPaid;
  
  // Watermark required for all trial accounts
  const requiresWatermark = isTrial && !isPaid;
  
  return {
    isTrial,
    isActive,
    isPaid,
    isExpired,
    daysRemaining,
    canDownloadDocuments,
    canExportData,
    requiresWatermark
  };
}

/**
 * Calculates the applicable chapter (1, 2, or 3) based on Resolución 0312/2019
 * 
 * @param numberOfWorkers - Total number of workers in the company
 * @param riskLevel - Risk level classification (I, II, III, IV, V)
 * @returns Chapter number as string ("1", "2", or "3")
 * 
 * Rules from Resolución 0312/2019:
 * - Chapter 1: 1-10 workers AND risk I, II, or III (7 basic standards)
 * - Chapter 2: 11-50 workers AND risk I, II, or III (21 standards)
 * - Chapter 3: >50 workers (any risk) OR ≤50 workers with risk IV or V (61 complete standards)
 */
export function calculateChapter(
  numberOfWorkers: number,
  riskLevel: "I" | "II" | "III" | "IV" | "V"
): "1" | "2" | "3" {
  const highRisk = riskLevel === "IV" || riskLevel === "V";
  
  // Chapter 3: >50 workers OR high risk (IV/V) with ≤50 workers
  if (numberOfWorkers > 50 || highRisk) {
    return "3";
  }
  
  // Chapter 2: 11-50 workers AND low-medium risk (I/II/III)
  if (numberOfWorkers >= 11 && numberOfWorkers <= 50) {
    return "2";
  }
  
  // Chapter 1: 1-10 workers AND low-medium risk (I/II/III)
  return "1";
}

/**
 * Gets the number of minimum standards required for each chapter
 */
export function getChapterStandards(chapter: "1" | "2" | "3"): number {
  const standards = {
    "1": 7,
    "2": 21,
    "3": 61,
  };
  return standards[chapter];
}

/**
 * Gets the chapter description based on workers and risk level
 * Shows worker count and risk level instead of chapter terminology
 */
export function getChapterDescription(chapter: "1" | "2" | "3"): string {
  const descriptions = {
    "1": "1-10 trabajadores, Riesgo I/II/III - 7 estándares",
    "2": "11-50 trabajadores, Riesgo I/II/III - 21 estándares",
    "3": ">50 trabajadores o Riesgo IV/V - 61 estándares",
  };
  return descriptions[chapter];
}

/**
 * Gets a display label showing workers and risk level criteria
 */
export function getStandardsLabel(chapter: "1" | "2" | "3"): string {
  const labels = {
    "1": "Estándares Mínimos (7)",
    "2": "Estándares Intermedios (21)",
    "3": "Estándares Completos (61)",
  };
  return labels[chapter];
}

/**
 * Determines if PESV module is required based on Resolución 40595/2022
 * PESV is mandatory for ANY company that operates vehicles on public roads.
 * The level (básico/estándar/avanzado) depends on the number of vehicles.
 * 
 * Previous threshold (10+ vehicles or 2+ drivers) was based on Decreto 1252/2021,
 * but Resolución 40595/2022 establishes PESV for all companies with vehicles.
 * Pricing charges PESV from 1 vehicle, so access must match.
 * 
 * @param vehicleCount - Total number of vehicles
 * @param driverCount - Total number of drivers
 * @returns true if PESV is required, false otherwise
 */
export function isPesvRequired(vehicleCount: number, driverCount: number): boolean {
  return vehicleCount >= 1 || driverCount >= 1;
}

/**
 * Determines which modules are available based on the chapter and company characteristics
 * 
 * @param chapter - The calculated chapter for the company (1, 2, or 3)
 * @param vehicleCount - Total number of vehicles (for PESV requirement)
 * @param driverCount - Total number of drivers (for PESV requirement)
 * @returns Object indicating which modules are available
 * 
 * Note: PESV availability is determined by Decreto 1252/2021, independent of chapter
 */
export function getAvailableModules(
  chapter: "1" | "2" | "3",
  vehicleCount: number = 0,
  driverCount: number = 0
) {
  // All chapters have access to core SST modules
  const baseModules = {
    dashboard: true,
    workers: true,
    accidents: true,
    trainings: true,
    inspections: true,
    preventiveMeasures: true,
    occupationalDiseases: true,
  };

  // PESV is independent of chapter - based on Decreto 1252/2021
  const pesvRequired = isPesvRequired(vehicleCount, driverCount);

  // Chapter 1 (basic) - limited functionality
  if (chapter === "1") {
    return {
      ...baseModules,
      sstStandards: false, // No full standards evaluation for Chapter 1
      pesv: pesvRequired, // PESV only if ≥10 vehicles OR ≥2 drivers
      reports: true,
      advancedAnalytics: false,
    };
  }

  // Chapter 2 (intermediate)
  if (chapter === "2") {
    return {
      ...baseModules,
      sstStandards: true, // Can evaluate 21 standards
      pesv: pesvRequired, // PESV only if ≥10 vehicles OR ≥2 drivers
      reports: true,
      advancedAnalytics: false,
    };
  }

  // Chapter 3 (complete) - all functionality
  return {
    ...baseModules,
    sstStandards: true, // Full 62 standards evaluation
    pesv: pesvRequired, // PESV only if ≥10 vehicles OR ≥2 drivers
    reports: true,
    advancedAnalytics: true, // Advanced metrics and analytics
  };
}

/**
 * Gets a user-friendly label for risk levels
 */
export function getRiskLevelLabel(riskLevel: "I" | "II" | "III" | "IV" | "V"): string {
  const labels = {
    I: "Riesgo I (Mínimo)",
    II: "Riesgo II (Bajo)",
    III: "Riesgo III (Medio)",
    IV: "Riesgo IV (Alto)",
    V: "Riesgo V (Máximo)",
  };
  return labels[riskLevel];
}

/**
 * Gets examples of activities for each risk level
 */
export function getRiskLevelExamples(riskLevel: "I" | "II" | "III" | "IV" | "V"): string {
  const examples = {
    I: "Actividades administrativas, oficinas",
    II: "Comercio, algunos servicios",
    III: "Manufactura, transporte",
    IV: "Procesos industriales peligrosos, construcción",
    V: "Minería, petroleras, manejo de explosivos",
  };
  return examples[riskLevel];
}

/**
 * Maps a company's chapter to the corresponding "tipoEmpresa" for standards filtering
 * 
 * According to Resolution 0312/2019:
 * - tipo1: Chapter 1 companies (≤10 workers AND risk I/II/III) - 7 standards
 * - tipo2: Chapter 2 companies (11-50 workers AND risk I/II/III) - 21 standards
 * - tipo3: Chapter 3 companies (>50 workers OR risk IV/V) - 62 standards
 * 
 * NOTE: tipo4 was eliminated - Chapter 3 always uses tipo3 regardless of risk level.
 * The risk level only affects which chapter the company falls into, not the tipo.
 */
export function getEmpresaTipoFromChapterAndRisk(
  chapter: "1" | "2" | "3",
  riskLevel: "I" | "II" | "III" | "IV" | "V"
): "tipo1" | "tipo2" | "tipo3" {
  if (chapter === "1") {
    return "tipo1";
  }
  
  if (chapter === "2") {
    return "tipo2";
  }
  
  // Chapter 3 - always tipo3 regardless of risk level
  return "tipo3";
}

/**
 * Calculates remaining trial days
 * @param trialEndDate - The trial end date
 * @returns Number of days remaining (negative if expired)
 */
export function getTrialDaysRemaining(trialEndDate: Date | string | null): number | null {
  if (!trialEndDate) return null;
  
  const endDate = typeof trialEndDate === 'string' ? new Date(trialEndDate) : trialEndDate;
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Gets the trial status message
 */
export function getTrialStatusMessage(daysRemaining: number | null): { message: string; severity: 'info' | 'warning' | 'error' } {
  if (daysRemaining === null) {
    return { message: '', severity: 'info' };
  }
  
  if (daysRemaining <= 0) {
    return { 
      message: 'Tu período de prueba ha expirado. Activa tu suscripción para continuar.', 
      severity: 'error' 
    };
  }
  
  if (daysRemaining <= 3) {
    return { 
      message: `Tu prueba expira en ${daysRemaining} día${daysRemaining === 1 ? '' : 's'}. ¡Activa tu plan ahora!`, 
      severity: 'error' 
    };
  }
  
  if (daysRemaining <= 7) {
    return { 
      message: `Tu prueba expira en ${daysRemaining} días. Considera activar tu suscripción.`, 
      severity: 'warning' 
    };
  }
  
  return { 
    message: `Período de prueba: ${daysRemaining} días restantes`, 
    severity: 'info' 
  };
}
