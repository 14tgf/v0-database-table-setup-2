'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { NewsItem } from '@/hooks/use-market-news';
import { formatDistanceToNow } from 'date-fns';

interface NewsCardProps {
  news: NewsItem;
  index: number;
}

export function NewsCard({ news, index }: NewsCardProps) {
  const publishedTime = formatDistanceToNow(new Date(news.publishedAt), { addSuffix: true });

  return (
    <motion.a
      href={news.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group block h-full"
    >
      <div className="h-full rounded-lg border border-white/10 bg-white/5 backdrop-blur-xl hover:border-accent/50 hover:bg-white/10 transition-all duration-300 overflow-hidden flex flex-col">
        {/* Image Container */}
        <div className="relative w-full h-48 overflow-hidden bg-black/20">
          <Image
            src={news.image}
            alt={news.headline}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/news-placeholder.jpg';
            }}
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-4">
          {/* Source and Time */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-accent/80 uppercase tracking-widest">
              {news.source}
            </span>
            <span className="text-xs text-white/40">{publishedTime}</span>
          </div>

          {/* Headline */}
          <h3 className="text-sm font-bold text-white leading-snug mb-2 line-clamp-2 group-hover:text-accent transition-colors">
            {news.headline}
          </h3>

          {/* Summary */}
          <p className="text-xs text-white/60 line-clamp-2 mb-3 flex-1">
            {news.summary}
          </p>

          {/* Tickers */}
          {news.tickers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {news.tickers.slice(0, 3).map((ticker) => (
                <span
                  key={ticker}
                  className="px-2 py-1 bg-accent/20 border border-accent/40 rounded text-xs font-semibold text-accent"
                >
                  {ticker}
                </span>
              ))}
              {news.tickers.length > 3 && (
                <span className="px-2 py-1 text-xs font-semibold text-white/50">
                  +{news.tickers.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.a>
  );
}
