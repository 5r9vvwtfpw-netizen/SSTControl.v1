import type { Request, Response, NextFunction } from "express";
import { createHash } from "crypto";

interface LicenseState {
  isValid: boolean;
  lastCheck: number;
  readOnlyMode: boolean;
  message: string;
}

let licenseState: LicenseState = {
  isValid: false,
  lastCheck: 0,
  readOnlyMode: true,
  message: "Licencia no verificada"
};

const CACHE_DURATION = 5 * 60 * 1000;
const WRITE_METHODS = ["POST", "PUT", "PATCH", "DELETE"];
const PUBLIC_PATHS = [
  "/api/login",
  "/api/logout", 
  "/api/register",
  "/api/user",
  "/api/session",
  "/api/worker-portal/login",
  "/api/worker-portal/verify",
  "/api/health"
];

function hashLicenseKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

async function verifyLicenseRemote(licenseKey: string): Promise<{ valid: boolean; message: string }> {
  const masterServer = process.env.OWNER_LICENSE_SERVER;
  
  if (!masterServer) {
    return verifyLicenseLocal(licenseKey);
  }
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${masterServer}/api/verify-license`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        licenseKey: hashLicenseKey(licenseKey),
        appId: process.env.REPL_ID || "unknown"
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    
    if (response.ok) {
      const data = await response.json();
      return { 
        valid: data.valid === true, 
        message: data.message || (data.valid ? "Licencia verificada" : "Licencia revocada")
      };
    }
    
    return verifyLicenseLocal(licenseKey);
  } catch (error) {
    console.log("[License] Servidor maestro no disponible, verificación local");
    return verifyLicenseLocal(licenseKey);
  }
}

function verifyLicenseLocal(licenseKey: string): { valid: boolean; message: string } {
  if (!licenseKey || licenseKey.trim().length < 16) {
    return { valid: false, message: "Clave de licencia inválida o no configurada" };
  }
  
  const expectedFormat = /^SST-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  if (!expectedFormat.test(licenseKey)) {
    if (licenseKey.length >= 32) {
      return { valid: true, message: "Licencia válida (formato legacy)" };
    }
    return { valid: false, message: "Formato de licencia no reconocido" };
  }
  
  return { valid: true, message: "Licencia válida" };
}

export async function checkLicense(): Promise<LicenseState> {
  const now = Date.now();
  
  if (licenseState.lastCheck > 0 && (now - licenseState.lastCheck) < CACHE_DURATION) {
    return licenseState;
  }
  
  const licenseKey = process.env.OWNER_LICENSE_KEY;
  
  if (!licenseKey) {
    licenseState = {
      isValid: false,
      lastCheck: now,
      readOnlyMode: true,
      message: "OWNER_LICENSE_KEY no configurada - Modo Lectura activado"
    };
    console.warn("[License]", licenseState.message);
    return licenseState;
  }
  
  const result = await verifyLicenseRemote(licenseKey);
  
  licenseState = {
    isValid: result.valid,
    lastCheck: now,
    readOnlyMode: !result.valid,
    message: result.message
  };
  
  if (!result.valid) {
    console.warn("[License] Modo Lectura activado:", result.message);
  } else {
    console.log("[License] Licencia verificada correctamente");
  }
  
  return licenseState;
}

export function requireValidLicense(req: Request, res: Response, next: NextFunction) {
  if (PUBLIC_PATHS.some(path => req.path.startsWith(path))) {
    return next();
  }
  
  if (!WRITE_METHODS.includes(req.method)) {
    return next();
  }
  
  if (licenseState.readOnlyMode) {
    return res.status(503).json({
      error: "service_unavailable",
      message: "El sistema se encuentra en mantenimiento. Por favor intente más tarde."
    });
  }
  
  next();
}

export function getLicenseStatus(): LicenseState {
  return { ...licenseState };
}

export async function initializeLicense(): Promise<void> {
  console.log("[License] Iniciando verificación de licencia...");
  await checkLicense();
  
  setInterval(async () => {
    await checkLicense();
  }, CACHE_DURATION);
}

export function forceLicenseRecheck(): void {
  licenseState.lastCheck = 0;
}
