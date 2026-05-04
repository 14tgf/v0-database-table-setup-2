'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Zap, Gauge, Battery, Fuel, Users, Tv, Settings, ArrowRight, Check, X } from 'lucide-react';
import { SidebarMenu } from '@/components/dashboard/sidebar-menu';
import { PremiumFooter } from '@/components/premium-footer';
import { PRODUCTS } from '@/lib/products';
import { useParams } from 'next/navigation';

export default function CarDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const product = PRODUCTS.find(p => p.id === id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mainImage, setMainImage] = useState(product?.images[0] || '');
  const [orderTab, setOrderTab] = useState<'lease' | 'purchase' | 'finance'>('lease');
  const [selectedVariant, setSelectedVariant] = useState(product?.variants[0] || null);

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-white text-2xl font-bold mb-4">Car Not Found</h1>
          <Link href="/inventory" className="text-primary hover:text-primary/80 transition-colors">
            ← Back to Inventory
          </Link>
        </div>
      </div>
    );
  }

  const getTabPrice = () => {
    if (orderTab === 'lease') return `$${product.leasePrice.toLocaleString()}/mo`;
    if (orderTab === 'purchase') return `$${product.purchasePrice.toLocaleString()}`;
    return `$${product.financePrice.toLocaleString()}/mo`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-gradient-to-r from-background/95 via-background/85 to-background/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-2 py-2 sm:px-3 flex items-center justify-between">
          <Link href="/inventory" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span className="text-xs">Back</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-2 py-4 sm:px-3 lg:px-4">
        {/* Financing Options Header */}
        <div className="mb-4 rounded-2xl border border-white/10 bg-gradient-to-br from-blue-600/40 via-blue-600/30 to-background/50 p-3 sm:p-4 backdrop-blur-xl">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 mb-2">
              <a href="#" className="text-white/70 hover:text-white underline text-xs transition-colors">Get Prequalified</a>
              <a href="#" className="text-white/70 hover:text-white underline text-xs transition-colors">Edit Terms & Savings</a>
              <a href="#" className="text-white/70 hover:text-white underline text-xs transition-colors">Learn About Financing</a>
            </div>
            <Link href={`/checkout?productId=${product.id}`} className="block w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-colors text-sm text-center">
              Order Now
            </Link>
            <p className="text-white/60 text-xs text-center">Secure checkout • Free delivery • 30-day return policy</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Image & Gallery */}
          <div className="lg:col-span-2 space-y-3">
            {/* Main Image */}
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] overflow-hidden">
              <div className="relative w-full h-48 sm:h-80 bg-gradient-to-br from-accent/10 to-transparent">
                <Image
                  src={mainImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>

            {/* Thumbnail Gallery */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainImage(img)}
                  className={`relative w-14 h-14 flex-shrink-0 rounded-lg border-2 overflow-hidden transition-all ${
                    mainImage === img ? 'border-primary' : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} view ${idx + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </button>
              ))}
            </div>

            {/* Description */}
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-3 sm:p-4 backdrop-blur-xl">
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">{product.name}</h1>
              <p className="text-white/70 text-xs sm:text-sm leading-relaxed">{product.fullDescription}</p>
            </div>

            {/* Specifications */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4 backdrop-blur-xl">
              <h2 className="text-base sm:text-lg font-bold text-white mb-4">Technical Specifications</h2>
              <div className="space-y-3">
                {[
                  { label: 'Acceleration', value: product.acceleration },
                  { label: 'Top Speed', value: product.topSpeed },
                  { label: 'Range', value: product.range },
                  { label: 'Drive', value: product.drive },
                  { label: 'Seating', value: product.seating },
                  { label: 'Display', value: product.display },
                ].map((spec, idx) => (
                  <div key={idx} className="pb-4 border-b border-white/10 last:border-b-0">
                    <div className="flex justify-between items-center">
                      <span className="text-white/60 text-sm">{spec.label}</span>
                      <span className="text-white font-semibold text-sm">{spec.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar: Details & Ordering */}
          <div className="space-y-3">
            {/* Vehicle Details */}
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-3 backdrop-blur-xl">
              <h3 className="text-base font-bold text-white mb-3">Vehicle Details</h3>
              <div className="space-y-2">
                {[
                  { label: 'Make', value: product.make },
                  { label: 'Model', value: product.model },
                  { label: 'Year', value: product.year },
                  { label: 'Color', value: product.color },
                  { label: 'Transmission', value: product.transmission },
                ].map((detail, idx) => (
                  <div key={idx} className="pb-2 border-b border-white/10 last:border-b-0">
                    <p className="text-white/60 text-xs">{detail.label}</p>
                    <p className="text-white font-semibold text-xs">{detail.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Ordering Section */}
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-blue-600/40 via-blue-600/30 to-background/50 p-3 backdrop-blur-xl">
              <h3 className="text-xs font-semibold text-white mb-2">Estimated Delivery: 2-4 weeks</h3>
              
              {/* Tabs */}
              <div className="flex gap-2 mb-3 border-b border-white/20">
                {(['lease', 'purchase', 'finance'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setOrderTab(tab)}
                    className={`pb-1 text-xs font-medium capitalize transition-colors ${
                      orderTab === tab
                        ? 'text-white border-b-2 border-white'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Price Display */}
              <div className="text-center mb-3">
                <p className="text-2xl font-bold text-white">{getTabPrice()}</p>
                {orderTab === 'lease' && <p className="text-white/60 text-xs mt-0.5">{product.leaseTerms}</p>}
              </div>

              {/* Variants */}
              {product.variants && (
                <div className="space-y-2 mb-3">
                  {product.variants.map((variant, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedVariant(variant)}
                      className={`w-full p-2 rounded-lg text-xs font-medium transition-all border-2 ${
                        selectedVariant?.name === variant.name
                          ? 'border-white bg-white/10 text-white'
                          : 'border-white/20 text-white/70 hover:border-white/40 hover:text-white'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{variant.name}</span>
                        <span>${variant.price.toLocaleString()}/mo</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Gas Savings */}
              <div className="mb-3 flex items-center gap-2 text-white/70 text-xs">
                <input type="checkbox" className="w-3 h-3" defaultChecked />
                <span>Include est. gas savings of $108/mo</span>
              </div>

              {/* Links */}
              <div className="space-y-1 mb-3 text-center">
                <a href="#" className="block text-white underline text-xs hover:text-white/80">Get Prequalified</a>
                <a href="#" className="block text-white underline text-xs hover:text-white/80">Edit Terms & Savings</a>
                <a href="#" className="block text-white underline text-xs hover:text-white/80">Learn About Financing</a>
              </div>

              {/* Order Button */}
              <Link href={`/checkout?productId=${product.id}`} className="block w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-colors text-xs text-center">
                Order Now
              </Link>
            </div>

            {/* Key Features */}
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-3 backdrop-blur-xl">
              <h3 className="text-xs font-bold text-white mb-2">Key Features</h3>
              <ul className="space-y-1">
                {product.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <Check className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-white/70 text-xs">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Sidebar Menu */}
      <SidebarMenu 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName="Carl"
        userEmail="cedoe70@gmail.com"
      />

      {/* Footer */}
      <PremiumFooter />
    </div>
  );
}
