'use client';

import { motion } from 'framer-motion';
import { useMarketMovers } from '@/hooks/use-market-movers';
import { GainersList } from './gainers-list';
import { LosersList } from './losers-list';

export function MarketMoversSection() {
  const { gainers, losers, loading, error, lastUpdate } = useMarketMovers();

  if (error && !loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="my-16 p-8 rounded-xl border border-red-400/30 bg-red-400/5 backdrop-blur-sm text-center"
      >
        <p className="text-red-400 font-medium">{error}</p>
      </motion.div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5 }}
      className="my-16 space-y-6"
    >
      {/* Header */}
      <div className="space-y-2">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-4xl font-bold text-white"
        >
          Market Movers
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="text-muted-foreground"
        >
          Real-time tracking of today&apos;s biggest gainers and losers
        </motion.p>
      </div>

      {/* Two Column Layout: Gainers and Losers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GainersList stocks={gainers} loading={loading} />
        <LosersList stocks={losers} loading={loading} />
      </div>

      {/* Footer Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/50 backdrop-blur-xl"
      >
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <span>Last updated: {lastUpdate}</span>
        </div>
      </motion.div>
    </motion.section>
  );
}
