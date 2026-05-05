'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, TrendingUp, TrendingDown, Minus, Loader } from 'lucide-react';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';

export default function PortfolioPage() {
  const { user } = useAuth();
  const { stocks, isLoading, removeStock } = usePortfolio();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [removingSymbol, setRemovingSymbol] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleRemoveStock = async (symbol: string) => {
    if (!confirm(`Are you sure you want to remove ${symbol} from your portfolio?`)) {
      return;
    }

    setRemovingSymbol(symbol);
    setMessage(null);

    try {
      const result = await removeStock(symbol);
      setMessage({
        type: 'success',
        text: `${symbol} removed! P&L: $${result.realizedProfitLoss.toFixed(2)}`,
      });
      setTimeout(() => setMessage(null), 4000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to remove stock';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setRemovingSymbol(null);
    }
  };

  const calculateTotalValue = () => {
    return stocks.reduce((total, stock) => {
      const currentValue = parseFloat(stock.current_price || 0) * (stock.quantity || 1);
      return total + currentValue;
    }, 0);
  };

  const calculateTotalInvested = () => {
    return stocks.reduce((total, stock) => {
      return total + parseFloat(stock.invested_amount || 0);
    }, 0);
  };

  const calculateTotalPL = () => {
    return calculateTotalValue() - calculateTotalInvested();
  };

  const totalValue = calculateTotalValue();
  const totalInvested = calculateTotalInvested();
  const totalPL = calculateTotalPL();
  const plPercent = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 mb-4">Please log in to view your portfolio</p>
          <Link href="/login" className="text-accent hover:text-accent/80">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-3">
            <Link href="/dashboard">
              <Image
                src="/logo.png"
                alt="X Holding"
                width={80}
                height={40}
                className="w-auto h-10"
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
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Portfolio</h1>
          <p className="text-white/60">Manage your stock holdings</p>
        </div>

        {/* Message Alert */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                : 'bg-red-500/20 text-red-400 border border-red-500/50'
            }`}
          >
            {message.text}
          </motion.div>
        )}

        {/* Portfolio Summary */}
        {stocks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-white/60 text-sm mb-2">Total Invested</p>
              <p className="text-2xl font-bold text-white">${totalInvested.toFixed(2)}</p>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-white/60 text-sm mb-2">Current Value</p>
              <p className="text-2xl font-bold text-white">${totalValue.toFixed(2)}</p>
            </div>
            <div className={`p-4 rounded-lg border ${
              totalPL >= 0
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              <p className="text-white/60 text-sm mb-2">Total P&L</p>
              <p className={`text-2xl font-bold ${totalPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${totalPL.toFixed(2)} ({totalPL >= 0 ? '+' : ''}{plPercent.toFixed(2)}%)
              </p>
            </div>
          </div>
        )}

        {/* Stocks List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-accent animate-spin" />
          </div>
        ) : stocks.length === 0 ? (
          <div className="text-center py-12 rounded-lg bg-white/5 border border-white/10">
            <p className="text-white/60 mb-4">No stocks in your portfolio yet</p>
            <Link
              href="/market"
              className="inline-block px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/80 transition-colors"
            >
              Browse Stocks
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {stocks.map((stock, index) => {
              const currentValue = parseFloat(stock.current_price || 0) * (stock.quantity || 1);
              const invested = parseFloat(stock.invested_amount || 0);
              const pl = currentValue - invested;
              const plPercent = invested > 0 ? (pl / invested) * 100 : 0;
              const isPositive = pl >= 0;

              return (
                <motion.div
                  key={stock.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Left - Company Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {stock.company_logo ? (
                        <div className="relative w-10 h-10 rounded-lg bg-white/10 overflow-hidden flex-shrink-0">
                          <Image
                            src={stock.company_logo}
                            alt={stock.company_name}
                            fill
                            className="object-cover"
                            sizes="40px"
                            onError={() => console.log(`Failed to load logo`)}
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-accent/20 border border-accent/50 flex items-center justify-center text-xs font-bold text-accent flex-shrink-0">
                          {stock.symbol.substring(0, 1)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-white">{stock.symbol}</p>
                        <p className="text-xs text-white/60 truncate">{stock.company_name}</p>
                      </div>
                    </div>

                    {/* Middle - Prices */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-white">
                        ${parseFloat(stock.current_price || 0).toFixed(2)}
                      </p>
                      <p className="text-xs text-white/60">
                        Qty: {stock.quantity}
                      </p>
                    </div>

                    {/* Middle - Value and P&L */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-white">
                        ${currentValue.toFixed(2)}
                      </p>
                      <p className={`text-xs font-semibold flex items-center justify-end gap-1 ${
                        isPositive ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isPositive ? '+' : ''}{pl.toFixed(2)} ({plPercent.toFixed(2)}%)
                      </p>
                    </div>

                    {/* Right - Delete Button */}
                    <button
                      onClick={() => handleRemoveStock(stock.symbol)}
                      disabled={removingSymbol === stock.symbol}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 flex-shrink-0"
                      title="Remove from portfolio"
                    >
                      {removingSymbol === stock.symbol ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
