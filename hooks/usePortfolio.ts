'use client';

import { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import { useAuth } from './useAuth';

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
});

export function usePortfolio() {
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  // Wait for auth to load before fetching portfolio
  useEffect(() => {
    if (user !== undefined) {
      setIsInitialized(true);
    }
  }, [user]);

  // Fetch portfolio stocks
  const { data: stocks = [], isLoading, error, mutate: mutateStocks } = useSWR(
    isInitialized && user ? `/api/portfolio/stocks?userId=${user.id}` : null,
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: true, dedupingInterval: 2000 }
  );

  console.log('[v0] usePortfolio - user:', user, 'stocks:', stocks, 'isLoading:', isLoading);

  // Update portfolio prices from live market data
  const updatePrices = useCallback(async () => {
    if (!user?.id) return;

    try {
      console.log('[v0] Updating portfolio prices...');
      const response = await fetch('/api/portfolio/update-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        // Revalidate portfolio to show updated prices
        await mutateStocks();
        console.log('[v0] Portfolio prices updated');
      }
    } catch (error) {
      console.error('[v0] Update prices error:', error);
    }
  }, [user?.id, mutateStocks]);

  // Update prices on mount and periodically (every 45 seconds)
  useEffect(() => {
    if (!user?.id || !isInitialized) return;

    // Update immediately on mount
    updatePrices();

    // Update every 45 seconds
    const interval = setInterval(updatePrices, 45000);
    return () => clearInterval(interval);
  }, [user?.id, isInitialized, updatePrices]);

  // Add stock to portfolio
  const addStock = useCallback(
    async (symbol: string, companyName: string, companyLogo: string, initialPrice: number) => {
      if (!user?.id) throw new Error('User not authenticated');

      try {
        console.log('[v0] usePortfolio.addStock called with:', { symbol, companyName, initialPrice });
        const response = await fetch('/api/portfolio/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
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

        // Revalidate portfolio to show the new stock
        console.log('[v0] Stock added, revalidating portfolio...');
        await mutateStocks();
        console.log('[v0] Stock added:', symbol);
        return await response.json();
      } catch (error) {
        console.error('[v0] Add stock error:', error);
        throw error;
      }
    },
    [user?.id, mutateStocks]
  );

  // Remove stock from portfolio
  const removeStock = useCallback(
    async (symbol: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      try {
        const response = await fetch('/api/portfolio/remove', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, symbol }),
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
    [user?.id, mutateStocks]
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
    userId: user?.id || null,
    addStock,
    removeStock,
    isStockInPortfolio,
  };
}


