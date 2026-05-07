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
      console.log('[v0] useMarketStocks - Fetch starting');
      setIsLoading(true);
      setError(null);

      const url = user?.id 
        ? `/api/market/stocks?userId=${user.id}`
        : '/api/market/stocks';

      console.log('[v0] useMarketStocks - Fetching from URL:', url);

      const response = await fetch(url);
      
      console.log('[v0] useMarketStocks - Response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: {
          contentType: response.headers.get('content-type'),
          cacheControl: response.headers.get('cache-control'),
        },
      });
      
      if (!response.ok) {
        console.warn('[v0] useMarketStocks - Response not OK, attempting to parse error body');
        let errorBody: any = {};
        try {
          const contentType = response.headers.get('content-type');
          if (contentType?.includes('application/json')) {
            errorBody = await response.json();
            console.error('[v0] useMarketStocks - Error response body:', errorBody);
          } else {
            const text = await response.text();
            console.error('[v0] useMarketStocks - Error response text:', text);
            errorBody = { error: text };
          }
        } catch (parseErr) {
          console.error('[v0] useMarketStocks - Failed to parse error response:', parseErr);
        }
        
        const errorMessage = errorBody.details || errorBody.error || `HTTP ${response.status}`;
        const fullError = `Failed to fetch stocks: ${response.status} - ${errorMessage}`;
        console.error('[v0] useMarketStocks - Throwing error:', fullError);
        throw new Error(fullError);
      }

      console.log('[v0] useMarketStocks - Parsing response JSON');
      const data = await response.json();
      
      console.log('[v0] useMarketStocks - Response data received:', {
        dataType: typeof data,
        isArray: Array.isArray(data),
        dataLength: Array.isArray(data) ? data.length : 'N/A',
        sampleItem: Array.isArray(data) ? data[0] : undefined,
      });
      
      // Handle both array response and object with stocks property
      const stocksArray = Array.isArray(data) ? data : (data.stocks || []);
      
      if (!Array.isArray(stocksArray)) {
        console.error('[v0] useMarketStocks - Invalid data format:', {
          received: typeof stocksArray,
          data: stocksArray,
        });
        throw new Error('Invalid stock data format received');
      }

      console.log('[v0] useMarketStocks - Stocks loaded successfully:', stocksArray.length);
      setStocks(stocksArray);
      setLastRefresh(new Date());
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      const errorStack = err instanceof Error ? err.stack : '';
      console.error('[v0] useMarketStocks - Catch error:', {
        message: errorMsg,
        stack: errorStack,
        error: err,
      });
      setError(errorMsg);
      setStocks([]); // Clear stocks on error
    } finally {
      console.log('[v0] useMarketStocks - Fetch complete, isLoading set to false');
      setIsLoading(false);
    }
  }, [user?.id]);

  // Initial fetch
  useEffect(() => {
    console.log('[v0] useMarketStocks - useEffect initial fetch triggered');
    fetchStocks();
  }, [fetchStocks]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    console.log('[v0] useMarketStocks - Setting up auto-refresh interval');
    const interval = setInterval(() => {
      console.log('[v0] useMarketStocks - Auto-refresh triggered');
      fetchStocks();
    }, 30000);

    return () => {
      console.log('[v0] useMarketStocks - Cleaning up auto-refresh interval');
      clearInterval(interval);
    };
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
