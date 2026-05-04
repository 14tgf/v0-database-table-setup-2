'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Menu, X as XIcon } from 'lucide-react';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { ProfileCard } from '@/components/account/profile-card';
import { CurrencySelector } from '@/components/account/currency-selector';
import { PasswordSettings } from '@/components/account/password-settings';
import { AccountActions } from '@/components/account/account-actions';
import { SidebarMenu } from '@/components/dashboard/sidebar-menu';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';

export default function AccountPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors md:hidden"
              >
                <Menu className="w-5 h-5 text-white/60" />
              </button>
              <Image
                src="/logo.png"
                alt="X Holding"
                width={80}
                height={40}
                className="w-auto h-10"
              />
            </div>

            {/* Breadcrumb */}
            <nav className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <a href="/dashboard" className="hover:text-foreground transition-colors">
                Dashboard
              </a>
              <span>/</span>
              <span className="text-foreground">Account</span>
            </nav>

            <div className="w-8" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 overflow-visible">
        {/* Page Title */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isLoaded ? 'visible' : 'hidden'}
          className="mb-8"
        >
          <motion.h1 variants={staggerItem} className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Account Settings
          </motion.h1>
          <motion.p variants={staggerItem} className="text-muted-foreground">
            Manage your profile, preferences, and security settings
          </motion.p>
        </motion.div>

        {/* Success Toast */}
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-xl flex items-center gap-3"
          >
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <p className="text-sm font-semibold text-primary">Your changes have been saved successfully</p>
          </motion.div>
        )}

        {/* Content Sections */}
        <div className="space-y-6">
          {/* Profile Overview */}
          <ProfileCard />

          {/* Security Settings */}
          <PasswordSettings onPasswordChange={handleSave} />

          {/* Currency Preferences */}
          <CurrencySelector />
        </div>
      </main>

      {/* Action Buttons */}
      <AccountActions onSave={handleSave} />

      {/* Sticky Navigation */}
      <DashboardNav />

      {/* Sidebar Menu */}
      <SidebarMenu
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName="Carl"
        userEmail="cedoe70@gmail.com"
      />
    </div>
  );
}
