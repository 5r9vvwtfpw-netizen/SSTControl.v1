import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import sharp from 'sharp';

const execFileAsync = promisify(execFile);

const MIN_IMAGE_SIZE = 500 * 1024; // 500KB
const MIN_PDF_SIZE = 1 * 1024 * 1024; // 1MB
const MAX_DIMENSION = 2048;

interface CompressionResult {
  compressedPath: string;
  originalSize: number;
  compressedSize: number;
}

async function compressImage(filePath: string, mimeType: string): Promise<CompressionResult> {
  const stats = fs.statSync(filePath);
  const originalSize = stats.size;

  if (originalSize <= MIN_IMAGE_SIZE) {
    return { compressedPath: filePath, originalSize, compressedSize: originalSize };
  }

  const outputPath = filePath + '.compressed' + path.extname(filePath);

  try {
    let pipeline = sharp(filePath)
      .resize(MAX_DIMENSION, MAX_DIMENSION, {
        fit: 'inside',
        withoutEnlargement: true,
      });

    if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
      pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true });
    } else if (mimeType === 'image/png') {
      pipeline = pipeline.png({ compressionLevel: 9, palette: true });
    }

    await pipeline.toFile(outputPath);

    const compressedStats = fs.statSync(outputPath);
    const compressedSize = compressedStats.size;

    if (compressedSize >= originalSize) {
      try { fs.unlinkSync(outputPath); } catch {}
      return { compressedPath: filePath, originalSize, compressedSize: originalSize };
    }

    const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
    console.log(`[Compression] Image: ${(originalSize / 1024).toFixed(1)}KB → ${(compressedSize / 1024).toFixed(1)}KB (${ratio}% reduction)`);

    return { compressedPath: outputPath, originalSize, compressedSize };
  } catch (error) {
    console.warn('[Compression] Image compression failed, using original:', error);
    try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); } catch {}
    return { compressedPath: filePath, originalSize, compressedSize: originalSize };
  }
}

async function compressPdf(filePath: string): Promise<CompressionResult> {
  const stats = fs.statSync(filePath);
  const originalSize = stats.size;

  if (originalSize <= MIN_PDF_SIZE) {
    return { compressedPath: filePath, originalSize, compressedSize: originalSize };
  }

  const outputPath = filePath + '.compressed.pdf';

  try {
    await execFileAsync('gs', [
      '-sDEVICE=pdfwrite',
      '-dCompatibilityLevel=1.4',
      '-dPDFSETTINGS=/ebook',
      '-dNOPAUSE',
      '-dQUIET',
      '-dBATCH',
      `-sOutputFile=${outputPath}`,
      filePath,
    ]);

    const compressedStats = fs.statSync(outputPath);
    const compressedSize = compressedStats.size;

    if (compressedSize >= originalSize) {
      try { fs.unlinkSync(outputPath); } catch {}
      return { compressedPath: filePath, originalSize, compressedSize: originalSize };
    }

    fs.copyFileSync(outputPath, filePath);
    try { fs.unlinkSync(outputPath); } catch {}

    const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
    console.log(`[Compression] PDF: ${(originalSize / 1024).toFixed(1)}KB → ${(compressedSize / 1024).toFixed(1)}KB (${ratio}% reduction)`);

    return { compressedPath: filePath, originalSize, compressedSize };
  } catch (error) {
    console.warn('[Compression] PDF compression failed, using original:', error);
    try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); } catch {}
    return { compressedPath: filePath, originalSize, compressedSize: originalSize };
  }
}

export async function compressFile(filePath: string, mimeType: string): Promise<CompressionResult> {
  try {
    const stats = fs.statSync(filePath);
    const originalSize = stats.size;

    if (mimeType === 'image/jpeg' || mimeType === 'image/jpg' || mimeType === 'image/png') {
      return await compressImage(filePath, mimeType);
    }

    if (mimeType === 'application/pdf') {
      return await compressPdf(filePath);
    }

    return { compressedPath: filePath, originalSize, compressedSize: originalSize };
  } catch (error) {
    console.warn('[Compression] Compression failed, using original file:', error);
    let originalSize = 0;
    try { originalSize = fs.statSync(filePath).size; } catch {}
    return { compressedPath: filePath, originalSize, compressedSize: originalSize };
  }
}
