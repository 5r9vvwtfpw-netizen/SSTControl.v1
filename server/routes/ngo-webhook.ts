import type { Express } from "express";
import jwt from "jsonwebtoken";
import { storage } from "../storage";

export function registerNgoWebhookRoutes(app: Express) {

  app.post("/api/v1/ngo/company-onboarded", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ ok: false, error: "Missing authorization header" });
      }

      const token = authHeader.substring(7);
      const jwtSecret = process.env.CORE_API_JWT;
      if (!jwtSecret) {
        console.error("[company.onboarded] CORE_API_JWT secret not configured");
        return res.status(500).json({ ok: false, error: "Server misconfigured" });
      }

      let tokenPayload: any;
      try {
        tokenPayload = jwt.verify(token, jwtSecret);
      } catch (err) {
        return res.status(401).json({ ok: false, error: "Invalid or expired token" });
      }

      if (!tokenPayload?.permissions?.includes("write") && !tokenPayload?.permissions?.includes("*")) {
        return res.status(403).json({ ok: false, error: "Insufficient permissions" });
      }

      const { event, data } = req.body;
      if (event !== "company.onboarded" || !data) {
        return res.status(400).json({ ok: false, error: "Invalid payload: expected event=company.onboarded" });
      }

      const {
        ngoId, projectId, projectName,
        companyId, companyName, companyEmail,
        ciio, city, region, employeesCount, riskLevel,
        consultant, lso, couponCode, inviteId,
      } = data;

      if (!companyName || !companyEmail || !projectId || !inviteId || !consultant) {
        return res.status(400).json({ ok: false, error: "Missing required fields: companyName, companyEmail, projectId, inviteId, consultant" });
      }

      const existing = await storage.getNgoOnboardedCompanyByInviteId(inviteId);
      if (existing) {
        console.log(`[company.onboarded] Duplicate event for invite ${inviteId} — returning existing record #${existing.id}`);
        return res.json({
          ok: true,
          message: "Already processed",
          companyId,
          coreCompanyId: existing.id,
        });
      }

      let lsoLocalRecordId: number | null = null;

      const record = await storage.createNgoOnboardedCompany({
        sidecarCompanyId:    companyId,
        sidecarInviteId:     inviteId,
        ngoId:               ngoId,
        projectId:           projectId,
        projectName:         projectName,
        companyName:         companyName,
        companyEmail:        companyEmail.toLowerCase(),
        ciio:                ciio         ?? null,
        city:                city         ?? null,
        region:              region       ?? null,
        employeesCount:      employeesCount ?? null,
        riskLevel:           riskLevel    ?? null,
        consultantName:      consultant.name,
        consultantEmail:     consultant.email,
        consultantSidecarId: consultant.id,
        lsoEmail:            lso?.email   ?? null,
        lsoName:             lso?.name    ?? null,
        lsoMode:             lso?.mode    ?? null,
        lsoSidecarId:        lso?.id      ?? null,
        lsoLocalRecordId:    lsoLocalRecordId,
        couponCode:          couponCode   ?? null,
        onboardedAt:         new Date(data.timestamp ?? Date.now()),
      });

      console.log(
        `[company.onboarded] Persisted record #${record.id}` +
        ` — company "${companyName}" (${companyEmail})` +
        ` in project "${projectName}"` +
        ` by consultant "${consultant.name}"` +
        (lso ? ` — LSO: "${lso.name}" (${lso.email}, ${lso.mode})` : " — no LSO") +
        (couponCode ? ` — coupon: ${couponCode}` : "")
      );

      return res.json({
        ok: true,
        message: "Company onboarded successfully",
        companyId,
        coreCompanyId: record.id,
      });

    } catch (error) {
      console.error("[company.onboarded] Error:", error);
      return res.status(500).json({ ok: false, error: "Internal server error" });
    }
  });

  app.get("/api/v1/ngo/onboarded-companies", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ ok: false, error: "Missing authorization header" });
      }

      const token = authHeader.substring(7);
      const jwtSecret = process.env.CORE_API_JWT;
      if (!jwtSecret) {
        return res.status(500).json({ ok: false, error: "Server misconfigured" });
      }

      try {
        jwt.verify(token, jwtSecret);
      } catch (err) {
        return res.status(401).json({ ok: false, error: "Invalid or expired token" });
      }

      const { projectId, region } = req.query;
      const records = await storage.listNgoOnboardedCompanies({
        projectId: projectId as string | undefined,
        region: region as string | undefined,
      });

      return res.json({ ok: true, data: records, total: records.length });
    } catch (error) {
      console.error("[ngo/onboarded-companies] Error:", error);
      return res.status(500).json({ ok: false, error: "Internal server error" });
    }
  });

  console.log("✅ NGO Webhook routes registered at /api/v1/ngo/*");
}
