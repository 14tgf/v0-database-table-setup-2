'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
import { usePortfolio } from '@/hooks/usePortfolio';
import { SidebarMenu } from '@/components/dashboard/sidebar-menu';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';

export default function PortfolioPage() {
  const { stocks: portfolioStocks, isLoading, userId, removeStock } = usePortfolio();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [removingStock, setRemovingStock] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Calculate totals from real portfolio data
  const totals = useMemo(() => {
    if (!portfolioStocks || portfolioStocks.length === 0) {
      return {
        totalInvested: 0,
        totalValue: 0,
        totalGain: 0,
        totalGainPercent: 0,
        gainersCount: 0,
        losersCount: 0,
      };
    }

    const totalInvested = portfolioStocks.reduce((sum, stock: any) => {
      const amount = parseFloat(stock.invested_amount) || 0;
      return sum + amount;
    }, 0);
    
    const totalValue = portfolioStocks.reduce((sum, stock: any) => {
      const price = parseFloat(stock.current_price) || 0;
      const qty = parseInt(stock.quantity) || 0;
      return sum + (price * qty);
    }, 0);
    
    const totalGain = portfolioStocks.reduce((sum, stock: any) => {
      const gain = parseFloat(stock.profit_loss) || 0;
      return sum + gain;
    }, 0);
    
    const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;
    const gainersCount = portfolioStocks.filter((stock: any) => (parseFloat(stock.profit_loss) || 0) > 0).length;
    const losersCount = portfolioStocks.filter((stock: any) => (parseFloat(stock.profit_loss) || 0) < 0).length;

    return { 
      totalInvested: Number(totalInvested) || 0, 
      totalValue: Number(totalValue) || 0, 
      totalGain: Number(totalGain) || 0, 
      totalGainPercent: Number(totalGainPercent) || 0, 
      gainersCount, 
      losersCount 
    };
  }, [portfolioStocks]);

  const handleRemoveStock = async (symbol: string) => {
    if (!confirm(`Remove ${symbol} from portfolio?`)) return;

    setRemovingStock(symbol);
    setError(null);

    try {
      await removeStock(symbol);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to remove stock';
      setError(errorMsg);
      console.error('[v0] Remove error:', err);
    } finally {
      setRemovingStock(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-3">
            <Link href="/dashboard">
              <Image 
                src="/logo.png" 
                alt="X Holding" 
                width={80} 
                height={40}
                className="w-auto h-10 cursor-pointer hover:opacity-80 transition-opacity"
              />
            </Link>
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          {/* Top Navigation Links */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            <Link href="/dashboard" className="px-3 py-1.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap">Dashboard</Link>
            <Link href="/dashboard/wallet" className="px-3 py-1.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap">Wallet</Link>
            <Link href="/market" className="px-3 py-1.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap">Stocks</Link>
            <Link href="/portfolio" className="px-3 py-1.5 rounded-lg text-sm text-white font-semibold bg-accent/20 border border-accent/50 whitespace-nowrap">Portfolio</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Portfolio Overview Header */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-6 backdrop-blur-xl glow-cyan-hover">
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

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Main Stats Card */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 mb-4">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-white/60 text-xs mb-1">Total Value</p>
            <p className="text-3xl font-bold text-white">${totals.totalValue.toFixed(2)}</p>
          </div>
          <TrendingUp className="w-6 h-6 text-green-400" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <p className="text-white/60 text-xs mb-1">Invested</p>
            <p className="text-lg font-semibold text-white">${totals.totalInvested.toFixed(2)}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-white/60 text-xs mb-1">Gain/Loss</p>
            <p className={`text-lg font-semibold ${totals.totalGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totals.totalGain >= 0 ? '+' : ''}{totals.totalGain.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
        </div>

        {/* Portfolio Tools */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-6 backdrop-blur-xl">
          <h2 className="text-lg font-bold text-white mb-1">Quick Actions</h2>
          <p className="text-white/70 text-sm mb-4">Manage your portfolio</p>

          <div className="space-y-2">
            <Link href="/market" className="block rounded-lg bg-secondary/30 border border-white/10 p-4 hover:bg-secondary/40 transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">Add Stocks</p>
                  <p className="text-white/50 text-sm">Add more stocks to your portfolio</p>
                </div>
                <TrendingUp className="w-5 h-5 text-accent group-hover:text-accent/80 transition-colors" />
              </div>
            </Link>
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Invested */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-6 backdrop-blur-xl glow-cyan-hover">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white font-semibold">Total Invested</p>
              <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white">${totals.totalInvested.toFixed(2)}</p>
          </div>

          {/* Current Value */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-6 backdrop-blur-xl glow-cyan-hover">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white font-semibold">Current Value</p>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">${totals.totalValue.toFixed(2)}</p>
          </div>

          {/* Total Gain/Loss */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-6 backdrop-blur-xl glow-cyan-hover">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white font-semibold">Total Gain/Loss</p>
              <TrendingUp className={`w-5 h-5 ${totals.totalGain >= 0 ? 'text-green-400' : 'text-red-400'}`} />
            </div>
            <p className={`text-3xl font-bold ${totals.totalGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totals.totalGain >= 0 ? '+' : ''}{totals.totalGain.toFixed(2)}
            </p>
            <p className={`text-sm ${totals.totalGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totals.totalGain >= 0 ? '+' : ''}{totals.totalGainPercent.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Your Holdings */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Your Holdings</h2>
              <p className="text-white/70 text-sm">{portfolioStocks?.length || 0} stock{portfolioStocks?.length !== 1 ? 's' : ''}</p>
            </div>
            <Link href="/market" className="text-accent/60 hover:text-accent text-sm font-semibold transition-colors">
              Add More →
            </Link>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 rounded-full bg-white/10 animate-pulse mb-3" />
              <p className="text-white/60">Loading portfolio...</p>
            </div>
          ) : !portfolioStocks || portfolioStocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 text-accent/60" />
              </div>
              <h3 className="text-white font-semibold mb-2">No holdings yet</h3>
              <p className="text-white/60 text-sm text-center mb-4">Start building your portfolio by adding stocks</p>
              <Link href="/market" className="px-6 py-2 rounded-lg border border-accent/50 bg-accent/20 text-accent hover:bg-accent/30 transition-colors font-semibold">
                + Add Stocks
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolioStocks.map((holding: any) => {
                const profitLoss = parseFloat(holding.profit_loss) || 0;
                const currentPrice = parseFloat(holding.current_price) || 0;
                const quantity = parseInt(holding.quantity) || 0;
                const initialPrice = parseFloat(holding.initial_price) || 0;
                const percentChange = parseFloat(holding.percent_change) || 0;
                const isPositive = profitLoss >= 0;
                const currentValue = currentPrice * quantity;
                return (
                  <div
                    key={holding.symbol}
                    className="rounded-lg bg-secondary/20 border border-white/10 p-4 hover:bg-secondary/30 transition-all glow-cyan-hover"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {holding.company_logo ? (
                          <Image
                            src={holding.company_logo}
                            alt={holding.symbol}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded bg-white/10 flex-shrink-0 object-contain"
                            unoptimized
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-accent/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">{holding.symbol[0]}</span>
                          </div>
                        )}
                        <div>
                          <p className="text-white font-semibold text-sm">{holding.symbol}</p>
                          <p className="text-white/50 text-xs">{holding.company_name}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveStock(holding.symbol)}
                        disabled={removingStock === holding.symbol}
                        className="p-1 rounded hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <p className="text-white/60">Qty:</p>
                        <p className="text-white font-semibold">{quantity}</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-white/60">Entry:</p>
                        <p className="text-white font-semibold">${initialPrice.toFixed(2)}</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-white/60">Current:</p>
                        <p className="text-white font-semibold">${currentPrice.toFixed(2)}</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-white/60">Value:</p>
                        <p className="text-white font-semibold">${currentValue.toFixed(2)}</p>
                      </div>
                      <div className="pt-2 border-t border-white/10 flex justify-between">
                        <p className="text-white/60">P/L:</p>
                        <p className={`font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                          {isPositive ? '+' : ''}{percentChange.toFixed(2)}%
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
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Portfolio Stats</h2>
              <p className="text-white/70 text-sm">Performance overview</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Gainers */}
            <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-xs mb-1">Winning Stocks</p>
                  <p className="text-3xl font-bold text-green-400">{totals.gainersCount}</p>
                </div>
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
            </div>

            {/* Losers */}
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-xs mb-1">Losing Stocks</p>
                  <p className="text-3xl font-bold text-red-400">{totals.losersCount}</p>
                </div>
                <TrendingDown className="w-6 h-6 text-red-400" />
              </div>
            </div>

            {/* Return % */}
            <div className={`rounded-lg ${totals.totalGainPercent >= 0 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'} border p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-xs mb-1">Total Return</p>
                  <p className={`text-3xl font-bold ${totals.totalGainPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {totals.totalGainPercent >= 0 ? '+' : ''}{totals.totalGainPercent.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sidebar Menu */}
      <SidebarMenu 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName="Carl"
        userEmail="cedoe70@gmail.com"
      />

      {/* Bottom Navigation */}
      <DashboardNav />
    </div>
  );
}
