/**
 * PDF Watermark Service
 * 
 * Adds watermarks to PDFs generated during trial period
 * to prevent using trial documents for official audits.
 */

interface WatermarkOptions {
  text?: string;
  opacity?: number;
  angle?: number;
  fontSize?: number;
  color?: string;
}

const DEFAULT_WATERMARK_TEXT = "VERSIÓN DE PRUEBA - NO VÁLIDO PARA AUDITORÍA";

/**
 * Adds a diagonal watermark to a PDF document
 * Call this after creating the PDF document but before adding content
 * The watermark will appear on all pages
 * 
 * @param doc - PDFKit document instance
 * @param options - Watermark customization options
 */
export function addTrialWatermark(
  doc: any,
  options: WatermarkOptions = {}
): void {
  const {
    text = DEFAULT_WATERMARK_TEXT,
    opacity = 0.15,
    angle = -45,
    fontSize = 60,
    color = '#FF0000'
  } = options;

  // Store current state
  doc.save();
  
  // Calculate page dimensions
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  
  // Calculate center of page
  const centerX = pageWidth / 2;
  const centerY = pageHeight / 2;
  
  // Set watermark styling
  doc.opacity(opacity)
     .font('Helvetica-Bold')
     .fontSize(fontSize)
     .fillColor(color);
  
  // Rotate and position watermark at center
  doc.rotate(angle, { origin: [centerX, centerY] });
  
  // Calculate text width for centering
  const textWidth = doc.widthOfString(text);
  const textX = centerX - textWidth / 2;
  const textY = centerY - fontSize / 2;
  
  // Draw watermark text
  doc.text(text, textX, textY, {
    width: textWidth + 100,
    align: 'center'
  });
  
  // Restore state
  doc.restore();
}

/**
 * Adds watermark to each page of a multi-page PDF
 * Should be called in the 'pageAdded' event
 * 
 * @param doc - PDFKit document instance
 * @param requiresWatermark - Whether to add watermark based on trial status
 */
export function setupTrialWatermarkOnAllPages(
  doc: any,
  requiresWatermark: boolean
): void {
  if (!requiresWatermark) return;
  
  // Add watermark to current page
  addTrialWatermark(doc);
  
  // Add watermark to any new pages
  doc.on('pageAdded', () => {
    addTrialWatermark(doc);
  });
}

/**
 * Creates a PDF footer indicating trial status
 * @param doc - PDFKit document instance
 * @param isTrial - Whether the user is in trial period
 */
export function addTrialFooter(doc: any, isTrial: boolean): void {
  if (!isTrial) return;
  
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const margin = 30;
  
  doc.save();
  doc.opacity(0.7)
     .fontSize(8)
     .fillColor('#FF0000')
     .text(
       'DOCUMENTO GENERADO DURANTE PERÍODO DE PRUEBA - NO VÁLIDO PARA PROPÓSITOS OFICIALES O AUDITORÍAS',
       margin,
       pageHeight - 30,
       { width: pageWidth - (margin * 2), align: 'center' }
     );
  doc.restore();
}

/**
 * LSO Watermark Options for Ministry Reports
 */
interface LsoWatermarkOptions {
  lsoName: string;
  licenseNumber: string;
  isExternal?: boolean;
}

/**
 * Adds a LSO certification watermark to the PDF
 * Same style as trial watermark but with LSO name
 * 
 * @param doc - PDFKit document instance
 * @param options - LSO information for the watermark
 */
export function addLsoWatermark(doc: any, options: LsoWatermarkOptions): void {
  const { lsoName, licenseNumber, isExternal = false } = options;
  
  doc.save();
  
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  
  const centerX = pageWidth / 2;
  const centerY = pageHeight / 2;
  
  // Same style as trial watermark - large diagonal text
  doc.opacity(0.15)
     .font('Helvetica-Bold')
     .fontSize(60)
     .fillColor('#1e7e34');
  
  doc.rotate(-45, { origin: [centerX, centerY] });
  
  // Simple text with LSO name in large letters
  const text = lsoName.toUpperCase();
  const textWidth = doc.widthOfString(text);
  const textX = centerX - textWidth / 2;
  const textY = centerY - 30;
  
  doc.text(text, textX, textY, {
    width: textWidth + 100,
    align: 'center'
  });
  
  doc.restore();
}

/**
 * Sets up LSO watermark on all pages of the PDF
 * 
 * @param doc - PDFKit document instance
 * @param lsoData - LSO professional data (null if no LSO assigned)
 */
export function setupLsoWatermarkOnAllPages(
  doc: any,
  lsoData: { fullName: string; sstLicenseNumber: string; isExternal?: boolean } | null
): void {
  if (!lsoData) return;
  
  const options: LsoWatermarkOptions = {
    lsoName: lsoData.fullName,
    licenseNumber: lsoData.sstLicenseNumber,
    isExternal: lsoData.isExternal
  };
  
  // Add watermark to current page
  addLsoWatermark(doc, options);
  
  // Add watermark to any new pages
  doc.on('pageAdded', () => {
    addLsoWatermark(doc, options);
  });
}
