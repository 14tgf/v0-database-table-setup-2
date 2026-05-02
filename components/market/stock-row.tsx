'use client';

import { motion } from 'framer-motion';
import { StockData } from '@/hooks/use-market-data';
import { CompanyLogo } from './company-logo';

interface StockRowProps {
  stock: StockData;
  index: number;
  isGainer: boolean;
}

export function StockRow({ stock, index, isGainer }: StockRowProps) {
  const indicatorColor = isGainer ? 'text-green-400' : 'text-red-400';
  const borderColor = isGainer ? 'border-green-400/20 hover:border-green-400/50' : 'border-red-400/20 hover:border-red-400/50';
  const bgHover = isGainer ? 'hover:bg-green-400/5' : 'hover:bg-red-400/5';

  return (
    <motion.div
      initial={{ opacity: 0, x: isGainer ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex items-center justify-between px-4 py-3 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 ${borderColor} ${bgHover} group cursor-pointer`}
    >
      {/* Left: Logo, Symbol, Name */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <CompanyLogo logo={stock.logo} name={stock.name} symbol={stock.symbol} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">{stock.symbol}</p>
          <p className="text-xs text-white/40 truncate">{stock.name}</p>
        </div>
      </div>

      {/* Right: Price and Change */}
      <div className="flex items-end gap-6 ml-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-white">${stock.price.toFixed(2)}</p>
        </div>
        <div className={`text-right min-w-fit ${indicatorColor}`}>
          <p className="text-sm font-bold">
            {isGainer ? '+' : ''}{stock.changePercent.toFixed(2)}%
          </p>
          <p className="text-xs font-medium">
            {isGainer ? '+' : ''}{stock.change.toFixed(2)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
