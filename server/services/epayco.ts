/**
 * Cliente ePayco para pagos PSE directos.
 *
 * Este adaptador usa el endpoint bancario de ePayco y no el checkout
 * multipropósito, por lo que el flujo solo puede iniciar transferencias PSE.
 * Las llaves nunca se envían al frontend.
 */

import crypto from "crypto";
import { isIP } from "net";
import logger from "../lib/logger";

const API_BASE_URL = "https://api.secure.payco.co";
const SECURE_BASE_URL = "https://secure.payco.co";

const KEY_MAP: Record<string, string> = {
  bank: "banco",
  invoice: "factura",
  description: "descripcion",
  value: "valor",
  tax: "iva",
  ico: "ico",
  tax_base: "baseiva",
  currency: "moneda",
  type_person: "tipo_persona",
  doc_type: "tipo_doc",
  doc_number: "documento",
  name: "nombres",
  last_name: "apellidos",
  email: "email",
  country: "pais",
  department: "depto",
  city: "ciudad",
  phone: "telefono",
  cell_phone: "celular",
  address: "direccion",
  ip: "ip",
  url_response: "url_respuesta",
  url_confirmation: "url_confirmacion",
  method_confirmation: "method_confirmation",
  metodoconfirmacion: "metodoconfirmacion",
  extra1: "extra1",
  extra2: "extra2",
  extra3: "extra3",
  extra4: "extra4",
  extra5: "extra5",
  extra6: "extra6",
  extra7: "extra7",
};

export interface EpaycoBank {
  code: string;
  name: string;
}

export interface CreateEpaycoPseParams {
  bankCode: string;
  invoice: string;
  description: string;
  amount: number;
  documentType: string;
  documentNumber: string;
  personType: "0" | "1";
  firstName: string;
  lastName: string;
  email: string;
  cellPhone: string;
  ip: string;
  responseUrl: string;
  confirmationUrl: string;
}

export interface EpaycoPseResult {
  bankRedirectUrl: string;
  ticketId: string | null;
  transactionId: string | null;
  refPayco: string | null;
  raw: unknown;
}

function getPublicKey(): string {
  const value = process.env.EPAYCO_PUBLIC_KEY;
  if (!value) throw new Error("EPAYCO_PUBLIC_KEY no está configurado");
  return value;
}

function getPrivateKey(): string {
  const value = process.env.EPAYCO_PRIVATE_KEY;
  if (!value) throw new Error("EPAYCO_PRIVATE_KEY no está configurado");
  return value;
}

export function isEpaycoConfigured(): boolean {
  return Boolean(
    process.env.EPAYCO_PUBLIC_KEY &&
    process.env.EPAYCO_PRIVATE_KEY &&
    process.env.EPAYCO_CUSTOMER_ID &&
    process.env.EPAYCO_P_KEY
  );
}

export function isEpaycoTestMode(): boolean {
  return process.env.EPAYCO_TEST !== "false";
}

export function getEpaycoClientIp(forwardedFor?: string, requestIp?: string): string {
  const candidates = [...(forwardedFor?.split(",") || []), requestIp || ""];
  for (const candidate of candidates) {
    const ip = candidate.trim().replace(/^::ffff:/i, "");
    if (isIP(ip) === 4) {
      const [first, second] = ip.split(".").map(Number);
      if (
        first > 0 && first < 224 &&
        first !== 10 && first !== 127 &&
        !(first === 100 && second >= 64 && second <= 127) &&
        !(first === 169 && second === 254) &&
        !(first === 172 && second >= 16 && second <= 31) &&
        !(first === 192 && second === 168)
      ) return ip;
    } else if (isIP(ip) === 6 && !/^(::|fc|fd|fe[89ab])/i.test(ip)) {
      return ip;
    }
  }
  throw new Error("No se pudo identificar una IP pública del pagador. Intente de nuevo más tarde.");
}

function getCipher(privateKey: string): crypto.Cipher {
  if (!/^[0-9a-f]+$/i.test(privateKey) || ![32, 48, 64].includes(privateKey.length)) {
    throw new Error("EPAYCO_PRIVATE_KEY no tiene el formato hexadecimal esperado");
  }

  const key = Buffer.from(privateKey, "hex");
  const cipher = crypto.createCipheriv(`aes-${key.length * 8}-cbc`, key, Buffer.alloc(16));
  cipher.setAutoPadding(true);
  return cipher;
}

function encrypt(value: unknown, privateKey: string): string {
  const cipher = getCipher(privateKey);
  const input = Buffer.from(String(value ?? ""), "utf8");
  return Buffer.concat([cipher.update(input), cipher.final()]).toString("base64");
}

function buildEncryptedPayload(data: Record<string, unknown>): Record<string, unknown> {
  const privateKey = getPrivateKey();
  const encrypted: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    const mappedKey = KEY_MAP[key] || key;
    encrypted[mappedKey] = encrypt(value, privateKey);
  }

  encrypted.public_key = getPublicKey();
  encrypted.i = Buffer.alloc(16).toString("base64");
  encrypted.enpruebas = encrypt(isEpaycoTestMode(), privateKey);
  encrypted.lenguaje = "javascript";
  encrypted.p = Buffer.from(privateKey, "hex").toString("base64");

  return encrypted;
}

async function getBearerToken(): Promise<string> {
  const publicKey = getPublicKey();
  const privateKey = getPrivateKey();
  const credentials = Buffer.from(`${publicKey}:${privateKey}`).toString("base64");

  const response = await fetch(`${API_BASE_URL}/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${credentials}`,
    },
    body: JSON.stringify({
      public_key: publicKey,
      private_key: privateKey,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || `Error autenticando con ePayco (${response.status})`);
  }

  const token = payload?.bearer_token || payload?.token || payload?.data?.token;
  if (!token) throw new Error("ePayco no devolvió un token de autenticación");
  return token;
}

function authHeaders(token: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    type: "sdk-jwt",
    lang: "NODE",
    Authorization: `Bearer ${token}`,
  };
}

function unwrapPayload(payload: any): any {
  return payload?.data ?? payload;
}

export async function getEpaycoPseBanks(): Promise<EpaycoBank[]> {
  const token = await getBearerToken();
  const query = new URLSearchParams({
    public_key: getPublicKey(),
    lenguaje: "javascript",
    enpruebas: isEpaycoTestMode() ? "TRUE" : "FALSE",
  });
  const response = await fetch(
    `${SECURE_BASE_URL}/restpagos/pse/bancos.json?${query.toString()}`,
    { headers: authHeaders(token) }
  );
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload?.error) {
    throw new Error(payload?.message || payload?.error || "No se pudo obtener la lista de bancos PSE");
  }

  const rows = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.banks)
    ? payload.banks
    : [];

  return rows.map((bank: any) => ({
    code: String(
      bank.bankCode ??
      bank.bank_code ??
      bank.codigo ??
      bank.code ??
      bank.financial_institution_code ??
      ""
    ),
    name: String(
      bank.bankName ??
      bank.bank_name ??
      bank.nombre ??
      bank.name ??
      bank.financial_institution_name ??
      ""
    ),
  })).filter((bank: EpaycoBank) => bank.code && bank.code !== "0" && bank.name);
}

export async function createEpaycoPseTransaction(
  params: CreateEpaycoPseParams
): Promise<EpaycoPseResult> {
  const token = await getBearerToken();
  const body = buildEncryptedPayload({
    bank: params.bankCode,
    invoice: params.invoice,
    description: params.description,
    value: params.amount,
    tax: "0",
    tax_base: "0",
    currency: "COP",
    type_person: params.personType,
    doc_type: params.documentType,
    doc_number: params.documentNumber,
    name: params.firstName,
    last_name: params.lastName,
    email: params.email,
    country: "CO",
    cell_phone: params.cellPhone,
    ip: getEpaycoClientIp(undefined, params.ip),
    url_response: params.responseUrl,
    url_confirmation: params.confirmationUrl,
    metodoconfirmacion: "POST",
    extra1: params.invoice,
    extra2: "SST_COLOMBIA",
    extra3: "PSE",
    extra4: "",
    extra5: "P44",
    extra6: "",
    extra7: "",
  });

  const response = await fetch(`${SECURE_BASE_URL}/restpagos/pagos/debitos.json`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));

  const providerErrors = Array.isArray(payload?.data?.errores) ? payload.data.errores : [];
  if (!response.ok || payload?.success === false || payload?.error || providerErrors.length > 0) {
    const detail = providerErrors
      .map((entry: any) => [entry?.codError, entry?.errorMessage].filter(Boolean).join(": "))
      .filter(Boolean)
      .join("; ");
    const message = detail ||
      (typeof payload?.text_response === "string" ? payload.text_response : "") ||
      (typeof payload?.message === "string" ? payload.message : "") ||
      (typeof payload?.error === "string" ? payload.error : "") ||
      "ePayco no pudo iniciar el pago PSE";
    logger.error({
      status: response.status,
      providerCodes: providerErrors.map((entry: any) => entry?.codError).filter(Boolean),
      providerMessage: message,
    }, "[ePayco] Error creando pago PSE");
    throw new Error(`ePayco: ${message}`);
  }

  const data = unwrapPayload(payload);
  const bankRedirectUrl =
    data?.urlbanco ||
    data?.urlBanco ||
    data?.bankUrl ||
    data?.data?.urlbanco ||
    data?.data?.urlBanco;

  if (!bankRedirectUrl) {
    logger.error({ status: response.status, success: payload?.success }, "[ePayco] Pago PSE sin URL del banco");
    throw new Error("ePayco no devolvió la URL del banco");
  }

  return {
    bankRedirectUrl: String(bankRedirectUrl),
    ticketId: data?.ticketId ? String(data.ticketId) : data?.ticket_id ? String(data.ticket_id) : null,
    transactionId: data?.transactionID
      ? String(data.transactionID)
      : data?.transactionId
      ? String(data.transactionId)
      : null,
    refPayco: data?.ref_payco ? String(data.ref_payco) : data?.refPayco ? String(data.refPayco) : null,
    raw: payload,
  };
}

export interface EpaycoPseLookup {
  invoice: string;
  refPayco: string;
  transactionId: string;
  amount: number;
  currency: string;
  test: boolean;
  status: "APPROVED" | "DECLINED" | "PENDING" | "ERROR";
  reason: string | null;
}

export async function getEpaycoPseTransaction(ticketId: string): Promise<EpaycoPseLookup> {
  const token = await getBearerToken();
  const query = new URLSearchParams({
    transactionID: ticketId,
    public_key: getPublicKey(),
  });
  // ePayco's PSE SDK uses the ticket ID with this endpoint, not the
  // checkout validation endpoint (which does not resolve these PSE references).
  const response = await fetch(
    `${SECURE_BASE_URL}/restpagos/pse/transactioninfomation.json?${query.toString()}`,
    { headers: authHeaders(token), signal: AbortSignal.timeout(10_000) }
  );
  const payload = await response.json().catch(() => ({}));
  const data = payload?.data;
  if (!response.ok || payload?.success !== true || !data || typeof data !== "object") {
    throw new Error("ePayco no devolvió el estado de la transacción PSE");
  }

  return {
    invoice: String(data.factura ?? ""),
    refPayco: String(data.ref_payco ?? ""),
    transactionId: String(data.transactionID ?? ""),
    amount: Number(data.valor),
    currency: String(data.moneda ?? ""),
    test: data.enpruebas === true || data.enpruebas === 1 || data.enpruebas === "1",
    status: normalizeEpaycoStatus(String(data.estado ?? "")),
    reason: typeof data.respuesta === "string" ? data.respuesta : null,
  };
}

export function validateEpaycoConfirmationSignature(data: {
  refPayco: string;
  transactionId: string;
  amount: string;
  currency: string;
  signature: string;
}): boolean {
  const customerId = process.env.EPAYCO_CUSTOMER_ID;
  const pKey = process.env.EPAYCO_P_KEY;
  if (!customerId || !pKey || !data.signature) return false;

  const expected = crypto
    .createHash("sha256")
    .update(`${customerId}^${pKey}^${data.refPayco}^${data.transactionId}^${data.amount}^${data.currency}`)
    .digest("hex");

  const received = Buffer.from(data.signature, "utf8");
  return received.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(expected, "utf8"), received);
}

export function normalizeEpaycoStatus(response: string): "APPROVED" | "DECLINED" | "PENDING" | "ERROR" {
  const normalized = response.trim().toLowerCase();
  if (normalized === "aceptada" || normalized === "aprobada" || normalized === "approved") return "APPROVED";
  if (normalized === "pendiente" || normalized === "pending") return "PENDING";
  if (normalized === "rechazada" || normalized === "rejected" || normalized === "declined") return "DECLINED";
  return "ERROR";
}