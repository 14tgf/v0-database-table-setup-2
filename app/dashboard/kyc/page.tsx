'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { KYCStatusCard } from '@/components/kyc/kyc-status-card';
import { PersonalInfoForm } from '@/components/kyc/personal-info-form';
import { DocumentUpload } from '@/components/kyc/document-upload';
import { AddressUpload } from '@/components/kyc/address-upload';
import { SelfieUpload } from '@/components/kyc/selfie-upload';
import { SubmitVerification } from '@/components/kyc/submit-verification';
import { SidebarMenu } from '@/components/dashboard/sidebar-menu';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';

export default function KYCPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [kycStatus, setKycStatus] = useState<'not_started' | 'pending_review' | 'verified' | 'rejected'>('not_started');

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleSubmit = () => {
    setKycStatus('pending_review');
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
              <span className="text-foreground">KYC Verification</span>
            </nav>

            <div className="w-8" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-20">
        {/* Page Title */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isLoaded ? 'visible' : 'hidden'}
          className="mb-4"
        >
          <motion.h1 variants={staggerItem} className="text-xl md:text-2xl font-bold text-foreground mb-1">
            KYC Verification
          </motion.h1>
          <motion.p variants={staggerItem} className="text-xs text-muted-foreground">
            Complete your identity verification to unlock all features and increase your withdrawal limits
          </motion.p>
        </motion.div>

        {/* Verification Status */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isLoaded ? 'visible' : 'hidden'}
          className="mb-4"
        >
          <KYCStatusCard status={kycStatus} />
        </motion.div>

        {/* Sections */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isLoaded ? 'visible' : 'hidden'}
          className="space-y-3"
        >
          {/* Personal Information */}
          <PersonalInfoForm />

          {/* Identity Document Upload */}
          <DocumentUpload
            title="Identity Document"
            description="Upload a clear photo or scan of your government-issued ID document"
            acceptedFormats={['PDF', 'JPG', 'PNG']}
            documentTypes={['Passport', "Driver's License", 'National ID', 'Residence Permit']}
          />

          {/* Address Verification */}
          <AddressUpload />

          {/* Selfie Verification */}
          <SelfieUpload />

          {/* Submit Section */}
          <SubmitVerification onSubmit={handleSubmit} status={kycStatus} />
        </motion.div>
      </main>

      {/* Sticky Navigation */}
      <DashboardNav />

      {/* Sidebar Menu */}
      <SidebarMenu
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </div>
  );
}
