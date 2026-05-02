'use client';

import { useEffect, useState } from 'react';
import { StockData } from './use-market-data';

interface MarketMoversData {
  gainers: StockData[];
  losers: StockData[];
  loading: boolean;
  error: string | null;
  lastUpdate: string;
}

export function useMarketMovers() {
  const [data, setData] = useState<MarketMoversData>({
    gainers: [],
    losers: [],
    loading: true,
    error: null,
    lastUpdate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  useEffect(() => {
    const fetchMarketMovers = async () => {
      try {
        const response = await fetch('/api/market');
        if (!response.ok) throw new Error('Failed to fetch market data');

        const marketData = await response.json();
        const stocks = marketData.stocks as StockData[];

        // Sort by change percentage
        const sortedByGain = [...stocks].sort((a, b) => b.changePercent - a.changePercent);
        const gainers = sortedByGain.slice(0, 8);
        const losers = sortedByGain.slice(-8).reverse();

        setData({
          gainers,
          losers,
          loading: false,
          error: null,
          lastUpdate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      } catch (err) {
        console.error('[v0] Error fetching market movers:', err);
        setData((prev) => ({
          ...prev,
          loading: false,
          error: 'Failed to load market movers',
        }));
      }
    };

    fetchMarketMovers();
    // Refresh every 30 seconds
    const interval = setInterval(fetchMarketMovers, 30000);
    return () => clearInterval(interval);
  }, []);

  return data;
}
