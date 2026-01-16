export {
  initializeMasterKey,
  isEncryptionEnabled,
  encrypt,
  decrypt,
  encryptField,
  decryptField,
  encryptToken,
  decryptToken,
  encryptPII,
  decryptPII,
  generateMasterKeyForSetup,
  hashSensitiveData,
  type EncryptedData
} from './encryption';

export {
  encryptSensitiveWorkerField,
  decryptSensitiveWorkerField,
  encryptDocumentMetadata,
  decryptDocumentMetadata,
  encryptCompanySensitiveData,
  decryptCompanySensitiveData,
  createSearchableHash,
  maskSensitiveData,
  SENSITIVE_FIELDS,
  type SensitiveFieldConfig
} from './sensitive-fields';
