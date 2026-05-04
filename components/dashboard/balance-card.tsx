'use client';

import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';
import Link from 'next/link';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import { useWallet } from '@/hooks/useWallet';

export function BalanceCard() {
  const { format } = useCurrencyFormatter();
  const { wallet, isLoading } = useWallet();
  const balanceAmount = wallet?.balance || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="col-span-1 md:col-span-2"
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-accent/20 via-white/5 to-white/[0.02] p-4 backdrop-blur-xl glow-cyan-hover">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          {/* Welcome Message */}
          <div className="mb-3">
            <h3 className="text-lg font-bold text-white">Welcome to X Holding</h3>
            <p className="text-xs text-white/60">Track your investments, manage your portfolio, and explore opportunities.</p>
          </div>

          {/* Balance Header */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-white/60 mb-0.5">Available Balance</p>
              <p className="text-2xl font-bold text-white">
                {isLoading ? '...' : format(balanceAmount)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-accent/20 border border-accent/50 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-accent" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Link href="/dashboard/deposit" className="px-3 py-1.5 bg-white/10 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-300 text-xs flex items-center justify-center gap-1">
              <span>+</span> Deposit
            </Link>
            <Link href="/dashboard/withdraw" className="px-3 py-1.5 bg-white/10 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-300 text-xs flex items-center justify-center gap-1">
              <span>−</span> Withdraw
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
