'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Check } from 'lucide-react';
import { BankConfig, updateBankConfig } from '@/lib/payment-config';

interface BankConfigProps {
  initialConfig: BankConfig;
  onToggle: () => void;
  isActive: boolean;
}

export function BankConfigComponent({ initialConfig, onToggle, isActive }: BankConfigProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState<BankConfig>(initialConfig);

  const handleInputChange = (field: keyof BankConfig, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateBankConfig(formData);
      setShowSuccess(true);
      setIsEditing(false);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving bank config:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const bankFields = [
    { key: 'bank_name', label: 'Bank Name', placeholder: 'International Business Bank' },
    { key: 'account_name', label: 'Account Name', placeholder: 'Company Name' },
    { key: 'account_number', label: 'Account Number / IBAN', placeholder: 'DE89370400440532013000' },
    { key: 'swift_code', label: 'SWIFT Code', placeholder: 'COBADEMDEM' },
    { key: 'country', label: 'Country', placeholder: 'Germany' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 border border-white/10 rounded-lg p-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 border border-amber-500/30 rounded-lg">
            <Building2 className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Bank Transfer Configuration</h3>
            <p className="text-xs text-white/60 mt-0.5">Configure bank details for withdrawals</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggle}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              isActive
                ? 'bg-green-400/20 text-green-400 border border-green-400/30'
                : 'bg-white/10 text-white/60 border border-white/20'
            }`}
          >
            {isActive ? 'Active' : 'Inactive'}
          </button>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="mb-4 p-3 bg-green-400/10 border border-green-400/30 rounded-lg flex items-center gap-2">
          <Check className="w-4 h-4 text-green-400" />
          <p className="text-xs text-green-400 font-semibold">Bank configuration updated successfully</p>
        </div>
      )}

      {/* View Mode */}
      {!isEditing && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {bankFields.map(({ key, label }) => (
            <div key={key} className="p-3 bg-white/5 border border-white/10 rounded-lg">
              <p className="text-xs font-semibold text-white/70 mb-0.5">{label}</p>
              <p className="text-xs text-foreground break-all">{formData[key as keyof BankConfig]}</p>
            </div>
          ))}
        </div>
      )}

      {/* Edit Mode */}
      {isEditing && (
        <div className="space-y-3 mb-4">
          {bankFields.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">{label}</label>
              <input
                type="text"
                value={formData[key as keyof BankConfig]}
                onChange={(e) => handleInputChange(key as keyof BankConfig, e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 text-xs"
              />
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex-1 px-3 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors font-semibold text-xs"
          >
            Edit Details
          </button>
        ) : (
          <>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-3 py-2 bg-accent text-background rounded-lg hover:bg-accent/90 transition-colors font-semibold text-xs disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setFormData(initialConfig);
              }}
              className="flex-1 px-3 py-2 bg-white/10 text-white/70 rounded-lg hover:bg-white/20 transition-colors font-semibold text-xs"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
