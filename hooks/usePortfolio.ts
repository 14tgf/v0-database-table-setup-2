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
      console.log('[v0] usePortfolio - Auth ready, userId:', user?.id);
      setIsInitialized(true);
    }
  }, [user]);

  // Fetch portfolio stocks
  const { data: stocks = [], isLoading, error, mutate: mutateStocks } = useSWR(
    isInitialized && user ? `/api/portfolio/stocks?userId=${user.id}` : null,
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: true, dedupingInterval: 2000 }
  );

  // Log fetch state changes
  useEffect(() => {
    console.log('[v0] usePortfolio - Fetch State:', {
      isInitialized,
      userId: user?.id,
      isLoading,
      stocksCount: stocks?.length || 0,
      hasError: !!error,
      errorMessage: error?.message,
      timestamp: new Date().toISOString(),
    });
  }, [isInitialized, user?.id, isLoading, stocks?.length, error]);

  console.log('[v0] usePortfolio - user:', user?.id, 'stocks:', stocks.length, 'isLoading:', isLoading);

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
      if (!user?.id) {
        console.error('[v0] addStock - User not authenticated');
        throw new Error('User not authenticated');
      }

      try {
        console.log('[v0] addStock - Starting:', { symbol, companyName, initialPrice, userId: user.id });
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

        console.log('[v0] addStock - API response status:', response.status);

        if (!response.ok) {
          const data = await response.json();
          console.error('[v0] addStock - API error:', { status: response.status, data });
          throw new Error(data.message || 'Failed to add stock');
        }

        const result = await response.json();
        console.log('[v0] addStock - API success:', result);
        console.log('[v0] addStock - Revalidating portfolio and wallet...');
        
        // Revalidate portfolio to show the new stock
        await mutateStocks();
        // Refresh wallet to update balance and stock holdings count
        await refreshWallet();
        
        console.log('[v0] addStock - Complete:', symbol);
        return result;
      } catch (error) {
        console.error('[v0] addStock - Error:', {
          symbol,
          error,
          errorMsg: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        });
        throw error;
      }
    },
    [user?.id, mutateStocks, refreshWallet]
  );

  // Remove stock from portfolio
  const removeStock = useCallback(
    async (symbol: string) => {
      if (!user?.id) {
        console.error('[v0] removeStock - User not authenticated');
        throw new Error('User not authenticated');
      }

      try {
        console.log('[v0] removeStock - Starting:', { symbol, userId: user.id });
        const response = await fetch('/api/portfolio/remove', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, symbol }),
        });

        console.log('[v0] removeStock - API response status:', response.status);

        if (!response.ok) {
          const data = await response.json();
          console.error('[v0] removeStock - API error:', { status: response.status, data });
          throw new Error(data.message || 'Failed to remove stock');
        }

        const result = await response.json();
        console.log('[v0] removeStock - API success:', {
          symbol,
          salePrice: result.salePrice,
          realizedProfitLoss: result.realizedProfitLoss,
          newWalletBalance: result.newWalletBalance,
        });

        // Revalidate portfolio
        console.log('[v0] removeStock - Revalidating portfolio and wallet...');
        await mutateStocks();
        // Refresh wallet to update balance and stock holdings count
        await refreshWallet();
        
        console.log('[v0] removeStock - Complete:', symbol);
        return result;
      } catch (error) {
        console.error('[v0] removeStock - Error:', {
          symbol,
          error,
          errorMsg: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        });
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



