'use client';

import { motion } from 'framer-motion';
import { StockData } from '@/hooks/use-market-data';
import { StockRow } from './stock-row';

interface LosersListProps {
  stocks: StockData[];
  loading: boolean;
}

export function LosersList({ stocks, loading }: LosersListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="flex-1 space-y-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Top Losers</h3>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-red-400" />
          <span className="text-xs text-red-400 font-medium">{stocks.length} stocks</span>
        </div>
      </div>

      {/* Stock List */}
      <div className="space-y-2">
        {loading ? (
          // Skeleton loaders
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse border border-white/10" />
          ))
        ) : stocks.length > 0 ? (
          stocks.map((stock, index) => (
            <StockRow key={stock.symbol} stock={stock} index={index} isGainer={false} />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-white/40">No losers available</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
