---
name: Logo upload WebP bug
description: Root cause of silent logo upload failures — multer MIME filter vs browser-image-compression output format
---

# Logo upload — multer MIME type mismatch with browser-image-compression

## The Rule
The multer `fileFilter` for logo/signature uploads must accept `image/webp` (and any `image/*`), not just `jpeg/png/svg`.

**Why:** `browser-image-compression` v2.0.x uses the browser's canvas API to compress images. On modern Chrome and Firefox, `canvas.toBlob()` can output `image/webp` even when the input was a PNG or JPEG. The old filter allowed only `image/jpeg, image/png, image/svg+xml`, so WebP output was rejected by multer → multer threw an error → route handler never ran → frontend caught the error and showed "con advertencias" (or silently set `logoUploadFailed = true`).

## How to Apply
- Server `uploadLogo` and `uploadSignature` multer configs: use `file.mimetype.startsWith('image/')` check, NOT a whitelist of specific types.
- Client `compressImage()`: pass `fileType: file.type` option to `imageCompression()` to force same output format as input (prevents format changes). Also preserve `file.type` when creating the output `File` object.
- Server logo route: derive file extension from MIME type (`mimeToExt` map), NOT from `req.file.originalname`, since the format may have changed during compression.
- SVG files: skip compression on client (SVG is vector, can't be compressed via canvas). Server accepts SVG upload but PDFKit cannot render SVG → shows "LOGO" placeholder. Consider rejecting SVG on server if PDF rendering is needed.

## Files Changed
- `server/routes.ts` — `uploadLogo` and `uploadSignature` multer fileFilter, logo route extension derivation
- `client/src/lib/imageCompression.ts` — added `fileType: file.type` option, preserve `file.type` in output File
- `client/src/pages/CompanyManagement.tsx` — improved error messages (show actual error text, use destructive variant)
