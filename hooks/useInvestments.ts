'use client';

import { useCallback, useEffect } from 'react';
import useSWR from 'swr';
import { useAuth } from './useAuth';

const fetcher = (url: string) => {
  console.log('[v0] useInvestments - Fetching from:', url);
  return fetch(url).then(res => {
    console.log('[v0] useInvestments - Response status:', res.status);
    if (!res.ok) {
      console.error('[v0] useInvestments - Response not OK:', res.statusText);
      throw new Error('Failed to fetch');
    }
    return res.json();
  }).catch(err => {
    console.error('[v0] useInvestments - Fetch error:', err);
    throw err;
  });
};

export function useInvestments() {
  const { user } = useAuth();

  console.log('[v0] useInvestments - Hook initialized, user:', user?.id);

  // Fetch investment plans
  const { data: plansData, isLoading: plansLoading, error: plansError } = useSWR(
    '/api/investments/plans',
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  useEffect(() => {
    if (plansData) {
      console.log('[v0] useInvestments - Plans data received:', plansData);
    }
    if (plansError) {
      console.error('[v0] useInvestments - Plans error:', plansError);
    }
  }, [plansData, plansError]);

  const plans = plansData?.data || [];

  // Fetch user's investments
  const { data: investmentsData, isLoading: investmentsLoading, error: investmentsError, mutate: mutateInvestments } = useSWR(
    user?.id ? '/api/investments/user' : null,
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: true, dedupingInterval: 5000 }
  );

  useEffect(() => {
    if (investmentsData) {
      console.log('[v0] useInvestments - User investments data received:', investmentsData);
      console.log('[v0] useInvestments - Investments count:', investmentsData?.data?.investments?.length || 0);
    }
    if (investmentsError) {
      console.error('[v0] useInvestments - Investments error:', investmentsError);
    }
    if (investmentsLoading) {
      console.log('[v0] useInvestments - Loading user investments...');
    }
  }, [investmentsData, investmentsError, investmentsLoading]);

  const investments = investmentsData?.data?.investments || [];
  const totals = investmentsData?.data?.totals || {};

  console.log('[v0] useInvestments - Parsed investments:', investments.length, 'Totals:', totals);

  // Create investment
  const createInvestment = useCallback(
    async (planId: string, amount: number) => {
      if (!user?.id) throw new Error('User not authenticated');

      try {
        console.log('[v0] useInvestments - Creating investment:', { planId, amount });
        const response = await fetch('/api/investments/invest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planId, amount }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error('[v0] useInvestments - Create investment error:', data);
          throw new Error(data.error || 'Failed to create investment');
        }

        console.log('[v0] useInvestments - Investment created successfully:', data);
        // Revalidate user investments
        await mutateInvestments();

        return data;
      } catch (error) {
        console.error('[v0] useInvestments - Create investment error:', error);
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
