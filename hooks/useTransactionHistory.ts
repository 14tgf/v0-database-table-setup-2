'use client';

import useSWR from 'swr';

export interface Transaction {
  id: string;
  user_id: string;
  transaction_type: string;
  amount: number;
  old_balance: number;
  new_balance: number;
  description: string;
  related_id: string;
  related_type: string;
  created_at: string;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch transactions');
  }
  return res.json();
};

export function useTransactionHistory() {
  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; transactions: Transaction[] }>(
    '/api/user/transactions',
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  return {
    transactions: data?.transactions || [],
    isLoading,
    error: error ? error.message : null,
    mutate,
  };
}
