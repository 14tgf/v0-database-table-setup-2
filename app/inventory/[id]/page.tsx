'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Zap, Gauge, Battery, Fuel, Users, Tv, Settings, ArrowRight, Check } from 'lucide-react';
import { SidebarMenu } from '@/components/dashboard/sidebar-menu';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';

const PRODUCTS = [
  {
    id: '1',
    name: 'Tesla Model S Plaid',
    price: 104990,
    image: '/products/model-3.jpeg',
    description: 'Ultimate performance electric sedan with tri-motor power',
    fullDescription: 'The Tesla Model S Plaid is a luxury all-electric sedan that delivers exceptional performance, advanced technology, and refined comfort. Built with tri-motor all-wheel drive, it offers breathtaking acceleration, extended driving range, and a smooth, quiet ride. With its minimalist interior, massive touchscreen display, and cutting-edge driver assistance features, the Model S Plaid provides a premium driving experience for both city and long-distance travel.',
    features: [
      '200+ mph top speed',
      '1.99s 0-60 acceleration',
      '405 mile range',
      'Autopilot included'
    ],
    range: '405 miles',
    acceleration: '1.99s 0-60',
    charging: '10-80% in 25 min',
    make: 'Tesla',
    model: 'Model S Plaid',
    year: 2024,
    color: 'Pearl White Multi-Coat',
    transmission: 'Automatic',
    drive: 'Tri-Motor AWD',
    seating: '5 adults',
    display: '17-inch touchscreen',
    topSpeed: '200+ mph',
    images: [
      '/products/model-3.jpeg',
      '/products/model-3.jpeg',
      '/products/model-3.jpeg',
      '/products/model-3.jpeg',
      '/products/model-3.jpeg'
    ],
    purchasePrice: 104990,
    leasePrice: 2083,
    leaseTerms: '$7,500 down, 36 months, 10,000 miles',
    financePrice: 2195,
    variants: [
      { name: 'All-Wheel Drive', price: 2083 },
      { name: 'Plaid Tri-Motor', price: 2639 }
    ]
  },
  {
    id: '2',
    name: 'Luxury Compact EV',
    price: 85500,
    image: '/products/luxury-compact.png',
    description: 'Premium compact electric vehicle with minimalist design',
    fullDescription: 'Experience premium electric driving with our Luxury Compact EV. Featuring a sleek minimalist design and advanced technology integration, this vehicle offers the perfect balance of performance and efficiency for discerning drivers who value style and sustainability.',
    features: [
      'Luxury minimalist design',
      '0-60 in 3.2s',
      '320 mile range',
      'Premium materials'
    ],
    range: '320 miles',
    acceleration: '3.2s 0-60',
    charging: '10-80% in 28 min',
    make: 'Premium Motors',
    model: 'Luxury Compact',
    year: 2024,
    color: 'Midnight Black',
    transmission: 'Automatic',
    drive: 'Front-Wheel Drive',
    seating: '5 adults',
    display: '15-inch touchscreen',
    topSpeed: '125 mph',
    images: [
      '/products/luxury-compact.png',
      '/products/luxury-compact.png',
      '/products/luxury-compact.png',
      '/products/luxury-compact.png'
    ],
    purchasePrice: 85500,
    leasePrice: 1299,
    leaseTerms: '$5,000 down, 36 months, 10,000 miles',
    financePrice: 1395,
    variants: [
      { name: 'Standard', price: 1299 },
      { name: 'Premium Edition', price: 1599 }
    ]
  },
  {
    id: '3',
    name: 'Mansory Performance Sedan',
    price: 125000,
    image: '/products/mansory-sedan.png',
    description: 'Bespoke performance sedan with MANSORY customization',
    fullDescription: 'The Mansory Performance Sedan represents the pinnacle of automotive luxury and performance. With bespoke customization options, advanced pixel LED technology, and extraordinary acceleration capabilities, this vehicle is designed for those who demand excellence in every detail.',
    features: [
      'Pixel LED headlights',
      '0-60 in 2.8s',
      '380 mile range',
      'Custom MANSORY design'
    ],
    range: '380 miles',
    acceleration: '2.8s 0-60',
    charging: '10-80% in 22 min',
    make: 'MANSORY',
    model: 'Performance Sedan',
    year: 2024,
    color: 'Crystal Silver',
    transmission: 'Automatic',
    drive: 'All-Wheel Drive',
    seating: '5 adults',
    display: '19-inch OLED display',
    topSpeed: '180 mph',
    images: [
      '/products/mansory-sedan.png',
      '/products/mansory-sedan.png',
      '/products/mansory-sedan.png',
      '/products/mansory-sedan.png'
    ],
    purchasePrice: 125000,
    leasePrice: 2999,
    leaseTerms: '$10,000 down, 36 months, 10,000 miles',
    financePrice: 3195,
    variants: [
      { name: 'Standard Performance', price: 2999 },
      { name: 'Full Custom Edition', price: 3599 }
    ]
  }
];

export default function CarDetailPage({ params }: { params: { id: string } }) {
  const product = PRODUCTS.find(p => p.id === params.id);
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
        <div className="max-w-7xl mx-auto px-3 py-3 sm:px-4 flex items-center justify-between">
          <Link href="/inventory" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">Back</span>
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
      </nav>

      <main className="max-w-7xl mx-auto px-3 py-6 sm:px-4 lg:px-6">
        {/* Financing Options Header */}
        <div className="mb-6 rounded-3xl border border-white/10 bg-gradient-to-br from-blue-600/40 via-blue-600/30 to-background/50 p-4 sm:p-6 backdrop-blur-xl">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3 mb-4">
              <a href="#" className="text-white/70 hover:text-white underline text-xs sm:text-sm transition-colors">Get Prequalified</a>
              <a href="#" className="text-white/70 hover:text-white underline text-xs sm:text-sm transition-colors">Edit Terms & Savings</a>
              <a href="#" className="text-white/70 hover:text-white underline text-xs sm:text-sm transition-colors">Learn About Financing</a>
            </div>
            <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors text-sm sm:text-base">
              Order Now
            </button>
            <p className="text-white/60 text-xs sm:text-sm text-center">Secure checkout • Free delivery • 30-day return policy</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Image & Gallery */}
          <div className="lg:col-span-2 space-y-4">
            {/* Main Image */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] overflow-hidden">
              <div className="relative w-full h-64 sm:h-96 bg-gradient-to-br from-accent/10 to-transparent">
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
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainImage(img)}
                  className={`relative w-16 h-16 flex-shrink-0 rounded-lg border-2 overflow-hidden transition-all ${
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
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-4 sm:p-6 backdrop-blur-xl">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">{product.name}</h1>
              <p className="text-white/70 text-sm sm:text-base leading-relaxed">{product.fullDescription}</p>
            </div>

            {/* Specifications */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-xl">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-6">Technical Specifications</h2>
              <div className="space-y-4">
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
          <div className="space-y-4">
            {/* Vehicle Details */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-4 backdrop-blur-xl">
              <h3 className="text-lg font-bold text-white mb-4">Vehicle Details</h3>
              <div className="space-y-3">
                {[
                  { label: 'Make', value: product.make },
                  { label: 'Model', value: product.model },
                  { label: 'Year', value: product.year },
                  { label: 'Color', value: product.color },
                  { label: 'Transmission', value: product.transmission },
                ].map((detail, idx) => (
                  <div key={idx} className="pb-3 border-b border-white/10 last:border-b-0">
                    <p className="text-white/60 text-xs">{detail.label}</p>
                    <p className="text-white font-semibold text-sm">{detail.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Ordering Section */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-blue-600/40 via-blue-600/30 to-background/50 p-4 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-white mb-3">Estimated Delivery: 2-4 weeks</h3>
              
              {/* Tabs */}
              <div className="flex gap-2 mb-4 border-b border-white/20">
                {(['lease', 'purchase', 'finance'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setOrderTab(tab)}
                    className={`pb-2 text-xs font-medium capitalize transition-colors ${
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
              <div className="text-center mb-4">
                <p className="text-3xl font-bold text-white">{getTabPrice()}</p>
                {orderTab === 'lease' && <p className="text-white/60 text-xs mt-1">{product.leaseTerms}</p>}
              </div>

              {/* Variants */}
              {product.variants && (
                <div className="space-y-2 mb-4">
                  {product.variants.map((variant, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedVariant(variant)}
                      className={`w-full p-2 rounded-lg text-sm font-medium transition-all border-2 ${
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
              <div className="mb-4 flex items-center gap-2 text-white/70 text-xs">
                <input type="checkbox" className="w-4 h-4" defaultChecked />
                <span>Include est. gas savings of $108/mo</span>
              </div>

              {/* Links */}
              <div className="space-y-2 mb-4 text-center">
                <a href="#" className="block text-white underline text-xs hover:text-white/80">Get Prequalified</a>
                <a href="#" className="block text-white underline text-xs hover:text-white/80">Edit Terms & Savings</a>
                <a href="#" className="block text-white underline text-xs hover:text-white/80">Learn About Financing</a>
              </div>

              {/* Order Button */}
              <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors text-sm">
                Order Now
              </button>
            </div>

            {/* Key Features */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 p-4 backdrop-blur-xl">
              <h3 className="text-sm font-bold text-white mb-3">Key Features</h3>
              <ul className="space-y-2">
                {product.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
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

      {/* Bottom Navigation */}
      <DashboardNav />
    </div>
  );
}
