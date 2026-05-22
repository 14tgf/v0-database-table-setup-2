/**
 * File validation utilities for secure upload handling
 */

// Allowed MIME types for uploads
export const ALLOWED_MIME_TYPES = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
} as const;

// Dangerous file types that should be rejected
const DANGEROUS_EXTENSIONS = [
  'exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js', 'jse', 'msi',
  'zip', 'rar', '7z', 'gz', 'tar', 'jar',
  'html', 'htm', 'php', 'asp', 'aspx', 'py', 'pl', 'sh',
  'svg', 'svgz', 'dmg', 'iso', 'bin', 'app',
];

const DANGEROUS_MIME_TYPES = [
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-executable',
  'application/x-elf',
  'application/x-bash',
  'application/x-sh',
  'application/x-shellscript',
  'text/x-shellscript',
  'text/x-php',
  'text/x-python',
  'text/javascript',
  'application/javascript',
  'text/html',
  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  'image/svg+xml',
];

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export interface UploadedFile {
  originalName: string;
  sanitizedName: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
}

/**
 * Validate file before upload
 */
export function validateFile(file: File, maxSizeMB: number = 5): FileValidationResult {
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size === 0) {
    return { valid: false, error: 'File is empty' };
  }
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `File size exceeds ${maxSizeMB}MB limit` };
  }

  // Check MIME type
  const mimeType = file.type;
  if (!Object.keys(ALLOWED_MIME_TYPES).includes(mimeType)) {
    return { valid: false, error: `File type ${mimeType} is not allowed` };
  }

  if (DANGEROUS_MIME_TYPES.includes(mimeType)) {
    return { valid: false, error: 'Dangerous file type detected' };
  }

  // Check file extension
  const fileName = file.name.toLowerCase();
  const fileExtension = fileName.split('.').pop() || '';
  
  if (DANGEROUS_EXTENSIONS.includes(fileExtension)) {
    return { valid: false, error: 'Dangerous file extension detected' };
  }

  // Validate extension matches MIME type
  const allowedExtensions = ALLOWED_MIME_TYPES[mimeType as keyof typeof ALLOWED_MIME_TYPES];
  if (!allowedExtensions.some(ext => fileName.endsWith(ext))) {
    return { valid: false, error: 'File extension does not match MIME type' };
  }

  return { valid: true };
}

/**
 * Sanitize filename to prevent security issues
 */
export function sanitizeFilename(filename: string): string {
  // Remove path components
  let sanitized = filename.split(/[\/\\]/).pop() || 'file';
  
  // Remove dangerous characters but keep spaces and common punctuation
  sanitized = sanitized.replace(/[^a-zA-Z0-9._\- ]/g, '');
  
  // Remove leading/trailing spaces and dots
  sanitized = sanitized.trim().replace(/^\.+/, '').replace(/\.+$/, '');
  
  // Replace multiple spaces with single space
  sanitized = sanitized.replace(/\s+/g, ' ');
  
  // Add timestamp to ensure uniqueness
  const timestamp = Date.now();
  const extension = sanitized.split('.').pop();
  const nameWithoutExt = sanitized.replace(`.${extension}`, '');
  
  return `${nameWithoutExt.slice(0, 50)}-${timestamp}.${extension}`;
}

/**
 * Get appropriate MIME type for attachment
 */
export function getMimeType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();
  
  switch (ext) {
    case 'pdf':
      return 'application/pdf';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'webp':
      return 'image/webp';
    default:
      return 'application/octet-stream';
  }
}
