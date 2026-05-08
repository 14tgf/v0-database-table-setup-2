'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { TrendingUp, Zap, Shield } from 'lucide-react'
import { AnimatedCounter } from '@/components/animated-counter'
import { MarketSection } from '@/components/market/market-section'
import { MarketMoversSection } from '@/components/market/market-movers-section'
import { MarketNewsSection } from '@/components/market/market-news-section'
import { InventorySection } from '@/components/inventory/inventory-section'
import { TestimonialsSection } from '@/components/testimonials/testimonials-section'
import { PremiumCtaSection } from '@/components/premium-cta-section'
import { PremiumFooter } from '@/components/premium-footer'

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <main className="w-full min-h-screen relative">
      {/* Background Image with Overlay */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: 'url(/tesla-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      />
      
      {/* Dark Overlay */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-r from-background/95 via-background/85 to-background/70" />

      {/* Animated background grid */}
      <div className="fixed inset-0 opacity-5 -z-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0, 217, 255, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 217, 255, 0.3) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Glowing accent orbs */}
      <div className="fixed top-20 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-20 animate-pulse -z-10" />
      <div className="fixed bottom-40 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl opacity-20 animate-pulse -z-10" style={{ animationDelay: '1s' }} />

      {/* Header Navigation */}
      <header className="sticky top-0 z-50 flex justify-between items-center px-8 py-6 border-b border-border/50 bg-gradient-to-r from-background/95 via-background/85 to-background/70 backdrop-blur-xl">
        <div
          className={`transition-all duration-1000 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ transitionDelay: '100ms' }}
        >
          <Image
            src="/logo.png"
            alt="X-Holding Logo"
            width={80}
            height={40}
            className="w-auto h-10"
            priority
          />
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-medium">
          {[
            { name: 'BUY', href: '#' },
            { name: 'SELL', href: '#' },
            { name: 'EXPLORE', href: '#' },
            { name: 'VIP MEMBERSHIP', href: '/vip-membership' },
            { name: 'CONTACT', href: '#' },
          ].map((item, idx) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-muted-foreground hover:text-accent transition-all duration-300 relative group ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
              }`}
              style={{ transitionDelay: `${200 + idx * 80}ms` }}
            >
              {item.name}
              <span className="absolute bottom-0 left-0 w-0 h-px bg-accent group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
        </nav>
        <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors md:hidden">
          <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* Hero Content */}
      <div className="relative z-20 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Main Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-8">
            {/* Left Content */}
            <div className="space-y-4">
              <div
                className={`space-y-4 transition-all duration-1000 ${
                  isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
                }`}
                style={{ transitionDelay: '300ms' }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary border border-accent/30 rounded-full w-fit">
                  <Zap className="w-4 h-4 text-accent" />
                  <span className="text-xs font-semibold text-accent tracking-widest">POWERED BY TESLA ECOSYSTEM</span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-foreground">
                  Trade Tesla <span className="text-accent">Tomorrow</span>
                </h1>
              </div>

              <p
                className={`text-sm text-muted-foreground max-w-lg leading-relaxed transition-all duration-1000 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: '500ms' }}
              >
                Buy and sell Tesla vehicles, robots, and energy products on the most secure fintech marketplace. Zero friction. Maximum opportunity.
              </p>

              {/* Stats */}
              <div
                className={`grid grid-cols-3 gap-3 transition-all duration-1000 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: '700ms' }}
              >
                {[
                  { target: 2400, suffix: 'B+', description: 'Trading Volume' },
                  { target: 50, suffix: 'K+', description: 'Active Traders' },
                  { target: 99, suffix: '.9%', description: 'Uptime' },
                ].map((stat) => (
                  <div key={stat.description} className="bg-secondary/50 border border-accent/20 rounded-lg p-3">
                    <div className="text-lg font-bold text-accent">
                      {stat.suffix.startsWith('$') ? '$' : ''}
                      <AnimatedCounter 
                        target={stat.target} 
                        duration={2000}
                        suffix={stat.suffix}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{stat.description}</div>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div
                className={`flex flex-col sm:flex-row gap-3 transition-all duration-1000 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: '900ms' }}
              >
                <Link
                  href="/login"
                  className="px-6 py-2 bg-accent text-accent-foreground font-semibold rounded-lg hover:shadow-lg hover:shadow-accent/50 transition-all duration-300 transform hover:scale-105 text-sm text-center"
                >
                  Start Trading
                </Link>
                <Link
                  href="/dashboard/withdraw"
                  className="px-6 py-2 border border-accent text-accent font-semibold rounded-lg hover:bg-accent/10 transition-all duration-300 text-sm text-center"
                >
                  Learn More
                </Link>
              </div>

              {/* Trust Features */}
              <div
                className={`flex gap-8 pt-4 transition-all duration-1000 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: '1100ms' }}
              >
                {[
                  { icon: Shield, label: 'Secure' },
                  { icon: TrendingUp, label: 'Real-time' },
                  { icon: Zap, label: 'Instant' },
                ].map((feature) => (
                  <div key={feature.label} className="flex items-center gap-2">
                    <feature.icon className="w-4 h-4 text-accent" />
                    <span className="text-sm text-muted-foreground">{feature.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Car Image */}
            <div
              className={`relative h-full min-h-[350px] transition-all duration-1000 ${
                isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
              style={{ transitionDelay: '400ms' }}
            >
              <div className="relative w-full h-full flex items-center justify-center group">
                {/* Glow border effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-accent/20 via-transparent to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Car Image with subtle float animation */}
                <div className="relative w-full h-full animate-float">
                  <Image
                    src="/car.jpg"
                    alt="Tesla Vehicle - X-Holding Marketplace"
                    fill
                    className="object-contain drop-shadow-2xl group-hover:drop-shadow-[0_0_30px_rgba(0,217,255,0.5)] transition-all duration-500"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>

                {/* Price/Market indicator */}
                <div className="absolute bottom-8 left-4 right-4 bg-background/80 border border-accent/30 backdrop-blur-sm rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <div className="text-xs text-muted-foreground">Current Price</div>
                    <div className="text-xl font-bold text-accent">$45,230</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">24h Change</div>
                    <div className="text-lg font-bold text-green-400">+2.4%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Features Section */}
          <div
            className={`grid grid-cols-1 md:grid-cols-3 gap-4 transition-all duration-1000 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '1200ms' }}
          >
            {[
              {
                title: 'Tesla Vehicles',
                description: 'Model S, 3, X, Y - Browse thousands of listings with real-time pricing',
              },
              {
                title: 'Energy Systems',
                description: 'Powerwall, Solar - Complete your energy ecosystem with verified sellers',
              },
              {
                title: 'Robotics',
                description: 'Optimus & Future Tech - Early access to next-generation Tesla products',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-secondary/50 border border-accent/20 rounded-xl p-6 hover:border-accent/50 hover:bg-secondary transition-all duration-300 group cursor-pointer"
              >
                <h3 className="text-base font-semibold text-foreground mb-1 group-hover:text-accent transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Live Market Section */}
          <MarketSection />

          {/* Market Movers Section */}
          <MarketMoversSection />

          {/* Market News Section */}
          <MarketNewsSection />

          {/* Inventory Section */}
          <InventorySection />

          {/* Testimonials Section */}
          <TestimonialsSection />

          {/* Premium CTA Section */}
          <PremiumCtaSection />
        </div>
      </div>

      {/* Premium Footer */}
      <PremiumFooter />

      {/* Scroll Indicator */}
      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 transition-all duration-1000 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ transitionDelay: '1400ms' }}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="text-xs tracking-widest text-muted-foreground font-medium">SCROLL</div>
          <div className="w-px h-6 bg-gradient-to-b from-accent to-transparent animate-pulse" />
        </div>
      </div>
    </main>
  )
}
