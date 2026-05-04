'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export function Preloader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      {/* Outer pulsing glow effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{
            scale: [0.8, 1.3, 0.8],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute w-56 h-56 rounded-full bg-accent/30 blur-3xl"
        />
      </div>

      {/* Middle breathing glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.2,
          }}
          className="absolute w-48 h-48 rounded-full bg-accent/40 blur-2xl"
        />
      </div>

      {/* X Logo with very noticeable breathing effect */}
      <motion.div
        animate={{
          scale: [0.9, 1.15, 0.9],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative z-10 drop-shadow-[0_0_40px_rgba(0,217,255,0.8)]"
      >
        <Image
          src="/images/preloader-x.png"
          alt="Loading"
          width={120}
          height={120}
          priority
          className="w-40 h-40"
        />
      </motion.div>
    </div>
  );
}
