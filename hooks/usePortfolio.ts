'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import useSWR from 'swr';
import { useAuth } from './useAuth';
import { useWallet } from './useWallet';

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
});

export function usePortfolio() {
  const { user } = useAuth();
  const { refreshWallet } = useWallet();
  const [isInitialized, setIsInitialized] = useState(false);
  const updatePricesRef = useRef<NodeJS.Timeout | null>(null);

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

  console.log('[v0] usePortfolio - user:', user, 'stocks:', stocks.length, 'isLoading:', isLoading);

  // Update portfolio prices from live market data (no deps on mutateStocks to avoid circular refs)
  const updatePrices = useCallback(async () => {
    if (!user?.id) {
      console.log('[v0] Skipping price update - no user');
      return;
    }

    try {
      console.log('[v0] Updating portfolio prices...');
      const response = await fetch('/api/portfolio/update-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        console.log('[v0] Portfolio prices updated');
        // Revalidate portfolio to show updated prices
        mutateStocks();
      } else {
        console.error('[v0] Failed to update prices:', response.statusText);
      }
    } catch (error) {
      console.error('[v0] Update prices error:', error);
    }
  }, [user?.id, mutateStocks]);

  // Update prices on mount and periodically (every 60 seconds)
  useEffect(() => {
    if (!user?.id || !isInitialized) {
      console.log('[v0] Skipping price update interval - user or init not ready');
      return;
    }

    console.log('[v0] Setting up price update interval');

    // Clear existing interval
    if (updatePricesRef.current) {
      clearInterval(updatePricesRef.current);
    }

    // Update immediately on first load
    updatePrices();

    // Update every 60 seconds
    updatePricesRef.current = setInterval(updatePrices, 60000);

    return () => {
      if (updatePricesRef.current) {
        clearInterval(updatePricesRef.current);
        updatePricesRef.current = null;
      }
    };
  }, [user?.id, isInitialized, updatePrices]);

  // Add stock to portfolio
  const addStock = useCallback(
    async (symbol: string, companyName: string, companyLogo: string, initialPrice: number) => {
      if (!user?.id) throw new Error('User not authenticated');

      try {
        console.log('[v0] Adding stock:', { symbol, companyName, initialPrice });
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
          const data = await response.json();
          throw new Error(data.message || 'Failed to add stock');
        }

        const result = await response.json();
        console.log('[v0] Stock added, revalidating portfolio and wallet...');
        // Revalidate portfolio to show the new stock
        await mutateStocks();
        // Refresh wallet to update balance and stock holdings count
        await refreshWallet();
        console.log('[v0] Stock added successfully:', symbol);
        return result;
      } catch (error) {
        console.error('[v0] Add stock error:', error);
        throw error;
      }
    },
    [user?.id, mutateStocks, refreshWallet]
  );

  // Remove stock from portfolio
  const removeStock = useCallback(
    async (symbol: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      try {
        console.log('[v0] Removing stock:', symbol);
        const response = await fetch('/api/portfolio/remove', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, symbol }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to remove stock');
        }

        // Revalidate portfolio
        console.log('[v0] Stock removed, revalidating portfolio and wallet...');
        await mutateStocks();
        // Refresh wallet to update balance and stock holdings count
        await refreshWallet();
        const result = await response.json();
        console.log('[v0] Stock removed successfully:', symbol);
        return result;
      } catch (error) {
        console.error('[v0] Remove stock error:', error);
        throw error;
      }
    },
    [user?.id, mutateStocks, refreshWallet]
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
    mutateStocks,
  };
}



