'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, LogOut, LayoutGrid, Users, FileText, CreditCard, Settings } from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { icon: LayoutGrid, label: 'Dashboard', href: '/admin' },
    { icon: Users, label: 'Users', href: '/admin/users' },
    { icon: FileText, label: 'KYC Requests', href: '/admin/kyc' },
    { icon: CreditCard, label: 'Membership Payments', href: '/admin/membership' },
    { icon: CreditCard, label: 'Deposits', href: '/admin/deposits' },
    { icon: CreditCard, label: 'Withdrawals', href: '/admin/withdrawals' },
    { icon: CreditCard, label: 'Payment Methods', href: '/admin/payments' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed md:sticky left-0 top-0 z-50 h-screen w-64 bg-gradient-to-b from-background to-background/80 overflow-y-auto transform transition-transform duration-300 ease-in-out border-r border-white/10 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Close Button */}
        <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm p-4 flex justify-between items-center border-b border-white/10 md:hidden">
          <h2 className="text-sm font-semibold text-primary">Admin Panel</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Logo Section */}
        <div className="hidden md:block sticky top-0 z-10 bg-background/90 backdrop-blur-sm p-4 border-b border-white/10">
          <h2 className="text-base font-bold text-primary">Admin Panel</h2>
          <p className="text-xs text-white/50 mt-1">X Holding</p>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => onClose()}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  active
                    ? 'bg-accent/20 text-accent border border-accent/30'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <item.icon className={`w-5 h-5 ${active ? 'text-accent' : 'text-white/60'}`} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="sticky bottom-0 left-0 right-0 bg-background/90 backdrop-blur-sm border-t border-white/10 p-3">
          <button className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors font-medium text-sm">
            <span className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
