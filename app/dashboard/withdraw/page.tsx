'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { PaymentMethodSelector } from '@/components/payments/payment-method-selector';
import { CryptoForm } from '@/components/payments/crypto-form';
import { PayPalForm } from '@/components/payments/paypal-form';
import { BankForm } from '@/components/payments/bank-form';
import { SuccessModal } from '@/components/success-modal';
import { staggerContainer, staggerItem } from '@/lib/animations';

export default function WithdrawPage() {
  const [selectedMethod, setSelectedMethod] = useState('crypto');
  const [submitted, setSubmitted] = useState(false);

  const methods = [
    { id: 'crypto', label: 'Cryptocurrency', description: 'BTC, USDT, ETH' },
    { id: 'paypal', label: 'PayPal', description: 'Fast transfer' },
    { id: 'bank', label: 'Bank Transfer', description: 'Worldwide' },
  ];

  const handleSubmit = async (data: any) => {
    try {
      console.log('[v0] Withdrawal form submitted:', data);
      
      let method_name = 'crypto';
      let destination_address = null;
      let destination_bank_details = null;

      if (selectedMethod === 'crypto') {
        method_name = data.cryptoType || 'BTC';
        destination_address = data.walletAddress;
      } else if (selectedMethod === 'paypal') {
        method_name = 'paypal';
        destination_address = data.email;
      } else if (selectedMethod === 'bank') {
        method_name = 'bank';
        destination_bank_details = JSON.stringify({
          bankName: data.bankName,
          accountName: data.accountName,
          accountNumber: data.accountNumber,
          iban: data.iban || null,
          swiftBic: data.swiftBic || null,
          country: data.country,
        });
      }
      
      const response = await fetch('/api/withdrawals/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method_name,
          amount: parseFloat(data.amount),
          destination_address,
          destination_bank_details,
          note: data.notes || data.description || null,
        }),
      });

      const result = await response.json();
      
      if (response.status === 401) {
        console.error('[v0] Unauthorized - redirecting to login');
        window.location.href = '/login';
        return;
      }
      
      if (!response.ok) {
        console.error('[v0] Withdrawal API error:', result);
        alert(`Error: ${result.error || 'Failed to submit withdrawal'}`);
        return;
      }

      console.log('[v0] Withdrawal submitted successfully:', result);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setSelectedMethod('crypto');
      }, 4000);
    } catch (error) {
      console.error('[v0] Withdrawal submission error:', error);
      alert(error instanceof Error ? error.message : 'Failed to submit withdrawal');
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
          {/* Success Modal */}
          <SuccessModal
            isOpen={submitted}
            title="Withdrawal Request Received!"
            message="Your withdrawal request has been submitted successfully. You'll be notified via email once our team reviews and processes your withdrawal."
            onClose={() => setSubmitted(false)}
          />

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
