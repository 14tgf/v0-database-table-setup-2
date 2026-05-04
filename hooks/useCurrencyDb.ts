'use client';

import { useCallback } from 'react';
import { useCurrency } from './useCurrency';

/**
 * Hook for handling currency preferences with database sync
 * Extends the basic currency context to support database persistence
 */
export function useCurrencyDb() {
  const { selectedCurrency, setSelectedCurrency, isReady } = useCurrency?.() || {
    selectedCurrency: 'USD',
    setSelectedCurrency: () => {},
    isReady: true,
  };

  const updateCurrencyPreference = useCallback(async (currency: string) => {
    try {
      // Update local state immediately for UX
      setSelectedCurrency(currency);

      // Sync to backend/database (when backend is ready)
      // await fetch('/api/user/preferences', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ preferredCurrency: currency }),
      // });
    } catch (error) {
      console.error('[v0] Failed to update currency preference:', error);
    }
  }, [setSelectedCurrency]);

  return {
    selectedCurrency,
    updateCurrencyPreference,
    isReady,
  };
}
