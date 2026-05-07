'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { useEffect } from 'react';
import { MarketHeader } from '@/components/market/market-header';
import { MarketFilters } from '@/components/market/market-filters';
import { StockGrid } from '@/components/market/stock-grid';
import { useMarketStocks } from '@/hooks/useMarketStocks';

export default function MarketPage() {
  const {
    stocks,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    lastRefresh,
    refetch,
  } = useMarketStocks();

  // Log page state
  useEffect(() => {
    console.log('[v0] MarketPage - State updated:', {
      stocksCount: stocks.length,
      isLoading,
      error,
      sortBy,
      searchQuery,
    });
  }, [stocks, isLoading, error, sortBy, searchQuery]);

  return (
    <main className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between mb-3">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image 
                src="/logo.png" 
                alt="X Holding" 
                width={80} 
                height={40}
                className="w-auto h-10"
              />
            </Link>
          </div>
          {/* Top Navigation Links */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            <Link href="/dashboard" className="px-3 py-1.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap">Dashboard</Link>
            <Link href="/dashboard/wallet" className="px-3 py-1.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap">Wallet</Link>
            <Link href="/dashboard/investment-plans" className="px-3 py-1.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap">Plans</Link>
            <Link href="/dashboard/investments" className="px-3 py-1.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap">My Investments</Link>
            <Link href="/market" className="px-3 py-1.5 rounded-lg text-sm text-white font-semibold bg-accent/20 border border-accent/50 whitespace-nowrap">Stocks</Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <MarketHeader />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error State */}
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg border border-red-500/30 bg-red-500/10"
          >
            <p className="font-semibold text-red-400">Error loading market data</p>
            <p className="text-sm text-red-400/80 mt-1">{error}</p>
            <details className="mt-3 text-xs">
              <summary className="text-red-400/60 cursor-pointer hover:text-red-400 font-semibold">
                View Details
              </summary>
              <div className="mt-2 bg-red-500/5 p-3 rounded border border-red-500/20 font-mono text-red-300/60 max-h-32 overflow-auto">
                <p>Check the browser console (F12 → Console tab) for detailed error logs.</p>
                <p className="mt-2 text-xs text-red-400/40">Error: {error}</p>
              </div>
            </details>
            <button
              onClick={refetch}
              className="mt-3 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 transition-all text-sm font-semibold"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* Filters */}
        <MarketFilters
          stocks={stocks}
          searchQuery={searchQuery}
          sortBy={sortBy}
          onSearchChange={setSearchQuery}
          onSortChange={setSortBy}
        />

        {/* Refresh Button and Last Update */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6 flex items-center justify-between text-xs text-white/60"
        >
          <div>
            {lastRefresh && (
              <p>
                Last updated: {lastRefresh.toLocaleTimeString()}
              </p>
            )}
          </div>
          <button
            onClick={refetch}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-accent/30 bg-accent/10 text-accent hover:bg-accent/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </motion.div>

        {/* Stock Grid */}
        <StockGrid stocks={stocks} isLoading={isLoading} />
      </div>
    </main>
  );
}
