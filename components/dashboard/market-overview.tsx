'use client';

import { motion } from 'framer-motion';
import { CompanyLogo } from '@/components/market/company-logo';
import { useMarketData } from '@/hooks/use-market-data';

export function MarketOverview() {
  const { stocks, loading, error } = useMarketData();

  // Get first 3 stocks for dashboard overview
  const displayStocks = stocks.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="col-span-1 md:col-span-2"
    >
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Market Overview</h2>
            <p className="text-sm text-white/60">Live market data</p>
          </div>
          <a href="/market" className="text-accent text-sm font-semibold hover:underline">
            View All →
          </a>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-white/10 bg-white/5 p-4 animate-pulse h-16" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        ) : (
          /* Stock Items */
          <div className="space-y-2">
            {displayStocks.map((stock) => {
              const isPositive = stock.change >= 0;
              return (
                <div
                  key={stock.symbol}
                  className="rounded-lg border border-white/10 bg-white/5 p-4 hover:bg-white/10 hover:border-accent/50 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <CompanyLogo
                          logo={stock.logo}
                          name={stock.name}
                          symbol={stock.symbol}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{stock.name}</p>
                        <p className="text-xs text-white/50">{stock.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">${stock.price.toFixed(2)}</p>
                      <p className={`text-xs font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
