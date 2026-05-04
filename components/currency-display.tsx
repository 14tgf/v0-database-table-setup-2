'use client';

import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';

interface CurrencyDisplayProps {
  amount: number;
  label?: string;
  className?: string;
}

export function CurrencyDisplay({ amount, label, className = '' }: CurrencyDisplayProps) {
  const { format, symbol } = useCurrencyFormatter();

  return (
    <div className={className}>
      {label && <p className="text-xs text-muted-foreground mb-1">{label}</p>}
      <p className="text-lg font-bold text-foreground">{format(amount)}</p>
    </div>
  );
}

export function CurrencySymbolDisplay({ className = '' }: { className?: string }) {
  const { symbol, currency } = useCurrencyFormatter();

  return (
    <span className={className}>
      {symbol}
    </span>
  );
}
