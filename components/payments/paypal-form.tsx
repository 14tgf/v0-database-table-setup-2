'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { getPaymentMethods } from '@/lib/payment-config';

interface PayPalFormProps {
  type: 'deposit' | 'withdraw';
  onSubmit: (data: any) => void;
}

export function PayPalForm({ type, onSubmit }: PayPalFormProps) {
  const [paypalEmail, setPaypalEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(true);

  // Fetch PayPal email from config
  useEffect(() => {
    const fetchPayPalEmail = async () => {
      try {
        const methods = await getPaymentMethods();
        setPaypalEmail(methods.paypal.config.email);
      } catch (error) {
        console.error('[v0] Failed to load PayPal email:', error);
        setPaypalEmail('payment@xholdings.com'); // Fallback
      } finally {
        setIsLoadingEmail(false);
      }
    };

    fetchPayPalEmail();
  }, []);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(paypalEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'deposit' && !file) {
      alert('Please upload payment receipt or screenshot');
      return;
    }
    onSubmit({
      paypalEmail,
      userEmail: '', // Users send to the business email, not their own PayPal email
      amount: parseFloat(amount),
      transactionReference: reference,
      proofImage: file, // Use proofImage for consistent API handling
    });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      {/* Payment Email - Display Only */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-2 block">Send Payment To</label>
        <div className="flex items-center gap-2">
          <div className="flex-1 px-3 py-2 bg-input border border-white/10 rounded-lg text-foreground text-xs flex items-center">
            {isLoadingEmail ? 'Loading...' : paypalEmail}
          </div>
          <button
            type="button"
            onClick={handleCopyEmail}
            className="px-3 py-2 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors flex items-center gap-1"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span className="text-xs">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span className="text-xs">Copy</span>
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">Send your payment to this PayPal email address</p>
      </div>

      {/* Amount */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-2 block">Amount (USD)</label>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full px-3 py-2 bg-input border border-white/10 rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-accent/50"
          required
        />
      </div>

      {/* Transaction Reference */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-2 block">Transaction Reference</label>
        <input
          type="text"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="PayPal transaction ID"
          className="w-full px-3 py-2 bg-input border border-white/10 rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-accent/50"
          required
        />
      </div>

      {/* Receipt Upload */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-2 block">Receipt / Screenshot</label>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full px-3 py-2 bg-input border border-white/10 rounded-lg text-xs text-foreground file:mr-2 file:px-2 file:py-1 file:rounded file:border-0 file:bg-accent file:text-background file:text-xs file:font-semibold"
          required
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full px-4 py-2 bg-accent text-background font-semibold rounded-lg hover:bg-accent/90 transition-all text-xs"
      >
        {type === 'deposit' ? 'Submit Deposit Request' : 'Submit Withdrawal Request'}
      </button>
    </motion.form>
  );
}
