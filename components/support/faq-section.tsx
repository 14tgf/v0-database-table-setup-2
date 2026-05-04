'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { FAQ_ITEMS } from '@/lib/support';

export function FAQSection() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFAQs = FAQ_ITEMS.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="bg-gradient-to-br from-secondary/40 via-secondary/30 to-background/50 border border-white/10 rounded-lg p-4 backdrop-blur-sm"
    >
      <motion.h2 variants={staggerItem} className="text-base font-bold text-foreground mb-3">
        Help Center / FAQ
      </motion.h2>

      {/* Search */}
      <motion.div variants={staggerItem} className="mb-3">
        <input
          type="text"
          placeholder="Search FAQs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/50 text-xs"
        />
      </motion.div>

      {/* FAQ Items */}
      <motion.div variants={staggerContainer} className="space-y-2">
        {filteredFAQs.length > 0 ? (
          filteredFAQs.map((faq) => (
            <motion.div
              key={faq.id}
              variants={staggerItem}
              className="border border-white/10 rounded-lg overflow-hidden hover:border-white/20 transition-colors"
            >
              <button
                onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 transition-colors text-left"
              >
                <div className="flex-1">
                  <p className="text-xs font-semibold text-foreground">{faq.question}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{faq.category}</p>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${
                    expandedId === faq.id ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {expandedId === faq.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-3 py-2.5 bg-white/5 border-t border-white/10 text-xs text-muted-foreground"
                >
                  {faq.answer}
                </motion.div>
              )}
            </motion.div>
          ))
        ) : (
          <motion.div variants={staggerItem} className="text-center py-4">
            <p className="text-xs text-muted-foreground">No FAQs found. Try a different search.</p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
