'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export function Preloader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      {/* Glow effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute w-40 h-40 rounded-full bg-accent/20 blur-2xl"
        />
      </div>

      {/* X Logo with breathing effect */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative z-10 drop-shadow-[0_0_20px_rgba(0,217,255,0.4)]"
      >
        <Image
          src="/images/preloader-x.png"
          alt="Loading"
          width={120}
          height={120}
          priority
          className="w-32 h-32"
        />
      </motion.div>
    </div>
  );
}
