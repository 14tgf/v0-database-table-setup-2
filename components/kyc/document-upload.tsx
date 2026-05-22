'use client';

import { motion } from 'framer-motion';
import { Upload, X as XIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface DocumentUploadProps {
  title: string;
  description: string;
  acceptedFormats: string[];
  documentTypes: string[];
  onUploadComplete?: (base64: string, filename: string) => void;
  uploadingTo?: string;
}

export function DocumentUpload({ 
  title, 
  description, 
  acceptedFormats, 
  documentTypes,
  onUploadComplete,
  uploadingTo = 'id_front'
}: DocumentUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);

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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = async (file: File) => {
    setUploadedFile(file);
    setUploadError(null);
    setUploadedBase64(null);

    // Convert to base64
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');
      
      setUploadedBase64(base64);
      onUploadComplete?.(base64, file.name);
      console.log(`[v0] Document '${file.name}' converted to base64, size: ${base64.length}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Conversion failed';
      console.error('[v0] Failed to convert document to base64:', errorMsg);
      setUploadError(errorMsg);
    }
  };

  const handleRemove = () => {
    setUploadedFile(null);
    setUploadedBase64(null);
    setUploadError(null);
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 border border-white/10 rounded-lg p-4 backdrop-blur-sm"
    >
      <motion.h2 variants={staggerItem} className="text-base font-bold text-foreground mb-1">
        {title}
      </motion.h2>
      <motion.p variants={staggerItem} className="text-xs text-muted-foreground mb-3">
        {description}
      </motion.p>

      {/* Document Types */}
      <motion.div variants={staggerItem} className="mb-3">
        <p className="text-xs font-semibold text-muted-foreground mb-1">Accepted document types:</p>
        <div className="flex flex-wrap gap-1.5">
          {documentTypes.map((type) => (
            <span key={type} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-xs text-muted-foreground">
              {type}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Upload Area */}
      <motion.div variants={staggerItem}>
        {!uploadedBase64 ? (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-4 text-center transition-all ${
              dragActive ? 'border-accent bg-accent/5' : 'border-white/20 hover:border-accent/50'
            }`}
          >
            <Upload className="w-6 h-6 text-accent mx-auto mb-1" />
            <p className="text-xs font-semibold text-foreground mb-0.5">Drop files here or click to upload</p>
            <p className="text-xs text-muted-foreground mb-2">Supported formats: {acceptedFormats.join(', ')}</p>
            <label className="inline-block">
              <input
                type="file"
                onChange={handleChange}
                accept={acceptedFormats.join(',')}
                className="hidden"
              />
              <span className="px-3 py-1.5 bg-accent text-background font-semibold rounded hover:bg-accent/90 transition-colors cursor-pointer text-xs inline-block">
                Choose File
              </span>
            </label>
          </div>
        ) : (
          <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-foreground">{uploadedFile?.name}</p>
              <p className="text-xs text-muted-foreground">
                {uploadedFile ? (uploadedFile.size / 1024 / 1024).toFixed(2) : '0'} MB • Ready to send
              </p>
            </div>
            <button
              onClick={handleRemove}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <XIcon className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
        )}
      </motion.div>

      {/* Error Message */}
      {uploadError && (
        <motion.div variants={staggerItem} className="mt-3 p-2 bg-red-400/10 border border-red-400/30 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-300">{uploadError}</p>
        </motion.div>
      )}
    </motion.div>
  );
}

