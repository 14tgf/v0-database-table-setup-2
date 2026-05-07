'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingCart, Menu, X as XIcon, AlertCircle, Check } from 'lucide-react'
import { staggerContainer, staggerItem } from '@/lib/animations'
import { SidebarMenu } from '@/components/dashboard/sidebar-menu'
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter'

interface Product {
  id: string
  name: string
  description: string
  price: number
  quantity?: number
}

interface PurchaseState {
  productId: string
  productName: string
  quantity: number
  totalAmount: number
  step: 'product' | 'order_created' | 'payment_form' | 'payment_submitted' | 'complete'
  orderId?: string
  depositId?: string
  error?: string
  loading: boolean
}

export default function ProductsPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { format } = useCurrencyFormatter()

  // Mock products - in production these would come from an API
  const products: Product[] = [
    {
      id: 'prod_001',
      name: 'Premium Membership',
      description: 'Access to premium features and priority support',
      price: 499,
      quantity: 1,
    },
    {
      id: 'prod_002',
      name: 'Professional Package',
      description: 'Complete suite of professional tools',
      price: 999,
      quantity: 1,
    },
    {
      id: 'prod_003',
      name: 'Enterprise Solution',
      description: 'Full enterprise setup and customization',
      price: 2499,
      quantity: 1,
    },
  ]

  const [purchaseState, setPurchaseState] = useState<PurchaseState>({
    productId: '',
    productName: '',
    quantity: 1,
    totalAmount: 0,
    step: 'product',
    loading: false,
  })

  const [paymentData, setPaymentData] = useState({
    method_name: '',
    tx_hash: '',
    proof_upload: '',
    note: '',
  })

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const handleBuyNow = async (product: Product) => {
    setPurchaseState((prev) => ({
      ...prev,
      productId: product.id,
      productName: product.name,
      totalAmount: product.price * (prev.quantity || 1),
      loading: true,
    }))

    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          product_name: product.name,
          quantity: purchaseState.quantity || 1,
          total_amount: product.price * (purchaseState.quantity || 1),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order')
      }

      setPurchaseState((prev) => ({
        ...prev,
        step: 'order_created',
        orderId: data.order.id,
        loading: false,
      }))
    } catch (error) {
      setPurchaseState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create order',
        loading: false,
      }))
    }
  }

  const handleSubmitPayment = async () => {
    if (!paymentData.method_name || !paymentData.amount || !paymentData.tx_hash) {
      setPurchaseState((prev) => ({
        ...prev,
        error: 'Please fill in all required payment fields',
      }))
      return
    }

    setPurchaseState((prev) => ({ ...prev, loading: true }))

    try {
      const response = await fetch('/api/orders/submit-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: purchaseState.orderId,
          method_name: paymentData.method_name,
          amount: purchaseState.totalAmount,
          tx_hash: paymentData.tx_hash,
          proof_upload: paymentData.proof_upload,
          note: paymentData.note,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit payment')
      }

      setPurchaseState((prev) => ({
        ...prev,
        step: 'payment_submitted',
        depositId: data.deposit_id,
        loading: false,
      }))
    } catch (error) {
      setPurchaseState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to submit payment',
        loading: false,
      }))
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 flex justify-between items-center px-8 py-6 border-b border-border/50 bg-gradient-to-r from-background/95 via-background/85 to-background/70 backdrop-blur-xl">
        <Link href="/">
          <div className={`transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '100ms' }}>
            <Image src="/logo.png" alt="X-Holding Logo" width={80} height={40} className="w-auto h-10" priority />
          </div>
        </Link>
        <nav className="hidden md:flex gap-8 text-sm font-medium">
          {['PRODUCTS', 'PRICING', 'SUPPORT'].map((item, idx) => (
            <a key={item} href="#" className={`text-muted-foreground hover:text-accent transition-all duration-300 relative group ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`} style={{ transitionDelay: `${200 + idx * 80}ms` }}>
              {item}
              <span className="absolute bottom-0 left-0 w-0 h-px bg-accent group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </nav>
        <div className="flex gap-4 items-center">
          <Link href="/dashboard/orders" className="px-4 py-2 rounded-lg border border-accent/30 text-accent hover:bg-accent/10 transition-colors text-sm font-medium">
            Order History
          </Link>
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors md:hidden">
            <Menu className="w-5 h-5 text-white/60" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <motion.div variants={staggerContainer} initial="hidden" animate={isLoaded ? 'visible' : 'hidden'} className="text-center mb-16">
          <motion.h1 variants={staggerItem} className="text-4xl md:text-5xl font-bold leading-tight text-foreground mb-4">
            Premium Products & Services
          </motion.h1>
          <motion.p variants={staggerItem} className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect package for your needs
          </motion.p>
        </motion.div>

        {/* Products Grid */}
        {purchaseState.step === 'product' ? (
          <motion.div variants={staggerContainer} initial="hidden" animate={isLoaded ? 'visible' : 'hidden'} className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {products.map((product) => (
              <motion.div key={product.id} variants={staggerItem} className="bg-gradient-to-br from-secondary/80 to-secondary/60 border border-accent/30 rounded-2xl p-8 hover:border-accent/60 transition-all duration-300 hover:shadow-2xl hover:shadow-accent/20 group">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-foreground mb-2">{product.name}</h3>
                  <p className="text-muted-foreground">{product.description}</p>
                </div>

                <div className="mb-8">
                  <p className="text-4xl font-bold text-accent">{format(product.price)}</p>
                  <p className="text-xs text-muted-foreground mt-1">One-time purchase</p>
                </div>

                <button
                  onClick={() => handleBuyNow(product)}
                  disabled={purchaseState.loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-accent text-background font-bold rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all group-hover:shadow-lg group-hover:shadow-accent/30"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Buy Now
                </button>
              </motion.div>
            ))}
          </motion.div>
        ) : purchaseState.step === 'order_created' ? (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-2xl mx-auto">
            <motion.div variants={staggerItem} className="bg-gradient-to-br from-secondary/80 to-secondary/60 border border-accent/30 rounded-2xl p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 border-2 border-accent mb-4">
                  <Check className="w-8 h-8 text-accent" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Order Created</h2>
                <p className="text-muted-foreground">Order ID: {purchaseState.orderId}</p>
              </div>

              <div className="bg-background/40 rounded-xl p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-muted-foreground">Product:</span>
                  <span className="font-semibold text-foreground">{purchaseState.productName}</span>
                </div>
                <div className="flex justify-between items-center border-t border-accent/20 pt-4">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="text-2xl font-bold text-accent">{format(purchaseState.totalAmount)}</span>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-foreground mb-4">Payment Information</h3>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Payment Method</label>
                  <input
                    type="text"
                    placeholder="e.g., bank_transfer, crypto"
                    value={paymentData.method_name}
                    onChange={(e) => setPaymentData({ ...paymentData, method_name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-background/40 border border-accent/20 text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Transaction Hash</label>
                  <input
                    type="text"
                    placeholder="0x123abc... or bank reference"
                    value={paymentData.tx_hash}
                    onChange={(e) => setPaymentData({ ...paymentData, tx_hash: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-background/40 border border-accent/20 text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Proof of Payment URL</label>
                  <input
                    type="text"
                    placeholder="URL to payment proof"
                    value={paymentData.proof_upload}
                    onChange={(e) => setPaymentData({ ...paymentData, proof_upload: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-background/40 border border-accent/20 text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Additional Notes</label>
                  <textarea
                    placeholder="Any additional information about the payment"
                    value={paymentData.note}
                    onChange={(e) => setPaymentData({ ...paymentData, note: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-background/40 border border-accent/20 text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent transition-colors resize-none"
                    rows={3}
                  />
                </div>
              </div>

              {purchaseState.error && (
                <div className="flex gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/30 mb-6">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{purchaseState.error}</p>
                </div>
              )}

              <button
                onClick={handleSubmitPayment}
                disabled={purchaseState.loading}
                className="w-full px-6 py-3 bg-accent text-background font-bold rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {purchaseState.loading ? 'Submitting...' : 'Submit Payment'}
              </button>
            </motion.div>
          </motion.div>
        ) : purchaseState.step === 'payment_submitted' ? (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-2xl mx-auto">
            <motion.div variants={staggerItem} className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30 rounded-2xl p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 mb-6">
                <Check className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Payment Submitted!</h2>
              <p className="text-muted-foreground mb-6">Your payment is pending admin approval. You will be notified once it's processed.</p>
              <div className="bg-background/40 rounded-xl p-6 mb-8">
                <p className="text-sm text-muted-foreground mb-1">Deposit ID:</p>
                <p className="font-mono text-sm text-accent break-all">{purchaseState.depositId}</p>
              </div>
              <Link
                href="/dashboard/orders"
                className="inline-flex items-center gap-2 px-8 py-3 bg-accent text-background font-bold rounded-lg hover:bg-accent/90 transition-all"
              >
                View Order History
              </Link>
            </motion.div>
          </motion.div>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="relative border-t border-border/50 bg-background mt-16">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 py-6 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} X Holding. All rights reserved. | <Link href="/" className="text-accent hover:text-accent/80">Back to Home</Link>
          </p>
        </div>
      </footer>

      {/* Sidebar Menu */}
      <SidebarMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userName="Carl" userEmail="cedoe70@gmail.com" />
    </div>
  )
}
