// server/routes-lso-directory.ts
// NUEVAS RUTAS - Integración LSO Directory API
// Archivo nuevo - No modifica código existente

import type { Express } from "express";
import jwt from "jsonwebtoken";
import { 
  searchLSOProfessionals, 
  createContact, 
  getCompanyContacts,
  updateContactStatus,
  testConnection
} from "./lso-directory-client";
import { db } from "./db";
import { companies } from "@shared/schema"
import { eq } from "drizzle-orm";

// Identificador único para esta aplicación
const COMPANY_CLIENT_ID = "sst-colombia-landing";

export function registerLsoDirectoryRoutes(app: Express) {
  console.log("🔌 Registering LSO Directory API routes...");

  // Test de conexión con LSO Directory
  app.get("/api/lso/test", async (req, res) => {
    try {
      const success = await testConnection(COMPANY_CLIENT_ID);
      return res.json({ 
        ok: success, 
        message: success ? "Conexión exitosa con LSO Directory" : "Error de conexión"
      });
    } catch (error: any) {
      console.error("[LSO Routes] Test error:", error);
      return res.status(500).json({ ok: false, error: error.message });
    }
  });

  // Buscar profesionales en directorio externo LSO
  app.get("/api/lso/search", async (req, res) => {
    try {
      const { name, department, city, professionType, limit, offset } = req.query;
      
      console.log("[LSO Routes] Search request:", { name, department, city, professionType });

      const result = await searchLSOProfessionals(COMPANY_CLIENT_ID, {
        name: name as string,
        department: department as string,
        city: city as string,
        professionType: professionType as string,
        limit: limit ? parseInt(limit as string) : 10,
        offset: offset ? parseInt(offset as string) : 0
      });

      return res.json(result);
    } catch (error: any) {
      console.error("[LSO Routes] Search error:", error);
      return res.status(500).json({ ok: false, error: error.message });
    }
  });

  // Contactar a un profesional
  app.post("/api/lso/contact", async (req, res) => {
    try {
      const { lsoRegistrationId, notes } = req.body;
      
      if (!lsoRegistrationId) {
        return res.status(400).json({ ok: false, error: "lsoRegistrationId requerido" });
      }

      const result = await createContact(COMPANY_CLIENT_ID, {
        lsoRegistrationId: parseInt(lsoRegistrationId),
        status: "contactado",
        notes
      });

      return res.json(result);
    } catch (error: any) {
      console.error("[LSO Routes] Contact error:", error);
      return res.status(500).json({ ok: false, error: error.message });
    }
  });

  // Obtener mis contactos
  app.get("/api/lso/contacts", async (req, res) => {
    try {
      const { status, search } = req.query;
      
      const result = await getCompanyContacts(COMPANY_CLIENT_ID, {
        status: status as string,
        search: search as string
      });

      return res.json(result);
    } catch (error: any) {
      console.error("[LSO Routes] Get contacts error:", error);
      return res.status(500).json({ ok: false, error: error.message });
    }
  });

  // Actualizar estado de contacto
  app.patch("/api/lso/contacts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      
      if (!status) {
        return res.status(400).json({ ok: false, error: "status requerido" });
      }

      const result = await updateContactStatus(
        COMPANY_CLIENT_ID,
        parseInt(id),
        status,
        notes
      );

      return res.json(result);
    } catch (error: any) {
      console.error("[LSO Routes] Update contact error:", error);
      return res.status(500).json({ ok: false, error: error.message });
    }
  });

  // Generar URL autenticada para acceder al directorio externo
  app.get("/api/lso/directory-url", async (req, res) => {
    try {
      const user = req.user as any;
      if (!user) {
        return res.status(401).json({ ok: false, error: "No autenticado" });
      }

      const companyId = user.companyId;
      if (!companyId) {
        return res.status(400).json({ ok: false, error: "Usuario sin empresa asignada" });
      }

      // Obtener datos de la empresa
      const [company] = await db.select().from(companies).where(eq(companies.id, companyId));
      if (!company) {
        return res.status(404).json({ ok: false, error: "Empresa no encontrada" });
      }

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error("[LSO Routes] JWT_SECRET not configured");
        return res.status(500).json({ ok: false, error: "Configuración de seguridad faltante" });
      }

      // Generar token JWT para la empresa
      const token = jwt.sign(
        {
          companyId: company.id,
          companyName: company.name,
          permissions: ["read"]
        },
        jwtSecret,
        { expiresIn: "24h" }
      );

      const directoryUrl = `https://lso.sst-colombia.com.co/directorio?token=${token}`;
      
      console.log(`[LSO Routes] Generated directory URL for company ${company.id}`);
      
      return res.json({ ok: true, url: directoryUrl });
    } catch (error: any) {
      console.error("[LSO Routes] Directory URL error:", error);
      return res.status(500).json({ ok: false, error: error.message });
    }
  });

  console.log("✅ LSO Directory API routes registered at /api/lso/*");
}
