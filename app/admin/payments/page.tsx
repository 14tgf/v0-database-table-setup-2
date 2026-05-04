'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { CreditCard } from 'lucide-react';
import { CryptoConfigComponent } from '@/components/admin/payments/crypto-config';
import { PayPalConfigComponent } from '@/components/admin/payments/paypal-config';
import { BankConfigComponent } from '@/components/admin/payments/bank-config';
import { getPaymentMethods, PaymentMethodsData } from '@/lib/payment-config';

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

export default function PaymentsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodsData | null>(null);
  const [cryptoActive, setCryptoActive] = useState(true);
  const [paypalActive, setPaypalActive] = useState(true);
  const [bankActive, setBankActive] = useState(true);

  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        const methods = await getPaymentMethods();
        setPaymentMethods(methods);
        setCryptoActive(methods.crypto.status === 'active');
        setPaypalActive(methods.paypal.status === 'active');
        setBankActive(methods.bank.status === 'active');
      } catch (error) {
        console.error('Error loading payment methods:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPaymentMethods();
  }, []);

  if (isLoading || !paymentMethods) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-white/60">Loading payment configuration...</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4 max-w-4xl"
    >
      {/* Page Title */}
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl font-bold text-foreground">Payment Methods Configuration</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage payment settings for deposits, withdrawals, and checkout</p>
      </motion.div>

      {/* Info Banner */}
      <motion.div
        variants={staggerItem}
        className="bg-accent/10 border border-accent/30 rounded-lg p-4"
      >
        <div className="flex items-start gap-3">
          <CreditCard className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-accent mb-0.5">Live Configuration</p>
            <p className="text-xs text-white/70">All changes made here automatically update on deposit, withdrawal, and checkout pages. Gift card configurations are not managed here - they are submitted directly to the admin email.</p>
          </div>
        </div>
      </motion.div>

      {/* Crypto Configuration */}
      <motion.div variants={staggerItem}>
        <CryptoConfigComponent
          initialConfig={paymentMethods.crypto.config}
          onToggle={() => setCryptoActive(!cryptoActive)}
          isActive={cryptoActive}
        />
      </motion.div>

      {/* PayPal Configuration */}
      <motion.div variants={staggerItem}>
        <PayPalConfigComponent
          initialConfig={paymentMethods.paypal.config}
          onToggle={() => setPaypalActive(!paypalActive)}
          isActive={paypalActive}
        />
      </motion.div>

      {/* Bank Configuration */}
      <motion.div variants={staggerItem}>
        <BankConfigComponent
          initialConfig={paymentMethods.bank.config}
          onToggle={() => setBankActive(!bankActive)}
          isActive={bankActive}
        />
      </motion.div>

      {/* Summary Section */}
      <motion.div
        variants={staggerItem}
        className="bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 border border-white/10 rounded-lg p-4 mt-6"
      >
        <h2 className="text-base font-semibold text-foreground mb-3">Configuration Status</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
            <p className="text-xs text-white/70 mb-1">Active Crypto Networks</p>
            <p className="text-2xl font-bold text-accent">4</p>
            <p className="text-xs text-white/60 mt-0.5">BTC, ETH, USDT TRC20, USDT ERC20</p>
          </div>

          <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
            <p className="text-xs text-white/70 mb-1">Payment Methods</p>
            <p className="text-2xl font-bold text-accent">3</p>
            <p className="text-xs text-white/60 mt-0.5">Crypto, PayPal, Bank Transfer</p>
          </div>

          <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
            <p className="text-xs text-white/70 mb-1">Active Methods</p>
            <p className="text-2xl font-bold text-green-400">
              {[cryptoActive, paypalActive, bankActive].filter(Boolean).length}
            </p>
            <p className="text-xs text-white/60 mt-0.5">Of 3 total methods</p>
          </div>
        </div>
      </motion.div>

      {/* Help Section */}
      <motion.div
        variants={staggerItem}
        className="bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 border border-white/10 rounded-lg p-4"
      >
        <h2 className="text-base font-semibold text-foreground mb-3">How It Works</h2>
        
        <div className="space-y-2">
          <div className="flex gap-3 text-xs">
            <div className="w-5 h-5 flex-shrink-0 rounded-full bg-accent/20 border border-accent/50 flex items-center justify-center">
              <span className="text-xs font-bold text-accent">1</span>
            </div>
            <p className="text-white/70 pt-0.5"><span className="text-foreground font-semibold">Configure Payment Methods</span> - Update crypto addresses, PayPal email, and bank details above</p>
          </div>

          <div className="flex gap-3 text-xs">
            <div className="w-5 h-5 flex-shrink-0 rounded-full bg-accent/20 border border-accent/50 flex items-center justify-center">
              <span className="text-xs font-bold text-accent">2</span>
            </div>
            <p className="text-white/70 pt-0.5"><span className="text-foreground font-semibold">Toggle Active Status</span> - Use status button to enable/disable each method</p>
          </div>

          <div className="flex gap-3 text-xs">
            <div className="w-5 h-5 flex-shrink-0 rounded-full bg-accent/20 border border-accent/50 flex items-center justify-center">
              <span className="text-xs font-bold text-accent">3</span>
            </div>
            <p className="text-white/70 pt-0.5"><span className="text-foreground font-semibold">Live on User Pages</span> - Changes instantly reflect on /deposit, /withdraw, and /checkout pages</p>
          </div>

          <div className="flex gap-3 text-xs">
            <div className="w-5 h-5 flex-shrink-0 rounded-full bg-accent/20 border border-accent/50 flex items-center justify-center">
              <span className="text-xs font-bold text-accent">4</span>
            </div>
            <p className="text-white/70 pt-0.5"><span className="text-foreground font-semibold">Gift Cards</span> - Not configured here; submissions are sent directly to admin email for review</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
