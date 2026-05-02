'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bell, Sun, TrendingUp, TrendingDown, Activity, ArrowUpRight, Plus } from 'lucide-react';
import { useMarketData } from '@/hooks/use-market-data';

interface PortfolioHolding {
  symbol: string;
  name: string;
  logo: string;
  shares: number;
  buyPrice: number;
}

export default function PortfolioPage() {
  const { stocks, loading } = useMarketData();

  // Portfolio holdings - using real stock data from API
  const portfolioSymbols = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA'];
  
  // Map real stock data to portfolio holdings
  const holdings = useMemo(() => {
    return portfolioSymbols
      .map((symbol) => {
        const stock = stocks.find(s => s.symbol === symbol);
        if (!stock) return null;

        // Simulate holding data based on stock data
        const shares = [50, 30, 25, 15, 20][portfolioSymbols.indexOf(symbol)];
        const buyPrices = [180.25, 445.0, 165.5, 250.0, 420.0];
        const buyPrice = buyPrices[portfolioSymbols.indexOf(symbol)];
        const currentPrice = stock.price;
        const totalValue = shares * currentPrice;
        const gain = totalValue - (shares * buyPrice);
        const gainPercent = (gain / (shares * buyPrice)) * 100;

        return {
          symbol: stock.symbol,
          name: stock.name,
          logo: stock.logo,
          shares,
          buyPrice,
          currentPrice,
          totalValue,
          gain,
          gainPercent
        };
      })
      .filter((h) => h !== null) as PortfolioHolding[];
  }, [stocks]);

  // Calculate totals
  const totalInvested = useMemo(() => {
    return holdings.reduce((sum, h) => sum + (h.shares * h.buyPrice), 0);
  }, [holdings]);

  const totalValue = useMemo(() => {
    return holdings.reduce((sum, h) => sum + h.totalValue, 0);
  }, [holdings]);

  const totalGain = useMemo(() => {
    return holdings.reduce((sum, h) => sum + h.gain, 0);
  }, [holdings]);

  const totalGainPercent = useMemo(() => {
    return totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;
  }, [totalGain, totalInvested]);

  const gainersCount = holdings.filter(h => h.gain > 0).length;
  const losersCount = holdings.filter(h => h.gain < 0).length;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Portfolio Overview Header */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-red-900/40 via-red-800/30 to-background/50 p-6 backdrop-blur-xl glow-cyan-hover">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold text-white">Portfolio Overview</h1>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-900/30 border border-green-600/50">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-semibold text-green-400">Live</span>
                </div>
              </div>
              <p className="text-white/70 text-sm mb-1">Track your investment performance and holdings</p>
              <p className="text-white/50 text-xs">Last updated: {new Date().toLocaleTimeString()}</p>
            </div>
          </div>

          {/* Main Stats Card */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-white/60 text-xs mb-1">Total Value</p>
                <p className="text-3xl font-bold text-white">${totalValue.toFixed(2)}</p>
              </div>
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <p className="text-white/60 text-xs mb-1">Invested</p>
                <p className="text-lg font-semibold text-white">${totalInvested.toFixed(2)}</p>
              </div>
              <div className="flex flex-col">
                <p className="text-white/60 text-xs mb-1">Gain/Loss</p>
                <p className={`text-lg font-semibold ${totalGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {totalGain >= 0 ? '+' : ''}${totalGain.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Tools */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-red-900/40 via-red-800/30 to-background/50 p-6 backdrop-blur-xl">
          <h2 className="text-lg font-bold text-white mb-1">Portfolio Tools</h2>
          <p className="text-white/70 text-sm mb-4">Access detailed portfolio analysis and management</p>

          <div className="space-y-2">
            <Link href="#" className="block rounded-lg bg-red-800/30 border border-white/10 p-4 hover:bg-red-800/40 transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">Holdings</p>
                  <p className="text-white/50 text-sm">Detailed holdings breakdown</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" />
              </div>
            </Link>

            <Link href="#" className="block rounded-lg bg-red-800/30 border border-white/10 p-4 hover:bg-red-800/40 transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">Analytics</p>
                  <p className="text-white/50 text-sm">Performance charts & analysis</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" />
              </div>
            </Link>

            <Link href="#" className="block rounded-lg bg-red-800/30 border border-white/10 p-4 hover:bg-red-800/40 transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">Dashboard</p>
                  <p className="text-white/50 text-sm">Investment dashboard overview</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" />
              </div>
            </Link>

            <Link href="#" className="block rounded-lg bg-red-800/30 border border-white/10 p-4 hover:bg-red-800/40 transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">Transactions</p>
                  <p className="text-white/50 text-sm">Complete transaction history</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" />
              </div>
            </Link>
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Invested */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-red-900/40 via-red-800/30 to-background/50 p-6 backdrop-blur-xl glow-cyan-hover">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white font-semibold">Total Invested</p>
              <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white">${totalInvested.toFixed(2)}</p>
          </div>

          {/* Current Value */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-red-900/40 via-red-800/30 to-background/50 p-6 backdrop-blur-xl glow-cyan-hover">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white font-semibold">Current Value</p>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">${totalValue.toFixed(2)}</p>
          </div>

          {/* Total Gain/Loss */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-red-900/40 via-red-800/30 to-background/50 p-6 backdrop-blur-xl glow-cyan-hover">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white font-semibold">Total Gain/Loss</p>
              <TrendingUp className={`w-5 h-5 ${totalGain >= 0 ? 'text-green-400' : 'text-red-400'}`} />
            </div>
            <p className={`text-3xl font-bold ${totalGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalGain >= 0 ? '+' : ''}{totalGain.toFixed(2)}
            </p>
            <p className={`text-sm ${totalGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalGain >= 0 ? '+' : ''}{totalGainPercent.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Your Holdings */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-red-900/40 via-red-800/30 to-background/50 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Your Holdings</h2>
              <p className="text-white/70 text-sm">{holdings.length} investment plans</p>
            </div>
            <Link href="#" className="text-red-400/60 hover:text-red-400 text-sm font-semibold transition-colors">
              Browse More →
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 rounded-full bg-white/10 animate-pulse mb-3" />
              <p className="text-white/60">Loading holdings...</p>
            </div>
          ) : holdings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-red-800/30 flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 text-red-400/60" />
              </div>
              <h3 className="text-white font-semibold mb-2">No holdings yet</h3>
              <p className="text-white/60 text-sm text-center mb-4">Start building your portfolio by investing in our plans</p>
              <button className="px-6 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors font-semibold">
                + Start Investing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {holdings.map((holding) => {
                const isPositive = holding.gain >= 0;
                return (
                  <div
                    key={holding.symbol}
                    className="rounded-lg bg-red-800/20 border border-white/10 p-4 hover:bg-red-800/30 transition-all glow-cyan-hover"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      {holding.logo ? (
                        <Image
                          src={holding.logo}
                          alt={holding.symbol}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded bg-white/10 flex-shrink-0 object-contain"
                          unoptimized
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-black flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">{holding.symbol[0]}</span>
                        </div>
                      )}
                      <div>
                        <p className="text-white font-semibold text-sm">{holding.symbol}</p>
                        <p className="text-white/50 text-xs">{holding.name}</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <p className="text-white/60">Shares:</p>
                        <p className="text-white font-semibold">{holding.shares}</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-white/60">Price:</p>
                        <p className="text-white font-semibold">${holding.currentPrice.toFixed(2)}</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-white/60">Value:</p>
                        <p className="text-white font-semibold">${holding.totalValue.toFixed(2)}</p>
                      </div>
                      <div className="pt-2 border-t border-white/10 flex justify-between">
                        <p className="text-white/60">Gain/Loss:</p>
                        <p className={`font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                          {isPositive ? '+' : ''}{holding.gainPercent.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-red-900/40 via-red-800/30 to-background/50 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Recent Transactions</h2>
              <p className="text-white/70 text-sm">Your latest investment activity</p>
            </div>
            <Link href="#" className="text-red-400/60 hover:text-red-400 text-sm font-semibold transition-colors">
              View All →
            </Link>
          </div>

          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-red-800/30 flex items-center justify-center mb-4">
              <Activity className="w-8 h-8 text-red-400/60" />
            </div>
            <h3 className="text-white font-semibold mb-1">No recent transactions</h3>
            <p className="text-white/60 text-sm">Your transactions will appear here</p>
          </div>
        </div>
      </main>
    </div>
  );
}
