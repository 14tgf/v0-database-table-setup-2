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
            className="mb-8 rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-6 backdrop-blur-xl overflow-x-auto"
          >
            <h2 className="text-lg font-bold text-white mb-4">Your Portfolio</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-secondary/20">
                    <th className="text-left px-4 py-3 font-semibold text-white/70 whitespace-nowrap">STOCK</th>
                    <th className="text-right px-4 py-3 font-semibold text-white/70 whitespace-nowrap">QTY</th>
                    <th className="text-right px-4 py-3 font-semibold text-white/70 whitespace-nowrap">CURRENT</th>
                    <th className="text-right px-4 py-3 font-semibold text-white/70 whitespace-nowrap">RETURN</th>
                    <th className="text-center px-4 py-3 font-semibold text-white/70 whitespace-nowrap">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioStocks.map((stock) => {
                    const isPositive = stock.profit_loss >= 0;

                    return (
                      <tr key={stock.symbol} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                        {/* Stock Info */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {stock.company_logo ? (
                              <div className="relative w-8 h-8 flex-shrink-0">
                                <Image
                                  src={stock.company_logo}
                                  alt={stock.symbol}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                            ) : (
                              <div className="w-8 h-8 bg-accent/20 rounded flex items-center justify-center text-xs font-bold text-accent flex-shrink-0">
                                {stock.symbol[0]}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-white">{stock.symbol}</p>
                              <p className="text-xs text-white/50 hidden sm:block">{stock.company_name.substring(0, 12)}</p>
                            </div>
                          </div>
                        </td>

                        {/* Qty */}
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <p className="font-semibold text-white">{stock.quantity}</p>
                        </td>

                        {/* Current Price */}
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <p className="font-semibold text-white">${stock.current_price.toFixed(2)}</p>
                        </td>

                        {/* Return % */}
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <p className={`font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {isPositive ? '+' : ''}{stock.percent_change.toFixed(2)}%
                          </p>
                        </td>

                        {/* Remove Button */}
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleRemoveStock(stock.symbol)}
                            disabled={removingStock === stock.symbol}
                            className="inline-block px-3 py-1 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 disabled:opacity-50 transition-all font-bold text-sm"
                          >
                            {removingStock === stock.symbol ? '...' : 'Remove'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
                    className="flex items-center justify-between gap-2 p-3 rounded-lg border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 hover:bg-secondary/40 transition-all backdrop-blur-xl"
                  >
                    {/* Stock Info - Left side */}
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {stock.logo ? (
                        <div className="relative w-8 h-8 flex-shrink-0">
                          <Image
                            src={stock.logo}
                            alt={stock.ticker}
                            fill
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-accent/20 rounded flex items-center justify-center text-xs font-bold text-accent flex-shrink-0">
                          {stock.ticker[0]}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-white">{stock.ticker}</p>
                        <p className="text-xs text-white/50 truncate">{stock.companyName.substring(0, 20)}</p>
                      </div>
                    </div>

                    {/* Price & Change - Center (hidden on very small screens) */}
                    <div className="hidden xs:flex items-center gap-2 text-right flex-shrink-0">
                      <div>
                        <p className="text-xs text-white/50">Price</p>
                        <p className="font-semibold text-white text-sm">${stock.price.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/50">Change</p>
                        <p className={`font-semibold text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                          {isPositive ? '+' : ''}{stock.percentChange.toFixed(2)}%
                        </p>
                      </div>
                    </div>

                    {/* Action Button - Always visible on right */}
                    <div className="flex-shrink-0">
                      {inPortfolio ? (
                        <span className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 text-sm font-bold min-w-[50px]">
                          ✓
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAddStock(stock)}
                          disabled={addingStock === stock.ticker}
                          className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-accent/20 text-accent border border-accent/50 hover:bg-accent/30 disabled:opacity-50 transition-all font-bold text-sm min-w-[50px]"
                        >
                          {addingStock === stock.ticker ? '...' : '+'}
                        </button>
                      )}
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
