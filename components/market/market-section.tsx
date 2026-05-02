'use client';

import Link from 'next/link';
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
    <section className="space-y-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h2 className="text-2xl font-bold text-white md:text-3xl">
          Live Market Data
        </h2>
        <p className="text-sm text-white/60">
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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="h-40 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl"
            />
          ))}
        </div>
      ) : (
        <>
          {/* Stock Cards Grid */}
          <motion.div
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
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

          {/* Footer Info and Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2"
            >
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-xs text-white/50">Live Market Data</span>
            </motion.div>
            <div className="flex items-center justify-between w-full sm:w-auto gap-2">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xs text-white/50"
              >
                Last update: {lastUpdateTime}
              </motion.span>
              <Link
                href="/market"
                className="px-3 py-1.5 bg-accent/20 border border-accent/50 text-accent font-semibold rounded-lg hover:bg-accent/30 hover:border-accent transition-all duration-300 text-xs whitespace-nowrap"
              >
                View Full Market
              </Link>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
