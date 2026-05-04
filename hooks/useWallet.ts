'use client';

import { useState, useEffect } from 'react';
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
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch wallet data');
  }
  return res.json();
};

export function useWallet() {
  const { data, error, isLoading } = useSWR<{ success: boolean; data: WalletData }>(
    '/api/user/wallet',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    wallet: data?.data || null,
    isLoading,
    error: error ? error.message : null,
  };
}
