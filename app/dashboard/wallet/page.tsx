'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bell, Sun, Plus, Minus, TrendingUp, TrendingDown, Wallet as WalletIcon } from 'lucide-react';
import { SidebarMenu } from '@/components/dashboard/sidebar-menu';

export default function WalletPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const walletBalance = 0;
  const totalDeposits = 0;
  const totalWithdrawals = 0;
  const totalInvested = 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-gradient-to-r from-background/95 via-background/85 to-background/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <Image 
                src="/logo.png" 
                alt="X Holding" 
                width={32} 
                height={32}
                className="w-8 h-8 cursor-pointer hover:opacity-80 transition-opacity"
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
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors md:hidden"
              >
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Wallet Balance Header */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-6 backdrop-blur-xl">
          <h1 className="text-2xl font-bold text-white mb-2">Wallet Balance</h1>
          <p className="text-white/70 mb-6">Manage your funds and transactions</p>
          
          {/* Available Balance Card */}
          <div className="rounded-xl border border-white/20 bg-white/5 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm mb-2">Available Balance</p>
                <p className="text-3xl font-bold text-white">${walletBalance.toFixed(2)}</p>
              </div>
              <WalletIcon className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Deposit Card */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-6 backdrop-blur-xl hover:border-primary/30 transition-colors cursor-pointer glow-cyan-hover">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">Deposit Funds</h3>
                <p className="text-white/70 text-sm mb-4">Add money to your wallet</p>
                <a href="#" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium text-sm">
                  Add Funds <span>→</span>
                </a>
              </div>
            </div>
          </div>

          {/* Withdraw Card */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-6 backdrop-blur-xl hover:border-primary/30 transition-colors cursor-pointer glow-cyan-hover">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center flex-shrink-0">
                <Minus className="w-6 h-6 text-destructive" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">Withdraw Funds</h3>
                <p className="text-white/70 text-sm mb-4">Transfer money to your bank</p>
                <a href="#" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium text-sm">
                  Withdraw <span>→</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Total Deposits */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-6 backdrop-blur-xl glow-cyan-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm mb-2">Total Deposits</p>
                <p className="text-2xl font-bold text-white mb-4">${totalDeposits.toFixed(2)}</p>
                <p className="text-white/60 text-xs">This month</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </div>

          {/* Total Withdrawals */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-6 backdrop-blur-xl glow-cyan-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm mb-2">Total Withdrawals</p>
                <p className="text-2xl font-bold text-white mb-4">${totalWithdrawals.toFixed(2)}</p>
                <p className="text-white/60 text-xs">This month</p>
              </div>
              <TrendingDown className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>

        {/* Total Invested Card */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-6 backdrop-blur-xl glow-cyan-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm mb-2">Total Invested</p>
              <p className="text-2xl font-bold text-white mb-2">${totalInvested.toFixed(2)}</p>
              <p className="text-white/60 text-xs">Portfolio value</p>
            </div>
            <WalletIcon className="w-8 h-8 text-primary" />
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
              <p className="text-white/70 text-sm">Your latest wallet activity</p>
            </div>
            <a href="#" className="text-primary hover:text-primary/80 transition-colors font-medium text-sm flex items-center gap-1">
              View All <span>→</span>
            </a>
          </div>

          {/* Empty State */}
          <div className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
              <WalletIcon className="w-8 h-8 text-white/40" />
            </div>
            <p className="text-white text-lg font-medium mb-2">No transactions yet</p>
            <p className="text-white/70 text-sm mb-6">Start by depositing funds to your wallet</p>
            <button className="bg-white text-background px-6 py-2.5 rounded-lg font-medium hover:bg-white/90 transition-colors">
              + Deposit Funds
            </button>
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

      {/* Sticky Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-background/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-around md:justify-start md:gap-8">
            <Link href="/dashboard" className="flex flex-col items-center gap-1 text-white/60 hover:text-white transition-colors py-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 13h2v8H3zm4-8h2v16H7zm4-2h2v18h-2zm4-2h2v20h-2zm4 4h2v16h-2zm4-4h2v20h-2z"/>
              </svg>
              <span className="text-xs">Dashboard</span>
            </Link>
            <Link href="/dashboard/wallet" className="flex flex-col items-center gap-1 text-primary py-2">
              <WalletIcon className="w-5 h-5" />
              <span className="text-xs font-medium">Wallet</span>
            </Link>
            <Link href="/dashboard/invest" className="flex flex-col items-center gap-1 text-white/60 hover:text-white transition-colors py-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-xs">Invest</span>
            </Link>
            <Link href="/stocks" className="flex flex-col items-center gap-1 text-white/60 hover:text-white transition-colors py-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 13h2v8H3zm4-8h2v16H7zm4-2h2v18h-2z"/>
              </svg>
              <span className="text-xs">Stocks</span>
            </Link>
            <Link href="/portfolio" className="flex flex-col items-center gap-1 text-white/60 hover:text-white transition-colors py-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span className="text-xs">Portfolio</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}
