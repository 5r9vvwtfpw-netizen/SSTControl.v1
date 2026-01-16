import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

let masterKey: Buffer | null = null;

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  authTag: string;
  version: number;
}

export function initializeMasterKey(): boolean {
  const keyEnv = process.env.ENCRYPTION_MASTER_KEY;
  
  if (!keyEnv) {
    console.warn('[Crypto] ENCRYPTION_MASTER_KEY no configurada - cifrado deshabilitado');
    return false;
  }
  
  try {
    let keyBuffer = Buffer.from(keyEnv.trim(), 'base64');
    
    if (keyBuffer.length < KEY_LENGTH) {
      console.error(`[Crypto] La llave debe ser de mínimo ${KEY_LENGTH} bytes (256 bits). Recibida: ${keyBuffer.length} bytes`);
      return false;
    }
    
    if (keyBuffer.length > KEY_LENGTH) {
      keyBuffer = keyBuffer.subarray(0, KEY_LENGTH);
    }
    
    masterKey = keyBuffer;
    console.log('[Crypto] Llave maestra de cifrado AES-256 inicializada correctamente');
    return true;
  } catch (error) {
    console.error('[Crypto] Error al inicializar llave maestra:', error);
    return false;
  }
}

export function isEncryptionEnabled(): boolean {
  return masterKey !== null;
}

export function deriveKey(context: string): Buffer {
  if (!masterKey) {
    throw new Error('Llave maestra no inicializada');
  }
  
  return crypto.createHmac('sha256', masterKey)
    .update(context)
    .digest();
}

export function encrypt(plaintext: string, context: string = 'default'): EncryptedData {
  if (!masterKey) {
    throw new Error('Cifrado no disponible - llave maestra no configurada');
  }
  
  const derivedKey = deriveKey(context);
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv, {
    authTagLength: AUTH_TAG_LENGTH
  });
  
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  const authTag = cipher.getAuthTag();
  
  return {
    ciphertext: encrypted,
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    version: 1
  };
}

export function decrypt(encryptedData: EncryptedData, context: string = 'default'): string {
  if (!masterKey) {
    throw new Error('Descifrado no disponible - llave maestra no configurada');
  }
  
  const derivedKey = deriveKey(context);
  const iv = Buffer.from(encryptedData.iv, 'base64');
  const authTag = Buffer.from(encryptedData.authTag, 'base64');
  const ciphertext = Buffer.from(encryptedData.ciphertext, 'base64');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv, {
    authTagLength: AUTH_TAG_LENGTH
  });
  
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(ciphertext);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  return decrypted.toString('utf8');
}

export function encryptField(value: string, fieldContext: string): string {
  if (!isEncryptionEnabled()) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cifrado requerido en producción - ENCRYPTION_MASTER_KEY no configurada');
    }
    console.warn('[Crypto] Cifrado deshabilitado - datos almacenados en texto plano');
    return value;
  }
  
  const encrypted = encrypt(value, fieldContext);
  return JSON.stringify(encrypted);
}

export function decryptField(encryptedValue: string, fieldContext: string): string {
  if (!isEncryptionEnabled()) {
    return encryptedValue;
  }
  
  try {
    const parsed = JSON.parse(encryptedValue) as EncryptedData;
    
    if (!parsed.ciphertext || !parsed.iv || !parsed.authTag) {
      return encryptedValue;
    }
    
    return decrypt(parsed, fieldContext);
  } catch {
    return encryptedValue;
  }
}

export function encryptToken(token: string, tokenType: string = 'portal'): string {
  return encryptField(token, `token:${tokenType}`);
}

export function decryptToken(encryptedToken: string, tokenType: string = 'portal'): string {
  return decryptField(encryptedToken, `token:${tokenType}`);
}

export function encryptPII(data: string, fieldName: string, entityId: string): string {
  return encryptField(data, `pii:${fieldName}:${entityId}`);
}

export function decryptPII(encryptedData: string, fieldName: string, entityId: string): string {
  return decryptField(encryptedData, `pii:${fieldName}:${entityId}`);
}

export function generateMasterKeyForSetup(): string {
  const key = crypto.randomBytes(KEY_LENGTH);
  return key.toString('base64');
}

export function hashSensitiveData(data: string, salt?: string): string {
  if (masterKey) {
    return crypto.createHmac('sha256', masterKey)
      .update(salt ? `${salt}:${data}` : data)
      .digest('hex');
  }
  
  if (salt) {
    return crypto.createHash('sha256').update(`${salt}:${data}`).digest('hex');
  }
  return crypto.createHash('sha256').update(data).digest('hex');
}
