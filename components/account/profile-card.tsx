'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { AvatarUpload } from './avatar-upload';
import { CheckCircle } from 'lucide-react';

export function ProfileCard() {
  const [profileData] = useState({
    fullName: 'Carl Doe',
    email: 'cedoe70@gmail.com',
    accountId: 'ACC-2024-X-000123',
    accountType: 'Premium VIP',
    verified: true,
  });

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 border border-border/50 rounded-2xl p-6 backdrop-blur-sm"
    >
      <motion.h2 variants={staggerItem} className="text-xl font-bold text-foreground mb-6">
        Profile Overview
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Avatar Upload Section */}
        <motion.div variants={staggerItem}>
          <AvatarUpload userName={profileData.fullName} />
        </motion.div>

        {/* Profile Info Section */}
        <motion.div variants={staggerContainer} className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Full Name</p>
            <p className="text-lg font-semibold text-foreground">{profileData.fullName}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Email Address</p>
            <p className="text-lg font-semibold text-foreground">{profileData.email}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Account ID</p>
            <p className="text-sm font-mono text-accent">{profileData.accountId}</p>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/30 rounded-lg">
              <div className="w-2 h-2 bg-accent rounded-full" />
              <span className="text-xs font-semibold text-accent">{profileData.accountType}</span>
            </div>

            {profileData.verified && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-lg">
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
