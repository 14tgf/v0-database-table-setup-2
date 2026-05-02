'use client';

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

export default function DashboardPage() {
  const statCards = [
    {
      title: 'Portfolio Value',
      value: '$0.00',
      subtitle: '+0.0% this month',
      icon: TrendingUp,
    },
    {
      title: 'Investments',
      value: '$0.00',
      subtitle: '0 active investments',
      icon: BarChart3,
    },
    {
      title: 'Stock Holdings',
      value: '$0.00',
      subtitle: '0 stock positions',
      icon: Zap,
    },
    {
      title: 'Tesla Vehicles',
      value: '0',
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
    },
    {
      title: 'Investments',
      description: 'Grow your wealth',
      actionText: 'Start Investing',
      icon: TrendingUp,
    },
    {
      title: 'Stocks',
      description: 'Trade individual stocks',
      actionText: 'Trade Stocks',
      icon: BarChart3,
    },
    {
      title: 'Portfolio',
      description: 'View your holdings',
      actionText: 'View Portfolio',
      icon: WalletIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Welcome back, Carl</h1>
              <p className="text-sm text-white/60 mt-1">Manage your investments and portfolio</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 1.5H3a1.5 1.5 0 00-1.5 1.5v16A1.5 1.5 0 003 20.5h10.5M17 9l4 4m0 0l-4 4m4-4H9" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        {/* Balance Card */}
        <div className="mb-8">
          <BalanceCard />
        </div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          {statCards.map((card, index) => (
            <StatCard key={card.title} {...card} index={index} />
          ))}
        </div>

        {/* Quick Action Cards */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4">
            {quickActions.map((action, index) => (
              <QuickActionCard key={action.title} {...action} index={index} />
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="mb-8">
          <RecentOrders />
        </div>

        {/* Market Overview */}
        <div className="mb-8">
          <MarketOverview />
        </div>

        {/* Stock Performance */}
        <div className="mb-8">
          <StockPerformance />
        </div>
      </main>

      {/* Sticky Navigation */}
      <DashboardNav />
    </div>
  );
}
