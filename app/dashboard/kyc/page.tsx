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
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  useEffect(() => {
    // Get user ID from session or localStorage
    const storedUserId = localStorage.getItem('userId');
    console.log('[v0] Stored user ID:', storedUserId);
    setUserId(storedUserId);
    setIsLoaded(true);

    // Fetch KYC status from database
    if (storedUserId) {
      fetchKYCStatus(storedUserId);
    }
  }, []);

  const fetchKYCStatus = async (userId: string) => {
    setIsLoadingStatus(true);
    try {
      const response = await fetch(`/api/kyc/submit?user_id=${userId}`);
      const data = await response.json();

      if (data.submission) {
        const submission = data.submission;
        console.log('[v0] KYC submission fetched:', submission);
        
        // Map database status to UI status
        if (submission.status === 'approved') {
          setKycStatus('verified');
        } else if (submission.status === 'pending') {
          setKycStatus('pending_review');
        } else if (submission.status === 'rejected') {
          setKycStatus('rejected');
        }
      }
    } catch (error) {
      console.error('[v0] Error fetching KYC status:', error);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmitSuccess = () => {
    console.log('[v0] KYC submitted successfully');
    setKycStatus('pending_review');
    // Refresh status after a short delay to ensure database is updated
    setTimeout(() => {
      if (userId) {
        fetchKYCStatus(userId);
      }
    }, 1000);
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
          {isLoadingStatus ? (
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Loading KYC status...</p>
            </div>
          ) : (
            <KYCStatusCard status={kycStatus} />
          )}
        </motion.div>

        {/* Sections */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isLoaded ? 'visible' : 'hidden'}
          className="space-y-3"
        >
          {/* Personal Information */}
          <PersonalInfoForm values={formData} onChange={handleFormChange} />

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
          <SubmitVerification 
            status={kycStatus} 
            formData={formData}
            userId={userId || undefined}
            onSubmitSuccess={handleSubmitSuccess}
          />
        </motion.div>
      </main>

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
