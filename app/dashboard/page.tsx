'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Zap,
  BarChart3,
  Car,
  Wallet as WalletIcon,
  ArrowUpRight,
} from 'lucide-react';
import { BalanceCard } from '@/components/dashboard/balance-card';
import { StatCard } from '@/components/dashboard/stat-card';
import { QuickActionCard } from '@/components/dashboard/quick-action-card';
import { RecentOrders } from '@/components/dashboard/recent-orders';
import { MarketOverview } from '@/components/dashboard/market-overview';
import { StockPerformance } from '@/components/dashboard/stock-performance';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';
import { SidebarMenu } from '@/components/dashboard/sidebar-menu';
import { useWallet } from '@/hooks/useWallet';

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { wallet } = useWallet();

  const statCards = [
    {
      title: 'Portfolio Value',
      value: wallet?.portfolioValue || 0,
      subtitle: '+0.0% this month',
      icon: TrendingUp,
    },
    {
      title: 'Investments',
      value: wallet?.investmentCount || 0,
      subtitle: `${wallet?.investmentCount || 0} active investments`,
      icon: BarChart3,
    },
    {
      title: 'Stock Holdings',
      value: wallet?.stockHoldings || 0,
      subtitle: `${wallet?.stockHoldings || 0} stock positions`,
      icon: Zap,
    },
    {
      title: 'Tesla Vehicles',
      value: wallet?.teslaVehicles || '0',
      subtitle: 'Electric fleet',
      icon: Car,
    },
  ];

  const quickActions = [
    {
      title: 'Browse Cars',
      description: 'Explore our inventory',
      actionText: 'View Inventory',
      icon: Car,
      href: '/inventory',
    },
    {
      title: 'Investments',
      description: 'Grow your wealth',
      actionText: 'Start Investing',
      icon: TrendingUp,
      href: '/dashboard/invest',
    },
    {
      title: 'Stocks',
      description: 'Trade individual stocks',
      actionText: 'Trade Stocks',
      icon: BarChart3,
      href: '/stocks',
    },
    {
      title: 'Portfolio',
      description: 'View your holdings',
      actionText: 'View Portfolio',
      icon: WalletIcon,
      href: '/portfolio',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
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
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-24">
        {/* Balance Card */}
        <div className="mb-6">
          <BalanceCard />
        </div>

        {/* Stat Cards Grid - 2x2 Layout */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {statCards.map((card, index) => (
            <StatCard key={card.title} {...card} index={index} />
          ))}
        </div>

        {/* Quick Action Cards - 2x2 Layout */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <QuickActionCard key={action.title} {...action} index={index} />
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="mb-6">
          <RecentOrders />
        </div>

        {/* Market Overview */}
        <div className="mb-6">
          <MarketOverview />
        </div>

        {/* Stock Performance */}
        <div className="mb-6">
          <StockPerformance />
        </div>
      </main>

      {/* Sticky Navigation */}
      <DashboardNav />

      {/* Sidebar Menu */}
      <SidebarMenu 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName="Carl"
        userEmail="cedoe70@gmail.com"
      />
    </div>
  );
}
