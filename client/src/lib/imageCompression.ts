import imageCompression from 'browser-image-compression';

interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
}

const defaultOptions: CompressionOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1024,
  useWebWorker: true,
};

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const mergedOptions = { ...defaultOptions, ...options };
  
  if (!file.type.startsWith('image/')) {
    return file;
  }
  
  const fileSizeMB = file.size / 1024 / 1024;
  if (fileSizeMB <= (mergedOptions.maxSizeMB || 1)) {
    return file;
  }
  
  try {
    const compressedFile = await imageCompression(file, {
      maxSizeMB: mergedOptions.maxSizeMB,
      maxWidthOrHeight: mergedOptions.maxWidthOrHeight,
      useWebWorker: mergedOptions.useWebWorker,
    });
    
    return new File([compressedFile], file.name, {
      type: compressedFile.type,
      lastModified: Date.now(),
    });
  } catch (error) {
    console.warn('Image compression failed, using original file:', error);
    return file;
  }
}

export async function compressLogoImage(file: File): Promise<File> {
  return compressImage(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 512,
  });
}

export async function compressSignatureImage(file: File): Promise<File> {
  return compressImage(file, {
    maxSizeMB: 0.3,
    maxWidthOrHeight: 400,
  });
}

export async function compressWorkerPhoto(file: File): Promise<File> {
  return compressImage(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 600,
  });
}
