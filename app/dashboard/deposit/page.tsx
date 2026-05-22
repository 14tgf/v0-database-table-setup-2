'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { PaymentMethodSelector } from '@/components/payments/payment-method-selector';
import { CryptoForm } from '@/components/payments/crypto-form';
import { PayPalForm } from '@/components/payments/paypal-form';
import { GiftCardForm } from '@/components/payments/giftcard-form';
import { SuccessModal } from '@/components/success-modal';
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
    console.log('[v0] ====== DEPOSIT SUBMISSION STARTED ======');
    console.log('[v0] Form data received:', data);
    console.log('[v0] Selected payment method:', selectedMethod);
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate amount
      const amount = data?.amount;
      console.log('[v0] Validating amount:', amount);
      if (!amount || amount <= 0) {
        const amountError = 'Please enter a valid deposit amount';
        console.error('[v0] Amount validation failed:', amountError);
        throw new Error(amountError);
      }
      console.log('[v0] Amount validation passed');

      let proofUrl = null;

      // Upload proof file if provided
      if (data.proofImage) {
        console.log('[v0] === STARTING PROOF IMAGE UPLOAD ===');
        console.log('[v0] File info:', {
          name: data.proofImage.name,
          size: data.proofImage.size,
          type: data.proofImage.type,
        });

        const formData = new FormData();
        formData.append('file', data.proofImage);

        console.log('[v0] Sending upload request to /api/upload/deposit-proof...');
        const uploadResponse = await fetch('/api/upload/deposit-proof', {
          method: 'POST',
          body: formData,
        });

        console.log('[v0] Upload response status:', uploadResponse.status);
        console.log('[v0] Upload response headers:', {
          contentType: uploadResponse.headers.get('content-type'),
        });

        if (!uploadResponse.ok) {
          console.error('[v0] Upload response not OK');
          let uploadError;
          try {
            uploadError = await uploadResponse.json();
            console.error('[v0] Upload error response:', uploadError);
          } catch (parseError) {
            const errorText = await uploadResponse.text();
            console.error('[v0] Failed to parse error response:', errorText);
            uploadError = { error: errorText || 'Unknown upload error' };
          }
          throw new Error(`Failed to upload proof: ${uploadError.error}`);
        }

        let uploadResult;
        try {
          uploadResult = await uploadResponse.json();
          console.log('[v0] Upload result:', uploadResult);
        } catch (parseError) {
          console.error('[v0] Failed to parse upload success response:', parseError);
          throw new Error('Failed to parse upload response');
        }

        proofUrl = uploadResult.url;
        console.log('[v0] Proof uploaded successfully:', proofUrl);
        console.log('[v0] === PROOF IMAGE UPLOAD COMPLETE ===');
      } else {
        console.log('[v0] No proof image provided');
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
          proof_upload: proofUrl,
          note: `Deposit of $${amount} USD via ${methodName}`,
        };
      } else if (selectedMethod === 'paypal') {
        methodName = 'paypal';
        console.log('[v0] PayPal deposit - Amount:', amount);
        payload = {
          method_name: methodName,
          amount: amount,
          tx_hash: null,
          proof_upload: proofUrl,
          note: `Deposit of $${amount} USD via PayPal`,
        };
      } else if (selectedMethod === 'giftcard') {
        methodName = 'giftcard';
        console.log('[v0] Gift card deposit - Amount:', amount);
        payload = {
          method_name: methodName,
          amount: amount,
          tx_hash: null,
          proof_upload: proofUrl,
          note: `Deposit of $${amount} USD via Gift Card`,
        };
      }

      console.log('[v0] === CALLING DEPOSIT API ===');
      console.log('[v0] Payload:', JSON.stringify(payload, null, 2));

      const response = await fetch('/api/deposits/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      console.log('[v0] Deposit API response status:', response.status);
      console.log('[v0] Response headers:', {
        contentType: response.headers.get('content-type'),
      });

      if (response.status === 401) {
        console.error('[v0] Unauthorized - redirecting to login');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        console.error('[v0] Deposit API response not OK');
        let errorData;
        try {
          errorData = await response.json();
          console.error('[v0] Deposit API error response:', errorData);
          console.error('[v0] Error details:', errorData.details);
        } catch (parseError) {
          const errorText = await response.text();
          console.error('[v0] Failed to parse error response:', errorText);
          errorData = { error: errorText || 'Unknown error' };
        }

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
      }, 4000);
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
        {/* Success Modal */}
        <SuccessModal
          isOpen={submitted}
          title="Deposit Request Received!"
          message="Your deposit request has been submitted successfully. You'll be notified via email once our team reviews and processes your deposit."
          onClose={() => setSubmitted(false)}
        />

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
