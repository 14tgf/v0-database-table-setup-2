'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bell, Sun, Plus, Minus, TrendingUp, TrendingDown, Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Zap, TrendingUpIcon } from 'lucide-react';
import { SidebarMenu } from '@/components/dashboard/sidebar-menu';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';
import { useWallet } from '@/hooks/useWallet';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import { usePreloader } from '@/app/providers/preloader-provider';
import { useTransactionHistory } from '@/hooks/useTransactionHistory';

export default function WalletPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { wallet, isLoading } = useWallet();
  const { transactions, isLoading: isTransactionsLoading } = useTransactionHistory();
  const { format } = useCurrencyFormatter();
  const { isLoading: isPreloading } = usePreloader();

  const walletBalance = wallet?.balance || 0;
  const totalDeposits = wallet?.totalDeposits || 0;
  const totalWithdrawals = wallet?.totalWithdrawals || 0;
  const totalInvested = wallet?.totalInvested || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-gradient-to-r from-background/95 via-background/85 to-background/70 backdrop-blur-xl">
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
            <div className="flex items-center gap-2">
              <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                <Sun className="w-5 h-5 text-white/60" />
              </button>
              <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                <Bell className="w-5 h-5 text-white/60" />
              </button>
              <button 
                onClick={() => setSidebarOpen(true)}
                className={`p-1.5 rounded-lg hover:bg-white/10 transition-all md:hidden ${
                  isPreloading ? 'hidden' : 'block'
                }`}
              >
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
          {/* Top Navigation Links */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            <Link href="/dashboard" className="px-3 py-1.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap">Dashboard</Link>
            <Link href="/dashboard/wallet" className="px-3 py-1.5 rounded-lg text-sm text-white font-semibold bg-accent/20 border border-accent/50 whitespace-nowrap">Wallet</Link>
            <Link href="/dashboard/investment-plans" className="px-3 py-1.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap">Plans</Link>
            <Link href="/dashboard/investments" className="px-3 py-1.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap">My Investments</Link>
            <Link href="/market" className="px-3 py-1.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap">Stocks</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-3 py-6 sm:px-4 lg:px-6">
        {/* Wallet Balance Header */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-4 sm:p-6 backdrop-blur-xl">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Wallet Balance</h1>
          <p className="text-white/70 text-sm mb-4">Manage your funds and transactions</p>
          
          {/* Available Balance Card */}
          <div className="rounded-xl border border-white/20 bg-white/5 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs sm:text-sm mb-2">Available Balance</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{isLoading ? '...' : format(walletBalance)}</p>
              </div>
              <WalletIcon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
          </div>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-6">
          {/* Deposit Card */}
          <Link href="/dashboard/deposit" className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-4 sm:p-6 backdrop-blur-xl hover:border-primary/30 transition-colors cursor-pointer glow-cyan-hover">
            <div className="flex flex-col items-start gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm sm:text-lg font-bold text-white mb-0.5 sm:mb-1">Deposit Funds</h3>
                <p className="text-white/70 text-xs sm:text-sm mb-2 sm:mb-3">Add money to your wallet</p>
                <div className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors font-medium text-xs sm:text-sm">
                  Add Funds <span>→</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Withdraw Card */}
          <Link href="/dashboard/withdraw" className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-4 sm:p-6 backdrop-blur-xl hover:border-primary/30 transition-colors cursor-pointer glow-cyan-hover">
            <div className="flex flex-col items-start gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-destructive/20 flex items-center justify-center flex-shrink-0">
                <Minus className="w-5 h-5 sm:w-6 sm:h-6 text-destructive" />
              </div>
              <div>
                <h3 className="text-sm sm:text-lg font-bold text-white mb-0.5 sm:mb-1">Withdraw Funds</h3>
                <p className="text-white/70 text-xs sm:text-sm mb-2 sm:mb-3">Transfer to your bank</p>
                <div className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors font-medium text-xs sm:text-sm">
                  Withdraw <span>→</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
          {/* Total Deposits */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-4 sm:p-6 backdrop-blur-xl glow-cyan-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-xs sm:text-sm mb-1 sm:mb-2">Total Deposits</p>
                <p className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-4">${totalDeposits.toFixed(2)}</p>
                <p className="text-white/60 text-xs">This month</p>
              </div>
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0" />
            </div>
          </div>

          {/* Total Withdrawals */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-4 sm:p-6 backdrop-blur-xl glow-cyan-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-xs sm:text-sm mb-1 sm:mb-2">Total Withdrawals</p>
                <p className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-4">${totalWithdrawals.toFixed(2)}</p>
                <p className="text-white/60 text-xs">This month</p>
              </div>
              <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0" />
            </div>
          </div>
        </div>

        {/* Total Invested Card */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-4 sm:p-6 backdrop-blur-xl glow-cyan-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-xs sm:text-sm mb-1 sm:mb-2">Total Invested</p>
              <p className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">${totalInvested.toFixed(2)}</p>
              <p className="text-white/60 text-xs">Portfolio value</p>
            </div>
            <WalletIcon className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0" />
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-4 sm:p-6 backdrop-blur-xl mb-24">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Recent Transactions</h2>
              <p className="text-white/70 text-xs sm:text-sm">Your latest wallet activity</p>
            </div>
          </div>

          {isTransactionsLoading ? (
            <div className="py-8 sm:py-12 text-center">
              <p className="text-white/60">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-8 sm:py-12 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                <WalletIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white/40" />
              </div>
              <p className="text-white text-base sm:text-lg font-medium mb-2">No transactions yet</p>
              <p className="text-white/70 text-xs sm:text-sm mb-4 sm:mb-6">Start by depositing funds to your wallet</p>
              <button className="bg-white text-background px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium text-sm hover:bg-white/90 transition-colors">
                <Link href="/dashboard/deposit">
                  + Deposit Funds
                </Link>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => {
                const isIncoming = tx.transaction_type === 'deposit' || 
                                  tx.transaction_type === 'investment_return' || 
                                  tx.transaction_type === 'stock_sell' ||
                                  tx.transaction_type === 'admin_adjustment' && tx.amount > 0;
                const icon = isIncoming ? <ArrowDownLeft /> : <ArrowUpRight />;
                const iconBg = isIncoming ? 'bg-primary/20' : 'bg-destructive/20';
                const iconColor = isIncoming ? 'text-primary' : 'text-destructive';
                
                // Status colors
                let statusBg = 'bg-gray-500/20';
                let statusColor = 'text-gray-400';
                let statusText = 'Completed';
                
                if (tx.status === 'pending') {
                  statusBg = 'bg-yellow-500/20';
                  statusColor = 'text-yellow-400';
                  statusText = 'Pending';
                } else if (tx.status === 'approved') {
                  statusBg = 'bg-green-500/20';
                  statusColor = 'text-green-400';
                  statusText = 'Approved';
                } else if (tx.status === 'rejected') {
                  statusBg = 'bg-red-500/20';
                  statusColor = 'text-red-400';
                  statusText = 'Rejected';
                }
                
                return (
                  <div key={tx.id} className="flex items-center justify-between p-3 sm:p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
                        {icon && <div className={`w-5 h-5 ${iconColor}`}>{icon}</div>}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-medium text-sm sm:text-base capitalize truncate">
                          {tx.transaction_type.replace(/_/g, ' ')}
                        </p>
                        <p className="text-white/60 text-xs sm:text-sm truncate">{tx.description}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="flex items-center gap-2 justify-end">
                        <div className={`px-2.5 py-1 rounded-full ${statusBg} text-xs font-semibold ${statusColor}`}>
                          {statusText}
                        </div>
                      </div>
                      <p className={`font-semibold text-sm sm:text-base mt-1 ${isIncoming ? 'text-primary' : 'text-destructive'}`}>
                        {isIncoming ? '+' : '-'}${Math.abs(parseFloat(tx.amount as any) || 0).toFixed(2)}
                      </p>
                      <p className="text-white/60 text-xs">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
