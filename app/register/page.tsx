import type { Metadata } from 'next'
import { AuthLayout } from '@/components/auth/auth-layout'
import { RegisterForm } from '@/components/auth/register-form'

export const metadata: Metadata = {
  title: 'Create Account - X Holding',
  description: 'Create a new X Holding account to get started.',
}

export default function RegisterPage() {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  )
}
