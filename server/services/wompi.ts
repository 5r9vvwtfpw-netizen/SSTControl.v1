/**
 * Wompi API Client — Pasarela de Pagos Colombia
 *
 * Soporta PSE (Pago Seguro en Línea) para transferencias bancarias.
 * Documentación: https://docs.wompi.co/en/docs/colombia
 *
 * Variables de entorno requeridas:
 *   WOMPI_PRIVATE_KEY       — Llave privada (prv_test_... o prv_prod_...)
 *   WOMPI_PUBLIC_KEY        — Llave pública  (pub_test_... o pub_prod_...)
 *   WOMPI_EVENTS_SECRET     — Secreto para verificar webhooks
 *   WOMPI_INTEGRITY_SECRET  — Secreto para firma de integridad en transacciones
 *   WOMPI_SANDBOX           — "false" para producción (default: sandbox)
 */

import crypto from "crypto";
import logger from "../lib/logger";

function getBaseUrl(): string {
  return process.env.WOMPI_SANDBOX === "false"
    ? "https://production.wompi.co/v1"
    : "https://sandbox.wompi.co/v1";
}

function getPrivateKey(): string {
  const key = process.env.WOMPI_PRIVATE_KEY;
  if (!key) throw new Error("WOMPI_PRIVATE_KEY no está configurado");
  return key;
}

function getPublicKey(): string {
  const key = process.env.WOMPI_PUBLIC_KEY;
  if (!key) throw new Error("WOMPI_PUBLIC_KEY no está configurado");
  return key;
}

function getEventsSecret(): string {
  const key = process.env.WOMPI_EVENTS_SECRET;
  if (!key) throw new Error("WOMPI_EVENTS_SECRET no está configurado");
  return key;
}

function getIntegritySecret(): string {
  const key = process.env.WOMPI_INTEGRITY_SECRET;
  if (!key) throw new Error("WOMPI_INTEGRITY_SECRET no está configurado");
  return key;
}

export function isWompiConfigured(): boolean {
  return !!(
    process.env.WOMPI_PRIVATE_KEY &&
    process.env.WOMPI_PUBLIC_KEY &&
    process.env.WOMPI_EVENTS_SECRET &&
    process.env.WOMPI_INTEGRITY_SECRET
  );
}

export function getWompiPublicKey(): string | null {
  return process.env.WOMPI_PUBLIC_KEY || null;
}

export function isWompiSandbox(): boolean {
  return process.env.WOMPI_SANDBOX !== "false";
}

// ============================================================================
// INSTITUCIONES FINANCIERAS (Bancos PSE)
// ============================================================================

export interface FinancialInstitution {
  financial_institution_code: string;
  financial_institution_name: string;
}

export async function getFinancialInstitutions(): Promise<FinancialInstitution[]> {
  const publicKey = getPublicKey();
  const url = `${getBaseUrl()}/pse/financial_institutions?country=CO`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${publicKey}` },
  });

  if (!response.ok) {
    const err = await response.text();
    logger.error({ status: response.status, err }, "[Wompi] Error obteniendo bancos PSE");
    throw new Error("No se pudo obtener la lista de bancos PSE");
  }

  const data = await response.json();
  return (data.data || []) as FinancialInstitution[];
}

// ============================================================================
// TRANSACCIONES PSE
// ============================================================================

export interface CreatePseTransactionParams {
  amountInCents: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  customerIdType: string;   // CC, CE, NIT, PP, TI
  customerIdNumber: string;
  userType: number;         // 0 = natural, 1 = jurídica
  financialInstitutionCode: string;
  redirectUrl: string;
  reference: string;
  description: string;
}

export interface WompiTransaction {
  id: string;
  status: "PENDING" | "APPROVED" | "DECLINED" | "VOIDED" | "ERROR";
  reference: string;
  amount_in_cents: number;
  currency: string;
  payment_method_type: string;
  payment_method?: {
    type: string;
    extra?: {
      async_payment_url?: string;
      ticket_id?: string;
    };
  };
  redirect_url?: string;
  created_at: string;
  finalized_at?: string | null;
}

export async function createPseTransaction(params: CreatePseTransactionParams): Promise<WompiTransaction> {
  const privateKey = getPrivateKey();
  const integritySecret = getIntegritySecret();

  // Firma de integridad: sha256(reference + amount_in_cents + currency + integrity_secret)
  const sigString = `${params.reference}${params.amountInCents}${params.currency}${integritySecret}`;
  const integritySignature = crypto.createHash("sha256").update(sigString).digest("hex");

  const body = {
    amount_in_cents: params.amountInCents,
    currency: params.currency,
    customer_email: params.customerEmail,
    payment_method: {
      type: "PSE",
      user_type: params.userType,
      user_legal_id_type: params.customerIdType,
      user_legal_id: params.customerIdNumber,
      financial_institution_code: params.financialInstitutionCode,
      payment_description: params.description,
    },
    redirect_url: params.redirectUrl,
    reference: params.reference,
    signature: {
      integrity: integritySignature,
    },
    customer_data: {
      full_name: params.customerName,
    },
  };

  logger.info(
    { reference: params.reference, amount: params.amountInCents, bank: params.financialInstitutionCode },
    "[Wompi] Creando transacción PSE"
  );

  const response = await fetch(`${getBaseUrl()}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${privateKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    logger.error(
      { status: response.status, error: errBody, reference: params.reference },
      "[Wompi] Error creando transacción PSE"
    );
    const reason = errBody?.error?.messages
      ? Object.values(errBody.error.messages).flat().join(". ")
      : errBody?.error?.reason || "Error iniciando transacción PSE";
    throw new Error(reason);
  }

  const data = await response.json();
  logger.info(
    { transactionId: data.data?.id, status: data.data?.status, reference: params.reference },
    "[Wompi] Transacción PSE creada"
  );
  return data.data as WompiTransaction;
}

export async function getTransaction(transactionId: string): Promise<WompiTransaction> {
  const publicKey = getPublicKey();

  const response = await fetch(`${getBaseUrl()}/transactions/${transactionId}`, {
    headers: { Authorization: `Bearer ${publicKey}` },
  });

  if (!response.ok) {
    throw new Error(`Error consultando transacción ${transactionId}: HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.data as WompiTransaction;
}

// ============================================================================
// VERIFICACIÓN DE WEBHOOK
// ============================================================================

export interface WompiWebhookEvent {
  event: string;
  data: {
    transaction: WompiTransaction;
  };
  sent_at: string;
  timestamp: number;
  signature: {
    checksum: string;
    properties: string[];
  };
}

export function verifyWebhookSignature(event: WompiWebhookEvent): boolean {
  try {
    const eventsSecret = getEventsSecret();
    const { signature, data } = event;

    if (!signature?.checksum || !Array.isArray(signature?.properties)) {
      logger.warn("[Wompi] Webhook recibido sin firma válida");
      return false;
    }

    // Construir el string a hashear desde las propiedades indicadas por Wompi
    const values = signature.properties.map((prop: string) => {
      // Las propiedades vienen como "transaction.id", "transaction.status", etc.
      const parts = prop.split(".");
      let value: any = data;
      for (const part of parts) {
        value = value?.[part];
      }
      return value ?? "";
    });

    const toHash = values.join("") + eventsSecret;
    const computed = crypto.createHash("sha256").update(toHash).digest("hex");
    const valid = computed === signature.checksum;

    if (!valid) {
      logger.warn(
        { computed: computed.slice(0, 8) + "...", received: signature.checksum.slice(0, 8) + "..." },
        "[Wompi] Firma de webhook no válida"
      );
    }

    return valid;
  } catch (error: any) {
    logger.error({ error: error.message }, "[Wompi] Error verificando firma de webhook");
    return false;
  }
}
