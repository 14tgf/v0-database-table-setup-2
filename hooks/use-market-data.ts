'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  timestamp: number;
}

interface UseMarketDataReturn {
  stocks: StockData[];
  loading: boolean;
  error: string | null;
  lastUpdate: number;
}

const REFETCH_INTERVAL = 5000; // 5 seconds

export function useMarketData(): UseMarketDataReturn {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchMarketData = useCallback(async () => {
    try {
      const response = await fetch('/api/market');
      if (!response.ok) {
        throw new Error('Failed to fetch market data');
      }
      const data = await response.json();
      setStocks(data.stocks || []);
      setError(null);
      setLastUpdate(Date.now());
    } catch (err) {
      console.error('[v0] Market data fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchMarketData();

    // Set up interval for refetching
    intervalRef.current = setInterval(fetchMarketData, REFETCH_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchMarketData]);

  return {
    stocks,
    loading,
    error,
    lastUpdate,
  };
}

export function useSingleStock(symbol: string) {
  const [stock, setStock] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const response = await fetch(`/api/market?symbol=${symbol}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${symbol}`);
        }
        const data = await response.json();
        setStock(data);
        setError(null);
      } catch (err) {
        console.error(`[v0] Stock fetch error for ${symbol}:`, err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchStock();
  }, [symbol]);

  return { stock, loading, error };
}
