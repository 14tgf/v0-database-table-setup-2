'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { SupportHero } from '@/components/support/support-hero';
import { CreateTicketForm } from '@/components/support/create-ticket-form';
import { TicketsTable } from '@/components/support/tickets-table';
import { LiveChatCard } from '@/components/support/live-chat-card';
import { FAQSection } from '@/components/support/faq-section';
import { SidebarMenu } from '@/components/dashboard/sidebar-menu';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';

export default function SupportPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [userData, setUserData] = useState({ userName: '', userEmail: '' });

  useEffect(() => {
    setIsLoaded(true);
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setUserData({
          userName: data.user?.fullName || '',
          userEmail: data.user?.email || '',
        });
      }
    } catch (error) {
      console.error('[v0] Failed to fetch user data:', error);
    }
  };

  const handleTicketCreated = () => {
    setRefreshTrigger(prev => prev + 1);
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
              <span className="text-foreground">Support Center</span>
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
            Support Center
          </motion.h1>
          <motion.p variants={staggerItem} className="text-xs text-muted-foreground">
            Get help with your account, submit support tickets, and find answers to common questions
          </motion.p>
        </motion.div>

        {/* Content Sections */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isLoaded ? 'visible' : 'hidden'}
          className="space-y-3"
        >
          {/* Support Hero */}
          <SupportHero />

          {/* Create Ticket Form */}
          <CreateTicketForm onTicketCreated={handleTicketCreated} />

          {/* My Tickets */}
          <TicketsTable refreshTrigger={refreshTrigger} />

          {/* Live Chat and FAQ Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <LiveChatCard />
            <motion.div variants={staggerItem}>
              <FAQSection />
            </motion.div>
          </div>
        </motion.div>
      </main>

      {/* Sticky Navigation */}
      <DashboardNav />

      {/* Sidebar Menu */}
      <SidebarMenu
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName={userData.userName}
        userEmail={userData.userEmail}
      />
    </div>
  );
}
