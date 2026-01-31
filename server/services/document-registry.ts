/**
 * Document Registry Service
 * 
 * Provides centralized registration of system-generated documents (PDFs)
 * for the Conservación de Documentos module.
 * 
 * Following the Add-Only principle: This service only adds new records,
 * never modifies existing PDF generation logic.
 */

import { db } from '../db';
import { sstDocuments } from '@shared/schema';
import { sql } from 'drizzle-orm';

// Document source module identifiers
export const DocumentModules = {
  DESIGNACIONES: 'designaciones',
  CAPACITACIONES: 'capacitaciones',
  EXAMENES_MEDICOS: 'examenes_medicos',
  ACCIDENTES: 'accidentes',
  INSPECCIONES: 'inspecciones',
  INVESTIGACIONES: 'investigaciones',
  PRESUPUESTO: 'presupuesto',
  RECURSOS: 'recursos',
  POLITICAS: 'politicas',
  TRABAJADORES: 'trabajadores',
  EVALUACIONES: 'evaluaciones',
  PLANES_TRABAJO: 'planes_trabajo',
  EPP: 'epp',
  CONTRATOS: 'contratos',
  AFILIACIONES: 'afiliaciones',
  COPASST: 'copasst',
  AUSENTISMO: 'ausentismo',
  EMERGENCIAS: 'emergencias',
  PESV: 'pesv',
  AUDITORIAS: 'auditorias',
  INDICADORES: 'indicadores',
  COMUNICACIONES: 'comunicaciones',
  INDUCCION: 'induccion',
  PERFILES_CARGO: 'perfiles_cargo',
  CAMBIOS: 'cambios',
  ADQUISICIONES: 'adquisiciones',
  MATRIZ_LEGAL: 'matriz_legal',
  VIGILANCIA_EPIDEMIOLOGICA: 'vigilancia_epidemiologica',
  REVISIONES_DIRECCION: 'revisiones_direccion',
  OTROS: 'otros'
} as const;

// Document categories mapping based on module
const MODULE_CATEGORIES: Record<string, string> = {
  [DocumentModules.DESIGNACIONES]: 'acta',
  [DocumentModules.CAPACITACIONES]: 'capacitacion',
  [DocumentModules.EXAMENES_MEDICOS]: 'certificado',
  [DocumentModules.ACCIDENTES]: 'informe',
  [DocumentModules.INSPECCIONES]: 'registro',
  [DocumentModules.INVESTIGACIONES]: 'informe',
  [DocumentModules.PRESUPUESTO]: 'formato',
  [DocumentModules.RECURSOS]: 'acta',
  [DocumentModules.POLITICAS]: 'politica',
  [DocumentModules.TRABAJADORES]: 'registro',
  [DocumentModules.EVALUACIONES]: 'informe',
  [DocumentModules.PLANES_TRABAJO]: 'plan',
  [DocumentModules.EPP]: 'registro',
  [DocumentModules.CONTRATOS]: 'contrato',
  [DocumentModules.AFILIACIONES]: 'certificado',
  [DocumentModules.COPASST]: 'acta',
  [DocumentModules.AUSENTISMO]: 'registro',
  [DocumentModules.EMERGENCIAS]: 'plan',
  [DocumentModules.PESV]: 'registro',
  [DocumentModules.AUDITORIAS]: 'informe',
  [DocumentModules.INDICADORES]: 'informe',
  [DocumentModules.COMUNICACIONES]: 'registro',
  [DocumentModules.INDUCCION]: 'registro',
  [DocumentModules.PERFILES_CARGO]: 'formato',
  [DocumentModules.CAMBIOS]: 'registro',
  [DocumentModules.ADQUISICIONES]: 'registro',
  [DocumentModules.MATRIZ_LEGAL]: 'matriz',
  [DocumentModules.VIGILANCIA_EPIDEMIOLOGICA]: 'registro',
  [DocumentModules.REVISIONES_DIRECCION]: 'acta',
  [DocumentModules.OTROS]: 'otro'
};

// PHVA cycle mapping based on module
const MODULE_PHVA: Record<string, string> = {
  [DocumentModules.DESIGNACIONES]: 'PLANEAR',
  [DocumentModules.CAPACITACIONES]: 'HACER',
  [DocumentModules.EXAMENES_MEDICOS]: 'HACER',
  [DocumentModules.ACCIDENTES]: 'VERIFICAR',
  [DocumentModules.INSPECCIONES]: 'VERIFICAR',
  [DocumentModules.INVESTIGACIONES]: 'ACTUAR',
  [DocumentModules.PRESUPUESTO]: 'PLANEAR',
  [DocumentModules.RECURSOS]: 'PLANEAR',
  [DocumentModules.POLITICAS]: 'PLANEAR',
  [DocumentModules.TRABAJADORES]: 'HACER',
  [DocumentModules.EVALUACIONES]: 'VERIFICAR',
  [DocumentModules.PLANES_TRABAJO]: 'PLANEAR',
  [DocumentModules.EPP]: 'HACER',
  [DocumentModules.CONTRATOS]: 'PLANEAR',
  [DocumentModules.AFILIACIONES]: 'PLANEAR',
  [DocumentModules.COPASST]: 'VERIFICAR',
  [DocumentModules.AUSENTISMO]: 'VERIFICAR',
  [DocumentModules.EMERGENCIAS]: 'PLANEAR',
  [DocumentModules.PESV]: 'PLANEAR',
  [DocumentModules.AUDITORIAS]: 'VERIFICAR',
  [DocumentModules.INDICADORES]: 'VERIFICAR',
  [DocumentModules.COMUNICACIONES]: 'HACER',
  [DocumentModules.INDUCCION]: 'HACER',
  [DocumentModules.PERFILES_CARGO]: 'PLANEAR',
  [DocumentModules.CAMBIOS]: 'ACTUAR',
  [DocumentModules.ADQUISICIONES]: 'PLANEAR',
  [DocumentModules.MATRIZ_LEGAL]: 'PLANEAR',
  [DocumentModules.VIGILANCIA_EPIDEMIOLOGICA]: 'VERIFICAR',
  [DocumentModules.REVISIONES_DIRECCION]: 'ACTUAR',
  [DocumentModules.OTROS]: 'HACER'
};

interface RegisterDocumentParams {
  companyId: string;
  code: string;
  title: string;
  description?: string;
  sourceModule: string;
  sourceEndpoint: string;
  sourceRecordId: string;
  sstStandards?: string[];
  createdBy?: string;
}

/**
 * Registers a system-generated document in the centralized document repository.
 * This function is called after a PDF is successfully generated.
 * 
 * @param params Document registration parameters
 * @returns The ID of the registered document, or null if registration fails
 */
export async function registerSystemDocument(params: RegisterDocumentParams): Promise<string | null> {
  try {
    const {
      companyId,
      code,
      title,
      description,
      sourceModule,
      sourceEndpoint,
      sourceRecordId,
      sstStandards = [],
      createdBy
    } = params;

    // Check if document already registered (avoid duplicates)
    const existing = await db.execute(sql`
      SELECT id FROM sst_documents 
      WHERE company_id = ${companyId} 
        AND source_module = ${sourceModule} 
        AND source_record_id = ${sourceRecordId}
      LIMIT 1
    `);

    if (existing.rows && existing.rows.length > 0) {
      // Document already registered, return existing ID
      console.log(`[DocumentRegistry] Document already registered: ${sourceModule}/${sourceRecordId}`);
      return (existing.rows[0] as any).id;
    }

    // Get category and PHVA based on module
    const category = MODULE_CATEGORIES[sourceModule] || 'otro';
    const phvaCycle = MODULE_PHVA[sourceModule] || 'HACER';

    // Insert new document record
    const result = await db.execute(sql`
      INSERT INTO sst_documents (
        company_id,
        code,
        title,
        description,
        category,
        sst_standards,
        phva_cycle,
        current_version,
        status,
        source_module,
        source_endpoint,
        source_record_id,
        is_system_generated,
        created_by,
        created_at,
        updated_at
      ) VALUES (
        ${companyId},
        ${code},
        ${title},
        ${description || null},
        ${category},
        ${sql`${sstStandards}::text[]`},
        ${phvaCycle},
        '1.0',
        'vigente',
        ${sourceModule},
        ${sourceEndpoint},
        ${sourceRecordId},
        true,
        ${createdBy || null},
        NOW(),
        NOW()
      )
      RETURNING id
    `);

    if (result.rows && result.rows.length > 0) {
      const docId = (result.rows[0] as any).id;
      console.log(`[DocumentRegistry] ✅ Document registered: ${title} (${docId})`);
      return docId;
    }

    return null;
  } catch (error: any) {
    // Log error but don't throw - document generation should continue even if registration fails
    console.error(`[DocumentRegistry] ⚠️ Failed to register document: ${error.message}`);
    return null;
  }
}

/**
 * Gets all system-generated documents for a company
 */
export async function getSystemDocuments(companyId: string): Promise<any[]> {
  try {
    const result = await db.execute(sql`
      SELECT 
        id,
        code,
        title,
        description,
        category,
        sst_standards,
        phva_cycle,
        status,
        source_module,
        source_endpoint,
        source_record_id,
        created_at,
        updated_at
      FROM sst_documents 
      WHERE company_id = ${companyId} 
        AND is_system_generated = true
      ORDER BY created_at DESC
    `);

    return result.rows as any[];
  } catch (error: any) {
    console.error(`[DocumentRegistry] Error fetching system documents: ${error.message}`);
    return [];
  }
}

/**
 * Gets count of system-generated documents grouped by module
 */
export async function getSystemDocumentStats(companyId: string): Promise<Record<string, number>> {
  try {
    const result = await db.execute(sql`
      SELECT 
        source_module,
        COUNT(*) as count
      FROM sst_documents 
      WHERE company_id = ${companyId} 
        AND is_system_generated = true
        AND source_module IS NOT NULL
      GROUP BY source_module
    `);

    const stats: Record<string, number> = {};
    for (const row of result.rows as any[]) {
      stats[row.source_module] = parseInt(row.count, 10);
    }
    return stats;
  } catch (error: any) {
    console.error(`[DocumentRegistry] Error fetching document stats: ${error.message}`);
    return {};
  }
}
