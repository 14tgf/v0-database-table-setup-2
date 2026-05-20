'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface WithdrawalFeeModalProps {
  isOpen: boolean;
  withdrawalAmount: number;
  feePercent: number;
  onClose?: () => void;
}

export function WithdrawalFeeModal({ isOpen, withdrawalAmount, feePercent, onClose }: WithdrawalFeeModalProps) {
  const feeAmount = (withdrawalAmount * feePercent) / 100;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md"
          >
            <div className="bg-gradient-to-br from-secondary/95 via-secondary/90 to-background/95 border border-amber-400/30 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-2xl">
              {/* Icon */}
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex justify-center mb-4"
              >
                <div className="w-16 h-16 rounded-full bg-amber-400/20 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-amber-400" />
                </div>
              </motion.div>

              {/* Title */}
              <motion.h3
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl font-bold text-foreground text-center mb-2"
              >
                Withdrawal Fee Required
              </motion.h3>

              {/* Message */}
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-sm text-muted-foreground text-center mb-6"
              >
                Your withdrawal request has been submitted and is pending. To process your withdrawal, a {feePercent}% processing fee is required.
              </motion.p>

              {/* Fee Breakdown */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-background/50 border border-white/10 rounded-xl p-4 mb-6 space-y-3"
              >
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Withdrawal Amount:</span>
                  <span className="font-semibold text-foreground">${withdrawalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Processing Fee ({feePercent}%):</span>
                  <span className="font-semibold text-amber-400">${feeAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                  <span className="text-sm font-semibold text-foreground">Amount to Pay:</span>
                  <span className="text-lg font-bold text-accent">${feeAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </motion.div>

              {/* Status Indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex justify-center mb-6"
              >
                <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>Withdrawal pending fee payment</span>
                </div>
              </motion.div>

              {/* Pay Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Link
                  href={`/dashboard/withdraw/pay-fee?amount=${feeAmount}&withdrawal=${withdrawalAmount}&percent=${feePercent}`}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-accent text-background font-bold rounded-xl hover:bg-accent/90 transition-all text-sm"
                >
                  Pay Withdrawal Fee
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>

              {/* Note */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-xs text-muted-foreground text-center mt-4"
              >
                Once fee is paid, your withdrawal will be processed within 24 hours.
              </motion.p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
