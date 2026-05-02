'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, Grid3x3, List } from 'lucide-react';
import { ProductCard } from '@/components/inventory/product-card';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  features: string[];
  range?: string;
  acceleration?: string;
  charging?: string;
}

// Sample products - will be expanded with more products
const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Tesla Model S Plaid',
    price: 104990,
    image: '/tesla-model-s.jpg',
    description: 'Ultimate performance electric sedan with tri-motor power',
    features: [
      '200+ mph top speed',
      '1.99s 0-60 acceleration',
      '405 mile range',
      'Autopilot included'
    ],
    range: '405 miles',
    acceleration: '1.99s 0-60',
    charging: '10-80% in 25 min'
  }
];

export default function InventoryPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredProducts, setFilteredProducts] = useState(PRODUCTS);

  return (
    <div className="min-h-screen bg-background">
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

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Browse Inventory</h1>
          <p className="text-lg text-white/70">Explore premium electric vehicles ready for immediate delivery.</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Section */}
        <div className="mb-8">
          <button className="w-full px-6 py-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="font-semibold">Filters & Sort</span>
            </div>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>

        {/* Results Header */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-white/60 text-sm">Showing 1 - {filteredProducts.length} of {PRODUCTS.length} vehicles</p>
          
          <div className="flex items-center gap-2">
            <span className="text-white/60 text-sm">View:</span>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-accent/20 border border-accent/50 text-accent'
                  : 'border border-white/10 text-white/60 hover:text-white'
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-accent/20 border border-accent/50 text-accent'
                  : 'border border-white/10 text-white/60 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className={`grid gap-6 ${
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
            <p className="text-white/60 text-lg">No vehicles found matching your criteria.</p>
          </div>
        )}
      </main>
    </div>
  );
}
