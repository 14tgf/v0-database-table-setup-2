/**
 * File processing utilities to convert uploaded files to buffers
 */

import { validateFile, sanitizeFilename, getMimeType } from './file-validator';

export interface ProcessedFile {
  originalName: string;
  sanitizedName: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
}

/**
 * Process a File object into buffer format for email attachment
 */
export async function processFileForEmail(file: File): Promise<ProcessedFile> {
  console.log('[v0] processFileForEmail - Processing file:', file.name, 'Size:', file.size, 'Type:', file.type);

  // Validate file
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'File validation failed');
  }

  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const sanitized = sanitizeFilename(file.name);
  const mimeType = getMimeType(file.name);

  console.log('[v0] processFileForEmail - File processed successfully:', {
    originalName: file.name,
    sanitizedName: sanitized,
    mimeType,
    size: buffer.length,
  });

  return {
    originalName: file.name,
    sanitizedName: sanitized,
    mimeType,
    size: buffer.length,
    buffer,
  };
}

/**
 * Process multiple files
 */
export async function processFilesForEmail(files: File[]): Promise<ProcessedFile[]> {
  console.log('[v0] processFilesForEmail - Processing', files.length, 'files');

  const processed: ProcessedFile[] = [];

  for (const file of files) {
    try {
      const processedFile = await processFileForEmail(file);
      processed.push(processedFile);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.warn('[v0] processFilesForEmail - Failed to process file:', file.name, '-', errorMsg);
      // Continue processing other files, skip this one
    }
  }

  return processed;
}

/**
 * Create a summary of uploaded files for email display
 */
export function createFileSummary(files: ProcessedFile[]): string {
  if (files.length === 0) {
    return '<p><em>No files attached</em></p>';
  }

  const fileList = files
    .map(f => `<li><strong>${f.originalName}</strong> (${(f.size / 1024).toFixed(2)} KB)</li>`)
    .join('');

  return `
    <p><strong>Uploaded Files:</strong></p>
    <ul>${fileList}</ul>
    <p><em>${files.length} file(s) attached to this email</em></p>
  `;
}
