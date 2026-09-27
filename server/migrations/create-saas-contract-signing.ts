import { db } from "../db";
import { sql } from "drizzle-orm";

export async function createSaasContractSigningTables(): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS saas_contract_signing_requests (
      id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id VARCHAR NOT NULL REFERENCES companies(id),
      company_name TEXT NOT NULL,
      company_nit TEXT NOT NULL,
      requested_by_user_id VARCHAR NOT NULL REFERENCES users(id),
      signer_name TEXT NOT NULL,
      signer_email TEXT NOT NULL,
      signer_id TEXT NOT NULL,
      capacity TEXT NOT NULL CHECK (capacity IN ('legal_representative', 'attorney')),
      contract_version TEXT NOT NULL,
      proof_object_path TEXT NOT NULL,
      proof_mime_type TEXT NOT NULL CHECK (proof_mime_type IN ('application/pdf', 'image/png', 'image/jpeg', 'image/webp')),
      proof_sha256 TEXT NOT NULL,
      source_object_path TEXT NOT NULL,
      source_sha256 TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending_review'
        CHECK (status IN ('pending_review', 'approved', 'rejected', 'signed', 'test_signed')),
      reviewed_by_user_id VARCHAR REFERENCES users(id),
      reviewed_at TIMESTAMP,
      rejection_reason TEXT,
      invitation_sent_at TIMESTAMP,
      test_only BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP NOT NULL DEFAULT now(),
      updated_at TIMESTAMP NOT NULL DEFAULT now()
    );

    ALTER TABLE saas_contract_signing_requests
      ADD COLUMN IF NOT EXISTS company_name TEXT;
    ALTER TABLE saas_contract_signing_requests
      ADD COLUMN IF NOT EXISTS company_nit TEXT;
    UPDATE saas_contract_signing_requests r
    SET company_name = COALESCE(c.name, ''),
        company_nit = COALESCE(c.nit, '')
    FROM companies c
    WHERE c.id = r.company_id
      AND (r.company_name IS NULL OR r.company_nit IS NULL);
    ALTER TABLE saas_contract_signing_requests
      ALTER COLUMN company_name SET NOT NULL;
    ALTER TABLE saas_contract_signing_requests
      ALTER COLUMN company_nit SET NOT NULL;

    CREATE INDEX IF NOT EXISTS saas_signing_requests_company_created_idx
      ON saas_contract_signing_requests(company_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS saas_signing_requests_review_idx
      ON saas_contract_signing_requests(status, created_at);
    DROP INDEX IF EXISTS saas_signing_one_active_request_per_company_idx;
    CREATE UNIQUE INDEX IF NOT EXISTS saas_signing_one_active_production_request_per_company_idx
      ON saas_contract_signing_requests(company_id)
      WHERE status IN ('pending_review', 'approved') AND test_only = false;
    CREATE UNIQUE INDEX IF NOT EXISTS saas_signing_one_active_test_request_per_company_idx
      ON saas_contract_signing_requests(company_id)
      WHERE status IN ('pending_review', 'approved') AND test_only = true;

    CREATE TABLE IF NOT EXISTS saas_contract_signing_challenges (
      id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
      request_id VARCHAR NOT NULL REFERENCES saas_contract_signing_requests(id) ON DELETE CASCADE,
      code_hash TEXT NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      request_ip_hash TEXT NOT NULL,
      attempt_ip_hash TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT now(),
      used_at TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS saas_signing_challenges_request_created_idx
      ON saas_contract_signing_challenges(request_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS saas_signing_challenges_request_ip_idx
      ON saas_contract_signing_challenges(request_ip_hash, created_at DESC);
    CREATE INDEX IF NOT EXISTS saas_signing_challenges_attempt_ip_idx
      ON saas_contract_signing_challenges(attempt_ip_hash, created_at DESC);

    CREATE TABLE IF NOT EXISTS saas_contract_signing_ip_events (
      id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
      ip_hash TEXT NOT NULL,
      event_type TEXT NOT NULL CHECK (event_type IN ('send_code', 'sign_attempt')),
      created_at TIMESTAMP NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS saas_signing_ip_events_lookup_idx
      ON saas_contract_signing_ip_events(ip_hash, event_type, created_at DESC);

    CREATE TABLE IF NOT EXISTS saas_contract_signatures (
      id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
      request_id VARCHAR NOT NULL UNIQUE REFERENCES saas_contract_signing_requests(id),
      challenge_id VARCHAR NOT NULL UNIQUE REFERENCES saas_contract_signing_challenges(id),
      company_id VARCHAR NOT NULL REFERENCES companies(id),
      signer_name TEXT NOT NULL,
      signer_id TEXT NOT NULL,
      capacity TEXT NOT NULL CHECK (capacity IN ('legal_representative', 'attorney')),
      contract_version TEXT NOT NULL,
      source_sha256 TEXT NOT NULL,
      signed_html_object_path TEXT NOT NULL,
      signed_html_sha256 TEXT NOT NULL,
      signed_pdf_object_path TEXT NOT NULL,
      signed_pdf_sha256 TEXT NOT NULL,
      signed_at TIMESTAMP NOT NULL DEFAULT now(),
      signer_ip TEXT NOT NULL,
      signer_user_agent TEXT NOT NULL,
      test_only BOOLEAN NOT NULL DEFAULT false
    );
    CREATE INDEX IF NOT EXISTS saas_signatures_company_signed_idx
      ON saas_contract_signatures(company_id, signed_at DESC);
  `);
}