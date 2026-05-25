'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Car, ShoppingBag, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface Order {
  id: string;
  product_name: string;
  quantity: number;
  amount?: number;
  total_amount?: number;
  status: string;
  created_at: string;
  payment_method?: string;
}

export function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/orders/list');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch orders: ${response.status}`);
        }

        const data = await response.json();
        setOrders(data.orders || []);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load orders';
        console.error('[v0] Recent Orders - Error:', errorMsg);
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusIcon = (status: string) => {
    const lowerStatus = status?.toLowerCase() || '';
    if (lowerStatus.includes('completed') || lowerStatus.includes('delivered') || lowerStatus.includes('approved')) {
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    } else if (lowerStatus.includes('pending') || lowerStatus.includes('processing')) {
      return <Clock className="w-4 h-4 text-yellow-400" />;
    } else if (lowerStatus.includes('failed') || lowerStatus.includes('cancelled') || lowerStatus.includes('rejected')) {
      return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
    return <ShoppingBag className="w-4 h-4 text-accent" />;
  };

  const getStatusColor = (status: string) => {
    const lowerStatus = status?.toLowerCase() || '';
    if (lowerStatus.includes('completed') || lowerStatus.includes('delivered') || lowerStatus.includes('approved')) {
      return 'text-green-400 bg-green-400/10';
    } else if (lowerStatus.includes('pending') || lowerStatus.includes('processing')) {
      return 'text-yellow-400 bg-yellow-400/10';
    } else if (lowerStatus.includes('failed') || lowerStatus.includes('cancelled') || lowerStatus.includes('rejected')) {
      return 'text-red-400 bg-red-400/10';
    }
    return 'text-accent bg-accent/10';
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return 'N/A';
    return `$${parseFloat(String(price)).toFixed(2)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="col-span-1 md:col-span-2"
    >
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Recent Orders</h2>
            <p className="text-sm text-white/60">Your latest purchases</p>
          </div>
          <a href="/dashboard/orders" className="text-accent text-sm font-semibold hover:underline">
            View All →
          </a>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-4">
              <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
            <p className="text-white/60 text-sm">Loading your orders...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-400/10 border border-red-400/20 mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-block px-6 py-2 bg-accent/20 border border-accent/50 text-accent font-semibold rounded-lg hover:bg-accent/30 transition-all duration-300 text-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && orders.length === 0 && (
          <div className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-4">
              <Car className="w-8 h-8 text-white/40" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No orders yet</h3>
            <p className="text-white/60 text-sm mb-6">
              Start browsing our collection of products and make your first purchase.
            </p>
            <a
              href="/inventory"
              className="inline-block px-6 py-2 bg-accent/20 border border-accent/50 text-accent font-semibold rounded-lg hover:bg-accent/30 transition-all duration-300 text-sm"
            >
              Browse Inventory
            </a>
          </div>
        )}

        {/* Orders List */}
        {!isLoading && !error && orders.length > 0 && (
          <div className="space-y-3">
            {orders.slice(0, 5).map((order, index) => {
              const orderAmount = order.amount || order.total_amount || 0;
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/8 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{order.product_name}</p>
                      <p className="text-xs text-white/50">Qty: {order.quantity} • {formatDate(order.created_at)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">{formatPrice(orderAmount)}</p>
                      <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span>{order.status || 'Pending'}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
