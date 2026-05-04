'use client';

import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface SubmitVerificationProps {
  onSubmit?: () => void;
  status?: 'not_started' | 'pending_review' | 'verified' | 'rejected';
}

export function SubmitVerification({ onSubmit, status = 'not_started' }: SubmitVerificationProps) {
  const isSubmitted = status === 'pending_review' || status === 'verified';

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 border border-white/10 rounded-lg p-4 backdrop-blur-sm"
    >
      <motion.h2 variants={staggerItem} className="text-base font-bold text-foreground mb-3">
        Submission
      </motion.h2>

      {/* Terms and Conditions */}
      <motion.div variants={staggerItem} className="mb-3 p-3 bg-white/5 border border-white/10 rounded-lg">
        <label className="flex items-start gap-2 cursor-pointer">
          <input type="checkbox" className="mt-0.5 rounded border-white/20" />
          <span className="text-xs text-muted-foreground">
            I certify that the information provided is accurate and I authorize verification of my identity. I understand that providing false information may result in account suspension.
          </span>
        </label>
      </motion.div>

      {/* Timeline */}
      <motion.div variants={staggerItem} className="mb-3">
        <p className="text-xs font-semibold text-muted-foreground mb-2">Verification Timeline:</p>
        <div className="space-y-1">
          {['Submitted', 'Under Review', 'Approved'].map((step, idx) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold ${
                idx === 0 ? 'bg-accent text-background' : 'bg-white/10 text-white/50'
              }`}>
                {idx === 0 ? <CheckCircle className="w-3 h-3" /> : idx + 1}
              </div>
              <span className="text-xs text-muted-foreground">{step}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div variants={staggerItem} className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <button className="px-3 py-2 bg-white/5 border border-white/10 text-foreground font-semibold rounded hover:bg-white/10 transition-colors text-xs">
          Save Draft
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitted}
          className={`px-3 py-2 font-semibold rounded text-xs transition-all ${
            isSubmitted
              ? 'bg-white/10 text-muted-foreground cursor-not-allowed'
              : 'bg-accent text-background hover:bg-accent/90'
          }`}
        >
          {isSubmitted ? 'Already Submitted' : 'Submit Verification'}
        </button>
      </motion.div>
    </motion.div>
  );
}
