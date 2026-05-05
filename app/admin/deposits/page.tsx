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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDeposits();
  }, []);

  const loadDeposits = async () => {
    try {
      console.log('[v0] ADMIN - Loading deposits');
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/deposits', {
        credentials: 'include',
      });
      
      console.log('[v0] ADMIN - Deposits API response status:', response.status);
      
      if (!response.ok) {
        let errorMsg = `API Error (${response.status})`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorData.message || errorMsg;
        } catch (e) {
          // Response wasn't JSON
        }
        console.error('[v0] ADMIN - Deposits API error:', errorMsg);
        setError(errorMsg);
        setDeposits([]);
        return;
      }
      
      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.error('[v0] ADMIN - Failed to parse API response:', e);
        setError('Failed to parse API response');
        setDeposits([]);
        return;
      }
      
      console.log('[v0] ADMIN - Deposits received:', data.deposits?.length || 0);
      console.log('[v0] ADMIN - Full API response:', data);
      
      if (!data.deposits || data.deposits.length === 0) {
        console.log('[v0] ADMIN - No deposits in response');
        setError(null);
        setDeposits([]);
        return;
      }
      
      // Convert amounts to numbers
      const formattedDeposits = (data.deposits || []).map((deposit: any) => ({
        ...deposit,
        amount: typeof deposit.amount === 'string' ? parseFloat(deposit.amount) : deposit.amount,
      }));
      
      setDeposits(formattedDeposits);
      setError(null);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('[v0] ADMIN - Error loading deposits:', errorMsg);
      setError(`Failed to load deposits: ${errorMsg}`);
      setDeposits([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (depositId: string) => {
    try {
      console.log('[v0] ADMIN - Approve button clicked for deposit:', depositId);
      setActionLoading(depositId);
      
      console.log('[v0] ADMIN - Sending approve request to API');
      const response = await fetch('/api/admin/deposits/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ deposit_id: depositId, action: 'approve' }),
      });

      console.log('[v0] ADMIN - API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[v0] ADMIN - API error:', errorData);
        throw new Error(errorData.error || 'Failed to approve deposit');
      }

      const data = await response.json();
      console.log('[v0] ADMIN - Approve successful:', data);
      await loadDeposits();
    } catch (error) {
      console.error('[v0] ADMIN - Error approving deposit:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (depositId: string) => {
    try {
      console.log('[v0] ADMIN - Reject button clicked for deposit:', depositId);
      setActionLoading(depositId);
      
      console.log('[v0] ADMIN - Sending reject request to API');
      const response = await fetch('/api/admin/deposits/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ deposit_id: depositId, action: 'reject' }),
      });

      console.log('[v0] ADMIN - API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[v0] ADMIN - API error:', errorData);
        throw new Error(errorData.error || 'Failed to reject deposit');
      }

      const data = await response.json();
      console.log('[v0] ADMIN - Reject successful:', data);
      await loadDeposits();
    } catch (error) {
      console.error('[v0] ADMIN - Error rejecting deposit:', error);
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

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-white/60">Loading deposits...</p>
        </div>
      ) : error ? (
        <motion.div
          variants={staggerItem}
          className="p-6 bg-red-400/10 border border-red-400/50 rounded-lg"
        >
          <p className="text-red-400 font-medium">Error loading deposits:</p>
          <p className="text-red-300 text-sm mt-2">{error}</p>
          <button
            onClick={() => loadDeposits()}
            className="mt-4 px-4 py-2 bg-red-400/20 text-red-400 border border-red-400/50 rounded hover:bg-red-400/30 transition-colors text-sm font-medium"
          >
            Try Again
          </button>
        </motion.div>
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
