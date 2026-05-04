'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bell, Sun, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useMarketData } from '@/hooks/use-market-data';
import { SidebarMenu } from '@/components/dashboard/sidebar-menu';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';

export default function StocksPage() {
  const { stocks, loading } = useMarketData();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Get featured stocks (first 3)
  const featuredStocks = stocks.slice(0, 3);
  
  // Get all 10 stocks
  const allStocks = stocks.slice(0, 10);
  
  // Calculate statistics
  const gainers = stocks.filter(s => s.change > 0).length;
  const losers = stocks.filter(s => s.change < 0).length;
  const topGainerChange = stocks.length > 0 ? Math.max(...stocks.map(s => s.changePercent)) : 0;
  const topLoserChange = stocks.length > 0 ? Math.min(...stocks.map(s => s.changePercent)) : 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                <Sun className="w-5 h-5 text-white/60" />
              </button>
              <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                <Bell className="w-5 h-5 text-white/60" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-6 backdrop-blur-xl">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Stock Marketplace</h1>
              <p className="text-white/70">Discover and trade stocks from leading companies</p>
              <p className="text-xs text-white/50 mt-2">Last updated: {new Date().toLocaleTimeString()}</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/50 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-green-400 font-semibold">Live</span>
            </div>
          </div>

          {/* Stats Card */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-white/60 text-xs mb-1">Active Stocks</p>
                <p className="text-2xl font-bold text-white">{stocks.length}</p>
              </div>
              <div className="text-center">
                <p className="text-white/60 text-xs mb-1">Gainers</p>
                <p className="text-2xl font-bold text-green-400">{gainers}</p>
              </div>
              <div className="text-center">
                <p className="text-white/60 text-xs mb-1">Losers</p>
                <p className="text-2xl font-bold text-red-400">{losers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Top Gainers */}
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-green-900/20 via-secondary/20 to-background/50 p-4 backdrop-blur-xl glow-green-hover">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-semibold text-sm">Top Gainers</h3>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-green-400">{topGainerChange.toFixed(2)}%</p>
            <p className="text-xs text-white/50 mt-2">Best performance</p>
          </div>

          {/* Top Losers */}
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-secondary/30 via-secondary/20 to-background/50 p-4 backdrop-blur-xl glow-cyan-hover">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-semibold text-sm">Top Losers</h3>
              <TrendingDown className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-2xl font-bold text-primary">{topLoserChange.toFixed(2)}%</p>
            <p className="text-xs text-white/50 mt-2">Worst performance</p>
          </div>

          {/* Most Active */}
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-secondary/30 via-secondary/20 to-background/50 p-4 backdrop-blur-xl glow-cyan-hover">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-semibold text-sm">Market Status</h3>
              <Activity className="w-4 h-4 text-accent" />
            </div>
            <p className="text-2xl font-bold text-white">{allStocks.length}</p>
            <p className="text-xs text-white/50 mt-2">Stocks tracked</p>
          </div>
        </div>

        {/* Featured Stocks */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-6 backdrop-blur-xl">
          <h2 className="text-xl font-bold text-white mb-1">Featured Stocks</h2>
          <p className="text-white/70 text-sm mb-4">Handpicked stocks for your portfolio</p>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-lg bg-secondary/30 h-16 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {featuredStocks.map((stock) => {
                const isPositive = stock.change >= 0;
                return (
                  <div key={stock.symbol} className="rounded-lg bg-secondary/30 border border-white/10 p-4 hover:bg-secondary/40 transition-all glow-cyan-hover">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {stock.logo ? (
                          <Image
                            src={stock.logo}
                            alt={stock.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded bg-white/10 flex-shrink-0 object-contain p-1"
                            unoptimized
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">{stock.symbol[0]}</span>
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-white">{stock.symbol}</h3>
                            <p className="text-white/50 text-xs">{stock.name}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold text-white">${stock.price.toFixed(2)}</p>
                        <p className={`text-sm font-semibold ${isPositive ? 'text-green-400' : 'text-destructive'}`}>
                          {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* All Stocks Table */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-6 backdrop-blur-xl overflow-hidden">
          <h2 className="text-xl font-bold text-white mb-1">All Stocks</h2>
          <p className="text-white/70 text-sm mb-4">{allStocks.length} stocks available</p>

          {/* Table Header */}
          <div className="grid grid-cols-3 gap-4 mb-2 px-4 py-2 text-xs font-semibold text-white/60 uppercase">
            <div>Stock</div>
            <div className="text-right">Price</div>
            <div className="text-right">Change</div>
          </div>

          {/* Table Body */}
          <div className="space-y-1">
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="rounded-lg bg-white/5 h-12 animate-pulse" />
                ))}
              </div>
            ) : (
              allStocks.map((stock, index) => {
                const isPositive = stock.change >= 0;
                return (
                  <div key={stock.symbol} className={`grid grid-cols-3 gap-4 px-4 py-3 rounded-lg hover:bg-white/5 transition-all ${
                    index % 2 === 0 ? 'bg-secondary/20' : ''
                  }`}>
                    <div className="flex items-center gap-3">
                      {stock.logo ? (
                        <Image
                          src={stock.logo}
                          alt={stock.symbol}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded bg-white/10 flex-shrink-0 object-contain"
                          unoptimized
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-black flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">{stock.symbol[0]}</span>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-white">{stock.symbol}</p>
                        <p className="text-xs text-white/50">{stock.name}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center justify-end">
                      <p className="text-sm font-semibold text-white">${stock.price.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${isPositive ? 'text-green-400' : 'text-destructive'}`}>
                        {isPositive ? '+' : ''}{stock.change.toFixed(2)}
                      </p>
                      <p className={`text-xs ${isPositive ? 'text-green-400' : 'text-destructive'}`}>
                        {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* Sidebar Menu */}
      <SidebarMenu 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Bottom Navigation */}
      <DashboardNav />
    </div>
  );
}
