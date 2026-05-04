'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface KYCStatusCardProps {
  status: 'not_started' | 'pending_review' | 'verified' | 'rejected';
}

export function KYCStatusCard({ status }: KYCStatusCardProps) {
  const statusConfig = {
    not_started: {
      title: 'Verification Not Started',
      description: 'Complete your KYC verification to unlock premium features',
      icon: AlertCircle,
      color: 'text-yellow-400',
      bgColor: 'from-yellow-400/20 to-yellow-400/5',
      progress: 0,
      estimatedTime: '5-10 minutes',
    },
    pending_review: {
      title: 'Verification Pending Review',
      description: 'Your documents are being reviewed. This typically takes 1-2 business days.',
      icon: Clock,
      color: 'text-blue-400',
      bgColor: 'from-blue-400/20 to-blue-400/5',
      progress: 50,
      estimatedTime: '1-2 business days',
    },
    verified: {
      title: 'Verification Approved',
      description: 'Your identity has been verified. You can now access all features.',
      icon: CheckCircle,
      color: 'text-accent',
      bgColor: 'from-accent/20 to-accent/5',
      progress: 100,
      estimatedTime: 'Approved',
    },
    rejected: {
      title: 'Verification Rejected',
      description: 'Your documents could not be verified. Please resubmit with clearer documents.',
      icon: AlertCircle,
      color: 'text-red-400',
      bgColor: 'from-red-400/20 to-red-400/5',
      progress: 0,
      estimatedTime: 'Resubmit required',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={`bg-gradient-to-br ${config.bgColor} border border-white/10 rounded-lg p-4 backdrop-blur-sm`}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Info */}
        <motion.div variants={staggerItem} className="md:col-span-2">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg bg-white/10 border border-white/20 ${config.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground mb-1">{config.title}</h2>
              <p className="text-xs text-muted-foreground mb-2">{config.description}</p>
              
              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Completion</span>
                  <span className={`font-semibold ${config.color}`}>{config.progress}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r from-${config.color.split('-')[1]}-400 to-${config.color.split('-')[1]}-500 transition-all duration-500`}
                    style={{
                      width: `${config.progress}%`,
                      background: config.color === 'text-accent' ? 'linear-gradient(90deg, #00d9ff, #0099ff)' : undefined,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Estimated Time */}
        <motion.div variants={staggerItem} className="flex flex-col justify-center">
          <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">Estimated Time</p>
            <p className="text-sm font-bold text-foreground">{config.estimatedTime}</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
