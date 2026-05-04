'use client';

import { motion } from 'framer-motion';
import { Activity, TrendingUp } from 'lucide-react';

export function MarketHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="border-b border-white/10 bg-gradient-to-b from-secondary/40 to-transparent backdrop-blur-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-accent/20 border border-accent/50">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Stock Market</h1>
                <p className="text-xs text-white/60">Real-time market data powered by Finnhub</p>
              </div>
            </div>
          </div>

          {/* Market Status */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30"
          >
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-semibold text-green-400">Market Live</span>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
