'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface StockData {
  ticker: string;
  symbol?: string; // Fallback for compatibility
  companyName: string;
  name?: string; // Fallback for compatibility
  logo: string;
  price: number;
  change: number;
  percentChange?: number;
  changePercent?: number;
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
      const response = await fetch('/api/market/stocks');
      if (!response.ok) {
        throw new Error('Failed to fetch market data');
      }
      const data = await response.json();
      
      // Handle both array response and object with stocks property
      const stocksArray = Array.isArray(data) ? data : (data.stocks || []);
      
      if (!Array.isArray(stocksArray)) {
        throw new Error('Invalid market data format');
      }

      // Normalize the data structure (add fallback fields)
      const normalizedStocks = stocksArray.map((stock: any) => ({
        ticker: stock.ticker || stock.symbol,
        symbol: stock.symbol || stock.ticker, // Fallback for compatibility
        companyName: stock.companyName || stock.name,
        name: stock.name || stock.companyName, // Fallback for compatibility
        logo: stock.logo || '',
        price: parseFloat(stock.price) || 0,
        change: parseFloat(stock.change) || 0,
        changePercent: parseFloat(stock.percentChange || stock.changePercent) || 0,
        percentChange: parseFloat(stock.percentChange || stock.changePercent) || 0,
        high: parseFloat(stock.high) || 0,
        low: parseFloat(stock.low) || 0,
        open: parseFloat(stock.open) || 0,
        timestamp: stock.timestamp || Date.now(),
      }));

      setStocks(normalizedStocks);
      setError(null);
      setLastUpdate(Date.now());
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('[v0] Market data fetch error:', errorMsg);
      setError(errorMsg);
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
        const response = await fetch(`/api/market/stocks?symbol=${symbol}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${symbol}`);
        }
        const data = await response.json();
        
        // Normalize the response
        const normalizedStock = {
          ticker: data.ticker || data.symbol,
          symbol: data.symbol || data.ticker,
          companyName: data.companyName || data.name,
          name: data.name || data.companyName,
          logo: data.logo || '',
          price: parseFloat(data.price) || 0,
          change: parseFloat(data.change) || 0,
          changePercent: parseFloat(data.percentChange || data.changePercent) || 0,
          percentChange: parseFloat(data.percentChange || data.changePercent) || 0,
          high: parseFloat(data.high) || 0,
          low: parseFloat(data.low) || 0,
          open: parseFloat(data.open) || 0,
          timestamp: data.timestamp || Date.now(),
        };
        
        setStock(normalizedStock);
        setError(null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        console.error(`[v0] Stock fetch error for ${symbol}:`, errorMsg);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchStock();
  }, [symbol]);

  return { stock, loading, error };
}
