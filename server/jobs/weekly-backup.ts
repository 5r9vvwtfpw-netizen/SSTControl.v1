import cron from 'node-cron';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import logger from '../lib/logger';

const execAsync = promisify(exec);

interface BackupResult {
  success: boolean;
  filename: string;
  sizeBytes: number;
  sizeMB: string;
  timestamp: string;
  s3Key?: string;
  error?: string;
}

/**
 * Weekly Backup System - Seguridad para Producción
 * 
 * Features:
 * - PostgreSQL dump using pg_dump
 * - AES-256 encryption at rest
 * - Upload to AWS S3 bucket
 * - Weekly execution (Sunday 11PM Colombia / Monday 4AM UTC)
 */

/**
 * Get encryption password from environment
 */
function getEncryptionPassword(): string | null {
  return process.env.BACKUP_ENCRYPTION_PASSWORD || process.env.ENCRYPTION_MASTER_KEY || null;
}

/**
 * Encrypt file using AES-256-CBC
 */
async function encryptFile(inputPath: string, outputPath: string, password: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(password, 'sst-colombia-backup-salt', 32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const input = fs.createReadStream(inputPath);
    const output = fs.createWriteStream(outputPath);
    
    output.write(iv);
    
    input.pipe(cipher).pipe(output);
    
    output.on('finish', resolve);
    output.on('error', reject);
    input.on('error', reject);
  });
}

/**
 * Initialize S3 client with AWS credentials
 */
function getS3Client(): S3Client | null {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION || 'us-east-1';

  if (!accessKeyId || !secretAccessKey) {
    return null;
  }

  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  });
}

/**
 * Run weekly backup
 * Creates encrypted PostgreSQL dump and uploads to S3
 */
export async function runWeeklyBackup(): Promise<BackupResult> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = process.env.BACKUP_DIR || '/tmp/db-backups';
  const filename = `sst-colombia-weekly-${timestamp}.sql`;
  const backupPath = path.join(backupDir, filename);
  const encryptedPath = `${backupPath}.enc`;
  
  const context = {
    jobName: 'weekly-backup',
    timestamp: new Date().toISOString()
  };

  logger.info({ ...context }, '🗄️  Starting weekly database backup...');

  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    const encryptionPassword = getEncryptionPassword();
    if (!encryptionPassword) {
      throw new Error('BACKUP_ENCRYPTION_PASSWORD or ENCRYPTION_MASTER_KEY is required for encrypted backups');
    }

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
      logger.info({ ...context, dir: backupDir }, 'Created backup directory');
    }

    logger.info({ ...context, filename }, 'Running pg_dump...');
    const dumpCommand = `pg_dump "${databaseUrl}" > "${backupPath}"`;
    
    const { stderr } = await execAsync(dumpCommand);
    
    if (stderr && !stderr.includes('WARNING')) {
      logger.warn({ ...context, stderr }, 'pg_dump warnings');
    }

    const stats = fs.statSync(backupPath);
    if (stats.size === 0) {
      throw new Error('Backup file is empty');
    }

    logger.info({ 
      ...context,
      filename,
      sizeBytes: stats.size,
      sizeMB: (stats.size / 1024 / 1024).toFixed(2)
    }, 'Backup created successfully');

    logger.info({ ...context }, '🔒 Encrypting backup...');
    await encryptFile(backupPath, encryptedPath, encryptionPassword);
    
    fs.unlinkSync(backupPath);
    logger.info({ ...context, encryptedFile: path.basename(encryptedPath) }, 'Backup encrypted');

    const encStats = fs.statSync(encryptedPath);
    const encryptedFilename = path.basename(encryptedPath);
    
    let s3Key: string | undefined;
    
    const s3Client = getS3Client();
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    
    if (s3Client && bucketName) {
      s3Key = `backups/${encryptedFilename}`;
      
      logger.info({ ...context, bucket: bucketName, key: s3Key }, '☁️  Uploading to S3...');
      
      const fileContent = fs.readFileSync(encryptedPath);
      
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
        Body: fileContent,
        ContentType: 'application/octet-stream',
        Metadata: {
          'backup-timestamp': timestamp,
          'backup-type': 'weekly',
          'encryption': 'aes-256-cbc'
        }
      });
      
      await s3Client.send(command);
      
      logger.info({ ...context, s3Key }, '✅ Backup uploaded to S3 successfully');
      
      fs.unlinkSync(encryptedPath);
      logger.info({ ...context }, 'Local encrypted file cleaned up');
    } else {
      logger.warn({ ...context }, '⚠️ S3 not configured - backup stored locally only');
    }

    const result: BackupResult = {
      success: true,
      filename: encryptedFilename,
      sizeBytes: encStats.size,
      sizeMB: (encStats.size / 1024 / 1024).toFixed(2),
      timestamp: new Date().toISOString(),
      s3Key
    };

    logger.info({ ...context, result }, '🎉 Weekly backup completed successfully');
    
    return result;

  } catch (error: any) {
    logger.error({ ...context, err: error }, '❌ Weekly backup failed');
    
    if (fs.existsSync(backupPath)) {
      fs.unlinkSync(backupPath);
    }
    if (fs.existsSync(encryptedPath)) {
      fs.unlinkSync(encryptedPath);
    }
    
    return {
      success: false,
      filename: '',
      sizeBytes: 0,
      sizeMB: '0',
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
}

/**
 * Schedule weekly backup
 * Runs every Sunday at 11:00 PM Colombia time (Monday 4:00 AM UTC)
 */
export function scheduleWeeklyBackup(): void {
  logger.info('📅 Scheduling weekly database backup...');
  
  cron.schedule('0 4 * * 1', async () => {
    logger.info('⏰ Weekly backup cron triggered (Monday 4AM UTC = Sunday 11PM Colombia)');
    await runWeeklyBackup();
  });

  logger.info('✅ Weekly backup cron scheduled (runs every Sunday 11PM Colombia / Monday 4AM UTC)');
}
