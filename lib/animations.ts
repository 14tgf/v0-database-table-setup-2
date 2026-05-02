import { Variants } from 'framer-motion';

// Premium entrance animations
export const slideInFromLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: [0.34, 1.56, 0.64, 1],
    },
  },
};

export const slideInFromRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: [0.34, 1.56, 0.64, 1],
    },
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: 'easeOut',
    },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.34, 1.56, 0.64, 1],
    },
  },
};

// Staggered children animations
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

// Scroll-triggered reveal
export const revealOnScroll: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
    },
  },
};

// Magnetic button hover effect (uses translate on hover)
export const magneticButton = {
  initial: { x: 0, y: 0 },
  hover: {
    x: 0,
    y: -4,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  tap: {
    scale: 0.95,
  },
};

// Glow pulse animation for cards
export const glowPulse: Variants = {
  initial: { boxShadow: '0 0 20px rgba(0, 217, 255, 0.2)' },
  hover: {
    boxShadow: [
      '0 0 20px rgba(0, 217, 255, 0.2)',
      '0 0 40px rgba(0, 217, 255, 0.4)',
      '0 0 20px rgba(0, 217, 255, 0.2)',
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
    },
  },
};

// Floating motion for hero elements
export const float: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-8, 8, -8],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Parallax tilt effect
export const parallaxTilt = {
  initial: { rotateX: 0, rotateY: 0 },
  hover: {
    rotateX: -2,
    rotateY: 2,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

// Hero text stagger
export const textStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const textChar: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

// Shimmer effect for borders
export const shimmer: Variants = {
  initial: { backgroundPosition: '0% 0%' },
  animate: {
    backgroundPosition: '100% 0%',
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatType: 'reverse',
    },
  },
};

// Smooth page transition
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4, ease: 'easeOut' },
};
