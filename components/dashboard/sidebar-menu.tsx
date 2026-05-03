'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X, LogOut, LayoutGrid, Wallet, TrendingUp, BarChart3, Clock, Car, CreditCard, Gift, Package, User, Shield, HelpCircle } from 'lucide-react';

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  userName?: string;
}

export function SidebarMenu({ isOpen, onClose, userEmail = 'cedoe70@gmail.com', userName = 'Carl' }: SidebarMenuProps) {
  const menuItems = [
    { icon: LayoutGrid, label: 'Dashboard', href: '/dashboard' },
    { icon: Wallet, label: 'Wallet', href: '/dashboard/wallet' },
    { icon: TrendingUp, label: 'Investments', href: '#' },
    { icon: BarChart3, label: 'Stocks', href: '/stocks' },
    { icon: Clock, label: 'Portfolio', href: '/portfolio' },
    { icon: BarChart3, label: 'Investment Dashboard', href: '#' },
    { icon: Car, label: 'Inventory', href: '/inventory' },
    { icon: CreditCard, label: 'VIP Membership', href: '#' },
    { icon: Gift, label: 'Giveaways', href: '#' },
    { icon: Package, label: 'Orders', href: '#' },
    { icon: User, label: 'Account', href: '#' },
    { icon: Shield, label: 'KYC Verification', href: '#' },
    { icon: HelpCircle, label: 'Support', href: '#' },
  ];

  const handleMenuItemClick = () => {
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 z-50 h-screen w-64 bg-gradient-to-b from-background to-background/80 overflow-y-auto transform transition-transform duration-300 ease-in-out border-r border-white/10 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close Button */}
        <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm p-4 flex justify-end border-b border-white/10">
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white/60" />
          </button>
        </div>

        {/* User Profile Section */}
        <div className="bg-gradient-to-br from-secondary/30 via-secondary/20 to-background/50 p-4 border-b border-white/10 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
              <span className="text-background font-bold text-lg">{userName[0]}</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white">{userName}</p>
              <p className="text-sm text-white/70">{userEmail}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full border border-white/20">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <span className="text-xs text-white/60">KYC Not Submitted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={handleMenuItemClick}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors group"
            >
              <item.icon className="w-5 h-5 text-white/60 group-hover:text-primary transition-colors" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="sticky bottom-0 left-0 right-0 bg-background/90 backdrop-blur-sm border-t border-white/10 p-4">
          <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-primary hover:bg-primary/20 transition-colors font-medium">
            <span className="flex items-center gap-2">
              <LogOut className="w-5 h-5" />
              Logout
            </span>
            <LogOut className="w-4 h-4 rotate-180" />
          </button>
        </div>
      </div>
    </>
  );
}
