'use client';

import { useEffect, useState } from 'react';
import { Preloader } from '@/components/preloader';

export function PreloaderProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Keep preloader visible for 4.5 seconds (3-6 second range)
    const preloaderTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 4500);

    return () => clearTimeout(preloaderTimeout);
  }, []);

  return (
    <>
      {isLoading && <Preloader />}
      {children}
    </>
  );
}
