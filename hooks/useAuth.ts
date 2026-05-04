'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthCredentials, AuthResponse, validateEmail, validatePassword } from '@/lib/auth';

interface UseAuthReturn {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  user: { id: string; email: string; fullName: string } | null;
  authenticate: (credentials: AuthCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  clearSuccess: () => void;
  checkSession: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string; fullName: string } | null>(null);

  // Check if user has valid session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/verify');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('[v0] Session check error:', error);
      setUser(null);
    }
  }, []);

  const authenticate = useCallback(async (credentials: AuthCredentials) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate input
      if (!validateEmail(credentials.email)) {
        setError('Please enter a valid email address');
        setIsLoading(false);
        return;
      }

      const passwordValidation = validatePassword(credentials.password);
      if (!passwordValidation.isValid) {
        setError(passwordValidation.errors[0]);
        setIsLoading(false);
        return;
      }

      // Determine if login or register based on fullName
      const endpoint = credentials.fullName ? '/api/auth/register' : '/api/auth/login';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data: AuthResponse = await response.json();

      if (!response.ok) {
        setError(data.message || 'Authentication failed');
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setUser(data.user || null);
      
      // Redirect to dashboard after brief delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('[v0] Auth error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('[v0] Logout error:', error);
    }
  }, [router]);

  const clearError = useCallback(() => setError(null), []);
  const clearSuccess = useCallback(() => setSuccess(false), []);

  return {
    isLoading,
    error,
    success,
    user,
    authenticate,
    logout,
    clearError,
    clearSuccess,
    checkSession,
  };
}

