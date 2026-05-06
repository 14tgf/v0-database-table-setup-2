'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePortfolio } from '@/hooks/usePortfolio';

interface StockCardProps {
  stock: {
    ticker: string;
    companyName: string;
    logo: string;
    price: number;
    change: number;
    percentChange: number;
    isOwned?: boolean;
  };
  index: number;
}

export function StockCard({ stock, index }: StockCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const { user, isLoading } = useAuth();
  const { addStock } = usePortfolio();

  // Defensive checks for undefined values
  const price = typeof stock.price === 'number' ? stock.price : 0;
  const change = typeof stock.change === 'number' ? stock.change : 0;
  const changePercent = typeof stock.percentChange === 'number' ? stock.percentChange : 0;
  
  const isPositive = changePercent >= 0;
  const isNegative = changePercent < 0;

  const glowClass = isPositive ? 'glow-green' : isNegative ? 'glow-red' : 'glow-white';
  const borderClass = isPositive ? 'border-green-500/30 hover:border-green-500/50' : isNegative ? 'border-red-500/30 hover:border-red-500/50' : 'border-white/10 hover:border-accent/50';
  const changeColor = isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-white/60';
  const bgColor = isPositive ? 'bg-green-500/5' : isNegative ? 'bg-red-500/5' : 'bg-white/5';

  const trend = change > 0.5 ? 'up' : change < -0.5 ? 'down' : 'flat';
  // Use the isOwned flag from the API response, not from hook
  const alreadyInPortfolio = stock.isOwned === true;

  const handleAddToPortfolio = async () => {
    if (!user) {
      setMessage({ type: 'error', text: 'Please log in to add stocks' });
      return;
    }

    setIsAdding(true);
    setMessage(null);
    
    try {
      await addStock(stock.ticker, stock.companyName, stock.logo, price);
      setMessage({ type: 'success', text: `${stock.ticker} added to portfolio!` });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to add stock';
      console.error(`[v0] Error adding ${stock.ticker}:`, errorMsg);
      setMessage({ type: 'error', text: `Error: ${errorMsg}` });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -4 }}
      className={`rounded-lg border ${borderClass} ${bgColor} backdrop-blur-sm ${glowClass} transition-all duration-300 p-4 cursor-pointer group flex flex-col`}
    >
      {/* Header with Logo and Ticker */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
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
        <p className="text-xs text-white/50">Invest: $500.00</p>
      </div>

      {/* Change */}
      <div className="flex items-center justify-between pt-2 border-t border-white/10 mb-3">
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
      <div className="mb-3 h-0.5 w-full bg-white/10 rounded-full overflow-hidden">
        <motion.div
          layoutId={`sparkline-${stock.ticker}`}
          className={`h-full ${isPositive ? 'bg-green-500' : isNegative ? 'bg-red-500' : 'bg-white/30'}`}
          initial={{ width: '50%' }}
          animate={{ width: '50%' }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Message Display */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`mb-2 p-2 rounded flex items-center gap-2 text-xs ${
            message.type === 'success'
              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
              : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </motion.div>
      )}

      {/* Add to Portfolio Button */}
      <button
        onClick={handleAddToPortfolio}
        disabled={isAdding || !user || isLoading || alreadyInPortfolio}
        className={`w-full py-2 rounded-lg font-semibold text-sm transition-all ${
          alreadyInPortfolio
            ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-default'
            : 'bg-accent/20 text-accent border border-accent/50 hover:bg-accent/30 disabled:opacity-50'
        }`}
      >
        {isLoading ? 'Loading...' : !user ? 'Login to Buy' : isAdding ? 'Investing...' : alreadyInPortfolio ? '✓ Owned' : 'Invest $500'}
      </button>
    </motion.div>
  );
}
