'use client';

import { motion } from 'framer-motion';
import { MessageSquare, Clock, CheckCircle } from 'lucide-react';
import { staggerItem } from '@/lib/animations';

export function SupportHero() {
  return (
    <motion.div
      variants={staggerItem}
      className="bg-gradient-to-br from-accent/20 via-accent/10 to-background/50 border border-accent/30 rounded-lg p-4 backdrop-blur-sm mb-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Greeting and Status */}
        <motion.div className="md:col-span-2">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-accent/20 border border-accent/30">
              <MessageSquare className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground mb-1">Welcome to Support Center</h2>
              <p className="text-xs text-muted-foreground mb-3">We&apos;re here to help. Average response time is 2-4 hours.</p>
              
              {/* Status Indicator */}
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-green-400 font-semibold">Support Team Online</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div className="flex flex-col gap-1.5">
          <div className="p-2 bg-white/5 border border-white/10 rounded-lg">
            <p className="text-xs text-muted-foreground">Response Time</p>
            <p className="text-sm font-bold text-foreground">2-4 hours</p>
          </div>
          <div className="p-2 bg-white/5 border border-white/10 rounded-lg">
            <p className="text-xs text-muted-foreground">Resolution Rate</p>
            <p className="text-sm font-bold text-foreground">96%</p>
          </div>
        </motion.div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
        <button className="px-3 py-1.5 bg-accent text-background font-semibold rounded hover:bg-accent/90 transition-colors text-xs">
          Create Ticket
        </button>
        <button className="px-3 py-1.5 bg-white/5 border border-white/10 text-foreground font-semibold rounded hover:bg-white/10 transition-colors text-xs">
          Live Chat
        </button>
        <button className="hidden md:block px-3 py-1.5 bg-white/5 border border-white/10 text-foreground font-semibold rounded hover:bg-white/10 transition-colors text-xs">
          Call Request
        </button>
      </div>
    </motion.div>
  );
}
