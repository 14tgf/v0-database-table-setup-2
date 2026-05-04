'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { CreditCard, CheckCircle, X } from 'lucide-react';

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

interface MembershipPayment {
  id: string;
  userName: string;
  userEmail: string;
  amount: number;
  plan: 'silver' | 'gold' | 'platinum';
  paymentMethod: string;
  status: 'pending' | 'approved' | 'rejected';
  submitDate: string;
  proofUrl: string;
}

export default function MembershipPage() {
  const [selectedPayment, setSelectedPayment] = useState<MembershipPayment | null>(null);
  const [actionNote, setActionNote] = useState('');

  const payments: MembershipPayment[] = [];

  const pendingPayments = payments.filter(p => p.status === 'pending');

  const handleApprove = (payment: MembershipPayment) => {
    console.log(`[v0] Membership Approved: ${payment.userName} (${payment.plan}), Note: ${actionNote}`);
    setSelectedPayment(null);
    setActionNote('');
  };

  const handleReject = (payment: MembershipPayment) => {
    console.log(`[v0] Membership Rejected: ${payment.userName}, Note: ${actionNote}`);
    setSelectedPayment(null);
    setActionNote('');
  };

  const getPlanColor = (plan: string) => {
    switch(plan) {
      case 'silver': return 'text-gray-400';
      case 'gold': return 'text-yellow-400';
      case 'platinum': return 'text-blue-400';
      default: return 'text-white/70';
    }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Page Title */}
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl font-bold text-foreground">Membership Payments</h1>
        <p className="text-sm text-muted-foreground mt-1">Approve or reject membership payment requests</p>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={staggerItem} className="flex gap-2 border-b border-white/10">
        {['Pending', 'Approved', 'Rejected'].map((tab, idx) => (
          <button
            key={tab}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
              idx === 0
                ? 'border-accent text-accent'
                : 'border-transparent text-white/50 hover:text-white/70'
            }`}
          >
            {tab} ({['pending', 'approved', 'rejected'].map(s => payments.filter(p => p.status === s).length)[idx]})
          </button>
        ))}
      </motion.div>

      {/* Pending Payments Grid */}
      <motion.div variants={staggerItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pendingPayments.map((payment) => (
          <div
            key={payment.id}
            className="bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 border border-white/10 rounded-lg p-4 hover:border-accent/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{payment.userName}</h3>
                <p className="text-xs text-white/60">{payment.userEmail}</p>
              </div>
              <span className="px-2 py-1 bg-yellow-400/20 text-yellow-400 rounded text-xs font-semibold">Pending</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-xs text-white/60">Amount</p>
                <p className="text-lg font-bold text-accent">${payment.amount}</p>
              </div>
              <div>
                <p className="text-xs text-white/60">Plan</p>
                <p className={`text-lg font-bold capitalize ${getPlanColor(payment.plan)}`}>
                  {payment.plan}
                </p>
              </div>
            </div>

            <div className="mb-3 p-2 bg-white/5 border border-white/10 rounded">
              <p className="text-xs text-white/70">
                <span className="font-semibold">Method:</span> {payment.paymentMethod}
              </p>
              <p className="text-xs text-white/70 mt-1">
                <span className="font-semibold">Submitted:</span> {payment.submitDate}
              </p>
            </div>

            <button
              onClick={() => setSelectedPayment(payment)}
              className="w-full px-3 py-2 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors font-semibold text-sm flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Review Payment
            </button>
          </div>
        ))}
      </motion.div>

      {/* Review Modal */}
      {selectedPayment && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPayment(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 border border-white/10 rounded-lg p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-foreground mb-1">Review Payment</h2>
            <p className="text-xs text-white/60 mb-4">{selectedPayment.userName}</p>

            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-2">Payment Details</label>
                <div className="space-y-1 p-3 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-sm text-foreground"><span className="text-white/60">Amount:</span> ${selectedPayment.amount}</p>
                  <p className="text-sm text-foreground"><span className="text-white/60">Plan:</span> <span className="capitalize font-semibold">{selectedPayment.plan}</span></p>
                  <p className="text-sm text-foreground"><span className="text-white/60">Method:</span> {selectedPayment.paymentMethod}</p>
                  <p className="text-sm text-foreground"><span className="text-white/60">Email:</span> {selectedPayment.userEmail}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-2">Proof of Payment</label>
                <p className="text-xs text-white/60">Uploaded: {selectedPayment.proofUrl}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-2">Action Note</label>
                <textarea
                  placeholder="Add notes for this action..."
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 text-sm resize-none h-20"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleReject(selectedPayment)}
                className="flex-1 px-4 py-2 bg-red-400/20 text-red-400 rounded-lg hover:bg-red-400/30 transition-colors font-medium text-sm flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Reject
              </button>
              <button
                onClick={() => handleApprove(selectedPayment)}
                className="flex-1 px-4 py-2 bg-green-400/20 text-green-400 rounded-lg hover:bg-green-400/30 transition-colors font-medium text-sm flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
