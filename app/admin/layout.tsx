'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { Menu } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user is on login page
    if (pathname === '/admin/login') {
      setIsAuthenticated(true);
      return;
    }

    // Verify admin session
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/verify', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          setIsAuthenticated(false);
          router.push('/admin/login');
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error('[v0] Auth check error:', error);
        setIsAuthenticated(false);
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [pathname, router]);

  // Show nothing while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="w-12 h-12 rounded-lg bg-accent/20 border border-accent/50 mx-auto mb-4 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-background/90 backdrop-blur-sm border-b border-white/10 px-4 py-3 md:py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-white/70" />
            </button>
            <div className="flex-1 text-center md:text-right">
              <p className="text-xs text-white/50">Admin Dashboard</p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

