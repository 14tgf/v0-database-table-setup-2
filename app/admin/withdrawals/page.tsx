'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, ChevronDown } from 'lucide-react';

interface Withdrawal {
  id: string;
  user_id: string;
  method_name: string;
  amount: number;
  destination_address: string;
  destination_bank_details: string;
  note: string;
  status: string;
  created_at: string;
  user_email?: string;
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[v0] Admin withdrawals page mounted');
    loadWithdrawals();
  }, []);

  const loadWithdrawals = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/withdrawals');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch withdrawals');
      }
      
      setWithdrawals(data.withdrawals || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      console.error('[v0] Fetch withdrawals error:', err);
      setError(errorMessage);
      setWithdrawals([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (withdrawalId: string) => {
    try {
      setActionLoading(withdrawalId);
      const response = await fetch('/api/admin/withdrawals/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withdrawal_id: withdrawalId, action: 'approve' }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        alert(data.error || 'Failed to approve withdrawal');
        return;
      }

      console.log('[v0] Withdrawal approved:', data);
      await loadWithdrawals();
    } catch (error) {
      console.error('[v0] Error approving withdrawal:', error);
      alert(error instanceof Error ? error.message : 'Failed to approve withdrawal');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (withdrawalId: string) => {
    try {
      setActionLoading(withdrawalId);
      const response = await fetch('/api/admin/withdrawals/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withdrawal_id: withdrawalId, action: 'reject' }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        alert(data.error || 'Failed to reject withdrawal');
        return;
      }

      console.log('[v0] Withdrawal rejected:', data);
      await loadWithdrawals();
    } catch (error) {
      console.error('[v0] Error rejecting withdrawal:', error);
      alert(error instanceof Error ? error.message : 'Failed to reject withdrawal');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-400/10 border-green-400/30';
      case 'rejected':
        return 'bg-red-400/10 border-red-400/30';
      case 'pending':
        return 'bg-yellow-400/10 border-yellow-400/30';
      default:
        return 'bg-white/5 border-white/10';
    }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4 max-w-6xl"
    >
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl font-bold text-foreground">Withdrawal Requests</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage and approve user withdrawal requests</p>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-white/60">Loading withdrawals...</p>
        </div>
      ) : error ? (
        <motion.div
          variants={staggerItem}
          className="p-6 bg-red-400/10 border border-red-400/50 rounded-lg"
        >
          <p className="text-red-400 font-medium">Error loading withdrawals:</p>
          <p className="text-red-400/80 text-sm mt-1">{error}</p>
          <button
            onClick={() => loadWithdrawals()}
            className="mt-4 px-4 py-2 bg-red-400/20 text-red-400 border border-red-400/50 rounded hover:bg-red-400/30 transition-colors text-sm font-medium"
          >
            Try Again
          </button>
        </motion.div>
      ) : withdrawals.length === 0 ? (
        <motion.div
          variants={staggerItem}
          className="p-6 bg-white/5 border border-white/10 rounded-lg text-center"
        >
          <p className="text-white/60">No withdrawal requests found</p>
        </motion.div>
      ) : (
        <motion.div variants={staggerItem} className="space-y-3">
          {withdrawals.map((withdrawal) => (
            <div
              key={withdrawal.id}
              className={`border rounded-lg overflow-hidden transition-all ${getStatusColor(withdrawal.status)}`}
            >
              <button
                onClick={() => setExpandedId(expandedId === withdrawal.id ? null : withdrawal.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4 text-left flex-1">
                  {getStatusIcon(withdrawal.status)}
                  <div>
                    <p className="font-semibold text-foreground">${withdrawal.amount.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{withdrawal.user_email || withdrawal.user_id}</p>
                  </div>
                  <div className="text-xs text-muted-foreground ml-auto">
                    <p className="capitalize font-medium">{withdrawal.status}</p>
                    <p>{new Date(withdrawal.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${expandedId === withdrawal.id ? 'rotate-180' : ''}`}
                />
              </button>

              {expandedId === withdrawal.id && (
                <div className="p-4 border-t border-white/10 bg-white/[0.02] space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground">Method</p>
                      <p className="font-medium text-foreground">{withdrawal.method_name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Destination</p>
                      <p className="font-mono text-foreground break-all">
                        {withdrawal.destination_address || withdrawal.destination_bank_details || 'N/A'}
                      </p>
                    </div>
                    {withdrawal.note && (
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Note</p>
                        <p className="text-foreground">{withdrawal.note}</p>
                      </div>
                    )}
                  </div>

                  {withdrawal.status === 'pending' && (
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleApprove(withdrawal.id)}
                        disabled={actionLoading === withdrawal.id}
                        className="flex-1 px-3 py-2 bg-green-400/20 text-green-400 border border-green-400/50 rounded hover:bg-green-400/30 disabled:opacity-50 transition-colors text-sm font-medium"
                      >
                        {actionLoading === withdrawal.id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(withdrawal.id)}
                        disabled={actionLoading === withdrawal.id}
                        className="flex-1 px-3 py-2 bg-red-400/20 text-red-400 border border-red-400/50 rounded hover:bg-red-400/30 disabled:opacity-50 transition-colors text-sm font-medium"
                      >
                        {actionLoading === withdrawal.id ? 'Processing...' : 'Reject'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
