'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Loader } from 'lucide-react';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { useState } from 'react';

interface SubmitVerificationProps {
  status?: 'not_started' | 'pending_review' | 'verified' | 'rejected';
  formData: Record<string, string>;
  userId?: string;
  onSubmitSuccess?: () => void;
}

export function SubmitVerification({ 
  status = 'not_started', 
  formData,
  userId,
  onSubmitSuccess 
}: SubmitVerificationProps) {
  const isSubmitted = status === 'pending_review' || status === 'verified';
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = async () => {
    if (!agreed) {
      setError('Please agree to the terms and conditions');
      return;
    }

    if (!userId) {
      setError('User ID is missing');
      return;
    }

    // Validate required fields
    const fullName = `${formData.firstName || ''} ${formData.lastName || ''}`.trim();
    if (!fullName || !formData.dateOfBirth || !formData.phoneNumber) {
      setError('Please fill in all required personal information fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/kyc/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          full_name: fullName,
          id_type: 'passport', // Default for now
          id_number: '123456', // Placeholder - should come from document upload component
          id_front_image: formData.idFrontImage || null,
          id_back_image: formData.idBackImage || null,
          selfie_image: formData.selfieImage || null,
          address_document: formData.addressDocument || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to submit KYC');
      }

      console.log('[v0] KYC submitted successfully:', data);
      onSubmitSuccess?.();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('[v0] Submit KYC error:', error);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

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

      {/* Error Message */}
      {error && (
        <motion.div variants={staggerItem} className="mb-3 p-3 bg-red-400/10 border border-red-400/30 rounded-lg">
          <p className="text-xs text-red-300">{error}</p>
        </motion.div>
      )}

      {/* Terms and Conditions */}
      <motion.div variants={staggerItem} className="mb-3 p-3 bg-white/5 border border-white/10 rounded-lg">
        <label className="flex items-start gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 rounded border-white/20" 
          />
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
          onClick={handleSubmit}
          disabled={isSubmitted || isLoading}
          className={`px-3 py-2 font-semibold rounded text-xs transition-all flex items-center justify-center gap-2 ${
            isSubmitted || isLoading
              ? 'bg-white/10 text-muted-foreground cursor-not-allowed'
              : 'bg-accent text-background hover:bg-accent/90'
          }`}
        >
          {isLoading ? (
            <>
              <Loader className="w-3 h-3 animate-spin" />
              Submitting...
            </>
          ) : isSubmitted ? (
            'Already Submitted'
          ) : (
            'Submit Verification'
          )}
        </button>
      </motion.div>
    </motion.div>
  );
}
