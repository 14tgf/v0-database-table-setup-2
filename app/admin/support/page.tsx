'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface SupportTicket {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  latest_message: string;
  created_at: string;
  updated_at: string;
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

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    console.log('[v0] Admin support page mounted');
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/support/tickets');
      const data = await response.json();
      
      if (!response.ok) {
        const errorMsg = data.error || data.message || 'Failed to fetch tickets';
        throw new Error(errorMsg);
      }
      
      setTickets(data.tickets || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('[v0] Fetch tickets error:', error);
      setMessage({ 
        type: 'error', 
        text: `Failed to load tickets: ${errorMessage}`
      });
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    setActionLoading(ticketId);
    try {
      const response = await fetch('/api/admin/support/tickets/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_id: ticketId,
          action: 'update_status',
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || data.message || 'Failed to update ticket';
        setMessage({ 
          type: 'error', 
          text: errorMsg
        });
        return;
      }

      setMessage({ 
        type: 'success', 
        text: 'Ticket status updated'
      });
      
      fetchTickets();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      console.error('[v0] Error updating ticket:', error);
      setMessage({ 
        type: 'error', 
        text: errorMessage
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'text-blue-400';
      case 'pending':
        return 'text-yellow-400';
      case 'resolved':
        return 'text-green-400';
      case 'closed':
        return 'text-gray-400';
      default:
        return 'text-white/60';
    }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-background p-6"
    >
      <motion.h1 variants={staggerItem} className="text-3xl font-bold text-foreground mb-1">
        Support Tickets
      </motion.h1>
      <motion.p variants={staggerItem} className="text-muted-foreground mb-6">
        Manage user support tickets and respond to inquiries
      </motion.p>

      {message && (
        <motion.div
          variants={staggerItem}
          className={`p-4 rounded-lg mb-6 ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/30'
              : 'bg-red-500/10 border border-red-500/30'
          }`}
        >
          <p className={`text-sm font-semibold ${
            message.type === 'success' ? 'text-green-400' : 'text-red-400'
          }`}>
            {message.text}
          </p>
        </motion.div>
      )}

      {isLoading ? (
        <motion.div variants={staggerItem} className="text-center py-12">
          <p className="text-muted-foreground">Loading tickets...</p>
        </motion.div>
      ) : (
        <motion.div variants={staggerContainer} className="space-y-3">
          {tickets.length > 0 ? (
            tickets.map((ticket) => (
              <motion.div
                key={ticket.id}
                variants={staggerItem}
                className="bg-secondary/50 border border-white/10 rounded-lg p-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Ticket ID</p>
                    <p className="text-sm font-mono text-accent">{ticket.id.slice(0, 8)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">User</p>
                    <p className="text-sm font-semibold text-foreground">{ticket.user_name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">{ticket.user_email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Category</p>
                    <p className="text-sm text-foreground">{ticket.category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Priority</p>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold inline-block ${
                      ticket.priority === 'Urgent' ? 'bg-red-500/20 text-red-400' :
                      ticket.priority === 'High' ? 'bg-orange-500/20 text-orange-400' :
                      ticket.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {ticket.priority}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Status</p>
                    <p className={`text-sm font-semibold capitalize ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </p>
                  </div>
                </div>

                <div className="mb-3 pb-3 border-b border-white/10">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Subject</p>
                  <p className="text-sm text-foreground">{ticket.subject}</p>
                  {ticket.latest_message && (
                    <>
                      <p className="text-xs font-semibold text-muted-foreground mt-2 mb-1">Latest Message</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{ticket.latest_message}</p>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Created: {new Date(ticket.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    <select
                      value={ticket.status}
                      onChange={(e) => handleUpdateStatus(ticket.id, e.target.value)}
                      disabled={actionLoading === ticket.id}
                      className="px-2 py-1 bg-input border border-border rounded text-xs text-foreground focus:outline-none disabled:opacity-50"
                    >
                      <option value="open">Open</option>
                      <option value="pending">Pending</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                    <button
                      onClick={() => setExpandedId(expandedId === ticket.id ? null : ticket.id)}
                      className="px-3 py-1 bg-accent text-background font-semibold rounded text-xs hover:bg-accent/90 transition-colors"
                    >
                      {expandedId === ticket.id ? 'Hide' : 'View'}
                    </button>
                  </div>
                </div>

                {expandedId === ticket.id && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Ticket Details</p>
                    <div className="p-2 bg-background/50 rounded text-xs text-foreground">
                      <p><strong>ID:</strong> {ticket.id}</p>
                      <p><strong>User:</strong> {ticket.user_name} ({ticket.user_email})</p>
                      <p><strong>Category:</strong> {ticket.category}</p>
                      <p><strong>Priority:</strong> {ticket.priority}</p>
                      <p><strong>Status:</strong> {ticket.status}</p>
                      <p><strong>Created:</strong> {new Date(ticket.created_at).toLocaleString()}</p>
                      <p><strong>Updated:</strong> {new Date(ticket.updated_at).toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <motion.div variants={staggerItem} className="text-center py-12">
              <p className="text-muted-foreground">No support tickets found.</p>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
