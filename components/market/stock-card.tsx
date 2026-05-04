'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { StockData, getTrendIndicator, formatPrice, formatPercent } from '@/lib/finnhub';

interface StockCardProps {
  stock: StockData;
  index: number;
}

export function StockCard({ stock, index }: StockCardProps) {
  const trend = getTrendIndicator(stock.change);
  const isPositive = stock.percentChange >= 0;
  const isNegative = stock.percentChange < 0;

  const glowClass = isPositive ? 'glow-green' : isNegative ? 'glow-red' : 'glow-white';
  const borderClass = isPositive ? 'border-green-500/30 hover:border-green-500/50' : isNegative ? 'border-red-500/30 hover:border-red-500/50' : 'border-white/10 hover:border-accent/50';
  const changeColor = isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-white/60';
  const bgColor = isPositive ? 'bg-green-500/5' : isNegative ? 'bg-red-500/5' : 'bg-white/5';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -4 }}
      className={`rounded-lg border ${borderClass} ${bgColor} backdrop-blur-sm ${glowClass} transition-all duration-300 p-4 cursor-pointer group`}
    >
      {/* Header with Logo and Ticker */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {stock.logo ? (
            <div className="relative w-8 h-8 rounded-lg bg-white/10 overflow-hidden flex-shrink-0">
              <Image
                src={stock.logo}
                alt={stock.companyName}
                fill
                className="object-cover"
                sizes="32px"
              />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/50 flex items-center justify-center text-xs font-bold text-accent flex-shrink-0">
              {stock.ticker.substring(0, 1)}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white/60">{stock.ticker}</p>
            <p className="text-xs font-bold text-white truncate">{stock.companyName}</p>
          </div>
        </div>

        {/* Trend Icon */}
        <div className={`flex-shrink-0 ${isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-white/60'}`}>
          {trend === 'up' ? (
            <TrendingUp className="w-4 h-4" />
          ) : trend === 'down' ? (
            <TrendingDown className="w-4 h-4" />
          ) : (
            <Minus className="w-4 h-4" />
          )}
        </div>
      </div>

      {/* Price */}
      <div className="mb-2">
        <p className="text-lg font-bold text-white">${formatPrice(stock.price)}</p>
      </div>

      {/* Change */}
      <div className="flex items-center justify-between pt-2 border-t border-white/10">
        <div>
          <p className={`text-xs font-semibold ${changeColor}`}>
            {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
          </p>
        </div>
        <div>
          <p className={`text-xs font-bold ${changeColor}`}>
            {formatPercent(stock.percentChange)}
          </p>
        </div>
      </div>

      {/* Mini sparkline indicator */}
      <div className="mt-2 h-0.5 w-full bg-white/10 rounded-full overflow-hidden">
        <motion.div
          layoutId={`sparkline-${stock.ticker}`}
          className={`h-full ${isPositive ? 'bg-green-500' : isNegative ? 'bg-red-500' : 'bg-white/30'}`}
          initial={{ width: '50%' }}
          animate={{ width: '50%' }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </motion.div>
  );
}
