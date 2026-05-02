'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { slideInFromLeft, slideInFromRight, staggerContainer, staggerItem } from '@/lib/animations';

export function PremiumCtaSection() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-secondary/20 to-background" />

        {/* Animated light beams */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary/20 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Shimmer line accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="text-center space-y-8"
        >
          {/* Main Headline */}
          <motion.h2
            variants={staggerItem}
            className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
          >
            <span className="text-white">Powering Tomorrow&apos;s</span>{' '}
            <span className="bg-gradient-to-r from-accent via-cyan-400 to-accent bg-clip-text text-transparent">
              Wealth, Energy & Innovation
            </span>
          </motion.h2>

          {/* Subheadline */}
          <motion.p
            variants={staggerItem}
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            Invest smarter. Drive the future. Build sustainable energy.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={staggerItem}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
          >
            {/* Primary CTA */}
            <Link href="/market">
              <motion.button
                whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0, 217, 255, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-accent to-cyan-400 text-background font-bold rounded-lg hover:shadow-2xl transition-all duration-300 group flex items-center gap-2 relative overflow-hidden"
              >
                <span className="relative z-10">Explore Markets</span>
                <svg className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                {/* Animated shine effect */}
                <div className="absolute inset-0 bg-white/20 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-500" />
              </motion.button>
            </Link>

            {/* Secondary CTA */}
            <Link href="/inventory">
              <motion.button
                whileHover={{ y: -4, borderColor: 'rgba(0, 217, 255, 0.8)' }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border-2 border-accent/50 text-accent font-bold rounded-lg hover:border-accent hover:bg-accent/10 transition-all duration-300"
              >
                Browse Inventory
              </motion.button>
            </Link>

            {/* Tertiary CTA */}
            <motion.button
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 text-accent font-bold hover:text-accent/80 transition-colors duration-300 flex items-center gap-2 group"
            >
              Contact Sales
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Particle effects */}
        <div className="absolute top-1/2 left-10 w-2 h-2 bg-accent rounded-full opacity-50 animate-particle-float" />
        <div className="absolute top-1/3 right-20 w-2 h-2 bg-cyan-400 rounded-full opacity-50 animate-particle-float" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-accent/70 rounded-full opacity-40 animate-particle-float" style={{ animationDelay: '1s' }} />
      </div>
    </section>
  );
}
