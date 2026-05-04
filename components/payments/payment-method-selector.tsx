'use client';

import { motion } from 'framer-motion';
import { Bitcoin, Banknote, Gift, Wallet } from 'lucide-react';

interface PaymentMethodSelectorProps {
  selected: string;
  onChange: (method: string) => void;
  methods: Array<{ id: string; label: string; description?: string }>;
}

export function PaymentMethodSelector({ selected, onChange, methods }: PaymentMethodSelectorProps) {
  const icons: Record<string, React.ReactNode> = {
    crypto: <Bitcoin className="w-5 h-5" />,
    paypal: <Wallet className="w-5 h-5" />,
    giftcard: <Gift className="w-5 h-5" />,
    bank: <Banknote className="w-5 h-5" />,
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-muted-foreground">Select Payment Method</label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {methods.map((method) => (
          <motion.button
            key={method.id}
            onClick={() => onChange(method.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-3 rounded-lg border-2 transition-all text-left ${
              selected === method.id
                ? 'border-accent bg-accent/10'
                : 'border-white/10 bg-white/5 hover:border-accent/50'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={selected === method.id ? 'text-accent' : 'text-white/60'}>{icons[method.id]}</span>
              <span className="text-xs font-semibold text-foreground">{method.label}</span>
            </div>
            {method.description && (
              <p className="text-xs text-muted-foreground">{method.description}</p>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
