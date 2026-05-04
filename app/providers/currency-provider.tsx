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

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('preferredCurrency');
    if (saved) {
      setSelectedCurrencyState(saved);
    }
    setIsReady(true);
  }, []);

  const setSelectedCurrency = (code: string) => {
    setSelectedCurrencyState(code);
    localStorage.setItem('preferredCurrency', code);
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
    // Return default value for SSR compatibility
    return {
      selectedCurrency: 'USD',
      setSelectedCurrency: () => {},
      isReady: false,
    };
  }
  return context;
}

