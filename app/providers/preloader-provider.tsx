'use client';

import { useEffect, useState } from 'react';
import { Preloader } from '@/components/preloader';

export function PreloaderProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Keep preloader visible for 35 seconds (30-40 second range)
    const preloaderTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 35000);

    return () => clearTimeout(preloaderTimeout);
  }, []);

  return (
    <>
      {isLoading && <Preloader />}
      {children}
    </>
  );
}
