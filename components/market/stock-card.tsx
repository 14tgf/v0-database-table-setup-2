'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { TrendingUp, TrendingDown, Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { usePortfolioStocks } from '@/hooks/usePortfolioStocks';

interface StockCardProps {
  stock: {
    ticker: string;
    companyName: string;
    logo: string;
    price: number;
    change: number;
    percentChange: number;
  };
  index: number;
}

export function StockCard({ stock, index }: StockCardProps) {
  const { addStock, isStockInPortfolio } = usePortfolioStocks();
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Defensive checks for undefined values
  const price = typeof stock.price === 'number' ? stock.price : 0;
  const change = typeof stock.change === 'number' ? stock.change : 0;
  const changePercent = typeof stock.percentChange === 'number' ? stock.percentChange : 0;
  
  const isPositive = changePercent >= 0;
  const isNegative = changePercent < 0;
  const isInPortfolio = isStockInPortfolio(stock.ticker);

  const handleAddStock = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInPortfolio) return;

    // Validate price before adding
    if (!price || price <= 0) {
      setAddError('Invalid stock price');
      return;
    }

    setIsAdding(true);
    setAddError(null);

    try {
      console.log('[v0] Adding stock with:', { ticker: stock.ticker, companyName: stock.companyName, logo: stock.logo, price });
      await addStock(stock.ticker, stock.companyName, stock.logo, price);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to add stock';
      setAddError(errorMsg);
      console.error('[v0] Add stock error:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const glowClass = isPositive ? 'glow-green' : isNegative ? 'glow-red' : 'glow-white';
  const borderClass = isPositive ? 'border-green-500/30 hover:border-green-500/50' : isNegative ? 'border-red-500/30 hover:border-red-500/50' : 'border-white/10 hover:border-accent/50';
  const changeColor = isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-white/60';
  const bgColor = isPositive ? 'bg-green-500/5' : isNegative ? 'bg-red-500/5' : 'bg-white/5';

  const trend = change > 0.5 ? 'up' : change < -0.5 ? 'down' : 'flat';

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
                onError={() => console.log(`[v0] Failed to load logo for ${stock.ticker}`)}
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
        <p className="text-lg font-bold text-white">${price.toFixed(2)}</p>
      </div>

      {/* Change */}
      <div className="flex items-center justify-between pt-2 border-t border-white/10">
        <div>
          <p className={`text-xs font-semibold ${changeColor}`}>
            {change >= 0 ? '+' : ''}{change.toFixed(2)}
          </p>
        </div>
        <div>
          <p className={`text-xs font-bold ${changeColor}`}>
            {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Mini sparkline indicator */}
      <div className="mt-2 h-0.5 w-full bg-white/10 rounded-full overflow-hidden mb-3">
        <motion.div
          layoutId={`sparkline-${stock.ticker}`}
          className={`h-full ${isPositive ? 'bg-green-500' : isNegative ? 'bg-red-500' : 'bg-white/30'}`}
          initial={{ width: '50%' }}
          animate={{ width: '50%' }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Add to Portfolio Button */}
      <button
        onClick={handleAddStock}
        disabled={isInPortfolio || isAdding}
        className={`w-full py-2 px-3 rounded-lg font-medium text-xs flex items-center justify-center gap-2 transition-all ${
          isInPortfolio
            ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-default'
            : 'bg-accent/20 text-accent border border-accent/50 hover:bg-accent/30 disabled:opacity-50 disabled:cursor-not-allowed'
        }`}
      >
        {isAdding ? (
          <>
            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Adding...</span>
          </>
        ) : isInPortfolio ? (
          <>
            <Plus className="w-3 h-3" />
            <span>Already Added</span>
          </>
        ) : (
          <>
            <Plus className="w-3 h-3" />
            <span>Add to Portfolio</span>
          </>
        )}
      </button>

      {addError && (
        <p className="text-xs text-red-400 mt-2 text-center">{addError}</p>
      )}
    </motion.div>
  );
}
