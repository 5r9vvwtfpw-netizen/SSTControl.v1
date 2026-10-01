import { sql } from "drizzle-orm";
import { SAAS_CONTRACT_VERSION } from "@shared/saas-contract";
import type { Subscription } from "@shared/schema";
import { db } from "../db";

// La aceptación de checkout y la firma SaaS son evidencias distintas.
// Una firma real vigente debe habilitar el pago incluso para suscripciones
// históricas cuya marca contractAcceptedAt todavía esté vacía.
export function currentSignedPaymentContractQuery(companyId: string) {
  return sql`
    SELECT EXISTS (
      SELECT 1
      FROM saas_contract_signing_requests r
      JOIN saas_contract_signatures s ON s.request_id = r.id
      WHERE r.company_id = ${companyId}
        AND s.company_id = r.company_id
        AND r.contract_version = ${SAAS_CONTRACT_VERSION}
        AND s.contract_version = r.contract_version
        AND s.source_sha256 = r.source_sha256
        AND r.status = 'signed'
        AND r.test_only = false
        AND s.test_only = false
        AND r.capacity = 'legal_representative'
        AND s.capacity = r.capacity
        AND r.signature_required = true
    ) AS accepted
  `;
}

export async function hasCurrentSignedPaymentContract(companyId: string): Promise<boolean> {
  const result = await db.execute(currentSignedPaymentContractQuery(companyId));
  return result.rows[0]?.accepted === true;
}

export async function hasAcceptedPaymentContract(
  subscription: Pick<Subscription, "companyId" | "contractAcceptedAt">,
  signedContractLookup: (companyId: string) => Promise<boolean> = hasCurrentSignedPaymentContract,
): Promise<boolean> {
  if (subscription.contractAcceptedAt) return true;
  return signedContractLookup(subscription.companyId);
}