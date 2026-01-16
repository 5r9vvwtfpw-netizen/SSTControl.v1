import { 
  encryptField, 
  decryptField, 
  isEncryptionEnabled,
  hashSensitiveData 
} from './encryption';

export interface SensitiveFieldConfig {
  encrypt: boolean;
  hash: boolean;
}

export const SENSITIVE_FIELDS: Record<string, SensitiveFieldConfig> = {
  'identificationNumber': { encrypt: true, hash: true },
  'email': { encrypt: false, hash: false },
  'phone': { encrypt: true, hash: false },
  'address': { encrypt: true, hash: false },
  'bankAccountNumber': { encrypt: true, hash: true },
  'healthConditions': { encrypt: true, hash: false },
  'medicalNotes': { encrypt: true, hash: false },
};

export function encryptSensitiveWorkerField(
  workerId: string, 
  fieldName: string, 
  value: string
): string {
  if (!isEncryptionEnabled() || !value) {
    return value;
  }
  
  return encryptField(value, `worker:${fieldName}:${workerId}`);
}

export function decryptSensitiveWorkerField(
  workerId: string, 
  fieldName: string, 
  encryptedValue: string
): string {
  if (!isEncryptionEnabled() || !encryptedValue) {
    return encryptedValue;
  }
  
  return decryptField(encryptedValue, `worker:${fieldName}:${workerId}`);
}

export function encryptDocumentMetadata(
  documentId: string,
  metadata: Record<string, string>
): Record<string, string> {
  if (!isEncryptionEnabled()) {
    return metadata;
  }
  
  const encrypted: Record<string, string> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (value && typeof value === 'string') {
      encrypted[key] = encryptField(value, `document:${documentId}:${key}`);
    } else {
      encrypted[key] = value;
    }
  }
  return encrypted;
}

export function decryptDocumentMetadata(
  documentId: string,
  encryptedMetadata: Record<string, string>
): Record<string, string> {
  if (!isEncryptionEnabled()) {
    return encryptedMetadata;
  }
  
  const decrypted: Record<string, string> = {};
  for (const [key, value] of Object.entries(encryptedMetadata)) {
    if (value && typeof value === 'string') {
      decrypted[key] = decryptField(value, `document:${documentId}:${key}`);
    } else {
      decrypted[key] = value;
    }
  }
  return decrypted;
}

export function encryptCompanySensitiveData(
  companyId: string,
  fieldName: string,
  value: string
): string {
  if (!isEncryptionEnabled() || !value) {
    return value;
  }
  
  return encryptField(value, `company:${fieldName}:${companyId}`);
}

export function decryptCompanySensitiveData(
  companyId: string,
  fieldName: string,
  encryptedValue: string
): string {
  if (!isEncryptionEnabled() || !encryptedValue) {
    return encryptedValue;
  }
  
  return decryptField(encryptedValue, `company:${fieldName}:${companyId}`);
}

export function createSearchableHash(value: string, fieldType: string = 'default'): string {
  return hashSensitiveData(value.toLowerCase().trim(), `searchable:${fieldType}`);
}

export function maskSensitiveData(value: string, showLast: number = 4): string {
  if (!value || value.length <= showLast) {
    return value;
  }
  
  const visiblePart = value.slice(-showLast);
  const maskedPart = '*'.repeat(Math.min(value.length - showLast, 8));
  return maskedPart + visiblePart;
}
