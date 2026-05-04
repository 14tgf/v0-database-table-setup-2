'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw } from 'lucide-react';
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

  return (
    <main className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors text-xs font-semibold"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to Dashboard
            </Link>
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
            className="mb-6 p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-sm"
          >
            <p className="font-semibold">Error loading market data</p>
            <p className="text-xs text-red-400/80">{error}</p>
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
