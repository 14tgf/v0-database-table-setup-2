'use client';

import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import { Menu, Grid3x3, List } from 'lucide-react';
import { ProductCard } from '@/components/inventory/product-card';
import { SidebarMenu } from '@/components/dashboard/sidebar-menu';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';
import { PRODUCTS } from '@/lib/products';

export default function InventoryPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(PRODUCTS);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Handle search filtering
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = PRODUCTS.filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <Image 
                src="/logo.png" 
                alt="X Holding" 
                width={32} 
                height={32}
                className="w-8 h-8 cursor-pointer hover:opacity-80 transition-opacity"
              />
            </Link>
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Header with Hero Section */}
      <header className="relative overflow-hidden border-b border-white/10">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-background/70" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-background">
          <svg viewBox="0 0 1440 120" className="w-full h-full" preserveAspectRatio="none">
            <path
              d="M0,64L120,69.3C240,75,480,85,720,90.7C960,96,1200,96,1320,96L1440,96L1440,120L1320,120C1200,120,960,120,720,120C480,120,240,120,120,120L0,120Z"
              fill="currentColor"
              className="text-white/5"
            />
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Browse Inventory</h1>
          <p className="text-sm md:text-base text-white/70">Explore premium electric vehicles ready for delivery.</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search vehicles by name or model..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:border-accent/50 focus:bg-white/10 transition-all text-sm"
          />
        </div>

        {/* Results Header */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-white/60 text-xs">Showing {filteredProducts.length} of {PRODUCTS.length} vehicles</p>
          
          <div className="flex items-center gap-2">
            <span className="text-white/60 text-xs">View:</span>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-accent/20 border border-accent/50 text-accent'
                  : 'border border-white/10 text-white/60 hover:text-white'
              }`}
            >
              <Grid3x3 className="w-3 h-3" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-accent/20 border border-accent/50 text-accent'
                  : 'border border-white/10 text-white/60 hover:text-white'
              }`}
            >
              <List className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className={`grid gap-4 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {filteredProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product}
              viewMode={viewMode}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/60 text-sm">No vehicles found matching your search.</p>
          </div>
        )}
      </main>

      {/* Sidebar Menu */}
      <SidebarMenu 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName="Carl"
        userEmail="cedoe70@gmail.com"
      />

      {/* Bottom Navigation */}
      <DashboardNav />
    </div>
  );
}
