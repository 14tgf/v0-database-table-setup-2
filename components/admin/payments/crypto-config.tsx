'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bitcoin, Zap, Check, X as XIcon } from 'lucide-react';
import { CryptoConfig, updateCryptoConfig } from '@/lib/payment-config';

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
    console.log('[v0] CRYPTO CONFIG - Save started:', formData);
    try {
      console.log('[v0] CRYPTO CONFIG - Calling updateCryptoConfig API');
      const response = await fetch('/api/admin/payments/crypto/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies in the request
        body: JSON.stringify(formData),
      });

      console.log('[v0] CRYPTO CONFIG - API response status:', response.status);
      console.log('[v0] CRYPTO CONFIG - Response headers:', {
        contentType: response.headers.get('content-type'),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[v0] CRYPTO CONFIG - API error response:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to save`);
      }

      const result = await response.json();
      console.log('[v0] CRYPTO CONFIG - Save successful:', result);
      
      // Update the displayed config with the saved data
      if (result.data && result.data.config) {
        console.log('[v0] CRYPTO CONFIG - Updating displayed config with database values');
        setFormData(result.data.config);
      }
      
      setShowSuccess(true);
      setIsEditing(false);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('[v0] CRYPTO CONFIG - Error saving crypto config:', {
        error,
        errorMsg,
        formData,
        timestamp: new Date().toISOString(),
      });
      // Show error to user
      alert(`Error saving crypto wallet configuration:\n\n${errorMsg}\n\nCheck browser console for details.`);
    } finally {
      setIsSaving(false);
    }
  };

  const cryptoOptions = [
    { key: 'btc_address', label: 'Bitcoin (BTC)', icon: Bitcoin },
    { key: 'eth_address', label: 'Ethereum (ETH)', icon: Zap },
    { key: 'usdt_trc20', label: 'USDT (TRC20)', icon: Zap },
    { key: 'usdt_erc20', label: 'USDT (ERC20)', icon: Zap },
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
            <p className="text-xs text-white/60 mt-0.5">Configure BTC, ETH, and USDT addresses</p>
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
          <p className="text-xs text-green-400 font-semibold">Crypto wallet configuration updated successfully</p>
        </div>
      )}

      {/* View Mode */}
      {!isEditing && (
        <div className="space-y-3 mb-4">
          {cryptoOptions.map(({ key, label }) => {
            const Icon = key === 'btc_address' ? Bitcoin : Zap;
            return (
              <div key={key} className="flex items-start gap-3 p-3 bg-white/5 border border-white/10 rounded-lg">
                <Icon className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">{label}</p>
                  <p className="text-xs text-white/60 mt-0.5 break-all">{formData[key as keyof CryptoConfig]}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Mode */}
      {isEditing && (
        <div className="space-y-3 mb-4">
          {cryptoOptions.map(({ key, label }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">{label}</label>
              <input
                type="text"
                value={formData[key as keyof CryptoConfig]}
                onChange={(e) => handleInputChange(key as keyof CryptoConfig, e.target.value)}
                placeholder={`Enter ${label.toLowerCase()} address`}
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
