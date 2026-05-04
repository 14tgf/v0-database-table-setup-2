'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { getAllStocks, getStockQuote } from '@/lib/finnhub';
import { usePortfolio } from '@/hooks/usePortfolio';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';
import { SidebarMenu } from '@/components/dashboard/sidebar-menu';

export default function StockPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { stocks: portfolioStocks, userId, addStock, removeStock, isStockInPortfolio } = usePortfolio();
  const [addingStock, setAddingStock] = useState<string | null>(null);
  const [removingStock, setRemovingStock] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch stocks on mount
  useEffect(() => {
    const loadStocks = async () => {
      try {
        setLoading(true);
        const data = await getAllStocks();
        setStocks(data);
      } catch (err) {
        console.error('[v0] Error loading stocks:', err);
        setError('Failed to load stocks');
      } finally {
        setLoading(false);
      }
    };

    loadStocks();
  }, []);

  // Redirect if not authenticated
  if (!userId && !loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Authentication Required</h1>
          <p className="text-white/60 mb-6">Please log in to access your stock portfolio</p>
          <Link href="/login" className="px-6 py-2 bg-accent text-background rounded-lg font-semibold hover:bg-accent/90">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const handleAddStock = async (stock: any) => {
    setAddingStock(stock.ticker);
    setError(null);

    try {
      await addStock(stock.ticker, stock.companyName, stock.logo, stock.price);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to add stock';
      setError(errorMsg);
      console.error('[v0] Add stock error:', err);
    } finally {
      setAddingStock(null);
    }
  };

  const handleRemoveStock = async (symbol: string) => {
    if (!confirm(`Remove ${symbol} from portfolio?`)) return;

    setRemovingStock(symbol);
    setError(null);

    try {
      await removeStock(symbol);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to remove stock';
      setError(errorMsg);
      console.error('[v0] Remove stock error:', err);
    } finally {
      setRemovingStock(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image 
                src="/logo.png" 
                alt="X Holding" 
                width={80} 
                height={40}
                className="w-auto h-10"
              />
            </div>
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
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Stock Market</h1>
          <p className="text-white/70">Add stocks to your portfolio</p>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Your Portfolio Section */}
        {portfolioStocks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-6 backdrop-blur-xl"
          >
            <h2 className="text-lg font-bold text-white mb-4">Your Portfolio</h2>
            <div className="space-y-2">
              {portfolioStocks.map((stock) => {
                const isPositive = stock.profit_loss >= 0;
                return (
                  <div key={stock.symbol} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      {stock.company_logo ? (
                        <div className="relative w-8 h-8">
                          <Image
                            src={stock.company_logo}
                            alt={stock.symbol}
                            fill
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-accent/20 rounded flex items-center justify-center text-xs font-bold text-accent">
                          {stock.symbol[0]}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-white">{stock.symbol}</p>
                        <p className="text-xs text-white/50">{stock.company_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-white">${stock.current_price.toFixed(2)}</p>
                        <p className={`text-xs font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                          {isPositive ? '+' : ''}{stock.percent_change.toFixed(2)}%
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveStock(stock.symbol)}
                        disabled={removingStock === stock.symbol}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Available Stocks Section */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Available Stocks ({stocks.length})</h2>
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-white/60">Loading stocks...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {stocks.map((stock) => {
                const isPositive = stock.percentChange >= 0;
                const inPortfolio = isStockInPortfolio(stock.ticker);

                return (
                  <motion.div
                    key={stock.ticker}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 hover:bg-secondary/40 transition-all backdrop-blur-xl"
                  >
                    {/* Stock Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {stock.logo ? (
                        <div className="relative w-10 h-10 flex-shrink-0">
                          <Image
                            src={stock.logo}
                            alt={stock.ticker}
                            fill
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-accent/20 rounded flex items-center justify-center text-sm font-bold text-accent flex-shrink-0">
                          {stock.ticker[0]}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-white">{stock.ticker}</p>
                          <span className="text-xs text-white/50 hidden sm:inline">·</span>
                          <p className="text-xs text-white/60 truncate hidden sm:block">{stock.companyName}</p>
                        </div>
                        <p className="text-xs text-white/50 sm:hidden truncate">{stock.companyName}</p>
                      </div>
                    </div>

                    {/* Price & Change */}
                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center">
                      <div>
                        <p className="text-sm font-semibold text-white">${stock.price.toFixed(2)}</p>
                        <p className={`text-xs font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                          {isPositive ? '+' : ''}{stock.percentChange.toFixed(2)}%
                        </p>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => handleAddStock(stock)}
                        disabled={inPortfolio || addingStock === stock.ticker}
                        className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
                          inPortfolio
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-default'
                            : 'bg-accent/20 text-accent border border-accent/50 hover:bg-accent/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
                        }`}
                      >
                        {addingStock === stock.ticker ? (
                          <>
                            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            <span className="hidden sm:inline">Adding...</span>
                            <span className="sm:hidden">...</span>
                          </>
                        ) : inPortfolio ? (
                          <>
                            <span>✓ Added</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Navigation */}
      <DashboardNav />

      {/* Sidebar */}
      <SidebarMenu 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName="User"
        userEmail="user@example.com"
      />
    </div>
  );
}
