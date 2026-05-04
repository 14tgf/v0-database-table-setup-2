'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { FileText, Eye, CheckCircle, X } from 'lucide-react';

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

interface KYCRequest {
  id: string;
  userName: string;
  userEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  submitDate: string;
  documents: string[];
}

export default function KYCPage() {
  const [selectedRequest, setSelectedRequest] = useState<KYCRequest | null>(null);
  const [actionNote, setActionNote] = useState('');

  const kycRequests: KYCRequest[] = [];

  const pendingRequests = kycRequests.filter(r => r.status === 'pending');

  const handleApprove = (request: KYCRequest) => {
    console.log(`[v0] KYC Approved: ${request.userName}, Note: ${actionNote}`);
    setSelectedRequest(null);
    setActionNote('');
  };

  const handleReject = (request: KYCRequest) => {
    console.log(`[v0] KYC Rejected: ${request.userName}, Note: ${actionNote}`);
    setSelectedRequest(null);
    setActionNote('');
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-400/20 text-yellow-400';
      case 'approved': return 'bg-green-400/20 text-green-400';
      case 'rejected': return 'bg-red-400/20 text-red-400';
      default: return 'bg-white/10 text-white/70';
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
        <h1 className="text-2xl font-bold text-foreground">KYC Requests</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and manage KYC verification requests</p>
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
            {tab} ({['pending', 'approved', 'rejected'].map(s => kycRequests.filter(r => r.status === s).length)[idx]})
          </button>
        ))}
      </motion.div>

      {/* Pending Requests Grid */}
      <motion.div variants={staggerItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pendingRequests.map((request) => (
          <div
            key={request.id}
            className="bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 border border-white/10 rounded-lg p-4 hover:border-accent/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-foreground">{request.userName}</h3>
                <p className="text-xs text-white/60">{request.userEmail}</p>
              </div>
              <span className="px-2 py-1 bg-yellow-400/20 text-yellow-400 rounded text-xs font-semibold">Pending</span>
            </div>

            <p className="text-xs text-white/60 mb-3">Submitted: {request.submitDate}</p>

            <div className="mb-3">
              <p className="text-xs font-semibold text-white/70 mb-2">Documents:</p>
              <div className="flex flex-wrap gap-1">
                {request.documents.map((doc) => (
                  <span key={doc} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white/70 flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {doc}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedRequest(request)}
              className="w-full px-3 py-2 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors font-semibold text-sm flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Review
            </button>
          </div>
        ))}
      </motion.div>

      {/* Review Modal */}
      {selectedRequest && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedRequest(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 border border-white/10 rounded-lg p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-foreground mb-1">Review KYC</h2>
            <p className="text-xs text-white/60 mb-4">{selectedRequest.userName}</p>

            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-2">Email</label>
                <p className="text-sm text-foreground">{selectedRequest.userEmail}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-2">Submitted Documents</label>
                <div className="space-y-1">
                  {selectedRequest.documents.map((doc) => (
                    <p key={doc} className="text-xs text-white/70 flex items-center gap-2">
                      <FileText className="w-3 h-3 text-accent" />
                      {doc}
                    </p>
                  ))}
                </div>
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
                onClick={() => handleReject(selectedRequest)}
                className="flex-1 px-4 py-2 bg-red-400/20 text-red-400 rounded-lg hover:bg-red-400/30 transition-colors font-medium text-sm flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Reject
              </button>
              <button
                onClick={() => handleApprove(selectedRequest)}
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
