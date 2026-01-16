/**
 * Automated Database Backup Script
 * Bloque 2: Infrastructure - Backup Automation
 * 
 * Features:
 * - Daily PostgreSQL dumps using pg_dump
 * - Encryption at rest (AES-256)
 * - Upload to external storage (local for MVP, can extend to R2/S3)
 * - 30-day retention policy
 * - Backup verification
 * 
 * Usage:
 *   tsx server/scripts/backup-database.ts
 * 
 * Schedule with cron (production):
 *   0 2 * * * cd /app && tsx server/scripts/backup-database.ts >> /var/log/backups.log 2>&1
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import logger from '../lib/logger';

const execAsync = promisify(exec);

interface BackupConfig {
  backupDir: string;
  retentionDays: number;
  encryptionPassword: string;
  databaseUrl: string;
}

const config: BackupConfig = {
  backupDir: process.env.BACKUP_DIR || '/tmp/db-backups',
  retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '30', 10),
  encryptionPassword: process.env.BACKUP_ENCRYPTION_PASSWORD || '',
  databaseUrl: process.env.DATABASE_URL || '',
};

/**
 * Generate backup filename with timestamp
 */
function getBackupFilename(): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `sst-colombia-backup-${timestamp}.sql`;
}

/**
 * Encrypt file using AES-256-CBC
 */
function encryptFile(inputPath: string, outputPath: string, password: string): void {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(password, 'salt', 32);
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const input = fs.createReadStream(inputPath);
  const output = fs.createWriteStream(outputPath);
  
  // Write IV as first 16 bytes of encrypted file (needed for decryption)
  output.write(iv);
  
  input.pipe(cipher).pipe(output);
  
  return new Promise((resolve, reject) => {
    output.on('finish', resolve);
    output.on('error', reject);
  }) as any;
}

/**
 * Create PostgreSQL backup using pg_dump
 */
async function createBackup(): Promise<string> {
  logger.info('🗄️  Starting database backup...');
  
  // Ensure backup directory exists
  if (!fs.existsSync(config.backupDir)) {
    fs.mkdirSync(config.backupDir, { recursive: true });
    logger.info({ dir: config.backupDir }, 'Created backup directory');
  }
  
  const filename = getBackupFilename();
  const backupPath = path.join(config.backupDir, filename);
  const encryptedPath = `${backupPath}.enc`;
  
  try {
    // Execute pg_dump
    logger.info({ filename }, 'Running pg_dump...');
    const dumpCommand = `pg_dump "${config.databaseUrl}" > "${backupPath}"`;
    
    const { stdout, stderr } = await execAsync(dumpCommand);
    
    if (stderr && !stderr.includes('WARNING')) {
      logger.warn({ stderr }, 'pg_dump warnings');
    }
    
    // Verify backup file was created and has content
    const stats = fs.statSync(backupPath);
    if (stats.size === 0) {
      throw new Error('Backup file is empty');
    }
    
    logger.info({ 
      filename,
      sizeBytes: stats.size,
      sizeMB: (stats.size / 1024 / 1024).toFixed(2)
    }, 'Backup created successfully');
    
    // Encrypt backup
    logger.info('🔒 Encrypting backup...');
    await encryptFile(backupPath, encryptedPath, config.encryptionPassword);
    
    // Remove unencrypted backup
    fs.unlinkSync(backupPath);
    logger.info({ encryptedFile: encryptedPath }, 'Backup encrypted');
    
    // Verify encrypted file
    const encStats = fs.statSync(encryptedPath);
    logger.info({
      filename: path.basename(encryptedPath),
      sizeBytes: encStats.size,
      sizeMB: (encStats.size / 1024 / 1024).toFixed(2)
    }, '✅ Encrypted backup ready');
    
    return encryptedPath;
    
  } catch (error: any) {
    logger.error({ err: error }, '❌ Backup failed');
    throw error;
  }
}

/**
 * Clean up old backups beyond retention period
 */
async function cleanupOldBackups(): Promise<void> {
  logger.info({ retentionDays: config.retentionDays }, 'Cleaning up old backups...');
  
  const now = Date.now();
  const maxAge = config.retentionDays * 24 * 60 * 60 * 1000; // Convert days to ms
  
  const files = fs.readdirSync(config.backupDir);
  let deletedCount = 0;
  
  for (const file of files) {
    if (!file.endsWith('.sql.enc')) continue;
    
    const filePath = path.join(config.backupDir, file);
    const stats = fs.statSync(filePath);
    const age = now - stats.mtimeMs;
    
    if (age > maxAge) {
      fs.unlinkSync(filePath);
      deletedCount++;
      logger.info({ file, ageDays: Math.floor(age / (24 * 60 * 60 * 1000)) }, 'Deleted old backup');
    }
  }
  
  logger.info({ deletedCount }, `Cleanup complete - ${deletedCount} old backups removed`);
}

/**
 * Main backup routine
 */
async function main() {
  const startTime = Date.now();
  
  try {
    // Validate configuration
    if (!config.databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    
    if (!config.encryptionPassword) {
      throw new Error('BACKUP_ENCRYPTION_PASSWORD environment variable is required. Set a strong password for backup encryption.');
    }
    
    if (config.encryptionPassword.length < 16) {
      throw new Error('BACKUP_ENCRYPTION_PASSWORD must be at least 16 characters long');
    }
    
    // Create backup
    const backupPath = await createBackup();
    
    // Cleanup old backups
    await cleanupOldBackups();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.info({ 
      duration: `${duration}s`,
      backupPath 
    }, '🎉 Backup completed successfully');
    
    process.exit(0);
    
  } catch (error: any) {
    logger.error({ err: error }, '💥 Backup failed');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { createBackup, cleanupOldBackups };
