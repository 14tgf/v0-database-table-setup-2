'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { RotateCcw, Save } from 'lucide-react';
import { useCurrency } from '@/app/providers/currency-provider';

interface AccountActionsProps {
  onSave?: () => void;
  onReset?: () => void;
  selectedCurrency?: string;
}

export function AccountActions({ onSave, onReset, selectedCurrency }: AccountActionsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedCurrency: contextCurrency } = useCurrency();

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const currencyToSave = selectedCurrency || contextCurrency;

      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferredCurrency: currencyToSave }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save preferences');
      }

      onSave?.();
    } catch (err) {
      console.error('[v0] Save error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-auto z-30"
    >
      <motion.div
        variants={staggerItem}
        className="bg-gradient-to-r from-secondary/95 to-secondary/90 border border-border/50 rounded-xl p-4 backdrop-blur-sm shadow-lg"
      >
        {error && (
          <div className="mb-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        <div className="flex items-center gap-3 flex-wrap justify-end">
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 bg-secondary/80 hover:bg-secondary border border-border rounded-lg text-muted-foreground hover:text-foreground transition-all duration-300 font-medium text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-accent/80 to-accent text-background hover:shadow-lg hover:shadow-accent/50 disabled:opacity-50 disabled:hover:shadow-none border border-accent/50 rounded-lg font-semibold text-sm transition-all duration-300 transform hover:scale-105"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
