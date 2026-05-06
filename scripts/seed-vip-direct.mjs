#!/usr/bin/env node

import { sql } from '/vercel/share/v0-project/lib/db.ts';

const VIP_TIERS = [
  {
    name: 'Bronze',
    tier_level: 1,
    price: 99.00,
    duration_days: 366,
    description: 'Essential VIP benefits for new members',
    benefits: [
      '3.00% off car purchases',
      '1.00% investment bonus',
      'Priority email support',
      'Exclusive member newsletter',
      'Early access to new inventory',
    ],
  },
  {
    name: 'Silver',
    tier_level: 2,
    price: 249.00,
    duration_days: 366,
    description: 'Enhanced benefits with greater rewards',
    benefits: [
      '5.00% off car purchases',
      '2.00% investment bonus',
      '2x giveaway entries',
      'Priority customer support',
      'All Bronze benefits',
    ],
  },
  {
    name: 'Private Access',
    tier_level: 3,
    price: 499.00,
    duration_days: 366,
    description: 'Premium tier with exclusive access',
    benefits: [
      '8.00% off car purchases',
      '5.00% investment bonus',
      'Personal account manager',
      '5x giveaway entries',
      'Private member-only events',
      'All Silver benefits',
    ],
  },
  {
    name: 'Platinum',
    tier_level: 4,
    price: 999.00,
    duration_days: 366,
    description: 'Ultimate VIP experience with all premium benefits',
    benefits: [
      '10.00% off car purchases',
      '10.00% investment bonus',
      'Dedicated 24/7 concierge service',
      'Unlimited giveaway entries',
      'Invitations to exclusive platinum events',
      'Custom benefits negotiation',
      'All Private Access benefits',
    ],
  },
];

async function seed() {
  try {
    console.log('[v0] Starting VIP seeding...');
    
    // First verify the table exists
    console.log('[v0] Checking if vip_plans table exists...');
    try {
      const tableCheck = await sql`SELECT COUNT(*) FROM vip_plans LIMIT 1`;
      console.log('[v0] Table exists, current count:', tableCheck);
    } catch (err) {
      console.error('[v0] Table check failed:', err.message);
      throw new Error('vip_plans table does not exist. Run schema initialization first.');
    }

    // Delete existing plans
    console.log('[v0] Clearing existing plans...');
    await sql`DELETE FROM vip_plans`;
    console.log('[v0] Cleared existing plans');

    // Insert each tier
    for (const tier of VIP_TIERS) {
      console.log(`[v0] Inserting ${tier.name}...`);
      
      const result = await sql`
        INSERT INTO vip_plans (
          name,
          tier_level,
          description,
          benefits,
          price,
          duration_days,
          active
        )
        VALUES (
          ${tier.name},
          ${tier.tier_level},
          ${tier.description},
          ${tier.benefits},
          ${tier.price},
          ${tier.duration_days},
          true
        )
        RETURNING id, name, tier_level, active
      `;
      
      console.log(`[v0] Successfully inserted:`, result[0]);
    }

    // Verify all were inserted
    const finalCheck = await sql`SELECT id, name, tier_level, active FROM vip_plans ORDER BY tier_level`;
    console.log('[v0] Final verification - Plans in DB:', finalCheck.length);
    finalCheck.forEach(plan => {
      console.log(`  - ${plan.name} (Tier ${plan.tier_level}) - Active: ${plan.active}`);
    });

    console.log('[v0] ✓ VIP seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[v0] ✗ Seeding failed:', error.message);
    process.exit(1);
  }
}

seed();
