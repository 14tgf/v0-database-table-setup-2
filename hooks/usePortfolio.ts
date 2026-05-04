'use client';

import { useState, useEffect, useCallback } from 'react';
import useSWR, { mutate } from 'swr';

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
});

export function usePortfolio() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Get user ID from auth (from JWT cookie)
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUserId(data.userId);
        }
      } catch (error) {
        console.error('[v0] Failed to fetch user:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    getCurrentUser();
  }, []);

  // Fetch portfolio stocks
  const { data: stocks = [], isLoading, error, mutate: mutateStocks } = useSWR(
    isInitialized && userId ? `/api/portfolio/stocks?userId=${userId}` : null,
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: true, dedupingInterval: 5000 }
  );

  // Update portfolio prices from live market data
  const updatePrices = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch('/api/portfolio/update-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        // Revalidate portfolio to show updated prices
        await mutateStocks();
        console.log('[v0] Portfolio prices updated');
      }
    } catch (error) {
      console.error('[v0] Update prices error:', error);
    }
  }, [userId, mutateStocks]);

  // Update prices on mount and periodically (every 45 seconds)
  useEffect(() => {
    if (!userId || !isInitialized) return;

    // Update immediately on mount
    updatePrices();

    // Update every 45 seconds
    const interval = setInterval(updatePrices, 45000);
    return () => clearInterval(interval);
  }, [userId, isInitialized, updatePrices]);

  // Add stock to portfolio
  const addStock = useCallback(
    async (symbol: string, companyName: string, companyLogo: string, initialPrice: number) => {
      if (!userId) throw new Error('User not authenticated');

      try {
        const response = await fetch('/api/portfolio/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            symbol,
            companyName,
            companyLogo,
            initialPrice,
            currentPrice: initialPrice,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to add stock');
        }

        // Revalidate portfolio
        await mutateStocks();
        console.log('[v0] Stock added:', symbol);
        return await response.json();
      } catch (error) {
        console.error('[v0] Add stock error:', error);
        throw error;
      }
    },
    [userId, mutateStocks]
  );

  // Remove stock from portfolio
  const removeStock = useCallback(
    async (symbol: string) => {
      if (!userId) throw new Error('User not authenticated');

      try {
        const response = await fetch('/api/portfolio/remove', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, symbol }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to remove stock');
        }

        // Revalidate portfolio
        await mutateStocks();
        console.log('[v0] Stock removed:', symbol);
        return await response.json();
      } catch (error) {
        console.error('[v0] Remove stock error:', error);
        throw error;
      }
    },
    [userId, mutateStocks]
  );

  // Check if stock is in portfolio
  const isStockInPortfolio = useCallback(
    (symbol: string) => {
      return stocks.some((stock: any) => stock.symbol === symbol);
    },
    [stocks]
  );

  return {
    stocks,
    isLoading: !isInitialized || isLoading,
    error,
    userId,
    addStock,
    removeStock,
    isStockInPortfolio,
  };
}

