'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Preloader } from '@/components/preloader';

interface PreloaderContextType {
  isLoading: boolean;
}

const PreloaderContext = createContext<PreloaderContextType | undefined>(undefined);

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
    <PreloaderContext.Provider value={{ isLoading }}>
      {isLoading && <Preloader />}
      {children}
    </PreloaderContext.Provider>
  );
}

export function usePreloader() {
  const context = useContext(PreloaderContext);
  if (context === undefined) {
    return { isLoading: false };
  }
  return context;
}
