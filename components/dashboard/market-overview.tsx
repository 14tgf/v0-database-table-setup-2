'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { CompanyLogo } from '@/components/market/company-logo';

interface StockItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  logo: string;
}

export function MarketOverview() {
  const stocks: StockItem[] = [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 229.35,
      change: 4.24,
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/1024px-Apple_logo_black.svg.png',
    },
    {
      symbol: 'NFLX',
      name: 'Netflix Inc.',
      price: 1211.64,
      change: 2.65,
      logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      price: 201.42,
      change: 2.49,
      logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
    },
  ];

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

        {/* Stock Items */}
        <div className="space-y-2">
          {stocks.map((stock) => (
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
                  <p className="text-xs text-green-400">+{stock.change.toFixed(2)}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
