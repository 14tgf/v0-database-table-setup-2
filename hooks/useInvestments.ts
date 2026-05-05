'use client';

import { useCallback } from 'react';
import useSWR from 'swr';
import { useAuth } from './useAuth';

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
});

export function useInvestments() {
  const { user } = useAuth();

  // Fetch investment plans
  const { data: plansData, isLoading: plansLoading, error: plansError } = useSWR(
    '/api/investments/plans',
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  const plans = plansData?.data || [];

  // Fetch user's investments
  const { data: investmentsData, isLoading: investmentsLoading, error: investmentsError, mutate: mutateInvestments } = useSWR(
    user?.id ? '/api/investments/user' : null,
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: true, dedupingInterval: 5000 }
  );

  const investments = investmentsData?.data?.investments || [];
  const totals = investmentsData?.data?.totals || {};

  // Create investment
  const createInvestment = useCallback(
    async (planId: string, amount: number) => {
      if (!user?.id) throw new Error('User not authenticated');

      try {
        const response = await fetch('/api/investments/invest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planId, amount }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create investment');
        }

        // Revalidate user investments
        await mutateInvestments();

        return data;
      } catch (error) {
        console.error('[v0] Create investment error:', error);
        throw error;
      }
    },
    [user?.id, mutateInvestments]
  );

  return {
    plans,
    plansLoading,
    plansError,
    investments,
    investmentsLoading,
    investmentsError,
    totals,
    createInvestment,
    mutateInvestments,
  };
}
