/**
 * Database Restore Script
 * Bloque 2: Infrastructure - Disaster Recovery
 * 
 * Restores PostgreSQL database from encrypted backup
 * 
 * Usage:
 *   tsx server/scripts/restore-database.ts /path/to/backup.sql.enc
 * 
 * ⚠️  WARNING: This will OVERWRITE the current database!
 * Only use in disaster recovery scenarios.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import crypto from 'crypto';
import logger from '../lib/logger';
import readline from 'readline';

const execAsync = promisify(exec);

interface RestoreConfig {
  encryptionPassword: string;
  databaseUrl: string;
}

const config: RestoreConfig = {
  encryptionPassword: process.env.BACKUP_ENCRYPTION_PASSWORD || '',
  databaseUrl: process.env.DATABASE_URL || '',
};

/**
 * Decrypt backup file using AES-256-CBC
 */
function decryptFile(inputPath: string, outputPath: string, password: string): void {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(password, 'salt', 32);
  
  const input = fs.createReadStream(inputPath);
  const output = fs.createWriteStream(outputPath);
  
  let iv: Buffer | null = null;
  let decipher: crypto.Decipher | null = null;
  
  input.on('data', (chunk: Buffer) => {
    if (!iv) {
      // First 16 bytes are the IV
      iv = chunk.slice(0, 16);
      decipher = crypto.createDecipheriv(algorithm, key, iv);
      
      const remaining = chunk.slice(16);
      if (remaining.length > 0 && decipher) {
        output.write(decipher.update(remaining));
      }
    } else if (decipher) {
      output.write(decipher.update(chunk));
    }
  });
  
  input.on('end', () => {
    if (decipher) {
      output.write(decipher.final());
    }
    output.end();
  });
  
  return new Promise((resolve, reject) => {
    output.on('finish', resolve);
    output.on('error', reject);
    input.on('error', reject);
  }) as any;
}

/**
 * Prompt user for confirmation
 */
async function confirmRestore(): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question('\n⚠️  WARNING: This will OVERWRITE the current database. Continue? (yes/no): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * Restore database from backup file
 */
async function restoreBackup(backupPath: string): Promise<void> {
  logger.info({ backupPath }, '🔄 Starting database restore...');
  
  if (!fs.existsSync(backupPath)) {
    throw new Error(`Backup file not found: ${backupPath}`);
  }
  
  const decryptedPath = backupPath.replace('.enc', '');
  
  try {
    // Decrypt backup
    logger.info('🔓 Decrypting backup...');
    await decryptFile(backupPath, decryptedPath, config.encryptionPassword);
    logger.info('Backup decrypted successfully');
    
    // Verify decrypted file
    const stats = fs.statSync(decryptedPath);
    if (stats.size === 0) {
      throw new Error('Decrypted backup is empty - check encryption password');
    }
    
    logger.info({
      sizeMB: (stats.size / 1024 / 1024).toFixed(2)
    }, 'Backup file verified');
    
    // Restore using psql
    logger.info('📥 Restoring database...');
    const restoreCommand = `psql "${config.databaseUrl}" < "${decryptedPath}"`;
    
    const { stdout, stderr } = await execAsync(restoreCommand);
    
    if (stderr && !stderr.includes('WARNING') && !stderr.includes('NOTICE')) {
      logger.warn({ stderr }, 'psql warnings');
    }
    
    // Remove decrypted file
    fs.unlinkSync(decryptedPath);
    
    logger.info('✅ Database restored successfully');
    
  } catch (error: any) {
    // Cleanup decrypted file on error
    if (fs.existsSync(decryptedPath)) {
      fs.unlinkSync(decryptedPath);
    }
    
    logger.error({ err: error }, '❌ Restore failed');
    throw error;
  }
}

/**
 * Main restore routine
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: tsx server/scripts/restore-database.ts <backup-file.sql.enc>');
    process.exit(1);
  }
  
  const backupPath = args[0];
  
  try {
    // Validate configuration
    if (!config.databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    
    if (!config.encryptionPassword) {
      throw new Error('BACKUP_ENCRYPTION_PASSWORD environment variable is required');
    }
    
    // Confirm with user
    if (process.env.SKIP_CONFIRMATION !== 'true') {
      const confirmed = await confirmRestore();
      if (!confirmed) {
        logger.info('Restore cancelled by user');
        process.exit(0);
      }
    }
    
    // Restore backup
    await restoreBackup(backupPath);
    
    logger.info('🎉 Restore completed successfully');
    process.exit(0);
    
  } catch (error: any) {
    logger.error({ err: error }, '💥 Restore failed');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { restoreBackup, decryptFile };
