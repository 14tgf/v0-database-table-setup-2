'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, ChevronDown, ShoppingBag } from 'lucide-react';

interface Order {
  id: string;
  user_id: string;
  product_name: string;
  amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  user_email?: string;
  full_name?: string;
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    console.log('[v0] Admin orders page mounted');
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/orders');
      const data = await response.json();

      console.log('[v0] Admin orders API response:', { success: response.ok, data });

      if (!response.ok) {
        const errorMsg = data.error || data.message || 'Failed to fetch orders';
        throw new Error(errorMsg);
      }

      // Ensure amount is a number (Postgres NUMERIC can come as string)
      const ordersWithNumbers = (data.orders || []).map((order: any) => {
        const convertedOrder = {
          ...order,
          amount: typeof order.amount === 'string' ? parseFloat(order.amount) : Number(order.amount),
        };
        console.log('[v0] Converted order:', { id: convertedOrder.id, amount: convertedOrder.amount, status: convertedOrder.status });
        return convertedOrder;
      });

      console.log('[v0] Final orders to set:', ordersWithNumbers);
      setOrders(ordersWithNumbers);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('[v0] Fetch orders error:', error);
      setMessage({
        type: 'error',
        text: `Failed to load orders: ${errorMessage}`,
      });
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      const response = await fetch('/api/admin/orders/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          action: 'approve',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || data.message || 'Failed to approve order';
        setMessage({
          type: 'error',
          text: errorMsg,
        });
        return;
      }

      setMessage({ type: 'success', text: 'Order approved successfully' });

      // Update local orders list
      const updatedOrders = orders.map(o =>
        o.id === orderId ? { ...o, status: 'Completed' } : o
      );
      setOrders(updatedOrders);
      setExpandedId(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('[v0] Approve order error:', error);
      setMessage({
        type: 'error',
        text: `Failed to approve order: ${errorMessage}`,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      const response = await fetch('/api/admin/orders/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          action: 'reject',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || data.message || 'Failed to reject order';
        setMessage({
          type: 'error',
          text: errorMsg,
        });
        return;
      }

      setMessage({ type: 'success', text: 'Order rejected successfully' });

      // Update local orders list
      const updatedOrders = orders.map(o =>
        o.id === orderId ? { ...o, status: 'Rejected' } : o
      );
      setOrders(updatedOrders);
      setExpandedId(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('[v0] Reject order error:', error);
      setMessage({
        type: 'error',
        text: `Failed to reject order: ${errorMessage}`,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'Rejected':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'Payment Submitted':
      case 'Pending':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      default:
        return null;
    }
  };

  const formatAmount = (amount: any): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-400/10 border-green-400/30';
      case 'Rejected':
        return 'bg-red-400/10 border-red-400/30';
      case 'Payment Submitted':
      case 'Pending':
        return 'bg-yellow-400/10 border-yellow-400/30';
      default:
        return 'bg-white/5 border-white/10';
    }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4 max-w-6xl"
    >
      <motion.div variants={staggerItem}>
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-cyan-400" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Product Orders</h1>
            <p className="text-sm text-muted-foreground mt-1">Approve or reject pending product purchase orders</p>
          </div>
        </div>
      </motion.div>

      {message && (
        <motion.div
          variants={staggerItem}
          className={`p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-400/10 border-green-400/30 text-green-300'
              : 'bg-red-400/10 border-red-400/30 text-red-300'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-white/60">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <motion.div
          variants={staggerItem}
          className="p-6 bg-white/5 border border-white/10 rounded-lg text-center"
        >
          <p className="text-white/60">No pending orders found</p>
        </motion.div>
      ) : (
        <motion.div variants={staggerItem} className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className={`border rounded-lg overflow-hidden transition-all ${getStatusColor(order.status)}`}
            >
              <button
                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4 text-left flex-1">
                  {getStatusIcon(order.status)}
                  <div>
                    <p className="font-semibold text-foreground">{order.product_name}</p>
                    <p className="text-xs text-muted-foreground">{order.full_name || order.user_email}</p>
                  </div>
                  <div className="ml-auto mr-4 text-right">
                    <p className="font-bold text-foreground">${formatAmount(order.amount)}</p>
                    <p className="text-xs text-muted-foreground">{order.payment_method}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <p className="capitalize font-medium">{order.status}</p>
                    <p>{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${expandedId === order.id ? 'rotate-180' : ''}`}
                />
              </button>

              {expandedId === order.id && (
                <div className="p-4 border-t border-white/10 bg-white/[0.02] space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground">Product</p>
                      <p className="font-medium text-foreground">{order.product_name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Amount</p>
                      <p className="font-medium text-foreground">${formatAmount(order.amount)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Payment Method</p>
                      <p className="font-medium text-foreground">{order.payment_method}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Customer Name</p>
                      <p className="font-medium text-foreground">{order.full_name}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium text-foreground">{order.user_email}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Order Date</p>
                      <p className="font-medium text-foreground">{new Date(order.created_at).toLocaleString()}</p>
                    </div>
                  </div>

                  {(order.status === 'Payment Submitted' || order.status === 'Pending' || order.status === 'Pending Payment Review' || order.status === 'Pending Payment') && (
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleApprove(order.id)}
                        disabled={actionLoading === order.id}
                        className="flex-1 px-3 py-2 bg-green-400/20 text-green-400 border border-green-400/50 rounded hover:bg-green-400/30 disabled:opacity-50 transition-colors text-sm font-medium"
                      >
                        {actionLoading === order.id ? 'Processing...' : 'Approve Order'}
                      </button>
                      <button
                        onClick={() => handleReject(order.id)}
                        disabled={actionLoading === order.id}
                        className="flex-1 px-3 py-2 bg-red-400/20 text-red-400 border border-red-400/50 rounded hover:bg-red-400/30 disabled:opacity-50 transition-colors text-sm font-medium"
                      >
                        {actionLoading === order.id ? 'Processing...' : 'Reject Order'}
                      </button>
                    </div>
                  )}

                  {order.status === 'Completed' && (
                    <div className="pt-2 px-3 py-2 bg-green-400/10 border border-green-400/30 rounded text-sm text-green-300">
                      Order has been completed and customer notified
                    </div>
                  )}

                  {order.status === 'Rejected' && (
                    <div className="pt-2 px-3 py-2 bg-red-400/10 border border-red-400/30 rounded text-sm text-red-300">
                      Order has been rejected
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
