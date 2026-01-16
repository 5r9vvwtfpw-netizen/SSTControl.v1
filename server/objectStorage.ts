import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Response } from "express";
import { randomUUID } from "crypto";
import { Readable } from "stream";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

function getBucketName(): string {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  if (!bucketName) {
    throw new Error(
      "AWS_S3_BUCKET_NAME not set. Please configure your S3 bucket name."
    );
  }
  return bucketName;
}

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class ObjectStorageService {
  private bucketName: string;

  constructor() {
    this.bucketName = getBucketName();
  }

  async uploadObject(objectPath: string, data: Buffer, contentType: string): Promise<string> {
    const key = `uploads/${objectPath}`;
    
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: data,
      ContentType: contentType,
    });

    await s3Client.send(command);
    
    return `/objects/${objectPath}`;
  }

  async getObjectEntityUploadURL(): Promise<string> {
    const objectId = randomUUID();
    const key = `uploads/${objectId}`;
    
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: "application/octet-stream",
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
    return signedUrl;
  }

  async getPresignedUploadUrl(fileName: string, contentType: string): Promise<{ uploadUrl: string; objectPath: string }> {
    const objectId = randomUUID();
    const extension = fileName.split('.').pop() || '';
    const key = `uploads/${objectId}${extension ? '.' + extension : ''}`;
    
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
    return { uploadUrl, objectPath: `/objects/${objectId}${extension ? '.' + extension : ''}` };
  }

  async downloadObject(objectPath: string, res: Response, cacheTtlSec: number = 3600): Promise<void> {
    try {
      const key = this.getKeyFromPath(objectPath);
      
      const headCommand = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      
      const headResponse = await s3Client.send(headCommand);
      
      const getCommand = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      
      const response = await s3Client.send(getCommand);
      
      res.set({
        "Content-Type": headResponse.ContentType || "application/octet-stream",
        "Content-Length": headResponse.ContentLength?.toString(),
        "Cache-Control": `private, max-age=${cacheTtlSec}`,
      });

      if (response.Body instanceof Readable) {
        response.Body.pipe(res);
      } else {
        const chunks: Uint8Array[] = [];
        const reader = response.Body as any;
        for await (const chunk of reader) {
          chunks.push(chunk);
        }
        res.send(Buffer.concat(chunks));
      }
    } catch (error: any) {
      if (error.name === "NoSuchKey" || error.$metadata?.httpStatusCode === 404) {
        throw new ObjectNotFoundError();
      }
      console.error("Error downloading file from S3:", error);
      throw error;
    }
  }

  async getObjectBuffer(objectPath: string): Promise<Buffer | null> {
    try {
      const key = this.getKeyFromPath(objectPath);
      console.log(`[ObjectStorage] getObjectBuffer - path: ${objectPath}, key: ${key}, bucket: ${this.bucketName}`);
      
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      
      const response = await s3Client.send(command);
      console.log(`[ObjectStorage] getObjectBuffer - S3 response received`);
      
      if (response.Body instanceof Readable) {
        const chunks: Buffer[] = [];
        for await (const chunk of response.Body) {
          chunks.push(Buffer.from(chunk));
        }
        return Buffer.concat(chunks);
      }
      
      return null;
    } catch (error: any) {
      if (error.name === "NoSuchKey" || error.$metadata?.httpStatusCode === 404) {
        return null;
      }
      console.warn(`Could not download object ${objectPath}:`, error);
      return null;
    }
  }

  async objectExists(objectPath: string): Promise<boolean> {
    try {
      const key = this.getKeyFromPath(objectPath);
      
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      
      await s3Client.send(command);
      return true;
    } catch (error: any) {
      if (error.name === "NoSuchKey" || error.$metadata?.httpStatusCode === 404 || error.name === "NotFound") {
        return false;
      }
      throw error;
    }
  }

  async deleteObject(objectPath: string): Promise<void> {
    const key = this.getKeyFromPath(objectPath);
    
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    
    await s3Client.send(command);
  }

  async deleteObjectByUrl(rawUrl: string): Promise<boolean> {
    if (!rawUrl) return false;
    
    try {
      const normalizedPath = this.normalizeObjectEntityPath(rawUrl);
      await this.deleteObject(normalizedPath);
      console.log("[Object Storage] Successfully deleted:", normalizedPath);
      return true;
    } catch (error) {
      console.error("[Object Storage] Error deleting by URL:", rawUrl, error);
      return false;
    }
  }

  async getPresignedDownloadUrl(objectPath: string, expiresIn: number = 3600): Promise<string> {
    const key = this.getKeyFromPath(objectPath);
    
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    
    return getSignedUrl(s3Client, command, { expiresIn });
  }

  normalizeObjectEntityPath(rawPath: string): string {
    if (rawPath.startsWith("https://") && rawPath.includes(".s3.")) {
      const url = new URL(rawPath);
      const key = url.pathname.slice(1);
      if (key.startsWith("uploads/")) {
        return `/objects/${key.slice(8)}`;
      }
      return `/objects/${key}`;
    }
    return rawPath;
  }

  private getKeyFromPath(objectPath: string): string {
    // Handle /objects/uploads/... path format - needs to map to uploads/uploads/... in S3
    // because files were uploaded with duplicate prefix
    if (objectPath.startsWith("/objects/uploads/")) {
      return `uploads${objectPath.slice(8)}`; // Remove "/objects" prefix, keep "/uploads/..."
    }
    // Handle /objects/... path format (needs uploads prefix)
    if (objectPath.startsWith("/objects/")) {
      return `uploads/${objectPath.slice(9)}`;
    }
    if (objectPath.startsWith("uploads/")) {
      return objectPath;
    }
    return `uploads/${objectPath}`;
  }
}

export const objectStorageService = new ObjectStorageService();
