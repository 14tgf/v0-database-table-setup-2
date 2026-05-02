'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bell, Sun, TrendingUp, TrendingDown, MoreVertical, Plus } from 'lucide-react';
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-gradient-to-br from-red-900/40 via-red-800/30 to-background/50 p-6 backdrop-blur-xl glow-cyan-hover">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Your Portfolio</h1>
              <p className="text-white/70">Manage and track your investments</p>
            </div>
            <button className="px-4 py-2 rounded-lg bg-accent/20 border border-accent/50 text-accent hover:bg-accent/30 transition-all text-sm font-semibold flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Stock
            </button>
          </div>

          {/* Portfolio Stats Card */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-white/60 text-xs mb-1">Total Value</p>
                <p className="text-2xl font-bold text-white">${totalValue.toFixed(2)}</p>
                <p className="text-xs text-white/50 mt-1">Invested: ${totalInvested.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-white/60 text-xs mb-1">Total Gain/Loss</p>
                <p className={`text-2xl font-bold ${totalGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${Math.abs(totalGain).toFixed(2)}
                </p>
                <p className={`text-xs mt-1 ${totalGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {totalGain >= 0 ? '+' : ''}{totalGainPercent.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-white/60 text-xs mb-1">Holdings</p>
                <p className="text-2xl font-bold text-white">{holdings.length}</p>
                <p className="text-xs text-white/50 mt-1">Active positions</p>
              </div>
              <div>
                <p className="text-white/60 text-xs mb-1">Performance</p>
                <div className="flex gap-2 mt-2">
                  <div className="text-center flex-1">
                    <p className="text-lg font-bold text-green-400">{gainersCount}</p>
                    <p className="text-xs text-green-400">Gainers</p>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-lg font-bold text-red-400">{losersCount}</p>
                    <p className="text-xs text-red-400">Losers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Link href="#" className="rounded-xl border border-white/10 bg-gradient-to-br from-green-900/20 via-red-800/20 to-background/50 p-4 backdrop-blur-xl glow-green-hover">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-semibold text-sm">Portfolio Performance</h3>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-green-400">{totalGainPercent.toFixed(2)}%</p>
            <p className="text-xs text-white/50 mt-2">Overall return</p>
          </Link>

          <Link href="#" className="rounded-xl border border-white/10 bg-gradient-to-br from-amber-900/20 via-red-800/20 to-background/50 p-4 backdrop-blur-xl glow-white-hover">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-semibold text-sm">Watchlist</h3>
              <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-white">8</p>
            <p className="text-xs text-white/50 mt-2">Stocks watched</p>
          </Link>

          <Link href="#" className="rounded-xl border border-white/10 bg-gradient-to-br from-blue-900/20 via-red-800/20 to-background/50 p-4 backdrop-blur-xl glow-cyan-hover">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-semibold text-sm">Alerts</h3>
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-white">3</p>
            <p className="text-xs text-white/50 mt-2">Active alerts</p>
          </Link>
        </div>

        {/* Holdings Table */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-red-900/40 via-red-800/30 to-background/50 p-6 backdrop-blur-xl overflow-hidden">
          <h2 className="text-xl font-bold text-white mb-4">Holdings ({holdings.length})</h2>

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-lg bg-white/5 h-16 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="grid grid-cols-5 gap-4 mb-2 px-4 py-2 text-xs font-semibold text-white/60 uppercase">
                <div>Stock</div>
                <div className="text-right">Shares</div>
                <div className="text-right">Current Price</div>
                <div className="text-right">Total Value</div>
                <div className="text-right">Gain/Loss</div>
              </div>

              {/* Table Body */}
              <div className="space-y-1">
                {holdings.map((holding, index) => {
                  const isPositive = holding.gain >= 0;
                  return (
                    <div
                      key={holding.symbol}
                      className={`grid grid-cols-5 gap-4 px-4 py-4 rounded-lg hover:bg-white/5 transition-all cursor-pointer group glow-cyan-hover ${
                        index % 2 === 0 ? 'bg-red-800/20' : ''
                      }`}
                    >
                      {/* Stock Info */}
                      <div className="flex items-center gap-3">
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
                          <p className="text-sm font-semibold text-white">{holding.symbol}</p>
                          <p className="text-xs text-white/50">{holding.name}</p>
                        </div>
                      </div>

                      {/* Shares */}
                      <div className="text-right flex items-center justify-end">
                        <p className="text-sm font-semibold text-white">{holding.shares}</p>
                      </div>

                      {/* Current Price */}
                      <div className="text-right flex items-center justify-end">
                        <p className="text-sm font-semibold text-white">${holding.currentPrice.toFixed(2)}</p>
                      </div>

                      {/* Total Value */}
                      <div className="text-right flex items-center justify-end">
                        <p className="text-sm font-semibold text-white">${holding.totalValue.toFixed(2)}</p>
                      </div>

                      {/* Gain/Loss */}
                      <div className="text-right flex items-center justify-end gap-2">
                        <div>
                          <p className={`text-sm font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {isPositive ? '+' : ''}{holding.gainPercent.toFixed(2)}%
                          </p>
                          <p className={`text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {isPositive ? '+' : ''}${Math.abs(holding.gain).toFixed(2)}
                          </p>
                        </div>
                        <button className="p-1 rounded hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4 text-white/60" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
