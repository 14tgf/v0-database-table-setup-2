import type { Metadata } from 'next'
import { AuthLayout } from '@/components/auth/auth-layout'

export const metadata: Metadata = {
  title: 'Sign In - X Holding',
  description: 'Secure access to your X Holding account. Sign in or create a new account.',
}

export default function AuthPage() {
  return <AuthLayout />
}
