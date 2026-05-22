'use client';

import { useState, useCallback } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface FileUploadProps {
  uploadType: 'deposit-proof' | 'kyc-verification' | 'gift-card-proof' | 'crypto-proof' | 'document';
  onUploadComplete?: (success: boolean, message?: string) => void;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
  description?: string;
  additionalData?: Record<string, string>;
}

export function FileUploadComponent({
  uploadType,
  onUploadComplete,
  multiple = true,
  maxFiles = 5,
  maxSizeMB = 5,
  description,
  additionalData = {},
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const maxTotalSizeBytes = maxSizeMB * 1024 * 1024;

  const validateFiles = (filesToValidate: File[]): string | null => {
    // Check total file count
    if (filesToValidate.length > maxFiles) {
      return `Maximum ${maxFiles} files allowed`;
    }

    // Check each file
    for (const file of filesToValidate) {
      if (file.size === 0) {
        return `File ${file.name} is empty`;
      }
      if (file.size > maxTotalSizeBytes) {
        return `File ${file.name} exceeds ${maxSizeMB}MB limit`;
      }

      // Check MIME type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        return `File ${file.name} has unsupported type: ${file.type}`;
      }
    }

    return null;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const validationError = validateFiles(droppedFiles);
      if (validationError) {
        setError(validationError);
        return;
      }
      setFiles(droppedFiles);
      setError(null);
      setSuccess(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const validationError = validateFiles(selectedFiles);
      if (validationError) {
        setError(validationError);
        return;
      }
      setFiles(selectedFiles);
      setError(null);
      setSuccess(false);
    }
  };

  const handleUpload = useCallback(async () => {
    if (files.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      console.log('[v0] FileUploadComponent - Starting upload for type:', uploadType);
      console.log('[v0] FileUploadComponent - Files:', files.length);

      const formData = new FormData();
      formData.append('uploadType', uploadType);

      // Add all files
      files.forEach(file => {
        formData.append('files', file);
      });

      // Add additional data
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      console.log('[v0] FileUploadComponent - Sending to /api/upload/files');

      const response = await fetch('/api/upload/files', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      console.log('[v0] FileUploadComponent - Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      console.log('[v0] FileUploadComponent - Upload successful:', result);

      setSuccess(true);
      setFiles([]);
      onUploadComplete?.(true, result.message);

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed';
      console.error('[v0] FileUploadComponent - Upload error:', errorMsg);
      setError(errorMsg);
      onUploadComplete?.(false, errorMsg);
    } finally {
      setUploading(false);
    }
  }, [files, uploadType, additionalData, onUploadComplete]);

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleClear = () => {
    setFiles([]);
    setError(null);
    setSuccess(false);
  };

  return (
    <div className="w-full space-y-4">
      {/* Upload Area */}
      {files.length === 0 ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400'
          }`}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="font-semibold text-gray-700 mb-1">Drop files here or click to upload</p>
          <p className="text-sm text-gray-500 mb-4">
            Supported: PNG, JPG, JPEG, WEBP, PDF (Max {maxSizeMB}MB per file)
          </p>
          <label className="inline-block">
            <input
              type="file"
              onChange={handleChange}
              multiple={multiple}
              accept=".png,.jpg,.jpeg,.webp,.pdf"
              className="hidden"
            />
            <span className="px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 transition-colors cursor-pointer inline-block">
              Choose Files
            </span>
          </label>
          {description && <p className="text-xs text-gray-600 mt-3">{description}</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {files.map((file, index) => (
            <div
              key={index}
              className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-3 flex-1">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRemoveFile(index)}
                className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                disabled={uploading}
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          ))}

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleUpload}
              disabled={uploading || files.length === 0}
              className="flex-1 px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload Files
                </>
              )}
            </button>
            <button
              onClick={handleClear}
              disabled={uploading}
              className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded hover:bg-gray-300 disabled:opacity-50 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-green-900">Upload Successful</p>
            <p className="text-sm text-green-700">Your files have been sent to admin for review.</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">Upload Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
