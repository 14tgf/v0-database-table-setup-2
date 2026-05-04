'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { StockData } from '@/lib/finnhub';

export function useMarketStocks() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'none' | 'gainers' | 'losers'>('none');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Fetch stocks
  const fetchStocks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/market/stocks');
      
      if (!response.ok) {
        throw new Error('Failed to fetch stocks');
      }

      const data = await response.json();
      setStocks(data);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('[useMarketStocks] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stock data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStocks();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchStocks]);

  // Filter and sort stocks
  const filteredStocks = useMemo(() => {
    let result = stocks;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.ticker.toLowerCase().includes(query) ||
          s.companyName.toLowerCase().includes(query)
      );
    }

    // Apply sort filter
    if (sortBy === 'gainers') {
      result = result.filter((s) => s.percentChange > 0);
    } else if (sortBy === 'losers') {
      result = result.filter((s) => s.percentChange < 0);
    }

    return result;
  }, [stocks, searchQuery, sortBy]);

  return {
    stocks: filteredStocks,
    allStocks: stocks,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    lastRefresh,
    refetch: fetchStocks,
  };
}
