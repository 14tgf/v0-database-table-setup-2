'use client';

import { LayoutGrid, Wallet, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import Link from 'next/link';

export function DashboardNav() {
  const navItems = [
    { icon: LayoutGrid, label: 'Dashboard', href: '/dashboard' },
    { icon: Wallet, label: 'Wallet', href: '/dashboard/wallet' },
    { icon: TrendingUp, label: 'Invest', href: '/dashboard/invest' },
    { icon: BarChart3, label: 'Stocks', href: '/stocks' },
    { icon: PieChart, label: 'Portfolio', href: '/portfolio' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-gradient-to-t from-background/95 to-background/80 backdrop-blur-xl">
      <div className="max-w-md mx-auto px-4 py-2">
        <div className="flex items-center justify-around">
          {navItems.map(({ icon: Icon, label, href }) => (
            <Link
              key={label}
              href={href}
              className="flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-lg text-white/60 hover:text-accent hover:bg-white/5 transition-all duration-300 group"
            >
              <Icon className="w-4 h-4 group-hover:text-accent transition-colors" />
              <span className="text-xs font-medium text-center">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
