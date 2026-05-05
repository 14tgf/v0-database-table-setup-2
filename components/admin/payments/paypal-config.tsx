'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Check } from 'lucide-react';
import { PayPalConfig, updatePayPalConfig } from '@/lib/payment-config';

interface PayPalConfigProps {
  initialConfig: PayPalConfig;
  onToggle: () => void;
  isActive: boolean;
}

export function PayPalConfigComponent({ initialConfig, onToggle, isActive }: PayPalConfigProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [email, setEmail] = useState(initialConfig.email);

  const handleSave = async () => {
    if (!email) return;
    setIsSaving(true);
    console.log('[v0] PAYPAL CONFIG - Save started:', { email });
    try {
      console.log('[v0] PAYPAL CONFIG - Calling updatePayPalConfig API');
      const response = await fetch('/api/admin/payments/paypal/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies in the request
        body: JSON.stringify({ email }),
      });

      console.log('[v0] PAYPAL CONFIG - API response status:', response.status);
      console.log('[v0] PAYPAL CONFIG - Response headers:', {
        contentType: response.headers.get('content-type'),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[v0] PAYPAL CONFIG - API error response:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to save`);
      }

      const result = await response.json();
      console.log('[v0] PAYPAL CONFIG - Save successful:', result);
      setShowSuccess(true);
      setIsEditing(false);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('[v0] PAYPAL CONFIG - Error saving PayPal config:', {
        error,
        errorMsg,
        email,
        timestamp: new Date().toISOString(),
      });
      // Show error to user
      alert(`Error saving PayPal configuration:\n\n${errorMsg}\n\nCheck browser console for details.`);
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
          <div className="p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <DollarSign className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">PayPal Configuration</h3>
            <p className="text-xs text-white/60 mt-0.5">Configure PayPal business email address</p>
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
          <p className="text-xs text-green-400 font-semibold">PayPal configuration updated successfully</p>
        </div>
      )}

      {/* View Mode */}
      {!isEditing && (
        <div className="mb-4 p-3 bg-white/5 border border-white/10 rounded-lg">
          <p className="text-xs font-semibold text-white/70 mb-1">Business Email</p>
          <p className="text-sm text-foreground break-all">{email}</p>
        </div>
      )}

      {/* Edit Mode */}
      {isEditing && (
        <div className="mb-4">
          <label className="block text-xs font-semibold text-white/70 mb-1.5">Business Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="business@example.com"
            className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 text-xs"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex-1 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors font-semibold text-xs"
          >
            Edit Email
          </button>
        ) : (
          <>
            <button
              onClick={handleSave}
              disabled={isSaving || !email}
              className="flex-1 px-3 py-2 bg-accent text-background rounded-lg hover:bg-accent/90 transition-colors font-semibold text-xs disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEmail(initialConfig.email);
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
