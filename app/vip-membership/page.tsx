'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, Menu, X as XIcon } from 'lucide-react'
import { staggerContainer, staggerItem } from '@/lib/animations'
import { SidebarMenu } from '@/components/dashboard/sidebar-menu'

// Removed all mock VIP tier data - database-ready
const VIPTiers: any[] = [];

export default function VIPMembershipPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <main className="w-full min-h-screen relative">
      {/* Background setup */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: 'url(/tesla-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      />

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
        <Link href="/">
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
        </Link>
        <nav className="hidden md:flex gap-8 text-sm font-medium">
          {['BUY', 'SELL', 'EXPLORE', 'CONTACT'].map((item, idx) => (
            <a
              key={item}
              href="#"
              className={`text-muted-foreground hover:text-accent transition-all duration-300 relative group ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
              }`}
              style={{ transitionDelay: `${200 + idx * 80}ms` }}
            >
              {item}
              <span className="absolute bottom-0 left-0 w-0 h-px bg-accent group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </nav>
        <button 
          onClick={() => setSidebarOpen(true)}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors md:hidden"
        >
          <Menu className="w-5 h-5 text-white/60" />
        </button>
      </header>

      {/* Page Content */}
      <div className="relative z-20 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={isLoaded ? 'visible' : 'hidden'}
            className="text-center mb-12 space-y-3"
          >
            <motion.div variants={staggerItem} className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary border border-accent/30 rounded-full w-fit mx-auto">
              <span className="text-xs font-semibold text-accent tracking-widest">VIP MEMBERSHIP</span>
            </motion.div>

            <motion.h1 variants={staggerItem} className="text-3xl md:text-4xl font-bold leading-tight text-foreground">
              Unlock Exclusive <span className="text-accent">Tesla Benefits</span>
            </motion.h1>

            <motion.p variants={staggerItem} className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              Choose a VIP membership tier and enjoy special perks, discounts, and rewards exclusive to our most valued members
            </motion.p>
          </motion.div>

          {/* VIP Tiers Grid */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={isLoaded ? 'visible' : 'hidden'}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
          >
            {VIPTiers.map((tier, idx) => (
              <motion.div
                key={tier.name}
                variants={staggerItem}
                className={`relative group ${tier.featured ? 'lg:col-span-1' : ''}`}
              >
                {/* Glow effect background */}
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 ${
                  tier.glowColor === 'glow-cyan'
                    ? 'bg-gradient-to-br from-accent/20 to-transparent blur-2xl'
                    : ''
                }`} />

                {/* Card */}
                <div className={`relative h-full flex flex-col bg-secondary/80 border border-accent/30 rounded-2xl p-4 hover:border-accent/60 transition-all duration-300 backdrop-blur-sm ${
                  tier.featured ? 'ring-2 ring-accent/50' : ''
                } ${tier.glowColor} animate-glow-cyan`}>
                  {/* Featured badge */}
                  {tier.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <div className="px-3 py-0.5 bg-accent text-background text-xs font-bold rounded-full">
                        MOST POPULAR
                      </div>
                    </div>
                  )}

                  {/* Tier Info */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-foreground mb-1">{tier.name}</h3>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-2xl font-bold text-accent">${tier.price.toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground">/{tier.duration}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug">{tier.description}</p>
                  </div>

                  {/* Benefits List */}
                  <div className="flex-1 mb-4 space-y-2">
                    {tier.benefits.map((benefit, benefitIdx) => (
                      <div key={benefitIdx} className="flex items-start gap-2">
                        <Check className="w-3 h-3 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-muted-foreground leading-snug">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  {/* Purchase Button */}
                  <button className="w-full py-2 px-3 bg-gradient-to-r from-accent/80 to-accent text-background font-bold rounded-lg text-sm hover:shadow-lg hover:shadow-accent/50 transition-all duration-300 transform hover:scale-105 group/btn">
                    <span className="relative z-10">Purchase Now</span>
                    {/* Animated shine effect */}
                    <div className="absolute inset-0 bg-white/20 translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-500 rounded-lg" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Additional Info Section */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {[
              {
                title: 'No Hidden Fees',
                description: 'What you see is what you get. All benefits are clearly listed upfront.',
              },
              {
                title: 'Flexible Cancellation',
                description: 'Cancel anytime without penalties or long-term commitments required.',
              },
              {
                title: '24/7 Support',
                description: 'Our dedicated support team is always here to help you maximize your membership.',
              },
            ].map((feature) => (
              <motion.div
                key={feature.title}
                variants={staggerItem}
                className="bg-secondary/50 border border-accent/20 rounded-xl p-4 hover:border-accent/50 hover:bg-secondary transition-all duration-300"
              >
                <h4 className="text-base font-semibold text-foreground mb-1">{feature.title}</h4>
                <p className="text-xs text-muted-foreground leading-snug">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative border-t border-border/50 bg-background mt-12">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} X Holding. All rights reserved. | <Link href="/" className="text-accent hover:text-accent/80">Back to Home</Link>
          </p>
        </div>
      </footer>

      {/* Sidebar Menu */}
      <SidebarMenu 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </main>
  )
}
