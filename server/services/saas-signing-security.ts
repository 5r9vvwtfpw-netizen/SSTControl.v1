import { createHmac, randomInt, timingSafeEqual } from "crypto";

export const SAAS_SIGNING_CODE_TTL_MS = 10 * 60 * 1000;
export const SAAS_SIGNING_MAX_CODE_ATTEMPTS = 5;
export const SAAS_SIGNING_RESEND_COOLDOWN_MS = 60 * 1000;
export const SAAS_SIGNING_MAX_CODE_SENDS_PER_HOUR = 5;
export const SAAS_SIGNING_MAX_IP_SENDS_PER_WINDOW = 20;
export const SAAS_SIGNING_MAX_IP_SIGN_ATTEMPTS_PER_WINDOW = 30;
export const SAAS_SIGNING_IP_WINDOW_MS = 15 * 60 * 1000;
export const SAAS_SIGNING_OBJECTS_PATH_PATTERN = /^\/objects\/saas-signing(?:\/|$)/i;

export function getTrustedSaasSigningIp(request: {
  ip?: string;
  socket?: { remoteAddress?: string };
  headers?: unknown;
}): string {
  return (request.ip?.trim() || request.socket?.remoteAddress?.trim() || "unknown").slice(0, 128);
}

export function createSaasSigningCode(): string {
  return randomInt(100000, 1000000).toString();
}

export function hashSaasSigningOtp(secret: string, requestId: string, challengeId: string, code: string): string {
  return createHmac("sha256", secret)
    .update(`saas-contract-signing-otp:v1\0${requestId}\0${challengeId}\0${code}`)
    .digest("hex");
}

export function hashSaasSigningIp(secret: string, ip: string): string {
  return createHmac("sha256", secret)
    .update(`saas-contract-signing-ip:v1\0${ip}`)
    .digest("hex");
}

export function safeHashEqual(expected: string, candidate: string): boolean {
  if (!/^[a-f0-9]{64}$/.test(expected) || !/^[a-f0-9]{64}$/.test(candidate)) return false;
  return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(candidate, "hex"));
}

export function verifyUploadedProofMime(
  mimeType: string,
  bytes: Buffer,
): "application/pdf" | "image/png" | "image/jpeg" | "image/webp" | null {
  if (mimeType === "application/pdf" && bytes.subarray(0, 5).toString("ascii") === "%PDF-") {
    return "application/pdf";
  }
  if (mimeType === "image/png" &&
    bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return "image/png";
  }
  if (mimeType === "image/jpeg" && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (mimeType === "image/webp" && bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
    bytes.subarray(8, 12).toString("ascii") === "WEBP") {
    return "image/webp";
  }
  return null;
}

export function normalizeSignerId(value: string): string {
  return value.replace(/[^a-z0-9]/gi, "").toLocaleUpperCase("es");
}

export function normalizePersonName(value: string): string {
  return value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ").toLocaleLowerCase("es");
}