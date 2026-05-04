'use client';

import { motion } from 'framer-motion';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';

interface CheckoutSummaryProps {
  productName: string;
  productPrice: number;
  quantity?: number;
  fees?: number;
}

export function CheckoutSummary({ productName, productPrice, quantity = 1, fees = 0 }: CheckoutSummaryProps) {
  const { format } = useCurrencyFormatter();
  const subtotal = productPrice * quantity;
  const total = subtotal + fees;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-lg"
    >
      <h3 className="text-sm font-bold text-foreground mb-3">Order Summary</h3>

      <div className="space-y-2 mb-3 pb-3 border-b border-white/10">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{productName}</span>
          <span>x{quantity}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-semibold text-foreground">{format(subtotal)}</span>
        </div>
      </div>

      {fees > 0 && (
        <div className="mb-3 pb-3 border-b border-white/10">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Processing Fee</span>
            <span className="font-semibold text-foreground">{format(fees)}</span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-foreground">Total</span>
        <span className="text-lg font-bold text-accent">{format(total)}</span>
      </div>
    </motion.div>
  );
}
