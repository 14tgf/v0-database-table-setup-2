'use client';

import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/animations';

export function PersonalInfoForm() {
  const fields = [
    { label: 'First Name', placeholder: 'Enter your first name', required: true },
    { label: 'Last Name', placeholder: 'Enter your last name', required: true },
    { label: 'Date of Birth', type: 'date', required: true },
    { label: 'Nationality', placeholder: 'Select your nationality', required: true },
    { label: 'Phone Number', type: 'tel', placeholder: '+1 (555) 000-0000', required: true },
    { label: 'Residential Address', placeholder: 'Enter your full address', required: true },
    { label: 'City', placeholder: 'Enter your city', required: true },
    { label: 'State / Province', placeholder: 'Enter your state or province', required: true },
    { label: 'Postal Code', placeholder: 'Enter your postal code', required: true },
    { label: 'Country', placeholder: 'Select your country', required: true },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 border border-white/10 rounded-lg p-4 backdrop-blur-sm"
    >
      <motion.h2 variants={staggerItem} className="text-base font-bold text-foreground mb-3">
        Personal Information
      </motion.h2>

      <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {fields.map((field, idx) => (
          <motion.div key={field.label} variants={staggerItem}>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              {field.label} {field.required && <span className="text-red-400">*</span>}
            </label>
            <input
              type={field.type || 'text'}
              placeholder={field.placeholder}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all text-xs"
            />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
