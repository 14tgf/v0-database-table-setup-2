'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Zap,
  BarChart3,
  Car,
  Wallet as WalletIcon,
  ArrowUpRight,
  ArrowRight,
} from 'lucide-react';
import { BalanceCard } from '@/components/dashboard/balance-card';
import { StatCard } from '@/components/dashboard/stat-card';
import { QuickActionCard } from '@/components/dashboard/quick-action-card';
import { RecentOrders } from '@/components/dashboard/recent-orders';
import { MarketOverview } from '@/components/dashboard/market-overview';
import { StockPerformance } from '@/components/dashboard/stock-performance';
import { NotificationsBell } from '@/components/dashboard/notifications-bell';
import { ThemeToggle } from '@/components/dashboard/theme-toggle';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';
import { SidebarMenu } from '@/components/dashboard/sidebar-menu';
import { useWallet } from '@/hooks/useWallet';
import { usePreloader } from '@/app/providers/preloader-provider';

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { wallet } = useWallet();
  const { isLoading } = usePreloader();

  // Debug logging for wallet updates
  useEffect(() => {
    console.log('[v0] DASHBOARD - Wallet data updated:', {
      stockHoldings: wallet?.stockHoldings,
      balance: wallet?.balance,
      investmentCount: wallet?.investmentCount,
      portfolioValue: wallet?.portfolioValue,
      timestamp: new Date().toISOString(),
    });
  }, [wallet]);

  // Log on component mount
  useEffect(() => {
    console.log('[v0] DASHBOARD - Page mounted');
    return () => {
      console.log('[v0] DASHBOARD - Page unmounted');
    };
  }, []);

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
      href: '/dashboard/investment-plans',
    },
    {
      title: 'Stocks',
      description: 'Trade individual stocks',
      actionText: 'Trade Stocks',
      icon: BarChart3,
      href: '/market',
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
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Image 
                src="/logo.png" 
                alt="X Holding" 
                width={80} 
                height={40}
                className="w-auto h-10"
              />
            </div>
            <div className="flex items-center gap-3">
              <NotificationsBell />
              <ThemeToggle />
              <button 
                onClick={() => setSidebarOpen(true)}
                className={`p-1.5 rounded-lg hover:bg-white/10 transition-all ${
                  isLoading ? 'hidden' : 'block'
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
            <Link href="/dashboard" className="px-3 py-1.5 rounded-lg text-sm text-white font-semibold bg-accent/20 border border-accent/50 whitespace-nowrap">Dashboard</Link>
            <Link href="/dashboard/wallet" className="px-3 py-1.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap">Wallet</Link>
            <Link href="/dashboard/investment-plans" className="px-3 py-1.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap">Plans</Link>
            <Link href="/dashboard/investments" className="px-3 py-1.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap">My Investments</Link>
            <Link href="/market" className="px-3 py-1.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap">Stocks</Link>
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

        {/* Book Appointment with Elon Musk */}
        <div className="mb-6 relative rounded-2xl overflow-hidden border border-accent/20">
          <div
            className="absolute inset-0 -z-10"
            style={{
              backgroundImage: 'url(/mars-starship.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center 30%',
            }}
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background/97 via-background/80 to-background/60" />
          <div className="px-6 py-8 md:px-10 md:py-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/30 rounded-full mb-4">
              <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
              <span className="text-xs font-bold text-accent tracking-widest">LIMITED APPOINTMENTS</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 text-balance">
              Book a Private Session<br />
              <span className="text-accent">with Elon Musk</span>
            </h2>
            <p className="text-muted-foreground text-xs leading-relaxed max-w-md mb-5">
              An unprecedented opportunity to sit down with Elon Musk — visionary behind Tesla, SpaceX, and X. Discuss investment opportunities, business ventures, or interplanetary ambitions.
            </p>
            <div className="flex flex-wrap gap-3 mb-6">
              {[
                { label: 'Appointment Fee', value: '$50,000' },
                { label: 'Session Length', value: '30 Minutes' },
                { label: 'Format', value: 'In-Person / Virtual' },
              ].map((stat) => (
                <div key={stat.label} className="bg-background/60 border border-white/10 rounded-xl px-4 py-2.5">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-sm font-bold text-accent">{stat.value}</p>
                </div>
              ))}
            </div>
            <Link
              href="/book-appointment"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-background font-bold rounded-xl hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/30 transition-all text-sm"
            >
              Apply for an Appointment
              <ArrowRight className="w-4 h-4" />
            </Link>
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
      />
    </div>
  );
}
