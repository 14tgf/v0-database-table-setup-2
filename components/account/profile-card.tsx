'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { AvatarUpload } from './avatar-upload';
import { CheckCircle, AlertCircle } from 'lucide-react';

export function ProfileCard() {
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    accountId: '',
    preferredCurrency: 'USD',
    vipStatus: 'inactive',
    vipLevel: '',
    kycStatus: 'not_verified',
    profileImage: '',
    createdAt: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('[v0] Fetching user profile...');
        const response = await fetch('/api/user/profile');
        console.log('[v0] Profile fetch response status:', response.status);
        
        const data = await response.json();
        console.log('[v0] Profile data received:', data);
        
        if (response.ok && data.user) {
          setProfileData({
            fullName: data.user.fullName || '',
            email: data.user.email || '',
            phoneNumber: data.user.phoneNumber || '',
            accountId: data.user.id || '',
            preferredCurrency: data.user.preferredCurrency || 'USD',
            vipStatus: data.user.vipStatus || 'inactive',
            vipLevel: data.user.vipLevel || '',
            kycStatus: data.user.kycStatus || 'not_verified',
            profileImage: data.user.profileImage || '',
            createdAt: data.user.createdAt || '',
          });
          setError(null);
        } else {
          console.error('[v0] API response not ok or missing user data:', data);
          setError(data.error || 'Failed to load profile data');
        }
      } catch (error) {
        console.error('[v0] Failed to fetch user profile:', error);
        setError('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleAvatarChange = async (file: File | null) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/user/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData(prev => ({
          ...prev,
          profileImage: data.imageUrl,
        }));
      }
    } catch (error) {
      console.error('[v0] Avatar upload error:', error);
    }
  };

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-400/10 border-green-400/30 text-green-400';
      case 'pending':
        return 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400';
      case 'rejected':
        return 'bg-red-400/10 border-red-400/30 text-red-400';
      default:
        return 'bg-orange-400/10 border-orange-400/30 text-orange-400';
    }
  };

  const getVipStatusColor = (status: string) => {
    return status === 'active'
      ? 'bg-accent/10 border-accent/30 text-accent'
      : 'bg-white/10 border-white/10 text-white/60';
  };

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

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading profile data...</p>
      ) : error ? (
        <div className="p-3 bg-red-400/10 border border-red-400/30 rounded-lg">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Avatar Upload Section */}
          <motion.div variants={staggerItem}>
            <AvatarUpload 
              userName={profileData.fullName} 
              initialImage={profileData.profileImage}
              onImageChange={handleAvatarChange}
            />
          </motion.div>

          {/* Profile Info Section */}
          <motion.div variants={staggerContainer} className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Full Name</p>
              <p className="text-base font-semibold text-foreground">{profileData.fullName || 'Not set'}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Email Address</p>
              <p className="text-base font-semibold text-foreground">{profileData.email || 'Not set'}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Phone Number</p>
              <p className="text-base font-semibold text-foreground">{profileData.phoneNumber || 'Not set'}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Account ID</p>
              <p className="text-xs font-mono text-accent truncate">{profileData.accountId || 'Not set'}</p>
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-2 pt-2">
              <div className={`flex items-center gap-2 px-2.5 py-1 border rounded-lg ${getVipStatusColor(profileData.vipStatus)}`}>
                <div className="w-1.5 h-1.5 rounded-full bg-current" />
                <span className="text-xs font-semibold">
                  VIP: {profileData.vipStatus === 'active' ? profileData.vipLevel || 'Active' : 'Inactive'}
                </span>
              </div>

              <div className={`flex items-center gap-2 px-2.5 py-1 border rounded-lg ${getKycStatusColor(profileData.kycStatus)}`}>
                {profileData.kycStatus === 'approved' ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  <AlertCircle className="w-3 h-3" />
                )}
                <span className="text-xs font-semibold capitalize">{profileData.kycStatus}</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
