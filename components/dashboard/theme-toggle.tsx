'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Check initial theme on mount
  useEffect(() => {
    setIsMounted(true);
    const htmlElement = document.documentElement;
    const isDarkMode = htmlElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const htmlElement = document.documentElement;
    
    if (isDark) {
      // Switch to light mode
      htmlElement.classList.remove('dark');
      setIsDark(false);
      localStorage.setItem('theme', 'light');
    } else {
      // Switch to dark mode
      htmlElement.classList.add('dark');
      setIsDark(true);
      localStorage.setItem('theme', 'dark');
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-1.5 rounded-lg hover:bg-white/10 transition-all text-white/60 hover:text-white"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}
