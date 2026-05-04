'use client';

import { motion } from 'framer-motion';
import { Upload, X as XIcon, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface DocumentUploadProps {
  title: string;
  description: string;
  acceptedFormats: string[];
  documentTypes: string[];
}

export function DocumentUpload({ title, description, acceptedFormats, documentTypes }: DocumentUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

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
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
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
        {!uploadedFile ? (
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
              <p className="text-xs font-semibold text-foreground">{uploadedFile.name}</p>
              <p className="text-xs text-muted-foreground">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button
              onClick={() => setUploadedFile(null)}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <XIcon className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
