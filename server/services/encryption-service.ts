import {
  encryptField,
  decryptField,
  isEncryptionEnabled,
  createSearchableHash
} from '../lib/crypto';

const WORKER_ENCRYPTED_FIELDS = [
  'name',
  'identificationNumber',
  'phone',
  'address', 
  'healthConditions',
  'medicalHistory',
  'emergencyContactPhone',
  'emergencyContactName',
  'bankAccountNumber',
  'observations',
  'birthDate',
  'bloodType',
  'allergies',
  'medications',
  'disabilities'
] as const;

const COMPANY_ENCRYPTED_FIELDS = [
  'nit',
  'address',
  'phone',
  'legalRepresentativeName',
  'legalRepresentativeId',
  'legalRepresentativePhone',
  'legalRepresentativeEmail'
] as const;

const EVALUATION_RESULT_FIELDS = [
  'observations',
  'findings',
  'recommendations',
  'evidenceNotes',
  'actionPlan',
  'complianceNotes',
  'auditNotes'
] as const;

const DOCUMENT_ENCRYPTED_FIELDS = [
  'fileName',
  'description',
  'observations'
] as const;

type WorkerEncryptedField = typeof WORKER_ENCRYPTED_FIELDS[number];
type CompanyEncryptedField = typeof COMPANY_ENCRYPTED_FIELDS[number];

export function encryptWorkerData<T extends Record<string, any>>(
  workerId: string,
  data: T
): T {
  if (!isEncryptionEnabled()) {
    return data;
  }

  const encrypted: Record<string, any> = { ...data };
  
  for (const field of WORKER_ENCRYPTED_FIELDS) {
    if (field in encrypted && encrypted[field] && typeof encrypted[field] === 'string') {
      encrypted[field] = encryptField(encrypted[field], `worker:${field}:${workerId}`);
    }
  }
  
  return encrypted as T;
}

export function decryptWorkerData<T extends Record<string, any>>(
  workerId: string,
  data: T
): T {
  if (!isEncryptionEnabled()) {
    return data;
  }

  const decrypted: Record<string, any> = { ...data };
  
  for (const field of WORKER_ENCRYPTED_FIELDS) {
    if (field in decrypted && decrypted[field] && typeof decrypted[field] === 'string') {
      decrypted[field] = decryptField(decrypted[field], `worker:${field}:${workerId}`);
    }
  }
  
  return decrypted as T;
}

export function encryptCompanyData<T extends Record<string, any>>(
  companyId: string,
  data: T
): T {
  if (!isEncryptionEnabled()) {
    return data;
  }

  const encrypted: Record<string, any> = { ...data };
  
  for (const field of COMPANY_ENCRYPTED_FIELDS) {
    if (field in encrypted && encrypted[field] && typeof encrypted[field] === 'string') {
      encrypted[field] = encryptField(encrypted[field], `company:${field}:${companyId}`);
    }
  }
  
  return encrypted as T;
}

export function decryptCompanyData<T extends Record<string, any>>(
  companyId: string,
  data: T
): T {
  if (!isEncryptionEnabled()) {
    return data;
  }

  const decrypted: Record<string, any> = { ...data };
  
  for (const field of COMPANY_ENCRYPTED_FIELDS) {
    if (field in decrypted && decrypted[field] && typeof decrypted[field] === 'string') {
      decrypted[field] = decryptField(decrypted[field], `company:${field}:${companyId}`);
    }
  }
  
  return decrypted as T;
}

export function encryptDocumentData<T extends Record<string, any>>(
  documentId: string,
  data: T
): T {
  if (!isEncryptionEnabled()) {
    return data;
  }

  const encrypted: Record<string, any> = { ...data };
  
  for (const field of DOCUMENT_ENCRYPTED_FIELDS) {
    if (field in encrypted && encrypted[field] && typeof encrypted[field] === 'string') {
      encrypted[field] = encryptField(encrypted[field], `document:${field}:${documentId}`);
    }
  }
  
  return encrypted as T;
}

export function decryptDocumentData<T extends Record<string, any>>(
  documentId: string,
  data: T
): T {
  if (!isEncryptionEnabled()) {
    return data;
  }

  const decrypted: Record<string, any> = { ...data };
  
  for (const field of DOCUMENT_ENCRYPTED_FIELDS) {
    if (field in decrypted && decrypted[field] && typeof decrypted[field] === 'string') {
      decrypted[field] = decryptField(decrypted[field], `document:${field}:${documentId}`);
    }
  }
  
  return decrypted as T;
}

export function encryptEvaluationResults<T extends Record<string, any>>(
  evaluationId: string,
  data: T
): T {
  if (!isEncryptionEnabled()) {
    return data;
  }

  const encrypted: Record<string, any> = { ...data };
  
  for (const field of EVALUATION_RESULT_FIELDS) {
    if (field in encrypted && encrypted[field] && typeof encrypted[field] === 'string') {
      encrypted[field] = encryptField(encrypted[field], `evaluation:${field}:${evaluationId}`);
    }
  }
  
  return encrypted as T;
}

export function decryptEvaluationResults<T extends Record<string, any>>(
  evaluationId: string,
  data: T
): T {
  if (!isEncryptionEnabled()) {
    return data;
  }

  const decrypted: Record<string, any> = { ...data };
  
  for (const field of EVALUATION_RESULT_FIELDS) {
    if (field in decrypted && decrypted[field] && typeof decrypted[field] === 'string') {
      decrypted[field] = decryptField(decrypted[field], `evaluation:${field}:${evaluationId}`);
    }
  }
  
  return decrypted as T;
}

export function encryptTokenData(token: string, tokenType: string): string {
  if (!isEncryptionEnabled() || !token) {
    return token;
  }
  
  return encryptField(token, `token:${tokenType}`);
}

export function decryptTokenData(encryptedToken: string, tokenType: string): string {
  if (!isEncryptionEnabled() || !encryptedToken) {
    return encryptedToken;
  }
  
  return decryptField(encryptedToken, `token:${tokenType}`);
}

export function hashIdentifier(value: string, type: string): string {
  return createSearchableHash(value, type);
}

export function hashWorkerIdentification(identificationNumber: string): string {
  return createSearchableHash(identificationNumber, 'worker:identification');
}

export function hashCompanyNit(nit: string): string {
  return createSearchableHash(nit, 'company:nit');
}

export function hashWorkerName(name: string): string {
  return createSearchableHash(name.toLowerCase(), 'worker:name');
}

export const EncryptionService = {
  encryptWorkerData,
  decryptWorkerData,
  encryptCompanyData,
  decryptCompanyData,
  encryptDocumentData,
  decryptDocumentData,
  encryptEvaluationResults,
  decryptEvaluationResults,
  encryptTokenData,
  decryptTokenData,
  hashIdentifier,
  hashWorkerIdentification,
  hashCompanyNit,
  hashWorkerName,
  isEnabled: isEncryptionEnabled
};
