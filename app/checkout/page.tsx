'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { PaymentMethodSelector } from '@/components/payments/payment-method-selector';
import { CryptoForm } from '@/components/payments/crypto-form';
import { PayPalForm } from '@/components/payments/paypal-form';
import { GiftCardForm } from '@/components/payments/giftcard-form';
import { CheckoutSummary } from '@/components/payments/checkout-summary';
import { staggerContainer, staggerItem } from '@/lib/animations';

// Mock product data
const PRODUCTS: Record<string, any> = {
  '1': { id: '1', name: 'Tesla Model 3', price: 45000, image: '/products/model3.jpg' },
  '2': { id: '2', name: 'Tesla Model S', price: 75000, image: '/products/models.jpg' },
  '3': { id: '3', name: 'Tesla Model X', price: 85000, image: '/products/modelx.jpg' },
};

function CheckoutContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId') || '1';
  const product = PRODUCTS[productId] || PRODUCTS['1'];

  const [selectedMethod, setSelectedMethod] = useState('crypto');
  const [quantity, setQuantity] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const methods = [
    { id: 'crypto', label: 'Cryptocurrency', description: 'BTC, USDT, ETH' },
    { id: 'paypal', label: 'PayPal', description: 'Fast & secure' },
    { id: 'giftcard', label: 'Gift Card', description: 'Physical or E-Gift' },
  ];

  const fees = product.price * quantity * 0.02; // 2% processing fee

  const handleSubmit = (data: any) => {
    console.log('[v0] Order submitted:', { product, quantity, ...data });
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
            <Link href="/inventory" className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <h1 className="text-lg font-bold text-foreground">Checkout</h1>
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
          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
        >
          {/* Left Column - Order Details */}
          <motion.div variants={staggerItem} className="lg:col-span-2 space-y-4">
            {/* Success Message */}
            {submitted && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-green-400/10 border border-green-400/30 rounded-lg flex items-start gap-3"
              >
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-green-400">Order Submitted Successfully</p>
                  <p className="text-xs text-green-400/80 mt-1">Your order is pending admin approval. You'll be notified once processed.</p>
                </div>
              </motion.div>
            )}

            {/* Product Card */}
            <motion.div variants={staggerItem} className="p-4 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-lg">
              <h2 className="text-sm font-bold text-foreground mb-3">Order Details</h2>
              <div className="flex gap-3 mb-3">
                <div className="w-20 h-20 rounded-lg bg-accent/10 border border-accent/30 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-foreground">{product.name}</p>
                  <p className="text-xs text-muted-foreground">Premium Electric Vehicle</p>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Quantity:</span>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 rounded hover:bg-white/10 transition-colors"
                >
                  −
                </button>
                <span className="text-xs font-semibold text-foreground w-6 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1 rounded hover:bg-white/10 transition-colors"
                >
                  +
                </button>
              </div>
            </motion.div>

            {/* Payment Method Selector */}
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
          </motion.div>

          {/* Right Column - Summary (Sticky) */}
          <motion.div variants={staggerItem} className="lg:sticky lg:top-20 lg:h-fit">
            <CheckoutSummary
              productName={product.name}
              productPrice={product.price}
              quantity={quantity}
              fees={fees}
            />
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <CheckoutContent />
    </Suspense>
  );
}
