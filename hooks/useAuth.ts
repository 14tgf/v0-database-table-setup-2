'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthCredentials, AuthResponse, authenticateUser } from '@/lib/auth';

interface UseAuthReturn {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  authenticate: (credentials: AuthCredentials) => Promise<void>;
  clearError: () => void;
  clearSuccess: () => void;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const authenticate = async (credentials: AuthCredentials) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response: AuthResponse = await authenticateUser(credentials);

      if (response.success) {
        setSuccess(true);
        // Store token in localStorage (or use secure cookie in production)
        if (response.token) {
          localStorage.setItem('authToken', response.token);
        }
        // Redirect to dashboard after 1 second to show success message
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('[v0] Auth error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(false);

  return {
    isLoading,
    error,
    success,
    authenticate,
    clearError,
    clearSuccess,
  };
}
