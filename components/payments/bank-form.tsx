'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { getPaymentMethods } from '@/lib/payment-config';

interface BankFormProps {
  type?: 'deposit' | 'withdraw';
  onSubmit: (data: any) => void;
}

export function BankForm({ type = 'deposit', onSubmit }: BankFormProps) {
  const [adminBankDetails, setAdminBankDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(type === 'deposit');
  const [formData, setFormData] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    iban: '',
    swiftBic: '',
    country: '',
    amount: '',
    notes: '',
  });

  // For deposit: fetch admin bank details. For withdraw: let user enter their own
  useEffect(() => {
    if (type === 'deposit') {
      const fetchBankDetails = async () => {
        try {
          console.log('[v0] BankForm - Fetching admin bank configuration for deposit');
          const methods = await getPaymentMethods();
          console.log('[v0] BankForm - Bank config fetched:', methods.bank.config);
          setAdminBankDetails(methods.bank.config);
        } catch (error) {
          console.error('[v0] BankForm - Failed to load bank details:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchBankDetails();
    } else {
      setIsLoading(false);
    }
  }, [type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (type === 'deposit') {
      // Deposit: submit with admin bank details
      onSubmit({
        ...adminBankDetails,
        amount: parseFloat(formData.amount),
        notes: formData.notes,
      });
    } else {
      // Withdraw: submit with user-entered bank details
      if (!formData.bankName || !formData.accountName || !formData.accountNumber || !formData.country) {
        alert('Please fill in all required fields');
        return;
      }
      onSubmit({
        bankName: formData.bankName,
        accountName: formData.accountName,
        accountNumber: formData.accountNumber,
        iban: formData.iban,
        swiftBic: formData.swiftBic,
        country: formData.country,
        amount: parseFloat(formData.amount),
        notes: formData.notes,
      });
    }
  };

  if (isLoading) {
    return <div className="text-xs text-muted-foreground">Loading bank details...</div>;
  }

  // DEPOSIT MODE - Show admin bank details as read-only
  if (type === 'deposit') {
    if (!adminBankDetails) {
      return (
        <div className="p-3 bg-red-400/10 border border-red-400/30 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-300">Bank details are not configured. Please contact support.</p>
        </div>
      );
    }

    return (
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {/* Admin Bank Details - Read Only */}
        <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
          <h3 className="text-xs font-bold text-accent mb-3">Send Payment To:</h3>
          
          <div className="space-y-2.5">
            {adminBankDetails.bank_name && (
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Bank Name</p>
                <p className="text-sm font-semibold text-foreground">{adminBankDetails.bank_name}</p>
              </div>
            )}
            
            {adminBankDetails.account_name && (
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Account Name</p>
                <p className="text-sm font-semibold text-foreground">{adminBankDetails.account_name}</p>
              </div>
            )}
            
            {adminBankDetails.account_number && (
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Account Number / IBAN</p>
                <p className="text-sm font-semibold text-foreground font-mono">{adminBankDetails.account_number}</p>
              </div>
            )}
            
            {adminBankDetails.swift_code && (
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">SWIFT Code</p>
                <p className="text-sm font-semibold text-foreground font-mono">{adminBankDetails.swift_code}</p>
              </div>
            )}
            
            {adminBankDetails.country && (
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Country</p>
                <p className="text-sm font-semibold text-foreground">{adminBankDetails.country}</p>
              </div>
            )}
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
          <label className="text-xs font-semibold text-muted-foreground mb-2 block">Reference / Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Enter your name or reference for this deposit..."
            className="w-full px-3 py-2 bg-input border border-white/10 rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 min-h-20"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full px-4 py-2 bg-accent text-background font-semibold rounded-lg hover:bg-accent/90 transition-all text-xs"
        >
          Submit Bank Deposit
        </button>
      </motion.form>
    );
  }

  // WITHDRAW MODE - User enters their own bank details
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
        Submit Bank Withdrawal
      </button>
    </motion.form>
  );
}



