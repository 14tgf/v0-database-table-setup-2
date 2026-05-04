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
      className="bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
    >
      <motion.h2 variants={staggerItem} className="text-lg font-bold text-foreground mb-4">
        Submission
      </motion.h2>

      {/* Terms and Conditions */}
      <motion.div variants={staggerItem} className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" className="mt-1 rounded border-white/20" />
          <span className="text-xs text-muted-foreground">
            I certify that the information provided is accurate and I authorize verification of my identity. I understand that providing false information may result in account suspension.
          </span>
        </label>
      </motion.div>

      {/* Timeline */}
      <motion.div variants={staggerItem} className="mb-6">
        <p className="text-xs font-semibold text-muted-foreground mb-3">Verification Timeline:</p>
        <div className="space-y-2">
          {['Submitted', 'Under Review', 'Approved'].map((step, idx) => (
            <div key={step} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                idx === 0 ? 'bg-accent text-background' : 'bg-white/10 text-white/50'
              }`}>
                {idx === 0 ? <CheckCircle className="w-4 h-4" /> : idx + 1}
              </div>
              <span className="text-xs text-muted-foreground">{step}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div variants={staggerItem} className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button className="px-4 py-2.5 bg-white/5 border border-white/10 text-foreground font-semibold rounded-lg hover:bg-white/10 transition-colors text-sm">
          Save Draft
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitted}
          className={`px-4 py-2.5 font-semibold rounded-lg text-sm transition-all ${
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
