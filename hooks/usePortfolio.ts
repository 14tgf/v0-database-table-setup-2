'use client';

import { useState, useEffect, useCallback } from 'react';
import useSWR, { mutate } from 'swr';

export interface PortfolioStock {
  id: string;
  symbol: string;
  companyName: string;
  companyLogo: string;
  initialPrice: number;
  currentPrice: number;
  quantity: number;
  investedAmount: number;
  profitLoss: number;
  percentChange: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function usePortfolio() {
  const [userId, setUserId] = useState<string | null>(null);

  // Get user ID from auth (from session/cookie)
  useEffect(() => {
    const getUserId = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUserId(data.userId);
        }
      } catch (error) {
        console.error('[v0] Failed to fetch user:', error);
      }
    };

    getUserId();
  }, []);

  // Fetch portfolio stocks
  const { data: stocks = [], isLoading, error } = useSWR(
    userId ? `/api/portfolio/stocks?userId=${userId}` : null,
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: true }
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
        mutate(`/api/portfolio/stocks?userId=${userId}`);
      }
    } catch (error) {
      console.error('[v0] Update prices error:', error);
    }
  }, [userId]);

  // Update prices on mount and periodically
  useEffect(() => {
    if (!userId) return;

    // Update immediately on mount
    updatePrices();

    // Update every 30 seconds
    const interval = setInterval(updatePrices, 30000);
    return () => clearInterval(interval);
  }, [userId, updatePrices]);

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
        mutate(`/api/portfolio/stocks?userId=${userId}`);
        return await response.json();
      } catch (error) {
        console.error('[v0] Add stock error:', error);
        throw error;
      }
    },
    [userId]
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
        mutate(`/api/portfolio/stocks?userId=${userId}`);
        return await response.json();
      } catch (error) {
        console.error('[v0] Remove stock error:', error);
        throw error;
      }
    },
    [userId]
  );

  // Check if stock is in portfolio
  const isStockInPortfolio = useCallback(
    (symbol: string) => {
      return stocks.some((stock: PortfolioStock) => stock.symbol === symbol);
    },
    [stocks]
  );

  return {
    stocks,
    isLoading,
    error,
    userId,
    addStock,
    removeStock,
    isStockInPortfolio,
  };
}
