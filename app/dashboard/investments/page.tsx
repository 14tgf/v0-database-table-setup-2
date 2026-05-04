'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bell, Sun, TrendingUp, TrendingDown, Zap, DollarSign, Calendar, Eye, RefreshCw, Download, Activity, ArrowUpRight, ArrowDownLeft, Clock, ArrowUp, BarChart2, RefreshCcw, Send } from 'lucide-react';
import { SidebarMenu } from '@/components/dashboard/sidebar-menu';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';

const investmentData: any[] = [];

const activePlans: any[] = [];

const timeline: any[] = [];

export default function InvestmentsDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-gradient-to-r from-background/95 via-background/85 to-background/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-3 py-3 sm:px-4 flex items-center justify-between">
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
            <p className="text-lg sm:text-2xl font-bold text-white mb-1">$25,700</p>
            <p className="text-green-400 text-xs flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +4 investments
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-3 sm:p-4 backdrop-blur-xl glow-cyan-hover">
            <p className="text-white/70 text-xs mb-1">Active Investments</p>
            <p className="text-lg sm:text-2xl font-bold text-white mb-1">3</p>
            <p className="text-white/60 text-xs">Growing your wealth</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-3 sm:p-4 backdrop-blur-xl glow-cyan-hover">
            <p className="text-white/70 text-xs mb-1">Total Returns</p>
            <p className="text-lg sm:text-2xl font-bold text-white mb-1">$2,580.90</p>
            <p className="text-green-400 text-xs">+10.03% ROI</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-3 sm:p-4 backdrop-blur-xl glow-cyan-hover">
            <p className="text-white/70 text-xs mb-1">Available Profit</p>
            <p className="text-lg sm:text-2xl font-bold text-white mb-1">$1,850.90</p>
            <p className="text-white/60 text-xs">Claimable earnings</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-3 sm:p-4 backdrop-blur-xl glow-cyan-hover">
            <p className="text-white/70 text-xs mb-1">ROI Average</p>
            <p className="text-lg sm:text-2xl font-bold text-white mb-1">9.18%</p>
            <p className="text-green-400 text-xs">Across all plans</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-3 sm:p-4 backdrop-blur-xl glow-cyan-hover">
            <p className="text-white/70 text-xs mb-1">Referral Earnings</p>
            <p className="text-lg sm:text-2xl font-bold text-white mb-1">$230</p>
            <p className="text-white/60 text-xs">12 referrals</p>
          </div>
        </div>

        {/* Investment Table */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-3 sm:p-4 backdrop-blur-xl overflow-hidden">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Investment Portfolio</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 px-2 text-white/70 font-medium">Plan</th>
                  <th className="text-left py-2 px-2 text-white/70 font-medium">Amount</th>
                  <th className="text-left py-2 px-2 text-white/70 font-medium">Duration</th>
                  <th className="text-left py-2 px-2 text-white/70 font-medium">ROI</th>
                  <th className="text-left py-2 px-2 text-white/70 font-medium">Profit</th>
                  <th className="text-left py-2 px-2 text-white/70 font-medium">Status</th>
                  <th className="text-center py-2 px-2 text-white/70 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {investmentData.map((investment) => (
                  <tr key={investment.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="py-2 px-2 text-white">{investment.plan}</td>
                    <td className="py-2 px-2 text-white">{investment.amount}</td>
                    <td className="py-2 px-2 text-white">{investment.duration}</td>
                    <td className="py-2 px-2 text-green-400 font-semibold">{investment.roi}</td>
                    <td className="py-2 px-2 text-white">{investment.profit}</td>
                    <td className="py-2 px-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        investment.status === 'Active' 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-white/10 text-white/60 border border-white/20'
                      }`}>
                        {investment.status}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button className="text-primary hover:text-primary/80 transition-colors text-xs">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Plans Cards */}
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-3">Active Investment Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {activePlans.map((plan, idx) => (
              <div key={idx} className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-3 sm:p-4 backdrop-blur-xl glow-cyan-hover">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">{plan.name}</h3>
                    <p className="text-white/60 text-xs">{plan.status}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    plan.status === 'Active' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-white/10 text-white/60'
                  }`}>
                    {plan.roi}
                  </span>
                </div>
                <div className="bg-white/5 rounded-lg p-2 mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white/60 text-xs">Portfolio Allocation</span>
                    <span className="text-primary font-semibold text-xs">{plan.allocation}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div 
                      className="bg-primary rounded-full h-1.5 transition-all"
                      style={{ width: plan.allocation }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-3 sm:p-4 backdrop-blur-xl mb-24">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Activity Timeline</h2>
          <div className="space-y-3">
            {timeline.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <div key={idx} className="flex gap-3 pb-3 border-b border-white/10 last:border-b-0">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-4 h-4 text-primary" />
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
