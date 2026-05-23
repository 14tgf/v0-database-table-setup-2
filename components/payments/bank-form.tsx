'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface BankFormProps {
  onSubmit: (data: any) => void;
}

export function BankForm({ onSubmit }: BankFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    bankName: '',
    accountName: '',
    accountNumber: '',
    iban: '',
    swiftBic: '',
    country: '',
    amount: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      alert('Please enter your email address');
      return;
    }
    if (!formData.bankName || !formData.accountName || !formData.accountNumber || !formData.country || !formData.amount) {
      alert('Please fill in all required fields');
      return;
    }
    onSubmit(formData);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      {/* Email Address */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-2 block">Your Email Address *</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter email for payment confirmation"
          className="w-full px-3 py-2 bg-input border border-white/10 rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-accent/50"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">We&apos;ll send payment confirmation to this email</p>
      </div>

      {/* Bank Name */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-2 block">Bank Name *</label>
        <input
          type="text"
          name="bankName"
          value={formData.bankName}
          onChange={handleChange}
          placeholder="Enter bank name"
          className="w-full px-3 py-2 bg-input border border-white/10 rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-accent/50"
          required
        />
      </div>

      {/* Account Name */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-2 block">Account Name *</label>
        <input
          type="text"
          name="accountName"
          value={formData.accountName}
          onChange={handleChange}
          placeholder="Account holder name"
          className="w-full px-3 py-2 bg-input border border-white/10 rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-accent/50"
          required
        />
      </div>

      {/* Account Number / IBAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-2 block">Account Number *</label>
          <input
            type="text"
            name="accountNumber"
            value={formData.accountNumber}
            onChange={handleChange}
            placeholder="Account number"
            className="w-full px-3 py-2 bg-input border border-white/10 rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-accent/50"
            required
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-2 block">IBAN (Optional)</label>
          <input
            type="text"
            name="iban"
            value={formData.iban}
            onChange={handleChange}
            placeholder="International account number"
            className="w-full px-3 py-2 bg-input border border-white/10 rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-accent/50"
          />
        </div>
      </div>

      {/* SWIFT / BIC & Country */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-2 block">SWIFT / BIC (Optional)</label>
          <input
            type="text"
            name="swiftBic"
            value={formData.swiftBic}
            onChange={handleChange}
            placeholder="SWIFT code"
            className="w-full px-3 py-2 bg-input border border-white/10 rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-accent/50"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-2 block">Country *</label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="Country"
            className="w-full px-3 py-2 bg-input border border-white/10 rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-accent/50"
            required
          />
        </div>
      </div>

      {/* Amount */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-2 block">Amount (USD) *</label>
        <input
          type="number"
          step="0.01"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          placeholder="0.00"
          className="w-full px-3 py-2 bg-input border border-white/10 rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-accent/50"
          required
        />
      </div>

      {/* Notes */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-2 block">Additional Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Any additional information..."
          className="w-full px-3 py-2 bg-input border border-white/10 rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 min-h-20"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full px-4 py-2 bg-accent text-background font-semibold rounded-lg hover:bg-accent/90 transition-all text-xs"
      >
        Submit Bank Transfer Request
      </button>
    </motion.form>
  );
}


  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      {/* Bank Name */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-2 block">Bank Name *</label>
        <input
          type="text"
          name="bankName"
          value={formData.bankName}
          onChange={handleChange}
          placeholder="Enter bank name"
          className="w-full px-3 py-2 bg-input border border-white/10 rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-accent/50"
          required
        />
      </div>

      {/* Account Name */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-2 block">Account Name *</label>
        <input
          type="text"
          name="accountName"
          value={formData.accountName}
          onChange={handleChange}
          placeholder="Account holder name"
          className="w-full px-3 py-2 bg-input border border-white/10 rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-accent/50"
          required
        />
      </div>

      {/* Account Number / IBAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-2 block">Account Number *</label>
          <input
            type="text"
            name="accountNumber"
            value={formData.accountNumber}
            onChange={handleChange}
            placeholder="Account number"
            className="w-full px-3 py-2 bg-input border border-white/10 rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-accent/50"
            required
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-2 block">IBAN (Optional)</label>
          <input
            type="text"
            name="iban"
            value={formData.iban}
            onChange={handleChange}
            placeholder="International account number"
            className="w-full px-3 py-2 bg-input border border-white/10 rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-accent/50"
          />
        </div>
      </div>

      {/* SWIFT / BIC & Country */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-2 block">SWIFT / BIC (Optional)</label>
          <input
            type="text"
            name="swiftBic"
            value={formData.swiftBic}
            onChange={handleChange}
            placeholder="SWIFT code"
            className="w-full px-3 py-2 bg-input border border-white/10 rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-accent/50"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-2 block">Country *</label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="Country"
            className="w-full px-3 py-2 bg-input border border-white/10 rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-accent/50"
            required
          />
        </div>
      </div>

      {/* Amount */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-2 block">Amount (USD) *</label>
        <input
          type="number"
          step="0.01"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          placeholder="0.00"
          className="w-full px-3 py-2 bg-input border border-white/10 rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-accent/50"
          required
        />
      </div>

      {/* Notes */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-2 block">Additional Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Any additional information..."
          className="w-full px-3 py-2 bg-input border border-white/10 rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 min-h-20"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full px-4 py-2 bg-accent text-background font-semibold rounded-lg hover:bg-accent/90 transition-all text-xs"
      >
        Submit Withdrawal Request
      </button>
    </motion.form>
  );
}
