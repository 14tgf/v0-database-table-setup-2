'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Cars' | 'Energy' | 'Robotics';
  description: string;
  price?: number;
  availability: 'In Stock' | 'Limited';
  image: string;
}

interface InventoryCardProps {
  item: InventoryItem;
  index: number;
}

export function InventoryCard({ item, index }: InventoryCardProps) {
  const categoryColors: Record<string, string> = {
    Cars: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    Energy: 'bg-green-500/20 text-green-300 border-green-500/30',
    Robotics: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  };

  const availabilityColors: Record<string, string> = {
    'In Stock': 'bg-green-500/20 text-green-300 border-green-500/30',
    Limited: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      viewport={{ once: true, margin: '-100px' }}
      className="group relative h-full"
    >
      <div className="relative h-full flex flex-col rounded-xl border border-white/10 bg-gradient-to-b from-white/10 via-white/5 to-transparent backdrop-blur-xl overflow-hidden hover:border-accent/50 transition-all duration-300 glow-white-hover">
        {/* Hover glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/10 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Product Image */}
        <div className="relative h-64 overflow-hidden bg-gradient-to-b from-secondary/50 to-secondary/20">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="relative flex flex-col flex-1 p-4 space-y-3">
          {/* Category Badge */}
          <div className="flex gap-2">
            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded border ${categoryColors[item.category]}`}>
              {item.category}
            </span>
            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded border ml-auto ${availabilityColors[item.availability]}`}>
              {item.availability}
            </span>
          </div>

          {/* Product Name */}
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-accent transition-colors duration-300">
              {item.name}
            </h3>
            <p className="text-sm text-white/60 mt-1 line-clamp-2">
              {item.description}
            </p>
          </div>

          {/* Price and Button */}
          <div className="flex items-end justify-between mt-auto pt-2 border-t border-white/10">
            {item.price && (
              <div className="flex flex-col">
                <span className="text-xs text-white/50">Starting at</span>
                <span className="text-xl font-bold text-accent">${item.price.toLocaleString()}</span>
              </div>
            )}
            <Link
              href="/inventory"
              className="ml-auto px-4 py-2 bg-accent/20 border border-accent/50 text-accent font-semibold rounded-lg hover:bg-accent/30 hover:border-accent transition-all duration-300 transform hover:scale-105 text-sm whitespace-nowrap"
            >
              Order Now
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
