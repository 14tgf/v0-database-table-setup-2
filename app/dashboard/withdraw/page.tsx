'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { PaymentMethodSelector } from '@/components/payments/payment-method-selector';
import { CryptoForm } from '@/components/payments/crypto-form';
import { PayPalForm } from '@/components/payments/paypal-form';
import { BankForm } from '@/components/payments/bank-form';
import { staggerContainer, staggerItem } from '@/lib/animations';

export default function WithdrawPage() {
  const [selectedMethod, setSelectedMethod] = useState('crypto');
  const [submitted, setSubmitted] = useState(false);

  const methods = [
    { id: 'crypto', label: 'Cryptocurrency', description: 'BTC, USDT, ETH' },
    { id: 'paypal', label: 'PayPal', description: 'Fast transfer' },
    { id: 'bank', label: 'Bank Transfer', description: 'Worldwide' },
  ];

  const handleSubmit = (data: any) => {
    console.log('[v0] Withdrawal submitted:', data);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSelectedMethod('crypto');
    }, 5000);
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
            <h1 className="text-lg font-bold text-foreground">Withdraw Funds</h1>
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
                <p className="text-xs font-bold text-green-400">Withdrawal Request Submitted</p>
                <p className="text-xs text-green-400/80 mt-1">Your withdrawal is pending admin approval. You'll be notified once processed.</p>
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
            {selectedMethod === 'crypto' && <CryptoForm type="withdraw" onSubmit={handleSubmit} />}
            {selectedMethod === 'paypal' && <PayPalForm type="withdraw" onSubmit={handleSubmit} />}
            {selectedMethod === 'bank' && <BankForm onSubmit={handleSubmit} />}
          </motion.div>

          {/* Info Box */}
          <motion.div
            variants={staggerItem}
            className="p-4 bg-amber-400/10 border border-amber-400/30 rounded-lg"
          >
            <p className="text-xs text-amber-400/90 mb-2 font-semibold">Withdrawal Information:</p>
            <ul className="space-y-1 text-xs text-amber-400/80">
              <li>• Minimum withdrawal limit: $100</li>
              <li>• Withdrawals reviewed and processed within 24 hours</li>
              <li>• Processing fees may apply depending on method</li>
              <li>• Bank transfers may take 3-5 business days</li>
            </ul>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
