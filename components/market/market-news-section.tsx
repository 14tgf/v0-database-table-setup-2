'use client';

import { motion } from 'framer-motion';
import { useMarketNews } from '@/hooks/use-market-news';
import { NewsCard } from './news-card';

export function MarketNewsSection() {
  const { news, loading, error, lastUpdate } = useMarketNews();

  const lastUpdateTime = new Date(lastUpdate).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // Loading skeleton
  if (loading && news.length === 0) {
    return (
      <div className="space-y-6 my-20">
        <div className="space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Market News</h2>
          <p className="text-white/60">Latest financial news and updates</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden animate-pulse"
            >
              <div className="w-full h-48 bg-white/10" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-white/10 rounded w-1/3" />
                <div className="h-6 bg-white/10 rounded w-full" />
                <div className="h-4 bg-white/10 rounded w-5/6" />
                <div className="flex gap-2 pt-2">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="h-6 bg-white/10 rounded w-12" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error && news.length === 0) {
    return (
      <div className="space-y-6 my-20">
        <div className="space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Market News</h2>
          <p className="text-white/60">Latest financial news and updates</p>
        </div>
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 backdrop-blur-xl p-6 text-center">
          <p className="text-red-400 font-semibold">Unable to load news</p>
          <p className="text-white/50 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 my-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white">Market News</h2>
        <p className="text-white/60">Latest financial news and updates</p>
      </motion.div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((newsItem, index) => (
          <NewsCard key={newsItem.id} news={newsItem} index={index} />
        ))}
      </div>

      {/* Footer Info and Button */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl"
      >
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-xs text-white/50">Live Financial News</span>
        </div>
        <span className="text-xs text-white/50">Last update: {lastUpdateTime}</span>
      </motion.div>
    </div>
  );
}
