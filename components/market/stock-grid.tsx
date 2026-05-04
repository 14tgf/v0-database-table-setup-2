'use client';

import { motion } from 'framer-motion';
import { StockData } from '@/lib/finnhub';
import { StockCard } from './stock-card';

interface StockGridProps {
  stocks: StockData[];
  isLoading?: boolean;
}

export function StockGrid({ stocks, isLoading }: StockGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-4 h-32 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (stocks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <p className="text-white/60">No stock data available. Please try again later.</p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stocks.map((stock, index) => (
        <StockCard key={stock.ticker} stock={stock} index={index} />
      ))}
    </div>
  );
}
