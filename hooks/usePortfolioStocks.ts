'use client';

import useSWR from 'swr';

interface PortfolioStock {
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

interface PortfolioMetrics {
  totalStocks: number;
  totalInvested: number;
  totalCurrentValue: number;
  totalProfitLoss: number;
  portfolioPercentChange: number;
  winningStocks: number;
  losingStocks: number;
}

interface PortfolioResponse {
  success: boolean;
  stocks: PortfolioStock[];
  portfolio: PortfolioMetrics;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch portfolio');
  }
  return res.json();
};

export function usePortfolioStocks() {
  const { data, error, isLoading, mutate } = useSWR<PortfolioResponse>(
    '/api/portfolio/list',
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 10000, // 10 seconds
    }
  );

  const addStock = async (symbol: string, companyName: string, companyLogo: string, initialPrice: number) => {
    try {
      const response = await fetch('/api/portfolio/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, companyName, companyLogo, initialPrice }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add stock');
      }

      // Refresh portfolio
      await mutate();
      return { success: true, ...result };
    } catch (error) {
      console.error('[v0] Add stock error:', error);
      throw error;
    }
  };

  const removeStock = async (symbol: string) => {
    try {
      const response = await fetch(`/api/portfolio/remove?symbol=${symbol}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to remove stock');
      }

      // Refresh portfolio
      await mutate();
      return { success: true, ...result };
    } catch (error) {
      console.error('[v0] Remove stock error:', error);
      throw error;
    }
  };

  const refreshPrices = async () => {
    try {
      const response = await fetch('/api/portfolio/update-prices', {
        method: 'POST',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update prices');
      }

      // Refresh portfolio
      await mutate();
      return result;
    } catch (error) {
      console.error('[v0] Refresh prices error:', error);
      throw error;
    }
  };

  const isStockInPortfolio = (symbol: string): boolean => {
    return data?.stocks?.some((s) => s.symbol === symbol) || false;
  };

  return {
    stocks: data?.stocks || [],
    portfolio: data?.portfolio,
    isLoading,
    error: error ? error.message : null,
    addStock,
    removeStock,
    refreshPrices,
    isStockInPortfolio,
    mutate,
  };
}
