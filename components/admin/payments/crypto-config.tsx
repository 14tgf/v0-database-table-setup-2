'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bitcoin, Plus, Trash2, Check } from 'lucide-react';
import { CryptoConfig, CryptoAddress } from '@/lib/payment-config';

interface CryptoConfigProps {
  initialConfig: CryptoConfig;
  onToggle: () => void;
  isActive: boolean;
}

export function CryptoConfigComponent({ initialConfig, onToggle, isActive }: CryptoConfigProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [addresses, setAddresses] = useState<CryptoAddress[]>(initialConfig.addresses || []);
  const [newAddress, setNewAddress] = useState('');
  const [newNetwork, setNewNetwork] = useState('');

  const handleAddAddress = () => {
    if (newAddress.trim() && newNetwork.trim()) {
      setAddresses([
        ...addresses,
        { id: Date.now().toString(), address: newAddress, network: newNetwork },
      ]);
      setNewAddress('');
      setNewNetwork('');
    }
  };

  const handleRemoveAddress = (id: string | undefined) => {
    setAddresses(addresses.filter(addr => addr.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/payments/crypto/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ addresses }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save');
      }

      const result = await response.json();
      if (result.data && result.data.config) {
        setAddresses(result.data.config.addresses || []);
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
            <p className="text-xs text-white/60 mt-0.5">Add crypto addresses with custom network names</p>
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
          <p className="text-xs text-green-400 font-semibold">Crypto wallets updated successfully</p>
        </div>
      )}

      {/* Address List */}
      <div className="mb-4 space-y-2">
        {addresses.length === 0 ? (
          <p className="text-xs text-white/60 py-3 text-center">No crypto addresses configured yet</p>
        ) : (
          addresses.map((addr) => (
            <div key={addr.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground">{addr.network}</p>
                <p className="text-xs text-white/60 truncate mt-0.5">{addr.address}</p>
              </div>
              {isEditing && (
                <button
                  onClick={() => handleRemoveAddress(addr.id)}
                  className="ml-2 p-1.5 hover:bg-red-500/20 text-red-400 rounded transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add New Address Form */}
      {isEditing && (
        <div className="mb-4 p-3 bg-white/5 border border-accent/30 rounded-lg space-y-2">
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">Network Name</label>
            <input
              type="text"
              value={newNetwork}
              onChange={(e) => setNewNetwork(e.target.value)}
              placeholder="e.g., BTC, ETH, USDT TRC-20, Polygon USDC"
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">Wallet Address</label>
            <input
              type="text"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="Enter wallet address"
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 text-xs"
            />
          </div>
          <button
            onClick={handleAddAddress}
            disabled={!newAddress.trim() || !newNetwork.trim()}
            className="w-full px-3 py-2 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors font-semibold text-xs disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Address
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex-1 px-3 py-2 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors font-semibold text-xs"
          >
            Edit Addresses
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
                setAddresses(initialConfig.addresses || []);
                setNewAddress('');
                setNewNetwork('');
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
