'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Zap, Gauge, Battery } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  features: string[];
  range?: string;
  acceleration?: string;
  charging?: string;
}

interface ProductCardProps {
  product: Product;
  viewMode: 'grid' | 'list';
}

export function ProductCard({ product, viewMode }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={viewMode === 'list' ? 'flex gap-6' : ''}
    >
      <div className={`rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] overflow-hidden hover:border-accent/50 transition-all duration-300 group ${
        viewMode === 'list' ? 'flex flex-1' : 'flex flex-col'
      }`}>
        {/* Image Container */}
        <div className={`relative overflow-hidden bg-gradient-to-br from-accent/10 to-transparent ${
          viewMode === 'list' ? 'w-40 h-40 flex-shrink-0' : 'w-full h-48'
        }`}>
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-full h-full bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent flex items-center justify-center">
                  <div className="text-white/30 text-6xl">🚗</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className={`p-3 flex flex-col flex-1 ${viewMode === 'list' ? '' : ''}`}>
          <h3 className="text-base font-bold text-white mb-0.5">{product.name}</h3>
          <p className="text-xs text-white/60 mb-2">{product.description}</p>

          {/* Specs */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              {product.range && (
                <div className="rounded-lg bg-white/5 border border-white/10 p-1.5 text-center">
                  <div className="flex justify-center mb-0.5">
                    <Battery className="w-3 h-3 text-accent" />
                  </div>
                  <p className="text-xs text-white/60">{product.range}</p>
                </div>
              )}
              {product.acceleration && (
                <div className="rounded-lg bg-white/5 border border-white/10 p-1.5 text-center">
                  <div className="flex justify-center mb-0.5">
                    <Gauge className="w-3 h-3 text-accent" />
                  </div>
                  <p className="text-xs text-white/60">{product.acceleration}</p>
                </div>
              )}
              {product.charging && (
                <div className="rounded-lg bg-white/5 border border-white/10 p-1.5 text-center">
                  <div className="flex justify-center mb-0.5">
                    <Zap className="w-3 h-3 text-accent" />
                  </div>
                  <p className="text-xs text-white/60">{product.charging}</p>
                </div>
              )}
            </div>
          )}

          {viewMode === 'list' && (
            <div className="flex gap-3 mb-3 flex-wrap">
              {product.range && (
                <div className="flex items-center gap-1.5">
                  <Battery className="w-3 h-3 text-accent" />
                  <span className="text-xs text-white/60">{product.range}</span>
                </div>
              )}
              {product.acceleration && (
                <div className="flex items-center gap-1.5">
                  <Gauge className="w-3 h-3 text-accent" />
                  <span className="text-xs text-white/60">{product.acceleration}</span>
                </div>
              )}
              {product.charging && (
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-accent" />
                  <span className="text-xs text-white/60">{product.charging}</span>
                </div>
              )}
            </div>
          )}

          {/* Features */}
          <ul className={`mb-3 text-xs text-white/60 space-y-0.5 ${viewMode === 'list' ? 'hidden' : ''}`}>
            {product.features.slice(0, 2).map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="text-accent">•</span>
                {feature}
              </li>
            ))}
          </ul>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-auto">
            <div>
              <p className="text-xs text-white/60">From</p>
              <p className="text-lg font-bold text-white">${(product.price / 1000).toFixed(0)}K</p>
            </div>
            <Link href={`/inventory/${product.id}`} className="px-3 py-1.5 rounded-lg bg-accent/20 border border-accent/50 text-accent hover:bg-accent/30 transition-all text-xs font-semibold">
              Details
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
