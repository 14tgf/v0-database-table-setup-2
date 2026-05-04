'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Gift, Clock, Users, DollarSign, ArrowRight, Menu, X as XIcon } from 'lucide-react'
import { staggerContainer, staggerItem } from '@/lib/animations'
import { SidebarMenu } from '@/components/dashboard/sidebar-menu'

const Giveaways = [
  {
    id: 1,
    title: 'Tesla Model S Plaid Giveaway',
    description: 'Win a brand new Tesla Model S Plaid! This luxury electric sedan features tri-motor all-wheel drive with incredible performance.',
    prizeValue: 69990,
    prize: 'Car Prize',
    endDate: '110 days',
    participants: 0,
    status: 'Active',
    image: '/tesla-car.jpg',
  },
  {
    id: 2,
    title: '$50,000 Cash Giveaway',
    description: 'Win $50,000 in cash to invest in the stock market or use for your personal needs. Limited slots available.',
    prizeValue: 50000,
    prize: 'Cash Prize',
    endDate: '45 days',
    participants: 1243,
    status: 'Active',
    image: '/tesla-car.jpg',
  },
  {
    id: 3,
    title: 'Tesla Model 3 Giveaway',
    description: 'Win the all-electric Tesla Model 3 with extended range battery. Perfect for daily commutes with zero emissions.',
    prizeValue: 42990,
    prize: 'Car Prize',
    endDate: '75 days',
    participants: 856,
    status: 'Active',
    image: '/tesla-car.jpg',
  },
  {
    id: 4,
    title: 'Portfolio Boost Package',
    description: 'Win a $25,000 investment portfolio package managed by our expert team for one year.',
    prizeValue: 25000,
    prize: 'Investment Prize',
    endDate: '30 days',
    participants: 567,
    status: 'Active',
    image: '/tesla-car.jpg',
  },
]

export default function GiveawayPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="min-h-screen bg-background">
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isLoaded ? 'visible' : 'hidden'}
          className="text-center mb-8 space-y-2"
        >
          <motion.div variants={staggerItem} className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary border border-accent/30 rounded-full w-fit mx-auto">
            <Gift className="w-3 h-3 text-accent" />
            <span className="text-xs font-semibold text-accent tracking-widest">GIVEAWAYS</span>
          </motion.div>

          <motion.h1 variants={staggerItem} className="text-3xl md:text-4xl font-bold leading-tight text-foreground">
            Enter to Win <span className="text-accent">Amazing Prizes!</span>
          </motion.h1>

          <motion.p variants={staggerItem} className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Participate in our exclusive giveaways and win cars, cash, and more
          </motion.p>

          <motion.div variants={staggerItem} className="flex justify-center pt-1">
            <button className="px-4 py-1.5 bg-accent text-background font-semibold rounded-lg text-xs hover:bg-accent/90 transition-colors">
              My Entries
            </button>
          </motion.div>
        </motion.div>

        {/* Active Giveaways Section */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isLoaded ? 'visible' : 'hidden'}
          className="mb-8"
        >
          <motion.h2 variants={staggerItem} className="text-lg font-bold text-foreground mb-4">
            Active Giveaways
          </motion.h2>

          {/* Giveaway Cards Grid */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {Giveaways.map((giveaway, idx) => (
              <motion.div
                key={giveaway.id}
                variants={staggerItem}
                className="group relative overflow-hidden bg-secondary/80 border border-accent/30 rounded-2xl hover:border-accent/60 transition-all duration-300 backdrop-blur-sm"
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 bg-gradient-to-br from-accent/20 to-transparent blur-2xl" />

                {/* Image Section */}
                <div className="relative h-32 bg-gradient-to-br from-secondary to-secondary/50 overflow-hidden">
                  <Image
                    src={giveaway.image}
                    alt={giveaway.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-secondary/80" />
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2 z-10">
                    <span className="px-2 py-0.5 bg-primary/90 text-white text-xs font-bold rounded-full">
                      {giveaway.status}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-3">
                  <h3 className="text-base font-bold text-foreground mb-1 line-clamp-1">{giveaway.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{giveaway.description}</p>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {/* Prize */}
                    <div className="flex items-center gap-1.5">
                      <Gift className="w-3 h-3 text-accent flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Prize</p>
                        <p className="text-xs font-semibold text-foreground">{giveaway.prize}</p>
                      </div>
                    </div>

                    {/* Prize Value */}
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-3 h-3 text-accent flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Value</p>
                        <p className="text-xs font-semibold text-foreground">${giveaway.prizeValue.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* End Date */}
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-accent flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Ends in</p>
                        <p className="text-xs font-semibold text-foreground">{giveaway.endDate}</p>
                      </div>
                    </div>

                    {/* Participants */}
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3 h-3 text-accent flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Participants</p>
                        <p className="text-xs font-semibold text-foreground">{giveaway.participants}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button className="w-full py-1.5 px-2 bg-gradient-to-r from-accent/80 to-accent text-background font-bold rounded-lg text-xs hover:shadow-lg hover:shadow-accent/50 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-1 group/btn">
                    <span>View Details & Enter</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Information Section */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-8"
        >
          {[
            {
              title: 'Fair & Transparent',
              description: 'All giveaways are conducted fairly with random winner selection.',
            },
            {
              title: 'Instant Winnings',
              description: 'Winners are notified immediately and prizes are transferred within 48 hours.',
            },
            {
              title: 'No Purchase Required',
              description: 'All giveaways are free to enter. No hidden fees or commitments.',
            },
          ].map((feature) => (
            <motion.div
              key={feature.title}
              variants={staggerItem}
              className="bg-secondary/50 border border-accent/20 rounded-xl p-3 hover:border-accent/50 hover:bg-secondary transition-all duration-300"
            >
              <h4 className="text-sm font-semibold text-foreground mb-1">{feature.title}</h4>
              <p className="text-xs text-muted-foreground leading-snug">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-border/50 bg-background mt-8">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 py-6 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} X Holding. All rights reserved. | <Link href="/" className="text-accent hover:text-accent/80">Back to Home</Link>
          </p>
        </div>
      </footer>

      {/* Sidebar Menu */}
      <SidebarMenu 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName="Carl"
        userEmail="cedoe70@gmail.com"
      />
    </div>
  )
}
