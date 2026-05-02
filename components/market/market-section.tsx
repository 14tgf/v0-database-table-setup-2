'use client';

import { motion } from 'framer-motion';
import { useMarketData } from '@/hooks/use-market-data';
import { StockCard } from './stock-card';
import { TickerRibbon } from './ticker-ribbon';

export function MarketSection() {
  const { stocks, loading, error, lastUpdate } = useMarketData();

  const lastUpdateTime = new Date(lastUpdate).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <section className="space-y-6 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h2 className="text-3xl font-bold text-white md:text-4xl">
          Live Market Data
        </h2>
        <p className="text-white/60">
          Real-time stock prices powered by Finnhub
        </p>
      </motion.div>

      {/* Ticker Ribbon */}
      <TickerRibbon stocks={stocks} />

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-300"
        >
          Error loading market data: {error}
        </motion.div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="h-48 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl"
            />
          ))}
        </div>
      ) : (
        <>
          {/* Stock Cards Grid */}
          <motion.div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.05,
                },
              },
            }}
            initial="hidden"
            animate="visible"
          >
            {stocks.map((stock, index) => (
              <StockCard key={stock.symbol} stock={stock} index={index} />
            ))}
          </motion.div>

          {/* Footer Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/50 backdrop-blur-xl"
          >
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>Live Market Data</span>
            </div>
            <span>Last update: {lastUpdateTime}</span>
          </motion.div>
        </>
      )}
    </section>
  );
}
