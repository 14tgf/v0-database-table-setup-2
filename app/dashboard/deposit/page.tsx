'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { PaymentMethodSelector } from '@/components/payments/payment-method-selector';
import { CryptoForm } from '@/components/payments/crypto-form';
import { PayPalForm } from '@/components/payments/paypal-form';
import { GiftCardForm } from '@/components/payments/giftcard-form';
import { staggerContainer, staggerItem } from '@/lib/animations';

export default function DepositPage() {
  const [selectedMethod, setSelectedMethod] = useState('crypto');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = [
    { id: 'crypto', label: 'Cryptocurrency', description: 'BTC, USDT, ETH' },
    { id: 'paypal', label: 'PayPal', description: 'Fast & secure' },
    { id: 'giftcard', label: 'Gift Card', description: 'Physical or E-Gift' },
  ];

  const handleSubmit = async (data: any) => {
    console.log('[v0] Deposit submission started:', data);
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate amount
      const amount = data?.amount;
      if (!amount || amount <= 0) {
        throw new Error('Please enter a valid deposit amount');
      }

      // Determine method name and prepare payload
      let methodName = '';
      let payload: any = {};

      if (selectedMethod === 'crypto') {
        methodName = data.cryptoType || 'BTC';
        console.log('[v0] Crypto deposit - Type:', methodName, 'Amount:', amount);
        payload = {
          method_name: methodName,
          amount: amount,
          tx_hash: null,
          proof_upload: null,
          note: `Deposit of $${amount} USD via ${methodName}`,
        };
      } else if (selectedMethod === 'paypal') {
        methodName = 'paypal';
        payload = {
          method_name: methodName,
          amount: amount,
          tx_hash: null,
          proof_upload: null,
          note: `Deposit of $${amount} USD via PayPal`,
        };
      } else if (selectedMethod === 'giftcard') {
        methodName = 'giftcard';
        payload = {
          method_name: methodName,
          amount: amount,
          tx_hash: null,
          proof_upload: null,
          note: `Deposit of $${amount} USD via Gift Card`,
        };
      }

      console.log('[v0] Calling deposit API with payload:', payload);

      const response = await fetch('/api/deposits/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      console.log('[v0] API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[v0] API error response:', errorData);
        console.error('[v0] API error details:', errorData.details);
        
        // Display detailed error if available
        const detailedError = errorData.details 
          ? `${errorData.error}\n\nDetails: ${JSON.stringify(errorData.details, null, 2)}`
          : errorData.error;
        
        throw new Error(detailedError || 'Failed to submit deposit');
      }

      const result = await response.json();
      console.log('[v0] Deposit submitted successfully:', result);

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setSelectedMethod('crypto');
      }, 5000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('[v0] Deposit submission error:', errorMsg);
      setError(`Failed to submit deposit: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <Link href="/dashboard" className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <h1 className="text-lg font-bold text-foreground">Deposit Funds</h1>
            <div className="w-16" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-24">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 bg-red-400/10 border border-red-400/30 rounded-lg flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-red-400">Deposit Submission Failed</p>
                <p className="text-xs text-red-400/80 mt-1">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Success Message */}
          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 bg-green-400/10 border border-green-400/30 rounded-lg flex items-start gap-3"
            >
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-green-400">Deposit Request Submitted</p>
                <p className="text-xs text-green-400/80 mt-1">Your deposit is pending admin approval. You'll be notified once processed.</p>
              </div>
            </motion.div>
          )}

          {/* Method Selector */}
          <motion.div variants={staggerItem}>
            <PaymentMethodSelector
              selected={selectedMethod}
              onChange={setSelectedMethod}
              methods={methods}
            />
          </motion.div>

          {/* Form Container */}
          <motion.div
            variants={staggerItem}
            className="p-4 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-lg"
          >
            {selectedMethod === 'crypto' && <CryptoForm type="deposit" onSubmit={handleSubmit} />}
            {selectedMethod === 'paypal' && <PayPalForm type="deposit" onSubmit={handleSubmit} />}
            {selectedMethod === 'giftcard' && <GiftCardForm onSubmit={handleSubmit} />}
          </motion.div>

          {/* Info Box */}
          <motion.div
            variants={staggerItem}
            className="p-4 bg-blue-400/10 border border-blue-400/30 rounded-lg"
          >
            <p className="text-xs text-blue-400/90 mb-2 font-semibold">Processing Information:</p>
            <ul className="space-y-1 text-xs text-blue-400/80">
              <li>• All deposits are reviewed by our admin team</li>
              <li>• Approval typically takes 2-4 hours</li>
              <li>• You will receive email notification when processed</li>
              <li>• Rejected deposits are refunded to original source</li>
            </ul>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
