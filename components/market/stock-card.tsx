'use client';

import { motion } from 'framer-motion';
import { StockData } from '@/hooks/use-market-data';
import { CompanyLogo } from './company-logo';

interface StockCardProps {
  stock: StockData;
  index: number;
}

export function StockCard({ stock, index }: StockCardProps) {
  const isPositive = stock.change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-3 backdrop-blur-xl transition-all hover:border-accent/50 hover:bg-gradient-to-br hover:from-white/10 hover:to-white/5 glow-cyan-hover"
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-500/0 via-transparent to-purple-500/0 opacity-0 transition-opacity group-hover:opacity-20" />

      {/* Header */}
      <div className="mb-2 flex items-start justify-between">
        <div className="flex items-center gap-1">
          <CompanyLogo logo={stock.logo} name={stock.name} symbol={stock.symbol} />
          <div>
            <p className="text-xs font-semibold text-white">{stock.symbol}</p>
            <p className="text-xs text-white/50 hidden">{stock.name}</p>
          </div>
        </div>
        <motion.div
          animate={{ scale: isPositive ? [1, 1.05, 1] : 1 }}
          transition={{ repeat: isPositive ? Infinity : 0, duration: 2 }}
          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            isPositive
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
          }`}
        >
          {isPositive ? '↑' : '↓'} {Math.abs(stock.changePercent).toFixed(2)}%
        </motion.div>
      </div>

      {/* Price */}
      <div className="mb-2">
        <p className="text-lg font-bold text-white">${stock.price.toFixed(2)}</p>
        <p
          className={`text-xs font-medium ${
            isPositive ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {isPositive ? '+' : ''}{stock.change.toFixed(2)}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-1.5 text-xs">
        <div className="rounded-lg bg-white/5 p-1.5">
          <p className="text-white/50 text-xs">High</p>
          <p className="font-semibold text-white text-xs">${stock.high.toFixed(2)}</p>
        </div>
        <div className="rounded-lg bg-white/5 p-1.5">
          <p className="text-white/50 text-xs">Low</p>
          <p className="font-semibold text-white text-xs">${stock.low.toFixed(2)}</p>
        </div>
      </div>
    </motion.div>
  );
}
