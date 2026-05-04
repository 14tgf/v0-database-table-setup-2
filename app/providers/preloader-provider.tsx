'use client';

import { useEffect, useState } from 'react';
import { Preloader } from '@/components/preloader';

export function PreloaderProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Hide preloader once page has loaded
    const handleLoad = () => {
      setIsLoading(false);
    };

    if (document.readyState === 'complete') {
      setIsLoading(false);
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  return (
    <>
      {isLoading && <Preloader />}
      {children}
    </>
  );
}
