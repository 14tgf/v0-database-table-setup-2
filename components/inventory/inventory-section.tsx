'use client';

import { motion } from 'framer-motion';
import { InventoryCard, InventoryItem } from './inventory-card';

const INVENTORY_ITEMS: InventoryItem[] = [
  {
    id: 'model-x',
    name: 'Tesla Model X',
    category: 'Cars',
    description: 'Premium electric SUV with Falcon Wing doors and 7-seater capacity',
    price: 95000,
    availability: 'In Stock',
    image: '/model-x.jpg',
  },
  {
    id: 'model-s',
    name: 'Tesla Model S',
    category: 'Cars',
    description: 'High-performance sedan with up to 500+ mile range',
    price: 75000,
    availability: 'In Stock',
    image: '/model-s.jpg',
  },
  {
    id: 'cybertruck',
    name: 'Tesla Cybertruck',
    category: 'Cars',
    description: 'Futuristic electric truck with exoskeleton design',
    price: 60000,
    availability: 'Limited',
    image: '/cybertruck.jpg',
  },
  {
    id: 'powerwall',
    name: 'Solar Powerwall',
    category: 'Energy',
    description: 'Home battery system for energy independence and backup power',
    price: 12000,
    availability: 'In Stock',
    image: '/powerwall.jpg',
  },
  {
    id: 'solar-panels',
    name: 'Solar Panels System',
    category: 'Energy',
    description: 'Complete rooftop solar installation with monitoring system',
    price: 28000,
    availability: 'In Stock',
    image: '/solar-panels.jpg',
  },
  {
    id: 'optimus',
    name: 'Optimus AI Robot',
    category: 'Robotics',
    description: 'Advanced humanoid robot for household and commercial use',
    price: 150000,
    availability: 'Limited',
    image: '/optimus.jpg',
  },
];

export function InventorySection() {
  return (
    <section className="space-y-6 py-8">
      {/* Header with View Inventory Link */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true, margin: '-100px' }}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
      >
        <div className="space-y-3 flex-1">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Featured <span className="text-accent">Inventory</span>
          </h2>
          <p className="text-base text-white/60 max-w-2xl">
            Explore our premium selection of Tesla vehicles, energy solutions, and next-generation robotics products.
          </p>
        </div>
        <motion.a
          href="/inventory"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          viewport={{ once: true, margin: '-100px' }}
          className="group flex items-center gap-2 text-accent font-semibold hover:gap-3 transition-all duration-300 whitespace-nowrap"
        >
          View Inventory
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </motion.a>
      </motion.div>

      {/* Inventory Grid */}
      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.05,
            },
          },
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        {INVENTORY_ITEMS.map((item, index) => (
          <InventoryCard key={item.id} item={item} index={index} />
        ))}
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        viewport={{ once: true, margin: '-100px' }}
        className="mt-8 p-6 rounded-xl border border-accent/30 bg-gradient-to-r from-accent/20 via-accent/10 to-transparent text-center"
      >
        <h3 className="text-lg font-bold text-white mb-2">Browse Full Inventory</h3>
        <p className="text-white/60 mb-4 text-sm">Access our complete product catalog with advanced filtering and purchasing options</p>
        <a
          href="/inventory"
          className="inline-block px-6 py-2 bg-accent text-accent-foreground font-semibold rounded-lg hover:shadow-lg hover:shadow-accent/50 transition-all duration-300 transform hover:scale-105 text-sm"
        >
          View All Products
        </a>
      </motion.div>
    </section>
  );
}
