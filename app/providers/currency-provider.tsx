'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CurrencyContextType {
  selectedCurrency: string;
  setSelectedCurrency: (code: string) => void;
  isReady: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [selectedCurrency, setSelectedCurrencyState] = useState('USD');
  const [isReady, setIsReady] = useState(false);

  // Load from database on mount
  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        const res = await fetch('/api/user/preferences');
        if (res.ok) {
          const data = await res.json();
          if (data.preferredCurrency) {
            setSelectedCurrencyState(data.preferredCurrency);
          }
        }
      } catch (error) {
        console.error('[v0] Failed to fetch currency preference:', error);
      } finally {
        setIsReady(true);
      }
    };

    fetchCurrency();
  }, []);

  const setSelectedCurrency = (code: string) => {
    setSelectedCurrencyState(code);
    // Dispatch custom event for global updates
    window.dispatchEvent(new CustomEvent('currencyChanged', { detail: { currency: code } }));
  };

  return (
    <CurrencyContext.Provider value={{ selectedCurrency, setSelectedCurrency, isReady }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    return {
      selectedCurrency: 'USD',
      setSelectedCurrency: () => {},
      isReady: false,
    };
  }
  return context;
}



