'use client';

import { useState, useEffect } from 'react';
import { PaymentMethodsData, getPaymentMethods } from '@/lib/payment-config';

export function usePaymentConfig() {
  const [paymentConfig, setPaymentConfig] = useState<PaymentMethodsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setIsLoading(true);
        const config = await getPaymentMethods();
        setPaymentConfig(config);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load payment config'));
        console.error('[v0] Error fetching payment config:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return { paymentConfig, isLoading, error };
}
