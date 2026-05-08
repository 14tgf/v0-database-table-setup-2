'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'James Mitchell',
    location: 'London, United Kingdom',
    role: 'Investment Manager',
    content: 'X-Holding transformed how I trade Tesla products. The platform is incredibly intuitive and the security features give me peace of mind.',
    rating: 5,
  },
  {
    name: 'Sarah Johnson',
    location: 'New York, United States',
    role: 'Tech Entrepreneur',
    content: 'Finally, a marketplace I can trust. The real-time pricing and instant settlement have saved me thousands in trading costs.',
    rating: 5,
  },
  {
    name: 'David Richardson',
    location: 'Manchester, United Kingdom',
    role: 'Energy Consultant',
    content: 'The Powerwall and Solar integration on X-Holding is seamless. I\'ve completed more transactions here than any other platform.',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    location: 'California, United States',
    role: 'Business Owner',
    content: 'Outstanding customer service and lightning-fast transactions. X-Holding is my go-to marketplace for Tesla products.',
    rating: 5,
  },
  {
    name: 'Michael Thompson',
    location: 'Edinburgh, United Kingdom',
    role: 'Financial Advisor',
    content: 'The VIP membership program is exceptional. The benefits and dedicated support have exceeded all my expectations.',
    rating: 5,
  },
  {
    name: 'Jessica Chen',
    location: 'Texas, United States',
    role: 'Property Developer',
    content: 'Trading on X-Holding is smooth and efficient. Their zero-friction approach has made me a regular customer.',
    rating: 5,
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

export function TestimonialsSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5 }}
      className="my-16 space-y-8"
    >
      {/* Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-4xl font-bold text-white"
        >
          Trusted by Traders Worldwide
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="text-muted-foreground"
        >
          Join thousands of satisfied users from the UK, US, and beyond
        </motion.p>
      </div>

      {/* Testimonials Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="group bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6 hover:border-accent/30 hover:bg-white/[0.08] transition-all duration-300 backdrop-blur-sm"
          >
            {/* Star Rating */}
            <div className="flex gap-1 mb-4">
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>

            {/* Quote */}
            <p className="text-sm text-foreground mb-6 leading-relaxed">
              &quot;{testimonial.content}&quot;
            </p>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />

            {/* Author Info */}
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                {testimonial.name}
              </h3>
              <p className="text-xs text-muted-foreground">{testimonial.role}</p>
              <p className="text-xs text-accent">{testimonial.location}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Stats Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-white/10"
      >
        {[
          { number: '50K+', label: 'Active Users' },
          { number: '2.4B', label: 'Trading Volume' },
          { number: '99.9%', label: 'Customer Satisfaction' },
        ].map((stat, index) => (
          <div key={index} className="text-center space-y-2">
            <div className="text-3xl font-bold text-accent">{stat.number}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </motion.div>
    </motion.section>
  )
}
