'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react';
import { usePortfolioStocks } from '@/hooks/usePortfolioStocks';
import { useState, useEffect } from 'react';

export function PortfolioWidget() {
  const { stocks, portfolio, isLoading, refreshPrices, removeStock } = usePortfolioStocks();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [priceUpdateTimer, setPriceUpdateTimer] = useState<NodeJS.Timeout | null>(null);

  // Auto-refresh prices every 60 seconds
  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      try {
        await refreshPrices();
      } catch (error) {
        console.error('[v0] Auto refresh failed:', error);
      }
    }, 60000); // 60 seconds

    setPriceUpdateTimer(refreshInterval);

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [refreshPrices]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshPrices();
    } catch (error) {
      console.error('[v0] Manual refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRemoveStock = async (symbol: string) => {
    try {
      await removeStock(symbol);
    } catch (error) {
      console.error('[v0] Remove failed:', error);
    }
  };

  if (isLoading && stocks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-6 backdrop-blur-xl"
      >
        <div className="text-center">
          <p className="text-white/60 text-sm">Loading portfolio...</p>
        </div>
      </motion.div>
    );
  }

  const totalStocks = portfolio?.totalStocks || 0;

  if (totalStocks === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-6 backdrop-blur-xl text-center"
      >
        <h3 className="text-lg font-bold text-white mb-2">Your Stock Portfolio</h3>
        <p className="text-white/60 text-sm mb-4">Start building your portfolio by adding stocks from the market.</p>
        <Link
          href="/market"
          className="inline-block px-4 py-2 bg-accent text-background rounded-lg font-medium text-sm hover:bg-accent/90 transition-colors"
        >
          Browse Stocks
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 backdrop-blur-xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-white">Stock Portfolio</h3>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-accent/20 hover:bg-accent/30 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-accent ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Portfolio Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/5 rounded-lg p-2">
            <p className="text-white/60 text-xs mb-1">Active Stocks</p>
            <p className="text-lg font-bold text-white">{portfolio?.totalStocks || 0}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-2">
            <p className="text-white/60 text-xs mb-1">Total Invested</p>
            <p className="text-lg font-bold text-white">${(portfolio?.totalInvested || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-2">
            <p className="text-white/60 text-xs mb-1">Current Value</p>
            <p className="text-lg font-bold text-white">${(portfolio?.totalCurrentValue || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-2">
            <p className="text-white/60 text-xs mb-1">Total Return</p>
            <p className={`text-lg font-bold ${portfolio && portfolio.totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {portfolio && portfolio.totalProfitLoss >= 0 ? '+' : ''}{(portfolio?.totalProfitLoss || 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Stocks List */}
      <div className="p-4 sm:p-6 space-y-3 max-h-96 overflow-y-auto">
        {stocks.map((stock) => {
          const isPositive = stock.profitLoss >= 0;
          const isWinning = isPositive ? 'bg-green-500/5 border-green-500/30' : 'bg-red-500/5 border-red-500/30';

          return (
            <motion.div
              key={stock.symbol}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-3 rounded-lg border ${isWinning} transition-all`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-white text-sm">{stock.symbol}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {isPositive ? '+' : ''}{stock.percentChange.toFixed(2)}%
                    </span>
                  </div>
                  <p className="text-white/60 text-xs truncate">{stock.companyName}</p>

                  {/* Price Info */}
                  <div className="flex gap-3 text-xs mt-1">
                    <div>
                      <p className="text-white/60">Entry: ${stock.initialPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-white/60">Current: ${stock.currentPrice.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Profit/Loss Display */}
                <div className="text-right flex-shrink-0">
                  <div className={`flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownLeft className="w-3 h-3" />
                    )}
                    <p className="font-semibold text-xs">${stock.profitLoss.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveStock(stock.symbol)}
                    className="mt-1 text-white/40 hover:text-red-400 text-xs transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* View Full Portfolio Link */}
      <div className="p-4 border-t border-white/10 bg-white/5">
        <Link
          href="/portfolio"
          className="block text-center text-accent hover:text-accent/80 text-xs sm:text-sm font-medium transition-colors"
        >
          View Full Portfolio →
        </Link>
      </div>
    </motion.div>
  );
}
