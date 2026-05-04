'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface PayPalFormProps {
  type: 'deposit' | 'withdraw';
  onSubmit: (data: any) => void;
}

export function PayPalForm({ type, onSubmit }: PayPalFormProps) {
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ email, amount: parseFloat(amount), transactionReference: reference, receiptImage: file });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      {/* PayPal Email */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-2 block">PayPal Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@paypal.com"
          className="w-full px-3 py-2 bg-input border border-white/10 rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-accent/50"
          required
        />
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
