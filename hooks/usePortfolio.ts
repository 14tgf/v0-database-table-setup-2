'use client';

import { useCallback } from 'react';
import useSWR from 'swr';
import { useAuth } from './useAuth';

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
});

export function usePortfolio() {
  const { user } = useAuth();

  // Fetch portfolio stocks - only when user is loaded
  const { data: stocks = [], isLoading, error, mutate: mutateStocks } = useSWR(
    user?.id ? `/api/portfolio/stocks?userId=${user.id}` : null,
    fetcher,
    { 
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      errorRetryCount: 2,
      errorRetryInterval: 3000
    }
  );

  // Add stock to portfolio (buy 1 share)
  const addStock = useCallback(
    async (symbol: string, companyName: string, companyLogo: string, initialPrice: number) => {
      if (!user?.id) throw new Error('User not authenticated');

      try {
        console.log('[v0] Buying stock:', { symbol, companyName, initialPrice });
        const response = await fetch('/api/portfolio/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            symbol,
            companyName,
            companyLogo,
            initialPrice,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to purchase stock');
        }

        console.log('[v0] Stock purchased successfully, revalidating portfolio...', data);
        // Revalidate portfolio to show the new holding
        await mutateStocks();
        return data;
      } catch (error) {
        console.error('[v0] Add stock error:', error);
        throw error;
      }
    },
    [user?.id, mutateStocks]
  );

  // Remove stock from portfolio (sell at current price)
  const removeStock = useCallback(
    async (symbol: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      try {
        console.log('[v0] Selling stock:', symbol);
        const response = await fetch('/api/portfolio/remove', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, symbol }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to sell stock');
        }

        console.log('[v0] Stock sold successfully, revalidating portfolio...', data);
        // Revalidate portfolio
        await mutateStocks();
        return data;
      } catch (error) {
        console.error('[v0] Remove stock error:', error);
        throw error;
      }
    },
    [user?.id, mutateStocks]
  );

  // Check if stock is in portfolio
  const isStockInPortfolio = useCallback(
    (symbol: string) => {
      return stocks.some((stock: any) => stock.symbol === symbol && stock.status === 'active');
    },
    [stocks]
  );

  return {
    stocks,
    isLoading,
    error,
    userId: user?.id || null,
    addStock,
    removeStock,
    isStockInPortfolio,
    mutateStocks,
  };
}




