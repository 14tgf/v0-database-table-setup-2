'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, Menu, X as XIcon, AlertCircle, Loader } from 'lucide-react'
import { staggerContainer, staggerItem } from '@/lib/animations'
import { SidebarMenu } from '@/components/dashboard/sidebar-menu'
import { useAuth } from '@/hooks/useAuth'

interface VIPTier {
  id: string
  name: string
  tier_level: number
  price: number
  duration_days: number
  description: string
  benefits: string[]
  active: boolean
}

export default function VIPMembershipPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [vipTiers, setVipTiers] = useState<VIPTier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<{ message: string; details?: string; errorType?: string } | null>(null)
  const [currentMembership, setCurrentMembership] = useState<any | null>(null)
  const [purchasingPlanId, setPurchasingPlanId] = useState<string | null>(null)
  const [purchaseError, setPurchaseError] = useState<string | null>(null)
  const { user } = useAuth()

  // Fetch VIP plans and user membership
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch available VIP plans
        console.log('[v0] VIP page - Fetching plans from /api/vip/plans');
        const plansResponse = await fetch('/api/vip/plans')
        
        console.log('[v0] VIP page - Response status:', plansResponse.status);
        console.log('[v0] VIP page - Response headers:', {
          contentType: plansResponse.headers.get('content-type'),
          contentLength: plansResponse.headers.get('content-length'),
        });

        const responseText = await plansResponse.text()
        console.log('[v0] VIP page - Raw response text:', responseText.substring(0, 500));

        if (!plansResponse.ok) {
          let errorData;
          try {
            errorData = JSON.parse(responseText)
          } catch {
            errorData = { error: responseText || `HTTP ${plansResponse.status}` }
          }

          console.error('[v0] VIP plans API error response:', {
            status: plansResponse.status,
            error: errorData.error,
            details: errorData.details,
            errorType: errorData.errorType,
            fullResponse: responseText.substring(0, 500),
          });
          
          throw new Error(
            errorData.details 
              ? `${errorData.error}: ${errorData.details}`
              : errorData.error || `HTTP ${plansResponse.status}: Failed to fetch VIP plans`
          )
        }
        
        let plans;
        try {
          plans = JSON.parse(responseText)
        } catch (parseErr) {
          console.error('[v0] VIP page - Failed to parse JSON response:', parseErr, 'Raw text:', responseText.substring(0, 500));
          throw new Error(`Failed to parse API response: ${parseErr instanceof Error ? parseErr.message : 'Invalid JSON'}`);
        }
        
        console.log('[v0] VIP page - Parsed plans:', {
          type: typeof plans,
          isArray: Array.isArray(plans),
          length: Array.isArray(plans) ? plans.length : 'N/A',
          sample: Array.isArray(plans) ? plans[0] : 'N/A',
        });
        
        if (!Array.isArray(plans)) {
          console.error('[v0] VIP page - Plans is not an array:', plans);
          throw new Error(`Invalid plans format: expected array but got ${typeof plans}. Response: ${JSON.stringify(plans).substring(0, 200)}`);
        }

        if (plans.length === 0) {
          console.warn('[v0] VIP plans - Empty array returned. VIP plans table may be empty or schema not initialized.');
          throw new Error('No VIP plans available. The database may not be initialized. Please run /api/admin/init-vip-schema and /api/admin/seed-vip-plans');
        }
        
        console.log('[v0] VIP page - Successfully fetched', plans.length, 'plans');
        setVipTiers(plans)

        // Fetch user's current membership if logged in
        if (user?.id) {
          console.log('[v0] VIP page - Fetching membership status for user:', user.id);
          const statusResponse = await fetch(`/api/vip/status?userId=${user.id}`)
          if (statusResponse.ok) {
            const statusData = await statusResponse.json()
            if (statusData.has_active_membership) {
              console.log('[v0] VIP page - User has active membership:', statusData.membership.name);
              setCurrentMembership(statusData.membership)
            } else {
              console.log('[v0] VIP page - User has no active membership');
            }
          } else {
            console.warn('[v0] VIP page - Failed to fetch membership status:', statusResponse.status);
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        console.error('[v0] VIP page - FATAL ERROR:', {
          message: errorMessage,
          stack: err instanceof Error ? err.stack : 'N/A',
          fullError: String(err),
        })
        setError({ 
          message: 'Unable to load VIP plans',
          details: errorMessage,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user?.id])

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const handlePurchase = async (planId: string) => {
    if (!user?.id) {
      setPurchaseError('Please log in to purchase a VIP membership')
      return
    }

    setPurchasingPlanId(planId)
    setPurchaseError(null)

    try {
      const response = await fetch('/api/vip/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, planId }),
      })

      const data = await response.json()

      if (!response.ok) {
        setPurchaseError(data.message || data.error || 'Purchase failed')
        return
      }

      // Refresh membership status
      const statusResponse = await fetch(`/api/vip/status?userId=${user.id}`)
      if (statusResponse.ok) {
        const statusData = await statusResponse.json()
        if (statusData.has_active_membership) {
          setCurrentMembership(statusData.membership)
        }
      }

      setPurchaseError(null)
      alert(`Success! ${data.message}`)
    } catch (err) {
      console.error('[v0] Purchase error:', err)
      setPurchaseError(err instanceof Error ? err.message : 'Purchase failed')
    } finally {
      setPurchasingPlanId(null)
    }
  }

  const isTierOwned = (tierLevel: number) => {
    return currentMembership && currentMembership.tier_level === tierLevel
  }

  const canUpgradeTo = (tierLevel: number) => {
    if (!currentMembership) return true
    return tierLevel > currentMembership.tier_level
  }

  const getPurchaseButtonText = (tier: VIPTier) => {
    if (isTierOwned(tier.tier_level)) {
      return 'Currently Owned'
    }
    if (currentMembership && !canUpgradeTo(tier.tier_level)) {
      return 'Cannot Downgrade'
    }
    if (currentMembership && canUpgradeTo(tier.tier_level)) {
      return 'Upgrade Now'
    }
    return 'Purchase Now'
  }

  const getPurchaseButtonState = (tier: VIPTier) => {
    return isTierOwned(tier.tier_level) || (currentMembership && !canUpgradeTo(tier.tier_level))
  }

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

            {/* Current Membership Status */}
            {currentMembership && (
              <motion.div variants={staggerItem} className="inline-block mt-4">
                <div className="px-4 py-2 bg-green-400/10 border border-green-400/30 rounded-lg">
                  <p className="text-sm text-green-400">
                    ✓ Currently using <span className="font-semibold">{currentMembership.name}</span> membership
                    {currentMembership.expires_at && (
                      <span className="text-xs block text-green-400/70 mt-1">
                        Expires: {new Date(currentMembership.expires_at).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Purchase Error */}
            {purchaseError && (
              <motion.div variants={staggerItem} className="inline-block mt-4">
                <div className="px-4 py-2 bg-red-400/10 border border-red-400/30 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <p className="text-sm text-red-400">{purchaseError}</p>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <Loader className="w-8 h-8 text-accent animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading VIP plans...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-red-400/30 bg-red-400/10 mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{error.message}</h3>
              {error.details && (
                <div className="mb-6 max-w-2xl mx-auto">
                  <p className="text-sm text-red-400/80 mb-3">{error.details}</p>
                  {error.errorType && (
                    <p className="text-xs text-white/40">Error Type: {error.errorType}</p>
                  )}
                </div>
              )}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-accent/20 border border-accent/50 text-accent rounded-lg hover:bg-accent/30 transition-all font-semibold"
                >
                  Try Again
                </button>
                <a
                  href="/"
                  className="px-6 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all font-semibold"
                >
                  Go Home
                </a>
              </div>
              <p className="text-xs text-white/40 mt-4">
                If the problem persists, please contact support with error type: {error.errorType}
              </p>
            </div>
          )}

          {/* VIP Tiers Grid */}
          {!isLoading && vipTiers.length > 0 && (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate={isLoaded ? 'visible' : 'hidden'}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
            >
              {vipTiers.map((tier, idx) => (
                <motion.div
                  key={tier.id}
                  variants={staggerItem}
                  className={`relative group`}
                >
                  {/* Glow effect background */}
                  <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 bg-gradient-to-br from-accent/20 to-transparent blur-2xl`} />

                  {/* Card */}
                  <div className={`relative h-full flex flex-col bg-secondary/80 border border-accent/30 rounded-2xl p-4 hover:border-accent/60 transition-all duration-300 backdrop-blur-sm glow-cyan animate-glow-cyan ${
                    tier.tier_level === 3 ? 'ring-2 ring-accent/50 lg:scale-105' : ''
                  }`}>
                    {/* Featured badge */}
                    {tier.tier_level === 3 && (
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
                        <span className="text-xs text-muted-foreground">/{Math.round(tier.duration_days / 30.4)} months</span>
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
                    <button
                      onClick={() => handlePurchase(tier.id)}
                      disabled={getPurchaseButtonState(tier) || purchasingPlanId === tier.id}
                      className={`w-full py-2 px-3 font-bold rounded-lg text-sm transition-all duration-300 transform hover:scale-105 group/btn relative overflow-hidden ${
                        getPurchaseButtonState(tier)
                          ? 'bg-white/10 text-white/50 cursor-not-allowed'
                          : 'bg-gradient-to-r from-accent/80 to-accent text-background hover:shadow-lg hover:shadow-accent/50'
                      }`}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {purchasingPlanId === tier.id && <Loader className="w-4 h-4 animate-spin" />}
                        {getPurchaseButtonText(tier)}
                      </span>
                      {!getPurchaseButtonState(tier) && (
                        <div className="absolute inset-0 bg-white/20 translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-500 rounded-lg" />
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

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
        userName="Carl"
        userEmail="cedoe70@gmail.com"
      />
    </main>
  )
}
