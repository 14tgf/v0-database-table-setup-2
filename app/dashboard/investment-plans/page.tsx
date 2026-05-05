'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Zap, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { SidebarMenu } from '@/components/dashboard/sidebar-menu';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';
import { useInvestments } from '@/hooks/useInvestments';
import { useWallet } from '@/hooks/useWallet';

export default function InvestmentPlansPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [isInvesting, setIsInvesting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const { plans, plansLoading, createInvestment } = useInvestments();
  const { wallet } = useWallet();

  const walletBalance = wallet?.balance || 0;
  const amount = parseFloat(investmentAmount) || 0;
  const isValidAmount = selectedPlan && amount >= parseFloat(selectedPlan.minimum_amount) && (selectedPlan.maximum_amount === null || amount <= parseFloat(selectedPlan.maximum_amount));
  const hasInsufficientFunds = amount > walletBalance && amount > 0;

  const handleInvest = async () => {
    if (!selectedPlan || !investmentAmount) {
      setMessage({ type: 'error', text: 'Please select a plan and enter an amount' });
      return;
    }

    if (amount < parseFloat(selectedPlan.minimum_amount)) {
      setMessage({ type: 'error', text: `Minimum investment is $${selectedPlan.minimum_amount}` });
      return;
    }

    if (selectedPlan.maximum_amount && amount > parseFloat(selectedPlan.maximum_amount)) {
      setMessage({ type: 'error', text: `Maximum investment is $${selectedPlan.maximum_amount}` });
      return;
    }

    if (hasInsufficientFunds) {
      setMessage({ type: 'error', text: `Insufficient balance. Need $${amount.toFixed(2)}, have $${walletBalance.toFixed(2)}` });
      return;
    }

    setIsInvesting(true);
    setMessage(null);

    try {
      await createInvestment(selectedPlan.id, amount);
      setMessage({ type: 'success', text: `Successfully invested $${amount.toFixed(2)} in ${selectedPlan.name}!` });
      setInvestmentAmount('');
      setSelectedPlan(null);
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Investment failed';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsInvesting(false);
    }
  };

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
            <Link href="/dashboard/investment-plans" className="px-3 py-1.5 rounded-lg text-sm text-white font-semibold bg-accent/20 border border-accent/50 whitespace-nowrap">Plans</Link>
            <Link href="/dashboard/investments" className="px-3 py-1.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap">My Investments</Link>
            <Link href="/market" className="px-3 py-1.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap">Stocks</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 py-4 sm:px-4 lg:px-6">
        {/* Page Header */}
        <div className="mb-8">
          <Link href="/dashboard/investments" className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors text-sm font-semibold mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Investment Plans</h1>
          <p className="text-white/70 text-sm">Choose a plan and start growing your wealth</p>
        </div>

        {/* Your Balance */}
        <div className="mb-6 rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/20 via-accent/10 to-background/50 p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Available Balance</p>
              <p className="text-2xl font-bold text-white">${walletBalance.toFixed(2)}</p>
            </div>
            <DollarSign className="w-12 h-12 text-accent/40" />
          </div>
        </div>

        {/* Plans Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Available Plans</h2>
          {plansLoading ? (
            <p className="text-white/60">Loading plans...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((plan: any) => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`rounded-2xl border transition-all cursor-pointer p-4 backdrop-blur-xl ${
                    selectedPlan?.id === plan.id
                      ? 'border-accent bg-accent/10'
                      : 'border-white/10 bg-secondary/20 hover:border-accent/50'
                  }`}
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                    <p className="text-white/60 text-sm">{plan.description}</p>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-white">
                        <span className="font-bold text-lg text-green-400">{plan.roi_percent}%</span>
                        <span className="text-white/60 ml-1">ROI</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-accent" />
                      <span className="text-white">
                        <span className="font-bold">{plan.duration_days}</span>
                        <span className="text-white/60 ml-1">days</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <DollarSign className="w-4 h-4 text-blue-400" />
                      <span className="text-white text-sm">
                        ${parseFloat(plan.minimum_amount).toFixed(2)} - {plan.maximum_amount ? `$${parseFloat(plan.maximum_amount).toFixed(2)}` : 'Unlimited'}
                      </span>
                    </div>
                  </div>

                  <div className={`px-3 py-2 rounded-lg text-center text-sm font-semibold transition-colors ${
                    selectedPlan?.id === plan.id
                      ? 'bg-accent/80 text-background'
                      : 'bg-white/10 text-white'
                  }`}>
                    {selectedPlan?.id === plan.id ? '✓ Selected' : 'Select Plan'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Investment Form */}
        {selectedPlan && (
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-6 backdrop-blur-xl mb-24">
            <h3 className="text-xl font-bold text-white mb-4">Invest in {selectedPlan.name}</h3>

            <div className="space-y-4">
              {/* Amount Input */}
              <div>
                <label className="block text-white/70 text-sm font-semibold mb-2">
                  Investment Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-white/60">$</span>
                  <input
                    type="number"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                    placeholder={`Min: $${parseFloat(selectedPlan.minimum_amount).toFixed(2)}`}
                    className="w-full pl-6 pr-4 py-2 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-accent"
                  />
                </div>
                <p className="text-white/60 text-xs mt-2">
                  Min: ${parseFloat(selectedPlan.minimum_amount).toFixed(2)} {selectedPlan.maximum_amount && `• Max: $${parseFloat(selectedPlan.maximum_amount).toFixed(2)}`}
                </p>
              </div>

              {/* Investment Summary */}
              {amount > 0 && (
                <div className="bg-white/5 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Investment Amount:</span>
                    <span className="text-white font-semibold">${amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Expected ROI:</span>
                    <span className="text-green-400 font-semibold">${(amount * parseFloat(selectedPlan.roi_percent) / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Duration:</span>
                    <span className="text-white font-semibold">{selectedPlan.duration_days} days</span>
                  </div>
                  <div className="border-t border-white/10 pt-2 flex justify-between text-sm">
                    <span className="text-white/70">Total Return:</span>
                    <span className="text-white font-bold">${(amount * (1 + parseFloat(selectedPlan.roi_percent) / 100)).toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Message */}
              {message && (
                <div className={`p-3 rounded-lg text-sm font-semibold ${
                  message.type === 'success'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {message.text}
                </div>
              )}

              {/* Invest Button */}
              <button
                onClick={handleInvest}
                disabled={isInvesting || !isValidAmount || hasInsufficientFunds}
                className={`w-full py-2 px-4 rounded-lg font-semibold transition-all ${
                  hasInsufficientFunds
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30 cursor-not-allowed'
                    : isValidAmount
                    ? 'bg-accent/80 text-background hover:bg-accent'
                    : 'bg-white/10 text-white/60 cursor-not-allowed'
                }`}
              >
                {isInvesting ? 'Processing...' : hasInsufficientFunds ? 'Insufficient Balance' : !isValidAmount ? 'Enter Valid Amount' : `Invest $${amount.toFixed(2)}`}
              </button>
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
