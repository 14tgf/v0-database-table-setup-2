'use client';

import { useState, useEffect } from 'react';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { Check, Search, X as XIcon } from 'lucide-react';
import { useCurrency } from '@/app/providers/currency-provider';
import { CURRENCIES } from '@/lib/currency';
import { motion } from 'framer-motion';

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
      className="bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 border border-border/50 rounded-2xl p-6 backdrop-blur-sm relative"
    >
      <motion.h2 variants={staggerItem} className="text-lg font-bold text-foreground mb-3">
        Account Preferences
      </motion.h2>

      <motion.div variants={staggerItem} className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-2 block">
            Preferred Currency
          </label>

          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full flex items-center justify-between px-3 py-2 bg-input border border-border rounded-lg hover:border-accent/50 transition-colors text-foreground text-sm"
            >
              <span className="flex items-center gap-1.5">
                <span className="text-base font-semibold text-accent">{currentCurrency?.symbol}</span>
                <span className="text-sm">{selectedCurrency} — {currentCurrency?.name}</span>
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
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsOpen(false)}
                  style={{ zIndex: 40 }}
                />

                {/* Dropdown Menu */}
                <div
                  className="absolute top-full left-0 right-0 mt-2 bg-secondary border border-border rounded-lg shadow-2xl z-50 overflow-hidden max-h-64"
                  style={{ zIndex: 50 }}
                >
                  {/* Search Input */}
                  <div className="p-2 border-b border-border/50 bg-secondary">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-2.5 py-1.5 bg-input border border-border rounded-lg text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 transition-colors"
                        autoFocus
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <XIcon className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Currency List */}
                  <div className="max-h-60 overflow-y-auto">
                    {filteredCurrencies.length > 0 ? (
                      filteredCurrencies.map((currency) => (
                        <button
                          key={currency.code}
                          onClick={() => handleSelect(currency.code)}
                          className="w-full flex items-center justify-between px-3 py-2 hover:bg-secondary/50 transition-colors text-foreground text-left border-b border-border/50 last:border-b-0"
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-base font-semibold text-accent w-6">{currency.symbol}</span>
                            <div>
                              <p className="text-xs font-semibold">{currency.code}</p>
                              <p className="text-xs text-muted-foreground">{currency.name}</p>
                            </div>
                          </span>
                          {selectedCurrency === currency.code && (
                            <Check className="w-4 h-4 text-accent" />
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">
                        <p className="text-xs">No currencies found</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <p className="text-xs text-muted-foreground mt-2">
            This currency will be used for all balances and transactions display on your dashboard.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

