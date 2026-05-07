'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bell, Sun, TrendingUp, TrendingDown, Zap, DollarSign, Calendar, Eye, RefreshCw, Download, Activity, ArrowUpRight, ArrowDownLeft, Clock, ArrowUp, BarChart2, RefreshCcw, Send } from 'lucide-react';
import { SidebarMenu } from '@/components/dashboard/sidebar-menu';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';
import { useInvestments } from '@/hooks/useInvestments';

export default function InvestmentsDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { plans, investments, totals, plansLoading, investmentsLoading } = useInvestments();

  // Format currency
  const formatCurrency = (value: any) => {
    const num = parseFloat(value) || 0;
    return `$${num.toFixed(2)}`;
  };

  // Get timeline of recent investments
  const timeline = useMemo(() => {
    return investments.slice(0, 5).map((inv: any) => ({
      title: `Invested in ${inv.plan_name}`,
      description: `${formatCurrency(inv.amount)} invested with ${inv.returns}% ROI`,
      date: new Date(inv.created_at).toLocaleDateString(),
      icon: TrendingUp,
    }));
  }, [investments]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-gradient-to-r from-background/95 via-background/85 to-background/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-3 py-3 sm:px-4">
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
            <Link href="/dashboard/investment-plans" className="px-3 py-1.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap">Plans</Link>
            <Link href="/dashboard/investments" className="px-3 py-1.5 rounded-lg text-sm text-white font-semibold bg-accent/20 border border-accent/50 whitespace-nowrap">My Investments</Link>
            <Link href="/market" className="px-3 py-1.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap">Stocks</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 py-4 sm:px-4 lg:px-6">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Investment Dashboard</h1>
          <p className="text-white/70 text-sm">Track all your investment activity and earnings</p>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-3 sm:p-4 backdrop-blur-xl glow-cyan-hover">
            <p className="text-white/70 text-xs mb-1">Total Invested</p>
            <p className="text-lg sm:text-2xl font-bold text-white mb-1">{formatCurrency(totals.totalInvested || 0)}</p>
            <p className="text-green-400 text-xs flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {totals.activeCount || 0} active
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-3 sm:p-4 backdrop-blur-xl glow-cyan-hover">
            <p className="text-white/70 text-xs mb-1">Active Investments</p>
            <p className="text-lg sm:text-2xl font-bold text-white mb-1">{totals.activeCount || 0}</p>
            <p className="text-white/60 text-xs">Growing your wealth</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-3 sm:p-4 backdrop-blur-xl glow-cyan-hover">
            <p className="text-white/70 text-xs mb-1">Total Returns</p>
            <p className="text-lg sm:text-2xl font-bold text-white mb-1">{formatCurrency(totals.totalProfit || 0)}</p>
            <p className="text-green-400 text-xs">{totals.averageRoi || 0}% avg ROI</p>
          </div>
        </div>

        {/* Investment Table */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-3 sm:p-4 backdrop-blur-xl overflow-hidden">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Investment Portfolio</h2>
          {investmentsLoading ? (
            <p className="text-white/60 text-sm">Loading investments...</p>
          ) : investments.length === 0 ? (
            <p className="text-white/60 text-sm">No active investments yet. <Link href="/dashboard/investment-plans" className="text-accent hover:underline">Browse investment plans</Link></p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 px-2 text-white/70 font-medium">Plan</th>
                    <th className="text-left py-2 px-2 text-white/70 font-medium">Amount</th>
                    <th className="text-left py-2 px-2 text-white/70 font-medium">ROI</th>
                    <th className="text-left py-2 px-2 text-white/70 font-medium">Duration</th>
                    <th className="text-left py-2 px-2 text-white/70 font-medium">Status</th>
                    <th className="text-left py-2 px-2 text-white/70 font-medium">Maturity Date</th>
                  </tr>
                </thead>
                <tbody>
                  {investments.map((investment: any) => {
                    // Use maturity_date from API if available, otherwise calculate it
                    let maturityDate;
                    if (investment.maturity_date) {
                      maturityDate = new Date(investment.maturity_date);
                    } else {
                      const createdDate = new Date(investment.created_at);
                      const durationMonths = parseInt(investment.duration_months) || 0;
                      maturityDate = new Date(createdDate.getTime() + durationMonths * 30 * 24 * 60 * 60 * 1000);
                    }
                    const isMatured = maturityDate <= new Date();
                    return (
                      <tr key={investment.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                        <td className="py-2 px-2 text-white">{investment.plan_name}</td>
                        <td className="py-2 px-2 text-white">{formatCurrency(investment.amount)}</td>
                        <td className="py-2 px-2 text-green-400 font-semibold">{investment.returns}%</td>
                        <td className="py-2 px-2 text-white/60">{parseInt(investment.duration_months) || 0} months</td>
                        <td className="py-2 px-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            isMatured
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : investment.status === 'active' 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                              : 'bg-white/10 text-white/60 border border-white/20'
                          }`}>
                            {isMatured ? 'Matured' : investment.status}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-white/60 text-xs">{maturityDate.toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Browse Plans CTA */}
        <div className="mb-6 rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/20 via-accent/10 to-background/50 p-4 sm:p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Ready to invest?</h3>
              <p className="text-white/60 text-sm">Browse our available investment plans and start growing your wealth</p>
            </div>
            <Link 
              href="/dashboard/investment-plans" 
              className="px-4 py-2 rounded-lg bg-accent/80 text-background font-semibold hover:bg-accent transition-colors whitespace-nowrap ml-4"
            >
              Browse Plans
            </Link>
          </div>
        </div>

        {/* Activity Timeline */}
        {timeline.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-3 sm:p-4 backdrop-blur-xl mb-24">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {timeline.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div key={idx} className="flex gap-3 pb-3 border-b border-white/10 last:border-b-0">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-4 h-4 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-xs sm:text-sm">{item.title}</p>
                      <p className="text-white/60 text-xs">{item.description}</p>
                    </div>
                    <span className="text-white/60 text-xs flex-shrink-0">{item.date}</span>
                  </div>
                );
              })}
            </div>
          </div>
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

