'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { PaymentMethodSelector } from '@/components/payments/payment-method-selector';
import { CryptoForm } from '@/components/payments/crypto-form';
import { PayPalForm } from '@/components/payments/paypal-form';
import { GiftCardForm } from '@/components/payments/giftcard-form';
import { staggerContainer, staggerItem } from '@/lib/animations';

function PayFeeContent() {
  const searchParams = useSearchParams();
  const feeAmount = parseFloat(searchParams.get('amount') || '0');
  const withdrawalAmount = parseFloat(searchParams.get('withdrawal') || '0');
  const feePercent = parseFloat(searchParams.get('percent') || '20');
  
  const [selectedMethod, setSelectedMethod] = useState('crypto');
  const [isPaid, setIsPaid] = useState(false);

  const methods = [
    { id: 'crypto', label: 'Cryptocurrency', description: 'BTC, USDT, ETH' },
    { id: 'paypal', label: 'PayPal', description: 'Fast transfer' },
    { id: 'giftcard', label: 'Gift Card', description: 'Various cards' },
  ];

  const handleSubmit = async (data: any) => {
    // This payment is for the withdrawal fee only - it does NOT get submitted to admin
    // It just marks the fee as paid locally
    console.log('[v0] Withdrawal fee payment submitted:', data);
    setIsPaid(true);
  };

  if (isPaid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-secondary/95 via-secondary/90 to-background/95 border border-green-400/30 rounded-2xl p-8 max-w-md w-full text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-4"
          >
            <CheckCircle className="w-16 h-16 text-green-400" />
          </motion.div>
          <h2 className="text-xl font-bold text-foreground mb-2">Fee Payment Submitted</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Your withdrawal fee payment of ${feeAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} has been recorded. 
            Your withdrawal of ${withdrawalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} will be processed within 24 hours.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-green-400 mb-6">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span>Payment received</span>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-background font-bold rounded-xl hover:bg-accent/90 transition-all text-sm w-full"
          >
            Return to Dashboard
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <Link href="/dashboard/withdraw" className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <h1 className="text-lg font-bold text-foreground">Pay Withdrawal Fee</h1>
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
          {/* Fee Summary */}
          <motion.div
            variants={staggerItem}
            className="p-4 bg-gradient-to-br from-amber-400/10 to-amber-400/5 border border-amber-400/30 rounded-lg"
          >
            <h2 className="text-sm font-bold text-amber-400 mb-3">Withdrawal Fee Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Withdrawal Amount:</span>
                <span className="text-foreground font-semibold">${withdrawalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Processing Fee ({feePercent}%):</span>
                <span className="text-amber-400 font-semibold">${feeAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="border-t border-white/10 pt-2 mt-2 flex justify-between">
                <span className="text-sm font-bold text-foreground">Amount to Pay:</span>
                <span className="text-lg font-bold text-accent">${feeAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </motion.div>

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
            className="p-4 bg-secondary/30 border border-white/10 rounded-lg"
          >
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Note:</strong> This fee covers transaction processing and network costs. 
              Once payment is confirmed, your withdrawal will be processed within 24 hours.
            </p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

export default function PayFeePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
      </div>
    }>
      <PayFeeContent />
    </Suspense>
  );
}
