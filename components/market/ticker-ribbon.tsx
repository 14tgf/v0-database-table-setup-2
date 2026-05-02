'use client';

import { motion } from 'framer-motion';
import { StockData } from '@/hooks/use-market-data';

interface TickerRibbonProps {
  stocks: StockData[];
}

const STOCK_COLORS: Record<string, string> = {
  TSLA: 'from-red-500/80 to-red-600/80',
  AAPL: 'from-slate-500/80 to-slate-600/80',
  NVDA: 'from-green-500/80 to-green-600/80',
  MSFT: 'from-blue-500/80 to-blue-600/80',
  AMZN: 'from-orange-500/80 to-orange-600/80',
  GOOGL: 'from-cyan-500/80 to-cyan-600/80',
};

export function TickerRibbon({ stocks }: TickerRibbonProps) {
  if (stocks.length === 0) return null;

  // Duplicate stocks for seamless scrolling
  const duplicatedStocks = [...stocks, ...stocks];

  return (
    <div className="relative overflow-hidden rounded-lg border border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="relative h-9 overflow-hidden">
        <motion.div
          animate={{ x: '-50%' }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="flex gap-2 py-2 pl-4"
        >
          {duplicatedStocks.map((stock, idx) => {
            const isPositive = stock.change >= 0;
            const colorClass = STOCK_COLORS[stock.symbol] || 'from-blue-500/80 to-blue-600/80';

            return (
              <motion.div
                key={`${stock.symbol}-${idx}`}
                whileHover={{ scale: 1.05 }}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg bg-gradient-to-r ${colorClass} px-2.5 py-1`}
              >
                <span className="text-xs font-bold text-white">{stock.symbol}</span>
                <span className="text-xs font-medium text-white">
                  ${stock.price.toFixed(2)}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    isPositive ? 'text-green-300' : 'text-red-300'
                  }`}
                >
                  {isPositive ? '▲' : '▼'} {Math.abs(stock.changePercent).toFixed(2)}%
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black to-transparent" />
    </div>
  );
}
