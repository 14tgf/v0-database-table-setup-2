'use client';

import { motion } from 'framer-motion';
import { MessageCircle, Clock } from 'lucide-react';
import { staggerItem } from '@/lib/animations';

export function LiveChatCard() {
  return (
    <motion.div
      variants={staggerItem}
      className="bg-gradient-to-br from-primary/20 via-primary/10 to-background/50 border border-primary/30 rounded-lg p-4 backdrop-blur-sm"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
          <MessageCircle className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-foreground mb-1">Live Chat Support</h3>
          <p className="text-xs text-muted-foreground mb-3">Connect with our support team instantly for real-time assistance.</p>
          
          {/* Chat Status */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-green-400 font-semibold">Team Available Now</span>
          </div>

          {/* Chat History Preview */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 mb-3 max-h-24 overflow-y-auto">
            <div className="space-y-2 text-xs">
              <div>
                <p className="text-muted-foreground font-semibold">Agent Sarah</p>
                <p className="text-muted-foreground">Hi! How can we help you today?</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground font-semibold">You</p>
                <p className="text-muted-foreground">I need help with my withdrawal</p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button className="w-full px-3 py-1.5 bg-primary text-background font-semibold rounded hover:bg-primary/90 transition-colors text-xs">
            Start Chat
          </button>
        </div>
      </div>
    </motion.div>
  );
}
