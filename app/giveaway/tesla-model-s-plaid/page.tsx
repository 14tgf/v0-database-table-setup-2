'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronLeft, Gift, DollarSign, Clock, Users, Shield, AlertCircle, Check, Menu, Loader } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { staggerContainer, staggerItem } from '@/lib/animations'
import { SidebarMenu } from '@/components/dashboard/sidebar-menu'

interface Eligibility {
  isEligible: boolean;
  hasVipMembership: boolean;
  isKycVerified: boolean;
  canEnterAgain: boolean;
  reason?: string;
  daysUntilEligible?: number;
}

export default function TeslaModelSPlaidDetailsPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [hasEntered, setHasEntered] = useState(false)
  const [eligibility, setEligibility] = useState<Eligibility | null>(null)
  const [isChecking, setIsChecking] = useState(true)
  const [isEntering, setIsEntering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    setIsLoaded(true)
    const storedUserId = localStorage.getItem('userId')
    setUserId(storedUserId)
    
    if (storedUserId) {
      checkEligibility(storedUserId)
    } else {
      setIsChecking(false)
    }
  }, [])

  const checkEligibility = async (id: string) => {
    setIsChecking(true)
    try {
      const response = await fetch(
        `/api/giveaway/enter?user_id=${id}&giveaway_id=tesla-model-s-plaid`
      )
      const data = await response.json()
      
      if (data.eligibility) {
        setEligibility(data.eligibility)
      }
    } catch (err) {
      console.error('[v0] Error checking eligibility:', err)
      setError('Failed to check eligibility')
    } finally {
      setIsChecking(false)
    }
  }

  const handleEnterGiveaway = async () => {
    if (!userId) {
      setError('User ID not found')
      return
    }

    setIsEntering(true)
    setError(null)

    try {
      const response = await fetch('/api/giveaway/enter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          giveaway_id: 'tesla-model-s-plaid',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || data.error || 'Failed to enter giveaway')
        return
      }

      setHasEntered(true)
      setTimeout(() => {
        alert('Successfully entered the giveaway!')
      }, 500)
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'An error occurred'
      console.error('[v0] Enter giveaway error:', err)
      setError(errMsg)
    } finally {
      setIsEntering(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 flex justify-between items-center px-8 py-6 border-b border-border/50 bg-gradient-to-r from-background/95 via-background/85 to-background/70 backdrop-blur-xl">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 hover:text-accent transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <Link href="/">
          <Image
            src="/logo.png"
            alt="X-Holding Logo"
            width={80}
            height={40}
            className="w-auto h-10"
            priority
          />
        </Link>
        <button 
          onClick={() => setSidebarOpen(true)}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors md:hidden"
        >
          <Menu className="w-5 h-5 text-white/60" />
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isLoaded ? 'visible' : 'hidden'}
          className="space-y-6"
        >
          {/* Hero Image Section */}
          <motion.div
            variants={staggerItem}
            className="relative rounded-2xl overflow-hidden border border-accent/30 bg-gradient-to-b from-secondary to-secondary/50 h-64 md:h-80"
          >
            <Image
              src="/tesla-car.jpg"
              alt="Tesla Model S Plaid"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 bg-primary/90 text-white text-xs font-bold rounded-full">
                Active
              </span>
            </div>
          </motion.div>

          {/* Details Grid */}
          <motion.div
            variants={staggerItem}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {/* Prize Details Card */}
            <div className="md:col-span-2 space-y-4">
              <motion.div
                variants={staggerItem}
                className="bg-secondary/80 border border-accent/30 rounded-2xl p-4 hover:border-accent/60 transition-all duration-300"
              >
                <h2 className="text-2xl font-bold text-foreground mb-2">Tesla Model S Plaid</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Win a brand new Tesla Model S Plaid! This luxury electric sedan features tri-motor all-wheel drive with incredible performance, acceleration, and advanced autonomous driving capabilities.
                </p>
                
                {/* Prize Specs */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-2 bg-background/50 rounded-lg">
                    <DollarSign className="w-4 h-4 text-accent" />
                    <div>
                      <p className="text-xs text-muted-foreground">Prize Value</p>
                      <p className="text-sm font-bold text-foreground">$69,990</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-background/50 rounded-lg">
                    <Clock className="w-4 h-4 text-accent" />
                    <div>
                      <p className="text-xs text-muted-foreground">Ends in</p>
                      <p className="text-sm font-bold text-foreground">110 days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-background/50 rounded-lg">
                    <Users className="w-4 h-4 text-accent" />
                    <div>
                      <p className="text-xs text-muted-foreground">Participants</p>
                      <p className="text-sm font-bold text-foreground">342</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-background/50 rounded-lg">
                    <Gift className="w-4 h-4 text-accent" />
                    <div>
                      <p className="text-xs text-muted-foreground">Prize Type</p>
                      <p className="text-sm font-bold text-foreground">Car</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Entry Requirements */}
              <motion.div
                variants={staggerItem}
                className="bg-secondary/80 border border-accent/30 rounded-2xl p-4 hover:border-accent/60 transition-all duration-300"
              >
                <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-accent" />
                  Entry Requirements
                </h3>
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 mb-3">
                  <p className="text-sm font-semibold text-foreground">VIP Members Only</p>
                  <p className="text-xs text-muted-foreground mt-1">You must be a VIP member to participate in this giveaway</p>
                </div>
                
                <div className="space-y-2">
                  {[
                    'Must have an active VIP membership',
                    'Account must be verified',
                    'One entry per member every 30 days',
                  ].map((req, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-accent flex-shrink-0" />
                      <span className="text-xs text-muted-foreground">{req}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <motion.div
              variants={staggerItem}
              className="space-y-4"
            >
              {/* Status Card */}
              <div className="bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30 rounded-2xl p-4">
                <div className="text-center mb-4">
                  <p className="text-xs text-muted-foreground mb-1">Your Status</p>
                  {isChecking ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader className="w-4 h-4 animate-spin text-accent" />
                      <p className="text-sm text-muted-foreground">Checking...</p>
                    </div>
                  ) : (
                    <p className={`text-lg font-bold ${
                      hasEntered ? 'text-accent' : eligibility?.isEligible ? 'text-foreground' : 'text-orange-400'
                    }`}>
                      {hasEntered ? 'Entered ✓' : eligibility?.isEligible ? 'Eligible' : eligibility?.reason || 'NOT ELIGIBLE'}
                    </p>
                  )}
                </div>
                
                {error && (
                  <div className="p-2 bg-red-400/20 border border-red-400/30 rounded-lg mb-3 text-center">
                    <p className="text-xs text-red-400 font-semibold">{error}</p>
                  </div>
                )}

                {!isChecking && !eligibility?.isEligible && !hasEntered && (
                  <div className={`p-3 border rounded-lg text-center ${
                    eligibility?.reason === 'No active VIP membership'
                      ? 'bg-orange-400/20 border-orange-400/30'
                      : eligibility?.reason === 'Account not verified'
                      ? 'bg-yellow-400/20 border-yellow-400/30'
                      : 'bg-blue-400/20 border-blue-400/30'
                  }`}>
                    <p className={`text-xs font-semibold ${
                      eligibility?.reason === 'No active VIP membership'
                        ? 'text-orange-400'
                        : eligibility?.reason === 'Account not verified'
                        ? 'text-yellow-400'
                        : 'text-blue-400'
                    }`}>
                      {eligibility?.reason === 'No active VIP membership' && 'VIP membership required'}
                      {eligibility?.reason === 'Account not verified' && 'Complete KYC verification'}
                      {eligibility?.reason?.includes('within 30 days') && `Can enter again in ${eligibility?.daysUntilEligible} days`}
                    </p>
                    {eligibility?.reason === 'No active VIP membership' && (
                      <p className="text-xs text-muted-foreground mt-1">Upgrade to VIP to participate</p>
                    )}
                  </div>
                )}

                {!isChecking && eligibility?.isEligible && !hasEntered && (
                  <button 
                    onClick={handleEnterGiveaway}
                    disabled={isEntering}
                    className="w-full py-2 px-3 bg-gradient-to-r from-accent/80 to-accent text-background font-bold rounded-lg text-sm hover:shadow-lg hover:shadow-accent/50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isEntering ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Entering...
                      </>
                    ) : (
                      'Enter Giveaway'
                    )}
                  </button>
                )}

                {hasEntered && (
                  <div className="p-2 bg-accent/20 rounded-lg text-center">
                    <p className="text-xs text-accent font-semibold">Good luck! You&apos;re in the drawing</p>
                  </div>
                )}
              </div>

              {/* Info Card */}
              <div className="bg-secondary/50 border border-accent/20 rounded-2xl p-4 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Prize Pool</p>
                  <p className="text-lg font-bold text-accent">$69,990</p>
                </div>
                <div className="h-px bg-accent/20" />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Winners</p>
                  <p className="text-lg font-bold text-foreground">1</p>
                </div>
                <div className="h-px bg-accent/20" />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Odds of Winning</p>
                  <p className="text-lg font-bold text-foreground">1 in 342</p>
                </div>
              </div>

              {/* Terms */}
              <div className="bg-secondary/50 border border-orange-400/30 rounded-lg p-3 flex gap-2">
                <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  By entering, you agree to our terms and conditions. Winners will be announced within 7 business days.
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Benefits Section */}
          <motion.div
            variants={staggerItem}
            className="bg-secondary/50 border border-accent/20 rounded-2xl p-4"
          >
            <h3 className="text-lg font-bold text-foreground mb-3">Why Enter This Giveaway?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'Chance to win a premium luxury vehicle',
                'No additional purchase required',
                'Fair random selection process',
                'Quick winner notification',
                'Verified authentic prizes',
                'Transparent terms and conditions',
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-border/50 bg-background mt-12">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 py-6 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} X Holding. All rights reserved. | <Link href="/giveaway" className="text-accent hover:text-accent/80">Back to Giveaways</Link>
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
