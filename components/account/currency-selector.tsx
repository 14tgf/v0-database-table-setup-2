'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { Check, Search, X as XIcon } from 'lucide-react';
import { useCurrency } from '@/app/providers/currency-provider';
import { CURRENCIES } from '@/lib/currency';

export function CurrencySelector() {
  const { selectedCurrency, setSelectedCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCurrencies, setFilteredCurrencies] = useState(CURRENCIES);

  useEffect(() => {
    const filtered = CURRENCIES.filter((currency) => {
      const query = searchQuery.toLowerCase();
      return (
        currency.code.toLowerCase().includes(query) ||
        currency.name.toLowerCase().includes(query) ||
        currency.symbol.toLowerCase().includes(query)
      );
    });
    setFilteredCurrencies(filtered);
  }, [searchQuery]);

  const handleSelect = (code: string) => {
    setSelectedCurrency(code);
    setIsOpen(false);
    setSearchQuery('');
  };

  const currentCurrency = CURRENCIES.find((c) => c.code === selectedCurrency);

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
                <span>{selectedCurrency} — {currentCurrency?.name}</span>
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
                className="absolute top-full left-0 right-0 mt-2 bg-secondary border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
              >
                {/* Search Input */}
                <div className="p-3 border-b border-border/50 sticky top-0 bg-secondary z-50">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search currencies..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 transition-colors"
                      autoFocus
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Currency List */}
                <div className="max-h-80 overflow-y-auto">
                  {filteredCurrencies.length > 0 ? (
                    filteredCurrencies.map((currency) => (
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
                    ))
                  ) : (
                    <div className="p-6 text-center text-muted-foreground">
                      <p className="text-sm">No currencies found</p>
                    </div>
                  )}
                </div>
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

