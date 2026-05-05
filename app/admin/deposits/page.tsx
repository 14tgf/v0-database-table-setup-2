'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, ChevronDown } from 'lucide-react';

interface Deposit {
  id: string;
  user_id: string;
  method_name: string;
  amount: number;
  tx_hash: string;
  proof_upload: string;
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

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    console.log('[v0] Admin deposits page mounted');
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/deposits');
      const data = await response.json();
      
      if (!response.ok) {
        const errorMsg = data.error || data.message || 'Failed to fetch deposits';
        throw new Error(errorMsg);
      }
      
      setDeposits(data.deposits || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('[v0] Fetch deposits error:', error);
      setMessage({ 
        type: 'error', 
        text: `Failed to load deposits: ${errorMessage}`
      });
      setDeposits([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (depositId: string) => {
    setActionLoading(depositId);
    try {
      const response = await fetch('/api/admin/deposits/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deposit_id: depositId,
          action: 'approve',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || data.message || 'Failed to approve deposit';
        setMessage({ 
          type: 'error', 
          text: errorMsg
        });
        return;
      }

      setMessage({ type: 'success', text: 'Deposit approved successfully' });
      
      // Update local deposits list
      const updatedDeposits = deposits.map(d => 
        d.id === depositId ? { ...d, status: 'approved' } : d
      );
      setDeposits(updatedDeposits);
      setExpandedId(null);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('[v0] Approve deposit error:', error);
      setMessage({ 
        type: 'error', 
        text: `Failed to approve deposit: ${errorMessage}`
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (depositId: string) => {
    setActionLoading(depositId);
    try {
      const response = await fetch('/api/admin/deposits/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deposit_id: depositId,
          action: 'reject',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || data.message || 'Failed to reject deposit';
        setMessage({ 
          type: 'error', 
          text: errorMsg
        });
        return;
      }

      setMessage({ type: 'success', text: 'Deposit rejected successfully' });
      
      // Update local deposits list
      const updatedDeposits = deposits.map(d => 
        d.id === depositId ? { ...d, status: 'rejected' } : d
      );
      setDeposits(updatedDeposits);
      setExpandedId(null);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('[v0] Reject deposit error:', error);
      setMessage({ 
        type: 'error', 
        text: `Failed to reject deposit: ${errorMessage}`
      });
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
        <h1 className="text-2xl font-bold text-foreground">Deposit Requests</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage and approve user deposit requests</p>
      </motion.div>

      {message && (
        <motion.div
          variants={staggerItem}
          className={`p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-400/10 border-green-400/30 text-green-300'
              : 'bg-red-400/10 border-red-400/30 text-red-300'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-white/60">Loading deposits...</p>
        </div>
      ) : deposits.length === 0 ? (
        <motion.div
          variants={staggerItem}
          className="p-6 bg-white/5 border border-white/10 rounded-lg text-center"
        >
          <p className="text-white/60">No deposit requests found</p>
        </motion.div>
      ) : (
        <motion.div variants={staggerItem} className="space-y-3">
          {deposits.map((deposit) => (
            <div
              key={deposit.id}
              className={`border rounded-lg overflow-hidden transition-all ${getStatusColor(deposit.status)}`}
            >
              <button
                onClick={() => setExpandedId(expandedId === deposit.id ? null : deposit.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4 text-left flex-1">
                  {getStatusIcon(deposit.status)}
                  <div>
                    <p className="font-semibold text-foreground">${deposit.amount.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{deposit.user_email || deposit.user_id}</p>
                  </div>
                  <div className="text-xs text-muted-foreground ml-auto">
                    <p className="capitalize font-medium">{deposit.status}</p>
                    <p>{new Date(deposit.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${expandedId === deposit.id ? 'rotate-180' : ''}`}
                />
              </button>

              {expandedId === deposit.id && (
                <div className="p-4 border-t border-white/10 bg-white/[0.02] space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground">Method</p>
                      <p className="font-medium text-foreground">{deposit.method_name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">TX Hash</p>
                      <p className="font-mono text-foreground break-all">{deposit.tx_hash || 'N/A'}</p>
                    </div>
                    {deposit.note && (
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Note</p>
                        <p className="text-foreground">{deposit.note}</p>
                      </div>
                    )}
                  </div>

                  {deposit.status === 'pending' && (
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleApprove(deposit.id)}
                        disabled={actionLoading === deposit.id}
                        className="flex-1 px-3 py-2 bg-green-400/20 text-green-400 border border-green-400/50 rounded hover:bg-green-400/30 disabled:opacity-50 transition-colors text-sm font-medium"
                      >
                        {actionLoading === deposit.id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(deposit.id)}
                        disabled={actionLoading === deposit.id}
                        className="flex-1 px-3 py-2 bg-red-400/20 text-red-400 border border-red-400/50 rounded hover:bg-red-400/30 disabled:opacity-50 transition-colors text-sm font-medium"
                      >
                        {actionLoading === deposit.id ? 'Processing...' : 'Reject'}
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
