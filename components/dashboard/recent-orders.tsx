'use client';

import { motion } from 'framer-motion';
import { Car } from 'lucide-react';

export function RecentOrders() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="col-span-1 md:col-span-2"
    >
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Recent Orders</h2>
            <p className="text-sm text-white/60">Your latest Tesla purchases</p>
          </div>
          <a href="#" className="text-accent text-sm font-semibold hover:underline">
            View All →
          </a>
        </div>

        {/* Empty State */}
        <div className="py-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-4">
            <Car className="w-8 h-8 text-white/40" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No orders yet</h3>
          <p className="text-white/60 text-sm mb-6">
            Start browsing our collection of electric vehicles.
          </p>
          <a
            href="/inventory"
            className="inline-block px-6 py-2 bg-accent/20 border border-accent/50 text-accent font-semibold rounded-lg hover:bg-accent/30 transition-all duration-300 text-sm"
          >
            Browse Inventory
          </a>
        </div>
      </div>
    </motion.div>
  );
}
