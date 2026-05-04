'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { Check } from 'lucide-react';

interface CurrencySelectorProps {
  onCurrencyChange?: (currency: string) => void;
}

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

export function CurrencySelector({ onCurrencyChange }: CurrencySelectorProps) {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (code: string) => {
    setSelectedCurrency(code);
    onCurrencyChange?.(code);
    setIsOpen(false);
  };

  const currentCurrency = currencies.find((c) => c.code === selectedCurrency);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 border border-border/50 rounded-2xl p-6 backdrop-blur-sm"
    >
      <motion.h2 variants={staggerItem} className="text-xl font-bold text-foreground mb-4">
        Account Preferences
      </motion.h2>

      <motion.div variants={staggerItem} className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-muted-foreground mb-3 block">
            Preferred Currency
          </label>

          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-input border border-border rounded-xl hover:border-accent/50 transition-colors text-foreground"
            >
              <span className="flex items-center gap-2">
                <span className="text-lg font-semibold text-accent">{currentCurrency?.symbol}</span>
                <span>{selectedCurrency}</span>
              </span>
              <svg
                className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>

            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-secondary border border-border rounded-xl shadow-xl z-10 overflow-hidden"
              >
                {currencies.map((currency) => (
                  <button
                    key={currency.code}
                    onClick={() => handleSelect(currency.code)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/50 transition-colors text-foreground text-left border-b border-border/50 last:border-b-0"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-accent w-8">{currency.symbol}</span>
                      <div>
                        <p className="font-semibold">{currency.code}</p>
                        <p className="text-xs text-muted-foreground">{currency.name}</p>
                      </div>
                    </span>
                    {selectedCurrency === currency.code && (
                      <Check className="w-5 h-5 text-accent" />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          <p className="text-xs text-muted-foreground mt-3">
            This currency will be used for all balances and transactions display on your dashboard.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
