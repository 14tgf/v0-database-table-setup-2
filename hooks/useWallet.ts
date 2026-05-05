'use client';

import useSWR from 'swr';

interface WalletData {
  userId: string;
  balance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalInvested: number;
  currency: string;
  portfolioValue: number;
  investmentCount: number;
  stockHoldings: number;
  teslaVehicles: number;
}

const fetcher = async (url: string) => {
  console.log('[v0] Wallet Fetcher - Fetching:', url);
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error('[v0] Wallet Fetcher - Error:', res.status);
      throw new Error('Failed to fetch wallet data');
    }
    const data = await res.json();
    console.log('[v0] Wallet Fetcher - Success:', {
      balance: data?.data?.balance,
      stockHoldings: data?.data?.stockHoldings,
      timestamp: new Date().toISOString(),
    });
    return data;
  } catch (error) {
    console.error('[v0] Wallet Fetcher - Exception:', error);
    throw error;
  }
};

export function useWallet() {
  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: WalletData }>(
    '/api/user/wallet',
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 0,
      focusThrottleInterval: 30000,
    }
  );

  const refreshWallet = async () => {
    console.log('[v0] refreshWallet - Called, forcing revalidation');
    return await mutate(undefined, { revalidate: true });
  };

  return {
    wallet: data?.data || null,
    isLoading,
    error: error ? error.message : null,
    refreshWallet,
    mutate,
  };
}
