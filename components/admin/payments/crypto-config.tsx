'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bitcoin, Check } from 'lucide-react';
import { CryptoConfig } from '@/lib/payment-config';

interface CryptoConfigProps {
  initialConfig: CryptoConfig;
  onToggle: () => void;
  isActive: boolean;
}

export function CryptoConfigComponent({ initialConfig, onToggle, isActive }: CryptoConfigProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState<CryptoConfig>(initialConfig);

  const handleInputChange = (field: keyof CryptoConfig, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/payments/crypto/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save');
      }

      const result = await response.json();
      if (result.data && result.data.config) {
        setFormData(result.data.config);
      }

      setShowSuccess(true);
      setIsEditing(false);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      alert(`Error saving crypto configuration:\n\n${errorMsg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const cryptoFields = [
    { key: 'btc_address', label: 'Bitcoin (BTC) Address', networkKey: 'btc_network', networkLabel: 'BTC Network' },
    { key: 'eth_address', label: 'Ethereum (ETH) Address', networkKey: 'eth_network', networkLabel: 'ETH Network' },
    { key: 'usdt_erc20', label: 'USDT ERC-20 Address', networkKey: 'usdt_erc20_network', networkLabel: 'USDT ERC-20 Network' },
    { key: 'usdt_trc20', label: 'USDT TRC-20 Address', networkKey: 'usdt_trc20_network', networkLabel: 'USDT TRC-20 Network' },
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
          <div className="p-2 bg-accent/20 border border-accent/30 rounded-lg">
            <Bitcoin className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Cryptocurrency Wallets</h3>
            <p className="text-xs text-white/60 mt-0.5">Configure crypto addresses and network names</p>
          </div>
        </div>

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

      {/* Success Message */}
      {showSuccess && (
        <div className="mb-4 p-3 bg-green-400/10 border border-green-400/30 rounded-lg flex items-center gap-2">
          <Check className="w-4 h-4 text-green-400" />
          <p className="text-xs text-green-400 font-semibold">Crypto configuration updated successfully</p>
        </div>
      )}

      {/* View Mode */}
      {!isEditing && (
        <div className="space-y-4 mb-4">
          {cryptoFields.map(({ key, label, networkKey, networkLabel }) => (
            <div key={key} className="space-y-1">
              <p className="text-xs font-semibold text-foreground">{label}</p>
              <p className="text-xs text-white/60 break-all">{formData[key as keyof CryptoConfig]}</p>
              <p className="text-xs text-white/50 italic">Network: {formData[networkKey as keyof CryptoConfig] || '(not set)'}</p>
            </div>
          ))}
        </div>
      )}

      {/* Edit Mode */}
      {isEditing && (
        <div className="space-y-4 mb-4">
          {cryptoFields.map(({ key, label, networkKey, networkLabel }) => (
            <div key={key} className="space-y-2">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">{label}</label>
                <input
                  type="text"
                  value={formData[key as keyof CryptoConfig]}
                  onChange={(e) => handleInputChange(key as keyof CryptoConfig, e.target.value)}
                  placeholder={`Enter ${label.toLowerCase()}`}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">{networkLabel}</label>
                <input
                  type="text"
                  value={formData[networkKey as keyof CryptoConfig] || ''}
                  onChange={(e) => handleInputChange(networkKey as keyof CryptoConfig, e.target.value)}
                  placeholder="e.g., BTC, ETH, USDT TRC-20"
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 text-xs"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex-1 px-3 py-2 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors font-semibold text-xs"
          >
            Edit Wallets
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
