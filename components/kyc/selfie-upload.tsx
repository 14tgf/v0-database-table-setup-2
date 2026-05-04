'use client';

import { motion } from 'framer-motion';
import { Camera, AlertCircle } from 'lucide-react';
import { staggerContainer, staggerItem } from '@/lib/animations';

export function SelfieUpload() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
    >
      <motion.h2 variants={staggerItem} className="text-lg font-bold text-foreground mb-2">
        Selfie Verification
      </motion.h2>
      <motion.p variants={staggerItem} className="text-xs text-muted-foreground mb-4">
        Take a selfie for identity verification. Your photo must match your ID document.
      </motion.p>

      {/* Guidelines */}
      <motion.div variants={staggerItem} className="mb-4 p-4 bg-blue-400/10 border border-blue-400/30 rounded-xl">
        <div className="flex gap-2">
          <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-400/90">
            <p className="font-semibold mb-1">Selfie Guidelines:</p>
            <ul className="space-y-0.5 text-blue-400/80">
              <li>• Face must be clearly visible and lit</li>
              <li>• No glasses or hat obscuring face</li>
              <li>• White or plain background preferred</li>
              <li>• Recent photo (taken within 30 days)</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Upload Options */}
      <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Webcam Option */}
        <motion.div variants={staggerItem} className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-accent/50 transition-all">
          <Camera className="w-8 h-8 text-accent mx-auto mb-2" />
          <p className="text-sm font-semibold text-foreground mb-1">Take Selfie</p>
          <p className="text-xs text-muted-foreground mb-3">Use your webcam</p>
          <button className="px-4 py-2 bg-accent text-background font-semibold rounded-lg hover:bg-accent/90 transition-colors text-xs">
            Open Camera
          </button>
        </motion.div>

        {/* Upload Option */}
        <motion.div variants={staggerItem} className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-accent/50 transition-all">
          <svg className="w-8 h-8 text-accent mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <p className="text-sm font-semibold text-foreground mb-1">Upload Selfie</p>
          <p className="text-xs text-muted-foreground mb-3">From your device</p>
          <label className="inline-block">
            <input type="file" accept="image/*" className="hidden" />
            <span className="px-4 py-2 bg-accent text-background font-semibold rounded-lg hover:bg-accent/90 transition-colors text-xs inline-block cursor-pointer">
              Choose Photo
            </span>
          </label>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
