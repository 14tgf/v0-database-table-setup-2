'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Mail, Github, Linkedin, Twitter } from 'lucide-react';
import { staggerContainer, staggerItem, fadeInUp } from '@/lib/animations';

export function PremiumFooter() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Markets: ['Market', 'News', 'Analysis'],
    Inventory: ['Vehicles', 'Energy', 'Robotics'],
    Company: ['About', 'Blog', 'Careers'],
    Support: ['Contact', 'FAQ', 'Documentation'],
  };

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Github, href: '#', label: 'GitHub' },
  ];

  return (
    <footer className="relative border-t border-border/50 bg-background">
      {/* Top glow divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 py-16">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12"
        >
          {/* Brand Column */}
          <motion.div variants={staggerItem} className="lg:col-span-1 space-y-4">
            <h3 className="text-xl font-bold text-white">X Holding</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Powering the future of sustainable wealth, energy, and innovation through next-generation fintech.
            </p>
            {/* Newsletter Signup */}
            <div className="pt-4 space-y-2">
              <label className="text-xs font-semibold text-muted-foreground block">Subscribe to updates</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 px-3 py-2 bg-secondary/50 border border-border/50 rounded-lg text-sm placeholder-muted-foreground focus:outline-none focus:border-accent transition-colors"
                />
                <button className="px-3 py-2 bg-accent text-background font-semibold rounded-lg hover:shadow-lg hover:shadow-accent/50 transition-all duration-300">
                  <Mail className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Footer Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <motion.div key={category} variants={staggerItem} className="space-y-4">
              <h4 className="font-semibold text-white text-sm uppercase tracking-wider">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-muted-foreground hover:text-accent transition-colors duration-300 relative group"
                    >
                      {link}
                      <span className="absolute bottom-0 left-0 w-0 h-px bg-accent group-hover:w-full transition-all duration-300" />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Divider */}
        <div className="border-t border-border/50 my-8" />

        {/* Bottom Section */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-center gap-6"
        >
          {/* Copyright and Legal */}
          <motion.div variants={staggerItem} className="flex flex-col md:flex-row items-center gap-4 text-xs text-muted-foreground">
            <span>&copy; {currentYear} X Holding. All rights reserved.</span>
            <div className="flex gap-4">
              <Link href="#" className="hover:text-accent transition-colors duration-300">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-accent transition-colors duration-300">
                Terms of Service
              </Link>
              <Link href="#" className="hover:text-accent transition-colors duration-300">
                Cookie Settings
              </Link>
            </div>
          </motion.div>

          {/* Social Icons */}
          <motion.div variants={staggerItem} className="flex gap-6">
            {socialLinks.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="relative group"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="p-2 text-muted-foreground hover:text-accent transition-colors duration-300 relative"
                >
                  <social.icon className="w-5 h-5" />
                  {/* Hover glow */}
                  <div className="absolute inset-0 bg-accent/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                </motion.div>
              </Link>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
}
