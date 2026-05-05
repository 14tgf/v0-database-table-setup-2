'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Package, ShoppingCart, Clock, DollarSign, Menu, X as XIcon, ArrowRight } from 'lucide-react'
import { staggerContainer, staggerItem } from '@/lib/animations'
import { SidebarMenu } from '@/components/dashboard/sidebar-menu'
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter'

interface Order {
  id: string
  product_name: string
  quantity: number
  total_amount: number
  payment_method: string
  status: string
  created_at: string
}

export default function OrdersPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { format } = useCurrencyFormatter()

  useEffect(() => {
    setIsLoaded(true)
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/orders/list')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch orders')
      }
      
      setOrders(data.orders || [])
      setError(null)
    } catch (err) {
      console.error('[v0] Error fetching orders:', err)
      setError(err instanceof Error ? err.message : 'Failed to load orders')
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }

  const totalPurchases = orders.length
  const completedPurchases = orders.filter(o => o.status === 'Completed').length
  const pendingPurchases = orders.filter(o => o.status.includes('Pending') || o.status.includes('Submitted')).length

  return (
    <div className="min-h-screen bg-background text-foreground">
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
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isLoaded ? 'visible' : 'hidden'}
          className="text-left mb-8"
        >
          <motion.h1 variants={staggerItem} className="text-3xl md:text-4xl font-bold leading-tight text-foreground mb-2">
            Purchase History
          </motion.h1>

          <motion.p variants={staggerItem} className="text-sm text-muted-foreground">
            Track all your vehicle purchases and transactions
          </motion.p>
        </motion.div>

        {/* Statistics Card */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isLoaded ? 'visible' : 'hidden'}
          className="mb-8"
        >
          <motion.div
            variants={staggerItem}
            className="bg-gradient-to-br from-secondary/80 to-secondary/60 border border-accent/30 rounded-2xl p-6 hover:border-accent/60 transition-all duration-300 backdrop-blur-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Total Purchases</h2>
              <ShoppingCart className="w-6 h-6 text-accent" />
            </div>

            <div className="text-4xl font-bold text-accent mb-6">{totalPurchases}</div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background/40 rounded-xl p-3 border border-accent/20">
                <p className="text-xs text-muted-foreground mb-1">Completed</p>
                <p className="text-2xl font-bold text-foreground">{completedPurchases}</p>
              </div>
              <div className="bg-background/40 rounded-xl p-3 border border-accent/20">
                <p className="text-xs text-muted-foreground mb-1">Pending</p>
                <p className="text-2xl font-bold text-foreground">{pendingPurchases}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* All Purchases Section */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isLoaded ? 'visible' : 'hidden'}
          className="mb-8"
        >
          <motion.div
            variants={staggerItem}
            className="bg-gradient-to-br from-primary via-primary to-primary/80 rounded-2xl p-8 overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16 blur-3xl" />

            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-white mb-2">All Purchases</h2>
              <p className="text-white/80 mb-8">Complete history of your vehicle purchases</p>

              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-white/80">Loading orders...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-400 mb-4">{error}</p>
                  <button
                    onClick={fetchOrders}
                    className="px-4 py-2 bg-white text-primary font-semibold rounded-lg hover:bg-white/90 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 mb-4">
                    <Package className="w-10 h-10 text-white/60" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">No Purchase History</h3>
                  <p className="text-white/80 mb-6">You haven&apos;t made any purchases yet.</p>
                  <Link
                    href="/inventory"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary font-bold rounded-lg hover:bg-white/90 transition-colors group"
                  >
                    <ShoppingCart className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    Browse Vehicles
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <motion.div
                      key={order.id}
                      variants={staggerItem}
                      className="bg-white/10 border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">{order.product_name}</h3>
                          <div className="flex gap-4 mt-1 text-xs text-white/70">
                            <p>Qty: {order.quantity}</p>
                            <p>Method: {order.payment_method}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-white">{format(parseFloat(order.total_amount as any) || 0)}</p>
                          <p className={`text-xs font-semibold mt-1 ${
                            order.status === 'Completed' ? 'text-green-300' : 
                            order.status === 'Rejected' ? 'text-red-300' :
                            'text-yellow-300'
                          }`}>
                            {order.status}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
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
