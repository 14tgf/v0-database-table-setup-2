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

  // Load from database on mount (when backend is ready)
  // For now, default to USD
  useEffect(() => {
    // TODO: Fetch user's preferred currency from /api/user/preferences
    // const fetchCurrency = async () => {
    //   try {
    //     const res = await fetch('/api/user/preferences');
    //     if (res.ok) {
    //       const data = await res.json();
    //       setSelectedCurrencyState(data.preferredCurrency || 'USD');
    //     }
    //   } catch (error) {
    //     console.error('[v0] Failed to fetch currency preference:', error);
    //   } finally {
    //     setIsReady(true);
    //   }
    // };
    // fetchCurrency();
    
    setIsReady(true);
  }, []);

  const setSelectedCurrency = (code: string) => {
    setSelectedCurrencyState(code);
    // Dispatch custom event for global updates
    window.dispatchEvent(new CustomEvent('currencyChanged', { detail: { currency: code } }));
    
    // TODO: Sync to database when backend is ready
    // fetch('/api/user/preferences', {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ preferredCurrency: code }),
    // }).catch(error => console.error('[v0] Failed to sync currency:', error));
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


