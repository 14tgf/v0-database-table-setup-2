'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FileText, Eye, CheckCircle, X, ChevronDown } from 'lucide-react';

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

interface KYCSubmission {
  id: string;
  user_id: string;
  full_name: string;
  id_type: string;
  id_number: string;
  id_front_image?: string;
  id_back_image?: string;
  selfie_image?: string;
  address_document?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  submitted_at: string;
  reviewed_at?: string;
  user_email?: string;
}

export default function KYCPage() {
  const [kycSubmissions, setKycSubmissions] = useState<KYCSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [rejectionNote, setRejectionNote] = useState('');

  useEffect(() => {
    console.log('[v0] Admin KYC page mounted');
    fetchKYCSubmissions();
  }, []);

  const fetchKYCSubmissions = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/kyc');
      const data = await response.json();
      
      if (!response.ok) {
        const errorMsg = data.error || data.message || 'Failed to fetch KYC submissions';
        throw new Error(errorMsg);
      }
      
      setKycSubmissions(data.kyc_submissions || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('[v0] Fetch KYC submissions error:', error);
      setMessage({ 
        type: 'error', 
        text: `Failed to load KYC submissions: ${errorMessage}`
      });
      setKycSubmissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (submissionId: string) => {
    setActionLoading(submissionId);
    try {
      const response = await fetch('/api/admin/kyc/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kyc_id: submissionId,
          action: 'approve',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || data.message || 'Failed to approve KYC';
        setMessage({ 
          type: 'error', 
          text: errorMsg
        });
        return;
      }

      setMessage({ type: 'success', text: 'KYC submission approved successfully' });
      
      // Update local list
      const updatedSubmissions = kycSubmissions.map(s => 
        s.id === submissionId ? { ...s, status: 'approved' } : s
      );
      setKycSubmissions(updatedSubmissions);
      setExpandedId(null);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('[v0] Approve KYC error:', error);
      setMessage({ 
        type: 'error', 
        text: `Failed to approve KYC: ${errorMessage}`
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (submissionId: string) => {
    setActionLoading(submissionId);
    try {
      const response = await fetch('/api/admin/kyc/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kyc_id: submissionId,
          action: 'reject',
          rejection_reason: rejectionNote || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || data.message || 'Failed to reject KYC';
        setMessage({ 
          type: 'error', 
          text: errorMsg
        });
        return;
      }

      setMessage({ type: 'success', text: 'KYC submission rejected successfully' });
      
      // Update local list
      const updatedSubmissions = kycSubmissions.map(s => 
        s.id === submissionId ? { ...s, status: 'rejected' } : s
      );
      setKycSubmissions(updatedSubmissions);
      setExpandedId(null);
      setRejectionNote('');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('[v0] Reject KYC error:', error);
      setMessage({ 
        type: 'error', 
        text: `Failed to reject KYC: ${errorMessage}`
      });
    } finally {
      setActionLoading(null);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'rejected':
        return <X className="w-5 h-5 text-red-400" />;
      case 'pending':
        return <FileText className="w-5 h-5 text-yellow-400" />;
      default:
        return null;
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
        <h1 className="text-2xl font-bold text-foreground">KYC Submissions</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and manage KYC verification requests</p>
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
          <p className="text-white/60">Loading KYC submissions...</p>
        </div>
      ) : kycSubmissions.length === 0 ? (
        <motion.div
          variants={staggerItem}
          className="p-6 bg-white/5 border border-white/10 rounded-lg text-center"
        >
          <p className="text-white/60">No pending KYC submissions</p>
        </motion.div>
      ) : (
        <motion.div variants={staggerItem} className="space-y-3">
          {kycSubmissions.map((submission) => (
            <div
              key={submission.id}
              className={`border rounded-lg overflow-hidden transition-all ${getStatusColor(submission.status)}`}
            >
              <button
                onClick={() => setExpandedId(expandedId === submission.id ? null : submission.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4 text-left flex-1">
                  {getStatusIcon(submission.status)}
                  <div>
                    <p className="font-semibold text-foreground">{submission.full_name}</p>
                    <p className="text-xs text-muted-foreground">{submission.user_email || submission.user_id}</p>
                  </div>
                  <div className="text-xs text-muted-foreground ml-auto">
                    <p className="capitalize font-medium">{submission.status}</p>
                    <p>{new Date(submission.submitted_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${expandedId === submission.id ? 'rotate-180' : ''}`}
                />
              </button>

              {expandedId === submission.id && (
                <div className="p-4 border-t border-white/10 bg-white/[0.02] space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground">Full Name</p>
                      <p className="font-medium text-foreground">{submission.full_name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">ID Type</p>
                      <p className="font-medium text-foreground">{submission.id_type}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">ID Number</p>
                      <p className="font-mono text-foreground">{submission.id_number}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium text-foreground">{submission.user_email}</p>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-3 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">Uploaded Documents:</p>
                    <div className="flex flex-wrap gap-1">
                      {submission.id_front_image && (
                        <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white/70 flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          ID Front
                        </span>
                      )}
                      {submission.id_back_image && (
                        <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white/70 flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          ID Back
                        </span>
                      )}
                      {submission.selfie_image && (
                        <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white/70 flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          Selfie
                        </span>
                      )}
                      {submission.address_document && (
                        <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white/70 flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          Address
                        </span>
                      )}
                    </div>
                  </div>

                  {submission.status === 'pending' && (
                    <div className="border-t border-white/10 pt-3 space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-white/70 mb-2">Rejection Reason (if applicable)</label>
                        <textarea
                          placeholder="Optional reason for rejection..."
                          value={rejectionNote}
                          onChange={(e) => setRejectionNote(e.target.value)}
                          className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 text-sm resize-none h-16"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReject(submission.id)}
                          disabled={actionLoading === submission.id}
                          className="flex-1 px-3 py-2 bg-red-400/20 text-red-400 border border-red-400/50 rounded hover:bg-red-400/30 disabled:opacity-50 transition-colors text-sm font-medium"
                        >
                          {actionLoading === submission.id ? 'Processing...' : 'Reject'}
                        </button>
                        <button
                          onClick={() => handleApprove(submission.id)}
                          disabled={actionLoading === submission.id}
                          className="flex-1 px-3 py-2 bg-green-400/20 text-green-400 border border-green-400/50 rounded hover:bg-green-400/30 disabled:opacity-50 transition-colors text-sm font-medium"
                        >
                          {actionLoading === submission.id ? 'Processing...' : 'Approve'}
                        </button>
                      </div>
                    </div>
                  )}

                  {submission.status === 'rejected' && submission.rejection_reason && (
                    <div className="border-t border-white/10 pt-3">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Rejection Reason:</p>
                      <p className="text-sm text-red-300">{submission.rejection_reason}</p>
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
