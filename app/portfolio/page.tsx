'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, RefreshCw, Trash2, Plus } from 'lucide-react';
import { SidebarMenu } from '@/components/dashboard/sidebar-menu';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';
import { usePortfolioStocks } from '@/hooks/usePortfolioStocks';
import { useMarketData } from '@/hooks/use-market-data';
import { motion } from 'framer-motion';

export default function PortfolioPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { stocks, portfolio, isLoading, refreshPrices, removeStock, addStock } = usePortfolioStocks();
  const { stocks: marketStocks, loading: marketLoading } = useMarketData();
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleAddStock = async (ticker: string, companyName: string, logo: string, price: number) => {
    try {
      await addStock(ticker, companyName, logo, price);
    } catch (error) {
      console.error('[v0] Add failed:', error);
    }
  };

  // Filter available stocks (not already in portfolio)
  const availableStocks = marketStocks.filter(
    (stock) => !stocks.some(s => s.symbol === stock.ticker)
  ).filter(stock => 
    stock.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.companyName.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 8); // Show top 8 available stocks

  const portfolioSymbols = stocks.map(s => s.symbol);
  const hasAvailableStocks = availableStocks.length > 0;

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

            {/* Browse & Add Stocks Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 backdrop-blur-xl p-6 mt-8"
            >
              <div className="mb-6">
                <h2 className="text-lg font-bold text-white mb-2">Browse & Add More Stocks</h2>
                <p className="text-white/70 text-sm mb-4">Search for stocks to add to your portfolio</p>
                <input
                  type="text"
                  placeholder="Search by symbol or company name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-accent/50 text-sm"
                />
              </div>

              {marketLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-white/60 text-sm">Loading market data...</p>
                </div>
              ) : availableStocks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {availableStocks.map((stock) => (
                    <motion.div
                      key={stock.ticker}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-white/10 bg-secondary/30 p-4 hover:bg-secondary/40 transition-all"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        {stock.logo ? (
                          <div className="relative w-8 h-8 rounded-lg bg-white/10 overflow-hidden flex-shrink-0">
                            <Image
                              src={stock.logo}
                              alt={stock.companyName}
                              fill
                              className="object-cover"
                              sizes="32px"
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/50 flex items-center justify-center text-xs font-bold text-accent flex-shrink-0">
                            {stock.ticker.substring(0, 1)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white">{stock.ticker}</p>
                          <p className="text-xs text-white/60 truncate">{stock.companyName}</p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-lg font-bold text-white">${stock.price.toFixed(2)}</p>
                        <p className={`text-xs font-semibold ${stock.percentChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {stock.percentChange >= 0 ? '+' : ''}{stock.percentChange.toFixed(2)}%
                        </p>
                      </div>

                      <button
                        onClick={() => handleAddStock(stock.ticker, stock.companyName, stock.logo, stock.price)}
                        className="w-full py-2 px-3 rounded-lg bg-accent/20 text-accent border border-accent/50 hover:bg-accent/30 transition-colors font-medium text-xs flex items-center justify-center gap-2"
                      >
                        <Plus className="w-3 h-3" />
                        Add
                      </button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  {searchQuery ? (
                    <>
                      <p className="text-white/60 text-sm">No matching stocks available to add</p>
                    </>
                  ) : (
                    <>
                      <p className="text-white/60 text-sm mb-4">All available stocks are in your portfolio</p>
                      <Link
                        href="/market"
                        className="inline-block px-4 py-2 bg-accent/20 text-accent border border-accent/50 rounded-lg text-sm font-medium hover:bg-accent/30 transition-colors"
                      >
                        Browse All Stocks
                      </Link>
                    </>
                  )}
                </div>
              )}
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


