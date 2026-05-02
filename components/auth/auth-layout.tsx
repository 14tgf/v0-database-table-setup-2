'use client';

import { motion } from 'framer-motion';
import { AuthForm } from './auth-form';

export function AuthLayout() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const leftVariants = {
    hidden: { opacity: 0, x: -40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const rightVariants = {
    hidden: { opacity: 0, x: 40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative grid min-h-screen grid-cols-1 lg:grid-cols-2"
    >
      {/* Left Side - Branding */}
      <motion.div
        variants={leftVariants}
        className="relative hidden flex-col justify-between bg-gradient-to-br from-black via-accent/10 to-black p-8 lg:flex overflow-hidden"
      >
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Glow orbs */}
          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-accent/20 blur-3xl"
          />
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
            className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 space-y-6">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <h1 className="text-5xl font-bold text-white leading-tight text-balance">
              Welcome to <span className="text-transparent bg-gradient-to-r from-accent to-cyan-400 bg-clip-text">X Holding</span>
            </h1>
          </motion.div>

          <p className="text-lg text-white/70 max-w-md leading-relaxed">
            Join our premium marketplace for exclusive vehicles, energy systems, and cutting-edge robotics technology.
          </p>

          {/* Market Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="rounded-lg border border-accent/30 bg-accent/10 p-4 backdrop-blur-xl"
            >
              <p className="text-xs text-white/60 font-medium">Live Market</p>
              <p className="text-2xl font-bold text-accent mt-1">
                $<span className="font-mono">192.48</span>
              </p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 p-4 backdrop-blur-xl"
            >
              <p className="text-xs text-white/60 font-medium">Active Users</p>
              <p className="text-2xl font-bold text-cyan-400 mt-1">
                <span className="font-mono">47.2K</span>
              </p>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <motion.div variants={leftVariants} className="relative z-10 space-y-2 text-xs text-white/50">
          <p>Secure • Verified • Premium</p>
          <p>© 2026 X Holding. All rights reserved.</p>
        </motion.div>
      </motion.div>

      {/* Right Side - Auth Card */}
      <motion.div
        variants={rightVariants}
        className="flex items-center justify-center p-6 lg:p-8"
      >
        <div className="relative w-full max-w-sm">
          {/* Card Glow */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-accent to-cyan-400 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-20" />

          {/* Card */}
          <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur-xl">
            {/* Header */}
            <div className="mb-6 space-y-2 text-center">
              <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
              <p className="text-sm text-white/60">Secure access to your X Holding account</p>
            </div>

            {/* Auth Form */}
            <AuthForm />
          </div>

          {/* Security Badge */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="mt-4 flex items-center justify-center gap-2 text-xs text-white/50"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
            </svg>
            <span>Enterprise-grade security</span>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
