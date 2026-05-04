'use client';

import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X as XIcon } from 'lucide-react';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface AvatarUploadProps {
  onImageChange?: (file: File | null) => void;
  initialImage?: string;
  userName?: string;
}

export function AvatarUpload({ onImageChange, initialImage, userName = '' }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(initialImage || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
        onImageChange?.(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (file) handleFileSelect(file);
  };

  const removeImage = () => {
    setPreview(null);
    onImageChange?.(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative w-32 h-32 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
          isDragging
            ? 'border-accent bg-accent/10'
            : 'border-border hover:border-accent/50'
        }`}
      >
        {preview ? (
          <div className="relative w-full h-full rounded-lg overflow-hidden">
            <Image
              src={preview}
              alt="Profile preview"
              fill
              className="object-cover"
            />
            <button
              onClick={removeImage}
              className="absolute top-1 right-1 p-1 bg-destructive rounded-lg text-white hover:bg-destructive/80 transition-colors"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            className="w-full h-full rounded-lg bg-gradient-to-br from-secondary/50 to-secondary/30 flex items-center justify-center flex-col gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-6 h-6 text-accent" />
            <span className="text-xs text-muted-foreground text-center px-2">
              {userName && userName[0] ? userName[0].toUpperCase() : 'U'}
            </span>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />
      </div>
      <div className="text-xs text-muted-foreground space-y-1">
        <p>Drag and drop your image or click to upload</p>
        <p>Supported formats: JPG, PNG, WebP (Max 5MB)</p>
      </div>
    </div>
  );
}
