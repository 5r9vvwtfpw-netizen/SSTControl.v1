/**
 * Generador de PDF de flota PESV como Buffer (para adjuntar en correos).
 * Reutiliza la misma lógica del endpoint GET /api/pesv/vehiculos/pdf.
 */
import { db } from '../db';
import { eq } from 'drizzle-orm';
import * as schema from '@shared/schema';
import {
  addStandardHeader, addSectionBar, addSignatureFooter, addSimpleTable,
  formatDate, getSignersForCompany, loadCompanyLogo,
} from './pdf-standardizer';
import { setupTrialWatermarkOnAllPages } from './pdf-watermark';
import { getTrialStatus } from '@shared/utils';
import { storage } from '../storage';

export async function generarPdfFlotaBuffer(companyId: string): Promise<Buffer | null> {
  try {
    const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, companyId)).limit(1);
    if (!company) return null;

    const vehiculos = await db.select().from(schema.vehicles).where(eq(schema.vehicles.companyId, companyId));
    if (vehiculos.length === 0) return null;

    const { default: PDFDocument } = await import('pdfkit');
    const doc = new PDFDocument({ margin: 35, size: 'LETTER' });

    const subscription = await storage.getSubscriptionByCompany(companyId);
    const trialStatus = getTrialStatus(subscription?.status || 'trial', subscription?.trialEnd || null, true, true);
    setupTrialWatermarkOnAllPages(doc, trialStatus.requiresWatermark);

    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    const logoBuffer = await loadCompanyLogo(company.logoUrl);
    const signers = await getSignersForCompany(companyId, true);

    let y = await addStandardHeader({
      doc, company, documentTitle: 'PARQUE AUTOMOTOR - PESV',
      documentCode: 'PESV-VEH', logoBuffer,
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const fmtExpiry = (dateStr: string | null | undefined): string => {
      if (!dateStr) return 'Sin registro';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Sin registro';
      return formatDate(d);
    };

    const expiryLabel = (dateStr: string | null | undefined): string => {
      if (!dateStr) return '—';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '—';
      return d < today ? '⚠ Vencido' : '';
    };

    const rows = vehiculos.map(v => [
      v.plate, v.type, v.brand, v.model, String(v.year ?? ''), v.status ?? '',
    ]);
    y = addSimpleTable(doc, ['Placa', 'Tipo', 'Marca', 'Modelo', 'Año', 'Estado'], rows, { y });

    y = addSectionBar(doc, 'VENCIMIENTOS DE DOCUMENTOS', y + 12);
    const rowsVenc = vehiculos.map(v => [
      v.plate,
      fmtExpiry(v.soatExpiry),
      expiryLabel(v.soatExpiry),
      fmtExpiry(v.technicalReviewExpiry),
      expiryLabel(v.technicalReviewExpiry),
      fmtExpiry(v.insuranceExpiry),
      expiryLabel(v.insuranceExpiry),
    ]);
    y = addSimpleTable(
      doc,
      ['Placa', 'Venc. SOAT', 'Est. SOAT', 'Venc. Rev. Técnica', 'Est. RTM', 'Venc. Seguro', 'Est. Seguro'],
      rowsVenc,
      { y, columnWidths: [55, 75, 65, 90, 65, 75, 65] },
    );

    await addSignatureFooter(doc, signers, true);
    doc.end();

    return await new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });
  } catch (err: any) {
    return null;
  }
}
