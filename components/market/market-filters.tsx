'use client';

import { motion } from 'framer-motion';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';
import { StockData } from '@/lib/finnhub';

interface MarketFiltersProps {
  stocks: StockData[];
  searchQuery: string;
  sortBy: 'none' | 'gainers' | 'losers';
  onSearchChange: (query: string) => void;
  onSortChange: (sort: 'none' | 'gainers' | 'losers') => void;
}

export function MarketFilters({
  stocks,
  searchQuery,
  sortBy,
  onSearchChange,
  onSortChange,
}: MarketFiltersProps) {
  const gainers = stocks.filter((s) => s.percentChange > 0).length;
  const losers = stocks.filter((s) => s.percentChange < 0).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-4 mb-6"
    >
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by ticker or company name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:border-accent/50 focus:bg-white/10 transition-all text-sm"
        />
      </div>

      {/* Sort Buttons and Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/60">Sort:</span>
          <button
            onClick={() => onSortChange('none')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              sortBy === 'none'
                ? 'bg-accent/20 border border-accent/50 text-accent'
                : 'bg-white/5 border border-white/10 text-white/70 hover:border-white/30'
            }`}
          >
            All
          </button>
          <button
            onClick={() => onSortChange('gainers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              sortBy === 'gainers'
                ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                : 'bg-white/5 border border-white/10 text-white/70 hover:border-white/30'
            }`}
          >
            <TrendingUp className="w-3 h-3" /> Gainers ({gainers})
          </button>
          <button
            onClick={() => onSortChange('losers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              sortBy === 'losers'
                ? 'bg-red-500/20 border border-red-500/50 text-red-400'
                : 'bg-white/5 border border-white/10 text-white/70 hover:border-white/30'
            }`}
          >
            <TrendingDown className="w-3 h-3" /> Losers ({losers})
          </button>
        </div>

        {/* Results count */}
        <span className="text-xs text-white/60">
          Showing {stocks.length} stocks
        </span>
      </div>
    </motion.div>
  );
}
