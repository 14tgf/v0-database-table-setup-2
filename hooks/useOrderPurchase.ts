import { useState } from 'react'

interface Order {
  id: string
  product_id: string
  product_name: string
  quantity: number
  amount: number
  total_amount: number
  status: string
  created_at: string
}

interface PaymentData {
  order_id: string
  method_name: string
  amount: number
  tx_hash: string
  proof_upload: string
  note: string
}

interface UseOrderPurchaseReturn {
  createOrder: (product_id: string, product_name: string, quantity: number, total_amount: number) => Promise<Order>
  submitPayment: (paymentData: PaymentData) => Promise<{ deposit_id: string; message: string }>
  error: string | null
  loading: boolean
}

export function useOrderPurchase(): UseOrderPurchaseReturn {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const createOrder = async (product_id: string, product_name: string, quantity: number, total_amount: number): Promise<Order> => {
    try {
      console.log('[v0] Creating order:', { product_id, product_name, quantity, total_amount })
      setLoading(true)
      setError(null)

      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id,
          product_name,
          quantity,
          total_amount,
        }),
      })

      console.log('[v0] Order creation response status:', response.status)

      if (!response.ok) {
        const data = await response.json()
        console.error('[v0] Order creation error:', { status: response.status, data })
        throw new Error(data.error || `Failed to create order: ${response.status}`)
      }

      const data = await response.json()
      console.log('[v0] Order created successfully:', data.order)

      if (!data.success || !data.order) {
        throw new Error('Invalid response format from order creation')
      }

      setLoading(false)
      return data.order
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create order'
      console.error('[v0] createOrder error:', { message: errorMsg, error: err })
      setError(errorMsg)
      setLoading(false)
      throw err
    }
  }

  const submitPayment = async (paymentData: PaymentData): Promise<{ deposit_id: string; message: string }> => {
    try {
      console.log('[v0] Submitting payment:', { order_id: paymentData.order_id, method: paymentData.method_name, amount: paymentData.amount })
      setLoading(true)
      setError(null)

      const response = await fetch('/api/orders/submit-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      })

      console.log('[v0] Payment submission response status:', response.status)

      if (!response.ok) {
        const data = await response.json()
        console.error('[v0] Payment submission error:', { status: response.status, data })
        throw new Error(data.error || `Failed to submit payment: ${response.status}`)
      }

      const data = await response.json()
      console.log('[v0] Payment submitted successfully:', { deposit_id: data.deposit_id })

      if (!data.success || !data.deposit_id) {
        throw new Error('Invalid response format from payment submission')
      }

      setLoading(false)
      return { deposit_id: data.deposit_id, message: data.message }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to submit payment'
      console.error('[v0] submitPayment error:', { message: errorMsg, error: err })
      setError(errorMsg)
      setLoading(false)
      throw err
    }
  }

  return {
    createOrder,
    submitPayment,
    error,
    loading,
  }
}
