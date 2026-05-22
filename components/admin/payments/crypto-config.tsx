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

  const handleInputChange = (crypto: keyof CryptoConfig, network: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [crypto]: {
        ...(prev[crypto] as any),
        [network]: value,
      },
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
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      console.log('[v0] CRYPTO CONFIG - API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[v0] CRYPTO CONFIG - API error response:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to save`);
      }

      const result = await response.json();
      console.log('[v0] CRYPTO CONFIG - Save successful:', result);
      
      if (result.data && result.data.config) {
        console.log('[v0] CRYPTO CONFIG - Updating displayed config with database values');
        setFormData(result.data.config);
      }
      
      setShowSuccess(true);
      setIsEditing(false);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('[v0] CRYPTO CONFIG - Error saving crypto config:', errorMsg);
      alert(`Error saving crypto wallet configuration:\n\n${errorMsg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const cryptoOptions = [
    {
      key: 'btc',
      label: 'Bitcoin (BTC)',
      icon: Bitcoin,
      networks: ['mainnet', 'testnet'],
    },
    {
      key: 'eth',
      label: 'Ethereum (ETH)',
      icon: Zap,
      networks: ['mainnet', 'testnet'],
    },
    {
      key: 'usdt',
      label: 'Tether (USDT)',
      icon: Zap,
      networks: ['erc20', 'trc20', 'bep20'],
    },
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
            <p className="text-xs text-white/60 mt-0.5">Configure BTC, ETH, and USDT addresses with networks</p>
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
        <div className="space-y-4 mb-4">
          {cryptoOptions.map(({ key, label, networks }) => (
            <div key={key} className="space-y-2">
              <p className="text-xs font-semibold text-foreground">{label}</p>
              <div className="grid grid-cols-2 gap-2">
                {networks.map(network => {
                  const address = (formData[key as keyof CryptoConfig] as any)?.[network];
                  return (
                    <div key={`${key}-${network}`} className="flex items-start gap-2 p-2 bg-white/5 border border-white/10 rounded text-xs">
                      <div className="flex-1 min-w-0">
                        <p className="text-white/60 capitalize text-xs">{network}</p>
                        <p className="text-foreground break-all text-xs mt-1">{address || '(not configured)'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Mode */}
      {isEditing && (
        <div className="space-y-4 mb-4">
          {cryptoOptions.map(({ key, label, networks }) => (
            <div key={key} className="space-y-2">
              <p className="text-xs font-semibold text-foreground">{label}</p>
              <div className="space-y-2">
                {networks.map(network => (
                  <div key={`${key}-${network}`}>
                    <label className="block text-xs text-white/70 mb-1 capitalize">{network} Address</label>
                    <input
                      type="text"
                      value={(formData[key as keyof CryptoConfig] as any)?.[network] || ''}
                      onChange={(e) => handleInputChange(key as keyof CryptoConfig, network, e.target.value)}
                      placeholder={`Enter ${label} ${network} address`}
                      className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 text-xs"
                    />
                  </div>
                ))}
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
