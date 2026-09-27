import type { Express, NextFunction, Request, RequestHandler, Response } from "express";
import { randomUUID } from "crypto";
import multer from "multer";
import { eq, sql } from "drizzle-orm";
import { SAAS_CONTRACT_VERSION } from "@shared/saas-contract";
import { companies } from "@shared/schema";
import { requireAuth, requireSuperadmin } from "../auth";
import { db } from "../db";
import {
  sendSaasContractSigningCodeEmail,
  sendSaasContractSigningInvitationEmail,
} from "../email";
import { objectStorageService } from "../objectStorage";
import {
  generateSignedSaasContractPdf,
  renderCanonicalSaasContractHtml,
  renderSignedSaasContractHtml,
  sha256,
  type ContractSignerSnapshot,
} from "../services/saas-contract-artifacts";
import {
  createSaasSigningCode,
  hashSaasSigningIp,
  hashSaasSigningOtp,
  getTrustedSaasSigningIp,
  normalizePersonName,
  normalizeSignerId,
  safeHashEqual,
  SAAS_SIGNING_CODE_TTL_MS,
  SAAS_SIGNING_IP_WINDOW_MS,
  SAAS_SIGNING_MAX_CODE_ATTEMPTS,
  SAAS_SIGNING_MAX_CODE_SENDS_PER_HOUR,
  SAAS_SIGNING_MAX_IP_SENDS_PER_WINDOW,
  SAAS_SIGNING_MAX_IP_SIGN_ATTEMPTS_PER_WINDOW,
  SAAS_SIGNING_RESEND_COOLDOWN_MS,
  verifyUploadedProofMime,
} from "../services/saas-signing-security";

type SigningMailResult = { success: boolean; error?: string };
export interface SaasSigningMailer {
  sendCode(params: { to: string; code: string; companyName: string }): Promise<SigningMailResult>;
  sendInvitation(params: {
    to: string;
    signerName: string;
    companyName: string;
    invitationUrl: string;
    contractVersion: string;
  }): Promise<SigningMailResult>;
}

export interface SaasSigningRouteOptions {
  /**
   * Dependency injection is for isolated test apps only. The running app
   * registers this module without options, so no test-code endpoint exists.
   */
  mailer?: SaasSigningMailer;
  testMiddlewares?: {
    requireAuth: RequestHandler;
    requireSuperadmin: RequestHandler;
  };
}

const defaultMailer: SaasSigningMailer = {
  sendCode: sendSaasContractSigningCodeEmail,
  sendInvitation: sendSaasContractSigningInvitationEmail,
};

const proofUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 5 },
  fileFilter: (_req, file, callback) => {
    const supported = new Set(["application/pdf", "image/png", "image/jpeg", "image/webp"]);
    if (!supported.has(file.mimetype)) {
      callback(new Error("Adjunta el poder o soporte en PDF, PNG, JPEG o WEBP."));
      return;
    }
    callback(null, true);
  },
});

function safeProofUpload(req: Request, res: Response, next: NextFunction): void {
  proofUpload.single("proof")(req, res, (error: any) => {
    if (!error) return next();
    if (error.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({ error: "El soporte de representación no puede superar 5 MB." });
      return;
    }
    res.status(400).json({ error: error.message || "No se pudo recibir el soporte de representación." });
  });
}

function sessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("La firma electrónica requiere SESSION_SECRET de al menos 32 caracteres.");
  }
  return secret;
}

function getClientIp(req: Request): string {
  return getTrustedSaasSigningIp(req);
}

function getSignerCapacity(value: unknown): "legal_representative" | "attorney" | null {
  return value === "legal_representative" || value === "attorney" ? value : null;
}

function getSelectedCompanyId(req: Request): string | null {
  const headerValue = req.get("X-Company-Id")?.trim() || null;
  const queryValue = typeof req.query.companyId === "string" ? req.query.companyId.trim() : null;
  if (headerValue && queryValue && headerValue !== queryValue) return null;
  return headerValue || queryValue || null;
}

function hasConflictingCompanySelectors(req: Request): boolean {
  const headerValue = req.get("X-Company-Id")?.trim() || null;
  const queryValue = typeof req.query.companyId === "string" ? req.query.companyId.trim() : null;
  return !!(headerValue && queryValue && headerValue !== queryValue);
}

async function resolveCompany(
  req: Request,
  explicitRouteCompanyId?: string,
): Promise<{ companyId: string; company: any } | { status: number; error: string }> {
  const user = req.user as any;
  if (!user) return { status: 401, error: "No autenticado." };

  let companyId: string | null = null;
  if (user.role === "superadmin") {
    if (hasConflictingCompanySelectors(req)) {
      return { status: 400, error: "Los selectores de empresa no coinciden." };
    }
    const selectedId = explicitRouteCompanyId || getSelectedCompanyId(req);
    const conflictingSelector = getSelectedCompanyId(req);
    if (explicitRouteCompanyId && conflictingSelector && explicitRouteCompanyId !== conflictingSelector) {
      return { status: 400, error: "El selector de empresa no coincide con la empresa solicitada." };
    }
    if (!selectedId) {
      return { status: 400, error: "Selecciona una empresa explícitamente para gestionar su contrato." };
    }
    companyId = selectedId;
  } else if (user.role === "admin" || user.role === "superusuario") {
    if (!user.companyId) return { status: 403, error: "La cuenta no está asociada a una empresa." };
    companyId = user.companyId;
    if (explicitRouteCompanyId && explicitRouteCompanyId !== companyId) {
      return { status: 403, error: "No tienes acceso al contrato de esa empresa." };
    }
  } else {
    return { status: 403, error: "La firma SaaS solo está disponible para administradores de empresa y superadministradores." };
  }

  if (!companyId) return { status: 400, error: "Selecciona una empresa para continuar." };
  const selectedCompanyId = companyId;
  const result = await db.select().from(companies).where(eq(companies.id, selectedCompanyId)).limit(1);
  const company = result[0];
  if (!company) return { status: 404, error: "Empresa no encontrada." };
  return { companyId: selectedCompanyId, company };
}

function getRequestId(value: unknown): string | null {
  return typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    ? value
    : null;
}

function getField(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

async function getSaasSigningSource(row: any): Promise<string> {
  const sourceBuffer = await objectStorageService.getObjectBuffer(row.source_object_path);
  if (!sourceBuffer) throw new Error("No se pudo recuperar la copia del contrato para firmar.");
  if (sha256(sourceBuffer) !== row.source_sha256) {
    throw new Error("La copia del contrato no supera la verificación de integridad.");
  }
  return sourceBuffer.toString("utf8");
}

function createInviteUrl(requestId: string): string {
  const appUrl = process.env.APP_URL || process.env.VITE_APP_URL;
  if (!appUrl) throw new Error("Configura APP_URL o VITE_APP_URL para enviar invitaciones de firma.");
  const base = new URL(appUrl);
  if (process.env.NODE_ENV === "production" && base.protocol !== "https:") {
    throw new Error("La URL pública de firma debe usar HTTPS en producción.");
  }
  const invite = new URL("/firma-contrato-saas", base);
  invite.searchParams.set("id", requestId);
  return invite.toString();
}

function requestPublicShape(row: any) {
  return {
    id: row.id,
    status: row.status,
    signerName: row.signer_name,
    signerEmail: row.signer_email,
    capacity: row.capacity,
    contractVersion: row.contract_version,
    signedAt: row.signed_at || null,
    createdAt: row.created_at,
    ...(row.test_only === true ? { testOnly: true } : {}),
  };
}

export function registerSaasSigningRoutes(
  app: Express,
  options: SaasSigningRouteOptions = {},
): void {
  if (process.env.NODE_ENV === "production" && (options.mailer || options.testMiddlewares)) {
    throw new Error("No se permite inyectar dependencias de prueba en el registro de firma de producción.");
  }
  const mailer = options.mailer || defaultMailer;
  const testOnly = !!options.mailer;
  const auth = options.testMiddlewares?.requireAuth || requireAuth;
  const superadminAuth = options.testMiddlewares?.requireSuperadmin || requireSuperadmin;

  app.get("/api/saas-signing/company", auth, async (req, res) => {
    try {
      const scoped = await resolveCompany(req);
      if ("status" in scoped) return res.status(scoped.status).json({ error: scoped.error });
      const rows = await db.execute(sql`
        SELECT r.id, r.status, r.signer_name, r.signer_email, r.capacity, r.contract_version,
               s.signed_at, r.created_at, r.test_only
        FROM saas_contract_signing_requests r
        LEFT JOIN saas_contract_signatures s ON s.request_id = r.id
        WHERE r.company_id = ${scoped.companyId}
          AND (r.test_only = false OR (${process.env.NODE_ENV !== "production"} AND r.test_only = true))
        ORDER BY r.test_only ASC, r.created_at DESC
      `);
      return res.json({
        requests: (rows as any).rows.map(requestPublicShape),
        currentVersion: SAAS_CONTRACT_VERSION,
      });
    } catch {
      return res.status(500).json({ error: "No se pudo consultar el estado de firma del contrato." });
    }
  });

  app.post("/api/saas-signing/company", auth, safeProofUpload, async (req, res) => {
    let uploadedProofPath: string | null = null;
    let uploadedSourcePath: string | null = null;
    try {
      const scoped = await resolveCompany(req);
      if ("status" in scoped) return res.status(scoped.status).json({ error: scoped.error });

      const signerName = getField(req.body.signerName).replace(/\s+/g, " ");
      const signerEmail = getField(req.body.signerEmail).toLowerCase();
      const signerId = getField(req.body.signerId).replace(/\s+/g, " ");
      const capacity = getSignerCapacity(req.body.capacity);
      if (signerName.length < 3 || signerName.length > 150) {
        return res.status(400).json({ error: "Ingresa el nombre completo del firmante." });
      }
      if (signerEmail.length > 254 ||
        !/^[A-Z0-9.!#$%&'*+/=?^_~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$/i.test(signerEmail)) {
        return res.status(400).json({ error: "Ingresa un correo válido del representante o apoderado." });
      }
      if (signerId.length < 4 || signerId.length > 60 || !/^[\p{L}\p{N} .-]+$/u.test(signerId)) {
        return res.status(400).json({ error: "Ingresa el número de identificación del firmante." });
      }
      if (!capacity) {
        return res.status(400).json({ error: "La calidad debe ser representante legal o apoderado autorizado." });
      }
      if (!req.file) return res.status(400).json({ error: "Adjunta el soporte de representación requerido." });
      const verifiedMime = verifyUploadedProofMime(req.file.mimetype, req.file.buffer);
      if (!verifiedMime) {
        return res.status(400).json({ error: "El archivo no coincide con un PDF o una imagen PNG, JPEG o WEBP válida." });
      }

      const pending = await db.execute(sql`
        SELECT id FROM saas_contract_signing_requests
        WHERE company_id = ${scoped.companyId} AND status IN ('pending_review', 'approved')
          AND test_only = ${testOnly}
        LIMIT 1
      `);
      if ((pending as any).rows.length > 0) {
        return res.status(409).json({ error: "Esta empresa ya tiene una solicitud de firma en revisión o aprobada." });
      }

      const requestId = randomUUID();
      const proofExtension = verifiedMime === "application/pdf"
        ? "pdf"
        : verifiedMime === "image/png" ? "png" : verifiedMime === "image/jpeg" ? "jpg" : "webp";
      const proofSha256 = sha256(req.file.buffer);
      const sourceHtml = renderCanonicalSaasContractHtml();
      const sourceBuffer = Buffer.from(sourceHtml, "utf8");
      const sourceSha256 = sha256(sourceBuffer);
      const proofPath = `saas-signing/${scoped.companyId}/${requestId}/authority-${randomUUID()}.${proofExtension}`;
      const sourcePath = `saas-signing/${scoped.companyId}/${requestId}/contract-v${SAAS_CONTRACT_VERSION}-${sourceSha256}.html`;

      uploadedProofPath = await objectStorageService.uploadObject(proofPath, req.file.buffer, verifiedMime)
        .then(() => `/objects/${proofPath}`);
      uploadedSourcePath = await objectStorageService.uploadObject(sourcePath, sourceBuffer, "text/html; charset=utf-8")
        .then(() => `/objects/${sourcePath}`);

      const insertResult = await db.execute(sql`
        INSERT INTO saas_contract_signing_requests (
          id, company_id, company_name, company_nit, requested_by_user_id, signer_name, signer_email, signer_id,
          capacity, contract_version, proof_object_path, proof_mime_type, proof_sha256,
          source_object_path, source_sha256, status, test_only
        ) VALUES (
          ${requestId}, ${scoped.companyId}, ${scoped.company.name}, ${scoped.company.nit || ""}, ${(req.user as any).id},
          ${signerName}, ${signerEmail}, ${signerId},
          ${capacity}, ${SAAS_CONTRACT_VERSION}, ${uploadedProofPath}, ${verifiedMime}, ${proofSha256},
          ${uploadedSourcePath}, ${sourceSha256}, 'pending_review', ${testOnly}
        )
        RETURNING id, status, signer_name, signer_email, capacity, contract_version, created_at, test_only
      `);
      const created = (insertResult as any).rows[0];
      return res.status(201).json({ request: requestPublicShape(created) });
    } catch (error) {
      if (uploadedProofPath) await objectStorageService.deleteObject(uploadedProofPath).catch(() => undefined);
      if (uploadedSourcePath) await objectStorageService.deleteObject(uploadedSourcePath).catch(() => undefined);
      if ((error as any)?.code === "23505") {
        return res.status(409).json({ error: "Esta empresa ya tiene una solicitud de firma en revisión o aprobada." });
      }
      return res.status(500).json({ error: getErrorMessage(error, "No se pudo crear la solicitud de firma.") });
    }
  });

  app.get("/api/saas-signing/review", auth, superadminAuth, async (req, res) => {
    if ((req.user as any)?.role !== "superadmin") {
      return res.status(403).json({ error: "Acceso exclusivo para superadministradores." });
    }
    try {
      const result = await db.execute(sql`
        SELECT r.id, r.company_id, r.company_name, r.company_nit,
               r.requested_by_user_id, r.signer_name, r.signer_email, r.signer_id,
               r.capacity, r.contract_version, r.proof_mime_type, r.proof_sha256,
               r.status, r.created_at, r.test_only
        FROM saas_contract_signing_requests r
        WHERE r.status = 'pending_review' AND r.test_only = ${testOnly}
        ORDER BY r.created_at ASC
      `);
      return res.json({
        requests: (result as any).rows.map((row: any) => ({
          id: row.id,
          companyId: row.company_id,
          companyName: row.company_name,
          companyNit: row.company_nit,
          requesterUserId: row.requested_by_user_id,
          signerName: row.signer_name,
          signerEmail: row.signer_email,
          signerId: row.signer_id,
          capacity: row.capacity,
          contractVersion: row.contract_version,
          proofMimeType: row.proof_mime_type,
          proofSha256: row.proof_sha256,
          proofUrl: `/api/saas-signing/review/${row.id}/proof`,
          status: row.status,
          ...(row.test_only === true ? { testOnly: true } : {}),
          createdAt: row.created_at,
        })),
      });
    } catch {
      return res.status(500).json({ error: "No se pudo cargar la cola de revisión de firmas." });
    }
  });

  app.get("/api/saas-signing/review/:id/proof", auth, superadminAuth, async (req, res) => {
    if ((req.user as any)?.role !== "superadmin") {
      return res.status(403).json({ error: "Acceso exclusivo para superadministradores." });
    }
    const requestId = getRequestId(req.params.id);
    if (!requestId) return res.status(400).json({ error: "Identificador de solicitud inválido." });
    try {
      const result = await db.execute(sql`
        SELECT proof_object_path, proof_mime_type, proof_sha256
        FROM saas_contract_signing_requests WHERE id = ${requestId} AND test_only = ${testOnly}
      `);
      const row = (result as any).rows[0];
      if (!row) return res.status(404).json({ error: "Solicitud de firma no encontrada." });
      const proof = await objectStorageService.getObjectBuffer(row.proof_object_path);
      if (!proof) return res.status(503).json({ error: "No se pudo recuperar el soporte de representación." });
      if (sha256(proof) !== row.proof_sha256) {
        return res.status(503).json({ error: "El soporte no supera la verificación de integridad." });
      }
      res.set({
        "Content-Type": row.proof_mime_type,
        "Content-Disposition": `inline; filename="soporte-representacion-${requestId}.${row.proof_mime_type === "application/pdf" ? "pdf" : row.proof_mime_type === "image/jpeg" ? "jpg" : row.proof_mime_type.slice(6)}`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      });
      return res.send(proof);
    } catch {
      return res.status(500).json({ error: "No se pudo descargar el soporte de representación." });
    }
  });

  app.post("/api/saas-signing/review/:id/approve", auth, superadminAuth, async (req, res) => {
    if ((req.user as any)?.role !== "superadmin") {
      return res.status(403).json({ error: "Acceso exclusivo para superadministradores." });
    }
    const requestId = getRequestId(req.params.id);
    if (!requestId) return res.status(400).json({ error: "Identificador de solicitud inválido." });
    const reviewerId = (req.user as any).id;
    try {
      const result = await db.execute(sql`
        SELECT r.*, c.legal_rep_name, c.legal_rep_id
        FROM saas_contract_signing_requests r
        JOIN companies c ON c.id = r.company_id
        WHERE r.id = ${requestId} AND r.test_only = ${testOnly}
      `);
      const row = (result as any).rows[0];
      if (!row) return res.status(404).json({ error: "Solicitud de firma no encontrada." });
      if (row.requested_by_user_id === reviewerId) {
        return res.status(403).json({ error: "La aprobación debe realizarla un superadministrador distinto del solicitante." });
      }
      if (row.status === "approved" && row.invitation_sent_at) {
        return res.status(409).json({ error: "La invitación ya fue enviada." });
      }
      if (row.status !== "pending_review" && row.status !== "approved") {
        return res.status(409).json({ error: "La solicitud ya no está pendiente de revisión." });
      }
      if (row.capacity === "legal_representative") {
        if (row.legal_rep_name &&
          normalizePersonName(row.legal_rep_name) !== normalizePersonName(row.signer_name)) {
          return res.status(409).json({ error: "El nombre no coincide con el representante legal registrado en la empresa." });
        }
        if (row.legal_rep_id &&
          normalizeSignerId(row.legal_rep_id) !== normalizeSignerId(row.signer_id)) {
          return res.status(409).json({ error: "La identificación no coincide con el representante legal registrado en la empresa." });
        }
      }
      const invitationUrl = createInviteUrl(requestId);
      if (row.status === "pending_review") {
        const approval = await db.execute(sql`
          UPDATE saas_contract_signing_requests
          SET status = 'approved', reviewed_by_user_id = ${reviewerId},
              reviewed_at = now(), updated_at = now()
          WHERE id = ${requestId} AND status = 'pending_review'
            AND requested_by_user_id <> ${reviewerId} AND test_only = ${testOnly}
          RETURNING id
        `);
        if ((approval as any).rows.length === 0) {
          return res.status(409).json({ error: "La solicitud fue revisada por otra persona. Actualiza la cola." });
        }
      }

      const emailResult = await mailer.sendInvitation({
        to: row.signer_email,
        signerName: row.signer_name,
        companyName: row.company_name,
        invitationUrl,
        contractVersion: row.contract_version,
      });
      if (!emailResult.success) {
        await db.execute(sql`
          UPDATE saas_contract_signing_requests
          SET status = 'pending_review', reviewed_by_user_id = NULL,
              reviewed_at = NULL, updated_at = now()
          WHERE id = ${requestId} AND status = 'approved' AND invitation_sent_at IS NULL
        `);
        return res.status(502).json({ error: emailResult.error || "No se pudo enviar la invitación por correo." });
      }
      await db.execute(sql`
        UPDATE saas_contract_signing_requests
        SET invitation_sent_at = now(), updated_at = now()
        WHERE id = ${requestId} AND status = 'approved'
      `);
      return res.json({ approved: true, invitationSent: true });
    } catch (error) {
      return res.status(500).json({ error: getErrorMessage(error, "No se pudo aprobar la solicitud de firma.") });
    }
  });

  app.post("/api/saas-signing/review/:id/reject", auth, superadminAuth, async (req, res) => {
    if ((req.user as any)?.role !== "superadmin") {
      return res.status(403).json({ error: "Acceso exclusivo para superadministradores." });
    }
    const requestId = getRequestId(req.params.id);
    if (!requestId) return res.status(400).json({ error: "Identificador de solicitud inválido." });
    const reason = getField(req.body?.reason).slice(0, 500);
    if (!reason) return res.status(400).json({ error: "Indica el motivo del rechazo." });
    const reviewerId = (req.user as any).id;
    try {
      const result = await db.execute(sql`
        UPDATE saas_contract_signing_requests
        SET status = 'rejected', reviewed_by_user_id = ${reviewerId},
            reviewed_at = now(), rejection_reason = ${reason}, updated_at = now()
        WHERE id = ${requestId} AND status = 'pending_review'
          AND requested_by_user_id <> ${reviewerId} AND test_only = ${testOnly}
        RETURNING id
      `);
      if ((result as any).rows.length === 0) {
        const existing = await db.execute(sql`
          SELECT requested_by_user_id, status FROM saas_contract_signing_requests WHERE id = ${requestId} AND test_only = ${testOnly}
        `);
        const row = (existing as any).rows[0];
        if (!row) return res.status(404).json({ error: "Solicitud de firma no encontrada." });
        if (row.requested_by_user_id === reviewerId) {
          return res.status(403).json({ error: "El rechazo debe realizarlo un superadministrador distinto del solicitante." });
        }
        return res.status(409).json({ error: "La solicitud ya no está pendiente de revisión." });
      }
      return res.json({ rejected: true });
    } catch {
      return res.status(500).json({ error: "No se pudo rechazar la solicitud de firma." });
    }
  });

  app.get("/api/saas-signing/invite/:id", async (req, res) => {
    const requestId = getRequestId(req.params.id);
    if (!requestId) return res.status(404).json({ error: "Invitación no disponible." });
    try {
      const result = await db.execute(sql`
        SELECT r.id, r.company_id, r.signer_name, r.capacity, r.contract_version,
               r.source_object_path, r.source_sha256, r.company_name
        FROM saas_contract_signing_requests r
        WHERE r.id = ${requestId} AND r.status = 'approved' AND r.test_only = ${testOnly}
          AND r.invitation_sent_at IS NOT NULL
          AND NOT EXISTS (SELECT 1 FROM saas_contract_signatures s WHERE s.request_id = r.id)
      `);
      const row = (result as any).rows[0];
      if (!row) return res.status(404).json({ error: "Invitación no disponible o ya completada." });
      const contractHtml = await getSaasSigningSource(row);
      res.set("Cache-Control", "private, no-store");
      return res.json({
        id: row.id,
        company: { name: row.company_name },
        signerName: row.signer_name,
        capacity: row.capacity,
        contractVersion: row.contract_version,
        sourceSha256: row.source_sha256,
        contractHtml,
      });
    } catch (error) {
      return res.status(503).json({ error: getErrorMessage(error, "No se pudo cargar el contrato de la invitación.") });
    }
  });

  app.post("/api/saas-signing/invite/:id/code", async (req, res) => {
    const requestId = getRequestId(req.params.id);
    if (!requestId) return res.status(404).json({ error: "Invitación no disponible." });
    let secret: string;
    try {
      secret = sessionSecret();
    } catch (error) {
      return res.status(503).json({ error: getErrorMessage(error, "El servicio de firma no está configurado.") });
    }
    const ipHash = hashSaasSigningIp(secret, getClientIp(req));
    try {
      const created = await db.transaction(async (tx) => {
        const requestResult = await tx.execute(sql`
          SELECT r.id, r.signer_email, r.company_name
          FROM saas_contract_signing_requests r
          WHERE r.id = ${requestId} AND r.status = 'approved' AND r.test_only = ${testOnly}
            AND r.invitation_sent_at IS NOT NULL
            AND NOT EXISTS (SELECT 1 FROM saas_contract_signatures s WHERE s.request_id = r.id)
          FOR UPDATE OF r
        `);
        const request = (requestResult as any).rows[0];
        if (!request) return { status: 404 as const, error: "Invitación no disponible o ya completada." };

        const rateResult = await tx.execute(sql`
          SELECT
            (SELECT count(*)::int FROM saas_contract_signing_challenges
             WHERE request_ip_hash = ${ipHash} AND created_at > now() - interval '15 minutes') AS invite_ip_sends,
            (SELECT count(*)::int FROM saas_contract_signing_ip_events
             WHERE ip_hash = ${ipHash} AND event_type = 'send_code'
               AND created_at > now() - interval '15 minutes') AS ip_sends,
            (SELECT count(*)::int FROM saas_contract_signing_challenges
             WHERE request_id = ${requestId} AND created_at > now() - interval '1 hour') AS request_sends,
            (SELECT created_at FROM saas_contract_signing_challenges
             WHERE request_id = ${requestId} ORDER BY created_at DESC LIMIT 1) AS last_sent_at
        `);
        const rate = (rateResult as any).rows[0];
        if (Number(rate.invite_ip_sends) >= SAAS_SIGNING_MAX_IP_SENDS_PER_WINDOW ||
          Number(rate.ip_sends) >= SAAS_SIGNING_MAX_IP_SENDS_PER_WINDOW) {
          return { status: 429 as const, error: "Se alcanzó el límite temporal de solicitudes de código." };
        }
        if (Number(rate.request_sends) >= SAAS_SIGNING_MAX_CODE_SENDS_PER_HOUR) {
          return { status: 429 as const, error: "Se alcanzó el límite de códigos para esta invitación. Intenta más tarde." };
        }
        if (rate.last_sent_at &&
          Date.now() - new Date(rate.last_sent_at).getTime() < SAAS_SIGNING_RESEND_COOLDOWN_MS) {
          return { status: 429 as const, error: "Espera un minuto antes de solicitar otro código." };
        }

        const challengeId = randomUUID();
        const code = createSaasSigningCode();
        const expiresAt = new Date(Date.now() + SAAS_SIGNING_CODE_TTL_MS);
        await tx.execute(sql`
          UPDATE saas_contract_signing_challenges SET used_at = now()
          WHERE request_id = ${requestId} AND used_at IS NULL
        `);
        await tx.execute(sql`
          INSERT INTO saas_contract_signing_challenges
            (id, request_id, code_hash, expires_at, request_ip_hash, created_at)
          VALUES (${challengeId}, ${requestId}, ${hashSaasSigningOtp(secret, requestId, challengeId, code)},
                  ${expiresAt}, ${ipHash}, now())
        `);
        await tx.execute(sql`
          INSERT INTO saas_contract_signing_ip_events (ip_hash, event_type)
          VALUES (${ipHash}, 'send_code')
        `);
        return {
          status: 200 as const,
          challengeId,
          code,
          expiresAt,
          email: request.signer_email,
          companyName: request.company_name,
        };
      });
      if (created.status !== 200) return res.status(created.status).json({ error: created.error });

      const emailResult = await mailer.sendCode({
        to: created.email,
        code: created.code,
        companyName: created.companyName,
      });
      if (!emailResult.success) {
        await db.execute(sql`
          UPDATE saas_contract_signing_challenges SET used_at = now()
          WHERE id = ${created.challengeId} AND used_at IS NULL
        `);
        return res.status(502).json({ error: emailResult.error || "No se pudo enviar el código de firma." });
      }
      return res.json({ sent: true, expiresAt: created.expiresAt.toISOString() });
    } catch {
      return res.status(500).json({ error: "No se pudo iniciar la verificación de firma." });
    }
  });

  app.post("/api/saas-signing/invite/:id/sign", async (req, res) => {
    const requestId = getRequestId(req.params.id);
    if (!requestId) return res.status(404).json({ error: "Invitación no disponible." });
    const code = getField(req.body?.code);
    if (!/^\d{6}$/.test(code) || req.body?.accepted !== true) {
      return res.status(400).json({ error: "Ingresa el código de seis dígitos y confirma la aceptación del contrato." });
    }

    let secret: string;
    try {
      secret = sessionSecret();
    } catch (error) {
      return res.status(503).json({ error: getErrorMessage(error, "El servicio de firma no está configurado.") });
    }
    const ip = getClientIp(req);
    const ipHash = hashSaasSigningIp(secret, ip);
    let uploadedHtmlPath: string | null = null;
    let uploadedPdfPath: string | null = null;
    try {
      const result = await db.transaction(async (tx) => {
        const requestResult = await tx.execute(sql`
           SELECT r.*
          FROM saas_contract_signing_requests r
          WHERE r.id = ${requestId} AND r.status = 'approved' AND r.test_only = ${testOnly}
            AND r.invitation_sent_at IS NOT NULL
            AND NOT EXISTS (SELECT 1 FROM saas_contract_signatures s WHERE s.request_id = r.id)
          FOR UPDATE OF r
        `);
        const request = (requestResult as any).rows[0];
        if (!request) return { status: 404 as const, error: "Invitación no disponible o ya completada." };

        const ipRate = await tx.execute(sql`
          SELECT count(*)::int AS attempts
          FROM saas_contract_signing_ip_events
          WHERE ip_hash = ${ipHash} AND event_type = 'sign_attempt'
            AND created_at > now() - interval '15 minutes'
        `);
        if (Number((ipRate as any).rows[0]?.attempts || 0) >= SAAS_SIGNING_MAX_IP_SIGN_ATTEMPTS_PER_WINDOW) {
          return { status: 429 as const, error: "Se alcanzó el límite temporal de intentos de firma." };
        }
        await tx.execute(sql`
          INSERT INTO saas_contract_signing_ip_events (ip_hash, event_type)
          VALUES (${ipHash}, 'sign_attempt')
        `);

        const challengeResult = await tx.execute(sql`
          SELECT id, code_hash, attempts
          FROM saas_contract_signing_challenges
          WHERE request_id = ${requestId} AND used_at IS NULL AND expires_at > now()
          ORDER BY created_at DESC LIMIT 1 FOR UPDATE
        `);
        const challenge = (challengeResult as any).rows[0];
        if (!challenge || challenge.attempts >= SAAS_SIGNING_MAX_CODE_ATTEMPTS) {
          return { status: 400 as const, error: "El código venció o ya no es válido. Solicita uno nuevo." };
        }

        const expectedHash = hashSaasSigningOtp(secret, requestId, challenge.id, code);
        if (!safeHashEqual(challenge.code_hash, expectedHash)) {
          const attempts = Number(challenge.attempts) + 1;
          await tx.execute(sql`
            UPDATE saas_contract_signing_challenges
            SET attempts = ${attempts},
                attempt_ip_hash = ${ipHash},
                used_at = CASE WHEN ${attempts} >= ${SAAS_SIGNING_MAX_CODE_ATTEMPTS} THEN now() ELSE used_at END
            WHERE id = ${challenge.id}
          `);
          return {
            status: 400 as const,
            error: attempts >= SAAS_SIGNING_MAX_CODE_ATTEMPTS
              ? "Código incorrecto. Se agotaron los intentos; solicita otro código."
              : "Código incorrecto.",
          };
        }

        const sourceBuffer = await objectStorageService.getObjectBuffer(request.source_object_path);
        if (!sourceBuffer || sha256(sourceBuffer) !== request.source_sha256) {
          return { status: 503 as const, error: "No se pudo verificar la copia inmutable del contrato." };
        }
        const sourceHtml = sourceBuffer.toString("utf8");
        const signedAt = new Date();
        const signerSnapshot: ContractSignerSnapshot = {
          signerName: request.signer_name,
          signerId: request.signer_id,
          capacity: request.capacity,
          companyName: request.company_name,
          companyNit: request.company_nit,
          contractVersion: request.contract_version,
          sourceSha256: request.source_sha256,
          challengeId: challenge.id,
          signedAt,
          ip,
          userAgent: String(req.get("user-agent") || "desconocido").replace(/[\r\n\t]/g, " ").slice(0, 1000),
          testOnly,
        };
        const signedHtml = renderSignedSaasContractHtml(sourceHtml, signerSnapshot);
        const signedHtmlBuffer = Buffer.from(signedHtml, "utf8");
        const signedHtmlHash = sha256(signedHtmlBuffer);
        const signedPdf = await generateSignedSaasContractPdf(sourceHtml, signerSnapshot);
        const signedPdfHash = sha256(signedPdf);
        const signedBasePath = `saas-signing/${request.company_id}/${requestId}/signed-${signedAt.getTime()}`;
        const htmlPath = `${signedBasePath}-${signedHtmlHash}.html`;
        const pdfPath = `${signedBasePath}-${signedPdfHash}.pdf`;

        try {
          await objectStorageService.uploadObject(htmlPath, signedHtmlBuffer, "text/html; charset=utf-8");
          uploadedHtmlPath = `/objects/${htmlPath}`;
          await objectStorageService.uploadObject(pdfPath, signedPdf, "application/pdf");
          uploadedPdfPath = `/objects/${pdfPath}`;
        } catch (error) {
          if (uploadedHtmlPath) await objectStorageService.deleteObject(uploadedHtmlPath).catch(() => undefined);
          uploadedHtmlPath = null;
          throw error;
        }

        const signatureResult = await tx.execute(sql`
          INSERT INTO saas_contract_signatures (
            request_id, challenge_id, company_id, signer_name, signer_id, capacity, contract_version,
            source_sha256, signed_html_object_path, signed_html_sha256,
            signed_pdf_object_path, signed_pdf_sha256, signed_at, signer_ip, signer_user_agent, test_only
          ) VALUES (
            ${requestId}, ${challenge.id}, ${request.company_id}, ${request.signer_name}, ${request.signer_id},
            ${request.capacity}, ${request.contract_version}, ${request.source_sha256},
            ${uploadedHtmlPath}, ${signedHtmlHash}, ${uploadedPdfPath}, ${signedPdfHash},
            ${signedAt}, ${ip.slice(0, 128)}, ${signerSnapshot.userAgent}, ${testOnly}
          )
          ON CONFLICT (request_id) DO NOTHING
          RETURNING id
        `);
        if ((signatureResult as any).rows.length === 0) {
          return { status: 409 as const, error: "Este contrato ya fue firmado." };
        }
        await tx.execute(sql`
          UPDATE saas_contract_signing_challenges SET used_at = now()
          WHERE id = ${challenge.id} AND used_at IS NULL
        `);
        await tx.execute(sql`
          UPDATE saas_contract_signing_requests
          SET status = ${testOnly ? "test_signed" : "signed"}, updated_at = now()
          WHERE id = ${requestId} AND status = 'approved' AND test_only = ${testOnly}
        `);
        return {
          status: 200 as const,
          signedAt: signedAt.toISOString(),
          contractVersion: request.contract_version,
          signedPdfSha256: signedPdfHash,
          sourceSha256: request.source_sha256,
        };
      });

      if (result.status !== 200) {
        if (uploadedHtmlPath) await objectStorageService.deleteObject(uploadedHtmlPath).catch(() => undefined);
        if (uploadedPdfPath) await objectStorageService.deleteObject(uploadedPdfPath).catch(() => undefined);
        return res.status(result.status).json({ error: result.error });
      }
      const { status: _httpStatus, ...signatureResult } = result;
      return res.json({
        signed: true,
        status: testOnly ? "test_signed" : "signed",
        ...signatureResult,
      });
    } catch (error) {
      if (uploadedHtmlPath) await objectStorageService.deleteObject(uploadedHtmlPath).catch(() => undefined);
      if (uploadedPdfPath) await objectStorageService.deleteObject(uploadedPdfPath).catch(() => undefined);
      return res.status(503).json({ error: getErrorMessage(error, "No se pudo completar la firma del contrato.") });
    }
  });

  app.get("/api/saas-signing/company/:id/pdf", auth, async (req, res) => {
    const requestId = getRequestId(req.params.id);
    if (!requestId) return res.status(400).json({ error: "Identificador de solicitud inválido." });
    const scoped = await resolveCompany(req);
    if ("status" in scoped) return res.status(scoped.status).json({ error: scoped.error });
    try {
      const result = await db.execute(sql`
        SELECT c.id AS company_id, r.test_only, r.status,
               s.signed_pdf_object_path, s.signed_pdf_sha256, s.signed_at, s.contract_version
        FROM saas_contract_signing_requests r
        JOIN companies c ON c.id = r.company_id
        JOIN saas_contract_signatures s ON s.request_id = r.id
        WHERE r.id = ${requestId} AND r.company_id = ${scoped.companyId}
          AND (
            (r.status = 'signed' AND r.test_only = false AND s.test_only = false)
            OR (r.status = 'test_signed' AND r.test_only = true AND s.test_only = true
                AND ${process.env.NODE_ENV !== "production"})
          )
      `);
      const signature = (result as any).rows[0];
      if (!signature) return res.status(404).json({ error: "No se encontró un contrato firmado para esta solicitud." });

      const pdf = await objectStorageService.getObjectBuffer(signature.signed_pdf_object_path);
      if (!pdf) return res.status(503).json({ error: "No se pudo recuperar el contrato firmado." });
      if (sha256(pdf) !== signature.signed_pdf_sha256) {
        return res.status(503).json({ error: "El contrato no supera la verificación de integridad." });
      }
      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="contrato-saas-firmado.pdf"',
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      });
      return res.send(pdf);
    } catch {
      return res.status(500).json({ error: "No se pudo descargar el contrato firmado." });
    }
  });
}