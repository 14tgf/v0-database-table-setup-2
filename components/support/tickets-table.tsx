'use client';

import { motion } from 'framer-motion';
import { Eye, MessageSquare, X as XIcon } from 'lucide-react';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { SAMPLE_TICKETS, TICKET_STATUSES } from '@/lib/support';

export function TicketsTable() {
  const getStatusColor = (status: string) => {
    const statusObj = TICKET_STATUSES.find(s => s.label === status);
    return statusObj?.color || 'text-gray-400';
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 border border-white/10 rounded-lg p-4 backdrop-blur-sm overflow-x-auto"
    >
      <motion.h2 variants={staggerItem} className="text-base font-bold text-foreground mb-3">
        My Support Tickets
      </motion.h2>

      <motion.div variants={staggerItem} className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-2 py-2 font-semibold text-muted-foreground">Ticket ID</th>
              <th className="text-left px-2 py-2 font-semibold text-muted-foreground">Subject</th>
              <th className="text-left px-2 py-2 font-semibold text-muted-foreground hidden md:table-cell">Category</th>
              <th className="text-left px-2 py-2 font-semibold text-muted-foreground hidden sm:table-cell">Priority</th>
              <th className="text-left px-2 py-2 font-semibold text-muted-foreground">Status</th>
              <th className="text-left px-2 py-2 font-semibold text-muted-foreground hidden md:table-cell">Last Updated</th>
              <th className="text-left px-2 py-2 font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {SAMPLE_TICKETS.map((ticket, idx) => (
              <tr key={ticket.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                <td className="px-2 py-2 text-foreground font-semibold">{ticket.id}</td>
                <td className="px-2 py-2 text-foreground max-w-xs truncate">{ticket.subject}</td>
                <td className="px-2 py-2 text-muted-foreground hidden md:table-cell">{ticket.category}</td>
                <td className="px-2 py-2 hidden sm:table-cell">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    ticket.priority === 'Urgent' ? 'bg-red-500/20 text-red-400' :
                    ticket.priority === 'High' ? 'bg-orange-500/20 text-orange-400' :
                    ticket.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-2 py-2">
                  <span className={`text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="px-2 py-2 text-muted-foreground hidden md:table-cell">{ticket.lastUpdated}</td>
                <td className="px-2 py-2">
                  <div className="flex items-center gap-1">
                    <button className="p-1 hover:bg-white/10 rounded transition-colors">
                      <Eye className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                    </button>
                    <button className="p-1 hover:bg-white/10 rounded transition-colors">
                      <MessageSquare className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {SAMPLE_TICKETS.length === 0 && (
        <motion.div variants={staggerItem} className="text-center py-6">
          <p className="text-xs text-muted-foreground">No tickets found. Create one to get started.</p>
        </motion.div>
      )}
    </motion.div>
  );
}
