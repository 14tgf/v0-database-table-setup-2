'use client';

import { useState } from 'react';
import { SupportTicket } from '@/lib/support';

export function useSupport() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createTicket = async (data: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'lastUpdated'>) => {
    setIsSubmitting(true);
    try {
      const newTicket: SupportTicket = {
        ...data,
        id: `TKT${String(tickets.length + 1).padStart(3, '0')}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastUpdated: 'just now',
      };
      setTickets([newTicket, ...tickets]);
      return newTicket;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    tickets,
    isSubmitting,
    createTicket,
  };
}
