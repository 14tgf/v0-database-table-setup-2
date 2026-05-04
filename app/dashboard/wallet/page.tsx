'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bell, Sun, Plus, Minus, TrendingUp, TrendingDown, Wallet as WalletIcon } from 'lucide-react';
import { SidebarMenu } from '@/components/dashboard/sidebar-menu';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';

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
                <p className="text-2xl sm:text-3xl font-bold text-white">${walletBalance.toFixed(2)}</p>
              </div>
              <WalletIcon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
          </div>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-6">
          {/* Deposit Card */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-4 sm:p-6 backdrop-blur-xl hover:border-primary/30 transition-colors cursor-pointer glow-cyan-hover">
            <div className="flex flex-col items-start gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm sm:text-lg font-bold text-white mb-0.5 sm:mb-1">Deposit Funds</h3>
                <p className="text-white/70 text-xs sm:text-sm mb-2 sm:mb-3">Add money to your wallet</p>
                <a href="#" className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors font-medium text-xs sm:text-sm">
                  Add Funds <span>→</span>
                </a>
              </div>
            </div>
          </div>

          {/* Withdraw Card */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-4 sm:p-6 backdrop-blur-xl hover:border-primary/30 transition-colors cursor-pointer glow-cyan-hover">
            <div className="flex flex-col items-start gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-destructive/20 flex items-center justify-center flex-shrink-0">
                <Minus className="w-5 h-5 sm:w-6 sm:h-6 text-destructive" />
              </div>
              <div>
                <h3 className="text-sm sm:text-lg font-bold text-white mb-0.5 sm:mb-1">Withdraw Funds</h3>
                <p className="text-white/70 text-xs sm:text-sm mb-2 sm:mb-3">Transfer to your bank</p>
                <a href="#" className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors font-medium text-xs sm:text-sm">
                  Withdraw <span>→</span>
                </a>
              </div>
            </div>
          </div>
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
            <a href="#" className="text-primary hover:text-primary/80 transition-colors font-medium text-xs sm:text-sm flex items-center gap-1">
              View All <span>→</span>
            </a>
          </div>

          {/* Empty State */}
          <div className="py-8 sm:py-12 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
              <WalletIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white/40" />
            </div>
            <p className="text-white text-base sm:text-lg font-medium mb-2">No transactions yet</p>
            <p className="text-white/70 text-xs sm:text-sm mb-4 sm:mb-6">Start by depositing funds to your wallet</p>
            <button className="bg-white text-background px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium text-sm hover:bg-white/90 transition-colors">
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

      {/* Bottom Navigation */}
      <DashboardNav />
    </div>
  );
}
