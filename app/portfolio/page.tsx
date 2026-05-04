'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, RefreshCw, Trash2 } from 'lucide-react';
import { SidebarMenu } from '@/components/dashboard/sidebar-menu';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';
import { usePortfolioStocks } from '@/hooks/usePortfolioStocks';
import { motion } from 'framer-motion';

export default function PortfolioPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { stocks, portfolio, isLoading, refreshPrices, removeStock } = usePortfolioStocks();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshPrices();
    } catch (error) {
      console.error('[v0] Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRemoveStock = async (symbol: string) => {
    if (window.confirm(`Remove ${symbol} from portfolio?`)) {
      try {
        await removeStock(symbol);
      } catch (error) {
        console.error('[v0] Remove failed:', error);
      }
    }
  };

  const totalStocks = portfolio?.totalStocks || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors text-xs font-semibold"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to Dashboard
            </Link>
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-all"
            >
              <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Stock Portfolio</h1>
          <p className="text-white/70 text-sm">Track your stock investments and monitor performance</p>
        </div>

        {isLoading && totalStocks === 0 ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/60">Loading portfolio...</p>
          </div>
        ) : totalStocks === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-12 text-center backdrop-blur-xl"
          >
            <TrendingUp className="w-12 h-12 text-white/30 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">No Stocks Yet</h2>
            <p className="text-white/60 text-sm mb-6">Start building your portfolio by adding stocks from the market.</p>
            <Link
              href="/market"
              className="inline-block px-6 py-2 bg-accent text-background rounded-lg font-medium text-sm hover:bg-accent/90 transition-colors"
            >
              Browse Stocks
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Portfolio Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-4 backdrop-blur-xl"
              >
                <p className="text-white/70 text-xs mb-2">Active Stocks</p>
                <p className="text-3xl font-bold text-white">{portfolio?.totalStocks || 0}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-4 backdrop-blur-xl"
              >
                <p className="text-white/70 text-xs mb-2">Total Invested</p>
                <p className="text-2xl font-bold text-white">${(portfolio?.totalInvested || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-4 backdrop-blur-xl"
              >
                <p className="text-white/70 text-xs mb-2">Current Value</p>
                <p className="text-2xl font-bold text-white">${(portfolio?.totalCurrentValue || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-4 backdrop-blur-xl"
              >
                <p className="text-white/70 text-xs mb-2">Total Return</p>
                <p className={`text-2xl font-bold ${portfolio && portfolio.totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {portfolio && portfolio.totalProfitLoss >= 0 ? '+' : ''}${(portfolio?.totalProfitLoss || 0).toFixed(2)}
                </p>
              </motion.div>
            </div>

            {/* Portfolio Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-4 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-xs mb-1">Portfolio Return</p>
                    <p className={`text-2xl font-bold ${portfolio && portfolio.portfolioPercentChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {portfolio && portfolio.portfolioPercentChange >= 0 ? '+' : ''}{portfolio?.portfolioPercentChange.toFixed(2)}%
                    </p>
                  </div>
                  {portfolio && portfolio.portfolioPercentChange >= 0 ? (
                    <ArrowUpRight className="w-8 h-8 text-green-400" />
                  ) : (
                    <ArrowDownLeft className="w-8 h-8 text-red-400" />
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-4 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-xs mb-1">Winning Stocks</p>
                    <p className="text-2xl font-bold text-green-400">{portfolio?.winningStocks || 0}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-4 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-xs mb-1">Losing Stocks</p>
                    <p className="text-2xl font-bold text-red-400">{portfolio?.losingStocks || 0}</p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-red-400" />
                </div>
              </motion.div>
            </div>

            {/* Stocks Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 backdrop-blur-xl overflow-hidden"
            >
              <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Your Holdings</h2>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-2 rounded-lg bg-accent/20 hover:bg-accent/30 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 text-accent ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-white/70 font-medium">Symbol</th>
                      <th className="text-left py-3 px-4 text-white/70 font-medium">Company</th>
                      <th className="text-left py-3 px-4 text-white/70 font-medium">Entry Price</th>
                      <th className="text-left py-3 px-4 text-white/70 font-medium">Current Price</th>
                      <th className="text-left py-3 px-4 text-white/70 font-medium">Qty</th>
                      <th className="text-left py-3 px-4 text-white/70 font-medium">Invested</th>
                      <th className="text-left py-3 px-4 text-white/70 font-medium">Current Value</th>
                      <th className="text-left py-3 px-4 text-white/70 font-medium">P/L</th>
                      <th className="text-left py-3 px-4 text-white/70 font-medium">Return %</th>
                      <th className="text-center py-3 px-4 text-white/70 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stocks.map((stock) => {
                      const isPositive = stock.profitLoss >= 0;
                      const currentValue = stock.currentPrice * stock.quantity;

                      return (
                        <tr key={stock.symbol} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4 text-white font-semibold">{stock.symbol}</td>
                          <td className="py-3 px-4 text-white/70">{stock.companyName}</td>
                          <td className="py-3 px-4 text-white">${stock.initialPrice.toFixed(2)}</td>
                          <td className="py-3 px-4 text-white">${stock.currentPrice.toFixed(2)}</td>
                          <td className="py-3 px-4 text-white">{stock.quantity}</td>
                          <td className="py-3 px-4 text-white">${stock.investedAmount.toFixed(2)}</td>
                          <td className="py-3 px-4 text-white">${currentValue.toFixed(2)}</td>
                          <td className={`py-3 px-4 font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {isPositive ? '+' : ''}${stock.profitLoss.toFixed(2)}
                          </td>
                          <td className={`py-3 px-4 font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {isPositive ? '+' : ''}{stock.percentChange.toFixed(2)}%
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleRemoveStock(stock.symbol)}
                              className="p-1 rounded-lg hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors"
                              title="Remove stock"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </>
        )}
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


