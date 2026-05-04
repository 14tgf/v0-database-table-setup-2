'use client';

import { useCurrency } from '@/app/providers/currency-provider';
import { formatCurrency, getCurrencySymbol } from '@/lib/currency';
import { useEffect, useState } from 'react';

export function useCurrencyFormatter() {
  const { selectedCurrency } = useCurrency();
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const handleCurrencyChange = () => {
      forceUpdate((prev) => prev + 1);
    };

    window.addEventListener('currencyChanged', handleCurrencyChange);
    return () => window.removeEventListener('currencyChanged', handleCurrencyChange);
  }, []);

  return {
    currency: selectedCurrency,
    format: (amount: number) => formatCurrency(amount, selectedCurrency),
    symbol: getCurrencySymbol(selectedCurrency),
  };
}
