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
    isInitialized && user ? `/api/portfolio/stocks` : null,
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: true, dedupingInterval: 2000 }
  );

  // Update portfolio prices from live market data
  const updatePrices = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await fetch('/api/portfolio/update-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        mutateStocks();
      } else {
        console.error('[v0] Portfolio price update failed:', response.status);
      }
    } catch (error) {
      console.error('[v0] Portfolio price update error:', error instanceof Error ? error.message : String(error));
    }
  }, [user?.id, mutateStocks]);

  // Update prices on mount and periodically (every 60 seconds)
  useEffect(() => {
    if (!user?.id || !isInitialized) return;

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
    async (symbol: string, companyName: string, companyLogo: string, initialPrice: number, investmentAmount: number = 500) => {
      if (!user?.id) {
        console.error('[v0] addStock - User not authenticated');
        throw new Error('User not authenticated');
      }

      try {
        console.log('[v0] addStock - Starting:', { symbol, companyName, initialPrice, investmentAmount, userId: user.id });
        const response = await fetch('/api/portfolio/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            symbol,
            investmentAmount,
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
        console.log('[v0] removeStock - Starting for:', symbol);
        const response = await fetch('/api/portfolio/remove', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbol }),
        });

        if (!response.ok) {
          const data = await response.json();
          console.error('[v0] removeStock - API error:', data);
          throw new Error(data.message || 'Failed to remove stock');
        }

        const result = await response.json();
        console.log('[v0] removeStock - Success:', symbol);

        await mutateStocks();
        await refreshWallet();
        
        return result;
      } catch (error) {
        console.error('[v0] removeStock - Error:', error instanceof Error ? error.message : String(error));
        throw error;
      }
    },
    [user?.id, mutateStocks, refreshWallet]
  );

  // Check if stock is in portfolio - use company_id since that's what the API returns
  const isStockInPortfolio = useCallback(
    (symbol: string) => {
      return stocks.some((stock: any) => stock.symbol === symbol || stock.company_id);
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



