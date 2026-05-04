'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { AvatarUpload } from './avatar-upload';
import { CheckCircle } from 'lucide-react';

export function ProfileCard() {
  const [profileData] = useState({
    fullName: '',
    email: '',
    accountId: '',
    accountType: 'Standard',
    verified: false,
  });

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 border border-border/50 rounded-2xl p-6 backdrop-blur-sm"
    >
      <motion.h2 variants={staggerItem} className="text-lg font-bold text-foreground mb-4">
        Profile Overview
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Avatar Upload Section */}
        <motion.div variants={staggerItem}>
          <AvatarUpload userName={profileData.fullName} />
        </motion.div>

        {/* Profile Info Section */}
        <motion.div variants={staggerContainer} className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Full Name</p>
            <p className="text-base font-semibold text-foreground">{profileData.fullName}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Email Address</p>
            <p className="text-base font-semibold text-foreground">{profileData.email}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Account ID</p>
            <p className="text-xs font-mono text-accent">{profileData.accountId}</p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <div className="flex items-center gap-2 px-2 py-1 bg-accent/10 border border-accent/30 rounded-lg">
              <div className="w-1.5 h-1.5 bg-accent rounded-full" />
              <span className="text-xs font-semibold text-accent">{profileData.accountType}</span>
            </div>

            {profileData.verified && (
              <div className="flex items-center gap-2 px-2 py-1 bg-primary/10 border border-primary/30 rounded-lg">
                <CheckCircle className="w-3 h-3 text-primary" />
                <span className="text-xs font-semibold text-primary">Verified</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
