'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { User, Lock, Bell, Percent } from 'lucide-react';

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [withdrawalFee, setWithdrawalFee] = useState(20);
  const [isSavingFee, setIsSavingFee] = useState(false);
  const [feeSuccess, setFeeSuccess] = useState(false);
  const [notifications, setNotifications] = useState({
    newSignup: true,
    kycSubmitted: true,
    paymentSubmitted: true,
    approvalCompleted: true,
  });

  // Fetch current withdrawal fee
  useEffect(() => {
    const fetchFee = async () => {
      try {
        const response = await fetch('/api/settings/withdrawal-fee');
        const data = await response.json();
        if (data.success) {
          setWithdrawalFee(data.feePercent);
        }
      } catch (error) {
        console.error('[v0] Error fetching withdrawal fee:', error);
      }
    };
    fetchFee();
  }, []);

  const handleSaveWithdrawalFee = async () => {
    setIsSavingFee(true);
    setFeeSuccess(false);
    try {
      const response = await fetch('/api/settings/withdrawal-fee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feePercent: withdrawalFee }),
      });
      const data = await response.json();
      if (data.success) {
        setFeeSuccess(true);
        setTimeout(() => setFeeSuccess(false), 3000);
      }
    } catch (error) {
      console.error('[v0] Error saving withdrawal fee:', error);
    } finally {
      setIsSavingFee(false);
    }
  };

  const handlePasswordChange = () => {
    if (newPassword === confirmPassword && newPassword) {
      console.log('[v0] Admin password changed');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleNotificationToggle = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4 max-w-2xl"
    >
      {/* Page Title */}
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage admin account and preferences</p>
      </motion.div>

      {/* Admin Profile */}
      <motion.div
        variants={staggerItem}
        className="bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 border border-white/10 rounded-lg p-4"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-blue-500 flex items-center justify-center">
            <User className="w-6 h-6 text-background" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Admin Account</h2>
            <p className="text-xs text-white/60">admin@xholding.com</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-2">Full Name</label>
            <input
              type="text"
              defaultValue="Admin User"
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-2">Email</label>
            <input
              type="email"
              defaultValue="admin@xholding.com"
              disabled
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground/50 cursor-not-allowed text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-2">Role</label>
            <p className="px-3 py-2 bg-input border border-border rounded-lg text-accent font-semibold text-sm">Administrator</p>
          </div>

          <button className="w-full px-4 py-2 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors font-medium text-sm">
            Save Changes
          </button>
        </div>
      </motion.div>

      {/* Withdrawal Fee Settings */}
      <motion.div
        variants={staggerItem}
        className="bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 border border-white/10 rounded-lg p-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <Percent className="w-5 h-5 text-accent" />
          <h2 className="text-base font-bold text-foreground">Withdrawal Fee Settings</h2>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-2">Withdrawal Fee Percentage</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={withdrawalFee}
                onChange={(e) => setWithdrawalFee(parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 text-sm"
              />
              <span className="text-lg font-bold text-accent">%</span>
            </div>
            <p className="text-xs text-white/50 mt-2">
              This fee will be charged to users when they request a withdrawal. Current fee: {withdrawalFee}%
            </p>
          </div>

          {feeSuccess && (
            <div className="flex items-center gap-2 text-xs text-green-400 bg-green-400/10 px-3 py-2 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              Withdrawal fee updated successfully
            </div>
          )}

          <button
            onClick={handleSaveWithdrawalFee}
            disabled={isSavingFee}
            className="w-full px-4 py-2 bg-accent text-background rounded-lg hover:bg-accent/90 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSavingFee ? 'Saving...' : 'Save Withdrawal Fee'}
          </button>
        </div>
      </motion.div>

      {/* Change Password */}
      <motion.div
        variants={staggerItem}
        className="bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 border border-white/10 rounded-lg p-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-accent" />
          <h2 className="text-base font-bold text-foreground">Change Password</h2>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-2">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 text-sm"
            />
          </div>

          {newPassword && confirmPassword && newPassword !== confirmPassword && (
            <p className="text-xs text-destructive">Passwords do not match</p>
          )}

          <button
            onClick={handlePasswordChange}
            disabled={!currentPassword || !newPassword || newPassword !== confirmPassword}
            className="w-full px-4 py-2 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Update Password
          </button>
        </div>
      </motion.div>

      {/* Notification Preferences */}
      <motion.div
        variants={staggerItem}
        className="bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 border border-white/10 rounded-lg p-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-accent" />
          <h2 className="text-base font-bold text-foreground">Notification Preferences</h2>
        </div>

        <div className="space-y-3">
          {[
            { key: 'newSignup', label: 'New User Signup', description: 'Notify when a new user registers' },
            { key: 'kycSubmitted', label: 'KYC Submitted', description: 'Notify when KYC verification is submitted' },
            { key: 'paymentSubmitted', label: 'Payment Submitted', description: 'Notify when membership payment is submitted' },
            { key: 'approvalCompleted', label: 'Approval Completed', description: 'Notify when KYC or payment is approved' },
          ].map((notif) => (
            <label key={notif.key} className="flex items-start gap-3 p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={notifications[notif.key as keyof typeof notifications]}
                onChange={() => handleNotificationToggle(notif.key)}
                className="w-4 h-4 mt-0.5 rounded border-white/20 accent-accent cursor-pointer"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{notif.label}</p>
                <p className="text-xs text-white/60">{notif.description}</p>
              </div>
            </label>
          ))}
        </div>

        <button className="w-full mt-4 px-4 py-2 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors font-medium text-sm">
          Save Notification Settings
        </button>
      </motion.div>
    </motion.div>
  );
}
