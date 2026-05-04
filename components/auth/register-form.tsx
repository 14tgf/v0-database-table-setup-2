'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { SocialLogin } from './social-login';

export function RegisterForm() {
  const { isLoading, error, success, authenticate, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    clearError();
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    }

    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    await authenticate({
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
    });
  };

  const formVariants = {
    hidden: { opacity: 0, x: 40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const inputVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.4 },
    }),
  };

  return (
    <motion.form
      variants={formVariants}
      initial="hidden"
      animate="visible"
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <h1 className="text-3xl font-bold text-white mb-6">Create Account</h1>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-400"
        >
          {error}
        </motion.div>
      )}

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-green-500/50 bg-green-500/10 px-3 py-2 text-sm text-green-400"
        >
          Registration successful! Redirecting...
        </motion.div>
      )}

      {/* Full Name */}
      <motion.div custom={0} variants={inputVariants} initial="hidden" animate="visible">
        <label htmlFor="fullName" className="block text-xs font-medium text-white/80 mb-1.5">
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleInputChange}
          placeholder="John Doe"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 backdrop-blur-xl transition-all focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
        />
        {validationErrors.fullName && (
          <p className="mt-1 text-xs text-red-400">{validationErrors.fullName}</p>
        )}
      </motion.div>

      {/* Email */}
      <motion.div custom={1} variants={inputVariants} initial="hidden" animate="visible">
        <label htmlFor="email" className="block text-xs font-medium text-white/80 mb-1.5">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="you@example.com"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 backdrop-blur-xl transition-all focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
        />
        {validationErrors.email && (
          <p className="mt-1 text-xs text-red-400">{validationErrors.email}</p>
        )}
      </motion.div>

      {/* Password */}
      <motion.div custom={2} variants={inputVariants} initial="hidden" animate="visible">
        <label htmlFor="password" className="block text-xs font-medium text-white/80 mb-1.5">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="••••••••"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 pr-10 text-sm text-white placeholder-white/40 backdrop-blur-xl transition-all focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {validationErrors.password && (
          <p className="mt-1 text-xs text-red-400">{validationErrors.password}</p>
        )}
      </motion.div>

      {/* Confirm Password */}
      <motion.div custom={3} variants={inputVariants} initial="hidden" animate="visible">
        <label htmlFor="confirmPassword" className="block text-xs font-medium text-white/80 mb-1.5">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type={showPassword ? 'text' : 'password'}
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          placeholder="••••••••"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 backdrop-blur-xl transition-all focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
        />
        {validationErrors.confirmPassword && (
          <p className="mt-1 text-xs text-red-400">{validationErrors.confirmPassword}</p>
        )}
      </motion.div>

      {/* Submit Button */}
      <motion.button
        custom={4}
        variants={inputVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-gradient-to-r from-accent to-cyan-400 px-4 py-2.5 font-semibold text-background transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-accent/50 flex items-center justify-center gap-2 text-sm"
      >
        {isLoading ? (
          <>
            <Loader size={16} className="animate-spin" />
            Processing...
          </>
        ) : (
          'Create Account'
        )}
      </motion.button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-2 text-white/60">Continue with</span>
        </div>
      </div>

      {/* Social Login */}
      <SocialLogin />

      {/* Footer Links */}
      <p className="text-center text-xs text-white/60">
        Already have an account?{' '}
        <a
          href="/login"
          className="text-accent hover:text-accent/80 transition-colors"
        >
          Sign in
        </a>
      </p>
    </motion.form>
  );
}
