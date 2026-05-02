'use client';

import { motion } from 'framer-motion';
import { LucideIcon, ArrowRight } from 'lucide-react';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actionText: string;
  index: number;
}

export function QuickActionCard({
  title,
  description,
  icon: Icon,
  actionText,
  index,
}: QuickActionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 via-white/5 to-white/[0.02] p-4 backdrop-blur-xl hover:border-accent/50 hover:bg-white/10 transition-all duration-300 group cursor-pointer glow-cyan-hover">
        <div className="flex items-start gap-3 mb-2">
          <Icon className="w-5 h-5 text-accent/80 group-hover:text-accent transition-colors" />
        </div>
        <h3 className="text-base font-semibold text-white mb-0.5">{title}</h3>
        <p className="text-xs text-white/60 mb-3">{description}</p>
        <a
          href="#"
          className="flex items-center gap-2 text-accent text-xs font-semibold hover:gap-3 transition-all"
        >
          {actionText}
          <ArrowRight className="w-3 h-3" />
        </a>
      </div>
    </motion.div>
  );
}
