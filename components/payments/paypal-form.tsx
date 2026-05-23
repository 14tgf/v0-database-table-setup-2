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
  const [adminPaypalEmail, setAdminPaypalEmail] = useState('');
  const [userPaypalEmail, setUserPaypalEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(true);

  // Fetch admin PayPal email from config
  useEffect(() => {
    const fetchPayPalEmail = async () => {
      try {
        const methods = await getPaymentMethods();
        setAdminPaypalEmail(methods.paypal.config.email);
      } catch (error) {
        console.error('[v0] Failed to load PayPal email:', error);
        setAdminPaypalEmail('payment@xholdings.com'); // Fallback
      } finally {
        setIsLoadingEmail(false);
      }
    };

    fetchPayPalEmail();
  }, []);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(adminPaypalEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (type === 'deposit' && !file) {
      alert('Please upload payment receipt or screenshot');
      return;
    }
    
    if (type === 'withdraw' && !userPaypalEmail) {
      alert('Please enter your PayPal email address');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    onSubmit({
      adminPaypalEmail,
      userPaypalEmail: type === 'withdraw' ? userPaypalEmail : '',
      amount: parseFloat(amount),
      transactionReference: reference,
      proofImage: file,
    });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      {/* DEPOSIT MODE: Show admin PayPal email to send to */}
      {type === 'deposit' && (
        <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
          <h3 className="text-xs font-bold text-accent mb-3">Send Payment To:</h3>
          {isLoadingEmail ? (
            <p className="text-xs text-muted-foreground">Loading PayPal email...</p>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground break-all">{adminPaypalEmail}</p>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="ml-2 p-2 hover:bg-white/10 rounded transition-colors flex-shrink-0"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-accent" />
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* WITHDRAW MODE: User enters their PayPal email */}
      {type === 'withdraw' && (
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-2 block">Your PayPal Email Address *</label>
          <input
            type="email"
            value={userPaypalEmail}
            onChange={(e) => setUserPaypalEmail(e.target.value)}
            placeholder="your.email@paypal.com"
            className="w-full px-3 py-2 bg-input border border-white/10 rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-accent/50"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">We&apos;ll send your withdrawal to this PayPal email</p>
        </div>
      )}

      {/* Amount */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-2 block">Amount (USD) *</label>
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

      {/* Reference (for deposit only) */}
      {type === 'deposit' && (
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-2 block">Transaction Reference</label>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Enter PayPal transaction ID or reference"
            className="w-full px-3 py-2 bg-input border border-white/10 rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-accent/50"
          />
        </div>
      )}

      {/* Proof File (for deposit only) */}
      {type === 'deposit' && (
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-2 block">Payment Proof (Screenshot/Receipt) *</label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="w-full px-3 py-2 bg-input border border-white/10 rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-accent/50"
            required
          />
          {file && (
            <p className="text-xs text-green-400 mt-1">✓ File selected: {file.name}</p>
          )}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full px-4 py-2 bg-accent text-background font-semibold rounded-lg hover:bg-accent/90 transition-all text-xs"
      >
        {type === 'deposit' ? 'Submit PayPal Deposit' : 'Submit PayPal Withdrawal'}
      </button>
    </motion.form>
  );
}

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
