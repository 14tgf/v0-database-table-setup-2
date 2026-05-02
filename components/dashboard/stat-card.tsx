'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  index: number;
}

export function StatCard({ title, value, subtitle, icon: Icon, index }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 backdrop-blur-xl hover:border-accent/50 transition-all duration-300 glow-white-hover">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-sm font-semibold text-white/80">{title}</h3>
          <Icon className="w-5 h-5 text-accent/60" />
        </div>
        <p className="text-2xl font-bold text-white mb-1">{value}</p>
        <p className="text-xs text-white/50">{subtitle}</p>
      </div>
    </motion.div>
  );
}
