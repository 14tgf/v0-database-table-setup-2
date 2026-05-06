'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';

interface StockData {
  ticker: string;
  companyName: string;
  logo: string;
  price: number;
  change: number;
  percentChange: number;
  high: number;
  low: number;
  open: number;
  timestamp: number;
  isOwned?: boolean;
}

export function useMarketStocks() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'none' | 'gainers' | 'losers'>('none');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const { user } = useAuth();

  // Fetch stocks
  const fetchStocks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const url = user?.id 
        ? `/api/market/stocks?userId=${user.id}`
        : '/api/market/stocks';

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stocks: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle both array response and object with stocks property
      const stocksArray = Array.isArray(data) ? data : (data.stocks || []);
      
      if (!Array.isArray(stocksArray)) {
        throw new Error('Invalid stock data format received');
      }

      setStocks(stocksArray);
      setLastRefresh(new Date());
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch stock data';
      console.error('[v0] Market fetch error:', errorMsg);
      setError(errorMsg);
      setStocks([]); // Clear stocks on error
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

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
