---
name: Storage Architecture — S3 vs Replit Object Storage
description: Which storage backend to use for file uploads vs why GCS/Replit Object Storage should NOT be used in this project.
---

# Storage Architecture Rule

## Rule
All file uploads (logos, legal rep signatures, LSO signatures, evidence files) MUST use **AWS S3** via `server/objectStorage.ts` (`ObjectStorageService`). Replit Object Storage (GCS sidecar) is dev-environment infrastructure only and must NOT be used for persistent application data.

**Why:** The production environment uses AWS RDS + AWS S3. Replit Object Storage (GCS via sidecar) is only the dev container's default storage and is not available or consistent in production. Files stored in GCS sidecar are lost between deploys.

**How to apply:**
- Uploads: `storageService.uploadObject(objectPath, req.file.buffer, mimetype)` — uses `multer.memoryStorage()`, no disk temp file needed
- Returns URL: `/objects/${objectPath}`
- Download route already exists: `GET /objects/*` → `objectStorageService.downloadObject()`
- Buffer for PDFs: `objectStorageService.getObjectBuffer(sigUrl)` 
- For backward compat only: keep GCS fallback in `getSignatureBuffer` and `loadCompanyLogoBuffer` for pre-existing legacy paths (`/replit-objstore-...`)

## What was done
- `uploadLogo` multer: changed from `diskStorage` → `memoryStorage`
- `uploadSignature` multer: changed from `diskStorage` → `memoryStorage`  
- Logo upload route: uses `req.file.buffer` → S3
- Signature upload route: uses `req.file.buffer` → S3
- LSO `uploadSignatureToObjectStorage`: changed from GCS → S3 (`/objects/lso-signatures/...`)
- `getSignatureBuffer` + `isSignatureAccessible`: S3 primary, GCS legacy fallback
- `loadCompanyLogoBuffer`: handles `/replit-objstore-...` (legacy), `/objects/...` (S3), filesystem
