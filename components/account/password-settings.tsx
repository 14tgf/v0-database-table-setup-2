'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Eye, EyeOff, Check } from 'lucide-react';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface PasswordSettingsProps {
  onPasswordChange?: (newPassword: string) => void;
}

export function PasswordSettings({ onPasswordChange }: PasswordSettingsProps) {
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const calculateStrength = (password: string): 'weak' | 'medium' | 'strong' => {
    if (password.length < 8) return 'weak';
    if (password.length < 12 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) return 'medium';
    return 'strong';
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswords((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === 'new') {
      setPasswordStrength(calculateStrength(value));
    }

    setErrors((prev) => ({
      ...prev,
      [field]: '',
    }));
  };

  const handleSubmit = async () => {
    const newErrors: { [key: string]: string } = {};

    if (!passwords.current) newErrors.current = 'Current password is required';
    if (!passwords.new) newErrors.new = 'New password is required';
    if (!passwords.confirm) newErrors.confirm = 'Please confirm your password';
    if (passwords.new !== passwords.confirm) newErrors.confirm = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await fetch('/api/user/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ current: data.error || 'Failed to change password' });
        return;
      }

      onPasswordChange?.(passwords.new);
      setPasswords({ current: '', new: '', confirm: '' });
      setPasswordStrength(null);
      alert('Password changed successfully. Please log in again.');
    } catch (error) {
      console.error('[v0] Password change error:', error);
      setErrors({ current: 'Failed to change password' });
    }
  };

  const PasswordInput = ({ field, label, show }: { field: string; label: string; show: boolean }) => (
    <motion.div variants={staggerItem} className="space-y-2">
      <label className="text-sm font-semibold text-muted-foreground">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={passwords[field as keyof typeof passwords]}
          onChange={(e) => handlePasswordChange(field, e.target.value)}
          className={`w-full px-4 py-2.5 bg-input border rounded-xl outline-none transition-colors ${
            errors[field]
              ? 'border-destructive focus:border-destructive'
              : 'border-border focus:border-accent/50'
          }`}
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={() =>
            setShowPasswords((prev) => ({
              ...prev,
              [field]: !prev[field as keyof typeof show],
            }))
          }
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {show ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
      </div>
      {errors[field] && (
        <p className="text-xs text-destructive">{errors[field]}</p>
      )}
    </motion.div>
  );

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 border border-border/50 rounded-2xl p-6 backdrop-blur-sm"
    >
      <motion.h2 variants={staggerItem} className="text-xl font-bold text-foreground mb-6">
        Security Settings
      </motion.h2>

      <motion.div variants={staggerContainer} className="space-y-4 mb-6">
        <PasswordInput field="current" label="Current Password" show={showPasswords.current} />
        <PasswordInput field="new" label="New Password" show={showPasswords.new} />

        {passwordStrength && (
          <motion.div variants={staggerItem} className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width:
                      passwordStrength === 'weak'
                        ? '33%'
                        : passwordStrength === 'medium'
                          ? '66%'
                          : '100%',
                  }}
                  className={`h-full ${
                    passwordStrength === 'weak'
                      ? 'bg-destructive'
                      : passwordStrength === 'medium'
                        ? 'bg-yellow-500'
                        : 'bg-primary'
                  }`}
                />
              </div>
              <span className="text-xs font-semibold text-muted-foreground capitalize">
                {passwordStrength} strength
              </span>
            </div>
          </motion.div>
        )}

        <PasswordInput field="confirm" label="Confirm New Password" show={showPasswords.confirm} />
      </motion.div>

      <motion.button
        variants={staggerItem}
        onClick={handleSubmit}
        className="w-full py-2.5 px-4 bg-gradient-to-r from-accent/80 to-accent text-background font-semibold rounded-xl hover:shadow-lg hover:shadow-accent/50 transition-all duration-300 transform hover:scale-105"
      >
        Update Password
      </motion.button>

      <motion.div variants={staggerItem} className="mt-4 p-3 bg-primary/10 border border-primary/30 rounded-lg">
        <p className="text-xs text-primary/80">
          You will be logged out of all other devices after changing your password.
        </p>
      </motion.div>
    </motion.div>
  );
}
