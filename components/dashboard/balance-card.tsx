'use client';

import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';

export function BalanceCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="col-span-1 md:col-span-2"
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-accent/20 via-white/5 to-white/[0.02] p-6 backdrop-blur-xl glow-cyan-hover">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-white/60 mb-1">Available Balance</p>
              <p className="text-4xl font-bold text-white">$0.00</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-accent/20 border border-accent/50 flex items-center justify-center">
              <Wallet className="w-7 h-7 text-accent" />
            </div>
          </div>

          {/* Description */}
          <p className="text-white/60 text-sm mb-6">Track your investments, manage your portfolio, and explore opportunities.</p>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button className="px-4 py-2 bg-white/10 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-300 text-sm flex items-center justify-center gap-2">
              <span>+</span> Deposit
            </button>
            <button className="px-4 py-2 bg-white/10 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-300 text-sm flex items-center justify-center gap-2">
              <span>−</span> Withdraw
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
