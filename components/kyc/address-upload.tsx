'use client';

import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/animations';

export function AddressUpload() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
    >
      <motion.h2 variants={staggerItem} className="text-lg font-bold text-foreground mb-2">
        Address Verification
      </motion.h2>
      <motion.p variants={staggerItem} className="text-xs text-muted-foreground mb-4">
        Upload a document that proves your residential address. Must be dated within the last 3 months.
      </motion.p>

      {/* Supported Documents Info */}
      <motion.div variants={staggerItem} className="mb-4 p-4 bg-white/5 border border-white/10 rounded-xl">
        <p className="text-xs font-semibold text-foreground mb-2">Accepted documents:</p>
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li>• Utility Bill (electricity, gas, water)</li>
          <li>• Bank Statement</li>
          <li>• Government Letter</li>
          <li>• Official Residence Document</li>
        </ul>
        <p className="text-xs text-accent font-semibold mt-3">Document must be from the last 3 months</p>
      </motion.div>

      {/* Upload Area */}
      <motion.div variants={staggerItem} className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-accent/50 transition-all">
        <p className="text-sm font-semibold text-foreground mb-2">Upload Address Proof</p>
        <p className="text-xs text-muted-foreground mb-3">PDF, JPG, PNG up to 10MB</p>
        <label className="inline-block">
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" />
          <span className="px-4 py-2 bg-accent text-background font-semibold rounded-lg hover:bg-accent/90 transition-colors cursor-pointer text-xs inline-block">
            Upload Document
          </span>
        </label>
      </motion.div>
    </motion.div>
  );
}
